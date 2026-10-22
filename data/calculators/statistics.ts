import type { CalculatorConfig, CalculatorInput } from './types.ts';

// Shared "data list" input: a paste-a-list textarea (CalculatorInput.type: 'list'), parsed by
// lib/listParse.ts. Replaces the "How many numbers?" + numbered-slot stopgap statistics run 1
// shipped with — see mdFiles/steps/41-wave-1-statistics.md, "List input (between run 1 and run 2)",
// for why and the full design. Every list-based calculator in this category reuses this one helper.
function listInput(defaults: number[], min = 1): CalculatorInput {
  return {
    id: 'data',
    label: 'Your numbers',
    type: 'list',
    placeholder: 'Paste or type numbers, separated by commas, spaces or new lines',
    defaultValue: 0,
    listDefault: defaults,
    listMin: min
  };
}

// Population and sample variance of a list, shared by standard-deviation-calculator and
// variance-calculator so the two pages can never silently disagree on the underlying numbers.
function varianceOf(list: number[]) {
  const n = list.length;
  const mean = list.reduce((a, b) => a + b, 0) / n;
  const sumSq = list.reduce((a, b) => a + (b - mean) ** 2, 0);
  return { mean, sumSq, populationVariance: sumSq / n, sampleVariance: sumSq / (n - 1) };
}

// NIST/SEMATECH Engineering Statistics Handbook §7.2.6.2 "Percentiles": set p(N+1) = k + d (k an
// integer, 0 <= d < 1), then linearly interpolate between the k-th and (k+1)-th order statistics.
// This is Hyndman & Fan's "type 6" definition (NIST's own Dataplot software default) — a different,
// equally standard convention from Excel's PERCENTILE.INC ("type 7"), which can give a slightly
// different answer for the same data; see the watch-out item on percentile-calculator's page.
function percentileOf(sorted: number[], targetPercentile: number) {
  const n = sorted.length;
  const rank = (targetPercentile / 100) * (n + 1);
  const k = Math.floor(rank);
  const d = rank - k;
  if (k <= 0) return sorted[0];
  if (k >= n) return sorted[n - 1];
  return sorted[k - 1] + d * (sorted[k] - sorted[k - 1]);
}

