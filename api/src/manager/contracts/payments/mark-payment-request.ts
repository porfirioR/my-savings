export class MarkPaymentRequest {
  constructor(
    public isPaid: boolean,
    public paymentSource?: 'member' | 'cash_box',
  ) {}
}
