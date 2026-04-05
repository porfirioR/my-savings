export interface MarkPaymentRequest {
  isPaid: boolean;
  paymentSource?: 'member' | 'cash_box';
}
