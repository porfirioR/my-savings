import { Injectable } from '@nestjs/common';
import { CashBalanceAccessModel, CashMovementAccessModel } from '../../access/contracts/cash-box';
import {
  CashBalanceModel,
  CashMovementModel,
  CreateCashMovementRequest,
} from '../contracts/cash-box';
import { CashBoxAccess } from '../../access/data/services';

@Injectable()
export class CashBoxManager {
  constructor(private readonly cashBoxAccess: CashBoxAccess) {}

  private mapMovement(a: CashMovementAccessModel): CashMovementModel {
    return new CashMovementModel(
      a.id, a.groupId, a.movementType, a.sourceType, a.category,
      a.amount, a.month, a.year, a.createdAt, a.updatedAt,
      a.description,
    );
  }

  private mapBalance(a: CashBalanceAccessModel): CashBalanceModel {
    return new CashBalanceModel(a.groupId, a.totalIn, a.totalOut, a.balance);
  }

  async getBalance(groupId: string): Promise<CashBalanceModel> {
    return this.mapBalance(await this.cashBoxAccess.getBalance(groupId));
  }

  async getMovements(groupId: string, month?: number, year?: number): Promise<CashMovementModel[]> {
    return (await this.cashBoxAccess.getMovements(groupId, month, year)).map(m => this.mapMovement(m));
  }

  async createMovement(req: CreateCashMovementRequest): Promise<CashMovementModel> {
    return this.mapMovement(await this.cashBoxAccess.createMovement(req));
  }
}
