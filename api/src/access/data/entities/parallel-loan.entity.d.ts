export interface ParallelLoanEntity {
    id: string;
    group_id: string;
    member_id: string;
    amount: number;
    interest_rate: number;
    total_to_return: number;
    installment_amount: number;
    total_installments: number;
    installments_paid: number;
    start_month: number;
    start_year: number;
    end_month: number | null;
    end_year: number | null;
    status: 'active' | 'completed';
    created_at: string;
    updated_at: string;
}
