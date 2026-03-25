// ────────────────────────────────────────────────────────────────────────────
// Módulo de Cálculo da Cabine de Média Tensão — Engine de Cálculo
// Referência normativa: CEI EN 60909:2016 / NBR IEC 60909 / CEI 11-1
// ────────────────────────────────────────────────────────────────────────────

import type { CabineMTInputs, CabineMTResults, ConductorMaterial } from '../types/cabineMT';

export type { CabineMTInputs, CabineMTResults };

/**
 * Seções normalizadas de condutores (mm²) — IEC 60228
 */
const NORMALIZED_SECTIONS_MM2 = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400,
];

/**
 * Fator k para condutores de proteção (PE) — CEI EN 60909 / IEC 60364-5-54
 *
 * Cobre com isolamento PVC (temperatura inicial 70°C, final 160°C): k = 115
 * Cobre com isolamento XLPE/EPR (temperatura inicial 90°C, final 250°C): k = 143
 * Alumínio com isolamento PVC: k = 76
 * Alumínio com isolamento XLPE: k = 93
 *
 * Usamos k = 143 (cobre/XLPE) e k = 93 (alumínio/XLPE) como valores técnicos
 * padrão para instalações industriais MT.
 */
const K_FACTORS: Record<ConductorMaterial, number> = {
  copper: 143,
  aluminum: 93,
};

/**
 * Arredonda um valor (mm²) para a seção normalizada imediatamente superior.
 * Se o valor for maior que a maior seção disponível, retorna a maior seção.
 */
export function roundToNormalizedSection(rawMM2: number): number {
  for (const section of NORMALIZED_SECTIONS_MM2) {
    if (section >= rawMM2) return section;
  }
  return NORMALIZED_SECTIONS_MM2[NORMALIZED_SECTIONS_MM2.length - 1];
}

/**
 * Calcula a corrente de curto-circuito trifásico no secundário do transformador.
 *
 * Icc = Sn_total / (√3 × V2 × (Ucc% / 100))
 *
 * @param totalPowerVA  Potência total em VA
 * @param secondaryV    Tensão secundária em V
 * @param ucc           Tensão de curto-circuito em porcentagem (ex: 6 → 6%)
 * @returns Corrente de curto-circuito em A
 */
function calculateIcc(totalPowerVA: number, secondaryV: number, ucc: number): number {
  if (secondaryV <= 0 || ucc <= 0) return 0;
  return totalPowerVA / (Math.sqrt(3) * secondaryV * (ucc / 100));
}

/**
 * Calcula a seção mínima de um condutor de proteção pelo método adiabático.
 *
 * S = I × √t / k   [mm²]   — CEI EN 60909 / IEC 60364-5-54 equação (543.1)
 *
 * @param currentA  Corrente de falta em A
 * @param timeS     Tempo de atuação da proteção em s
 * @param k         Fator k do condutor
 * @returns Seção em mm² (valor raw, não normalizado)
 */
function calculateProtectionConductorSection(
  currentA: number,
  timeS: number,
  k: number,
): number {
  if (k <= 0 || currentA <= 0 || timeS <= 0) return 0;
  return (currentA * Math.sqrt(timeS)) / k;
}

/**
 * Motor principal de cálculo da Cabine MT.
 * Recebe os inputs do formulário e retorna todos os resultados calculados.
 *
 * Retorna null se os inputs forem inválidos.
 */
