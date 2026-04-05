export class ParallelLoanPaymentModel {
  constructor(
    public id: string,
    public parallelLoanId: string,
    public month: number,
    public year: number,
    public amount: number,
    public isPaid: boolean,
    public createdAt: string,
    public paidAt?: string,
  ) {}
}
