-- ============================================================
-- MeuNegócio Pro — Schema Supabase
-- Execute este SQL no painel do Supabase:
--   Dashboard → SQL Editor → New Query → Cole e execute
-- ============================================================

-- Tipos enum
CREATE TYPE purchase_status AS ENUM (
  'pending', 'approved', 'active',
  'cancelled', 'refunded', 'chargeback', 'failed'
);

CREATE TYPE kit_status AS ENUM ('generating', 'ready', 'blocked');

CREATE TYPE release_stage AS ENUM ('0', '1', '2', '3');

CREATE TYPE access_action AS ENUM (
  'view_kit', 'download_post', 'download_all',
  'copy_caption', 'copy_whatsapp_message',
  'copy_site_link', 'open_site', 'generate_kit'
);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-cria profile quando usuário se cadastra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PURCHASES
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL,
  buyer_name     TEXT,
  product_id     TEXT,
  product_name   TEXT,
  transaction_id TEXT UNIQUE,
  platform       TEXT DEFAULT 'kirvano',
  status         purchase_status NOT NULL DEFAULT 'pending',
  amount         NUMERIC(10, 2),
  currency       TEXT DEFAULT 'BRL',
  purchased_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload    JSONB
);

CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_transaction ON purchases(transaction_id);

-- ============================================================
-- BUSINESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name  TEXT NOT NULL,
  niche          TEXT NOT NULL,
  city           TEXT NOT NULL,
  whatsapp       TEXT NOT NULL,
  instagram      TEXT,
  address        TEXT,
  main_service   TEXT NOT NULL,
  services       TEXT[] DEFAULT '{}',
  primary_color  TEXT DEFAULT '#6366f1',
  slug           TEXT NOT NULL UNIQUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_user ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

-- ============================================================
-- KITS
-- ============================================================
CREATE TABLE IF NOT EXISTS kits (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id           UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  purchase_id           UUID REFERENCES purchases(id) ON DELETE SET NULL,
  status                kit_status NOT NULL DEFAULT 'generating',
  release_stage         INTEGER NOT NULL DEFAULT 1,
  purchase_approved_at  TIMESTAMPTZ,
  day_0_unlocked        BOOLEAN NOT NULL DEFAULT FALSE,
  day_3_unlocked        BOOLEAN NOT NULL DEFAULT FALSE,
  day_7_unlocked        BOOLEAN NOT NULL DEFAULT FALSE,
  site_slug             TEXT NOT NULL UNIQUE,
  site_url              TEXT,
  posts_json            JSONB NOT NULL DEFAULT '[]',
  captions_json         JSONB NOT NULL DEFAULT '[]',
  whatsapp_messages_json JSONB NOT NULL DEFAULT '[]',
  instagram_bio         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kits_user ON kits(user_id);
CREATE INDEX IF NOT EXISTS idx_kits_business ON kits(business_id);
CREATE INDEX IF NOT EXISTS idx_kits_slug ON kits(site_slug);

-- ============================================================
-- POST ASSETS (opcional — para armazenar assets individuais)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_assets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kit_id         UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  template_type  TEXT NOT NULL,
  post_number    INTEGER NOT NULL,
  title          TEXT,
  subtitle       TEXT,
  caption        TEXT,
  image_url      TEXT,
  is_unlocked    BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_assets_kit ON post_assets(kit_id);
CREATE INDEX IF NOT EXISTS idx_post_assets_user ON post_assets(user_id);

-- ============================================================
-- ACCESS LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS access_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kit_id      UUID REFERENCES kits(id) ON DELETE SET NULL,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  action      access_action NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_kit ON access_logs(kit_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at);

-- ============================================================
-- UPDATED_AT automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER set_updated_at_profiles   BEFORE UPDATE ON profiles   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_purchases  BEFORE UPDATE ON purchases  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_businesses BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_kits       BEFORE UPDATE ON kits       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
