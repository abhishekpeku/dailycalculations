import type { CalculatorConfig } from './types.ts';

// depreciation-calculator: the 200% declining-balance book value at year t is a closed-form
// cost * (1 - rate)^t, floored at salvage — handles fractional years without a year-by-year loop.
// usefulLifeYears has a min of 2 so the declining-balance rate (2 / usefulLifeYears) never reaches
// or exceeds 1, which would otherwise make (1 - rate) zero or negative and break Math.pow for a
// fractional year. Shared by compute() and the reference table so every number comes from one formula.
const decliningBalanceBookValue = (cost: number, salvage: number, rate: number, t: number) => Math.max(salvage, cost * Math.pow(1 - rate, t));

// Reference table rows (years 0-5) on a fixed $100,000/$10,000/5-year basis, independent of
// whatever the reader has typed into the calculator itself — same convention as auto's
// car-depreciation-calculator reference table.
const depreciationScheduleRows = () => {
  const cost = 100000;
  const salvage = 10000;
  const usefulLife = 5;
  const rate = 2 / usefulLife;
  const slAnnual = (cost - salvage) / usefulLife;
  const rows: { label: string; values: number[] }[] = [];
  for (let year = 0; year <= usefulLife; year++) {
    const sl = Math.max(salvage, cost - Math.min(year, usefulLife) * slAnnual);
    const db = decliningBalanceBookValue(cost, salvage, rate, year);
    rows.push({ label: String(year), values: [Math.round(sl), Math.round(db)] });
  }
  return rows;
};

