import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';

export abstract class BaseAccessService {
  protected dbContext: SupabaseClient<any, 'public', any>;

  constructor(protected readonly dbContextService: DbContextService) {
    this.dbContext = this.dbContextService.getConnection();
  }
}
