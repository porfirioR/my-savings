export class CreatePaymentAccessRequest {
  constructor(
    public date: Date,
    public savingid: number,
    public amount: number,
    public refund: boolean,
    public savingId: number
  ) {}
}
