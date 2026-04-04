import React from 'react';
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
      <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-12">
        <div className="w-16 h-16 border-2 border-dashed border-current rounded-full flex items-center justify-center mb-4">
          <span className="text-xl font-bold">?</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-center">
          {t.fillInputs}
        </p>
      </div>
    );
  }

  const sections = [
    {
      label: t.totalThermalLoad,
      value: formatPower(results.totalHeatKW),
      sub: `${results.btuPerHour.toFixed(0)} BTU/h`,
      highlight: true,
    },
    {
      label: t.airflowRequired,
      value: `${results.airflowM3h.toFixed(0)} m³/h`,
      sub: `ΔT = ${results.deltaTUsedC} K`,
      highlight: true,
    },
    {
      label: t.usefulVolume,
      value: `${results.cabineVolumeM3.toFixed(1)} m³`,
      sub: '',
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Carga discriminada */}
      <div className="mb-8">
        <p className="text-[10px] font-black tracking-widest uppercase mb-4 text-slate-400 dark:text-slate-500">
          {t.loadBreakdownTitle}
        </p>
        <div className="bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/50 dark:border-white/5 overflow-hidden">
          {results.loadBreakdown.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between text-xs px-5 py-3 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.02] ${
                idx !== results.loadBreakdown.length - 1 ? 'border-b border-slate-200/50 dark:border-white/5' : ''
              }`}
            >
              <span className="font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[9px]">
                {(t as any)[item.label] || item.label}
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-white/5 px-2 py-0.5 rounded shadow-sm">
                {formatPower(item.valueKW)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className={`relative p-6 rounded-2xl border transition-all hover:shadow-xl ${
              sec.highlight
                ? 'bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.03] dark:from-amber-500/[0.1] dark:to-orange-500/[0.1] border-amber-500/20 dark:border-amber-500/30 hover:shadow-amber-500/5'
                : 'bg-gradient-to-br from-blue-500/[0.03] to-indigo-500/[0.03] dark:from-blue-500/[0.08] dark:to-indigo-500/[0.08] border-blue-500/10 dark:border-blue-500/20 hover:shadow-blue-500/5'
            }`}
          >
            <div className="absolute top-0 right-0 p-3 opacity-20">
              {sec.highlight ? (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </div>
            
            <p className="text-[10px] font-black tracking-widest uppercase mb-4 text-slate-400 dark:text-slate-500">
              {sec.label}
            </p>
            
            <div className="flex items-baseline gap-3">
              <span
                className={`text-3xl font-black tracking-tighter font-mono ${
                  sec.highlight ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                }`}
              >
                {sec.value}
              </span>
              {sec.sub && (
                <span className="text-[11px] font-bold opacity-30 uppercase tracking-widest dark:text-white/40">
                  {sec.sub}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
