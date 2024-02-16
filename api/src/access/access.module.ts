import { Module } from '@nestjs/common';
import { DbContextService, EventAccessService, UserAccessService } from './services';

@Module({
  imports: [],
  controllers: [],
  providers: [
    EventAccessService,
    DbContextService,
    UserAccessService,
  ],
})
export class AccessModule {}
