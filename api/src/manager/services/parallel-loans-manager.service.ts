import { Injectable } from '@nestjs/common';
import { ParallelLoansAccess } from '../../access/data/services';
import {
  ParallelLoanAccessModel,
  ParallelLoanPaymentAccessModel,
} from '../../access/contracts/parallel-loans';
import { calculateInstallment } from '../../utility/helpers';
import {
  CreateParallelLoanRequest,
  MarkLoanPaymentRequest,
  ParallelLoanModel,
  ParallelLoanPaymentModel,
} from '../contracts/parallel-loans';

@Injectable()
export class ParallelLoansManager {
  constructor(private readonly parallelLoansAccess: ParallelLoansAccess) {}

  private mapPayment(a: ParallelLoanPaymentAccessModel): ParallelLoanPaymentModel {
    return new ParallelLoanPaymentModel(
      a.id, a.parallelLoanId, a.month, a.year,
      a.amount, a.isPaid ? 'paid' : 'pending', a.paidAt ?? null, a.createdAt,
    );
  }

  private mapToModel(a: ParallelLoanAccessModel): ParallelLoanModel {
    return new ParallelLoanModel(
      a.id, a.groupId, a.memberId, a.memberName,
      a.amount, a.interestRate * 100, a.totalToReturn,
      a.installmentAmount, a.totalInstallments, a.installmentsPaid,
      a.startMonth, a.startYear, a.status, a.createdAt, a.updatedAt,
      a.endMonth, a.endYear,
      a.payments?.map(p => this.mapPayment(p)),
    );
  }

  async findByGroup(groupId: string): Promise<ParallelLoanModel[]> {
    return (await this.parallelLoansAccess.findByGroup(groupId)).map(m => this.mapToModel(m));
  }

  async findById(id: string): Promise<ParallelLoanModel> {
    return this.mapToModel(await this.parallelLoansAccess.findById(id));
  }

  async create(req: CreateParallelLoanRequest): Promise<ParallelLoanModel> {
    const interestRateDecimal = req.interestRate / 100;
    const { installmentAmount, totalToReturn } = calculateInstallment(
      req.amount, interestRateDecimal, req.totalInstallments, req.roundingUnit ?? 1000,
    );
    return this.mapToModel(
      await this.parallelLoansAccess.create({
        groupId: req.groupId,
        memberId: req.memberId,
        amount: req.amount,
        interestRate: interestRateDecimal,
        totalToReturn,
        installmentAmount,
        totalInstallments: req.totalInstallments,
        startMonth: req.startMonth,
        startYear: req.startYear,
      }),
    );
  }

  async getPayments(loanId: string): Promise<ParallelLoanPaymentModel[]> {
    return (await this.parallelLoansAccess.getPayments(loanId)).map(p => this.mapPayment(p));
  }

  async markPayment(paymentId: string, req: MarkLoanPaymentRequest): Promise<ParallelLoanPaymentModel> {
    return this.mapPayment(await this.parallelLoansAccess.markPayment(paymentId, req));
  }
}
