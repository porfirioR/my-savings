"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateParallelLoanRequest = void 0;
class CreateParallelLoanRequest {
    constructor(groupId, memberId, amount, interestRate, totalInstallments, roundingUnit, startMonth, startYear) {
        this.groupId = groupId;
        this.memberId = memberId;
        this.amount = amount;
        this.interestRate = interestRate;
        this.totalInstallments = totalInstallments;
        this.roundingUnit = roundingUnit;
        this.startMonth = startMonth;
        this.startYear = startYear;
    }
}
exports.CreateParallelLoanRequest = CreateParallelLoanRequest;
//# sourceMappingURL=create-parallel-loan-request.js.map