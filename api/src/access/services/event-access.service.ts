import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
import { TableEnum } from '../contract/table.enum';
import { CreateEventAccessRequest } from '../contract/events/create-event-access-request';
import { EventAccessModel } from '../contract/events/event-access-model';
import { UpdateEventAccessRequest } from '../contract/events/update-event-access-request';
import { EventEntity } from '../contract/entities/event.entity';

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
      .eq('isactive', true)
      .eq('ispublic', true);
    if (error) throw new Error(error.message);
    return data?.map(this.getEventAccessModel);
  };

  public getMyEvents = async (id: number): Promise<EventAccessModel[]> => {
    const { data, error } = await this.eventContext
      .from(TableEnum.Events)
      .select('*')
      .eq('authorid', id);
    if (error) throw new Error(error.message);
    return data?.map(this.getEventAccessModel);
  };

  public createEvent = async (accessRequest: CreateEventAccessRequest): Promise<EventAccessModel> => {
    const eventEntity = this.getEntity(accessRequest);
    const event  = await this.eventContext
      .from(TableEnum.Events)
      .insert(eventEntity)
      .select()
      .single<EventEntity>();
    if (event.error) throw new Error(event.error.message);
    return this.getEventAccessModel(event.data);
  };

  public updateEvent = async (accessRequest: UpdateEventAccessRequest): Promise<EventAccessModel> => {
    const eventEntity = this.getEntity(accessRequest);
    const event = await this.eventContext
      .from(TableEnum.Events)
      .upsert(eventEntity)
      .select()
      .single<EventEntity>();
    if (event.error) throw new Error(event.error.message);
    return this.getEventAccessModel(event.data);
  };

  private getEventAccessModel = (accessRequest: EventEntity): EventAccessModel => new EventAccessModel(
    accessRequest.id,
    accessRequest.name,
    accessRequest.authorid,
    accessRequest.description,
    accessRequest.isactive,
    accessRequest.date,
    accessRequest.ispublic
  );

  private getEntity = (accessRequest: CreateEventAccessRequest | UpdateEventAccessRequest) => {
    const eventEntity = new EventEntity(accessRequest.name, accessRequest.authorId, accessRequest.description, true, accessRequest.date, accessRequest.isPublic);
    if (accessRequest instanceof UpdateEventAccessRequest) {
      eventEntity.id = accessRequest.id
    }
    return eventEntity
  };

}
