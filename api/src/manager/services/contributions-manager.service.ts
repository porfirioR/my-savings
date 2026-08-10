import { Injectable } from '@nestjs/common';
import { ContributionsAccess, MemberReplacementsAccess, MembersAccess, RuedasAccess } from '../../access/data/services';
import {
  ContributionColumnModel,
  ContributionPeriodModel,
  ContributionsMatrixModel,
  CreateContributionPeriodRequest,
  MemberContributionRowModel,
  UpdateContributionPeriodRequest,
  UpsertManualContributionRequest,
} from '../contracts/contributions';
import { MemberReplacementAccessModel } from '../../access/contracts/member-replacements';
import { CreateContributionPeriodAccessRequest, UpdateContributionPeriodAccessRequest, UpsertManualContributionAccessRequest } from '../../access/contracts/contributions';

@Injectable()
export class ContributionsManager {
  constructor(
    private readonly contributionsAccess: ContributionsAccess,
    private readonly membersAccess: MembersAccess,
    private readonly ruedasAccess: RuedasAccess,
    private readonly memberReplacementsAccess: MemberReplacementsAccess,
  ) {}

  private mapPeriodToModel(p: {
    id: string; groupId: string; name: string; monthlyContributionAmount: number;
    memberCount: number | null; position: number; createdAt: string; updatedAt: string;
  }): ContributionPeriodModel {
    return new ContributionPeriodModel(
      p.id, p.groupId, p.name, p.monthlyContributionAmount, p.memberCount, p.position, p.createdAt, p.updatedAt,
    );
  }

  async findPeriodsByGroup(groupId: string): Promise<ContributionPeriodModel[]> {
    const periods = await this.contributionsAccess.findPeriodsByGroup(groupId);
    return periods.map((p) => this.mapPeriodToModel(p));
  }

  async createPeriod(req: CreateContributionPeriodRequest): Promise<ContributionPeriodModel> {
    const created = await this.contributionsAccess.createPeriod(
      new CreateContributionPeriodAccessRequest(req.groupId, req.name, req.monthlyContributionAmount, req.position, req.memberCount),
    );

    const members = await this.membersAccess.findByGroup(req.groupId);
    const memberCount = req.memberCount ?? members.length;
    const amount = memberCount * req.monthlyContributionAmount;
    for (const member of members) {
      await this.contributionsAccess.upsertManualContribution(
        new UpsertManualContributionAccessRequest(req.groupId, member.id, created.id, amount),
      );
    }

    return this.mapPeriodToModel(created);
  }

  async updatePeriod(id: string, req: UpdateContributionPeriodRequest): Promise<ContributionPeriodModel> {
    const updated = await this.contributionsAccess.updatePeriod(
      id,
      new UpdateContributionPeriodAccessRequest(req.name, req.monthlyContributionAmount, req.memberCount, req.position),
    );
    return this.mapPeriodToModel(updated);
  }

  async deletePeriod(id: string): Promise<void> {
    return this.contributionsAccess.deletePeriod(id);
  }

  async upsertManualContribution(groupId: string, req: UpsertManualContributionRequest): Promise<void> {
    await this.contributionsAccess.upsertManualContribution(
      new UpsertManualContributionAccessRequest(groupId, req.memberId, req.contributionPeriodId, req.amount, req.description),
    );
  }

  /**
   * Called right after a rueda transitions into 'completed'. Idempotent.
   * Uses the uniform totalMonths x contributionAmount for every roster member -
   * the granular rueda_monthly_payments rows for old completed ruedas are often
   * incomplete (only the months actually tracked live through the app exist),
   * so they're not a reliable source for a full-rueda total. Members who left
   * mid-rueda need their reduced amount corrected manually in the ledger.
   */
  async snapshotCompletedRueda(ruedaId: string): Promise<void> {
    const rueda = await this.ruedasAccess.findById(ruedaId);
    const slots = rueda.slots ?? [];
    if (slots.length === 0) return;
    const totalMonths = slots.length;
    const amount = totalMonths * rueda.contributionAmount;
    const uniqueMemberIds = [...new Set(slots.map((s) => s.memberId))];
    for (const memberId of uniqueMemberIds) {
      await this.contributionsAccess.upsertRuedaContribution(rueda.groupId, ruedaId, memberId, amount);
    }
  }

