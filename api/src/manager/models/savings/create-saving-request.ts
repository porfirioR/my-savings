export class CreateSavingRequest {
  constructor(
    public name: string,
    public description: string,
    public isActive: boolean,
    public date: Date,
    public savingTypeId: number,
    public currencyId: number,
    public userId: number,
    public periodId?: number,
    public totalAmount?: number,
    public numberOfPayment?: number,
  ) {}
}
