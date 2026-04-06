export interface Member {
  id: string;
  groupId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  position: number;
  isActive: boolean;
  joinedMonth: number;
  joinedYear: number;
  leftMonth: number | null;
  leftYear: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  position: number;
  joinedMonth: number;
  joinedYear: number;
}

export interface ExitMemberRequest {
  leftMonth: number;
  leftYear: number;
  accumulatedContributions: number;
  remainingLoanBalance: number;
}
