// State of the auto-solve widget, as plain functions so they can be unit-tested.
// See mdFiles/steps/31-solver-v2.md.
import type { CalculatorSolver } from '../data/calculators/index.ts';
import { findRoot } from './solve.ts';
import { UNITS, toBase, type UnitDimension } from './units.ts';

// `order` lists the non-fixed variable ids from least to most recently edited; the least recent one
// is always the calculated field. Fixed variables are always inputs and never appear in it.
export type SolverState = {
  values: Record<string, string>;
  units: Record<string, string>;
  order: string[];
};

export type Solution = {
  target: string;
  /** The solved variable in SI, or NaN when there is no answer. */
  result: number;
  /** Every variable in SI, the solved one included. */
  si: Record<string, number>;
  outputs: Record<string, number>;
};

export const parse = (raw: string) => (raw.trim() === '' ? NaN : Number(raw.replace(/,/g, '')));
// Editable form of a number: 6 significant figures, no grouping commas.
export const plain = (value: number) => String(Number(value.toPrecision(6)));

export const isSingleUnit = (dimension: UnitDimension) => UNITS[dimension].length === 1;

export function initialState(solver: CalculatorSolver): SolverState {
  const rotating = solver.variables.filter((v) => !v.fixed).map((v) => v.id);
  return {
    values: Object.fromEntries(solver.variables.map((v) => [v.id, String(v.defaultValue)])),
    units: Object.fromEntries(solver.variables.map((v) => [v.id, v.defaultUnit])),
    order: [solver.defaultTarget, ...rotating.filter((id) => id !== solver.defaultTarget)]
  };
}

/** Typing into a field makes it the most recent; typing into the auto field hands auto on. */
export function editOrder(order: string[], id: string) {
  return order.includes(id) ? [...order.filter((item) => item !== id), id] : order;
}

// Share links carry ?solve=<id>&<id>=<value>&<id>_unit=<unit>.
export function readShareParams(solver: CalculatorSolver, fallback: SolverState, search: string): SolverState {
  const params = new URLSearchParams(search);
  if (!params.has('solve')) return fallback;
  const state: SolverState = { values: { ...fallback.values }, units: { ...fallback.units }, order: [...fallback.order] };
  const target = params.get('solve');
  if (target && state.order.includes(target)) {
    state.order = [target, ...state.order.filter((id) => id !== target)];
  }
  for (const variable of solver.variables) {
    const value = params.get(variable.id);
    const unit = params.get(`${variable.id}_unit`);
    if (value !== null && Number.isFinite(Number(value))) state.values[variable.id] = value;
    if (unit && UNITS[variable.dimension].some((u) => u.id === unit)) state.units[variable.id] = unit;
  }
  return state;
}

export function shareParams(solver: CalculatorSolver, state: SolverState) {
  const target = state.order[0];
  const params = new URLSearchParams({ solve: target });
  for (const variable of solver.variables) {
    if (variable.id !== target) params.set(variable.id, state.values[variable.id]);
    params.set(`${variable.id}_unit`, state.units[variable.id]);
  }
  return params.toString();
}

/** Closed form when the solver has one for `id`, otherwise the root of `equation`. */
export function solveFor(solver: CalculatorSolver, id: string, known: Record<string, number>) {
  const closed = solver.solve?.[id];
  if (closed) return closed(known);
  const variable = solver.variables.find((v) => v.id === id);
  const equation = solver.equation;
  if (!variable || !equation) return NaN;
  const guess = variable.guess ?? toBase(variable.defaultValue, variable.dimension, variable.defaultUnit);
  return findRoot((x) => equation({ ...known, [id]: x }), { bounds: variable.bounds, guess });
}

// Blank, non-numeric or non-finite values (0 mpg is Infinity in SI) mean no answer, like divide by zero.
export function solveState(solver: CalculatorSolver, state: SolverState): Solution {
  const target = state.order[0];
  const si: Record<string, number> = {};
  let complete = true;
  for (const variable of solver.variables) {
    if (variable.id === target) continue;
    const value = toBase(parse(state.values[variable.id]), variable.dimension, state.units[variable.id]);
    if (!Number.isFinite(value)) complete = false;
    si[variable.id] = value;
  }
  const solved = complete ? solveFor(solver, target, si) : NaN;
  const result = Number.isFinite(solved) ? solved : NaN;
  si[target] = result;
  const outputs: Record<string, number> = {};
  for (const output of solver.outputs ?? []) {
    const value = Number.isNaN(result) ? NaN : output.compute(si);
    outputs[output.id] = Number.isFinite(value) ? value : NaN;
  }
  return { target, result, si, outputs };
}
