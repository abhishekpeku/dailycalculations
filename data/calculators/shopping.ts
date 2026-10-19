import type { CalculatorConfig } from './types.ts';

export const shoppingCalculators: CalculatorConfig[] = [
  {
    id: 'sales-tax-calculator',
    category: 'shopping',
    updatedAt: '2026-10-19',
    aliases: ['vat calculator', 'gst calculator', 'tax added calculator', 'purchase tax calculator', 'reverse sales tax calculator'],
    related: ['tip-calculator', 'discount-calculator', 'unit-price-calculator', 'cashback-calculator'],
    title: 'Sales Tax Calculator',
    description: 'Add sales tax to a price, take it back out of a tax-inclusive total, or find the tax rate from a receipt. Fill in any two of price, rate and total.',
    example: 'A $125 purchase at 8.25% sales tax comes to $135.31, of which $10.31 is tax. A $108.25 total at the same rate was $100 before tax.',
    solver: {
      defaultTarget: 'total',
      variables: [
        { id: 'total', label: 'Total with tax', symbol: 'T', dimension: 'currency', defaultValue: 135.31, defaultUnit: 'currency' },
        { id: 'price', label: 'Price before tax', symbol: 'P', dimension: 'currency', defaultValue: 125, defaultUnit: 'currency' },
        { id: 'rate', label: 'Sales tax rate', symbol: 'r', dimension: 'percent', defaultValue: 8.25, defaultUnit: '%' }
      ],
      solve: {
        total: ({ price, rate }) => price * (1 + rate / 100),
        price: ({ total, rate }) => (1 + rate / 100 > 0 ? total / (1 + rate / 100) : NaN),
        rate: ({ total, price }) => (price > 0 ? (total / price - 1) * 100 : NaN)
      },
      outputs: [{ id: 'tax', label: 'Sales tax', dimension: 'currency', compute: (si) => si.total - si.price }],
      visuals: [
        {
          type: 'donut',
          segments: [{ from: 'price', label: 'Price before tax' }, { from: 'tax', label: 'Sales tax' }],
          center: 'total',
          centerSub: 'total with tax'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'What is sales tax?',
        paragraphs: [
          'Sales tax is a tax on retail purchases, charged as a percentage of the price and collected by the seller at checkout. In the US there is no national sales tax. States set their own rate, and counties, cities and special districts often add their own on top, so the rate you pay is the sum of several layers and can change from one town to the next.',
          'Because it is a percentage, the tax grows in step with the price. At 8.25%, every $100 you spend carries $8.25 of tax, and the total is the price multiplied by 1.0825. The same multiplier works in reverse: divide a tax-inclusive total by 1.0825 and you get the price before tax.',
          'Five states (Alaska, Delaware, Montana, New Hampshire and Oregon) have no statewide sales tax, although some Alaska towns charge a local one. Many states exempt or reduce the tax on groceries, prescription drugs or clothing, so the rate on a receipt can differ from item to item.',
          'Outside the US, the same arithmetic applies to a value-added tax (VAT) or a goods and services tax (GST). The difference is that shelf prices there usually include the tax already, which is exactly the case the "remove tax" direction of this calculator handles.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the three fields. The third, marked auto, is calculated as you type.',
        steps: [
          { name: 'Add tax to a price', text: 'Type the price before tax and your combined sales tax rate. The total with tax is calculated, and the tax itself is shown below it.' },
          { name: 'Take tax out of a total', text: 'Type the total you paid and the rate, then leave the price alone. It becomes the auto field and shows the price before tax.' },
          { name: 'Find the rate from a receipt', text: 'Type the subtotal as the price and the amount you paid as the total. The rate is calculated.' },
          { name: 'Use your full local rate', text: 'Add the state, county and city rates together. Your state revenue department publishes the combined rate for each address.' },
          { name: 'Check the chart', text: 'The ring shows how much of the total is the price and how much is tax.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The total is the price grown by the tax rate. Each of the three fields has a direct rearrangement, so nothing is solved numerically.',
        expression: 'T = P × (1 + r)\nP = T ÷ (1 + r)\nr = T ÷ P − 1\nTax = T − P = P × r',
        terms: [
          { symbol: 'T', meaning: 'Total with tax, the amount you pay.' },
          { symbol: 'P', meaning: 'Price before tax, the taxable amount.' },
          { symbol: 'r', meaning: 'Combined sales tax rate as a decimal (8.25% = 0.0825).' },
          { symbol: 'Tax', meaning: 'The sales tax charged, the difference between the total and the price.' }
        ],
        note: 'Estimates only. Stores round the tax to the cent, sometimes per item, so a receipt can differ from this result by a cent or two.'
      },
      workedExample: {
        intro: 'You buy a $125 item where the combined sales tax rate is 8.25%. What do you pay, and how much of it is tax? Then, a second receipt shows $108.25 at the same rate. What was the price before tax?',
        rows: [
          { label: 'Rate as a decimal', value: '0.0825' },
          { label: 'Tax (125 × 0.0825)', value: '$10.3125 → $10.31' },
          { label: 'Total (125 × 1.0825)', value: '$135.3125 → $135.31' },
          { label: 'Second receipt, price before tax (108.25 ÷ 1.0825)', value: '$100.00' },
          { label: 'Second receipt, tax (108.25 − 100)', value: '$8.25' }
        ],
        result: 'T ≈ $135.31 with $10.31 of tax · $108.25 including tax was $100.00 before tax',
        explanation: 'Taking tax out means dividing by 1.0825, not subtracting 8.25%. Subtracting 8.25% of $108.25 gives $99.32, which is 68 cents too low, because the tax was charged on the smaller pre-tax price, not on the total.'
      },
      watchOut: [
        { title: 'Use the combined rate', body: 'The state rate alone usually understates what you pay. Add the county, city and district rates for the place of sale, or look up the combined rate on your state revenue department\'s website.' },
        { title: 'Removing tax is a division', body: 'To find the pre-tax price, divide the total by (1 + rate). Subtracting the rate from the total always gives a figure that is slightly too low.' },
        { title: 'Not everything is taxed the same', body: 'Groceries, medicine, clothing and services are exempt or taxed at a lower rate in many states. Shipping and delivery charges are taxable in some states and not in others.' },
        { title: 'Rounding', body: 'Sellers round the tax to the cent, sometimes per line and sometimes on the whole receipt. Expect differences of a cent or two from this result.' },
        { title: 'Estimates only', body: 'This calculator does arithmetic on the rate you enter. It does not look up rates or decide what is taxable. Your state revenue department is the authority for both.' }
      ],
      references: [
        { label: 'OpenStax, Contemporary Mathematics, §6.2 Discounts, Markups, and Sales Tax', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-2-discounts-markups-and-sales-tax' },
        { label: 'Internal Revenue Service, Topic no. 503, Deductible taxes (state and local general sales taxes)', url: 'https://www.irs.gov/taxtopics/tc503' },
        { label: 'Streamlined Sales Tax Governing Board, member states and uniform sales tax rules', url: 'https://www.streamlinedsalestax.org/' }
      ]
    },
    inputs: [
      { id: 'purchaseAmount', label: 'Price before tax', type: 'currency', placeholder: '125', defaultValue: 125, step: 1, min: 0 },
      { id: 'salesTaxRate', label: 'Sales tax rate', type: 'percent', placeholder: '8.25', defaultValue: 8.25, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Sales Tax Calculator – Add or Remove Sales Tax',
      description: 'Free sales tax calculator: add tax to a price, remove it from a tax-inclusive total, or find the rate from a receipt. Works with any state or local rate.',
      faq: [
        { question: 'How do I calculate sales tax?', answer: 'Multiply the price by the tax rate as a decimal. A $125 purchase at 8.25% carries $125 × 0.0825 = $10.31 of tax, for a total of $135.31.' },
        { question: 'How do I remove sales tax from a total?', answer: 'Divide the total by 1 plus the rate. At 8.25%, a $108.25 total was $108.25 ÷ 1.0825 = $100.00 before tax, and the tax was $8.25.' },
        { question: 'How do I find the sales tax rate from a receipt?', answer: 'Divide the total by the pre-tax subtotal and subtract 1. A $40.00 subtotal that became $43.30 means a rate of 43.30 ÷ 40 − 1 = 0.0825, or 8.25%.' },
        { question: 'Which US states have no sales tax?', answer: 'Alaska, Delaware, Montana, New Hampshire and Oregon have no statewide sales tax. Some Alaska cities and boroughs still charge a local sales tax.' },
        { question: 'Why is my receipt different from the calculator by a cent?', answer: 'Stores round the tax to the cent, and some round each item separately before adding them up. Those roundings can move the total by a cent or two.' },
        { question: 'Does this work for VAT or GST?', answer: 'Yes. The arithmetic is the same. Prices in VAT and GST countries usually include the tax, so enter the shelf price as the total and the rate, and the price before tax is calculated. At 20% VAT, a £60 price includes £10 of tax.' },
        { question: 'Can I deduct sales tax on my federal return?', answer: 'If you itemize, you can choose to deduct state and local general sales taxes instead of state and local income taxes, within the combined SALT limit. IRS Topic 503 explains the rules.' }
      ]
    },
    compute(values) {
      const tax = values.purchaseAmount * (values.salesTaxRate / 100);
      const total = values.purchaseAmount + tax;
      return { taxAmount: tax, totalAmount: total };
    }
  },
  {
    id: 'tip-calculator',
    category: 'shopping',
    updatedAt: '2026-10-19',
    aliases: ['gratuity calculator', 'bill split calculator', 'restaurant tip calculator', 'service charge calculator', 'tip percentage calculator'],
    related: ['sales-tax-calculator', 'discount-calculator', 'travel-budget-calculator', 'unit-price-calculator'],
    title: 'Tip Calculator',
    description: 'Work out the tip on a bill, the tip percentage you left, or the bill behind a tip, and split the total evenly between any number of people.',
    example: 'An 18% tip on a $72 dinner is $12.96, so the total is $84.96 and each of 3 people pays $28.32.',
    solver: {
      defaultTarget: 'tip',
      variables: [
        { id: 'tip', label: 'Tip', symbol: 'T', dimension: 'currency', defaultValue: 12.96, defaultUnit: 'currency' },
        { id: 'bill', label: 'Bill before tip', symbol: 'B', dimension: 'currency', defaultValue: 72, defaultUnit: 'currency' },
        { id: 'tipRate', label: 'Tip percentage', symbol: 't', dimension: 'percent', defaultValue: 18, defaultUnit: '%' },
        { id: 'people', label: 'Number of people', symbol: 'N', dimension: 'count', defaultValue: 3, defaultUnit: 'count', fixed: true }
      ],
      solve: {
        tip: ({ bill, tipRate }) => bill * (tipRate / 100),
        bill: ({ tip, tipRate }) => (tipRate > 0 ? tip / (tipRate / 100) : NaN),
        tipRate: ({ tip, bill }) => (bill > 0 ? (tip / bill) * 100 : NaN)
      },
      // Fewer than one person counts as one, as in compute().
      outputs: [
        { id: 'total', label: 'Total with tip', dimension: 'currency', compute: (si) => si.bill + si.tip },
        { id: 'perPerson', label: 'Each person pays', dimension: 'currency', compute: (si) => (si.bill + si.tip) / Math.max(1, si.people) },
        { id: 'tipPerPerson', label: 'Tip per person', dimension: 'currency', compute: (si) => si.tip / Math.max(1, si.people) }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [{ from: 'bill', label: 'Bill' }, { from: 'tip', label: 'Tip' }],
          center: 'perPerson',
          centerSub: 'per person'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'How tipping works',
        paragraphs: [
          'A tip, or gratuity, is an amount a customer chooses to add for service, usually worked out as a percentage of the bill. In the US it is a large part of the pay of restaurant servers, bartenders, delivery drivers and many other service workers. Under federal law an employer may pay tipped employees a cash wage as low as $2.13 an hour and count tips toward the rest of the $7.25 federal minimum wage, so the tip is not a small extra on top of a full wage.',
          'The arithmetic is a single percentage: the tip is the bill times the tip rate. Most people tip on the bill before sales tax, since the tax is not part of the service. The total is the bill plus the tip, and when a group splits evenly, each person pays the total divided by the number of people.',
          'A tip is voluntary: the customer decides whether to pay it and how much. A fixed charge the restaurant adds to the bill, such as an automatic 18% for large parties, is a service charge, not a tip, even if it is labelled "gratuity". Both the Department of Labor and the IRS draw that line, and it matters for how the money is paid to staff and taxed.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of tip, bill and tip percentage. The third, marked auto, is calculated. The number of people is always an input.',
        steps: [
          { name: 'Find the tip', text: 'Type the bill and the percentage you want to leave. The tip, the total and the per-person share appear at once.' },
          { name: 'Split the bill', text: 'Set the number of people. Each person\'s share of the total and of the tip is shown under the result.' },
          { name: 'Check what you left', text: 'Type the bill and the tip you actually left, then leave the percentage alone. It becomes the auto field and shows the rate.' },
          { name: 'Work back from a tip', text: 'Type a tip and its percentage to see the bill it was based on.' },
          { name: 'Read the ring', text: 'The chart shows the bill and tip as parts of the total, with each person\'s share in the middle.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The tip is a percentage of the bill. The total and the per-person figures follow from it.',
        expression: 'T = B × t\nB = T ÷ t\nt = T ÷ B\nTotal = B + T\nEach person = (B + T) ÷ N',
        terms: [
          { symbol: 'T', meaning: 'Tip amount.' },
          { symbol: 'B', meaning: 'Bill the tip is based on, usually before sales tax.' },
          { symbol: 't', meaning: 'Tip percentage as a decimal (18% = 0.18).' },
          { symbol: 'N', meaning: 'Number of people splitting evenly (at least 1).' }
        ],
        note: 'The per-person share is an exact division. When it does not come out to whole cents, someone has to round up so the bill is covered.'
      },
      workedExample: {
        intro: 'Three friends have dinner. The bill before tax is $72 and they want to leave 18%. How much is the tip, and what does each person pay?',
        rows: [
          { label: 'Tip (72 × 0.18)', value: '$12.96' },
          { label: 'Total (72 + 12.96)', value: '$84.96' },
          { label: 'Each person (84.96 ÷ 3)', value: '$28.32' },
          { label: 'Tip per person (12.96 ÷ 3)', value: '$4.32' }
        ],
        result: 'T = $12.96 · total $84.96 · $28.32 each',
        explanation: 'If the tip were worked out on the bill after tax instead, it would be a little larger. On an $80 bill with $6.60 of tax, 20% of the pre-tax $80 is $16.00, while 20% of the $86.60 total is $17.32.'
      },
      watchOut: [
        { title: 'Check for a service charge first', body: 'Many restaurants add an automatic charge for large groups. If the bill already includes one, adding a full tip on top means tipping twice. Read the bill before you calculate.' },
        { title: 'Tip on the pre-tax amount', body: 'Most etiquette guides suggest tipping on the bill before tax. Tipping on the total is more generous, which is fine, but know which one you are doing.' },
        { title: 'Discounts and coupons', body: 'If a coupon or gift card lowered the bill, the server still did the work for the full order. Many people tip on the amount before the discount.' },
        { title: 'Rounding a split', body: 'An even split rarely lands on whole cents. $100 split three ways is $33.33 each, which leaves a cent short, so one person pays $33.34.' }
      ],
      references: [
        { label: 'U.S. Department of Labor, Fact Sheet #15: Tipped Employees Under the Fair Labor Standards Act', url: 'https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa' },
        { label: 'Internal Revenue Service, Tip recordkeeping and reporting (tips vs service charges)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/tip-recordkeeping-and-reporting' },
        { label: 'Internal Revenue Service, Publication 531, Reporting Tip Income', url: 'https://www.irs.gov/publications/p531' },
        { label: 'OpenStax, Contemporary Mathematics, §6.1 Understanding Percent', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-1-understanding-percent' }
      ]
    },
    inputs: [
      { id: 'billAmount', label: 'Bill amount', type: 'currency', placeholder: '72', defaultValue: 72, step: 1, min: 0 },
      { id: 'tipRate', label: 'Tip rate', type: 'percent', placeholder: '18', defaultValue: 18, step: 0.25, min: 0 },
      { id: 'splitCount', label: 'Split among', type: 'number', placeholder: '3', defaultValue: 1, step: 1, min: 1 }
    ],
    seo: {
      title: 'Tip Calculator – Tip, Total & Bill Split',
      description: 'Free tip calculator: the tip on any bill, the percentage you left, and the total split evenly between friends. Works backwards from a tip too.',
      faq: [
        { question: 'How do I calculate a tip?', answer: 'Multiply the bill by the tip percentage as a decimal. An 18% tip on a $72 bill is 72 × 0.18 = $12.96, for a total of $84.96.' },
        { question: 'What is an easy way to work out a tip in my head?', answer: 'Move the decimal point one place left to get 10%, then build from there. On a $46 bill, 10% is $4.60, 20% is double that, $9.20, and 15% is 10% plus half of it, $4.60 + $2.30 = $6.90.' },
        { question: 'How do I split a bill with the tip?', answer: 'Add the tip to the bill and divide by the number of people. A $72 bill with an 18% tip is $84.96, so three people pay $28.32 each.' },
        { question: 'What tip percentage did I leave?', answer: 'Divide the tip by the bill. A $15 tip on a $75 bill is 15 ÷ 75 = 0.20, or 20%.' },
        { question: 'Should I tip on the total with tax or before tax?', answer: 'The usual practice is to tip on the bill before tax. On an $80 bill with $6.60 of tax, 20% before tax is $16.00 and 20% of the total is $17.32.' },
        { question: 'Is an automatic gratuity the same as a tip?', answer: 'No. The IRS and the Department of Labor treat a mandatory charge set by the restaurant as a service charge, not a tip, because the customer does not choose to pay it or decide the amount. Check the bill so you do not pay twice.' },
        { question: 'How much do tipped workers earn without tips?', answer: 'Under the federal Fair Labor Standards Act, employers may pay tipped employees a cash wage of $2.13 an hour, as long as tips bring them up to the $7.25 federal minimum wage. Many states require a higher cash wage.' }
      ]
    },
    compute(values) {
      const tipAmount = values.billAmount * (values.tipRate / 100);
      const totalAmount = values.billAmount + tipAmount;
      const perPerson = totalAmount / Math.max(1, values.splitCount);
      return { tipAmount, totalAmount, perPerson }; 
    }
  },
  {
    id: 'unit-price-calculator',
    category: 'shopping',
    updatedAt: '2026-09-10',
    aliases: ['price per unit calculator', 'cost per ounce calculator', 'price comparison calculator', 'grocery unit price'],
    related: ['discount-calculator', 'sales-tax-calculator', 'cashback-calculator', 'fuel-cost-calculator'],
    title: 'Unit Price Calculator',
    description: 'Compare product prices by unit to find the best deal.',
    example: 'Find the cost per ounce for a 24 oz package priced at $5.99.',
    inputs: [
      { id: 'totalCost', label: 'Total cost', type: 'currency', placeholder: '5.99', defaultValue: 5.99, step: 0.01, min: 0 },
      { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '24', defaultValue: 24, step: 0.1, min: 0.1 }
    ],
    seo: {
      title: 'Unit Price Calculator',
      description: 'Calculate the price per unit for any product to compare different package sizes side by side and quickly spot which option is the better deal at the store.',
      faq: [
        { question: 'What is unit price?', answer: 'Unit price is the cost per single unit of weight or quantity in a product package.' },
        { question: 'How does this help me shop?', answer: 'It makes it easier to compare prices between different package sizes and brands.' }
      ]
    },
    compute(values) {
      const unitPrice = values.totalCost / values.quantity;
      return { unitPrice };
    }
  },
  {
    id: 'discount-calculator',
    category: 'shopping',
    updatedAt: '2026-10-19',
    aliases: ['percent off calculator', 'sale price calculator', 'markdown calculator', 'savings calculator', 'stacked discount calculator'],
    related: ['sales-tax-calculator', 'cashback-calculator', 'unit-price-calculator', 'tip-calculator'],
    title: 'Discount Calculator',
    description: 'Find the sale price after a percent-off discount, the original price behind a sale price, or the discount you are really getting, with an optional second coupon and sales tax.',
    example: 'A $120 jacket at 30% off with an extra 10% coupon costs $75.60: you save $44.40, a total discount of 37%, not 40%.',
    solver: {
      defaultTarget: 'salePrice',
      variables: [
        { id: 'salePrice', label: 'Sale price', symbol: 'S', dimension: 'currency', defaultValue: 75.6, defaultUnit: 'currency' },
        { id: 'originalPrice', label: 'Original price', symbol: 'O', dimension: 'currency', defaultValue: 120, defaultUnit: 'currency' },
        { id: 'discount', label: 'Discount', symbol: 'd', dimension: 'percent', defaultValue: 30, defaultUnit: '%' },
        { id: 'extraDiscount', label: 'Extra coupon on the sale price', symbol: 'c', dimension: 'percent', defaultValue: 10, defaultUnit: '%', fixed: true },
        { id: 'taxRate', label: 'Sales tax rate', symbol: 'r', dimension: 'percent', defaultValue: 0, defaultUnit: '%', fixed: true }
      ],
      solve: {
        salePrice: ({ originalPrice, discount, extraDiscount }) => originalPrice * (1 - discount / 100) * (1 - extraDiscount / 100),
        originalPrice: ({ salePrice, discount, extraDiscount }) => {
          const kept = (1 - discount / 100) * (1 - extraDiscount / 100);
          return kept > 0 ? salePrice / kept : NaN;
        },
        // A sale price above the original would be a negative discount: no answer.
        discount: ({ salePrice, originalPrice, extraDiscount }) => {
          const afterCoupon = originalPrice * (1 - extraDiscount / 100);
          const d = afterCoupon > 0 ? (1 - salePrice / afterCoupon) * 100 : NaN;
          return d >= 0 && d <= 100 ? d : NaN;
        }
      },
      outputs: [
        { id: 'savings', label: 'You save', dimension: 'currency', compute: (si) => si.originalPrice - si.salePrice },
        { id: 'totalDiscount', label: 'Total discount', dimension: 'percent', compute: (si) => (si.originalPrice > 0 ? (1 - si.salePrice / si.originalPrice) * 100 : NaN) },
        { id: 'afterFirst', label: 'Price after the first discount', dimension: 'currency', compute: (si) => si.originalPrice * (1 - si.discount / 100) },
        { id: 'tax', label: 'Sales tax on the sale price', dimension: 'currency', compute: (si) => si.salePrice * (si.taxRate / 100) },
        { id: 'finalPrice', label: 'Sale price with tax', dimension: 'currency', compute: (si) => si.salePrice * (1 + si.taxRate / 100) }
      ],
      visuals: [
        {
          type: 'compareBars',
          bars: [{ from: 'originalPrice', label: 'Original price' }, { from: 'salePrice', label: 'You pay (before tax)' }],
          title: 'Before and after the discount',
          highlight: 1
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'How percent-off discounts work',
        paragraphs: [
          'A percent-off discount takes a share of the price away. At 30% off you pay the other 70%, so the sale price is the original price times 0.70. Thinking in terms of the share you keep paying, rather than the share taken off, makes every other discount question easier.',
          'Stacked discounts multiply; they do not add. A 30% markdown followed by an extra 10% coupon means you pay 70% of the price, then 90% of that, which is 63% of the original. The total discount is 37%, not 40%, because the coupon applies to the already-reduced price. The order does not matter: 10% off and then 30% off lands on the same price.',
          'The same idea runs backwards. If you know the sale price and the percentage off, divide by the share you paid to recover the original price. If you know both prices, the discount is one minus their ratio. This calculator does all three, and adds sales tax on the reduced price when you enter a rate, because in most US states tax is charged on what you actually pay after a store discount.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of sale price, original price and discount. The third, marked auto, is calculated. The extra coupon and the tax rate are always inputs; set them to 0 to leave them out.',
        steps: [
          { name: 'Find the sale price', text: 'Type the original price and the percent off. The sale price, your savings and the total discount appear.' },
          { name: 'Stack a coupon', text: 'Enter an extra percent-off coupon. It applies to the already-discounted price, as most store coupons do.' },
          { name: 'Find the original price', text: 'Type the sale price and the discount, and leave the original price alone. It becomes the auto field.' },
          { name: 'Check a "percent off" claim', text: 'Type the original and sale prices and leave the discount alone to see the real percentage.' },
          { name: 'Add sales tax', text: 'Enter your sales tax rate to see the tax on the sale price and what you pay at the register.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each discount multiplies the price by the share you still pay. Every field has a direct rearrangement.',
        expression: 'S = O × (1 − d) × (1 − c)\nO = S ÷ ((1 − d) × (1 − c))\nd = 1 − S ÷ (O × (1 − c))\nTotal discount = 1 − S ÷ O\nWith tax = S × (1 + r)',
        terms: [
          { symbol: 'S', meaning: 'Sale price, after every discount and before tax.' },
          { symbol: 'O', meaning: 'Original price.' },
          { symbol: 'd', meaning: 'First discount as a decimal (30% = 0.30).' },
          { symbol: 'c', meaning: 'Extra coupon on the sale price as a decimal (0 when there is none).' },
          { symbol: 'r', meaning: 'Sales tax rate as a decimal.' }
        ],
        note: 'Coupons for a fixed amount (such as $10 off) are not percentages. Subtract them from the sale price yourself. Stores round to the cent, so a receipt can differ by a cent.'
      },
      workedExample: {
        intro: 'A $120 jacket is marked 30% off, and you have a coupon for an extra 10% off the sale price. What do you pay, and what is the real discount? What if your sales tax is 8.25%?',
        rows: [
          { label: 'After 30% off (120 × 0.70)', value: '$84.00' },
          { label: 'After the extra 10% (84 × 0.90)', value: '$75.60' },
          { label: 'You save (120 − 75.60)', value: '$44.40' },
          { label: 'Total discount (1 − 75.60 ÷ 120)', value: '37%' },
          { label: 'Sales tax at 8.25% (75.60 × 0.0825)', value: '$6.24' },
          { label: 'At the register (75.60 × 1.0825)', value: '$81.84' }
        ],
        result: 'S = $75.60 · you save $44.40, a 37% total discount',
        explanation: 'Adding the two percentages would suggest 40% off and a $72.00 price. The coupon only takes 10% of the $84.00 sale price, $8.40, rather than 10% of the original $120, so you pay $3.60 more than the "40% off" figure.'
      },
      watchOut: [
        { title: 'Stacked discounts do not add up', body: '30% off plus 10% off is 37% off, and two 50% discounts are 75% off, not free. Multiply the shares you pay instead of adding the percentages.' },
        { title: 'Check the "original" price', body: 'A big percentage means little if the original price was inflated. The Federal Trade Commission\'s pricing guides say a "was" price should be one the item was really offered at, openly and in good faith, for a reasonable length of time.' },
        { title: 'Dollar-off coupons are different', body: 'A $10-off coupon saves the same on any price, so it is worth more on a cheap item in percentage terms. This calculator takes percentages; subtract a fixed coupon from the sale price.' },
        { title: 'Tax is on the price you pay', body: 'Store discounts usually lower the taxable price. Manufacturer coupons are taxed differently in some states, where tax is charged on the price before the coupon.' }
      ],
      references: [
        { label: 'OpenStax, Contemporary Mathematics, §6.2 Discounts, Markups, and Sales Tax', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-2-discounts-markups-and-sales-tax' },
        { label: 'Federal Trade Commission, Guides Against Deceptive Pricing, 16 CFR Part 233', url: 'https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-233' },
        { label: 'OpenStax, Contemporary Mathematics, §6.1 Understanding Percent', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-1-understanding-percent' }
      ]
    },
    inputs: [
      { id: 'originalPrice', label: 'Original price', type: 'currency', placeholder: '120', defaultValue: 120, step: 1, min: 0 },
      { id: 'discountPercent', label: 'Discount percentage', type: 'percent', placeholder: '30', defaultValue: 30, step: 0.5, min: 0 },
      { id: 'additionalDiscount', label: 'Additional coupon discount (%)', type: 'percent', placeholder: '10', defaultValue: 0, step: 0.5, min: 0 },
      { id: 'salesTaxRate', label: 'Sales tax rate', type: 'percent', placeholder: '8.25', defaultValue: 0, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Discount Calculator – Sale Price, Savings & % Off',
      description: 'Free discount calculator: sale price after percent off, stacked coupons and tax, the original price behind a sale, or the real discount between two prices.',
      faq: [
        { question: 'How do I calculate a discount?', answer: 'Multiply the original price by 1 minus the discount. At 30% off, a $120 item costs 120 × 0.70 = $84.00, and you save $36.00.' },
        { question: 'How do stacked discounts work?', answer: 'They multiply. 30% off and then an extra 10% off means you pay 0.70 × 0.90 = 63% of the price, a 37% total discount, not 40%. On $120 that is $75.60.' },
        { question: 'How do I find the original price from the sale price?', answer: 'Divide the sale price by the share you paid. A $45 item at 25% off was 45 ÷ 0.75 = $60.00 before the discount.' },
        { question: 'How do I work out the percent off between two prices?', answer: 'Divide the sale price by the original and subtract the result from 1. A price cut from $80 to $56 is 1 − 56 ÷ 80 = 0.30, or 30% off.' },
        { question: 'Is 20% off and then another 20% off the same as 40% off?', answer: 'No. You pay 0.80 × 0.80 = 64% of the price, so the total discount is 36%. On a $50 item that is $32.00, not $30.00.' },
        { question: 'Is sales tax charged before or after a discount?', answer: 'For a store discount, tax is normally charged on the reduced price. With 8.25% tax, the $75.60 jacket costs $81.84 at the register. Some states tax manufacturer coupons on the price before the coupon.' }
      ]
    },
    compute(values) {
      const afterFirst = values.originalPrice * (1 - values.discountPercent / 100);
      const afterSecond = afterFirst * (1 - values.additionalDiscount / 100);
      const tax = afterSecond * (values.salesTaxRate / 100);
      const finalPrice = afterSecond + tax;
      const totalSavings = values.originalPrice - afterSecond;
      const effectiveDiscount = values.originalPrice > 0 ? (totalSavings / values.originalPrice) * 100 : 0;
      return { afterFirst, afterSecond, tax, finalPrice, totalSavings, effectiveDiscount };
    }
  },
  {
    id: 'cashback-calculator',
    category: 'shopping',
    updatedAt: '2026-09-10',
    aliases: ['reward points calculator', 'credit card cashback calculator', 'rebate calculator'],
    related: ['discount-calculator', 'sales-tax-calculator', 'unit-price-calculator'],
    title: 'Cashback Calculator',
    description: 'Calculate cashback earnings from purchases, annual rewards value, and effective discount rate from rewards cards.',
    example: 'Estimate annual cashback on $2,000/month spending with a 2% rewards card.',
    inputs: [
      { id: 'monthlySpend', label: 'Monthly spending', type: 'currency', placeholder: '2000', defaultValue: 2000, step: 100, min: 0 },
      { id: 'cashbackRate', label: 'Cashback rate on general purchases', type: 'percent', placeholder: '2', defaultValue: 2, step: 0.25, min: 0 },
      { id: 'bonusCategorySpend', label: 'Monthly bonus category spending (dining, groceries, etc.)', type: 'currency', placeholder: '400', defaultValue: 400, step: 50, min: 0 },
      { id: 'bonusCategoryRate', label: 'Bonus category cashback rate', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.25, min: 0 },
      { id: 'annualFee', label: 'Card annual fee', type: 'currency', placeholder: '0', defaultValue: 0, step: 25, min: 0 }
    ],
    seo: {
      title: 'Cashback Calculator – Credit Card Rewards Estimator',
      description: 'Calculate annual cashback earnings from credit card rewards. Compare flat-rate vs bonus-category cards and factor in annual fees.',
      faq: [
        { question: 'What is a good cashback rate in the US?', answer: 'Flat-rate cards offer 1.5–2% on all purchases. Premium cards offer 3–6% on bonus categories like groceries, dining, or gas, with lower rates elsewhere.' },
        { question: 'Is a card with an annual fee worth it?', answer: 'A card with a $95 annual fee is worth it if your rewards exceed $95/year. Many premium cards offset fees with travel credits, lounge access, or high reward rates.' },
        { question: 'Does cashback expire?', answer: 'Most US cashback rewards do not expire as long as the account is open and in good standing. Always check your card agreement.' }
      ]
    },
    compute(values) {
      const generalCashback = (values.monthlySpend - values.bonusCategorySpend) * (values.cashbackRate / 100);
      const bonusCashback = values.bonusCategorySpend * (values.bonusCategoryRate / 100);
      const monthlyCashback = generalCashback + bonusCashback;
      const annualCashback = monthlyCashback * 12;
      const netAnnualValue = annualCashback - values.annualFee;
      const effectiveRate = values.monthlySpend > 0 ? (monthlyCashback / values.monthlySpend) * 100 : 0;
      return { monthlyCashback, annualCashback, netAnnualValue, effectiveRate };
    }
  }
];
