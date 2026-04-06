import { BaseAccessService, DbContextService } from '.';
import { CreateRuedaAccessRequest, CreateRuedaSlotAccessRequest, RuedaAccessModel, RuedaSlotAccessModel, UpdateRuedaAccessRequest } from '../../../access/contracts/ruedas';
interface CashBalanceSuggestion {
    suggestedLoanAmount: number;
    cajaBalance: number;
    projectedMonthlyIncome: number;
}
export declare class RuedasAccess extends BaseAccessService {
    constructor(dbContextService: DbContextService);
    private mapSlotToModel;
    private mapToModel;
    findByGroup(groupId: string): Promise<RuedaAccessModel[]>;
    findById(id: string): Promise<RuedaAccessModel>;
    findActive(groupId: string): Promise<RuedaAccessModel | null>;
    create(req: CreateRuedaAccessRequest): Promise<RuedaAccessModel>;
    update(id: string, req: UpdateRuedaAccessRequest): Promise<RuedaAccessModel>;
    upsertSlots(ruedaId: string, slots: CreateRuedaSlotAccessRequest[]): Promise<RuedaSlotAccessModel[]>;
    calculateSuggestion(groupId: string): Promise<CashBalanceSuggestion>;
}
export {};
