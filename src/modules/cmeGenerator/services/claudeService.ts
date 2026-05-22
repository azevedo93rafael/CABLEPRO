// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/services/claudeService.ts
// AI calls for price matching + interactive chat.
// Uses Google Gemini API (free tier) via native fetch — no extra SDK needed.
// Key: VITE_GEMINI_API_KEY (same key already used by the rest of the app)
// ─────────────────────────────────────────────────────────────────────────────
import type { Elemento, PrezzarioVoce, ResultadoItem, SubItem, StatusItem, ChatMessage, CmeExample } from '../types';
import { findSimilarExamples, incrementExampleUsage } from './examplesService';

const GEMINI_MODEL     = 'gemini-2.0-flash';   // free tier, fast
const GEMINI_BASE_URL  = 'https://generativelanguage.googleapis.com/v1beta/models';
const CONFIDENCE_OK    = 0.85;
const CONFIDENCE_ALERT = 0.60;

// API key — supports both naming conventions:
//   VITE_GEMINI_API_KEY  (explicit VITE_ prefix)
//   GEMINI_API_KEY       (inlined at build time by vite.config define block)
declare const process: { env: Record<string, string | undefined> };
const API_KEY: string | undefined =
  (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
  ?? (process.env.GEMINI_API_KEY as string | undefined);


// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function geminiGenerate(systemInstruction: string, userPrompt: string, maxTokens = 4096): Promise<string> {
  if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY não configurada.');

  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text;
}

// ── Snippet builder ────────────────────────────────────────────────────────────
function buildPrezzarioSnippet(voci: PrezzarioVoce[], codiceDei: string): string {
  const prefix = codiceDei.replace(/[^0-9]/g, '').slice(0, 4);
  const relevant = voci.filter(v => v.codice.replace(/[^0-9]/g, '').startsWith(prefix));
  const subset = relevant.length > 0 ? relevant.slice(0, 40) : voci.slice(0, 60);
  return subset
    .map(v => `${v.codice}|${v.descrizione}|${v.valore}|${v.um}|${v.categoria}`)
    .join('\n');
}

// ── Build few-shot block from confirmed examples ─────────────────────────────
function buildExamplesBlock(examples: CmeExample[]): string {
  if (examples.length === 0) return '';
  const lines = examples.map(e =>
    `DEI: ${e.codiceDei || '—'} | "${e.descrizioneDei || e.descrizioneElemento}" → Target: ${e.codiceTarget} | "${e.descrizioneTarget}" | €${e.valoreUnitario.toFixed(2)} ${e.um} | ${e.categoria}`
  );
  return `\nESEMPI CONFERMATI DALL'AZIENDA (usa come riferimento prioritario):\n${lines.join('\n')}\n`;
}

