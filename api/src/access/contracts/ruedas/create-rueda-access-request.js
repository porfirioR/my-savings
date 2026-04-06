"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRuedaAccessRequest = void 0;
class CreateRuedaAccessRequest {
    constructor(groupId, ruedaNumber, type, loanAmount, interestRate, contributionAmount, installmentAmount, totalToReturn, roundingUnit, startMonth, startYear, status, historicalContributionTotal, notes) {
        this.groupId = groupId;
        this.ruedaNumber = ruedaNumber;
        this.type = type;
        this.loanAmount = loanAmount;
        this.interestRate = interestRate;
        this.contributionAmount = contributionAmount;
        this.installmentAmount = installmentAmount;
        this.totalToReturn = totalToReturn;
        this.roundingUnit = roundingUnit;
        this.startMonth = startMonth;
        this.startYear = startYear;
        this.status = status;
        this.historicalContributionTotal = historicalContributionTotal;
        this.notes = notes;
    }
}
exports.CreateRuedaAccessRequest = CreateRuedaAccessRequest;
//# sourceMappingURL=create-rueda-access-request.js.map