export interface MemberReplacementEntity {
  id: string;
  group_id: string;
  rueda_id: string;
  slot_position: number;
  outgoing_member_id: string;
  outgoing_monthly_amount: number;
  incoming_member_id: string;
  incoming_total_amount: number;
  incoming_installments: number;
  status: 'active' | 'completed';
  created_at: string;
  updated_at: string;
}
