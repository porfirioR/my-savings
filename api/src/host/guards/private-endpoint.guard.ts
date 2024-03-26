import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UpdateEventApiRequest } from '../models/events/update-event-api-request';
import { EventManagerService, UserManagerService } from '../../manager/services';
import { JWT_TOKEN } from '../../utility/constants';
import { DatabaseColumns } from '../../utility/enums';

@Injectable()
export class PrivateEndpointGuard implements CanActivate {
  @Inject()
  private readonly eventManager: EventManagerService
  @Inject()
  private readonly userManager: UserManagerService
  @Inject()
  private readonly jwtService: JwtService
  @Inject()
  private readonly configService: ConfigService

  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(DatabaseColumns.IsPublic, [context.getHandler(), context.getClass()])
    if (isPublic) {
      return isPublic
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const jwtToken = this.configService.get<string>(JWT_TOKEN)
    const payload = await this.jwtService.verifyAsync(
      token,
      {
        secret: jwtToken
      }
    );
    const email = payload[DatabaseColumns.Email];
    if (!email) {
      return false
    }
    const user = await this.userManager.getUserByEmail(email)
    if (request.method === 'PUT') {
      const body: UpdateEventApiRequest = request.body
      const myEvents = await this.eventManager.getMyEvents(user.id)
      const eventToUpdateIsMine = myEvents.some(x => x.authorId === body.id)
      return eventToUpdateIsMine
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
