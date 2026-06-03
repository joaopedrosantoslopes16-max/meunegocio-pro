-- ============================================================
-- MeuNegócio Pro — Schema Update v7
-- Posição vertical de imagens no mini-site
-- Execute APÓS schema-update-v6.sql
-- ============================================================

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS cover_image_position_y        INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS professional_photo_position_y INTEGER NOT NULL DEFAULT 50;
