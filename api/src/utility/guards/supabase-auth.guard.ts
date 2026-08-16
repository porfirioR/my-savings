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

    if (!token) throw new UnauthorizedException();

    const { data, error } = await this.dbContext.getConnection().auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException();

    const allowedEmail = this.config.get<string>(ALLOWED_EMAIL);
    if (data.user.email !== allowedEmail) throw new ForbiddenException();

    request.user = { id: data.user.id, email: data.user.email };
    return true;
  }
}
