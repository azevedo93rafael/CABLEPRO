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
      className="bg-[#F5F5F5] dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 group transition-all"
      style={{ '--hover-border-color': moduleTheme.accent } as React.CSSProperties}
    >
      <p className="text-[9px] font-black tracking-widest uppercase opacity-50 mb-3">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[8px] font-bold opacity-30 tracking-widest uppercase mb-1">{labelRaw}</p>
          <p className="text-base font-black text-[#5a5a5a] dark:text-white/60 font-mono">
            {rawValue.toFixed(4)}
            <span className="text-[10px] font-bold ml-1 opacity-50">{unit}</span>
          </p>
        </div>
        <div>
          <p className="text-[8px] font-bold opacity-30 tracking-widest uppercase mb-1">{labelNorm}</p>
          <p className="text-2xl font-black text-[#141414] dark:text-white font-mono tracking-tighter">
            {normValue}
            <span className="text-[10px] font-bold ml-1" style={{ color: moduleTheme.accent }}>{unit}</span>
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
        className="space-y-5"
      >
        {/* Icc Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="bg-[#141414] dark:bg-white/10 text-white p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br to-transparent" style={{ '--tw-gradient-from': `${moduleTheme.accent}4D` } as React.CSSProperties} />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[9px] font-black tracking-widest uppercase opacity-60">
                {t.shortCircuitCurrent}
              </p>
              <CheckCircle2 size={14} className="opacity-70 flex-shrink-0 mt-0.5" style={{ color: moduleTheme.accent }} />
            </div>
            <p className="text-4xl font-black font-mono tracking-tighter">
              {results.shortCircuitCurrentA.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              <span className="text-sm ml-2 opacity-60">{t.unitA}</span>
            </p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <p className="text-[9px] opacity-40 font-bold">
                {t.totalPower}: {results.totalPowerKVA.toLocaleString()} {t.unitKVA}
              </p>
              <p className="text-[9px] opacity-40 font-bold">
                {t.kFactor}: {results.kFactor}
              </p>
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

        {/* Normative Reference Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-2 px-3 py-2 border"
          style={{ backgroundColor: `${moduleTheme.accent}14`, borderColor: `${moduleTheme.accent}26` }}
        >
          <BookOpen size={12} className="flex-shrink-0" style={{ color: moduleTheme.accent }} />
          <div>
            <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">
              {t.normativeReference}
            </p>
            <p className="text-[9px] font-bold" style={{ color: moduleTheme.accent }}>{results.normativeReference}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
