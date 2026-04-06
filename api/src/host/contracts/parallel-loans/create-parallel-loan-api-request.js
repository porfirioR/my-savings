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
exports.CreateParallelLoanApiRequest = void 0;
const class_validator_1 = require("class-validator");
class CreateParallelLoanApiRequest {
    constructor(partial) {
        if (partial)
            Object.assign(this, partial);
    }
}
exports.CreateParallelLoanApiRequest = CreateParallelLoanApiRequest;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateParallelLoanApiRequest.prototype, "memberId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateParallelLoanApiRequest.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateParallelLoanApiRequest.prototype, "interestRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateParallelLoanApiRequest.prototype, "totalInstallments", void 0);
__decorate([
    (0, class_validator_1.IsEnum)([500, 1000]),
    __metadata("design:type", Number)
], CreateParallelLoanApiRequest.prototype, "roundingUnit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], CreateParallelLoanApiRequest.prototype, "startMonth", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], CreateParallelLoanApiRequest.prototype, "startYear", void 0);
//# sourceMappingURL=create-parallel-loan-api-request.js.map