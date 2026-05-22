-- ═══════════════════════════════════════════════════════════════════════════════
-- CME Generator — Supabase Migration
-- Model: SHARED prezzarios — admin uploads once, all users read.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Helper: check if the current user is admin ────────────────────────────────
-- Admin is any user with role='admin' in the public."User" table.
-- This function is used in RLS policies below.
create or replace function public.cme_is_admin()
returns boolean
language sql
security definer stable
as $$
  select exists (
    select 1 from public."User"
    where id = auth.uid()
      and role = 'admin'
  );
$$;


-- ── 1. cme_prezzarios ─────────────────────────────────────────────────────────
-- Prezzario header. No user_id — belongs to the company/tenant.
-- Admin: full CRUD. All authenticated users: SELECT only.
create table if not exists public.cme_prezzarios (
  id           bigserial    primary key,
  uploaded_by  uuid         references auth.users(id) on delete set null,
  nome         text         not null,
  data_import  timestamptz  not null default now(),
  total_voci   integer      not null default 0
);

alter table public.cme_prezzarios enable row level security;

-- Everyone authenticated can read
drop policy if exists "cme_prezzarios_read"   on public.cme_prezzarios;
create policy "cme_prezzarios_read"
  on public.cme_prezzarios for select
  using (auth.role() = 'authenticated');

-- Only admin can insert / update / delete
drop policy if exists "cme_prezzarios_admin_write" on public.cme_prezzarios;
create policy "cme_prezzarios_admin_write"
  on public.cme_prezzarios for insert
  with check (public.cme_is_admin());

drop policy if exists "cme_prezzarios_admin_update" on public.cme_prezzarios;
create policy "cme_prezzarios_admin_update"
  on public.cme_prezzarios for update
  using (public.cme_is_admin());

drop policy if exists "cme_prezzarios_admin_delete" on public.cme_prezzarios;
create policy "cme_prezzarios_admin_delete"
  on public.cme_prezzarios for delete
  using (public.cme_is_admin());


-- ── 2. cme_prezzario_voci ─────────────────────────────────────────────────────
-- Price list rows. Can contain up to 30k rows per prezzario.
create table if not exists public.cme_prezzario_voci (
  id            bigserial     primary key,
  prezzario_id  bigint        not null references public.cme_prezzarios(id) on delete cascade,
  codice        text          not null,
  descrizione   text          not null default '',
  valore        numeric(14,4) not null default 0,
  um            text          not null default 'cad',
  categoria     text          not null default ''
);

-- Indexes for fast lookup during AI matching
create index if not exists cme_voci_prezzario_idx on public.cme_prezzario_voci (prezzario_id);
create index if not exists cme_voci_codice_idx    on public.cme_prezzario_voci (prezzario_id, codice);

alter table public.cme_prezzario_voci enable row level security;

-- Everyone authenticated can read
drop policy if exists "cme_voci_read" on public.cme_prezzario_voci;
create policy "cme_voci_read"
  on public.cme_prezzario_voci for select
  using (auth.role() = 'authenticated');

-- Only admin can write
drop policy if exists "cme_voci_admin_write" on public.cme_prezzario_voci;
create policy "cme_voci_admin_write"
  on public.cme_prezzario_voci for insert
  with check (public.cme_is_admin());

drop policy if exists "cme_voci_admin_delete" on public.cme_prezzario_voci;
create policy "cme_voci_admin_delete"
  on public.cme_prezzario_voci for delete
  using (public.cme_is_admin());


-- ── 3. cme_config ─────────────────────────────────────────────────────────────
-- Per-user settings (e.g. which prezzario was last selected).
-- Each user owns their own config rows.
create table if not exists public.cme_config (
  user_id  uuid  not null references auth.users(id) on delete cascade,
  chave    text  not null,
  valor    text,
  primary key (user_id, chave)
);

alter table public.cme_config enable row level security;

drop policy if exists "cme_config_owner" on public.cme_config;
create policy "cme_config_owner"
  on public.cme_config for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── Verify ────────────────────────────────────────────────────────────────────
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name like 'cme_%'
order by table_name;
-- Expected: cme_config, cme_prezzario_voci, cme_prezzarios
