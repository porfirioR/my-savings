import { Module } from '@nestjs/common';
import { DataModule } from '../access/data/data.module';
import { GroupsManager, PaymentsManager, RuedasManager } from './services';

@Module({
  imports: [DataModule],
  providers: [GroupsManager, PaymentsManager, RuedasManager],
  exports: [GroupsManager, PaymentsManager, RuedasManager],
})
export class ManagerModule {}
