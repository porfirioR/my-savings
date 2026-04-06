import { BaseAccessService, DbContextService } from '.';
import { CreateMemberAccessRequest, ExitMemberAccessRequest, MemberAccessModel, UpdateMemberAccessRequest } from '../../../access/contracts/members';
export declare class MembersAccess extends BaseAccessService {
    constructor(dbContextService: DbContextService);
    private mapToModel;
    findByGroup(groupId: string): Promise<MemberAccessModel[]>;
    findById(id: string): Promise<MemberAccessModel>;
    create(req: CreateMemberAccessRequest): Promise<MemberAccessModel>;
    update(id: string, req: UpdateMemberAccessRequest): Promise<MemberAccessModel>;
    processExit(id: string, req: ExitMemberAccessRequest): Promise<MemberAccessModel>;
}
