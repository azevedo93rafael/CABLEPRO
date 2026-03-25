// ─────────────────────────────────────────────────────────────────────────────
// Report i18n — Strings for formal calculation reports (Relazione di Calcolo)
// Covers: Grounding + Ventilation reports, PT-BR / EN / IT
// ─────────────────────────────────────────────────────────────────────────────

import { Language } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ReportStrings {
  // Common
  reportTitle: string;
  softwareLabel: string;
  projectLabel: string;
  dateLabel: string;
  redactedBy: string;
  calcVersion: string;
  printBtn: string;
  redatto: string;
  verificato: string;
  approvato: string;
  normsFooter: string;
  normTableNorm: string;
  normTableTitle: string;

  // Grounding report
  gr_title: string;
  gr_subtitle: string;
  gr_scope_title: string;
  gr_scope_body: string;
  gr_scope_items: string[];
  gr_norms_title: string;
  gr_data_title: string;
  gr_data_params: string[];        // [param, symbol, unit] tuples by index
  gr_method_title: string;
  gr_method_body1: string;
  gr_method_symbols: [string, string, string][];
  gr_method_kfactor_title: string;
  gr_method_kfactor_body: string;
  gr_method_icc_intro: string;
  gr_calc_title: string;
  gr_calc_icc_title: string;
  gr_calc_icc_body: string;
  gr_calc_icc_single_intro: string;
  gr_calc_earth_title: string;
  gr_calc_earth_body: string;
  gr_calc_coll_title: string;
  gr_calc_coll_body: string;
  gr_calc_band_title: string;
  gr_calc_band_body: string;
  gr_calc_band_min: string;
  gr_results_title: string;
  gr_results_cols: string[];
  gr_results_rows: string[];
  gr_results_icc_label: string;
  gr_conclusion_title: string;
  gr_conclusion_body: string;
  gr_conclusion_list_intro: string;
  gr_sub_label: string;
  gr_num_sub: string;

  // Ventilation report
  vt_title: string;
  vt_subtitle: string;
  vt_scope_title: string;
  vt_scope_body: string;
  vt_scope_items: string[];
  vt_norms_title: string;
  vt_data_title: string;
  vt_elements_title: string;
  vt_elements_cols: string[];
  vt_dims_title: string;
  vt_method_title: string;
  vt_method_intro: string;
  vt_method_symbols: [string, string, string][];
  vt_method_consts: string;
  vt_calc_title: string;
  vt_calc_heat_title: string;
  vt_calc_heat_trafo: string;
  vt_calc_heat_switch: string;
  vt_calc_total_title: string;
  vt_calc_btu_title: string;
  vt_calc_flow_title: string;
  vt_calc_vol_title: string;
  vt_results_title: string;
  vt_results_cols: string[];
  vt_conclusion_title: string;
  vt_conclusion_body: string;
  vt_conclusion_list_intro: string;

  // Shared calc step labels
  step_numerical: string;
  step_result: string;
  step_normalized: string;
  step_calc: string;
}

