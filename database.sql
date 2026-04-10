-- =============================================================
-- My Savings - Sistema de Ahorro Grupal
-- PostgreSQL / Supabase
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLE: groups
-- =============================================================
CREATE TABLE groups (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(100) NOT NULL,
    start_month  SMALLINT NOT NULL CHECK (start_month BETWEEN 1 AND 12),
    start_year   SMALLINT NOT NULL CHECK (start_year >= 2000),
    total_ruedas SMALLINT NOT NULL DEFAULT 0 CHECK (total_ruedas >= 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: members
-- =============================================================
CREATE TABLE members (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id     UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    phone        VARCHAR(20),
    position     SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 15),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    joined_month SMALLINT NOT NULL CHECK (joined_month BETWEEN 1 AND 12),
    joined_year  SMALLINT NOT NULL CHECK (joined_year >= 2000),
    left_month   SMALLINT CHECK (left_month BETWEEN 1 AND 12),
    left_year    SMALLINT CHECK (left_year >= 2000),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, position)
);

-- =============================================================
-- TABLE: ruedas
-- =============================================================
CREATE TABLE ruedas (
    id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id                      UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    rueda_number                  SMALLINT NOT NULL CHECK (rueda_number >= 1),
    type                          VARCHAR(10) NOT NULL CHECK (type IN ('new', 'continua')),
    -- Base amounts (may differ per slot in early ruedas)
    loan_amount                   NUMERIC(15,0) NOT NULL CHECK (loan_amount > 0),
    interest_rate                 NUMERIC(5,4) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 0.15),
    contribution_amount           NUMERIC(15,0) NOT NULL DEFAULT 0 CHECK (contribution_amount >= 0),
    installment_amount            NUMERIC(15,0) NOT NULL CHECK (installment_amount > 0),
    total_to_return               NUMERIC(15,0) NOT NULL CHECK (total_to_return > 0),
    rounding_unit                 SMALLINT NOT NULL DEFAULT 0 CHECK (rounding_unit IN (0, 500, 1000)),
    start_month                   SMALLINT NOT NULL CHECK (start_month BETWEEN 1 AND 12),
    start_year                    SMALLINT NOT NULL CHECK (start_year >= 2000),
    end_month                     SMALLINT CHECK (end_month BETWEEN 1 AND 12),
    end_year                      SMALLINT CHECK (end_year >= 2000),
    status                        VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed')),
    -- For 'continua' type: total contributions accumulated in all previous ruedas (same for all members)
    historical_contribution_total NUMERIC(15,0) CHECK (historical_contribution_total >= 0),
    -- Link to previous rueda (optional, for 'continua' type)
    previous_rueda_id             UUID REFERENCES ruedas(id) ON DELETE SET NULL,
    -- How slot loan amounts are defined: 'constant' = all slots use rueda loanAmount, 'variable' = per slot
    slot_amount_mode              VARCHAR(10) NOT NULL DEFAULT 'constant' CHECK (slot_amount_mode IN ('constant', 'variable')),
    notes                         TEXT,
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, rueda_number)
);

-- =============================================================
-- TABLE: rueda_slots
-- Each slot = one member's turn to receive the loan in a given rueda
-- =============================================================
CREATE TABLE rueda_slots (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rueda_id           UUID NOT NULL REFERENCES ruedas(id) ON DELETE CASCADE,
    member_id          UUID NOT NULL REFERENCES members(id),
    slot_position      SMALLINT NOT NULL CHECK (slot_position BETWEEN 1 AND 15),
    -- Per-slot amounts (may differ from rueda defaults in early ruedas)
    loan_amount        NUMERIC(15,0) NOT NULL CHECK (loan_amount > 0),
    installment_amount NUMERIC(15,0) NOT NULL CHECK (installment_amount > 0),
    -- For 'continua' ruedas: loan amount from the PREVIOUS rueda that this member is still paying
    previous_loan_amount NUMERIC(15,0) CHECK (previous_loan_amount > 0),
    total_to_return    NUMERIC(15,0) NOT NULL CHECK (total_to_return > 0),
    loan_month         SMALLINT NOT NULL CHECK (loan_month BETWEEN 1 AND 12),
    loan_year          SMALLINT NOT NULL CHECK (loan_year >= 2000),
    status             VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (rueda_id, slot_position),
    UNIQUE (rueda_id, member_id)
);

