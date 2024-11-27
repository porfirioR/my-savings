export class SavingAccessModel {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public date: Date,
    public isActive: boolean,
    public numberOfPayment: number,
    public totalAmount: number,
    public savingTypeId: number,
    public currencyId: number,
    public userId: number
  ) { }
}
