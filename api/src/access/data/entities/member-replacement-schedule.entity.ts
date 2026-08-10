export interface MemberReplacementScheduleEntity {
  id: string;
  replacement_id: string;
  month: number;
  year: number;
  installment_number: number;
  outgoing_amount: number;
  outgoing_paid: boolean;
  outgoing_paid_at: string | null;
  incoming_amount: number;
  incoming_paid: boolean;
  incoming_paid_at: string | null;
  created_at: string;
  updated_at: string;
}
