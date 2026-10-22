'use client';

import { useEffect, useMemo, useState } from 'react';
import { findCalculator } from '@/data/calculators';
import type { CalculatorInput } from '@/data/calculators';
import { UNITS } from '@/lib/units';
import {
  alsoInText,
  breakdownShareParams,
  changeUnit,
  describeKey,
  evaluateBreakdown,
  formatOutput,
  initialBreakdownState,
  inputUnitLabel,
  readBreakdownShareParams,
  resolveBreakdown,
  type BreakdownState
} from '@/lib/breakdown';
import { AlsoIn, ChoiceRow, FIELD_GROUP, FieldRow, Headline, ListFieldRow, OutputItem, OutputList, ResultPanel, WidgetActions, WidgetCard, widgetAccent } from '@/components/CalculatorWidget';
import BreakdownVisual from '@/components/BreakdownVisual';

// Type B: inputs flow forward into a headline, a breakdown and one visual. The logic lives in lib/breakdown.ts.

const KICKER = 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';

export default function BreakdownCalculator({ calculatorId }: { calculatorId: string }) {
  const calculator = findCalculator(calculatorId);
  const inputs = useMemo(() => calculator?.inputs ?? [], [calculator]);
  const accent = widgetAccent(calculator?.category ?? '');
  const defaults = useMemo(() => initialBreakdownState(inputs), [inputs]);
  const [state, setState] = useState<BreakdownState>(defaults);
  // Time-dependent results differ between build time and the visitor's clock; render them after mount.
  const timeDependent = Boolean(calculator?.timeDependent);
  const [mounted, setMounted] = useState(!timeDependent);
  const [todayMs, setTodayMs] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    if (timeDependent) setTodayMs(Date.now());
    setState(readBreakdownShareParams(inputs, defaults, window.location.search));
  }, [inputs, defaults, timeDependent]);

  const evaluation = useMemo(
    () => (calculator ? evaluateBreakdown(calculator, state, todayMs === null ? {} : { todayMs }) : null),
    [calculator, state, todayMs]
  );

  if (!calculator || !evaluation) return null;

  const { all, outputKeys, complete } = evaluation;
  const resolved = resolveBreakdown(calculator, outputKeys);
  const describe = (id: string) => describeKey(id, resolved, inputs);
  const show = (id: string) => (mounted ? formatOutput(all[id] ?? NaN, describe(id)) : '—');

  const headlineValue = all[resolved.headline.id] ?? NaN;
  const answered = mounted && complete && Number.isFinite(headlineValue);
  const headlineText = show(resolved.headline.id);
  const visual = calculator.breakdown?.visual;

  const renderField = (input: CalculatorInput) => input.type === 'list' ? (
    <ListFieldRow
      key={input.id}
      id={`breakdown-${input.id}`}
      label={input.label}
      value={state.values[input.id] ?? ''}
      placeholder={input.placeholder}
      min={input.listMin ?? 1}
      max={input.listMax}
      onChange={(raw) => setState({ ...state, values: { ...state.values, [input.id]: raw } })}
    />
  ) : input.options ? (
    <ChoiceRow
      key={input.id}
      id={`breakdown-${input.id}`}
      label={input.label}
      value={state.values[input.id] ?? ''}
      options={input.options}
      onChange={(raw) => setState({ ...state, values: { ...state.values, [input.id]: raw } })}
    />
  ) : (
    <FieldRow
      key={input.id}
      id={`breakdown-${input.id}`}
      label={input.label}
      value={state.values[input.id] ?? ''}
      placeholder={input.placeholder}
      onChange={(raw) => setState({ ...state, values: { ...state.values, [input.id]: raw } })}
      unitLabel={inputUnitLabel(input, state.units[input.id])}
      unitOptions={input.dimension ? UNITS[input.dimension] : undefined}
      unitValue={state.units[input.id]}
      onUnitChange={(unitId) => setState(changeUnit(input, state, unitId))}
      unitAriaLabel={`${input.label} unit`}
    />
  );

  return (
    <WidgetCard>
      {resolved.groups.map((group, index) =>
        group.optional ? (
          <details key={group.title ?? index}>
            <summary className={`cursor-pointer select-none px-1 pb-2 ${KICKER}`}>{group.title ?? 'More options'}</summary>
            <div className={FIELD_GROUP}>{group.inputs.map(renderField)}</div>
          </details>
        ) : (
          <div key={group.title ?? index}>
            {group.title ? <p className={`px-1 pb-2 ${KICKER}`}>{group.title}</p> : null}
            <div className={FIELD_GROUP}>{group.inputs.map(renderField)}</div>
          </div>
        )
      )}

      <ResultPanel
        accent={accent}
        kicker={resolved.headline.label}
        visual={visual && answered ? <BreakdownVisual visual={visual} all={all} describe={describe} accent={accent} /> : null}
      >
        <Headline accent={accent}>{headlineText}</Headline>
        {answered && resolved.headline.alsoIn?.length ? (
          <AlsoIn>
            {alsoInText(headlineValue, resolved.headline).map((text) => (
              <span key={text} className="tabular-nums">{text}</span>
            ))}
          </AlsoIn>
        ) : null}
        {mounted && !complete ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Fill in every field to see the result.</p>
        ) : null}
        {resolved.rows.length ? (
          <OutputList>
            {resolved.rows.map((row) => (
              <OutputItem key={row.id} label={row.label}>{show(row.id)}</OutputItem>
            ))}
          </OutputList>
        ) : null}
      </ResultPanel>

      <WidgetActions
        accent={accent}
        shareQuery={() => breakdownShareParams(inputs, state)}
        copyText={answered ? `${resolved.headline.label}: ${headlineText}` : ''}
        onReset={() => setState(defaults)}
      />
    </WidgetCard>
  );
}
