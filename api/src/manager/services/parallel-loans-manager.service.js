"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallelLoansManager = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../../access/data/services");
const helpers_1 = require("../../utility/helpers");
const parallel_loans_1 = require("../contracts/parallel-loans");
let ParallelLoansManager = class ParallelLoansManager {
    constructor(parallelLoansAccess) {
        this.parallelLoansAccess = parallelLoansAccess;
    }
    mapPayment(a) {
        return new parallel_loans_1.ParallelLoanPaymentModel(a.id, a.parallelLoanId, a.month, a.year, a.amount, a.isPaid, a.createdAt, a.paidAt);
    }
    mapToModel(a) {
        return new parallel_loans_1.ParallelLoanModel(a.id, a.groupId, a.memberId, a.memberName, a.amount, a.interestRate, a.totalToReturn, a.installmentAmount, a.totalInstallments, a.installmentsPaid, a.startMonth, a.startYear, a.status, a.createdAt, a.updatedAt, a.endMonth, a.endYear, a.payments?.map(p => this.mapPayment(p)));
    }
    async findByGroup(groupId) {
        return (await this.parallelLoansAccess.findByGroup(groupId)).map(m => this.mapToModel(m));
    }
    async findById(id) {
        return this.mapToModel(await this.parallelLoansAccess.findById(id));
    }
    async create(req) {
        const { installmentAmount, totalToReturn } = (0, helpers_1.calculateInstallment)(req.amount, req.interestRate, req.totalInstallments, req.roundingUnit);
        return this.mapToModel(await this.parallelLoansAccess.create({
            groupId: req.groupId,
            memberId: req.memberId,
            amount: req.amount,
            interestRate: req.interestRate,
            totalToReturn,
            installmentAmount,
            totalInstallments: req.totalInstallments,
            startMonth: req.startMonth,
            startYear: req.startYear,
        }));
    }
    async getPayments(loanId) {
        return (await this.parallelLoansAccess.getPayments(loanId)).map(p => this.mapPayment(p));
    }
    async markPayment(paymentId, req) {
        return this.mapPayment(await this.parallelLoansAccess.markPayment(paymentId, req));
    }
};
exports.ParallelLoansManager = ParallelLoansManager;
exports.ParallelLoansManager = ParallelLoansManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_1.ParallelLoansAccess])
], ParallelLoansManager);
//# sourceMappingURL=parallel-loans-manager.service.js.map