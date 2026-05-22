// src/modules/cmeGenerator/pages/CmeGeneratorModule.tsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';
import { CmeProvider, useCme } from '../context/CmeContext';
import { SetupView } from './SetupView';
import { ProcessingView } from './ProcessingView';
import { ResultsView } from './ResultsView';
import { ChatView } from './ChatView';
import { listPrezzarios } from '../services/prezzarioService';
import type { PrezzarioRecord } from '../types';
import type { UserProfile } from '../../../context/AuthContext';

type View = 'setup' | 'processing' | 'results';

interface Props {
  user: UserProfile;
  onBack: () => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

function CmeModuleInner({ user, onBack }: Props) {
  const { state } = useCme();
  const [view, setView] = useState<View>('setup');
  const [activeTab, setActiveTab] = useState<'results' | 'chat'>('results');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Prezzario state (loaded from Supabase — shared across all users)
  const [prezzarios, setPrezzarios] = useState<PrezzarioRecord[]>([]);
  const [refPrezzarioId, setRefPrezzarioId] = useState<number | null>(null);
  const [targetPrezzarioId, setTargetPrezzarioId] = useState<number | null>(null);

  useEffect(() => {
    listPrezzarios().then(list => {
      setPrezzarios(list);
      if (list.length > 0 && !refPrezzarioId) setRefPrezzarioId(list[0].id!);
      if (list.length > 0 && !targetPrezzarioId) setTargetPrezzarioId(list[list.length > 1 ? 1 : 0].id!);
    });
  }, []);

  const refName    = prezzarios.find(p => p.id === refPrezzarioId)?.nome ?? 'DEI';
  const targetName = prezzarios.find(p => p.id === targetPrezzarioId)?.nome ?? 'Target';

  function handleElementSelect(id: string) {
    setSelectedElementId(id);
    setActiveTab('chat');
  }

  const NAV = [
    { id: 'setup',      label: '1 · Carregamento', active: view === 'setup' },
    { id: 'processing', label: '2 · Processamento', active: view === 'processing' },
    { id: 'results',    label: '3 · Resultados', active: view === 'results' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#060A12] text-white flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#080C14]">
        <button onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase">
          <ChevronLeft size={18} />
          Módulos
        </button>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F3460] to-[#E94560] flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase">RILO ELETTRICO</p>
            <p className="text-white font-bold text-sm leading-none">CME Generator</p>
          </div>
        </div>

        {/* Step nav */}
        <div className="flex gap-1 ml-auto">
          {NAV.map(step => (
            <button key={step.id}
              onClick={() => {
                if (step.id === 'results' && state.resultados.size === 0) return;
                if (step.id !== 'processing') setView(step.id as View);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all
                ${step.active
                  ? 'bg-[#E94560]/20 text-[#E94560] border border-[#E94560]/30'
                  : 'text-white/30 hover:text-white/60'}`}>
              {step.label}
            </button>
          ))}
        </div>

        {/* Results sub-tabs (only when in results view) */}
        {view === 'results' && (
          <>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex gap-1">
              {(['results', 'chat'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all
                    ${activeTab === t ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}>
                  {t === 'results' ? 'Resultados' : 'Chat IA'}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Stats badge */}
        {state.resultados.size > 0 && (
          <div className="flex gap-3 text-xs">
            <span className="text-white/40">{state.resultados.size} itens</span>
            <span className="text-[#E94560] font-bold">
              €{Array.from(state.resultados.values()).reduce((s, r) => s + r.total, 0).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {view === 'setup' && (
            <SetupView
              user={user}
              prezzarios={prezzarios}
              setPrezzarios={setPrezzarios}
              refPrezzarioId={refPrezzarioId}
              setRefPrezzarioId={setRefPrezzarioId}
              targetPrezzarioId={targetPrezzarioId}
              setTargetPrezzarioId={setTargetPrezzarioId}
              onStartProcessing={() => setView('processing')}
            />
          )}

          {view === 'processing' && (
            <ProcessingView
              refPrezzarioId={refPrezzarioId!}
              targetPrezzarioId={targetPrezzarioId!}
              refPrezzarioName={refName}
              targetPrezzarioName={targetName}
              onDone={() => setView('results')}
            />
          )}

          {view === 'results' && activeTab === 'results' && (
            <ResultsView onSelectElement={handleElementSelect} />
          )}

          {view === 'results' && activeTab === 'chat' && (
            <ChatView selectedId={selectedElementId} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function CmeGeneratorModule(props: Props) {
  return (
    <CmeProvider>
      <CmeModuleInner {...props} />
    </CmeProvider>
  );
}
