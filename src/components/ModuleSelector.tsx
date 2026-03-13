import React from 'react';
import { motion } from 'motion/react';
import { Calculator, FileText, ChevronRight } from 'lucide-react';
import { Translation } from '../types';

interface ModuleSelectorProps {
  onSelect: (module: 'cablefill' | 'capitolato') => void;
  t: Translation;
  allowedModules?: string[];
}

export function ModuleSelector({ onSelect, t, allowedModules = ['cablefill', 'capitolato'] }: ModuleSelectorProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
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

        <div className={`grid gap-8 ${allowedModules.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2'}`}>
          {/* CableFill Module */}
          {allowedModules.includes('cablefill') && (
            <motion.button
              whileHover={{ scale: 1.02, translateY: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect('cablefill')}
              className="group relative bg-white dark:bg-[#141414] p-8 rounded-3xl shadow-xl shadow-black/5 border border-black/5 dark:border-white/5 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Calculator size={120} />
              </div>
              
              <div className="w-14 h-14 bg-[#401318] rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-[#401318]/20">
                <Calculator size={28} />
              </div>
              
              <h2 className="text-2xl font-bold text-[#141414] dark:text-white mb-3">
                CableFill Pro
              </h2>
              <p className="text-[#141414]/60 dark:text-white/60 mb-8 leading-relaxed">
                {t.selector.cableFillDesc}
              </p>
              
              <div className="flex items-center gap-2 text-[#401318] font-bold group-hover:gap-4 transition-all">
                <span>{t.selector.enter}</span>
                <ChevronRight size={20} />
              </div>
            </motion.button>
          )}

          {/* Capitolato Module */}
          {allowedModules.includes('capitolato') && (
            <motion.button
              whileHover={{ scale: 1.02, translateY: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect('capitolato')}
              className="group relative bg-white dark:bg-[#141414] p-8 rounded-3xl shadow-xl shadow-black/5 border border-black/5 dark:border-white/5 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText size={120} />
              </div>
              
              <div className="w-14 h-14 bg-[#401318] rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-[#401318]/20">
                <FileText size={28} />
              </div>
              
              <h2 className="text-2xl font-bold text-[#141414] dark:text-white mb-3">
                Capitolato Pro
              </h2>
              <p className="text-[#141414]/60 dark:text-white/60 mb-8 leading-relaxed">
                {t.selector.capitolatoDesc}
              </p>
              
              <div className="flex items-center gap-2 text-[#401318] font-bold group-hover:gap-4 transition-all">
                <span>{t.selector.enter}</span>
                <ChevronRight size={20} />
              </div>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
