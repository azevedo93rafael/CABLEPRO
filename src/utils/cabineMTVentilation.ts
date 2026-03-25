// ─────────────────────────────────────────────────────────────────────────────
// Módulo Cabine MT — Motor de Cálculo de Ventilação / Extração de Ar
// Referências: ASHRAE Fundamentals, ISO 9241, VDI 2078
// ─────────────────────────────────────────────────────────────────────────────

import {
  ThermalElement,
  CabineDimensions,
  VentilationResults,
  ElementBreakdown,
} from '../types/cabineMTVentilation';

// ── Constantes físicas ────────────────────────────────────────────────────────
const RHO_AIR = 1.2;       // kg/m³  — densidade do ar a 20°C e 1 atm
const CP_AIR  = 1005;      // J/(kg·K) — calor específico do ar seco
const BTU_PER_WATT = 3.412; // 1 W = 3.412 BTU/h

// ΔT padrão entre temperatura interior e exterior (cabine fechada com ar forçado)
// Valor padrão conservativo conforme norma VDI 2078: 15 K
const DEFAULT_DELTA_T_C = 15;

/**
 * Calcula a dissipação térmica (W) de um único elemento por unidade.
 */
export function calcElementHeatPerUnit(el: ThermalElement): number {
  if (el.type === 'transformer') {
    // P_loss = P_nominal(W) × (1 - η/100)
    const kva = el.powerKVA ?? 630;
    const eta = (el.efficiencyPct ?? 98.5) / 100;
    return kva * 1000 * (1 - eta);
  }
  // Para quadros MT/BT: dissipação inserida diretamente pelo usuário
  return el.dissipatedPowerW ?? 0;
}

/**
 * Calcula os resultados completos de ventilação para um conjunto de
 * elementos térmicos e dimensões de cabine.
 *
 * Fórmulas:
 *   Q_total (W)   = Σ [ heatPerUnit_i × qty_i ]
 *   BTU/h         = Q_total × 3.412
 *   Q_ar (m³/h)   = Q_total / (ρ × Cp × ΔT) × 3600
 *   V_cabine (m³) = H × L × C
 */
export function calculateVentilation(
  elements: ThermalElement[],
  dimensions: CabineDimensions,
  deltaTCelsius: number = DEFAULT_DELTA_T_C,
): VentilationResults | null {
  if (elements.length === 0) return null;

  const breakdown: ElementBreakdown[] = elements.map((el) => {
    const heatPerUnit = calcElementHeatPerUnit(el);
    return {
      id: el.id,
      label: el.label || el.type,
      type: el.type,
      heatPerUnitW: heatPerUnit,
      totalHeatW: heatPerUnit * el.quantity,
      quantity: el.quantity,
    };
  });

  const totalHeatW = breakdown.reduce((sum, b) => sum + b.totalHeatW, 0);
  const btuPerHour = totalHeatW * BTU_PER_WATT;

  // Q_ar = P_total / (ρ × Cp × ΔT) × 3600    [m³/h]
  const airflowM3h = (totalHeatW / (RHO_AIR * CP_AIR * deltaTCelsius)) * 3600;

  const cabineVolumeM3 =
    (dimensions.heightM ?? 0) *
    (dimensions.widthM ?? 0) *
    (dimensions.lengthM ?? 0);

  return {
    totalHeatW,
    btuPerHour,
    airflowM3h,
    cabineVolumeM3,
    deltaTUsedC: deltaTCelsius,
    breakdown,
  };
}

/** Formata W com unidade adequada (W ou kW). */
export function formatPower(watts: number): string {
  return watts >= 1000
    ? `${(watts / 1000).toFixed(2)} kW`
    : `${watts.toFixed(0)} W`;
}
