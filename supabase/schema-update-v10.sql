-- schema-update-v10.sql
-- Onboarding: tom de voz, diferencial e dor do cliente

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS tone TEXT,
  ADD COLUMN IF NOT EXISTS differentiator TEXT,
  ADD COLUMN IF NOT EXISTS customer_pain TEXT;
