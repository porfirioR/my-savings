import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
import { TableEnum } from '../contract/table.enum';
import { CreateEventAccessRequest } from '../contract/events/create-event-access-request';
import { EventAccessModel } from '../contract/events/event-access-model';
import { UpdateEventAccessRequest } from '../contract/events/update-event-access-request';

@Injectable()
export class EventAccessService {
  private eventContext: SupabaseClient<any, 'public', any>;

  constructor(private dbContextService: DbContextService) {
    this.eventContext = this.dbContextService.getConnection();
  }

  public getPublicEvents = async (): Promise<EventAccessModel[]> => {
    const { data, error } = await this.eventContext
      .from(TableEnum.Events)
      .select('*')
      .eq('IsActive', true)
      .eq('IsPublic', true);
    if (error) throw new Error(error.message);
    return data?.map(x => ({ ...x, _className: EventAccessModel }));
  };

  public getMyEvents = async (id: number): Promise<EventAccessModel[]> => {
    const { data, error } = await this.eventContext
      .from(TableEnum.Events)
      .select('*')
      .eq('AuthorId', id);
    if (error) throw new Error(error.message);
    return data?.map(x => ({ ...x, _className: EventAccessModel }));
  };

  public createEvent = async (accessRequest: CreateEventAccessRequest): Promise<boolean> => {
    const event  = await this.eventContext
      .from(TableEnum.Events)
      .insert(accessRequest);
    if (event.error) throw new Error(event.error.message);
    return true;
  };

  public updateEvent = async (accessRequest: UpdateEventAccessRequest): Promise<EventAccessModel> => {
    const event  = await this.eventContext
      .from(TableEnum.Events)
      .upsert(accessRequest);
    if (event.error) throw new Error(event.error.message);
    return new EventAccessModel(
      accessRequest.Id,
      accessRequest.Name,
      accessRequest.AuthorId,
      accessRequest.Description,
      true,
      accessRequest.Date,
      accessRequest.IsPublic
    );
  };

}
