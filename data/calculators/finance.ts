import type { CalculatorConfig } from './types.ts';
import { monthlyPayment } from '../../lib/amortization.ts';

// Amortized loans (loan, mortgage, EMI). Terms are in months; `apr` is the percent number (6 = 6%).
// Each returns NaN when there is no answer.
export const loanPayment = (principal: number, months: number, apr: number) =>
  principal >= 0 ? monthlyPayment(principal, apr, months) : NaN;

export const loanPrincipal = (payment: number, months: number, apr: number) => {
  const r = apr / 100 / 12;
  if (!(months > 0) || !(payment >= 0)) return NaN;
  return r === 0 ? payment * months : (payment * (1 - (1 + r) ** -months)) / r;
};

// n = −ln(1 − P·r ÷ M) ÷ ln(1 + r). No answer when the payment does not cover the first month's interest.
export const loanMonths = (principal: number, payment: number, apr: number) => {
  const r = apr / 100 / 12;
  if (!(payment > 0) || !(principal >= 0)) return NaN;
  if (r === 0) return principal / payment;
  if (payment <= principal * r) return NaN;
  return -Math.log(1 - (principal * r) / payment) / Math.log(1 + r);
};

// Savings growth: (1 + i)^n, and the future value of 1 deposited at the end of each of n periods.
const growthFactor = (ratePercent: number, periodsPerYear: number, periods: number) => (1 + ratePercent / 100 / periodsPerYear) ** periods;
const annuityFactor = (ratePercent: number, periodsPerYear: number, periods: number) => {
  const i = ratePercent / 100 / periodsPerYear;
  return i === 0 ? periods : ((1 + i) ** periods - 1) / i;
};

// US payroll figures for 2026, indexed by filing status (0 single, 1 married filing jointly, 2 head of
// household). IRS Rev. Proc. 2025-32 (brackets, standard deduction), SSA (wage base), IRS (401(k) limit).
const PAYROLL_2026 = {
  standardDeduction: [16100, 32200, 24150],
  bracketTops: [
    [12400, 50400, 105700, 201775, 256225, 640600],
    [24800, 100800, 211400, 403550, 512450, 768700],
    [17700, 67450, 105700, 201750, 256200, 640600]
  ],
  rates: [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37],
  socialSecurityWageBase: 184500,
  additionalMedicareThreshold: [200000, 250000, 200000],
  max401k: 24500
};

const federalIncomeTax = (taxable: number, status: number) => {
  const tops = [...PAYROLL_2026.bracketTops[status], Infinity];
  let tax = 0;
  let previous = 0;
  for (let index = 0; index < tops.length && taxable > previous; index++) {
    tax += (Math.min(taxable, tops[index]) - previous) * PAYROLL_2026.rates[index];
    previous = tops[index];
  }
  return tax;
};

// IRS Publication 590-B (2025), Appendix B, Table III (Uniform Lifetime) — the table almost every
// IRA owner uses to figure a required minimum distribution. Transcribed directly from the published
// table (rmd-calculator); unchanged since the IRS's 2022 life-expectancy-table update.
const RMD_UNIFORM_LIFETIME_TABLE: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2,
  81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9,
  90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8,
  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9,
  109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1, 114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7,
  118: 2.5, 119: 2.3, 120: 2.0
};
const rmdDenominator = (age: number) => RMD_UNIFORM_LIFETIME_TABLE[Math.min(120, Math.max(72, Math.round(age)))];

// Freddie Mac, "Breaking down PMI": about $30-$70 a month per $100,000 borrowed. The midpoint, $50
// a month per $100,000, is 0.6% of the loan a year — used as the assumed PMI rate below 20% down.
const PMI_RATE_ANNUAL_PERCENT = 0.6;

// Home-affordability tiers (home-affordability-calculator): the home price that keeps a monthly
// housing payment (P&I + tax + insurance + PMI + HOA) at or under `maxHousingPayment`. `k` is the
// payment per $1 of loan (loanPayment(1, months, apr)), so the payment is linear in the loan
// amount and the price solves in closed form. PMI applies only when the resulting down payment
// would be under 20% of the price, which can change which of the two closed forms is the answer.
const affordableHomePrice = (
  maxHousingPayment: number,
  downPayment: number,
  k: number,
  taxRateMonthly: number,
  insuranceMonthly: number,
  hoaMonthly: number,
  pmiRateMonthly: number
) => {
  const noPmiPrice = (maxHousingPayment - insuranceMonthly - hoaMonthly + k * downPayment) / (k + taxRateMonthly);
  const pmiApplies = !(noPmiPrice > 0 && downPayment >= 0.2 * noPmiPrice);
  const homePrice = Math.max(
    0,
    pmiApplies
      ? (maxHousingPayment - insuranceMonthly - hoaMonthly + downPayment * (k + pmiRateMonthly)) / (k + taxRateMonthly + pmiRateMonthly)
      : noPmiPrice
  );
  const loanAmount = Math.max(0, homePrice - downPayment);
  return {
    homePrice,
    loanAmount,
    monthlyPI: k * loanAmount,
    monthlyTax: taxRateMonthly * homePrice,
    monthlyPMI: pmiApplies ? pmiRateMonthly * loanAmount : 0
  };
};

// Illustrative graduated repayment: starts at the interest-only payment and steps up by a fixed
// growth factor every `stepMonths`, solved by bisection so the balance reaches exactly 0 at
// `totalMonths` (student-loan-calculator). This is a simplified model of the *shape* studentaid.gov
// describes ("payments are lower at first and then increase, usually every two years") — it does not
// reproduce a loan servicer's exact cent-by-cent amounts or any regulatory cap on the size of each step.
const graduatedSchedule = (principal: number, apr: number, totalMonths: number, stepMonths: number) => {
  const r = apr / 100 / 12;
  const steps = totalMonths / stepMonths;
  if (r === 0) {
    const level = principal / totalMonths;
    return { initialPayment: level, finalPayment: level, totalInterest: 0 };
  }
  const initialPayment = principal * r; // interest-only first step

  const simulate = (g: number) => {
    let balance = principal;
    let payment = initialPayment;
    let totalPaid = 0;
    for (let step = 0; step < steps; step++) {
      for (let m = 0; m < stepMonths; m++) {
        balance = balance + balance * r - payment;
        totalPaid += payment;
      }
      payment *= g;
    }
    return { finalBalance: balance, totalPaid, lastPayment: payment / g };
  };

  let lo = 1;
  let hi = 10;
  while (simulate(hi).finalBalance > 0 && hi < 1e5) hi *= 2;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (simulate(mid).finalBalance > 0) lo = mid;
    else hi = mid;
  }
  const final = simulate((lo + hi) / 2);
  return { initialPayment, finalPayment: final.lastPayment, totalInterest: final.totalPaid - principal };
};

