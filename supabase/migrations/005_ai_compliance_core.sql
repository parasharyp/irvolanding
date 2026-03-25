-- 005: AI Act Evidence Desk — core schema
-- Replaces invoice/client/reminder domain with compliance workflow

-- ─── Systems table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS systems (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,
  description             TEXT NOT NULL DEFAULT '',
  owner_name              TEXT NOT NULL DEFAULT '',
  owner_email             TEXT NOT NULL DEFAULT '',
  business_process        TEXT NOT NULL DEFAULT '',
  data_sources            TEXT[] DEFAULT '{}',
  model_type              TEXT NOT NULL DEFAULT 'other',
  tags                    TEXT[] DEFAULT '{}',
  risk_level              TEXT,          -- none | limited | high | unacceptable
  annex_category          TEXT,          -- Annex III sub-category
  classification_rationale TEXT,
  immediate_actions       TEXT[] DEFAULT '{}',
  pct_complete            INT NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL DEFAULT 'draft',  -- draft | in-progress | ready | exported
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY systems_org_isolation ON systems
  USING (organization_id = get_user_org_id());

-- ─── Questionnaire answers ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questionnaire_answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id   UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer      TEXT NOT NULL DEFAULT '',
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(system_id, question_id)
);

ALTER TABLE questionnaire_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY qa_org_isolation ON questionnaire_answers
  USING (
    EXISTS (
      SELECT 1 FROM systems s WHERE s.id = questionnaire_answers.system_id
      AND s.organization_id = get_user_org_id()
    )
  );

-- ─── Obligations ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS obligations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id         UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  obligation_key    TEXT NOT NULL,      -- e.g. 'technical-documentation'
  article           TEXT NOT NULL,      -- e.g. 'Art. 11'
  title             TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  evidence_required TEXT NOT NULL DEFAULT '',
  is_complete       BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order        INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(system_id, obligation_key)
);

ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY obligations_org_isolation ON obligations
  USING (
    EXISTS (
      SELECT 1 FROM systems s WHERE s.id = obligations.system_id
      AND s.organization_id = get_user_org_id()
    )
  );

-- ─── Evidence items ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id       UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  obligation_id   UUID NOT NULL REFERENCES obligations(id) ON DELETE CASCADE,
  item_type       TEXT NOT NULL DEFAULT 'note',  -- document | log | test | declaration | note
  title           TEXT NOT NULL DEFAULT '',
  content         TEXT,
  file_path       TEXT,          -- Supabase storage path
  file_name       TEXT,
  ai_drafted      BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY evidence_org_isolation ON evidence_items
  USING (
    EXISTS (
      SELECT 1 FROM systems s WHERE s.id = evidence_items.system_id
      AND s.organization_id = get_user_org_id()
    )
  );

-- ─── Exports ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id   UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  format      TEXT NOT NULL,  -- pdf | docx
  file_path   TEXT,
  file_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY exports_org_isolation ON exports
  USING (
    EXISTS (
      SELECT 1 FROM systems s WHERE s.id = exports.system_id
      AND s.organization_id = get_user_org_id()
    )
  );

-- ─── Updated at trigger ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER systems_updated_at BEFORE UPDATE ON systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER evidence_items_updated_at BEFORE UPDATE ON evidence_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Indexes ────────────────────────────────────────────────────────────
CREATE INDEX idx_systems_org ON systems(organization_id);
CREATE INDEX idx_obligations_system ON obligations(system_id);
CREATE INDEX idx_evidence_system ON evidence_items(system_id);
CREATE INDEX idx_evidence_obligation ON evidence_items(obligation_id);
CREATE INDEX idx_exports_system ON exports(system_id);
CREATE INDEX idx_qa_system ON questionnaire_answers(system_id);