export function calculateCabineMT(inputs: CabineMTInputs): CabineMTResults | null {
  const {
    numTransformers,
    powerKVA,
    secondaryVoltageV,
    shortCircuitVoltagePct,
    faultTimeS,
    conductorMaterial,
  } = inputs;

  // Validação básica
  if (
    numTransformers <= 0 ||
    powerKVA <= 0 ||
    secondaryVoltageV <= 0 ||
    shortCircuitVoltagePct <= 0 ||
    faultTimeS <= 0
  ) {
    return null;
  }

  const k = K_FACTORS[conductorMaterial] ?? K_FACTORS.copper;
  const totalPowerKVA = numTransformers * powerKVA;
  const totalPowerVA = totalPowerKVA * 1000;

  // 1. Corrente de curto-circuito
  const iccA = calculateIcc(totalPowerVA, secondaryVoltageV, shortCircuitVoltagePct);

  // 2. Cabo de aterramento do neutro do transformador
  //    Calculado com a corrente de Icc de UM transformador (por transformador)
  const iccPerTransformerA = calculateIcc(
    powerKVA * 1000,
    secondaryVoltageV,
    shortCircuitVoltagePct,
  );
  const earthingRaw = calculateProtectionConductorSection(iccPerTransformerA, faultTimeS, k);
  const earthingNorm = roundToNormalizedSection(earthingRaw);

  // 3. Coletor de terra da cabine
  //    Calculado com a corrente total de Icc de TODOS os transformadores
  const collectorRaw = calculateProtectionConductorSection(iccA, faultTimeS, k);
  const collectorNorm = roundToNormalizedSection(collectorRaw);

  // 4. Bandella de equipotencialização
  //    = metade da seção do coletor, mínimo normativo de 16 mm²
  const bandellaRaw = collectorRaw * 0.5;
  const bandellaNormCalculated = roundToNormalizedSection(bandellaRaw);
  const bandellaNorm = Math.max(bandellaNormCalculated, 16); // Mínimo normativo: 16 mm²

  return {
    totalPowerKVA,
    shortCircuitCurrentA: parseFloat(iccA.toFixed(2)),
    earthingCableSectionRawMM2: parseFloat(earthingRaw.toFixed(4)),
    earthingCableSectionNormMM2: earthingNorm,
    collectorSectionRawMM2: parseFloat(collectorRaw.toFixed(4)),
    collectorSectionNormMM2: collectorNorm,
    bandellaSectionRawMM2: parseFloat(bandellaRaw.toFixed(4)),
    bandellaSectionNormMM2: bandellaNorm,
    kFactor: k,
    normativeReference: 'CEI EN 60909:2016 / IEC 60364-5-54',
  };
}

/**
 * Valida os inputs e retorna um objeto com mensagens de erro por campo.
 * Campo sem erro = string vazia.
 */
export function validateCabineMTInputs(
  inputs: Partial<CabineMTInputs>,
  t: { mustBePositive: string; invalidInput: string },
): Record<keyof CabineMTInputs, string> {
  const errors: Record<keyof CabineMTInputs, string> = {
    numTransformers: '',
    powerKVA: '',
    primaryVoltageKV: '',
    secondaryVoltageV: '',
    shortCircuitVoltagePct: '',
    faultTimeS: '',
    conductorMaterial: '',
  };

  if (!inputs.numTransformers || inputs.numTransformers < 1 || !Number.isInteger(inputs.numTransformers)) {
    errors.numTransformers = t.mustBePositive;
  }
  if (!inputs.powerKVA || inputs.powerKVA <= 0) {
    errors.powerKVA = t.mustBePositive;
  }
  if (!inputs.primaryVoltageKV || inputs.primaryVoltageKV <= 0) {
    errors.primaryVoltageKV = t.mustBePositive;
  }
  if (!inputs.secondaryVoltageV || inputs.secondaryVoltageV <= 0) {
    errors.secondaryVoltageV = t.mustBePositive;
  }
  if (
    !inputs.shortCircuitVoltagePct ||
    inputs.shortCircuitVoltagePct <= 0 ||
    inputs.shortCircuitVoltagePct >= 100
  ) {
    errors.shortCircuitVoltagePct = t.invalidInput;
  }
  if (!inputs.faultTimeS || inputs.faultTimeS <= 0) {
    errors.faultTimeS = t.mustBePositive;
  }

  return errors;
}

/** Retorna as seções normalizadas disponíveis (para fins informativos na UI) */
export { NORMALIZED_SECTIONS_MM2 };