-- =============================================================
-- TABLE: rueda_monthly_payments
-- One record per member per month in a rueda
-- =============================================================
CREATE TABLE rueda_monthly_payments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rueda_id                UUID NOT NULL REFERENCES ruedas(id) ON DELETE CASCADE,
    member_id               UUID NOT NULL REFERENCES members(id),
    month                   SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year                    SMALLINT NOT NULL CHECK (year >= 2000),
    -- What they owe this month
    installment_amount_due  NUMERIC(15,0) NOT NULL DEFAULT 0 CHECK (installment_amount_due >= 0),
    contribution_amount_due NUMERIC(15,0) NOT NULL DEFAULT 0 CHECK (contribution_amount_due >= 0),
    total_amount_due        NUMERIC(15,0) NOT NULL DEFAULT 0 CHECK (total_amount_due >= 0),
    installment_number      SMALLINT NOT NULL DEFAULT 0 CHECK (installment_number >= 0),
    -- 'current_rueda'=paying current rueda installment, 'previous_rueda'=paying prev rueda, 'contribution_only'=no installment
    payment_type            VARCHAR(20) NOT NULL CHECK (payment_type IN ('current_rueda', 'previous_rueda', 'contribution_only')),
    -- Payment status
    is_paid                 BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at                 TIMESTAMPTZ,
    -- 'member'=paid normally, 'cash_box'=covered from caja because member didn't pay
    payment_source          VARCHAR(10) CHECK (payment_source IN ('member', 'cash_box')),
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (rueda_id, member_id, month, year)
);

-- =============================================================
-- TABLE: cash_movements
-- All cash box entries and exits with full traceability
-- =============================================================
CREATE TABLE cash_movements (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id      UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    movement_type VARCHAR(5) NOT NULL CHECK (movement_type IN ('in', 'out')),
    source_type   VARCHAR(10) NOT NULL CHECK (source_type IN ('automatic', 'manual')),
    category      VARCHAR(30) NOT NULL CHECK (category IN (
        'rueda_disbursement',
        'rueda_collection',
        'contribution',
        'parallel_loan_disbursement',
        'parallel_loan_payment',
        'member_entry',
        'member_exit',
        'adjustment'
    )),
    description   VARCHAR(255),
    amount        NUMERIC(15,0) NOT NULL CHECK (amount > 0),
    month         SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year          SMALLINT NOT NULL CHECK (year >= 2000),
    -- Optional reference to the originating record
    reference_id  UUID,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: parallel_loans
-- Loans running in parallel to the main rueda
-- =============================================================
CREATE TABLE parallel_loans (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id           UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    member_id          UUID NOT NULL REFERENCES members(id),
    amount             NUMERIC(15,0) NOT NULL CHECK (amount > 0),
    interest_rate      NUMERIC(5,4) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 0.15),
    total_to_return    NUMERIC(15,0) NOT NULL CHECK (total_to_return > 0),
    installment_amount NUMERIC(15,0) NOT NULL CHECK (installment_amount > 0),
    total_installments SMALLINT NOT NULL CHECK (total_installments > 0),
    installments_paid  SMALLINT NOT NULL DEFAULT 0 CHECK (installments_paid >= 0),
    start_month        SMALLINT NOT NULL CHECK (start_month BETWEEN 1 AND 12),
    start_year         SMALLINT NOT NULL CHECK (start_year >= 2000),
    end_month          SMALLINT CHECK (end_month BETWEEN 1 AND 12),
    end_year           SMALLINT CHECK (end_year >= 2000),
    status             VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- One active parallel loan per member per group
    CONSTRAINT uq_parallel_loans_active_member EXCLUDE USING btree (
        group_id WITH =,
        member_id WITH =
    ) WHERE (status = 'active')
);

-- =============================================================
-- TABLE: parallel_loan_payments
-- Monthly payment records for each parallel loan
-- =============================================================
CREATE TABLE parallel_loan_payments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parallel_loan_id UUID NOT NULL REFERENCES parallel_loans(id) ON DELETE CASCADE,
    month            SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year             SMALLINT NOT NULL CHECK (year >= 2000),
    amount           NUMERIC(15,0) NOT NULL CHECK (amount > 0),
    is_paid          BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at          TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (parallel_loan_id, month, year)
);

-- =============================================================
-- INDEXES
-- =============================================================

-- members
CREATE INDEX idx_members_group_id ON members(group_id);
CREATE INDEX idx_members_group_position ON members(group_id, position);
CREATE INDEX idx_members_group_active ON members(group_id, is_active);

-- ruedas
CREATE INDEX idx_ruedas_group_id ON ruedas(group_id);
CREATE INDEX idx_ruedas_group_status ON ruedas(group_id, status);
CREATE INDEX idx_ruedas_group_number ON ruedas(group_id, rueda_number);

