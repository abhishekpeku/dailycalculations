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
    updatedAt: '2026-09-10',
    aliases: ['hourly rate calculator', 'contractor rate calculator', 'day rate calculator', 'consulting fee calculator'],
    related: ['paycheck-calculator', 'work-hours-calculator', 'meeting-cost-calculator', 'salary-raise-calculator'],
    title: 'Freelancer Hourly Rate Calculator',
    description: 'Calculate the minimum hourly rate needed as a US freelancer to cover taxes, benefits, business expenses, and unpaid time.',
    example: 'Find the minimum hourly rate for a freelancer targeting $80,000 net income with 30 billable hours per week.',
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
      description: 'Calculate the minimum freelance hourly rate needed to hit your income goal after self-employment tax, health insurance, business expenses, and unpaid time.',
      faq: [
        { question: 'What is the self-employment tax rate in the US?', answer: 'Freelancers pay 15.3% self-employment tax (Social Security + Medicare) on net self-employment income, plus federal and state income taxes. Total effective rate is often 25–40%.' },
        { question: 'Why do freelancers need a higher rate than employees?', answer: 'Employees have taxes withheld and receive employer-paid benefits. Freelancers pay both halves of FICA, buy their own health insurance, and have unpaid vacation, admin, and marketing time.' },
        { question: 'How many billable hours can a freelancer realistically work?', answer: 'Most full-time freelancers achieve 20–30 billable hours per week. The rest goes to sales, admin, professional development, and downtime.' }
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
