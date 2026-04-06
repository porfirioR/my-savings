"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerModule = void 0;
const common_1 = require("@nestjs/common");
const data_module_1 = require("../access/data/data.module");
const services_1 = require("./services");
const services = [
    services_1.CashBoxManager,
    services_1.GroupsManager,
    services_1.MembersManager,
    services_1.ParallelLoansManager,
    services_1.PaymentsManager,
    services_1.RuedasManager,
];
let ManagerModule = class ManagerModule {
};
exports.ManagerModule = ManagerModule;
exports.ManagerModule = ManagerModule = __decorate([
    (0, common_1.Module)({
        imports: [data_module_1.DataModule],
        providers: services,
        exports: services,
    })
], ManagerModule);
//# sourceMappingURL=manager.module.js.map