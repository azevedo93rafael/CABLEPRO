import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Printer } from 'lucide-react';
import { Translation, Language } from '../../types';
import {
  VentilationElement,
  CabineDimensions,
  VentilationResults,
} from '../../types/cabineMTVentilation';
import { formatPower } from '../../utils/cabineMTVentilation';
import { Logo } from '../Logo';
import { useApp } from '../../context/AppContext';

interface VentilationReportProps {
  elements: VentilationElement[];
  dimensions: CabineDimensions;
  results: VentilationResults;
  lang: Language;
  projectName: string;
  engineerName?: string;
  onClose: () => void;
}

export function VentilationReport({
  elements,
  dimensions,
  results,
  lang,
  projectName,
  engineerName,
  onClose,
}: VentilationReportProps) {
  const { moduleTheme } = useApp();
  const contentRef = useRef<HTMLDivElement>(null);

  const tTitles = {
    'pt-BR': {
      title: 'Memória de Cálculo: Ventilação / Extração de Ar',
      subtitle: 'Dimensionamento Térmico Paramétrico',
      methodology: 'Metodologia de Cálculo',
      details: 'Memória de Cálculo Detalhada',
    },
    it: {
      title: 'Relazione di Calcolo: Ventilazione / Estrazione Aria',
      subtitle: 'Dimensionamento Termico Parametrico',
      methodology: 'Metodologia di Calcolo',
      details: 'Relazione di Calcolo Dettagliata',
    },
    en: {
      title: 'Calculation Report: Ventilation / Air Extraction',
      subtitle: 'Parametric Thermal Sizing',
      methodology: 'Calculation Methodology',
      details: 'Detailed Calculation Steps',
    },
  }[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col h-[90vh] print:h-auto print:max-h-none print:shadow-none"
      >
        {/* Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden z-10">
          <button
            onClick={() => window.print()}
            className="p-2 bg-black/5 hover:bg-black/10 rounded-lg transition-colors text-black/60 hover:text-black"
            title="Imprimir / Salvar PDF"
          >
            <Printer size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-black/5 hover:bg-black/10 rounded-lg transition-colors text-black/60 hover:text-black"
          >
            <X size={18} />
          </button>
        </div>

        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto bg-white p-12 print:p-8 report-content text-black"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
            <div>
              <Logo className="w-16 h-16 text-[#141414] mb-4" />
              <h1 className="text-2xl font-black uppercase tracking-tight text-[#141414]">
                {tTitles.title}
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/50">
                {tTitles.subtitle}
              </p>
            </div>
            <div className="text-right text-[10px] font-mono leading-relaxed text-black/60">
              <p>PROJETO: <strong className="text-black">{projectName}</strong></p>
              <p>DATA: <strong className="text-black">{new Date().toLocaleDateString(lang)}</strong></p>
              <p>ENG: <strong className="text-black">{engineerName || 'User'}</strong></p>
              <p>SOFTWARE: <strong className="text-black">CABINE MT (RILO)</strong></p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-12">

            {/* Metodologia */}
            <section>
              <h2
                className="text-sm font-black uppercase tracking-widest border-b border-black/10 pb-2 mb-4"
                style={{ color: moduleTheme.accent }}
              >
                {tTitles.methodology}
              </h2>
              <div className="prose prose-sm prose-black max-w-none text-black/80">
                <p>
                  O dimensionamento do sistema de ventilação / climatização da cabine foi realizado utilizando 
                  uma abordagem paramétrica baseada nas prescrições térmicas normativas (ASHRAE, VDI 2078), avaliando 
                  as cargas térmicas individuais do ambiente.
                </p>
                <div className="bg-black/5 p-4 rounded-lg my-4 font-mono text-xs space-y-2">
                  <p><strong>P_total</strong> = P_envoltória + P_pessoas + P_transformadores + P_quadros</p>
                  <ul className="list-disc list-inside opacity-75">
                    <li>P_envoltória = 0.08 kW/m³ × Volume</li>
                    <li>P_pessoas = 0.30 kW (fixo, ocupação técnica pontual)</li>
                    <li>P_trafo = Σ (Perdas de datasheet ou 2,5% da potência nominal kVA)</li>
                    <li>P_quadros = N_colunas × 0.15 kW</li>
                  </ul>
                  <p className="pt-2"><strong>Portata de Extração (m³/h)</strong> = P_total[kW] × 200 (assumindo salto térmico ΔT = 15 K)</p>
                  <p><strong>Potência Frigorífica (BTU/h)</strong> = P_total[kW] × 3412.14</p>
                </div>
              </div>
            </section>

            {/* Parameters */}
            <section>
              <h2
                className="text-sm font-black uppercase tracking-widest border-b border-black/10 pb-2 mb-4"
                style={{ color: moduleTheme.accent }}
              >
                1. Parâmetros da Cabine
              </h2>
              <div className="grid grid-cols-2 gap-8 text-xs font-mono">
                <div>
                  <p className="opacity-50">Dimensões Internas:</p>
                  <ul className="list-none space-y-1 mt-2">
                    <li>Comprimento: <strong>{dimensions.lengthM.toFixed(2)} m</strong></li>
                    <li>Largura: <strong>{dimensions.widthM.toFixed(2)} m</strong></li>
                    <li>Altura: <strong>{dimensions.heightM.toFixed(2)} m</strong></li>
                  </ul>
                </div>
                <div>
                  <p className="opacity-50">Volume Estimado:</p>
                  <p className="text-xl font-bold mt-2">{results.cabineVolumeM3.toFixed(2)} m³</p>
                </div>
              </div>
            </section>

            {/* Calculations Breakdown */}
            <section>
               <h2
                className="text-sm font-black uppercase tracking-widest border-b border-black/10 pb-2 mb-4"
                style={{ color: moduleTheme.accent }}
              >
                2. {tTitles.details}
              </h2>

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-dashed border-black/20 pb-2">
                  <div>
                    <span className="font-bold font-mono text-sm">2.1 Carga Solar / Envoltória (P_env)</span>
                    <p className="text-[10px] opacity-60">Base = 0.08 kW/m³ × {results.cabineVolumeM3.toFixed(2)} m³</p>
                  </div>
                  <span className="font-mono">{formatPower(results.pEnvKW)}</span>
                </div>

                <div className="flex justify-between items-center border-b border-dashed border-black/20 pb-2">
                  <div>
                    <span className="font-bold font-mono text-sm">2.2 Carga de Ocupação (P_pessoas)</span>
                    <p className="text-[10px] opacity-60">Fixa (2 técnicos)</p>
                  </div>
                  <span className="font-mono">{formatPower(results.pPessoasKW)}</span>
                </div>

                <div className="flex justify-between items-start border-b border-dashed border-black/20 pb-2">
                  <div className="flex-1">
                    <span className="font-bold font-mono text-sm">2.3 Transformadores (P_trafo)</span>
                    <p className="text-[10px] opacity-60">Somatório de perdas térmicas</p>
                    
                    {results.trafoBreakdown.length > 0 && (
                      <table className="w-full mt-3 text-[10px] text-left">
                        <thead className="opacity-50 border-b border-black/10">
                          <tr>
                            <th className="font-mono font-normal pb-1">Tag</th>
                            <th className="font-mono font-normal pb-1">Qtd</th>
                            <th className="font-mono font-normal pb-1">Potência (kVA)</th>
                            <th className="font-mono font-normal pb-1">Perda Un. (kW)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.trafoBreakdown.map((tr) => (
                            <tr key={tr.id}>
                              <td className="py-1 font-bold">{tr.label}</td>
                              <td className="py-1">{tr.quantity}</td>
                              <td className="py-1">{tr.powerKVA}</td>
                              <td className="py-1">{tr.perdasKWPerUnit.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <span className="font-mono">{formatPower(results.pTrafoKW)}</span>
                </div>

                <div className="flex justify-between items-start border-b border-dashed border-black/20 pb-2">
                  <div className="flex-1">
                    <span className="font-bold font-mono text-sm">2.4 Quadros Elétricos MT/BT (P_quadros)</span>
                    <p className="text-[10px] opacity-60">Somatório da dissipação das colunas de quadros (0.15 kW/col). </p>

                    {results.quadrosBreakdown.length > 0 && (
                      <table className="w-full mt-3 text-[10px] text-left">
                        <thead className="opacity-50 border-b border-black/10">
                          <tr>
                            <th className="font-mono font-normal pb-1">Tag</th>
                            <th className="font-mono font-normal pb-1">Qtd</th>
                            <th className="font-mono font-normal pb-1">Colunas</th>
                            <th className="font-mono font-normal pb-1">Dissipação Un. (kW)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.quadrosBreakdown.map((q) => (
                            <tr key={q.id}>
                              <td className="py-1 font-bold">{q.label}</td>
                              <td className="py-1">{q.quantity}</td>
                              <td className="py-1">{q.numColumns}</td>
                              <td className="py-1">{(q.numColumns * 0.15).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <span className="font-mono">{formatPower(results.pQuadrosKW)}</span>
                </div>
              </div>
            </section>

            {/* Final Results */}
            <section className="bg-black/5 p-8 rounded-2xl border border-black/10">
              <h2 className="text-sm font-black uppercase tracking-widest mb-6 opacity-60">
                RESULTADOS FINAIS DE SINTESE
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">
                    Carga Térmica Total
                  </p>
                  <p className="text-3xl font-black font-mono">
                    {formatPower(results.totalHeatKW)}
                  </p>
                  <p className="text-xs font-mono mt-1 opacity-70">
                    = {results.btuPerHour.toFixed(0)} BTU/h
                  </p>
                  <p className="text-[10px] mt-2 text-black/60 italic leading-snug">
                    *Potência frigorífica mínima requerida caso se opte por ar-condicionado.
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">
                    Portata d'Aria (Exaustão)
                  </p>
                  <p
                     className="text-3xl font-black font-mono"
                     style={{ color: moduleTheme.accent }}
                  >
                    {results.airflowM3h.toFixed(0)} m³/h
                  </p>
                  <p className="text-xs font-mono mt-1 opacity-70">
                    Baseado em salto térmico ΔT = {results.deltaTUsedC} K
                  </p>
                  <p className="text-[10px] mt-2 text-black/60 italic leading-snug">
                    *Vazão efetiva mínima para o extrator de ar. Recomendado aplicar fator de segurança em função da perda de carga nas grelhas (VDI 2078).
                  </p>
                </div>
              </div>
            </section>

            <div className="pt-8 text-center opacity-30">
              <p className="text-[9px] font-bold uppercase tracking-widest">
                Gerado por Rilo Elettrico — Cabine MT Engine v1.0
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
