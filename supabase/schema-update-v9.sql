-- schema-update-v9.sql
-- Onboarding quiz: público-alvo e objetivos do negócio

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS target_audience TEXT,
  ADD COLUMN IF NOT EXISTS goals_json TEXT[];
