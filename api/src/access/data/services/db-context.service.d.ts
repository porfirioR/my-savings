import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class DbContextService {
    private readonly configService;
    private dbClient;
    constructor(configService: ConfigService);
    getConnection(): SupabaseClient<any, 'public', any>;
}
