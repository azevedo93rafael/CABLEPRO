import React from 'react';
import { motion } from 'motion/react';
import { Layers, FileText, Zap, ArrowRight, CheckCircle2, Globe } from 'lucide-react';
import { Translation, Language } from '../types';
import { MODULE_THEMES } from '../config/moduleThemes';

interface ModuleSelectorProps {
  onSelect: (module: 'cablefill' | 'capitolato' | 'cabine-mt') => void;
  t: Translation;
  lang: Language;
  setLang: (lang: Language) => void;
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
  lang,
  setLang,
  allowedModules = ['cablefill', 'capitolato', 'cabine-mt'],
}: ModuleSelectorProps) {
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

  const languages: { code: Language; label: string }[] = [
    { code: 'it', label: 'IT' },
    { code: 'pt-BR', label: 'PT' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <div className="min-h-screen bg-midnight text-midnight-text flex flex-col items-center justify-center p-8 transition-colors overflow-hidden relative">
      
      {/* ── Ambient Background Elements ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Language Switcher ───────────────────────────────────────────────── */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1">
        <Globe size={14} className="text-white/40 ml-2" />
        {languages.map((langOption) => (
          <button
            key={langOption.code}
            onClick={() => setLang(langOption.code)}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${
              lang === langOption.code
                ? 'bg-[#81292C] text-white'
                : 'text-white/40 hover:text-white hover:bg-white/10'
            }`}
          >
            {langOption.label}
          </button>
        ))}
      </div>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="text-center mb-16 relative z-10"
      >
        <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40 mb-4 font-outfit">
          RILO ELETTRICO • ENGINEERING PLATFORM
        </p>
        <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight mb-4 drop-shadow-2xl">
          {t.selector.chooseModule}
        </h1>
        <div className="w-20 h-0.5 mx-auto rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>

      {/* ── Cards Container ─────────────────────────────────────────────────── */}
      <div
        className={`grid gap-8 w-full relative z-10 ${
          visible.length === 1
            ? 'max-w-md mx-auto'
            : visible.length === 2
            ? 'md:grid-cols-2 max-w-4xl mx-auto'
            : 'lg:grid-cols-3 max-w-6xl mx-auto'
        }`}
      >
        {visible.map((mod, i) => {
          const Icon = mod.icon;
          const { primary, accent } = mod.theme;
          const features = getFeatures(mod);
          
          // Stagger effect: middle card is slightly higher on large screens
          const isMiddle = i === 1 && visible.length === 3;

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: isMiddle ? -12 : 0 }}
              transition={{ 
                delay: i * 0.15, 
                duration: 0.8, 
                ease: [0.23, 1, 0.32, 1],
                y: { duration: 1.2 } 
              }}
              whileHover={{ y: isMiddle ? -24 : -12 }}
              className="flex flex-col h-full"
            >
              <div className="group relative bg-[#1A1A1A]/40 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden flex flex-col h-full transition-all duration-500 hover:border-white/20 hover:bg-[#1A1A1A]/60 shadow-2xl">
                
                {/* Accent Glow Top Right */}
                <div 
                  className="absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                  style={{ backgroundColor: accent }}
                />

                {/* Top section */}
                <div className="p-10 flex-1 relative z-10">
                  <div className="flex items-start justify-between mb-10">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
                      style={{ 
                        background: `linear-gradient(135deg, ${accent}, ${primary})`,
                        boxShadow: `0 8px 24px ${accent}40`
                      }}
                    >
                      <Icon size={26} strokeWidth={1.5} />
                    </div>
                  </div>

                  <h2 className="text-3xl font-display font-bold text-white mb-4 leading-tight">
                    {mod.title}
                  </h2>

                  <p className="text-[14px] font-sans text-white/50 leading-relaxed mb-8 group-hover:text-white/70 transition-colors">
                    {getDesc(mod)}
                  </p>

                  <div className="space-y-3">
                    {features.map((feat) => (
                      <div key={feat} className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 group-hover:border-white/20 transition-all"
                        >
                          <CheckCircle2 size={12} style={{ color: accent }} />
                        </div>
                        <span
                          className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/60 group-hover:text-white/90 font-outfit"
                        >
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Launch button area */}
                <div className="px-10 pb-10 relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(mod.id)}
                    className="w-full group/btn flex items-center justify-between pl-6 pr-5 py-4 text-white text-[12px] font-black tracking-widest uppercase rounded-2xl transition-all duration-300 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${primary}, ${accent})`,
                      boxShadow: `0 10px 30px ${primary}40`,
                    }}
                  >
                    <span className="relative z-10">{launchLabel}</span>
                    <div className="relative z-10 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover/btn:bg-white/20 transition-colors">
                      <ArrowRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </div>
                    
                    {/* Hover Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-16 text-[10px] font-bold tracking-[0.5em] uppercase text-white/20 relative z-10 font-outfit"
      >
        RILO ELETTRICO SYSTEM • 2025 EDITION
      </motion.footer>
    </div>
  );
}
