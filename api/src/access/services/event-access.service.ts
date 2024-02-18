import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
import { TableEnum } from '../contract/table.enum';
import { CreateEventAccessRequest } from '../contract/events/create-event-access-request';
import { EventAccessModel } from '../contract/events/event-access-model';

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
      .eq('IsPublic', true);
    if (error) throw new Error(error.message);
    return data?.map((x) => ({ ...x, _className: EventAccessModel }));
  };

  public getMyEvents = async (id: string): Promise<EventAccessModel[]> => {
    const { data, error } = await this.eventContext
      .from(TableEnum.Events)
      .select('*')
      .eq('AuthorId', id);
    if (error) throw new Error(error.message);
    return data?.map((x) => ({ ...x, _className: EventAccessModel }));
  };


  public createEvent = async (accessRequest: CreateEventAccessRequest): Promise<boolean> => {
    const event  = await this.eventContext
      .from(TableEnum.Events)
      .upsert([accessRequest]);
    if (event.error) throw new Error(event.error.message);
    return true;
  };
}
