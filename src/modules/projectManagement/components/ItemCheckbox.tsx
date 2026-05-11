import React, { useState } from 'react';
import { Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../../context/AppContext';
import { ChecklistItem } from '../types';

interface ItemCheckboxProps {
  item: ChecklistItem;
  onToggle: (itemId: string) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
}

export const ItemCheckbox: React.FC<ItemCheckboxProps> = ({ item, onToggle, onUpdateNotes }) => {
  const { moduleTheme } = useApp();
  const [isHovering, setIsHovering] = useState(false);
  const [localNotes, setLocalNotes] = useState(item.notes || '');

  const handleNotesBlur = () => {
    if (localNotes !== item.notes) {
      onUpdateNotes(item.id, localNotes);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 group/item relative">
      <button 
        onClick={() => onToggle(item.id)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="flex-1 flex items-center gap-4 p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.03] transition-all text-left relative"
      >
        <div 
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 group-hover/item:scale-105 active:scale-90 shrink-0
            ${item.checked ? 'bg-current border-transparent' : 'bg-transparent border-black/10 dark:border-white/10 group-hover/item:border-black/30 dark:group-hover/item:border-white/30'}
          `}
          style={item.checked ? { color: moduleTheme.accent, backgroundColor: `${moduleTheme.accent}20`, borderColor: moduleTheme.accent } : {}}
        >
          {item.checked && <Check size={14} strokeWidth={4} style={{ color: moduleTheme.accent }} />}
        </div>
        
        <div className="flex flex-col">
          <span className={`text-sm font-semibold transition-all duration-300 ${item.checked ? 'text-slate-400 dark:text-white/20 line-through' : 'text-slate-700 dark:text-white/70 group-hover/item:text-slate-900 dark:group-hover/item:text-white'}`}>
            {item.text}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isHovering && item.tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-[100] bottom-full left-10 mb-2 p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-w-[320px] pointer-events-none border border-white/10 dark:border-black/5"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 dark:bg-black/5 shrink-0">
                <Info size={14} style={{ color: moduleTheme.accent }} />
              </div>
              <p className="text-[11px] font-semibold leading-relaxed">
                {item.tooltip}
              </p>
            </div>
            <div 
              className="absolute bottom-[-6px] left-6 w-3 h-3 bg-slate-900 dark:bg-white rotate-45 border-b border-r border-white/10 dark:border-black/5" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 md:max-w-[40%]">
        <input
          type="text"
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Aggiungi note..."
          className="w-full bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-lg px-4 py-2 text-[11px] font-medium text-black/60 dark:text-white/40 placeholder:text-black/20 dark:placeholder:text-white/10 focus:outline-none focus:border-black/20 dark:focus:border-white/20 transition-all"
        />
      </div>
    </div>
  );
};
