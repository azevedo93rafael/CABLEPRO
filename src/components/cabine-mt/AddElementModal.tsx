import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, LayoutDashboard, Cpu } from 'lucide-react';
import { Translation } from '../../types';
import { ThermalElement, ThermalElementType } from '../../types/cabineMTVentilation';

interface AddElementModalProps {
  t: Translation['cabineMT'];
  onConfirm: (element: Omit<ThermalElement, 'id'>) => void;
  onClose: () => void;
  editingElement?: ThermalElement | null;
}

const INPUT_CLASS =
  'w-full bg-[#f5f5f5] dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-2 text-xs font-bold outline-none dark:text-white focus:border-[#81292C] transition-colors font-mono';

const TYPE_OPTIONS: { type: ThermalElementType; icon: React.ReactNode; labelKey: 'transformer' | 'switchboardMT' | 'switchboardBT' }[] = [
  { type: 'transformer', icon: <Zap size={20} />, labelKey: 'transformer' },
  { type: 'switchboard_mt', icon: <LayoutDashboard size={20} />, labelKey: 'switchboardMT' },
  { type: 'switchboard_bt', icon: <Cpu size={20} />, labelKey: 'switchboardBT' },
];

export function AddElementModal({ t, onConfirm, onClose, editingElement }: AddElementModalProps) {
  const [selectedType, setSelectedType] = useState<ThermalElementType>(
    editingElement?.type || 'transformer',
  );
  const [label, setLabel] = useState(editingElement?.label || '');
  const [quantity, setQuantity] = useState(editingElement?.quantity ?? 1);
  const [powerKVA, setPowerKVA] = useState(editingElement?.powerKVA ?? 630);
  const [efficiencyPct, setEfficiencyPct] = useState(editingElement?.efficiencyPct ?? 98.5);
  const [dissipatedPowerW, setDissipatedPowerW] = useState(editingElement?.dissipatedPowerW ?? 3000);
  const [nominalCurrentA, setNominalCurrentA] = useState(editingElement?.nominalCurrentA ?? 0);

  const handleConfirm = () => {
    const base: Omit<ThermalElement, 'id'> = {
      type: selectedType,
      label: label.trim() || (selectedType === 'transformer' ? t.transformer : selectedType === 'switchboard_mt' ? t.switchboardMT : t.switchboardBT),
      quantity: Math.max(1, Math.round(quantity)),
    };
    if (selectedType === 'transformer') {
      onConfirm({ ...base, powerKVA, efficiencyPct });
    } else {
      onConfirm({ ...base, dissipatedPowerW, nominalCurrentA: nominalCurrentA || undefined });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative bg-white dark:bg-[#141414] border border-black/5 dark:border-white/10 shadow-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest dark:text-white">
              {t.addElementTitle}
            </p>
            <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors">
              <X size={16} className="opacity-50" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Type selector */}
            <div>
              <p className="text-[9px] font-bold opacity-40 tracking-widest uppercase mb-3">{t.chooseElementType}</p>
              <div className="grid grid-cols-3 gap-2">
                {TYPE_OPTIONS.map(({ type, icon, labelKey }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`flex flex-col items-center gap-2 p-3 border text-center transition-all ${
                      selectedType === type
                        ? 'bg-[#401318] text-white border-[#81292C]'
                        : 'border-black/10 dark:border-white/10 text-[#5a5a5a] dark:text-white/60 hover:border-[#81292C]/40'
                    }`}
                  >
                    {icon}
                    <span className="text-[8px] font-bold uppercase leading-tight">{t[labelKey]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold opacity-40 tracking-widest uppercase mb-1.5">{t.elementLabel}</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={selectedType === 'transformer' ? 'TR1' : selectedType === 'switchboard_mt' ? 'QMT1' : 'QGBT1'}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold opacity-40 tracking-widest uppercase mb-1.5">{t.quantity}</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* Type-specific fields */}
            {selectedType === 'transformer' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold opacity-40 tracking-widest uppercase mb-1.5">
                    {t.powerKVA} <span className="opacity-60">(kVA)</span>
                  </label>
                  <input
                    type="number" min={1} step={1} value={powerKVA}
                    onChange={(e) => setPowerKVA(parseFloat(e.target.value) || 630)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold opacity-40 tracking-widest uppercase mb-1.5">
                    {t.efficiency} <span className="opacity-60">(%)</span>
                  </label>
                  <input
                    type="number" min={80} max={99.9} step={0.1} value={efficiencyPct}
                    onChange={(e) => setEfficiencyPct(parseFloat(e.target.value) || 98.5)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold opacity-40 tracking-widest uppercase mb-1.5">
                    {t.dissipatedPower} <span className="opacity-60">(W)</span>
                  </label>
                  <input
                    type="number" min={0} step={100} value={dissipatedPowerW}
                    onChange={(e) => setDissipatedPowerW(parseFloat(e.target.value) || 0)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold opacity-40 tracking-widest uppercase mb-1.5">
                    {t.nominalCurrent} <span className="opacity-60">(A — {t.nominalCurrentOptional})</span>
                  </label>
                  <input
                    type="number" min={0} step={1} value={nominalCurrentA || ''}
                    onChange={(e) => setNominalCurrentA(parseFloat(e.target.value) || 0)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 pb-5">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-[9px] font-bold uppercase tracking-widest border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors dark:text-white"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 text-[9px] font-bold uppercase tracking-widest bg-[#81292C] text-white hover:bg-[#6A2023] transition-colors"
            >
              {t.confirm}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
