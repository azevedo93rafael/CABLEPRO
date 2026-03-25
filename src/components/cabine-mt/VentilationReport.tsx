import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Wind, BookOpen, CheckCircle2, Thermometer } from 'lucide-react';
import { Language } from '../../types';
import { ThermalElement, CabineDimensions, VentilationResults } from '../../types/cabineMTVentilation';
import { calcElementHeatPerUnit } from '../../utils/cabineMTVentilation';
import { getReportStrings, getVentilationNorms } from '../../utils/reportI18n';

// ── Constants (mirrored from engine) ─────────────────────────────────────────
const RHO_AIR = 1.2;
const CP_AIR  = 1005;
const BTU_PER_WATT = 3.412;
const DELTA_T = 15;

// ── Types ─────────────────────────────────────────────────────────────────────
interface VentilationReportProps {
  elements: ThermalElement[];
  dimensions: CabineDimensions;
  results: VentilationResults;
  lang: Language;
  projectName: string;
  engineerName?: string;
  onClose: () => void;
}

// ── Utility ───────────────────────────────────────────────────────────────────
function fmt(n: number, dec = 2) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtW(w: number) {
  return w >= 1000 ? `${fmt(w / 1000, 2)} kW` : `${fmt(w, 0)} W`;
}
function getToday(lang: Language) {
  const locale = lang === 'pt-BR' ? 'pt-BR' : lang === 'it' ? 'it-IT' : 'en-GB';
  return new Date().toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
}
function typeLabel(type: string, lang: Language) {
  if (type === 'transformer') return lang === 'pt-BR' ? 'Transformador' : lang === 'it' ? 'Trasformatore' : 'Transformer';
  if (type === 'switchboard_mt') return 'QMT';
  if (type === 'switchboard_bt') return 'QGBT';
  return type;
}

