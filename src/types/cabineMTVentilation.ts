// ─────────────────────────────────────────────────────────────────────────────
// Módulo Cabine MT — Tipos para cálculo de ventilação paramétrico
// Normas: ASHRAE Fundamentals, VDI 2078, IEC 62271-202, CEI 11-35
// ─────────────────────────────────────────────────────────────────────────────

export type VentilationElementType = 'transformer' | 'switchboard';

/**
 * Elemento térmico instalado na cabine (Transformador ou Quadro).
 */
export interface VentilationElement {
  id: string;
  type: VentilationElementType;
  /** Rótulo livre (ex: "TR1", "QGBT Principal") */
  label: string;
  /** Quantidade de unidades iguais */
  quantity: number;

  // ── Transformador ──
  /** Potência nominal (kVA) */
  powerKVA?: number;
  /** Perdas totais do datasheet em kW. Se não fornecido, usa-se 2,5% do kVA. */
  perdasKW?: number;

  // ── Quadros ──
  /** Quantidade de colunas/células que o quadro possui. */
  numColumns?: number;
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
  elements: VentilationElement[];
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
  pEnvKW: number;       // Carga solar: 0.08 kW/m³ × V
  pPessoasKW: number;   // Ocupação: 0.3 kW
  pTrafoKW: number;     // Total dos transformadores
  pQuadrosKW: number;   // Total dos quadros: N_cols × 0.15 kW
  totalHeatKW: number;  // Soma

  // ── Resultados derivados ────────────────────────────────────────────────────
  totalHeatW: number;
  btuPerHour: number;
  airflowM3h: number;
  cabineVolumeM3: number;
  deltaTUsedC: number;

  // ── Detalhe ─────────────────────────────────────────────────────────────────
  trafoBreakdown: {
    id: string;
    label: string;
    quantity: number;
    powerKVA: number;
    perdasKWPerUnit: number;
    totalKW: number;
  }[];
  quadrosBreakdown: {
    id: string;
    label: string;
    quantity: number;
    numColumns: number;
    totalKW: number;
  }[];
  loadBreakdown: LoadBreakdownItem[];
}

export const DEFAULT_CABIN_DIMENSIONS: CabineDimensions = {
  heightM: 2.5,
  widthM: 4.0,
  lengthM: 6.0,
};

export const DEFAULT_VENTILATION_INPUTS: VentilationInputs = {
  elements: [],
  dimensions: { ...DEFAULT_CABIN_DIMENSIONS },
};
