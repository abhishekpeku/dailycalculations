import type { CalculatorConfig } from './types.ts';

// Western zodiac sign table: tropical-zodiac date ranges, element and modality, as given by
// Wikipedia's "Astrological sign" article (step 50 batch 1 citations). The exact day a sign
// starts/ends shifts slightly year to year with the equinox/solstice and varies a little between
// reference sources — see this calculator's watchOut.
const WESTERN_SIGNS = [
  { name: 'Aries', startM: 3, startD: 21, endM: 4, endD: 20, element: 'Fire', modality: 'Cardinal' },
  { name: 'Taurus', startM: 4, startD: 21, endM: 5, endD: 21, element: 'Earth', modality: 'Fixed' },
  { name: 'Gemini', startM: 5, startD: 22, endM: 6, endD: 21, element: 'Air', modality: 'Mutable' },
  { name: 'Cancer', startM: 6, startD: 22, endM: 7, endD: 23, element: 'Water', modality: 'Cardinal' },
  { name: 'Leo', startM: 7, startD: 24, endM: 8, endD: 23, element: 'Fire', modality: 'Fixed' },
  { name: 'Virgo', startM: 8, startD: 24, endM: 9, endD: 23, element: 'Earth', modality: 'Mutable' },
  { name: 'Libra', startM: 9, startD: 24, endM: 10, endD: 23, element: 'Air', modality: 'Cardinal' },
  { name: 'Scorpio', startM: 10, startD: 24, endM: 11, endD: 22, element: 'Water', modality: 'Fixed' },
  { name: 'Sagittarius', startM: 11, startD: 23, endM: 12, endD: 21, element: 'Fire', modality: 'Mutable' },
  { name: 'Capricorn', startM: 12, startD: 22, endM: 1, endD: 20, element: 'Earth', modality: 'Cardinal' },
  { name: 'Aquarius', startM: 1, startD: 21, endM: 2, endD: 19, element: 'Air', modality: 'Fixed' },
  { name: 'Pisces', startM: 2, startD: 20, endM: 3, endD: 20, element: 'Water', modality: 'Mutable' }
] as const;

const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water'] as const;
const MODALITIES = ['Cardinal', 'Fixed', 'Mutable'] as const;
const ELEMENT_POLARITY: Record<string, 'positive' | 'negative'> = { Fire: 'positive', Air: 'positive', Earth: 'negative', Water: 'negative' };

function monthDay(m: number, d: number) {
  return m * 100 + d;
}

function findWesternSign(month: number, day: number) {
  const v = monthDay(month, day);
  for (let i = 0; i < WESTERN_SIGNS.length; i++) {
    const s = WESTERN_SIGNS[i];
    const inRange = s.startM <= s.endM
      ? v >= monthDay(s.startM, s.startD) && v <= monthDay(s.endM, s.endD)
      : v >= monthDay(s.startM, s.startD) || v <= monthDay(s.endM, s.endD); // Capricorn wraps Dec->Jan
    if (inRange) return { index: i, ...s };
  }
  return null;
}

// Lunar New Year start dates, transcribed from Wikipedia's "Chinese zodiac" correspondence table
// (rows 1-60, both the 1924-1983 and 1984-2043 columns — one full 60-year stem/branch cycle twice).
// animalIndex = (row - 1) % 12. See content.references for the source.
const CHINESE_ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'] as const;
const LUNAR_NEW_YEAR_ROWS: [string, string][] = [
  ['1924-02-05', '1984-02-02'], ['1925-01-24', '1985-02-20'], ['1926-02-13', '1986-02-09'],
  ['1927-02-02', '1987-01-29'], ['1928-01-23', '1988-02-17'], ['1929-02-10', '1989-02-06'],
  ['1930-01-30', '1990-01-27'], ['1931-02-17', '1991-02-15'], ['1932-02-06', '1992-02-04'],
  ['1933-01-26', '1993-01-23'], ['1934-02-14', '1994-02-10'], ['1935-02-04', '1995-01-31'],
  ['1936-01-24', '1996-02-19'], ['1937-02-11', '1997-02-07'], ['1938-01-31', '1998-01-28'],
  ['1939-02-19', '1999-02-16'], ['1940-02-08', '2000-02-05'], ['1941-01-27', '2001-01-24'],
  ['1942-02-15', '2002-02-12'], ['1943-02-05', '2003-02-01'], ['1944-01-25', '2004-01-22'],
  ['1945-02-13', '2005-02-09'], ['1946-02-02', '2006-01-29'], ['1947-01-22', '2007-02-18'],
  ['1948-02-10', '2008-02-07'], ['1949-01-29', '2009-01-26'], ['1950-02-17', '2010-02-14'],
  ['1951-02-06', '2011-02-03'], ['1952-01-27', '2012-01-23'], ['1953-02-14', '2013-02-10'],
  ['1954-02-03', '2014-01-31'], ['1955-01-24', '2015-02-19'], ['1956-02-12', '2016-02-08'],
  ['1957-01-31', '2017-01-28'], ['1958-02-18', '2018-02-16'], ['1959-02-08', '2019-02-05'],
  ['1960-01-28', '2020-01-25'], ['1961-02-15', '2021-02-12'], ['1962-02-05', '2022-02-01'],
  ['1963-01-25', '2023-01-22'], ['1964-02-13', '2024-02-10'], ['1965-02-02', '2025-01-29'],
  ['1966-01-21', '2026-02-17'], ['1967-02-09', '2027-02-06'], ['1968-01-30', '2028-01-26'],
  ['1969-02-17', '2029-02-13'], ['1970-02-06', '2030-02-03'], ['1971-01-27', '2031-01-23'],
  ['1972-02-15', '2032-02-11'], ['1973-02-03', '2033-01-31'], ['1974-01-23', '2034-02-19'],
  ['1975-02-11', '2035-02-08'], ['1976-01-31', '2036-01-28'], ['1977-02-18', '2037-02-15'],
  ['1978-02-07', '2038-02-04'], ['1979-01-28', '2039-01-24'], ['1980-02-16', '2040-02-12'],
  ['1981-02-05', '2041-02-01'], ['1982-01-25', '2042-01-22'], ['1983-02-13', '2043-02-10']
];
type LunarEntry = { y: number; m: number; d: number; animalIndex: number; num: number };
const LUNAR_NEW_YEAR_TABLE: LunarEntry[] = LUNAR_NEW_YEAR_ROWS.flatMap((pair, rowIndex) =>
  pair.map((dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return { y, m, d, animalIndex: rowIndex % 12, num: y * 10000 + m * 100 + d };
  })
).sort((a, b) => a.num - b.num);
const FIRST_LUNAR_ENTRY = LUNAR_NEW_YEAR_TABLE[0];
const LAST_LUNAR_ENTRY = LUNAR_NEW_YEAR_TABLE[LUNAR_NEW_YEAR_TABLE.length - 1];

function findChineseZodiacYear(year: number, month: number, day: number) {
  const num = year * 10000 + month * 100 + day;
  let match: LunarEntry | null = null;
  for (const entry of LUNAR_NEW_YEAR_TABLE) {
    if (entry.num <= num) match = entry;
    else break;
  }
  return match;
}

// Pythagorean-system digit reduction: sum digits until a single digit or a master number
// (11, 22, 33), which is never reduced further. Cited to World Numerology's life path method.
function reduceNumerology(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((sum, digit) => sum + Number(digit), 0);
  }
  return n;
}

// Exact integer combinations (nCr) via BigInt, using the same step-wise-exact-division trick as
// the statistics category's own nCrBig: C(n, i+1) = C(n, i) * (n-i) / (i+1) is always an integer
// at every step. Used by the lottery-odds and card-draw probability calculators (batch 2).
const PROBABILITY_MAX_N = 1000;
function nCrBig(n: number, r: number): bigint {
  if (r < 0 || r > n || n < 0) return 0n;
  r = Math.min(r, n - r);
  let result = 1n;
  for (let i = 0; i < r; i++) result = (result * BigInt(n - i)) / BigInt(i + 1);
  return result;
}

// Exact probability distribution of the sum of `dice` dice with `sides` faces each, found by
// convolving one die's uniform distribution with itself `dice` times -- the dice-sum generating
// function x(1 + x + ... + x^(sides-1)) raised to the `dice` power (MathWorld, "Dice", cited below).
// dist[j] = P(sum = dice + j), for j = 0 .. dice * (sides - 1).
function diceSumDistribution(dice: number, sides: number): number[] {
  let dist = [1];
  for (let d = 0; d < dice; d++) {
    const next = new Array(dist.length + sides - 1).fill(0);
    for (let i = 0; i < dist.length; i++) {
      for (let face = 1; face <= sides; face++) next[i + face - 1] += dist[i] / sides;
    }
    dist = next;
  }
  return dist;
}

// Exact binomial probability P(low <= X <= high) for n trials with per-trial success chance p,
// via the ratio recurrence pmf(k) = pmf(k-1) * (n-k+1)/k * p/(1-p) -- algebraically identical to
// the nCr(n,k) p^k (1-p)^(n-k) formula (NIST/SEMATECH Engineering Statistics Handbook, cited below)
// but computed without ever forming n! directly, so it stays stable for large n.
function binomialRangeProbability(n: number, p: number, low: number, high: number): number {
  low = Math.max(0, Math.round(low));
  high = Math.min(n, Math.round(high));
  if (low > high) return 0;
  if (p <= 0) return low <= 0 && high >= 0 ? 1 : 0;
  if (p >= 1) return n >= low && n <= high ? 1 : 0;
  let pmf = Math.pow(1 - p, n);
  let sum = low <= 0 && 0 <= high ? pmf : 0;
  const ratio = p / (1 - p);
  for (let k = 1; k <= n; k++) {
    pmf *= ((n - k + 1) / k) * ratio;
    if (k >= low && k <= high) sum += pmf;
  }
  return sum;
}

// P(no two of `people` people share a birthday), assuming 365 equally likely, independent
// birthdays (Wikipedia, "Birthday problem", cited below). The complement is the shared-birthday
// probability.
function noSharedBirthdayProbability(people: number, days = 365): number {
  let prob = 1;
  for (let i = 0; i < people; i++) {
    prob *= (days - i) / days;
    if (prob <= 0) return 0;
  }
  return Math.max(prob, 0);
}

// Computed once at module load, not typed in: the smallest group size at which the real formula
// above first reaches each threshold, for the 365-equally-likely-birthdays assumption.
function smallestGroupFor(thresholdPercent: number): number {
  let n = 1;
  while (1 - noSharedBirthdayProbability(n) < thresholdPercent / 100) n++;
  return n;
}
const MIN_PEOPLE_FOR_50_PERCENT = smallestGroupFor(50);
const MIN_PEOPLE_FOR_99_PERCENT = smallestGroupFor(99);

// Hypergeometric probability mass: P(exactly k successes in n draws, without replacement, from a
// population of size N containing K successes) -- Wikipedia, "Hypergeometric distribution", cited
// below. Used directly by the card-draw calculator, and the same shape as a lottery's odds.
function hypergeometricPmf(N: number, K: number, n: number, k: number): number {
  const total = nCrBig(N, n);
  if (total === 0n) return NaN;
  const ways = nCrBig(K, k) * nCrBig(N - K, n - k);
  return Number(ways) / Number(total);
}
function hypergeometricRangeProbability(N: number, K: number, n: number, low: number, high: number): number {
  low = Math.max(0, Math.round(low));
  high = Math.min(n, K, Math.round(high));
  let sum = 0;
  for (let k = low; k <= high; k++) sum += hypergeometricPmf(N, K, n, k);
  return sum;
}

// Reference table for the lottery-odds calculator's content: a generic 6-from-49 pick structure
// (used by multiple real lotteries worldwide, named by no single one) shown purely to illustrate
// how fast the odds change with the match count. Every value is computed from nCrBig, not typed.
const LOTTERY_EXAMPLE_POOL = 49;
const LOTTERY_EXAMPLE_PICKS = 6;
const LOTTERY_EXAMPLE_ROWS = Array.from({ length: LOTTERY_EXAMPLE_PICKS + 1 }, (_, m) => {
  const matches = LOTTERY_EXAMPLE_PICKS - m; // build from jackpot (6) down to 0 matches
  const ways = nCrBig(LOTTERY_EXAMPLE_PICKS, matches) * nCrBig(LOTTERY_EXAMPLE_POOL - LOTTERY_EXAMPLE_PICKS, LOTTERY_EXAMPLE_PICKS - matches);
  const total = nCrBig(LOTTERY_EXAMPLE_POOL, LOTTERY_EXAMPLE_PICKS);
  const probability = Number(ways) / Number(total);
  return { matches, oddsOneIn: probability > 0 ? 1 / probability : NaN };
});

// Generic positive-remainder modulus (JS's own % can return a negative result).
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// Gauss's Easter algorithm (1800), Gregorian-calendar form, per Wikipedia's "Date of Easter" --
// cited directly below. Finds the Sunday following the ecclesiastical "Paschal full moon" (the
// first calculated full moon on or after March 21) using only modular arithmetic -- no lookup
// table of real moon phases. The two `if` lines patch the two documented rare exceptions to the
// raw d/e formula.
function easterSunday(year: number): { month: number; day: number; goldenNumber: number } {
  const a = year % 19;
  const b = year % 4;
  const c = year % 7;
  const k = Math.floor(year / 100);
  const p = Math.floor((13 + 8 * k) / 25);
  const q = Math.floor(k / 4);
  const M = mod(15 - p + k - q, 30);
  const N = mod(4 + k - q, 7);
  const d = mod(19 * a + M, 30);
  const e = mod(2 * b + 4 * c + 6 * d + N, 7);
  let day = 22 + d + e;
  let month = 3; // March
  if (day > 31) { day = d + e - 9; month = 4; } // April
  if (month === 4 && day === 26) day = 19;
  if (month === 4 && day === 25 && d === 28 && e === 6 && a > 10) day = 18;
  return { month, day, goldenNumber: a + 1 }; // golden number: 1-indexed position in the 19-year Metonic cycle
}

// Julian Day Number of a proleptic-Gregorian calendar date (Fliegel & Van Flandern, 1968) --
// the standard integer-arithmetic way to turn any Gregorian date into a single running day count.
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// GMT (Goodman-Martinez-Thompson) correlation constant: the Julian Day Number of the Maya
// creation date, Long Count 0.0.0.0.0 -- the correlation most Mayanist scholars use today
// (Wikipedia, "Mesoamerican Long Count calendar", cited below). See this calculator's watchOut
// for the less-used Spinden correlation (489,384) this calculator does NOT use.
const MAYA_GMT_CORRELATION = 584283;

// A Long Count is five place values, base 20/18/20/20/20 from the top: baktun (144,000 days),
// katun (7,200), tun (360), uinal (20), kin (1). baktun is NOT taken mod 20 -- in real-world use
// it keeps counting past 13 (we are in the 14th baktun today), unlike the lower four places.
function mayanLongCount(JDN: number) {
  const n = JDN - MAYA_GMT_CORRELATION;
  return {
    n,
    baktun: Math.floor(n / 144000),
    katun: mod(Math.floor(n / 7200), 20),
    tun: mod(Math.floor(n / 360), 20),
    uinal: mod(Math.floor(n / 20), 18),
    kin: mod(n, 20)
  };
}

// 20 Tzolk'in day names in their fixed cycle order (Wikipedia, "Tzolk'in", cited below).
const TZOLKIN_DAY_NAMES = ["Imix", "Ik'", "Ak'b'al", "K'an", "Chikchan", "Kimi", "Manik'", "Lamat", "Muluk", "Ok",
  "Chuwen", "Eb'", "B'en", "Ix", "Men", "K'ib'", "Kab'an", "Etz'nab'", "Kawak", "Ajaw"] as const;
// 18 named Haab' months, in order, plus Wayeb' (the 5-day 19th "month") (Wikipedia, "Haab'", cited below).
const HAAB_MONTH_NAMES = ["Pop", "Wo'", "Sip", "Sotz'", "Sek", "Xul", "Yaxk'in", "Mol", "Ch'en", "Yax",
  "Sak'", "Keh", "Mak", "K'ank'in", "Muwan", "Pax", "K'ayab'", "Kumk'u", "Wayeb'"] as const;

