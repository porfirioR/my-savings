"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallelLoanPaymentModel = void 0;
class ParallelLoanPaymentModel {
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
exports.ParallelLoanPaymentModel = ParallelLoanPaymentModel;
//# sourceMappingURL=parallel-loan-payment-model.js.map