-- ============================================================
-- MeuNegócio Pro — Schema Update v5
-- Gerador de Conteúdos Magnéticos, Galeria, Tema, Negócio+
-- Execute APÓS schema-update-v4.sql
-- ============================================================

-- ============================================================
-- BUSINESSES — novas colunas para perfil rico e visual
-- ============================================================
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS cover_image_url        TEXT,
  ADD COLUMN IF NOT EXISTS logo_url               TEXT,
  ADD COLUMN IF NOT EXISTS professional_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images_json    JSONB  NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS custom_links_json      JSONB  NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS benefits_json          JSONB  NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS testimonials_json      JSONB  NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS short_description      TEXT,
  ADD COLUMN IF NOT EXISTS opening_hours_json     JSONB  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS google_maps_url        TEXT,
  ADD COLUMN IF NOT EXISTS services_json          JSONB  NOT NULL DEFAULT '[]';

-- ============================================================
-- CONTENT_GENERATIONS — resultados do Gerador Magnético
-- ============================================================
CREATE TABLE IF NOT EXISTS content_generations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id       UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  topic             TEXT        NOT NULL,
  format            TEXT        NOT NULL DEFAULT 'reels', -- reels | carrossel | story | post | whatsapp
  narrative_json    JSONB,
  headlines_json    JSONB,
  script_json       JSONB,
  carousel_json     JSONB,
  stories_json      JSONB,
  caption           TEXT,
  whatsapp_message  TEXT,
  selected_narrative TEXT,
  selected_headline  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_gen_user     ON content_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_gen_business ON content_generations(business_id);
CREATE INDEX IF NOT EXISTS idx_content_gen_created  ON content_generations(created_at DESC);

ALTER TABLE content_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_generations: select own"
  ON content_generations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "content_generations: insert own"
  ON content_generations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "content_generations: delete own"
  ON content_generations FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- IMAGE_GALLERY — imagens enviadas pelo cliente
-- ============================================================
CREATE TABLE IF NOT EXISTS image_gallery (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  image_url    TEXT        NOT NULL,
  storage_path TEXT        NOT NULL,
  image_type   TEXT        NOT NULL DEFAULT 'general', -- cover | logo | professional | post | story | general
  is_favorite  BOOLEAN     NOT NULL DEFAULT FALSE,
  used_for     TEXT,
  file_name    TEXT,
  file_size    INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_gallery_user     ON image_gallery(user_id);
CREATE INDEX IF NOT EXISTS idx_image_gallery_business ON image_gallery(business_id);
CREATE INDEX IF NOT EXISTS idx_image_gallery_type     ON image_gallery(image_type);

ALTER TABLE image_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "image_gallery: select own"
  ON image_gallery FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "image_gallery: insert own"
  ON image_gallery FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "image_gallery: update own"
  ON image_gallery FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "image_gallery: delete own"
  ON image_gallery FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- THEME_PREFERENCES — preferência de tema por usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS theme_preferences (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme      TEXT        NOT NULL DEFAULT 'light', -- 'light' | 'dark'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE theme_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "theme_preferences: select own"
  ON theme_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "theme_preferences: upsert own"
  ON theme_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "theme_preferences: update own"
  ON theme_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET para galeria (execute via Supabase Dashboard
-- ou via CLI: supabase storage create business-gallery)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('business-gallery', 'business-gallery', true)
-- ON CONFLICT DO NOTHING;
