export interface MarkPaymentAccessRequest {
  isPaid: boolean;
  paymentSource?: 'member' | 'cash_box';
}
