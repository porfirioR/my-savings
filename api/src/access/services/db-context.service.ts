import { Injectable } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class DbContextService {
  constructor() {}

  public getConnection = (): SupabaseClient<any, 'public', any> => {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
    return supabase;
  };
}
