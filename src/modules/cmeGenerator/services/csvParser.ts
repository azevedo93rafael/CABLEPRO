// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/services/csvParser.ts
// Parse the Revit CSV export into Elemento[]
// ─────────────────────────────────────────────────────────────────────────────
import Papa from 'papaparse';
import type { Elemento, ComposizioneItem, TipoPrezzo } from '../types';

// Column name aliases for flexible mapping
const COL_EDIFICIO    = ['edificio', 'building', 'corpo'];
const COL_LIVELLO     = ['livello', 'level', 'pavimento', 'floor', 'piano'];
const COL_ZONA        = ['zona', 'localita', 'area', 'location'];
const COL_DESC        = ['descrizione', 'description', 'desc', 'elemento'];
const COL_QUANTITA    = ['quantita', 'quantità', 'qty', 'quantity', 'qta'];
const COL_UM          = ['um', 'unità', 'unita', 'unit', 'udm'];
const COL_COMPOSIZIONE = ['composizione_dei', 'composizione', 'composition', 'dei_codes'];
const COL_TIPO        = ['tipo_prezzo', 'tipo', 'price_type', 'type'];

function findCol(headers: string[], aliases: string[]): string | undefined {
  const lower = headers.map(h => h.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_'));
  for (const alias of aliases) {
    const idx = lower.findIndex(h => h.includes(alias));
    if (idx >= 0) return headers[idx];
  }
  return undefined;
}

function parseComposizione(raw: string): ComposizioneItem[] {
  if (!raw || raw.trim() === '' || raw.toLowerCase() === 'nan') return [];
  return raw
    .split(';')
    .map(part => {
      const [codice, qty] = part.trim().split('/');
      if (!codice?.trim()) return null;
      return {
        codiceDei: codice.trim(),
        quantitaComposizione: qty ? parseFloat(qty) || 1 : 1,
      };
    })
    .filter((x): x is ComposizioneItem => x !== null);
}

let _counter = 0;
function makeId(edificio: string, livello: string, zona: string): string {
  _counter++;
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
  return `${safe(edificio)}_${safe(livello)}_${safe(zona)}_${String(_counter).padStart(4, '0')}`;
}

export interface ParseResult {
  elementos: Elemento[];
  warnings: string[];
}

export function parseRevitCsv(text: string): ParseResult {
  _counter = 0;
  const warnings: string[] = [];

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
  });

  if (result.errors.length > 0) {
    warnings.push(...result.errors.map(e => e.message));
  }

  const headers = result.meta.fields ?? [];

  const colEdificio    = findCol(headers, COL_EDIFICIO);
  const colLivello     = findCol(headers, COL_LIVELLO);
  const colZona        = findCol(headers, COL_ZONA);
  const colDesc        = findCol(headers, COL_DESC);
  const colQuantita    = findCol(headers, COL_QUANTITA);
  const colUm          = findCol(headers, COL_UM);
  const colComposizione = findCol(headers, COL_COMPOSIZIONE);
  const colTipo        = findCol(headers, COL_TIPO);

  const missing: string[] = [];
  if (!colEdificio) missing.push('Edificio');
  if (!colDesc) missing.push('Descrizione');
  if (!colQuantita) missing.push('Quantita');
  if (missing.length > 0) {
    throw new Error(
      `CSV missing required columns: ${missing.join(', ')}.\nFound: ${headers.join(', ')}`
    );
  }

  const elementos: Elemento[] = result.data.map((row) => {
    const edificio  = row[colEdificio!]?.trim() ?? '';
    const livello   = colLivello ? row[colLivello]?.trim() ?? '' : '';
    const zona      = colZona ? row[colZona]?.trim() ?? '' : '';
    const tipoRaw   = colTipo ? (row[colTipo]?.trim().toUpperCase() ?? 'PREZZARIO') : 'PREZZARIO';
    const tipoPrezzo: TipoPrezzo = tipoRaw === 'NVP' ? 'NVP' : 'PREZZARIO';

    return {
      idUnico: makeId(edificio, livello, zona),
      edificio,
      livello,
      zona,
      descrizione: row[colDesc!]?.trim() ?? '',
      quantita: parseFloat(row[colQuantita!]?.replace(',', '.') ?? '0') || 0,
      um: colUm ? (row[colUm]?.trim() ?? 'cad') : 'cad',
      composizioneDei: colComposizione
        ? parseComposizione(row[colComposizione] ?? '')
        : [],
      tipoPrezzo,
    };
  });

  return { elementos, warnings };
}