export const businessCalculators: CalculatorConfig[] = [
  {
    id: 'profit-margin-calculator',
    category: 'business',
    glyph: 'M%',
    updatedAt: '2026-11-18',
    aliases: ['gross margin calculator', 'profit margin formula calculator', 'margin percentage calculator', 'sale price margin calculator'],
    related: ['markup-calculator', 'break-even-calculator', 'contribution-margin-calculator', 'commission-calculator'],
    title: 'Profit Margin Calculator',
    description: 'Find profit margin, selling price, or cost from the other two — margin is profit as a percentage of the selling price, the figure behind "gross margin" and most pricing targets.',
    example: 'A product that costs $70 and sells for $100 has a profit margin of 30% — $30 of profit out of every $100 in sales.',
    solver: {
      defaultTarget: 'marginPercent',
      variables: [
        { id: 'sellingPrice', label: 'Selling price', symbol: 'P', dimension: 'currency', defaultValue: 100, defaultUnit: 'currency' },
        { id: 'cost', label: 'Cost', symbol: 'C', dimension: 'currency', defaultValue: 70, defaultUnit: 'currency' },
        { id: 'marginPercent', label: 'Profit margin', symbol: 'M', dimension: 'percent', defaultValue: 30, defaultUnit: '%', bounds: [-500, 99.999] }
      ],
      // Every variable has a closed form: margin is profit over the larger selling price, not cost.
      solve: {
        marginPercent: ({ sellingPrice, cost }) => (sellingPrice > 0 ? ((sellingPrice - cost) / sellingPrice) * 100 : NaN),
        sellingPrice: ({ cost, marginPercent }) => (marginPercent < 100 ? cost / (1 - marginPercent / 100) : NaN),
        cost: ({ sellingPrice, marginPercent }) => sellingPrice * (1 - marginPercent / 100)
      },
      outputs: [
        { id: 'profit', label: 'Profit', dimension: 'currency', compute: (si) => si.sellingPrice - si.cost },
        {
          id: 'markupPercent',
          label: 'Markup on the same sale (profit ÷ cost)',
          dimension: 'percent',
          compute: (si) => (si.cost > 0 ? ((si.sellingPrice - si.cost) / si.cost) * 100 : NaN)
        }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'cost', label: 'Cost' },
            { from: 'profit', label: 'Profit' }
          ],
          center: 'sellingPrice',
          centerSub: 'selling price'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is profit margin?',
        paragraphs: [
          'Profit margin is profit expressed as a percentage of the selling price: how much of each dollar that comes in from a sale is left over after the cost of that sale is covered. A 30% margin means 30 cents of every sales dollar is profit, with the other 70 cents covering cost.',
          'Margin is easy to confuse with markup, a related but different percentage covered on its own page here: markup is profit as a percentage of cost, not of selling price. Omni Calculator\'s margin calculator states the distinction directly — margin is "the ratio of profit to the sale price," while markup is "the ratio of profit to the purchase price (cost of goods sold)." Divide the same profit by two different numbers (the larger selling price versus the smaller cost) and the two percentages always differ once there is any profit at all.',
          'The underlying relationship works in any of three directions: given a selling price and a cost, margin is calculable directly; given a cost and a target margin, the selling price needed to hit it follows; and given a selling price and a target margin, the maximum cost that still clears it follows too. All three use the same algebra, just rearranged.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of selling price, cost and profit margin. The third, marked auto, is calculated.',
        steps: [
          { name: 'Enter the selling price', text: 'What the product or service actually sells for.' },
          { name: 'Enter the cost', text: 'What it costs to produce, buy, or deliver — the figure the selling price has to clear.' },
          { name: 'Read the margin', text: 'Profit margin is profit divided by the selling price, shown as a percentage.' },
          { name: 'Or solve backward', text: 'Leave selling price alone to find the price that hits a target margin on a known cost, or leave cost alone to find the maximum cost a given price and margin allow.' },
          { name: 'Compare to markup', text: 'The results also show the markup percentage on the same numbers, so you can see how differently the same profit reads depending on which figure it is divided by.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Profit is the gap between selling price and cost. Margin divides that profit by the selling price, so the formula rearranges to solve for price or cost instead.',
        expression:
          'profit = sellingPrice − cost\nmarginPercent = profit ÷ sellingPrice × 100\nsellingPrice = cost ÷ (1 − marginPercent ÷ 100)\ncost = sellingPrice × (1 − marginPercent ÷ 100)',
        terms: [
          { symbol: 'profit', meaning: 'Selling price minus cost — the dollar amount kept from the sale.' },
          { symbol: 'marginPercent', meaning: 'Profit as a percentage of the selling price, not of cost.' }
        ],
        note: 'Estimates only, and only as good as the "cost" figure entered — including only direct product cost gives a gross margin, while including overhead gives a thinner net margin. See the companion markup calculator for the cost-based version of this same relationship.'
      },
      workedExample: {
        intro: 'A product costs $70 to make and sells for $100. What is the margin, and what would the price need to be to reach a 40% margin instead?',
        rows: [
          { label: 'Profit (100 − 70)', value: '$30' },
          { label: 'Margin (30 ÷ 100 × 100)', value: '30%' },
          { label: 'Markup on the same sale (30 ÷ 70 × 100)', value: '42.86%' },
          { label: 'Price for a 40% margin at the same $70 cost (70 ÷ (1 − 0.40))', value: '$116.67' }
        ],
        result: 'At $100, margin is 30% (and markup is 42.86%); reaching 40% margin on the same $70 cost needs a $116.67 price.',
        explanation: 'Raising the margin target from 30% to 40% does not mean raising the price by 10%: the price actually needs to rise by about 16.67% (from $100 to $116.67), because margin is nonlinear in price — covering a bigger percentage of a bigger number takes more than a one-point price bump.'
      },
      watchOut: [
        { title: 'Margin and markup are never the same number once there is profit', body: 'Margin divides profit by the larger selling price; markup divides it by the smaller cost. On the $70-cost, $100-price example above, margin is 30% but markup is 42.86% — the same $30 of profit, two different percentages.' },
        { title: 'Margin can never reach 100%', body: 'A 100% margin would mean a cost of $0, and margin only approaches 100% as cost shrinks toward zero. Markup has no such ceiling — a 100% markup just means doubling the cost.' },
        { title: 'What counts as "cost" changes the answer', body: 'A margin built from only direct product or unit cost is usually called gross margin; subtracting a fuller allocation of overhead, labor, and overhead gives a thinner net margin. Compare margins calculated the same way, not margins built from different cost definitions.' },
        { title: 'A target margin increase needs a larger price increase than it looks', body: 'Because margin is profit over price, not over cost, closing a 10-percentage-point margin gap (30% to 40% in the worked example) needs a price increase bigger than 10% — about 16.67% here.' },
        { title: 'A negative margin means a loss, not a small profit', body: 'If cost is higher than selling price, margin comes out negative — the sale loses money rather than making a thin profit.' }
      ],
      references: [
        { label: 'Omni Calculator, Margin Calculator', url: 'https://www.omnicalculator.com/finance/margin' },
        { label: 'OpenStax, Principles of Managerial Accounting §3.1, Contribution margin per unit and ratio', url: 'https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin' }
      ]
    },
    inputs: [
      { id: 'sellingPrice', label: 'Selling price', type: 'currency', placeholder: '100', defaultValue: 100, step: 1, min: 0 },
      { id: 'cost', label: 'Cost', type: 'currency', placeholder: '70', defaultValue: 70, step: 1, min: 0 }
    ],
    seo: {
      title: 'Profit Margin Calculator – Margin, Price, or Cost',
      description: 'Calculate profit margin from selling price and cost, or solve backward for the price or cost that hits a target margin. Free, with a markup comparison.',
      faq: [
        { question: 'How do I calculate profit margin?', answer: 'Subtract cost from selling price to get profit, then divide profit by the selling price and multiply by 100. A $100 sale costing $70 has $30 profit and a 30% margin.' },
        { question: 'What is the difference between margin and markup?', answer: 'Margin divides profit by the selling price; markup divides the same profit by cost. On a $70-cost, $100-price sale, margin is 30% but markup is 42.86% — always a different number once there is any profit.' },
        { question: 'What is a good profit margin?', answer: 'It depends heavily on the industry — retail and restaurants often run thin single-digit-to-20% margins, while software and services can run much higher. There is no universal target margin.' },
        { question: 'Can profit margin be over 100%?', answer: 'No. Margin is profit divided by selling price, and profit can never exceed the selling price itself (that would mean a negative cost), so margin is mathematically capped just below 100%.' },
        { question: 'How do I find the price that hits a target margin?', answer: 'Divide cost by (1 − target margin as a decimal). A $70 cost at a 40% margin target needs a price of 70 ÷ 0.60 = $116.67.' },
        { question: 'Is gross margin the same as profit margin?', answer: 'They are the same formula (profit ÷ revenue). "Gross margin" usually means the cost figure used is only direct product cost (cost of goods sold); "net margin" subtracts a fuller set of costs, which gives a lower number from the same revenue.' },
        { question: 'Why did a 10-point margin increase need more than a 10% price increase?', answer: 'Because margin is profit over price, not over cost. Going from a 30% to a 40% margin on a $70 cost raises the price from $100 to $116.67 — a 16.67% increase, not 10%.' }
      ]
    },
    compute(values) {
      const profit = values.sellingPrice - values.cost;
      const marginPercent = values.sellingPrice > 0 ? (profit / values.sellingPrice) * 100 : NaN;
      const markupPercent = values.cost > 0 ? (profit / values.cost) * 100 : NaN;
      return { marginPercent, profit, markupPercent };
    }
  },
  {
    id: 'markup-calculator',
    category: 'business',
    glyph: 'MU%',
    updatedAt: '2026-11-18',
    aliases: ['markup percentage calculator', 'cost plus pricing calculator', 'markup on cost calculator', 'how much to mark up calculator'],
    related: ['profit-margin-calculator', 'break-even-calculator', 'contribution-margin-calculator', 'commission-calculator'],
    title: 'Markup Calculator',
    description: 'Find markup, selling price, or cost from the other two — markup is profit as a percentage of cost, the cost-plus-pricing companion to the margin calculator.',
    example: 'A product that costs $70 and sells for $100 has a markup of 42.86% — $30 of profit on top of a $70 cost.',
    solver: {
      defaultTarget: 'markupPercent',
      variables: [
        { id: 'cost', label: 'Cost', symbol: 'C', dimension: 'currency', defaultValue: 70, defaultUnit: 'currency' },
        { id: 'sellingPrice', label: 'Selling price', symbol: 'P', dimension: 'currency', defaultValue: 100, defaultUnit: 'currency' },
        { id: 'markupPercent', label: 'Markup', symbol: 'U', dimension: 'percent', defaultValue: 42.857142857142854, defaultUnit: '%', bounds: [-100, 10000] }
      ],
      // Every variable has a closed form: markup is profit over the smaller cost, not selling price.
      solve: {
        markupPercent: ({ sellingPrice, cost }) => (cost > 0 ? ((sellingPrice - cost) / cost) * 100 : NaN),
        sellingPrice: ({ cost, markupPercent }) => cost * (1 + markupPercent / 100),
        cost: ({ sellingPrice, markupPercent }) => (markupPercent > -100 ? sellingPrice / (1 + markupPercent / 100) : NaN)
      },
      outputs: [
        { id: 'profit', label: 'Profit', dimension: 'currency', compute: (si) => si.sellingPrice - si.cost },
        {
          id: 'marginPercent',
          label: 'Margin on the same sale (profit ÷ price)',
          dimension: 'percent',
          compute: (si) => (si.sellingPrice > 0 ? ((si.sellingPrice - si.cost) / si.sellingPrice) * 100 : NaN)
        }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'cost', label: 'Cost' },
            { from: 'profit', label: 'Profit' }
          ],
          center: 'sellingPrice',
          centerSub: 'selling price'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is markup?',
        paragraphs: [
          'Markup is profit expressed as a percentage of cost, not of selling price — the "cost-plus" number behind pricing rules like "mark everything up 50% over wholesale." A 50% markup on a $70 cost adds $35 of profit, for a $105 selling price.',
          'This is the companion calculator to profit margin, and the two are easy to mix up because they describe the same sale but divide the same profit by a different number. Omni Calculator\'s margin calculator states the distinction directly: margin is "the ratio of profit to the sale price," while markup is "the ratio of profit to the purchase price (cost of goods sold)." Because cost is always smaller than selling price whenever a sale is profitable, markup on a profitable sale is always a larger percentage than margin on that same sale — 42.86% markup versus 30% margin on the $70-cost, $100-price example below.',
          'The relationship runs in any of three directions: given a cost and a selling price, markup is calculable directly; given a cost and a target markup, the resulting selling price follows; and given a selling price and a target markup, the cost that was marked up to reach it follows too.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of cost, selling price and markup. The third, marked auto, is calculated.',
        steps: [
          { name: 'Enter the cost', text: 'What it costs to produce, buy, or deliver — the base the markup is added on top of.' },
          { name: 'Enter the selling price', text: 'What it actually sells for.' },
          { name: 'Read the markup', text: 'Markup is profit divided by cost, shown as a percentage.' },
          { name: 'Or solve backward', text: 'Leave selling price alone to price a known cost at a target markup, or leave cost alone to see what cost a known price and markup imply.' },
          { name: 'Compare to margin', text: 'The results also show the margin percentage on the same numbers, so you can see how a cost-plus rule translates into a margin figure.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Profit is the gap between selling price and cost, same as margin. Markup divides that profit by cost instead of selling price.',
        expression:
          'profit = sellingPrice − cost\nmarkupPercent = profit ÷ cost × 100\nsellingPrice = cost × (1 + markupPercent ÷ 100)\ncost = sellingPrice ÷ (1 + markupPercent ÷ 100)',
        terms: [
          { symbol: 'profit', meaning: 'Selling price minus cost — the dollar amount kept from the sale.' },
          { symbol: 'markupPercent', meaning: 'Profit as a percentage of cost, not of selling price.' }
        ],
        note: 'Estimates only. See the companion profit margin calculator for the selling-price-based version of this same relationship — the two will not match unless profit is exactly zero.'
      },
      workedExample: {
        intro: 'A product costs $70 to make and sells for $100. What is the markup, and what would a 50% markup on the same cost sell for instead?',
        rows: [
          { label: 'Profit (100 − 70)', value: '$30' },
          { label: 'Markup (30 ÷ 70 × 100)', value: '42.86%' },
          { label: 'Margin on the same sale (30 ÷ 100 × 100)', value: '30%' },
          { label: 'Price at a 50% markup on the same $70 cost (70 × 1.50)', value: '$105.00' }
        ],
        result: 'At a $100 price, markup is 42.86% (and margin is 30%); a 50% markup on the same $70 cost prices at $105.00.',
        explanation: 'A simple "mark it up 50%" rule is a markup, not a margin — multiplying cost by 1.50 is a one-step calculation, while hitting a 50% margin on the same $70 cost would instead require dividing by (1 − 0.50), pricing at $140.00. The two rules sound similar but produce very different prices.'
      },
      watchOut: [
        { title: 'Markup and margin are never the same number once there is profit', body: 'Markup divides profit by the smaller cost; margin divides it by the larger selling price. On the $70-cost, $100-price example above, markup is 42.86% but margin is 30% — the same $30 of profit, two different percentages.' },
        { title: 'A "50% markup" and a "50% margin" price very differently', body: 'A 50% markup on a $70 cost multiplies by 1.50, pricing at $105. A 50% margin target on the same cost instead divides by 0.50, pricing at $140 — nearly 33% higher. Confirm which one a pricing rule actually means before applying it.' },
        { title: 'Markup has no ceiling; margin is capped below 100%', body: 'A 100% markup just means doubling the cost — there is no mathematical limit beyond that. Margin, by contrast, can only approach 100% as cost shrinks toward zero.' },
        { title: 'What counts as "cost" changes the answer', body: 'Marking up only direct product or unit cost gives a different, usually smaller, selling price than marking up a fuller cost that includes overhead and labor. Keep the cost definition consistent when comparing markups.' },
        { title: 'A negative markup means a loss, not a small profit', body: 'If the selling price is below cost, markup comes out negative — the sale loses money rather than making a thin profit.' }
      ],
      references: [
        { label: 'Omni Calculator, Margin Calculator', url: 'https://www.omnicalculator.com/finance/margin' },
        { label: 'OpenStax, Principles of Managerial Accounting §3.1, Contribution margin per unit and ratio', url: 'https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin' }
      ]
    },
    inputs: [
      { id: 'cost', label: 'Cost', type: 'currency', placeholder: '70', defaultValue: 70, step: 1, min: 0 },
      { id: 'sellingPrice', label: 'Selling price', type: 'currency', placeholder: '100', defaultValue: 100, step: 1, min: 0 }
    ],
    seo: {
      title: 'Markup Calculator – Markup, Price, or Cost',
      description: 'Calculate markup from cost and selling price, or solve backward for the price or cost that hits a target markup. Free, with a margin comparison.',
      faq: [
        { question: 'How do I calculate markup?', answer: 'Subtract cost from selling price to get profit, then divide profit by the cost and multiply by 100. A $70 cost sold for $100 has $30 profit and a 42.86% markup.' },
        { question: 'What is the difference between markup and margin?', answer: 'Markup divides profit by cost; margin divides the same profit by selling price. On a $70-cost, $100-price sale, markup is 42.86% but margin is 30% — always a different number once there is any profit.' },
        { question: 'Is a 50% markup the same as a 50% margin?', answer: 'No. A 50% markup on a $70 cost prices at $105 (cost × 1.50). A 50% margin target on the same cost prices at $140 (cost ÷ 0.50) — a markup rule and a margin rule with the same percentage number produce different prices.' },
        { question: 'How do I price something to hit a target markup?', answer: 'Multiply cost by (1 + target markup as a decimal). A $70 cost at a 50% markup prices at 70 × 1.50 = $105.' },
        { question: 'Can markup be over 100%?', answer: 'Yes, with no mathematical ceiling — a 100% markup doubles the cost, a 200% markup triples it, and so on. This is unlike margin, which is capped just below 100%.' },
        { question: 'Which should I use, markup or margin?', answer: 'Markup is simpler for cost-plus pricing rules ("add 50% to cost"). Margin is usually what matters for profitability targets, since it says what share of revenue is actually profit. Many businesses track both.' },
        { question: 'What is the markup on the profit-margin-calculator\'s example?', answer: 'That page\'s $70-cost, $100-price example (30% margin) is 42.86% markup here — the same sale, read as profit over cost instead of profit over price.' }
      ]
    },
    compute(values) {
      const profit = values.sellingPrice - values.cost;
      const markupPercent = values.cost > 0 ? (profit / values.cost) * 100 : NaN;
      const marginPercent = values.sellingPrice > 0 ? (profit / values.sellingPrice) * 100 : NaN;
      return { markupPercent, profit, marginPercent };
    }
  },
  {
    id: 'break-even-calculator',
    category: 'business',
    glyph: 'BE',
    updatedAt: '2026-11-18',
    aliases: ['break even point calculator', 'break even analysis calculator', 'break even units calculator', 'how many units to break even calculator'],
    related: ['contribution-margin-calculator', 'profit-margin-calculator', 'business-loan-calculator', 'commission-calculator'],
    title: 'Break-Even Calculator',
    description: 'Find the break-even point — in units or in sales dollars — from fixed costs, price per unit, and variable cost per unit, or solve backward for the price or cost it takes to break even at a given volume.',
    example: 'With $24,000 of fixed costs, a $60 price, and $35 of variable cost per unit, break-even is 960 units, or $57,600 in sales.',
    solver: {
      defaultTarget: 'breakEvenUnits',
      variables: [
        { id: 'fixedCosts', label: 'Fixed costs', symbol: 'F', dimension: 'currency', defaultValue: 24000, defaultUnit: 'currency' },
        { id: 'pricePerUnit', label: 'Price per unit', symbol: 'P', dimension: 'currency', defaultValue: 60, defaultUnit: 'currency' },
        { id: 'variableCostPerUnit', label: 'Variable cost per unit', symbol: 'V', dimension: 'currency', defaultValue: 35, defaultUnit: 'currency' },
        { id: 'breakEvenUnits', label: 'Break-even units', symbol: 'Q', dimension: 'count', defaultValue: 960, defaultUnit: 'count', bounds: [0, 1e9] }
      ],
      // Every variable has a closed form around the one break-even equation: F = Q(P - V).
      solve: {
        breakEvenUnits: ({ fixedCosts, pricePerUnit, variableCostPerUnit }) =>
          pricePerUnit - variableCostPerUnit > 0 ? fixedCosts / (pricePerUnit - variableCostPerUnit) : NaN,
        fixedCosts: ({ breakEvenUnits, pricePerUnit, variableCostPerUnit }) => breakEvenUnits * (pricePerUnit - variableCostPerUnit),
        pricePerUnit: ({ fixedCosts, breakEvenUnits, variableCostPerUnit }) =>
          breakEvenUnits > 0 ? variableCostPerUnit + fixedCosts / breakEvenUnits : NaN,
        variableCostPerUnit: ({ fixedCosts, breakEvenUnits, pricePerUnit }) =>
          breakEvenUnits > 0 ? pricePerUnit - fixedCosts / breakEvenUnits : NaN
      },
      outputs: [
        { id: 'contributionMarginPerUnit', label: 'Contribution margin per unit', dimension: 'currency', compute: (si) => si.pricePerUnit - si.variableCostPerUnit },
        {
          id: 'contributionMarginRatio',
          label: 'Contribution margin ratio',
          dimension: 'percent',
          compute: (si) => (si.pricePerUnit > 0 ? ((si.pricePerUnit - si.variableCostPerUnit) / si.pricePerUnit) * 100 : NaN)
        },
        { id: 'breakEvenRevenue', label: 'Break-even sales (dollars)', dimension: 'currency', compute: (si) => si.breakEvenUnits * si.pricePerUnit },
        { id: 'totalVariableCostAtBreakEven', label: 'Total variable cost at break-even', dimension: 'currency', compute: (si) => si.breakEvenUnits * si.variableCostPerUnit }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'fixedCosts', label: 'Fixed costs' },
            { from: 'totalVariableCostAtBreakEven', label: 'Variable costs' }
          ],
          center: 'breakEvenRevenue',
          centerSub: 'break-even sales'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is the break-even point?',
        paragraphs: [
          "The U.S. Small Business Administration defines the break-even point as \"the point at which total cost and total revenue are equal, meaning there is no loss or gain\" for a business — the sales volume where a venture stops losing money and is about to start making it, with every dollar above that point falling straight to profit (before tax).",
          "The SBA gives the formula as fixed costs divided by (price minus variable costs), which is exactly this calculator's break-even-units direction. Price minus variable cost per unit is the contribution margin per unit — the amount each sale contributes toward covering fixed costs before anything is left over as profit — covered in more detail on its own page here, since it is the denominator in every direction of this formula.",
          'There is also a dollars version: break-even sales equal fixed costs divided by the contribution margin ratio (contribution margin per unit divided by price), rather than fixed costs divided by contribution margin per unit alone. Both versions describe the same break-even point, one in units sold and one in total revenue.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of fixed costs, price per unit, variable cost per unit and break-even units. The fourth, marked auto, is calculated.',
        steps: [
          { name: 'Enter fixed costs', text: 'Costs that stay the same regardless of how many units are sold — rent, salaries, insurance, loan payments.' },
          { name: 'Enter the price per unit', text: 'What one unit sells for.' },
          { name: 'Enter the variable cost per unit', text: 'What it costs to produce or deliver one more unit — materials, direct labor, shipping.' },
          { name: 'Read break-even units', text: 'How many units need to sell before fixed costs are fully covered. Break-even sales dollars and the contribution margin figures are shown alongside it.' },
          { name: 'Or solve backward', text: 'Leave fixed costs, price, or variable cost alone instead to see what a known break-even volume implies about any of the other three.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Contribution margin per unit is what is left of price after variable cost. Dividing fixed costs by it gives the units needed to cover those fixed costs exactly.',
        expression:
          'contributionMarginPerUnit = pricePerUnit − variableCostPerUnit\nbreakEvenUnits = fixedCosts ÷ contributionMarginPerUnit\ncontributionMarginRatio = contributionMarginPerUnit ÷ pricePerUnit × 100\nbreakEvenRevenue = breakEvenUnits × pricePerUnit = fixedCosts ÷ (contributionMarginRatio ÷ 100)',
        terms: [
          { symbol: 'fixedCosts', meaning: 'Costs that do not change with sales volume in the period being analyzed.' },
          { symbol: 'contributionMarginPerUnit', meaning: 'Price minus variable cost per unit — what each unit sold contributes toward fixed costs and, beyond break-even, profit.' }
        ],
        note: 'Estimates only, and a simplified model: it assumes price and variable cost per unit stay constant at every volume, with no bulk-purchase discounts, no step changes in fixed costs, and no tax. Real break-even points shift as a business scales past the range these assumptions hold for.'
      },
      workedExample: {
        intro: 'A small manufacturer has $24,000 of monthly fixed costs, sells a product for $60, and spends $35 in variable cost per unit. How many units, and how much revenue, does it take to break even?',
        rows: [
          { label: 'Contribution margin per unit (60 − 35)', value: '$25' },
          { label: 'Break-even units (24,000 ÷ 25)', value: '960 units' },
          { label: 'Contribution margin ratio (25 ÷ 60 × 100)', value: '41.67%' },
          { label: 'Break-even sales (960 × 60)', value: '$57,600' }
        ],
        result: 'Break-even is 960 units, or $57,600 in sales.',
        explanation: 'Checked the dollars way: fixed costs ÷ contribution margin ratio = 24,000 ÷ 0.41667 ≈ $57,600, the same figure as 960 units × $60. Selling a 961st unit clears $25 of pure profit, since every unit past break-even no longer has to help cover the $24,000 of fixed costs.'
      },
      watchOut: [
        { title: 'Fixed costs only stay fixed within a range', body: 'Renting a bigger warehouse or hiring a second manager to support higher volume are "step" increases in fixed costs that this linear model does not capture — it assumes the same fixed-cost base at every volume.' },
        { title: 'Variable cost per unit can change with volume too', body: 'Bulk-purchase discounts can lower variable cost per unit at higher volumes, which would lower the real break-even point below what a single constant variable-cost figure predicts.' },
        { title: 'Break-even is not the same as profitable', body: 'At exactly the break-even point, profit is zero by definition — the business is covering its costs but not yet making money. A sales target should sit meaningfully above break-even, not at it.' },
        { title: 'This ignores tax and financing costs', body: 'Break-even analysis as modeled here works in pre-tax, operating terms. Interest on debt and income tax both reduce how much of "profit past break-even" actually reaches the owner.' },
        { title: 'Contribution margin feeds this calculator\'s denominator', body: 'Price minus variable cost per unit is the same contribution margin per unit calculated on its own page here — a drop in contribution margin (a price cut, or a rise in variable cost) raises the break-even point, even if fixed costs do not change.' }
      ],
      references: [
        { label: 'U.S. Small Business Administration, Calculate your startup costs (break-even analysis)', url: 'https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs' },
        { label: 'OpenStax, Principles of Managerial Accounting §3.2, Calculate a break-even point in units and dollars', url: 'https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars' }
      ]
    },
    inputs: [
      { id: 'fixedCosts', label: 'Fixed costs', type: 'currency', placeholder: '24000', defaultValue: 24000, step: 500, min: 0 },
      { id: 'pricePerUnit', label: 'Price per unit', type: 'currency', placeholder: '60', defaultValue: 60, step: 1, min: 0 },
      { id: 'variableCostPerUnit', label: 'Variable cost per unit', type: 'currency', placeholder: '35', defaultValue: 35, step: 1, min: 0 }
    ],
    seo: {
      title: 'Break-Even Calculator – Units and Sales Dollars',
      description: 'Calculate the break-even point in units and sales dollars from fixed costs, price and variable cost per unit, or solve backward, with contribution margin.',
      faq: [
        { question: 'How do I calculate the break-even point?', answer: 'Divide fixed costs by contribution margin per unit (price minus variable cost per unit). $24,000 of fixed costs with a $25 contribution margin ($60 price, $35 variable cost) breaks even at 960 units.' },
        { question: 'What is break-even in sales dollars, not units?', answer: 'Fixed costs divided by the contribution margin ratio (contribution margin per unit divided by price). In the example, $24,000 ÷ 41.67% ≈ $57,600, the same as 960 units × $60.' },
        { question: 'What is contribution margin, and why does it matter here?', answer: 'Contribution margin per unit is price minus variable cost per unit — the amount each sale puts toward fixed costs. It is the denominator of the break-even formula: a lower contribution margin means more units are needed to break even.' },
        { question: 'Does break-even mean the business is profitable?', answer: 'No. At exactly the break-even point, total revenue equals total cost and profit is zero. Only sales beyond that point turn into profit.' },
        { question: 'What counts as a fixed cost versus a variable cost?', answer: 'Fixed costs (rent, salaries, insurance) do not change with sales volume over the period being analyzed. Variable costs (materials, direct labor, shipping) rise and fall with each unit sold.' },
        { question: 'Does this account for taxes?', answer: 'No. This is a pre-tax, operating break-even calculation. Income tax and interest on any debt both reduce how much of the profit earned past break-even is actually kept.' },
        { question: 'How is break-even different from payback period?', answer: 'Break-even finds the sales volume where revenue equals cost in a given period. payback-period-calculator instead finds how long it takes an upfront investment to be recovered from cash flow — a different question about time, not volume.' }
      ]
    },
    compute(values) {
      const contributionMarginPerUnit = values.pricePerUnit - values.variableCostPerUnit;
      const breakEvenUnits = contributionMarginPerUnit > 0 ? values.fixedCosts / contributionMarginPerUnit : NaN;
      const contributionMarginRatio = values.pricePerUnit > 0 ? (contributionMarginPerUnit / values.pricePerUnit) * 100 : NaN;
      const breakEvenRevenue = breakEvenUnits * values.pricePerUnit;
      return { breakEvenUnits, contributionMarginPerUnit, contributionMarginRatio, breakEvenRevenue };
    }
  },
  {
    id: 'contribution-margin-calculator',
    category: 'business',
    glyph: 'CM',
    updatedAt: '2026-11-18',
    aliases: ['contribution margin ratio calculator', 'unit contribution margin calculator', 'contribution margin per unit calculator', 'CM ratio calculator'],
    related: ['break-even-calculator', 'profit-margin-calculator', 'markup-calculator', 'cost-of-goods-sold-calculator'],
    title: 'Contribution Margin Calculator',
    description: 'Find the contribution margin per unit or its ratio to price — what each sale leaves over after variable cost, before fixed costs are even considered, and the denominator of the break-even formula.',
    example: 'A product priced at $60 with $35 of variable cost per unit has a $25 contribution margin, a 41.67% contribution margin ratio.',
    solver: {
      defaultTarget: 'contributionMarginRatio',
      variables: [
        { id: 'pricePerUnit', label: 'Price per unit', symbol: 'P', dimension: 'currency', defaultValue: 60, defaultUnit: 'currency' },
        { id: 'variableCostPerUnit', label: 'Variable cost per unit', symbol: 'V', dimension: 'currency', defaultValue: 35, defaultUnit: 'currency' },
        { id: 'contributionMarginRatio', label: 'Contribution margin ratio', symbol: 'R', dimension: 'percent', defaultValue: 41.666666666666664, defaultUnit: '%', bounds: [-500, 99.999] }
      ],
      // Same shape as profit-margin-calculator, but framed per unit of variable cost (the
      // break-even calculator's own denominator) rather than total cost.
      solve: {
        contributionMarginRatio: ({ pricePerUnit, variableCostPerUnit }) =>
          pricePerUnit > 0 ? ((pricePerUnit - variableCostPerUnit) / pricePerUnit) * 100 : NaN,
        pricePerUnit: ({ variableCostPerUnit, contributionMarginRatio }) =>
          contributionMarginRatio < 100 ? variableCostPerUnit / (1 - contributionMarginRatio / 100) : NaN,
        variableCostPerUnit: ({ pricePerUnit, contributionMarginRatio }) => pricePerUnit * (1 - contributionMarginRatio / 100)
      },
      outputs: [
        { id: 'contributionMarginPerUnit', label: 'Contribution margin per unit', dimension: 'currency', compute: (si) => si.pricePerUnit - si.variableCostPerUnit }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'variableCostPerUnit', label: 'Variable cost' },
            { from: 'contributionMarginPerUnit', label: 'Contribution margin' }
          ],
          center: 'pricePerUnit',
          centerSub: 'price per unit'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is contribution margin?',
        paragraphs: [
          'OpenStax\'s Principles of Managerial Accounting defines contribution margin per unit simply: "Per Unit Sales Price minus Variable Cost per Unit equals Contribution Margin per Unit." It is what one more sale actually contributes toward covering fixed costs — rent, salaries, insurance — before anything is left over as profit. The contribution margin ratio is the same figure divided by price, expressed as a percentage.',
          'This is deliberately not the same question as overall profitability: contribution margin only nets out variable costs (the ones that rise and fall with each unit), never fixed costs. A business can have a healthy per-unit contribution margin and still lose money overall if it does not sell enough units to cover its fixed costs — which is exactly the question the companion break-even calculator answers, using this figure as its denominator.',
          "Selling price minus variable cost per unit is also, by a different name, the same formula behind the profit margin and markup calculators here — this page frames it specifically around variable cost per unit (the piece that matters for break-even and volume decisions) rather than a general notion of cost, so the two pages answer related but distinct questions."
        ]
      },
      howTo: {
        intro: 'Fill in any two of price per unit, variable cost per unit and contribution margin ratio. The third, marked auto, is calculated.',
        steps: [
          { name: 'Enter the price per unit', text: 'What one unit sells for.' },
          { name: 'Enter the variable cost per unit', text: 'What it costs to produce or deliver one more unit — materials, direct labor, shipping, payment-processing fees per sale.' },
          { name: 'Read the contribution margin ratio', text: 'Contribution margin per unit divided by price, as a percentage — the share of each sale left after variable costs.' },
          { name: 'Or solve backward', text: 'Leave price alone to find the price needed for a target ratio at a known variable cost, or leave variable cost alone to see what cost a known price and ratio imply.' },
          { name: 'Feed it into break-even', text: 'The dollar contribution margin per unit shown here is the same figure the break-even calculator divides fixed costs by.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Contribution margin per unit is price minus variable cost. The ratio divides that figure by price.',
        expression:
          'contributionMarginPerUnit = pricePerUnit − variableCostPerUnit\ncontributionMarginRatio = contributionMarginPerUnit ÷ pricePerUnit × 100\npricePerUnit = variableCostPerUnit ÷ (1 − contributionMarginRatio ÷ 100)',
        terms: [
          { symbol: 'variableCostPerUnit', meaning: 'Costs that scale directly with each unit sold — not fixed costs like rent or salaries.' },
          { symbol: 'contributionMarginRatio', meaning: 'The share of each sales dollar left after variable costs, before fixed costs are considered at all.' }
        ],
        note: 'Estimates only. This figure nets out variable costs only — it is not a statement of overall profitability, which also depends on fixed costs and sales volume (see the break-even calculator).'
      },
      workedExample: {
        intro: 'A product is priced at $60 per unit, with $35 of variable cost per unit. What is the contribution margin, and what price would be needed for a 50% ratio on the same variable cost?',
        rows: [
          { label: 'Contribution margin per unit (60 − 35)', value: '$25' },
          { label: 'Contribution margin ratio (25 ÷ 60 × 100)', value: '41.67%' },
          { label: 'Price for a 50% ratio at the same $35 variable cost (35 ÷ (1 − 0.50))', value: '$70.00' }
        ],
        result: 'At $60, the contribution margin is $25 per unit (a 41.67% ratio); a 50% ratio on the same $35 variable cost needs a $70 price.',
        explanation: 'This $25 contribution margin per unit is exactly the figure the break-even calculator\'s worked example divides $24,000 of fixed costs by, to get 960 break-even units — the two pages share the same underlying number.'
      },
      watchOut: [
        { title: 'Contribution margin is not overall profit', body: 'It only subtracts variable costs. Fixed costs still have to be covered out of the total contribution margin earned across every unit sold — a positive per-unit contribution margin does not by itself mean the business is profitable.' },
        { title: 'Classifying a cost as fixed or variable changes the answer', body: 'A cost that scales with volume (materials, piece-rate labor, per-transaction fees) belongs in variable cost per unit; a cost that does not (rent, salaried wages, insurance) does not. Misclassifying a cost shifts both this ratio and the break-even point built on it.' },
        { title: 'The ratio and the per-unit dollar figure answer different questions', body: 'Contribution margin per unit (a dollar amount) is what break-even-calculator divides fixed costs by to get units. The ratio (a percentage) is what it divides fixed costs by to get break-even sales dollars instead — both describe the same relationship, in different units.' },
        { title: 'A higher price is not the only way to raise contribution margin', body: 'Lowering variable cost per unit (a cheaper supplier, a more efficient process) raises contribution margin exactly as much as raising price does, without needing customers to accept a higher price.' },
        { title: 'A negative contribution margin means every sale loses money before fixed costs', body: 'If variable cost per unit exceeds price, contribution margin is negative — selling more units makes the loss worse, not better, regardless of fixed costs.' }
      ],
      references: [
        { label: 'OpenStax, Principles of Managerial Accounting §3.1, Contribution margin per unit and ratio', url: 'https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin' },
        { label: 'U.S. Small Business Administration, Calculate your startup costs (break-even analysis)', url: 'https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs' }
      ]
    },
    inputs: [
      { id: 'pricePerUnit', label: 'Price per unit', type: 'currency', placeholder: '60', defaultValue: 60, step: 1, min: 0 },
      { id: 'variableCostPerUnit', label: 'Variable cost per unit', type: 'currency', placeholder: '35', defaultValue: 35, step: 1, min: 0 }
    ],
    seo: {
      title: 'Contribution Margin Calculator – Per Unit and Ratio',
      description: 'Calculate contribution margin per unit and its ratio to price from variable cost, or solve backward. Free, and the same figure break-even analysis uses.',
      faq: [
        { question: 'How do I calculate contribution margin?', answer: 'Subtract variable cost per unit from price per unit. A $60 price with $35 of variable cost has a $25 contribution margin per unit.' },
        { question: 'What is the contribution margin ratio?', answer: 'Contribution margin per unit divided by price, as a percentage. A $25 contribution margin on a $60 price is a 41.67% ratio.' },
        { question: 'Is contribution margin the same as profit?', answer: 'No. It only removes variable costs. Fixed costs (rent, salaries) still have to be covered from the total contribution margin earned across all units before there is any actual profit.' },
        { question: 'How is contribution margin used in break-even analysis?', answer: 'Break-even units equal fixed costs divided by contribution margin per unit; break-even sales dollars equal fixed costs divided by the contribution margin ratio. It is the denominator in both versions of the break-even formula.' },
        { question: 'What counts as a variable cost?', answer: 'Costs that scale directly with each unit sold — materials, direct labor paid per unit, shipping, and per-transaction fees. Costs that stay the same regardless of volume, like rent or salaried wages, are fixed costs instead.' },
        { question: 'How do I raise my contribution margin?', answer: 'Either raise price or lower variable cost per unit — both increase contribution margin by the same dollar amount. A $70 price on the $35-variable-cost example raises the ratio to 50%, the same result a lower variable cost would give at the original $60 price.' },
        { question: 'What does a negative contribution margin mean?', answer: 'Variable cost per unit exceeds price, so every unit sold loses money even before fixed costs are considered — selling more units makes the total loss larger, not smaller.' }
      ]
    },
    compute(values) {
      const contributionMarginPerUnit = values.pricePerUnit - values.variableCostPerUnit;
      const contributionMarginRatio = values.pricePerUnit > 0 ? (contributionMarginPerUnit / values.pricePerUnit) * 100 : NaN;
      return { contributionMarginRatio, contributionMarginPerUnit };
    }
  },
  {
    id: 'cost-of-goods-sold-calculator',
    category: 'business',
    glyph: 'COGS',
    updatedAt: '2026-11-18',
    aliases: ['COGS calculator', 'cost of sales calculator', 'beginning and ending inventory calculator', 'gross profit from inventory calculator'],
    related: ['profit-margin-calculator', 'break-even-calculator', 'contribution-margin-calculator', 'commission-calculator'],
    title: 'Cost of Goods Sold (COGS) Calculator',
    description: 'Find cost of goods sold from beginning inventory, purchases, and ending inventory — the same inventory math behind IRS Form 1125-A — plus gross profit and gross margin if you add revenue.',
    example: 'With $40,000 of beginning inventory, $150,000 of purchases, and $35,000 of ending inventory, cost of goods sold is $155,000.',
    breakdown: {
      headline: 'cogs',
      headlineLabel: 'Cost of goods sold',
      outputs: [
        { id: 'cogs', label: 'Cost of goods sold', format: 'currency' },
        { id: 'grossProfit', label: 'Gross profit (if revenue entered)', format: 'currency' },
        { id: 'grossMarginPercent', label: 'Gross margin (if revenue entered)', format: 'percent' }
      ],
      groups: [
        { title: 'Inventory', inputs: ['beginningInventory', 'purchases', 'endingInventory'] },
        { title: 'Revenue (optional, for gross profit)', inputs: ['revenue'], optional: true }
      ],
      derive: (v) => ({ goodsAvailableForSale: v.beginningInventory + v.purchases }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'goodsAvailableForSale', label: 'Available for sale' },
          { from: 'cogs', label: 'Cost of goods sold' }
        ],
        title: 'How much of the goods available for sale were actually sold'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is cost of goods sold?',
        paragraphs: [
          'Cost of goods sold (COGS) is what a business spent on the inventory it actually sold in a period, as opposed to inventory still sitting on the shelf. The core logic is the inventory a business started the period with, plus what it bought or made during the period, minus whatever is left unsold at the end — what went in and did not come back out as remaining stock must have been sold.',
          'This is the same logic the IRS uses on Form 1125-A, Cost of Goods Sold, which US corporations and partnerships attach to their tax return whenever they deduct a cost of goods sold figure: beginning inventory plus purchases (plus, on the full form, cost of labor and certain other capitalized costs) is totaled, and ending inventory is subtracted from that total to arrive at the deductible COGS figure on line 8.',
          'This calculator models the simplified version — beginning inventory, purchases, and ending inventory only — which covers most small retail and resale businesses. A manufacturer with its own direct labor and overhead to capitalize into inventory (Form 1125-A\'s lines 3 through 5) needs a fuller accounting system than three numbers can represent; this page is a starting estimate for that case, not the complete calculation.'
        ]
      },
      howTo: {
        intro: 'Enter beginning inventory, purchases during the period, and ending inventory. Add revenue to also see gross profit and gross margin.',
        steps: [
          { name: 'Enter beginning inventory', text: 'The value of inventory on hand at the start of the period, at cost.' },
          { name: 'Enter purchases', text: 'What was bought or produced to add to inventory during the period.' },
          { name: 'Enter ending inventory', text: 'The value of inventory still on hand, at cost, at the end of the period.' },
          { name: 'Read cost of goods sold', text: 'Beginning inventory plus purchases minus ending inventory.' },
          { name: 'Optionally add revenue', text: 'If you know total sales revenue for the same period, open the optional group to also see gross profit (revenue minus COGS) and gross margin.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Goods available for sale is beginning inventory plus purchases. Subtracting what is left unsold gives what was sold.',
        expression:
          'goodsAvailableForSale = beginningInventory + purchases\nCOGS = goodsAvailableForSale − endingInventory\ngrossProfit = revenue − COGS\ngrossMarginPercent = grossProfit ÷ revenue × 100',
        terms: [
          { symbol: 'beginningInventory, endingInventory', meaning: 'Inventory on hand at cost, at the start and end of the same period.' },
          { symbol: 'purchases', meaning: 'Inventory bought or produced during the period, added to what was already on hand.' }
        ],
        note: 'Estimates only, and a simplified version of IRS Form 1125-A that omits cost of labor and additional capitalized costs (its lines 3 through 5) — appropriate for a basic resale business, not a full manufacturing cost accounting system. Consult a tax professional for an actual return.'
      },
      workedExample: {
        intro: 'A retailer starts the year with $40,000 of inventory, purchases $150,000 more during the year, and ends the year with $35,000 of inventory on hand. Revenue for the year was $220,000.',
        rows: [
          { label: 'Goods available for sale (40,000 + 150,000)', value: '$190,000' },
          { label: 'Cost of goods sold (190,000 − 35,000)', value: '$155,000' },
          { label: 'Gross profit (220,000 − 155,000)', value: '$65,000' },
          { label: 'Gross margin (65,000 ÷ 220,000 × 100)', value: '29.55%' }
        ],
        result: 'Cost of goods sold is $155,000, for a $65,000 gross profit and a 29.55% gross margin.',
        explanation: 'Of the $190,000 in goods available to sell, $155,000 worth were sold (the rest, $35,000, is still sitting in ending inventory) — and that $155,000 is the cost figure that gets compared against the profit-margin-calculator\'s own revenue-minus-cost math to find gross margin.'
      },
      watchOut: [
        { title: 'This is a simplified version of the real tax form', body: 'Form 1125-A also includes cost of labor and additional section 263A capitalized costs in the total before subtracting ending inventory — a manufacturer with direct labor or overhead to capitalize will owe a higher real COGS than this three-number version shows.' },
        { title: 'Inventory valuation method changes the number', body: 'Beginning and ending inventory can be valued at cost, at the lower of cost or market, or under methods like FIFO or LIFO — the same physical inventory can produce a different COGS depending on which valuation method is used consistently.' },
        { title: 'A negative result means a data entry error', body: 'Cost of goods sold cannot be negative in practice. If ending inventory is entered larger than beginning inventory plus purchases, double-check the three figures — it usually means a number was entered for the wrong period.' },
        { title: 'Gross profit and gross margin need an accurate revenue figure for the same period', body: 'Mixing a revenue figure from a different period than the inventory numbers produces a gross profit and gross margin that do not actually describe the same stretch of business.' },
        { title: 'COGS is a tax deduction, not a cash-flow measure', body: 'COGS reduces taxable income on the matching revenue, but the actual cash for purchases may have gone out in an earlier period than the matching sale — COGS and cash spent on inventory are not the same number in a given period.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Form 1125-A, Cost of Goods Sold', url: 'https://www.irs.gov/pub/irs-pdf/f1125a.pdf' },
        { label: 'Internal Revenue Service, About Form 1125-A', url: 'https://www.irs.gov/forms-pubs/about-form-1125-a' }
      ]
    },
    inputs: [
      { id: 'beginningInventory', label: 'Beginning inventory', type: 'currency', placeholder: '40000', defaultValue: 40000, step: 500, min: 0 },
      { id: 'purchases', label: 'Purchases during the period', type: 'currency', placeholder: '150000', defaultValue: 150000, step: 500, min: 0 },
      { id: 'endingInventory', label: 'Ending inventory', type: 'currency', placeholder: '35000', defaultValue: 35000, step: 500, min: 0 },
      { id: 'revenue', label: 'Revenue for the same period', type: 'currency', placeholder: '220000', defaultValue: 220000, step: 1000, min: 0 }
    ],
    seo: {
      title: 'Cost of Goods Sold (COGS) Calculator',
      description: 'Calculate cost of goods sold from beginning inventory, purchases and ending inventory, plus gross profit and gross margin if you add revenue. Free.',
      faq: [
        { question: 'How do I calculate cost of goods sold?', answer: 'Add beginning inventory and purchases, then subtract ending inventory. $40,000 beginning inventory plus $150,000 of purchases minus $35,000 ending inventory is $155,000 of COGS.' },
        { question: 'What is the IRS formula for cost of goods sold?', answer: 'Form 1125-A totals beginning inventory, purchases, cost of labor, and certain other capitalized costs, then subtracts ending inventory. This calculator models the beginning inventory + purchases − ending inventory part, which covers most resale businesses without their own labor or overhead to capitalize.' },
        { question: 'How do I calculate gross profit from COGS?', answer: 'Subtract COGS from revenue for the same period. $220,000 of revenue minus $155,000 of COGS is $65,000 of gross profit, a 29.55% gross margin.' },
        { question: 'Why is my cost of goods sold negative?', answer: 'COGS cannot legitimately be negative. A negative result means ending inventory was entered larger than beginning inventory plus purchases — check that all three figures are for the same period and are not swapped.' },
        { question: 'Does this account for FIFO or LIFO inventory valuation?', answer: 'No. This calculator takes beginning and ending inventory values as given, however they were valued. The valuation method (FIFO, LIFO, or weighted average) is decided before those two numbers are entered here, and changing it would change the inputs, not this formula.' },
        { question: 'What is the difference between this and the profit margin calculator?', answer: 'This calculator finds the cost figure (COGS) from inventory movement. profit-margin-calculator takes a cost and a selling price (which could be this COGS figure, or a per-unit cost) and finds the margin percentage.' },
        { question: 'Does COGS include labor costs?', answer: 'The full IRS Form 1125-A does, as a separate line. This simplified calculator only covers beginning inventory, purchases, and ending inventory — a manufacturer with its own direct labor to capitalize into inventory needs the fuller form, not this page, for an exact figure.' }
      ]
    },
    compute(values) {
      const goodsAvailableForSale = values.beginningInventory + values.purchases;
      const cogs = goodsAvailableForSale - values.endingInventory;
      const grossProfit = values.revenue - cogs;
      const grossMarginPercent = values.revenue > 0 ? (grossProfit / values.revenue) * 100 : NaN;
      return { cogs, grossProfit, grossMarginPercent };
    }
  },
  {
    id: 'depreciation-calculator',
    category: 'business',
    glyph: 'DEP',
    updatedAt: '2026-11-18',
    aliases: ['straight line depreciation calculator', 'declining balance depreciation calculator', 'asset depreciation schedule calculator', 'book value depreciation calculator', 'double declining balance calculator'],
    related: ['car-depreciation-calculator', 'cost-of-goods-sold-calculator', 'business-valuation-calculator', 'payback-period-calculator'],
    title: 'Depreciation Calculator (Straight-Line vs. Declining Balance)',
    description: 'Find an asset\'s book value under the straight-line and 200% declining-balance depreciation methods side by side, from its cost, salvage value, and useful life.',
    example: 'A $50,000 asset with a $5,000 salvage value and a 5-year useful life is worth $23,000 after 3 years under straight-line, or $10,800 under 200% declining balance.',
    breakdown: {
      headline: 'straightLineBookValue',
      headlineLabel: 'Book value — straight-line',
      outputs: [
        { id: 'straightLineBookValue', label: 'Book value — straight-line', format: 'currency' },
        { id: 'decliningBalanceBookValue', label: 'Book value — 200% declining balance', format: 'currency' },
        { id: 'straightLineAnnualDepreciation', label: 'Straight-line annual depreciation', format: 'currency' },
        { id: 'decliningBalanceRatePercent', label: 'Declining-balance rate', format: 'percent' },
        { id: 'decliningBalanceDepreciationThisYear', label: 'Declining-balance depreciation, this year', format: 'currency' }
      ],
      groups: [{ title: 'Asset', inputs: ['cost', 'salvageValue', 'usefulLifeYears', 'year'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'straightLineBookValue', label: 'Straight-line' },
          { from: 'decliningBalanceBookValue', label: 'Declining balance' }
        ],
        title: 'Book value at the entered year, by method'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is depreciation, and why do methods disagree?',
        paragraphs: [
          'Depreciation spreads an asset\'s cost over the years it is used, rather than expensing it all at once. IRS Publication 946 describes the straight-line method plainly: "Subtract the salvage value, if any, from the adjusted basis," then "divide the balance by the number of years in the useful life" — the same amount comes off the book value every year.',
          'The declining-balance method instead takes a fixed percentage off whatever is left each year, so the dollar amount shrinks as the book value shrinks. The governing Treasury regulation, 26 CFR § 1.167(b)-2, states the method as "a uniform rate is applied each year to the unrecovered cost or other basis of the property," with the rate capped so it "shall not exceed twice the appropriate straight line rate computed without adjustment for salvage" — the 200% ("double-declining") rate used here, and the one its own worked example applies to a 20-year asset.',
          'Both methods must stop at the same floor: book value is never written down below a reasonable salvage value. Because declining balance takes a bigger bite early and a smaller one later, the two methods show the same asset at very different book values partway through its life, even though both eventually land at the same floor if the asset is held its full useful life — this page shows both at once, on the same cost, salvage value and useful life, so the shapes of the two curves are easy to compare.',
          'This is a different question from what a car is actually worth to resell — that is the resale-value estimate on the car-depreciation-calculator here. This page models the accounting/tax book-value schedule instead, which is what shows up on a balance sheet or a depreciation schedule, not what a buyer would pay for the asset today.'
        ]
      },
      howTo: {
        intro: 'Enter the asset\'s cost, salvage value, useful life, and the year you want to check.',
        steps: [
          { name: 'Enter the cost', text: 'What the asset cost when placed in service, including setup costs you are capitalizing.' },
          { name: 'Enter the salvage value', text: 'What you expect the asset to be worth, or sellable for, at the end of its useful life — zero if none.' },
          { name: 'Enter the useful life', text: 'How many years the asset is expected to be in service. Must be at least 2, since the declining-balance rate below is twice the straight-line rate.' },
          { name: 'Enter the year to check', text: 'Decimals are fine, for example 2.5 for two and a half years in. Year 0 is the cost itself, before any depreciation.' },
          { name: 'Compare the two book values', text: 'The headline is the straight-line book value; the declining-balance figure and both methods\' per-year depreciation amounts are shown alongside it, plus a full 0-5-year illustrative schedule further down the page.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Straight-line spreads the same dollar amount over every year. Declining balance applies a fixed rate to whatever book value is left, which shrinks every year, and never goes below salvage value under either method.',
        expression:
          'straightLineAnnualDepreciation = (cost − salvageValue) ÷ usefulLifeYears\nstraightLineBookValue(t) = max(salvageValue, cost − min(t, usefulLifeYears) × straightLineAnnualDepreciation)\ndecliningBalanceRate = 2 ÷ usefulLifeYears\ndecliningBalanceBookValue(t) = max(salvageValue, cost × (1 − decliningBalanceRate)^t)',
        terms: [
          { symbol: 'salvageValue', meaning: 'The floor book value can never be depreciated below, under either method.' },
          { symbol: 'decliningBalanceRate', meaning: 'Twice the straight-line rate (1 ÷ usefulLifeYears) — the 200%, or "double-declining," rate set in 26 CFR § 1.167(b)-2.' }
        ],
        note: 'Estimates only. This is a simplified, two-method comparison for understanding how book value differs by method — it is not MACRS, the US tax system\'s actual recovery-period and percentage-table method for most business property, and does not replace a tax professional\'s depreciation schedule for an actual return.'
      },
      workedExample: {
        intro: 'An asset costs $50,000, has a $5,000 salvage value, and a 5-year useful life. What is its book value after 3 years under each method?',
        rows: [
          { label: 'Straight-line annual depreciation ((50,000 − 5,000) ÷ 5)', value: '$9,000.00' },
          { label: 'Straight-line book value at year 3 (50,000 − 3 × 9,000)', value: '$23,000.00' },
          { label: 'Declining-balance rate (2 ÷ 5)', value: '40%' },
          { label: 'Declining-balance book value at year 3 (50,000 × 0.60³)', value: '$10,800.00' },
          { label: 'Declining-balance depreciation in year 3 alone (18,000.00 − 10,800.00)', value: '$7,200.00' }
        ],
        result: 'After 3 years, the asset is worth $23,000.00 under straight-line, but only $10,800.00 under 200% declining balance.',
        explanation: 'Declining balance front-loads the deduction: it takes $20,000.00 off in year 1 alone (versus $9,000.00 for straight-line), so by year 3 its book value has fallen much further, even though both methods started at the same $50,000.00 and both are still above the $5,000.00 salvage floor.'
      },
      watchOut: [
        { title: 'This is not resale value', body: 'A car or piece of equipment\'s actual resale value depends on condition, market demand and wear, not an accounting schedule. For a vehicle\'s estimated worth, see the car-depreciation-calculator instead — that page models what a buyer would likely pay, not a book-value schedule.' },
        { title: 'This is not MACRS', body: 'Most US business property is actually depreciated under MACRS, which uses IRS-published percentage tables and fixed recovery periods (3, 5, 7, 15, 27.5 years and others), not a direct straight-line or declining-balance formula applied by hand. This page is for understanding how the two underlying methods behave, not for filing a return.' },
        { title: 'Useful life must be at least 2 years here', body: 'At a 1-year useful life, the 200% declining-balance rate would be 200% — a rate above 100% makes "percent of what is left" produce a negative, nonsensical result. Real short-lived assets still use MACRS\'s own tables for this case, not a plain declining-balance formula.' },
        { title: 'Declining balance never quite reaches salvage value on its own', body: 'The exponential formula only approaches the salvage floor, so this calculator applies a hard floor explicitly — real declining-balance schedules typically switch to straight-line partway through so the asset is fully written down by the end of its useful life, a switch this simplified two-method comparison does not model.' },
        { title: 'Salvage value should not exceed cost', body: 'If salvage value is entered higher than cost, both formulas still run, but the result (an asset that is "worth more" scrapped than new) is not a realistic input — double-check the two figures.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Publication 946, How To Depreciate Property', url: 'https://www.irs.gov/publications/p946' },
        { label: '26 CFR § 1.167(b)-2, Declining balance method', url: 'https://www.law.cornell.edu/cfr/text/26/1.167(b)-2' }
      ],
      referenceTable: {
        title: 'Book value by year, both methods (illustrative $100,000 cost, $10,000 salvage, 5-year life)',
        columns: ['Year', 'Straight-line book value', 'Declining-balance (200%) book value'],
        rows: depreciationScheduleRows(),
        decimals: 0,
        note: 'Computed from a fixed $100,000/$10,000/5-year basis, not from your own inputs above — change the inputs in the calculator to see your own schedule.'
      }
    },
    inputs: [
      { id: 'cost', label: 'Cost', type: 'currency', placeholder: '50000', defaultValue: 50000, step: 1000, min: 0 },
      { id: 'salvageValue', label: 'Salvage value', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 500, min: 0 },
      { id: 'usefulLifeYears', label: 'Useful life (years)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 2 },
      { id: 'year', label: 'Year to check', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'Depreciation Calculator – Straight-Line & Declining Balance',
      description: 'Compare an asset\'s straight-line and 200% declining-balance book value, from cost, salvage value and useful life. Free, with a year-by-year schedule.',
      faq: [
        { question: 'How do I calculate straight-line depreciation?', answer: 'Subtract salvage value from cost, then divide by useful life in years. A $50,000 asset with a $5,000 salvage value over 5 years depreciates $9,000.00 a year.' },
        { question: 'How do I calculate declining-balance depreciation?', answer: 'Apply a fixed rate (here, 200% of the straight-line rate, or 2 ÷ useful life) to whatever book value is left each year, never going below salvage value. On the $50,000 example at a 40% rate, year 1\'s book value is 50,000 × 0.60 = $30,000.00.' },
        { question: 'Why are straight-line and declining-balance book values so different partway through?', answer: 'Declining balance front-loads the deduction. In the worked example, it removes $20,000.00 in year 1 alone versus straight-line\'s constant $9,000.00 a year, so by year 3 the declining-balance book value ($10,800.00) is well below straight-line\'s ($23,000.00) — both still end up at the same $5,000.00 salvage floor eventually.' },
        { question: 'Is this the same as car depreciation?', answer: 'No. This models an accounting/tax book-value schedule. The car-depreciation-calculator instead estimates resale value, which depends on condition and market demand, not a formula.' },
        { question: 'Is this the same as MACRS?', answer: 'No. MACRS, which most US business property actually uses for tax depreciation, applies IRS-published percentage tables over fixed recovery periods. This calculator compares the two underlying methods directly, for understanding, not for filing a return.' },
        { question: 'Can book value go below salvage value?', answer: 'Not under either formula here — both are floored at the salvage value you enter, which is the realistic end point for either method.' },
        { question: 'Why does useful life have to be at least 2 years?', answer: 'The declining-balance rate used here is 2 ÷ useful life (the 200% rate). At a 1-year useful life that rate would be 200%, which is mathematically invalid for this formula (it would mean removing more than 100% of what is left). Very short-lived assets use MACRS\'s own tables instead.' }
      ]
    },
    compute(values) {
      const { cost, salvageValue, usefulLifeYears, year } = values;
      const straightLineAnnualDepreciation = (cost - salvageValue) / usefulLifeYears;
      const straightLineBookValue = Math.max(salvageValue, cost - Math.min(year, usefulLifeYears) * straightLineAnnualDepreciation);
      const decliningBalanceRate = 2 / usefulLifeYears;
      const decliningBalanceRatePercent = decliningBalanceRate * 100;
      const currentDecliningBalanceBookValue = decliningBalanceBookValue(cost, salvageValue, decliningBalanceRate, year);
      const decliningBalanceDepreciationThisYear =
        year > 0 ? decliningBalanceBookValue(cost, salvageValue, decliningBalanceRate, Math.max(0, year - 1)) - currentDecliningBalanceBookValue : 0;
      return {
        straightLineBookValue,
        decliningBalanceBookValue: currentDecliningBalanceBookValue,
        straightLineAnnualDepreciation,
        decliningBalanceRatePercent,
        decliningBalanceDepreciationThisYear
      };
    }
  },
  {
    id: 'burn-rate-calculator',
    category: 'business',
    glyph: 'BURN',
    updatedAt: '2026-11-18',
    aliases: ['cash burn rate calculator', 'startup runway calculator', 'cash runway calculator', 'monthly burn rate calculator', 'how long will my cash last calculator'],
    related: ['break-even-calculator', 'payback-period-calculator', 'business-valuation-calculator', 'emergency-fund-calculator'],
    title: 'Burn Rate & Cash Runway Calculator',
    description: 'Find how many months of cash a business has left from its cash balance and monthly burn rate, or solve backward for the burn rate a target runway allows.',
    example: 'A startup with $450,000 in the bank and a $30,000 monthly net burn rate has about 15 months of runway.',
    solver: {
      defaultTarget: 'runwayMonths',
      variables: [
        { id: 'cashBalance', label: 'Cash on hand', symbol: 'C', dimension: 'currency', defaultValue: 450000, defaultUnit: 'currency' },
        { id: 'monthlyBurnRate', label: 'Monthly net burn rate', symbol: 'B', dimension: 'currency', defaultValue: 30000, defaultUnit: 'currency' },
        { id: 'runwayMonths', label: 'Runway', symbol: 'R', dimension: 'term', defaultValue: 15, defaultUnit: 'mo' }
      ],
      // Every variable has a closed form: cashBalance = monthlyBurnRate x runwayMonths (SI months).
      solve: {
        runwayMonths: ({ cashBalance, monthlyBurnRate }) => (monthlyBurnRate > 0 ? cashBalance / monthlyBurnRate : NaN),
        cashBalance: ({ monthlyBurnRate, runwayMonths }) => monthlyBurnRate * runwayMonths,
        monthlyBurnRate: ({ cashBalance, runwayMonths }) => (runwayMonths > 0 ? cashBalance / runwayMonths : NaN)
      },
      outputs: [{ id: 'annualBurnRate', label: 'Annualized burn rate', dimension: 'currency', compute: (si) => si.monthlyBurnRate * 12 }],
      visuals: [
        {
          type: 'compareBars',
          bars: [
            { from: 'cashBalance', label: 'Cash on hand' },
            { from: 'annualBurnRate', label: 'Annualized burn rate' }
          ],
          title: 'Cash on hand vs. a full year of burn at the current rate'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is burn rate, and what is runway?',
        paragraphs: [
          'Burn rate is how fast a business is spending its cash, usually measured per month. "Gross burn" is total monthly operating expenses; "net burn" subtracts whatever revenue is coming in, leaving the actual monthly drop in the cash balance. This calculator works from net burn — the number that actually determines how long the cash lasts — since a business with real revenue burns through cash more slowly than its raw expense total alone would suggest.',
          'Runway is simply cash on hand divided by the net burn rate: how many more months of spending the current cash balance can cover before it runs out, assuming burn stays constant. It is the startup-finance version of the same question the U.S. Small Business Administration\'s own startup-cost guidance raises when it recommends projecting "at least one year" of monthly expenses, and ideally five, before relying on a cash flow forecast.',
          'The relationship runs in either direction: given cash and a burn rate, runway follows directly; given cash and a target runway, the maximum burn rate that stays within it follows too — useful for working out what a spending plan needs to look like to last a specific number of months.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of cash on hand, monthly net burn rate and runway. The third, marked auto, is calculated.',
        steps: [
          { name: 'Enter cash on hand', text: 'The actual, current cash balance available to spend — not revenue expected later, and not an undrawn credit line.' },
          { name: 'Enter the monthly net burn rate', text: 'Total monthly operating expenses minus any monthly revenue. If the business is pre-revenue, this is just total monthly expenses.' },
          { name: 'Read the runway', text: 'How many months the current cash balance covers at that burn rate.' },
          { name: 'Or solve backward', text: 'Leave burn rate alone instead to see the maximum monthly burn a target runway (say, 18 months) allows on the current cash balance.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Runway is cash divided by the rate it is being spent down.',
        expression: 'runwayMonths = cashBalance ÷ monthlyBurnRate\ncashBalance = monthlyBurnRate × runwayMonths\nannualBurnRate = monthlyBurnRate × 12',
        terms: [
          { symbol: 'monthlyBurnRate', meaning: 'Net burn: monthly operating expenses minus monthly revenue, not gross expenses alone.' },
          { symbol: 'runwayMonths', meaning: 'How many months the current cash balance lasts if net burn stays constant.' }
        ],
        note: 'Estimates only, and assumes a constant burn rate. Real burn rate changes as a business hires, cuts costs, or grows revenue — treat this as a snapshot, not a fixed countdown.'
      },
      workedExample: {
        intro: 'A startup has $450,000 in the bank and a $30,000 monthly net burn rate (expenses minus revenue). How much runway is left, and what burn rate would stretch that same cash to 18 months instead?',
        rows: [
          { label: 'Runway (450,000 ÷ 30,000)', value: '15 months' },
          { label: 'Annualized burn rate (30,000 × 12)', value: '$360,000.00' },
          { label: 'Burn rate for an 18-month runway on the same cash (450,000 ÷ 18)', value: '$25,000.00' }
        ],
        result: 'At $30,000 a month, the $450,000 balance lasts 15 months; stretching that to 18 months needs burn to come down to $25,000.00 a month.',
        explanation: 'Extending runway by 3 months on a fixed cash balance means cutting monthly burn by $5,000.00 (from $30,000.00 to $25,000.00) — about a 16.7% cut, since runway and burn rate move inversely on the same cash balance, not by the same percentage the runway itself changed.'
      },
      watchOut: [
        { title: 'This uses net burn, not gross burn', body: 'Gross burn (total expenses only) overstates how fast cash is actually disappearing whenever there is any revenue. Subtract monthly revenue from monthly expenses before entering a burn rate here, unless the business is genuinely pre-revenue.' },
        { title: 'Burn rate is rarely constant', body: 'Hiring, a new contract, a seasonal slowdown, or a cost cut can all change next month\'s burn rate from this month\'s. Runway is a snapshot based on the current rate, not a guaranteed countdown.' },
        { title: 'This does not include planned future fundraising', body: 'Cash on hand should be the actual current balance, not cash a round of funding is expected to add later. Add a future raise to the balance only once it has actually closed.' },
        { title: 'Zero runway does not necessarily mean shutting down', body: 'Running out of runway is a trigger to cut costs or raise more, not automatically the end of the business — but it does mean the current spending plan cannot continue unchanged past that point.' },
        { title: 'A $0 burn rate means infinite runway, not zero', body: 'If monthly net burn is zero or negative (break-even or profitable), there is no cash runway to run out of under this formula — this calculator has no "runway" answer for that case, which is the honest result, not an error.' }
      ],
      references: [
        { label: 'U.S. Small Business Administration, Calculate your startup costs', url: 'https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs' },
        { label: 'U.S. Small Business Administration, Manage your finances', url: 'https://www.sba.gov/business-guide/manage-your-business/manage-your-finances' }
      ]
    },
    inputs: [
      { id: 'cashBalance', label: 'Cash on hand', type: 'currency', placeholder: '450000', defaultValue: 450000, step: 5000, min: 0 },
      { id: 'monthlyBurnRate', label: 'Monthly net burn rate', type: 'currency', placeholder: '30000', defaultValue: 30000, step: 500, min: 0 }
    ],
    seo: {
      title: 'Burn Rate & Cash Runway Calculator',
      description: 'Calculate cash runway in months from cash on hand and monthly net burn rate, or solve backward for the burn rate a target runway allows. Free.',
      faq: [
        { question: 'How do I calculate burn rate?', answer: 'Subtract monthly revenue from monthly operating expenses to get net burn rate. A pre-revenue business\'s net burn rate is just its total monthly expenses.' },
        { question: 'How do I calculate cash runway?', answer: 'Divide cash on hand by the monthly net burn rate. $450,000 in the bank at a $30,000 monthly burn rate gives 15 months of runway.' },
        { question: 'What is the difference between gross burn and net burn?', answer: 'Gross burn is total monthly expenses only. Net burn subtracts monthly revenue from that figure. Runway should be calculated from net burn, since that is the rate the cash balance is actually falling.' },
        { question: 'What burn rate gives an 18-month runway?', answer: 'Divide cash on hand by 18. On a $450,000 balance, that is 450,000 ÷ 18 = $25,000.00 a month, down from the $30,000.00 that gives a 15-month runway.' },
        { question: 'Is burn rate the same every month?', answer: 'Rarely. Hiring, new contracts, seasonal swings and cost cuts all change it. This calculator uses a single constant rate, so treat the runway result as a snapshot at the current rate, not a fixed deadline.' },
        { question: 'What happens if burn rate is zero?', answer: 'If monthly net burn is zero (expenses equal revenue) or negative (profitable), there is no runway to calculate — the cash balance is not shrinking under this formula, so the "months until it runs out" question does not apply.' },
        { question: 'Should planned future funding count as cash on hand?', answer: 'No. Use the actual current cash balance. Add a funding round to the balance only once it has actually closed and the money is in the bank.' }
      ]
    },
    compute(values) {
      const runwayMonths = values.monthlyBurnRate > 0 ? values.cashBalance / values.monthlyBurnRate : NaN;
      const annualBurnRate = values.monthlyBurnRate * 12;
      return { runwayMonths, annualBurnRate };
    }
  },
  {
    id: 'business-valuation-calculator',
    category: 'business',
    glyph: 'VAL',
    updatedAt: '2026-11-18',
    aliases: ['how much is my business worth calculator', 'business valuation estimator', 'revenue multiple valuation calculator', 'sde multiple valuation calculator'],
    related: ['payback-period-calculator', 'burn-rate-calculator', 'profit-margin-calculator', 'cost-of-goods-sold-calculator'],
    title: 'Business Valuation Calculator (Revenue & Earnings Multiple)',
    description: 'A rough estimate of what a business might be worth, using a revenue multiple and an earnings multiple side by side — not a substitute for a professional valuation.',
    example: 'A business with $500,000 in annual revenue (at a 1.0x revenue multiple) and $120,000 in annual earnings (at a 3.0x earnings multiple) gets a $500,000 revenue-based estimate and a $360,000 earnings-based estimate.',
    breakdown: {
      headline: 'earningsBasedValuation',
      headlineLabel: 'Earnings-based estimate',
      outputs: [
        { id: 'earningsBasedValuation', label: 'Earnings-based estimate (earnings × earnings multiple)', format: 'currency' },
        { id: 'revenueBasedValuation', label: 'Revenue-based estimate (revenue × revenue multiple)', format: 'currency' },
        { id: 'averageValuation', label: 'Simple average of the two estimates', format: 'currency' }
      ],
      groups: [
        { title: 'Revenue method', inputs: ['annualRevenue', 'revenueMultiple'] },
        { title: 'Earnings method', inputs: ['annualEarnings', 'earningsMultiple'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'revenueBasedValuation', label: 'Revenue-based' },
          { from: 'earningsBasedValuation', label: 'Earnings-based' }
        ],
        title: 'The two estimates side by side'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is a revenue or earnings multiple, and how rough is "rough"?',
        paragraphs: [
          'A multiple-based valuation estimates what a business is worth by multiplying a single financial figure — usually annual revenue or annual earnings — by a multiplier appropriate for that business\'s size, industry and growth. This calculator applies a user-entered multiple to each figure and shows both resulting estimates side by side, since the two methods can disagree by a lot depending on how profitable the business is relative to its revenue.',
          'This is deliberately one of several real approaches, not the only one. The U.S. Small Business Administration\'s own guide for buyers of an existing business or franchise lists multiple valuation methods side by side — a "capitalized earning approach," an "excess earning method," a "cash flow method," and asset-based methods — and recommends buyers "hire an attorney and an accountant" to work through them rather than rely on any single number.',
          'The multiple itself is the hardest part, and this calculator cannot supply one: it varies enormously by industry, growth rate, customer concentration, and how much of the business depends on the current owner personally. A multiple pulled from a different industry, or from a public-company comparison that does not reflect a small private business\'s size and risk, can be off by a factor of two or more. Get an industry-appropriate multiple from a business broker, an accountant, or recent comparable sales before trusting either estimate here.'
        ]
      },
      howTo: {
        intro: 'Enter annual revenue and a revenue multiple for one estimate, and annual earnings (such as seller\'s discretionary earnings or net profit) and an earnings multiple for the other.',
        steps: [
          { name: 'Enter annual revenue', text: 'Total sales for a typical recent year.' },
          { name: 'Enter a revenue multiple', text: 'A multiplier appropriate for the industry — this varies enormously and is not supplied here; get one from a broker, accountant, or comparable recent sales.' },
          { name: 'Enter annual earnings', text: 'Net profit, or seller\'s discretionary earnings for a small, owner-operated business — add back the owner\'s own salary and personal expenses run through the business if using SDE.' },
          { name: 'Enter an earnings multiple', text: 'Also industry- and size-specific — small private businesses typically use lower multiples than public-company comparisons.' },
          { name: 'Compare both estimates', text: 'The two figures will usually differ. Treat the gap, and both numbers, as a rough range — not a precise price.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each method is one figure times one multiple — the simplicity is also the limitation.',
        expression: 'revenueBasedValuation = annualRevenue × revenueMultiple\nearningsBasedValuation = annualEarnings × earningsMultiple\naverageValuation = (revenueBasedValuation + earningsBasedValuation) ÷ 2',
        terms: [
          { symbol: 'annualEarnings', meaning: 'Net profit, or seller\'s discretionary earnings (SDE) for a small owner-operated business.' },
          { symbol: 'revenueMultiple, earningsMultiple', meaning: 'User-supplied multipliers. This calculator does not provide a "typical" multiple — get one for the specific industry and deal.' }
        ],
        note: 'This is a rough estimate, not a professional valuation. The SBA\'s own guidance for buying an existing business lists several real valuation approaches and recommends hiring an attorney and an accountant — a real transaction should use one of those, with a broker- or accountant-sourced multiple, not this page alone.'
      },
      workedExample: {
        intro: 'A small business has $500,000 in annual revenue and $120,000 in annual earnings. A broker suggests a 1.0x revenue multiple and a 3.0x earnings multiple are typical for this specific industry and size. What are the two estimates?',
        rows: [
          { label: 'Revenue-based estimate (500,000 × 1.0)', value: '$500,000.00' },
          { label: 'Earnings-based estimate (120,000 × 3.0)', value: '$360,000.00' },
          { label: 'Simple average ((500,000 + 360,000) ÷ 2)', value: '$430,000.00' }
        ],
        result: 'The two methods give $500,000.00 and $360,000.00 — a $140,000.00 gap on the same business.',
        explanation: 'The gap exists because this business keeps a relatively modest 24% of revenue as earnings (120,000 ÷ 500,000). A business with thinner margins would show an even wider gap between its revenue- and earnings-based estimates; a more profitable one, a narrower one. Neither figure is automatically the "right" one — which method a buyer or broker weights more heavily depends on the industry and the deal.'
      },
      watchOut: [
        { title: 'This is a rough estimate, not a professional valuation', body: 'A real business valuation accounts for growth trends, customer concentration, owner dependency, assets and liabilities, and market conditions at the time of sale — far more than one figure times one multiple. Use a business appraiser, broker, or accountant for an actual transaction.' },
        { title: 'The multiple is doing almost all the work, and it is not supplied here', body: 'The same $500,000-revenue business could reasonably use a 0.5x or a 2x revenue multiple depending on its industry, growth and risk — this calculator applies whatever multiple is entered without checking whether it fits the business.' },
        { title: 'Revenue and earnings multiples answer different questions', body: 'A high-revenue, low-margin business (a grocery store) and a low-revenue, high-margin business (a software company) can have wildly different revenue-to-earnings ratios, so their revenue- and earnings-based estimates diverge by very different amounts even at "similar" multiples.' },
        { title: '"Earnings" needs a consistent definition', body: 'Net profit, EBITDA, and seller\'s discretionary earnings (SDE, which adds back owner salary and personal expenses) are all different numbers for the same business. Make sure the earnings multiple being used actually matches the earnings definition entered.' },
        { title: 'The simple average is not a third, better method', body: 'Averaging the two estimates does not resolve which one is closer to reality — it is shown only as a single reference point between two different models, not a statistically meaningful blend.' }
      ],
      references: [
        { label: 'U.S. Small Business Administration, Buy an existing business or franchise', url: 'https://www.sba.gov/business-guide/plan-your-business/buy-existing-business-or-franchise' }
      ]
    },
    inputs: [
      { id: 'annualRevenue', label: 'Annual revenue', type: 'currency', placeholder: '500000', defaultValue: 500000, step: 5000, min: 0 },
      { id: 'revenueMultiple', label: 'Revenue multiple', type: 'number', placeholder: '1.0', defaultValue: 1, step: 0.1, min: 0 },
      { id: 'annualEarnings', label: 'Annual earnings (net profit or SDE)', type: 'currency', placeholder: '120000', defaultValue: 120000, step: 1000, min: 0 },
      { id: 'earningsMultiple', label: 'Earnings multiple', type: 'number', placeholder: '3.0', defaultValue: 3, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Business Valuation Calculator – Revenue & Earnings Multiple',
      description: 'A rough business valuation estimate from a revenue multiple and an earnings multiple, side by side. Free. Not a substitute for a professional valuation.',
      faq: [
        { question: 'How do I estimate what a business is worth?', answer: 'One common rough method multiplies annual revenue, or annual earnings, by a multiple appropriate for the industry. $500,000 of revenue at a 1.0x multiple is $500,000.00; $120,000 of earnings at a 3.0x multiple is $360,000.00.' },
        { question: 'What multiple should I use?', answer: 'This calculator does not supply one — multiples vary enormously by industry, size, growth and risk. Get an industry-appropriate multiple from a business broker, accountant, or recent comparable sales.' },
        { question: 'Why do the revenue-based and earnings-based estimates disagree?', answer: 'They measure different things. In the worked example, a business keeping 24% of revenue as earnings shows a $140,000.00 gap between the two estimates — a thinner-margin business would show an even bigger gap.' },
        { question: 'What is SDE?', answer: 'Seller\'s discretionary earnings: net profit with the owner\'s own salary and personal expenses run through the business added back. It is the earnings figure commonly used for valuing small, owner-operated businesses.' },
        { question: 'Is this a real appraisal?', answer: 'No. It is a rough estimate using two simple multiple-based methods. A real valuation accounts for far more — growth, customer concentration, assets, liabilities and market conditions. Use a business appraiser, broker or accountant for an actual sale or purchase.' },
        { question: 'What valuation methods does the SBA mention?', answer: 'The SBA\'s guide to buying an existing business lists a capitalized earning approach, an excess earning method, a cash flow method, and tangible- and intangible-asset methods — and recommends hiring an attorney and an accountant to work through them.' }
      ]
    },
    compute(values) {
      const revenueBasedValuation = values.annualRevenue * values.revenueMultiple;
      const earningsBasedValuation = values.annualEarnings * values.earningsMultiple;
      const averageValuation = (revenueBasedValuation + earningsBasedValuation) / 2;
      return { earningsBasedValuation, revenueBasedValuation, averageValuation };
    }
  },
  {
    id: 'payback-period-calculator',
    category: 'business',
    glyph: 'PBP',
    updatedAt: '2026-11-18',
    aliases: ['payback period formula calculator', 'investment payback calculator', 'simple payback period calculator', 'capital budgeting payback calculator'],
    related: ['irr-calculator', 'npv-calculator', 'break-even-calculator', 'business-valuation-calculator'],
    title: 'Payback Period Calculator',
    description: 'Find how long it takes an upfront investment to be recovered from annual cash inflow — a simple, non-discounted capital-budgeting metric. Solve for investment, cash inflow, or payback period.',
    example: 'A $60,000 investment generating $15,000 a year in cash inflow has a 4-year payback period.',
    solver: {
      defaultTarget: 'paybackPeriod',
      variables: [
        { id: 'initialInvestment', label: 'Initial investment', symbol: 'I', dimension: 'currency', defaultValue: 60000, defaultUnit: 'currency' },
        { id: 'annualCashInflow', label: 'Annual cash inflow', symbol: 'A', dimension: 'currency', defaultValue: 15000, defaultUnit: 'currency' },
        { id: 'paybackPeriod', label: 'Payback period', symbol: 'P', dimension: 'term', defaultValue: 4, defaultUnit: 'yr' }
      ],
      // Every variable has a closed form. paybackPeriod's SI base is months (lib/units.ts 'term'
      // dimension), so the formula multiplies by 12 to convert the years-based ratio into months.
      solve: {
        paybackPeriod: ({ initialInvestment, annualCashInflow }) => (annualCashInflow > 0 ? (initialInvestment / annualCashInflow) * 12 : NaN),
        initialInvestment: ({ annualCashInflow, paybackPeriod }) => annualCashInflow * (paybackPeriod / 12),
        annualCashInflow: ({ initialInvestment, paybackPeriod }) => (paybackPeriod > 0 ? initialInvestment / (paybackPeriod / 12) : NaN)
      },
      outputs: [
        {
          id: 'simpleReturnPercent',
          label: 'Simple annual return (cash inflow ÷ investment)',
          dimension: 'percent',
          compute: (si) => (si.initialInvestment > 0 ? (si.annualCashInflow / si.initialInvestment) * 100 : NaN)
        }
      ],
      visuals: [
        {
          type: 'compareBars',
          bars: [
            { from: 'initialInvestment', label: 'Initial investment' },
            { from: 'annualCashInflow', label: 'Annual cash inflow' }
          ],
          title: 'Investment vs. one year of cash inflow'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is the payback period method?',
        paragraphs: [
          'OpenStax\'s Principles of Finance describes the payback period as the calculation that "focuses on how long it will take for a company to make enough free cash flow from the investment to recover the initial cost of the investment." For a steady annual cash inflow, that reduces to one division: the initial investment divided by the annual cash inflow.',
          'This is deliberately the simplest capital-budgeting metric on this site, and the same source is direct about its limits: payback "ignores the time value of money," there is "not a clearly defined acceptance or rejection criterion" the way there is for other methods, it is "shortsighted in that it favors projects that generate cash flows quickly while possibly rejecting projects that create much larger cash flows after" the payback point, and it "makes no risk adjustment for uncertain cash flows."',
          'That is exactly why net present value (npv-calculator) and internal rate of return (irr-calculator) exist alongside it here: both discount future cash flows to account for the time value of money, which payback period does not do at all. Payback answers a narrower, faster question — "how long until I get my money back?" — not "is this a good investment at my required rate of return?"'
        ]
      },
      howTo: {
        intro: 'Fill in any two of initial investment, annual cash inflow and payback period. The third, marked auto, is calculated.',
        steps: [
          { name: 'Enter the initial investment', text: 'The upfront cost being recovered — equipment, a project\'s startup cost, or a purchase price.' },
          { name: 'Enter the annual cash inflow', text: 'The steady yearly cash the investment is expected to generate. This model assumes it stays constant.' },
          { name: 'Read the payback period', text: 'How many years (or months, switch the unit) it takes for cumulative cash inflow to equal the initial investment.' },
          { name: 'Or solve backward', text: 'Leave annual cash inflow alone instead to see what inflow a target payback period requires on a known investment.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'For a constant annual cash inflow, payback period is simply investment divided by that inflow.',
        expression: 'paybackPeriod = initialInvestment ÷ annualCashInflow\nsimpleReturnPercent = annualCashInflow ÷ initialInvestment × 100',
        terms: [
          { symbol: 'initialInvestment', meaning: 'The upfront cost being recovered.' },
          { symbol: 'annualCashInflow', meaning: 'Cash generated per year, held constant for this simple calculation — unlike IRR or NPV, no discount rate is applied.' }
        ],
        note: 'Estimates only, and ignores the time value of money entirely, by design — see npv-calculator or irr-calculator for a discounted view of the same kind of cash flows. This also assumes a level annual inflow; an uneven cash-flow schedule needs a year-by-year running total instead of one division.'
      },
      workedExample: {
        intro: 'A $60,000 investment is expected to generate $15,000 a year in cash inflow. What is the payback period, and what inflow would be needed to pay it back in 3 years instead?',
        rows: [
          { label: 'Payback period (60,000 ÷ 15,000)', value: '4 years' },
          { label: 'Simple annual return (15,000 ÷ 60,000 × 100)', value: '25%' },
          { label: 'Cash inflow needed for a 3-year payback (60,000 ÷ 3)', value: '$20,000.00' }
        ],
        result: 'At $15,000 a year, payback takes 4 years; reaching a 3-year payback on the same $60,000 investment needs $20,000.00 a year instead.',
        explanation: 'Shortening the payback period by 1 year (from 4 to 3) requires $5,000.00 more cash inflow a year (from $15,000.00 to $20,000.00) — a 33.3% increase in annual inflow to achieve a 25% reduction in payback time, because payback period is the reciprocal of the inflow-to-investment ratio, not a linear function of it.'
      },
      watchOut: [
        { title: 'Ignores the time value of money completely', body: 'A dollar received in year 1 and a dollar received in year 4 count exactly the same toward payback. npv-calculator and irr-calculator both discount later cash flows, which payback period never does.' },
        { title: 'Ignores everything after the payback point', body: 'Two investments with the same 4-year payback can have very different total value if one keeps generating cash for 10 more years and the other stops right after payback — this metric cannot tell them apart.' },
        { title: 'No universal "good" payback period', body: 'There is no standard acceptance threshold the way there might be for an IRR compared against a required rate of return. Different companies and industries set their own maximum acceptable payback period.' },
        { title: 'Assumes a level, certain annual cash inflow', body: 'This formula divides by one constant figure. A project with uneven year-to-year cash flows needs a running cumulative total instead — the single-division shortcut here does not apply once inflows vary by year.' },
        { title: 'Not the same calculation as the solar-specific version', body: 'solar-payback-period-calculator models a solar system\'s net cost (after incentives) against estimated annual savings specifically. This page is the general-purpose version for any investment and annual cash inflow.' }
      ],
      references: [
        { label: 'OpenStax, Principles of Finance, §16.1 Payback Period Method', url: 'https://openstax.org/books/principles-finance/pages/16-1-payback-period-method' },
        { label: 'OpenStax, Principles of Finance, §16.2 Net Present Value (NPV) Method', url: 'https://openstax.org/books/principles-finance/pages/16-2-net-present-value-npv-method' }
      ]
    },
    inputs: [
      { id: 'initialInvestment', label: 'Initial investment', type: 'currency', placeholder: '60000', defaultValue: 60000, step: 1000, min: 0 },
      { id: 'annualCashInflow', label: 'Annual cash inflow', type: 'currency', placeholder: '15000', defaultValue: 15000, step: 500, min: 0 }
    ],
    seo: {
      title: 'Payback Period Calculator – Investment Recovery Time',
      description: 'Calculate the payback period from an initial investment and annual cash inflow, or solve backward. Free, with the simple annual return alongside it.',
      faq: [
        { question: 'How do I calculate payback period?', answer: 'Divide the initial investment by the annual cash inflow. A $60,000 investment generating $15,000 a year pays back in 4 years.' },
        { question: 'How is payback period different from IRR or NPV?', answer: 'Payback period ignores the time value of money entirely — it just counts years until the cash received equals the investment. IRR and NPV both discount future cash flows. See irr-calculator and npv-calculator for the discounted versions.' },
        { question: 'What is a good payback period?', answer: 'There is no universal standard. OpenStax notes the method has "not a clearly defined acceptance or rejection criterion" — different companies and industries set their own maximum acceptable payback period.' },
        { question: 'What cash inflow is needed for a specific payback period?', answer: 'Divide the investment by the target number of years. A $60,000 investment targeting a 3-year payback needs 60,000 ÷ 3 = $20,000.00 a year.' },
        { question: 'Does this work for uneven annual cash flows?', answer: 'Not directly. This calculator divides by one constant annual figure. An investment with cash flows that change year to year needs a running cumulative total instead of a single division.' },
        { question: 'Is this the same as the solar payback period calculator?', answer: 'No. solar-payback-period-calculator is specific to a solar system\'s net cost after incentives against estimated annual electricity savings. This page is the general-purpose version for any investment and cash inflow.' },
        { question: 'What is the "simple annual return" shown here?', answer: 'Annual cash inflow divided by the initial investment, as a percentage — the reciprocal of the payback period in years, expressed as a rate. It is not a discounted return like IRR.' }
      ]
    },
    compute(values) {
      const paybackPeriod = values.annualCashInflow > 0 ? values.initialInvestment / values.annualCashInflow : NaN;
      const simpleReturnPercent = values.initialInvestment > 0 ? (values.annualCashInflow / values.initialInvestment) * 100 : NaN;
      return { paybackPeriod, simpleReturnPercent };
    }
  },
  {
    id: 'fte-calculator',
    category: 'business',
    glyph: 'FTE',
    updatedAt: '2026-11-18',
    aliases: ['full time equivalent calculator', 'fte headcount calculator', 'part time to fte calculator', 'aca fte calculator', 'applicable large employer calculator'],
    related: ['burn-rate-calculator', 'break-even-calculator', 'work-hours-calculator', 'payback-period-calculator'],
    title: 'Full-Time Equivalent (FTE) Calculator',
    description: 'Find total full-time-equivalent headcount from a full-time employee count and part-time employees\' hours, using the IRS\'s own ACA formula for converting part-time hours into FTEs.',
    example: '8 full-time employees plus 5 part-time employees averaging 80 hours a month each comes to about 11.33 FTEs.',
    breakdown: {
      headline: 'totalFTE',
      headlineLabel: 'Total FTE',
      outputs: [
        { id: 'totalFTE', label: 'Total FTE', format: 'number' },
        { id: 'partTimeFTE', label: 'Part-time employees, as FTE', format: 'number' }
      ],
      groups: [{ title: 'Workforce', inputs: ['fullTimeEmployeeCount', 'partTimeEmployeeCount', 'avgPartTimeHoursPerMonth'] }],
      derive: (v) => ({ cappedHoursPerPartTimeEmployee: Math.min(v.avgPartTimeHoursPerMonth, 120) }),
      visual: {
        type: 'donut',
        segments: [
          { from: 'fullTimeEmployeeCount', label: 'Full-time employees' },
          { from: 'partTimeFTE', label: 'Part-time, as FTE' }
        ],
        center: 'totalFTE',
        centerSub: 'total FTE'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is a full-time equivalent (FTE)?',
        paragraphs: [
          'A full-time equivalent (FTE) count converts a mixed workforce of full-time and part-time employees into a single number of "equivalent" full-time positions, so a business can measure its real total staffing level without part-time hours disappearing from the count or being treated as a full head each.',
          'The IRS uses exactly this kind of calculation to decide whether a business is an "applicable large employer" under the Affordable Care Act\'s employer shared responsibility provision. Its own guidance gives a two-step formula for the part-time side: "combine the number of hours of service of all non-full-time employees for the month but do not include more than 120 hours of service per employee," then "divide the total by 120." A full-time employee, in that same guidance, is "an employee who has on average at least 30 hours of service per week during the calendar month, or at least 130 hours of service during the calendar month."',
          'This calculator applies that same 120-hour-per-employee, divide-by-120 logic to an average part-time hours figure rather than to each individual employee\'s own hours, since entering every employee separately is impractical for a quick estimate — see the watch-out below for exactly where that shortcut can diverge from the IRS\'s own employee-by-employee method.'
        ]
      },
      howTo: {
        intro: 'Enter the full-time employee count, the part-time employee count, and the average monthly hours each part-time employee works.',
        steps: [
          { name: 'Enter full-time employee count', text: 'Employees averaging at least 30 hours a week (130 hours a month) each count as 1 FTE on their own.' },
          { name: 'Enter part-time employee count', text: 'Everyone working fewer hours than the full-time threshold.' },
          { name: 'Enter average part-time hours per month', text: 'The typical monthly hours worked per part-time employee. Hours above 120 for any one employee do not add further FTE, per the IRS\'s own cap.' },
          { name: 'Read total FTE', text: 'Full-time headcount plus the part-time group\'s hours converted to FTE.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each part-time employee\'s monthly hours are capped at 120 before being converted to FTE, matching the IRS\'s own ACA formula.',
        expression:
          'cappedHoursPerPartTimeEmployee = min(avgPartTimeHoursPerMonth, 120)\npartTimeFTE = (partTimeEmployeeCount × cappedHoursPerPartTimeEmployee) ÷ 120\ntotalFTE = fullTimeEmployeeCount + partTimeFTE',
        terms: [
          { symbol: 'fullTimeEmployeeCount', meaning: 'Employees averaging at least 30 hours a week (130 hours a month), per the IRS\'s own threshold.' },
          { symbol: 'partTimeFTE', meaning: 'Part-time employees\' combined, capped monthly hours expressed as a number of full-time-equivalent positions.' }
        ],
        note: 'Applies the IRS\'s 120-hour cap to an average hours figure, not to each employee individually — see the watch-out below. This is for a quick estimate, not a substitute for the IRS\'s own employee-by-employee ACA determination.'
      },
      workedExample: {
        intro: 'A business has 8 full-time employees and 5 part-time employees, each averaging 80 hours a month. What is its total FTE?',
        rows: [
          { label: 'Capped hours per part-time employee (min(80, 120))', value: '80' },
          { label: 'Part-time FTE ((5 × 80) ÷ 120)', value: '3.33' },
          { label: 'Total FTE (8 + 3.33)', value: '11.33' }
        ],
        result: 'Total FTE is about 11.33 — 8 full-time positions plus the part-time group\'s 3.33 FTE-equivalent.',
        explanation: 'Since 80 hours a month is already below the 120-hour cap, no individual employee\'s hours are being reduced here — the full 400 combined part-time hours (5 × 80) convert directly to 400 ÷ 120 ≈ 3.33 FTE. The cap only matters once an individual part-timer averages more than 120 hours a month.'
      },
      watchOut: [
        { title: 'This averages hours, the IRS caps them per employee', body: 'The real ACA formula caps each individual non-full-time employee\'s hours at 120 before summing. If part-time hours vary a lot — say some part-timers average 150 hours and others average 40 — capping the average here understates total FTE compared to capping each employee\'s own hours, because this shortcut never gets a chance to apply the 120 cap to the ones who actually exceed it.' },
        { title: 'The full-time threshold itself is not part of this formula', body: 'Whether a specific employee counts as "full-time" (30 hours a week or 130 hours a month) versus "part-time" is a separate determination this calculator assumes has already been made correctly for the headcounts entered.' },
        { title: 'This is an estimate for planning, not a filing', body: 'The IRS\'s actual applicable-large-employer determination averages FTE count over every month of the prior calendar year, employee by employee. This calculator gives a single month\'s snapshot from aggregate figures.' },
        { title: 'FTE is a staffing-level measure, not a headcount for every purpose', body: 'Legal thresholds for other laws (FMLA\'s 50-employee count, for example) may use a different definition of "employee" than the ACA\'s FTE calculation. Confirm which definition applies before using this figure for a compliance decision.' },
        { title: 'Average hours above 120 mean the part-time group is under-counted here', body: 'If average part-time hours per month is entered above 120, this calculator still caps it at 120 per the IRS rule — so raising that input past 120 stops increasing partTimeFTE, which is the correct, intended behavior, not a bug.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Determining if an Employer is an Applicable Large Employer', url: 'https://www.irs.gov/affordable-care-act/employers/determining-if-an-employer-is-an-applicable-large-employer' },
        { label: 'Internal Revenue Service, Identifying Full-time Employees', url: 'https://www.irs.gov/affordable-care-act/employers/identifying-full-time-employees' }
      ]
    },
    inputs: [
      { id: 'fullTimeEmployeeCount', label: 'Full-time employees', type: 'number', placeholder: '8', defaultValue: 8, step: 1, min: 0 },
      { id: 'partTimeEmployeeCount', label: 'Part-time employees', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'avgPartTimeHoursPerMonth', label: 'Average part-time hours per month', type: 'number', placeholder: '80', defaultValue: 80, step: 5, min: 0 }
    ],
    seo: {
      title: 'Full-Time Equivalent (FTE) Calculator',
      description: 'Calculate total FTE headcount from full-time employee count and part-time hours, using the IRS\'s own 120-hour ACA formula. Free.',
      faq: [
        { question: 'How do I calculate FTE?', answer: 'Add full-time employee count to part-time employees\' combined hours (each capped at 120 a month) divided by 120. 8 full-time plus 5 part-time averaging 80 hours a month each is 8 + (5 × 80 ÷ 120) ≈ 11.33 FTE.' },
        { question: 'What is the IRS formula for FTE?', answer: 'Combine non-full-time employees\' monthly hours, capping each employee at 120 hours, then divide by 120. This calculator applies that cap to an average hours figure rather than per employee — see the watch-out section for when that differs from the IRS\'s own method.' },
        { question: 'What counts as a full-time employee for FTE purposes?', answer: 'The IRS defines full-time, for ACA purposes, as averaging at least 30 hours of service a week, or at least 130 hours a month.' },
        { question: 'Why is total FTE a fraction, not a whole number?', answer: 'Because part-time hours convert to a fractional FTE. 5 part-time employees averaging 80 hours a month each equal 3.33 FTE, not 5 or 3 — they are "equivalent" to 3.33 full-time positions, not an actual headcount.' },
        { question: 'What happens if a part-time employee works more than 120 hours a month?', answer: 'The IRS caps each employee\'s contribution at 120 hours regardless of how many more they actually work. Entering an average above 120 here is capped the same way, which is intentional.' },
        { question: 'Is FTE the same as headcount?', answer: 'No. Headcount counts every person as 1, regardless of hours. FTE instead weights part-time staff by their hours relative to a full-time schedule, giving a more accurate measure of total staffing capacity.' }
      ]
    },
    compute(values) {
      const cappedHours = Math.min(values.avgPartTimeHoursPerMonth, 120);
      const partTimeFTE = (values.partTimeEmployeeCount * cappedHours) / 120;
      const totalFTE = values.fullTimeEmployeeCount + partTimeFTE;
      return { totalFTE, partTimeFTE };
    }
  },
  {
    id: 'gst-calculator',
    category: 'business',
    glyph: 'GST',
    updatedAt: '2026-11-19',
    aliases: ['gst calculator', 'goods and services tax calculator', 'gst inclusive price calculator', 'add gst to price calculator'],
    related: ['vat-calculator', 'sales-tax-calculator', 'profit-margin-calculator', 'markup-calculator'],
    title: 'GST Calculator',
    description: 'Add goods and services tax (GST) to a price, pull it back out of a GST-inclusive total, or find the rate that was charged. Fill in any two of net price, rate and GST-inclusive price.',
    example: "Canada's federal GST is 5%: a $100 net price carries $5.00 of GST, for a $105.00 GST-inclusive price.",
    solver: {
      defaultTarget: 'grossPrice',
      variables: [
        { id: 'grossPrice', label: 'GST-inclusive price', symbol: 'G', dimension: 'currency', defaultValue: 105, defaultUnit: 'currency' },
        { id: 'netPrice', label: 'Net price (before GST)', symbol: 'N', dimension: 'currency', defaultValue: 100, defaultUnit: 'currency' },
        { id: 'taxRate', label: 'GST rate', symbol: 'r', dimension: 'percent', defaultValue: 5, defaultUnit: '%' }
      ],
      solve: {
        grossPrice: ({ netPrice, taxRate }) => netPrice * (1 + taxRate / 100),
        netPrice: ({ grossPrice, taxRate }) => (1 + taxRate / 100 > 0 ? grossPrice / (1 + taxRate / 100) : NaN),
        taxRate: ({ grossPrice, netPrice }) => (netPrice > 0 ? (grossPrice / netPrice - 1) * 100 : NaN)
      },
      outputs: [{ id: 'gstAmount', label: 'GST amount', dimension: 'currency', compute: (si) => si.grossPrice - si.netPrice }],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'netPrice', label: 'Net price' },
            { from: 'gstAmount', label: 'GST' }
          ],
          center: 'grossPrice',
          centerSub: 'GST-inclusive price'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-19',
      concept: {
        title: 'What is GST?',
        paragraphs: [
          'Goods and services tax (GST) is a consumption tax charged on most sales of goods and services, named "GST" in Canada, Australia, India, New Zealand and Singapore, among others. Canada\'s federal GST rate is 5% — the Canada Revenue Agency\'s own GST/HST rate page confirms it, and also shows how several provinces blend it into a single Harmonized Sales Tax (HST): Ontario charges 13% HST and, as of April 1, 2025, Nova Scotia charges 14% HST, each replacing the separate federal GST and provincial sales tax with one combined rate.',
          'GST is the same kind of tax as a value-added tax (VAT), just under a different regional name — both are collected in stages across the supply chain rather than once at the final sale. The European Commission\'s explanation of the mechanism applies to both: the tax is charged "as a percentage of the sales price" and collected "fractionally at every stage of production and distribution," with registered businesses able to reclaim the GST or VAT they themselves paid on business inputs, so only the final consumer actually bears the cost. That is a real, structural difference from a US-style sales tax, which this site\'s sales-tax-calculator covers separately, charged once at the point of final retail sale with no stage-by-stage reclaiming.',
          'Not every GST system uses one flat rate. Several countries that use the GST name, including India, apply different rates to different categories of goods and services rather than a single nationwide percentage — this calculator works the same way regardless of which rate applies; just enter the one that does.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of net price, GST rate and GST-inclusive price. The third, marked auto, is calculated.',
        steps: [
          { name: 'Enter the net price', text: 'The price before GST is added — what a business invoice before tax, or a GST-exclusive price tag, shows.' },
          { name: 'Enter the GST rate', text: 'The percentage that applies in your country and category — 5% is Canada\'s federal rate, used as the default here, but your own rate may differ.' },
          { name: 'Read the GST-inclusive price', text: 'The net price plus GST, and the GST amount itself, both appear at once.' },
          { name: 'Or pull GST out of a receipt', text: 'Leave net price alone, enter the GST-inclusive total and the rate, to find what the price was before GST.' },
          { name: 'Or find the rate that was charged', text: 'Leave GST rate alone, enter both prices, to work out what rate produced them.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'GST is added as a percentage of the net price. Removing it from a GST-inclusive price means dividing, not subtracting the percentage.',
        expression:
          'gstAmount = netPrice × (taxRate ÷ 100)\ngrossPrice = netPrice × (1 + taxRate ÷ 100)\nnetPrice = grossPrice ÷ (1 + taxRate ÷ 100)\ntaxRate = (grossPrice ÷ netPrice − 1) × 100',
        terms: [
          { symbol: 'netPrice', meaning: 'The price before GST — the figure a registered business actually keeps.' },
          { symbol: 'grossPrice', meaning: 'The GST-inclusive price — what a consumer actually pays.' }
        ],
        note: 'Estimates only. This calculator does arithmetic on the rate you enter — it does not look up a country\'s or category\'s actual GST rate, registration thresholds, or filing rules.'
      },
      workedExample: {
        intro: 'A $100 net price, at Canada\'s 5% federal GST rate. What is the GST, and what would the same net price carry under an 18% rate used in some other GST systems\' higher slabs?',
        rows: [
          { label: 'GST amount (100 × 0.05)', value: '$5.00' },
          { label: 'GST-inclusive price (100 × 1.05)', value: '$105.00' },
          { label: 'Reversed: net price from a $105.00 GST-inclusive total (105 ÷ 1.05)', value: '$100.00' },
          { label: 'Same $100 net price at an 18% rate instead (100 × 0.18)', value: '$18.00 GST, $118.00 total' }
        ],
        result: 'At 5%, $100 carries $5.00 of GST for a $105.00 total; at 18%, the same $100 carries $18.00 of GST for a $118.00 total.',
        explanation: 'The rate alone changes the GST amount by more than 3.6 times (18 ÷ 5) between the two examples, even though the net price never changed — which is why confirming the actual rate for your country and category matters more than the arithmetic itself.'
      },
      watchOut: [
        { title: 'GST and VAT are the same mechanism, different names', body: 'Both are collected in stages across the supply chain, with registered businesses reclaiming what they paid on their own inputs. See the vat-calculator for the EU/UK-style version — the math on both pages is identical once you know the rate.' },
        { title: 'This is not US sales tax', body: 'US-style sales tax (see the sales-tax-calculator) is collected once, at the final retail sale, with no stage-by-stage reclaiming by businesses. GST and VAT work differently even though the consumer-facing arithmetic — add a percentage, or divide it back out — looks the same.' },
        { title: 'GST can be blended into a combined rate', body: 'Some Canadian provinces replace the separate 5% federal GST and their own provincial sales tax with one Harmonized Sales Tax (HST) — 13% in Ontario, 14% in Nova Scotia as of April 2025. Enter the combined rate that actually applies, not the federal GST rate alone, if your province uses HST.' },
        { title: 'Rates vary by category, not just by country', body: 'Several GST systems, including India\'s, apply more than one rate depending on what is being sold. Confirm the rate for the specific good or service, not just the country.' },
        { title: 'Removing GST is a division, not a subtraction', body: 'To find the net price from a GST-inclusive total, divide by (1 + rate ÷ 100). Subtracting the rate directly from the total always understates the true net price.' }
      ],
      references: [
        { label: 'Canada Revenue Agency, Charge and collect the tax – Which rate to charge', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate.html' },
        { label: 'European Commission, VAT (value-added tax) – how it is collected across the supply chain', url: 'https://taxation-customs.ec.europa.eu/taxation/vat_en' }
      ]
    },
    inputs: [
      { id: 'netPrice', label: 'Net price (before GST)', type: 'currency', placeholder: '100', defaultValue: 100, step: 1, min: 0 },
      { id: 'taxRate', label: 'GST rate', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'GST Calculator – Add or Remove Goods and Services Tax',
      description: 'Add GST to a net price, remove it from a GST-inclusive total, or find the rate from a receipt. Works with any country\'s GST or HST rate.',
      faq: [
        { question: 'How do I calculate GST?', answer: 'Multiply the net price by the GST rate as a decimal. A $100 price at 5% GST carries 100 × 0.05 = $5.00 of GST, for a $105.00 GST-inclusive price.' },
        { question: 'How do I remove GST from a GST-inclusive price?', answer: 'Divide the GST-inclusive price by (1 + rate ÷ 100). At 5%, a $105.00 total was 105 ÷ 1.05 = $100.00 before GST, with $5.00 of GST.' },
        { question: 'What is the difference between GST and VAT?', answer: 'They are the same kind of tax, collected fractionally at each stage of production and distribution with input tax credits for registered businesses, just named differently by region — GST in Canada, Australia, India and similar countries, VAT in the EU, UK and most of the rest of the world.' },
        { question: 'Is GST the same as US sales tax?', answer: 'No. US sales tax is charged once, at the final retail sale, with no reclaiming by businesses along the way. GST and VAT are collected at every stage, with businesses reclaiming what they paid on their own purchases — see the sales-tax-calculator for the US-style version.' },
        { question: 'What is Canada\'s GST rate?', answer: 'The federal GST rate is 5%. Some provinces blend it with their own sales tax into a single Harmonized Sales Tax (HST) instead — 13% in Ontario, 14% in Nova Scotia as of April 2025 — so the rate you actually pay depends on the province.' },
        { question: 'Is GST always one flat rate?', answer: 'No. Several GST systems, including India\'s, charge different rates for different categories of goods and services rather than one nationwide percentage. Enter whichever rate applies to your purchase.' },
        { question: 'Can I use this for a GST refund or input tax credit?', answer: 'This calculator does the net/GST/gross arithmetic only. It does not handle registration, filing, or which purchases a business can reclaim GST on — check your tax authority\'s own guidance for that.' }
      ]
    },
    compute(values) {
      const gstAmount = values.netPrice * (values.taxRate / 100);
      const grossPrice = values.netPrice + gstAmount;
      return { grossPrice, gstAmount };
    }
  },
  {
    id: 'vat-calculator',
    category: 'business',
    glyph: 'VAT',
    updatedAt: '2026-11-19',
    aliases: ['vat calculator', 'value added tax calculator', 'vat inclusive price calculator', 'add vat to price calculator'],
    related: ['gst-calculator', 'sales-tax-calculator', 'profit-margin-calculator', 'markup-calculator'],
    title: 'VAT Calculator',
    description: 'Add value-added tax (VAT) to a price, pull it back out of a VAT-inclusive total, or find the rate that was charged. Fill in any two of net price, rate and VAT-inclusive price.',
    example: "The UK's standard VAT rate is 20%: a £100 net price carries £20.00 of VAT, for a £120.00 VAT-inclusive price.",
    solver: {
      defaultTarget: 'grossPrice',
      variables: [
        { id: 'grossPrice', label: 'VAT-inclusive price', symbol: 'G', dimension: 'currency', defaultValue: 120, defaultUnit: 'currency' },
        { id: 'netPrice', label: 'Net price (before VAT)', symbol: 'N', dimension: 'currency', defaultValue: 100, defaultUnit: 'currency' },
        { id: 'taxRate', label: 'VAT rate', symbol: 'r', dimension: 'percent', defaultValue: 20, defaultUnit: '%' }
      ],
      solve: {
        grossPrice: ({ netPrice, taxRate }) => netPrice * (1 + taxRate / 100),
        netPrice: ({ grossPrice, taxRate }) => (1 + taxRate / 100 > 0 ? grossPrice / (1 + taxRate / 100) : NaN),
        taxRate: ({ grossPrice, netPrice }) => (netPrice > 0 ? (grossPrice / netPrice - 1) * 100 : NaN)
      },
      outputs: [{ id: 'vatAmount', label: 'VAT amount', dimension: 'currency', compute: (si) => si.grossPrice - si.netPrice }],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'netPrice', label: 'Net price' },
            { from: 'vatAmount', label: 'VAT' }
          ],
          center: 'grossPrice',
          centerSub: 'VAT-inclusive price'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-19',
      concept: {
        title: 'What is VAT?',
        paragraphs: [
          'Value-added tax (VAT) is a consumption tax used across the EU, the UK and most of the rest of the world. The UK\'s own gov.uk guidance sets the standard rate at 20%, with a 5% reduced rate on items such as home energy and children\'s car seats, and a 0% zero rate on most food and children\'s clothing — one country, three different rates depending on what is being sold.',
          'The European Commission describes how VAT is actually collected: it is a tax "on the value added to nearly all goods and services," charged "as a percentage of the sales price" and collected "fractionally at every stage of production and distribution," so that "the tax borne by the final consumer is the same regardless of the length of the supply chain." Registered businesses reclaim the VAT they paid on their own purchases, so VAT only lands, in full, on the final consumer — a structurally different design from a single-point-of-sale sales tax.',
          'GST (goods and services tax), used by that name in Canada, Australia, India and elsewhere, is the same mechanism under a different regional name — see the gst-calculator for that version. A US-style sales tax, covered separately by this site\'s sales-tax-calculator, is mechanically different: it is charged once, at the final retail sale, with no stage-by-stage reclaiming by businesses along the way.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of net price, VAT rate and VAT-inclusive price. The third, marked auto, is calculated.',
        steps: [
          { name: 'Enter the net price', text: 'The price before VAT is added — an invoice subtotal, or a VAT-exclusive trade price.' },
          { name: 'Enter the VAT rate', text: 'The UK\'s standard rate, 20%, is the default here, but use the reduced (5%), zero (0%), or your own country\'s rate as it applies.' },
          { name: 'Read the VAT-inclusive price', text: 'The net price plus VAT, and the VAT amount itself, both appear at once.' },
          { name: 'Or pull VAT out of a shelf price', text: 'Leave net price alone, enter the VAT-inclusive total and the rate, to find the price before VAT — most consumer shelf prices already include VAT.' },
          { name: 'Or find the rate that was charged', text: 'Leave VAT rate alone, enter both prices, to work out what rate produced them.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'VAT is added as a percentage of the net price. Removing it from a VAT-inclusive price means dividing, not subtracting the percentage.',
        expression:
          'vatAmount = netPrice × (taxRate ÷ 100)\ngrossPrice = netPrice × (1 + taxRate ÷ 100)\nnetPrice = grossPrice ÷ (1 + taxRate ÷ 100)\ntaxRate = (grossPrice ÷ netPrice − 1) × 100',
        terms: [
          { symbol: 'netPrice', meaning: 'The price before VAT — the figure a VAT-registered business actually keeps.' },
          { symbol: 'grossPrice', meaning: 'The VAT-inclusive price — what a consumer actually pays.' }
        ],
        note: 'Estimates only. This calculator does arithmetic on the rate you enter — it does not look up which goods or services qualify for a reduced or zero rate in any particular country.'
      },
      workedExample: {
        intro: 'A £100 net price, at the UK\'s 20% standard VAT rate. What is the VAT, and what would the same net price carry at the UK\'s 5% reduced rate instead?',
        rows: [
          { label: 'VAT amount (100 × 0.20)', value: '£20.00' },
          { label: 'VAT-inclusive price (100 × 1.20)', value: '£120.00' },
          { label: 'Reversed: net price from a £120.00 VAT-inclusive total (120 ÷ 1.20)', value: '£100.00' },
          { label: 'Same £100 net price at the 5% reduced rate instead (100 × 0.05)', value: '£5.00 VAT, £105.00 total' }
        ],
        result: 'At the 20% standard rate, £100 carries £20.00 of VAT for a £120.00 total; at the 5% reduced rate, the same £100 carries only £5.00 of VAT for a £105.00 total.',
        explanation: 'Which rate applies changes the VAT amount by 4 times (20 ÷ 5) between the two examples on the exact same £100 net price, which is why UK VAT guidance spends so much attention on which goods and services qualify for the reduced or zero rate.'
      },
      watchOut: [
        { title: 'VAT and GST are the same mechanism, different names', body: 'Both are collected in stages across the supply chain, with registered businesses reclaiming what they paid on their own inputs. See the gst-calculator for the Canada/Australia/India-style version — the math on both pages is identical once you know the rate.' },
        { title: 'This is not US sales tax', body: 'US-style sales tax (see the sales-tax-calculator) is collected once, at the final retail sale, with no stage-by-stage reclaiming by businesses. VAT and GST work differently even though the consumer-facing arithmetic — add a percentage, or divide it back out — looks the same.' },
        { title: 'The rate depends on what is being sold, not just the country', body: 'The UK alone has three VAT rates — 20% standard, 5% reduced, 0% zero — depending on the category of goods or services. Confirm the rate for the specific item, not just the country.' },
        { title: 'Consumer prices usually already include VAT', body: 'Shelf prices in VAT countries are typically VAT-inclusive, so reversing (entering the shelf price as the VAT-inclusive total) is usually the direction a consumer actually needs, not adding VAT to a price that already includes it.' },
        { title: 'Removing VAT is a division, not a subtraction', body: 'To find the net price from a VAT-inclusive total, divide by (1 + rate ÷ 100). Subtracting the rate directly from the total always understates the true net price.' }
      ],
      references: [
        { label: 'GOV.UK, VAT rates on different goods and services', url: 'https://www.gov.uk/vat-rates' },
        { label: 'European Commission, VAT (value-added tax) – how it is collected across the supply chain', url: 'https://taxation-customs.ec.europa.eu/taxation/vat_en' }
      ]
    },
    inputs: [
      { id: 'netPrice', label: 'Net price (before VAT)', type: 'currency', placeholder: '100', defaultValue: 100, step: 1, min: 0 },
      { id: 'taxRate', label: 'VAT rate', type: 'percent', placeholder: '20', defaultValue: 20, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'VAT Calculator – Add or Remove Value-Added Tax',
      description: 'Add VAT to a net price, remove it from a VAT-inclusive total, or find the rate from a receipt. Works with the UK, EU, or any country\'s VAT rate.',
      faq: [
        { question: 'How do I calculate VAT?', answer: 'Multiply the net price by the VAT rate as a decimal. A £100 price at 20% VAT carries 100 × 0.20 = £20.00 of VAT, for a £120.00 VAT-inclusive price.' },
        { question: 'How do I remove VAT from a VAT-inclusive price?', answer: 'Divide the VAT-inclusive price by (1 + rate ÷ 100). At 20%, a £120.00 total was 120 ÷ 1.20 = £100.00 before VAT, with £20.00 of VAT.' },
        { question: 'What is the UK VAT rate?', answer: 'The standard rate is 20%. A 5% reduced rate applies to items such as home energy and children\'s car seats, and a 0% zero rate applies to most food and children\'s clothing, per GOV.UK.' },
        { question: 'What is the difference between VAT and GST?', answer: 'They are the same kind of tax, collected fractionally at each stage of production and distribution with input tax credits for registered businesses, just named differently by region — VAT in the EU, UK and most of the rest of the world, GST in Canada, Australia, India and similar countries.' },
        { question: 'Is VAT the same as US sales tax?', answer: 'No. US sales tax is charged once, at the final retail sale, with no reclaiming by businesses along the way. VAT and GST are collected at every stage, with businesses reclaiming what they paid on their own purchases — see the sales-tax-calculator for the US-style version.' },
        { question: 'Why do shelf prices already include VAT?', answer: 'Consumer-facing prices in VAT countries are typically required to be VAT-inclusive, unlike US sales tax, which is usually added at checkout. Use the reverse direction here to see the pre-VAT price behind a shelf price.' },
        { question: 'Does every country use the same VAT rate?', answer: 'No. Rates vary by country and, within many countries, by category of goods or services. Enter the specific rate that applies to your purchase and country.' }
      ]
    },
    compute(values) {
      const vatAmount = values.netPrice * (values.taxRate / 100);
      const grossPrice = values.netPrice + vatAmount;
      return { grossPrice, vatAmount };
    }
  },
  {
    id: 'self-employment-tax-estimator',
    category: 'business',
    glyph: 'SE%',
    updatedAt: '2026-11-19',
    aliases: ['self employment tax calculator', 'schedule se calculator', '1099 tax calculator', 'self employed tax estimator'],
    related: ['1099-contractor-rate-calculator', 'freelancer-rate-calculator', 'income-tax-calculator', 'paycheck-calculator'],
    title: 'Self-Employment Tax Estimator',
    description: "Estimate US self-employment tax (Social Security and Medicare) from your net self-employment earnings, following the IRS's own Schedule SE calculation, including the Social Security wage base cap.",
    example: '$100,000 of net self-employment earnings owes about $14,129.55 in self-employment tax for 2026 — 14.13% of net earnings, not the full 15.3%.',
    breakdown: {
      headline: 'totalSETax',
      headlineLabel: 'Self-employment tax owed',
      outputs: [
        { id: 'totalSETax', label: 'Self-employment tax owed', format: 'currency' },
        { id: 'socialSecurityTax', label: 'Social Security portion (12.4%)', format: 'currency' },
        { id: 'medicareTax', label: 'Medicare portion (2.9%)', format: 'currency' },
        { id: 'netEarningsSubjectToSE', label: 'Net earnings subject to SE tax (92.35% of net earnings)', format: 'currency' },
        { id: 'deductibleHalf', label: 'Deductible half (reduces income tax, not SE tax)', format: 'currency' },
        { id: 'effectiveRatePercent', label: 'Effective rate on net earnings', format: 'percent' }
      ],
      groups: [{ title: 'Net self-employment earnings', inputs: ['netSelfEmploymentEarnings'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'socialSecurityTax', label: 'Social Security' },
          { from: 'medicareTax', label: 'Medicare' }
        ],
        center: 'totalSETax',
        centerSub: 'self-employment tax'
      }
    },
    content: {
      lastReviewed: '2026-11-19',
      concept: {
        title: 'What is self-employment tax?',
        paragraphs: [
          'Self-employment tax is how self-employed people pay into Social Security and Medicare — the two programs a W-2 employee funds through FICA withholding, split with their employer. The IRS states the rate plainly: "the self-employment tax rate is 15.3%," made up of "12.4% for social security" and "2.9% for Medicare," filed on Schedule SE (Form 1040) whenever net earnings from self-employment are $400 or more.',
          'The tax is not simply 15.3% of net profit, though. The IRS has you first multiply net earnings by 92.35% — "the amount subject to self-employment tax is 92.35% of your net earnings from self-employment" — before applying the 15.3% rate. That discount roughly mirrors the fact that a W-2 employee\'s FICA is only withheld from gross wages, while the employer\'s matching half is never itself treated as taxable income to the employee; the 92.35% factor brings a self-employed filer\'s math closer to that same shape, so the real effective rate on net earnings works out a little below 15.3% (14.13% in the worked example below).',
          'The Social Security part of the tax only applies up to a yearly cap, the Social Security wage base — $184,500 for 2026, per the IRS\'s own self-employment tax page. Above that amount, Social Security tax stops, but "all of your wages and tips are subject to the 2.9% Medicare part of the SE tax on all your net earnings," with no cap at all — and single filers above $200,000 (other filing statuses have different thresholds) owe an extra 0.9% Additional Medicare Tax on top, which this estimator does not calculate.',
          'Half of the self-employment tax is deductible when figuring adjusted gross income for ordinary income tax — the IRS calls it "the employer-equivalent portion of your SE tax." That deduction lowers income tax, not the self-employment tax itself, which is still owed in full.'
        ]
      },
      howTo: {
        intro: 'Enter your net self-employment earnings — net profit after business expenses, the figure from Schedule C, not gross revenue.',
        steps: [
          { name: 'Enter net self-employment earnings', text: 'Gross self-employment income minus ordinary business expenses — Schedule C\'s bottom line, not top-line revenue.' },
          { name: 'Check the taxable amount', text: 'Only 92.35% of net earnings is actually subject to self-employment tax, shown as its own figure.' },
          { name: 'See the Social Security portion', text: '12.4% of the taxable amount, capped at the Social Security wage base ($184,500 for 2026) — earnings above that are Medicare-only.' },
          { name: 'See the Medicare portion', text: '2.9% of the taxable amount, with no cap at all.' },
          { name: 'Read the total and the deductible half', text: 'The total is what is owed; half of it is also deductible against ordinary income tax on your return, shown separately.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Net earnings are reduced to 92.35% before the 15.3% combined rate applies, and the Social Security piece alone is capped at the wage base.',
        expression:
          'netEarningsSubjectToSE = netEarnings × 0.9235\nsocialSecurityTax = min(netEarningsSubjectToSE, wageBase) × 0.124\nmedicareTax = netEarningsSubjectToSE × 0.029\ntotalSETax = socialSecurityTax + medicareTax\ndeductibleHalf = totalSETax ÷ 2',
        terms: [
          { symbol: 'netEarningsSubjectToSE', meaning: '92.35% of net self-employment earnings — the amount the 15.3% rate actually applies to.' },
          { symbol: 'wageBase', meaning: 'The yearly Social Security taxable maximum: $184,500 for 2026, per the IRS.' }
        ],
        note: 'Estimates only, for the current Social Security wage base. This is self-employment tax alone — it does not include federal or state income tax, the 0.9% Additional Medicare Tax above the filing-status threshold, or any wages from a separate job that would already use up part of the Social Security wage base.'
      },
      workedExample: {
        intro: '$100,000 of net self-employment earnings for the year. What is owed, and how does a much higher amount, $250,000, interact with the Social Security wage base cap?',
        rows: [
          { label: 'Net earnings subject to SE tax (100,000 × 0.9235)', value: '$92,350.00' },
          { label: 'Social Security tax (92,350 × 0.124, under the $184,500 cap)', value: '$11,451.40' },
          { label: 'Medicare tax (92,350 × 0.029)', value: '$2,678.15' },
          { label: 'Total self-employment tax (11,451.40 + 2,678.15)', value: '$14,129.55' },
          { label: 'At $250,000 instead: net earnings subject to SE tax (250,000 × 0.9235)', value: '$230,875.00' },
          { label: 'At $250,000: Social Security tax, capped (184,500 × 0.124)', value: '$22,878.00' },
          { label: 'At $250,000: Medicare tax, uncapped (230,875 × 0.029)', value: '$6,695.38' },
          { label: 'At $250,000: total self-employment tax (22,878.00 + 6,695.38)', value: '$29,573.38' }
        ],
        result: '$100,000 of net earnings owes $14,129.55 (14.13% effective rate); $250,000 owes $29,573.38 (11.83% effective rate).',
        explanation: 'The effective rate drops from 14.13% to 11.83% as income rises past the wage base, because every dollar of net earnings above $184,500 ÷ 0.9235 ≈ $199,784 stops owing the 12.4% Social Security piece and only owes the uncapped 2.9% Medicare piece — the opposite of a progressive income-tax bracket, where the marginal rate rises with income.'
      },
      watchOut: [
        { title: 'This is not a filed return', body: 'This estimates federal self-employment tax only. It does not include federal or state income tax, deductions, or credits — see income-tax-calculator for an income tax estimate on top of this.' },
        { title: 'The Additional Medicare Tax is not included', body: 'Single filers with net earnings (combined with any wages) above $200,000 owe an extra 0.9% Medicare tax on the amount over that threshold — other filing statuses have different thresholds. This estimator does not add that surtax.' },
        { title: 'A separate W-2 job changes the wage base math', body: 'The Social Security wage base is shared across all your earnings for the year. If you also have W-2 wages, those use up part of the cap first, so less of your self-employment earnings may be subject to the 12.4% Social Security portion than this estimator (which assumes self-employment is your only income) shows.' },
        { title: 'Net earnings means net, not gross', body: 'Enter net profit after business expenses (Schedule C\'s bottom line), not gross self-employment revenue — the whole calculation is built on the net figure.' },
        { title: 'Below $400, there is no self-employment tax', body: 'The IRS requires Schedule SE only when net earnings from self-employment are $400 or more; below that, no self-employment tax is owed at all.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Self-Employment Tax (Social Security and Medicare Taxes)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes' },
        { label: 'Internal Revenue Service, Topic no. 554, Self-employment tax', url: 'https://www.irs.gov/taxtopics/tc554' }
      ]
    },
    inputs: [{ id: 'netSelfEmploymentEarnings', label: 'Net self-employment earnings', type: 'currency', placeholder: '100000', defaultValue: 100000, step: 1000, min: 0 }],
    seo: {
      title: 'Self-Employment Tax Estimator – Schedule SE',
      description: "Estimate self-employment tax (Social Security + Medicare) from net self-employment earnings, following the IRS's Schedule SE method and the Social Security wage base cap.",
      faq: [
        { question: 'How do I calculate self-employment tax?', answer: 'Multiply net self-employment earnings by 92.35%, then apply 15.3% (12.4% Social Security, capped at the wage base, plus 2.9% Medicare, uncapped). $100,000 of net earnings owes $14,129.55.' },
        { question: 'Why isn\'t self-employment tax exactly 15.3% of net profit?', answer: 'Because the 15.3% rate applies to 92.35% of net earnings, not the full amount — roughly mirroring how a W-2 employee\'s employer-paid half of FICA is never itself taxed as the employee\'s income. The effective rate works out to about 14.13% on net earnings below the Social Security wage base.' },
        { question: 'What is the Social Security wage base for 2026?', answer: '$184,500, per the IRS. Net earnings subject to self-employment tax above that amount only owe the 2.9% Medicare portion, not the 12.4% Social Security portion.' },
        { question: 'Is any of this deductible?', answer: 'Yes — half of the self-employment tax (the "employer-equivalent portion") is deductible when calculating adjusted gross income for ordinary income tax. It reduces income tax, not the self-employment tax itself, which is still owed in full.' },
        { question: 'Does this include the Additional Medicare Tax?', answer: 'No. Single filers with net earnings above $200,000 owe an extra 0.9% Medicare tax on the excess, with different thresholds for other filing statuses — this estimator covers the base 15.3% self-employment tax only.' },
        { question: 'What if I also have a W-2 job?', answer: 'The Social Security wage base is shared across all your earnings for the year, so W-2 wages use up part of the cap first. This estimator assumes self-employment is your only income; with a W-2 job too, less of your self-employment earnings may fall under the 12.4% Social Security portion.' },
        { question: 'Do I owe self-employment tax on every amount of self-employment income?', answer: 'No. The IRS requires Schedule SE only when net earnings from self-employment reach $400 or more in the year.' }
      ]
    },
    compute(values) {
      const WAGE_BASE_2026 = 184500;
      const netEarnings = values.netSelfEmploymentEarnings;
      if (netEarnings < 400) {
        return { totalSETax: 0, socialSecurityTax: 0, medicareTax: 0, netEarningsSubjectToSE: 0, deductibleHalf: 0, effectiveRatePercent: 0 };
      }
      const netEarningsSubjectToSE = netEarnings * 0.9235;
      const socialSecurityTax = Math.min(netEarningsSubjectToSE, WAGE_BASE_2026) * 0.124;
      const medicareTax = netEarningsSubjectToSE * 0.029;
      const totalSETax = socialSecurityTax + medicareTax;
      const deductibleHalf = totalSETax / 2;
      const effectiveRatePercent = (totalSETax / netEarnings) * 100;
      return { totalSETax, socialSecurityTax, medicareTax, netEarningsSubjectToSE, deductibleHalf, effectiveRatePercent };
    }
  },
  {
    id: '1099-contractor-rate-calculator',
    category: 'business',
    glyph: '1099',
    updatedAt: '2026-11-19',
    aliases: ['1099 vs w2 calculator', '1099 contractor rate calculator', 'w2 to 1099 rate calculator', 'convert salary to 1099 rate calculator'],
    related: ['self-employment-tax-estimator', 'freelancer-rate-calculator', 'income-tax-calculator', 'salary-raise-calculator'],
    title: '1099 Contractor Rate Calculator',
    description: 'Convert a specific W-2 salary into the equivalent 1099 contractor rate, by adding back the employer\'s payroll-tax match, employer-paid benefits, and paid time off the W-2 job covers but a 1099 contract does not.',
    example: 'An $80,000 W-2 salary with $8,000 of employer benefits and 15 paid days off converts to about $53.66/hr as a 1099 contractor billing 230 days a year, 8 hours a day.',
    solver: {
      defaultTarget: 'hourlyRate1099',
      variables: [
        { id: 'hourlyRate1099', label: 'Equivalent 1099 hourly rate', symbol: 'R', dimension: 'currency', defaultValue: 53.66, defaultUnit: 'currency' },
        { id: 'w2AnnualSalary', label: 'W-2 annual salary', symbol: 'S', dimension: 'currency', defaultValue: 80000, defaultUnit: 'currency' },
        { id: 'employerBenefitsValue', label: 'Employer-paid health insurance + retirement match', symbol: 'B', dimension: 'currency', defaultValue: 8000, defaultUnit: 'currency', fixed: true },
        { id: 'w2PtoDaysPerYear', label: 'Paid days off the W-2 job includes', symbol: 'D', dimension: 'count', defaultValue: 15, defaultUnit: 'count', fixed: true },
        { id: 'billableDaysPerYear', label: 'Days per year you can actually bill as a contractor', symbol: 'd', dimension: 'count', defaultValue: 230, defaultUnit: 'count', fixed: true },
        { id: 'hoursPerDay', label: 'Billable hours per day', symbol: 'h', dimension: 'count', defaultValue: 8, defaultUnit: 'count', fixed: true }
      ],
      // Every variable has a closed form. FICA_EMPLOYER_MATCH_RATE (7.65%) is the employer-equivalent
      // half of the 15.3% self-employment tax rate (see self-employment-tax-estimator); STANDARD_WORK_DAYS_PER_YEAR
      // (260 = 52 x 5) converts a count of paid days off into a fraction of the W-2 salary.
      solve: {
        hourlyRate1099: ({ w2AnnualSalary, employerBenefitsValue, w2PtoDaysPerYear, billableDaysPerYear, hoursPerDay }) => {
          const employerFicaMatch = w2AnnualSalary * 0.0765;
          const ptoValue = w2AnnualSalary * (w2PtoDaysPerYear / 260);
          const totalPackageValue = w2AnnualSalary + employerFicaMatch + employerBenefitsValue + ptoValue;
          return billableDaysPerYear * hoursPerDay > 0 ? totalPackageValue / (billableDaysPerYear * hoursPerDay) : NaN;
        },
        w2AnnualSalary: ({ hourlyRate1099, employerBenefitsValue, w2PtoDaysPerYear, billableDaysPerYear, hoursPerDay }) => {
          const totalPackageValue = hourlyRate1099 * billableDaysPerYear * hoursPerDay;
          const denominator = 1 + 0.0765 + w2PtoDaysPerYear / 260;
          return denominator > 0 ? (totalPackageValue - employerBenefitsValue) / denominator : NaN;
        }
      },
      outputs: [
        {
          id: 'employerFicaMatch',
          label: 'Employer payroll-tax match replaced',
          dimension: 'currency',
          compute: (si) => si.w2AnnualSalary * 0.0765
        },
        {
          id: 'ptoValue',
          label: 'Paid time off replaced',
          dimension: 'currency',
          compute: (si) => si.w2AnnualSalary * (si.w2PtoDaysPerYear / 260)
        },
        {
          id: 'totalPackageValue',
          label: 'Total annual package value to replace',
          dimension: 'currency',
          compute: (si) => si.w2AnnualSalary + si.w2AnnualSalary * 0.0765 + si.employerBenefitsValue + si.w2AnnualSalary * (si.w2PtoDaysPerYear / 260)
        }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'w2AnnualSalary', label: 'W-2 salary' },
            { from: 'employerFicaMatch', label: 'Payroll-tax match' },
            { from: 'employerBenefitsValue', label: 'Benefits' },
            { from: 'ptoValue', label: 'Paid time off' }
          ],
          center: 'totalPackageValue',
          centerSub: 'total package value'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-19',
      concept: {
        title: 'Why a 1099 rate needs to be higher than the matching W-2 hourly wage',
        paragraphs: [
          'A W-2 salary looks simple, but an employer is quietly paying for more than the number on the offer letter: half of the payroll tax that funds Social Security and Medicare, often a share of health insurance and a retirement match, and salary that keeps being paid during holidays and vacation. A 1099 contractor has to self-fund all of that, so a 1099 rate that merely divides a comparable salary by the hours in a work year falls short — this calculator converts a specific W-2 salary into the 1099 rate that actually replaces its full value.',
          'This is a different question from the freelancer-rate-calculator elsewhere on this site, which starts from a target take-home income and a tax rate you choose yourself, not tied to any particular job. This calculator instead starts from a specific W-2 salary (a real offer, or a job you are comparing a contract against) and converts it directly into the hourly rate a 1099 arrangement would need to match it, item by item — the self-employment-tax-estimator covers the actual tax bill on 1099 income in detail; this page is about setting the rate itself, not the return.',
          'Three gaps get added back on top of the salary. The IRS describes self-employment tax as 15.3% split into a 12.4% Social Security and 2.9% Medicare share; an employer\'s FICA match is the "employer-equivalent" half of that, 7.65%, which a W-2 employee never sees deducted from pay but a 1099 contractor effectively pays alone. Employer-paid health insurance and retirement contributions are added as a figure you enter directly, since packages vary enormously by employer. And the days a W-2 salary keeps paying for — holidays, vacation — are converted into their dollar value and added too, since a 1099 contractor is typically paid only for days actually worked.'
        ]
      },
      howTo: {
        intro: 'Fill in either the W-2 salary or the equivalent 1099 rate; the other, marked auto, is calculated. The benefits value, paid days off, billable days and hours per day are always inputs.',
        steps: [
          { name: 'Enter the W-2 salary', text: 'The annual salary of the job you are comparing a 1099 contract against.' },
          { name: 'Enter the employer benefits value', text: 'What the employer pays annually toward health insurance and any retirement match — not your own share, the employer\'s.' },
          { name: 'Enter the W-2 job\'s paid days off', text: 'Holidays and vacation days the salary keeps paying for, typically 10–20 in the US.' },
          { name: 'Enter your billable days and hours per day', text: 'How many days a year, and hours a day, you can realistically bill as a contractor — fewer than a W-2 employee\'s paid schedule, since unpaid admin time and gaps between contracts are real.' },
          { name: 'Read the equivalent 1099 rate', text: 'The hourly rate that replaces the full value of the W-2 package — salary, payroll-tax match, benefits, and paid time off — across your actual billable hours.' },
          { name: 'Check the breakdown', text: 'The donut shows how much of the total package value is the base salary versus the three added-back pieces.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The W-2 package\'s full value — salary, the employer\'s payroll-tax match, benefits, and paid time off — is divided by the hours a contractor can actually bill.',
        expression:
          'employerFicaMatch = w2Salary × 0.0765\nptoValue = w2Salary × (ptoDays ÷ 260)\ntotalPackageValue = w2Salary + employerFicaMatch + benefitsValue + ptoValue\nhourlyRate1099 = totalPackageValue ÷ (billableDays × hoursPerDay)',
        terms: [
          { symbol: '0.0765', meaning: 'The employer-equivalent half of the 15.3% self-employment tax rate — see the self-employment-tax-estimator.' },
          { symbol: '260', meaning: 'A standard 52-week, 5-day work year, used to convert paid days off into a fraction of annual salary.' },
          { symbol: 'totalPackageValue', meaning: 'The full annual value a 1099 rate needs to replace, before dividing by billable hours.' }
        ],
        note: 'Estimates only. This converts one specific W-2 package into an equivalent rate — it does not model self-employment tax itself (see the self-employment-tax-estimator for that), business expenses, or the value of job security, which a W-2 offer also provides and a 1099 contract usually does not.'
      },
      workedExample: {
        intro: 'An $80,000 W-2 salary comes with $8,000 a year of employer-paid health insurance and retirement match, and 15 paid days off. As a contractor, you expect to bill 230 days a year at 8 hours a day. What 1099 rate matches it?',
        rows: [
          { label: 'Employer payroll-tax match (80,000 × 0.0765)', value: '$6,120.00' },
          { label: 'Paid time off value (80,000 × 15 ÷ 260)', value: '$4,615.38' },
          { label: 'Total package value (80,000 + 6,120 + 8,000 + 4,615.38)', value: '$98,735.38' },
          { label: 'Billable hours per year (230 × 8)', value: '1,840' },
          { label: 'Equivalent 1099 rate (98,735.38 ÷ 1,840)', value: '$53.66/hr' }
        ],
        result: 'An $80,000 W-2 salary with this benefits package converts to about $53.66/hr as a 1099 contractor.',
        explanation: 'A naive conversion — $80,000 ÷ 2,080 standard hours — gives $38.46/hr, about 39.5% lower than the $53.66/hr this calculator finds. The gap is entirely the three added-back pieces (payroll-tax match, benefits, and paid time off) plus billing fewer hours (1,840) than the 2,080 a full-time W-2 schedule assumes.'
      },
      watchOut: [
        { title: 'This is not the same question as the freelancer-rate-calculator', body: 'That calculator starts from a target take-home income and a tax rate you pick yourself, with no reference to any specific job. This one starts from an actual W-2 salary and converts it directly, item by item, into a matching 1099 rate.' },
        { title: 'Self-employment tax itself is not modeled here', body: 'Adding back the employer\'s 7.65% payroll-tax match replaces what the employer would have paid — it does not calculate the self-employment tax a 1099 contractor actually owes on that income. See the self-employment-tax-estimator for the real tax bill.' },
        { title: 'Billable days are not the same as paid days', body: 'A W-2 employee is paid for every working day, including slow ones. A 1099 contractor typically bills only for days with actual work — sales, admin and gaps between contracts are unpaid, which is why billable days per year is usually well under a W-2 schedule\'s working days.' },
        { title: 'Benefits packages vary enormously', body: 'Employer-paid health insurance alone can range from a few thousand dollars to well over $10,000 a year depending on the plan and the employer\'s share. Use your own package\'s actual employer-paid amount, not a generic estimate.' },
        { title: 'Job security has no dollar figure here', body: 'A W-2 job also typically offers unemployment insurance eligibility and more protection against sudden termination — real value a 1099 contract usually lacks, but one this calculator does not attempt to price.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Self-Employment Tax (Social Security and Medicare Taxes)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes' },
        { label: 'US Bureau of Labor Statistics, Employer Costs for Employee Compensation news release', url: 'https://www.bls.gov/news.release/ecec.nr0.htm' }
      ]
    },
    inputs: [
      { id: 'w2AnnualSalary', label: 'W-2 annual salary', type: 'currency', placeholder: '80000', defaultValue: 80000, step: 1000, min: 0 },
      { id: 'employerBenefitsValue', label: 'Employer-paid health insurance + retirement match', type: 'currency', placeholder: '8000', defaultValue: 8000, step: 500, min: 0 },
      { id: 'w2PtoDaysPerYear', label: 'Paid days off the W-2 job includes', type: 'number', placeholder: '15', defaultValue: 15, step: 1, min: 0 },
      { id: 'billableDaysPerYear', label: 'Days per year you can actually bill', type: 'number', placeholder: '230', defaultValue: 230, step: 5, min: 1 },
      { id: 'hoursPerDay', label: 'Billable hours per day', type: 'number', placeholder: '8', defaultValue: 8, step: 0.5, min: 1 }
    ],
    seo: {
      title: '1099 Contractor Rate Calculator – Convert a W-2 Salary',
      description: 'Convert a W-2 salary into an equivalent 1099 hourly rate, adding back the employer payroll-tax match, benefits, and paid time off a contract does not include.',
      faq: [
        { question: 'How do I convert a W-2 salary to a 1099 rate?', answer: 'Add the employer\'s payroll-tax match (7.65% of salary), employer-paid benefits, and the dollar value of paid days off to the salary, then divide by the hours you can actually bill as a contractor. An $80,000 salary with $8,000 of benefits and 15 paid days off, billing 230 days at 8 hours, converts to about $53.66/hr.' },
        { question: 'Why is the 1099 rate so much higher than salary ÷ 2,080 hours?', answer: 'Because that naive calculation ($80,000 ÷ 2,080 = $38.46/hr in the example) ignores the employer\'s payroll-tax match, employer-paid benefits, paid time off, and the fact that a contractor typically bills fewer hours than a full-time W-2 schedule. Together those push the real equivalent rate about 39.5% higher, to $53.66/hr.' },
        { question: 'What is the employer payroll-tax match?', answer: 'Self-employment tax is 15.3% (12.4% Social Security + 2.9% Medicare), per the IRS. An employer pays half of the equivalent FICA tax for a W-2 employee — 7.65% — which a 1099 contractor has to cover without an employer\'s match.' },
        { question: 'Does this calculate the self-employment tax I would owe as a 1099 contractor?', answer: 'No. It only adds back the dollar value of what an employer would have paid toward payroll tax. For the actual self-employment tax bill on 1099 income, use the self-employment-tax-estimator.' },
        { question: 'How is this different from the freelancer rate calculator?', answer: 'That calculator works from a target take-home income and a tax rate you choose, independent of any specific job. This one starts from an actual W-2 salary and benefits package and converts it directly into a matching 1099 rate.' },
        { question: 'Why are billable days lower than a W-2 employee\'s working days?', answer: 'A W-2 employee is paid for every working day. A 1099 contractor is typically paid only for days with billable work, so sales, admin time and gaps between contracts reduce the realistic number of billable days well below a standard work year.' },
        { question: 'Can I work backward from a 1099 rate to find the equivalent W-2 salary?', answer: 'Yes. Leave the W-2 salary field alone, and a given 1099 rate (with the same benefits, PTO, and billable-hours assumptions) converts back into the salary it is equivalent to.' }
      ]
    },
    compute(values) {
      const employerFicaMatch = values.w2AnnualSalary * 0.0765;
      const ptoValue = values.w2AnnualSalary * (values.w2PtoDaysPerYear / 260);
      const totalPackageValue = values.w2AnnualSalary + employerFicaMatch + values.employerBenefitsValue + ptoValue;
      const billableHours = values.billableDaysPerYear * values.hoursPerDay;
      const hourlyRate1099 = billableHours > 0 ? totalPackageValue / billableHours : NaN;
      return { hourlyRate1099, employerFicaMatch, ptoValue, totalPackageValue };
    }
  }
];
