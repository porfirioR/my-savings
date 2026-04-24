import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ALLOWED_USER } from '../constants/environment.const';

@Injectable()
export class SwaAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const principalHeader = request.headers['x-ms-client-principal'];

    if (!principalHeader) {
      throw new UnauthorizedException();
    }

    const decoded = Buffer.from(principalHeader, 'base64').toString('utf-8');
    const principal = JSON.parse(decoded);

    const allowedUser = this.config.get<string>(ALLOWED_USER);
    if (principal.userDetails !== allowedUser) {
      throw new ForbiddenException();
    }

    return true;
  }
}
