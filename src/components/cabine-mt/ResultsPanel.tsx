import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { Translation } from '../../types';
import { CabineMTResults } from '../../types/cabineMT';
import { useApp } from '../../context/AppContext';

interface ResultsPanelProps {
  t: Translation['cabineMT'];
  results: CabineMTResults | null;
  isCalculating?: boolean;
}

interface ResultCardProps {
  title: string;
  rawValue: number;
  normValue: number;
  unit: string;
  labelRaw: string;
  labelNorm: string;
  index: number;
}

function ResultCard({ title, rawValue, normValue, unit, labelRaw, labelNorm, index }: ResultCardProps) {
  const { moduleTheme } = useApp();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="relative bg-gradient-to-br from-blue-500/[0.03] to-cyan-500/[0.03] dark:from-blue-500/[0.08] dark:to-cyan-500/[0.08] border border-blue-500/10 dark:border-blue-500/20 p-5 rounded-2xl group transition-all hover:shadow-xl hover:shadow-blue-500/5"
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: moduleTheme.accent }} />
      </div>
      <p className="text-[10px] font-black tracking-widest uppercase text-blue-600/50 dark:text-blue-400/40 mb-4">{title}</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-[8px] font-bold opacity-30 tracking-widest uppercase mb-1.5 dark:text-white/30">{labelRaw}</p>
          <p className="text-lg font-black text-[#6a6a6a] dark:text-white/50 font-mono flex items-baseline gap-1">
            {rawValue.toFixed(3)}
            <span className="text-[10px] font-bold opacity-40">{unit}</span>
          </p>
        </div>
        <div className="relative">
          <p className="text-[8px] font-bold opacity-30 tracking-widest uppercase mb-1.5 dark:text-white/30">{labelNorm}</p>
          <p className="text-3xl font-black text-[#141414] dark:text-white font-mono tracking-tighter flex items-baseline gap-1.5">
            {normValue}
            <span className="text-[11px] font-bold" style={{ color: moduleTheme.accent }}>{unit}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function ResultsPanel({ t, results, isCalculating }: ResultsPanelProps) {
  const { moduleTheme } = useApp();

  if (isCalculating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#141414]/40 dark:text-white/40">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: moduleTheme.accent, borderTopColor: 'transparent' }} />
        <p className="text-[10px] font-bold uppercase tracking-widest">{t.calculating}</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${moduleTheme.accent}1A` }}>
          <AlertCircle size={28} style={{ color: moduleTheme.accent, opacity: 0.4 }} />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-tighter dark:text-white mb-2">
            {t.noResults}
          </p>
          <p className="text-[10px] text-[#5a5a5a] dark:text-white/40 leading-relaxed">
            {t.fillInputs}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={JSON.stringify(results)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-1 -mx-1"
      >
        <div className="space-y-6 pb-32">
          {/* Icc Result - Fully Integrated Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
          >
            {/* Background Layer (Glassy in dark, invisible in light) */}
            <div className="absolute inset-0 bg-slate-500/5 dark:bg-white/5 rounded-3xl -m-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-6 border-b-2 border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-1.5 h-6 rounded-full" 
                    style={{ background: `linear-gradient(to bottom, ${moduleTheme.primary}, ${moduleTheme.accent})` }} 
                  />
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-0.5 opacity-40 dark:text-white">
                      {t.results}
                    </p>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white/90 uppercase tracking-tight">
                      {t.shortCircuitCurrent}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                   <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: moduleTheme.accent }} />
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-40 dark:text-white/40">Real-time</span>
                </div>
              </div>

              <div className="flex items-baseline gap-4">
                <p className="text-6xl font-black font-mono tracking-tighter text-slate-900 dark:text-white tabular-nums">
                  {results.shortCircuitCurrentA.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
                <span className="text-2xl font-bold text-slate-300 dark:text-white/20 select-none">{t.unitA}</span>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-10">
                <div className="relative group/sub">
                  <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest mb-1.5">{t.totalPower}</p>
                  <p className="text-sm font-mono font-bold text-slate-700 dark:text-white/80">
                    {results.totalPowerKVA.toLocaleString()} <span className="text-[11px] opacity-40">{t.unitKVA}</span>
                  </p>
                </div>
                <div className="relative group/sub">
                  <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest mb-1.5">{t.kFactor}</p>
                  <p className="text-sm font-mono font-bold text-slate-700 dark:text-white/80">
                    {results.kFactor}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        {/* Result Cards */}
        <div className="space-y-3">
          <ResultCard
            title={t.earthingCable}
            rawValue={results.earthingCableSectionRawMM2}
            normValue={results.earthingCableSectionNormMM2}
            unit={t.unitMM2}
            labelRaw={t.calculatedSection}
            labelNorm={t.normalizedSection}
            index={0}
          />
          <ResultCard
            title={t.collectorBusbar}
            rawValue={results.collectorSectionRawMM2}
            normValue={results.collectorSectionNormMM2}
            unit={t.unitMM2}
            labelRaw={t.calculatedSection}
            labelNorm={t.normalizedSection}
            index={1}
          />
          <ResultCard
            title={t.equipotentialBandella}
            rawValue={results.bandellaSectionRawMM2}
            normValue={results.bandellaSectionNormMM2}
            unit={t.unitMM2}
            labelRaw={t.calculatedSection}
            labelNorm={t.normalizedSection}
            index={2}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl border bg-slate-50 dark:bg-white/[0.03] transition-all hover:bg-white hover:dark:bg-white/[0.05]"
          style={{ borderColor: `${moduleTheme.accent}26` }}
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-indigo-500/10 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
          >
            <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-0.5 dark:text-white/40">
              {t.normativeReference}
            </p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{results.normativeReference}</p>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
