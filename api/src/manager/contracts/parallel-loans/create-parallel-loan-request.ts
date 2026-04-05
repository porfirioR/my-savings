export class CreateParallelLoanRequest {
  constructor(
    public groupId: string,
    public memberId: string,
    public amount: number,
    public interestRate: number,
    public totalInstallments: number,
    public roundingUnit: 500 | 1000,
    public startMonth: number,
    public startYear: number,
  ) {}
}
