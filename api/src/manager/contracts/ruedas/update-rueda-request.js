"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRuedaRequest = void 0;
class UpdateRuedaRequest {
    constructor(loanAmount, interestRate, contributionAmount, roundingUnit, startMonth, startYear, endMonth, endYear, status, historicalContributionTotal, notes) {
        this.loanAmount = loanAmount;
        this.interestRate = interestRate;
        this.contributionAmount = contributionAmount;
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
exports.UpdateRuedaRequest = UpdateRuedaRequest;
//# sourceMappingURL=update-rueda-request.js.map