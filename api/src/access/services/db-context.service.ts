import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class DbContextService {
  constructor(private readonly configService: ConfigService) {}

  public getConnection = (): SupabaseClient<any, 'public', any> => {
    const supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    return supabase;
  };
}
