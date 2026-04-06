"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCashMovementRequest = void 0;
class CreateCashMovementRequest {
    constructor(groupId, movementType, sourceType, category, amount, month, year, description, referenceId) {
        this.groupId = groupId;
        this.movementType = movementType;
        this.sourceType = sourceType;
        this.category = category;
        this.amount = amount;
        this.month = month;
        this.year = year;
        this.description = description;
        this.referenceId = referenceId;
    }
}
exports.CreateCashMovementRequest = CreateCashMovementRequest;
//# sourceMappingURL=create-cash-movement-request.js.map