// ── Catalog ──────────────────────────────────────────────────────────────────
const CATALOG: Record<Language, ReportStrings> = {
  'it': {
    reportTitle: 'Relazione di Calcolo',
    softwareLabel: 'CablePro — Modulo Cabina MT',
    projectLabel: 'Progetto',
    dateLabel: 'Data',
    redactedBy: 'Redatto da',
    calcVersion: 'Versione calcolo',
    printBtn: 'Stampa / PDF',
    redatto: 'Redatto da',
    verificato: 'Verificato da',
    approvato: 'Approvato da',
    normsFooter: 'CEI EN 60909:2016 | IEC 60364-5-54 | ASHRAE Fundamentals | VDI 2078',
    normTableNorm: 'Norma',
    normTableTitle: 'Titolo',

    gr_title: 'Relazione di Calcolo — Messa a Terra',
    gr_subtitle: 'Cabina di Media Tensione (MT)',
    gr_scope_title: '1. Oggetto e Scopo',
    gr_scope_body: 'La presente relazione ha lo scopo di dimensionare i conduttori di protezione (PE) del sistema di messa a terra della cabina di Media Tensione (MT), in conformità alle normative tecniche vigenti. I calcoli comprendono il dimensionamento di:',
    gr_scope_items: ['Cavo di messa a terra del neutro del trasformatore', 'Collettore (busbar) di terra della cabina', 'Bandella di equipotenzializzazione'],
    gr_norms_title: '2. Riferimenti Normativi',
    gr_data_title: '3. Dati di Impianto',
    gr_data_params: ['Numero trasformatori', 'Potenza nominale per trasformatore', 'Potenza totale installata', 'Tensione primaria', 'Tensione secondaria', 'Tensione di cortocircuito', 'Tempo di intervento protezione', 'Materiale conduttore', 'Isolamento conduttore'],
    gr_method_title: '4. Metodo di Calcolo',
    gr_method_body1: 'Il dimensionamento dei conduttori di protezione è eseguito con il metodo adiabatico, in conformità all\'equazione (543.1) della norma IEC 60364-5-54:',
    gr_method_symbols: [
      ['S', 'Sezione minima del conduttore di protezione', 'mm²'],
      ['I', 'Corrente di guasto prospettica (corrente di cortocircuito Icc)', 'A'],
      ['t', 'Tempo di intervento del dispositivo di protezione', 's'],
      ['k', 'Fattore dipendente dal materiale del conduttore e dall\'isolamento', '—'],
    ],
    gr_method_kfactor_title: 'Fattore k adottato',
    gr_method_kfactor_body: 'con isolamento XLPE / EPR, si adotta: k = {k} (IEC 60364-5-54, Tabella 43A — Tᵢ = 90°C, Tf = 250°C)',
    gr_method_icc_intro: 'La corrente di cortocircuito trifase simmetrica al secondario del trasformatore è calcolata con la formula:',
    gr_calc_title: '5. Svolgimento dei Calcoli',
    gr_calc_icc_title: '5.1  Corrente di Cortocircuito al Secondario',
    gr_calc_icc_body: 'Si calcola la corrente di cortocircuito trifase simmetrica (valore massimo prospettico) al secondario, considerando la potenza totale installata di tutti i trasformatori:',
    gr_calc_icc_single_intro: 'Per il dimensionamento del cavo di terra del neutro del singolo trasformatore, si impiega la corrente riferita al solo trasformatore:',
    gr_calc_earth_title: '5.2  Cavo di Messa a Terra del Neutro del Trasformatore',
    gr_calc_earth_body: 'Il cavo di terra del neutro deve sopportare la corrente di cortocircuito del singolo trasformatore per la durata t del dispositivo di protezione. Applicazione formula adiabatica (eq. 543.1, IEC 60364-5-54):',
    gr_calc_coll_title: '5.3  Collettore di Terra della Cabina',
    gr_calc_coll_body: 'Il collettore principale di terra deve essere dimensionato per la corrente di cortocircuito totale dell\'impianto (tutti i trasformatori in parallelo):',
    gr_calc_band_title: '5.4  Bandella di Equipotenzializzazione',
    gr_calc_band_body: 'La bandella è dimensionata pari alla metà della sezione del collettore, con minimo normativo di 16 mm² (CEI 11-37, Art. 8.2):',
    gr_calc_band_min: 'Sezione minima normativa applicata',
    gr_results_title: '6. Riepilogo dei Risultati',
    gr_results_cols: ['Conduttore', 'S calc. (mm²)', 'S norm. (mm²)', 'Norma'],
    gr_results_rows: ['Cavo Terra Neutro Trafo.', 'Collettore di Terra (busbar)', 'Bandella Equipotenz.'],
    gr_results_icc_label: 'Corrente di Cortocircuito Simmetrica (Valore Prospettico)',
    gr_conclusion_title: '7. Conclusioni',
    gr_conclusion_body: 'I conduttori di protezione, dimensionati con il metodo adiabatico in conformità alla norma IEC 60364-5-54 eq. (543.1), risultano adeguati a sopportare la corrente di cortocircuito prospettica di {icc} A per il tempo di intervento della protezione di {t} s.',
    gr_conclusion_list_intro: 'Sezioni adottate (valori di progetto):',
    gr_sub_label: 'Sostituzione numerica:',
    gr_num_sub: 'Icc per singolo trasformatore:',

    vt_title: 'Relazione di Calcolo — Ventilazione',
    vt_subtitle: 'Calcolo dissipazione termica e portata d\'aria — Cabina MT',
    vt_scope_title: '1. Oggetto e Scopo',
    vt_scope_body: 'La presente relazione ha lo scopo di calcolare la dissipazione termica totale degli apparecchi installati nella cabina MT e di determinare la portata d\'aria necessaria al raffreddamento. I calcoli comprendono:',
    vt_scope_items: ['Potere dissipativo di ciascun elemento termico (trasformatori, quadri MT/BT)', 'Calore totale dissipato nella cabina (W e BTU/h)', 'Portata d\'aria necessaria al raffreddamento (m³/h)', 'Volume della cabina'],
    vt_norms_title: '2. Riferimenti Normativi',
    vt_data_title: '3. Dati degli Elementi Termici',
    vt_elements_title: 'Apparecchi installati',
    vt_elements_cols: ['Elemento', 'Tipo', 'Qt.', 'Parametro termico', 'Q/unità (W)', 'Q tot. (W)'],
    vt_dims_title: 'Dimensioni della Cabina',
    vt_method_title: '4. Metodo di Calcolo',
    vt_method_intro: 'Il calcolo è eseguito con il metodo della portata d\'aria sensibile, in conformità all\'ASHRAE Fundamentals e alla norma VDI 2078:',
    vt_method_symbols: [
      ['Q_tot', 'Calore totale dissipato dagli apparecchi installati', 'W'],
      ['ρ', 'Densità dell\'aria a 20°C e pressione atmosferica standard', 'kg/m³'],
      ['Cp', 'Calore specifico dell\'aria secca', 'J/(kg·K)'],
      ['ΔT', 'Differenza di temperatura aria uscita/entrata (valore conservativo VDI 2078)', 'K'],
      ['BTU/h', 'Unità di misura anglosassone della potenza termica', '—'],
    ],
    vt_method_consts: 'Costanti fisiche adottate: ρ = 1,2 kg/m³ | Cp = 1.005 J/(kg·K) | ΔT = 15 K | 1 W = 3,412 BTU/h',
    vt_calc_title: '5. Svolgimento dei Calcoli',
    vt_calc_heat_title: '5.1  Dissipazione Termica per Elemento',
    vt_calc_heat_trafo: 'Per i trasformatori, la perdita termica è calcolata dalla differenza tra potenza nominale e potenza utile ceduta al carico:',
    vt_calc_heat_switch: 'Per i quadri elettrici (MT/BT), la dissipazione termica è inserita direttamente dall\'operatore (dati costruttore):',
    vt_calc_total_title: '5.2  Calore Totale Dissipato',
    vt_calc_btu_title: '5.3  Conversione in BTU/h',
    vt_calc_flow_title: '5.4  Portata d\'Aria Necessaria',
    vt_calc_vol_title: '5.5  Volume della Cabina',
    vt_results_title: '6. Riepilogo dei Risultati',
    vt_results_cols: ['Grandezza', 'Valore', 'Unità'],
    vt_conclusion_title: '7. Conclusioni',
    vt_conclusion_body: 'La potenza termica totale dissipata dagli apparecchi della cabina MT risulta di {heat} ({btu} BTU/h). Per garantire il mantenimento della temperatura interna con un differenziale ΔT = {dt}°C rispetto all\'aria esterna, è necessaria una portata d\'aria di {flow} m³/h.',
    vt_conclusion_list_intro: 'Valori di progetto adottati:',

    step_numerical: 'Sostituzione numerica:',
    step_result: 'Risultato:',
    step_normalized: 'Valore normalizzato (IEC 60228):',
    step_calc: 'Calcolo:',
  },

  'pt-BR': {
    reportTitle: 'Relatório de Cálculo',
    softwareLabel: 'CablePro — Módulo Cabine MT',
    projectLabel: 'Projeto',
    dateLabel: 'Data',
    redactedBy: 'Elaborado por',
    calcVersion: 'Versão do cálculo',
    printBtn: 'Imprimir / PDF',
    redatto: 'Elaborado por',
    verificato: 'Verificado por',
    approvato: 'Aprovado por',
    normsFooter: 'CEI EN 60909:2016 | IEC 60364-5-54 | ASHRAE Fundamentals | VDI 2078',
    normTableNorm: 'Norma',
    normTableTitle: 'Título',

    gr_title: 'Relatório de Cálculo — Aterramento',
    gr_subtitle: 'Cabine de Média Tensão (MT)',
    gr_scope_title: '1. Objeto e Objetivo',
    gr_scope_body: 'O presente relatório tem como objetivo dimensionar os condutores de proteção (PE) do sistema de aterramento da Cabine de Média Tensão (MT), em conformidade com as normas técnicas vigentes. Os cálculos abrangem o dimensionamento de:',
    gr_scope_items: ['Cabo de aterramento do neutro do transformador', 'Coletor (barramento) de terra da cabine', 'Bandeira de equipotencialização'],
    gr_norms_title: '2. Referências Normativas',
    gr_data_title: '3. Dados do Sistema',
    gr_data_params: ['Número de transformadores', 'Potência nominal por transformador', 'Potência total instalada', 'Tensão primária', 'Tensão secundária', 'Tensão de curto-circuito', 'Tempo de atuação da proteção', 'Material do condutor', 'Isolamento do condutor'],
    gr_method_title: '4. Método de Cálculo',
    gr_method_body1: 'O dimensionamento dos condutores de proteção é realizado com o método adiabático, em conformidade com a equação (543.1) da norma IEC 60364-5-54:',
    gr_method_symbols: [
      ['S', 'Seção mínima do condutor de proteção', 'mm²'],
      ['I', 'Corrente de falta prospectiva (corrente de curto-circuito Icc)', 'A'],
      ['t', 'Tempo de atuação do dispositivo de proteção', 's'],
      ['k', 'Fator dependente do material do condutor e do isolamento', '—'],
    ],
    gr_method_kfactor_title: 'Fator k adotado',
    gr_method_kfactor_body: 'com isolamento XLPE / EPR, adota-se: k = {k} (IEC 60364-5-54, Tabela 43A — Ti = 90°C, Tf = 250°C)',
    gr_method_icc_intro: 'A corrente de curto-circuito trifásico simétrico no secundário do transformador é calculada pela fórmula:',
    gr_calc_title: '5. Desenvolvimento dos Cálculos',
    gr_calc_icc_title: '5.1  Corrente de Curto-Circuito no Secundário',
    gr_calc_icc_body: 'Calcula-se a corrente de curto-circuito trifásico simétrico (valor máximo prospectivo) no secundário, considerando a potência total instalada de todos os transformadores:',
    gr_calc_icc_single_intro: 'Para dimensionamento do cabo de terra do neutro do transformador individual, utiliza-se a corrente referente a um único transformador:',
    gr_calc_earth_title: '5.2  Cabo de Aterramento do Neutro do Transformador',
    gr_calc_earth_body: 'O cabo de terra do neutro deve suportar a corrente de curto-circuito do transformador individual pelo tempo t da proteção. Aplicação da fórmula adiabática (eq. 543.1, IEC 60364-5-54):',
    gr_calc_coll_title: '5.3  Coletor de Terra da Cabine',
    gr_calc_coll_body: 'O coletor principal de terra deve ser dimensionado para a corrente total de curto-circuito do sistema (todos os transformadores em paralelo):',
    gr_calc_band_title: '5.4  Bandeira de Equipotencialização',
    gr_calc_band_body: 'A bandeira é dimensionada com metade da seção do coletor, com mínimo normativo de 16 mm² (CEI 11-37, Art. 8.2):',
    gr_calc_band_min: 'Seção mínima normativa aplicada',
    gr_results_title: '6. Resumo dos Resultados',
    gr_results_cols: ['Condutor', 'S calc. (mm²)', 'S norm. (mm²)', 'Norma'],
    gr_results_rows: ['Cabo Terra Neutro Trafo.', 'Coletor de Terra (barramento)', 'Bandeira de Equipotenc.'],
    gr_results_icc_label: 'Corrente de Curto-Circuito Simétrico (Valor Prospectivo)',
    gr_conclusion_title: '7. Conclusões',
    gr_conclusion_body: 'Os condutores de proteção, dimensionados com o método adiabático em conformidade com a norma IEC 60364-5-54 eq. (543.1), são adequados para suportar a corrente de curto-circuito prospectiva de {icc} A pelo tempo de atuação da proteção de {t} s.',
    gr_conclusion_list_intro: 'Seções adotadas (valores de projeto):',
    gr_sub_label: 'Substituição numérica:',
    gr_num_sub: 'Icc para transformador individual:',

    vt_title: 'Relatório de Cálculo — Ventilação',
    vt_subtitle: 'Cálculo de dissipação térmica e portata de ar — Cabine MT',
    vt_scope_title: '1. Objeto e Objetivo',
    vt_scope_body: 'O presente relatório tem como objetivo calcular a dissipação térmica total dos equipamentos instalados na cabine MT e determinar a portata de ar necessária ao resfriamento. O cálculo abrange:',
    vt_scope_items: ['Dissipação térmica de cada elemento (transformadores, quadros MT/BT)', 'Calor total dissipado na cabine (W e BTU/h)', 'Portata de ar necessária ao resfriamento (m³/h)', 'Volume da cabine'],
    vt_norms_title: '2. Referências Normativas',
    vt_data_title: '3. Dados dos Elementos Térmicos',
    vt_elements_title: 'Equipamentos instalados',
    vt_elements_cols: ['Elemento', 'Tipo', 'Qt.', 'Parâmetro térmico', 'Q/un. (W)', 'Q tot. (W)'],
    vt_dims_title: 'Dimensões da Cabine',
    vt_method_title: '4. Método de Cálculo',
    vt_method_intro: 'O cálculo é realizado pelo método da portata de ar sensível, em conformidade com os critérios ASHRAE Fundamentals e a norma VDI 2078:',
    vt_method_symbols: [
      ['Q_tot', 'Calor total dissipado pelos equipamentos instalados', 'W'],
      ['ρ', 'Densidade do ar a 20°C e pressão atmosférica padrão', 'kg/m³'],
      ['Cp', 'Calor específico do ar seco', 'J/(kg·K)'],
      ['ΔT', 'Diferença de temperatura ar saída/entrada (valor conservativo VDI 2078)', 'K'],
      ['BTU/h', 'Unidade de medida anglosaxônica de potência térmica', '—'],
    ],
    vt_method_consts: 'Constantes físicas adotadas: ρ = 1,2 kg/m³ | Cp = 1.005 J/(kg·K) | ΔT = 15 K | 1 W = 3,412 BTU/h',
    vt_calc_title: '5. Desenvolvimento dos Cálculos',
    vt_calc_heat_title: '5.1  Dissipação Térmica por Elemento',
    vt_calc_heat_trafo: 'Para transformadores, a perda térmica é calculada pela diferença entre a potência nominal e a potência útil entregue à carga:',
    vt_calc_heat_switch: 'Para quadros elétricos (MT/BT), a dissipação térmica é fornecida diretamente pelo operador (dados do fabricante):',
    vt_calc_total_title: '5.2  Calor Total Dissipado',
    vt_calc_btu_title: '5.3  Conversão em BTU/h',
    vt_calc_flow_title: '5.4  Portata de Ar Necessária',
    vt_calc_vol_title: '5.5  Volume da Cabine',
    vt_results_title: '6. Resumo dos Resultados',
    vt_results_cols: ['Grandeza', 'Valor', 'Unidade'],
    vt_conclusion_title: '7. Conclusões',
    vt_conclusion_body: 'A potência térmica total dissipada pelos equipamentos da cabine MT é de {heat} ({btu} BTU/h). Para manter a temperatura interna com diferencial ΔT = {dt}°C em relação ao ar externo, é necessária uma portata de ar de {flow} m³/h.',
    vt_conclusion_list_intro: 'Valores de projeto adotados:',

    step_numerical: 'Substituição numérica:',
    step_result: 'Resultado:',
    step_normalized: 'Valor normalizado (IEC 60228):',
    step_calc: 'Cálculo:',
  },

  'en': {
    reportTitle: 'Calculation Report',
    softwareLabel: 'CablePro — MV Cabin Module',
    projectLabel: 'Project',
    dateLabel: 'Date',
    redactedBy: 'Prepared by',
    calcVersion: 'Calculation version',
    printBtn: 'Print / PDF',
    redatto: 'Prepared by',
    verificato: 'Checked by',
    approvato: 'Approved by',
    normsFooter: 'CEI EN 60909:2016 | IEC 60364-5-54 | ASHRAE Fundamentals | VDI 2078',
    normTableNorm: 'Standard',
    normTableTitle: 'Title',

    gr_title: 'Calculation Report — Earthing',
    gr_subtitle: 'MV Cabin (Medium Voltage)',
    gr_scope_title: '1. Subject and Scope',
    gr_scope_body: 'This report sizes the protection conductors (PE) of the earthing system of the MV Cabin in compliance with applicable technical standards. Calculations cover:',
    gr_scope_items: ['Transformer neutral earthing cable', 'Cabin earth collector busbar', 'Equipotential busbar (bandella)'],
    gr_norms_title: '2. Normative References',
    gr_data_title: '3. System Data',
    gr_data_params: ['Number of transformers', 'Rated power per transformer', 'Total installed power', 'Primary voltage', 'Secondary voltage', 'Short-circuit voltage', 'Protection clearing time', 'Conductor material', 'Conductor insulation'],
    gr_method_title: '4. Calculation Method',
    gr_method_body1: 'Protection conductors are sized using the adiabatic method, in compliance with equation (543.1) of IEC 60364-5-54:',
    gr_method_symbols: [
      ['S', 'Minimum cross-section of protection conductor', 'mm²'],
      ['I', 'Prospective fault current (short-circuit current Icc)', 'A'],
      ['t', 'Clearing time of protection device', 's'],
      ['k', 'Factor depending on conductor material and insulation', '—'],
    ],
    gr_method_kfactor_title: 'Adopted k factor',
    gr_method_kfactor_body: 'with XLPE / EPR insulation, k = {k} is adopted (IEC 60364-5-54, Table 43A — Tᵢ = 90°C, Tf = 250°C)',
    gr_method_icc_intro: 'The three-phase symmetrical short-circuit current at the transformer secondary is calculated as:',
    gr_calc_title: '5. Calculation Workings',
    gr_calc_icc_title: '5.1  Short-Circuit Current at Secondary',
    gr_calc_icc_body: 'The three-phase symmetrical short-circuit current (maximum prospective value) is calculated at the secondary considering the total installed power of all transformers:',
    gr_calc_icc_single_intro: 'For sizing the neutral earthing cable of a single transformer, the current referred to one transformer is used:',
    gr_calc_earth_title: '5.2  Transformer Neutral Earthing Cable',
    gr_calc_earth_body: 'The neutral earthing cable must withstand the single-transformer short-circuit current for the protection clearing time t. Application of the adiabatic formula (eq. 543.1, IEC 60364-5-54):',
    gr_calc_coll_title: '5.3  Cabin Earth Collector Busbar',
    gr_calc_coll_body: 'The main earth collector must be sized for the total installation short-circuit current (all transformers in parallel):',
    gr_calc_band_title: '5.4  Equipotential Busbar (Bandella)',
    gr_calc_band_body: 'Sized at half the collector section, with a normative minimum of 16 mm² (CEI 11-37, Art. 8.2):',
    gr_calc_band_min: 'Normative minimum cross-section applied',
    gr_results_title: '6. Results Summary',
    gr_results_cols: ['Conductor', 'S calc. (mm²)', 'S norm. (mm²)', 'Standard'],
    gr_results_rows: ['Neutral Earthing Cable', 'Earth Collector Busbar', 'Equipotential Busbar'],
    gr_results_icc_label: 'Three-phase Symmetrical Short-Circuit Current (Prospective)',
    gr_conclusion_title: '7. Conclusions',
    gr_conclusion_body: 'The protection conductors, sized with the adiabatic method in compliance with IEC 60364-5-54 eq. (543.1), are adequate to withstand the prospective short-circuit current of {icc} A for the protection clearing time of {t} s.',
    gr_conclusion_list_intro: 'Adopted cross-sections (design values):',
    gr_sub_label: 'Numerical substitution:',
    gr_num_sub: 'Icc for single transformer:',

    vt_title: 'Calculation Report — Ventilation',
    vt_subtitle: 'Thermal dissipation and airflow calculation — MV Cabin',
    vt_scope_title: '1. Subject and Scope',
    vt_scope_body: 'This report calculates the total thermal dissipation of equipment installed in the MV Cabin and determines the required cooling airflow. Calculations cover:',
    vt_scope_items: ['Thermal dissipation of each element (transformers, MV/LV switchboards)', 'Total heat dissipated in the cabin (W and BTU/h)', 'Required cooling airflow (m³/h)', 'Cabin volume'],
    vt_norms_title: '2. Normative References',
    vt_data_title: '3. Thermal Element Data',
    vt_elements_title: 'Installed equipment',
    vt_elements_cols: ['Element', 'Type', 'Qty', 'Thermal parameter', 'Q/unit (W)', 'Q total (W)'],
    vt_dims_title: 'Cabin Dimensions',
    vt_method_title: '4. Calculation Method',
    vt_method_intro: 'Calculation uses the sensible airflow method, in accordance with ASHRAE Fundamentals and VDI 2078:',
    vt_method_symbols: [
      ['Q_tot', 'Total heat dissipated by installed equipment', 'W'],
      ['ρ', 'Air density at 20°C and standard atmospheric pressure', 'kg/m³'],
      ['Cp', 'Specific heat of dry air', 'J/(kg·K)'],
      ['ΔT', 'Temperature difference outlet/inlet air (conservative VDI 2078 value)', 'K'],
      ['BTU/h', 'Imperial unit of thermal power', '—'],
    ],
    vt_method_consts: 'Physical constants: ρ = 1.2 kg/m³ | Cp = 1,005 J/(kg·K) | ΔT = 15 K | 1 W = 3.412 BTU/h',
    vt_calc_title: '5. Calculation Workings',
    vt_calc_heat_title: '5.1  Thermal Dissipation per Element',
    vt_calc_heat_trafo: 'For transformers, thermal loss is calculated from the difference between rated power and useful power delivered to the load:',
    vt_calc_heat_switch: 'For electrical switchboards (MV/LV), thermal dissipation is entered directly by the operator (manufacturer data):',
    vt_calc_total_title: '5.2  Total Heat Dissipated',
    vt_calc_btu_title: '5.3  Conversion to BTU/h',
    vt_calc_flow_title: '5.4  Required Airflow',
    vt_calc_vol_title: '5.5  Cabin Volume',
    vt_results_title: '6. Results Summary',
    vt_results_cols: ['Quantity', 'Value', 'Unit'],
    vt_conclusion_title: '7. Conclusions',
    vt_conclusion_body: 'The total thermal power dissipated by the MV Cabin equipment is {heat} ({btu} BTU/h). To maintain the internal temperature with a differential ΔT = {dt}°C relative to external air, a cooling airflow of {flow} m³/h is required.',
    vt_conclusion_list_intro: 'Adopted design values:',

    step_numerical: 'Numerical substitution:',
    step_result: 'Result:',
    step_normalized: 'Normalized value (IEC 60228):',
    step_calc: 'Calculation:',
  },
};

