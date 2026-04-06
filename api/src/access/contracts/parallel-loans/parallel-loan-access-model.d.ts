import { ParallelLoanPaymentAccessModel } from './parallel-loan-payment-access-model';
export declare class ParallelLoanAccessModel {
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
    payments?: ParallelLoanPaymentAccessModel[];
    constructor(id: string, groupId: string, memberId: string, memberName: string, amount: number, interestRate: number, totalToReturn: number, installmentAmount: number, totalInstallments: number, installmentsPaid: number, startMonth: number, startYear: number, status: 'active' | 'completed', createdAt: string, updatedAt: string, endMonth?: number, endYear?: number, payments?: ParallelLoanPaymentAccessModel[]);
    get installmentsRemaining(): number;
}
