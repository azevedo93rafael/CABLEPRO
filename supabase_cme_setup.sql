-- ─────────────────────────────────────────────────────────────────────────────
-- CME MODULE — Storage + Tables setup
-- Run this in the Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Tables for CME module
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cme_prezzarios (
  id            SERIAL PRIMARY KEY,
  nome          TEXT NOT NULL,
  data_import   TIMESTAMPTZ DEFAULT NOW(),
  total_voci    INTEGER DEFAULT 0,
  uploaded_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.cme_prezzario_voci (
  id            SERIAL PRIMARY KEY,
  prezzario_id  INTEGER NOT NULL REFERENCES public.cme_prezzarios(id) ON DELETE CASCADE,
  codice        TEXT NOT NULL,
  descrizione   TEXT,
  valore        NUMERIC(12,4) DEFAULT 0,
  um            TEXT DEFAULT 'cad',
  categoria     TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.cme_config (
  id        SERIAL PRIMARY KEY,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chave     TEXT NOT NULL,
  valor     TEXT,
  UNIQUE (user_id, chave)
);

CREATE TABLE IF NOT EXISTS public.cme_examples (
  id                    SERIAL PRIMARY KEY,
  descricao_elemento    TEXT NOT NULL,
  codice_dei            TEXT,
  descrizione_dei       TEXT,
  codice_target         TEXT NOT NULL,
  descrizione_target    TEXT,
  valore_unitario       NUMERIC(12,4) DEFAULT 0,
  um                    TEXT DEFAULT 'cad',
  categoria             TEXT DEFAULT '',
  score_confirmacao     NUMERIC(4,2) DEFAULT 1.0,
  vezes_usado           INTEGER DEFAULT 0,
  aprovado_por          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on all tables
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.cme_prezzarios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cme_prezzario_voci  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cme_config          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cme_examples        ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies — drop existing first to avoid conflicts
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cme_prezzarios_select"    ON public.cme_prezzarios;
DROP POLICY IF EXISTS "cme_prezzarios_insert"    ON public.cme_prezzarios;
DROP POLICY IF EXISTS "cme_prezzarios_delete"    ON public.cme_prezzarios;
DROP POLICY IF EXISTS "cme_voci_select"          ON public.cme_prezzario_voci;
DROP POLICY IF EXISTS "cme_voci_insert"          ON public.cme_prezzario_voci;
DROP POLICY IF EXISTS "cme_voci_delete"          ON public.cme_prezzario_voci;
DROP POLICY IF EXISTS "cme_config_all"           ON public.cme_config;
DROP POLICY IF EXISTS "cme_examples_select"      ON public.cme_examples;
DROP POLICY IF EXISTS "cme_examples_insert"      ON public.cme_examples;

-- Prezzarios: all authenticated users can read; any authenticated user can insert/delete
CREATE POLICY "cme_prezzarios_select" ON public.cme_prezzarios
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cme_prezzarios_insert" ON public.cme_prezzarios
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "cme_prezzarios_delete" ON public.cme_prezzarios
  FOR DELETE TO authenticated USING (true);

-- Prezzario voci: same open policy (shared data)
CREATE POLICY "cme_voci_select" ON public.cme_prezzario_voci
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cme_voci_insert" ON public.cme_prezzario_voci
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "cme_voci_delete" ON public.cme_prezzario_voci
  FOR DELETE TO authenticated USING (true);

-- cme_config: each user owns their own rows
CREATE POLICY "cme_config_all" ON public.cme_config
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- cme_examples: readable by all, insertable by all authenticated
CREATE POLICY "cme_examples_select" ON public.cme_examples
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cme_examples_insert" ON public.cme_examples
  FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Indexes for performance
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cme_voci_prezzario_id ON public.cme_prezzario_voci(prezzario_id);
CREATE INDEX IF NOT EXISTS idx_cme_voci_codice       ON public.cme_prezzario_voci(codice);
CREATE INDEX IF NOT EXISTS idx_cme_config_user_chave ON public.cme_config(user_id, chave);

-- 5. Storage bucket policies for cme-templates
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: The bucket "cme-templates" must first be created manually in the
-- Supabase Dashboard → Storage → New bucket → name: cme-templates, Public: OFF
--
-- Then run these policies (they require the bucket to exist):

DROP POLICY IF EXISTS "cme_templates_select" ON storage.objects;
DROP POLICY IF EXISTS "cme_templates_insert" ON storage.objects;
DROP POLICY IF EXISTS "cme_templates_update" ON storage.objects;
DROP POLICY IF EXISTS "cme_templates_delete" ON storage.objects;

-- All authenticated users can download the template
CREATE POLICY "cme_templates_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'cme-templates');

-- All authenticated users can upload/replace the template
CREATE POLICY "cme_templates_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cme-templates');

-- All authenticated users can update (upsert) the template
CREATE POLICY "cme_templates_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cme-templates')
  WITH CHECK (bucket_id = 'cme-templates');

-- All authenticated users can delete the template
CREATE POLICY "cme_templates_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cme-templates');
