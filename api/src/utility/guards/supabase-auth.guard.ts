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

    let data: any;
    let error: any;
    try {
      ({ data, error } = await this.dbContext.getConnection().auth.getUser(token));
    } catch (e: any) {
      throw new UnauthorizedException(`AUTHDBG getUser-threw | ${e?.name}: ${e?.message} | url=${process.env.SUPABASE_URL} | keyKind=${keyKind}`);
    }
    if (error || !data?.user) {
      throw new UnauthorizedException(
        `AUTHDBG getUser-fail | status=${error?.status ?? '?'} | msg=${error?.message ?? 'no-user'} | url=${process.env.SUPABASE_URL} | keyKind=${keyKind} | nodeEnv=${process.env.NODE_ENV}`,
      );
    }

    const allowedEmail = this.config.get<string>(ALLOWED_EMAIL);
    if (data.user.email !== allowedEmail) {
      throw new ForbiddenException(`AUTHDBG email-mismatch | token='${data.user.email}' | allowed='${allowedEmail}'`);
    }

    request.user = { id: data.user.id, email: data.user.email };
    return true;
  }
}