  /** Called if a completed rueda reverts to a non-completed status. */
  async clearRuedaContributions(ruedaId: string): Promise<void> {
    return this.contributionsAccess.deleteRuedaContributions(ruedaId);
  }

  /**
   * Distributes an incoming replacement member's paid installments across
   * contribution columns: each paid installment first covers the current
   * rueda's own monthly rate (what they'd owe as a regular member for that
   * month), and whatever's left over "buys into" the group's history, filling
   * the most recently completed rueda first, then manual periods from most
   * recent to oldest, until the surplus runs out.
   */
  private distributeReplacementPayments(
    schedule: { incomingPaid: boolean; incomingAmount: number }[],
    currentColumn: ContributionColumnModel,
    columns: ContributionColumnModel[],
  ): Map<string, number> {
    const result = new Map<string, number>();
    let currentBucket = 0;
    let surplus = 0;
    for (const row of schedule) {
      if (!row.incomingPaid) continue;
      const toCurrent = Math.min(row.incomingAmount, currentColumn.monthlyAmount);
      currentBucket += toCurrent;
      surplus += row.incomingAmount - toCurrent;
    }
    result.set(currentColumn.id, currentBucket);

    const historyBuckets = columns
      .filter((c) => c.id !== currentColumn.id)
      .sort((a, b) => b.position - a.position);

    for (const bucket of historyBuckets) {
      if (surplus <= 0) break;
      const capacity = bucket.monthlyAmount * (bucket.memberCount ?? 0);
      const applied = Math.min(surplus, capacity);
      result.set(bucket.id, applied);
      surplus -= applied;
    }

    return result;
  }

  /** Called once a member replacement's last installment is paid and the slot hands over. Freezes the buy-in distribution. */
  async finalizeIncomingReplacement(replacement: MemberReplacementAccessModel): Promise<void> {
    const matrix = await this.getMatrix(replacement.groupId);
    const currentColumn = matrix.columns.find((c) => c.id === replacement.ruedaId);
    if (!currentColumn) return;

    const schedule = await this.memberReplacementsAccess.findScheduleByReplacement(replacement.id);
    const buckets = this.distributeReplacementPayments(schedule, currentColumn, matrix.columns);

    for (const [columnId, amount] of buckets) {
      const column = matrix.columns.find((c) => c.id === columnId)!;
      if (column.type === 'rueda') {
        await this.contributionsAccess.upsertRuedaContribution(replacement.groupId, columnId, replacement.incomingMemberId, amount);
      } else {
        await this.contributionsAccess.upsertManualContribution(
          new UpsertManualContributionAccessRequest(replacement.groupId, replacement.incomingMemberId, columnId, amount),
        );
      }
    }
  }

  /** Called if a finalized member replacement reverts back to active (an installment got unmarked). */
  async clearIncomingReplacementContributions(memberId: string): Promise<void> {
    return this.contributionsAccess.deleteContributionsByMember(memberId);
  }

  async updateRuedaLabel(ruedaId: string, label: string): Promise<void> {
    return this.ruedasAccess.updateContributionLabel(ruedaId, label);
  }

  private defaultRuedaLabel(ruedaNumber: number, startMonth: number, startYear: number): string {
    return `Rueda ${ruedaNumber} (${String(startMonth).padStart(2, '0')}/${startYear})`;
  }

