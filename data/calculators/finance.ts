import type { CalculatorConfig } from './types.ts';
import { monthlyPayment } from '../../lib/amortization.ts';

// Amortized loans (loan, mortgage, EMI). Terms are in months; `apr` is the percent number (6 = 6%).
// Each returns NaN when there is no answer.
const loanPayment = (principal: number, months: number, apr: number) =>
  principal >= 0 ? monthlyPayment(principal, apr, months) : NaN;

const loanPrincipal = (payment: number, months: number, apr: number) => {
  const r = apr / 100 / 12;
  if (!(months > 0) || !(payment >= 0)) return NaN;
  return r === 0 ? payment * months : (payment * (1 - (1 + r) ** -months)) / r;
};

// n = −ln(1 − P·r ÷ M) ÷ ln(1 + r). No answer when the payment does not cover the first month's interest.
const loanMonths = (principal: number, payment: number, apr: number) => {
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

export const financeCalculators: CalculatorConfig[] = [
  {
    id: 'mortgage-calculator',
    category: 'finance',
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
    category: 'finance',
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
    category: 'finance',
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
    category: 'finance',
    updatedAt: '2026-09-10',
    aliases: ['take home pay calculator', 'net salary calculator', 'after tax pay calculator', 'salary paycheck estimator'],
    related: ['salary-raise-calculator', 'work-hours-calculator', 'freelancer-rate-calculator', 'pto-calculator'],
    title: 'Paycheck Calculator',
    description: 'Estimate your US net take-home pay with full 2025 deduction support — 401(k), HSA, FSA, dependent care, commuter benefits, health premiums, Roth 401(k), and more.',
    example: 'Calculate take-home pay for a $60,000 annual salary paid bi-weekly with 401(k) and health insurance deductions.',
    inputs: [
      { id: 'annualSalary', label: 'Annual salary', type: 'currency', placeholder: '60000', defaultValue: 60000, step: 1000, min: 0 },
      { id: 'payPeriodsPerYear', label: 'Pay periods per year (bi-weekly = 26, monthly = 12)', type: 'number', placeholder: '26', defaultValue: 26, step: 1, min: 1 },
      { id: 'federalTaxRate', label: 'Federal tax rate', type: 'percent', placeholder: '22', defaultValue: 22, step: 0.5, min: 0 },
      { id: 'stateTaxRate', label: 'State tax rate', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.1, min: 0 },
      { id: 'otherDeductions', label: 'Other deductions per period (401k, health, etc.)', type: 'currency', placeholder: '200', defaultValue: 200, step: 10, min: 0 }
    ],
    seo: {
      title: 'Paycheck Calculator – 2025 US Deductions',
      description: 'Calculate your exact net take-home pay with 2025 IRS tax brackets, Social Security, Medicare, 401(k), HSA, FSA, dependent care, commuter benefits, and health insurance.',
      faq: [
        { question: 'How is federal income tax calculated?', answer: 'Federal tax uses the 2025 IRS marginal bracket rates (10%–37%) applied to your taxable income after the standard deduction and pre-tax deductions like 401(k) and HSA.' },
        { question: 'What pre-tax deductions reduce my taxes?', answer: 'Traditional 401(k), HSA, Health Care FSA, Dependent Care FSA, commuter benefits, and employer health/dental/vision premiums all reduce your federal and state taxable income.' },
        { question: 'What is the difference between pre-tax and post-tax deductions?', answer: 'Pre-tax deductions (401k, HSA, FSA) lower your taxable income before taxes are calculated. Post-tax deductions (Roth 401k, life insurance) come out after all taxes are applied.' },
        { question: 'What are the 2025 contribution limits?', answer: 'Traditional 401(k): $23,500 · HSA individual: $4,300, family: $8,550 · Health Care FSA: $3,300 · Dependent Care FSA: $5,000 · Commuter benefit: $325/month.' },
        { question: 'Does this include Social Security and Medicare?', answer: 'Yes. Social Security is 6.2% up to the $176,100 wage base. Medicare is 1.45% on all wages, plus an additional 0.9% on wages above $200,000 (single) or $250,000 (married filing jointly).' }
      ]
    },
    compute(values) {
      const grossPerPeriod = values.annualSalary / values.payPeriodsPerYear;
      const federalTax = grossPerPeriod * (values.federalTaxRate / 100);
      const stateTax = grossPerPeriod * (values.stateTaxRate / 100);
      const netPay = grossPerPeriod - federalTax - stateTax - values.otherDeductions;
      const annualNetPay = netPay * values.payPeriodsPerYear;
      return { grossPerPeriod, federalTax, stateTax, netPay, annualNetPay };
    }
  },
  {
    id: 'investment-calculator',
    category: 'finance',
    updatedAt: '2026-10-19',
    aliases: ['sip calculator', 'return on investment calculator', 'roi calculator', 'portfolio growth calculator', 'retirement savings calculator'],
    related: ['compound-interest-calculator', 'inflation-calculator', 'paycheck-calculator', 'currency-converter'],
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
          'Regular contributions often matter as much as the starting amount. Adding a fixed amount every year, whatever the market is doing, is a simple discipline, and those deposits compound too. This calculator adds your yearly contribution at the end of each year.'
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
    category: 'finance',
    updatedAt: '2026-09-10',
    aliases: ['extra payment calculator', 'early payoff calculator', 'mortgage payoff calculator', 'interest saved calculator'],
    related: ['mortgage-calculator', 'loan-calculator', 'emi-calculator', 'compound-interest-calculator'],
    title: 'Loan Prepayment Calculator',
    description: 'See how extra payments reduce your loan payoff time and total interest. Works for mortgages, auto loans, personal loans, and student loans — all of which allow prepayment in the US.',
    example: 'Pay an extra $200/month on a $20,000 auto loan at 6% APR and see how much faster it is paid off.',
    inputs: [
      { id: 'loanAmount', label: 'Original loan amount', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 100, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.01, min: 0 },
      { id: 'years', label: 'Original loan term (years)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 },
      { id: 'extraPayment', label: 'Extra monthly payment', type: 'currency', placeholder: '200', defaultValue: 200, step: 25, min: 0 }
    ],
    seo: {
      title: 'Loan Prepayment Calculator – Save on Interest',
      description: 'Calculate interest savings and time saved by making extra loan payments. Works for US mortgages, auto loans, personal loans, and student loans.',
      faq: [
        { question: 'Which US loans allow prepayment without penalty?', answer: 'Federal student loans, most auto loans, and most personal loans have no prepayment penalty. Many mortgages also allow it, but check your note for a prepayment penalty clause common in the first 3–5 years on some products.' },
        { question: 'How much interest can extra payments save?', answer: 'Even $50–$100 extra per month on a 30-year mortgage can save tens of thousands of dollars and shave years off the term.' },
        { question: 'Does the extra payment apply to principal?', answer: 'When you make a payment, interest is calculated first on the outstanding balance, and any remainder reduces principal. Always mark extra payments as apply to principal with your lender.' }
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
    category: 'finance',
    updatedAt: '2026-09-10',
    aliases: ['purchasing power calculator', 'cost of living calculator', 'value of money over time calculator', 'price increase calculator'],
    related: ['compound-interest-calculator', 'investment-calculator', 'salary-raise-calculator', 'electricity-bill-calculator'],
    title: 'Inflation Calculator',
    description: 'Find the future value of money accounting for inflation, or compare purchasing power across years.',
    example: 'See what $10,000 is worth in 10 years with 3% annual inflation.',
    inputs: [
      { id: 'amount', label: 'Starting amount', type: 'currency', placeholder: '10000', defaultValue: 10000, step: 100, min: 0 },
      { id: 'inflationRate', label: 'Annual inflation rate', type: 'percent', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'years', label: 'Years', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 }
    ],
    seo: {
      title: 'Inflation Calculator – Purchasing Power Over Time',
      description: 'Calculate how inflation erodes purchasing power over time. Enter a starting amount, inflation rate, and number of years to see what today\'s dollars will be worth in the future.',
      faq: [
        { question: 'What is the average US inflation rate?', answer: 'The Federal Reserve targets 2% annual inflation. The long-term US average is approximately 3.3% since 1914.' },
        { question: 'What is the Rule of 72 for inflation?', answer: 'Divide 72 by the inflation rate to estimate how many years it takes for prices to double. At 3%, prices double roughly every 24 years.' }
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
    category: 'finance',
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
  }
];
