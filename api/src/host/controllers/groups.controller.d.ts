import { GroupsManager } from '../../manager/services';
import { GroupModel } from '../../manager/contracts/groups';
import { CreateGroupApiRequest, UpdateGroupApiRequest } from '../contracts/groups';
export declare class GroupsController {
    private readonly groupsManager;
    constructor(groupsManager: GroupsManager);
    findAll(): Promise<GroupModel[]>;
    create(body: CreateGroupApiRequest): Promise<GroupModel>;
    findById(id: string): Promise<GroupModel>;
    update(id: string, body: UpdateGroupApiRequest): Promise<GroupModel>;
}
