import { BaseAccessService, DbContextService } from '.';
import { CreateParallelLoanAccessRequest, MarkLoanPaymentAccessRequest, ParallelLoanAccessModel, ParallelLoanPaymentAccessModel } from '../../contracts/parallel-loans';
export declare class ParallelLoansAccess extends BaseAccessService {
    constructor(dbContextService: DbContextService);
    private mapPayment;
    private mapToModel;
    findByGroup(groupId: string): Promise<ParallelLoanAccessModel[]>;
    findById(id: string): Promise<ParallelLoanAccessModel>;
    create(req: CreateParallelLoanAccessRequest): Promise<ParallelLoanAccessModel>;
    getPayments(loanId: string): Promise<ParallelLoanPaymentAccessModel[]>;
    markPayment(paymentId: string, req: MarkLoanPaymentAccessRequest): Promise<ParallelLoanPaymentAccessModel>;
}
