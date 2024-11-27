import { CreateSavingAccessRequest } from "./create-saving-access-request";

export class UpdateSavingAccessRequest extends CreateSavingAccessRequest {
  constructor(
    public id: number,
    public isActive: boolean,
    public name: string,
    public description: string,
    public date: Date,
    public numberOfPayment: number,
    public totalAmount: number,
    public savingTypeId: number,
    public currencyId: number,
    public userId: number
  ) {
    super(
      name,
      description,
      date,
      numberOfPayment,
      totalAmount,
      savingTypeId,
      currencyId,
      userId
    )
  }
}
