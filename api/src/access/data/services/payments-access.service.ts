import { BadRequestException, Injectable } from '@nestjs/common';
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
    if (rueda.status !== 'active') {
      throw new BadRequestException('RUEDA_NOT_ACTIVE');
    }

    const slots: any[] = rueda.rueda_slots ?? [];

    // Calculate current month index within the rueda (1-based)
    const startMonth: number = rueda.start_month;
    const startYear: number = rueda.start_year;
    const currentMonthIndex =
      (req.year - startYear) * 12 + (req.month - startMonth) + 1;

    const records = slots.map((slot: any) => {
      const paymentType = resolvePaymentType(
        rueda.type,
        rueda.slot_amount_mode ?? 'constant',
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

  async getDisbursementInfo(
    ruedaId: string,
    month: number,
    year: number,
  ): Promise<{ groupId: string; memberId: string; loanAmount: number; ruedaNumber: number } | null> {
    const { data, error } = await this.dbContext
      .from('ruedas')
      .select('group_id, rueda_number, start_month, start_year, loan_amount, rueda_slots(slot_position, member_id, loan_amount)')
      .eq('id', ruedaId)
      .single();

    if (error || !data) return null;

    const rueda = data as any;
    const currentMonthIndex = (year - rueda.start_year) * 12 + (month - rueda.start_month) + 1;
    const disbursedSlot = (rueda.rueda_slots as any[]).find(
      (s: any) => s.slot_position === currentMonthIndex,
    );

    if (!disbursedSlot) return null;

    return {
      groupId: rueda.group_id,
      memberId: disbursedSlot.member_id,
      loanAmount: disbursedSlot.loan_amount ?? rueda.loan_amount,
      ruedaNumber: rueda.rueda_number,
    };
  }

  async checkMonthCompletion(
    ruedaId: string,
    month: number,
    year: number,
  ): Promise<{ allPaid: boolean; difference: number; totalCollected: number; ruedaNumber: number; groupId: string } | null> {
    const { data, error } = await this.dbContext
      .from('rueda_monthly_payments')
      .select('is_paid, total_amount_due, ruedas(rueda_number, group_id, loan_amount, start_month, start_year, slot_amount_mode, rueda_slots(slot_position, loan_amount))')
      .eq('rueda_id', ruedaId)
      .eq('month', month)
      .eq('year', year);

    if (error || !data || (data as any[]).length === 0) return null;

    const rows = data as any[];
    const allPaid = rows.every((r) => r.is_paid);
    const totalCollected = rows.reduce((s: number, r: any) => s + (r.total_amount_due ?? 0), 0);
    const rueda = rows[0].ruedas;
    const ruedaNumber: number = rueda?.rueda_number ?? 0;
    const groupId: string = rueda?.group_id ?? '';

    let loanAmount: number;
    if (rueda?.slot_amount_mode === 'variable') {
      const startMonth: number = rueda.start_month ?? month;
      const startYear: number = rueda.start_year ?? year;
      const currentMonthIndex = (year - startYear) * 12 + (month - startMonth) + 1;
      const activeSlot = (rueda.rueda_slots as any[] ?? []).find(
        (s: any) => s.slot_position === currentMonthIndex,
      );
      loanAmount = activeSlot?.loan_amount ?? rueda?.loan_amount ?? 0;
    } else {
      loanAmount = rueda?.loan_amount ?? 0;
    }

    const difference = loanAmount - totalCollected;

    return { allPaid, difference, totalCollected, ruedaNumber, groupId };
  }

  async checkRuedaFullyPaid(ruedaId: string): Promise<{ groupId: string; endMonth: number | null; endYear: number | null } | null> {
    // Count slots (N = member count)
    const { count: slotCount, error: slotError } = await this.dbContext
      .from('rueda_slots')
      .select('id', { count: 'exact', head: true })
      .eq('rueda_id', ruedaId);

    if (slotError) throw new Error(slotError.message);
    const requiredLists = slotCount ?? 0;
    if (requiredLists === 0) {
      console.log(`[checkRuedaFullyPaid] No slots found for rueda ${ruedaId}`);
      return null;
    }

    // Get all generated payments + rueda status
    const { data, error } = await this.dbContext
      .from('rueda_monthly_payments')
      .select('month, year, is_paid, ruedas!inner(group_id, status)')
      .eq('rueda_id', ruedaId);

    if (error) throw new Error(error.message);
    if (!data || (data as any[]).length === 0) {
      console.log(`[checkRuedaFullyPaid] No payments found for rueda ${ruedaId}`);
      return null;
    }

    const rueda = (data[0] as any).ruedas;
    if (rueda?.status !== 'active') {
      console.log(`[checkRuedaFullyPaid] Rueda status is not active: ${rueda?.status}`);
      return null;
    }

    // All N lists must be generated (distinct month/year combos = member count)
    const distinctMonths = new Set((data as any[]).map((p: any) => `${p.month}/${p.year}`)).size;
    console.log(`[checkRuedaFullyPaid] requiredLists=${requiredLists}, distinctMonths=${distinctMonths}, needed=${requiredLists}`);
    if (distinctMonths !== requiredLists) {
      console.log(`[checkRuedaFullyPaid] Not enough months: ${distinctMonths} !== ${requiredLists}`);
      return null;
    }

    // Every payment in every generated list must be paid
    const allPaid = (data as any[]).every((p: any) => p.is_paid);
    if (!allPaid) {
      const unpaidCount = (data as any[]).filter((p: any) => !p.is_paid).length;
      console.log(`[checkRuedaFullyPaid] Not all paid: ${unpaidCount} payments still unpaid`);
      return null;
    }
    console.log(`[checkRuedaFullyPaid] ✓ Rueda ${ruedaId} is fully paid - auto-completing`);

    // Get last slot's loan_month/year to calculate the end date (final junta = last slot + 1 month)
    const { data: lastSlotData, error: lsErr } = await this.dbContext
      .from('rueda_slots')
      .select('loan_month, loan_year')
      .eq('rueda_id', ruedaId)
      .order('slot_position', { ascending: false })
      .limit(1);

    if (lsErr) throw new Error(lsErr.message);
    const ls = (lastSlotData as any[])?.[0];
    const endMonth = ls ? (ls.loan_month === 12 ? 1 : ls.loan_month + 1) : null;
    const endYear  = ls ? (ls.loan_month === 12 ? ls.loan_year + 1 : ls.loan_year) : null;

    return { groupId: rueda.group_id, endMonth, endYear };
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
