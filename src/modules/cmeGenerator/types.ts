// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/types.ts
// Domain types for the CME Generator module
// ─────────────────────────────────────────────────────────────────────────────

export type TipoPrezzo = 'PREZZARIO' | 'NVP';
export type StatusItem = 'OK' | 'ALERT' | 'NAO_ENCONTRADO' | 'NVP';

// ── Raw Revit CSV row ──────────────────────────────────────────────────────────
export interface ComposizioneItem {
  codiceDei: string;
  quantitaComposizione: number;
}

export interface Elemento {
  idUnico: string;
  edificio: string;
  livello: string;
  zona: string;
  descrizione: string;
  quantita: number;
  um: string;
  composizioneDei: ComposizioneItem[];
  tipoPrezzo: TipoPrezzo;
}

// ── Processed result ──────────────────────────────────────────────────────────
export interface SubItem {
  codiceDeiOriginal: string;
  descrizioneDei: string;
  codicePrezzarioTarget: string;
  descrizionePrezzarioTarget: string;
  confiancaMatch: number;
  quantitaComposizione: number;
  valoreUnitario: number;
  status: StatusItem;
}

export interface ResultadoItem {
  idElemento: string;
  edificio: string;
  livello: string;
  zona: string;
  categoria: string;
  descrizioneElemento: string;
  tipoPrezzo: TipoPrezzo;
  quantitaElemento: number;
  unidade: string;
  valoreUnitario: number;
  total: number;
  originePrezzo: string;
  status: StatusItem;
  subItems: SubItem[];
  notes?: string;
}

// ── Prezzario (price list) ────────────────────────────────────────────────────
export interface PrezzarioVoce {
  id?: number;
  prezzarioId: number;
  codice: string;
  descrizione: string;
  valore: number;
  um: string;
  categoria: string;
}

export interface PrezzarioRecord {
  id?: number;
  nome: string;
  dataImport: string;
  totalVoci: number;
}

// ── In-memory module state ────────────────────────────────────────────────────
export interface CmeState {
  elementos: Elemento[];
  resultados: Map<string, ResultadoItem>;
  overrides: Map<string, Partial<ResultadoItem>>;
  chatHistory: Map<string, ChatMessage[]>;
  isProcessing: boolean;
  progress: { current: number; total: number; message: string };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ── Config stored in IndexedDB ────────────────────────────────────────────────
export interface CmeConfig {
  chave: string;
  valor: string;
}
