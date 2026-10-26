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
  /** 'list': a paste-a-list textarea (lib/listParse.ts), type-B widget only. See `listDefault`/`listMin`/`listMax`. */
  type: 'number' | 'percent' | 'currency' | 'list';
  /** For `type: 'list'`, this is the textarea's HTML placeholder text instead. */
  placeholder: string;
  /** Unused for `type: 'list'` (kept required so every other input type stays simple); use `listDefault`. */
  defaultValue: number;
  step?: number;
  min?: number;
  /** Type-B widget: a unit menu from lib/units.ts. `unit` is the one compute() expects (default: the base). */
  dimension?: UnitDimension;
  unit?: string;
  /** Type-B widget: a fixed choice (filing status, pay frequency) shown as a menu. compute() gets the value. */
  options?: { value: number; label: string }[];
  /** `type: 'list'` only: the numbers shown in the textarea by default. */
  listDefault?: number[];
  /** `type: 'list'` only: minimum numbers required before the widget treats the field as complete. Default 1. */
  listMin?: number;
  /** `type: 'list'` only: numbers beyond this many are dropped. Default lib/listParse.ts's LIST_MAX (1000). */
  listMax?: number;
};

/** `date`: the value is epoch ms of a local calendar date, printed as a long date. */
export type BreakdownFormat = 'currency' | 'percent' | 'integer' | 'number' | 'significant' | 'date';

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
  /**
   * Two `type: 'list'` input ids that must parse to the same length (e.g. paired x/y data). When
   * they currently differ, the widget shows a specific "lengths don't match" message naming both
   * counts instead of the generic "fill in every field" one — `compute()` itself must still return
   * NaN for a mismatch (this is a display-only hint, not what makes the guard honest). See
   * correlation-calculator / linear-regression-calculator and
   * mdFiles/steps/41-wave-1-statistics.md, "Run 4".
   */
  pairedLists?: [string, string];
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
  /** Display-only figures for the visuals, from every variable (SI) and output. */
  derive?: (si: Record<string, number>) => Record<string, number>;
  /** Result visuals from the kit, fed by key (a variable, an `outputs` id or a `derive` key, all SI). */
  visuals?: BreakdownVisual[];
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
  /**
   * A real, computed "common conversions" table for conversion pages (mdFiles/steps/42-wave-1-conversion.md).
   * `values` (in `from` units) are converted to `to` units through lib/units.ts at render time, never
   * typed in. `reverse`, when present, is a second table in the opposite direction with its own values
   * (in `to` units, converted back to `from`) and title.
   */
  commonValues?: {
    title: string;
    dimension: UnitDimension;
    from: string;
    to: string;
    values: number[];
    /**
     * A second table, `to` units -> `from` units, with its own values (in `to` units) and title.
     * Its own `feetInches`/`stoneLbs` is local to ITS columns: 'from' is this table's left column
     * (displayed in `to` units), 'to' is its right column (displayed in `from` units).
     */
    reverse?: { title: string; values: number[]; feetInches?: 'from' | 'to'; stoneLbs?: 'from' | 'to' };
    /** Decimal places for a plain numeric cell. Default 2. Ignored for a feet+inches/stone+lb column. */
    decimals?: number;
    /**
     * Render the named column (dimension must be 'length') as "5 ft 11 in" instead of a decimal
     * number — e.g. a height row on cm<->in or ft<->m pages. The value is still computed in that
     * column's real unit via lib/units.ts; this only changes how it is displayed (lib/commonValues.ts).
     */
    feetInches?: 'from' | 'to';
    /**
     * Render the named column (dimension must be 'mass') as "11 st 4 lb" instead of a decimal
     * number — body-weight rows on a kg<->stone page (mdFiles/steps/42-wave-1-conversion.md, run 4).
     * Same principle as `feetInches`: rounds the total pounds first, then splits, so it can never
     * print "14 lb".
     */
    stoneLbs?: 'from' | 'to';
  };
  /**
   * A generic, computed reference table for pages whose numbers are not a `lib/units.ts` factor —
   * e.g. a cooking ingredient's density (mdFiles/steps/42-wave-1-conversion.md, "Run 6"). Parallel
   * to `commonValues`, not a replacement: use whichever field actually fits the page's numbers.
   * `values` must be the result of a computed expression in the data file (a lookup-table density
   * times an amount, or a `lib/units.ts` conversion), never a literal copied from a hand calculation.
   */
  referenceTable?: {
    title: string;
    /** Header row: the label column's header, then one header per `values` entry. */
    columns: string[];
    rows: { label: string; values: number[] }[];
    /** Decimal places for a cell. Default 0. */
    decimals?: number;
    /** A short footnote under the table, e.g. the method or source a density assumes. */
    note?: string;
  };
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
  /**
   * `lists` holds the parsed numbers of every `type: 'list'` input, keyed by its id — `values`
   * never carries a list input's id. Calculators with no list input ignore the second parameter
   * (a function with fewer declared parameters than this type still satisfies it).
   */
  compute: (values: CalculatorInputValues, lists: Record<string, number[]>) => Record<string, number>;
};

export type CalculatorInputValues = Record<string, number>;
