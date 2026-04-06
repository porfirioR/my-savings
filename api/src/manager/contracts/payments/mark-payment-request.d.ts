export declare class MarkPaymentRequest {
    isPaid: boolean;
    paymentSource?: 'member' | 'cash_box';
    constructor(isPaid: boolean, paymentSource?: 'member' | 'cash_box');
}
