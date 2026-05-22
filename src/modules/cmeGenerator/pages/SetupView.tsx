// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/pages/SetupView.tsx
// Step 1: Load prezzarios (from Supabase) + upload Revit CSV
// Upload/Delete controls are shown only to admins (role='admin').
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef } from 'react';
import { Trash2, Plus, Database, FileSpreadsheet, ChevronRight, AlertCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  listPrezzarios, savePrezzario, deletePrezzario, parsePrezzarioFile
} from '../services/prezzarioService';
import { parseRevitCsv } from '../services/csvParser';
import { useCme } from '../context/CmeContext';
import type { PrezzarioRecord } from '../types';
import type { UserProfile } from '../../../context/AuthContext';

interface SetupViewProps {
  user: UserProfile;
  prezzarios: PrezzarioRecord[];
  setPrezzarios: (p: PrezzarioRecord[]) => void;
  refPrezzarioId: number | null;
  setRefPrezzarioId: (id: number) => void;
  targetPrezzarioId: number | null;
  setTargetPrezzarioId: (id: number) => void;
  onStartProcessing: () => void;
}

export function SetupView({
  user,
  prezzarios,
  setPrezzarios,
  refPrezzarioId,
  setRefPrezzarioId,
  targetPrezzarioId,
  setTargetPrezzarioId,
  onStartProcessing,
}: SetupViewProps) {
  const { state, dispatch } = useCme();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const csvRef  = useRef<HTMLInputElement>(null);
  const prezRef = useRef<HTMLInputElement>(null);

  const isAdmin    = user.role === 'admin';
  const canProcess = state.elementos.length > 0 && prezzarios.length > 0;

  // ── CSV upload ─────────────────────────────────────────────────────────────

  async function handleCsvUpload(file: File) {
    setError(null); setSuccess(null);
    try {
      const text = await file.text();
      const { elementos, warnings } = parseRevitCsv(text);
      dispatch({ type: 'SET_ELEMENTOS', payload: elementos });
      setSuccess(`✓ ${elementos.length} elementos carregados do CSV`);
      if (warnings.length > 0) setError(`Avisos: ${warnings.slice(0, 3).join(', ')}`);
    } catch (e: any) {
      setError(`Erro ao ler CSV: ${e.message}`);
    }
  }

  // ── Prezzario upload (admin only) ──────────────────────────────────────────

  async function handlePrezzarioUpload(file: File) {
    if (!isAdmin) return;
    setError(null); setSuccess(null);
    setLoading(true);
    setUploadProgress('Lendo arquivo...');
    try {
      const voci = await parsePrezzarioFile(file);
      setUploadProgress(`Salvando ${voci.length} voci no Supabase...`);
      const name = file.name.replace(/\.[^.]+$/, '');
      await savePrezzario(name, voci, user.id);
      const updated = await listPrezzarios();
      setPrezzarios(updated);
      setSuccess(`✓ Prezzario "${name}" salvo com ${voci.length} voci`);
    } catch (e: any) {
      setError(`Erro: ${e.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  async function handleDelete(id: number) {
    if (!isAdmin) return;
    if (!window.confirm('Apagar este prezzario e todas as suas voci?')) return;
    try {
      await deletePrezzario(id);
      const updated = await listPrezzarios();
      setPrezzarios(updated);
      setSuccess('Prezzario apagado.');
    } catch (e: any) {
      setError(`Erro ao apagar: ${e.message}`);
    }
  }

  function onDrop(type: 'csv' | 'prez') {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (type === 'csv') handleCsvUpload(file);
      else if (isAdmin) handlePrezzarioUpload(file);
    };
  }

  return (
    <div className="flex-1 overflow-auto p-8 space-y-8">
      {/* ── Alerts ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 flex gap-3 items-start">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-red-300 text-sm">{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 text-green-300 text-sm">
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CSV do Revit ── */}
      <section>
        <h2 className="text-sm font-bold tracking-widest text-white/40 uppercase mb-4">
          1 — CSV do Revit
        </h2>
        <div
          onClick={() => csvRef.current?.click()}
          onDrop={onDrop('csv')}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-white/10 hover:border-[#E94560]/50 rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors group"
        >
          <FileSpreadsheet size={36} className="text-white/20 group-hover:text-[#E94560]/60 transition-colors" />
          <div className="text-center">
            <p className="text-white/60 text-sm">Arraste ou clique para selecionar o CSV do Revit</p>
            {state.elementos.length > 0 && (
              <p className="text-[#E94560] font-bold mt-2">✓ {state.elementos.length} elementos carregados</p>
            )}
          </div>
          <input ref={csvRef} type="file" accept=".csv" className="hidden"
            onChange={e => e.target.files?.[0] && handleCsvUpload(e.target.files[0])} />
        </div>
      </section>

      {/* ── Prezzarios ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold tracking-widest text-white/40 uppercase">
            2 — Prezzarios
            <span className="text-white/20 font-normal ml-2">(Supabase — compartilhados)</span>
          </h2>

          {/* Upload button — admin only */}
          {isAdmin && (
            <button
              onClick={() => prezRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#E94560]/20 hover:bg-[#E94560]/40 border border-[#E94560]/30 rounded-xl text-[#E94560] text-sm font-bold transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              {uploadProgress ?? 'Carregar Prezzario'}
            </button>
          )}
          <input ref={prezRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={e => e.target.files?.[0] && handlePrezzarioUpload(e.target.files[0])} />
        </div>

        {/* Upload progress */}
        {loading && uploadProgress && (
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 mb-3 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-[#E94560] border-t-transparent rounded-full animate-spin" />
            <span className="text-white/60 text-sm">{uploadProgress}</span>
          </div>
        )}

        {/* Empty state */}
        {prezzarios.length === 0 ? (
          <div
            onClick={isAdmin ? () => prezRef.current?.click() : undefined}
            onDrop={isAdmin ? onDrop('prez') : undefined}
            onDragOver={isAdmin ? e => e.preventDefault() : undefined}
            className={`border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center gap-3 transition-colors
              ${isAdmin ? 'hover:border-white/20 cursor-pointer' : 'cursor-default'}`}
          >
            <Database size={32} className="text-white/20" />
            {isAdmin
              ? <p className="text-white/40 text-sm">Carregue um prezzario DEI ou Sicilia (.xlsx ou .csv)</p>
              : <p className="text-white/30 text-sm flex items-center gap-2"><Lock size={14} />Nenhum prezzario disponível — aguarde o admin carregar</p>
            }
          </div>
        ) : (
          <div className="space-y-2">
            {prezzarios.map(p => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{p.nome}</p>
                  <p className="text-white/40 text-xs">
                    {p.totalVoci.toLocaleString('it-IT')} voci · importado em {new Date(p.dataImport).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {/* Delete button — admin only */}
                {isAdmin && (
                  <button onClick={() => handleDelete(p.id!)} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Prezzario selectors */}
        {prezzarios.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-5">
            {[
              { label: 'Prezzario de Referência (DEI)', value: refPrezzarioId, set: setRefPrezzarioId },
              { label: 'Prezzario Target', value: targetPrezzarioId, set: setTargetPrezzarioId },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block text-xs text-white/40 font-bold tracking-widest uppercase mb-2">{label}</label>
                <select
                  value={value ?? ''}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                >
                  <option value="">— selecionar —</option>
                  {prezzarios.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Process button ── */}
      <div className="flex justify-end pt-4">
        <motion.button
          onClick={onStartProcessing}
          disabled={!canProcess}
          whileHover={canProcess ? { scale: 1.02 } : undefined}
          whileTap={canProcess ? { scale: 0.98 } : undefined}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all
            ${canProcess
              ? 'bg-gradient-to-r from-[#0F3460] to-[#E94560] text-white shadow-2xl shadow-[#E94560]/20 hover:shadow-[#E94560]/40'
              : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
        >
          PROCESSAR
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </div>
  );
}
