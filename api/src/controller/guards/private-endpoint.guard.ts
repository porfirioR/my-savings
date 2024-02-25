import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UpdateEventApiRequest } from '../models/events/update-event-api-request';
import { EventManagerService, UserManagerService } from '../../manager/services';

@Injectable()
export class PrivateEndpointGuard implements CanActivate {

  constructor(
    private readonly eventManager: EventManagerService,
    private readonly UserManager: UserManagerService
  ) { }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const email = request.headers['email'];
    if (!email) {
      return false
    }
    const user = await this.UserManager.getUserByEmail(email)
    if (request.method === 'PUT') {
      const body: UpdateEventApiRequest = request.body
      const myEvents = await this.eventManager.getMyEvents(user.id)
      const eventToUpdateIsMine = myEvents.some(x => x.authorId === body.id)
      return eventToUpdateIsMine
    }
    return true;
  }
}
