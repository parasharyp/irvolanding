-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- ORGANIZATIONS
-- ─────────────────────────────────────────
create table organizations (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  owner_user_id  uuid not null,
  plan           text not null default 'starter',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- USERS (mirrors auth.users, extended)
-- ─────────────────────────────────────────
create table users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  name            text,
  organization_id uuid references organizations(id) on delete cascade,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────
create table clients (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  email           text not null,
  company         text,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────
create table invoices (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id       uuid not null references clients(id) on delete cascade,
  invoice_number  text not null,
  amount          numeric(12,2) not null,
  currency        text not null default 'GBP',
  issue_date      date not null,
  due_date        date not null,
  status          text not null default 'pending',
  created_at      timestamptz not null default now(),
  constraint invoices_status_check check (status in ('pending','paid','overdue','escalated'))
);

create index idx_invoices_org on invoices(organization_id);
create index idx_invoices_status on invoices(status);
create index idx_invoices_due_date on invoices(due_date);

-- ─────────────────────────────────────────
-- INVOICE EVENTS
-- ─────────────────────────────────────────
create table invoice_events (
  id               uuid primary key default uuid_generate_v4(),
  invoice_id       uuid not null references invoices(id) on delete cascade,
  event_type       text not null,
  event_timestamp  timestamptz not null default now(),
  metadata         jsonb default '{}'
);

create index idx_invoice_events_invoice on invoice_events(invoice_id);

-- ─────────────────────────────────────────
-- INTEREST CALCULATIONS
-- ─────────────────────────────────────────
create table interest_calculations (
  id               uuid primary key default uuid_generate_v4(),
  invoice_id       uuid not null references invoices(id) on delete cascade,
  principal        numeric(12,2) not null,
  interest_rate    numeric(6,4) not null,
  days_overdue     integer not null,
  interest_amount  numeric(12,2) not null,
  compensation_fee numeric(12,2) not null,
  calculated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- REMINDER TEMPLATES
-- ─────────────────────────────────────────
create table reminder_templates (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  stage           integer not null,
  subject         text not null,
  body            text not null,
  created_at      timestamptz not null default now(),
  constraint reminder_templates_stage_check check (stage in (1,2,3,4))
);

-- ─────────────────────────────────────────
-- REMINDER LOGS
-- ─────────────────────────────────────────
create table reminder_logs (
  id            uuid primary key default uuid_generate_v4(),
  invoice_id    uuid not null references invoices(id) on delete cascade,
  client_id     uuid not null references clients(id) on delete cascade,
  stage         integer not null,
  sent_at       timestamptz not null default now(),
  email_subject text not null,
  email_body    text not null
);

create index idx_reminder_logs_invoice on reminder_logs(invoice_id);

-- ─────────────────────────────────────────
-- EVIDENCE PACKS
-- ─────────────────────────────────────────
create table evidence_packs (
  id           uuid primary key default uuid_generate_v4(),
  invoice_id   uuid not null references invoices(id) on delete cascade,
  file_url     text not null,
  generated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- CONFIG
-- ─────────────────────────────────────────
create table config (
  key   text primary key,
  value text not null
);

insert into config (key, value) values ('base_rate', '0.05');

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

alter table organizations enable row level security;
alter table users enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table invoice_events enable row level security;
alter table interest_calculations enable row level security;
alter table reminder_templates enable row level security;
alter table reminder_logs enable row level security;
alter table evidence_packs enable row level security;

-- Helper function: get org id for current user
create or replace function get_user_org_id()
returns uuid language sql security definer stable as $$
  select organization_id from users where id = auth.uid()
$$;

-- Organizations: owner only
create policy "org_select" on organizations for select using (id = get_user_org_id());
create policy "org_update" on organizations for update using (id = get_user_org_id());

-- Users: own org
create policy "users_select" on users for select using (organization_id = get_user_org_id());
create policy "users_insert" on users for insert with check (organization_id = get_user_org_id());
create policy "users_update" on users for update using (organization_id = get_user_org_id());

-- Clients
create policy "clients_select" on clients for select using (organization_id = get_user_org_id());
create policy "clients_insert" on clients for insert with check (organization_id = get_user_org_id());
create policy "clients_update" on clients for update using (organization_id = get_user_org_id());
create policy "clients_delete" on clients for delete using (organization_id = get_user_org_id());

-- Invoices
create policy "invoices_select" on invoices for select using (organization_id = get_user_org_id());
create policy "invoices_insert" on invoices for insert with check (organization_id = get_user_org_id());
create policy "invoices_update" on invoices for update using (organization_id = get_user_org_id());
create policy "invoices_delete" on invoices for delete using (organization_id = get_user_org_id());

-- Invoice events (via invoice)
create policy "invoice_events_select" on invoice_events for select
  using (invoice_id in (select id from invoices where organization_id = get_user_org_id()));
create policy "invoice_events_insert" on invoice_events for insert
  with check (invoice_id in (select id from invoices where organization_id = get_user_org_id()));

-- Interest calculations
create policy "interest_select" on interest_calculations for select
  using (invoice_id in (select id from invoices where organization_id = get_user_org_id()));
create policy "interest_insert" on interest_calculations for insert
  with check (invoice_id in (select id from invoices where organization_id = get_user_org_id()));

-- Reminder templates
create policy "reminder_templates_select" on reminder_templates for select using (organization_id = get_user_org_id());
create policy "reminder_templates_insert" on reminder_templates for insert with check (organization_id = get_user_org_id());
create policy "reminder_templates_update" on reminder_templates for update using (organization_id = get_user_org_id());
create policy "reminder_templates_delete" on reminder_templates for delete using (organization_id = get_user_org_id());

-- Reminder logs
create policy "reminder_logs_select" on reminder_logs for select
  using (invoice_id in (select id from invoices where organization_id = get_user_org_id()));
create policy "reminder_logs_insert" on reminder_logs for insert
  with check (invoice_id in (select id from invoices where organization_id = get_user_org_id()));

-- Evidence packs
create policy "evidence_packs_select" on evidence_packs for select
  using (invoice_id in (select id from invoices where organization_id = get_user_org_id()));
create policy "evidence_packs_insert" on evidence_packs for insert
  with check (invoice_id in (select id from invoices where organization_id = get_user_org_id()));
