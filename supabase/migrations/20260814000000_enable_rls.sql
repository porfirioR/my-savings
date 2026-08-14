-- Enable Row Level Security on all public tables. No policies are added,
-- which denies all access to the anon/publishable and authenticated roles
-- via the REST API. The backend (NestJS) uses the secret/service_role key,
-- which bypasses RLS entirely, so application behavior is unaffected.

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruedas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rueda_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rueda_monthly_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE parallel_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE parallel_loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_contributions ENABLE ROW LEVEL SECURITY;

-- member_replacements / member_replacement_schedule exist in the local schema
-- (supabase/migrations/20240101000000_initial_schema.sql) but were not present
-- in production as of this migration, so they are omitted here. Enable RLS on
-- them separately once/if they are created in production.
