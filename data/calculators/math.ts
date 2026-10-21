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
];
