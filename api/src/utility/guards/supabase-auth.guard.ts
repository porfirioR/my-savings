import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ALLOWED_EMAIL } from '../constants/environment.const';
import { DbContextService } from '../../access/data/services';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly dbContext: DbContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Azure Static Web Apps clobbers `Authorization` with its own token when it
    // proxies to the Functions backend, so the Supabase token comes in on a
    // custom header. Fall back to `Authorization` for local dev.
    const customToken: string | undefined = request.headers['x-sb-token'];
    const authHeader: string | undefined = request.headers['authorization'];
    const token =
      (typeof customToken === 'string' && customToken.length > 0 ? customToken : undefined) ??
      (authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined);

    // --- DEBUG TEMPORAL: el motivo va en el body de la respuesta. Revertir despues. ---
    const rawKey = process.env.SUPABASE_KEY ?? '';
    const keyKind = rawKey.startsWith('sb_secret_')
      ? 'sb_secret'
      : rawKey.startsWith('sb_publishable_')
        ? 'sb_publishable'
        : rawKey.startsWith('eyJ')
          ? 'jwt'
          : `other(${rawKey.slice(0, 4)})`;

    if (!token) {
      const headerNames = Object.keys(request.headers ?? {}).join(',');
      throw new UnauthorizedException(
        `AUTHDBG no-bearer | authHeader=${JSON.stringify(authHeader ?? null)} | headers=[${headerNames}]`,
      );
    }

    // Decode (NO verificar) para ver que es el token realmente.
    const b64urlToJson = (s: string): any => {
      try {
        const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
        return JSON.parse(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8'));
      } catch {
        return null;
      }
    };
    const parts = token.split('.');
    const jh = b64urlToJson(parts[0] ?? '') ?? {};
    const jp = b64urlToJson(parts[1] ?? '') ?? {};
    const nowSec = Math.floor(Date.now() / 1000);
    const tokenDbg =
      `parts=${parts.length} alg=${jh.alg} kid=${jh.kid} typ=${jh.typ} ` +
      `iss=${jp.iss} aud=${jp.aud} email=${jp.email} role=${jp.role} ` +
      `exp=${jp.exp}(${jp.exp ? jp.exp - nowSec : '?'}s) iat=${jp.iat}`;

    if (request.query?.dbg === 'token') {
      throw new UnauthorizedException(`AUTHDBG token-decoded | ${tokenDbg}`);
    }

    // Verify the token locally against the project's JWKS (asymmetric ES256
    // signing key). getClaims fetches /auth/v1/.well-known/jwks.json once and
    // caches it - no per-request round-trip to GoTrue, and it works with the
    // current asymmetric signing key where the /auth/v1/user endpoint was
    // rejecting the signature.
    const client = this.dbContext.getConnection();
    let userId: string | undefined;
    let userEmail: string | undefined;

    try {
      const { data, error } = await client.auth.getClaims(token);
      if (error || !data?.claims) {
        throw new UnauthorizedException(
          `AUTHDBG getClaims-fail | msg=${(error as any)?.message ?? 'no-claims'} | ${tokenDbg} | keyKind=${keyKind}`,
        );
      }
      userId = data.claims.sub;
      userEmail = (data.claims as any).email;
    } catch (e: any) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException(
        `AUTHDBG getClaims-threw | ${e?.name}: ${e?.message} | url=${process.env.SUPABASE_URL} | keyKind=${keyKind}`,
      );
    }

    const allowedEmail = this.config.get<string>(ALLOWED_EMAIL);
    if (userEmail !== allowedEmail) {
      throw new ForbiddenException(`AUTHDBG email-mismatch | token='${userEmail}' | allowed='${allowedEmail}'`);
    }

    request.user = { id: userId, email: userEmail };
    return true;
  }
}
