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
exports.PaymentsManager = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../../access/data/services");
let PaymentsManager = class PaymentsManager {
    constructor(paymentsAccess) {
        this.paymentsAccess = paymentsAccess;
    }
    mapToModel(accessModel) {
        return {
            id: accessModel.id,
            ruedaId: accessModel.ruedaId,
            memberId: accessModel.memberId,
            memberName: accessModel.memberName,
            month: accessModel.month,
            year: accessModel.year,
            installmentAmountDue: accessModel.installmentAmountDue,
            contributionAmountDue: accessModel.contributionAmountDue,
            totalAmountDue: accessModel.totalAmountDue,
            installmentNumber: accessModel.installmentNumber,
            paymentType: accessModel.paymentType,
            isPaid: accessModel.isPaid,
            paymentSource: accessModel.paymentSource,
            notes: accessModel.notes,
            createdAt: accessModel.createdAt,
            updatedAt: accessModel.updatedAt,
        };
    }
    async findByRuedaAndMonth(ruedaId, month, year) {
        const result = await this.paymentsAccess.findByRuedaAndMonth(ruedaId, month, year);
        return result.map((m) => this.mapToModel(m));
    }
    async generateMonthlyPayments(req) {
        const result = await this.paymentsAccess.generateMonthlyPayments(req);
        return result.map((m) => this.mapToModel(m));
    }
    async markPayment(id, req) {
        const result = await this.paymentsAccess.markPayment(id, req);
        return this.mapToModel(result);
    }
};
exports.PaymentsManager = PaymentsManager;
exports.PaymentsManager = PaymentsManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_1.PaymentsAccess])
], PaymentsManager);
//# sourceMappingURL=payments-manager.service.js.map