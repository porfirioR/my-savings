"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateInstallment = calculateInstallment;
exports.roundToUnit = roundToUnit;
exports.calculateAccumulatedContributions = calculateAccumulatedContributions;
exports.monthsBetween = monthsBetween;
exports.calculateMemberExitSettlement = calculateMemberExitSettlement;
exports.resolvePaymentType = resolvePaymentType;
const enums_1 = require("../enums");
function calculateInstallment(loanAmount, interestRate, months, roundingUnit = enums_1.RoundingUnit.OneThousand) {
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
function roundToUnit(amount, unit) {
    return Math.round(amount / unit) * unit;
}
function calculateAccumulatedContributions(contributionAmount, monthsParticipated) {
    return contributionAmount * monthsParticipated;
}
function monthsBetween(startMonth, startYear, endMonth, endYear) {
    return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}
function calculateMemberExitSettlement(accumulatedContributions, remainingLoanBalance) {
    const diff = accumulatedContributions - remainingLoanBalance;
    if (diff >= 0)
        return { memberReceives: diff, memberPays: 0 };
    return { memberReceives: 0, memberPays: Math.abs(diff) };
}
function resolvePaymentType(ruedaNumber, slotPosition, currentMonthIndex) {
    if (ruedaNumber === 1)
        return 'contribution_only';
    if (slotPosition < currentMonthIndex)
        return 'current_rueda';
    return 'previous_rueda';
}
//# sourceMappingURL=calculation.helper.js.map