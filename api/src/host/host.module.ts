import { Module } from '@nestjs/common';
import {
  AuthController,
  AuthDebugController,
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
    AuthDebugController,
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
