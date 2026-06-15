-- schema-update-v11.sql
-- Nicho personalizado para negócios fora da lista padrão

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS custom_niche TEXT;
