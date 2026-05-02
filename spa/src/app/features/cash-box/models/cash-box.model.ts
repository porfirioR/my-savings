export interface CashBalance {
  totalIn: number;
  totalOut: number;
  balance: number;
}

export interface CashMovement {
  id: string;
  groupId: string;
  type: 'in' | 'out';
  sourceType: 'automatic' | 'manual';
  category: string;
  amount: number;
  description?: string;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovementRequest {
  type: 'in' | 'out';
  amount: number;
  description: string;
  category?: string;
  month: number;
  year: number;
}

export interface UpdateMovementRequest {
  type: 'in' | 'out';
  amount: number;
  description: string;
  category: string;
  month: number;
  year: number;
}
