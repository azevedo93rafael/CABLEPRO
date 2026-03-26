// ────────────────────────────────────────────────────────────────────────────
// Módulo de Cálculo da Cabine de Média Tensão — Types
// ────────────────────────────────────────────────────────────────────────────

import { VentilationElement, CabineDimensions, DEFAULT_CABIN_DIMENSIONS } from './cabineMTVentilation';
export type { VentilationElement, CabineDimensions };
export { DEFAULT_CABIN_DIMENSIONS };

export type ConductorMaterial = 'copper' | 'aluminum';

/** ID semântico da versão do motor de cálculo — para auditoria futura */
export const CALC_VERSION = '1.0';

/**
 * Projeto completo do módulo Cabine MT (aterramento + ventilação).
 * Espelha a estrutura do Project do CableFill PRO.
 */
export interface CabineMTProject {
  id: string;
  name: string;
  inputs: CabineMTInputs;
  cabineDimensions: CabineDimensions;
  elements: VentilationElement[];
  calcVersion: string;
  lastSaved?: string;
  notes?: string;
}

/**
 * Parâmetros inseridos pelo usuário no formulário de entrada.
 */
export interface CabineMTInputs {
  /** Quantidade de transformadores na cabine */
  numTransformers: number;
  /** Potência nominal por transformador (kVA) */
  powerKVA: number;
  /** Tensão primária (kV) */
  primaryVoltageKV: number;
  /** Tensão secundária (V) */
  secondaryVoltageV: number;
  /** Perda de tensão em curto-circuito (%, default 6) */
  shortCircuitVoltagePct: number;
  /** Tempo de atuação da proteção em caso de falta (s, default 1) */
  faultTimeS: number;
  /** Material do condutor de terra (default: copper) */
  conductorMaterial: ConductorMaterial;
}

/**
 * Resultados calculados pelo motor de cálculo.
 */
export interface CabineMTResults {
  /** Potência total instalada (kVA) */
  totalPowerKVA: number;
  /** Corrente de curto-circuito trifásico no secundário (A) */
  shortCircuitCurrentA: number;
  /** Seção calculada (raw) do cabo de aterramento do neutro do transformador (mm²) */
  earthingCableSectionRawMM2: number;
  /** Seção normalizada do cabo de aterramento do neutro (mm²) */
  earthingCableSectionNormMM2: number;
  /** Seção calculada (raw) do coletor de terra da cabine (mm²) */
  collectorSectionRawMM2: number;
  /** Seção normalizada do coletor de terra (mm²) */
  collectorSectionNormMM2: number;
  /** Seção calculada (raw) da bandella de equipotencialização (mm²) */
  bandellaSectionRawMM2: number;
  /** Seção normalizada da bandella (mínimo 16 mm²) */
  bandellaSectionNormMM2: number;
  /** Coeficiente k usado no cálculo (depende do material) */
  kFactor: number;
  /** Referência normativa aplicada */
  normativeReference: string;
}

/**
 * Registro de cálculo salvo no histórico (opcional — Fase 2).
 */
export interface CabineMTCalculationRecord {
  id: string;
  user_id: string;
  created_at: string;
  project_name?: string;
  notes?: string;
  inputs: CabineMTInputs;
  results: CabineMTResults;
}

/**
 * Estado de validação dos inputs.
 */
export interface CabineMTValidationState {
  numTransformers: string;
  powerKVA: string;
  primaryVoltageKV: string;
  secondaryVoltageV: string;
  shortCircuitVoltagePct: string;
  faultTimeS: string;
}
