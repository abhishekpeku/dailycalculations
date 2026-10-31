import type { CalculatorConfig } from './types.ts';

// Greatest common factor, used to simplify fractions and ratios. Always a positive integer (or 1
// for 0/0, since there is no meaningful factor to divide by).
function gcd(x: number, y: number) {
  let a = Math.abs(Math.round(x));
  let b = Math.abs(Math.round(y));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

// The actual greatest common factor, for gcf-calculator only: no "|| 1" fallback, so gcd(0, 0) is 0,
// the standard number-theory convention (see gcf-calculator's references) — fraction/ratio
// simplification need the `|| 1` safety above instead, so `gcd()` itself is left untouched here.
function gcdRaw(x: number, y: number) {
  let a = Math.abs(Math.round(x));
  let b = Math.abs(Math.round(y));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Least common multiple of two (rounded, absolute-valued) integers, for lcm-calculator. Reuses
// gcdRaw (no "|| 1" fallback). By a common convention, lcm(a, 0) = 0 for any nonzero a (0 is the
// only common multiple of a and 0) — see lcm-calculator's references — but lcm(0, 0) stays
// undefined, since no POSITIVE common multiple of 0 and 0 exists at all (0 is the only multiple of
// 0, and 0 does not count as "positive"). This is why the all-zero case returns NaN instead of 0.
function lcmPair(x: number, y: number) {
  const a = Math.abs(Math.round(x));
  const b = Math.abs(Math.round(y));
  // An input that is already beyond Number.MAX_SAFE_INTEGER (2^53 - 1) lost precision before this
  // function ever saw it, so refuse rather than silently compute on an already-wrong number.
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) return NaN;
  if (a === 0 && b === 0) return NaN;
  if (a === 0 || b === 0) return 0;
  // Divide before multiplying (a ÷ gcd is always an exact integer) to keep the intermediate value
  // as small as possible, then refuse the result itself if it still overflows 2^53 — e.g. the LCM
  // of four large, pairwise-coprime primes can exceed 2^53 even though every input is tiny by
  // comparison, since gcd(a,b)=1 leaves nothing to divide out before the multiplication.
  const result = (a / gcdRaw(a, b)) * b;
  return Number.isSafeInteger(result) ? result : NaN;
}

// Normalizes a coefficient/exponent pair to standard scientific notation (1 <= |a| < 10, or a = 0).
function normalizeScientific(a: number, b: number): [number, number] {
  if (a === 0) return [0, 0];
  let aa = a;
  let bb = b;
  while (Math.abs(aa) >= 10) {
    aa /= 10;
    bb += 1;
  }
  while (Math.abs(aa) < 1) {
    aa *= 10;
    bb -= 1;
  }
  aa = Number(aa.toPrecision(12)); // clear drift from repeated multiplication/division
  if (Math.abs(aa) >= 10) {
    aa /= 10;
    bb += 1;
  }
  return [aa, bb];
}

// Plain decimal -> [coefficient, exponent] in standard scientific notation.
function toScientific(x: number): [number, number] {
  if (x === 0) return [0, 0];
  const exp = Math.floor(Math.log10(Math.abs(x)));
  const coeff = x / 10 ** exp;
  return normalizeScientific(coeff, exp);
}

// Shifts the decimal point `shift` places via exponential-notation text, not multiplication, before
// rounding: this is what avoids IEEE 754 binary64 representation error (1.005 is actually stored as
// 1.00499999999999989...) by relying on JS's shortest-round-trip number-to-string conversion to
// recover the intended decimal, then re-parsing it correctly rounded at the shifted scale.
function shiftRound(value: number, shift: number, tie: (x: number) => number) {
  const [coeff, exp] = `${value}e`.split('e');
  const shifted = Number(`${coeff}e${Number(exp || 0) + shift}`);
  const roundedShifted = tie(shifted);
  const [coeff2, exp2] = `${roundedShifted}e`.split('e');
  return Number(`${coeff2}e${Number(exp2 || 0) - shift}`);
}

// Ties away from zero: 2.5 -> 3, -2.5 -> -3. IEEE 754-2019's roundTiesToAway attribute.
function roundHalfAwayFromZero(x: number) {
  return x >= 0 ? Math.floor(x + 0.5) : Math.ceil(x - 0.5);
}

// Ties to the nearest even integer ("banker's rounding"): 2.5 -> 2, 3.5 -> 4, -2.5 -> -2. IEEE
// 754-2019's default roundTiesToEven attribute, used because it has no net upward or downward bias
// across many roundings.
function roundHalfToEven(x: number) {
  const floor = Math.floor(x);
  const diff = x - floor;
  if (Math.abs(diff - 0.5) < 1e-9) return floor % 2 === 0 ? floor : floor + 1;
  return Math.round(x);
}

export const mathCalculators: CalculatorConfig[] = [
  {
    id: 'percentage-calculator',
    category: 'math',
    glyph: '%',
    updatedAt: '2026-10-21',
    aliases: ['percent of a number calculator', 'what percent is x of y calculator', 'increase or decrease by percent calculator', 'percent calculator', 'basic percentage calculator'],
    related: ['percent-change-calculator', 'percent-difference-calculator', 'discount-calculator', 'sales-tax-calculator'],
    title: 'Percentage Calculator',
    description: 'Work out X% of Y, what percent X is of Y, the percent change between two numbers, or increase/decrease a number by a percentage — four everyday percent problems on one page.',
    example: '20% of 150 is 30. Switch modes on the same two numbers to ask "what percent is 20 of 150?" (13.33%) or "increase 150 by 20%" (180).',
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is a percentage?',
        paragraphs: [
          "A percentage is a way of writing a fraction out of 100. \"Percent\" comes from the Latin per centum, \"per hundred,\" so 20% literally means 20 out of every 100 — the fraction 20/100, or the decimal 0.20. Percentages let you compare proportions of very different sizes on the same scale: a 20% tip on a $40 meal and a 20% raise on a $60,000 salary describe the same relative size of change, even though the dollar amounts are nothing alike.",
          'Most percentage questions boil down to one of four everyday problems: finding a percentage OF a number (a 20% tip on $40), finding what percentage one number IS of another (20 is what percent of 150?), finding the percent change between two numbers (a price that moved from $150 to $180), or adjusting a number up or down by a percentage (increase $150 by 20%). This calculator covers all four — pick the mode that matches your question, and the same two fields work for each.',
          'Every mode reduces to the same relationship: percent = part ÷ whole × 100. Which number is the "part" and which is the "whole" changes with the question, which is exactly why a plain "20 and 150" can mean four different things depending on what you are asking.'
        ]
      },
      howTo: {
        intro: 'Pick the mode that matches your question, then type the two numbers it needs. The result updates as you type.',
        steps: [
          { name: 'Choose a mode', text: 'The four modes cover the questions people actually ask: a percentage of a number, what percent one number is of another, the percent change between two numbers, and increasing or decreasing a number by a percent.' },
          { name: 'Enter X and Y', text: 'What X and Y mean changes with the mode: in "X% of Y," X is the percent and Y is the whole; in "percent change from X to Y," X is the starting value and Y is the ending value.' },
          { name: 'Set a direction for mode 4', text: '"Increase or decrease Y by X%" needs one more choice, tucked under "More options": whether X% is added to Y or taken away from it.' },
          { name: 'Read the result', text: 'The result is a plain number. In modes 1 and 4 it is an amount in the same units as Y; in modes 2 and 3 it is itself a percentage.' },
          { name: 'Compare the two values', text: 'The chart below the result always shows X and Y side by side, so you can see which one is bigger regardless of which mode you picked.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'All four modes come from one relationship: a percent is a part divided by a whole, times 100. Each mode just picks a different part and whole.',
        expression: 'X% of Y = (X ÷ 100) × Y\nX is what % of Y = (X ÷ Y) × 100\nPercent change from X to Y = ((Y − X) ÷ X) × 100\nY increased/decreased by X% = Y ± (X ÷ 100) × Y',
        terms: [
          { symbol: 'X', meaning: 'Depending on the mode: the percentage rate, the part being compared, or the starting value.' },
          { symbol: 'Y', meaning: 'Depending on the mode: the whole, the total being compared against, or the ending value.' },
          { symbol: '÷ 100', meaning: 'Converts a percent number (20) into the fraction or decimal it represents (0.20) before multiplying.' }
        ],
        note: 'The "percent change" mode only makes sense when X (the starting value) is not zero — dividing by zero is undefined, the same way 5 ÷ 0 is undefined.'
      },
      workedExample: {
        intro: 'Take the same two numbers, 20 and 150, through all four modes to see how the meaning changes.',
        rows: [
          { label: 'Mode 1 — 20% of 150', value: '(20 ÷ 100) × 150 = 30' },
          { label: 'Mode 2 — 20 is what % of 150?', value: '(20 ÷ 150) × 100 ≈ 13.33%' },
          { label: 'Mode 3 — percent change from 20 to 150', value: '((150 − 20) ÷ 20) × 100 = 650%' },
          { label: 'Mode 4 — increase 150 by 20%', value: '150 + (20 ÷ 100) × 150 = 180' }
        ],
        result: '30 · 13.33% · 650% · 180 — four different answers from the same two numbers',
        explanation: 'Notice how large the "percent change from 20 to 150" answer is: going from a small number to a much bigger one is always a large percent change, because the small starting value sits in the denominator. That is also why percent change is not symmetric — the percent change from 150 back down to 20 is only −86.67% ((20 − 150) ÷ 150 × 100), not −650%.'
      },
      watchOut: [
        { title: 'Percent change is not symmetric', body: 'Going from 20 to 150 is a 650% increase, but going back from 150 to 20 is only an 86.67% decrease, not −650%. Percent change is always relative to the starting value, and the two starting values here are different.' },
        { title: '"Percent of" is not the same as "percent change"', body: '20% of 150 (mode 1, giving 30) and a 20% increase on 150 (mode 4, giving 180) use the same percent but answer completely different questions. Make sure the mode matches what you are actually asking.' },
        { title: 'A share of a whole cannot exceed 100% the way growth can', body: 'A number can grow by more than 100% (tripling is a 200% increase), but a part can never be more than 100% of its own whole — if "X is what % of Y" gives something above 100%, X is simply bigger than Y.' },
        { title: 'Rounding changes the displayed answer', body: '13.33% is a rounded display of the repeating decimal 13.333…%. For financial or scientific use, carry extra decimal places before rounding a final answer.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §6.1 Understand Percent', url: 'https://openstax.org/books/prealgebra-2e/pages/6-1-understand-percent' },
        { label: 'OpenStax, Prealgebra 2e, §6.2 Solve General Applications of Percent', url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent' },
        { label: 'Wolfram MathWorld, Percent', url: 'https://mathworld.wolfram.com/Percent.html' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'What do you want to work out?',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'X% of Y' },
          { value: 2, label: 'X is what percent of Y?' },
          { value: 3, label: 'Percent change from X to Y' },
          { value: 4, label: 'Increase or decrease Y by X%' }
        ]
      },
      { id: 'x', label: 'X', type: 'number', placeholder: '20', defaultValue: 20, step: 1 },
      { id: 'y', label: 'Y', type: 'number', placeholder: '150', defaultValue: 150, step: 1 },
      {
        id: 'direction',
        label: 'Direction (mode 4 only)',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 2,
        min: -1,
        options: [
          { value: 1, label: 'Increase Y by X%' },
          { value: -1, label: 'Decrease Y by X%' }
        ]
      }
    ],
    breakdown: {
      headline: 'result',
      headlineLabel: 'Result',
      outputs: [{ id: 'result', label: 'Result', format: 'significant' }],
      groups: [{ inputs: ['mode', 'x', 'y'] }, { title: 'Only used for "increase or decrease" mode', inputs: ['direction'], optional: true }],
      visual: { type: 'compareBars', bars: [{ from: 'x', label: 'Value A (X)' }, { from: 'y', label: 'Value B (Y)' }], title: 'Your two values' }
    },
    seo: {
      title: 'Percentage Calculator – Percent Of, Change & Increase',
      description: 'Free percentage calculator: find X% of Y, what percent X is of Y, percent change between two numbers, or increase/decrease a number by a percent.',
      faq: [
        { question: 'How do I calculate a percentage of a number?', answer: 'Divide the percent by 100 and multiply by the number: X% of Y = (X ÷ 100) × Y. For example, 20% of 150 is (20 ÷ 100) × 150 = 30.' },
        { question: 'How do I find what percent one number is of another?', answer: 'Divide the part by the whole and multiply by 100: (X ÷ Y) × 100. 20 is (20 ÷ 150) × 100 ≈ 13.33% of 150.' },
        { question: 'How do I calculate percent change?', answer: 'Subtract the starting value from the ending value, divide by the starting value, and multiply by 100: ((new − old) ÷ old) × 100. From 20 to 150 that is 650%.' },
        { question: 'How do I increase or decrease a number by a percentage?', answer: 'Multiply the number by the percentage (divided by 100), then add the result to increase it or subtract it to decrease it. Increasing 150 by 20% gives 150 + 0.20 × 150 = 180; decreasing it by 20% gives 150 − 30 = 120.' },
        { question: 'Why is the percent change from 20 to 150 so much bigger than the change back from 150 to 20?', answer: 'Percent change is always measured against the starting value. 20 to 150 is measured against the small number 20 (a 650% increase); 150 to 20 is measured against the much larger 150 (only an 86.67% decrease).' },
        { question: 'What is 100% of a number?', answer: '100% of any number is the number itself, since (100 ÷ 100) × Y = Y.' },
        { question: 'Can a percentage be negative?', answer: 'Yes. A percent change is negative when the ending value is smaller than the starting value — the percent change from 150 to 20 is −86.67%, a decrease.' },
        { question: 'Why does "percent" mean "per hundred"?', answer: 'The word comes from the Latin per centum. Expressing any ratio out of 100 lets completely different quantities — a tip and a raise, a test score and a tax rate — be compared on the same scale.' }
      ]
    },
    compute(values) {
      const { mode, x, y, direction } = values;
      let result: number;
      if (mode === 2) result = y === 0 ? NaN : (x / y) * 100;
      else if (mode === 3) result = x === 0 ? NaN : ((y - x) / x) * 100;
      else if (mode === 4) result = y + (x / 100) * y * (direction || 1);
      else result = (x / 100) * y; // mode 1, and the safe fallback for any other value
      return { result };
    }
  },
  {
    id: 'percent-change-calculator',
    category: 'math',
    glyph: '%Δ',
    updatedAt: '2026-10-21',
    aliases: ['percent increase or decrease calculator', 'rate of change calculator', 'percent growth calculator', 'old value new value percent calculator'],
    related: ['percentage-calculator', 'percent-difference-calculator', 'salary-raise-calculator', 'inflation-calculator'],
    title: 'Percent Change Calculator',
    description: 'Find the percent increase or decrease between an old and a new value, or work backward to the new value or the original value from a percent change.',
    example: 'Going from 80 to 100 is a 25% increase — but going back from 100 to 80 is only a 20% decrease, not 25%.',
    solver: {
      defaultTarget: 'percentChange',
      variables: [
        { id: 'oldValue', label: 'Old (starting) value', symbol: 'A', dimension: 'count', defaultValue: 80, defaultUnit: 'count' },
        { id: 'newValue', label: 'New (ending) value', symbol: 'B', dimension: 'count', defaultValue: 100, defaultUnit: 'count' },
        { id: 'percentChange', label: 'Percent change', symbol: '%Δ', dimension: 'percent', defaultValue: 25, defaultUnit: '%' }
      ],
      solve: {
        newValue: ({ oldValue, percentChange }) => oldValue * (1 + percentChange / 100),
        oldValue: ({ newValue, percentChange }) => (1 + percentChange / 100 === 0 ? NaN : newValue / (1 + percentChange / 100)),
        percentChange: ({ oldValue, newValue }) => (oldValue === 0 ? NaN : ((newValue - oldValue) / oldValue) * 100)
      },
      outputs: [{ id: 'absoluteChange', label: 'Absolute change', dimension: 'count', compute: (si) => si.newValue - si.oldValue }],
      visuals: [{ type: 'compareBars', bars: [{ from: 'oldValue', label: 'Old value' }, { from: 'newValue', label: 'New value' }], title: 'Old vs new', highlight: 1 }]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is percent change?',
        paragraphs: [
          'Percent change measures how much a number has moved, relative to where it started. It is the standard way to describe growth or decline — a stock price, a population, a utility bill — because it works the same whether the numbers involved are small or huge: a change from 4 to 5 and a change from 4 million to 5 million are both a 25% increase.',
          "The key feature of percent change is that it is always measured against the STARTING value, not the ending one. That single fact explains something people often find surprising: a big percent increase is not undone by the same-sized percent decrease, because the second move starts from a different number.",
          'This calculator solves the relationship in every direction. Give it the old and new values to find the percent change; give it the old value and a percent change to project the new value; or give it the new value and a percent change to work out what the old value must have been.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the three fields — old value, new value, percent change — and the third is calculated automatically.',
        steps: [
          { name: 'Find a percent change', text: 'Enter the old and new values. The percent change field, marked auto, fills in — positive for an increase, negative for a decrease.' },
          { name: 'Project a new value', text: 'Enter the old value and a percent change (use a negative number for a decrease) to see what the new value becomes.' },
          { name: 'Work backward to the old value', text: 'Enter the new value and a percent change to find the original value before that change happened.' },
          { name: 'Switch which field is calculated', text: 'Type into the auto field and it becomes an input; the field you left alone the longest becomes the calculated one instead.' },
          { name: 'Compare the two values', text: 'The bar chart shows the old and new values side by side, so the size of the move is visible, not just the percentage.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'One relationship connects all three quantities. Rearranging it gives a formula for each.',
        expression: '%Δ = ((B − A) ÷ A) × 100\nB = A × (1 + %Δ ÷ 100)\nA = B ÷ (1 + %Δ ÷ 100)',
        terms: [
          { symbol: 'A', meaning: 'The old (starting) value.' },
          { symbol: 'B', meaning: 'The new (ending) value.' },
          { symbol: '%Δ', meaning: 'The percent change: positive for an increase, negative for a decrease.' }
        ],
        note: 'Percent change needs a nonzero starting value — dividing by an old value of zero has no defined answer, the same as any division by zero.'
      },
      workedExample: {
        intro: 'A town had 80,000 residents at one census and 100,000 at the next. What was the percent change, and how big was the move in people?',
        rows: [
          { label: 'Change (B − A)', value: '100,000 − 80,000 = 20,000' },
          { label: 'Percent change ((B − A) ÷ A × 100)', value: '(20,000 ÷ 80,000) × 100 = 25%' }
        ],
        result: '%Δ = 25% · absolute change = 20,000',
        explanation: 'The population grew by a quarter. If it later fell back from 100,000 to 80,000, that would be a decrease of (20,000 ÷ 100,000) × 100 = 20%, not 25% — the same 20,000-person move is a smaller share of the larger starting number.'
      },
      watchOut: [
        { title: 'Percent change is not reversible by the same percentage', body: 'A 25% increase from 80 to 100 is undone by a 20% decrease, not a 25% decrease, because the second move starts from the larger number, 100.' },
        { title: 'Zero as a starting value has no percent change', body: 'If the old value is zero, any nonzero new value is technically an infinite percent increase. This calculator returns no answer for that case rather than a meaningless number.' },
        { title: 'Percent change vs. percentage points', body: 'If a tax rate moves from 5% to 7%, that is a 2 percentage-point increase, but a 40% percent change ((7 − 5) ÷ 5 × 100). The two phrases describe different things and are often mixed up in news reporting.' },
        { title: 'A quantity that cannot go negative bottoms out at −100%', body: 'A population or a price cannot fall below zero, so the most negative percent change it can ever show is −100% (hitting zero). Quantities that can go negative themselves, like profit, have no such floor.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §6.2 Solve General Applications of Percent', url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent' },
        { label: 'Wolfram MathWorld, Percent', url: 'https://mathworld.wolfram.com/Percent.html' }
      ]
    },
    inputs: [
      { id: 'oldValue', label: 'Old (starting) value', type: 'number', placeholder: '80', defaultValue: 80, step: 1 },
      { id: 'newValue', label: 'New (ending) value', type: 'number', placeholder: '100', defaultValue: 100, step: 1 }
    ],
    seo: {
      title: 'Percent Change Calculator – Percent Increase or Decrease',
      description: 'Free percent change calculator. Find the percent increase or decrease between two values, or solve for the new value or the original value.',
      faq: [
        { question: 'How do I calculate percent change?', answer: 'Subtract the old value from the new value, divide by the old value, and multiply by 100: ((new − old) ÷ old) × 100. Going from 80 to 100 is (20 ÷ 80) × 100 = 25%.' },
        { question: 'How is percent change different from percent difference?', answer: 'Percent change has a direction (old to new) and divides by the OLD value. Percent difference, a separate calculator, is symmetric and divides by the average of the two values, for comparisons with no clear "before."' },
        { question: 'What does a negative percent change mean?', answer: 'The new value is smaller than the old one. Going from 100 to 80 is a −20% change: (80 − 100) ÷ 100 × 100 = −20%.' },
        { question: 'How do I find the new value from a percent change?', answer: 'Multiply the old value by (1 + percent ÷ 100). 80 increased by 25% is 80 × 1.25 = 100.' },
        { question: 'How do I find the original value from a percent change?', answer: 'Divide the new value by (1 + percent ÷ 100). 100 after a 25% increase came from 100 ÷ 1.25 = 80.' },
        { question: 'Why is going up 25% and back down 25% not a round trip?', answer: 'Because the second 25% is taken from a different, larger number. 100 decreased by 25% is 75, not back to 80.' },
        { question: 'What is percent change used for?', answer: 'Describing growth or decline in prices, populations, wages and investments — anywhere two values are compared across time.' },
        { question: 'Can percent change be more than 100%?', answer: 'Yes, whenever a value more than doubles. Tripling a value is a 200% increase, since (3x − x) ÷ x × 100 = 200%.' }
      ]
    },
    compute(values) {
      const percentChange = values.oldValue === 0 ? NaN : ((values.newValue - values.oldValue) / values.oldValue) * 100;
      const absoluteChange = values.newValue - values.oldValue;
      return { percentChange, absoluteChange };
    }
  },
  {
    id: 'percent-difference-calculator',
    category: 'math',
    glyph: 'Δ%',
    updatedAt: '2026-10-21',
    aliases: ['percent difference between two numbers calculator', 'relative difference calculator', 'percent variance calculator', 'compare two numbers percentage calculator'],
    related: ['percent-change-calculator', 'percentage-calculator', 'unit-price-calculator', 'ratio-calculator'],
    title: 'Percent Difference Calculator',
    description: 'Compare two values with no "before" or "after" — percent difference measures how far apart two numbers are relative to their average, the way scientists compare two measurements.',
    example: 'Two scales both weigh the same object: one reads 40 g, the other 60 g. Their average is 50 g and they differ by 20 g, a percent difference of 40%.',
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is percent difference?',
        paragraphs: [
          'Percent difference compares two values that are both just measurements or estimates, with neither one singled out as the "correct" or "original" one. It answers "how far apart are these two numbers, relative to their size?" rather than "how much did this grow?" — that second question is percent change, a different calculator, because it needs a clear starting point.',
          'Because neither value is privileged, percent difference divides the gap between them by their AVERAGE, not by either value alone. That makes it symmetric: swapping which number you call "A" and which you call "B" gives exactly the same answer, which is not true of percent change.',
          'Percent difference shows up most often in science and engineering, where two instruments, two trials, or two methods produce slightly different readings for the same real quantity and neither is "ground truth." It is closely related to percent error, used instead when one of the two numbers IS a known, accepted true value — percent error divides by that true value, not by an average.'
        ]
      },
      howTo: {
        intro: 'Enter the two values being compared. Which one you type first makes no difference to the result.',
        steps: [
          { name: 'Enter both values', text: 'Type the two numbers you want to compare — two measurements, two estimates, or any pair with no clear "before."' },
          { name: 'Read the percent difference', text: 'The headline shows how far apart they are as a percentage of their average.' },
          { name: 'Check the absolute difference', text: 'The breakdown also shows the plain gap between the two numbers, and their average, in case you need those directly.' },
          { name: 'Compare with percent change instead, if needed', text: 'If one of your two numbers is clearly the "before" and the other the "after," the percent change calculator answers a related but different question.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Percent difference divides the absolute gap between two values by their average.',
        expression: 'Percent difference = (|A − B| ÷ ((A + B) ÷ 2)) × 100',
        terms: [
          { symbol: 'A, B', meaning: 'The two values being compared. Order does not matter.' },
          { symbol: '|A − B|', meaning: 'The absolute (always positive) difference between them.' },
          { symbol: '(A + B) ÷ 2', meaning: 'Their average, used as the reference point instead of either value alone.' }
        ],
        note: 'This is a measure of relative difference, not a statement about which value is correct. Use percent error instead when one value is a known, accepted reference.'
      },
      workedExample: {
        intro: 'Two kitchen scales weigh the same bag of flour. Scale 1 reads 40 g; scale 2 reads 60 g. How far apart are the readings, relative to their size?',
        rows: [
          { label: 'Absolute difference (|40 − 60|)', value: '20 g' },
          { label: 'Average ((40 + 60) ÷ 2)', value: '50 g' },
          { label: 'Percent difference (20 ÷ 50 × 100)', value: '40%' }
        ],
        result: '40% apart, relative to a 50 g average',
        explanation: 'Neither scale is assumed correct — percent difference just states how far apart two independent readings are. If one scale were a certified reference instead, the right tool would be percent error, dividing by that reference value (40 g) instead of the average: (20 ÷ 40) × 100 = 50%.'
      },
      watchOut: [
        { title: 'Needs a nonzero average', body: 'If both values are zero, their average is zero and the percent difference is undefined — there is no "size" to measure the gap against.' },
        { title: 'Not the same as percent error', body: 'Percent error divides by a known, accepted true value. Percent difference divides by the average of two values with no accepted "truth." Using the wrong one changes both the number and the claim you are making.' },
        { title: 'Always positive', body: 'Percent difference uses the absolute value of the gap, so it never reports a negative number or a direction — only how far apart, not which one is bigger.' },
        { title: 'Small numbers exaggerate the percentage', body: 'Two values of 1 and 3 differ by 100% even though the actual gap is just 2 units. Percent difference is a relative measure, so check the absolute difference alongside it.' }
      ],
      references: [
        { label: 'North Carolina State University / Advanced Instructional Systems, Percent Error and Percent Difference (physics lab manual)', url: 'https://www.webassign.net/question_assets/ncsucalcphysmechl3/percent_error/manual.html' },
        { label: 'OpenStax, Prealgebra 2e, §6.2 Solve General Applications of Percent', url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent' }
      ]
    },
    inputs: [
      { id: 'valueA', label: 'Value A', type: 'number', placeholder: '40', defaultValue: 40, step: 1 },
      { id: 'valueB', label: 'Value B', type: 'number', placeholder: '60', defaultValue: 60, step: 1 }
    ],
    breakdown: {
      headline: 'percentDifference',
      headlineLabel: 'Percent difference',
      outputs: [
        { id: 'percentDifference', label: 'Percent difference', format: 'percent' },
        { id: 'absoluteDifference', label: 'Absolute difference', format: 'number' },
        { id: 'average', label: 'Average of the two values', format: 'number' }
      ],
      groups: [{ inputs: ['valueA', 'valueB'] }],
      visual: { type: 'compareBars', bars: [{ from: 'valueA', label: 'Value A' }, { from: 'valueB', label: 'Value B' }], title: 'Value A vs Value B' }
    },
    seo: {
      title: 'Percent Difference Calculator – Compare Two Values',
      description: 'Free percent difference calculator. Compare two measurements or estimates with no "before" value, using the absolute difference over their average.',
      faq: [
        { question: 'How do I calculate percent difference?', answer: 'Take the absolute difference between the two values, divide by their average, and multiply by 100: |A − B| ÷ ((A + B) ÷ 2) × 100. For 40 and 60, that is 40%.' },
        { question: 'What is the difference between percent difference and percent error?', answer: 'Percent difference divides by the average of two values with no known truth. Percent error divides by a known, accepted value, measuring how far a result is from that reference.' },
        { question: 'What is the difference between percent difference and percent change?', answer: 'Percent change has a direction (old to new) and divides by the old value. Percent difference is symmetric — it divides by the average, so the order of the two numbers does not matter.' },
        { question: 'Can percent difference be negative?', answer: 'No. It is based on an absolute difference, so it is always zero or positive.' },
        { question: 'Why does percent difference use the average instead of one value?', answer: 'Because neither of the two values is treated as more correct than the other, the average is a neutral reference point for both.' },
        { question: 'When is percent difference used in science?', answer: 'When comparing two independent measurements or trials of the same quantity, such as two students’ lab results for the same experiment, with no accepted "true" value available.' },
        { question: 'What does a 0% percent difference mean?', answer: 'The two values are identical.' },
        { question: 'Does it matter which value is entered first?', answer: 'No. Percent difference uses the absolute difference and the average of both values, so entering 40 and 60 gives the same answer as entering 60 and 40.' }
      ]
    },
    compute(values) {
      const { valueA, valueB } = values;
      const absoluteDifference = Math.abs(valueA - valueB);
      const average = (valueA + valueB) / 2;
      const percentDifference = average === 0 ? NaN : (absoluteDifference / average) * 100;
      return { percentDifference, absoluteDifference, average };
    }
  },
  {
    id: 'fraction-calculator',
    category: 'math',
    glyph: 'a/b',
    updatedAt: '2026-10-21',
    aliases: ['add subtract multiply divide fractions calculator', 'simplify fraction calculator', 'mixed number calculator', 'fraction to decimal calculator'],
    related: ['ratio-calculator', 'percentage-calculator', 'gpa-calculator', 'unit-price-calculator'],
    title: 'Fraction Calculator',
    description: 'Add, subtract, multiply or divide two fractions, with the answer simplified to lowest terms, as a mixed number, and as a decimal.',
    example: '1/2 + 1/3 = 5/6 ≈ 0.8333. Switch the operator to see the same two fractions subtracted, multiplied or divided instead.',
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is a fraction?',
        paragraphs: [
          'A fraction represents a part of a whole, written as one integer (the numerator) over another (the denominator): a/b, where b cannot be zero. The denominator says how many equal parts the whole is divided into, and the numerator says how many of those parts you have. Cut a pizza into 4 equal slices and eat 3, and you have eaten 3/4 of the pizza.',
          'Every fraction has an equivalent decimal (divide the numerator by the denominator) and, if it is "improper" (numerator bigger than denominator), an equivalent mixed number — a whole number plus a smaller fraction, such as 7/2 = 3 1/2. This calculator shows all three forms for whichever fraction you end up with.',
          'Combining two fractions with + or − needs a common denominator first; × and ÷ do not. This calculator handles all four operations the same way: it forms a common denominator, computes the result, and then simplifies it to lowest terms using the greatest common factor of the numerator and denominator.'
        ]
      },
      howTo: {
        intro: 'Enter two fractions and pick an operation. The result updates as you type, already simplified.',
        steps: [
          { name: 'Enter the first fraction', text: 'Type its numerator and denominator. The denominator cannot be zero.' },
          { name: 'Choose an operation', text: 'Add, subtract, multiply or divide. Dividing by a fraction is the same as multiplying by its reciprocal, which the calculator does for you.' },
          { name: 'Enter the second fraction', text: 'For division, its numerator also cannot be zero — you cannot divide by a fraction that equals zero.' },
          { name: 'Read the simplified result', text: 'The decimal value, the fraction in lowest terms, and the mixed number (whole part plus remainder) all come from the same answer.' },
          { name: 'Compare the two inputs', text: 'The chart shows both fractions as decimals, so you can see at a glance which one is larger.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Addition and subtraction need a shared denominator first; multiplication and division work directly on the numerators and denominators.',
        expression: 'a/b + c/d = (ad + bc) ÷ bd\na/b − c/d = (ad − bc) ÷ bd\na/b × c/d = ac ÷ bd\na/b ÷ c/d = a/b × d/c = ad ÷ bc',
        terms: [
          { symbol: 'a, c', meaning: 'The two numerators.' },
          { symbol: 'b, d', meaning: 'The two denominators (never zero).' },
          { symbol: 'bd', meaning: 'A common denominator formed by multiplying the two denominators together. It is not always the LEAST common denominator, so the result is simplified afterward.' }
        ],
        note: 'This calculator simplifies the result to lowest terms by dividing the numerator and denominator by their greatest common factor, so bd is always a safe, if not minimal, common denominator to start from.'
      },
      workedExample: {
        intro: 'Add 1/2 and 1/3.',
        rows: [
          { label: 'Common denominator (2 × 3)', value: '6' },
          { label: 'Numerator (1×3 + 1×2)', value: '3 + 2 = 5' },
          { label: 'Result before simplifying', value: '5/6' },
          { label: 'Simplified (GCF(5, 6) = 1, already lowest terms)', value: '5/6' },
          { label: 'As a decimal', value: '5 ÷ 6 ≈ 0.8333' }
        ],
        result: '1/2 + 1/3 = 5/6 ≈ 0.8333',
        explanation: '5/6 is already in lowest terms because 5 and 6 share no common factor other than 1. If the unsimplified result had been 4/6 instead, dividing both numbers by their greatest common factor (2) would reduce it to 2/3.'
      },
      watchOut: [
        { title: 'A denominator of zero has no meaning', body: 'A fraction with a zero denominator is undefined — it does not represent a number, so the calculator cannot return an answer.' },
        { title: 'Dividing by a zero numerator is still dividing by zero', body: 'Dividing by a fraction whose numerator is 0 means dividing by 0 (since 0/d = 0 for any nonzero d), which has no answer, the same as dividing any number by 0.' },
        { title: 'Negative results and mixed numbers', body: 'For a negative result like −7/2, this calculator shows a mixed-number whole part of −3 and a remainder numerator of −1 over a denominator of 2 (meaning −3 and a further 1/2 below that), rather than the more familiar "−3 1/2" notation.' },
        { title: 'Expects whole-number numerators and denominators', body: 'Typing a decimal into a numerator or denominator field still computes an answer, but fractions are defined for integers — convert a decimal to a fraction the other way around if that is where you are starting from.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §4.1 Visualize Fractions', url: 'https://openstax.org/books/prealgebra-2e/pages/4-1-visualize-fractions' },
        { label: 'OpenStax, Prealgebra 2e, §4.2 Multiply and Divide Fractions', url: 'https://openstax.org/books/prealgebra-2e/pages/4-2-multiply-and-divide-fractions' },
        { label: 'OpenStax, Prealgebra 2e, §4.5 Add and Subtract Fractions with Different Denominators', url: 'https://openstax.org/books/prealgebra-2e/pages/4-5-add-and-subtract-fractions-with-different-denominators' },
        { label: 'Wolfram MathWorld, Fraction', url: 'https://mathworld.wolfram.com/Fraction.html' }
      ]
    },
    inputs: [
      { id: 'n1', label: 'First numerator', type: 'number', placeholder: '1', defaultValue: 1, step: 1 },
      { id: 'd1', label: 'First denominator', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 },
      {
        id: 'operator',
        label: 'Operation',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Add (+)' },
          { value: 2, label: 'Subtract (−)' },
          { value: 3, label: 'Multiply (×)' },
          { value: 4, label: 'Divide (÷)' }
        ]
      },
      { id: 'n2', label: 'Second numerator', type: 'number', placeholder: '1', defaultValue: 1, step: 1 },
      { id: 'd2', label: 'Second denominator', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 1 }
    ],
    breakdown: {
      headline: 'decimalValue',
      headlineLabel: 'Decimal value',
      outputs: [
        { id: 'decimalValue', label: 'Decimal value', format: 'significant' },
        { id: 'simplifiedNumerator', label: 'Simplified numerator', format: 'integer' },
        { id: 'simplifiedDenominator', label: 'Simplified denominator', format: 'integer' },
        { id: 'mixedWhole', label: 'Mixed number — whole part', format: 'integer' },
        { id: 'mixedRemainderNumerator', label: 'Mixed number — remainder numerator', format: 'integer' }
      ],
      groups: [{ inputs: ['n1', 'd1', 'operator', 'n2', 'd2'] }],
      derive: (values) => ({
        fraction1Decimal: values.d1 === 0 ? NaN : values.n1 / values.d1,
        fraction2Decimal: values.d2 === 0 ? NaN : values.n2 / values.d2
      }),
      visual: { type: 'compareBars', bars: [{ from: 'fraction1Decimal', label: 'First fraction' }, { from: 'fraction2Decimal', label: 'Second fraction' }], title: 'Your two fractions, as decimals' }
    },
    seo: {
      title: 'Fraction Calculator – Add, Subtract, Multiply, Divide',
      description: 'Free fraction calculator. Add, subtract, multiply or divide two fractions, with the result simplified, as a mixed number and as a decimal.',
      faq: [
        { question: 'How do I add two fractions?', answer: 'Find a common denominator, add the numerators, then simplify: 1/2 + 1/3 = 3/6 + 2/6 = 5/6.' },
        { question: 'How do I subtract fractions?', answer: 'Use the same common-denominator method and subtract the numerators: 1/2 − 1/3 = 3/6 − 2/6 = 1/6.' },
        { question: 'How do I multiply fractions?', answer: 'Multiply the numerators together and the denominators together; no common denominator is needed: 1/2 × 1/3 = 1/6.' },
        { question: 'How do I divide fractions?', answer: 'Multiply by the reciprocal of the second fraction: 1/2 ÷ 1/3 = 1/2 × 3/1 = 3/2.' },
        { question: 'How do I simplify a fraction?', answer: 'Divide the numerator and denominator by their greatest common factor. 4/6 divided by 2 is 2/3.' },
        { question: 'How do I convert a fraction to a mixed number?', answer: 'Divide the numerator by the denominator; the quotient is the whole part and the remainder sits over the original denominator: 7/2 = 3 remainder 1 = 3 1/2.' },
        { question: 'How do I convert a fraction to a decimal?', answer: 'Divide the numerator by the denominator: 5/6 ≈ 0.8333.' },
        { question: 'Why do fractions need a common denominator to add but not to multiply?', answer: 'Addition combines like-sized pieces, so the pieces must be the same size (the same denominator) first. Multiplication scales both the count and the size of the pieces at once, so it works directly on any denominators.' }
      ]
    },
    compute(values) {
      const { n1, d1, n2, d2, operator } = values;
      const noAnswer = { decimalValue: NaN, simplifiedNumerator: NaN, simplifiedDenominator: NaN, mixedWhole: NaN, mixedRemainderNumerator: NaN };
      if (d1 === 0 || d2 === 0) return noAnswer;

      let rn: number;
      let rd: number;
      if (operator === 2) {
        rn = n1 * d2 - n2 * d1;
        rd = d1 * d2;
      } else if (operator === 3) {
        rn = n1 * n2;
        rd = d1 * d2;
      } else if (operator === 4) {
        if (n2 === 0) return noAnswer; // dividing by zero
        rn = n1 * d2;
        rd = d1 * n2;
      } else {
        rn = n1 * d2 + n2 * d1; // operator 1 (add), and the safe fallback for any other value
        rd = d1 * d2;
      }
      if (rd < 0) {
        rn = -rn;
        rd = -rd;
      }

      const divisor = gcd(rn, rd);
      const simplifiedNumerator = rn / divisor;
      const simplifiedDenominator = rd / divisor;
      const decimalValue = rn / rd;
      const mixedWhole = Math.trunc(simplifiedNumerator / simplifiedDenominator);
      const mixedRemainderNumerator = simplifiedNumerator % simplifiedDenominator;
      return { decimalValue, simplifiedNumerator, simplifiedDenominator, mixedWhole, mixedRemainderNumerator };
    }
  },
  {
    id: 'ratio-calculator',
    category: 'math',
    glyph: 'a:b',
    updatedAt: '2026-10-21',
    aliases: ['ratio simplifier', 'simplify a ratio calculator', 'proportion calculator', 'solve a ratio calculator', 'equivalent ratio calculator'],
    related: ['fraction-calculator', 'percentage-calculator', 'unit-price-calculator', 'gas-cost-calculator'],
    title: 'Ratio Calculator',
    description: 'Simplify a ratio to lowest terms, or solve a proportion A:B = C:D for the missing term using cross-multiplication.',
    example: '4:6 simplifies to 2:3. In the proportion 4:6 = 10:D, the missing term is D = 15.',
    solver: {
      defaultTarget: 'd',
      variables: [
        { id: 'a', label: 'A', symbol: 'A', dimension: 'count', defaultValue: 4, defaultUnit: 'count' },
        { id: 'b', label: 'B', symbol: 'B', dimension: 'count', defaultValue: 6, defaultUnit: 'count' },
        { id: 'c', label: 'C', symbol: 'C', dimension: 'count', defaultValue: 10, defaultUnit: 'count' },
        { id: 'd', label: 'D', symbol: 'D', dimension: 'count', defaultValue: 15, defaultUnit: 'count' }
      ],
      solve: {
        a: ({ b, c, d }) => (d === 0 ? NaN : (b * c) / d),
        b: ({ a, c, d }) => (c === 0 ? NaN : (a * d) / c),
        c: ({ a, b, d }) => (b === 0 ? NaN : (a * d) / b),
        d: ({ a, b, c }) => (a === 0 ? NaN : (b * c) / a)
      },
      outputs: [
        { id: 'simplifiedA', label: 'A : B simplified — A', dimension: 'count', compute: (si) => si.a / gcd(si.a, si.b) },
        { id: 'simplifiedB', label: 'A : B simplified — B', dimension: 'count', compute: (si) => si.b / gcd(si.a, si.b) }
      ],
      derive: (si) => ({ total: si.a + si.b }),
      visuals: [{ type: 'donut', segments: [{ from: 'a', label: 'A' }, { from: 'b', label: 'B' }], center: 'total', centerSub: 'A + B' }]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is a ratio?',
        paragraphs: [
          'A ratio compares two quantities by showing how many times one contains the other, written A:B or as the fraction A/B. A recipe that calls for 2 cups of flour to 1 cup of sugar has a flour-to-sugar ratio of 2:1 — for every 2 parts flour, there is 1 part sugar, regardless of whether you are making a small batch or a huge one.',
          'A proportion states that two ratios are equal: A:B = C:D. Proportions are how ratios scale — if 2:1 scales up to 10:D, then D must be 5, because an equivalent ratio keeps the same relationship between its two parts. The standard way to solve a proportion is cross-multiplication: A × D = B × C.',
          'Simplifying a ratio to lowest terms works exactly like simplifying a fraction: divide both numbers by their greatest common factor. 4:6 and 2:3 describe the same relationship, just as 4/6 and 2/3 are the same fraction.'
        ]
      },
      howTo: {
        intro: 'Enter any three of the four terms in the proportion A:B = C:D, and the fourth, marked auto, is calculated.',
        steps: [
          { name: 'Set up the proportion', text: 'Think of your problem as "A is to B as C is to D." Enter the three terms you know.' },
          { name: 'Read the missing term', text: 'The field you left alone the longest is calculated automatically using cross-multiplication.' },
          { name: 'Check the simplified ratio', text: 'The result also shows A:B reduced to its lowest terms, which is useful even when you already know all four numbers.' },
          { name: 'Switch which term is calculated', text: 'Type into the auto field to make it an input again; a different field then becomes the calculated one.' },
          { name: 'See the split visually', text: 'The chart shows A and B as two parts of their combined total.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'A proportion says two ratios are equal. Cross-multiplying the equation gives a formula for any missing term.',
        expression: 'A : B = C : D  ⇔  A × D = B × C\nA = (B × C) ÷ D\nB = (A × D) ÷ C\nC = (A × D) ÷ B\nD = (B × C) ÷ A',
        terms: [
          { symbol: 'A : B', meaning: 'The first ratio.' },
          { symbol: 'C : D', meaning: 'The second, equivalent ratio.' },
          { symbol: 'A × D = B × C', meaning: 'The cross products of a true proportion are always equal — multiply diagonally across the equals sign.' }
        ],
        note: 'Solving for any one term divides by one of the other three, so that other term cannot be zero.'
      },
      workedExample: {
        intro: 'A paint mix uses a ratio of 4 parts blue to 6 parts white. How much white is needed for 10 parts blue, keeping the same ratio?',
        rows: [
          { label: 'Set up the proportion', value: '4 : 6 = 10 : D' },
          { label: 'Cross-multiply', value: '4 × D = 6 × 10' },
          { label: 'Solve for D', value: 'D = 60 ÷ 4 = 15' },
          { label: 'Simplify the original ratio', value: '4:6 ÷ GCF(4, 6) = 2 → 2:3' }
        ],
        result: 'D = 15 · simplified ratio 2:3',
        explanation: '10 parts blue needs 15 parts white to keep the same 4:6 (equivalently 2:3) mix. Checking the cross products confirms it: 4 × 15 = 60, and 6 × 10 = 60.'
      },
      watchOut: [
        { title: 'No term can be zero when solving for another', body: 'Solving for A divides by D, solving for D divides by A, and so on — a proportion with a zero in the "wrong" place has no defined missing term.' },
        { title: 'Order matters within each ratio, not between them', body: 'A:B = C:D is not the same statement as A:B = D:C. Keep the parts in the same order on both sides — blue:white on the left must match blue:white on the right.' },
        { title: '"Simplified" uses whole-number math', body: 'The simplified A:B uses the greatest common factor of two integers. Typing decimals still produces an answer, but "lowest terms" strictly applies to whole numbers.' },
        { title: 'A ratio is not the same as a fraction of the total', body: 'A ratio of 2:3 means 2 parts to 3 parts (5 parts total), not "2 out of 3." The first quantity is 2/5 of the total, not 2/3 of it — a common mix-up.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §6.5 Solve Proportions and Their Applications', url: 'https://openstax.org/books/prealgebra-2e/pages/6-5-solve-proportions-and-their-applications' },
        { label: 'Wolfram MathWorld, Ratio', url: 'https://mathworld.wolfram.com/Ratio.html' }
      ]
    },
    inputs: [
      { id: 'a', label: 'A', type: 'number', placeholder: '4', defaultValue: 4, step: 1 },
      { id: 'b', label: 'B', type: 'number', placeholder: '6', defaultValue: 6, step: 1 },
      { id: 'c', label: 'C', type: 'number', placeholder: '10', defaultValue: 10, step: 1 }
    ],
    seo: {
      title: 'Ratio Calculator – Simplify Ratios & Solve Proportions',
      description: 'Free ratio calculator. Simplify a ratio to lowest terms, or solve a proportion A:B = C:D for the missing term with cross-multiplication.',
      faq: [
        { question: 'How do I simplify a ratio?', answer: 'Divide both terms by their greatest common factor. 4:6 ÷ 2 = 2:3.' },
        { question: 'How do I solve a proportion?', answer: 'Cross-multiply: in A:B = C:D, A × D = B × C, then divide to isolate the unknown term.' },
        { question: 'What is the difference between a ratio and a proportion?', answer: 'A ratio compares two quantities (A:B). A proportion states that two ratios are equal (A:B = C:D).' },
        { question: 'What is the difference between a ratio and a fraction?', answer: 'A ratio of 2:3 compares two separate quantities totaling 5; the fraction 2/3 usually means 2 parts out of a total of 3. They are related but answer different questions.' },
        { question: 'How do I scale a ratio up or down?', answer: 'Multiply or divide both terms by the same number. 2:3 scaled by 5 is 10:15, the same ratio.' },
        { question: 'Can a ratio have more than two terms?', answer: 'Yes, such as 2:3:5, but each pair within it still simplifies and scales the same way as a two-term ratio.' },
        { question: 'What does it mean for cross products to be equal?', answer: "It is the test for whether a proportion is true: if A × D = B × C, then A:B and C:D really are equivalent ratios." },
        { question: 'Can a ratio term be negative?', answer: 'Mathematically yes, but ratios almost always describe real-world quantities — ingredients, distances, odds — that are zero or positive.' }
      ]
    },
    compute(values) {
      const { a, b, c } = values;
      const g = gcd(a, b);
      return {
        d: a === 0 ? NaN : (b * c) / a,
        simplifiedA: a / g,
        simplifiedB: b / g
      };
    }
  },
  {
    id: 'average-calculator',
    category: 'math',
    glyph: 'x̄',
    updatedAt: '2026-10-21',
    aliases: ['mean calculator', 'average of numbers calculator', 'sum and average calculator', 'arithmetic mean calculator', 'average of 4 numbers calculator'],
    related: ['weighted-average-calculator', 'gpa-calculator', 'percentage-calculator', 'percent-change-calculator'],
    title: 'Average Calculator',
    description: 'Find the arithmetic mean, sum, count, minimum and maximum of a list of numbers — paste up to 1,000 of them.',
    example: 'Four test scores of 85, 90, 78 and 92 average to 86.25 — a number none of the four scores actually is.',
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is an average?',
        paragraphs: [
          'In everyday language, "average" almost always means the arithmetic mean: add up every number in a list, then divide by how many numbers there are. It is the single most common way to summarize a whole list with one representative figure — a student\'s average test score, a city\'s average rainfall, a team\'s average points per game.',
          'The arithmetic mean is one of several "measures of central tendency" used in statistics; the median (the middle value when the list is sorted) and the mode (the most frequent value) are others, and they can tell a very different story from the mean when a list has extreme values or a skewed shape. This calculator covers the plain arithmetic mean, along with the sum, count, minimum and maximum of the same list, which together give a fuller picture than the mean alone.',
          'A closely related calculator, the weighted average, is worth knowing about if some numbers in your list should count more than others — a final exam worth more than a quiz, for instance. A plain average treats every number equally; a weighted average does not.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box, separated by commas, spaces or new lines — a column copied straight out of a spreadsheet works as-is.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines — up to 1,000 of them. A genuine 0 among them counts normally — it is averaged in like any other value, not dropped.' },
          { name: 'Check the count', text: 'The box shows a live count of how many numbers it understood. Anything that is not a number is dropped and listed below the box, so a stray label or unit does not silently throw off your result.' },
          { name: 'Read the average', text: 'The headline is the arithmetic mean: the sum of your numbers, divided by how many there are.' },
          { name: 'Check the sum, count, min and max', text: 'The breakdown below the average shows the total, how many numbers were counted, and the smallest and largest values among them.' },
          { name: 'See the range at a glance', text: 'The chart plots your lowest value, your average, and your highest value side by side.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The arithmetic mean is the sum of a list divided by how many numbers are in it.',
        expression: 'Average = (x₁ + x₂ + ... + xₙ) ÷ n',
        terms: [
          { symbol: 'x₁, x₂, ..., xₙ', meaning: 'Each number in the list.' },
          { symbol: 'n', meaning: 'How many numbers you entered (up to 1,000).' }
        ],
        note: 'Non-numeric text pasted into the box is dropped, not averaged in as zero; a 0 you actually typed is included normally.'
      },
      workedExample: {
        intro: 'Four test scores: 85, 90, 78 and 92.',
        rows: [
          { label: 'Sum (85 + 90 + 78 + 92)', value: '345' },
          { label: 'Count', value: '4' },
          { label: 'Average (345 ÷ 4)', value: '86.25' },
          { label: 'Range', value: 'lowest 78, highest 92' }
        ],
        result: 'Average = 86.25 (sum 345, count 4)',
        explanation: '86.25 is not one of the four scores entered, and that is normal — the mean is a representative middle figure, not a value that has to already appear in the list. Three of the four scores (85, 90, 92) sit above it, and one (78) sits well below; the mean still balances all four.'
      },
      watchOut: [
        { title: 'A genuine 0 is a real value, not an "unused" marker', body: 'If one of your numbers really is 0 — a test score of 0, say — paste it in like any other number. This calculator averages every number it parses, zeros included; it never silently drops a 0.' },
        { title: 'Non-numeric tokens are dropped, not averaged in as zero', body: 'Anything pasted into the box that is not a number — a stray label, a unit, a trailing comma — is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste. A leading $, a trailing %, and commas used as thousands separators (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers; a bare comma-only list like 100,200,300 still reads as three numbers.' },
        { title: 'The average is sensitive to outliers', body: 'One unusually large or small number pulls the mean toward it. A list of 10, 12, 11 and 400 averages to 108.25 — far from any typical value in the list — because the mean does not ignore extremes the way the median would.' },
        { title: 'Average and weighted average are different questions', body: 'A plain average treats every number the same. If some numbers should count more than others — a final exam worth more than a single quiz — use the weighted average calculator instead; the two will usually disagree.' },
        { title: 'The result can fall outside the range of "typical" values', body: 'The average of 1, 1, 1 and 100 is 25.75 — higher than three of the four numbers and nowhere close to any single one of them, because one large value outweighs several small, identical ones.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §2.5 Measures of the Center of the Data', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data' },
        { label: 'Wolfram MathWorld, Arithmetic Mean', url: 'https://mathworld.wolfram.com/ArithmeticMean.html' }
      ]
    },
    inputs: [
      {
        id: 'data',
        label: 'Your numbers',
        type: 'list',
        placeholder: 'Paste or type numbers — commas, spaces or new lines between them. $, % and thousands commas like 1,000 are understood.',
        defaultValue: 0,
        listDefault: [85, 90, 78, 92],
        listMin: 1
      }
    ],
    breakdown: {
      headline: 'mean',
      headlineLabel: 'Average (mean)',
      outputs: [
        { id: 'mean', label: 'Average (mean)', format: 'significant' },
        { id: 'sum', label: 'Sum', format: 'significant' },
        { id: 'count', label: 'Count', format: 'integer' },
        { id: 'min', label: 'Lowest value', format: 'significant' },
        { id: 'max', label: 'Highest value', format: 'significant' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'min', label: 'Lowest value' }, { from: 'mean', label: 'Average' }, { from: 'max', label: 'Highest value' }],
        title: 'Lowest, average, highest',
        highlight: 1
      }
    },
    seo: {
      title: 'Average Calculator – Mean, Sum, Min & Max',
      description: 'Free average calculator. Paste a list of up to 1,000 numbers to find the arithmetic mean, sum, count, minimum and maximum.',
      faq: [
        { question: 'How do I calculate an average?', answer: 'Add up every number in the list, then divide by how many numbers there are. Four scores of 85, 90, 78 and 92 sum to 345, and 345 ÷ 4 = 86.25.' },
        { question: 'What is the difference between average and mean?', answer: 'In everyday use they are the same thing. "Mean" is the more precise statistical term for what people usually call the "average" — the sum divided by the count.' },
        { question: 'How many numbers can this calculator average?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines — a 0 among them is included normally, not ignored.' },
        { question: 'Can the average be higher than every number in the list?', answer: 'No, and it can never be lower than every number either — the average always falls between the smallest and largest values in the list (inclusive, if every value is identical).' },
        { question: 'What is the difference between average and weighted average?', answer: 'A plain average treats every number equally. A weighted average lets some numbers count more than others — see the weighted average calculator for that case, such as a final exam worth more than a quiz.' },
        { question: 'Why is my average not a "round" number?', answer: 'The average is only guaranteed to be a whole number when the sum happens to divide evenly by the count. 345 ÷ 4 = 86.25, which is exact but not a whole number.' },
        { question: 'Does one extreme value change the average a lot?', answer: 'Yes — the mean is sensitive to outliers. Averaging 10, 12, 11 and 400 gives 108.25, pulled far above three of the four numbers by the one large value.' },
        { question: 'What does this calculator show besides the average?', answer: 'The sum of all your numbers, how many were counted, and the lowest and highest values among them.' }
      ]
    },
    compute(values, lists) {
      const used = lists.data;
      const count = used.length;
      const sum = used.reduce((a, b) => a + b, 0);
      const mean = sum / count;
      const min = Math.min(...used);
      const max = Math.max(...used);
      return { mean, sum, count, min, max };
    }
  },
  {
    id: 'weighted-average-calculator',
    category: 'math',
    glyph: 'WA',
    updatedAt: '2026-10-21',
    aliases: ['weighted mean calculator', 'weighted average grade calculator', 'weighted score calculator', 'weighted average with percentages calculator'],
    related: ['average-calculator', 'gpa-calculator', 'percentage-calculator', 'ratio-calculator'],
    title: 'Weighted Average Calculator',
    description: 'Find the weighted average of up to 6 values, each with its own weight — the method behind course grades, index scores, and any total where some parts count more than others.',
    example: 'A midterm (85, weight 30), final exam (90, weight 50) and homework (78, weight 20) combine to a weighted average of 86.1 — higher than the plain average of the same three scores, 84.33, because the best score carries the most weight.',
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is a weighted average?',
        paragraphs: [
          'A weighted average gives each value its own importance, instead of treating every number the same way a plain average does. Multiply each value by its weight, add those products together, then divide by the total of the weights. A component with a bigger weight has a bigger say in the final result.',
          'This is the exact method behind a course grade built from a midterm, a final exam and homework in different proportions — and it is also exactly how GPA works, with each course grade weighted by its credit hours. The GPA calculator is this same calculation, specialized to grades and credits; use this calculator for any other value/weight scenario, like a performance score, an index built from several indicators, or a rubric with multiple weighted criteria.',
          'A common point of confusion is assuming the weights must add up to 100 or to 1. They do not — this calculator divides by the total of whatever weights you enter, so weights of 30/50/20 produce exactly the same result as 3/5/2 or 0.3/0.5/0.2, since all three sets have the same proportions.'
        ]
      },
      howTo: {
        intro: 'Enter each component\'s value and weight. Leave an optional component\'s weight at 0 to exclude it.',
        steps: [
          { name: 'Enter your first 3 components', text: 'Type the value and weight for each of the 3 main components, such as a midterm score and the percentage it counts toward a final grade.' },
          { name: 'Add more components if needed', text: 'Open "Add up to 3 more components" for up to 3 additional value/weight pairs. Leave an unused pair\'s weight at 0 — a weight of 0 means that component does not affect the result at all.' },
          { name: 'Read the weighted average', text: 'The headline is the weighted average: the weighted sum divided by the total weight.' },
          { name: 'Check the totals', text: 'The breakdown shows the weighted sum (before dividing) and the total weight (the sum of every weight you entered), useful for checking your own arithmetic.' },
          { name: 'See each component\'s share', text: 'The chart shows each component\'s weight as a share of the total weight, so you can see at a glance which one has the most influence.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Each value is multiplied by its own weight before the values are combined; dividing by the total weight normalizes the result regardless of what scale the weights happen to be on.',
        expression: 'Weighted average = (v₁w₁ + v₂w₂ + ... + vₙwₙ) ÷ (w₁ + w₂ + ... + wₙ)',
        terms: [
          { symbol: 'v₁, v₂, ..., vₙ', meaning: 'Each value (a score, a measurement, a grade).' },
          { symbol: 'w₁, w₂, ..., wₙ', meaning: 'Each value\'s weight — how much it should count, relative to the others.' }
        ],
        note: 'The weights do not need to sum to 1 or to 100; dividing by their total handles any scale. A component with weight 0 contributes nothing to either the numerator or the denominator, which is exactly how this calculator excludes an unused optional component.'
      },
      workedExample: {
        intro: 'A course grade built from a midterm (85, worth 30% of the grade), a final exam (90, worth 50%) and homework (78, worth 20%).',
        rows: [
          { label: 'Weighted values (85×30, 90×50, 78×20)', value: '2,550 + 4,500 + 1,560' },
          { label: 'Weighted sum', value: '8,610' },
          { label: 'Total weight (30 + 50 + 20)', value: '100' },
          { label: 'Weighted average (8,610 ÷ 100)', value: '86.1' }
        ],
        result: 'Weighted average = 86.1',
        explanation: 'The plain average of 85, 90 and 78 is only 84.33 — lower than the weighted result, because the weighted average gives the strongest score (the 90 on the final) the largest weight (50), pulling the combined result upward.'
      },
      watchOut: [
        { title: 'A weight of 0 excludes that component entirely', body: 'Whether it is one of the 3 optional components or, less usefully, one of the main 3, a weight of 0 means that component adds nothing to the weighted sum or the total weight — identical to leaving it out altogether.' },
        { title: 'Weights do not need to add up to 100% or to 1', body: 'Because the formula divides by the total of the weights, 30/50/20 and 3/5/2 give exactly the same weighted average. There is no need to rescale your weights before entering them.' },
        { title: 'All weights at 0 has no defined average', body: 'If every weight is 0, the total weight is 0 and dividing by it has no answer — the same as any division by zero. This calculator shows no result in that case rather than a misleading number.' },
        { title: 'This is the same math GPA uses, specialized', body: 'A GPA is a weighted average where the values are grade points and the weights are credit hours. Use the dedicated GPA calculator for that specific case — it also groups your credits into letter-grade bands, which this general-purpose calculator does not.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §2.5 Measures of the Center of the Data', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data' },
        { label: 'Wolfram MathWorld, Weighted Mean', url: 'https://mathworld.wolfram.com/WeightedMean.html' }
      ]
    },
    inputs: [
      { id: 'value1', label: 'Component 1 value', type: 'number', placeholder: '85', defaultValue: 85, step: 1 },
      { id: 'weight1', label: 'Component 1 weight', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 0 },
      { id: 'value2', label: 'Component 2 value', type: 'number', placeholder: '90', defaultValue: 90, step: 1 },
      { id: 'weight2', label: 'Component 2 weight', type: 'number', placeholder: '50', defaultValue: 50, step: 1, min: 0 },
      { id: 'value3', label: 'Component 3 value', type: 'number', placeholder: '78', defaultValue: 78, step: 1 },
      { id: 'weight3', label: 'Component 3 weight', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 0 },
      { id: 'value4', label: 'Component 4 value', type: 'number', placeholder: '0', defaultValue: 0, step: 1 },
      { id: 'weight4', label: 'Component 4 weight (0 = unused)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 },
      { id: 'value5', label: 'Component 5 value', type: 'number', placeholder: '0', defaultValue: 0, step: 1 },
      { id: 'weight5', label: 'Component 5 weight (0 = unused)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 },
      { id: 'value6', label: 'Component 6 value', type: 'number', placeholder: '0', defaultValue: 0, step: 1 },
      { id: 'weight6', label: 'Component 6 weight (0 = unused)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'weightedAverage',
      headlineLabel: 'Weighted average',
      outputs: [
        { id: 'weightedAverage', label: 'Weighted average', format: 'significant' },
        { id: 'weightedSum', label: 'Weighted sum', format: 'significant' },
        { id: 'totalWeight', label: 'Total weight', format: 'significant' }
      ],
      groups: [
        { title: 'Component 1', inputs: ['value1', 'weight1'] },
        { title: 'Component 2', inputs: ['value2', 'weight2'] },
        { title: 'Component 3', inputs: ['value3', 'weight3'] },
        { title: 'Add up to 3 more components', inputs: ['value4', 'weight4', 'value5', 'weight5', 'value6', 'weight6'], optional: true }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'weight1', label: 'Component 1 weight' },
          { from: 'weight2', label: 'Component 2 weight' },
          { from: 'weight3', label: 'Component 3 weight' },
          { from: 'weight4', label: 'Component 4 weight' },
          { from: 'weight5', label: 'Component 5 weight' },
          { from: 'weight6', label: 'Component 6 weight' }
        ],
        center: 'weightedAverage',
        centerSub: 'weighted average'
      }
    },
    seo: {
      title: 'Weighted Average Calculator – Weighted Mean',
      description: 'Free weighted average calculator. Combine up to 6 values with their own weights — for grades, scores, or any total where some parts count more than others.',
      faq: [
        { question: 'How do I calculate a weighted average?', answer: 'Multiply each value by its weight, add the results, then divide by the total of the weights. (85×30 + 90×50 + 78×20) ÷ (30+50+20) = 8,610 ÷ 100 = 86.1.' },
        { question: 'Do the weights need to add up to 100?', answer: 'No. This calculator divides by whatever the weights actually add up to, so 30/50/20 and 3/5/2 give the identical result since they have the same proportions.' },
        { question: 'What is the difference between an average and a weighted average?', answer: 'A plain average treats every value equally. A weighted average lets some values count more than others — see the average calculator for the unweighted case.' },
        { question: 'Is GPA a weighted average?', answer: 'Yes — grade points are the values and credit hours are the weights. The dedicated GPA calculator uses this same calculation, plus a grade-distribution chart specific to letter grades.' },
        { question: 'What happens if I set a weight to 0?', answer: 'That component is excluded from both the weighted sum and the total weight, exactly as if it had not been entered at all.' },
        { question: 'Can a weighted average be lower than every value?', answer: 'No — like a plain average, a weighted average always falls between the lowest and highest value entered (assuming all weights are zero or positive).' },
        { question: 'What if all my weights are 0?', answer: 'The total weight is 0, and dividing by it has no defined answer — the same as any division by zero.' },
        { question: 'Can weights be percentages?', answer: 'Yes. Entering 30, 50 and 20 (percentage points that happen to sum to 100) works the same as entering 0.30, 0.50 and 0.20 — the result is identical either way.' }
      ]
    },
    compute(values) {
      const pairs: [number, number][] = [
        [values.value1, values.weight1],
        [values.value2, values.weight2],
        [values.value3, values.weight3],
        [values.value4, values.weight4],
        [values.value5, values.weight5],
        [values.value6, values.weight6]
      ];
      const totalWeight = pairs.reduce((sum, [, w]) => sum + w, 0);
      const weightedSum = pairs.reduce((sum, [v, w]) => sum + v * w, 0);
      const weightedAverage = totalWeight === 0 ? NaN : weightedSum / totalWeight;
      return { weightedAverage, weightedSum, totalWeight };
    }
  },
  {
    id: 'rounding-calculator',
    category: 'math',
    glyph: '≈',
    updatedAt: '2026-10-21',
    aliases: ['round a number calculator', 'round to the nearest calculator', 'round to decimal places calculator', 'round up or down calculator'],
    related: ['scientific-notation-calculator', 'exponent-calculator', 'percentage-calculator', 'average-calculator'],
    title: 'Rounding Calculator',
    description: 'Round a number to any number of decimal places (or to the nearest ten, hundred or thousand), rounding to the nearest value, always up, or always down, with a choice of tie-breaking rule.',
    example: '12.345 rounds to 12.35 at 2 decimal places (nearest, ties away from zero) — and 1.005 correctly rounds to 1.01, not the 1.00 a naive calculation gives because of how computers store decimals.',
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What does it mean to round a number?',
        paragraphs: [
          'Rounding replaces a number with a nearby one that is simpler to work with — fewer decimal places, or a multiple of ten, a hundred, or a thousand. It trades a little precision for a number that is easier to read, say out loud, or use in a quick estimate. "Round $19.97 to the nearest dollar" and "round 12,345 people to the nearest thousand" are the same operation at different scales.',
          'There are two separate choices involved in rounding: which direction to round (to the nearest value, always up, or always down), and — only when rounding to the nearest value — how to break an exact tie, where the number sits precisely halfway between two candidates. This calculator exposes both choices rather than picking one silently, because different fields (money, statistics, general arithmetic) commonly use different tie-breaking conventions.',
          'Rounding also runs into a subtle computing issue: most decimal numbers, including common ones like 0.1 or 1.005, cannot be stored exactly in the binary floating-point format computers use internally. A naive rounding calculation can silently give the wrong answer for numbers that look perfectly ordinary — this calculator is built specifically to avoid that trap (see "Watch out" below).'
        ]
      },
      howTo: {
        intro: 'Enter the number to round, choose how many decimal places to keep, then pick a direction and, if needed, a tie-breaking rule.',
        steps: [
          { name: 'Enter the number', text: 'Type the value you want to round.' },
          { name: 'Set the decimal places', text: 'A positive number rounds to that many decimal places (2 means to the nearest hundredth). Use 0 for the nearest whole number, or a negative number to round to tens (−1), hundreds (−2) or thousands (−3).' },
          { name: 'Choose a direction', text: 'Round to the nearest value, always round up (ceiling), or always round down (floor), regardless of which is closer.' },
          { name: 'Pick a tie-breaking rule', text: 'This only matters for "round to the nearest" when the number sits exactly halfway between two candidates. "Half away from zero" is the everyday rule taught in school; "half to even" (banker\'s rounding) is the default in most computing systems because it avoids a consistent upward bias across many roundings.' },
          { name: 'Read the result', text: 'The headline is the rounded value; the row below shows how far it moved from your original number.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'All four rounding modes shift the decimal point by the chosen number of places, apply a rule to the resulting integer part, then shift back.',
        expression: 'Nearest, ties away from zero: 2.5 → 3, −2.5 → −3\nNearest, ties to even: 2.5 → 2, 3.5 → 4, −2.5 → −2\nAlways up (ceiling): 2.1 → 3, −2.9 → −2\nAlways down (floor): 2.9 → 2, −2.1 → −3',
        terms: [
          { symbol: 'Decimal places', meaning: 'How many digits after the decimal point to keep; negative values round to tens, hundreds or thousands instead.' },
          { symbol: 'Tie', meaning: 'A number that sits exactly halfway between the two nearest candidates at the chosen precision, such as 2.5 at 0 decimal places.' }
        ],
        note: 'IEEE 754, the standard that defines how computers represent and round floating-point numbers, calls these two tie-breaking rules roundTiesToAway and roundTiesToEven; the second is the default most programming languages and processors use internally.'
      },
      workedExample: {
        intro: 'Round 12.345 to 2 decimal places, rounding to the nearest value with ties away from zero.',
        rows: [
          { label: 'Shift the decimal point 2 places', value: '12.345 → 1,234.5' },
          { label: 'This is an exact tie — round away from zero', value: '1,234.5 → 1,235' },
          { label: 'Shift back', value: '1,235 → 12.35' }
        ],
        result: '12.345 rounds to 12.35',
        explanation: 'The difference between the rounded and original value is 0.005. If the tie rule were "half to even" instead, 1,234.5 would round to 1,234 (the nearest even whole number), giving 12.34 — the two tie-breaking rules genuinely disagree on numbers that land exactly halfway.'
      },
      watchOut: [
        { title: 'Floating-point representation can break naive rounding', body: 'A common decimal like 1.005 cannot be stored exactly in the binary format computers use (IEEE 754 binary64); internally it is closer to 1.00499999999999989. A calculation that simply multiplies by 100 and rounds gets 1.00, not 1.01. This calculator shifts the decimal point using the exact text of the number instead of multiplying, which avoids that error — 1.005 correctly rounds to 1.01 here.' },
        { title: 'The tie rule only matters for exact ties', body: 'If a number is not exactly halfway between two candidates at your chosen precision, "nearest" rounds to whichever candidate is closer regardless of which tie rule is selected — the tie rule changes nothing for 12.346 or 12.344, only for an exact 12.345.' },
        { title: 'Negative decimal places round to tens, hundreds or thousands', body: '−1 rounds to the nearest ten, −2 to the nearest hundred, and so on — the same sign convention used by spreadsheet rounding functions.' },
        { title: 'Round up and round down ignore how close the number is', body: '"Always round up" turns 10.01 into 11 at 0 decimal places, even though 10.01 is much closer to 10 — ceiling and floor are about direction, not closeness.' }
      ],
      references: [
        { label: 'D. Goldberg, "What Every Computer Scientist Should Know About Floating-Point Arithmetic" (ACM Computing Surveys, 1991; hosted by Oracle)', url: 'https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html' }
      ]
    },
    inputs: [
      { id: 'value', label: 'Number to round', type: 'number', placeholder: '12.345', defaultValue: 12.345, step: 0.001 },
      { id: 'decimalPlaces', label: 'Decimal places (negative rounds to tens, hundreds, ...)', type: 'number', placeholder: '2', defaultValue: 2, step: 1 },
      {
        id: 'direction',
        label: 'Direction',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Round to the nearest' },
          { value: 2, label: 'Always round up (ceiling)' },
          { value: 3, label: 'Always round down (floor)' }
        ]
      },
      {
        id: 'tieRule',
        label: 'Tie-breaking rule (nearest only)',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Half away from zero' },
          { value: 2, label: 'Half to even (banker\'s rounding)' }
        ]
      }
    ],
    breakdown: {
      headline: 'rounded',
      headlineLabel: 'Rounded value',
      outputs: [
        { id: 'rounded', label: 'Rounded value', format: 'significant' },
        { id: 'difference', label: 'Difference from the original', format: 'significant' }
      ],
      groups: [{ inputs: ['value', 'decimalPlaces'] }, { title: 'Rounding rule', inputs: ['direction', 'tieRule'] }],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'value', label: 'Original value' }, { from: 'rounded', label: 'Rounded value' }],
        title: 'Before and after rounding',
        highlight: 1
      }
    },
    seo: {
      title: 'Rounding Calculator – Decimal Places, Up, Down & Ties',
      description: 'Free rounding calculator. Round to any number of decimal places (or tens, hundreds, thousands), nearest, up or down, with half-away-from-zero or half-to-even ties.',
      faq: [
        { question: 'How do I round a number to 2 decimal places?', answer: 'Set "Decimal places" to 2 and "Direction" to "Round to the nearest." 12.345 rounds to 12.35.' },
        { question: 'How do I round to the nearest ten or hundred?', answer: 'Use a negative decimal-places value: −1 rounds to the nearest ten, −2 to the nearest hundred. 1,234 rounds to 1,200 at −2.' },
        { question: 'What is the difference between "half away from zero" and "half to even"?', answer: 'Both only affect exact ties. "Half away from zero" rounds 2.5 to 3 and −2.5 to −3. "Half to even" (banker\'s rounding) rounds 2.5 to 2 and 3.5 to 4 — whichever even number is nearest — and is the default in most computing systems because it has no net bias across many roundings.' },
        { question: 'Why does 1.005 sometimes round to 1.00 instead of 1.01?', answer: 'Because computers store most decimals as an approximation in binary (IEEE 754 binary64); 1.005 is actually stored as a number very slightly below 1.005. A calculation that multiplies by 100 and rounds inherits that error. This calculator avoids it by working from the number\'s exact decimal text instead.' },
        { question: 'What is the difference between rounding and truncating?', answer: 'Truncating simply cuts off the extra digits (12.349 truncates to 12.34). Rounding looks at the cut-off digits and may round the last kept digit up — 12.349 rounds to 12.35 at 2 decimal places.' },
        { question: 'What does "round up" (ceiling) mean for negative numbers?', answer: 'Ceiling always moves toward positive infinity, so −2.9 rounds up to −2, not −3 — "up" means larger, not "away from zero."' },
        { question: 'Does the tie rule matter if my number is not an exact tie?', answer: 'No. "Round to the nearest" always picks whichever candidate is closer when there is a closer one; the tie rule only changes the answer for a number that sits exactly halfway.' },
        { question: 'Can decimal places be negative?', answer: 'Yes — a negative value rounds to tens, hundreds, thousands and so on, the same convention used by spreadsheet ROUND-style functions.' }
      ]
    },
    compute(values) {
      const { value, decimalPlaces, direction, tieRule } = values;
      const shift = Math.round(decimalPlaces);
      const tie = direction === 2 ? Math.ceil : direction === 3 ? Math.floor : tieRule === 2 ? roundHalfToEven : roundHalfAwayFromZero;
      const rounded = shiftRound(value, shift, tie);
      const difference = Number((rounded - value).toPrecision(10));
      return { rounded, difference };
    }
  },
  {
    id: 'scientific-notation-calculator',
    category: 'math',
    glyph: '×10ⁿ',
    updatedAt: '2026-10-21',
    aliases: ['standard form calculator', 'convert to scientific notation calculator', 'multiply scientific notation calculator', 'scientific notation to a number calculator'],
    related: ['exponent-calculator', 'rounding-calculator', 'fraction-calculator', 'percentage-calculator'],
    title: 'Scientific Notation Calculator',
    description: 'Convert a number to and from scientific notation (a × 10ᵇ), or multiply and divide two numbers that are already written in scientific notation.',
    example: 'The speed of light, 299,792,458 m/s, is 2.99792458 × 10⁸ m/s in scientific notation.',
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is scientific notation?',
        paragraphs: [
          'Scientific notation writes a number as a × 10ᵇ, where a (the coefficient) is between 1 and 10 and b (the exponent) is an integer. It is the standard way to write very large or very small numbers compactly and consistently — the speed of light, 299,792,458 m/s, becomes the far more manageable 2.99792458 × 10⁸ m/s, and a measurement like 0.0000012 meters becomes 1.2 × 10⁻⁶ meters.',
          'The exponent tells you how many places the decimal point moves: a positive exponent means a large number (move the decimal point right), a negative exponent means a small number (move it left). Chemistry, physics, and astronomy lean on scientific notation constantly, since quantities there routinely span dozens of orders of magnitude — from the size of an atom to the distance to a star.',
          'This calculator handles the two directions people need most: converting a plain number into scientific notation (or the reverse), and multiplying or dividing two numbers that are already written in that form, which comes up often in science coursework.'
        ]
      },
      howTo: {
        intro: 'Pick a mode, then fill in the fields it uses. The result updates as you type.',
        steps: [
          { name: 'Choose a mode', text: 'Convert a plain number to scientific notation, convert scientific notation back to a plain number, or multiply or divide two numbers already in scientific notation.' },
          { name: 'Enter a plain number (mode 1)', text: 'Type any number. It does not need to already be between 1 and 10 — the calculator normalizes it.' },
          { name: 'Enter a coefficient and exponent (modes 2-4)', text: 'The coefficient is the "a" in a × 10ᵇ; the exponent is "b". For multiply or divide, enter a second coefficient and exponent as well.' },
          { name: 'Read the result', text: 'The result shows the decimal value, plus the coefficient and exponent of its scientific-notation form.' },
          { name: 'Check the scale', text: 'The chart places the result on a scale spanning atomic to astronomical magnitudes, alongside two reference points.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Converting is a direct substitution. Multiplying and dividing combine the coefficients and add or subtract the exponents, then renormalize if the coefficient drifts outside the 1-10 range.',
        expression: 'a × 10ᵇ  (1 ≤ |a| < 10, b an integer)\n(a₁ × 10^b₁) × (a₂ × 10^b₂) = (a₁ × a₂) × 10^(b₁ + b₂)\n(a₁ × 10^b₁) ÷ (a₂ × 10^b₂) = (a₁ ÷ a₂) × 10^(b₁ − b₂)',
        terms: [
          { symbol: 'a', meaning: 'The coefficient (also called the mantissa or significand) — always between 1 and 10 in standard form.' },
          { symbol: 'b', meaning: 'The exponent — the power of 10, which can be positive, negative or zero.' }
        ],
        note: 'If multiplying or dividing leaves the coefficient outside the 1-10 range (such as 30, from 6 × 5), the result is renormalized — 30 × 10⁵ becomes 3 × 10⁶, with the exponent adjusted to compensate.'
      },
      workedExample: {
        intro: 'The same relationship, used four ways.',
        rows: [
          { label: 'Convert 299,792,458 to scientific notation', value: '2.99792458 × 10⁸' },
          { label: 'Convert 4 × 10³ to a plain number', value: '4,000' },
          { label: '(4 × 10³) × (2 × 10²)', value: '8 × 10⁵ = 800,000' },
          { label: '(4 × 10³) ÷ (2 × 10²)', value: '2 × 10¹ = 20' }
        ],
        result: '2.99792458 × 10⁸ · 4,000 · 8 × 10⁵ · 2 × 10¹',
        explanation: 'A multiplication that pushes the coefficient past 10 renormalizes automatically: (6 × 10³) × (5 × 10²) multiplies to 30 × 10⁵, which is not standard form (30 is not between 1 and 10), so it becomes 3 × 10⁶ instead — the same value, written correctly.'
      },
      watchOut: [
        { title: 'Zero has no true scientific notation', body: 'There is no exponent that turns 0 into a number between 1 and 10, since 0 divided by any power of 10 is still 0. This calculator shows 0 as 0 × 10⁰ by convention rather than returning no answer.' },
        { title: 'The coefficient must stay between 1 and 10', body: 'A raw multiplication or division can briefly produce a coefficient of 30 or 0.5; this calculator renormalizes it back into the 1-10 range and adjusts the exponent to match, so the displayed answer is always in standard form.' },
        { title: 'Dividing by a zero coefficient is still dividing by zero', body: 'If the second number in a division has a coefficient of 0, the whole second number is 0 (0 × any power of 10 is 0), and dividing by it has no defined answer.' },
        { title: 'Floating-point numbers have limited precision', body: 'Computers store numbers in IEEE 754 binary64, which holds roughly 15-17 significant decimal digits. A coefficient typed with more digits than that will be rounded internally — not a bug specific to this calculator, but a limit of how computers represent numbers generally.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §10.5 Integer Exponents and Scientific Notation', url: 'https://openstax.org/books/prealgebra-2e/pages/10-5-integer-exponents-and-scientific-notation' },
        { label: 'NIST, CODATA value: speed of light in vacuum', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?c' },
        { label: 'NIST, CODATA value: Avogadro constant', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?na' },
        { label: 'NIST, Metric (SI) Prefixes', url: 'https://www.nist.gov/pml/owm/metric-si-prefixes' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'What do you want to do?',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Convert a number to scientific notation' },
          { value: 2, label: 'Convert scientific notation to a number' },
          { value: 3, label: 'Multiply two scientific-notation numbers' },
          { value: 4, label: 'Divide two scientific-notation numbers' }
        ]
      },
      { id: 'value', label: 'Number (mode 1)', type: 'number', placeholder: '299792458', defaultValue: 299792458, step: 1 },
      { id: 'coefficient', label: 'Coefficient, a (modes 2-4)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1 },
      { id: 'exponent', label: 'Exponent, b (modes 2-4)', type: 'number', placeholder: '3', defaultValue: 3, step: 1 },
      { id: 'coefficient2', label: 'Second coefficient (modes 3-4)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.1 },
      { id: 'exponent2', label: 'Second exponent (modes 3-4)', type: 'number', placeholder: '2', defaultValue: 2, step: 1 }
    ],
    breakdown: {
      headline: 'resultPlain',
      headlineLabel: 'Result (decimal)',
      outputs: [
        { id: 'resultPlain', label: 'Result (decimal)', format: 'significant' },
        { id: 'resultCoefficient', label: 'Coefficient, a', format: 'significant' },
        { id: 'resultExponent', label: 'Exponent, b (power of 10)', format: 'integer' }
      ],
      groups: [
        { inputs: ['mode', 'value'] },
        { title: 'First number in scientific notation (modes 2-4)', inputs: ['coefficient', 'exponent'], optional: true },
        { title: 'Second number (multiply / divide only)', inputs: ['coefficient2', 'exponent2'], optional: true }
      ],
      visual: {
        type: 'logScale',
        value: 'resultPlain',
        min: -9,
        max: 27,
        ticks: ['10⁻⁹', '10⁻³', '10³', '10⁹', '10¹⁵', '10²¹', '10²⁷'],
        benchmarks: [
          { label: '1 nanometer (10⁻⁹ m)', value: 1e-9 },
          { label: 'Avogadro constant (~6.022 × 10²³ /mol)', value: 6.02214076e23 }
        ],
        title: 'How big is the result?',
        valueLabel: 'Your result'
      }
    },
    seo: {
      title: 'Scientific Notation Calculator – Convert, Multiply, Divide',
      description: 'Free scientific notation calculator. Convert a number to and from a × 10^b form, or multiply and divide two scientific-notation numbers.',
      faq: [
        { question: 'How do I convert a number to scientific notation?', answer: 'Write it as a × 10ᵇ with a between 1 and 10. 299,792,458 becomes 2.99792458 × 10⁸, since moving the decimal point 8 places left gives a coefficient of 2.99792458.' },
        { question: 'How do I convert scientific notation back to a plain number?', answer: 'Multiply the coefficient by 10 raised to the exponent. 4 × 10³ = 4 × 1,000 = 4,000.' },
        { question: 'How do I multiply two numbers in scientific notation?', answer: 'Multiply the coefficients and add the exponents: (4×10³) × (2×10²) = (4×2) × 10^(3+2) = 8 × 10⁵ = 800,000.' },
        { question: 'How do I divide two numbers in scientific notation?', answer: 'Divide the coefficients and subtract the exponents: (4×10³) ÷ (2×10²) = (4÷2) × 10^(3-2) = 2 × 10¹ = 20.' },
        { question: 'What if the coefficient ends up above 10 after multiplying?', answer: 'Renormalize it: divide the coefficient by 10 and add 1 to the exponent, repeating until it is back between 1 and 10. 30 × 10⁵ becomes 3 × 10⁶.' },
        { question: 'Why is scientific notation used in science?', answer: 'Physical quantities span enormous ranges — from the size of an atom to the distance between galaxies — and scientific notation keeps numbers at any scale equally compact and easy to compare.' },
        { question: 'What does a negative exponent mean?', answer: 'It means the number is smaller than 1. 1.2 × 10⁻⁶ equals 0.0000012 — the decimal point moves 6 places to the left.' },
        { question: 'How is scientific notation written in standard form?', answer: 'Standard (normalized) form always keeps the coefficient between 1 and 10; 42 × 10⁵ is correct arithmetic but not standard form, which would be 4.2 × 10⁶.' }
      ]
    },
    compute(values) {
      const { mode, value, coefficient, exponent, coefficient2, exponent2 } = values;
      let resultCoefficient: number;
      let resultExponent: number;
      let resultPlain: number;
      if (mode === 2) {
        [resultCoefficient, resultExponent] = normalizeScientific(coefficient, exponent);
        resultPlain = coefficient * 10 ** exponent;
      } else if (mode === 3) {
        [resultCoefficient, resultExponent] = normalizeScientific(coefficient * coefficient2, exponent + exponent2);
        resultPlain = resultCoefficient * 10 ** resultExponent;
      } else if (mode === 4) {
        if (coefficient2 === 0) {
          resultCoefficient = NaN;
          resultExponent = NaN;
          resultPlain = NaN;
        } else {
          [resultCoefficient, resultExponent] = normalizeScientific(coefficient / coefficient2, exponent - exponent2);
          resultPlain = resultCoefficient * 10 ** resultExponent;
        }
      } else {
        [resultCoefficient, resultExponent] = toScientific(value); // mode 1, and the safe fallback for any other value
        resultPlain = value;
      }
      return { resultCoefficient, resultExponent, resultPlain };
    }
  },
  {
    id: 'exponent-calculator',
    category: 'math',
    glyph: 'xⁿ',
    updatedAt: '2026-10-21',
    aliases: ['power calculator', 'base and exponent calculator', 'exponentiation calculator', 'x to the power of y calculator'],
    related: ['scientific-notation-calculator', 'fraction-calculator', 'ratio-calculator', 'percentage-calculator'],
    title: 'Exponent Calculator',
    description: 'Raise a base to a power — or enter the result instead and solve for the base or the exponent — the relationship behind squares, cubes, compound growth, and scientific notation.',
    example: '2 raised to the 10th power is 1,024. Flip it around: what power of 2 gives 1,024? Also 10.',
    solver: {
      defaultTarget: 'result',
      variables: [
        { id: 'base', label: 'Base', symbol: 'b', dimension: 'count', defaultValue: 2, defaultUnit: 'count' },
        { id: 'exponent', label: 'Exponent', symbol: 'n', dimension: 'count', defaultValue: 10, defaultUnit: 'count' },
        { id: 'result', label: 'Result', symbol: 'bⁿ', dimension: 'count', defaultValue: 1024, defaultUnit: 'count' }
      ],
      solve: {
        result: ({ base, exponent }) => base ** exponent,
        base: ({ exponent, result }) => {
          if (exponent === 0) return NaN; // any nonzero base to the 0 is 1: not a unique base
          if (result === 0) return exponent > 0 ? 0 : NaN;
          if (result < 0) {
            // A real root of a negative number only exists for an odd integer exponent.
            if (!Number.isInteger(exponent) || exponent % 2 === 0) return NaN;
            return -((-result) ** (1 / exponent));
          }
          return result ** (1 / exponent);
        },
        exponent: ({ base, result }) => {
          if (base <= 0 || base === 1) return NaN; // log base undefined for base <= 0, and log base 1 is always 0
          if (result <= 0) return NaN; // no real log of a non-positive number
          return Math.log(result) / Math.log(base);
        }
      },
      visuals: [
        {
          type: 'logScale',
          value: 'result',
          min: -3,
          max: 15,
          ticks: ['10⁻³', '10⁰', '10³', '10⁶', '10⁹', '10¹²', '10¹⁵'],
          benchmarks: [
            { label: '2¹⁰ = 1,024 (the "kibi" binary prefix)', value: 1024 },
            { label: '10⁶ (one million)', value: 1e6 },
            { label: '10⁹ (one billion)', value: 1e9 }
          ],
          title: 'How big is the result?',
          valueLabel: 'Your result'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is an exponent?',
        paragraphs: [
          'An exponent tells you how many times to multiply a base by itself: 2³ (read "2 to the power of 3," or "2 cubed") means 2 × 2 × 2 = 8. The base is the number being multiplied; the exponent (or "power") is the small raised number counting how many times. This shorthand is what makes exponents useful well beyond simple repeated multiplication — compound interest, population growth, and computer memory sizes (1 kibibyte = 2¹⁰ bytes) all rely on it.',
          'The definition extends smoothly past positive whole numbers: any nonzero base raised to the 0 power is 1, a negative exponent means "take the reciprocal" (2⁻³ = 1 ÷ 2³ = 0.125), and a fractional exponent means a root (a base to the power 1/2 is its square root). This calculator also works the relationship backward: given the base and the result, it finds the exponent using a logarithm; given the exponent and the result, it finds the base using a root.',
          'Not every combination has a real-number answer. Raising a negative number to a fractional exponent, or trying to find a logarithm of zero or a negative number, falls outside the real numbers for most cases — see "Watch out" below for exactly where this calculator draws the line and why.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the three fields — base, exponent, result — and the third, marked auto, is calculated.',
        steps: [
          { name: 'Raise a base to a power', text: 'Enter the base and exponent. The result field, marked auto, fills in as base raised to that exponent.' },
          { name: 'Solve for the base', text: 'Enter the exponent and the result to find what base produces it — the exponent\'s root of the result.' },
          { name: 'Solve for the exponent', text: 'Enter the base and the result to find what power the base must be raised to — a logarithm.' },
          { name: 'Switch which field is calculated', text: 'Type into the auto field and it becomes an input again; the field you left alone the longest becomes the new calculated one.' },
          { name: 'See the scale', text: 'The chart places your result on a scale from thousandths to quadrillions, next to a few everyday reference points.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'One relationship, rearranged three ways.',
        expression: 'result = baseⁿ\nbase = result^(1 ÷ n)  (when a real solution exists)\nn = log(result) ÷ log(base)  (when base > 0, base ≠ 1, and result > 0)',
        terms: [
          { symbol: 'base', meaning: 'The number being multiplied by itself.' },
          { symbol: 'n (exponent)', meaning: 'How many times the base is multiplied by itself — extended to 0, negative and fractional values.' },
          { symbol: 'result', meaning: 'The base raised to the exponent, also called the power.' }
        ],
        note: '0⁰ is taken as 1 here, a widely used convention (not a derived fact) that keeps formulas like the binomial theorem and power series working cleanly at the edge case.'
      },
      workedExample: {
        intro: '2 raised to the 10th power — and the same relationship solved backward.',
        rows: [
          { label: 'Forward: 2¹⁰', value: '2×2×2×2×2×2×2×2×2×2 = 1,024' },
          { label: 'Solve for the base, given n = 10 and result = 1,024', value: '1,024^(1/10) = 2' },
          { label: 'Solve for the exponent, given base = 2 and result = 1,024', value: 'log(1,024) ÷ log(2) = 10' }
        ],
        result: '2¹⁰ = 1,024',
        explanation: '1,024 is also the "kibi" binary prefix used for computer memory (1 kibibyte = 2¹⁰ bytes = 1,024 bytes), one reason powers of 2 show up constantly in computing.'
      },
      watchOut: [
        { title: '0 to the power 0 is treated as 1', body: 'This is a mathematical convention, not a fact derived from the usual rules of exponents — some contexts (particularly limits in calculus) instead call 0⁰ an indeterminate form. This calculator follows the common computing and algebra convention of 0⁰ = 1.' },
        { title: 'A negative base with a non-integer exponent has no real answer', body: 'Raising a negative number to a fractional power generally requires complex numbers — except for exponents that reduce to a fraction with an odd denominator (an odd root), such as 1/3. This calculator only evaluates negative bases with whole-number exponents; a dedicated root calculator is the better tool for odd roots of negative numbers.' },
        { title: 'Solving for the exponent needs a positive base that is not 1, and a positive result', body: 'A logarithm is undefined for a base of 0 or a negative base, and taking log base 1 always gives 0 regardless of the result (since 1 raised to any power is still 1) — so no unique exponent exists. The result must also be positive, since a positive base can never produce a negative or zero result.' },
        { title: 'A negative exponent means a reciprocal, not a negative result', body: '2⁻³ is 1 ÷ 2³ = 0.125, a small positive number — not −8. The sign of the exponent controls whether the base is multiplied or divided, not the sign of the result.' },
        { title: 'Very large bases and exponents can overflow', body: 'Extremely large combinations, such as a large base raised to a large exponent, can exceed the largest number a computer can represent and show no finite answer at all, the same way a calculator display would show an overflow error.' }
      ],
      references: [
        { label: 'Wolfram MathWorld, Exponent Laws', url: 'https://mathworld.wolfram.com/ExponentLaws.html' },
        { label: 'OpenStax, Prealgebra 2e, §10.5 Integer Exponents and Scientific Notation', url: 'https://openstax.org/books/prealgebra-2e/pages/10-5-integer-exponents-and-scientific-notation' },
        { label: 'NIST, Prefixes for Binary Multiples', url: 'https://physics.nist.gov/cuu/Units/binary.html' }
      ]
    },
    inputs: [
      { id: 'base', label: 'Base', type: 'number', placeholder: '2', defaultValue: 2, step: 1 },
      { id: 'exponent', label: 'Exponent', type: 'number', placeholder: '10', defaultValue: 10, step: 1 }
    ],
    seo: {
      title: 'Exponent Calculator – Powers, Bases & Roots',
      description: 'Free exponent calculator. Raise a base to a power, or solve for the base or the exponent instead — covers zero, negative and fractional exponents.',
      faq: [
        { question: 'How do I calculate an exponent?', answer: 'Multiply the base by itself as many times as the exponent says. 2⁴ = 2 × 2 × 2 × 2 = 16.' },
        { question: 'What is a number to the power of 0?', answer: 'Any nonzero number raised to the power 0 equals 1. This follows from the pattern of dividing by the base one more time for each exponent that decreases by 1 (2³=8, 2²=4, 2¹=2, 2⁰=1).' },
        { question: 'What does a negative exponent mean?', answer: 'It means take the reciprocal of the positive-exponent version: 2⁻³ = 1 ÷ 2³ = 1/8 = 0.125.' },
        { question: 'What does a fractional exponent mean?', answer: 'It means a root. A base to the power 1/2 is its square root, and a base to the power 1/3 is its cube root: 8^(1/3) = 2.' },
        { question: 'What is 0 to the power of 0?', answer: 'By a widely used convention, this calculator treats it as 1, though it is sometimes called an indeterminate form in calculus rather than a derived value.' },
        { question: 'Can you raise a negative number to a power?', answer: 'Yes, for a whole-number exponent: (−2)³ = −8 and (−2)⁴ = 16. A negative number raised to a non-integer exponent generally has no real-number answer.' },
        { question: 'How do I solve for the exponent?', answer: 'Use a logarithm: exponent = log(result) ÷ log(base). For base 2 and result 1,024, that is log(1024) ÷ log(2) = 10.' },
        { question: 'How do I solve for the base?', answer: 'Take the exponent-th root of the result: base = result^(1 ÷ exponent). For exponent 10 and result 1,024, that is 1,024^(1/10) = 2.' }
      ]
    },
    compute(values) {
      const { base, exponent } = values;
      return { result: base ** exponent };
    }
  },
  {
    id: 'square-root-calculator',
    category: 'math',
    glyph: '√x',
    updatedAt: '2026-10-21',
    aliases: ['sqrt calculator', 'square root of a number calculator', 'find the square root calculator', 'radical calculator', 'perfect square calculator'],
    related: ['cube-root-calculator', 'exponent-calculator', 'factorial-calculator', 'gcf-calculator'],
    title: 'Square Root Calculator',
    description: 'Find the square root of a number, or work backward from a square root to the original number — the principal (nonnegative) root, with negative numbers flagged as having no real answer.',
    example: 'The square root of 144 is 12, since 12 × 12 = 144. Not every square root is a whole number — √50 is irrational, about 7.0711.',
    solver: {
      defaultTarget: 'squareRoot',
      variables: [
        { id: 'radicand', label: 'Number (radicand)', symbol: 'x', dimension: 'count', defaultValue: 144, defaultUnit: 'count' },
        { id: 'squareRoot', label: 'Square root', symbol: '√x', dimension: 'count', defaultValue: 12, defaultUnit: 'count' }
      ],
      solve: {
        squareRoot: ({ radicand }) => (radicand < 0 ? NaN : Math.sqrt(radicand)),
        radicand: ({ squareRoot }) => squareRoot ** 2
      },
      visuals: [{ type: 'compareBars', bars: [{ from: 'radicand', label: 'Your number' }, { from: 'squareRoot', label: 'Its square root' }], title: 'Your number vs its square root' }]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is a square root?',
        paragraphs: [
          'The square root of a number x is a number r that, multiplied by itself, gives x back: r × r = x. Every positive number actually has two square roots, one positive and one negative (3 × 3 = 9, and so does −3 × −3 = 9), but the radical sign √ by convention always means the positive one, called the principal square root. "The square root of 9" means 3, not −3, unless a problem says otherwise.',
          'Numbers whose square root is a whole number — 1, 4, 9, 16, 25, and so on — are called perfect squares. Most numbers are not perfect squares, so their square roots are irrational: an endless, non-repeating decimal, like √2 ≈ 1.4142135... This calculator shows a rounded decimal for those, and also works backward — given a square root, it finds the number it came from by squaring.',
          'A square root is really just a fractional exponent in disguise: x^(1/2) means exactly the same thing as √x. If you need other fractional or negative powers, not just the one-half case, the exponent calculator on this site handles the general relationship — see it for roots beyond the second power, too, alongside the dedicated cube root calculator for third powers.'
        ]
      },
      howTo: {
        intro: 'Enter either the number or its square root — the other field, marked auto, is calculated.',
        steps: [
          { name: 'Find a square root', text: 'Enter the number (the radicand). The square root field, marked auto, fills in with the principal (nonnegative) root.' },
          { name: 'Work backward', text: 'Type into the square root field instead, and the radicand updates to that value squared.' },
          { name: 'Switch which field is calculated', text: 'Typing into the auto field hands "auto" back to the other one.' },
          { name: 'Read a non-perfect-square result', text: 'If the number is not a perfect square, the result is a rounded decimal approximation of an irrational number, not an exact value.' },
          { name: 'Compare the two values', text: 'The chart shows your number next to its square root, so the size of the gap between them is visible at a glance.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'A square root undoes squaring. The two directions of the same relationship:',
        expression: 'r = √x = x^(1/2)  (for x ≥ 0)\nx = r²',
        terms: [
          { symbol: 'x (radicand)', meaning: 'The number you are taking the root of. Must be zero or positive for a real result.' },
          { symbol: 'r (square root)', meaning: 'The principal (nonnegative) number that, squared, gives x back.' }
        ],
        note: 'A square root is the exponent-1/2 case of the general base-to-a-power relationship. For any other fractional or negative exponent, use the exponent calculator; for the exponent-1/3 (cube root) case specifically, use the cube root calculator.'
      },
      workedExample: {
        intro: '50 is not a perfect square, so estimate √50 before finding its decimal value.',
        rows: [
          { label: 'Nearest perfect squares', value: '7² = 49 and 8² = 64' },
          { label: 'Since 49 < 50 < 64', value: '√50 is between 7 and 8, closer to 7 (50 is closer to 49 than to 64)' },
          { label: 'Decimal value', value: '√50 ≈ 7.0711' },
          { label: 'Check', value: '7.0711² ≈ 50.0005 (rounding error from the 4-decimal approximation)' }
        ],
        result: '√50 ≈ 7.0711',
        explanation: 'Bracketing a square root between two consecutive perfect squares is a quick way to sanity-check a calculator result by hand, and it is exactly how this calculator\'s own answer can be spot-verified without one.'
      },
      watchOut: [
        { title: 'Negative numbers have no real square root', body: 'There is no real number that, squared, gives a negative result — a square (positive × positive, or negative × negative) is never negative. This calculator returns no answer for a negative radicand rather than a misleading one; extending the idea to negative numbers requires the imaginary unit i and complex numbers, a separate topic.' },
        { title: 'Every positive number has two square roots', body: 'Both 3 and −3 square to 9, but the radical sign √ by convention refers only to the nonnegative one. This calculator always reports that principal root.' },
        { title: 'Solving backward does not preserve a negative sign', body: 'Typing −3 into the square root field computes its square, 9, correctly — but solving forward from 9 again returns +3, not −3, since the forward direction always reports the principal root. The two directions are not perfectly symmetric for negative inputs.' },
        { title: 'Most square roots are irrational', body: 'Only perfect squares (1, 4, 9, 16, 25, ...) have a whole-number square root. Everything else, like √2 or √50, is shown as a rounded decimal, not an exact value.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §5.7 Simplify and Use Square Roots', url: 'https://openstax.org/books/prealgebra-2e/pages/5-7-simplify-and-use-square-roots' },
        { label: 'Wolfram MathWorld, Square Root', url: 'https://mathworld.wolfram.com/SquareRoot.html' }
      ]
    },
    inputs: [{ id: 'radicand', label: 'Number (radicand)', type: 'number', placeholder: '144', defaultValue: 144, step: 1 }],
    seo: {
      title: 'Square Root Calculator – Find √x or Solve Backward',
      description: 'Free square root calculator. Find the square root of any number, or solve backward from a square root to the original number.',
      faq: [
        { question: 'What is the square root of 144?', answer: '12, since 12 × 12 = 144.' },
        { question: 'What is the square root of 2?', answer: 'An irrational number, approximately 1.4142. It never terminates or repeats.' },
        { question: 'What is the square root of a negative number?', answer: 'There is no real-number answer, since no real number squared is negative. This needs complex numbers (multiples of the imaginary unit i), which this calculator does not compute.' },
        { question: 'How do you estimate a square root that is not a perfect square?', answer: 'Find the two nearest perfect squares. √50 sits between 7² = 49 and 8² = 64, so √50 is between 7 and 8 — closer to 7, about 7.0711.' },
        { question: 'What is the difference between a square root and an exponent of 1/2?', answer: 'Nothing — they mean the same thing: x^(1/2) = √x. The exponent calculator on this site handles the general case for any power.' },
        { question: 'Can a square root be negative?', answer: 'A positive number has two square roots, +r and −r, but the radical sign √ by convention always refers to the nonnegative (principal) one.' },
        { question: 'Is 0 a perfect square?', answer: 'Yes. √0 = 0, since 0 × 0 = 0.' },
        { question: 'What is a perfect square?', answer: 'The square of a whole number — 1, 4, 9, 16, 25 and so on — whose square root is itself a whole number.' }
      ]
    },
    compute(values) {
      const radicand = values.radicand;
      return { squareRoot: radicand < 0 ? NaN : Math.sqrt(radicand) };
    }
  },
  {
    id: 'cube-root-calculator',
    category: 'math',
    glyph: '∛x',
    updatedAt: '2026-10-21',
    aliases: ['cube root of a number calculator', 'cbrt calculator', 'find the cube root calculator', 'third root calculator'],
    related: ['square-root-calculator', 'exponent-calculator', 'factorial-calculator', 'gcf-calculator'],
    title: 'Cube Root Calculator',
    description: 'Find the cube root of any real number, including negative numbers — unlike a square root, a cube root is always a real number.',
    example: 'The cube root of 27 is 3, since 3 × 3 × 3 = 27. Unlike square roots, cube roots are real even for negative numbers: the cube root of −8 is −2.',
    solver: {
      defaultTarget: 'cubeRoot',
      variables: [
        { id: 'radicand', label: 'Number (radicand)', symbol: 'x', dimension: 'count', defaultValue: 27, defaultUnit: 'count' },
        { id: 'cubeRoot', label: 'Cube root', symbol: '∛x', dimension: 'count', defaultValue: 3, defaultUnit: 'count' }
      ],
      solve: {
        cubeRoot: ({ radicand }) => Math.cbrt(radicand),
        radicand: ({ cubeRoot }) => cubeRoot ** 3
      },
      visuals: [{ type: 'compareBars', bars: [{ from: 'radicand', label: 'Your number' }, { from: 'cubeRoot', label: 'Its cube root' }], title: 'Your number vs its cube root' }]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is a cube root?',
        paragraphs: [
          'The cube root of a number x is a number r that, multiplied by itself three times, gives x back: r × r × r = x. 3 is the cube root of 27 because 3 × 3 × 3 = 27. Written with a radical, it is ∛x, or equivalently x^(1/3).',
          "A cube root behaves differently from a square root in one important way: every real number, including negative ones, has exactly one real cube root. The cube root of −8 is −2, because −2 × −2 × −2 = −8 (two of the three negative signs cancel, and the third one stays). A square root has no such negative case, because squaring a negative number always gives a positive result — cubing a negative number gives a negative result instead, which is exactly why an odd root (cube, fifth, seventh...) of a negative number stays real while an even root does not.",
          'Perfect cubes — 1, 8, 27, 64, 125, and so on — have a whole-number cube root. Everything else has an irrational cube root, shown here as a rounded decimal. This calculator also works backward: given a cube root, it cubes that value to find the original number.'
        ]
      },
      howTo: {
        intro: 'Enter either the number or its cube root — the other field, marked auto, is calculated.',
        steps: [
          { name: 'Find a cube root', text: 'Enter the number, positive or negative. The cube root field, marked auto, fills in automatically — there is no domain restriction to worry about.' },
          { name: 'Work backward', text: 'Type into the cube root field instead, and the number updates to that value cubed.' },
          { name: 'Switch which field is calculated', text: 'Typing into the auto field hands "auto" back to the other one.' },
          { name: 'Read a non-perfect-cube result', text: 'If the number is not a perfect cube, the result is a rounded decimal approximation.' },
          { name: 'Compare the two values', text: 'The chart shows your number next to its cube root.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'A cube root undoes cubing. The two directions of the same relationship:',
        expression: 'r = ∛x = x^(1/3)  (defined for every real x)\nx = r³',
        terms: [
          { symbol: 'x (radicand)', meaning: 'The number you are taking the root of. Can be positive, negative, or zero.' },
          { symbol: 'r (cube root)', meaning: 'The real number that, cubed, gives x back. Always exists and is unique for a real x.' }
        ],
        note: "This calculator computes the real cube root directly (JavaScript's Math.cbrt), not by raising a negative number to the power 1/3 — that naive approach produces no real answer for a negative base in most programming languages and calculators, even though the real cube root clearly exists."
      },
      workedExample: {
        intro: 'Find the cube root of −8, the case that trips up a square-root-style approach.',
        rows: [
          { label: 'Try r = −2', value: '(−2) × (−2) × (−2) = 4 × (−2) = −8' },
          { label: 'Check it matches x', value: '−8 = −8 ✓' }
        ],
        result: '∛(−8) = −2',
        explanation: 'The first two negative signs cancel in (−2) × (−2) = 4, and the third multiplication by −2 puts the sign back, landing on a negative result — which is exactly why every negative number has a real (negative) cube root, unlike a square root.'
      },
      watchOut: [
        { title: 'Cube roots of negative numbers are real', body: 'Unlike a square root, a cube root never runs out of real answers: ∛(−8) = −2, because (−2)³ = −8. This holds for any odd-numbered root (cube, fifth, seventh...) of a negative number.' },
        { title: 'Naive exponentiation can get this wrong', body: 'Computing a cube root as "raise to the power 1/3" fails for negative numbers in JavaScript and many calculators, returning no real answer even though one exists — this calculator computes the real cube root directly instead, so negative inputs work correctly.' },
        { title: 'Exactly one real cube root, always', body: "A positive number has two square roots but exactly one real cube root (a negative number has two more cube roots, but they involve imaginary numbers and are not real) — there is no 'principal vs. other root' ambiguity to resolve the way there is for even roots." },
        { title: 'Most cube roots are irrational', body: 'Only perfect cubes (1, 8, 27, 64, 125, ...) have a whole-number cube root. Everything else, like ∛10, is shown as a rounded decimal, not an exact value.' }
      ],
      references: [
        { label: 'OpenStax, Elementary Algebra 2e, §9.7 Higher Roots', url: 'https://openstax.org/books/elementary-algebra-2e/pages/9-7-higher-roots' },
        { label: 'Wolfram MathWorld, Cube Root', url: 'https://mathworld.wolfram.com/CubeRoot.html' }
      ]
    },
    inputs: [{ id: 'radicand', label: 'Number (radicand)', type: 'number', placeholder: '27', defaultValue: 27, step: 1 }],
    seo: {
      title: 'Cube Root Calculator – Real Roots, Even for Negatives',
      description: 'Free cube root calculator. Find the real cube root of any number, positive or negative, or solve backward from a cube root.',
      faq: [
        { question: 'What is the cube root of 27?', answer: '3, since 3 × 3 × 3 = 27.' },
        { question: 'What is the cube root of a negative number?', answer: "A real number, unlike a square root. The cube root of −8 is −2, because (−2)³ = −8." },
        { question: 'What is the cube root of 1000?', answer: '10, since 10 × 10 × 10 = 1,000.' },
        { question: 'What is the cube root of 0?', answer: '0, since 0 × 0 × 0 = 0.' },
        { question: 'Why does a cube root work for negative numbers but a square root does not?', answer: 'Squaring a negative number always gives a positive result, so no real number squares to a negative. Cubing a negative number gives a negative result, so a real cube root of a negative number always exists.' },
        { question: 'Is the cube root the same as an exponent of 1/3?', answer: 'Yes — x^(1/3) and ∛x mean exactly the same thing.' },
        { question: 'How many real cube roots does a number have?', answer: 'Exactly one. (There are two additional cube roots in the complex numbers, but only one is real.)' },
        { question: 'How do I find the cube root of a number by hand?', answer: 'Estimate between two perfect cubes — ∛20 is between ∛8 = 2 and ∛27 = 3, closer to 3 — then refine the decimal, the same bracketing technique used for square roots.' }
      ]
    },
    compute(values) {
      return { cubeRoot: Math.cbrt(values.radicand) };
    }
  },
  {
    id: 'logarithm-calculator',
    category: 'math',
    glyph: 'log',
    updatedAt: '2026-10-21',
    aliases: ['log calculator', 'log base calculator', 'natural log calculator', 'ln calculator', 'log base 2 calculator'],
    related: ['exponent-calculator', 'scientific-notation-calculator', 'square-root-calculator', 'cube-root-calculator'],
    title: 'Logarithm Calculator',
    description: 'Find the logarithm of a number in any base, or solve backward for the base or the argument — includes the natural log (ln) and common log (base 10) alongside the result.',
    example: 'log base 2 of 8 is 3, since 2³ = 8. Switch the base to compute a natural log (base e) or a common log (base 10) on the same relationship.',
    solver: {
      defaultTarget: 'result',
      variables: [
        { id: 'base', label: 'Base', symbol: 'b', dimension: 'count', defaultValue: 2, defaultUnit: 'count' },
        { id: 'argument', label: 'Argument', symbol: 'x', dimension: 'count', defaultValue: 8, defaultUnit: 'count' },
        { id: 'result', label: 'Logarithm', symbol: 'log_b(x)', dimension: 'count', defaultValue: 3, defaultUnit: 'count' }
      ],
      solve: {
        result: ({ base, argument }) => (base <= 0 || base === 1 || argument <= 0 ? NaN : Math.log(argument) / Math.log(base)),
        argument: ({ base, result }) => (base <= 0 || base === 1 ? NaN : base ** result),
        base: ({ argument, result }) => {
          if (argument <= 0 || result === 0) return NaN; // result 0 means x = b^0 = 1 for ANY base: no unique base
          const b = argument ** (1 / result);
          return b <= 0 || b === 1 ? NaN : b;
        }
      },
      outputs: [
        { id: 'naturalLog', label: 'Natural log (ln)', dimension: 'count', compute: (si) => (si.argument <= 0 ? NaN : Math.log(si.argument)) },
        { id: 'commonLog', label: 'Common log (log₁₀)', dimension: 'count', compute: (si) => (si.argument <= 0 ? NaN : Math.log10(si.argument)) }
      ],
      visuals: [
        {
          type: 'logScale',
          value: 'argument',
          min: -9,
          max: 27,
          ticks: ['10⁻⁹', '10⁻³', '10³', '10⁹', '10¹⁵', '10²¹', '10²⁷'],
          benchmarks: [
            { label: 'Neutral water, pH 7: [H⁺] = 10⁻⁷ mol/L', value: 1e-7 },
            { label: 'Avogadro constant (~6.022 × 10²³ /mol)', value: 6.02214076e23 }
          ],
          title: 'Where does your number sit on the scale?',
          valueLabel: 'Your argument'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is a logarithm?',
        paragraphs: [
          "A logarithm answers the question \"what power do I raise this base to, to get this number?\" log_b(x) = y means exactly the same thing as b^y = x — a logarithm and an exponent are two ways of writing the same relationship, just solved for a different variable. log base 2 of 8 is 3, because 2³ = 8.",
          'Two bases are common enough to have their own names and notation: base 10 is the "common log," written log(x) without a visible base, and base e (≈ 2.71828) is the "natural log," written ln(x). This calculator shows both alongside whatever base you actually chose, since converting between bases (the change-of-base formula) is just dividing one natural log by another: log_b(x) = ln(x) ÷ ln(b).',
          'Logarithms turn multiplication into addition and show up anywhere a quantity is naturally measured on a multiplicative scale rather than an additive one — pH, sound intensity in decibels, and earthquake magnitude are all logarithmic scales, which is why a "one-point" jump on any of them represents a tenfold (or similar) change, not a small one. This calculator also solves the relationship in the other two directions: given a base and a result, it finds the argument (which is itself an exponentiation, b^y); given an argument and a result, it finds the base — see the exponent calculator if what you actually have is a base and an exponent and want the result directly.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the three fields — base, argument, result — and the third, marked auto, is calculated.',
        steps: [
          { name: 'Find a logarithm', text: 'Enter the base and the argument. The result field, marked auto, fills in with log base b of the argument.' },
          { name: 'Solve for the argument', text: 'Enter the base and a result to find what argument produces it — this computes base raised to that result.' },
          { name: 'Solve for the base', text: 'Enter the argument and a result to find what base produces that logarithm.' },
          { name: 'Switch which field is calculated', text: 'Type into the auto field and it becomes an input again; the field left alone the longest becomes the new calculated one.' },
          { name: 'Check the natural and common log', text: 'Underneath the main result, the natural log (ln) and common log (base 10) of the same argument are shown for reference, regardless of which base you chose.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'A logarithm and an exponent describe the same relationship, rearranged for a different variable.',
        expression: 'log_b(x) = y  ⇔  b^y = x\nx = b^y\nb = x^(1/y)  (y ≠ 0)\nChange of base: log_b(x) = ln(x) ÷ ln(b)',
        terms: [
          { symbol: 'b (base)', meaning: 'The number being raised to a power. Must be positive and not equal to 1.' },
          { symbol: 'x (argument)', meaning: 'The number whose logarithm is being taken. Must be positive — no power of a positive base is ever zero or negative.' },
          { symbol: 'y (result)', meaning: 'The exponent that makes b^y equal x. Can be positive, negative, or zero.' }
        ],
        note: 'Solving for the base divides by the result in the exponent (b = x^(1/y)), so a result of exactly 0 has no unique base: any positive base b ≠ 1 satisfies b⁰ = 1, so this calculator reports no answer for that case rather than guessing one.'
      },
      workedExample: {
        intro: 'Find log base 2 of 8, then check it with the exponential form.',
        rows: [
          { label: 'Question', value: '2^y = 8 — what is y?' },
          { label: 'Try y = 3', value: '2³ = 2 × 2 × 2 = 8' },
          { label: 'Natural log, for reference', value: 'ln(8) ≈ 2.0794' },
          { label: 'Common log, for reference', value: 'log₁₀(8) ≈ 0.9031' }
        ],
        result: 'log₂(8) = 3',
        explanation: 'Every logarithm can be checked by converting it back to exponential form: log₂(8) = 3 is true exactly because 2³ = 8. The natural and common log of the same number 8 are different numbers from the base-2 result, because they ask the same question about a different base.'
      },
      watchOut: [
        { title: 'The base must be positive and not 1', body: 'A negative base makes repeated exponentiation behave inconsistently (alternating sign), and a base of 1 always produces 1 no matter the exponent, so no unique logarithm exists for either case — this calculator returns no answer for them.' },
        { title: 'The argument must be positive', body: 'A positive base raised to any real exponent is always positive, so there is no exponent that produces zero or a negative number. Logarithms of zero or negative numbers are undefined here (they are defined for complex numbers, a separate topic).' },
        { title: 'The logarithm of 1 is always 0, in any valid base', body: 'Because b⁰ = 1 for every base b, log_b(1) = 0 regardless of which base you pick — this is not a special case this calculator needs to guard against, just a fact worth knowing when sanity-checking a result.' },
        { title: 'A result of exactly 0 has no unique base to solve for', body: 'If the result is 0, the equation b⁰ = x only pins down x (it must be 1); any base at all satisfies it, so "solve for the base" has no single answer in that case.' }
      ],
      references: [
        { label: 'OpenStax, College Algebra 2e, §6.3 Logarithmic Functions', url: 'https://openstax.org/books/college-algebra-2e/pages/6-3-logarithmic-functions' },
        { label: 'NIST Digital Library of Mathematical Functions, §4.2 Logarithm, Exponential, Powers', url: 'https://dlmf.nist.gov/4.2' },
        { label: 'Wolfram MathWorld, Logarithm', url: 'https://mathworld.wolfram.com/Logarithm.html' }
      ]
    },
    inputs: [
      { id: 'base', label: 'Base', type: 'number', placeholder: '2', defaultValue: 2, step: 1 },
      { id: 'argument', label: 'Argument', type: 'number', placeholder: '8', defaultValue: 8, step: 1 }
    ],
    seo: {
      title: 'Logarithm Calculator – Log, Ln, and Any Base',
      description: 'Free logarithm calculator. Find log base b of a number, solve backward for the base or the argument, and see the natural and common log too.',
      faq: [
        { question: 'How do I calculate a logarithm?', answer: 'Ask what power the base must be raised to, to get the argument: log_b(x) = y means b^y = x. log base 2 of 8 is 3, since 2³ = 8.' },
        { question: 'What is a natural log?', answer: 'A logarithm with base e (≈ 2.71828), written ln(x). ln(8) ≈ 2.0794.' },
        { question: 'What is a common log?', answer: 'A logarithm with base 10, written log(x) or log₁₀(x). log₁₀(8) ≈ 0.9031.' },
        { question: 'Why can\'t you take the log of zero or a negative number?', answer: 'A positive base raised to any real exponent is always positive, so no exponent produces zero or a negative result. There is no real-number logarithm for those inputs.' },
        { question: 'What does log base 1 mean?', answer: 'Nothing well-defined: 1 raised to any power is always 1, so no exponent is uniquely tied to any other argument. This calculator excludes base 1.' },
        { question: 'How is a logarithm related to an exponent?', answer: 'They are inverses of each other. If b^y = x, then log_b(x) = y — the exponent calculator on this site solves the same relationship for the result or the base given an exponent, instead of for the exponent itself.' },
        { question: 'What is the change-of-base formula?', answer: 'log_b(x) = ln(x) ÷ ln(b), which lets you compute any base\'s logarithm using just the natural log.' },
        { question: 'What is log base 10 of 100?', answer: '2, since 10² = 100.' }
      ]
    },
    compute(values) {
      const { base, argument } = values;
      const validBase = base > 0 && base !== 1;
      const result = !validBase || argument <= 0 ? NaN : Math.log(argument) / Math.log(base);
      const naturalLog = argument <= 0 ? NaN : Math.log(argument);
      const commonLog = argument <= 0 ? NaN : Math.log10(argument);
      return { result, naturalLog, commonLog };
    }
  },
  {
    id: 'factorial-calculator',
    category: 'math',
    glyph: 'n!',
    updatedAt: '2026-10-21',
    aliases: ['n factorial calculator', 'x! calculator', 'factorial of a number calculator', 'permutations factorial calculator'],
    related: ['gcf-calculator', 'exponent-calculator', 'scientific-notation-calculator', 'rounding-calculator'],
    title: 'Factorial Calculator',
    description: 'Find n! (n factorial), the product of every whole number from n down to 1 — plus its exact digit count and trailing-zero count, computed with exact integer math.',
    example: '5! (5 factorial) is 5 × 4 × 3 × 2 × 1 = 120. Factorials grow fast: 20! already has 19 digits.',
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is a factorial?',
        paragraphs: [
          'The factorial of a non-negative whole number n, written n!, is the product of every whole number from n down to 1: 5! = 5 × 4 × 3 × 2 × 1 = 120. It counts the number of ways to put n distinct things in order — there are 5! = 120 ways to line up 5 people, because any of 5 can go first, any of the remaining 4 can go second, and so on.',
          'By convention, 0! = 1, not 0. This is not something you can get from repeated multiplication the way 5! comes from multiplying 5 numbers together — it reflects the combinatorial meaning instead: there is exactly one way to arrange zero objects (do nothing), so the "empty product" is defined as 1.',
          'Factorials grow extraordinarily fast — far faster than exponential growth. 10! is about 3.6 million, but 20! already has 19 digits, and 100! has 158 digits. This calculator shows the exact digit count and the number of trailing zeros using exact integer arithmetic, even once the headline value itself is too large to display digit-for-digit and has to switch to scientific notation. Factorials are central to combinatorics — counting permutations and combinations — and the idea extends to non-whole numbers through the Gamma function, a separate topic covered by the NIST reference below.'
        ]
      },
      howTo: {
        intro: 'Enter a whole number, 0 or larger. The result updates as you type.',
        steps: [
          { name: 'Enter n', text: 'Type a non-negative whole number. This calculator computes exactly for n up to 1,000.' },
          { name: 'Read the factorial', text: 'The headline shows n!. Once it exceeds about a billion (around 13!), it is shown in scientific notation, the standard way to display a number too long to write out in full.' },
          { name: 'Check the exact digit count', text: 'The digit count is computed with exact integer arithmetic, so it stays exact no matter how large n gets — even once the headline number itself is a rounded approximation.' },
          { name: 'Check the trailing zeros', text: 'The number of zeros at the end of n! (from every factor of 10 hidden inside the product) is also exact.' },
          { name: 'See the scale', text: 'The chart places n! on a scale from ordinary numbers to the astronomically large, next to a couple of reference factorials.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'A factorial is a product of consecutive whole numbers, defined by one simple rule for the base case.',
        expression: 'n! = n × (n − 1) × (n − 2) × ... × 2 × 1  (n ≥ 1)\n0! = 1  (by convention)',
        terms: [
          { symbol: 'n', meaning: 'A non-negative whole number. This calculator does not evaluate factorials of negative or non-integer numbers.' },
          { symbol: 'n!', meaning: 'The product of every whole number from n down to 1, or 1 when n = 0.' }
        ],
        note: 'The Gamma function, Γ(n + 1) = n!, extends the factorial to non-integer and complex numbers, but is a different (and more advanced) function from the plain integer factorial this calculator computes — see the NIST reference below.'
      },
      workedExample: {
        intro: 'Compute 20! and its digit count and trailing zeros.',
        rows: [
          { label: '20!', value: '2,432,902,008,176,640,000' },
          { label: 'Digit count', value: '19 digits' },
          { label: 'Trailing zeros', value: '4 (from 20÷5 = 4 multiples of 5 among 1...20, each pairing with a factor of 2 to make a 10)' }
        ],
        result: '20! = 2,432,902,008,176,640,000 — 19 digits, 4 trailing zeros',
        explanation: '20! is still small enough to show every digit exactly. By 171!, the exact value is a 310-digit number that exceeds what a standard 64-bit floating-point number can represent at all, and the headline becomes "Infinity" — the same overflow behavior as a basic calculator or a spreadsheet cell.'
      },
      watchOut: [
        { title: 'Only defined here for non-negative whole numbers', body: 'A negative number or a non-whole number (like 3.5) has no factorial under this definition — this calculator returns no answer for those. The Gamma function extends factorials to those cases, but is a separate, more advanced function.' },
        { title: '0! = 1, not 0', body: 'This follows from the combinatorial meaning (one way to arrange zero things), not from multiplying anything together — a common point of confusion, since every other factorial does come from a product.' },
        { title: 'Factorials overflow a standard floating-point number past 170!', body: '170! is already a 307-digit number, right at the edge of what a 64-bit floating-point value can represent; 171! exceeds it entirely, and the headline value becomes "Infinity" — a genuine overflow, not a bug, and the same thing a basic calculator shows for a number too big to hold.' },
        { title: 'Past about 15-17 significant digits, the headline number is rounded', body: 'A standard floating-point number only keeps about 15-17 significant decimal digits of precision, so once n! needs more digits than that to write out exactly (around 19! and up), the headline value shown in scientific notation is a correctly-rounded approximation, not the exact integer. The digit count and trailing-zero count, computed with exact integer math, stay exact at any size.' },
        { title: 'Computes exactly up to n = 1,000', body: 'This calculator has a practical cap at n = 1,000 (a 2,568-digit number) to keep every result instant; above that, it returns no answer.' }
      ],
      references: [
        { label: 'Wolfram MathWorld, Factorial', url: 'https://mathworld.wolfram.com/Factorial.html' },
        { label: 'NIST Digital Library of Mathematical Functions, §5.2 Gamma Function: Definitions', url: 'https://dlmf.nist.gov/5.2' }
      ]
    },
    inputs: [{ id: 'n', label: 'n', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 }],
    breakdown: {
      headline: 'factorialValue',
      headlineLabel: 'n!',
      outputs: [
        { id: 'factorialValue', label: 'n!', format: 'significant' },
        { id: 'digitCount', label: 'Exact digit count', format: 'integer' },
        { id: 'trailingZeros', label: 'Trailing zeros', format: 'integer' }
      ],
      groups: [{ inputs: ['n'] }],
      visual: {
        type: 'logScale',
        value: 'factorialValue',
        min: 0,
        max: 70,
        ticks: ['10⁰', '10¹⁰', '10²⁰', '10³⁰', '10⁴⁰', '10⁵⁰', '10⁶⁰', '10⁷⁰'],
        benchmarks: [
          { label: '10! = 3,628,800', value: 3628800 },
          { label: '52! ≈ 8.0658 × 10⁶⁷ (the ways to arrange a 52-card deck)', value: 8.065817517094388e67 }
        ],
        title: 'How big does n! get?',
        valueLabel: 'Your n!'
      }
    },
    seo: {
      title: 'Factorial Calculator – n!, Digits & Trailing Zeros',
      description: 'Free factorial calculator. Find n! for any non-negative whole number, with the exact digit count and trailing-zero count computed with exact integer math.',
      faq: [
        { question: 'What is 5 factorial?', answer: '5! = 5 × 4 × 3 × 2 × 1 = 120.' },
        { question: 'What is 0 factorial?', answer: '0! = 1, by the convention that there is exactly one way to arrange zero objects.' },
        { question: 'What is 10 factorial?', answer: '10! = 3,628,800.' },
        { question: 'How many digits does 100! have?', answer: '158 digits.' },
        { question: 'How many trailing zeros does 100! have?', answer: '24, from counting the multiples of 5 (and 25) among 1 through 100: ⌊100÷5⌋ + ⌊100÷25⌋ = 20 + 4 = 24.' },
        { question: 'Why does my calculator show "Infinity" for a large n?', answer: 'Once n! needs more digits than a 64-bit floating-point number can hold (past 170!), the exact value overflows and displays as Infinity — the same limit a basic calculator or spreadsheet hits.' },
        { question: 'Can you take the factorial of a negative or decimal number?', answer: 'Not with the plain factorial definition used here. The Gamma function extends factorial-like behavior to those numbers, but is a separate, more advanced function.' },
        { question: 'What are factorials used for?', answer: 'Counting the number of ways to arrange or order things (permutations), and as a building block of combinations and probability.' }
      ]
    },
    compute(values) {
      const n = Math.round(values.n);
      const noAnswer = { factorialValue: NaN, digitCount: NaN, trailingZeros: NaN };
      if (!Number.isInteger(n) || n < 0 || n > 1000) return noAnswer;

      let big = 1n;
      for (let i = 2n; i <= BigInt(n); i++) big *= i;
      const factorialValue = Number(big);
      const digitCount = big.toString().length;

      let trailingZeros = 0;
      let power = 5;
      while (power <= n) {
        trailingZeros += Math.floor(n / power);
        power *= 5;
      }
      return { factorialValue, digitCount, trailingZeros };
    }
  },
  {
    id: 'gcf-calculator',
    category: 'math',
    glyph: 'GCF',
    updatedAt: '2026-10-21',
    aliases: ['greatest common factor calculator', 'gcd calculator', 'hcf calculator', 'greatest common divisor calculator', 'gcf of two numbers calculator'],
    related: ['fraction-calculator', 'ratio-calculator', 'factorial-calculator', 'exponent-calculator'],
    title: 'GCF Calculator',
    description: 'Find the greatest common factor (GCF, also called GCD or HCF) of 2 to 4 numbers — the largest number that divides every one of them exactly.',
    example: 'The greatest common factor of 12 and 18 is 6 — the largest number that divides both exactly. Add a third number, like 24, and the GCF is still 6.',
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What is the greatest common factor?',
        paragraphs: [
          "The greatest common factor (GCF) of two or more numbers is the largest number that divides every one of them with no remainder. The GCF of 12 and 18 is 6, since 6 divides both exactly (12 ÷ 6 = 2, 18 ÷ 6 = 3) and no larger number does. It is also called the greatest common divisor (GCD) or, in some countries, the highest common factor (HCF) — three names for exactly the same thing.",
          'One standard way to find it is to break each number into prime factors and multiply together whatever primes they all share: 12 = 2² × 3 and 18 = 2 × 3², and the factors they have in common are one 2 and one 3, so the GCF is 2 × 3 = 6. A faster method for large numbers is the Euclidean algorithm, which repeatedly replaces the larger number with the remainder of dividing it by the smaller one until nothing is left — that method is what this calculator actually runs.',
          'The GCF of three or more numbers works the same way, found two at a time: GCF(12, 18, 24) = GCF(GCF(12, 18), 24) = GCF(6, 24) = 6. The GCF is exactly the tool behind simplifying a fraction or a ratio to lowest terms — this site\'s fraction calculator and ratio calculator both divide by the GCF internally to reduce their answers, so a fraction like 12/18 and a ratio like 12:18 both reduce to 2:3 for the same underlying reason.'
        ]
      },
      howTo: {
        intro: 'Choose how many numbers you have (2 to 4), then enter exactly that many.',
        steps: [
          { name: 'Choose how many numbers', text: 'Set "How many numbers?" to 2, 3 or 4. Only that many of the number fields below are used, in order starting from Number 1.' },
          { name: 'Enter your numbers', text: 'Type the numbers you want the greatest common factor of. Order does not matter.' },
          { name: 'Read the GCF', text: 'The headline shows the largest number that divides every one of your numbers exactly.' },
          { name: 'Check the summary', text: 'The breakdown also confirms how many numbers were used, in case the count got left on something other than what you intended.' },
          { name: 'See it visually', text: 'The chart shows your smallest number, your largest number, and the GCF side by side.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The Euclidean algorithm finds the GCF of two numbers by repeated division, without needing to factor either one.',
        expression: 'GCF(a, 0) = a\nGCF(a, b) = GCF(b, a mod b)  for b ≠ 0\nGCF(a, b, c) = GCF(GCF(a, b), c)',
        terms: [
          { symbol: 'a mod b', meaning: 'The remainder left over after dividing a by b.' },
          { symbol: 'GCF(a, b, c)', meaning: 'The GCF of three or more numbers, found by taking the GCF of two at a time.' }
        ],
        note: 'Numbers are compared by their absolute value (so the GCF of a negative number is the same as for its positive version), and are rounded to the nearest whole number first, since the greatest common factor is only defined for integers.'
      },
      workedExample: {
        intro: 'Find the GCF of 12, 18 and 24 using prime factorization, then check it against the Euclidean algorithm this calculator actually uses.',
        rows: [
          { label: 'Prime factorize each number', value: '12 = 2² × 3, 18 = 2 × 3², 24 = 2³ × 3' },
          { label: 'Lowest power of each shared prime', value: '2¹ and 3¹ are common to all three' },
          { label: 'Multiply the shared primes', value: '2 × 3 = 6' },
          { label: 'Check with the Euclidean algorithm', value: 'GCF(12, 18) = 6, then GCF(6, 24) = 6' }
        ],
        result: 'GCF(12, 18, 24) = 6',
        explanation: 'Both methods agree, as they always will — prime factorization and the Euclidean algorithm are two different ways of answering exactly the same question. 12 ÷ 6 = 2, 18 ÷ 6 = 3, and 24 ÷ 6 = 4, all with no remainder, confirming 6 divides every one of the three numbers.'
      },
      watchOut: [
        { title: 'The GCF of 0 and a number is that number', body: 'GCF(0, 18) = 18, since every number divides 0 evenly (0 ÷ 18 = 0 exactly) and 18 is the largest number dividing 18 itself.' },
        { title: 'GCF(0, 0, ..., 0) is 0, by convention', body: 'Every integer divides 0, so there is no single largest common divisor among only zeros under the ordinary definition. Number theory resolves this by defining GCF(0, 0) = 0 directly, rather than leaving it undefined — the convention this calculator follows, cited below.' },
        { title: 'Negative numbers are compared by absolute value', body: 'GCF(−12, 18) is reported as 6, the same as GCF(12, 18), since the factors of −12 are the same set of numbers (up to sign) as the factors of 12 — the GCF itself is always shown as zero or positive.' },
        { title: 'Non-integer inputs are rounded first', body: 'The greatest common factor is only defined for whole numbers, so a decimal typed into any field is rounded to the nearest integer before this calculator computes anything with it.' },
        { title: 'An input beyond 9,007,199,254,740,991 is refused, not rounded silently', body: 'That number (2^53 − 1) is the largest whole number JavaScript can represent exactly. A number you type that is already larger than this has lost precision before this calculator ever sees it, so rather than compute a GCF from an already-wrong number, this calculator shows no answer for any input that large.' },
        { title: 'Not the same as the least common multiple', body: 'The GCF is the largest number that divides every input; the least common multiple (LCM) is the smallest number every input divides into — a related but different calculation, covered by its own calculator rather than this one.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §10.6 Introduction to Factoring Polynomials (Example 10.80, GCF of 24 and 36)', url: 'https://openstax.org/books/prealgebra-2e/pages/10-6-introduction-to-factoring-polynomials' },
        { label: 'Wolfram MathWorld, Greatest Common Divisor', url: 'https://mathworld.wolfram.com/GreatestCommonDivisor.html' },
        { label: 'Pete L. Clark, Elementary Number Theory (Mathematics LibreTexts), §6: Greatest Common Divisor — "We define gcd(0,0) = 0"', url: 'https://math.libretexts.org/Bookshelves/Combinatorics_and_Discrete_Mathematics/Elementary_Number_Theory_(Clark)/01%3A_Chapters/06%3A_Greatest_Common_Divisor' }
      ]
    },
    inputs: [
      {
        id: 'howMany',
        label: 'How many numbers?',
        type: 'number',
        placeholder: '2',
        defaultValue: 2,
        step: 1,
        min: 2,
        options: [
          { value: 2, label: '2 numbers' },
          { value: 3, label: '3 numbers' },
          { value: 4, label: '4 numbers' }
        ]
      },
      { id: 'num1', label: 'Number 1', type: 'number', placeholder: '12', defaultValue: 12, step: 1 },
      { id: 'num2', label: 'Number 2', type: 'number', placeholder: '18', defaultValue: 18, step: 1 },
      { id: 'num3', label: 'Number 3', type: 'number', placeholder: '24', defaultValue: 24, step: 1 },
      { id: 'num4', label: 'Number 4', type: 'number', placeholder: '36', defaultValue: 36, step: 1 }
    ],
    breakdown: {
      headline: 'gcf',
      headlineLabel: 'Greatest common factor',
      outputs: [
        { id: 'gcf', label: 'Greatest common factor', format: 'integer' },
        { id: 'numbersUsed', label: 'Numbers used', format: 'integer' }
      ],
      groups: [{ inputs: ['howMany', 'num1', 'num2'] }, { title: 'Third and fourth numbers (if you have more than two)', inputs: ['num3', 'num4'], optional: true }],
      derive: (values) => {
        const howMany = Math.min(4, Math.max(2, Math.round(values.howMany || 2)));
        const nums = [values.num1, values.num2, values.num3, values.num4].slice(0, howMany);
        return { minNumber: Math.min(...nums), maxNumber: Math.max(...nums) };
      },
      visual: {
        type: 'compareBars',
        bars: [{ from: 'minNumber', label: 'Smallest number' }, { from: 'maxNumber', label: 'Largest number' }, { from: 'gcf', label: 'Greatest common factor' }],
        title: 'Your numbers and their GCF'
      }
    },
    seo: {
      title: 'GCF Calculator – Greatest Common Factor of Numbers',
      description: 'Free GCF (greatest common factor / GCD / HCF) calculator. Find the GCF of 2 to 4 numbers using the Euclidean algorithm.',
      faq: [
        { question: 'What is the GCF of 12 and 18?', answer: '6. It divides both evenly (12 ÷ 6 = 2 and 18 ÷ 6 = 3), and no larger number does.' },
        { question: 'How do I find the GCF of three or more numbers?', answer: 'Find the GCF of the first two, then find the GCF of that result and the next number, repeating until every number has been included. GCF(12, 18, 24) = GCF(GCF(12, 18), 24) = GCF(6, 24) = 6.' },
        { question: 'What if two numbers share no common factor besides 1?', answer: 'Their GCF is 1, and they are called coprime (or relatively prime) — for example, GCF(7, 15) = 1.' },
        { question: "What is the difference between GCF and LCM?", answer: 'The GCF is the largest number that divides every input exactly. The least common multiple (LCM) is the smallest number that every input divides into — the opposite kind of question, covered by a separate calculator.' },
        { question: 'How is the GCF used with fractions?', answer: 'Dividing a fraction\'s numerator and denominator by their GCF reduces it to lowest terms — 12/18 and its GCF of 6 reduce to 2/3, the same technique this site\'s fraction calculator and ratio calculator use.' },
        { question: 'What is the GCF of 0 and a number?', answer: 'The other number. GCF(0, 18) = 18, since every number divides 0 evenly, and 18 is the largest number dividing 18 itself.' },
        { question: 'What is the GCF of 0 and 0?', answer: '0, by the standard number-theory convention (GCF(0, 0) = 0), since there is no largest common divisor among only zeros otherwise — every integer divides 0.' },
        { question: 'Can the GCF be negative?', answer: 'No. This calculator compares numbers by their absolute value and always reports the GCF as zero or positive.' },
        { question: 'Is prime factorization or the Euclidean algorithm faster for finding the GCF?', answer: 'For large numbers, the Euclidean algorithm is much faster, since it avoids factoring either number at all — it is also the method this calculator runs.' }
      ]
    },
    compute(values) {
      const howMany = Math.min(4, Math.max(2, Math.round(values.howMany || 2)));
      const nums = [values.num1, values.num2, values.num3, values.num4].slice(0, howMany);
      // An input already beyond Number.MAX_SAFE_INTEGER (2^53 - 1) lost precision before this
      // function ever saw it (GCF itself never grows past the smallest input, but a result built
      // from an already-imprecise input would still be silently wrong), so refuse instead.
      if (nums.some((n) => !Number.isSafeInteger(Math.abs(Math.round(n))))) return { gcf: NaN, numbersUsed: howMany };
      const gcf = nums.reduce((acc, value) => gcdRaw(acc, value));
      return { gcf, numbersUsed: howMany };
    }
  },
  {
    id: 'lcm-calculator',
    category: 'math',
    glyph: 'LCM',
    updatedAt: '2026-10-22',
    aliases: ['lcd calculator', 'least common denominator calculator', 'least common multiple calculator', 'lcm of two numbers calculator', 'find the lcm calculator'],
    related: ['gcf-calculator', 'fraction-calculator', 'ratio-calculator', 'prime-factorization-calculator'],
    title: 'LCM Calculator',
    description: 'Find the least common multiple (LCM) of 2 to 4 numbers — the smallest positive number every one of them divides into evenly, also used as the least common denominator (LCD) for adding fractions.',
    example: 'The LCM of 4 and 6 is 12 — the smallest number both 4 and 6 divide into evenly. Add a third number, like 9, and the LCM becomes 36.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is the least common multiple?',
        paragraphs: [
          'The least common multiple (LCM) of two or more numbers is the smallest positive number that every one of them divides into with no remainder. The multiples of 4 are 4, 8, 12, 16, 20...; the multiples of 6 are 6, 12, 18, 24...; the smallest number appearing in both lists is 12, so the LCM of 4 and 6 is 12.',
          'One way to find it is to list multiples of each number until one repeats, which works but gets slow for large numbers. A faster way uses the greatest common factor (GCF): for two numbers, LCM(a, b) = |a × b| ÷ GCF(a, b). This works because multiplying the two numbers together counts every shared factor twice, and dividing by the GCF removes the duplicate — this calculator uses this formula, with the Euclidean algorithm doing the GCF part.',
          'The LCM of three or more numbers is found two at a time, the same way the GCF is: LCM(4, 6, 9) = LCM(LCM(4, 6), 9) = LCM(12, 9) = 36. The most common everyday use of the LCM is finding a common denominator when adding or subtracting fractions with different denominators — in that context it is usually called the least common denominator (LCD), but it is the exact same calculation applied to the denominators.'
        ]
      },
      howTo: {
        intro: 'Choose how many numbers you have (2 to 4), then enter exactly that many.',
        steps: [
          { name: 'Choose how many numbers', text: 'Set "How many numbers?" to 2, 3 or 4. Only that many of the number fields below are used, in order starting from Number 1.' },
          { name: 'Enter your numbers', text: 'Type the numbers you want the least common multiple of. Order does not matter.' },
          { name: 'Read the LCM', text: 'The headline shows the smallest positive number that every one of your numbers divides into exactly.' },
          { name: 'Check the summary', text: 'The breakdown also confirms how many numbers were used.' },
          { name: 'See it visually', text: 'The chart shows your smallest number, your largest number, and the LCM side by side — the LCM is always at least as large as your biggest number.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The LCM of two numbers comes directly from their GCF — no separate algorithm is needed.',
        expression: 'LCM(a, b) = |a × b| ÷ GCF(a, b)\nLCM(a, b, c) = LCM(LCM(a, b), c)',
        terms: [
          { symbol: 'GCF(a, b)', meaning: 'The greatest common factor of a and b, computed with the Euclidean algorithm — see the GCF calculator.' },
          { symbol: 'LCM(a, b, c)', meaning: 'The LCM of three or more numbers, found by taking the LCM of two at a time.' }
        ],
        note: 'By a common convention, LCM(a, 0) = 0 for any nonzero a, since 0 is the only common multiple a and 0 share. LCM(0, 0) is left undefined — there is no positive common multiple of 0 and 0 at all. Numbers are compared by absolute value and rounded to the nearest whole number first, since the LCM is only defined for integers.'
      },
      workedExample: {
        intro: 'Find the LCM of 4, 6 and 9 using the GCF-based formula, two numbers at a time.',
        rows: [
          { label: 'LCM(4, 6): GCF(4, 6) = 2', value: '(4 × 6) ÷ 2 = 12' },
          { label: 'LCM(12, 9): GCF(12, 9) = 3', value: '(12 × 9) ÷ 3 = 36' },
          { label: 'Check', value: '36 ÷ 4 = 9, 36 ÷ 6 = 6, 36 ÷ 9 = 4 — all exact' }
        ],
        result: 'LCM(4, 6, 9) = 36',
        explanation: '36 is the smallest number that 4, 6 and 9 all divide into exactly. Any smaller common multiple, like 12 or 18, fails for at least one of the three numbers (18 ÷ 4 is not a whole number).'
      },
      watchOut: [
        { title: 'The LCM of a nonzero number and 0 is 0 — but LCM(0, 0) is undefined', body: 'By a widely used convention, LCM(n, 0) = 0 for any nonzero n, since 0 is the only common multiple they share. LCM(0, 0), though, has no positive common multiple at all (every multiple of 0 is 0 itself), so this calculator reports no answer for that specific case rather than guessing a value — this is this calculator\'s convention, not a universal one, since some sources leave LCM(n, 0) undefined too.' },
        { title: 'Negative numbers are compared by absolute value', body: 'LCM(−4, 6) is reported as 12, the same as LCM(4, 6), since this calculator always shows the LCM as zero or positive.' },
        { title: 'Non-integer inputs are rounded first', body: 'The LCM is only defined for whole numbers, so a decimal typed into any field is rounded to the nearest integer before this calculator computes anything with it.' },
        { title: 'Very large results are refused, not shown inexactly', body: 'The LCM of numbers with few shared factors is close to their full product — the LCM of four large, pairwise-coprime primes, for instance, is just their product, which can run past 9,007,199,254,740,991 (2^53 − 1, the largest whole number JavaScript can represent exactly) even though each individual input is unremarkable. Rather than silently round such a result to the nearest representable number, this calculator checks for that condition and shows no answer instead.' },
        { title: 'Not the same as the GCF', body: 'The LCM is the smallest number every input divides into; the GCF is the largest number that divides every input — opposite kinds of questions, answered by two different calculators.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §2.5 Prime Factorization and the Least Common Multiple', url: 'https://openstax.org/books/prealgebra-2e/pages/2-5-prime-factorization-and-the-least-common-multiple' },
        { label: 'Wolfram MathWorld, Least Common Multiple', url: 'https://mathworld.wolfram.com/LeastCommonMultiple.html' },
        { label: 'Mathematics LibreTexts, Mount Royal University Abstract Algebra I, §1.2: Greatest Common Divisor and Least Common Multiple — "A common convention is lcm(a,0) = 0 for all non zero integers a" and "lcm(0,0) = undefined"', url: 'https://math.libretexts.org/Courses/Mount_Royal_University/Abstract_Algebra_I/Chapter_1:_Integers/1.2:_Greatest_common_divisor_and_least_common_multiple' }
      ]
    },
    inputs: [
      {
        id: 'howMany',
        label: 'How many numbers?',
        type: 'number',
        placeholder: '2',
        defaultValue: 2,
        step: 1,
        min: 2,
        options: [
          { value: 2, label: '2 numbers' },
          { value: 3, label: '3 numbers' },
          { value: 4, label: '4 numbers' }
        ]
      },
      { id: 'num1', label: 'Number 1', type: 'number', placeholder: '4', defaultValue: 4, step: 1 },
      { id: 'num2', label: 'Number 2', type: 'number', placeholder: '6', defaultValue: 6, step: 1 },
      { id: 'num3', label: 'Number 3', type: 'number', placeholder: '9', defaultValue: 9, step: 1 },
      { id: 'num4', label: 'Number 4', type: 'number', placeholder: '10', defaultValue: 10, step: 1 }
    ],
    breakdown: {
      headline: 'lcm',
      headlineLabel: 'Least common multiple',
      outputs: [
        { id: 'lcm', label: 'Least common multiple', format: 'integer' },
        { id: 'numbersUsed', label: 'Numbers used', format: 'integer' }
      ],
      groups: [{ inputs: ['howMany', 'num1', 'num2'] }, { title: 'Third and fourth numbers (if you have more than two)', inputs: ['num3', 'num4'], optional: true }],
      derive: (values) => {
        const howMany = Math.min(4, Math.max(2, Math.round(values.howMany || 2)));
        const nums = [values.num1, values.num2, values.num3, values.num4].slice(0, howMany);
        return { minNumber: Math.min(...nums), maxNumber: Math.max(...nums) };
      },
      visual: {
        type: 'compareBars',
        bars: [{ from: 'minNumber', label: 'Smallest number' }, { from: 'maxNumber', label: 'Largest number' }, { from: 'lcm', label: 'Least common multiple' }],
        title: 'Your numbers and their LCM'
      }
    },
    seo: {
      title: 'LCM Calculator – Least Common Multiple of Numbers',
      description: 'Free LCM (least common multiple / LCD) calculator. Find the LCM of 2 to 4 numbers using the GCF-based formula.',
      faq: [
        { question: 'What is the LCM of 4 and 6?', answer: '12. Both 4 and 6 divide into 12 exactly (12 ÷ 4 = 3, 12 ÷ 6 = 2), and no smaller positive number works for both.' },
        { question: 'How do I find the LCM using the GCF?', answer: 'Divide the product of the two numbers by their GCF: LCM(a, b) = (a × b) ÷ GCF(a, b). For 4 and 6, GCF(4, 6) = 2, so LCM = (4 × 6) ÷ 2 = 12.' },
        { question: 'How do I find the LCM of three or more numbers?', answer: 'Find the LCM of the first two, then find the LCM of that result and the next number, repeating until every number has been included. LCM(4, 6, 9) = LCM(LCM(4, 6), 9) = LCM(12, 9) = 36.' },
        { question: 'What is the difference between LCM and GCF?', answer: 'The LCM is the smallest number every input divides into; the GCF is the largest number that divides every input exactly — opposite kinds of questions.' },
        { question: 'How is the LCM used with fractions?', answer: 'The LCM of two denominators is their least common denominator (LCD), the smallest denominator both fractions can be rewritten with before adding or subtracting them.' },
        { question: 'What is the LCM of two numbers with no shared factors?', answer: 'Their product. If GCF(a, b) = 1 (the numbers are coprime), LCM(a, b) = a × b ÷ 1 = a × b — for example, LCM(4, 9) = 36.' },
        { question: 'What is the LCM of 0 and a nonzero number?', answer: '0, by a widely used convention, since the only multiple 0 has is 0 itself, making 0 the only number both 0 and any other number could ever divide into.' },
        { question: 'What is the LCM of 0 and 0?', answer: 'Undefined. There is no positive number that 0 and 0 both divide into, since the only multiple 0 has is 0 itself, so this calculator reports no answer for that specific case.' },
        { question: 'Can the LCM be negative?', answer: 'No. This calculator compares numbers by their absolute value and always reports the LCM as zero or positive.' },
        { question: 'Why does my LCM show no answer even though all my numbers are small?', answer: 'The LCM of several large, pairwise-coprime numbers (numbers that share no common factors) is close to their full product, which can exceed 9,007,199,254,740,991 — the largest whole number JavaScript can represent exactly — even when none of the individual numbers looks unusually large. This calculator shows no answer rather than a silently rounded, slightly wrong one.' }
      ]
    },
    compute(values) {
      const howMany = Math.min(4, Math.max(2, Math.round(values.howMany || 2)));
      const nums = [values.num1, values.num2, values.num3, values.num4].slice(0, howMany);
      const lcm = nums.reduce((acc, value) => lcmPair(acc, value));
      return { lcm, numbersUsed: howMany };
    }
  },
  {
    id: 'prime-factorization-calculator',
    category: 'math',
    glyph: 'p×q',
    updatedAt: '2026-10-22',
    aliases: ['prime factors calculator', 'factor tree calculator', 'find the prime factorization calculator', 'prime factorization of a number'],
    related: ['gcf-calculator', 'lcm-calculator', 'factorial-calculator', 'square-root-calculator'],
    title: 'Prime Factorization Calculator',
    description: 'Break a whole number down into the prime numbers that multiply together to make it, with the exponent on each one, the total factor count, and the number of divisors.',
    example: '360 = 2³ × 3² × 5 — three distinct prime factors, six prime factors counting repeats, and 24 total divisors.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is prime factorization?',
        paragraphs: [
          "Prime factorization breaks a whole number down into the prime numbers that multiply together to make it. A prime number (2, 3, 5, 7, 11...) has no divisors besides 1 and itself; every other whole number greater than 1 is a product of primes in exactly one way, ignoring order — this fact is important enough to have a name, the Fundamental Theorem of Arithmetic. 360 = 2 × 2 × 2 × 3 × 3 × 5, usually written in exponent form as 2³ × 3² × 5.",
          'This calculator finds that factorization with trial division: it tests whether 2 divides the number, then 3, then every integer up to the square root of what remains, dividing out each prime as many times as it goes in before moving to the next candidate. Anything left over after that point is itself a prime (there cannot be two factors both bigger than the square root, since their product would exceed the original number).',
          'A few other facts fall straight out of the factorization once you have it: the number of distinct primes involved, the total count of prime factors if repeats are counted (the exponents added together), and the number of divisors the original number has in total — multiply one more than each exponent together (for 360 = 2³ × 3² × 5¹, that is (3+1) × (2+1) × (1+1) = 4 × 3 × 2 = 24 divisors). Prime factorization is also exactly the method behind the GCF and LCM calculators on this site: factor two numbers, and their GCF is the shared primes at the lower exponent, while their LCM is every prime at the higher exponent.'
        ]
      },
      howTo: {
        intro: 'Enter a whole number from 2 up to a trillion. The result updates as you type.',
        steps: [
          { name: 'Enter a number', text: 'Type the whole number you want to factorize. Decimals are rounded to the nearest whole number first.' },
          { name: 'Read the prime factors', text: 'The breakdown lists each distinct prime factor found, in increasing order, alongside its exponent (how many times it divides the number).' },
          { name: 'Check the summary figures', text: 'Distinct prime factor count is the headline; total prime factors (counting repeats), the number of divisors, and a count of any extra factors beyond what is listed are shown underneath.' },
          { name: 'Watch for "extra factors"', text: 'This calculator displays up to 6 distinct prime factors. A number built from more than 6 (rare — it takes at least the first 7 prime numbers multiplied together, 510,510) shows how many more exist beyond the list, rather than silently cutting them off.' },
          { name: 'See it visually', text: 'The chart compares your number with its smallest and largest prime factor.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Trial division repeatedly finds the smallest prime that still divides what is left, and divides it out as many times as it goes in.',
        expression: 'n = p₁^e₁ × p₂^e₂ × ... × pₖ^eₖ\nNumber of divisors = (e₁ + 1) × (e₂ + 1) × ... × (eₖ + 1)',
        terms: [
          { symbol: 'p₁, p₂, ..., pₖ', meaning: 'The distinct prime factors of n, in increasing order.' },
          { symbol: 'e₁, e₂, ..., eₖ', meaning: 'The exponent on each prime — how many times it appears in the factorization.' }
        ],
        note: 'Negative numbers are factored by their absolute value, since −1 is a unit, not a prime, by the standard definition. 0 has no factorization (every integer divides it), and 1 has an empty one — zero prime factors — since it is the product of no primes at all.'
      },
      workedExample: {
        intro: 'Factorize 360.',
        rows: [
          { label: 'Divide out 2s', value: '360 ÷ 2 = 180, ÷2 = 90, ÷2 = 45 (not divisible by 2 anymore) — three 2s' },
          { label: 'Divide out 3s', value: '45 ÷ 3 = 15, ÷3 = 5 (not divisible by 3 anymore) — two 3s' },
          { label: 'Divide out 5s', value: '5 ÷ 5 = 1 — one 5, and nothing is left' },
          { label: 'Number of divisors', value: '(3 + 1) × (2 + 1) × (1 + 1) = 4 × 3 × 2 = 24' }
        ],
        result: '360 = 2³ × 3² × 5 — 3 distinct primes, 6 total prime factors, 24 divisors',
        explanation: 'Checking: 2³ × 3² × 5 = 8 × 9 × 5 = 360 ✓. The 24 divisors run from 1 and 2 up to 180 and 360 itself — every combination of the available prime powers.'
      },
      watchOut: [
        { title: 'Only the first 6 distinct prime factors are listed', body: 'A number built from more than 6 distinct primes needs at least the first 7 prime numbers multiplied together (510,510 = 2×3×5×7×11×13×17), which is rare for an everyday number. When it happens, the "extra distinct prime factors" figure reports how many more exist beyond the 6 shown, rather than quietly dropping them — the distinct and total factor counts always include every prime, shown or not.' },
        { title: '0 has no prime factorization', body: 'Every integer divides 0 evenly, so there is no finite list of primes that uniquely produces it. This calculator returns no answer for 0.' },
        { title: '1 is not prime and has no prime factors', body: 'By definition, 1 is a unit, not a prime — it has zero prime factors (the "empty product"), which is different from having no defined answer at all. Its divisor count is 1 (only itself).' },
        { title: 'Negative numbers use their absolute value', body: 'The prime factorization of −360 is reported the same as 360, since −1 is excluded from the primes by definition (it has a multiplicative inverse, which no prime does).' },
        { title: 'Capped at one trillion for speed', body: 'Trial division checks candidates up to the square root of the number, so even a trillion only needs about a million checks — instant in a browser. This calculator returns no answer above that cap rather than risk a slow, frozen page for an unbounded input.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §2.5 Prime Factorization and the Least Common Multiple', url: 'https://openstax.org/books/prealgebra-2e/pages/2-5-prime-factorization-and-the-least-common-multiple' },
        { label: 'Wolfram MathWorld, Fundamental Theorem of Arithmetic', url: 'https://mathworld.wolfram.com/FundamentalTheoremofArithmetic.html' },
        { label: 'Wolfram MathWorld, Divisor Function', url: 'https://mathworld.wolfram.com/DivisorFunction.html' }
      ]
    },
    inputs: [{ id: 'n', label: 'Number', type: 'number', placeholder: '360', defaultValue: 360, step: 1, min: 1 }],
    breakdown: {
      headline: 'distinctPrimeFactors',
      headlineLabel: 'Distinct prime factors',
      outputs: [
        { id: 'distinctPrimeFactors', label: 'Distinct prime factors', format: 'integer' },
        { id: 'prime1', label: 'Prime factor #1', format: 'integer' },
        { id: 'exponent1', label: 'Exponent #1', format: 'integer' },
        { id: 'prime2', label: 'Prime factor #2', format: 'integer' },
        { id: 'exponent2', label: 'Exponent #2', format: 'integer' },
        { id: 'prime3', label: 'Prime factor #3', format: 'integer' },
        { id: 'exponent3', label: 'Exponent #3', format: 'integer' },
        { id: 'prime4', label: 'Prime factor #4', format: 'integer' },
        { id: 'exponent4', label: 'Exponent #4', format: 'integer' },
        { id: 'prime5', label: 'Prime factor #5', format: 'integer' },
        { id: 'exponent5', label: 'Exponent #5', format: 'integer' },
        { id: 'prime6', label: 'Prime factor #6', format: 'integer' },
        { id: 'exponent6', label: 'Exponent #6', format: 'integer' },
        { id: 'totalPrimeFactors', label: 'Total prime factors (with repeats)', format: 'integer' },
        { id: 'numberOfDivisors', label: 'Number of divisors', format: 'integer' },
        { id: 'extraDistinctPrimeFactors', label: 'Extra distinct prime factors (beyond #1-6)', format: 'integer' }
      ],
      groups: [{ inputs: ['n'] }],
      derive: (values) => ({ absN: Math.abs(Math.round(values.n)) }),
      visual: {
        type: 'compareBars',
        bars: [{ from: 'absN', label: 'Your number' }, { from: 'smallestPrimeFactor', label: 'Smallest prime factor' }, { from: 'largestPrimeFactor', label: 'Largest prime factor' }],
        title: 'Your number and its prime factors'
      }
    },
    seo: {
      title: 'Prime Factorization Calculator – Factor Any Number',
      description: 'Free prime factorization calculator. Find the prime factors of any whole number, with exponents, total factor count and number of divisors.',
      faq: [
        { question: 'What is the prime factorization of 360?', answer: '2³ × 3² × 5, meaning 2 × 2 × 2 × 3 × 3 × 5 = 360.' },
        { question: 'How do you find the prime factorization of a number?', answer: 'Divide repeatedly by the smallest prime that still divides evenly (starting with 2), moving to the next prime once it stops dividing evenly, and continuing until only 1 is left.' },
        { question: 'Is 1 a prime number?', answer: 'No. A prime number has exactly two divisors (1 and itself); 1 has only one divisor, so it is excluded by definition and has no prime factors at all.' },
        { question: 'What is the prime factorization of a prime number?', answer: 'Just itself, to the first power — for example, 17 = 17¹, with one distinct prime factor.' },
        { question: 'How many divisors does a number have?', answer: 'Add 1 to each exponent in its prime factorization and multiply the results together. 360 = 2³ × 3² × 5¹ has (3+1)(2+1)(1+1) = 24 divisors.' },
        { question: 'Why does prime factorization matter for GCF and LCM?', answer: 'The GCF of two numbers is the primes they share at the lower exponent; the LCM is every prime involved at the higher exponent — both calculators on this site compute these the faster way (the Euclidean algorithm), but factorization is the idea behind them.' },
        { question: 'What is the prime factorization of 0?', answer: 'Undefined. Every integer divides 0 evenly, so there is no finite factorization that produces it uniquely.' },
        { question: 'Can a negative number be prime factorized?', answer: 'This calculator factors its absolute value, since −1 itself is not considered a prime number.' }
      ]
    },
    compute(values) {
      const nAbs = Math.abs(Math.round(values.n));
      const SLOTS = 6;
      const CAP = 1e12;
      const noAnswer = {
        distinctPrimeFactors: NaN,
        prime1: NaN, exponent1: NaN, prime2: NaN, exponent2: NaN, prime3: NaN, exponent3: NaN,
        prime4: NaN, exponent4: NaN, prime5: NaN, exponent5: NaN, prime6: NaN, exponent6: NaN,
        totalPrimeFactors: NaN, numberOfDivisors: NaN, extraDistinctPrimeFactors: NaN,
        smallestPrimeFactor: NaN, largestPrimeFactor: NaN
      };
      if (nAbs === 0 || nAbs > CAP) return noAnswer;

      const factors: [number, number][] = [];
      let remaining = nAbs;
      if (remaining > 1) {
        for (let p = 2; p * p <= remaining; p++) {
          if (remaining % p === 0) {
            let exponent = 0;
            while (remaining % p === 0) {
              remaining /= p;
              exponent++;
            }
            factors.push([p, exponent]);
          }
        }
        if (remaining > 1) factors.push([remaining, 1]); // one large prime factor left over
      }

      const distinctPrimeFactors = factors.length;
      const totalPrimeFactors = factors.reduce((sum, [, exponent]) => sum + exponent, 0);
      const numberOfDivisors = factors.reduce((product, [, exponent]) => product * (exponent + 1), 1);
      const extraDistinctPrimeFactors = Math.max(0, distinctPrimeFactors - SLOTS);
      const shown = Array.from({ length: SLOTS }, (_, i) => factors[i] ?? [0, 0]);
      const smallestPrimeFactor = factors.length ? factors[0][0] : 0;
      const largestPrimeFactor = factors.length ? factors[factors.length - 1][0] : 0;

      return {
        distinctPrimeFactors,
        prime1: shown[0][0], exponent1: shown[0][1],
        prime2: shown[1][0], exponent2: shown[1][1],
        prime3: shown[2][0], exponent3: shown[2][1],
        prime4: shown[3][0], exponent4: shown[3][1],
        prime5: shown[4][0], exponent5: shown[4][1],
        prime6: shown[5][0], exponent6: shown[5][1],
        totalPrimeFactors,
        numberOfDivisors,
        extraDistinctPrimeFactors,
        smallestPrimeFactor,
        largestPrimeFactor
      };
    }
  },
  {
    id: 'long-division-calculator',
    category: 'math',
    glyph: '÷',
    updatedAt: '2026-10-22',
    aliases: ['division with remainder calculator', 'quotient and remainder calculator', 'long division steps calculator', 'divide and find the remainder calculator'],
    related: ['fraction-calculator', 'gcf-calculator', 'lcm-calculator', 'rounding-calculator'],
    title: 'Long Division Calculator',
    description: 'Divide two whole numbers to find the quotient and remainder, or the full decimal result — the remainder is always zero or positive, the standard convention for the Division Algorithm.',
    example: '17 ÷ 5 = 3 remainder 2 (3.4 as a decimal). Check it: 3 × 5 + 2 = 17.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is long division?',
        paragraphs: [
          'Long division is the step-by-step method for dividing one whole number (the dividend) by another (the divisor) by hand, producing a quotient (how many times the divisor fits in) and a remainder (what is left over). 17 ÷ 5 goes 3 whole times (3 × 5 = 15), with 2 left over, so the quotient is 3 and the remainder is 2.',
          'Every division of whole numbers follows the Division Algorithm: for a dividend a and a nonzero divisor b, there exist unique whole numbers q (the quotient) and r (the remainder) such that a = bq + r, with r always zero or positive and strictly smaller than |b|. This calculator reports the remainder using exactly that convention, even when the dividend or divisor is negative, where some programming languages instead allow a negative remainder.',
          'The same answer can be written three ways: as a quotient and remainder (3 remainder 2), as a full decimal (3.4), or — if you need an exact fraction instead of a rounded decimal — as the improper fraction 17/5, which this site\'s fraction calculator can simplify or convert to a mixed number.'
        ]
      },
      howTo: {
        intro: 'Enter the dividend (the number being divided) and the divisor (the number dividing it).',
        steps: [
          { name: 'Enter the dividend', text: 'The number being split up — in 17 ÷ 5, that is 17.' },
          { name: 'Enter the divisor', text: 'The number doing the dividing — in 17 ÷ 5, that is 5. It cannot be 0.' },
          { name: 'Read the quotient and remainder', text: 'The headline shows the whole-number quotient; the remainder underneath is always between 0 and the divisor.' },
          { name: 'Check the decimal result', text: 'The full, non-rounded decimal value of the division is shown alongside, in case you need more precision than a remainder gives.' },
          { name: 'Verify with the check figure', text: 'Quotient × divisor + remainder always reconstructs the original dividend — a quick way to confirm the division by hand.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The Division Algorithm guarantees a unique quotient and a nonnegative remainder smaller than the divisor, for any nonzero divisor.',
        expression: 'a = b × q + r,  0 ≤ r < |b|\nq = (a − r) ÷ b\ndecimal result = a ÷ b',
        terms: [
          { symbol: 'a (dividend)', meaning: 'The number being divided.' },
          { symbol: 'b (divisor)', meaning: 'The number dividing it. Cannot be 0.' },
          { symbol: 'q (quotient)', meaning: 'How many whole times b divides into a.' },
          { symbol: 'r (remainder)', meaning: 'What is left over — always zero or positive, and always less than |b|, regardless of the sign of a or b.' }
        ],
        note: 'This nonnegative-remainder convention (sometimes called Euclidean division) is not the only one in use — many programming languages instead truncate toward zero, which can give a negative remainder for a negative dividend. This calculator always keeps 0 ≤ r < |b|, matching the classical Division Algorithm.'
      },
      workedExample: {
        intro: 'Divide −17 by 5 — the case where the sign convention matters most.',
        rows: [
          { label: 'Find r with 0 ≤ r < 5', value: 'r = 3 (since −17 = 5 × (−4) + 3)' },
          { label: 'Solve for q', value: 'q = (−17 − 3) ÷ 5 = −20 ÷ 5 = −4' },
          { label: 'Check', value: '(−4) × 5 + 3 = −20 + 3 = −17 ✓' },
          { label: 'As a decimal', value: '−17 ÷ 5 = −3.4' }
        ],
        result: '−17 ÷ 5 = −4 remainder 3 (−3.4 as a decimal)',
        explanation: 'Notice the quotient is −4, not −3: truncating toward zero would give −3 remainder −2, but this calculator keeps the remainder nonnegative (3, not −2) by rounding the quotient down (toward negative infinity) instead.'
      },
      watchOut: [
        { title: 'The divisor cannot be 0', body: 'Division by zero has no defined answer — this calculator returns no result rather than a misleading one.' },
        { title: 'The remainder sign convention differs from some calculators and languages', body: 'This calculator always keeps the remainder between 0 and the divisor (exclusive), even for a negative dividend or divisor. A calculator or programming language using truncated division instead would report a negative remainder for −17 ÷ 5 (−3 remainder −2) rather than this page\'s −4 remainder 3 — both reconstruct the dividend correctly, they simply split it differently.' },
        { title: 'Decimal inputs are rounded first', body: 'Long division with a remainder is defined for whole numbers. A decimal typed into either field is rounded to the nearest whole number before dividing.' },
        { title: 'The decimal result can repeat forever', body: 'Not every division produces a terminating decimal — 1 ÷ 3 = 0.333... repeats indefinitely. The decimal result shown is rounded for display, not exact.' },
        { title: 'A dividend or divisor beyond 9,007,199,254,740,991 is refused', body: 'That number (2^53 − 1) is the largest whole number JavaScript can represent exactly. A number you type that is already larger than this has lost precision before this calculator ever sees it, so rather than show a quotient or remainder built from an already-wrong number, this calculator shows no answer instead.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §1.5 Divide Whole Numbers', url: 'https://openstax.org/books/prealgebra-2e/pages/1-5-divide-whole-numbers' },
        { label: 'Pete L. Clark, Elementary Number Theory (Mathematics LibreTexts), §5: The Division Algorithm', url: 'https://math.libretexts.org/Bookshelves/Combinatorics_and_Discrete_Mathematics/Elementary_Number_Theory_(Clark)/01%3A_Chapters/05%3A_The_Division_Algorithm' }
      ]
    },
    inputs: [
      { id: 'dividend', label: 'Dividend', type: 'number', placeholder: '17', defaultValue: 17, step: 1 },
      { id: 'divisor', label: 'Divisor', type: 'number', placeholder: '5', defaultValue: 5, step: 1 }
    ],
    breakdown: {
      headline: 'quotient',
      headlineLabel: 'Quotient',
      outputs: [
        { id: 'quotient', label: 'Quotient', format: 'integer' },
        { id: 'remainder', label: 'Remainder', format: 'integer' },
        { id: 'decimalResult', label: 'Decimal result', format: 'significant' },
        { id: 'check', label: 'Check (quotient × divisor + remainder)', format: 'integer' }
      ],
      groups: [{ inputs: ['dividend', 'divisor'] }],
      visual: { type: 'compareBars', bars: [{ from: 'dividend', label: 'Dividend' }, { from: 'divisor', label: 'Divisor' }], title: 'Dividend vs divisor' }
    },
    seo: {
      title: 'Long Division Calculator – Quotient & Remainder',
      description: 'Free long division calculator. Find the quotient and remainder of two whole numbers, plus the decimal result, with a clear remainder sign convention.',
      faq: [
        { question: 'How do I do long division?', answer: 'Find how many whole times the divisor fits into the dividend (the quotient), then subtract to find what is left over (the remainder). 17 ÷ 5: 5 fits 3 times (15), leaving a remainder of 2.' },
        { question: 'What is 17 divided by 5?', answer: 'Quotient 3, remainder 2 — or 3.4 as a decimal.' },
        { question: 'How do you divide negative numbers with a remainder?', answer: 'This calculator keeps the remainder zero or positive, adjusting the quotient down to make it work: −17 ÷ 5 is −4 remainder 3, not −3 remainder −2.' },
        { question: 'Why is my remainder different from another calculator?', answer: 'Some calculators and programming languages use truncated division instead, allowing a negative remainder for a negative dividend. This calculator uses the nonnegative-remainder convention from the classical Division Algorithm.' },
        { question: 'Can the remainder be larger than the divisor?', answer: 'No. By definition, the remainder is always strictly less than the absolute value of the divisor — if it were not, the quotient would need to be one larger.' },
        { question: 'What does it mean if the remainder is 0?', answer: 'The divisor divides the dividend exactly, with no leftover — the division is exact, like 20 ÷ 5 = 4 remainder 0.' },
        { question: 'How do I convert a division into a decimal?', answer: 'Divide the dividend by the divisor directly: 17 ÷ 5 = 3.4. This calculator shows both the quotient-and-remainder form and the decimal form at once.' }
      ]
    },
    compute(values) {
      const dividend = Math.round(values.dividend);
      const divisor = Math.round(values.divisor);
      const noAnswer = { quotient: NaN, remainder: NaN, decimalResult: NaN, check: NaN };
      if (divisor === 0) return noAnswer;
      // A dividend or divisor already beyond Number.MAX_SAFE_INTEGER (2^53 - 1) lost precision
      // before this function ever saw it, so refuse rather than silently show a wrong quotient
      // or remainder built from an already-imprecise number.
      if (!Number.isSafeInteger(dividend) || !Number.isSafeInteger(divisor)) return noAnswer;
      const absDivisor = Math.abs(divisor);
      const remainder = ((dividend % divisor) + absDivisor) % absDivisor;
      const quotient = (dividend - remainder) / divisor;
      const decimalResult = dividend / divisor;
      const check = quotient * divisor + remainder;
      return { quotient, remainder, decimalResult, check };
    }
  },
  {
    id: 'quadratic-formula-calculator',
    category: 'math',
    glyph: 'x²',
    updatedAt: '2026-10-22',
    aliases: ['quadratic equation solver', 'find the roots of a quadratic calculator', 'solve ax2+bx+c=0 calculator', 'discriminant calculator'],
    related: ['square-root-calculator', 'exponent-calculator', 'pythagorean-theorem-calculator', 'gcf-calculator'],
    title: 'Quadratic Formula Calculator',
    description: 'Solve ax² + bx + c = 0 for both roots using the quadratic formula, including complex roots when the discriminant is negative, plus the discriminant and the parabola\'s vertex.',
    example: '2x² − 10x + 8 = 0 has roots x = 4 and x = 1, since dividing by 2 gives x² − 5x + 4 = (x − 4)(x − 1) = 0.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is the quadratic formula?',
        paragraphs: [
          'A quadratic equation has the form ax² + bx + c = 0, where a, b and c are known numbers and a is not 0. Unlike a linear equation, a quadratic generally has two solutions ("roots") — the two x-values where the parabola y = ax² + bx + c crosses the x-axis. The quadratic formula finds both at once from the three coefficients, without needing to guess or factor.',
          'The expression under the square root, b² − 4ac, is called the discriminant, and its sign alone tells you what kind of roots to expect before you even finish the calculation: positive means two distinct real roots, zero means exactly one repeated real root (the parabola just touches the x-axis), and negative means no real roots at all — the parabola never crosses the x-axis, and the two roots are complex numbers instead, written in the form p ± qi.',
          'The same formula also locates the vertex of the parabola, its lowest or highest point: the x-coordinate is always −b ÷ (2a), exactly halfway between two real roots by symmetry (and still meaningful even when the roots are complex, as the real part of the complex pair). If a is 0, the equation is not quadratic at all — it is a linear equation, bx + c = 0, solved by a single division instead.'
        ]
      },
      howTo: {
        intro: 'Enter the three coefficients a, b and c from ax² + bx + c = 0.',
        steps: [
          { name: 'Enter a, b and c', text: 'Match them to your equation in the standard form ax² + bx + c = 0. a cannot be 0 for a genuine quadratic.' },
          { name: 'Read the two roots', text: 'Root 1 and Root 2 are the two solutions. If they are equal, the equation has exactly one repeated root.' },
          { name: 'Check the discriminant', text: 'Positive means two real roots (shown above), zero means a repeated root, negative means the roots are complex — shown as a real part and an imaginary part instead.' },
          { name: 'Read the complex form, if shown', text: 'When the discriminant is negative, Root 1 and Root 2 show no value — the real part and imaginary part rows describe the pair p ± qi instead.' },
          { name: 'Check the vertex', text: 'The vertex x- and y-coordinates locate the parabola\'s turning point, useful for graphing or finding a maximum or minimum.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The quadratic formula solves ax² + bx + c = 0 directly from its three coefficients.',
        expression: 'x = (−b ± √(b² − 4ac)) ÷ (2a)\nDiscriminant: Δ = b² − 4ac\nVertex: x = −b ÷ (2a), y = c − b² ÷ (4a)',
        terms: [
          { symbol: 'a, b, c', meaning: 'The coefficients of ax² + bx + c = 0. a cannot be 0.' },
          { symbol: 'Δ (discriminant)', meaning: 'b² − 4ac. Its sign determines whether the roots are two real numbers, one repeated real number, or a complex pair.' },
          { symbol: 'p ± qi', meaning: 'The complex-root form used when Δ < 0: p is the real part (−b ÷ 2a), q is the (always nonnegative) imaginary part, √(−Δ) ÷ (2a).' }
        ],
        note: 'A discriminant that is mathematically exactly 0 can come out as a tiny nonzero number after floating-point rounding (for instance 4.000000000000002 instead of 4). This calculator treats a discriminant within about a billionth of 0, relative to the size of b² and 4ac, as exactly 0 — a repeated root — rather than reporting two almost-identical real roots or, worse, a razor-thin complex pair.'
      },
      workedExample: {
        intro: 'Solve 2x² − 10x + 8 = 0.',
        rows: [
          { label: 'Discriminant', value: 'Δ = (−10)² − 4(2)(8) = 100 − 64 = 36' },
          { label: 'Square root of the discriminant', value: '√36 = 6' },
          { label: 'Root 1', value: 'x₁ = (10 + 6) ÷ (2×2) = 16 ÷ 4 = 4' },
          { label: 'Root 2', value: 'x₂ = (10 − 6) ÷ (2×2) = 4 ÷ 4 = 1' },
          { label: 'Vertex', value: 'x = 10 ÷ 4 = 2.5, y = 8 − 100 ÷ 8 = −4.5' }
        ],
        result: 'x = 4 or x = 1, vertex at (2.5, −4.5)',
        explanation: 'Check each root by substitution: 2(4)² − 10(4) + 8 = 32 − 40 + 8 = 0 ✓, and 2(1)² − 10(1) + 8 = 2 − 10 + 8 = 0 ✓. The discriminant being a perfect square (36 = 6²) is why both roots come out as whole numbers here — most quadratics are not this tidy.'
      },
      watchOut: [
        { title: 'a cannot be 0', body: 'If a is 0, the equation is linear (bx + c = 0, not quadratic), solved by x = −c ÷ b instead. This calculator still reports that single root when a is 0 and b is not, but Root 1 and Root 2 come out equal to each other, not from the quadratic formula.' },
        { title: 'A negative discriminant means complex roots, not an error', body: 'x² + 2x + 5 = 0 has discriminant 4 − 20 = −16, which is negative — the parabola never crosses the x-axis. The two roots are complex: −1 + 2i and −1 − 2i, shown as a real part (−1) and an imaginary part (2) instead of as Root 1 / Root 2, which this calculator leaves blank in that case rather than showing a bare "NaN."' },
        { title: 'A discriminant of 0 means one repeated root, not two', body: 'x² − 4x + 4 = 0 has discriminant 16 − 16 = 0, giving the single repeated root x = 2 — both Root 1 and Root 2 show the same value, since (x − 2)² touches the x-axis at exactly one point.' },
        { title: 'Very small floating-point discriminants are treated as 0', body: 'A discriminant computed as, say, 3 × 10⁻¹⁴ instead of exactly 0 (a rounding artifact of squaring and multiplying floating-point numbers) is snapped to the repeated-root case, rather than reported as "two real roots" that are actually identical or a complex pair with a vanishingly thin imaginary part.' }
      ],
      references: [
        { label: 'OpenStax, Elementary Algebra 2e, §10.3 Solve Quadratic Equations Using the Quadratic Formula', url: 'https://openstax.org/books/elementary-algebra-2e/pages/10-3-solve-quadratic-equations-using-the-quadratic-formula' },
        { label: 'OpenStax, College Algebra 2e, §2.5 Quadratic Equations', url: 'https://openstax.org/books/college-algebra-2e/pages/2-5-quadratic-equations' },
        { label: 'Wolfram MathWorld, Quadratic Formula', url: 'https://mathworld.wolfram.com/QuadraticFormula.html' }
      ]
    },
    inputs: [
      { id: 'a', label: 'a', type: 'number', placeholder: '2', defaultValue: 2, step: 1 },
      { id: 'b', label: 'b', type: 'number', placeholder: '-10', defaultValue: -10, step: 1 },
      { id: 'c', label: 'c', type: 'number', placeholder: '8', defaultValue: 8, step: 1 }
    ],
    breakdown: {
      headline: 'root1',
      headlineLabel: 'Root 1 (x₁)',
      outputs: [
        { id: 'root1', label: 'Root 1 (x₁)', format: 'significant' },
        { id: 'root2', label: 'Root 2 (x₂)', format: 'significant' },
        { id: 'discriminant', label: 'Discriminant (b² − 4ac)', format: 'significant' },
        { id: 'realPart', label: 'Real part / axis of symmetry (−b ÷ 2a)', format: 'significant' },
        { id: 'imaginaryPart', label: 'Imaginary part (if complex)', format: 'significant' },
        { id: 'vertexX', label: 'Vertex x-coordinate', format: 'significant' },
        { id: 'vertexY', label: 'Vertex y-coordinate', format: 'significant' }
      ],
      groups: [{ inputs: ['a', 'b', 'c'] }],
      visual: { type: 'compareBars', bars: [{ from: 'root1', label: 'Root 1 (x₁)' }, { from: 'root2', label: 'Root 2 (x₂)' }], title: 'Root 1 vs Root 2' }
    },
    seo: {
      title: 'Quadratic Formula Calculator – Solve for x, Real or Complex',
      description: 'Free quadratic formula calculator. Solve ax² + bx + c = 0 for both roots, including complex roots, plus the discriminant and vertex.',
      faq: [
        { question: 'What is the quadratic formula?', answer: 'x = (−b ± √(b² − 4ac)) ÷ (2a), which solves any equation of the form ax² + bx + c = 0 for both values of x.' },
        { question: 'What is the discriminant?', answer: 'b² − 4ac, the expression under the square root. Positive gives two real roots, zero gives one repeated real root, negative gives two complex roots.' },
        { question: 'What happens when the discriminant is negative?', answer: 'The equation has no real roots. The two roots are complex numbers, written p ± qi, where p is −b ÷ (2a) and q is √(−discriminant) ÷ (2a).' },
        { question: 'What if a is 0?', answer: 'The equation is not quadratic — it is linear, bx + c = 0, solved by x = −c ÷ b instead.' },
        { question: 'How do you find the vertex of a parabola from a, b and c?', answer: 'The x-coordinate is −b ÷ (2a); substitute that back into ax² + bx + c to find the y-coordinate.' },
        { question: 'What does it mean if both roots are the same?', answer: 'The discriminant is 0, so the parabola touches the x-axis at exactly one point instead of crossing it at two.' },
        { question: 'Can the quadratic formula give a non-whole-number answer?', answer: 'Yes — most quadratics do not have whole-number roots. Whenever the discriminant is not a perfect square, the roots are irrational decimals.' },
        { question: 'How do I check a quadratic formula answer?', answer: 'Substitute each root back into ax² + bx + c; it should equal 0 for both. For 2x² − 10x + 8 = 0 with x = 4: 2(16) − 40 + 8 = 0.' }
      ]
    },
    compute(values) {
      const { a, b, c } = values;
      if (a === 0) {
        if (b === 0) return { discriminant: NaN, root1: NaN, root2: NaN, realPart: NaN, imaginaryPart: NaN, vertexX: NaN, vertexY: NaN };
        const root = -c / b;
        return { discriminant: NaN, root1: root, root2: root, realPart: root, imaginaryPart: 0, vertexX: NaN, vertexY: NaN };
      }
      const discriminant = b * b - 4 * a * c;
      const vertexX = -b / (2 * a);
      const vertexY = c - (b * b) / (4 * a);
      const scale = Math.max(1, b * b, Math.abs(4 * a * c));
      if (Math.abs(discriminant) < 1e-9 * scale) {
        const root = -b / (2 * a);
        return { discriminant: 0, root1: root, root2: root, realPart: root, imaginaryPart: 0, vertexX, vertexY };
      }
      if (discriminant > 0) {
        const sq = Math.sqrt(discriminant);
        const root1 = (-b + sq) / (2 * a);
        const root2 = (-b - sq) / (2 * a);
        return { discriminant, root1, root2, realPart: -b / (2 * a), imaginaryPart: 0, vertexX, vertexY };
      }
      const realPart = -b / (2 * a);
      const imaginaryPart = Math.abs(Math.sqrt(-discriminant) / (2 * a));
      return { discriminant, root1: NaN, root2: NaN, realPart, imaginaryPart, vertexX, vertexY };
    }
  },
  {
    id: 'pythagorean-theorem-calculator',
    category: 'math',
    glyph: 'c',
    updatedAt: '2026-10-22',
    aliases: ['hypotenuse calculator', 'a2+b2=c2 calculator', 'right triangle side calculator', 'find the hypotenuse calculator', 'pythagoras theorem calculator'],
    related: ['square-root-calculator', 'quadratic-formula-calculator', 'exponent-calculator', 'ratio-calculator'],
    title: 'Pythagorean Theorem Calculator',
    description: 'Solve a² + b² = c² for any side of a right triangle — enter the two legs to find the hypotenuse, or a leg and the hypotenuse to find the other leg.',
    example: 'A 3-4-5 right triangle: legs of 3 ft and 4 ft give a hypotenuse of 5 ft, since 3² + 4² = 9 + 16 = 25 = 5².',
    solver: {
      defaultTarget: 'hypotenuse',
      variables: [
        { id: 'legA', label: 'Leg a', symbol: 'a', dimension: 'length', defaultValue: 3, defaultUnit: 'ft' },
        { id: 'legB', label: 'Leg b', symbol: 'b', dimension: 'length', defaultValue: 4, defaultUnit: 'ft' },
        { id: 'hypotenuse', label: 'Hypotenuse c', symbol: 'c', dimension: 'length', defaultValue: 5, defaultUnit: 'ft' }
      ],
      solve: {
        hypotenuse: ({ legA, legB }) => Math.sqrt(legA ** 2 + legB ** 2),
        legA: ({ legB, hypotenuse }) => (hypotenuse > legB ? Math.sqrt(hypotenuse ** 2 - legB ** 2) : NaN),
        legB: ({ legA, hypotenuse }) => (hypotenuse > legA ? Math.sqrt(hypotenuse ** 2 - legA ** 2) : NaN)
      },
      outputs: [{ id: 'area', label: 'Triangle area', dimension: 'area', compute: (si) => (si.legA * si.legB) / 2 }],
      visuals: [{ type: 'compareBars', bars: [{ from: 'legA', label: 'Leg a' }, { from: 'legB', label: 'Leg b' }, { from: 'hypotenuse', label: 'Hypotenuse c' }], title: 'The three sides' }]
    },
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is the Pythagorean theorem?',
        paragraphs: [
          'The Pythagorean theorem relates the three sides of any right triangle (a triangle with one 90° angle): the sum of the squares of the two shorter sides, called legs, equals the square of the longest side, the hypotenuse, which always sits opposite the right angle. Written as a formula: a² + b² = c². A 3-4-5 triangle is the classic example — 3² + 4² = 9 + 16 = 25, and 25 is 5².',
          'The theorem works in exactly one direction as a check (if a² + b² = c², the triangle is a right triangle) and in three directions as a calculator: given any two sides, the third follows by rearranging the formula — c = √(a² + b²) for the hypotenuse, or a = √(c² − b²) for a leg. This calculator solves whichever one you leave as the automatically calculated field.',
          "It is one of the oldest and most widely used results in mathematics, with applications anywhere a straight-line distance needs to be found from two perpendicular measurements — a ladder's reach against a wall, the diagonal of a rectangular screen or room, or the straight-line distance between two points on a grid (the same formula underlies the distance-between-two-points calculation in coordinate geometry)."
        ]
      },
      howTo: {
        intro: 'Enter any two of the three sides — the third, marked auto, is calculated.',
        steps: [
          { name: 'Find the hypotenuse', text: 'Enter both legs. The hypotenuse field, marked auto, fills in as the square root of the sum of their squares.' },
          { name: 'Find a missing leg', text: 'Enter the hypotenuse and the other leg instead. The missing leg is found by rearranging the formula — it requires the hypotenuse to be longer than that other leg.' },
          { name: 'Switch which field is calculated', text: 'Type into the auto field and it becomes an input again; the field left alone the longest becomes the new calculated one.' },
          { name: 'Check the units', text: 'Switch the unit menu on any side (feet, meters, inches...) and the other two convert automatically to match.' },
          { name: 'Read the triangle area', text: 'The area (½ × leg a × leg b) is shown underneath, a free bonus from already knowing both legs.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'One relationship between the three sides of a right triangle, rearranged three ways.',
        expression: 'a² + b² = c²\nc = √(a² + b²)\na = √(c² − b²)  (requires c > b)\nb = √(c² − a²)  (requires c > a)',
        terms: [
          { symbol: 'a, b (legs)', meaning: 'The two sides that meet at the right angle.' },
          { symbol: 'c (hypotenuse)', meaning: 'The longest side, opposite the right angle. Always longer than either leg individually.' }
        ],
        note: 'Area = ½ × a × b, since the two legs form the base and height of the triangle (they meet at a right angle).'
      },
      workedExample: {
        intro: "A 6-foot ladder problem, scaled up from the classic 3-4-5 triangle: a ladder's foot sits 6 ft from a wall, and the ladder reaches 8 ft up the wall. How long is the ladder?",
        rows: [
          { label: 'Square each leg', value: '6² = 36, 8² = 64' },
          { label: 'Add them', value: '36 + 64 = 100' },
          { label: 'Take the square root', value: '√100 = 10' },
          { label: 'Area, as a bonus', value: '½ × 6 × 8 = 24 ft²' }
        ],
        result: 'Hypotenuse = 10 ft, area = 24 ft²',
        explanation: 'This is the 3-4-5 triangle scaled up by a factor of 2 (6 = 3×2, 8 = 4×2, 10 = 5×2) — any multiple of 3-4-5 is automatically a right triangle, which is why it shows up so often as a quick way to check a corner is square on a job site.'
      },
      watchOut: [
        { title: 'The hypotenuse must be longer than each leg', body: 'Solving for a leg given the hypotenuse and the other leg requires the hypotenuse to be the strictly longest side. Entering a hypotenuse of 5 and a leg of 6 has no answer — 6 could not be a leg of a triangle whose longest side is only 5 — and this calculator reports no result rather than a misleading negative-under-the-root value.' },
        { title: 'Only works for right triangles', body: 'a² + b² = c² is specific to triangles with a 90° angle. For any other triangle, the related (but more general) Law of Cosines is needed instead.' },
        { title: 'Negative side lengths are not physically meaningful', body: 'A length cannot be negative, but squaring removes the sign anyway — entering −6 for a leg gives the identical result as entering 6. Treat negative inputs as a typo, not a valid measurement.' },
        { title: 'Which side is the hypotenuse matters', body: 'The hypotenuse is always the side opposite the right angle, and always the longest of the three — mixing it up with a leg when setting up the problem is a common source of a wrong answer, even though the arithmetic itself is simple.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §9.3 Use Properties of Angles, Triangles, and the Pythagorean Theorem', url: 'https://openstax.org/books/prealgebra-2e/pages/9-3-use-properties-of-angles-triangles-and-the-pythagorean-theorem' },
        { label: 'Wolfram MathWorld, Pythagorean Theorem', url: 'https://mathworld.wolfram.com/PythagoreanTheorem.html' }
      ]
    },
    inputs: [
      { id: 'legA', label: 'Leg a', type: 'number', placeholder: '3', defaultValue: 3, step: 1 },
      { id: 'legB', label: 'Leg b', type: 'number', placeholder: '4', defaultValue: 4, step: 1 }
    ],
    seo: {
      title: 'Pythagorean Theorem Calculator – Solve a² + b² = c²',
      description: 'Free Pythagorean theorem calculator. Find the hypotenuse of a right triangle from its two legs, or solve for a missing leg instead.',
      faq: [
        { question: 'What is the Pythagorean theorem?', answer: 'For any right triangle, a² + b² = c², where a and b are the two legs and c is the hypotenuse (the side opposite the right angle).' },
        { question: 'How do I find the hypotenuse?', answer: 'Square both legs, add them, then take the square root: c = √(a² + b²). For legs 3 and 4, c = √(9 + 16) = √25 = 5.' },
        { question: 'How do I find a missing leg?', answer: 'Square the hypotenuse, subtract the square of the known leg, then take the square root: a = √(c² − b²). For a hypotenuse of 5 and a leg of 4, a = √(25 − 16) = √9 = 3.' },
        { question: 'What is a 3-4-5 triangle?', answer: 'The smallest right triangle with whole-number side lengths — legs 3 and 4, hypotenuse 5 — often used to check that a corner is exactly 90°.' },
        { question: 'Does the Pythagorean theorem work for any triangle?', answer: 'No, only right triangles (one 90° angle). Other triangles need the Law of Cosines, a more general formula that reduces to the Pythagorean theorem when one angle is 90°.' },
        { question: 'Can the hypotenuse be shorter than a leg?', answer: 'No. The hypotenuse is always the longest side of a right triangle, since it is opposite the largest (90°) angle.' },
        { question: 'How is the Pythagorean theorem used in real life?', answer: 'Finding a straight-line distance from two perpendicular measurements — a diagonal screen size, a ladder\'s reach, a TV stand\'s fit, or the distance between two points on a map.' },
        { question: 'What units does this calculator use?', answer: 'Any length unit — feet, meters, inches and more are available from the unit menu on each field, and converting one updates the others automatically.' }
      ]
    },
    compute(values) {
      const { legA, legB } = values;
      return { hypotenuse: Math.sqrt(legA ** 2 + legB ** 2), area: (legA * legB) / 2 };
    }
  },
  {
    id: 'triangle-calculator',
    category: 'math',
    glyph: '△',
    updatedAt: '2026-10-22',
    aliases: ['triangle solver', 'sss triangle calculator', 'sas triangle calculator', 'triangle angle calculator', 'find missing angle triangle calculator'],
    related: ['pythagorean-theorem-calculator', 'area-calculator', 'circle-calculator', 'surface-area-calculator'],
    title: 'Triangle Calculator',
    description: 'Solve any triangle from three sides (SSS), two sides and the angle between them (SAS), or two angles and the side between them (ASA) — get every side, angle, the perimeter and the area.',
    example: 'A triangle with sides 7, 9 and 12 has angles of about 35.43°, 48.19° and 96.38°, a perimeter of 28 and an area of about 31.30, found with the law of cosines and Heron’s formula.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a triangle solver?',
        paragraphs: [
          'Any triangle is completely fixed by three independent measurements — but which three you happen to know changes which formula finds the rest. Know all three sides (SSS, "side-side-side")? The law of cosines finds every angle, and Heron’s formula finds the area directly from the sides, with no angle needed at all. Know two sides and the angle trapped between them (SAS, "side-angle-side")? The law of cosines finds the third side first, and then the same angle formulas find the other two angles. Know two angles and the side that connects them (ASA, "angle-side-angle")? The third angle is just 180° minus the other two, and the law of sines finds the two missing sides.',
          'This calculator covers all three of those well-posed cases on one page, sharing the same six fields (three sides, three angles) and switching which ones it reads based on the mode you pick. Whichever route it takes, it always finishes the same way: it ends up knowing all three sides, recomputes all three angles from them with the law of cosines for internal consistency, and reports the perimeter and the area.',
          'One case is deliberately left out: SSA, two sides and an angle that is NOT between them. That case is mathematically ambiguous — the same two sides and angle can match zero, one or two different triangles, depending on the numbers — so instead of guessing at one of the answers, this calculator asks for a different combination of three measurements instead.'
        ]
      },
      howTo: {
        intro: 'Pick the mode that matches what you actually measured, then fill in exactly those three fields.',
        steps: [
          { name: 'Choose SSS, SAS or ASA', text: 'SSS needs all three sides. SAS needs two sides and the angle squeezed between them. ASA needs two angles and the side that joins them.' },
          { name: 'Fill in only the fields that mode uses', text: 'The other fields stay visible (tucked under "More options" for SAS/ASA) but compute() ignores whatever is left over in them for that mode — they do not need to be blanked out.' },
          { name: 'Check the triangle is possible', text: 'SSS requires each side to be shorter than the sum of the other two (the triangle inequality). ASA requires the two given angles to add to less than 180°. If either fails, every result is left blank rather than shown as a wrong number.' },
          { name: 'Read every side, angle, the perimeter and the area', text: 'All six measurements are filled in regardless of which three you started from, plus the perimeter (the sum of the sides) and the area (from Heron’s formula).' },
          { name: 'Compare the three sides', text: 'The chart shows side a, side b and side c side by side, so you can see at a glance which is longest.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Three different starting points, all converging on the same final sides-and-angles picture.',
        expression:
          'Law of cosines: c² = a² + b² − 2ab·cos(C)\nLaw of sines: a ÷ sin(A) = b ÷ sin(B) = c ÷ sin(C)\nHeron’s formula: Area = √(s(s−a)(s−b)(s−c)), where s = (a+b+c) ÷ 2',
        terms: [
          { symbol: 'a, b, c', meaning: 'The three sides. By convention, side a is opposite angle A, side b opposite angle B, and side c opposite angle C.' },
          { symbol: 'A, B, C', meaning: 'The three angles, in degrees, always adding up to 180°.' },
          { symbol: 's', meaning: 'The semiperimeter — half of the triangle’s perimeter — a bookkeeping shortcut Heron’s formula uses, not a separate measurement.' }
        ],
        note: 'For SSS, the law of cosines is rearranged to solve for an angle instead of a side: cos(A) = (b² + c² − a²) ÷ (2bc), then A = arccos(...). The calculator applies this once for each angle.'
      },
      workedExample: {
        intro: 'A surveyor measures all three sides of a triangular plot: 7 m, 9 m and 12 m (SSS). What are its angles, perimeter and area?',
        rows: [
          { label: 'Angle A (opposite side 7)', value: 'arccos((9² + 12² − 7²) ÷ (2 × 9 × 12)) ≈ 35.43°' },
          { label: 'Angle B (opposite side 9)', value: 'arccos((7² + 12² − 9²) ÷ (2 × 7 × 12)) ≈ 48.19°' },
          { label: 'Angle C (opposite side 12)', value: '180° − 35.43° − 48.19° ≈ 96.38°' },
          { label: 'Perimeter', value: '7 + 9 + 12 = 28' },
          { label: 'Semiperimeter (s)', value: '28 ÷ 2 = 14' },
          { label: 'Area (Heron’s formula)', value: '√(14 × 7 × 5 × 2) = √980 ≈ 31.30' }
        ],
        result: 'A ≈ 35.43° · B ≈ 48.19° · C ≈ 96.38° · perimeter = 28 · area ≈ 31.30',
        explanation: 'Notice the three angles add to 180.00°, the universal check for any triangle. Side 12, the longest side, sits opposite the largest angle (96.38°) — the longest side is always opposite the largest angle, and the shortest side is always opposite the smallest one.'
      },
      watchOut: [
        { title: 'SSA (two sides and a non-included angle) is not supported', body: 'Two sides and an angle that is not between them can describe zero, one or two valid triangles — the "ambiguous case" of the law of sines. Rather than silently pick one answer, this calculator leaves that combination out; measure the included angle instead (SAS) or a third side (SSS).' },
        { title: 'A triangle must pass the triangle inequality', body: 'Each side must be strictly shorter than the sum of the other two. Sides 1, 2 and 10 fail (1 + 2 is nowhere near 10) and every output is left blank rather than showing a result for a shape that cannot exist.' },
        { title: 'Degrees, not radians', body: 'Every angle field expects degrees (90 for a right angle, not 1.5708). Entering radians by mistake will throw off every other field that depends on it.' },
        { title: 'Left-over fields in other modes are ignored, not blanked', body: 'Switching from SSS to SAS does not erase the side-c field — it is simply not read in SAS mode, where the third side is calculated instead. Re-entering it has no effect until you switch back to a mode that uses it directly.' },
        { title: 'This only finds area, angles, sides and perimeter', body: 'For the kind of right-triangle-only hypotenuse problem where exactly two sides are known and the angle between them is a right angle, the dedicated Pythagorean theorem calculator is faster — it is the SAS case here with the included angle fixed at 90°.' }
      ],
      references: [
        { label: 'OpenStax, Algebra and Trigonometry 2e, §10.1 Non-right Triangles: Law of Sines', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/10-1-non-right-triangles-law-of-sines' },
        { label: 'OpenStax, Algebra and Trigonometry 2e, §10.2 Non-right Triangles: Law of Cosines', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/10-2-non-right-triangles-law-of-cosines' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'What do you know?',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Three sides (SSS)' },
          { value: 2, label: 'Two sides + the angle between them (SAS)' },
          { value: 3, label: 'Two angles + the side between them (ASA)' }
        ]
      },
      { id: 'sideA', label: 'Side a', type: 'number', placeholder: '3', defaultValue: 3, step: 1 },
      { id: 'sideB', label: 'Side b', type: 'number', placeholder: '4', defaultValue: 4, step: 1 },
      { id: 'sideC', label: 'Side c (between angles A and B)', type: 'number', placeholder: '5', defaultValue: 5, step: 1 },
      { id: 'angleA', label: 'Angle A, in degrees (opposite side a)', type: 'number', placeholder: '36.87', defaultValue: 36.87, step: 0.01 },
      { id: 'angleB', label: 'Angle B, in degrees (opposite side b)', type: 'number', placeholder: '53.13', defaultValue: 53.13, step: 0.01 },
      { id: 'angleC', label: 'Angle C, in degrees (between sides a and b)', type: 'number', placeholder: '90', defaultValue: 90, step: 0.01 }
    ],
    breakdown: {
      headline: 'area',
      headlineLabel: 'Area',
      outputs: [
        { id: 'area', label: 'Area', format: 'number' },
        { id: 'perimeter', label: 'Perimeter', format: 'number' },
        { id: 'sideA', label: 'Side a', format: 'number' },
        { id: 'sideB', label: 'Side b', format: 'number' },
        { id: 'sideC', label: 'Side c', format: 'number' },
        { id: 'angleA', label: 'Angle A (degrees)', format: 'number' },
        { id: 'angleB', label: 'Angle B (degrees)', format: 'number' },
        { id: 'angleC', label: 'Angle C (degrees)', format: 'number' }
      ],
      groups: [
        { inputs: ['mode'] },
        { inputs: ['sideA', 'sideB', 'sideC'] },
        { title: 'Only used for "two sides + angle" (SAS) mode', inputs: ['angleC'], optional: true },
        { title: 'Only used for "two angles + side" (ASA) mode', inputs: ['angleA', 'angleB'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'sideA', label: 'Side a' }, { from: 'sideB', label: 'Side b' }, { from: 'sideC', label: 'Side c' }],
        title: 'The three sides'
      }
    },
    seo: {
      title: 'Triangle Calculator – Solve SSS, SAS or ASA for Sides, Angles & Area',
      description: 'Free triangle calculator. Enter three sides, two sides and an angle, or two angles and a side to find every side, angle, the perimeter and the area.',
      faq: [
        { question: 'How do I find the angles of a triangle from its three sides?', answer: 'Use the law of cosines rearranged for an angle: cos(A) = (b² + c² − a²) ÷ (2bc), then take the arccosine. Repeat for each angle, or let this calculator do it for all three at once from the SSS mode.' },
        { question: 'How do I find the area of a triangle from its three sides?', answer: 'Use Heron’s formula: find the semiperimeter s = (a + b + c) ÷ 2, then Area = √(s(s−a)(s−b)(s−c)). For sides 7, 9 and 12, s = 14 and the area is √(14×7×5×2) = √980 ≈ 31.30.' },
        { question: 'What is the SAS (side-angle-side) case?', answer: 'You know two sides and the angle trapped between them. The law of cosines finds the third side first (for sides 8 and 10 with a 60° included angle, the third side is about 9.17), then the same formula, rearranged, finds the other two angles.' },
        { question: 'What is the ASA (angle-side-angle) case?', answer: 'You know two angles and the side that joins them. The third angle is 180° minus the other two, and the law of sines finds the two missing sides. For angles 50° and 60° with a 10-unit side between them, the third angle is 70° and the other two sides are about 8.15 and 9.22.' },
        { question: 'Why isn’t SSA (two sides and a non-included angle) supported?', answer: 'It is the one combination that can be genuinely ambiguous: depending on the numbers, the same two sides and angle can match zero triangles, exactly one, or two different ones (the "ambiguous case" of the law of sines). Rather than silently choose one possible answer, this calculator asks for a different, unambiguous combination.' },
        { question: 'How do I know if three side lengths can actually form a triangle?', answer: 'Check the triangle inequality: each side must be strictly less than the sum of the other two. Sides 1, 2 and 10 cannot form a triangle, because 1 + 2 = 3 is far less than 10.' },
        { question: 'Do the three angles of a triangle always add up to 180°?', answer: 'Yes, for any triangle on a flat plane (Euclidean geometry) — this is a basic property used throughout this calculator, for example to find the third angle in ASA mode by subtracting the other two from 180°.' },
        { question: 'What units does this calculator use?', answer: 'Sides are plain numbers — pick whatever consistent unit you measured in (feet, meters, inches). Angles are always in degrees, not radians.' }
      ]
    },
    compute(values) {
      const { mode, sideA, sideB, sideC, angleA, angleB, angleC } = values;
      const notATriangle = { sideA: NaN, sideB: NaN, sideC: NaN, angleA: NaN, angleB: NaN, angleC: NaN, perimeter: NaN, area: NaN };
      let a = sideA;
      let b = sideB;
      let c = sideC;
      if (mode === 2) {
        // SAS: two sides and the angle between them -> third side via the law of cosines.
        if (!(sideA > 0) || !(sideB > 0) || !(angleC > 0 && angleC < 180)) return notATriangle;
        a = sideA;
        b = sideB;
        c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos((angleC * Math.PI) / 180));
      } else if (mode === 3) {
        // ASA: two angles and the side between them -> other two sides via the law of sines.
        if (!(angleA > 0) || !(angleB > 0) || angleA + angleB >= 180 || !(sideC > 0)) return notATriangle;
        const bigC = 180 - angleA - angleB;
        c = sideC;
        a = (c * Math.sin((angleA * Math.PI) / 180)) / Math.sin((bigC * Math.PI) / 180);
        b = (c * Math.sin((angleB * Math.PI) / 180)) / Math.sin((bigC * Math.PI) / 180);
      }
      // mode 1 (SSS), and the fallback for any other value, uses sideA/sideB/sideC directly.
      const valid = a > 0 && b > 0 && c > 0 && a + b > c && b + c > a && a + c > b;
      if (!valid) return notATriangle;
      const clamp = (x: number) => Math.max(-1, Math.min(1, x));
      const toDeg = (r: number) => (r * 180) / Math.PI;
      const bigA = toDeg(Math.acos(clamp((b * b + c * c - a * a) / (2 * b * c))));
      const bigB = toDeg(Math.acos(clamp((a * a + c * c - b * b) / (2 * a * c))));
      const s = (a + b + c) / 2;
      const discriminant = s * (s - a) * (s - b) * (s - c);
      return {
        sideA: a,
        sideB: b,
        sideC: c,
        angleA: bigA,
        angleB: bigB,
        angleC: 180 - bigA - bigB,
        perimeter: a + b + c,
        area: discriminant > 0 ? Math.sqrt(discriminant) : 0
      };
    }
  },
  {
    id: 'circle-calculator',
    category: 'math',
    glyph: '○',
    updatedAt: '2026-10-22',
    aliases: ['radius to circumference calculator', 'radius to area calculator', 'diameter calculator', 'circumference calculator', 'circle area calculator'],
    related: ['area-calculator', 'triangle-calculator', 'pythagorean-theorem-calculator', 'volume-calculator'],
    title: 'Circle Calculator',
    description: 'Enter a circle’s radius or diameter to get the other, plus its circumference and area, with the formulas shown.',
    example: 'A circle with a 7 m radius has a 14 m diameter, a circumference of about 43.98 m, and an area of about 153.94 m².',
    solver: {
      defaultTarget: 'diameter',
      variables: [
        { id: 'radius', label: 'Radius', symbol: 'r', dimension: 'length', defaultValue: 5, defaultUnit: 'm' },
        { id: 'diameter', label: 'Diameter', symbol: 'd', dimension: 'length', defaultValue: 10, defaultUnit: 'm' }
      ],
      solve: {
        diameter: ({ radius }) => radius * 2,
        radius: ({ diameter }) => diameter / 2
      },
      outputs: [
        { id: 'circumference', label: 'Circumference', dimension: 'length', compute: (si) => 2 * Math.PI * si.radius },
        { id: 'area', label: 'Area', dimension: 'area', compute: (si) => Math.PI * si.radius ** 2 }
      ],
      visuals: [
        { type: 'compareBars', bars: [{ from: 'radius', label: 'Radius' }, { from: 'diameter', label: 'Diameter' }], title: 'Radius and diameter' }
      ]
    },
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a circle calculator?',
        paragraphs: [
          'A circle is defined by a single number — how far every point on it sits from the center, its radius — and everything else about its size follows automatically. Double the radius and you double the diameter, double the circumference, and quadruple the area, because area grows with the square of the radius.',
          'The constant that connects a circle’s straight-line measurements (radius, diameter) to its curved ones (circumference, area) is π (pi), the ratio of any circle’s circumference to its diameter — approximately 3.14159, and the same for every circle regardless of size. This calculator enters π to full floating-point precision, not a rounded 3.14, so the answer is as accurate as your input.',
          'Enter either the radius or the diameter — whichever you know — and the other three figures (the other of radius/diameter, the circumference, and the area) are filled in immediately.'
        ]
      },
      howTo: {
        intro: 'Enter either the radius or the diameter. The other one, marked auto, is calculated, and the circumference and area always update underneath.',
        steps: [
          { name: 'Enter the radius', text: 'Type the distance from the center to the edge. The diameter field fills in as exactly double.' },
          { name: 'Or enter the diameter instead', text: 'Type into the diameter field and the radius becomes exactly half of it — only one of the two needs to be known.' },
          { name: 'Read the circumference and area', text: 'Both update automatically underneath, using the current radius: circumference = 2πr, area = πr².' },
          { name: 'Switch units at any time', text: 'Changing the unit menu on either field converts the number you typed, so 5 m correctly becomes 16.4 ft rather than silently turning into 5 ft.' },
          { name: 'Share or copy', text: 'Share result copies a link that reopens the calculator with your exact radius and unit. Copy result copies the figures as text.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Every circle measurement follows from the radius alone.',
        expression: 'd = 2r\nC = 2πr = πd\nA = πr²',
        terms: [
          { symbol: 'r', meaning: 'Radius — the distance from the center to any point on the circle.' },
          { symbol: 'd', meaning: 'Diameter — a straight line through the center, exactly twice the radius.' },
          { symbol: 'C', meaning: 'Circumference — the distance all the way around the circle.' },
          { symbol: 'π', meaning: 'Pi, approximately 3.14159265 — the fixed ratio of any circle’s circumference to its diameter.' }
        ],
        note: 'To work backward from a known circumference or area instead of the radius: r = C ÷ (2π), or r = √(A ÷ π).'
      },
      workedExample: {
        intro: 'A circular table has a 14 m diameter. What is its radius, circumference and area?',
        rows: [
          { label: 'Radius (d ÷ 2)', value: '14 ÷ 2 = 7 m' },
          { label: 'Circumference (2πr, or πd)', value: '2 × π × 7 = π × 14 ≈ 43.98 m' },
          { label: 'Area (πr²)', value: 'π × 7² = π × 49 ≈ 153.94 m²' }
        ],
        result: 'Radius = 7 m · Circumference ≈ 43.98 m · Area ≈ 153.94 m²',
        explanation: 'Doubling the earlier 7 m-radius example to a 14 m diameter is the same circle described the other way — the radius comes straight back out as 7 m, confirming d = 2r both directions.'
      },
      watchOut: [
        { title: 'This solves from radius or diameter, not circumference or area', body: 'The live widget only auto-solves between radius and diameter, since a circle has one degree of freedom and the widget needs exactly one known field. If you only know the circumference or area, use the manual formulas above (r = C ÷ (2π) or r = √(A ÷ π)) to get the radius first, then enter that.' },
        { title: 'Area grows with the square of the radius, not the diameter directly', body: 'Doubling the radius quadruples the area (2² = 4), not doubles it — a common source of underestimating how much more material a bigger circle (a pizza, a pipe) actually needs.' },
        { title: 'π is irrational — any decimal value is an approximation', body: 'This calculator uses JavaScript’s built-in π to about 15 significant digits, far more precise than the common shorthand 3.14 or 22/7. For most practical purposes the difference is invisible, but it means two calculators rounding π differently can disagree in the last displayed digit.' },
        { title: 'Radius and diameter must be the same unit as each other', body: 'The unit menu on each field keeps them consistent automatically — typing 5 into the radius field with the unit set to meters and then reading the diameter in feet is handled for you, not something to convert by hand.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §9.5 Solve Geometry Applications: Circles and Irregular Figures', url: 'https://openstax.org/books/prealgebra-2e/pages/9-5-solve-geometry-applications-circles-and-irregular-figures' },
        { label: 'Wolfram MathWorld, Circle', url: 'https://mathworld.wolfram.com/Circle.html' }
      ]
    },
    inputs: [{ id: 'radius', label: 'Radius (m)', type: 'number', placeholder: '5', defaultValue: 5, step: 0.1, min: 0 }],
    seo: {
      title: 'Circle Calculator – Radius, Diameter, Circumference & Area',
      description: 'Free circle calculator. Enter a radius or diameter to find the other, plus the circumference and area, with every formula shown.',
      faq: [
        { question: 'How do I find the circumference of a circle?', answer: 'Multiply the radius by 2π, or the diameter by π: C = 2πr = πd. A 7 m radius gives a circumference of 2 × π × 7 ≈ 43.98 m.' },
        { question: 'How do I find the area of a circle?', answer: 'Square the radius and multiply by π: A = πr². A 7 m radius gives an area of π × 49 ≈ 153.94 m².' },
        { question: 'How do I find the radius from the diameter?', answer: 'Divide the diameter by 2: r = d ÷ 2. A 14 m diameter gives a 7 m radius.' },
        { question: 'How do I find the radius from the circumference?', answer: 'Divide the circumference by 2π: r = C ÷ (2π). A circumference of about 31.42 gives a radius of 31.42 ÷ (2π) ≈ 5.' },
        { question: 'How do I find the radius from the area?', answer: 'Divide the area by π and take the square root: r = √(A ÷ π). An area of about 78.54 gives a radius of √(78.54 ÷ π) ≈ 5.' },
        { question: 'What is pi (π)?', answer: 'Pi is the ratio of any circle’s circumference to its diameter, approximately 3.14159265. It is irrational — its decimal digits never end or repeat — and the same for every circle regardless of size.' },
        { question: 'Does doubling the radius double the area?', answer: 'No. Area depends on the radius squared, so doubling the radius quadruples the area (2² = 4), not doubles it.' },
        { question: 'What units does this calculator use?', answer: 'Any length unit from the menu — meters, feet, inches and more. The area is shown in the matching squared unit (m², ft², etc.).' }
      ]
    },
    compute(values) {
      const { radius } = values;
      return { diameter: radius * 2, circumference: 2 * Math.PI * radius, area: Math.PI * radius ** 2 };
    }
  },
  {
    id: 'area-calculator',
    category: 'math',
    glyph: 'A',
    updatedAt: '2026-10-22',
    aliases: ['square footage calculator', 'area of a shape calculator', 'rectangle area calculator', 'trapezoid area calculator', 'find the area calculator'],
    related: ['circle-calculator', 'triangle-calculator', 'volume-calculator', 'surface-area-calculator'],
    title: 'Area Calculator',
    description: 'Find the area of a square, rectangle, triangle, circle or trapezoid from its basic measurements, with the formula for every shape shown.',
    example: 'A 5 m × 3 m rectangular room has a floor area of 15 m². Switch shapes to find a triangle, circle or trapezoid’s area from its own measurements instead.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is area?',
        paragraphs: [
          'Area is the amount of flat surface a two-dimensional shape covers — how much paint a wall needs, how much turf a lawn needs, how much floor a rug needs to fit. It is always measured in square units (square meters, square feet), because it is fundamentally a count of how many unit squares (1 m × 1 m, 1 ft × 1 ft) would tile the shape exactly.',
          'Every shape has its own area formula, but they are closely related. A rectangle’s area is simply length times width — the most basic case, since a 1 × 1 unit square obviously has an area of 1. A triangle is exactly half of the rectangle that would enclose it (its base times its height), which is why the triangle formula carries that extra ÷ 2. A circle swaps straight sides for π times the radius squared. A trapezoid, with two different-length parallel sides, averages them before multiplying by the height.',
          'This calculator covers five of the most commonly needed shapes — square, rectangle, triangle, circle and trapezoid — on one page, so switching between them does not mean hunting down a different formula each time.'
        ]
      },
      howTo: {
        intro: 'Pick the shape, then fill in just the measurements that shape needs.',
        steps: [
          { name: 'Choose a shape', text: 'Square, rectangle, triangle, circle or trapezoid. Each one uses its own formula underneath.' },
          { name: 'Enter the first measurement', text: 'A side (square), a length (rectangle), a base (triangle), a radius (circle), or one parallel side (trapezoid).' },
          { name: 'Enter the second measurement, if that shape needs one', text: 'A width (rectangle), a height (triangle or trapezoid). Square and circle only need the first measurement.' },
          { name: 'Add the trapezoid’s second parallel side', text: 'Tucked under "More options" since only the trapezoid shape reads it — the other four shapes ignore it entirely.' },
          { name: 'Read the area, and see how big it really is', text: 'The scale below the result places your area against an A4 sheet of paper, a basketball court and a soccer pitch, so a number like "420 m²" has something concrete to compare against.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Five shapes, five formulas — all of them variations on "multiply two lengths together."',
        expression:
          'Square: A = s²\nRectangle: A = l × w\nTriangle: A = ½ × b × h\nCircle: A = π × r²\nTrapezoid: A = ½ × (b₁ + b₂) × h',
        terms: [
          { symbol: 's', meaning: 'A square’s side length.' },
          { symbol: 'l, w', meaning: 'A rectangle’s length and width.' },
          { symbol: 'b, h', meaning: 'A triangle’s base and height (the perpendicular distance from the base to the opposite vertex) or a trapezoid’s height (the perpendicular distance between its two parallel sides).' },
          { symbol: 'r', meaning: 'A circle’s radius.' },
          { symbol: 'b₁, b₂', meaning: 'A trapezoid’s two parallel sides (its "bases"), which do not have to be the same length.' }
        ],
        note: 'This calculator finds area only, not perimeter — a triangle’s perimeter needs all three side lengths, not just a base and a height. See the Triangle Calculator for that.'
      },
      workedExample: {
        intro: 'A trapezoid-shaped garden bed has two parallel sides of 6 m and 10 m, and the perpendicular distance between them is 4 m. What is its area?',
        rows: [
          { label: 'Average the two parallel sides', value: '(6 + 10) ÷ 2 = 8 m' },
          { label: 'Multiply by the height', value: '8 × 4 = 32' }
        ],
        result: 'Area = 32 m²',
        explanation: 'Averaging the two parallel sides turns the trapezoid into an "equivalent rectangle" of the same height — a trapezoid is effectively a rectangle whose top and bottom sides don’t quite match, and averaging them is exactly what makes the simple length-times-width rectangle formula work for it too.'
      },
      watchOut: [
        { title: 'This finds area only, not perimeter', body: 'A triangle’s area formula here only needs a base and a height, not all three sides, so there isn’t enough information to also report a perimeter without assuming a shape (like a right triangle) that may not be true. For a triangle’s perimeter, use the Triangle Calculator, which takes all three sides.' },
        { title: 'A triangle’s height is perpendicular to its base, not a slanted side', body: 'The "height" in A = ½bh is the straight-up-and-down distance from the base to the opposite corner — not the length of one of the other two sides, which is almost always a different number.' },
        { title: 'A zero measurement gives a zero area, not an error', body: 'A square with a side of 0 is a single point with no area — a real, if trivial, answer, not a mistake. Negative measurements are rejected instead, since a length cannot be negative.' },
        { title: 'Mixing units gives a meaningless number', body: 'Multiplying a length in meters by a width in feet does not produce a valid area in either unit. Convert both measurements to the same unit first — the length unit menu here handles that automatically for whichever unit you pick.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §9.4 Use Properties of Rectangles, Triangles, and Trapezoids', url: 'https://openstax.org/books/prealgebra-2e/pages/9-4-use-properties-of-rectangles-triangles-and-trapezoids' },
        { label: 'OpenStax, Prealgebra 2e, §9.5 Solve Geometry Applications: Circles and Irregular Figures', url: 'https://openstax.org/books/prealgebra-2e/pages/9-5-solve-geometry-applications-circles-and-irregular-figures' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'Shape',
        type: 'number',
        placeholder: '2',
        defaultValue: 2,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Square' },
          { value: 2, label: 'Rectangle' },
          { value: 3, label: 'Triangle' },
          { value: 4, label: 'Circle' },
          { value: 5, label: 'Trapezoid' }
        ]
      },
      { id: 'dim1', label: 'First measurement (side, base or radius)', type: 'number', placeholder: '5', defaultValue: 5, step: 0.1, dimension: 'length', unit: 'm' },
      { id: 'dim2', label: 'Second measurement (width or height)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, dimension: 'length', unit: 'm' },
      { id: 'dim3', label: 'Second parallel side (trapezoid only)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.1, dimension: 'length', unit: 'm' }
    ],
    breakdown: {
      headline: 'area',
      headlineLabel: 'Area',
      outputs: [{ id: 'area', label: 'Area', dimension: 'area' }],
      groups: [
        { inputs: ['mode'] },
        { inputs: ['dim1', 'dim2'] },
        { title: 'Only used for the trapezoid shape', inputs: ['dim3'], optional: true }
      ],
      visual: {
        type: 'logScale',
        value: 'area',
        min: -2,
        max: 4,
        ticks: ['10⁻²', '10⁻¹', '10⁰', '10¹', '10²', '10³', '10⁴'],
        benchmarks: [
          { label: 'An ISO 216 A4 sheet of paper (0.21 m × 0.297 m ≈ 0.0624 m²)', value: 0.06237 },
          { label: 'A FIBA-regulation basketball court (28 m × 15 m = 420 m²)', value: 420 },
          { label: 'A FIFA-recommended soccer pitch (105 m × 68 m = 7,140 m²)', value: 7140 }
        ],
        title: 'How big is this area?',
        valueLabel: 'Your area'
      }
    },
    seo: {
      title: 'Area Calculator – Square, Rectangle, Triangle, Circle & Trapezoid',
      description: 'Free area calculator for a square, rectangle, triangle, circle or trapezoid. Enter the basic measurements and see the formula for each shape.',
      faq: [
        { question: 'How do I find the area of a rectangle?', answer: 'Multiply length by width: A = l × w. A 5 m by 3 m room has an area of 15 m².' },
        { question: 'How do I find the area of a square?', answer: 'Square the side length: A = s². A 4 m side gives an area of 4² = 16 m².' },
        { question: 'How do I find the area of a triangle?', answer: 'Multiply the base by the height, then halve it: A = ½ × b × h. A base of 6 m and a height of 4 m gives an area of ½ × 6 × 4 = 12 m².' },
        { question: 'How do I find the area of a circle?', answer: 'Square the radius and multiply by π: A = πr². A 5 m radius gives an area of π × 25 ≈ 78.54 m².' },
        { question: 'How do I find the area of a trapezoid?', answer: 'Average the two parallel sides, then multiply by the height: A = ½(b₁ + b₂) × h. Parallel sides of 6 m and 10 m with a height of 4 m give ½ × 16 × 4 = 32 m².' },
        { question: 'Does this calculator also find the perimeter?', answer: 'No. A triangle’s perimeter needs all three side lengths, and this calculator only takes a base and a height for the triangle shape. Use the Triangle Calculator for a perimeter alongside the area.' },
        { question: 'What is the difference between a square and a rectangle?', answer: 'A square is a rectangle whose length and width happen to be equal, so A = s² is really just A = l × w with l = w. Either formula gives the same answer for a square.' },
        { question: 'What units does this calculator use?', answer: 'Any length unit from the menu — meters, feet, inches and more. The area is shown in the matching squared unit (m², ft², etc.), converted automatically.' }
      ]
    },
    compute(values) {
      const { mode, dim1, dim2, dim3 } = values;
      let area: number;
      if (mode === 1) area = dim1 >= 0 ? dim1 ** 2 : NaN; // square
      else if (mode === 3) area = dim1 >= 0 && dim2 >= 0 ? 0.5 * dim1 * dim2 : NaN; // triangle (base x height / 2)
      else if (mode === 4) area = dim1 >= 0 ? Math.PI * dim1 ** 2 : NaN; // circle (dim1 = radius)
      else if (mode === 5) area = dim1 >= 0 && dim2 >= 0 && dim3 >= 0 ? 0.5 * (dim1 + dim3) * dim2 : NaN; // trapezoid (dim2 = height)
      else area = dim1 >= 0 && dim2 >= 0 ? dim1 * dim2 : NaN; // mode 2 (rectangle), and the fallback
      return { area };
    }
  },
  {
    id: 'volume-calculator',
    category: 'math',
    glyph: 'V',
    updatedAt: '2026-10-22',
    aliases: ['volume of a shape calculator', 'cylinder volume calculator', 'sphere volume calculator', 'box volume calculator', 'cone volume calculator'],
    related: ['surface-area-calculator', 'area-calculator', 'circle-calculator', 'concrete-calculator'],
    title: 'Volume Calculator',
    description: 'Find the volume of a cube, rectangular box, cylinder, sphere or cone from its basic measurements, with the formula for every shape shown.',
    example: 'A rectangular box 4 m × 3 m × 2 m holds 24 m³. Switch shapes to find a cylinder, sphere or cone’s volume from its own measurements instead.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is volume?',
        paragraphs: [
          'Volume is how much three-dimensional space a solid takes up — how much water a tank holds, how much concrete a footing needs, how much air a room contains. It is measured in cubic units (cubic meters, cubic feet), a count of how many unit cubes (1 m × 1 m × 1 m) would fill the solid exactly.',
          'Every solid’s volume formula is some version of "base area times height" or a fixed fraction of it. A rectangular box is its length times width times height — three measurements multiplied straight through. A cube is the special case where all three happen to be equal, so it is just the side cubed. A cylinder is a circle’s area (πr²) times its height. A cone is exactly one-third of the cylinder that would enclose it, the same way a triangle is half of its enclosing rectangle. A sphere’s formula, four-thirds times π times the radius cubed, follows from calculus rather than a simple "base times height" picture, but it is just as mechanical to apply.',
          'This calculator covers five of the most commonly needed solids — cube, rectangular box, cylinder, sphere and cone — on one page.'
        ]
      },
      howTo: {
        intro: 'Pick the solid, then fill in just the measurements it needs.',
        steps: [
          { name: 'Choose a solid', text: 'Cube, rectangular box, cylinder, sphere or cone. Each one uses its own formula underneath.' },
          { name: 'Enter the first measurement', text: 'A side (cube), a length (box), or a radius (cylinder, sphere, cone).' },
          { name: 'Enter the second measurement, if that solid needs one', text: 'A height (cylinder or cone). A sphere needs only the radius.' },
          { name: 'Add the box’s third measurement', text: 'Tucked under "More options" since only the rectangular box shape reads a third length — the other four shapes ignore it entirely.' },
          { name: 'Read the volume, and see how big it really is', text: 'The scale below the result places your volume against a drink can, a US gallon, and a minimum-size Olympic pool, so a number like "2,500 m³" has something concrete to compare against.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Five solids, five formulas — each one a base area carried through a height, or a fixed multiple of it.',
        expression:
          'Cube: V = s³\nRectangular box: V = l × w × h\nCylinder: V = π × r² × h\nSphere: V = (4⁄3) × π × r³\nCone: V = (1⁄3) × π × r² × h',
        terms: [
          { symbol: 's', meaning: 'A cube’s side length.' },
          { symbol: 'l, w, h', meaning: 'A rectangular box’s length, width and height.' },
          { symbol: 'r', meaning: 'The radius of a cylinder, sphere or cone’s circular base.' },
          { symbol: 'h', meaning: 'The height of a cylinder or cone, measured perpendicular to its circular base.' }
        ],
        note: 'A cone’s volume is exactly one-third of a cylinder with the same radius and height — easy to confuse, since they look similar but differ by a factor of 3.'
      },
      workedExample: {
        intro: 'A cylindrical water tank has a radius of 3 m and a height of 5 m. How much water can it hold?',
        rows: [
          { label: 'Base area (πr²)', value: 'π × 3² = π × 9 ≈ 28.27 m²' },
          { label: 'Multiply by the height', value: '28.27 × 5 ≈ 141.37' }
        ],
        result: 'Volume ≈ 141.37 m³',
        explanation: 'A cylinder’s volume is just its circular base area carried straight up through its height — the same "base times height" idea as a rectangular box, with the rectangle swapped for a circle.'
      },
      watchOut: [
        { title: 'A cone is one-third of the matching cylinder, not the same', body: 'A cone and a cylinder with the same radius and height are easy to mix up visually, but the cone holds exactly a third as much — forgetting the ⅓ is the single most common mistake with this formula.' },
        { title: 'The radius is squared or cubed, not multiplied once', body: 'Doubling a sphere’s or cylinder’s radius does not double its volume — a sphere’s volume scales with the cube of the radius (2³ = 8 times more), and a cylinder’s with the square of the radius for the same height (2² = 4 times more).' },
        { title: 'A zero measurement gives a zero volume, not an error', body: 'A cube with a side of 0 is a single point with no volume — a real, if trivial, answer, not a mistake. Negative measurements are rejected instead, since a length cannot be negative.' },
        { title: 'Volume and surface area are different questions', body: 'Volume is how much a solid holds; surface area is how much material wraps around its outside. A larger solid generally has more of both, but not in the same proportion — see the Surface Area Calculator for the companion figure.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §9.6 Solve Geometry Applications: Volume and Surface Area', url: 'https://openstax.org/books/prealgebra-2e/pages/9-6-solve-geometry-applications-volume-and-surface-area' },
        { label: 'Wolfram MathWorld, Cone', url: 'https://mathworld.wolfram.com/Cone.html' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'Shape',
        type: 'number',
        placeholder: '2',
        defaultValue: 2,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Cube' },
          { value: 2, label: 'Rectangular box' },
          { value: 3, label: 'Cylinder' },
          { value: 4, label: 'Sphere' },
          { value: 5, label: 'Cone' }
        ]
      },
      { id: 'dim1', label: 'First measurement (side, length or radius)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1, dimension: 'length', unit: 'm' },
      { id: 'dim2', label: 'Second measurement (width or height)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, dimension: 'length', unit: 'm' },
      { id: 'dim3', label: 'Third measurement (box only, its depth)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.1, dimension: 'length', unit: 'm' }
    ],
    breakdown: {
      headline: 'volume',
      headlineLabel: 'Volume',
      outputs: [{ id: 'volume', label: 'Volume', dimension: 'volume' }],
      groups: [
        { inputs: ['mode'] },
        { inputs: ['dim1', 'dim2'] },
        { title: 'Only used for the rectangular box shape', inputs: ['dim3'], optional: true }
      ],
      visual: {
        type: 'logScale',
        value: 'volume',
        min: -4,
        max: 4,
        ticks: ['10⁻⁴', '10⁻²', '10⁰', '10²', '10⁴'],
        benchmarks: [
          { label: 'A 355 mL drink can (0.000355 m³)', value: 0.000355 },
          { label: 'A US gallon (3.785411784 L, exact)', value: 0.003785411784 },
          { label: 'An Olympic pool, World Aquatics minimum (50 m × 25 m × 2 m = 2,500 m³)', value: 2500 }
        ],
        title: 'How big is this volume?',
        valueLabel: 'Your volume'
      }
    },
    seo: {
      title: 'Volume Calculator – Cube, Box, Cylinder, Sphere & Cone',
      description: 'Free volume calculator for a cube, rectangular box, cylinder, sphere or cone. Enter the basic measurements and see the formula for each shape.',
      faq: [
        { question: 'How do I find the volume of a rectangular box?', answer: 'Multiply length by width by height: V = l × w × h. A 4 m by 3 m by 2 m box holds 24 m³.' },
        { question: 'How do I find the volume of a cube?', answer: 'Cube the side length: V = s³. A 3 m side gives a volume of 3³ = 27 m³.' },
        { question: 'How do I find the volume of a cylinder?', answer: 'Multiply the circular base area by the height: V = πr²h. A 3 m radius and 5 m height give π × 9 × 5 ≈ 141.37 m³.' },
        { question: 'How do I find the volume of a sphere?', answer: 'Cube the radius, multiply by π, then by 4⁄3: V = (4⁄3)πr³. A 3 m radius gives (4⁄3) × π × 27 ≈ 113.10 m³.' },
        { question: 'How do I find the volume of a cone?', answer: 'Multiply the circular base area by the height, then take a third of it: V = (1⁄3)πr²h. A 3 m radius and 5 m height give (1⁄3) × π × 9 × 5 ≈ 47.12 m³ — exactly a third of the matching cylinder above.' },
        { question: 'Why is a cone’s volume a third of a cylinder’s?', answer: 'It is a geometric fact (provable with calculus or Cavalieri’s principle) that any cone is exactly one-third of the cylinder sharing its base and height, regardless of the radius or height chosen.' },
        { question: 'Does doubling the radius double the volume?', answer: 'No. A sphere’s volume scales with the cube of the radius, so doubling it multiplies the volume by 2³ = 8. A cylinder or cone’s volume scales with the square of the radius (for the same height), so doubling it multiplies the volume by 2² = 4.' },
        { question: 'What units does this calculator use?', answer: 'Any length unit from the menu — meters, feet, inches and more. The volume is shown in the matching cubed unit (m³, ft³, etc.), converted automatically.' }
      ]
    },
    compute(values) {
      const { mode, dim1, dim2, dim3 } = values;
      let volume: number;
      if (mode === 1) volume = dim1 >= 0 ? dim1 ** 3 : NaN; // cube
      else if (mode === 3) volume = dim1 >= 0 && dim2 >= 0 ? Math.PI * dim1 ** 2 * dim2 : NaN; // cylinder (dim1 = radius, dim2 = height)
      else if (mode === 4) volume = dim1 >= 0 ? (4 / 3) * Math.PI * dim1 ** 3 : NaN; // sphere
      else if (mode === 5) volume = dim1 >= 0 && dim2 >= 0 ? (1 / 3) * Math.PI * dim1 ** 2 * dim2 : NaN; // cone
      else volume = dim1 >= 0 && dim2 >= 0 && dim3 >= 0 ? dim1 * dim2 * dim3 : NaN; // mode 2 (rectangular box), and the fallback
      return { volume };
    }
  },
  {
    id: 'surface-area-calculator',
    category: 'math',
    glyph: 'SA',
    updatedAt: '2026-10-22',
    aliases: ['surface area of a shape calculator', 'cylinder surface area calculator', 'sphere surface area calculator', 'box surface area calculator', 'cone surface area calculator'],
    related: ['volume-calculator', 'area-calculator', 'circle-calculator', 'paint-calculator'],
    title: 'Surface Area Calculator',
    description: 'Find the total surface area of a cube, rectangular box, cylinder, sphere or cone from its basic measurements, with the formula for every shape shown.',
    example: 'A rectangular box 4 m × 3 m × 2 m has a total surface area of 52 m² — the sum of all six faces. Switch shapes to find a cylinder, sphere or cone’s surface area from its own measurements instead.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is surface area?',
        paragraphs: [
          'Surface area is the total area of every face wrapped around the outside of a solid — how much wrapping paper covers a box, how much metal forms a can, how much paint a tank’s exterior needs. Unlike volume, which measures what a solid holds on the inside, surface area only cares about its outer skin, and the two do not grow at the same rate as a solid gets bigger.',
          'A rectangular box has six rectangular faces in three matching pairs (top/bottom, front/back, left/right), so its formula adds up all three pairs: 2lw + 2lh + 2wh. A cube is the special case where every face is an identical square, six of them, giving the much simpler 6s². A sphere’s surface area, 4πr², is exactly four times the area of the circle you would get by slicing straight through its middle — a surprisingly clean relationship first proven by Archimedes. A cylinder unwraps into a rectangle (its curved side) plus two circular end caps. A cone similarly unwraps into a circular base plus a curved "lateral" surface.',
          'This calculator covers five of the most commonly needed solids — cube, rectangular box, cylinder, sphere and cone — and always reports the total surface area, every face included.'
        ]
      },
      howTo: {
        intro: 'Pick the solid, then fill in just the measurements it needs.',
        steps: [
          { name: 'Choose a solid', text: 'Cube, rectangular box, cylinder, sphere or cone. Each one uses its own formula underneath.' },
          { name: 'Enter the first measurement', text: 'A side (cube), a length (box), or a radius (cylinder, sphere, cone).' },
          { name: 'Enter the second measurement, if that solid needs one', text: 'A height (cylinder or cone). A sphere needs only the radius.' },
          { name: 'Add the box’s third measurement', text: 'Tucked under "More options" since only the rectangular box shape reads a third length — the other four shapes ignore it entirely.' },
          { name: 'Read the surface area, and see how big it really is', text: 'The scale below the result places your surface area against an A4 sheet of paper, a basketball court and a soccer pitch, the same everyday benchmarks the Area Calculator uses.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Five solids, five formulas — each one the sum of every face wrapped around the outside.',
        expression:
          'Cube: S = 6s²\nRectangular box: S = 2lw + 2lh + 2wh\nCylinder: S = 2πr² + 2πrh\nSphere: S = 4πr²\nCone: S = πr² + πr√(r² + h²)',
        terms: [
          { symbol: 's', meaning: 'A cube’s side length.' },
          { symbol: 'l, w, h', meaning: 'A rectangular box’s length, width and height.' },
          { symbol: 'r', meaning: 'The radius of a cylinder, sphere or cone’s circular base.' },
          { symbol: 'h', meaning: 'The height of a cylinder or cone, measured perpendicular to its circular base.' },
          { symbol: '√(r² + h²)', meaning: 'A cone’s slant height — the distance along its sloped side from the base edge to the tip, found with the Pythagorean theorem from its radius and height.' }
        ],
        note: 'This reports the cone’s TOTAL surface area (base circle πr² plus the curved lateral surface πr × slant height). If you only want the curved side, without the base, that is just the second term, πr√(r² + h²), on its own.'
      },
      workedExample: {
        intro: 'The same cylindrical tank from the Volume Calculator’s example — radius 3 m, height 5 m. How much metal does its outer surface need?',
        rows: [
          { label: 'Two circular end caps (2πr²)', value: '2 × π × 3² = 2 × π × 9 ≈ 56.55 m²' },
          { label: 'Curved side (2πrh)', value: '2 × π × 3 × 5 ≈ 94.25 m²' },
          { label: 'Add them together', value: '56.55 + 94.25 ≈ 150.80' }
        ],
        result: 'Surface area ≈ 150.80 m²',
        explanation: 'A cylinder’s surface splits cleanly into three flat-when-unrolled pieces: two identical circles for the top and bottom, and one rectangle for the curved side, whose width is the circle’s own circumference (2πr) once unrolled flat.'
      },
      watchOut: [
        { title: 'This cone formula includes the base', body: 'Some references give only a cone’s LATERAL (side) surface area, πr√(r² + h²), leaving the circular base out. This calculator reports the TOTAL — base included — since that matches what "how much material covers this cone" usually means in practice.' },
        { title: 'Surface area and volume do not grow at the same rate', body: 'Doubling every measurement of a solid multiplies its surface area by 4 (a squared effect) but its volume by 8 (a cubed effect) — why a large solid always has proportionally less surface relative to its volume than a small one, a relationship that shows up everywhere from cooling coffee to animal body heat loss.' },
        { title: 'A zero measurement gives a zero surface area, not an error', body: 'A cube with a side of 0 is a single point with no surface — a real, if trivial, answer, not a mistake. Negative measurements are rejected instead, since a length cannot be negative.' },
        { title: 'Surface area is not the same question as volume', body: 'A tall, thin cylinder and a short, wide one can hold very different amounts (volume) while needing a similar amount of material to build (surface area), or vice versa — the two figures answer genuinely different practical questions, so check which one a task actually calls for.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §9.6 Solve Geometry Applications: Volume and Surface Area', url: 'https://openstax.org/books/prealgebra-2e/pages/9-6-solve-geometry-applications-volume-and-surface-area' },
        { label: 'Wolfram MathWorld, Cone', url: 'https://mathworld.wolfram.com/Cone.html' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'Shape',
        type: 'number',
        placeholder: '2',
        defaultValue: 2,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Cube' },
          { value: 2, label: 'Rectangular box' },
          { value: 3, label: 'Cylinder' },
          { value: 4, label: 'Sphere' },
          { value: 5, label: 'Cone' }
        ]
      },
      { id: 'dim1', label: 'First measurement (side, length or radius)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1, dimension: 'length', unit: 'm' },
      { id: 'dim2', label: 'Second measurement (width or height)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, dimension: 'length', unit: 'm' },
      { id: 'dim3', label: 'Third measurement (box only, its depth)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.1, dimension: 'length', unit: 'm' }
    ],
    breakdown: {
      headline: 'surfaceArea',
      headlineLabel: 'Surface area',
      outputs: [{ id: 'surfaceArea', label: 'Surface area', dimension: 'area' }],
      groups: [
        { inputs: ['mode'] },
        { inputs: ['dim1', 'dim2'] },
        { title: 'Only used for the rectangular box shape', inputs: ['dim3'], optional: true }
      ],
      visual: {
        type: 'logScale',
        value: 'surfaceArea',
        min: -2,
        max: 4,
        ticks: ['10⁻²', '10⁻¹', '10⁰', '10¹', '10²', '10³', '10⁴'],
        benchmarks: [
          { label: 'An ISO 216 A4 sheet of paper (0.21 m × 0.297 m ≈ 0.0624 m²)', value: 0.06237 },
          { label: 'A FIBA-regulation basketball court (28 m × 15 m = 420 m²)', value: 420 },
          { label: 'A FIFA-recommended soccer pitch (105 m × 68 m = 7,140 m²)', value: 7140 }
        ],
        title: 'How big is this surface area?',
        valueLabel: 'Your surface area'
      }
    },
    seo: {
      title: 'Surface Area Calculator – Cube, Box, Cylinder, Sphere & Cone',
      description: 'Free surface area calculator for a cube, rectangular box, cylinder, sphere or cone. Enter the basic measurements and see the formula for each shape.',
      faq: [
        { question: 'How do I find the surface area of a rectangular box?', answer: 'Add up all three pairs of matching faces: S = 2lw + 2lh + 2wh. A 4 m by 3 m by 2 m box has a surface area of 2(12) + 2(8) + 2(6) = 52 m².' },
        { question: 'How do I find the surface area of a cube?', answer: 'Multiply one face’s area by 6: S = 6s². A 3 m side gives a surface area of 6 × 9 = 54 m².' },
        { question: 'How do I find the surface area of a cylinder?', answer: 'Add the two circular end caps to the curved side: S = 2πr² + 2πrh. A 3 m radius and 5 m height give 2π(9) + 2π(3)(5) ≈ 56.55 + 94.25 ≈ 150.80 m².' },
        { question: 'How do I find the surface area of a sphere?', answer: 'Square the radius and multiply by 4π: S = 4πr². A 3 m radius gives a surface area of 4π(9) ≈ 113.10 m².' },
        { question: 'How do I find the surface area of a cone?', answer: 'Add the circular base to the curved lateral surface: S = πr² + πr√(r² + h²). A 3 m radius and 5 m height give a slant height of √(9 + 25) ≈ 5.83 m, and a surface area of π(9) + π(3)(5.83) ≈ 83.23 m².' },
        { question: 'Does this include the base of the cone?', answer: 'Yes, this calculator reports the total surface area including the circular base. For the lateral (side-only) surface area, subtract πr² from the result, or use πr × slant height directly.' },
        { question: 'Why does a bigger solid have relatively less surface area?', answer: 'Surface area scales with the square of a solid’s size while volume scales with the cube, so as a solid grows, its volume outpaces its surface area — doubling every dimension multiplies surface area by 4 but volume by 8.' },
        { question: 'What units does this calculator use?', answer: 'Any length unit from the menu — meters, feet, inches and more. The surface area is shown in the matching squared unit (m², ft², etc.), converted automatically.' }
      ]
    },
    compute(values) {
      const { mode, dim1, dim2, dim3 } = values;
      let surfaceArea: number;
      if (mode === 1) surfaceArea = dim1 >= 0 ? 6 * dim1 ** 2 : NaN; // cube
      else if (mode === 3) surfaceArea = dim1 >= 0 && dim2 >= 0 ? 2 * Math.PI * dim1 ** 2 + 2 * Math.PI * dim1 * dim2 : NaN; // cylinder
      else if (mode === 4) surfaceArea = dim1 >= 0 ? 4 * Math.PI * dim1 ** 2 : NaN; // sphere
      else if (mode === 5) surfaceArea = dim1 >= 0 && dim2 >= 0 ? Math.PI * dim1 ** 2 + Math.PI * dim1 * Math.sqrt(dim1 ** 2 + dim2 ** 2) : NaN; // cone, base + lateral
      else surfaceArea = dim1 >= 0 && dim2 >= 0 && dim3 >= 0 ? 2 * (dim1 * dim2 + dim1 * dim3 + dim2 * dim3) : NaN; // mode 2 (box), and the fallback
      return { surfaceArea };
    }
  },
  {
    id: 'slope-calculator',
    category: 'math',
    glyph: 'm',
    updatedAt: '2026-10-22',
    aliases: ['slope formula calculator', 'rise over run calculator', 'gradient calculator', 'find the slope calculator', 'slope of a line calculator'],
    related: ['distance-calculator', 'midpoint-calculator', 'pythagorean-theorem-calculator', 'ratio-calculator'],
    title: 'Slope Calculator',
    description: 'Find the slope, angle of inclination, y-intercept and distance between two (x, y) points — everything needed to write the equation of the line through them.',
    example: 'The line through (1, 2) and (4, 8) has a slope of 2, an angle of about 63.43°, and the equation y = 2x.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is slope?',
        paragraphs: [
          'Slope measures how steep a line is: how much it rises or falls (Δy) for every step it takes sideways (Δx). Given any two points on a line, (x₁, y₁) and (x₂, y₂), the slope is the ratio of those two changes, m = (y₂ − y₁) ÷ (x₂ − x₁) — the "rise over run" most algebra classes lead with. A slope of 2 means the line climbs 2 units for every 1 unit it moves right; a slope of 0 is perfectly flat.',
          'The sign and size of the slope describe the line at a glance: positive slopes rise left to right, negative slopes fall, and the bigger the number (ignoring its sign), the steeper the line. One case breaks the formula outright — a vertical line, where x₁ and x₂ are equal, makes the denominator zero. There is no slope for a vertical line (not an infinite one, just undefined), even though the line itself is perfectly real and has a well-defined 90° angle.',
          'This calculator reports four things from the same two points: the slope itself, the angle the line makes with the horizontal, the y-intercept (where the line crosses the y-axis, assuming it is extended in both directions), and the straight-line distance between the two points — the same distance formula used by the dedicated distance calculator, and literally the Pythagorean theorem applied to the two coordinate differences.'
        ]
      },
      howTo: {
        intro: 'Enter the two points the line passes through; every other figure follows automatically.',
        steps: [
          { name: 'Enter Point A', text: 'Type the x- and y-coordinates of the first point.' },
          { name: 'Enter Point B', text: 'Type the x- and y-coordinates of the second point. Order does not matter — slope, angle and distance come out the same either way.' },
          { name: 'Read the slope and the equation', text: 'The slope (m) and y-intercept (b) are both shown, which together give the full equation of the line, y = mx + b.' },
          { name: 'Check the angle', text: 'The angle of inclination (0° up to just under 180°) shows how steep the line is independent of direction — 0° is flat, 90° is vertical.' },
          { name: 'Watch for a vertical line', text: 'If both points share the same x-coordinate, the slope and y-intercept are left blank (undefined) rather than shown as a wrong number — the angle still reads 90°.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'One pair of points, four related figures.',
        expression: 'm = (y₂ − y₁) ÷ (x₂ − x₁)\nb = y₁ − m·x₁\nθ = angle of inclination, from arctan(Δy ÷ Δx), kept between 0° and 180°\nd = √((x₂ − x₁)² + (y₂ − y₁)²)',
        terms: [
          { symbol: 'm', meaning: 'Slope: the ratio of vertical change to horizontal change between the two points.' },
          { symbol: 'b', meaning: 'The y-intercept — where the line crosses the y-axis — found by substituting Point A back into y = mx + b and solving for b.' },
          { symbol: 'θ (theta)', meaning: 'The angle of inclination: how far the line tilts from flat horizontal, always between 0° and 180°, regardless of which point is entered first.' },
          { symbol: 'd', meaning: 'The straight-line distance between the two points, from the distance formula (the Pythagorean theorem applied to Δx and Δy).' }
        ],
        note: 'The angle is found directly from Δx and Δy, not from the slope itself, so a vertical line still gets an honest 90° even though its slope is undefined.'
      },
      workedExample: {
        intro: 'A hiking trail climbs steadily: it starts at (0, 0) and, 120 ft later measured flat along the ground, it has risen 15 ft, ending at (120, 15). How steep is it, and how long is the trail itself?',
        rows: [
          { label: 'Run (Δx)', value: '120 − 0 = 120 ft' },
          { label: 'Rise (Δy)', value: '15 − 0 = 15 ft' },
          { label: 'Slope (m = 15 ÷ 120)', value: '0.125' },
          { label: 'Angle (arctan(0.125))', value: '≈ 7.13°' },
          { label: 'y-intercept (b = 0 − 0.125 × 0)', value: '0' },
          { label: 'Distance (√(120² + 15²))', value: '≈ 120.93 ft' }
        ],
        result: 'Slope = 0.125 (a 12.5% grade) · angle ≈ 7.13° · equation: y = 0.125x · trail length ≈ 120.93 ft',
        explanation: 'A slope of 0.125, written as a percentage (×100), is a 12.5% grade — a common way trail and road steepness is reported. The trail itself (≈120.93 ft) is slightly longer than the flat 120 ft it covers, because it also climbs 15 ft; the distance formula accounts for both.'
      },
      watchOut: [
        { title: 'A vertical line has no slope — not an infinite one', body: 'When both points share the same x-coordinate, the slope formula divides by zero. Mathematically that means "undefined," not a very large or infinite number. This calculator leaves the slope and y-intercept blank for a vertical line rather than showing something misleading.' },
        { title: 'The angle is still defined even when the slope is not', body: 'A vertical line has a perfectly good angle of inclination, 90°, even though it has no slope. The two figures answer slightly different questions, and only one of them breaks for a vertical line.' },
        { title: 'A horizontal line has a slope of exactly 0, not "no slope"', body: 'Don’t confuse "slope of zero" (flat, horizontal — a completely normal, defined line) with "slope is undefined" (vertical). They describe opposite situations that are easy to mix up.' },
        { title: 'The y-intercept assumes the line keeps going', body: 'b is where the line would cross the y-axis if extended in both directions — useful for the line’s equation, but not meaningful if you only care about the segment between your two specific points.' },
        { title: 'Order of the two points does not matter', body: 'Swapping Point A and Point B flips the sign of both Δx and Δy, which cancels out in the slope formula (and distance is already unsigned) — the slope, angle and distance all come out the same either way.' }
      ],
      references: [
        { label: 'OpenStax, Algebra and Trigonometry 2e, §4.1 Linear Functions', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/4-1-linear-functions' },
        { label: 'Wolfram MathWorld, Slope', url: 'https://mathworld.wolfram.com/Slope.html' }
      ]
    },
    inputs: [
      { id: 'x1', label: 'x₁ (Point A)', type: 'number', placeholder: '1', defaultValue: 1, step: 1 },
      { id: 'y1', label: 'y₁ (Point A)', type: 'number', placeholder: '2', defaultValue: 2, step: 1 },
      { id: 'x2', label: 'x₂ (Point B)', type: 'number', placeholder: '4', defaultValue: 4, step: 1 },
      { id: 'y2', label: 'y₂ (Point B)', type: 'number', placeholder: '8', defaultValue: 8, step: 1 }
    ],
    breakdown: {
      headline: 'slope',
      headlineLabel: 'Slope (m)',
      outputs: [
        { id: 'slope', label: 'Slope (m)', format: 'significant' },
        { id: 'angle', label: 'Angle of inclination (degrees)', format: 'number' },
        { id: 'yIntercept', label: 'y-intercept (b)', format: 'significant' },
        { id: 'distance', label: 'Distance between the points', format: 'significant' }
      ],
      groups: [
        { title: 'Point A', inputs: ['x1', 'y1'] },
        { title: 'Point B', inputs: ['x2', 'y2'] }
      ],
      derive: (values) => ({ deltaX: Math.abs(values.x2 - values.x1), deltaY: Math.abs(values.y2 - values.y1) }),
      visual: { type: 'compareBars', bars: [{ from: 'deltaX', label: 'Run (|Δx|)' }, { from: 'deltaY', label: 'Rise (|Δy|)' }], title: 'Rise and run between the two points' }
    },
    seo: {
      title: 'Slope Calculator – Find Slope, Angle, y-Intercept & Distance',
      description: 'Free slope calculator. Enter two points to find the slope, the angle of inclination, the y-intercept and the distance between them, with the line equation.',
      faq: [
        { question: 'How do you calculate the slope between two points?', answer: 'Divide the change in y by the change in x: m = (y₂ − y₁) ÷ (x₂ − x₁). For (1, 2) and (4, 8), m = (8 − 2) ÷ (4 − 1) = 6 ÷ 3 = 2.' },
        { question: 'What does a slope of 0 mean?', answer: 'The line is perfectly horizontal — y does not change as x changes. The line through (1, 5) and (4, 5) has slope (5 − 5) ÷ (4 − 1) = 0.' },
        { question: 'Why is the slope of a vertical line undefined?', answer: 'A vertical line has the same x-coordinate at every point, so x₂ − x₁ = 0 and the slope formula divides by zero — mathematically undefined, not infinite. The line still has a well-defined 90° angle, just no slope.' },
        { question: 'How do I find the equation of a line from two points?', answer: 'Find the slope m, then find b by plugging either point into y = mx + b and solving for b. For (1, 2) and (4, 8): m = 2, and b = 2 − 2(1) = 0, giving y = 2x.' },
        { question: 'How do I find the angle of a line from its slope?', answer: 'Take the arctangent of the slope: θ = arctan(m). A slope of 1 gives a 45° angle; a slope of 2 gives about 63.43°. This calculator finds the angle directly from the two points, so it still works even when the slope itself is undefined — a vertical line reads 90°.' },
        { question: 'Does it matter which point I enter first?', answer: 'No. Swapping Point A and Point B reverses the sign of both the rise and the run, which cancels out in the slope and leaves the angle and distance unchanged.' },
        { question: 'How is slope related to the distance between two points?', answer: 'They come from the same two numbers, Δx and Δy, used differently: slope is their ratio (Δy ÷ Δx), while distance is √(Δx² + Δy²) — literally the Pythagorean theorem, with Δx and Δy as the two legs.' },
        { question: 'What is a negative slope?', answer: 'A line that falls from left to right. The line through (0, 10) and (5, 0) has slope (0 − 10) ÷ (5 − 0) = −2 — it drops 2 units for every 1 unit it moves right.' }
      ]
    },
    compute(values) {
      const { x1, y1, x2, y2 } = values;
      const dx = x2 - x1;
      const dy = y2 - y1;
      if (dx === 0 && dy === 0) return { slope: NaN, angle: NaN, yIntercept: NaN, distance: 0 };
      const slope = dx === 0 ? NaN : dy / dx;
      const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const angle = ((rawAngle % 180) + 180) % 180; // angle of inclination, direction-independent, in [0, 180)
      const yIntercept = dx === 0 ? NaN : y1 - slope * x1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return { slope, angle, yIntercept, distance };
    }
  },
  {
    id: 'distance-calculator',
    category: 'math',
    glyph: 'd',
    updatedAt: '2026-10-22',
    aliases: ['distance between two points calculator', 'coordinate distance calculator', 'distance formula calculator', '2 point distance calculator', 'euclidean distance calculator'],
    related: ['midpoint-calculator', 'slope-calculator', 'pythagorean-theorem-calculator', 'square-root-calculator'],
    title: 'Distance Calculator',
    description: 'Find the straight-line distance between two (x, y) points on a coordinate plane, using the distance formula — the Pythagorean theorem applied to the two coordinate differences.',
    example: 'The distance between (1, 2) and (4, 6) is √(3² + 4²) = √25 = 5.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is the distance formula?',
        paragraphs: [
          'The distance between two points (x₁, y₁) and (x₂, y₂) on a flat coordinate plane is d = √((x₂ − x₁)² + (y₂ − y₁)²). It is not a separate rule to memorize so much as the Pythagorean theorem in disguise: the horizontal gap (Δx) and the vertical gap (Δy) between the two points form the two legs of a right triangle, and the straight-line distance between the points is that triangle’s hypotenuse.',
          'That connection is why the defaults on this page, a 3-4-5 triangle’s worth of coordinates, come out to a distance of exactly 5 — the same 3-4-5 right triangle that shows up throughout basic geometry. Any two points whose coordinate differences happen to match a Pythagorean triple (3-4-5, 5-12-13, 8-6-10, and so on) will do the same.',
          'This is a straight-line ("as the crow flies") distance only. It assumes both coordinates are measured on the same flat scale — it has nothing to say about a path that has to follow roads, stairs, or any other route that is not a straight segment between the two points.'
        ]
      },
      howTo: {
        intro: 'Enter the two points; the distance between them is calculated as you type.',
        steps: [
          { name: 'Enter Point A', text: 'Type the x- and y-coordinates of the first point.' },
          { name: 'Enter Point B', text: 'Type the x- and y-coordinates of the second point.' },
          { name: 'Read the distance', text: 'The straight-line distance between the two points appears immediately, along with the horizontal and vertical gaps it was built from.' },
          { name: 'Check the right triangle', text: 'The chart shows |Δx| and |Δy| side by side — the two legs of the right triangle whose hypotenuse is the distance you just found.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The Pythagorean theorem, applied to two coordinate points instead of a drawn triangle.',
        expression: 'Δx = x₂ − x₁\nΔy = y₂ − y₁\nd = √(Δx² + Δy²)',
        terms: [
          { symbol: 'Δx, Δy', meaning: 'The horizontal and vertical gaps between the two points — the two legs of the right triangle formed by the points and the grid lines through them.' },
          { symbol: 'd', meaning: 'The distance between the points — the hypotenuse of that same right triangle.' }
        ],
        note: 'Squaring both differences removes their sign, so it never matters which point is "first" — the distance comes out identical either way.'
      },
      workedExample: {
        intro: 'Two delivery stops sit on a city grid (measured in blocks): one at (2, 3), the other at (10, 9). How far apart are they, as a straight line?',
        rows: [
          { label: 'Δx', value: '10 − 2 = 8 blocks' },
          { label: 'Δy', value: '9 − 3 = 6 blocks' },
          { label: 'Square and add', value: '8² + 6² = 64 + 36 = 100' },
          { label: 'Square root', value: '√100 = 10' }
        ],
        result: 'Distance = 10 blocks',
        explanation: 'This is a 6-8-10 right triangle — the 3-4-5 triangle scaled up by a factor of 2. The straight-line distance (10 blocks) is shorter than the 8 + 6 = 14 blocks a delivery driver would actually travel along the grid, since real streets can’t cut across the diagonal.'
      },
      watchOut: [
        { title: 'This is a straight line, not a travel distance', body: 'The distance formula answers "how far apart are these two points," not "how far do I have to drive or walk." A route along streets, stairs, or any path that is not a straight segment will be longer.' },
        { title: 'Order of the two points does not matter', body: 'Squaring Δx and Δy removes their sign, so swapping Point A and Point B gives the exact same distance.' },
        { title: 'Both coordinates need to be on the same scale', body: 'The formula has no idea what your x and y actually mean. Mixing units within one axis (feet for one point, meters for the other) or using two axes with different scales produces a number that looks fine but means nothing physically.' },
        { title: 'Zero distance is a legitimate answer', body: 'If both points are identical, the distance is exactly 0 — a correct result, not an error, the same way a triangle with a 0-length side would be treated as a genuine degenerate case elsewhere on this site.' }
      ],
      references: [
        { label: 'OpenStax, Algebra and Trigonometry 2e, §2.1 The Rectangular Coordinate Systems and Graphs', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-1-the-rectangular-coordinate-systems-and-graphs' },
        { label: 'Wolfram MathWorld, Distance', url: 'https://mathworld.wolfram.com/Distance.html' }
      ]
    },
    inputs: [
      { id: 'x1', label: 'x₁ (Point A)', type: 'number', placeholder: '1', defaultValue: 1, step: 1 },
      { id: 'y1', label: 'y₁ (Point A)', type: 'number', placeholder: '2', defaultValue: 2, step: 1 },
      { id: 'x2', label: 'x₂ (Point B)', type: 'number', placeholder: '4', defaultValue: 4, step: 1 },
      { id: 'y2', label: 'y₂ (Point B)', type: 'number', placeholder: '6', defaultValue: 6, step: 1 }
    ],
    breakdown: {
      headline: 'distance',
      headlineLabel: 'Distance',
      outputs: [
        { id: 'distance', label: 'Distance', format: 'significant' },
        { id: 'deltaX', label: '|Δx| (horizontal gap)', format: 'number' },
        { id: 'deltaY', label: '|Δy| (vertical gap)', format: 'number' }
      ],
      groups: [
        { title: 'Point A', inputs: ['x1', 'y1'] },
        { title: 'Point B', inputs: ['x2', 'y2'] }
      ],
      visual: { type: 'compareBars', bars: [{ from: 'deltaX', label: '|Δx|' }, { from: 'deltaY', label: '|Δy|' }, { from: 'distance', label: 'Distance' }], title: 'The right triangle behind the distance formula' }
    },
    seo: {
      title: 'Distance Calculator – Distance Between Two Points',
      description: 'Free distance calculator. Find the straight-line distance between two (x, y) coordinates using the distance formula, with the Pythagorean steps shown.',
      faq: [
        { question: 'What is the distance formula?', answer: 'd = √((x₂ − x₁)² + (y₂ − y₁)²), the straight-line distance between two points (x₁, y₁) and (x₂, y₂) on a flat plane.' },
        { question: 'Is the distance formula the same as the Pythagorean theorem?', answer: 'Yes — it is the Pythagorean theorem applied to coordinates. Δx and Δy are the two legs of a right triangle, and the distance is its hypotenuse: d = √(Δx² + Δy²) is the same shape as c = √(a² + b²).' },
        { question: 'How do I find the distance between (1, 2) and (4, 6)?', answer: 'Δx = 4 − 1 = 3, Δy = 6 − 2 = 4, so d = √(3² + 4²) = √25 = 5.' },
        { question: 'Can the distance be a decimal?', answer: 'Yes, almost always. The distance is only a whole number when Δx and Δy happen to form a Pythagorean triple (like 3-4-5); otherwise it is an irrational decimal, such as the distance between (0, 0) and (1, 1), which is √2 ≈ 1.41.' },
        { question: 'Does the order of the two points matter?', answer: 'No. Squaring Δx and Δy removes their sign, so the distance from A to B is identical to the distance from B to A.' },
        { question: 'Is this the same as the distance I would actually travel?', answer: 'No — this is the straight-line ("as the crow flies") distance. Travel along roads, paths or stairs is almost always longer, since those routes can’t cut across the diagonal the way a straight line does.' },
        { question: 'What if the two points are the same?', answer: 'The distance is 0. That is a correct, legitimate result, not an error — two identical points are zero distance apart by definition.' },
        { question: 'Does this work in 3D, with a z-coordinate?', answer: 'The same idea extends to three dimensions by adding a third squared difference, d = √(Δx² + Δy² + Δz²), but this calculator covers the two-dimensional (x, y) case.' }
      ]
    },
    compute(values) {
      const { x1, y1, x2, y2 } = values;
      const dx = x2 - x1;
      const dy = y2 - y1;
      return { distance: Math.sqrt(dx * dx + dy * dy), deltaX: Math.abs(dx), deltaY: Math.abs(dy) };
    }
  },
  {
    id: 'midpoint-calculator',
    category: 'math',
    glyph: 'M',
    updatedAt: '2026-10-22',
    aliases: ['midpoint formula calculator', 'midpoint of two points calculator', 'find the midpoint calculator', 'center point calculator', 'line segment midpoint calculator'],
    related: ['distance-calculator', 'slope-calculator', 'average-calculator', 'pythagorean-theorem-calculator'],
    title: 'Midpoint Calculator',
    description: 'Find the exact midpoint between two (x, y) coordinates — the point that splits the segment between them into two equal halves.',
    example: 'The midpoint between (2, 3) and (8, 11) is (5, 7), exactly halfway along the 10-unit segment that connects them.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is the midpoint formula?',
        paragraphs: [
          'The midpoint of two points (x₁, y₁) and (x₂, y₂) is simply the average of their x-coordinates and the average of their y-coordinates: M = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2). Each axis is handled completely independently — the midpoint’s x-coordinate only depends on x₁ and x₂, never on either y-value, and vice versa.',
          'That makes the midpoint formula, underneath, just the two-number average from the average calculator, applied twice: once to the two x-coordinates and once to the two y-coordinates. There is nothing geometric about the averaging step itself — it is the same arithmetic as averaging any other pair of numbers.',
          'A useful property worth checking by eye: the midpoint always sits exactly halfway along the straight segment between the two points, so its distance to each endpoint is identical. This calculator shows that distance split both ways, which is a quick way to confirm a midpoint calculation is right.'
        ]
      },
      howTo: {
        intro: 'Enter the two endpoints; the midpoint and the distances to it follow automatically.',
        steps: [
          { name: 'Enter Point A', text: 'Type the x- and y-coordinates of the first endpoint.' },
          { name: 'Enter Point B', text: 'Type the x- and y-coordinates of the second endpoint.' },
          { name: 'Read the midpoint', text: 'The midpoint’s x- and y-coordinates are each the average of the two endpoints’ matching coordinate.' },
          { name: 'Check the two halves', text: 'The distance from Point A to the midpoint and from the midpoint to Point B are shown side by side — they are always exactly equal.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Average the x-coordinates, average the y-coordinates — that is the whole formula.',
        expression: 'Mx = (x₁ + x₂) ÷ 2\nMy = (y₁ + y₂) ÷ 2\nM = (Mx, My)',
        terms: [
          { symbol: 'Mx, My', meaning: 'The midpoint’s x- and y-coordinates, each the plain average of the two endpoints’ matching coordinate.' }
        ],
        note: 'Because each axis is averaged independently, the midpoint of a vertical or horizontal segment needs no special case — the formula already handles it.'
      },
      workedExample: {
        intro: 'Two hikers start a shared trail at (0, 0) and plan to meet partway, at the point exactly halfway to their friend’s cabin at (6, 8) miles. Where do they meet, and how far does each of them walk?',
        rows: [
          { label: 'Midpoint x (Mx)', value: '(0 + 6) ÷ 2 = 3' },
          { label: 'Midpoint y (My)', value: '(0 + 8) ÷ 2 = 4' },
          { label: 'Total distance, (0,0) to (6,8)', value: '√(6² + 8²) = √100 = 10 miles' },
          { label: 'Each hiker’s distance to the midpoint', value: '10 ÷ 2 = 5 miles' }
        ],
        result: 'Midpoint = (3, 4) · each hiker walks 5 miles',
        explanation: 'The 6-8-10 right triangle (a scaled-up 3-4-5) makes the total distance a clean 10 miles, so each half is exactly 5 — a quick way to confirm (3, 4) really is the midpoint and not just an approximate halfway point.'
      },
      watchOut: [
        { title: 'The midpoint only works along the straight segment', body: 'M is the halfway point of the straight line connecting the two coordinates — it says nothing about the midpoint of a curved or road-based route between them.' },
        { title: 'Order of the two points does not matter', body: 'Addition is commutative, so swapping Point A and Point B gives the exact same midpoint.' },
        { title: 'The two axes never interact', body: 'The midpoint’s x-coordinate comes only from the two x-values; its y-coordinate comes only from the two y-values. A common mistake is accidentally averaging an x with a y.' },
        { title: 'The midpoint is usually not a whole number', body: 'Unless x₁ + x₂ and y₁ + y₂ both happen to be even, the midpoint will have a .5 in it — that is a completely normal, exact answer, not a rounding issue.' }
      ],
      references: [
        { label: 'OpenStax, Algebra and Trigonometry 2e, §2.1 The Rectangular Coordinate Systems and Graphs', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-1-the-rectangular-coordinate-systems-and-graphs' },
        { label: 'Wolfram MathWorld, Midpoint', url: 'https://mathworld.wolfram.com/Midpoint.html' }
      ]
    },
    inputs: [
      { id: 'x1', label: 'x₁ (Point A)', type: 'number', placeholder: '2', defaultValue: 2, step: 1 },
      { id: 'y1', label: 'y₁ (Point A)', type: 'number', placeholder: '3', defaultValue: 3, step: 1 },
      { id: 'x2', label: 'x₂ (Point B)', type: 'number', placeholder: '8', defaultValue: 8, step: 1 },
      { id: 'y2', label: 'y₂ (Point B)', type: 'number', placeholder: '11', defaultValue: 11, step: 1 }
    ],
    breakdown: {
      headline: 'midX',
      headlineLabel: 'Midpoint x-coordinate (Mx)',
      outputs: [
        { id: 'midY', label: 'Midpoint y-coordinate (My)', format: 'number' },
        { id: 'distanceAToMid', label: 'Point A to midpoint', format: 'significant' },
        { id: 'distanceMidToB', label: 'Midpoint to Point B', format: 'significant' },
        { id: 'distanceAB', label: 'Total distance, A to B', format: 'significant' }
      ],
      groups: [
        { title: 'Point A', inputs: ['x1', 'y1'] },
        { title: 'Point B', inputs: ['x2', 'y2'] }
      ],
      visual: { type: 'compareBars', bars: [{ from: 'distanceAToMid', label: 'Point A to midpoint' }, { from: 'distanceMidToB', label: 'Midpoint to Point B' }], title: 'Equal distance to the midpoint from each point' }
    },
    seo: {
      title: 'Midpoint Calculator – Find the Midpoint of Two Points',
      description: 'Free midpoint calculator. Find the exact midpoint between two (x, y) coordinates, plus the equal distance from each point to it.',
      faq: [
        { question: 'What is the midpoint formula?', answer: 'M = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2) — average the two x-coordinates for the midpoint’s x, and average the two y-coordinates for its y.' },
        { question: 'How do I find the midpoint of (2, 3) and (8, 11)?', answer: 'Mx = (2 + 8) ÷ 2 = 5, My = (3 + 11) ÷ 2 = 7, so the midpoint is (5, 7).' },
        { question: 'Is the midpoint always a whole number?', answer: 'No. It is only a whole number when both coordinate sums (x₁ + x₂ and y₁ + y₂) are even. The midpoint of (1, 1) and (2, 2), for example, is (1.5, 1.5).' },
        { question: 'Does the order of the two points matter?', answer: 'No. Addition is commutative, so swapping Point A and Point B gives the exact same midpoint.' },
        { question: 'How far is the midpoint from each original point?', answer: 'Always exactly half the total distance between the two points, since the midpoint sits precisely in the middle of the straight segment connecting them.' },
        { question: 'How is the midpoint formula related to averages?', answer: 'It is two ordinary two-number averages applied at once — one for the x-coordinates, one for the y-coordinates — with no other geometry involved.' },
        { question: 'Can the midpoint formula be used for more than two points?', answer: 'Not directly. The midpoint formula is specific to two points; the "center" of three or more points is a different calculation (a centroid), found by averaging all of their x-coordinates and all of their y-coordinates together.' },
        { question: 'What is the midpoint used for?', answer: 'Common uses include finding the center of a line segment or shape, locating a point exactly between two landmarks, and geometry proofs about bisected segments.' }
      ]
    },
    compute(values) {
      const { x1, y1, x2, y2 } = values;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const distanceAB = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      return { midX, midY, distanceAB, distanceAToMid: distanceAB / 2, distanceMidToB: distanceAB / 2 };
    }
  },
  // Custom-component stub: rendered by a special component in page.tsx (ScientificCalculator), the
  // same pattern as pomodoro-timer and timezone-meeting-planner. See mdFiles/steps/40-wave-1-math.md,
  // run 6, for why: the "solve for any field" and type-B breakdown models both assume a fixed set of
  // numeric fields, which doesn't fit a free-form expression calculator.
  {
    id: 'scientific-calculator',
    category: 'math',
    glyph: 'fx',
    updatedAt: '2026-10-22',
    aliases: ['online scientific calculator', 'trig calculator', 'sin cos tan calculator', 'scientific calculator online', 'advanced calculator'],
    related: ['exponent-calculator', 'logarithm-calculator', 'square-root-calculator', 'factorial-calculator'],
    title: 'Scientific Calculator',
    description: 'A browser-based scientific calculator: standard arithmetic plus trigonometric, logarithmic, power, root and factorial functions, with a degrees/radians toggle for angles.',
    example: 'sin(30°) + log(100) × 5! = 0.5 + 2 × 120 = 240.5, evaluated in one expression following the standard order of operations.',
    inputs: [],
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What does a scientific calculator add over a basic one?',
        paragraphs: [
          'A basic four-function calculator only adds, subtracts, multiplies and divides, one operation at a time. A scientific calculator additionally understands trigonometric functions (sine, cosine, tangent and their inverses), logarithms, powers, roots and factorials, and — critically — a full expression typed at once, evaluated with the standard order of operations: parentheses and functions first, then exponents, then multiplication and division, then addition and subtraction.',
          'Angles are the one place a scientific calculator needs an explicit choice: degrees (a full circle is 360°) or radians (a full circle is 2π). The same number typed into sin() means something completely different depending on which mode is active, so this calculator keeps the current mode visible at all times and recomputes the display the instant it is switched.',
          'This page evaluates a whole typed expression rather than focusing on any single operation. For a deep dive into one specific calculation — the mechanics of a logarithm, a factorial, an exponent or a square root, with a worked example and a formula explained step by step — the dedicated calculators linked below cover each of those individually.'
        ]
      },
      howTo: {
        intro: 'Build an expression with the buttons (or type it directly), then read the live result.',
        steps: [
          { name: 'Enter numbers and operators', text: 'Use the digit pad and +, −, ×, ÷ as on any calculator. The result below the display updates as you type.' },
          { name: 'Use a function', text: 'Tapping sin, cos, ln, √ and the others inserts the function name with an opening parenthesis, so you can type the value and close it yourself.' },
          { name: 'Set the angle unit', text: 'Switch between Deg and Rad before using any trig function — it changes both how an angle you type in is interpreted and how an inverse-trig result is reported.' },
          { name: 'Use parentheses to control order', text: 'Parentheses always resolve first, exactly as in written math — (2+3)×4 is 20, while 2+3×4 is 14.' },
          { name: 'Press = or Enter', text: 'Finalizes the current expression, replacing the display with the result so you can keep building on it.' },
          { name: 'Clear or correct', text: 'AC clears everything; the backspace key (⌫) removes one character at a time.' }
        ],
        outro: 'Everything is evaluated in your browser by a small expression parser written for this page — never by running the typed text as code.'
      },
      formula: {
        intro: 'There is no single equation here — instead, a fixed order of operations decides how any typed expression is read.',
        expression: 'Parentheses and functions (sin, log, √, ...) → Factorials (!) → Exponents (^, right to left) → Unary minus/plus → Multiplication and division (left to right, including implied multiplication like 2π) → Addition and subtraction (left to right)',
        terms: [
          { symbol: 'sin, cos, tan', meaning: 'The three basic trigonometric functions, interpreted in whichever angle unit (degrees or radians) is currently selected.' },
          { symbol: 'sin⁻¹, cos⁻¹, tan⁻¹', meaning: 'The inverse trig functions (arcsine, arccosine, arctangent); their results are reported in the same angle unit.' },
          { symbol: 'ln, log', meaning: 'Natural logarithm (base e) and common logarithm (base 10).' },
          { symbol: '√, π, e', meaning: 'Square root; the circle constant π ≈ 3.14159; Euler’s number e ≈ 2.71828.' },
          { symbol: 'n!', meaning: 'Factorial: the product of every whole number from 1 to n, defined only for a nonnegative integer n.' }
        ],
        note: 'Because unary minus has looser precedence than exponentiation, −2^2 evaluates to −4 (the negative of 2²), the same convention taught in algebra classes — not (−2)² = 4. The parser is a small hand-written recursive-descent evaluator limited to the operations above; it never executes the typed text as JavaScript. sin, cos and tan return exact values (0, 1 or −1) at every multiple of 90° in Degree mode, and treat a radian-mode result closer than 10⁻¹⁵ to zero as exactly zero, rather than showing a stray floating-point remainder like 0.0000000000000001.'
      },
      workedExample: {
        intro: 'Evaluate sin(30°) + log(100) × 5! in one expression, in Degree mode.',
        rows: [
          { label: 'sin(30°)', value: '0.5' },
          { label: 'log(100) (base 10)', value: '2' },
          { label: '5!', value: '5 × 4 × 3 × 2 × 1 = 120' },
          { label: 'Multiply (order of operations: × before +)', value: '2 × 120 = 240' },
          { label: 'Add', value: '0.5 + 240 = 240.5' }
        ],
        result: '240.5',
        explanation: 'Even though it is typed left to right, × 5! is evaluated before the addition, following the standard order of operations — the same way 2+3×4 means 2+12, not 5×4.'
      },
      watchOut: [
        { title: 'tan() has no answer exactly at 90°, 270° and their equivalents', body: 'The true tangent of 90° is undefined — cosine is exactly 0 there, so the ratio sine ÷ cosine has no value. This calculator shows no result for exactly 90°, 270°, 450° and so on, rather than the huge-but-finite number naive floating-point math would otherwise produce. A value merely close to 90°, like 89.9999°, is not undefined — it has a real (very large) tangent, and still shows one.' },
        { title: '−2^2 is −4, not 4', body: 'Exponentiation is applied before the leading minus sign, so −2^2 means −(2²) = −4. To square −2 itself, use parentheses: (−2)^2 = 4.' },
        { title: 'ln, log and √ refuse an out-of-domain input', body: 'The logarithm of a non-positive number and the square root of a negative number have no real answer. This calculator shows no result for them rather than inventing one.' },
        { title: 'Factorial only accepts a nonnegative whole number', body: '2.5! and (−3)! have no result here. Values above 170! are reported as too large to represent exactly (the point where a standard double-precision number overflows), not shown as a rounded, falsely precise digit string.' },
        { title: 'The angle unit applies to every trig function at once', body: 'Switching between Deg and Rad re-reads the whole expression immediately — there is no way to mix degrees and radians within one calculation.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §2.1 Use the Language of Algebra (order of operations)', url: 'https://openstax.org/books/prealgebra-2e/pages/2-1-use-the-language-of-algebra' },
        { label: 'NIST Digital Library of Mathematical Functions, §4.2 Logarithm, Exponential, Powers: Definitions', url: 'https://dlmf.nist.gov/4.2' },
        { label: 'NIST Digital Library of Mathematical Functions, §4.14 Trigonometric Functions: Definitions and Periodicity', url: 'https://dlmf.nist.gov/4.14' },
        { label: 'NIST Digital Library of Mathematical Functions, §4.23 Inverse Trigonometric Functions', url: 'https://dlmf.nist.gov/4.23' }
      ]
    },
    seo: {
      title: 'Scientific Calculator – Trig, Log, Powers & Factorials',
      description: 'Free online scientific calculator. Evaluate expressions with sin/cos/tan, inverse trig, ln/log, powers, roots and factorials, with a degrees/radians toggle.',
      faq: [
        { question: 'What functions does this scientific calculator support?', answer: 'Addition, subtraction, multiplication, division, parentheses, powers (^), square roots (√), sin/cos/tan and their inverses (sin⁻¹/cos⁻¹/tan⁻¹), natural and common logarithms (ln, log), the constants π and e, and factorials (!).' },
        { question: 'How do I switch between degrees and radians?', answer: 'Use the Deg/Rad toggle above the display. It changes how every trig function reads its input and reports its output, and re-evaluates the current expression immediately.' },
        { question: 'Does it follow the standard order of operations?', answer: 'Yes — parentheses and functions first, then exponents, then multiplication and division left to right, then addition and subtraction left to right, the same convention taught in algebra (sometimes called PEMDAS).' },
        { question: 'Why does −2^2 give −4 and not 4?', answer: 'Exponentiation happens before the unary minus is applied, so −2^2 means −(2²) = −4. If you want (−2)² = 4, type the parentheses explicitly.' },
        { question: 'What happens with the square root or logarithm of a negative number?', answer: 'There is no result: the square root of a negative number and the logarithm of a non-positive number have no real-number answer, so this calculator shows nothing rather than a wrong number.' },
        { question: 'Can I use parentheses and nested functions?', answer: 'Yes, including nesting, like sin(log(100)×30), and implied multiplication, like 2π or 3(4+5), which are both read as if a × were typed between them.' },
        { question: 'Does this calculator use eval() or run my input as code?', answer: 'No. Every expression is read by a small parser written specifically for the four operations, powers, roots, trig, logs and factorial listed above — it never executes the typed text as JavaScript or any other programming language.' },
        { question: 'What happens when I calculate tan(90)?', answer: 'There is no result. Tangent is undefined at 90°, 270° and every equivalent angle, since cosine is exactly 0 there — this calculator reports no answer for those exact angles rather than a distorted, extremely large number. An angle merely close to 90°, such as 89.9999°, is not undefined and still returns its real (very large) tangent.' }
      ]
    },
    compute() {
      return {};
    }
  }

];
