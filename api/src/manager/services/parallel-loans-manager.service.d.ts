import { ParallelLoansAccess } from '../../access/data/services';
import { CreateParallelLoanRequest, MarkLoanPaymentRequest, ParallelLoanModel, ParallelLoanPaymentModel } from '../contracts/parallel-loans';
export declare class ParallelLoansManager {
    private readonly parallelLoansAccess;
    constructor(parallelLoansAccess: ParallelLoansAccess);
    private mapPayment;
    private mapToModel;
    findByGroup(groupId: string): Promise<ParallelLoanModel[]>;
    findById(id: string): Promise<ParallelLoanModel>;
    create(req: CreateParallelLoanRequest): Promise<ParallelLoanModel>;
    getPayments(loanId: string): Promise<ParallelLoanPaymentModel[]>;
    markPayment(paymentId: string, req: MarkLoanPaymentRequest): Promise<ParallelLoanPaymentModel>;
}
