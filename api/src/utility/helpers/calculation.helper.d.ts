import { RoundingUnit } from '../enums';
export interface InstallmentCalculation {
    loanAmount: number;
    totalToReturn: number;
    installmentAmount: number;
    actualInterestRate: number;
}
export declare function calculateInstallment(loanAmount: number, interestRate: number, months: number, roundingUnit?: RoundingUnit): InstallmentCalculation;
export declare function roundToUnit(amount: number, unit: number): number;
export declare function calculateAccumulatedContributions(contributionAmount: number, monthsParticipated: number): number;
export declare function monthsBetween(startMonth: number, startYear: number, endMonth: number, endYear: number): number;
export declare function calculateMemberExitSettlement(accumulatedContributions: number, remainingLoanBalance: number): {
    memberReceives: number;
    memberPays: number;
};
export declare function resolvePaymentType(ruedaNumber: number, slotPosition: number, currentMonthIndex: number): 'current_rueda' | 'previous_rueda' | 'contribution_only';
