// See mdFiles/steps/42-wave-1-conversion.md, "Run 6". Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { findIngredient, gramsPerCup, INGREDIENT_DENSITIES } from './ingredients.ts';

describe('INGREDIENT_DENSITIES', () => {
  test('every id is unique', () => {
    const ids = INGREDIENT_DENSITIES.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('every row has a positive density and a cited source', () => {
    for (const item of INGREDIENT_DENSITIES) {
      assert.ok(item.gramsPerCup > 0, `${item.id}: gramsPerCup must be positive`);
      assert.ok(item.source.length > 0, `${item.id}: source must be cited`);
    }
  });

  // cups-to-grams-converter's ingredient <select> uses gramsPerCup as each <option>'s value
  // (components/CalculatorWidget.tsx's ChoiceRow keys options by value), so two ingredients
  // sharing a density would collide in the menu — every row's density must be distinct.
  test('every density is distinct (the general converter keys its ingredient menu by density)', () => {
    const densities = INGREDIENT_DENSITIES.map((item) => item.gramsPerCup);
    assert.equal(new Set(densities).size, densities.length);
  });
});

describe('findIngredient / gramsPerCup', () => {
  test('finds a known ingredient', () => {
    assert.equal(findIngredient('flour').gramsPerCup, 120);
    assert.equal(gramsPerCup('sugar'), 198);
  });

  test('throws on an unknown id', () => {
    assert.throws(() => findIngredient('not-an-ingredient'));
  });

  // King Arthur's chart lists butter and cocoa in half-cup units; this checks the doubling in
  // lib/ingredients.ts matches the chart's own smaller-unit figure exactly, not a rounded copy.
  test('butter and cocoa cup figures are exactly double King Arthur\'s half-cup figures', () => {
    assert.equal(gramsPerCup('butter'), 113 * 2);
    assert.equal(gramsPerCup('cocoaPowder'), 42 * 2);
  });
});
