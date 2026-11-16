// See lib/tippingNorms.ts for sourcing. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { TIPPING_NORMS, TIPPING_COUNTRY_OPTIONS, TIPPING_NOTE_LABELS, tippingPercentForCode } from './tippingNorms.ts';

describe('tipping norms table', () => {
  test('every row has a unique, sequential code starting at 0 (used as the select option value)', () => {
    const codes = TIPPING_NORMS.map((n) => n.code);
    assert.deepEqual(codes, [...codes].sort((a, b) => a - b), 'codes are in ascending order');
    assert.deepEqual(codes, codes.map((_, i) => i), 'codes are 0, 1, 2, ... with no gaps');
  });

  test('every row has a non-empty country name, note, and a source with an https URL', () => {
    for (const row of TIPPING_NORMS) {
      assert.ok(row.country.trim().length > 0, `${row.code} has no country name`);
      assert.ok(row.note.trim().length > 0, `${row.country} has no note`);
      assert.ok(row.source.label.trim().length > 0, `${row.country} has no source label`);
      assert.ok(row.source.url.startsWith('https://'), `${row.country} source URL is not https`);
    }
  });

  test('percent is between 0 and 100 for every row', () => {
    for (const row of TIPPING_NORMS) {
      assert.ok(row.percent >= 0 && row.percent <= 100, `${row.country} percent ${row.percent} out of range`);
    }
  });

  test('country names are unique (no duplicate dropdown entries)', () => {
    const names = TIPPING_NORMS.map((n) => n.country);
    assert.equal(new Set(names).size, names.length);
  });

  test('TIPPING_COUNTRY_OPTIONS and TIPPING_NOTE_LABELS mirror the table 1:1 by code', () => {
    assert.equal(TIPPING_COUNTRY_OPTIONS.length, TIPPING_NORMS.length);
    assert.equal(TIPPING_NOTE_LABELS.length, TIPPING_NORMS.length);
    for (const row of TIPPING_NORMS) {
      assert.equal(TIPPING_COUNTRY_OPTIONS.find((o) => o.value === row.code)?.label, row.country);
      assert.equal(TIPPING_NOTE_LABELS.find((o) => o.value === row.code)?.label, row.note);
    }
  });

  test('tippingPercentForCode looks up the right rate, and defaults to 0 for an unknown code', () => {
    assert.equal(tippingPercentForCode(0), 17.5); // United States
    assert.equal(tippingPercentForCode(4), 10); // Australia
    assert.equal(tippingPercentForCode(1), 0); // Japan
    assert.equal(tippingPercentForCode(999), 0);
  });
});
