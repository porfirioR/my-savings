export declare class CreateParallelLoanApiRequest {
    memberId: string;
    amount: number;
    interestRate: number;
    totalInstallments: number;
    roundingUnit: 500 | 1000;
    startMonth: number;
    startYear: number;
    constructor(partial?: Partial<CreateParallelLoanApiRequest>);
}
