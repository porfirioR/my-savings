export declare class CreateParallelLoanRequest {
    groupId: string;
    memberId: string;
    amount: number;
    interestRate: number;
    totalInstallments: number;
    roundingUnit: 500 | 1000;
    startMonth: number;
    startYear: number;
    constructor(groupId: string, memberId: string, amount: number, interestRate: number, totalInstallments: number, roundingUnit: 500 | 1000, startMonth: number, startYear: number);
}
