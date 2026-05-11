import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { useApp } from '../../../context/AppContext';
import { PhaseCard } from '../components/PhaseCard';
import { TRANSLATIONS } from '../../../constants';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface ChecklistPageProps {
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const ChecklistPage: React.FC<ChecklistPageProps> = ({ onBack, showToast }) => {
  const { moduleTheme, lang } = useApp();
  const { projects, activeProjectId, toggleItem, updateItemNotes, reopenPhase, isLoading, initializeProjectPhases, fetchProjects } = useProjectStore();
  const t = TRANSLATIONS[lang].projectHub;
  const [initializing, setInitializing] = React.useState(false);

  const project = projects?.find(p => p.projectId === activeProjectId);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-current rounded-full animate-spin opacity-40"
          style={{ borderTopColor: moduleTheme.accent }} />
      </div>
    );
  }

  // ─── No project ────────────────────────────────────────────────────────────
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${moduleTheme.accent}20` }}>
          <AlertCircle size={32} style={{ color: moduleTheme.accent }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black dark:text-white mb-2">Nessun progetto selezionato</h3>
          <p className="text-sm text-black/50 dark:text-white/40 max-w-xs">
            Vai al dashboard, seleziona un progetto e apri la checklist.
          </p>
        </div>
        <button onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-[11px] uppercase tracking-widest hover:opacity-90 transition-all"
          style={{ backgroundColor: moduleTheme.accent }}>
          <ArrowLeft size={14} />
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  // ─── Project exists but no phases (DB missing columns or insert failed) ────
  if (!project.phases || project.phases.length === 0) {
    const handleInit = async () => {
      setInitializing(true);
      try {
        // Find the DB id of this project
        const { data } = await import('../../../lib/supabase').then(m =>
          m.supabase.from('projects').select('id').eq('project_id', project.projectId).single()
        );
        if (data?.id) {
          await initializeProjectPhases(data.id, project.projectId);
          await fetchProjects();
          showToast('Checklist inizializzata!', 'success');
        }
      } catch (err) {
        console.error(err);
        showToast('Errore durante l\'inizializzazione', 'error');
      } finally {
        setInitializing(false);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${moduleTheme.accent}20` }}>
          <AlertCircle size={32} style={{ color: moduleTheme.accent }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black dark:text-white mb-2">
            Checklist não inicializada
          </h3>
          <p className="text-sm text-black/50 dark:text-white/40 max-w-sm">
            O projeto <strong className="text-black dark:text-white">{project.projectName}</strong> ainda não tem itens de checklist.
            Clique abaixo para inicializar com a lista completa.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-black/60 dark:text-white/60">
            <ArrowLeft size={14} />
            Voltar
          </button>
          <button onClick={handleInit} disabled={initializing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-bold text-[11px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-60"
            style={{ backgroundColor: moduleTheme.accent }}>
            {initializing
              ? <><RefreshCw size={14} className="animate-spin" /> Inicializando...</>
              : <><RefreshCw size={14} /> Inizializza Checklist</>}
          </button>
        </div>
      </div>
    );
  }

  // ─── Group phases by category ─────────────────────────────────────────────
  const phasesByCategory = project.phases.reduce((acc, phase) => {
    const cat = phase.category || 'Distribuzione Generale';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(phase);
    return acc;
  }, {} as Record<string, typeof project.phases>);

  const categoryOrder = [
    'Distribuzione Generale', 'Forza Motrice', 'Cablaggio Strutturato',
    'Illuminazione', 'Impianti Speciali', 'Cabina Media Tensione',
    'Centro Stella', 'Antincendio', 'Elaborati Grafici',
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight uppercase">
          {t.technicalChecklist}
        </h1>
        <p className="text-[13px] text-black/50 dark:text-white/40 font-medium mt-1">
          {project.projectName}
        </p>
      </div>

      <div className="space-y-12 max-w-4xl">
        {Object.entries(phasesByCategory)
          .sort(([a], [b]) => {
            const ia = categoryOrder.indexOf(a);
            const ib = categoryOrder.indexOf(b);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
          })
          .map(([category, phases]) => (
            <div key={category} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
                <h2 className="text-[10px] font-black tracking-[0.2em] text-black/30 dark:text-white/20 uppercase whitespace-nowrap bg-black/5 dark:bg-white/5 px-4 py-1 rounded-full">
                  {category}
                </h2>
                <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
              </div>

              {/* Phase Cards */}
              <div className="space-y-4">
                {phases.map((phase, index) => (
                  <PhaseCard
                    key={phase.id}
                    phase={phase}
                    index={index}
                    onToggleItem={(itemId) => toggleItem(phase.id, itemId)}
                    onUpdateNotes={(itemId, notes) => updateItemNotes(phase.id, itemId, notes)}
                    onReopen={() => {
                      reopenPhase(phase.id);
                      showToast(t.phaseReopenedSuccess, 'success');
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
