export interface RuedaEntity {
  id: string;
  group_id: string;
  rueda_number: number;
  type: 'new' | 'continua';
  loan_amount: number;
  interest_rate: number;
  contribution_amount: number;
  installment_amount: number;
  total_to_return: number;
  rounding_unit: 500 | 1000;
  start_month: number;
  start_year: number;
  end_month: number | null;
  end_year: number | null;
  status: 'pending' | 'active' | 'completed';
  historical_contribution_total: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
