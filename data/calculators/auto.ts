import type { CalculatorConfig } from './types.ts';
import { loanMonths, loanPayment, loanPrincipal } from './finance.ts';
import { toBase } from '../../lib/units.ts';

export const autoCalculators: CalculatorConfig[] = [
  {
    id: 'car-payment-calculator',
    category: 'auto',
    updatedAt: '2026-10-21',
    aliases: ['auto loan calculator', 'car loan calculator', 'vehicle finance calculator', 'monthly car payment estimator', 'auto loan payment calculator'],
    related: ['loan-calculator', 'emi-calculator', 'commute-cost-calculator', 'fuel-cost-calculator'],
    redirectFrom: ['auto-loan-calculator', 'car-loan-calculator'],
    title: 'Car Payment Calculator',
    description: 'Find the monthly payment on an auto loan from the car price, down payment, APR and term, or work backward to the price, term or rate that fits your budget, with total interest and a payment schedule.',
    example: 'A $28,000 car with $4,000 down, financed for 6 years (72 months) at 4.5% APR, costs about $380.98 a month and $3,430.32 in total interest.',
    solver: {
      defaultTarget: 'monthlyPayment',
      variables: [
        { id: 'monthlyPayment', label: 'Monthly payment', symbol: 'M', dimension: 'currency', defaultValue: 380.98, defaultUnit: 'currency' },
        { id: 'carPrice', label: 'Car price', symbol: 'C', dimension: 'currency', defaultValue: 28000, defaultUnit: 'currency' },
        { id: 'downPayment', label: 'Down payment + trade-in', symbol: 'D', dimension: 'currency', defaultValue: 4000, defaultUnit: 'currency', fixed: true },
        { id: 'term', label: 'Loan term', symbol: 'n', dimension: 'term', defaultValue: 6, defaultUnit: 'yr' },
        { id: 'interestRate', label: 'Interest rate (APR)', symbol: 'APR', dimension: 'percent', defaultValue: 4.5, defaultUnit: '%', bounds: [0, 100] }
      ],
      solve: {
        monthlyPayment: ({ carPrice, downPayment, term, interestRate }) => loanPayment(carPrice - downPayment, term, interestRate),
        carPrice: ({ monthlyPayment: payment, downPayment, term, interestRate }) => downPayment + loanPrincipal(payment, term, interestRate),
        term: ({ carPrice, downPayment, monthlyPayment: payment, interestRate }) => loanMonths(carPrice - downPayment, payment, interestRate)
      },
      // The rate has no closed form: the widget finds it numerically.
      equation: (si) => si.monthlyPayment - loanPayment(si.carPrice - si.downPayment, si.term, si.interestRate),
      outputs: [
        { id: 'loanAmount', label: 'Amount financed', dimension: 'currency', compute: (si) => si.carPrice - si.downPayment },
        { id: 'totalInterest', label: 'Total interest', dimension: 'currency', compute: (si) => si.monthlyPayment * si.term - (si.carPrice - si.downPayment) },
        { id: 'totalPaid', label: 'Total of all payments', dimension: 'currency', compute: (si) => si.monthlyPayment * si.term }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [{ from: 'loanAmount', label: 'Principal' }, { from: 'totalInterest', label: 'Interest' }],
          center: 'totalPaid',
          centerSub: 'total paid'
        },
        { type: 'amortization', principal: 'loanAmount', annualRate: 'interestRate', months: 'term', payment: 'monthlyPayment' }
      ]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How a car payment is calculated',
        paragraphs: [
          'Most auto loans are simple-interest installment loans. You borrow the price of the car minus whatever you put down (cash plus any trade-in value), and repay it in equal monthly payments over a fixed term, usually 36 to 84 months. Each month the lender charges interest on the balance still owed, and the rest of your payment reduces that balance. Early payments are mostly interest; the last ones are almost all principal.',
          'Three numbers drive the payment: the amount financed, the APR and the number of months. A longer term lowers the monthly payment, but you pay interest for longer, so the total cost rises. The Federal Trade Commission warns buyers not to focus only on the monthly figure for exactly this reason, and a long loan on a car that loses value quickly can leave you owing more than the car is worth.',
          'The same formula runs in reverse. If you know the payment you can afford, the calculator finds the car price that budget supports for your down payment, rate and term, or the term or rate you would need to make a given price work. Use the APR from a lender quote or the Truth-in-Lending disclosure, not just the advertised interest rate, because the APR also counts lender fees.'
        ]
      },
      howTo: {
        intro: 'Enter your down payment, then fill in any three of the other four fields. The one you have left alone longest, marked auto, is calculated.',
        steps: [
          { name: 'Enter the down payment', text: 'Include cash and the net value of any trade-in. It is always an input; the amount financed is the car price minus this figure.' },
          { name: 'Enter the price, term and APR', text: 'Type the price you will finance (add sales tax and fees if they go into the loan), the term in years or months, and the APR. The monthly payment is calculated.' },
          { name: 'Work backward from a budget', text: 'Type the monthly payment you can afford and leave the car price alone. It becomes the auto field and shows the price your budget supports.' },
          { name: 'Compare terms', text: 'Switch the term between 48, 60, 72 and 84 months and watch the total interest below the result, not only the payment.' },
          { name: 'Read the schedule', text: 'The chart splits the total into principal and interest, and the table shows the balance year by year.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The payment is the standard annuity formula applied to the amount financed.',
        expression: 'P = C − D\nM = P × r ÷ (1 − (1 + r)^−n)\nC = D + M × (1 − (1 + r)^−n) ÷ r\nn = −ln(1 − P × r ÷ M) ÷ ln(1 + r)',
        terms: [
          { symbol: 'M', meaning: 'Monthly payment.' },
          { symbol: 'C', meaning: 'Car price you finance, including any taxes and fees rolled into the loan.' },
          { symbol: 'D', meaning: 'Down payment plus trade-in value.' },
          { symbol: 'P', meaning: 'Amount financed, C − D.' },
          { symbol: 'r', meaning: 'Monthly rate: the APR ÷ 12, as a decimal. 4.5% is 0.00375.' },
          { symbol: 'n', meaning: 'Number of monthly payments: 72 for a 6-year loan. At 0% APR the payment is simply P ÷ n.' }
        ],
        note: 'Estimates only. Your lender calculates the exact payment, and the Truth-in-Lending disclosure in your contract is the binding figure. Sales tax, registration, dealer fees and add-ons are not included unless you add them to the price.'
      },
      workedExample: {
        intro: 'You buy a $28,000 car, put $4,000 down and finance the rest for 6 years at 4.5% APR. What is the monthly payment?',
        rows: [
          { label: 'Amount financed (P = 28,000 − 4,000)', value: '$24,000' },
          { label: 'Monthly rate (r = 4.5% ÷ 12)', value: '0.00375' },
          { label: 'Number of payments (n = 6 × 12)', value: '72' },
          { label: '(1 + r)^n', value: '1.30930' },
          { label: '1 − (1 + r)^−n', value: '0.236235' },
          { label: 'M = 24,000 × 0.00375 ÷ 0.236235', value: '$380.98' },
          { label: 'Total of 72 payments', value: '$27,430.32' },
          { label: 'Total interest (27,430.32 − 24,000)', value: '$3,430.32' }
        ],
        result: 'M ≈ $380.98 a month',
        explanation: 'The first payment includes $90.00 of interest (24,000 × 0.00375) and $290.98 of principal. Over the first year you pay about $1,007 in interest and $3,565 in principal, leaving about $20,435 owed. Financing the same $24,000 over 60 months instead raises the payment to $447.43 but cuts the interest to $2,845.95.'
      },
      watchOut: [
        { title: 'Estimates only', body: 'Lenders round, may charge fees that change the APR, and may count days differently. Use this to compare offers, then check the payment and APR on the Truth-in-Lending disclosure before you sign.' },
        { title: 'Longer terms cost more', body: 'At 4.5% on $24,000, stretching from 72 to 84 months lowers the payment from $380.98 to $333.60 but adds $592.40 of interest, and keeps you owing more than the car is worth for longer.' },
        { title: 'Taxes, fees and add-ons', body: 'Sales tax, title, registration and dealer fees are often rolled into the loan, as are add-ons such as extended warranties or GAP coverage. Add whatever you will finance to the car price, and remember that add-ons are optional.' },
        { title: 'Your rate depends on your credit', body: 'The APR you are quoted depends on your credit history, the term, the car’s age and the lender. Getting a pre-approval from a bank or credit union gives you a rate to compare with dealer financing.' },
        { title: 'Precomputed interest', body: 'Most auto loans are simple interest, which this calculator models: paying early saves interest. Some loans use precomputed interest, where paying early saves less. Your contract says which.' }
      ],
      references: [
        { label: 'Consumer Financial Protection Bureau, What is the difference between a loan interest rate and the APR?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/' },
        { label: 'Consumer Financial Protection Bureau, What is a Truth-in-Lending disclosure for an auto loan?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-truth-in-lending-disclosure-for-an-auto-loan-en-787/' },
        { label: 'Consumer Financial Protection Bureau, Simple interest vs precomputed interest on an auto loan', url: 'https://www.consumerfinance.gov/ask-cfpb/whats-the-difference-between-a-simple-interest-rate-and-precomputed-interest-on-an-auto-loan-en-841/' },
        { label: 'Federal Trade Commission, Financing or Leasing a Car', url: 'https://consumer.ftc.gov/articles/financing-or-leasing-car' }
      ]
    },
    inputs: [
      { id: 'carPrice', label: 'Car price', type: 'currency', placeholder: '28000', defaultValue: 28000, step: 100, min: 0 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '4000', defaultValue: 4000, step: 100, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate', type: 'percent', placeholder: '4.5', defaultValue: 4.5, step: 0.01, min: 0 },
      { id: 'years', label: 'Loan term (years)', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 1 }
    ],
    seo: {
      title: 'Car Payment Calculator – Monthly Auto Loan Payment',
      description: 'Free car payment calculator: monthly auto loan payment from price, down payment, APR and term, or the price your budget supports, with total interest.',
      faq: [
        { question: 'How do I calculate a car payment?', answer: 'Subtract your down payment and trade-in from the price to get the amount financed, then apply M = P × r ÷ (1 − (1 + r)^−n), where r is the APR ÷ 12. $24,000 at 4.5% for 72 months comes to about $380.98 a month.' },
        { question: 'Is a 60-month or 72-month car loan better?', answer: 'A shorter loan costs more each month but less overall. On $24,000 at 4.5%, 60 months is about $447.43 a month with $2,845.95 of interest; 72 months is about $380.98 with $3,430.32 of interest.' },
        { question: 'How much car can I afford for $500 a month?', answer: 'Enter the payment, your down payment, the APR and the term, and the car price is calculated. $500 a month for 60 months at 6.5% with $4,000 down supports a price of about $29,554, before any taxes and fees you finance.' },
        { question: 'How much does a higher APR cost?', answer: 'On $24,000 over 72 months, 4.5% costs about $380.98 a month and 7% about $409.18, a difference of about $28.20 a month or $2,030.36 over the loan.' },
        { question: 'What is the payment on a 0% APR deal?', answer: 'With no interest the payment is the amount financed divided by the months: $24,000 over 72 months is $333.33 a month. Compare it with any cash rebate you would give up to get the 0% offer.' },
        { question: 'What is the difference between the interest rate and the APR?', answer: 'The interest rate is the cost of borrowing the money. The APR adds lender fees to it, so it is the better figure for comparing loan offers. Lenders must disclose the APR.' },
        { question: 'Should I include sales tax in the car price?', answer: 'Yes, if you are financing it. Whatever goes into the loan, including tax, title, registration, dealer fees and add-ons, is part of the amount financed and earns interest.' }
      ]
    },
    compute(values) {
      const principal = Math.max(0, values.carPrice - values.downPayment);
      const monthlyRate = values.interestRate / 100 / 12;
      const months = Math.max(1, values.years * 12);
      const payment = monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const total = payment * months;
      const interest = total - principal;
      return { monthlyPayment: payment, totalCost: total, totalInterest: interest, loanPrincipal: principal };
    }
  },
  {
    id: 'gas-cost-calculator',
    category: 'auto',
    updatedAt: '2026-10-21',
    aliases: ['gas trip calculator', 'road trip fuel calculator', 'gas mileage cost calculator', 'trip gas cost estimator', 'how much gas for a trip'],
    related: ['fuel-cost-calculator', 'commute-cost-calculator', 'travel-budget-calculator', 'toll-cost-calculator'],
    title: 'Gas Cost Calculator',
    description: 'Work out the fuel cost of a trip from the distance, your fuel economy and the price of gas, or work backward to how far a budget takes you, in miles or kilometers, mpg or L/100 km, per gallon or per liter.',
    example: 'A 180-mile trip at 28 mpg uses about 6.43 gallons. At $3.75 a gallon that is about $24.11 one way, $48.21 for the round trip, or $13.39 per 100 miles.',
    solver: {
      defaultTarget: 'cost',
      variables: [
        { id: 'cost', label: 'Fuel cost', symbol: 'C', dimension: 'currency', defaultValue: 24.11, defaultUnit: 'currency' },
        { id: 'distance', label: 'Trip distance', symbol: 'd', dimension: 'length', defaultValue: 180, defaultUnit: 'mi' },
        { id: 'economy', label: 'Fuel economy', symbol: 'e', dimension: 'fuelEconomy', defaultValue: 28, defaultUnit: 'mpg' },
        { id: 'price', label: 'Fuel price', symbol: 'p', dimension: 'fuelPrice', defaultValue: 3.75, defaultUnit: 'cur/gal' }
      ],
      // SI: m, m³/m (fuel per distance) and currency per m³, so cost = distance × economy × price.
      solve: {
        cost: ({ distance, economy, price }) => distance * economy * price,
        distance: ({ cost, economy, price }) => (economy * price > 0 ? cost / (economy * price) : NaN),
        economy: ({ cost, distance, price }) => (distance * price > 0 ? cost / (distance * price) : NaN),
        price: ({ cost, distance, economy }) => (distance * economy > 0 ? cost / (distance * economy) : NaN)
      },
      outputs: [
        { id: 'fuelUsed', label: 'Fuel used', dimension: 'volume', unit: 'gal', compute: (si) => si.distance * si.economy },
        { id: 'fuelUsedL', label: 'Fuel used (liters)', dimension: 'volume', unit: 'L', compute: (si) => si.distance * si.economy },
        { id: 'costPer100mi', label: 'Cost per 100 miles', dimension: 'currency', compute: (si) => (si.distance > 0 ? (si.cost / si.distance) * toBase(100, 'length', 'mi') : NaN) },
        { id: 'costPer100km', label: 'Cost per 100 km', dimension: 'currency', compute: (si) => (si.distance > 0 ? (si.cost / si.distance) * toBase(100, 'length', 'km') : NaN) }
      ],
      derive: (si) => ({ roundTrip: 2 * si.cost }),
      visuals: [
        {
          type: 'compareBars',
          bars: [{ from: 'cost', label: 'One way' }, { from: 'roundTrip', label: 'Round trip' }],
          title: 'Fuel cost for the trip'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How to work out the gas cost of a trip',
        paragraphs: [
          'The fuel cost of a drive comes down to three numbers: how far you go, how much fuel your car burns over that distance, and what the fuel costs. Divide the distance by your miles per gallon to get the gallons you will burn, then multiply by the price per gallon. A 180-mile drive in a 28 mpg car burns about 6.43 gallons, which costs about $24.11 at $3.75 a gallon.',
          'Countries measure fuel economy differently. The US quotes miles per US gallon, the UK quotes miles per imperial gallon, which is about 20% larger (4.54609 liters against 3.785411784), and most other countries quote liters per 100 km, where a smaller number is better. The menus here convert between all of them, and the fuel price can be per US gallon, per UK gallon or per liter, so you can type the numbers exactly as your dashboard and the pump show them.',
          'Because the relationship is a simple product, it also runs backward. Leave any one field alone and it is calculated from the other three: how far a $40 tank budget takes you, what fuel economy a trip implies from your receipt, or the gas price at which a trip passes a set amount.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the four fields. The one you have left alone longest, marked auto, is calculated.',
        steps: [
          { name: 'Enter the distance', text: 'Type the one-way trip distance and pick miles or kilometers. The chart doubles it for the round trip.' },
          { name: 'Enter your fuel economy', text: 'Use your car’s combined rating or, better, your own figure from the trip computer or a fill-up log. Pick mpg (US), mpg (UK), L/100 km or km/L.' },
          { name: 'Enter the fuel price', text: 'Type the pump price and pick per US gallon, per UK gallon or per liter.' },
          { name: 'Read the cost', text: 'The fuel cost is calculated, with the fuel used and the cost per 100 miles and per 100 km below it.' },
          { name: 'Or work backward', text: 'Type a budget into the cost and leave the distance alone to see how far it takes you.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Fuel used is distance divided by fuel economy (or distance times consumption, for L/100 km), and the cost is the fuel used times the price.',
        expression: 'F = d ÷ mpg\nC = F × p = d × p ÷ mpg\nd = C × mpg ÷ p\nmetric: F = d × (L/100 km) ÷ 100',
        terms: [
          { symbol: 'C', meaning: 'Fuel cost of the trip.' },
          { symbol: 'd', meaning: 'Distance driven, in miles (or km for the metric form).' },
          { symbol: 'mpg', meaning: 'Fuel economy in miles per gallon. L/100 km = 235.215 ÷ mpg (US).' },
          { symbol: 'F', meaning: 'Fuel used, in gallons (or liters).' },
          { symbol: 'p', meaning: 'Fuel price per gallon (or per liter, with liters of fuel).' }
        ],
        note: 'An estimate. Real fuel economy changes with speed, traffic, load, weather and how the car is driven, so the actual cost can differ by 10% or more either way.'
      },
      workedExample: {
        intro: 'You drive 180 miles to visit family in a car that averages 28 mpg, and gas costs $3.75 a gallon. What does the trip cost in fuel?',
        rows: [
          { label: 'Distance (d)', value: '180 miles' },
          { label: 'Fuel economy', value: '28 mpg (8.40 L/100 km)' },
          { label: 'Fuel used (F = 180 ÷ 28)', value: '6.43 gallons (24.3 L)' },
          { label: 'Cost (C = 6.43 × $3.75)', value: '$24.11' },
          { label: 'Cost per 100 miles (24.11 ÷ 180 × 100)', value: '$13.39' },
          { label: 'Round trip (2 × 24.11)', value: '$48.21' }
        ],
        result: 'C ≈ $24.11 one way, $48.21 there and back',
        explanation: 'Each extra 50 cents a gallon adds about $3.21 to this one-way trip (6.43 gallons × $0.50). The same trip in a car rated 40 mpg uses 4.5 gallons and costs about $16.88.'
      },
      watchOut: [
        { title: 'Your real mpg is not the sticker mpg', body: 'Window-sticker ratings come from standardized tests. Your own average depends on speed, traffic, hills, load, weather and tire pressure, so a figure from your trip computer or a fill-up log gives a better estimate.' },
        { title: 'Speed costs fuel', body: 'The Department of Energy’s fueleconomy.gov estimates that each 5 mph you drive over 50 mph is like paying about $0.30 more per gallon, and that aggressive driving can lower highway mileage by roughly 15% to 30%.' },
        { title: 'US and UK gallons differ', body: 'A UK (imperial) gallon is 4.54609 liters, a US gallon 3.785411784 liters. 40 mpg in the UK is only about 33.3 mpg in US gallons, so pick the right unit in the menu.' },
        { title: 'L/100 km runs the other way', body: 'In liters per 100 km a lower number means a more efficient car: 5 L/100 km is far better than 10 L/100 km. Mixing it up with km/L gives a wildly wrong cost.' },
        { title: 'Fuel is only part of the trip', body: 'Tolls, parking and wear on the car add to the cost. The commute and toll calculators cover those.' }
      ],
      references: [
        { label: 'U.S. Department of Energy and EPA, fueleconomy.gov: Gas Mileage Tips, Driving More Efficiently', url: 'https://www.fueleconomy.gov/feg/driveHabits.jsp' },
        { label: 'U.S. Department of Energy and EPA, fueleconomy.gov: Factors That Affect Fuel Economy', url: 'https://www.fueleconomy.gov/feg/factors.shtml' },
        { label: 'U.S. Energy Information Administration, Gasoline and Diesel Fuel Update (weekly retail prices)', url: 'https://www.eia.gov/petroleum/gasdiesel/' },
        { label: 'NIST Special Publication 811, Appendix B: Conversion Factors (US and imperial gallon)', url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors' }
      ]
    },
    inputs: [
      { id: 'distance', label: 'Distance (miles)', type: 'number', placeholder: '180', defaultValue: 180, step: 1, min: 0 },
      { id: 'mpg', label: 'Vehicle MPG', type: 'number', placeholder: '28', defaultValue: 28, step: 0.1, min: 1 },
      { id: 'pricePerGallon', label: 'Fuel price', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Gas Cost Calculator – Fuel Cost of a Trip',
      description: 'Free gas cost calculator: fuel cost of a trip from distance, mpg or L/100 km and the price per gallon or liter, or how far a fuel budget takes you.',
      faq: [
        { question: 'How do I calculate the gas cost of a trip?', answer: 'Divide the distance by your miles per gallon to get the gallons used, then multiply by the price per gallon. 180 miles at 28 mpg is about 6.43 gallons, which costs about $24.11 at $3.75 a gallon.' },
        { question: 'How do I calculate fuel cost in liters per 100 km?', answer: 'Multiply the distance in km by the L/100 km figure and divide by 100 to get liters, then multiply by the price per liter. 300 km at 7 L/100 km uses 21 liters, which costs 37.80 at 1.80 a liter.' },
        { question: 'How far can I drive on a set budget?', answer: 'Type the budget into the cost, fill in your fuel economy and the price, and leave the distance alone. $40 at $3.75 a gallon in a 28 mpg car takes you about 299 miles.' },
        { question: 'How do I convert mpg to L/100 km?', answer: 'Divide 235.215 by the mpg (US). 28 mpg is about 8.40 L/100 km. For UK mpg, divide 282.481 instead. The fuel economy menu does the conversion for you.' },
        { question: 'Is a UK gallon the same as a US gallon?', answer: 'No. An imperial gallon is 4.54609 liters and a US gallon is 3.785411784 liters, so a UK mpg figure looks about 20% better than the same car in US mpg. 40 mpg (UK) is about 33.3 mpg (US).' },
        { question: 'Should I use the EPA rating or my own mpg?', answer: 'Your own average is usually closer to reality, because speed, traffic, cargo and weather all change fuel use. Fill up, reset the trip meter, and divide the miles by the gallons at the next fill-up.' },
        { question: 'Does the calculator include tolls and parking?', answer: 'No, it covers fuel only. Use the commute cost calculator for parking, tolls and vehicle wear, or the toll cost estimator for toll roads.' }
      ]
    },
    compute(values) {
      const gallons = values.distance / values.mpg;
      const cost = gallons * values.pricePerGallon;
      return { gallons, totalCost: cost };
    }
  },
  {
    id: 'ev-charging-calculator',
    category: 'auto',
    updatedAt: '2026-10-21',
    aliases: ['electric car charging cost', 'ev running cost calculator', 'kwh charging calculator', 'ev vs gas cost calculator', 'cost to charge an electric car'],
    related: ['fuel-cost-calculator', 'electricity-bill-calculator', 'commute-cost-calculator', 'gas-cost-calculator'],
    title: 'EV Charging Cost Calculator',
    description: 'Estimate what it costs to charge an electric vehicle from your battery size, starting charge and electricity rate, the range it adds, and how the cost per mile compares with a gas car. Efficiency in mi/kWh, kWh/100 mi or kWh/100 km.',
    example: 'Charging a 75 kWh battery from 20% to 100% adds 60 kWh, which costs $9.60 at $0.16 per kWh and adds about 240 miles at 4 mi/kWh. That is $4.00 per 100 miles, against $11.72 for a 32 mpg gas car at $3.75 a gallon.',
    breakdown: {
      headline: 'chargingCost',
      headlineLabel: 'Cost of this charge',
      outputs: [
        { id: 'chargingCost', format: 'currency' },
        { id: 'kwhNeeded', label: 'Energy added', format: 'number', dimension: 'energy', unit: 'kWh' },
        { id: 'rangeAdded', label: 'Range added', format: 'number', dimension: 'length', unit: 'mi' },
        { id: 'costPer100EV', label: 'EV cost per 100 miles', format: 'currency' },
        { id: 'costPer100Gas', label: 'Gas car cost per 100 miles', format: 'currency' },
        { id: 'savingsPer100', label: 'Savings per 100 miles', format: 'currency' },
        { id: 'annualSavings', label: 'Yearly savings at 12,000 miles', format: 'currency' }
      ],
      groups: [
        { title: 'Charge', inputs: ['batteryKwh', 'chargePercent', 'electricityRate', 'efficiency'] },
        { title: 'Compare with a gas car', inputs: ['gasPricePerGallon', 'gasMpg'] }
      ],
      derive: (v) => ({ costPer100EV: v.costPerMileEV * 100, costPer100Gas: v.costPerMileGas * 100, savingsPer100: v.savingsPerMile * 100 }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'costPer100EV', label: 'Electric' },
          { from: 'costPer100Gas', label: 'Gas' }
        ],
        title: 'Energy cost per 100 miles'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What does it cost to charge an EV?',
        paragraphs: [
          'Charging cost is the energy you put in times the price of that energy. A battery’s capacity is measured in kilowatt-hours (kWh), and your electricity bill charges per kWh, so topping up a 75 kWh battery from 20% to full adds 60 kWh, which costs $9.60 at 16 cents a kWh. Electricity prices vary widely: the EIA’s July 2026 US residential average was 18.31 cents, with North Dakota at 13.41 cents and Hawaii at 48.00 cents.',
          'For comparing running costs, cost per mile matters more than cost per charge. Divide the electricity price by your car’s efficiency in miles per kWh. At 4 mi/kWh and 16 cents, every 100 miles costs $4.00. A gas car at 32 mpg with gas at $3.75 a gallon spends about $11.72 on the same 100 miles. EV efficiency varies a lot by vehicle: the Department of Energy found model-year 2024 midsize electric cars ranged from about 2.2 to 4.2 miles per kWh, and standard two-wheel-drive SUVs from about 1.0 to 2.9.',
          'The EPA rates EVs in kWh per 100 miles, measured from the wall outlet, so its figure already includes the energy lost while charging. It also publishes MPGe, which counts 33.7 kWh as the energy in one gallon of gasoline. The efficiency menu here takes mi/kWh, kWh/100 mi, kWh/100 km, Wh/mi or Wh/km, so you can type the number from the window sticker or the car’s trip screen.'
        ]
      },
      howTo: {
        intro: 'Fill in the charge, then a gas car to compare with.',
        steps: [
          { name: 'Enter the battery size', text: 'Use the usable capacity in kWh from the manufacturer’s specifications.' },
          { name: 'Enter the starting charge', text: 'Type the state of charge you start from, as a percent. The calculator charges to 100%; to model charging to 80%, see the watch-outs.' },
          { name: 'Enter your electricity rate', text: 'Use the price per kWh on your bill, including delivery charges, or the price a public charger shows.' },
          { name: 'Enter the efficiency', text: 'Type your car’s efficiency and pick mi/kWh, kWh/100 mi, kWh/100 km, Wh/mi or Wh/km. The range added and cost per 100 miles follow from it.' },
          { name: 'Compare with gas', text: 'Enter a gas price and the fuel economy of the car you would otherwise drive. The bars compare the energy cost per 100 miles.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Energy added is the empty part of the battery; cost and range follow from the rate and the efficiency.',
        expression: 'E = B × (1 − s ÷ 100)\nC = E × r\nrange = E × η\nEV per mile = r ÷ η\ngas per mile = p ÷ mpg',
        terms: [
          { symbol: 'B', meaning: 'Battery capacity, in kWh.' },
          { symbol: 's', meaning: 'Starting state of charge, in percent.' },
          { symbol: 'E', meaning: 'Energy added to reach 100%, in kWh.' },
          { symbol: 'r', meaning: 'Electricity price per kWh.' },
          { symbol: 'η', meaning: 'Efficiency in miles per kWh. 4 mi/kWh = 25 kWh/100 mi.' },
          { symbol: 'p, mpg', meaning: 'Gas price per gallon and the gas car’s fuel economy, for the comparison.' }
        ],
        note: 'An estimate. The charge cost counts the energy stored in the battery; the energy drawn from the wall is somewhat higher because of charging losses. Yearly savings assume 12,000 miles.'
      },
      workedExample: {
        intro: 'Your EV has a 75 kWh battery at 20% charge. Home electricity costs $0.16 per kWh and the car averages 4 mi/kWh. Your old car did 32 mpg, and gas is $3.75 a gallon.',
        rows: [
          { label: 'Energy added (E = 75 × (1 − 0.20))', value: '60 kWh' },
          { label: 'Charge cost (C = 60 × $0.16)', value: '$9.60' },
          { label: 'Range added (60 × 4)', value: '240 miles' },
          { label: 'EV cost per 100 miles ($0.16 ÷ 4 × 100)', value: '$4.00' },
          { label: 'Gas cost per 100 miles ($3.75 ÷ 32 × 100)', value: '$11.72' },
          { label: 'Saving per 100 miles', value: '$7.72' },
          { label: 'Saving over 12,000 miles', value: '$926.25' }
        ],
        result: '$9.60 for the charge, about $926.25 a year less than gas',
        explanation: 'At the July 2026 US residential average of 18.31 cents a kWh the same 60 kWh would cost about $10.99, and at Hawaii’s 48.00 cents about $28.80. The saving shrinks wherever electricity is expensive or the comparison car is very efficient.'
      },
      watchOut: [
        { title: 'Charging losses', body: 'Some energy is lost as heat in the charger and battery, so the meter records more than the battery stores. The EPA’s kWh/100 mi rating includes these losses; the battery-capacity figure does not.' },
        { title: 'Public fast charging', body: 'Public fast chargers set their own prices, per kWh or sometimes per minute, and they are often higher than home rates. Use the price shown in the charging network’s app for road-trip estimates.' },
        { title: 'Charging to 80%', body: 'Many drivers stop at 80% for daily use. To model it, reduce the battery size to 80% of its capacity: a 75 kWh pack charged from 20% to 80% is the same as a 60 kWh pack charged from 25% to 100% (45 kWh added).' },
        { title: 'Time-of-use rates', body: 'Some utilities charge less per kWh overnight. Use the rate for the hours you actually charge, plus any delivery charge per kWh on your bill.' },
        { title: 'Cold weather', body: 'Efficiency falls in cold weather, when the battery and cabin need heating, so winter range and cost per mile are worse than the rating.' }
      ],
      references: [
        { label: 'U.S. EPA, Fuel Economy and EV Range Testing (MPGe, 33.7 kWh per gallon, charging losses)', url: 'https://www.epa.gov/greenvehicles/fuel-economy-and-ev-range-testing' },
        { label: 'U.S. Department of Energy, FOTW #1374: Model Year 2024 EVs Offer a Wide Range in Efficiency', url: 'https://www.energy.gov/cmei/vehicles/articles/fotw-1374-december-23-2024-model-year-2024-electric-vehicles-offer-consumers' },
        { label: 'U.S. Energy Information Administration, Electric Power Monthly, Table 5.6.A: Average Price of Electricity by State', url: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a' },
        { label: 'U.S. DOE Alternative Fuels Data Center, Charging Plug-In Electric Vehicles at Home', url: 'https://afdc.energy.gov/fuels/electricity-charging-home' }
      ]
    },
    inputs: [
      { id: 'batteryKwh', label: 'Battery capacity (kWh)', type: 'number', placeholder: '75', defaultValue: 75, step: 0.5, min: 1 },
      { id: 'chargePercent', label: 'Starting charge (charging to 100%)', type: 'percent', placeholder: '20', defaultValue: 20, step: 5, min: 0 },
      { id: 'electricityRate', label: 'Electricity price per kWh', type: 'currency', placeholder: '0.16', defaultValue: 0.16, step: 0.01, min: 0 },
      { id: 'efficiency', label: 'EV efficiency', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1, min: 0.1, dimension: 'evEfficiency', unit: 'mi/kWh' },
      { id: 'gasPricePerGallon', label: 'Gas price', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0, dimension: 'fuelPrice', unit: 'cur/gal' },
      { id: 'gasMpg', label: 'Gas car fuel economy', type: 'number', placeholder: '32', defaultValue: 32, step: 1, min: 1, dimension: 'fuelEconomy', unit: 'mpg' }
    ],
    seo: {
      title: 'EV Charging Cost Calculator – Cost per Charge & per Mile',
      description: 'Free EV charging cost calculator: cost to charge from your battery size and electricity rate, range added, and EV vs gas cost per 100 miles.',
      faq: [
        { question: 'How much does it cost to charge an EV at home?', answer: 'Multiply the kWh you add by your electricity rate. Adding 60 kWh (a 75 kWh battery from 20% to full) costs $9.60 at $0.16 per kWh, or about $10.99 at the July 2026 US residential average of 18.31 cents.' },
        { question: 'What is the average US electricity rate?', answer: 'The EIA reported a US residential average of 18.31 cents per kWh for July 2026, from 13.41 cents in North Dakota to 48.00 cents in Hawaii. Your bill shows your own rate.' },
        { question: 'Is an EV cheaper to run than a gas car?', answer: 'Usually, per mile. At 4 mi/kWh and $0.16 per kWh an EV spends $4.00 per 100 miles, while a 32 mpg car at $3.75 a gallon spends about $11.72. Expensive electricity, fast charging or a very efficient gas car narrows the gap.' },
        { question: 'How do I convert mi/kWh to kWh/100 miles?', answer: 'Divide 100 by the mi/kWh figure. 4 mi/kWh is 25 kWh/100 mi. The efficiency menu converts between mi/kWh, kWh/100 mi, kWh/100 km, Wh/mi and Wh/km for you.' },
        { question: 'What is MPGe?', answer: 'Miles per gallon equivalent. The EPA counts 33.7 kWh as the energy in one gallon of gasoline, so 4 mi/kWh is 134.8 MPGe. It compares energy use, not cost.' },
        { question: 'Can I use kilometers and kWh/100 km?', answer: 'Yes. Pick kWh/100 km in the efficiency menu. At 16 kWh/100 km and 0.30 per kWh, 100 km costs 4.80. The results still show per 100 miles and in miles: the same car costs about 7.72 per 100 miles.' },
        { question: 'Does the cost include charging losses?', answer: 'Not the charge cost, which counts the energy that reaches the battery. The EPA’s kWh/100 mi ratings are measured at the wall, so a cost per mile based on the EPA figure does include them.' }
      ]
    },
    compute(values) {
      const kwhNeeded = values.batteryKwh * (1 - values.chargePercent / 100);
      const chargingCost = kwhNeeded * values.electricityRate;
      const rangeAdded = kwhNeeded * values.efficiency;
      const costPerMileEV = values.electricityRate / values.efficiency;
      const costPerMileGas = values.gasPricePerGallon / values.gasMpg;
      const savingsPerMile = Math.max(0, costPerMileGas - costPerMileEV);
      const annualSavings = savingsPerMile * 12000;
      return { kwhNeeded, chargingCost, rangeAdded, costPerMileEV, costPerMileGas, savingsPerMile, annualSavings };
    }
  },
  {
    id: 'toll-cost-calculator',
    category: 'auto',
    updatedAt: '2026-09-10',
    aliases: ['toll estimator', 'highway toll calculator', 'road toll cost'],
    related: ['commute-cost-calculator', 'gas-cost-calculator', 'travel-budget-calculator', 'fuel-cost-calculator'],
    title: 'Toll Cost Estimator',
    description: 'Estimate total toll costs for a US road trip or commute, including E-ZPass discount savings.',
    example: 'Estimate tolls for a daily commute with $2.50 toll each way, 22 work days per month.',
    inputs: [
      { id: 'tollPerTrip', label: 'Toll cost per trip (one way)', type: 'currency', placeholder: '2.50', defaultValue: 2.50, step: 0.25, min: 0 },
      { id: 'tripsPerDay', label: 'Trips per day (2 = round trip)', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 },
      { id: 'daysPerMonth', label: 'Days per month', type: 'number', placeholder: '22', defaultValue: 22, step: 1, min: 1 },
      { id: 'ezpassDiscount', label: 'E-ZPass / transponder discount (%)', type: 'percent', placeholder: '25', defaultValue: 25, step: 1, min: 0 }
    ],
    seo: {
      title: 'Toll Cost Estimator – US Road Trips and Commutes',
      description: 'Calculate monthly and annual toll costs for commuting or road trips. Includes E-ZPass and electronic toll transponder discount savings.',
      faq: [
        { question: 'Do I save money with E-ZPass?', answer: 'Yes. E-ZPass and similar transponders (SunPass, FasTrak, TxTag) typically offer 20–30% discounts over cash rates on most US toll roads.' },
        { question: 'Which US states have the highest tolls?', answer: 'New York, New Jersey, Pennsylvania, Florida, and Illinois have some of the highest toll costs. The NY Thruway and NJ Turnpike are among the most expensive.' },
        { question: 'Are tolls tax deductible?', answer: 'Tolls paid for business purposes can be deducted as a business expense or included in the IRS standard mileage rate calculation.' }
      ]
    },
    compute(values) {
      const dailyCost = values.tollPerTrip * values.tripsPerDay;
      const monthlyCost = dailyCost * values.daysPerMonth;
      const annualCost = monthlyCost * 12;
      const discountFactor = 1 - values.ezpassDiscount / 100;
      const monthlyWithEzpass = monthlyCost * discountFactor;
      const annualWithEzpass = annualCost * discountFactor;
      const annualSavings = annualCost - annualWithEzpass;
      return { dailyCost, monthlyCost, annualCost, monthlyWithEzpass, annualWithEzpass, annualSavings };
    }
  },
  {
    id: 'commute-cost-calculator',
    category: 'auto',
    updatedAt: '2026-10-21',
    aliases: ['cost of commuting calculator', 'daily travel cost calculator', 'work travel expense calculator', 'driving to work cost calculator', 'monthly commute cost'],
    related: ['fuel-cost-calculator', 'toll-cost-calculator', 'ev-charging-calculator', 'paycheck-calculator'],
    title: 'Commute Cost Calculator',
    description: 'Work out what driving to work really costs per day, per month and per year: fuel, parking, tolls and wear on the car, in miles or km, mpg or L/100 km, with a chart of where the money goes.',
    example: 'A 25-mile round trip at 30 mpg with gas at $3.75, $15 a day parking, $3 of tolls and 21 cents a mile of wear costs about $26.38 a day, $580.25 a month (22 days) and $6,963 a year.',
    breakdown: {
      headline: 'monthlyTotal',
      headlineLabel: 'Monthly commute cost',
      outputs: [
        { id: 'monthlyTotal', format: 'currency' },
        { id: 'dailyTotal', label: 'Per day', format: 'currency' },
        { id: 'annualTotal', label: 'Per year', format: 'currency' },
        { id: 'monthlyFuel', label: 'Fuel per month', format: 'currency' },
        { id: 'monthlyParking', label: 'Parking per month', format: 'currency' },
        { id: 'monthlyTolls', label: 'Tolls per month', format: 'currency' },
        { id: 'monthlyWear', label: 'Vehicle wear per month', format: 'currency' }
      ],
      groups: [
        { title: 'Trip', inputs: ['roundTripMiles', 'daysPerMonth', 'mpg', 'gasPricePerGallon'] },
        { title: 'Daily costs', inputs: ['dailyParking', 'dailyTolls', 'wearCostPerMile'] }
      ],
      derive: (v) => ({ monthlyTolls: v.dailyTolls * v.daysPerMonth, monthlyWear: v.roundTripMiles * v.wearCostPerMile * v.daysPerMonth }),
      visual: {
        type: 'donut',
        segments: [
          { from: 'monthlyFuel', label: 'Fuel' },
          { from: 'monthlyParking', label: 'Parking' },
          { from: 'monthlyTolls', label: 'Tolls' },
          { from: 'monthlyWear', label: 'Wear' }
        ],
        center: 'monthlyTotal',
        centerSub: 'per month'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What does a commute really cost?',
        paragraphs: [
          'Most people price a commute by the fuel alone, but driving to work costs more than gas. Parking and tolls are paid every day you go in, and every mile also wears the car: tires, oil changes, brakes and the loss in value that comes with higher mileage. This calculator adds those four pieces for one day, then multiplies by the days you commute each month and by 12 for the year.',
          'Fuel is the round-trip distance divided by your fuel economy, times the fuel price. Wear is a per-mile allowance you choose. The default of 21 cents a mile is a modest placeholder; for comparison, the IRS’s 2026 standard mileage rate for business driving is 72.5 cents a mile, of which it treats 35 cents as depreciation alone. If you want a figure closer to the full cost of owning the car, use a higher wear rate.',
          'The result is useful for more than budgeting. It tells you what a job closer to home, a parking permit, a transit pass or one more remote-work day is worth in dollars, and the chart shows which cost to attack first. In a downtown job, parking is often the biggest slice; on a long suburban drive, fuel and wear dominate.'
        ]
      },
      howTo: {
        intro: 'Fill in the trip, then the daily costs. Leave parking or tolls at 0 if you do not pay them.',
        steps: [
          { name: 'Enter the round trip', text: 'Type the distance there and back, in miles or km, and how many days a month you commute (22 is a typical full-time month).' },
          { name: 'Enter your car and fuel price', text: 'Type your fuel economy in mpg (US or UK), L/100 km or km/L, and the fuel price per gallon or per liter.' },
          { name: 'Add parking and tolls', text: 'Enter what you pay per day. For a monthly parking permit, divide it by your commute days.' },
          { name: 'Set a wear rate', text: 'Keep the default cents per mile or use your own. A higher rate covers more of the true cost of owning the car.' },
          { name: 'Read the breakdown', text: 'The headline is the monthly cost, with the daily and yearly totals and each piece below it. The donut shows where the money goes.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'One day of commuting is fuel plus parking plus tolls plus wear; the month and year follow from it.',
        expression: 'fuel = d ÷ mpg × p\nwear = d × w\ndaily = fuel + parking + tolls + wear\nmonthly = daily × days\nyearly = monthly × 12',
        terms: [
          { symbol: 'd', meaning: 'Round-trip distance per day, in miles.' },
          { symbol: 'mpg', meaning: 'Fuel economy in miles per US gallon (other units are converted for you).' },
          { symbol: 'p', meaning: 'Fuel price per gallon.' },
          { symbol: 'w', meaning: 'Wear and tear allowance per mile.' },
          { symbol: 'days', meaning: 'Commute days per month.' }
        ],
        note: 'An estimate. Fuel prices, parking rates and real-world fuel economy change, and the wear rate is an allowance you choose, not a measured cost.'
      },
      workedExample: {
        intro: 'You drive 25 miles a day there and back in a 30 mpg car, gas is $3.75 a gallon, parking is $15 a day, tolls are $3 a day, and you allow 21 cents a mile for wear. You commute 22 days a month.',
        rows: [
          { label: 'Fuel per day (25 ÷ 30 × $3.75)', value: '$3.13' },
          { label: 'Wear per day (25 × $0.21)', value: '$5.25' },
          { label: 'Day total (3.125 + 15 + 3 + 5.25)', value: '$26.38' },
          { label: 'Month (26.375 × 22)', value: '$580.25' },
          { label: '… of which parking (15 × 22)', value: '$330.00' },
          { label: '… fuel, tolls, wear', value: '$68.75, $66.00, $115.50' },
          { label: 'Year (580.25 × 12)', value: '$6,963.00' }
        ],
        result: 'About $580.25 a month, $6,963 a year',
        explanation: 'Parking is 57% of the monthly cost here, far more than the $68.75 of fuel. Working from home two days a week (12 commute days instead of 22) would cut the month to $316.50, saving $263.75.'
      },
      watchOut: [
        { title: 'Commuting is not tax-deductible', body: 'The IRS treats driving between home and your regular workplace as a personal expense, so you cannot deduct it, even with the standard mileage rate. Business trips from your workplace to a client are a different matter.' },
        { title: 'The wear rate is a judgment call', body: 'The 21-cent default covers routine wear. The IRS’s 2026 business rate of 72.5 cents a mile is meant to cover the fixed and variable costs of running a car, fuel included, of which 35 cents is depreciation. If you use it as the wear rate, set the fuel price to 0 so fuel is not counted twice.' },
        { title: 'Wear is per mile, even in km', body: 'If you switch the distance to kilometers, the wear allowance is still per mile. Divide a per-km rate by 0.621371 to get the per-mile figure.' },
        { title: 'Count the days you actually go in', body: 'Holidays, vacation and remote days lower the count. Use your real average; 22 is a full month with no time off.' },
        { title: 'Your time is a cost too', body: 'The calculator prices money, not hours. A long commute also costs time that could be worth more than the fuel.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Notice 2026-10: 2026 Standard Mileage Rates', url: 'https://www.irs.gov/pub/irs-drop/n-26-10.pdf' },
        { label: 'Internal Revenue Service, Publication 463: Travel, Gift, and Car Expenses (commuting expenses)', url: 'https://www.irs.gov/publications/p463' },
        { label: 'U.S. DOE and EPA, fueleconomy.gov: Gas Mileage Tips, Driving More Efficiently', url: 'https://www.fueleconomy.gov/feg/driveHabits.jsp' },
        { label: 'U.S. Energy Information Administration, Gasoline and Diesel Fuel Update', url: 'https://www.eia.gov/petroleum/gasdiesel/' }
      ]
    },
    inputs: [
      { id: 'roundTripMiles', label: 'Round-trip commute distance', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 0, dimension: 'length', unit: 'mi' },
      { id: 'mpg', label: 'Vehicle fuel economy', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1, dimension: 'fuelEconomy', unit: 'mpg' },
      { id: 'gasPricePerGallon', label: 'Fuel price', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0, dimension: 'fuelPrice', unit: 'cur/gal' },
      { id: 'daysPerMonth', label: 'Commute days per month', type: 'number', placeholder: '22', defaultValue: 22, step: 1, min: 1 },
      { id: 'dailyParking', label: 'Daily parking cost', type: 'currency', placeholder: '15', defaultValue: 0, step: 1, min: 0 },
      { id: 'dailyTolls', label: 'Daily tolls', type: 'currency', placeholder: '3', defaultValue: 0, step: 0.25, min: 0 },
      { id: 'wearCostPerMile', label: 'Vehicle wear per mile', type: 'currency', placeholder: '0.21', defaultValue: 0.21, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Commute Cost Calculator – Daily, Monthly & Yearly Cost',
      description: 'Free commute cost calculator: what driving to work costs per day, month and year, with fuel, parking, tolls and vehicle wear, in miles or km.',
      faq: [
        { question: 'How do I calculate my commute cost?', answer: 'Add the day’s fuel (round-trip miles ÷ mpg × gas price), parking, tolls and wear (miles × a per-mile rate), then multiply by your commute days. 25 miles at 30 mpg and $3.75, with $15 parking, $3 tolls and 21 cents a mile of wear, is about $26.38 a day or $580.25 for 22 days.' },
        { question: 'What is the IRS mileage rate for 2026?', answer: 'IRS Notice 2026-10 sets the 2026 business standard mileage rate at 72.5 cents a mile, of which 35 cents counts as depreciation. It is for business driving, not for your commute.' },
        { question: 'Can I deduct my commute?', answer: 'No. The IRS treats travel between your home and your regular place of work as a personal commuting expense, whatever the distance. Travel from your workplace to another work location can be deductible business travel.' },
        { question: 'What does a commute cost at the IRS rate?', answer: 'A 25-mile round trip on 22 days a month is 6,600 miles a year, which is $4,785 at 72.5 cents a mile. That rate already includes fuel, so it replaces the fuel and wear figures here rather than adding to them.' },
        { question: 'How much does working from home save?', answer: 'Each day you skip saves one daily total. In the example, cutting from 22 to 12 commute days a month saves about $263.75 a month.' },
        { question: 'Does it work in kilometers and liters?', answer: 'Yes. Pick km, L/100 km and a price per liter. A 40 km round trip at 7 L/100 km burns 2.8 liters a day, which costs 5.04 at 1.80 a liter. The wear allowance stays per mile.' }
      ]
    },
    compute(values) {
      const dailyFuelCost = (values.roundTripMiles / values.mpg) * values.gasPricePerGallon;
      const dailyWear = values.roundTripMiles * values.wearCostPerMile;
      const dailyTotal = dailyFuelCost + values.dailyParking + values.dailyTolls + dailyWear;
      const monthlyTotal = dailyTotal * values.daysPerMonth;
      const annualTotal = monthlyTotal * 12;
      const monthlyFuel = dailyFuelCost * values.daysPerMonth;
      const monthlyParking = values.dailyParking * values.daysPerMonth;
      return { dailyTotal, monthlyTotal, annualTotal, monthlyFuel, monthlyParking };
    }
  },
  {
    id: 'fuel-cost-calculator',
    category: 'auto',
    updatedAt: '2026-10-21',
    aliases: ['petrol cost calculator', 'diesel cost calculator', 'trip fuel calculator', 'mpg cost calculator', 'annual fuel cost calculator', 'mpg savings calculator'],
    related: ['gas-cost-calculator', 'commute-cost-calculator', 'ev-charging-calculator', 'toll-cost-calculator'],
    title: 'Fuel Cost Calculator',
    description: 'Estimate what your car costs to fuel each year and each month from the distance you drive, its fuel economy and the fuel price, and see how much a more efficient car would save. Works in miles or km, mpg or L/100 km, per gallon or per liter.',
    example: 'Driving 15,000 miles a year at 28 mpg with gas at $3.75 a gallon costs about $2,008.93 a year ($167.41 a month). A 45 mpg car would cost $1,250.00, saving about $758.93 a year.',
    breakdown: {
      headline: 'annualCost',
      headlineLabel: 'Fuel cost per year',
      outputs: [
        { id: 'annualCost', format: 'currency' },
        { id: 'monthlyCost', label: 'Per month', format: 'currency' },
        { id: 'costPer100mi', label: 'Per 100 miles', format: 'currency' },
        { id: 'gallonsPerYear', label: 'Fuel per year', format: 'number', dimension: 'volume', unit: 'gal' },
        { id: 'comparisonCost', label: 'Comparison car per year', format: 'currency' },
        { id: 'annualSavings', label: 'Yearly savings with the comparison car', format: 'currency' }
      ],
      groups: [
        { title: 'Your car', inputs: ['annualMiles', 'mpg', 'gasPricePerGallon'] },
        { title: 'Compare with', inputs: ['comparisonMpg'] }
      ],
      derive: (v) => ({ costPer100mi: v.costPerMile * 100 }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'annualCost', label: 'Your car' },
          { from: 'comparisonCost', label: 'Comparison car' }
        ],
        title: 'Fuel cost per year'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What does a car cost to fuel?',
        paragraphs: [
          'A year of fuel is the distance you drive divided by your fuel economy, times the price of fuel. At 15,000 miles a year a 28 mpg car burns about 536 gallons, so every dollar on the price of a gallon adds about $536 to the yearly bill. That makes fuel one of the biggest running costs of a car, and one of the easiest to estimate.',
          'The same arithmetic shows what a more efficient car is worth. Enter a second fuel economy and the calculator prices the same miles in that car, so you can see the yearly saving from a hybrid, a smaller engine or a newer model, and set it against the difference in purchase price. The EPA’s window sticker does a similar calculation, assuming 15,000 miles a year, 55% of it in the city.',
          'Fuel economy is quoted in different units around the world. The US uses miles per US gallon, the UK miles per imperial gallon, and most other countries liters per 100 km. Every field here has a unit menu, so you can enter kilometers, L/100 km and a price per liter and still get the right answer.'
        ]
      },
      howTo: {
        intro: 'Fill in your driving and your car, then a second car to compare with.',
        steps: [
          { name: 'Enter how far you drive', text: 'Use your yearly distance in miles or km. Your odometer readings a year apart, or the mileage on two service records, give a good figure.' },
          { name: 'Enter your fuel economy', text: 'Use your real-world average if you know it, or the combined rating from the window sticker or fueleconomy.gov. Pick mpg (US), mpg (UK), L/100 km or km/L.' },
          { name: 'Enter the fuel price', text: 'Type the price you usually pay, per US gallon, per UK gallon or per liter.' },
          { name: 'Add a comparison car', text: 'Enter the fuel economy of the car you are considering. The bars compare a year of fuel in each car.' },
          { name: 'Read the result', text: 'The headline is your yearly fuel cost, with the monthly cost, the cost per 100 miles, the fuel you burn and the yearly saving below it.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Fuel per year is distance over fuel economy; cost is fuel times price.',
        expression: 'G = D ÷ mpg\nA = G × p\nmonthly = A ÷ 12\nsavings = A − (D ÷ mpg₂) × p',
        terms: [
          { symbol: 'D', meaning: 'Distance driven per year, in miles.' },
          { symbol: 'mpg', meaning: 'Your car’s fuel economy, in miles per US gallon (other units are converted for you).' },
          { symbol: 'G', meaning: 'Fuel burned per year, in gallons.' },
          { symbol: 'p', meaning: 'Fuel price per gallon.' },
          { symbol: 'A', meaning: 'Fuel cost per year.' },
          { symbol: 'mpg₂', meaning: 'Fuel economy of the comparison car. The saving shows as 0 if the comparison car uses more fuel.' }
        ],
        note: 'An estimate. Fuel prices move every week and real-world fuel economy depends on how, where and when you drive.'
      },
      workedExample: {
        intro: 'You drive 15,000 miles a year in a car that averages 28 mpg, and gas costs $3.75 a gallon. You are thinking about a hybrid rated at 45 mpg.',
        rows: [
          { label: 'Fuel per year (G = 15,000 ÷ 28)', value: '535.7 gallons' },
          { label: 'Cost per year (A = 535.7 × $3.75)', value: '$2,008.93' },
          { label: 'Cost per month (2,008.93 ÷ 12)', value: '$167.41' },
          { label: 'Cost per 100 miles ($3.75 ÷ 28 × 100)', value: '$13.39' },
          { label: 'Hybrid fuel per year (15,000 ÷ 45)', value: '333.3 gallons' },
          { label: 'Hybrid cost per year (333.3 × $3.75)', value: '$1,250.00' },
          { label: 'Yearly saving (2,008.93 − 1,250.00)', value: '$758.93' }
        ],
        result: 'About $2,008.93 a year now, $758.93 a year less in the hybrid',
        explanation: 'If the hybrid costs $3,000 more to buy, the fuel saving pays that back in about four years at these prices. Every 50 cents on the price of gas changes your current yearly bill by about $267.86 (535.7 gallons × $0.50).'
      },
      watchOut: [
        { title: 'The mpg illusion', body: 'Fuel use falls with the inverse of mpg, so gains at the low end matter most. Over 10,000 miles, going from 10 to 20 mpg saves 500 gallons, while going from 25 to 50 mpg saves only 200. Compare cars by gallons or cost, not by mpg points.' },
        { title: 'Use your real mileage', body: 'The sticker assumes 15,000 miles a year. The Federal Highway Administration’s figure for the average driver is 13,476 miles, and it varies a lot by age and job, so your own odometer is the best input.' },
        { title: 'Prices change', body: 'The yearly cost scales with the fuel price. Check the EIA’s weekly retail prices for your region, or run the calculator at a high and a low price to see the range.' },
        { title: 'Fuel is not the whole cost', body: 'A cheaper-to-fuel car can still cost more to own once purchase price, insurance and maintenance are included. Use the saving here as one input to that decision.' }
      ],
      references: [
        { label: 'U.S. DOE and EPA, 2026 Fuel Economy Guide (annual fuel cost assumptions)', url: 'https://www.fueleconomy.gov/feg/pdfs/guides/FEG2026.pdf' },
        { label: 'Federal Highway Administration, Average Annual Miles per Driver by Age Group', url: 'https://www.fhwa.dot.gov/ohim/onh00/bar8.htm' },
        { label: 'U.S. Energy Information Administration, Gasoline and Diesel Fuel Update', url: 'https://www.eia.gov/petroleum/gasdiesel/' },
        { label: 'Larrick, R. P. and Soll, J. B. (2008), The MPG Illusion, Science 320(5883)', url: 'https://doi.org/10.1126/science.1154983' }
      ]
    },
    inputs: [
      { id: 'annualMiles', label: 'Distance driven per year', type: 'number', placeholder: '15000', defaultValue: 15000, step: 500, min: 0, dimension: 'length', unit: 'mi' },
      { id: 'mpg', label: 'Your fuel economy', type: 'number', placeholder: '28', defaultValue: 28, step: 0.5, min: 1, dimension: 'fuelEconomy', unit: 'mpg' },
      { id: 'gasPricePerGallon', label: 'Fuel price', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0, dimension: 'fuelPrice', unit: 'cur/gal' },
      { id: 'comparisonMpg', label: 'Comparison car fuel economy', type: 'number', placeholder: '45', defaultValue: 45, step: 0.5, min: 1, dimension: 'fuelEconomy', unit: 'mpg' }
    ],
    seo: {
      title: 'Fuel Cost Calculator – Yearly Gas Cost & MPG Savings',
      description: 'Free fuel cost calculator: yearly and monthly fuel cost from distance, mpg or L/100 km and fuel price, plus the saving from a more efficient car.',
      faq: [
        { question: 'How do I calculate my yearly fuel cost?', answer: 'Divide the miles you drive in a year by your mpg to get gallons, then multiply by the price per gallon. 15,000 miles at 28 mpg is about 535.7 gallons, or about $2,008.93 a year at $3.75.' },
        { question: 'How much do I save with a more fuel-efficient car?', answer: 'Price the same miles in both cars and subtract. At 15,000 miles and $3.75 a gallon, going from 25 mpg to 40 mpg saves about $843.75 a year, and from 28 mpg to 45 mpg about $758.93.' },
        { question: 'How many miles does the average American drive a year?', answer: 'The Federal Highway Administration puts the average at 13,476 miles per driver, with drivers aged 20 to 54 averaging over 15,000. The EPA’s window sticker assumes 15,000 miles a year.' },
        { question: 'What assumptions does the EPA sticker use for annual fuel cost?', answer: 'The 2026 Fuel Economy Guide assumes 15,000 miles a year, 55% city and 45% highway driving, and $4.33 a gallon for regular gasoline. Your own miles and prices will give a different figure.' },
        { question: 'Can I use liters and kilometers?', answer: 'Yes. Pick km, L/100 km and a price per liter in the menus. 20,000 km at 6.5 L/100 km burns 1,300 liters, which costs 2,340 at 1.80 a liter.' },
        { question: 'Why does a small mpg gain on a thirsty car save so much?', answer: 'Because fuel used is distance divided by mpg. Over 10,000 miles, 10 to 20 mpg saves 500 gallons but 25 to 50 mpg saves 200. Compare gallons, not mpg points.' }
      ]
    },
    compute(values) {
      const gallonsPerYear = values.annualMiles / values.mpg;
      const annualCost = gallonsPerYear * values.gasPricePerGallon;
      const monthlyCost = annualCost / 12;
      const costPerMile = values.gasPricePerGallon / values.mpg;
      const comparisonCost = (values.annualMiles / values.comparisonMpg) * values.gasPricePerGallon;
      const annualSavings = Math.max(0, annualCost - comparisonCost);
      return { gallonsPerYear, annualCost, monthlyCost, costPerMile, comparisonCost, annualSavings };
    }
  }
];
