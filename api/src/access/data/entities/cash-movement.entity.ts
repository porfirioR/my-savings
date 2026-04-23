export interface CashMovementEntity {
  id: string;
  group_id: string;
  movement_type: 'in' | 'out';
  source_type: 'automatic' | 'manual';
  category: string;
  description: string | null;
  amount: number;
  month: number;
  year: number;
  reference_id: string | null;
  created_at: string;
  updated_at: string;
}
