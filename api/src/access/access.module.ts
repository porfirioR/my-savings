import { Module } from '@nestjs/common';
import { DbContextService, EventAccessService, EventFollowAccessService, UserAccessService } from './services';

@Module({
  imports: [],
  controllers: [],
  providers: [
    DbContextService,
    EventAccessService,
    EventFollowAccessService,
    UserAccessService,
  ],
})
export class AccessModule {}
