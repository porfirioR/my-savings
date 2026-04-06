export interface ParallelLoanPaymentEntity {
    id: string;
    parallel_loan_id: string;
    month: number;
    year: number;
    amount: number;
    is_paid: boolean;
    paid_at: string | null;
    created_at: string;
}
