export class CreateContributionPeriodAccessRequest {
  constructor(
    public groupId: string,
    public name: string,
    public monthlyContributionAmount: number,
    public position: number,
    public memberCount?: number,
  ) {}
}
