// src/modules/cmeGenerator/pages/ResultsView.tsx
import React, { useState, useMemo } from 'react';
import { Download, Search, Filter } from 'lucide-react';
import { useCme } from '../context/CmeContext';
import { exportExcel } from '../services/excelExporter';
import { fillTemplateAndExport } from '../services/excelFiller';
import { hasTemplate } from '../services/templateService';
import type { ResultadoItem, StatusItem } from '../types';

const STATUS_BADGE: Record<StatusItem, { label: string; className: string }> = {
  OK:            { label: 'OK',          className: 'bg-green-900/40 text-green-400 border-green-700/40' },
  ALERT:         { label: 'ALERT',       className: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40' },
  NAO_ENCONTRADO:{ label: 'NÃO ECONTRADO', className: 'bg-red-900/40 text-red-400 border-red-700/40' },
  NVP:           { label: 'NVP',         className: 'bg-cyan-900/40 text-cyan-400 border-cyan-700/40' },
};

interface ResultsViewProps { onSelectElement: (id: string) => void }

export function ResultsView({ onSelectElement }: ResultsViewProps) {
  const { getAllEffectiveResults } = useCme();
  const results = getAllEffectiveResults();

  const [tab, setTab] = useState<'computo' | 'categoria' | 'livello' | 'edificio' | 'dashboard'>('computo');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusItem | 'ALL'>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const useTemplate = await hasTemplate();
      if (useTemplate) {
        await fillTemplateAndExport(results);
      } else {
        await exportExcel(results);
      }
    } catch (err: any) {
      alert(err.message || 'Erro na exportação.');
    } finally {
      setIsExporting(false);
    }
  };

  const filtered = useMemo(() => {
    return results.filter(r => {
      const matchSearch = !search || [r.descrizioneElemento, r.edificio, r.livello, r.zona, r.categoria]
        .some(f => f.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [results, search, filterStatus]);

  const grandTotal = filtered.reduce((s, r) => s + r.total, 0);

  // Aggregations
  const byCategoria = useMemo(() => {
    const map = new Map<string, number>();
    results.forEach(r => map.set(r.categoria, (map.get(r.categoria) ?? 0) + r.total));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [results]);

  const byEdificio = useMemo(() => {
    const map = new Map<string, number>();
    results.forEach(r => map.set(r.edificio, (map.get(r.edificio) ?? 0) + r.total));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [results]);

  const kpi = useMemo(() => ({
    total: results.reduce((s, r) => s + r.total, 0),
    ok:    results.filter(r => r.status === 'OK').length,
    alert: results.filter(r => r.status === 'ALERT').length,
    nf:    results.filter(r => r.status === 'NAO_ENCONTRADO').length,
    nvp:   results.filter(r => r.status === 'NVP').length,
  }), [results]);

  const TABS = [
    { id: 'computo', label: 'Computo' },
    { id: 'categoria', label: 'Categoria' },
    { id: 'livello', label: 'Livello' },
    { id: 'edificio', label: 'Edificio' },
    { id: 'dashboard', label: 'Dashboard' },
  ] as const;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-white/5">
        <div className="flex gap-1 flex-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all
                ${tab === t.id ? 'bg-[#E94560]/20 text-[#E94560] border border-[#E94560]/30' : 'text-white/40 hover:text-white/70'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700/40 rounded-xl text-green-400 text-xs font-bold tracking-widest uppercase hover:bg-green-900/50 transition-colors disabled:opacity-50"
        >
          <Download size={14} />
          {isExporting ? 'A EXPORTAR...' : 'EXPORTAR EXCEL'}
        </button>
      </div>

      {/* Computo tab */}
      {tab === 'computo' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="flex gap-3 px-6 py-3 border-b border-white/5">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white" />
            </div>
            <div className="flex gap-1">
              {(['ALL', 'OK', 'ALERT', 'NAO_ENCONTRADO', 'NVP'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                    ${filterStatus === s ? 'bg-white/20 text-white' : 'text-white/30 hover:text-white/60'}`}>
                  {s === 'ALL' ? 'TUDO' : s}
                </button>
              ))}
            </div>
            <span className="text-white/30 text-xs ml-auto self-center">{filtered.length} itens · €{grandTotal.toFixed(2)}</span>
          </div>
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#080C14]">
                <tr className="text-xs text-white/40 font-bold tracking-widest uppercase">
                  {['Edificio','Livello','Zona','Categoria','Descrizione','Qtd','UM','Valore Unit.','Totale','Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap border-b border-white/5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const badge = STATUS_BADGE[r.status];
                  return (
                    <tr key={r.idElemento}
                      onClick={() => onSelectElement(r.idElemento)}
                      className={`cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                      <td className="px-4 py-2.5 text-white/70">{r.edificio}</td>
                      <td className="px-4 py-2.5 text-white/70">{r.livello}</td>
                      <td className="px-4 py-2.5 text-white/50 text-xs">{r.zona}</td>
                      <td className="px-4 py-2.5 text-white/60 text-xs">{r.categoria}</td>
                      <td className="px-4 py-2.5 text-white max-w-xs truncate">{r.descrizioneElemento}</td>
                      <td className="px-4 py-2.5 text-white/70 text-right">{r.quantitaElemento}</td>
                      <td className="px-4 py-2.5 text-white/40 text-xs">{r.unidade}</td>
                      <td className="px-4 py-2.5 text-white/70 text-right">€{r.valoreUnitario.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-white font-bold text-right">€{r.total.toFixed(2)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${badge.className}`}>{badge.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categoria tab */}
      {tab === 'categoria' && (
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-white/40 uppercase tracking-widest border-b border-white/10">
              <th className="text-left py-3 px-4">Categoria</th>
              <th className="text-right py-3 px-4">Itens</th>
              <th className="text-right py-3 px-4">Totale (€)</th>
              <th className="text-right py-3 px-4">%</th>
            </tr></thead>
            <tbody>
              {byCategoria.map(([cat, total]) => (
                <tr key={cat} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{cat}</td>
                  <td className="py-3 px-4 text-white/60 text-right">{results.filter(r => r.categoria === cat).length}</td>
                  <td className="py-3 px-4 text-white font-bold text-right">€{total.toFixed(2)}</td>
                  <td className="py-3 px-4 text-white/40 text-right">{kpi.total > 0 ? ((total/kpi.total)*100).toFixed(1) : 0}%</td>
                </tr>
              ))}
              <tr className="border-t-2 border-white/20">
                <td className="py-3 px-4 font-bold text-white">TOTALE</td>
                <td className="py-3 px-4 font-bold text-white text-right">{results.length}</td>
                <td className="py-3 px-4 font-bold text-[#E94560] text-right">€{kpi.total.toFixed(2)}</td>
                <td className="py-3 px-4 text-white/40 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Edificio tab */}
      {tab === 'edificio' && (
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-white/40 uppercase tracking-widest border-b border-white/10">
              <th className="text-left py-3 px-4">Edificio</th>
              <th className="text-right py-3 px-4">Itens</th>
              <th className="text-right py-3 px-4">Totale (€)</th>
              <th className="text-right py-3 px-4">%</th>
            </tr></thead>
            <tbody>
              {byEdificio.map(([ed, total]) => (
                <tr key={ed} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{ed}</td>
                  <td className="py-3 px-4 text-white/60 text-right">{results.filter(r => r.edificio === ed).length}</td>
                  <td className="py-3 px-4 text-white font-bold text-right">€{total.toFixed(2)}</td>
                  <td className="py-3 px-4 text-white/40 text-right">{kpi.total > 0 ? ((total/kpi.total)*100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Livello tab */}
      {tab === 'livello' && (
        <div className="flex-1 overflow-auto p-6">
          {(() => {
            const livelli = [...new Set(results.map(r => r.livello))].sort();
            const edificios = [...new Set(results.map(r => r.edificio))].sort();
            return (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/40 text-xs uppercase">Livello</th>
                    {edificios.map(ed => <th key={ed} className="text-right py-3 px-4 text-white/40 text-xs uppercase">{ed}</th>)}
                    <th className="text-right py-3 px-4 text-white/40 text-xs uppercase">Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {livelli.map(lv => {
                    const lvTotal = results.filter(r => r.livello === lv).reduce((s, r) => s + r.total, 0);
                    return (
                      <tr key={lv} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white font-bold">{lv}</td>
                        {edificios.map(ed => {
                          const t = results.filter(r => r.livello === lv && r.edificio === ed).reduce((s, r) => s + r.total, 0);
                          return <td key={ed} className="py-3 px-4 text-white/70 text-right">{t > 0 ? `€${t.toFixed(2)}` : '—'}</td>;
                        })}
                        <td className="py-3 px-4 text-white font-bold text-right">€{lvTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })()}
        </div>
      )}

      {/* Dashboard tab */}
      {tab === 'dashboard' && (
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Totale Generale', value: `€${kpi.total.toFixed(2)}`, color: '#E94560' },
              { label: 'Itens OK', value: kpi.ok, color: '#27ae60' },
              { label: 'Alerts', value: kpi.alert, color: '#f39c12' },
              { label: 'Não Encontrado', value: kpi.nf, color: '#e74c3c' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{label}</p>
                <p className="text-2xl font-black" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase mb-4">Por Categoria</h3>
              <div className="space-y-3">
                {byCategoria.slice(0, 8).map(([cat, total]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/70 truncate">{cat}</span>
                      <span className="text-white/50 ml-2">€{total.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#0F3460] to-[#E94560] rounded-full"
                        style={{ width: `${kpi.total > 0 ? (total / kpi.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase mb-4">Por Edificio</h3>
              <div className="space-y-3">
                {byEdificio.map(([ed, total]) => (
                  <div key={ed}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/70">{ed}</span>
                      <span className="text-white/50">€{total.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E94560] rounded-full"
                        style={{ width: `${kpi.total > 0 ? (total / kpi.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
