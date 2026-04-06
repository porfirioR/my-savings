export declare class CreateCashMovementAccessRequest {
    groupId: string;
    movementType: 'in' | 'out';
    sourceType: 'automatic' | 'manual';
    category: string;
    amount: number;
    month: number;
    year: number;
    description?: string;
    referenceId?: string;
    constructor(groupId: string, movementType: 'in' | 'out', sourceType: 'automatic' | 'manual', category: string, amount: number, month: number, year: number, description?: string, referenceId?: string);
}
