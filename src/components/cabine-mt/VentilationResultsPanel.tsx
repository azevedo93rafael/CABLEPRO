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
      label: 'CARGA TÉRMICA TOTAL',
      value: formatPower(results.totalHeatKW),
      sub: `${results.btuPerHour.toFixed(0)} BTU/h`,
      highlight: true,
    },
    {
      label: 'PORTATA D\'ARIA REQUERIDA (EXTRAÇÃO)',
      value: `${results.airflowM3h.toFixed(0)} m³/h`,
      sub: `ΔT = ${results.deltaTUsedC} K`,
      highlight: true,
    },
    {
      label: 'VOLUME ÚTIL',
      value: `${results.cabineVolumeM3.toFixed(1)} m³`,
      sub: '',
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Carga discriminada */}
      <div className="mb-6">
        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-3 dark:text-white">
          Discriminação de Cargas
        </p>
        <div className="space-y-2">
          {results.loadBreakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-black/5 dark:border-white/5">
              <span className="font-mono text-black/60 dark:text-white/60">{item.label}</span>
              <span className="font-bold dark:text-white">{formatPower(item.valueKW)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className={`p-4 border ${
              sec.highlight
                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/20'
                : 'bg-[#f5f5f5] dark:bg-white/5 border-black/5 dark:border-white/5'
            }`}
          >
            <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest mb-1 dark:text-white">
              {sec.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black tracking-tight ${
                  sec.highlight ? 'text-amber-700 dark:text-amber-500' : 'text-[#141414] dark:text-white'
                }`}
              >
                {sec.value}
              </span>
              {sec.sub && (
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider dark:text-white">
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
