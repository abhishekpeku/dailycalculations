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
  }
];
