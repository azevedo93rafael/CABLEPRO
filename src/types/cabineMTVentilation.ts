// ─────────────────────────────────────────────────────────────────────────────
// Módulo Cabine MT — Tipos para cálculo de ventilação paramétrico
// Normas: ASHRAE Fundamentals, VDI 2078, IEC 62271-202, CEI 11-35
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transformador instalado na cabine.
 * A perda térmica é calculada como: perdasKW ?? (powerKVA × 0.025).
 */
export interface VentilationTransformer {
  id: string;
  /** Rótulo livre (ex: "TR1", "Transformador Principal") */
  label: string;
  /** Quantidade de unidades iguais */
  quantity: number;
  /** Potência nominal (kVA) */
  powerKVA: number;
  /**
   * Perdas totais específicas em kW, extraídas do datasheet.
   * Se não fornecido, assume-se 2,5% da potência nominal.
   */
  perdasKW?: number;
}

/**
 * Dimensões físicas da cabine (metros).
 */
export interface CabineDimensions {
  heightM: number;
  widthM: number;
  lengthM: number;
}

/**
 * Entradas completas do módulo de ventilação.
 */
export interface VentilationInputs {
  transformers: VentilationTransformer[];
  /** Número total de colunas/células de quadros (MT + BT) */
  numSwitchboardColumns: number;
  dimensions: CabineDimensions;
}

/**
 * Detalhamento de uma parcela de carga térmica.
 */
export interface LoadBreakdownItem {
  label: string;
  valueKW: number;
}

/**
 * Resultados completos do cálculo de ventilação paramétrico.
 */
export interface VentilationResults {
  // ── Parcelas de carga (kW) ──────────────────────────────────────────────────
  pEnvKW: number;       // Carga de envoltória / solar: 0.08 kW/m³ × V
  pPessoasKW: number;   // Carga de ocupação: 0.3 kW (fixo)
  pTrafoKW: number;     // Carga total dos transformadores
  pQuadrosKW: number;   // Carga total dos quadros: N_cols × 0.15 kW
  totalHeatKW: number;  // P_total = soma das parcelas

  // ── Resultados derivados ────────────────────────────────────────────────────
  /** P_total em Watts (para compatibilidade com relatório) */
  totalHeatW: number;
  /** Potência de climatização necessária (BTU/h) */
  btuPerHour: number;
  /** Portata de ar necessária para extração (m³/h) = P_total × 200 */
  airflowM3h: number;
  /** Volume total da cabine (m³) */
  cabineVolumeM3: number;
  /** Delta T usado (K) — fixo em 15 K */
  deltaTUsedC: number;

  // ── Detalhe por transformador ───────────────────────────────────────────────
  trafoBreakdown: {
    id: string;
    label: string;
    quantity: number;
    powerKVA: number;
    perdasKWPerUnit: number;
    totalKW: number;
  }[];

  // ── Detalhe completo das parcelas ───────────────────────────────────────────
  loadBreakdown: LoadBreakdownItem[];
}

export const DEFAULT_CABIN_DIMENSIONS: CabineDimensions = {
  heightM: 2.5,
  widthM: 4.0,
  lengthM: 6.0,
};

export const DEFAULT_VENTILATION_INPUTS: VentilationInputs = {
  transformers: [],
  numSwitchboardColumns: 0,
  dimensions: { ...DEFAULT_CABIN_DIMENSIONS },
};

// ── Legacy aliases (kept for backward compat with existing report until updated) ──
/** @deprecated use VentilationTransformer */
export type ThermalElementType = 'transformer' | 'switchboard_mt' | 'switchboard_bt';
/** @deprecated use VentilationTransformer */
export interface ThermalElement {
  id: string;
  type: ThermalElementType;
  label: string;
  quantity: number;
  powerKVA?: number;
  efficiencyPct?: number;
  dissipatedPowerW?: number;
  nominalCurrentA?: number;
  perdasKW?: number;
}
export interface ElementBreakdown {
  id: string;
  label: string;
  type: ThermalElementType;
  heatPerUnitW: number;
  totalHeatW: number;
  quantity: number;
}
