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
exports.CashBoxAccess = void 0;
const common_1 = require("@nestjs/common");
const _1 = require(".");
const cash_box_1 = require("../../contracts/cash-box");
let CashBoxAccess = class CashBoxAccess extends _1.BaseAccessService {
    constructor(dbContextService) {
        super(dbContextService);
    }
    mapToModel(e) {
        return new cash_box_1.CashMovementAccessModel(e.id, e.group_id, e.movement_type, e.source_type, e.category, e.amount, e.month, e.year, e.created_at, e.updated_at, e.description ?? undefined, e.reference_id ?? undefined);
    }
    async getBalance(groupId) {
        const { data, error } = await this.dbContext
            .from('v_cash_balance')
            .select('*')
            .eq('group_id', groupId)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        const row = data;
        return new cash_box_1.CashBalanceAccessModel(groupId, Number(row?.total_in ?? 0), Number(row?.total_out ?? 0), Number(row?.balance ?? 0));
    }
    async getMovements(groupId, month, year) {
        let query = this.dbContext
            .from('cash_movements')
            .select('*')
            .eq('group_id', groupId)
            .order('year', { ascending: false })
            .order('month', { ascending: false });
        if (month !== undefined)
            query = query.eq('month', month);
        if (year !== undefined)
            query = query.eq('year', year);
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data.map(e => this.mapToModel(e));
    }
    async createMovement(req) {
        const { data, error } = await this.dbContext
            .from('cash_movements')
            .insert({
            group_id: req.groupId,
            movement_type: req.movementType,
            source_type: req.sourceType,
            category: req.category,
            description: req.description ?? null,
            amount: req.amount,
            month: req.month,
            year: req.year,
            reference_id: req.referenceId ?? null,
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
};
exports.CashBoxAccess = CashBoxAccess;
exports.CashBoxAccess = CashBoxAccess = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [_1.DbContextService])
], CashBoxAccess);
//# sourceMappingURL=cash-box-access.service.js.map