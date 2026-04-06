export declare class CreateMemberAccessRequest {
    groupId: string;
    firstName: string;
    lastName: string;
    position: number;
    joinedMonth: number;
    joinedYear: number;
    phone?: string;
    constructor(groupId: string, firstName: string, lastName: string, position: number, joinedMonth: number, joinedYear: number, phone?: string);
}
