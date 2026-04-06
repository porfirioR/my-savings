import { CashBoxManager } from '../../manager/services';
import { CashBalanceModel, CashMovementModel } from '../../manager/contracts/cash-box';
import { CreateCashMovementApiRequest } from '../contracts/cash-box';
export declare class CashBoxController {
    private readonly cashBoxManager;
    constructor(cashBoxManager: CashBoxManager);
    getBalance(groupId: string): Promise<CashBalanceModel>;
    getMovements(groupId: string, month?: string, year?: string): Promise<CashMovementModel[]>;
    createMovement(groupId: string, body: CreateCashMovementApiRequest): Promise<CashMovementModel>;
}
