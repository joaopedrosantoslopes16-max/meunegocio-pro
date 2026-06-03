-- ============================================================
-- MeuNegócio Pro — Schema Update v6
-- Novas colunas em businesses + tabela generated_posts
-- Execute APÓS schema-update-v5.sql
-- ============================================================

-- ── BUSINESSES: novas colunas ────────────────────────────────
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS facebook        TEXT,
  ADD COLUMN IF NOT EXISTS linktree        TEXT,
  ADD COLUMN IF NOT EXISTS booking_url     TEXT,
  ADD COLUMN IF NOT EXISTS font_style      TEXT NOT NULL DEFAULT 'inter',
  ADD COLUMN IF NOT EXISTS secondary_color TEXT NOT NULL DEFAULT '#4f46e5';

-- ── GENERATED_POSTS: posts editados pelo cliente ─────────────
CREATE TABLE IF NOT EXISTS generated_posts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id         UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  template_type       TEXT        NOT NULL DEFAULT 'main_service',
  title               TEXT        NOT NULL DEFAULT '',
  subtitle            TEXT        NOT NULL DEFAULT '',
  cta                 TEXT        NOT NULL DEFAULT '',
  caption             TEXT,
  whatsapp_message    TEXT,
  background_image_url TEXT,
  primary_color       TEXT        NOT NULL DEFAULT '#7c3aed',
  overlay_opacity     NUMERIC     NOT NULL DEFAULT 0.55,
  font_style          TEXT        NOT NULL DEFAULT 'inter',
  goal                TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_posts_user     ON generated_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_posts_business ON generated_posts(business_id);
CREATE INDEX IF NOT EXISTS idx_generated_posts_created  ON generated_posts(created_at DESC);

ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "generated_posts: select own"
  ON generated_posts FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "generated_posts: insert own"
  ON generated_posts FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "generated_posts: update own"
  ON generated_posts FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "generated_posts: delete own"
  ON generated_posts FOR DELETE USING (user_id = auth.uid());

-- ── STORAGE BUCKET ───────────────────────────────────────────
-- Execute via Supabase Dashboard > Storage > New bucket
-- Nome: business-gallery
-- Public: SIM (para URLs públicas de imagens)
--
-- Ou via SQL (requer permissão de superuser):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-gallery',
  'business-gallery',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ── RLS POLICIES para Storage ────────────────────────────────
-- Usuários autenticados podem fazer upload para a própria pasta
CREATE POLICY IF NOT EXISTS "business-gallery: upload autenticado"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'business-gallery' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuários autenticados podem ver suas próprias imagens
CREATE POLICY IF NOT EXISTS "business-gallery: select proprio"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'business-gallery' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Imagens públicas podem ser lidas por qualquer um (para URLs públicas)
CREATE POLICY IF NOT EXISTS "business-gallery: public read"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'business-gallery');

-- Usuários podem deletar as próprias imagens
CREATE POLICY IF NOT EXISTS "business-gallery: delete proprio"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'business-gallery' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
