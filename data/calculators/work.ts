import type { CalculatorConfig } from './types.ts';

export const workCalculators: CalculatorConfig[] = [
  {
    id: 'salary-raise-calculator',
    category: 'work',
    updatedAt: '2026-10-21',
    aliases: ['pay rise calculator', 'percentage increase in salary', 'promotion pay calculator', 'new salary calculator'],
    related: ['paycheck-calculator', 'inflation-calculator', 'freelancer-rate-calculator'],
    title: 'Salary Raise Calculator',
    description: 'Find your new salary from a raise percentage, or work backward from a target salary to the raise it represents, with the before/after tax impact on your annual, per-paycheck and hourly pay.',
    example: 'A $72,000 salary with a 7% raise becomes $77,040 — a $5,040 raise that is about $3,628.80 more take-home a year (about $139.57 more per bi-weekly paycheck) at a 28% combined tax rate.',
    solver: {
      defaultTarget: 'newSalary',
      variables: [
        { id: 'currentSalary', label: 'Current annual salary', symbol: 'S', dimension: 'currency', defaultValue: 72000, defaultUnit: 'currency', fixed: true },
        { id: 'raisePercent', label: 'Raise percentage', symbol: 'r', dimension: 'percent', defaultValue: 7, defaultUnit: '%' },
        { id: 'newSalary', label: 'New annual salary', symbol: 'S′', dimension: 'currency', defaultValue: 77040, defaultUnit: 'currency' },
        { id: 'taxRate', label: 'Estimated combined tax rate', symbol: 't', dimension: 'percent', defaultValue: 28, defaultUnit: '%', fixed: true },
        { id: 'payPeriodsPerYear', label: 'Pay periods per year', symbol: 'p', dimension: 'count', defaultValue: 26, defaultUnit: 'count', fixed: true }
      ],
      // raiseAmount is a derived output, not a third rotating variable: it and raisePercent both
      // describe the same one degree of freedom (the raise), and only one field auto-updates at a
      // time, so treating both as independently-editable inputs could let them go out of sync.
      solve: {
        newSalary: ({ currentSalary, raisePercent }) => currentSalary * (1 + raisePercent / 100),
        raisePercent: ({ currentSalary, newSalary }) => (currentSalary > 0 ? (newSalary / currentSalary - 1) * 100 : NaN)
      },
      outputs: [
        { id: 'raiseAmount', label: 'Raise amount', dimension: 'currency', compute: (si) => si.newSalary - si.currentSalary },
        { id: 'netIncrease', label: 'Net (after-tax) increase per year', dimension: 'currency', compute: (si) => (si.newSalary - si.currentSalary) * (1 - si.taxRate / 100) },
        {
          id: 'perPaycheckIncrease',
          label: 'Net increase per paycheck',
          dimension: 'currency',
          compute: (si) => (si.payPeriodsPerYear > 0 ? ((si.newSalary - si.currentSalary) * (1 - si.taxRate / 100)) / si.payPeriodsPerYear : NaN)
        },
        { id: 'hourlyIncrease', label: 'Gross increase per hour (÷ 2,080)', dimension: 'currency', compute: (si) => (si.newSalary - si.currentSalary) / 2080 }
      ],
      visuals: [{ type: 'compareBars', bars: [{ from: 'currentSalary', label: 'Current salary' }, { from: 'newSalary', label: 'New salary' }], title: 'Before vs. after the raise' }]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How a raise changes your pay, before and after tax',
        paragraphs: [
          'A raise is usually quoted as a percentage, but what actually lands in a paycheck is smaller than the headline number suggests. Every additional dollar of salary is still taxed, so the after-tax ("net") increase is the raise amount multiplied by what is left after tax, not the full raise amount itself.',
          'The calculator solves the simple relationship between a current salary, a raise percentage and a new salary — know any two and the third follows. A separate set of figures then applies an estimated combined tax rate to show the after-tax impact per year, per paycheck and per hour of a standard 2,080-hour work-year.',
          'The tax treatment here is a simplification: it applies one flat combined rate to the whole raise, rather than modeling the US federal income tax\'s actual marginal brackets, where only the income inside each bracket is taxed at that bracket\'s rate. For most raises that do not push you into a materially higher bracket, a flat-rate estimate is close enough to be useful; for a large jump, the true marginal effect could differ.'
        ]
      },
      howTo: {
        intro: 'Enter your current salary (always an input) and any one of raise percentage or new salary. The other, marked auto, is calculated. Tax rate and pay periods per year are always inputs.',
        steps: [
          { name: 'Enter your current salary', text: 'This is always an input — the anchor the raise is calculated against.' },
          { name: 'Enter a raise percentage, or a new salary', text: 'Type the percentage you were offered, or type the new salary directly if that is what you know (for example, from an offer letter) and let the percentage be calculated instead.' },
          { name: 'Enter your estimated combined tax rate', text: 'Federal, state, and any local income tax combined, as a single percentage.' },
          { name: 'Enter your pay frequency', text: '26 for bi-weekly, 24 for semi-monthly, 12 for monthly.' },
          { name: 'Read the impact', text: 'The raise amount, net (after-tax) increase per year, per paycheck and per hour all appear below, with a before/after bar chart.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The raise itself is simple multiplication. The after-tax figures apply one flat rate to the raise amount.',
        expression:
          'newSalary = currentSalary × (1 + raisePercent ÷ 100)\nraiseAmount = newSalary − currentSalary\nnetIncrease = raiseAmount × (1 − taxRate ÷ 100)\nperPaycheckIncrease = netIncrease ÷ payPeriodsPerYear',
        terms: [
          { symbol: 'raisePercent', meaning: 'The raise as a percentage of the current salary.' },
          { symbol: 'taxRate', meaning: 'A single estimated combined tax rate applied to the whole raise, not a marginal-bracket calculation.' },
          { symbol: 'payPeriodsPerYear', meaning: 'How many paychecks you receive a year: 52 weekly, 26 bi-weekly, 24 semi-monthly, 12 monthly.' }
        ],
        note: 'Estimates only, not tax advice. Your actual withholding depends on your tax bracket, filing status, deductions and any other income — a pay stub or tax professional will give the exact figure.'
      },
      workedExample: {
        intro: 'A $72,000 salary gets a 7% raise. The combined tax rate is estimated at 28%, paid bi-weekly (26 pay periods).',
        rows: [
          { label: 'Raise amount (72,000 × 7%)', value: '$5,040.00' },
          { label: 'New salary (72,000 + 5,040)', value: '$77,040.00' },
          { label: 'Net increase (5,040 × (1 − 0.28))', value: '$3,628.80' },
          { label: 'Per paycheck (3,628.80 ÷ 26)', value: '$139.57' },
          { label: 'Per hour (5,040 ÷ 2,080)', value: '$2.42' }
        ],
        result: 'New salary $77,040.00 · net increase $3,628.80/yr (about $139.57/paycheck)',
        explanation: 'The $5,040 raise is 7% of $72,000. After the estimated 28% tax bite, $3,628.80 of it is actually take-home pay — a bit over 72 cents of every raised dollar — split across 26 paychecks a year.'
      },
      watchOut: [
        { title: 'Estimates only, not tax advice', body: 'The tax figures use one flat combined rate on the whole raise, not the US federal income tax\'s real marginal brackets, where only the income inside each bracket is taxed at that bracket\'s rate. A pay stub or tax professional gives the exact number.' },
        { title: 'A raise can change more than take-home pay', body: 'Moving into a higher bracket can also affect eligibility for income-based benefits, retirement contribution limits, or phase-outs of certain tax credits — none of which this calculator models.' },
        { title: 'Cost-of-living adjustments are not merit raises', body: 'A raise that merely tracks inflation (as measured by the Consumer Price Index) keeps purchasing power roughly flat rather than increasing it, even though the dollar amount on the paycheck goes up.' },
        { title: 'Compare total compensation, not just salary', body: 'Benefits, bonus structure, and equity can matter as much as base salary when comparing two offers or evaluating a raise.' },
        { title: 'The hourly figure assumes 2,080 hours a year', body: 'That is 40 hours × 52 weeks, a common approximation. Actual annual work hours vary with holidays, overtime, and part-year employment.' }
      ],
      references: [
        { label: 'U.S. Bureau of Labor Statistics, Consumer Price Index', url: 'https://www.bls.gov/cpi/' },
        { label: 'Internal Revenue Service, Federal Income Tax Rates and Brackets', url: 'https://www.irs.gov/filing/federal-income-tax-rates-and-brackets' }
      ]
    },
    inputs: [
      { id: 'currentSalary', label: 'Current annual salary', type: 'currency', placeholder: '72000', defaultValue: 72000, step: 1000, min: 0 },
      { id: 'raisePercent', label: 'Raise percentage', type: 'percent', placeholder: '7', defaultValue: 7, step: 0.1, min: 0 },
      { id: 'flatRaiseAmount', label: 'Or flat raise amount (overrides % if > 0)', type: 'currency', placeholder: '0', defaultValue: 0, step: 500, min: 0 },
      { id: 'taxRate', label: 'Estimated combined tax rate', type: 'percent', placeholder: '28', defaultValue: 28, step: 0.5, min: 0 },
      { id: 'payPeriodsPerYear', label: 'Pay periods per year (26 = bi-weekly, 12 = monthly)', type: 'number', placeholder: '26', defaultValue: 26, step: 1, min: 1 }
    ],
    seo: {
      title: 'Salary Raise Calculator – Before and After Tax',
      description: 'Calculate your new salary after a percentage raise, or work backward from a target salary, with annual, per-paycheck and hourly impact before and after an estimated tax rate.',
      faq: [
        { question: 'How do I calculate a salary raise?', answer: 'Multiply your current salary by (1 + raise% ÷ 100). A $72,000 salary with a 7% raise is 72,000 × 1.07 = $77,040, a raise amount of $5,040.' },
        { question: 'How do I work backward from a target salary to the raise percentage?', answer: 'Divide the new salary by the current salary, subtract 1, and multiply by 100. Going from $72,000 to $77,040 is (77,040 ÷ 72,000 − 1) × 100 = 7%.' },
        { question: 'How does a raise affect my take-home pay?', answer: 'This calculator applies one flat estimated tax rate to the raise amount, not the US federal income tax\'s actual marginal brackets (where only the income inside each bracket is taxed at that bracket\'s rate). At a 28% combined rate, a $5,040 raise nets about $3,628.80 after tax.' },
        { question: 'What is a cost-of-living adjustment (COLA)?', answer: 'A COLA is a raise intended to keep pace with inflation, often benchmarked against the Consumer Price Index published by the US Bureau of Labor Statistics, rather than a merit increase tied to performance.' },
        { question: 'How much is my raise worth per paycheck?', answer: 'Divide the net (after-tax) annual increase by your pay periods per year. $3,628.80 net over 26 bi-weekly paychecks is about $139.57 extra per paycheck.' },
        { question: 'Does a bigger raise always mean a bigger take-home increase?', answer: 'In this calculator\'s flat-rate model, yes, proportionally — but in reality a large enough raise can push part of your income into a higher marginal tax bracket, which this simplified estimate does not model.' },
        { question: 'How is an hourly raise equivalent calculated?', answer: 'Divide the annual raise amount by 2,080 (a standard 40-hour, 52-week work-year). A $5,040 raise is about $2.42 more per hour on that basis.' }
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
    updatedAt: '2026-10-21',
    aliases: ['cost of meeting calculator', 'meeting time cost', 'salary per hour meeting cost'],
    related: ['work-hours-calculator', 'freelancer-rate-calculator', 'paycheck-calculator', 'pomodoro-timer'],
    title: 'Meeting Cost Calculator',
    description: 'Calculate the real dollar cost of a meeting from attendee count, average salary, duration and an employer overhead factor, with the annual cost if it recurs weekly.',
    example: 'An 8-person, 1-hour meeting with an $85,000 average salary and a 1.3 employer load factor costs about $425.00 — $22,100 a year if it recurs weekly.',
    breakdown: {
      headline: 'totalCost',
      headlineLabel: 'Total cost of this meeting',
      outputs: [
        { id: 'totalCost', label: 'Total cost of this meeting', format: 'currency' },
        { id: 'costPerAttendee', label: 'Cost per attendee', format: 'currency' },
        { id: 'hourlyPerPerson', label: 'Loaded cost per person per hour', format: 'currency' },
        { id: 'annualIfWeekly', label: 'Annual cost if held every week', format: 'currency' }
      ],
      groups: [
        { title: 'Attendees and duration', inputs: ['attendees', 'durationMinutes'] },
        { title: 'Cost basis', inputs: ['avgSalary', 'employerLoadFactor'] }
      ],
      // Plan calls for a "cost ticker" (a live running total); the kit has no live-timer
      // component, so this compares the one-off cost against the recurring annual cost instead.
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'totalCost', label: 'This meeting' },
          { from: 'annualIfWeekly', label: 'If held weekly, per year' }
        ],
        title: 'This meeting vs. a weekly recurring cost'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What a meeting actually costs',
        paragraphs: [
          'A meeting has no separate budget line, so its cost is easy to ignore — but every attendee\'s time already has a price, their loaded hourly cost to the employer, which is their salary divided by a standard work-year plus a load factor for benefits, payroll taxes and overhead. Multiplying that figure by the meeting\'s length and the number of people in the room turns an hour of everyone\'s time into a single dollar figure.',
          'The "load factor" accounts for everything beyond base salary that an employer pays for an employee: the employer share of payroll taxes, health insurance and other benefits, and general overhead. The US Bureau of Labor Statistics regularly measures this split for the overall workforce, which is a useful sanity check on whatever load factor you enter.',
          'A single meeting\'s cost is rarely the point — the annual figure for a recurring meeting is usually the more persuasive number, since a modest-looking one-time cost compounds fast when the same meeting repeats every week.'
        ]
      },
      howTo: {
        intro: 'Enter the attendee count, average salary, meeting length and an overhead load factor.',
        steps: [
          { name: 'Enter the number of attendees', text: 'Everyone whose time the meeting uses, including the organizer.' },
          { name: 'Enter the average annual salary', text: 'Use the average across attendees if salaries differ meaningfully by role or seniority.' },
          { name: 'Enter the meeting duration', text: 'In minutes — 30, 60 and 90 are common lengths.' },
          { name: 'Enter the employer load factor', text: 'A factor of 1.3 means $1.30 of total employer cost for every $1.00 of salary, covering benefits, payroll taxes and overhead.' },
          { name: 'Read the cost', text: 'The headline is the one-time cost of this meeting. The chart compares it with the annual cost if the same meeting recurs every week.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each attendee\'s loaded hourly cost is their salary divided by a standard work-year, times the load factor. Multiplying by meeting length and attendee count gives the total.',
        expression:
          'hourlyPerPerson = (avgSalary ÷ 2,080) × loadFactor\nmeetingHours = durationMinutes ÷ 60\ntotalCost = hourlyPerPerson × attendees × meetingHours\nannualIfWeekly = totalCost × 52',
        terms: [
          { symbol: '2,080', meaning: 'A standard full-time work-year: 40 hours × 52 weeks. Other conventions exist — the US federal government uses a 2,087-hour divisor averaged over a 28-year cycle.' },
          { symbol: 'loadFactor', meaning: 'Total employer cost per dollar of salary, covering benefits, payroll taxes and overhead. BLS data puts benefits alone at roughly 30% of total compensation for private-industry workers, which is consistent with a load factor around 1.3.' }
        ],
        note: 'Estimates only. The actual value or cost of a meeting also depends on what is accomplished in it, which this calculator cannot measure.'
      },
      workedExample: {
        intro: 'An 8-person, 1-hour meeting where attendees average $85,000 a year, with a 1.3 employer load factor.',
        rows: [
          { label: 'Loaded hourly cost per person (85,000 ÷ 2,080 × 1.3)', value: '$53.125' },
          { label: 'Meeting length', value: '1 hour' },
          { label: 'Total cost (53.125 × 8 × 1)', value: '$425.00' },
          { label: 'Cost per attendee', value: '$53.13' },
          { label: 'Annual cost if held every week (425 × 52)', value: '$22,100.00' }
        ],
        result: 'This meeting costs about $425.00 · $22,100.00 a year if it recurs weekly',
        explanation: 'Doubling the meeting to 2 hours doubles the cost to $850.00 and the annual figure to $44,200.00 — the relationship is linear in both attendees and duration, so trimming either has a proportional effect.'
      },
      watchOut: [
        { title: 'Estimates only', body: 'The 2,080-hour work-year and the load factor are both approximations. Your organization\'s actual benefits load, payroll tax rate and average salary may differ.' },
        { title: 'A low cost does not mean a meeting is worthwhile', body: 'This figure measures time cost, not value created. A cheap meeting that solves nothing is still a bad use of time; an expensive meeting that resolves a real blocker can be worth far more than its cost.' },
        { title: 'Average salary can hide a wide spread', body: 'A meeting with a mix of junior and senior staff has a true cost that differs from attendees×average — for very mixed groups, a sum of individual salaries will be more accurate than an average.' },
        { title: 'Recurring costs compound quickly', body: 'A meeting that looks affordable at $425 once becomes $22,100 a year if repeated weekly — worth checking against what the meeting actually produces before defaulting to a standing invite.' },
        { title: 'Async alternatives have their own real cost', body: 'Replacing a meeting with written updates or a recorded video shifts cost rather than eliminating it — it can still be the better trade, just not necessarily a free one.' }
      ],
      references: [
        { label: 'U.S. Office of Personnel Management, Computing Hourly Rates of Pay Using the 2,087-Hour Divisor', url: 'https://www.opm.gov/policy-data-oversight/pay-leave/pay-administration/fact-sheets/computing-hourly-rates-of-pay-using-the-2087-hour-divisor/' },
        { label: 'U.S. Bureau of Labor Statistics, Employer Costs for Employee Compensation', url: 'https://www.bls.gov/ecec/home.htm' }
      ]
    },
    inputs: [
      { id: 'attendees', label: 'Number of attendees', type: 'number', placeholder: '8', defaultValue: 8, step: 1, min: 1 },
      { id: 'avgSalary', label: 'Average annual salary per person', type: 'currency', placeholder: '85000', defaultValue: 85000, step: 5000, min: 0 },
      { id: 'durationMinutes', label: 'Meeting duration (minutes)', type: 'number', placeholder: '60', defaultValue: 60, step: 5, min: 5 },
      { id: 'employerLoadFactor', label: 'Employer cost load factor (1.3 = 30% benefits/overhead)', type: 'number', placeholder: '1.3', defaultValue: 1.3, step: 0.05, min: 1 }
    ],
    seo: {
      title: 'Meeting Cost Calculator – Real Cost of Meetings',
      description: 'Calculate the true dollar cost of a meeting including employee salary time and employer overhead, with the annual cost if it recurs weekly. Helps justify async alternatives.',
      faq: [
        { question: 'How is meeting cost calculated?', answer: 'Divide each person\'s annual salary by 2,080 work hours, multiply by the employer load factor to get a loaded hourly cost, then multiply by meeting hours and the number of attendees. An 8-person, 1-hour meeting at $85,000 average salary and a 1.3 load factor costs about $425.00.' },
        { question: 'What is the employer load factor?', answer: 'A multiplier for everything an employer pays beyond base salary — benefits, payroll taxes and overhead. A factor of 1.3 means $1.30 of employer cost per $1.00 of salary; BLS data shows benefits alone make up roughly 30% of total compensation for private-industry workers, consistent with a load factor near 1.3.' },
        { question: 'How much does a recurring meeting cost per year?', answer: 'Multiply the one-time cost by 52 for a weekly meeting. The $425.00 example meeting would cost $22,100.00 a year if held every week.' },
        { question: 'Why 2,080 hours for the work-year?', answer: '40 hours a week × 52 weeks is the most common convention. It is an approximation — the US federal government, for example, uses a 2,087-hour divisor averaged over a 28-year cycle to account for how workdays fall across different calendar years.' },
        { question: 'Should I use an average or a sum of salaries?', answer: 'An average works for a roughly similar group. For a meeting with a wide mix of seniority levels, summing each attendee\'s actual loaded hourly cost gives a more accurate total than attendees × average.' },
        { question: 'Does a high meeting cost mean the meeting is wasteful?', answer: 'Not by itself. This figure measures time cost, not the value produced. It is most useful for comparing options — a shorter meeting, fewer attendees, or an async alternative — against the same baseline.' },
        { question: 'How does meeting length affect the total?', answer: 'Linearly. Cutting an 8-person, $425.00 meeting from 60 to 30 minutes halves it to $212.50, and the same proportional change applies to the annual recurring figure.' }
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
    updatedAt: '2026-10-21',
    aliases: ['vacation days calculator', 'paid time off accrual calculator', 'annual leave calculator', 'holiday allowance calculator'],
    related: ['work-hours-calculator', 'paycheck-calculator', 'date-difference-calculator', 'travel-budget-calculator'],
    title: 'PTO / Vacation Calculator',
    description: 'Calculate your remaining PTO balance and the dollar value of used and unused vacation days from your annual allotment, days used and salary.',
    example: 'An employee who earns 15 PTO days a year, has used 4, and makes $75,000 has 11 days remaining worth about $3,173.08.',
    breakdown: {
      headline: 'remaining',
      headlineLabel: 'PTO days remaining',
      outputs: [
        { id: 'remaining', label: 'PTO days remaining', format: 'number' },
        { id: 'cashValue', label: 'Cash value of remaining days', format: 'currency' },
        { id: 'usedCashValue', label: 'Cash value of days already used', format: 'currency' },
        { id: 'dailyRate', label: 'Daily rate', format: 'currency' },
        { id: 'usagePercent', label: 'Percent of allotment used', format: 'percent' }
      ],
      groups: [
        { title: 'Your PTO', inputs: ['annualPtoDays', 'daysUsed'] },
        { title: 'Your pay', inputs: ['annualSalary', 'workDaysPerYear'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'daysUsed', label: 'Used' },
          { from: 'remaining', label: 'Remaining' }
        ],
        title: 'PTO days used vs. remaining'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How PTO balance and cash value are calculated',
        paragraphs: [
          'Paid time off is usually granted as a yearly allotment of days, drawn down as it is used. The remaining balance is just the allotment minus what has been used, but it is also worth a dollar figure: each day off is worth a day\'s pay, so a daily rate (salary divided by work days in the year) converts days into money.',
          'In the US, there is no federal law requiring employers to offer paid vacation at all — the Department of Labor confirms the Fair Labor Standards Act does not require payment for time not worked, including vacation. Where PTO is offered, the rules for unused balances vary sharply by state: some states, including California, treat earned vacation as a form of wages that vests as it is earned and cannot be forfeited by a "use it or lose it" policy, while others allow employers to set an expiration or cap.',
          'The cash value figure matters most at two points: negotiating a payout for unused days at termination (where state law may require it), and simply understanding what a day off is actually worth in dollar terms when deciding whether to take it, bank it, or (where allowed) cash it out.'
        ]
      },
      howTo: {
        intro: 'Enter your annual PTO allotment, how many days you have used, your salary, and your work days per year.',
        steps: [
          { name: 'Enter your annual PTO days', text: 'The total days granted for the year under your employer\'s policy.' },
          { name: 'Enter days used so far', text: 'How many of those days you have already taken.' },
          { name: 'Enter your annual salary', text: 'Used to work out your daily rate.' },
          { name: 'Enter work days per year', text: '260 is a common default (5 days × 52 weeks); adjust if your schedule differs.' },
          { name: 'Read the balance', text: 'Remaining days is the headline, with the cash value of both the remaining and already-used days shown below, and a bar comparing used to remaining.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Remaining balance is simple subtraction. Cash value comes from a daily rate applied to a day count.',
        expression:
          'remaining = annualPtoDays − daysUsed\ndailyRate = annualSalary ÷ workDaysPerYear\ncashValue = remaining × dailyRate\nusagePercent = daysUsed ÷ annualPtoDays × 100',
        terms: [
          { symbol: 'workDaysPerYear', meaning: 'Work days in the year used to spread the annual salary into a daily rate — 260 (5 × 52) is a common convention.' },
          { symbol: 'dailyRate', meaning: 'What one day of PTO is worth in pay.' }
        ],
        note: 'Estimates only. Your employer\'s actual PTO policy, accrual schedule and payout rules govern the real balance and value — check your employee handbook or HR for the authoritative figures.'
      },
      workedExample: {
        intro: 'An employee is granted 15 PTO days a year, has used 4, earns $75,000, and works 260 days a year.',
        rows: [
          { label: 'Remaining (15 − 4)', value: '11 days' },
          { label: 'Daily rate (75,000 ÷ 260)', value: '$288.46' },
          { label: 'Cash value of remaining (11 × 288.46)', value: '$3,173.08' },
          { label: 'Cash value of days used (4 × 288.46)', value: '$1,153.85' },
          { label: 'Percent used (4 ÷ 15 × 100)', value: '26.67%' }
        ],
        result: '11 days remaining, worth about $3,173.08',
        explanation: 'The same $288.46 daily rate values both the used and unused days — $1,153.85 already taken and $3,173.08 still available, together worth the full 15-day allotment of $4,326.92.'
      },
      watchOut: [
        { title: 'State law decides whether a payout is required', body: 'California, Colorado, Nebraska and North Dakota are commonly cited as states that treat earned vacation as wages that must be paid out; other states allow "use it or lose it" or capped accrual. Check your state\'s labor department for the actual rule.' },
        { title: 'No federal law requires PTO at all', body: 'The Fair Labor Standards Act does not require paid vacation, sick leave, or holidays. Any PTO policy is a benefit your employer chooses to offer, governed by your employee handbook or an employment contract.' },
        { title: 'Accrual schedules vary', body: 'Some employers grant the full annual allotment up front; others accrue it gradually per pay period, which can mean your true available balance partway through the year is lower than the full annual figure.' },
        { title: 'This is a simplified daily rate, not a payroll calculation', body: 'Actual PTO payout may use a different divisor (such as scheduled work days instead of a flat 260) or be affected by caps, waiting periods, or employer-specific rules.' },
        { title: 'Unlimited PTO policies do not fit this model', body: 'Without a fixed annual allotment, "remaining days" and "percent used" are not meaningful figures — this calculator assumes a traditional accrual-based policy.' }
      ],
      references: [
        { label: 'U.S. Department of Labor, Vacation Leave', url: 'https://www.dol.gov/general/topic/workhours/vacation_leave' },
        { label: 'California Department of Industrial Relations, DLSE FAQ: Vacation', url: 'https://www.dir.ca.gov/dlse/faq_vacation.htm' }
      ]
    },
    inputs: [
      { id: 'annualPtoDays', label: 'Annual PTO days allotted', type: 'number', placeholder: '15', defaultValue: 15, step: 0.5, min: 0 },
      { id: 'daysUsed', label: 'Days used so far this year', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'annualSalary', label: 'Annual salary', type: 'currency', placeholder: '75000', defaultValue: 75000, step: 1000, min: 0 },
      { id: 'workDaysPerYear', label: 'Work days per year', type: 'number', placeholder: '260', defaultValue: 260, step: 1, min: 1 }
    ],
    seo: {
      title: 'PTO / Vacation Calculator – Accrual and Cash Value',
      description: 'Calculate your remaining PTO balance and the dollar value of used and unused vacation days. Based on a daily-rate model; check your employer\'s actual policy and state law.',
      faq: [
        { question: 'Is PTO required by law in the US?', answer: 'No. The Fair Labor Standards Act does not require employers to offer paid vacation. PTO is offered at employer discretion, though some states have specific rules around accrual and payout once it is offered.' },
        { question: 'Can employers pay out unused PTO?', answer: 'In some states (including California, Colorado, Nebraska and North Dakota) accrued PTO is treated as earned wages that must be paid out, and "use it or lose it" policies are illegal. Other states allow employers to cap accrual or set expiration policies.' },
        { question: 'How is PTO cash value calculated?', answer: 'Divide your annual salary by work days per year to get a daily rate, then multiply by the number of days. A $75,000 salary over 260 work days is a $288.46 daily rate; 11 remaining days are worth $3,173.08.' },
        { question: 'What if my PTO is used-it-or-lose-it?', answer: 'The remaining-days and cash-value figures are the same either way — this calculator does not model expiration dates. Check your employer\'s policy for whether unused days carry over, expire, or are capped.' },
        { question: 'Why use 260 work days per year?', answer: '260 is 5 days a week × 52 weeks, a common default that does not subtract holidays. Adjust it if your actual work-day count differs.' },
        { question: 'Does this work for unlimited PTO policies?', answer: 'No. Unlimited PTO has no fixed annual allotment, so "days remaining" and "percent used" are not meaningful figures for that kind of policy.' },
        { question: 'What is the cash value of the days I have already used?', answer: 'The same daily rate applied to days used instead of days remaining. In the worked example, 4 used days at a $288.46 daily rate are worth $1,153.85.' }
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
