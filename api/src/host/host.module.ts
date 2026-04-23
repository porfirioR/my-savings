import { Module } from '@nestjs/common';
import {
  CashBoxController,
  GroupsController,
  MembersController,
  ParallelLoansController,
  PaymentsController,
  RuedasController,
} from './controllers';
import { ManagerModule } from '../manager/manager.module';

@Module({
  imports: [ManagerModule],
  controllers: [
    CashBoxController,
    GroupsController,
    MembersController,
    ParallelLoansController,
    PaymentsController,
    RuedasController,
  ],
})
export class HostModule {}
