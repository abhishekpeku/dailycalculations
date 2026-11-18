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
  }
];
