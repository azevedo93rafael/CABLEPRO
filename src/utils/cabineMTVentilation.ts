// ─────────────────────────────────────────────────────────────────────────────
// Módulo Cabine MT — Motor de Cálculo de Ventilação Paramétrico
//
// MÉTODO: Carga Térmica Paramétrica por Parcelas
// ─────────────────────────────────────────────────────────────────────────────
// Parcelas de carga:
//   P_env      = 0.08 kW/m³ × Volume          (carga solar/envoltória)
//   P_pessoas  = 0.30 kW                       (fixo, 2 pessoas)
//   P_trafo    = Σ [perdas_kW_i × qty_i]       (perdas = perdasKW ?? kVA×0.025)
//   P_quadros  = N_colunas × 0.15 kW           (células/colunas)
//   P_total    = P_env + P_pessoas + P_trafo + P_quadros
//
// Resultados derivados:
//   Portata (m³/h) = P_total [kW] × 200
//   BTU/h          = P_total [kW] × 3412.14
// ─────────────────────────────────────────────────────────────────────────────

import {
  VentilationTransformer,
  VentilationInputs,
  VentilationResults,
  CabineDimensions,
} from '../types/cabineMTVentilation';

// ── Constantes do método ────────────────────────────────────────────────────
const P_ENV_KW_PER_M3   = 0.08;   // kW/m³ — carga de envoltória/solar
const P_PESSOAS_KW      = 0.30;   // kW    — 2 pessoas (fixo)
const TRAFO_LOSS_PCT     = 0.025;  // 2,5%  — perdas padrão quando não fornecidas
const P_COLUMN_KW        = 0.15;   // kW/coluna — dissipaçao por coluna de quadro
const AIRFLOW_FACTOR     = 200;    // m³/h por kW (ΔT = 15 K assumido)
const BTU_PER_KW         = 3412.14;
const DELTA_T_K          = 15;

// ── Cálculo de perdas por transformador (por unidade) ──────────────────────
export function calcTrafoLossPerUnit(tr: VentilationTransformer): number {
  if (tr.perdasKW !== undefined && tr.perdasKW > 0) {
    return tr.perdasKW; // dado de datasheet — usar diretamente
  }
  return tr.powerKVA * TRAFO_LOSS_PCT; // estimativa: 2,5% da potência nominal
}

// ── Cálculo principal ────────────────────────────────────────────────────────
export function calculateVentilation(
  inputs: VentilationInputs,
): VentilationResults | null {
  const { transformers, numSwitchboardColumns, dimensions } = inputs;

  // Volume
  const V = dimensions.heightM * dimensions.widthM * dimensions.lengthM;

  // Parcela 1 — Envoltória / Solar
  const pEnvKW = P_ENV_KW_PER_M3 * V;

  // Parcela 2 — Ocupação (fixo)
  const pPessoasKW = P_PESSOAS_KW;

  // Parcela 3 — Transformadores
  const trafoBreakdown = transformers.map((tr) => {
    const perdasKWPerUnit = calcTrafoLossPerUnit(tr);
    return {
      id: tr.id,
      label: tr.label,
      quantity: tr.quantity,
      powerKVA: tr.powerKVA,
      perdasKWPerUnit,
      totalKW: perdasKWPerUnit * tr.quantity,
    };
  });
  const pTrafoKW = trafoBreakdown.reduce((sum, t) => sum + t.totalKW, 0);

  // Parcela 4 — Quadros (colunas/células)
  const pQuadrosKW = (numSwitchboardColumns ?? 0) * P_COLUMN_KW;

  // Carga total
  const totalHeatKW = pEnvKW + pPessoasKW + pTrafoKW + pQuadrosKW;

  // Resultados derivados
  const btuPerHour   = totalHeatKW * BTU_PER_KW;
  const airflowM3h   = totalHeatKW * AIRFLOW_FACTOR;

  const loadBreakdown = [
    { label: 'P_env',     valueKW: pEnvKW     },
    { label: 'P_pessoas', valueKW: pPessoasKW },
    { label: 'P_trafo',   valueKW: pTrafoKW   },
    { label: 'P_quadros', valueKW: pQuadrosKW },
  ];

  return {
    pEnvKW,
    pPessoasKW,
    pTrafoKW,
    pQuadrosKW,
    totalHeatKW,
    totalHeatW: totalHeatKW * 1000,
    btuPerHour,
    airflowM3h,
    cabineVolumeM3: V,
    deltaTUsedC: DELTA_T_K,
    trafoBreakdown,
    loadBreakdown,
  };
}

/** Formata kW com unidade adequada. */
export function formatPower(kw: number): string {
  return kw >= 1 ? `${kw.toFixed(2)} kW` : `${(kw * 1000).toFixed(0)} W`;
}

// ── Exported constants (used by Report) ────────────────────────────────────
export const VENTILATION_CONSTANTS = {
  P_ENV_KW_PER_M3,
  P_PESSOAS_KW,
  TRAFO_LOSS_PCT,
  P_COLUMN_KW,
  AIRFLOW_FACTOR,
  BTU_PER_KW,
  DELTA_T_K,
};
