export interface RuedaMonthlyPaymentEntity {
    id: string;
    rueda_id: string;
    member_id: string;
    month: number;
    year: number;
    installment_amount_due: number;
    contribution_amount_due: number;
    total_amount_due: number;
    installment_number: number;
    payment_type: 'current_rueda' | 'previous_rueda' | 'contribution_only';
    is_paid: boolean;
    payment_source: 'member' | 'cash_box' | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}
