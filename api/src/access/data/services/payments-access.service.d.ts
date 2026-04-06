import { BaseAccessService, DbContextService } from '.';
import { GeneratePaymentsAccessRequest, MarkPaymentAccessRequest, PaymentAccessModel } from '../../../access/contracts/payments';
export declare class PaymentsAccess extends BaseAccessService {
    constructor(dbContextService: DbContextService);
    private mapToModel;
    findByRuedaAndMonth(ruedaId: string, month: number, year: number): Promise<PaymentAccessModel[]>;
    findById(id: string): Promise<PaymentAccessModel>;
    generateMonthlyPayments(req: GeneratePaymentsAccessRequest): Promise<PaymentAccessModel[]>;
    markPayment(id: string, req: MarkPaymentAccessRequest): Promise<PaymentAccessModel>;
}
