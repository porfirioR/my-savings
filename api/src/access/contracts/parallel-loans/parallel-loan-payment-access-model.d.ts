export declare class ParallelLoanPaymentAccessModel {
    id: string;
    parallelLoanId: string;
    month: number;
    year: number;
    amount: number;
    isPaid: boolean;
    createdAt: string;
    paidAt?: string;
    constructor(id: string, parallelLoanId: string, month: number, year: number, amount: number, isPaid: boolean, createdAt: string, paidAt?: string);
}
