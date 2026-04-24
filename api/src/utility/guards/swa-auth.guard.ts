import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ALLOWED_USER } from '../constants/environment.const';

@Injectable()
export class SwaAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const principalHeader = request.headers['x-ms-client-principal'];

    if (!principalHeader) {
      throw new UnauthorizedException();
    }

    const decoded = Buffer.from(principalHeader, 'base64').toString('utf-8');
    const principal = JSON.parse(decoded);

    if (principal.userDetails !== ALLOWED_USER) {
      throw new ForbiddenException();
    }

    return true;
  }
}
