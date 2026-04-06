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
exports.RuedasController = void 0;
const common_1 = require("@nestjs/common");
const ruedas_1 = require("../contracts/ruedas");
const services_1 = require("../../manager/services");
let RuedasController = class RuedasController {
    constructor(ruedasManager) {
        this.ruedasManager = ruedasManager;
    }
    async findByGroup(groupId) {
        return this.ruedasManager.findByGroup(groupId);
    }
    async create(groupId, body) {
        return this.ruedasManager.create({ ...body, groupId });
    }
    async findActive(groupId) {
        return this.ruedasManager.findActive(groupId);
    }
    async calculateSuggestion(groupId) {
        const res = await this.ruedasManager.calculateSuggestion(groupId);
        return { suggested: res.suggestedLoanAmount };
    }
    async findById(id) {
        return this.ruedasManager.findById(id);
    }
    async update(id, body) {
        return this.ruedasManager.update(id, body);
    }
};
exports.RuedasController = RuedasController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RuedasController.prototype, "findByGroup", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ruedas_1.CreateRuedaApiRequest]),
    __metadata("design:returntype", Promise)
], RuedasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RuedasController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('suggest-amount'),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RuedasController.prototype, "calculateSuggestion", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RuedasController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ruedas_1.UpdateRuedaApiRequest]),
    __metadata("design:returntype", Promise)
], RuedasController.prototype, "update", null);
exports.RuedasController = RuedasController = __decorate([
    (0, common_1.Controller)('groups/:groupId/ruedas'),
    __metadata("design:paramtypes", [services_1.RuedasManager])
], RuedasController);
//# sourceMappingURL=ruedas.controller.js.map