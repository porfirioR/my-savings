export class PaymentModel {
  constructor(
    public id: number,
    public amount: number,
    public date: Date,
    public refund: boolean,
    public savingId: number
  ) {}
}
