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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersController = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../../manager/services");
const members_1 = require("../../manager/contracts/members");
const members_2 = require("../contracts/members");
let MembersController = class MembersController {
    constructor(membersManager) {
        this.membersManager = membersManager;
    }
    findByGroup(groupId) {
        return this.membersManager.findByGroup(groupId);
    }
    create(groupId, body) {
        return this.membersManager.create({ ...body, groupId });
    }
    findById(id) {
        return this.membersManager.findById(id);
    }
    update(id, body) {
        return this.membersManager.update(id, body);
    }
    processExit(id, body) {
        return this.membersManager.processExit(id, new members_1.ExitMemberRequest(body.leftMonth, body.leftYear), body.accumulatedContributions, body.remainingLoanBalance);
    }
};
exports.MembersController = MembersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "findByGroup", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, members_2.CreateMemberApiRequest]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, members_2.UpdateMemberApiRequest]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/exit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, members_2.ExitMemberApiRequest]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "processExit", null);
exports.MembersController = MembersController = __decorate([
    (0, common_1.Controller)('groups/:groupId/members'),
    __metadata("design:paramtypes", [services_1.MembersManager])
], MembersController);
//# sourceMappingURL=members.controller.js.map