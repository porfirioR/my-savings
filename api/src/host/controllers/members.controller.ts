import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { MembersManager } from '../../manager/services';
import { ExitMemberRequest, MemberModel } from '../../manager/contracts/members';
import {
  CreateMemberApiRequest,
  ExitMemberApiRequest,
  UpdateMemberApiRequest,
} from '../contracts/members';

@Controller('groups/:groupId/members')
export class MembersController {
  constructor(private readonly membersManager: MembersManager) {}

  @Get()
  findByGroup(@Param('groupId') groupId: string): Promise<MemberModel[]> {
    return this.membersManager.findByGroup(groupId);
  }

  @Post()
  create(
    @Param('groupId') groupId: string,
    @Body() body: CreateMemberApiRequest,
  ): Promise<MemberModel> {
    return this.membersManager.create({ ...body, groupId });
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<MemberModel> {
    return this.membersManager.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateMemberApiRequest,
  ): Promise<MemberModel> {
    return this.membersManager.update(id, body);
  }

  @Post(':id/exit')
  processExit(
    @Param('id') id: string,
    @Body() body: ExitMemberApiRequest,
  ) {
    return this.membersManager.processExit(
      id,
      new ExitMemberRequest(body.leftMonth, body.leftYear),
      body.accumulatedContributions,
      body.remainingLoanBalance,
    );
  }
}
