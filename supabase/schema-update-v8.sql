-- ============================================================
-- MeuNegócio Pro — Schema Update v8
-- Gerador de Carrossel Premium
-- Execute APÓS schema-update-v7.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS generated_carousels (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id     UUID        REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  title           TEXT        NOT NULL DEFAULT '',
  topic           TEXT        NOT NULL DEFAULT '',
  objective       TEXT        NOT NULL DEFAULT '',
  niche           TEXT        NOT NULL DEFAULT '',
  visual_style    TEXT        NOT NULL DEFAULT 'moderno',
  format          TEXT        NOT NULL DEFAULT '4/5',
  slides_json     JSONB       NOT NULL DEFAULT '[]',
  caption         TEXT        NOT NULL DEFAULT '',
  whatsapp_message TEXT       NOT NULL DEFAULT '',
  selected_images_json JSONB  NOT NULL DEFAULT '[]',
  status          TEXT        NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE generated_carousels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own carousels"
  ON generated_carousels FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_generated_carousels_user ON generated_carousels(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_carousels_business ON generated_carousels(business_id);
