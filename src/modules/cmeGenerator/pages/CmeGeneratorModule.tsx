// src/modules/cmeGenerator/pages/CmeGeneratorModule.tsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, BarChart2, Brain, Settings, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../../context/AppContext';
import { CmeProvider, useCme } from '../context/CmeContext';
import { ProjectsView } from './ProjectsView';
import { SetupView } from './SetupView';
import { ProcessingView } from './ProcessingView';
import { ResultsView } from './ResultsView';
import { ReviewView } from './ReviewView';
import { ChatView } from './ChatView';
import { CmeSettingsPage } from './CmeSettingsPage';
import { listPrezzarios } from '../services/prezzarioService';
import { getExamplesCount } from '../services/examplesService';
import type { PrezzarioRecord } from '../types';
import type { UserProfile } from '../../../context/AuthContext';

type View = 'projects' | 'setup' | 'processing' | 'review' | 'results' | 'settings';

interface Props {
  user: UserProfile;
  onBack: () => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

function CmeModuleInner({ user, onBack }: Props) {
  const { darkMode, setDarkMode } = useApp();
  const { state } = useCme();
  const [view, setView] = useState<View>('projects');
  const [activeTab, setActiveTab] = useState<'results' | 'chat'>('results');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [examplesCount, setExamplesCount] = useState(0);

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
    // Load example bank count for display
    getExamplesCount().then(setExamplesCount).catch(() => {});
  }, []);

  const refName    = prezzarios.find(p => p.id === refPrezzarioId)?.nome ?? 'DEI';
  const targetName = prezzarios.find(p => p.id === targetPrezzarioId)?.nome ?? 'Target';

  function handleElementSelect(id: string) {
    setSelectedElementId(id);
    setActiveTab('chat');
  }

  const NAV = [
    { id: 'projects',   label: 'Progetti',          active: view === 'projects' },
    { id: 'setup',      label: '1 · Caricamento',   active: view === 'setup' },
    { id: 'processing', label: '2 · Elaborazione',  active: view === 'processing' },
    { id: 'review',     label: '3 · Revisione',     active: view === 'review' },
    { id: 'results',    label: '4 · Risultati',     active: view === 'results' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060A12] text-gray-900 dark:text-white flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#080C14]">
        <button onClick={onBack}
          className="flex items-center gap-2 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white transition-colors text-sm font-bold tracking-widest uppercase">
          <ChevronLeft size={18} />
          Moduli
        </button>
        <div className="w-px h-5 bg-gray-200 dark:bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F3460] to-[#E94560] flex items-center justify-center">
            <BarChart2 size={16} className="text-gray-900 dark:text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-gray-400 dark:text-white/30 uppercase">RILO ELETTRICO</p>
            <p className="text-gray-900 dark:text-white font-bold text-sm leading-none">CME Generator</p>
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
                  : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:text-white/60'}`}>
              {step.label}
            </button>
          ))}
        </div>

        {/* Results sub-tabs (only when in results view) */}
        {view === 'results' && (
          <>
            <div className="w-px h-5 bg-gray-200 dark:bg-white/10" />
            <div className="flex gap-1">
              {(['results', 'chat'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all
                    ${activeTab === t ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:text-white/60'}`}>
                  {t === 'results' ? 'Risultati' : 'Chat IA'}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Example bank badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs text-gray-500 dark:text-white/40">
          <Brain size={12} className="text-[#E94560]/60" />
          <span>{examplesCount.toLocaleString('it-IT')} esempi
          </span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg transition-colors ml-2 text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5"
          title={darkMode ? 'Tema Chiaro' : 'Tema Scuro'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings Button — admin only */}
        {(user.role === 'admin' || user.email === 'rafael.azevedo.93@live.com') && (
          <button
            onClick={() => setView('settings')}
            className={`p-2 rounded-lg transition-colors ml-2 ${view === 'settings' ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/80 hover:bg-gray-100 dark:bg-white/5'}`}
            title="Impostazioni"
          >
            <Settings size={18} />
          </button>
        )}

        {/* Stats badge */}
        {state.resultados.size > 0 && (
          <div className="flex gap-3 text-xs">
            <span className="text-gray-500 dark:text-white/40">{state.resultados.size} elementi</span>
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
          {view === 'projects' && (
            <ProjectsView onNext={() => setView('setup')} />
          )}

          {view === 'setup' && (
            <SetupView
              user={user}
              prezzarios={prezzarios}
              refPrezzarioId={refPrezzarioId}
              setRefPrezzarioId={setRefPrezzarioId}
              targetPrezzarioId={targetPrezzarioId}
              setTargetPrezzarioId={setTargetPrezzarioId}
              onStartProcessing={() => setView('processing')}
              onGoToSettings={() => setView('settings')}
            />
          )}

          {view === 'processing' && (
            <ProcessingView
              refPrezzarioId={refPrezzarioId!}
              targetPrezzarioId={targetPrezzarioId!}
              refPrezzarioName={refName}
              targetPrezzarioName={targetName}
              onDone={() => setView('review')}
            />
          )}

          {view === 'review' && (
            <ReviewView
              user={user}
              onFinish={() => { setView('results'); getExamplesCount().then(setExamplesCount).catch(() => {}); }}
              onSkip={() => setView('results')}
            />
          )}

          {view === 'results' && activeTab === 'results' && (
            <ResultsView onSelectElement={handleElementSelect} />
          )}

          {view === 'results' && activeTab === 'chat' && (
            <ChatView selectedId={selectedElementId} />
          )}

          {view === 'settings' && (
            <CmeSettingsPage user={user} prezzarios={prezzarios} setPrezzarios={setPrezzarios} />
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
