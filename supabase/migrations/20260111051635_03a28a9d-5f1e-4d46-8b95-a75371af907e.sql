-- Add temporada (season) column to capitulos table
ALTER TABLE public.capitulos ADD COLUMN IF NOT EXISTS temporada INTEGER DEFAULT 1;