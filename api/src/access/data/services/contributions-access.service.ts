import { Injectable } from '@nestjs/common';
import { BaseAccessService, DbContextService } from '.';
import {
  ContributionPeriodAccessModel,
  CreateContributionPeriodAccessRequest,
  MemberContributionAccessModel,
  UpdateContributionPeriodAccessRequest,
  UpsertManualContributionAccessRequest,
} from '../../../access/contracts/contributions';
import { ContributionPeriodEntity, MemberContributionEntity } from '../entities';

@Injectable()
export class ContributionsAccess extends BaseAccessService {
  constructor(dbContextService: DbContextService) {
    super(dbContextService);
  }

  private mapPeriodToModel(entity: ContributionPeriodEntity): ContributionPeriodAccessModel {
    return {
      id: entity.id,
      groupId: entity.group_id,
      name: entity.name,
      monthlyContributionAmount: entity.monthly_contribution_amount,
      memberCount: entity.member_count,
      position: entity.position,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  private mapContributionToModel(entity: MemberContributionEntity): MemberContributionAccessModel {
    return {
      id: entity.id,
      groupId: entity.group_id,
      memberId: entity.member_id,
      ruedaId: entity.rueda_id,
      contributionPeriodId: entity.contribution_period_id,
      amount: entity.amount,
      description: entity.description,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  async findPeriodsByGroup(groupId: string): Promise<ContributionPeriodAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('contribution_periods')
      .select('*')
      .eq('group_id', groupId)
      .order('position', { ascending: true });

    this.throwIfError(error);
    return (data as ContributionPeriodEntity[]).map((e) => this.mapPeriodToModel(e));
  }

  async createPeriod(req: CreateContributionPeriodAccessRequest): Promise<ContributionPeriodAccessModel> {
    const { data, error } = await this.dbContext
      .from('contribution_periods')
      .insert({
        group_id: req.groupId,
        name: req.name,
        monthly_contribution_amount: req.monthlyContributionAmount,
        member_count: req.memberCount ?? null,
        position: req.position,
      })
      .select()
      .single();

    this.throwIfError(error);
    return this.mapPeriodToModel(data as ContributionPeriodEntity);
  }

  async updatePeriod(id: string, req: UpdateContributionPeriodAccessRequest): Promise<ContributionPeriodAccessModel> {
    const updatePayload: Partial<ContributionPeriodEntity> = {};
    if (req.name !== undefined) updatePayload.name = req.name;
    if (req.monthlyContributionAmount !== undefined) updatePayload.monthly_contribution_amount = req.monthlyContributionAmount;
    if (req.memberCount !== undefined) updatePayload.member_count = req.memberCount;
    if (req.position !== undefined) updatePayload.position = req.position;

    const { data, error } = await this.dbContext
      .from('contribution_periods')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    this.throwIfError(error);
    return this.mapPeriodToModel(data as ContributionPeriodEntity);
  }

  async deletePeriod(id: string): Promise<void> {
    const { error } = await this.dbContext.from('contribution_periods').delete().eq('id', id);
    this.throwIfError(error);
  }

  async findContributionsByGroup(groupId: string): Promise<MemberContributionAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('member_contributions')
      .select('*')
      .eq('group_id', groupId);

    this.throwIfError(error);
    return (data as MemberContributionEntity[]).map((e) => this.mapContributionToModel(e));
  }

  async upsertManualContribution(req: UpsertManualContributionAccessRequest): Promise<MemberContributionAccessModel> {
    const { data, error } = await this.dbContext
      .from('member_contributions')
      .upsert(
        {
          group_id: req.groupId,
          member_id: req.memberId,
          contribution_period_id: req.contributionPeriodId,
          rueda_id: null,
          amount: req.amount,
          description: req.description ?? null,
        },
        { onConflict: 'member_id,contribution_period_id' },
      )
      .select()
      .single();

    this.throwIfError(error);
    return this.mapContributionToModel(data as MemberContributionEntity);
  }

  /** Snapshot a completed rueda's contribution total for every member on its roster. Safe to call more than once. */
  async upsertRuedaContribution(groupId: string, ruedaId: string, memberId: string, amount: number): Promise<void> {
    const { error } = await this.dbContext
      .from('member_contributions')
      .upsert(
        {
          group_id: groupId,
          member_id: memberId,
          rueda_id: ruedaId,
          contribution_period_id: null,
          amount,
          description: null,
        },
        { onConflict: 'member_id,rueda_id' },
      );

    this.throwIfError(error);
  }

  /** Clears a rueda's stored contribution snapshot (used when a completed rueda reverts to active). */
  async deleteRuedaContributions(ruedaId: string): Promise<void> {
    const { error } = await this.dbContext.from('member_contributions').delete().eq('rueda_id', ruedaId);
    this.throwIfError(error);
  }

  /** Live sum of paid contribution_amount_due per member for an active rueda (never persisted). */
  async sumPaidContributionsByRueda(ruedaId: string): Promise<Record<string, number>> {
    const { data, error } = await this.dbContext
      .from('rueda_monthly_payments')
      .select('member_id, contribution_amount_due')
      .eq('rueda_id', ruedaId)
      .eq('is_paid', true);

    this.throwIfError(error);
    const totals: Record<string, number> = {};
    for (const row of (data as { member_id: string; contribution_amount_due: number }[]) ?? []) {
      totals[row.member_id] = (totals[row.member_id] ?? 0) + row.contribution_amount_due;
    }
    return totals;
  }
}
