"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModel = void 0;
class PaymentModel {
    constructor(id, ruedaId, memberId, memberName, month, year, installmentAmountDue, contributionAmountDue, totalAmountDue, installmentNumber, paymentType, isPaid, paymentSource, notes, createdAt, updatedAt) {
        this.id = id;
        this.ruedaId = ruedaId;
        this.memberId = memberId;
        this.memberName = memberName;
        this.month = month;
        this.year = year;
        this.installmentAmountDue = installmentAmountDue;
        this.contributionAmountDue = contributionAmountDue;
        this.totalAmountDue = totalAmountDue;
        this.installmentNumber = installmentNumber;
        this.paymentType = paymentType;
        this.isPaid = isPaid;
        this.paymentSource = paymentSource;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.PaymentModel = PaymentModel;
//# sourceMappingURL=payment-model.js.map