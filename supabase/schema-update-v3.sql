-- ============================================================
-- MeuNegócio Pro — Schema Update v3 (Assinaturas Mensais + Kirvano)
-- Execute APÓS schema-update-v2.sql
-- ============================================================

-- ============================================================
-- SUBSCRIPTIONS
-- Gerenciada exclusivamente pelo webhook da Kirvano.
-- Nunca atualizada pelo frontend.
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email                   TEXT NOT NULL,
  plan_name               TEXT NOT NULL DEFAULT 'essencial', -- 'essencial' | 'pro'
  plan_price              NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL DEFAULT 'pending',   -- 'active' | 'pending' | 'cancelled' | 'refunded' | 'chargeback' | 'past_due'
  kirvano_subscription_id TEXT,
  kirvano_customer_id     TEXT,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  last_payment_at         TIMESTAMPTZ,
  next_billing_at         TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_email  ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user   ON subscriptions(user_id);

-- Índice único pelo ID da assinatura na Kirvano (quando disponível)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_kirvano_id
  ON subscriptions(kirvano_subscription_id)
  WHERE kirvano_subscription_id IS NOT NULL;

-- ============================================================
-- MONTHLY CONTENT
-- Um registro por (user_id, business_id, month, year).
-- Criado quando o cliente clica em "Gerar conteúdos deste mês".
-- ============================================================
CREATE TABLE IF NOT EXISTS monthly_content (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id  UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  month            SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year             SMALLINT NOT NULL CHECK (year >= 2024),
  plan_name        TEXT NOT NULL DEFAULT 'essencial',
  posts_limit      SMALLINT NOT NULL DEFAULT 5,
  captions_limit   SMALLINT NOT NULL DEFAULT 5,
  messages_limit   SMALLINT NOT NULL DEFAULT 5,
  posts_json       JSONB NOT NULL DEFAULT '[]',
  captions_json    JSONB NOT NULL DEFAULT '[]',
  messages_json    JSONB NOT NULL DEFAULT '[]',
  campaigns_json   JSONB NOT NULL DEFAULT '[]',
  calendar_json    JSONB NOT NULL DEFAULT '[]',
  generated_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garante que cada cliente só gera um pacote por mês por negócio
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_content_unique
  ON monthly_content(user_id, business_id, month, year);

CREATE INDEX IF NOT EXISTS idx_monthly_content_user ON monthly_content(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_content_sub  ON monthly_content(subscription_id);
CREATE INDEX IF NOT EXISTS idx_monthly_content_period ON monthly_content(year, month);

-- ============================================================
-- RLS
-- subscriptions: leitura apenas pelo dono (via email)
-- monthly_content: leitura/escrita apenas pelo dono
-- Webhook usa service role — bypassa RLS automaticamente
-- ============================================================
ALTER TABLE subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_content ENABLE ROW LEVEL SECURITY;

-- Subscriptions: cliente lê a própria assinatura
CREATE POLICY "subscriptions: select own by user_id"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Monthly content: cliente lê os próprios
CREATE POLICY "monthly_content: select own"
  ON monthly_content FOR SELECT
  USING (user_id = auth.uid());

-- Monthly content: cliente insere os próprios (via API route autenticada)
CREATE POLICY "monthly_content: insert own"
  ON monthly_content FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- TRIGGER updated_at para subscriptions
-- ============================================================
CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
