import { Module } from '@nestjs/common';
import { GroupsController } from './controllers/groups.controller';
import { PaymentsController, RuedasController } from './controllers';
import { ManagerModule } from '../manager/manager.module';

@Module({
  imports: [ManagerModule],
  controllers: [GroupsController, PaymentsController, RuedasController],
})
export class HostModule {}
