export class GroupAccessModel {
  constructor(
    public id: string,
    public name: string,
    public startMonth: number,
    public startYear: number,
    public totalRuedas: number,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
