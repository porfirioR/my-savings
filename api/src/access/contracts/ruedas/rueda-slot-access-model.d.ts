export declare class RuedaSlotAccessModel {
    id: string;
    ruedaId: string;
    memberId: string;
    slotPosition: number;
    loanAmount: number;
    installmentAmount: number;
    totalToReturn: number;
    loanMonth: number;
    loanYear: number;
    status: 'pending' | 'active' | 'completed';
    createdAt: string;
    updatedAt: string;
    memberName?: string;
    constructor(id: string, ruedaId: string, memberId: string, slotPosition: number, loanAmount: number, installmentAmount: number, totalToReturn: number, loanMonth: number, loanYear: number, status: 'pending' | 'active' | 'completed', createdAt: string, updatedAt: string, memberName?: string);
}
