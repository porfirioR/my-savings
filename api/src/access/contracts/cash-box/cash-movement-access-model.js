"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashMovementAccessModel = void 0;
class CashMovementAccessModel {
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
exports.CashMovementAccessModel = CashMovementAccessModel;
//# sourceMappingURL=cash-movement-access-model.js.map