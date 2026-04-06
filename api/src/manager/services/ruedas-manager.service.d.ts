import { RuedasAccess } from '../../access/data/services';
import { CreateRuedaRequest, RuedaModel, UpdateRuedaRequest } from '../contracts/ruedas';
export declare class RuedasManager {
    private readonly ruedasAccess;
    constructor(ruedasAccess: RuedasAccess);
    private mapSlotToModel;
    private mapToModel;
    findByGroup(groupId: string): Promise<RuedaModel[]>;
    findById(id: string): Promise<RuedaModel>;
    findActive(groupId: string): Promise<RuedaModel | null>;
    create(req: CreateRuedaRequest): Promise<RuedaModel>;
    update(id: string, req: UpdateRuedaRequest): Promise<RuedaModel>;
    calculateSuggestion(groupId: string): Promise<{
        suggestedLoanAmount: number;
        cajaBalance: number;
        projectedMonthlyIncome: number;
    }>;
}
