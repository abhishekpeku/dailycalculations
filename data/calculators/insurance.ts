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
      title: 'DIME Method Life Insurance Calculator',
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
  },
  {
    id: 'term-life-coverage-calculator',
    category: 'insurance',
    glyph: 'term',
    updatedAt: '2026-11-18',
    aliases: ['how long a term life insurance policy calculator', 'term length calculator life insurance', '10 20 30 year term calculator', 'term life insurance length calculator'],
    related: ['human-life-value-calculator', 'dime-method-life-insurance-calculator', 'mortgage-calculator', 'retirement-savings-calculator'],
    title: 'Term Life Insurance Length Calculator',
    description: 'Work out how many years of term life insurance to buy, not how much: the term that covers your mortgage, your children until they are grown, and the years left until retirement, rounded up to a standard term length.',
    example: "With 22 years left on the mortgage, a 5-year-old whose independence age is 22, and 28 years until retirement, retirement is the longest obligation at 28 years, so the calculator rounds up to a 30-year term.",
    breakdown: {
      headline: 'recommendedTermYears',
      headlineLabel: 'Recommended term length',
      outputs: [
        { id: 'recommendedTermYears', format: 'integer' },
        { id: 'longestObligationYears', label: 'Longest obligation, before rounding', format: 'integer' },
        { id: 'yearsUntilChildIndependent', label: 'Years until youngest child is independent', format: 'integer' },
        { id: 'yearsLeftOnMortgage', label: 'Years left on mortgage', format: 'integer' },
        { id: 'yearsToRetirement', label: 'Years to retirement', format: 'integer' }
      ],
      groups: [
        { title: 'Your obligations', inputs: ['yearsLeftOnMortgage', 'youngestChildAge', 'childIndependenceAge', 'yearsToRetirement'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'yearsLeftOnMortgage', label: 'Mortgage payoff' },
          { from: 'yearsUntilChildIndependent', label: "Youngest child's independence" },
          { from: 'yearsToRetirement', label: 'Retirement' }
        ],
        title: 'Which obligation drives the term',
        highlight: 0
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'How long a term, not how much coverage',
        paragraphs: [
          'Human life value and the DIME method both answer "how much coverage?" This calculator answers a different, equally practical question: "how long a term?" Term life insurance is sold in fixed lengths — the Insurance Information Institute describes policies "purchased to last for a specified period, such as 1, 5, 10, or sometimes as much as 30 years" — and the right length is the one that lasts at least as long as your biggest financial obligation to the people the policy protects.',
          'Most households have three obligations with a natural end date: the mortgage gets paid off, children grow up and become financially independent, and the earner eventually retires. Whichever of those three is furthest away sets the minimum term you need — buying a shorter term that expires while any of them is still outstanding defeats the purpose of having bought it.',
          'This calculator takes the longest of those three spans and rounds it up to the nearest 5 years, which is how most insurers price and sell term policies. It deliberately does not round down: a term that is a little longer than strictly necessary still covers the obligation; a term that is a little shorter does not.'
        ]
      },
      howTo: {
        intro: 'Enter the three obligations; the calculator finds the longest one and rounds it up to a standard term length.',
        steps: [
          { name: 'Enter years left on your mortgage', text: 'How many years remain until it is paid off, from your amortization schedule or loan statement.' },
          { name: "Enter your youngest child's age and independence age", text: 'Independence age is whatever you consider "grown and financially on their own" — 18 for entering the workforce directly, or into the early 20s to cover a four-year degree. The default is 22.' },
          { name: 'Enter years to retirement', text: 'Roughly how many years you plan to keep working and earning the income the policy would replace.' },
          { name: 'Read the result', text: 'The headline is the recommended term length, rounded up to the nearest 5 years. The bars show which of the three obligations is driving that number.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Take the longest of the three obligation spans, then round up to the nearest 5 years (minimum 5).',
        expression: 'childSpan = max(0, independenceAge − youngestChildAge)\nlongest = max(mortgageYears, childSpan, retirementYears)\nterm = max(5, ceil(longest ÷ 5) × 5)',
        terms: [
          { symbol: 'mortgageYears', meaning: 'Years left until the mortgage is paid off.' },
          { symbol: 'childSpan', meaning: "Years until the youngest child reaches your chosen independence age. 0 if there are no children still under that age." },
          { symbol: 'retirementYears', meaning: 'Years left until retirement.' },
          { symbol: 'term', meaning: 'The recommended term length, rounded up to a 5-year increment most insurers actually sell.' }
        ],
        note: "If your own longest obligation is beyond 30 years, most insurers' maximum term, treat the result as a sign to consider permanent coverage, a second policy later, or a longer initial term quote directly from an insurer rather than assuming one will be offered automatically."
      },
      workedExample: {
        intro: 'A homeowner has 22 years left on the mortgage, a 5-year-old child (independence age set at 22, so 17 years until independence), and plans to retire in 28 years.',
        rows: [
          { label: "Child's years to independence (22 − 5)", value: '17 years' },
          { label: 'Longest obligation (max of 22, 17, 28)', value: '28 years (retirement)' },
          { label: 'Rounded up to the nearest 5 years', value: '30 years' }
        ],
        result: 'Recommended term ≈ 30 years',
        explanation: 'Retirement, not the mortgage or the child, is the longest-dated obligation here, so it sets the term. A 30-year term is the longest commonly sold, which this household needs in full — a 25-year term would expire 3 years before retirement.'
      },
      watchOut: [
        { title: 'This is an educational estimate, not a quote or an offer to sell insurance', body: 'This calculator suggests a term length for your own planning. It does not sell, recommend or bind any policy, and is not a substitute for a licensed insurance agent who can quote actual available terms.' },
        { title: 'It recommends a length, not an amount', body: 'Pair this result with a coverage amount from the human life value or DIME calculator — a term length with no coverage amount, or a coverage amount with no term length, is only half the decision.' },
        { title: 'Independence age is a judgment call', body: 'Raising it from 18 to 22 to cover a four-year degree can add years to the result for a young child. Pick the age that matches what you actually intend to fund.' },
        { title: 'Longer terms cost more per year of coverage', body: "A 30-year term is quoted at a higher premium than a 20-year term for the same coverage amount, because the insurer is on the hook longer. Don't round up further than your actual longest obligation requires." },
        { title: 'Rounding up, never down', body: 'A 27-year obligation rounds up to a 30-year term here, not down to 25 — a term that expires before the obligation does leaves a gap at exactly the time it would matter most.' }
      ],
      references: [
        { label: 'Insurance Information Institute, "What are the principal types of life insurance?" (term lengths)', url: 'https://www.iii.org/article/what-are-the-principal-types-of-life-insurance' },
        { label: 'Northwestern Mutual, "How Much Life Insurance Do I Need?"', url: 'https://www.northwesternmutual.com/life-and-money/how-much-life-insurance-do-i-need/' }
      ]
    },
    inputs: [
      { id: 'yearsLeftOnMortgage', label: 'Years left on mortgage', type: 'number', placeholder: '22', defaultValue: 22, step: 1, min: 0 },
      { id: 'youngestChildAge', label: "Youngest child's current age", type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'childIndependenceAge', label: 'Age you consider "independent"', type: 'number', placeholder: '22', defaultValue: 22, step: 1, min: 0 },
      { id: 'yearsToRetirement', label: 'Years to retirement', type: 'number', placeholder: '28', defaultValue: 28, step: 1, min: 0 }
    ],
    seo: {
      title: 'Term Life Insurance Length Calculator – 10/20/30-Year Term',
      description: 'Find how long a term life insurance policy you need from your mortgage payoff, your children\'s ages, and years to retirement, rounded to a standard term length.',
      faq: [
        { question: 'How do I know how many years of term life insurance to buy?', answer: 'Find your longest financial obligation with an end date — usually the mortgage payoff, your youngest child reaching financial independence, or your own retirement — and round it up to the nearest standard term length, commonly sold in 5-year increments up to 30 years.' },
        { question: 'Should I buy a 20-year or 30-year term policy?', answer: 'Compare both to your longest obligation. If your mortgage, your children\'s independence, and your retirement are all within 20 years, a 20-year term covers them for a lower premium than a 30-year term; if any one of them is further out than 20 years, that obligation needs the longer term.' },
        { question: 'What is a worked example of choosing a term length?', answer: 'With 10 years left on the mortgage, a 10-year-old child becoming independent at 22 (12 years), and 15 years to retirement, retirement is the longest at 15 years, rounding up to a 15-year term.' },
        { question: "What if I don't have children at home anymore?", answer: 'Set the child-independence span to 0 by entering a current age at or above your chosen independence age — the mortgage and retirement obligations still apply on their own. An 18-year mortgage payoff with no dependent children and 10 years to retirement rounds up to a 20-year term, driven by the mortgage.' },
        { question: 'What are standard term life insurance lengths?', answer: 'The Insurance Information Institute describes policies lasting "1, 5, 10, or sometimes as much as 30 years." Insurers commonly sell terms in 5- or 10-year increments within that range.' },
        { question: 'Does a longer term cost more?', answer: "Yes. A longer term means the insurer is committed to a fixed premium for more years, so a 30-year term's premium is higher than a 20-year term's for the same coverage amount and the same person." },
        { question: 'What happens if my obligation is longer than 30 years?', answer: "30 years is the longest term most insurers commonly offer. If your result exceeds that, consider permanent coverage, laddering a second term policy later, or asking an insurer directly about longer-term options." }
      ]
    },
    compute(values) {
      const yearsUntilChildIndependent = Math.max(0, values.childIndependenceAge - values.youngestChildAge);
      const longestObligationYears = Math.max(values.yearsLeftOnMortgage, yearsUntilChildIndependent, values.yearsToRetirement);
      const recommendedTermYears = Math.max(5, Math.ceil(longestObligationYears / 5) * 5);
      return {
        recommendedTermYears,
        longestObligationYears,
        yearsUntilChildIndependent,
        yearsLeftOnMortgage: values.yearsLeftOnMortgage,
        yearsToRetirement: values.yearsToRetirement
      };
    }
  },
  {
    id: 'whole-life-vs-term-life-cost-calculator',
    category: 'insurance',
    glyph: 'W/T',
    updatedAt: '2026-11-18',
    aliases: ['term vs whole life insurance calculator', 'buy term invest the difference calculator', 'whole life insurance cost comparison', 'permanent vs term life insurance calculator'],
    related: ['human-life-value-calculator', 'dime-method-life-insurance-calculator', 'term-life-coverage-calculator', 'investment-calculator'],
    title: 'Whole Life vs. Term Life Cost Calculator',
    description: "Compare what term and whole life insurance actually cost over a chosen number of years, and what investing the premium difference between them could grow to — a cost-structure comparison, not a recommendation of which to buy.",
    example: 'A $25/month term policy against a $150/month whole life policy over 20 years costs $6,000 in total premiums for term and $36,000 for whole life; investing the $125/month difference at an assumed 7% return could grow to about $65,116.',
    breakdown: {
      headline: 'investedDifferenceValue',
      headlineLabel: 'Invested premium difference, after N years',
      outputs: [
        { id: 'investedDifferenceValue', format: 'currency' },
        { id: 'termTotalCost', label: 'Total term premiums paid', format: 'currency' },
        { id: 'wholeLifeTotalCost', label: 'Total whole life premiums paid', format: 'currency' },
        { id: 'monthlyDifference', label: 'Extra monthly cost of whole life', format: 'currency' }
      ],
      groups: [
        { title: 'Premiums', inputs: ['termMonthlyPremium', 'wholeLifeMonthlyPremium'] },
        { title: 'Time and return assumption', inputs: ['comparisonYears', 'assumedInvestmentReturn'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'termTotalCost', label: 'Term, total premiums' },
          { from: 'wholeLifeTotalCost', label: 'Whole life, total premiums' },
          { from: 'investedDifferenceValue', label: 'Difference, invested' }
        ],
        title: 'Three ways to look at the same years'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why term and whole life cost so differently',
        paragraphs: [
          'Term and whole life insurance are priced around a real structural difference, not just a marketing choice. The Insurance Information Institute explains that term premiums "go towards your payout, making costs for policyholders comparatively lower," while whole life premiums go toward three things at once: the cost of insuring you, policy fees, and building cash value — which is why a whole life premium for the same death benefit is routinely several times a term premium for someone the same age.',
          "That cash value is real, not an accounting fiction: insurers charge more than needed for claims in the early years, and by law, once those \"overpayments\" reach a certain level they must become available to the policyholder as cash value, usable by withdrawal or loan (loans reduce the death benefit). The classic comparison — \"buy term and invest the difference\" — asks whether putting that same extra monthly amount into your own investment account would outperform what the insurer's cash value builds. This calculator runs that side of the comparison for you; it does not model the insurer's actual cash-value schedule, which varies by policy and is disclosed in the policy's own illustration.",
          "Neither side of this comparison is a recommendation. A level premium that never rises again, a guaranteed death benefit that doesn't depend on investment performance, and a disciplined investor who might not actually invest the difference every month are all real considerations this calculator does not weigh for you — it only does the arithmetic once you supply the numbers."
        ]
      },
      howTo: {
        intro: 'Enter a term quote and a whole life quote for comparable coverage, a number of years to compare over, and an assumed investment return for the "invest the difference" side.',
        steps: [
          { name: 'Enter the term monthly premium', text: 'Use an actual quote if you have one, for the coverage amount and term length you are considering.' },
          { name: 'Enter the whole life monthly premium', text: 'A quote for a similar death benefit. Whole life premiums are typically several times the term premium for the same amount of coverage and the same person.' },
          { name: 'Set the comparison period', text: 'How many years you want to compare the two over — often the term length you are also considering.' },
          { name: 'Set an assumed investment return', text: "A long-run rate you'd expect from investing the premium difference yourself, net of fees and taxes. This is your own assumption, not a guarantee from either policy." },
          { name: 'Read the result', text: 'The bars compare total premiums paid under each policy and what investing the monthly difference could grow to over the same years.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Total cost is just the monthly premium times 12 times the years. The invested difference is a standard future-value-of-an-annuity calculation on the monthly gap between the two premiums.',
        expression: 'Total costₓ = premiumₓ × 12 × years\nDifference = wholePremium − termPremium\nFV = Difference × [(1 + i)ⁿ − 1] ÷ i,  i = return ÷ 12, n = years × 12',
        terms: [
          { symbol: 'premiumₓ', meaning: 'The monthly premium for term or whole life.' },
          { symbol: 'Difference', meaning: 'How much more the whole life premium costs per month than the term premium.' },
          { symbol: 'i', meaning: 'Monthly investment return (the annual assumed return divided by 12).' },
          { symbol: 'n', meaning: 'Number of months in the comparison period.' },
          { symbol: 'FV', meaning: 'Future value of investing the monthly difference every month for the comparison period, compounded monthly.' }
        ],
        note: 'This models only the "invest the difference" side with a chosen return assumption. It does not model a specific whole life policy\'s actual cash-value growth, which is guaranteed by the insurer and disclosed in that policy\'s own illustration.'
      },
      workedExample: {
        intro: 'Comparable coverage quotes $25 a month for term and $150 a month for whole life, compared over 20 years, with an assumed 7% annual investment return on the difference.',
        rows: [
          { label: 'Term total premiums ($25 × 12 × 20)', value: '$6,000.00' },
          { label: 'Whole life total premiums ($150 × 12 × 20)', value: '$36,000.00' },
          { label: 'Monthly difference ($150 − $25)', value: '$125.00' },
          { label: 'Invested difference after 20 years (7% annual, compounded monthly)', value: '$65,115.83' }
        ],
        result: 'Term costs $6,000.00; whole life costs $36,000.00; investing the $125/month difference could reach about $65,115.83',
        explanation: "The invested-difference figure, $65,115.83, is more than the $30,000 saved in premiums ($36,000 − $6,000) because it assumes the saved money grows at 7% a year for 20 years rather than sitting idle. That gap only appears if the difference is actually invested every month — spending it instead removes the comparison entirely."
      },
      watchOut: [
        { title: 'This is an educational estimate, not a quote or an offer to sell insurance', body: 'This calculator compares cost structures for planning purposes. It does not sell, recommend or bind any policy, and is not a substitute for a licensed insurance agent or financial advisor.' },
        { title: 'The investment return is an assumption, not a guarantee', body: "Unlike a whole life policy's guaranteed cash-value schedule, the \"invest the difference\" side depends entirely on actually earning the assumed return, after any fees and taxes on the investment account — which a real brokerage or retirement account may or may not match in a given 20-year period." },
        { title: 'It does not model the real cash-value schedule of any specific policy', body: "A whole life policy's actual cash value depends on its own guarantees and any dividends the insurer pays, disclosed in that policy's illustration. This calculator only estimates the alternative of self-investing the premium difference, not the policy's own cash value." },
        { title: 'Term insurance ends; investing requires discipline', body: 'A term policy with no renewal leaves no coverage after the term ends. "Investing the difference" only works if the difference is actually set aside every single month rather than spent — a real behavioral risk this calculator cannot measure.' },
        { title: "Comparable coverage means comparable coverage", body: "Only compare premiums for the same death benefit and a similar underwriting class. A larger whole life death benefit against a smaller term quote isn't a fair cost comparison." }
      ],
      references: [
        { label: 'Insurance Information Institute, "What are the principal types of life insurance?" (premium cost and cash-value structure)', url: 'https://www.iii.org/article/what-are-the-principal-types-of-life-insurance' },
        { label: 'Insurance Information Institute, "How much life insurance do I need?"', url: 'https://www.iii.org/article/how-much-life-insurance-do-i-need' }
      ]
    },
    inputs: [
      { id: 'termMonthlyPremium', label: 'Term monthly premium', type: 'currency', placeholder: '25', defaultValue: 25, step: 1, min: 0 },
      { id: 'wholeLifeMonthlyPremium', label: 'Whole life monthly premium', type: 'currency', placeholder: '150', defaultValue: 150, step: 1, min: 0 },
      { id: 'comparisonYears', label: 'Comparison period', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 0 },
      { id: 'assumedInvestmentReturn', label: 'Assumed investment return', type: 'percent', placeholder: '7', defaultValue: 7, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'Whole Life vs. Term Life Cost Calculator',
      description: 'Compare total premiums for term vs. whole life insurance, and what investing the premium difference could grow to at your own assumed return.',
      faq: [
        { question: 'Why is whole life insurance more expensive than term?', answer: "Term premiums fund only the death benefit for a fixed period. Whole life premiums fund the death benefit, policy fees, and a cash-value component that accumulates for the life of the policy, which is why whole life premiums are routinely several times a term premium for the same coverage." },
        { question: 'What does "buy term and invest the difference" mean?', answer: 'It is the strategy of buying the cheaper term policy and separately investing the monthly premium you saved versus a whole life policy, on the view that a disciplined investor could out-earn the insurer\'s cash-value growth. This calculator estimates that invested side using your own return assumption.' },
        { question: 'What is a worked example of term vs. whole life cost?', answer: 'A $20/month term policy against a $120/month whole life policy over 30 years at a 6% assumed return: term costs $7,200 total, whole life costs $43,200 total, and investing the $100/month difference could reach about $100,451.50.' },
        { question: 'Does whole life insurance ever become "free"?', answer: "No single premium structure makes a permanent policy cost nothing — it means the level premium you pay was set, from the start, high enough to cover the policy for life rather than rising as you age the way a renewed term premium would." },
        { question: 'Can I access the cash value in a whole life policy?', answer: 'Yes, typically by withdrawal or by taking a loan against it, though a loan against the cash value reduces the death benefit until it is repaid.' },
        { question: 'Is investing the difference guaranteed to beat whole life?', answer: "No. It depends entirely on actually earning the assumed return every year and actually investing the difference every month, net of fees and taxes — neither of which is guaranteed the way a whole life policy's cash-value schedule is." },
        { question: 'Should I compare a 10-year term to a whole life policy?', answer: 'Only if you plan to need coverage for just those 10 years. For a longer-term comparison, match the comparison period to how long you would otherwise keep renewing or re-buying term coverage, not to one short initial term.' }
      ]
    },
    compute(values) {
      const termTotalCost = values.termMonthlyPremium * 12 * values.comparisonYears;
      const wholeLifeTotalCost = values.wholeLifeMonthlyPremium * 12 * values.comparisonYears;
      const monthlyDifference = values.wholeLifeMonthlyPremium - values.termMonthlyPremium;
      const i = values.assumedInvestmentReturn / 100 / 12;
      const n = values.comparisonYears * 12;
      const investedDifferenceValue = i === 0 ? monthlyDifference * n : monthlyDifference * ((Math.pow(1 + i, n) - 1) / i);
      return { investedDifferenceValue, termTotalCost, wholeLifeTotalCost, monthlyDifference };
    }
  },
  {
    id: 'out-of-pocket-maximum-calculator',
    category: 'insurance',
    glyph: 'OOP',
    updatedAt: '2026-11-18',
    aliases: ['out of pocket max calculator', 'health insurance out of pocket maximum calculator', 'how much have i paid toward my deductible calculator', 'deductible and coinsurance tracker'],
    related: ['cobra-cost-calculator', 'disability-insurance-needs-calculator', 'emergency-fund-calculator'],
    title: 'Out-of-Pocket Maximum Calculator',
    description: 'Track your deductible, copay and coinsurance spending so far against your health plan\'s stated out-of-pocket maximum, and see how much is left before your plan starts paying 100% of covered costs.',
    example: "With a $10,600 out-of-pocket max and $2,500 paid toward the deductible, $450 in copays and $1,850 in coinsurance so far, you've reached 45.3% of the max, with $5,800 left.",
    breakdown: {
      headline: 'remainingToMax',
      headlineLabel: 'Left until your plan pays 100%',
      outputs: [
        { id: 'remainingToMax', format: 'currency' },
        { id: 'totalSpentSoFar', label: 'Total paid toward the max so far', format: 'currency' },
        { id: 'percentOfMaxReached', label: 'Percent of the max reached', format: 'percent' },
        { id: 'outOfPocketMax', label: "Your plan's stated out-of-pocket max", format: 'currency' }
      ],
      groups: [
        { title: 'What you have paid so far', inputs: ['deductiblePaid', 'copaysPaid', 'coinsurancePaid'] },
        { title: "Your plan's limit", inputs: ['outOfPocketMax'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'deductiblePaid', label: 'Deductible paid' },
          { from: 'copaysPaid', label: 'Copays paid' },
          { from: 'coinsurancePaid', label: 'Coinsurance paid' },
          { from: 'remainingToMax', label: 'Left until the max' }
        ],
        center: 'outOfPocketMax',
        centerSub: 'Out-of-pocket max'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is an out-of-pocket maximum?',
        paragraphs: [
          'HealthCare.gov defines the out-of-pocket maximum as "the most you have to pay for covered services in a plan year," after which "your health plan pays 100% of the costs of covered benefits." It is a single running total for the plan year, and it is made up of three things added together: your deductible, your copayments, and your coinsurance for in-network, covered care.',
          "Two categories of spending do not count toward it, and both matter: your monthly premium never counts (the max is about care you receive, not the cost of carrying the plan at all), and neither does spending on services your plan doesn't cover or on out-of-network care, which HealthCare.gov lists as explicitly excluded. A big out-of-network bill can leave you having paid far more than the stated max without ever actually reaching it, because none of that spending was counted.",
          'Every ACA marketplace plan is required to cap this figure, and the cap itself rises most years. For 2026, HealthCare.gov lists the marketplace limit at $10,600 for self-only coverage and $21,200 for family coverage; for 2027 those limits rise to $12,000 and $24,000. Employer plans set their own out-of-pocket max, which must be at or below the same federal limit for ACA-compliant plans, so check your own plan documents rather than assuming the marketplace figure applies to you.'
        ]
      },
      howTo: {
        intro: "Enter what you've already paid this plan year toward your deductible, copays and coinsurance, and your plan's stated out-of-pocket max; the calculator adds up your running total and shows what's left.",
        steps: [
          { name: 'Enter your deductible paid so far', text: 'The amount you have paid this plan year specifically toward your deductible, found on your insurer\'s member portal or your explanation of benefits (EOB) statements.' },
          { name: 'Enter copays paid so far', text: 'Flat-fee payments for visits or prescriptions, added up for the plan year to date.' },
          { name: 'Enter coinsurance paid so far', text: 'Your percentage share of covered costs after the deductible, also added up for the plan year to date.' },
          { name: 'Enter your plan\'s out-of-pocket max', text: 'Found in your plan\'s Summary of Benefits and Coverage, not the marketplace-wide limit — your own plan\'s figure may be lower.' },
          { name: 'Read the result', text: "The headline is how much more you'd need to pay before your plan covers 100% of further in-network, covered costs for the rest of the plan year. The donut shows your running total as a share of the max." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The three spending categories are added together and compared against the stated max.',
        expression: 'Spent = Deductible + Copays + Coinsurance\nRemaining = max(0, Max − Spent)\nPercentReached = min(100%, Spent ÷ Max)',
        terms: [
          { symbol: 'Deductible', meaning: 'What you have paid this plan year toward your deductible.' },
          { symbol: 'Copays', meaning: 'Flat-fee payments for covered visits or prescriptions, year to date.' },
          { symbol: 'Coinsurance', meaning: 'Your percentage share of covered costs after the deductible, year to date.' },
          { symbol: 'Max', meaning: "Your plan's stated out-of-pocket maximum for the plan year." },
          { symbol: 'Remaining', meaning: "How much more in-network, covered spending it would take to reach the max." }
        ],
        note: 'Premiums, out-of-network care, and non-covered services never count toward this total, even though you pay for them. This is an estimate based on what you enter, not a replacement for your insurer\'s own running total.'
      },
      workedExample: {
        intro: 'A plan with a $10,600 out-of-pocket max. So far this year: $2,500 paid toward the deductible, $450 in copays, and $1,850 in coinsurance.',
        rows: [
          { label: 'Total spent so far ($2,500 + $450 + $1,850)', value: '$4,800' },
          { label: 'Percent of the max reached ($4,800 ÷ $10,600)', value: '45.3%' },
          { label: 'Remaining to the max ($10,600 − $4,800)', value: '$5,800' }
        ],
        result: '$5,800 left before the plan pays 100%',
        explanation: "At 45.3% of the max reached, this household is less than halfway there. Once total in-network, covered spending reaches $10,600 for the year, the plan picks up 100% of further covered costs — it does not reset until the next plan year starts."
      },
      watchOut: [
        { title: 'This is an educational estimate, not insurance advice or a claim adjudication', body: "This calculator helps you track your own running total for planning purposes. It does not access your insurer's actual claims data and is not a substitute for your insurer's own account summary or an insurance professional's advice." },
        { title: 'Out-of-network care usually does not count', body: "Spending at an out-of-network provider often does not count toward the max at all, and may have no cap on it whatsoever — HealthCare.gov lists it among the costs the limit excludes. A single large out-of-network bill can cost far more than the gap this calculator shows." },
        { title: 'Your premium is never part of this number', body: 'What you pay each month just to carry the plan is separate from the out-of-pocket max, no matter how high it is. The max is about the cost of care you actually use, not the cost of coverage itself.' },
        { title: "Use your plan's own max, not the marketplace-wide limit", body: "The $10,600 (self-only) / $21,200 (family) figures for 2026 are the federal ceiling ACA-compliant plans cannot exceed — many employer plans set their own max below that ceiling. Check your plan's Summary of Benefits and Coverage for the real number." },
        { title: 'The total resets with a new plan year', body: "Everything you enter here applies to one plan year. A deductible or coinsurance payment made under last year's plan does not carry over and should not be included." }
      ],
      references: [
        { label: 'HealthCare.gov, "Out-of-pocket maximum/limit" glossary entry', url: 'https://www.healthcare.gov/glossary/out-of-pocket-maximum-limit/' },
        { label: 'HealthCare.gov, "Out-of-pocket maximum/limit" (2026 and 2027 marketplace limits)', url: 'https://www.healthcare.gov/glossary/out-of-pocket-maximum-limit/' }
      ]
    },
    inputs: [
      { id: 'deductiblePaid', label: 'Deductible paid so far', type: 'currency', placeholder: '2500', defaultValue: 2500, step: 50, min: 0 },
      { id: 'copaysPaid', label: 'Copays paid so far', type: 'currency', placeholder: '450', defaultValue: 450, step: 25, min: 0 },
      { id: 'coinsurancePaid', label: 'Coinsurance paid so far', type: 'currency', placeholder: '1850', defaultValue: 1850, step: 50, min: 0 },
      { id: 'outOfPocketMax', label: "Plan's out-of-pocket max", type: 'currency', placeholder: '10600', defaultValue: 10600, step: 100, min: 0 }
    ],
    seo: {
      title: 'Out-of-Pocket Maximum Calculator – Track Deductible & Coinsurance',
      description: "Track deductible, copay and coinsurance spending against your health plan's out-of-pocket maximum, and see how much is left before it pays 100%.",
      faq: [
        { question: 'What counts toward my out-of-pocket maximum?', answer: 'Your deductible, copayments and coinsurance for in-network, covered care all count. Premiums, out-of-network care, and non-covered services do not, even though you pay for them.' },
        { question: 'What happens once I reach my out-of-pocket max?', answer: 'HealthCare.gov states that once you hit it, "your health plan pays 100% of the costs of covered benefits" for the rest of the plan year — for in-network, covered services.' },
        { question: 'What is the out-of-pocket maximum for 2026?', answer: 'HealthCare.gov lists the ACA marketplace limit at $10,600 for self-only coverage and $21,200 for family coverage in 2026, rising to $12,000 and $24,000 in 2027. Many employer plans set their own max below that federal ceiling.' },
        { question: 'Does my monthly premium count toward my out-of-pocket max?', answer: 'No. HealthCare.gov explicitly excludes "your monthly premiums" from the out-of-pocket maximum — the max is only about the cost of care you use, not the cost of carrying the plan.' },
        { question: 'Does out-of-network care count toward my out-of-pocket max?', answer: 'Generally no. Out-of-network care is one of the costs HealthCare.gov lists as excluded from the limit, which is why a large out-of-network bill can cost much more than reaching the stated max would suggest.' },
        { question: 'How do I find my own out-of-pocket max?', answer: "Check your plan's Summary of Benefits and Coverage or your insurer's member portal — it is specific to your plan and may be lower than the federal marketplace ceiling." },
        { question: 'Does the out-of-pocket max reset every year?', answer: "Yes, it resets at the start of each new plan year. Spending from a previous plan year never carries over into the new year's total." }
      ]
    },
    compute(values) {
      const totalSpentSoFar = values.deductiblePaid + values.copaysPaid + values.coinsurancePaid;
      const remainingToMax = Math.max(0, values.outOfPocketMax - totalSpentSoFar);
      const percentOfMaxReached = values.outOfPocketMax === 0 ? 0 : Math.min(100, (totalSpentSoFar / values.outOfPocketMax) * 100);
      return {
        remainingToMax,
        totalSpentSoFar,
        percentOfMaxReached,
        outOfPocketMax: values.outOfPocketMax,
        deductiblePaid: values.deductiblePaid,
        copaysPaid: values.copaysPaid,
        coinsurancePaid: values.coinsurancePaid
      };
    }
  },
  {
    id: 'cobra-cost-calculator',
    category: 'insurance',
    glyph: 'CBRA',
    updatedAt: '2026-11-18',
    aliases: ['cobra insurance cost calculator', 'how much does cobra cost calculator', 'cobra premium calculator', 'continuation of health coverage cost calculator'],
    related: ['out-of-pocket-maximum-calculator', 'disability-insurance-needs-calculator', 'emergency-fund-calculator', 'paycheck-calculator'],
    title: 'COBRA Cost Calculator',
    description: 'Estimate what COBRA continuation health coverage will cost after leaving a job: up to 102% of the combined employee-and-employer premium, under the federal rule the Department of Labor documents.',
    example: 'With a $150 employee premium and $550 employer premium while working, COBRA at 102% of the combined $700 costs $714 a month — $12,852 total over an 18-month continuation period.',
    breakdown: {
      headline: 'totalCobraCost',
      headlineLabel: 'Total COBRA premiums over the coverage period',
      outputs: [
        { id: 'totalCobraCost', format: 'currency' },
        { id: 'cobraMonthlyPremium', label: 'COBRA premium per month (102% of the combined premium)', format: 'currency' },
        { id: 'extraMonthlyCost', label: 'Extra per month vs. what you paid as an employee', format: 'currency' },
        { id: 'extraTotalCost', label: 'Extra total vs. your old employee share', format: 'currency' }
      ],
      groups: [
        { title: 'Your premium while employed', inputs: ['employeePremiumShare', 'employerPremiumShare'] },
        { title: 'Coverage period', inputs: ['monthsOfCoverage'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'employeePremiumShare', label: 'Paid while employed (monthly)' },
          { from: 'cobraMonthlyPremium', label: 'COBRA premium (monthly)' }
        ],
        title: 'Monthly cost before and after COBRA',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is COBRA, and why does it cost so much more?',
        paragraphs: [
          'COBRA (the Consolidated Omnibus Budget Reconciliation Act) lets someone who loses job-based group health coverage — through job loss, reduced hours, or certain other qualifying events — keep the same plan temporarily by paying for it directly. The U.S. Department of Labor states that COBRA "provides temporary coverage to you and your dependents — usually up to 18 months," and that certain qualifying events can extend that to 36 months.',
          'The sticker shock is structural, not a penalty: while employed, an employer typically pays most of the premium directly to the insurer, and the paycheck deduction only covers the employee\'s share. Leaving the job removes the employer\'s contribution entirely, and COBRA requires the person continuing coverage to pay for the whole thing themselves. The Department of Labor states that a qualified individual "may be required to pay the entire premium for coverage up to 102% of the cost to the plan" — the full combined premium the employer used to help cover, plus up to a 2% administrative fee.',
          "That combination — losing the employer's share and absorbing a 2% fee on top of the full premium — is why a COBRA bill often looks several times larger than what came out of a paycheck. It is the same coverage, continued at the plan's real, un-subsidized cost."
        ]
      },
      howTo: {
        intro: 'Enter what you and your employer were each paying monthly toward the premium, and how many months of COBRA coverage you are estimating; the calculator applies the 102% rule.',
        steps: [
          { name: 'Enter your employee premium share', text: 'The amount that came out of your paycheck each month for this coverage — check a recent pay stub or your plan enrollment summary.' },
          { name: 'Enter your employer\'s premium share', text: "The amount your employer paid directly to the insurer on your behalf each month. Your HR or benefits department can provide this if it isn't on your pay stub." },
          { name: 'Enter the number of months', text: 'How many months of COBRA coverage you are estimating — up to 18 months for most qualifying events, or up to 36 months for certain other events, per the Department of Labor.' },
          { name: 'Read the result', text: "The headline is the total COBRA premium cost over that period. The bars compare what you used to pay monthly as an employee against the full COBRA premium you'd pay monthly now." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'COBRA premium is the combined former premium, grossed up by the 2% administrative fee the Department of Labor documents.',
        expression: 'Combined = EmployeeShare + EmployerShare\nCOBRA premium = Combined × 1.02\nTotal cost = COBRA premium × Months',
        terms: [
          { symbol: 'EmployeeShare', meaning: 'What came out of your paycheck monthly for the premium while employed.' },
          { symbol: 'EmployerShare', meaning: 'What your employer paid monthly on your behalf while employed.' },
          { symbol: 'Combined', meaning: 'The full premium the plan actually costs, employee and employer shares added together.' },
          { symbol: '1.02', meaning: 'The 102% figure the Department of Labor documents — full premium plus up to a 2% administrative fee.' },
          { symbol: 'Months', meaning: 'The number of months of COBRA coverage being estimated.' }
        ],
        note: "This assumes the maximum permitted 2% administrative fee and a premium that doesn't change over the period. Confirm your plan's actual COBRA premium notice, which is the authoritative figure."
      },
      workedExample: {
        intro: 'While employed, a worker paid $150 a month toward the premium and the employer paid $550 a month. They estimate 18 months of COBRA coverage.',
        rows: [
          { label: 'Combined monthly premium ($150 + $550)', value: '$700.00' },
          { label: 'COBRA monthly premium ($700 × 1.02)', value: '$714.00' },
          { label: 'Extra cost per month vs. employee share ($714 − $150)', value: '$564.00' },
          { label: 'Total COBRA cost over 18 months ($714 × 18)', value: '$12,852.00' }
        ],
        result: 'COBRA costs $714.00 a month, $12,852.00 over 18 months',
        explanation: "The monthly premium rises 376% ($564 ÷ $150) once the employer's $550 contribution disappears and the 2% fee is added — the same coverage, now billed at its full, un-subsidized cost plus the administrative fee."
      },
      watchOut: [
        { title: 'This is an educational estimate, not a quote or an offer to sell insurance', body: 'This calculator estimates a COBRA premium for planning purposes. It does not sell, recommend or bind any coverage, and is not a substitute for the actual COBRA election notice your plan administrator sends you.' },
        { title: 'Your actual notice has the real number', body: 'Your plan administrator is required to send a COBRA election notice stating the exact premium. Use this calculator to plan ahead, then confirm against that notice before budgeting around it.' },
        { title: 'Coverage length depends on the qualifying event', body: 'The Department of Labor states COBRA usually runs "up to 18 months," with certain qualifying events extending it to 36 months. Confirm which applies to your situation rather than assuming 18 months.' },
        { title: 'The marketplace may cost less for some households', body: "Because COBRA premiums are not subsidized, a comparable ACA marketplace plan — especially with a premium tax credit — is sometimes cheaper. It's worth comparing both before electing COBRA." },
        { title: 'Missing the election deadline ends the option', body: 'COBRA must be elected within a strict window after the qualifying event and the notice. Once that window closes, continuing the same employer plan under COBRA is no longer available.' }
      ],
      references: [
        { label: 'U.S. Department of Labor, "COBRA Continuation Coverage" overview (premium cost, up to 102% rule)', url: 'https://www.dol.gov/general/topic/health-plans/cobra' },
        { label: 'U.S. Department of Labor, Employee Benefits Security Administration, COBRA continuation coverage laws and regulations (coverage duration)', url: 'https://www.dol.gov/agencies/ebsa/laws-and-regulations/laws/cobra' }
      ]
    },
    inputs: [
      { id: 'employeePremiumShare', label: 'Your premium share (monthly, while employed)', type: 'currency', placeholder: '150', defaultValue: 150, step: 10, min: 0 },
      { id: 'employerPremiumShare', label: "Employer's premium share (monthly)", type: 'currency', placeholder: '550', defaultValue: 550, step: 10, min: 0 },
      { id: 'monthsOfCoverage', label: 'Months of COBRA coverage', type: 'number', placeholder: '18', defaultValue: 18, step: 1, min: 0 }
    ],
    seo: {
      title: 'COBRA Cost Calculator – Continuation Health Coverage Premium',
      description: 'Estimate your COBRA premium: up to 102% of your combined employee-and-employer premium, per the Department of Labor rule, over your coverage period.',
      faq: [
        { question: 'How much does COBRA cost?', answer: 'The Department of Labor states a qualified individual "may be required to pay the entire premium for coverage up to 102% of the cost to the plan" — the full employee-plus-employer premium, plus up to a 2% administrative fee.' },
        { question: 'Why is COBRA so much more expensive than my paycheck deduction?', answer: "While employed, your employer typically pays most of the premium directly and your paycheck deduction only covers your own share. COBRA removes the employer's contribution entirely, so you pay the full combined premium plus the administrative fee." },
        { question: 'How long does COBRA coverage last?', answer: 'The Department of Labor states COBRA "provides temporary coverage to you and your dependents — usually up to 18 months," with certain qualifying events extending it to 36 months.' },
        { question: 'What is a worked example of COBRA cost?', answer: 'An employee paying $100 a month with a $400 employer contribution faces a COBRA premium of $510 a month (102% of the combined $500) — $6,120 total over 12 months.' },
        { question: 'Does the 2% COBRA administrative fee apply every month?', answer: 'Up to 2% is the maximum the Department of Labor permits on top of the full combined premium each month; it is not a one-time fee.' },
        { question: 'Is COBRA cheaper than an ACA marketplace plan?', answer: "It depends on the specific premiums and whether you qualify for a marketplace premium tax credit, which COBRA premiums are not eligible for. Comparing both is worthwhile before electing COBRA." },
        { question: 'What happens if I miss the COBRA election deadline?', answer: 'The election window is strict and defined by law. Once it closes without an election, continuing that specific employer plan under COBRA is no longer available.' }
      ]
    },
    compute(values) {
      const combinedMonthlyPremium = values.employeePremiumShare + values.employerPremiumShare;
      const cobraMonthlyPremium = combinedMonthlyPremium * 1.02;
      const totalCobraCost = cobraMonthlyPremium * values.monthsOfCoverage;
      const extraMonthlyCost = cobraMonthlyPremium - values.employeePremiumShare;
      const extraTotalCost = totalCobraCost - values.employeePremiumShare * values.monthsOfCoverage;
      return {
        totalCobraCost,
        cobraMonthlyPremium,
        extraMonthlyCost,
        extraTotalCost,
        employeePremiumShare: values.employeePremiumShare,
        employerPremiumShare: values.employerPremiumShare
      };
    }
  },
  {
    id: 'disability-insurance-needs-calculator',
    category: 'insurance',
    glyph: 'DI',
    updatedAt: '2026-11-18',
    aliases: ['how much disability insurance do i need calculator', 'long term disability income replacement calculator', 'disability insurance coverage gap calculator', 'income protection insurance calculator'],
    related: ['long-term-care-insurance-needs-calculator', 'human-life-value-calculator', 'emergency-fund-calculator', 'retirement-savings-calculator'],
    title: 'Disability Insurance Needs Calculator',
    description: 'Find the gap between a target income-replacement percentage and any disability coverage you already have — long-term disability policies typically replace 60-80% of income, per the Council for Disability Insurance Awareness.',
    example: 'On a $72,000 salary with a 60% income-replacement target and $1,200 a month of existing disability coverage, the gap is $2,400 a month — the existing coverage only replaces 20% of income, 40 percentage points short of the target.',
    breakdown: {
      headline: 'monthlyBenefitGap',
      headlineLabel: 'Additional monthly benefit to consider',
      outputs: [
        { id: 'monthlyBenefitGap', format: 'currency' },
        { id: 'desiredMonthlyBenefit', label: 'Target monthly benefit', format: 'currency' },
        { id: 'existingReplacementPercent', label: 'What your existing coverage actually replaces', format: 'percent' },
        { id: 'annualBenefitGap', label: 'Gap, annualized', format: 'currency' }
      ],
      groups: [
        { title: 'Income and target', inputs: ['annualIncome', 'desiredReplacementPercent'] },
        { title: 'Coverage you already have', inputs: ['existingMonthlyBenefit'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'existingMonthlyBenefit', label: 'Covered by existing disability benefit' },
          { from: 'monthlyBenefitGap', label: 'Gap to the target' }
        ],
        center: 'desiredMonthlyBenefit',
        centerSub: 'Target monthly benefit'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why disability insurance never replaces 100% of income',
        paragraphs: [
          "Losing the ability to work is a far more common risk than most people budget for. The Council for Disability Insurance Awareness states that \"just under one in four of today's 20-year-olds can expect to be out of work for at least a year because of a disabling condition before they reach the normal retirement age.\" Disability insurance exists to replace part of an income lost to exactly that kind of illness or injury.",
          'It is deliberately never a full replacement. The Council for Disability Insurance Awareness states that long-term disability insurance "covers between 60-80 percent of your income" — insurers cap the benefit below 100% on purpose, so that returning to work always pays more than staying on a disability claim. Group employer coverage, individual policies, or some combination of the two can add up to a figure inside or outside that typical range depending on what is actually in force.',
          "Social Security Disability Insurance (SSDI) is a separate, much smaller safety net, not a substitute for this kind of coverage: the Council for Disability Insurance Awareness states the average SSDI benefit for a disabled worker was about $1,630 a month as of February 2026 — $19,560 a year, below the federal poverty guideline for a two-person household. Most households need private or employer disability coverage to come anywhere close to a 60-80% replacement rate."
        ]
      },
      howTo: {
        intro: 'Enter your income, a target income-replacement percentage within the commonly cited 60-80% range, and any monthly disability benefit you already have through an employer or individual policy.',
        steps: [
          { name: 'Enter your annual income', text: 'Your gross income from work — the amount a disability would actually interrupt.' },
          { name: 'Set a target replacement percentage', text: 'The Council for Disability Insurance Awareness cites a typical long-term disability range of 60-80%. Pick a figure in that range, or your own, based on your fixed expenses.' },
          { name: 'Enter your existing monthly disability benefit', text: 'Add up any employer-provided long-term disability benefit and any individual policy benefit you already have. Enter 0 if you have none.' },
          { name: 'Read the result', text: "The headline is the additional monthly benefit to consider on top of what you already have. The donut shows how much of your target is already covered versus how much is still a gap." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "The target monthly benefit is a percentage of monthly income; the gap is what's left after subtracting existing coverage.",
        expression: 'TargetMonthly = (AnnualIncome ÷ 12) × ReplacementPercent\nGap = max(0, TargetMonthly − ExistingMonthly)',
        terms: [
          { symbol: 'AnnualIncome', meaning: 'Gross annual income from work.' },
          { symbol: 'ReplacementPercent', meaning: "The target share of income to replace, as a percent — commonly 60-80% for long-term disability." },
          { symbol: 'TargetMonthly', meaning: 'The target monthly disability benefit.' },
          { symbol: 'ExistingMonthly', meaning: 'Any disability benefit already in force, from an employer plan, an individual policy, or both.' },
          { symbol: 'Gap', meaning: 'The additional monthly benefit it would take to reach the target.' }
        ],
        note: 'This is a planning estimate, not an underwriting calculation. Actual available coverage amounts depend on an insurer\'s own rules and your insurability.'
      },
      workedExample: {
        intro: 'A $72,000 salary, a 60% replacement target, and $1,200 a month of existing employer-provided disability coverage.',
        rows: [
          { label: 'Target monthly benefit ($72,000 ÷ 12 × 60%)', value: '$3,600' },
          { label: 'Existing coverage actually replaces ($1,200 × 12 ÷ $72,000)', value: '20%' },
          { label: 'Monthly gap ($3,600 − $1,200)', value: '$2,400' },
          { label: 'Gap, annualized ($2,400 × 12)', value: '$28,800' }
        ],
        result: '$2,400 a month short of the 60% target',
        explanation: 'The existing $1,200 benefit replaces only 20% of this income, 40 percentage points short of the 60% target (60% − 20%), which is the kind of gap an added individual disability policy or a supplemental employer option is meant to close.'
      },
      watchOut: [
        { title: 'This is an educational estimate, not a quote or an offer to sell insurance', body: 'This calculator estimates a coverage gap for planning purposes. It does not sell, recommend or bind any policy, and is not a substitute for a licensed insurance agent who can quote actual available coverage.' },
        { title: 'Group and individual benefits can be taxed differently', body: 'An employer-paid group disability benefit is often taxable income if a claim is paid, while a benefit from a policy you paid for with after-tax dollars is often not. A target set on gross income without accounting for this can overshoot or undershoot the real after-tax need.' },
        { title: 'SSDI is not a substitute for private coverage', body: 'The average SSDI benefit is a few hundred to a couple thousand dollars a month and is hard to qualify for quickly — it should not be counted as meaningful income replacement in this calculation.' },
        { title: 'Insurers cap how much you can buy', body: 'Because benefits are capped at 60-80% of income by design, you generally cannot insure 100% of your income even if you want to — this is meant to preserve the incentive to return to work, not to limit what you need.' },
        { title: 'This does not check your insurability', body: 'Actually obtaining a policy depends on underwriting — health, occupation and existing coverage all affect what an insurer will offer. This calculator only estimates the target number, not what you can buy.' }
      ],
      references: [
        { label: 'Council for Disability Insurance Awareness, "The Risk Is Very Real" (60-80% income-replacement figure, cost)', url: 'https://thecdia.org/the-risk-is-very-real/' },
        { label: 'Council for Disability Insurance Awareness, "Disability Statistics" (1 in 4 statistic, SSDI average benefit)', url: 'https://thecdia.org/disability-statistics/' }
      ]
    },
    inputs: [
      { id: 'annualIncome', label: 'Annual income', type: 'currency', placeholder: '72000', defaultValue: 72000, step: 1000, min: 0 },
      { id: 'desiredReplacementPercent', label: 'Target income-replacement percent', type: 'percent', placeholder: '60', defaultValue: 60, step: 5, min: 0 },
      { id: 'existingMonthlyBenefit', label: 'Existing monthly disability benefit', type: 'currency', placeholder: '1200', defaultValue: 1200, step: 50, min: 0 }
    ],
    seo: {
      title: 'Disability Insurance Needs Calculator – Income Replacement Gap',
      description: 'Find the gap between a target income-replacement percentage and your existing disability coverage, using the 60-80% range cited by the Council for Disability Insurance Awareness.',
      faq: [
        { question: 'How much disability insurance do I need?', answer: 'The Council for Disability Insurance Awareness states long-term disability coverage typically "covers between 60-80 percent of your income." Multiply your monthly income by a percentage in that range to get a target, then subtract any coverage you already have.' },
        { question: 'Why can\'t I buy disability insurance that replaces 100% of my income?', answer: 'Insurers cap benefits below 100% of income by design, so returning to work still pays more than staying on a disability claim. A 60-80% range is the commonly cited typical benefit level.' },
        { question: 'What is a worked example with no existing coverage?', answer: 'A $60,000 salary with a 65% target and no existing coverage needs a target monthly benefit of $3,250 ($60,000 ÷ 12 × 65%), all of it a gap since there is no existing benefit to subtract.' },
        { question: 'How likely am I to become disabled during my career?', answer: 'The Council for Disability Insurance Awareness states "just under one in four of today\'s 20-year-olds can expect to be out of work for at least a year because of a disabling condition before they reach the normal retirement age."' },
        { question: 'Is Social Security Disability Insurance enough on its own?', answer: 'Usually not. The Council for Disability Insurance Awareness states the average SSDI benefit was about $1,630 a month ($19,560 a year) as of February 2026 — below the federal poverty guideline for a two-person household, and far short of a 60-80% replacement rate for most incomes.' },
        { question: 'What if my existing coverage already exceeds my target?', answer: 'The gap shows as $0 — the calculator does not show a negative number, since there is no shortfall to close. A $50,000 salary with a 60% target ($2,500) and $3,000 of existing monthly coverage already exceeds the target.' },
        { question: 'Does this calculator check whether I can actually buy more coverage?', answer: 'No. It only estimates a target gap. Whether an insurer will offer that amount depends on underwriting factors like health, occupation and existing coverage.' }
      ]
    },
    compute(values) {
      const desiredMonthlyBenefit = (values.annualIncome / 12) * (values.desiredReplacementPercent / 100);
      const monthlyBenefitGap = Math.max(0, desiredMonthlyBenefit - values.existingMonthlyBenefit);
      const annualBenefitGap = monthlyBenefitGap * 12;
      const existingReplacementPercent = values.annualIncome === 0 ? 0 : ((values.existingMonthlyBenefit * 12) / values.annualIncome) * 100;
      return {
        monthlyBenefitGap,
        desiredMonthlyBenefit,
        existingReplacementPercent,
        annualBenefitGap,
        existingMonthlyBenefit: values.existingMonthlyBenefit
      };
    }
  },
  {
    id: 'long-term-care-insurance-needs-calculator',
    category: 'insurance',
    glyph: 'LTC',
    updatedAt: '2026-11-18',
    aliases: ['long term care cost calculator', 'ltc insurance needs calculator', 'nursing home cost gap calculator', 'how much long term care insurance do i need'],
    related: ['disability-insurance-needs-calculator', 'human-life-value-calculator', 'retirement-savings-calculator', 'whole-life-vs-term-life-cost-calculator'],
    title: 'Long-Term Care Insurance Needs Calculator',
    description: "Estimate the gap between a realistic cost of long-term care and the savings or insurance you already have set aside for it, using CareScout's (formerly Genworth's) annual Cost of Care Survey figures as a starting point.",
    example: 'At $74,400 a year (the 2025 median assisted living cost) for 3 years of care, with $50,000 of savings and a $12,000-a-year long-term care policy already in place, the estimated gap is $137,200 — current resources cover about 38.5% of the total.',
    breakdown: {
      headline: 'careCostGap',
      headlineLabel: 'Estimated care-cost gap',
      outputs: [
        { id: 'careCostGap', format: 'currency' },
        { id: 'totalCareCost', label: 'Total estimated cost of care', format: 'currency' },
        { id: 'totalExistingResources', label: 'Total existing resources for care', format: 'currency' },
        { id: 'percentCovered', label: 'Percent of the total already covered', format: 'percent' }
      ],
      groups: [
        { title: 'Cost of care', inputs: ['annualCareCost', 'careDurationYears'] },
        { title: 'What you already have', inputs: ['existingSavingsForCare', 'existingLtcAnnualBenefit'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'coveredAmount', label: 'Covered by savings & existing LTC coverage' },
          { from: 'careCostGap', label: 'Gap to plan for' }
        ],
        center: 'totalCareCost',
        centerSub: 'Total estimated cost'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What long-term care actually costs',
        paragraphs: [
          'Long-term care — help with daily activities like bathing, dressing or managing medication, usually needed later in life — is expensive, ongoing, and not covered by standard health insurance or, in most cases, by Medicare. CareScout (the successor to Genworth\'s long-running Cost of Care Survey) publishes national median costs each year from tens of thousands of care providers: its 2025 survey put a private nursing home room at $129,575 a year ($355 a day), an assisted living community at $74,400 a year ($6,200 a month), and a non-medical home health aide at $80,080 a year, based on 44 hours a week at $35 an hour.',
          "This calculator does not pick a care type for you — costs vary enormously by location, the level of care needed, and whether care happens at home or in a facility. Instead, enter your own estimate of the annual cost (CareScout's published figures above are a reasonable starting point) and how many years of care you are planning for, then compare that total against the savings and any long-term care insurance benefit you already have.",
          'Long-term care insurance exists specifically to close this kind of gap: a policy that pays a defined daily or monthly benefit toward care costs, so that savings and other assets are not the only resource standing between a household and the full cost CareScout\'s survey documents.'
        ]
      },
      howTo: {
        intro: "Enter a realistic annual cost of care and how many years you're planning for, then any savings set aside for care and any long-term care insurance benefit you already have.",
        steps: [
          { name: 'Enter an annual cost of care', text: "Use a current figure for your area and the type of care you're planning for — CareScout's national medians (nursing home, assisted living, or home health aide) are a starting point if you don't have a local figure." },
          { name: 'Enter a number of years', text: 'How many years of care you want to plan for. There is no single "average" duration that applies to everyone — needs range from under a year to many years, so pick a planning horizon that fits your own situation.' },
          { name: 'Enter savings set aside for care', text: 'Any savings or investments specifically earmarked, or that you would be willing to use, for long-term care costs.' },
          { name: 'Enter your existing LTC insurance benefit', text: "The annual benefit amount from a long-term care policy already in force, if any. Enter 0 if you don't have one." },
          { name: 'Read the result', text: 'The headline is the gap between the total estimated cost and what you already have. The donut shows how much of the total is already covered.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Total cost is the annual cost times years of care. Total resources are savings plus the insurance benefit times the same years. The gap is whatever cost is left uncovered.',
        expression: 'TotalCost = AnnualCost × Years\nTotalResources = Savings + (AnnualLTCBenefit × Years)\nGap = max(0, TotalCost − TotalResources)',
        terms: [
          { symbol: 'AnnualCost', meaning: 'Your estimated annual cost of the type of care you are planning for.' },
          { symbol: 'Years', meaning: 'The number of years of care you are planning for.' },
          { symbol: 'Savings', meaning: 'Savings or investments set aside, or available, for long-term care.' },
          { symbol: 'AnnualLTCBenefit', meaning: 'The annual benefit amount from a long-term care insurance policy already in force, 0 if none.' },
          { symbol: 'Gap', meaning: 'The portion of the total estimated cost not covered by existing savings and insurance.' }
        ],
        note: 'This is a simplified planning estimate. It does not model benefit periods, elimination periods, inflation riders, or benefit caps found in actual long-term care policies.'
      },
      workedExample: {
        intro: "Planning around CareScout's 2025 assisted-living median of $74,400 a year, for 3 years, with $50,000 in savings earmarked for care and a long-term care policy paying $12,000 a year.",
        rows: [
          { label: 'Total estimated cost ($74,400 × 3)', value: '$223,200' },
          { label: 'Total existing resources ($50,000 + $12,000 × 3)', value: '$86,000' },
          { label: 'Percent of total already covered ($86,000 ÷ $223,200)', value: '38.5%' },
          { label: 'Care-cost gap ($223,200 − $86,000)', value: '$137,200' }
        ],
        result: '$137,200 gap, with 38.5% already covered',
        explanation: 'Even with both savings and an active long-term care policy, this household\'s current resources cover well under half of the 3-year estimated cost — the kind of shortfall that additional savings, a larger policy benefit, or a shorter expected care duration would each help close.'
      },
      watchOut: [
        { title: 'This is an educational estimate, not a quote or an offer to sell insurance', body: 'This calculator estimates a planning gap. It does not sell, recommend or bind any policy, and is not a substitute for a licensed insurance agent or elder-law professional.' },
        { title: 'There is no single "average" duration of care', body: "How long someone needs long-term care varies enormously by individual health and circumstances. Don't anchor on one number as if it were a guarantee — consider a range of durations, not just one." },
        { title: 'Costs vary enormously by location and care type', body: "CareScout's national medians are a starting point, not a local quote — the same type of care can cost dramatically more or less depending on your region. Use a local figure if you have one." },
        { title: 'Medicare does not cover most long-term care', body: 'Standard Medicare covers only limited, short-term skilled nursing care after a hospital stay, not the extended custodial care this calculator is about. Medicaid can cover long-term care but generally only after a household has spent down most of its assets.' },
        { title: 'This does not model a real policy\'s actual terms', body: 'An actual long-term care policy has its own daily or monthly benefit cap, benefit period, elimination period, and often an inflation rider — all of which affect what it really pays out. This calculator only takes the annual benefit amount you enter at face value.' }
      ],
      references: [
        { label: 'CareScout, 2025 Cost of Care Survey (national median costs by care type)', url: 'https://www.carescout.com/cost-of-care' }
      ]
    },
    inputs: [
      { id: 'annualCareCost', label: 'Annual cost of care', type: 'currency', placeholder: '74400', defaultValue: 74400, step: 1000, min: 0 },
      { id: 'careDurationYears', label: 'Years of care planned for', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 0 },
      { id: 'existingSavingsForCare', label: 'Savings set aside for care', type: 'currency', placeholder: '50000', defaultValue: 50000, step: 5000, min: 0 },
      { id: 'existingLtcAnnualBenefit', label: 'Existing LTC insurance benefit (per year)', type: 'currency', placeholder: '12000', defaultValue: 12000, step: 1000, min: 0 }
    ],
    seo: {
      title: 'Long-Term Care Insurance Needs Calculator',
      description: "Estimate the gap between a realistic long-term care cost and the savings or insurance you already have, using CareScout's Cost of Care Survey figures.",
      faq: [
        { question: 'How much does long-term care cost?', answer: "CareScout's 2025 Cost of Care Survey reports a national median of $129,575 a year for a private nursing home room, $74,400 a year for assisted living, and $80,080 a year for a non-medical home health aide (44 hours a week)." },
        { question: 'How do I estimate my long-term care insurance need?', answer: 'Multiply your estimated annual cost of care by the number of years you are planning for, then subtract any savings earmarked for care and any annual benefit from a long-term care policy already in force.' },
        { question: 'What is a worked example using a nursing home cost?', answer: "Using CareScout's $129,575 private-room median for 2 years with $20,000 in savings and no existing LTC insurance: total cost is $259,150, resources cover $20,000 (7.7%), leaving a $239,150 gap." },
        { question: 'Does Medicare pay for long-term care?', answer: 'Only in limited circumstances — standard Medicare covers short-term skilled nursing care after a hospital stay, not the extended custodial care this calculator is about.' },
        { question: 'What is the "average" number of years someone needs long-term care?', answer: "There is no single figure that applies broadly — care duration varies by individual health and circumstances. This calculator asks you to set your own planning horizon rather than assuming one." },
        { question: 'What if my savings and insurance already exceed the estimated cost?', answer: 'The gap shows as $0. Using the assisted-living median of $74,400 for 2 years with $200,000 in savings and no LTC policy, the full $148,800 cost is already covered.' },
        { question: 'Does this calculator model my specific long-term care policy?', answer: "No. It treats the annual benefit you enter as a flat figure. A real policy's benefit period, elimination period, benefit cap and any inflation rider all affect what it actually pays — check your policy's own terms for those details." }
      ]
    },
    compute(values) {
      const totalCareCost = values.annualCareCost * values.careDurationYears;
      const totalExistingResources = values.existingSavingsForCare + values.existingLtcAnnualBenefit * values.careDurationYears;
      const coveredAmount = Math.min(totalExistingResources, totalCareCost);
      const careCostGap = Math.max(0, totalCareCost - totalExistingResources);
      const percentCovered = totalCareCost === 0 ? 0 : Math.min(100, (totalExistingResources / totalCareCost) * 100);
      return { careCostGap, totalCareCost, totalExistingResources, coveredAmount, percentCovered };
    }
  }
];
