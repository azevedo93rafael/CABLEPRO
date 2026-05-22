// src/modules/cmeGenerator/pages/ProcessingView.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { processElemento, buildNvpResult } from '../services/claudeService';
import { loadVoci } from '../services/prezzarioService';
import { useCme } from '../context/CmeContext';
import type { Elemento, PrezzarioVoce } from '../types';

interface ProcessingViewProps {
  refPrezzarioId: number;
  targetPrezzarioId: number;
  refPrezzarioName: string;
  targetPrezzarioName: string;
  onDone: () => void;
}

interface NvpModalState {
  elemento: Elemento;
  resolve: (value: { valoreUnitario: number; originePrezzo: string }) => void;
}

export function ProcessingView({
  refPrezzarioId,
  targetPrezzarioId,
  refPrezzarioName,
  targetPrezzarioName,
  onDone,
}: ProcessingViewProps) {
  const { state, dispatch } = useCme();
  const [log, setLog] = useState<Array<{ text: string; type: 'ok' | 'alert' | 'err' | 'info' }>>([]);
  const [nvpModal, setNvpModal] = useState<NvpModalState | null>(null);
  const [nvpValue, setNvpValue] = useState('');
  const [nvpFonte, setNvpFonte] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(false);

  const addLog = (text: string, type: 'ok' | 'alert' | 'err' | 'info' = 'info') =>
    setLog(prev => [...prev.slice(-200), { text, type }]);

  async function askNvp(elemento: Elemento): Promise<{ valoreUnitario: number; originePrezzo: string }> {
    return new Promise(resolve => setNvpModal({ elemento, resolve }));
  }

  useEffect(() => {
    if (runRef.current) return;
    runRef.current = true;

    (async () => {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      addLog('Carregando prezzario do IndexedDB...', 'info');

      const targetVoci: PrezzarioVoce[] = await loadVoci(targetPrezzarioId);
      addLog(`✓ ${targetVoci.length} voci carregadas`, 'ok');

      const prezzario = state.elementos.filter(e => e.tipoPrezzo === 'PREZZARIO');
      const nvpItems  = state.elementos.filter(e => e.tipoPrezzo === 'NVP');

      for (let i = 0; i < prezzario.length; i++) {
        const el = prezzario[i];
        dispatch({ type: 'SET_PROGRESS', payload: {
          current: i + 1,
          total: state.elementos.length,
          message: `${el.descrizione.slice(0, 50)}...`,
        }});
        addLog(`[${i + 1}/${prezzario.length}] ${el.descrizione.slice(0, 60)}`, 'info');

        const result = await processElemento(el, targetVoci, refPrezzarioName, targetPrezzarioName);
        dispatch({ type: 'ADD_RESULTADO', payload: result });

        const logType = result.status === 'OK' ? 'ok' : result.status === 'ALERT' ? 'alert' : 'err';
        addLog(`  → ${result.status} | €${result.total.toFixed(2)}`, logType);
      }

      if (nvpItems.length > 0) {
        addLog(`\n${nvpItems.length} itens NVP aguardam entrada manual...`, 'alert');
        for (const el of nvpItems) {
          const { valoreUnitario, originePrezzo } = await askNvp(el);
          dispatch({ type: 'ADD_RESULTADO', payload: buildNvpResult(el, valoreUnitario, originePrezzo || 'NVP Manual') });
          addLog(`✓ NVP: ${el.descrizione.slice(0, 40)} → €${valoreUnitario}/ud`, 'ok');
        }
      }

      dispatch({ type: 'SET_PROCESSING', payload: false });
      addLog('\n✓ Processamento concluído!', 'ok');
      setTimeout(onDone, 1200);
    })().catch(e => addLog(`Erro fatal: ${String(e)}`, 'err'));
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const pct = state.progress.total > 0
    ? Math.round((state.progress.current / state.progress.total) * 100)
    : 0;

  return (
    <div className="flex-1 overflow-hidden p-8 flex flex-col gap-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/60 text-sm">{state.progress.message || 'Iniciando...'}</span>
          <span className="text-white font-black text-lg">{pct}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#0F3460] to-[#E94560] rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-2">
          <span>{state.progress.current} de {state.progress.total}</span>
          <span>Claude API</span>
        </div>
      </div>

      <div ref={logRef} className="flex-1 bg-[#080C14] border border-white/5 rounded-2xl p-5 overflow-auto font-mono text-xs leading-6">
        {log.map((entry, i) => (
          <div key={i} className={
            entry.type === 'ok' ? 'text-green-400' :
            entry.type === 'alert' ? 'text-yellow-400' :
            entry.type === 'err' ? 'text-red-400' : 'text-white/40'
          }>
            {entry.type === 'ok'    && <CheckCircle2 size={11} className="inline mr-1 mb-0.5" />}
            {entry.type === 'alert' && <AlertTriangle size={11} className="inline mr-1 mb-0.5" />}
            {entry.type === 'err'   && <XCircle size={11} className="inline mr-1 mb-0.5" />}
            {entry.type === 'info'  && <Loader2 size={11} className="inline mr-1 mb-0.5 animate-spin" />}
            {entry.text}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {nvpModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#0A1628] border border-[#E94560]/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="mb-2 text-xs font-bold tracking-widest text-[#E94560] uppercase">Item NVP</div>
              <h3 className="text-white text-lg font-bold mb-1">{nvpModal.elemento.descrizione}</h3>
              <p className="text-white/40 text-sm mb-6">
                {nvpModal.elemento.edificio} / {nvpModal.elemento.livello} · {nvpModal.elemento.quantita} {nvpModal.elemento.um}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 font-bold uppercase tracking-widest block mb-2">Valore Unitario (€)</label>
                  <input type="number" step="0.01" min="0" value={nvpValue} onChange={e => setNvpValue(e.target.value)}
                    placeholder="0.00" autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#E94560]/50" />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-bold uppercase tracking-widest block mb-2">Fonte / Fornecedor</label>
                  <input type="text" value={nvpFonte} onChange={e => setNvpFonte(e.target.value)}
                    placeholder="Ex: Schneider, ABB, orçamento..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E94560]/50" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => {
                  const v = parseFloat(nvpValue.replace(',', '.')) || 0;
                  nvpModal.resolve({ valoreUnitario: v, originePrezzo: nvpFonte });
                  setNvpModal(null); setNvpValue(''); setNvpFonte('');
                }} className="flex-1 bg-gradient-to-r from-[#0F3460] to-[#E94560] text-white font-black text-sm tracking-widest uppercase py-3 rounded-xl">
                  CONFIRMAR
                </button>
                <button onClick={() => {
                  nvpModal.resolve({ valoreUnitario: 0, originePrezzo: 'NVP — Não informado' });
                  setNvpModal(null); setNvpValue(''); setNvpFonte('');
                }} className="px-5 bg-white/5 text-white/50 rounded-xl text-sm">
                  Pular
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
