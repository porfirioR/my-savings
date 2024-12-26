export class CreatePaymentRequest {
  constructor(
    public date: Date,
    public savingId: number,
    public amount: number,
    public refund: boolean
  ) {}
}
