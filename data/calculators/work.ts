import type { CalculatorConfig } from './types.ts';

export const workCalculators: CalculatorConfig[] = [
  {
    id: 'salary-raise-calculator',
    category: 'work',
    updatedAt: '2026-09-10',
    aliases: ['pay rise calculator', 'percentage increase in salary', 'promotion pay calculator', 'new salary calculator'],
    related: ['paycheck-calculator', 'inflation-calculator', 'freelancer-rate-calculator'],
    title: 'Salary Raise Calculator',
    description: 'Calculate your new salary after a raise, compare offers, and estimate annual, monthly, and hourly impact before and after taxes.',
    example: 'See the difference between a $72,000 salary and a 7% raise, paying bi-weekly.',
    inputs: [
      { id: 'currentSalary', label: 'Current annual salary', type: 'currency', placeholder: '72000', defaultValue: 72000, step: 1000, min: 0 },
      { id: 'raisePercent', label: 'Raise percentage', type: 'percent', placeholder: '7', defaultValue: 7, step: 0.1, min: 0 },
      { id: 'flatRaiseAmount', label: 'Or flat raise amount (overrides % if > 0)', type: 'currency', placeholder: '0', defaultValue: 0, step: 500, min: 0 },
      { id: 'taxRate', label: 'Estimated combined tax rate', type: 'percent', placeholder: '28', defaultValue: 28, step: 0.5, min: 0 },
      { id: 'payPeriodsPerYear', label: 'Pay periods per year (26 = bi-weekly, 12 = monthly)', type: 'number', placeholder: '26', defaultValue: 26, step: 1, min: 1 }
    ],
    seo: {
      title: 'Salary Raise Calculator – Before and After Tax',
      description: 'Calculate your new salary after a percentage or flat raise. Compare annual, monthly, per-paycheck, and hourly impact before and after taxes.',
      faq: [
        { question: 'How do I calculate a salary raise?', answer: 'Multiply your current salary by (1 + raise%) for a percentage raise, or add the flat amount directly.' },
        { question: 'What is a good raise percentage in the US?', answer: 'Merit raises in the US typically range from 3–5%. A promotion raise is usually 10–20%. Cost-of-living adjustments track CPI, which has been 3–8% in recent years.' },
        { question: 'How does a raise affect my take-home pay?', answer: 'Your raise is subject to marginal tax rates. A portion of every additional dollar earned is taxed at your marginal rate, so your take-home increase is less than the gross raise.' }
      ]
    },
    compute(values) {
      const raiseAmt = values.flatRaiseAmount > 0 ? values.flatRaiseAmount : values.currentSalary * (values.raisePercent / 100);
      const newSalary = values.currentSalary + raiseAmt;
      const raisePercent = values.currentSalary > 0 ? (raiseAmt / values.currentSalary) * 100 : 0;
      const netCurrent = values.currentSalary * (1 - values.taxRate / 100);
      const netNew = newSalary * (1 - values.taxRate / 100);
      const netIncrease = netNew - netCurrent;
      const perPaycheckIncrease = netIncrease / values.payPeriodsPerYear;
      const hourlyIncrease = raiseAmt / 2080;
      return { newSalary, raiseAmount: raiseAmt, raisePercent, netCurrent, netNew, netIncrease, perPaycheckIncrease, hourlyIncrease };
    }
  },
  {
    id: 'meeting-cost-calculator',
    category: 'work',
    updatedAt: '2026-09-10',
    aliases: ['cost of meeting calculator', 'meeting time cost', 'salary per hour meeting cost'],
    related: ['work-hours-calculator', 'freelancer-rate-calculator', 'paycheck-calculator', 'pomodoro-timer'],
    title: 'Meeting Cost Calculator',
    description: 'Calculate the real dollar cost of a meeting based on attendee count, average salary, and duration. Helps teams evaluate meeting ROI.',
    example: 'Find the cost of a 1-hour meeting with 8 people averaging $85,000 salary.',
    inputs: [
      { id: 'attendees', label: 'Number of attendees', type: 'number', placeholder: '8', defaultValue: 8, step: 1, min: 1 },
      { id: 'avgSalary', label: 'Average annual salary per person', type: 'currency', placeholder: '85000', defaultValue: 85000, step: 5000, min: 0 },
      { id: 'durationMinutes', label: 'Meeting duration (minutes)', type: 'number', placeholder: '60', defaultValue: 60, step: 5, min: 5 },
      { id: 'employerLoadFactor', label: 'Employer cost load factor (1.3 = 30% benefits/overhead)', type: 'number', placeholder: '1.3', defaultValue: 1.3, step: 0.05, min: 1 }
    ],
    seo: {
      title: 'Meeting Cost Calculator – Real Cost of Meetings',
      description: 'Calculate the true dollar cost of a meeting including employee salary time and employer overhead. Helps justify async alternatives.',
      faq: [
        { question: 'How is meeting cost calculated?', answer: 'Divide each person\'s annual salary by 2,080 work hours, multiply by meeting hours, then by the number of attendees and the employer load factor for benefits and overhead.' },
        { question: 'What is the employer load factor?', answer: 'The total cost of an employee exceeds their salary by 25–40% when you add benefits, payroll taxes, and overhead. A factor of 1.3 means $1.30 of employer cost per $1.00 of salary.' },
        { question: 'Why calculate meeting costs?', answer: 'Studies show US workers spend 31 hours per month in unproductive meetings. A recurring 1-hour weekly meeting with 10 people at $90k salary costs over $22,000 per year.' }
      ]
    },
    compute(values) {
      const hourlyPerPerson = (values.avgSalary / 2080) * values.employerLoadFactor;
      const meetingHours = values.durationMinutes / 60;
      const totalCost = hourlyPerPerson * values.attendees * meetingHours;
      const costPerAttendee = hourlyPerPerson * meetingHours;
      const annualIfWeekly = totalCost * 52;
      return { totalCost, costPerAttendee, hourlyPerPerson, annualIfWeekly };
    }
  },
  {
    id: 'freelancer-rate-calculator',
    category: 'work',
    updatedAt: '2026-10-21',
    aliases: ['hourly rate calculator', 'contractor rate calculator', 'day rate calculator', 'consulting fee calculator'],
    related: ['paycheck-calculator', 'work-hours-calculator', 'meeting-cost-calculator', 'salary-raise-calculator'],
    title: 'Freelancer Hourly Rate Calculator',
    description: 'Find the minimum hourly rate a US freelancer needs to hit a target take-home income, or work backward from a rate and schedule to the income it nets, after self-employment tax, benefits, and business expenses.',
    example: 'A freelancer targeting $80,000 net income, working 30 billable hours a week for 48 weeks at a 35% combined tax rate with $5,000 of expenses and $6,000 of benefits, needs a minimum rate of about $97.22/hr.',
    solver: {
      defaultTarget: 'hourlyRate',
      variables: [
        { id: 'hourlyRate', label: 'Minimum hourly rate', symbol: 'R', dimension: 'currency', defaultValue: 97.22, defaultUnit: 'currency' },
        { id: 'targetNetIncome', label: 'Target annual net income', symbol: 'N', dimension: 'currency', defaultValue: 80000, defaultUnit: 'currency' },
        { id: 'billableHoursPerWeek', label: 'Billable hours per week', symbol: 'h', dimension: 'count', defaultValue: 30, defaultUnit: 'count' },
        { id: 'weeksPerYear', label: 'Weeks worked per year', symbol: 'w', dimension: 'count', defaultValue: 48, defaultUnit: 'count', fixed: true },
        { id: 'selfEmploymentTaxRate', label: 'Self-employment + income tax rate', symbol: 't', dimension: 'percent', defaultValue: 35, defaultUnit: '%', fixed: true },
        { id: 'annualBusinessExpenses', label: 'Annual business expenses', symbol: 'E', dimension: 'currency', defaultValue: 5000, defaultUnit: 'currency', fixed: true },
        { id: 'annualBenefitsCost', label: 'Annual health insurance and benefits', symbol: 'B', dimension: 'currency', defaultValue: 6000, defaultUnit: 'currency', fixed: true }
      ],
      // Every variable has a closed form: gross revenue needed grosses up net+expenses+benefits for tax.
      solve: {
        hourlyRate: ({ targetNetIncome, annualBusinessExpenses, annualBenefitsCost, selfEmploymentTaxRate, billableHoursPerWeek, weeksPerYear }) => {
          const gross = (targetNetIncome + annualBusinessExpenses + annualBenefitsCost) / (1 - selfEmploymentTaxRate / 100);
          return billableHoursPerWeek * weeksPerYear > 0 ? gross / (billableHoursPerWeek * weeksPerYear) : NaN;
        },
        targetNetIncome: ({ hourlyRate, billableHoursPerWeek, weeksPerYear, selfEmploymentTaxRate, annualBusinessExpenses, annualBenefitsCost }) => {
          const gross = hourlyRate * billableHoursPerWeek * weeksPerYear;
          return gross * (1 - selfEmploymentTaxRate / 100) - annualBusinessExpenses - annualBenefitsCost;
        },
        billableHoursPerWeek: ({ hourlyRate, targetNetIncome, weeksPerYear, selfEmploymentTaxRate, annualBusinessExpenses, annualBenefitsCost }) => {
          const gross = (targetNetIncome + annualBusinessExpenses + annualBenefitsCost) / (1 - selfEmploymentTaxRate / 100);
          return hourlyRate * weeksPerYear > 0 ? gross / (hourlyRate * weeksPerYear) : NaN;
        }
      },
      outputs: [
        {
          id: 'annualGrossRevenue',
          label: 'Annual gross revenue needed',
          dimension: 'currency',
          compute: (si) => (si.targetNetIncome + si.annualBusinessExpenses + si.annualBenefitsCost) / (1 - si.selfEmploymentTaxRate / 100)
        },
        {
          id: 'taxBurden',
          label: 'Tax set-aside',
          dimension: 'currency',
          compute: (si) => {
            const gross = (si.targetNetIncome + si.annualBusinessExpenses + si.annualBenefitsCost) / (1 - si.selfEmploymentTaxRate / 100);
            return gross * (si.selfEmploymentTaxRate / 100);
          }
        },
        { id: 'totalBillableHours', label: 'Total billable hours per year', dimension: 'count', compute: (si) => si.billableHoursPerWeek * si.weeksPerYear }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'targetNetIncome', label: 'Net income' },
            { from: 'taxBurden', label: 'Taxes' },
            { from: 'annualBusinessExpenses', label: 'Business expenses' },
            { from: 'annualBenefitsCost', label: 'Benefits' }
          ],
          center: 'annualGrossRevenue',
          centerSub: 'gross revenue needed'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How a minimum freelance rate is calculated',
        paragraphs: [
          'An employee\'s paycheck hides a lot of math an employer does for them: half of payroll tax, a share of health insurance, paid time off. A freelancer\'s hourly rate has to cover all of that itself, on top of the income the freelancer actually wants to keep — which is why a sustainable freelance rate is usually well above what an equivalent salary divided by 2,080 hours would suggest.',
          'The calculation works in one direction as "gross revenue needed": take the target take-home income, add annual business expenses and the cost of benefits such as health insurance, then gross the whole thing up for tax, since tax is paid on the gross, not the net. Dividing that gross figure by the total billable hours in a year gives the minimum hourly rate.',
          'The same relationship runs in the other two directions too. Given a rate you can actually charge and the hours you can realistically bill, it shows the net income that combination nets you; given a target income and a rate, it shows how many billable hours a week that requires.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of hourly rate, target net income and billable hours per week. The third, marked auto, is calculated. Weeks worked per year, your tax rate, business expenses and benefits cost are always inputs.',
        steps: [
          { name: 'Enter your target net income', text: 'What you want to take home in a year after tax, expenses and benefits are all covered.' },
          { name: 'Enter weeks worked per year', text: 'Account for vacation, sick time, holidays and slower periods — a typical range is 44–50 for a full-time freelancer.' },
          { name: 'Enter your tax rate', text: 'Combine the self-employment tax rate (15.3% in the US) with your expected federal and state income tax bracket.' },
          { name: 'Enter expenses and benefits', text: 'Annual business costs (software, equipment, insurance for the business) and what you pay for your own health insurance and benefits.' },
          { name: 'Read the rate, or work backward', text: 'Leave hourly rate alone to calculate it, leave billable hours alone to see how many hours a target rate and income require, or leave target income alone to see what a rate and schedule actually nets you.' },
          { name: 'Check the breakdown', text: 'The donut shows how the required gross revenue splits between your net income, taxes, business expenses and benefits.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Gross revenue needed covers net income plus expenses and benefits, grossed up for tax. Dividing by total billable hours gives the rate.',
        expression:
          'grossNeeded = (targetNetIncome + expenses + benefits) ÷ (1 − taxRate)\nhourlyRate = grossNeeded ÷ (billableHoursPerWeek × weeksPerYear)\ntargetNetIncome = hourlyRate × billableHoursPerWeek × weeksPerYear × (1 − taxRate) − expenses − benefits',
        terms: [
          { symbol: 'grossNeeded', meaning: 'Total revenue needed before tax — the same figure as "annual gross revenue needed" in the results.' },
          { symbol: 'taxRate', meaning: 'Combined self-employment and income tax rate, as a decimal (35% is 0.35).' },
          { symbol: 'billableHoursPerWeek × weeksPerYear', meaning: 'Total billable hours in the year — the only hours a freelancer is actually paid for.' }
        ],
        note: 'Estimates only. Actual taxes depend on your filing status, deductions, state and local rules, and other income — a tax professional can refine the rate for your situation.'
      },
      workedExample: {
        intro: 'You want to take home $80,000 a year after tax, working 30 billable hours a week for 48 weeks, with a combined 35% tax rate, $5,000 of annual business expenses and $6,000 of health insurance and benefits.',
        rows: [
          { label: 'Net income + expenses + benefits (80,000 + 5,000 + 6,000)', value: '$91,000' },
          { label: 'Gross revenue needed (91,000 ÷ (1 − 0.35))', value: '$140,000.00' },
          { label: 'Total billable hours (30 × 48)', value: '1,440' },
          { label: 'Minimum hourly rate (140,000 ÷ 1,440)', value: '$97.22' },
          { label: 'Tax set-aside (140,000 × 0.35)', value: '$49,000.00' }
        ],
        result: 'Minimum hourly rate ≈ $97.22',
        explanation: 'Of the $140,000 billed at that rate, $49,000 (35%) is set aside for taxes, $5,000 covers business expenses, $6,000 covers benefits, and the remaining $80,000 is the target take-home. Dropping to 25 billable hours a week (same income goal) raises the required rate to about $116.67, since the same $140,000 now has to come from fewer hours.'
      },
      watchOut: [
        { title: 'Self-employment tax is on top of income tax, not instead of it', body: 'The US self-employment tax rate is 15.3% (Social Security and Medicare), paid in addition to ordinary federal and state income tax — combined effective rates of 25–40% are common, which is why the tax rate input is usually well above a typical income-tax bracket alone.' },
        { title: 'Billable hours are rarely all your working hours', body: 'Sales, admin, professional development and downtime between projects are real time that is not billed. Most full-time freelancers bill 20–30 hours in a work week that is considerably longer.' },
        { title: 'Expenses and benefits change year to year', body: 'Software subscriptions, equipment, and especially health insurance premiums tend to rise. Re-run the numbers whenever any of them changes materially.' },
        { title: 'This is a floor, not a comfortable target', body: 'The minimum rate assumes every billable hour is actually billed at full rate with no gaps. Pricing some margin above the minimum covers slow months, scope creep, and invoices that are paid late or not at all.' },
        { title: 'State and local taxes vary widely', body: 'The combined tax rate should reflect your actual state (and, in some cases, city) income tax in addition to federal and self-employment tax, which this calculator does not look up automatically.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Self-Employment Tax (Social Security and Medicare Taxes)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes' },
        { label: 'HealthCare.gov, Health Care Insurance Coverage for Self-Employed Individuals', url: 'https://www.healthcare.gov/self-employed/' }
      ]
    },
    inputs: [
      { id: 'targetNetIncome', label: 'Target annual net income', type: 'currency', placeholder: '80000', defaultValue: 80000, step: 5000, min: 0 },
      { id: 'billableHoursPerWeek', label: 'Billable hours per week', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'weeksPerYear', label: 'Weeks worked per year', type: 'number', placeholder: '48', defaultValue: 48, step: 1, min: 1 },
      { id: 'selfEmploymentTaxRate', label: 'Self-employment + income tax rate', type: 'percent', placeholder: '35', defaultValue: 35, step: 1, min: 0 },
      { id: 'annualBusinessExpenses', label: 'Annual business expenses', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 500, min: 0 },
      { id: 'annualBenefitsCost', label: 'Annual health insurance and benefits', type: 'currency', placeholder: '6000', defaultValue: 6000, step: 500, min: 0 }
    ],
    seo: {
      title: 'Freelancer Hourly Rate Calculator – US Self-Employment',
      description: 'Calculate the minimum freelance hourly rate needed to hit your income goal after self-employment tax, health insurance, business expenses, and unpaid time, or solve for income or hours instead.',
      faq: [
        { question: 'What is the self-employment tax rate in the US?', answer: 'Freelancers pay 15.3% self-employment tax (Social Security + Medicare) on net self-employment income, plus federal and state income taxes. Total effective rate is often 25–40%.' },
        { question: 'Why do freelancers need a higher rate than employees?', answer: 'Employees have taxes withheld and receive employer-paid benefits. Freelancers pay both halves of FICA, buy their own health insurance, and have unpaid vacation, admin, and marketing time.' },
        { question: 'How many billable hours can a freelancer realistically work?', answer: 'Most full-time freelancers achieve 20–30 billable hours per week. The rest goes to sales, admin, professional development, and downtime.' },
        { question: 'How do I calculate my minimum hourly rate?', answer: 'Add your target net income, annual business expenses and benefits cost, divide by (1 − your combined tax rate) to get the gross revenue you need, then divide by your total billable hours for the year. $80,000 net income with $5,000 expenses and $6,000 benefits at a 35% tax rate needs $140,000 gross, which at 1,440 billable hours (30/week × 48 weeks) is about $97.22/hr.' },
        { question: 'Can I work backward from a rate to see what it nets me?', answer: 'Yes. Leave target net income alone and it becomes the calculated field: a given hourly rate, billable hours and weeks per year, after tax, expenses and benefits, show the net income that schedule actually produces.' },
        { question: 'How does the number of billable hours change the rate?', answer: 'Fewer billable hours for the same target income means a higher required rate, since the same gross revenue has to come from fewer hours. Dropping from 30 to 25 billable hours a week in the worked example raises the minimum rate from about $97.22 to about $116.67.' },
        { question: 'Does this account for state income tax?', answer: 'Only through the combined tax rate you enter. Add your expected state (and local, if applicable) income tax to the federal and self-employment tax components before entering the combined percentage.' }
      ]
    },
    compute(values) {
      const totalBillableHours = values.billableHoursPerWeek * values.weeksPerYear;
      const grossNeeded = (values.targetNetIncome + values.annualBusinessExpenses + values.annualBenefitsCost) / (1 - values.selfEmploymentTaxRate / 100);
      const minimumHourlyRate = grossNeeded / totalBillableHours;
      const annualGrossRevenue = grossNeeded;
      const taxBurden = grossNeeded * (values.selfEmploymentTaxRate / 100);
      return { minimumHourlyRate, annualGrossRevenue, taxBurden, totalBillableHours };
    }
  },
  {
    id: 'pto-calculator',
    category: 'work',
    updatedAt: '2026-09-10',
    aliases: ['vacation days calculator', 'paid time off accrual calculator', 'annual leave calculator', 'holiday allowance calculator'],
    related: ['work-hours-calculator', 'paycheck-calculator', 'date-difference-calculator', 'travel-budget-calculator'],
    title: 'PTO / Vacation Calculator',
    description: 'Calculate accrued PTO, remaining balance, and cash value of unused vacation days based on US employer policies.',
    example: 'Find PTO balance for an employee who earns 15 days/year, has used 4 days, and earns $75,000.',
    inputs: [
      { id: 'annualPtoDays', label: 'Annual PTO days allotted', type: 'number', placeholder: '15', defaultValue: 15, step: 0.5, min: 0 },
      { id: 'daysUsed', label: 'Days used so far this year', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'annualSalary', label: 'Annual salary', type: 'currency', placeholder: '75000', defaultValue: 75000, step: 1000, min: 0 },
      { id: 'workDaysPerYear', label: 'Work days per year', type: 'number', placeholder: '260', defaultValue: 260, step: 1, min: 1 }
    ],
    seo: {
      title: 'PTO / Vacation Calculator – Accrual and Cash Value',
      description: 'Calculate your remaining PTO balance and the dollar value of unused vacation days. Based on US employer policies and daily wage calculation.',
      faq: [
        { question: 'Is PTO required by law in the US?', answer: 'No federal law requires paid vacation in the US. PTO is offered at employer discretion. Some states like California, Colorado, and Maine have specific rules around accrual and payout.' },
        { question: 'Can employers pay out unused PTO?', answer: 'In some states (CA, CO, NE, ND) accrued PTO is treated as earned wages and must be paid out at termination. Other states allow use-it-or-lose-it policies.' },
        { question: 'How is PTO cash value calculated?', answer: 'Divide your annual salary by the number of work days per year to get your daily rate, then multiply by unused PTO days.' }
      ]
    },
    compute(values) {
      const remaining = Math.max(0, values.annualPtoDays - values.daysUsed);
      const dailyRate = values.annualSalary / values.workDaysPerYear;
      const cashValue = remaining * dailyRate;
      const usedCashValue = values.daysUsed * dailyRate;
      const usagePercent = values.annualPtoDays > 0 ? (values.daysUsed / values.annualPtoDays) * 100 : 0;
      return { remaining, dailyRate, cashValue, usedCashValue, usagePercent };
    }
  }
];
