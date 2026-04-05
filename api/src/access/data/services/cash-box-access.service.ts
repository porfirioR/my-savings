import { Injectable } from '@nestjs/common';
import { BaseAccessService, DbContextService } from '.';
import {
  CashBalanceAccessModel,
  CashMovementAccessModel,
  CreateCashMovementAccessRequest,
} from '../../contracts/cash-box';
import { CashMovementEntity } from '../entities';

@Injectable()
export class CashBoxAccess extends BaseAccessService {
  constructor(dbContextService: DbContextService) {
    super(dbContextService);
  }

  private mapToModel(e: CashMovementEntity): CashMovementAccessModel {
    return new CashMovementAccessModel(
      e.id, e.group_id, e.movement_type, e.source_type,
      e.category, e.amount, e.month, e.year, e.created_at, e.updated_at,
      e.description ?? undefined, e.reference_id ?? undefined,
    );
  }

  async getBalance(groupId: string): Promise<CashBalanceAccessModel> {
    const { data, error } = await this.dbContext
      .from('v_cash_balance')
      .select('*')
      .eq('group_id', groupId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    const row = data as any;
    return new CashBalanceAccessModel(
      groupId,
      Number(row?.total_in ?? 0),
      Number(row?.total_out ?? 0),
      Number(row?.balance ?? 0),
    );
  }

  async getMovements(
    groupId: string,
    month?: number,
    year?: number,
  ): Promise<CashMovementAccessModel[]> {
    let query = this.dbContext
      .from('cash_movements')
      .select('*')
      .eq('group_id', groupId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (month !== undefined) query = query.eq('month', month);
    if (year !== undefined) query = query.eq('year', year);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data as CashMovementEntity[]).map(e => this.mapToModel(e));
  }

  async createMovement(req: CreateCashMovementAccessRequest): Promise<CashMovementAccessModel> {
    const { data, error } = await this.dbContext
      .from('cash_movements')
      .insert({
        group_id: req.groupId,
        movement_type: req.movementType,
        source_type: req.sourceType,
        category: req.category,
        description: req.description ?? null,
        amount: req.amount,
        month: req.month,
        year: req.year,
        reference_id: req.referenceId ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as CashMovementEntity);
  }
}
