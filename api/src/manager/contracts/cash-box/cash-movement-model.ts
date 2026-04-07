export class CashMovementModel {
  constructor(
    public id: string,
    public groupId: string,
    public type: 'in' | 'out',
    public category: string,
    public amount: number,
    public month: number,
    public year: number,
    public createdAt: string,
    public updatedAt: string,
    public description?: string,
  ) {}
}
