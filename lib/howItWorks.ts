// Derives the "How it works" diagram (inputs -> output) straight from calculator data — no
// per-calculator hand work. See mdFiles/steps/ux-02-calculator-intro-diagram.md.
import type { CalculatorConfig } from '../data/calculators/index.ts';
import { evaluateBreakdown, initialBreakdownState, resolveBreakdown } from './breakdown.ts';

export type FlowField = { symbol?: string; label: string };
export type Flow = { inputs: FlowField[]; output: FlowField; solveAny: boolean };

// Custom-component stubs rendered by a special widget in page.tsx (see the `widget` switch there),
// not BreakdownCalculator or SolverCalculator — there is no generic input/output shape to draw.
const SPECIAL_WIDGETS = new Set([
  'currency-converter',
  'character-counter',
  'hashtag-counter',
  'pomodoro-timer',
  'timezone-meeting-planner',
  'scientific-calculator'
]);

export function buildFlow(calculator: Pick<CalculatorConfig, 'id' | 'solver' | 'inputs' | 'breakdown' | 'compute'>): Flow | null {
  if (SPECIAL_WIDGETS.has(calculator.id)) return null;

  if (calculator.solver) {
    const { variables, defaultTarget } = calculator.solver;
    const output = variables.find((variable) => variable.id === defaultTarget);
    if (!output) return null;
    // `order` in lib/solverState.ts rotates across every non-fixed variable, so any of them (not
    // just defaultTarget) can become the auto field; a `fixed` one never can.
    const rotating = variables.filter((variable) => !variable.fixed);
    return {
      inputs: variables.filter((variable) => variable.id !== defaultTarget).map((variable) => ({ symbol: variable.symbol, label: variable.label })),
      output: { symbol: output.symbol, label: output.label },
      solveAny: rotating.length > 1
    };
  }

  if (calculator.inputs.length === 0) return null; // custom-component stub without a solver flag
  const { outputKeys, complete } = evaluateBreakdown(calculator, initialBreakdownState(calculator.inputs));
  if (!complete || outputKeys.length === 0) return null;
  // Same resolver the widget itself uses, so the card's output label can never disagree with it.
  const resolved = resolveBreakdown(calculator, outputKeys);
  return {
    inputs: calculator.inputs.map((input) => ({ label: input.label })),
    output: { label: resolved.headline.label },
    solveAny: false
  };
}

/** "a", "a and b", or "a, b, and c" — an Oxford comma, matching lib/seo.ts's buildAliasSentence style. */
export function joinAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/** The screen-reader sentence for the diagram, e.g. "Enter home price, down payment, loan term, and interest rate to get the monthly payment." */
export function describeFlow(flow: Flow): { inputs: string; output: string } {
  const lowerFirst = (text: string) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : text);
  return {
    inputs: joinAnd(flow.inputs.map((input) => lowerFirst(input.label))),
    output: lowerFirst(flow.output.label)
  };
}
