import type { UnitDimension } from '@/lib/units';
import type { Band } from '@/lib/visuals';

export type CalculatorCategory = {
  id: string;
  title: string;
  description: string;
  /** Retired category ids that 301 to this one. */
  redirectFrom?: string[];
};

export type CalculatorInput = {
  id: string;
  label: string;
  type: 'number' | 'percent' | 'currency';
  placeholder: string;
  defaultValue: number;
  step?: number;
  min?: number;
  /** Type-B widget: a unit menu from lib/units.ts. `unit` is the one compute() expects (default: the base). */
  dimension?: UnitDimension;
  unit?: string;
};

export type BreakdownFormat = 'currency' | 'percent' | 'integer' | 'number' | 'significant';

/** One figure in the type-B result card: a compute() key or a `derive` key. */
export type BreakdownOutput = {
  id: string;
  /** Default: the key in sentence case. */
  label?: string;
  /** Default: currency for money keys and currency inputs, otherwise `number` (up to 2 decimals). */
  format?: BreakdownFormat;
  /** The unit the value is in, printed after it. */
  dimension?: UnitDimension;
  unit?: string;
  /** Headline only: other unit ids it is also shown in, e.g. ['L'] beside gallons. */
  alsoIn?: string[];
};

/** A value for a visual, named by key: an input id, a compute() key or a `derive` key (display units). */
export type BreakdownPart = { from: string; label?: string; color?: string };

/** The one result visual of a type-B widget: a component from components/visuals/, fed by key. */
export type BreakdownVisual =
  | { type: 'donut'; segments: BreakdownPart[]; center: string; centerSub?: string }
  | { type: 'compareBars'; bars: BreakdownPart[]; title?: string; highlight?: number }
  | { type: 'rangeBar'; value: string; bands: Band[]; title?: string; valueLabel?: string }
  | {
      type: 'timeline';
      start: string;
      end: string;
      phases?: { label: string; from: string; to: string }[];
      milestones?: { label: string; at: string }[];
      /** Key of "today" on the same axis, e.g. `todayMs` (set after mount on timeDependent calculators). */
      today?: string;
      startLabel?: string;
      endLabel?: string;
      title?: string;
    }
  | { type: 'amortization'; principal: string; annualRate: string; months: string; payment?: string }
  | {
      type: 'logScale';
      value: string;
      min: number;
      max: number;
      ticks: string[];
      benchmarks: { label: string; value: number }[];
      title?: string;
      valueLabel?: string;
    };

/** Type-B "forward + breakdown" widget. Every field is optional: without it the widget uses defaults. */
export type CalculatorBreakdown = {
  /** Key of the big accent number. Default: the first compute() key. */
  headline?: string;
  headlineLabel?: string;
  /** Headline and row formats, rows in order. Default: every other compute() key. */
  outputs?: BreakdownOutput[];
  /** Inset input groups; optional ones sit behind a disclosure. Unlisted inputs go last. */
  groups?: { title?: string; inputs: string[]; optional?: true }[];
  /** Display-only figures from inputs + outputs (compute units), for rows and the visual. */
  derive?: (values: Record<string, number>) => Record<string, number>;
  visual?: BreakdownVisual;
};

export type SolverVariable = {
  id: string;
  label: string;
  symbol: string;
  dimension: UnitDimension;
  defaultValue: number;
  defaultUnit: string;
  /** Always an input, never the auto field (e.g. a loan's down payment, a tip's split count). */
  fixed?: true;
  /** Numeric-solve search range, in SI base units. Percent is the percent number: [0, 100] is 0–100%. */
  bounds?: [number, number];
  /** Numeric-solve starting point, in SI. Defaults to `defaultValue` converted to SI. */
  guess?: number;
};

/** A figure derived from the solved set (e.g. total interest), shown under the main result. */
export type SolverOutput = {
  id: string;
  label: string;
  dimension: UnitDimension;
  /** Display unit; defaults to the dimension's base unit. */
  unit?: string;
  /** Receives every variable in SI, the solved one included. Returns SI, or NaN for no answer. */
  compute: (si: Record<string, number>) => number;
};

/**
 * Solve-for-any-field widget. Every function receives variables in SI base units and returns SI,
 * or NaN when the inputs cannot produce an answer. **Percent is the percent number**: 5 means 5%,
 * so the functions divide by 100 themselves.
 *
 * A variable is solved by its `solve[id]` entry when there is one. Otherwise the widget finds the
 * root of `equation` numerically (lib/solve.ts), within that variable's `bounds`.
 */
export type CalculatorSolver = {
  variables: SolverVariable[];
  defaultTarget: string;
  /** Closed-form solutions. May leave out variables that `equation` covers. */
  solve?: Record<string, (si: Record<string, number>) => number>;
  /** Residual of the governing equation: 0 when the variables are consistent. */
  equation?: (si: Record<string, number>) => number;
  /** Extra results under the main one, computed from the solved set. */
  outputs?: SolverOutput[];
  /** Everyday reference points (SI) drawn on the result scale. */
  benchmarks?: { label: string; value: number }[];
};

export type CalculatorFaq = {
  question: string;
  answer: string;
};

export type CalculatorHowToStep = {
  name: string;
  text: string;
};

/**
 * Hand-written page depth (see mdFiles/instructions.md 4.2). Optional on purpose: a calculator
 * without it renders the thin template, so pages can be deepened one at a time.
 */
export type CalculatorContent = {
  /** "What is X" explainer, rendered before How to use. */
  concept?: {
    title: string;
    paragraphs: string[];
  };
  /** Shown in the byline. ISO date of the last formula/content check. */
  lastReviewed?: string;
  references?: { label: string; url: string }[];
  /** Replaces the input-derived steps in buildHowToSteps, and therefore the HowTo JSON-LD. */
  howTo: {
    intro: string;
    steps: CalculatorHowToStep[];
    outro?: string;
  };
  formula: {
    intro: string;
    expression: string;
    terms: { symbol: string; meaning: string }[];
    note?: string;
  };
  workedExample: {
    intro: string;
    rows: { label: string; value: string }[];
    result: string;
    explanation: string;
  };
  watchOut: { title: string; body: string }[];
};

export type CalculatorConfig = {
  id: string;
  category: string;
  /** ISO date (YYYY-MM-DD) of the last real content change. Not the deploy date. */
  updatedAt: string;
  /** Search synonyms. Surfaces in on-page copy, search matching, JSON-LD alternateName. */
  aliases: string[];
  /** 3-6 sibling calculator ids for the "Related calculators" block. */
  related: string[];
  /** Extra slugs that 301 to this calculator. */
  redirectFrom?: string[];
  title: string;
  description: string;
  example: string;
  /** Long-form page content. Absent on calculators that have not been deepened yet. */
  content?: CalculatorContent;
  /** Present on calculators that can solve for any of their fields (type A, SolverCalculator). */
  solver?: CalculatorSolver;
  /** compute() reads the current date (or `values.todayMs`), so results render only after mount. */
  timeDependent?: true;
  /** Type-B widget layout: headline, rows, input groups, visual. Optional; BreakdownCalculator has defaults. */
  breakdown?: CalculatorBreakdown;
  inputs: CalculatorInput[];
  seo: {
    title: string;
    description: string;
    faq: CalculatorFaq[];
  };
  compute: (values: CalculatorInputValues) => Record<string, number>;
};

export type CalculatorInputValues = Record<string, number>;
