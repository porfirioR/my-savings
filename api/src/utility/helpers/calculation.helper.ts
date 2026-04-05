import { RoundingUnit } from '../enums';

export interface InstallmentCalculation {
  loanAmount: number;
  totalToReturn: number;
  installmentAmount: number;
  actualInterestRate: number;
}

/**
 * Calculates rueda installment amounts.
 * Interest is flat on the total (e.g. 5% on 3,000,000 = 3,150,000 / 15 = 210,000).
 * All amounts are rounded to the nearest rounding unit (500 or 1000 PYG).
 */
export function calculateInstallment(
  loanAmount: number,
  interestRate: number,
  months: number,
  roundingUnit: RoundingUnit = RoundingUnit.OneThousand,
): InstallmentCalculation {
  const rawTotal = loanAmount * (1 + interestRate);
  const totalToReturn = roundToUnit(rawTotal, roundingUnit);
  const installmentAmount = roundToUnit(totalToReturn / months, roundingUnit);
  const actualTotalToReturn = installmentAmount * months;
  const actualInterestRate = (actualTotalToReturn - loanAmount) / loanAmount;

  return {
    loanAmount,
    totalToReturn: actualTotalToReturn,
    installmentAmount,
    actualInterestRate,
  };
}

export function roundToUnit(amount: number, unit: number): number {
  return Math.round(amount / unit) * unit;
}

/**
 * Calculates accumulated contributions for a member.
 * contributionPerMonth * totalMonthsParticipated
 */
export function calculateAccumulatedContributions(
  contributionAmount: number,
  monthsParticipated: number,
): number {
  return contributionAmount * monthsParticipated;
}

/**
 * Returns how many months have elapsed between two month/year pairs (inclusive start).
 */
export function monthsBetween(
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number,
): number {
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

/**
 * Given a rueda slot position and the current month index (1-based within the rueda),
 * determines the payment type for a given member.
 *
 * Rules:
 * - If ruedaNumber === 1: contribution_only (no previous rueda)
 * - If slotPosition === currentMonthIndex: this is the person who "lleva" (takes loan this month)
 *     -> pays last installment of previous rueda + receives new loan
 *     -> payment_type = 'previous_rueda'
 * - If slotPosition < currentMonthIndex: already took loan this rueda
 *     -> payment_type = 'current_rueda'
 * - If slotPosition > currentMonthIndex: hasn't taken loan yet
 *     -> payment_type = 'previous_rueda'
 */
export function resolvePaymentType(
  ruedaNumber: number,
  slotPosition: number,
  currentMonthIndex: number,
): 'current_rueda' | 'previous_rueda' | 'contribution_only' {
  if (ruedaNumber === 1) return 'contribution_only';
  if (slotPosition < currentMonthIndex) return 'current_rueda';
  return 'previous_rueda';
}
