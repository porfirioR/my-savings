import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { TableEnum } from '../contract/table.enum';
import { DbContextService } from './db-context.service';
import { EventAccessModel } from '../contract/events/event-access-model';
import { EventFollowRequest } from '../contract/event-follows/event-follow-request';

@Injectable()
export class EventFollowAccessService {
  private eventContext: SupabaseClient<any, 'public', any>;

  constructor(private dbContextService: DbContextService) {
    this.eventContext = this.dbContextService.getConnection();
  }

  public getEventFollows = async (userId: number): Promise<EventAccessModel[]> => {
    const { data, error } = await this.eventContext
      .from(TableEnum.EventFollows)
      .select(
        `UserId,
        Events (
          Id,
          Name,
          AuthorId,
          Description,
          IsActive,
          Date,
          IsPublic
        )`
      )
      .eq('UserId', userId);
    if (error) throw error;
    const events = data.flatMap(x => x.Events.filter(x => x.IsActive));
    return events.map(this.getEventAccessModel);
  };

  public createEventFollow = async (accessRequest: EventFollowRequest): Promise<boolean> => {
    const event  = await this.eventContext
      .from(TableEnum.EventFollows)
      .insert(accessRequest);
    if (event.error) throw new Error(event.error.message);
    return true;
  };

  public deleteEventFollow = async (accessRequest: EventFollowRequest): Promise<boolean> => {
    const eventFollow = await this.eventContext
      .from(TableEnum.EventFollows)
      .select('*')
      .eq('UserId', accessRequest.userId)
      .eq('EventId', accessRequest.eventId)
      .single();
    if (eventFollow.error) throw new Error(eventFollow.error.message);

    const deleteEventFollow = await this.eventContext
      .from(TableEnum.EventFollows)
      .delete()
      .eq('Id', eventFollow.data.Id);
    if (deleteEventFollow.error) throw new Error(deleteEventFollow.error.message); 
    return true;
  };
  
  public checkExistEventFollows = async (accessRequest: EventFollowRequest): Promise<boolean> => {
    const { count, error } = await this.eventContext
      .from(TableEnum.EventFollows)
      .select('*', {count: 'exact', head: true})
      .eq('UserId', accessRequest.userId)
      .eq('EventId', accessRequest.eventId);
    if (error) throw error;
    return count > 0;
  };

  private getEventAccessModel = (x: any): EventAccessModel => new EventAccessModel(
    x.Id,
    x.Name,
    x.AuthorId,
    x.Description,
    x.IsActive,
    x.Date,
    x.IsPublic
  );
}
