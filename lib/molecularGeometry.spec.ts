// See lib/molecularGeometry.ts for sourcing. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { GEOMETRY_TABLE, findGeometry } from './molecularGeometry.ts';

describe('VSEPR geometry table', () => {
  test('12 rows, every code distinct', () => {
    assert.equal(GEOMETRY_TABLE.length, 12);
    const codes = GEOMETRY_TABLE.map((e) => e.code);
    assert.equal(new Set(codes).size, codes.length, 'no duplicate codes');
  });

  test('domains is always bondingPairs + lonePairs, and never exceeds 6', () => {
    for (const entry of GEOMETRY_TABLE) {
      assert.equal(entry.domains, entry.bondingPairs + entry.lonePairs);
      assert.ok(entry.domains <= 6, `${entry.molecularShape} has ${entry.domains} domains`);
    }
  });

  test('methane (4 bonding pairs, 0 lone pairs) is tetrahedral at 109.5°', () => {
    const entry = findGeometry(4, 0);
    assert.equal(entry?.molecularShape, 'Tetrahedral');
    assert.equal(entry?.bondAngle, '109.5°');
  });

  test('water (2 bonding pairs, 2 lone pairs) is bent, with its 104.5° figure stated', () => {
    const entry = findGeometry(2, 2);
    assert.equal(entry?.molecularShape, 'Bent');
    assert.ok(entry?.bondAngle.includes('104.5'));
  });

  test('ammonia-type (3 bonding pairs, 1 lone pair) is trigonal pyramidal', () => {
    const entry = findGeometry(3, 1);
    assert.equal(entry?.electronGeometry, 'Tetrahedral');
    assert.equal(entry?.molecularShape, 'Trigonal pyramidal');
  });

  test('5 domains with 3 lone pairs (linear, out of scope) has no entry', () => {
    assert.equal(findGeometry(2, 3), undefined);
  });

  test('findGeometry rounds fractional inputs', () => {
    assert.equal(findGeometry(4.2, 0.4)?.molecularShape, 'Tetrahedral');
  });
});
