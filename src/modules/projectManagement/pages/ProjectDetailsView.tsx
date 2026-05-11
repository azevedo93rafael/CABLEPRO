import React from 'react';
import { motion } from 'motion/react';
import { 
  ClipboardCheck, 
  Calendar, 
  User, 
  FileText, 
  ArrowRight,
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useApp } from '../../../context/AppContext';
import { TRANSLATIONS } from '../../../constants';

interface ProjectDetailsViewProps {
  onBack: () => void;
  onGoToChecklist: () => void;
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ onBack, onGoToChecklist }) => {
  const { moduleTheme, lang, darkMode } = useApp();
  const { projects, activeProjectId } = useProjectStore();
  const t = TRANSLATIONS[lang].projectHub;
  
  const project = projects.find(p => p.projectId === activeProjectId);

  if (!project) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info Card */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#141414] rounded-xl border border-black/5 dark:border-white/10 shadow-sm p-8 relative overflow-hidden"
          >
            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: moduleTheme.accent }}
              >
                <ClipboardCheck size={32} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight leading-tight">
                  {project.projectName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: moduleTheme.accent }} />
                  <p className="font-bold text-[10px] uppercase tracking-widest" style={{ color: moduleTheme.accent }}>
                    {project.progress === 100 ? t.completed : t.inProgress}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-black/40 dark:text-white/20 text-[9px] font-bold tracking-widest uppercase">
                  <User size={12} />
                  {t.clientLabel}
                </div>
                <p className="text-base font-bold text-black/80 dark:text-white/80 uppercase">{project.clientName}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-black/40 dark:text-white/20 text-[9px] font-bold tracking-widest uppercase">
                  <Calendar size={12} />
                  {t.startDateLabel}
                </div>
                <p className="text-base font-bold text-black/80 dark:text-white/80">{project.startDate}</p>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-black/40 dark:text-white/20 text-[9px] font-bold tracking-widest uppercase">
                <FileText size={12} />
                {t.descriptionLabel}
              </div>
              <p className="text-[13px] text-black/60 dark:text-white/40 leading-relaxed bg-black/5 dark:bg-white/[0.02] p-6 rounded-xl border border-black/5 dark:border-white/5 font-medium">
                {project.description || t.noDescriptionProvided}
              </p>
            </div>
          </motion.div>

          {/* Per-category progress breakdown */}
          {(() => {
            const categoryOrder = [
              'Distribuzione Generale', 'Forza Motrice', 'Cablaggio Strutturato',
              'Illuminazione', 'Impianti Speciali', 'Cabina Media Tensione',
              'Centro Stella', 'Antincendio', 'Elaborati Grafici',
            ];

            const byCategory = project.phases.reduce((acc, ph) => {
              const cat = ph.category || 'Distribuzione Generale';
              if (!acc[cat]) acc[cat] = { total: 0, checked: 0 };
              ph.items.forEach(it => {
                acc[cat].total++;
                if (it.checked) acc[cat].checked++;
              });
              return acc;
            }, {} as Record<string, { total: number; checked: number }>);

            const entries = Object.entries(byCategory)
              .sort(([a], [b]) => {
                const ia = categoryOrder.indexOf(a), ib = categoryOrder.indexOf(b);
                return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
              });

            if (entries.length === 0) return null;

            return (
              <div className="bg-white dark:bg-[#141414] rounded-xl border border-black/5 dark:border-white/10 shadow-sm p-6 space-y-5">
                <p className="text-[9px] font-bold tracking-widest uppercase text-black/40 dark:text-white/20">
                  {t.progressLabel} por Tipo de Impianto
                </p>
                {entries.map(([cat, { total, checked }]) => {
                  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-black/60 dark:text-white/50 uppercase tracking-wider">
                          {cat}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: pct === 100 ? '#10B981' : moduleTheme.accent }}>
                          {checked}/{total}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct === 100 ? '#10B981' : moduleTheme.accent,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>{/* end lg:col-span-2 */}

        {/* Right Column: Action Card */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#141414] rounded-xl p-8 border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: moduleTheme.accent }} />
            
            <h3 className="text-xs font-bold mb-6 uppercase tracking-widest dark:text-white">{t.projectExecution}</h3>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="opacity-40 dark:text-white/40">{t.generalStatus}</span>
                <span style={{ color: moduleTheme.accent }}>{t.active}</span>
              </div>
              <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  className="h-full transition-all duration-1000" 
                  style={{ backgroundColor: moduleTheme.accent }}
                />
              </div>
              <p className="text-[11px] opacity-60 dark:text-white/40 leading-relaxed font-medium italic">
                "{t.checklistHint}"
              </p>
            </div>

            <button 
              onClick={onGoToChecklist}
              className="w-full text-white py-4 rounded-xl font-bold text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-md group active:scale-95"
              style={{ 
                backgroundColor: moduleTheme.accent,
                boxShadow: `0 10px 20px ${moduleTheme.accent}30`
              }}
            >
              {t.goToChecklist}
              <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="bg-white dark:bg-[#141414] rounded-xl border border-black/5 dark:border-white/10 p-8 shadow-sm">
            <h3 className="text-[9px] font-bold tracking-widest uppercase text-black/40 dark:text-white/20 mb-6">{t.phasesSummary}</h3>
            <div className="space-y-4">
              {project.phases.slice(0, 5).map((phase, idx) => (
                <div key={phase.id} className="flex items-center gap-3 group">
                  <div 
                    className={`w-2 h-2 rounded-full transition-all group-hover:scale-125 ${phase.status === 'completed' ? '' : phase.status === 'active' ? 'animate-pulse' : 'bg-black/10 dark:bg-white/10'}`} 
                    style={phase.status === 'completed' || phase.status === 'active' ? { backgroundColor: moduleTheme.accent } : {}}
                  />
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${phase.status === 'locked' ? 'text-black/20 dark:text-white/5' : 'text-black/60 dark:text-white/40 group-hover:text-black dark:group-hover:text-white'}`}>{phase.title}</span>
                </div>
              ))}
              {project.phases.length > 5 && (
                <div className="pt-3 border-t border-black/5 dark:border-white/5">
                  <p className="text-[8px] font-bold text-black/40 dark:text-white/20 uppercase tracking-widest">+{project.phases.length - 5} {t.otherPhases}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
