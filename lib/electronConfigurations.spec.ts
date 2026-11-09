// See lib/electronConfigurations.ts for sourcing (NIST ASD, fetched directly). Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ELECTRON_CONFIGS, ELEMENT_CONFIG_OPTIONS, findElementConfig } from './electronConfigurations.ts';

describe('electron configuration table', () => {
  test('covers exactly elements 1-108, in order, with unique symbols', () => {
    assert.equal(ELECTRON_CONFIGS.length, 108);
    ELECTRON_CONFIGS.forEach((element, index) => assert.equal(element.z, index + 1));
    const symbols = ELECTRON_CONFIGS.map((element) => element.symbol);
    assert.equal(new Set(symbols).size, symbols.length, 'duplicate symbol');
  });

  test("every element's total electron count equals its own atomic number", () => {
    for (const element of ELECTRON_CONFIGS) {
      const total = element.shells.reduce((sum, shell) => sum + shell.count, 0);
      assert.equal(total, element.z, `${element.symbol} (Z=${element.z}): shells sum to ${total}`);
      assert.equal(element.coreElectrons + element.outerElectrons, element.z, `${element.symbol}: core + outer`);
    }
  });

  test('chromium and copper: the two best-known Aufbau exceptions, 3d before 4s (NIST\'s own order)', () => {
    assert.equal(findElementConfig(24)!.shorthand, '[Ar]3d5 4s1');
    assert.equal(findElementConfig(29)!.shorthand, '[Ar]3d10 4s1');
  });

  test('palladium has no 5s electron at all (4d10, not 4d8 5s2)', () => {
    assert.equal(findElementConfig(46)!.shorthand, '[Kr]4d10');
  });

  test('lanthanum and actinium: 5d/6d before the f subshell fills (the "f-block starts one element late" exception)', () => {
    assert.equal(findElementConfig(57)!.shorthand, '[Xe]5d1 6s2');
    assert.equal(findElementConfig(89)!.shorthand, '[Rn]6d1 7s2');
  });

  test('lawrencium: 7p1, not 6d1 (the 2015-confirmed exception)', () => {
    assert.equal(findElementConfig(103)!.shorthand, '[Rn]5f14 7s2 7p1');
  });

  test('uranium: the familiar [Rn]5f3 6d1 7s2', () => {
    assert.equal(findElementConfig(92)!.shorthand, '[Rn]5f3 6d1 7s2');
    assert.equal(findElementConfig(92)!.fullConfig, '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 4f14 5d10 6s2 6p6 5f3 6d1 7s2');
  });

  test('hydrogen and helium have no core (below the first noble gas)', () => {
    assert.equal(findElementConfig(1)!.core, null);
    assert.equal(findElementConfig(1)!.shorthand, '1s1');
    assert.equal(findElementConfig(2)!.shorthand, '1s2');
  });

  test('ELEMENT_CONFIG_OPTIONS has one option per element, value = atomic number', () => {
    assert.equal(ELEMENT_CONFIG_OPTIONS.length, 108);
    assert.equal(ELEMENT_CONFIG_OPTIONS[25].value, 26);
    assert.ok(ELEMENT_CONFIG_OPTIONS[25].label.includes('Iron'));
  });

  test('findElementConfig returns undefined past element 108', () => {
    assert.equal(findElementConfig(109), undefined);
  });
});
