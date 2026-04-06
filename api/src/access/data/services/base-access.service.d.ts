import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
export declare abstract class BaseAccessService {
    protected readonly dbContextService: DbContextService;
    protected dbContext: SupabaseClient<any, 'public', any>;
    constructor(dbContextService: DbContextService);
}