export const statisticsCalculators: CalculatorConfig[] = [
  {
    id: 'mean-median-mode-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['mean median mode calculator', 'measures of central tendency calculator', 'median calculator', 'find the mode calculator', 'central tendency calculator'],
    related: ['average-calculator', 'standard-deviation-calculator', 'percentile-calculator', 'weighted-average-calculator'],
    title: 'Mean, Median & Mode Calculator',
    description: 'Find the mean, median and mode of a list of numbers — up to 1,000 of them — the three most common ways to summarize a data set with one typical value, and how they can disagree.',
    example: "Five kids at a party are 7, 9, 7, 10 and 8 years old. The mean is 8.2, the median is 8, and the mode is 7 (it's the only age that repeats).",
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What are mean, median and mode?',
        paragraphs: [
          'Mean, median and mode are the three most common "measures of central tendency" — three different ways of answering the same question, "what is a typical value in this data set?" They usually land close to each other, but not always, and the gap between them is often the most useful thing a data set can tell you.',
          'The mean is the arithmetic average: add every value and divide by how many there are (the same calculation this site\'s average calculator does). The median is the middle value once the list is sorted — half the data falls below it, half above. The mode is simply the value that shows up most often; a data set can have one mode, several (multimodal), or none at all if every value is different.',
          'They diverge most clearly on skewed data. Household income is the classic example: a handful of very high earners pull the mean upward, while the median — unaffected by how extreme the biggest values get, only by their rank — stays close to what a "typical" household actually earns. That is why income statistics are almost always reported as a median, not a mean.',
          'This calculator covers all three together. For a plain mean on its own, see the average calculator; for how spread out the data is around the mean, see the standard deviation and variance calculators.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box, separated by commas, spaces or new lines — a column copied straight out of a spreadsheet works as-is.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines. A genuine 0 among them counts normally; order does not matter, since the calculator sorts the list itself.' },
          { name: 'Check the count', text: 'The box shows a live count of how many numbers it understood. Anything that isn\'t a number is dropped and listed below the box, so a stray label or unit does not silently throw off your result.' },
          { name: 'Read the mean', text: 'The headline is the arithmetic mean: the sum of your numbers divided by how many there are.' },
          { name: 'Check the median and mode', text: 'The rows below show the median (the middle value once sorted) and the mode (the most frequent value), plus how many values are tied for that mode.' },
          { name: 'See the sum, min, max and range', text: 'The remaining rows give the total, the smallest and largest values, and the range between them.' },
          { name: 'Compare the three', text: 'The chart plots your lowest value, your mean and your highest value side by side, so you can see at a glance where the mean sits relative to the spread.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Three separate calculations on the same sorted list of numbers.',
        expression: 'Mean = (x₁ + x₂ + ... + xₙ) ÷ n\nMedian = the middle value when sorted (or the average of the two middle values if n is even)\nMode = the value(s) that occur most often',
        terms: [
          { symbol: 'x₁, x₂, ..., xₙ', meaning: 'Each number in the list.' },
          { symbol: 'n', meaning: 'How many numbers you entered (up to 1,000).' }
        ],
        note: 'If every value in a list of 2 or more is different, there is no mode by the usual definition — this calculator reports that honestly (as "—") rather than guessing. A single-number list is the one exception: its one value counts as its own mode.'
      },
      workedExample: {
        intro: 'Five kids at a birthday party, ages 7, 9, 7, 10 and 8.',
        rows: [
          { label: 'Sorted', value: '7, 7, 8, 9, 10' },
          { label: 'Sum (7 + 9 + 7 + 10 + 8)', value: '41' },
          { label: 'Mean (41 ÷ 5)', value: '8.2' },
          { label: 'Median (the middle of 5 sorted values)', value: '8' },
          { label: 'Mode (the only age that repeats)', value: '7 (appears twice)' }
        ],
        result: 'Mean 8.2, median 8, mode 7',
        explanation: 'All three sit close together here, which is typical of data with no extreme values. The mean (8.2) is not a whole number and does not have to be; the median (8) is always an actual value from the list, or exactly halfway between two of them.'
      },
      watchOut: [
        { title: 'The mean is sensitive to outliers; the median usually is not', body: 'Change the largest age in the example from 10 to 50 and the mean jumps to 16.2 — no longer a believable "typical" age — while the median stays at 8, since it only cares about rank, not magnitude.' },
        { title: 'No mode, or more than one, are both normal outcomes', body: 'If every value in a list of 2 or more numbers is different, this calculator reports no mode at all (shown as "—"), rather than picking one arbitrarily. If two or more values are tied for the most frequent, it reports all of them as tied (a multimodal data set) and names the smallest as the "primary" one shown on the chart.' },
        { title: 'The median formula depends on whether the count is odd or even', body: 'With an odd count, the median is the single middle value after sorting. With an even count, it is the average of the two middle values — which, unlike the mean of the whole list, can be a number that falls exactly between two data points.' },
        { title: 'This is not the same as a weighted average', body: 'Mean, median and mode all treat every number in the list equally. If some numbers should count more than others — like a final exam worth more than a quiz — use the weighted average calculator instead.' },
        { title: 'Non-numeric tokens are dropped, not averaged in as zero', body: 'Anything pasted into the box that is not a number — a stray label, a unit, a trailing comma — is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §2.5 Measures of the Center of the Data', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data' },
        { label: 'Wolfram MathWorld, Statistical Median', url: 'https://mathworld.wolfram.com/StatisticalMedian.html' },
        { label: 'Wolfram MathWorld, Mode', url: 'https://mathworld.wolfram.com/Mode.html' }
      ]
    },
    inputs: [listInput([7, 9, 7, 10, 8], 1)],
    breakdown: {
      headline: 'mean',
      headlineLabel: 'Mean (average)',
      outputs: [
        { id: 'mean', label: 'Mean (average)', format: 'significant' },
        { id: 'median', label: 'Median', format: 'significant' },
        { id: 'primaryMode', label: 'Mode', format: 'significant' },
        { id: 'modeCount', label: 'Values tied for the mode', format: 'integer' },
        { id: 'sum', label: 'Sum', format: 'significant' },
        { id: 'count', label: 'Count', format: 'integer' },
        { id: 'min', label: 'Lowest value', format: 'significant' },
        { id: 'max', label: 'Highest value', format: 'significant' },
        { id: 'range', label: 'Range', format: 'significant' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'min', label: 'Lowest value' }, { from: 'mean', label: 'Mean' }, { from: 'max', label: 'Highest value' }],
        title: 'Lowest, mean, highest',
        highlight: 1
      }
    },
    seo: {
      title: 'Mean, Median & Mode Calculator – Central Tendency',
      description: 'Free mean, median and mode calculator. Paste a list of up to 1,000 numbers to find all three measures of central tendency, with a worked example and clear mode rules.',
      faq: [
        { question: 'How do I find the mean, median and mode?', answer: 'The mean is the sum divided by the count. The median is the middle value once the list is sorted. The mode is the value that appears most often. For 7, 9, 7, 10, 8: mean 8.2, median 8, mode 7.' },
        { question: 'What is the difference between mean, median and mode?', answer: 'They are three different ways to describe a "typical" value. The mean uses every number\'s exact size; the median only uses rank (position once sorted); the mode only uses frequency (how often a value repeats).' },
        { question: 'Which measure should I use?', answer: 'The mean is standard for symmetric data with no extreme outliers. The median is more reliable for skewed data — incomes and home prices are almost always reported as a median. The mode is most useful for categorical or clustered data, like the most common shoe size sold.' },
        { question: 'What if there is no mode?', answer: 'If every value in a list of 2 or more numbers is different, there is no mode — this calculator shows "—" rather than guessing one. A list with only one number counts that number as its own mode.' },
        { question: 'Can a data set have more than one mode?', answer: 'Yes — if two or more values are tied for the highest frequency, the data set is multimodal. This calculator reports how many values are tied and shows the smallest of them as the "primary" one on the chart.' },
        { question: 'How is the median calculated for an even number of values?', answer: 'Average the two middle values after sorting. For 4 sorted values, that is the average of the 2nd and 3rd.' },
        { question: 'Why is my mean not one of the numbers I entered?', answer: 'The mean is a calculated balance point, not a value that has to already appear in the list — the same as the average calculator\'s result.' },
        { question: 'Is the mode the same as an outlier?', answer: 'No — they are opposites in a sense. The mode is the most common value; an outlier is an unusually rare, extreme value far from the rest of the data.' },
        { question: 'How many numbers can I enter?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines — a column copied from a spreadsheet pastes in as-is.' }
      ]
    },
    compute(values, lists) {
      const list = lists.data;
      const n = list.length;
      const sum = list.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const sorted = [...list].sort((a, b) => a - b);
      const median = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      const freq = new Map<number, number>();
      for (const value of list) freq.set(value, (freq.get(value) ?? 0) + 1);
      const maxFreq = Math.max(...freq.values());
      const modeExists = maxFreq > 1 || n === 1;
      const tiedModes = modeExists
        ? [...freq.entries()].filter(([, count]) => count === maxFreq).map(([value]) => value).sort((a, b) => a - b)
        : [];
      const min = sorted[0];
      const max = sorted[n - 1];
      return {
        mean,
        median,
        primaryMode: modeExists ? tiedModes[0] : NaN,
        modeCount: modeExists ? tiedModes.length : 0,
        sum,
        count: n,
        min,
        max,
        range: max - min
      };
    }
  },
  {
    id: 'standard-deviation-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['std dev calculator', 'standard deviation of a data set calculator', 'population standard deviation calculator', 'sample standard deviation calculator', 'sigma calculator'],
    related: ['variance-calculator', 'mean-median-mode-calculator', 'z-score-calculator', 'average-calculator'],
    title: 'Standard Deviation Calculator',
    description: 'Find the population and sample standard deviation of a list of numbers — up to 1,000 of them — shown side by side with every step of the calculation.',
    example: 'Five test scores of 72, 85, 90, 78 and 95 have a mean of 84, a population standard deviation of about 8.22, and a sample standard deviation of about 9.19.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is standard deviation?',
        paragraphs: [
          'Standard deviation measures how spread out a list of numbers is around its mean. A small standard deviation means most values sit close to the mean; a large one means the values are spread widely. It is the square root of variance (see the variance calculator), expressed in the same units as the original data, which is why standard deviation is usually the easier of the two figures to interpret directly.',
          'There are two versions of the formula, and the difference between them matters. The population standard deviation (symbol σ, "sigma") divides by n, the full count — use it when your list genuinely is the entire group you care about. The sample standard deviation (symbol s) divides by n − 1 instead, a correction (sometimes called Bessel\'s correction) that compensates for a sample tending to underestimate the true spread of the larger population it was drawn from. Most real-world data — a handful of test scores, a batch of measurements, a survey of some but not all customers — is a sample, which is why spreadsheet software (Excel\'s STDEV, Google Sheets\' STDEV) treats the sample version as the default.',
          'This calculator shows both, clearly labeled, rather than quietly picking one and hiding the other.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box, separated by commas, spaces or new lines — the calculation does not depend on the order they are in.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines, in any order — up to 1,000 of them.' },
          { name: 'Check the count', text: 'Anything that isn\'t a number is dropped and listed below the box, along with the live count of numbers it understood.' },
          { name: 'Read the sample standard deviation', text: 'The headline divides by n − 1, the common default for data that is a sample of a larger group.' },
          { name: 'Check the population standard deviation', text: 'The row below divides by n instead — use this one only if your numbers are the entire population, not a sample of it.' },
          { name: 'See both variances', text: 'The variance rows show each standard deviation\'s value before the square root — useful if you need variance directly for a further calculation.' },
          { name: 'Compare the two', text: 'The chart places the population and sample figures side by side; the sample value is always the larger of the two (division by a smaller number).' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Both versions start the same way: find the mean, subtract it from every value, square each difference, and add those squares up. They differ only in what they divide that total by.',
        expression: 'Population: σ = √(Σ(xᵢ − mean)² ÷ n)\nSample: s = √(Σ(xᵢ − mean)² ÷ (n − 1))',
        terms: [
          { symbol: 'xᵢ', meaning: 'Each number in the list.' },
          { symbol: 'mean', meaning: 'The arithmetic mean of the list.' },
          { symbol: 'n', meaning: 'How many numbers you entered (up to 1,000).' }
        ],
        note: 'This is an estimate of spread, not a prediction — a different sample from the same underlying population would give a slightly different number. Use the population version only when your list is genuinely the entire group of interest, not a sample drawn from something larger.'
      },
      workedExample: {
        intro: 'Five test scores: 72, 85, 90, 78 and 95.',
        rows: [
          { label: 'Mean (72 + 85 + 90 + 78 + 95) ÷ 5', value: '84' },
          { label: 'Squared differences from the mean', value: '144, 1, 36, 36, 121' },
          { label: 'Sum of squared differences', value: '338' },
          { label: 'Population variance (338 ÷ 5)', value: '67.6' },
          { label: 'Sample variance (338 ÷ 4)', value: '84.5' },
          { label: 'Population standard deviation (√67.6)', value: '≈ 8.22' },
          { label: 'Sample standard deviation (√84.5)', value: '≈ 9.19' }
        ],
        result: 'Population σ ≈ 8.22, sample s ≈ 9.19',
        explanation: 'The sample figure is always larger here because dividing by 4 (n − 1) instead of 5 (n) spreads the same total (338) over a smaller number, which is exactly the correction the n − 1 convention is designed to make.'
      },
      watchOut: [
        { title: 'Dividing by n or n − 1 is not a rounding choice — it changes which question you are answering', body: 'Population and sample standard deviation are two different, equally valid calculations, not two roundings of the same answer. Picking the wrong one for your situation gives a number that technically answers a different question than the one you meant to ask.' },
        { title: 'A single value has no sample standard deviation', body: 'With only one number, the sample formula divides by n − 1 = 0 — a genuine 0 ÷ 0, mathematically undefined. This calculator shows that honestly as "—" rather than guessing a value. The population standard deviation of a single value is still a legitimate 0 (one point has no spread).' },
        { title: 'Standard deviation is sensitive to outliers, like the mean it is built around', body: 'Because every deviation is squared before being averaged, one unusually far-off value can dominate the result far more than its single vote would suggest.' },
        { title: 'This is a point estimate, not the "true" spread', body: 'A different sample of the same size from the same underlying group would almost certainly produce a slightly different standard deviation. The n − 1 correction reduces the bias of that estimate; it does not eliminate the sampling variation itself.' },
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §2.7 Measures of the Spread of the Data', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data' },
        { label: 'Wolfram MathWorld, Standard Deviation', url: 'https://mathworld.wolfram.com/StandardDeviation.html' }
      ]
    },
    inputs: [listInput([72, 85, 90, 78, 95], 1)],
    breakdown: {
      headline: 'sampleStdDev',
      headlineLabel: 'Standard deviation (sample, s)',
      outputs: [
        { id: 'sampleStdDev', label: 'Standard deviation (sample, s)', format: 'significant' },
        { id: 'populationStdDev', label: 'Standard deviation (population, σ)', format: 'significant' },
        { id: 'sampleVariance', label: 'Variance (sample, s²)', format: 'significant' },
        { id: 'populationVariance', label: 'Variance (population, σ²)', format: 'significant' },
        { id: 'mean', label: 'Mean', format: 'significant' },
        { id: 'count', label: 'Count', format: 'integer' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'populationStdDev', label: 'Population (σ)' }, { from: 'sampleStdDev', label: 'Sample (s)' }],
        title: 'Population vs. sample standard deviation',
        highlight: 1
      }
    },
    seo: {
      title: 'Standard Deviation Calculator – Population & Sample',
      description: 'Free standard deviation calculator. Paste a list of up to 1,000 numbers to find both the population and sample standard deviation, with variance and a worked example.',
      faq: [
        { question: 'How do I calculate standard deviation?', answer: 'Find the mean, subtract it from each number and square the result, add those squares up, divide by n (population) or n − 1 (sample), then take the square root.' },
        { question: "What is the difference between population and sample standard deviation?", answer: 'Population standard deviation divides by n, the full count — use it only when your data is the entire group you care about. Sample standard deviation divides by n − 1, the common choice when your data is a sample of a larger group.' },
        { question: 'Why divide by n − 1 for a sample?', answer: "Dividing by a smaller number makes the result a bit larger, which corrects for the tendency of a sample to underestimate the true spread of the population it came from — a correction often called Bessel's correction." },
        { question: 'What does a standard deviation of 0 mean?', answer: 'Every value in the list is identical — there is no spread at all.' },
        { question: 'Can I find standard deviation with only one number?', answer: 'The population standard deviation of a single value is 0 (no spread). The sample standard deviation is undefined — it needs at least two values, since its formula divides by n − 1.' },
        { question: 'How is standard deviation related to variance?', answer: 'Standard deviation is the square root of variance. Variance is in squared units (useful for further statistics); standard deviation is in the original units, which is usually easier to interpret.' },
        { question: 'Which spreadsheet function matches this calculator?', answer: "Excel and Google Sheets' STDEV (and STDEV.S) match this calculator's sample standard deviation; STDEVP (or STDEV.P) matches the population figure." },
        { question: 'Does the order I enter numbers in matter?', answer: 'No — standard deviation only depends on which values are in the list, not the order they were typed in.' },
        { question: 'How many numbers can I enter?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines.' }
      ]
    },
    compute(values, lists) {
      const list = lists.data;
      const { mean, populationVariance, sampleVariance } = varianceOf(list);
      return {
        mean,
        count: list.length,
        populationVariance,
        sampleVariance,
        populationStdDev: Math.sqrt(populationVariance),
        sampleStdDev: Math.sqrt(sampleVariance)
      };
    }
  },
  {
    id: 'variance-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['variance of a data set calculator', 'population variance calculator', 'sample variance calculator', 'find the variance calculator'],
    related: ['standard-deviation-calculator', 'mean-median-mode-calculator', 'z-score-calculator', 'average-calculator'],
    title: 'Variance Calculator',
    description: 'Find the population and sample variance of a list of up to 1,000 numbers, shown side by side — the squared-units measure of spread behind standard deviation.',
    example: 'The same five test scores as the standard deviation calculator — 72, 85, 90, 78 and 95 — have a population variance of 67.6 and a sample variance of 84.5.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is variance?',
        paragraphs: [
          'Variance measures how spread out a list of numbers is around its mean, in squared units. It is the same underlying calculation as standard deviation — in fact, variance is exactly standard deviation squared — but without the final square root step.',
          'Because it is in squared units (a variance of test scores is in "points squared," which has no real-world meaning on its own), variance is rarely the number reported directly to a general audience; standard deviation, in the original units, is usually easier to interpret. Variance matters anyway because it is the figure several further statistical formulas are built on directly — including, further down this site\'s statistics category, z-scores and confidence intervals — so it is worth being able to find on its own, not just as a stepping stone inside the standard deviation calculator.',
          'Like standard deviation, variance comes in a population version (dividing by n) and a sample version (dividing by n − 1) — see that calculator\'s concept section for the full reasoning behind the distinction, which applies here identically.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box, separated by commas, spaces or new lines, in any order.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines — up to 1,000 of them.' },
          { name: 'Check the count', text: 'Anything that isn\'t a number is dropped and listed below the box, along with the live count of numbers it understood.' },
          { name: 'Read the sample variance', text: 'The headline divides by n − 1, the common default for a sample of a larger group.' },
          { name: 'Check the population variance', text: 'The row below divides by n instead — use it only when your numbers are the entire population.' },
          { name: 'See the matching standard deviations', text: 'The last two rows show each variance\'s square root, tying this page directly to the standard deviation calculator\'s own numbers.' },
          { name: 'Compare the two', text: 'The chart places the population and sample variance side by side.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Find the mean, subtract it from every value, square each difference, then average those squares — dividing by n for the population version or n − 1 for the sample version.',
        expression: 'Population: σ² = Σ(xᵢ − mean)² ÷ n\nSample: s² = Σ(xᵢ − mean)² ÷ (n − 1)',
        terms: [
          { symbol: 'xᵢ', meaning: 'Each number in the list.' },
          { symbol: 'mean', meaning: 'The arithmetic mean of the list.' },
          { symbol: 'n', meaning: 'How many numbers you entered (up to 1,000).' }
        ],
        note: 'Variance is standard deviation before the final square root, so σ² = σ × σ and s² = s × s always hold exactly.'
      },
      workedExample: {
        intro: 'The same five test scores the standard deviation calculator uses: 72, 85, 90, 78 and 95.',
        rows: [
          { label: 'Mean (72 + 85 + 90 + 78 + 95) ÷ 5', value: '84' },
          { label: 'Squared differences from the mean', value: '144, 1, 36, 36, 121' },
          { label: 'Sum of squared differences', value: '338' },
          { label: 'Population variance (338 ÷ 5)', value: '67.6' },
          { label: 'Sample variance (338 ÷ 4)', value: '84.5' }
        ],
        result: 'Population variance 67.6, sample variance 84.5',
        explanation: 'Taking the square root of each figure gives exactly the standard deviation calculator\'s worked example (≈ 8.22 and ≈ 9.19) — the two pages describe the same spread, one in squared units and one in the original units.'
      },
      watchOut: [
        { title: 'Variance is in squared units', body: 'A variance of 67.6 on test scores out of 100 is "67.6 points squared" — a real number with no direct real-world reading. Its square root, standard deviation, is the figure usually quoted to a general audience.' },
        { title: 'A single value has no sample variance', body: 'The sample formula divides by n − 1 = 0 when n = 1 — a genuine 0 ÷ 0. This calculator reports that honestly as "—." Population variance of a single value is still a legitimate 0.' },
        { title: 'Dividing by n or n − 1 is not interchangeable', body: 'Same as standard deviation: population and sample variance answer different questions, not two roundings of one answer. Use population variance only when your numbers are the entire group of interest.' },
        { title: 'Variance and standard deviation are not independent findings', body: 'They come from exactly the same calculation up to the final square root — if you already have one, you already have the other, and cross-checking a variance calculator against a standard deviation calculator on the same data is really just checking the same arithmetic twice.' },
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §2.7 Measures of the Spread of the Data', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data' },
        { label: 'Wolfram MathWorld, Variance', url: 'https://mathworld.wolfram.com/Variance.html' }
      ]
    },
    inputs: [listInput([72, 85, 90, 78, 95], 1)],
    breakdown: {
      headline: 'sampleVariance',
      headlineLabel: 'Variance (sample, s²)',
      outputs: [
        { id: 'sampleVariance', label: 'Variance (sample, s²)', format: 'significant' },
        { id: 'populationVariance', label: 'Variance (population, σ²)', format: 'significant' },
        { id: 'mean', label: 'Mean', format: 'significant' },
        { id: 'count', label: 'Count', format: 'integer' },
        { id: 'sampleStdDev', label: 'Standard deviation (sample), for reference', format: 'significant' },
        { id: 'populationStdDev', label: 'Standard deviation (population), for reference', format: 'significant' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'populationVariance', label: 'Population (σ²)' }, { from: 'sampleVariance', label: 'Sample (s²)' }],
        title: 'Population vs. sample variance',
        highlight: 1
      }
    },
    seo: {
      title: 'Variance Calculator – Population & Sample',
      description: 'Free variance calculator. Paste a list of up to 1,000 numbers to find both the population and sample variance, plus the matching standard deviations, with a worked example.',
      faq: [
        { question: 'How do I calculate variance?', answer: 'Find the mean, subtract it from each number and square the result, add those squares up, then divide by n (population) or n − 1 (sample).' },
        { question: 'What is the difference between variance and standard deviation?', answer: 'Variance is the average of squared differences from the mean; standard deviation is its square root. They measure the same spread — variance in squared units, standard deviation in the original units.' },
        { question: 'What is the difference between population and sample variance?', answer: 'Population variance divides by n, the full count. Sample variance divides by n − 1, which corrects for a sample tending to underestimate the spread of the larger group it was drawn from.' },
        { question: 'Why are my numbers so much bigger than the standard deviation?', answer: 'Variance is in squared units. A standard deviation of 9.19 corresponds to a variance of about 84.5 (9.19² ≈ 84.5) — the numbers only look different because one has been squared.' },
        { question: 'Can variance be negative?', answer: 'No. Every term being summed is a squared difference, which can never be negative, so variance is always zero or positive.' },
        { question: 'What does a variance of 0 mean?', answer: 'Every value in the list is identical — there is no spread at all.' },
        { question: 'Which spreadsheet function matches this calculator?', answer: "Excel and Google Sheets' VAR (and VAR.S) match this calculator's sample variance; VARP (or VAR.P) matches the population figure." },
        { question: 'Can I find variance with only one number?', answer: 'Population variance of a single value is 0. Sample variance is undefined, since its formula divides by n − 1 = 0.' },
        { question: 'How many numbers can I enter?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines.' }
      ]
    },
    compute(values, lists) {
      const list = lists.data;
      const { mean, populationVariance, sampleVariance } = varianceOf(list);
      return {
        mean,
        count: list.length,
        populationVariance,
        sampleVariance,
        populationStdDev: Math.sqrt(populationVariance),
        sampleStdDev: Math.sqrt(sampleVariance)
      };
    }
  },
  {
    id: 'z-score-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['z score calculator', 'standard score calculator', 'number of standard deviations calculator', 'z value calculator'],
    related: ['standard-deviation-calculator', 'percentile-calculator', 'mean-median-mode-calculator', 'variance-calculator'],
    title: 'Z-Score Calculator',
    description: 'Solve z = (x − mean) ÷ standard deviation for any of its four quantities — how many standard deviations a value sits from the mean.',
    example: 'An SAT score of 1200, against a mean of 1050 and a standard deviation of 200, gives a z-score of 0.75 — three-quarters of a standard deviation above average.',
    solver: {
      defaultTarget: 'zScore',
      variables: [
        { id: 'value', label: 'Value', symbol: 'x', dimension: 'count', defaultValue: 1200, defaultUnit: 'count' },
        { id: 'mean', label: 'Mean', symbol: 'μ', dimension: 'count', defaultValue: 1050, defaultUnit: 'count' },
        { id: 'standardDeviation', label: 'Standard deviation', symbol: 'σ', dimension: 'count', defaultValue: 200, defaultUnit: 'count' },
        { id: 'zScore', label: 'Z-score', symbol: 'z', dimension: 'count', defaultValue: 0.75, defaultUnit: 'count' }
      ],
      solve: {
        zScore: ({ value, mean, standardDeviation }) => (standardDeviation === 0 ? NaN : (value - mean) / standardDeviation),
        value: ({ mean, standardDeviation, zScore }) => mean + zScore * standardDeviation,
        mean: ({ value, standardDeviation, zScore }) => value - zScore * standardDeviation,
        standardDeviation: ({ value, mean, zScore }) => {
          if (zScore === 0) return NaN; // z = 0 means value = mean regardless of sigma: no unique sigma solves it
          const sd = (value - mean) / zScore;
          return sd > 0 ? sd : NaN; // a standard deviation cannot be zero or negative
        }
      },
      visuals: [
        {
          type: 'rangeBar',
          value: 'zScore',
          bands: [
            { label: 'Far below average', min: -4, max: -2 },
            { label: 'Below average', min: -2, max: -1 },
            { label: 'Typical (within 1 SD)', min: -1, max: 1 },
            { label: 'Above average', min: 1, max: 2 },
            { label: 'Far above average', min: 2, max: 4 }
          ],
          title: 'Where this z-score falls',
          valueLabel: 'Your z-score'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a z-score?',
        paragraphs: [
          'A z-score (or "standard score") says how many standard deviations a value is above or below the mean of its data set. A z-score of 0 means the value equals the mean exactly; positive means above the mean, negative means below it. A z-score of 2 is unusual in most real data sets — only about 2.3% of values in a normal distribution sit above it — while a z-score of 0.75, this calculator\'s default, is well within the ordinary range.',
          'The point of converting a raw value into a z-score is comparability: an SAT score of 1200, a height of 180 cm and a test result of 72°F are all on different scales, but "0.75 standard deviations above average" means the same thing for any of them. This is exactly how a test score gets compared against a national average, or how a lab result gets flagged as unusually high or low.',
          'Z-scores and standard deviation are the same idea applied in two directions: the standard deviation calculator finds how spread out a whole data set is, while this calculator takes one value from (or being compared against) that data set and says precisely where it sits within that spread.'
        ]
      },
      howTo: {
        intro: 'Enter any three of the four fields — value, mean, standard deviation, z-score — and the fourth, marked auto, is calculated.',
        steps: [
          { name: 'Find a z-score', text: 'Enter the value, the mean and the standard deviation. The z-score field, marked auto, fills in as (value − mean) ÷ standard deviation.' },
          { name: 'Find the value for a known z-score', text: 'Enter the mean, the standard deviation and the z-score to find what raw value produces it.' },
          { name: 'Find the mean', text: 'Enter the value, the standard deviation and the z-score to work backward to the mean.' },
          { name: 'Find the standard deviation', text: 'Enter the value, the mean and a nonzero z-score to solve for the standard deviation that fits them.' },
          { name: 'Switch which field is calculated', text: 'Type into the auto field and it becomes an input again; the field you left alone the longest becomes the new calculated one.' },
          { name: 'Read the chart', text: 'The bar shows where your z-score falls against five bands from far below to far above average.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'One relationship, rearranged four ways.',
        expression: 'z = (x − μ) ÷ σ\nx = μ + zσ\nμ = x − zσ\nσ = (x − μ) ÷ z  (when z ≠ 0 and the result is positive)',
        terms: [
          { symbol: 'x', meaning: 'The individual value being compared.' },
          { symbol: 'μ (mean)', meaning: 'The mean of the data set x belongs to.' },
          { symbol: 'σ (standard deviation)', meaning: 'How spread out that data set is — see the standard deviation calculator.' },
          { symbol: 'z', meaning: 'How many standard deviations x is from the mean — negative if x is below it.' }
        ],
        note: 'Solving for standard deviation needs a nonzero z-score (if z = 0, the value already equals the mean and any standard deviation would satisfy the equation) and refuses a result of zero or negative, since a standard deviation cannot be either.'
      },
      workedExample: {
        intro: 'An SAT score of 1200, where the mean score is 1050 and the standard deviation is 200.',
        rows: [
          { label: 'Difference from the mean (1200 − 1050)', value: '150' },
          { label: 'Z-score (150 ÷ 200)', value: '0.75' }
        ],
        result: 'z = 0.75',
        explanation: 'A z-score of 0.75 means this score is three-quarters of a standard deviation above average — clearly above the mean, but not unusually so (a z-score typically has to pass roughly ±2 before it starts being called statistically unusual).'
      },
      watchOut: [
        { title: 'A z-score needs the right mean and standard deviation for the comparison you want', body: 'The same raw score gives a different z-score against a national average than against a single class\'s average. Make sure the mean and standard deviation you enter describe the group you actually want to compare against.' },
        { title: 'Z-scores assume the spread is meaningfully described by a mean and standard deviation', body: 'This works best for roughly symmetric, "bell-shaped" data. For heavily skewed data (like income), a percentile is often a more honest way to describe where a value sits — see the percentile calculator.' },
        { title: 'Solving for standard deviation can refuse to answer', body: 'If the z-score you enter is 0, or the value you enter already equals the mean, there is no single standard deviation that uniquely fits — and if the arithmetic would produce a negative or zero standard deviation, this calculator shows "—" rather than a nonsensical result.' },
        { title: 'A positive z-score is not automatically "good"', body: 'It only means "above the mean." Whether above or below the mean is the better outcome depends entirely on what is being measured — a high z-score on a golf score, for instance, is worse, not better.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §6.1 The Standard Normal Distribution', url: 'https://openstax.org/books/introductory-statistics-2e/pages/6-1-the-standard-normal-distribution' },
        { label: 'Wolfram MathWorld, Standard Deviation', url: 'https://mathworld.wolfram.com/StandardDeviation.html' }
      ]
    },
    inputs: [
      { id: 'value', label: 'Value', type: 'number', placeholder: '1200', defaultValue: 1200, step: 1 },
      { id: 'mean', label: 'Mean', type: 'number', placeholder: '1050', defaultValue: 1050, step: 1 },
      { id: 'standardDeviation', label: 'Standard deviation', type: 'number', placeholder: '200', defaultValue: 200, step: 1 }
    ],
    seo: {
      title: 'Z-Score Calculator – Standard Score, Any Variable',
      description: 'Free z-score calculator. Solve z = (x − mean) ÷ standard deviation for the value, mean, standard deviation or z-score, with a worked SAT-score example.',
      faq: [
        { question: 'How do I calculate a z-score?', answer: 'Subtract the mean from the value, then divide by the standard deviation: z = (x − μ) ÷ σ. A score of 1200 against a mean of 1050 and a standard deviation of 200 gives z = 0.75.' },
        { question: 'What does a z-score of 0 mean?', answer: 'The value is exactly equal to the mean.' },
        { question: 'What does a negative z-score mean?', answer: 'The value is below the mean. A z-score of −1 means the value is one standard deviation below average.' },
        { question: 'What is considered a "high" z-score?', answer: 'There is no universal cutoff, but in a roughly normal distribution, values beyond about ±2 are relatively uncommon (roughly the top or bottom 2–3%), and beyond ±3 are rare.' },
        { question: 'How do I find the original value from a z-score?', answer: 'Rearrange the formula: x = μ + zσ. A z-score of 0.75 with mean 1050 and standard deviation 200 gives x = 1050 + 0.75 × 200 = 1200.' },
        { question: 'Can I solve for the standard deviation instead?', answer: 'Yes: σ = (x − μ) ÷ z, as long as z is not 0 and the arithmetic gives a positive result — a standard deviation of zero or less is not mathematically meaningful.' },
        { question: 'Is a z-score the same as a percentile?', answer: 'No, though they are related. A z-score says how many standard deviations from the mean a value is; converting that to a percentile additionally requires assuming a specific distribution shape (typically the normal distribution).' },
        { question: 'Why would I compare values on different scales using a z-score?', answer: 'Converting each to "how many standard deviations from its own average" puts them on the same scale — the whole reason a 1200 SAT score and a lab result in milligrams per deciliter can both be described as "0.75 standard deviations above average."' }
      ]
    },
    compute(values) {
      const { value, mean, standardDeviation } = values;
      return { zScore: standardDeviation === 0 ? NaN : (value - mean) / standardDeviation };
    }
  },
  {
    id: 'percentile-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['percentile rank calculator', 'find the percentile calculator', 'percentile of a data set calculator', 'what percentile calculator'],
    related: ['mean-median-mode-calculator', 'standard-deviation-calculator', 'z-score-calculator', 'average-calculator'],
    title: 'Percentile Calculator',
    description: 'Find any percentile of a list of up to 1,000 numbers using linear interpolation between the closest ranked values — the method NIST\'s own statistics handbook documents.',
    example: 'Six exam scores — 55, 60, 65, 70, 78 and 90 — have a 75th percentile of 81 and a 50th percentile (the median) of 67.5.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a percentile?',
        paragraphs: [
          'The Pth percentile of a list is the value below which roughly P% of the data falls. The 50th percentile is the median; the 25th and 75th percentiles mark the bottom and top quarters of the data. A test score at the 90th percentile means roughly 90% of the comparison group scored at or below it — a common way results get reported in standardized testing and pediatric growth charts.',
          'There is more than one accepted way to calculate a percentile that does not land exactly on a value already in the list, and different tools genuinely disagree with each other because of it — not because one is wrong. This calculator uses linear interpolation between the two nearest ranked values, specifically the method documented in the NIST/SEMATECH Engineering Statistics Handbook (also the default in NIST\'s own Dataplot software and in Minitab), sometimes called Hyndman & Fan\'s "type 6" definition. See "Watch out" below for how this can differ from Excel\'s built-in percentile function.',
          'A percentile answers a related but distinct question from a z-score: a z-score says how many standard deviations a value is from the mean, assuming the data is roughly bell-shaped; a percentile makes no such assumption and works directly off the ranked data, which makes it a more honest choice for skewed data.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box, then set the percentile you want to find.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines, in any order — up to 1,000 of them. The calculator sorts the list itself.' },
          { name: 'Check the count', text: 'Anything that isn\'t a number is dropped and listed below the box, along with the live count of numbers it understood.' },
          { name: 'Set the target percentile', text: 'Enter the percentile you want to find, from 0 to 100. The default, 75, finds the value marking the top quarter of the data.' },
          { name: 'Read the result', text: 'The headline is the value at that percentile, interpolated between the two closest ranked numbers when it does not land exactly on one of them.' },
          { name: 'Check the rank', text: 'The rank row shows the exact (possibly fractional) position in the sorted list that the target percentile corresponds to.' },
          { name: 'Compare to the range', text: 'The chart plots your lowest value, your chosen percentile\'s value, and your highest value side by side.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Sort the list, find the fractional rank the target percentile corresponds to, then interpolate between the two values on either side of it.',
        expression: 'rank = (P ÷ 100) × (n + 1)\nvalue = Y(k) + d × (Y(k+1) − Y(k)),  where k = ⌊rank⌋ and d = rank − k',
        terms: [
          { symbol: 'P', meaning: 'The target percentile, 0 to 100.' },
          { symbol: 'n', meaning: 'How many numbers you entered (up to 1,000).' },
          { symbol: 'Y(k)', meaning: 'The k-th smallest value in the sorted list (Y(1) is the minimum).' }
        ],
        note: 'If the rank falls at or before the first value, or at or beyond the last, the result is simply the minimum or maximum — entering a percentile below 0 or above 100 behaves the same as entering exactly 0 or 100, since the formula\'s own boundary rule already clamps it.'
      },
      workedExample: {
        intro: 'Six exam scores: 55, 60, 65, 70, 78 and 90. Finding the 75th percentile.',
        rows: [
          { label: 'Sorted', value: '55, 60, 65, 70, 78, 90' },
          { label: 'Rank (0.75 × (6 + 1))', value: '5.25' },
          { label: 'k = 5, d = 0.25', value: 'between the 5th value (78) and the 6th (90)' },
          { label: 'Interpolated value (78 + 0.25 × (90 − 78))', value: '81' }
        ],
        result: '75th percentile = 81',
        explanation: 'The rank, 5.25, falls between the 5th and 6th sorted values, so the result is 25% of the way from the 5th value (78) toward the 6th (90) — not simply one of the six original scores.'
      },
      watchOut: [
        { title: 'Different tools can give different percentile answers for the same data', body: 'Microsoft Excel\'s PERCENTILE and PERCENTILE.INC functions use a different interpolation rule ("type 7": rank = P ÷ 100 × (n − 1) + 1) than the NIST-documented method this calculator uses ("type 6"). Both are standard, cited, legitimate methods — they are not a bug in either tool, just two different conventions, and they tend to agree closely but not exactly.' },
        { title: 'A single value is its own every percentile', body: 'With only one number in the list, the rank formula always resolves to that one value, regardless of what percentile you ask for — there is nothing else for it to interpolate between.' },
        { title: 'The 50th percentile is not always identical to the median formula taught separately', body: 'For this calculator\'s method, they do agree — the 50th percentile and the textbook "average of the two middle values" median give the same answer. That is a property of this particular method, not a universal guarantee across every percentile definition.' },
        { title: 'Percentile is not the same as percentage', body: 'Scoring in the 90th percentile does not mean getting 90% of questions right — it means scoring at or above roughly 90% of whoever you are being compared against, which depends entirely on how that group performed.' },
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste.' }
      ],
      references: [
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §7.2.6.2 Percentiles', url: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc262.htm' },
        { label: 'OpenStax, Introductory Statistics 2e, §2.5 Measures of the Center of the Data', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data' }
      ]
    },
    inputs: [
      listInput([60, 55, 90, 65, 78, 70], 1),
      { id: 'targetPercentile', label: 'Target percentile', type: 'percent', placeholder: '75', defaultValue: 75, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'percentileValue',
      headlineLabel: 'Value at this percentile',
      outputs: [
        { id: 'percentileValue', label: 'Value at this percentile', format: 'significant' },
        { id: 'rank', label: 'Rank in the sorted list', format: 'number' },
        { id: 'median', label: 'Median (50th percentile), for reference', format: 'significant' },
        { id: 'min', label: 'Lowest value', format: 'significant' },
        { id: 'max', label: 'Highest value', format: 'significant' },
        { id: 'count', label: 'Count', format: 'integer' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'min', label: 'Lowest value' }, { from: 'percentileValue', label: 'Your percentile' }, { from: 'max', label: 'Highest value' }],
        title: 'Lowest, your percentile, highest',
        highlight: 1
      }
    },
    seo: {
      title: 'Percentile Calculator – Rank & Interpolate',
      description: 'Free percentile calculator. Paste a list of up to 1,000 numbers and find any percentile using the NIST-documented linear interpolation method, with a worked example.',
      faq: [
        { question: 'How do I calculate a percentile?', answer: 'Sort the data, convert the target percentile into a fractional rank, then interpolate between the two sorted values on either side of that rank. For 55, 60, 65, 70, 78, 90, the 75th percentile is 81.' },
        { question: 'What percentile method does this calculator use?', answer: 'Linear interpolation between the closest ranked values, following the NIST/SEMATECH Engineering Statistics Handbook\'s definition (Hyndman & Fan\'s "type 6") — the same method NIST\'s own Dataplot software defaults to.' },
        { question: 'Why does this give a different answer than Excel?', answer: "Excel's PERCENTILE/PERCENTILE.INC functions use a slightly different interpolation rule (\"type 7\"). Both are standard, documented methods; they usually agree closely but can differ by a small amount." },
        { question: 'What is the 50th percentile?', answer: "The median — the value with half the data at or below it and half at or above it. For this calculator's method, it always matches the textbook median formula exactly." },
        { question: 'What happens if I enter a percentile above 100 or below 0?', answer: 'The result clamps to the maximum or minimum value in the list, the same as entering exactly 100 or 0 — the field has no upper limit of its own, so this is handled inside the calculation instead.' },
        { question: 'How many numbers can I enter?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines.' },
        { question: 'Is a percentile the same as a percentage score?', answer: "No. A percentile compares a value's rank against other values in the same data set; a percentage score (like 90% correct) is a raw fraction of possible points, unrelated to how anyone else performed." },
        { question: 'Does the order I enter numbers in matter?', answer: 'No — the calculator sorts the list itself before finding the percentile.' }
      ]
    },
    compute(values, lists) {
      const list = lists.data;
      const sorted = [...list].sort((a, b) => a - b);
      const n = sorted.length;
      const targetPercentile = Math.min(100, Math.max(0, values.targetPercentile));
      const rank = (targetPercentile / 100) * (n + 1);
      return {
        percentileValue: percentileOf(sorted, targetPercentile),
        rank: Math.min(n, Math.max(1, rank)),
        median: percentileOf(sorted, 50),
        min: sorted[0],
        max: sorted[n - 1],
        count: n
      };
    }
  }
];
