// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/services/excelExporter.ts
// Generate a 5-sheet .xlsx workbook from ResultadoItem[]
// Uses dynamic imports to avoid bundling node: builtins at page load time
// ─────────────────────────────────────────────────────────────────────────────
import type { ResultadoItem } from '../types';
import type ExcelJS from 'exceljs';

// ── Color palette ─────────────────────────────────────────────────────────────
const COLORS = {
  headerBg: '0F3460',
  headerFg: 'FFFFFF',
  ok:       'D4EDDA',
  alert:    'FFF3CD',
  notFound: 'F8D7DA',
  nvp:      'D1ECF1',
  subtotal: 'E8EAF6',
  total:    '1A237E',
  totalFg:  'FFFFFF',
};

function applyHeader(ws: ExcelJS.Worksheet, cols: string[], row = 1): void {
  const headerRow = ws.getRow(row);
  cols.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col;
    cell.font = { bold: true, color: { argb: COLORS.headerFg }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: COLORS.headerFg } } };
  });
  headerRow.height = 28;
}

function statusColor(status: string): string {
  if (status === 'OK')    return COLORS.ok;
  if (status === 'ALERT') return COLORS.alert;
  if (status === 'NVP')   return COLORS.nvp;
  return COLORS.notFound;
}

function buildComputo(wb: ExcelJS.Workbook, results: ResultadoItem[]): void {
  const ws = wb.addWorksheet('Computo');
  ws.columns = [
    { key: 'edificio',    width: 16 },
    { key: 'livello',     width: 12 },
    { key: 'zona',        width: 14 },
    { key: 'categoria',   width: 18 },
    { key: 'descrizione', width: 42 },
    { key: 'qtd',         width: 9  },
    { key: 'um',          width: 8  },
    { key: 'valore',      width: 14 },
    { key: 'total',       width: 16 },
    { key: 'origine',     width: 18 },
    { key: 'status',      width: 12 },
  ];

  applyHeader(ws, [
    'EDIFICIO', 'LIVELLO', 'ZONA', 'CATEGORIA', 'DESCRIZIONE',
    'QTD', 'UM', 'VALORE UNIT.', 'TOTALE', 'PREZZARIO', 'STATUS',
  ]);

  let grandTotal = 0;
  results.forEach((r, i) => {
    const rowNum = i + 2;
    const row = ws.getRow(rowNum);
    row.values = [
      r.edificio, r.livello, r.zona, r.categoria, r.descrizioneElemento,
      r.quantitaElemento, r.unidade, r.valoreUnitario, r.total, r.originePrezzo, r.status,
    ];
    const bgColor = statusColor(r.status);
    row.eachCell({ includeEmpty: true }, cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.alignment = { vertical: 'middle', wrapText: false };
    });
    row.getCell(8).numFmt = '#,##0.00';
    row.getCell(9).numFmt = '#,##0.00';
    row.height = 20;
    grandTotal += r.total;
  });

  const totalRow = ws.getRow(results.length + 2);
  totalRow.getCell(4).value = 'TOTALE GENERALE';
  totalRow.getCell(9).value = grandTotal;
  totalRow.getCell(9).numFmt = '#,##0.00';
  totalRow.eachCell({ includeEmpty: false }, cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.total } };
    cell.font = { bold: true, color: { argb: COLORS.totalFg } };
  });
  totalRow.height = 24;

  ws.autoFilter = { from: 'A1', to: 'K1' };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

function buildCategoria(wb: ExcelJS.Workbook, results: ResultadoItem[]): void {
  const ws = wb.addWorksheet('Categoria');
  ws.columns = [
    { key: 'categoria', width: 30 },
    { key: 'count',     width: 12 },
    { key: 'total',     width: 18 },
    { key: 'pct',       width: 12 },
  ];
  applyHeader(ws, ['CATEGORIA', 'QTD ITENS', 'TOTALE (€)', '%']);

  const map = new Map<string, { count: number; total: number }>();
  const grandTotal = results.reduce((s, r) => s + r.total, 0);
  for (const r of results) {
    const entry = map.get(r.categoria) ?? { count: 0, total: 0 };
    entry.count++;
    entry.total += r.total;
    map.set(r.categoria, entry);
  }

  let rowNum = 2;
  for (const [cat, data] of [...map.entries()].sort((a, b) => b[1].total - a[1].total)) {
    const row = ws.getRow(rowNum++);
    row.values = [cat, data.count, data.total, grandTotal > 0 ? data.total / grandTotal : 0];
    row.getCell(3).numFmt = '#,##0.00';
    row.getCell(4).numFmt = '0.0%';
    row.height = 20;
  }

  const tRow = ws.getRow(rowNum);
  tRow.values = ['TOTALE', results.length, grandTotal, 1];
  tRow.getCell(3).numFmt = '#,##0.00';
  tRow.getCell(4).numFmt = '0.0%';
  tRow.eachCell({ includeEmpty: false }, cell => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.subtotal } };
  });
}

