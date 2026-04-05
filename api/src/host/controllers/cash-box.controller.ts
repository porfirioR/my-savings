import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CashBoxManager } from '../../manager/services';
import { CashBalanceModel, CashMovementModel } from '../../manager/contracts/cash-box';
import { CreateCashMovementApiRequest } from '../contracts/cash-box';

@Controller('groups/:groupId/cash-box')
export class CashBoxController {
  constructor(private readonly cashBoxManager: CashBoxManager) {}

  @Get('balance')
  getBalance(@Param('groupId') groupId: string): Promise<CashBalanceModel> {
    return this.cashBoxManager.getBalance(groupId);
  }

  @Get('movements')
  getMovements(
    @Param('groupId') groupId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ): Promise<CashMovementModel[]> {
    return this.cashBoxManager.getMovements(
      groupId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Post('movements')
  createMovement(
    @Param('groupId') groupId: string,
    @Body() body: CreateCashMovementApiRequest,
  ): Promise<CashMovementModel> {
    return this.cashBoxManager.createMovement({ ...body, groupId, sourceType: 'manual' });
  }
}
