export interface ContributionPeriodEntity {
  id: string;
  group_id: string;
  name: string;
  monthly_contribution_amount: number;
  member_count: number | null;
  position: number;
  created_at: string;
  updated_at: string;
}
