// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/services/csvParser.ts
// Parse the Revit CSV export into Elemento[]
//
// KEY FIELD: "TARIFFA" — the tariff code from the prezzario that each Revit
// element maps to. This is the primary match key used by the AI.
// It may appear as a standalone column OR inside the composizione column
// (format: "TARIFFA_CODE/quantity;TARIFFA_CODE2/quantity").
// ─────────────────────────────────────────────────────────────────────────────
import Papa from 'papaparse';
import type { Elemento, ComposizioneItem, TipoPrezzo } from '../types';

// ── Column name aliases (flexible, case-insensitive) ──────────────────────────
const COL_EDIFICIO    = ['edificio', 'building', 'corpo', 'fabbricato'];
const COL_LIVELLO     = ['livello', 'level', 'pavimento', 'floor', 'piano'];
const COL_ZONA        = ['zona', 'localita', 'localita\'', 'area', 'location', 'locale'];
const COL_DESC        = ['descrizione', 'description', 'desc', 'elemento', 'nome'];
const COL_QUANTITA    = ['quantita', 'quantità', 'qty', 'quantity', 'qta', 'nr'];
const COL_UM          = ['um', 'unità', 'unita', 'unit', 'udm', 'u.m.'];
// TARIFFA: the prezzario tariff code — this is the primary match key
const COL_TARIFFA     = ['tariffa', 'tariff', 'cod_tariffa', 'codice_tariffa', 'codetarif', 'voce'];
const COL_COMPOSIZIONE = ['composizione_dei', 'composizione', 'composition', 'dei_codes', 'codici'];
const COL_TIPO        = ['tipo_prezzo', 'tipo', 'price_type', 'type', 'tipo_voce'];

function findCol(headers: string[], aliases: string[]): string | undefined {
  const lower = headers.map(h => h.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_'));
  for (const alias of aliases) {
    const idx = lower.findIndex(h => h.includes(alias));
    if (idx >= 0) return headers[idx];
  }
  return undefined;
}

// ── Parse composizione field: "015003r/1;022001a/2" ──────────────────────────
function parseComposizione(raw: string): ComposizioneItem[] {
  if (!raw || raw.trim() === '' || raw.toLowerCase() === 'nan') return [];
  return raw
    .split(/[;,|]/)
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

// ── Parse TARIFFA column (single code, no quantity) ───────────────────────────
// When TARIFFA is a single standalone code, wrap it as one ComposizioneItem
function tariffaToComposizione(tariffa: string): ComposizioneItem[] {
  const t = tariffa.trim();
  if (!t || t.toLowerCase() === 'nan' || t === '-' || t === '') return [];
  return [{ codiceDei: t, quantitaComposizione: 1 }];
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
  detectedColumns: {
    tariffa?: string;
    composizione?: string;
    matchMode: 'tariffa' | 'composizione' | 'description';
  };
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
    warnings.push(...result.errors.slice(0, 5).map(e => e.message));
  }

  const headers = result.meta.fields ?? [];

  const colEdificio    = findCol(headers, COL_EDIFICIO);
  const colLivello     = findCol(headers, COL_LIVELLO);
  const colZona        = findCol(headers, COL_ZONA);
  const colDesc        = findCol(headers, COL_DESC);
  const colQuantita    = findCol(headers, COL_QUANTITA);
  const colUm          = findCol(headers, COL_UM);
  const colTariffa     = findCol(headers, COL_TARIFFA);    // ← primary match key
  const colComposizione = findCol(headers, COL_COMPOSIZIONE);
  const colTipo        = findCol(headers, COL_TIPO);

  // Determine match mode
  const matchMode: 'tariffa' | 'composizione' | 'description' =
    colTariffa     ? 'tariffa' :
    colComposizione ? 'composizione' : 'description';

  const missing: string[] = [];
  if (!colEdificio) missing.push('Edificio');
  if (!colDesc)     missing.push('Descrizione');
  if (!colQuantita) missing.push('Quantita');
  if (missing.length > 0) {
    throw new Error(
      `CSV com colunas obrigatórias ausentes: ${missing.join(', ')}.\nColunas encontradas: ${headers.join(', ')}`
    );
  }

  if (matchMode === 'description') {
    warnings.push(
      'Coluna TARIFFA não encontrada. A IA usará correspondência por descrição (menos preciso). ' +
      `Colunas detectadas: ${headers.join(', ')}`
    );
  } else {
    warnings.push(`✓ Modo de match: ${matchMode === 'tariffa' ? `TARIFFA (coluna: "${colTariffa}")` : `composizione DEI (coluna: "${colComposizione}")`}`);
  }

  const elementos: Elemento[] = result.data
    .filter(row => {
      // Skip empty rows
      const desc = colDesc ? (row[colDesc] ?? '').trim() : '';
      return desc !== '' && desc.toLowerCase() !== 'nan';
    })
    .map((row) => {
      const edificio   = row[colEdificio!]?.trim() ?? '';
      const livello    = colLivello ? row[colLivello]?.trim() ?? '' : '';
      const zona       = colZona   ? row[colZona]?.trim() ?? ''   : '';
      const tipoRaw    = colTipo   ? (row[colTipo]?.trim().toUpperCase() ?? 'PREZZARIO') : 'PREZZARIO';
      const tipoPrezzo: TipoPrezzo = tipoRaw === 'NVP' ? 'NVP' : 'PREZZARIO';

      // ── Build composizioneDei from TARIFFA or composizione column ────────
      let composizioneDei: ComposizioneItem[] = [];
      if (colTariffa && row[colTariffa]) {
        composizioneDei = tariffaToComposizione(row[colTariffa]);
      } else if (colComposizione && row[colComposizione]) {
        composizioneDei = parseComposizione(row[colComposizione]);
      }

      return {
        idUnico: makeId(edificio, livello, zona),
        edificio,
        livello,
        zona,
        descrizione:     row[colDesc!]?.trim() ?? '',
        quantita:        parseFloat(row[colQuantita!]?.replace(',', '.') ?? '0') || 0,
        um:              colUm ? (row[colUm]?.trim() ?? 'cad') : 'cad',
        composizioneDei,
        tipoPrezzo,
      };
    });

  return {
    elementos,
    warnings,
    detectedColumns: { tariffa: colTariffa, composizione: colComposizione, matchMode },
  };
}
