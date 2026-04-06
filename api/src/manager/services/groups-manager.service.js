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
exports.GroupsManager = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../../access/data/services");
let GroupsManager = class GroupsManager {
    constructor(groupsAccess) {
        this.groupsAccess = groupsAccess;
    }
    mapToModel(accessModel) {
        return {
            id: accessModel.id,
            name: accessModel.name,
            startMonth: accessModel.startMonth,
            startYear: accessModel.startYear,
            totalRuedas: accessModel.totalRuedas,
            createdAt: accessModel.createdAt,
            updatedAt: accessModel.updatedAt,
        };
    }
    async findAll() {
        const result = await this.groupsAccess.findAll();
        return result.map((m) => this.mapToModel(m));
    }
    async findById(id) {
        const result = await this.groupsAccess.findById(id);
        return this.mapToModel(result);
    }
    async create(req) {
        const result = await this.groupsAccess.create(req);
        return this.mapToModel(result);
    }
    async update(id, req) {
        const result = await this.groupsAccess.update(id, req);
        return this.mapToModel(result);
    }
};
exports.GroupsManager = GroupsManager;
exports.GroupsManager = GroupsManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_1.GroupsAccess])
], GroupsManager);
//# sourceMappingURL=groups-manager.service.js.map