import type { CalculatorConfig } from './types.ts';

export const insuranceCalculators: CalculatorConfig[] = [
  {
    id: 'human-life-value-calculator',
    category: 'insurance',
    glyph: 'HLV',
    updatedAt: '2026-11-18',
    aliases: ['human life value method calculator', 'life insurance needs calculator', 'how much life insurance do i need', 'present value of future earnings calculator', 'income replacement life insurance calculator'],
    related: ['retirement-savings-calculator', 'paycheck-calculator', 'debt-to-income-calculator', 'inflation-calculator'],
    title: 'Human Life Value Calculator',
    description: 'Estimate a life insurance coverage benchmark with the human life value method: the present value of the income you would otherwise have earned and spent on dependents, after your own living costs and a discount rate.',
    example: 'A 40-year-old earning $80,000 a year, working 25 more years, who spends about 20% of that income on themselves, has a human life value of roughly $999,813 at a 4% discount rate.',
    breakdown: {
      headline: 'humanLifeValue',
      headlineLabel: 'Human life value',
      outputs: [
        { id: 'humanLifeValue', format: 'currency' },
        { id: 'netAnnualIncome', label: 'Income available to dependents (per year)', format: 'currency' },
        { id: 'undiscountedTotal', label: 'Same income, undiscounted total', format: 'currency' },
        { id: 'discountSavingsPercent', label: 'How much the discount lowers the raw total', format: 'percent' }
      ],
      groups: [
        { title: 'Income', inputs: ['annualIncome', 'personalConsumptionPercent'] },
        { title: 'Time and discounting', inputs: ['yearsToRetirement', 'discountRate'] }
      ],
      derive: (v) => {
        const netAnnualIncome = v.annualIncome * (1 - v.personalConsumptionPercent / 100);
        const undiscountedTotal = netAnnualIncome * v.yearsToRetirement;
        return { netAnnualIncome, undiscountedTotal };
      },
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'humanLifeValue', label: 'Human life value (discounted)' },
          { from: 'undiscountedTotal', label: 'Same income, undiscounted' }
        ],
        title: 'Discounting lowers the raw total',
        highlight: 0
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is the human life value method?',
        paragraphs: [
          'The human life value (HLV) method prices a life insurance need the way an economist would price any future income stream: as the present value of what a person would have earned and contributed to their household, had they lived. It is one of several competing methods used to estimate life insurance need — the DIME method (debt, income, mortgage, education) is another, built around obligations rather than earnings — and the two will not generally agree, because they are measuring different things.',
          "Guardian Life, a life insurer, describes the HLV theory as holding that someone should carry life insurance equal to the present value of their expected future earnings, and publishes a simplified version as an age-based multiplier of income (for example, 30 times income at ages 18-40, falling to 10 times by ages 61-65) as a shortcut. This calculator does the fuller present-value calculation behind that idea directly, rather than reading a multiplier off an age band, so the answer reflects your own income, time horizon and discount-rate assumption instead of a one-size age bracket.",
          "Two adjustments matter before you discount anything. First, not all income reaches dependents: some of it was always going to be spent on the earner's own food, clothing and personal expenses, and that share is not a loss to the household if they are gone. Second, a dollar received 20 years from now is worth less today than a dollar in hand, because money received sooner can be invested and grow — which is exactly what a discount rate measures.",
          'The result is a benchmark, not a guarantee of what any insurer will sell or price. It is most useful as one of two or three starting points — alongside DIME or an insurer-specific needs questionnaire — before talking to a licensed agent, not as a number to act on by itself.'
        ]
      },
      howTo: {
        intro: 'Enter your income, how much of it is personal spending, how many years of earning you have left, and a discount rate; the calculator does the present-value arithmetic.',
        steps: [
          { name: 'Enter your annual income', text: 'Use your gross (pre-tax) salary or self-employment income — whatever amount your household currently depends on.' },
          { name: 'Set your personal consumption share', text: 'Estimate the percentage of that income that goes to your own food, clothing and personal spending rather than the household. 15-25% is a common planning range; a solo earner supporting several dependents is often toward the low end.' },
          { name: 'Enter years to retirement', text: 'How many more years you expect to earn this income, roughly to a planned retirement age.' },
          { name: 'Choose a discount rate', text: 'An assumed long-run rate of return the household could earn by investing a lump sum instead of receiving it year by year. A higher rate lowers the result, because it assumes the money grows faster on its own.' },
          { name: 'Read the result', text: 'The headline is the discounted human life value — the coverage benchmark. The bars below it show how much higher the number would be without any discounting at all, so you can see what the discount rate assumption is actually doing to the figure.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The household\'s usable income each year is multiplied by the present-value-of-an-annuity factor for the remaining working years at the chosen discount rate.',
        expression: 'I = A × (1 − c)\nHLV = I × [1 − (1 + r)⁻ⁿ] ÷ r',
        terms: [
          { symbol: 'A', meaning: 'Annual income.' },
          { symbol: 'c', meaning: 'Personal consumption share, as a decimal (20% is 0.20) — the portion of income that would have been spent on the earner alone.' },
          { symbol: 'I', meaning: 'Income available to dependents each year, after removing the personal-consumption share.' },
          { symbol: 'r', meaning: 'Annual discount rate, as a decimal.' },
          { symbol: 'n', meaning: 'Years of earning left (to retirement).' },
          { symbol: 'HLV', meaning: 'Human life value — the present value of that income stream, and the coverage benchmark this method produces.' }
        ],
        note: 'When r is 0, the formula reduces to HLV = I × n (no discounting). This is an income-replacement estimate, not a quote — it ignores taxes, raises, inflation and any coverage you already have.'
      },
      workedExample: {
        intro: 'A 40-year-old earns $80,000 a year, expects to work 25 more years, spends about 20% of that income on personal expenses, and the household assumes a 4% long-run discount rate.',
        rows: [
          { label: 'Income available to dependents (I = $80,000 × (1 − 0.20))', value: '$64,000' },
          { label: 'Annuity factor ([1 − 1.04⁻²⁵] ÷ 0.04)', value: '15.622' },
          { label: 'Human life value (HLV = $64,000 × 15.622)', value: '$999,813' },
          { label: 'Same income, undiscounted ($64,000 × 25)', value: '$1,600,000' },
          { label: 'Discounting lowers the raw total by', value: '37.5%' }
        ],
        result: 'HLV ≈ $999,813',
        explanation: 'Discounting the 25 years of $64,000 instead of simply adding them up cuts the total by about 37.5% — ($1,600,000 − $999,813) ÷ $1,600,000. That gap is the entire point of using a discount rate: a lump sum paid today could itself earn 4% a year, so it takes less than 25 flat years of income to replace 25 years of income received gradually.'
      },
      watchOut: [
        { title: 'This is an educational estimate, not a quote or an offer to sell insurance', body: 'This calculator estimates a coverage benchmark for your own planning. It does not sell, recommend or bind any policy, and is not a substitute for a licensed insurance agent or financial advisor who can account for your full situation.' },
        { title: 'The discount rate assumption drives the answer as much as income does', body: 'Raising the assumed rate from 4% to 7% in the worked example above would cut the result by roughly a third, with no change at all to income or years. Pick a rate you would genuinely expect a lump sum to earn, and try more than one rate to see the range.' },
        { title: 'It ignores taxes, raises and inflation', body: 'Real income tends to rise over a career, and the household\'s own spending need tends to rise with inflation too. This simple version holds income flat; a more detailed plan would grow both and then discount the difference.' },
        { title: 'It does not subtract coverage you already have', body: 'If you already carry a group policy through work or an existing term policy, subtract its death benefit from this result to see the remaining gap, rather than treating this number as the total policy size to buy.' },
        { title: 'DIME and HLV answer different questions and will not match', body: 'HLV prices lost income; DIME prices specific debts and obligations. Treat a large gap between the two methods as a reason to look closer, not as a sign that one of them is wrong.' }
      ],
      references: [
        { label: 'Guardian Life, "How Much Life Insurance Do You Need?" (human life value theory and age-based income multiples)', url: 'https://www.guardianlife.com/life-insurance/how-much-do-i-need' },
        { label: 'Insurance Information Institute, "How much life insurance do I need?"', url: 'https://www.iii.org/article/how-much-life-insurance-do-i-need' },
        { label: 'Insurance Information Institute, "What are the principal types of life insurance?"', url: 'https://www.iii.org/article/what-are-the-principal-types-of-life-insurance' }
      ]
    },
    inputs: [
      { id: 'annualIncome', label: 'Annual income', type: 'currency', placeholder: '80000', defaultValue: 80000, step: 1000, min: 0 },
      { id: 'personalConsumptionPercent', label: 'Personal consumption share', type: 'percent', placeholder: '20', defaultValue: 20, step: 1, min: 0 },
      { id: 'yearsToRetirement', label: 'Years to retirement', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 0 },
      { id: 'discountRate', label: 'Discount rate', type: 'percent', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'Human Life Value Calculator – Life Insurance Needs Estimate',
      description: 'Estimate a life insurance coverage benchmark using the human life value method: income minus personal spending, discounted over your remaining working years.',
      faq: [
        { question: 'What is the human life value method?', answer: 'It estimates life insurance need as the present value of the income you would have earned and contributed to your household, minus the share you would have spent on yourself, discounted at an assumed rate of return over your remaining working years.' },
        { question: 'How do you calculate human life value?', answer: 'Multiply annual income by (1 minus your personal consumption share) to get the income available to dependents, then multiply by the present-value-of-an-annuity factor for your remaining working years at your chosen discount rate: [1 − (1+r)⁻ⁿ] ÷ r.' },
        { question: 'What discount rate should I use?', answer: 'There is no single correct rate — it should reflect what a lump sum could realistically earn if invested. A $60,000 income over 20 years with 25% personal consumption comes out to about $560,800 at a 5% discount rate; try a couple of rates to see how sensitive the number is.' },
        { question: 'How is human life value different from the DIME method?', answer: 'Human life value prices lost future income using a present-value calculation. DIME adds up specific obligations — debt, a number of years of income, the mortgage balance and education costs. They answer different questions and routinely give different totals; neither is automatically the "right" one.' },
        { question: 'Does human life value account for inflation or raises?', answer: 'Not in this simplified version — it holds annual income flat for every future year. A more detailed plan would increase income and household expenses each year and then discount the year-by-year difference, which is more work for a similar-sized answer in most cases.' },
        { question: 'Should I subtract life insurance I already have?', answer: 'Yes. This result is a total coverage benchmark, not an amount to add on top of existing coverage. Subtract any group life insurance through an employer or any term policy already in force to see the remaining gap.' },
        { question: 'Is a higher discount rate more conservative or less conservative?', answer: 'Less — it lowers the resulting coverage estimate, because it assumes a lump sum paid out today would grow faster on its own, so a smaller lump sum can replace the same stream of future income.' }
      ]
    },
    compute(values) {
      const netAnnualIncome = values.annualIncome * (1 - values.personalConsumptionPercent / 100);
      const r = values.discountRate / 100;
      const factor = r === 0 ? values.yearsToRetirement : (1 - Math.pow(1 + r, -values.yearsToRetirement)) / r;
      const humanLifeValue = netAnnualIncome * factor;
      const undiscountedTotal = netAnnualIncome * values.yearsToRetirement;
      const discountSavingsPercent = undiscountedTotal === 0 ? 0 : ((undiscountedTotal - humanLifeValue) / undiscountedTotal) * 100;
      return { humanLifeValue, netAnnualIncome, undiscountedTotal, discountSavingsPercent };
    }
  },
  {
    id: 'dime-method-life-insurance-calculator',
    category: 'insurance',
    glyph: 'DIME',
    updatedAt: '2026-11-18',
    aliases: ['dime method calculator', 'dime life insurance calculator', 'debt income mortgage education calculator', 'life insurance needs method calculator'],
    related: ['human-life-value-calculator', 'mortgage-calculator', 'debt-payoff-calculator', 'college-savings-calculator'],
    title: 'DIME Method Life Insurance Calculator',
    description: 'Estimate a life insurance coverage benchmark with the DIME method: Debt, Income replacement, Mortgage balance and Education costs added together — a different, obligations-based alternative to the human life value method.',
    example: 'With $15,000 of other debt, $80,000 of income replaced for 10 years, a $250,000 mortgage balance and $100,000 per child for 2 children, the DIME total is $1,265,000.',
    breakdown: {
      headline: 'dimeTotal',
      headlineLabel: 'DIME coverage estimate',
      outputs: [
        { id: 'dimeTotal', format: 'currency' },
        { id: 'otherDebt', label: 'Debt', format: 'currency' },
        { id: 'incomeReplacement', label: 'Income replacement', format: 'currency' },
        { id: 'mortgageBalance', label: 'Mortgage', format: 'currency' },
        { id: 'educationTotal', label: 'Education', format: 'currency' }
      ],
      groups: [
        { title: 'Debt and mortgage', inputs: ['otherDebt', 'mortgageBalance'] },
        { title: 'Income replacement', inputs: ['annualIncome', 'incomeReplacementYears'] },
        { title: 'Education', inputs: ['numberOfChildren', 'educationCostPerChild'] }
      ],
      derive: (v) => ({ incomeReplacement: v.annualIncome * v.incomeReplacementYears, educationTotal: v.numberOfChildren * v.educationCostPerChild }),
      visual: {
        type: 'donut',
        segments: [
          { from: 'otherDebt', label: 'Debt' },
          { from: 'incomeReplacement', label: 'Income replacement' },
          { from: 'mortgageBalance', label: 'Mortgage' },
          { from: 'educationTotal', label: 'Education' }
        ],
        center: 'dimeTotal',
        centerSub: 'DIME total'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is the DIME method?',
        paragraphs: [
          'DIME is a needs-based way to size a life insurance policy around specific obligations instead of lost income. The letters stand for Debt, Income replacement, Mortgage and Education: add up what is owed, a number of years of income to replace, what is left on the mortgage, and what the children\'s education is expected to cost, and the total is the coverage estimate. Northwestern Mutual, a life insurer, describes it as suggesting coverage equal to "the total of your current debt, 10 to 15 years\' worth of income, your remaining mortgage balance, and anticipated education expenses for your children."',
          'DIME is deliberately itemized rather than formula-driven: every piece is something a household can point to and name, which makes it easier to explain to a partner or a beneficiary than a present-value calculation. The trade-off is that the "years of income" piece is a judgment call, not a derived number — this calculator lets you set it directly, inside the 10-to-15-year range insurers commonly cite, or outside it if your own situation calls for that.',
          'DIME and the human life value method will rarely produce the same total, and that is expected: DIME prices specific obligations, while human life value prices the income stream itself as a present value. Running both and comparing the gap is more informative than treating either one as definitively correct.'
        ]
      },
      howTo: {
        intro: 'Fill in each of the four pieces — debt, income replacement, mortgage and education — and the calculator adds them up.',
        steps: [
          { name: 'Enter other debt', text: 'Credit cards, auto loans, personal loans and any other balances you would not want left for a survivor to pay off — not including the mortgage, which has its own field.' },
          { name: 'Enter income and replacement years', text: 'Enter your annual income, then how many years of it you want replaced. 10 to 15 years is the range insurers commonly cite; use your own judgment for a different household situation.' },
          { name: 'Enter your remaining mortgage balance', text: 'The payoff amount today, not the original loan amount.' },
          { name: 'Enter children and an education cost per child', text: 'Set the number of children and a planning figure for each one\'s future education. The default is a placeholder — check a current source like the College Board\'s Trends in College Pricing report for public vs. private, in-state vs. out-of-state figures, and use your own.' },
          { name: 'Read the total', text: 'The headline is the sum of all four pieces. The donut shows which piece is the largest share of the total.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The four pieces are added directly — no discounting, no formula beyond simple addition and one multiplication per piece.',
        expression: 'Income replacement = Annual income × Replacement years\nEducation = Children × Cost per child\nDIME = Debt + Income replacement + Mortgage + Education',
        terms: [
          { symbol: 'Debt', meaning: 'Non-mortgage debt: credit cards, auto loans, personal loans and similar balances.' },
          { symbol: 'Income replacement', meaning: 'Annual income multiplied by the number of years of it you want replaced.' },
          { symbol: 'Mortgage', meaning: 'The remaining mortgage payoff balance today.' },
          { symbol: 'Education', meaning: 'Number of children multiplied by an assumed education cost per child.' }
        ],
        note: 'An estimate, not a quote. It does not account for savings, investments or other coverage you already have — subtract those from the total separately.'
      },
      workedExample: {
        intro: 'A household has $15,000 of other debt, $80,000 of annual income with 10 years chosen for replacement, a $250,000 mortgage balance, and 2 children with $100,000 set aside per child for education.',
        rows: [
          { label: 'Debt', value: '$15,000' },
          { label: 'Income replacement ($80,000 × 10)', value: '$800,000' },
          { label: 'Mortgage', value: '$250,000' },
          { label: 'Education ($100,000 × 2)', value: '$200,000' },
          { label: 'DIME total', value: '$1,265,000' }
        ],
        result: 'DIME total ≈ $1,265,000',
        explanation: 'Income replacement is the largest piece here at 63.2% of the total ($800,000 ÷ $1,265,000), which is typical for DIME: with 10 or more years chosen, income replacement usually dominates the mortgage and education pieces unless the mortgage balance is unusually large.'
      },
      watchOut: [
        { title: 'This is an educational estimate, not a quote or an offer to sell insurance', body: 'This calculator produces a planning benchmark. It does not sell, recommend or bind any policy, and is not a substitute for a licensed insurance agent or financial advisor.' },
        { title: 'The replacement-years figure is a choice, not a calculation', body: 'Unlike the other three pieces, "years of income" has no single correct value. Northwestern Mutual cites 10 to 15 years as a common range; a household with young children or a single earner might reasonably choose more, closer to when a surviving spouse could retire.' },
        { title: 'The education default is a placeholder, not a current average', body: 'College costs vary enormously by state, public vs. private, and year. Look up a current figure (for example, the College Board\'s Trends in College Pricing report) before relying on this one.' },
        { title: 'It does not subtract savings or coverage already in place', body: 'If you have retirement savings, other investments, or an existing policy, subtract their value from the DIME total to see the remaining gap, rather than treating the total as additional coverage to buy on top.' },
        { title: 'DIME and human life value will not match, and that is normal', body: 'They price different things — obligations versus lost income. Use the gap between them as a sanity check, not evidence that one method is broken.' }
      ],
      references: [
        { label: 'Northwestern Mutual, "How Much Life Insurance Do I Need?" (DIME method definition)', url: 'https://www.northwesternmutual.com/life-and-money/how-much-life-insurance-do-i-need/' },
        { label: 'Insurance Information Institute, "How much life insurance do I need?"', url: 'https://www.iii.org/article/how-much-life-insurance-do-i-need' },
        { label: 'College Board, Trends in College Pricing', url: 'https://research.collegeboard.org/trends/college-pricing' }
      ]
    },
    inputs: [
      { id: 'otherDebt', label: 'Other debt (non-mortgage)', type: 'currency', placeholder: '15000', defaultValue: 15000, step: 500, min: 0 },
      { id: 'annualIncome', label: 'Annual income', type: 'currency', placeholder: '80000', defaultValue: 80000, step: 1000, min: 0 },
      { id: 'incomeReplacementYears', label: 'Years of income to replace', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'mortgageBalance', label: 'Remaining mortgage balance', type: 'currency', placeholder: '250000', defaultValue: 250000, step: 1000, min: 0 },
      { id: 'numberOfChildren', label: 'Number of children', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 },
      { id: 'educationCostPerChild', label: 'Education cost per child', type: 'currency', placeholder: '100000', defaultValue: 100000, step: 5000, min: 0 }
    ],
    seo: {
      title: 'DIME Method Life Insurance Calculator – Debt, Income, Mortgage, Education',
      description: 'Estimate life insurance coverage with the DIME method: debt plus income replacement plus mortgage balance plus education costs, added together.',
      faq: [
        { question: 'What does DIME stand for in life insurance?', answer: 'Debt, Income replacement, Mortgage and Education. It is a needs-based method that adds up these four obligations to produce a life insurance coverage estimate.' },
        { question: 'How do you calculate the DIME method?', answer: 'Add your non-mortgage debt, your annual income multiplied by a chosen number of replacement years, your remaining mortgage balance, and an education cost per child multiplied by the number of children.' },
        { question: 'How many years of income should I replace in the DIME method?', answer: 'Northwestern Mutual cites a common range of 10 to 15 years. There is no single correct figure — some households choose more, especially with young children or one primary earner.' },
        { question: 'What is a worked example of the DIME method?', answer: '$8,000 of debt, $55,000 of income replaced for 12 years, a $180,000 mortgage balance and one child at $80,000 of education costs totals $928,000: $8,000 + $660,000 + $180,000 + $80,000.' },
        { question: 'Is DIME better than the human life value method?', answer: 'Neither is "better" — they measure different things. DIME totals specific obligations; human life value discounts future lost income. They will usually give different numbers, and running both gives a more informed range than either alone.' },
        { question: 'Does the DIME total include my mortgage or payoff amount?', answer: 'Use your current remaining mortgage balance — what it would take to pay off the loan today — not the original loan amount you borrowed.' },
        { question: 'Should I subtract existing savings from the DIME total?', answer: 'Yes. The DIME total is a gross coverage benchmark. Subtract retirement accounts, other investments, and any life insurance you already have to see the actual coverage gap.' }
      ]
    },
    compute(values) {
      const incomeReplacement = values.annualIncome * values.incomeReplacementYears;
      const educationTotal = values.numberOfChildren * values.educationCostPerChild;
      const dimeTotal = values.otherDebt + incomeReplacement + values.mortgageBalance + educationTotal;
      return { dimeTotal, otherDebt: values.otherDebt, incomeReplacement, mortgageBalance: values.mortgageBalance, educationTotal };
    }
  }
];
