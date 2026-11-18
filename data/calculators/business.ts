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
  }
];
