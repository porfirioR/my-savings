export class CashMovementModel {
  constructor(
    public id: string,
    public groupId: string,
    public movementType: 'in' | 'out',
    public sourceType: 'automatic' | 'manual',
    public category: string,
    public amount: number,
    public month: number,
    public year: number,
    public createdAt: string,
    public updatedAt: string,
    public description?: string,
    public referenceId?: string,
  ) {}
}
