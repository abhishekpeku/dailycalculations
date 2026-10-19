'use client';

import { useState, type ReactNode } from 'react';
import { TILE_COLORS } from '@/components/IconTile';
import { categoryTheme } from '@/lib/categoryTheme';
import type { Unit } from '@/lib/units';

// The parts every v2 widget shares (type A SolverCalculator, type B BreakdownCalculator).

export const widgetAccent = (category: string) => TILE_COLORS[categoryTheme(category).color][1];

export const FIELD_GROUP = 'divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white dark:divide-slate-800 dark:bg-slate-950';

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
    <div className="flex items-center gap-3 px-4 py-3" style={autoAccent ? { backgroundColor: `${autoAccent}0F` } : undefined}>
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
      {visual ? <div className="px-5 pb-5">{visual}</div> : null}
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

type WidgetActionsProps = {
  accent: string;
  /** The share link's query string (no `?`), built on click. Empty means the plain page URL. */
  shareQuery: () => string;
  /** Empty disables "Copy result". */
  copyText: string;
  onReset: () => void;
};

// Share writes the state into the address bar and copies the link; reset clears it again.
export function WidgetActions({ accent, shareQuery, copyText, onReset }: WidgetActionsProps) {
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
      <span aria-live="polite" className="text-sm text-slate-500 dark:text-slate-400">{notice}</span>
    </div>
  );
}
