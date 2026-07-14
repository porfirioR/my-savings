import { Injectable } from '@nestjs/common';
import { ContributionsAccess, MembersAccess, RuedasAccess } from '../../access/data/services';
import {
  ContributionColumnModel,
  ContributionPeriodModel,
  ContributionsMatrixModel,
  CreateContributionPeriodRequest,
  MemberContributionRowModel,
  UpdateContributionPeriodRequest,
  UpsertManualContributionRequest,
} from '../contracts/contributions';
import { CreateContributionPeriodAccessRequest, UpdateContributionPeriodAccessRequest, UpsertManualContributionAccessRequest } from '../../access/contracts/contributions';

@Injectable()
export class ContributionsManager {
  constructor(
    private readonly contributionsAccess: ContributionsAccess,
    private readonly membersAccess: MembersAccess,
    private readonly ruedasAccess: RuedasAccess,
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

  /** Called right after a rueda transitions into 'completed'. Idempotent. */
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
        // stored snapshot yet - compute and persist it on first read.
        if (!storedByRueda.has(rueda.id)) {
          await this.snapshotCompletedRueda(rueda.id);
        }
        const amount = roster.length * rueda.contributionAmount;
        columnValues = storedByRueda.get(rueda.id) ?? new Map(roster.map((s) => [s.memberId, amount]));
      } else {
        columnValues = new Map(Object.entries(await this.contributionsAccess.sumPaidContributionsByRueda(rueda.id)));
      }

      const label = rueda.contributionLabel ?? this.defaultRuedaLabel(rueda.ruedaNumber, rueda.startMonth, rueda.startYear);
      columns.push(new ContributionColumnModel(
        rueda.id, 'rueda', label, rueda.contributionAmount, rosterMemberIds.size, ruedaPosition, rueda.status as 'active' | 'completed',
      ));

      for (const m of sortedMembers) {
        if (rosterMemberIds.has(m.id)) {
          valuesByMember.get(m.id)![rueda.id] = columnValues.get(m.id) ?? 0;
        }
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
