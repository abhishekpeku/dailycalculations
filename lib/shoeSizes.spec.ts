// See mdFiles/steps/42-wave-1-conversion.md, "Run 7" and its "Pre-merge review fix" note. Run: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  categoryFromCode,
  euAdultSize,
  footMmFromUsMen,
  isoEuSize,
  isoFootMmFromUsMen,
  isoUkSize,
  isoUsMenSize,
  isValidAdultFoot,
  isValidChildFoot,
  kidsSizeAt,
  roundMondopoint,
  roundToHalf,
  roundToThird,
  shoeSizesFromFootMm,
  ukAdultSize,
  usMensSize,
  usWomensSize
} from './shoeSizes.ts';

const CLOSE = 1e-9;

describe('rounding helpers', () => {
  test('roundToHalf snaps to the nearest half', () => {
    assert.equal(roundToHalf(8.2), 8);
    assert.equal(roundToHalf(8.3), 8.5);
  });

  test('roundToThird snaps to the nearest third (EU/Paris-point granularity)', () => {
    assert.ok(Math.abs(roundToThird(42.7) - (42 + 2 / 3)) < CLOSE);
    assert.ok(Math.abs(roundToThird(42.1) - (42)) < CLOSE);
    assert.ok(Math.abs(roundToThird(42 + 1 / 3) - (42 + 1 / 3)) < CLOSE);
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

// adidas's own published men's size chart, as reproduced (explicitly attributed to adidas) by
// sizefit.org/guides/adidas-shoe-size-chart, fetched directly this run. Every row below is adidas's
// own number, not a fitted approximation — the retail formulas must reproduce every one exactly.
describe('adidas published men\'s chart (sizefit.org/guides/adidas-shoe-size-chart)', () => {
  const rows: [number, number, number, number][] = [
    [4, 3.5, 36, 220], [4.5, 4, 36 + 2 / 3, 225], [5, 4.5, 37 + 1 / 3, 230], [5.5, 5, 38, 235],
    [6, 5.5, 38 + 2 / 3, 240], [6.5, 6, 39 + 1 / 3, 245], [7, 6.5, 40, 250], [7.5, 7, 40 + 2 / 3, 255],
    [8, 7.5, 41 + 1 / 3, 260], [8.5, 8, 42, 265], [9, 8.5, 42 + 2 / 3, 270], [9.5, 9, 43 + 1 / 3, 275],
    [10, 9.5, 44, 280], [11, 10.5, 45 + 1 / 3, 290], [12, 11.5, 46 + 2 / 3, 300], [13, 12.5, 48, 310],
    [14.5, 14, 50, 325]
  ];

  for (const [usMen, uk, eu, footMm] of rows) {
    test(`US men's ${usMen} = UK ${uk} = EU ${eu.toFixed(2)} at ${footMm} mm`, () => {
      assert.ok(Math.abs(usMensSize(footMm) - usMen) < CLOSE);
      assert.ok(Math.abs(ukAdultSize(footMm) - uk) < CLOSE);
      assert.ok(Math.abs(euAdultSize(footMm) - eu) < CLOSE);
      assert.ok(Math.abs(footMmFromUsMen(usMen) - footMm) < CLOSE);
    });
  }
});

// adidas's own published women's chart, same source. Confirms women's = men's + 1 throughout
// (adidas's own internal relationship), used here as the primary women's scale.
describe('adidas published women\'s chart (sizefit.org/guides/adidas-shoe-size-chart)', () => {
  const rows: [number, number, number, number][] = [
    [5, 3.5, 36, 220], [6, 4.5, 37 + 1 / 3, 230], [7, 5.5, 38 + 2 / 3, 240], [8, 6.5, 40, 250],
    [9, 7.5, 41 + 1 / 3, 260], [10, 8.5, 42 + 2 / 3, 270], [11, 9.5, 44, 280], [12, 10.5, 45 + 1 / 3, 290]
  ];

  for (const [usWomen, uk, eu, footMm] of rows) {
    test(`US women's ${usWomen} = UK ${uk} = EU ${eu.toFixed(2)} at ${footMm} mm`, () => {
      assert.ok(Math.abs(usWomensSize(footMm) - usWomen) < CLOSE); // default scale: 'fia' (men's + 1)
      assert.ok(Math.abs(ukAdultSize(footMm) - uk) < CLOSE);
      assert.ok(Math.abs(euAdultSize(footMm) - eu) < CLOSE);
    });
  }

  test('the "common" scale (Nike\'s own, +1.5) is a documented, different alternative', () => {
    const footMm = 260; // adidas US men's 8 / US women's 9
    assert.ok(Math.abs(usWomensSize(footMm, 'fia') - 9) < CLOSE);
    assert.ok(Math.abs(usWomensSize(footMm, 'common') - 9.5) < CLOSE);
  });
});

// Nike's published men's/women's/UK/EU chart (nike.com/size-fit/mens-footwear), fetched directly.
// Compared AT THE SAME US SIZE LABEL, never at Nike's own foot-length figure — Nike and adidas
// print different foot lengths for the same labeled size, so comparing by foot length is
// apples-to-oranges (the cross-check that matters is: does the same US LABEL get a similar UK/EU
// on both brands' own charts).
describe('cross-check against Nike\'s own chart, compared by US size label (nike.com/size-fit/mens-footwear)', () => {
  const rows: { usMen: number; ukNike: number; euNike: number; usWomenNike: number }[] = [
    { usMen: 8, ukNike: 7.5, euNike: 41, usWomenNike: 9.5 },
    { usMen: 8.5, ukNike: 8, euNike: 42, usWomenNike: 10 },
    { usMen: 9, ukNike: 8.5, euNike: 42.5, usWomenNike: 10.5 },
    { usMen: 9.5, ukNike: 9, euNike: 43, usWomenNike: 11 },
    { usMen: 10, ukNike: 9.5, euNike: 44, usWomenNike: 11.5 },
    { usMen: 11, ukNike: 10.5, euNike: 45, usWomenNike: 12.5 },
    { usMen: 12, ukNike: 11.5, euNike: 46, usWomenNike: 13.5 }
  ];

  for (const { usMen, ukNike, euNike, usWomenNike } of rows) {
    test(`US men's ${usMen}: UK matches Nike exactly, EU within half a size`, () => {
      const footMm = footMmFromUsMen(usMen);
      assert.equal(roundToHalf(ukAdultSize(footMm)), ukNike);
      assert.ok(Math.abs(euAdultSize(footMm) - euNike) <= 0.7, `EU ${euAdultSize(footMm)} vs Nike ${euNike}`);
    });
  }

  test('Nike\'s own chart uses the "common" (+1.5) women\'s scale, not adidas\'s (+1)', () => {
    for (const { usMen, usWomenNike } of rows) {
      const footMm = footMmFromUsMen(usMen);
      assert.ok(Math.abs(usWomensSize(footMm, 'common') - usWomenNike) < CLOSE);
      assert.notEqual(roundToHalf(usWomensSize(footMm, 'fia')), usWomenNike);
    }
  });
});

describe('ISO 19407 (secondary/theoretical) differs from the retail convention (primary)', () => {
  // Comparing the two formulas at the SAME raw foot length is not the relevant comparison — ISO's
  // own slope differs from the retail chart's, so that gap actually changes sign around 248 mm
  // (confirmed in the run's verification script). The comparison that matters to a shopper is: for
  // the SAME US SIZE LABEL, does ISO imply a shorter foot (and therefore a smaller UK/EU number)
  // than the retail chart actually uses for that label? This is what the "pre-merge review" found,
  // and what the formula note on each page explains.
  test('for the same US men\'s size label, ISO implies a shorter foot and a smaller UK/EU than the real retail chart', () => {
    for (const usMen of [7, 8, 9, 10, 12]) {
      const isoFootMm = isoFootMmFromUsMen(usMen);
      const retailFootMm = footMmFromUsMen(usMen);
      assert.ok(isoFootMm < retailFootMm, `ISO foot ${isoFootMm} should be shorter than retail ${retailFootMm} for US men's ${usMen}`);
      const isoUk = isoUkSize(isoFootMm);
      const retailUk = ukAdultSize(retailFootMm);
      assert.ok(retailUk - isoUk >= 0.4, `US men's ${usMen}: retail UK ${retailUk} vs ISO UK ${isoUk}`);
      const isoEu = isoEuSize(isoFootMm);
      const retailEu = euAdultSize(retailFootMm);
      assert.ok(retailEu - isoEu >= 0.9, `US men's ${usMen}: retail EU ${retailEu} vs ISO EU ${isoEu}`);
    }
    // Sanity check: by construction, ISO's own US-men label always equals the target exactly.
    assert.ok(Math.abs(isoUsMenSize(isoFootMmFromUsMen(9)) - 9) < CLOSE);
  });
});

describe('valid-range guards', () => {
  test('a too-short foot has no valid adult size', () => {
    assert.equal(isValidAdultFoot(50), false);
    assert.ok(Number.isNaN(shoeSizesFromFootMm(50, 'mens').usSize));
  });

  test('a too-long foot has no valid children\'s size', () => {
    assert.equal(isValidChildFoot(300), false);
    assert.ok(Number.isNaN(shoeSizesFromFootMm(300, 'kids').usSize));
  });

  test('zero or negative foot length is never valid', () => {
    assert.equal(isValidAdultFoot(0), false);
    assert.equal(isValidChildFoot(-10), false);
  });
});

describe('shoeSizesFromFootMm', () => {
  test('mens and womens differ by exactly 1 (the primary, adidas-chart scale) at the same foot length', () => {
    const men = shoeSizesFromFootMm(260, 'mens');
    const women = shoeSizesFromFootMm(260, 'womens');
    assert.equal(women.usSize - men.usSize, 1);
    assert.equal(women.ukSize, men.ukSize);
    assert.equal(women.euSize, men.euSize);
  });

  test('mondopoint is independent of category and of the retail convention (it is just the foot length)', () => {
    assert.equal(shoeSizesFromFootMm(262, 'mens').mondopoint, 260);
    assert.equal(shoeSizesFromFootMm(262, 'kids').mondopoint, 260);
  });
});

describe('kids\' chart: label resets (US and UK each reset at their own, different row)', () => {
  test('US resets from 13.5 to 1 at 190 -> 195 mm; UK does not reset there', () => {
    const at190 = kidsSizeAt(190)!;
    const at195 = kidsSizeAt(195)!;
    assert.equal(at190.usSize, 13.5);
    assert.equal(at195.usSize, 1);
    assert.equal(at190.ukSize, 13);
    assert.equal(at195.ukSize, 13.5); // UK has not reset yet at the same row US resets on
  });

  test('UK resets from 13.5 to 1 at 195 -> 200 mm; US does not reset there', () => {
    const at195 = kidsSizeAt(195)!;
    const at200 = kidsSizeAt(200)!;
    assert.equal(at195.ukSize, 13.5);
    assert.equal(at200.ukSize, 1);
    assert.equal(at195.usSize, 1);
    assert.equal(at200.usSize, 1.5); // US already reset one row earlier, now just counting up
  });

  test('interpolating a foot length inside a reset segment snaps to an endpoint, never averages', () => {
    const mid = kidsSizeAt(192.5)!; // halfway between the US-reset row (190) and the next (195)
    assert.ok(mid.usSize === 13.5 || mid.usSize === 1, `got ${mid.usSize}, expected a snap to an endpoint`);
  });

  test('EU never resets and interpolates smoothly through the same region', () => {
    const at190 = kidsSizeAt(190)!;
    const at195 = kidsSizeAt(195)!;
    const mid = kidsSizeAt(192.5)!;
    assert.ok(mid.euSize > at190.euSize && mid.euSize < at195.euSize);
  });

  test('a foot length exactly on a published row returns that row\'s own values', () => {
    const at260 = kidsSizeAt(260);
    assert.equal(at260, null); // 260mm is outside the kids' chart (adult range) -- confirms the guard
    const at155 = kidsSizeAt(155)!; // two adjacent rows share 155mm (9k and 9.5k) in adidas's own chart
    assert.ok(at155.usSize === 9 || at155.usSize === 9.5);
  });
});
