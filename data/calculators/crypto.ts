// Crypto category (step 65, Wave 5): hypothetical-projection and arithmetic tools for DCA,
// staking/compound growth, portfolio rebalancing, profit/loss, breakeven price, and a US
// capital-gains tax estimate. See mdFiles/steps/65-wave-5-crypto.md.
//
// Every calculator here is explicitly a "what if" projection or plain arithmetic tool, never a
// price prediction and never financial advice — this is stated directly in `watchOut` on every
// single one, turned up further than finance's usual disclaimer discipline given crypto's extra
// volatility and regulatory sensitivity. No calculator in this file reads or assumes a live price
// feed; every price is a number the person types in themselves (this site is `force-static`).
import type { CalculatorConfig } from './types.ts';

// --- crypto-tax-estimate-calculator helpers ----------------------------------------------------
// 2026 federal brackets (Internal Revenue Service, Rev. Proc. 2025-32, Internal Revenue Bulletin
// 2025-45): cumulative upper bound (dollars) paired with that bracket's rate (percent). The last
// bracket's bound is Infinity. Same figures already cited by finance.ts's income-tax-calculator.
const ORDINARY_BRACKETS_2026: Record<number, [number, number][]> = {
  0: [[12400, 10], [50400, 12], [105700, 22], [201775, 24], [256225, 32], [640600, 35], [Infinity, 37]], // single
  1: [[24800, 10], [100800, 12], [211400, 22], [403550, 24], [512450, 32], [768700, 35], [Infinity, 37]], // married filing jointly
  2: [[12400, 10], [50400, 12], [105700, 22], [201775, 24], [256225, 32], [384350, 35], [Infinity, 37]], // married filing separately
  3: [[17700, 10], [67450, 12], [105700, 22], [201750, 24], [256200, 32], [640600, 35], [Infinity, 37]] // head of household
};

// 2026 long-term capital-gains thresholds (Rev. Proc. 2025-32 §4.03's "maximum zero rate amount"
// and "maximum 15 percent rate amount"): below the first bound is 0%, up to the second is 15%,
// above it is 20%.
const LTCG_BRACKETS_2026: Record<number, [number, number][]> = {
  0: [[49450, 0], [545500, 15], [Infinity, 20]], // single
  1: [[98900, 0], [613700, 15], [Infinity, 20]], // married filing jointly
  2: [[49450, 0], [306850, 15], [Infinity, 20]], // married filing separately
  3: [[66200, 0], [579600, 15], [Infinity, 20]] // head of household
};

// Cumulative tax on `income` under a progressive bracket table — each bracket's rate applies only
// to the slice of income inside it. Works identically for the ordinary brackets and the three-tier
// 0/15/20% long-term capital-gains "brackets" above, since both are just progressive rate tables.
function bracketTax(income: number, brackets: [number, number][]) {
  let tax = 0;
  let prevLimit = 0;
  for (const [limit, rate] of brackets) {
    if (income <= prevLimit) break;
    const upperInThisBracket = Math.min(income, limit);
    tax += (upperInThisBracket - prevLimit) * (rate / 100);
    prevLimit = limit;
    if (income <= limit) break;
  }
  return tax;
}

function marginalRateAt(income: number, brackets: [number, number][]) {
  for (const [limit, rate] of brackets) if (income <= limit) return rate;
  return brackets[brackets.length - 1][1];
}

// The real "stacking" method both the IRS ordinary brackets and the LTCG 0/15/20% thresholds use:
// other income fills the table from zero first, and the gain sits on top of it — so the same gain
// can span two rates depending on how much other income already fills the table below it.
function stackedTax(otherIncome: number, gain: number, brackets: [number, number][]) {
  if (gain <= 0) return 0;
  return bracketTax(otherIncome + gain, brackets) - bracketTax(otherIncome, brackets);
}

