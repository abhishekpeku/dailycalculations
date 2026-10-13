'use client';

import { useEffect, useMemo, useState } from 'react';
import { findCalculator } from '@/data/calculators';
import type { BreakdownPart, CalculatorInput } from '@/data/calculators';
import { UNITS, findUnit } from '@/lib/units';
import { isSingleUnit } from '@/lib/solverState';
import {
  alsoInText,
  breakdownShareParams,
  changeUnit,
  computeValues,
  describeId,
  formatOutput,
  initialBreakdownState,
  readBreakdownShareParams,
  resolveBreakdown,
  visualData,
  type BreakdownState
} from '@/lib/breakdown';
import { TILE_COLORS } from '@/components/IconTile';
import { categoryTheme } from '@/lib/categoryTheme';
import Donut from '@/components/visuals/Donut';
import CompareBars from '@/components/visuals/CompareBars';

// Type B: inputs flow forward into a headline, a breakdown and one visual. The logic lives in lib/breakdown.ts.

const suffix = (input: CalculatorInput, unitId: string) =>
  input.dimension ? findUnit(input.dimension, unitId).label : input.type === 'currency' ? findUnit('currency', 'currency').label : input.type === 'percent' ? '%' : '';

export default function BreakdownCalculator({ calculatorId }: { calculatorId: string }) {
  const calculator = findCalculator(calculatorId);
  const breakdown = calculator?.breakdown;
  const inputs = useMemo(() => calculator?.inputs ?? [], [calculator]);
  const accent = TILE_COLORS[categoryTheme(calculator?.category ?? '').color][1];
  const defaults = useMemo(() => initialBreakdownState(inputs), [inputs]);
  const [state, setState] = useState<BreakdownState>(defaults);
  const [notice, setNotice] = useState('');
  // Time-dependent results differ between build time and the visitor's clock; render them after mount.
  const [mounted, setMounted] = useState(!calculator?.timeDependent);

  useEffect(() => {
    setMounted(true);
    setState(readBreakdownShareParams(inputs, defaults, window.location.search));
  }, [inputs, defaults]);

  const values = useMemo(() => computeValues(inputs, state), [inputs, state]);
  const results = useMemo(() => (calculator ? calculator.compute(values) : {}), [calculator, values]);

  if (!calculator || !breakdown) return null;

  const resolved = resolveBreakdown(breakdown, inputs, Object.keys(results));
  const all: Record<string, number> = { ...values, ...results };
  const describe = (id: string) => describeId(id, resolved, inputs);
  const show = (id: string, value: number) => (mounted ? formatOutput(value, describe(id)) : '—');

  const headlineValue = results[resolved.headline.id] ?? NaN;
  const answered = mounted && Number.isFinite(headlineValue);
  const headlineText = show(resolved.headline.id, headlineValue);
  const resultText = answered ? `${resolved.headline.label}: ${headlineText}` : '';

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2000);
  };

  const share = async () => {
    const query = breakdownShareParams(inputs, state);
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
      await navigator.clipboard.writeText(resultText);
      flash('Result copied');
    } catch {
      flash('Copy not available');
    }
  };

  const reset = () => {
    setState(defaults);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const renderRow = (input: CalculatorInput) => (
    <div key={input.id} className="flex items-center gap-3 px-4 py-3">
      <label htmlFor={`breakdown-${input.id}`} className="min-w-0 flex-1 text-sm text-slate-900 dark:text-slate-100">
        {input.label}
      </label>
      <input
        id={`breakdown-${input.id}`}
        inputMode="decimal"
        value={state.values[input.id] ?? ''}
        placeholder={input.placeholder}
        onChange={(event) => setState({ ...state, values: { ...state.values, [input.id]: event.target.value } })}
        className="w-28 rounded-lg bg-transparent px-2 py-1 text-right text-base tabular-nums text-slate-950 outline-none focus:bg-slate-100 dark:text-white dark:focus:bg-slate-900 sm:w-36"
      />
      {input.dimension && !isSingleUnit(input.dimension) ? (
        <select
          aria-label={`${input.label} unit`}
          value={state.units[input.id]}
          onChange={(event) => setState(changeUnit(input, state, event.target.value))}
          className="w-24 shrink-0 rounded-lg border-0 bg-slate-100 py-1 pl-2 pr-6 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:w-28"
        >
          {UNITS[input.dimension].map((unit) => (
            <option key={unit.id} value={unit.id}>{unit.label}</option>
          ))}
        </select>
      ) : (
        <span className="w-24 shrink-0 pl-2 text-sm text-slate-500 dark:text-slate-400 sm:w-28">{suffix(input, state.units[input.id])}</span>
      )}
    </div>
  );

  const groupClass = 'divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white dark:divide-slate-800 dark:bg-slate-950';
  const visual = breakdown.visual && mounted ? visualData(breakdown.visual, all, (id) => describe(id).label) : null;
  const formatFor = (parts: BreakdownPart[]) => (value: number) => formatOutput(value, describe(parts[0]?.from ?? ''));

  return (
    <div className="overflow-hidden rounded-[22px] bg-[#F2F2F7] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <div className="space-y-5 p-5 sm:p-6">
        {resolved.groups.map((group, index) =>
          group.optional ? (
            <details key={group.title ?? index} className="group">
              <summary className="cursor-pointer select-none px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {group.title ?? 'More options'}
              </summary>
              <div className={groupClass}>{group.inputs.map(renderRow)}</div>
            </details>
          ) : (
            <div key={group.title ?? index}>
              {group.title ? (
                <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{group.title}</p>
              ) : null}
              <div className={groupClass}>{group.inputs.map(renderRow)}</div>
            </div>
          )
        )}

        <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-950">
          <div className="p-5" style={{ backgroundImage: `linear-gradient(135deg, ${accent}1F, ${accent}08)` }}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>{resolved.headline.label}</p>
            <p className="text-4xl font-bold tabular-nums tracking-tight" style={{ color: accent }}>{headlineText}</p>
            {answered ? (
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                {alsoInText(headlineValue, resolved.headline).map((text) => (
                  <span key={text} className="tabular-nums">{text}</span>
                ))}
              </p>
            ) : null}
            {resolved.rows.length ? (
              <dl className="mt-4 divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {resolved.rows.map((row) => (
                  <div key={row.id} className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
                    <dt className="text-slate-600 dark:text-slate-300">{row.label}</dt>
                    <dd className="font-semibold tabular-nums text-slate-900 dark:text-white">{show(row.id, results[row.id] ?? NaN)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          {visual && breakdown.visual ? (
            <div className="px-5 pb-5">
              {visual.type === 'donut' && breakdown.visual.type === 'donut' ? (
                <Donut
                  segments={visual.segments}
                  accent={accent}
                  centerLabel={formatOutput(visual.center.value, describe(breakdown.visual.center.from))}
                  centerSub={visual.centerSub ?? visual.center.label}
                  format={formatFor(breakdown.visual.segments)}
                />
              ) : visual.type === 'compareBars' && breakdown.visual.type === 'compareBars' ? (
                <CompareBars bars={visual.bars} accent={accent} title={visual.title} highlight={visual.highlight} format={formatFor(breakdown.visual.bars)} />
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={share} className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: accent }}>
            Share result
          </button>
          <button type="button" onClick={copy} disabled={!resultText} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
            Copy result
          </button>
          <button type="button" onClick={reset} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Reset
          </button>
          <span aria-live="polite" className="text-sm text-slate-500 dark:text-slate-400">{notice}</span>
        </div>
      </div>
    </div>
  );
}
