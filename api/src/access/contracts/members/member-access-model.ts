export interface MemberAccessModel {
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
