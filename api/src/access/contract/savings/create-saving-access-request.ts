export class CreateSavingAccessRequest {
  constructor(
    public name: string,
    public description: string,
    public date: Date,
    public numberOfPayment: number,
    public totalAmount: number,
    public savingTypeId: number,
    public currencyId: number,
    public userId: number
  ) { }
}
