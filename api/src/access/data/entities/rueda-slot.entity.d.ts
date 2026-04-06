export interface RuedaSlotEntity {
    id: string;
    rueda_id: string;
    member_id: string;
    slot_position: number;
    loan_amount: number;
    installment_amount: number;
    total_to_return: number;
    loan_month: number;
    loan_year: number;
    status: 'pending' | 'active' | 'completed';
    created_at: string;
    updated_at: string;
}
