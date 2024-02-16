import { Injectable } from '@nestjs/common';
import { DbContextService } from './db-context.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { TableEnum } from '../contract/table.enum';
import { Events } from '../contract/entities/event.entity';

@Injectable()
export class EventAccessService {
  private eventContext: SupabaseClient<any, 'public', any>;

  constructor(private dbContextService: DbContextService) {
    this.eventContext = this.dbContextService.getConnection();
  }

  public getPublicEvents = async (): Promise<Events[]> => {
    const { data, error } = await this.eventContext
      .from(TableEnum.Events)
      .select('*');
    if (error) throw new Error(error.message);
    return data?.map((x) => ({ ...x, _className: Events }));
  };
}
