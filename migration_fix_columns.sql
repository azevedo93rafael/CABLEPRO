-- Add missing columns to project_phases
ALTER TABLE public.project_phases ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Distribuzione Generale';

-- Add missing columns to checklist_items
ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS tooltip TEXT DEFAULT '';
ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
