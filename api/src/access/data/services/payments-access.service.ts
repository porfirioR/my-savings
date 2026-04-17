import { Injectable } from '@nestjs/common';
import { BaseAccessService, DbContextService } from '.';
import { RuedaMonthlyPaymentEntity } from '../entities';
import { GeneratePaymentsAccessRequest, MarkPaymentAccessRequest, PaymentAccessModel } from '../../../access/contracts/payments';
import { resolvePaymentType } from '../../../utility/helpers';


@Injectable()
export class PaymentsAccess extends BaseAccessService {
  constructor(dbContextService: DbContextService) {
    super(dbContextService);
  }

  private mapToModel(
    entity: RuedaMonthlyPaymentEntity & { members?: { first_name: string; last_name: string } },
  ): PaymentAccessModel {
    return {
      id: entity.id,
      ruedaId: entity.rueda_id,
      memberId: entity.member_id,
      memberName: entity.members
        ? `${entity.members.first_name} ${entity.members.last_name}`
        : '',
      month: entity.month,
      year: entity.year,
      installmentAmountDue: entity.installment_amount_due,
      contributionAmountDue: entity.contribution_amount_due,
      totalAmountDue: entity.total_amount_due,
      installmentNumber: entity.installment_number,
      paymentType: entity.payment_type,
      isPaid: entity.is_paid,
      paidAt: entity.paid_at,
      paymentSource: entity.payment_source,
      notes: entity.notes,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  async findByRuedaAndMonth(
    ruedaId: string,
    month: number,
    year: number,
  ): Promise<PaymentAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('rueda_monthly_payments')
      .select('*, members(first_name, last_name)')
      .eq('rueda_id', ruedaId)
      .eq('month', month)
      .eq('year', year)
      .order('installment_number', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as any[]).map((e) => this.mapToModel(e));
  }

  async findById(id: string): Promise<PaymentAccessModel> {
    const { data, error } = await this.dbContext
      .from('rueda_monthly_payments')
      .select('*, members(first_name, last_name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as any);
  }

  async generateMonthlyPayments(
    req: GeneratePaymentsAccessRequest,
  ): Promise<PaymentAccessModel[]> {
    // Fetch rueda info
    const { data: ruedaData, error: ruedaError } = await this.dbContext
      .from('ruedas')
      .select('*, rueda_slots(*, members(first_name, last_name))')
      .eq('id', req.ruedaId)
      .single();

    if (ruedaError) throw new Error(ruedaError.message);

    const rueda = ruedaData as any;
    const slots: any[] = rueda.rueda_slots ?? [];

    // Calculate current month index within the rueda (1-based)
    const startMonth: number = rueda.start_month;
    const startYear: number = rueda.start_year;
    const currentMonthIndex =
      (req.year - startYear) * 12 + (req.month - startMonth) + 1;

    const records = slots.map((slot: any) => {
      const paymentType = resolvePaymentType(
        rueda.type,
        slot.slot_position,
        currentMonthIndex,
      );

      // previous_rueda: member hasn't received current rueda loan yet — pays previous installment only (no contribution)
      // current_rueda:  member already received — pays current installment + contribution
      // contribution_only: new rueda, no loan yet — pays contribution only
      let installmentAmountDue: number;
      let contributionAmountDue: number;

      if (paymentType === 'previous_rueda') {
        installmentAmountDue = slot.previous_loan_amount ?? slot.installment_amount;
        contributionAmountDue = rueda.contribution_amount;
      } else if (paymentType === 'current_rueda') {
        installmentAmountDue = slot.installment_amount;
        contributionAmountDue = rueda.contribution_amount;
      } else {
        // contribution_only
        installmentAmountDue = 0;
        contributionAmountDue = rueda.contribution_amount;
      }

      const totalAmountDue = installmentAmountDue + contributionAmountDue;

      return {
        rueda_id: req.ruedaId,
        member_id: slot.member_id,
        month: req.month,
        year: req.year,
        installment_amount_due: installmentAmountDue,
        contribution_amount_due: contributionAmountDue,
        total_amount_due: totalAmountDue,
        installment_number: slot.slot_position,
        payment_type: paymentType,
        is_paid: false,
        payment_source: null,
        notes: null,
      };
    });

    const { data, error } = await this.dbContext
      .from('rueda_monthly_payments')
      .upsert(records, { onConflict: 'rueda_id,member_id,month,year', ignoreDuplicates: false })
      .select('*, members(first_name, last_name)');

    if (error) throw new Error(error.message);
    return (data as any[]).map((e) => this.mapToModel(e));
  }

  async checkMonthCompletion(
    ruedaId: string,
    month: number,
    year: number,
  ): Promise<{ allPaid: boolean; difference: number; ruedaNumber: number; groupId: string } | null> {
    const { data, error } = await this.dbContext
      .from('rueda_monthly_payments')
      .select('is_paid, total_amount_due, ruedas(rueda_number, group_id, loan_amount)')
      .eq('rueda_id', ruedaId)
      .eq('month', month)
      .eq('year', year);

    if (error || !data || (data as any[]).length === 0) return null;

    const rows = data as any[];
    const allPaid = rows.every((r) => r.is_paid);
    const totalCollected = rows.reduce((s: number, r: any) => s + (r.total_amount_due ?? 0), 0);
    const loanAmount: number = rows[0].ruedas?.loan_amount ?? 0;
    const ruedaNumber: number = rows[0].ruedas?.rueda_number ?? 0;
    const groupId: string = rows[0].ruedas?.group_id ?? '';
    const difference = loanAmount - totalCollected;

    return { allPaid, difference, ruedaNumber, groupId };
  }

  async markPayment(
    id: string,
    req: MarkPaymentAccessRequest,
  ): Promise<PaymentAccessModel> {
    const { data, error } = await this.dbContext
      .from('rueda_monthly_payments')
      .update({
        is_paid: req.isPaid,
        paid_at: req.isPaid ? new Date().toISOString() : null,
        payment_source: req.paymentSource ?? null,
      })
      .eq('id', id)
      .select('*, members(first_name, last_name)')
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as any);
  }
}
