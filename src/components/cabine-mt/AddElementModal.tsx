import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Zap, LayoutDashboard, Check } from 'lucide-react';
import { Translation } from '../../types';
import { VentilationElement, VentilationElementType } from '../../types/cabineMTVentilation';
import { useApp } from '../../context/AppContext';

interface AddElementModalProps {
  t: Translation['cabineMT'];
  onConfirm: (element: Omit<VentilationElement, 'id'>) => void;
  onClose: () => void;
  editingElement?: VentilationElement | null;
}

const INPUT_CLASS =
  'w-full bg-[#efefef] dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-2 text-xs font-bold outline-none dark:text-white transition-colors font-mono';

const TYPE_OPTIONS: { type: VentilationElementType; icon: React.ReactNode; label: string }[] = [
  { type: 'transformer', icon: <Zap size={14} />, label: 'Transformador' },
  { type: 'switchboard', icon: <LayoutDashboard size={14} />, label: 'Quadro (MT/BT)' },
];

export function AddElementModal({
  t,
  onConfirm,
  onClose,
  editingElement,
}: AddElementModalProps) {
  const { moduleTheme } = useApp();

  const [selectedType, setSelectedType] = useState<VentilationElementType>('transformer');
  const [label, setLabel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [powerKVA, setPowerKVA] = useState<number | ''>('');
  const [perdasKW, setPerdasKW] = useState<number | ''>('');
  const [numColumns, setNumColumns] = useState<number | ''>('');

  useEffect(() => {
    if (editingElement) {
      setSelectedType(editingElement.type);
      setLabel(editingElement.label);
      setQuantity(editingElement.quantity);
      setPowerKVA(editingElement.powerKVA ?? '');
      setPerdasKW(editingElement.perdasKW ?? '');
      setNumColumns(editingElement.numColumns ?? '');
    } else {
      setSelectedType('transformer');
      setLabel('TR1');
      setQuantity(1);
      setPowerKVA(630);
      setPerdasKW('');
      setNumColumns('');
    }
  }, [editingElement]);

  // Update default label when type changes (if adding new)
  useEffect(() => {
    if (!editingElement) {
      if (selectedType === 'transformer') setLabel('TR1');
      if (selectedType === 'switchboard') setLabel('QGBT Principal');
    }
  }, [selectedType, editingElement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const base: Omit<VentilationElement, 'id'> = {
      type: selectedType,
      label: label.trim(),
      quantity: Math.max(1, quantity),
    };

    if (selectedType === 'transformer') {
      if (!powerKVA) return;
      base.powerKVA = Number(powerKVA);
      base.perdasKW = perdasKW === '' ? undefined : Number(perdasKW);
    } else {
      if (!numColumns) return;
      base.numColumns = Number(numColumns);
    }

    onConfirm(base);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#f5f5f5] dark:bg-[#141414] shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: moduleTheme.accent }}
            >
              <Zap size={15} />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider dark:text-white">
              {editingElement ? t.editElement : t.addElementTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="add-element-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Type selector (only for new elements) */}
            {!editingElement && (
              <div>
                <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-2 dark:text-white">
                  Tipo de Elemento
                </label>
                <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded min-h-[40px]">
                  {TYPE_OPTIONS.map((opt) => {
                    const isSelected = selectedType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setSelectedType(opt.type)}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all flex-wrap content-center ${
                          isSelected
                            ? 'shadow bg-white dark:bg-[#1e1e1e] text-[#141414] dark:text-white'
                            : 'text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1.5 dark:text-white">
                Nomenclatura / Tag
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={INPUT_CLASS}
                style={{ '--tw-ring-color': moduleTheme.accent } as React.CSSProperties}
                placeholder={selectedType === 'transformer' ? "Ex: TR1" : "Ex: QGBT"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1.5 dark:text-white">
                  {t.quantity}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className={INPUT_CLASS}
                  style={{ '--tw-ring-color': moduleTheme.accent } as React.CSSProperties}
                />
              </div>

              {selectedType === 'transformer' && (
                <div>
                  <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1.5 dark:text-white">
                    Potência (kVA)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={powerKVA}
                    onChange={(e) => setPowerKVA(parseFloat(e.target.value) || '')}
                    className={INPUT_CLASS}
                    style={{ '--tw-ring-color': moduleTheme.accent } as React.CSSProperties}
                  />
                </div>
              )}

              {selectedType === 'switchboard' && (
                <div>
                  <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1.5 dark:text-white">
                    Número de Colunas/Células
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numColumns}
                    onChange={(e) => setNumColumns(parseInt(e.target.value) || '')}
                    className={INPUT_CLASS}
                    style={{ '--tw-ring-color': moduleTheme.accent } as React.CSSProperties}
                  />
                </div>
              )}
            </div>

            {selectedType === 'transformer' && (
              <div>
                <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1.5 dark:text-white">
                  Perdas Térmicas (kW) — <span className="opacity-60">Opcional</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={perdasKW}
                  onChange={(e) => setPerdasKW(parseFloat(e.target.value) || '')}
                  className={INPUT_CLASS}
                  style={{ '--tw-ring-color': moduleTheme.accent } as React.CSSProperties}
                  placeholder="Se vazio, estima-se 2,5% do kVA"
                />
                <p className="text-[9px] opacity-40 mt-1.5 dark:text-white">
                  Dado de datasheet. Se vazio, o motor de cálculo usará uma estimativa paramétrica de 2,5% da potência nominal.
                </p>
              </div>
            )}
            
            {selectedType === 'switchboard' && (
              <p className="text-[9px] opacity-40 mt-1 dark:text-white">
                O motor paramétrico calcula a dissipação de quadros assumindo uma constante normativa de 0.15 kW por coluna/célula instalada.
              </p>
            )}

          </form>
        </div>

        <div className="p-5 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#1a1a1a] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/60 dark:text-white/60 hover:text-[#141414] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            form="add-element-form"
            className="flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 shadow-md shadow-black/10"
            style={{ backgroundColor: moduleTheme.accent }}
          >
            <Check size={14} />
            {editingElement ? 'SALVAR' : 'ADICIONAR'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