export const financeCalculators: CalculatorConfig[] = [
  {
    id: 'mortgage-calculator',
    group: 'Mortgages & Loans',
    category: 'finance',
    glyph: 'M',
    updatedAt: '2026-10-19',
    aliases: ['home loan calculator', 'house payment calculator', 'mortgage payment calculator', 'home loan emi calculator', 'house loan emi calculator', 'monthly mortgage estimator'],
    related: ['loan-calculator', 'emi-calculator', 'loan-prepayment-calculator', 'car-payment-calculator'],
    redirectFrom: ['home-loan-calculator', 'house-loan-emi-calculator'],
    title: 'Mortgage Calculator',
    description: 'Find the monthly principal-and-interest payment on a home loan, or work backward to the home price, term or rate that fits your budget, with total interest and a year-by-year schedule.',
    example: 'A $350,000 home with $70,000 (20%) down and a 30-year loan at 5% APR costs about $1,503.10 a month in principal and interest.',
    solver: {
      defaultTarget: 'monthlyPayment',
      variables: [
        { id: 'monthlyPayment', label: 'Monthly payment (P&I)', symbol: 'M', dimension: 'currency', defaultValue: 1503.1, defaultUnit: 'currency' },
        { id: 'homePrice', label: 'Home price', symbol: 'H', dimension: 'currency', defaultValue: 350000, defaultUnit: 'currency' },
        { id: 'downPayment', label: 'Down payment', symbol: 'D', dimension: 'currency', defaultValue: 70000, defaultUnit: 'currency', fixed: true },
        { id: 'term', label: 'Loan term', symbol: 'n', dimension: 'term', defaultValue: 30, defaultUnit: 'yr' },
        { id: 'interestRate', label: 'Interest rate (APR)', symbol: 'APR', dimension: 'percent', defaultValue: 5, defaultUnit: '%', bounds: [0, 100] }
      ],
      solve: {
        monthlyPayment: ({ homePrice, downPayment, term, interestRate }) => loanPayment(homePrice - downPayment, term, interestRate),
        homePrice: ({ monthlyPayment: payment, downPayment, term, interestRate }) => downPayment + loanPrincipal(payment, term, interestRate),
        term: ({ homePrice, downPayment, monthlyPayment: payment, interestRate }) => loanMonths(homePrice - downPayment, payment, interestRate)
      },
      // The rate has no closed form: the widget finds it numerically.
      equation: (si) => si.monthlyPayment - loanPayment(si.homePrice - si.downPayment, si.term, si.interestRate),
      outputs: [
        { id: 'loanAmount', label: 'Loan amount', dimension: 'currency', compute: (si) => si.homePrice - si.downPayment },
        { id: 'totalInterest', label: 'Total interest', dimension: 'currency', compute: (si) => si.monthlyPayment * si.term - (si.homePrice - si.downPayment) },
        { id: 'totalPaid', label: 'Total of all payments', dimension: 'currency', compute: (si) => si.monthlyPayment * si.term }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [{ from: 'loanAmount', label: 'Principal' }, { from: 'totalInterest', label: 'Interest' }],
          center: 'totalPaid',
          centerSub: 'total paid'
        },
        { type: 'amortization', principal: 'loanAmount', annualRate: 'interestRate', months: 'term', payment: 'monthlyPayment' }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'How a mortgage payment works',
        paragraphs: [
          'A fixed-rate mortgage is an amortized loan: you borrow the home price minus your down payment and repay it in equal monthly installments over 15, 20 or 30 years. Each payment first covers the interest on the balance that month, and the remainder pays down the loan. Early on most of the payment is interest; by the final years almost all of it is principal.',
          'This calculator gives the principal-and-interest part of the payment (often written P&I). The check you actually send your servicer is usually higher, because property tax, homeowners insurance and any mortgage insurance are commonly collected through an escrow account and added on top. Your Loan Estimate lists each of those pieces separately.',
          'The same equation works backward. If you know the payment you can afford, the calculator finds the home price it supports for your down payment, rate and term, or the rate you would need to make a given price work.'
        ]
      },
      howTo: {
        intro: 'Enter your down payment, then fill in any three of the other four fields. The remaining one, marked auto, is calculated.',
        steps: [
          { name: 'Enter the down payment', text: 'The down payment is always an input. The loan amount is the home price minus the down payment.' },
          { name: 'Fill in three of the rest', text: 'Type the home price, the term and the interest rate, and the monthly payment is calculated. Switch the term between years and months with the menu beside it.' },
          { name: 'Work backward from a budget', text: 'Type the monthly payment you can afford. The field you have left alone longest becomes the calculated one, so leave the home price alone to see the price your budget supports.' },
          { name: 'Read the breakdown', text: 'Below the result you get the loan amount, total interest and total of all payments, a principal-against-interest chart and the year-by-year schedule.' },
          { name: 'Add the extras yourself', text: 'Add your expected monthly property tax, insurance and any mortgage insurance to the result to estimate the full housing payment.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The payment is the standard annuity formula applied to the loan amount, the home price minus the down payment.',
        expression: 'P = H − D\nM = P × r ÷ (1 − (1 + r)^−n)\nH = D + M × (1 − (1 + r)^−n) ÷ r\nn = −ln(1 − P × r ÷ M) ÷ ln(1 + r)',
        terms: [
          { symbol: 'M', meaning: 'Monthly principal-and-interest payment.' },
          { symbol: 'H', meaning: 'Home price (purchase price).' },
          { symbol: 'D', meaning: 'Down payment.' },
          { symbol: 'P', meaning: 'Loan amount, H − D.' },
          { symbol: 'r', meaning: 'Monthly rate: the annual rate ÷ 12, as a decimal. 5% is 0.0041667.' },
          { symbol: 'n', meaning: 'Number of monthly payments: 360 for a 30-year loan.' }
        ],
        note: 'Estimates only. Property tax, homeowners insurance, mortgage insurance, HOA dues and closing costs are not included. Your Loan Estimate and Closing Disclosure are the binding figures.'
      },
      workedExample: {
        intro: 'You buy a $350,000 home with a $70,000 down payment (20%) and take a 30-year fixed mortgage at 5%. What is the monthly principal-and-interest payment?',
        rows: [
          { label: 'Loan amount (P = 350,000 − 70,000)', value: '$280,000' },
          { label: 'Monthly rate (r = 5% ÷ 12)', value: '0.0041667' },
          { label: 'Number of payments (n = 30 × 12)', value: '360' },
          { label: '(1 + r)^n', value: '4.46774' },
          { label: '1 − (1 + r)^−n', value: '0.776173' },
          { label: 'M = 280,000 × 0.0041667 ÷ 0.776173', value: '$1,503.10' },
          { label: 'Total of 360 payments', value: '≈ $541,116' },
          { label: 'Total interest (541,116 − 280,000)', value: '≈ $261,116' }
        ],
        result: 'M ≈ $1,503.10 a month (principal and interest)',
        explanation: 'The first payment includes $1,166.67 of interest (280,000 × 0.0041667) and only $336.43 of principal. Over the first year you pay about $13,906 in interest and $4,131 in principal, leaving about $275,869 owed. Over the full 30 years the interest comes to almost as much as the loan itself.'
      },
      watchOut: [
        { title: 'Estimates only: this is not your full payment', body: 'The result is principal and interest. Property tax, homeowners insurance and mortgage insurance are usually added through escrow, and they can add hundreds of dollars a month.' },
        { title: 'Less than 20% down usually means mortgage insurance', body: 'On a conventional loan, a down payment under 20% of the price typically requires private mortgage insurance until you build enough equity. FHA loans carry their own mortgage insurance premium.' },
        { title: 'Small rate changes add up', body: 'On a $280,000, 30-year loan, going from 5% to 5.5% adds about $86.71 a month, or about $31,215 over the life of the loan.' },
        { title: 'Shorter terms save interest', body: 'The same loan over 15 years costs about $2,214.22 a month but only about $118,560 in interest, less than half the 30-year total.' },
        { title: 'Adjustable rates', body: 'For an adjustable-rate mortgage this shows the payment for the initial rate only. Check the payment caps and the worst-case payment on your Loan Estimate.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, Loan Estimate Explainer', url: 'https://www.consumerfinance.gov/owning-a-home/loan-estimate/' },
        { label: 'Consumer Financial Protection Bureau, What is private mortgage insurance?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-private-mortgage-insurance-en-122/' },
        { label: 'Freddie Mac, Primary Mortgage Market Survey (weekly average 30- and 15-year rates)', url: 'https://www.freddiemac.com/pmms' },
        { label: 'OpenStax, Contemporary Mathematics, §6.12 Renting and Homeownership', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-12-renting-and-homeownership' }
      ]
    },
    inputs: [
      { id: 'loanAmount', label: 'Home price', type: 'currency', placeholder: '350000', defaultValue: 350000, step: 1000, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.01, min: 0 },
      { id: 'years', label: 'Loan term (years)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '70000', defaultValue: 70000, step: 500, min: 0 }
    ],
    seo: {
      title: 'Mortgage Calculator – Monthly Payment & Home Price',
      description: 'Free mortgage calculator: monthly principal-and-interest payment, or the home price, term or rate that fits your budget, with total interest and a schedule.',
      faq: [
        { question: 'How do I calculate my mortgage payment?', answer: 'Subtract the down payment from the home price to get the loan amount, then apply M = P × r ÷ (1 − (1 + r)^−n). A $280,000 loan at 5% for 30 years comes to about $1,503.10 a month in principal and interest.' },
        { question: 'Does the payment include taxes and insurance?', answer: 'No. It is principal and interest only. Property tax, homeowners insurance and any mortgage insurance are usually collected through escrow on top of it, and your Loan Estimate shows each of them.' },
        { question: 'How much house can I afford for a given payment?', answer: 'Enter the payment you can afford, your down payment, the rate and the term, and the home price is calculated. $2,000 a month at 6.5% over 30 years with $70,000 down supports a price of about $386,422, before taxes and insurance.' },
        { question: 'Is a 15-year or 30-year mortgage better?', answer: 'A 15-year loan costs more each month but far less overall. On $280,000 at 5%, the 15-year payment is about $2,214 with about $118,560 of interest; the 30-year payment is about $1,503 with about $261,116 of interest. Rates on 15-year loans are also usually lower.' },
        { question: 'How much does a higher interest rate cost?', answer: 'On a $280,000, 30-year loan, each half point matters: 5% costs about $1,503.10 a month and 5.5% about $1,589.81, a difference of about $86.71 a month.' },
        { question: 'Do I need 20% down?', answer: 'No, but on a conventional loan a down payment below 20% usually requires private mortgage insurance, which raises the monthly cost until you build enough equity.' },
        { question: 'Why is so much of my early payment interest?', answer: 'Interest is charged on the balance still owed, which is largest at the start. In the first month of a $280,000 loan at 5%, $1,166.67 of the $1,503.10 payment is interest.' }
      ]
    },
    compute(values) {
      const principal = Math.max(0, values.loanAmount - values.downPayment);
      const monthlyRate = values.interestRate / 100 / 12;
      const months = Math.max(1, values.years * 12);
      const payment = monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const total = payment * months;
      const interest = total - principal;
      return { monthlyPayment: payment, totalCost: total, totalInterest: interest, loanPrincipal: principal };
    }
  },
  {
    id: 'loan-calculator',
    group: 'Mortgages & Loans',
    category: 'finance',
    glyph: 'L',
    updatedAt: '2026-10-19',
    aliases: ['personal loan calculator', 'monthly payment calculator', 'loan repayment calculator', 'installment calculator', 'borrowing cost calculator'],
    related: ['mortgage-calculator', 'emi-calculator', 'car-payment-calculator', 'loan-prepayment-calculator'],
    title: 'Loan Calculator',
    description: 'Work out the monthly payment, loan amount, term or interest rate of a fixed-rate loan. Fill in any three and the fourth is calculated, with the total interest and a year-by-year schedule.',
    example: 'A $20,000 loan at 6% APR over 5 years costs about $386.66 a month, or about $3,199 in interest over the life of the loan.',
    solver: {
      defaultTarget: 'monthlyPayment',
      variables: [
        { id: 'monthlyPayment', label: 'Monthly payment', symbol: 'M', dimension: 'currency', defaultValue: 386.66, defaultUnit: 'currency' },
        { id: 'loanAmount', label: 'Loan amount', symbol: 'P', dimension: 'currency', defaultValue: 20000, defaultUnit: 'currency' },
        { id: 'term', label: 'Loan term', symbol: 'n', dimension: 'term', defaultValue: 5, defaultUnit: 'yr' },
        { id: 'interestRate', label: 'Interest rate (APR)', symbol: 'APR', dimension: 'percent', defaultValue: 6, defaultUnit: '%', bounds: [0, 100] }
      ],
      solve: {
        monthlyPayment: ({ loanAmount, term, interestRate }) => loanPayment(loanAmount, term, interestRate),
        loanAmount: ({ monthlyPayment: payment, term, interestRate }) => loanPrincipal(payment, term, interestRate),
        term: ({ loanAmount, monthlyPayment: payment, interestRate }) => loanMonths(loanAmount, payment, interestRate)
      },
      // The rate has no closed form: the widget finds it numerically.
      equation: (si) => si.monthlyPayment - loanPayment(si.loanAmount, si.term, si.interestRate),
      outputs: [
        { id: 'totalInterest', label: 'Total interest', dimension: 'currency', compute: (si) => si.monthlyPayment * si.term - si.loanAmount },
        { id: 'totalPaid', label: 'Total of all payments', dimension: 'currency', compute: (si) => si.monthlyPayment * si.term }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [{ from: 'loanAmount', label: 'Principal' }, { from: 'totalInterest', label: 'Interest' }],
          center: 'totalPaid',
          centerSub: 'total paid'
        },
        { type: 'amortization', principal: 'loanAmount', annualRate: 'interestRate', months: 'term', payment: 'monthlyPayment' }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'What is an amortized loan?',
        paragraphs: [
          'Most personal loans, auto loans and mortgages are amortized: you repay them in equal monthly payments, and each payment covers that month\'s interest first, with the rest paying down the balance. Because the balance shrinks every month, the interest part of the payment shrinks too, and more of each payment goes to principal as the loan ages.',
          'Four numbers describe such a loan: the amount borrowed (the principal), the annual interest rate, the term in months and the monthly payment. Fix any three and the fourth is determined. That is why this calculator has no "solve for" switch: whichever field you have left alone longest is the one it calculates.',
          'The rate US lenders must disclose is the annual percentage rate (APR), defined by the Truth in Lending Act and its Regulation Z. The APR folds certain fees into the rate, so it can be a little higher than the note rate that sets your payment. APR is the fairer number for comparing offers; the note rate from your loan documents is the one to use when checking a payment.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the four fields. The fourth, marked auto, is calculated as you type.',
        steps: [
          { name: 'Enter what you know', text: 'Type the loan amount, the interest rate and the term, and the monthly payment is calculated. Switch the term between years and months with the menu beside it.' },
          { name: 'Solve for something else', text: 'Type into the auto field to make it an input. The field you have left alone longest becomes the calculated one, so entering a payment you can afford tells you how much you can borrow.' },
          { name: 'Find a rate', text: 'Type a payment, an amount and a term so that the rate is the field left alone longest. The calculator then searches for the interest rate that produces that payment.' },
          { name: 'Read the breakdown', text: 'Under the result you get the total interest and the total of all payments, a chart of principal against interest and a year-by-year schedule.' },
          { name: 'Share or copy', text: 'Share result copies a link that reopens the calculator with your numbers. Copy result copies the answer as text.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The level payment that repays a principal P over n months at a monthly rate r is the standard annuity formula. Rearranging it gives the loan amount and the term. The rate has no closed form, so it is found numerically.',
        expression: 'M = P × r ÷ (1 − (1 + r)^−n)\nP = M × (1 − (1 + r)^−n) ÷ r\nn = −ln(1 − P × r ÷ M) ÷ ln(1 + r)\nr = APR ÷ 100 ÷ 12',
        terms: [
          { symbol: 'M', meaning: 'Monthly payment of principal and interest.' },
          { symbol: 'P', meaning: 'Principal: the amount borrowed.' },
          { symbol: 'n', meaning: 'Term in months (5 years = 60).' },
          { symbol: 'r', meaning: 'Monthly interest rate: the annual rate divided by 12, as a decimal. 6% APR is 0.005 a month.' },
          { symbol: 'APR', meaning: 'Annual percentage rate. At 0%, the payment is simply P ÷ n.' }
        ],
        note: 'Estimates only. Real loans can add origination fees, insurance or a different day-count convention, and your lender\'s disclosure is the binding figure.'
      },
      workedExample: {
        intro: 'You borrow $20,000 at 6% APR for 5 years. What is the monthly payment, and how much interest do you pay in total?',
        rows: [
          { label: 'Monthly rate (r = 6% ÷ 12)', value: '0.005' },
          { label: 'Number of payments (n = 5 × 12)', value: '60' },
          { label: '(1 + r)^n = 1.005^60', value: '1.34885' },
          { label: '1 − (1 + r)^−n', value: '0.258628' },
          { label: 'M = 20,000 × 0.005 ÷ 0.258628', value: '$386.66' },
          { label: 'Total paid (386.66 × 60)', value: '≈ $23,199' },
          { label: 'Total interest (23,199 − 20,000)', value: '≈ $3,199' }
        ],
        result: 'M ≈ $386.66 a month · about $3,199 in interest',
        explanation: 'In the first month, interest is 20,000 × 0.005 = $100, so $286.66 of the payment reduces the balance. By the end of year one you have paid about $1,104 of interest and $3,536 of principal, leaving a balance of about $16,464. The interest share keeps falling every month after that.'
      },
      watchOut: [
        { title: 'Estimates only', body: 'The result assumes a fixed rate, equal monthly payments and no fees. Your lender\'s Truth in Lending disclosure shows the real payment and APR.' },
        { title: 'APR versus note rate', body: 'APR includes some fees, so it is usually a little higher than the rate that sets your payment. Use the note rate to check a payment and APR to compare lenders.' },
        { title: 'A longer term costs more', body: 'Stretching the same $20,000 at 6% from 3 to 6 years cuts the payment from about $608 to $331, but roughly doubles the interest, from about $1,904 to $3,865.' },
        { title: 'Variable rates change the answer', body: 'For an adjustable-rate loan this shows the payment only while the starting rate lasts. Run it again with the new rate after each reset.' }
      ],
      references: [
        { label: 'OpenStax, Contemporary Mathematics, §6.8 The Basics of Loans', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans' },
        { label: 'Consumer Financial Protection Bureau, Regulation Z (Truth in Lending), Appendix J: Annual Percentage Rate Computations for Closed-End Credit Transactions', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/j/' },
        { label: 'Federal Reserve, Consumer Credit G.19 release (interest rates on personal and auto loans)', url: 'https://www.federalreserve.gov/releases/g19/current/default.htm' }
      ]
    },
    inputs: [
      { id: 'loanAmount', label: 'Loan amount', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 100, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.01, min: 0 },
      { id: 'years', label: 'Loan term (years)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 }
    ],
    seo: {
      title: 'Loan Calculator – Payment, Amount, Term or Rate',
      description: 'Free loan calculator: find the monthly payment, loan amount, term or interest rate of a fixed-rate loan, with total interest and an amortization schedule.',
      faq: [
        { question: 'How is a monthly loan payment calculated?', answer: 'With the annuity formula M = P × r ÷ (1 − (1 + r)^−n), where r is the annual rate divided by 12 and n is the number of months. A $20,000 loan at 6% over 60 months comes to about $386.66 a month.' },
        { question: 'How much can I borrow for a given monthly payment?', answer: 'Enter the payment, the rate and the term, and the loan amount is calculated: P = M × (1 − (1 + r)^−n) ÷ r. At 6% over 5 years, $450 a month supports a loan of about $23,277.' },
        { question: 'How do I find the interest rate on a loan?', answer: 'Enter the loan amount, the term and the payment you were quoted. There is no direct formula for the rate, so the calculator searches for it. A $20,000, 60-month loan with a $400 payment works out to about 7.42% APR.' },
        { question: 'How long will it take to pay off a loan?', answer: 'Enter the amount, rate and payment and the term is calculated. $20,000 at 6% paid at $500 a month takes about 44.7 months, with about $2,370 in total interest.' },
        { question: 'Is a shorter loan term better?', answer: 'It costs less in total but more each month. The same $20,000 at 6% costs about $608 a month and $1,904 in interest over 3 years, against about $331 a month and $3,865 in interest over 6 years.' },
        { question: 'What happens at a 0% interest rate?', answer: 'The payment is simply the loan amount divided by the number of months: $20,000 over 60 months is $333.33 a month, with no interest.' },
        { question: 'Can I use this for personal, auto or student loans?', answer: 'Yes, for any fixed-rate loan repaid in equal monthly payments. It is an estimate: fees, insurance and payment timing in your loan agreement can change the exact figures.' }
      ]
    },
    compute(values) {
      const monthlyRate = values.interestRate / 100 / 12;
      const months = Math.max(1, values.years * 12);
      const payment = monthlyRate === 0
        ? values.loanAmount / months
        : (values.loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const total = payment * months;
      const interest = total - values.loanAmount;
      return { monthlyPayment: payment, totalCost: total, totalInterest: interest };
    }
  },
  {
    id: 'compound-interest-calculator',
    group: 'Savings & Growth',
    category: 'finance',
    glyph: 'FV',
    updatedAt: '2026-10-19',
    aliases: ['interest growth calculator', 'savings growth calculator', 'future value calculator', 'compounding calculator'],
    related: ['investment-calculator', 'inflation-calculator', 'loan-prepayment-calculator', 'salary-raise-calculator'],
    title: 'Compound Interest Calculator',
    description: 'See how savings grow with monthly compounding and regular deposits, or work back to the starting balance, years or interest rate you need to reach a goal.',
    example: '$5,000 at 4% a year, compounded monthly, with $200 added every month grows to about $36,904 in 10 years, including about $7,904 of interest.',
    solver: {
      defaultTarget: 'futureValue',
      variables: [
        { id: 'futureValue', label: 'Future value', symbol: 'FV', dimension: 'currency', defaultValue: 36904.12, defaultUnit: 'currency' },
        { id: 'principal', label: 'Starting balance', symbol: 'P', dimension: 'currency', defaultValue: 5000, defaultUnit: 'currency' },
        { id: 'monthlyContribution', label: 'Monthly contribution', symbol: 'C', dimension: 'currency', defaultValue: 200, defaultUnit: 'currency', fixed: true },
        { id: 'years', label: 'Time', symbol: 't', dimension: 'term', defaultValue: 10, defaultUnit: 'yr', bounds: [0, 1200] },
        { id: 'annualRate', label: 'Annual interest rate', symbol: 'r', dimension: 'percent', defaultValue: 4, defaultUnit: '%', bounds: [0, 100] }
      ],
      // `years` arrives in months (the term dimension's base); compounding is monthly.
      solve: {
        futureValue: ({ principal, monthlyContribution, years, annualRate }) =>
          years >= 0 ? principal * growthFactor(annualRate, 12, years) + monthlyContribution * annuityFactor(annualRate, 12, years) : NaN,
        principal: ({ futureValue, monthlyContribution, years, annualRate }) => {
          const start = (futureValue - monthlyContribution * annuityFactor(annualRate, 12, years)) / growthFactor(annualRate, 12, years);
          return years >= 0 && start >= 0 ? start : NaN;
        },
        years: ({ futureValue, principal, monthlyContribution, annualRate }) => {
          const i = annualRate / 100 / 12;
          if (i === 0) return monthlyContribution > 0 ? (futureValue - principal) / monthlyContribution : NaN;
          const months = Math.log((futureValue * i + monthlyContribution) / (principal * i + monthlyContribution)) / Math.log(1 + i);
          return months >= 0 ? months : NaN;
        }
      },
      // The rate has no closed form when there are contributions: the widget finds it numerically.
      equation: (si) =>
        si.futureValue - (si.principal * growthFactor(si.annualRate, 12, si.years) + si.monthlyContribution * annuityFactor(si.annualRate, 12, si.years)),
      outputs: [
        { id: 'totalContributions', label: 'Total contributions', dimension: 'currency', compute: (si) => si.monthlyContribution * si.years },
        { id: 'totalInterest', label: 'Interest earned', dimension: 'currency', compute: (si) => si.futureValue - si.principal - si.monthlyContribution * si.years }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'principal', label: 'Starting balance' },
            { from: 'totalContributions', label: 'Contributions' },
            { from: 'totalInterest', label: 'Interest' }
          ],
          center: 'futureValue',
          centerSub: 'future value'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'What is compound interest?',
        paragraphs: [
          'Compound interest is interest earned on interest. Each time interest is credited to an account it joins the balance, and the next round of interest is calculated on the larger amount. Simple interest, by contrast, is only ever paid on the original deposit.',
          'How often interest is credited matters. Savings accounts and certificates of deposit in the US usually compound daily or monthly, and banks advertise the annual percentage yield (APY), which already includes the effect of compounding. A 4% rate compounded monthly is an APY of about 4.07%. This calculator compounds monthly and adds your contribution at the end of each month, which matches how most people save.',
          'Time does most of the work. The growth factor (1 + r/12)^(12t) rises faster every year, so the last few years of a long plan add more interest than the first few. At 4% a year compounded monthly, money doubles in about 17.4 years; the Rule of 72 (72 ÷ 4 = 18 years) is a quick mental check.'
        ]
      },
      howTo: {
        intro: 'Enter your monthly contribution (0 if you only make one deposit), then any three of the other four fields. The fourth, marked auto, is calculated.',
        steps: [
          { name: 'Enter the monthly contribution', text: 'This is always an input. Use 0 for a single lump sum.' },
          { name: 'Find the future value', text: 'Type the starting balance, the time and the annual rate. The future value is calculated, with the contributions and interest broken out below.' },
          { name: 'Plan for a goal', text: 'Type a target into the future value field. Leave the time alone and it tells you how long the goal takes; leave the starting balance alone and it tells you how much to start with.' },
          { name: 'Find the rate you need', text: 'With the future value, start, time and contributions filled in, leaving the rate alone longest makes the calculator search for the rate that reaches your goal.' },
          { name: 'Switch years and months', text: 'Use the menu beside the time field to enter it in months instead of years.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The future value is the starting balance grown for n months, plus the future value of a deposit made at the end of every month.',
        expression: 'FV = P × (1 + i)^n + C × ((1 + i)^n − 1) ÷ i\ni = r ÷ 100 ÷ 12,  n = 12 × t\nn = ln((FV × i + C) ÷ (P × i + C)) ÷ ln(1 + i)',
        terms: [
          { symbol: 'FV', meaning: 'Future value: the balance at the end.' },
          { symbol: 'P', meaning: 'Starting balance (principal).' },
          { symbol: 'C', meaning: 'Contribution added at the end of each month.' },
          { symbol: 'r', meaning: 'Annual interest rate, as a percent.' },
          { symbol: 'i', meaning: 'Monthly rate as a decimal: 4% a year is 0.0033333.' },
          { symbol: 't, n', meaning: 'Time in years, and the number of months (n = 12t). With i = 0 the contribution term is just C × n.' }
        ],
        note: 'Estimates only. Real accounts can compound daily, rates change over time, and taxes and fees reduce growth. This is not financial advice.'
      },
      workedExample: {
        intro: 'You open a savings account with $5,000 at 4% a year, compounded monthly, and add $200 at the end of every month for 10 years. How much will you have?',
        rows: [
          { label: 'Monthly rate (i = 4% ÷ 12)', value: '0.0033333' },
          { label: 'Months (n = 10 × 12)', value: '120' },
          { label: 'Growth factor (1 + i)^120', value: '1.490833' },
          { label: 'Starting balance grown (5,000 × 1.490833)', value: '$7,454.16' },
          { label: 'Contributions grown (200 × 0.490833 ÷ 0.0033333)', value: '$29,449.96' },
          { label: 'Future value', value: '$36,904.12' },
          { label: 'Total contributions (200 × 120)', value: '$24,000' },
          { label: 'Interest earned (36,904.12 − 5,000 − 24,000)', value: '$7,904.12' }
        ],
        result: 'FV ≈ $36,904 after 10 years, of which about $7,904 is interest',
        explanation: 'The $5,000 on its own grows by about $2,454. Most of the interest comes from the contributions: each $200 deposit compounds from the month it is made, so the 120 deposits of $24,000 grow to about $29,450.'
      },
      watchOut: [
        { title: 'Estimates only', body: 'Rates on savings accounts change, and investment returns are not guaranteed. Treat the result as a projection, not a promise.' },
        { title: 'Rate versus APY', body: 'Banks advertise APY, which already includes compounding. Entering an APY here, where it is compounded again monthly, slightly overstates growth. Use the stated interest rate if you know it.' },
        { title: 'Taxes and inflation', body: 'Interest in a regular US savings account is taxable each year, and inflation erodes what the final balance buys. Check the result in today\'s dollars with the inflation calculator.' },
        { title: 'Contribution timing', body: 'Deposits here are made at the end of each month. Depositing at the start of the month adds one extra month of interest on every deposit.' }
      ],
      references: [
        { label: 'OpenStax, Contemporary Mathematics, §6.4 Compound Interest', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest' },
        { label: 'U.S. Securities and Exchange Commission, Investor.gov glossary: Compound interest', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest' },
        { label: 'U.S. Securities and Exchange Commission, Investor.gov glossary: Rule of 72', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/rule-72' }
      ]
    },
    inputs: [
      { id: 'principal', label: 'Starting balance', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 100, min: 0 },
      { id: 'annualRate', label: 'Annual interest rate', type: 'percent', placeholder: '4', defaultValue: 4, step: 0.01, min: 0 },
      { id: 'years', label: 'Years invested', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'monthlyContribution', label: 'Monthly contribution', type: 'currency', placeholder: '200', defaultValue: 200, step: 10, min: 0 }
    ],
    seo: {
      title: 'Compound Interest Calculator – With Monthly Deposits',
      description: 'Free compound interest calculator with monthly contributions. Find the future value, or the starting balance, time or rate you need to reach a savings goal.',
      faq: [
        { question: 'What is compound interest?', answer: 'Interest that is added to the balance and then earns interest itself. Over long periods it grows much faster than simple interest, which is paid only on the original deposit.' },
        { question: 'How is compound interest with monthly contributions calculated?', answer: 'FV = P × (1 + i)^n + C × ((1 + i)^n − 1) ÷ i, with i the monthly rate and n the number of months. $5,000 at 4% plus $200 a month for 10 years comes to about $36,904.' },
        { question: 'How long will it take to reach my savings goal?', answer: 'Enter the goal as the future value and the calculator works out the time. Starting with $5,000 and adding $200 a month at 4%, $50,000 takes about 13.2 years.' },
        { question: 'What interest rate do I need to reach a goal?', answer: 'Fill in the goal, the start, the contribution and the time, and the calculator searches for the rate. To turn $5,000 plus $200 a month into $40,000 in 10 years you need about 5.28% a year.' },
        { question: 'How long does it take money to double?', answer: 'At 4% a year compounded monthly, about 17.4 years. The Rule of 72 gives a quick estimate: 72 divided by the rate, so 18 years at 4%.' },
        { question: 'What is the difference between APR and APY?', answer: 'APY includes the effect of compounding over a year, so it is higher than the stated rate when interest compounds more than once a year. 4% compounded monthly is an APY of about 4.07%.' },
        { question: 'Does compounding frequency matter much?', answer: 'Somewhat. $5,000 for 10 years at 4% grows to about $7,454 compounded monthly and about $7,401 compounded once a year. The rate and the time matter far more.' }
      ]
    },
    compute(values) {
      const monthlyRate = values.annualRate / 100 / 12;
      const months = Math.max(0, values.years * 12);
      const compoundPrincipal = values.principal * Math.pow(1 + monthlyRate, months);
      const contributionTotal = values.monthlyContribution * months;
      // At a 0% rate the contributions simply add up (the annuity factor's 0 ÷ 0 limit is n).
      const futureValue = compoundPrincipal + values.monthlyContribution * annuityFactor(values.annualRate, 12, months);
      const totalInterest = futureValue - values.principal - contributionTotal;
      return { futureValue, totalInterest, contributionTotal };
    }
  },
  {
    id: 'paycheck-calculator',
    group: 'Income & Pay',
    category: 'finance',
    glyph: '$',
    updatedAt: '2026-10-19',
    aliases: ['take home pay calculator', 'net salary calculator', 'after tax pay calculator', 'salary paycheck estimator'],
    related: ['salary-raise-calculator', 'work-hours-calculator', 'freelancer-rate-calculator', 'pto-calculator'],
    title: 'Paycheck Calculator',
    description: 'Estimate your US take-home pay per paycheck with 2026 federal income tax brackets, Social Security, Medicare, state and local tax, and pre-tax and post-tax deductions.',
    example: 'A single filer earning $60,000 a year, paid every two weeks, with 5% state tax, 5% to a traditional 401(k) and $100 of pre-tax health premiums per paycheck takes home about $1,651.57 per paycheck.',
    breakdown: {
      headline: 'netPay',
      headlineLabel: 'Take-home pay per paycheck',
      outputs: [
        { id: 'netPay', label: 'Take-home pay', format: 'currency' },
        { id: 'grossPay', label: 'Gross pay', format: 'currency' },
        { id: 'federalTax', label: 'Federal income tax', format: 'currency' },
        { id: 'socialSecurity', label: 'Social Security (6.2%)', format: 'currency' },
        { id: 'medicare', label: 'Medicare', format: 'currency' },
        { id: 'stateTax', label: 'State income tax', format: 'currency' },
        { id: 'localTax', label: 'Local income tax', format: 'currency' },
        { id: 'retirement', label: 'Traditional 401(k)', format: 'currency' },
        { id: 'preTaxDeductions', label: 'Other pre-tax deductions', format: 'currency' },
        { id: 'postTaxDeductions', label: 'Post-tax deductions', format: 'currency' },
        { id: 'annualNetPay', label: 'Take-home pay per year', format: 'currency' }
      ],
      groups: [
        { title: 'Your pay', inputs: ['annualSalary', 'payPeriodsPerYear', 'filingStatus'] },
        { title: 'State and local tax', inputs: ['stateTaxRate', 'localTaxRate'] },
        { title: 'Deductions', inputs: ['retirementPercent', 'preTaxPerPeriod', 'postTaxPerPeriod'] }
      ],
      derive: (values) => ({
        fica: values.socialSecurity + values.medicare,
        stateAndLocal: values.stateTax + values.localTax,
        deductions: values.retirement + values.preTaxDeductions + values.postTaxDeductions
      }),
      visual: {
        type: 'donut',
        segments: [
          { from: 'netPay', label: 'Take-home pay' },
          { from: 'federalTax', label: 'Federal income tax' },
          { from: 'fica', label: 'Social Security and Medicare' },
          { from: 'stateAndLocal', label: 'State and local tax' },
          { from: 'deductions', label: 'Deductions' }
        ],
        center: 'grossPay',
        centerSub: 'gross per paycheck'
      }
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'Where your paycheck goes',
        paragraphs: [
          'Your gross pay is your salary divided by the number of paychecks in the year. Before it reaches your bank account, your employer withholds federal income tax, Social Security and Medicare (together called FICA), usually state income tax and sometimes a city or county tax, plus any benefits you have signed up for. What is left is your net, or take-home, pay.',
          'Federal income tax is progressive. You subtract the standard deduction ($16,100 for a single filer in 2026) and any pre-tax deductions from your salary, then each slice of the remaining taxable income is taxed at its own rate, from 10% up to 37%. Moving into a higher bracket only raises the rate on the dollars inside that bracket, never on all of your income.',
          'Deductions come in two kinds. Pre-tax deductions, such as a traditional 401(k), and health, dental, HSA and FSA contributions made through a cafeteria plan, reduce the income that is taxed. A traditional 401(k) lowers income tax but not Social Security and Medicare, while cafeteria-plan premiums lower both. Post-tax deductions, such as a Roth 401(k) or some insurance, come out after every tax has been worked out.'
        ]
      },
      howTo: {
        intro: 'Enter your yearly salary and how often you are paid, then your state tax rate and any deductions. The take-home pay per paycheck is calculated as you type.',
        steps: [
          { name: 'Enter your pay', text: 'Type your annual salary before tax, then choose your pay frequency and filing status from the menus.' },
          { name: 'Add state and local tax', text: 'Enter your state income tax rate, or 0 if your state has no income tax. Add a local rate if your city or county taxes wages.' },
          { name: 'Add your deductions', text: 'Enter your traditional 401(k) contribution as a percent of pay, any other pre-tax deductions per paycheck (health, dental, vision, HSA, FSA) and any post-tax deductions per paycheck.' },
          { name: 'Read the breakdown', text: 'The headline is your take-home pay per paycheck. Below it is every tax and deduction for one paycheck, the yearly take-home pay and a chart of where the money goes.' },
          { name: 'Compare with your pay stub', text: 'Check the result against a recent pay stub. A large gap usually points to extra withholding on your Form W-4 or a deduction you have not entered.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The calculator works out a full year of tax and divides it by the number of paychecks.',
        expression: 'Taxable income = salary − 401(k) − pre-tax deductions − standard deduction\nFederal tax = Σ (income in each bracket × that bracket\'s rate)\nSocial Security = 6.2% × min(salary − pre-tax deductions, $184,500)\nMedicare = 1.45% × (salary − pre-tax deductions) + 0.9% above $200,000 ($250,000 joint)\nState tax = state rate × (salary − 401(k) − pre-tax deductions)\nTake-home = salary − all taxes − all deductions, ÷ paychecks per year',
        terms: [
          { symbol: 'Standard deduction (2026)', meaning: '$16,100 single, $32,200 married filing jointly, $24,150 head of household.' },
          { symbol: 'Single brackets (2026)', meaning: '10% to $12,400, 12% to $50,400, 22% to $105,700, 24% to $201,775, 32% to $256,225, 35% to $640,600, 37% above.' },
          { symbol: 'Married filing jointly (2026)', meaning: '10% to $24,800, 12% to $100,800, 22% to $211,400, 24% to $403,550, 32% to $512,450, 35% to $768,700, 37% above.' },
          { symbol: 'Head of household (2026)', meaning: '10% to $17,700, 12% to $67,450, 22% to $105,700, 24% to $201,750, 32% to $256,200, 35% to $640,600, 37% above.' },
          { symbol: '401(k)', meaning: 'Traditional 401(k) deferral, capped at the 2026 limit of $24,500 (catch-up contributions for ages 50 and over are not modeled).' },
          { symbol: 'Pre-tax deductions', meaning: 'Cafeteria-plan (section 125) premiums and HSA/FSA contributions: exempt from income tax and from Social Security and Medicare.' }
        ],
        note: 'Estimates only. This is your yearly tax liability spread evenly over your paychecks, not your employer\'s exact withholding, which follows IRS Publication 15-T and your Form W-4. Tax credits, other income, itemized deductions, bonuses and state-specific rules (brackets, credits, state disability insurance) are not included.'
      },
      workedExample: {
        intro: 'A single filer earns $60,000 a year, paid every two weeks (26 paychecks), in a state with a 5% income tax. They put 5% of pay into a traditional 401(k) and pay $100 of pre-tax health premiums per paycheck.',
        rows: [
          { label: 'Gross pay (60,000 ÷ 26)', value: '$2,307.69' },
          { label: '401(k) (5% of 60,000 = 3,000 a year)', value: '$115.38' },
          { label: 'Health premiums (100 × 26 = 2,600 a year)', value: '$100.00' },
          { label: 'Taxable income (60,000 − 3,000 − 2,600 − 16,100)', value: '$38,300 a year' },
          { label: 'Federal tax (10% × 12,400 + 12% × 25,900 = 4,348)', value: '$167.23' },
          { label: 'Social Security (6.2% × 57,400 = 3,558.80)', value: '$136.88' },
          { label: 'Medicare (1.45% × 57,400 = 832.30)', value: '$32.01' },
          { label: 'State tax (5% × 54,400 = 2,720)', value: '$104.62' },
          { label: 'Take-home pay (42,940.90 a year ÷ 26)', value: '$1,651.57' }
        ],
        result: 'Take-home ≈ $1,651.57 per paycheck · about $42,941 a year',
        explanation: 'Only $25,900 of the taxable income reaches the 12% bracket, so the federal tax is about 7.2% of the $60,000 salary, far below the 12% top rate. The 401(k) lowers income tax but not Social Security and Medicare, which is why FICA is charged on $57,400 while state tax is charged on $54,400.'
      },
      watchOut: [
        { title: 'Estimates only', body: 'Actual withholding follows your Form W-4 and IRS Publication 15-T, and your final tax depends on your whole return. Use this to plan, and your pay stub for the real figures.' },
        { title: 'State taxes vary', body: 'A single flat state rate is a simplification. Many states have their own brackets, deductions and credits, some tax 401(k) contributions, and a few have no income tax at all.' },
        { title: '401(k) does not reduce FICA', body: 'Traditional 401(k) contributions lower income tax but are still subject to Social Security and Medicare. Cafeteria-plan health premiums lower both.' },
        { title: 'High earners', body: 'Social Security stops at $184,500 of wages in 2026, so very high earners see bigger paychecks later in the year. The extra 0.9% Medicare tax applies above $200,000 (single) or $250,000 (joint), counted over the whole year.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Rev. Proc. 2025-32 (2026 tax brackets and standard deduction), Internal Revenue Bulletin 2025-45', url: 'https://www.irs.gov/irb/2025-45_IRB' },
        { label: 'Internal Revenue Service, Topic no. 751, Social Security and Medicare withholding rates', url: 'https://www.irs.gov/taxtopics/tc751' },
        { label: 'Social Security Administration, Contribution and Benefit Base', url: 'https://www.ssa.gov/oact/cola/cbb.html' },
        { label: 'Internal Revenue Service, 401(k) limit increases to $24,500 for 2026', url: 'https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500' },
        { label: 'Internal Revenue Service, Publication 15-T, Federal Income Tax Withholding Methods', url: 'https://www.irs.gov/publications/p15t' }
      ]
    },
    inputs: [
      { id: 'annualSalary', label: 'Annual salary', type: 'currency', placeholder: '60000', defaultValue: 60000, step: 1000, min: 0 },
      {
        id: 'payPeriodsPerYear',
        label: 'Pay frequency',
        type: 'number',
        placeholder: '26',
        defaultValue: 26,
        step: 1,
        min: 1,
        options: [
          { value: 52, label: 'Weekly (52)' },
          { value: 26, label: 'Every two weeks (26)' },
          { value: 24, label: 'Twice a month (24)' },
          { value: 12, label: 'Monthly (12)' }
        ]
      },
      {
        id: 'filingStatus',
        label: 'Filing status',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Single' },
          { value: 1, label: 'Married filing jointly' },
          { value: 2, label: 'Head of household' }
        ]
      },
      { id: 'stateTaxRate', label: 'State income tax rate', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.1, min: 0 },
      { id: 'localTaxRate', label: 'Local income tax rate', type: 'percent', placeholder: '0', defaultValue: 0, step: 0.1, min: 0 },
      { id: 'retirementPercent', label: 'Traditional 401(k), % of pay', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.5, min: 0 },
      { id: 'preTaxPerPeriod', label: 'Pre-tax health, HSA, FSA per paycheck', type: 'currency', placeholder: '100', defaultValue: 100, step: 10, min: 0 },
      { id: 'postTaxPerPeriod', label: 'Post-tax deductions per paycheck', type: 'currency', placeholder: '0', defaultValue: 0, step: 10, min: 0 }
    ],
    seo: {
      title: 'Paycheck Calculator 2026 – US Take-Home Pay',
      description: 'Free 2026 paycheck calculator: US take-home pay after federal tax brackets, Social Security, Medicare, state and local tax, 401(k) and other deductions.',
      faq: [
        { question: 'How is federal income tax on my paycheck estimated?', answer: 'Your salary minus pre-tax deductions and the standard deduction is run through the 2026 brackets, 10% up to 37%, and the yearly tax is divided by your number of paychecks. A single filer with $38,300 of taxable income owes $4,348, or about $167.23 per biweekly paycheck.' },
        { question: 'What is the 2026 standard deduction?', answer: '$16,100 for single filers and married people filing separately, $32,200 for married couples filing jointly and $24,150 for heads of household.' },
        { question: 'How much are Social Security and Medicare?', answer: 'Social Security is 6.2% of wages up to $184,500 in 2026, a maximum of $11,439. Medicare is 1.45% of all wages, plus 0.9% on wages above $200,000 for single filers or $250,000 for married couples filing jointly.' },
        { question: 'How much does a 401(k) contribution reduce my take-home pay?', answer: 'Less than the contribution itself, because it lowers your income tax. In the worked example, putting $115.38 per paycheck into a traditional 401(k) cuts take-home pay by only about $95.77, from about $1,747.34 to $1,651.57.' },
        { question: 'What is the difference between pre-tax and post-tax deductions?', answer: 'Pre-tax deductions, such as a traditional 401(k) or cafeteria-plan health premiums, come out before income tax is worked out, so they lower your tax. Post-tax deductions, such as a Roth 401(k), come out after tax and do not.' },
        { question: 'Does filing status change my paycheck?', answer: 'Yes, through the standard deduction and bracket widths. With the example inputs, take-home pay per biweekly paycheck is about $1,651.57 single, $1,692.80 head of household and $1,733.42 married filing jointly (on one $60,000 salary).' },
        { question: 'Why is my real paycheck different?', answer: 'Employers withhold using IRS Publication 15-T and the choices on your Form W-4, such as extra withholding or dependents. State rules, bonuses and benefits not entered here also change the figure. Treat this as an estimate.' }
      ]
    },
    compute(values) {
      const periods = Math.max(1, values.payPeriodsPerYear);
      const status = Math.min(2, Math.max(0, Math.round(values.filingStatus)));
      const salary = values.annualSalary;
      const retirement = Math.min(salary * (values.retirementPercent / 100), PAYROLL_2026.max401k);
      const preTax = values.preTaxPerPeriod * periods;
      const federal = federalIncomeTax(Math.max(0, salary - retirement - preTax - PAYROLL_2026.standardDeduction[status]), status);
      // Cafeteria-plan deductions are exempt from FICA; 401(k) deferrals are not.
      const ficaWages = Math.max(0, salary - preTax);
      const socialSecurity = Math.min(ficaWages, PAYROLL_2026.socialSecurityWageBase) * 0.062;
      const medicare = ficaWages * 0.0145 + Math.max(0, ficaWages - PAYROLL_2026.additionalMedicareThreshold[status]) * 0.009;
      const stateWages = Math.max(0, salary - retirement - preTax);
      const stateTax = stateWages * (values.stateTaxRate / 100);
      const localTax = stateWages * (values.localTaxRate / 100);
      const postTax = values.postTaxPerPeriod * periods;
      const annualNetPay = salary - retirement - preTax - federal - socialSecurity - medicare - stateTax - localTax - postTax;
      return {
        netPay: annualNetPay / periods,
        grossPay: salary / periods,
        federalTax: federal / periods,
        socialSecurity: socialSecurity / periods,
        medicare: medicare / periods,
        stateTax: stateTax / periods,
        localTax: localTax / periods,
        retirement: retirement / periods,
        preTaxDeductions: values.preTaxPerPeriod,
        postTaxDeductions: values.postTaxPerPeriod,
        annualNetPay
      };
    }
  },
  {
    id: 'investment-calculator',
    group: 'Savings & Growth',
    category: 'finance',
    glyph: 'Inv',
    updatedAt: '2026-10-19',
    aliases: ['sip calculator', 'return on investment calculator', 'roi calculator', 'portfolio growth calculator'],
    related: ['compound-interest-calculator', 'retirement-savings-calculator', 'inflation-calculator', 'paycheck-calculator', 'currency-converter'],
    title: 'Investment Calculator',
    description: 'Project what an investment could grow to with yearly contributions, or work back to the starting amount, years or average annual return a goal requires.',
    example: '$10,000 invested at an average 7% a year, plus $1,200 added at the end of each year, grows to about $87,891 in 20 years.',
    solver: {
      defaultTarget: 'futureValue',
      variables: [
        { id: 'futureValue', label: 'Future value', symbol: 'FV', dimension: 'currency', defaultValue: 87891.44, defaultUnit: 'currency' },
        { id: 'initialInvestment', label: 'Initial investment', symbol: 'P', dimension: 'currency', defaultValue: 10000, defaultUnit: 'currency' },
        { id: 'annualContribution', label: 'Yearly contribution', symbol: 'C', dimension: 'currency', defaultValue: 1200, defaultUnit: 'currency', fixed: true },
        { id: 'years', label: 'Time invested', symbol: 't', dimension: 'term', defaultValue: 20, defaultUnit: 'yr', bounds: [0, 1200] },
        { id: 'annualReturn', label: 'Average annual return', symbol: 'r', dimension: 'percent', defaultValue: 7, defaultUnit: '%', bounds: [-50, 100] }
      ],
      // `years` arrives in months (the term dimension's base); growth compounds once a year.
      solve: {
        futureValue: ({ initialInvestment, annualContribution, years, annualReturn }) =>
          years >= 0 ? initialInvestment * growthFactor(annualReturn, 1, years / 12) + annualContribution * annuityFactor(annualReturn, 1, years / 12) : NaN,
        initialInvestment: ({ futureValue, annualContribution, years, annualReturn }) => {
          const start = (futureValue - annualContribution * annuityFactor(annualReturn, 1, years / 12)) / growthFactor(annualReturn, 1, years / 12);
          return years >= 0 && start >= 0 ? start : NaN;
        },
        years: ({ futureValue, initialInvestment, annualContribution, annualReturn }) => {
          const i = annualReturn / 100;
          if (i === 0) return annualContribution > 0 ? ((futureValue - initialInvestment) / annualContribution) * 12 : NaN;
          const t = Math.log((futureValue * i + annualContribution) / (initialInvestment * i + annualContribution)) / Math.log(1 + i);
          return t >= 0 ? t * 12 : NaN;
        }
      },
      // The return has no closed form when there are contributions: the widget finds it numerically.
      equation: (si) =>
        si.futureValue -
        (si.initialInvestment * growthFactor(si.annualReturn, 1, si.years / 12) + si.annualContribution * annuityFactor(si.annualReturn, 1, si.years / 12)),
      outputs: [
        { id: 'totalContributed', label: 'Total invested', dimension: 'currency', compute: (si) => si.initialInvestment + (si.annualContribution * si.years) / 12 },
        { id: 'totalGrowth', label: 'Investment growth', dimension: 'currency', compute: (si) => si.futureValue - si.initialInvestment - (si.annualContribution * si.years) / 12 }
      ],
      derive: (si) => ({ contributions: (si.annualContribution * si.years) / 12 }),
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'initialInvestment', label: 'Initial investment' },
            { from: 'contributions', label: 'Yearly contributions' },
            { from: 'totalGrowth', label: 'Growth' }
          ],
          center: 'futureValue',
          centerSub: 'future value'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'How investments grow',
        paragraphs: [
          'An investment grows in two ways: the money you put in, and the returns that money earns. When returns are reinvested they start earning returns of their own, the same compounding that makes a savings account grow, which is why time in the market matters so much.',
          'Unlike a savings account, an investment such as a stock or bond fund has no fixed rate. Prices rise and fall, sometimes sharply, from year to year. The rate you enter here is an assumed average annual return, applied as if every year earned exactly that. Real portfolios never grow in a straight line, and the order of good and bad years affects the result, especially when you are adding or withdrawing money.',
          'Regular contributions often matter as much as the starting amount. Adding a fixed amount every year, whatever the market is doing, is a simple discipline, and those deposits compound too. This calculator adds your yearly contribution at the end of each year. For a version built specifically around saving for retirement — monthly contributions, monthly compounding to match a payroll deduction, and a clearly caveated estimate of what you could withdraw each year — see retirement-savings-calculator instead.'
        ]
      },
      howTo: {
        intro: 'Enter your yearly contribution (0 for a single investment), then any three of the other four fields. The fourth, marked auto, is calculated.',
        steps: [
          { name: 'Enter the yearly contribution', text: 'This is always an input. For a monthly plan, enter 12 times the monthly amount.' },
          { name: 'Project the future value', text: 'Type the initial investment, the time and an average annual return. The future value appears with the total invested and the growth broken out.' },
          { name: 'Plan backward from a goal', text: 'Type a target future value. Leave the time alone to see how long it takes, or the initial investment to see how much to start with.' },
          { name: 'Find the return you need', text: 'Fill in the goal, start, contribution and time so the return is the field left alone longest, and the calculator finds the average return required.' },
          { name: 'Try several returns', text: 'Run a cautious, a middle and an optimistic return. The spread between them is a better guide than any single figure.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'With yearly compounding and a contribution at the end of each year, the future value is the initial amount grown for t years plus an ordinary annuity of the contributions.',
        expression: 'FV = P × (1 + r)^t + C × ((1 + r)^t − 1) ÷ r\nt = ln((FV × r + C) ÷ (P × r + C)) ÷ ln(1 + r)\nTotal invested = P + C × t',
        terms: [
          { symbol: 'FV', meaning: 'Projected value at the end.' },
          { symbol: 'P', meaning: 'Initial investment.' },
          { symbol: 'C', meaning: 'Contribution added at the end of each year.' },
          { symbol: 'r', meaning: 'Average annual return as a decimal (7% = 0.07). With r = 0 the contribution term is C × t.' },
          { symbol: 't', meaning: 'Years invested.' }
        ],
        note: 'Estimates only. Returns are assumed constant; real returns vary, can be negative, and are reduced by fees, taxes and inflation. This is not investment advice.'
      },
      workedExample: {
        intro: 'You invest $10,000 and add $1,200 at the end of each year for 20 years, assuming an average return of 7% a year. What could it grow to?',
        rows: [
          { label: 'Growth factor 1.07^20', value: '3.869684' },
          { label: 'Initial investment grown (10,000 × 3.869684)', value: '$38,696.84' },
          { label: 'Annuity factor (3.869684 − 1) ÷ 0.07', value: '40.995492' },
          { label: 'Contributions grown (1,200 × 40.995492)', value: '$49,194.59' },
          { label: 'Future value', value: '$87,891.44' },
          { label: 'Total invested (10,000 + 1,200 × 20)', value: '$34,000' },
          { label: 'Growth (87,891.44 − 34,000)', value: '$53,891.44' }
        ],
        result: 'FV ≈ $87,891 after 20 years, of which about $53,891 is growth',
        explanation: 'After 10 years the same plan is worth only about $36,251; the second decade adds more than the first because the balance it compounds on is so much larger. At 5% a year the 20-year result would be about $66,212, and at 9% about $117,436, so the assumed return matters a great deal.'
      },
      watchOut: [
        { title: 'Estimates only: returns are not guaranteed', body: 'Investments can lose value. A constant average return is a planning assumption, not a forecast, and past performance does not predict future results.' },
        { title: 'Fees compound too', body: 'An expense ratio or advisory fee comes off the return every year. A 1% fee on a 7% return leaves 6%, which over decades makes a large difference.' },
        { title: 'Inflation', body: 'The future value is in future dollars. Use the inflation calculator to see what it would buy in today\'s money.' },
        { title: 'Taxes', body: 'Gains in a taxable account are taxed, while retirement accounts such as a 401(k) or IRA defer or exempt the tax. The calculator ignores taxes.' }
      ],
      references: [
        { label: 'OpenStax, Contemporary Mathematics, §6.7 Investments', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-7-investments' },
        { label: 'U.S. Securities and Exchange Commission, Investor.gov: Save and Invest', url: 'https://www.investor.gov/introduction-investing/investing-basics/save-and-invest' },
        { label: 'U.S. Securities and Exchange Commission, Investor.gov glossary: Compound interest', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest' }
      ]
    },
    inputs: [
      { id: 'initialInvestment', label: 'Initial investment', type: 'currency', placeholder: '10000', defaultValue: 10000, step: 500, min: 0 },
      { id: 'annualReturn', label: 'Annual return rate', type: 'percent', placeholder: '7', defaultValue: 7, step: 0.1, min: 0 },
      { id: 'years', label: 'Years invested', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 },
      { id: 'annualContribution', label: 'Annual contribution', type: 'currency', placeholder: '1200', defaultValue: 1200, step: 100, min: 0 }
    ],
    seo: {
      title: 'Investment Calculator – Future Value & Required Return',
      description: 'Free investment calculator: project the future value of an investment with yearly contributions, or find the years or return a goal needs.',
      faq: [
        { question: 'How do I calculate investment growth?', answer: 'Grow the starting amount by (1 + r)^t and add the future value of your yearly contributions, C × ((1 + r)^t − 1) ÷ r. $10,000 plus $1,200 a year at 7% for 20 years comes to about $87,891.' },
        { question: 'How long will it take to reach my goal?', answer: 'Enter the goal as the future value and the calculator works out the time. Starting with $10,000 and adding $1,200 a year at 7%, $100,000 takes about 21.6 years.' },
        { question: 'What return do I need to reach a goal?', answer: 'Fill in the goal, the start, the contribution and the time, and the calculator searches for the return. To reach $100,000 in 20 years from $10,000 plus $1,200 a year you need about 7.9% a year.' },
        { question: 'What return should I assume?', answer: 'There is no safe single number. Run the calculator with a cautious, a middle and an optimistic return and plan around the range. Returns are never guaranteed, and fees and inflation reduce them.' },
        { question: 'Can I use this as a SIP calculator?', answer: 'Yes, approximately. Enter 12 times your monthly installment as the yearly contribution. A SIP invests monthly, so its result will be a little higher than this yearly model.' },
        { question: 'How much does starting earlier help?', answer: 'A lot. The same plan of $10,000 plus $1,200 a year at 7% is worth about $36,251 after 10 years, about $87,891 after 20 and about $189,475 after 30.' }
      ]
    },
    compute(values) {
      const r = values.annualReturn / 100;
      const n = Math.max(1, values.years);
      const futureValuePrincipal = values.initialInvestment * Math.pow(1 + r, n);
      const futureValueContributions = r === 0
        ? values.annualContribution * n
        : values.annualContribution * ((Math.pow(1 + r, n) - 1) / r);
      const futureValue = futureValuePrincipal + futureValueContributions;
      const totalContributed = values.initialInvestment + values.annualContribution * n;
      const totalGrowth = futureValue - totalContributed;
      return { futureValue, totalContributed, totalGrowth };
    }
  },
  {
    id: 'loan-prepayment-calculator',
    group: 'Mortgages & Loans',
    category: 'finance',
    glyph: 'L↓',
    updatedAt: '2026-10-19',
    aliases: ['extra payment calculator', 'early payoff calculator', 'mortgage payoff calculator', 'interest saved calculator'],
    related: ['mortgage-calculator', 'loan-calculator', 'emi-calculator', 'compound-interest-calculator'],
    title: 'Loan Prepayment Calculator',
    description: 'See how an extra monthly payment shortens a loan and how much interest it saves. Works for mortgages, auto loans, personal loans and student loans.',
    example: 'Paying an extra $200 a month on a $20,000, 5-year loan at 6% APR pays it off in 38 months instead of 60 and saves about $1,217 in interest.',
    breakdown: {
      headline: 'interestSaved',
      headlineLabel: 'Interest saved',
      outputs: [
        { id: 'interestSaved', label: 'Interest saved', format: 'currency' },
        { id: 'monthsSaved', label: 'Paid off sooner by', format: 'integer', dimension: 'term', unit: 'mo' },
        { id: 'newPayoffMonths', label: 'New payoff time', format: 'integer', dimension: 'term', unit: 'mo' },
        { id: 'regularMonthlyPayment', label: 'Regular monthly payment', format: 'currency' },
        { id: 'newMonthlyPayment', label: 'Monthly payment with the extra', format: 'currency' }
      ],
      groups: [
        { title: 'Your loan', inputs: ['loanAmount', 'interestRate', 'years'] },
        { title: 'Extra payment', inputs: ['extraPayment'] }
      ],
      derive: (values) => ({ start: 0, originalMonths: Math.max(1, values.years * 12) }),
      visual: {
        type: 'timeline',
        start: 'start',
        end: 'originalMonths',
        phases: [
          { label: 'Paying with the extra', from: 'start', to: 'newPayoffMonths' },
          { label: 'Months saved', from: 'newPayoffMonths', to: 'originalMonths' }
        ],
        startLabel: 'today',
        endLabel: 'the original payoff date',
        title: 'Payoff timeline'
      }
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'Why extra payments save so much',
        paragraphs: [
          'On an amortized loan, each month\'s interest is charged on the balance you still owe. Any extra amount you pay goes straight to principal, so the balance drops faster, next month\'s interest is smaller, and more of every later payment goes to principal as well. The savings compound in your favor in the same way interest compounds against you.',
          'Your required payment stays the same; the loan simply ends early. This calculator keeps the regular payment, adds your extra amount every month from the start, and runs the loan month by month until the balance reaches zero. It then compares the interest paid with the interest on the original schedule.',
          'Extra payments do the most good early in a loan, when the balance and the interest share of each payment are largest. A given extra amount saves much more on a long mortgage than on a short car loan, both in months and in dollars.'
        ]
      },
      howTo: {
        intro: 'Enter the loan as it was originally set up, then the extra amount you plan to pay each month.',
        steps: [
          { name: 'Enter the loan', text: 'Type the original loan amount, the APR and the original term. Switch the term between years and months with the menu beside it.' },
          { name: 'Enter the extra payment', text: 'Type the amount you will add to every monthly payment, on top of the regular payment.' },
          { name: 'Read the savings', text: 'The headline is the interest saved. Below it are the months saved, the new payoff time and both monthly payments.' },
          { name: 'Check the timeline', text: 'The bar shows how much of the original term you still pay and how many months the extra payments cut off.' },
          { name: 'Compare amounts', text: 'Try several extra amounts to see where the savings level off for your budget.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The regular payment comes from the annuity formula. The prepayment schedule is then run month by month, because the payoff month has to be counted.',
        expression: 'M = P × r ÷ (1 − (1 + r)^−n)\nEach month: interest = balance × r; balance −= (M + X − interest)\nInterest saved = (M × n − P) − interest paid with the extra',
        terms: [
          { symbol: 'M', meaning: 'Regular monthly payment.' },
          { symbol: 'X', meaning: 'Extra amount paid every month.' },
          { symbol: 'P', meaning: 'Original loan amount.' },
          { symbol: 'r', meaning: 'Monthly rate, the APR ÷ 12 as a decimal.' },
          { symbol: 'n', meaning: 'Original number of monthly payments.' }
        ],
        note: 'Estimates only. It assumes the extra amount is paid every month from the first payment and applied entirely to principal, with no prepayment penalty. The final month is counted as a whole month even when the last payment is smaller.'
      },
      workedExample: {
        intro: 'You have a $20,000 loan at 6% APR over 5 years and add $200 to every monthly payment from the start. How much sooner is it paid off, and how much interest do you save?',
        rows: [
          { label: 'Regular payment', value: '$386.66' },
          { label: 'Payment with the extra (386.66 + 200)', value: '$586.66' },
          { label: 'Original schedule', value: '60 months, $3,199.36 interest' },
          { label: 'With the extra payment', value: '38 months, $1,982.12 interest' },
          { label: 'Months saved (60 − 38)', value: '22' },
          { label: 'Interest saved (3,199.36 − 1,982.12)', value: '$1,217.24' }
        ],
        result: 'Paid off 22 months early · about $1,217 of interest saved',
        explanation: 'The extra $200 a month adds up to about $7,600 of extra principal over 38 months, but you also skip 22 regular payments entirely. On a $280,000, 30-year mortgage at 5%, the same idea with an extra $200 a month saves about $67,926 and 82 months.'
      },
      watchOut: [
        { title: 'Estimates only', body: 'Your lender\'s payoff statement is the binding figure. Rounding, payment dates and fees can shift the exact months and dollars.' },
        { title: 'Make sure it goes to principal', body: 'Some servicers apply extra money to the next scheduled payment instead of the principal. Tell your servicer to apply it to principal and check your statement.' },
        { title: 'Prepayment penalties', body: 'A few mortgages charge a fee for paying off the whole loan early, usually within the first three to five years. Check your loan documents before a large lump sum.' },
        { title: 'Compare with other uses of the money', body: 'Paying off a 6% loan is a guaranteed 6% return. If you carry higher-rate debt or have no emergency fund, those usually come first.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, What is a prepayment penalty?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/' },
        { label: 'Consumer Financial Protection Bureau, Regulation Z §1026.43: Minimum standards for transactions secured by a dwelling (prepayment penalty limits)', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/43/' },
        { label: 'OpenStax, Contemporary Mathematics, §6.8 The Basics of Loans', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans' }
      ]
    },
    inputs: [
      { id: 'loanAmount', label: 'Original loan amount', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 100, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.01, min: 0 },
      { id: 'years', label: 'Original loan term', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1, dimension: 'term', unit: 'yr' },
      { id: 'extraPayment', label: 'Extra monthly payment', type: 'currency', placeholder: '200', defaultValue: 200, step: 25, min: 0 }
    ],
    seo: {
      title: 'Loan Prepayment Calculator – Interest & Time Saved',
      description: 'Free loan prepayment calculator: see how an extra monthly payment shortens a mortgage, auto, personal or student loan and how much interest it saves.',
      faq: [
        { question: 'How much interest do extra payments save?', answer: 'It depends on the rate, the balance and how early you start. An extra $200 a month on a $20,000, 5-year loan at 6% saves about $1,217 and 22 months. On a $280,000, 30-year mortgage at 5%, an extra $100 a month saves about $39,499 and 47 months.' },
        { question: 'Is it better to prepay early or late in the loan?', answer: 'Early. Interest is charged on the outstanding balance, which is largest at the start, so each extra dollar paid early avoids interest for every remaining month.' },
        { question: 'Does the extra payment go to principal?', answer: 'It should, but check. Ask your servicer to apply extra amounts to principal rather than to the next scheduled payment, and confirm it on your statement.' },
        { question: 'Which US loans allow prepayment without a penalty?', answer: 'Federal student loans have no prepayment penalty, and most auto and personal loans do not either. Some mortgages include one, usually for paying off the whole loan within the first three to five years, so check your loan documents.' },
        { question: 'Will my monthly payment go down?', answer: 'No. With regular extra payments the required payment stays the same and the loan ends sooner. Some lenders offer a recast after a large lump sum, which lowers the payment instead.' },
        { question: 'Should I prepay my loan or invest?', answer: 'Prepaying a loan earns a guaranteed return equal to its interest rate. Investing may earn more but is not guaranteed. Many people pay off high-rate debt first and keep an emergency fund before prepaying a low-rate mortgage.' }
      ]
    },
    compute(values) {
      const monthlyRate = values.interestRate / 100 / 12;
      const months = Math.max(1, values.years * 12);
      const regularPayment = monthlyRate === 0
        ? values.loanAmount / months
        : (values.loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const totalInterestRegular = regularPayment * months - values.loanAmount;
      let balance = values.loanAmount;
      let totalInterestExtra = 0;
      let monthsWithExtra = 0;
      const totalPayment = regularPayment + values.extraPayment;
      while (balance > 0.01 && monthsWithExtra < 600) {
        const interest = balance * monthlyRate;
        totalInterestExtra += interest;
        const principal = Math.min(balance, totalPayment - interest);
        balance -= principal;
        monthsWithExtra++;
      }
      const interestSaved = Math.max(0, totalInterestRegular - totalInterestExtra);
      const monthsSaved = months - monthsWithExtra;
      return { regularMonthlyPayment: regularPayment, newMonthlyPayment: regularPayment + values.extraPayment, monthsSaved, interestSaved, newPayoffMonths: monthsWithExtra };
    }
  },
  {
    id: 'inflation-calculator',
    group: 'Savings & Growth',
    category: 'finance',
    glyph: 'CPI',
    updatedAt: '2026-10-19',
    aliases: ['purchasing power calculator', 'cost of living calculator', 'value of money over time calculator', 'price increase calculator'],
    related: ['compound-interest-calculator', 'investment-calculator', 'salary-raise-calculator', 'electricity-bill-calculator'],
    title: 'Inflation Calculator',
    description: 'See what something costing a given amount today will cost after years of inflation, or work out the inflation rate or number of years behind a price change.',
    example: 'At 3% a year, something that costs $10,000 today will cost about $13,439 in 10 years, and $10,000 then will buy only what about $7,441 buys today.',
    solver: {
      defaultTarget: 'futureValue',
      variables: [
        { id: 'futureValue', label: 'Future cost', symbol: 'FV', dimension: 'currency', defaultValue: 13439.16, defaultUnit: 'currency' },
        { id: 'amount', label: 'Cost today', symbol: 'A', dimension: 'currency', defaultValue: 10000, defaultUnit: 'currency' },
        { id: 'years', label: 'Time', symbol: 't', dimension: 'term', defaultValue: 10, defaultUnit: 'yr' },
        { id: 'inflationRate', label: 'Annual inflation rate', symbol: 'i', dimension: 'percent', defaultValue: 3, defaultUnit: '%' }
      ],
      // `years` arrives in months (the term dimension's base).
      solve: {
        futureValue: ({ amount, years, inflationRate }) => amount * (1 + inflationRate / 100) ** (years / 12),
        amount: ({ futureValue, years, inflationRate }) => futureValue / (1 + inflationRate / 100) ** (years / 12),
        years: ({ futureValue, amount, inflationRate }) => {
          const t = (Math.log(futureValue / amount) / Math.log(1 + inflationRate / 100)) * 12;
          return t >= 0 ? t : NaN;
        },
        inflationRate: ({ futureValue, amount, years }) =>
          years > 0 && amount > 0 && futureValue > 0 ? ((futureValue / amount) ** (12 / years) - 1) * 100 : NaN
      },
      outputs: [
        { id: 'increase', label: 'Price increase', dimension: 'currency', compute: (si) => si.futureValue - si.amount },
        { id: 'todaysValue', label: 'What the same amount will buy then, in today\'s money', dimension: 'currency', compute: (si) => (si.amount * si.amount) / si.futureValue },
        { id: 'powerLost', label: 'Purchasing power lost', dimension: 'percent', compute: (si) => (1 - si.amount / si.futureValue) * 100 }
      ],
      visuals: [
        {
          type: 'compareBars',
          bars: [{ from: 'amount', label: 'Cost today' }, { from: 'futureValue', label: 'Cost after inflation' }],
          title: 'Then vs now',
          highlight: 1
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'What is inflation?',
        paragraphs: [
          'Inflation is the general rise in prices over time. When prices rise, each dollar buys a little less, so inflation is also a fall in the purchasing power of money. In the US it is usually measured by the Consumer Price Index (CPI), which the Bureau of Labor Statistics publishes every month from the prices of a broad basket of goods and services.',
          'Inflation compounds like interest. At 3% a year, prices are 3% higher after one year, and the next year\'s 3% applies to those higher prices. That is why a modest-looking rate adds up: at 3% a year, prices roughly double in about 23 and a half years.',
          'The Federal Reserve aims for inflation of 2% a year over the longer run, measured by the price index for personal consumption expenditures. Actual inflation varies a lot from year to year, so for long-range planning people often try a few rates rather than relying on one.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the four fields. The fourth, marked auto, is calculated as you type.',
        steps: [
          { name: 'Project a future cost', text: 'Type today\'s cost, the number of years and an annual inflation rate. The future cost is calculated, along with the increase and the purchasing power lost.' },
          { name: 'Find the inflation rate', text: 'Type a past price as the cost today, the price now as the future cost, and the years between them. Leave the rate alone and the average annual inflation is calculated.' },
          { name: 'Find how long it takes', text: 'Leave the time alone to see how many years a given rate takes to raise a price to a target.' },
          { name: 'Switch years and months', text: 'Use the menu beside the time field to enter it in months.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Prices grow by the inflation rate every year, compounded. Each rearrangement has a closed form, so every field is solved directly.',
        expression: 'FV = A × (1 + i)^t\nA = FV ÷ (1 + i)^t\ni = (FV ÷ A)^(1/t) − 1\nt = ln(FV ÷ A) ÷ ln(1 + i)',
        terms: [
          { symbol: 'FV', meaning: 'Future cost after t years of inflation.' },
          { symbol: 'A', meaning: 'Cost today.' },
          { symbol: 'i', meaning: 'Average annual inflation rate as a decimal (3% = 0.03).' },
          { symbol: 't', meaning: 'Time in years.' },
          { symbol: 'A ÷ (1 + i)^t', meaning: 'What the same dollar amount will buy at the end, in today\'s dollars.' }
        ],
        note: 'Estimates only. A constant rate is a simplification: real inflation changes every year and differs between categories such as housing, food and health care.'
      },
      workedExample: {
        intro: 'Something costs $10,000 today. If inflation averages 3% a year, what will it cost in 10 years, and what will $10,000 then be worth in today\'s money?',
        rows: [
          { label: 'Growth factor 1.03^10', value: '1.343916' },
          { label: 'Future cost (10,000 × 1.343916)', value: '$13,439.16' },
          { label: 'Price increase (13,439.16 − 10,000)', value: '$3,439.16' },
          { label: 'Today\'s value of $10,000 then (10,000 ÷ 1.343916)', value: '$7,440.94' },
          { label: 'Purchasing power lost (1 − 1 ÷ 1.343916)', value: '25.59%' }
        ],
        result: 'FV ≈ $13,439 · $10,000 then buys about $7,441 of today\'s goods',
        explanation: 'Prices rise by about 34% in total over the 10 years, more than 10 × 3% = 30%, because each year\'s increase applies to the previous year\'s higher price. Put the other way, a dollar loses about a quarter of its purchasing power.'
      },
      watchOut: [
        { title: 'Estimates only', body: 'Future inflation is unknown. Use a range of rates (for example 2%, 3% and 4%) and treat the results as scenarios, not forecasts.' },
        { title: 'Your own inflation differs', body: 'The CPI averages a broad basket. If most of your spending goes on rent, tuition or medical care, prices you face may rise faster or slower than the headline rate.' },
        { title: 'Past price changes need real index data', body: 'To compare actual prices between two past years, the exact answer comes from the published CPI for those years. The rate this calculator returns is the constant average that connects the two prices.' },
        { title: 'Nominal and real returns', body: 'If savings earn 4% while prices rise 3%, the real gain is only about 1% a year. Compare the compound interest result with this one to see growth in today\'s money.' }
      ],
      references: [
        { label: 'U.S. Bureau of Labor Statistics, Consumer Price Index', url: 'https://www.bls.gov/cpi/' },
        { label: 'Board of Governors of the Federal Reserve System, Why does the Federal Reserve aim for inflation of 2 percent over the longer run?', url: 'https://www.federalreserve.gov/faqs/economy_14400.htm' },
        { label: 'OpenStax, Contemporary Mathematics, §6.4 Compound Interest', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest' }
      ]
    },
    inputs: [
      { id: 'amount', label: 'Starting amount', type: 'currency', placeholder: '10000', defaultValue: 10000, step: 100, min: 0 },
      { id: 'inflationRate', label: 'Annual inflation rate', type: 'percent', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'years', label: 'Years', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 }
    ],
    seo: {
      title: 'Inflation Calculator – Future Cost & Purchasing Power',
      description: 'Free inflation calculator: future cost of today\'s prices, purchasing power lost, or the average inflation rate or years behind a price change.',
      faq: [
        { question: 'How do I calculate the effect of inflation?', answer: 'Multiply today\'s cost by (1 + rate)^years. At 3% a year, $10,000 becomes about $13,439 after 10 years.' },
        { question: 'What will my money be worth in the future?', answer: 'Divide by the same factor instead. At 3% a year, $10,000 in 10 years will buy what about $7,441 buys today, a loss of about 25.6% of its purchasing power.' },
        { question: 'How do I find the inflation rate between two prices?', answer: 'Use i = (new price ÷ old price)^(1/years) − 1. A price that rose from $100 to $150 over 10 years averaged about 4.14% a year.' },
        { question: 'What inflation rate does the Federal Reserve target?', answer: 'The Federal Reserve aims for 2% a year over the longer run, measured by the price index for personal consumption expenditures. Actual inflation is often above or below that in any given year.' },
        { question: 'What is the Rule of 72 for inflation?', answer: 'Divide 72 by the inflation rate to estimate how many years prices take to double. At 3% that gives 24 years; the exact figure is about 23.4 years.' },
        { question: 'How long until prices rise by half?', answer: 'Enter a future cost 1.5 times today\'s and leave the time to be calculated. At 3% a year it takes about 13.7 years.' }
      ]
    },
    compute(values) {
      const futureValue = values.amount * Math.pow(1 + values.inflationRate / 100, values.years);
      const purchasingPowerLoss = futureValue - values.amount;
      const presentValueEquivalent = values.amount / Math.pow(1 + values.inflationRate / 100, values.years);
      return { futureValue, purchasingPowerLoss, presentValueEquivalent };
    }
  },
  {
    id: 'emi-calculator',
    group: 'Mortgages & Loans',
    category: 'finance',
    glyph: 'EMI',
    updatedAt: '2026-10-19',
    aliases: ['equated monthly installment calculator', 'loan emi calculator', 'house loan emi calculator', 'monthly installment calculator', 'bank emi calculator'],
    related: ['loan-calculator', 'mortgage-calculator', 'car-payment-calculator', 'loan-prepayment-calculator'],
    title: 'EMI Calculator',
    description: 'Calculate the equated monthly installment (EMI) on a purchase or loan, or work back to the price, term or interest rate, with the total interest and a year-by-year schedule.',
    example: 'A $1,500 laptop financed at 18% APR over 12 months, with nothing down, costs an EMI of about $137.52, or about $150.24 in interest.',
    solver: {
      defaultTarget: 'emi',
      variables: [
        { id: 'emi', label: 'Monthly installment (EMI)', symbol: 'EMI', dimension: 'currency', defaultValue: 137.52, defaultUnit: 'currency' },
        { id: 'loanAmount', label: 'Purchase price', symbol: 'C', dimension: 'currency', defaultValue: 1500, defaultUnit: 'currency' },
        { id: 'downPayment', label: 'Down payment', symbol: 'D', dimension: 'currency', defaultValue: 0, defaultUnit: 'currency', fixed: true },
        { id: 'term', label: 'Term', symbol: 'n', dimension: 'term', defaultValue: 12, defaultUnit: 'mo' },
        { id: 'annualRate', label: 'Interest rate (APR)', symbol: 'APR', dimension: 'percent', defaultValue: 18, defaultUnit: '%', bounds: [0, 100] }
      ],
      solve: {
        emi: ({ loanAmount, downPayment, term, annualRate }) => loanPayment(loanAmount - downPayment, term, annualRate),
        loanAmount: ({ emi, downPayment, term, annualRate }) => downPayment + loanPrincipal(emi, term, annualRate),
        term: ({ loanAmount, downPayment, emi, annualRate }) => loanMonths(loanAmount - downPayment, emi, annualRate)
      },
      // The rate has no closed form: the widget finds it numerically.
      equation: (si) => si.emi - loanPayment(si.loanAmount - si.downPayment, si.term, si.annualRate),
      outputs: [
        { id: 'principal', label: 'Amount financed', dimension: 'currency', compute: (si) => si.loanAmount - si.downPayment },
        { id: 'totalInterest', label: 'Total interest', dimension: 'currency', compute: (si) => si.emi * si.term - (si.loanAmount - si.downPayment) },
        { id: 'totalPayment', label: 'Total of all installments', dimension: 'currency', compute: (si) => si.emi * si.term }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [{ from: 'principal', label: 'Amount financed' }, { from: 'totalInterest', label: 'Interest' }],
          center: 'totalPayment',
          centerSub: 'total of installments'
        },
        { type: 'amortization', principal: 'principal', annualRate: 'annualRate', months: 'term', payment: 'emi' }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'What is an EMI?',
        paragraphs: [
          'EMI stands for equated monthly installment: a fixed amount you pay every month until a loan or a financed purchase is fully repaid. The term is standard in India for home, car and personal loans, and the same arithmetic sits behind US retail financing, store installment plans and personal loans used for purchases.',
          'Each installment is the same size, but what it pays for changes. Early installments are mostly interest, because interest is charged on the full balance; later ones are mostly principal. That is the reducing-balance method lenders use, and it is why the amortization schedule below the result shifts from interest to principal year by year.',
          'Comparing offers by the installment alone is risky. A longer term lowers the EMI but raises the total interest, so look at the total of all installments as well. Promotions sold as "0% interest" deserve a careful read: some are deferred-interest plans that charge all the interest back to the purchase date if any balance remains when the promotion ends.'
        ]
      },
      howTo: {
        intro: 'Enter any down payment, then fill in three of the other four fields. The remaining one, marked auto, is calculated.',
        steps: [
          { name: 'Enter the price and down payment', text: 'The amount financed is the purchase price minus the down payment. Leave the down payment at 0 for a plain loan.' },
          { name: 'Enter the rate and term', text: 'Type the APR and the number of months, or switch the term to years with the menu beside it. The EMI is calculated.' },
          { name: 'Check a quoted installment', text: 'Type the installment a store or lender quoted, so the rate becomes the field left alone longest. The calculator finds the interest rate that installment implies.' },
          { name: 'Read the totals', text: 'Under the result you get the amount financed, the total interest and the total of all installments, plus a chart and a yearly schedule.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The EMI formula is the standard reducing-balance annuity, usually written with (1 + r)^n on both sides of the fraction.',
        expression: 'P = C − D\nEMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1)\nr = APR ÷ 100 ÷ 12',
        terms: [
          { symbol: 'EMI', meaning: 'Equated monthly installment.' },
          { symbol: 'C', meaning: 'Purchase price or loan amount.' },
          { symbol: 'D', meaning: 'Down payment (0 if none).' },
          { symbol: 'P', meaning: 'Amount financed, C − D.' },
          { symbol: 'r', meaning: 'Monthly interest rate as a decimal: 18% APR is 0.015.' },
          { symbol: 'n', meaning: 'Number of monthly installments.' }
        ],
        note: 'Estimates only. Processing fees, insurance, taxes on interest (such as GST on EMI interest in India) and promotional terms are not included. Your financing agreement is the binding figure.'
      },
      workedExample: {
        intro: 'You finance a $1,500 laptop at 18% APR over 12 months with no down payment. What is the EMI, and what does the financing cost?',
        rows: [
          { label: 'Amount financed (P)', value: '$1,500' },
          { label: 'Monthly rate (r = 18% ÷ 12)', value: '0.015' },
          { label: '(1 + r)^n = 1.015^12', value: '1.195618' },
          { label: 'EMI = 1,500 × 0.015 × 1.195618 ÷ 0.195618', value: '$137.52' },
          { label: 'Total of 12 installments', value: '≈ $1,650.24' },
          { label: 'Total interest', value: '≈ $150.24' }
        ],
        result: 'EMI ≈ $137.52 a month · about $150.24 of interest',
        explanation: 'The first installment carries $22.50 of interest (1,500 × 0.015) and $115.02 of principal. Paying $300 down instead would leave $1,200 to finance, for an EMI of about $110.02 and about $120.19 of interest.'
      },
      watchOut: [
        { title: 'Estimates only', body: 'Fees, add-on insurance and promotional terms change the real cost. Read the APR and total of payments on your financing agreement.' },
        { title: 'Deferred interest is not 0% interest', body: 'With a deferred-interest promotion, interest builds up in the background. If any of the balance is left when the promotional period ends, all of that interest back to the purchase date is charged.' },
        { title: 'A lower EMI can cost more', body: 'Spreading $1,500 at 18% over 24 months instead of 12 drops the EMI from about $137.52 to $74.89 but nearly doubles the interest, from about $150 to $297.' },
        { title: 'Flat-rate quotes', body: 'Some lenders quote a "flat" rate charged on the original amount for the whole term. That costs much more than the same reducing-balance rate. Ask for the APR.' }
      ],
      references: [
        { label: 'OpenStax, Contemporary Mathematics, §6.8 The Basics of Loans', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans' },
        { label: 'Consumer Financial Protection Bureau, Regulation Z (Truth in Lending), Appendix J: Annual Percentage Rate Computations for Closed-End Credit Transactions', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/j/' },
        { label: 'Consumer Financial Protection Bureau, Encourages Retail Credit Card Companies to Consider More Transparent Promotions (deferred interest)', url: 'https://www.consumerfinance.gov/archive/newsroom/consumer-financial-protection-bureau-encourages-retail-credit-card-companies-consider-more-transparent-promotions/' }
      ]
    },
    inputs: [
      { id: 'loanAmount', label: 'Purchase / loan amount', type: 'currency', placeholder: '1500', defaultValue: 1500, step: 50, min: 0 },
      { id: 'annualRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '18', defaultValue: 18, step: 0.25, min: 0 },
      { id: 'months', label: 'Loan term (months)', type: 'number', placeholder: '12', defaultValue: 12, step: 1, min: 1 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '0', defaultValue: 0, step: 50, min: 0 }
    ],
    seo: {
      title: 'EMI Calculator – Monthly Installment, Interest & Schedule',
      description: 'Free EMI calculator: equated monthly installment for any loan or financed purchase, or the price, term or rate behind an EMI, with total interest and a schedule.',
      faq: [
        { question: 'What is the EMI formula?', answer: 'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the amount financed, r the monthly rate (APR ÷ 12) and n the number of months. $1,500 at 18% over 12 months gives about $137.52.' },
        { question: 'How do I find the interest rate behind an EMI?', answer: 'Enter the price, the term and the quoted installment, and the calculator searches for the rate. A $1,500 purchase repaid at $140 a month for 12 months implies an APR of about 21.46%.' },
        { question: 'Does a down payment reduce the EMI?', answer: 'Yes. Only the price minus the down payment is financed. $300 down on a $1,500 purchase at 18% over 12 months drops the EMI from about $137.52 to $110.02.' },
        { question: 'Is a longer term better?', answer: 'It lowers each installment but raises the total cost. $1,500 at 18% costs about $150 in interest over 12 months and about $297 over 24 months.' },
        { question: 'What is deferred interest?', answer: 'A promotion that charges no interest only if the whole balance is paid by the end of the promotional period. If anything is left, the interest from the purchase date is added at once. A true 0% plan charges no interest either way.' },
        { question: 'How is an EMI different from a flat-rate installment?', answer: 'An EMI uses the reducing balance: interest is charged only on what you still owe. A flat rate charges interest on the original amount for the whole term, so the same quoted rate costs considerably more.' },
        { question: 'What if the interest rate is 0%?', answer: 'The EMI is simply the amount financed divided by the number of months: $1,500 over 12 months is $125 a month.' }
      ]
    },
    compute(values) {
      const principal = Math.max(0, values.loanAmount - values.downPayment);
      const monthlyRate = values.annualRate / 100 / 12;
      const emi = monthlyRate === 0
        ? principal / values.months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, values.months)) / (Math.pow(1 + monthlyRate, values.months) - 1);
      const totalPayment = emi * values.months;
      const totalInterest = totalPayment - principal;
      return { emi, totalPayment, totalInterest, principal };
    }
  },
  {
    id: 'home-affordability-calculator',
    category: 'finance',
    group: 'Home Buying',
    glyph: 'Aff',
    updatedAt: '2026-11-15',
    aliases: ['how much house can i afford calculator', 'home buying budget calculator', 'house affordability calculator', 'affordability calculator'],
    related: ['mortgage-calculator', 'down-payment-savings-calculator', 'closing-cost-estimator-calculator', 'rent-vs-buy-calculator'],
    title: 'Home Affordability Calculator',
    description: 'Find how much house you can afford at three levels — conservative, balanced and maximum — from your income, debt and down payment, with a full PITI breakdown and a 28% front-end / back-end debt-to-income check.',
    example: 'A household earning $96,000 a year with $1,500 of other monthly debt and $40,000 down can afford roughly $190,900 (conservative) to $302,000 (maximum) at 6.5% over 30 years, with a balanced estimate of about $263,300.',
    breakdown: {
      headline: 'balancedHomePrice',
      headlineLabel: 'Balanced affordable home price',
      outputs: [
        { id: 'balancedHomePrice', label: 'Balanced affordable home price', format: 'currency' },
        { id: 'conservativeHomePrice', label: 'Conservative (lower) estimate', format: 'currency' },
        { id: 'maximumHomePrice', label: 'Maximum (upper) estimate', format: 'currency' },
        { id: 'loanAmount', label: 'Loan amount at the balanced price', format: 'currency' },
        { id: 'monthlyPI', label: 'Principal & interest', format: 'currency' },
        { id: 'monthlyPropertyTax', label: 'Property tax', format: 'currency' },
        { id: 'monthlyInsurance', label: 'Homeowners insurance', format: 'currency' },
        { id: 'monthlyPMI', label: 'Mortgage insurance (PMI)', format: 'currency' },
        { id: 'monthlyHOA', label: 'HOA dues', format: 'currency' },
        { id: 'totalMonthlyPayment', label: 'Total monthly housing payment', format: 'currency' },
        { id: 'frontEndRatio', label: 'Front-end ratio (housing ÷ income)', format: 'percent' },
        { id: 'backEndRatio', label: 'Back-end ratio (housing + other debt ÷ income)', format: 'percent' }
      ],
      groups: [
        { title: 'Income & debt', inputs: ['grossAnnualIncome', 'existingMonthlyDebt'] },
        { title: 'Loan', inputs: ['downPayment', 'interestRate', 'termYears'] },
        { title: 'Ongoing housing costs', inputs: ['propertyTaxRate', 'annualInsurance', 'hoaMonthly'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'conservativeHomePrice', label: 'Conservative' },
          { from: 'balancedHomePrice', label: 'Balanced' },
          { from: 'maximumHomePrice', label: 'Maximum' }
        ],
        title: 'Affordable home price by tier',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-15',
      concept: {
        title: '"How much house can I afford" is three numbers, not one',
        paragraphs: [
          'Affordability is the home price your income, debt and down payment support at a monthly housing payment lenders consider acceptable. That payment is checked two ways: the front-end (or housing) ratio, your housing payment alone divided by your gross monthly income, and the back-end (or total) ratio, your housing payment plus every other debt payment divided by the same income. A long-standing lending convention, often called the 28/36 rule, caps the front-end ratio at 28% and the back-end ratio at 36%. Actual underwriting is looser: Fannie Mae\'s own manual-underwriting limit is a 36% back-end ratio (stretchable to 45% with strong credit and reserves), the Consumer Financial Protection Bureau\'s Qualified Mortgage rule generally caps back-end debt at 43%, and loans run through Fannie Mae\'s automated underwriting system can be approved up to a 50% back-end ratio.',
          'This calculator turns that range into three concrete prices: conservative (36% back-end), balanced (43%) and maximum (50%), every tier still capped at the classic 28% front-end ratio. A higher tier is a looser lending ceiling, not a recommendation — carrying debt all the way up to 50% of your income leaves very little room for a job loss, a medical bill or a repair, which is exactly why the conservative tier exists.',
          'The housing payment itself is more than the loan payment. Lenders total PITI: Principal, Interest, property Taxes and homeowners Insurance, plus private mortgage insurance (PMI) if the down payment is under 20% of the price, plus any HOA dues. This calculator builds the full PITI stack for each tier, not just the principal-and-interest figure mortgage-calculator gives for a home price you already have in mind.'
        ]
      },
      howTo: {
        intro: 'Enter your income, other debt and down payment, then the loan terms and your estimated ongoing costs. All three tiers update together.',
        steps: [
          { name: 'Enter your income and other debt', text: 'Gross annual income before tax, and the total of every other monthly debt payment: car loans, student loans, credit card minimums and the like. Do not include rent or the mortgage you are solving for.' },
          { name: 'Enter your down payment, rate and term', text: 'The down payment is the same across all three tiers; only the maximum monthly housing payment each tier allows changes, which changes the home price that payment supports.' },
          { name: 'Add your ongoing costs', text: 'Property tax rate (a percent of the home price per year), an annual homeowners insurance estimate, and any HOA dues. These come straight off the top of the housing payment each tier allows, before PMI, so a higher property tax rate or HOA lowers every tier\'s price.' },
          { name: 'Read the three tiers', text: 'The chart and the headline show the conservative, balanced and maximum home price. The breakdown below is the balanced tier\'s full PITI stack.' },
          { name: 'Check the ratios', text: 'The front-end and back-end ratios at the bottom confirm which constraint is binding at the balanced tier: 28% front-end, or the tier\'s own back-end cap.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each tier caps the monthly housing payment at the lower of 28% of gross income and the tier\'s back-end cap minus other debt, then solves for the home price whose PITI equals that payment.',
        expression: 'Max housing payment = min(0.28 × income, backEndCap × income − otherDebt)\nPITI = P&I + (taxRate ÷ 12) × price + insurance ÷ 12 + PMI + HOA\nP&I = k × (price − down payment), k = the payment on a $1 loan\nPMI applies only if down payment < 20% of price',
        terms: [
          { symbol: 'income', meaning: 'Gross monthly income (annual income ÷ 12).' },
          { symbol: 'otherDebt', meaning: 'Every other monthly debt payment, excluding the housing payment being solved for.' },
          { symbol: 'backEndCap', meaning: '36% (conservative), 43% (balanced) or 50% (maximum) — see the concept section for where each comes from.' },
          { symbol: 'k', meaning: 'The standard amortized-loan payment factor: k = r ÷ (1 − (1 + r)^−n), r the monthly rate, n the number of payments.' },
          { symbol: 'PMI', meaning: 'Assumed at 0.6% of the loan a year below 20% down — the midpoint of Freddie Mac\'s published $30–$70-a-month-per-$100,000 PMI range.' }
        ],
        note: 'Estimates only, not a pre-approval or a promise of credit. A lender also checks your credit score, assets, employment history and the specific loan program, any of which can move the real number in either direction.'
      },
      workedExample: {
        intro: 'A household earns $96,000 a year ($8,000 a month) and pays $1,500 a month toward other debt. They plan a $40,000 down payment, a 6.5% 30-year mortgage, 1.1% annual property tax and $2,110 of annual homeowners insurance, no HOA. What can they afford?',
        rows: [
          { label: '28% front-end cap (0.28 × 8,000)', value: '$2,240 a month' },
          { label: 'Conservative 36% back-end cap (0.36 × 8,000 − 1,500)', value: '$1,380 a month (binding)' },
          { label: 'Balanced 43% back-end cap (0.43 × 8,000 − 1,500)', value: '$1,940 a month (binding)' },
          { label: 'Maximum 50% back-end cap (0.50 × 8,000 − 1,500)', value: '$2,500 a month, capped at the $2,240 front-end limit' },
          { label: 'Conservative home price', value: '≈ $190,892' },
          { label: 'Balanced home price', value: '≈ $263,268' },
          { label: 'Maximum home price', value: '≈ $302,041' },
          { label: 'Balanced PITI: P&I $1,411.20 + tax $241.33 + insurance $175.83 + PMI $111.63', value: '≈ $1,940 a month' }
        ],
        result: 'Affordable price ≈ $190,900–$302,000, balanced estimate ≈ $263,300',
        explanation: 'At the conservative and balanced tiers, the back-end ratio (all debt against income) is the binding limit, which is why extra monthly debt shrinks those two prices directly. At the maximum tier, the back-end cap (50%) is loose enough that the classic 28% front-end limit binds instead, which is why the maximum tier\'s own back-end ratio works out to only 46.75%, not the full 50%.'
      },
      watchOut: [
        { title: 'The maximum tier is a ceiling, not a target', body: 'Lenders can approve up to roughly a 50% back-end ratio through automated underwriting, but that leaves little slack for a rate increase, a repair bill or a job change. Many buyers are more comfortable well below it.' },
        { title: 'Property tax and insurance vary a lot by location', body: 'Both are entered as your own estimates. A county with a 2% property tax rate or a coastal home with a much higher insurance premium can cut the affordable price noticeably versus this calculator\'s defaults.' },
        { title: 'PMI is an assumption, not your quote', body: 'Real PMI depends on your credit score, loan type and down payment and commonly runs from about 0.3% to 1.5% of the loan a year. This calculator uses a 0.6% midpoint; your actual quote can be higher or lower.' },
        { title: 'Other debt matters more than it looks', body: 'Because the back-end cap is shared between housing and other debt, every extra $100 of other monthly debt payments lowers the conservative and balanced home prices by roughly the amount a $100 smaller housing payment would support.' },
        { title: 'Not a pre-approval', body: 'A real lender checks your credit score, assets, employment history, and the specific loan program\'s own rules, any of which can move the real approved amount up or down from this estimate.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, What is a debt-to-income ratio?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-en-1791/' },
        { label: 'Consumer Financial Protection Bureau, Regulation Z §1026.43, Minimum standards for transactions secured by a dwelling (Qualified Mortgage, 43% DTI)', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/43/' },
        { label: 'Fannie Mae Selling Guide, B3-6-02, Debt-to-Income Ratios', url: 'https://selling-guide.fanniemae.com/sel/b3-6-02/debt-income-ratios' },
        { label: 'Freddie Mac, My Home: Breaking down PMI', url: 'https://myhome.freddiemac.com/buying/breaking-down-pmi' },
        { label: 'Freddie Mac, My Home: What Are Closing Costs and How Much Will I Pay? (national average homeowners insurance premium)', url: 'https://myhome.freddiemac.com/blog/homebuying/what-are-closing-costs-and-how-much-will-i-pay' },
        { label: 'Bankrate, What is the 28/36 rule?', url: 'https://www.bankrate.com/real-estate/what-is-the-28-36-rule/' }
      ]
    },
    inputs: [
      { id: 'grossAnnualIncome', label: 'Gross annual income', type: 'currency', placeholder: '96000', defaultValue: 96000, step: 1000, min: 0 },
      { id: 'existingMonthlyDebt', label: 'Other monthly debt payments', type: 'currency', placeholder: '1500', defaultValue: 1500, step: 50, min: 0 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '40000', defaultValue: 40000, step: 1000, min: 0 },
      { id: 'interestRate', label: 'Interest rate (APR)', type: 'percent', placeholder: '6.5', defaultValue: 6.5, step: 0.01, min: 0 },
      { id: 'termYears', label: 'Loan term', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1, dimension: 'term', unit: 'yr' },
      { id: 'propertyTaxRate', label: 'Property tax rate (annual, % of price)', type: 'percent', placeholder: '1.1', defaultValue: 1.1, step: 0.05, min: 0 },
      { id: 'annualInsurance', label: 'Homeowners insurance (annual estimate)', type: 'currency', placeholder: '2110', defaultValue: 2110, step: 50, min: 0 },
      { id: 'hoaMonthly', label: 'HOA dues (monthly)', type: 'currency', placeholder: '0', defaultValue: 0, step: 25, min: 0 }
    ],
    seo: {
      title: 'Home Affordability Calculator – How Much House?',
      description: 'See how much house you can afford at conservative, balanced and maximum levels, with a full PITI breakdown and a 28% front-end / back-end debt-to-income check.',
      faq: [
        { question: 'How much house can I afford?', answer: 'It depends which lending ceiling you use. With $8,000 a month in gross income, $1,500 of other debt and $40,000 down at 6.5% over 30 years, this calculator gives about $190,900 conservatively, $263,300 on a balanced basis and $302,000 at the loosest ceiling lenders use.' },
        { question: 'What is the 28/36 rule?', answer: 'A long-standing guideline: keep your housing payment at or under 28% of gross monthly income (the front-end ratio) and all debt payments combined at or under 36% (the back-end ratio). This calculator\'s conservative tier uses exactly those two caps.' },
        { question: 'Why does this calculator show three different numbers?', answer: 'Because real lending limits span a range: Fannie Mae\'s manual-underwriting back-end cap is 36%, the CFPB\'s Qualified Mortgage rule generally allows up to 43%, and loans approved through automated underwriting can go to 50%. The front-end ratio stays capped at 28% in all three.' },
        { question: 'Does the result include taxes and insurance?', answer: 'Yes. Unlike a plain loan-payment calculation, this result is the full PITI stack: principal, interest, property tax, homeowners insurance, PMI below 20% down, and any HOA dues, all added up to the monthly payment each tier allows.' },
        { question: 'When do I need mortgage insurance (PMI)?', answer: 'Generally when your down payment is under 20% of the home price. This calculator checks that automatically for each tier and adds an assumed PMI cost (0.6% of the loan a year) when it applies.' },
        { question: 'Does more other debt really lower how much house I can afford?', answer: 'Yes, directly, at the conservative and balanced tiers, because the back-end cap is a shared budget between housing and every other debt payment. In the example, raising other debt by $300 a month lowers the balanced home price by tens of thousands of dollars.' },
        { question: 'Should I borrow up to the maximum tier?', answer: 'Not necessarily. The maximum tier shows what an automated underwriting system can approve, not what is comfortable. A back-end ratio near 50% leaves little room for a rate reset, a repair, or a drop in income.' },
        { question: 'How does this differ from the mortgage calculator?', answer: 'Mortgage-calculator finds the payment (or price) for a home you already have in mind. This calculator works the other direction, starting from income and debt to find what price range is realistic in the first place, with the full PITI and DTI check mortgage-calculator does not do.' }
      ]
    },
    compute(values) {
      const grossMonthlyIncome = values.grossAnnualIncome / 12;
      const k = loanPayment(1, Math.max(1, values.termYears * 12), values.interestRate);
      const taxRateMonthly = values.propertyTaxRate / 100 / 12;
      const insuranceMonthly = values.annualInsurance / 12;
      const pmiRateMonthly = PMI_RATE_ANNUAL_PERCENT / 100 / 12;

      const tierFor = (backEndCap: number) => {
        const maxFrontEnd = 0.28 * grossMonthlyIncome;
        const maxBackEnd = backEndCap * grossMonthlyIncome - values.existingMonthlyDebt;
        const maxHousingPayment = Math.max(0, Math.min(maxFrontEnd, maxBackEnd));
        return { maxHousingPayment, ...affordableHomePrice(maxHousingPayment, values.downPayment, k, taxRateMonthly, insuranceMonthly, values.hoaMonthly, pmiRateMonthly) };
      };

      const conservative = tierFor(0.36);
      const balanced = tierFor(0.43);
      const maximum = tierFor(0.5);

      return {
        conservativeHomePrice: conservative.homePrice,
        balancedHomePrice: balanced.homePrice,
        maximumHomePrice: maximum.homePrice,
        loanAmount: balanced.loanAmount,
        monthlyPI: balanced.monthlyPI,
        monthlyPropertyTax: balanced.monthlyTax,
        monthlyInsurance: insuranceMonthly,
        monthlyPMI: balanced.monthlyPMI,
        monthlyHOA: values.hoaMonthly,
        totalMonthlyPayment: balanced.maxHousingPayment,
        frontEndRatio: (balanced.maxHousingPayment / grossMonthlyIncome) * 100,
        backEndRatio: ((balanced.maxHousingPayment + values.existingMonthlyDebt) / grossMonthlyIncome) * 100
      };
    }
  },
  {
    id: 'mortgage-refinance-calculator',
    category: 'finance',
    group: 'Mortgages & Loans',
    glyph: 'Refi',
    updatedAt: '2026-11-15',
    aliases: ['refinance calculator', 'mortgage refinance break-even calculator', 'should i refinance calculator', 'refi savings calculator'],
    related: ['mortgage-calculator', 'loan-prepayment-calculator', 'home-affordability-calculator', 'closing-cost-estimator-calculator'],
    title: 'Mortgage Refinance Calculator',
    description: 'Find the monthly savings from refinancing your mortgage, the break-even point on the closing costs, and how the lifetime interest on the new loan compares with staying on your current one.',
    example: 'Refinancing a $280,000 balance with 25 years left at 6.5% into a new 30-year loan at 5.5% saves about $300.77 a month and breaks even on $5,000 of closing costs in about 16.6 months — but costs about $5,157 more in total interest, because the term resets to 30 years.',
    breakdown: {
      headline: 'breakEvenMonths',
      headlineLabel: 'Break-even time',
      outputs: [
        { id: 'breakEvenMonths', label: 'Break-even time', format: 'number', dimension: 'term', unit: 'mo' },
        { id: 'currentPayment', label: 'Current monthly payment', format: 'currency' },
        { id: 'newPayment', label: 'New monthly payment', format: 'currency' },
        { id: 'monthlySavings', label: 'Monthly savings', format: 'currency' },
        { id: 'lifetimeInterestOld', label: 'Remaining lifetime interest, current loan', format: 'currency' },
        { id: 'lifetimeInterestNew', label: 'Lifetime interest, new loan', format: 'currency' },
        { id: 'lifetimeInterestChange', label: 'Lifetime interest change (new − current)', format: 'currency' }
      ],
      groups: [
        { title: 'Current loan', inputs: ['currentLoanBalance', 'currentRate', 'currentRemainingYears'] },
        { title: 'New loan offer', inputs: ['newRate', 'newTermYears', 'closingCosts'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'currentPayment', label: 'Current payment' },
          { from: 'newPayment', label: 'New payment' }
        ],
        title: 'Monthly payment, current vs. refinanced',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-15',
      concept: {
        title: 'When refinancing actually pays off',
        paragraphs: [
          'Refinancing replaces your current mortgage with a new one, usually to get a lower rate, a shorter term, or both. The new loan is not free: it carries its own closing costs (appraisal, title, origination and the like), so the real question is not just "is the new rate lower" but "do the monthly savings earn back those closing costs before I sell the home or refinance again." The break-even point is the number of months it takes: closing costs divided by the monthly savings, a formula the Federal Reserve Board\'s own consumer guide to refinancing uses directly.',
          'A lower rate does not automatically mean a better deal. If the new loan resets the term — say, from 25 years left on the current loan to a fresh 30-year term — you finance the same balance over more total months. That can lower the monthly payment and still raise the total interest paid over the life of the loan. This calculator shows both the monthly savings and the lifetime interest on each loan side by side, so a payment drop that quietly costs more overall does not go unnoticed.',
          'Compare the break-even point with how long you actually expect to stay in the home or keep the loan. A 16-month break-even is an easy call if you plan to stay 10 more years; it is a much closer call if you might move or refinance again within two.'
        ]
      },
      howTo: {
        intro: 'Enter your current loan, then the new loan you are being offered.',
        steps: [
          { name: 'Enter your current loan', text: 'The remaining balance, the current rate, and how many years are left on it (not the original term).' },
          { name: 'Enter the new loan', text: 'The new rate, the new loan\'s term in years, and the closing costs you would pay to refinance. This calculator assumes the same balance is refinanced, with no cash taken out.' },
          { name: 'Read the monthly savings', text: 'The current and new payments are compared directly; the difference is your monthly savings (or cost, if the new payment is higher).' },
          { name: 'Check the break-even point', text: 'Closing costs divided by the monthly savings. Compare it with how long you plan to keep the loan.' },
          { name: 'Check the lifetime interest', text: 'The two lifetime-interest figures show whether the new loan costs more or less in total, which a monthly-payment comparison alone can miss when the term changes.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Both payments use the standard amortized-loan formula on the same balance, at each loan\'s own rate and remaining term.',
        expression: 'currentPayment = M(balance, currentRate, remainingMonths)\nnewPayment = M(balance, newRate, newMonths)\nmonthlySavings = currentPayment − newPayment\nbreakEvenMonths = closingCosts ÷ monthlySavings\nlifetimeInterest = payment × months − balance',
        terms: [
          { symbol: 'M(...)', meaning: 'The loan-calculator payment formula: M = P × r ÷ (1 − (1 + r)^−n).' },
          { symbol: 'balance', meaning: 'The current remaining loan balance, refinanced in full, with no cash taken out.' },
          { symbol: 'remainingMonths, newMonths', meaning: 'Months left on the current loan, and the new loan\'s own term in months.' },
          { symbol: 'breakEvenMonths', meaning: 'How long the monthly savings take to repay the closing costs. No answer if the new payment is not actually lower.' }
        ],
        note: 'Estimates only, not a loan offer. A cash-out refinance, a rate buy-down with points, or rolling the closing costs into the new balance changes these numbers and is not modeled here; the Federal Reserve\'s own worked example also applies an after-tax adjustment to the monthly savings, which this calculator does not.'
      },
      workedExample: {
        intro: 'You owe $280,000 with 25 years left at 6.5%. A lender offers a new 30-year loan at 5.5%, with $5,000 in closing costs. Is it worth it?',
        rows: [
          { label: 'Current payment (280,000, 6.5%, 300 months left)', value: '$1,890.58' },
          { label: 'New payment (280,000, 5.5%, 360 months)', value: '$1,589.81' },
          { label: 'Monthly savings', value: '$300.77' },
          { label: 'Break-even (5,000 ÷ 300.77)', value: '≈ 16.6 months' },
          { label: 'Remaining lifetime interest, current loan (1,890.58 × 300 − 280,000)', value: '≈ $287,174' },
          { label: 'Lifetime interest, new loan (1,589.81 × 360 − 280,000)', value: '≈ $292,331' },
          { label: 'Lifetime interest change', value: '≈ +$5,157' }
        ],
        result: 'Breaks even in ≈ 16.6 months, but costs ≈ $5,157 more in total interest',
        explanation: 'The lower rate saves $300.77 a month and earns back the $5,000 closing cost in under a year and a half — a clear win if you plan to stay in the home. But resetting the clock from 25 remaining years to a fresh 30-year term adds five more years of payments, which is why the new loan\'s lifetime interest is higher even though every individual payment is smaller.'
      },
      watchOut: [
        { title: 'The clock resets', body: 'A new loan usually starts its amortization over. Refinancing into the same term you have left, rather than a fresh 30 years, avoids the lifetime-interest increase this example shows.' },
        { title: 'Break-even versus how long you will stay', body: 'A fast break-even is a weak reason to refinance if you plan to sell or refinance again before reaching it. A slow break-even can still be worth it if you are certain you are staying for decades.' },
        { title: 'Closing costs can be rolled in', body: 'Some lenders let you add the closing costs to the new loan balance instead of paying them upfront. That raises the balance being financed, which this calculator does not model — if you roll costs in, your real break-even and lifetime interest both shift.' },
        { title: 'Cash-out refinancing is different', body: 'Taking extra cash out increases the balance beyond what this calculator assumes, raising both the new payment and the lifetime interest.' },
        { title: 'Rates change daily', body: 'Shop more than one lender close together; mortgage rates move daily and lender fees vary.' }
      ],
      references: [
        { label: 'Federal Reserve Board, A Consumer\'s Guide to Mortgage Refinancings', url: 'https://www.federalreserve.gov/pubs/refinancings' },
        { label: 'Consumer Financial Protection Bureau, Loan Estimate Explainer', url: 'https://www.consumerfinance.gov/owning-a-home/loan-estimate/' },
        { label: 'OpenStax, Contemporary Mathematics, §6.8 The Basics of Loans', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans' }
      ]
    },
    inputs: [
      { id: 'currentLoanBalance', label: 'Current loan balance', type: 'currency', placeholder: '280000', defaultValue: 280000, step: 1000, min: 0 },
      { id: 'currentRate', label: 'Current interest rate (APR)', type: 'percent', placeholder: '6.5', defaultValue: 6.5, step: 0.01, min: 0 },
      { id: 'currentRemainingYears', label: 'Years remaining on current loan', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 1, dimension: 'term', unit: 'yr' },
      { id: 'newRate', label: 'New interest rate (APR)', type: 'percent', placeholder: '5.5', defaultValue: 5.5, step: 0.01, min: 0 },
      { id: 'newTermYears', label: 'New loan term', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1, dimension: 'term', unit: 'yr' },
      { id: 'closingCosts', label: 'Closing costs to refinance', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 100, min: 0 }
    ],
    seo: {
      title: 'Mortgage Refinance Calculator – Break-Even Point',
      description: 'Free mortgage refinance calculator: monthly savings, the break-even point on closing costs, and how the lifetime interest compares to your current loan.',
      faq: [
        { question: 'How do I calculate the break-even point on a refinance?', answer: 'Divide the closing costs by the monthly savings. The Federal Reserve Board\'s own refinancing guide uses this formula. $5,000 in closing costs against $300.77 in monthly savings breaks even in about 16.6 months.' },
        { question: 'Can refinancing cost more even if my payment goes down?', answer: 'Yes. If the new loan resets the amortization to a longer term than you had left, you can pay less each month but more in total interest, exactly as in this calculator\'s worked example.' },
        { question: 'How much are typical refinance closing costs?', answer: 'Similar to a purchase loan, commonly 2% to 5% of the loan amount; the closing cost estimator breaks that down by category.' },
        { question: 'Should I refinance into the same remaining term?', answer: 'It avoids the "resetting the clock" effect. Refinancing a 25-year remaining balance into a new 25-year loan (instead of a fresh 30) keeps the lifetime interest comparison closer to apples-to-apples.' },
        { question: 'Is a shorter break-even always better?', answer: 'It is better, but not the only factor. Compare it against how long you expect to stay in the home; a long break-even can still be worth it if you are certain you will keep the loan for many years.' },
        { question: 'Does this calculator include a cash-out refinance?', answer: 'No. It assumes the same balance is refinanced with no extra cash taken out, and that closing costs are paid upfront rather than added to the new balance.' },
        { question: 'Does it account for taxes?', answer: 'No. The Federal Reserve\'s own example applies an after-tax adjustment to the monthly savings for some borrowers; this calculator compares pre-tax payments.' }
      ]
    },
    compute(values) {
      const currentMonths = Math.max(1, values.currentRemainingYears * 12);
      const newMonths = Math.max(1, values.newTermYears * 12);
      const currentPayment = loanPayment(values.currentLoanBalance, currentMonths, values.currentRate);
      const newPayment = loanPayment(values.currentLoanBalance, newMonths, values.newRate);
      const monthlySavings = currentPayment - newPayment;
      const breakEvenMonths = monthlySavings > 0 ? values.closingCosts / monthlySavings : Infinity;
      const lifetimeInterestOld = currentPayment * currentMonths - values.currentLoanBalance;
      const lifetimeInterestNew = newPayment * newMonths - values.currentLoanBalance;
      return {
        breakEvenMonths,
        currentPayment,
        newPayment,
        monthlySavings,
        lifetimeInterestOld,
        lifetimeInterestNew,
        lifetimeInterestChange: lifetimeInterestNew - lifetimeInterestOld
      };
    }
  },
  {
    id: 'down-payment-savings-calculator',
    category: 'finance',
    group: 'Home Buying',
    glyph: 'DP',
    updatedAt: '2026-11-15',
    aliases: ['down payment calculator', 'home down payment savings calculator', 'save for a down payment calculator', 'down payment goal calculator'],
    related: ['compound-interest-calculator', 'home-affordability-calculator', 'mortgage-calculator', 'closing-cost-estimator-calculator'],
    title: 'Down Payment Savings Calculator',
    description: 'Find how long it will take to save a down payment goal from your current savings, a monthly contribution and an interest rate, or work back to the contribution, start or rate you need.',
    example: 'Starting with $5,000, adding $500 a month at 3.5% a year, reaching a $60,000 down payment takes about 93.2 months, or 7.8 years.',
    solver: {
      defaultTarget: 'years',
      variables: [
        { id: 'targetDownPayment', label: 'Down payment goal', symbol: 'G', dimension: 'currency', defaultValue: 60000, defaultUnit: 'currency' },
        { id: 'currentSavings', label: 'Current savings', symbol: 'P', dimension: 'currency', defaultValue: 5000, defaultUnit: 'currency' },
        { id: 'monthlyContribution', label: 'Monthly contribution', symbol: 'C', dimension: 'currency', defaultValue: 500, defaultUnit: 'currency', fixed: true },
        { id: 'years', label: 'Time to reach the goal', symbol: 't', dimension: 'term', defaultValue: 7.76, defaultUnit: 'yr', bounds: [0, 100] },
        { id: 'annualRate', label: 'Annual interest rate', symbol: 'r', dimension: 'percent', defaultValue: 3.5, defaultUnit: '%', bounds: [0, 100] }
      ],
      // `years` arrives in months (the term dimension's base); compounding is monthly, same convention as compound-interest-calculator.
      solve: {
        years: ({ targetDownPayment, currentSavings, monthlyContribution, annualRate }) => {
          const i = annualRate / 100 / 12;
          if (i === 0) return monthlyContribution > 0 ? (targetDownPayment - currentSavings) / monthlyContribution : NaN;
          const months = Math.log((targetDownPayment * i + monthlyContribution) / (currentSavings * i + monthlyContribution)) / Math.log(1 + i);
          return months >= 0 ? months : NaN;
        },
        targetDownPayment: ({ currentSavings, monthlyContribution, years, annualRate }) =>
          currentSavings * growthFactor(annualRate, 12, years) + monthlyContribution * annuityFactor(annualRate, 12, years),
        currentSavings: ({ targetDownPayment, monthlyContribution, years, annualRate }) => {
          const start = (targetDownPayment - monthlyContribution * annuityFactor(annualRate, 12, years)) / growthFactor(annualRate, 12, years);
          return years >= 0 && start >= 0 ? start : NaN;
        }
      },
      // The rate has no closed form: the widget finds it numerically.
      equation: (si) =>
        si.targetDownPayment - (si.currentSavings * growthFactor(si.annualRate, 12, si.years) + si.monthlyContribution * annuityFactor(si.annualRate, 12, si.years)),
      outputs: [
        { id: 'totalContributions', label: 'Total you contribute', dimension: 'currency', compute: (si) => si.monthlyContribution * si.years },
        { id: 'totalInterest', label: 'Interest earned', dimension: 'currency', compute: (si) => si.targetDownPayment - si.currentSavings - si.monthlyContribution * si.years }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'currentSavings', label: 'Current savings' },
            { from: 'totalContributions', label: 'Contributions' },
            { from: 'totalInterest', label: 'Interest' }
          ],
          center: 'targetDownPayment',
          centerSub: 'down payment goal'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-15',
      concept: {
        title: 'Saving for a down payment is a short-term goal',
        paragraphs: [
          'The math here is the same future-value-with-contributions formula as compound-interest-calculator — a starting balance plus a monthly deposit, growing at a monthly rate. The difference is what you solve for: compound-interest-calculator usually asks "how much will this grow to," while this calculator is built around "how long will it take to reach a specific dollar goal," the question a down payment actually poses.',
          'A down payment is usually needed in a few years, not decades, which changes where the money should sit. Growth that might make sense for a retirement account can mean real losses right when you need the cash for a closing, so down payment savings are commonly kept in a high-yield savings account, a money-market account or a short certificate of deposit rather than invested in stocks. Keep the rate you enter modest and realistic for a cash account, not a long-run market return.',
          'The goal itself should be the down payment alone, not the whole cost of buying. Closing costs are a separate cash need on top of it, and a down payment under 20% of the home price usually adds private mortgage insurance to the monthly payment — home-affordability-calculator and mortgage-calculator both take the down payment you land on here as their own input.'
        ]
      },
      howTo: {
        intro: 'Enter your monthly contribution (always an input), then any three of the other four fields. The one you have left alone longest, marked auto, is calculated.',
        steps: [
          { name: 'Enter your monthly contribution', text: 'How much you plan to set aside each month toward the down payment.' },
          { name: 'Find the time to your goal', text: 'Type the down payment goal, your current savings and the rate the account earns. The time to reach the goal is calculated.' },
          { name: 'Solve for a different field', text: 'Type into the time field to make it an input instead, and leave the start or the goal alone to solve for one of those.' },
          { name: 'Find the rate you need', text: 'With the goal, start, contribution and time filled in, leaving the rate alone longest makes the calculator search for the rate that gets you there on schedule.' },
          { name: 'Read the breakdown', text: 'Below the result, see how much of the goal comes from your own contributions versus interest earned.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The goal is the current savings grown for t months, plus the future value of a deposit made at the end of every month — the same formula compound-interest-calculator uses, solved here for the time, t.',
        expression: 'G = P × (1 + i)^t + C × ((1 + i)^t − 1) ÷ i\ni = r ÷ 100 ÷ 12\nt = ln((G × i + C) ÷ (P × i + C)) ÷ ln(1 + i)',
        terms: [
          { symbol: 'G', meaning: 'Down payment goal.' },
          { symbol: 'P', meaning: 'Current savings already set aside.' },
          { symbol: 'C', meaning: 'Contribution added at the end of each month.' },
          { symbol: 'r, i', meaning: 'Annual interest rate, and the monthly rate as a decimal: 3.5% a year is 0.0029167 a month.' },
          { symbol: 't', meaning: 'Months until the goal is reached. With i = 0, t = (G − P) ÷ C.' }
        ],
        note: 'Estimates only, not financial advice. Rates on savings accounts and CDs change over time, and this assumes a constant rate and a contribution that never varies.'
      },
      workedExample: {
        intro: 'You have $5,000 saved toward a $60,000 down payment, add $500 at the end of every month, and the account earns 3.5% a year. How long until you reach the goal?',
        rows: [
          { label: 'Monthly rate (i = 3.5% ÷ 12)', value: '0.0029167' },
          { label: 't = ln((60,000 × i + 500) ÷ (5,000 × i + 500)) ÷ ln(1 + i)', value: '93.17 months' },
          { label: 'In years (93.17 ÷ 12)', value: '≈ 7.76 years' },
          { label: 'Total contributions (500 × 93.17)', value: '≈ $46,585.84' },
          { label: 'Interest earned (60,000 − 5,000 − 46,585.84)', value: '≈ $8,414.16' }
        ],
        result: 'About 93.2 months (≈ 7.8 years) to reach the $60,000 goal',
        explanation: 'Contributions alone (500 × 93.17 ≈ $46,586) make up most of the goal; interest adds the remaining ≈ $8,414. At a 0% rate the same goal would take (60,000 − 5,000) ÷ 500 = 110 months, about 17 months longer, since no interest would be doing any of the work.'
      },
      watchOut: [
        { title: 'The down payment is not the whole cash you need', body: 'Closing costs are a separate expense on top of the down payment, commonly 2% to 5% of the home price. Budget for both, not just the figure this calculator solves for.' },
        { title: 'Keep the assumed rate realistic for cash', body: 'A high-yield savings account or CD rate, not a long-run stock-market return, belongs here. A short-term goal invested in the market can lose value right when you need it.' },
        { title: '20% down avoids mortgage insurance', body: 'A down payment under 20% of the home price usually adds PMI to the monthly payment (see home-affordability-calculator and mortgage-calculator). Decide whether your goal targets 20% or a smaller, faster-to-reach down payment.' },
        { title: 'A fixed contribution is a simplification', body: 'Real savings plans rarely stay perfectly level: a bonus, a raise or a lean month all change the real payoff date. Rerun the numbers whenever your monthly contribution changes meaningfully.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, Determine your down payment', url: 'https://www.consumerfinance.gov/owning-a-home/prepare/determine-your-down-payment/' },
        { label: 'OpenStax, Contemporary Mathematics, §6.4 Compound Interest', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest' },
        { label: 'U.S. Securities and Exchange Commission, Investor.gov glossary: Compound interest', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest' }
      ]
    },
    inputs: [
      { id: 'targetDownPayment', label: 'Down payment goal', type: 'currency', placeholder: '60000', defaultValue: 60000, step: 1000, min: 0 },
      { id: 'currentSavings', label: 'Current savings', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 500, min: 0 },
      { id: 'monthlyContribution', label: 'Monthly contribution', type: 'currency', placeholder: '500', defaultValue: 500, step: 25, min: 0 },
      { id: 'annualRate', label: 'Annual interest rate', type: 'percent', placeholder: '3.5', defaultValue: 3.5, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Down Payment Savings Calculator – Time to Goal',
      description: 'Free down payment savings calculator: how long it takes to reach a down payment goal, or the contribution, start or rate you need, with interest broken out.',
      faq: [
        { question: 'How long will it take to save a down payment?', answer: 'Starting with $5,000, adding $500 a month at 3.5% a year, reaching $60,000 takes about 93.2 months, or 7.8 years. Enter your own numbers to solve for your timeline.' },
        { question: 'How is the time to a savings goal calculated?', answer: 't = ln((G × i + C) ÷ (P × i + C)) ÷ ln(1 + i), where G is the goal, P the current savings, C the monthly contribution and i the monthly rate. It is the same formula compound-interest-calculator uses, solved for time instead of future value.' },
        { question: 'How much faster does a higher contribution get me there?', answer: 'Significantly. In the example, raising the contribution from $500 to $700 a month cuts the time from about 93.2 months to about 65.4 months, nearly two years sooner.' },
        { question: 'What interest rate should I use?', answer: 'A rate that matches where the money actually sits, usually a high-yield savings account, money-market account or CD, not a long-run stock-market return. A short-term goal should not be exposed to market swings.' },
        { question: 'Does this include closing costs?', answer: 'No. The goal here is the down payment only. Closing costs are a separate cash need on top of it; see the closing cost estimator for a breakdown by category.' },
        { question: 'What contribution do I need to reach my goal by a certain date?', answer: 'Fill in the goal, your current savings, the rate and the time you have, and leave the monthly contribution alone longest: the calculator finds the contribution that gets you there on schedule.' },
        { question: 'How does a bigger down payment change my mortgage?', answer: 'A larger down payment lowers the loan amount and the monthly payment, and reaching 20% of the home price typically removes the need for private mortgage insurance. See mortgage-calculator and home-affordability-calculator.' }
      ]
    },
    compute(values) {
      const i = values.annualRate / 100 / 12;
      const months = i === 0
        ? (values.monthlyContribution > 0 ? (values.targetDownPayment - values.currentSavings) / values.monthlyContribution : NaN)
        : Math.log((values.targetDownPayment * i + values.monthlyContribution) / (values.currentSavings * i + values.monthlyContribution)) / Math.log(1 + i);
      const totalContributions = values.monthlyContribution * months;
      const totalInterest = values.targetDownPayment - values.currentSavings - totalContributions;
      return { years: months / 12, totalContributions, totalInterest };
    }
  },
  {
    id: 'closing-cost-estimator-calculator',
    category: 'finance',
    group: 'Home Buying',
    glyph: 'CC',
    updatedAt: '2026-11-15',
    aliases: ['closing costs calculator', 'home closing cost calculator', 'mortgage closing costs estimator', 'closing cost estimator'],
    related: ['mortgage-calculator', 'home-affordability-calculator', 'down-payment-savings-calculator', 'mortgage-refinance-calculator'],
    title: 'Closing Cost Estimator',
    description: 'Estimate total closing costs on a home purchase from a cited percentage range of the price and loan amount, split into the loan origination fee and everything else: title, appraisal, recording and more.',
    example: 'On a $350,000 home with a $280,000 loan, closing costs typically run about $7,000 to $17,500 (2%-5% of the price), around $12,250 in the middle, including roughly $1,400-$2,800 of loan origination fees.',
    breakdown: {
      headline: 'midEstimate',
      headlineLabel: 'Estimated total closing costs',
      outputs: [
        { id: 'midEstimate', label: 'Estimated total (midpoint)', format: 'currency' },
        { id: 'overallLow', label: 'Low end (2% of home price)', format: 'currency' },
        { id: 'overallHigh', label: 'High end (5% of home price)', format: 'currency' },
        { id: 'originationLow', label: 'Loan origination fee, low (0.5% of loan)', format: 'currency' },
        { id: 'originationHigh', label: 'Loan origination fee, high (1% of loan)', format: 'currency' },
        { id: 'otherLow', label: 'Everything else, low', format: 'currency' },
        { id: 'otherHigh', label: 'Everything else, high', format: 'currency' },
        { id: 'midPercentOfPrice', label: 'Midpoint as % of home price', format: 'percent' }
      ],
      groups: [{ title: 'Your purchase', inputs: ['homePrice', 'loanAmount'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'originationMid', label: 'Loan origination fee' },
          { from: 'otherMid', label: 'Everything else' }
        ],
        center: 'midEstimate',
        centerSub: 'estimated total'
      },
      derive: (v) => ({
        originationMid: (v.originationLow + v.originationHigh) / 2,
        otherMid: v.midEstimate - (v.originationLow + v.originationHigh) / 2
      })
    },
    content: {
      lastReviewed: '2026-11-15',
      concept: {
        title: 'What closing costs actually are',
        paragraphs: [
          'Closing costs are the fees paid at closing on top of the down payment: lender charges, third-party services, government recording charges, and prepaid items like the first year of homeowners insurance. Both the Consumer Financial Protection Bureau and Freddie Mac\'s My Home guide put the typical total at 2% to 5% of the home purchase price, which is the range this estimator uses.',
          'Only one piece of that total comes with its own widely cited percentage: the loan origination fee, which Freddie Mac\'s guide puts at "typically between 0.5% and 1% of the total loan amount." Everything else — appraisal, title search and insurance, government recording costs, credit report and underwriting fees, a home inspection, an attorney, a survey — does not have one standard percentage, because it depends heavily on your state, your lender and the property. This calculator estimates the origination fee on its own cited range and groups the rest into "everything else," the remainder of the overall 2-5% band once origination is taken out, rather than inventing a percentage for each individual line item.',
          'Closing costs are separate money from the down payment. A buyer needs both at the closing table; down-payment-savings-calculator and home-affordability-calculator size the down payment itself, and this estimator covers the additional cash the closing table requires on top of it.'
        ]
      },
      howTo: {
        intro: 'Enter the home price and the amount you expect to finance.',
        steps: [
          { name: 'Enter the home price', text: 'The overall closing-cost range is a percentage of this figure.' },
          { name: 'Enter the loan amount', text: 'The home price minus your planned down payment. The loan origination fee range is a percentage of this figure specifically, not the home price.' },
          { name: 'Read the overall range', text: 'The headline is the midpoint of the cited 2%-5% range; the low and high ends below it show the full range.' },
          { name: 'Check the origination vs. everything-else split', text: 'The chart and rows separate the one line item with its own cited percentage (origination) from every other fee, grouped together.' },
          { name: 'Get a real number', text: 'Ask any lender you are seriously considering for a Loan Estimate. It lists every actual fee for your specific loan, which this estimator cannot know in advance.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Two cited ranges drive the estimate: the overall total is a percentage of the home price, and the loan origination fee specifically is a percentage of the loan amount.',
        expression: 'Total closing costs = 2% to 5% × home price\nLoan origination fee = 0.5% to 1% × loan amount\nEverything else = Total − origination, at each end of the range',
        terms: [
          { symbol: 'home price', meaning: 'The purchase price. The overall 2%-5% range is a percentage of this.' },
          { symbol: 'loan amount', meaning: 'What you plan to finance (home price minus down payment). The origination-fee range is a percentage of this.' },
          { symbol: 'midpoint', meaning: 'The average of the low (2%) and high (5%) ends, shown as the headline estimate.' }
        ],
        note: 'Estimates only, not a Loan Estimate or a quote. Real closing costs vary by state, lender, loan type and property, and some items (owner\'s title insurance, attorney fees, transfer taxes) are not charged everywhere.'
      },
      workedExample: {
        intro: 'You are buying a $350,000 home and financing $280,000. What should you expect to pay in closing costs?',
        rows: [
          { label: 'Low end (2% × 350,000)', value: '$7,000' },
          { label: 'High end (5% × 350,000)', value: '$17,500' },
          { label: 'Midpoint estimate', value: '$12,250' },
          { label: 'Origination fee, low (0.5% × 280,000)', value: '$1,400' },
          { label: 'Origination fee, high (1% × 280,000)', value: '$2,800' },
          { label: 'Origination fee, midpoint', value: '$2,100' },
          { label: 'Everything else, midpoint (12,250 − 2,100)', value: '$10,150' },
          { label: 'Midpoint as % of home price (12,250 ÷ 350,000)', value: '3.5%' }
        ],
        result: 'Estimated total ≈ $12,250 (range $7,000-$17,500), about $2,100 of it the loan origination fee',
        explanation: 'The origination fee is a comparatively small, well-defined slice of the total. The much larger "everything else" category — title insurance, appraisal, recording, credit report, inspection and prepaid items — is where most of the dollar range comes from, which is exactly why this calculator does not try to assign it a single invented percentage.'
      },
      watchOut: [
        { title: 'Location moves the number a lot', body: 'Transfer taxes, attorney-involvement requirements and title insurance rules vary by state and even by county, so the real total can sit anywhere in, or occasionally outside, the cited 2%-5% range.' },
        { title: 'Some fees are shoppable, some are not', body: 'You can often shop for title insurance, a survey or a home inspection. Government recording charges and transfer taxes are fixed by law.' },
        { title: 'This is the buyer\'s side only', body: 'Sellers pay their own closing costs, commonly including the real estate commission, which are not part of this estimate.' },
        { title: 'Costs can be rolled into the loan', body: 'Some lenders let you finance part of the closing costs instead of paying them upfront, which changes your loan amount and the figures here; see mortgage-refinance-calculator\'s own closing-cost watch-out for the same trade-off on a refinance.' },
        { title: 'Your Loan Estimate is the real figure', body: 'Within three business days of applying, lenders must send a Loan Estimate itemizing every actual fee. Compare it against this estimate, not the other way around.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, Determine your down payment (2-5% closing-cost range)', url: 'https://www.consumerfinance.gov/owning-a-home/prepare/determine-your-down-payment/' },
        { label: 'Freddie Mac, My Home: What Are Closing Costs and How Much Will I Pay? (loan origination fee range)', url: 'https://myhome.freddiemac.com/blog/homebuying/what-are-closing-costs-and-how-much-will-i-pay' },
        { label: 'Consumer Financial Protection Bureau, Loan Estimate Explainer', url: 'https://www.consumerfinance.gov/owning-a-home/loan-estimate/' }
      ]
    },
    inputs: [
      { id: 'homePrice', label: 'Home price', type: 'currency', placeholder: '350000', defaultValue: 350000, step: 1000, min: 0 },
      { id: 'loanAmount', label: 'Loan amount', type: 'currency', placeholder: '280000', defaultValue: 280000, step: 1000, min: 0 }
    ],
    seo: {
      title: 'Closing Cost Estimator – Home Buying Cost Range',
      description: 'Free closing cost estimator: a CFPB/Freddie Mac-cited percentage range of the home price and loan amount, split into the origination fee and everything else.',
      faq: [
        { question: 'How much are closing costs on a house?', answer: 'Typically 2% to 5% of the home purchase price, per the CFPB and Freddie Mac. On a $350,000 home that is $7,000 to $17,500, about $12,250 in the middle.' },
        { question: 'What is the loan origination fee?', answer: 'A lender charge for processing, underwriting and funding the loan, typically 0.5% to 1% of the loan amount per Freddie Mac\'s own guide. On a $280,000 loan that is $1,400 to $2,800.' },
        { question: 'What else is included in closing costs besides origination?', answer: 'Appraisal, title search and insurance, government recording charges, credit report and underwriting fees, a home inspection, an attorney and sometimes a survey, plus prepaid items such as the first year of homeowners insurance. None of these has one standard percentage, so this calculator groups them as the remainder of the overall 2%-5% range.' },
        { question: 'Are closing costs the same as the down payment?', answer: 'No, they are separate cash needs at the closing table. Use down-payment-savings-calculator or home-affordability-calculator for the down payment itself, and this estimator for the costs on top of it.' },
        { question: 'Do closing costs vary by state?', answer: 'Yes, significantly. Transfer taxes, attorney requirements and title insurance rules differ by state and county, which is why this is a range, not a single number.' },
        { question: 'Can I avoid paying closing costs upfront?', answer: 'Some lenders let you roll part of the closing costs into the loan balance instead of paying cash at closing, which raises the amount you finance and the total interest you pay over time.' },
        { question: 'Where do I get the real number?', answer: 'Your Loan Estimate, which lenders must provide within three business days of a mortgage application, itemizes every actual fee for your specific loan.' }
      ]
    },
    compute(values) {
      const overallLow = values.homePrice * 0.02;
      const overallHigh = values.homePrice * 0.05;
      const originationLow = values.loanAmount * 0.005;
      const originationHigh = values.loanAmount * 0.01;
      const otherLow = overallLow - originationLow;
      const otherHigh = overallHigh - originationHigh;
      const midEstimate = (overallLow + overallHigh) / 2;
      const midPercentOfPrice = (midEstimate / values.homePrice) * 100;
      return { midEstimate, overallLow, overallHigh, originationLow, originationHigh, otherLow, otherHigh, midPercentOfPrice };
    }
  },
  {
    id: 'rent-vs-buy-calculator',
    category: 'finance',
    group: 'Home Buying',
    glyph: 'R/B',
    updatedAt: '2026-11-15',
    aliases: ['rent or buy calculator', 'should i rent or buy calculator', 'renting vs buying calculator', 'rent versus buy calculator'],
    related: ['home-affordability-calculator', 'mortgage-calculator', 'closing-cost-estimator-calculator', 'down-payment-savings-calculator'],
    title: 'Rent vs. Buy Calculator',
    description: 'Compare the net cost of renting against buying over a chosen number of years, including ongoing ownership costs, home-sale proceeds, and the opportunity cost of the down payment.',
    example: 'Renting a $1,800-a-month apartment versus buying a $350,000 home with $70,000 down at 6.5%: over 10 years, buying costs about $172,200 net versus about $192,260 for renting — buying comes out about $20,061 cheaper under these assumptions.',
    breakdown: {
      headline: 'cheaperOption',
      headlineLabel: 'Cheaper option over the comparison period',
      outputs: [
        { id: 'cheaperOption', label: 'Cheaper option', labels: [{ value: 0, label: 'Renting' }, { value: 1, label: 'Buying' }] },
        { id: 'amountSaved', label: 'Amount saved by the cheaper option', format: 'currency' },
        { id: 'netCostBuying', label: 'Net cost of buying', format: 'currency' },
        { id: 'netCostRenting', label: 'Net cost of renting', format: 'currency' },
        { id: 'totalRent', label: 'Total rent paid', format: 'currency' },
        { id: 'investmentGrowth', label: 'Opportunity cost of the down payment', format: 'currency' },
        { id: 'netSaleProceeds', label: 'Buyer\'s equity if sold at the end', format: 'currency' },
        { id: 'monthlyPI', label: 'Mortgage principal & interest', format: 'currency' }
      ],
      groups: [
        { title: 'Renting', inputs: ['monthlyRent', 'rentGrowthRate'] },
        { title: 'Buying', inputs: ['homePrice', 'downPayment', 'mortgageRate', 'termYears'] },
        { title: 'Ongoing ownership costs', inputs: ['propertyTaxRate', 'annualInsurance', 'maintenanceRate'], optional: true },
        { title: 'Assumptions', inputs: ['homeAppreciationRate', 'investmentReturnRate', 'sellingCostRate'], optional: true },
        { title: 'Comparison period', inputs: ['years'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'netCostRenting', label: 'Renting' },
          { from: 'netCostBuying', label: 'Buying' }
        ],
        title: 'Net cost over the comparison period',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-15',
      concept: {
        title: 'A different question from "can I afford it" or "should I refinance"',
        paragraphs: [
          'Home-affordability-calculator asks what price you can afford, and mortgage-refinance-calculator asks whether refinancing an existing loan pays off. This calculator asks a third, separate question: over a number of years you choose, is it cheaper in total to rent or to buy? "Net cost" on the buying side is everything you would spend — mortgage principal and interest, property tax, insurance, maintenance, and the down payment itself — minus what you would get back if you sold at the end (the home\'s value after it appreciates, less the remaining loan balance and selling costs). "Net cost" on the renting side is the total rent paid, minus the investment growth you give up by buying: if you rent, the money that would have gone to a down payment can stay invested instead, so what it would have earned is credited back to renting as the opportunity cost of that down payment.',
          'The time horizon usually matters more than the headline mortgage rate. Buying carries real fixed costs — the down payment\'s opportunity cost, closing costs, and selling costs when you eventually sell — that are spread over however many years you stay. Over a short horizon those fixed costs dominate and tilt the answer toward renting; over a long horizon, home-price appreciation and the fact that a mortgage payment partly builds equity (while rent never does) usually tilt it toward buying.',
          'Every rate here — rent growth, home-price appreciation, investment return — is an assumption you set, not a forecast. Run the comparison with a cautious and an optimistic set of assumptions and look at the range, the same way investment-calculator recommends for a return rate. This model also holds property tax, insurance and maintenance flat on the home\'s original price for every year of the comparison, rather than growing them each year, which is a simplification worth keeping in mind over a long comparison period.'
        ]
      },
      howTo: {
        intro: 'Enter the rent you are comparing against, the home you are considering buying, your ongoing cost estimates, your assumptions, and how many years you want to compare.',
        steps: [
          { name: 'Enter your rent', text: 'The monthly rent you would otherwise pay, and how much you expect it to rise each year.' },
          { name: 'Enter the home you are considering', text: 'Price, down payment, mortgage rate and loan term.' },
          { name: 'Add ongoing ownership costs', text: 'Property tax rate, an annual homeowners insurance estimate, and a maintenance rate (a percent of the home\'s value set aside each year for upkeep).' },
          { name: 'Set your assumptions', text: 'An assumed annual home-price appreciation rate, the return you could earn by investing the down payment instead, and the selling costs (commission and other fees) you would pay when you eventually sell.' },
          { name: 'Choose the comparison period', text: 'How many years you plan to stay before selling, moving, or refinancing.' },
          { name: 'Read the result', text: 'The headline names the cheaper option under your assumptions and by how much; the rows below break out both sides.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Buying\'s net cost is cash spent minus the equity recovered at a sale; renting\'s net cost is rent paid minus the growth the down payment would have earned if invested instead.',
        expression: 'Buying: cashOut = ΣP&I + ΣTax + ΣInsurance + ΣMaintenance + downPayment\nequity = homePrice × (1 + appreciation)^years − remaining loan balance − sellingCosts\nnetCostBuying = cashOut − equity\n\nRenting: totalRent = Σ rent, growing each year at the rent-growth rate\nopportunityCost = downPayment × ((1 + investmentReturn)^years − 1)\nnetCostRenting = totalRent − opportunityCost',
        terms: [
          { symbol: 'ΣP&I, ΣTax, ΣInsurance, ΣMaintenance', meaning: 'Each cost summed over every year of the comparison period; property tax, insurance and maintenance are held flat on the home\'s original price.' },
          { symbol: 'remaining loan balance', meaning: 'What is still owed on the mortgage at the end of the comparison period, from the standard amortization formula.' },
          { symbol: 'opportunityCost', meaning: 'What the down payment would have grown to if invested at the assumed return, minus the down payment itself — credited to renting, since a renter keeps that money invested instead of putting it into a house.' }
        ],
        note: 'Estimates only, not financial advice. Real appreciation, investment returns and rent growth are never steady, taxes and specific loan fees are not modeled, and a true comparison depends heavily on your own local market and plans.'
      },
      workedExample: {
        intro: 'Rent is $1,800 a month, rising 3% a year. The alternative is a $350,000 home with $70,000 (20%) down, a 30-year loan at 6.5%, 1.1% property tax, $2,110 annual insurance, and 1% of the home\'s value a year for maintenance. Assume 3% annual appreciation, a 6% return on invested cash, and 6% selling costs. Compare over 10 years.',
        rows: [
          { label: 'Monthly P&I (280,000 loan, 6.5%, 30 years)', value: '$1,769.79' },
          { label: 'Total P&I over 10 years', value: '≈ $212,375' },
          { label: 'Remaining loan balance after 10 years', value: '≈ $237,373' },
          { label: 'Total property tax + insurance + maintenance (10 years)', value: '≈ $94,600' },
          { label: 'Home value after 10 years (350,000 × 1.03^10)', value: '≈ $470,371' },
          { label: 'Selling costs (6% of home value)', value: '≈ $28,222' },
          { label: 'Equity at sale (470,371 − 237,373 − 28,222)', value: '≈ $204,775' },
          { label: 'Net cost of buying (212,375 + 94,600 + 70,000 − 204,775)', value: '≈ $172,200' },
          { label: 'Total rent over 10 years (growing 3% a year)', value: '≈ $247,620' },
          { label: 'Opportunity cost of the $70,000 down payment at 6%', value: '≈ $55,359' },
          { label: 'Net cost of renting (247,620 − 55,359)', value: '≈ $192,260' }
        ],
        result: 'Buying ≈ $172,200 net vs. renting ≈ $192,260 net — buying is cheaper by ≈ $20,061 over 10 years',
        explanation: 'Most of buying\'s advantage here comes from home-price appreciation building equity that renting has no equivalent to. Shorten the comparison to 3 years and buying\'s selling costs and closing costs have much less time to be earned back, which typically narrows or reverses the gap — rerun the numbers at your own expected time horizon.'
      },
      watchOut: [
        { title: 'Every rate is an assumption, not a forecast', body: 'Home-price appreciation, investment returns and rent growth all vary year to year and are never known in advance. Run the comparison with a cautious and an optimistic set of numbers.' },
        { title: 'A shorter stay usually favors renting', body: 'Buying and selling both carry one-time costs (closing costs, selling costs) that are spread over however long you stay. The fewer years you stay, the less time those costs have to be earned back.' },
        { title: 'Ongoing costs are held flat here', body: 'Property tax, insurance and maintenance are calculated on the home\'s original price for every year of the comparison, not grown year by year, which understates them somewhat on a long comparison period.' },
        { title: 'Tax effects are not modeled', body: 'Mortgage interest and property tax can be deductible for some itemizing filers, which this calculator does not account for. It also does not model rent being tax-free to the renter either way.' },
        { title: 'Selling costs are a real drag', body: 'Commission and other selling costs apply to the full future home value, not just the gain, which is why they can meaningfully narrow buying\'s advantage over a shorter comparison period.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, Determine your down payment (closing-cost range used elsewhere in this calculator\'s sibling pages)', url: 'https://www.consumerfinance.gov/owning-a-home/prepare/determine-your-down-payment/' },
        { label: 'Redfin, How to Budget for Home Maintenance (1%-4% of home value a year)', url: 'https://www.redfin.com/blog/how-to-budget-for-home-maintenance/' },
        { label: 'Redfin News, Buyer\'s Agent Commissions Tick Up to Pre-NAR Settlement Levels (Q2 2025 average buyer\'s-agent commission)', url: 'https://www.redfin.com/news/commissions-q2-2025/' },
        { label: 'U.S. Bureau of Labor Statistics, Consumer Price Index news release (Rent of primary residence, 12-month change)', url: 'https://www.bls.gov/news.release/archives/cpi_01132026.htm' },
        { label: 'Freddie Mac, My Home: What Are Closing Costs and How Much Will I Pay? (average homeowners insurance premium)', url: 'https://myhome.freddiemac.com/blog/homebuying/what-are-closing-costs-and-how-much-will-i-pay' }
      ]
    },
    inputs: [
      { id: 'monthlyRent', label: 'Monthly rent', type: 'currency', placeholder: '1800', defaultValue: 1800, step: 50, min: 0 },
      { id: 'rentGrowthRate', label: 'Annual rent growth', type: 'percent', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'homePrice', label: 'Home price', type: 'currency', placeholder: '350000', defaultValue: 350000, step: 1000, min: 0 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '70000', defaultValue: 70000, step: 1000, min: 0 },
      { id: 'mortgageRate', label: 'Mortgage rate (APR)', type: 'percent', placeholder: '6.5', defaultValue: 6.5, step: 0.01, min: 0 },
      { id: 'termYears', label: 'Mortgage term', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1, dimension: 'term', unit: 'yr' },
      { id: 'propertyTaxRate', label: 'Property tax rate (annual, % of price)', type: 'percent', placeholder: '1.1', defaultValue: 1.1, step: 0.05, min: 0 },
      { id: 'annualInsurance', label: 'Homeowners insurance (annual)', type: 'currency', placeholder: '2110', defaultValue: 2110, step: 50, min: 0 },
      { id: 'maintenanceRate', label: 'Maintenance (annual, % of price)', type: 'percent', placeholder: '1', defaultValue: 1, step: 0.1, min: 0 },
      { id: 'homeAppreciationRate', label: 'Assumed home-price appreciation', type: 'percent', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'investmentReturnRate', label: 'Assumed return on invested cash', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.1, min: 0 },
      { id: 'sellingCostRate', label: 'Selling costs (% of sale price)', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.5, min: 0 },
      { id: 'years', label: 'Years to compare', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1, dimension: 'term', unit: 'yr' }
    ],
    seo: {
      title: 'Rent vs. Buy Calculator – Net Cost Comparison',
      description: 'Compare the net cost of renting vs. buying over N years, including ownership costs, sale proceeds, and the down payment\'s opportunity cost.',
      faq: [
        { question: 'Is it cheaper to rent or buy?', answer: 'It depends on your numbers and time horizon. In this calculator\'s example — a $1,800 rent versus a $350,000 home with $70,000 down at 6.5% over 10 years — buying comes out about $20,061 cheaper, but a shorter stay or different assumptions can flip the answer.' },
        { question: 'What does "opportunity cost of the down payment" mean?', answer: 'The investment growth you give up by putting cash into a down payment instead of keeping it invested. This calculator credits that growth to renting, since a renter keeps the down payment amount invested instead.' },
        { question: 'Why does the number of years matter so much?', answer: 'Buying and selling both carry one-time costs (closing costs, selling costs) that only pay off the longer you stay. A 3-year comparison and a 10-year comparison with the same home can give very different answers.' },
        { question: 'How is the equity at sale calculated?', answer: 'The home\'s price grown at the assumed appreciation rate for the comparison period, minus the mortgage balance still owed at that point and minus selling costs (commission and other fees) on the sale price.' },
        { question: 'Does this account for the mortgage interest deduction?', answer: 'No. Tax effects are not modeled, on either the buying or the renting side.' },
        { question: 'Why might my real numbers differ from the example?', answer: 'Property tax rates, insurance, maintenance, appreciation and rent growth all vary enormously by location and over time. Use your own local estimates rather than the defaults for a meaningful comparison.' },
        { question: 'How does this differ from home-affordability-calculator?', answer: 'Home-affordability-calculator asks what price you can afford from your income and debt. This calculator assumes you already have a specific home and rent in mind and asks which one costs less in total over the years you choose.' }
      ]
    },
    compute(values) {
      const loanAmount = Math.max(0, values.homePrice - values.downPayment);
      const termMonths = Math.max(1, values.termYears * 12);
      const monthlyPI = loanPayment(loanAmount, termMonths, values.mortgageRate);
      const monthsPaid = Math.min(values.years * 12, termMonths);
      const totalPI = monthlyPI * monthsPaid;
      const remainingBalance = monthsPaid < termMonths
        ? loanAmount * growthFactor(values.mortgageRate, 12, monthsPaid) - monthlyPI * annuityFactor(values.mortgageRate, 12, monthsPaid)
        : 0;
      const annualPropertyTax = (values.propertyTaxRate / 100) * values.homePrice;
      const annualMaintenance = (values.maintenanceRate / 100) * values.homePrice;
      const totalOwnershipCosts = (annualPropertyTax + annualMaintenance) * values.years + values.annualInsurance * values.years;
      const homeValueAtN = values.homePrice * growthFactor(values.homeAppreciationRate, 1, values.years);
      const sellingCosts = homeValueAtN * (values.sellingCostRate / 100);
      const netSaleProceeds = homeValueAtN - remainingBalance - sellingCosts;
      const buyingCashOut = totalPI + totalOwnershipCosts + values.downPayment;
      const netCostBuying = buyingCashOut - netSaleProceeds;

      const totalRent = values.monthlyRent * 12 * annuityFactor(values.rentGrowthRate, 1, values.years);
      const investmentGrowth = values.downPayment * (growthFactor(values.investmentReturnRate, 1, values.years) - 1);
      const netCostRenting = totalRent - investmentGrowth;

      return {
        cheaperOption: netCostBuying < netCostRenting ? 1 : 0,
        amountSaved: Math.abs(netCostRenting - netCostBuying),
        netCostBuying,
        netCostRenting,
        totalRent,
        investmentGrowth,
        netSaleProceeds,
        monthlyPI
      };
    }
  },
  {
    id: 'debt-to-income-calculator',
    category: 'finance',
    group: 'Debt',
    glyph: 'DTI',
    updatedAt: '2026-11-15',
    aliases: ['dti calculator', 'debt to income ratio calculator', 'front end back end ratio calculator', 'dti ratio calculator'],
    related: ['home-affordability-calculator', 'debt-payoff-calculator', 'credit-card-minimum-payment-calculator', 'loan-calculator'],
    title: 'Debt-to-Income (DTI) Ratio Calculator',
    description: 'Calculate your front-end and back-end debt-to-income ratio from gross income and monthly debt payments, checked against the classic 28% / 36% lending guideline.',
    example: 'A household earning $8,000 a month with a $1,940 housing payment and $1,500 of other debt has a 24.25% front-end ratio and a 43.00% back-end ratio — $560 a month over the classic 36% guideline, though within the wider range lenders actually use.',
    breakdown: {
      headline: 'backEndRatio',
      headlineLabel: 'Back-end debt-to-income ratio',
      outputs: [
        { id: 'backEndRatio', label: 'Back-end ratio (housing + other debt ÷ income)', format: 'percent' },
        { id: 'frontEndRatio', label: 'Front-end ratio (housing ÷ income)', format: 'percent' },
        { id: 'totalMonthlyDebt', label: 'Total monthly debt payments', format: 'currency' },
        { id: 'maxHousingAt28', label: 'Max housing payment at the 28% guideline', format: 'currency' },
        { id: 'maxTotalAt36', label: 'Max total debt at the 36% guideline', format: 'currency' },
        { id: 'roomUnder36', label: 'Room left under the 36% guideline (negative = over)', format: 'currency' }
      ],
      groups: [
        { title: 'Income', inputs: ['grossMonthlyIncome'] },
        { title: 'Monthly debt payments', inputs: ['housingPayment', 'otherMonthlyDebt'] }
      ],
      visual: {
        type: 'rangeBar',
        value: 'backEndRatio',
        title: 'Back-end ratio against lender guidelines',
        bands: [
          { label: 'Within the classic 36% guideline', min: 0, max: 36 },
          { label: 'Within the 43% Qualified Mortgage cap', min: 36, max: 43 },
          { label: 'Within the 50% automated-underwriting ceiling', min: 43, max: 50 },
          { label: 'Above typical lending limits', min: 50, max: 150 }
        ]
      }
    },
    content: {
      lastReviewed: '2026-11-15',
      concept: {
        title: 'Front-end vs. back-end: the two DTI ratios lenders check',
        paragraphs: [
          'Your debt-to-income (DTI) ratio is the share of your gross (pre-tax) monthly income that goes to debt payments. Lenders check it two ways: the front-end (or housing) ratio is your housing payment alone divided by gross monthly income; the back-end (or total) ratio adds every other debt payment — car loans, student loans, credit card minimums, personal loans — on top of housing, divided by the same income.',
          'The long-standing 28/36 guideline caps the front-end ratio at 28% and the back-end ratio at 36%. Real underwriting is looser: the Consumer Financial Protection Bureau\'s Qualified Mortgage rule generally allows up to a 43% back-end ratio, and Fannie Mae\'s automated underwriting can approve up to 50%. home-affordability-calculator uses this exact same range (36% / 43% / 50%) to build its conservative, balanced and maximum home-price tiers — this calculator checks the ratios directly from payments you already have, rather than solving for a home price.',
          'DTI matters beyond mortgages. Lenders use it for auto loans, personal loans and credit line increases, and it is one of the clearest single numbers for your own sense of how stretched your income is — unlike a credit score, it is something you can calculate yourself from your own pay stub and statements at any time.'
        ]
      },
      howTo: {
        intro: 'Enter your gross monthly income, then your housing payment and every other monthly debt payment separately.',
        steps: [
          { name: 'Enter your gross monthly income', text: 'Income before tax and other deductions. If you only know your annual salary, divide it by 12.' },
          { name: 'Enter your housing payment', text: 'Rent, or the full mortgage payment (principal, interest, tax, insurance, PMI and HOA if it applies) — not just principal and interest.' },
          { name: 'Enter your other monthly debt', text: 'Every other required debt payment: car loans, student loans, personal loans and minimum credit card payments. Leave out groceries, utilities, insurance premiums and subscriptions — DTI only counts debt.' },
          { name: 'Read both ratios', text: 'The headline is your back-end ratio; the front-end ratio sits just below it. The bar shows where your back-end ratio falls against the lending guidelines.' },
          { name: 'Check the dollar room', text: 'The last two rows show the maximum housing payment and total debt the classic 28/36 guideline allows at your income, and how much room (or overage) you have under the 36% line.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Both ratios divide a sum of monthly payments by the same gross monthly income.',
        expression: 'Front-end ratio = housing payment ÷ gross monthly income × 100\nBack-end ratio = (housing payment + other monthly debt) ÷ gross monthly income × 100',
        terms: [
          { symbol: 'housing payment', meaning: 'Rent, or the full mortgage payment including tax, insurance, PMI and HOA.' },
          { symbol: 'other monthly debt', meaning: 'Every other required debt payment, excluding housing.' },
          { symbol: 'gross monthly income', meaning: 'Income before tax and other deductions, for every borrower on the loan.' }
        ],
        note: 'Estimates only, not a lending decision or pre-qualification. Lenders can define "income" and "debt" slightly differently (for example, some count a lease but not a phone installment plan), so your lender\'s own figure may differ a little from this one.'
      },
      workedExample: {
        intro: 'A household has $8,000 of gross monthly income, a $1,940 monthly housing payment, and $1,500 of other monthly debt. What are its DTI ratios?',
        rows: [
          { label: 'Front-end ratio (1,940 ÷ 8,000 × 100)', value: '24.25%' },
          { label: 'Total monthly debt (1,940 + 1,500)', value: '$3,440' },
          { label: 'Back-end ratio (3,440 ÷ 8,000 × 100)', value: '43.00%' },
          { label: 'Max housing at the 28% guideline (0.28 × 8,000)', value: '$2,240 — current payment is $300 under' },
          { label: 'Max total debt at the 36% guideline (0.36 × 8,000)', value: '$2,880 — current debt is $560 over' }
        ],
        result: 'Front-end 24.25% · back-end 43.00%',
        explanation: 'The front-end ratio is comfortably under the classic 28% cap. The back-end ratio, at 43.00%, is $560 a month over the classic 36% guideline, but it lands exactly at the edge of the CFPB\'s 43% Qualified Mortgage cap and well inside Fannie Mae\'s 50% automated-underwriting ceiling — the same housing payment home-affordability-calculator\'s own balanced-tier example produces from the same income and other debt.'
      },
      watchOut: [
        { title: 'Lenders don\'t all count debt the same way', body: 'Most count every required loan and minimum credit card payment, but treatment of things like a 0%-interest buy-now-pay-later plan or a co-signed loan can vary. Ask your specific lender what they include.' },
        { title: 'Gross income, not take-home pay', body: 'DTI always uses gross (pre-tax) income, which is higher than what actually lands in your bank account — don\'t substitute your net paycheck.' },
        { title: 'DTI is one factor, not the whole decision', body: 'Credit score, down payment, cash reserves and employment history all matter too. A borrower with a high DTI but strong credit and reserves can still qualify; a low-DTI borrower with poor credit may not.' },
        { title: 'Self-employment income needs more care', body: 'Lenders typically average two years of net (after-expenses) self-employment income, which is usually lower than gross revenue — plug in that averaged, after-expenses figure, not top-line sales.' },
        { title: 'Paying down a small balance can help more than it looks', body: 'Because back-end DTI is a ratio, paying off or paying down a loan with a disproportionately large minimum payment relative to its balance can lower your ratio faster than its dollar size suggests.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, What is a debt-to-income ratio?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-en-1791/' },
        { label: 'Consumer Financial Protection Bureau, Regulation Z §1026.43, Minimum standards for transactions secured by a dwelling (Qualified Mortgage, 43% DTI)', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/43/' },
        { label: 'Fannie Mae Selling Guide, B3-6-02, Debt-to-Income Ratios', url: 'https://selling-guide.fanniemae.com/sel/b3-6-02/debt-income-ratios' },
        { label: 'Bankrate, What is the 28/36 rule?', url: 'https://www.bankrate.com/real-estate/what-is-the-28-36-rule/' }
      ]
    },
    inputs: [
      { id: 'grossMonthlyIncome', label: 'Gross monthly income', type: 'currency', placeholder: '8000', defaultValue: 8000, step: 100, min: 0 },
      { id: 'housingPayment', label: 'Housing payment (rent or full mortgage PITI)', type: 'currency', placeholder: '1940', defaultValue: 1940, step: 25, min: 0 },
      { id: 'otherMonthlyDebt', label: 'Other monthly debt payments', type: 'currency', placeholder: '1500', defaultValue: 1500, step: 25, min: 0 }
    ],
    seo: {
      title: 'DTI Calculator – Front-End & Back-End Ratio',
      description: 'Calculate your front-end and back-end debt-to-income (DTI) ratio from income and monthly debt, checked against the classic 28% / 36% lending guideline.',
      faq: [
        { question: 'What is a good DTI ratio?', answer: 'Under the classic guideline, 28% or less front-end and 36% or less back-end is considered comfortable. Many lenders approve higher: up to 43% back-end under the CFPB\'s Qualified Mortgage rule, and up to 50% through Fannie Mae\'s automated underwriting.' },
        { question: 'What is the difference between front-end and back-end DTI?', answer: 'Front-end counts only your housing payment against your income. Back-end adds every other monthly debt payment (car, student loans, credit cards) on top of housing. Lenders check both; back-end is usually the stricter limit.' },
        { question: 'Does DTI include property tax and insurance for a mortgage?', answer: 'Yes. The housing payment used in DTI is the full PITI figure — principal, interest, property tax, homeowners insurance, PMI if it applies, and HOA dues — not just principal and interest.' },
        { question: 'What is not counted as debt in a DTI calculation?', answer: 'Groceries, utilities, insurance premiums, subscriptions and other living expenses are not debt and are left out, even though they are real monthly costs. Only required loan and credit payments count.' },
        { question: 'How can I lower my DTI ratio?', answer: 'Pay down or pay off a loan (even a small one with a disproportionately large minimum payment), increase income, or refinance a high-payment debt into a lower monthly payment. Avoiding new debt before a big loan application also helps.' },
        { question: 'Is DTI the same as credit utilization?', answer: 'No. Credit utilization is the share of your available credit limit you are using on revolving accounts. DTI compares your required monthly debt payments to your income and does not look at credit limits at all.' },
        { question: 'How does this differ from home-affordability-calculator?', answer: 'This calculator checks the DTI ratios from a housing payment and other debt you already have. Home-affordability-calculator works the other way: it starts from your income and debt and solves for the home price those same 28/36-based limits would support.' }
      ]
    },
    compute(values) {
      const totalMonthlyDebt = values.housingPayment + values.otherMonthlyDebt;
      const frontEndRatio = (values.housingPayment / values.grossMonthlyIncome) * 100;
      const backEndRatio = (totalMonthlyDebt / values.grossMonthlyIncome) * 100;
      const maxHousingAt28 = 0.28 * values.grossMonthlyIncome;
      const maxTotalAt36 = 0.36 * values.grossMonthlyIncome;
      const roomUnder36 = maxTotalAt36 - totalMonthlyDebt;
      return { backEndRatio, frontEndRatio, totalMonthlyDebt, maxHousingAt28, maxTotalAt36, roomUnder36 };
    }
  },
  {
    id: 'debt-payoff-calculator',
    category: 'finance',
    group: 'Debt',
    glyph: 'D↓',
    updatedAt: '2026-11-15',
    aliases: ['debt snowball calculator', 'debt avalanche calculator', 'snowball vs avalanche calculator', 'multiple debt payoff calculator'],
    related: ['debt-to-income-calculator', 'credit-card-minimum-payment-calculator', 'balance-transfer-savings-calculator', 'loan-prepayment-calculator'],
    title: 'Debt Payoff Calculator (Snowball vs. Avalanche)',
    description: 'Compare the debt snowball (smallest balance first) and debt avalanche (highest rate first) methods side by side for a list of debts and an extra monthly payment.',
    example: 'Three debts of $5,000 at 22%, $3,000 at 18% and $2,000 at 9%, paid with their minimums plus an extra $200 a month, take 26 months and $2,326.08 of interest by snowball versus 25 months and $1,880.11 by avalanche — avalanche saves $445.97.',
    breakdown: {
      headline: 'interestSavedWithAvalanche',
      headlineLabel: 'Interest avalanche saves vs. snowball',
      outputs: [
        { id: 'interestSavedWithAvalanche', label: 'Interest avalanche saves vs. snowball', format: 'currency' },
        { id: 'monthsSavedWithAvalanche', label: 'Months avalanche saves vs. snowball', format: 'integer' },
        { id: 'snowballMonths', label: 'Snowball: months to debt-free', format: 'integer' },
        { id: 'snowballTotalInterest', label: 'Snowball: total interest paid', format: 'currency' },
        { id: 'avalancheMonths', label: 'Avalanche: months to debt-free', format: 'integer' },
        { id: 'avalancheTotalInterest', label: 'Avalanche: total interest paid', format: 'currency' }
      ],
      groups: [
        { title: 'Your debts', inputs: ['balances', 'rates', 'minPayments'] },
        { title: 'Extra payment', inputs: ['extraPayment'] }
      ],
      pairedLists: ['balances', 'rates'],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'snowballTotalInterest', label: 'Snowball' },
          { from: 'avalancheTotalInterest', label: 'Avalanche' }
        ],
        title: 'Total interest paid by method',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-15',
      concept: {
        title: 'Snowball and avalanche: same budget, different order',
        paragraphs: [
          'Both methods pay the minimum on every debt except one "target" debt, which gets every extra dollar in your budget. When the target is paid off, its old minimum payment joins the extra amount and rolls onto the next target — the total you pay every month never changes, only which debt it attacks first.',
          'The debt snowball orders debts smallest balance to largest, regardless of rate. The debt avalanche orders them highest interest rate to lowest. The Consumer Financial Protection Bureau describes the trade-off plainly: with the snowball method "you may see progress quickly — but you may pay more in the long run," while with the highest-rate (avalanche) method "you may not feel like you\'re making progress quickly" despite it generally costing less overall.',
          'The math nearly always favors avalanche, because it shrinks the balance accruing the most interest first. But a 2012 Journal of Marketing Research study of over 5,900 debt-settlement clients found that closing out individual accounts — the small, fast wins the snowball method is built around — predicted actually getting out of debt, regardless of the dollar size of the account closed. Which method you will actually stick with matters as much as which one is cheaper on paper.'
        ]
      },
      howTo: {
        intro: 'List every debt\'s balance, interest rate and minimum payment, in the same order, then add the extra amount you can put toward debt each month.',
        steps: [
          { name: 'List your balances', text: 'Paste or type each debt\'s current balance, one per line or separated by commas.' },
          { name: 'List the matching rates', text: 'Each debt\'s own APR, in the same order as the balances.' },
          { name: 'List the matching minimum payments', text: 'Each debt\'s required minimum payment, in the same order again. All three lists must have the same number of entries.' },
          { name: 'Enter your extra payment', text: 'Any amount beyond the minimums you can put toward debt every month. It goes entirely to whichever debt is the current target.' },
          { name: 'Compare the two methods', text: 'The result shows months to debt-free and total interest paid for snowball and avalanche side by side, and how much avalanche saves.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each month, every active debt accrues interest on its balance. The minimum is paid on every debt except the current target, and the rest of the fixed monthly budget — every freed-up minimum payment from an already-paid-off debt, plus your extra amount — goes to the target.',
        expression: 'Monthly budget = Σ(minimum payments) + extra payment, held fixed every month\nSnowball target order: smallest balance → largest\nAvalanche target order: highest APR → lowest\nEach debt\'s interest: balance × (APR ÷ 12)',
        terms: [
          { symbol: 'target', meaning: 'The one debt (per the method\'s order) that receives every dollar of the budget beyond the other debts\' minimums.' },
          { symbol: 'Σ(minimum payments)', meaning: 'The sum of every debt\'s own minimum payment, using the original list even after some debts are paid off — this is what keeps the monthly budget constant.' },
          { symbol: 'APR', meaning: 'Each debt\'s own annual percentage rate, applied monthly as APR ÷ 12.' }
        ],
        note: 'Estimates only. Assumes every rate stays fixed, the monthly budget never changes, and no new charges are added. A surplus payment that fully pays off the target debt mid-month rolls onto the next target starting the following month, not within the same month.'
      },
      workedExample: {
        intro: 'Three debts: $5,000 at 22% APR (min $150), $3,000 at 18% APR (min $90) and $2,000 at 9% APR (min $60). You can add $200 a month beyond the minimums — a $500 total monthly budget. How do the two methods compare?',
        rows: [
          { label: 'Total monthly budget (150 + 90 + 60 + 200)', value: '$500' },
          { label: 'Snowball order (smallest balance first)', value: '$2,000 debt → $3,000 debt → $5,000 debt' },
          { label: 'Avalanche order (highest rate first)', value: '22% debt → 18% debt → 9% debt' },
          { label: 'Snowball result', value: '26 months, $2,326.08 total interest' },
          { label: 'Avalanche result', value: '25 months, $1,880.11 total interest' },
          { label: 'Interest avalanche saves (2,326.08 − 1,880.11)', value: '$445.97' }
        ],
        result: 'Avalanche saves about $445.97 and finishes 1 month sooner',
        explanation: 'Avalanche attacks the 22% debt first, so the largest balance stops accruing the most expensive interest as early as possible. Snowball attacks the smallest ($2,000, at only 9%) first instead, so that 22% debt keeps accruing interest on a large balance for longer — which is exactly why avalanche comes out ahead here.'
      },
      watchOut: [
        { title: 'All three lists must line up', body: 'The balance, rate and minimum-payment lists must have the same number of entries, listed in the same debt order — entry 2 in each list must describe the same debt.' },
        { title: 'The extra rolls over, it does not vanish', body: 'Once the current target is paid off, its old minimum payment permanently joins the extra amount for the next target. The total monthly budget never shrinks.' },
        { title: 'Promotional and variable rates are not modeled', body: 'If a card\'s rate is a temporary promotional APR or your rates can change, use your current rate and recheck the numbers after it changes.' },
        { title: 'New charges reset the clock', body: 'This assumes no new purchases on any account. Continuing to charge a credit card you are paying down will extend every result shown here.' },
        { title: 'Cheaper on paper is not always cheaper in practice', body: 'Avalanche almost always costs less interest, but research on real debt-settlement clients found that closing individual accounts — snowball\'s strength — predicted actually finishing. Pick the one you will stick with.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, Resolve to take control of your debt in the new year', url: 'https://www.consumerfinance.gov/archive/blog/resolve-take-control-your-debt-new-year/' },
        { label: 'Gal, D. & McShane, B., "Can Small Victories Help Win the War? Evidence from Consumer Debt Management," Journal of Marketing Research, 2012', url: 'https://www.semanticscholar.org/paper/Can-Small-Victories-Help-Win-the-War-Evidence-from-Gal-McShane/591f5dfc53b372dd5e76a8d563f2b05a64f99353' }
      ]
    },
    inputs: [
      {
        id: 'balances',
        label: 'Balances',
        type: 'list',
        placeholder: 'Paste or type each debt\'s balance — commas, spaces or new lines between them.',
        defaultValue: 0,
        listDefault: [5000, 3000, 2000],
        listMin: 1
      },
      {
        id: 'rates',
        label: 'Interest rates (APR, %)',
        type: 'list',
        placeholder: 'Each debt\'s own APR, in the same order as the balances above.',
        defaultValue: 0,
        listDefault: [22, 18, 9],
        listMin: 1
      },
      {
        id: 'minPayments',
        label: 'Minimum payments',
        type: 'list',
        placeholder: 'Each debt\'s required minimum payment, in the same order again.',
        defaultValue: 0,
        listDefault: [150, 90, 60],
        listMin: 1
      },
      { id: 'extraPayment', label: 'Extra monthly payment (beyond the minimums)', type: 'currency', placeholder: '200', defaultValue: 200, step: 25, min: 0 }
    ],
    seo: {
      title: 'Debt Payoff Calculator – Snowball vs. Avalanche',
      description: 'Compare the debt snowball and debt avalanche methods side by side: months to debt-free and total interest for a list of debts plus an extra payment.',
      faq: [
        { question: 'Which saves more money, snowball or avalanche?', answer: 'Avalanche (highest rate first) almost always costs less total interest, because it shrinks the most expensive balance first. In this calculator\'s example, avalanche saves $445.97 and finishes a month sooner than snowball on the same debts and budget.' },
        { question: 'Why would anyone use snowball if avalanche saves more?', answer: 'A widely-cited 2012 study of real debt-settlement clients found that closing individual accounts — snowball\'s focus on small, fast wins — predicted actually getting out of debt. The cheapest method on paper is not useful if you do not stick with it.' },
        { question: 'Do I still pay the minimum on every debt?', answer: 'Yes, on every debt except the current target. The target gets its own minimum plus your whole extra payment, plus the old minimum payments of any debts already paid off.' },
        { question: 'What happens to a paid-off debt\'s minimum payment?', answer: 'It rolls permanently into the budget for the next target debt. Your total monthly debt payment amount never goes down until every debt is paid off.' },
        { question: 'Does the order matter if two debts have the same balance or rate?', answer: 'Only in a tie. If two balances (for snowball) or two rates (for avalanche) are equal, either order produces the same total months and interest.' },
        { question: 'Can I use this for any kind of debt?', answer: 'Yes — credit cards, personal loans, car loans and private student loans all work, as long as you know each one\'s balance, rate and minimum payment. It assumes a fixed rate throughout.' },
        { question: 'How is this different from the credit card minimum payment calculator?', answer: 'That calculator looks at one card paid at the minimum only, with no extra payment. This one compares two strategies for paying off several debts at once with minimums plus a shared extra amount.' }
      ]
    },
    compute(values, lists) {
      const balances = lists.balances ?? [];
      const rates = lists.rates ?? [];
      const minPayments = lists.minPayments ?? [];
      const n = balances.length;
      const bad = { snowballMonths: NaN, snowballTotalInterest: NaN, avalancheMonths: NaN, avalancheTotalInterest: NaN, interestSavedWithAvalanche: NaN, monthsSavedWithAvalanche: NaN };
      if (n === 0 || rates.length !== n || minPayments.length !== n) return bad;

      const simulate = (orderIndices: number[]) => {
        const bals = balances.slice();
        const totalBudget = minPayments.reduce((sum, m) => sum + m, 0) + values.extraPayment;
        let totalInterest = 0;
        let months = 0;
        while (bals.some((b) => b > 1e-6) && months < 600) {
          months++;
          for (let i = 0; i < n; i++) {
            if (bals[i] > 1e-6) {
              const interest = bals[i] * (rates[i] / 100 / 12);
              totalInterest += interest;
              bals[i] += interest;
            }
          }
          const targetIdx = orderIndices.find((i) => bals[i] > 1e-6);
          let budgetUsed = 0;
          for (let i = 0; i < n; i++) {
            if (i === targetIdx || !(bals[i] > 1e-6)) continue;
            const pay = Math.min(bals[i], minPayments[i]);
            bals[i] -= pay;
            budgetUsed += pay;
            if (bals[i] < 1e-6) bals[i] = 0;
          }
          if (targetIdx !== undefined) {
            const forTarget = Math.max(0, totalBudget - budgetUsed);
            const pay = Math.min(bals[targetIdx], forTarget);
            bals[targetIdx] -= pay;
            if (bals[targetIdx] < 1e-6) bals[targetIdx] = 0;
          }
        }
        return { months, totalInterest };
      };

      const byValue = (arr: number[]) => arr.map((value, index) => ({ value, index }));
      const snowballOrder = byValue(balances).sort((a, b) => a.value - b.value).map((p) => p.index);
      const avalancheOrder = byValue(rates).sort((a, b) => b.value - a.value).map((p) => p.index);

      const snowball = simulate(snowballOrder);
      const avalanche = simulate(avalancheOrder);

      return {
        snowballMonths: snowball.months,
        snowballTotalInterest: snowball.totalInterest,
        avalancheMonths: avalanche.months,
        avalancheTotalInterest: avalanche.totalInterest,
        interestSavedWithAvalanche: snowball.totalInterest - avalanche.totalInterest,
        monthsSavedWithAvalanche: snowball.months - avalanche.months
      };
    }
  },
  {
    id: 'credit-card-minimum-payment-calculator',
    category: 'finance',
    group: 'Debt',
    glyph: 'Min',
    updatedAt: '2026-11-15',
    aliases: ['minimum payment calculator', 'credit card payoff calculator', 'minimum payment interest calculator', 'how long to pay off credit card calculator'],
    related: ['debt-payoff-calculator', 'balance-transfer-savings-calculator', 'debt-to-income-calculator', 'loan-calculator'],
    title: 'Credit Card Minimum Payment Calculator',
    description: 'See how long it takes and how much interest a minimum-only credit card payment costs, versus a fixed payment amount, using the common 1%-of-balance-plus-interest formula.',
    example: 'A $5,000 balance at 22% APR paid at the minimum only (1% of balance plus that month\'s interest, $25 floor) takes about 230 months (19 years 2 months) and $8,099.77 of interest — a fixed $200 a month instead pays it off in 34 months for $1,749.88, a $6,349.89 difference.',
    breakdown: {
      headline: 'interestCostOfMinimumOnly',
      headlineLabel: 'Extra interest from paying only the minimum',
      outputs: [
        { id: 'interestCostOfMinimumOnly', label: 'Extra interest from paying only the minimum', format: 'currency' },
        { id: 'monthsCostOfMinimumOnly', label: 'Extra months from paying only the minimum', format: 'integer' },
        { id: 'firstMinPayment', label: 'First month\'s minimum payment', format: 'currency' },
        { id: 'minMonths', label: 'Minimum-only: months to pay off', format: 'integer' },
        { id: 'minTotalInterest', label: 'Minimum-only: total interest paid', format: 'currency' },
        { id: 'fixedMonths', label: 'Fixed payment: months to pay off', format: 'integer' },
        { id: 'fixedTotalInterest', label: 'Fixed payment: total interest paid', format: 'currency' }
      ],
      groups: [
        { title: 'Your card', inputs: ['balance', 'apr'] },
        { title: 'Compare to a fixed payment', inputs: ['fixedPayment'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'minTotalInterest', label: 'Minimum only' },
          { from: 'fixedTotalInterest', label: 'Fixed payment' }
        ],
        title: 'Total interest paid',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-15',
      concept: {
        title: 'Why "just the minimum" can take decades',
        paragraphs: [
          'A credit card minimum payment is not a fixed dollar amount — for most large issuers it is recalculated every month as a percentage of your current balance plus that month\'s interest charge, with a fixed dollar floor. This calculator uses the formula the Consumer Financial Protection Bureau\'s 2015 Consumer Credit Card Market Report found "almost all" large issuers use for this style of calculation: 1% of the balance (excluding finance charges), plus the finance charge itself, with a $25 floor — the floor the same report found was the most common among large card issuers.',
          'Because the minimum is a percentage of a shrinking balance, it shrinks right along with it. Early on, most of a 1%-plus-interest minimum payment is just covering that month\'s interest, so the balance barely moves; as the balance slowly falls, the required minimum falls too, which is what stretches payoff out for years rather than months.',
          'Paying a fixed amount above the minimum breaks this cycle: a level payment keeps shrinking the balance at a steady, accelerating rate (the interest portion keeps falling while the payment does not), the same mechanics behind any amortized loan.'
        ]
      },
      howTo: {
        intro: 'Enter your card balance and APR, then a fixed monthly amount you want to compare against paying only the minimum.',
        steps: [
          { name: 'Enter your balance', text: 'Your current credit card balance.' },
          { name: 'Enter your APR', text: 'Your card\'s annual percentage rate on purchases or on this balance, as shown on your statement.' },
          { name: 'Enter a fixed comparison payment', text: 'An amount you could pay every month instead of letting the minimum shrink over time.' },
          { name: 'Read both payoff paths', text: 'The headline shows the extra interest the minimum-only path costs versus your fixed amount, with months and total interest for each shown below.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The minimum payment is recalculated every month from the balance that remains after the previous payment.',
        expression: 'Monthly interest = balance × (APR ÷ 12)\nMinimum payment = max(1% × balance + monthly interest, $25)\nNew balance = balance + monthly interest − payment',
        terms: [
          { symbol: 'balance', meaning: 'The balance owed at the start of that month.' },
          { symbol: 'APR', meaning: 'Annual percentage rate, applied monthly as APR ÷ 12.' },
          { symbol: '$25 floor', meaning: 'The fixed minimum dollar payment, which the CFPB\'s 2015 report found was the most common floor among large card issuers, used once 1% of the balance plus interest drops below it.' }
        ],
        note: 'Estimates only. Formulas vary by issuer — some use 2% or more of the balance including finance charges (common among credit unions and subprime issuers), and floors above $25 are common at subprime issuers. Check your card\'s cardholder agreement for its exact formula.'
      },
      workedExample: {
        intro: 'A $5,000 balance at 22% APR. How does paying only the minimum (1% of balance plus interest, $25 floor) compare with paying a fixed $200 a month?',
        rows: [
          { label: 'First month\'s minimum (1% × 5,000 + 5,000 × 22% ÷ 12)', value: '$141.67' },
          { label: 'Paying only the minimum', value: '230 months (about 19 years, 2 months), $8,099.77 total interest' },
          { label: 'Paying a fixed $200 a month', value: '34 months (about 2 years, 10 months), $1,749.88 total interest' },
          { label: 'Extra interest from the minimum path (8,099.77 − 1,749.88)', value: '$6,349.89' },
          { label: 'Extra time (230 − 34 months)', value: '196 months' }
        ],
        result: 'Paying only the minimum costs about $6,349.89 more and takes 196 months longer than a fixed $200 a month',
        explanation: 'Because the minimum shrinks along with the balance, the payment keeps getting smaller and the interest keeps compounding on a balance that barely moves for a long stretch. A fixed $200 payment never shrinks, so it eats into principal faster every single month.'
      },
      watchOut: [
        { title: 'Your card\'s formula may differ', body: 'Check your cardholder agreement. Some issuers use 2% or more of the balance (including finance charges), use a different floor, or exclude fees from the formula differently than assumed here.' },
        { title: 'New charges extend everything', body: 'This assumes no new purchases on the card. Continuing to charge it while paying it down will push out the months and interest shown here.' },
        { title: 'Your statement has your real minimum payment warning', body: 'The CARD Act requires every statement to show how long payoff would take and the total cost at the minimum payment, using your card\'s actual formula — treat that figure as more authoritative than this estimate.' },
        { title: 'A high utilization hurts your credit regardless', body: 'Carrying a large balance relative to your credit limit can lower your credit score even while you are current on payments, separate from the interest cost shown here.' },
        { title: 'This is not the same question as a payoff strategy', body: 'If you are juggling several cards or loans, see debt-payoff-calculator, which compares snowball and avalanche strategies across multiple debts at once.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, The Consumer Credit Card Market (2015 report), §5.2.5 Minimum payments', url: 'https://files.consumerfinance.gov/f/201512_cfpb_report-the-consumer-credit-card-market.pdf' },
        { label: 'Consumer Financial Protection Bureau, Regulation Z Appendix M1, Repayment Disclosures', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/m1/' }
      ]
    },
    inputs: [
      { id: 'balance', label: 'Credit card balance', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 100, min: 0 },
      { id: 'apr', label: 'Annual percentage rate (APR)', type: 'percent', placeholder: '22', defaultValue: 22, step: 0.1, min: 0 },
      { id: 'fixedPayment', label: 'Fixed monthly payment to compare', type: 'currency', placeholder: '200', defaultValue: 200, step: 10, min: 0 }
    ],
    seo: {
      title: 'Credit Card Minimum Payment Calculator',
      description: 'See how long a minimum-only credit card payment takes and how much interest it costs, versus a fixed payment, using the common 1%-plus-interest formula.',
      faq: [
        { question: 'How is a credit card minimum payment calculated?', answer: 'Most large issuers use 1% of the current balance plus that month\'s interest charge, with a $25 floor, per the CFPB\'s 2015 Consumer Credit Card Market Report. Some issuers use 2% or more instead, so check your own cardholder agreement.' },
        { question: 'Why does the minimum payment keep shrinking?', answer: 'Because it is a percentage of the balance. As the balance falls, 1% of it falls too, so later minimum payments are smaller in dollar terms than earlier ones — which is exactly why minimum-only payoff stretches out for years.' },
        { question: 'How much does paying only the minimum really cost?', answer: 'On a $5,000 balance at 22% APR, this calculator finds paying only the minimum takes about 230 months (19 years, 2 months) and $8,099.77 of interest, versus 34 months and $1,749.88 at a fixed $200 a month — $6,349.89 more and 196 months longer.' },
        { question: 'Is the $25 minimum floor the same at every card issuer?', answer: 'No. $25 is the most common floor among large issuers per the CFPB\'s own 2015 study, but subprime issuers often set a higher floor and credit unions often use a different percentage-based formula entirely.' },
        { question: 'How can I pay off my card faster than the minimum?', answer: 'Pay a fixed amount above the minimum every month instead of letting the required payment shrink with the balance — even a modest fixed amount cuts years and a large share of the interest, as shown in the example above.' },
        { question: 'How is this different from debt-payoff-calculator?', answer: 'This calculator looks at one card and compares minimum-only payments with a fixed amount you choose. Debt-payoff-calculator compares two payoff strategies (snowball and avalanche) across several debts at once with a shared extra payment.' },
        { question: 'How is this different from balance-transfer-savings-calculator?', answer: 'This calculator keeps the same card and rate throughout. Balance-transfer-savings-calculator looks at moving the balance to a different card with a promotional rate and a transfer fee instead.' }
      ]
    },
    compute(values) {
      const capMonths = 1200;
      const r = values.apr / 100 / 12;

      let bal = values.balance;
      let minTotalInterest = 0;
      let minMonths = 0;
      let firstMinPayment = NaN;
      while (bal > 1e-6 && minMonths < capMonths) {
        minMonths++;
        const interest = bal * r;
        minTotalInterest += interest;
        bal += interest;
        const payment = Math.min(bal, Math.max(0.01 * (bal - interest) + interest, 25));
        if (minMonths === 1) firstMinPayment = payment;
        bal -= payment;
        if (bal < 1e-6) bal = 0;
      }
      const minPaidOff = bal <= 1e-6;

      let fixedMonths = NaN;
      let fixedTotalInterest = NaN;
      if (values.fixedPayment > values.balance * r) {
        let fixedBal = values.balance;
        fixedTotalInterest = 0;
        fixedMonths = 0;
        while (fixedBal > 1e-6 && fixedMonths < capMonths) {
          fixedMonths++;
          const interest = fixedBal * r;
          fixedTotalInterest += interest;
          const principal = Math.min(fixedBal, values.fixedPayment - interest);
          fixedBal -= principal;
          if (fixedBal < 1e-6) fixedBal = 0;
        }
      }

      if (!minPaidOff || !Number.isFinite(fixedTotalInterest)) {
        return {
          interestCostOfMinimumOnly: NaN,
          monthsCostOfMinimumOnly: NaN,
          firstMinPayment,
          minMonths: minPaidOff ? minMonths : NaN,
          minTotalInterest: minPaidOff ? minTotalInterest : NaN,
          fixedMonths,
          fixedTotalInterest
        };
      }

      return {
        interestCostOfMinimumOnly: minTotalInterest - fixedTotalInterest,
        monthsCostOfMinimumOnly: minMonths - fixedMonths,
        firstMinPayment,
        minMonths,
        minTotalInterest,
        fixedMonths,
        fixedTotalInterest
      };
    }
  },
  {
    id: 'balance-transfer-savings-calculator',
    category: 'finance',
    group: 'Debt',
    glyph: '⇄',
    updatedAt: '2026-11-15',
    aliases: ['balance transfer calculator', '0% apr balance transfer calculator', 'credit card balance transfer savings calculator', 'balance transfer fee calculator'],
    related: ['credit-card-minimum-payment-calculator', 'debt-payoff-calculator', 'loan-calculator', 'compound-interest-calculator'],
    title: 'Balance Transfer Savings Calculator',
    description: 'See the net interest saved by transferring a credit card balance to a promotional-APR card, after the balance transfer fee, assuming you pay it off within the promo period.',
    example: 'A $6,000 balance at 22% APR, paid off over a 15-month 0% APR balance transfer offer with a 3% ($180) transfer fee, saves about $737.26 in net interest versus paying it off on the original card.',
    breakdown: {
      headline: 'netSavings',
      headlineLabel: 'Net savings from transferring',
      outputs: [
        { id: 'netSavings', label: 'Net savings from transferring', format: 'currency' },
        { id: 'transferFee', label: 'Balance transfer fee', format: 'currency' },
        { id: 'costIfStay', label: 'Interest if you stay and pay it off in the same time', format: 'currency' },
        { id: 'costIfTransfer', label: 'Interest + fee if you transfer', format: 'currency' },
        { id: 'stayMonthlyPayment', label: 'Payment needed to clear it by staying', format: 'currency' },
        { id: 'transferMonthlyPayment', label: 'Payment needed to clear it after transferring', format: 'currency' }
      ],
      groups: [
        { title: 'Current balance', inputs: ['balance', 'currentAPR'] },
        { title: 'The transfer offer', inputs: ['promoAPR', 'promoMonths', 'transferFeePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'costIfStay', label: 'Stay on current card' },
          { from: 'costIfTransfer', label: 'Transfer (interest + fee)' }
        ],
        title: 'Total cost to pay off the balance',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-15',
      concept: {
        title: 'A transfer only helps once the fee is netted out',
        paragraphs: [
          'A balance transfer moves what you owe from one card to another, usually one offering a promotional APR — often 0% — for a limited introductory period. The Consumer Financial Protection Bureau is explicit that this is not free: "a credit card company is permitted to charge you a balance transfer fee on a zero percent rate offer," and that fee is typically "a certain percentage of the amount you transfer or a fixed amount, whichever is more."',
          'The fee is usually added to the new card\'s balance, so you are financing a slightly larger amount at the new, lower rate. Whether the move is worth it comes down to one comparison: the interest the promotional rate avoids, minus that upfront fee. This calculator assumes you pay the balance off in full within the promotional period, with the same level monthly payment either way, since that is the only way to compare the two cleanly — and the only way a transfer is reliably worth it.',
          'If the promotional APR is not 0%, the same math still applies; it just saves less, since the transferred balance keeps accruing some interest at the lower promotional rate instead of none.'
        ]
      },
      howTo: {
        intro: 'Enter your current balance and APR, then the terms of the balance transfer offer you are considering.',
        steps: [
          { name: 'Enter your balance and current APR', text: 'The amount you currently owe and the APR it is charged at today.' },
          { name: 'Enter the promotional APR and its length', text: 'The rate the new card charges on the transferred balance, and how many months that rate lasts.' },
          { name: 'Enter the transfer fee', text: 'As a percentage of the balance transferred — check your specific offer, as this varies by issuer and promotion.' },
          { name: 'Read the net savings', text: 'The headline is the net savings after the fee. Below it are the interest cost and required monthly payment on each path, assuming full payoff within the promotional period.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Both paths assume the balance is paid off in full, with a level monthly payment, within the promotional number of months.',
        expression: 'Transfer fee = balance × fee %\nStay: payment to clear the balance in N months at the current APR; interest = payment × N − balance\nTransfer: payment to clear (balance + fee) in N months at the promo APR; interest = payment × N − (balance + fee)\nNet savings = interest(stay) − interest(transfer) − fee',
        terms: [
          { symbol: 'N', meaning: 'The number of months in the promotional period.' },
          { symbol: 'fee', meaning: 'The balance transfer fee, charged once, usually added to the new card\'s balance.' },
          { symbol: 'interest(transfer)', meaning: 'Zero when the promotional APR is 0%, since a level payment to a 0% balance is pure principal.' }
        ],
        note: 'Estimates only. Assumes the full balance (plus the fee) is paid off within the promotional period at a level monthly payment, with no new charges. Any balance left over when the promo ends reverts to the new card\'s regular APR, which can be higher than your original rate — only transfer an amount you can realistically clear in time.'
      },
      workedExample: {
        intro: 'A $6,000 balance at 22% APR, and a balance transfer offer: 0% APR for 15 months, with a 3% transfer fee. Is it worth it if you pay it off within the 15 months?',
        rows: [
          { label: 'Transfer fee (3% × 6,000)', value: '$180' },
          { label: 'Payment to clear $6,000 in 15 months at 22% APR', value: '$461.15/month, $917.26 total interest' },
          { label: 'Payment to clear $6,180 in 15 months at 0% APR', value: '$412.00/month, $0 interest' },
          { label: 'Net savings (917.26 − 0 − 180)', value: '$737.26' }
        ],
        result: 'Transferring saves about $737.26 over the 15-month promotional period',
        explanation: 'Staying on the original card costs $917.26 in interest to clear the balance in 15 months. Transferring costs only the $180 fee, since the 0% rate means no interest accrues on the (slightly larger, fee-inclusive) new balance — a net saving of $737.26.'
      },
      watchOut: [
        { title: 'The fee applies even to a 0% offer', body: 'Per the CFPB, issuers are allowed to charge a balance transfer fee on a zero-percent promotional offer. A "free" 0% rate is not necessarily a free transfer.' },
        { title: 'You have to actually clear it in time', body: 'This calculator assumes full payoff within the promotional period. A balance left over when the promo ends is charged the card\'s regular ongoing APR, which is often higher than your original rate.' },
        { title: 'New purchases usually do not get the promo rate', body: 'Many balance transfer offers apply the promotional rate only to the transferred balance, not to new purchases on the same card, which can accrue interest from day one.' },
        { title: 'A transfer does not reduce what you owe', body: 'It moves the same debt to a different lender. Combine it with a real payoff plan — see debt-payoff-calculator — rather than treating the lower rate alone as progress.' },
        { title: 'Check for a maximum transfer amount', body: 'Card issuers typically cap how much can be transferred, often to a percentage of your new credit limit, which may be less than your full existing balance.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, What is a balance transfer fee? Can a balance transfer fee be charged on a zero percent interest rate offer?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-balance-transfer-fee-can-a-balance-transfer-fee-be-charged-on-a-zero-percent-interest-rate-offer-en-53/' },
        { label: 'Consumer Financial Protection Bureau, Credit cards key terms', url: 'https://www.consumerfinance.gov/consumer-tools/credit-cards/answers/key-terms/' }
      ]
    },
    inputs: [
      { id: 'balance', label: 'Current balance', type: 'currency', placeholder: '6000', defaultValue: 6000, step: 100, min: 0 },
      { id: 'currentAPR', label: 'Current card APR', type: 'percent', placeholder: '22', defaultValue: 22, step: 0.1, min: 0 },
      { id: 'promoAPR', label: 'Promotional APR on the new card', type: 'percent', placeholder: '0', defaultValue: 0, step: 0.1, min: 0 },
      { id: 'promoMonths', label: 'Promotional period', type: 'number', placeholder: '15', defaultValue: 15, step: 1, min: 1, dimension: 'term', unit: 'mo' },
      { id: 'transferFeePercent', label: 'Balance transfer fee', type: 'percent', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'Balance Transfer Savings Calculator',
      description: 'See the net interest saved by a credit card balance transfer to a promotional-APR card after the transfer fee, assuming payoff within the promo period.',
      faq: [
        { question: 'Is a balance transfer worth the fee?', answer: 'It depends on the numbers. A $6,000 balance at 22% APR moved to a 0% offer for 15 months with a 3% fee saves about $737.26 net in this calculator\'s example. A shorter promo period, a higher fee, or a lower current APR can shrink or erase the savings.' },
        { question: 'Can a card charge a transfer fee on a 0% APR offer?', answer: 'Yes. The CFPB confirms issuers are permitted to charge a balance transfer fee even when the promotional APR is 0%, so the fee has to be weighed against the interest the 0% rate avoids.' },
        { question: 'What happens if I do not pay off the balance before the promo ends?', answer: 'Whatever is left is charged the card\'s regular ongoing APR from that point, which is often higher than your original card\'s rate — this calculator assumes full payoff within the promotional period and does not model a leftover balance.' },
        { question: 'How is the transfer fee usually charged?', answer: 'It is typically a percentage of the amount transferred (commonly in the 3%-5% range on many offers) and is usually added to the new card\'s balance rather than billed separately, so check your specific offer\'s terms.' },
        { question: 'Does a 0% APR mean zero interest during the promo?', answer: 'Yes, on the transferred balance, for the length of the promotional period only. This calculator reflects that by showing $0 of interest on the transfer side when the promotional APR is 0%.' },
        { question: 'Do new purchases get the same promotional rate?', answer: 'Often not. Many issuers apply the promotional rate only to the transferred balance, while new purchases on the same card accrue interest at the regular purchase APR from the start — check your card\'s terms.' },
        { question: 'How is this different from the credit card minimum payment calculator?', answer: 'That calculator looks at one card\'s minimum-only payments versus a fixed payment, with no transfer involved. This one compares staying on your current card with moving the balance to a different card and rate.' }
      ]
    },
    compute(values) {
      const transferFee = values.balance * (values.transferFeePercent / 100);
      const stayMonthlyPayment = loanPayment(values.balance, values.promoMonths, values.currentAPR);
      const costIfStay = stayMonthlyPayment * values.promoMonths - values.balance;
      const transferPrincipal = values.balance + transferFee;
      const transferMonthlyPayment = loanPayment(transferPrincipal, values.promoMonths, values.promoAPR);
      const transferInterest = transferMonthlyPayment * values.promoMonths - transferPrincipal;
      const costIfTransfer = transferInterest + transferFee;
      return {
        netSavings: costIfStay - costIfTransfer,
        transferFee,
        costIfStay,
        costIfTransfer,
        stayMonthlyPayment,
        transferMonthlyPayment
      };
    }
  },
  {
    id: 'student-loan-calculator',
    category: 'finance',
    group: 'Debt',
    glyph: 'SL',
    updatedAt: '2026-11-15',
    aliases: ['student loan payment calculator', 'student loan repayment calculator', 'federal student loan calculator', 'student loan amortization calculator'],
    related: ['loan-calculator', 'debt-payoff-calculator', 'loan-prepayment-calculator', 'debt-to-income-calculator'],
    title: 'Student Loan Repayment Calculator',
    description: 'Compare the federal Standard, Graduated and Extended student loan repayment plans side by side: monthly payment and total interest on each.',
    example: 'A $35,000 federal student loan at 6% APR costs $388.57/month and $11,628.61 total interest on the 10-year Standard plan, versus a graduated plan starting at $175 and ending at $781.40 ($15,835.16 total interest), or $225.51/month over 25 years on Extended ($32,651.65 total interest).',
    breakdown: {
      headline: 'standardPayment',
      headlineLabel: 'Standard plan (10 years): monthly payment',
      outputs: [
        { id: 'standardPayment', label: 'Standard plan: monthly payment', format: 'currency' },
        { id: 'standardTotalInterest', label: 'Standard plan: total interest', format: 'currency' },
        { id: 'graduatedInitialPayment', label: 'Graduated plan: starting payment', format: 'currency' },
        { id: 'graduatedFinalPayment', label: 'Graduated plan: final payment', format: 'currency' },
        { id: 'graduatedTotalInterest', label: 'Graduated plan: total interest', format: 'currency' },
        { id: 'extendedPayment', label: 'Extended plan (25 years): monthly payment', format: 'currency' },
        { id: 'extendedTotalInterest', label: 'Extended plan: total interest', format: 'currency' },
        { id: 'extraInterestGraduatedVsStandard', label: 'Extra interest, Graduated vs. Standard', format: 'currency' },
        { id: 'extraInterestExtendedVsStandard', label: 'Extra interest, Extended vs. Standard', format: 'currency' }
      ],
      groups: [{ title: 'Your loan', inputs: ['loanAmount', 'apr'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'standardTotalInterest', label: 'Standard (10 yr)' },
          { from: 'graduatedTotalInterest', label: 'Graduated (10 yr)' },
          { from: 'extendedTotalInterest', label: 'Extended (25 yr)' }
        ],
        title: 'Total interest paid by plan',
        highlight: 0
      }
    },
    content: {
      lastReviewed: '2026-11-15',
      concept: {
        title: 'Three plan shapes, the same loan',
        paragraphs: [
          'Federal Direct Loan borrowers can repay the same balance on plans with very different payment shapes. The Standard plan is a fixed payment over 10 years — the shortest term and the least total interest. The Graduated plan keeps the same 10-year term but starts with a lower payment that increases, usually every two years, to a larger final payment that still fully repays the loan by year 10. The Extended plan stretches the term to 25 years with a fixed (or, if chosen, graduated) payment, which lowers the monthly payment but adds years of extra interest.',
          'The Extended plan has a real eligibility rule: a borrower needs more than $30,000 in outstanding Direct Loans to use it. Both Graduated and Extended are also time-limited by when the loan was first disbursed — per the Department of Education\'s own loan servicers, they are available only for loans first disbursed before July 1, 2026. Loans disbursed on or after that date instead use a new Tiered Standard plan (a 10-to-25-year term set by balance), which is not modeled on this page.',
          'None of this changes the interest rate itself. A lower monthly payment on Graduated or Extended simply means the balance takes longer to fall, so more total interest accrues over the life of the loan — the trade-off this calculator is built to show side by side.'
        ]
      },
      howTo: {
        intro: 'Enter the loan balance and its interest rate. All three plans are calculated from the same two numbers.',
        steps: [
          { name: 'Enter your loan balance', text: 'The total amount owed on the loan (or loans, if consolidated) you are comparing plans for.' },
          { name: 'Enter the interest rate', text: 'Your loan\'s own fixed APR, from your loan documents or studentaid.gov account — federal loan rates are fixed for the life of the loan but vary by loan type and year.' },
          { name: 'Compare the three plans', text: 'The headline shows the Standard plan\'s payment. The rows below show the Graduated plan\'s starting and final payment and the Extended plan\'s payment, each with its own total interest.' },
          { name: 'Check the extra interest rows', text: 'These show exactly how much more interest Graduated and Extended cost compared with Standard, for the lower payment each provides.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Standard and Extended are both level-payment amortized loans, just over different terms. Graduated starts at the interest-only payment and steps up by a fixed growth factor every two years, solved so the balance reaches exactly zero at year 10.',
        expression: 'Standard payment = amortized payment over 120 months\nExtended payment = amortized payment over 300 months\nGraduated: payment₀ = balance × (APR ÷ 12); paymentₖ = payment₀ × gᵏ every 24 months, g solved so balance = 0 at month 120',
        terms: [
          { symbol: 'payment₀', meaning: 'The Graduated plan\'s starting payment, equal to interest-only on the original balance.' },
          { symbol: 'g', meaning: 'The fixed growth factor applied to the payment every 24 months, solved numerically for each loan.' },
          { symbol: 'APR', meaning: 'The loan\'s fixed annual percentage rate.' }
        ],
        note: 'Estimates only, and a simplified illustration of the Graduated plan\'s shape — your loan servicer\'s real calculation follows additional federal rules and rounding this model does not reproduce, so your actual year-by-year amounts will differ somewhat. Extended requires more than $30,000 in outstanding Direct Loans and, per the Department of Education\'s loan servicers, is available only for loans first disbursed before July 1, 2026.'
      },
      workedExample: {
        intro: 'A $35,000 federal student loan balance at 6% APR. How do the three plans compare?',
        rows: [
          { label: 'Standard (10 years): payment', value: '$388.57/month' },
          { label: 'Standard: total interest', value: '$11,628.61' },
          { label: 'Graduated (10 years): starting payment', value: '$175.00/month' },
          { label: 'Graduated: final payment', value: '$781.40/month' },
          { label: 'Graduated: total interest', value: '$15,835.16' },
          { label: 'Extended (25 years): payment', value: '$225.51/month' },
          { label: 'Extended: total interest', value: '$32,651.65' },
          { label: 'Extra interest, Graduated vs. Standard (15,835.16 − 11,628.61)', value: '$4,206.55' },
          { label: 'Extra interest, Extended vs. Standard (32,651.65 − 11,628.61)', value: '$21,023.04' }
        ],
        result: 'Standard $388.57/mo · Graduated $175→$781.40/mo · Extended $225.51/mo',
        explanation: 'Extended\'s payment is little more than half of Standard\'s, but spreading the same balance over 25 instead of 10 years nearly triples the total interest. Graduated costs much less extra ($4,206.55) because it still fully repays by year 10 — it only delays when the money is paid, not how long the loan runs.'
      },
      watchOut: [
        { title: 'This is a simplified Graduated model', body: 'It shows the plan\'s real shape — low start, step up every two years, done in 10 years — but not your servicer\'s exact cent-by-cent amounts or any regulatory cap on how large each step can be.' },
        { title: 'Extended has a real eligibility floor', body: 'You need more than $30,000 in outstanding Direct Loans to choose Extended. Below that, Standard and Graduated are your only options on this page\'s three plans.' },
        { title: 'Graduated and Extended are not available to every borrower', body: 'Per the Department of Education\'s loan servicers, both are limited to loans first disbursed before July 1, 2026. Newer loans use a Tiered Standard plan instead, which is not modeled here.' },
        { title: 'A lower payment is not a lower rate', body: 'The APR is identical across all three plans in this comparison. A smaller payment only means a smaller share of each month goes to principal, which is why total interest rises as the term lengthens.' },
        { title: 'Most borrowers have more than one loan', body: 'Federal borrowers often hold several loans serviced together, which can change the real minimum payment math slightly from a single-loan estimate like this one.' }
      ],
      references: [
        { label: 'Edfinancial (U.S. Department of Education federal loan servicer), Lower Payment Options', url: 'https://edfinancial.studentaid.gov/lower-payment-options' },
        { label: 'MOHELA (U.S. Department of Education federal loan servicer), Repayment Plans', url: 'https://mohela.studentaid.gov/DL/ResourceCenter/RepaymentPlans.aspx' }
      ]
    },
    inputs: [
      { id: 'loanAmount', label: 'Student loan balance', type: 'currency', placeholder: '35000', defaultValue: 35000, step: 500, min: 0 },
      { id: 'apr', label: 'Interest rate (APR)', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Student Loan Repayment Calculator',
      description: 'Compare the federal Standard, Graduated and Extended student loan repayment plans: monthly payment and total interest on each, side by side.',
      faq: [
        { question: 'What is the difference between Standard, Graduated and Extended repayment?', answer: 'Standard is a fixed payment over 10 years with the least total interest. Graduated keeps the 10-year term but starts lower and increases roughly every two years. Extended stretches the term to 25 years for a lower fixed payment but more total interest.' },
        { question: 'How much extra does Extended repayment cost?', answer: 'On a $35,000 loan at 6% APR, this calculator finds Extended costs $21,023.04 more in total interest than Standard, in exchange for a payment that is a little more than half as large.' },
        { question: 'Am I eligible for the Extended plan?', answer: 'You need more than $30,000 in outstanding Direct Loan balances, and per the Department of Education\'s loan servicers, your loans must have been first disbursed before July 1, 2026.' },
        { question: 'Are Graduated and Extended repayment still available?', answer: 'Only for loans first disbursed before July 1, 2026, per the Department of Education\'s loan servicers. Loans disbursed on or after that date use a new Tiered Standard plan instead, which is not modeled on this page.' },
        { question: 'Does a lower monthly payment mean a lower interest rate?', answer: 'No. All three plans in this calculator use the same APR. A lower payment just means a longer repayment term, so more total interest accrues before the loan is paid off.' },
        { question: 'How does this differ from the general loan calculator?', answer: 'Loan-calculator finds the payment for one fixed-term loan. This calculator is built specifically to compare three named federal student loan repayment plans — including Graduated\'s increasing-payment shape — on the same balance side by side.' },
        { question: 'Can I use this for a private student loan?', answer: 'Only loosely. Standard and Extended are ordinary fixed-term amortized loans and will work for any fixed-rate loan, but Graduated and Extended as named plans, and the $30,000 eligibility rule, are specific to federal Direct Loans.' }
      ]
    },
    compute(values) {
      const standardPayment = loanPayment(values.loanAmount, 120, values.apr);
      const standardTotalInterest = standardPayment * 120 - values.loanAmount;

      const extendedPayment = loanPayment(values.loanAmount, 300, values.apr);
      const extendedTotalInterest = extendedPayment * 300 - values.loanAmount;

      const graduated = graduatedSchedule(values.loanAmount, values.apr, 120, 24);

      return {
        standardPayment,
        standardTotalInterest,
        graduatedInitialPayment: graduated.initialPayment,
        graduatedFinalPayment: graduated.finalPayment,
        graduatedTotalInterest: graduated.totalInterest,
        extendedPayment,
        extendedTotalInterest,
        extraInterestGraduatedVsStandard: graduated.totalInterest - standardTotalInterest,
        extraInterestExtendedVsStandard: extendedTotalInterest - standardTotalInterest
      };
    }
  },
  {
    id: 'retirement-savings-calculator',
    group: 'Retirement',
    category: 'finance',
    glyph: 'Ret',
    updatedAt: '2026-11-16',
    aliases: ['retirement savings calculator', 'how much do i need to retire calculator', 'retirement nest egg calculator', 'retirement fund calculator', 'years to retirement calculator'],
    related: ['investment-calculator', 'compound-interest-calculator', '401k-employer-match-calculator', 'roth-ira-growth-calculator'],
    title: 'Retirement Savings Calculator',
    description: "Project how your retirement savings could grow from today's balance, years until retirement and a monthly contribution, plus a clearly caveated estimated sustainable withdrawal.",
    example: '$50,000 saved today plus $500 added every month for 25 years at an average 7% return grows to about $691,307, which a 4% withdrawal guideline would put at roughly $27,652 a year — an illustrative estimate, not a plan.',
    solver: {
      defaultTarget: 'futureValue',
      variables: [
        { id: 'futureValue', label: 'Projected balance at retirement', symbol: 'FV', dimension: 'currency', defaultValue: 691306.76, defaultUnit: 'currency' },
        { id: 'currentSavings', label: 'Current retirement savings', symbol: 'P', dimension: 'currency', defaultValue: 50000, defaultUnit: 'currency' },
        { id: 'monthlyContribution', label: 'Monthly contribution', symbol: 'C', dimension: 'currency', defaultValue: 500, defaultUnit: 'currency', fixed: true },
        { id: 'yearsToRetirement', label: 'Years until retirement', symbol: 't', dimension: 'term', defaultValue: 25, defaultUnit: 'yr', bounds: [0, 1200] },
        { id: 'annualReturn', label: 'Average annual return', symbol: 'r', dimension: 'percent', defaultValue: 7, defaultUnit: '%', bounds: [-50, 100] }
      ],
      // `yearsToRetirement` arrives already in months (the term dimension's base), and growth and
      // contributions compound monthly here — a payroll-style deposit, unlike investment-calculator's
      // yearly contribution and yearly compounding.
      solve: {
        futureValue: ({ currentSavings, monthlyContribution, yearsToRetirement, annualReturn }) =>
          yearsToRetirement >= 0
            ? currentSavings * growthFactor(annualReturn, 12, yearsToRetirement) + monthlyContribution * annuityFactor(annualReturn, 12, yearsToRetirement)
            : NaN,
        currentSavings: ({ futureValue, monthlyContribution, yearsToRetirement, annualReturn }) => {
          const start = (futureValue - monthlyContribution * annuityFactor(annualReturn, 12, yearsToRetirement)) / growthFactor(annualReturn, 12, yearsToRetirement);
          return yearsToRetirement >= 0 && start >= 0 ? start : NaN;
        },
        yearsToRetirement: ({ futureValue, currentSavings, monthlyContribution, annualReturn }) => {
          const i = annualReturn / 100 / 12;
          if (i === 0) return monthlyContribution > 0 ? (futureValue - currentSavings) / monthlyContribution : NaN;
          const x = (futureValue * i + monthlyContribution) / (currentSavings * i + monthlyContribution);
          const n = Math.log(x) / Math.log(1 + i);
          return n >= 0 ? n : NaN;
        }
      },
      // The return has no closed form when there are contributions: the widget finds it numerically.
      equation: (si) =>
        si.futureValue - (si.currentSavings * growthFactor(si.annualReturn, 12, si.yearsToRetirement) + si.monthlyContribution * annuityFactor(si.annualReturn, 12, si.yearsToRetirement)),
      outputs: [
        { id: 'totalContributed', label: 'Total you contribute', dimension: 'currency', compute: (si) => si.currentSavings + si.monthlyContribution * si.yearsToRetirement },
        { id: 'totalGrowth', label: 'Investment growth', dimension: 'currency', compute: (si) => si.futureValue - si.currentSavings - si.monthlyContribution * si.yearsToRetirement },
        { id: 'estimatedAnnualWithdrawal', label: 'Estimated sustainable withdrawal (4% guideline), per year', dimension: 'currency', compute: (si) => si.futureValue * 0.04 },
        { id: 'estimatedMonthlyWithdrawal', label: 'Estimated sustainable withdrawal (4% guideline), per month', dimension: 'currency', compute: (si) => (si.futureValue * 0.04) / 12 }
      ],
      derive: (si) => ({ contributions: si.monthlyContribution * si.yearsToRetirement }),
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'currentSavings', label: "Today's savings" },
            { from: 'contributions', label: 'Future contributions' },
            { from: 'totalGrowth', label: 'Growth' }
          ],
          center: 'futureValue',
          centerSub: 'projected balance'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'A retirement-shaped version of compound growth',
        paragraphs: [
          "This calculator answers one specific question: if you keep saving a fixed amount every month until retirement, what might the balance be, and what could it support once you stop working? It grows today's balance and every future monthly deposit with monthly compounding, which matches how a 401(k) or IRA actually grows through a payroll or bank deduction — unlike investment-calculator's general model, which adds one lump contribution at the end of each year.",
          'The second part — the estimated sustainable withdrawal — comes from the "4% rule," a guideline from financial planner William Bengen\'s 1994 study of how different withdrawal rates held up against historical U.S. market returns over 30-year retirements. It is a widely cited starting point, not a guarantee: it was built on a particular slice of market history, assumes a particular mix of stocks and bonds, and many planners today recommend checking it against your own time horizon, spending flexibility and market conditions rather than following it mechanically.',
          "This is a different question from 401k-employer-match-calculator (how much of your contribution an employer matches) and from roth-ira-growth-calculator or traditional-ira-calculator (growth inside a specific tax-advantaged account, with that account's own contribution limit and tax treatment). This page ignores account type, taxes and contribution limits entirely — it is a plain savings-and-withdrawal model for whichever accounts you're using."
        ]
      },
      howTo: {
        intro: 'Enter your monthly contribution (always an input), then any three of the other four fields. The fourth, marked auto, is calculated.',
        steps: [
          { name: 'Enter your monthly contribution', text: 'This is always an input. Include every retirement account you contribute to regularly.' },
          { name: 'Project your balance', text: "Type your current savings, the years until retirement and an average annual return. The projected balance appears, split into today's savings, future contributions and growth." },
          { name: 'Read the estimated withdrawal', text: 'Below the balance, the calculator shows what a 4% annual withdrawal of that balance would be, in both yearly and monthly terms — a rough guideline, not a plan.' },
          { name: 'Work backward from a target', text: 'Type a target balance as the projected balance. Leave the years alone to see how long it takes, or your current savings to see how much you would need to start with.' },
          { name: 'Try a range of returns', text: 'Run a cautious, a middle and an optimistic return. The spread matters more than any single number.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'With monthly compounding and a contribution at the end of each month, the projected balance is today\'s savings grown for n months plus an ordinary annuity of the monthly contributions. The estimated withdrawal applies the 4% guideline to that balance.',
        expression: 'FV = P × (1 + i)^n + C × ((1 + i)^n − 1) ÷ i, where i = r ÷ 12\nEstimated annual withdrawal ≈ FV × 4%',
        terms: [
          { symbol: 'FV', meaning: 'Projected balance at retirement.' },
          { symbol: 'P', meaning: "Today's retirement savings." },
          { symbol: 'C', meaning: 'Contribution added at the end of each month.' },
          { symbol: 'i', meaning: 'Monthly rate: the average annual return ÷ 12, as a decimal.' },
          { symbol: 'n', meaning: 'Number of months until retirement.' }
        ],
        note: 'Estimates only, not a retirement plan or financial advice. Returns are assumed constant and are never guaranteed; the 4% guideline is one rule of thumb among several and does not account for your actual spending, other income, taxes or how long you will need the money to last.'
      },
      workedExample: {
        intro: 'You have $50,000 saved, add $500 every month, have 25 years until retirement, and assume an average 7% annual return. What might you have, and what could a 4% withdrawal provide?',
        rows: [
          { label: 'Months until retirement (25 × 12)', value: '300' },
          { label: 'Monthly rate (7% ÷ 12)', value: '0.5833%' },
          { label: "Today's savings grown (50,000 × 1.005833^300)", value: '$286,270.91' },
          { label: 'Contributions grown (500 × annuity factor 810.0717)', value: '$405,035.85' },
          { label: 'Projected balance', value: '$691,306.76' },
          { label: 'Total contributed (50,000 + 500 × 300)', value: '$200,000' },
          { label: 'Growth (691,306.76 − 200,000)', value: '$491,306.76' },
          { label: 'Estimated withdrawal at 4% a year', value: '$27,652.27, or about $2,304.36 a month' }
        ],
        result: 'Projected balance ≈ $691,307, suggesting a 4% withdrawal of about $27,652 a year',
        explanation: 'Time matters enormously here: the same $50,000 plus $500 a month at 7% is worth only about $187,025 after 10 years but about $1,015,810 after 30. The assumed return matters too — at 5% a year the 25-year balance would be about $471,819, and at 9% about $1,030,982, so running a cautious and an optimistic return side by side is worth doing.'
      },
      watchOut: [
        { title: 'Estimates only: returns are not guaranteed', body: 'A constant average return is a planning assumption, not a forecast. Real portfolios rise and fall, and the order of good and bad years matters, especially near retirement.' },
        { title: 'The 4% guideline is a rule of thumb, not a rule', body: "It comes from one historical study of 30-year U.S. retirement periods (Bengen, 1994) and is debated. It says nothing about your own spending needs, other income (Social Security, a pension), health costs or how long your retirement will actually last." },
        { title: 'Taxes and required withdrawals are not modeled', body: 'Traditional retirement accounts are taxed on withdrawal and eventually require minimum distributions; this calculator ignores both. See roth-ira-growth-calculator, traditional-ira-calculator and rmd-calculator for that detail.' },
        { title: 'Fees and inflation reduce real returns', body: 'An expense ratio or advisory fee comes off the return every year, and the projected balance is in future dollars, not today\'s purchasing power.' }
      ],
      references: [
        { label: "William P. Bengen, \"Determining Withdrawal Rates Using Historical Data,\" Journal of Financial Planning (1994)", url: 'https://www.financialplanningassociation.org/sites/default/files/2021-04/MAR04%20Determining%20Withdrawal%20Rates%20Using%20Historical%20Data.pdf' },
        { label: 'U.S. Securities and Exchange Commission, Investor.gov: Save and Invest', url: 'https://www.investor.gov/introduction-investing/investing-basics/save-and-invest' },
        { label: 'OpenStax, Contemporary Mathematics, §6.7 Investments', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-7-investments' }
      ]
    },
    inputs: [
      { id: 'currentSavings', label: 'Current retirement savings', type: 'currency', placeholder: '50000', defaultValue: 50000, step: 1000, min: 0 },
      { id: 'annualReturn', label: 'Average annual return', type: 'percent', placeholder: '7', defaultValue: 7, step: 0.1, min: 0 },
      { id: 'yearsToRetirement', label: 'Years until retirement', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 0 },
      { id: 'monthlyContribution', label: 'Monthly contribution', type: 'currency', placeholder: '500', defaultValue: 500, step: 25, min: 0 }
    ],
    seo: {
      title: 'Retirement Savings Calculator – Growth & Withdrawal',
      description: "Project retirement savings growth from today's balance, years to retirement and a monthly contribution, plus a caveated estimated sustainable withdrawal.",
      faq: [
        { question: 'How do I calculate retirement savings growth?', answer: 'Grow your current savings by (1 + i)^n and add the future value of your monthly contributions, where i is the monthly rate and n the number of months. $50,000 plus $500 a month at 7% for 25 years comes to about $691,307.' },
        { question: 'How much can I safely withdraw in retirement?', answer: 'There is no guaranteed figure. A common guideline, the "4% rule," suggests withdrawing about 4% of the balance in the first year. On a $691,307 balance that is about $27,652 a year, or $2,304 a month — an illustrative estimate, not a plan, and many planners suggest adjusting it to your own situation.' },
        { question: 'How is this different from the investment calculator?', answer: 'Investment-calculator compounds a single yearly contribution annually. This calculator compounds a monthly contribution monthly, to match a payroll or bank deduction, and adds the estimated withdrawal step that investment-calculator does not include.' },
        { question: 'How is this different from a 401(k) or Roth IRA calculator?', answer: "401k-employer-match-calculator models an employer's matching formula, and roth-ira-growth-calculator and traditional-ira-calculator model growth inside a specific account's own contribution limit and tax treatment. This calculator ignores account type, taxes and limits entirely." },
        { question: 'Does this account for taxes or Social Security?', answer: 'No. It is a pre-tax savings and withdrawal model only, and does not include Social Security, a pension, or any other retirement income.' },
        { question: 'How much does starting earlier help?', answer: 'A great deal. The same $50,000 plus $500 a month at 7% is worth about $187,025 after 10 years, about $691,307 after 25 years and about $1,015,810 after 30 years — most of the growth happens in the final years because the balance it compounds on is so much larger.' }
      ]
    },
    compute(values) {
      const months = Math.max(1, values.yearsToRetirement * 12);
      const futureValue = values.currentSavings * growthFactor(values.annualReturn, 12, months) + values.monthlyContribution * annuityFactor(values.annualReturn, 12, months);
      const totalContributed = values.currentSavings + values.monthlyContribution * months;
      const totalGrowth = futureValue - totalContributed;
      const estimatedAnnualWithdrawal = futureValue * 0.04;
      const estimatedMonthlyWithdrawal = estimatedAnnualWithdrawal / 12;
      return { futureValue, totalContributed, totalGrowth, estimatedAnnualWithdrawal, estimatedMonthlyWithdrawal };
    }
  },
  {
    id: '401k-employer-match-calculator',
    group: 'Retirement',
    category: 'finance',
    glyph: '401k',
    updatedAt: '2026-11-16',
    aliases: ['401k match calculator', '401(k) employer match calculator', '401k contribution calculator', 'employer match calculator', '401k free money calculator'],
    related: ['retirement-savings-calculator', 'roth-ira-growth-calculator', 'traditional-ira-calculator', 'paycheck-calculator'],
    title: '401(k) Employer Match Calculator',
    description: "Calculate your 401(k) employee contribution, your employer's match, and the free employer money you leave on the table if you contribute less than your plan's match cap.",
    example: 'A $70,000 salary contributing 3%, with a 50%-up-to-6% employer match, gets a $1,050 match and leaves $1,050 of free employer money unclaimed; contributing the full 6% claims the entire $2,100 match.',
    breakdown: {
      headline: 'employerMatch',
      headlineLabel: 'Employer match this year',
      outputs: [
        { id: 'employerMatch', label: 'Employer match', format: 'currency' },
        { id: 'employeeContribution', label: 'Your contribution', format: 'currency' },
        { id: 'totalContribution', label: 'Total annual contribution', format: 'currency' },
        { id: 'freeMoneyLeftOnTable', label: 'Free employer money left on the table', format: 'currency' },
        { id: 'maxPossibleMatch', label: 'Maximum possible match, at the cap', format: 'currency' }
      ],
      groups: [
        { title: 'Your pay and contribution', inputs: ['annualSalary', 'employeeContributionPercent'] },
        { title: "Your plan's match formula", inputs: ['matchRatePercent', 'matchCapPercent'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'employeeContribution', label: 'Your contribution' },
          { from: 'employerMatch', label: 'Employer match' }
        ],
        center: 'totalContribution',
        centerSub: 'total annual contribution'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'How an employer 401(k) match works',
        paragraphs: [
          'Many employers add money to a 401(k) on top of what an employee contributes, using a formula such as "50% up to 6%": for every dollar an employee contributes, up to 6% of pay, the employer adds 50 cents. Contribute less than the 6% cap and part of that match goes unclaimed; contribute more than the cap and the extra is not matched at all. Formulas vary widely by employer, and employer contributions can also vest over a number of years rather than belonging to the employee immediately, per the U.S. Department of Labor\'s guide to 401(k) plans.',
          'The "free money left on the table" figure is the gap between the match you would get at the full cap and the match you are actually getting at your current contribution rate. It is a common way to frame the cost of under-contributing, though how much to prioritize it against other goals (high-rate debt, an emergency fund) is a personal decision this calculator does not make for you.',
          "The employee's own contribution here is capped at the IRS 2026 elective deferral limit of $24,500. Employer matching contributions do not count against that limit, but employee and employer contributions together are capped by a separate, higher limit — $72,000 for 2026 under Internal Revenue Code section 415(c) — which this calculator does not enforce since most plans are far below it. For how that saved money then grows, see retirement-savings-calculator, roth-ira-growth-calculator or traditional-ira-calculator, depending on the account."
        ]
      },
      howTo: {
        intro: "Enter your salary and the percentage of it you contribute, then your plan's match rate and match cap exactly as its summary plan description states them.",
        steps: [
          { name: 'Enter your salary', text: 'Your annual salary before taxes and deductions.' },
          { name: 'Enter your contribution', text: 'The percentage of salary you put into the 401(k) each year.' },
          { name: "Enter the match rate", text: 'What percentage of your contribution the employer adds — 50 for "50 cents per dollar," 100 for a full dollar-for-dollar match.' },
          { name: 'Enter the match cap', text: 'The percentage of salary up to which the employer matches — the "6%" in "50% up to 6%."' },
          { name: 'Read the result', text: 'The headline is the dollar employer match this year. The rows below show your contribution, the total, and any free match money you are not claiming.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "The employer match applies only up to the match cap, even if the employee contributes more. The employee's own contribution is capped separately at the IRS annual elective-deferral limit.",
        expression: 'employeeContribution = min(salary × employeePercent ÷ 100, $24,500)\nmatchablePercent = min(employeePercent, matchCapPercent)\nemployerMatch = salary × matchablePercent ÷ 100 × matchRate ÷ 100\nmaxPossibleMatch = salary × matchCapPercent ÷ 100 × matchRate ÷ 100\nfreeMoneyLeftOnTable = max(0, maxPossibleMatch − employerMatch)',
        terms: [
          { symbol: 'employeePercent', meaning: 'Percentage of salary the employee contributes.' },
          { symbol: 'matchRate', meaning: 'Percentage of each matched dollar the employer adds (50 for 50 cents on the dollar).' },
          { symbol: 'matchCapPercent', meaning: 'Percentage of salary up to which contributions are matched.' },
          { symbol: '$24,500', meaning: "The IRS 2026 401(k) elective deferral limit (catch-up contributions for ages 50 and over are not modeled)." }
        ],
        note: "Estimates only. Actual plan formulas, tiers and vesting schedules vary by employer — check your plan's summary plan description. Not financial or tax advice."
      },
      workedExample: {
        intro: "A $70,000 salary, contributing 3%, with a '50% up to 6%' employer match. What is the match, and how much free money is left on the table?",
        rows: [
          { label: 'Employee contribution (70,000 × 3%)', value: '$2,100' },
          { label: 'Matchable percent (min(3%, 6%))', value: '3%' },
          { label: 'Employer match (70,000 × 3% × 50%)', value: '$1,050' },
          { label: 'Maximum possible match (70,000 × 6% × 50%)', value: '$2,100' },
          { label: 'Free money left on the table (2,100 − 1,050)', value: '$1,050' },
          { label: 'Total annual contribution (2,100 + 1,050)', value: '$3,150' }
        ],
        result: '$1,050 employer match this year, with another $1,050 of free match money unclaimed',
        explanation: "Raising the contribution from 3% to the full 6% cap doubles the employee contribution to $4,200 and the employer match to $2,100, leaving $0 of free money on the table. Contributing above 6% adds no further match at all under this formula."
      },
      watchOut: [
        { title: 'Match formulas vary by employer', body: 'Some plans match a flat percentage, some use tiers (e.g. 100% up to 3%, then 50% of the next 2%), and this calculator models only the common single-tier case. Check your plan document for the exact formula.' },
        { title: 'Employer contributions may vest over time', body: "Per the U.S. Department of Labor, some plans let employer contributions vest gradually, meaning you only fully own them after a set number of years of service." },
        { title: 'A separate, higher overall limit applies', body: 'Employee and employer contributions together cannot exceed $72,000 for 2026 (Internal Revenue Code section 415(c)), on top of the employee-only $24,500 elective-deferral limit.' },
        { title: 'Not financial or tax advice', body: 'Whether to prioritize matching contributions over other financial goals depends on your own debts, emergency savings and plan terms.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Notice 2025-67: 2026 Amounts Relating to Retirement Plans and IRAs', url: 'https://www.irs.gov/pub/irs-drop/n-25-67.pdf' },
        { label: 'Internal Revenue Service, Retirement Topics – 401(k) and Profit-Sharing Plan Contribution Limits', url: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits' },
        { label: 'U.S. Department of Labor, 401(k) Plans for Small Businesses', url: 'https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/publications/401k-plans-for-small-businesses' }
      ]
    },
    inputs: [
      { id: 'annualSalary', label: 'Annual salary', type: 'currency', placeholder: '70000', defaultValue: 70000, step: 1000, min: 0 },
      { id: 'employeeContributionPercent', label: 'Your contribution (% of salary)', type: 'percent', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'matchRatePercent', label: 'Employer match rate (%)', type: 'percent', placeholder: '50', defaultValue: 50, step: 5, min: 0 },
      { id: 'matchCapPercent', label: 'Match cap (% of salary)', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.5, min: 0 }
    ],
    seo: {
      title: '401(k) Employer Match Calculator – Free Money Check',
      description: "Free 401(k) employer match calculator: see your contribution, your employer's match, and the free match money you lose by contributing below the cap.",
      faq: [
        { question: 'How is a 401(k) employer match calculated?', answer: "The employer matches a percentage of your contribution, up to a cap expressed as a percent of salary. On a $70,000 salary contributing 3% with a 50%-up-to-6% match, that's 70,000 × 3% × 50% = $1,050." },
        { question: 'What does "free money left on the table" mean?', answer: 'The match you are missing by contributing below the cap. In the example, the maximum possible match at 6% is $2,100; contributing only 3% claims $1,050 of it, leaving $1,050 unclaimed.' },
        { question: 'Does the employer match count toward my own contribution limit?', answer: 'No. The $24,500 2026 IRS limit applies to your own elective deferrals only. Employer matching contributions count toward a separate, higher combined limit of $72,000 for 2026.' },
        { question: 'How does this differ from retirement-savings-calculator?', answer: 'This calculator finds this year\'s employee contribution and employer match from a salary and a match formula. Retirement-savings-calculator takes a monthly contribution (which could include this one) and projects its growth over many years.' },
        { question: 'Do all employers match 401(k) contributions the same way?', answer: 'No. Formulas vary, some plans use multiple tiers, and employer contributions can vest gradually rather than belong to you immediately. Check your plan\'s summary plan description.' },
        { question: 'Should I contribute at least up to the match?', answer: 'Many people treat a full employer match as a priority, since turning it down forfeits money the employer would otherwise contribute, but this depends on your own debts, emergency savings and goals. This is not personalized financial advice.' }
      ]
    },
    compute(values) {
      const employeeContribution = Math.min(values.annualSalary * (values.employeeContributionPercent / 100), PAYROLL_2026.max401k);
      const matchableSalaryPercent = Math.min(values.employeeContributionPercent, values.matchCapPercent);
      const employerMatch = values.annualSalary * (matchableSalaryPercent / 100) * (values.matchRatePercent / 100);
      const maxPossibleMatch = values.annualSalary * (values.matchCapPercent / 100) * (values.matchRatePercent / 100);
      const freeMoneyLeftOnTable = Math.max(0, maxPossibleMatch - employerMatch);
      const totalContribution = employeeContribution + employerMatch;
      return { employerMatch, employeeContribution, totalContribution, freeMoneyLeftOnTable, maxPossibleMatch };
    }
  },
  {
    id: 'roth-ira-growth-calculator',
    group: 'Retirement',
    category: 'finance',
    glyph: 'Roth',
    updatedAt: '2026-11-16',
    aliases: ['roth ira calculator', 'roth ira growth calculator', 'roth ira contribution calculator', 'roth ira return calculator', 'tax-free retirement calculator'],
    related: ['traditional-ira-calculator', 'retirement-savings-calculator', 'investment-calculator', '401k-employer-match-calculator'],
    title: 'Roth IRA Growth Calculator',
    description: "Project how a Roth IRA could grow from an after-tax contribution each year, with the current IRS annual contribution limit cited, and tax-free qualified withdrawals.",
    example: "A $20,000 Roth IRA balance plus $7,000 contributed every year for 20 years at an average 7% return grows to about $364,362 — and because it's a Roth, a qualified withdrawal of the entire amount would be tax-free.",
    solver: {
      defaultTarget: 'futureValue',
      variables: [
        { id: 'futureValue', label: 'Future value', symbol: 'FV', dimension: 'currency', defaultValue: 364362.14, defaultUnit: 'currency' },
        { id: 'currentBalance', label: 'Current Roth IRA balance', symbol: 'P', dimension: 'currency', defaultValue: 20000, defaultUnit: 'currency' },
        { id: 'annualContribution', label: 'Annual contribution', symbol: 'C', dimension: 'currency', defaultValue: 7000, defaultUnit: 'currency', fixed: true },
        { id: 'years', label: 'Years invested', symbol: 't', dimension: 'term', defaultValue: 20, defaultUnit: 'yr', bounds: [0, 1200] },
        { id: 'annualReturn', label: 'Average annual return', symbol: 'r', dimension: 'percent', defaultValue: 7, defaultUnit: '%', bounds: [-50, 100] }
      ],
      // Same yearly-compounding, yearly-contribution model as investment-calculator; `years` arrives
      // in months (the term dimension's base), so growth and the annuity factor use years / 12.
      solve: {
        futureValue: ({ currentBalance, annualContribution, years, annualReturn }) =>
          years >= 0 ? currentBalance * growthFactor(annualReturn, 1, years / 12) + annualContribution * annuityFactor(annualReturn, 1, years / 12) : NaN,
        currentBalance: ({ futureValue, annualContribution, years, annualReturn }) => {
          const start = (futureValue - annualContribution * annuityFactor(annualReturn, 1, years / 12)) / growthFactor(annualReturn, 1, years / 12);
          return years >= 0 && start >= 0 ? start : NaN;
        },
        years: ({ futureValue, currentBalance, annualContribution, annualReturn }) => {
          const i = annualReturn / 100;
          if (i === 0) return annualContribution > 0 ? ((futureValue - currentBalance) / annualContribution) * 12 : NaN;
          const t = Math.log((futureValue * i + annualContribution) / (currentBalance * i + annualContribution)) / Math.log(1 + i);
          return t >= 0 ? t * 12 : NaN;
        }
      },
      equation: (si) =>
        si.futureValue - (si.currentBalance * growthFactor(si.annualReturn, 1, si.years / 12) + si.annualContribution * annuityFactor(si.annualReturn, 1, si.years / 12)),
      outputs: [
        { id: 'totalContributed', label: 'Total contributed', dimension: 'currency', compute: (si) => si.currentBalance + (si.annualContribution * si.years) / 12 },
        { id: 'totalGrowth', label: 'Tax-free growth', dimension: 'currency', compute: (si) => si.futureValue - si.currentBalance - (si.annualContribution * si.years) / 12 }
      ],
      derive: (si) => ({ contributions: (si.annualContribution * si.years) / 12 }),
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'currentBalance', label: 'Current balance' },
            { from: 'contributions', label: 'Contributions' },
            { from: 'totalGrowth', label: 'Growth' }
          ],
          center: 'futureValue',
          centerSub: 'projected balance'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'A Roth IRA: after-tax money in, tax-free growth out',
        paragraphs: [
          'A Roth IRA is funded with money you have already paid income tax on — you cannot deduct a Roth contribution. In exchange, the IRS does not tax a "qualified distribution" at all: no tax on the contributions (naturally, since they were already taxed) and none on the growth either, as long as the account has been open at least five years and the withdrawal is made at age 59½ or later (or another qualifying reason). A Roth IRA also has no required minimum distributions during the original owner\'s lifetime, unlike a traditional IRA or most 401(k)s — see rmd-calculator and traditional-ira-calculator.',
          'The growth math itself is the same yearly-contribution, yearly-compounding model as investment-calculator. What is specific to this page is the Roth IRA\'s own IRS contribution limit: $7,500 for 2026 (or $8,600 including the $1,100 catch-up contribution for those 50 and older), and an income cap — for 2026, the amount you can contribute phases out between $153,000 and $168,000 of modified adjusted gross income for single filers and heads of household, and between $242,000 and $252,000 for married couples filing jointly. This calculator does not enforce those limits; keep your own contribution at or under whatever you are actually eligible for.',
          'For the same growth model with pre-tax contributions instead — taxed later rather than now — see traditional-ira-calculator. For a monthly, account-agnostic version without a contribution limit, see retirement-savings-calculator.'
        ]
      },
      howTo: {
        intro: 'Enter your annual contribution (0 for a single lump sum), then any three of the other four fields. The fourth, marked auto, is calculated.',
        steps: [
          { name: 'Enter your annual contribution', text: 'This is always an input. Keep it at or under your actual 2026 Roth IRA limit: $7,500, or $8,600 if you are 50 or older.' },
          { name: 'Project the future value', text: 'Type the current balance, the years invested and an average annual return to see the projected balance, with contributions and growth broken out.' },
          { name: 'Plan backward from a goal', text: 'Type a target future value. Leave the years alone to see how long it takes, or the current balance to see how much you would need to start with.' },
          { name: 'Find the return you need', text: 'Fill in the goal, start, contribution and years so the return is the field left alone longest, and the calculator searches for the average return required.' },
          { name: 'Remember the tax treatment', text: 'Whatever the future value turns out to be, a qualified withdrawal of the whole amount is tax-free — unlike a taxable brokerage account or a traditional IRA.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'With yearly compounding and a contribution at the end of each year, the future value is the current balance grown for t years plus an ordinary annuity of the contributions — identical math to investment-calculator, applied to a Roth IRA\'s own contribution limit.',
        expression: 'FV = P × (1 + r)^t + C × ((1 + r)^t − 1) ÷ r\nTotal contributed = P + C × t',
        terms: [
          { symbol: 'FV', meaning: 'Projected balance at the end.' },
          { symbol: 'P', meaning: 'Current Roth IRA balance.' },
          { symbol: 'C', meaning: 'Contribution added at the end of each year, capped at your actual IRS limit.' },
          { symbol: 'r', meaning: 'Average annual return as a decimal (7% = 0.07).' },
          { symbol: 't', meaning: 'Years invested.' }
        ],
        note: 'Estimates only. Returns are assumed constant and are never guaranteed. Contribution eligibility depends on your income and the current IRS limit, which this calculator does not enforce. Not tax advice.'
      },
      workedExample: {
        intro: 'You have $20,000 in a Roth IRA and contribute $7,000 at the end of every year (under the 2026 limit of $7,500) for 20 years, assuming an average 7% annual return. What could it grow to, and how is it taxed?',
        rows: [
          { label: 'Growth factor 1.07^20', value: '3.869684' },
          { label: 'Current balance grown (20,000 × 3.869684)', value: '$77,393.69' },
          { label: 'Annuity factor (3.869684 − 1) ÷ 0.07', value: '40.995492' },
          { label: 'Contributions grown (7,000 × 40.995492)', value: '$286,968.45' },
          { label: 'Future value', value: '$364,362.14' },
          { label: 'Total contributed (20,000 + 7,000 × 20)', value: '$160,000' },
          { label: 'Tax-free growth (364,362.14 − 160,000)', value: '$204,362.14' }
        ],
        result: 'FV ≈ $364,362 after 20 years, of which about $204,362 is growth',
        explanation: 'If this account is qualified, the full $364,362 — including the $204,362 that was never taxed — can be withdrawn tax-free. In a taxable account, that $204,362 of growth would ordinarily be taxed when realized; that tax-free treatment is the entire value of using a Roth IRA over a plain brokerage account for the same growth.'
      },
      watchOut: [
        { title: 'Contribution limit and income cap', body: 'The 2026 limit is $7,500 ($8,600 at age 50+), and the amount you can contribute phases out between $153,000–$168,000 of MAGI (single/head of household) or $242,000–$252,000 (married filing jointly). This calculator does not check your eligibility.' },
        { title: '"Qualified" has specific rules', body: 'Tax-free treatment of earnings requires the account to be open five years and the withdrawal to be made at 59½ or later (or another qualifying reason). Earlier non-qualified withdrawals of earnings can be taxed and penalized.' },
        { title: 'Estimates only: returns are not guaranteed', body: 'A constant average return is a planning assumption, not a forecast. Fees also reduce the real return.' },
        { title: 'Not tax advice', body: 'Confirm your own eligibility and contribution limit with the IRS or a tax professional before contributing.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Notice 2025-67: 2026 Amounts Relating to Retirement Plans and IRAs', url: 'https://www.irs.gov/pub/irs-drop/n-25-67.pdf' },
        { label: 'Internal Revenue Service, Roth IRAs', url: 'https://www.irs.gov/retirement-plans/roth-iras' },
        { label: 'OpenStax, Contemporary Mathematics, §6.7 Investments', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-7-investments' }
      ]
    },
    inputs: [
      { id: 'currentBalance', label: 'Current Roth IRA balance', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 1000, min: 0 },
      { id: 'annualReturn', label: 'Annual return rate', type: 'percent', placeholder: '7', defaultValue: 7, step: 0.1, min: 0 },
      { id: 'years', label: 'Years invested', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 },
      { id: 'annualContribution', label: 'Annual contribution', type: 'currency', placeholder: '7000', defaultValue: 7000, step: 500, min: 0 }
    ],
    seo: {
      title: 'Roth IRA Growth Calculator – Tax-Free Projection',
      description: 'Project Roth IRA growth from an after-tax contribution each year, using the current IRS contribution limit, with tax-free qualified withdrawals explained.',
      faq: [
        { question: 'How much can I contribute to a Roth IRA in 2026?', answer: 'The IRS limit is $7,500, or $8,600 including the $1,100 catch-up contribution if you are 50 or older, per Notice 2025-67. Contribution room is also reduced or eliminated at higher incomes.' },
        { question: 'Are Roth IRA withdrawals really tax-free?', answer: 'Yes, if the distribution is "qualified": the account has been open at least five years and you are 59½ or older (or meet another qualifying reason). Both the contributions and all the growth come out tax-free.' },
        { question: 'What income makes me ineligible for a Roth IRA?', answer: 'For 2026, the amount you can contribute phases out between $153,000 and $168,000 of modified adjusted gross income for single filers and heads of household, and between $242,000 and $252,000 for married couples filing jointly.' },
        { question: 'How does this differ from traditional-ira-calculator?', answer: 'The growth math is identical. A Roth IRA is funded with after-tax money and comes out tax-free; a traditional IRA is funded with pre-tax money and is taxed on withdrawal. Traditional-ira-calculator models that trade-off directly with the same example numbers.' },
        { question: 'How does this differ from investment-calculator or retirement-savings-calculator?', answer: 'Investment-calculator is a generic, non-tax-specific version of the same growth math. Retirement-savings-calculator uses monthly contributions and monthly compounding and adds an estimated withdrawal. Neither models the Roth IRA\'s own contribution limit or tax-free treatment.' },
        { question: 'How much of my Roth IRA balance would be growth versus contributions?', answer: 'In the worked example, $204,362 of the $364,362 projected balance is growth and $160,000 is contributions — and in a qualified Roth IRA, both come out tax-free.' }
      ]
    },
    compute(values) {
      const r = values.annualReturn / 100;
      const n = Math.max(1, values.years);
      const futureValuePrincipal = values.currentBalance * Math.pow(1 + r, n);
      const futureValueContributions = r === 0
        ? values.annualContribution * n
        : values.annualContribution * ((Math.pow(1 + r, n) - 1) / r);
      const futureValue = futureValuePrincipal + futureValueContributions;
      const totalContributed = values.currentBalance + values.annualContribution * n;
      const totalGrowth = futureValue - totalContributed;
      return { futureValue, totalContributed, totalGrowth };
    }
  },
  {
    id: 'traditional-ira-calculator',
    group: 'Retirement',
    category: 'finance',
    glyph: 'TIRA',
    updatedAt: '2026-11-16',
    aliases: ['traditional ira calculator', 'traditional ira growth calculator', 'traditional ira contribution calculator', 'pre-tax ira calculator', 'deductible ira calculator'],
    related: ['roth-ira-growth-calculator', 'rmd-calculator', 'retirement-savings-calculator', '401k-employer-match-calculator'],
    title: 'Traditional IRA Calculator',
    description: 'Project traditional IRA growth from a pre-tax contribution each year, using the current IRS contribution limit, with the deferred tax on withdrawal shown directly.',
    example: "A $20,000 traditional IRA balance plus $7,000 contributed every year for 20 years at an average 7% return grows to about $364,362 before tax — the same pretax total as the Roth IRA example — but withdrawing it at a 22% tax rate would owe about $80,160, leaving about $284,202 after tax.",
    solver: {
      defaultTarget: 'futureValue',
      variables: [
        { id: 'futureValue', label: 'Future value (before tax)', symbol: 'FV', dimension: 'currency', defaultValue: 364362.14, defaultUnit: 'currency' },
        { id: 'currentBalance', label: 'Current traditional IRA balance', symbol: 'P', dimension: 'currency', defaultValue: 20000, defaultUnit: 'currency' },
        { id: 'annualContribution', label: 'Annual contribution', symbol: 'C', dimension: 'currency', defaultValue: 7000, defaultUnit: 'currency', fixed: true },
        { id: 'years', label: 'Years invested', symbol: 't', dimension: 'term', defaultValue: 20, defaultUnit: 'yr', bounds: [0, 1200] },
        { id: 'annualReturn', label: 'Average annual return', symbol: 'r', dimension: 'percent', defaultValue: 7, defaultUnit: '%', bounds: [-50, 100] },
        { id: 'taxRateAtWithdrawal', label: 'Assumed tax rate (now and at withdrawal)', symbol: 'τ', dimension: 'percent', defaultValue: 22, defaultUnit: '%', fixed: true }
      ],
      // Identical growth math to roth-ira-growth-calculator (yearly contribution, yearly compounding);
      // `years` arrives in months (the term dimension's base), so growth and the annuity factor use
      // years / 12. `taxRateAtWithdrawal` never participates in the growth equation — it only feeds
      // the tax-now/tax-later outputs below, so it stays fixed and out of the auto-field rotation.
      solve: {
        futureValue: ({ currentBalance, annualContribution, years, annualReturn }) =>
          years >= 0 ? currentBalance * growthFactor(annualReturn, 1, years / 12) + annualContribution * annuityFactor(annualReturn, 1, years / 12) : NaN,
        currentBalance: ({ futureValue, annualContribution, years, annualReturn }) => {
          const start = (futureValue - annualContribution * annuityFactor(annualReturn, 1, years / 12)) / growthFactor(annualReturn, 1, years / 12);
          return years >= 0 && start >= 0 ? start : NaN;
        },
        years: ({ futureValue, currentBalance, annualContribution, annualReturn }) => {
          const i = annualReturn / 100;
          if (i === 0) return annualContribution > 0 ? ((futureValue - currentBalance) / annualContribution) * 12 : NaN;
          const t = Math.log((futureValue * i + annualContribution) / (currentBalance * i + annualContribution)) / Math.log(1 + i);
          return t >= 0 ? t * 12 : NaN;
        }
      },
      equation: (si) =>
        si.futureValue - (si.currentBalance * growthFactor(si.annualReturn, 1, si.years / 12) + si.annualContribution * annuityFactor(si.annualReturn, 1, si.years / 12)),
      outputs: [
        { id: 'totalContributed', label: 'Total contributed', dimension: 'currency', compute: (si) => si.currentBalance + (si.annualContribution * si.years) / 12 },
        { id: 'totalGrowth', label: 'Tax-deferred growth', dimension: 'currency', compute: (si) => si.futureValue - si.currentBalance - (si.annualContribution * si.years) / 12 },
        { id: 'taxSavingsThisYear', label: "This year's estimated tax savings from the contribution", dimension: 'currency', compute: (si) => si.annualContribution * (si.taxRateAtWithdrawal / 100) },
        { id: 'taxOwedAtWithdrawal', label: 'Estimated tax owed if withdrawn at the assumed rate', dimension: 'currency', compute: (si) => si.futureValue * (si.taxRateAtWithdrawal / 100) },
        { id: 'afterTaxValue', label: 'Estimated after-tax value', dimension: 'currency', compute: (si) => si.futureValue - si.futureValue * (si.taxRateAtWithdrawal / 100) }
      ],
      derive: (si) => ({ contributions: (si.annualContribution * si.years) / 12 }),
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'currentBalance', label: 'Current balance' },
            { from: 'contributions', label: 'Contributions' },
            { from: 'totalGrowth', label: 'Growth' }
          ],
          center: 'futureValue',
          centerSub: 'projected balance, before tax'
        },
        {
          type: 'compareBars',
          bars: [{ from: 'futureValue', label: 'Before tax' }, { from: 'afterTaxValue', label: 'After tax' }],
          title: 'What withdrawal tax takes off the top',
          highlight: 1
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'A traditional IRA: pre-tax money in, taxed on the way out',
        paragraphs: [
          'A traditional IRA is funded with money that may be deductible on this year\'s tax return, which is why it is often called "pre-tax." The growth inside the account is tax-deferred — no tax is owed year to year as it compounds — but every dollar of a deductible contribution and its growth is taxed as ordinary income when withdrawn, at whatever tax rate applies then. This is the direct opposite of roth-ira-growth-calculator, which taxes the contribution now and lets qualified growth come out completely tax-free.',
          "Whether the contribution is fully deductible depends on income and whether you (or your spouse) are also covered by a workplace retirement plan. For 2026, per IRS Notice 2025-67, a single filer or head of household who is an active participant in a workplace plan sees the deduction phase out between $81,000 and $91,000 of modified adjusted gross income; for a married couple filing jointly where the contributor is the active participant, the range is $129,000 to $149,000; and for a contributor who isn't an active participant but whose spouse is, it's $242,000 to $252,000. Below those ranges the full contribution is deductible; above them, none of it is. This calculator assumes full deductibility and does not check your eligibility.",
          "The growth math itself is identical to roth-ira-growth-calculator and investment-calculator — the same yearly-contribution, yearly-compounding model, applied to the same shared IRS contribution limit. What's specific to this page is the tax layer: an assumed tax rate is used both for this year's estimated deduction savings and for the tax owed on the full pretax balance at withdrawal, so the real trade-off (tax now vs. tax later) shows up as actual dollars instead of a description. Eventually the IRS also requires withdrawals on a schedule — see rmd-calculator — which a Roth IRA does not require during the original owner's lifetime."
        ]
      },
      howTo: {
        intro: 'Enter your annual contribution (0 for a single lump sum) and an assumed tax rate, then any three of the other four growth fields. The fourth, marked auto, is calculated.',
        steps: [
          { name: 'Enter your annual contribution', text: 'This is always an input. Keep it, combined with any Roth IRA contributions in the same year, at or under your actual 2026 limit: $7,500, or $8,600 if you are 50 or older — the limit is shared across both account types.' },
          { name: 'Project the future value', text: 'Type the current balance, the years invested and an average annual return to see the pretax projected balance, with contributions and growth broken out.' },
          { name: 'Set the assumed tax rate', text: "Enter the tax rate you expect to pay — both on this year's deduction and on withdrawals later. Using the same rate for both keeps the comparison simple; try a lower retirement-year rate if you expect to be in a lower bracket then." },
          { name: 'Read the tax-now and tax-later figures', text: "Below the balance, see this year's estimated tax savings from the deduction, the estimated tax owed at withdrawal, and the after-tax value that leaves you with." },
          { name: 'Compare with the Roth IRA calculator', text: 'Run the same current balance, contribution, years and return through roth-ira-growth-calculator to see the identical pretax balance come out completely tax-free instead.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "The future value uses the same yearly-compounding, yearly-contribution formula as roth-ira-growth-calculator. The tax figures apply one assumed rate to the current year's contribution and to the full pretax future value.",
        expression: 'FV = P × (1 + r)^t + C × ((1 + r)^t − 1) ÷ r\nTax savings this year ≈ C × τ\nTax owed at withdrawal ≈ FV × τ\nAfter-tax value = FV − (FV × τ)',
        terms: [
          { symbol: 'FV', meaning: 'Projected pretax balance at the end.' },
          { symbol: 'P', meaning: 'Current traditional IRA balance.' },
          { symbol: 'C', meaning: 'Pre-tax contribution added at the end of each year, capped at your actual IRS limit.' },
          { symbol: 'r', meaning: 'Average annual return as a decimal (7% = 0.07).' },
          { symbol: 't', meaning: 'Years invested.' },
          { symbol: 'τ', meaning: 'Assumed tax rate (as a decimal), used both now and at withdrawal.' }
        ],
        note: "Estimates only. Returns are assumed constant and are never guaranteed. Whether a contribution is actually deductible depends on your income and workplace-plan coverage, which this calculator does not check, and your real future tax rate is unknowable today. Not tax advice."
      },
      workedExample: {
        intro: 'You have $20,000 in a traditional IRA and contribute $7,000 at the end of every year for 20 years, assuming an average 7% annual return and a 22% tax rate now and at withdrawal — the same growth inputs as the roth-ira-growth-calculator example.',
        rows: [
          { label: 'Growth factor 1.07^20', value: '3.869684' },
          { label: 'Current balance grown (20,000 × 3.869684)', value: '$77,393.69' },
          { label: 'Annuity factor (3.869684 − 1) ÷ 0.07', value: '40.995492' },
          { label: 'Contributions grown (7,000 × 40.995492)', value: '$286,968.45' },
          { label: 'Future value, before tax', value: '$364,362.14' },
          { label: "This year's tax savings (7,000 × 22%)", value: '$1,540.00' },
          { label: 'Tax owed at withdrawal (364,362.14 × 22%)', value: '$80,159.67' },
          { label: 'After-tax value (364,362.14 − 80,159.67)', value: '$284,202.47' }
        ],
        result: 'FV ≈ $364,362 before tax — identical to the Roth IRA example — but about $284,202 after a 22% withdrawal tax',
        explanation: "That $364,362 is exactly what roth-ira-growth-calculator projects for the same inputs, because the growth math never looks at tax treatment. The difference only shows up at the ends: this $7,000 contribution saves an estimated $1,540 in tax this year, but the entire $364,362 is taxable later, unlike a Roth IRA's tax-free qualified withdrawal. At a higher 32% withdrawal rate instead of 22%, the tax owed would be about $116,595.88 and the after-tax value about $247,766.26 — the assumed rate matters as much as the growth rate."
      },
      watchOut: [
        { title: 'The contribution limit is shared with Roth IRAs', body: 'The 2026 limit is $7,500 ($8,600 at age 50+) across all of your traditional and Roth IRA contributions combined, not $7,500 for each account separately.' },
        { title: 'The deduction can be reduced or eliminated', body: "If you or your spouse are covered by a workplace retirement plan, the deduction phases out at the income ranges in this page's concept section (Notice 2025-67). This calculator assumes full deductibility." },
        { title: 'Required minimum distributions apply', body: 'Unlike a Roth IRA, a traditional IRA requires withdrawals on a schedule starting at age 73 — see rmd-calculator. This calculator does not model RMDs.' },
        { title: 'Early withdrawals are taxed and penalized', body: 'A withdrawal before age 59½ is generally taxed as ordinary income plus a 10% additional tax, with limited exceptions.' },
        { title: 'The future tax rate is a guess', body: "Nobody knows their tax bracket decades from now. Try both a lower and a higher assumed rate to see how much it changes the after-tax value." }
      ],
      references: [
        { label: 'Internal Revenue Service, Notice 2025-67: 2026 Amounts Relating to Retirement Plans and IRAs', url: 'https://www.irs.gov/pub/irs-drop/n-25-67.pdf' },
        { label: 'Internal Revenue Service, Traditional IRAs', url: 'https://www.irs.gov/retirement-plans/traditional-iras' },
        { label: 'OpenStax, Contemporary Mathematics, §6.7 Investments', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-7-investments' }
      ]
    },
    inputs: [
      { id: 'currentBalance', label: 'Current traditional IRA balance', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 1000, min: 0 },
      { id: 'annualReturn', label: 'Annual return rate', type: 'percent', placeholder: '7', defaultValue: 7, step: 0.1, min: 0 },
      { id: 'years', label: 'Years invested', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 },
      { id: 'annualContribution', label: 'Annual contribution', type: 'currency', placeholder: '7000', defaultValue: 7000, step: 500, min: 0 },
      { id: 'taxRateAtWithdrawal', label: 'Assumed tax rate (now and at withdrawal)', type: 'percent', placeholder: '22', defaultValue: 22, step: 1, min: 0 }
    ],
    seo: {
      title: 'Traditional IRA Calculator – Growth & Deferred Tax',
      description: 'Project traditional IRA growth from a pre-tax contribution, using the current IRS limit, with this year\'s tax savings and withdrawal tax shown directly.',
      faq: [
        { question: 'How much can I contribute to a traditional IRA in 2026?', answer: 'The IRS limit is $7,500, or $8,600 including the $1,100 catch-up contribution if you are 50 or older, per Notice 2025-67 — the same limit shared with any Roth IRA contributions you make in the same year.' },
        { question: 'Is my traditional IRA contribution tax-deductible?', answer: "It depends on your income and whether you or your spouse are covered by a workplace retirement plan. For 2026, the deduction phases out between $81,000-$91,000 of MAGI for a single active participant, $129,000-$149,000 for a married active participant filing jointly, and $242,000-$252,000 for a non-active-participant spouse of an active participant." },
        { question: 'How does this differ from roth-ira-growth-calculator?', answer: 'The growth math is identical — both grow $20,000 plus $7,000 a year at 7% to the same $364,362 over 20 years. A traditional IRA is funded pre-tax and is taxed as ordinary income on withdrawal; a Roth IRA is funded after-tax and comes out tax-free when qualified.' },
        { question: 'What happens when I withdraw the money?', answer: 'The withdrawal is taxed as ordinary income at whatever rate applies then. In the worked example, a 22% rate turns the $364,362 pretax balance into about $284,202 after tax, and the IRS also requires withdrawals on a schedule starting at age 73 — see rmd-calculator.' },
        { question: 'What if I withdraw before age 59½?', answer: "Early withdrawals are generally taxed as ordinary income plus a 10% additional tax, with limited exceptions such as disability or a first-time home purchase." },
        { question: 'How much does the assumed tax rate change the outcome?', answer: 'A lot. On the same $364,362 pretax balance, a 22% withdrawal tax rate leaves about $284,202 after tax, while a 32% rate leaves about $247,766 — the tax-rate assumption matters almost as much as the return assumption.' }
      ]
    },
    compute(values) {
      const r = values.annualReturn / 100;
      const n = Math.max(1, values.years);
      const futureValuePrincipal = values.currentBalance * Math.pow(1 + r, n);
      const futureValueContributions = r === 0
        ? values.annualContribution * n
        : values.annualContribution * ((Math.pow(1 + r, n) - 1) / r);
      const futureValue = futureValuePrincipal + futureValueContributions;
      const totalContributed = values.currentBalance + values.annualContribution * n;
      const totalGrowth = futureValue - totalContributed;
      const taxRate = values.taxRateAtWithdrawal / 100;
      const taxSavingsThisYear = values.annualContribution * taxRate;
      const taxOwedAtWithdrawal = futureValue * taxRate;
      const afterTaxValue = futureValue - taxOwedAtWithdrawal;
      return { futureValue, totalContributed, totalGrowth, taxSavingsThisYear, taxOwedAtWithdrawal, afterTaxValue };
    }
  },
  {
    id: 'rmd-calculator',
    group: 'Retirement',
    category: 'finance',
    glyph: 'RMD',
    updatedAt: '2026-11-16',
    aliases: ['rmd calculator', 'required minimum distribution calculator', 'ira rmd calculator', 'ira required minimum distribution calculator', 'ira withdrawal calculator'],
    related: ['traditional-ira-calculator', 'roth-ira-growth-calculator', 'retirement-savings-calculator', '401k-employer-match-calculator'],
    title: 'RMD Calculator',
    description: "Calculate this year's required minimum distribution from a traditional IRA, using the IRS's current Uniform Lifetime Table and your prior year-end balance.",
    example: 'A $500,000 IRA balance at the end of last year, for someone turning 75 this year, requires a minimum distribution of about $20,325 — about 4.07% of the balance, using the IRS Uniform Lifetime Table denominator of 24.6.',
    breakdown: {
      headline: 'requiredMinimumDistribution',
      headlineLabel: 'Required minimum distribution this year',
      outputs: [
        { id: 'requiredMinimumDistribution', label: 'Required minimum distribution', format: 'currency' },
        { id: 'monthlyEquivalent', label: 'Monthly equivalent', format: 'currency' },
        { id: 'percentOfBalance', label: 'Percent of the balance withdrawn', format: 'percent' }
      ],
      groups: [
        { title: 'Your IRA', inputs: ['priorYearEndBalance', 'ownerAge'] }
      ],
      derive: (values) => ({ remainingBalance: values.priorYearEndBalance - values.requiredMinimumDistribution }),
      visual: {
        type: 'donut',
        segments: [
          { from: 'requiredMinimumDistribution', label: 'Required withdrawal this year' },
          { from: 'remainingBalance', label: 'Remaining balance' }
        ],
        center: 'priorYearEndBalance',
        centerSub: "balance at last year's end"
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'Required Minimum Distributions: what the IRS makes you withdraw',
        paragraphs: [
          "A traditional IRA (and most employer retirement plans) can't hold money tax-deferred forever. Starting at the IRS's required beginning date — age 73 for anyone who reached age 72 after December 31, 2022 — the owner must withdraw at least a minimum amount every year, called the required minimum distribution (RMD). The RMD is simple division: the account's balance at the end of the prior year, divided by an \"applicable denominator\" the IRS publishes by age, in Publication 590-B's Uniform Lifetime Table (Table III) — reproduced in full below.",
          "That one table covers the great majority of IRA owners: anyone unmarried, and anyone married whose spouse either isn't the sole beneficiary or isn't more than 10 years younger. A married owner whose spouse is both the sole beneficiary and more than 10 years younger uses a different, more generous table (Table II) instead, which this calculator does not model — the real RMD is lower in that specific case.",
          'This is the requirement roth-ira-growth-calculator keeps mentioning: a Roth IRA has no RMDs during the original owner\'s lifetime, while traditional-ira-calculator\'s pretax balance is exactly the kind of balance this table eventually applies to. retirement-savings-calculator and 401k-employer-match-calculator build the balance; this page is about what the IRS requires you to take back out of it.'
        ]
      },
      howTo: {
        intro: "Enter your IRA's balance at the end of last year and the age you'll turn this year.",
        steps: [
          { name: "Enter last year's ending balance", text: "The IRA's value at the close of business on December 31 of the prior year — not today's balance." },
          { name: "Enter the age you'll turn this year", text: 'This picks your row in the Uniform Lifetime Table below. The required beginning date is 73 for anyone reaching 72 after 2022.' },
          { name: 'Read the required distribution', text: 'The headline is the dollar amount you must withdraw this year, with the monthly equivalent and the percent of the balance it represents below it.' },
          { name: 'Check the full table', text: 'Scroll to the reference table to see every age from 72 to 120 and over, and how much the required percentage grows with age.' },
          { name: 'Confirm which table applies to you', text: "If your sole beneficiary is a spouse more than 10 years younger, your real RMD uses a different, larger denominator than this calculator shows — see Publication 590-B's Table II." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "The RMD divides last year's ending balance by the IRS's applicable denominator for your age this year, from the Uniform Lifetime Table.",
        expression: 'RMD = Balance at prior year-end ÷ Denominator(age)\nPercent of balance = 100 ÷ Denominator(age)',
        terms: [
          { symbol: 'Balance', meaning: "The IRA's value at the close of business on December 31 of the prior year." },
          { symbol: 'Denominator(age)', meaning: "The IRS's Uniform Lifetime Table (Table III) factor for the age you turn this year — shown in full below." }
        ],
        note: 'Estimates only. This models only the common Uniform Lifetime Table case; a spouse more than 10 years younger as sole beneficiary uses a different table and a different, smaller RMD. Not tax advice — confirm your own figure with your IRA custodian or a tax professional.'
      },
      workedExample: {
        intro: 'An IRA was worth $500,000 at the end of last year. Its owner turns 75 this year. What is the required minimum distribution?',
        rows: [
          { label: 'Applicable denominator for age 75 (Table III)', value: '24.6' },
          { label: 'RMD (500,000 ÷ 24.6)', value: '$20,325.20' },
          { label: 'Monthly equivalent (20,325.20 ÷ 12)', value: '$1,693.77' },
          { label: 'Percent of balance withdrawn (100 ÷ 24.6)', value: '4.065%' }
        ],
        result: 'RMD ≈ $20,325 this year, about $1,694 a month, about 4.07% of the balance',
        explanation: "Age alone changes the answer a great deal on the same $500,000 balance: at 73 the denominator is 26.5, for an RMD of about $18,868; at 90 it's 12.2, for an RMD of about $40,984 — a required withdrawal 101.6% higher at 90 than at 75, even though the balance in this example never changed. The required percentage keeps climbing every year because the IRS's denominator keeps shrinking."
      },
      watchOut: [
        { title: 'This models only the common Table III case', body: "If your sole beneficiary is your spouse and they're more than 10 years younger than you, the IRS requires the Joint and Last Survivor Table (Table II) instead, which produces a larger denominator and a smaller RMD than this calculator shows." },
        { title: 'Missing an RMD is costly', body: 'Per Publication 590-B, an amount not distributed as required is subject to a 25% excise tax, reduced to 10% if you correct the shortfall and file during the IRS\'s correction window.' },
        { title: 'The required beginning date is age 73', body: 'For anyone reaching age 72 after December 31, 2022. The very first RMD can be delayed to April 1 of the following year, but doing so means taking two RMDs in that second year.' },
        { title: "Roth IRAs don't have this requirement", body: "A Roth IRA has no required minimum distributions during the original owner's lifetime — see roth-ira-growth-calculator." },
        { title: 'This is a current-year figure only', body: "The RMD is recalculated every year from that year's own prior-year-end balance and that year's age; this calculator does not project several years of RMDs forward." }
      ],
      referenceTable: {
        title: 'IRS Uniform Lifetime Table (Table III), applicable denominator by age',
        columns: ['Age', 'Applicable denominator'],
        rows: Object.entries(RMD_UNIFORM_LIFETIME_TABLE).map(([age, denominator]) => ({ label: age, values: [denominator] })),
        decimals: 1,
        note: 'Internal Revenue Service, Publication 590-B (2025), Appendix B, Table III — for unmarried owners, and married owners whose spouse isn\'t the sole beneficiary or isn\'t more than 10 years younger.'
      },
      references: [
        { label: 'Internal Revenue Service, Publication 590-B (2025), Distributions from Individual Retirement Arrangements (IRAs), Appendix B', url: 'https://www.irs.gov/pub/irs-pdf/p590b.pdf' },
        { label: 'Internal Revenue Service, Retirement Topics – Required Minimum Distributions (RMDs)', url: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-required-minimum-distributions-rmds' }
      ]
    },
    inputs: [
      { id: 'priorYearEndBalance', label: "IRA balance at last year's end", type: 'currency', placeholder: '500000', defaultValue: 500000, step: 10000, min: 0 },
      { id: 'ownerAge', label: "Age you'll turn this year", type: 'number', placeholder: '75', defaultValue: 75, step: 1, min: 72 }
    ],
    seo: {
      title: 'RMD Calculator – IRS Required Minimum Distribution',
      description: "Calculate this year's IRA required minimum distribution from your prior year-end balance using the IRS's current Uniform Lifetime Table.",
      faq: [
        { question: 'What is a required minimum distribution (RMD)?', answer: "The minimum amount the IRS requires you to withdraw each year from a traditional IRA (and most employer retirement plans) once you reach the required beginning date, currently age 73 for anyone who turned 72 after 2022." },
        { question: 'How is my RMD calculated?', answer: "Divide your IRA's balance at the end of last year by the IRS's applicable denominator for your age this year, from the Uniform Lifetime Table. A $500,000 balance at age 75 uses a denominator of 24.6, for an RMD of about $20,325." },
        { question: 'When do RMDs start?', answer: 'At the required beginning date, age 73 for anyone reaching age 72 after December 31, 2022. The first one can be delayed to April 1 of the following year, but that means taking two RMDs in that second year.' },
        { question: 'What happens if I miss an RMD?', answer: "The IRS can charge a 25% excise tax on the amount not distributed as required, reduced to 10% if you correct it and file during the correction window described in Publication 590-B." },
        { question: 'Do Roth IRAs have RMDs?', answer: "No. A Roth IRA has no required minimum distributions during the original owner's lifetime, unlike the traditional IRA balance this calculator models — see roth-ira-growth-calculator and traditional-ira-calculator." },
        { question: 'Does the required percentage change with age?', answer: 'Yes, every year. On the same balance, the required percentage is about 4.07% at age 75 and about 8.20% at age 90 — the RMD at 90 is about 101.6% higher than at 75 for an identical balance, because the IRS denominator keeps shrinking.' }
      ]
    },
    compute(values) {
      const denominator = rmdDenominator(values.ownerAge);
      const requiredMinimumDistribution = values.priorYearEndBalance / denominator;
      const monthlyEquivalent = requiredMinimumDistribution / 12;
      const percentOfBalance = 100 / denominator;
      return { requiredMinimumDistribution, monthlyEquivalent, percentOfBalance };
    }
  },
  {
    id: 'pension-calculator',
    group: 'Retirement',
    category: 'finance',
    glyph: 'Pen',
    updatedAt: '2026-11-16',
    aliases: ['pension calculator', 'defined benefit pension calculator', 'final salary pension calculator', 'retirement pension estimator', 'pension benefit calculator'],
    related: ['retirement-savings-calculator', 'social-security-calculator', '401k-employer-match-calculator', 'annuity-calculator'],
    title: 'Pension Calculator',
    description: 'Estimate a defined-benefit pension from years of service, final average salary and a benefit multiplier — an illustrative formula, since real plans vary widely.',
    example: '30 years of service at a $70,000 final average salary with a 2% multiplier gives an estimated pension of $42,000 a year, about 60% of final salary.',
    breakdown: {
      headline: 'annualPension',
      headlineLabel: 'Estimated annual pension',
      outputs: [
        { id: 'annualPension', label: 'Estimated annual pension', format: 'currency' },
        { id: 'monthlyPension', label: 'Estimated monthly pension', format: 'currency' },
        { id: 'incomeReplacementPercent', label: 'Percent of final salary replaced', format: 'percent' }
      ],
      groups: [
        { title: 'Your pension plan', inputs: ['yearsOfService', 'finalAverageSalary', 'multiplierPercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'finalAverageSalary', label: 'Final average salary' },
          { from: 'annualPension', label: 'Estimated annual pension' }
        ],
        title: 'Pension vs. final salary',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'The three-factor pension formula',
        paragraphs: [
          'Most defined-benefit pensions — the kind that pay a fixed amount for life rather than depending on investment markets — use the same three-factor formula: years of service, multiplied by a "formula multiplier," multiplied by the final average salary. The Wisconsin Legislative Council\'s biennial survey of 87 major U.S. state and local public retirement systems describes this as the standard shape: "Years of Service × Formula Multiplier × Final Average Salary = Retirement Annuity." This calculator applies that same formula directly to whatever years, salary and multiplier you enter.',
          "The multiplier is the one number that varies enormously by plan, and it is what makes a pension estimate impossible to generalize. The same Wisconsin survey found that, for 2017-18, public plans coordinated with Social Security typically used a multiplier between 1.5% and 2.5% per year of service, while plans not coordinated with Social Security — which have to replace more income on their own — typically used a higher 2% to 2.5%. A well-documented federal example is the U.S. government's own FERS basic annuity: the Office of Personnel Management's published formula is 1% of the highest-3-year average salary per year of service, rising to 1.1% for anyone retiring at age 62 or older with at least 20 years of service. This calculator defaults to a round 2% purely as an illustration — it is not any specific plan's real rate, including FERS's own.",
          "\"Final average salary\" is also plan-specific: it is usually the highest-paid 3 to 5 consecutive years, not necessarily the years right before retirement. In the Wisconsin survey, 52% of the 87 plans averaged the highest 5 years and 26% averaged the highest 3. Your plan's own summary describes which years it uses and whether they must be consecutive."
        ]
      },
      howTo: {
        intro: 'Enter your years of service, your plan\'s final average salary figure, and a benefit multiplier.',
        steps: [
          { name: 'Enter years of service', text: 'Total years credited under the plan, including any partial years your plan counts.' },
          { name: 'Enter final average salary', text: 'Use your plan\'s own averaging period — often the highest 3 or 5 consecutive years, not necessarily your most recent salary.' },
          { name: 'Set the multiplier', text: 'Replace the 2% illustration with your plan\'s real formula multiplier from its summary plan description, if you know it.' },
          { name: 'Read the estimate', text: 'The annual and monthly pension appear, with the percent of final salary the pension would replace.' },
          { name: 'Compare multipliers', text: 'Try your plan\'s real multiplier alongside a couple of others — the spread shows how much this one number changes the result.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The pension is years of service multiplied by the formula multiplier (as a decimal) multiplied by the final average salary.',
        expression: 'Annual pension = Years of service × Multiplier × Final average salary\nMonthly pension = Annual pension ÷ 12\nPercent of salary replaced = Annual pension ÷ Final average salary × 100',
        terms: [
          { symbol: 'Years of service', meaning: 'Total years credited under the plan.' },
          { symbol: 'Multiplier', meaning: "The plan's formula multiplier: the percent of final average salary earned as annual pension for each year of service. Typically 1% to 2.5% depending on the plan." },
          { symbol: 'Final average salary', meaning: "The plan's own averaging period — commonly the highest 3 or 5 consecutive years of salary." }
        ],
        note: "Estimates only. Formula multipliers, averaging periods, early-retirement reductions, benefit caps and cost-of-living adjustments vary enormously by plan. This is not an official benefit estimate — check your plan's summary plan description or contact its administrator. Not financial or tax advice."
      },
      workedExample: {
        intro: 'Someone retires with 30 years of service, a $70,000 final average salary, and a plan multiplier of 2%. What pension does the formula estimate?',
        rows: [
          { label: 'Annual pension (30 × 2% × $70,000)', value: '$42,000.00' },
          { label: 'Monthly pension (42,000 ÷ 12)', value: '$3,500.00' },
          { label: 'Percent of final salary replaced (42,000 ÷ 70,000)', value: '60%' }
        ],
        result: 'Estimated pension ≈ $42,000 a year, about $3,500 a month, replacing about 60% of final salary',
        explanation: "The multiplier alone moves this a great deal on the identical 30 years and $70,000 salary: at FERS's 1.1% rate it is $23,100 a year (33% of salary); at 2.5% it is $52,500 a year (75% of salary). Years of service matter just as much — at the same 2% multiplier and salary, 20 years gives $28,000 a year, and 40 years gives $56,000 a year, exactly double the 20-year figure, because the formula is linear in years."
      },
      watchOut: [
        { title: 'This varies enormously by plan', body: "The multiplier, the averaging period, any cap on the maximum benefit, and whether the benefit adjusts for inflation are all set by your specific plan, not by a universal rule. The Wisconsin survey found most of its 87 surveyed plans set no maximum benefit cap, with a cap of 100% of final average salary the next most common choice — plans differ even on whether a cap exists at all." },
        { title: 'Retiring early usually reduces the benefit', body: "Most plans reduce the pension for retiring before the plan's own normal retirement age, commonly by a few percent for each year early, under what plans call an actuarial discount. This calculator does not model that reduction — check your plan's early-retirement provision before assuming today's formula applies at an earlier age." },
        { title: 'Not an official benefit statement', body: 'This is an illustrative formula, not your plan\'s real benefit estimate. Contact your plan administrator or pension fund for an official calculation.' },
        { title: 'Social Security, taxes and other income are not included', body: 'Many coordinated plans are designed to work alongside Social Security, not instead of it. See social-security-calculator for a separate estimate of that benefit.' },
        { title: 'Some plans add a defined-contribution or money-purchase layer', body: 'A number of real plans pay the higher of this formula or a separate account-balance-based benefit, which this calculator does not model.' }
      ],
      references: [
        { label: 'U.S. Office of Personnel Management, FERS Information: Computation', url: 'https://www.opm.gov/retirement-center/fers-information/computation/' },
        { label: 'Wisconsin Legislative Council, 2017-18 Comparative Study of Major Public Employee Retirement Systems, Part IV', url: 'https://www.nasra.org/files/Topical%20Reports/Plan%20Design/2018_retirement.pdf' }
      ]
    },
    inputs: [
      { id: 'yearsOfService', label: 'Years of service', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 0 },
      { id: 'finalAverageSalary', label: 'Final average salary', type: 'currency', placeholder: '70000', defaultValue: 70000, step: 1000, min: 0 },
      { id: 'multiplierPercent', label: 'Benefit multiplier', type: 'percent', placeholder: '2', defaultValue: 2, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Pension Calculator – Estimate a Defined-Benefit Pension',
      description: 'Estimate a defined-benefit pension from years of service, final average salary and a benefit multiplier. Illustrative only — real plans vary widely.',
      faq: [
        { question: 'How is a pension calculated?', answer: 'Multiply years of service by the plan\'s formula multiplier (as a decimal) by the final average salary. 30 years at a 2% multiplier and a $70,000 final average salary gives $42,000 a year.' },
        { question: 'What multiplier should I use?', answer: "Use your own plan's published multiplier if you know it — they commonly run 1% to 2.5% per year of service. The U.S. federal FERS plan, for example, uses 1%, or 1.1% for anyone retiring at 62 or older with 20+ years of service." },
        { question: 'What counts as "final average salary"?', answer: "Whatever averaging period your plan defines — commonly the highest 3 or 5 consecutive years of salary, not necessarily your most recent pay. A 2017-18 survey of 87 public plans found 52% used a 5-year average and 26% used a 3-year average." },
        { question: 'Does this include Social Security?', answer: 'No. A pension and a Social Security benefit are calculated separately and, for many public employees, received together. See social-security-calculator for a separate benefit estimate.' },
        { question: 'How does retiring early affect the pension?', answer: "Most plans reduce the benefit for retiring before the plan's normal retirement age, often by a few percent for each year early. This calculator does not model that reduction, so an early-retirement estimate from it alone can overstate the real benefit." },
        { question: 'Is this an official benefit estimate?', answer: "No. It is an illustrative three-factor formula, not a substitute for your plan's own benefit calculation. Contact your plan administrator for an official figure." }
      ]
    },
    compute(values) {
      const annualPension = values.yearsOfService * (values.multiplierPercent / 100) * values.finalAverageSalary;
      const monthlyPension = annualPension / 12;
      const incomeReplacementPercent = values.finalAverageSalary > 0 ? (annualPension / values.finalAverageSalary) * 100 : NaN;
      return { annualPension, monthlyPension, incomeReplacementPercent };
    }
  },
  {
    id: 'social-security-calculator',
    group: 'Retirement',
    category: 'finance',
    glyph: 'SS',
    updatedAt: '2026-11-16',
    aliases: ['social security calculator', 'social security benefit calculator', 'ssa benefit estimator', 'pia calculator', 'aime calculator'],
    related: ['pension-calculator', 'retirement-savings-calculator', 'traditional-ira-calculator', 'annuity-calculator'],
    title: 'Social Security Calculator',
    description: "Estimate a Social Security retirement benefit from your average indexed monthly earnings (AIME), using the SSA's own 2026 bend-point formula. An estimate only — not an official benefit statement.",
    example: 'A $6,500 average indexed monthly earnings (AIME) gives an estimated monthly benefit (PIA) of $2,825.80 — about $33,910 a year, using the Social Security Administration\'s 2026 bend points of $1,286 and $7,749.',
    breakdown: {
      headline: 'pia',
      headlineLabel: 'Estimated monthly benefit (PIA)',
      outputs: [
        { id: 'pia', label: 'Estimated monthly benefit (PIA)', format: 'currency' },
        { id: 'annualBenefit', label: 'Estimated annual benefit', format: 'currency' },
        { id: 'replacementPercent', label: 'Percent of AIME replaced', format: 'percent' }
      ],
      groups: [
        { title: 'Your earnings', inputs: ['averageIndexedMonthlyEarnings'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'averageIndexedMonthlyEarnings', label: 'Average indexed monthly earnings (AIME)' },
          { from: 'pia', label: 'Estimated monthly benefit (PIA)' }
        ],
        title: 'AIME vs. estimated benefit',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'AIME, bend points and the PIA formula',
        paragraphs: [
          "Social Security's retirement benefit is built from two numbers. The first is your average indexed monthly earnings (AIME): the Social Security Administration takes your highest 35 years of earnings, adjusts each year's earnings for wage growth since then, adds them up, and divides by 420 months (35 years). The second is the primary insurance amount (PIA) — your benefit at full retirement age — which the SSA computes from your AIME using a formula with two \"bend points\" that split your AIME into three bands, each paid at a different percentage.",
          "Under the Social Security Administration's notice for 2026 (published in the Federal Register, 90 FR 49047), the bend points for a worker who first becomes eligible for benefits in 2026 are $1,286 and $7,749. The PIA is 90% of AIME up to $1,286, plus 32% of AIME between $1,286 and $7,749, plus 15% of any AIME above $7,749, rounded down to the next lower $0.10. The bend points themselves change every year, since the SSA indexes them to the national average wage index — a bend point for a different year will give a different estimate for someone who becomes eligible that year.",
          "This calculator skips the 35-year earnings-indexing step and asks for your AIME directly — either the figure from your own \"my Social Security\" statement at ssa.gov, or a rough stand-in such as your current average monthly earnings. It also shows only the PIA at full retirement age: it does not model the real reduction for claiming as early as 62 or the real increase for delaying up to 70, which are a different, separate adjustment on top of the PIA. For a defined-benefit pension estimate instead of Social Security, see pension-calculator."
        ]
      },
      howTo: {
        intro: 'Enter your average indexed monthly earnings (AIME) — from your ssa.gov statement if you have it, or a rough estimate otherwise.',
        steps: [
          { name: 'Find or estimate your AIME', text: 'Your "my Social Security" statement at ssa.gov shows your real AIME. Without it, your current average monthly earnings is a rough stand-in.' },
          { name: 'Enter the AIME', text: 'Type it into the one input field.' },
          { name: 'Read the estimated benefit', text: 'The estimated monthly benefit (PIA) at full retirement age appears, with the annual figure and the percent of AIME it replaces.' },
          { name: 'Remember what this leaves out', text: 'Claiming before full retirement age reduces the real benefit; claiming after it (up to age 70) increases it. This estimate is the PIA only, before either adjustment.' },
          { name: 'Confirm with SSA', text: "For your actual benefit at your actual claiming age, use SSA's own calculators and statement at ssa.gov." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "The PIA sums three percentages of AIME, split at the SSA's 2026 bend points of $1,286 and $7,749.",
        expression: 'PIA = 90% × min(AIME, $1,286) + 32% × (portion of AIME between $1,286 and $7,749) + 15% × (portion of AIME above $7,749)\nPIA is then rounded down to the next lower $0.10\nAnnual benefit = PIA × 12',
        terms: [
          { symbol: 'AIME', meaning: "Average indexed monthly earnings — the highest 35 years of wage-indexed earnings, divided by 420 months." },
          { symbol: 'Bend points', meaning: "$1,286 and $7,749 for 2026, published by the SSA and adjusted every year for wage growth." }
        ],
        note: "Estimates only, not an official Social Security benefit statement. This models the standard PIA formula for someone who first becomes eligible for retirement benefits in 2026, at full retirement age. It does not model claiming age adjustments, spousal or survivor benefits, the earnings test, the Windfall Elimination Provision, or taxation of benefits. Create or check your account at ssa.gov for your real figure."
      },
      workedExample: {
        intro: 'Someone has a $6,500 average indexed monthly earnings (AIME). What is their estimated monthly benefit at full retirement age?',
        rows: [
          { label: 'First $1,286 of AIME × 90%', value: '$1,157.40' },
          { label: 'Next $5,214 of AIME ($6,500 − $1,286) × 32%', value: '$1,668.48' },
          { label: 'Amount above $7,749 (none, AIME is below the second bend point)', value: '$0.00' },
          { label: 'Raw PIA (1,157.40 + 1,668.48)', value: '$2,825.88' },
          { label: 'PIA rounded down to the next lower $0.10', value: '$2,825.80' },
          { label: 'Annual benefit (2,825.80 × 12)', value: '$33,909.60' }
        ],
        result: 'Estimated monthly benefit (PIA) ≈ $2,825.80, about $33,910 a year, replacing about 43.5% of the $6,500 AIME',
        explanation: "A higher earner with a $10,000 AIME crosses the second bend point: their PIA works out to $3,563.20 a month — about 26.1% more than the $6,500 example, even though that AIME itself is 53.8% higher. Each dollar of AIME above the bend points adds only 15 cents to the benefit, versus 90 cents below the first bend point, which is why Social Security replaces a larger share of a lower earner's pay than a higher earner's."
      },
      watchOut: [
        { title: 'Not an official benefit statement', body: 'This is a simplified estimate from a single AIME figure you provide. Your real benefit comes from your actual 35-year earnings record — check it at ssa.gov.' },
        { title: 'Claiming age changes the real benefit a great deal', body: 'This shows the PIA at full retirement age only. Claiming as early as 62 permanently reduces it; delaying past full retirement age, up to 70, increases it through delayed retirement credits. Neither adjustment is modeled here.' },
        { title: "The bend points change every year", body: "$1,286 and $7,749 are the SSA's 2026 figures, indexed to the national average wage index. A worker who becomes eligible in a different year uses that year's own bend points, not these." },
        { title: 'Entering your salary is not the same as your real AIME', body: "Your real AIME indexes 35 years of earnings for wage growth and divides by 420 months. A single current salary, used as a stand-in, will usually differ from your actual AIME." },
        { title: 'Other adjustments are not modeled', body: 'Spousal and survivor benefits, the retirement earnings test, the Windfall Elimination Provision for some public pensions, and federal taxation of benefits can all change what you actually receive.' }
      ],
      references: [
        { label: 'Social Security Administration, "Cost-of-Living Increase and Other Determinations for 2026," Federal Register 90 FR 49047 (Nov. 3, 2025)', url: 'https://www.federalregister.gov/documents/2025/11/03/2025-19763/cost-of-living-increase-and-other-determinations-for-2026' },
        { label: 'Social Security Administration, your official benefit estimate (my Social Security account)', url: 'https://www.ssa.gov/myaccount/' }
      ]
    },
    inputs: [
      { id: 'averageIndexedMonthlyEarnings', label: 'Average indexed monthly earnings (AIME)', type: 'currency', placeholder: '6500', defaultValue: 6500, step: 100, min: 0 }
    ],
    seo: {
      title: 'Social Security Calculator – Estimate Your PIA',
      description: "Estimate your Social Security retirement benefit (PIA) from your AIME using the SSA's 2026 bend points. An estimate only — see ssa.gov for your official figure.",
      faq: [
        { question: 'How is my Social Security benefit calculated?', answer: 'The SSA applies 90% to the first $1,286 of your AIME, 32% to the portion between $1,286 and $7,749, and 15% above $7,749, then rounds down to the nearest $0.10. A $6,500 AIME gives a $2,825.80 monthly PIA.' },
        { question: 'What is AIME?', answer: 'Average indexed monthly earnings: your highest 35 years of earnings, each adjusted for wage growth since that year, added up and divided by 420 months. This calculator asks for your AIME directly rather than computing it from a full earnings history.' },
        { question: 'What are the Social Security "bend points"?', answer: 'The two dollar thresholds that split AIME into three bands paid at 90%, 32% and 15%. For 2026 they are $1,286 and $7,749, published by the SSA and adjusted every year for wage growth.' },
        { question: 'Does this account for claiming early or late?', answer: "No. This is the primary insurance amount (PIA) at full retirement age only. Claiming as early as 62 reduces it permanently; delaying past full retirement age, up to 70, increases it through delayed retirement credits." },
        { question: "Why doesn't a much higher AIME give a proportionally higher benefit?", answer: "Because of the bend points: a $10,000 AIME (53.8% higher than $6,500) produces a PIA only 26.1% higher ($3,563.20 vs. $2,825.80), since AIME above the bend points is credited at just 15%, not 90%. Social Security replaces a larger share of a lower earner's pay." },
        { question: 'Is this an official Social Security estimate?', answer: 'No. For your real, official estimate based on your actual earnings record, create or check your account at ssa.gov.' }
      ]
    },
    compute(values) {
      const bend1 = 1286;
      const bend2 = 7749;
      const aime = values.averageIndexedMonthlyEarnings;
      const firstPortion = Math.min(aime, bend1);
      const secondPortion = Math.max(0, Math.min(aime, bend2) - bend1);
      const thirdPortion = Math.max(0, aime - bend2);
      const rawPia = 0.9 * firstPortion + 0.32 * secondPortion + 0.15 * thirdPortion;
      const pia = Math.floor(rawPia * 10) / 10;
      const annualBenefit = pia * 12;
      const replacementPercent = aime > 0 ? (pia / aime) * 100 : NaN;
      return { pia, annualBenefit, replacementPercent };
    }
  },
  {
    id: 'annuity-calculator',
    group: 'Savings & Growth',
    category: 'finance',
    glyph: 'Ann',
    updatedAt: '2026-11-16',
    aliases: ['annuity calculator', 'fixed annuity calculator', 'future value of annuity calculator', 'annuity future value calculator', 'annuity growth calculator'],
    related: ['annuity-payout-calculator', 'investment-calculator', 'compound-interest-calculator', 'retirement-savings-calculator'],
    title: 'Annuity Calculator',
    description: 'Project the future value of a fixed annuity — a series of equal payments earning a fixed rate — from the payment, rate and term. A payment stream, not a lump sum.',
    example: '$300 a month for 20 years at an average 5% annual rate grows to about $123,310, of which about $51,310 is interest.',
    solver: {
      defaultTarget: 'futureValue',
      variables: [
        { id: 'futureValue', label: 'Future value', symbol: 'FV', dimension: 'currency', defaultValue: 123310.1, defaultUnit: 'currency' },
        { id: 'payment', label: 'Payment per month', symbol: 'C', dimension: 'currency', defaultValue: 300, defaultUnit: 'currency', fixed: true },
        { id: 'years', label: 'Term', symbol: 't', dimension: 'term', defaultValue: 20, defaultUnit: 'yr', bounds: [0, 1200] },
        { id: 'annualRate', label: 'Annual rate', symbol: 'r', dimension: 'percent', defaultValue: 5, defaultUnit: '%', bounds: [0, 100] }
      ],
      // `years` arrives in months (the term dimension's base); this is a pure payment stream, with
      // no initial lump sum — unlike compound-interest-calculator, which compounds a lump sum.
      solve: {
        futureValue: ({ payment, years, annualRate }) => (years >= 0 ? payment * annuityFactor(annualRate, 12, years) : NaN),
        payment: ({ futureValue, years, annualRate }) => {
          const af = annuityFactor(annualRate, 12, years);
          return years > 0 && af > 0 ? futureValue / af : NaN;
        },
        years: ({ futureValue, payment, annualRate }) => {
          if (!(payment > 0)) return NaN;
          const i = annualRate / 100 / 12;
          if (i === 0) return futureValue / payment;
          const x = (futureValue * i) / payment + 1;
          if (!(x > 0)) return NaN;
          const n = Math.log(x) / Math.log(1 + i);
          return n >= 0 ? n : NaN;
        }
      },
      // The rate has no closed form: the widget finds it numerically.
      equation: (si) => si.futureValue - si.payment * annuityFactor(si.annualRate, 12, si.years),
      outputs: [
        { id: 'totalContributed', label: 'Total paid in', dimension: 'currency', compute: (si) => si.payment * si.years },
        { id: 'totalGrowth', label: 'Interest earned', dimension: 'currency', compute: (si) => si.futureValue - si.payment * si.years }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [{ from: 'totalContributed', label: 'Total paid in' }, { from: 'totalGrowth', label: 'Interest earned' }],
          center: 'futureValue',
          centerSub: 'future value'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'A payment stream, not a lump sum',
        paragraphs: [
          'An annuity is a series of equal, regular payments. A fixed annuity earns a set interest rate on whatever has built up so far, so each payment starts compounding from the moment it is made rather than all starting together. That makes its future value the sum of every payment\'s own growth — a genuinely different calculation from compound-interest-calculator, which grows a single lump sum you already have. If you are projecting a lump sum you already hold, use compound-interest-calculator instead; this page is for a regular payment with nothing upfront.',
          'FINRA describes a deferred fixed annuity as one where "the insurance company agrees to pay you no less than a specified rate of interest during the time that your account is growing" — the accumulation phase this calculator models. Once the contract is annuitized, the insurer instead "pays you a predetermined fixed amount of money, usually on a monthly basis" — the payout phase, modeled separately by annuity-payout-calculator.',
          'The math itself is the same annuity formula used throughout this site\'s savings calculators (investment-calculator, retirement-savings-calculator), just without any starting lump sum: this page is the pure-payment-stream case.'
        ]
      },
      howTo: {
        intro: 'Enter the monthly payment (always an input), then any two of the other three fields. The third, marked auto, is calculated.',
        steps: [
          { name: 'Enter the monthly payment', text: 'This is always an input. For an annual payment, divide it by 12 first.' },
          { name: 'Project the future value', text: 'Type the rate and the term. The future value appears with the total paid in and the interest earned broken out.' },
          { name: 'Plan backward from a goal', text: 'Type a target future value. Leave the term alone to see how long it takes at a given rate.' },
          { name: 'Find the rate you need', text: 'Fill in the goal, the payment and the term so the rate is the field left alone longest, and the calculator searches for it.' },
          { name: 'Compare a few rates', text: 'Fixed-annuity credited rates are not guaranteed beyond any minimum stated in the contract — run a cautious and an optimistic rate side by side.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'With monthly payments and monthly compounding, the future value sums a growing series of equal payments made at the end of each month — an ordinary annuity.',
        expression: 'FV = C × ((1 + i)^n − 1) ÷ i, where i = annual rate ÷ 12\nTotal paid in = C × n',
        terms: [
          { symbol: 'FV', meaning: 'Projected future value.' },
          { symbol: 'C', meaning: 'Payment made at the end of each month.' },
          { symbol: 'i', meaning: 'Monthly rate: the annual rate ÷ 12, as a decimal.' },
          { symbol: 'n', meaning: 'Number of monthly payments.' }
        ],
        note: 'Estimates only. A real fixed annuity\'s credited rate can change over time (subject to any contract minimum), and surrender charges or fees may apply. This is not investment or insurance advice.'
      },
      workedExample: {
        intro: 'You pay $300 a month into a fixed annuity for 20 years at an average 5% annual rate. What is it worth at the end?',
        rows: [
          { label: 'Monthly rate (5% ÷ 12)', value: '0.4167%' },
          { label: 'Annuity factor ((1.0041667)^240 − 1) ÷ 0.0041667', value: '411.033669' },
          { label: 'Future value (300 × 411.033669)', value: '$123,310.10' },
          { label: 'Total paid in (300 × 240)', value: '$72,000.00' },
          { label: 'Interest earned (123,310.10 − 72,000)', value: '$51,310.10' }
        ],
        result: 'FV ≈ $123,310 after 20 years, of which about $51,310 is interest',
        explanation: 'The same $300 a month at 5% is worth only about $46,585 after 10 years — the 20-year total is 164.7% higher, not merely double, because later payments compound on an already-larger balance. At 7% the 20-year total would be about $156,278, and at 3% about $98,491, so the assumed rate matters a great deal.'
      },
      watchOut: [
        { title: 'A payment stream, not a lump sum', body: 'If you already have the full amount in hand today, use compound-interest-calculator instead — this page assumes nothing upfront, only regular payments.' },
        { title: 'This models the accumulation phase only', body: 'Once a fixed annuity is annuitized, it switches to paying income out instead of growing. See annuity-payout-calculator for that payout phase.' },
        { title: 'Credited rates are not guaranteed beyond any contract minimum', body: 'An insurer can change the rate it credits year to year, subject to whatever minimum the contract states. A constant rate here is a planning assumption.' },
        { title: 'Fees and surrender charges are not modeled', body: 'Many annuity contracts charge fees or a surrender charge for withdrawing early, which would reduce the real future value below this estimate.' }
      ],
      references: [
        { label: 'FINRA, Annuities', url: 'https://www.finra.org/investors/investing/investment-products/annuities' },
        { label: 'OpenStax, Contemporary Mathematics, §6.7 Investments', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-7-investments' }
      ]
    },
    inputs: [
      { id: 'payment', label: 'Monthly payment', type: 'currency', placeholder: '300', defaultValue: 300, step: 25, min: 0 },
      { id: 'annualRate', label: 'Annual rate', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.1, min: 0 },
      { id: 'years', label: 'Term (years)', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 }
    ],
    seo: {
      title: 'Annuity Calculator – Future Value of Fixed Payments',
      description: 'Free annuity calculator: project the future value of a fixed annuity from the monthly payment, rate and term, or find the rate or term a goal needs.',
      faq: [
        { question: 'How do I calculate an annuity\'s future value?', answer: 'Sum the growing series of payments with FV = C × ((1 + i)^n − 1) ÷ i, where i is the monthly rate and n the number of payments. $300 a month at 5% for 20 years comes to about $123,310.' },
        { question: 'How is this different from the compound interest calculator?', answer: 'Compound-interest-calculator grows a lump sum you already have. This calculator has no lump sum — it is a stream of equal payments, each starting to earn interest from the day it is made.' },
        { question: 'How long will it take to reach my goal?', answer: 'Enter the goal as the future value and the calculator works out the term. At $300 a month and 5%, reaching $100,000 takes about 17.4 years.' },
        { question: 'What rate do I need?', answer: 'Fill in the goal, the payment and the term, leaving the rate as the field solved for, and the calculator searches for the rate numerically.' },
        { question: 'What is the difference between an annuity and an annuity payout?', answer: 'This calculator models the accumulation phase, when payments build up a balance. annuity-payout-calculator models the reverse: a lump sum you already have, paying income out over time.' },
        { question: 'Is the rate on a fixed annuity guaranteed?', answer: "Only up to whatever minimum rate the insurance contract states. FINRA notes the insurer \"agrees to pay you no less than a specified rate of interest,\" but the actual credited rate can be higher and can change over time." }
      ]
    },
    compute(values) {
      const months = Math.max(1, values.years * 12);
      const futureValue = values.payment * annuityFactor(values.annualRate, 12, months);
      const totalContributed = values.payment * months;
      const totalGrowth = futureValue - totalContributed;
      return { futureValue, totalContributed, totalGrowth };
    }
  },
];
