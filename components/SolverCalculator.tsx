'use client';

import { useEffect, useMemo, useState } from 'react';
import { findCalculator } from '@/data/calculators';
import type { SolverOutput } from '@/data/calculators';
import { formatFull, formatSignificant } from '@/lib/calculator';
import { UNITS, findUnit, fromBase, toBase, type UnitDimension } from '@/lib/units';
import { editOrder, initialState, isSingleUnit, parse, plain, readShareParams, shareParams, solveState, type SolverState } from '@/lib/solverState';
import { TILE_COLORS } from '@/components/IconTile';
import { categoryTheme } from '@/lib/categoryTheme';

// Fill any fields and the remaining one is calculated. The state logic lives in lib/solverState.ts.

const NUMBER_WORDS: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four' };

// Money rounds to cents (the region step will format it properly); everything else to 4 significant figures.
const formatValue = (value: number, dimension: UnitDimension) =>
  dimension === 'currency' ? formatFull(Math.round(value * 100) / 100) : formatSignificant(value);

// Single-unit dimensions read inline: 5%, ¤1,200, or a bare count.
function withUnit(text: string, dimension: UnitDimension, unitId: string) {
  const label = findUnit(dimension, unitId).label;
  if (dimension === 'currency') return `${label}${text}`;
  if (dimension === 'percent') return `${text}${label}`;
  return label ? `${text} ${label}` : text;
}

function OutputRow({ output, value }: { output: SolverOutput; value: number }) {
  const unit = output.unit ?? UNITS[output.dimension][0].id;
  const shown = fromBase(value, output.dimension, unit);
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-600 dark:text-slate-300">{output.label}</dt>
      <dd className="font-semibold tabular-nums text-slate-900 dark:text-white">
        {Number.isFinite(shown) ? withUnit(formatValue(shown, output.dimension), output.dimension, unit) : '—'}
      </dd>
    </div>
  );
}

function LogScale({ value, benchmarks, accent }: { value: number; benchmarks: { label: string; value: number }[]; accent: string }) {
  const min = -2;
  const max = 9;
  const position = (v: number) => Math.min(100, Math.max(0, ((Math.log10(v) - min) / (max - min)) * 100));
  const valid = Number.isFinite(value) && value > 0;

  return (
    <div className="pt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">How big is that force?</p>
      <div className="relative mt-10 h-2 rounded-full bg-gradient-to-r from-sky-200 via-indigo-300 to-rose-300 dark:from-sky-900 dark:via-indigo-800 dark:to-rose-900">
        {benchmarks.map((benchmark, index) => (
          <div key={benchmark.label} className="absolute top-0 -translate-x-1/2" style={{ left: `${position(benchmark.value)}%` }}>
            <div className="mx-auto h-2 w-px bg-slate-500/60" />
            <p
              className={`absolute left-1/2 w-24 -translate-x-1/2 text-center text-[11px] leading-tight text-slate-500 dark:text-slate-400 ${index % 2 === 0 ? 'top-4' : '-top-9'}`}
            >
              {benchmark.label}
            </p>
          </div>
        ))}
        {valid ? (
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow transition-all dark:border-slate-950"
            style={{ left: `${position(value)}%`, backgroundColor: accent }}
            aria-label="Your force"
          />
        ) : null}
      </div>
      <div className="mt-12 flex justify-between text-[11px] text-slate-400">
        <span>0.01 N</span>
        <span>1 N</span>
        <span>1 kN</span>
        <span>1 MN</span>
        <span>1 GN</span>
      </div>
    </div>
  );
}

