import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  CreateMemberReplacementApiRequest,
  MarkScheduleApiRequest,
  UpdateScheduleAmountApiRequest,
} from '../contracts/member-replacements';
import {
  CreateMemberReplacementRequest,
  CreateMemberReplacementResult,
  MemberReplacementModel,
  MemberReplacementScheduleModel,
} from '../../manager/contracts/member-replacements';
import { MemberReplacementsManager } from '../../manager/services';

@Controller('groups/:groupId/member-replacements')
export class MemberReplacementsController {
  constructor(private readonly manager: MemberReplacementsManager) {}

  @Get()
  findByGroup(@Param('groupId') groupId: string): Promise<MemberReplacementModel[]> {
    return this.manager.findByGroup(groupId);
  }

  @Get(':id/schedule')
  getSchedule(@Param('id') id: string): Promise<MemberReplacementScheduleModel[]> {
    return this.manager.getSchedule(id);
  }

  @Get('preview-outgoing-amount/:memberId')
  previewOutgoingAmount(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
  ): Promise<{ outgoingMonthlyAmount: number }> {
    return this.manager.previewOutgoingAmount(groupId, memberId).then((outgoingMonthlyAmount) => ({ outgoingMonthlyAmount }));
  }

  @Post()
  create(
    @Param('groupId') groupId: string,
    @Body() body: CreateMemberReplacementApiRequest,
  ): Promise<CreateMemberReplacementResult> {
    return this.manager.create(
      new CreateMemberReplacementRequest(
        groupId,
        body.outgoingMemberId,
        body.leftMonth,
        body.leftYear,
        body.accumulatedContributions,
        body.remainingLoanBalance,
        body.incomingFirstName,
        body.incomingLastName,
        body.outgoingMonthlyAmount,
        body.incomingTotalAmount,
        body.incomingInstallments,
        body.incomingPhone,
      ),
    );
  }

  @Put('schedule/:scheduleId/mark')
  markSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() body: MarkScheduleApiRequest,
  ): Promise<MemberReplacementScheduleModel> {
    return this.manager.markSchedule(scheduleId, body.side, body.paid);
  }

  @Put('schedule/:scheduleId/amount')
  updateScheduleAmount(
    @Param('scheduleId') scheduleId: string,
    @Body() body: UpdateScheduleAmountApiRequest,
  ): Promise<MemberReplacementScheduleModel> {
    return this.manager.updateScheduleAmount(scheduleId, body.side, body.amount);
  }
}
