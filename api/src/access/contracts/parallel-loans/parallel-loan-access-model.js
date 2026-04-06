"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallelLoanAccessModel = void 0;
class ParallelLoanAccessModel {
    constructor(id, groupId, memberId, memberName, amount, interestRate, totalToReturn, installmentAmount, totalInstallments, installmentsPaid, startMonth, startYear, status, createdAt, updatedAt, endMonth, endYear, payments) {
        this.id = id;
        this.groupId = groupId;
        this.memberId = memberId;
        this.memberName = memberName;
        this.amount = amount;
        this.interestRate = interestRate;
        this.totalToReturn = totalToReturn;
        this.installmentAmount = installmentAmount;
        this.totalInstallments = totalInstallments;
        this.installmentsPaid = installmentsPaid;
        this.startMonth = startMonth;
        this.startYear = startYear;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.endMonth = endMonth;
        this.endYear = endYear;
        this.payments = payments;
    }
    get installmentsRemaining() {
        return this.totalInstallments - this.installmentsPaid;
    }
}
exports.ParallelLoanAccessModel = ParallelLoanAccessModel;
//# sourceMappingURL=parallel-loan-access-model.js.map