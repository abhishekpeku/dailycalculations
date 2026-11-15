'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { findCalculator } from '@/data/calculators';
import type { SolverOutput } from '@/data/calculators';
import { formatMoney, formatSignificant } from '@/lib/calculator';
import { UNITS, findUnit, fromBase, toBase, type UnitDimension } from '@/lib/units';
import { editOrder, initialState, isSingleUnit, parse, plain, readShareParams, shareParams, solveState, type SolverState } from '@/lib/solverState';
import { AlsoIn, ELEVATED_CARD, FIELD_GROUP, FieldRow, Headline, OutputItem, OutputList, ResultPanel, WidgetActions, WIDGET_SPLIT, widgetAccent } from '@/components/CalculatorWidget';
import LogScale from '@/components/visuals/LogScale';
import BreakdownVisual from '@/components/BreakdownVisual';
import { describeSolverKey, solverVisualValues } from '@/lib/breakdown';
import { exportTableForVisual, type ExportKind, type ExportPayload } from '@/lib/export';

// Excel needs a real number format per value; everything that isn't money or a rate is a plain
// decimal quantity (its unit already reads in the label/value text shown elsewhere).
const exportKind = (dimension: UnitDimension): ExportKind =>
  dimension === 'currency' ? 'currency' : dimension === 'percent' ? 'percent' : 'decimal';

// Excel's `0.00%` number format multiplies the cell by 100 to display it, so a percent dimension
// (stored as the bare percent number, e.g. 5 for 5%) must be written as the fraction (0.05).
const exportRaw = (shown: number, dimension: UnitDimension) => (dimension === 'percent' ? shown / 100 : shown);

// Fill any fields and the remaining one is calculated. The state logic lives in lib/solverState.ts.

const NUMBER_WORDS: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four' };

// Money always shows cents; everything else 4 significant figures.
const formatValue = (value: number, dimension: UnitDimension) =>
  dimension === 'currency' ? formatMoney(value) : formatSignificant(value);

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

type SolverCalculatorProps = {
  calculatorId: string;
  /** Rendered under the inputs card, in the same (independent-height) left column — e.g. HowItWorksCard. */
  belowInputs?: ReactNode;
  /** Rendered under the result card, in the same (independent-height) right column — e.g. TableOfContents. */
  belowResult?: ReactNode;
};

export default function SolverCalculator({ calculatorId, belowInputs, belowResult }: SolverCalculatorProps) {
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

  const hasVisual = Boolean(answered && solution && solver.visuals?.length) || Boolean(solver.benchmarks && forceVariable);
  const exportData: ExportPayload | null = !answered
    ? null
    : {
        title: calculator?.title ?? '',
        url: typeof window === 'undefined' ? '' : window.location.href,
        inputs: solver.variables
          .filter((v) => v.id !== target)
          .map((v) => {
            const shown = parse(state.values[v.id]);
            return {
              label: v.label,
              value: withUnit(formatValue(shown, v.dimension), v.dimension, state.units[v.id]),
              raw: exportRaw(shown, v.dimension),
              kind: exportKind(v.dimension)
            };
          }),
        result: {
          label: targetVariable.label,
          value: resultText,
          raw: exportRaw(fromBase(result, targetVariable.dimension, state.units[target]), targetVariable.dimension),
          kind: exportKind(targetVariable.dimension)
        },
        outputs: (solver.outputs ?? []).map((output) => {
          const unit = output.unit ?? UNITS[output.dimension][0].id;
          const shown = fromBase(solution?.outputs[output.id] ?? NaN, output.dimension, unit);
          return {
            label: output.label,
            value: Number.isFinite(shown) ? withUnit(formatValue(shown, output.dimension), output.dimension, unit) : '—',
            raw: exportRaw(shown, output.dimension),
            kind: exportKind(output.dimension)
          };
        }),
        table: solution ? exportTableForVisual(solver.visuals?.find((v) => v.type === 'amortization'), solverVisualValues(solver, solution)) : undefined,
        chartSelector: hasVisual ? '[data-export-chart]' : undefined
      };

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
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Enter any {NUMBER_WORDS[solver.variables.length - 1] ?? solver.variables.length - 1} values. The last one is calculated automatically.
      </p>

      <div className={WIDGET_SPLIT}>
      <div className="space-y-4">
      <div className={ELEVATED_CARD}>
      <div className={FIELD_GROUP}>
        {solver.variables.map((variable) => {
          const isTarget = variable.id === target;
          const value = isTarget
            ? (answered ? (variable.dimension === 'currency' ? result.toFixed(2) : plain(fromBase(result, variable.dimension, state.units[variable.id]))) : '')
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
      </div>

      <WidgetActions
        accent={accent}
        calculatorId={calculatorId}
        shareQuery={() => shareParams(solver, state)}
        copyText={resultText}
        onReset={() => {
          if (defaults) setState(defaults);
        }}
        exportData={exportData}
      />
      {belowInputs}
      </div>

      <div className="space-y-4">
      <div className={ELEVATED_CARD}>
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
      </div>
      {belowResult}
      </div>
      </div>
    </div>
  );
}
