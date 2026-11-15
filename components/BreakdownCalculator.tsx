'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
import { AlsoIn, ChoiceRow, ELEVATED_CARD, FIELD_GROUP, FieldRow, Headline, ListFieldRow, OutputItem, OutputList, ResultPanel, WidgetActions, WIDGET_SPLIT, widgetAccent } from '@/components/CalculatorWidget';
import BreakdownVisual from '@/components/BreakdownVisual';
import { exportTableForVisual, type ExportKind, type ExportPayload } from '@/lib/export';

// Excel needs a real number format per value — map this widget's own format vocabularies onto
// the shared ExportKind. `date` has no typed Excel kind yet, so it falls back to plain text.
const exportKindForInput = (input: CalculatorInput): ExportKind | undefined => {
  if (input.type === 'currency') return 'currency';
  if (input.type === 'percent') return 'percent';
  if (input.type === 'number') return 'decimal';
  return undefined; // 'list'
};
const exportKindForFormat = (format: string): ExportKind | undefined => {
  switch (format) {
    case 'currency':
      return 'currency';
    case 'percent':
      return 'percent';
    case 'integer':
      return 'integer';
    case 'number':
    case 'significant':
      return 'decimal';
    default:
      return undefined; // 'date'
  }
};
// Excel's `0.00%` number format multiplies the cell by 100 to display it, so a percent value
// (stored as the bare percent number, e.g. 5 for 5%) must be written as the fraction (0.05).
const exportRaw = (value: number, kind: ExportKind | undefined) => (kind === 'percent' ? value / 100 : value);

// Type B: inputs flow forward into a headline, a breakdown and one visual. The logic lives in lib/breakdown.ts.

const KICKER = 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';

type BreakdownCalculatorProps = {
  calculatorId: string;
  /** Rendered under the inputs card, in the same (independent-height) left column — e.g. HowItWorksCard. */
  belowInputs?: ReactNode;
  /** Rendered under the result card, in the same (independent-height) right column — e.g. TableOfContents. */
  belowResult?: ReactNode;
};

export default function BreakdownCalculator({ calculatorId, belowInputs, belowResult }: BreakdownCalculatorProps) {
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

  const { all, outputKeys, complete, pairedListMismatch } = evaluation;
  const resolved = resolveBreakdown(calculator, outputKeys);
  const describe = (id: string) => describeKey(id, resolved, inputs);
  const show = (id: string) => (mounted ? formatOutput(all[id] ?? NaN, describe(id)) : '—');

  const headlineValue = all[resolved.headline.id] ?? NaN;
  const answered = mounted && complete && Number.isFinite(headlineValue);
  const headlineText = show(resolved.headline.id);
  const visual = calculator.breakdown?.visual;

  const exportData: ExportPayload | null = !answered
    ? null
    : {
        title: calculator.title,
        url: typeof window === 'undefined' ? '' : window.location.href,
        inputs: inputs.map((input) => {
          const kind = exportKindForInput(input);
          const raw = kind === undefined ? undefined : Number(state.values[input.id]);
          return {
            label: input.label,
            value: input.type === 'list' ? (state.values[input.id] ?? '') : `${state.values[input.id] ?? ''} ${inputUnitLabel(input, state.units[input.id])}`.trim(),
            raw: raw !== undefined && Number.isFinite(raw) ? exportRaw(raw, kind) : undefined,
            kind: raw !== undefined && Number.isFinite(raw) ? kind : undefined
          };
        }),
        result: {
          label: resolved.headline.label,
          value: headlineText,
          raw: exportRaw(headlineValue, exportKindForFormat(resolved.headline.format)),
          kind: exportKindForFormat(resolved.headline.format)
        },
        outputs: resolved.rows.map((row) => {
          const kind = exportKindForFormat(row.format);
          const value = all[row.id] ?? NaN;
          return {
            label: row.label,
            value: show(row.id),
            raw: Number.isFinite(value) ? exportRaw(value, kind) : undefined,
            kind: Number.isFinite(value) ? kind : undefined
          };
        }),
        table: exportTableForVisual(visual, all),
        chartSelector: visual ? '[data-export-chart]' : undefined
      };

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
    <div className="space-y-4">
      <div className={WIDGET_SPLIT}>
      <div className="space-y-4">
      <div className={`${ELEVATED_CARD} bg-white p-5 dark:bg-slate-950`}>
      <div className="space-y-5">
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
      </div>
      </div>

      <WidgetActions
        accent={accent}
        calculatorId={calculatorId}
        shareQuery={() => breakdownShareParams(inputs, state)}
        copyText={answered ? `${resolved.headline.label}: ${headlineText}` : ''}
        onReset={() => setState(defaults)}
        exportData={exportData}
      />
      {belowInputs}
      </div>

      <div className="space-y-4">
      <div className={ELEVATED_CARD}>
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
        {mounted && complete && pairedListMismatch ? (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            {pairedListMismatch.aLabel} has {pairedListMismatch.aLength} number{pairedListMismatch.aLength === 1 ? '' : 's'}, but{' '}
            {pairedListMismatch.bLabel.toLowerCase()} has {pairedListMismatch.bLength} — enter the same count in both before this can
            compute a result. Nothing is truncated or padded to force an answer.
          </p>
        ) : null}
        {resolved.rows.length ? (
          <OutputList>
            {resolved.rows.map((row) => (
              <OutputItem key={row.id} label={row.label}>{show(row.id)}</OutputItem>
            ))}
          </OutputList>
        ) : null}
      </ResultPanel>
      </div>
      {belowResult}
      </div>
      </div>
    </div>
  );
}
