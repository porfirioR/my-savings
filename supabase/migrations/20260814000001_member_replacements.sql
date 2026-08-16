-- Adds the member_replacements / member_replacement_schedule tables that were
-- part of the local schema (20240101000000_initial_schema.sql) but were never
-- applied to production. Backing tables for the member-replacement feature
-- (member-replacements-access.service.ts / member-replacements.controller.ts).

-- =============================================================
-- TABLE: member_replacements
-- Tracks a member exit paired with the new member who takes over
-- their slot. The outgoing member still "owes" their monthly
-- installment+contribution until their slot's disbursement month;
-- the incoming member "buys in" with a total amount split across
-- installments over the same span. Both amounts are entered
-- manually by the admin (they depend on pre-app historical data),
-- this table only tracks the monthly schedule.
-- =============================================================
CREATE TABLE member_replacements (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id                UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    rueda_id                UUID NOT NULL REFERENCES ruedas(id) ON DELETE CASCADE,
    slot_position           SMALLINT NOT NULL CHECK (slot_position BETWEEN 1 AND 30),
    outgoing_member_id      UUID NOT NULL REFERENCES members(id),
    outgoing_monthly_amount NUMERIC(15,0) NOT NULL CHECK (outgoing_monthly_amount >= 0),
    incoming_member_id      UUID NOT NULL REFERENCES members(id),
    incoming_total_amount   NUMERIC(15,0) NOT NULL CHECK (incoming_total_amount >= 0),
    incoming_installments   SMALLINT NOT NULL CHECK (incoming_installments >= 1),
    status                  VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: member_replacement_schedule
-- One row per calendar month of the handover. Each side (outgoing /
-- incoming) is checked off independently by the admin; checking a
-- side creates the corresponding cash_movements row (reference_id
-- keyed to replacement+side+month), unchecking removes it.
-- =============================================================
CREATE TABLE member_replacement_schedule (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    replacement_id     UUID NOT NULL REFERENCES member_replacements(id) ON DELETE CASCADE,
    month              SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year               SMALLINT NOT NULL CHECK (year >= 2000),
    installment_number SMALLINT NOT NULL CHECK (installment_number >= 1),
    outgoing_amount    NUMERIC(15,0) NOT NULL CHECK (outgoing_amount >= 0),
    outgoing_paid      BOOLEAN NOT NULL DEFAULT FALSE,
    outgoing_paid_at   TIMESTAMPTZ,
    incoming_amount    NUMERIC(15,0) NOT NULL CHECK (incoming_amount >= 0),
    incoming_paid      BOOLEAN NOT NULL DEFAULT FALSE,
    incoming_paid_at   TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (replacement_id, month, year)
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX idx_mr_group_id ON member_replacements(group_id);
CREATE INDEX idx_mr_rueda_id ON member_replacements(rueda_id);
CREATE INDEX idx_mr_outgoing_member ON member_replacements(outgoing_member_id);
CREATE INDEX idx_mr_incoming_member ON member_replacements(incoming_member_id);

CREATE INDEX idx_mrs_replacement_id ON member_replacement_schedule(replacement_id);

-- =============================================================
-- TRIGGERS: auto-update updated_at (fn_update_updated_at already exists in prod)
-- =============================================================
CREATE TRIGGER trg_member_replacements_updated_at
    BEFORE UPDATE ON member_replacements
    FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_member_replacement_schedule_updated_at
    BEFORE UPDATE ON member_replacement_schedule
    FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- =============================================================
-- RLS: enable, no policies (backend uses secret key, bypasses RLS)
-- =============================================================
ALTER TABLE member_replacements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_replacement_schedule ENABLE ROW LEVEL SECURITY;
