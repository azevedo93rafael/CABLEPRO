// ─────────────────────────────────────────────────────────────────────────────
// Módulo Cabine MT — Tipos para cálculo de ventilação / extração de ar
// ─────────────────────────────────────────────────────────────────────────────

export type ThermalElementType = 'transformer' | 'switchboard_mt' | 'switchboard_bt';

/**
 * Elemento gerador de calor dentro da cabine.
 */
export interface ThermalElement {
  id: string;
  type: ThermalElementType;
  /** Rótulo livre definido pelo usuário (ex: "TR1", "QGBT Principal") */
  label: string;
  /** Quantidade de unidades iguais */
  quantity: number;

  // ── Campos para Transformador ──────────────────────────────────────────────
  /** Potência nominal (kVA) — apenas para type = 'transformer' */
  powerKVA?: number;
  /** Rendimento em % (default 98.5) — apenas para type = 'transformer' */
  efficiencyPct?: number;

  // ── Campos para Quadros (MT / BT) ─────────────────────────────────────────
  /** Potência dissipada (W) — apenas para type = 'switchboard_mt' | 'switchboard_bt' */
  dissipatedPowerW?: number;
  /** Corrente nominal (A) — campo informativo opcional */
  nominalCurrentA?: number;
}

/**
 * Dimensões físicas da cabine (metro).
 */
export interface CabineDimensions {
  heightM: number;
  widthM: number;
  lengthM: number;
}

/**
 * Resultados do cálculo de ventilação.
 */
export interface VentilationResults {
  /** Calor total dissipado por todos os elementos (W) */
  totalHeatW: number;
  /** Potência de climatização necessária (BTU/h) */
  btuPerHour: number;
  /** Portata de ar necessária (m³/h) */
  airflowM3h: number;
  /** Volume total da cabine (m³) */
  cabineVolumeM3: number;
  /** Delta T usado no cálculo (°C) */
  deltaTUsedC: number;
  /** Detalhamento por elemento */
  breakdown: ElementBreakdown[];
}

export interface ElementBreakdown {
  id: string;
  label: string;
  type: ThermalElementType;
  heatPerUnitW: number;
  totalHeatW: number;
  quantity: number;
}

export const DEFAULT_CABIN_DIMENSIONS: CabineDimensions = {
  heightM: 2.5,
  widthM: 4.0,
  lengthM: 6.0,
};
