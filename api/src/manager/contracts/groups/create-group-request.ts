export class CreateGroupRequest {
  constructor(
    public name: string,
    public startMonth: number,
    public startYear: number,
  ) {}
}
