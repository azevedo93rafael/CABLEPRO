// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/services/templateService.ts
// Manages the company's CME Excel template stored in Supabase Storage.
//
// The template is uploaded ONCE by an admin and reused on every computo export.
// Claude analyses its structure on upload; the analysis is cached in cme_config.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../../../lib/supabase';

const BUCKET        = 'cme-templates';
const TEMPLATE_PATH = 'computo_template.xlsx';   // fixed path — always overwritten
const CONFIG_KEY    = 'cme_template_meta';        // stored in cme_config

export interface TemplateMetadata {
  fileName:    string;
  uploadedAt:  string;
  uploadedBy:  string;
  sizeBytes:   number;
  // Claude's analysis result — column mapping + first data row
  analysis?: {
    columns:       string[];   // detected column names in order
    dataStartRow:  number;     // 1-based row where data begins
    headerRow:     number;     // row with column labels
    hasLogo:       boolean;
    notes:         string;
  };
}

// ── Upload template file to Storage ──────────────────────────────────────────
export async function uploadTemplate(
  file: File,
  userId: string,
): Promise<TemplateMetadata> {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    throw new Error('O template deve ser um ficheiro .xlsx');
  }

  const buffer = await file.arrayBuffer();

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(TEMPLATE_PATH, buffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      upsert: true,   // overwrite if exists
    });

  if (uploadErr) throw new Error(`Erro ao carregar template: ${uploadErr.message}`);

  const meta: TemplateMetadata = {
    fileName:   file.name,
    uploadedAt: new Date().toISOString(),
    uploadedBy: userId,
    sizeBytes:  file.size,
  };

  // Save metadata to cme_config (shared — userId is a fixed sentinel)
  await supabase.from('cme_config').upsert(
    { user_id: userId, chave: CONFIG_KEY, valor: JSON.stringify(meta) },
    { onConflict: 'user_id,chave' },
  );

  return meta;
}

// ── Get stored metadata ───────────────────────────────────────────────────────
export async function getTemplateMeta(userId: string): Promise<TemplateMetadata | null> {
  const { data } = await supabase
    .from('cme_config')
    .select('valor')
    .eq('user_id', userId)
    .eq('chave', CONFIG_KEY)
    .single();

  if (!data?.valor) return null;
  try { return JSON.parse(data.valor) as TemplateMetadata; }
  catch { return null; }
}

// ── Save updated metadata (e.g. after analysis) ───────────────────────────────
export async function saveTemplateMeta(userId: string, meta: TemplateMetadata): Promise<void> {
  await supabase.from('cme_config').upsert(
    { user_id: userId, chave: CONFIG_KEY, valor: JSON.stringify(meta) },
    { onConflict: 'user_id,chave' },
  );
}

// ── Download template as ArrayBuffer (for ExcelJS) ────────────────────────────
export async function downloadTemplateBuffer(): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(TEMPLATE_PATH);

  if (error || !data) throw new Error(`Erro ao descarregar template: ${error?.message}`);
  return data.arrayBuffer();
}

// ── Delete template ───────────────────────────────────────────────────────────
export async function deleteTemplate(userId: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([TEMPLATE_PATH]);
  await supabase.from('cme_config')
    .delete()
    .eq('user_id', userId)
    .eq('chave', CONFIG_KEY);
}

// ── Check if a template is loaded ────────────────────────────────────────────
export async function hasTemplate(): Promise<boolean> {
  const { data } = await supabase.storage.from(BUCKET).list('', { search: 'computo_template' });
  return (data ?? []).length > 0;
}
