"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRuedaAccessRequest = void 0;
class UpdateRuedaAccessRequest {
    constructor(loanAmount, interestRate, contributionAmount, installmentAmount, totalToReturn, roundingUnit, startMonth, startYear, endMonth, endYear, status, historicalContributionTotal, notes) {
        this.loanAmount = loanAmount;
        this.interestRate = interestRate;
        this.contributionAmount = contributionAmount;
        this.installmentAmount = installmentAmount;
        this.totalToReturn = totalToReturn;
        this.roundingUnit = roundingUnit;
        this.startMonth = startMonth;
        this.startYear = startYear;
        this.endMonth = endMonth;
        this.endYear = endYear;
        this.status = status;
        this.historicalContributionTotal = historicalContributionTotal;
        this.notes = notes;
    }
}
exports.UpdateRuedaAccessRequest = UpdateRuedaAccessRequest;
//# sourceMappingURL=update-rueda-access-request.js.map