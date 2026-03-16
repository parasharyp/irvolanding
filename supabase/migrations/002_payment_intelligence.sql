-- ─────────────────────────────────────────
-- Add paid_at to invoices
-- ─────────────────────────────────────────
alter table invoices
  add column if not exists paid_at timestamptz;

-- ─────────────────────────────────────────
-- Add risk fields to clients
-- ─────────────────────────────────────────
alter table clients
  add column if not exists risk_score integer default 0,
  add column if not exists risk_tier text default 'low';

-- ─────────────────────────────────────────
-- PAYMENT PREDICTIONS
-- ─────────────────────────────────────────
create table if not exists payment_predictions (
  id                    uuid primary key default uuid_generate_v4(),
  invoice_id            uuid not null references invoices(id) on delete cascade,
  predicted_delay_days  integer not null default 0,
  predicted_payment_date date not null,
  confidence            numeric(4,2) not null default 0.5,
  created_at            timestamptz not null default now()
);

create index if not exists idx_predictions_invoice on payment_predictions(invoice_id);

-- ─────────────────────────────────────────
-- RLS for payment_predictions
-- ─────────────────────────────────────────
alter table payment_predictions enable row level security;

create policy "predictions_select" on payment_predictions for select
  using (invoice_id in (select id from invoices where organization_id = get_user_org_id()));

create policy "predictions_insert" on payment_predictions for insert
  with check (invoice_id in (select id from invoices where organization_id = get_user_org_id()));

create policy "predictions_delete" on payment_predictions for delete
  using (invoice_id in (select id from invoices where organization_id = get_user_org_id()));
