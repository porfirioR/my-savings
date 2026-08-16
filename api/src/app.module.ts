import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { UtilityModule } from './utility/utility.module';
import { HostModule } from './host/host.module';
import { DataModule } from './access/data/data.module';
import { SupabaseAuthGuard } from './utility/guards/supabase-auth.guard';

@Module({
  imports: [
    UtilityModule,
    DataModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    HostModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: SupabaseAuthGuard },
  ],
})
export class AppModule {}
