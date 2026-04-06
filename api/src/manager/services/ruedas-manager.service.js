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
exports.RuedasManager = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../../access/data/services");
const helpers_1 = require("../../utility/helpers");
let RuedasManager = class RuedasManager {
    constructor(ruedasAccess) {
        this.ruedasAccess = ruedasAccess;
    }
    mapSlotToModel(accessModel) {
        return {
            id: accessModel.id,
            ruedaId: accessModel.ruedaId,
            memberId: accessModel.memberId,
            memberName: accessModel.memberName,
            slotPosition: accessModel.slotPosition,
            loanAmount: accessModel.loanAmount,
            installmentAmount: accessModel.installmentAmount,
            totalToReturn: accessModel.totalToReturn,
            loanMonth: accessModel.loanMonth,
            loanYear: accessModel.loanYear,
            status: accessModel.status,
            createdAt: accessModel.createdAt,
            updatedAt: accessModel.updatedAt,
        };
    }
    mapToModel(accessModel) {
        return {
            id: accessModel.id,
            groupId: accessModel.groupId,
            ruedaNumber: accessModel.ruedaNumber,
            type: accessModel.type,
            loanAmount: accessModel.loanAmount,
            interestRate: accessModel.interestRate,
            contributionAmount: accessModel.contributionAmount,
            installmentAmount: accessModel.installmentAmount,
            totalToReturn: accessModel.totalToReturn,
            roundingUnit: accessModel.roundingUnit,
            startMonth: accessModel.startMonth,
            startYear: accessModel.startYear,
            endMonth: accessModel.endMonth,
            endYear: accessModel.endYear,
            status: accessModel.status,
            historicalContributionTotal: accessModel.historicalContributionTotal,
            notes: accessModel.notes,
            createdAt: accessModel.createdAt,
            updatedAt: accessModel.updatedAt,
            slots: accessModel.slots?.map((s) => this.mapSlotToModel(s)),
        };
    }
    async findByGroup(groupId) {
        const result = await this.ruedasAccess.findByGroup(groupId);
        return result.map((m) => this.mapToModel(m));
    }
    async findById(id) {
        const result = await this.ruedasAccess.findById(id);
        return this.mapToModel(result);
    }
    async findActive(groupId) {
        const result = await this.ruedasAccess.findActive(groupId);
        return result ? this.mapToModel(result) : null;
    }
    async create(req) {
        const totalMonths = 15;
        const { installmentAmount, totalToReturn } = (0, helpers_1.calculateInstallment)(req.loanAmount, req.interestRate, totalMonths, req.roundingUnit);
        const existingRuedas = await this.ruedasAccess.findByGroup(req.groupId);
        const ruedaNumber = existingRuedas.length + 1;
        const rueda = await this.ruedasAccess.create({
            groupId: req.groupId,
            ruedaNumber,
            type: req.type,
            loanAmount: req.loanAmount,
            interestRate: req.interestRate,
            contributionAmount: req.contributionAmount,
            installmentAmount,
            totalToReturn,
            roundingUnit: req.roundingUnit,
            startMonth: req.startMonth,
            startYear: req.startYear,
            status: 'pending',
            historicalContributionTotal: req.historicalContributionTotal,
            notes: req.notes,
        });
        if (req.slots && req.slots.length > 0) {
            const slotRequests = req.slots.map((slot) => {
                const slotLoanAmount = slot.loanAmount ?? req.loanAmount;
                const slotCalc = (0, helpers_1.calculateInstallment)(slotLoanAmount, req.interestRate, totalMonths, req.roundingUnit);
                const totalMonthOffset = req.startMonth - 1 + (slot.slotPosition - 1);
                const loanMonth = (totalMonthOffset % 12) + 1;
                const loanYear = req.startYear + Math.floor(totalMonthOffset / 12);
                return {
                    ruedaId: rueda.id,
                    memberId: slot.memberId,
                    slotPosition: slot.slotPosition,
                    loanAmount: slotLoanAmount,
                    installmentAmount: slotCalc.installmentAmount,
                    totalToReturn: slotCalc.totalToReturn,
                    loanMonth,
                    loanYear,
                    status: 'pending',
                };
            });
            await this.ruedasAccess.upsertSlots(rueda.id, slotRequests);
        }
        return this.findById(rueda.id);
    }
    async update(id, req) {
        let installmentAmount;
        let totalToReturn;
        if (req.loanAmount !== undefined || req.interestRate !== undefined || req.roundingUnit !== undefined) {
            const current = await this.ruedasAccess.findById(id);
            const loanAmount = req.loanAmount ?? current.loanAmount;
            const interestRate = req.interestRate ?? current.interestRate;
            const roundingUnit = req.roundingUnit ?? current.roundingUnit;
            const calc = (0, helpers_1.calculateInstallment)(loanAmount, interestRate, 15, roundingUnit);
            installmentAmount = calc.installmentAmount;
            totalToReturn = calc.totalToReturn;
        }
        const result = await this.ruedasAccess.update(id, {
            ...req,
            installmentAmount,
            totalToReturn,
        });
        return this.mapToModel(result);
    }
    async calculateSuggestion(groupId) {
        return this.ruedasAccess.calculateSuggestion(groupId);
    }
};
exports.RuedasManager = RuedasManager;
exports.RuedasManager = RuedasManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_1.RuedasAccess])
], RuedasManager);
//# sourceMappingURL=ruedas-manager.service.js.map