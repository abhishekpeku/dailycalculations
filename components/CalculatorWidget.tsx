'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { TILE_COLORS } from '@/components/IconTile';
import { categoryTheme } from '@/lib/categoryTheme';
import type { ExportPayload } from '@/lib/export';
import { LIST_MAX, parseNumberList } from '@/lib/listParse';
import type { Unit } from '@/lib/units';

// The parts every v2 widget shares (type A SolverCalculator, type B BreakdownCalculator).

export const widgetAccent = (category: string) => TILE_COLORS[categoryTheme(category).color][1];

export const FIELD_GROUP = 'divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white dark:divide-slate-800 dark:bg-slate-950';

// Inputs beside the result at desktop width, stacked on mobile. Same responsive pattern the
// page's own outer grid uses. A near-even split: a FieldRow's label needs enough room not to wrap
// onto 2-3 lines (it shares its row with a ~300px-wide fixed value box + unit selector), but the
// result side holds charts/breakdowns that also want real width — neither side should dominate.
export const WIDGET_SPLIT = 'grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6';

// Shadow + ring only (no background/padding of its own) — wraps an already-rounded-2xl,
// already-backgrounded block (FIELD_GROUP, ResultPanel) so it reads as its own elevated card,
// the same visual weight as HowItWorksCard/TableOfContents, instead of living inside one shared
// card with everything else.
export const ELEVATED_CARD = 'overflow-hidden rounded-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 dark:ring-white/10';

export function WidgetCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[22px] bg-[#F2F2F7] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </div>
  );
}

type FieldRowProps = {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  /** Set on the calculated field: tints the row and the value in the accent. */
  autoAccent?: string;
  /** Shown inline when there is no menu (one unit, or a plain number). */
  unitLabel: string;
  unitOptions?: Unit[];
  unitValue?: string;
  onUnitChange?: (unitId: string) => void;
  unitAriaLabel?: string;
};

// One inset row: label left, value and unit right.
export function FieldRow({ id, label, value, onChange, placeholder, autoAccent, unitLabel, unitOptions, unitValue, onUnitChange, unitAriaLabel }: FieldRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2" style={autoAccent ? { backgroundColor: `${autoAccent}0F` } : undefined}>
      <label htmlFor={id} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 text-sm text-slate-900 dark:text-slate-100">
        {label}
      </label>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={autoAccent ? { color: autoAccent } : undefined}
        className={`w-28 rounded-lg bg-transparent px-2 py-1 text-right text-base tabular-nums outline-none focus:bg-slate-100 dark:focus:bg-slate-900 sm:w-36 ${autoAccent ? 'font-semibold' : 'text-slate-950 dark:text-white'}`}
      />
      {unitOptions && unitOptions.length > 1 && onUnitChange ? (
        <select
          aria-label={unitAriaLabel}
          value={unitValue}
          onChange={(event) => onUnitChange(event.target.value)}
          className="w-24 shrink-0 rounded-lg border-0 bg-slate-100 py-1 pl-2 pr-6 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:w-28"
        >
          {unitOptions.map((unit) => (
            <option key={unit.id} value={unit.id}>{unit.label}</option>
          ))}
        </select>
      ) : (
        <span className="w-24 shrink-0 pl-2 text-sm text-slate-500 dark:text-slate-400 sm:w-28">{unitLabel}</span>
      )}
    </div>
  );
}

type ListFieldRowProps = {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  /** Minimum numbers required; shown as a note while below it. */
  min: number;
  /** Numbers beyond this many are dropped; defaults to lib/listParse.ts's LIST_MAX. */
  max?: number;
};

// A paste-a-list field: a textarea plus a live parsed count and an inline note for anything the
// parser dropped (non-numeric tokens, or the cap). lib/listParse.ts does the actual parsing — this
// component only re-runs it on every keystroke to describe what the user just typed.
export function ListFieldRow({ id, label, value, onChange, placeholder, min, max = LIST_MAX }: ListFieldRowProps) {
  const parsed = useMemo(() => parseNumberList(value, max), [value, max]);

  // Errors: something was dropped, capped, or there isn't enough data yet. Drives aria-invalid.
  const errorNotes: string[] = [];
  if (parsed.ignored.length) {
    const shown = parsed.ignored.slice(0, 5).join(', ');
    const more = parsed.ignored.length > 5 ? `, and ${parsed.ignored.length - 5} more` : '';
    errorNotes.push(`Ignored ${parsed.ignored.length} value${parsed.ignored.length === 1 ? '' : 's'} that weren't numbers: ${shown}${more}.`);
  }
  if (parsed.truncated) errorNotes.push(`Only the first ${max.toLocaleString()} numbers are used.`);
  if (parsed.values.length < min) errorNotes.push(`Enter at least ${min} number${min === 1 ? '' : 's'}.`);

  // Informational only: a comma was read as a thousands separator, not as an error — still stated
  // out loud (never silently), per mdFiles/steps/41-wave-1-statistics.md's "List input" section.
  const infoNotes: string[] = [];
  if (parsed.groupedAsThousands.length) {
    const shown = parsed.groupedAsThousands.slice(0, 3).map((text) => `"${text}"`).join(', ');
    const more = parsed.groupedAsThousands.length > 3 ? `, and ${parsed.groupedAsThousands.length - 3} more` : '';
    infoNotes.push(`Read ${shown}${more} as thousands-separated — the comma was not treated as a separator between numbers.`);
  }

  const infoId = `${id}-info`;
  const errorId = `${id}-note`;
  const describedBy = [infoNotes.length ? infoId : '', errorNotes.length ? errorId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm text-slate-900 dark:text-slate-100">{label}</label>
        <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {parsed.values.length} number{parsed.values.length === 1 ? '' : 's'}
        </span>
      </div>
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        aria-describedby={describedBy}
        aria-invalid={errorNotes.length > 0}
        className="w-full resize-y rounded-lg bg-slate-100 px-3 py-2 text-sm tabular-nums text-slate-950 outline-none focus:bg-white focus:ring-2 focus:ring-slate-300 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 dark:focus:ring-slate-700"
      />
      {infoNotes.length ? (
        <p id={infoId} className="text-xs text-slate-500 dark:text-slate-400">{infoNotes.join(' ')}</p>
      ) : null}
      {errorNotes.length ? (
        <p id={errorId} className="text-xs text-amber-600 dark:text-amber-400">{errorNotes.join(' ')}</p>
      ) : null}
    </div>
  );
}