  async getMatrix(groupId: string): Promise<ContributionsMatrixModel> {
    const [members, periods, ruedas, storedContributions] = await Promise.all([
      this.membersAccess.findByGroup(groupId),
      this.contributionsAccess.findPeriodsByGroup(groupId),
      this.ruedasAccess.findByGroup(groupId),
      this.contributionsAccess.findContributionsByGroup(groupId),
    ]);

    const sortedMembers = [...members].sort((a, b) => a.position - b.position);
    const relevantRuedas = ruedas
      .filter((r) => r.status === 'active' || r.status === 'completed')
      .sort((a, b) => a.ruedaNumber - b.ruedaNumber);

    const storedByPeriod = new Map<string, Map<string, number>>();
    const storedByRueda = new Map<string, Map<string, number>>();
    for (const c of storedContributions) {
      if (c.contributionPeriodId) {
        if (!storedByPeriod.has(c.contributionPeriodId)) storedByPeriod.set(c.contributionPeriodId, new Map());
        storedByPeriod.get(c.contributionPeriodId)!.set(c.memberId, c.amount);
      } else if (c.ruedaId) {
        if (!storedByRueda.has(c.ruedaId)) storedByRueda.set(c.ruedaId, new Map());
        storedByRueda.get(c.ruedaId)!.set(c.memberId, c.amount);
      }
    }

    const columns: ContributionColumnModel[] = [];
    const valuesByMember = new Map<string, Record<string, number>>();
    for (const m of sortedMembers) valuesByMember.set(m.id, {});

    for (const period of periods) {
      columns.push(new ContributionColumnModel(
        period.id, 'manual', period.name, period.monthlyContributionAmount, period.memberCount, period.position,
      ));
      const values = storedByPeriod.get(period.id);
      for (const m of sortedMembers) {
        valuesByMember.get(m.id)![period.id] = values?.get(m.id) ?? 0;
      }
    }

    let ruedaPosition = periods.length;
    for (const rueda of relevantRuedas) {
      ruedaPosition += 1;
      const full = await this.ruedasAccess.findById(rueda.id);
      const roster = full.slots ?? [];
      const rosterMemberIds = new Set(roster.map((s) => s.memberId));

      let columnValues: Map<string, number>;
      if (rueda.status === 'completed') {
        // Self-heal: ruedas completed before this feature existed have no
        // stored snapshot yet - compute and persist it on first read. storedByRueda
        // was fetched before this call, so re-derive the same uniform amount
        // snapshotCompletedRueda just persisted instead of relying on the stale map.
        if (!storedByRueda.has(rueda.id)) {
          await this.snapshotCompletedRueda(rueda.id);
          const amount = roster.length * rueda.contributionAmount;
          columnValues = new Map(roster.map((s) => [s.memberId, amount]));
        } else {
          columnValues = storedByRueda.get(rueda.id)!;
        }
      } else {
        // Live real payments plus any frozen buy-in credit from a finalized
        // member replacement (its own "current rueda" bucket was persisted
        // here even though this rueda is still active).
        columnValues = new Map(Object.entries(await this.contributionsAccess.sumPaidContributionsByRueda(rueda.id)));
        const stored = storedByRueda.get(rueda.id);
        if (stored) {
          for (const [memberId, amount] of stored) {
            columnValues.set(memberId, (columnValues.get(memberId) ?? 0) + amount);
          }
        }
      }

      const label = rueda.contributionLabel ?? this.defaultRuedaLabel(rueda.ruedaNumber, rueda.startMonth, rueda.startYear);
      columns.push(new ContributionColumnModel(
        rueda.id, 'rueda', label, rueda.contributionAmount, rosterMemberIds.size, ruedaPosition, rueda.status as 'active' | 'completed',
      ));

      for (const m of sortedMembers) {
        // Normally only roster members (who held a slot) get a value here, but a
        // member can have a real recorded contribution for a rueda without ever
        // holding its slot - e.g. someone who informally took over mid-rueda
        // before the replacements feature existed, corrected directly in the ledger.
        if (rosterMemberIds.has(m.id) || columnValues.has(m.id)) {
          valuesByMember.get(m.id)![rueda.id] = columnValues.get(m.id) ?? 0;
        }
      }
    }

    // Members currently mid buy-in (replacement not finalized yet): show their
    // paid installments distributed live across the columns, so the matrix
    // fills in progressively as they check off cuotas in Reemplazos.
    const activeReplacements = (await this.memberReplacementsAccess.findByGroup(groupId)).filter((r) => r.status === 'active');
    for (const replacement of activeReplacements) {
      const memberValues = valuesByMember.get(replacement.incomingMemberId);
      const currentColumn = columns.find((c) => c.id === replacement.ruedaId);
      if (!memberValues || !currentColumn) continue;

      const schedule = await this.memberReplacementsAccess.findScheduleByReplacement(replacement.id);
      const buckets = this.distributeReplacementPayments(schedule, currentColumn, columns);
      for (const [columnId, amount] of buckets) {
        memberValues[columnId] = amount;
      }
    }

    const rows: MemberContributionRowModel[] = sortedMembers.map((m) => {
      const values = valuesByMember.get(m.id)!;
      const total = Object.values(values).reduce((sum, v) => sum + v, 0);
      return new MemberContributionRowModel(m.id, `${m.firstName} ${m.lastName}`, m.isActive, values, total);
    });

    return new ContributionsMatrixModel(columns, rows);
  }
}
