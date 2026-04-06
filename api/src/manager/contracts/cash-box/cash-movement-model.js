"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashMovementModel = void 0;
class CashMovementModel {
    constructor(id, groupId, movementType, sourceType, category, amount, month, year, createdAt, updatedAt, description, referenceId) {
        this.id = id;
        this.groupId = groupId;
        this.movementType = movementType;
        this.sourceType = sourceType;
        this.category = category;
        this.amount = amount;
        this.month = month;
        this.year = year;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.description = description;
        this.referenceId = referenceId;
    }
}
exports.CashMovementModel = CashMovementModel;
//# sourceMappingURL=cash-movement-model.js.map