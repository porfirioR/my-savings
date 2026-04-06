"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuedaSlotModel = void 0;
class RuedaSlotModel {
    constructor(id, ruedaId, memberId, slotPosition, loanAmount, installmentAmount, totalToReturn, loanMonth, loanYear, status, createdAt, updatedAt, memberName) {
        this.id = id;
        this.ruedaId = ruedaId;
        this.memberId = memberId;
        this.slotPosition = slotPosition;
        this.loanAmount = loanAmount;
        this.installmentAmount = installmentAmount;
        this.totalToReturn = totalToReturn;
        this.loanMonth = loanMonth;
        this.loanYear = loanYear;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.memberName = memberName;
    }
}
exports.RuedaSlotModel = RuedaSlotModel;
//# sourceMappingURL=rueda-slot-model.js.map