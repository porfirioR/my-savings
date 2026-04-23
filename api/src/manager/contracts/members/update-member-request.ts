export class UpdateMemberRequest {
  constructor(
    public firstName?: string,
    public lastName?: string,
    public phone?: string,
    public position?: number,
    public isActive?: boolean,
    public joinedMonth?: number,
    public joinedYear?: number,
  ) {}
}
