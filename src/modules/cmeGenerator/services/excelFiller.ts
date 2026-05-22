// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/services/excelFiller.ts
// Uses ExcelJS to load the user's template from Supabase Storage and fill it.
// ─────────────────────────────────────────────────────────────────────────────
import type { ResultadoItem } from '../types';
import { downloadTemplateBuffer, getTemplateMeta } from './templateService';

/**
 * Groups items by Edificio (WBSs_1) -> Livello (WBSs_2) -> Zona (WBSs_3)
 * and inserts them into the template.
 */
export async function fillTemplateAndExport(
  results: ResultadoItem[],
  filename = 'Computo_Metrico_Gerado.xlsx'
): Promise<void> {
  const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
    import('exceljs'),
    import('file-saver'),
  ]);

  // 1. Fetch template buffer
  let buffer: ArrayBuffer;
  try {
    buffer = await downloadTemplateBuffer();
  } catch (err: any) {
    throw new Error('Não foi possível carregar o template base. Certifique-se de que fez o upload nas Configurações.');
  }

  // 2. Load into ExcelJS
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  // Use the first worksheet
  const ws = wb.worksheets[0];
  if (!ws) throw new Error('O template Excel não contém folhas (worksheets).');

  // 3. Find where the data should start. 
  // We'll look for a header row containing 'TARIFFA' or 'DESCRIZIONE' or 'UM'
  let headerRowIdx = -1;
  let colMap: Record<string, number> = {};

  ws.eachRow((row, rowNumber) => {
    if (headerRowIdx !== -1) return;
    
    let foundTariffa = false;
    let foundDescrizione = false;
    
    row.eachCell((cell, colNumber) => {
      const val = String(cell.value || '').toUpperCase().trim();
      if (val.includes('TARIFFA') || val === 'CODICE DEI') {
        colMap['tariffa'] = colNumber;
        foundTariffa = true;
      }
      if (val.includes('DESCRIZIONE')) {
        colMap['descrizione'] = colNumber;
        foundDescrizione = true;
      }
      if (val === 'UM' || val === 'U.M.') colMap['um'] = colNumber;
      if (val.includes('QUANTITA') || val === 'Q.TÀ' || val === 'QTD') colMap['quantita'] = colNumber;
      if (val === 'PREZZO' || val.includes('UNITARIO') || val === 'PU') colMap['valore'] = colNumber;
      if (val.includes('TOTALE') || val === 'TOT') colMap['totale'] = colNumber;
    });

    if (foundTariffa || foundDescrizione) {
      headerRowIdx = rowNumber;
    }
  });

  if (headerRowIdx === -1) {
    throw new Error('Não foi possível encontrar a linha de cabeçalho no template. Certifique-se que existe uma coluna "TARIFFA" e "DESCRIZIONE".');
  }

  // 4. Group data hierarchically
  // Hierarchy: Edificio -> Livello -> Zona
  const groups = new Map<string, Map<string, Map<string, ResultadoItem[]>>>();

  for (const r of results) {
    const ed = r.edificio || 'Geral';
    const lv = r.livello || 'N/A';
    const zn = r.zona || 'N/A';

    if (!groups.has(ed)) groups.set(ed, new Map());
    const edGroup = groups.get(ed)!;

    if (!edGroup.has(lv)) edGroup.set(lv, new Map());
    const lvGroup = edGroup.get(lv)!;

    if (!lvGroup.has(zn)) lvGroup.set(zn, []);
    lvGroup.get(zn)!.push(r);
  }

  // 5. Insert rows after header
  let currentRowIdx = headerRowIdx + 1;

  const insertGroupHeader = (title: string, level: number) => {
    ws.spliceRows(currentRowIdx, 0, []);
    const row = ws.getRow(currentRowIdx);
    
    // Put title in the description column if found, else first column
    const titleCol = colMap['descrizione'] || 1;
    row.getCell(titleCol).value = title;
    
    // Style the header based on level
    row.eachCell({ includeEmpty: true }, cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: level === 1 ? 'FF1E3A8A' : level === 2 ? 'FF3B82F6' : 'FF93C5FD' } // Blue shades
      };
      cell.font = {
        bold: true,
        color: { argb: level === 1 || level === 2 ? 'FFFFFFFF' : 'FF000000' }
      };
    });
    
    currentRowIdx++;
  };

  const insertItems = (items: ResultadoItem[]) => {
    for (const item of items) {
      // For each subItem (composition) or the main item
      const toRender = item.subItems.length > 0 ? item.subItems : [{
        codicePrezzarioTarget: item.idElemento, // Fallback
        descrizionePrezzarioTarget: item.descrizioneElemento,
        unidade: item.unidade,
        quantitaComposizione: 1,
        valoreUnitario: item.valoreUnitario,
        total: item.total
      }];

      for (const sub of toRender) {
        ws.spliceRows(currentRowIdx, 0, []);
        const row = ws.getRow(currentRowIdx);

        if (colMap['tariffa']) row.getCell(colMap['tariffa']).value = sub.codicePrezzarioTarget;
        if (colMap['descrizione']) row.getCell(colMap['descrizione']).value = sub.descrizionePrezzarioTarget;
        
        // um handling - fallback to parent unit if missing on subitem
        const umVal = (sub as any).unidade || (sub as any).um || item.unidade;
        if (colMap['um']) row.getCell(colMap['um']).value = umVal;
        
        // Quantità = quantitaElemento * quantitaComposizione
        const finalQtd = item.quantitaElemento * (sub.quantitaComposizione || 1);
        if (colMap['quantita']) {
          row.getCell(colMap['quantita']).value = finalQtd;
          row.getCell(colMap['quantita']).numFmt = '#,##0.00';
        }

        if (colMap['valore']) {
          row.getCell(colMap['valore']).value = sub.valoreUnitario;
          row.getCell(colMap['valore']).numFmt = '#,##0.00';
        }

        if (colMap['totale']) {
          const subtot = finalQtd * (sub.valoreUnitario || 0);
          row.getCell(colMap['totale']).value = subtot;
          row.getCell(colMap['totale']).numFmt = '#,##0.00';
        }

        currentRowIdx++;
      }
    }
  };

  for (const [edificio, edGroup] of groups.entries()) {
    insertGroupHeader(edificio, 1);
    for (const [livello, lvGroup] of edGroup.entries()) {
      insertGroupHeader(livello, 2);
      for (const [zona, items] of lvGroup.entries()) {
        insertGroupHeader(zona, 3);
        insertItems(items);
      }
    }
  }

  // 6. Export
  const outBuffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([outBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }), filename);
}