export default function SolverCalculator({ calculatorId }: { calculatorId: string }) {
  const calculator = findCalculator(calculatorId);
  const solver = calculator?.solver;
  const accent = TILE_COLORS[categoryTheme(calculator?.category ?? '').color][1];
  const defaults = useMemo(() => (solver ? initialState(solver) : null), [solver]);
  const [state, setState] = useState<SolverState | null>(defaults);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (solver && defaults) setState(readShareParams(solver, defaults, window.location.search));
  }, [solver, defaults]);

  const target = state?.order[0] ?? '';

  const solution = useMemo(() => (solver && state ? solveState(solver, state) : null), [solver, state]);
  const result = solution?.result ?? NaN;

  if (!solver || !state) return null;

  const targetVariable = solver.variables.find((v) => v.id === target) ?? solver.variables[0];
  const display = (v: number, unitId: string) => formatValue(fromBase(v, targetVariable.dimension, unitId), targetVariable.dimension);
  const converts = (unitId: string) => Number.isFinite(fromBase(result, targetVariable.dimension, unitId));
  // Not finite in the chosen unit (e.g. 0 m³/m in mpg) counts as no answer too.
  const answered = Number.isFinite(result) && converts(state.units[target]);
  const resultText = answered
    ? `${targetVariable.symbol} = ${withUnit(display(result, state.units[target]), targetVariable.dimension, state.units[target])}`
    : '';

  // The force on the scale, whether it was typed or calculated.
  const forceVariable = solver.variables.find((v) => v.dimension === 'force');
  const forceSi = !forceVariable
    ? NaN
    : forceVariable.id === target
      ? result
      : toBase(parse(state.values[forceVariable.id]), 'force', state.units[forceVariable.id]);

  const editValue = (id: string, raw: string) => {
    const order = editOrder(state.order, id);
    // Typing into the calculated field makes it an input; the least recently edited field takes over.
    setState({ ...state, values: { ...state.values, [id]: raw }, order });
  };

  const changeUnit = (id: string, unitId: string) => {
    const variable = solver.variables.find((v) => v.id === id);
    if (!variable) return;
    const value = parse(state.values[id]);
    const values = { ...state.values };
    if (id !== target && Number.isFinite(value)) {
      values[id] = plain(fromBase(toBase(value, variable.dimension, state.units[id]), variable.dimension, unitId));
    }
    setState({ ...state, values, units: { ...state.units, [id]: unitId } });
  };

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2000);
  };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${shareParams(solver, state)}`;
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
    if (defaults) setState(defaults);
    window.history.replaceState(null, '', window.location.pathname);
  };

  return (
    <div className="overflow-hidden rounded-[22px] bg-[#F2F2F7] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <div className="space-y-5 p-5 sm:p-6">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Enter any {NUMBER_WORDS[solver.variables.length - 1] ?? solver.variables.length - 1} values. The last one is calculated automatically.
        </p>

        <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white dark:divide-slate-800 dark:bg-slate-950">
          {solver.variables.map((variable) => {
            const isTarget = variable.id === target;
            const value = isTarget
              ? (answered ? plain(fromBase(result, variable.dimension, state.units[variable.id])) : '')
              : state.values[variable.id];
            return (
              <div key={variable.id} className="flex items-center gap-3 px-4 py-3" style={isTarget ? { backgroundColor: `${accent}0F` } : undefined}>
                <label htmlFor={`solver-${variable.id}`} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 text-sm text-slate-900 dark:text-slate-100">
                  <span>{variable.label} <span className="font-mono text-slate-400">({variable.symbol})</span></span>
                  {isTarget ? (
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white" style={{ backgroundColor: accent }}>
                      auto
                    </span>
                  ) : null}
                </label>
                <input
                  id={`solver-${variable.id}`}
                  inputMode="decimal"
                  value={value}
                  placeholder={isTarget ? '—' : undefined}
                  onChange={(event) => editValue(variable.id, event.target.value)}
                  style={isTarget ? { color: accent } : undefined}
                  className={`w-28 rounded-lg bg-transparent px-2 py-1 text-right text-base tabular-nums outline-none focus:bg-slate-100 dark:focus:bg-slate-900 sm:w-36 ${isTarget ? 'font-semibold' : 'text-slate-950 dark:text-white'}`}
                />
                {isSingleUnit(variable.dimension) ? (
                  <span className="w-24 shrink-0 pl-2 text-sm text-slate-500 dark:text-slate-400 sm:w-28">{findUnit(variable.dimension, state.units[variable.id]).label}</span>
                ) : (
                  <select
                    aria-label={`${variable.label} unit`}
                    value={state.units[variable.id]}
                    onChange={(event) => changeUnit(variable.id, event.target.value)}
                    className="w-24 shrink-0 rounded-lg border-0 bg-slate-100 py-1 pl-2 pr-6 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:w-28"
                  >
                    {UNITS[variable.dimension].map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.label}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-950">
          <div className="p-5" style={{ backgroundImage: `linear-gradient(135deg, ${accent}1F, ${accent}08)` }}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>Result</p>
            {answered ? (
              <>
                <p className="text-4xl font-bold tabular-nums tracking-tight" style={{ color: accent }}>{resultText}</p>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                  {UNITS[targetVariable.dimension]
                    .filter((unit) => unit.id !== state.units[target] && converts(unit.id))
                    .slice(0, 4)
                    .map((unit) => (
                      <span key={unit.id} className="tabular-nums">{display(result, unit.id)} {unit.label}</span>
                    ))}
                </p>
                {solver.outputs?.length ? (
                  <dl className="mt-4 divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    {solver.outputs.map((output) => (
                      <OutputRow key={output.id} output={output} value={solution?.outputs[output.id] ?? NaN} />
                    ))}
                  </dl>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter the other values to see the result. {solver.equation ? 'Some combinations have no answer.' : 'A value you divide by cannot be zero.'}
              </p>
            )}
          </div>
          {solver.benchmarks && forceVariable ? (
            <div className="px-5 pb-5">
              <LogScale value={forceSi} benchmarks={solver.benchmarks} accent={accent} />
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
