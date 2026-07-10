export class UpdateContributionPeriodAccessRequest {
  constructor(
    public name?: string,
    public monthlyContributionAmount?: number,
    public memberCount?: number,
    public position?: number,
  ) {}
}
