import React from 'react';
import { LayoutDashboard, ClipboardList, Info } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { TRANSLATIONS } from '../../../constants';

interface BottomNavBarProps {
  activeTab: 'details' | 'checklist';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab }) => {
  const { moduleTheme, lang } = useApp();
  const t = TRANSLATIONS[lang].projectHub;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
      <nav className="bg-slate-900 dark:bg-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-12 border border-white/10 dark:border-slate-900/10">
        <button className={`flex flex-col items-center gap-1 transition-all group ${activeTab === 'details' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
          <Info size={24} className={activeTab === 'details' ? '' : 'text-white dark:text-slate-900'} style={activeTab === 'details' ? { color: moduleTheme.accent } : {}} />
          <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'details' ? '' : 'text-white dark:text-slate-900'}`} style={activeTab === 'details' ? { color: moduleTheme.accent } : {}}>
            {t.details}
          </span>
        </button>
        
        <div className="w-px h-8 bg-white/10 dark:bg-slate-900/10" />

        <button className={`flex flex-col items-center gap-1 transition-all group ${activeTab === 'checklist' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
          <ClipboardList size={24} className={activeTab === 'checklist' ? '' : 'text-white dark:text-slate-900'} style={activeTab === 'checklist' ? { color: moduleTheme.accent } : {}} />
          <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'checklist' ? '' : 'text-white dark:text-slate-900'}`} style={activeTab === 'checklist' ? { color: moduleTheme.accent } : {}}>
            {t.checklist}
          </span>
        </button>
      </nav>
    </div>
  );
};
