// Pure parser for the type-B widget's paste-a-list input (CalculatorInput.type === 'list').
// See mdFiles/steps/41-wave-1-statistics.md, "List input (between run 1 and run 2)".
//
// Accepts numbers separated by commas, whitespace (spaces, tabs, newlines) or semicolons, in any
// mix, so a pasted spreadsheet column (newline-separated) and a comma-separated line both work.
// No eval / new Function anywhere: every token is checked against a strict numeric regex before
// Number() ever sees it, so arbitrary pasted text can only ever become a number or be rejected.
//
// Thousands separators ("1,000"): a comma is read as a thousands separator, not a value separator,
// ONLY when the input also uses some other separator (whitespace or a semicolon) between values —
// e.g. "1,000, 2,500" or a newline-separated paste. A pasted line that uses only bare commas, with
// no whitespace anywhere ("100,200,300", or a single lone "1,000"), keeps every comma as a plain
// separator, exactly as before: the two readings are genuinely ambiguous from the text alone ("100
// ,200,300" is shaped exactly like the 6-figure number 100200300), and this is the only signal that
// disambiguates them. One known, accepted gap from this rule: several *lines*, each itself a bare
// comma-separated list with no other separator within the line but a newline between lines (e.g.
// "100,200,300\n400,500,600"), still reads every in-line comma as a thousands separator, because a
// newline is present *somewhere* in the whole input. Rare in practice; documented here rather than
// guessed around. When a comma is read as a thousands separator, `ParsedList.groupedAsThousands`
// names the original text so the widget can say so out loud — never silently.
//
// Also normalized per token: a leading typographic minus (U+2212) or en dash (U+2013) used as a
// minus sign, a single leading currency symbol ($ £ € ₹ ¥, sign-preserving either side of it), and
// a single trailing '%' (45% reads as the number 45, not 0.45 — the widget's helper text says so).
// Everything else non-numeric (parentheses negatives, hex, "Infinity") is dropped and reported,
// unchanged from before.
//
// Locale note (Parked): decimals are always a dot; a bare comma is always a separator (or, per the
// rule above, a thousands separator), never a decimal mark. The site's region system
// (lib/regions.ts, step 18, not yet built) will eventually need an EU comma-decimal mode — this
// parser does not attempt to guess which role a comma plays beyond the rule above.

/** Values beyond this count are dropped, not silently included. */
export const LIST_MAX = 1000;

export type ParsedList = {
  /** Valid numbers, in the order they appeared, capped at `max`. */
  values: number[];
  /** Tokens that could not be parsed as a number, in the order they appeared (not in `values`). */
  ignored: string[];
  /** True when more than `max` valid numbers were found; only the first `max` are kept. */
  truncated: boolean;
  /** Original text of every value whose comma(s) were read as thousands separators, e.g. "1,000". */
  groupedAsThousands: string[];
};

// Mode-B chunk boundaries: whitespace or a semicolon, never a bare comma (that is the whole point —
// commas are judged per chunk, below, instead of always splitting on them).
const WHITESPACE_SEPARATOR = /[;\s]+/;

// A 1-3 digit group, then one or more comma + exactly-3-digit groups, then an optional decimal tail.
// Exactly the shape of "1,000", "12,345.5", "-1,234,567" — never a run of short, clearly-separate
// pieces like "1,2,3" (whose later groups aren't 3 digits) or "100,200,300" taken token-by-token.
const GROUPED_NUMBER = /^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/;

// Optional sign, digits with an optional decimal point (or a bare ".5"/"5." form), optional
// exponent. Matched end-to-end before Number() runs, so "NaN"/"Infinity"/anything non-numeric is
// rejected outright rather than relying on Number()'s own looser parsing.
const NUMBER_TOKEN = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

const LEADING_MINUS_VARIANT = /^[−–]/; // typographic minus (−), en dash (–) used as a minus
const LEADING_CURRENCY = /^([+-]?)[$£€₹¥]/; // strips the symbol, keeps a sign on whichever side of it
const TRAILING_PERCENT = /%$/;

/** Trims and normalizes one token's sign/currency/percent affixes. Does not touch thousands commas. */
function cleanToken(token: string): string {
  return token
    .trim()
    .replace(LEADING_MINUS_VARIANT, '-')
    .replace(LEADING_CURRENCY, '$1')
    .replace(TRAILING_PERCENT, '');
}

/** A single already-cleaned token (no commas expected) as a plain number, or null if it isn't one. */
function parsePlainNumber(cleaned: string): number | null {
  if (!NUMBER_TOKEN.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null; // unreachable given NUMBER_TOKEN, kept as a defensive guard
  return Object.is(value, -0) ? 0 : value;
}

/** Splits `raw` into numbers and ignored tokens. Empty or whitespace-only input yields `[]`, not an error. */
export function parseNumberList(raw: string, max: number = LIST_MAX): ParsedList {
  const values: number[] = [];
  const ignored: string[] = [];
  const groupedAsThousands: string[] = [];
  const pushToken = (token: string) => {
    const value = parsePlainNumber(cleanToken(token));
    if (value === null) ignored.push(token);
    else values.push(value);
  };

  const trimmed = raw.trim();
  if (trimmed.length > 0) {
    const chunks = trimmed.split(WHITESPACE_SEPARATOR).filter((chunk) => chunk.length > 0);

    if (chunks.length <= 1) {
      // No other separator anywhere: commas are plain value separators (see the module note above).
      for (const token of trimmed.split(',').map((t) => t.trim()).filter((t) => t.length > 0)) {
        pushToken(token);
      }
    } else {
      for (const rawChunk of chunks) {
        const chunk = rawChunk.replace(/,$/, ''); // a trailing comma here is a separator remnant
        const cleaned = cleanToken(chunk);
        if (GROUPED_NUMBER.test(cleaned)) {
          values.push(Number(cleaned.replace(/,/g, '')));
          groupedAsThousands.push(chunk);
          continue;
        }
        const plain = parsePlainNumber(cleaned);
        if (plain !== null) {
          values.push(plain);
          continue;
        }
        if (cleaned.includes(',')) {
          for (const sub of cleaned.split(',').map((t) => t.trim()).filter((t) => t.length > 0)) {
            pushToken(sub);
          }
        } else {
          ignored.push(chunk);
        }
      }
    }
  }

  const truncated = values.length > max;
  return { values: truncated ? values.slice(0, max) : values, ignored, truncated, groupedAsThousands };
}

/** Compact, canonical form for share links and re-serialization: comma-joined, no extra whitespace. */
export function formatNumberList(values: number[]): string {
  return values.join(',');
}
