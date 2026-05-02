export class UpdateParallelLoanRequest {
  constructor(
    public memberId: string,
    public amount: number,
    public interestRate: number,
    public totalInstallments: number,
    public roundingUnit: 0 | 500 | 1000,
    public startMonth: number,
    public startYear: number,
  ) {}
}
