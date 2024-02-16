import { Module } from '@nestjs/common';
import { DbContextService, EventAccessService } from './services';

@Module({
  imports: [],
  controllers: [],
  providers: [EventAccessService, DbContextService],
})
export class AccessModule {}
