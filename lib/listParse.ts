// Pure parser for the type-B widget's paste-a-list input (CalculatorInput.type === 'list').
// See mdFiles/steps/41-wave-1-statistics.md, "List input (between run 1 and run 2)".
//
// Accepts numbers separated by commas, whitespace (spaces, tabs, newlines) or semicolons, in any
// mix, so a pasted spreadsheet column (newline-separated) and a comma-separated line both work.
// No eval / new Function anywhere: every token is checked against a strict numeric regex before
// Number() ever sees it, so arbitrary pasted text can only ever become a number or be rejected.
//
// Locale note (Parked): decimals are always a dot; a comma is always a separator, never a decimal
// mark. The site's region system (lib/regions.ts, step 18, not yet built) will eventually need an
// EU comma-decimal mode — this parser does not attempt to guess which role a comma plays.

/** Values beyond this count are dropped, not silently included. */
export const LIST_MAX = 1000;

export type ParsedList = {
  /** Valid numbers, in the order they appeared, capped at `max`. */
  values: number[];
  /** Tokens that could not be parsed as a number, in the order they appeared (not in `values`). */
  ignored: string[];
  /** True when more than `max` valid numbers were found; only the first `max` are kept. */
  truncated: boolean;
};

const SEPARATOR = /[,;\s]+/;

// Optional sign, digits with an optional decimal point (or a bare ".5"/"5." form), optional
// exponent. Matched end-to-end before Number() runs, so "NaN"/"Infinity"/anything non-numeric is
// rejected outright rather than relying on Number()'s own looser parsing.
const NUMBER_TOKEN = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

/** Splits `raw` into numbers and ignored tokens. Empty or whitespace-only input yields `[]`, not an error. */
export function parseNumberList(raw: string, max: number = LIST_MAX): ParsedList {
  const tokens = raw
    .split(SEPARATOR)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  const values: number[] = [];
  const ignored: string[] = [];
  for (const token of tokens) {
    if (!NUMBER_TOKEN.test(token)) {
      ignored.push(token);
      continue;
    }
    const value = Number(token);
    if (!Number.isFinite(value)) {
      ignored.push(token); // unreachable given NUMBER_TOKEN, kept as a defensive guard
      continue;
    }
    values.push(Object.is(value, -0) ? 0 : value);
  }

  const truncated = values.length > max;
  return { values: truncated ? values.slice(0, max) : values, ignored, truncated };
}

/** Compact, canonical form for share links and re-serialization: comma-joined, no extra whitespace. */
export function formatNumberList(values: number[]): string {
  return values.join(',');
}
