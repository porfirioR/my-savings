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
exports.RuedasAccess = void 0;
const common_1 = require("@nestjs/common");
const _1 = require(".");
let RuedasAccess = class RuedasAccess extends _1.BaseAccessService {
    constructor(dbContextService) {
        super(dbContextService);
    }
    mapSlotToModel(entity) {
        return {
            id: entity.id,
            ruedaId: entity.rueda_id,
            memberId: entity.member_id,
            memberName: entity.members
                ? `${entity.members.first_name} ${entity.members.last_name}`
                : undefined,
            slotPosition: entity.slot_position,
            loanAmount: entity.loan_amount,
            installmentAmount: entity.installment_amount,
            totalToReturn: entity.total_to_return,
            loanMonth: entity.loan_month,
            loanYear: entity.loan_year,
            status: entity.status,
            createdAt: entity.created_at,
            updatedAt: entity.updated_at,
        };
    }
    mapToModel(entity, slots) {
        return {
            id: entity.id,
            groupId: entity.group_id,
            ruedaNumber: entity.rueda_number,
            type: entity.type,
            loanAmount: entity.loan_amount,
            interestRate: entity.interest_rate,
            contributionAmount: entity.contribution_amount,
            installmentAmount: entity.installment_amount,
            totalToReturn: entity.total_to_return,
            roundingUnit: entity.rounding_unit,
            startMonth: entity.start_month,
            startYear: entity.start_year,
            endMonth: entity.end_month,
            endYear: entity.end_year,
            status: entity.status,
            historicalContributionTotal: entity.historical_contribution_total,
            notes: entity.notes,
            createdAt: entity.created_at,
            updatedAt: entity.updated_at,
            slots,
        };
    }
    async findByGroup(groupId) {
        const { data, error } = await this.dbContext
            .from('ruedas')
            .select('*')
            .eq('group_id', groupId)
            .order('rueda_number', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data.map((e) => this.mapToModel(e));
    }
    async findById(id) {
        const { data: ruedaData, error: ruedaError } = await this.dbContext
            .from('ruedas')
            .select('*')
            .eq('id', id)
            .single();
        if (ruedaError)
            throw new Error(ruedaError.message);
        const { data: slotsData, error: slotsError } = await this.dbContext
            .from('rueda_slots')
            .select('*, members(first_name, last_name)')
            .eq('rueda_id', id)
            .order('slot_position', { ascending: true });
        if (slotsError)
            throw new Error(slotsError.message);
        const slots = slotsData.map((s) => this.mapSlotToModel(s));
        return this.mapToModel(ruedaData, slots);
    }
    async findActive(groupId) {
        const { data: ruedaData, error: ruedaError } = await this.dbContext
            .from('ruedas')
            .select('*')
            .eq('group_id', groupId)
            .eq('status', 'active')
            .maybeSingle();
        if (ruedaError)
            throw new Error(ruedaError.message);
        if (!ruedaData)
            return null;
        const { data: slotsData, error: slotsError } = await this.dbContext
            .from('rueda_slots')
            .select('*, members(first_name, last_name)')
            .eq('rueda_id', ruedaData.id)
            .order('slot_position', { ascending: true });
        if (slotsError)
            throw new Error(slotsError.message);
        const slots = slotsData.map((s) => this.mapSlotToModel(s));
        return this.mapToModel(ruedaData, slots);
    }
    async create(req) {
        const { data, error } = await this.dbContext
            .from('ruedas')
            .insert({
            group_id: req.groupId,
            rueda_number: req.ruedaNumber,
            type: req.type,
            loan_amount: req.loanAmount,
            interest_rate: req.interestRate,
            contribution_amount: req.contributionAmount,
            installment_amount: req.installmentAmount,
            total_to_return: req.totalToReturn,
            rounding_unit: req.roundingUnit,
            start_month: req.startMonth,
            start_year: req.startYear,
            end_month: null,
            end_year: null,
            status: req.status,
            historical_contribution_total: req.historicalContributionTotal ?? null,
            notes: req.notes ?? null,
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
    async update(id, req) {
        const updatePayload = {};
        if (req.loanAmount !== undefined)
            updatePayload.loan_amount = req.loanAmount;
        if (req.interestRate !== undefined)
            updatePayload.interest_rate = req.interestRate;
        if (req.contributionAmount !== undefined)
            updatePayload.contribution_amount = req.contributionAmount;
        if (req.installmentAmount !== undefined)
            updatePayload.installment_amount = req.installmentAmount;
        if (req.totalToReturn !== undefined)
            updatePayload.total_to_return = req.totalToReturn;
        if (req.roundingUnit !== undefined)
            updatePayload.rounding_unit = req.roundingUnit;
        if (req.startMonth !== undefined)
            updatePayload.start_month = req.startMonth;
        if (req.startYear !== undefined)
            updatePayload.start_year = req.startYear;
        if (req.endMonth !== undefined)
            updatePayload.end_month = req.endMonth;
        if (req.endYear !== undefined)
            updatePayload.end_year = req.endYear;
        if (req.status !== undefined)
            updatePayload.status = req.status;
        if (req.historicalContributionTotal !== undefined)
            updatePayload.historical_contribution_total = req.historicalContributionTotal;
        if (req.notes !== undefined)
            updatePayload.notes = req.notes;
        const { data, error } = await this.dbContext
            .from('ruedas')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
    async upsertSlots(ruedaId, slots) {
        const records = slots.map((s) => ({
            rueda_id: ruedaId,
            member_id: s.memberId,
            slot_position: s.slotPosition,
            loan_amount: s.loanAmount,
            installment_amount: s.installmentAmount,
            total_to_return: s.totalToReturn,
            loan_month: s.loanMonth,
            loan_year: s.loanYear,
            status: s.status,
        }));
        const { data, error } = await this.dbContext
            .from('rueda_slots')
            .upsert(records, { onConflict: 'rueda_id,slot_position' })
            .select();
        if (error)
            throw new Error(error.message);
        return data.map((e) => this.mapSlotToModel(e));
    }
    async calculateSuggestion(groupId) {
        const { data: balanceData, error: balanceError } = await this.dbContext
            .from('v_cash_balance')
            .select('*')
            .eq('group_id', groupId)
            .maybeSingle();
        if (balanceError)
            throw new Error(balanceError.message);
        const cajaBalance = balanceData?.balance ?? 0;
        const { data: ruedaData, error: ruedaError } = await this.dbContext
            .from('ruedas')
            .select('contribution_amount, installment_amount')
            .eq('group_id', groupId)
            .eq('status', 'active')
            .maybeSingle();
        if (ruedaError)
            throw new Error(ruedaError.message);
        const contributionAmount = ruedaData?.contribution_amount ?? 0;
        const installmentAmount = ruedaData?.installment_amount ?? 0;
        const projectedMonthlyIncome = contributionAmount * 15 + installmentAmount * 14;
        const suggestedLoanAmount = cajaBalance + projectedMonthlyIncome;
        return {
            suggestedLoanAmount,
            cajaBalance,
            projectedMonthlyIncome,
        };
    }
};
exports.RuedasAccess = RuedasAccess;
exports.RuedasAccess = RuedasAccess = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [_1.DbContextService])
], RuedasAccess);
//# sourceMappingURL=ruedas-access.service.js.map