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
exports.CashBoxController = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../../manager/services");
const cash_box_1 = require("../contracts/cash-box");
let CashBoxController = class CashBoxController {
    constructor(cashBoxManager) {
        this.cashBoxManager = cashBoxManager;
    }
    getBalance(groupId) {
        return this.cashBoxManager.getBalance(groupId);
    }
    getMovements(groupId, month, year) {
        return this.cashBoxManager.getMovements(groupId, month ? Number(month) : undefined, year ? Number(year) : undefined);
    }
    createMovement(groupId, body) {
        return this.cashBoxManager.createMovement({ ...body, groupId, sourceType: 'manual' });
    }
};
exports.CashBoxController = CashBoxController;
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CashBoxController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('movements'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CashBoxController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Post)('movements'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cash_box_1.CreateCashMovementApiRequest]),
    __metadata("design:returntype", Promise)
], CashBoxController.prototype, "createMovement", null);
exports.CashBoxController = CashBoxController = __decorate([
    (0, common_1.Controller)('groups/:groupId/cash-box'),
    __metadata("design:paramtypes", [services_1.CashBoxManager])
], CashBoxController);
//# sourceMappingURL=cash-box.controller.js.map