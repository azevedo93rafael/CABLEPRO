import React from 'react';
import { motion } from 'motion/react';
import { Calculator, FileText, ChevronRight, Zap } from 'lucide-react';
import { Translation } from '../types';

interface ModuleSelectorProps {
  onSelect: (module: 'cablefill' | 'capitolato' | 'cabine-mt') => void;
  t: Translation;
  allowedModules?: string[];
}

const MODULE_CONFIG = [
  {
    id: 'cablefill' as const,
    icon: Calculator,
    titleKey: 'CableFill Pro',
    descKey: 'cableFillDesc' as const,
  },
  {
    id: 'capitolato' as const,
    icon: FileText,
    titleKey: 'Capitolato Pro',
    descKey: 'capitolatoDesc' as const,
  },
  {
    id: 'cabine-mt' as const,
    icon: Zap,
    titleKey: 'Cabine MT',
    descKey: 'cabineMTDesc' as const,
  },
];

export function ModuleSelector({ onSelect, t, allowedModules = ['cablefill', 'capitolato'] }: ModuleSelectorProps) {
  const visible = MODULE_CONFIG.filter((m) => allowedModules.includes(m.id));

  const getDesc = (mod: typeof MODULE_CONFIG[0]) => {
    if (mod.id === 'cablefill') return t.selector.cableFillDesc;
    if (mod.id === 'capitolato') return t.selector.capitolatoDesc;
    return t.cabineMT.moduleDesc;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#141414] dark:text-white mb-4 tracking-tight">
            {t.selector.chooseModule}
          </h1>
          <p className="text-[#141414]/60 dark:text-white/60 text-lg">
            Rilo Elettrico
          </p>
        </motion.div>

        <div
          className={`grid gap-8 ${
            visible.length === 1
              ? 'max-w-md mx-auto'
              : visible.length === 2
              ? 'md:grid-cols-2 max-w-3xl mx-auto'
              : 'md:grid-cols-3'
          }`}
        >
          {visible.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.button
                key={mod.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ scale: 1.02, translateY: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(mod.id)}
                className="group relative bg-white dark:bg-[#141414] p-8 rounded-3xl shadow-xl shadow-black/5 border border-black/5 dark:border-white/5 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon size={120} />
                </div>
                
                <div className="w-14 h-14 bg-[#401318] rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-[#401318]/20">
                  <Icon size={28} />
                </div>
                
                <h2 className="text-2xl font-bold text-[#141414] dark:text-white mb-3">
                  {mod.titleKey}
                </h2>
                <p className="text-[#141414]/60 dark:text-white/60 mb-8 leading-relaxed text-sm">
                  {getDesc(mod)}
                </p>
                
                <div className="flex items-center gap-2 text-[#401318] font-bold group-hover:gap-4 transition-all">
                  <span>{t.selector.enter}</span>
                  <ChevronRight size={20} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
