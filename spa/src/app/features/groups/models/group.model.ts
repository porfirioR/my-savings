export interface Group {
  id: string;
  name: string;
  startMonth: number;
  startYear: number;
  totalRuedas: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  startMonth: number;
  startYear: number;
}
