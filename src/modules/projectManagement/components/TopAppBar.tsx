import React from 'react';
import { ChevronLeft, Share2, MoreVertical } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface TopAppBarProps {
  projectName: string;
  progress: number;
  onBack: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ projectName, progress, onBack }) => {
  const { moduleTheme } = useApp();

  return (
    <header className="h-24 bg-white dark:bg-[#0A0A0A] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-10 sticky top-0 z-40 transition-all duration-500">
      <div className="flex items-center gap-6">
        <button 
          onClick={onBack}
          className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all group"
        >
          <ChevronLeft size={24} className="text-slate-600 dark:text-white/60 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
            {projectName}
          </h2>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="w-32 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-1000" 
                style={{ width: `${progress}%`, backgroundColor: moduleTheme.accent }}
              />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: moduleTheme.accent }}>
              {progress}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-3.5 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all hover:scale-110 active:scale-95">
          <Share2 size={20} />
        </button>
        <button className="p-3.5 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all hover:scale-110 active:scale-95">
          <MoreVertical size={20} />
        </button>
      </div>
    </header>
  );
};