// Both 260-day (Tzolk'in) and 365-day (Haab') cycles are anchored to the mythical creation date
// (n = 0), recorded as "4 Ajaw 8 Kumk'u" (Wikipedia, "Maya calendar", cited below) -- a fixed
// correspondence independent of which correlation constant maps it to a Gregorian date.
function tzolkinOf(n: number) {
  return {
    number: mod(n + 3, 13) + 1, // n=0 -> 4
    dayIndex: mod(n + 19, 20) // n=0 -> 19 (Ajaw)
  };
}
function haabOf(n: number) {
  const dayOfYear = mod(n + 348, 365); // n=0 -> 348 = day 8 of month index 17 (Kumk'u) -> "8 Kumk'u"
  if (dayOfYear < 360) return { monthIndex: Math.floor(dayOfYear / 20), dayNumber: mod(dayOfYear, 20) };
  return { monthIndex: 18, dayNumber: dayOfYear - 360 }; // Wayeb', days 0-4
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Which months (1-12) have a Friday the 13th in `year`. JS's own Date already implements the
// Gregorian leap-year rule correctly, so no separate leap-year handling is needed here.
function friday13Months(year: number): number[] {
  const months: number[] = [];
  for (let m = 0; m < 12; m++) if (new Date(year, m, 13).getDay() === 5) months.push(m + 1);
  return months;
}

// Weekdays (Mon-Fri) vs weekend days (Sat/Sun) in [startMs, endMs], both whole local-midnight
// calendar days, inclusive. Closed-form over full 7-day weeks plus a remainder of under 7 days,
// so it stays instant and exact no matter how far apart the two dates are -- never an
// unbounded day-by-day loop. Used by the Christmas countdown's "shopping days" split.
function weekdayWeekendCount(startMs: number, endMs: number): { weekdays: number; weekendDays: number } {
  if (endMs < startMs) return { weekdays: 0, weekendDays: 0 };
  const totalDays = Math.round((endMs - startMs) / 86400000) + 1;
  const startWeekday = new Date(startMs).getDay(); // 0=Sun..6=Sat
  const fullWeeks = Math.floor(totalDays / 7);
  const remainder = totalDays % 7;
  let weekdays = fullWeeks * 5;
  let weekendDays = fullWeeks * 2;
  for (let i = 0; i < remainder; i++) {
    const day = (startWeekday + i) % 7;
    if (day === 0 || day === 6) weekendDays++; else weekdays++;
  }
  return { weekdays, weekendDays };
}

// Common display/image aspect ratios, width:height (Wikipedia, "Aspect ratio (image)", cited
// below). Shared by screen-size-calculator's diagonal -> width/height split (a preset menu) and
// quoted as guidance in aspect-ratio-calculator's content (that one takes the two ratio numbers
// as free entry, since a SolverVariable has no `options` menu field).
const ASPECT_RATIOS: { value: number; label: string; w: number; h: number }[] = [
  { value: 0, label: '16:9 (most TVs, laptops and monitors)', w: 16, h: 9 },
  { value: 1, label: '16:10 (some laptops and monitors)', w: 16, h: 10 },
  { value: 2, label: '4:3 (older TVs and monitors)', w: 4, h: 3 },
  { value: 3, label: '21:9 (ultrawide monitors)', w: 21, h: 9 },
  { value: 4, label: '3:2 (many tablets and some laptops)', w: 3, h: 2 },
  { value: 5, label: '1:1 (square)', w: 1, h: 1 }
];

// Uptime "nines" table: downtime per year/month/day as a function of the uptime percentage, by
// plain arithmetic over a calendar-average year (Wikipedia, "High availability", "Percentage
// calculation", cited below) -- shared by the reference table and the live calculator so neither
// one types a result by hand. 365.25 is the same Julian-year average measurements.ts and time.ts
// already use elsewhere on this site.
const UPTIME_YEAR_DAYS = 365.25;
const UPTIME_MONTH_DAYS = UPTIME_YEAR_DAYS / 12;
function uptimeDowntime(uptimePercent: number) {
  const downFraction = 1 - uptimePercent / 100;
  return {
    perYearHours: downFraction * UPTIME_YEAR_DAYS * 24,
    perMonthMinutes: downFraction * UPTIME_MONTH_DAYS * 24 * 60,
    perDaySeconds: downFraction * 24 * 3600
  };
}
// The four "nines" the step asked for, used to build the reference table below.
const STANDARD_NINES = [99, 99.9, 99.99, 99.999];

export const funCalculators: CalculatorConfig[] = [
  {
    id: 'zodiac-sign-calculator',
    category: 'fun',
    glyph: 'zod',
    updatedAt: '2026-11-18',
    aliases: ['what is my zodiac sign', 'star sign calculator', 'astrology sign by birthday', 'zodiac element finder', 'horoscope sign calculator'],
    related: ['chinese-zodiac-calculator', 'zodiac-compatibility-calculator', 'age-calculator', 'name-numerology-calculator'],
    title: 'Zodiac Sign Calculator',
    description: 'Find your Western zodiac sign, element, and modality (ruling quality) from your birth month and day, for entertainment purposes only.',
    example: 'Someone born July 30 is a Leo — a Fire sign with Fixed modality.',
    breakdown: {
      headline: 'signCode',
      headlineLabel: 'Zodiac sign',
      outputs: [
        { id: 'signCode', label: 'Zodiac sign', labels: WESTERN_SIGNS.map((s, i) => ({ value: i, label: s.name })) },
        { id: 'elementCode', label: 'Element', labels: ELEMENTS.map((e, i) => ({ value: i, label: e })) },
        { id: 'modalityCode', label: 'Modality (ruling quality)', labels: MODALITIES.map((m, i) => ({ value: i, label: m })) }
      ],
      groups: [{ title: 'Date of birth', inputs: ['birthMonth', 'birthDay'] }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What a zodiac sign, element and modality are',
        paragraphs: [
          'Western (tropical) astrology divides the year into 12 fixed-length stretches, each named for a constellation the sun appeared to pass in front of thousands of years ago, even though precession has since shifted the actual constellations out of sync with the calendar dates. Your "sign" is simply which of the 12 stretches your birth date falls into — a calendar lookup, not a measurement of anything in the sky on the day you were born.',
          'Each sign also carries two secondary labels used throughout astrology. The element — Fire, Earth, Air or Water — groups three signs that are four months apart (a "trine") and are traditionally described as sharing a temperament: Fire signs as energetic, Earth as practical, Air as idea-driven, Water as emotional. The modality — Cardinal, Fixed or Mutable — groups four signs three months apart and describes a traditional role: Cardinal signs "start" a season, Fixed signs "sustain" it, Mutable signs "transition" out of it.',
          'None of this is a scientific classification of personality. It is a centuries-old symbolic system this page reproduces for entertainment, the same way a horoscope column does — not a claim that your birth date determines your temperament.'
        ]
      },
      howTo: {
        intro: 'Enter your birth month and day. Year is not needed — a Western zodiac sign depends only on where in the calendar year your birthday falls.',
        steps: [
          { name: 'Enter your birth month and day', text: 'Use the month and day only; the zodiac sign does not depend on which year you were born.' },
          { name: 'Read your sign', text: 'The headline names the one of 12 signs your date falls into.' },
          { name: 'Check your element', text: 'Fire, Earth, Air or Water — the trine your sign belongs to.' },
          { name: 'Check your modality', text: 'Cardinal, Fixed or Mutable — the traditional "role" astrologers assign your sign within its season.' }
        ],
        outro: 'Everything is calculated in your browser from the date range table below. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'There is no equation — a zodiac sign is a lookup against 12 fixed date ranges, each with its own element and modality.',
        expression:
          'sign = the one range in the table below that contains (birth month, birth day)\nCapricorn\'s range crosses the new year (Dec 22 - Jan 20), so it is checked with "or" instead of "and"',
        terms: WESTERN_SIGNS.map((s) => ({
          symbol: s.name,
          meaning: `${s.startM}/${s.startD} to ${s.endM}/${s.endD} - ${s.element}, ${s.modality}`
        })),
        note: 'The date ranges below are one commonly published version (see references). Because the real astronomical start of Aries drifts a little each year with the equinox, and different almanacs round that drift differently, some sources place a boundary a day earlier or later than shown here.'
      },
      workedExample: {
        intro: 'What sign is someone born on July 30?',
        rows: [
          { label: 'Date entered', value: 'July 30' },
          { label: 'Range it falls in', value: 'Leo: July 24 - August 23' },
          { label: 'Element', value: 'Fire (shared with Aries and Sagittarius)' },
          { label: 'Modality', value: 'Fixed (shared with Taurus, Scorpio and Aquarius)' }
        ],
        result: 'Leo - a Fire sign with Fixed modality',
        explanation: 'July 30 sits inside the July 24 - August 23 range reserved for Leo, which this table lists as a Fire-element, Fixed-modality sign.'
      },
      watchOut: [
        { title: 'Boundary dates vary by source', body: 'Because the equinoxes and solstices that anchor the tropical zodiac drift by about a day across a 4-year cycle, almanacs and astrology sites do not all draw sign boundaries on exactly the same calendar day. If your birthday is within a day of a boundary shown here, another reputable source may place you in the neighboring sign instead.' },
        { title: 'This is the tropical (Western), not sidereal (Vedic), zodiac', body: 'Vedic/Jyotish astrology uses a different, sidereal zodiac that is currently offset from the tropical one by roughly 24 degrees — about three and a half weeks of the calendar. A Vedic reading of the same birth date will often name a different sign.' },
        { title: 'Astrology has no scientific support', body: 'Mainstream science treats astrology as a pseudoscience with no demonstrated predictive validity. This page presents a traditional symbolic system for entertainment, not a scientific personality assessment.' },
        { title: 'The sign itself never changes; only the calendar dates behind it do', body: 'Someone born "on the Leo/Virgo cusp" still has exactly one tropical sign by this table — astrologers disagree about how much a birth near a boundary should be blended with the neighboring sign, but the date-range method itself always resolves to a single sign.' }
      ],
      references: [
        { label: 'Wikipedia, Astrological sign (date ranges, elements, modalities)', url: 'https://en.wikipedia.org/wiki/Astrological_sign' },
        { label: 'Wikipedia, Astrology (scientific consensus on validity)', url: 'https://en.wikipedia.org/wiki/Astrology' }
      ]
    },
    inputs: [
      { id: 'birthMonth', label: 'Birth month (1-12)', type: 'number', placeholder: '7', defaultValue: 7, step: 1, min: 1 },
      { id: 'birthDay', label: 'Birth day (1-31)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 }
    ],
    seo: {
      title: 'Zodiac Sign Calculator – Western Sign, Element & Modality',
      description: 'Find your Western zodiac sign, element (Fire/Earth/Air/Water) and modality from your birth month and day. For entertainment, not a scientific claim.',
      faq: [
        { question: 'What zodiac sign is July 30?', answer: 'Leo. July 30 falls within the July 24 - August 23 range most sources assign to Leo, a Fire sign with Fixed modality.' },
        { question: 'Why do different websites show slightly different zodiac dates?', answer: 'The tropical zodiac is anchored to the equinoxes and solstices, which drift by about a day across a 4-year cycle, so almanacs and astrology sites round the boundary dates a little differently. A birthday within a day of a boundary can land in either neighboring sign depending on the source.' },
        { question: 'What does a zodiac element mean?', answer: 'Fire, Earth, Air and Water each group three signs spaced four months apart. Astrology traditionally describes Fire as energetic, Earth as practical, Air as idea-driven and Water as emotional — a symbolic grouping, not a scientific trait category.' },
        { question: 'What does modality (ruling quality) mean?', answer: 'Cardinal, Fixed and Mutable each group four signs spaced three months apart, corresponding to the start, middle and end of a season. Astrology assigns Cardinal signs an "initiating" role, Fixed signs a "sustaining" role and Mutable signs a "transitional" role.' },
        { question: 'Is my zodiac sign the same in Western and Vedic astrology?', answer: 'Not necessarily. Vedic (sidereal) astrology uses a zodiac currently offset by about 24 degrees from the Western tropical zodiac used here, which can shift a birth date into a different sign under that system.' },
        { question: 'Is astrology scientifically accurate?', answer: 'No. Astrology is widely regarded by the scientific community as a pseudoscience with no demonstrated predictive validity. This calculator reproduces a traditional symbolic system for entertainment only.' }
      ]
    },
    compute(values) {
      const sign = findWesternSign(values.birthMonth, values.birthDay);
      if (!sign) return { signCode: NaN, elementCode: NaN, modalityCode: NaN };
      return {
        signCode: sign.index,
        elementCode: ELEMENTS.indexOf(sign.element as typeof ELEMENTS[number]),
        modalityCode: MODALITIES.indexOf(sign.modality as typeof MODALITIES[number])
      };
    }
  },
  {
    id: 'chinese-zodiac-calculator',
    category: 'fun',
    glyph: 'zh',
    updatedAt: '2026-11-18',
    aliases: ['chinese zodiac animal calculator', 'what chinese zodiac animal am i', 'lunar new year birth animal', 'chinese horoscope by birth year', 'year of the animal calculator'],
    related: ['zodiac-sign-calculator', 'zodiac-compatibility-calculator', 'age-calculator', 'leap-year-calculator'],
    title: 'Chinese Zodiac Calculator',
    description: 'Find your Chinese zodiac animal from your full birth date, using real Lunar New Year start dates rather than treating January 1 as the cutover.',
    example: 'Someone born January 15, 1990 is a Snake, not a Horse — the 1990 Lunar New Year did not start until January 27, 1990.',
    breakdown: {
      headline: 'animalCode',
      headlineLabel: 'Chinese zodiac animal',
      outputs: [
        { id: 'animalCode', label: 'Chinese zodiac animal', labels: CHINESE_ANIMALS.map((a, i) => ({ value: i, label: a })) },
        { id: 'zodiacYearStartCode', label: 'Your zodiac year began (YYYYMMDD)', format: 'integer' }
      ],
      groups: [{ title: 'Date of birth', inputs: ['birthYear', 'birthMonth', 'birthDay'] }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why the Chinese zodiac year does not start on January 1',
        paragraphs: [
          'The Chinese zodiac assigns one of 12 animals — Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog and Pig, in that fixed order — to each year of the traditional Chinese lunisolar calendar. Unlike the Gregorian calendar, a lunisolar year does not begin on a fixed date: Lunar New Year (the start of the zodiac year) falls on a different Gregorian date each year, anywhere from about January 21 to February 20, because it is tied to the new moon nearest the start of spring.',
          'That means the simple shortcut of "take the birth year and look up its animal" is wrong for anyone born between January 1 and whatever date Lunar New Year fell on that particular year. A person born January 15, 1990, for example, was born before the 1990 Lunar New Year (January 27, 1990) even started, so they are still in the previous zodiac year — the Year of the Snake, not the Year of the Horse most people associate with "born in 1990."',
          'This calculator avoids that mistake by comparing your exact birth date against a real, published table of Lunar New Year start dates rather than assuming the cutover is January 1.'
        ]
      },
      howTo: {
        intro: 'Enter your full date of birth. The animal depends on exactly where your birth date falls relative to that year\'s real Lunar New Year date, not just the calendar year.',
        steps: [
          { name: 'Enter your date of birth', text: 'Year, month and day, using the Gregorian calendar date on your birth certificate.' },
          { name: 'Read your animal', text: 'The headline names the one of 12 zodiac animals your birth date falls under.' },
          { name: 'Check when your zodiac year began', text: 'Shown as the Lunar New Year date (YYYYMMDD) that started the zodiac year containing your birthday, so you can see why a birthday in January or early February sometimes lands in the "previous" year\'s animal.' }
        ],
        outro: 'Everything is calculated in your browser against the lookup table below. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'There is no closed-form equation for a lunisolar calendar — the animal is found by comparing your birth date against a real table of Lunar New Year start dates.',
        expression:
          'animal = the animal of the most recent Lunar New Year start date on or before your birth date\n12-animal order: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig (repeating)',
        terms: [
          { symbol: 'Lunar New Year', meaning: 'The first day of the Chinese lunisolar calendar\'s new year, astronomically tied to the new moon nearest the start of spring — it falls on a different Gregorian date each year, roughly January 21 to February 20.' },
          { symbol: 'table', meaning: `This calculator's table covers Lunar New Year start dates from ${FIRST_LUNAR_ENTRY.y}-${String(FIRST_LUNAR_ENTRY.m).padStart(2, '0')}-${String(FIRST_LUNAR_ENTRY.d).padStart(2, '0')} to ${LAST_LUNAR_ENTRY.y}-${String(LAST_LUNAR_ENTRY.m).padStart(2, '0')}-${String(LAST_LUNAR_ENTRY.d).padStart(2, '0')}, transcribed from the published correspondence table in the references.` }
        ],
        note: 'The table is real published dates, not an approximation or a "treat January 1 as the cutover" shortcut.'
      },
      workedExample: {
        intro: 'What is the zodiac animal for someone born January 15, 1990, compared with someone born later the same year on June 17, 1990?',
        rows: [
          { label: 'January 15, 1990 vs. the 1990 Lunar New Year (January 27, 1990)', value: 'Born before that year\'s cutover' },
          { label: 'Most recent Lunar New Year on or before January 15, 1990', value: 'January 30, 1989 — Snake' },
          { label: 'June 17, 1990 vs. the same cutover', value: 'Born after it' },
          { label: 'Most recent Lunar New Year on or before June 17, 1990', value: 'January 27, 1990 — Horse' }
        ],
        result: 'January 15, 1990 is a Snake; June 17, 1990 is a Horse — despite sharing a birth year',
        explanation: 'The two dates are both in "1990," but only one of them comes after that year\'s Lunar New Year. The calculator always compares the full birth date against the real table rather than the birth year alone.'
      },
      watchOut: [
        { title: 'The birth year alone is not enough', body: 'Anyone born in January or early-to-mid February should check their exact date — depending on the year, they may fall in the animal before the one most commonly associated with their birth year.' },
        { title: 'This table covers a specific range', body: `This calculator's Lunar New Year table runs from ${FIRST_LUNAR_ENTRY.y} to ${LAST_LUNAR_ENTRY.y}. A birth date outside that range is outside what this page can look up.` },
        { title: 'Two schools of thought on the exact cutover', body: 'Most modern sources use Lunar New Year itself as the zodiac year boundary, which is what this calculator does. A minority of traditional sources instead use the solar term "start of spring" (lichun), which can fall a couple of weeks before Lunar New Year and would occasionally shift a borderline birth date to a different animal.' },
        { title: 'This is a folklore/entertainment system', body: 'Like the Western zodiac, the Chinese zodiac is a traditional symbolic system, not a scientifically validated description of personality or fate.' }
      ],
      references: [
        { label: 'Wikipedia, Chinese zodiac (12-animal order and Lunar New Year correspondence table)', url: 'https://en.wikipedia.org/wiki/Chinese_zodiac' }
      ]
    },
    inputs: [
      { id: 'birthYear', label: 'Birth year', type: 'number', placeholder: '1990', defaultValue: 1990, step: 1, min: FIRST_LUNAR_ENTRY.y },
      { id: 'birthMonth', label: 'Birth month (1-12)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'birthDay', label: 'Birth day (1-31)', type: 'number', placeholder: '15', defaultValue: 15, step: 1, min: 1 }
    ],
    seo: {
      title: 'Chinese Zodiac Calculator – Real Lunar New Year Dates',
      description: 'Find your Chinese zodiac animal from your full birth date using real Lunar New Year start dates, not a January 1 approximation.',
      faq: [
        { question: 'What Chinese zodiac animal is someone born January 15, 1990?', answer: 'Snake. The 1990 Lunar New Year did not begin until January 27, 1990, so a birth date two weeks earlier still falls in the previous zodiac year, the Year of the Snake, which started January 30, 1989.' },
        { question: 'Why isn\'t my Chinese zodiac animal the one for my birth year?', answer: 'Because Lunar New Year falls on a different Gregorian date each year (roughly January 21 to February 20), anyone born between January 1 and that year\'s Lunar New Year is still in the previous zodiac year.' },
        { question: 'What are the 12 Chinese zodiac animals in order?', answer: 'Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog and Pig, repeating in that order every 12 years.' },
        { question: 'What date range does this calculator cover?', answer: `${FIRST_LUNAR_ENTRY.y} through ${LAST_LUNAR_ENTRY.y}, taken directly from a published Lunar New Year correspondence table. A birth date outside that range cannot be looked up here.` },
        { question: 'Is the Chinese zodiac based on the moon?', answer: 'Yes. The Chinese calendar is lunisolar, and Lunar New Year — the start of each zodiac year — is tied to the new moon nearest the start of spring, which is why it moves around on the Gregorian calendar instead of landing on a fixed date.' },
        { question: 'Is the Chinese zodiac scientifically accurate?', answer: 'No. Like Western astrology, it is a traditional folklore system with no scientific support for predicting personality or fate. This calculator is for entertainment.' }
      ]
    },
    compute(values) {
      const match = findChineseZodiacYear(values.birthYear, values.birthMonth, values.birthDay);
      if (!match) return { animalCode: NaN, zodiacYearStartCode: NaN };
      return { animalCode: match.animalIndex, zodiacYearStartCode: match.y * 10000 + match.m * 100 + match.d };
    }
  },
  {
    id: 'zodiac-compatibility-calculator',
    category: 'fun',
    glyph: 'cmp',
    updatedAt: '2026-11-18',
    aliases: ['zodiac sign compatibility calculator', 'astrology compatibility checker', 'star sign match calculator', 'element compatibility astrology'],
    related: ['zodiac-sign-calculator', 'chinese-zodiac-calculator', 'love-calculator', 'name-numerology-calculator'],
    title: 'Zodiac Compatibility Calculator',
    description: 'Compare two Western zodiac signs by element and modality, the traditional astrological compatibility framework, for entertainment purposes only — not a scientific claim.',
    example: 'Aries and Libra share a modality (both Cardinal) and a polarity (Fire and Air are both traditionally "positive" elements).',
    breakdown: {
      headline: 'elementRelationCode',
      headlineLabel: 'Element relationship',
      outputs: [
        { id: 'elementRelationCode', label: 'Element relationship', labels: [{ value: 0, label: 'Same element' }, { value: 1, label: 'Same polarity, different element' }, { value: 2, label: 'Different polarity' }] },
        { id: 'modalityRelationCode', label: 'Modality relationship', labels: [{ value: 0, label: 'Same modality' }, { value: 1, label: 'Different modality' }] }
      ],
      groups: [{ title: 'Two signs', inputs: ['signA', 'signB'] }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'The element/modality compatibility framework',
        paragraphs: [
          'Western astrology groups the 12 signs two ways: by element (Fire, Earth, Air, Water — three signs each) and by modality (Cardinal, Fixed, Mutable — four signs each). Astrologers traditionally also split the four elements into two polarities: Fire and Air are grouped as "positive" (active, outward), Earth and Water as "negative" (receptive, inward).',
          'A common, traditional way to describe how two signs get along reads off those two groupings. Two signs sharing an element are said to have an instant, similar outlook. Two signs of different elements but the same polarity (one Fire-or-Air paired with the other Fire-or-Air, or one Earth-or-Water paired with the other) are described as complementary. Two signs of opposite polarity are described as needing more active effort to balance. Separately, two signs sharing a modality are said to approach life the same way (which can mean natural rapport or friction, depending on the pairing), while different modalities are said to balance each other\'s approach.',
          'This calculator reports those two relationships — element and modality — for any pair of signs you choose. It does not predict anything about a real relationship: it is entertainment, reproducing a traditional symbolic framework.'
        ]
      },
      howTo: {
        intro: 'Choose two Western zodiac signs to compare.',
        steps: [
          { name: 'Pick the first sign', text: 'Select from the 12 Western zodiac signs.' },
          { name: 'Pick the second sign', text: 'Select the sign you want to compare it against — the two can be the same sign.' },
          { name: 'Read the element relationship', text: 'Same element, same polarity (complementary), or different polarity.' },
          { name: 'Read the modality relationship', text: 'Whether the two signs share a modality (Cardinal, Fixed or Mutable) or not.' }
        ],
        outro: 'Everything is calculated in your browser from the element/modality table below. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Both relationships are lookups against each sign\'s element and modality, not a numeric score.',
        expression:
          'elementRelation = "Same element" if element(A) = element(B)\n  else "Same polarity, different element" if polarity(element(A)) = polarity(element(B))\n  else "Different polarity"\nmodalityRelation = "Same modality" if modality(A) = modality(B), else "Different modality"\npolarity(Fire) = polarity(Air) = positive; polarity(Earth) = polarity(Water) = negative',
        terms: [
          { symbol: 'element(X)', meaning: 'Fire, Earth, Air or Water, from the zodiac sign calculator\'s own table.' },
          { symbol: 'modality(X)', meaning: 'Cardinal, Fixed or Mutable, from the same table.' },
          { symbol: 'polarity', meaning: 'The traditional "positive"/"negative" grouping of the four elements: Fire and Air are positive, Earth and Water are negative.' }
        ],
        note: 'There is no single agreed numeric "compatibility score" in real astrological practice — this calculator reports the underlying element/modality relationship rather than inventing a percentage.'
      },
      workedExample: {
        intro: 'How do Aries and Libra compare?',
        rows: [
          { label: 'Aries', value: 'Fire, Cardinal' },
          { label: 'Libra', value: 'Air, Cardinal' },
          { label: 'Element check', value: 'Different elements (Fire vs. Air), but both "positive" polarity' },
          { label: 'Modality check', value: 'Both Cardinal' }
        ],
        result: 'Same polarity, different element; same modality',
        explanation: 'Aries and Libra do not share an element, but Fire and Air are both traditionally "positive," and both signs are Cardinal — the pairing astrologers often describe as "opposites that balance," since Aries and Libra also sit exactly opposite each other on the zodiac wheel.'
      },
      watchOut: [
        { title: 'This is astrology, not a scientific compatibility measure', body: 'A 2020 demographic study in the journal Genus (Helgertz & Scott) examined real marriage and divorce records against sun-sign pairings; astrology more broadly has no demonstrated predictive validity in controlled studies (see references). Treat this page as entertainment.' },
        { title: 'Sun sign is only one factor in real astrological practice', body: 'Professional astrologers who take the subject seriously typically compare full birth charts (moon sign, rising sign, and planetary positions for both people), not just the two sun signs. This calculator only covers the simplified sun-sign/element/modality framework.' },
        { title: 'Same element or modality is not automatically "better"', body: 'The traditional framework describes same-element pairs as easy and same-modality pairs as "alike," not necessarily as more compatible than a complementary or balancing pair — many popular astrology writers consider opposite-polarity, different-modality pairings just as workable.' },
        { title: 'Comparing a sign with itself', body: 'Choosing the same sign twice always returns "Same element" and "Same modality" — it is still a valid, if trivial, comparison.' }
      ],
      references: [
        { label: 'Wikipedia, Astrological sign (elements, modalities, and polarity groupings)', url: 'https://en.wikipedia.org/wiki/Astrological_sign' },
        { label: 'Wikipedia, Astrological compatibility (overview, and the Helgertz & Scott 2020 Genus study citation)', url: 'https://en.wikipedia.org/wiki/Astrological_compatibility' },
        { label: 'Wikipedia, Astrology (scientific consensus on validity)', url: 'https://en.wikipedia.org/wiki/Astrology' }
      ]
    },
    inputs: [
      { id: 'signA', label: 'First sign', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: WESTERN_SIGNS.map((s, i) => ({ value: i, label: s.name })) },
      { id: 'signB', label: 'Second sign', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 0, options: WESTERN_SIGNS.map((s, i) => ({ value: i, label: s.name })) }
    ],
    seo: {
      title: 'Zodiac Compatibility Calculator – Element & Modality Match',
      description: 'Compare two Western zodiac signs by element and modality, the traditional astrology compatibility framework. For entertainment, not a scientific claim.',
      faq: [
        { question: 'Are Aries and Libra compatible?', answer: 'By the traditional element/modality framework: they don\'t share an element, but Fire and Air are both "positive" polarity, and both signs are Cardinal — a pairing astrologers often describe as complementary opposites, since Aries and Libra sit directly across the zodiac wheel from each other.' },
        { question: 'What does "same element" mean for compatibility?', answer: 'It means both signs are Fire, both Earth, both Air, or both Water — traditionally described as an instant, similar outlook, such as Leo and Sagittarius (both Fire).' },
        { question: 'What is zodiac "polarity"?', answer: 'A traditional grouping of the four elements into two pairs: Fire and Air as "positive" (active, outward), Earth and Water as "negative" (receptive, inward). Elements of the same polarity are considered complementary even when they differ.' },
        { question: 'Does sharing a modality mean two signs get along?', answer: 'Not necessarily "better" or "worse" — it means both signs approach life the same way (Cardinal signs initiate, Fixed signs sustain, Mutable signs adapt), which traditional astrology describes as either natural rapport or friction depending on the specific pairing.' },
        { question: 'Is zodiac compatibility scientifically real?', answer: 'No. Astrology has no demonstrated predictive validity in controlled studies, and a 2020 demographic study (Helgertz & Scott, Genus) tested astrological sun-sign pairings against real marriage and divorce records. This calculator is for entertainment.' },
        { question: 'Does this use a full birth chart?', answer: 'No — only the two sun signs\' element and modality, the simplified framework most popular astrology content uses. Professional astrological compatibility work typically also considers the moon sign, rising sign and planetary positions for each person.' }
      ]
    },
    compute(values) {
      const a = WESTERN_SIGNS[values.signA];
      const b = WESTERN_SIGNS[values.signB];
      if (!a || !b) return { elementRelationCode: NaN, modalityRelationCode: NaN };
      let elementRelationCode: number;
      if (a.element === b.element) elementRelationCode = 0;
      else if (ELEMENT_POLARITY[a.element] === ELEMENT_POLARITY[b.element]) elementRelationCode = 1;
      else elementRelationCode = 2;
      const modalityRelationCode = a.modality === b.modality ? 0 : 1;
      return { elementRelationCode, modalityRelationCode };
    }
  },
  {
    id: 'name-numerology-calculator',
    category: 'fun',
    glyph: '#',
    updatedAt: '2026-11-18',
    aliases: ['life path number calculator', 'numerology calculator by birthday', 'pythagorean numerology calculator', 'what is my life path number'],
    related: ['zodiac-sign-calculator', 'love-calculator', 'zodiac-compatibility-calculator', 'age-calculator'],
    title: 'Numerology Life Path Number Calculator',
    description: 'Find your Pythagorean-system Life Path number from your birth date, folklore/entertainment only — not a scientific claim about personality or fate.',
    example: 'Someone born August 12, 1990 has a Life Path number of 3.',
    breakdown: {
      headline: 'lifePathNumber',
      headlineLabel: 'Life Path number',
      outputs: [
        { id: 'lifePathNumber', label: 'Life Path number', format: 'integer' },
        { id: 'isMasterNumber', label: 'Is it a master number (11, 22 or 33)?', labels: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }] }
      ],
      groups: [{ title: 'Date of birth', inputs: ['birthMonth', 'birthDay', 'birthYear'] }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What a Life Path number is, in the Pythagorean numerology system',
        paragraphs: [
          'Numerology is a folklore practice that assigns symbolic meaning to numbers. In the Pythagorean system — the version most common in English-language numerology, which also underlies most "name numerology" letter-to-number tables — a person\'s "Life Path number" is calculated purely from their birth date, by repeatedly summing digits down to a single digit.',
          'The one exception is a "master number": 11, 22 or 33. If reducing a value lands exactly on one of those three numbers, numerology tradition stops there instead of reducing it further to a single digit, treating it as carrying its own separate meaning.',
          'This calculator reproduces that specific, documented method exactly. It makes no claim that a Life Path number predicts personality, compatibility or any real-world outcome — numerology has no scientific basis, and this page is for entertainment only.'
        ]
      },
      howTo: {
        intro: 'Enter your full date of birth.',
        steps: [
          { name: 'Enter your birth month, day and year', text: 'All three are reduced separately before being combined.' },
          { name: 'Read your Life Path number', text: 'A single digit from 1-9, or occasionally a master number: 11, 22 or 33.' },
          { name: 'Check for a master number', text: 'A quick yes/no for whether your final result stopped at 11, 22 or 33 instead of reducing to a single digit.' }
        ],
        outro: 'Everything is calculated in your browser using the method below. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each of the month, day and year is reduced separately first, then the three reduced values are summed and reduced again — never all the original digits summed at once.',
        expression:
          'reduce(n): while n > 9 and n not in {11, 22, 33}: n = sum of the digits of n\nlifePath = reduce( reduce(month) + reduce(day) + reduce(year) )',
        terms: [
          { symbol: 'reduce(n)', meaning: 'Repeatedly sum the digits of a number until it is a single digit (1-9) or a master number (11, 22, 33), at which point the reduction stops.' },
          { symbol: 'master number', meaning: '11, 22 or 33: a value numerology tradition keeps un-reduced rather than collapsing it to 2, 4 or 6.' }
        ],
        note: 'Reducing month, day and year separately before adding them is what the cited method specifies — adding every digit of the full date together in one pass can occasionally give a different final number.'
      },
      workedExample: {
        intro: 'What is the Life Path number for someone born August 12, 1990?',
        rows: [
          { label: 'Month (8)', value: 'Already a single digit: 8' },
          { label: 'Day (12)', value: '1 + 2 = 3' },
          { label: 'Year (1990)', value: '1 + 9 + 9 + 0 = 19, then 1 + 9 = 10, then 1 + 0 = 1' },
          { label: 'Sum of the three reduced values', value: '8 + 3 + 1 = 12' },
          { label: 'Final reduction', value: '1 + 2 = 3' }
        ],
        result: 'Life Path number 3',
        explanation: 'Month and day reduce to 8 and 3 directly; the year 1990 takes two extra reduction passes (19 -> 10 -> 1) before it is a single digit. Adding 8 + 3 + 1 gives 12, which reduces once more to 3 — no master number appears at any step in this particular example.'
      },
      watchOut: [
        { title: 'Numerology is not scientific', body: 'There is no evidence that a Life Path number predicts personality, relationships or life events. This calculator reproduces a documented folklore method for entertainment, not a factual assessment.' },
        { title: 'Master numbers can appear and then disappear', body: 'A component (month, day or year) can reduce to a master number like 22, but the FINAL combined total can still reduce past 11/22/33 to an ordinary single digit if the sum of the components itself isn\'t one of those three numbers — master-number status at one step does not guarantee it at the end.' },
        { title: 'This is the birth-date Life Path number only', body: 'Numerology also has a separate letter-based "Expression" or "Destiny" number calculated from the letters of your full name using a Pythagorean letter-to-number table. That is a distinct calculation this page does not perform.' },
        { title: 'Reduce each part separately, not the whole date at once', body: 'Summing every digit of, say, 8/12/1990 as one long string (8+1+2+1+9+9+0) is a common shortcut but is not the method described in the cited source, which reduces month, day and year independently first.' }
      ],
      references: [
        { label: 'World Numerology, Life Path Number (birth-date reduction method and master-number rule)', url: 'https://www.worldnumerology.com/numerology-life-path.html' },
        { label: 'Wikipedia, Numerology (Pythagorean system overview and scientific status)', url: 'https://en.wikipedia.org/wiki/Numerology' }
      ]
    },
    inputs: [
      { id: 'birthMonth', label: 'Birth month (1-12)', type: 'number', placeholder: '8', defaultValue: 8, step: 1, min: 1 },
      { id: 'birthDay', label: 'Birth day (1-31)', type: 'number', placeholder: '12', defaultValue: 12, step: 1, min: 1 },
      { id: 'birthYear', label: 'Birth year', type: 'number', placeholder: '1990', defaultValue: 1990, step: 1, min: 1 }
    ],
    seo: {
      title: 'Numerology Life Path Number Calculator',
      description: 'Find your Pythagorean-system Life Path number from your birth date. Folklore/entertainment only, not a scientific claim.',
      faq: [
        { question: 'What is the Life Path number for August 12, 1990?', answer: '3. Month (8) and day (1+2=3) are already low; year 1990 reduces to 1 (1+9+9+0=19, then 1+9=10, then 1+0=1). Adding 8+3+1=12, then 1+2=3.' },
        { question: 'How is a Life Path number calculated?', answer: 'The Pythagorean method reduces the birth month, day and year separately — by repeatedly summing digits until reaching a single digit or a master number (11, 22, 33) — then adds those three results together and reduces that total the same way.' },
        { question: 'What are numerology master numbers?', answer: '11, 22 and 33. If reducing a value lands exactly on one of these, numerology tradition stops there instead of reducing it further (so 22 is kept as 22, not collapsed to 4).' },
        { question: 'Can my Life Path number be a master number?', answer: 'Yes, if the final sum of the three reduced components is exactly 11, 22 or 33, the calculator reports that instead of reducing it to a single digit.' },
        { question: 'Is this the same as name numerology?', answer: 'No. This calculator computes the birth-date-only Life Path number. A separate "Expression" or "Destiny" number is calculated from the letters of a full name using a different Pythagorean letter-to-number table, which this page does not cover.' },
        { question: 'Is numerology scientifically valid?', answer: 'No. There is no scientific evidence that numerology predicts personality or life outcomes. This calculator is for entertainment, reproducing a documented folklore method exactly.' }
      ]
    },
    compute(values) {
      const rMonth = reduceNumerology(values.birthMonth);
      const rDay = reduceNumerology(values.birthDay);
      const rYear = reduceNumerology(values.birthYear);
      const lifePathNumber = reduceNumerology(rMonth + rDay + rYear);
      const isMasterNumber = lifePathNumber === 11 || lifePathNumber === 22 || lifePathNumber === 33 ? 1 : 0;
      return { lifePathNumber, isMasterNumber };
    }
  },
  // Custom-component stub: rendered by components/FlamesCalculator.tsx (see app/[locale]/calculators/[slug]/page.tsx).
  {
    id: 'love-calculator',
    category: 'fun',
    glyph: '♥',
    updatedAt: '2026-11-18',
    aliases: ['flames game calculator', 'name love compatibility calculator', 'love percentage by name', 'crush compatibility calculator'],
    related: ['zodiac-compatibility-calculator', 'name-numerology-calculator', 'zodiac-sign-calculator'],
    title: 'Love Calculator (FLAMES)',
    description: 'A classic two-name FLAMES relationship game: cancel the letters two names share, then count through F-L-A-M-E-S. Entertainment only, not a real compatibility measure.',
    example: 'JORDAN and TAYLOR share no letters when cancelled one-for-one down to the 6 that remain, counting through F-L-A-M-E-S lands on "M" — Marriage.',
    inputs: [],
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What FLAMES is',
        paragraphs: [
          'FLAMES is a pencil-and-paper counting game, popular among school-age children, that turns two names into one of six playful relationship labels: Friends, Lovers, Affectionate, Marriage, Enemies or Siblings. It has no connection to real relationship outcomes — it is a counting trick, mathematically related to the classic "Josephus problem" of counting around a circle and eliminating entries.',
          'The game has two steps. First, every letter two names have in common is cancelled out one-for-one (so if one name has two "A"s and the other has one, only one pair cancels, leaving one "A" behind). Whatever letters are left after cancellation are counted — call that count n. Second, the six letters F, L, A, M, E, S are written in a circle, and starting from F, every nth letter is crossed out and skipped, continuing around the shrinking circle until only one letter survives. That surviving letter is the result.',
          'This calculator runs exactly that counting game on whatever two names you type. It is entertainment, not a real measure of compatibility — the two names are just letters being counted.'
        ]
      },
      howTo: {
        intro: 'Type two names.',
        steps: [
          { name: 'Enter the first name', text: 'Any name or nickname — letters only are counted; spaces and punctuation are ignored.' },
          { name: 'Enter the second name', text: 'The name to compare it against.' },
          { name: 'See the letters cancel', text: 'Letters shared between the two names are crossed out one-for-one.' },
          { name: 'Read the result', text: 'The count of letters left over is used to count through F-L-A-M-E-S until one letter survives — that is the result.' }
        ],
        outro: 'Everything runs in your browser as you type. Nothing you enter is sent or stored.'
      },
      formula: {
        intro: 'A letter-cancellation count, followed by a Josephus-style counting-out elimination through 6 letters.',
        expression:
          'n = sum over every letter of |count in name A - count in name B|\nStarting at F, repeatedly count n letters around the remaining circle and eliminate the nth one, until 1 remains\nF = Friends, L = Lovers, A = Affectionate, M = Marriage, E = Enemies, S = Siblings',
        terms: [
          { symbol: 'n', meaning: 'The number of letters left after cancelling every letter the two names share, one occurrence at a time.' },
          { symbol: 'counting-out elimination', meaning: 'The same method as the Josephus problem: arrange F, L, A, M, E, S in a circle, count n places and remove that letter, then keep counting and removing from where you left off until one letter is left.' }
        ],
        note: 'If the two names use exactly the same letters the same number of times, n is 0 and there is nothing left to count — the game has no result for that pair.'
      },
      workedExample: {
        intro: 'Run FLAMES on JORDAN and TAYLOR.',
        rows: [
          { label: 'JORDAN letters', value: 'J, O, R, D, A, N' },
          { label: 'TAYLOR letters', value: 'T, A, Y, L, O, R' },
          { label: 'Shared letters cancelled one-for-one', value: 'A and O and R cancel (one pair each)' },
          { label: 'Letters left (n)', value: '6 — J, R, D, N from JORDAN and T, Y, L from TAYLOR, minus the extra R already cancelled: J, D, N, T, Y, L' },
          { label: 'Counting through F-L-A-M-E-S by 6, repeatedly', value: 'Eliminates S, then F, then A, then L, then E' }
        ],
        result: 'M — Marriage',
        explanation: 'After cancelling the shared A, O and R, 6 letters remain. Counting by 6 around the F-L-A-M-E-S circle five times in a row eliminates every letter except M.'
      },
      watchOut: [
        { title: 'This is a game, not a measurement', body: 'FLAMES has no connection to real relationships. Wikipedia\'s own description notes it "does not accurately predict the true relationship between any two persons" — it is entertainment, the same as a fortune-telling game.' },
        { title: 'Identical letter sets give no result', body: 'If both names use exactly the same letters the same number of times (including a name compared with itself), nothing is left to count and the game cannot produce an outcome.' },
        { title: 'Only letters are counted', body: 'Spaces, hyphens, apostrophes and numbers in a typed name are ignored; only A-Z letters (case-insensitive) count toward cancellation.' },
        { title: 'Variants of this game exist', body: 'Some versions cross out letters only when they appear in the same position in both names, or treat a tie differently. This calculator uses the frequency-based cancellation and circular counting-out elimination described on Wikipedia, cited in the references.' }
      ],
      references: [
        { label: 'Wikipedia, FLAMES (game) (cancellation rule, counting-out elimination, and the six outcomes)', url: 'https://en.wikipedia.org/wiki/FLAMES_(game)' }
      ]
    },
    seo: {
      title: 'Love Calculator (FLAMES) – Two-Name Compatibility Game',
      description: 'Play the classic FLAMES name game: cancel shared letters between two names, then count through Friends/Lovers/Affectionate/Marriage/Enemies/Siblings. Entertainment only.',
      faq: [
        { question: 'What does FLAMES stand for?', answer: 'Friends, Lovers, Affectionate, Marriage, Enemies, Siblings — the six possible outcomes of the game.' },
        { question: 'How do you calculate FLAMES by hand?', answer: 'Cross out every letter the two names share, one occurrence at a time. Count however many letters are left, then use that count to count around F-L-A-M-E-S, removing every nth letter, until only one letter remains.' },
        { question: 'What happens if both names have exactly the same letters?', answer: 'Every letter cancels and there is nothing left to count, so the game has no result for that particular pair — try full names or add a middle name.' },
        { question: 'Is FLAMES a real compatibility test?', answer: 'No. It is a traditional pencil-and-paper counting game related to the Josephus problem, not a measure of real relationships. It is included here for entertainment only.' },
        { question: 'Does capitalization or spacing matter?', answer: 'No — only the letters A through Z are counted, treated case-insensitively. Spaces, punctuation and numbers are ignored.' },
        { question: 'Can I run FLAMES on my own name against a friend\'s name?', answer: 'Yes, any two names work, including comparing a name against itself (though two identical names will usually cancel out completely and give no result).' }
      ]
    },
    compute() { return {}; }
  },
  {
    id: 'dice-probability-calculator',
    category: 'fun',
    glyph: 'd6',
    updatedAt: '2026-11-18',
    aliases: ['dice roll probability calculator', 'probability of rolling a sum calculator', 'two dice sum probability', 'chance of rolling a number with dice'],
    related: ['probability-calculator', 'combination-calculator', 'coin-flip-probability-calculator', 'card-draw-probability-calculator'],
    title: 'Dice Probability Calculator',
    description: 'Find the exact probability of rolling a target sum (or a range of sums) with any number of dice and any number of sides, using the real combinatorics of a dice sum, not a shortcut.',
    example: 'Rolling two standard six-sided dice, the probability the sum is exactly 7 is 6/36, about 16.67% -- the most common single sum two dice can make.',
    breakdown: {
      headline: 'probabilityPercent',
      headlineLabel: 'Probability',
      outputs: [
        { id: 'probabilityPercent', label: 'Probability', format: 'percent' },
        { id: 'oddsOneIn', label: 'Odds (1 in)', format: 'significant' },
        { id: 'expectedSum', label: 'Expected (average) sum', format: 'number' },
        { id: 'minSum', label: 'Lowest possible sum', format: 'integer' },
        { id: 'maxSum', label: 'Highest possible sum', format: 'integer' }
      ],
      groups: [
        { title: 'Dice', inputs: ['numDice', 'numSides'] },
        { title: 'Target', inputs: ['comparisonCode', 'targetLow', 'targetHigh'] }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why dice sums are not evenly likely',
        paragraphs: [
          'A single fair die lands on each of its faces with equal probability, but the sum of two or more dice is not evenly distributed. With two six-sided dice, for example, there is only one way to roll a 2 (1+1) but six different ways to roll a 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1), so a 7 is six times more likely than a 2. This calculator counts those ways exactly for any number of dice and any number of sides, rather than assuming every total is equally likely.',
          'The exact count comes from a combinatorial identity: the number of ways `n` dice with `s` sides can sum to a target `p` is the coefficient of x^p in the expansion of (x + x^2 + ... + x^s)^n, which works out to a finite inclusion-exclusion sum (see the formula below). This calculator applies the same idea by convolving one die\'s distribution with itself `n` times, which produces the identical exact probabilities without needing the summation formula\'s cancelling terms spelled out by hand.',
          'You can ask for an exact sum, a sum at or above a value, a sum at or below a value, or a sum in a between range -- all computed from the same underlying distribution.'
        ]
      },
      howTo: {
        intro: 'Enter the dice, then the target.',
        steps: [
          { name: 'Enter the number of dice', text: 'How many dice are rolled together, from 1 to 20.' },
          { name: 'Enter the number of sides per die', text: 'All dice are assumed identical, from 2 to 100 sides.' },
          { name: 'Choose a comparison', text: 'Exactly this sum, at least, at most, or between two sums.' },
          { name: 'Enter the target sum (and a second one for "between")', text: 'The sum (or range of sums) you want the probability of.' },
          { name: 'Read the probability and odds', text: 'The headline is the exact probability; "odds (1 in)" is the same figure written the way odds are usually quoted.' }
        ],
        outro: 'Everything is calculated in your browser by building the real sum distribution. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The exact number of ways to roll a sum p with n dice of s sides each (MathWorld\'s closed form), from which the probability follows by dividing by the total number of equally likely outcomes, s^n.',
        expression:
          'ways(p, n, s) = sum over k = 0 to floor((p-n)/s) of (-1)^k * C(n, k) * C(p - sk - 1, n - 1)\nP(sum = p) = ways(p, n, s) / s^n\nThis calculator computes the identical distribution by convolving one die\'s uniform distribution with itself n times, rather than evaluating the alternating sum term by term.',
        terms: [
          { symbol: 'n', meaning: 'Number of dice.' },
          { symbol: 's', meaning: 'Number of sides on each die.' },
          { symbol: 'p', meaning: 'The target sum, valid from n (all 1s) to n*s (all maximum faces).' },
          { symbol: 'C(a, b)', meaning: 'The combinations ("n choose r") function; by convention it is 0 whenever b is negative or greater than a.' }
        ],
        note: 'A sum outside the possible range [n, n*s] has probability exactly 0, not an error -- for example, you cannot roll a 1 with two dice.'
      },
      workedExample: {
        intro: 'What is the probability that two standard six-sided dice sum to exactly 7?',
        rows: [
          { label: 'Dice', value: '2 dice, 6 sides each' },
          { label: 'Total equally likely outcomes', value: '6^2 = 36' },
          { label: 'Ways to make 7', value: '1+6, 2+5, 3+4, 4+3, 5+2, 6+1 = 6 ways' },
          { label: 'Probability', value: '6 / 36' }
        ],
        result: 'About 16.67% (6/36), or odds of 1 in 6',
        explanation: '7 is the single most likely sum with two six-sided dice precisely because more pairs of faces add up to it than to any other total -- the same reason the sums near the middle of the possible range are always more common than the sums at the extremes.'
      },
      watchOut: [
        { title: 'This assumes fair, independent dice', body: 'Every face of every die is assumed equally likely and the dice do not influence each other, the standard assumption for ordinary dice -- a loaded die or a physically unusual one would not follow this distribution.' },
        { title: 'Extreme sums are always the rarest', body: 'The lowest possible sum (all dice showing 1) and the highest possible sum (all dice showing the maximum face) each have only one way to happen, no matter how many dice you use, while sums near the middle of the range have many more combinations and are far more likely.' },
        { title: '"Between" uses whichever order you type the two sums', body: 'If the second target sum is smaller than the first, this calculator still treats them as a low/high pair rather than returning no answer.' },
        { title: 'This calculator is capped at 20 dice and 100 sides', body: 'Both are generous beyond any dice actually sold, and keep the underlying distribution calculation fast.' }
      ],
      references: [
        { label: 'Wolfram MathWorld, Dice (exact combinatorial formula for a dice-sum count)', url: 'https://mathworld.wolfram.com/Dice.html' }
      ]
    },
    inputs: [
      { id: 'numDice', label: 'Number of dice', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 },
      { id: 'numSides', label: 'Sides per die', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 2 },
      {
        id: 'comparisonCode',
        label: 'Comparison',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Exactly this sum' },
          { value: 1, label: 'At least this sum' },
          { value: 2, label: 'At most this sum' },
          { value: 3, label: 'Between two sums' }
        ]
      },
      { id: 'targetLow', label: 'Target sum', type: 'number', placeholder: '7', defaultValue: 7, step: 1, min: 0 },
      { id: 'targetHigh', label: 'Upper sum (for "between" only)', type: 'number', placeholder: '9', defaultValue: 9, step: 1, min: 0 }
    ],
    seo: {
      title: 'Dice Probability Calculator – Exact Sum Odds',
      description: 'Find the exact probability of rolling a target sum, or a sum in a range, with any number of dice and sides, from the real dice-sum combinatorics.',
      faq: [
        { question: 'What is the probability of rolling a 7 with two dice?', answer: 'About 16.67% (6/36, or odds of 1 in 6) -- there are 6 ways to make 7 from two six-sided dice (1+6, 2+5, 3+4, 4+3, 5+2, 6+1), more than any other sum.' },
        { question: 'What is the probability of rolling a sum of 10 or higher with two dice?', answer: 'Also 16.67% (6/36) -- the sums 10, 11 and 12 can be made in 3, 2 and 1 ways respectively, which also total 6 out of 36 outcomes.' },
        { question: 'Why is 7 the most common sum with two six-sided dice?', answer: 'Because more pairs of faces add up to 7 (six pairs) than to any other total between 2 and 12 -- sums near the middle of the possible range always have the most combinations.' },
        { question: 'What is the lowest and highest possible sum?', answer: 'The lowest is the number of dice (every die showing 1); the highest is the number of dice times the number of sides (every die showing its maximum face). Each has only one way to happen.' },
        { question: 'Does this work for dice with more than 6 sides?', answer: 'Yes -- enter any number of sides from 2 to 100 and any number of dice from 1 to 20, and the calculator rebuilds the exact sum distribution for that combination.' },
        { question: 'How is this different from the probability calculator?', answer: 'The probability calculator combines the probabilities of two separate named events (like "passing math" and "passing science"). This calculator is specific to dice sums, counting the real combinatorics of how many dice-face combinations produce each total.' }
      ]
    },
    compute(values) {
      const dice = Math.round(values.numDice);
      const sides = Math.round(values.numSides);
      const mode = Math.round(values.comparisonCode);
      const noAnswer = { probabilityPercent: NaN, oddsOneIn: NaN, expectedSum: NaN, minSum: NaN, maxSum: NaN };
      if (!Number.isFinite(dice) || !Number.isFinite(sides) || dice < 1 || dice > 20 || sides < 2 || sides > 100) return noAnswer;
      const dist = diceSumDistribution(dice, sides);
      const minSum = dice;
      const maxSum = dice * sides;
      let low = Math.round(values.targetLow);
      let high = Math.round(values.targetHigh);
      if (mode === 0) high = low;
      else if (mode === 1) high = maxSum;
      else if (mode === 2) { high = low; low = minSum; }
      else { const a = Math.min(low, high), b = Math.max(low, high); low = a; high = b; }
      let probability = 0;
      for (let sum = Math.max(low, minSum); sum <= Math.min(high, maxSum); sum++) probability += dist[sum - minSum];
      const expectedSum = (dice * (sides + 1)) / 2;
      return {
        probabilityPercent: probability * 100,
        oddsOneIn: probability > 0 ? 1 / probability : NaN,
        expectedSum,
        minSum,
        maxSum
      };
    }
  },
  {
    id: 'coin-flip-probability-calculator',
    category: 'fun',
    glyph: 'H/T',
    updatedAt: '2026-11-18',
    aliases: ['coin toss probability calculator', 'probability of heads in a row', 'binomial coin flip calculator', 'probability of exact number of heads'],
    related: ['probability-calculator', 'dice-probability-calculator', 'birthday-paradox-calculator', 'card-draw-probability-calculator'],
    title: 'Coin Flip Probability Calculator',
    description: 'Find the probability of getting an exact (or at-least/at-most) number of heads across any number of coin flips, using the exact binomial formula, plus the separate chance of a specific run of heads in a row.',
    example: 'Flipping a fair coin 10 times, the probability of exactly 6 heads is about 20.51%, and the probability of flipping 5 heads in a row is 1/32, about 3.13%.',
    breakdown: {
      headline: 'probabilityPercent',
      headlineLabel: 'Probability',
      outputs: [
        { id: 'probabilityPercent', label: 'Probability', format: 'percent' },
        { id: 'oddsOneIn', label: 'Odds (1 in)', format: 'significant' },
        { id: 'meanHeads', label: 'Expected (average) heads', format: 'number' },
        { id: 'stdDevHeads', label: 'Standard deviation', format: 'number' },
        { id: 'streakProbabilityPercent', label: 'Separate: probability of a streak', format: 'percent' }
      ],
      groups: [
        { title: 'Flips', inputs: ['numFlips', 'headsProbabilityPercent'] },
        { title: 'Target heads count', inputs: ['comparisonCode', 'targetLow', 'targetHigh'] },
        { title: 'Separate streak check', inputs: ['streakLength'] }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'The binomial distribution, applied to coin flips',
        paragraphs: [
          'Each coin flip is an independent trial with two outcomes, so the number of heads across many flips follows a binomial distribution: the same distribution that describes any fixed number of independent yes/no trials with the same success chance each time. This calculator finds the probability of landing on an exact number of heads, or a number of heads in a range, out of any number of flips -- not just for a fair 50/50 coin, but for any fixed per-flip probability you enter.',
          'It also answers a related but different question: the probability that the very next several flips are all heads in a row. That is a much simpler calculation (just multiply the per-flip probability by itself), and it is worth keeping separate from the main binomial answer because the two are easy to confuse. "6 heads out of 10 flips, in any order" and "6 heads in a row" are very different events with very different probabilities.',
          'A streak probability is also the basis of the gambler\'s fallacy: after flipping heads several times in a row, the next flip is still exactly as likely to be heads as it was on the first flip, because each flip is independent of the ones before it. A long streak is unlikely to start, but once you are partway through one, finishing it is no harder than any other single flip.'
        ]
      },
      howTo: {
        intro: 'Enter the flips and the target, then optionally check a streak separately.',
        steps: [
          { name: 'Enter the number of flips', text: 'How many times the coin is flipped in total.' },
          { name: 'Enter the per-flip heads probability', text: 'Leave at 50% for a fair coin, or change it for a biased one.' },
          { name: 'Choose a comparison and target heads count', text: 'Exactly this many heads, at least, at most, or between two counts.' },
          { name: 'Read the probability and odds', text: 'The headline is the exact binomial probability for your chosen comparison.' },
          { name: 'Optionally check a streak', text: 'The separate "probability of a streak" row answers a different question: the chance the next streak-length flips are all heads, independent of the main target above.' }
        ],
        outro: 'Everything is calculated in your browser with the exact binomial formula. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The exact probability of k heads in n flips (the binomial probability mass function), and the separate, simpler formula for a run of the same result in a row.',
        expression:
          'P(X = k) = C(n, k) * p^k * (1-p)^(n-k)\nP(X >= k) = sum from j=k to n of P(X = j); P(X <= k) = sum from j=0 to k of P(X = j)\nP(streak of m heads in a row) = p^m',
        terms: [
          { symbol: 'n', meaning: 'Number of flips.' },
          { symbol: 'p', meaning: 'Probability of heads on a single flip (0.5 for a fair coin).' },
          { symbol: 'k', meaning: 'The target number of heads.' },
          { symbol: 'C(n, k)', meaning: 'The number of ways to choose which k of the n flips are heads, "n choose k."' },
          { symbol: 'm', meaning: 'Streak length: how many flips in a row, for the separate streak check.' }
        ],
        note: 'This calculator computes P(X=k) with a stable ratio recurrence rather than evaluating n! directly, so it stays accurate for large numbers of flips.'
      },
      workedExample: {
        intro: 'Flip a fair coin 10 times. What is the probability of exactly 6 heads, and separately, of flipping 5 heads in a row?',
        rows: [
          { label: 'Ways to choose which 6 of 10 flips are heads', value: 'C(10, 6) = 210' },
          { label: 'Probability of any one specific sequence with 6 heads and 4 tails', value: '0.5^10 = 1/1024' },
          { label: 'P(exactly 6 heads)', value: '210 / 1024' },
          { label: 'Separately: P(5 heads in a row)', value: '0.5^5 = 1/32' }
        ],
        result: 'P(exactly 6 heads) ≈ 20.51%; P(5 heads in a row) ≈ 3.13%',
        explanation: 'The two answers are not related by a simple ratio -- "6 heads somewhere in 10 flips" can happen in 210 different orders, while "5 heads in a row" describes one specific, much more restrictive pattern.'
      },
      watchOut: [
        { title: 'Flips are assumed independent', body: 'Each flip is assumed to have no effect on any other, the standard assumption for an ordinary coin -- this is also what makes the gambler\'s fallacy a fallacy: a past streak does not change the next flip\'s probability.' },
        { title: 'Exact count vs. streak are different questions', body: 'This calculator answers both, but keeps them in separate rows because "k heads out of n flips in any order" and "k heads in a row" have very different probabilities for the same k.' },
        { title: 'Unfair coins are supported', body: 'The per-flip heads probability defaults to 50% but can be changed; every formula above still applies exactly, just with p not equal to 0.5.' },
        { title: 'This calculator is capped at 100,000 flips', body: 'Comfortably beyond any real coin-flipping session, and far enough that the probability for an exact extreme count underflows to a number too small to be meaningfully different from zero.' }
      ],
      references: [
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §1.3.6.6.18 Binomial Distribution', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda366i.htm' }
      ]
    },
    inputs: [
      { id: 'numFlips', label: 'Number of flips', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 },
      { id: 'headsProbabilityPercent', label: 'Heads probability per flip', type: 'percent', placeholder: '50', defaultValue: 50, step: 1, min: 0 },
      {
        id: 'comparisonCode',
        label: 'Comparison',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Exactly this many heads' },
          { value: 1, label: 'At least this many heads' },
          { value: 2, label: 'At most this many heads' },
          { value: 3, label: 'Between two counts' }
        ]
      },
      { id: 'targetLow', label: 'Target heads count', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 0 },
      { id: 'targetHigh', label: 'Upper heads count (for "between" only)', type: 'number', placeholder: '8', defaultValue: 8, step: 1, min: 0 },
      { id: 'streakLength', label: 'Streak length (heads in a row)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 }
    ],
    seo: {
      title: 'Coin Flip Probability Calculator – Exact Heads Count',
      description: 'Find the exact probability of an exact, at-least or at-most heads count in N coin flips (binomial), plus the separate odds of a heads-in-a-row streak.',
      faq: [
        { question: 'What is the probability of flipping exactly 6 heads in 10 tries?', answer: 'About 20.51% -- there are C(10,6) = 210 ways to choose which 6 of the 10 flips are heads, each with probability 0.5^10 = 1/1024, giving 210/1024.' },
        { question: 'What is the probability of flipping 5 heads in a row?', answer: '1/32, about 3.13% -- each flip independently has a 50% chance of heads, so 5 in a row is 0.5^5.' },
        { question: 'After flipping heads several times in a row, is tails "due"?', answer: 'No -- this is the gambler\'s fallacy. Coin flips are independent, so the next flip is still exactly 50/50 (for a fair coin) no matter what came before it.' },
        { question: 'Can this calculator handle an unfair coin?', answer: 'Yes -- change the "heads probability per flip" field away from 50%, and every result (exact count, at-least/at-most, and the streak probability) uses that value instead.' },
        { question: 'What is the difference between "exactly 6 heads" and "6 heads in a row"?', answer: 'They are very different events. "Exactly 6 heads" counts every order those 6 heads and 4 tails could appear in (210 orders out of 1024 possible sequences). "6 heads in a row" is one specific, far more restrictive pattern, with probability 0.5^6, about 1.56%.' },
        { question: 'What is the expected number of heads in 10 flips?', answer: '5 -- the expected (mean) count is always n times p, here 10 x 0.5. The standard deviation is the square root of n x p x (1-p), here about 1.58.' }
      ]
    },
    compute(values) {
      const n = Math.round(values.numFlips);
      const p = Math.min(100, Math.max(0, values.headsProbabilityPercent)) / 100;
      const mode = Math.round(values.comparisonCode);
      const streak = Math.round(values.streakLength);
      const noAnswer = { probabilityPercent: NaN, oddsOneIn: NaN, meanHeads: NaN, stdDevHeads: NaN, streakProbabilityPercent: NaN };
      if (!Number.isFinite(n) || n < 1 || n > 100000) return noAnswer;
      let low = Math.round(values.targetLow);
      let high = Math.round(values.targetHigh);
      if (mode === 0) high = low;
      else if (mode === 1) high = n;
      else if (mode === 2) { high = low; low = 0; }
      else { const a = Math.min(low, high), b = Math.max(low, high); low = a; high = b; }
      const probability = binomialRangeProbability(n, p, low, high);
      const streakProbability = streak >= 0 ? Math.pow(p, streak) : NaN;
      return {
        probabilityPercent: probability * 100,
        oddsOneIn: probability > 0 ? 1 / probability : NaN,
        meanHeads: n * p,
        stdDevHeads: Math.sqrt(n * p * (1 - p)),
        streakProbabilityPercent: streakProbability * 100
      };
    }
  },
  {
    id: 'birthday-paradox-calculator',
    category: 'fun',
    glyph: 'BP',
    updatedAt: '2026-11-18',
    aliases: ['birthday problem calculator', 'shared birthday probability calculator', 'chance two people share a birthday', 'same birthday odds calculator'],
    related: ['probability-calculator', 'coin-flip-probability-calculator', 'dice-probability-calculator', 'age-calculator'],
    title: 'Birthday Paradox Calculator',
    description: 'Find the real probability that at least two people in a group share a birthday, using the exact complement-probability formula -- not the common but wrong intuition that it takes close to 365 people.',
    example: 'In a group of just 23 people, the probability that at least two share a birthday is already over 50% -- higher than most people guess.',
    breakdown: {
      headline: 'sharedPercent',
      headlineLabel: 'P(at least two share a birthday)',
      outputs: [
        { id: 'sharedPercent', label: 'P(at least two share a birthday)', format: 'percent' },
        { id: 'noSharePercent', label: 'P(everyone has a different birthday)', format: 'percent' },
        { id: 'minPeopleFor50Percent', label: 'Smallest group that passes 50% (computed)', format: 'integer' },
        { id: 'minPeopleFor99Percent', label: 'Smallest group that passes 99% (computed)', format: 'integer' }
      ],
      groups: [{ title: 'Group size', inputs: ['numPeople'] }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why the birthday paradox feels wrong but is not',
        paragraphs: [
          'The "birthday paradox" (more precisely, the birthday problem) is not a logical paradox at all -- it is just a result that strongly conflicts with most people\'s intuition. The common guess is that you need a group close to 365 people before a shared birthday becomes likely, by analogy with the 1-in-365 chance that any two specific people share a birthday. That intuition answers a different, much narrower question.',
          'The real question is not whether two particular people match, but whether any pair among everyone in the room matches. A group of just 23 people contains 253 different pairs (23 choose 2), and it only takes one of those 253 pairs to match for the group to have "a shared birthday." That is why the real crossover point is so much smaller than 365: there are far more chances for a match than the simple 1-in-365 intuition accounts for.',
          'This calculator computes the exact probability using the complement: it is far easier to compute the probability that every birthday is different, then subtract that from 1, than to count every possible way a match could occur directly.'
        ]
      },
      howTo: {
        intro: 'Enter the number of people in the group.',
        steps: [
          { name: 'Enter the group size', text: 'How many people are in the room, from 2 up.' },
          { name: 'Read the probability', text: 'The headline is the chance at least two of them share a birthday (same month and day, any year).' },
          { name: 'Check the computed crossover sizes', text: 'The two extra rows show the smallest group size at which the real formula first passes 50% and 99%, computed directly rather than quoted from memory.' }
        ],
        outro: 'Everything is calculated in your browser using the exact formula below. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The complement formula: find the probability every birthday is different, then subtract from 1.',
        expression:
          'P(no shared birthday) = (365/365) x (364/365) x (363/365) x ... x ((365-n+1)/365)\nP(at least one shared birthday) = 1 - P(no shared birthday)',
        terms: [
          { symbol: 'n', meaning: 'Number of people in the group.' },
          { symbol: '365', meaning: 'Assumed number of equally likely birthdays -- see "Watch out" for what this leaves out.' }
        ],
        note: 'Each additional person after the first multiplies the "still all different" probability by one fewer day out of 365, because they must avoid every birthday already taken.'
      },
      workedExample: {
        intro: 'What is the probability that at least two people share a birthday in a group of 23?',
        rows: [
          { label: 'P(2nd person differs from 1st)', value: '364/365' },
          { label: 'P(3rd person differs from both)', value: '363/365' },
          { label: '... continuing down to the 23rd person', value: '343/365' },
          { label: 'P(all 23 birthdays different)', value: 'Product of all 22 fractions above, about 0.4927' },
          { label: 'P(at least two share a birthday)', value: '1 - 0.4927' }
        ],
        result: 'About 50.73%',
        explanation: '23 people contain 253 distinct pairs who could potentially match, which is enough chances for a match that the probability of at least one tips just past 50%, even though any two specific people still only have a 1-in-365 chance of matching each other.'
      },
      watchOut: [
        { title: 'Assumes 365 equally likely, independent birthdays', body: 'This calculator ignores leap years (February 29), and real birthdays are not perfectly evenly spread across the calendar (some months have measurably more births than others) -- both effects are small and tend to make a shared birthday very slightly more likely than this idealized formula, not less.' },
        { title: 'This is about any two people, not a specific person', body: 'The probability that at least two people in the group share a birthday is much higher than the probability that someone else shares your specific birthday -- those are different questions with very different answers.' },
        { title: 'The computed crossover numbers use fixed thresholds', body: 'The "50%" and "99%" rows always use those two thresholds, not your entered group size -- they are shown for comparison, not as a function of the number you typed above.' },
        { title: 'Twins and selection bias are not modeled', body: 'A group that deliberately includes twins, or was selected in a way connected to birthdays, would not follow this formula\'s independence assumption.' }
      ],
      references: [
        { label: 'Wikipedia, Birthday problem (complement formula and real-world caveats)', url: 'https://en.wikipedia.org/wiki/Birthday_problem' }
      ]
    },
    inputs: [{ id: 'numPeople', label: 'Number of people', type: 'number', placeholder: '23', defaultValue: 23, step: 1, min: 2 }],
    seo: {
      title: 'Birthday Paradox Calculator – Shared Birthday Odds',
      description: 'Find the real probability that two people in a group share a birthday, using the exact complement formula. Just 23 people already passes a 50% chance.',
      faq: [
        { question: 'How many people are needed for a 50% chance two share a birthday?', answer: '23 -- the probability at that group size is about 50.73%, computed from the exact complement formula.' },
        { question: 'Why does the birthday paradox feel wrong?', answer: 'Because it is easy to mistake "the chance any two specific people match" (1 in 365) for "the chance any pair among everyone in the room matches." A group of 23 contains 253 different pairs, which is enough chances for the real probability to pass 50%.' },
        { question: 'What is the probability in a group of 50 people?', answer: 'About 97.04% -- by 50 people, a shared birthday is close to certain.' },
        { question: 'How many people are needed to be 99% certain of a shared birthday?', answer: '57 people, computed directly from the same formula rather than quoted from memory.' },
        { question: 'Does this account for leap years?', answer: 'No -- it assumes exactly 365 equally likely birthdays. Leap years and the real, slightly uneven distribution of birthdays across the calendar are both small effects that this idealized formula leaves out.' },
        { question: 'Is this the same as the chance someone shares MY birthday?', answer: 'No -- that is a much narrower question (would need close to 253 other people for a 50% chance against one specific date). This calculator answers the "any pair in the group" question, which needs far fewer people.' }
      ]
    },
    compute(values) {
      const n = Math.round(values.numPeople);
      if (!Number.isFinite(n) || n < 2 || n > 100000) return { sharedPercent: NaN, noSharePercent: NaN, minPeopleFor50Percent: NaN, minPeopleFor99Percent: NaN };
      const noShare = noSharedBirthdayProbability(n);
      return {
        sharedPercent: (1 - noShare) * 100,
        noSharePercent: noShare * 100,
        minPeopleFor50Percent: MIN_PEOPLE_FOR_50_PERCENT,
        minPeopleFor99Percent: MIN_PEOPLE_FOR_99_PERCENT
      };
    }
  },
  {
    id: 'lottery-odds-calculator',
    category: 'fun',
    glyph: 'nCk',
    updatedAt: '2026-11-18',
    aliases: ['lottery odds calculator', 'probability of winning the lottery', 'pick 6 lottery odds', 'lottery combinations calculator'],
    related: ['combination-calculator', 'card-draw-probability-calculator', 'probability-calculator', 'dice-probability-calculator'],
    title: 'Lottery Odds Calculator',
    description: 'Find the exact odds of matching some or all of your numbers in any pick-k-from-n lottery, using the real combinations (nCr) formula -- enter your own lottery\'s rules rather than one fixed, named game.',
    example: 'In a 6-from-49 pick lottery, the odds of matching all 6 numbers are 1 in 13,983,816.',
    breakdown: {
      headline: 'matchProbabilityPercent',
      headlineLabel: 'Probability of this exact match count',
      outputs: [
        { id: 'matchProbabilityPercent', label: 'Probability of this exact match count', format: 'percent' },
        { id: 'oddsOneInForMatch', label: 'Odds (1 in)', format: 'significant' },
        { id: 'jackpotOddsOneIn', label: 'Odds of matching every number (jackpot)', format: 'significant' },
        { id: 'totalCombinations', label: 'Total possible combinations', format: 'significant' }
      ],
      groups: [{ title: 'Your lottery\'s rules', inputs: ['poolSize', 'picksCount', 'matches'] }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why lottery odds are a combinations (nCr) problem',
        paragraphs: [
          'A typical lottery draws k numbers out of a pool of n, and a ticket also picks k numbers; you win based on how many of your k numbers match the k drawn. Because the order the numbers are drawn in does not matter, the total number of possible draws is the number of combinations of k numbers chosen from n, written nCk or "n choose k" -- the same combinations function used across this site\'s statistics calculators.',
          'The odds of matching exactly m of your k numbers combine two separate combination counts: the number of ways to choose which m of your k numbers were drawn, times the number of ways the remaining k-m drawn numbers could be any of the n-k numbers you did not pick, all divided by the total number of possible draws. This calculator enters your own lottery\'s pool size and pick count, rather than assuming one specific real-world game, since the rule (how many numbers, drawn from how large a pool) varies by lottery and by jurisdiction, and jackpot sizes change constantly.',
          'The result is exact: no approximation is involved, only the real combinatorics of how many ways a draw could go.'
        ]
      },
      howTo: {
        intro: 'Enter your own lottery\'s rules, then the match count you want the odds for.',
        steps: [
          { name: 'Enter the pool size', text: 'How many numbers the lottery draws from in total.' },
          { name: 'Enter how many numbers are picked/drawn', text: 'How many numbers both your ticket and the draw itself choose.' },
          { name: 'Enter the match count you want', text: 'How many of your numbers you want the odds of matching exactly -- set it equal to the pick count for the jackpot.' },
          { name: 'Read the probability and odds', text: 'The headline is the exact probability of that match count; "odds (1 in)" is the same figure written the way lottery odds are usually quoted.' },
          { name: 'Check the reference table', text: 'A worked 6-from-49 example below shows how fast the odds change across every possible match count, for comparison.' }
        ],
        outro: 'Everything is calculated in your browser from the combinations formula. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The probability of matching exactly m of k picked numbers, drawn from a pool of n.',
        expression:
          'P(match = m) = [ C(k, m) * C(n-k, k-m) ] / C(n, k)\nOdds of the jackpot (m = k) = 1 / C(n, k), since C(k, k) = 1 and C(n-k, 0) = 1',
        terms: [
          { symbol: 'n', meaning: 'Pool size: how many numbers the lottery draws from.' },
          { symbol: 'k', meaning: 'Pick count: how many numbers are drawn, and how many your ticket picks.' },
          { symbol: 'm', meaning: 'How many of your k numbers you want the odds of matching, from 0 to k.' },
          { symbol: 'C(n, k)', meaning: 'Combinations ("n choose k"): the number of ways to choose k numbers from n without regard to order.' }
        ],
        note: 'C(k, m) counts which of your own numbers were among the drawn ones; C(n-k, k-m) counts the ways the rest of the draw could land among the numbers you did not pick.'
      },
      workedExample: {
        intro: 'In a 6-from-49 pick lottery (n = 49, k = 6), what are the odds of matching exactly 3 numbers, and separately, all 6?',
        rows: [
          { label: 'Total combinations, C(49, 6)', value: '13,983,816' },
          { label: 'Ways to match exactly 3: C(6,3) x C(43,3)', value: '20 x 12,341 = 246,820' },
          { label: 'P(match = 3)', value: '246,820 / 13,983,816' },
          { label: 'Ways to match all 6: C(6,6) x C(43,0)', value: '1 x 1 = 1' },
          { label: 'P(match = 6), the jackpot', value: '1 / 13,983,816' }
        ],
        result: 'P(match 3) ≈ 1.77%, about 1 in 56.7; P(match all 6) ≈ 1 in 13,983,816',
        explanation: 'Matching exactly 3 is far more likely than the jackpot because there are 246,820 different draws that would give you exactly 3 matches, against only one possible draw (all 6 of your numbers, in some order) that gives you the jackpot.'
      },
      watchOut: [
        { title: 'Enter your own lottery\'s real rules', body: 'Pool size and pick count vary by lottery and change over time as games are redesigned -- this calculator does not assume or name any specific one; enter the numbers from your own game\'s official rules.' },
        { title: 'Some real lotteries use a separate bonus-number pool', body: 'A game with an extra "bonus ball" drawn from its own separate pool (common in many real lotteries) is not the same structure as this calculator models; this page covers the single-pool pick-k-from-n case only.' },
        { title: 'Odds do not depend on the jackpot size', body: 'The probability of any match count is fixed by the pool size and pick count alone -- it has nothing to do with how large the advertised jackpot is, how many tickets have been sold, or how long it has been since the last winner.' },
        { title: 'Large combinations are shown as rounded approximations', body: 'Past about 9.007 quadrillion (2^53 - 1), the total-combinations figure is a correctly-rounded approximation rather than an exact integer, the same practical limit the site\'s combination calculator discloses.' }
      ],
      referenceTable: {
        title: `Odds by match count, for a ${LOTTERY_EXAMPLE_PICKS}-from-${LOTTERY_EXAMPLE_POOL} pick lottery`,
        columns: ['Matches', 'Odds (1 in, rounded)'],
        rows: LOTTERY_EXAMPLE_ROWS.map((row) => ({ label: `Exactly ${row.matches} of ${LOTTERY_EXAMPLE_PICKS}`, values: [row.oddsOneIn] })),
        decimals: 0,
        note: `Computed directly from the combinations formula above for n = ${LOTTERY_EXAMPLE_POOL}, k = ${LOTTERY_EXAMPLE_PICKS} -- a generic pick-6-from-49 structure used as an illustration, not any one named lottery.`
      },
      references: [
        { label: 'Wikipedia, Lottery mathematics (general matching-probability formula)', url: 'https://en.wikipedia.org/wiki/Lottery_mathematics' }
      ]
    },
    inputs: [
      { id: 'poolSize', label: 'Pool size (n)', type: 'number', placeholder: '49', defaultValue: 49, step: 1, min: 1 },
      { id: 'picksCount', label: 'Numbers picked/drawn (k)', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 1 },
      { id: 'matches', label: 'Match count you want the odds of (m)', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 0 }
    ],
    seo: {
      title: 'Lottery Odds Calculator – Pick-k-from-n Combinations',
      description: 'Find the exact odds of matching some or all numbers in any pick-k-from-n lottery, using the real combinations (nCr) formula for your own lottery\'s rules.',
      faq: [
        { question: 'What are the odds of winning a 6-from-49 lottery jackpot?', answer: '1 in 13,983,816 -- there is exactly one way to match all 6 of your numbers, out of C(49,6) = 13,983,816 total possible draws.' },
        { question: 'What are the odds of matching exactly 3 of 6 numbers in a 6-from-49 lottery?', answer: 'About 1 in 56.7 (roughly 1.77%) -- there are C(6,3) x C(43,3) = 246,820 ways to match exactly 3, out of 13,983,816 total draws.' },
        { question: 'How do you calculate lottery odds?', answer: 'Divide the number of ways to get your target match count -- C(k, m) ways to pick which of your numbers matched, times C(n-k, k-m) ways for the rest of the draw to miss them -- by the total number of possible draws, C(n, k).' },
        { question: 'Do the odds change based on the jackpot size?', answer: 'No -- the odds depend only on the pool size and pick count, which are fixed by the game\'s rules. The jackpot amount and how many tickets were sold do not affect the probability of any match count.' },
        { question: 'Does this work for any lottery, not just 6-from-49?', answer: 'Yes -- enter your own lottery\'s pool size and pick count. This calculator does not assume or endorse any specific real-world game.' },
        { question: 'What if my lottery has a separate bonus number?', answer: 'This calculator covers a single-pool pick-k-from-n game only. A bonus ball drawn from its own separate pool is a different structure this page does not model.' }
      ]
    },
    compute(values) {
      const n = Math.round(values.poolSize);
      const k = Math.round(values.picksCount);
      const m = Math.round(values.matches);
      const noAnswer = { matchProbabilityPercent: NaN, oddsOneInForMatch: NaN, jackpotOddsOneIn: NaN, totalCombinations: NaN };
      if (!Number.isFinite(n) || !Number.isFinite(k) || n < 1 || k < 1 || k > n || k > PROBABILITY_MAX_N || m < 0 || m > k) return noAnswer;
      const total = nCrBig(n, k);
      if (total === 0n) return noAnswer;
      const ways = nCrBig(k, m) * nCrBig(n - k, k - m);
      const probability = Number(ways) / Number(total);
      return {
        matchProbabilityPercent: probability * 100,
        oddsOneInForMatch: probability > 0 ? 1 / probability : NaN,
        jackpotOddsOneIn: Number(total),
        totalCombinations: Number(total)
      };
    }
  },
  {
    id: 'card-draw-probability-calculator',
    category: 'fun',
    glyph: '♠',
    updatedAt: '2026-11-18',
    aliases: ['probability of drawing a card calculator', 'poker hand odds calculator', 'deck of cards probability calculator', 'chance of drawing an ace'],
    related: ['combination-calculator', 'lottery-odds-calculator', 'dice-probability-calculator', 'probability-calculator'],
    title: 'Card Draw Probability Calculator',
    description: 'Find the exact probability of drawing a specific number of a target card type (aces, hearts, face cards, or any group you define) in a hand from a standard deck, using the real hypergeometric distribution.',
    example: 'Dealt a 5-card hand from a standard 52-card deck, the probability of getting exactly 1 ace is about 29.95%.',
    breakdown: {
      headline: 'probabilityPercent',
      headlineLabel: 'Probability',
      outputs: [
        { id: 'probabilityPercent', label: 'Probability', format: 'percent' },
        { id: 'oddsOneIn', label: 'Odds (1 in)', format: 'significant' },
        { id: 'totalHands', label: 'Total possible hands', format: 'significant' },
        { id: 'favorableHands', label: 'Favorable hands (for the target count alone)', format: 'significant' }
      ],
      groups: [
        { title: 'Deck', inputs: ['deckSize', 'successCount'] },
        { title: 'Draw', inputs: ['drawCount', 'comparisonCode', 'targetLow', 'targetHigh'] }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'The hypergeometric distribution: drawing without replacement',
        paragraphs: [
          'Dealing a hand of cards is sampling without replacement: once a card is dealt, it cannot be dealt again in the same hand, so each card you draw changes the odds for the next one. That is different from a coin flip or a fresh dice roll, where every trial starts over with the same odds (sampling with replacement). The distribution that describes drawing without replacement is called the hypergeometric distribution.',
          'This calculator splits a standard 52-card deck into a "target" group (however many cards count as a success -- 4 if you are tracking aces, 13 if you are tracking a single suit, and so on) and everything else, then finds the exact probability of ending up with a given number of target cards in your hand. The same formula works for any deck size and any target-group size, not just a standard 52-card deck with 4 aces.',
          'Because every card removes a card from the deck for the next draw, these probabilities cannot be found by simply multiplying the same fraction together the way an independent-trials calculation would -- the combinations formula below accounts for that directly.'
        ]
      },
      howTo: {
        intro: 'Describe the deck and the target, then the hand size and comparison.',
        steps: [
          { name: 'Enter the deck size', text: 'How many cards are in the deck -- 52 for a standard deck.' },
          { name: 'Enter the target group size', text: 'How many cards in the deck count as a "success" -- 4 for aces, 13 for a single suit, 12 for face cards, and so on.' },
          { name: 'Enter the hand size', text: 'How many cards are dealt into the hand.' },
          { name: 'Choose a comparison and target count', text: 'Exactly this many, at least, at most, or between two counts, of the target group in the hand.' },
          { name: 'Read the probability and odds', text: 'The headline is the exact hypergeometric probability for your chosen comparison.' }
        ],
        outro: 'Everything is calculated in your browser with the exact combinations formula. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The exact probability of drawing exactly k target cards in a hand of n, from a deck of N cards containing K target cards.',
        expression:
          'P(X = k) = [ C(K, k) * C(N-K, n-k) ] / C(N, n)\nP(X >= k) = sum from j=k to min(n,K) of P(X = j); P(X <= k) = sum from j=max(0,n-(N-K)) to k of P(X = j)',
        terms: [
          { symbol: 'N', meaning: 'Total deck size.' },
          { symbol: 'K', meaning: 'How many cards in the deck count as the target group (the "successes").' },
          { symbol: 'n', meaning: 'Hand size: how many cards are drawn.' },
          { symbol: 'k', meaning: 'The target number of target-group cards in the hand.' },
          { symbol: 'C(a, b)', meaning: 'Combinations ("a choose b"); 0 whenever b is negative or greater than a.' }
        ],
        note: 'C(K, k) counts which k of the target cards are in the hand; C(N-K, n-k) counts the ways the rest of the hand could be filled from the non-target cards.'
      },
      workedExample: {
        intro: 'Dealt a 5-card hand from a standard 52-card deck (4 aces), what is the probability of exactly 1 ace, and separately, all 4 aces?',
        rows: [
          { label: 'Total possible 5-card hands, C(52, 5)', value: '2,598,960' },
          { label: 'Ways to get exactly 1 ace: C(4,1) x C(48,4)', value: '4 x 194,580 = 778,320' },
          { label: 'P(exactly 1 ace)', value: '778,320 / 2,598,960' },
          { label: 'Ways to get all 4 aces: C(4,4) x C(48,1)', value: '1 x 48 = 48' },
          { label: 'P(all 4 aces)', value: '48 / 2,598,960' }
        ],
        result: 'P(exactly 1 ace) ≈ 29.95%; P(all 4 aces) ≈ 0.0018%, about 1 in 54,145',
        explanation: 'Exactly 1 ace is the single most common outcome for ace count in a 5-card hand, while all 4 aces is one of the rarest possible hands, since it requires every one of the deck\'s 4 aces to land in your 5 cards.'
      },
      watchOut: [
        { title: 'This is drawing without replacement', body: 'Every card dealt reduces the deck for the next card, which is why this uses the hypergeometric formula rather than simply raising a single-draw probability to a power (that would be the different, with-replacement case).' },
        { title: 'Define the target group to match your real question', body: 'Set the target-group size to match what you are actually asking about: 4 for a specific rank like aces, 13 for a single suit, 12 for face cards (jack, queen, king across all suits), or any other count that fits a standard deck or a custom one.' },
        { title: '"At least" and "at most" are capped by what is physically possible', body: 'You cannot draw more target cards than either the hand size or the target group itself contains, so this calculator automatically limits the summed range to what is actually reachable.' },
        { title: 'This models one standard deck, not multiple decks shuffled together', body: 'Some card games (certain casino games, for example) shuffle several decks together, which changes the deck size and target-group size but not the formula itself -- adjust both fields to match.' }
      ],
      references: [
        { label: 'Wikipedia, Hypergeometric distribution (formula and a worked without-replacement example)', url: 'https://en.wikipedia.org/wiki/Hypergeometric_distribution' }
      ]
    },
    inputs: [
      { id: 'deckSize', label: 'Deck size (N)', type: 'number', placeholder: '52', defaultValue: 52, step: 1, min: 1 },
      { id: 'successCount', label: 'Target cards in the deck (K)', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 0 },
      { id: 'drawCount', label: 'Hand size (n)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 },
      {
        id: 'comparisonCode',
        label: 'Comparison',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Exactly this many target cards' },
          { value: 1, label: 'At least this many' },
          { value: 2, label: 'At most this many' },
          { value: 3, label: 'Between two counts' }
        ]
      },
      { id: 'targetLow', label: 'Target count', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 },
      { id: 'targetHigh', label: 'Upper count (for "between" only)', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 }
    ],
    seo: {
      title: 'Card Draw Probability Calculator – Hypergeometric Odds',
      description: 'Find the exact probability of drawing a target number of cards (aces, a suit, face cards) in a hand, using the real hypergeometric distribution.',
      faq: [
        { question: 'What is the probability of drawing exactly 1 ace in a 5-card hand?', answer: 'About 29.95% -- there are C(4,1) x C(48,4) = 778,320 ways to get exactly 1 ace out of C(52,5) = 2,598,960 total possible 5-card hands.' },
        { question: 'What is the probability of being dealt all 4 aces in a 5-card hand?', answer: 'About 0.0018%, roughly 1 in 54,145 -- there is only C(4,4) x C(48,1) = 48 ways to do it, out of 2,598,960 total hands.' },
        { question: 'What is the probability of getting no aces in a 5-card hand?', answer: 'About 65.88% -- the most common outcome for ace count, since most 5-card hands do not contain any of the 4 aces in a 52-card deck.' },
        { question: 'How is this different from a dice or coin probability calculation?', answer: 'Cards are drawn without replacement, so each card dealt changes the odds for the rest of the hand. Dice and coin flips are independent trials where the odds reset every time, which uses a different formula (binomial, not hypergeometric).' },
        { question: 'Can I use this for a suit or face cards instead of aces?', answer: 'Yes -- set the target-group size to however many cards in the deck count as your target: 13 for a single suit, 12 for face cards (jack, queen, king across all 4 suits), or any custom count.' },
        { question: 'Does this work for decks other than 52 cards?', answer: 'Yes -- both the deck size and the target-group size are adjustable, so the same formula applies to any custom deck.' }
      ]
    },
    compute(values) {
      const N = Math.round(values.deckSize);
      const K = Math.round(values.successCount);
      const n = Math.round(values.drawCount);
      const mode = Math.round(values.comparisonCode);
      const noAnswer = { probabilityPercent: NaN, oddsOneIn: NaN, totalHands: NaN, favorableHands: NaN };
      if (!Number.isFinite(N) || !Number.isFinite(K) || !Number.isFinite(n) || N < 1 || N > PROBABILITY_MAX_N || K < 0 || K > N || n < 1 || n > N) {
        return noAnswer;
      }
      let low = Math.round(values.targetLow);
      let high = Math.round(values.targetHigh);
      if (mode === 0) high = low;
      else if (mode === 1) high = Math.min(n, K);
      else if (mode === 2) { high = low; low = 0; }
      else { const a = Math.min(low, high), b = Math.max(low, high); low = a; high = b; }
      const probability = hypergeometricRangeProbability(N, K, n, low, high);
      const total = nCrBig(N, n);
      const favorable = nCrBig(K, Math.round(values.targetLow)) * nCrBig(N - K, n - Math.round(values.targetLow));
      return {
        probabilityPercent: probability * 100,
        oddsOneIn: probability > 0 ? 1 / probability : NaN,
        totalHands: Number(total),
        favorableHands: Number(favorable)
      };
    }
  },
  {
    id: 'easter-date-calculator',
    category: 'fun',
    glyph: 'Sun',
    updatedAt: '2026-11-18',
    aliases: ['when is easter calculator', 'easter sunday date calculator', 'computus calculator', 'gauss easter algorithm calculator', 'date of easter calculator'],
    related: ['date-difference-calculator', 'age-calculator', 'chinese-zodiac-calculator', 'zodiac-sign-calculator'],
    title: 'Easter Date Calculator',
    description: 'Find the exact date of Easter Sunday in any year using the real Gaussian Easter algorithm -- the same modular-arithmetic method used to compute Easter without a calendar of moon phases.',
    example: 'In 2025, Easter Sunday falls on April 20 -- found from the year alone, with no lookup table of moon phases.',
    breakdown: {
      headline: 'easterDateMs',
      headlineLabel: 'Easter Sunday',
      outputs: [
        { id: 'easterDateMs', label: 'Easter Sunday', format: 'date' },
        { id: 'goldenNumber', label: 'Golden number (position in the 19-year lunar cycle)', format: 'integer' },
        { id: 'daysAfterMarch21', label: 'Days after March 21', format: 'integer' },
        { id: 'isLeapYear', label: 'Leap year?', labels: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }] }
      ],
      groups: [{ title: 'Year', inputs: ['year'] }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What the Gaussian Easter algorithm actually computes',
        paragraphs: [
          'Easter Sunday is defined, since the Council of Nicaea in 325 CE, as the first Sunday after the first ecclesiastical full moon falling on or after March 21 -- a fixed calendar date standing in for the vernal equinox. The "full moon" used is a calculated, agreed-upon calendar approximation, not whatever the real moon is actually doing that year, which is why Easter can be computed centuries in advance without any astronomical observation at all.',
          'Carl Friedrich Gauss published a way to find that Sunday directly from the year number in 1800, using nothing but modular arithmetic -- no table of moon phases or calendar lookup required. It works by tracking two independent cycles at once: the year\'s position in a 19-year lunar repeating pattern (the "golden number," built on the Metonic cycle, where 19 solar years is very close to a whole number of lunar months) and the year\'s position in the 7-day week. Combining the two pins down the one Sunday the rule describes.',
          'The version below is the Gregorian-calendar form of the algorithm: it adds two century-based correction terms, M and N, to account for the Gregorian calendar\'s own leap-year exceptions (which Gauss\'s original Julian-calendar version did not need), plus two rare, documented exceptions that patch two specific combinations the raw formula would otherwise place one day too late.'
        ]
      },
      howTo: {
        intro: 'Enter any year from 1583 onward -- the first full year the Gregorian calendar was in effect.',
        steps: [
          { name: 'Enter a year', text: 'Any Gregorian-calendar year, 1583 or later.' },
          { name: 'Read the date', text: 'The headline is the exact date of Easter Sunday that year.' },
          { name: 'Check the golden number', text: 'This is the year\'s position (1-19) in the 19-year lunar cycle the algorithm uses -- not a date, but one of the two raw ingredients the formula combines.' },
          { name: 'Check days after March 21', text: 'How far Easter falls past the fixed ecclesiastical equinox date -- always between 1 and 35 days, which is the same as saying Easter always falls between March 22 and April 25.' }
        ],
        outro: 'Everything is calculated in your browser using the exact algorithm below. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Gauss\'s algorithm reduces the whole ecclesiastical rule to nine small modular calculations, in order.',
        expression:
          'a = year mod 19\nb = year mod 4\nc = year mod 7\nk = floor(year / 100)\np = floor((13 + 8k) / 25)\nq = floor(k / 4)\nM = (15 - p + k - q) mod 30\nN = (4 + k - q) mod 7\nd = (19a + M) mod 30\ne = (2b + 4c + 6d + N) mod 7\nEaster = March (22 + d + e), or April (d + e - 9) if 22 + d + e > 31\nException 1: April 26 -> April 19\nException 2: April 25 with d=28, e=6, a>10 -> April 18',
        terms: [
          { symbol: 'a', meaning: 'Position in the 19-year Metonic lunar cycle (a+1 is the "golden number"). Rooted in the fact that 19 solar years is very close to a whole number of lunar months.' },
          { symbol: 'b, c', meaning: 'The year\'s position in the 4-year leap-year cycle and the 7-day week.' },
          { symbol: 'k, p, q', meaning: 'Century-based terms used only to build the two Gregorian correction values M and N below.' },
          { symbol: 'M, N', meaning: 'Gregorian-calendar corrections that account for the Gregorian leap-year rule\'s own century exceptions (centuries not divisible by 400 skip a leap day) -- not needed in Gauss\'s original Julian-calendar version.' },
          { symbol: 'd', meaning: 'How many days after March 21 the ecclesiastical full moon falls, by the lunar cycle alone.' },
          { symbol: 'e', meaning: 'An additional weekday correction that moves the full-moon date forward to the following Sunday.' }
        ],
        note: 'Every division above is integer division -- the remainder is dropped, never rounded -- and every variable stays a small two-digit number. This calculator restricts input to 1583 onward because the Gregorian calendar did not exist before October 1582.'
      },
      workedExample: {
        intro: 'What date is Easter Sunday in 2025?',
        rows: [
          { label: 'a = 2025 mod 19', value: '11' },
          { label: 'b = 2025 mod 4, c = 2025 mod 7', value: '1, 2' },
          { label: 'k = floor(2025/100), p = floor((13+8x20)/25), q = floor(20/4)', value: '20, 6, 5' },
          { label: 'M = (15-6+20-5) mod 30', value: '24' },
          { label: 'N = (4+20-5) mod 7', value: '5' },
          { label: 'd = (19x11+24) mod 30 = 233 mod 30', value: '23' },
          { label: 'e = (2x1+4x2+6x23+5) mod 7 = 153 mod 7', value: '6' },
          { label: '22 + d + e = 22+23+6 = 51, over 31 -> April; day = d+e-9 = 23+6-9', value: '20' }
        ],
        result: 'April 20, 2025',
        explanation: 'Because 22 + d + e (51) is greater than 31, the date rolls into April and is recomputed as d + e - 9 = 20. Neither exception applies (the result is not April 25 or 26), so April 20, 2025 is the final answer -- 30 days after the fixed March 21 equinox date.'
      },
      watchOut: [
        { title: 'This is Western (Gregorian) Easter only', body: 'Orthodox churches that use the Julian calendar apply the same ecclesiastical rule against a different calendar, which usually (though not always) gives a later date. This calculator does not compute the Orthodox date.' },
        { title: 'The "full moon" is ecclesiastical, not astronomical', body: 'It is a calculated calendar approximation agreed on centuries ago, and occasionally falls a day or two from the real, observable full moon. Easter\'s date has never depended on anyone actually looking at the sky.' },
        { title: 'Easter always falls between March 22 and April 25', body: 'That range comes directly out of the algorithm\'s own bounds on d and e, not from an assumption added on top -- this calculator will never produce a date outside it.' },
        { title: 'Two rare exceptions exist for a reason', body: 'Without them, the raw formula would occasionally compute April 26 (always patched to April 19) or, for specific years, April 25 (patched to April 18). These combinations are uncommon -- most years need neither exception.' },
        { title: 'Valid for the Gregorian calendar era', body: 'The calculator accepts years from 1583 onward. It assumes the Gregorian leap-year rule continues unchanged indefinitely into the future, which is the standard assumption every Easter-date calculation makes.' }
      ],
      references: [
        { label: 'Wikipedia, Date of Easter (Gauss\'s algorithm)', url: 'https://en.wikipedia.org/wiki/Date_of_Easter' },
        { label: 'US Naval Observatory, Computing the Date of Easter', url: 'https://aa.usno.navy.mil/faq/easter' }
      ]
    },
    inputs: [{ id: 'year', label: 'Year', type: 'number', placeholder: '2027', defaultValue: 2027, step: 1, min: 1583 }],
    seo: {
      title: 'Easter Date Calculator – Gaussian Easter Algorithm',
      description: 'Find the exact date of Easter Sunday in any year using the real Gaussian Easter algorithm -- the modular-arithmetic method with no moon-phase table.',
      faq: [
        { question: 'What date is Easter in 2025?', answer: 'April 20, 2025, computed directly from Gauss\'s algorithm: the golden number is 12, and the formula\'s d and e values (23 and 6) push the result into April.' },
        { question: 'How is the date of Easter actually calculated?', answer: 'Easter Sunday is the first Sunday after the first ecclesiastical full moon on or after March 21. Gauss\'s 1800 algorithm finds that Sunday from the year number alone, using modular arithmetic on the year\'s position in a 19-year lunar cycle and the 7-day week -- no table of real moon phases needed.' },
        { question: 'Why does the formula have two exceptions?', answer: 'Without them, the raw d/e formula would occasionally land on April 26, or on April 25 for a specific combination of years, both one day later than the ecclesiastical rule actually intends. The exceptions patch those two cases to April 19 and April 18.' },
        { question: 'What is the "golden number"?', answer: 'The year\'s position (1 through 19) in a repeating 19-year lunar cycle, one of the two raw cycles -- lunar and weekday -- that the algorithm combines to find Easter. It is not a date by itself.' },
        { question: 'What is the earliest and latest Easter can fall?', answer: 'March 22 at the earliest and April 25 at the latest -- both bounds come directly from the algorithm\'s own formula, not a separate rule layered on top.' },
        { question: 'Is this the same date Orthodox churches use?', answer: 'Not usually. Orthodox churches apply the same ecclesiastical rule but against the Julian calendar, which this calculator does not compute, and which typically lands on a later date.' },
        { question: 'Why does Easter move every year, unlike Christmas?', answer: 'Christmas is fixed to a calendar date (December 25). Easter is fixed to a lunar-cycle event (the ecclesiastical full moon) and then rounded to the following Sunday, so its calendar date shifts from year to year the way a lunar event does.' }
      ]
    },
    compute(values) {
      const year = Math.round(values.year);
      if (!Number.isFinite(year) || year < 1583) return { easterDateMs: NaN, goldenNumber: NaN, daysAfterMarch21: NaN, isLeapYear: NaN };
      const { month, day, goldenNumber } = easterSunday(year);
      const easterDateMs = new Date(year, month - 1, day).getTime();
      const march21Ms = new Date(year, 2, 21).getTime();
      const daysAfterMarch21 = Math.round((easterDateMs - march21Ms) / 86400000);
      const isLeapYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 1 : 0;
      return { easterDateMs, goldenNumber, daysAfterMarch21, isLeapYear };
    }
  },
  {
    id: 'mayan-calendar-converter',
    category: 'fun',
    glyph: 'LC',
    updatedAt: '2026-11-18',
    aliases: ['mayan long count converter', 'maya calendar converter', 'gregorian to mayan calendar calculator', "tzolk'in haab calculator", 'mayan date converter'],
    related: ['easter-date-calculator', 'date-difference-calculator', 'age-calculator', 'chinese-zodiac-calculator'],
    title: 'Mayan Calendar Converter',
    description: "Convert any Gregorian date to its Maya Long Count, Tzolk'in and Haab' date, using the GMT correlation constant most Mayanist scholars use today.",
    example: "June 17, 2026 converts to Long Count 13.0.13.12.6 -- Tzolk'in 3 Kimi, Haab' 19 Sotz'.",
    breakdown: {
      headline: 'totalDaysSinceCreation',
      headlineLabel: 'Days since the Maya creation date (0.0.0.0.0)',
      outputs: [
        { id: 'totalDaysSinceCreation', label: 'Days since the Maya creation date (0.0.0.0.0)', format: 'integer' },
        { id: 'baktun', label: "Baktun (Long Count 1st place)", format: 'integer' },
        { id: 'katun', label: "Katun (2nd place)", format: 'integer' },
        { id: 'tun', label: "Tun (3rd place)", format: 'integer' },
        { id: 'uinal', label: "Uinal (4th place)", format: 'integer' },
        { id: 'kin', label: "Kin (5th place)", format: 'integer' },
        { id: 'tzolkinNumber', label: "Tzolk'in number (1-13)", format: 'integer' },
        { id: 'tzolkinDayNameCode', label: "Tzolk'in day name", labels: TZOLKIN_DAY_NAMES.map((name, i) => ({ value: i, label: name })) },
        { id: 'haabDayNumber', label: "Haab' day number (0-19)", format: 'integer' },
        { id: 'haabMonthCode', label: "Haab' month", labels: HAAB_MONTH_NAMES.map((name, i) => ({ value: i, label: name })) }
      ],
      groups: [{ title: 'Gregorian date', inputs: ['year', 'month', 'day'] }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Three calendars running at once',
        paragraphs: [
          "The Maya did not use one calendar -- they ran at least three at the same time, for different purposes. The Tzolk'in is a 260-day cycle (13 numbers x 20 named days) used for ritual and divination. The Haab' is a 365-day solar-approximation calendar (18 named 20-day months plus a short 5-day 19th month, Wayeb') used for the farming and civic year. Neither one tracks the actual year count, so the same Tzolk'in/Haab' combination recurs every 52 years (the \"Calendar Round\").",
          'The Long Count is the one built to count unambiguously across centuries: a place-value system, much like decimal digits, counting days since a fixed mythical creation date deep in the past. Its five places are the kin (1 day), uinal (20 days), tun (360 days), katun (7,200 days) and baktun (144,000 days) -- written baktun.katun.tun.uinal.kin, for example 13.0.0.0.0.',
          "Converting a modern Gregorian date into all three requires fixing exactly how many days separate the Gregorian calendar from the Maya creation date -- a single number called a correlation constant. This calculator uses the GMT (Goodman-Martinez-Thompson) correlation, 584,283, the value most Mayanist scholars and historical/astronomical cross-checks agree on today. See Watch Out for why that number is not universally used."
        ]
      },
      howTo: {
        intro: 'Enter any Gregorian calendar date.',
        steps: [
          { name: 'Enter a date', text: 'Any year, month and day on the Gregorian calendar (the one in everyday use).' },
          { name: 'Read the day count', text: 'The headline is the number of days since the Maya creation date, 0.0.0.0.0 -- the single number every other figure below is built from.' },
          { name: 'Read the Long Count', text: 'The five rows (baktun through kin) are that day count split into Maya place values, written together as baktun.katun.tun.uinal.kin.' },
          { name: "Read the Tzolk'in", text: "A number 1-13 plus one of 20 day names -- together a position in the repeating 260-day ritual cycle." },
          { name: "Read the Haab'", text: "A day number 0-19 plus one of 18 month names (or Wayeb', the short 19th month) -- a position in the 365-day civic year." }
        ],
        outro: 'Everything is calculated in your browser using the formulas below. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The conversion runs in three stages: a Gregorian date becomes a single day number, that number becomes a Long Count, and the same number also gives the Tzolk\'in and Haab\'.',
        expression:
          'JDN = Julian Day Number of the Gregorian date (Fliegel & Van Flandern, 1968)\nn = JDN - 584283   (584,283 = the GMT correlation)\nbaktun = floor(n / 144000)\nkatun = floor(n / 7200) mod 20\ntun = floor(n / 360) mod 20\nuinal = floor(n / 20) mod 18\nkin = n mod 20\ntzolkinNumber = ((n + 3) mod 13) + 1\ntzolkinDayIndex = (n + 19) mod 20\nhaabDayOfYear = (n + 348) mod 365',
        terms: [
          { symbol: 'JDN', meaning: 'A running count of days used by astronomers and calendar converters generally, computed from the Gregorian year/month/day with integer arithmetic alone.' },
          { symbol: 'n', meaning: 'Days since the Maya creation date -- zero exactly on that date, under the GMT correlation.' },
          { symbol: '584283', meaning: "The GMT correlation constant: the JDN of the Maya creation date, which corresponds to August 11, 3114 BCE on the proleptic Gregorian calendar." },
          { symbol: '+3, +19, +13, +20', meaning: "Offsets anchoring the Tzolk'in/Haab' formulas to the creation date's own recorded position, \"4 Ajaw 8 Kumk'u.\"" }
        ],
        note: "All divisions are integer division. baktun is never taken mod 20 -- real-world Long Count dates keep counting upward past 13 (we are in the 14th baktun today), they do not reset."
      },
      workedExample: {
        intro: 'Convert June 17, 2026.',
        rows: [
          { label: 'JDN of June 17, 2026', value: '2,461,209' },
          { label: 'n = JDN - 584283', value: '1,876,926' },
          { label: 'baktun = floor(1876926 / 144000)', value: '13' },
          { label: 'katun = floor(1876926 / 7200) mod 20', value: '0' },
          { label: 'tun = floor(1876926 / 360) mod 20', value: '13' },
          { label: 'uinal = floor(1876926 / 20) mod 18', value: '12' },
          { label: 'kin = 1876926 mod 20', value: '6' },
          { label: "Tzolk'in: ((n+3) mod 13)+1 = 4, dayIndex (n+19) mod 20 = 5 -> Kimi", value: '3 Kimi' },
          { label: "Haab': dayOfYear (n+348) mod 365 = 79 -> month index 3 (Sotz'), day 19", value: "19 Sotz'" }
        ],
        result: "Long Count 13.0.13.12.6 -- Tzolk'in 3 Kimi, Haab' 19 Sotz'",
        explanation: "Every figure comes from the one number n = 1,876,926: split into place values for the Long Count, and read two different ways (mod 13/20, and mod 365) for the Tzolk'in and Haab'."
      },
      watchOut: [
        { title: 'This uses the GMT correlation, not the only one ever proposed', body: "The GMT (Goodman-Martinez-Thompson) correlation, 584,283, is the value most Mayanist scholars use because it is independently supported by historical records, astronomical cross-checks and archaeological (radiocarbon) dating together. An older alternative, the Spinden correlation (489,384), shifts every date about 260 years earlier. This calculator always uses GMT." },
        { title: "The creation date is proleptic, not a real historical observation", body: 'August 11, 3114 BCE (the date this correlation assigns to Long Count 0.0.0.0.0) is a mythical Maya reference point, projected backward through the modern calendar -- not a claim that the Gregorian calendar, or anyone\'s calendar, existed then.' },
        { title: 'Baktun keeps counting past 13', body: "The famous December 21, 2012 date was Long Count 13.0.0.0.0 -- the baktun reaching 13 did not restart the calendar at 0, contrary to a popular misconception at the time; it simply continued to 13.0.0.0.1 the next day, and we are now in the 14th baktun." },
        { title: "Haab' days are numbered 0-19, not 1-20", body: 'Each Haab\' month\'s first day is day 0 (the "seating" of the month), so "8 Kumk\'u" is the 9th day of that month counting normally, written as the digit 8.' },
        { title: 'This is a date conversion, not a historical record', body: 'Real inscribed Long Count dates on Maya monuments are the actual historical record; this calculator only converts a modern calendar date in the other direction, for any date you choose.' }
      ],
      references: [
        { label: 'Wikipedia, Mesoamerican Long Count calendar (GMT correlation, 584,283)', url: 'https://en.wikipedia.org/wiki/Mesoamerican_Long_Count_calendar' },
        { label: 'Wikipedia, Maya calendar (creation date "4 Ahau 8 Kumkʼu")', url: 'https://en.wikipedia.org/wiki/Maya_calendar' },
        { label: "Wikipedia, Tzolk'in (20 day names, cycle order)", url: 'https://en.wikipedia.org/wiki/Tzolk%27in' },
        { label: "Wikipedia, Haab' (18 months, day-0 numbering)", url: 'https://en.wikipedia.org/wiki/Haab%27' }
      ]
    },
    inputs: [
      { id: 'year', label: 'Year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1 },
      { id: 'month', label: 'Month (1-12)', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 1 },
      { id: 'day', label: 'Day (1-31)', type: 'number', placeholder: '17', defaultValue: 17, step: 1, min: 1 }
    ],
    seo: {
      title: "Mayan Calendar Converter – Long Count, Tzolk'in & Haab'",
      description: "Convert any Gregorian date to the Maya Long Count, Tzolk'in and Haab' date, using the GMT correlation constant most Mayanist scholars use today.",
      faq: [
        { question: 'What Mayan date is June 17, 2026?', answer: "Long Count 13.0.13.12.6 -- Tzolk'in 3 Kimi, Haab' 19 Sotz' -- using the GMT correlation." },
        { question: 'What correlation constant does this calculator use?', answer: 'The GMT (Goodman-Martinez-Thompson) correlation, 584,283 -- the value most Mayanist scholars use because historical, astronomical and archaeological evidence all support it together.' },
        { question: 'Is there another correlation in use?', answer: 'Yes -- the older Spinden correlation (489,384) shifts every converted date about 260 years earlier. It lacks the same cross-checked support as GMT, which is why this calculator uses GMT.' },
        { question: 'Did the Maya calendar really end in 2012?', answer: 'No. December 21, 2012 was Long Count 13.0.0.0.0 -- the baktun place reaching 13, which simply continued counting (to 13.0.0.0.1, and so on), not a reset or an end.' },
        { question: "What is the difference between the Long Count, Tzolk'in and Haab'?", answer: "The Long Count is a place-value day count since a fixed creation date, used to track long spans unambiguously. The Tzolk'in is a 260-day ritual cycle. The Haab' is a 365-day civic/solar-approximation calendar. The Maya used all three together." },
        { question: "Why is a Haab' day written as '8 Kumk'u' instead of '9 Kumk'u'?", answer: "Haab' days are numbered starting at 0 (the month's \"seating\" day), so the digit shown is one less than the day's position counting from 1." },
        { question: 'Does this work for dates before the Gregorian calendar existed?', answer: 'It computes a proleptic Gregorian date -- the Gregorian calendar\'s rules projected backward -- the same convention used for the Maya creation date itself (August 11, 3114 BCE), not a claim that the Gregorian calendar was in use at that time.' }
      ]
    },
    compute(values) {
      const year = Math.round(values.year);
      const month = Math.round(values.month);
      const day = Math.round(values.day);
      const noAnswer = {
        totalDaysSinceCreation: NaN, baktun: NaN, katun: NaN, tun: NaN, uinal: NaN, kin: NaN,
        tzolkinNumber: NaN, tzolkinDayNameCode: NaN, haabDayNumber: NaN, haabMonthCode: NaN
      };
      if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day) || month < 1 || month > 12 || day < 1) return noAnswer;
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) return noAnswer;
      const JDN = gregorianToJDN(year, month, day);
      const lc = mayanLongCount(JDN);
      const tz = tzolkinOf(lc.n);
      const hb = haabOf(lc.n);
      return {
        totalDaysSinceCreation: lc.n,
        baktun: lc.baktun,
        katun: lc.katun,
        tun: lc.tun,
        uinal: lc.uinal,
        kin: lc.kin,
        tzolkinNumber: tz.number,
        tzolkinDayNameCode: tz.dayIndex,
        haabDayNumber: hb.dayNumber,
        haabMonthCode: hb.monthIndex
      };
    }
  },
  {
    id: 'friday-the-13th-calculator',
    category: 'fun',
    glyph: '13',
    updatedAt: '2026-11-18',
    aliases: ['friday the 13th calculator', 'how many friday the 13ths this year', 'next friday the 13th calculator', 'unlucky friday calculator', 'is there a friday the 13th this year'],
    related: ['easter-date-calculator', 'mayan-calendar-converter', 'date-difference-calculator', 'birthday-paradox-calculator'],
    title: 'Friday the 13th Calculator',
    description: 'Find every Friday the 13th in a given year, and the calendar reason certain months always get one together -- the same weekday-recurrence pattern behind the "doomsday rule."',
    example: '2026 has three: February, March and November -- because all three months\' 1st falls on a Sunday that year.',
    breakdown: {
      headline: 'count',
      headlineLabel: 'Friday the 13ths this year',
      outputs: [
        { id: 'count', label: 'Friday the 13ths this year', format: 'integer' },
        { id: 'month1Code', label: 'First one', labels: [{ value: 0, label: '-' }, ...MONTH_NAMES.map((m, i) => ({ value: i + 1, label: m }))] },
        { id: 'month2Code', label: 'Second one', labels: [{ value: 0, label: '-' }, ...MONTH_NAMES.map((m, i) => ({ value: i + 1, label: m }))] },
        { id: 'month3Code', label: 'Third one', labels: [{ value: 0, label: '-' }, ...MONTH_NAMES.map((m, i) => ({ value: i + 1, label: m }))] },
        { id: 'yearStartsOnCode', label: 'The year starts on a', labels: WEEKDAY_NAMES.map((w, i) => ({ value: i, label: w })) },
        { id: 'isLeapYear', label: 'Leap year?', labels: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }] }
      ],
      groups: [{ title: 'Year', inputs: ['year'] }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why Friday the 13th recurs the way it does',
        paragraphs: [
          'The rule behind every Friday the 13th is simple: the 13th of a month falls on Friday exactly when that month\'s 1st falls on a Sunday (13 - 1 = 12 days later, and 12 mod 7 = 5, so Sunday + 5 days is Friday). Finding every Friday the 13th in a year is therefore the same as finding every month whose 1st is a Sunday that year.',
          'Because every month is a fixed number of days long, the gap between any two months\' 1st-of-the-month, measured in days, is also fixed -- and what matters for the weekday is only that gap modulo 7. In a common (non-leap) year, four groups of months always share the same weekday on their 1st: January and October; April and July; September and December; and February, March and November together (because February is exactly 28 days -- four whole weeks -- so March 1 always repeats January\'s pattern one slot later, and the 31+30+31+30+31+31+30+31 = 245-day gap to November is also an exact multiple of 7). In a leap year, the extra day in February shifts the groups to January/April/July, February/August, March/November, and September/December.',
          'Which of those groups happens to land on Sunday in a given year is decided only by what weekday January 1 falls on. That single fact is also the core of the "doomsday rule," a mental-math technique for finding any date\'s weekday from a short list of easy-to-remember reference dates that all share one year\'s weekday -- the same recurring-weekday structure this calculator uses, just aimed at one specific target (Friday the 13th) instead of a general-purpose lookup.'
        ]
      },
      howTo: {
        intro: 'Enter a year.',
        steps: [
          { name: 'Enter a year', text: 'Any year, 1583 or later (the first full year of the Gregorian calendar).' },
          { name: 'Read the count', text: 'The headline is how many Friday the 13ths fall in that year -- always 1, 2 or 3, never 0.' },
          { name: 'Read the months', text: 'Up to three rows list which months, in order; unused rows show "-".' },
          { name: 'Check what the year starts on', text: 'This is the one fact that decides everything else -- which weekday January 1 falls on.' }
        ],
        outro: 'Everything is calculated in your browser from the real Gregorian calendar. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'No special formula is needed beyond the calendar itself -- just a check, run for every month.',
        expression: 'For each month m (1-12): if the weekday of (year, m, 13) is Friday, m is a Friday-the-13th month.\ncount = number of months where that is true',
        terms: [
          { symbol: 'weekday(year, m, 13)', meaning: 'Computed from the real Gregorian calendar, which already handles every leap-year exception correctly.' }
        ],
        note: 'Equivalently: month m has a Friday the 13th exactly when month m\'s 1st falls on a Sunday.'
      },
      workedExample: {
        intro: 'How many Friday the 13ths does 2026 have?',
        rows: [
          { label: 'January 1, 2026', value: 'Thursday' },
          { label: 'February 1, 2026 (31 days later, 31 mod 7 = 3)', value: 'Sunday -> February 13 is a Friday' },
          { label: 'March 1, 2026 (28 days after Feb 1, an exact 4 weeks)', value: 'Sunday -> March 13 is a Friday' },
          { label: 'November 1, 2026 (245 days after March 1, an exact 35 weeks)', value: 'Sunday -> November 13 is a Friday' },
          { label: 'Every other month\'s 1st', value: 'Not a Sunday that year' }
        ],
        result: '3 -- February, March and November',
        explanation: 'February, March and November always share the same weekday as each other in a common year; in 2026 that shared weekday happens to be Sunday, so all three get a Friday the 13th. (2012 is the equivalent leap-year case: January, April and July all share a weekday, and in 2012 that weekday was Sunday too, giving three Friday the 13ths that year as well.)'
      },
      watchOut: [
        { title: 'Every year has at least one, and never more than three', body: 'Both bounds come from the same calendar arithmetic -- no year under the Gregorian calendar can have zero Friday the 13ths, and no year can have more than three.' },
        { title: 'The leap-year groupings are different from the common-year ones', body: 'February\'s extra day in a leap year breaks its link to March, and creates a new one between January, April and July instead -- check the "leap year?" row before assuming last year\'s pattern repeats.' },
        { title: 'Friday the 13th is very slightly more common than other weekday/day-13 combinations', body: 'Across a full 400-year Gregorian cycle, the 13th falls on a Friday 688 times, versus 684-687 times for the other six weekdays -- a tiny statistical quirk of how the 400-year cycle\'s days divide into weeks, not a meaningful difference in practice.' },
        { title: 'This counts the calendar fact only, not the superstition\'s origin', body: 'The fear of Friday the 13th (paraskevidekatriaphobia) is a cultural and psychological phenomenon with its own separate history; this calculator only finds the dates, and makes no claim about luck.' }
      ],
      references: [
        { label: 'Wikipedia, Friday the 13th (frequency, 1st-must-be-Sunday rule, 688-occurrence figure)', url: 'https://en.wikipedia.org/wiki/Friday_the_13th' },
        { label: "Wikipedia, Doomsday rule (recurring same-weekday dates)", url: 'https://en.wikipedia.org/wiki/Doomsday_rule' }
      ]
    },
    inputs: [{ id: 'year', label: 'Year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1583 }],
    seo: {
      title: 'Friday the 13th Calculator – Every One in Any Year',
      description: 'Find every Friday the 13th in a given year, and the calendar reason certain months always get one together -- the same pattern behind the doomsday rule.',
      faq: [
        { question: 'How many Friday the 13ths are there in 2026?', answer: 'Three: February, March and November. All three months\' 1st falls on a Sunday in 2026, and a month\'s 13th is a Friday exactly when its 1st is a Sunday.' },
        { question: 'Can a year have no Friday the 13th at all?', answer: 'No. Under the Gregorian calendar, every year has at least one Friday the 13th -- the minimum is 1, the maximum is 3.' },
        { question: 'What is the most Friday the 13ths a year can have?', answer: 'Three. It happens in a common year that starts on Thursday (giving February, March and November) or a leap year that starts on Sunday (giving January, April and July), as in 2012.' },
        { question: 'Why do February, March and November share a pattern?', answer: 'In a common (non-leap) year, February is exactly 28 days -- four whole weeks -- so March 1 always falls on the same weekday as February 1. The 245-day gap from March 1 to November 1 is also an exact multiple of 7, linking all three.' },
        { question: 'Does the pattern change in a leap year?', answer: 'Yes. The extra day in February breaks its link to March and instead links January, April and July into one group, which is why 2012 (a leap year) had its three Friday the 13ths in those months instead.' },
        { question: 'Is Friday the 13th statistically unlucky?', answer: 'No evidence supports that. The only real statistical quirk is that across a full 400-year Gregorian cycle, the 13th of the month lands on a Friday 688 times versus 684-687 times for the other weekdays -- a negligible difference.' },
        { question: 'What is the "doomsday rule"?', answer: 'A mental-math shortcut for finding any date\'s weekday from a short list of easy-to-remember dates that all share one year\'s weekday. It relies on the same recurring-weekday structure between months that this calculator uses to find Friday the 13ths.' }
      ]
    },
    compute(values) {
      const year = Math.round(values.year);
      const noAnswer = { count: NaN, month1Code: NaN, month2Code: NaN, month3Code: NaN, yearStartsOnCode: NaN, isLeapYear: NaN };
      if (!Number.isFinite(year) || year < 1583) return noAnswer;
      const months = friday13Months(year);
      const isLeapYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 1 : 0;
      return {
        count: months.length,
        month1Code: months[0] ?? 0,
        month2Code: months[1] ?? 0,
        month3Code: months[2] ?? 0,
        yearStartsOnCode: new Date(year, 0, 1).getDay(),
        isLeapYear
      };
    }
  },
  {
    id: 'christmas-countdown-calculator',
    category: 'fun',
    glyph: 'Dec',
    updatedAt: '2026-11-18',
    timeDependent: true,
    aliases: ['christmas countdown calculator', 'days until christmas calculator', 'shopping days until christmas calculator', 'how many days until christmas', 'xmas countdown calculator'],
    related: ['easter-date-calculator', 'friday-the-13th-calculator', 'date-difference-calculator', 'age-calculator'],
    title: 'Christmas Countdown Calculator',
    description: 'Count the days, hours and minutes until December 25, plus a separate "shopping days left" split into remaining weekdays and weekend days.',
    example: 'From November 18, 2026, Christmas is 36 days, 14 hours away -- 27 of the remaining weekdays and 10 weekend days before December 25.',
    breakdown: {
      headline: 'daysLeft',
      headlineLabel: 'Days until Christmas',
      outputs: [
        { id: 'daysLeft', label: 'Days until Christmas', format: 'integer' },
        { id: 'hoursLeft', label: 'Plus hours', format: 'integer' },
        { id: 'minutesLeft', label: 'Plus minutes', format: 'integer' },
        { id: 'shoppingWeekdaysLeft', label: 'Shopping weekdays left (Mon-Fri)', format: 'integer' },
        { id: 'shoppingWeekendDaysLeft', label: 'Weekend days left (Sat-Sun)', format: 'integer' }
      ],
      groups: [{ title: 'Which Christmas', inputs: ['targetYear'] }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Two different countdowns in one',
        paragraphs: [
          'A plain "days until Christmas" figure is just the gap between today and December 25, the same subtraction the date difference calculator already does for any two dates. This calculator adds a second, genuinely different figure: how many of the remaining days are weekdays versus weekend days, because those two kinds of days are not equally useful for shopping, wrapping or planning a trip home.',
          'The precise top-line figure -- days, hours and minutes -- is measured from right now, not from midnight, so it keeps counting down through the day rather than only changing once every 24 hours. December 25 itself is treated as the finish line: the countdown reaches zero at the very start of Christmas Day, local time.',
          'The weekday/weekend split uses the ordinary Monday-through-Friday work-week convention: ISO 8601, the international date and time standard, numbers the days Monday (1) through Sunday (7) and, in its own worked example for how a calendar week is assigned a number, explicitly treats Saturdays and Sundays as non-working days. This calculator uses that same Monday-Friday/Saturday-Sunday split, counting from today through December 24 -- the last calendar day before Christmas itself.'
        ]
      },
      howTo: {
        intro: 'Enter which year\'s Christmas you want to count down to -- it defaults to the current one.',
        steps: [
          { name: 'Enter the year', text: 'The calendar year of the Christmas you are counting down to.' },
          { name: 'Read the countdown', text: 'Days, plus hours, plus minutes, measured from right now to December 25 at midnight, local time.' },
          { name: 'Read the shopping split', text: 'How many of the remaining days (today through December 24) are weekdays versus weekend days.' }
        ],
        outro: 'Everything is calculated in your browser from your device\'s clock. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The countdown is a timestamp subtraction; the shopping split counts weekdays and weekend days across the same remaining window.',
        expression:
          'christmas = December 25, target year, 00:00 local time\ndiff = christmas - now\ndaysLeft = floor(diff / 86,400,000)\nhoursLeft = floor((diff mod 86,400,000) / 3,600,000)\nminutesLeft = floor((diff mod 3,600,000) / 60,000)\nshopping window = today through December 24, target year (inclusive)\nshoppingWeekdaysLeft, shoppingWeekendDaysLeft = count of Mon-Fri vs Sat-Sun days in that window',
        terms: [
          { symbol: 'diff', meaning: 'Milliseconds between the exact current moment and the target Christmas midnight.' },
          { symbol: '86,400,000 / 3,600,000 / 60,000', meaning: 'Milliseconds in a day, an hour and a minute, used to split the remaining time into a readable days/hours/minutes figure.' },
          { symbol: 'shopping window', meaning: 'Every calendar day from today up to and including December 24 -- Christmas Day itself is excluded, since it is the day gifts are given, not a day to still be shopping for them.' }
        ],
        note: 'If the target Christmas has already passed this year, every figure shows 0 rather than a negative number -- change the year field to count down to next year\'s instead.'
      },
      workedExample: {
        intro: 'From November 18, 2026, at 10:00 a.m., how far away is Christmas 2026?',
        rows: [
          { label: 'Christmas 2026 midnight minus now', value: '36 days, 14 hours' },
          { label: 'Shopping window (Nov 18 through Dec 24, inclusive)', value: '37 calendar days' },
          { label: 'Weekdays in that window (Mon-Fri)', value: '27' },
          { label: 'Weekend days in that window (Sat-Sun)', value: '10' }
        ],
        result: '36 days, 14 hours until Christmas -- 27 shopping weekdays and 10 weekend days remaining',
        explanation: 'The 37-day window splits into 5 full weeks (35 days, 25 weekdays + 10 weekend days) plus a 2-day remainder that happens to land on two more weekdays, for 27 weekdays and 10 weekend days in total.'
      },
      watchOut: [
        { title: 'The countdown uses your device\'s clock and time zone', body: 'Both the top-line countdown and the shopping-day split are measured against the date and time set on the device you are using, the same convention as every other live countdown on this site.' },
        { title: 'December 24 is the last day counted as a "shopping day"', body: 'This calculator\'s shopping window stops at December 24. If you consider December 25 itself a shopping day too (last-minute purchases after gifts are opened), add one more day by hand.' },
        { title: 'A year far from today gives an unusually long window', body: 'If you pick a target year more than a few months away, the shopping-day split will count weekdays and weekends across that entire gap, not just a typical few weeks of holiday shopping -- it is still an accurate count, just not the window most people mean by "shopping days."' },
        { title: 'This is a plain Monday-Friday/Saturday-Sunday split, not a store-hours guide', body: 'It does not know which days any particular store is actually open, or when a specific sale ends -- it only counts calendar weekdays versus weekend days.' }
      ],
      references: [
        { label: 'Wikipedia, ISO 8601 (Monday-Sunday weekday numbering and its non-working-day worked example)', url: 'https://en.wikipedia.org/wiki/ISO_8601' }
      ]
    },
    inputs: [{ id: 'targetYear', label: 'Christmas year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1900 }],
    seo: {
      title: 'Christmas Countdown Calculator – Days & Shopping Days Left',
      description: 'Count the days, hours and minutes until December 25, plus a separate shopping-days-left split into remaining weekdays and weekend days.',
      faq: [
        { question: 'How many days until Christmas?', answer: 'This calculator measures the exact gap from right now to December 25 at midnight, local time, and shows it as days, hours and minutes -- for example 36 days and 14 hours as of 10 a.m. on November 18, 2026.' },
        { question: 'What counts as a "shopping day" here?', answer: 'Any weekday (Monday through Friday) from today through December 24, the last calendar day before Christmas. Weekend days (Saturday and Sunday) in that same window are counted separately.' },
        { question: 'Why split weekdays and weekends at all?', answer: 'Most people have less free time to shop on a weekday than a weekend, so knowing how many of each kind of day remain is more useful for planning than a single combined day count.' },
        { question: 'Does the countdown update automatically?', answer: 'It recalculates from your device\'s clock every time you load the page, down to the minute, rather than only changing once a day.' },
        { question: 'What happens if I enter a year whose Christmas already passed?', answer: 'Every figure shows 0. Change the year field to the next Christmas you want to count down to.' },
        { question: 'Is December 25 itself counted as a shopping day?', answer: 'No -- the shopping window stops at December 24, since Christmas Day itself is when gifts are given, not a day to still be shopping for them.' }
      ]
    },
    compute(values) {
      const targetYear = Math.round(values.targetYear);
      if (!Number.isFinite(targetYear)) return { daysLeft: NaN, hoursLeft: NaN, minutesLeft: NaN, shoppingWeekdaysLeft: NaN, shoppingWeekendDaysLeft: NaN };
      const now = values.todayMs !== undefined ? new Date(values.todayMs) : new Date();
      const christmasMs = new Date(targetYear, 11, 25, 0, 0, 0).getTime();
      const diffMs = Math.max(0, christmasMs - now.getTime());
      const daysLeft = Math.floor(diffMs / 86400000);
      const hoursLeft = Math.floor((diffMs % 86400000) / 3600000);
      const minutesLeft = Math.floor((diffMs % 3600000) / 60000);
      const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const shopEndMs = new Date(targetYear, 11, 24).getTime();
      const { weekdays, weekendDays } = weekdayWeekendCount(todayMid, shopEndMs);
      return { daysLeft, hoursLeft, minutesLeft, shoppingWeekdaysLeft: weekdays, shoppingWeekendDaysLeft: weekendDays };
    }
  },
  {
    id: 'new-years-countdown-calculator',
    category: 'fun',
    glyph: 'Jan',
    updatedAt: '2026-11-18',
    timeDependent: true,
    aliases: ['new years countdown calculator', 'days until new year calculator', 'countdown to midnight calculator', 'new year countdown timer', 'happy new year countdown'],
    related: ['christmas-countdown-calculator', 'timezone-meeting-planner', 'date-difference-calculator', 'age-calculator'],
    title: "New Year's Countdown Calculator",
    description: "Count the days, hours and minutes until January 1, plus how many hours after Kiribati -- the first place on Earth to reach midnight -- your own New Year arrives.",
    example: "Someone on US Eastern time (UTC-5) reaches New Year's midnight 19 hours after Kiribati's Line Islands, the first inhabited place on Earth to get there.",
    breakdown: {
      headline: 'daysLeft',
      headlineLabel: "Days until New Year",
      outputs: [
        { id: 'daysLeft', label: "Days until New Year", format: 'integer' },
        { id: 'hoursLeft', label: 'Plus hours', format: 'integer' },
        { id: 'minutesLeft', label: 'Plus minutes', format: 'integer' },
        { id: 'hoursBehindKiribati', label: "Hours after Kiribati's New Year", format: 'number' }
      ],
      groups: [
        { title: 'Which New Year', inputs: ['targetYear'] },
        { title: 'Your time zone', inputs: ['utcOffsetHours'] }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why "midnight" does not happen at the same moment everywhere',
        paragraphs: [
          'A time zone is just a fixed offset from UTC (Coordinated Universal Time), and "midnight on January 1" means a different real moment in every zone, because each zone reaches its own local midnight at a different point in UTC time. The zone with the largest offset reaches midnight first in absolute terms, and the zone with the smallest (most negative) offset reaches it last.',
          "UTC+14:00 is the largest standard offset actually in use anywhere, and the Line Islands of Kiribati -- including the inhabited island of Kiritimati -- are the only populated place that uses it, which makes them the first inhabited place on Earth to reach any new calendar date, including January 1. Kiribati did not always sit at UTC+14: in 1995, the government unilaterally moved the international date line east to bring the Line Islands onto the same side as the rest of the country, partly so businesses across the country could share one business week, and partly so Kiribati would be the first country to see the dawn of the year 2000.",
          'This calculator counts down to your own local January 1 midnight, the same way any countdown would, and separately works out how many hours after Kiribati\'s that moment is -- a genuinely different number for almost everyone else on Earth, since UTC+14 is the earliest zone there is.'
        ]
      },
      howTo: {
        intro: "Enter the year you're counting down to, and your own UTC offset.",
        steps: [
          { name: 'Enter the target year', text: 'The calendar year of the January 1 you are counting down to.' },
          { name: 'Enter your UTC offset', text: 'How many hours your own time zone is from UTC -- for example -5 for US Eastern Standard Time, +5.5 for India, +9 for Japan.' },
          { name: 'Read the countdown', text: 'Days, plus hours, plus minutes, until your own local midnight on January 1.' },
          { name: "Read the Kiribati comparison", text: "How many hours after Kiribati's Line Islands (UTC+14, the earliest zone on Earth) your own New Year arrives." }
        ],
        outro: "Everything is calculated in your browser from your device's clock and the offset you type. Nothing you type is sent or stored."
      },
      formula: {
        intro: 'The countdown is a timestamp subtraction against your own local midnight; the Kiribati comparison is a simple offset difference.',
        expression:
          'newYear = January 1, target year, 00:00 local time\ndiff = newYear - now\ndaysLeft = floor(diff / 86,400,000)\nhoursLeft = floor((diff mod 86,400,000) / 3,600,000)\nminutesLeft = floor((diff mod 3,600,000) / 60,000)\nhoursBehindKiribati = 14 - yourUtcOffsetHours',
        terms: [
          { symbol: '14', meaning: "Kiribati's Line Islands UTC offset, UTC+14:00 -- the largest standard offset in use anywhere, and so the earliest zone to reach any new date." },
          { symbol: 'yourUtcOffsetHours', meaning: 'The UTC offset you entered for your own time zone -- negative for zones west of UTC (most of the Americas), positive for zones east of it.' }
        ],
        note: "hoursBehindKiribati assumes a whole-number or half-hour standard offset and does not itself account for daylight saving -- enter whichever offset actually applies to your location on January 1."
      },
      workedExample: {
        intro: "Someone on US Eastern Standard Time (UTC-5, winter, no daylight saving) asks how far behind Kiribati they are.",
        rows: [
          { label: 'Your UTC offset', value: '-5' },
          { label: "Kiribati's UTC offset", value: '+14' },
          { label: 'hoursBehindKiribati = 14 - (-5)', value: '19' }
        ],
        result: "19 hours after Kiribati's New Year",
        explanation: "Kiribati's Line Islands reach midnight 19 hours before US Eastern Standard Time does -- by the time an Eastern-time clock strikes midnight on January 1, Kiribati has already been in the new year for most of its first day."
      },
      watchOut: [
        { title: 'This is standard-offset arithmetic, not a live world clock', body: "It compares fixed UTC offsets, not real-time clocks in both places at once. For a live comparison across specific cities, a dedicated time zone converter is the better tool." },
        { title: 'Daylight saving is not applied automatically', body: 'Enter the UTC offset that actually applies to your location on January 1 itself (most places observing daylight saving are on standard time in winter) -- the calculator does not know your specific region\'s daylight-saving rules.' },
        { title: "Kiribati's UTC+14 is a deliberate political choice, not a geographic accident", body: "The Line Islands moved to UTC+14 only in 1995, when Kiribati's government shifted the international date line east to unify the country's business week and -- deliberately -- to be first to the year 2000." },
        { title: 'The countdown uses your device\'s clock and time zone', body: "The days/hours/minutes countdown itself (not the Kiribati comparison) is measured against your device's own clock, the same convention as every other live countdown on this site." },
        { title: 'If the target year has already begun, every figure shows 0', body: 'Change the year field to the next January 1 you want to count down to.' }
      ],
      references: [
        { label: 'Wikipedia, UTC+14:00 (Line Islands, earliest time zone on Earth)', url: 'https://en.wikipedia.org/wiki/UTC%2B14:00' },
        { label: 'Wikipedia, Kiribati (1995 date line move)', url: 'https://en.wikipedia.org/wiki/Kiribati' }
      ]
    },
    inputs: [
      { id: 'targetYear', label: 'New Year (target year)', type: 'number', placeholder: '2027', defaultValue: 2027, step: 1, min: 1900 },
      { id: 'utcOffsetHours', label: 'Your UTC offset (hours, e.g. -5 for US Eastern)', type: 'number', placeholder: '-5', defaultValue: -5, step: 0.5, min: -12 }
    ],
    seo: {
      title: "New Year's Countdown Calculator – Days & Time Zones",
      description: 'Count the days, hours and minutes until January 1, plus how many hours after Kiribati -- the first place on Earth to reach New Year.',
      faq: [
        { question: "How many days until New Year's?", answer: "This calculator measures the exact gap from right now to your own local midnight on January 1, shown as days, hours and minutes." },
        { question: 'What is the first place on Earth to reach the New Year?', answer: "The Line Islands of Kiribati, which use UTC+14:00 -- the largest standard time zone offset in use anywhere, making them the first inhabited place to reach any new calendar date, New Year's included." },
        { question: 'Why does Kiribati use UTC+14?', answer: "Kiribati's government moved the international date line east in 1995 so the whole country, including the Line Islands, would share one side of the date line and one business week -- and, deliberately, so Kiribati would be first to the year 2000." },
        { question: 'How many hours after Kiribati does US Eastern time reach the New Year?', answer: '19 hours -- US Eastern Standard Time is UTC-5, and 14 - (-5) = 19.' },
        { question: 'Does this calculator account for daylight saving time?', answer: 'No -- enter the UTC offset that actually applies to your location on January 1 itself. Most daylight-saving regions are back on standard time by then.' },
        { question: "Is this the same as a live world clock?", answer: 'No. It compares fixed UTC offsets rather than two live clocks side by side. For comparing specific cities in real time, use a dedicated time zone converter instead.' }
      ]
    },
    compute(values) {
      const targetYear = Math.round(values.targetYear);
      const utcOffsetHours = values.utcOffsetHours;
      if (!Number.isFinite(targetYear) || !Number.isFinite(utcOffsetHours)) {
        return { daysLeft: NaN, hoursLeft: NaN, minutesLeft: NaN, hoursBehindKiribati: NaN };
      }
      const now = values.todayMs !== undefined ? new Date(values.todayMs) : new Date();
      const newYearMs = new Date(targetYear, 0, 1, 0, 0, 0).getTime();
      const diffMs = Math.max(0, newYearMs - now.getTime());
      const daysLeft = Math.floor(diffMs / 86400000);
      const hoursLeft = Math.floor((diffMs % 86400000) / 3600000);
      const minutesLeft = Math.floor((diffMs % 3600000) / 60000);
      const hoursBehindKiribati = 14 - utcOffsetHours;
      return { daysLeft, hoursLeft, minutesLeft, hoursBehindKiribati };
    }
  },
  {
    id: 'screen-size-calculator',
    category: 'fun',
    glyph: 'TV',
    updatedAt: '2026-11-18',
    aliases: ['screen size calculator', 'tv size calculator', 'monitor size calculator', 'screen dimensions calculator', 'pixel density calculator', 'ppi calculator'],
    related: ['aspect-ratio-calculator', 'length-converter', 'area-converter', 'centimeters-to-inches-converter'],
    title: 'Screen Size Calculator',
    description: 'Turn a TV or monitor\'s advertised diagonal size and aspect ratio into its actual width, height, screen area, and pixel density (PPI) for a given resolution.',
    example: 'A 55-inch 16:9 TV at 3840×2160 (4K UHD) is about 47.9 in wide by 27.0 in tall, with a pixel density of roughly 80 PPI.',
    breakdown: {
      headline: 'widthIn',
      headlineLabel: 'Screen width',
      outputs: [
        { id: 'widthIn', label: 'Width', dimension: 'length', unit: 'in' },
        { id: 'heightIn', label: 'Height', dimension: 'length', unit: 'in' },
        { id: 'areaSqIn', label: 'Screen area', dimension: 'area', unit: 'in2' },
        { id: 'ppi', label: 'Pixel density (PPI)', format: 'number' }
      ],
      groups: [
        { title: 'Screen size', inputs: ['diagonalIn', 'aspectRatio'] },
        { title: 'Resolution', inputs: ['resWidth', 'resHeight'] }
      ],
      visual: { type: 'compareBars', bars: [{ from: 'widthIn', label: 'Width' }, { from: 'heightIn', label: 'Height' }], title: 'Width vs. height', highlight: 0 }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What a diagonal screen size actually measures',
        paragraphs: [
          'A TV or monitor\'s advertised size -- "55-inch", "27-inch" -- is always the diagonal of the viewable screen, corner to corner, never the width or the height on its own. Two screens with the same diagonal can still look different sizes side by side, because the diagonal alone does not fix the width and height individually -- that also depends on the aspect ratio, the proportion between width and height (expressed as two numbers, like 16:9).',
          "Width and height come from the diagonal and the aspect ratio through the Pythagorean theorem: a rectangle's diagonal is the hypotenuse of a right triangle whose legs are its width and height, so diagonal² = width² + height². Knowing the ratio between width and height turns that one equation into two -- it fixes a single width and height, not just their relationship.",
          "Pixel density -- pixels per inch, PPI -- is a separate figure: how tightly packed the screen's pixels are, found the same Pythagorean way but with pixels instead of inches. A phone screen with a modest diagonal but a huge resolution packs far more pixels into each inch than a TV with the same resolution stretched over a much bigger diagonal, which is why PPI, not resolution alone, is what determines how sharp text and images look up close."
        ]
      },
      howTo: {
        intro: 'Enter the diagonal size, pick the aspect ratio, and enter the resolution to get the actual width, height, area, and pixel density.',
        steps: [
          { name: 'Enter the diagonal size', text: 'The size printed on the box or spec sheet -- always the corner-to-corner diagonal, in inches.' },
          { name: 'Pick the aspect ratio', text: 'Most TVs, laptops, and monitors today are 16:9. Pick the one that matches your screen, or the closest available option.' },
          { name: 'Enter the resolution', text: 'The horizontal and vertical pixel counts from the spec sheet, e.g. 3840 × 2160 for 4K UHD.' },
          { name: 'Read the results', text: 'Width, height, and screen area come from the diagonal and aspect ratio; pixel density (PPI) comes from the resolution and diagonal together.' }
        ],
        outro: 'Everything is calculated in your browser from the Pythagorean formulas below. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Width and height split a known diagonal using the aspect ratio; PPI applies the same Pythagorean idea to pixels instead of inches.',
        expression:
          'hyp = √(ratioW² + ratioH²)\nwidth = diagonal × ratioW ÷ hyp\nheight = diagonal × ratioH ÷ hyp\narea = width × height\nPPI = √(resW² + resH²) ÷ diagonal',
        terms: [
          { symbol: 'diagonal', meaning: "The screen's advertised corner-to-corner size, in inches." },
          { symbol: 'ratioW : ratioH', meaning: 'The aspect ratio\'s two numbers, e.g. 16 and 9 for a 16:9 screen.' },
          { symbol: 'resW, resH', meaning: 'The horizontal and vertical resolution, in pixels, from the spec sheet.' },
          { symbol: 'PPI', meaning: "Pixels per inch -- the diagonal pixel count (found the same Pythagorean way, from the resolution) divided by the diagonal size in inches." }
        ],
        note: 'This gives the viewable screen\'s own dimensions. It does not include the bezel (frame) around the screen, so a monitor\'s total footprint is slightly larger on every side.'
      },
      workedExample: {
        intro: 'A 55-inch TV with a 16:9 aspect ratio and a 3840×2160 (4K UHD) resolution.',
        rows: [
          { label: 'hyp = √(16² + 9²)', value: '√337 ≈ 18.3576' },
          { label: 'width = 55 × 16 ÷ 18.3576', value: '≈ 47.94 in' },
          { label: 'height = 55 × 9 ÷ 18.3576', value: '≈ 26.96 in' },
          { label: 'area = 47.94 × 26.96', value: '≈ 1,293 in²' },
          { label: 'diagonal pixels = √(3840² + 2160²)', value: '≈ 4,405.8 px' },
          { label: 'PPI = 4,405.8 ÷ 55', value: '≈ 80.1' }
        ],
        result: '≈ 47.9 in × 27.0 in, 1,293 in² of screen, about 80.1 PPI',
        explanation: 'The 16:9 ratio splits the 55-inch diagonal into a width and height whose ratio is exactly 16:9 and whose Pythagorean sum matches 55 inches. The resolution is fixed by the panel regardless of screen size, so dividing the (much larger) diagonal pixel count by the (much smaller) diagonal in inches gives a PPI far lower than, say, a phone\'s.'
      },
      watchOut: [
        { title: 'The diagonal is the viewable screen only', body: 'It does not include the bezel around the panel, so the physical product -- and the wall space or desk space it needs -- is a little larger on every side than the width and height calculated here.' },
        { title: 'The aspect ratio must match the real screen', body: 'Picking the wrong ratio (e.g. 16:9 for an older 4:3 monitor) gives a width and height that are both wrong, even though the diagonal you entered was correct -- the diagonal alone does not determine the ratio.' },
        { title: 'PPI is not the same as DPI', body: 'PPI (pixels per inch) describes a display\'s pixel density. DPI (dots per inch) describes a printer\'s dot density. The two measure physically different things and are not interchangeable, even though both are sometimes used loosely in casual conversation.' },
        { title: 'Advertised sizes are sometimes rounded', body: 'A screen advertised as "27-inch" is occasionally closer to 27.0 or 27.3 inches once actually measured, depending on the manufacturer\'s rounding convention -- small enough to rarely matter, but it means these results are only as accurate as the diagonal you enter.' }
      ],
      references: [
        { label: 'Wikipedia, Pixel density (PPI formula: diagonal resolution via the Pythagorean theorem, divided by diagonal size)', url: 'https://en.wikipedia.org/wiki/Pixel_density' },
        { label: 'Wikipedia, Aspect ratio (image) (common display and image aspect ratios)', url: 'https://en.wikipedia.org/wiki/Aspect_ratio_(image)' }
      ]
    },
    inputs: [
      { id: 'diagonalIn', label: 'Screen diagonal size (in)', type: 'number', placeholder: '55', defaultValue: 55, step: 0.1, min: 1 },
      {
        id: 'aspectRatio',
        label: 'Aspect ratio',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: ASPECT_RATIOS.map((r) => ({ value: r.value, label: r.label }))
      },
      { id: 'resWidth', label: 'Horizontal resolution (px)', type: 'number', placeholder: '3840', defaultValue: 3840, step: 1, min: 1 },
      { id: 'resHeight', label: 'Vertical resolution (px)', type: 'number', placeholder: '2160', defaultValue: 2160, step: 1, min: 1 }
    ],
    seo: {
      title: 'Screen Size Calculator – TV/Monitor Width, Height & PPI',
      description: 'Convert a TV or monitor\'s diagonal size and aspect ratio into its actual width, height, and screen area, plus pixel density (PPI) for any resolution.',
      faq: [
        { question: 'How do I calculate screen width and height from the diagonal?', answer: 'Split the diagonal using the aspect ratio and the Pythagorean theorem: width = diagonal × ratioW ÷ √(ratioW² + ratioH²), and height the same way with ratioH. A 55-inch 16:9 screen works out to about 47.9 in wide by 27.0 in tall.' },
        { question: 'What does PPI mean?', answer: 'Pixels per inch -- how densely packed a screen\'s pixels are. It is the diagonal pixel count (√(horizontal² + vertical²)) divided by the diagonal size in inches. A 55-inch 4K (3840×2160) TV works out to about 80.1 PPI.' },
        { question: 'Why do a 24-inch and a 27-inch monitor at the same resolution look different?', answer: 'Spreading the same pixel count over a larger diagonal lowers the pixel density. A 24-inch 1920×1080 monitor is about 91.8 PPI, while a 27-inch monitor at the sharper 2560×1440 resolution is about 108.8 PPI -- denser despite the larger screen, because the resolution increased more than the size did.' },
        { question: 'Is the diagonal size the same as the screen\'s actual width or height?', answer: 'No. The diagonal is the corner-to-corner measurement, always longer than either the width or the height on its own. A 55-inch 16:9 screen is about 47.9 inches wide and 27.0 inches tall -- neither one is 55 inches.' },
        { question: 'Does the diagonal measurement include the bezel?', answer: 'No -- it is the viewable screen only, not the frame (bezel) around it. The physical product is slightly larger on every side than the width and height this calculator gives.' },
        { question: 'What aspect ratio do most TVs and monitors use?', answer: '16:9 is standard for the large majority of TVs, laptops, and monitors sold today. Older TVs and monitors used 4:3, and some ultrawide monitors use 21:9.' },
        { question: 'Is PPI the same as DPI?', answer: 'No. PPI (pixels per inch) describes a screen\'s pixel density; DPI (dots per inch) describes a printer\'s dot density. They measure different things, even though the terms are sometimes used loosely as if interchangeable.' }
      ]
    },
    compute(values) {
      const diagonalIn = values.diagonalIn;
      const resWidth = values.resWidth;
      const resHeight = values.resHeight;
      const ratio = ASPECT_RATIOS.find((r) => r.value === Math.round(values.aspectRatio)) ?? ASPECT_RATIOS[0];
      if (!Number.isFinite(diagonalIn) || diagonalIn <= 0 || !Number.isFinite(resWidth) || !Number.isFinite(resHeight)) {
        return { widthIn: NaN, heightIn: NaN, areaSqIn: NaN, ppi: NaN };
      }
      const hyp = Math.sqrt(ratio.w * ratio.w + ratio.h * ratio.h);
      const widthIn = (diagonalIn * ratio.w) / hyp;
      const heightIn = (diagonalIn * ratio.h) / hyp;
      const areaSqIn = widthIn * heightIn;
      const diagPx = Math.sqrt(resWidth * resWidth + resHeight * resHeight);
      const ppi = diagPx / diagonalIn;
      return { widthIn, heightIn, areaSqIn, ppi };
    }
  },
  {
    id: 'aspect-ratio-calculator',
    category: 'fun',
    glyph: 'w:h',
    updatedAt: '2026-11-18',
    aliases: ['aspect ratio calculator', 'ratio calculator for photos', '16:9 calculator', 'image crop ratio calculator', 'video aspect ratio calculator', 'width height ratio calculator'],
    related: ['screen-size-calculator', 'length-converter', 'area-converter', 'centimeters-to-inches-converter'],
    title: 'Aspect Ratio Calculator',
    description: 'Enter one width or height and a target ratio -- 16:9, 4:3, 21:9, 3:2, or any custom ratio -- and solve for the other dimension, for screens, photos, or video crops.',
    example: 'Cropping a photo to a 3:2 ratio at 24 inches wide needs a height of exactly 16 inches.',
    solver: {
      defaultTarget: 'height',
      variables: [
        { id: 'width', label: 'Width', symbol: 'w', dimension: 'length', defaultValue: 24, defaultUnit: 'in' },
        { id: 'height', label: 'Height', symbol: 'h', dimension: 'length', defaultValue: 16, defaultUnit: 'in' },
        { id: 'ratioW', label: 'Ratio width part', symbol: 'rW', dimension: 'count', defaultValue: 3, defaultUnit: 'count', fixed: true },
        { id: 'ratioH', label: 'Ratio height part', symbol: 'rH', dimension: 'count', defaultValue: 2, defaultUnit: 'count', fixed: true }
      ],
      solve: {
        height: ({ width, ratioW, ratioH }) => (ratioW === 0 ? NaN : (width * ratioH) / ratioW),
        width: ({ height, ratioW, ratioH }) => (ratioH === 0 ? NaN : (height * ratioW) / ratioH)
      },
      outputs: [{ id: 'areaOutput', label: 'Area', dimension: 'area', unit: 'in2', compute: (si) => si.width * si.height }],
      visuals: [{ type: 'compareBars', bars: [{ from: 'width', label: 'Width' }, { from: 'height', label: 'Height' }], title: 'Width vs. height' }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What an aspect ratio is',
        paragraphs: [
          'An aspect ratio is the proportion between a rectangle\'s width and height, written as two numbers separated by a colon -- width first, height second. 16:9 means the width is 16 units for every 9 units of height, at any size: a 1920×1080 image and a 160×90 thumbnail are both exactly 16:9.',
          'Screens, photos, and video all settle on a small set of common ratios -- 16:9 for most TVs and monitors, 4:3 for older screens, 3:2 for many camera sensors and tablets, 21:9 for ultrawide monitors, 1:1 for a square crop -- but any two positive numbers define a valid ratio, including ones a camera or display manufacturer never used.',
          'Given one dimension and a ratio, the other dimension follows directly: multiply or divide by the ratio\'s two numbers. This calculator does that in either direction -- enter a width to get the matching height, or a height to get the matching width.'
        ]
      },
      howTo: {
        intro: 'Enter the ratio\'s two numbers, then the one dimension you know; the calculator fills in the other.',
        steps: [
          { name: 'Enter the ratio', text: 'The two numbers of your target ratio, e.g. 16 and 9 for 16:9, or 3 and 2 for 3:2. These two fields are always inputs, never calculated.' },
          { name: 'Enter the dimension you know', text: 'Type your known width or height. The other one, marked auto, fills in as you type.' },
          { name: 'Switch which one is calculated', text: 'To solve for the other dimension instead, type into the auto field -- it becomes an input, and the one you left alone longest becomes the new calculated field.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 24 in becomes 61.0 cm instead of silently turning into 24 cm.' },
          { name: 'Read the area and share', text: 'The area of the resulting rectangle appears underneath. Share result copies a link with your exact values.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Rearranging "width is to height as ratioW is to ratioH" gives a formula for whichever dimension you need.',
        expression: 'height = width × (ratioH ÷ ratioW)\nwidth = height × (ratioW ÷ ratioH)',
        terms: [
          { symbol: 'width, height', meaning: 'The rectangle\'s two dimensions, in whatever length unit you choose -- inches, centimeters, or pixels treated as a plain number.' },
          { symbol: 'ratioW : ratioH', meaning: 'Your target ratio\'s two numbers -- the width part first, then the height part, e.g. 16 and 9 for 16:9.' }
        ],
        note: 'Common ratios: 16:9 and 16:10 (most screens), 4:3 (older screens), 3:2 (many camera sensors), 21:9 (ultrawide monitors), 1:1 (square). Any two positive numbers work as a custom ratio.'
      },
      workedExample: {
        intro: 'Cropping a 24-inch-wide photo to a 3:2 ratio -- what height keeps that exact proportion?',
        rows: [
          { label: 'Width', value: '24 in' },
          { label: 'Ratio', value: '3 : 2' },
          { label: 'height = 24 × (2 ÷ 3)', value: '16 in' }
        ],
        result: 'height = 16 in (area = 384 in²)',
        explanation: '24 ÷ 3 = 8, and 8 × 2 = 16 -- the height that keeps width:height exactly equal to 3:2. Going the other direction from a 16-inch height recovers the original 24-inch width exactly: 16 × (3 ÷ 2) = 24.'
      },
      watchOut: [
        { title: 'Order matters: it is width:height, not height:width', body: 'Entering the ratio backwards (9 and 16 instead of 16 and 9) swaps which dimension comes out larger -- always enter the width number first, then the height number, matching how the ratio is written.' },
        { title: '"21:9" ultrawide monitors are not always a mathematically exact 21:9', body: 'A common ultrawide resolution, 3440×1440, has an actual ratio of 3440 ÷ 1440 ≈ 2.389 -- not 21 ÷ 9 ≈ 2.333. "21:9" is the marketing name for this class of ultrawide screen; its real proportion is closer to the 2.39:1 cinema standard. Enter a screen\'s own resolution as the ratio for an exact result, rather than assuming the marketing name is exact.' },
        { title: 'This calculator does not know the diagonal size', body: 'It only relates width and height to each other, not to a screen\'s advertised diagonal measurement -- for a TV or monitor, use the companion screen size calculator instead, which also takes a diagonal size.' },
        { title: 'Real-world cuts are often rounded', body: 'A printed photo or cut material is usually trimmed to the nearest practical unit (e.g. the nearest 1/8 inch), so an exact mathematical result like 16.0000 in may come out very slightly different once physically cut.' }
      ],
      references: [
        { label: 'Wikipedia, Aspect ratio (image) (definition and common display/image ratios)', url: 'https://en.wikipedia.org/wiki/Aspect_ratio_(image)' }
      ]
    },
    inputs: [
      { id: 'width', label: 'Width (m)', type: 'number', placeholder: '0.6096', defaultValue: 0.6096, step: 0.001, min: 0 },
      { id: 'ratioW', label: 'Ratio width part', type: 'number', placeholder: '3', defaultValue: 3, step: 0.01, min: 0 },
      { id: 'ratioH', label: 'Ratio height part', type: 'number', placeholder: '2', defaultValue: 2, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Aspect Ratio Calculator – Solve Width or Height for Any Ratio',
      description: 'Enter one dimension and a ratio like 16:9, 4:3, 21:9 or 3:2, and solve for the other -- for screens, photo crops, or video, with any custom ratio too.',
      faq: [
        { question: 'How do I calculate height from width and an aspect ratio?', answer: 'Multiply the width by (ratioH ÷ ratioW). At a 16:9 ratio, a 1920-wide image needs a height of 1920 × (9 ÷ 16) = 1,080.' },
        { question: 'How do I calculate width from height and an aspect ratio?', answer: 'Multiply the height by (ratioW ÷ ratioH). At a 4:3 ratio, a 768-tall image needs a width of 768 × (4 ÷ 3) = 1,024.' },
        { question: 'What is a 3:2 aspect ratio in inches?', answer: 'Any width and height whose ratio is exactly 3:2 -- for example 24 in × 16 in, or 6 in × 4 in. A 24-inch-wide photo cropped to 3:2 needs a height of 16 inches.' },
        { question: 'Is a 3440×1440 ultrawide monitor exactly 21:9?', answer: 'Not quite. 3440 ÷ 1440 ≈ 2.389, while an exact 21:9 ratio is 21 ÷ 9 ≈ 2.333. "21:9" is the marketing name for this class of ultrawide monitor; its true proportion is closer to the 2.39:1 cinema standard.' },
        { question: 'What is the difference between 16:9 and 16:10?', answer: 'Both share the same width number, but 16:10 is relatively taller -- at the same width, a 16:10 rectangle is 10% taller than a 16:9 one (height = width × 10/16 versus width × 9/16).' },
        { question: 'Can I use a custom aspect ratio that isn\'t a standard screen size?', answer: 'Yes -- enter any two positive numbers as the ratio. The formula works the same way whether the ratio is a common one like 16:9 or a custom crop ratio you choose yourself.' }
      ]
    },
    compute(values) {
      if (values.ratioW === 0) return { height: NaN };
      return { height: (values.width * values.ratioH) / values.ratioW };
    }
  },
];
