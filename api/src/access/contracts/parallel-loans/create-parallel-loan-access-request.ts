export class CreateParallelLoanAccessRequest {
  constructor(
    public groupId: string,
    public memberId: string,
    public amount: number,
    public interestRate: number,
    public totalToReturn: number,
    public installmentAmount: number,
    public totalInstallments: number,
    public startMonth: number,
    public startYear: number,
  ) {}
}
