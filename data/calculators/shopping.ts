import type { CalculatorConfig } from './types.ts';

export const shoppingCalculators: CalculatorConfig[] = [
  {
    id: 'sales-tax-calculator',
    category: 'shopping',
    updatedAt: '2026-09-10',
    aliases: ['vat calculator', 'gst calculator', 'tax added calculator', 'purchase tax calculator'],
    related: ['tip-calculator', 'discount-calculator', 'unit-price-calculator', 'cashback-calculator'],
    title: 'Sales Tax Calculator',
    description: 'Compute total cost with sales tax and compare pre-tax versus final price.',
    example: 'Calculate the final total for a $125 purchase with 8.25% sales tax.',
    inputs: [
      { id: 'purchaseAmount', label: 'Purchase amount', type: 'currency', placeholder: '125', defaultValue: 125, step: 1, min: 0 },
      { id: 'salesTaxRate', label: 'Sales tax rate', type: 'percent', placeholder: '8.25', defaultValue: 8.25, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Sales Tax Calculator',
      description: 'Quickly calculate sales tax on any purchase. Enter the amount and your local tax rate to see the exact tax owed and the final price you will pay at checkout.',
      faq: [
        { question: 'How do I calculate sales tax?', answer: 'Multiply the purchase amount by the sales tax rate, then add the result to the purchase amount for the total cost.' },
        { question: 'Can I use this tool with different tax rates?', answer: 'Yes, it works for any sales tax rate you enter, including combined local rates.' }
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
    updatedAt: '2026-09-10',
    aliases: ['gratuity calculator', 'bill split calculator', 'restaurant tip calculator', 'service charge calculator'],
    related: ['sales-tax-calculator', 'discount-calculator', 'travel-budget-calculator', 'unit-price-calculator'],
    title: 'Tip Calculator',
    description: 'Calculate tip amount, total cost, and per-person share for dining bills.',
    example: 'Split a $72 dinner with an 18% tip across 3 people.',
    inputs: [
      { id: 'billAmount', label: 'Bill amount', type: 'currency', placeholder: '72', defaultValue: 72, step: 1, min: 0 },
      { id: 'tipRate', label: 'Tip rate', type: 'percent', placeholder: '18', defaultValue: 18, step: 0.25, min: 0 },
      { id: 'splitCount', label: 'Split among', type: 'number', placeholder: '3', defaultValue: 1, step: 1, min: 1 }
    ],
    seo: {
      title: 'Tip Calculator',
      description: 'Quickly calculate a tip for any restaurant bill and split the total evenly across multiple people. Enter the bill amount, tip percentage, and party size for an instant breakdown.',
      faq: [
        { question: 'How much should I tip?', answer: 'Multiply the bill amount by the tip rate, then split the total by the number of people if needed.' },
        { question: 'Can this calculator split the bill?', answer: 'Yes, it computes both the total cost and the per-person share.' }
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
    updatedAt: '2026-09-10',
    aliases: ['percent off calculator', 'sale price calculator', 'markdown calculator', 'savings calculator'],
    related: ['sales-tax-calculator', 'cashback-calculator', 'unit-price-calculator'],
    title: 'Discount Calculator',
    description: 'Calculate sale price, savings amount, and effective discount percentage for any purchase.',
    example: 'Find the final price of a $120 jacket with 30% off plus an additional 10% coupon.',
    inputs: [
      { id: 'originalPrice', label: 'Original price', type: 'currency', placeholder: '120', defaultValue: 120, step: 1, min: 0 },
      { id: 'discountPercent', label: 'Discount percentage', type: 'percent', placeholder: '30', defaultValue: 30, step: 0.5, min: 0 },
      { id: 'additionalDiscount', label: 'Additional coupon discount (%)', type: 'percent', placeholder: '10', defaultValue: 0, step: 0.5, min: 0 },
      { id: 'salesTaxRate', label: 'Sales tax rate', type: 'percent', placeholder: '8.25', defaultValue: 0, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Discount Calculator – Sale Price and Savings',
      description: 'Calculate the final price after single or stacked discounts, plus sales tax. Shows total savings and effective discount percentage.',
      faq: [
        { question: 'How do stacked discounts work?', answer: 'Stacked discounts apply sequentially, not additively. A 30% off then 10% off is not 40% off — it is 37% off total (you pay 70% then 90% of that).' },
        { question: 'What is the best day to shop for discounts in the US?', answer: 'Black Friday, Cyber Monday, Labor Day, and end-of-season sales typically offer the deepest discounts. Retail markdowns are also common mid-week.' }
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
