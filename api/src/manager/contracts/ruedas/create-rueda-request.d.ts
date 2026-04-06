export declare class CreateRuedaSlotRequest {
    memberId: string;
    slotPosition: number;
    loanAmount?: number;
    constructor(memberId: string, slotPosition: number, loanAmount?: number);
}
export declare class CreateRuedaRequest {
    groupId: string;
    type: 'new' | 'continua';
    loanAmount: number;
    interestRate: number;
    contributionAmount: number;
    roundingUnit: 500 | 1000;
    startMonth: number;
    startYear: number;
    slots: CreateRuedaSlotRequest[];
    historicalContributionTotal?: number;
    notes?: string;
    constructor(groupId: string, type: 'new' | 'continua', loanAmount: number, interestRate: number, contributionAmount: number, roundingUnit: 500 | 1000, startMonth: number, startYear: number, slots: CreateRuedaSlotRequest[], historicalContributionTotal?: number, notes?: string);
}
