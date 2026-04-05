export interface CreateMemberAccessRequest {
  groupId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  position: number;
  joinedMonth: number;
  joinedYear: number;
}
