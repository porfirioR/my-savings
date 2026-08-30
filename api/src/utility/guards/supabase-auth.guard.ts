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
    const authHeader: string | undefined = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;

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
          `AUTHDBG getClaims-fail | msg=${(error as any)?.message ?? 'no-claims'} | url=${process.env.SUPABASE_URL} | keyKind=${keyKind}`,
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
