export declare class CreateRuedaSlotApiRequest {
    memberId: string;
    slotPosition: number;
    loanAmount?: number;
}
export declare class CreateRuedaApiRequest {
    type: 'new' | 'continua';
    loanAmount: number;
    interestRate: number;
    contributionAmount: number;
    roundingUnit: 500 | 1000;
    startMonth: number;
    startYear: number;
    historicalContributionTotal?: number;
    notes?: string;
    slots: CreateRuedaSlotApiRequest[];
}
