import { CreateRuedaApiRequest, UpdateRuedaApiRequest } from '../contracts/ruedas';
import { RuedaModel } from '../../manager/contracts/ruedas';
import { RuedasManager } from '../../manager/services';
export declare class RuedasController {
    private readonly ruedasManager;
    constructor(ruedasManager: RuedasManager);
    findByGroup(groupId: string): Promise<RuedaModel[]>;
    create(groupId: string, body: CreateRuedaApiRequest): Promise<RuedaModel>;
    findActive(groupId: string): Promise<RuedaModel | null>;
    calculateSuggestion(groupId: string): Promise<{
        suggested: number;
    }>;
    findById(id: string): Promise<RuedaModel>;
    update(id: string, body: UpdateRuedaApiRequest): Promise<RuedaModel>;
}
