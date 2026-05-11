import React from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, ClipboardCheck, Trash2 } from 'lucide-react';
import { Project } from '../types';
import { useApp } from '../../../context/AppContext';
import { TRANSLATIONS } from '../../../constants';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onViewDetails, onDelete }) => {
  const { moduleTheme, lang, darkMode } = useApp();
  const t = TRANSLATIONS[lang].projectHub;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="bg-white dark:bg-[#141414] rounded-xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md"
    >
      <div className="p-8 flex-1 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" style={{ color: moduleTheme.accent }} />

        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(t.deleteConfirm)) {
                  onDelete?.(project.projectId);
                }
              }}
              className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-xl"
              title={t.deleteProject}
            >
              <Trash2 size={18} />
            </button>
            <div 
              className="p-3.5 rounded-xl transition-all shadow-md group-hover:scale-110"
              style={{ backgroundColor: `${moduleTheme.accent}15`, color: moduleTheme.accent }}
            >
              <ClipboardCheck size={22} strokeWidth={2} />
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold tracking-widest text-black/40 dark:text-white/40 uppercase mb-1">
              {t.progressLabel}
            </span>
            <span className="text-2xl font-bold tracking-tight" style={{ color: moduleTheme.accent }}>
              {project.progress}%
            </span>
          </div>
        </div>

        <h3 
          className="text-lg font-bold text-black dark:text-white mb-2 tracking-tight transition-colors"
        >
          {project.projectName}
        </h3>
        
        <p className="text-[12px] text-black/60 dark:text-white/40 line-clamp-2 mb-6 leading-relaxed">
          {project.description || t.noDescription}
        </p>

        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3 text-[11px] font-bold tracking-wide">
            <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/20">
              <User size={14} />
            </div>
            <span className="text-slate-600 dark:text-white/60 uppercase">{project.clientName}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold tracking-wide">
            <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/20">
              <Calendar size={14} />
            </div>
            <span className="text-slate-600 dark:text-white/60 uppercase">{project.startDate}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Area */}
      <div className="px-8 pb-1">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full relative rounded-full"
            style={{ backgroundColor: moduleTheme.accent }}
          >
             <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
        </div>
      </div>

      <button
        onClick={() => onViewDetails(project.projectId)}
        className="w-full py-4 px-6 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-black/60 dark:text-white/60 text-[10px] font-bold tracking-widest uppercase flex items-center justify-between mt-auto border-t border-black/5 dark:border-white/5"
      >
        <span>{t.viewDetails}</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};
