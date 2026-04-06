import { MembersManager } from '../../manager/services';
import { MemberModel } from '../../manager/contracts/members';
import { CreateMemberApiRequest, ExitMemberApiRequest, UpdateMemberApiRequest } from '../contracts/members';
export declare class MembersController {
    private readonly membersManager;
    constructor(membersManager: MembersManager);
    findByGroup(groupId: string): Promise<MemberModel[]>;
    create(groupId: string, body: CreateMemberApiRequest): Promise<MemberModel>;
    findById(id: string): Promise<MemberModel>;
    update(id: string, body: UpdateMemberApiRequest): Promise<MemberModel>;
    processExit(id: string, body: ExitMemberApiRequest): Promise<{
        member: MemberModel;
        memberReceives: number;
        memberPays: number;
    }>;
}