// One inset row with a menu instead of a number: a fixed choice such as filing status.
export function ChoiceRow({ id, label, value, options, onChange }: { id: string; label: ReactNode; value: string; options: { value: number; label: string }[]; onChange: (raw: string) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <label htmlFor={id} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 text-sm text-slate-900 dark:text-slate-100">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-52 max-w-[60%] shrink-0 rounded-lg border-0 bg-slate-100 py-1 pl-2 pr-6 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 sm:w-64"
      >
        {options.map((option) => (
          <option key={option.value} value={String(option.value)}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

// The result card: accent wash, a kicker, the figures, and an optional visual underneath.
export function ResultPanel({ accent, kicker, children, visual }: { accent: string; kicker: string; children: ReactNode; visual?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-950">
      <div className="p-5" style={{ backgroundImage: `linear-gradient(135deg, ${accent}1F, ${accent}08)` }}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>{kicker}</p>
        {children}
      </div>
      {visual ? <div className="px-5 pb-5" data-export-chart>{visual}</div> : null}
    </div>
  );
}

export function Headline({ accent, children }: { accent: string; children: ReactNode }) {
  return <p className="text-4xl font-bold tabular-nums tracking-tight" style={{ color: accent }}>{children}</p>;
}

/** The headline in other units, under it. */
export function AlsoIn({ children }: { children: ReactNode }) {
  return <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">{children}</p>;
}

export function OutputList({ children }: { children: ReactNode }) {
  return <dl className="mt-4 divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">{children}</dl>;
}

export function OutputItem({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-600 dark:text-slate-300">{label}</dt>
      <dd className="font-semibold tabular-nums text-slate-900 dark:text-white">{children}</dd>
    </div>
  );
}

type DownloadFormat = 'pdf' | 'pdf-table' | 'csv' | 'print';

// Print/PDF/PDF-with-table/CSV, next to Share/Copy/Reset. Null exportData (not answered yet)
// hides the whole control — nothing useful to export. jsPDF/jspdf-autotable are dynamically
// imported only on click, so they never add weight to a calculator page's own bundle.
function DownloadMenu({ calculatorId, exportData }: { calculatorId: string; exportData: ExportPayload | null }) {
  const [format, setFormat] = useState<DownloadFormat>('pdf');
  const [busy, setBusy] = useState(false);

  if (!exportData) return null;

  const run = async () => {
    if (format === 'print') {
      window.print();
      return;
    }
    setBusy(true);
    try {
      if (format === 'csv') {
        const { downloadCsv } = await import('@/lib/exportCsv');
        downloadCsv(calculatorId, exportData);
      } else if (format === 'pdf-table' && exportData.table) {
        const { downloadFullPdf } = await import('@/lib/exportPdf');
        await downloadFullPdf(calculatorId, exportData);
      } else {
        const { downloadSummaryPdf } = await import('@/lib/exportPdf');
        await downloadSummaryPdf(calculatorId, exportData);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <label htmlFor={`${calculatorId}-download-format`} className="sr-only">Download format</label>
      <select
        id={`${calculatorId}-download-format`}
        value={format}
        onChange={(event) => setFormat(event.target.value as DownloadFormat)}
        className="rounded-full border-0 bg-slate-200 py-2 pl-4 pr-8 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="pdf">PDF</option>
        {exportData.table ? <option value="pdf-table">PDF with table</option> : null}
        <option value="csv">CSV</option>
        <option value="print">Print</option>
      </select>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 disabled:opacity-50 dark:text-slate-300 dark:hover:text-white"
      >
        {busy ? 'Preparing…' : 'Download'}
      </button>
    </div>
  );
}

type WidgetActionsProps = {
  accent: string;
  calculatorId: string;
  /** The share link's query string (no `?`), built on click. Empty means the plain page URL. */
  shareQuery: () => string;
  /** Empty disables "Copy result". */
  copyText: string;
  onReset: () => void;
  /** Null hides the download control — nothing answered yet to export. */
  exportData: ExportPayload | null;
};

// Share writes the state into the address bar and copies the link; reset clears it again.
export function WidgetActions({ accent, calculatorId, shareQuery, copyText, onReset, exportData }: WidgetActionsProps) {
  const [notice, setNotice] = useState('');

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2000);
  };

  const share = async () => {
    const query = shareQuery();
    const url = `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', url);
    try {
      await navigator.clipboard.writeText(url);
      flash('Link copied');
    } catch {
      flash('Link is in the address bar');
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      flash('Result copied');
    } catch {
      flash('Copy not available');
    }
  };

  const reset = () => {
    onReset();
    window.history.replaceState(null, '', window.location.pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: accent }}>
        Share result
      </button>
      <button type="button" onClick={copy} disabled={!copyText} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
        Copy result
      </button>
      <button type="button" onClick={reset} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
        Reset
      </button>
      <DownloadMenu calculatorId={calculatorId} exportData={exportData} />
      <span aria-live="polite" className="text-sm text-slate-500 dark:text-slate-400">{notice}</span>
    </div>
  );
}
