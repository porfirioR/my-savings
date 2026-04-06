export declare class CreateParallelLoanAccessRequest {
    groupId: string;
    memberId: string;
    amount: number;
    interestRate: number;
    totalToReturn: number;
    installmentAmount: number;
    totalInstallments: number;
    startMonth: number;
    startYear: number;
    constructor(groupId: string, memberId: string, amount: number, interestRate: number, totalToReturn: number, installmentAmount: number, totalInstallments: number, startMonth: number, startYear: number);
}
