export interface MemberContributionEntity {
  id: string;
  group_id: string;
  member_id: string;
  rueda_id: string | null;
  contribution_period_id: string | null;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}
