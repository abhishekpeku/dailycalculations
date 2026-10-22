// State and defaults of the type-B breakdown widget, as plain functions so they can be unit-tested.
// See mdFiles/steps/33-type-b-widget.md.
import type { BreakdownFormat, BreakdownOutput, BreakdownPart, BreakdownVisual, CalculatorConfig, CalculatorInput, CalculatorSolver } from '../data/calculators/index.ts';
import { currencySymbol, formatDate, formatDecimal, formatFull, formatSignificant } from './calculator.ts';
import { formatNumberList, LIST_MAX, parseNumberList } from './listParse.ts';
import { parse, plain, type Solution } from './solverState.ts';
import { UNITS, findUnit, fromBase, toBase } from './units.ts';

export type BreakdownState = {
  values: Record<string, string>;
  units: Record<string, string>;
};

/** An output with every default filled in. */
export type ResolvedOutput = BreakdownOutput & { label: string; format: BreakdownFormat };

export type BreakdownGroup = { title?: string; inputs: CalculatorInput[]; optional: boolean };

export type ResolvedBreakdown = {
  headline: ResolvedOutput;
  rows: ResolvedOutput[];
  groups: BreakdownGroup[];
};

/** `gallonsWithBuffer` → `Gallons with buffer`. */
export const prettify = (key: string) => {
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

// CalculatorForm's money rule, kept as-is so no default figure switches between money and plain number.
const MONEY_KEY = /Amount|Cost|Payment|Interest|Principal/;

function guessFormat(id: string, inputs: CalculatorInput[]): BreakdownFormat {
  const input = inputs.find((item) => item.id === id);
  if (input?.type === 'currency') return 'currency';
  if (input?.type === 'percent') return 'percent';
  return MONEY_KEY.test(id) ? 'currency' : 'number';
}

function resolveOutput(output: BreakdownOutput, inputs: CalculatorInput[]): ResolvedOutput {
  const format =
    output.format ?? (output.dimension === 'currency' ? 'currency' : output.dimension ? 'number' : guessFormat(output.id, inputs));
  return { ...output, label: output.label ?? prettify(output.id), format };
}

const defaultUnit = (input: CalculatorInput) => (input.dimension ? input.unit ?? UNITS[input.dimension][0].id : '');

/** Fills the config defaults. `outputKeys` are the keys compute() returns, in order. */
export function resolveBreakdown(calculator: Pick<CalculatorConfig, 'inputs' | 'breakdown'>, outputKeys: string[]): ResolvedBreakdown {
  const { inputs, breakdown } = calculator;
  const listed = breakdown?.outputs ?? [];
  const find = (id: string) => resolveOutput(listed.find((output) => output.id === id) ?? { id }, inputs);
  const headlineId = breakdown?.headline ?? outputKeys[0] ?? '';
  const headline = find(headlineId);
  if (breakdown?.headlineLabel) headline.label = breakdown.headlineLabel;
  const rowIds = (breakdown?.outputs ? listed.map((output) => output.id) : outputKeys).filter((id) => id !== headlineId);

  const byId = new Map(inputs.map((input) => [input.id, input]));
  const used = new Set<string>();
  const groups: BreakdownGroup[] = (breakdown?.groups ?? []).map((group) => ({
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
  return { headline, rows: rowIds.map(find), groups: groups.filter((group) => group.inputs.length) };
}

/** How to print any key: a resolved output, else an input (by its type and unit), else a guess. */
export function describeKey(id: string, resolved: ResolvedBreakdown, inputs: CalculatorInput[]): ResolvedOutput {
  const output = [resolved.headline, ...resolved.rows].find((item) => item.id === id);
  if (output) return output;
  const input = inputs.find((item) => item.id === id);
  if (!input) return resolveOutput({ id }, inputs);
  return resolveOutput(
    { id, label: input.label, format: guessFormat(id, inputs), dimension: input.dimension, unit: input.dimension ? defaultUnit(input) : undefined },
    inputs
  );
}

export function initialBreakdownState(inputs: CalculatorInput[]): BreakdownState {
  return {
    values: Object.fromEntries(
      inputs.map((input) => [input.id, input.type === 'list' ? (input.listDefault ?? []).join(', ') : String(input.defaultValue)])
    ),
    units: Object.fromEntries(inputs.map((input) => [input.id, defaultUnit(input)]))
  };
}

/** The typed values as compute() expects them: numbers in each input's own `unit`. Blank is NaN. `list` inputs are excluded — see computeLists. */
export function computeValues(inputs: CalculatorInput[], state: BreakdownState): Record<string, number> {
  return Object.fromEntries(
    inputs
      .filter((input) => input.type !== 'list')
      .map((input) => {
        const value = parse(state.values[input.id] ?? '');
        const chosen = state.units[input.id] || defaultUnit(input);
        if (!input.dimension || chosen === defaultUnit(input)) return [input.id, value];
        return [input.id, fromBase(toBase(value, input.dimension, chosen), input.dimension, defaultUnit(input))];
      })
  );
}

/** The parsed numbers of every `type: 'list'` input, keyed by its id. Non-numeric tokens are dropped (lib/listParse.ts). */
export function computeLists(inputs: CalculatorInput[], state: BreakdownState): Record<string, number[]> {
  const lists: Record<string, number[]> = {};
  for (const input of inputs) {
    if (input.type !== 'list') continue;
    lists[input.id] = parseNumberList(state.values[input.id] ?? '', input.listMax ?? LIST_MAX).values;
  }
  return lists;
}

export type Evaluation = {
  /** Every input, output and derived figure, keyed by id. */
  all: Record<string, number>;
  /** Compute keys in order; known even when the inputs are incomplete. */
  outputKeys: string[];
  /** False while any field is blank or not a number: nothing is computed then. */
  complete: boolean;
};

/**
 * Runs compute() (and `derive`) on the typed state. `extra` joins the inputs, e.g. `todayMs` after
 * mount. Incomplete input gives every output NaN; the keys come from a run on the defaults.
 */
export function evaluateBreakdown(
  calculator: Pick<CalculatorConfig, 'inputs' | 'breakdown' | 'compute'>,
  state: BreakdownState,
  extra: Record<string, number> = {}
): Evaluation {
  const values = computeValues(calculator.inputs, state);
  const lists = computeLists(calculator.inputs, state);
  const listInputs = calculator.inputs.filter((input) => input.type === 'list');
  const listsComplete = listInputs.every((input) => (lists[input.id]?.length ?? 0) >= (input.listMin ?? 1));
  const complete = Object.values(values).every(Number.isFinite) && listsComplete;
  const results = complete ? calculator.compute({ ...values, ...extra }, lists) : {};
  const outputKeys = complete
    ? Object.keys(results)
    : Object.keys(
        calculator.compute(
          { ...computeValues(calculator.inputs, initialBreakdownState(calculator.inputs)), ...extra },
          computeLists(calculator.inputs, initialBreakdownState(calculator.inputs))
        )
      );
  const base: Record<string, number> = { ...extra, ...values };
  for (const key of outputKeys) base[key] = complete ? results[key] : NaN;
  const derived = complete && calculator.breakdown?.derive ? calculator.breakdown.derive(base) : {};
  return { all: { ...base, ...derived }, outputKeys, complete };
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

// A list input's share param is capped well below any URL-length problem: 1,000 numbers need
// nowhere near this many characters, so a hand-edited or malicious oversized value is just dropped.
const MAX_SHARE_LIST_CHARS = 12000;

const listParam = (input: CalculatorInput, raw: string) => formatNumberList(parseNumberList(raw, input.listMax ?? LIST_MAX).values);

/** `<id>=<value>` and `<id>_unit=<unit>`, only where they differ from the defaults. List inputs share their parsed, comma-joined form. */
export function breakdownShareParams(inputs: CalculatorInput[], state: BreakdownState) {
  const defaults = initialBreakdownState(inputs);
  const params = new URLSearchParams();
  for (const input of inputs) {
    if (input.type === 'list') {
      const current = listParam(input, state.values[input.id] ?? '');
      if (current !== listParam(input, defaults.values[input.id] ?? '')) params.set(input.id, current);
      continue;
    }
    if (state.values[input.id] !== defaults.values[input.id]) params.set(input.id, state.values[input.id]);
    if (state.units[input.id] !== defaults.units[input.id]) params.set(`${input.id}_unit`, state.units[input.id]);
  }
  return params.toString();
}

/** Applies share params over `fallback`. Unknown ids, non-numbers, unknown units, oversized lists and values outside `options` are ignored. */
export function readBreakdownShareParams(inputs: CalculatorInput[], fallback: BreakdownState, search: string): BreakdownState {
  const params = new URLSearchParams(search);
  const values = { ...fallback.values };
  const units = { ...fallback.units };
  for (const input of inputs) {
    if (input.type === 'list') {
      const raw = params.get(input.id);
      if (raw !== null && raw.length <= MAX_SHARE_LIST_CHARS) values[input.id] = listParam(input, raw);
      continue;
    }
    const raw = params.get(input.id);
    const allowed = raw !== null && Number.isFinite(parse(raw)) && (!input.options || input.options.some((option) => option.value === parse(raw)));
    if (allowed) values[input.id] = raw.trim();
    const unit = params.get(`${input.id}_unit`);
    if (unit && input.dimension && UNITS[input.dimension].some((u) => u.id === unit)) units[input.id] = unit;
  }
  return { values, units };
}

/** The unit text beside an input: a menu label, the currency symbol, `%`, or nothing. */
export function inputUnitLabel(input: CalculatorInput, unitId: string) {
  if (input.dimension === 'currency' || (!input.dimension && input.type === 'currency')) return currencySymbol();
  if (input.dimension) return findUnit(input.dimension, unitId || defaultUnit(input)).label;
  return input.type === 'percent' ? '%' : '';
}

/** One figure as text, with its unit. Currency goes through lib/calculator.ts (region-aware from step 18). */
export function formatOutput(value: number, output: ResolvedOutput, unitId = output.unit): string {
  if (!Number.isFinite(value)) return '—';
  if (output.format === 'currency') return formatFull(value, { currency: true });
  if (output.format === 'percent') return `${formatDecimal(value)}%`;
  if (output.format === 'date') return formatDate(value);
  const text =
    output.format === 'integer' ? formatDecimal(Math.round(value), 0) : output.format === 'significant' ? formatSignificant(value) : formatDecimal(value);
  if (!output.dimension || output.dimension === 'currency') return text;
  const label = findUnit(output.dimension, unitId ?? UNITS[output.dimension][0].id).label;
  if (output.dimension === 'percent') return `${text}${label}`;
  return label ? `${text} ${label}` : text;
}

/** The headline in its `alsoIn` units, e.g. ["20.4 L"]. */
export function alsoInText(value: number, output: ResolvedOutput): string[] {
  const { dimension, unit, alsoIn } = output;
  if (!dimension || !alsoIn?.length || !Number.isFinite(value)) return [];
  const si = toBase(value, dimension, unit ?? UNITS[dimension][0].id);
  return alsoIn.map((id) => formatOutput(fromBase(si, dimension, id), output, id));
}

export type VisualPart = { label: string; value: number; color?: string };

/** The visual's keys looked up in `all`, with labels. `labelOf` names a part without its own label. */
export function visualParts(parts: BreakdownPart[], all: Record<string, number>, labelOf: (id: string) => string): VisualPart[] {
  return parts.map(({ from, label, color }) => ({ label: label ?? labelOf(from), value: all[from] ?? NaN, ...(color ? { color } : {}) }));
}

/** Every key a visual reads, so the widget can format them like the first one. */
export function visualKeys(visual: BreakdownVisual): string[] {
  switch (visual.type) {
    case 'donut':
      return [...visual.segments.map((part) => part.from), visual.center];
    case 'compareBars':
      return visual.bars.map((part) => part.from);
    case 'rangeBar':
    case 'logScale':
      return [visual.value];
    case 'timeline':
      return [visual.start, visual.end];
    case 'amortization':
      return [visual.principal, visual.annualRate, visual.months];
  }
}

// Type-A visuals (solver.visuals) reuse the kit configs. Values are in each dimension's base unit.

/** How to print a solver variable, output or derived key in a visual. */
export function describeSolverKey(solver: CalculatorSolver, id: string): ResolvedOutput {
  const item = solver.variables.find((v) => v.id === id) ?? solver.outputs?.find((o) => o.id === id);
  if (!item) return { id, label: prettify(id), format: MONEY_KEY.test(id) ? 'currency' : 'number' };
  if (item.dimension === 'currency') return { id, label: item.label, format: 'currency' };
  if (item.dimension === 'percent') return { id, label: item.label, format: 'percent' };
  return { id, label: item.label, format: 'number', dimension: item.dimension, unit: UNITS[item.dimension][0].id };
}

/** Every variable, output and derived figure of a solved state, keyed by id. */
export function solverVisualValues(solver: CalculatorSolver, solution: Solution): Record<string, number> {
  const base = { ...solution.si, ...solution.outputs };
  return { ...base, ...(solver.derive?.(base) ?? {}) };
}
