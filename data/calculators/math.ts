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
    updatedAt: '2026-10-21',
    aliases: ['mean calculator', 'average of numbers calculator', 'sum and average calculator', 'arithmetic mean calculator', 'average of 4 numbers calculator'],
    related: ['weighted-average-calculator', 'gpa-calculator', 'percentage-calculator', 'percent-change-calculator'],
    title: 'Average Calculator',
    description: 'Find the arithmetic mean, sum, count, minimum and maximum of up to 8 numbers — enter 4 and add up to 4 more.',
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
        intro: 'Enter your numbers in the value fields. Leave any unused optional field at 0 and it is left out of the calculation entirely.',
        steps: [
          { name: 'Enter your main numbers', text: 'Type up to 4 numbers into the first group. These always count toward the average, even if one of them happens to be 0.' },
          { name: 'Add more if you have them', text: 'Open "Add up to 4 more numbers" for up to 4 additional values. Leave any of these at 0 to skip it — a genuine 0 among your extra numbers needs a nonzero placeholder like 0.0001 instead.' },
          { name: 'Read the average', text: 'The headline is the arithmetic mean: the sum of every number you entered, divided by how many of them there are.' },
          { name: 'Check the sum, count, min and max', text: 'The breakdown below the average shows the total, how many numbers were counted, and the smallest and largest values in your list.' },
          { name: 'See the range at a glance', text: 'The chart plots your lowest value, your average, and your highest value side by side.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The arithmetic mean is the sum of a list divided by how many numbers are in it.',
        expression: 'Average = (x₁ + x₂ + ... + xₙ) ÷ n',
        terms: [
          { symbol: 'x₁, x₂, ..., xₙ', meaning: 'Each number in the list.' },
          { symbol: 'n', meaning: 'The count of numbers in the list — how many of them there are.' }
        ],
        note: 'The 4 optional fields left at their default of 0 are not counted toward n; the first 4 fields always are, even when one of them is 0.'
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
        { title: 'An unused optional slot must be exactly 0', body: 'This calculator treats a 0 in one of the 4 optional fields as "not entered." If you genuinely have a 0 as one of your extra numbers, enter a tiny nonzero placeholder (such as 0.0001) instead so it is not dropped from the count.' },
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
      { id: 'value1', label: 'Number 1', type: 'number', placeholder: '85', defaultValue: 85, step: 1 },
      { id: 'value2', label: 'Number 2', type: 'number', placeholder: '90', defaultValue: 90, step: 1 },
      { id: 'value3', label: 'Number 3', type: 'number', placeholder: '78', defaultValue: 78, step: 1 },
      { id: 'value4', label: 'Number 4', type: 'number', placeholder: '92', defaultValue: 92, step: 1 },
      { id: 'value5', label: 'Number 5 (0 = unused)', type: 'number', placeholder: '0', defaultValue: 0, step: 1 },
      { id: 'value6', label: 'Number 6 (0 = unused)', type: 'number', placeholder: '0', defaultValue: 0, step: 1 },
      { id: 'value7', label: 'Number 7 (0 = unused)', type: 'number', placeholder: '0', defaultValue: 0, step: 1 },
      { id: 'value8', label: 'Number 8 (0 = unused)', type: 'number', placeholder: '0', defaultValue: 0, step: 1 }
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
      groups: [
        { title: 'Your numbers', inputs: ['value1', 'value2', 'value3', 'value4'] },
        { title: 'Add up to 4 more numbers', inputs: ['value5', 'value6', 'value7', 'value8'], optional: true }
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
      description: 'Free average calculator. Find the arithmetic mean, sum, count, minimum and maximum of up to 8 numbers.',
      faq: [
        { question: 'How do I calculate an average?', answer: 'Add up every number in the list, then divide by how many numbers there are. Four scores of 85, 90, 78 and 92 sum to 345, and 345 ÷ 4 = 86.25.' },
        { question: 'What is the difference between average and mean?', answer: 'In everyday use they are the same thing. "Mean" is the more precise statistical term for what people usually call the "average" — the sum divided by the count.' },
        { question: 'How many numbers can this calculator average?', answer: 'Up to 8: 4 always-counted fields plus 4 optional fields. Leave an optional field at 0 to exclude it from the average.' },
        { question: 'Can the average be higher than every number in the list?', answer: 'No, and it can never be lower than every number either — the average always falls between the smallest and largest values in the list (inclusive, if every value is identical).' },
        { question: 'What is the difference between average and weighted average?', answer: 'A plain average treats every number equally. A weighted average lets some numbers count more than others — see the weighted average calculator for that case, such as a final exam worth more than a quiz.' },
        { question: 'Why is my average not a "round" number?', answer: 'The average is only guaranteed to be a whole number when the sum happens to divide evenly by the count. 345 ÷ 4 = 86.25, which is exact but not a whole number.' },
        { question: 'Does one extreme value change the average a lot?', answer: 'Yes — the mean is sensitive to outliers. Averaging 10, 12, 11 and 400 gives 108.25, pulled far above three of the four numbers by the one large value.' },
        { question: 'What does this calculator show besides the average?', answer: 'The sum of all your numbers, how many were counted, and the lowest and highest values among them.' }
      ]
    },
    compute(values) {
      const slots = [values.value1, values.value2, values.value3, values.value4, values.value5, values.value6, values.value7, values.value8];
      const used = slots.filter((v, i) => i < 4 || v !== 0);
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
  }

];
