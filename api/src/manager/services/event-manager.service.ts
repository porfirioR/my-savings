import { Injectable } from '@nestjs/common';
import { EventModel } from '../models/events/event-model';
import { EventAccessService } from '../../access/services';
import { CreateEventRequest } from '../models/events/create-event-request';
import { CreateEventAccessRequest } from 'src/access/contract/events/create-event-access-request';
import { UpdateEventAccessRequest } from 'src/access/contract/events/update-event-access-request';
import { UpdateEventRequest } from '../models/events/update-event-request';

@Injectable()
export class EventManagerService {

  constructor(
    private eventAccessService: EventAccessService,
  ) { }

  public getPublicEvents = async (): Promise<EventModel[]> => {
    const accessModelList = await this.eventAccessService.getPublicEvents();
    return accessModelList.map(x => ({ ...x, _className: EventModel }))
  };

  public getMyEvents = async (id: number): Promise<EventModel[]> => {
    const accessModelList = await this.eventAccessService.getMyEvents(id);
    return accessModelList.map(x => ({ ...x, _className: EventModel }))
  };

  public createEvent = async (request: CreateEventRequest): Promise<boolean> => {
    const accessRequest = new CreateEventAccessRequest(request.name, request.authorId, request.description, request.date, request.isPublic)
    return await this.eventAccessService.createEvent(accessRequest);
  }

  public updateEvent = async (request: UpdateEventRequest): Promise<EventModel> => {
    const accessRequest = new UpdateEventAccessRequest(request.id, request.name, request.authorId, request.description, request.date, request.isPublic)
    const accessModel = await this.eventAccessService.updateEvent(accessRequest);
    return new EventModel(accessModel.id, accessModel.name, accessModel.authorId, accessModel.description, accessModel.isActive, accessModel.date, accessModel.isPublic)
  }

}
