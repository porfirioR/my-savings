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
exports.GroupsAccess = void 0;
const common_1 = require("@nestjs/common");
const _1 = require(".");
let GroupsAccess = class GroupsAccess extends _1.BaseAccessService {
    constructor(dbContextService) {
        super(dbContextService);
    }
    mapToModel(entity) {
        return {
            id: entity.id,
            name: entity.name,
            startMonth: entity.start_month,
            startYear: entity.start_year,
            totalRuedas: entity.total_ruedas,
            createdAt: entity.created_at,
            updatedAt: entity.updated_at,
        };
    }
    async findAll() {
        const { data, error } = await this.dbContext
            .from('groups')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data.map((e) => this.mapToModel(e));
    }
    async findById(id) {
        const { data, error } = await this.dbContext
            .from('groups')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
    async create(req) {
        const { data, error } = await this.dbContext
            .from('groups')
            .insert({
            name: req.name,
            start_month: req.startMonth,
            start_year: req.startYear,
            total_ruedas: 0,
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
    async update(id, req) {
        const updatePayload = {};
        if (req.name !== undefined)
            updatePayload.name = req.name;
        if (req.startMonth !== undefined)
            updatePayload.start_month = req.startMonth;
        if (req.startYear !== undefined)
            updatePayload.start_year = req.startYear;
        if (req.totalRuedas !== undefined)
            updatePayload.total_ruedas = req.totalRuedas;
        const { data, error } = await this.dbContext
            .from('groups')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
    async incrementTotalRuedas(id) {
        const current = await this.findById(id);
        const { error } = await this.dbContext
            .from('groups')
            .update({ total_ruedas: current.totalRuedas + 1 })
            .eq('id', id);
        if (error)
            throw new Error(error.message);
    }
};
exports.GroupsAccess = GroupsAccess;
exports.GroupsAccess = GroupsAccess = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [_1.DbContextService])
], GroupsAccess);
//# sourceMappingURL=groups-access.service.js.map