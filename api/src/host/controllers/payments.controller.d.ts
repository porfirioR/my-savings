import { GeneratePaymentsApiRequest } from '../contracts/payments';
import { PaymentModel } from '../../manager/contracts/payments';
import { PaymentsManager } from '../../manager/services';
export declare class PaymentsController {
    private readonly paymentsManager;
    constructor(paymentsManager: PaymentsManager);
    findByRuedaAndMonth(ruedaId: string, month: string, year: string): Promise<PaymentModel[]>;
    generateMonthlyPayments(ruedaId: string, body: GeneratePaymentsApiRequest): Promise<PaymentModel[]>;
    markPaid(id: string): Promise<PaymentModel>;
    markUnpaid(id: string): Promise<PaymentModel>;
}
