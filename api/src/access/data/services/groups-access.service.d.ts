import { BaseAccessService, DbContextService } from '.';
import { CreateGroupAccessRequest, GroupAccessModel, UpdateGroupAccessRequest } from '../../../access/contracts/groups';
export declare class GroupsAccess extends BaseAccessService {
    constructor(dbContextService: DbContextService);
    private mapToModel;
    findAll(): Promise<GroupAccessModel[]>;
    findById(id: string): Promise<GroupAccessModel>;
    create(req: CreateGroupAccessRequest): Promise<GroupAccessModel>;
    update(id: string, req: UpdateGroupAccessRequest): Promise<GroupAccessModel>;
    incrementTotalRuedas(id: string): Promise<void>;
}
