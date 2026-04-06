export interface CashBalance {
  totalIn: number;
  totalOut: number;
  balance: number;
}

export interface CashMovement {
  id: string;
  groupId: string;
  type: 'in' | 'out';
  amount: number;
  description: string;
  category: string | null;
  month: number;
  year: number;
  createdAt: string;
}

export interface CreateMovementRequest {
  type: 'in' | 'out';
  amount: number;
  description: string;
  category?: string;
  month: number;
  year: number;
}
