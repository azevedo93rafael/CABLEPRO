-- ═══════════════════════════════════════════════════════════════════════════════
-- CME Generator — Learning System Migration
-- Tabela: cme_examples
--
-- Armazena matches aprovados pelo admin após cada job.
-- É consultada antes de cada processamento para injetar contexto na IA.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. cme_examples ───────────────────────────────────────────────────────────
create table if not exists public.cme_examples (
  id                         bigserial     primary key,

  -- Descrição do elemento do Revit (usada para busca por similaridade)
  descrizione_elemento       text          not null,

  -- Voce DEI de origem
  codice_dei                 text          not null default '',
  descrizione_dei            text          not null default '',

  -- Match no prezzario target
  codice_target              text          not null,
  descrizione_target         text          not null default '',
  valore_unitario            numeric(14,4) not null default 0,
  um                         text          not null default 'cad',
  categoria                  text          not null default '',

  -- Metadados de qualidade
  score_confirmacao          numeric(4,3)  not null default 1.0, -- 1.0 = aprovado pelo admin
  vezes_usado                integer       not null default 0,   -- incrementado a cada uso

  -- Auditoria
  aprovado_por               uuid          references auth.users(id) on delete set null,
  criado_em                  timestamptz   not null default now(),
  atualizado_em              timestamptz   not null default now(),

  -- Evita duplicatas: mesmo elemento DEI mapeado para o mesmo código target
  unique (codice_dei, codice_target)
);

-- ── Índices ────────────────────────────────────────────────────────────────────
-- Full-text search em português+italiano para busca por descrição
create index if not exists cme_examples_fts_idx
  on public.cme_examples
  using gin (to_tsvector('simple', descrizione_elemento || ' ' || descrizione_dei));

-- Lookup rápido por codice DEI (padrão mais comum)
create index if not exists cme_examples_codice_dei_idx
  on public.cme_examples (codice_dei);

-- Ordenação por mais usados (exemplos mais frequentes = mais confiáveis)
create index if not exists cme_examples_vezes_idx
  on public.cme_examples (vezes_usado desc);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.cme_examples enable row level security;

-- Todos autenticados podem LER exemplos (necessário para injetar no prompt)
drop policy if exists "cme_examples_read" on public.cme_examples;
create policy "cme_examples_read"
  on public.cme_examples for select
  using (auth.role() = 'authenticated');

-- Só admin pode INSERIR / ATUALIZAR / DELETAR exemplos
drop policy if exists "cme_examples_admin_write" on public.cme_examples;
create policy "cme_examples_admin_write"
  on public.cme_examples for insert
  with check (public.cme_is_admin());

drop policy if exists "cme_examples_admin_update" on public.cme_examples;
create policy "cme_examples_admin_update"
  on public.cme_examples for update
  using (public.cme_is_admin());

drop policy if exists "cme_examples_admin_delete" on public.cme_examples;
create policy "cme_examples_admin_delete"
  on public.cme_examples for delete
  using (public.cme_is_admin());

-- ── Função: incrementar vezes_usado ───────────────────────────────────────────
-- Chamada quando um exemplo é recuperado e usado num job
create or replace function public.cme_increment_example_usage(example_ids bigint[])
returns void
language sql
security definer
as $$
  update public.cme_examples
  set vezes_usado = vezes_usado + 1,
      atualizado_em = now()
  where id = any(example_ids);
$$;

-- ── Verificação ───────────────────────────────────────────────────────────────
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name like 'cme_%'
order by table_name;
-- Expected: cme_config, cme_examples, cme_prezzario_voci, cme_prezzarios
