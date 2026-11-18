import type { CalculatorConfig } from './types.ts';

// USDA Food and Nutrition Service, "Cost of Food at Home" monthly reports, October 2026 edition:
// [weekly, monthly] cost for the reference family of 4 (two adults 20-50, two children 6-11), by
// plan tier (0 Thrifty, 1 Low-Cost, 2 Moderate-Cost, 3 Liberal). Source: see grocery-budget-calculator's
// `content.references`. Used by that calculator's compute(), derive() and referenceTable alike, so
// the figures are typed once, not copied by hand in three places.
const GROCERY_FAMILY_OF_4_WEEKLY: [number, number][] = [
  [236.5, 1024.6],
  [261.5, 1133.28],
  [305.7, 1325.07],
  [371.4, 1609.56]
];

// USDA's own household-size adjustment to its 4-person reference figures (same source as above).
function groceryBudgetSizeFactor(householdSize: number): number {
  if (householdSize <= 1) return 1.2;
  if (householdSize === 2) return 1.1;
  if (householdSize === 3) return 1.05;
  if (householdSize === 4) return 1.0;
  if (householdSize <= 6) return 0.95;
  return 0.9;
}

export const shoppingCalculators: CalculatorConfig[] = [
  {
    id: 'sales-tax-calculator',
    group: 'Taxes & Tips',
    category: 'shopping',
    glyph: 'tax',
    updatedAt: '2026-10-19',
    aliases: ['tax added calculator', 'purchase tax calculator', 'reverse sales tax calculator', 'sales tax rate calculator', 'tax inclusive price calculator'],
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
          'Outside the US, the same arithmetic applies to a value-added tax (VAT) or a goods and services tax (GST). The difference is that shelf prices there usually include the tax already, which is exactly the case the "remove tax" direction of this calculator handles. VAT and GST also differ from US sales tax in mechanism, not just name: both are collected fractionally at every stage of production and distribution rather than once at the final sale — see the dedicated vat-calculator and gst-calculator for that distinction and their own typical rates.'
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
    group: 'Taxes & Tips',
    category: 'shopping',
    glyph: 'tip',
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
    group: 'Price Comparison',
    category: 'shopping',
    glyph: '$/u',
    updatedAt: '2026-10-19',
    aliases: ['price per unit calculator', 'cost per ounce calculator', 'price comparison calculator', 'grocery unit price', 'which is cheaper calculator'],
    related: ['discount-calculator', 'sales-tax-calculator', 'cashback-calculator', 'fuel-cost-calculator'],
    title: 'Unit Price Calculator',
    description: 'Work out the price per ounce, per item or per any unit, and compare two package sizes to see which is cheaper. Or find the price or quantity that matches a unit price.',
    example: 'A 24 oz box at $5.99 costs about $0.25 an ounce ($24.96 per 100 oz). A 32 oz box at $7.49 is $23.41 per 100 oz, about 6.2% cheaper per ounce.',
    solver: {
      defaultTarget: 'unitPrice',
      variables: [
        { id: 'unitPrice', label: 'Item 1 price per unit', symbol: 'u', dimension: 'currency', defaultValue: 0.2496, defaultUnit: 'currency' },
        { id: 'totalCost', label: 'Item 1 price', symbol: 'C', dimension: 'currency', defaultValue: 5.99, defaultUnit: 'currency' },
        { id: 'quantity', label: 'Item 1 quantity (oz, items, sheets…)', symbol: 'q', dimension: 'count', defaultValue: 24, defaultUnit: 'count' },
        { id: 'cost2', label: 'Item 2 price', symbol: 'C₂', dimension: 'currency', defaultValue: 7.49, defaultUnit: 'currency', fixed: true },
        { id: 'quantity2', label: 'Item 2 quantity, same unit', symbol: 'q₂', dimension: 'count', defaultValue: 32, defaultUnit: 'count', fixed: true }
      ],
      solve: {
        unitPrice: ({ totalCost, quantity }) => (quantity > 0 ? totalCost / quantity : NaN),
        totalCost: ({ unitPrice, quantity }) => unitPrice * quantity,
        quantity: ({ unitPrice, totalCost }) => (unitPrice > 0 ? totalCost / unitPrice : NaN)
      },
      // Per-100 figures keep cent resolution for small unit prices (the widget rounds money to cents).
      outputs: [
        { id: 'per100', label: 'Item 1 price per 100 units', dimension: 'currency', compute: (si) => si.unitPrice * 100 },
        { id: 'unitPrice2', label: 'Item 2 price per unit', dimension: 'currency', compute: (si) => (si.quantity2 > 0 ? si.cost2 / si.quantity2 : NaN) },
        { id: 'per100b', label: 'Item 2 price per 100 units', dimension: 'currency', compute: (si) => (si.quantity2 > 0 ? (si.cost2 / si.quantity2) * 100 : NaN) },
        {
          id: 'difference',
          label: 'Item 2 per unit vs item 1 (negative = item 2 is cheaper)',
          dimension: 'percent',
          compute: (si) => (si.unitPrice > 0 && si.quantity2 > 0 ? (si.cost2 / si.quantity2 / si.unitPrice - 1) * 100 : NaN)
        }
      ],
      visuals: [
        {
          type: 'compareBars',
          bars: [{ from: 'per100', label: 'Item 1' }, { from: 'per100b', label: 'Item 2' }],
          title: 'Price per 100 units: the shorter bar is cheaper'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'What is a unit price?',
        paragraphs: [
          'A unit price is what you pay for one unit of a product: one ounce, one fluid ounce, one pound, one sheet or one item. It is the package price divided by the quantity in the package. Because it strips out the package size, it is the fairest way to compare a small box with a large one, or one brand with another.',
          'Many US stores print a unit price on the shelf tag next to the selling price, and several states require it. The National Conference on Weights and Measures publishes a model Uniform Unit Pricing Regulation in NIST Handbook 130 that sets common units for those labels, such as price per pound, per fluid ounce or per count, so that products sold by the same measure can be compared directly.',
          'Bigger packages are often cheaper per unit, but not always. Sales, coupons and multi-packs regularly make the smaller size the better deal, which is why it pays to check the unit price rather than assume. This calculator works out the unit price for one item and compares it with a second.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of item 1\'s price, quantity and unit price. The third, marked auto, is calculated. Item 2 is the comparison.',
        steps: [
          { name: 'Enter item 1', text: 'Type the shelf price and the quantity in the package, in any unit you like: ounces, grams, items, rolls or sheets. The unit price appears.' },
          { name: 'Enter item 2 in the same unit', text: 'Type the other package\'s price and quantity, using the same unit as item 1. Convert first if one is in pounds and the other in ounces (1 lb = 16 oz).' },
          { name: 'Compare', text: 'The bars show both prices per 100 units, and the last line shows how much cheaper or dearer item 2 is per unit.' },
          { name: 'Work backwards', text: 'Type a target unit price and a quantity, and leave the price alone, to see the most you should pay for that size.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A unit price is a division. The comparison is the ratio of the two unit prices.',
        expression: 'u = C ÷ q\nC = u × q\nq = C ÷ u\nItem 2 vs item 1 = (C₂ ÷ q₂) ÷ u − 1',
        terms: [
          { symbol: 'u', meaning: 'Item 1 price per unit.' },
          { symbol: 'C', meaning: 'Item 1 package price.' },
          { symbol: 'q', meaning: 'Item 1 quantity, in the unit you are comparing by.' },
          { symbol: 'C₂, q₂', meaning: 'Item 2 package price and quantity, in the same unit as q.' }
        ],
        note: 'Results in money are rounded to cents, so a price per ounce of $0.2496 shows as $0.25. The per-100-units lines keep the extra precision.'
      },
      workedExample: {
        intro: 'Cereal comes in a 24 oz box for $5.99 and a 32 oz box for $7.49. Which is cheaper per ounce, and by how much?',
        rows: [
          { label: 'Item 1 per ounce (5.99 ÷ 24)', value: '$0.2496' },
          { label: 'Item 2 per ounce (7.49 ÷ 32)', value: '$0.2341' },
          { label: 'Per 100 oz', value: '$24.96 vs $23.41' },
          { label: 'Item 2 vs item 1 (0.2341 ÷ 0.2496 − 1)', value: '−6.22%' }
        ],
        result: 'u ≈ $0.25 per oz · the 32 oz box is about 6.2% cheaper per ounce',
        explanation: 'The bigger box wins here, but only if you will use the extra 8 ounces before it goes stale. A cheaper unit price saves money only on what you actually use.'
      },
      watchOut: [
        { title: 'Use the same unit for both', body: 'Comparing a price per pound with a price per ounce gives nonsense. Convert first: 1 lb is 16 oz, 1 kg is 1,000 g, and a liter is about 33.8 US fluid ounces.' },
        { title: 'Bigger is not always cheaper', body: 'A 12-pack of cans at $6.99 is $0.58 a can, while a 24-pack at $14.49 is $0.60 a can. Promotions on the smaller size are common, so check every time.' },
        { title: 'Compare what you use, not what is in the package', body: 'Toilet paper rolls differ in sheet count and paper towels in sheet size. Compare by sheets or by square feet rather than by rolls.' },
        { title: 'Waste counts', body: 'Food that spoils before you finish it raises the real unit price. A larger package only saves money if you use it up.' }
      ],
      references: [
        { label: 'NIST Handbook 130, Uniform Laws and Regulations in the Areas of Legal Metrology and Fuel Quality (current edition)', url: 'https://www.nist.gov/pml/owm/nist-handbook-130-current-edition' },
        { label: 'NIST Handbook 130, Section IV.C, Uniform Unit Pricing Regulation', url: 'https://www.nist.gov/document/2026-hb-130-section-iv-c' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'totalCost', label: 'Total cost', type: 'currency', placeholder: '5.99', defaultValue: 5.99, step: 0.01, min: 0 },
      { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '24', defaultValue: 24, step: 0.1, min: 0.1 }
    ],
    seo: {
      title: 'Unit Price Calculator – Price per Ounce & Which Is Cheaper',
      description: 'Free unit price calculator: price per ounce, per item or per any unit, and a side-by-side comparison of two package sizes to find the better deal.',
      faq: [
        { question: 'How do I calculate unit price?', answer: 'Divide the package price by the quantity. A 24 oz box at $5.99 is 5.99 ÷ 24 = $0.2496 an ounce, or about $24.96 per 100 ounces.' },
        { question: 'How do I compare two package sizes?', answer: 'Work out the unit price of each in the same unit and pick the lower one. At $7.49, a 32 oz box is $0.2341 an ounce, about 6.2% cheaper than the 24 oz box at $5.99.' },
        { question: 'Is the bigger package always the better deal?', answer: 'No. A 12-pack of cans at $6.99 is about $0.58 a can, while a 24-pack at $14.49 is about $0.60 a can, so the smaller pack is cheaper per can.' },
        { question: 'How do I compare a price per pound with a price per ounce?', answer: 'Convert one of them first. A pound is 16 ounces, so a 1 lb bag at $3.49 is about $0.218 an ounce, cheaper than a 12 oz bag at $2.79, which is $0.2325 an ounce.' },
        { question: 'Why does the calculator show a price per 100 units?', answer: 'Unit prices are often a fraction of a cent apart, and money results are rounded to the cent. Multiplying by 100 keeps those differences visible, the way shelf tags show a price per 100 count.' },
        { question: 'Does the shelf tag unit price include sales tax?', answer: 'Usually not. Shelf prices and unit prices in the US are normally before sales tax, which is added at the register. Tax raises both items by the same percentage, so it does not change which one is cheaper.' }
      ]
    },
    compute(values) {
      const unitPrice = values.totalCost / values.quantity;
      return { unitPrice };
    }
  },
  {
    id: 'discount-calculator',
    group: 'Discounts & Rewards',
    category: 'shopping',
    glyph: '-%',
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
    group: 'Discounts & Rewards',
    category: 'shopping',
    glyph: 'cb',
    updatedAt: '2026-10-19',
    aliases: ['reward points calculator', 'credit card cashback calculator', 'rebate calculator', 'credit card rewards calculator'],
    related: ['discount-calculator', 'sales-tax-calculator', 'unit-price-calculator', 'tip-calculator'],
    title: 'Cashback Calculator',
    description: 'Estimate what a cashback credit card is worth to you in a year: rewards on everyday and bonus-category spending, minus the annual fee, and the effective rate you earn.',
    example: 'Spending $2,000 a month, with $400 of it earning 5% and the rest 2%, earns $52 a month: $624 a year, an effective 2.6% back.',
    breakdown: {
      headline: 'netAnnualValue',
      headlineLabel: 'Net value per year, after the fee',
      outputs: [
        { id: 'netAnnualValue', label: 'Net value per year, after the fee', format: 'currency' },
        { id: 'annualCashback', label: 'Rewards per year', format: 'currency' },
        { id: 'monthlyCashback', label: 'Rewards per month', format: 'currency' },
        { id: 'effectiveRate', label: 'Effective rewards rate, before the fee', format: 'percent' }
      ],
      groups: [
        { title: 'Your spending', inputs: ['monthlySpend', 'bonusCategorySpend'] },
        { title: 'The card', inputs: ['cashbackRate', 'bonusCategoryRate', 'annualFee'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'annualCashback', label: 'Rewards per year' }, { from: 'annualFee', label: 'Annual fee' }],
        title: 'Rewards vs fee'
      }
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'How cashback cards pay you',
        paragraphs: [
          'A cashback credit card returns a percentage of what you spend on it as a statement credit, a deposit or points worth a fixed amount each. Flat-rate cards pay the same percentage on everything. Bonus-category cards pay a higher rate on certain kinds of spending, such as groceries, dining or gas, and a lower base rate on the rest.',
          'What a card is worth to you depends on how your spending splits between those groups. Each part earns its own rate, and the parts add up: the bonus-category spending times the bonus rate, plus everything else times the base rate. Over a year, that is twelve months of rewards, minus any annual fee.',
          'Dividing the monthly rewards by the total monthly spending gives the effective rate, a single number you can compare across cards. A card paying 5% on a small slice of your spending and 1% on the rest can come out below a simple 2% card. Comparing net value per year after the fee is the fairest test.'
        ]
      },
      howTo: {
        intro: 'Enter your typical monthly card spending and the card\'s reward rates. The result updates as you type.',
        steps: [
          { name: 'Enter your total spending', text: 'Type the total you put on the card in a typical month, bonus categories included.' },
          { name: 'Enter the bonus-category part', text: 'Type how much of that total falls in the card\'s bonus categories. For a flat-rate card, enter 0.' },
          { name: 'Enter the card\'s rates and fee', text: 'Type the base rate, the bonus rate and the annual fee from the card\'s terms.' },
          { name: 'Read the result', text: 'The headline is the net value per year after the fee. Below it are the yearly and monthly rewards and the effective rate.' },
          { name: 'Compare cards', text: 'Run each card you are considering with the same spending and keep the one with the highest net value. The bars show whether the rewards cover the fee.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each part of your spending earns its own rate. The monthly rewards are added up, multiplied by 12 and reduced by the fee.',
        expression: 'Monthly = (S − B) × r + B × b\nYearly = Monthly × 12\nNet = Yearly − F\nEffective rate = Monthly ÷ S',
        terms: [
          { symbol: 'S', meaning: 'Total monthly card spending, bonus categories included.' },
          { symbol: 'B', meaning: 'The part of S that earns the bonus rate.' },
          { symbol: 'r', meaning: 'Base rewards rate as a decimal (2% = 0.02).' },
          { symbol: 'b', meaning: 'Bonus-category rate as a decimal.' },
          { symbol: 'F', meaning: 'Annual fee.' }
        ],
        note: 'Estimates only. It assumes every dollar earns its full rate, with no bonus caps, rotating categories, sign-up bonuses or redemption losses, and that you pay the balance in full each month.'
      },
      workedExample: {
        intro: 'You spend $2,000 a month on a card. Card A pays a flat 2% with no fee. Card B pays 6% on groceries, 1% on everything else and has a $95 annual fee, and $600 of your monthly spending is groceries. Which is worth more?',
        rows: [
          { label: 'Card A, monthly (2,000 × 0.02)', value: '$40.00' },
          { label: 'Card A, net per year (40 × 12 − 0)', value: '$480.00' },
          { label: 'Card B, monthly (1,400 × 0.01 + 600 × 0.06)', value: '$14.00 + $36.00 = $50.00' },
          { label: 'Card B, rewards per year (50 × 12)', value: '$600.00' },
          { label: 'Card B, net per year (600 − 95)', value: '$505.00' },
          { label: 'Card B, effective rate (50 ÷ 2,000)', value: '2.5%' }
        ],
        result: 'Card B nets $505 a year, $25 more than card A\'s $480',
        explanation: 'Card B wins only because grocery spending is large. With $400 of groceries instead, it would earn $16 + $24 = $40 a month, $480 a year, and only $385 after the fee, well behind card A.'
      },
      watchOut: [
        { title: 'Interest wipes out rewards', body: 'Card interest rates are far higher than any rewards rate. If you carry a balance from month to month, the interest you pay will usually exceed the cashback you earn.' },
        { title: 'Bonus caps and rotating categories', body: 'Many bonus rates apply only up to a spending cap, or only to categories that change each quarter and must be activated. Spending above the cap earns the base rate.' },
        { title: 'Points are not always worth a cent', body: 'If rewards come as points, check what a point is worth when redeemed for cash. Some redemptions give less than the advertised rate.' },
        { title: 'Read the fee in the card\'s disclosure table', body: 'US card issuers must show any annual fee in the standard table on the application. A fee waived for the first year still counts from the second year on.' },
        { title: 'Estimates only', body: 'Card terms change and differ by issuer. Check the current rates, caps and fees in the card agreement before you choose.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, The Consumer Credit Card Market (2025 report)', url: 'https://www.consumerfinance.gov/data-research/research-reports/the-consumer-credit-card-market-2025/' },
        { label: 'Consumer Financial Protection Bureau, Regulation Z §1026.60: Credit and charge card applications and solicitations (fee disclosure table)', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/60/' },
        { label: 'OpenStax, Contemporary Mathematics, §6.1 Understanding Percent', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-1-understanding-percent' }
      ]
    },
    inputs: [
      { id: 'monthlySpend', label: 'Total monthly card spending', type: 'currency', placeholder: '2000', defaultValue: 2000, step: 100, min: 0 },
      { id: 'cashbackRate', label: 'Base rewards rate', type: 'percent', placeholder: '2', defaultValue: 2, step: 0.25, min: 0 },
      { id: 'bonusCategorySpend', label: 'Of which in bonus categories', type: 'currency', placeholder: '400', defaultValue: 400, step: 50, min: 0 },
      { id: 'bonusCategoryRate', label: 'Bonus-category rate', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.25, min: 0 },
      { id: 'annualFee', label: 'Annual fee', type: 'currency', placeholder: '0', defaultValue: 0, step: 25, min: 0 }
    ],
    seo: {
      title: 'Cashback Calculator – Credit Card Rewards Estimator',
      description: 'Free cashback calculator: yearly credit card rewards on everyday and bonus-category spending, net of the annual fee, plus the effective rate you earn.',
      faq: [
        { question: 'How do I calculate credit card cashback?', answer: 'Multiply each part of your spending by its rate and add them up. With $2,000 a month, $400 of it at 5% and $1,600 at 2%, you earn $20 + $32 = $52 a month, or $624 a year.' },
        { question: 'What is an effective rewards rate?', answer: 'It is your total rewards divided by your total spending. $52 of rewards on $2,000 of spending is an effective 2.6%, a single figure you can compare across cards.' },
        { question: 'Is a card with an annual fee worth it?', answer: 'Only if its extra rewards beat the fee. Compared with a 2% card, a card paying 5% in a bonus category earns 3 percentage points more there, so a $95 fee needs about $264 a month of bonus spending to break even (95 ÷ 12 ÷ 0.03).' },
        { question: 'Is a flat 2% card better than a bonus-category card?', answer: 'It depends on your spending. On $2,000 a month, a flat 2% card earns $480 a year. A $95-fee card paying 6% on $600 of groceries and 1% on the rest nets $505, but only $385 if groceries are $400.' },
        { question: 'Should I carry a balance to earn rewards?', answer: 'No. Card interest rates are much higher than rewards rates, so interest on a carried balance quickly outweighs any cashback. Rewards pay off only when you pay in full each month.' },
        { question: 'Does cashback expire?', answer: 'It depends on the card. Many issuers keep rewards as long as the account is open and in good standing, but some expire or are lost when the account closes. Check your card agreement.' }
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
  },
  {
    id: 'warehouse-club-membership-breakeven-calculator',
    group: 'Discounts & Rewards',
    category: 'shopping',
    glyph: 'B/E',
    updatedAt: '2026-11-16',
    aliases: ['costco membership worth it calculator', "sam's club membership calculator", 'warehouse club breakeven calculator', 'is a club membership worth it calculator', 'bjs membership calculator'],
    related: ['cashback-calculator', 'discount-calculator', 'unit-price-calculator', 'loyalty-points-value-calculator'],
    title: 'Warehouse Club Membership Break-Even Calculator',
    description: "Work out how many trips a year a warehouse club membership (Costco, Sam's Club, BJ's) needs to pay for itself, from the annual fee and what you typically save per trip.",
    example: 'A $65 annual fee that saves you $8 a trip pays for itself after 8.125 trips, about one trip every six and a half weeks.',
    solver: {
      defaultTarget: 'breakEvenTrips',
      variables: [
        { id: 'breakEvenTrips', label: 'Trips to break even', symbol: 'n', dimension: 'count', defaultValue: 8.125, defaultUnit: 'count' },
        { id: 'annualFee', label: 'Annual membership fee', symbol: 'F', dimension: 'currency', defaultValue: 65, defaultUnit: 'currency' },
        { id: 'savingsPerTrip', label: 'Savings per trip vs. shopping elsewhere', symbol: 's', dimension: 'currency', defaultValue: 8, defaultUnit: 'currency' },
        { id: 'yourTripsPerYear', label: 'Trips you actually plan to make a year', symbol: 't', dimension: 'count', defaultValue: 12, defaultUnit: 'count', fixed: true }
      ],
      solve: {
        breakEvenTrips: ({ annualFee, savingsPerTrip }) => (savingsPerTrip > 0 ? annualFee / savingsPerTrip : NaN),
        annualFee: ({ breakEvenTrips, savingsPerTrip }) => breakEvenTrips * savingsPerTrip,
        savingsPerTrip: ({ annualFee, breakEvenTrips }) => (breakEvenTrips > 0 ? annualFee / breakEvenTrips : NaN)
      },
      outputs: [
        { id: 'yourAnnualSavings', label: 'Your estimated savings at that many trips', dimension: 'currency', compute: (si) => si.yourTripsPerYear * si.savingsPerTrip },
        { id: 'netAnnualValue', label: 'Net value after the fee', dimension: 'currency', compute: (si) => si.yourTripsPerYear * si.savingsPerTrip - si.annualFee }
      ],
      visuals: [
        {
          type: 'compareBars',
          bars: [{ from: 'annualFee', label: 'Annual fee' }, { from: 'yourAnnualSavings', label: 'Your estimated yearly savings' }],
          title: 'Fee vs. your estimated savings'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'Is a warehouse club membership worth it?',
        paragraphs: [
          "Costco, Sam's Club and BJ's Wholesale all charge an annual fee before you can shop at all. In exchange, many items run below regular retail prices, usually in bulk sizes. Whether that trade pays off depends entirely on how much you personally save on a typical trip and how often you actually go, so \"is it worth it\" has a different answer for every household, not one universal yes or no.",
          'The break-even point is the number of trips at which your accumulated savings exactly cover the fee. Divide the annual fee by what you save per trip compared with buying the same things elsewhere. Fewer trips than that and the membership cost you money overall; more trips and every additional visit is money ahead.',
          "As of November 2026, Costco's Gold Star membership is $65 a year and Sam's Club's Club membership is $60 a year, both before the optional cash-back upgrade tier. Those fees are a real, checkable floor for the math: a household that cannot identify at least that much in savings across a year's worth of trips is better off shopping elsewhere."
        ]
      },
      howTo: {
        intro: 'Enter the membership fee and what you expect to save on a typical trip. The result updates as you type.',
        steps: [
          { name: 'Enter the annual fee', text: "Type the club's membership price — the base tier unless you plan to pay for an upgrade." },
          { name: 'Estimate your savings per trip', text: 'Compare a few items you buy regularly against their price at a regular grocery or big-box store, and estimate the typical gap for a full trip.' },
          { name: 'Read the break-even point', text: 'The result is how many trips a year make the membership pay for itself.' },
          { name: 'Enter your planned trips', text: 'Type how many trips you realistically expect to make. The net value line shows whether that puts you ahead or behind.' },
          { name: 'Compare tiers', text: 'Run the numbers again with an upgraded tier\'s higher fee if you are deciding between the base and cash-back memberships.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Break-even trips is the fee divided by the savings each trip delivers.',
        expression: 'n = F ÷ s\nYour savings = t × s\nNet value = t × s − F',
        terms: [
          { symbol: 'n', meaning: 'Trips needed to break even.' },
          { symbol: 'F', meaning: 'Annual membership fee.' },
          { symbol: 's', meaning: 'What you save on a typical trip vs. your next-best option.' },
          { symbol: 't', meaning: 'Trips you actually plan to make in a year.' }
        ],
        note: 'An estimate. It assumes every trip saves the same amount and that you would have spent the same money either way — buying things you would not otherwise have bought erases the savings.'
      },
      workedExample: {
        intro: "A Costco Gold Star membership costs $65 a year. You estimate you save about $8 a trip versus your regular grocery store, and you plan to shop there roughly once every four weeks (about 12 trips a year).",
        rows: [
          { label: 'Break-even trips (65 ÷ 8)', value: '8.125 trips' },
          { label: 'Your estimated savings at 12 trips (12 × 8)', value: '$96.00' },
          { label: 'Net value after the fee (96 − 65)', value: '$31.00' }
        ],
        result: 'You break even after about 8.1 trips, and come out $31.00 ahead over a year of 12 trips.',
        explanation: "Because the fee is fixed, each trip past break-even is pure savings. At only 6 trips a year (6 × 8 = $48), the same membership would net a $17.00 loss — the math only works if you actually go often enough."
      },
      watchOut: [
        { title: 'Only count savings on things you were buying anyway', body: "A membership that tempts you into buying things you did not need erases its own savings. Count only the gap on your regular grocery list, not the full receipt." },
        { title: 'Upgrade tiers add a second break-even', body: "Costco's Executive membership, Sam's Club Plus and BJ's Perks Rewards cost more than the base tier and pay a cash-back percentage instead of (or in addition to) lower prices. Run this calculator again using just the extra fee and the extra cash back to judge the upgrade on its own." },
        { title: 'Gas and travel perks are separate savings', body: 'Warehouse clubs often sell discounted gas and travel bookings. If you use them, fold a realistic estimate of those savings into your per-trip figure rather than ignoring them.' },
        { title: 'Fees change', body: "Membership fees are reviewed periodically by each retailer and have risen in the past. Check the club's current fee before relying on this calculator's defaults." }
      ],
      references: [
        { label: "Costco Wholesale, Executive Membership & 2% Reward (fee and reward terms)", url: 'https://www.costco.com/f/-/executive-rewards' },
        { label: "Sam's Club, Membership plans and pricing", url: 'https://www.samsclub.com/membership' }
      ]
    },
    inputs: [
      { id: 'annualFee', label: 'Annual membership fee', type: 'currency', placeholder: '65', defaultValue: 65, step: 5, min: 0 },
      { id: 'savingsPerTrip', label: 'Savings per trip vs. shopping elsewhere', type: 'currency', placeholder: '8', defaultValue: 8, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'Warehouse Club Membership Break-Even Calculator',
      description: "Free calculator: how many trips a Costco, Sam's Club or BJ's membership needs to pay for itself, from the annual fee and your savings per trip.",
      faq: [
        { question: 'How do I know if a warehouse club membership is worth it?', answer: "Divide the annual fee by what you save on a typical trip. At $65 a year and $8 saved per trip, you break even after 65 ÷ 8 = 8.125 trips — fewer trips than that and you lose money overall." },
        { question: "How much do Costco and Sam's Club memberships cost?", answer: "As of November 2026, Costco's Gold Star membership is $65 a year and its Executive upgrade is $130 total. Sam's Club's Club membership is $60 a year and Plus is $120, per each retailer's own membership page." },
        { question: 'Is the Executive or Plus upgrade worth it?', answer: "Costco's Executive tier costs $65 more than Gold Star and pays a 2% reward, capped at $1,250 a year, on qualifying purchases. The extra fee breaks even at $65 ÷ 2% = $3,250 of qualifying annual spending." },
        { question: 'What counts as savings per trip?', answer: 'The difference between what you paid at the club and what the same items would have cost at your regular store. It is an estimate you supply, since it depends on what you actually buy.' },
        { question: 'Does gas count toward the savings?', answer: 'Not automatically. If you regularly use a club\'s discounted gas or travel bookings, add a reasonable estimate of that savings into your per-trip figure.' },
        { question: 'Does splitting a membership with family change the math?', answer: "No — the fee and the break-even trip count stay the same. Sharing a membership just means more of a household's trips count toward reaching it." }
      ]
    },
    compute(values) {
      const breakEvenTrips = values.savingsPerTrip > 0 ? values.annualFee / values.savingsPerTrip : NaN;
      return { breakEvenTrips };
    }
  },
  {
    id: 'grocery-budget-calculator',
    group: 'Budgeting',
    category: 'shopping',
    glyph: '$/mo',
    updatedAt: '2026-11-16',
    aliases: ['food budget calculator', 'weekly grocery budget calculator', 'monthly food budget calculator', 'usda food plan calculator', 'grocery cost calculator by household size'],
    related: ['unit-price-calculator', 'discount-calculator', 'sales-tax-calculator', 'warehouse-club-membership-breakeven-calculator'],
    title: 'Grocery Budget Calculator',
    description: 'Estimate a realistic weekly or monthly grocery budget from your household size, using the USDA\'s own Thrifty, Low-Cost, Moderate-Cost and Liberal food plan figures.',
    example: "A 3-person household on USDA's Moderate-Cost plan budgets about $240.74 a week, or roughly $1,043.20 a month.",
    breakdown: {
      headline: 'monthlyBudget',
      headlineLabel: 'Estimated monthly grocery budget',
      outputs: [
        { id: 'monthlyBudget', label: 'Estimated monthly grocery budget', format: 'currency' },
        { id: 'weeklyBudget', label: 'Estimated weekly grocery budget', format: 'currency' },
        { id: 'perPersonWeekly', label: 'Per person, per week', format: 'currency' }
      ],
      derive: (values) => {
        const householdSize = values.householdSize;
        const factor = groceryBudgetSizeFactor(householdSize);
        const monthlyByTier = GROCERY_FAMILY_OF_4_WEEKLY.map(([weekly]) => ((weekly / 4) * householdSize * factor * 52) / 12);
        return {
          thriftyMonthly: monthlyByTier[0],
          lowCostMonthly: monthlyByTier[1],
          moderateMonthly: monthlyByTier[2],
          liberalMonthly: monthlyByTier[3]
        };
      },
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'thriftyMonthly', label: 'Thrifty' },
          { from: 'lowCostMonthly', label: 'Low-Cost' },
          { from: 'moderateMonthly', label: 'Moderate-Cost' },
          { from: 'liberalMonthly', label: 'Liberal' }
        ],
        title: 'Monthly budget by USDA plan, at your household size'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: "What's a realistic grocery budget?",
        paragraphs: [
          "The U.S. Department of Agriculture publishes four monthly \"food plans\" — Thrifty, Low-Cost, Moderate-Cost and Liberal — that price out a nutritionally adequate diet prepared at home, from the cheapest realistic plan to a more generous one. They are the government's own reference figures for what groceries cost a specific reference family, updated every month for food-price inflation, and they are the basis used to set SNAP (food stamp) benefit levels.",
          'The published figures are for a reference family of two adults (20-50 years old) and two children (6-11 years old). USDA tells households of other sizes how to adjust: add 20% for a single person, 10% for two people, 5% for three people, no change for four, subtract 5% for five or six, and subtract 10% for seven or more. This calculator applies that same adjustment to an average per-person figure from the reference family, scaled to your own household size.',
          "No single number is \"the\" grocery budget — a household's real spending depends on diet, local prices and how much cooking from scratch versus convenience food it does. The four tiers give a real, cited range to check your own spending against, from frugal to generous, rather than a number invented for this calculator."
        ]
      },
      howTo: {
        intro: 'Enter your household size and pick a food plan tier. The budget updates as you type.',
        steps: [
          { name: 'Enter your household size', text: 'Type the number of people the grocery budget needs to cover.' },
          { name: 'Pick a plan tier', text: 'Thrifty is the most frugal; Liberal assumes more convenience foods and variety. Moderate-Cost is a reasonable middle estimate for most households.' },
          { name: 'Read the weekly and monthly figures', text: 'The headline is the estimated monthly budget; the weekly figure and the per-person figure are shown below it.' },
          { name: 'Compare tiers', text: 'The chart shows all four tiers at your own household size, so you can see where your actual spending falls.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "Start from the reference family's weekly cost for the chosen plan, divide by 4 for an average per-person figure, scale by household size, then apply USDA's own household-size adjustment.",
        expression: 'Per person = Family-of-4 weekly ÷ 4\nWeekly budget = Per person × household size × adjustment factor\nMonthly budget ≈ Weekly budget × 52 ÷ 12',
        terms: [
          { symbol: 'Family-of-4 weekly', meaning: "USDA's published weekly cost for the chosen plan, for its reference family of two adults and two children." },
          { symbol: 'adjustment factor', meaning: 'USDA\'s household-size adjustment: 1.20 for 1 person, 1.10 for 2, 1.05 for 3, 1.00 for 4, 0.95 for 5-6, 0.90 for 7+.' }
        ],
        note: "An estimate using an average per-person figure, not USDA's full age-and-sex breakdown. USDA's own published monthly figures are also set independently, not simply 52÷12 times its weekly figure, so this calculator's monthly estimate can differ from USDA's published monthly number by up to about $0.40 — the reference table below shows USDA's own weekly and monthly figures side by side."
      },
      workedExample: {
        intro: "A household of 3 people wants a Moderate-Cost budget.",
        rows: [
          { label: "Moderate-Cost, family of 4, per week (USDA, Oct. 2026)", value: '$305.70' },
          { label: 'Per person, per week (305.70 ÷ 4)', value: '$76.43' },
          { label: '3 people, before adjustment (76.43 × 3)', value: '$229.28' },
          { label: '3-person adjustment factor', value: '× 1.05' },
          { label: 'Weekly budget (229.28 × 1.05)', value: '$240.74' },
          { label: 'Monthly budget (240.74 × 52 ÷ 12)', value: '$1,043.20' }
        ],
        result: 'About $240.74 a week, or $1,043.20 a month, for 3 people on the Moderate-Cost plan.',
        explanation: "A single person on the frugal Thrifty plan budgets far less in total: 59.13 × 1 × 1.20 = $70.95 a week, about $307.45 a month, even though the per-person rate is actually higher to account for less bulk-buying efficiency."
      },
      watchOut: [
        { title: 'These are national averages', body: "USDA's figures are a US national average. Grocery prices vary significantly by region and by store, so treat the result as a starting point, not a local guarantee." },
        { title: 'Assumes cooking at home', body: 'The food plans price ingredients for meals prepared at home. Restaurant meals, delivery and heavily processed convenience foods cost more and are not included.' },
        { title: 'The per-person figure is an average, not age-specific', body: "USDA's own tables price food differently by age and sex (for example, teenage boys cost more to feed than toddlers). This calculator uses one average per-person figure, so a household skewed toward teenagers or large adults will likely need more than this estimate, and one with young children less." },
        { title: 'Updated monthly', body: 'USDA revises all four plans every month for food-price inflation. Figures here reflect the October 2026 report and will drift from the current report over time.' }
      ],
      references: [
        { label: 'USDA Food and Nutrition Service, USDA Food Plans: Cost of Food at Home, October 2026', url: 'https://www.fns.usda.gov/research/cnpp/usda-food-plans/cost-food-monthly-reports' },
        { label: 'USDA Food and Nutrition Service, Thrifty Food Plan report, October 2026 (reference family and household-size adjustment)', url: 'https://www.fna.usda.gov/sites/default/files/resource-files/CostofFoodOct2026Thrifty.pdf' }
      ],
      referenceTable: {
        title: 'USDA food plans: reference family of 4, October 2026',
        columns: ['Plan', 'Weekly cost', 'Monthly cost'],
        rows: [
          { label: 'Thrifty', values: GROCERY_FAMILY_OF_4_WEEKLY[0] },
          { label: 'Low-Cost', values: GROCERY_FAMILY_OF_4_WEEKLY[1] },
          { label: 'Moderate-Cost', values: GROCERY_FAMILY_OF_4_WEEKLY[2] },
          { label: 'Liberal', values: GROCERY_FAMILY_OF_4_WEEKLY[3] }
        ],
        decimals: 2,
        note: 'Reference family: two adults ages 20-50 and two children ages 6-11. Official USDA national averages for October 2026, updated monthly for food-price inflation.'
      }
    },
    inputs: [
      {
        id: 'householdSize',
        label: 'Household size',
        type: 'number',
        placeholder: '4',
        defaultValue: 4,
        step: 1,
        min: 1
      },
      {
        id: 'planTier',
        label: 'Food plan tier',
        type: 'number',
        placeholder: '2',
        defaultValue: 2,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Thrifty (most frugal)' },
          { value: 1, label: 'Low-Cost' },
          { value: 2, label: 'Moderate-Cost (typical)' },
          { value: 3, label: 'Liberal (most generous)' }
        ]
      }
    ],
    seo: {
      title: 'Grocery Budget Calculator – Weekly & Monthly, by USDA Plan',
      description: "Free grocery budget calculator: a weekly or monthly estimate by household size, based on USDA's own Thrifty, Low-Cost, Moderate-Cost and Liberal food plans.",
      faq: [
        { question: 'What is a realistic grocery budget for one person?', answer: "On USDA's Thrifty plan, one person budgets about $70.95 a week (about $307.45 a month) as of October 2026. The Liberal plan for one person runs about $111.42 a week." },
        { question: 'How much should a family of 4 spend on groceries?', answer: "USDA's October 2026 figures for its reference family of 4 run from $236.50 a week on the Thrifty plan to $371.40 a week on the Liberal plan, with Low-Cost and Moderate-Cost in between." },
        { question: 'How is the grocery budget adjusted for household size?', answer: "USDA directs smaller households to add a percentage (20% for 1 person, 10% for 2, 5% for 3) and larger ones to subtract one (5% for 5-6 people, 10% for 7+), since buying for one or two people is less efficient per person than buying for a family of four." },
        { question: 'What is the difference between the Thrifty and Liberal plans?', answer: 'They assume the same nutritional targets but price out different amounts of convenience foods, variety and brand-name items. Thrifty is the most frugal realistic plan and is also used to set SNAP benefit levels; Liberal is the most generous of the four.' },
        { question: 'Why is my monthly budget not exactly 4.33 times my weekly budget?', answer: 'This calculator multiplies the weekly figure by 52÷12 to get a monthly estimate, which is very close to but not identical to the independently rounded monthly figures USDA itself publishes — the gap is at most about $0.40 a month on these plans.' },
        { question: 'Do these figures include eating out?', answer: 'No. USDA\'s food plans price groceries for meals made at home only, not restaurant meals, delivery or alcohol.' }
      ]
    },
    compute(values) {
      const tier = Math.min(3, Math.max(0, Math.round(values.planTier)));
      const familyOf4Weekly = GROCERY_FAMILY_OF_4_WEEKLY[tier][0];
      const perPersonWeekly = familyOf4Weekly / 4;
      const householdSize = values.householdSize;
      const weeklyBudget = perPersonWeekly * householdSize * groceryBudgetSizeFactor(householdSize);
      const monthlyBudget = (weeklyBudget * 52) / 12;
      return { monthlyBudget, weeklyBudget, perPersonWeekly };
    }
  },
  {
    id: 'loyalty-points-value-calculator',
    group: 'Discounts & Rewards',
    category: 'shopping',
    glyph: '¢/pt',
    updatedAt: '2026-11-16',
    aliases: ['points to cash calculator', 'miles to dollars calculator', 'credit card points value calculator', 'how much are my points worth calculator', 'rewards points value calculator'],
    related: ['cashback-calculator', 'warehouse-club-membership-breakeven-calculator', 'discount-calculator', 'unit-price-calculator'],
    title: 'Loyalty Points Value Calculator',
    description: 'Convert loyalty, credit card or airline points to a cash value using a cents-per-point rate you supply, and compare it against a second redemption rate.',
    example: "50,000 points at 1 cent each are worth $500.00. The same points at a 0.7-cent rate are worth $350.00, a $150.00 difference.",
    breakdown: {
      headline: 'value',
      headlineLabel: 'Cash value at your rate',
      outputs: [
        { id: 'value', label: 'Cash value at your rate', format: 'currency' },
        { id: 'comparisonValue', label: 'Cash value at the comparison rate', format: 'currency' },
        { id: 'difference', label: 'Difference', format: 'currency' }
      ],
      groups: [
        { title: 'Your points', inputs: ['points', 'centsPerPoint'] },
        { title: 'Compare against another rate', inputs: ['comparisonCentsPerPoint'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'value', label: 'At your rate' }, { from: 'comparisonValue', label: 'At the comparison rate' }],
        title: 'Cash value at each rate'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What are loyalty points actually worth?',
        paragraphs: [
          'Credit card, airline and store loyalty points have no single, universal dollar value. What they are worth depends entirely on how you redeem them: a program might pay one rate for a statement credit, a different rate for gift cards, and no fixed rate at all for a flight booked with miles. The standard way the rewards industry quotes value is cents per point: how many cents one point is worth for a given redemption.',
          'Once you know (or estimate) a cents-per-point rate, the dollar value is a straight multiplication: points times the rate. This calculator also lets you compare a second rate side by side, since the same points often redeem very differently depending on how you cash them in.',
          "The gap can be real even within one program. American Express states that Membership Rewards points redeemed through Pay with Points at checkout are worth 0.7 to 1 cent each depending on the retailer, while covering a statement charge through \"Cover Your Charges\" is worth only 0.6 cent. Chase, by contrast, pays a flat 1 cent per Ultimate Rewards point for cash back or a statement credit, no matter how you redeem it."
        ]
      },
      howTo: {
        intro: "Enter how many points you have and the cents-per-point rate for how you plan to redeem them. Add a second rate to compare.",
        steps: [
          { name: 'Enter your points balance', text: 'Type the number of points or miles you want to value.' },
          { name: "Enter your program's rate", text: "Type the cents-per-point value for your planned redemption, from the program's own redemption page." },
          { name: 'Read the cash value', text: 'The headline is the dollar value at your rate.' },
          { name: 'Compare a second rate', text: 'Open the optional group and enter another cents-per-point figure, such as a different redemption option, to see the gap.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The value is points multiplied by the per-point rate, converted from cents to dollars.',
        expression: 'Value = Points × (Cents per point ÷ 100)',
        terms: [
          { symbol: 'Points', meaning: 'Your points or miles balance.' },
          { symbol: 'Cents per point', meaning: 'What one point is worth for your planned redemption, in cents.' }
        ],
        note: "An estimate using the rate you supply. Some programs publish a fixed cash-redemption rate; airline and hotel programs increasingly use dynamic pricing with no fixed rate at all, so check your program's own redemption page for the rate that applies to your specific booking."
      },
      workedExample: {
        intro: 'You have 50,000 points. Your card pays 1 cent per point for a statement credit, but you are also considering a checkout redemption at a 0.7-cent rate. How much are the points worth each way?',
        rows: [
          { label: 'Value at 1.0 cent (50,000 × 0.01)', value: '$500.00' },
          { label: 'Value at 0.7 cent (50,000 × 0.007)', value: '$350.00' },
          { label: 'Difference (500.00 − 350.00)', value: '$150.00' }
        ],
        result: 'Worth $500.00 at the 1-cent rate, $150.00 more than the 0.7-cent option.',
        explanation: 'The points themselves did not change — only the redemption method did. Always check a program\'s stated rate for the specific way you plan to redeem before assuming the best-case value.'
      },
      watchOut: [
        { title: 'No universal point value', body: "A \"typical\" cents-per-point figure you read online is someone else's estimate for one redemption method. Use your own program's published rate for the redemption you actually plan to use." },
        { title: 'The rate can vary within one program', body: "American Express states a range of 0.6 to 1 cent per Membership Rewards point depending on how you redeem, not a single number." },
        { title: 'Airline and hotel points often have no fixed rate', body: "Many travel programs price awards dynamically, so the same miles can be worth very different amounts depending on the specific flight or room, with no published per-point rate to multiply by." },
        { title: 'Minimums and increments', body: 'Some redemptions require a minimum number of points or round to a fixed increment, so the value of a small balance may not scale down perfectly from a larger one.' },
        { title: 'Expiration and devaluation', body: 'Points can expire or lose value if a program changes its redemption chart. A rate that was accurate last year is not guaranteed to still apply.' }
      ],
      references: [
        { label: 'Chase, How Chase Ultimate Rewards® Works', url: 'https://www.chase.com/personal/credit-cards/education/basics/how-chase-ultimate-rewards-works' },
        { label: 'American Express, How Much Are American Express Membership Rewards® Points Worth?', url: 'https://www.americanexpress.com/en-us/credit-cards/credit-intel/american-express-points-value/' }
      ]
    },
    inputs: [
      { id: 'points', label: 'Points balance', type: 'number', placeholder: '50000', defaultValue: 50000, step: 1000, min: 0 },
      { id: 'centsPerPoint', label: 'Your rate (cents per point)', type: 'number', placeholder: '1', defaultValue: 1, step: 0.1, min: 0 },
      { id: 'comparisonCentsPerPoint', label: 'Comparison rate (cents per point)', type: 'number', placeholder: '0.7', defaultValue: 0.7, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Loyalty Points Value Calculator – Points to Cash',
      description: 'Free loyalty points value calculator: convert points or miles to a dollar value from a cents-per-point rate, and compare it against a second rate.',
      faq: [
        { question: 'How do I calculate the cash value of my points?', answer: 'Multiply your points by the cents-per-point rate, then divide by 100. At a 1-cent rate, 50,000 points are worth 50,000 × 0.01 = $500.00.' },
        { question: 'What is a good cents-per-point value?', answer: "It depends entirely on the program and redemption method. Chase pays a flat 1 cent per Ultimate Rewards point for cash back. American Express states 0.6 to 1 cent per Membership Rewards point depending on how you redeem." },
        { question: 'Why do the same points redeem for different values?', answer: "Many programs pay more for some redemptions (such as a checkout purchase) than others (such as a statement credit). American Express's own redemption guide gives 0.7-1 cent for Pay with Points at checkout versus 0.6 cent for covering a statement charge." },
        { question: 'How much are 100,000 points worth at 1 cent each?', answer: '100,000 × 0.01 = $1,000.00.' },
        { question: 'Are airline miles worth a fixed amount?', answer: 'Not usually. Many airlines price award flights dynamically rather than publishing a fixed chart, so the same miles can be worth more or less depending on the specific flight, with no single cents-per-point figure that always applies.' },
        { question: 'Should I use the best-case or worst-case rate?', answer: "Use the rate for the redemption you actually plan to make. Comparing your planned rate against a program's other options (using the comparison field) shows whether a different redemption would be worth more." }
      ]
    },
    compute(values) {
      const value = values.points * (values.centsPerPoint / 100);
      const comparisonValue = values.points * (values.comparisonCentsPerPoint / 100);
      const difference = value - comparisonValue;
      return { value, comparisonValue, difference };
    }
  },
  {
    id: 'layaway-payment-calculator',
    group: 'Budgeting',
    category: 'shopping',
    glyph: 'LAY',
    updatedAt: '2026-11-16',
    aliases: ['layaway calculator', 'layaway plan calculator', 'layaway installment calculator', 'layaway payment schedule calculator'],
    related: ['grocery-budget-calculator', 'discount-calculator', 'sales-tax-calculator', 'warehouse-club-membership-breakeven-calculator'],
    title: 'Layaway Payment Calculator',
    description: 'Work out the size and number of installment payments to pay off a layaway balance by your pickup date, from the item price, down payment, service fee and payment schedule.',
    example: 'A $150 item with a $30 down payment and a $5 service fee, paid off in 2 installments over 4 weeks, costs $62.50 a payment.',
    breakdown: {
      headline: 'perPayment',
      headlineLabel: 'Each installment payment',
      outputs: [
        { id: 'perPayment', label: 'Each installment payment', format: 'currency' },
        { id: 'numberOfPayments', label: 'Number of installments', format: 'integer' },
        { id: 'remainingBalance', label: 'Balance after the down payment', format: 'currency' },
        { id: 'totalCost', label: 'Total you pay (item + service fee)', format: 'currency' }
      ],
      groups: [
        { title: 'The item', inputs: ['itemPrice', 'downPayment', 'serviceFee'] },
        { title: 'Timing', inputs: ['weeksUntilPickup', 'paymentFrequencyWeeks'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'downPayment', label: 'Down payment' },
          { from: 'remainingBalance', label: 'Remaining balance' },
          { from: 'serviceFee', label: 'Service fee' }
        ],
        center: 'totalCost',
        centerSub: 'Total cost'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'How does a layaway plan work?',
        paragraphs: [
          "Layaway reverses the usual order of buying on credit: the store holds your item while you pay it off in installments, and you take it home only once it is fully paid. There is normally no interest, but many stores charge a small, non-refundable service fee, and the item is held only for a fixed window — commonly a few weeks to a month.",
          "The math is simple division. Subtract your down payment from the item's price to get the remaining balance, add the service fee, and split that total evenly across however many payments fit between now and your pickup deadline at your chosen payment frequency.",
          "Burlington's own published layaway policy is a real, concrete example of how a plan like this is actually structured: a minimum down payment of $10 or 20% of the price (whichever is greater), a $5 non-refundable service fee, a 30-day hold, and a $10 fee if you cancel or do not complete the purchase in time. Other retailers that still offer layaway set their own terms, so always confirm the specific numbers with the store."
        ]
      },
      howTo: {
        intro: "Enter the item's price, your down payment and the store's service fee, then how long you have and how often you'll pay.",
        steps: [
          { name: 'Enter the price and down payment', text: "Type the item's price and the down payment the store requires or that you plan to put down." },
          { name: 'Enter the service fee', text: 'Type the non-refundable layaway fee the store charges, if any.' },
          { name: 'Enter your timeline', text: 'Type how many weeks you have until pickup and how often you plan to pay (for example, every 2 weeks).' },
          { name: 'Read the payment amount', text: 'The headline is each installment payment. The donut shows how the total splits between your down payment, the remaining balance and the fee.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The remaining balance plus the fee is split evenly across however many payments fit before your pickup date.',
        expression: 'Remaining balance = Price − Down payment\nPayments = ⌊Weeks until pickup ÷ Weeks per payment⌋\nEach payment = (Remaining balance + Service fee) ÷ Payments',
        terms: [
          { symbol: 'Price', meaning: 'The full price of the item.' },
          { symbol: 'Down payment', meaning: 'What you pay up front to start the layaway.' },
          { symbol: 'Service fee', meaning: "The store's non-refundable layaway fee, added to what you owe, not to the down payment." }
        ],
        note: 'Assumes equal installments and no interest, matching how store layaway plans work (unlike financed credit). Rounds down to a whole number of payments that fit before your pickup date.'
      },
      workedExample: {
        intro: 'A $150 item needs a $30 down payment and carries a $5 service fee. You have 4 weeks until pickup and plan to pay every 2 weeks.',
        rows: [
          { label: 'Remaining balance (150 − 30)', value: '$120.00' },
          { label: 'Number of payments (4 weeks ÷ 2-week schedule)', value: '2 payments' },
          { label: 'Each payment ((120 + 5) ÷ 2)', value: '$62.50' },
          { label: 'Total cost (150 + 5)', value: '$155.00' }
        ],
        result: '2 payments of $62.50 each, $155.00 total, on top of the $30.00 down payment.',
        explanation: 'The service fee is spread across the remaining payments along with the balance, not charged separately, so each payment is slightly more than a plain even split of the balance alone.'
      },
      watchOut: [
        { title: 'Service fees are usually non-refundable', body: "Burlington's policy, for example, keeps its $5 service fee ($1 in Maryland) even if you cancel." },
        { title: 'Cancellation and missed deadlines cost extra', body: "Burlington charges an additional $10 if you cancel or do not complete the layaway by its expiration date. Check your store's specific cancellation terms before committing." },
        { title: 'The hold period is firm', body: "Burlington holds layaway merchandise for 30 days. Missing the pickup deadline can forfeit your payments beyond the cancellation fee, depending on the store's policy." },
        { title: 'Layaway does not build credit', body: 'Unlike financing, layaway is not reported to credit bureaus. It helps you budget for a purchase, not establish or improve a credit history.' },
        { title: 'Terms vary by store', body: 'Down payment percentages, fees and hold periods differ between retailers that still offer layaway. Use your store\'s own terms, not the defaults, for an accurate figure.' }
      ],
      references: [
        { label: "Burlington, Layaway Policy", url: 'https://www.burlington.com/helpcenter/layaway' }
      ]
    },
    inputs: [
      { id: 'itemPrice', label: 'Item price', type: 'currency', placeholder: '150', defaultValue: 150, step: 10, min: 0 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '30', defaultValue: 30, step: 5, min: 0 },
      { id: 'serviceFee', label: 'Service fee', type: 'currency', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'weeksUntilPickup', label: 'Weeks until pickup', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 1 },
      { id: 'paymentFrequencyWeeks', label: 'Pay every how many weeks', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 }
    ],
    seo: {
      title: 'Layaway Payment Calculator – Installment Schedule',
      description: 'Free layaway payment calculator: work out each installment amount from the item price, down payment, service fee and your payment schedule.',
      faq: [
        { question: 'How do I calculate my layaway payments?', answer: 'Subtract your down payment from the price, add the service fee, then divide by how many payments fit before your pickup date. A $150 item with a $30 down payment, a $5 fee and 2 payments works out to (120 + 5) ÷ 2 = $62.50 each.' },
        { question: 'How much down payment do stores require for layaway?', answer: "Terms vary by retailer. Burlington requires a minimum of $10 or 20% of the price, whichever is greater, as one real published example." },
        { question: 'Do layaway plans charge interest?', answer: 'Typically no. Most layaway plans charge a flat, non-refundable service fee instead of interest, since you are paying off the item before taking it home rather than financing it afterward.' },
        { question: 'What happens if I cancel a layaway plan?', answer: "It depends on the store. Burlington charges an additional $10 cancellation fee on top of keeping its non-refundable $5 service fee." },
        { question: 'How long do stores hold layaway items?', answer: "Hold periods vary. Burlington holds merchandise for 30 days from when you start the layaway." },
        { question: 'Does layaway affect my credit score?', answer: 'No. Layaway plans are not reported to credit bureaus, since no credit is extended — you are simply pre-paying for an item the store holds for you.' }
      ]
    },
    compute(values) {
      const remainingBalance = Math.max(0, values.itemPrice - values.downPayment);
      const numberOfPayments = Math.max(1, Math.floor(values.weeksUntilPickup / values.paymentFrequencyWeeks));
      const perPayment = (remainingBalance + values.serviceFee) / numberOfPayments;
      const totalCost = values.itemPrice + values.serviceFee;
      return { perPayment, numberOfPayments, remainingBalance, totalCost };
    }
  },
  {
    id: 'free-shipping-threshold-calculator',
    group: 'Price Comparison',
    category: 'shopping',
    glyph: 'FS',
    updatedAt: '2026-11-16',
    aliases: ['free shipping calculator', 'should i add to cart for free shipping calculator', 'free shipping minimum calculator', 'is adding items for free shipping worth it calculator'],
    related: ['unit-price-calculator', 'discount-calculator', 'loyalty-points-value-calculator', 'layaway-payment-calculator'],
    title: 'Free Shipping Threshold Calculator',
    description: "Find out whether adding items to your cart to reach a store's free-shipping minimum actually saves money, or whether paying the shipping fee outright is cheaper.",
    example: "Padding a $42 cart with a $15 item you'd only use $5 worth of wastes $10 — more than the $6.99 shipping fee it was meant to avoid.",
    breakdown: {
      headline: 'netSavingsByAdding',
      headlineLabel: 'What you save by adding items (negative = pay the shipping fee instead)',
      outputs: [
        { id: 'netSavingsByAdding', label: 'What you save by adding items (negative = pay the shipping fee instead)', format: 'currency' },
        { id: 'gapToThreshold', label: 'Amount needed to reach the free-shipping minimum', format: 'currency' },
        { id: 'wastedSpend', label: "Cost of the added item beyond what it's worth to you", format: 'currency' },
        { id: 'totalIfShip', label: 'Total if you check out now and pay shipping', format: 'currency' },
        { id: 'totalIfAdd', label: 'Total if you add the item instead', format: 'currency' }
      ],
      groups: [
        { title: 'Your order', inputs: ['cartTotal', 'freeShippingThreshold', 'shippingFee'] },
        { title: "The item you'd add", inputs: ['addedItemCost', 'addedItemValueToYou'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'shippingFee', label: 'Cost of paying for shipping' }, { from: 'wastedSpend', label: "Cost of items you don't really want" }],
        title: 'The real cost of each option'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'Is it cheaper to add items for free shipping?',
        paragraphs: [
          "Many stores waive shipping above a spending threshold. The tempting move when a cart falls just short is to add another item to clear the line and avoid the fee. That only actually saves money if the added item is something you fully wanted anyway — otherwise you are trading a shipping fee for the cost of something you don't fully want, and that trade can easily cost more than the fee did.",
          "The real cost of \"padding\" a cart is not the added item's price. It is the gap between what you paid for it and what it is actually worth to you. If you value the item fully at its price, adding it costs nothing extra beyond the item itself and is a clear win over paying for shipping. If you don't want it at all, the entire price is wasted money.",
          'Comparing that wasted-spend figure against the shipping fee you were trying to avoid tells you which option is genuinely cheaper, rather than assuming "free" shipping is automatically the better deal.'
        ]
      },
      howTo: {
        intro: 'Enter your cart total, the free-shipping threshold and fee, then the item you are considering adding and what it is really worth to you.',
        steps: [
          { name: 'Enter your order details', text: "Type your current cart total, the store's free-shipping minimum, and the shipping fee you'd pay otherwise." },
          { name: "Enter the item you'd add", text: 'Type its price, and honestly estimate what it is worth to you — its full price if you genuinely want it, less if you are only adding it to hit the minimum.' },
          { name: 'Read the result', text: 'A positive headline means adding the item saves you money. A negative headline means paying the shipping fee outright is cheaper.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The cost of padding the cart is the part of the added item\'s price that is not matched by its value to you. Compare that against the shipping fee.',
        expression: "Wasted spend = max(0, Added item's price − Added item's value to you)\nNet savings by adding = Shipping fee − Wasted spend",
        terms: [
          { symbol: "Added item's value to you", meaning: "What you would actually pay for the item on its own, if you wanted it regardless of the free-shipping minimum." },
          { symbol: 'Wasted spend', meaning: "The part of the item's price you would not have chosen to spend otherwise." }
        ],
        note: "A positive result means adding the item is the cheaper option; a negative result means paying the shipping fee outright costs you less."
      },
      workedExample: {
        intro: 'Your cart totals $42, free shipping kicks in at $50, and shipping otherwise costs $6.99. You are considering adding a $15 item that you would only really use about $5 of.',
        rows: [
          { label: 'Gap to the threshold (50 − 42)', value: '$8.00' },
          { label: "Wasted spend (15 − 5)", value: '$10.00' },
          { label: 'Net savings by adding (6.99 − 10.00)', value: '−$3.01' }
        ],
        result: 'Adding the item costs $3.01 more than just paying the $6.99 shipping fee.',
        explanation: 'If the same $15 item were worth $12 to you instead (wasted spend of only $3), adding it would save 6.99 − 3 = $3.99 over paying for shipping — the decision flips purely on how much you actually value the item you\'re adding.'
      },
      watchOut: [
        { title: 'Be honest about what you actually want', body: "It is easy to overstate an added item's value to justify the purchase. If you would not buy it on its own, its real value to you is closer to zero." },
        { title: 'Returns have their own cost', body: 'Returning an unwanted item to avoid waste takes time and sometimes costs its own return-shipping fee, which this calculator does not model.' },
        { title: 'Free shipping is not the only reason to hit a threshold', body: 'Some thresholds also unlock a discount, a gift or loyalty points, which can change the math in the item\'s favor beyond what this calculator covers.' },
        { title: 'Taxes can apply to the added item too', body: 'Sales tax on the extra item adds a small additional cost on top of its price, which this calculator does not include.' }
      ]
    },
    inputs: [
      { id: 'cartTotal', label: 'Current cart total', type: 'currency', placeholder: '42', defaultValue: 42, step: 1, min: 0 },
      { id: 'freeShippingThreshold', label: 'Free-shipping minimum', type: 'currency', placeholder: '50', defaultValue: 50, step: 5, min: 0 },
      { id: 'shippingFee', label: 'Shipping fee you\'d otherwise pay', type: 'currency', placeholder: '6.99', defaultValue: 6.99, step: 0.5, min: 0 },
      { id: 'addedItemCost', label: "Added item's price", type: 'currency', placeholder: '15', defaultValue: 15, step: 1, min: 0 },
      { id: 'addedItemValueToYou', label: "What it's actually worth to you", type: 'currency', placeholder: '5', defaultValue: 5, step: 1, min: 0 }
    ],
    seo: {
      title: 'Free Shipping Threshold Calculator – Add vs. Pay',
      description: "Free calculator: is adding items to reach a store's free-shipping minimum actually cheaper than paying the shipping fee outright?",
      faq: [
        { question: 'Is it worth adding an item to get free shipping?', answer: "Only if the item's price isn't much more than what it's actually worth to you. If a $15 item you'd only use $5 of saves a $6.99 fee, you still lose $3.01 overall, since the $10 of wasted spend outweighs the fee." },
        { question: 'How do I calculate if free shipping padding is worth it?', answer: "Subtract what the added item is really worth to you from its price to get the wasted spend, then compare that to the shipping fee. If wasted spend is less than the fee, adding the item is cheaper." },
        { question: "What if I'd buy the added item anyway?", answer: "Then its value to you equals its price, wasted spend is $0, and adding it is always at least as cheap as paying for shipping." },
        { question: 'Does the free-shipping minimum itself matter to the decision?', answer: "Not directly — once you know the added item's price and what it's worth to you, the comparison is the same regardless of how large the gap to the threshold was." },
        { question: 'Should I just buy something I don\'t want to avoid a shipping fee?', answer: "Usually not. Unless the unwanted item is nearly free or you can resell it for close to its price, the wasted spend is often larger than a typical shipping fee." },
        { question: 'Does this account for return shipping if I send the padding item back?', answer: 'No. A return often has its own cost and hassle, which would make padding-and-returning look worse than this calculator shows, not better.' }
      ]
    },
    compute(values) {
      const gapToThreshold = Math.max(0, values.freeShippingThreshold - values.cartTotal);
      const wastedSpend = Math.max(0, values.addedItemCost - values.addedItemValueToYou);
      const netSavingsByAdding = values.shippingFee - wastedSpend;
      const totalIfShip = values.cartTotal + values.shippingFee;
      const totalIfAdd = values.cartTotal + values.addedItemCost;
      return { netSavingsByAdding, gapToThreshold, wastedSpend, totalIfShip, totalIfAdd };
    }
  }
];
