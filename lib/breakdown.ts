// State and defaults of the type-B breakdown widget, as plain functions so they can be unit-tested.
// See mdFiles/steps/33-breakdown-widget.md.
import type { BreakdownOutput, BreakdownPart, BreakdownVisual, CalculatorBreakdown, CalculatorInput } from '../data/calculators.ts';
import { formatFull, formatSignificant } from './calculator.ts';
import { parse, plain } from './solverState.ts';
import { UNITS, findUnit, fromBase, toBase } from './units.ts';

export type BreakdownState = {
  values: Record<string, string>;
  units: Record<string, string>;
};

export type BreakdownGroup = { title?: string; inputs: CalculatorInput[]; optional: boolean };

export type ResolvedBreakdown = {
  headline: BreakdownOutput & { label: string };
  rows: (BreakdownOutput & { label: string })[];
  groups: BreakdownGroup[];
};

/** `gallonsWithBuffer` → `Gallons with buffer`. */
export const prettify = (key: string) => {
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const labelled = (output: BreakdownOutput) => ({ ...output, label: output.label ?? prettify(output.id) });

/** Fills the config defaults. `outputKeys` are the keys compute() returns, in order. */
export function resolveBreakdown(breakdown: CalculatorBreakdown, inputs: CalculatorInput[], outputKeys: string[]): ResolvedBreakdown {
  const listed = breakdown.outputs ?? [];
  const find = (id: string) => listed.find((output) => output.id === id) ?? { id };
  const headline = labelled(find(breakdown.headline));
  if (breakdown.headlineLabel) headline.label = breakdown.headlineLabel;
  const rowIds = breakdown.outputs
    ? listed.map((output) => output.id).filter((id) => id !== breakdown.headline)
    : outputKeys.filter((id) => id !== breakdown.headline);
  const rows = rowIds.map((id) => labelled(find(id)));

  const byId = new Map(inputs.map((input) => [input.id, input]));
  const used = new Set<string>();
  const groups: BreakdownGroup[] = (breakdown.groups ?? []).map((group) => ({
    title: group.title,
    optional: Boolean(group.optional),
    inputs: group.inputs.flatMap((id) => {
      const input = byId.get(id);
      if (!input || used.has(id)) return [];
      used.add(id);
      return [input];
    })
  }));
  const rest = inputs.filter((input) => !used.has(input.id));
  if (rest.length) groups.push({ inputs: rest, optional: false });
  return { headline, rows, groups: groups.filter((group) => group.inputs.length) };
}

const defaultUnit = (input: CalculatorInput) => (input.dimension ? input.unit ?? UNITS[input.dimension][0].id : '');

export function initialBreakdownState(inputs: CalculatorInput[]): BreakdownState {
  return {
    values: Object.fromEntries(inputs.map((input) => [input.id, plain(input.defaultValue)])),
    units: Object.fromEntries(inputs.map((input) => [input.id, defaultUnit(input)]))
  };
}

/** The typed values as compute() expects them: numbers, in each input's own `unit`. Blank is NaN. */
export function computeValues(inputs: CalculatorInput[], state: BreakdownState): Record<string, number> {
  return Object.fromEntries(
    inputs.map((input) => {
      const value = parse(state.values[input.id] ?? '');
      if (!input.dimension) return [input.id, value];
      const chosen = state.units[input.id] || defaultUnit(input);
      if (chosen === defaultUnit(input)) return [input.id, value];
      return [input.id, fromBase(toBase(value, input.dimension, chosen), input.dimension, defaultUnit(input))];
    })
  );
}

/** Converts a typed value when its unit menu changes, so the quantity stays the same. */
export function changeUnit(input: CalculatorInput, state: BreakdownState, unitId: string): BreakdownState {
  if (!input.dimension) return state;
  const value = parse(state.values[input.id] ?? '');
  const values = { ...state.values };
  if (Number.isFinite(value)) {
    values[input.id] = plain(fromBase(toBase(value, input.dimension, state.units[input.id]), input.dimension, unitId));
  }
  return { values, units: { ...state.units, [input.id]: unitId } };
}

/** `<id>=<value>` and `<id>_unit=<unit>`, only where they differ from the defaults. */
export function breakdownShareParams(inputs: CalculatorInput[], state: BreakdownState) {
  const defaults = initialBreakdownState(inputs);
  const params = new URLSearchParams();
  for (const input of inputs) {
    if (state.values[input.id] !== defaults.values[input.id]) params.set(input.id, state.values[input.id]);
    if (state.units[input.id] !== defaults.units[input.id]) params.set(`${input.id}_unit`, state.units[input.id]);
  }
  return params.toString();
}

/** Applies share params over `fallback`. Unknown ids, non-numbers and unknown units are ignored. */
export function readBreakdownShareParams(inputs: CalculatorInput[], fallback: BreakdownState, search: string): BreakdownState {
  const params = new URLSearchParams(search);
  const values = { ...fallback.values };
  const units = { ...fallback.units };
  for (const input of inputs) {
    const raw = params.get(input.id);
    if (raw !== null && Number.isFinite(parse(raw))) values[input.id] = raw.trim();
    const unit = params.get(`${input.id}_unit`);
    if (unit && input.dimension && UNITS[input.dimension].some((u) => u.id === unit)) units[input.id] = unit;
  }
  return { values, units };
}

const outputFormat = (output: BreakdownOutput) => output.format ?? (output.dimension === 'currency' ? 'currency' : 'number');

/** One figure as text, with its unit. `¤` is the currency placeholder until the region step. */
export function formatOutput(value: number, output: BreakdownOutput, unitId = output.unit): string {
  if (!Number.isFinite(value)) return '—';
  const format = outputFormat(output);
  if (format === 'currency') return `${findUnit('currency', 'currency').label}${formatFull(Math.round(value * 100) / 100)}`;
  if (format === 'percent') return `${formatSignificant(value)}%`;
  const text = format === 'integer' ? formatFull(Math.round(value)) : formatSignificant(value);
  if (!output.dimension || output.dimension === 'currency') return text;
  const label = findUnit(output.dimension, unitId ?? UNITS[output.dimension][0].id).label;
  if (output.dimension === 'percent') return `${text}${label}`;
  return label ? `${text} ${label}` : text;
}

/** The headline in its `alsoIn` units, e.g. ["5.4 L"]. */
export function alsoInText(value: number, output: BreakdownOutput): string[] {
  const { dimension, unit, alsoIn } = output;
  if (!dimension || !alsoIn?.length || !Number.isFinite(value)) return [];
  const si = toBase(value, dimension, unit ?? UNITS[dimension][0].id);
  return alsoIn.map((id) => formatOutput(fromBase(si, dimension, id), { ...output, format: 'number' }, id));
}

export type VisualPart = { label: string; value: number };

export type VisualData =
  | { type: 'donut'; segments: VisualPart[]; center: VisualPart; centerSub?: string }
  | { type: 'compareBars'; bars: VisualPart[]; title?: string; highlight?: number };

/** Resolves each part against the outputs first, then the inputs. `labelOf` names a bare id. */
export function visualData(visual: BreakdownVisual, values: Record<string, number>, labelOf: (id: string) => string): VisualData {
  const part = ({ from, label }: BreakdownPart): VisualPart => ({ label: label ?? labelOf(from), value: values[from] ?? NaN });
  if (visual.type === 'donut') {
    return { type: 'donut', segments: visual.segments.map(part), center: part(visual.center), centerSub: visual.centerSub };
  }
  return { type: 'compareBars', bars: visual.bars.map(part), title: visual.title, highlight: visual.highlight };
}

/** How to print any id a visual may name: a listed output, else an input by its `type`. */
export function describeId(id: string, resolved: ResolvedBreakdown, inputs: CalculatorInput[]): BreakdownOutput & { label: string } {
  const output = [resolved.headline, ...resolved.rows].find((o) => o.id === id);
  if (output) return output;
  const input = inputs.find((i) => i.id === id);
  if (!input) return { id, label: prettify(id) };
  const format = input.type === 'currency' ? 'currency' : input.type === 'percent' ? 'percent' : 'number';
  return { id, label: input.label, format, dimension: input.dimension, unit: input.dimension ? defaultUnit(input) : undefined };
}
