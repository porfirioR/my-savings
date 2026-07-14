import { Module } from '@nestjs/common';
import {
  CashBoxController,
  ContributionsController,
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
    ContributionsController,
    GroupsController,
    MembersController,
    ParallelLoansController,
    PaymentsController,
    RuedasController,
  ],
})
export class HostModule {}
