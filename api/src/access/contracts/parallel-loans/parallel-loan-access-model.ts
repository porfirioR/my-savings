import { ParallelLoanPaymentAccessModel } from './parallel-loan-payment-access-model';

export class ParallelLoanAccessModel {
  constructor(
    public id: string,
    public groupId: string,
    public memberId: string,
    public memberName: string,
    public amount: number,
    public interestRate: number,
    public totalToReturn: number,
    public installmentAmount: number,
    public totalInstallments: number,
    public installmentsPaid: number,
    public startMonth: number,
    public startYear: number,
    public status: 'active' | 'completed',
    public createdAt: string,
    public updatedAt: string,
    public endMonth?: number,
    public endYear?: number,
    public payments?: ParallelLoanPaymentAccessModel[],
  ) {}

  get installmentsRemaining(): number {
    return this.totalInstallments - this.installmentsPaid;
  }
}
