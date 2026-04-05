export class MarkPaymentAccessRequest {
  constructor(
    public isPaid: boolean,
    public paymentSource?: 'member' | 'cash_box',
  ) {}
}
