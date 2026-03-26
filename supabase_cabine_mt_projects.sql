-- ======================================================================================
-- SUPABASE SQL SCRIPT: CABINE MT PROJECTS
-- Creates the table and security policies for saving Cabine MT projects
-- ======================================================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.cabine_mt_projects (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    cabin_dimensions JSONB NOT NULL DEFAULT '{}'::jsonb,
    thermal_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    num_switchboard_columns INTEGER NOT NULL DEFAULT 0,
    calc_version TEXT NOT NULL,
    notes TEXT,
    last_saved TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.cabine_mt_projects ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can only SELECT their own projects
CREATE POLICY "Users can view their own Cabine MT projects" 
    ON public.cabine_mt_projects 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can only INSERT their own projects
CREATE POLICY "Users can insert their own Cabine MT projects" 
    ON public.cabine_mt_projects 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own projects
CREATE POLICY "Users can update their own Cabine MT projects" 
    ON public.cabine_mt_projects 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own projects
CREATE POLICY "Users can delete their own Cabine MT projects" 
    ON public.cabine_mt_projects 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS cabine_mt_projects_user_id_idx ON public.cabine_mt_projects(user_id);
