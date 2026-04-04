import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash2, Zap, LayoutDashboard, FileDown } from 'lucide-react';
import { Translation, Language } from '../../types';
import { VentilationElement, CabineDimensions } from '../../types/cabineMTVentilation';
import { calculateVentilation, formatPower, calcTrafoLossPerUnit } from '../../utils/cabineMTVentilation';
import { AddElementModal } from './AddElementModal';
import { VentilationResultsPanel } from './VentilationResultsPanel';
import { VentilationReport } from './VentilationReport';
import { useApp } from '../../context/AppContext';

interface VentilationTabProps {
  t: Translation['cabineMT'];
  lang: Language;
  projectName: string;
  engineerName?: string;
  elements: VentilationElement[];
  dimensions: CabineDimensions;
  onUpdateElements: (elements: VentilationElement[]) => void;
  onUpdateDimensions: (dims: CabineDimensions) => void;
}

const INPUT_CLASS =
  'w-full bg-[#efefef] dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-2 text-xs font-bold outline-none dark:text-white transition-colors font-mono';

export function VentilationTab({
  t,
  lang,
  projectName,
  engineerName,
  elements,
  dimensions,
  onUpdateElements,
  onUpdateDimensions,
}: VentilationTabProps) {
  const { moduleTheme } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingElement, setEditingElement] = useState<VentilationElement | null>(null);
  const [showReport, setShowReport] = useState(false);

  const results = useMemo(
    () => calculateVentilation({ elements, dimensions }),
    [elements, dimensions],
  );

  const handleAddElement = (data: Omit<VentilationElement, 'id'>) => {
    if (editingElement) {
      onUpdateElements(
        elements.map((e) => (e.id === editingElement.id ? { ...data, id: e.id } : e))
      );
    } else {
      onUpdateElements([...elements, { ...data, id: crypto.randomUUID() }]);
    }
    setShowModal(false);
    setEditingElement(null);
  };

  const handleEdit = (el: VentilationElement) => {
    setEditingElement(el);
    setShowModal(true);
  };

  const handleRemove = (id: string) => {
    onUpdateElements(elements.filter((e) => e.id !== id));
  };

  const handleDimChange = (field: keyof CabineDimensions, value: number) => {
    onUpdateDimensions({ ...dimensions, [field]: value });
  };

  return (
    <>
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* ─── LEFT: Inputs ─── */}
        <div className="w-full lg:w-[380px] flex-shrink-0 space-y-4">

          {/* Thermal Elements */}
          <div className="bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 shadow-xl shadow-black/5">
            <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <p className="text-[9px] font-black tracking-widest uppercase dark:text-white flex items-center gap-2">
                <Zap size={12} style={{ color: moduleTheme.accent }} />
                {t.thermalElementsTitle}
              </p>
              <button
                id="cmt-add-element"
                onClick={() => { setEditingElement(null); setShowModal(true); }}
                className="relative flex items-center gap-2 text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl overflow-hidden group shadow-lg active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${moduleTheme.primary}, ${moduleTheme.accent})`,
                  boxShadow: `0 4px 15px ${moduleTheme.primary}40`,
                }}
              >
                <Plus size={14} className="relative z-10" />
                <span className="relative z-10">{t.addBtn}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/5 min-h-[120px]">
              <AnimatePresence initial={false}>
                {elements.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[10px] font-bold opacity-30 dark:text-white uppercase tracking-widest">
                      {t.noneAddedMsg}
                    </p>
                  </div>
                ) : (
                  elements.map((el) => (
                    <motion.div
                      key={el.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 px-4 py-3 group"
                    >
                      <div className="flex-shrink-0">
                        <div 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-transform duration-300 group-hover:scale-110 ${
                            el.type === 'transformer' 
                              ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/20 dark:border-amber-500/30' 
                              : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/20 dark:border-blue-500/30'
                          }`}
                        >
                          {el.type === 'transformer' ? (
                            <Zap size={18} className="text-amber-600 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(217,119,6,0.3)]" />
                          ) : (
                            <LayoutDashboard size={18} className="text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.3)]" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold dark:text-white truncate">{el.label}</p>
                        <p className="text-[9px] opacity-40 font-bold">
                          {el.quantity > 1 ? `${el.quantity}× ` : ''}
                          {el.type === 'transformer' ? (
                            <>
                              {el.powerKVA} kVA{' '}
                              <span style={{ color: moduleTheme.accent }}>
                                ({t.losses}: {formatPower(calcTrafoLossPerUnit(el))})
                              </span>
                            </>
                          ) : (
                            <>
                              {t.switchboardTag} ({el.numColumns} {t.columns}){' '}
                              <span style={{ color: moduleTheme.accent }}>
                                ({t.dissipationPerUnit}: {formatPower((el.numColumns ?? 0) * 0.15)}/un)
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(el)}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
                          title={t.editElement}
                        >
                          <Pencil size={12} className="opacity-50" />
                        </button>
                        <button
                          onClick={() => handleRemove(el.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title={t.removeElement}
                        >
                          <Trash2 size={12} style={{ color: moduleTheme.accent }} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Dimensions card */}
          <div className="bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 shadow-xl shadow-black/5">
            <div className="px-5 py-4 border-b border-black/5 dark:border-white/5">
              <p className="text-[9px] font-black tracking-widest uppercase dark:text-white">
                {t.cabineDimensions}
              </p>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4">
              {([
                { key: 'heightM', label: t.cabineHeight },
                { key: 'widthM', label: t.cabineWidth },
                { key: 'lengthM', label: t.cabineLength },
              ] as { key: keyof CabineDimensions; label: string }[]).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-[9px] font-bold opacity-40 tracking-widest uppercase mb-1.5 dark:text-white">
                    {label} <span className="opacity-60">({t.unitM})</span>
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={dimensions[key]}
                    onChange={(e) => handleDimChange(key, parseFloat(e.target.value) || 0)}
                    className={INPUT_CLASS}
                    style={{ '--tw-ring-color': moduleTheme.accent } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Results ─── */}
        <div className="flex-1">
          <div className="bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 h-full flex flex-col">
            <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <p className="text-[9px] font-black tracking-widest uppercase dark:text-white">
                {t.ventilationResults}
              </p>
              <div className="flex items-center gap-2">
                {results && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setShowReport(true)}
                    className="relative flex items-center gap-2 text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl overflow-hidden group shadow-lg active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${moduleTheme.primary}, ${moduleTheme.accent})`,
                      boxShadow: `0 4px 15px ${moduleTheme.primary}40`,
                    }}
                  >
                    <FileDown size={14} className="relative z-10" />
                    <span className="relative z-10">{t.exportPDF}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </motion.button>
                )}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <VentilationResultsPanel t={t} results={results} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddElementModal
          t={t}
          onConfirm={handleAddElement}
          onClose={() => { setShowModal(false); setEditingElement(null); }}
          editingElement={editingElement}
        />
      )}

      {/* Ventilation report */}
      {showReport && results && (
        <VentilationReport
          elements={elements}
          dimensions={dimensions}
          results={results}
          lang={lang}
          projectName={projectName}
          engineerName={engineerName}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
