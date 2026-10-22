import type { CalculatorConfig, CalculatorInput } from './types.ts';
import { normalCDF, normalInverseCDF, tCDF, tInverseCDF } from '../../lib/distributions.ts';

// A confidence level has no natural upper bound in this kit (CalculatorInput has no `max`), and the
// snapshot harness's own "typical" input set scales every default by 1.5x — so a 95% default would
// become 142.5% there. Clamping keeps every confidence-level field honest instead of producing NaN
// for a meaningless >=100% or <=0% input; same precedent as percentile-calculator's own clamp.
function clampConfidence(level: number) {
  return Math.min(99.99, Math.max(0.01, level));
}

// Shared "data list" input: a paste-a-list textarea (CalculatorInput.type: 'list'), parsed by
// lib/listParse.ts. Replaces the "How many numbers?" + numbered-slot stopgap statistics run 1
// shipped with — see mdFiles/steps/41-wave-1-statistics.md, "List input (between run 1 and run 2)",
// for why and the full design. Every list-based calculator in this category reuses this one helper.
function listInput(defaults: number[], min = 1): CalculatorInput {
  return {
    id: 'data',
    label: 'Your numbers',
    type: 'list',
    placeholder: 'Paste or type numbers — commas, spaces or new lines between them. $, % and thousands commas like 1,000 are understood.',
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
        { title: 'Non-numeric tokens are dropped, not averaged in as zero', body: 'Anything pasted into the box that is not a number — a stray label, a unit, a trailing comma — is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste. A leading $, a trailing %, and commas used as thousands separators (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers; a bare comma-only list like 100,200,300 still reads as three numbers.' }
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
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste. A leading $, a trailing %, and commas used as thousands separators (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers.' }
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
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste. A leading $, a trailing %, and commas used as thousands separators (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers.' }
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
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. Check the live count against what you expected to paste. A leading $, a trailing %, and commas used as thousands separators (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers.' }
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
  },
  {
    id: 'confidence-interval-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['confidence interval calculator', 'ci calculator', 'margin of error for a mean calculator', 'confidence interval for the mean calculator'],
    related: ['margin-of-error-calculator', 'standard-deviation-calculator', 'sample-size-calculator', 'z-score-calculator'],
    title: 'Confidence Interval Calculator',
    description: 'Find a confidence interval for a population mean from a sample — using the z-distribution when the population standard deviation is known, or the t-distribution when you only have a sample standard deviation.',
    example: 'A sample of 36 students studies 15.2 hours a week on average, with a sample standard deviation of 4.1 hours. The 95% confidence interval (t-distribution) is about 13.81 to 16.59 hours.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a confidence interval?',
        paragraphs: [
          'A confidence interval is a range built around a sample statistic — here, a sample mean — that is likely to contain the true value for the whole population. A "95% confidence interval" does not mean there is a 95% chance the true mean falls in this specific interval; it means that if you repeated the same sampling process many times and built an interval the same way each time, about 95% of those intervals would contain the true population mean. The interval itself is either right or wrong — the 95% describes the method\'s long-run reliability, not this one result.',
          'Every confidence interval for a mean has the same shape: the sample mean, plus or minus a margin of error. The margin of error is a critical value (how many standard errors wide the interval needs to be for the chosen confidence level) multiplied by the standard error (how precisely the sample mean estimates the true mean, which shrinks as the sample gets larger).',
          'The critical value comes from one of two distributions, and which one you use is not a stylistic choice. If the population standard deviation (σ) is genuinely known in advance — rare outside of quality-control settings with a long production history — the standard normal (z) distribution is correct. In every other case, including almost all real survey and experimental data, the population standard deviation is unknown and only a sample standard deviation (s) is available; the Student\'s t-distribution, with n − 1 degrees of freedom, replaces the normal distribution to honestly account for the extra uncertainty of having estimated σ from the same sample. The t-distribution is wider than the normal distribution (giving a larger margin of error) for the same confidence level, and the gap between the two narrows as the sample size grows — by a few hundred data points, they are nearly indistinguishable.'
        ]
      },
      howTo: {
        intro: 'Choose whether you know the population standard deviation, then enter your sample mean, standard deviation, sample size and confidence level.',
        steps: [
          { name: 'Choose z or t', text: 'Pick "known population standard deviation" only if σ is genuinely known ahead of time. Otherwise — the usual case — pick "only a sample standard deviation," which uses the t-distribution.' },
          { name: 'Enter your sample mean', text: 'The average of your sample data. If you have the raw data instead of just the mean, the mean/median/mode calculator finds it for you.' },
          { name: 'Enter the standard deviation', text: 'σ if known (z-mode), or your sample\'s standard deviation s (t-mode) — the standard deviation calculator finds s from raw data.' },
          { name: 'Enter the sample size', text: 'How many observations your sample has. In t-mode, this also sets the degrees of freedom (n − 1) for the t-distribution.' },
          { name: 'Set the confidence level', text: 'Usually 90%, 95% or 99%. Higher confidence always means a wider interval for the same data — there is no way to be more confident without giving up precision.' },
          { name: 'Read the interval', text: 'The result is the lower and upper bound of the confidence interval, plus the margin of error and the exact critical value used.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The same shape either way — sample mean plus or minus a critical value times the standard error — with the critical value coming from the z or t distribution.',
        expression: 'Known σ (z-interval): x̄ ± z(α/2) × (σ ÷ √n)\nSample s (t-interval): x̄ ± t(α/2, df) × (s ÷ √n),  df = n − 1',
        terms: [
          { symbol: 'x̄', meaning: 'The sample mean.' },
          { symbol: 'σ, s', meaning: 'The population standard deviation (if known) or the sample standard deviation.' },
          { symbol: 'n', meaning: 'The sample size.' },
          { symbol: 'α', meaning: '1 − confidence level (as a fraction); e.g. 0.05 for a 95% confidence level.' },
          { symbol: 'z(α/2), t(α/2, df)', meaning: 'The critical value that cuts off α/2 in each tail of the normal or t distribution.' }
        ],
        note: 'The critical values are computed directly from the standard normal and Student\'s t distributions (see this calculator\'s references), not read from a printed table, so this calculator works for any confidence level, not just 90/95/99%.'
      },
      workedExample: {
        intro: 'A sample of 36 university students reports a mean study time of 15.2 hours per week, with a sample standard deviation of 4.1 hours. Find a 95% confidence interval for the true mean study time across all students (t-interval, since only a sample standard deviation is known).',
        rows: [
          { label: 'Degrees of freedom (36 − 1)', value: '35' },
          { label: 't-critical value for 95% confidence, df = 35', value: '≈ 2.0301' },
          { label: 'Standard error (4.1 ÷ √36)', value: '≈ 0.6833' },
          { label: 'Margin of error (2.0301 × 0.6833)', value: '≈ 1.3872' },
          { label: 'Lower bound (15.2 − 1.3872)', value: '≈ 13.8128' },
          { label: 'Upper bound (15.2 + 1.3872)', value: '≈ 16.5872' }
        ],
        result: '95% CI ≈ [13.81, 16.59] hours per week',
        explanation: 'This says: if this same sampling process were repeated many times, about 95% of the intervals built this way would contain the true mean study time of the whole student population. It does not say there is a 95% chance the true mean is specifically between 13.81 and 16.59 for this one sample.'
      },
      watchOut: [
        { title: 'A wider interval is not a worse answer', body: 'A 99% confidence interval is wider than a 95% one for the same data — that is the price of more confidence, not a sign of a weaker result. There is no way to get both a narrower interval and higher confidence without a larger sample.' },
        { title: 'Picking z when you should pick t overstates your precision', body: 'Using the normal distribution when you only actually have a sample standard deviation gives an interval that is narrower than it should be, because it ignores the extra uncertainty of having estimated σ from the sample itself. When in doubt, use the t-interval — it is the more conservative, more honest choice, and the two converge anyway as the sample grows.' },
        { title: 'This assumes the sampling distribution of the mean is approximately normal', body: 'By the central limit theorem this is a safe assumption for most samples of 30 or more, or for any sample size if the underlying population itself is roughly normal. For small, heavily skewed samples the result can be unreliable.' },
        { title: 'A confidence level is not a probability about this specific interval', body: 'Once a sample is collected and the interval is calculated, it either does or does not contain the true mean — there is no remaining randomness to attach a 95% probability to. The 95% describes the reliability of the method over many repeated samples, not this one outcome.' },
        { title: 'Confidence level is clamped between 0.01% and 99.99%', body: 'A 100% confidence level would require an interval infinitely wide (the only way to be completely certain), which is not a useful answer, so this calculator treats anything at or above 100% the same as 99.99%, and anything at or below 0% the same as 0.01%.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §8.1 A Single Population Mean using the Normal Distribution', url: 'https://openstax.org/books/introductory-statistics-2e/pages/8-1-a-single-population-mean-using-the-normal-distribution' },
        { label: 'OpenStax, Introductory Statistics 2e, §8.2 A Single Population Mean using the Student t Distribution', url: 'https://openstax.org/books/introductory-statistics-2e/pages/8-2-a-single-population-mean-using-the-student-t-distribution' },
        { label: 'Wolfram MathWorld, Confidence Interval', url: 'https://mathworld.wolfram.com/ConfidenceInterval.html' },
        { label: 'Wolfram MathWorld, Student\'s t-Distribution', url: 'https://mathworld.wolfram.com/Studentst-Distribution.html' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'What do you know about the standard deviation?',
        type: 'number',
        placeholder: '2',
        defaultValue: 2,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Known population standard deviation (z-interval)' },
          { value: 2, label: 'Only a sample standard deviation (t-interval)' }
        ]
      },
      { id: 'sampleMean', label: 'Sample mean (x̄)', type: 'number', placeholder: '15.2', defaultValue: 15.2, step: 0.1 },
      { id: 'stdDev', label: 'Standard deviation (σ known, or sample s)', type: 'number', placeholder: '4.1', defaultValue: 4.1, step: 0.1 },
      { id: 'sampleSize', label: 'Sample size (n)', type: 'number', placeholder: '36', defaultValue: 36, step: 1, min: 2 },
      { id: 'confidenceLevel', label: 'Confidence level', type: 'percent', placeholder: '95', defaultValue: 95, step: 1, min: 1 }
    ],
    breakdown: {
      headline: 'marginOfError',
      headlineLabel: 'Margin of error (±)',
      outputs: [
        { id: 'marginOfError', label: 'Margin of error (±)', format: 'significant' },
        { id: 'lowerBound', label: 'Lower bound', format: 'significant' },
        { id: 'upperBound', label: 'Upper bound', format: 'significant' },
        { id: 'criticalValue', label: 'Critical value (z* or t*)', format: 'significant' },
        { id: 'standardError', label: 'Standard error', format: 'significant' },
        { id: 'degreesOfFreedom', label: 'Degrees of freedom (n − 1), used in t-mode only', format: 'integer' }
      ],
      groups: [
        { inputs: ['mode'] },
        { inputs: ['sampleMean', 'stdDev', 'sampleSize', 'confidenceLevel'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'lowerBound', label: 'Lower bound' }, { from: 'sampleMean', label: 'Sample mean' }, { from: 'upperBound', label: 'Upper bound' }],
        title: 'Your confidence interval',
        highlight: 1
      }
    },
    seo: {
      title: 'Confidence Interval Calculator – Mean, z or t',
      description: 'Free confidence interval calculator for a population mean. Choose the z-interval (known σ) or t-interval (sample s), with critical values computed directly, not table-rounded.',
      faq: [
        { question: 'How do I calculate a confidence interval for a mean?', answer: 'Take the sample mean, then add and subtract a margin of error: a critical value (from the z or t distribution) times the standard error (standard deviation ÷ √n). For a sample of 36 with mean 15.2 and sample standard deviation 4.1 at 95% confidence, the interval is about 13.81 to 16.59.' },
        { question: 'When do I use the z-interval instead of the t-interval?', answer: 'Only when the population standard deviation (σ) is genuinely known ahead of time, independent of your sample. In almost every other real situation, you only have a sample standard deviation, and the t-interval (with n − 1 degrees of freedom) is the correct, more conservative choice.' },
        { question: 'Why is the t-interval wider than the z-interval for the same data?', answer: 'The t-distribution has heavier tails than the normal distribution, which accounts for the extra uncertainty of estimating the population standard deviation from the sample itself rather than knowing it exactly. As the sample size grows, the t-distribution converges to the normal distribution and the gap shrinks.' },
        { question: 'What does "95% confidence" actually mean?', answer: 'It describes the reliability of the method, not this one interval: if you repeated the same sampling and interval-building process many times, about 95% of the resulting intervals would contain the true population mean. Any single interval either does or does not contain it.' },
        { question: 'Does a bigger sample size give a narrower interval?', answer: 'Yes — the standard error shrinks as the sample size grows (it is divided by √n), so a larger sample gives a narrower margin of error for the same confidence level, all else equal.' },
        { question: 'What are the degrees of freedom?', answer: 'For the t-interval, degrees of freedom equal the sample size minus 1 (n − 1). They control exactly how wide the t-distribution\'s tails are; smaller samples have fewer degrees of freedom and a wider t-distribution.' },
        { question: 'Can I use any confidence level, not just 90%, 95% or 99%?', answer: 'Yes — this calculator computes the critical value directly from the distribution for any confidence level between 0.01% and 99.99%, rather than looking one up in a printed table limited to a few common values.' },
        { question: 'How is this different from the margin of error calculator?', answer: 'This calculator is specifically for a population mean built from a sample mean, standard deviation and sample size. The margin of error calculator focuses on survey proportions (percentages) instead — see it directly for that case.' }
      ]
    },
    compute(values) {
      const { mode, sampleMean, stdDev, sampleSize, confidenceLevel } = values;
      const n = sampleSize;
      const confidence = clampConfidence(confidenceLevel);
      const alpha = 1 - confidence / 100;
      const degreesOfFreedom = n - 1;
      const useZ = mode === 1;
      const criticalValue = useZ ? normalInverseCDF(1 - alpha / 2) : tInverseCDF(1 - alpha / 2, degreesOfFreedom);
      const standardError = stdDev / Math.sqrt(n);
      const marginOfError = criticalValue * standardError;
      return {
        marginOfError,
        lowerBound: sampleMean - marginOfError,
        upperBound: sampleMean + marginOfError,
        criticalValue,
        standardError,
        degreesOfFreedom
      };
    }
  },
  {
    id: 'margin-of-error-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['margin of error calculator', 'survey margin of error calculator', 'poll margin of error calculator', 'error bound for a proportion calculator'],
    related: ['sample-size-calculator', 'confidence-interval-calculator', 'z-score-calculator', 'percentile-calculator'],
    title: 'Margin of Error Calculator',
    description: 'Find the margin of error for a survey or poll proportion, given the sample size and confidence level, using the Wald method — with an optional finite population correction.',
    example: 'A survey of 1,000 voters finds 54% support a measure. At 95% confidence, the margin of error is about ±3.09 percentage points.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is margin of error?',
        paragraphs: [
          'Margin of error is the "plus or minus" figure attached to a survey or poll result — "54%, margin of error ±3 points" means the true proportion in the whole population is estimated to lie somewhere between about 51% and 57%, at the stated confidence level. It exists because a sample, however carefully chosen, is not the whole population, and a different sample of the same size would almost certainly give a slightly different result.',
          'Margin of error depends on three things: how confident you want to be (a higher confidence level widens the margin), how large the sample is (a bigger sample narrows it, but only by the square root of the sample size — quadrupling the sample only halves the margin), and how close the measured proportion is to 50%. A proportion near 50% has the most sampling variability and the widest margin of error of any proportion at a given sample size; a proportion near 0% or 100% has much less, because there is much less room for a repeated sample to disagree.',
          'This calculator uses the Wald method, the simplest and most widely taught way to compute it: margin = critical value × standard error, where the standard error comes directly from the sample proportion and size. For very small samples or a proportion very close to 0% or 100%, more advanced methods like the Wilson score interval handle the edge cases more accurately — see "Watch out" below.'
        ]
      },
      howTo: {
        intro: 'Enter the sample proportion, the sample size and the confidence level.',
        steps: [
          { name: 'Enter the sample proportion', text: 'The percentage of your sample that gave the response you are measuring, e.g. 54 for 54%.' },
          { name: 'Enter the sample size', text: 'How many people or items were actually sampled.' },
          { name: 'Set the confidence level', text: 'Usually 95%. A higher confidence level widens the margin of error for the same sample.' },
          { name: 'Optional: enter the population size', text: 'Only needed for a finite population correction — leave it at 0 to treat the population as effectively infinite, the usual case for a large general population.' },
          { name: 'Read the margin and the range', text: 'The result is the margin of error in percentage points, plus the resulting lower and upper bound around your sample proportion.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The Wald margin of error for a proportion, with an optional correction when sampling a large fraction of a known, finite population.',
        expression: 'margin = z(α/2) × √(p̂(1 − p̂) ÷ n) × fpc\nfpc = √((N − n) ÷ (N − 1))  (only applied when a population size N > n is given)',
        terms: [
          { symbol: 'p̂', meaning: 'The sample proportion, as a fraction (54% = 0.54).' },
          { symbol: 'n', meaning: 'The sample size.' },
          { symbol: 'N', meaning: 'The population size, if known and finite.' },
          { symbol: 'z(α/2)', meaning: 'The critical value of the standard normal distribution for the chosen confidence level.' }
        ],
        note: 'The finite population correction only matters when the sample is a substantial fraction of a known, finite population — surveying 500 of a town\'s 2,000 residents, say. For a large or effectively unlimited population (most national surveys), it makes almost no difference and is left out by default.'
      },
      workedExample: {
        intro: 'A survey of 1,000 randomly selected voters finds that 54% support a ballot measure. Find the margin of error at 95% confidence.',
        rows: [
          { label: 'Sample proportion (p̂)', value: '0.54' },
          { label: 'Standard error (√(0.54 × 0.46 ÷ 1000))', value: '≈ 0.015761' },
          { label: 'Critical value for 95% confidence', value: '≈ 1.959964' },
          { label: 'Margin of error (1.959964 × 0.015761)', value: '≈ 0.030890, i.e. ±3.09 percentage points' }
        ],
        result: '54% ± 3.09 percentage points (95% confidence)',
        explanation: 'This means the poll\'s method would, across many repeated surveys of this size, produce an interval containing the true proportion of all voters about 95% of the time — reported here as "support is between about 50.9% and 57.1%."'
      },
      watchOut: [
        { title: 'The Wald method can understate the margin for small samples or extreme proportions', body: 'When the sample size is small, or the proportion is very close to 0% or 100%, the Wald interval this calculator uses can be noticeably less accurate than alternatives like the Wilson score interval, which many statistical software packages use by default for exactly this reason. For large samples (several hundred or more) with a proportion not near the extremes, the difference is small.' },
        { title: 'Margin of error only covers sampling error', body: 'It says nothing about bias from how the sample was chosen — a poorly designed survey (a non-random sample, leading questions, low response rates) can be wrong by far more than the stated margin of error, which assumes a properly randomized sample.' },
        { title: '"54% ± 3%" does not mean the true value is definitely between 51% and 57%', body: 'Like any confidence interval, the stated confidence level (usually 95%) describes how often the method gets it right across many repeated samples, not the probability for this one survey.' },
        { title: 'The finite population correction is off by default for a reason', body: 'Setting the population size to 0 treats the population as effectively infinite — the standard assumption for national or other very large surveys. Only enter a real population size when your sample is a meaningful fraction of a genuinely finite group.' },
        { title: 'A margin of error near 50% is as wide as this calculation gets', body: 'Because p̂(1 − p̂) is largest at p̂ = 0.5, a result close to an even 50/50 split carries the widest possible margin of error for a given sample size — a 50% result is less statistically precise than a 90% or 10% result from the same size sample, even though it is reported with the same ± figure convention.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §8.3 A Population Proportion', url: 'https://openstax.org/books/introductory-statistics-2e/pages/8-3-a-population-proportion' },
        { label: 'Wolfram MathWorld, Confidence Interval', url: 'https://mathworld.wolfram.com/ConfidenceInterval.html' }
      ]
    },
    inputs: [
      { id: 'sampleProportion', label: 'Sample proportion (p̂)', type: 'percent', placeholder: '54', defaultValue: 54, step: 1, min: 0 },
      { id: 'sampleSize', label: 'Sample size (n)', type: 'number', placeholder: '1000', defaultValue: 1000, step: 1, min: 2 },
      { id: 'confidenceLevel', label: 'Confidence level', type: 'percent', placeholder: '95', defaultValue: 95, step: 1, min: 1 },
      { id: 'populationSize', label: 'Population size (0 = treat as infinite)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'marginOfErrorPercent',
      headlineLabel: 'Margin of error (± percentage points)',
      outputs: [
        { id: 'marginOfErrorPercent', label: 'Margin of error (± percentage points)', format: 'percent' },
        { id: 'lowerBound', label: 'Lower bound', format: 'percent' },
        { id: 'upperBound', label: 'Upper bound', format: 'percent' },
        { id: 'criticalValue', label: 'Critical value (z*)', format: 'significant' },
        { id: 'standardErrorPercent', label: 'Standard error', format: 'percent' }
      ],
      groups: [
        { inputs: ['sampleProportion', 'sampleSize', 'confidenceLevel'] },
        { title: 'Finite population correction (optional)', inputs: ['populationSize'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'lowerBound', label: 'Lower bound' }, { from: 'sampleProportion', label: 'Sample proportion' }, { from: 'upperBound', label: 'Upper bound' }],
        title: 'Estimated range for the true proportion',
        highlight: 1
      }
    },
    seo: {
      title: 'Margin of Error Calculator – Survey & Poll Proportions',
      description: 'Free margin of error calculator for a survey proportion. Enter the sample proportion, sample size and confidence level, with an optional finite population correction.',
      faq: [
        { question: 'How do I calculate margin of error?', answer: 'Multiply the critical value for your confidence level by the standard error, √(p̂(1 − p̂) ÷ n). For a sample proportion of 54% out of 1,000 people at 95% confidence, the margin of error is about ±3.09 percentage points.' },
        { question: 'Why does a 50% result have the largest margin of error?', answer: 'The standard error formula depends on p̂(1 − p̂), which is largest when p̂ = 0.5. A result near 0% or 100% produces a smaller margin of error for the same sample size.' },
        { question: 'Does a bigger sample always shrink the margin of error?', answer: 'Yes, but not proportionally — the standard error is divided by √n, so you need 4 times the sample size to cut the margin of error in half, and 100 times the sample to cut it to a tenth.' },
        { question: 'What confidence level should I use?', answer: '95% is the standard default in most published polling and survey results. 99% gives a wider, more conservative margin; 90% gives a narrower one.' },
        { question: 'What is the finite population correction?', answer: 'A factor that shrinks the margin of error slightly when your sample is a substantial fraction of a known, finite population (for example, 500 out of 2,000 residents). It makes little difference for large or effectively unlimited populations, which is why it defaults to off.' },
        { question: 'Is the Wald method the only way to calculate this?', answer: 'No — it is the simplest and most commonly taught method. The Wilson score interval is a more accurate alternative for small samples or proportions near 0% or 100%, and some statistical software uses it by default.' },
        { question: 'Does margin of error account for a biased or non-random sample?', answer: 'No. Margin of error only measures random sampling variability, assuming the sample was properly randomized. It says nothing about errors from a poorly designed survey, such as a non-representative sample or leading questions.' },
        { question: 'How is this different from the confidence interval calculator?', answer: 'This calculator is specifically for a survey proportion (a percentage). The confidence interval calculator covers a population mean instead, built from a sample mean and standard deviation, and can use either the z or t distribution.' }
      ]
    },
    compute(values) {
      const { sampleProportion, sampleSize, confidenceLevel, populationSize } = values;
      const n = sampleSize;
      const confidence = clampConfidence(confidenceLevel);
      const alpha = 1 - confidence / 100;
      const z = normalInverseCDF(1 - alpha / 2);
      const p = Math.min(100, Math.max(0, sampleProportion)) / 100;
      const standardError = Math.sqrt((p * (1 - p)) / n);
      const applyFpc = populationSize > n;
      const fpc = applyFpc ? Math.sqrt((populationSize - n) / (populationSize - 1)) : 1;
      const marginOfError = z * standardError * fpc;
      const marginOfErrorPercent = marginOfError * 100;
      const sampleProportionPercent = p * 100;
      return {
        marginOfErrorPercent,
        lowerBound: Math.max(0, sampleProportionPercent - marginOfErrorPercent),
        upperBound: Math.min(100, sampleProportionPercent + marginOfErrorPercent),
        criticalValue: z,
        standardErrorPercent: standardError * 100
      };
    }
  },
  {
    id: 'sample-size-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['sample size calculator', 'survey sample size calculator', 'how many people to survey calculator', 'minimum sample size calculator'],
    related: ['margin-of-error-calculator', 'confidence-interval-calculator', 'z-score-calculator', 'percentile-calculator'],
    title: 'Sample Size Calculator',
    description: 'Find the minimum sample size needed for a survey or poll to hit a target margin of error at a given confidence level, with a conservative 50% default proportion and an optional finite population correction.',
    example: 'To estimate a proportion within ±4 percentage points at 95% confidence, assuming the worst-case 50% split, you need at least 601 respondents.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is sample size planning?',
        paragraphs: [
          'This calculator answers the question behind the margin of error calculator: instead of starting with a sample size and finding the resulting margin of error, it starts with a target margin of error and confidence level and finds the smallest sample size that achieves them. The two calculators use exactly the same formula, just solved for a different variable.',
          'Because the true proportion is not known until after the survey runs, this calculator needs an estimate of it in advance. The conservative, standard default is 50% — the proportion that produces the largest possible margin of error (and therefore the largest required sample size) for any given sample size, since p(1 − p) is maximized at p = 0.5. Using 50% when you genuinely have no better estimate guarantees the sample is large enough no matter what the true proportion turns out to be. If you have good reason to expect a lopsided result (say, around 20%), entering that instead gives a smaller, still-valid sample size.',
          'The result is always rounded up to the next whole person or item, never down and never left as a fraction — a sample size of 600.2 does not exist, and rounding down would fall just short of the target precision you asked for.'
        ]
      },
      howTo: {
        intro: 'Enter your target confidence level, your target margin of error, and (optionally) your best estimate of the true proportion.',
        steps: [
          { name: 'Set the confidence level', text: 'Usually 95%. A higher confidence level needs a larger sample for the same margin of error.' },
          { name: 'Set the target margin of error', text: 'How precise you want the result to be, in percentage points — 4 for ±4 points, for example. A smaller target margin needs a larger sample.' },
          { name: 'Set the estimated proportion', text: 'Leave it at 50% if you have no prior information — the conservative, largest-sample-size assumption. Enter a narrower estimate if you have good reason to expect a lopsided result.' },
          { name: 'Optional: enter the population size', text: 'Only if you are sampling from a small, known, finite population — leave it at 0 to treat the population as effectively unlimited, the usual case.' },
          { name: 'Read the required sample size', text: 'The result is always rounded up to the next whole number, with the exact (unrounded) calculation shown alongside it.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The margin of error formula, rearranged to solve for the sample size instead.',
        expression: 'n₀ = z(α/2)² × p(1 − p) ÷ e²\nn = n₀ ÷ (1 + (n₀ − 1) ÷ N)  (only applied when a finite population size N is given)',
        terms: [
          { symbol: 'p', meaning: 'The estimated proportion, as a fraction (50% = 0.5 is the conservative default).' },
          { symbol: 'e', meaning: 'The target margin of error, as a fraction (4% = 0.04).' },
          { symbol: 'z(α/2)', meaning: 'The critical value of the standard normal distribution for the chosen confidence level.' },
          { symbol: 'N', meaning: 'The population size, if known and finite.' }
        ],
        note: 'The result is always rounded up (a fractional person or survey response does not exist), so the sample size shown may be 1 more than the raw calculation — stated explicitly rather than rounded to the nearest whole number, which could under-deliver on the target precision.'
      },
      workedExample: {
        intro: 'Planning a survey that wants a margin of error of no more than ±4 percentage points at 95% confidence, with no prior estimate of the true proportion (so the conservative 50% is used).',
        rows: [
          { label: 'Critical value for 95% confidence', value: '≈ 1.959964' },
          { label: 'p(1 − p) at the conservative p = 0.5', value: '0.25' },
          { label: 'Target margin as a fraction (4%)', value: '0.04' },
          { label: 'Unrounded sample size (1.959964² × 0.25 ÷ 0.04²)', value: '≈ 600.23' },
          { label: 'Rounded up', value: '601' }
        ],
        result: 'Minimum sample size = 601',
        explanation: 'Even though the raw calculation came to about 600.23, the survey needs 601 full respondents — rounding down to 600 would leave the margin of error very slightly wider than the ±4 point target.'
      },
      watchOut: [
        { title: 'Always rounds up, never to the nearest whole number', body: 'A sample size of 600.23 rounds up to 601, not down to 600. Rounding to the nearest whole number can quietly fall just short of the margin of error you asked for.' },
        { title: 'Using 50% when the true proportion is different does not make the result wrong — only larger than strictly necessary', body: 'The 50% default is a safety margin. If the true proportion later turns out to be, say, 20%, your resulting margin of error at the actual sample size will be narrower than the ±4% you planned for, not wider.' },
        { title: 'This plans for sampling error only', body: 'It does not account for non-response (people who decline to answer) or any bias in how the sample is chosen. Real survey planning typically inflates this number further to allow for an expected response rate.' },
        { title: 'The finite population correction only shrinks the required sample — it never increases it', body: 'It matters only when the population itself is small relative to the sample you would otherwise need; for a large or effectively unlimited population it makes negligible difference, which is why it is off by default (population size = 0).' },
        { title: 'A smaller margin of error or higher confidence always costs more sample, not less', body: 'Both tightening the margin of error and raising the confidence level increase the required sample size — there is no way to get a more precise, more confident result from fewer respondents.' }
      ],
      references: [
        { label: 'OpenStax, Introductory Statistics 2e, §8.3 A Population Proportion', url: 'https://openstax.org/books/introductory-statistics-2e/pages/8-3-a-population-proportion' },
        { label: 'Wolfram MathWorld, Confidence Interval', url: 'https://mathworld.wolfram.com/ConfidenceInterval.html' }
      ]
    },
    inputs: [
      { id: 'confidenceLevel', label: 'Confidence level', type: 'percent', placeholder: '95', defaultValue: 95, step: 1, min: 1 },
      { id: 'marginOfError', label: 'Target margin of error', type: 'percent', placeholder: '4', defaultValue: 4, step: 0.5, min: 0.1 },
      { id: 'estimatedProportion', label: 'Estimated proportion (50% is the conservative default)', type: 'percent', placeholder: '50', defaultValue: 50, step: 1, min: 0 },
      { id: 'populationSize', label: 'Population size (0 = treat as infinite)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'sampleSize',
      headlineLabel: 'Minimum sample size needed',
      outputs: [
        { id: 'sampleSize', label: 'Minimum sample size needed', format: 'integer' },
        { id: 'rawSampleSize', label: 'Exact (unrounded) calculation', format: 'significant' },
        { id: 'criticalValue', label: 'Critical value (z*)', format: 'significant' },
        { id: 'marginOfErrorPercent', label: 'Target margin of error', format: 'percent' },
        { id: 'estimatedProportionPercent', label: 'Estimated proportion used', format: 'percent' }
      ],
      groups: [
        { inputs: ['confidenceLevel', 'marginOfError', 'estimatedProportion'] },
        { title: 'Finite population correction (optional)', inputs: ['populationSize'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'rawSampleSize', label: 'Exact calculation' }, { from: 'sampleSize', label: 'Rounded up (final answer)' }],
        title: 'Why we round up',
        highlight: 1
      }
    },
    seo: {
      title: 'Sample Size Calculator – Surveys & Polls',
      description: 'Free sample size calculator for surveys and polls. Enter your target margin of error, confidence level and estimated proportion to find the minimum respondents needed, always rounded up.',
      faq: [
        { question: 'How do I calculate the sample size I need?', answer: 'Use n = z(α/2)² × p(1 − p) ÷ e², where z is the critical value for your confidence level, p is your estimated proportion (50% if unknown) and e is your target margin of error. For 95% confidence, a 4% margin and p = 50%, the result is about 600.23, rounded up to 601.' },
        { question: 'Why does this use 50% as the default proportion?', answer: 'Because p(1 − p) — the term driving the required sample size — is largest when p = 50%, using it as a default guarantees your sample is large enough regardless of what the true proportion turns out to be. It is the standard, conservative assumption when you have no better estimate.' },
        { question: 'Why does the answer always round up?', answer: 'A fractional respondent does not exist, and rounding down would leave your actual margin of error very slightly wider than the target you asked for. Rounding up is the only direction that is guaranteed not to undershoot your precision goal.' },
        { question: 'Does a bigger population need a bigger sample?', answer: 'Not necessarily, and often barely at all — past a certain size, population size has almost no effect on the required sample for a given margin of error. The finite population correction only meaningfully shrinks the required sample when the sample would otherwise be a large fraction of a genuinely small, known population.' },
        { question: 'What if I already have a good estimate of the true proportion?', answer: 'Enter it instead of 50% — a narrower, more accurate estimate (say, 20% if you strongly expect a lopsided result) produces a smaller, still-valid required sample size for the same target margin of error and confidence level.' },
        { question: 'How much more sample do I need for a smaller margin of error?', answer: 'Sample size grows with the square of 1 ÷ margin of error, so cutting the target margin of error in half requires roughly 4 times the sample size.' },
        { question: 'Does this account for people who do not respond to the survey?', answer: 'No — this is the number of completed responses needed. Real surveys typically plan for a larger initial outreach to allow for an expected non-response rate.' },
        { question: 'How is this different from the margin of error calculator?', answer: 'The margin of error calculator starts from a sample size and finds the resulting margin of error. This calculator runs the same formula in the opposite direction: starting from a target margin of error, it finds the required sample size.' }
      ]
    },
    compute(values) {
      const { confidenceLevel, marginOfError, estimatedProportion, populationSize } = values;
      const confidence = clampConfidence(confidenceLevel);
      const alpha = 1 - confidence / 100;
      const z = normalInverseCDF(1 - alpha / 2);
      const p = Math.min(100, Math.max(0, estimatedProportion)) / 100;
      const e = Math.max(0.01, marginOfError) / 100;
      const rawSampleSizeUnadjusted = (z * z * p * (1 - p)) / (e * e);
      const applyFpc = populationSize > rawSampleSizeUnadjusted;
      const rawSampleSize = applyFpc ? rawSampleSizeUnadjusted / (1 + (rawSampleSizeUnadjusted - 1) / populationSize) : rawSampleSizeUnadjusted;
      return {
        sampleSize: Math.ceil(rawSampleSize),
        rawSampleSize,
        criticalValue: z,
        marginOfErrorPercent: e * 100,
        estimatedProportionPercent: p * 100
      };
    }
  },
  {
    id: 'p-value-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['p value calculator', 'p-value from z score calculator', 'p-value from t score calculator', 'significance calculator'],
    related: ['z-score-calculator', 'confidence-interval-calculator', 'standard-deviation-calculator', 'percentile-calculator'],
    title: 'P-Value Calculator',
    description: 'Find the p-value for a z-score or t-score, left-tailed, right-tailed or two-tailed, computed directly from the standard normal or Student\'s t distribution.',
    example: 'A z-score of 2.15 gives a two-tailed p-value of about 0.0316 — under the common 0.05 threshold, so the result would usually be called statistically significant.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What is a p-value?',
        paragraphs: [
          'A p-value answers a specific, narrow question: assuming the null hypothesis is actually true (there is no real effect or difference), how likely is it to see a test statistic at least as extreme as the one observed, just from random sampling variation alone? A small p-value means the observed result would be unusual if there really were nothing going on — which is treated as evidence against the null hypothesis, not proof that it is false.',
          'A p-value is built from a test statistic (a z-score or t-score) and a choice of how "extreme" is measured. A two-tailed test asks about extremeness in either direction and is the standard default; a one-tailed test asks only about one direction, used when the question itself is directional ("is the new process faster," not just "is it different"). The same test statistic gives three different p-values depending on which of the three is asked, which is why the tail type is not a cosmetic setting — it has to match the actual question being asked, decided before looking at the data, not chosen afterward to produce a smaller p-value.',
          'This calculator finds the cumulative probability (the CDF) of the chosen distribution directly at the test statistic, then converts it to the requested tail\'s p-value — the same arithmetic a statistical software package performs internally, shown here explicitly.'
        ]
      },
      howTo: {
        intro: 'Choose whether your test statistic is a z-score or a t-score, enter it, and pick the tail type that matches your hypothesis.',
        steps: [
          { name: 'Choose z or t', text: 'Pick a z-score when the population standard deviation is known or the sample is large; pick a t-score (and enter its degrees of freedom) for a small-sample test using a sample standard deviation — the same distinction the confidence interval calculator makes.' },
          { name: 'Enter the test statistic', text: 'The z-score or t-score from your test — this calculator does not compute it from raw data, only converts it to a p-value.' },
          { name: 'Enter degrees of freedom', text: 'Only used in t-mode: typically the sample size minus 1 for a one-sample t-test.' },
          { name: 'Choose the tail type', text: 'Two-tailed (the usual default) for "is there any difference," or left/right-tailed for a specifically directional hypothesis decided in advance.' },
          { name: 'Read the p-value', text: 'Compare it to your chosen significance threshold (commonly 0.05) — a p-value below the threshold is usually called "statistically significant" at that level.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The one-sided cumulative probability, read off in one of three ways depending on the tail type.',
        expression: 'Two-tailed: p = 2 × min(CDF, 1 − CDF)\nLeft-tailed (≤): p = CDF\nRight-tailed (≥): p = 1 − CDF',
        terms: [
          { symbol: 'CDF', meaning: 'P(statistic ≤ your test statistic), from the standard normal or Student\'s t distribution.' },
          { symbol: 'df', meaning: 'Degrees of freedom, used only for the t-distribution.' }
        ],
        note: 'A p-value is always between 0 and 1. Values close to 0 are strong evidence against the null hypothesis under the test\'s own assumptions; values close to 1 mean the data is entirely consistent with it.'
      },
      workedExample: {
        intro: 'A two-tailed z-test produces a test statistic of z = 2.15. Find the p-value.',
        rows: [
          { label: 'CDF at z = 2.15 (the cumulative probability up to 2.15)', value: '≈ 0.98422' },
          { label: '1 − CDF', value: '≈ 0.01578' },
          { label: 'Two-tailed p-value (2 × min(0.98422, 0.01578))', value: '2 × 0.01578 ≈ 0.03155' }
        ],
        result: 'p ≈ 0.0316',
        explanation: 'Since 0.0316 is below the common 0.05 significance threshold, this result would usually be reported as statistically significant at the 5% level — meaning a result this extreme would happen by chance alone less than 5% of the time if the null hypothesis were true.'
      },
      watchOut: [
        { title: 'A p-value is not the probability the null hypothesis is true', body: 'It is the probability of seeing data this extreme if the null hypothesis were true — a statement about the data given the hypothesis, not about the hypothesis given the data. These are frequently confused, even in print.' },
        { title: 'A small p-value does not mean a large or important effect', body: 'With a large enough sample, even a tiny, practically meaningless difference can produce a very small p-value. Statistical significance and real-world significance are different questions.' },
        { title: 'The tail type must be decided before seeing the data, not after', body: 'Choosing a one-tailed test (or switching between tail types) after seeing which direction the result went in artificially inflates the chance of a "significant" finding. Pick the tail type from the actual research question, in advance.' },
        { title: 'Very small p-values are shown in scientific notation, not rounded to zero', body: 'A p-value of 0.0000005742 is shown as such, not as a misleading flat 0.0000. Published results often report anything below a threshold as "p < 0.0001" rather than the exact tiny figure — both are honest; this calculator shows the real computed number.' },
        { title: 'This calculator starts from a test statistic, not raw data', body: 'It does not compute a z-score or t-score itself — use the z-score calculator, or compute a sample mean and standard deviation first, to get the test statistic this page converts into a p-value.' }
      ],
      references: [
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §7.1.3.1 Critical values and p values', url: 'https://www.itl.nist.gov/div898/handbook/prc/section1/prc131.htm' },
        { label: 'Wolfram MathWorld, P-Value', url: 'https://mathworld.wolfram.com/P-Value.html' },
        { label: 'Wolfram MathWorld, Student\'s t-Distribution', url: 'https://mathworld.wolfram.com/Studentst-Distribution.html' }
      ]
    },
    inputs: [
      {
        id: 'mode',
        label: 'What is your test statistic?',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'A z-score' },
          { value: 2, label: 'A t-score' }
        ]
      },
      { id: 'testStatistic', label: 'Test statistic', type: 'number', placeholder: '2.15', defaultValue: 2.15, step: 0.01 },
      { id: 'degreesOfFreedom', label: 'Degrees of freedom (t-score only)', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 },
      {
        id: 'tailType',
        label: 'Tail type',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Two-tailed (is there any difference?)' },
          { value: 2, label: 'Left-tailed (is it less than?)' },
          { value: 3, label: 'Right-tailed (is it greater than?)' }
        ]
      }
    ],
    breakdown: {
      headline: 'pValue',
      headlineLabel: 'P-value',
      outputs: [
        { id: 'pValue', label: 'P-value', format: 'significant' },
        { id: 'cdfValue', label: 'Cumulative probability up to this score', format: 'significant' }
      ],
      groups: [
        { inputs: ['mode', 'testStatistic', 'tailType'] },
        { title: 'Only used for a t-score', inputs: ['degreesOfFreedom'], optional: true }
      ],
      visual: {
        type: 'rangeBar',
        value: 'pValue',
        bands: [
          { label: 'Highly significant', min: 0, max: 0.01 },
          { label: 'Significant', min: 0.01, max: 0.05 },
          { label: 'Marginally significant', min: 0.05, max: 0.1 },
          { label: 'Not significant', min: 0.1, max: 1 }
        ],
        title: 'Where this p-value falls (common thresholds)',
        valueLabel: 'Your p-value'
      }
    },
    seo: {
      title: 'P-Value Calculator – From a Z-Score or T-Score',
      description: 'Free p-value calculator. Enter a z-score or t-score and choose two-tailed, left-tailed or right-tailed to find the exact p-value, computed directly from the distribution.',
      faq: [
        { question: 'How do I find a p-value from a z-score?', answer: 'Find the cumulative probability (CDF) at that z-score from the standard normal distribution, then convert it based on the tail type: two-tailed is 2 × min(CDF, 1 − CDF). For z = 2.15, two-tailed, the p-value is about 0.0316.' },
        { question: 'How do I find a p-value from a t-score?', answer: 'Same idea, using the Student\'s t distribution with your degrees of freedom (usually sample size minus 1) instead of the normal distribution. For t = 2.5 with 20 degrees of freedom, a right-tailed p-value is about 0.0106.' },
        { question: 'What is the difference between one-tailed and two-tailed?', answer: 'A two-tailed test measures how extreme a result is in either direction and is the standard default. A one-tailed test (left or right) measures extremeness in only one specific direction, used only when the research question itself is directional and decided in advance.' },
        { question: 'What p-value counts as "statistically significant"?', answer: 'There is no universal cutoff, but 0.05 is by far the most common convention: a p-value below 0.05 is typically called significant at the 5% level, below 0.01 at the 1% level. The threshold should be chosen before looking at the data, not after.' },
        { question: 'Can a p-value be exactly 0?', answer: 'In theory no — it can get extremely small (this calculator shows it in scientific notation, like 5.742 × 10⁻⁷) but mathematically never reaches exactly 0 for a finite test statistic. Many published results simply report "p < 0.0001" once it is below a practical reporting threshold.' },
        { question: 'Does a smaller p-value mean a bigger effect?', answer: 'No. A p-value measures how surprising the result would be if there were truly no effect, not the size of the effect itself. A large sample can produce a very small p-value for a practically tiny difference.' },
        { question: 'How do I get the test statistic to put into this calculator?', answer: 'Use the z-score calculator for a z-score, or compute a t-statistic from a sample mean, standard deviation and hypothesized value — this calculator converts an already-calculated test statistic into a p-value, it does not derive one from raw data.' },
        { question: 'What does the degrees of freedom field do?', answer: 'It is only used in t-score mode, where it controls the exact shape of the Student\'s t distribution — typically the sample size minus 1 for a one-sample test. It has no effect in z-score mode.' }
      ]
    },
    compute(values) {
      const { mode, testStatistic, degreesOfFreedom, tailType } = values;
      const useT = mode === 2;
      const df = Math.max(1, degreesOfFreedom);
      const cdfValue = useT ? tCDF(testStatistic, df) : normalCDF(testStatistic);
      const pValue = tailType === 2 ? cdfValue : tailType === 3 ? 1 - cdfValue : 2 * Math.min(cdfValue, 1 - cdfValue);
      return { pValue, cdfValue };
    }
  },
  {
    id: 'quartile-calculator',
    category: 'statistics',
    updatedAt: '2026-10-22',
    aliases: ['quartile calculator', 'iqr calculator', 'interquartile range calculator', 'find the quartiles calculator', 'q1 q3 calculator'],
    related: ['percentile-calculator', 'mean-median-mode-calculator', 'standard-deviation-calculator', 'average-calculator'],
    title: 'Quartile & IQR Calculator',
    description: 'Find Q1, the median (Q2), Q3, the interquartile range and Tukey\'s outlier fences for a list of up to 1,000 numbers — using the same method as this site\'s percentile calculator.',
    example: 'Eight exam scores — 60, 65, 70, 72, 78, 85, 90 and 95 — have Q1 = 66.25, a median of 75, Q3 = 88.75, and an interquartile range of 22.5, with no outliers.',
    content: {
      lastReviewed: '2026-10-22',
      concept: {
        title: 'What are quartiles and the IQR?',
        paragraphs: [
          'Quartiles split a sorted list of numbers into four equal-sized groups. Q1 (the first quartile, also the 25th percentile) marks the boundary below which the lowest quarter of the data falls; Q2 is the median, the 50th percentile; Q3 (the third quartile, the 75th percentile) marks the boundary below which the lowest three-quarters falls. Together with the minimum and maximum, these five numbers are the classic "five-number summary" of a data set.',
          'The interquartile range (IQR = Q3 − Q1) measures the spread of the middle 50% of the data — the part least affected by a few unusually high or low values. Because it ignores the top and bottom quarters entirely, the IQR is a more outlier-resistant measure of spread than the standard deviation, which is pulled around by every value, extreme ones included.',
          'This calculator finds Q1, Q2 and Q3 using exactly the same linear-interpolation method (and the same underlying calculation) as this site\'s percentile calculator, so the two pages can never silently disagree on the same data — see that page for the method\'s source and for finding any other percentile, not just the quarter-boundaries.'
        ]
      },
      howTo: {
        intro: 'Paste or type your numbers into the box.',
        steps: [
          { name: 'Paste your numbers', text: 'Paste or type your numbers, separated by commas, spaces, semicolons or new lines, in any order — up to 1,000 of them. The calculator sorts the list itself.' },
          { name: 'Check the count', text: 'Anything that isn\'t a number is dropped and listed below the box, along with the live count of numbers it understood.' },
          { name: 'Read the interquartile range', text: 'The headline is the IQR, Q3 minus Q1 — the spread of the middle half of your data.' },
          { name: 'Check Q1, the median and Q3', text: 'The rows below show all three quartile boundaries individually.' },
          { name: 'Check the outlier fences', text: 'The lower and upper fence rows mark Tukey\'s classic 1.5 × IQR outlier boundaries, plus a count of how many of your values fall outside them.' },
          { name: 'Compare the three quartiles', text: 'The chart plots Q1, the median and Q3 side by side.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Q1, Q2 and Q3 are the 25th, 50th and 75th percentiles of the sorted list (see the percentile calculator\'s formula for the full interpolation method). The IQR and outlier fences follow directly from them.',
        expression: 'IQR = Q3 − Q1\nLower fence = Q1 − 1.5 × IQR\nUpper fence = Q3 + 1.5 × IQR',
        terms: [
          { symbol: 'Q1, Q2, Q3', meaning: 'The 25th, 50th (median) and 75th percentiles of the sorted data.' },
          { symbol: 'IQR', meaning: 'The interquartile range, Q3 − Q1 — the spread of the middle 50% of the data.' }
        ],
        note: 'The 1.5 × IQR fence is a widely used convention (sometimes called Tukey\'s fences, after statistician John Tukey) for flagging a value as a likely outlier, not a strict mathematical boundary — a value just outside a fence is not automatically wrong or invalid, only unusual relative to the rest of this particular data set.'
      },
      workedExample: {
        intro: 'Eight exam scores, already sorted: 60, 65, 70, 72, 78, 85, 90, 95.',
        rows: [
          { label: 'Q1 (25th percentile)', value: '66.25' },
          { label: 'Median / Q2 (50th percentile)', value: '75' },
          { label: 'Q3 (75th percentile)', value: '88.75' },
          { label: 'IQR (88.75 − 66.25)', value: '22.5' },
          { label: 'Lower fence (66.25 − 1.5 × 22.5)', value: '32.5' },
          { label: 'Upper fence (88.75 + 1.5 × 22.5)', value: '122.5' }
        ],
        result: 'Q1 = 66.25, median = 75, Q3 = 88.75, IQR = 22.5, no outliers',
        explanation: 'Both the lowest score (60) and the highest (95) fall comfortably inside the fences (32.5 to 122.5), so none of these eight scores would be flagged as an outlier by this rule.'
      },
      watchOut: [
        { title: 'Different tools can give slightly different quartiles for the same data', body: 'Like percentiles, there are several accepted ways to interpolate a quartile that doesn\'t land exactly on a value in the list. This calculator uses the same method as the percentile calculator; Excel and some graphing calculators (TI) use a different convention and can give a slightly different answer for the same data.' },
        { title: 'The 1.5 × IQR fence is a convention, not a certainty', body: 'A value just outside the fence is flagged as statistically unusual relative to the rest of this data set, not proven to be an error or an invalid measurement. Always check what an outlier actually is before deciding what to do about it.' },
        { title: 'A single value is its own every quartile', body: 'With only one number in the list, Q1, the median and Q3 are all that same value, the IQR is 0, and both fences collapse onto it — there is nothing else for the calculation to interpolate between.' },
        { title: 'The IQR ignores the top and bottom quarters entirely', body: 'That is exactly why it resists outliers, but it also means two data sets with very different extreme values can have the same IQR if their middle halves happen to match.' },
        { title: 'Non-numeric tokens are dropped, not treated as zero', body: 'Anything pasted into the box that is not a number is silently left out of the calculation and listed under the box, up to a 1,000-number cap. A leading $, a trailing %, and thousands-separator commas (1,000) are understood and not dropped — a comma is only read as a thousands separator when something else (a space, a new line) also separates your numbers.' }
      ],
      references: [
        { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §7.2.6.2 Percentiles', url: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc262.htm' },
        { label: 'Wolfram MathWorld, Interquartile Range', url: 'https://mathworld.wolfram.com/InterquartileRange.html' }
      ]
    },
    inputs: [listInput([60, 65, 70, 72, 78, 85, 90, 95], 1)],
    breakdown: {
      headline: 'iqr',
      headlineLabel: 'Interquartile range (IQR)',
      outputs: [
        { id: 'iqr', label: 'Interquartile range (IQR)', format: 'significant' },
        { id: 'q1', label: 'Q1 (25th percentile)', format: 'significant' },
        { id: 'median', label: 'Median / Q2 (50th percentile)', format: 'significant' },
        { id: 'q3', label: 'Q3 (75th percentile)', format: 'significant' },
        { id: 'lowerFence', label: 'Lower outlier fence', format: 'significant' },
        { id: 'upperFence', label: 'Upper outlier fence', format: 'significant' },
        { id: 'outlierCount', label: 'Values outside the fences', format: 'integer' },
        { id: 'count', label: 'Count', format: 'integer' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'q1', label: 'Q1' }, { from: 'median', label: 'Median (Q2)' }, { from: 'q3', label: 'Q3' }],
        title: 'Q1, median and Q3',
        highlight: 1
      }
    },
    seo: {
      title: 'Quartile & IQR Calculator – Q1, Median, Q3, Outlier Fences',
      description: 'Free quartile calculator. Paste a list of up to 1,000 numbers to find Q1, the median, Q3, the interquartile range and Tukey\'s 1.5×IQR outlier fences.',
      faq: [
        { question: 'How do I find the quartiles of a data set?', answer: 'Sort the data, then find the 25th, 50th and 75th percentiles using linear interpolation between the closest ranked values. For 60, 65, 70, 72, 78, 85, 90, 95, that gives Q1 = 66.25, median = 75, Q3 = 88.75.' },
        { question: 'How do I calculate the interquartile range?', answer: 'Subtract Q1 from Q3: IQR = Q3 − Q1. For the worked example, 88.75 − 66.25 = 22.5.' },
        { question: 'What are the outlier fences?', answer: 'Tukey\'s classic convention: the lower fence is Q1 − 1.5 × IQR, and the upper fence is Q3 + 1.5 × IQR. A value outside these fences is flagged as a likely outlier.' },
        { question: 'Why does this use the same method as the percentile calculator?', answer: 'Q1, the median and Q3 are just the 25th, 50th and 75th percentiles, so this calculator reuses the percentile calculator\'s exact method (NIST/SEMATECH\'s linear interpolation, Hyndman & Fan\'s "type 6") rather than risking a second, disagreeing calculation of the same thing.' },
        { question: 'Why does Excel give a different answer?', answer: 'Excel\'s QUARTILE and PERCENTILE functions use a different, also standard, interpolation convention ("type 7"). Both are legitimate methods that usually agree closely but not exactly — see the percentile calculator for the full comparison.' },
        { question: 'Is a value outside the fences definitely an error?', answer: 'No. It is flagged as statistically unusual relative to the rest of this specific data set, which is a prompt to look closer, not proof that the value is wrong.' },
        { question: 'How many numbers can I enter?', answer: 'Up to 1,000. Paste or type them into the box, separated by commas, spaces, semicolons or new lines.' }
      ]
    },
    compute(values, lists) {
      const list = lists.data;
      const sorted = [...list].sort((a, b) => a - b);
      const n = sorted.length;
      const q1 = percentileOf(sorted, 25);
      const median = percentileOf(sorted, 50);
      const q3 = percentileOf(sorted, 75);
      const iqr = q3 - q1;
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;
      const outlierCount = list.filter((value) => value < lowerFence || value > upperFence).length;
      return { iqr, q1, median, q3, lowerFence, upperFence, outlierCount, count: n };
    }
  }
];
