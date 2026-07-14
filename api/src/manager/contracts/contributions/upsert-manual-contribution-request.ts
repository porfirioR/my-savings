export class UpsertManualContributionRequest {
  constructor(
    public memberId: string,
    public contributionPeriodId: string,
    public amount: number,
    public description?: string | null,
  ) {}
}
