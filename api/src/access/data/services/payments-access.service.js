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
exports.PaymentsAccess = void 0;
const common_1 = require("@nestjs/common");
const _1 = require(".");
const helpers_1 = require("../../../utility/helpers");
let PaymentsAccess = class PaymentsAccess extends _1.BaseAccessService {
    constructor(dbContextService) {
        super(dbContextService);
    }
    mapToModel(entity) {
        return {
            id: entity.id,
            ruedaId: entity.rueda_id,
            memberId: entity.member_id,
            memberName: entity.members
                ? `${entity.members.first_name} ${entity.members.last_name}`
                : '',
            month: entity.month,
            year: entity.year,
            installmentAmountDue: entity.installment_amount_due,
            contributionAmountDue: entity.contribution_amount_due,
            totalAmountDue: entity.total_amount_due,
            installmentNumber: entity.installment_number,
            paymentType: entity.payment_type,
            isPaid: entity.is_paid,
            paymentSource: entity.payment_source,
            notes: entity.notes,
            createdAt: entity.created_at,
            updatedAt: entity.updated_at,
        };
    }
    async findByRuedaAndMonth(ruedaId, month, year) {
        const { data, error } = await this.dbContext
            .from('rueda_monthly_payments')
            .select('*, members(first_name, last_name)')
            .eq('rueda_id', ruedaId)
            .eq('month', month)
            .eq('year', year)
            .order('installment_number', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data.map((e) => this.mapToModel(e));
    }
    async findById(id) {
        const { data, error } = await this.dbContext
            .from('rueda_monthly_payments')
            .select('*, members(first_name, last_name)')
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
    async generateMonthlyPayments(req) {
        const { data: ruedaData, error: ruedaError } = await this.dbContext
            .from('ruedas')
            .select('*, rueda_slots(*, members(first_name, last_name))')
            .eq('id', req.ruedaId)
            .single();
        if (ruedaError)
            throw new Error(ruedaError.message);
        const rueda = ruedaData;
        const slots = rueda.rueda_slots ?? [];
        const startMonth = rueda.start_month;
        const startYear = rueda.start_year;
        const currentMonthIndex = (req.year - startYear) * 12 + (req.month - startMonth) + 1;
        const records = slots.map((slot) => {
            const paymentType = (0, helpers_1.resolvePaymentType)(rueda.rueda_number, slot.slot_position, currentMonthIndex);
            const installmentAmountDue = paymentType === 'contribution_only' ? 0 : slot.installment_amount;
            const contributionAmountDue = rueda.contribution_amount;
            const totalAmountDue = installmentAmountDue + contributionAmountDue;
            return {
                rueda_id: req.ruedaId,
                member_id: slot.member_id,
                month: req.month,
                year: req.year,
                installment_amount_due: installmentAmountDue,
                contribution_amount_due: contributionAmountDue,
                total_amount_due: totalAmountDue,
                installment_number: slot.slot_position,
                payment_type: paymentType,
                is_paid: false,
                payment_source: null,
                notes: null,
            };
        });
        const { data, error } = await this.dbContext
            .from('rueda_monthly_payments')
            .insert(records)
            .select('*, members(first_name, last_name)');
        if (error)
            throw new Error(error.message);
        return data.map((e) => this.mapToModel(e));
    }
    async markPayment(id, req) {
        const { data, error } = await this.dbContext
            .from('rueda_monthly_payments')
            .update({
            is_paid: req.isPaid,
            payment_source: req.paymentSource ?? null,
        })
            .eq('id', id)
            .select('*, members(first_name, last_name)')
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
};
exports.PaymentsAccess = PaymentsAccess;
exports.PaymentsAccess = PaymentsAccess = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [_1.DbContextService])
], PaymentsAccess);
//# sourceMappingURL=payments-access.service.js.map