// ── Report ────────────────────────────────────────────────────────────────────
export function VentilationReport({ elements, dimensions, results, lang, projectName, engineerName, onClose }: VentilationReportProps) {
  const s = getReportStrings(lang);
  const norms = getVentilationNorms(lang);
  const today = getToday(lang);

  const denominator = RHO_AIR * CP_AIR * DELTA_T;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="relative bg-white dark:bg-[#111] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 print:hidden flex-shrink-0">
            <div className="flex items-center gap-2">
              <Wind size={16} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">
                {s.vt_title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-orange-700 transition-colors"
              >
                <Printer size={13} />
                {s.printBtn}
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded">
                <X size={16} className="opacity-40" />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div id="vt-report-body" className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="py-12 px-16 text-[#1a1a1a] dark:text-white" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

              {/* ══ COVER ══════════════════════════════════════════════════════ */}
              <div className="border-b-4 border-orange-500 pb-8 mb-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-700 flex items-center justify-center">
                        <Wind size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[9px] font-sans font-bold tracking-widest uppercase text-orange-600">{s.softwareLabel}</p>
                        <p className="text-[9px] font-sans opacity-40 tracking-widest">Engineering calculation software</p>
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{s.reportTitle}</h1>
                    <h2 className="text-xl font-normal opacity-70 mb-1">{s.vt_subtitle}</h2>
                  </div>
                  <div className="text-right text-[11px] font-sans opacity-60 space-y-1">
                    <p><span className="font-bold">{s.projectLabel}:</span> {projectName}</p>
                    <p><span className="font-bold">{s.dateLabel}:</span> {today}</p>
                    {engineerName && <p><span className="font-bold">{s.redactedBy}:</span> {engineerName}</p>}
                    <p><span className="font-bold">{s.calcVersion}:</span> 1.0</p>
                  </div>
                </div>
              </div>

              {/* ══ §1 SCOPE ═══════════════════════════════════════════════════ */}
              <Section title={s.vt_scope_title}>
                <p className="mb-3">{s.vt_scope_body}</p>
                <ul className="list-disc ml-6 space-y-1">
                  {s.vt_scope_items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </Section>

              {/* ══ §2 NORMS ═══════════════════════════════════════════════════ */}
              <Section title={s.vt_norms_title}>
                <NormTable norms={norms} cols={[s.normTableNorm, s.normTableTitle]} />
              </Section>

              {/* ══ §3 DATA ════════════════════════════════════════════════════ */}
              <Section title={s.vt_data_title}>
                {/* Elements table */}
                <p className="font-bold text-[12px] mb-2">{s.vt_elements_title}</p>
                <table className="w-full text-[11px] border-collapse font-sans mb-6">
                  <thead>
                    <tr className="bg-orange-50 dark:bg-orange-900/10">
                      {s.vt_elements_cols.map((col) => (
                        <th key={col} className="py-2 px-3 font-bold uppercase tracking-widest text-left border border-black/10 dark:border-white/10 text-[9px]">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {elements.map((el) => {
                      const hpu = calcElementHeatPerUnit(el);
                      const thermalParam = el.type === 'transformer'
                        ? `${el.powerKVA} kVA — η ${el.efficiencyPct}%`
                        : `${el.dissipatedPowerW} W`;
                      return (
                        <tr key={el.id} className="border-b border-black/5 dark:border-white/5">
                          <td className="py-2 px-3 border border-black/10 dark:border-white/10 font-bold">{el.label}</td>
                          <td className="py-2 px-3 border border-black/10 dark:border-white/10">{typeLabel(el.type, lang)}</td>
                          <td className="py-2 px-3 border border-black/10 dark:border-white/10 text-center font-mono">{el.quantity}</td>
                          <td className="py-2 px-3 border border-black/10 dark:border-white/10 font-mono text-[10px] opacity-70">{thermalParam}</td>
                          <td className="py-2 px-3 border border-black/10 dark:border-white/10 text-right font-mono">{fmt(hpu, 0)}</td>
                          <td className="py-2 px-3 border border-black/10 dark:border-white/10 text-right font-mono font-bold text-orange-600">{fmt(hpu * el.quantity, 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Dimensions */}
                <p className="font-bold text-[12px] mb-2">{s.vt_dims_title}</p>
                <table className="w-full text-[11px] border-collapse font-sans">
                  <tbody>
                    {[
                      [lang === 'pt-BR' ? 'Altura (H)' : lang === 'it' ? 'Altezza (H)' : 'Height (H)', `${dimensions.heightM} m`],
                      [lang === 'pt-BR' ? 'Largura (L)' : lang === 'it' ? 'Larghezza (L)' : 'Width (W)', `${dimensions.widthM} m`],
                      [lang === 'pt-BR' ? 'Comprimento (C)' : lang === 'it' ? 'Profondità (C)' : 'Length (L)', `${dimensions.lengthM} m`],
                      [lang === 'pt-BR' ? 'Volume total' : lang === 'it' ? 'Volume totale' : 'Total volume', `${fmt(results.cabineVolumeM3, 2)} m³`],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-black/5 dark:border-white/5">
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 opacity-80">{k}</td>
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 font-mono font-bold text-right">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>

              {/* ══ §4 METHOD ══════════════════════════════════════════════════ */}
              <Section title={s.vt_method_title}>
                <p className="mb-4">{s.vt_method_intro}</p>
                <Formula>Q_ar (m³/h) = Q_tot / (ρ × Cp × ΔT) × 3600</Formula>
                <p className="mt-4 mb-2 text-[11px] font-sans">{lang === 'pt-BR' ? 'onde:' : lang === 'it' ? 'dove:' : 'where:'}</p>
                <table className="w-full text-[11px] font-sans border-collapse mb-4">
                  <tbody>
                    {s.vt_method_symbols.map(([sym, desc, unit]) => (
                      <tr key={sym} className="border-b border-black/5 dark:border-white/5">
                        <td className="py-1.5 pr-4 font-mono font-bold text-[10px] text-orange-600 w-14">{sym}</td>
                        <td className="py-1.5 pr-4 opacity-80">{desc}</td>
                        <td className="py-1.5 font-mono text-[10px] opacity-50">{unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700/30 p-4 text-[11px] font-sans">
                  <BookOpen size={12} className="inline mr-2 text-orange-600" />
                  {s.vt_method_consts}
                </div>
              </Section>

              {/* ══ §5 WORKINGS ════════════════════════════════════════════════ */}
              <Section title={s.vt_calc_title}>

                {/* 5.1 Heat per element */}
                <SubSection title={s.vt_calc_heat_title}>
                  {/* Transformers */}
                  {elements.filter(e => e.type === 'transformer').length > 0 && (
                    <>
                      <p className="mb-3 text-[11px] font-sans">{s.vt_calc_heat_trafo}</p>
                      <Formula>P_loss = Sₙ × (1 - η/100)</Formula>
                      {elements.filter(e => e.type === 'transformer').map((el) => {
                        const eta = el.efficiencyPct ?? 98.5;
                        const hpu = calcElementHeatPerUnit(el);
                        return (
                          <CalcStep
                            key={el.id}
                            label={`${s.step_numerical} ${el.label}`}
                            lines={[
                              `P = ${el.powerKVA} kVA × (1 - ${eta}/100)`,
                              `P = ${el.powerKVA! * 1000} W × ${fmt((100 - eta) / 100, 4)}`,
                            ]}
                            result={`${s.step_result} P_${el.label} = ${fmt(hpu, 0)} W`}
                            color="orange"
                          />
                        );
                      })}
                    </>
                  )}

                  {/* Switchboards */}
                  {elements.filter(e => e.type !== 'transformer').length > 0 && (
                    <>
                      <p className="mt-4 mb-3 text-[11px] font-sans">{s.vt_calc_heat_switch}</p>
                      {elements.filter(e => e.type !== 'transformer').map((el) => (
                        <CalcStep
                          key={el.id}
                          label={`${typeLabel(el.type, lang)}: ${el.label}`}
                          lines={[`${lang === 'pt-BR' ? 'Valor fornecido' : lang === 'it' ? 'Valore fornito' : 'User-supplied value'}: P = ${el.dissipatedPowerW} W`]}
                          result={`P_${el.label} = ${el.dissipatedPowerW} W`}
                          color="orange"
                        />
                      ))}
                    </>
                  )}
                </SubSection>

                {/* 5.2 Total heat */}
                <SubSection title={s.vt_calc_total_title}>
                  <Formula>Q_tot = Σ (n_i × P_i)</Formula>
                  <CalcStep
                    label={s.step_calc}
                    lines={[
                      ...results.breakdown.map(b =>
                        `${b.label}: ${b.quantity} × ${fmt(b.heatPerUnitW, 0)} W = ${fmt(b.totalHeatW, 0)} W`
                      ),
                      `Q_tot = ${results.breakdown.map(b => fmt(b.totalHeatW, 0)).join(' + ')} W`,
                    ]}
                    result={`Q_tot = ${fmt(results.totalHeatW, 0)} W  (${fmtW(results.totalHeatW)})`}
                    color="orange"
                  />
                </SubSection>

                {/* 5.3 BTU */}
                <SubSection title={s.vt_calc_btu_title}>
                  <Formula>BTU/h = Q_tot × 3,412</Formula>
                  <CalcStep
                    label={s.step_numerical}
                    lines={[
                      `BTU/h = ${fmt(results.totalHeatW, 0)} × ${BTU_PER_WATT}`,
                    ]}
                    result={`BTU/h = ${Math.round(results.btuPerHour).toLocaleString()}`}
                    color="orange"
                  />
                </SubSection>

                {/* 5.4 Airflow */}
                <SubSection title={s.vt_calc_flow_title}>
                  <Formula>Q_ar = Q_tot / (ρ × Cp × ΔT) × 3600</Formula>
                  <CalcStep
                    label={s.step_numerical}
                    lines={[
                      `Q_ar = ${fmt(results.totalHeatW, 0)} / (${RHO_AIR} × ${CP_AIR} × ${DELTA_T}) × 3600`,
                      `Q_ar = ${fmt(results.totalHeatW, 0)} / ${fmt(denominator, 0)} × 3600`,
                    ]}
                    result={`Q_ar = ${fmt(results.airflowM3h, 1)} m³/h`}
                    color="orange"
                  />
                </SubSection>

                {/* 5.5 Volume */}
                <SubSection title={s.vt_calc_vol_title}>
                  <Formula>V = H × L × C</Formula>
                  <CalcStep
                    label={s.step_numerical}
                    lines={[
                      `V = ${dimensions.heightM} × ${dimensions.widthM} × ${dimensions.lengthM}`,
                    ]}
                    result={`V = ${fmt(results.cabineVolumeM3, 2)} m³`}
                    color="orange"
                  />
                </SubSection>
              </Section>

              {/* ══ §6 RESULTS ═════════════════════════════════════════════════ */}
              <Section title={s.vt_results_title}>
                {/* BTU hero */}
                <div className="bg-[#1a1a1a] dark:bg-white/5 text-white p-5 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 to-transparent" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-sans font-bold tracking-widest uppercase opacity-50 mb-1">BTU/h</p>
                      <p className="font-mono text-4xl font-bold">{Math.round(results.btuPerHour).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-sans opacity-50">Q_tot</p>
                      <p className="font-mono text-xl font-bold text-orange-400">{fmtW(results.totalHeatW)}</p>
                    </div>
                  </div>
                </div>

                <table className="w-full text-[11px] border-collapse font-sans">
                  <thead>
                    <tr className="bg-orange-700 text-white">
                      {s.vt_results_cols.map((col) => (
                        <th key={col} className="py-3 px-4 font-bold uppercase tracking-widest text-left border border-orange-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [lang === 'pt-BR' ? 'Calor total dissipado' : lang === 'it' ? 'Calore totale dissipato' : 'Total heat dissipated', fmtW(results.totalHeatW), 'W / kW'],
                      ['BTU/h', Math.round(results.btuPerHour).toLocaleString(), 'BTU/h'],
                      [lang === 'pt-BR' ? 'Portata de ar necessária' : lang === 'it' ? 'Portata d\'aria necessaria' : 'Required airflow', fmt(results.airflowM3h, 1), 'm³/h'],
                      [lang === 'pt-BR' ? 'Volume da cabine' : lang === 'it' ? 'Volume cabina' : 'Cabin volume', fmt(results.cabineVolumeM3, 2), 'm³'],
                      ['ΔT', `${DELTA_T}`, 'K'],
                    ].map(([q, v, u]) => (
                      <tr key={q as string} className="border-b border-black/10 hover:bg-orange-50/50 dark:hover:bg-orange-900/10">
                        <td className="py-3 px-4 border border-black/10 dark:border-white/10 font-bold">{q}</td>
                        <td className="py-3 px-4 border border-black/10 dark:border-white/10 font-mono font-bold text-orange-600 text-lg text-right">{v}</td>
                        <td className="py-3 px-4 border border-black/10 dark:border-white/10 opacity-60">{u}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Breakdown */}
                <p className="font-bold text-[12px] mt-6 mb-2">
                  {lang === 'pt-BR' ? 'Detalhamento térmico por elemento' : lang === 'it' ? 'Dettaglio termico per elemento' : 'Thermal breakdown by element'}
                </p>
                <table className="w-full text-[11px] border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#f5f5f5] dark:bg-white/5">
                      {['#', lang === 'pt-BR' ? 'Elemento' : lang === 'it' ? 'Elemento' : 'Element', 'Qt.', 'Q/un. (W)', 'Q tot. (W)', '%'].map(c => (
                        <th key={c} className="py-2 px-3 font-bold uppercase tracking-widest text-left border border-black/10 dark:border-white/10 text-[9px]">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.breakdown.map((b, i) => (
                      <tr key={b.id} className="border-b border-black/5">
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 opacity-40 font-mono">{i + 1}</td>
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 font-bold">{b.label}</td>
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 text-center font-mono">{b.quantity}</td>
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 text-right font-mono">{fmt(b.heatPerUnitW, 0)}</td>
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 text-right font-mono font-bold">{fmt(b.totalHeatW, 0)}</td>
                        <td className="py-2 px-3 border border-black/10 dark:border-white/10 text-right font-mono text-orange-600">
                          {fmt((b.totalHeatW / results.totalHeatW) * 100, 1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>

              {/* ══ §7 CONCLUSION ══════════════════════════════════════════════ */}
              <Section title={s.vt_conclusion_title}>
                <p className="mb-4">
                  {s.vt_conclusion_body
                    .replace('{heat}', fmtW(results.totalHeatW))
                    .replace('{btu}', Math.round(results.btuPerHour).toLocaleString())
                    .replace('{dt}', DELTA_T.toString())
                    .replace('{flow}', fmt(results.airflowM3h, 1))}
                </p>
                <div className="bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500 pl-4 py-3 font-sans text-[11px]">
                  <p className="font-bold mb-1">{s.vt_conclusion_list_intro}</p>
                  <ul className="space-y-1 opacity-80">
                    <li>• {lang === 'pt-BR' ? 'Potência térmica total' : lang === 'it' ? 'Potenza termica totale' : 'Total thermal power'}: <strong>{fmtW(results.totalHeatW)}</strong></li>
                    <li>• {lang === 'pt-BR' ? 'Equivalente em BTU/h' : lang === 'it' ? 'Equivalente in BTU/h' : 'BTU/h equivalent'}: <strong>{Math.round(results.btuPerHour).toLocaleString()} BTU/h</strong></li>
                    <li>• {lang === 'pt-BR' ? 'Portata de ar necessária' : lang === 'it' ? 'Portata d\'aria necessaria' : 'Required airflow'}: <strong>{fmt(results.airflowM3h, 1)} m³/h</strong></li>
                    <li>• ΔT: <strong>{DELTA_T} K</strong> (VDI 2078)</li>
                  </ul>
                </div>
              </Section>

              {/* Signatures */}
              <div className="mt-12 pt-6 border-t-2 border-black/20 dark:border-white/20">
                <div className="grid grid-cols-3 gap-8 font-sans text-[10px]">
                  {[s.redatto, s.verificato, s.approvato].map((label) => (
                    <div key={label}>
                      <p className="font-bold uppercase tracking-widest opacity-50 mb-1">{label}</p>
                      {label === s.redatto && engineerName
                        ? <p className="font-bold">{engineerName}</p>
                        : <div className="h-8 border-b border-black/20 dark:border-white/20 mt-4" />}
                      <p className="opacity-40 mt-1">{today}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-black/10 dark:border-white/10 font-sans text-[9px] opacity-30 flex justify-between">
                <p>CablePro — {s.reportTitle} v1.0</p>
                <p>{s.normsFooter}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #vt-report-body, #vt-report-body * { visibility: visible !important; }
          #vt-report-body { position: fixed; top: 0; left: 0; width: 100%; height: auto; overflow: visible !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold border-b border-black/10 dark:border-white/10 pb-1 mb-4">{title}</h2>
      <div className="text-[12px] leading-relaxed">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="font-bold text-[13px] mb-3 text-orange-700 dark:text-orange-400">{title}</h3>
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

function NormTable({ norms, cols }: { norms: [string, string][]; cols: string[] }) {
  return (
    <table className="w-full text-[11px] border-collapse font-sans">
      <thead>
        <tr className="bg-orange-50 dark:bg-orange-900/10 text-left">
          {cols.map(c => (
            <th key={c} className="py-2 px-3 font-bold uppercase tracking-widest border border-black/10 dark:border-white/10">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {norms.map(([norm, title]) => (
          <tr key={norm} className="border-b border-black/5 dark:border-white/5">
            <td className="py-2 px-3 font-mono font-bold text-[10px] border border-black/10 dark:border-white/10 text-orange-600 whitespace-nowrap">{norm}</td>
            <td className="py-2 px-3 border border-black/10 dark:border-white/10 opacity-80">{title}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CalcStep({ label, lines, result, color = 'gray' }: {
  label: string;
  lines: string[];
  result: string;
  color?: 'orange' | 'gray';
}) {
  const accent = color === 'orange' ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-700/30' : 'text-[#81292C] bg-[#f8f0f0] dark:bg-[#81292C]/10 border-[#81292C]/20';
  return (
    <div className="mt-3 font-sans text-[11px] bg-white dark:bg-white/3 border border-black/10 dark:border-white/10">
      <div className="px-4 py-2 bg-[#f0f0f0] dark:bg-white/5 border-b border-black/5 dark:border-white/5">
        <p className="font-bold opacity-60 uppercase tracking-widest text-[9px]">{label}</p>
      </div>
      <div className="px-4 py-3 space-y-1 font-mono text-[11px]">
        {lines.map((line, i) => (
          <p key={i} className={i < lines.length - 1 ? 'opacity-60' : ''}>{line}</p>
        ))}
      </div>
      <div className={`px-4 py-3 border-t ${accent} flex items-center gap-2`}>
        <CheckCircle2 size={13} />
        <p className="font-mono font-bold text-[13px]">→ {result}</p>
      </div>
    </div>
  );
}
