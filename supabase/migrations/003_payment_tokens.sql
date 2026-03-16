-- Payment portal tokens
-- One unique token per invoice; regenerating overwrites via upsert

CREATE TABLE IF NOT EXISTS payment_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  UUID NOT NULL UNIQUE REFERENCES invoices(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_tokens_token_idx ON payment_tokens(token);

-- No RLS — accessed via service role key from public API routes