export function getReportStrings(lang: Language): ReportStrings {
  return CATALOG[lang] ?? CATALOG['en'];
}

export function getReportNorms(lang: Language): [string, string][] {
  const norms: [string, string][] = [
    ['CEI EN 60909:2016', lang === 'en'
      ? 'Short-circuit currents in AC systems — Calculation of currents'
      : lang === 'pt-BR'
        ? 'Correntes de curto-circuito em sistemas trifásicos — Cálculo das correntes'
        : 'Correnti di cortocircuito nei sistemi trifase — Calcolo delle correnti'],
    ['IEC 60364-5-54', lang === 'en'
      ? 'Electrical installations — Earthing and protection conductors'
      : lang === 'pt-BR'
        ? 'Instalações elétricas — Aterramento e condutores de proteção'
        : 'Impianti elettrici — Messa a terra e conduttori di protezione'],
    ['CEI 11-37', lang === 'en'
      ? 'Guide for earthing systems in energy-using installations'
      : lang === 'pt-BR'
        ? 'Guia para execução de sistemas de terra em instalações consumidoras'
        : 'Guida per l\'esecuzione degli impianti di terra nei sistemi utilizzatori'],
    ['IEC 60228', lang === 'en'
      ? 'Conductors of insulated cables — Standardised cross-sections'
      : lang === 'pt-BR'
        ? 'Condutores para cabos isolados — Seções normalizadas'
        : 'Conduttori per cavi isolati — Sezioni normalizzate'],
    ['CEI 11-1', lang === 'en'
      ? 'AC electrical systems with voltage above 1 kV'
      : lang === 'pt-BR'
        ? 'Sistemas elétricos em CA com tensão superior a 1 kV'
        : 'Impianti elettrici con tensione superiore a 1 kV in corrente alternata'],
    ['IEC 60076-1', lang === 'en'
      ? 'Power transformers — General'
      : lang === 'pt-BR'
        ? 'Transformadores de potência — Generalidades'
        : 'Trasformatori di potenza — Generalità'],
  ];
  return norms;
}

