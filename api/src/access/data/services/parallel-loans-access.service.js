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
exports.ParallelLoansAccess = void 0;
const common_1 = require("@nestjs/common");
const _1 = require(".");
const parallel_loans_1 = require("../../contracts/parallel-loans");
let ParallelLoansAccess = class ParallelLoansAccess extends _1.BaseAccessService {
    constructor(dbContextService) {
        super(dbContextService);
    }
    mapPayment(e) {
        return new parallel_loans_1.ParallelLoanPaymentAccessModel(e.id, e.parallel_loan_id, e.month, e.year, e.amount, e.is_paid, e.created_at, e.paid_at ?? undefined);
    }
    mapToModel(e, payments) {
        const memberName = e.members
            ? `${e.members.first_name} ${e.members.last_name}`
            : '';
        return new parallel_loans_1.ParallelLoanAccessModel(e.id, e.group_id, e.member_id, memberName, e.amount, e.interest_rate, e.total_to_return, e.installment_amount, e.total_installments, e.installments_paid, e.start_month, e.start_year, e.status, e.created_at, e.updated_at, e.end_month ?? undefined, e.end_year ?? undefined, payments);
    }
    async findByGroup(groupId) {
        const { data, error } = await this.dbContext
            .from('parallel_loans')
            .select('*, members(first_name, last_name)')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data.map(e => this.mapToModel(e));
    }
    async findById(id) {
        const { data, error } = await this.dbContext
            .from('parallel_loans')
            .select('*, members(first_name, last_name)')
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        const payments = await this.getPayments(id);
        return this.mapToModel(data, payments);
    }
    async create(req) {
        const { data, error } = await this.dbContext
            .from('parallel_loans')
            .insert({
            group_id: req.groupId,
            member_id: req.memberId,
            amount: req.amount,
            interest_rate: req.interestRate,
            total_to_return: req.totalToReturn,
            installment_amount: req.installmentAmount,
            total_installments: req.totalInstallments,
            installments_paid: 0,
            start_month: req.startMonth,
            start_year: req.startYear,
            status: 'active',
        })
            .select('*, members(first_name, last_name)')
            .single();
        if (error)
            throw new Error(error.message);
        const loan = this.mapToModel(data);
        const schedule = Array.from({ length: req.totalInstallments }, (_, i) => {
            const totalOffset = req.startMonth - 1 + i;
            return {
                parallel_loan_id: loan.id,
                month: (totalOffset % 12) + 1,
                year: req.startYear + Math.floor(totalOffset / 12),
                amount: req.installmentAmount,
                is_paid: false,
            };
        });
        await this.dbContext.from('parallel_loan_payments').insert(schedule);
        return this.findById(loan.id);
    }
    async getPayments(loanId) {
        const { data, error } = await this.dbContext
            .from('parallel_loan_payments')
            .select('*')
            .eq('parallel_loan_id', loanId)
            .order('year')
            .order('month');
        if (error)
            throw new Error(error.message);
        return data.map(e => this.mapPayment(e));
    }
    async markPayment(paymentId, req) {
        const { data, error } = await this.dbContext
            .from('parallel_loan_payments')
            .update({
            is_paid: req.isPaid,
            paid_at: req.isPaid ? new Date().toISOString() : null,
        })
            .eq('id', paymentId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        const payment = data;
        const { data: countData } = await this.dbContext
            .from('parallel_loan_payments')
            .select('id', { count: 'exact' })
            .eq('parallel_loan_id', payment.parallel_loan_id)
            .eq('is_paid', true);
        const paidCount = countData?.length ?? 0;
        const { data: loanData } = await this.dbContext
            .from('parallel_loans')
            .select('total_installments')
            .eq('id', payment.parallel_loan_id)
            .single();
        const total = loanData?.total_installments ?? 0;
        const newStatus = paidCount >= total ? 'completed' : 'active';
        await this.dbContext
            .from('parallel_loans')
            .update({ installments_paid: paidCount, status: newStatus })
            .eq('id', payment.parallel_loan_id);
        return this.mapPayment(payment);
    }
};
exports.ParallelLoansAccess = ParallelLoansAccess;
exports.ParallelLoansAccess = ParallelLoansAccess = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [_1.DbContextService])
], ParallelLoansAccess);
//# sourceMappingURL=parallel-loans-access.service.js.map