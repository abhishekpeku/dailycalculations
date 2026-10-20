'use client';

import { useEffect, useMemo, useState } from 'react';
import { findCalculator } from '@/data/calculators';
import type { SolverOutput } from '@/data/calculators';
import { formatFull, formatSignificant } from '@/lib/calculator';
import { UNITS, findUnit, fromBase, toBase, type UnitDimension } from '@/lib/units';
import { editOrder, initialState, isSingleUnit, parse, plain, readShareParams, shareParams, solveState, type SolverState } from '@/lib/solverState';
import { AlsoIn, FIELD_GROUP, FieldRow, Headline, OutputItem, OutputList, ResultPanel, WidgetActions, WidgetCard, widgetAccent } from '@/components/CalculatorWidget';
import LogScale from '@/components/visuals/LogScale';
import BreakdownVisual from '@/components/BreakdownVisual';
import { describeSolverKey, solverVisualValues } from '@/lib/breakdown';

// Fill any fields and the remaining one is calculated. The state logic lives in lib/solverState.ts.

const NUMBER_WORDS: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four' };

// Money rounds to cents (the region step will format it properly); everything else to 4 significant figures.
const formatValue = (value: number, dimension: UnitDimension) =>
  dimension === 'currency' ? formatFull(Math.round(value * 100) / 100) : formatSignificant(value);

// Single-unit dimensions read inline: 5%, $1,200, or a bare count.
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
    <OutputItem label={output.label}>
      {Number.isFinite(shown) ? withUnit(formatValue(shown, output.dimension), output.dimension, unit) : '—'}
    </OutputItem>
  );
}

// The force scale: 0.01 N to 1 GN, the range of the force-calculator benchmarks.
const FORCE_SCALE = { min: -2, max: 9, ticks: ['0.01 N', '1 N', '1 kN', '1 MN', '1 GN'] };

export default function SolverCalculator({ calculatorId }: { calculatorId: string }) {
  const calculator = findCalculator(calculatorId);
  const solver = calculator?.solver;
  const accent = widgetAccent(calculator?.category ?? '');
  const defaults = useMemo(() => (solver ? initialState(solver) : null), [solver]);
  const [state, setState] = useState<SolverState | null>(defaults);

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

  return (
    <WidgetCard>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Enter any {NUMBER_WORDS[solver.variables.length - 1] ?? solver.variables.length - 1} values. The last one is calculated automatically.
      </p>

      <div className={FIELD_GROUP}>
        {solver.variables.map((variable) => {
          const isTarget = variable.id === target;
          const value = isTarget
            ? (answered ? plain(fromBase(result, variable.dimension, state.units[variable.id])) : '')
            : state.values[variable.id];
          return (
            <FieldRow
              key={variable.id}
              id={`solver-${variable.id}`}
              label={
                <>
                  <span>{variable.label} <span className="font-mono text-slate-400">({variable.symbol})</span></span>
                  {isTarget ? (
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white" style={{ backgroundColor: accent }}>
                      auto
                    </span>
                  ) : null}
                </>
              }
              value={value}
              placeholder={isTarget ? '—' : undefined}
              onChange={(raw) => editValue(variable.id, raw)}
              autoAccent={isTarget ? accent : undefined}
              unitLabel={findUnit(variable.dimension, state.units[variable.id]).label}
              unitOptions={isSingleUnit(variable.dimension) ? undefined : UNITS[variable.dimension]}
              unitValue={state.units[variable.id]}
              onUnitChange={(unitId) => changeUnit(variable.id, unitId)}
              unitAriaLabel={`${variable.label} unit`}
            />
          );
        })}
      </div>

      <ResultPanel
        accent={accent}
        kicker="Result"
        visual={
          answered && solution && solver.visuals?.length ? (
            <div className="space-y-6">
              {solver.visuals.map((visual, index) => (
                <BreakdownVisual
                  key={`${visual.type}-${index}`}
                  visual={visual}
                  all={solverVisualValues(solver, solution)}
                  describe={(id) => describeSolverKey(solver, id)}
                  accent={accent}
                />
              ))}
            </div>
          ) : solver.benchmarks && forceVariable ? (
            <LogScale {...FORCE_SCALE} value={forceSi} benchmarks={solver.benchmarks} accent={accent} title="How big is that force?" valueLabel="Your force" />
          ) : null
        }
      >
        {answered ? (
          <>
            <Headline accent={accent}>{resultText}</Headline>
            <AlsoIn>
              {UNITS[targetVariable.dimension]
                .filter((unit) => unit.id !== state.units[target] && converts(unit.id))
                .slice(0, 4)
                .map((unit) => (
                  <span key={unit.id} className="tabular-nums">{display(result, unit.id)} {unit.label}</span>
                ))}
            </AlsoIn>
            {solver.outputs?.length ? (
              <OutputList>
                {solver.outputs.map((output) => (
                  <OutputRow key={output.id} output={output} value={solution?.outputs[output.id] ?? NaN} />
                ))}
              </OutputList>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter the other values to see the result. {solver.equation ? 'Some combinations have no answer.' : 'A value you divide by cannot be zero.'}
          </p>
        )}
      </ResultPanel>

      <WidgetActions
        accent={accent}
        shareQuery={() => shareParams(solver, state)}
        copyText={resultText}
        onReset={() => {
          if (defaults) setState(defaults);
        }}
      />
    </WidgetCard>
  );
}
