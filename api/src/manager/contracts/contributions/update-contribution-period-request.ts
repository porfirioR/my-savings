export class UpdateContributionPeriodRequest {
  constructor(
    public name?: string,
    public monthlyContributionAmount?: number,
    public memberCount?: number,
    public position?: number,
  ) {}
}
