import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UpdateEventApiRequest } from '../models/events/update-event-api-request';
import { EventManagerService, UserManagerService } from '../../manager/services';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrivateEndpointGuard implements CanActivate {

  constructor(
    private readonly eventManager: EventManagerService,
    private readonly userManager: UserManagerService,
    private jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.get<string>('JWT_TOKEN')
        }
      );
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    const email = request.headers['email'];
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
