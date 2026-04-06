"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateParallelLoanAccessRequest = void 0;
class CreateParallelLoanAccessRequest {
    constructor(groupId, memberId, amount, interestRate, totalToReturn, installmentAmount, totalInstallments, startMonth, startYear) {
        this.groupId = groupId;
        this.memberId = memberId;
        this.amount = amount;
        this.interestRate = interestRate;
        this.totalToReturn = totalToReturn;
        this.installmentAmount = installmentAmount;
        this.totalInstallments = totalInstallments;
        this.startMonth = startMonth;
        this.startYear = startYear;
    }
}
exports.CreateParallelLoanAccessRequest = CreateParallelLoanAccessRequest;
//# sourceMappingURL=create-parallel-loan-access-request.js.map