import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowLeft, FileDown, BookOpen } from 'lucide-react';
import { Translation } from '../../types';
import { CabineMTInputs, CabineMTResults } from '../../types/cabineMT';
import { calculateCabineMT } from '../../utils/cabineMTCalculations';

interface InputPanelProps {
  t: Translation['cabineMT'];
  inputs: CabineMTInputs;
  onChange: (field: keyof CabineMTInputs, value: number | string) => void;
}

const LABEL_CLASS = 'block text-[9px] font-bold opacity-40 tracking-widest uppercase mb-1.5';
const INPUT_CLASS =
  'w-full bg-[#efefef] dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-2 text-xs font-bold outline-none dark:text-white focus:border-[#81292C] transition-colors font-mono';
const INPUT_ERROR_CLASS =
  'w-full bg-[#efefef] dark:bg-white/5 border border-[#81292C] px-3 py-2 text-xs font-bold outline-none dark:text-white font-mono';

function InputField({
  label,
  hint,
  unit,
  error,
  children,
}: {
  label: string;
  hint?: string;
  unit?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className={LABEL_CLASS}>
          {label}
          {unit && <span className="ml-1 opacity-60">({unit})</span>}
        </label>
        {hint && <span className="text-[9px] text-[#81292C] font-bold tracking-widest">{hint}</span>}
      </div>
      {children}
      {error && (
        <AnimatePresence>
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[9px] text-[#81292C] font-bold"
          >
            {error}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}

export function InputPanel({ t, inputs, onChange }: InputPanelProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof CabineMTInputs, string>>>({});

  const validate = useCallback(
    (field: keyof CabineMTInputs, value: number | string) => {
      let error = '';
      const num = Number(value);
      if (field === 'numTransformers') {
        if (!Number.isInteger(num) || num < 1) error = t.mustBeInteger;
      } else if (field === 'shortCircuitVoltagePct') {
        if (isNaN(num) || num <= 0 || num >= 100) error = t.invalidInput;
      } else if (field === 'conductorMaterial') {
        error = '';
      } else {
        if (isNaN(num) || num <= 0) error = t.mustBePositive;
      }
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [t],
  );

  const handleChange = (field: keyof CabineMTInputs, value: number | string) => {
    validate(field, value);
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      {/* Group 1: Transformer */}
      <div>
        <p className="text-[9px] font-black tracking-widest uppercase opacity-30 mb-3 flex items-center gap-2">
          <span className="inline-block w-4 h-px bg-current" />
          Transformador / Transformer
        </p>
        <div className="space-y-4">
          <InputField label={t.numTransformers} unit="un" error={errors.numTransformers}>
            <input
              id="cmt-num-transformers"
              type="number"
              min={1}
              step={1}
              value={inputs.numTransformers}
              onChange={(e) => handleChange('numTransformers', parseInt(e.target.value) || 1)}
              className={errors.numTransformers ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </InputField>

          <InputField label={t.powerKVA} unit={t.unitKVA} error={errors.powerKVA}>
            <input
              id="cmt-power-kva"
              type="number"
              min={1}
              step={1}
              value={inputs.powerKVA}
              onChange={(e) => handleChange('powerKVA', parseFloat(e.target.value) || 0)}
              className={errors.powerKVA ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </InputField>

          <div className="grid grid-cols-2 gap-4">
            <InputField label={t.primaryVoltageKV} unit={t.unitKV} error={errors.primaryVoltageKV}>
              <input
                id="cmt-primary-voltage"
                type="number"
                min={0.001}
                step={0.1}
                value={inputs.primaryVoltageKV}
                onChange={(e) => handleChange('primaryVoltageKV', parseFloat(e.target.value) || 0)}
                className={errors.primaryVoltageKV ? INPUT_ERROR_CLASS : INPUT_CLASS}
              />
            </InputField>

            <InputField
              label={t.secondaryVoltageV}
              unit={t.unitV}
              error={errors.secondaryVoltageV}
            >
              <input
                id="cmt-secondary-voltage"
                type="number"
                min={1}
                step={1}
                value={inputs.secondaryVoltageV}
                onChange={(e) =>
                  handleChange('secondaryVoltageV', parseFloat(e.target.value) || 0)
                }
                className={errors.secondaryVoltageV ? INPUT_ERROR_CLASS : INPUT_CLASS}
              />
            </InputField>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-black/5 dark:border-white/5" />

      {/* Group 2: Protection parameters */}
      <div>
        <p className="text-[9px] font-black tracking-widest uppercase opacity-30 mb-3 flex items-center gap-2">
          <span className="inline-block w-4 h-px bg-current" />
          Proteção / Protection
        </p>
        <div className="space-y-4">
          <InputField
            label={t.shortCircuitVoltagePct}
            unit={t.unitPct}
            hint={t.shortCircuitVoltageDefault}
            error={errors.shortCircuitVoltagePct}
          >
            <input
              id="cmt-ucc"
              type="number"
              min={0.1}
              max={99}
              step={0.1}
              value={inputs.shortCircuitVoltagePct}
              onChange={(e) =>
                handleChange('shortCircuitVoltagePct', parseFloat(e.target.value) || 0)
              }
              className={errors.shortCircuitVoltagePct ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </InputField>

          <InputField label={t.faultTimeS} unit={t.unitS} error={errors.faultTimeS}>
            <select
              id="cmt-fault-time"
              value={inputs.faultTimeS}
              onChange={(e) => handleChange('faultTimeS', parseFloat(e.target.value))}
              className={INPUT_CLASS + ' cursor-pointer dark:bg-[#141414]'}
            >
              <option value={0.1}>0.1 s</option>
              <option value={0.2}>0.2 s</option>
              <option value={0.3}>0.3 s</option>
              <option value={0.4}>0.4 s</option>
              <option value={0.5}>0.5 s</option>
              <option value={1}>1 s</option>
              <option value={3}>3 s</option>
              <option value={5}>5 s</option>
            </select>
          </InputField>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-black/5 dark:border-white/5" />

      {/* Group 3: Conductor */}
      <div>
        <p className="text-[9px] font-black tracking-widest uppercase opacity-30 mb-3 flex items-center gap-2">
          <span className="inline-block w-4 h-px bg-current" />
          Condutor / Conductor
        </p>
        <InputField label={t.conductorMaterial}>
          <div className="flex gap-3">
            {(['copper', 'aluminum'] as const).map((mat) => (
              <button
                key={mat}
                id={`cmt-material-${mat}`}
                type="button"
                onClick={() => handleChange('conductorMaterial', mat)}
                className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all ${
                  inputs.conductorMaterial === mat
                    ? 'bg-[#81292C] text-white border-[#81292C]'
                    : 'bg-transparent text-[#5a5a5a] border-black/10 dark:text-white/60 dark:border-white/10 hover:border-[#81292C]/40'
                }`}
              >
                {mat === 'copper' ? t.copper : t.aluminum}
              </button>
            ))}
          </div>
        </InputField>
      </div>
    </div>
  );
}
