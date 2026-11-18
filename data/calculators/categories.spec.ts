// Guards the `group` field (UX-06/UX-08, mdFiles/steps/ux-08-category-groups-everywhere.md): every
// category listed in GROUPED_CATEGORIES must group every one of its calculators — no stragglers
// left out of a section, since components/CategoryCalculatorFilter.tsx's buildGroups() is
// all-or-nothing. Every other (not-yet-tagged) category must leave `group` undefined.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculators } from './index.ts';

const GROUPED_CATEGORIES = new Set(['measurements', 'math', 'statistics', 'chemistry', 'physics', 'biology', 'ecology', 'home', 'food', 'sports', 'finance', 'work', 'shopping', 'health', 'auto', 'time', 'travel', 'text', 'creator', 'education', 'fun', 'insurance', 'business']);

test('every calculator in a grouped category has a non-empty group', () => {
  for (const calculator of calculators) {
    if (!GROUPED_CATEGORIES.has(calculator.category)) continue;
    assert.ok(
      typeof calculator.group === 'string' && calculator.group.trim().length > 0,
      `${calculator.id} (${calculator.category}) is missing a group`
    );
  }
});

test('no calculator outside a grouped category has a group', () => {
  for (const calculator of calculators) {
    if (GROUPED_CATEGORIES.has(calculator.category)) continue;
    assert.equal(calculator.group, undefined, `${calculator.id} (${calculator.category}) should not have a group`);
  }
});
