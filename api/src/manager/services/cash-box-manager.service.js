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
exports.CashBoxManager = void 0;
const common_1 = require("@nestjs/common");
const cash_box_1 = require("../contracts/cash-box");
const services_1 = require("../../access/data/services");
let CashBoxManager = class CashBoxManager {
    constructor(cashBoxAccess) {
        this.cashBoxAccess = cashBoxAccess;
    }
    mapMovement(a) {
        return new cash_box_1.CashMovementModel(a.id, a.groupId, a.movementType, a.sourceType, a.category, a.amount, a.month, a.year, a.createdAt, a.updatedAt, a.description, a.referenceId);
    }
    mapBalance(a) {
        return new cash_box_1.CashBalanceModel(a.groupId, a.totalIn, a.totalOut, a.balance);
    }
    async getBalance(groupId) {
        return this.mapBalance(await this.cashBoxAccess.getBalance(groupId));
    }
    async getMovements(groupId, month, year) {
        return (await this.cashBoxAccess.getMovements(groupId, month, year)).map(m => this.mapMovement(m));
    }
    async createMovement(req) {
        return this.mapMovement(await this.cashBoxAccess.createMovement(req));
    }
};
exports.CashBoxManager = CashBoxManager;
exports.CashBoxManager = CashBoxManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_1.CashBoxAccess])
], CashBoxManager);
//# sourceMappingURL=cash-box-manager.service.js.map