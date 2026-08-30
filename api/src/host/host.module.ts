import { Module } from '@nestjs/common';
import {
  AuthController,
  CashBoxController,
  ContributionsController,
  GroupsController,
  MembersController,
  MemberReplacementsController,
  ParallelLoansController,
  PaymentsController,
  RuedasController,
} from './controllers';
import { ManagerModule } from '../manager/manager.module';

@Module({
  imports: [ManagerModule],
  controllers: [
    AuthController,
    CashBoxController,
    ContributionsController,
    GroupsController,
    MembersController,
    MemberReplacementsController,
    ParallelLoansController,
    PaymentsController,
    RuedasController,
  ],
})
export class HostModule {}
