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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallelLoansController = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../../manager/services");
const parallel_loans_1 = require("../../manager/contracts/parallel-loans");
const parallel_loans_2 = require("../contracts/parallel-loans");
let ParallelLoansController = class ParallelLoansController {
    constructor(parallelLoansManager) {
        this.parallelLoansManager = parallelLoansManager;
    }
    findByGroup(groupId) {
        return this.parallelLoansManager.findByGroup(groupId);
    }
    create(groupId, body) {
        return this.parallelLoansManager.create({ ...body, groupId });
    }
    findById(id) {
        return this.parallelLoansManager.findById(id);
    }
    getPayments(id) {
        return this.parallelLoansManager.getPayments(id);
    }
    markPayment(paymentId) {
        return this.parallelLoansManager.markPayment(paymentId, new parallel_loans_1.MarkLoanPaymentRequest(true));
    }
};
exports.ParallelLoansController = ParallelLoansController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParallelLoansController.prototype, "findByGroup", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, parallel_loans_2.CreateParallelLoanApiRequest]),
    __metadata("design:returntype", Promise)
], ParallelLoansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParallelLoansController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(':id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParallelLoansController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)(':id/payments/:paymentId/mark-paid'),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParallelLoansController.prototype, "markPayment", null);
exports.ParallelLoansController = ParallelLoansController = __decorate([
    (0, common_1.Controller)('groups/:groupId/parallel-loans'),
    __metadata("design:paramtypes", [services_1.ParallelLoansManager])
], ParallelLoansController);
//# sourceMappingURL=parallel-loans.controller.js.map