import { PaymentsAccess } from '../../access/data/services';
import { GeneratePaymentsRequest, MarkPaymentRequest, PaymentModel } from '../contracts/payments';
export declare class PaymentsManager {
    private readonly paymentsAccess;
    constructor(paymentsAccess: PaymentsAccess);
    private mapToModel;
    findByRuedaAndMonth(ruedaId: string, month: number, year: number): Promise<PaymentModel[]>;
    generateMonthlyPayments(req: GeneratePaymentsRequest): Promise<PaymentModel[]>;
    markPayment(id: string, req: MarkPaymentRequest): Promise<PaymentModel>;
}
