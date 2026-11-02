// Every calculator needs a short badge symbol. See CalculatorConfig.glyph (types.ts) and
// mdFiles/steps/ux-04-categories-menu.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculators } from './index.ts';

// Code-point length, not UTF-16 `.length` (surrogate pairs would double-count). A combining
// diacritic (e.g. the macron in "x̄") counts as its own code point here, which only makes this
// stricter than true grapheme count — never a false pass — and avoids widening `lib` in
// tsconfig.json just for `Intl.Segmenter`'s types.
const graphemeLength = (text: string) => [...text].length;

test('every calculator has a non-empty glyph of at most 4 user-perceived characters', () => {
  for (const calculator of calculators) {
    assert.ok(calculator.glyph && calculator.glyph.trim().length > 0, `${calculator.id} has no glyph`);
    assert.ok(
      graphemeLength(calculator.glyph) <= 4,
      `${calculator.id} glyph "${calculator.glyph}" is ${graphemeLength(calculator.glyph)} characters, over the 4 limit`
    );
  }
});

// A glyph's whole job is to tell sibling calculators apart at a glance (menus, category pages,
// related-calculator cards all show one category's calculators side by side) — a repeat within
// the same category defeats that, even though it's harmless across different categories. Caught
// once already (gravel-calculator and sand-calculator both shipped as 'ton'); this is the
// regression guard for the batches still to come.
test('no two calculators in the same category share a glyph', () => {
  const seenByCategory = new Map<string, Map<string, string>>();
  for (const calculator of calculators) {
    const seen = seenByCategory.get(calculator.category) ?? new Map<string, string>();
    seenByCategory.set(calculator.category, seen);
    const earlierId = seen.get(calculator.glyph);
    assert.ok(
      !earlierId,
      `${calculator.id} and ${earlierId} both use glyph "${calculator.glyph}" in category "${calculator.category}"`
    );
    seen.set(calculator.glyph, calculator.id);
  }
});
