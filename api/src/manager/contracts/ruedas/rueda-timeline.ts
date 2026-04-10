export interface RuedaTimelinePayment {
  slotPosition: number;
  memberId: string;
  memberName: string;
  type: 'contribution' | 'installment';
  amount: number;
}

export interface RuedaTimelineMonth {
  position: number;
  calendarMonth: number;
  calendarYear: number;
  disbursedToMemberId: string;
  disbursedToMemberName: string;
  disbursedAmount: number;
  totalCollected: number;
  payments: RuedaTimelinePayment[];
}
