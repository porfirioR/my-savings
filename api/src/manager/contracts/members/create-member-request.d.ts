export declare class CreateMemberRequest {
    groupId: string;
    firstName: string;
    lastName: string;
    position: number;
    joinedMonth: number;
    joinedYear: number;
    phone?: string;
    constructor(groupId: string, firstName: string, lastName: string, position: number, joinedMonth: number, joinedYear: number, phone?: string);
}
