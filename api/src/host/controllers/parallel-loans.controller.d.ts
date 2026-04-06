import { ParallelLoansManager } from '../../manager/services';
import { ParallelLoanModel, ParallelLoanPaymentModel } from '../../manager/contracts/parallel-loans';
import { CreateParallelLoanApiRequest } from '../contracts/parallel-loans';
export declare class ParallelLoansController {
    private readonly parallelLoansManager;
    constructor(parallelLoansManager: ParallelLoansManager);
    findByGroup(groupId: string): Promise<ParallelLoanModel[]>;
    create(groupId: string, body: CreateParallelLoanApiRequest): Promise<ParallelLoanModel>;
    findById(id: string): Promise<ParallelLoanModel>;
    getPayments(id: string): Promise<ParallelLoanPaymentModel[]>;
    markPayment(paymentId: string): Promise<ParallelLoanPaymentModel>;
}
