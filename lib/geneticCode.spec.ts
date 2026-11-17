// See lib/geneticCode.ts for sourcing (NCBI, "The Genetic Codes", table 1). Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { GENETIC_CODE_TABLE, findCodon, degeneracy } from './geneticCode.ts';

describe('Standard genetic code table', () => {
  test('64 rows, every code distinct, every codon distinct', () => {
    assert.equal(GENETIC_CODE_TABLE.length, 64);
    const codes = GENETIC_CODE_TABLE.map((e) => e.code);
    assert.equal(new Set(codes).size, 64, 'no duplicate codes');
    const codons = GENETIC_CODE_TABLE.map((e) => e.codon);
    assert.equal(new Set(codons).size, 64, 'no duplicate codons');
  });

  test('exactly 3 stop codons: UAA, UAG, UGA', () => {
    const stops = GENETIC_CODE_TABLE.filter((e) => e.isStop).map((e) => e.codon).sort();
    assert.deepEqual(stops, ['UAA', 'UAG', 'UGA']);
  });

  test('exactly one start codon in this table: AUG, coding for methionine', () => {
    const starts = GENETIC_CODE_TABLE.filter((e) => e.isStart);
    assert.equal(starts.length, 1);
    assert.equal(starts[0].codon, 'AUG');
    assert.equal(starts[0].letter, 'M');
  });

  // Known genetic code degeneracy table (every textbook presentation of the standard code agrees on
  // these counts): 3 amino acids with 6 codons, 5 with 4, 1 with 3, 9 with 2, 2 with 1, plus 3 stops.
  test('codon degeneracy matches the known genetic code table', () => {
    const sixFold = ['L', 'S', 'R'];
    const fourFold = ['V', 'P', 'T', 'A', 'G'];
    const threeFold = ['I'];
    const twoFold = ['F', 'Y', 'H', 'Q', 'N', 'K', 'D', 'E', 'C'];
    const oneFold = ['M', 'W'];
    for (const letter of sixFold) assert.equal(degeneracy(letter), 6, letter);
    for (const letter of fourFold) assert.equal(degeneracy(letter), 4, letter);
    for (const letter of threeFold) assert.equal(degeneracy(letter), 3, letter);
    for (const letter of twoFold) assert.equal(degeneracy(letter), 2, letter);
    for (const letter of oneFold) assert.equal(degeneracy(letter), 1, letter);
    assert.equal(degeneracy('*'), 3, 'stop codons');

    // Every amino acid's degeneracy accounted for, summing to all 64 codons.
    const total =
      sixFold.length * 6 + fourFold.length * 4 + threeFold.length * 3 + twoFold.length * 2 + oneFold.length * 1 + 3;
    assert.equal(total, 64);
    assert.equal(sixFold.length + fourFold.length + threeFold.length + twoFold.length + oneFold.length, 20, '20 amino acids');
  });

  test('findCodon looks up UUU as phenylalanine (U=0, U=0, U=0)', () => {
    const entry = findCodon(0, 0, 0);
    assert.equal(entry?.codon, 'UUU');
    assert.equal(entry?.letter, 'F');
    assert.equal(entry?.name, 'Phenylalanine');
  });

  test('findCodon looks up AUG as the start codon, methionine (A=2, U=0, G=3)', () => {
    const entry = findCodon(2, 0, 3);
    assert.equal(entry?.codon, 'AUG');
    assert.equal(entry?.letter, 'M');
    assert.ok(entry?.isStart);
  });

  test('findCodon looks up UAA as a stop codon (U=0, A=2, A=2)', () => {
    const entry = findCodon(0, 2, 2);
    assert.equal(entry?.codon, 'UAA');
    assert.ok(entry?.isStop);
  });

  test('findCodon rounds and wraps out-of-range fractional base codes', () => {
    assert.equal(findCodon(0.4, -0.2, 4.1)?.codon, 'UUU');
  });
});
