import React from 'react';
import { motion } from 'motion/react';
import { Layers, FileText, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Translation } from '../types';
import { MODULE_THEMES } from '../config/moduleThemes';

interface ModuleSelectorProps {
  onSelect: (module: 'cablefill' | 'capitolato' | 'cabine-mt') => void;
  t: Translation;
  allowedModules?: string[];
}

// ── Per-module static config ───────────────────────────────────────────────────
const MODULE_CONFIG = [
  {
    id: 'cablefill' as const,
    icon: Layers,
    title: 'CableFill Pro',
    descKey: 'cableFillDesc' as const,
    features: {
      'pt-BR': ['MODELAGEM TÉRMICA', 'CONFORMIDADE IEC 60364-5'],
      en:      ['THERMAL MODELING', 'IEC 60364-5 COMPLIANCE'],
      it:      ['MODELLAZIONE TERMICA', 'CONFORMITÀ IEC 60364-5'],
    },
    theme: MODULE_THEMES['cablefill'],
  },
  {
    id: 'capitolato' as const,
    icon: FileText,
    title: 'Capitolato Pro',
    descKey: 'capitolatoDesc' as const,
    features: {
      'pt-BR': ['SINCRONIZAÇÃO DE QUANTITATIVOS', 'TEMPLATES MULTI-FORNECEDOR'],
      en:      ['AUTO-QUANTITY SYNC', 'MULTI-VENDOR TEMPLATES'],
      it:      ['SYNC QUANTITÀ AUTO', 'TEMPLATE MULTI-FORNITORE'],
    },
    theme: MODULE_THEMES['capitolato'],
  },
  {
    id: 'cabine-mt' as const,
    icon: Zap,
    title: 'Cabine MT',
    descKey: 'cabineMTDesc' as const,
    features: {
      'pt-BR': ['MAPEAMENTO DE ATERRAMENTO', 'DISSIPAÇÃO TÉRMICA'],
      en:      ['GROUNDING MAPPING', 'THERMAL DISSIPATION'],
      it:      ['MAPPATURA MESSA A TERRA', 'DISSIPAZIONE TERMICA'],
    },
    theme: MODULE_THEMES['cabine-mt'],
  },
];

// ── Label localisation ─────────────────────────────────────────────────────────
function getLaunchLabel(lang: string) {
  if (lang === 'pt-BR') return 'ACESSAR MÓDULO';
  if (lang === 'it')    return 'ACCEDI AL MODULO';
  return 'LAUNCH MODULE';
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ModuleSelector({
  onSelect,
  t,
  allowedModules = ['cablefill', 'capitolato'],
}: ModuleSelectorProps) {
  // Infer language from t.selector keys— simpler: detect from document or pass lang
  // We can detect from 'enter' key value in translation
  const lang = t.selector.enter === 'Accedi' ? 'it' : t.selector.enter === 'Enter' ? 'en' : 'pt-BR';

  const visible = MODULE_CONFIG.filter((m) => allowedModules.includes(m.id));

  const getDesc = (mod: typeof MODULE_CONFIG[0]) => {
    if (mod.id === 'cablefill')   return t.selector.cableFillDesc;
    if (mod.id === 'capitolato')  return t.selector.capitolatoDesc;
    return t.cabineMT.moduleDesc;
  };

  const getFeatures = (mod: typeof MODULE_CONFIG[0]): string[] => {
    return mod.features[lang as keyof typeof mod.features] ?? mod.features['en'];
  };

  const launchLabel = getLaunchLabel(lang);

  return (
    <div className="min-h-screen bg-[#f0f0f0] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-8 transition-colors">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="text-center mb-14"
      >
        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 dark:text-white/30 mb-3">
          RILO ELETTRICO — ENGINEERING SOFTWARE
        </p>
        <h1 className="text-4xl font-bold text-[#141414] dark:text-white tracking-tight mb-3">
          {t.selector.chooseModule}
        </h1>
        <div className="w-12 h-1 mx-auto rounded-full bg-black/10 dark:bg-white/10" />
      </motion.div>

      {/* ── Cards ───────────────────────────────────────────────────────────── */}
      <div
        className={`grid gap-6 w-full ${
          visible.length === 1
            ? 'max-w-sm mx-auto'
            : visible.length === 2
            ? 'md:grid-cols-2 max-w-2xl mx-auto'
            : 'md:grid-cols-3 max-w-5xl mx-auto'
        }`}
      >
        {visible.map((mod, i) => {
          const Icon = mod.icon;
          const { primary, accent } = mod.theme;
          const features = getFeatures(mod);

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="group bg-white dark:bg-[#141414] rounded-2xl border border-black/8 dark:border-white/5 shadow-lg shadow-black/5 overflow-hidden flex flex-col h-full hover:shadow-xl hover:shadow-black/10 transition-all duration-300">

                {/* Top section */}
                <div className="p-8 flex-1">
                  {/* Icon + decorative element */}
                  <div className="flex items-start justify-between mb-7">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: accent }}
                    >
                      <Icon size={22} />
                    </div>
                    {/* Decorative square — lighter accent */}
                    <div
                      className="w-10 h-10 rounded-lg opacity-15"
                      style={{ backgroundColor: accent }}
                    />
                  </div>

                  {/* Title */}
                  <h2 className="text-[22px] font-bold text-[#141414] dark:text-white mb-3 leading-tight">
                    {mod.title}
                  </h2>

                  {/* Description */}
                  <p className="text-[13px] text-black/50 dark:text-white/50 leading-relaxed mb-6">
                    {getDesc(mod)}
                  </p>

                  {/* Feature bullets */}
                  <div className="space-y-2">
                    {features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${accent}18` }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                        </div>
                        <span
                          className="text-[10px] font-bold tracking-widest uppercase"
                          style={{ color: accent }}
                        >
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Launch button */}
                <div className="px-8 pb-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelect(mod.id)}
                    className="w-full flex items-center justify-center gap-3 py-3.5 text-white text-[11px] font-black tracking-widest uppercase rounded-xl transition-all duration-200 hover:opacity-90 shadow-lg"
                    style={{
                      backgroundColor: primary,
                      boxShadow: `0 4px 20px ${primary}40`,
                    }}
                  >
                    <span>{launchLabel}</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-[10px] font-bold tracking-widest uppercase text-black/20 dark:text-white/20"
      >
        Rilo Elettrico · Engineering Platform
      </motion.p>
    </div>
  );
}
