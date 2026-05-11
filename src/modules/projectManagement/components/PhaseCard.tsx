import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, RefreshCw } from 'lucide-react';
import { Phase } from '../types';
import { ItemCheckbox } from './ItemCheckbox';
import { useApp } from '../../../context/AppContext';
import { TRANSLATIONS } from '../../../constants';

interface PhaseCardProps {
  phase: Phase;
  onToggleItem: (itemId: string) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onReopen: () => void;
  index: number;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({ phase, onToggleItem, onUpdateNotes, onReopen, index }) => {
  const { moduleTheme, darkMode, lang } = useApp();
  const t = TRANSLATIONS[lang].projectHub;
  
  const isCompleted = phase.status === 'completed';
  const isActive = phase.status === 'active';

  const allChecked = phase.items.every(item => item.checked);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-xl p-8 transition-all duration-300 border ${isActive ? 'shadow-lg border-black/10 dark:border-white/10' : 'border-black/5 dark:border-white/5'} bg-white dark:bg-[#141414] shadow-sm hover:shadow-md`}
      style={isActive ? { 
        borderColor: `${moduleTheme.accent}30`, 
      } : {}}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 relative"
            style={
              isCompleted ? { backgroundColor: `${moduleTheme.accent}15`, color: moduleTheme.accent } :
              { backgroundColor: 'rgba(0,0,0,0.05)', color: moduleTheme.accent }
            }
          >
            {isCompleted ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <Circle size={14} className="fill-current opacity-20" />}
          </div>
          <div>
            <h3 className="font-bold text-base text-black dark:text-white uppercase tracking-tight">
              {phase.title}
            </h3>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-black/40 dark:text-white/20 mt-0.5">
              {isCompleted ? t.completed : t.activePhase}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] font-bold tracking-widest text-black/20 dark:text-white/10 uppercase">
            {phase.items.filter(i => i.checked).length} / {phase.items.length}
          </span>
          <div className="w-20 h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(phase.items.filter(i => i.checked).length / phase.items.length) * 100}%` }}
              className="h-full"
              style={{ backgroundColor: moduleTheme.accent }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pl-18">
        {phase.items.map((item) => (
          <ItemCheckbox 
            key={item.id} 
            item={item} 
            onToggle={onToggleItem} 
            onUpdateNotes={onUpdateNotes}
          />
        ))}

        <AnimatePresence>
          {isCompleted && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onReopen}
              className="mt-8 text-[9px] font-bold tracking-[0.1em] text-black/40 dark:text-white/30 uppercase transition-all flex items-center gap-2 hover:text-black dark:hover:text-white group/reopen"
            >
              <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
              <span>{t.reopenPhase}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
