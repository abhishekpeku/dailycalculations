import type { CalculatorConfig } from './types.ts';

export const workCalculators: CalculatorConfig[] = [
  {
    id: 'salary-raise-calculator',
    group: 'Pay & Rates',
    category: 'work',
    glyph: 'S′',
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
    group: 'Time & Benefits',
    category: 'work',
    glyph: '$',
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
    group: 'Pay & Rates',
    category: 'work',
    glyph: '$/h',
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
    group: 'Time & Benefits',
    category: 'work',
    glyph: 'PTO',
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
  },
  {
    id: 'overtime-pay-calculator',
    group: 'Pay & Rates',
    category: 'work',
    glyph: '1.5×',
    updatedAt: '2026-11-16',
    aliases: ['time and a half calculator', 'double time pay calculator', 'overtime calculator', 'FLSA overtime calculator', 'overtime hours pay calculator'],
    related: ['work-hours-calculator', 'salary-raise-calculator', 'freelancer-rate-calculator', 'paycheck-calculator'],
    title: 'Overtime Pay Calculator',
    description: 'Calculate overtime pay from total hours worked, your hourly rate and a weekly overtime threshold, plus an optional double-time tier for states that require one, with the blended effective hourly rate.',
    example: 'Working 48 hours at $22/hr (40 regular + 8 overtime at 1.5×) plus 2 hours of double time at 2× pays $1,232.00 total — an effective rate of $24.64/hr.',
    breakdown: {
      headline: 'overtimePay',
      headlineLabel: 'Overtime pay',
      outputs: [
        { id: 'overtimePay', label: 'Overtime pay', format: 'currency' },
        { id: 'totalPay', label: 'Total pay (regular + overtime + double time)', format: 'currency' },
        { id: 'regularPay', label: 'Regular pay', format: 'currency' },
        { id: 'doubleTimePay', label: 'Double-time pay', format: 'currency' },
        { id: 'effectiveRate', label: 'Effective hourly rate', format: 'currency' },
        { id: 'totalHoursPaid', label: 'Total hours paid', format: 'number' }
      ],
      groups: [
        { title: 'Hours & pay', inputs: ['hourlyRate', 'hoursWorked', 'doubleTimeHours'] },
        { title: 'Overtime & double-time rules', inputs: ['overtimeThreshold', 'otMultiplier', 'doubleTimeMultiplier'], optional: true }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'regularPay', label: 'Regular' },
          { from: 'overtimePay', label: 'Overtime' },
          { from: 'doubleTimePay', label: 'Double time' }
        ],
        center: 'totalPay',
        centerSub: 'total pay'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'How overtime and double-time pay are calculated',
        paragraphs: [
          'Under the federal Fair Labor Standards Act (FLSA), non-exempt US employees must be paid at least 1.5 times their regular rate — "time and a half" — for every hour worked over 40 in a single workweek, with no federal cap on how much overtime can be worked. The FLSA has no double-time provision at all; it is a 40-hour weekly threshold only.',
          'Some states go further. California is the one state that requires double-time pay outright: 1.5× after 8 hours in a workday (up to 12) and 2× beyond 12 hours in a day, even in a week that totals under 40 hours. Because those thresholds are daily, not weekly, this calculator — which works from a weekly total — cannot derive double-time hours on its own. Enter them directly if your state requires them; everything else here is computed automatically from the weekly total you enter.',
          'This calculator is distinct from the general Work Hours Calculator on this site, which also computes regular and overtime pay but requires you to pre-split your hours and has no double-time tier. Use this one when you want hours auto-split by threshold and a double-time tier handled; use the Work Hours Calculator for a simpler weekly gross-pay estimate.'
        ]
      },
      howTo: {
        intro: 'Enter your hourly rate and the total hours you worked this week. Overtime is split out automatically; double time, if any, is entered directly.',
        steps: [
          { name: 'Enter your hourly rate', text: 'Your base pay before any overtime or double-time premium.' },
          { name: 'Enter total hours worked', text: 'The hours worked this week, not including any hours you already know were at a double-time rate.' },
          { name: 'Enter double-time hours, if any', text: 'Hours already identified as subject to a double-time rule, most commonly California\'s over-12-hours-in-a-day rule. Leave at 0 if none apply.' },
          { name: 'Check the overtime rules', text: 'The weekly overtime threshold defaults to 40 hours (the FLSA standard) and the multiplier to 1.5. Change them only if your situation differs.' },
          { name: 'Read the breakdown', text: 'Overtime pay is the headline, with regular pay, double-time pay, total pay and the blended effective hourly rate below, and a chart of where the money comes from.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Regular and overtime hours are split from your weekly total at the threshold; double time is added on top from what you enter directly.',
        expression:
          'regularHours = min(hoursWorked, overtimeThreshold)\novertimeHours = max(0, hoursWorked − overtimeThreshold)\nregularPay = regularHours × rate\novertimePay = overtimeHours × rate × otMultiplier\ndoubleTimePay = doubleTimeHours × rate × doubleTimeMultiplier\ntotalPay = regularPay + overtimePay + doubleTimePay\neffectiveRate = totalPay ÷ (hoursWorked + doubleTimeHours)',
        terms: [
          { symbol: 'overtimeThreshold', meaning: 'Hours per week before overtime starts — 40 is the federal FLSA default.' },
          { symbol: 'otMultiplier', meaning: 'How much overtime pays versus regular time — 1.5 ("time and a half") is the federal standard.' },
          { symbol: 'doubleTimeHours', meaning: 'Hours you have already identified as subject to a double-time rule, entered directly since this calculator works in weekly totals, not day-by-day.' },
          { symbol: 'effectiveRate', meaning: 'Total pay spread evenly across every hour paid — a single blended rate for comparison.' }
        ],
        note: 'Estimates only, based on the FLSA federal floor. State and local rules can require more overtime or double time than this, never less, and this calculator does not apply any state daily-overtime rule automatically.'
      },
      workedExample: {
        intro: 'You work 48 hours this week at $22/hr. Separately, 2 of those hours fell under a double-time rule from a long shift.',
        rows: [
          { label: 'Regular hours (min(48, 40))', value: '40' },
          { label: 'Overtime hours (48 − 40)', value: '8' },
          { label: 'Regular pay (40 × $22)', value: '$880.00' },
          { label: 'Overtime pay (8 × $22 × 1.5)', value: '$264.00' },
          { label: 'Double-time pay (2 × $22 × 2.0)', value: '$88.00' },
          { label: 'Total pay (880 + 264 + 88)', value: '$1,232.00' },
          { label: 'Effective rate (1,232 ÷ 50)', value: '$24.64' }
        ],
        result: 'Total pay $1,232.00 for 50 hours paid — an effective $24.64/hr',
        explanation: 'The 8 overtime hours pay $33.00 each (22 × 1.5) and the 2 double-time hours pay $44.00 each (22 × 2.0), both richer than the $22.00 regular rate — which is why 50 hours paid come out to $24.64/hr on average rather than the flat $22.00 base rate.'
      },
      watchOut: [
        { title: 'Federal overtime is weekly, not daily', body: 'The FLSA threshold is 40 hours in a single workweek. Working 10 hours in a day is not automatically overtime under federal rules alone unless the week also tops 40 hours.' },
        { title: 'Only California requires double time outright', body: 'California requires 1.5× after 8 hours in a workday (up to 12) and 2× beyond 12 hours, even in a week under 40 hours total. No other state has a blanket double-time requirement; check your state labor department for your own rules.' },
        { title: 'This assumes a non-exempt hourly worker', body: 'Many salaried employees are exempt from FLSA overtime rules entirely, depending on their duties and pay level. This calculator does not determine exempt status.' },
        { title: 'Double-time hours are entered by hand', body: 'Because this calculator works from a weekly total rather than a day-by-day schedule, it cannot detect which hours crossed a daily double-time threshold — you supply that count directly.' },
        { title: 'Severance and overtime are different things', body: 'Overtime pay is for hours already worked. If you are instead estimating a payout after a layoff, use the Severance Pay Calculator instead.' }
      ],
      references: [
        { label: 'U.S. Department of Labor, Wage and Hour Division, Overtime Pay', url: 'https://www.dol.gov/agencies/whd/overtime' },
        { label: 'U.S. Department of Labor, Wage and Hour Division, Fair Labor Standards Act (FLSA)', url: 'https://www.dol.gov/agencies/whd/flsa' },
        { label: 'California Department of Industrial Relations, DLSE FAQ: Overtime', url: 'https://www.dir.ca.gov/dlse/faq_overtime.htm' }
      ]
    },
    inputs: [
      { id: 'hourlyRate', label: 'Hourly rate', type: 'currency', placeholder: '22', defaultValue: 22, step: 0.25, min: 0 },
      { id: 'hoursWorked', label: 'Total hours worked this week', type: 'number', placeholder: '48', defaultValue: 48, step: 0.25, min: 0 },
      { id: 'doubleTimeHours', label: 'Hours already subject to double time', type: 'number', placeholder: '2', defaultValue: 2, step: 0.25, min: 0 },
      { id: 'overtimeThreshold', label: 'Weekly overtime threshold (hours)', type: 'number', placeholder: '40', defaultValue: 40, step: 1, min: 0 },
      { id: 'otMultiplier', label: 'Overtime multiplier', type: 'number', placeholder: '1.5', defaultValue: 1.5, step: 0.25, min: 1 },
      { id: 'doubleTimeMultiplier', label: 'Double-time multiplier', type: 'number', placeholder: '2', defaultValue: 2, step: 0.25, min: 1 }
    ],
    seo: {
      title: 'Overtime Pay Calculator – Time and a Half & Double Time',
      description: 'Calculate overtime pay from hours worked and your hourly rate, with an optional double-time tier and your blended effective hourly rate.',
      faq: [
        { question: 'How is overtime pay calculated?', answer: 'Hours over the weekly threshold (40 under the federal FLSA) are paid at a multiplier of your regular rate — 1.5× for standard "time and a half." 8 overtime hours at $22/hr and a 1.5× multiplier pay $264.00.' },
        { question: 'What is double-time pay and who requires it?', answer: 'Double time pays 2× the regular rate. California is the one state that requires it outright — after 12 hours in a workday — while federal law (the FLSA) has no double-time provision at all.' },
        { question: 'Does the FLSA require overtime after 8 hours in a day?', answer: 'No. The federal threshold is 40 hours in a workweek, not hours in a single day. Some states, including California, add their own daily overtime rules on top of the federal floor.' },
        { question: 'How is this different from a general work hours or timesheet calculator?', answer: 'This calculator auto-splits a weekly total into regular and overtime hours at a threshold you set, and adds a double-time tier. The Work Hours Calculator on this site instead takes pre-split regular and overtime hours and has no double-time tier.' },
        { question: 'Are salaried employees entitled to overtime?', answer: 'Many are not. The FLSA exempts salaried employees who meet certain duties and pay-level tests from overtime rules entirely — this calculator assumes a non-exempt hourly worker.' },
        { question: 'How do I calculate my effective hourly rate with overtime?', answer: 'Divide total pay by total hours paid. $1,232.00 total pay over 50 hours paid (48 worked plus 2 at double time) comes out to about $24.64/hr.' }
      ]
    },
    compute(values) {
      const regularHours = Math.min(values.hoursWorked, values.overtimeThreshold);
      const overtimeHours = Math.max(0, values.hoursWorked - values.overtimeThreshold);
      const regularPay = regularHours * values.hourlyRate;
      const overtimePay = overtimeHours * values.hourlyRate * values.otMultiplier;
      const doubleTimePay = values.doubleTimeHours * values.hourlyRate * values.doubleTimeMultiplier;
      const totalPay = regularPay + overtimePay + doubleTimePay;
      const totalHoursPaid = values.hoursWorked + values.doubleTimeHours;
      const effectiveRate = totalHoursPaid > 0 ? totalPay / totalHoursPaid : 0;
      return { regularHours, overtimeHours, regularPay, overtimePay, doubleTimePay, totalPay, totalHoursPaid, effectiveRate };
    }
  },
  {
    id: 'severance-pay-calculator',
    group: 'Pay & Rates',
    category: 'work',
    glyph: 'wk',
    updatedAt: '2026-11-16',
    aliases: ['severance calculator', 'layoff pay calculator', 'weeks of severance calculator', 'termination pay calculator', 'severance package calculator'],
    related: ['salary-raise-calculator', 'paycheck-calculator', 'pto-calculator', 'overtime-pay-calculator'],
    title: 'Severance Pay Calculator',
    description: 'Estimate severance pay from your salary, years of service and a weeks-per-year formula. A typical-practice estimate, not a legal entitlement — federal law does not require severance pay.',
    example: 'A $78,000 salary ($1,500/week), 6 years of service and a 1.5-week-per-year formula gives an estimated 9 weeks of severance — about $13,500.00.',
    breakdown: {
      headline: 'severancePay',
      headlineLabel: 'Estimated severance pay',
      outputs: [
        { id: 'severancePay', label: 'Estimated severance pay', format: 'currency' },
        { id: 'severanceWeeks', label: 'Severance weeks', format: 'number' },
        { id: 'weeklyPay', label: 'Weekly pay', format: 'currency' }
      ],
      groups: [
        { title: 'Your pay', inputs: ['annualSalary'] },
        { title: 'Tenure & formula', inputs: ['yearsOfService', 'weeksPerYearOfService', 'maxWeeksCap'] }
      ],
      visual: {
        type: 'rangeBar',
        value: 'weeksPerYearOfService',
        bands: [
          { label: 'Below the most common formulas', min: 0, max: 1 },
          { label: 'Most common range (1–2 weeks/year)', min: 1, max: 2 },
          { label: 'Above the most common formulas', min: 2, max: 10 }
        ],
        title: 'Your weeks-per-year formula vs. common practice'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'How severance pay is typically estimated',
        paragraphs: [
          'There is no federal law requiring severance pay at all. The US Department of Labor is explicit: "There is no requirement in the Fair Labor Standards Act (FLSA) for severance pay" — it is entirely a matter of agreement between an employer and an employee, set out in a policy, offer letter or separation agreement.',
          'Despite that, many employers do offer severance, and tenure-based formulas are the most common way to size it. A WorldatWork survey reported by SHRM found "one week per year of service" used by 24% of surveyed employers and "two weeks per year of service" by 16%, with years of service factored in by 92% of organizations in some way — making roughly 1 to 2 weeks of pay per year of service the most commonly cited range, though any individual employer\'s actual policy can fall outside it.',
          'This calculator applies that kind of formula: your weekly pay times your years of service times a multiplier you choose, with an optional overall cap some employers apply regardless of tenure. Treat the result as a starting estimate for a conversation, not a number to expect or demand — your own offer letter, employee handbook or separation agreement is the only authoritative source.'
        ]
      },
      howTo: {
        intro: 'Enter your annual salary and years of service, then the weeks-per-year formula you want to estimate with.',
        steps: [
          { name: 'Enter your annual salary', text: 'Used to find your weekly pay (salary ÷ 52).' },
          { name: 'Enter your years of service', text: 'Fractional years are fine — 6.5 for six and a half years.' },
          { name: 'Set the weeks-per-year-of-service formula', text: 'Use your employer\'s actual formula if you know it, or the commonly cited 1 to 2 weeks per year if you do not.' },
          { name: 'Enter a cap, if any', text: 'Some employers cap total severance regardless of tenure. Enter it in weeks, or leave at 0 for no cap.' },
          { name: 'Read the estimate', text: 'The headline is the estimated severance pay, with the number of weeks and your weekly pay shown below, and a bar comparing your formula to the most commonly cited range.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Weekly pay comes from your annual salary. Severance weeks are tenure times a multiplier, capped if you set one.',
        expression: 'weeklyPay = annualSalary ÷ 52\nseveranceWeeks = min(yearsOfService × weeksPerYearOfService, maxWeeksCap)\nseverancePay = severanceWeeks × weeklyPay',
        terms: [
          { symbol: 'weeksPerYearOfService', meaning: 'Weeks of pay granted per year of service — commonly 1 to 2 in practice, though any individual policy can differ.' },
          { symbol: 'maxWeeksCap', meaning: 'An overall ceiling on severance weeks regardless of tenure, if your employer sets one. Use 0 for no cap.' }
        ],
        note: 'This is a typical-practice estimate, not a legal entitlement. Severance is not required by federal law, and your own offer letter, employee handbook or separation agreement governs the real amount, if any.'
      },
      workedExample: {
        intro: 'A $78,000 salary, 6 years of service, and a 1.5-week-per-year formula with no cap.',
        rows: [
          { label: 'Weekly pay (78,000 ÷ 52)', value: '$1,500.00' },
          { label: 'Severance weeks (6 × 1.5)', value: '9 weeks' },
          { label: 'Severance pay (9 × $1,500.00)', value: '$13,500.00' }
        ],
        result: 'Estimated severance pay $13,500.00 (9 weeks)',
        explanation: 'At $1,500 a week, each year of service is worth 1.5 weeks under this formula, so 6 years of service comes to 9 weeks — $13,500.00 before tax. A longer tenure or a richer multiplier (up to the cap, if any) both scale the result directly.'
      },
      watchOut: [
        { title: 'Severance is not legally required', body: 'The FLSA does not require severance pay of any amount. It is offered entirely at employer discretion, through a policy, offer letter or separation agreement — there is no federal floor to compare against.' },
        { title: 'The WARN Act requires notice, not severance', body: 'Employers with 100 or more employees must give 60 calendar days\' advance notice of a qualifying plant closing or mass layoff under the WARN Act — a notice requirement, separate from and not a substitute for severance pay.' },
        { title: '1 to 2 weeks per year is common, not universal', body: 'The cited WorldatWork/SHRM figures describe the most common formulas among surveyed employers, not a required or average amount. Executives, long-tenured staff and negotiated exits often fall outside this range in either direction.' },
        { title: 'Severance is taxable income', body: 'Severance pay is generally treated as supplemental wages for federal tax withholding, same as a bonus. This calculator shows a pre-tax figure.' },
        { title: 'Severance can affect unemployment benefits', body: 'Depending on your state, receiving severance can delay or reduce when unemployment insurance benefits start. Check with your state unemployment agency for your state\'s rule.' }
      ],
      references: [
        { label: 'U.S. Department of Labor, Severance Pay', url: 'https://www.dol.gov/general/topic/wages/severancepay' },
        { label: 'U.S. Department of Labor, Plant Closings and Layoffs (WARN Act)', url: 'https://www.dol.gov/general/topic/termination/plantclosings' },
        { label: 'SHRM, "M&A Pickup Puts Focus on Severance Policies" (citing a WorldatWork survey)', url: 'https://www.shrm.org/topics-tools/news/benefits-compensation/ma-pickup-puts-focus-severance-policies' }
      ]
    },
    inputs: [
      { id: 'annualSalary', label: 'Annual salary', type: 'currency', placeholder: '78000', defaultValue: 78000, step: 1000, min: 0 },
      { id: 'yearsOfService', label: 'Years of service', type: 'number', placeholder: '6', defaultValue: 6, step: 0.5, min: 0 },
      { id: 'weeksPerYearOfService', label: 'Weeks of pay per year of service', type: 'number', placeholder: '1.5', defaultValue: 1.5, step: 0.5, min: 0 },
      { id: 'maxWeeksCap', label: 'Maximum total weeks (0 = no cap)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    seo: {
      title: 'Severance Pay Calculator – Weeks Per Year of Service',
      description: 'Estimate severance pay from your salary, years of service and a weeks-per-year formula — a typical-practice estimate, not a legal entitlement.',
      faq: [
        { question: 'Is severance pay required by law?', answer: 'No. The US Department of Labor confirms the FLSA has no severance pay requirement. It is offered entirely at employer discretion, under a policy, offer letter or separation agreement.' },
        { question: 'How is severance pay usually calculated?', answer: 'The most common approach ties it to tenure: a WorldatWork survey reported by SHRM found "one week per year of service" used by 24% of employers and "two weeks per year of service" by 16%, making roughly 1 to 2 weeks per year the most commonly cited range.' },
        { question: 'Does the WARN Act require severance pay?', answer: 'No. The WARN Act requires employers with 100+ employees to give 60 calendar days of advance notice before a qualifying plant closing or mass layoff — a notice requirement, not a severance payment.' },
        { question: 'Is severance pay taxable?', answer: 'Yes. Severance is generally treated as supplemental wages for federal withholding purposes, the same category as a bonus. This calculator shows a pre-tax estimate.' },
        { question: 'Can severance affect unemployment benefits?', answer: 'In some states, yes — receiving severance can delay or reduce unemployment insurance benefits. Rules vary by state, so check with your state unemployment agency.' },
        { question: 'What if my employer caps severance?', answer: 'Enter the cap in weeks. For example, 15 years of service at 2 weeks per year would be 30 weeks uncapped, but a 20-week cap would limit the payout to 20 weeks regardless of tenure.' }
      ]
    },
    compute(values) {
      const weeklyPay = values.annualSalary / 52;
      let severanceWeeks = values.yearsOfService * values.weeksPerYearOfService;
      if (values.maxWeeksCap > 0) severanceWeeks = Math.min(severanceWeeks, values.maxWeeksCap);
      const severancePay = severanceWeeks * weeklyPay;
      return { weeklyPay, severanceWeeks, severancePay };
    }
  },
  {
    id: 'cost-of-living-comparison-calculator',
    group: 'Offers & Comparisons',
    category: 'work',
    glyph: 'COL',
    updatedAt: '2026-11-16',
    aliases: ['relocation salary calculator', 'salary equivalent by city calculator', 'cost of living index calculator', 'moving salary comparison calculator', 'city salary comparator'],
    related: ['salary-raise-calculator', 'inflation-calculator', 'job-offer-comparison-calculator', 'paycheck-calculator'],
    title: 'Cost of Living Comparison Calculator',
    description: 'Find the salary you would need in a new city to match your current purchasing power, using a cost-of-living index ratio between two places.',
    example: 'A $70,000 salary in a city indexed at 100 needs $105,000 in a city indexed at 150 to keep the same purchasing power — $35,000 more, a 50% increase.',
    solver: {
      defaultTarget: 'salaryB',
      variables: [
        { id: 'salaryA', label: 'Current salary', symbol: 'SA', dimension: 'currency', defaultValue: 70000, defaultUnit: 'currency' },
        { id: 'indexA', label: 'Current city cost-of-living index', symbol: 'IA', dimension: 'count', defaultValue: 100, defaultUnit: 'count' },
        { id: 'indexB', label: 'New city cost-of-living index', symbol: 'IB', dimension: 'count', defaultValue: 150, defaultUnit: 'count' },
        { id: 'salaryB', label: 'Equivalent salary in the new city', symbol: 'SB', dimension: 'currency', defaultValue: 105000, defaultUnit: 'currency' }
      ],
      // The relationship is one multiplicative ratio, so every variable has a closed form.
      solve: {
        salaryB: ({ salaryA, indexA, indexB }) => (indexA > 0 ? salaryA * (indexB / indexA) : NaN),
        salaryA: ({ salaryB, indexA, indexB }) => (indexB > 0 ? salaryB * (indexA / indexB) : NaN),
        indexB: ({ salaryA, salaryB, indexA }) => (salaryA > 0 ? (salaryB * indexA) / salaryA : NaN),
        indexA: ({ salaryA, salaryB, indexB }) => (salaryB > 0 ? (salaryA * indexB) / salaryB : NaN)
      },
      outputs: [
        { id: 'difference', label: 'Difference needed', dimension: 'currency', compute: (si) => si.salaryB - si.salaryA },
        { id: 'percentMore', label: 'Percent more (or less) needed', dimension: 'percent', compute: (si) => (si.indexA > 0 ? (si.indexB / si.indexA - 1) * 100 : NaN) }
      ],
      visuals: [{ type: 'compareBars', bars: [{ from: 'salaryA', label: 'Current salary' }, { from: 'salaryB', label: 'Equivalent salary' }], title: 'Current salary vs. equivalent salary in the new city' }]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What a cost-of-living index ratio actually compares',
        paragraphs: [
          'A cost-of-living index scores a place against a baseline, usually the national average set at 100: an index of 150 means that place is 50% more expensive than average, and 80 means 20% less expensive. The Council for Community and Economic Research (C2ER) publishes the best-known composite index of this kind, covering 60 goods and services across six categories — groceries, housing, utilities, transportation, health care and miscellaneous goods and services — priced quarterly in each participating area.',
          'Because both index numbers sit on the same scale, the ratio between two cities\' index values tells you how much more (or less) it costs to buy the same basket of goods in one place versus the other. Multiplying your current salary by that ratio gives the salary that would buy the same purchasing power in the new city — the core relocation-salary question.',
          'The US Bureau of Labor Statistics is explicit that its own Consumer Price Index (CPI) cannot be used this way: "No, an individual area index measures how much prices have changed over a specific period in that particular area; it does not show whether prices or living costs are higher or lower in that area relative to another." The CPI tracks price change over time in one place; a cost-of-living index like C2ER\'s is built specifically to compare price levels between places. This calculator does the ratio arithmetic — it does not supply index numbers for you, so use figures from a published cost-of-living index for the two cities you are comparing.'
        ]
      },
      howTo: {
        intro: 'Enter your current salary and city, then the index numbers for your current and prospective city from a published cost-of-living index.',
        steps: [
          { name: 'Enter your current salary', text: 'Always an input — the anchor the comparison is calculated from.' },
          { name: 'Enter your current city\'s index', text: 'Look it up from a published cost-of-living index (such as C2ER\'s). 100 represents the national average in most indexes.' },
          { name: 'Enter the new city\'s index', text: 'From the same index source as your current city — mixing sources can give a meaningless ratio.' },
          { name: 'Read the equivalent salary', text: 'The calculator scales your salary by the ratio of the two index numbers, with the dollar difference and percent change shown below.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The new salary scales the old one by the ratio of the two cities\' index numbers.',
        expression: 'salaryB = salaryA × (indexB ÷ indexA)\ndifference = salaryB − salaryA\npercentMore = (indexB ÷ indexA − 1) × 100',
        terms: [
          { symbol: 'indexA', meaning: 'Cost-of-living index of your current city, on whatever baseline your source uses (typically national average = 100).' },
          { symbol: 'indexB', meaning: 'Cost-of-living index of the city you are comparing to, from the same source and baseline as indexA.' }
        ],
        note: 'Estimates only. A cost-of-living index compares a basket of consumer prices — it does not capture quality of life, climate, state and local income tax differences, or how your own spending differs from the index\'s assumed household.'
      },
      workedExample: {
        intro: 'A $70,000 salary in a city indexed at 100 (the national average). The new city is indexed at 150.',
        rows: [
          { label: 'Ratio (150 ÷ 100)', value: '1.50' },
          { label: 'Equivalent salary (70,000 × 1.50)', value: '$105,000.00' },
          { label: 'Difference (105,000 − 70,000)', value: '$35,000.00' },
          { label: 'Percent more needed ((1.50 − 1) × 100)', value: '50.00%' }
        ],
        result: 'Equivalent salary $105,000.00 — $35,000.00 more (50% higher)',
        explanation: 'The new city\'s index is 1.5 times the current city\'s, so it takes 1.5 times the salary — $105,000 instead of $70,000 — to buy the same basket of goods and services that the index tracks.'
      },
      watchOut: [
        { title: 'The CPI cannot be used for this comparison', body: 'The BLS is explicit that an individual area\'s Consumer Price Index measures price change over time in that one area, not price levels relative to another area. Use a cost-of-living index built for cross-area comparison (such as C2ER\'s) instead, not CPI figures.' },
        { title: 'Index baskets skew toward professional households', body: 'C2ER\'s weights are based on expenditure patterns for professional and executive households, which may not match your own spending — a renter, a large family or someone without a car will experience costs differently than the index basket assumes.' },
        { title: 'Quality of life is not in the index', body: 'Climate, commute times, school quality, safety and cultural amenities all affect whether a move is worth it, and none of them are priced into a cost-of-living index.' },
        { title: 'Taxes are not included either', body: 'State and local income, sales and property taxes can differ sharply between cities and are not part of a cost-of-living index\'s basket — layer them on separately.' },
        { title: 'Use index numbers from the same source', body: 'Different publishers (C2ER, Numbeo, and others) use different baselines, baskets and survey methods. Compare two cities using index numbers from one consistent source, never one city\'s index from one source against another city\'s index from a different one.' }
      ],
      references: [
        { label: 'U.S. Bureau of Labor Statistics, Consumer Price Index Frequently Asked Questions', url: 'https://www.bls.gov/cpi/questions-and-answers.htm' },
        { label: 'Council for Community and Economic Research (C2ER), What Is the Cost of Living Index?', url: 'https://www.coli.org/about/what-is-coli/' },
        { label: 'Council for Community and Economic Research (C2ER), Cost of Living Index Methodology', url: 'https://c2c.coli.org/compare.asp?action=methodology' }
      ]
    },
    inputs: [
      { id: 'salaryA', label: 'Current salary', type: 'currency', placeholder: '70000', defaultValue: 70000, step: 1000, min: 0 },
      { id: 'indexA', label: 'Current city cost-of-living index', type: 'number', placeholder: '100', defaultValue: 100, step: 1, min: 0 },
      { id: 'indexB', label: 'New city cost-of-living index', type: 'number', placeholder: '150', defaultValue: 150, step: 1, min: 0 }
    ],
    seo: {
      title: 'Cost of Living Comparison Calculator – Salary by City',
      description: 'Find the salary you need in a new city to match your current purchasing power, using a cost-of-living index ratio between two cities.',
      faq: [
        { question: 'How do I calculate the salary I need in a new city?', answer: 'Multiply your current salary by the ratio of the two cities\' cost-of-living index numbers. A $70,000 salary at an index of 100, moving to a city indexed at 150, needs 70,000 × (150 ÷ 100) = $105,000.' },
        { question: 'Can I use the CPI to compare cost of living between cities?', answer: 'No. The Bureau of Labor Statistics states its area CPI figures measure price change over time within one area, not price levels relative to another area. Use a cost-of-living index built for cross-area comparison instead, such as C2ER\'s.' },
        { question: 'What does a cost-of-living index number mean?', answer: 'Most indexes, including C2ER\'s, set the national average at 100. A score of 150 means 50% more expensive than average; a score of 80 means 20% less expensive.' },
        { question: 'What goes into a cost-of-living index?', answer: 'C2ER\'s composite index covers 60 goods and services across six categories: groceries, housing, utilities, transportation, health care, and miscellaneous goods and services, priced quarterly in each participating area.' },
        { question: 'Does this account for state and local taxes?', answer: 'No. Cost-of-living indexes price a basket of consumer goods and services; income, sales and property tax differences between cities are separate and not included.' },
        { question: 'Why does the index not match my own experience?', answer: 'The weights behind indexes like C2ER\'s are based on expenditure patterns for professional and executive households. Your own spending on housing size, transportation and health care may differ from that assumed basket.' }
      ]
    },
    compute(values) {
      const salaryB = values.indexA > 0 ? values.salaryA * (values.indexB / values.indexA) : 0;
      const difference = salaryB - values.salaryA;
      const percentMore = values.indexA > 0 ? (values.indexB / values.indexA - 1) * 100 : 0;
      return { salaryB, difference, percentMore };
    }
  },
  {
    id: 'remote-work-savings-calculator',
    group: 'Time & Benefits',
    category: 'work',
    glyph: 'WFH',
    updatedAt: '2026-11-16',
    aliases: ['work from home savings calculator', 'WFH savings calculator', 'telecommute savings calculator', 'remote work cost savings calculator', 'hybrid work savings calculator'],
    related: ['commute-cost-calculator', 'pto-calculator', 'freelancer-rate-calculator', 'paycheck-calculator'],
    title: 'Remote Work Savings Calculator',
    description: 'Calculate the money and time you save by working from home some days a week, using the same fuel, parking, tolls and wear cost model as the commute cost calculator, plus hours saved.',
    example: 'Skipping a 25-mile, $26.38-a-day commute 2 days a week saves about $228.58 a month ($2,743 a year) and about 95 hours a year, with a 55-minute round-trip commute.',
    breakdown: {
      headline: 'monthlySavings',
      headlineLabel: 'Money saved per month',
      outputs: [
        { id: 'monthlySavings', label: 'Money saved per month', format: 'currency' },
        { id: 'annualSavings', label: 'Money saved per year', format: 'currency' },
        { id: 'monthlyHoursSaved', label: 'Hours saved per month', format: 'number' },
        { id: 'annualHoursSaved', label: 'Hours saved per year', format: 'number' },
        { id: 'fullTimeMonthlyCost', label: 'Commuting cost if you went in every day', format: 'currency' },
        { id: 'partialMonthlyCost', label: 'Commuting cost with your work-from-home days', format: 'currency' }
      ],
      groups: [
        { title: 'Your schedule', inputs: ['workDaysPerWeek', 'wfhDaysPerWeek'] },
        { title: 'Your commute cost (same model as the commute cost calculator)', inputs: ['roundTripMiles', 'mpg', 'gasPricePerGallon', 'dailyParking', 'dailyTolls', 'wearCostPerMile'] },
        { title: 'Your commute time', inputs: ['roundTripCommuteMinutes'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'fullTimeMonthlyCost', label: 'Commuting every day' },
          { from: 'partialMonthlyCost', label: 'With your WFH days' }
        ],
        title: 'Monthly commuting cost: every day vs. with work-from-home days'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What working from home actually saves',
        paragraphs: [
          'This calculator reuses the exact per-day commuting cost model from the Commute Cost Calculator on this site: fuel plus parking plus tolls plus a per-mile wear allowance. Every day you work from home instead of driving in, that whole daily cost disappears — so the savings from going remote some days a week are just the days you skip, multiplied by what each of those days was costing.',
          'It adds one thing the commute cost calculator deliberately leaves out: time. A round trip has a cost in minutes as well as dollars, and the US Census Bureau\'s American Community Survey found the average one-way commute in the United States reached 27.6 minutes in 2019 — meaning a round trip close to an hour is typical. Skipping that commute on a work-from-home day gives back real time, not just money, which this calculator totals separately alongside the dollar savings.',
          'The result works for any mix: a fully remote switch (all days become work-from-home days), a hybrid schedule (some days in, some at home), or testing how much one more remote day a week would be worth before asking for it.'
        ]
      },
      howTo: {
        intro: 'Enter your work schedule, then the same commute inputs as the commute cost calculator, then your round-trip commute time.',
        steps: [
          { name: 'Enter your work schedule', text: 'Total work days a week, and how many of those are now (or would be) worked from home.' },
          { name: 'Enter your commute cost inputs', text: 'Round-trip distance, fuel economy and price, daily parking and tolls, and a per-mile wear allowance — the same fields as the Commute Cost Calculator.' },
          { name: 'Enter your round-trip commute time', text: 'How long the drive takes there and back, in minutes.' },
          { name: 'Read the savings', text: 'Monthly and yearly money saved are the headline figures, with hours saved and the before/after monthly cost shown below.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'One day of commuting costs the same as in the Commute Cost Calculator; savings come from the days you no longer drive.',
        expression:
          'dailyCost = (roundTripMiles ÷ mpg × gasPrice) + dailyParking + dailyTolls + (roundTripMiles × wearCostPerMile)\nmonthlySavings = dailyCost × wfhDaysPerWeek × (52 ÷ 12)\nannualSavings = dailyCost × wfhDaysPerWeek × 52\nhoursSaved = roundTripCommuteMinutes × wfhDaysPerWeek × weeks ÷ 60',
        terms: [
          { symbol: 'dailyCost', meaning: 'The same fuel + parking + tolls + wear cost as one day in the Commute Cost Calculator.' },
          { symbol: 'wfhDaysPerWeek', meaning: 'Days per week you work from home instead of commuting.' },
          { symbol: 'roundTripCommuteMinutes', meaning: 'Total door-to-door commute time, there and back, on a day you do drive in.' }
        ],
        note: 'An estimate, inheriting the same caveats as the commute cost calculator: fuel prices and parking rates change, and the wear rate is a chosen allowance, not a measured cost.'
      },
      workedExample: {
        intro: 'A 25-mile round trip at 30 mpg, gas at $3.75/gal, $15/day parking, $3/day tolls, 21 cents/mile wear — the same scenario as the Commute Cost Calculator\'s example, costing $26.38 a day. You work 5 days a week and now work from home 2 of them, with a 55-minute round-trip commute.',
        rows: [
          { label: 'Daily commute cost (fuel + parking + tolls + wear)', value: '$26.38' },
          { label: 'Full-time monthly cost (26.38 × 5 × 52 ÷ 12)', value: '$571.46' },
          { label: 'With 2 WFH days a week (26.38 × 3 × 52 ÷ 12)', value: '$342.88' },
          { label: 'Monthly savings (571.46 − 342.88)', value: '$228.58' },
          { label: 'Annual savings (228.58 × 12)', value: '$2,743.00' },
          { label: 'Monthly hours saved (55 × 2 × 52 ÷ 12 ÷ 60)', value: '7.94 hours' },
          { label: 'Annual hours saved (55 × 2 × 52 ÷ 60)', value: '95.33 hours' }
        ],
        result: '$228.58 saved a month ($2,743 a year), plus about 95 hours a year',
        explanation: 'Dropping from 5 commute days to 3 cuts the monthly cost by exactly the 2 skipped days\' worth — $228.58 — and 95.33 hours a year is close to twelve 8-hour workdays of time (11.92) given back by not driving.'
      },
      watchOut: [
        { title: 'Uses the same model as the Commute Cost Calculator', body: 'This is not a different cost formula — it is the Commute Cost Calculator\'s per-day cost applied to the days you skip. Use that calculator directly if you just want today\'s full commuting cost without a work-from-home comparison.' },
        { title: 'Time saved is not automatically money', body: 'The hours saved figure is a time total, not a dollar value — this calculator does not convert it to income. What that time is worth depends on what you do with it.' },
        { title: 'Working from home has its own costs', body: 'Higher home electricity and internet use, a dedicated workspace, and potentially more home-cooked meals can offset some of the commuting savings — this calculator only prices the commute side.' },
        { title: 'Averages hide real variation', body: 'The 27.6-minute national average one-way commute (US Census Bureau, 2019) varies enormously by metro area and route; use your own actual commute time, not the national figure, for an accurate result.' },
        { title: 'Weeks-per-month uses an average', body: 'Monthly figures use 52 ÷ 12 ≈ 4.33 weeks per month, an average that does not exactly match every calendar month.' }
      ],
      references: [
        { label: 'U.S. Census Bureau, "One-Way Travel Time to Work Rises"', url: 'https://www.census.gov/newsroom/press-releases/2021/one-way-travel-time-to-work-rises.html' },
        { label: 'Internal Revenue Service, Publication 463: Travel, Gift, and Car Expenses (commuting expenses)', url: 'https://www.irs.gov/publications/p463' }
      ]
    },
    inputs: [
      { id: 'workDaysPerWeek', label: 'Work days per week', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 },
      { id: 'wfhDaysPerWeek', label: 'Work-from-home days per week', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 },
      { id: 'roundTripMiles', label: 'Round-trip commute distance', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 0, dimension: 'length', unit: 'mi' },
      { id: 'mpg', label: 'Vehicle fuel economy', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1, dimension: 'fuelEconomy', unit: 'mpg' },
      { id: 'gasPricePerGallon', label: 'Fuel price', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0, dimension: 'fuelPrice', unit: 'cur/gal' },
      { id: 'dailyParking', label: 'Daily parking cost', type: 'currency', placeholder: '15', defaultValue: 15, step: 1, min: 0 },
      { id: 'dailyTolls', label: 'Daily tolls', type: 'currency', placeholder: '3', defaultValue: 3, step: 0.25, min: 0 },
      { id: 'wearCostPerMile', label: 'Vehicle wear per mile', type: 'currency', placeholder: '0.21', defaultValue: 0.21, step: 0.01, min: 0 },
      { id: 'roundTripCommuteMinutes', label: 'Round-trip commute time (minutes)', type: 'number', placeholder: '55', defaultValue: 55, step: 1, min: 0 }
    ],
    seo: {
      title: 'Remote Work Savings Calculator – Money & Time Saved',
      description: 'Calculate the money and time you save working from home some days a week, using the same cost model as the commute cost calculator.',
      faq: [
        { question: 'How much money does working from home save?', answer: 'Multiply your daily commute cost by the work-from-home days you add each week, then by about 4.33 weeks a month. Skipping a $26.38 day 2 days a week saves about $228.58 a month, $2,743 a year.' },
        { question: 'How much time does working from home save?', answer: 'Multiply your round-trip commute time by your work-from-home days per week and the weeks in the period. A 55-minute round trip, 2 days a week, saves about 95 hours a year — close to twelve 8-hour workdays.' },
        { question: 'How is this different from the commute cost calculator?', answer: 'It uses the exact same per-day cost model, but applies it to the days you skip by working from home, and adds a time-saved figure the commute cost calculator does not include.' },
        { question: 'What is the average US commute?', answer: 'The US Census Bureau\'s American Community Survey found the average one-way commute reached 27.6 minutes in 2019 — close to an hour round trip, which is why this calculator defaults to 55 minutes.' },
        { question: 'Does this account for the cost of working from home?', answer: 'No. It only prices the commuting side. Extra home electricity, internet and workspace costs would offset some of the savings, but are not modeled here.' },
        { question: 'Can I use this for a fully remote job?', answer: 'Yes. Set work-from-home days per week equal to your total work days per week to see the full value of not commuting at all.' }
      ]
    },
    compute(values) {
      const weeksPerMonth = 52 / 12;
      const dailyFuelCost = (values.roundTripMiles / values.mpg) * values.gasPricePerGallon;
      const dailyWear = values.roundTripMiles * values.wearCostPerMile;
      const dailyCost = dailyFuelCost + values.dailyParking + values.dailyTolls + dailyWear;
      const commuteDaysPerWeek = Math.max(0, values.workDaysPerWeek - values.wfhDaysPerWeek);
      const fullTimeMonthlyCost = dailyCost * values.workDaysPerWeek * weeksPerMonth;
      const partialMonthlyCost = dailyCost * commuteDaysPerWeek * weeksPerMonth;
      const monthlySavings = fullTimeMonthlyCost - partialMonthlyCost;
      const annualSavings = monthlySavings * 12;
      const monthlyHoursSaved = (values.roundTripCommuteMinutes * values.wfhDaysPerWeek * weeksPerMonth) / 60;
      const annualHoursSaved = (values.roundTripCommuteMinutes * values.wfhDaysPerWeek * 52) / 60;
      return { fullTimeMonthlyCost, partialMonthlyCost, monthlySavings, annualSavings, monthlyHoursSaved, annualHoursSaved };
    }
  },
  {
    id: 'job-offer-comparison-calculator',
    group: 'Offers & Comparisons',
    category: 'work',
    glyph: 'A/B',
    updatedAt: '2026-11-16',
    aliases: ['compare two job offers calculator', 'total compensation comparison calculator', 'offer letter comparison calculator', 'which job offer is better calculator', 'salary offer comparison calculator'],
    related: ['salary-raise-calculator', 'cost-of-living-comparison-calculator', 'pto-calculator', 'paycheck-calculator'],
    title: 'Job Offer Comparison Calculator',
    description: 'Compare two job offers side by side on total compensation: base salary, bonus and the dollar value of benefits, with the full dollar and percent difference between them.',
    example: 'Offer A ($85,000 base + $5,000 bonus + $10,000 benefits = $100,000 total) vs. Offer B ($90,000 + $4,000 + $9,000 = $103,000) — Offer B is $3,000 (3%) higher in total compensation.',
    breakdown: {
      headline: 'difference',
      headlineLabel: 'Difference in total compensation (B − A)',
      outputs: [
        { id: 'difference', label: 'Difference in total compensation (B − A)', format: 'currency' },
        { id: 'totalCompA', label: 'Offer A total compensation', format: 'currency' },
        { id: 'totalCompB', label: 'Offer B total compensation', format: 'currency' },
        { id: 'percentDifference', label: 'Percent difference (vs. Offer A)', format: 'percent' }
      ],
      groups: [
        { title: 'Offer A', inputs: ['baseSalaryA', 'bonusA', 'benefitsValueA'] },
        { title: 'Offer B', inputs: ['baseSalaryB', 'bonusB', 'benefitsValueB'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'totalCompA', label: 'Offer A' },
          { from: 'totalCompB', label: 'Offer B' }
        ],
        title: 'Total compensation: Offer A vs. Offer B'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'Comparing offers on total compensation, not just salary',
        paragraphs: [
          'Base salary is the easiest number to compare between two job offers, but it is rarely the whole picture. A bonus (signing, target annual, or both) and the dollar value of benefits — health insurance, retirement matching, extra PTO, and anything else your employer prices in dollars — all add to what an offer is actually worth. This calculator adds the three together for each offer and compares the totals directly.',
          'The US Bureau of Labor Statistics\' Employer Costs for Employee Compensation survey found that benefits made up 30.0% of total compensation for private-industry workers in June 2026, with wages and salaries making up the rest — a useful reminder that benefits are not a rounding error on top of salary, but a substantial share of what a job actually pays. If an offer letter does not state a dollar value for benefits, ask your recruiter or HR contact for one rather than leaving it at zero.',
          'This calculator does not try to value your benefits for you — it takes whatever figure you enter, so the comparison is only as accurate as the benefits values you supply. Use the same estimation approach for both offers so the comparison is apples to apples.'
        ]
      },
      howTo: {
        intro: 'Enter base salary, bonus and benefits value for each offer. Everything is annual.',
        steps: [
          { name: 'Enter Offer A\'s numbers', text: 'Base salary, expected annual bonus (0 if none or unknown), and the dollar value of benefits (health insurance, retirement match, extra PTO, and so on).' },
          { name: 'Enter Offer B\'s numbers', text: 'The same three figures for the offer you are comparing it to.' },
          { name: 'Read the comparison', text: 'The headline is the dollar difference between the two totals, with each offer\'s total compensation and the percent difference shown below, and a bar chart comparing them.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each offer\'s total is just its three parts added together; the comparison is the difference and percent difference between the two totals.',
        expression: 'totalCompA = baseSalaryA + bonusA + benefitsValueA\ntotalCompB = baseSalaryB + bonusB + benefitsValueB\ndifference = totalCompB − totalCompA\npercentDifference = (difference ÷ totalCompA) × 100',
        terms: [
          { symbol: 'benefitsValueA / benefitsValueB', meaning: 'Your own estimate of the annual dollar value of each offer\'s benefits — this calculator does not estimate it for you.' }
        ],
        note: 'A straightforward total, not a full financial comparison. It does not account for differing tax treatment of bonus versus salary, vesting schedules on equity, or cost-of-living differences if the two offers are in different cities — use the Cost of Living Comparison Calculator alongside this one if that applies.'
      },
      workedExample: {
        intro: 'Offer A: $85,000 base, $5,000 expected bonus, $10,000 of benefits value. Offer B: $90,000 base, $4,000 expected bonus, $9,000 of benefits value.',
        rows: [
          { label: 'Offer A total (85,000 + 5,000 + 10,000)', value: '$100,000.00' },
          { label: 'Offer B total (90,000 + 4,000 + 9,000)', value: '$103,000.00' },
          { label: 'Difference (103,000 − 100,000)', value: '$3,000.00' },
          { label: 'Percent difference (3,000 ÷ 100,000 × 100)', value: '3.00%' }
        ],
        result: 'Offer B is $3,000.00 higher in total compensation (3.00% more)',
        explanation: 'Offer B\'s higher base salary ($5,000 more) more than makes up for its smaller bonus and benefits value (a combined $2,000 less), leaving it $3,000 ahead in total compensation even though neither of its individual components is the largest on its own.'
      },
      watchOut: [
        { title: 'Benefits value is only as good as your estimate', body: 'This calculator does not price benefits for you. Nationally, benefits make up roughly 30% of total compensation for private-industry workers according to the BLS — a useful sanity check if an offer\'s benefits figure looks unusually small or large relative to its base salary.' },
        { title: 'Bonuses are often not guaranteed', body: 'A "target" annual bonus is typically contingent on company or individual performance, unlike base salary. Treat a bonus figure as an expected value, not a certainty, when comparing offers.' },
        { title: 'Equity is not modeled here', body: 'Stock options or RSUs have their own vesting schedules and uncertain future value, which this calculator does not attempt to price into the comparison — add your own estimate into benefits value if you want to include it.' },
        { title: 'Different cities need a cost-of-living adjustment', body: 'A higher total compensation number is not automatically a better offer if it comes with a much higher cost of living. Use the Cost of Living Comparison Calculator to adjust for that before comparing.' },
        { title: 'Taxes are not applied here', body: 'This compares gross (pre-tax) totals. Bonus income is often withheld at a different supplemental-wage rate than salary, which this calculator does not model.' }
      ],
      references: [
        { label: 'U.S. Bureau of Labor Statistics, Employer Costs for Employee Compensation – June 2026', url: 'https://www.bls.gov/news.release/pdf/ecec.pdf' }
      ]
    },
    inputs: [
      { id: 'baseSalaryA', label: 'Offer A: base salary', type: 'currency', placeholder: '85000', defaultValue: 85000, step: 1000, min: 0 },
      { id: 'bonusA', label: 'Offer A: annual bonus', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 500, min: 0 },
      { id: 'benefitsValueA', label: 'Offer A: annual benefits value', type: 'currency', placeholder: '10000', defaultValue: 10000, step: 500, min: 0 },
      { id: 'baseSalaryB', label: 'Offer B: base salary', type: 'currency', placeholder: '90000', defaultValue: 90000, step: 1000, min: 0 },
      { id: 'bonusB', label: 'Offer B: annual bonus', type: 'currency', placeholder: '4000', defaultValue: 4000, step: 500, min: 0 },
      { id: 'benefitsValueB', label: 'Offer B: annual benefits value', type: 'currency', placeholder: '9000', defaultValue: 9000, step: 500, min: 0 }
    ],
    seo: {
      title: 'Job Offer Comparison Calculator – Total Compensation',
      description: 'Compare two job offers on total compensation: base salary, bonus and benefits value, with the full dollar and percent difference between them.',
      faq: [
        { question: 'How do I compare two job offers fairly?', answer: 'Add base salary, expected bonus and the dollar value of benefits for each offer, then compare the totals. Offer A at $100,000 total vs. Offer B at $103,000 total means B is $3,000 (3%) ahead.' },
        { question: 'What counts as benefits value?', answer: 'Anything your employer prices in dollars beyond salary and bonus: health insurance, retirement plan matching, extra PTO, and similar. Ask your recruiter or HR contact for a figure if the offer letter does not state one.' },
        { question: 'How much are benefits usually worth compared to salary?', answer: 'The BLS Employer Costs for Employee Compensation survey found benefits made up 30.0% of total compensation for private-industry workers in June 2026 — a general benchmark, not a figure specific to any one offer.' },
        { question: 'Should I include a bonus that is not guaranteed?', answer: 'You can, but treat it as an expected value rather than certain income — an offer with a large "target" bonus and a small guaranteed base carries more risk than one weighted toward base salary.' },
        { question: 'Does this account for cost of living if the offers are in different cities?', answer: 'No. Use the Cost of Living Comparison Calculator alongside this one to adjust either offer for a different city\'s cost of living before comparing totals.' },
        { question: 'Does this calculator value stock options or RSUs for me?', answer: 'No. Equity has its own vesting schedule and uncertain value. Add your own estimate into the benefits value field if you want to fold it into the comparison.' }
      ]
    },
    compute(values) {
      const totalCompA = values.baseSalaryA + values.bonusA + values.benefitsValueA;
      const totalCompB = values.baseSalaryB + values.bonusB + values.benefitsValueB;
      const difference = totalCompB - totalCompA;
      const percentDifference = totalCompA > 0 ? (difference / totalCompA) * 100 : 0;
      return { totalCompA, totalCompB, difference, percentDifference };
    }
  }
];
