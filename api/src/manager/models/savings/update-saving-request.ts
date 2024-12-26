import { CreateSavingRequest } from "./create-saving-request"

export class UpdateSavingRequest extends CreateSavingRequest {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public isActive: boolean,
    public date: Date,
    public savingTypeId: number,
    public currencyId: number,
    public userid: number,
    public periodId?: number,
    public totalAmount?: number,
    public numberOfPayment?: number,
  ) {
    super(
      name,
      description,
      isActive,
      date,
      savingTypeId,
      currencyId,
      userid,
      periodId,
      totalAmount,
      numberOfPayment
    )
  }
}
