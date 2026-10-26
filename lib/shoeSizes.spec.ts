// See mdFiles/steps/42-wave-1-conversion.md, "Run 7". Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  categoryFromCode,
  childLastMm,
  euAdultSize,
  isValidAdultFoot,
  isValidChildFoot,
  kidsSizesFromTargetUsSize,
  roundMondopoint,
  roundToHalf,
  roundToWhole,
  shoeSizesFromFootMm,
  ukAdultSize,
  ukChildSize,
  usChildSize,
  usMensSize,
  usWomensSize
} from './shoeSizes.ts';

const INCH_MM = 25.4;
const CLOSE = 1e-9;

describe('rounding helpers', () => {
  test('roundToHalf snaps to the nearest half, never a non-existent size', () => {
    assert.equal(roundToHalf(8.2), 8);
    assert.equal(roundToHalf(8.3), 8.5);
    assert.equal(roundToHalf(8.74), 8.5);
    assert.equal(roundToHalf(8.76), 9);
  });

  test('roundMondopoint snaps to the nearest 5 mm', () => {
    assert.equal(roundMondopoint(262), 260);
    assert.equal(roundMondopoint(263), 265);
  });

  test('categoryFromCode maps the fixed select codes', () => {
    assert.equal(categoryFromCode(0), 'mens');
    assert.equal(categoryFromCode(1), 'womens');
    assert.equal(categoryFromCode(2), 'kids');
  });
});

describe('quoted boundary points (Wikipedia, "Shoe size", raw wikitext)', () => {
  test('a last length of 4 in is UK child size 0', () => {
    // child foot size = 3 x last length (in) - 12
    assert.ok(Math.abs((3 * 4 - 12) - 0) < CLOSE);
  });

  test('a last length of 8 1/2 in is UK child size 13 1/2', () => {
    assert.ok(Math.abs((3 * 8.5 - 12) - 13.5) < CLOSE);
  });

  test('a last length of 8 2/3 in is UK adult size 1', () => {
    // adult foot size = 3 x last length (in) - 25
    assert.ok(Math.abs((3 * (8 + 2 / 3) - 25) - 1) < CLOSE);
  });

  test('the ISO 19407 UK-from-mm formula agrees with the inches formula at the adult-1 boundary', () => {
    // last = foot + 2/3 in (the "allowance of two shoe sizes" = 2 barleycorns = 2/3 in)
    const footMmAtUk1 = (8 + 2 / 3 - 2 / 3) * INCH_MM; // = 8 in exactly
    assert.ok(Math.abs(ukAdultSize(footMmAtUk1) - 1) < CLOSE);
  });

  test('UK child 0 and UK child 13.5 round-trip through the mm-based formula via childLastMm', () => {
    const footAt0 = (4 * INCH_MM - 6) / 1.08;
    const footAt135 = (8.5 * INCH_MM - 6) / 1.08;
    assert.ok(Math.abs(ukChildSize(footAt0) - 0) < CLOSE);
    assert.ok(Math.abs(ukChildSize(footAt135) - 13.5) < CLOSE);
  });
});

describe('cross-check against Nike\'s published size chart (nike.com/size-fit/mens-footwear)', () => {
  // Each row: Nike's own US men's / UK / EU for a given foot length (in). The formula is expected
  // to match Nike's US men's size closely (same half-size grid) but run about half a UK size and
  // about one EU size lower than Nike's own chart — a real, cited brand-variation gap, not
  // asserted as equal. See the step file's "Where sources disagree" note.
  const nikeRows = [
    { footIn: 10, usMenNike: 8, ukNike: 7.5, euNike: 41 },
    { footIn: 10 + 11 / 16, usMenNike: 10, ukNike: 9.5, euNike: 44 },
    { footIn: 11 + 5 / 16, usMenNike: 12, ukNike: 11.5, euNike: 46 }
  ];

  for (const row of nikeRows) {
    test(`foot ${row.footIn.toFixed(4)} in: formula US men's matches Nike's ${row.usMenNike}, UK/EU run below Nike's chart`, () => {
      const footMm = row.footIn * INCH_MM;
      const men = roundToHalf(usMensSize(footMm));
      const uk = roundToHalf(ukAdultSize(footMm));
      const eu = roundToWhole(euAdultSize(footMm));
      assert.equal(men, row.usMenNike);
      assert.ok(uk <= row.ukNike, `formula UK ${uk} should be at or below Nike's ${row.ukNike}`);
      assert.ok(eu <= row.euNike, `formula EU ${eu} should be at or below Nike's ${row.euNike}`);
    });
  }

  test('the "common" US women\'s scale (+1.5) matches Nike\'s chart exactly', () => {
    // Nike: US men's 8 <-> US women's 9.5; US men's 10 <-> US women's 11.5.
    const footMmAt8 = 10 * INCH_MM;
    assert.equal(roundToHalf(usWomensSize(footMmAt8)), 9.5);
    const footMmAt10 = (10 + 11 / 16) * INCH_MM;
    assert.equal(roundToHalf(usWomensSize(footMmAt10)), 11.5);
  });
});

