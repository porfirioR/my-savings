export class ContributionPeriodAccessModel {
  constructor(
    public id: string,
    public groupId: string,
    public name: string,
    public monthlyContributionAmount: number,
    public memberCount: number | null,
    public position: number,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
