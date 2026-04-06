export declare class CreateRuedaAccessRequest {
    groupId: string;
    ruedaNumber: number;
    type: 'new' | 'continua';
    loanAmount: number;
    interestRate: number;
    contributionAmount: number;
    installmentAmount: number;
    totalToReturn: number;
    roundingUnit: 500 | 1000;
    startMonth: number;
    startYear: number;
    status: 'pending' | 'active' | 'completed';
    historicalContributionTotal?: number;
    notes?: string;
    constructor(groupId: string, ruedaNumber: number, type: 'new' | 'continua', loanAmount: number, interestRate: number, contributionAmount: number, installmentAmount: number, totalToReturn: number, roundingUnit: 500 | 1000, startMonth: number, startYear: number, status: 'pending' | 'active' | 'completed', historicalContributionTotal?: number, notes?: string);
}
