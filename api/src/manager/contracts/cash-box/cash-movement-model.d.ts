export declare class CashMovementModel {
    id: string;
    groupId: string;
    movementType: 'in' | 'out';
    sourceType: 'automatic' | 'manual';
    category: string;
    amount: number;
    month: number;
    year: number;
    createdAt: string;
    updatedAt: string;
    description?: string;
    referenceId?: string;
    constructor(id: string, groupId: string, movementType: 'in' | 'out', sourceType: 'automatic' | 'manual', category: string, amount: number, month: number, year: number, createdAt: string, updatedAt: string, description?: string, referenceId?: string);
}
