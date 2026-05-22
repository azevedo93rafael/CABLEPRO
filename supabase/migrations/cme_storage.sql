-- ═══════════════════════════════════════════════════════════════════════════════
-- CME Generator — Storage Migration
-- Bucket: cme-templates (stores the user's Excel template file)
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- After running, also go to Storage → New Bucket → name: cme-templates, Private
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create the storage bucket (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'cme-templates'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('cme-templates', 'cme-templates', false);
  END IF;
END $$;

-- ── RLS Policies for cme-templates ────────────────────────────────────────────

-- Any authenticated user can READ the shared template
drop policy if exists "cme_templates_read" on storage.objects;
create policy "cme_templates_read"
  on storage.objects for select
  using (
    bucket_id = 'cme-templates'
    AND auth.role() = 'authenticated'
  );

-- Only admin can upload/replace templates
drop policy if exists "cme_templates_admin_insert" on storage.objects;
create policy "cme_templates_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'cme-templates'
    AND public.cme_is_admin()
  );

drop policy if exists "cme_templates_admin_update" on storage.objects;
create policy "cme_templates_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'cme-templates'
    AND public.cme_is_admin()
  );

drop policy if exists "cme_templates_admin_delete" on storage.objects;
create policy "cme_templates_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'cme-templates'
    AND public.cme_is_admin()
  );

-- Verify
SELECT id, name, public FROM storage.buckets WHERE id = 'cme-templates';