// ── Main: process one Elemento against the target prezzario ───────────────────
export async function processElemento(
  elemento: Elemento,
  allVoci: PrezzarioVoce[],
  prezzarioNomeRef: string,
  prezzarioNomeTarget: string,
): Promise<ResultadoItem> {
  const composizioni = elemento.composizioneDei.length > 0
    ? elemento.composizioneDei
    : [{ codiceDei: elemento.descrizione, quantitaComposizione: 1 }];

  const snippets = composizioni.map(c => ({
    codiceDei: c.codiceDei,
    qtd: c.quantitaComposizione,
    snippet: buildPrezzarioSnippet(allVoci, c.codiceDei),
  }));

  // ── Fetch similar confirmed examples from the learning bank ──────────────
  const similarExamples = await findSimilarExamples(elemento.descrizione, 8);
  const examplesBlock   = buildExamplesBlock(similarExamples);
  const exampleIds      = similarExamples.map(e => e.id!).filter(Boolean);

  const system = `Sei un esperto di prezzari italiani per impianti elettrici e tecnologici.
Hai profonda conoscenza di:
- Prezzario DEI (Tipologia A: a corpo, Tipologia B: composizione a misura)
- Prezzari regionali italiani (Sicilia, Lombardia, Toscana, ecc.)
- Voci tipiche: cavi FG16, N07V, tubazioni PVC/IRO, quadri elettrici, prese UNEL, corpi illuminanti, impianti speciali
- Codici DEI formato: es. 015003r, E.01.010.a, S.02.003
- Abbreviazioni comuni: UM (cad, m, kg, kW, h), NVP (Nessun Valore di Prezzario)

Abbina voci del prezzario DEI (${prezzarioNomeRef}) al prezzario target (${prezzarioNomeTarget}).
Priorità di abbinamento: codice esatto > descrizione simile > categoria equivalente.
Se la voce non esiste nel target, usa status NAO_ENCONTRADO.
Rispondi SOLO con JSON valido, nessun testo aggiuntivo.`;

  const user = `ELEMENTO:
- Edificio: ${elemento.edificio}
- Livello: ${elemento.livello}
- Descrizione: ${elemento.descrizione}
- Quantità: ${elemento.quantita} ${elemento.um}
- Tipo: ${elemento.tipoPrezzo}
${examplesBlock}
COMPOSIZIONE DEI:
${snippets.map(s => `DEI: ${s.codiceDei} (x${s.qtd})\nPrezzario disponibile:\n${s.snippet || '(nessuna voce trovata)'}`).join('\n\n')}

Rispondi con questo JSON:
{
  "elemento_id": "${elemento.idUnico}",
  "categoria": "categoria (es: Impianti Elettrici, Cavi, Quadri)",
  "items_processados": [
    {
      "codice_dei_original": "015003r",
      "descricao_dei": "descrizione voce DEI",
      "codice_prezzario_target": "codice nel target",
      "descricao_prezzario_target": "descrizione nel target",
      "confianca_match": 0.95,
      "quantita_composizione": 1.0,
      "valore_unitario": 2.50,
      "status": "OK"
    }
  ],
  "valore_unitario_elemento": 2.50,
  "totale_elemento": 12.50
}
status: "OK" (≥${CONFIDENCE_OK}), "ALERT" (≥${CONFIDENCE_ALERT}), "NAO_ENCONTRADO" (<${CONFIDENCE_ALERT})`;

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const text = await geminiGenerate(system, user, 4096);
      const data = JSON.parse(text.replace(/```json|```/g, '').trim());
      const result = parseProcessResponse(data, elemento, prezzarioNomeTarget);
      // Increment usage counters for examples that were actually used
      if (exampleIds.length > 0) incrementExampleUsage(exampleIds).catch(() => {});
      return result;
    } catch (e) {
      if (attempts >= 3) return buildFallback(elemento, String(e));
      await new Promise(r => setTimeout(r, 1000 * attempts));
    }
  }
  return buildFallback(elemento, 'Max retries exceeded');
}

export function parseProcessResponse(
  data: any,
  elemento: Elemento,
  originePrezzo: string,
): ResultadoItem {
  const subItems: SubItem[] = (data.items_processados ?? []).map((item: any) => ({
    codiceDeiOriginal:          item.codice_dei_original ?? '',
    descrizioneDei:             item.descricao_dei ?? '',
    codicePrezzarioTarget:      item.codice_prezzario_target ?? '',
    descrizionePrezzarioTarget: item.descricao_prezzario_target ?? '',
    confiancaMatch:             item.confianca_match ?? 0,
    quantitaComposizione:       item.quantita_composizione ?? 1,
    valoreUnitario:             item.valore_unitario ?? 0,
    status:                     (item.status as StatusItem) ?? 'NAO_ENCONTRADO',
  }));

  let overallStatus: StatusItem = 'OK';
  for (const s of subItems) {
    if (s.status === 'NAO_ENCONTRADO') { overallStatus = 'NAO_ENCONTRADO'; break; }
    if (s.status === 'ALERT' && overallStatus === 'OK') overallStatus = 'ALERT';
  }

  return {
    idElemento:          elemento.idUnico,
    edificio:            elemento.edificio,
    livello:             elemento.livello,
    zona:                elemento.zona,
    categoria:           data.categoria ?? 'Geral',
    descrizioneElemento: elemento.descrizione,
    tipoPrezzo:          elemento.tipoPrezzo,
    quantitaElemento:    elemento.quantita,
    unidade:             elemento.um,
    valoreUnitario:      data.valore_unitario_elemento ?? 0,
    total:               data.totale_elemento ?? 0,
    originePrezzo,
    status:              overallStatus,
    subItems,
  };
}

