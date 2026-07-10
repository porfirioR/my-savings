export interface ContributionColumn {
  id: string;
  type: 'rueda' | 'manual';
  label: string;
  monthlyAmount: number;
  memberCount: number | null;
  position: number;
  status?: 'active' | 'completed';
}

export interface MemberContributionRow {
  memberId: string;
  memberName: string;
  isActive: boolean;
  values: Record<string, number>;
  total: number;
}

export interface ContributionsMatrix {
  columns: ContributionColumn[];
  rows: MemberContributionRow[];
}

export interface ContributionPeriod {
  id: string;
  groupId: string;
  name: string;
  monthlyContributionAmount: number;
  memberCount: number | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContributionPeriodRequest {
  name: string;
  monthlyContributionAmount: number;
  position: number;
  memberCount?: number;
}

export interface UpdateContributionPeriodRequest {
  name?: string;
  monthlyContributionAmount?: number;
  memberCount?: number;
  position?: number;
}

export interface UpsertManualContributionRequest {
  memberId: string;
  contributionPeriodId: string;
  amount: number;
  description?: string;
}
