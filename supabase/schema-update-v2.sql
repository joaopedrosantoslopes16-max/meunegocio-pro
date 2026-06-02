-- ============================================================
-- MeuNegócio Pro — Schema Update v2
-- Execute APÓS o schema.sql original
-- ============================================================

-- Novos status para assinatura
ALTER TYPE purchase_status ADD VALUE IF NOT EXISTS 'past_due';

-- Novos campos em businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS visual_style    TEXT DEFAULT 'moderno';

-- Novos campos em kits
ALTER TABLE kits ADD COLUMN IF NOT EXISTS kit_month      TEXT; -- formato YYYY-MM
ALTER TABLE kits ADD COLUMN IF NOT EXISTS visual_style   TEXT DEFAULT 'moderno';
ALTER TABLE kits ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff';

-- ============================================================
-- LEADS — capturados pelo mini site público
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  kit_id      UUID REFERENCES kits(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  whatsapp    TEXT NOT NULL,
  interest    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_business ON leads(business_id);
CREATE INDEX IF NOT EXISTS idx_leads_created  ON leads(created_at);

-- RLS para leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (formulário público do mini site)
CREATE POLICY "leads: public insert"
  ON leads FOR INSERT
  WITH CHECK (TRUE);

-- Apenas o dono do negócio pode ler
CREATE POLICY "leads: select by business owner"
  ON leads FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Novos access_actions
ALTER TYPE access_action ADD VALUE IF NOT EXISTS 'generate_today_post';
ALTER TYPE access_action ADD VALUE IF NOT EXISTS 'copy_campaign';
ALTER TYPE access_action ADD VALUE IF NOT EXISTS 'copy_recovery_message';
