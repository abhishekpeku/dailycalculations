// Type-B widget logic: defaults, input units, share links, formatting, visual data.
// See mdFiles/steps/33-breakdown-widget.md. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import type { CalculatorBreakdown, CalculatorInput } from '../data/calculators.ts';
import {
  alsoInText,
  breakdownShareParams,
  changeUnit,
  computeValues,
  describeId,
  formatOutput,
  initialBreakdownState,
  prettify,
  readBreakdownShareParams,
  resolveBreakdown,
  visualData
} from './breakdown.ts';

const inputs: CalculatorInput[] = [
  { id: 'length', label: 'Length', type: 'number', placeholder: '14', defaultValue: 14, dimension: 'length', unit: 'ft' },
  { id: 'bill', label: 'Bill amount', type: 'currency', placeholder: '72', defaultValue: 72 },
  { id: 'rate', label: 'Tip rate', type: 'percent', placeholder: '18', defaultValue: 18 },
  { id: 'coats', label: 'Coats', type: 'number', placeholder: '2', defaultValue: 2 }
];

describe('prettify', () => {
  test('splits camelCase into a sentence-case label', () => {
    assert.equal(prettify('gallonsWithBuffer'), 'Gallons with buffer');
    assert.equal(prettify('perPerson'), 'Per person');
    assert.equal(prettify('total'), 'Total');
  });
});

describe('resolveBreakdown', () => {
  test('defaults: headline label prettified, rows are the other compute keys, one group', () => {
    const resolved = resolveBreakdown({ headline: 'tipAmount' }, inputs, ['tipAmount', 'totalAmount', 'perPerson']);
    assert.equal(resolved.headline.label, 'Tip amount');
    assert.deepEqual(resolved.rows.map((r) => [r.id, r.label]), [['totalAmount', 'Total amount'], ['perPerson', 'Per person']]);
    assert.equal(resolved.groups.length, 1);
    assert.deepEqual(resolved.groups[0].inputs.map((i) => i.id), ['length', 'bill', 'rate', 'coats']);
  });

  test('listed outputs set order and labels; headlineLabel wins', () => {
    const config: CalculatorBreakdown = {
      headline: 'b',
      headlineLabel: 'Big B',
      outputs: [{ id: 'c', label: 'See' }, { id: 'b', label: 'Bee' }, { id: 'a' }]
    };
    const resolved = resolveBreakdown(config, inputs, ['a', 'b', 'c']);
    assert.equal(resolved.headline.label, 'Big B');
    assert.deepEqual(resolved.rows.map((r) => r.label), ['See', 'A']);
  });

  test('groups keep config order, skip unknown ids, and unlisted inputs go last', () => {
    const resolved = resolveBreakdown(
      { headline: 'x', groups: [{ title: 'Money', inputs: ['bill', 'nope', 'rate'] }, { title: 'Extra', inputs: ['coats'], optional: true }] },
      inputs,
      ['x']
    );
    assert.deepEqual(resolved.groups.map((g) => [g.title, g.optional, g.inputs.map((i) => i.id)]), [
      ['Money', false, ['bill', 'rate']],
      ['Extra', true, ['coats']],
      [undefined, false, ['length']]
    ]);
  });
});

describe('input values and units', () => {
  test('defaults to the unit compute() expects, and converts a chosen unit back to it', () => {
    const state = initialBreakdownState(inputs);
    assert.equal(state.units.length, 'ft');
    assert.equal(state.units.bill, '');
    const metric = { values: { ...state.values, length: '3' }, units: { ...state.units, length: 'm' } };
    assert.ok(Math.abs(computeValues(inputs, metric).length - 9.84251968503937) < 1e-9);
    assert.equal(computeValues(inputs, metric).bill, 72);
  });

  test('blank is NaN, commas are accepted', () => {
    const state = initialBreakdownState(inputs);
    const values = computeValues(inputs, { ...state, values: { ...state.values, bill: '', coats: '1,200' } });
    assert.ok(Number.isNaN(values.bill));
    assert.equal(values.coats, 1200);
  });

  test('changing the unit keeps the quantity', () => {
    const state = changeUnit(inputs[0], initialBreakdownState(inputs), 'in');
    assert.equal(state.values.length, '168');
    assert.ok(Math.abs(computeValues(inputs, state).length - 14) < 1e-9);
  });
});

