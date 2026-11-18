import type { CalculatorConfig } from './types.ts';

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
    related: ['contribution-margin-calculator', 'profit-margin-calculator', 'payback-period-calculator', 'burn-rate-calculator'],
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
      description: 'Calculate the break-even point in units and sales dollars from fixed costs, price, and variable cost per unit, or solve backward. Free, with contribution margin.',
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
  }
];
