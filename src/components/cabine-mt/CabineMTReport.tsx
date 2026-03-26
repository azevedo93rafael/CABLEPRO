import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, CheckCircle2, BookOpen, Zap, AlertCircle } from 'lucide-react';
import { CabineMTInputs, CabineMTResults } from '../../types/cabineMT';
import { Translation } from '../../types';
import { useApp } from '../../context/AppContext';

interface CabineMTReportProps {
  inputs: CabineMTInputs;
  results: CabineMTResults;
  t: Translation['cabineMT'];
  projectName: string;
  engineerName?: string;
  onClose: () => void;
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 2) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmt4(n: number) { return fmt(n, 4); }
function fmtSec(n: number) {
  const sections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400];
  return sections.includes(n) ? `**${n} mm²**` : `${n} mm²`;
}

const today = new Date().toLocaleDateString('it-IT', {
  day: '2-digit', month: 'long', year: 'numeric',
});

// ─── Report ───────────────────────────────────────────────────────────────────
export function CabineMTReport({ inputs, results, t, projectName, engineerName, onClose }: CabineMTReportProps) {
  const { moduleTheme } = useApp();
  const iccSingle = (inputs.powerKVA * 1000) / (Math.sqrt(3) * inputs.secondaryVoltageV * (inputs.shortCircuitVoltagePct / 100));
  const iccTotal  = results.shortCircuitCurrentA;
  const sqrtT     = Math.sqrt(inputs.faultTimeS);
  const k         = results.kFactor;
  const material  = inputs.conductorMaterial === 'copper' ? 'Rame (Cu)' : 'Alluminio (Al)';
  const insul     = 'XLPE / EPR';
  const iccSinglePerTransformer = inputs.numTransformers > 1
    ? ` (un singolo trasformatore: ${fmt(iccSingle, 2)} A)`
    : '';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ "--theme-primary": moduleTheme.primary, "--theme-accent": moduleTheme.accent, "--theme-dark": moduleTheme.dark } as React.CSSProperties}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="relative bg-white dark:bg-[#111] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal toolbar */}
          <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 print:hidden flex-shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[color:var(--theme-accent)]" />
              <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">
                Relazione di Calcolo — Cabina MT
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-[color:var(--theme-accent)] text-white px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[color:var(--theme-dark)] transition-colors"
              >
                <Printer size={13} />
                Stampa / PDF
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded">
                <X size={16} className="opacity-40" />
              </button>
            </div>
          </div>

          {/* Scrollable report body */}
          <div
            id="cmt-report-body"
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            <div className="py-12 px-16 text-[#1a1a1a] dark:text-white" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

              {/* ══ COPERTINA ═══════════════════════════════════════════════════ */}
              <div className="border-b-4 border-[color:var(--theme-accent)] pb-8 mb-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[color:var(--theme-primary)] flex items-center justify-center">
                        <Zap size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[9px] font-sans font-bold tracking-widest uppercase text-[color:var(--theme-accent)]">
                          CablePro — Modulo Cabina MT
                        </p>
                        <p className="text-[9px] font-sans opacity-40 tracking-widest">
                          Software di calcolo ingegneristico
                        </p>
                      </div>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                      Relazione di Calcolo
                    </h1>
                    <h2 className="text-xl font-normal opacity-70 mb-1">
                      Dimensionamento dei conduttori di terra
                    </h2>
                    <h3 className="text-base font-normal opacity-50">
                      Cabina di Media Tensione (MT)
                    </h3>
                  </div>
                  <div className="text-right text-[11px] font-sans opacity-60 space-y-1">
                    <p><span className="font-bold">Progetto:</span> {projectName}</p>
                    <p><span className="font-bold">Data:</span> {today}</p>
                    {engineerName && <p><span className="font-bold">Redatto da:</span> {engineerName}</p>}
                    <p><span className="font-bold">Versione calcolo:</span> 1.0</p>
                  </div>
                </div>
              </div>

              {/* ══ 1. OGGETTO E SCOPO ═══════════════════════════════════════════ */}
              <Section title="1. Oggetto e Scopo" number="§1">
                <p className="mb-3">
                  La presente relazione ha lo scopo di dimensionare i conduttori di protezione (PE)
                  del sistema di messa a terra della cabina di Media Tensione (MT), in conformità
                  alle normative tecniche vigenti.
                </p>
                <p>
                  I calcoli comprendono il dimensionamento di:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Cavo di messa a terra del neutro del trasformatore</li>
                  <li>Collettore (busbar) di terra della cabina</li>
                  <li>Bandella di equipotenzializzazione</li>
                </ul>
              </Section>

              {/* ══ 2. RIFERIMENTI NORMATIVI ═════════════════════════════════════ */}
              <Section title="2. Riferimenti Normativi" number="§2">
                <table className="w-full text-[11px] border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#f8f0f0] dark:bg-[color:var(--theme-accent)]/10 text-left">
                      <th className="py-2 px-3 font-bold uppercase tracking-widest border border-black/10 dark:border-white/10">Norma</th>
                      <th className="py-2 px-3 font-bold uppercase tracking-widest border border-black/10 dark:border-white/10">Titolo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['CEI EN 60909:2016', 'Correnti di cortocircuito nei sistemi trifase a corrente alternata — Calcolo delle correnti'],
                      ['IEC 60364-5-54', 'Impianti elettrici degli edifici — Messa a terra e conduttori di protezione'],
                      ['CEI 11-37', 'Guida per l\'esecuzione degli impianti di terra nei sistemi utilizzatori di energia'],
                      ['IEC 60228', 'Conduttori per cavi isolati — Sezioni normalizzate'],
                      ['CEI 11-1', 'Impianti elettrici con tensione superiore a 1 kV in corrente alternata'],
                      ['IEC 60076-1', 'Trasformatori di potenza — Generalità'],
                    ].map(([norm, title]) => (
                      <tr key={norm} className="border-b border-black/5 dark:border-white/5">
                        <td className="py-2 px-3 font-mono font-bold text-[10px] border border-black/10 dark:border-white/10 text-[color:var(--theme-accent)] whitespace-nowrap">{norm}</td>
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 opacity-80">{title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>

              {/* ══ 3. DATI DI IMPIANTO ══════════════════════════════════════════ */}
              <Section title="3. Dati di Impianto" number="§3">
                <p className="mb-4 text-[11px] font-sans opacity-70">
                  I seguenti parametri sono stati forniti dall'operatore e costituiscono i dati
                  di ingresso per i calcoli successivi.
                </p>
                <table className="w-full text-[11px] border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#f8f0f0] dark:bg-[color:var(--theme-accent)]/10">
                      <th className="py-2 px-3 font-bold uppercase tracking-widest text-left border border-black/10 dark:border-white/10">Parametro</th>
                      <th className="py-2 px-3 font-bold uppercase tracking-widest text-left border border-black/10 dark:border-white/10">Simbolo</th>
                      <th className="py-2 px-3 font-bold uppercase tracking-widest text-right border border-black/10 dark:border-white/10">Valore</th>
                      <th className="py-2 px-3 font-bold uppercase tracking-widest text-left border border-black/10 dark:border-white/10">Unità</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Numero trasformatori', 'n', inputs.numTransformers.toString(), 'un'],
                      ['Potenza nominale per trasformatore', 'Sₙ', inputs.powerKVA.toString(), 'kVA'],
                      ['Potenza totale installata', 'Sₙ,tot', results.totalPowerKVA.toString(), 'kVA'],
                      ['Tensione primaria', 'V₁', inputs.primaryVoltageKV.toString(), 'kV'],
                      ['Tensione secondaria', 'V₂', inputs.secondaryVoltageV.toString(), 'V'],
                      ['Tensione di cortocircuito', 'ucc%', inputs.shortCircuitVoltagePct.toString(), '%'],
                      ['Tempo di intervento protezione', 't', inputs.faultTimeS.toString(), 's'],
                      ['Materiale conduttore', '—', material, '—'],
                      ['Isolamento conduttore', '—', insul, '—'],
                    ].map(([param, sym, val, unit]) => (
                      <tr key={param} className="border-b border-black/5 dark:border-white/5 hover:bg-black/2">
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 opacity-80">{param}</td>
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 font-mono text-[10px] text-[color:var(--theme-accent)]">{sym}</td>
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 text-right font-bold font-mono">{val}</td>
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 opacity-60">{unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>

              {/* ══ 4. METODO DI CALCOLO ═════════════════════════════════════════ */}
              <Section title="4. Metodo di Calcolo" number="§4">
                <p className="mb-4">
                  Il dimensionamento dei conduttori di protezione è eseguito con il <strong>metodo adiabatico</strong>,
                  in conformità all'equazione (543.1) della norma IEC 60364-5-54:
                </p>

                <Formula>
                  S ≥ (I × √t) / k
                </Formula>

                <p className="mt-4 mb-2 text-[11px] font-sans">dove:</p>
                <table className="w-full text-[11px] font-sans border-collapse mb-4">
                  <tbody>
                    {[
                      ['S', 'Sezione minima del conduttore di protezione', 'mm²'],
                      ['I', 'Corrente di guasto prospettica (corrente di cortocircuito Icc)', 'A'],
                      ['t', 'Tempo di intervento del dispositivo di protezione', 's'],
                      ['k', 'Fattore dipendente dal materiale del conduttore e dall\'isolamento', '—'],
                    ].map(([sym, desc, unit]) => (
                      <tr key={sym} className="border-b border-black/5 dark:border-white/5">
                        <td className="py-1.5 pr-4 font-mono font-bold text-[10px] text-[color:var(--theme-accent)] w-8">{sym}</td>
                        <td className="py-1.5 pr-4 opacity-80">{desc}</td>
                        <td className="py-1.5 font-mono text-[10px] opacity-50">{unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-[#f8f0f0] dark:bg-[color:var(--theme-accent)]/10 border border-[color:var(--theme-accent)]/20 p-4 text-[11px] font-sans">
                  <p className="font-bold mb-2">Fattore k adottato</p>
                  <p>
                    Per <strong>{material} con isolamento {insul}</strong>, si adotta:
                    <span className="font-mono font-bold text-[color:var(--theme-accent)] ml-2">k = {k}</span>
                    {' '}(CEI EN 60909 / IEC 60364-5-54, Tabella 43A — temperatura iniziale 90°C, temperatura finale 250°C)
                  </p>
                </div>

                <p className="mt-4 text-[11px] font-sans">
                  La corrente di cortocircuito trifase simmetrica al secondario del trasformatore
                  è calcolata con la formula:
                </p>
                <Formula>
                  Icc = Sₙ / (√3 × V₂ × ucc%)
                </Formula>
              </Section>

              {/* ══ 5. SVOLGIMENTO DEI CALCOLI ══════════════════════════════════ */}
              <Section title="5. Svolgimento dei Calcoli" number="§5">

                {/* Step 5.1 */}
                <SubSection title="5.1  Corrente di Cortocircuito al Secondario">
                  <p className="mb-3 text-[11px] font-sans">
                    Si calcola la corrente di cortocircuito trifase simmetrica (valore massimo prospettico)
                    al secondario, considerando la potenza totale installata di tutti i trasformatori:
                  </p>
                  <Formula>
                    Icc,tot = Sₙ,tot / (√3 × V₂ × ucc%)
                  </Formula>
                  <CalcStep
                    label="Sostituzione numerica:"
                    lines={[
                      `Icc,tot = (${results.totalPowerKVA} × 10³) / (√3 × ${inputs.secondaryVoltageV} × ${inputs.shortCircuitVoltagePct}/100)`,
                      `Icc,tot = ${results.totalPowerKVA * 1000} / (${fmt(Math.sqrt(3), 4)} × ${inputs.secondaryVoltageV} × ${inputs.shortCircuitVoltagePct / 100})`,
                      `Icc,tot = ${results.totalPowerKVA * 1000} / ${fmt(Math.sqrt(3) * inputs.secondaryVoltageV * (inputs.shortCircuitVoltagePct / 100), 2)}`,
                    ]}
                    result={`Icc,tot = ${fmt(iccTotal, 2)} A`}
                  />
                  {inputs.numTransformers > 1 && (
                    <>
                      <p className="mt-4 mb-3 text-[11px] font-sans">
                        Per il dimensionamento del <em>cavo di terra del neutro</em> del singolo
                        trasformatore, si impiega la corrente di cortocircuito riferita al solo
                        trasformatore:
                      </p>
                      <CalcStep
                        label="Icc per singolo trasformatore:"
                        lines={[
                          `Icc,1 = (${inputs.powerKVA} × 10³) / (√3 × ${inputs.secondaryVoltageV} × ${inputs.shortCircuitVoltagePct}/100)`,
                        ]}
                        result={`Icc,1 = ${fmt(iccSingle, 2)} A`}
                      />
                    </>
                  )}
                </SubSection>

                {/* Step 5.2 */}
                <SubSection title="5.2  Cavo di Messa a Terra del Neutro del Trasformatore">
                  <p className="mb-3 text-[11px] font-sans">
                    Il cavo di terra del neutro deve sopportare la corrente di cortocircuito del
                    singolo trasformatore per la durata t del dispositivo di protezione.
                    Applicazione formula adiabatica (eq. 543.1, IEC 60364-5-54):
                  </p>
                  <Formula>
                    S ≥ (Icc,1 × √t) / k
                  </Formula>
                  <CalcStep
                    label="Sostituzione numerica:"
                    lines={[
                      `S = (${fmt(iccSingle, 2)} × √${inputs.faultTimeS}) / ${k}`,
                      `S = (${fmt(iccSingle, 2)} × ${fmt(sqrtT, 4)}) / ${k}`,
                      `S = ${fmt(iccSingle * sqrtT, 2)} / ${k}`,
                    ]}
                    result={`S_calc = ${fmt4(results.earthingCableSectionRawMM2)} mm²`}
                    normalized={`S_norm = ${results.earthingCableSectionNormMM2} mm²  (IEC 60228)`}
                  />
                </SubSection>

                {/* Step 5.3 */}
                <SubSection title="5.3  Collettore di Terra della Cabina">
                  <p className="mb-3 text-[11px] font-sans">
                    Il collettore principale di terra della cabina deve essere dimensionato per
                    la corrente di cortocircuito totale dell'impianto (tutti i trasformatori in
                    parallelo). Applicazione formula adiabatica:
                  </p>
                  <Formula>
                    S ≥ (Icc,tot × √t) / k
                  </Formula>
                  <CalcStep
                    label="Sostituzione numerica:"
                    lines={[
                      `S = (${fmt(iccTotal, 2)} × √${inputs.faultTimeS}) / ${k}`,
                      `S = (${fmt(iccTotal, 2)} × ${fmt(sqrtT, 4)}) / ${k}`,
                      `S = ${fmt(iccTotal * sqrtT, 2)} / ${k}`,
                    ]}
                    result={`S_calc = ${fmt4(results.collectorSectionRawMM2)} mm²`}
                    normalized={`S_norm = ${results.collectorSectionNormMM2} mm²  (IEC 60228)`}
                  />
                </SubSection>

                {/* Step 5.4 */}
                <SubSection title="5.4  Bandella di Equipotenzializzazione">
                  <p className="mb-3 text-[11px] font-sans">
                    La bandella di equipotenzializzazione è dimensionata pari alla metà della
                    sezione del collettore, con un minimo normativo di 16 mm² (CEI 11-37, Art. 8.2):
                  </p>
                  <Formula>
                    S_bandella ≥ S_collettore / 2  ≥  16 mm²  (minimo normativo)
                  </Formula>
                  <CalcStep
                    label="Calcolo:"
                    lines={[
                      `S_bandella_calc = ${fmt4(results.collectorSectionRawMM2)} / 2 = ${fmt4(results.bandellaSectionRawMM2)} mm²`,
                      results.bandellaSectionNormMM2 === 16
                        ? `Valore arrotondato a 16 mm² (minimo normativo CEI 11-37)`
                        : `Arrotondamento alla sezione normalizzata superiore (IEC 60228)`,
                    ]}
                    result={`S_bandella = ${results.bandellaSectionNormMM2} mm²`}
                    normalized={results.bandellaSectionNormMM2 === 16 ? '⚠ Sezione minima normativa applicata' : undefined}
                    warning={results.bandellaSectionNormMM2 === 16}
                  />
                </SubSection>
              </Section>

              {/* ══ 6. RIEPILOGO RISULTATI ═══════════════════════════════════════ */}
              <Section title="6. Riepilogo dei Risultati" number="§6">
                <table className="w-full text-[11px] border-collapse font-sans">
                  <thead>
                    <tr className="bg-[color:var(--theme-primary)] text-white">
                      <th className="py-3 px-4 font-bold uppercase tracking-widest text-left border border-[color:var(--theme-accent)]">Conduttore</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-widest text-right border border-[color:var(--theme-accent)]">S calc. (mm²)</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-widest text-right border border-[color:var(--theme-accent)]">S norm. (mm²)</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-widest text-left border border-[color:var(--theme-accent)]">Norma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Cavo Terra Neutro Trafo.', fmt4(results.earthingCableSectionRawMM2), results.earthingCableSectionNormMM2, 'IEC 60364-5-54, eq. 543.1'],
                      ['Collettore di Terra (busbar)', fmt4(results.collectorSectionRawMM2), results.collectorSectionNormMM2, 'IEC 60364-5-54, eq. 543.1'],
                      ['Bandella Equipotenz.', fmt4(results.bandellaSectionRawMM2), results.bandellaSectionNormMM2, 'CEI 11-37, Art. 8.2 (min. 16 mm²)'],
                    ].map(([cond, raw, norm, ref]) => (
                      <tr key={cond as string} className="border-b border-black/10 dark:border-white/10 hover:bg-[color:var(--theme-accent)]/5">
                        <td className="py-3 px-4 border border-black/10 dark:border-white/10 font-bold">{cond}</td>
                        <td className="py-3 px-4 border border-black/10 dark:border-white/10 text-right font-mono text-[10px] opacity-70">{raw}</td>
                        <td className="py-3 px-4 border border-black/10 dark:border-white/10 text-right font-mono font-bold text-[color:var(--theme-accent)] text-base">{norm}</td>
                        <td className="py-3 px-4 border border-black/10 dark:border-white/10 text-[10px] opacity-60">{ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Icc summary card */}
                <div className="mt-4 bg-[#1a1a1a] dark:bg-white/5 text-white p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-sans font-bold tracking-widest uppercase opacity-50 mb-1">
                      Corrente di Cortocircuito Simmetrica (Valore Prospettico)
                    </p>
                    <p className="font-mono text-2xl font-bold">
                      {fmt(iccTotal, 2)} <span className="text-sm opacity-60">A</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <div className="text-right">
                      <p className="text-[9px] font-sans opacity-50 tracking-widest">k = {k}</p>
                      <p className="text-[9px] font-sans opacity-50">t = {inputs.faultTimeS} s</p>
                    </div>
                  </div>
                </div>
              </Section>

              {/* ══ 7. CONCLUSIONI ═══════════════════════════════════════════════ */}
              <Section title="7. Conclusioni" number="§7">
                <p className="mb-4">
                  I conduttori di protezione, dimensionati con il metodo adiabatico in conformità
                  alla norma IEC 60364-5-54 eq. (543.1), risultano adeguati a sopportare la corrente
                  di cortocircuito prospettica di <strong>{fmt(iccTotal, 2)} A</strong> per il
                  tempo di intervento della protezione di <strong>{inputs.faultTimeS} s</strong>.
                </p>
                <p className="mb-4">
                  Le sezioni normalizzate adottate sono conformi alla norma IEC 60228 e rispettano
                  i minimi normativi previsti dalla CEI 11-37 per gli impianti di messa a terra.
                </p>
                <div className="bg-[#f8f0f0] dark:bg-[color:var(--theme-accent)]/10 border-l-4 border-[color:var(--theme-accent)] pl-4 py-3 font-sans text-[11px]">
                  <p className="font-bold mb-1">Sezioni adottate (valori di progetto):</p>
                  <ul className="space-y-1 opacity-80">
                    <li>• Cavo terra neutro trasformatore: <strong>{results.earthingCableSectionNormMM2} mm²</strong> {material} — {insul}</li>
                    <li>• Collettore di terra cabina: <strong>{results.collectorSectionNormMM2} mm²</strong> {material} — {insul}</li>
                    <li>• Bandella di equipotenzializzazione: <strong>{results.bandellaSectionNormMM2} mm²</strong> {material}</li>
                  </ul>
                </div>
              </Section>

              {/* ══ 8. FIRME ═════════════════════════════════════════════════════ */}
              <div className="mt-12 pt-6 border-t-2 border-black/20 dark:border-white/20">
                <div className="grid grid-cols-3 gap-8 font-sans text-[10px]">
                  {['Redatto da', 'Verificato da', 'Approvato da'].map((label) => (
                    <div key={label}>
                      <p className="font-bold uppercase tracking-widest opacity-50 mb-1">{label}</p>
                      {label === 'Redatto da' && engineerName
                        ? <p className="font-bold">{engineerName}</p>
                        : <div className="h-8 border-b border-black/20 dark:border-white/20 mt-4" />}
                      <p className="opacity-40 mt-1">{today}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-black/10 dark:border-white/10 font-sans text-[9px] opacity-30 flex justify-between">
                <p>CablePro — Relazione di Calcolo Automatica v1.0</p>
                <p>CEI EN 60909:2016 | IEC 60364-5-54 | CEI 11-37 | IEC 60228</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cmt-report-body, #cmt-report-body * { visibility: visible !important; }
          #cmt-report-body { position: fixed; top: 0; left: 0; width: 100%; height: auto; overflow: visible !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, number, children }: { title: string; number: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[9px] font-sans font-bold text-[color:var(--theme-accent)] tracking-widest">{number}</span>
        <h2 className="text-lg font-bold border-b border-black/10 dark:border-white/10 pb-1 flex-1">{title}</h2>
      </div>
      <div className="text-[12px] leading-relaxed">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="font-bold text-[13px] mb-3 text-[color:var(--theme-primary)] dark:text-[#c97b7b]">{title}</h3>
      {children}
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 px-6 py-4 bg-[#f5f5f5] dark:bg-white/5 border border-black/10 dark:border-white/10 font-mono text-base text-center tracking-wide">
      {children}
    </div>
  );
}

function CalcStep({ label, lines, result, normalized, warning }: {
  label: string;
  lines: string[];
  result: string;
  normalized?: string;
  warning?: boolean;
}) {
  return (
    <div className="mt-3 font-sans text-[11px] bg-white dark:bg-white/3 border border-black/10 dark:border-white/10">
      <div className="px-4 py-2 bg-[#f0f0f0] dark:bg-white/5 border-b border-black/5 dark:border-white/5">
        <p className="font-bold opacity-60 uppercase tracking-widest text-[9px]">{label}</p>
      </div>
      <div className="px-4 py-3 space-y-1 font-mono text-[11px]">
        {lines.map((line, i) => (
          <p key={i} className={i === lines.length - 1 ? '' : 'opacity-60'}>{line}</p>
        ))}
      </div>
      <div className={`px-4 py-3 border-t ${warning ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700' : 'bg-[#f8f0f0] dark:bg-[color:var(--theme-accent)]/10 border-[color:var(--theme-accent)]/20'} flex items-center justify-between`}>
        <p className="font-mono font-bold text-[13px] text-[color:var(--theme-accent)]">→ {result}</p>
        {normalized && (
          <div className="flex items-center gap-1.5">
            {warning ? <AlertCircle size={13} className="text-amber-600" /> : <CheckCircle2 size={13} className="text-emerald-500" />}
            <p className="text-[10px] font-bold opacity-60">{normalized}</p>
          </div>
        )}
      </div>
    </div>
  );
}
