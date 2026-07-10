export class ContributionColumnModel {
  constructor(
    public id: string,
    public type: 'rueda' | 'manual',
    public label: string,
    public monthlyAmount: number,
    public memberCount: number | null,
    public position: number,
    public status?: 'active' | 'completed',
  ) {}
}

export class MemberContributionRowModel {
  constructor(
    public memberId: string,
    public memberName: string,
    public isActive: boolean,
    public values: Record<string, number>,
    public total: number,
  ) {}
}

export class ContributionsMatrixModel {
  constructor(
    public columns: ContributionColumnModel[],
    public rows: MemberContributionRowModel[],
  ) {}
}
