import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { TableEnum } from '../contract/table.enum';
import { DbContextService } from './db-context.service';
import { EventAccessModel } from '../contract/events/event-access-model';
import { EventFollowRequest } from '../contract/event-follows/event-follow-request';
import { EventEntity } from '../contract/entities/event.entity';
import { EventFollowEntity } from '../contract/entities/event-follow.entity';

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
        `userid,
        events (
          id,
          name,
          authorid,
          description,
          isactive,
          date,
          ispublic
        )`
      )
      .eq('userid', userId);
    if (error) throw error;
    const events = data.flatMap(x => x.events.filter(x => x.isactive));
    return events.map(this.getEventAccessModel);
  };

  public createEventFollow = async (accessRequest: EventFollowRequest): Promise<boolean> => {
    const entity = this.getEntity(accessRequest)
    const event  = await this.eventContext
      .from(TableEnum.EventFollows)
      .insert(entity);
    if (event.error) throw new Error(event.error.message);
    return true;
  };

  public deleteEventFollow = async (accessRequest: EventFollowRequest): Promise<boolean> => {
    const eventFollow = await this.eventContext
      .from(TableEnum.EventFollows)
      .select('*')
      .eq('userid', accessRequest.userId)
      .eq('eventid', accessRequest.eventId)
      .single();
    if (eventFollow.error) throw new Error(eventFollow.error.message);

    const deleteEventFollow = await this.eventContext
      .from(TableEnum.EventFollows)
      .delete()
      .eq('id', eventFollow.data.Id);
    if (deleteEventFollow.error) throw new Error(deleteEventFollow.error.message); 
    return true;
  };
  
  public checkExistEventFollows = async (accessRequest: EventFollowRequest): Promise<boolean> => {
    const { count, error } = await this.eventContext
      .from(TableEnum.EventFollows)
      .select('*', {count: 'exact', head: true})
      .eq('userid', accessRequest.userId)
      .eq('eventid', accessRequest.eventId);
    if (error) throw error;
    return count > 0;
  };

  private getEventAccessModel = (x: EventEntity): EventAccessModel => new EventAccessModel(
    x.id,
    x.name,
    x.authorid,
    x.description,
    x.isactive,
    x.date,
    x.ispublic
  );

  private getEntity = (accessRequest: EventFollowRequest): EventFollowEntity => new EventFollowEntity(accessRequest.eventId, accessRequest.userId)
}
