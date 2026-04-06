import { ParallelLoanPaymentModel } from './parallel-loan-payment-model';
export declare class ParallelLoanModel {
    id: string;
    groupId: string;
    memberId: string;
    memberName: string;
    amount: number;
    interestRate: number;
    totalToReturn: number;
    installmentAmount: number;
    totalInstallments: number;
    installmentsPaid: number;
    startMonth: number;
    startYear: number;
    status: 'active' | 'completed';
    createdAt: string;
    updatedAt: string;
    endMonth?: number;
    endYear?: number;
    payments?: ParallelLoanPaymentModel[];
    constructor(id: string, groupId: string, memberId: string, memberName: string, amount: number, interestRate: number, totalToReturn: number, installmentAmount: number, totalInstallments: number, installmentsPaid: number, startMonth: number, startYear: number, status: 'active' | 'completed', createdAt: string, updatedAt: string, endMonth?: number, endYear?: number, payments?: ParallelLoanPaymentModel[]);
    get installmentsRemaining(): number;
}
