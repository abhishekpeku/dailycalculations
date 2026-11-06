// See lib/atomicMasses.ts for sourcing. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ELEMENTS, ELEMENT_OPTIONS, findElementByMass, molarMassOf } from './atomicMasses.ts';

const close = (actual: number, expected: number, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≈ ${expected}`);

describe('atomic mass table', () => {
  test('every element has a unique symbol and a unique atomic mass (no options collision)', () => {
    const symbols = ELEMENTS.map((e) => e.symbol);
    assert.equal(new Set(symbols).size, symbols.length, 'duplicate symbol');
    const masses = ELEMENTS.map((e) => e.atomicMass);
    assert.equal(new Set(masses).size, masses.length, 'duplicate atomic mass');
  });

  test('ELEMENT_OPTIONS starts with a "None" slot at mass 0, then one entry per element', () => {
    assert.equal(ELEMENT_OPTIONS[0].label, 'None');
    assert.equal(ELEMENT_OPTIONS[0].value, 0);
    assert.equal(ELEMENT_OPTIONS.length, ELEMENTS.length + 1);
  });

  // Spot-check values against the IUPAC/CIAAW standard atomic weights as listed on Wikipedia's
  // "List of elements" (fetched directly, not summarized) — see lib/atomicMasses.ts.
  test('spot-check a few standard atomic weights', () => {
    close(ELEMENTS.find((e) => e.symbol === 'H')!.atomicMass, 1.008);
    close(ELEMENTS.find((e) => e.symbol === 'O')!.atomicMass, 15.999);
    close(ELEMENTS.find((e) => e.symbol === 'C')!.atomicMass, 12.011);
    close(ELEMENTS.find((e) => e.symbol === 'Na')!.atomicMass, 22.99);
    close(ELEMENTS.find((e) => e.symbol === 'Cl')!.atomicMass, 35.45);
    close(ELEMENTS.find((e) => e.symbol === 'Ca')!.atomicMass, 40.078);
  });

  test('findElementByMass finds the element a given atomic mass belongs to', () => {
    assert.equal(findElementByMass(15.999)?.symbol, 'O');
    assert.equal(findElementByMass(0), undefined); // the "None" slot has no element
  });
});

describe('molarMassOf', () => {
  // 2 x H (1.008) + 1 x O (15.999) = 18.015 g/mol, the commonly cited molar mass of water.
  test('water, H2O', () => {
    const h = ELEMENTS.find((e) => e.symbol === 'H')!.atomicMass;
    const o = ELEMENTS.find((e) => e.symbol === 'O')!.atomicMass;
    close(
      molarMassOf([
        { atomicMass: h, count: 2 },
        { atomicMass: o, count: 1 }
      ]),
      18.015
    );
  });

  // Na (22.99) + Cl (35.45) = 58.44 g/mol, table salt.
  test('sodium chloride, NaCl', () => {
    const na = ELEMENTS.find((e) => e.symbol === 'Na')!.atomicMass;
    const cl = ELEMENTS.find((e) => e.symbol === 'Cl')!.atomicMass;
    close(molarMassOf([{ atomicMass: na, count: 1 }, { atomicMass: cl, count: 1 }]), 58.44);
  });

  test('a "None" slot (mass 0) contributes nothing regardless of its count', () => {
    assert.equal(molarMassOf([{ atomicMass: 0, count: 7 }]), 0);
  });

  test('an empty list of slots has a molar mass of 0', () => {
    assert.equal(molarMassOf([]), 0);
  });
});
