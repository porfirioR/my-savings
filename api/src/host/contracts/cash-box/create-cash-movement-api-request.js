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
exports.CreateCashMovementApiRequest = void 0;
const class_validator_1 = require("class-validator");
class CreateCashMovementApiRequest {
    constructor(partial) {
        if (partial)
            Object.assign(this, partial);
    }
}
exports.CreateCashMovementApiRequest = CreateCashMovementApiRequest;
__decorate([
    (0, class_validator_1.IsEnum)(['in', 'out']),
    __metadata("design:type", String)
], CreateCashMovementApiRequest.prototype, "movementType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['automatic', 'manual']),
    __metadata("design:type", String)
], CreateCashMovementApiRequest.prototype, "sourceType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashMovementApiRequest.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCashMovementApiRequest.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCashMovementApiRequest.prototype, "month", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], CreateCashMovementApiRequest.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashMovementApiRequest.prototype, "description", void 0);
//# sourceMappingURL=create-cash-movement-api-request.js.map