describe('valid-range guards', () => {
  test('a too-short foot has no valid adult size', () => {
    assert.equal(isValidAdultFoot(50), false);
    assert.ok(Number.isNaN(shoeSizesFromFootMm(50, 'mens').usSize));
  });

  test('zero or negative foot length is never valid', () => {
    assert.equal(isValidAdultFoot(0), false);
    assert.equal(isValidChildFoot(-10), false);
  });

  test('a too-long foot has no valid children\'s size', () => {
    assert.equal(isValidChildFoot(300), false);
    assert.ok(Number.isNaN(shoeSizesFromFootMm(300, 'kids').usSize));
  });

  test('a typical adult foot is valid for mens/womens but not kids', () => {
    assert.equal(isValidAdultFoot(260), true);
    assert.equal(isValidChildFoot(260), false);
  });
});

describe('shoeSizesFromFootMm', () => {
  test('mens and womens differ by exactly 1.5 at the same foot length', () => {
    const men = shoeSizesFromFootMm(260, 'mens');
    const women = shoeSizesFromFootMm(260, 'womens');
    assert.equal(women.usSize - men.usSize, 1.5);
    assert.equal(women.ukSize, men.ukSize);
    assert.equal(women.euSize, men.euSize);
  });

  test('mondopoint is independent of category (it is just the foot length, rounded)', () => {
    assert.equal(shoeSizesFromFootMm(262, 'mens').mondopoint, 260);
    assert.equal(shoeSizesFromFootMm(262, 'kids').mondopoint, 260);
  });
});

describe('children\'s round-trip hazard (why the static kids chart uses kidsSizesFromTargetUsSize)', () => {
  // Inverting usChildSize to a foot length and then calling ukChildSize(footMm) on that inverted
  // value re-derives the last length a second time through childLastMm — two floating-point hops
  // instead of one. Because UK child = US child - 0.25 exactly, the UK result then sits exactly on
  // a rounding tie for every integer US target, and which side it falls on depends on FP noise.
  // kidsSizesFromTargetUsSize avoids this by computing both sizes from one shared last-length
  // value. This test demonstrates the difference exists, so the data file's choice is justified.
  test('UK child size is exactly US child size minus 0.25, via the single-hop helper', () => {
    for (const target of [8, 9, 10, 11, 12, 13, 13.5]) {
      const result = kidsSizesFromTargetUsSize(target);
      assert.ok(Math.abs(result.ukSize - (target - 0.25)) < CLOSE, `target ${target}: UK ${result.ukSize}`);
    }
  });

  test('the single-hop and live (footMm-based) paths agree once rounded, for a plain foot length', () => {
    for (const footMm of [120, 140, 160, 180]) {
      const uk = ukChildSize(footMm);
      const us = usChildSize(footMm);
      assert.ok(Math.abs(us - uk - 0.25) < CLOSE);
    }
  });
});

describe('lastLength allowance (ISO 19407, children)', () => {
  test('childLastMm applies the quoted "8% greater than foot length plus 6 mm" allowance', () => {
    assert.equal(childLastMm(100), 100 * 1.08 + 6);
  });
});
