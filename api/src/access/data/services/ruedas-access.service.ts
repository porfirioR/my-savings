import { Injectable } from '@nestjs/common';
import { BaseAccessService, DbContextService } from '.';
import { RuedaEntity, RuedaSlotEntity } from '../entities';
import { CreateRuedaAccessRequest, CreateRuedaSlotAccessRequest, RuedaAccessModel, RuedaSlotAccessModel, UpdateRuedaAccessRequest } from '../../../access/contracts/ruedas';

interface CashBalanceSuggestion {
  suggestedLoanAmount: number;
  cajaBalance: number;
  projectedMonthlyIncome: number;
}

@Injectable()
export class RuedasAccess extends BaseAccessService {
  constructor(dbContextService: DbContextService) {
    super(dbContextService);
  }

  private mapSlotToModel(entity: RuedaSlotEntity & { members?: { first_name: string; last_name: string } }): RuedaSlotAccessModel {
    return {
      id: entity.id,
      ruedaId: entity.rueda_id,
      memberId: entity.member_id,
      memberName: entity.members
        ? `${entity.members.first_name} ${entity.members.last_name}`
        : undefined,
      slotPosition: entity.slot_position,
      loanAmount: entity.loan_amount,
      installmentAmount: entity.installment_amount,
      totalToReturn: entity.total_to_return,
      loanMonth: entity.loan_month,
      loanYear: entity.loan_year,
      status: entity.status,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  private mapToModel(entity: RuedaEntity, slots?: RuedaSlotAccessModel[]): RuedaAccessModel {
    return {
      id: entity.id,
      groupId: entity.group_id,
      ruedaNumber: entity.rueda_number,
      type: entity.type,
      loanAmount: entity.loan_amount,
      interestRate: entity.interest_rate,
      contributionAmount: entity.contribution_amount,
      installmentAmount: entity.installment_amount,
      totalToReturn: entity.total_to_return,
      roundingUnit: entity.rounding_unit,
      startMonth: entity.start_month,
      startYear: entity.start_year,
      endMonth: entity.end_month,
      endYear: entity.end_year,
      status: entity.status,
      historicalContributionTotal: entity.historical_contribution_total,
      notes: entity.notes,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      slots,
    };
  }

  async findByGroup(groupId: string): Promise<RuedaAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('ruedas')
      .select('*')
      .eq('group_id', groupId)
      .order('rueda_number', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as RuedaEntity[]).map((e) => this.mapToModel(e));
  }

  async findById(id: string): Promise<RuedaAccessModel> {
    const { data: ruedaData, error: ruedaError } = await this.dbContext
      .from('ruedas')
      .select('*')
      .eq('id', id)
      .single();

    if (ruedaError) throw new Error(ruedaError.message);

    const { data: slotsData, error: slotsError } = await this.dbContext
      .from('rueda_slots')
      .select('*, members(first_name, last_name)')
      .eq('rueda_id', id)
      .order('slot_position', { ascending: true });

    if (slotsError) throw new Error(slotsError.message);

    const slots = (slotsData as any[]).map((s) => this.mapSlotToModel(s));
    return this.mapToModel(ruedaData as RuedaEntity, slots);
  }

  async findActive(groupId: string): Promise<RuedaAccessModel | null> {
    const { data: ruedaData, error: ruedaError } = await this.dbContext
      .from('ruedas')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'active')
      .maybeSingle();

    if (ruedaError) throw new Error(ruedaError.message);
    if (!ruedaData) return null;

    const { data: slotsData, error: slotsError } = await this.dbContext
      .from('rueda_slots')
      .select('*, members(first_name, last_name)')
      .eq('rueda_id', (ruedaData as RuedaEntity).id)
      .order('slot_position', { ascending: true });

    if (slotsError) throw new Error(slotsError.message);

    const slots = (slotsData as any[]).map((s) => this.mapSlotToModel(s));
    return this.mapToModel(ruedaData as RuedaEntity, slots);
  }

