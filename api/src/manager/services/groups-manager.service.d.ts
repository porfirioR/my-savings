import { GroupsAccess } from '../../access/data/services';
import { CreateGroupRequest, GroupModel, UpdateGroupRequest } from '../contracts/groups';
export declare class GroupsManager {
    private readonly groupsAccess;
    constructor(groupsAccess: GroupsAccess);
    private mapToModel;
    findAll(): Promise<GroupModel[]>;
    findById(id: string): Promise<GroupModel>;
    create(req: CreateGroupRequest): Promise<GroupModel>;
    update(id: string, req: UpdateGroupRequest): Promise<GroupModel>;
}
