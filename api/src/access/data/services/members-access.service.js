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
exports.MembersAccess = void 0;
const common_1 = require("@nestjs/common");
const _1 = require(".");
let MembersAccess = class MembersAccess extends _1.BaseAccessService {
    constructor(dbContextService) {
        super(dbContextService);
    }
    mapToModel(entity) {
        return {
            id: entity.id,
            groupId: entity.group_id,
            firstName: entity.first_name,
            lastName: entity.last_name,
            phone: entity.phone,
            position: entity.position,
            isActive: entity.is_active,
            joinedMonth: entity.joined_month,
            joinedYear: entity.joined_year,
            leftMonth: entity.left_month,
            leftYear: entity.left_year,
            createdAt: entity.created_at,
            updatedAt: entity.updated_at,
        };
    }
    async findByGroup(groupId) {
        const { data, error } = await this.dbContext
            .from('members')
            .select('*')
            .eq('group_id', groupId)
            .order('position', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data.map((e) => this.mapToModel(e));
    }
    async findById(id) {
        const { data, error } = await this.dbContext
            .from('members')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
    async create(req) {
        const { data, error } = await this.dbContext
            .from('members')
            .insert({
            group_id: req.groupId,
            first_name: req.firstName,
            last_name: req.lastName,
            phone: req.phone ?? null,
            position: req.position,
            is_active: true,
            joined_month: req.joinedMonth,
            joined_year: req.joinedYear,
            left_month: null,
            left_year: null,
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
    async update(id, req) {
        const updatePayload = {};
        if (req.firstName !== undefined)
            updatePayload.first_name = req.firstName;
        if (req.lastName !== undefined)
            updatePayload.last_name = req.lastName;
        if (req.phone !== undefined)
            updatePayload.phone = req.phone;
        if (req.position !== undefined)
            updatePayload.position = req.position;
        if (req.isActive !== undefined)
            updatePayload.is_active = req.isActive;
        if (req.joinedMonth !== undefined)
            updatePayload.joined_month = req.joinedMonth;
        if (req.joinedYear !== undefined)
            updatePayload.joined_year = req.joinedYear;
        const { data, error } = await this.dbContext
            .from('members')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
    async processExit(id, req) {
        const { data, error } = await this.dbContext
            .from('members')
            .update({
            is_active: false,
            left_month: req.leftMonth,
            left_year: req.leftYear,
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapToModel(data);
    }
};
exports.MembersAccess = MembersAccess;
exports.MembersAccess = MembersAccess = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [_1.DbContextService])
], MembersAccess);
//# sourceMappingURL=members-access.service.js.map