// Guards the `group` field (UX-06, mdFiles/steps/ux-06-category-groups.md): the three categories
// past categories/[category]/page.tsx's SEARCH_THRESHOLD (measurements, math, statistics) must
// group every calculator — no stragglers left out of a section. Every other category must leave
// `group` undefined, since its page never renders grouped sections.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculators } from './index.ts';

const GROUPED_CATEGORIES = new Set(['measurements', 'math', 'statistics']);

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
