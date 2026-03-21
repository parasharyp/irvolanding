create table waitlist (
  id           uuid primary key default uuid_generate_v4(),
  email        text unique not null,
  full_name    text,
  company_name text,
  source       text not null default 'landing-page',
  created_at   timestamptz not null default now()
);

alter table waitlist enable row level security;

-- No public access — read/write via admin client only
create policy "no_public_access" on waitlist for all using (false);
