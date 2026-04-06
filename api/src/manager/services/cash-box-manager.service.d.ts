import { CashBalanceModel, CashMovementModel, CreateCashMovementRequest } from '../contracts/cash-box';
import { CashBoxAccess } from '../../access/data/services';
export declare class CashBoxManager {
    private readonly cashBoxAccess;
    constructor(cashBoxAccess: CashBoxAccess);
    private mapMovement;
    private mapBalance;
    getBalance(groupId: string): Promise<CashBalanceModel>;
    getMovements(groupId: string, month?: number, year?: number): Promise<CashMovementModel[]>;
    createMovement(req: CreateCashMovementRequest): Promise<CashMovementModel>;
}
