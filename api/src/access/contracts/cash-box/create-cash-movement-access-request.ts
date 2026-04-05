export class CreateCashMovementAccessRequest {
  constructor(
    public groupId: string,
    public movementType: 'in' | 'out',
    public sourceType: 'automatic' | 'manual',
    public category: string,
    public amount: number,
    public month: number,
    public year: number,
    public description?: string,
    public referenceId?: string,
  ) {}
}
