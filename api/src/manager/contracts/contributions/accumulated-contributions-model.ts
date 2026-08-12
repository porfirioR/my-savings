export class AccumulatedContributionBreakdownItem {
  constructor(
    public columnId: string,
    public label: string,
    public amount: number,
  ) {}
}

export class AccumulatedContributionsModel {
  constructor(
    public total: number,
    public breakdown: AccumulatedContributionBreakdownItem[],
  ) {}
}
