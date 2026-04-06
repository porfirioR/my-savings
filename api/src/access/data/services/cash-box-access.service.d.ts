import { BaseAccessService, DbContextService } from '.';
import { CashBalanceAccessModel, CashMovementAccessModel, CreateCashMovementAccessRequest } from '../../contracts/cash-box';
export declare class CashBoxAccess extends BaseAccessService {
    constructor(dbContextService: DbContextService);
    private mapToModel;
    getBalance(groupId: string): Promise<CashBalanceAccessModel>;
    getMovements(groupId: string, month?: number, year?: number): Promise<CashMovementAccessModel[]>;
    createMovement(req: CreateCashMovementAccessRequest): Promise<CashMovementAccessModel>;
}
