"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAccessService = void 0;
class BaseAccessService {
    constructor(dbContextService) {
        this.dbContextService = dbContextService;
        this.dbContext = this.dbContextService.getConnection();
    }
}
exports.BaseAccessService = BaseAccessService;
//# sourceMappingURL=base-access.service.js.map