export function buildFallback(elemento: Elemento, reason: string): ResultadoItem {
  return {
    idElemento:          elemento.idUnico,
    edificio:            elemento.edificio,
    livello:             elemento.livello,
    zona:                elemento.zona,
    categoria:           'Geral',
    descrizioneElemento: elemento.descrizione,
    tipoPrezzo:          elemento.tipoPrezzo,
    quantitaElemento:    elemento.quantita,
    unidade:             elemento.um,
    valoreUnitario:      0,
    total:               0,
    originePrezzo:       'ERRO',
    status:              'NAO_ENCONTRADO',
    subItems:            [],
    notes:               `Erro: ${reason}`,
  };
}

export function buildNvpResult(
  elemento: Elemento,
  valoreUnitario: number,
  originePrezzo: string,
): ResultadoItem {
  return {
    idElemento:          elemento.idUnico,
    edificio:            elemento.edificio,
    livello:             elemento.livello,
    zona:                elemento.zona,
    categoria:           'NVP',
    descrizioneElemento: elemento.descrizione,
    tipoPrezzo:          'NVP',
    quantitaElemento:    elemento.quantita,
    unidade:             elemento.um,
    valoreUnitario,
    total:               valoreUnitario * elemento.quantita,
    originePrezzo,
    status:              'NVP',
    subItems:            [],
  };
}

// ── Chat command ───────────────────────────────────────────────────────────────
export async function chatCommand(
  _idElemento: string,
  userText: string,
  currentResult: ResultadoItem,
  history: ChatMessage[],
): Promise<{ mensagem: string; alteracoes: Partial<ResultadoItem>; warnings: string[] }> {
  const system = `Sei un assistente esperto di computo metrico per impianti elettrici in Italia.
Conosci la terminologia DEI, i prezzari regionali, le norme CEI e le voci tipiche degli impianti.
L'utente può:
- Correggere prezzi unitari (es: "cambia il prezzo per 3.50")
- Cambiare categoria (es: "questa è Illuminazione, non Impianti")
- Chiedere spiegazioni (es: "perché questo ha status ALERT?")
- Modificare l'origine del prezzo
Rispondi SOLO con JSON valido:
{
  "tipo_comando": "alteracao|consulta|erro",
  "sucesso": true,
  "mensagem_usuario": "risposta in portoghese brasiliano (pt-BR)",
  "alteracoes": { "valoreUnitario": 2.50, "total": 12.50, "categoria": "...", "originePrezzo": "..." },
  "warnings": []
}
Il campo "alteracoes" deve contenere SOLO i campi effettivamente modificati.`;

  // Build simple conversation context from history
  const historyContext = history.slice(-4)
    .map(m => `${m.role === 'user' ? 'Utente' : 'Assistente'}: ${m.content}`)
    .join('\n');

  const user = `${historyContext ? `Conversazione precedente:\n${historyContext}\n\n` : ''}Elemento attuale:
ID: ${currentResult.idElemento}
Descrizione: ${currentResult.descrizioneElemento}
Edificio: ${currentResult.edificio} / Livello: ${currentResult.livello}
Categoria: ${currentResult.categoria}
Valore unitario: ${currentResult.valoreUnitario}
Totale: ${currentResult.total}
Quantità: ${currentResult.quantitaElemento} ${currentResult.unidade}
Status: ${currentResult.status}

Comando utente: "${userText}"`;

  try {
    const text = await geminiGenerate(system, user, 1024);
    const data = JSON.parse(text.replace(/```json|```/g, '').trim());
    return {
      mensagem:   data.mensagem_usuario ?? 'Operação concluída.',
      alteracoes: data.alteracoes ?? {},
      warnings:   data.warnings ?? [],
    };
  } catch (e) {
    return {
      mensagem:   `Erro na API: ${String(e)}`,
      alteracoes: {},
      warnings:   [],
    };
  }
}
