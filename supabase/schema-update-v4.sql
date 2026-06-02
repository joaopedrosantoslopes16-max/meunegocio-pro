-- ============================================================
-- MeuNegócio Pro — Schema Update v4 (Pacotes Extras)
-- Execute APÓS schema-update-v3.sql
-- ============================================================

-- ============================================================
-- EXTRA PACKAGES — catálogo de pacotes disponíveis
-- Populado manualmente ou via seed
-- ============================================================
CREATE TABLE IF NOT EXISTS extra_packages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,                        -- "Pacote Instagram Extra"
  slug              TEXT NOT NULL UNIQUE,                 -- "instagram-extra"
  description       TEXT NOT NULL,
  price             NUMERIC(10, 2) NOT NULL,
  type              TEXT NOT NULL,                        -- "instagram_extra" | "stories" | "reativacao"
  posts_quantity    SMALLINT NOT NULL DEFAULT 0,
  captions_quantity SMALLINT NOT NULL DEFAULT 0,
  stories_quantity  SMALLINT NOT NULL DEFAULT 0,
  messages_quantity SMALLINT NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extra_packages_slug ON extra_packages(slug);
CREATE INDEX IF NOT EXISTS idx_extra_packages_type ON extra_packages(type);

-- Trigger updated_at
CREATE TRIGGER set_updated_at_extra_packages
  BEFORE UPDATE ON extra_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed dos 3 pacotes iniciais
INSERT INTO extra_packages (name, slug, description, price, type, posts_quantity, captions_quantity, stories_quantity, messages_quantity)
VALUES
  (
    'Pacote Instagram Extra',
    'instagram-extra',
    '20 posts extras para movimentar seu Instagram — posts com CTA para WhatsApp, adaptados ao seu nicho e salvos no painel.',
    19.00,
    'instagram_extra',
    20, 20, 0, 0
  ),
  (
    'Pacote Stories',
    'stories',
    '20 stories prontos para divulgar promoções, avisos e chamadas rápidas — adaptados ao nicho, com chamada para WhatsApp.',
    15.00,
    'stories',
    0, 0, 20, 0
  ),
  (
    'Pacote Reativação de Clientes',
    'reativacao',
    '50 mensagens para trazer clientes de volta — para clientes antigos, orçamentos que sumiram, pós-venda e agenda aberta.',
    19.00,
    'reativacao',
    0, 0, 0, 50
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- USER EXTRA PACKAGES — pacotes extras comprados por clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS user_extra_packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email           TEXT NOT NULL,
  purchase_id     UUID REFERENCES purchases(id) ON DELETE SET NULL,
  package_id      UUID NOT NULL REFERENCES extra_packages(id) ON DELETE RESTRICT,
  package_name    TEXT NOT NULL,
  package_slug    TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending', -- 'active' | 'pending' | 'cancelled' | 'refunded' | 'chargeback'
  transaction_id  TEXT,
  posts_added     SMALLINT NOT NULL DEFAULT 0,
  captions_added  SMALLINT NOT NULL DEFAULT 0,
  stories_added   SMALLINT NOT NULL DEFAULT 0,
  messages_added  SMALLINT NOT NULL DEFAULT 0,
  purchased_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,  -- null = sem validade
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_extra_pkg_user    ON user_extra_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_extra_pkg_email   ON user_extra_packages(email);
CREATE INDEX IF NOT EXISTS idx_user_extra_pkg_status  ON user_extra_packages(status);
CREATE INDEX IF NOT EXISTS idx_user_extra_pkg_package ON user_extra_packages(package_id);

CREATE TRIGGER set_updated_at_user_extra_packages
  BEFORE UPDATE ON user_extra_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE extra_packages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_extra_packages  ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa autenticada pode ler o catálogo de pacotes
CREATE POLICY "extra_packages: select for authenticated"
  ON extra_packages FOR SELECT
  USING (is_active = TRUE);

-- Cliente lê apenas os próprios pacotes comprados
CREATE POLICY "user_extra_packages: select own"
  ON user_extra_packages FOR SELECT
  USING (user_id = auth.uid());
