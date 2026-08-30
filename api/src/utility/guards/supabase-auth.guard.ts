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

    // TEMPORAL: endpoint de diagnostico abierto.
    if (typeof request.url === 'string' && request.url.includes('__authdbg')) {
      return true;
    }

    // Azure Static Web Apps overwrites `Authorization` with its own internal
    // token when it proxies /api/* to the Functions backend, so the Supabase
    // token travels on a custom header. `Authorization` is kept as a fallback
    // for local dev where there is no SWA in between.
    const customToken: string | undefined = request.headers['x-sb-token'];
    const authHeader: string | undefined = request.headers['authorization'];
    const token =
      (typeof customToken === 'string' && customToken.length > 0 ? customToken : undefined) ??
      (authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined);

    if (!token) {
      const headerNames = Object.keys(request.headers ?? {}).join(',');
      throw new UnauthorizedException(`AUTHDBG no-token | headers=[${headerNames}]`);
    }

    const client = this.dbContext.getConnection();
    let userId: string | undefined;
    let userEmail: string | undefined;

    try {
      const { data, error } = await client.auth.getClaims(token);
      if (error || !data?.claims) {
        throw new UnauthorizedException(`AUTHDBG getClaims-fail | ${(error as any)?.message ?? 'no-claims'}`);
      }
      userId = data.claims.sub;
      userEmail = (data.claims as any).email;
    } catch (e: any) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException(`AUTHDBG getClaims-threw | ${e?.name}: ${e?.message}`);
    }

    const allowedEmail = this.config.get<string>(ALLOWED_EMAIL);
    if (userEmail !== allowedEmail) {
      throw new ForbiddenException(`AUTHDBG email-mismatch | token='${userEmail}' | allowed='${allowedEmail}'`);
    }

    request.user = { id: userId, email: userEmail };
    return true;
  }
}
