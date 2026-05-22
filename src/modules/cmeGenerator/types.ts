// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/types.ts
// Domain types for the CME Generator module
// ─────────────────────────────────────────────────────────────────────────────

export type StatusItem = 'OK' | 'ALERT' | 'NAO_ENCONTRADO';

// ── Raw Revit CSV row (WBS schema) ───────────────────────────────────────────
export interface Elemento {
  idUnico:    string;
  edificio:   string;   // WBSs_1 — building
  livello:    string;   // WBSs_2 — floor / level
  zona:       string;   // WBSs_3 — space within floor
  descricao:  string;   // Descricao — element description for the computo
  tariffa:    string;   // WBSt_1 or WBSt_3 — prezzario match key
  quantita:   number;   // Count × fatorWBS — final quantity for the computo line
  fatorWBS:   number;   // WBSt_2 or WBSt_4 — multiplier applied to Count
  countRevit: number;   // Count — raw Revit quantity before factor
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

// ── Config (Supabase key-value) ───────────────────────────────────────────────
export interface CmeConfig {
  chave: string;
  valor: string;
}

// ── Learning system ───────────────────────────────────────────────────────────

/** A confirmed match stored in cme_examples for future AI context injection */
export interface CmeExample {
  id?: number;
  descrizioneElemento: string;
  codiceDei:           string;
  descrizioneDei:      string;
  codiceTarget:        string;
  descrizioneTarget:   string;
  valoreUnitario:      number;
  um:                  string;
  categoria:           string;
  scoreConfirmacao:    number; // 1.0 = admin-approved, 0.7 = user-corrected
  vezesUsado:          number;
  aprovadoPor?:        string;
}

/** Summary counts for the review screen */
export interface ReviewStats {
  total:          number;
  ok:             number;
  alert:          number;
  naoEncontrado:  number;
  nvp:            number;
  aprovados:      number;
}

/** Per-item decision made during review */
export type ReviewItemStatus = 'pending' | 'approved' | 'corrected' | 'rejected';

/** ResultadoItem enriched with review decision */
export interface ResultadoItemReview extends ResultadoItem {
  reviewStatus:    ReviewItemStatus;
  correctedValore?: number;     // if user manually changed the price
  correctedCodice?: string;     // if user manually changed the target code
}
