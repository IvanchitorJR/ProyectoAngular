-- Migration: add 'cantidad' column to productos
-- Run this manually if you prefer not to rely on server startup migration

ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS cantidad INT DEFAULT 0;
