export class CreatePaymentAccessRequest {
  constructor(
    public date: Date,
    public savingId: number,
    public amount: number,
    public refund: boolean
  ) {}
}
