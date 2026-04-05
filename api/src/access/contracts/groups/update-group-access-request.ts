export class UpdateGroupAccessRequest {
  constructor(
    public name?: string,
    public startMonth?: number,
    public startYear?: number,
    public totalRuedas?: number,
  ) {}
}
