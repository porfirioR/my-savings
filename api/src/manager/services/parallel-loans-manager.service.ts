import { Injectable } from '@nestjs/common';
import { CashBoxAccess, ParallelLoansAccess } from '../../access/data/services';
import {
  ParallelLoanAccessModel,
  ParallelLoanPaymentAccessModel,
} from '../../access/contracts/parallel-loans';
import { CreateCashMovementAccessRequest } from '../../access/contracts/cash-box';
import { calculateInstallment } from '../../utility/helpers';
import {
  CreateParallelLoanRequest,
  MarkLoanPaymentRequest,
  ParallelLoanModel,
  ParallelLoanPaymentModel,
  UpdateParallelLoanRequest,
} from '../contracts/parallel-loans';

@Injectable()
export class ParallelLoansManager {
  constructor(
    private readonly parallelLoansAccess: ParallelLoansAccess,
    private readonly cashBoxAccess: CashBoxAccess,
  ) {}

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

  async update(id: string, req: UpdateParallelLoanRequest): Promise<ParallelLoanModel> {
    const interestRateDecimal = req.interestRate / 100;
    const { installmentAmount, totalToReturn } = calculateInstallment(
      req.amount, interestRateDecimal, req.totalInstallments, req.roundingUnit ?? 1000,
    );
    return this.mapToModel(
      await this.parallelLoansAccess.update(id, {
        groupId: '',
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

  async markPayment(groupId: string, paymentId: string, req: MarkLoanPaymentRequest): Promise<ParallelLoanPaymentModel> {
    const { payment, memberName, installmentNumber, totalInstallments } =
      await this.parallelLoansAccess.markPayment(paymentId, req);

    if (req.isPaid) {
      await this.cashBoxAccess.createMovement(new CreateCashMovementAccessRequest(
        groupId,
        'in',
        'automatic',
        'parallel_loan_payment',
        payment.amount,
        payment.month,
        payment.year,
        `Cuota ${installmentNumber}/${totalInstallments} - ${memberName}`,
        paymentId,
      ));
    } else {
      // deleteByReference is a no-op if the cash movement was never created (old payments)
      await this.cashBoxAccess.deleteByReference(groupId, paymentId);
    }

    return this.mapPayment(payment);
  }
}
