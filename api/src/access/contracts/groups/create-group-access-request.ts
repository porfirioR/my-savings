export class CreateGroupAccessRequest {
  constructor(
    public name: string,
    public startMonth: number,
    public startYear: number,
  ) {}
}
