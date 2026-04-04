import { LocalTIInputs, LocalTIResults } from '../types/cabineMT';

/**
 * Executes the IT room sizing calculations based on empirical rules.
 * 
 * @param inputs Object containing the number of racks
 * @returns Object with area, power, UPS and cooling results
 */
export function calculateLocalTI(inputs: LocalTIInputs): LocalTIResults {
  const { quantidade_racks, largura_m, comprimento_m, altura_m } = inputs;

  // 1. Área e Volume:
  // Se houver dimensões manuais, usa elas. Caso contrário, estima por rack.
  const area_m2 = (largura_m && comprimento_m) 
    ? (largura_m * comprimento_m) 
    : (quantidade_racks * 4.5);
  
  const volume_m3 = area_m2 * (altura_m || 3.0); // Assume 3m as default height

  // 2. Consumo de Energia:
  const consumo_racks_kW = quantidade_racks * 3;
  const consumo_ilum_kW = area_m2 * 0.02; // 20 W/m2
  const consumo_aux_kW = 10;
  const pTotal_kW = consumo_racks_kW + consumo_ilum_kW + consumo_aux_kW;

  // 3. Dimensionamento do UPS: (P_total * 1.2) / 0.6
  const capacidade_ups_kVA = (pTotal_kW * 1.2) / 0.6;

  // 4. Carga Térmica (Heat Load):
  // Q1 (Equipamentos): 80% da capacidade do UPS
  const carga_termica_equipamentos_Q1_kW = capacidade_ups_kVA * 0.8;
  // Q2 (Ambiental): 0.15 kW per m2
  const carga_termica_ambiental_Q2_kW = area_m2 * 0.15;

  const Qt_kW = carga_termica_equipamentos_Q1_kW + carga_termica_ambiental_Q2_kW;

  // 5. Capacidade de Ar Condicionado Final (+40% redundância)
  const potencia_refrigeracao_kW = Qt_kW * 1.4;
  const potencia_refrigeracao_BTU = potencia_refrigeracao_kW * 3412.14;

  return {
    area_estimada_m2: area_m2,
    volume_m3,
    consumo_racks_kW,
    capacidade_ups_recomendada_kVA: capacidade_ups_kVA,
    carga_termica_equipamentos_Q1_kW,
    carga_termica_ambiental_Q2_kW,
    ar_condicionado: {
      potencia_necessaria_kW: potencia_refrigeracao_kW,
      potencia_necessaria_BTU: potencia_refrigeracao_BTU,
      redundancia_aplicada: '40%',
    },
    alertas_normativos: "Conforme ASHRAE TC 9.9, manter a sala entre 18°C e 27°C e umidade entre 20% e 80%.",
  };
}