export function getVentilationNorms(lang: Language): [string, string][] {
  return [
    ['ASHRAE Fundamentals', lang === 'en'
      ? 'HVAC Fundamentals Handbook — Chapter 18: Nonresidential Cooling Loads'
      : lang === 'pt-BR'
        ? 'Manual HVAC Fundamentals — Cap. 18: Cargas de resfriamento não-residenciais'
        : 'HVAC Fundamentals Handbook — Cap. 18: Carichi di raffreddamento non residenziali'],
    ['VDI 2078', lang === 'en'
      ? 'Calculation of cooling load — Rooms and buildings'
      : lang === 'pt-BR'
        ? 'Cálculo da carga de resfriamento — Ambientes e edifícios'
        : 'Calcolo del carico di raffreddamento — Ambienti ed edifici'],
    ['IEC 60076-1', lang === 'en'
      ? 'Power transformers — General (thermal ratings)'
      : lang === 'pt-BR'
        ? 'Transformadores de potência — Generalidades (classificação térmica)'
        : 'Trasformatori di potenza — Generalità (classi termiche)'],
    ['IEC 62271-202', lang === 'en'
      ? 'Prefabricated substation MV/LV — Installation conditions'
      : lang === 'pt-BR'
        ? 'Subestação pré-fabricada MT/BT — Condições de instalação'
        : 'Cabine prefabbricate MT/BT — Condizioni di installazione'],
    ['CEI 11-35', lang === 'en'
      ? 'Guide for the execution of electrical substations'
      : lang === 'pt-BR'
        ? 'Guia para execução de subestações elétricas'
        : 'Guida per la realizzazione di cabine elettriche'],
  ];
}
