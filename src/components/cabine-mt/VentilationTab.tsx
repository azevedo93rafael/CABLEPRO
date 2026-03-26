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
                ELEMENTOS TÉRMICOS (FONTES DE CALOR)
              </p>
              <button
                id="cmt-add-element"
                onClick={() => { setEditingElement(null); setShowModal(true); }}
                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white px-3 py-1.5 transition-opacity hover:opacity-90"
                style={{ backgroundColor: moduleTheme.accent }}
              >
                <Plus size={12} />
                ADICIONAR
              </button>
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/5 min-h-[120px]">
              <AnimatePresence initial={false}>
                {elements.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[10px] font-bold opacity-30 dark:text-white uppercase tracking-widest">
                      NENHUM ELEMENTO ADICIONADO
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
                        {el.type === 'transformer' ? (
                          <Zap size={14} className="text-amber-500" />
                        ) : (
                          <LayoutDashboard size={14} className="text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold dark:text-white truncate">{el.label}</p>
                        <p className="text-[9px] opacity-40 font-bold">
                          {el.quantity > 1 ? `${el.quantity}× ` : ''}
                          {el.type === 'transformer' ? (
                            <>
                              {el.powerKVA} kVA{' '}
                              <span style={{ color: moduleTheme.accent }}>
                                (Perdas: {formatPower(calcTrafoLossPerUnit(el))})
                              </span>
                            </>
                          ) : (
                            <>
                              Quadro ({el.numColumns} col.){' '}
                              <span style={{ color: moduleTheme.accent }}>
                                (Dissipação: {formatPower((el.numColumns ?? 0) * 0.15)}/un)
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
                    className="flex items-center gap-1.5 text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-opacity hover:opacity-90 shadow-md shadow-black/10"
                    style={{ backgroundColor: moduleTheme.accent }}
                  >
                    <FileDown size={12} />
                    {t.exportPDF}
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
