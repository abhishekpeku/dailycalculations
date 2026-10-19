// Guards for the per-category data files. See mdFiles/steps/34-split-data-file.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { calculatorOrder, calculators, categories } from './index.ts';

test('calculator ids are unique', () => {
  const ids = calculators.map((calculator) => calculator.id);
  assert.deepEqual(ids.filter((id, index) => ids.indexOf(id) !== index), []);
});

test('calculatorOrder lists every calculator exactly once, and nothing else', () => {
  assert.deepEqual(calculators.map((calculator) => calculator.id), calculatorOrder);
});

test('each category file holds only its own category', async () => {
  const files = readdirSync(new URL('.', import.meta.url)).filter((file) => /^[a-z]+\.ts$/.test(file) && !['index.ts', 'types.ts'].includes(file));
  assert.deepEqual(files.map((file) => file.replace('.ts', '')).sort(), categories.map((category) => category.id).sort());
  for (const file of files) {
    const id = file.replace('.ts', '');
    const module = await import(`./${file}`);
    for (const calculator of module[`${id}Calculators`]) assert.equal(calculator.category, id, `${calculator.id} in ${file}`);
  }
});
