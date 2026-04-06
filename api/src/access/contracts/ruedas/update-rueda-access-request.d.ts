export declare class UpdateRuedaAccessRequest {
    loanAmount?: number;
    interestRate?: number;
    contributionAmount?: number;
    installmentAmount?: number;
    totalToReturn?: number;
    roundingUnit?: 500 | 1000;
    startMonth?: number;
    startYear?: number;
    endMonth?: number;
    endYear?: number;
    status?: 'pending' | 'active' | 'completed';
    historicalContributionTotal?: number;
    notes?: string;
    constructor(loanAmount?: number, interestRate?: number, contributionAmount?: number, installmentAmount?: number, totalToReturn?: number, roundingUnit?: 500 | 1000, startMonth?: number, startYear?: number, endMonth?: number, endYear?: number, status?: 'pending' | 'active' | 'completed', historicalContributionTotal?: number, notes?: string);
}
