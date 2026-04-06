export declare class PaymentModel {
    id: string;
    ruedaId: string;
    memberId: string;
    memberName: string;
    month: number;
    year: number;
    installmentAmountDue: number;
    contributionAmountDue: number;
    totalAmountDue: number;
    installmentNumber: number;
    paymentType: 'current_rueda' | 'previous_rueda' | 'contribution_only';
    isPaid: boolean;
    paymentSource: 'member' | 'cash_box' | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    constructor(id: string, ruedaId: string, memberId: string, memberName: string, month: number, year: number, installmentAmountDue: number, contributionAmountDue: number, totalAmountDue: number, installmentNumber: number, paymentType: 'current_rueda' | 'previous_rueda' | 'contribution_only', isPaid: boolean, paymentSource: 'member' | 'cash_box' | null, notes: string | null, createdAt: string, updatedAt: string);
}