function buildLivello(wb: ExcelJS.Workbook, results: ResultadoItem[]): void {
  const ws = wb.addWorksheet('Livello');
  const edificios = [...new Set(results.map(r => r.edificio))].sort();
  const livelli   = [...new Set(results.map(r => r.livello))].sort();

  ws.getRow(1).getCell(1).value = 'LIVELLO \\ EDIFICIO';
  ws.getRow(1).getCell(1).font = { bold: true };

  edificios.forEach((ed, i) => {
    ws.getRow(1).getCell(i + 2).value = ed;
    ws.getRow(1).getCell(i + 2).font = { bold: true };
    ws.columns[i + 1] = { width: 16 };
  });
  ws.columns[0] = { width: 20 };

  livelli.forEach((lv, rowIdx) => {
    const row = ws.getRow(rowIdx + 2);
    row.getCell(1).value = lv;
    row.getCell(1).font = { bold: true };
    edificios.forEach((ed, colIdx) => {
      const total = results
        .filter(r => r.livello === lv && r.edificio === ed)
        .reduce((s, r) => s + r.total, 0);
      const cell = row.getCell(colIdx + 2);
      cell.value = total || null;
      cell.numFmt = '#,##0.00';
    });
    row.height = 20;
  });
}

function buildEdificio(wb: ExcelJS.Workbook, results: ResultadoItem[]): void {
  const ws = wb.addWorksheet('Edificio');
  ws.columns = [
    { key: 'edificio',  width: 20 },
    { key: 'categoria', width: 26 },
    { key: 'total',     width: 18 },
  ];
  applyHeader(ws, ['EDIFICIO', 'CATEGORIA', 'TOTALE (€)']);

  const edificios = [...new Set(results.map(r => r.edificio))].sort();
  let rowNum = 2;

  for (const ed of edificios) {
    const edItems = results.filter(r => r.edificio === ed);
    const catMap = new Map<string, number>();
    for (const r of edItems) catMap.set(r.categoria, (catMap.get(r.categoria) ?? 0) + r.total);
    const edTotal = edItems.reduce((s, r) => s + r.total, 0);

    for (const [cat, total] of [...catMap.entries()].sort((a, b) => b[1] - a[1])) {
      const row = ws.getRow(rowNum++);
      row.values = [ed, cat, total];
      row.getCell(3).numFmt = '#,##0.00';
      row.height = 20;
    }

    const stRow = ws.getRow(rowNum++);
    stRow.values = [`Subtotale ${ed}`, '', edTotal];
    stRow.getCell(3).numFmt = '#,##0.00';
    stRow.eachCell({ includeEmpty: false }, cell => {
      cell.font = { bold: true, italic: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.subtotal } };
    });
  }

  const tRow = ws.getRow(rowNum);
  const gt = results.reduce((s, r) => s + r.total, 0);
  tRow.values = ['TOTALE GENERALE', '', gt];
  tRow.getCell(3).numFmt = '#,##0.00';
  tRow.eachCell({ includeEmpty: false }, cell => {
    cell.font = { bold: true, color: { argb: COLORS.totalFg } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.total } };
  });
}

function buildDashboard(wb: ExcelJS.Workbook, results: ResultadoItem[]): void {
  const ws = wb.addWorksheet('Dashboard');
  ws.columns = [{ width: 30 }, { width: 22 }];

  const grandTotal = results.reduce((s, r) => s + r.total, 0);
  const okCount    = results.filter(r => r.status === 'OK').length;
  const alertCount = results.filter(r => r.status === 'ALERT').length;
  const nfCount    = results.filter(r => r.status === 'NAO_ENCONTRADO').length;
  const nvpCount   = results.filter(r => r.status === 'NVP').length;

  const kpis: [string | number, string | number][] = [
    ['DASHBOARD — COMPUTO METRICO', ''],
    ['', ''],
    ['KPI', 'Valore'],
    ['Totale Generale (€)', grandTotal],
    ['Totale Elementi', results.length],
    ['Edifici', new Set(results.map(r => r.edificio)).size],
    ['Livelli', new Set(results.map(r => r.livello)).size],
    ['Categorie', new Set(results.map(r => r.categoria)).size],
    ['', ''],
    ['STATUS', 'Conteggio'],
    ['✓ OK', okCount],
    ['⚠ ALERT (verificare)', alertCount],
    ['✗ Non Trovato', nfCount],
    ['◈ NVP', nvpCount],
  ];

  kpis.forEach(([label, value], i) => {
    const rowNum = i + 1;
    const row = ws.getRow(rowNum);
    row.getCell(1).value = label;
    row.getCell(2).value = value;

    if (rowNum === 1) {
      row.getCell(1).font = { bold: true, size: 14, color: { argb: COLORS.totalFg } };
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
      row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
      row.height = 30;
    } else if (label === 'KPI' || label === 'STATUS') {
      row.getCell(1).font = { bold: true };
      row.getCell(2).font = { bold: true };
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.subtotal } };
      row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.subtotal } };
    }

    if (label === 'Totale Generale (€)') {
      row.getCell(2).numFmt = '#,##0.00';
      row.getCell(2).font = { bold: true };
    }

    row.height = row.height || 20;
  });
}

// ── Public export — all heavy imports are lazy ────────────────────────────────
export async function exportExcel(
  results: ResultadoItem[],
  filename = 'Computo_Metrico.xlsx',
): Promise<void> {
  // Dynamic imports: only pulled in when the user clicks Export
  const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
    import('exceljs'),
    import('file-saver'),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'CABLEPRO CME Generator';
  wb.created = new Date();

  buildComputo(wb, results);
  buildCategoria(wb, results);
  buildLivello(wb, results);
  buildEdificio(wb, results);
  buildDashboard(wb, results);

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }), filename);
}
