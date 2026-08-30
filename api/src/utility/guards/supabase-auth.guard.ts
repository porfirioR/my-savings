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

    // Azure Static Web Apps overwrites the `Authorization` header with its own
    // internal token when it proxies /api/* to the Functions backend, so the
    // Supabase access token travels on a custom header. `Authorization` is kept
    // as a fallback for local runs where there is no SWA in between.
    const customToken: string | undefined = request.headers['x-sb-token'];
    const authHeader: string | undefined = request.headers['authorization'];
    const token =
      (typeof customToken === 'string' && customToken.length > 0 ? customToken : undefined) ??
      (authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined);

    if (!token) throw new UnauthorizedException();

    // Verify the token locally against the project's JWKS (asymmetric ES256
    // signing key). getClaims caches the JWKS, so there is no per-request
    // round-trip to GoTrue.
    const { data, error } = await this.dbContext.getConnection().auth.getClaims(token);
    if (error || !data?.claims) throw new UnauthorizedException();

    const email = data.claims.email as string | undefined;
    const allowedEmail = this.config.get<string>(ALLOWED_EMAIL);
    if (email !== allowedEmail) throw new ForbiddenException();

    request.user = { id: data.claims.sub, email };
    return true;
  }
}
