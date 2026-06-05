import { RoundingUnit } from '../enums';

export interface InstallmentCalculation {
  loanAmount: number;
  totalToReturn: number;
  installmentAmount: number;
  actualInterestRate: number;
}

/**
 * Calculates rueda installment amounts.
 * Interest is flat on the total (e.g. 10% on 540,000 = 594,000 / 18 = 33,000).
 * The raw installment is always rounded UP to the rounding unit so the group
 * never collects less than needed to fund the next loan.
 */
export function calculateInstallment(
  loanAmount: number,
  interestRate: number,
  months: number,
  roundingUnit: RoundingUnit = RoundingUnit.OneThousand,
): InstallmentCalculation {
  const rawInstallment = (loanAmount * (1 + interestRate)) / months;
  const installmentAmount = ceilToUnit(rawInstallment, roundingUnit);
  const actualTotalToReturn = installmentAmount * months;
  const actualInterestRate = (actualTotalToReturn - loanAmount) / loanAmount;

  return {
    loanAmount,
    totalToReturn: actualTotalToReturn,
    installmentAmount,
    actualInterestRate,
  };
}

export function ceilToUnit(amount: number, unit: number): number {
  if (unit === 0) return Math.ceil(amount);
  return Math.ceil(amount / unit) * unit;
}

export function roundToUnit(amount: number, unit: number): number {
  if (unit === 0) return Math.round(amount);
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
 * Calculates exit settlement for a member.
 * If contributions >= remaining loan: member receives the difference (from caja).
 * If contributions < remaining loan: member pays the difference (goes to caja).
 */
export function calculateMemberExitSettlement(
  accumulatedContributions: number,
  remainingLoanBalance: number,
): { memberReceives: number; memberPays: number } {
  const diff = accumulatedContributions - remainingLoanBalance;
  if (diff >= 0) return { memberReceives: diff, memberPays: 0 };
  return { memberReceives: 0, memberPays: Math.abs(diff) };
}

/**
 * Given a rueda slot position and the current month index (1-based within the rueda),
 * determines the payment type for a given member.
 *
 * Rules for type='new' (both constant and variable):
 *   Month 1 (Junta): all slots have slotPosition >= currentMonthIndex → contribution_only.
 *   Month 2+: members who already received their loan (slotPosition < currentMonthIndex)
 *             pay current_rueda (installment + contribution).
 *             Everyone else pays contribution_only.
 *
 *   slotAmountMode affects the installment AMOUNT stored per slot (same vs. growing),
 *   not whether installments are tracked.
 *
 * Rules for type='continua':
 *   slotPosition < currentMonthIndex  → current_rueda
 *   slotPosition >= currentMonthIndex → previous_rueda (last installment of prior rueda)
 */
export function resolvePaymentType(
  ruedaType: 'new' | 'continua',
  slotAmountMode: 'constant' | 'variable',
  slotPosition: number,
  currentMonthIndex: number,
): 'current_rueda' | 'previous_rueda' | 'contribution_only' {
  if (ruedaType === 'new') {
    if (slotPosition < currentMonthIndex) return 'current_rueda';
    return 'contribution_only';
  }
  if (slotPosition < currentMonthIndex) return 'current_rueda';
  return 'previous_rueda';
}
