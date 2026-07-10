import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import {
  CreateContributionPeriodApiRequest,
  UpdateContributionPeriodApiRequest,
  UpdateRuedaLabelApiRequest,
  UpsertManualContributionApiRequest,
} from '../contracts/contributions';
import { ContributionPeriodModel, ContributionsMatrixModel, UpsertManualContributionRequest } from '../../manager/contracts/contributions';
import { ContributionsManager } from '../../manager/services';

@Controller('groups/:groupId/contributions')
export class ContributionsController {
  constructor(private readonly contributionsManager: ContributionsManager) {}

  @Get()
  getMatrix(@Param('groupId') groupId: string): Promise<ContributionsMatrixModel> {
    return this.contributionsManager.getMatrix(groupId);
  }

  @Get('periods')
  findPeriods(@Param('groupId') groupId: string): Promise<ContributionPeriodModel[]> {
    return this.contributionsManager.findPeriodsByGroup(groupId);
  }

  @Post('periods')
  createPeriod(
    @Param('groupId') groupId: string,
    @Body() body: CreateContributionPeriodApiRequest,
  ): Promise<ContributionPeriodModel> {
    return this.contributionsManager.createPeriod({ ...body, groupId });
  }

  @Put('periods/:id')
  updatePeriod(
    @Param('id') id: string,
    @Body() body: UpdateContributionPeriodApiRequest,
  ): Promise<ContributionPeriodModel> {
    return this.contributionsManager.updatePeriod(id, body);
  }

  @Delete('periods/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePeriod(@Param('id') id: string): Promise<void> {
    return this.contributionsManager.deletePeriod(id);
  }

  @Put('rueda-label/:ruedaId')
  updateRuedaLabel(
    @Param('ruedaId') ruedaId: string,
    @Body() body: UpdateRuedaLabelApiRequest,
  ): Promise<void> {
    return this.contributionsManager.updateRuedaLabel(ruedaId, body.label);
  }

  @Put('manual')
  upsertManualContribution(
    @Param('groupId') groupId: string,
    @Body() body: UpsertManualContributionApiRequest,
  ): Promise<void> {
    return this.contributionsManager.upsertManualContribution(
      groupId,
      new UpsertManualContributionRequest(body.memberId, body.contributionPeriodId, body.amount, body.description),
    );
  }
}
