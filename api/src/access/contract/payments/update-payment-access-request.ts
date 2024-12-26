import { CreatePaymentAccessRequest } from './create-payment-access-request'

export class UpdatePaymentAccessRequest extends CreatePaymentAccessRequest {
  constructor(
    public id: number,
    public date: Date,
    public savingId: number,
    public amount: number,
    public refund: boolean
  ) {
    super(date, savingId, amount, refund)
  }
}
