import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Wind, Thermometer, BookOpen } from 'lucide-react';
import { Translation } from '../../types';
import { VentilationResults } from '../../types/cabineMTVentilation';
import { formatPower } from '../../utils/cabineMTVentilation';

interface VentilationResultsPanelProps {
  t: Translation['cabineMT'];
  results: VentilationResults | null;
}

export function VentilationResultsPanel({ t, results }: VentilationResultsPanelProps) {
  if (!results) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-[#81292C]/10 flex items-center justify-center">
          <Wind size={28} className="text-[#81292C]/40" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-tighter dark:text-white mb-2">{t.noElements}</p>
          <p className="text-[10px] text-[#5a5a5a] dark:text-white/40 leading-relaxed">{t.addFirstElement}</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={results.totalHeatW}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {/* BTU hero card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="bg-[#141414] dark:bg-white/10 text-white p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 to-transparent" />
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[9px] font-black tracking-widest uppercase opacity-60">{t.btuRequired}</p>
              <CheckCircle2 size={14} className="text-orange-400 opacity-70 flex-shrink-0 mt-0.5" />
            </div>
            <p className="text-4xl font-black font-mono tracking-tighter">
              {Math.round(results.btuPerHour).toLocaleString()}
              <span className="text-sm ml-2 opacity-60">{t.unitBTU}</span>
            </p>
            <p className="text-[9px] opacity-40 mt-2 font-bold">
              {t.totalHeat}: {formatPower(results.totalHeatW)}
            </p>
          </div>
        </motion.div>

        {/* Airflow card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="bg-[#F5F5F5] dark:bg-white/5 border border-black/5 dark:border-white/10 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Wind size={14} className="text-[#81292C]" />
            <p className="text-[9px] font-black tracking-widest uppercase opacity-50">{t.airflowRequired}</p>
          </div>
          <p className="text-3xl font-black font-mono tracking-tighter dark:text-white">
            {Math.round(results.airflowM3h).toLocaleString()}
            <span className="text-xs ml-2 text-[#81292C] font-bold">{t.unitM3h}</span>
          </p>
          <p className="text-[8px] opacity-30 mt-1 font-bold">
            {t.deltaT}: {results.deltaTUsedC}°C
          </p>
        </motion.div>

        {/* Volume */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="bg-[#F5F5F5] dark:bg-white/5 border border-black/5 dark:border-white/10 p-4"
        >
          <p className="text-[9px] font-black tracking-widest uppercase opacity-50 mb-2">{t.cabineVolume}</p>
          <p className="text-xl font-black font-mono tracking-tighter dark:text-white">
            {results.cabineVolumeM3.toFixed(1)}
            <span className="text-[10px] ml-1 text-[#81292C] font-bold">{t.unitM3}</span>
          </p>
        </motion.div>

        {/* Thermal breakdown */}
        {results.breakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="border border-black/5 dark:border-white/10"
          >
            <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
              <Thermometer size={12} className="text-[#81292C]" />
              <p className="text-[9px] font-black tracking-widest uppercase opacity-50">{t.thermalBreakdown}</p>
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {results.breakdown.map((b) => (
                <div key={b.id} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold dark:text-white">{b.label}</p>
                    <p className="text-[8px] opacity-40 font-bold uppercase">{b.quantity > 1 ? `×${b.quantity}` : ''} {formatPower(b.heatPerUnitW)}/un</p>
                  </div>
                  <p className="text-[11px] font-black font-mono text-[#81292C]">{formatPower(b.totalHeatW)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Normative note */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#81292C]/8 dark:bg-[#81292C]/10 border border-[#81292C]/15">
          <BookOpen size={12} className="text-[#81292C] flex-shrink-0" />
          <p className="text-[8px] font-bold text-[#81292C]">ASHRAE Fundamentals · VDI 2078 · ΔT={results.deltaTUsedC}°C</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
