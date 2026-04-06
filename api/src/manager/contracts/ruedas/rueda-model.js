"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuedaModel = void 0;
class RuedaModel {
    constructor(id, groupId, ruedaNumber, type, loanAmount, interestRate, contributionAmount, installmentAmount, totalToReturn, roundingUnit, startMonth, startYear, endMonth, endYear, status, historicalContributionTotal, notes, createdAt, updatedAt, slots) {
        this.id = id;
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
        this.endMonth = endMonth;
        this.endYear = endYear;
        this.status = status;
        this.historicalContributionTotal = historicalContributionTotal;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.slots = slots;
    }
}
exports.RuedaModel = RuedaModel;
//# sourceMappingURL=rueda-model.js.map