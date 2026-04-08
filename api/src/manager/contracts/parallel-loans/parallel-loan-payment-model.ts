export class ParallelLoanPaymentModel {
  constructor(
    public id: string,
    public loanId: string,
    public month: number,
    public year: number,
    public amount: number,
    public status: 'paid' | 'pending',
    public paidAt: string | null,
    public createdAt: string,
    public updatedAt?: string,
  ) {}
}