-- rueda_slots
CREATE INDEX idx_rueda_slots_rueda_id ON rueda_slots(rueda_id);
CREATE INDEX idx_rueda_slots_member_id ON rueda_slots(member_id);
CREATE INDEX idx_rueda_slots_rueda_position ON rueda_slots(rueda_id, slot_position);

-- rueda_monthly_payments
CREATE INDEX idx_rmp_rueda_id ON rueda_monthly_payments(rueda_id);
CREATE INDEX idx_rmp_member_id ON rueda_monthly_payments(member_id);
CREATE INDEX idx_rmp_rueda_month_year ON rueda_monthly_payments(rueda_id, month, year);
CREATE INDEX idx_rmp_member_month_year ON rueda_monthly_payments(member_id, month, year);
CREATE INDEX idx_rmp_is_paid ON rueda_monthly_payments(rueda_id, is_paid);

-- cash_movements
CREATE INDEX idx_cash_group_id ON cash_movements(group_id);
CREATE INDEX idx_cash_group_month_year ON cash_movements(group_id, month, year);
CREATE INDEX idx_cash_group_category ON cash_movements(group_id, category);

-- parallel_loans
CREATE INDEX idx_pl_group_id ON parallel_loans(group_id);
CREATE INDEX idx_pl_member_id ON parallel_loans(member_id);
CREATE INDEX idx_pl_group_status ON parallel_loans(group_id, status);

-- parallel_loan_payments
CREATE INDEX idx_plp_loan_id ON parallel_loan_payments(parallel_loan_id);
CREATE INDEX idx_plp_loan_month_year ON parallel_loan_payments(parallel_loan_id, month, year);
CREATE INDEX idx_plp_is_paid ON parallel_loan_payments(parallel_loan_id, is_paid);

-- =============================================================
-- TRIGGER: auto-update updated_at
-- =============================================================
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_ruedas_updated_at
    BEFORE UPDATE ON ruedas
    FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_rueda_slots_updated_at
    BEFORE UPDATE ON rueda_slots
    FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_rmp_updated_at
    BEFORE UPDATE ON rueda_monthly_payments
    FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_cash_movements_updated_at
    BEFORE UPDATE ON cash_movements
    FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_parallel_loans_updated_at
    BEFORE UPDATE ON parallel_loans
    FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- =============================================================
-- VIEWS (helpers for common queries)
-- =============================================================

-- Cash box balance per group (sum of all movements)
CREATE OR REPLACE VIEW v_cash_balance AS
SELECT
    group_id,
    SUM(CASE WHEN movement_type = 'in'  THEN amount ELSE 0 END) AS total_in,
    SUM(CASE WHEN movement_type = 'out' THEN amount ELSE 0 END) AS total_out,
    SUM(CASE WHEN movement_type = 'in'  THEN amount ELSE -amount END) AS balance
FROM cash_movements
GROUP BY group_id;

-- Monthly payment summary per rueda per month
CREATE OR REPLACE VIEW v_monthly_payment_summary AS
SELECT
    rmp.rueda_id,
    rmp.month,
    rmp.year,
    COUNT(*) AS total_members,
    COUNT(*) FILTER (WHERE rmp.is_paid = TRUE)  AS paid_count,
    COUNT(*) FILTER (WHERE rmp.is_paid = FALSE) AS pending_count,
    SUM(rmp.total_amount_due) AS total_expected,
    SUM(rmp.total_amount_due) FILTER (WHERE rmp.is_paid = TRUE)  AS total_collected,
    SUM(rmp.total_amount_due) FILTER (WHERE rmp.is_paid = FALSE) AS total_pending
FROM rueda_monthly_payments rmp
GROUP BY rmp.rueda_id, rmp.month, rmp.year;

-- Parallel loan summary
CREATE OR REPLACE VIEW v_parallel_loan_summary AS
SELECT
    pl.id,
    pl.group_id,
    pl.member_id,
    m.first_name || ' ' || m.last_name AS member_name,
    pl.amount,
    pl.interest_rate,
    pl.total_to_return,
    pl.installment_amount,
    pl.total_installments,
    pl.installments_paid,
    (pl.total_installments - pl.installments_paid) AS installments_remaining,
    pl.status,
    pl.start_month,
    pl.start_year,
    pl.end_month,
    pl.end_year
FROM parallel_loans pl
JOIN members m ON m.id = pl.member_id;
