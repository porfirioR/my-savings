import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class DbContextService {
  constructor(private readonly configService: ConfigService) {}

  public getConnection = (): SupabaseClient<any, 'public', any> => {
    const url = this.configService.get<string>('SUPABASE_URL')
    const key = this.configService.get<string>('SUPABASE_KEY')
    const supabase = createClient(url, key);
    return supabase;
  };
}