describe('share params', () => {
  test('only changed values and units are written, and they round-trip', () => {
    const defaults = initialBreakdownState(inputs);
    assert.equal(breakdownShareParams(inputs, defaults), '');
    const edited = { values: { ...defaults.values, bill: '120', length: '4' }, units: { ...defaults.units, length: 'm' } };
    const query = breakdownShareParams(inputs, edited);
    assert.equal(query, 'length=4&length_unit=m&bill=120');
    assert.deepEqual(readBreakdownShareParams(inputs, defaults, `?${query}`), edited);
  });

  test('bad values, unknown units and unknown ids are ignored', () => {
    const defaults = initialBreakdownState(inputs);
    const read = readBreakdownShareParams(inputs, defaults, '?bill=abc&length_unit=parsec&coats_unit=m&evil=1&rate=');
    assert.deepEqual(read, defaults);
  });
});

describe('formatOutput', () => {
  test('currency rounds to cents with the placeholder symbol', () => {
    assert.equal(formatOutput(12.956, { id: 't', format: 'currency' }), '¤12.96');
    assert.equal(formatOutput(1234.5, { id: 't', dimension: 'currency' }), '¤1,234.5');
  });

  test('units, percent, integer and no-answer', () => {
    assert.equal(formatOutput(1.4334, { id: 'g', dimension: 'volume', unit: 'gal' }), '1.433 gal (US)');
    assert.equal(formatOutput(392, { id: 'a', dimension: 'area', unit: 'ft2' }), '392 ft²');
    assert.equal(formatOutput(18, { id: 'r', format: 'percent' }), '18%');
    assert.equal(formatOutput(2.6, { id: 'n', format: 'integer' }), '3');
    assert.equal(formatOutput(Infinity, { id: 'n' }), '—');
  });

  test('alsoIn converts the headline into other units', () => {
    assert.deepEqual(alsoInText(1, { id: 'g', dimension: 'volume', unit: 'gal', alsoIn: ['L'] }), ['3.785 L']);
    assert.deepEqual(alsoInText(1, { id: 'g' }), []);
  });
});

describe('visualData', () => {
  const resolved = resolveBreakdown({ headline: 'tipAmount', outputs: [{ id: 'tipAmount', label: 'Tip' }, { id: 'totalAmount', label: 'Total' }] }, inputs, []);
  const values = { bill: 72, tipAmount: 12.96, totalAmount: 84.96 };
  const labelOf = (id: string) => describeId(id, resolved, inputs).label;

  test('donut parts resolve from inputs and outputs, with labels', () => {
    const data = visualData({ type: 'donut', segments: [{ from: 'bill' }, { from: 'tipAmount' }], center: { from: 'totalAmount' }, centerSub: 'total' }, values, labelOf);
    assert.deepEqual(data, {
      type: 'donut',
      segments: [{ label: 'Bill amount', value: 72 }, { label: 'Tip', value: 12.96 }],
      center: { label: 'Total', value: 84.96 },
      centerSub: 'total'
    });
  });

  test('compare bars keep title, highlight and label overrides; a missing id is NaN', () => {
    const data = visualData({ type: 'compareBars', bars: [{ from: 'totalAmount', label: 'All in' }, { from: 'missing' }], title: 'T', highlight: 1 }, values, labelOf);
    assert.equal(data.type, 'compareBars');
    if (data.type !== 'compareBars') return;
    assert.equal(data.bars[0].label, 'All in');
    assert.equal(data.bars[1].label, 'Missing');
    assert.ok(Number.isNaN(data.bars[1].value));
    assert.equal(data.highlight, 1);
  });

  test('describeId prints inputs by their type', () => {
    assert.equal(describeId('bill', resolved, inputs).format, 'currency');
    assert.equal(describeId('rate', resolved, inputs).format, 'percent');
  });
});
