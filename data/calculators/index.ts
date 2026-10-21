// Calculator data, one file per category. `@/data/calculators` resolves here.
// Files reached by `npm test` import `data/calculators/index.ts` (Node needs the explicit path).
import type { CalculatorCategory, CalculatorConfig } from './types.ts';
import { financeCalculators } from './finance.ts';
import { healthCalculators } from './health.ts';
import { homeCalculators } from './home.ts';
import { autoCalculators } from './auto.ts';
import { shoppingCalculators } from './shopping.ts';
import { timeCalculators } from './time.ts';
import { travelCalculators } from './travel.ts';
import { workCalculators } from './work.ts';
import { measurementsCalculators } from './measurements.ts';
import { creatorCalculators } from './creator.ts';
import { textCalculators } from './text.ts';
import { educationCalculators } from './education.ts';
import { physicsCalculators } from './physics.ts';
import { mathCalculators } from './math.ts';

export type * from './types.ts';

export const categories: CalculatorCategory[] = [
  { id: 'finance', title: 'Finance', description: 'Mortgage, loan, EMI, savings, and investment calculators.' },
  { id: 'health', title: 'Health', description: 'BMI, calories, hydration, and fitness calculators.' },
  { id: 'home', title: 'Home', description: 'Paint, tile, concrete, wallpaper, and home improvement calculators.' },
  { id: 'auto', title: 'Auto', description: 'Car payments, fuel, EV charging, tolls, and commute calculators.' },
  { id: 'shopping', title: 'Shopping & Tax', description: 'Sales tax, tipping, discounts, cashback, and unit price tools.', redirectFrom: ['taxes'] },
  { id: 'time', title: 'Time & Date', description: 'Age, date difference, work hours, sleep, and focus timers.' },
  { id: 'travel', title: 'Travel', description: 'Trip budgets, visa stay limits, currency conversion, and meeting time zones.' },
  { id: 'work', title: 'Work & Career', description: 'Salary, meeting cost, freelance rate, and PTO calculators.' },
  { id: 'measurements', title: 'Measurements', description: 'Common conversions between imperial and metric units.' },
  { id: 'creator', title: 'Creator Tools', description: 'YouTube earnings and Instagram engagement calculators for creators.', redirectFrom: ['social'] },
  { id: 'text', title: 'Text & Writing', description: 'Character counts, hashtag counts, and writing tools.' },
  { id: 'education', title: 'Education', description: 'GPA, grade, and academic calculators.' },
  { id: 'physics', title: 'Physics', description: 'Force, motion, energy, and other physics formulas solved for any variable.' },
  { id: 'math', title: 'Math', description: 'Percentages, fractions, ratios, and everyday math calculators.' }
];

// Display order for listings, the sitemap and search; the old single array's order, kept exactly.
// Append a new calculator's id here. One missing from the list still renders, sorted last.
export const calculatorOrder: string[] = [
  'mortgage-calculator',
  'loan-calculator',
  'compound-interest-calculator',
  'sales-tax-calculator',
  'tip-calculator',
  'bmi-calculator',
  'water-intake-calculator',
  'miles-to-kilometers-converter',
  'fahrenheit-to-celsius-converter',
  'pounds-to-kilograms-converter',
  'gallons-to-liters-converter',
  'car-payment-calculator',
  'gas-cost-calculator',
  'unit-price-calculator',
  'age-calculator',
  'gpa-calculator',
  'calorie-calculator',
  'paycheck-calculator',
  'investment-calculator',
  'tdee-calculator',
  'work-hours-calculator',
  'date-difference-calculator',
  'sleep-time-calculator',
  'loan-prepayment-calculator',
  'inflation-calculator',
  'travel-budget-calculator',
  'visa-stay-days-calculator',
  'salary-raise-calculator',
  'meeting-cost-calculator',
  'freelancer-rate-calculator',
  'pto-calculator',
  'ev-charging-calculator',
  'toll-cost-calculator',
  'commute-cost-calculator',
  'running-pace-calculator',
  'pregnancy-due-date-calculator',
  'paint-calculator',
  'tile-calculator',
  'concrete-calculator',
  'wallpaper-calculator',
  'furniture-fit-calculator',
  'discount-calculator',
  'cashback-calculator',
  'emi-calculator',
  'youtube-earnings-calculator',
  'instagram-engagement-calculator',
  'electricity-bill-calculator',
  'fuel-cost-calculator',
  'currency-converter',
  'character-counter',
  'hashtag-counter',
  'pomodoro-timer',
  'timezone-meeting-planner',
  'force-calculator',
  'percentage-calculator',
  'percent-change-calculator',
  'percent-difference-calculator',
  'fraction-calculator',
  'ratio-calculator',
  'average-calculator',
  'weighted-average-calculator',
  'rounding-calculator',
  'scientific-notation-calculator',
  'exponent-calculator'
];

const rank = (id: string) => {
  const index = calculatorOrder.indexOf(id);
  return index === -1 ? calculatorOrder.length : index;
};

export const calculators: CalculatorConfig[] = [
  ...financeCalculators,
  ...healthCalculators,
  ...homeCalculators,
  ...autoCalculators,
  ...shoppingCalculators,
  ...timeCalculators,
  ...travelCalculators,
  ...workCalculators,
  ...measurementsCalculators,
  ...creatorCalculators,
  ...textCalculators,
  ...educationCalculators,
  ...physicsCalculators,
  ...mathCalculators
].sort((a, b) => rank(a.id) - rank(b.id));

export function findCalculator(slug: string) {
  return calculators.find((calculator) => calculator.id === slug);
}

export function findCategoryCalculators(categoryId: string) {
  return calculators.filter((calculator) => calculator.category === categoryId);
}
