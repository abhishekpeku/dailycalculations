// CSV export (UX-09). No dependency needed — comma/quote escaping by hand, then a plain browser
// download via Blob + a temporary <a download>. See mdFiles/steps/ux-09-download-export.md.
import type { ExportPayload } from '@/lib/export';

function escapeCsvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** The schedule table if one exists; otherwise a two-column Field,Value summary. */
export function downloadCsv(calculatorId: string, payload: ExportPayload) {
  const rows: (string | number)[][] = payload.table
    ? [payload.table.columns, ...payload.table.rows]
    : [
        ['Field', 'Value'],
        ...payload.inputs.map((row) => [row.label, row.value]),
        [payload.result.label, payload.result.value],
        ...payload.outputs.map((row) => [row.label, row.value])
      ];
  const csv = toCsv(rows);
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${calculatorId}${payload.table ? '-schedule' : '-result'}.csv`);
}
