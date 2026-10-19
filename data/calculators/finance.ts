import type { CalculatorConfig } from './types.ts';

export const financeCalculators: CalculatorConfig[] = [
  {
    id: 'mortgage-calculator',
    category: 'finance',
    updatedAt: '2026-09-10',
    aliases: ['home loan calculator', 'house payment calculator', 'mortgage payment calculator', 'home loan emi calculator', 'house loan emi calculator', 'monthly mortgage estimator'],
    related: ['loan-calculator', 'emi-calculator', 'loan-prepayment-calculator', 'car-payment-calculator'],
    redirectFrom: ['home-loan-calculator', 'house-loan-emi-calculator'],
    title: 'Mortgage Calculator',
    description: 'Estimate monthly mortgage payments for home loans with APR and term options.',
    example: 'Calculate a 30-year mortgage payment for a $350,000 home with 5% APR and 20% down payment.',
    inputs: [
      { id: 'loanAmount', label: 'Loan amount', type: 'currency', placeholder: '350000', defaultValue: 350000, step: 1000, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.01, min: 0 },
      { id: 'years', label: 'Loan term (years)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '70000', defaultValue: 70000, step: 500, min: 0 }
    ],
    seo: {
      title: 'Mortgage Calculator',
      description: 'Calculate monthly mortgage payments for home loans using your loan amount, APR, term, and down payment. See the total interest, total cost, and remaining loan principal.',
      faq: [
        { question: 'How do I calculate my mortgage payment?', answer: 'Enter your loan amount, APR, loan term, and down payment to estimate the monthly payment for your loan.' },
        { question: 'Does this calculator use standard loan conventions?', answer: 'Yes. It uses annual percentage rate (APR) and common mortgage terms like 15 or 30 years.' }
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
    updatedAt: '2026-09-10',
    aliases: ['personal loan calculator', 'monthly payment calculator', 'loan repayment calculator', 'installment calculator', 'borrowing cost calculator'],
    related: ['mortgage-calculator', 'emi-calculator', 'car-payment-calculator', 'loan-prepayment-calculator'],
    title: 'Loan Calculator',
    description: 'Compare monthly payments across loan amounts, APR, and repayment periods.',
    example: 'Estimate payments for a $20,000 loan at 6% APR over 5 years.',
    inputs: [
      { id: 'loanAmount', label: 'Loan amount', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 100, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.01, min: 0 },
      { id: 'years', label: 'Loan term (years)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 }
    ],
    seo: {
      title: 'Loan Calculator',
      description: 'Estimate monthly payments for personal, auto, or other fixed-rate loans. Enter the loan amount, APR, and term to compare payment schedules and total interest costs.',
      faq: [
        { question: 'How do I estimate loan payments?', answer: 'Enter the loan amount, APR, and loan term to calculate the monthly payment.' },
        { question: 'Can I use this for personal or auto loans?', answer: 'Yes, it works for any fixed-rate loan with the values you provide.' }
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
    updatedAt: '2026-09-10',
    aliases: ['interest growth calculator', 'savings growth calculator', 'future value calculator', 'compounding calculator'],
    related: ['investment-calculator', 'inflation-calculator', 'loan-prepayment-calculator', 'salary-raise-calculator'],
    title: 'Compound Interest Calculator',
    description: 'Estimate future savings with compound interest and optional monthly contributions.',
    example: 'See how $5,000 grows at 4% APR with $200 monthly contributions over 10 years.',
    inputs: [
      { id: 'principal', label: 'Starting balance', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 100, min: 0 },
      { id: 'annualRate', label: 'Annual interest rate', type: 'percent', placeholder: '4', defaultValue: 4, step: 0.01, min: 0 },
      { id: 'years', label: 'Years invested', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'monthlyContribution', label: 'Monthly contribution', type: 'currency', placeholder: '200', defaultValue: 200, step: 10, min: 0 }
    ],
    seo: {
      title: 'Compound Interest Calculator',
      description: 'Project how compound interest grows your savings over time. Enter a starting balance, annual rate, years invested, and optional monthly contributions for a future value estimate.',
      faq: [
        { question: 'What is compound interest?', answer: 'Compound interest is interest earned on both the original principal and accumulated interest.' },
        { question: 'Can I model monthly contributions?', answer: 'Yes, add a monthly contribution amount to see how your balance grows over time.' }
      ]
    },
    compute(values) {
      const monthlyRate = values.annualRate / 100 / 12;
      const months = Math.max(0, values.years * 12);
      const compoundPrincipal = values.principal * Math.pow(1 + monthlyRate, months);
      const contributionTotal = values.monthlyContribution * months;
      const futureValue = values.monthlyContribution === 0
        ? compoundPrincipal
        : compoundPrincipal + values.monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
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
    updatedAt: '2026-09-10',
    aliases: ['sip calculator', 'return on investment calculator', 'roi calculator', 'portfolio growth calculator', 'retirement savings calculator'],
    related: ['compound-interest-calculator', 'inflation-calculator', 'paycheck-calculator', 'currency-converter'],
    title: 'Investment Calculator',
    description: 'Project investment growth with an initial amount, annual return, and time horizon.',
    example: 'See how a $10,000 investment grows at 7% annual return over 20 years.',
    inputs: [
      { id: 'initialInvestment', label: 'Initial investment', type: 'currency', placeholder: '10000', defaultValue: 10000, step: 500, min: 0 },
      { id: 'annualReturn', label: 'Annual return rate', type: 'percent', placeholder: '7', defaultValue: 7, step: 0.1, min: 0 },
      { id: 'years', label: 'Years invested', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 },
      { id: 'annualContribution', label: 'Annual contribution', type: 'currency', placeholder: '1200', defaultValue: 1200, step: 100, min: 0 }
    ],
    seo: {
      title: 'Investment Calculator',
      description: 'Project the future value of your investment using initial amount, annual return, and optional yearly contributions.',
      faq: [
        { question: 'How do I calculate investment growth?', answer: 'Enter your starting amount, expected annual return, investment duration, and any yearly contributions to see projected growth.' },
        { question: 'Does this account for annual contributions?', answer: 'Yes, add a yearly contribution amount to model consistent investing over time.' }
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
    updatedAt: '2026-09-10',
    aliases: ['equated monthly installment calculator', 'loan emi calculator', 'house loan emi calculator', 'monthly installment calculator', 'bank emi calculator'],
    related: ['loan-calculator', 'mortgage-calculator', 'car-payment-calculator', 'loan-prepayment-calculator'],
    title: 'EMI Calculator',
    description: 'Calculate monthly EMI (Equated Monthly Installment) for US retail financing, buy-now-pay-later, or personal loans used for purchases.',
    example: 'Calculate monthly payments for a $1,500 laptop financed at 18% APR over 12 months.',
    inputs: [
      { id: 'loanAmount', label: 'Purchase / loan amount', type: 'currency', placeholder: '1500', defaultValue: 1500, step: 50, min: 0 },
      { id: 'annualRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '18', defaultValue: 18, step: 0.25, min: 0 },
      { id: 'months', label: 'Loan term (months)', type: 'number', placeholder: '12', defaultValue: 12, step: 1, min: 1 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '0', defaultValue: 0, step: 50, min: 0 }
    ],
    seo: {
      title: 'EMI Calculator – US Retail Financing and Buy Now Pay Later',
      description: 'Calculate monthly installment payments for retail financing, store credit, or personal loans. Shows total interest and true APR cost.',
      faq: [
        { question: 'What APR do US retailers typically charge?', answer: 'Store credit cards often charge 25–30% APR. BNPL services may be 0% promotional for 6–18 months, reverting to 20–30% after. Personal loans range from 6–36% depending on credit score.' },
        { question: 'What is deferred interest?', answer: 'Some US store cards offer 0% promotional financing but charge retroactive interest if the balance is not paid in full by the end of the promo period. This is different from a true 0% loan.' },
        { question: 'How do I compare financing offers?', answer: 'Always compare APR, not monthly payment. A lower monthly payment with a longer term often costs more in total interest.' }
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
