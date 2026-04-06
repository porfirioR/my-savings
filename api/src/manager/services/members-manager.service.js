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
exports.MembersManager = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../../access/data/services");
const members_1 = require("../contracts/members");
const helpers_1 = require("../../utility/helpers");
let MembersManager = class MembersManager {
    constructor(membersAccess) {
        this.membersAccess = membersAccess;
    }
    mapToModel(a) {
        return new members_1.MemberModel(a.id, a.groupId, a.firstName, a.lastName, a.phone, a.position, a.isActive, a.joinedMonth, a.joinedYear, a.leftMonth, a.leftYear, a.createdAt, a.updatedAt);
    }
    async findByGroup(groupId) {
        return (await this.membersAccess.findByGroup(groupId)).map(m => this.mapToModel(m));
    }
    async findById(id) {
        return this.mapToModel(await this.membersAccess.findById(id));
    }
    async create(req) {
        return this.mapToModel(await this.membersAccess.create(req));
    }
    async update(id, req) {
        return this.mapToModel(await this.membersAccess.update(id, req));
    }
    async processExit(id, req, accumulatedContributions, remainingLoanBalance) {
        const settlement = (0, helpers_1.calculateMemberExitSettlement)(accumulatedContributions, remainingLoanBalance);
        const updated = await this.membersAccess.processExit(id, req);
        return { member: this.mapToModel(updated), ...settlement };
    }
};
exports.MembersManager = MembersManager;
exports.MembersManager = MembersManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_1.MembersAccess])
], MembersManager);
//# sourceMappingURL=members-manager.service.js.map