  async create(req: CreateRuedaAccessRequest): Promise<RuedaAccessModel> {
    const { data, error } = await this.dbContext
      .from('ruedas')
      .insert({
        group_id: req.groupId,
        rueda_number: req.ruedaNumber,
        type: req.type,
        loan_amount: req.loanAmount,
        interest_rate: req.interestRate,
        contribution_amount: req.contributionAmount,
        installment_amount: req.installmentAmount,
        total_to_return: req.totalToReturn,
        rounding_unit: req.roundingUnit,
        start_month: req.startMonth,
        start_year: req.startYear,
        end_month: null,
        end_year: null,
        status: req.status,
        historical_contribution_total: req.historicalContributionTotal ?? null,
        notes: req.notes ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as RuedaEntity);
  }

  async update(id: string, req: UpdateRuedaAccessRequest): Promise<RuedaAccessModel> {
    const updatePayload: Partial<RuedaEntity> = {};
    if (req.loanAmount !== undefined) updatePayload.loan_amount = req.loanAmount;
    if (req.interestRate !== undefined) updatePayload.interest_rate = req.interestRate;
    if (req.contributionAmount !== undefined) updatePayload.contribution_amount = req.contributionAmount;
    if (req.installmentAmount !== undefined) updatePayload.installment_amount = req.installmentAmount;
    if (req.totalToReturn !== undefined) updatePayload.total_to_return = req.totalToReturn;
    if (req.roundingUnit !== undefined) updatePayload.rounding_unit = req.roundingUnit;
    if (req.startMonth !== undefined) updatePayload.start_month = req.startMonth;
    if (req.startYear !== undefined) updatePayload.start_year = req.startYear;
    if (req.endMonth !== undefined) updatePayload.end_month = req.endMonth;
    if (req.endYear !== undefined) updatePayload.end_year = req.endYear;
    if (req.status !== undefined) updatePayload.status = req.status;
    if (req.historicalContributionTotal !== undefined) updatePayload.historical_contribution_total = req.historicalContributionTotal;
    if (req.notes !== undefined) updatePayload.notes = req.notes;

    const { data, error } = await this.dbContext
      .from('ruedas')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as RuedaEntity);
  }

  async upsertSlots(ruedaId: string, slots: CreateRuedaSlotAccessRequest[]): Promise<RuedaSlotAccessModel[]> {
    const records = slots.map((s) => ({
      rueda_id: ruedaId,
      member_id: s.memberId,
      slot_position: s.slotPosition,
      loan_amount: s.loanAmount,
      installment_amount: s.installmentAmount,
      total_to_return: s.totalToReturn,
      loan_month: s.loanMonth,
      loan_year: s.loanYear,
      status: s.status,
    }));

    const { data, error } = await this.dbContext
      .from('rueda_slots')
      .upsert(records, { onConflict: 'rueda_id,slot_position' })
      .select();

    if (error) throw new Error(error.message);
    return (data as RuedaSlotEntity[]).map((e) => this.mapSlotToModel(e));
  }

  async calculateSuggestion(groupId: string): Promise<CashBalanceSuggestion> {
    const { data: balanceData, error: balanceError } = await this.dbContext
      .from('v_cash_balance')
      .select('*')
      .eq('group_id', groupId)
      .maybeSingle();

    if (balanceError) throw new Error(balanceError.message);

    const cajaBalance = (balanceData as any)?.balance ?? 0;

    const { data: ruedaData, error: ruedaError } = await this.dbContext
      .from('ruedas')
      .select('contribution_amount, installment_amount')
      .eq('group_id', groupId)
      .eq('status', 'active')
      .maybeSingle();

    if (ruedaError) throw new Error(ruedaError.message);

    const contributionAmount = (ruedaData as any)?.contribution_amount ?? 0;
    const installmentAmount = (ruedaData as any)?.installment_amount ?? 0;
    const projectedMonthlyIncome = contributionAmount * 15 + installmentAmount * 14;

    const suggestedLoanAmount = cajaBalance + projectedMonthlyIncome;

    return {
      suggestedLoanAmount,
      cajaBalance,
      projectedMonthlyIncome,
    };
  }
}
