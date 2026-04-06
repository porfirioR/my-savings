export declare class CreateCashMovementApiRequest {
    movementType: 'in' | 'out';
    sourceType: 'automatic' | 'manual';
    category: string;
    amount: number;
    month: number;
    year: number;
    description?: string;
    constructor(partial?: Partial<CreateCashMovementApiRequest>);
}
