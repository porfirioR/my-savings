export interface RuedaTimelinePayment {
  slotPosition: number;
  memberId: string;
  memberName: string;
  /** 'current_rueda' | 'previous_rueda' | 'contribution_only' */
  paymentType: 'current_rueda' | 'previous_rueda' | 'contribution_only';
  amount: number;
  /** Installment number (1-15). 0 = no loan yet (new rueda, pre-disbursement). */
  cuotaNumber: number;
  /** True if a payment record exists and is_paid=true for this member/month. */
  isPaid: boolean;
  /** True if a payment record exists (whether paid or not). */
  hasPaymentRecord: boolean;
}

export interface RuedaTimelineMonth {
  position: number;
  calendarMonth: number;
  calendarYear: number;
  /** Null on the final "next junta" page (position 16) — no disbursement */
  disbursedToMemberId: string | null;
  disbursedToMemberName: string | null;
  disbursedAmount: number;
  totalCollected: number;
  payments: RuedaTimelinePayment[];
}
