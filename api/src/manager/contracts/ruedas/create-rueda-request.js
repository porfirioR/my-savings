"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRuedaRequest = exports.CreateRuedaSlotRequest = void 0;
class CreateRuedaSlotRequest {
    constructor(memberId, slotPosition, loanAmount) {
        this.memberId = memberId;
        this.slotPosition = slotPosition;
        this.loanAmount = loanAmount;
    }
}
exports.CreateRuedaSlotRequest = CreateRuedaSlotRequest;
class CreateRuedaRequest {
    constructor(groupId, type, loanAmount, interestRate, contributionAmount, roundingUnit, startMonth, startYear, slots, historicalContributionTotal, notes) {
        this.groupId = groupId;
        this.type = type;
        this.loanAmount = loanAmount;
        this.interestRate = interestRate;
        this.contributionAmount = contributionAmount;
        this.roundingUnit = roundingUnit;
        this.startMonth = startMonth;
        this.startYear = startYear;
        this.slots = slots;
        this.historicalContributionTotal = historicalContributionTotal;
        this.notes = notes;
    }
}
exports.CreateRuedaRequest = CreateRuedaRequest;
//# sourceMappingURL=create-rueda-request.js.map