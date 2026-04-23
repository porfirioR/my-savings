export class CreateMemberAccessRequest {
  constructor(
    public groupId: string,
    public firstName: string,
    public lastName: string,
    public position: number,
    public joinedMonth: number,
    public joinedYear: number,
    public phone?: string,
  ) {}
}
