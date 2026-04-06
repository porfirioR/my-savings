"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallelLoanPaymentAccessModel = void 0;
class ParallelLoanPaymentAccessModel {
    constructor(id, parallelLoanId, month, year, amount, isPaid, createdAt, paidAt) {
        this.id = id;
        this.parallelLoanId = parallelLoanId;
        this.month = month;
        this.year = year;
        this.amount = amount;
        this.isPaid = isPaid;
        this.createdAt = createdAt;
        this.paidAt = paidAt;
    }
}
exports.ParallelLoanPaymentAccessModel = ParallelLoanPaymentAccessModel;
//# sourceMappingURL=parallel-loan-payment-access-model.js.map