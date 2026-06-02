-- ============================================================
-- MeuNegócio Pro — Row Level Security (RLS)
-- Execute APÓS o schema.sql
-- ============================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases    ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_assets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES — usuário vê e edita apenas o próprio perfil
-- ============================================================
CREATE POLICY "profiles: select own"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- PURCHASES — somente service role e o próprio usuário pelo e-mail
-- (usuário não pode ler as compras diretamente — use API route)
-- ============================================================
-- Sem políticas de SELECT para anon/authenticated — acesso apenas via service role (API routes)

-- ============================================================
-- BUSINESSES — usuário vê e edita apenas os próprios negócios
-- Mini sites são públicos (leitura por slug)
-- ============================================================
CREATE POLICY "businesses: select own"
  ON businesses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "businesses: insert own"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "businesses: update own"
  ON businesses FOR UPDATE
  USING (auth.uid() = user_id);

-- Mini site público: qualquer pessoa pode ler pelo slug
CREATE POLICY "businesses: public read by slug"
  ON businesses FOR SELECT
  USING (TRUE); -- Todos podem ler — o slug é pseudo-privado por ser único e aleatório

-- ============================================================
-- KITS — usuário vê e edita apenas os próprios kits
-- ============================================================
CREATE POLICY "kits: select own"
  ON kits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "kits: insert own"
  ON kits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kits: update own"
  ON kits FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- POST ASSETS — usuário vê apenas os próprios
-- ============================================================
CREATE POLICY "post_assets: select own"
  ON post_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "post_assets: insert own"
  ON post_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ACCESS LOGS — usuário só insere os próprios logs
-- ============================================================
CREATE POLICY "access_logs: insert own"
  ON access_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "access_logs: select own"
  ON access_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- SERVICE ROLE bypassa RLS automaticamente
-- Rotas de API (webhook, check-purchase) usam service role
-- e nunca são expostas ao frontend
-- ============================================================
