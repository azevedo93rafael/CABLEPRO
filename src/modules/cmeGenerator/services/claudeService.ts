// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/services/claudeService.ts
// All Anthropic API calls: price matching + interactive chat
// Uses dynamic import to avoid the @anthropic-ai/sdk crashing the browser
// at module load time (SDK has node: builtins that don't exist in browsers)
// ─────────────────────────────────────────────────────────────────────────────
import type Anthropic from '@anthropic-ai/sdk';
import type { Elemento, PrezzarioVoce, ResultadoItem, SubItem, StatusItem, ChatMessage } from '../types';

const CLAUDE_MODEL    = 'claude-opus-4-5';
const MAX_TOKENS      = 4096;
const CONFIDENCE_OK   = 0.85;
const CONFIDENCE_ALERT = 0.60;

// API key from env (set in .env as VITE_ANTHROPIC_KEY)
const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY as string | undefined;

// ── Lazy loader: imports Anthropic only when first called ─────────────────────
let _clientPromise: Promise<Anthropic> | null = null;

async function getClient(): Promise<Anthropic> {
  if (!_clientPromise) {
    _clientPromise = (async () => {
      if (!API_KEY) throw new Error('VITE_ANTHROPIC_KEY não configurada no .env');
      // Dynamic import keeps the node: builtins out of the initial bundle
      const { default: AnthropicClass } = await import('@anthropic-ai/sdk');
      return new AnthropicClass({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
    })();
  }
  return _clientPromise;
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

// ── Main: process one Elemento against the target prezzario ───────────────────
export async function processElemento(
  elemento: Elemento,
  allVoci: PrezzarioVoce[],
  prezzarioNomeRef: string,
  prezzarioNomeTarget: string,
): Promise<ResultadoItem> {
  const client = await getClient();

  const composizioni = elemento.composizioneDei.length > 0
    ? elemento.composizioneDei
    : [{ codiceDei: elemento.descrizione, quantitaComposizione: 1 }];

  const snippets = composizioni.map(c => ({
    codiceDei: c.codiceDei,
    qtd: c.quantitaComposizione,
    snippet: buildPrezzarioSnippet(allVoci, c.codiceDei),
  }));

  const prompt = `Sei un esperto di prezzari italiani per impianti elettrici.

Devi abbinare voci del prezzario DEI (${prezzarioNomeRef}) al prezzario target (${prezzarioNomeTarget}).

ELEMENTO:
- Edificio: ${elemento.edificio}
- Livello: ${elemento.livello}
- Descrizione: ${elemento.descrizione}
- Quantità elemento: ${elemento.quantita} ${elemento.um}
- Tipo: ${elemento.tipoPrezzo}

COMPOSIZIONE DEI (voci da abbinare):
${snippets.map(s => `DEI: ${s.codiceDei} (x${s.qtd})\nPrezzario disponibile:\n${s.snippet || '(nessuna voce trovata)'}`).join('\n\n')}

Rispondi SOLO con JSON (nessun testo fuori dal JSON):
{
  "elemento_id": "${elemento.idUnico}",
  "categoria": "categoria dell'elemento (es: Impianti Elettrici, Cavi, Quadri)",
  "items_processados": [
    {
      "codice_dei_original": "015003r",
      "descricao_dei": "descrizione voce DEI",
      "codice_prezzario_target": "codice nel prezzario target",
      "descricao_prezzario_target": "descrizione nel prezzario target",
      "confianca_match": 0.95,
      "quantita_composizione": 1.0,
      "valore_unitario": 2.50,
      "status": "OK"
    }
  ],
  "valore_unitario_elemento": 2.50,
  "totale_elemento": 12.50
}

status può essere: "OK" (confiança ≥ ${CONFIDENCE_OK}), "ALERT" (≥ ${CONFIDENCE_ALERT}), "NAO_ENCONTRADO" (< ${CONFIDENCE_ALERT}).`;

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const msg = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = (msg.content[0] as any).text as string;
      const data = JSON.parse(text.replace(/```json|```/g, '').trim());
      return parseProcessResponse(data, elemento, prezzarioNomeTarget);
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
    idElemento:         elemento.idUnico,
    edificio:           elemento.edificio,
    livello:            elemento.livello,
    zona:               elemento.zona,
    categoria:          data.categoria ?? 'Geral',
    descrizioneElemento: elemento.descrizione,
    tipoPrezzo:         elemento.tipoPrezzo,
    quantitaElemento:   elemento.quantita,
    unidade:            elemento.um,
    valoreUnitario:     data.valore_unitario_elemento ?? 0,
    total:              data.totale_elemento ?? 0,
    originePrezzo,
    status:             overallStatus,
    subItems,
  };
}

export function buildFallback(elemento: Elemento, reason: string): ResultadoItem {
  return {
    idElemento:         elemento.idUnico,
    edificio:           elemento.edificio,
    livello:            elemento.livello,
    zona:               elemento.zona,
    categoria:          'Geral',
    descrizioneElemento: elemento.descrizione,
    tipoPrezzo:         elemento.tipoPrezzo,
    quantitaElemento:   elemento.quantita,
    unidade:            elemento.um,
    valoreUnitario:     0,
    total:              0,
    originePrezzo:      'ERRO',
    status:             'NAO_ENCONTRADO',
    subItems:           [],
    notes:              `Erro: ${reason}`,
  };
}

export function buildNvpResult(
  elemento: Elemento,
  valoreUnitario: number,
  originePrezzo: string,
): ResultadoItem {
  return {
    idElemento:         elemento.idUnico,
    edificio:           elemento.edificio,
    livello:            elemento.livello,
    zona:               elemento.zona,
    categoria:          'NVP',
    descrizioneElemento: elemento.descrizione,
    tipoPrezzo:         'NVP',
    quantitaElemento:   elemento.quantita,
    unidade:            elemento.um,
    valoreUnitario,
    total:              valoreUnitario * elemento.quantita,
    originePrezzo,
    status:             'NVP',
    subItems:           [],
  };
}

export async function chatCommand(
  idElemento: string,
  userText: string,
  currentResult: ResultadoItem,
  history: ChatMessage[],
): Promise<{ mensagem: string; alteracoes: Partial<ResultadoItem>; warnings: string[] }> {
  const client = await getClient();

  const historyMessages = history.slice(-6).map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const systemPrompt = `Sei un assistente per il computo metrico. L'utente può correggere dati di un elemento.
Rispondi SOLO con JSON:
{
  "tipo_comando": "alteracao|consulta|erro",
  "sucesso": true,
  "mensagem_usuario": "messaggio all'utente in portoghese",
  "alteracoes": {
    "valoreUnitario": 2.50,
    "total": 12.50,
    "categoria": "...",
    "originePrezzo": "..."
  },
  "warnings": []
}
Il campo "alteracoes" deve contenere SOLO i campi modificati.`;

  const userPrompt = `Elemento attuale:
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
    const msg = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...historyMessages,
        { role: 'user', content: userPrompt },
      ],
    });
    const text = (msg.content[0] as any).text as string;
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