export const cryptoCalculators: CalculatorConfig[] = [
  {
    id: 'crypto-dca-calculator',
    category: 'crypto',
    glyph: 'DCA',
    updatedAt: '2026-11-18',
    aliases: ['dollar cost averaging calculator', 'crypto dca calculator', 'bitcoin dca calculator', 'average cost basis calculator', 'recurring crypto investment calculator'],
    related: ['crypto-compound-growth-calculator', 'crypto-profit-loss-calculator', 'compound-interest-calculator', 'investment-calculator'],
    title: 'Crypto DCA Calculator (Dollar-Cost Averaging)',
    description:
      'Enter a fixed amount invested every period and the price you paid (or assume) each time to find your dollar-cost-averaged cost basis, total units acquired, and unrealized gain or loss at a price you assume. Every price is one you type in — never a live feed.',
    example:
      'Investing $100 every period across six periods at prices of $20,000, $25,000, $16,000, $22,000, $28,000 and $19,000 buys about 0.028630 units for $600 total — an average cost basis of about $20,957.01 per unit, below the $21,666.67 simple average of those six prices.',
    inputs: [
      { id: 'periodInvestment', label: 'Investment per period', type: 'currency', placeholder: '100', defaultValue: 100, step: 10, min: 0 },
      {
        id: 'prices',
        label: 'Price at each purchase, in order',
        type: 'list',
        placeholder: 'Paste or type the price you paid (or assume) each period — commas, spaces or new lines between them.',
        defaultValue: 0,
        listDefault: [20000, 25000, 16000, 22000, 28000, 19000],
        listMin: 2
      },
      { id: 'currentPrice', label: 'Current or assumed price (optional)', type: 'currency', placeholder: '24000', defaultValue: 24000, step: 100, min: 0 }
    ],
    breakdown: {
      headline: 'averageCostBasis',
      headlineLabel: 'Average cost basis per unit',
      outputs: [
        { id: 'averageCostBasis', label: 'Average cost basis per unit', format: 'currency' },
        { id: 'totalInvested', label: 'Total invested', format: 'currency' },
        { id: 'totalUnitsAcquired', label: 'Total units acquired', format: 'significant' },
        { id: 'currentValue', label: 'Current value (at the price above)', format: 'currency' },
        { id: 'unrealizedGainLoss', label: 'Unrealized gain/loss', format: 'currency' },
        { id: 'unrealizedGainLossPercent', label: 'Unrealized gain/loss %', format: 'percent' }
      ],
      groups: [
        { title: 'Recurring investment', inputs: ['periodInvestment'] },
        { title: 'Current or assumed price (optional)', inputs: ['currentPrice'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'totalInvested', label: 'Total invested' }, { from: 'currentValue', label: 'Current value' }],
        title: 'Total invested vs. current value',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What dollar-cost averaging actually changes',
        paragraphs: [
          'FINRA describes dollar-cost averaging plainly: "With dollar-cost averaging, you invest your money in equal portions, at regular intervals, regardless of current market conditions" — the same fixed amount every week, month or paycheck, instead of trying to time one lump-sum purchase. This calculator runs the arithmetic behind that strategy: it takes your fixed investment per period and the price you paid (or are assuming) at each of those periods, and works out your dollar-cost-averaged cost basis — the effective average price you paid per unit, once every purchase is counted.',
          "That average isn't the same as simply averaging the prices themselves. A fixed dollar amount buys more units when the price is low and fewer units when the price is high, so the average automatically weights itself toward the cheaper periods — in the worked example below, the dollar-cost-averaged basis comes out about 3.28% below the plain average of the same six prices, because more dollars (in unit terms) landed in the three below-average-price periods than the three above-average ones.",
          "Every price here — historical or assumed — is a number you type in. This site is static and has no live price feed, so this tool cannot look up, track or predict any actual market price. Treat it as a hypothetical or historical \"what if I had DCA'd at these prices\" calculation, never a forecast of what any crypto asset will do next, and never financial advice."
        ]
      },
      howTo: {
        intro: 'Enter your fixed investment per period, then the price at each purchase, in order.',
        steps: [
          { name: 'Enter your investment per period', text: 'The fixed dollar amount invested every period — the same amount each time, which is what makes this dollar-cost averaging rather than an ad hoc purchase schedule.' },
          { name: 'List the price at each purchase', text: 'Paste or type the price you paid (or are assuming) at every period, in order — as many periods as you like.' },
          { name: 'Enter a current or assumed price (optional)', text: 'To see an unrealized gain or loss, enter a price to value your total units at. Leave the historical list alone if you only want the average cost basis and total units.' },
          { name: 'Read the average cost basis', text: 'The headline is your dollar-cost-averaged cost per unit, with the total invested and total units acquired shown below it.' },
          { name: 'Read the unrealized gain or loss', text: 'Computed from your total units at the current/assumed price above, compared against your total invested.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing you enter is sent or stored.'
      },
      formula: {
        intro: 'Each period buys however many units that period\'s fixed investment can afford at that period\'s price; the average cost basis is the total spent divided by the total units that bought.',
        expression: 'unitsBought (period i) = investment ÷ price(i)\ntotalUnits = Σ unitsBought(i)\ntotalInvested = investment × n\naverageCostBasis = totalInvested ÷ totalUnits',
        terms: [
          { symbol: 'investment', meaning: 'The fixed amount invested every period.' },
          { symbol: 'price(i)', meaning: 'The price at period i — historical or assumed, always a number you supply.' },
          { symbol: 'n', meaning: 'The number of periods (prices) entered.' },
          { symbol: 'totalUnits', meaning: 'The sum of every period\'s units bought — more units accumulate from periods with a lower price.' }
        ],
        note: 'This average cost basis is for tracking your own average purchase price. Your actual tax cost basis may follow a different accounting method (FIFO, specific identification) — see the IRS Digital Assets reference below. This is a hypothetical or historical calculation, never a price forecast or investment recommendation.'
      },
      workedExample: {
        intro: 'Invest $100 every period for six periods, at prices of $20,000, $25,000, $16,000, $22,000, $28,000 and $19,000.',
        rows: [
          { label: 'Units bought each period (100 ÷ price)', value: '0.005000, 0.004000, 0.006250, 0.004545, 0.003571, 0.005263' },
          { label: 'Total units (sum of the six)', value: '0.028630' },
          { label: 'Total invested (100 × 6)', value: '$600.00' },
          { label: 'Average cost basis (600 ÷ 0.028630)', value: '$20,957.01' },
          { label: 'Simple average of the six prices (contrast only)', value: '$21,666.67' },
          { label: 'Value at an assumed current price of $24,000 (0.028630 × 24,000)', value: '$687.12' },
          { label: 'Unrealized gain/loss (687.12 − 600)', value: '$87.12 (14.52%)' }
        ],
        result: 'Average cost basis ≈ $20,957.01 per unit for 0.028630 total units; at an assumed $24,000 current price, that is worth about $687.12 — an unrealized gain of about $87.12 (14.52%).',
        explanation: 'The dollar-cost-averaged basis ($20,957.01) sits about 3.28% below the plain average of the six prices ($21,666.67), because the fixed $100 bought more units during the three cheaper periods ($20,000, $16,000, $19,000) than during the three pricier ones — exactly the smoothing effect dollar-cost averaging is meant to produce.'
      },
      watchOut: [
        { title: 'Never a price feed, and never a forecast', body: 'This calculator has no connection to any exchange or market data source — every price is one you typed in, historical or assumed. It cannot tell you what any crypto asset is worth right now or will be worth later, and nothing here is investment advice.' },
        { title: 'Your tax cost basis may differ from this average', body: 'The IRS treats crypto as property, and real tax reporting usually tracks cost basis per lot (FIFO or specific identification), not a single blended average across every purchase. Use this average for your own tracking, and see the crypto tax-estimate calculator for the tax side of an actual disposal.' },
        { title: 'Trading fees are not added automatically', body: 'If your real purchases also paid a fee each period, either add it into "investment per period" yourself or treat this average cost basis as slightly optimistic.' },
        { title: 'A short price list does not demonstrate DCA\'s real-world case', body: 'Dollar-cost averaging is usually discussed as a way to reduce the impact of volatility over many purchases across months or years — six entries here are enough to show the arithmetic, not to prove the strategy works over any particular real time period.' },
        { title: 'This says nothing about where a price will go next', body: 'A low average cost basis in this calculator only reflects the prices you already entered. It has no predictive value for any future price, and should never be treated as one.' }
      ],
      references: [
        { label: 'FINRA, Dollar-Cost Averaging', url: 'https://www.finra.org/investors/insights/dollar-cost-averaging' },
        { label: 'Internal Revenue Service, Digital Assets (recordkeeping: acquisition date, fair market value and basis)', url: 'https://www.irs.gov/filing/digital-assets' }
      ]
    },
    seo: {
      title: 'Crypto DCA Calculator – Dollar-Cost Averaging',
      description: 'Free crypto DCA calculator: enter your recurring investment and each period\'s price to find your average cost basis, total units, and unrealized gain/loss.',
      faq: [
        { question: 'What is dollar-cost averaging?', answer: 'Investing a fixed amount at regular intervals regardless of price, instead of one lump sum — FINRA defines it as investing "in equal portions, at regular intervals, regardless of current market conditions." A fixed amount buys more units when the price is low and fewer when it is high.' },
        { question: 'How is a dollar-cost-averaged cost basis calculated?', answer: 'Divide the total amount invested by the total units it bought: totalInvested ÷ Σ(investment ÷ price at each period). It is not the plain average of the prices — it is weighted toward the periods where your fixed amount bought more units.' },
        { question: 'Does this calculator use real, live crypto prices?', answer: 'No. This site is static and has no live price feed. Every price in the list is one you type in yourself — a historical price you remember or an assumed one for planning.' },
        { question: 'Why is the DCA average lower than the simple average of the prices?', answer: 'Because the fixed investment buys more units during cheaper periods. In the worked example, the $100-per-period average cost ($20,957.01) comes out about 3.28% below the plain average of the six prices ($21,666.67).' },
        { question: 'Can this show a loss instead of a gain?', answer: 'Yes. If the current or assumed price you enter is below your average cost basis, the unrealized gain/loss row and percentage both show a negative number.' },
        { question: 'Is this the same number my exchange or tax software will use?', answer: 'Not necessarily. Real cost-basis tracking for taxes usually follows a specific accounting method (like FIFO) applied per purchase lot, not one blended average across every purchase — this calculator is for your own planning, not a tax filing.' },
        { question: 'Is this a recommendation to buy or sell?', answer: 'No. This is a hypothetical or historical arithmetic tool only. It does not predict future prices and is not financial advice.' }
      ]
    },
    compute(values, lists) {
      const prices = lists.prices;
      const n = prices.length;
      const noAnswer = { averageCostBasis: NaN, totalInvested: NaN, totalUnitsAcquired: NaN, currentValue: NaN, unrealizedGainLoss: NaN, unrealizedGainLossPercent: NaN };
      if (n === 0 || values.periodInvestment <= 0 || prices.some((p) => !(p > 0))) return noAnswer;
      const totalInvested = values.periodInvestment * n;
      const totalUnitsAcquired = prices.reduce((sum, price) => sum + values.periodInvestment / price, 0);
      const averageCostBasis = totalInvested / totalUnitsAcquired;
      const currentValue = totalUnitsAcquired * values.currentPrice;
      const unrealizedGainLoss = currentValue - totalInvested;
      const unrealizedGainLossPercent = (unrealizedGainLoss / totalInvested) * 100;
      return { averageCostBasis, totalInvested, totalUnitsAcquired, currentValue, unrealizedGainLoss, unrealizedGainLossPercent };
    }
  },
  {
    id: 'crypto-compound-growth-calculator',
    category: 'crypto',
    glyph: 'APY',
    updatedAt: '2026-11-18',
    aliases: ['crypto growth calculator', 'crypto apy calculator', 'projected crypto value calculator', 'crypto future value calculator', 'bitcoin growth projection calculator'],
    related: ['staking-rewards-calculator', 'crypto-dca-calculator', 'compound-interest-calculator', 'inflation-calculator'],
    title: 'Crypto Compound Growth Calculator (APY Projection)',
    description:
      'Project what a crypto holding could grow to at an assumed annual percentage yield (APY) over time, or solve for the starting value, time or rate a target needs — a hypothetical, compounding-math projection, never a price forecast.',
    example: '$5,000 growing at an assumed 8% APY for 5 years projects to about $7,346.64 — about $2,346.64 of hypothetical growth, assuming that one rate held exactly every year, which no real crypto yield ever does.',
    solver: {
      defaultTarget: 'futureValue',
      variables: [
        { id: 'futureValue', label: 'Projected value', symbol: 'FV', dimension: 'currency', defaultValue: 7346.64, defaultUnit: 'currency' },
        { id: 'principal', label: 'Starting value', symbol: 'P', dimension: 'currency', defaultValue: 5000, defaultUnit: 'currency' },
        { id: 'years', label: 'Time', symbol: 't', dimension: 'term', defaultValue: 5, defaultUnit: 'yr', bounds: [0, 1200] },
        { id: 'annualRate', label: 'Assumed APY', symbol: 'r', dimension: 'percent', defaultValue: 8, defaultUnit: '%', bounds: [-99, 1000] }
      ],
      // `years` arrives in months (the term dimension's base) — divide by 12 for the exponent in years.
      solve: {
        futureValue: ({ principal, years, annualRate }) => (years >= 0 ? principal * Math.pow(1 + annualRate / 100, years / 12) : NaN),
        principal: ({ futureValue, years, annualRate }) => {
          const denom = Math.pow(1 + annualRate / 100, years / 12);
          return years >= 0 && denom > 0 ? futureValue / denom : NaN;
        },
        years: ({ futureValue, principal, annualRate }) => {
          const base = 1 + annualRate / 100;
          if (!(principal > 0) || !(futureValue >= 0) || !(base > 0) || base === 1) return NaN;
          const yrs = Math.log(futureValue / principal) / Math.log(base);
          return yrs >= 0 ? yrs * 12 : NaN;
        },
        annualRate: ({ futureValue, principal, years }) => {
          const yrs = years / 12;
          if (!(principal > 0) || !(futureValue >= 0) || !(yrs > 0)) return NaN;
          return (Math.pow(futureValue / principal, 1 / yrs) - 1) * 100;
        }
      },
      outputs: [{ id: 'totalGrowth', label: 'Hypothetical growth', dimension: 'currency', compute: (si) => si.futureValue - si.principal }],
      visuals: [
        {
          type: 'donut',
          segments: [{ from: 'principal', label: 'Starting value' }, { from: 'totalGrowth', label: 'Hypothetical growth' }],
          center: 'futureValue',
          centerSub: 'projected value'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What an "APY projection" is — and is not',
        paragraphs: [
          'Wolfram MathWorld gives the general compound-growth formula as A = P(1 + r)^(nt) for a principal P re-invested at a periodic rate over nt periods. An annual percentage yield (APY), as used throughout this site\'s savings calculators, already bakes in whatever compounding actually happens over a year — so projecting forward from a single assumed APY is just that same formula with one compounding period per year: FV = P × (1 + r)^t. This calculator solves that one equation for any of its four pieces: the projected value, the starting value, the time, or the rate a target requires.',
          'A bank\'s APY is disclosed under truth-in-savings rules and backed by a specific, regulated account. A crypto platform\'s advertised "APY" is neither of those things — it is usually a snapshot of a recent reward rate that can change without notice, and nothing stops it from simply not being realized at all. Whatever rate you enter here is entirely your own assumption; this calculator does not know, check, or validate it against anything.',
          'This is a hypothetical compounding projection, not a forecast of what any crypto asset will actually be worth and never financial advice. It does not model fees, taxes, volatility, or the risk that a platform, protocol, or project fails entirely — all of which can turn an assumed positive rate into a real loss.'
        ]
      },
      howTo: {
        intro: 'Every field is an input; the least recently edited one is calculated automatically.',
        steps: [
          { name: 'Enter the starting value and assumed APY', text: 'Your holding\'s current value, and a rate you are assuming (not one this calculator looks up or guarantees).' },
          { name: 'Enter the time', text: 'How long you are projecting forward, in years or months.' },
          { name: 'Read the projected value', text: 'The headline, with the hypothetical growth (projected value minus starting value) shown below it.' },
          { name: 'Or solve backward', text: 'Type a target into the projected value field and leave the time or the rate alone to see how long it would take, or what rate it would require, to reach that target from your starting value.' },
          { name: 'Switch years and months', text: 'Use the menu beside the time field to enter it either way.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'One assumed annual rate, compounded once per year — the same math as the general compound-growth formula, specialized to an APY that already reflects whatever compounding actually happens.',
        expression: 'FV = P × (1 + r)^t\nP = FV ÷ (1 + r)^t\nt = ln(FV ÷ P) ÷ ln(1 + r)\nr = (FV ÷ P)^(1/t) − 1',
        terms: [
          { symbol: 'FV', meaning: 'Projected value at the end of the time period.' },
          { symbol: 'P', meaning: 'Starting value of the holding.' },
          { symbol: 'r', meaning: 'The assumed APY, as a percent.' },
          { symbol: 't', meaning: 'Time, in years.' }
        ],
        note: 'This calculator does not ask for a separate compounding frequency, because an APY already reflects whatever compounding occurred — the staking rewards calculator instead takes a nominal rate plus a chosen compounding frequency, which is the more common way staking platforms quote their own rates. This is a hypothetical growth projection only — not a forecast, and not financial advice.'
      },
      workedExample: {
        intro: 'A $5,000 holding is assumed to grow at a flat 8% APY for 5 years. What does that project to?',
        rows: [
          { label: 'Growth factor (1.08^5)', value: '1.469328' },
          { label: 'Projected value (5,000 × 1.469328)', value: '$7,346.64' },
          { label: 'Hypothetical growth (7,346.64 − 5,000)', value: '$2,346.64' },
          { label: 'Exact doubling time at 8% (ln 2 ÷ ln 1.08)', value: '≈9.01 years' },
          { label: 'Rule-of-72 estimate (72 ÷ 8)', value: '9 years' }
        ],
        result: 'Projected value ≈ $7,346.64 after 5 years — about $2,346.64 of hypothetical growth.',
        explanation: 'At a flat 8% a year, this holding would need about 9.01 years to double — very close to the Rule of 72\'s quick estimate of 9 years, which is accurate for the moderate rates typical of a savings account but increasingly approximate at the much larger rates sometimes advertised for crypto yield products.'
      },
      watchOut: [
        { title: 'A hypothetical projection, never a forecast', body: 'This calculator only runs the compounding math on a rate you assume. It has no connection to any market, exchange, or yield platform, and nothing it shows is a prediction of what any crypto asset or yield product will actually do.' },
        { title: 'Crypto "APY" is not insured or guaranteed', body: 'Unlike a bank APY, a crypto platform\'s advertised yield is not FDIC- or SIPC-insured, is not fixed by regulation, and can be changed or discontinued by the platform at any time. Treat any rate you enter as your own assumption, not a promise.' },
        { title: 'No fees, taxes, or volatility modeled', body: 'This projects a single smooth growth rate. It does not subtract trading or withdrawal fees, does not account for the tax owed on any eventual gain (see the crypto tax-estimate calculator), and does not model price volatility at all.' },
        { title: 'Platform or protocol failure is a real, separate risk', body: 'A yield-bearing crypto product can lose some or all of its value if the underlying platform, protocol, or counterparty fails — a risk this purely mathematical projection cannot represent.' },
        { title: 'Solving backward shows what a goal requires, not what to expect', body: 'Typing a target value and solving for the rate shows the rate that goal mathematically needs — it is not a suggestion that such a rate is realistic or available anywhere.' }
      ],
      references: [
        { label: 'OpenStax, Contemporary Mathematics, §6.4 Compound Interest', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest' },
        { label: 'Wolfram MathWorld, Compound Interest', url: 'https://mathworld.wolfram.com/CompoundInterest.html' }
      ]
    },
    inputs: [
      { id: 'principal', label: 'Starting value', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 100, min: 0 },
      { id: 'annualRate', label: 'Assumed APY', type: 'percent', placeholder: '8', defaultValue: 8, step: 0.1, min: -99 },
      { id: 'years', label: 'Time (years)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 }
    ],
    seo: {
      title: 'Crypto Compound Growth Calculator – APY Projection',
      description: 'Free crypto compound growth calculator. Project a holding at an assumed APY, or solve for the start, time, or rate. A hypothetical projection, not advice.',
      faq: [
        { question: 'How is crypto compound growth projected?', answer: 'FV = P × (1 + r)^t, where P is the starting value, r is the assumed APY as a decimal, and t is time in years. $5,000 at 8% for 5 years projects to about $7,346.64.' },
        { question: 'Is this a prediction of what my crypto will be worth?', answer: 'No. This is a hypothetical compounding projection based on whatever rate you assume. It is not a forecast, not investment advice, and has no connection to any real market or platform.' },
        { question: 'How is this different from the staking rewards calculator?', answer: 'This calculator takes a single APY (which already reflects whatever compounding happens) and projects growth with annual compounding. The staking rewards calculator instead takes a nominal annual rate and a compounding frequency you choose, matching how many staking platforms actually quote and distribute rewards.' },
        { question: 'How long would it take an assumed rate to double my holding?', answer: 'At 8% a year, about 9.01 years exactly (ln 2 ÷ ln 1.08) — close to the Rule of 72\'s quick estimate of 9 years (72 ÷ 8).' },
        { question: 'What rate would I need to hit a target value?', answer: 'Enter the target as the projected value, fill in the starting value and time, and leave the rate field alone longest — the calculator solves r = (FV ÷ P)^(1/t) − 1 for you.' },
        { question: 'Does this include fees or taxes?', answer: 'No. It projects a single smooth growth rate only. Use the crypto tax-estimate calculator separately to estimate tax on an eventual gain.' },
        { question: 'Are crypto yields like this guaranteed?', answer: 'No. Unlike a bank APY, crypto yields are not insured or regulated the same way, can change at any time, and the underlying platform can lose value entirely — none of which this purely mathematical projection can represent.' }
      ]
    },
    compute(values) {
      const futureValue = values.principal * Math.pow(1 + values.annualRate / 100, values.years);
      const totalGrowth = futureValue - values.principal;
      return { futureValue, totalGrowth };
    }
  },
  {
    id: 'staking-rewards-calculator',
    category: 'crypto',
    glyph: 'STK',
    updatedAt: '2026-11-18',
    aliases: ['staking rewards calculator', 'crypto staking calculator', 'staking apy calculator', 'staking yield calculator'],
    related: ['crypto-compound-growth-calculator', 'crypto-dca-calculator', 'compound-interest-calculator', 'cd-calculator'],
    title: 'Staking Rewards Calculator',
    description:
      'Project the rewards a staked crypto principal could earn at a nominal annual reward rate, compounded as often as you choose (or not at all) — a hypothetical projection of staking mechanics, never a promised return.',
    example: '$10,000 staked at a 6% nominal annual reward rate, compounded monthly, projects to about $11,966.81 after 3 years — about $1,966.81 of hypothetical rewards, versus just $1,800 if those rewards were never reinvested at all.',
    inputs: [
      { id: 'principal', label: 'Amount staked', type: 'currency', placeholder: '10000', defaultValue: 10000, step: 100, min: 0 },
      { id: 'nominalApr', label: 'Nominal annual reward rate', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.1, min: 0 },
      { id: 'years', label: 'Time staked (years)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      {
        id: 'compoundingFrequency',
        label: 'How often rewards compound',
        type: 'number',
        placeholder: '12',
        defaultValue: 12,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'No compounding (simple)' },
          { value: 365, label: 'Daily' },
          { value: 52, label: 'Weekly' },
          { value: 12, label: 'Monthly' },
          { value: 4, label: 'Quarterly' },
          { value: 1, label: 'Annually' }
        ]
      }
    ],
    breakdown: {
      headline: 'rewardsEarned',
      headlineLabel: 'Hypothetical staking rewards',
      outputs: [
        { id: 'rewardsEarned', label: 'Hypothetical staking rewards', format: 'currency' },
        { id: 'endingBalance', label: 'Ending balance', format: 'currency' },
        { id: 'effectiveApy', label: 'Effective annual yield', format: 'percent' }
      ],
      groups: [
        { title: 'Staking details', inputs: ['principal', 'nominalApr', 'years'] },
        { title: 'Compounding', inputs: ['compoundingFrequency'] }
      ],
      visual: {
        type: 'donut',
        segments: [{ from: 'principal', label: 'Principal staked' }, { from: 'rewardsEarned', label: 'Hypothetical rewards' }],
        center: 'endingBalance',
        centerSub: 'ending balance'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Nominal rate vs. effective yield, and why staking quotes both',
        paragraphs: [
          'Proof-of-stake blockchains pay rewards to participants who lock up ("stake") tokens to help validate the network, typically distributed in small amounts on a regular schedule — daily or even more often on many networks — rather than once a year. Platforms usually advertise that reward schedule as a nominal annual rate (sometimes shown as "APR"), with the actual effective annual yield depending on how often those small rewards are added back to the staked balance and start earning their own rewards.',
          'This calculator keeps the nominal rate and the compounding frequency as two separate inputs, exactly matching that real mechanic — distinct from this site\'s general crypto compound-growth calculator, which instead takes a single APY that already has compounding baked into it. Switching the frequency here from no compounding to daily compounding, with every other input held fixed, shows exactly how much that difference is worth over time.',
          'This is a hypothetical projection of the mechanics of staking rewards, not a promise of any actual return. Real staking carries risks this simple arithmetic cannot represent — a validator can be penalized ("slashed"), tokens are often locked up or subject to an unbonding delay before they can be withdrawn, and advertised reward rates are not fixed or guaranteed the way a bank APY is. Nothing here is financial advice.'
        ]
      },
      howTo: {
        intro: 'Enter the staked amount, the nominal annual reward rate, the time staked, and how often rewards compound.',
        steps: [
          { name: 'Enter the amount staked', text: 'The principal you are staking (or assuming you stake).' },
          { name: 'Enter the nominal annual reward rate', text: 'The rate as typically advertised, before accounting for how often it compounds.' },
          { name: 'Enter the time staked', text: 'In years — fractional years (like 0.5 for six months) work too.' },
          { name: 'Choose the compounding frequency', text: 'How often rewards are added back to the staked balance and start earning their own rewards — daily, weekly, monthly, quarterly, annually, or not at all.' },
          { name: 'Read the hypothetical rewards and ending balance', text: 'The headline is the total rewards; the effective annual yield row shows what that compounding frequency turns the nominal rate into.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you enter is sent or stored.'
      },
      formula: {
        intro: 'With compounding, rewards are added n times a year and start earning their own rewards from that point forward; without it, rewards accrue only on the original principal.',
        expression: 'With compounding: endingBalance = principal × (1 + rate/n)^(n × years)\nWithout compounding: endingBalance = principal × (1 + rate × years)\nrewardsEarned = endingBalance − principal\neffectiveApy = (1 + rate/n)^n − 1',
        terms: [
          { symbol: 'rate', meaning: 'The nominal annual reward rate, as a decimal (6% is 0.06).' },
          { symbol: 'n', meaning: 'Compounding frequency per year: 365 (daily), 52 (weekly), 12 (monthly), 4 (quarterly), or 1 (annually). 0 means no compounding at all.' },
          { symbol: 'effectiveApy', meaning: 'The actual annual yield that compounding frequency produces from the nominal rate — always at or above the nominal rate itself.' }
        ],
        note: 'A hypothetical projection only. Staking rewards are not guaranteed, are not insured the way a bank deposit is, and real staking carries slashing and unbonding-delay risks this calculator does not model. Not financial advice.'
      },
      workedExample: {
        intro: '$10,000 staked at a 6% nominal annual reward rate for 3 years. How much difference does compounding frequency make?',
        rows: [
          { label: 'No compounding (simple): 10,000 × 6% × 3', value: '$1,800.00 in rewards' },
          { label: 'Annual compounding: 10,000 × 1.06^3 − 10,000', value: '$1,910.16 in rewards' },
          { label: 'Monthly compounding: 10,000 × (1 + 0.06/12)^36 − 10,000', value: '$1,966.81 in rewards' },
          { label: 'Ending balance, monthly compounding', value: '$11,966.81' },
          { label: 'Effective annual yield, monthly compounding ((1 + 0.06/12)^12 − 1)', value: '6.17%' }
        ],
        result: 'Monthly compounding projects to about $11,966.81 after 3 years — $1,966.81 in hypothetical rewards, $166.81 more than annual compounding and $166.81 more than if the rewards were simply never reinvested.',
        explanation: 'The nominal rate stays 6% throughout; only the compounding frequency changes. More frequent compounding lets each small reward start earning its own rewards sooner, which is why the effective annual yield (6.17%) comes out above the 6% nominal rate the more often it compounds.'
      },
      watchOut: [
        { title: 'A hypothetical projection, not a promised return', body: 'This calculator only runs the compounding math on a rate you assume. Nothing here is a guarantee that any staking product will pay this rate, and nothing here is financial advice.' },
        { title: 'Staking rewards are not insured or guaranteed', body: 'Unlike a bank deposit, staked crypto is not FDIC- or SIPC-insured, and advertised reward rates can change at any time or not be paid at all.' },
        { title: 'Slashing and unbonding delays are real risks this does not model', body: 'Many proof-of-stake networks can penalize ("slash") a validator\'s staked tokens for misbehavior or downtime, and withdrawing staked tokens is often subject to a lock-up or unbonding delay — neither is represented in this pure compounding arithmetic.' },
        { title: 'Staking rewards are generally taxable when received', body: 'In the US, the IRS treats staking rewards as taxable income at their fair market value when received (see Revenue Ruling 2023-14, referenced on the IRS Digital Assets page below), regardless of whether you have sold them — this calculator does not estimate that tax.' },
        { title: 'The rate you enter rarely stays fixed in reality', body: 'Real network reward rates usually move with total stake, validator count, and protocol rules over time — this calculator assumes one flat rate for the whole period, which is a simplification, not a prediction.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Digital Assets (links Revenue Ruling 2023-14 on the taxability of staking income)', url: 'https://www.irs.gov/filing/digital-assets' },
        { label: 'OpenStax, Contemporary Mathematics, §6.4 Compound Interest', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest' }
      ]
    },
    seo: {
      title: 'Staking Rewards Calculator – Crypto Staking Yield',
      description: 'Free staking rewards calculator. Project rewards on a staked principal at a nominal rate, compounded daily, monthly, or your own frequency. Not a guarantee.',
      faq: [
        { question: 'How are staking rewards calculated?', answer: 'With compounding: endingBalance = principal × (1 + rate/n)^(n × years), where n is how many times a year rewards compound. Without compounding, rewards are simply principal × rate × years.' },
        { question: 'What is the difference between the nominal rate and the effective yield?', answer: 'The nominal rate is the quoted annual rate before compounding. The effective annual yield is what that rate actually becomes once compounding is applied — in the worked example, a 6% nominal rate compounded monthly becomes an effective 6.17% annual yield.' },
        { question: 'Does compounding frequency matter much?', answer: 'Some. $10,000 at 6% for 3 years earns $1,800 with no compounding, $1,910.16 compounded annually, and $1,966.81 compounded monthly — the gap grows with the rate and the time period.' },
        { question: 'How is this different from the crypto compound growth calculator?', answer: 'That calculator takes one APY that already reflects compounding. This one takes a nominal rate plus your own choice of compounding frequency, matching how staking platforms typically quote and distribute rewards.' },
        { question: 'Are staking rewards guaranteed?', answer: 'No. Reward rates can change, and staked tokens can be penalized ("slashed") or locked up for a delay before withdrawal. This calculator only projects the arithmetic of a rate you assume.' },
        { question: 'Are staking rewards taxable?', answer: 'In the US, yes — the IRS treats staking rewards as taxable income at their fair market value when received, per Revenue Ruling 2023-14, regardless of whether they are later sold. This calculator does not estimate that tax.' },
        { question: 'What does a compounding frequency of 0 mean?', answer: '"No compounding (simple)" — rewards accrue only on the original principal and are never added back in to earn their own rewards.' }
      ]
    },
    compute(values) {
      const { principal, nominalApr, years, compoundingFrequency: n } = values;
      const rate = nominalApr / 100;
      if (!(principal >= 0) || !(years >= 0) || !(n >= 0)) return { rewardsEarned: NaN, endingBalance: NaN, effectiveApy: NaN };
      if (n === 0) {
        const rewardsEarned = principal * rate * years;
        return { rewardsEarned, endingBalance: principal + rewardsEarned, effectiveApy: nominalApr };
      }
      const endingBalance = principal * Math.pow(1 + rate / n, n * years);
      const rewardsEarned = endingBalance - principal;
      const effectiveApy = (Math.pow(1 + rate / n, n) - 1) * 100;
      return { rewardsEarned, endingBalance, effectiveApy };
    }
  },
  {
    id: 'crypto-portfolio-rebalancing-calculator',
    category: 'crypto',
    glyph: 'RBL',
    updatedAt: '2026-11-18',
    aliases: ['crypto portfolio rebalancing calculator', 'crypto rebalancing calculator', 'target allocation calculator', 'portfolio rebalance calculator'],
    related: ['crypto-dca-calculator', 'crypto-profit-loss-calculator', 'weighted-average-calculator', 'investment-calculator'],
    title: 'Crypto Portfolio Rebalancing Calculator',
    description: 'Enter each holding\'s current value and target allocation percentage to find exactly how much of each to buy or sell to bring a portfolio back to its target mix.',
    example: 'A $10,000 portfolio split $6,000 / $3,000 / $1,000 against a 50% / 30% / 20% target needs to sell $1,000 of the first holding and buy $1,000 of the third — the second is already exactly on target.',
    inputs: [
      { id: 'asset1Value', label: 'Holding 1 — current value', type: 'currency', placeholder: '6000', defaultValue: 6000, step: 100, min: 0 },
      { id: 'asset1Target', label: 'Holding 1 — target allocation', type: 'percent', placeholder: '50', defaultValue: 50, step: 1, min: 0 },
      { id: 'asset2Value', label: 'Holding 2 — current value', type: 'currency', placeholder: '3000', defaultValue: 3000, step: 100, min: 0 },
      { id: 'asset2Target', label: 'Holding 2 — target allocation', type: 'percent', placeholder: '30', defaultValue: 30, step: 1, min: 0 },
      { id: 'asset3Value', label: 'Holding 3 — current value', type: 'currency', placeholder: '1000', defaultValue: 1000, step: 100, min: 0 },
      { id: 'asset3Target', label: 'Holding 3 — target allocation', type: 'percent', placeholder: '20', defaultValue: 20, step: 1, min: 0 },
      { id: 'asset4Value', label: 'Holding 4 — current value (0 = unused)', type: 'currency', placeholder: '0', defaultValue: 0, step: 100, min: 0 },
      { id: 'asset4Target', label: 'Holding 4 — target allocation (0 = unused)', type: 'percent', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'totalPortfolioValue',
      headlineLabel: 'Total portfolio value',
      outputs: [
        { id: 'totalPortfolioValue', label: 'Total portfolio value', format: 'currency' },
        { id: 'targetPercentSum', label: 'Your target percentages, added up', format: 'percent' },
        { id: 'asset1Trade', label: 'Holding 1: buy (+) or sell (−)', format: 'currency' },
        { id: 'asset2Trade', label: 'Holding 2: buy (+) or sell (−)', format: 'currency' },
        { id: 'asset3Trade', label: 'Holding 3: buy (+) or sell (−)', format: 'currency' },
        { id: 'asset4Trade', label: 'Holding 4: buy (+) or sell (−)', format: 'currency' },
        { id: 'totalToBuy', label: 'Total to buy, across all holdings', format: 'currency' },
        { id: 'totalToSell', label: 'Total to sell, across all holdings', format: 'currency' }
      ],
      groups: [
        { title: 'Holding 1', inputs: ['asset1Value', 'asset1Target'] },
        { title: 'Holding 2', inputs: ['asset2Value', 'asset2Target'] },
        { title: 'Holding 3', inputs: ['asset3Value', 'asset3Target'] },
        { title: 'Add a 4th holding (optional)', inputs: ['asset4Value', 'asset4Target'], optional: true }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'asset1Value', label: 'Holding 1' },
          { from: 'asset2Value', label: 'Holding 2' },
          { from: 'asset3Value', label: 'Holding 3' },
          { from: 'asset4Value', label: 'Holding 4' }
        ],
        center: 'totalPortfolioValue',
        centerSub: 'current portfolio value'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What rebalancing computes, and what it does not decide',
        paragraphs: [
          'The U.S. Securities and Exchange Commission\'s own investor guide puts rebalancing simply: "Rebalancing is bringing your portfolio back to your original asset allocation mix." Because different holdings grow (or fall) at different rates, a portfolio that started at an even split can drift a long way from its target without a single trade being made — this calculator does the arithmetic of exactly how to correct that drift.',
          'Crypto holdings are a particularly sharp example: it is common for one token in a small portfolio to multiply in value while another stays flat or falls, so the original target mix can drift dramatically in a short time. This calculator takes your holdings\' current values and your target percentage for each, works out what each holding\'s value should be at that target, and reports exactly how much of each to buy or sell to get there.',
          'This is arithmetic only. It does not tell you what your target allocation should be, which specific asset is a good buy, or whether now is a good time to trade — and selling a crypto holding to rebalance is itself a taxable disposal in the US (see the profit/loss and tax-estimate calculators). Nothing here is financial advice.'
        ]
      },
      howTo: {
        intro: 'Enter each holding\'s current value and the percentage you want it to be of the whole portfolio.',
        steps: [
          { name: 'Enter each holding\'s current value', text: 'What that holding is worth right now, in your own currency.' },
          { name: 'Enter each holding\'s target percentage', text: 'What share of the total portfolio you want that holding to be. These don\'t need to add up to exactly 100 — this calculator uses whatever they add up to, proportionally — but using real percentages that do sum to 100 is the clearest way to enter them.' },
          { name: 'Add a 4th holding if you have one', text: 'Leave its value and target at 0 if you only have three holdings.' },
          { name: 'Read the total portfolio value', text: 'The headline — the sum of every holding\'s current value.' },
          { name: 'Read each holding\'s buy or sell amount', text: 'A positive number means buy that much more; a negative number means sell that much, to reach your target mix exactly.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing you enter is sent or stored.'
      },
      formula: {
        intro: 'Each holding\'s target dollar value is its target percentage of the whole portfolio\'s current total value; the trade is the gap between that target value and what the holding is worth now.',
        expression: 'totalValue = Σ value(i)\ntotalTarget = Σ target(i)\ntargetValue(i) = totalValue × target(i) ÷ totalTarget\ntrade(i) = targetValue(i) − value(i)   (positive = buy, negative = sell)',
        terms: [
          { symbol: 'value(i)', meaning: 'Holding i\'s current value.' },
          { symbol: 'target(i)', meaning: 'Holding i\'s target allocation — real percentages that sum to 100 are the clearest way to enter these.' },
          { symbol: 'trade(i)', meaning: 'How much to buy (positive) or sell (negative) of holding i to land exactly on its target value.' }
        ],
        note: 'Dividing by the total of whatever you entered (totalTarget) means the targets do not strictly need to sum to 100 — 50/30/20 and 5/3/2 produce the same trades, the same way this site\'s weighted-average calculator handles weights on any scale. Using real percentages that do sum to 100 is still the clearest way to enter them, and the "added up" row lets you check that they do.'
      },
      workedExample: {
        intro: 'A $10,000 portfolio across three holdings — $6,000, $3,000 and $1,000 — against target weights of 50%, 30% and 20%.',
        rows: [
          { label: 'Total portfolio value (6,000 + 3,000 + 1,000)', value: '$10,000' },
          { label: 'Holding 1 target value (10,000 × 50%) vs. current', value: '$5,000 target vs. $6,000 current → sell $1,000' },
          { label: 'Holding 2 target value (10,000 × 30%) vs. current', value: '$3,000 target vs. $3,000 current → no change' },
          { label: 'Holding 3 target value (10,000 × 20%) vs. current', value: '$2,000 target vs. $1,000 current → buy $1,000' },
          { label: 'Total to buy / total to sell', value: '$1,000 / $1,000' }
        ],
        result: 'Sell $1,000 of Holding 1, leave Holding 2 unchanged, and buy $1,000 of Holding 3.',
        explanation: 'Holding 1 has grown to 60% of the portfolio ($6,000 of $10,000) — 10 percentage points above its 50% target — while Holding 3 has shrunk to just 10% of the portfolio, 10 points below its 20% target. Selling $1,000 from the overweight holding and buying $1,000 of the underweight one restores the original 50/30/20 split exactly.'
      },
      watchOut: [
        { title: 'Arithmetic only — never financial advice', body: 'This calculator computes a mechanical rebalance toward whatever target percentages you enter. It does not tell you what your target split should be, or recommend any particular asset.' },
        { title: 'Targets are used proportionally, not forced to exactly 100%', body: 'This calculator divides by whatever your target numbers add up to, so 50/30/20 and 5/3/2 produce identical trades. Entering real percentages that do sum to 100 (check the "added up" row) is still the clearest way to use it.' },
        { title: 'Selling to rebalance can be a taxable event', body: 'In the US, the IRS treats crypto as property, so selling any amount of a holding to rebalance is a disposal that can realize a capital gain or loss — see the crypto profit/loss and tax-estimate calculators, neither of which this page accounts for.' },
        { title: 'Real trades have fees, slippage, and minimums', body: 'This calculator reports the exact dollar trade needed on paper. Actual exchange fees, bid/ask spread, and minimum order sizes can mean the real trade differs slightly from this number.' },
        { title: 'A $0 trade can mean two different things', body: 'It can mean a holding is already exactly on target, or that an unused 4th holding slot is left at zero — check each holding\'s current value before reading too much into a $0 row.' }
      ],
      references: [
        { label: 'U.S. Securities and Exchange Commission, Beginner\'s Guide to Asset Allocation, Diversification, and Rebalancing', url: 'https://www.sec.gov/investor/pubs/assetallocation.htm' },
        { label: 'Wolfram MathWorld, Weighted Mean', url: 'https://mathworld.wolfram.com/WeightedMean.html' }
      ]
    },
    seo: {
      title: 'Crypto Portfolio Rebalancing Calculator',
      description: 'Free crypto rebalancing calculator. Enter each holding\'s value and target % to see exactly how much to buy or sell to restore your target allocation.',
      faq: [
        { question: 'How do you calculate a portfolio rebalance?', answer: 'Find the total portfolio value, multiply it by each holding\'s target percentage to get its target value, then subtract the holding\'s current value from that target — a positive result means buy, a negative result means sell.' },
        { question: 'Do my target percentages need to add up to 100%?', answer: 'Not strictly — this calculator divides by whatever they add up to, so 50/30/20 and 5/3/2 give identical trades. Using real percentages that do sum to 100 is still the clearest way to enter them; the "added up" row lets you check.' },
        { question: 'Why would a holding need rebalancing at all?', answer: 'Different holdings grow at different rates, so a portfolio that started at an even split can drift a long way from its target without any trade being made — crypto holdings in particular can drift quickly given how differently individual tokens can perform.' },
        { question: 'Does this tell me what my target allocation should be?', answer: 'No. This calculator only computes the trades needed to reach whatever target percentages you enter — it has no opinion on what those targets should be.' },
        { question: 'Is rebalancing a crypto portfolio taxable?', answer: 'In the US, yes, if it involves selling — the IRS treats crypto as property, so a sale realizes a capital gain or loss. See the crypto profit/loss and tax-estimate calculators for that side of it.' },
        { question: 'Can I use this with only 2 or 3 holdings?', answer: 'Yes — leave any unused holding\'s value and target percentage at 0, and it is excluded entirely from the total.' },
        { question: 'Does this account for trading fees?', answer: 'No. It reports the exact dollar amount needed on paper; real exchange fees, spread, and minimum order sizes can shift the actual trade slightly.' }
      ]
    },
    compute(values) {
      const assets: [number, number][] = [
        [values.asset1Value, values.asset1Target],
        [values.asset2Value, values.asset2Target],
        [values.asset3Value, values.asset3Target],
        [values.asset4Value, values.asset4Target]
      ];
      const totalPortfolioValue = assets.reduce((sum, [value]) => sum + value, 0);
      const targetPercentSum = assets.reduce((sum, [, target]) => sum + target, 0);
      const noTrades = { asset1Trade: NaN, asset2Trade: NaN, asset3Trade: NaN, asset4Trade: NaN, totalToBuy: NaN, totalToSell: NaN };
      if (!(totalPortfolioValue > 0) || !(targetPercentSum > 0)) {
        return { totalPortfolioValue, targetPercentSum, ...noTrades };
      }
      // Dividing by targetPercentSum (rather than requiring it to equal 100) means the targets only
      // need to be proportionally correct, the same convention as weighted-average-calculator's weights.
      const trades = assets.map(([value, target]) => (totalPortfolioValue * target) / targetPercentSum - value);
      const totalToBuy = trades.filter((t) => t > 0).reduce((sum, t) => sum + t, 0);
      const totalToSell = trades.filter((t) => t < 0).reduce((sum, t) => sum - t, 0);
      const [asset1Trade, asset2Trade, asset3Trade, asset4Trade] = trades;
      return { totalPortfolioValue, targetPercentSum, asset1Trade, asset2Trade, asset3Trade, asset4Trade, totalToBuy, totalToSell };
    }
  },
  {
    id: 'crypto-profit-loss-calculator',
    category: 'crypto',
    glyph: 'P/L',
    updatedAt: '2026-11-18',
    aliases: ['crypto profit loss calculator', 'crypto gain loss calculator', 'crypto trade pnl calculator', 'realized profit calculator'],
    related: ['crypto-breakeven-price-calculator', 'crypto-tax-estimate-calculator', 'crypto-dca-calculator'],
    title: 'Crypto Profit/Loss Calculator',
    description: 'Find the realized profit or loss, in dollars and percent, from a crypto buy and sell, including any fees you paid on either side.',
    example: 'Buying 0.5 units at $20,000 plus $10 in fees (a $10,010 cost basis), then selling at $28,000 minus $15 in fees ($13,985 net proceeds), realizes a profit of $3,975 — about 39.71% of the cost basis.',
    inputs: [
      { id: 'buyPrice', label: 'Buy price (per unit)', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 100, min: 0 },
      { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '0.5', defaultValue: 0.5, step: 0.01, min: 0 },
      { id: 'buyFees', label: 'Fees paid on the buy', type: 'currency', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'sellPrice', label: 'Sell price (per unit)', type: 'currency', placeholder: '28000', defaultValue: 28000, step: 100, min: 0 },
      { id: 'sellFees', label: 'Fees paid on the sell', type: 'currency', placeholder: '15', defaultValue: 15, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'profitLoss',
      headlineLabel: 'Realized profit/loss',
      outputs: [
        { id: 'profitLoss', label: 'Realized profit/loss', format: 'currency' },
        { id: 'profitLossPercent', label: 'Realized profit/loss %', format: 'percent' },
        { id: 'costBasis', label: 'Cost basis', format: 'currency' },
        { id: 'proceeds', label: 'Net proceeds', format: 'currency' }
      ],
      groups: [
        { title: 'Buy', inputs: ['buyPrice', 'quantity'] },
        { title: 'Buy fees (optional)', inputs: ['buyFees'], optional: true },
        { title: 'Sell', inputs: ['sellPrice'] },
        { title: 'Sell fees (optional)', inputs: ['sellFees'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'costBasis', label: 'Cost basis' }, { from: 'proceeds', label: 'Net proceeds' }],
        title: 'Cost basis vs. net proceeds',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Cost basis, proceeds, and realized profit/loss',
        paragraphs: [
          'The IRS treats crypto as property for federal tax purposes — its own Digital Assets guidance states plainly that "digital assets are considered property, not currency" — so selling it is the same kind of event as selling any other property: you have a cost basis (what you paid, including fees) and proceeds (what you received, net of fees), and the difference between them is a realized profit or loss. This calculator computes exactly that for a single buy-then-sell pair.',
          'Cost basis here is the buy price times the quantity, plus any fees paid on the buy — fees add to what the position actually cost you. Proceeds are the sell price times the quantity, minus any fees paid on the sell — fees subtract from what you actually received. The profit or loss is simply proceeds minus cost basis, shown both as a dollar amount and as a percentage of the cost basis.',
          'This calculator computes the realized profit or loss on the trade itself — it is not a tax calculator. See the crypto tax-estimate calculator for how a gain like this might actually be taxed, and the crypto breakeven-price calculator for the reverse question: what sell price would make this profit or loss exactly zero. This is an arithmetic tool only, never financial or tax advice, and never a price prediction.'
        ]
      },
      howTo: {
        intro: 'Enter the buy side, then the sell side, including any fees on either one.',
        steps: [
          { name: 'Enter the buy price and quantity', text: 'The price per unit you paid, and how many units you bought.' },
          { name: 'Enter any fees paid on the buy (optional)', text: 'Leave at 0 if there were none.' },
          { name: 'Enter the sell price', text: 'The price per unit you sold at (or are considering selling at) — the same quantity is assumed sold.' },
          { name: 'Enter any fees paid on the sell (optional)', text: 'Leave at 0 if there were none.' },
          { name: 'Read the realized profit/loss', text: 'The headline, shown both in dollars and as a percentage of the cost basis, with the cost basis and net proceeds broken out below it.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing you enter is sent or stored.'
      },
      formula: {
        intro: 'Cost basis adds fees to what you paid; proceeds subtract fees from what you received; profit/loss is the difference between the two.',
        expression: 'costBasis = buyPrice × quantity + buyFees\nproceeds = sellPrice × quantity − sellFees\nprofitLoss = proceeds − costBasis\nprofitLossPercent = profitLoss ÷ costBasis × 100',
        terms: [
          { symbol: 'costBasis', meaning: 'What the position actually cost, including buy-side fees.' },
          { symbol: 'proceeds', meaning: 'What you actually received, net of sell-side fees.' },
          { symbol: 'profitLoss', meaning: 'Proceeds minus cost basis — negative is a realized loss.' }
        ],
        note: 'A negative result is a realized loss, not an error. This is an arithmetic tool, not tax advice — see the crypto tax-estimate calculator for how a gain or loss like this might be taxed in the US.'
      },
      workedExample: {
        intro: 'Buy 0.5 units at $20,000 with $10 in fees, then sell at $28,000 with $15 in fees.',
        rows: [
          { label: 'Cost basis (20,000 × 0.5 + 10)', value: '$10,010.00' },
          { label: 'Net proceeds (28,000 × 0.5 − 15)', value: '$13,985.00' },
          { label: 'Profit (13,985 − 10,010)', value: '$3,975.00' },
          { label: 'Profit % (3,975 ÷ 10,010 × 100)', value: '39.71%' }
        ],
        result: 'Realized profit ≈ $3,975.00 — about 39.71% of the $10,010 cost basis.',
        explanation: 'The $25 total in fees ($10 buying, $15 selling) is small next to a $10,010 position, so it barely dents the result here — the same $25 in fees would matter far more as a share of profit on a much smaller trade.'
      },
      watchOut: [
        { title: 'Arithmetic only, not tax advice', body: 'This calculator computes the realized profit or loss on the trade itself. It does not estimate any tax owed — see the crypto tax-estimate calculator for that, separately.' },
        { title: 'A loss is a normal, valid result', body: 'If proceeds come in below cost basis, both the dollar figure and the percentage simply go negative — this is not an error.' },
        { title: 'Fees matter more on smaller trades', body: 'The same flat dollar fee is a much bigger percentage drag on a $100 trade than on a $10,000 one — always check the fee rows if a result looks off from a quick mental estimate.' },
        { title: 'This assumes the full quantity bought is the quantity sold', body: 'For a partial sell, use the quantity actually sold, and a proportional share of the original buy fees, in a separate calculation.' },
        { title: 'Never a price prediction', body: 'This only computes profit or loss for prices you already know or are testing as a scenario — it does not predict what any future sell price will be.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Digital Assets ("digital assets are considered property, not currency")', url: 'https://www.irs.gov/filing/digital-assets' },
        { label: 'Internal Revenue Service, Topic no. 409, Capital Gains and Losses', url: 'https://www.irs.gov/taxtopics/tc409' }
      ]
    },
    seo: {
      title: 'Crypto Profit/Loss Calculator',
      description: 'Free crypto profit/loss calculator. Enter buy and sell price, quantity, and fees to find the realized profit or loss in dollars and percent.',
      faq: [
        { question: 'How do you calculate crypto profit or loss?', answer: 'costBasis = buyPrice × quantity + buyFees; proceeds = sellPrice × quantity − sellFees; profitLoss = proceeds − costBasis. For 0.5 units bought at $20,000 ($10 fee) and sold at $28,000 ($15 fee): $3,975 profit, about 39.71% of the $10,010 cost basis.' },
        { question: 'Does this include fees?', answer: 'Yes — fees paid on the buy are added to the cost basis, and fees paid on the sell are subtracted from the proceeds, so both sides are accounted for.' },
        { question: 'Can this calculator show a loss?', answer: 'Yes — if your net proceeds are below your cost basis, both the dollar amount and the percentage are shown as negative.' },
        { question: 'Is this a tax calculator?', answer: 'No. It computes realized profit or loss on the trade itself only. Use the crypto tax-estimate calculator separately to estimate US federal tax on a gain.' },
        { question: 'What is the difference between this and the breakeven-price calculator?', answer: 'This calculator takes a sell price you already have and tells you the resulting profit or loss. The breakeven-price calculator works backward: given your cost basis and fees, it finds the exact sell price where profit or loss would be zero.' },
        { question: 'How should I handle a partial sell?', answer: 'Enter the quantity actually sold and a proportional share of the original buy fees for that portion, rather than the full position\'s numbers.' },
        { question: 'Is this financial advice?', answer: 'No. It is an arithmetic tool for prices and quantities you supply — it does not predict prices and is not investment or tax advice.' }
      ]
    },
    compute(values) {
      const costBasis = values.buyPrice * values.quantity + values.buyFees;
      const proceeds = values.sellPrice * values.quantity - values.sellFees;
      const profitLoss = proceeds - costBasis;
      const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : NaN;
      return { profitLoss, profitLossPercent, costBasis, proceeds };
    }
  },
  {
    id: 'crypto-breakeven-price-calculator',
    category: 'crypto',
    glyph: 'BE',
    updatedAt: '2026-11-18',
    aliases: ['crypto breakeven price calculator', 'breakeven calculator crypto', 'breakeven sell price calculator', 'crypto breakeven calculator'],
    related: ['crypto-profit-loss-calculator', 'crypto-tax-estimate-calculator', 'crypto-dca-calculator'],
    title: 'Crypto Breakeven Price Calculator',
    description: "Find the exact sell price needed to fully recover your cost basis and fees on a crypto holding — the price at which you'd neither gain nor lose money, accounting for a percentage sell fee.",
    example: 'Buying 0.5 units at $20,000 plus $10 in fees ($10,010 cost basis), with a 0.5% sell fee, needs a sell price of about $20,120.60 to break even — about 0.60% above the original buy price, purely to cover the fees.',
    inputs: [
      { id: 'buyPrice', label: 'Buy price (per unit)', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 100, min: 0 },
      { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '0.5', defaultValue: 0.5, step: 0.01, min: 0 },
      { id: 'buyFees', label: 'Fees paid on the buy', type: 'currency', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'sellFeePercent', label: 'Sell fee (% of sale value)', type: 'percent', placeholder: '0.5', defaultValue: 0.5, step: 0.1, min: 0 }
    ],
    breakdown: {
      headline: 'breakevenPrice',
      headlineLabel: 'Breakeven sell price',
      outputs: [
        { id: 'breakevenPrice', label: 'Breakeven sell price', format: 'currency' },
        { id: 'breakevenTotalValue', label: 'Breakeven total sale value', format: 'currency' },
        { id: 'requiredGainPercent', label: 'Required gain over buy price', format: 'percent' }
      ],
      groups: [
        { title: 'Your position', inputs: ['buyPrice', 'quantity'] },
        { title: 'Buy fees (optional)', inputs: ['buyFees'], optional: true },
        { title: 'Sell fee', inputs: ['sellFeePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'buyPrice', label: 'Buy price' }, { from: 'breakevenPrice', label: 'Breakeven price' }],
        title: 'Buy price vs. breakeven price',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Working backward from zero profit',
        paragraphs: [
          'The crypto profit/loss calculator takes a sell price you already have and tells you the resulting profit or loss. This calculator asks the reverse question: given what a position actually cost (cost basis, including buy fees) and a sell-side fee charged as a percentage of the sale (how many exchanges actually charge it), what sell price would make the profit or loss come out to exactly zero?',
          'Because a percentage sell fee is taken out of the sale itself, the breakeven price always sits above the plain buy price by more than the buy-side fees alone would suggest — the sell fee effectively shrinks every dollar of the sale, so the price has to rise further to make up for it. With zero fees on either side, the breakeven price is simply the buy price.',
          'This is an arithmetic tool only. It does not predict whether, or when, any asset will reach its breakeven price, and it is not a recommendation to hold, sell, or buy anything. It also does not account for any tax owed on an eventual sale — see the crypto tax-estimate calculator separately for that.'
        ]
      },
      howTo: {
        intro: 'Enter your position\'s buy price, quantity, and fees on both sides.',
        steps: [
          { name: 'Enter the buy price and quantity', text: 'The price per unit you paid, and how many units you hold.' },
          { name: 'Enter any fees paid on the buy (optional)', text: 'Leave at 0 if there were none.' },
          { name: 'Enter the sell fee', text: 'As a percentage of the sale value — check your exchange\'s own fee schedule for its real rate.' },
          { name: 'Read the breakeven sell price', text: 'The headline — the exact price per unit where selling would exactly recover your cost basis.' },
          { name: 'Check the required gain', text: 'How much higher the breakeven price sits above your original buy price, as a percentage — purely the cost of the fees.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing you enter is sent or stored.'
      },
      formula: {
        intro: 'The breakeven price is whatever price makes the quantity sold, net of the sell fee, worth exactly the cost basis.',
        expression: 'costBasis = buyPrice × quantity + buyFees\nbreakevenPrice = costBasis ÷ [quantity × (1 − sellFeePercent ÷ 100)]',
        terms: [
          { symbol: 'costBasis', meaning: 'What the position actually cost, including buy-side fees.' },
          { symbol: 'sellFeePercent', meaning: 'The sell-side fee, as a percentage of the sale value.' },
          { symbol: 'breakevenPrice', meaning: 'The exact sell price per unit at which proceeds, net of the sell fee, equal the cost basis.' }
        ],
        note: 'With a sell fee of 100% or more, there is no price that could ever recover the cost basis, so this calculator shows no answer rather than a misleading number. This is an arithmetic tool only — not a price prediction or financial advice.'
      },
      workedExample: {
        intro: 'A position cost $10,010 (0.5 units at $20,000, plus $10 in buy fees), and the exchange charges a 0.5% fee on the sale.',
        rows: [
          { label: 'Cost basis', value: '$10,010.00' },
          { label: 'Breakeven price (10,010 ÷ [0.5 × (1 − 0.005)])', value: '10,010 ÷ 0.4975 ≈ $20,120.60' },
          { label: 'Breakeven total sale value (20,120.60 × 0.5)', value: '$10,060.30' },
          { label: 'Required gain over the $20,000 buy price', value: '(20,120.60 − 20,000) ÷ 20,000 × 100 ≈ 0.60%' }
        ],
        result: 'Breakeven sell price ≈ $20,120.60 — about 0.60% above the $20,000 buy price, just to cover $10 of buy fees and a 0.5% sell fee.',
        explanation: 'With no fees at all, the breakeven price would simply equal the $20,000 buy price. The extra 0.60% here is entirely the cost of the $10 buy fee and the 0.5% sell fee — fees, not price risk, are what push the breakeven point above the original purchase price.'
      },
      watchOut: [
        { title: 'An arithmetic tool, never a price prediction', body: 'This calculator only computes the sell price that would recover your cost basis exactly. It makes no claim about whether, or when, that price will actually occur, and it is not financial advice.' },
        { title: 'Does not include tax', body: 'Selling at exactly this breakeven price can still be a taxable event in the US depending on your actual tax cost basis (which may differ from the inputs here) — see the crypto tax-estimate calculator separately.' },
        { title: 'Buy fees are entered as a flat amount; the sell fee is a percentage', body: 'This matches how most exchanges actually charge (a flat or tiered fee on entry, a percentage of sale value on exit) — check your own exchange\'s fee schedule if yours is structured differently.' },
        { title: 'A sell fee of 100% or more has no breakeven price', body: 'If the fee alone would consume the entire sale, no price can recover the cost basis, so this calculator shows no answer rather than guessing.' },
        { title: 'A small percentage can still be a large dollar amount', body: 'A 0.60% required gain sounds small, but on a much larger position the same percentage represents a correspondingly larger dollar swing — check both figures.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Digital Assets ("digital assets are considered property, not currency")', url: 'https://www.irs.gov/filing/digital-assets' },
        { label: 'Internal Revenue Service, Topic no. 409, Capital Gains and Losses', url: 'https://www.irs.gov/taxtopics/tc409' }
      ]
    },
    seo: {
      title: 'Crypto Breakeven Price Calculator',
      description: 'Free crypto breakeven price calculator. Enter cost basis, fees, and a sell fee % to find the exact sell price needed to recover your position exactly.',
      faq: [
        { question: 'How do you calculate a crypto breakeven price?', answer: 'breakevenPrice = costBasis ÷ [quantity × (1 − sellFeePercent ÷ 100)], where costBasis = buyPrice × quantity + buyFees. For 0.5 units bought at $20,000 ($10 fee) with a 0.5% sell fee, breakeven is about $20,120.60.' },
        { question: 'Why is the breakeven price higher than the buy price?', answer: 'Because of fees. With zero fees on either side, the breakeven price exactly equals the buy price — every dollar of fees pushes the breakeven price higher.' },
        { question: 'What is the difference between this and the profit/loss calculator?', answer: 'The profit/loss calculator takes a sell price you already have and tells you the result. This calculator works backward: given your cost basis and fees, it solves for the exact sell price where profit or loss would be zero.' },
        { question: 'What happens if the sell fee is 100% or more?', answer: 'No sell price could ever recover the cost basis in that case, so this calculator shows no answer rather than a misleading number.' },
        { question: 'Does this account for taxes?', answer: 'No. Selling at the breakeven price can still be a taxable event depending on your actual tax cost basis — see the crypto tax-estimate calculator separately.' },
        { question: 'Can I use a flat dollar sell fee instead of a percentage?', answer: 'Not directly in this calculator — it models the sell fee as a percentage of sale value, matching how most exchanges charge it. For a flat sell fee instead, use the profit/loss calculator\'s sell-fees field and try different sell prices.' },
        { question: 'Is this a price prediction?', answer: 'No. It only computes the price that would make profit or loss exactly zero given your own cost basis and fees — it says nothing about whether that price will occur.' }
      ]
    },
    compute(values) {
      const costBasis = values.buyPrice * values.quantity + values.buyFees;
      const denom = values.quantity * (1 - values.sellFeePercent / 100);
      const noAnswer = { breakevenPrice: NaN, breakevenTotalValue: NaN, requiredGainPercent: NaN };
      if (!(values.quantity > 0) || !(denom > 0)) return noAnswer;
      const breakevenPrice = costBasis / denom;
      const breakevenTotalValue = breakevenPrice * values.quantity;
      const requiredGainPercent = values.buyPrice > 0 ? ((breakevenPrice - values.buyPrice) / values.buyPrice) * 100 : NaN;
      return { breakevenPrice, breakevenTotalValue, requiredGainPercent };
    }
  },
  {
    id: 'crypto-tax-estimate-calculator',
    category: 'crypto',
    glyph: 'TAX',
    updatedAt: '2026-11-18',
    aliases: ['crypto tax calculator', 'crypto capital gains tax calculator', 'bitcoin tax calculator', 'crypto tax estimator', 'short term vs long term crypto tax calculator'],
    related: ['crypto-profit-loss-calculator', 'crypto-breakeven-price-calculator', 'income-tax-calculator'],
    title: 'Crypto Tax Estimate Calculator (US Short-Term vs. Long-Term)',
    description:
      'Estimate 2026 US federal capital-gains tax on a crypto sale, stacked on top of your other taxable income, comparing short-term (ordinary rates) against long-term (0/15/20%) holding. A US-only educational estimate — not tax advice, and rules vary by country.',
    example: 'A single filer with $70,000 of other taxable income and a $12,000 crypto gain owes an estimated $1,800 in federal tax if held over a year (entirely in the 15% long-term bracket), versus about $2,640 if held a year or less (entirely in the 22% ordinary bracket) — $840 more, just for selling sooner.',
    inputs: [
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
          { value: 2, label: 'Married filing separately' },
          { value: 3, label: 'Head of household' }
        ]
      },
      { id: 'otherTaxableIncome', label: 'Your other taxable income (excluding this crypto gain)', type: 'currency', placeholder: '70000', defaultValue: 70000, step: 1000, min: 0 },
      { id: 'costBasis', label: 'Cost basis of the crypto sold', type: 'currency', placeholder: '8000', defaultValue: 8000, step: 500, min: 0 },
      { id: 'proceeds', label: 'Sale proceeds', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 500, min: 0 },
      {
        id: 'holdingPeriod',
        label: 'Holding period',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Short-term (held 1 year or less)' },
          { value: 1, label: 'Long-term (held more than 1 year)' }
        ]
      }
    ],
    breakdown: {
      headline: 'taxOwed',
      headlineLabel: 'Estimated federal tax on this gain',
      outputs: [
        { id: 'taxOwed', label: 'Estimated federal tax on this gain', format: 'currency' },
        { id: 'gain', label: 'Gain (or loss) on this sale', format: 'currency' },
        { id: 'effectiveRate', label: 'Effective rate on the gain', format: 'percent' },
        { id: 'marginalRate', label: 'Marginal rate on the gain', format: 'percent' },
        { id: 'afterTaxGain', label: 'Gain after this estimated tax', format: 'currency' }
      ],
      groups: [
        { title: 'This transaction', inputs: ['costBasis', 'proceeds', 'holdingPeriod'] },
        { title: 'Your overall tax situation', inputs: ['filingStatus', 'otherTaxableIncome'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'afterTaxGain', label: 'Gain after this tax' }, { from: 'taxOwed', label: 'Estimated tax' }],
        title: 'Gain after tax vs. estimated tax owed',
        highlight: 0
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Crypto is taxed as property, and your gain "stacks" on your other income',
        paragraphs: [
          'The IRS\'s own Digital Assets guidance confirms that "digital assets are considered property, not currency" for US tax purposes, a treatment it traces to "the general tax principles applicable to property transactions outlined in Notice 2014-21." That means selling, trading, or otherwise disposing of crypto triggers the same kind of capital gain or loss as selling stock or real estate — and the same short-term/long-term distinction applies: "short-term" is "held... as a capital asset for one year or less," and "long-term" is "held... for more than one year," per the IRS\'s own guidance.',
          'The rate actually applied to a gain depends on where it falls once "stacked" on top of your other taxable income — not on a single flat rate. Your other income fills the tax brackets (ordinary brackets for a short-term gain, or the 0%/15%/20% long-term capital-gains thresholds for a long-term one) from zero upward first, and your gain sits on top of that, so the same dollar gain can land in a lower bracket for someone with little other income and a higher one for someone with a lot. This calculator runs that real stacking calculation — not just a single bracket lookup — using the IRS\'s 2026 figures (Rev. Proc. 2025-32).',
          'This is a US federal estimate only, for education and planning — not tax advice, and not a substitute for a qualified tax professional or a filed return. It does not include state or local tax, the Net Investment Income Tax, self-employment tax, deductions, or credits, and crypto tax rules vary enormously outside the US. Never treat this as a forecast of what you will actually owe.'
        ]
      },
      howTo: {
        intro: 'Enter the transaction\'s cost basis and proceeds, choose the holding period, then add your filing status and other income.',
        steps: [
          { name: 'Enter the cost basis and sale proceeds', text: 'What the crypto cost you, and what you sold it for (or are considering selling it for).' },
          { name: 'Choose the holding period', text: 'Short-term (one year or less) or long-term (more than one year) — this changes which 2026 rate table applies to the gain.' },
          { name: 'Enter your filing status and other taxable income', text: 'Your other taxable income, already after deductions, not counting this crypto gain — this is what the gain "stacks" on top of.' },
          { name: 'Read the estimated tax on the gain', text: 'The headline, with the gain itself, the effective and marginal rate on just that gain, and the gain after this estimated tax shown below it.' },
          { name: 'Compare short-term vs. long-term', text: 'Switch only the holding period to see how much tax the same gain would cost under each treatment.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The gain is simply proceeds minus cost basis. The tax on it is the stacked amount: the bracket tax on all your income with the gain included, minus the bracket tax on your income without it.',
        expression: 'gain = proceeds − costBasis\ntaxOnGain = bracketTax(otherIncome + gain) − bracketTax(otherIncome)\nShort-term: bracketTax uses the 2026 ordinary brackets (10/12/22/24/32/35/37%)\nLong-term: bracketTax uses the 2026 long-term capital-gains thresholds (0/15/20%)',
        terms: [
          { symbol: 'Single / married filing separately ordinary brackets (2026)', meaning: '10% to $12,400, 12% to $50,400, 22% to $105,700, 24% to $201,775, 32% to $256,225, then 35% to $640,600 (single) or $384,350 (married filing separately), 37% above.' },
          { symbol: 'Married filing jointly ordinary brackets (2026)', meaning: '10% to $24,800, 12% to $100,800, 22% to $211,400, 24% to $403,550, 32% to $512,450, 35% to $768,700, 37% above.' },
          { symbol: 'Head of household ordinary brackets (2026)', meaning: '10% to $17,700, 12% to $67,450, 22% to $105,700, 24% to $201,750, 32% to $256,200, 35% to $640,600, 37% above.' },
          { symbol: 'Long-term capital-gains thresholds (2026)', meaning: '0% up to $49,450 (single/MFS), $98,900 (MFJ), $66,200 (HoH); 15% up to $545,500 (single), $613,700 (MFJ), $306,850 (MFS), $579,600 (HoH); 20% above those.' }
        ],
        note: 'Figures are set by Internal Revenue Service Rev. Proc. 2025-32. US federal estimate only — not tax advice. Does not include state/local tax, the Net Investment Income Tax, self-employment tax, deductions, or credits.'
      },
      workedExample: {
        intro: 'A single filer has $70,000 of other taxable income and a $12,000 crypto gain ($20,000 proceeds, $8,000 cost basis). How much federal tax does the gain add, short-term vs. long-term?',
        rows: [
          { label: 'Gain (20,000 − 8,000)', value: '$12,000' },
          { label: 'Long-term: $70,000 to $82,000 falls entirely in the 15% band (above $49,450, below $545,500)', value: '12,000 × 15% = $1,800.00' },
          { label: 'Short-term: $70,000 to $82,000 falls entirely in the 22% ordinary bracket (above $50,400, below $105,700)', value: '12,000 × 22% = $2,640.00' },
          { label: 'Difference from holding a year or less instead of over a year', value: '$2,640 − $1,800 = $840.00' }
        ],
        result: 'Long-term: an estimated $1,800 (15% effective and marginal). Short-term: an estimated $2,640 (22% effective and marginal) — $840 more.',
        explanation: 'Because $70,000 and $82,000 both sit inside a single band on each rate table, the whole $12,000 gain is taxed at one flat rate here (15% long-term, 22% short-term) — this calculator still handles a gain that straddles two bands correctly: for otherIncome $45,000 and the same filing status, a $10,000 long-term gain would have $4,450 of it taxed at 0% and the remaining $5,550 at 15%, for $832.50 total, not a single flat-rate guess.'
      },
      watchOut: [
        { title: 'US federal only — rules vary enormously by country', body: 'This calculator estimates US federal tax exclusively. It does not add state or local tax, and crypto tax treatment (if any) in other countries follows entirely different rules, rates, and holding-period definitions — this page cannot estimate those.' },
        { title: 'An educational estimate, not tax advice', body: 'It does not model the Net Investment Income Tax, self-employment tax, itemized deductions, other income types, or any tax credits. Consult a qualified tax professional or the IRS\'s own tools for your actual return.' },
        { title: 'Holding period is exact: "more than one year," not "one year"', body: 'The IRS defines long-term as held for more than one year — a holding period of exactly one year or less is short-term, taxed at ordinary rates.' },
        { title: 'A loss shows $0 estimated tax here, but may still reduce other tax', body: 'If proceeds are below cost basis, this page shows no tax owed on the gain — but a real capital loss can actually lower your other tax, up to $3,000 a year ($1,500 if married filing separately) with any excess carried forward to future years, per IRS Topic 409. This calculator does not estimate that benefit.' },
        { title: '"Other taxable income" must already be net of deductions', body: 'Entering gross income here, instead of taxable income after your deductions, will stack the gain on top of too much and overstate the bracket (and so the tax) on it.' },
        { title: 'Never a forecast', body: 'This only estimates tax on numbers you already have or are testing as a scenario — it does not predict any future price, sale, or tax law change.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Notice 2014-21, 2014-16 I.R.B. 938 (virtual currency treated as property)', url: 'https://www.irs.gov/pub/irs-drop/n-14-21.pdf' },
        { label: 'Internal Revenue Service, Digital Assets (confirms Notice 2014-21\'s property treatment and the short-term/long-term holding-period definitions)', url: 'https://www.irs.gov/filing/digital-assets' },
        { label: 'Internal Revenue Service, Topic no. 409, Capital Gains and Losses', url: 'https://www.irs.gov/taxtopics/tc409' },
        { label: 'Internal Revenue Service, Rev. Proc. 2025-32 (2026 tax brackets and capital-gains thresholds), Internal Revenue Bulletin 2025-45', url: 'https://www.irs.gov/irb/2025-45_IRB' }
      ]
    },
    seo: {
      title: 'Crypto Tax Estimate Calculator – Short vs. Long-Term',
      description: 'Free US crypto tax calculator. Estimate 2026 federal tax on a crypto gain, short- vs. long-term, stacked on other income. Educational estimate, not advice.',
      faq: [
        { question: 'Is cryptocurrency taxed as property in the US?', answer: 'Yes. The IRS\'s Digital Assets guidance states that "digital assets are considered property, not currency," tracing that treatment to Notice 2014-21 — so selling crypto triggers a capital gain or loss, the same as selling stock or other property.' },
        { question: 'What is the difference between short-term and long-term crypto tax?', answer: 'Short-term (held one year or less) is taxed at your ordinary income tax rates. Long-term (held more than one year) is taxed at the lower 0%/15%/20% long-term capital-gains rates. In the worked example, the same $12,000 gain costs an estimated $2,640 short-term versus $1,800 long-term.' },
        { question: 'How does a gain that straddles two tax brackets get taxed?', answer: 'Proportionally — only the part of the gain inside each bracket is taxed at that bracket\'s rate. For $45,000 of other income and a $10,000 long-term gain (single filer), $4,450 falls in the 0% band and $5,550 in the 15% band, for $832.50 total tax, not one flat rate on the whole gain.' },
        { question: 'Does this calculator include state tax?', answer: 'No. It estimates US federal tax only. State income tax rules and rates vary widely (some states have none) and are not included here.' },
        { question: 'What if I have a crypto loss instead of a gain?', answer: 'This calculator shows $0 estimated tax on a loss. A real capital loss can reduce other taxable income by up to $3,000 a year ($1,500 married filing separately), with any excess carried forward, per IRS Topic 409 — this calculator does not estimate that separate benefit.' },
        { question: 'What are the 2026 long-term capital-gains thresholds?', answer: 'Per Rev. Proc. 2025-32: the 0% rate applies up to $49,450 of taxable income for single filers and married filing separately, $98,900 for married filing jointly, and $66,200 for head of household; the 15% rate applies up to $545,500 / $613,700 / $306,850 / $579,600 respectively, and 20% applies above those.' },
        { question: 'Is this tax advice?', answer: 'No. This is an educational estimate of US federal tax only, not a filed return. Consult a qualified tax professional, or the IRS\'s own tools, for your actual situation — especially outside the US, where crypto tax rules are entirely different.' }
      ]
    },
    compute(values) {
      const status = Math.min(3, Math.max(0, Math.round(values.filingStatus)));
      const gain = values.proceeds - values.costBasis;
      const brackets = values.holdingPeriod === 1 ? LTCG_BRACKETS_2026[status] : ORDINARY_BRACKETS_2026[status];
      const taxOwed = stackedTax(values.otherTaxableIncome, gain, brackets);
      const marginalRate = gain > 0 ? marginalRateAt(values.otherTaxableIncome + gain, brackets) : 0;
      const effectiveRate = gain > 0 ? (taxOwed / gain) * 100 : 0;
      const afterTaxGain = gain - taxOwed;
      return { taxOwed, gain, effectiveRate, marginalRate, afterTaxGain };
    }
  }
];
