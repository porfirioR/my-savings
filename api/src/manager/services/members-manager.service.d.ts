import { MembersAccess } from '../../access/data/services';
import { CreateMemberRequest, ExitMemberRequest, MemberModel, UpdateMemberRequest } from '../contracts/members';
export declare class MembersManager {
    private readonly membersAccess;
    constructor(membersAccess: MembersAccess);
    private mapToModel;
    findByGroup(groupId: string): Promise<MemberModel[]>;
    findById(id: string): Promise<MemberModel>;
    create(req: CreateMemberRequest): Promise<MemberModel>;
    update(id: string, req: UpdateMemberRequest): Promise<MemberModel>;
    processExit(id: string, req: ExitMemberRequest, accumulatedContributions: number, remainingLoanBalance: number): Promise<{
        member: MemberModel;
        memberReceives: number;
        memberPays: number;
    }>;
}
