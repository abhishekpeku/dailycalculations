import type { CalculatorConfig } from './types.ts';

export const autoCalculators: CalculatorConfig[] = [
  {
    id: 'car-payment-calculator',
    category: 'auto',
    updatedAt: '2026-09-10',
    aliases: ['auto loan calculator', 'car loan calculator', 'vehicle finance calculator', 'monthly car payment estimator'],
    related: ['loan-calculator', 'emi-calculator', 'commute-cost-calculator', 'fuel-cost-calculator'],
    redirectFrom: ['auto-loan-calculator', 'car-loan-calculator'],
    title: 'Car Payment Calculator',
    description: 'Estimate monthly car loan payments based on price, APR, and term.',
    example: 'Estimate payments for a $28,000 car with 4.5% APR over 6 years.',
    inputs: [
      { id: 'carPrice', label: 'Car price', type: 'currency', placeholder: '28000', defaultValue: 28000, step: 100, min: 0 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '4000', defaultValue: 4000, step: 100, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate', type: 'percent', placeholder: '4.5', defaultValue: 4.5, step: 0.01, min: 0 },
      { id: 'years', label: 'Loan term (years)', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 1 }
    ],
    seo: {
      title: 'Car Payment Calculator',
      description: 'Calculate your monthly car payment for any auto loan. Enter the vehicle price, down payment, APR, and loan term to see the payment, total cost, and total interest.',
      faq: [
        { question: 'How do I calculate a car payment?', answer: 'Enter the car price, down payment, APR, and loan term to estimate the monthly cost.' },
        { question: 'Does this calculator handle auto loans?', answer: 'Yes, it works with fixed-rate auto loan values.' }
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
    updatedAt: '2026-09-10',
    aliases: ['gas trip calculator', 'road trip fuel calculator', 'gas mileage cost calculator'],
    related: ['fuel-cost-calculator', 'commute-cost-calculator', 'travel-budget-calculator', 'toll-cost-calculator'],
    title: 'Gas Cost Calculator',
    description: 'Estimate fuel cost for a trip using distance, MPG, and fuel price.',
    example: 'Calculate fuel cost for a 180-mile trip at 28 MPG and $3.75 per gallon.',
    inputs: [
      { id: 'distance', label: 'Distance (miles)', type: 'number', placeholder: '180', defaultValue: 180, step: 1, min: 0 },
      { id: 'mpg', label: 'Vehicle MPG', type: 'number', placeholder: '28', defaultValue: 28, step: 0.1, min: 1 },
      { id: 'pricePerGallon', label: 'Fuel price', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Gas Cost Calculator',
      description: 'Estimate the fuel cost of any road trip before you leave. Enter the distance, your vehicle MPG, and the price per gallon to see the total cost and gallons needed.',
      faq: [
        { question: 'How do I estimate gas cost?', answer: 'Divide distance by MPG, then multiply by fuel price to estimate total cost.' },
        { question: 'Is this useful for trip planning?', answer: 'Yes, it helps compare fuel expenses for different trips and vehicles.' }
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
    updatedAt: '2026-09-10',
    aliases: ['electric car charging cost', 'ev running cost calculator', 'kwh charging calculator'],
    related: ['fuel-cost-calculator', 'electricity-bill-calculator', 'commute-cost-calculator', 'gas-cost-calculator'],
    title: 'EV Charging Cost Calculator',
    description: 'Estimate the cost to charge an electric vehicle at home or at a public charger, and compare to gas costs.',
    example: 'Calculate the cost to charge a Tesla Model 3 (75 kWh battery) at home at $0.16/kWh.',
    inputs: [
      { id: 'batteryKwh', label: 'Battery capacity (kWh)', type: 'number', placeholder: '75', defaultValue: 75, step: 0.5, min: 1 },
      { id: 'chargePercent', label: 'Charge from % to 100% (enter starting %)', type: 'number', placeholder: '20', defaultValue: 20, step: 5, min: 0 },
      { id: 'electricityRate', label: 'Electricity rate ($/kWh)', type: 'currency', placeholder: '0.16', defaultValue: 0.16, step: 0.01, min: 0 },
      { id: 'efficiency', label: 'Vehicle efficiency (miles per kWh)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1, min: 0.1 },
      { id: 'gasPricePerGallon', label: 'Gas price for comparison ($/gallon)', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0 },
      { id: 'gasMpg', label: 'Gas vehicle MPG for comparison', type: 'number', placeholder: '32', defaultValue: 32, step: 1, min: 1 }
    ],
    seo: {
      title: 'EV Charging Cost Calculator – Home and Public Charging',
      description: 'Calculate the electricity cost to charge your EV and compare savings vs gasoline. Uses your local electricity rate and vehicle efficiency.',
      faq: [
        { question: 'What is the average US home electricity rate?', answer: 'The US average is approximately $0.16/kWh as of 2025, but varies widely — Hawaii is ~$0.39/kWh while Louisiana is ~$0.11/kWh.' },
        { question: 'How much does it cost to fully charge an EV at home?', answer: 'A 75 kWh battery charged from empty costs $9–$15 at typical US home rates — far less than a tank of gas for comparable range.' },
        { question: 'Are public chargers more expensive than home charging?', answer: 'Yes. DC fast chargers (Tesla Supercharger, Electrify America) typically cost $0.30–$0.50/kWh, making them 2–3× more expensive than home charging.' }
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
    updatedAt: '2026-09-10',
    aliases: ['cost of commuting calculator', 'daily travel cost calculator', 'work travel expense calculator'],
    related: ['fuel-cost-calculator', 'toll-cost-calculator', 'ev-charging-calculator', 'paycheck-calculator'],
    title: 'Commute Cost Calculator',
    description: 'Calculate the full cost of your daily commute including fuel, tolls, parking, public transit, and vehicle wear.',
    example: 'Find monthly commute cost for a 25-mile round trip at 30 MPG with $15/day parking and $3 tolls.',
    inputs: [
      { id: 'roundTripMiles', label: 'Round-trip commute distance', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 0, dimension: 'length', unit: 'mi' },
      { id: 'mpg', label: 'Vehicle fuel economy', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1, dimension: 'fuelEconomy', unit: 'mpg' },
      { id: 'gasPricePerGallon', label: 'Gas price ($/gallon)', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0 },
      { id: 'daysPerMonth', label: 'Commute days per month', type: 'number', placeholder: '22', defaultValue: 22, step: 1, min: 1 },
      { id: 'dailyParking', label: 'Daily parking cost', type: 'currency', placeholder: '15', defaultValue: 0, step: 1, min: 0 },
      { id: 'dailyTolls', label: 'Daily tolls', type: 'currency', placeholder: '3', defaultValue: 0, step: 0.25, min: 0 },
      { id: 'wearCostPerMile', label: 'Vehicle wear cost per mile (IRS: $0.21)', type: 'currency', placeholder: '0.21', defaultValue: 0.21, step: 0.01, min: 0 }
    ],
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
    seo: {
      title: 'Commute Cost Calculator – Full Monthly and Annual Cost',
      description: 'Calculate the true cost of commuting including gas, tolls, parking, and vehicle wear. Compare driving vs public transit.',
      faq: [
        { question: 'What is the IRS mileage rate?', answer: 'The IRS standard mileage rate for 2025 is $0.70 per mile for business driving. The vehicle wear/depreciation component is approximately $0.21/mile.' },
        { question: 'What is the average US commute cost?', answer: 'The average American spends $2,000–$5,000 per year on commuting depending on location, distance, and mode of transportation.' },
        { question: 'Can I deduct commuting costs?', answer: 'Ordinary commuting from home to a regular workplace is not deductible. However, if you work from home and travel to a client site, those miles may qualify as business travel.' }
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
    updatedAt: '2026-09-10',
    aliases: ['petrol cost calculator', 'diesel cost calculator', 'trip fuel calculator', 'mpg cost calculator'],
    related: ['gas-cost-calculator', 'commute-cost-calculator', 'ev-charging-calculator', 'toll-cost-calculator'],
    title: 'Fuel Cost Calculator',
    description: 'Calculate annual fuel costs for your vehicle based on mileage, MPG, and gas prices. Compare gas vs diesel vs hybrid savings.',
    example: 'Find annual fuel cost for a vehicle driven 15,000 miles/year at 28 MPG and $3.75/gallon.',
    inputs: [
      { id: 'annualMiles', label: 'Annual miles driven', type: 'number', placeholder: '15000', defaultValue: 15000, step: 500, min: 0 },
      { id: 'mpg', label: 'Vehicle MPG', type: 'number', placeholder: '28', defaultValue: 28, step: 0.5, min: 1 },
      { id: 'gasPricePerGallon', label: 'Gas price ($/gallon)', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0 },
      { id: 'comparisonMpg', label: 'Comparison vehicle MPG (optional)', type: 'number', placeholder: '45', defaultValue: 45, step: 0.5, min: 1 }
    ],
    seo: {
      title: 'Fuel Cost Calculator – Annual Gas Savings and MPG Comparison',
      description: 'Calculate your annual fuel cost and compare fuel expenses between two vehicles. See how much you save by switching to a more fuel-efficient car.',
      faq: [
        { question: 'What is the average US gas price?', answer: 'US average gasoline prices fluctuate. Regular unleaded has averaged $3.00–$4.00/gallon in recent years. Check GasBuddy or AAA for current local prices.' },
        { question: 'How many miles does the average American drive per year?', answer: 'The US average is approximately 14,000–15,000 miles per year, but commuters in car-dependent areas often drive 20,000+ miles.' },
        { question: 'How much do I save with a fuel-efficient car?', answer: 'Switching from 25 MPG to 40 MPG saves about $900/year at $3.75/gallon driving 15,000 miles. Hybrids and EVs can save $1,500–$2,500 annually over average gas vehicles.' }
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
