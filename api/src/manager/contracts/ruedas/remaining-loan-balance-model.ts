export class RemainingLoanBalanceModel {
  constructor(
    public remainingBalance: number,
    public installmentAmount: number,
    public totalInstallments: number,
    public paidInstallments: number,
    public remainingInstallments: number,
    public startMonth: number | null = null,
    public startYear: number | null = null,
    public paidThroughMonth: number | null = null,
    public paidThroughYear: number | null = null,
  ) {}
}
