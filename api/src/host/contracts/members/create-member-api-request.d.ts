export declare class CreateMemberApiRequest {
    firstName: string;
    lastName: string;
    phone?: string;
    position: number;
    joinedMonth: number;
    joinedYear: number;
    constructor(partial?: Partial<CreateMemberApiRequest>);
}
