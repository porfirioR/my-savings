export declare class MarkPaymentAccessRequest {
    isPaid: boolean;
    paymentSource?: 'member' | 'cash_box';
    constructor(isPaid: boolean, paymentSource?: 'member' | 'cash_box');
}
