// ─────────────────────────────────────────────────────────────────────────────
// Módulo Cabine MT — Motor de Cálculo de Ventilação Paramétrico
//
// MÉTODO: Carga Térmica Paramétrica por Parcelas
// ─────────────────────────────────────────────────────────────────────────────

import {
  VentilationElement,
  VentilationInputs,
  VentilationResults,
} from '../types/cabineMTVentilation';

// ── Constantes do método ────────────────────────────────────────────────────
const P_ENV_KW_PER_M3   = 0.08;   // kW/m³
const P_PESSOAS_KW      = 0.30;   // kW (fixo)
const TRAFO_LOSS_PCT     = 0.025;  // 2,5%
const P_COLUMN_KW        = 0.15;   // kW/coluna
const AIRFLOW_FACTOR     = 200;    // m³/h por kW
const BTU_PER_KW         = 3412.14;
const DELTA_T_K          = 15;

export function calcTrafoLossPerUnit(tr: VentilationElement): number {
  if (tr.perdasKW !== undefined && tr.perdasKW > 0) return tr.perdasKW;
  return (tr.powerKVA ?? 0) * TRAFO_LOSS_PCT;
}

export function calculateVentilation(
  inputs: VentilationInputs,
): VentilationResults | null {
  const { elements, dimensions } = inputs;
  const V = dimensions.heightM * dimensions.widthM * dimensions.lengthM;

  // 1. Envoltória
  const pEnvKW = P_ENV_KW_PER_M3 * V;

  // 2. Ocupação
  const pPessoasKW = P_PESSOAS_KW;

  // 3. Transformadores
  const trafos = elements.filter(e => e.type === 'transformer');
  const trafoBreakdown = trafos.map((tr) => {
    const perdasKWPerUnit = calcTrafoLossPerUnit(tr);
    return {
      id: tr.id,
      label: tr.label,
      quantity: tr.quantity,
      powerKVA: tr.powerKVA ?? 0,
      perdasKWPerUnit,
      totalKW: perdasKWPerUnit * tr.quantity,
    };
  });
  const pTrafoKW = trafoBreakdown.reduce((sum, t) => sum + t.totalKW, 0);

  // 4. Quadros
  const quadros = elements.filter(e => e.type === 'switchboard');
  const quadrosBreakdown = quadros.map((q) => {
    const cols = q.numColumns ?? 0;
    const totalKW = cols * P_COLUMN_KW * q.quantity;
    return {
      id: q.id,
      label: q.label,
      quantity: q.quantity,
      numColumns: cols,
      totalKW,
    };
  });
  const pQuadrosKW = quadrosBreakdown.reduce((sum, q) => sum + q.totalKW, 0);

  // Total
  const totalHeatKW = pEnvKW + pPessoasKW + pTrafoKW + pQuadrosKW;
  const btuPerHour   = totalHeatKW * BTU_PER_KW;
  const airflowM3h   = totalHeatKW * AIRFLOW_FACTOR;

  const loadBreakdown = [
    { label: 'pEnvLabel',     valueKW: pEnvKW     },
    { label: 'pPessoasLabel', valueKW: pPessoasKW },
    { label: 'pTrafoLabel',   valueKW: pTrafoKW   },
    { label: 'pQuadrosLabel', valueKW: pQuadrosKW },
  ];

  return {
    pEnvKW, pPessoasKW, pTrafoKW, pQuadrosKW,
    totalHeatKW, totalHeatW: totalHeatKW * 1000,
    btuPerHour, airflowM3h, cabineVolumeM3: V, deltaTUsedC: DELTA_T_K,
    trafoBreakdown, quadrosBreakdown, loadBreakdown,
  };
}

export function formatPower(kw: number): string {
  return kw >= 1 ? `${kw.toFixed(2)} kW` : `${(kw * 1000).toFixed(0)} W`;
}

export const VENTILATION_CONSTANTS = {
  P_ENV_KW_PER_M3, P_PESSOAS_KW, TRAFO_LOSS_PCT, P_COLUMN_KW, AIRFLOW_FACTOR, BTU_PER_KW, DELTA_T_K,
};
