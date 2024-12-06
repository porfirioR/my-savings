import { CreatePaymentRequest } from "./create-payment-request";

export class UpdatePaymentRequest extends CreatePaymentRequest {
  constructor(
    public id: number,
    public date: Date,
    public savingId: number,
    public amount: number,
    public refund: boolean
  ) {
    super(
      date,
      savingId,
      amount,
      refund
    );
  }
}
