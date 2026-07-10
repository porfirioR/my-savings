export class MemberContributionAccessModel {
  constructor(
    public id: string,
    public groupId: string,
    public memberId: string,
    public ruedaId: string | null,
    public contributionPeriodId: string | null,
    public amount: number,
    public description: string | null,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
