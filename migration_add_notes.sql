-- MIGRATION: ADD NOTES AND TOOLTIP TO CHECKLIST ITEMS
-- Run this in the Supabase SQL Editor

ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS tooltip TEXT DEFAULT '';
