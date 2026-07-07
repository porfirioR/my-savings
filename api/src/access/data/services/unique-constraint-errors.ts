/**
 * Known unique-constraint/index names that the app can realistically hit
 * through normal use, mapped to a stable error code the frontend understands.
 * Add an entry here whenever a new UNIQUE constraint is introduced that a
 * user action could plausibly violate.
 */
export const UNIQUE_CONSTRAINT_ERRORS: Record<string, string> = {
  members_group_id_position_active_key: 'POSITION_ACTIVE_TAKEN',
  ruedas_group_id_rueda_number_key: 'RUEDA_NUMBER_TAKEN',
  rueda_slots_rueda_id_slot_position_key: 'SLOT_POSITION_TAKEN',
  rueda_slots_rueda_id_member_id_key: 'MEMBER_ALREADY_IN_RUEDA',
  rueda_monthly_payments_rueda_id_member_id_month_year_key: 'PAYMENT_ALREADY_EXISTS',
  parallel_loan_payments_parallel_loan_id_month_year_key: 'LOAN_PAYMENT_ALREADY_EXISTS',
};
