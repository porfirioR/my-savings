export declare class MarkPaymentApiRequest {
    isPaid: boolean;
    paymentSource?: 'member' | 'cash_box';
    constructor(partial?: Partial<MarkPaymentApiRequest>);
}
