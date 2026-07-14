export class UpsertManualContributionAccessRequest {
  constructor(
    public groupId: string,
    public memberId: string,
    public contributionPeriodId: string,
    public amount: number,
    public description?: string | null,
  ) {}
}
