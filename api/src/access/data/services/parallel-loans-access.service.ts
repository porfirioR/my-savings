import { Injectable } from '@nestjs/common';
import { BaseAccessService, DbContextService } from '.';
import { ParallelLoanEntity, ParallelLoanPaymentEntity } from '../entities';
import {
  CreateParallelLoanAccessRequest,
  MarkLoanPaymentAccessRequest,
  ParallelLoanAccessModel,
  ParallelLoanPaymentAccessModel,
} from '../../contracts/parallel-loans';

@Injectable()
export class ParallelLoansAccess extends BaseAccessService {
  constructor(dbContextService: DbContextService) {
    super(dbContextService);
  }

  private mapPayment(e: ParallelLoanPaymentEntity): ParallelLoanPaymentAccessModel {
    return new ParallelLoanPaymentAccessModel(
      e.id, e.parallel_loan_id, e.month, e.year,
      e.amount, e.is_paid, e.created_at, e.paid_at ?? undefined,
    );
  }

  private mapToModel(
    e: ParallelLoanEntity & { members?: { first_name: string; last_name: string } },
    payments?: ParallelLoanPaymentAccessModel[],
  ): ParallelLoanAccessModel {
    const memberName = e.members
      ? `${e.members.first_name} ${e.members.last_name}`
      : '';
    return new ParallelLoanAccessModel(
      e.id, e.group_id, e.member_id, memberName,
      e.amount, e.interest_rate, e.total_to_return,
      e.installment_amount, e.total_installments, e.installments_paid,
      e.start_month, e.start_year, e.status, e.created_at, e.updated_at,
      e.end_month ?? undefined, e.end_year ?? undefined, payments,
    );
  }

  async findByGroup(groupId: string): Promise<ParallelLoanAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('parallel_loans')
      .select('*, members(first_name, last_name)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as any[]).map(e => this.mapToModel(e));
  }

  async findById(id: string): Promise<ParallelLoanAccessModel> {
    const { data, error } = await this.dbContext
      .from('parallel_loans')
      .select('*, members(first_name, last_name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    const payments = await this.getPayments(id);
    return this.mapToModel(data as any, payments);
  }

  async create(req: CreateParallelLoanAccessRequest): Promise<ParallelLoanAccessModel> {
    const { data, error } = await this.dbContext
      .from('parallel_loans')
      .insert({
        group_id: req.groupId,
        member_id: req.memberId,
        amount: req.amount,
        interest_rate: req.interestRate,
        total_to_return: req.totalToReturn,
        installment_amount: req.installmentAmount,
        total_installments: req.totalInstallments,
        installments_paid: 0,
        start_month: req.startMonth,
        start_year: req.startYear,
        status: 'active',
      })
      .select('*, members(first_name, last_name)')
      .single();

    if (error) throw new Error(error.message);
    const loan = this.mapToModel(data as any);

    // Generate payment schedule
    const schedule = Array.from({ length: req.totalInstallments }, (_, i) => {
      const totalOffset = req.startMonth - 1 + i;
      return {
        parallel_loan_id: loan.id,
        month: (totalOffset % 12) + 1,
        year: req.startYear + Math.floor(totalOffset / 12),
        amount: req.installmentAmount,
        is_paid: false,
      };
    });

    await this.dbContext.from('parallel_loan_payments').insert(schedule);
    return this.findById(loan.id);
  }

  async getPayments(loanId: string): Promise<ParallelLoanPaymentAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('parallel_loan_payments')
      .select('*')
      .eq('parallel_loan_id', loanId)
      .order('year')
      .order('month');

    if (error) throw new Error(error.message);
    return (data as ParallelLoanPaymentEntity[]).map(e => this.mapPayment(e));
  }

  async markPayment(
    paymentId: string,
    req: MarkLoanPaymentAccessRequest,
  ): Promise<ParallelLoanPaymentAccessModel> {
    const { data, error } = await this.dbContext
      .from('parallel_loan_payments')
      .update({
        is_paid: req.isPaid,
        paid_at: req.isPaid ? new Date().toISOString() : null,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    const payment = data as ParallelLoanPaymentEntity;

    // Update installments_paid count and status on the loan
    const { data: countData } = await this.dbContext
      .from('parallel_loan_payments')
      .select('id', { count: 'exact' })
      .eq('parallel_loan_id', payment.parallel_loan_id)
      .eq('is_paid', true);

    const paidCount = (countData as any[])?.length ?? 0;

    const { data: loanData } = await this.dbContext
      .from('parallel_loans')
      .select('total_installments')
      .eq('id', payment.parallel_loan_id)
      .single();

    const total = (loanData as any)?.total_installments ?? 0;
    const newStatus = paidCount >= total ? 'completed' : 'active';

    await this.dbContext
      .from('parallel_loans')
      .update({ installments_paid: paidCount, status: newStatus })
      .eq('id', payment.parallel_loan_id);

    return this.mapPayment(payment);
  }
}
