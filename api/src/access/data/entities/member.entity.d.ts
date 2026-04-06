export interface MemberEntity {
    id: string;
    group_id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    position: number;
    is_active: boolean;
    joined_month: number;
    joined_year: number;
    left_month: number | null;
    left_year: number | null;
    created_at: string;
    updated_at: string;
}
