import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useCabineMT } from '../../context/CabineMTContext';
import { LocalTIInputs } from '../../types/cabineMT';
import { calculateLocalTI } from '../../utils/localTISizing';
import { TRANSLATIONS } from '../../constants';
import { 
  Server, 
  Maximize, 
  Zap, 
  Thermometer, 
  AlertTriangle,
  Activity,
  Box
} from 'lucide-react';

const LocalTITab: React.FC = () => {
  const { lang } = useApp();
  const { activeProject, updateLocalTI } = useCabineMT();
  const t = TRANSLATIONS[lang].cabineMT;

  const inputs = activeProject?.inputs.localTI || { quantidade_racks: 0 };
  
  const results = useMemo(() => {
    return calculateLocalTI(inputs);
  }, [inputs]);

  const handleInputChange = (field: keyof LocalTIInputs, value: string) => {
    const val = parseFloat(value) || 0;
    updateLocalTI({ ...inputs, [field]: Math.max(0, val) });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Input Section */}
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            {t.inputParameters}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Racks */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-tight">
              {t.racksQuantity}
            </label>
            <div className="relative">
              <input
                type="number"
                value={inputs.quantidade_racks || ''}
                onChange={(e) => handleInputChange('quantidade_racks', e.target.value)}
                placeholder="0"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                UN
              </div>
            </div>
          </div>

          {/* Dimensions Header */}
          <div className="md:col-span-2">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
               {t.roomDimensions}
             </h4>
          </div>

          {/* Width */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              {t.widthLabel}
            </label>
            <input
              type="number"
              value={inputs.largura_m || ''}
              onChange={(e) => handleInputChange('largura_m', e.target.value)}
              placeholder="0.00"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Length */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              {t.lengthLabel}
            </label>
            <input
              type="number"
              value={inputs.comprimento_m || ''}
              onChange={(e) => handleInputChange('comprimento_m', e.target.value)}
              placeholder="0.00"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              {t.heightLabel}
            </label>
            <input
              type="number"
              value={inputs.altura_m || ''}
              onChange={(e) => handleInputChange('altura_m', e.target.value)}
              placeholder="3.00"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Volume Card */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-center gap-3 mb-3">
            <Box className="w-5 h-5 text-indigo-500" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t.volumeLabel}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {results.volume_m3.toFixed(1)} <span className="text-sm font-medium text-slate-500">{t.unitM3}</span>
          </div>
        </div>

        {/* Area Card */}
        <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-3 mb-3">
            <Maximize className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t.estimatedArea}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {results.area_estimada_m2.toFixed(1)} <span className="text-sm font-medium text-slate-500">{t.unitMM2.replace('mm²', 'm²')}</span>
          </div>
        </div>

        {/* UPS Card */}
        <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">{t.upsCapacity}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {results.capacidade_ups_recomendada_kVA.toFixed(1)} <span className="text-sm font-medium text-slate-500">{t.unitKVA}</span>
          </div>
        </div>

        {/* Cooling kW Card */}
        <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-3 mb-3">
            <Thermometer className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t.coolingRequiredkW}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {results.ar_condicionado.potencia_necessaria_kW.toFixed(1)} <span className="text-sm font-medium text-slate-500">{t.unitKW}</span>
          </div>
        </div>

        {/* Cooling BTU Card */}
        <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t.coolingRequiredBTU}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.round(results.ar_condicionado.potencia_necessaria_BTU).toLocaleString()} <span className="text-sm font-medium text-slate-500">{t.unitBTU}</span>
          </div>
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Thermometer className="w-4 h-4" />
          {t.thermalBreakdown}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">{t.volumeLabel}</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{results.volume_m3.toFixed(2)} {t.unitM3}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">{t.rackConsumptionLabel}</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{results.consumo_racks_kW.toFixed(2)} {t.unitKW}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">{t.pEnvLabel}</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{results.carga_termica_ambiental_Q2_kW.toFixed(2)} {t.unitKW}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">{t.efficiency} (Redundancy)</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{results.ar_condicionado.redundancia_aplicada}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">{t.totalHeat}</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{results.ar_condicionado.potencia_necessaria_kW.toFixed(2)} {t.unitKW}</span>
          </div>
        </div>
      </div>

      {/* Normative Alert */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-4">
        <div className="p-2 bg-amber-500/10 rounded-lg mt-1 shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h5 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight mb-1">
            {t.normativeReference} - ASHRAE TC 9.9
          </h5>
          <p className="text-sm text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
            {t.ashraeAlert}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocalTITab;
