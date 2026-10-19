import type { CalculatorConfig } from './types.ts';

export const travelCalculators: CalculatorConfig[] = [
  {
    id: 'travel-budget-calculator',
    category: 'travel',
    updatedAt: '2026-09-10',
    aliases: ['trip cost calculator', 'holiday budget calculator', 'vacation cost estimator'],
    related: ['currency-converter', 'visa-stay-days-calculator', 'gas-cost-calculator', 'toll-cost-calculator'],
    title: 'Travel Budget Calculator',
    description: 'Plan your total international travel budget including flights, accommodation, food, activities, and miscellaneous costs.',
    example: 'Budget a 10-day Europe trip: $900 flights, $120/night hotel, $60/day food, $40/day activities.',
    inputs: [
      { id: 'flightCost', label: 'Round-trip flights', type: 'currency', placeholder: '900', defaultValue: 900, step: 50, min: 0 },
      { id: 'nights', label: 'Number of nights', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 },
      { id: 'hotelPerNight', label: 'Accommodation per night', type: 'currency', placeholder: '120', defaultValue: 120, step: 10, min: 0 },
      { id: 'days', label: 'Number of days', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 },
      { id: 'foodPerDay', label: 'Food and drinks per day', type: 'currency', placeholder: '60', defaultValue: 60, step: 5, min: 0 },
      { id: 'activitiesPerDay', label: 'Activities and local transport per day', type: 'currency', placeholder: '40', defaultValue: 40, step: 5, min: 0 },
      { id: 'miscBudget', label: 'Miscellaneous (shopping, tips, SIM, visa)', type: 'currency', placeholder: '200', defaultValue: 200, step: 25, min: 0 },
      { id: 'travelInsurance', label: 'Travel insurance', type: 'currency', placeholder: '80', defaultValue: 80, step: 10, min: 0 }
    ],
    seo: {
      title: 'Travel Budget Calculator – International Trip Planner',
      description: 'Plan your international travel budget with per-night accommodation, daily food, activities, flights, travel insurance, and contingency buffer.',
      faq: [
        { question: 'What should I include in a travel budget?', answer: 'Flights, accommodation, daily food and drink, local transport, activities, travel insurance, visa fees, currency exchange buffer, and shopping.' },
        { question: 'Do I need travel insurance for international travel?', answer: 'Strongly recommended. US health plans rarely cover overseas emergencies. Travel insurance covers medical evacuation, trip cancellation, and lost luggage.' },
        { question: 'How much buffer should I add?', answer: 'Add 10–15% as a contingency buffer for ATM fees, price changes, or unexpected costs.' }
      ]
    },
    compute(values) {
      const accommodation = values.nights * values.hotelPerNight;
      const food = values.days * values.foodPerDay;
      const activities = values.days * values.activitiesPerDay;
      const totalBudget = values.flightCost + accommodation + food + activities + values.miscBudget + values.travelInsurance;
      const perDayCost = totalBudget / Math.max(1, values.days);
      const buffer = totalBudget * 0.1;
      const totalWithBuffer = totalBudget + buffer;
      return { accommodation, food, activities, totalBudget, perDayCost, buffer, totalWithBuffer };
    }
  },
  {
    id: 'visa-stay-days-calculator',
    category: 'travel',
    updatedAt: '2026-09-10',
    aliases: ['schengen calculator', '90/180 day calculator', 'visa days remaining calculator', 'overstay calculator'],
    related: ['date-difference-calculator', 'travel-budget-calculator', 'age-calculator', 'currency-converter'],
    title: 'Visa Stay Days Calculator',
    description: 'Calculate remaining visa days and check whether a planned trip fits within a 90/180-day Schengen rule or other visa windows.',
    example: 'Check if a 30-day trip fits within the 90-day Schengen allowance after 25 days already used.',
    inputs: [
      { id: 'allowedDays', label: 'Total days allowed by visa (e.g. 90)', type: 'number', placeholder: '90', defaultValue: 90, step: 1, min: 1 },
      { id: 'windowDays', label: 'Rolling window in days (e.g. 180 for Schengen)', type: 'number', placeholder: '180', defaultValue: 180, step: 1, min: 1 },
      { id: 'daysAlreadyUsed', label: 'Days already used in current window', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 0 },
      { id: 'plannedTripDays', label: 'Planned trip duration (days)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 }
    ],
    seo: {
      title: 'Visa Stay Days Calculator – Schengen and Travel Visas',
      description: 'Calculate remaining visa days and verify your planned trip fits within Schengen 90/180 rules or other visa allowances.',
      faq: [
        { question: 'What is the Schengen 90/180 rule?', answer: 'Non-EU visitors may stay in the Schengen Area for up to 90 days within any rolling 180-day period. Overstaying can result in fines, deportation, and entry bans.' },
        { question: 'Does a US B-2 visa work the same way?', answer: 'The US typically grants up to 6 months per entry on a B-2 tourist visa. The exact duration is stamped on the I-94 by the CBP officer at entry.' }
      ]
    },
    compute(values) {
      const remaining = Math.max(0, values.allowedDays - values.daysAlreadyUsed);
      const canStay = values.plannedTripDays <= remaining ? 1 : 0;
      const overstayDays = Math.max(0, values.plannedTripDays - remaining);
      const usagePercent = (values.daysAlreadyUsed / values.allowedDays) * 100;
      return { remaining, canStay, overstayDays, usagePercent };
    }
  },
  // Custom-component stub: rendered by a special component in page.tsx.
  {
    id: 'currency-converter',
    category: 'travel',
    updatedAt: '2026-09-10',
    aliases: ['exchange rate calculator', 'money converter', 'forex converter', 'foreign currency calculator'],
    related: ['travel-budget-calculator', 'investment-calculator', 'unit-price-calculator'],
    title: 'Currency Converter',
    description: 'Convert between 30+ world currencies using reference exchange rates. Includes USD, EUR, GBP, JPY, CAD, AUD, INR, and more.',
    example: 'Convert $500 USD to Euros, British Pounds, or Japanese Yen.',
    inputs: [],
    seo: {
      title: 'Currency Converter – 30+ World Currencies',
      description: 'Convert between USD, EUR, GBP, JPY, CAD, AUD, INR, and 25+ more currencies. Quick reference rates for travel and international transfers.',
      faq: [
        { question: 'Are these exchange rates live?', answer: 'These are reference rates for estimation. For transactions, always check your bank, Wise, or Google Finance for the current mid-market rate.' },
        { question: 'What is the mid-market rate?', answer: 'The mid-market rate is the midpoint between buy and sell rates on global currency markets. Banks and money transfer services add a markup (spread) on top of this rate.' },
        { question: 'Which currencies are included?', answer: 'USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, MXN, BRL, KRW, SGD, HKD, and 16 more major currencies.' }
      ]
    },
    compute() { return {}; }
  },
  // Custom-component stub: rendered by a special component in page.tsx.
  {
    id: 'timezone-meeting-planner',
    category: 'travel',
    updatedAt: '2026-09-10',
    aliases: ['time zone converter', 'world clock meeting planner', 'meeting time across time zones'],
    related: ['travel-budget-calculator', 'work-hours-calculator', 'pomodoro-timer', 'meeting-cost-calculator'],
    title: 'Time Zone Meeting Planner',
    description: 'Find a meeting time that works across multiple US and international time zones. See current time in all major zones simultaneously.',
    example: 'Plan a meeting for New York, London, and Tokyo participants.',
    inputs: [],
    seo: {
      title: 'Time Zone Meeting Planner – Global Meeting Scheduler',
      description: 'Plan meetings across US and international time zones. Enter a time and see it converted for New York, London, Paris, Dubai, Mumbai, Singapore, Tokyo, Sydney, and more.',
      faq: [
        { question: 'What are the US time zones?', answer: 'The contiguous US has 4 zones: Eastern (ET, UTC-5/-4), Central (CT, UTC-6/-5), Mountain (MT, UTC-7/-6), and Pacific (PT, UTC-8/-7). Alaska and Hawaii have their own zones.' },
        { question: 'What is UTC?', answer: 'UTC (Coordinated Universal Time) is the global time standard. US Eastern time is UTC-5 in winter (EST) and UTC-4 in summer (EDT) due to daylight saving time.' },
        { question: 'When does daylight saving time change in the US?', answer: 'US clocks spring forward the second Sunday in March and fall back the first Sunday in November. Not all states observe DST — Arizona (except Navajo Nation) and Hawaii do not.' }
      ]
    },
    compute() { return {}; }
  }
];
