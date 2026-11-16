import type { CalculatorConfig } from './types.ts';
import { TIPPING_COUNTRY_OPTIONS, TIPPING_NOTE_LABELS, tippingPercentForCode } from '../../lib/tippingNorms.ts';

export const travelCalculators: CalculatorConfig[] = [
  {
    id: 'travel-budget-calculator',
    category: 'travel',
    group: 'Trip Planning',
    glyph: '$',
    updatedAt: '2026-10-21',
    aliases: ['trip cost calculator', 'holiday budget calculator', 'vacation cost estimator', 'how much does a trip cost'],
    related: ['currency-converter', 'visa-stay-days-calculator', 'gas-cost-calculator', 'toll-cost-calculator'],
    title: 'Travel Budget Calculator',
    description: 'Plan your total international travel budget including flights, accommodation, food, activities, and miscellaneous costs, with a visual breakdown by category and a contingency buffer.',
    example: 'A 10-day Europe trip — $900 flights, $120/night hotel, $60/day food, $40/day activities, $200 misc, $80 insurance — totals $3,380, or $3,718 with a 10% buffer.',
    breakdown: {
      headline: 'totalBudget',
      headlineLabel: 'Total trip budget',
      outputs: [
        { id: 'totalBudget', label: 'Total trip budget', format: 'currency' },
        { id: 'perDayCost', label: 'Average cost per day', format: 'currency' },
        { id: 'buffer', label: 'Suggested contingency buffer (10%)', format: 'currency' },
        { id: 'totalWithBuffer', label: 'Total with contingency buffer', format: 'currency' }
      ],
      groups: [
        { title: 'Flights and trip length', inputs: ['flightCost', 'nights', 'days'] },
        { title: 'Daily costs', inputs: ['hotelPerNight', 'foodPerDay', 'activitiesPerDay'] },
        { title: 'Other costs', inputs: ['miscBudget', 'travelInsurance'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'flightCost', label: 'Flights' },
          { from: 'accommodation', label: 'Accommodation' },
          { from: 'food', label: 'Food and drinks' },
          { from: 'activities', label: 'Activities and local transport' },
          { from: 'miscBudget', label: 'Miscellaneous' },
          { from: 'travelInsurance', label: 'Travel insurance' }
        ],
        center: 'totalBudget',
        centerSub: 'total budget'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What belongs in a travel budget',
        paragraphs: [
          'A realistic travel budget is a handful of categories added together, each estimated separately because they behave differently: flights and insurance are paid once up front, accommodation and food scale with the number of nights and days, and a miscellaneous line catches the small purchases — a SIM card, a visa fee, souvenirs — that are easy to forget individually but add up in total.',
          'Per-day averages are useful for comparing trips or destinations, but they can be misleading on their own. A $900 flight and $80 of insurance are fixed costs that do not change whether the trip is 5 days or 15, so the per-day figure drops as the trip gets longer even though nothing about daily spending changed.',
          'A contingency buffer — commonly 10 to 15% of the total — covers the gap between an estimate and reality: a higher exchange rate on the day you withdraw cash, a restaurant that costs more than planned, or an activity added once you arrive. Building it in from the start avoids the budget quietly running out near the end of the trip.'
        ]
      },
      howTo: {
        intro: 'Enter each cost category. The total, the average per day, and a suggested buffer are calculated as you type.',
        steps: [
          { name: 'Enter flights and trip length', text: 'Type the round-trip flight cost, the number of nights (for lodging) and days (for food and activities) — these are sometimes the same number, sometimes not, depending on arrival and departure times.' },
          { name: 'Enter daily costs', text: 'Accommodation per night, food and drinks per day, and activities and local transport per day. These are multiplied by nights or days automatically.' },
          { name: 'Enter other costs', text: 'A miscellaneous allowance for shopping, tips, a SIM card or visa fees, plus travel insurance.' },
          { name: 'Read the total', text: 'The headline is the total budget before any buffer. The donut shows how it splits across categories.' },
          { name: 'Check the buffer', text: 'The suggested buffer adds 10% on top, and the final row shows the total with that buffer included.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each daily category is multiplied by its own day count, then every category is added together. The buffer is a flat percentage on top.',
        expression:
          'accommodation = nights × hotelPerNight\nfood = days × foodPerDay\nactivities = days × activitiesPerDay\ntotalBudget = flightCost + accommodation + food + activities + miscBudget + travelInsurance\nperDayCost = totalBudget ÷ days\nbuffer = totalBudget × 10%\ntotalWithBuffer = totalBudget + buffer',
        terms: [
          { symbol: 'nights', meaning: 'Nights of paid accommodation — often one less than the number of days, since the last day is usually a departure.' },
          { symbol: 'days', meaning: 'Full days of the trip, used for food and activity costs.' },
          { symbol: 'buffer', meaning: 'A 10% contingency on the total, a common starting point for unplanned costs.' }
        ],
        note: 'Estimates only. Actual trip costs depend on your destination, season, exchange rates on the day you spend, and personal spending habits.'
      },
      workedExample: {
        intro: 'A 10-day trip to Europe: $900 round-trip flights, 10 nights at $120, $60 a day for food, $40 a day for activities, $200 miscellaneous, and $80 of travel insurance.',
        rows: [
          { label: 'Accommodation (10 nights × $120)', value: '$1,200.00' },
          { label: 'Food (10 days × $60)', value: '$600.00' },
          { label: 'Activities (10 days × $40)', value: '$400.00' },
          { label: 'Total (900 + 1,200 + 600 + 400 + 200 + 80)', value: '$3,380.00' },
          { label: 'Average per day (3,380 ÷ 10)', value: '$338.00' },
          { label: 'Buffer (10% of 3,380)', value: '$338.00' },
          { label: 'Total with buffer (3,380 + 338)', value: '$3,718.00' }
        ],
        result: 'Total budget $3,380.00 · $3,718.00 with a 10% buffer',
        explanation: 'Flights and insurance ($980 together) are fixed regardless of trip length, while accommodation, food and activities ($2,200) scale with nights and days. Extending the trip to 14 days without changing the flight or insurance would raise the total to $4,180 but drop the per-day average, since the fixed costs spread over more days.'
      },
      watchOut: [
        { title: 'Travel insurance is easy to skip and expensive to need', body: 'Original Medicare generally does not cover care received outside the United States, and many domestic health plans have limited or no coverage abroad. A medical evacuation alone can cost far more than a policy.' },
        { title: 'Per-day cost hides front-loaded expenses', body: 'Flights and insurance are paid once. A low per-day average on a long trip does not mean a short version of the same trip would be proportionally cheaper.' },
        { title: 'Exchange rates and card fees add a hidden cost', body: 'Converting currency and foreign card transactions often carry a markup. Budgeting the buffer partly for this, rather than assuming the quoted price is the final price, avoids surprises.' },
        { title: 'The 10% buffer is a starting point, not a rule', body: 'Trips to destinations with volatile prices, a packed itinerary of paid activities, or a first-time destination you know little about may warrant 15–20% instead.' },
        { title: 'Register your trip for safety alerts', body: 'For international travel, checking government travel advisories and enrolling in a free alert program for your destination, where available, is a low-cost way to get updates during the trip.' }
      ],
      references: [
        { label: 'Centers for Disease Control and Prevention, Travel Insurance, Travel Health Insurance, and Medical Evacuation Insurance (Yellow Book)', url: 'https://www.cdc.gov/yellow-book/hcp/health-care-abroad/travel-insurance.html' },
        { label: 'USA.gov, See Travel Advisories and Register in STEP', url: 'https://www.usa.gov/travel-advisory' }
      ]
    },
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
      description: 'Plan your international travel budget with per-night accommodation, daily food, activities, flights, travel insurance, and a contingency buffer, broken down by category.',
      faq: [
        { question: 'What should I include in a travel budget?', answer: 'Flights, accommodation, daily food and drink, local transport, activities, travel insurance, visa fees, a currency exchange buffer, and shopping.' },
        { question: 'Do I need travel insurance for international travel?', answer: 'Strongly recommended. Original Medicare and many US health plans provide limited or no coverage for care received outside the United States, so travel insurance can be the difference between a bill and a covered claim for a medical emergency, evacuation, trip cancellation or lost luggage.' },
        { question: 'How much buffer should I add?', answer: 'A common starting point is 10–15% of the total for ATM fees, price changes or unexpected costs. The worked example adds 10% to a $3,380 budget for a total of $3,718.' },
        { question: 'How is the total budget calculated?', answer: 'Accommodation (nights × nightly rate), food and activities (days × daily rate) are each totaled, then added to flights, miscellaneous spending and insurance. A 10-day trip at $900 flights, $120/night, $60/day food and $40/day activities, plus $200 misc and $80 insurance, totals $3,380.' },
        { question: 'Why are nights and days separate fields?', answer: 'They are often different numbers. A trip with 10 nights of hotel stays might span 11 days including arrival and departure, so nights drive accommodation cost while days drive food and activity cost.' },
        { question: 'Does the per-day cost apply evenly across the trip?', answer: 'No. Flights and insurance are one-time costs, so the real daily spend is higher on a short trip and lower on a long one even with identical daily habits. The per-day figure is useful for comparing trips, not for predicting any single day\'s spending.' },
        { question: 'Should I budget for currency exchange costs?', answer: 'Yes. Converting cash and using cards abroad often carries a markup over the market rate. Folding an allowance for this into the miscellaneous category or the contingency buffer avoids an underestimate.' }
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
    group: 'Trip Planning',
    glyph: 'days',
    updatedAt: '2026-10-21',
    aliases: ['schengen calculator', '90/180 day calculator', 'visa days remaining calculator', 'overstay calculator'],
    related: ['date-difference-calculator', 'travel-budget-calculator', 'age-calculator', 'currency-converter'],
    title: 'Visa Stay Days Calculator',
    description: 'Calculate remaining visa days and check whether a planned trip fits within a 90/180-day Schengen-style allowance or other visa windows. Not legal advice — confirm with the official authority.',
    example: 'A 30-day trip after 25 days already used fits a 90-day Schengen allowance, with 65 days remaining and 61% of the allowance used once the trip is taken.',
    breakdown: {
      headline: 'remaining',
      headlineLabel: 'Days remaining in your current allowance',
      outputs: [
        { id: 'remaining', label: 'Days remaining in your current allowance', format: 'integer' },
        { id: 'overstayDays', label: 'Days over the limit if you take the full trip', format: 'integer' },
        { id: 'usagePercent', label: 'Already used (of your allowance)', format: 'percent' },
        { id: 'projectedUsagePercent', label: 'This trip\'s share of your allowance', format: 'percent' }
      ],
      groups: [
        { title: 'Your allowance', inputs: ['allowedDays', 'windowDays'] },
        { title: 'Your trip', inputs: ['daysAlreadyUsed', 'plannedTripDays'] }
      ],
      derive: (values) => ({ projectedUsagePercent: ((values.daysAlreadyUsed + values.plannedTripDays) / values.allowedDays) * 100 }),
      visual: {
        type: 'rangeBar',
        value: 'projectedUsagePercent',
        bands: [
          { label: 'Within your allowance', min: 0, max: 100 },
          { label: 'Over the limit', min: 100, max: 200 }
        ],
        title: 'This trip\'s share of your allowance',
        valueLabel: 'of your allowance after this trip'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How a "days allowed in a window" visa rule works',
        paragraphs: [
          'Many short-stay visa and visa-waiver rules are not a simple annual quota — they allow a set number of days within a rolling window of time, and once a day of presence "ages out" of the window it no longer counts against the limit. The best-known example is the Schengen Area\'s 90/180-day rule: non-EU visitors may stay up to 90 days within any 180-day period, calculated on a rolling basis rather than a fixed calendar quarter.',
          'This calculator generalizes that pattern: an allowance (days allowed, e.g. 90), a window (the rolling period, e.g. 180 days), days you have already used in the current window, and a planned trip length. It tells you the days remaining, whether the planned trip fits, and how much of the allowance the trip would use if taken.',
          'This is a simplified model, not a legal determination. The actual Schengen calculation checks every single day in the rolling window, which can give a different answer near the edges than a plain running total. For anything beyond a quick estimate, use the official EU calculator and confirm with the consulate or border authority for your specific situation.'
        ]
      },
      howTo: {
        intro: 'Enter your allowance and window, how many days you have already used, and your planned trip length.',
        steps: [
          { name: 'Enter your allowance', text: 'The total days allowed (90 for the Schengen Area) and the rolling window it applies within (180 days for Schengen).' },
          { name: 'Enter days already used', text: 'Count the days you have already spent in the area within the current window.' },
          { name: 'Enter your planned trip', text: 'How many additional days you intend to stay.' },
          { name: 'Read the result', text: 'Days remaining is the headline. If the planned trip exceeds it, the overstay row shows by how many days.' },
          { name: 'Check the bar', text: 'The bar shows what share of your allowance this trip would use if you take it in full, and flags when it goes over 100%.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored. This is not legal advice.'
      },
      formula: {
        intro: 'Days remaining is the allowance minus what has already been used. Comparing the planned trip against that remainder shows whether it fits.',
        expression:
          'remaining = allowedDays − daysAlreadyUsed\noverstayDays = max(0, plannedTripDays − remaining)\nusagePercent = daysAlreadyUsed ÷ allowedDays × 100\nprojectedUsagePercent = (daysAlreadyUsed + plannedTripDays) ÷ allowedDays × 100',
        terms: [
          { symbol: 'allowedDays', meaning: 'Total days you may stay within the window (90 for the Schengen 90/180 rule).' },
          { symbol: 'windowDays', meaning: 'The rolling period the allowance applies within (180 days for Schengen).' },
          { symbol: 'daysAlreadyUsed', meaning: 'Days you have already spent in the area within the current window.' }
        ],
        note: 'Not legal advice. This is a simplified running-total model, not the official day-by-day rolling calculation. Confirm any real travel plan with the official EU short-stay calculator or the relevant consulate or border authority.'
      },
      workedExample: {
        intro: 'You have already used 25 of a 90-day Schengen allowance and plan a 30-day trip. Does it fit?',
        rows: [
          { label: 'Days remaining (90 − 25)', value: '65 days' },
          { label: 'Planned trip vs. remaining (30 ≤ 65)', value: 'Fits' },
          { label: 'Overstay if taken in full', value: '0 days' },
          { label: 'Already used (25 ÷ 90)', value: '27.78%' },
          { label: 'Projected use after this trip ((25 + 30) ÷ 90)', value: '61.11%' }
        ],
        result: '65 days remaining · the 30-day trip fits · 61.11% of the allowance used afterward',
        explanation: 'Because 30 days is less than the 65 remaining, the trip fits with 35 days to spare (65 − 30). A 70-day trip instead of 30 would not fit: it would exceed the 65 remaining by 5 days, which the overstay row would show directly.'
      },
      watchOut: [
        { title: 'Not legal advice', body: 'This is a planning estimate, not a determination of your legal right to enter or remain anywhere. Immigration consequences — fines, deportation, future entry bans — can be serious, so confirm real plans with the official EU short-stay calculator or the relevant consulate or border authority.' },
        { title: 'The real Schengen rule is a rolling window, not a running total', body: 'Days age out of the 180-day window individually as time passes, which can give a different answer near the edges than this calculator\'s simplified running total, especially for people who cross in and out of the area repeatedly.' },
        { title: 'Border records are authoritative, not your own count', body: 'Entry and exit stamps (or, in the US, the electronic I-94 record) are what an officer checks, not a personal spreadsheet. Keep your own count as a planning tool, and verify against official records when possible.' },
        { title: 'Other visas use different numbers', body: 'A US B-2 tourist visa, for example, does not use a 90/180 structure — the authorized stay is typically stamped on arrival and can run up to six months per entry. Enter the actual allowance and window for whichever visa applies.' },
        { title: 'The window and allowance are not fixed at 90/180', body: 'Change them to model a different visa regime. The math is the same; only the two numbers differ.' }
      ],
      references: [
        { label: 'European Commission, Migration and Home Affairs, Short-stay calculator', url: 'https://home-affairs.ec.europa.eu/policies/schengen/border-crossing/short-stay-calculator_en' },
        { label: 'U.S. Customs and Border Protection, I-94 Traveler Compliance', url: 'https://www.cbp.gov/travel/international-visitors/i-94/traveler-compliance' }
      ]
    },
    inputs: [
      { id: 'allowedDays', label: 'Total days allowed by visa (e.g. 90)', type: 'number', placeholder: '90', defaultValue: 90, step: 1, min: 1 },
      { id: 'windowDays', label: 'Rolling window in days (e.g. 180 for Schengen)', type: 'number', placeholder: '180', defaultValue: 180, step: 1, min: 1 },
      { id: 'daysAlreadyUsed', label: 'Days already used in current window', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 0 },
      { id: 'plannedTripDays', label: 'Planned trip duration (days)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 }
    ],
    seo: {
      title: 'Visa Stay Days Calculator – Schengen 90/180 and Travel Visas',
      description: 'Calculate remaining visa days and check whether a planned trip fits a Schengen-style 90/180 rule or other visa allowance. Not legal advice — confirm with the official authority.',
      faq: [
        { question: 'What is the Schengen 90/180 rule?', answer: 'Non-EU visitors may generally stay in the Schengen Area for up to 90 days within any rolling 180-day period. Overstaying can result in fines, deportation and future entry bans.' },
        { question: 'Is this calculator legal advice?', answer: 'No. It is a simplified planning estimate. For an exact, day-by-day determination, use the official EU short-stay calculator and confirm with the relevant consulate or border authority before booking travel.' },
        { question: 'How many days are remaining if I have used 25 of a 90-day allowance?', answer: '90 − 25 = 65 days remaining. A planned 30-day trip fits comfortably within that, using 61.11% of the full allowance once taken.' },
        { question: 'Does this calculate the real rolling 180-day window exactly?', answer: 'Not precisely. The official rule checks every day within the rolling window individually, which can differ from this calculator\'s simplified running total near the edges, especially with multiple trips in and out of the area. The official EU calculator is built for that exact calculation.' },
        { question: 'Does a US B-2 visa work the same way?', answer: 'No. The US typically grants up to 6 months per entry on a B-2 tourist visa, stamped on the electronic I-94 record at entry, rather than a 90/180-style rolling window. Enter the actual numbers for your visa type.' },
        { question: 'What happens if I overstay?', answer: 'Consequences vary by country but can include fines, removal, and bans on future entry for a period of time. Treat any overstayDays figure above zero as a signal to re-plan the trip, not a number to push past.' },
        { question: 'Can I use this for a visa that is not 90/180?', answer: 'Yes. The allowance and window fields are both adjustable, so the same math applies to any "X days within Y days" rule — just enter the actual figures for your visa.' }
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
  // Custom-component stub: rendered by a special component in page.tsx. v2 content + restyle in step 39.
  {
    id: 'currency-converter',
    category: 'travel',
    group: 'Currency & Time Zones',
    glyph: 'FX',
    updatedAt: '2026-10-21',
    aliases: ['exchange rate calculator', 'money converter', 'forex converter', 'foreign currency calculator'],
    related: ['travel-budget-calculator', 'investment-calculator', 'unit-price-calculator'],
    title: 'Currency Converter',
    description: 'Convert between 30+ world currencies using fixed, static reference rates — not live market data. Rates are indicative only and show the date they were last checked.',
    example: '$500 USD converts to about €460.00 EUR, £395.00 GBP, or ¥74,750 JPY at the static reference rates shown on the page, last checked October 21, 2026.',
    inputs: [],
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What this converter shows, and what it does not',
        paragraphs: [
          'An exchange rate is the price of one currency in terms of another. The "mid-market rate" — the midpoint between what currency traders buy and sell at on global markets — is the benchmark most financial sites quote, and it is what official sources like a central bank\'s daily reference rate are based on. Banks, card networks and money-transfer services then add their own markup on top of it for any real transaction.',
          'This page uses a fixed table of reference rates rather than a live feed. Every conversion is still exact arithmetic — amount ÷ rate(from) × rate(to) — but the rates themselves are static values checked and set on the date shown on the page, not pulled from the market at the moment you load it. That makes the tool fine for a rough estimate or for comparing several currencies at once, and unsuitable for anything where today\'s exact rate matters.',
          'For an actual transaction — booking in a foreign currency, sending money abroad, or converting cash — check a live source. The US Federal Reserve and the European Central Bank both publish official daily or weekly reference rates, and your own bank or card issuer can tell you the exact rate (including any markup) it will apply.'
        ]
      },
      howTo: {
        intro: 'Enter an amount, choose the two currencies, and the converted amount updates as you type.',
        steps: [
          { name: 'Enter an amount', text: 'Type the amount you want to convert, in the "From" currency.' },
          { name: 'Choose the currencies', text: 'Pick the currency you are converting from and the one you want it in.' },
          { name: 'Read the result', text: 'The converted amount is the headline, with the rate shown both ways underneath.' },
          { name: 'Swap or browse', text: 'Use the swap button to flip the two currencies, or click a popular conversion to jump straight to it.' },
          { name: 'Check the as-of date', text: 'The banner and footer both show when these reference rates were last checked — treat anything older than a few weeks with extra caution.' }
        ],
        outro: 'Everything is calculated in your browser from the fixed rate table. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every rate in the table is relative to the US dollar, so any pair converts through the dollar as a common anchor.',
        expression: 'amountInUSD = amount ÷ rate(from)\nconverted = amountInUSD × rate(to)\nrate(from → to) = rate(to) ÷ rate(from)',
        terms: [
          { symbol: 'rate(code)', meaning: 'Units of that currency per 1 US dollar in the static table, e.g. rate(EUR) = 0.92.' },
          { symbol: 'amountInUSD', meaning: 'The entered amount converted to dollars first, regardless of which two currencies are actually being converted.' }
        ],
        note: 'These are fixed reference rates, not live data. They are not suitable for pricing a real transaction, which will use the market rate at that moment plus whatever markup your bank, card network or transfer service applies.'
      },
      workedExample: {
        intro: 'Converting $500 USD using the static table (EUR 0.92, GBP 0.79, JPY 149.5 per US dollar).',
        rows: [
          { label: '500 USD in dollars (500 ÷ rate(USD) = 500 ÷ 1)', value: '500.00' },
          { label: 'In EUR (500 × 0.92)', value: '€460.00' },
          { label: 'In GBP (500 × 0.79)', value: '£395.00' },
          { label: 'In JPY (500 × 149.5)', value: '¥74,750' },
          { label: '1 EUR in USD (1 ÷ 0.92)', value: '$1.0870' }
        ],
        result: '$500 ≈ €460.00 ≈ £395.00 ≈ ¥74,750 at these static rates',
        explanation: 'Every figure comes from the same USD-anchored table, so converting EUR directly to GBP gives the same answer as going through USD: 460 EUR × (0.79 ÷ 0.92) ≈ 395 GBP, matching the direct 500 USD → GBP conversion.'
      },
      watchOut: [
        { title: 'These rates are static, not live', body: `They are fixed reference values last checked ${new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date('2026-10-21T00:00:00Z'))}, not a live market feed. Real exchange rates move throughout every trading day.` },
        { title: 'Never use this for an actual transaction', body: 'Booking travel, sending money, or converting cash should use a live rate from your bank, card issuer, or a live market source — not this page\'s fixed table.' },
        { title: 'Real transactions add a markup', body: 'Banks and money-transfer services charge a spread on top of the mid-market rate, plus sometimes a flat fee. The rate you are quoted for an actual transfer will not exactly match any mid-market figure, live or static.' },
        { title: 'Large moves happen between updates', body: 'Currency markets can move several percent around major economic news. A rate checked weeks ago can be meaningfully stale even if nothing looks obviously wrong.' },
        { title: 'Rounding compounds on small amounts', body: 'For very small conversions, the displayed rounding (2–4 decimal places) can shift the last digit of the result compared to an unrounded calculation.' }
      ],
      references: [
        { label: 'Board of Governors of the Federal Reserve System, H.10 Foreign Exchange Rates', url: 'https://www.federalreserve.gov/releases/h10/' },
        { label: 'European Central Bank, Euro Foreign Exchange Reference Rates', url: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html' }
      ]
    },
    seo: {
      title: 'Currency Converter – 30+ World Currencies (Static Reference Rates)',
      description: 'Convert between USD, EUR, GBP, JPY, CAD, AUD, INR, and 25+ more currencies using fixed reference rates. Clearly marked as static, not live — check the as-of date on the page.',
      faq: [
        { question: 'Are these exchange rates live?', answer: 'No. These are fixed reference rates for estimation, last checked on the date shown on the page. For a transaction, always check your bank, card issuer, or a live market source such as the Federal Reserve\'s or European Central Bank\'s published daily rates.' },
        { question: 'What is the mid-market rate?', answer: 'The mid-market rate is the midpoint between buy and sell rates on global currency markets — the benchmark figure before any markup. Banks and money-transfer services add a spread on top of it for real transactions.' },
        { question: 'Which currencies are included?', answer: 'USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, MXN, BRL, KRW, SGD, HKD, and 16 more major currencies, all referenced against the US dollar.' },
        { question: 'How is a conversion calculated from the static table?', answer: 'The amount is converted to US dollars first (amount ÷ rate of the "from" currency), then to the target currency (× rate of the "to" currency). $500 at a EUR rate of 0.92 converts to €460.00.' },
        { question: 'Why does the page keep saying "not live"?', answer: 'Because these rates do not update automatically and are not pulled from a market feed. Treating a static rate as live risks a real financial mistake, so the page states the as-of date wherever the rate appears.' },
        { question: 'Where can I find a live exchange rate?', answer: 'The Federal Reserve publishes a weekly H.10 release of official foreign exchange rates, and the European Central Bank publishes daily euro reference rates. Your bank or card issuer can quote the exact rate, including any markup, for your transaction.' },
        { question: 'Why is the popular conversions list different for each currency?', answer: 'It shows common currencies converted from whatever amount and "from" currency you have entered, so it updates to stay relevant as you change either field.' }
      ]
    },
    compute() { return {}; }
  },
  // Custom-component stub: rendered by a special component in page.tsx. v2 content + restyle in step 39.
  {
    id: 'timezone-meeting-planner',
    category: 'travel',
    group: 'Currency & Time Zones',
    glyph: 'TZ',
    updatedAt: '2026-10-21',
    aliases: ['time zone converter', 'world clock meeting planner', 'meeting time across time zones', 'utc converter'],
    related: ['travel-budget-calculator', 'work-hours-calculator', 'pomodoro-timer', 'meeting-cost-calculator'],
    title: 'Time Zone Meeting Planner',
    description: 'Find a meeting time that works across multiple US and international time zones, with working-hours color coding and automatic daylight saving handling from the IANA time zone database.',
    example: 'A 9:00 a.m. New York meeting is 2:00 p.m. in London and 10:00 p.m. in Tokyo, with daylight saving applied automatically for whichever zones observe it.',
    inputs: [],
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How time zone conversion actually works',
        paragraphs: [
          'A time zone is an offset from Coordinated Universal Time (UTC) that a region has agreed to use, and many regions shift that offset twice a year for daylight saving time (DST). Converting a time from one zone to another means finding both zones\' current offset from UTC — which depends on the date, not just the zone itself — and applying the difference.',
          'Software gets this right by using the IANA Time Zone Database (often called "tz" or "zoneinfo"), a continuously maintained public record of every zone\'s history of offsets and daylight saving rules worldwide. Browsers and most programming languages ship a copy of it, which is what this page relies on rather than hand-coding each zone\'s rules.',
          'In the US, daylight saving time begins at 2:00 a.m. on the second Sunday of March and ends at 2:00 a.m. on the first Sunday of November, under the Energy Policy Act of 2005. Arizona (outside the Navajo Nation) and Hawaii do not observe it, so their offset from Eastern Time actually changes twice a year even though their own clocks never move.'
        ]
      },
      howTo: {
        intro: 'Set a time in your own zone, then select the zones you want to compare it against.',
        steps: [
          { name: 'Set the meeting time', text: 'Enter an hour and minute on the 24-hour clock, and pick your own time zone.' },
          { name: 'Select zones to compare', text: 'Click zones grouped by region — US, Europe, Middle East, Asia, Pacific and the Americas — to add or remove them from the comparison.' },
          { name: 'Read the converted times', text: 'Each selected zone shows the equivalent local time and day, since a meeting can land on a different calendar date in some zones.' },
          { name: 'Check the color coding', text: 'Green means business hours (9 a.m.–5 p.m.) in that zone, yellow means early or late (7–9 a.m. or 5–8 p.m.), and red means outside typical working hours.' },
          { name: 'Adjust until it works', text: 'Change the time until as many zones as possible land in green or yellow.' }
        ],
        outro: 'Conversions run entirely in your browser using your device\'s time zone data. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'There is no fixed formula — each zone\'s UTC offset depends on the date, because of daylight saving. The conversion is always: convert to UTC using the source zone\'s offset on that date, then convert from UTC using the target zone\'s offset on that same date.',
        expression: 'UTC = localTime − offset(zone, date)\nlocalTime(targetZone) = UTC + offset(targetZone, date)',
        terms: [
          { symbol: 'offset(zone, date)', meaning: 'That zone\'s difference from UTC on the given date, which can change across a daylight saving transition.' },
          { symbol: 'date', meaning: 'Matters because the same zone can be UTC−5 for part of the year and UTC−4 for the rest, for example US Eastern time (EST/EDT).' }
        ],
        note: 'Offsets shown reflect today\'s date in each zone. A meeting planned near a daylight saving transition date can shift by an hour in some zones once the clocks actually change.'
      },
      workedExample: {
        intro: 'A meeting set for 9:00 a.m. in New York — what time is that in London and Tokyo?',
        rows: [
          { label: 'New York (Eastern Time)', value: '9:00 a.m.' },
          { label: 'London offset from New York (typically +5 hours)', value: '2:00 p.m., same day' },
          { label: 'Tokyo offset from New York (typically +13 hours)', value: '10:00 p.m., same day' }
        ],
        result: '9:00 a.m. ET = 2:00 p.m. in London = 10:00 p.m. in Tokyo',
        explanation: 'The exact offsets depend on whether New York and London are both observing daylight saving on the given date — they do not switch on the same calendar day, so for part of the year the gap between them is 4 hours instead of 5. Tokyo does not observe daylight saving at all, so its offset from UTC never changes, but its offset from New York still shifts when New York\'s does.'
      },
      watchOut: [
        { title: 'The US and Europe change clocks on different dates', body: 'US daylight saving starts the second Sunday of March and ends the first Sunday of November. The EU\'s clock changes fall on different dates, so for a few weeks each spring and fall the usual offset between US and European zones is temporarily one hour different.' },
        { title: 'Not every region observes daylight saving', body: 'Arizona (outside the Navajo Nation), Hawaii, and most of the tropics and Asia do not change clocks seasonally, while most of the US, Canada, Europe and Australia do.' },
        { title: 'A meeting can land on a different calendar day', body: 'A 9:00 p.m. meeting in California is already the next morning in most of Asia, which the day-of-week shown for each zone makes clear.' },
        { title: 'City labels are shorthand for a region\'s rules', body: '"Paris / Berlin (CET)" represents the whole Central European Time zone, not just those two cities — most of continental Western Europe shares the same offset and daylight saving schedule.' },
        { title: 'Relies on your device\'s clock and time zone data', body: 'The underlying time zone database is updated periodically for law changes (a country shifting its own daylight saving rules, for example); an outdated browser or operating system could show a stale rule until it updates.' }
      ],
      references: [
        { label: 'IANA, Time Zone Database', url: 'https://www.iana.org/time-zones' },
        { label: 'National Institute of Standards and Technology, Daylight Saving Time Rules', url: 'https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst' }
      ]
    },
    seo: {
      title: 'Time Zone Meeting Planner – Global Meeting Scheduler',
      description: 'Plan meetings across US and international time zones with automatic daylight saving handling from the IANA time zone database. See current time in all major zones simultaneously.',
      faq: [
        { question: 'What are the US time zones?', answer: 'The contiguous US has 4 zones: Eastern (ET, UTC−5/−4), Central (CT, UTC−6/−5), Mountain (MT, UTC−7/−6), and Pacific (PT, UTC−8/−7). Alaska and Hawaii have their own zones, and Hawaii does not observe daylight saving.' },
        { question: 'What is UTC?', answer: 'UTC (Coordinated Universal Time) is the global time standard every time zone is defined as an offset from. US Eastern time is UTC−5 in winter (EST) and UTC−4 in summer (EDT) because of daylight saving time.' },
        { question: 'When does daylight saving time change in the US?', answer: 'Under the Energy Policy Act of 2005, US clocks spring forward at 2:00 a.m. on the second Sunday of March and fall back at 2:00 a.m. on the first Sunday of November. Arizona (except the Navajo Nation) and Hawaii do not observe it.' },
        { question: 'Where does the time zone data come from?', answer: 'The IANA Time Zone Database, a continuously maintained public record of every zone\'s offset and daylight saving history worldwide. Browsers and operating systems ship a copy of it, which this page reads directly rather than hard-coding zone rules.' },
        { question: 'Why does a city sometimes show a different offset than I expect?', answer: 'Most likely a daylight saving transition. The US and EU change clocks on different calendar dates each spring and fall, which temporarily shifts the usual gap between US and European zones by an hour.' },
        { question: 'Can a meeting time land on a different day in another zone?', answer: 'Yes. A late evening meeting in the Americas is already the next morning across most of Asia and Australia, which is why each zone shows its own day of the week alongside the time.' },
        { question: 'What do the colors mean?', answer: 'Green marks typical business hours (9 a.m.–5 p.m.) in that zone, yellow marks early or late hours (7–9 a.m. or 5–8 p.m.), and red marks times outside a typical working day.' }
      ]
    },
    compute() { return {}; }
  },
  {
    id: 'jet-lag-calculator',
    category: 'travel',
    group: 'Trip Planning',
    glyph: 'JL',
    updatedAt: '2026-11-16',
    aliases: ['jet lag recovery calculator', 'time zone adjustment calculator', 'how long does jet lag last calculator', 'jet lag days calculator', 'circadian adjustment calculator'],
    related: ['timezone-meeting-planner', 'travel-budget-calculator', 'sleep-time-calculator', 'visa-stay-days-calculator'],
    title: 'Jet Lag Calculator',
    description: "Estimate how many days it takes to adjust after a flight, from the number of time zones crossed and direction, using the CDC's own cited adjustment rates.",
    example: 'Flying 5 time zones east (New York to London) takes about 5 days to adjust; the same 5 zones west on the way back takes about 3.3 days, rounded up to 4.',
    breakdown: {
      headline: 'recoveryDays',
      headlineLabel: 'Estimated days to fully adjust',
      outputs: [
        { id: 'recoveryDays', label: 'Estimated days to fully adjust', format: 'number' },
        { id: 'recoveryDaysRounded', label: 'Rounded up to whole days', format: 'integer' },
        { id: 'adjustmentRate', label: 'Adjustment rate used (hours/day)', format: 'number' }
      ],
      groups: [{ title: 'Your flight', inputs: ['timeZonesCrossed', 'direction'] }],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'eastDays', label: 'Same zones, traveling east' }, { from: 'westDays', label: 'Same zones, traveling west' }],
        title: 'Why direction changes the recovery time'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What causes jet lag, and why does direction matter?',
        paragraphs: [
          "Jet lag is what happens when air travel moves your body across time zones faster than your internal body clock — your circadian rhythm — can follow. The US National Library of Medicine's medical subject headings describe it as \"a chronobiologic disorder resulting from rapid travel across a number of time zones, characterized by insomnia or hypersomnolence, fatigue, behavioral symptoms, headaches, and gastrointestinal disturbances.\" The clock itself does not travel instantly; it has to re-synchronize to the destination's light-dark cycle one day at a time.",
          "Direction changes how hard that re-synchronization is. The CDC's Yellow Book explains that for most people \"it is easier to delay than advance the circadian rhythm since the average period of the intrinsic circadian rhythm is slightly longer than 24 hours.\" Traveling west asks your body to stay up later and wake up later — a delay, which comes naturally since your clock already runs a little long. Traveling east asks it to fall asleep and wake up earlier than usual — an advance, which fights against that natural tendency.",
          "The CDC states an average adaptation rate of about 1.5 hours per day after westward travel and about 1 hour per day after eastward travel. Dividing the number of time zones crossed by the rate for your direction gives a rough estimate of how many days full adjustment takes — the basis for this calculator.",
          'Jet lag disorder, as a defined condition, requires crossing "at least two time zones." Shorter hops of a single zone, or short trips generally, are a different situation — the CDC\'s own guidance for a trip of less than 2 days is to skip adjusting entirely and keep your home-zone sleep and meal schedule instead.'
        ]
      },
      howTo: {
        intro: 'Enter the number of time zones your flight crosses and which direction you are traveling.',
        steps: [
          { name: 'Count the time zones crossed', text: 'The difference between your home zone and your destination\'s zone, not the number of layovers or flight hours.' },
          { name: 'Choose your direction', text: 'Eastward (e.g. US to Europe, Asia to US) or westward (e.g. US to Hawaii, Europe to US). Direction matters more than distance.' },
          { name: 'Read the estimate', text: 'The headline is the estimated number of days to fully adjust, using the CDC\'s cited adaptation rate for that direction.' },
          { name: 'Compare both directions', text: 'The chart below shows what the same number of zones would cost in each direction, to see how much of the recovery time is the direction rather than the distance.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "The CDC's cited circadian adaptation rates, divided into the number of time zones crossed.",
        expression: 'recoveryDays = timeZonesCrossed ÷ adjustmentRate\nadjustmentRate = 1 hour/day (eastward) or 1.5 hours/day (westward)',
        terms: [
          { symbol: 'timeZonesCrossed', meaning: 'How many time zones separate your home and destination.' },
          { symbol: 'adjustmentRate', meaning: "The CDC Yellow Book's average rate of circadian adaptation: 1 hour per day eastward, 1.5 hours per day westward." }
        ],
        note: 'A population average from the CDC, not a personal prediction. Age, sleep debt before the trip, light exposure at the destination, and how the days are spent all shift an individual\'s actual recovery time. Not medical advice.'
      },
      workedExample: {
        intro: 'A trip from New York to London crosses 5 time zones eastward. The return trip crosses the same 5 zones westward. How long does each direction take to fully adjust?',
        rows: [
          { label: 'Eastward (5 zones ÷ 1 hour/day)', value: '5.0 days' },
          { label: 'Westward (5 zones ÷ 1.5 hours/day)', value: '3.3 days' },
          { label: 'Westward, rounded up to a whole day', value: '4 days' }
        ],
        result: 'About 5 days eastward (New York → London), about 3.3 days (rounded up to 4) westward (London → New York)',
        explanation: 'The same 5 time zones take noticeably longer to recover from eastward than westward, purely because of direction — not distance, since both legs cross an identical number of zones. Crossing 8 time zones instead would come out to 8 days eastward and about 5.3 days (rounded up to 6) westward, the same 1:1.5 ratio scaled up.'
      },
      watchOut: [
        { title: 'This is a population average, not a guarantee', body: 'The CDC\'s 1 hour/day and 1.5 hours/day figures are averages across travelers. Individual adjustment speed varies with age, how rested you were before the flight, and how much daylight you get at the destination.' },
        { title: 'Pre-shifting your schedule can help before you even leave', body: 'The CDC notes that "shifting sleep 1 hour later (for westward travel) or earlier (for eastward travel) per day in the 2–3 days prior to the trip may reduce the amount of time required to adjust to the destination time zone."' },
        { title: 'Short trips may not be worth adjusting to at all', body: "For a trip shorter than 2 days, the CDC's own guidance is to skip adjusting and keep your sleep, activity and eating schedule on your home time zone instead, since you would be adjusting back again almost immediately." },
        { title: 'Needs at least 2 time zones to count as jet lag disorder', body: 'The CDC\'s diagnostic criteria for jet lag disorder specifically require travel "across at least two time zones." A single-zone shift is unlikely to produce the same effect.' },
        { title: 'Travel fatigue is a separate thing from jet lag', body: 'Tiredness from a long flight itself — cramped seating, dehydration, disrupted sleep in transit — can happen with no time zone change at all, and does not follow this calculator\'s formula.' }
      ],
      references: [
        { label: 'CDC Yellow Book, Jet Lag Disorder', url: 'https://www.cdc.gov/yellow-book/hcp/travel-air-sea/jet-lag-disorder.html' },
        { label: 'US National Library of Medicine, MeSH: Jet Lag Syndrome', url: 'https://meshb.nlm.nih.gov/record/ui?ui=D020179' }
      ]
    },
    inputs: [
      { id: 'timeZonesCrossed', label: 'Time zones crossed', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      {
        id: 'direction',
        label: 'Direction',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Traveling west (e.g. US → Hawaii, Europe → US)' },
          { value: 1, label: 'Traveling east (e.g. US → Europe, Asia → US)' }
        ]
      }
    ],
    seo: {
      title: 'Jet Lag Calculator – Recovery Days by Time Zone',
      description: "Free jet lag calculator. Estimate recovery days from time zones crossed and direction, using the CDC's cited eastward and westward adjustment rates.",
      faq: [
        { question: 'How long does jet lag last?', answer: 'By the CDC\'s cited average rates, roughly one day per time zone crossed traveling east, or about two-thirds of a day per zone traveling west. 5 zones east is about 5 days; 5 zones west is about 3.3 days.' },
        { question: 'Why is eastward jet lag worse than westward?', answer: "The CDC Yellow Book explains that it's generally easier to delay the circadian rhythm (as westward travel requires) than to advance it (as eastward travel requires), since the body's natural internal clock runs slightly longer than 24 hours on its own." },
        { question: 'How many time zones does it take to get jet lag?', answer: 'The CDC\'s diagnostic criteria for jet lag disorder require crossing "at least two time zones." Crossing just one zone is unlikely to produce the same effect.' },
        { question: 'Can I reduce jet lag before I even travel?', answer: 'The CDC notes that shifting your sleep schedule by about 1 hour per day — later for westward trips, earlier for eastward trips — for 2 to 3 days before departure may reduce the adjustment time needed after you arrive.' },
        { question: 'Should I try to adjust for a very short trip?', answer: 'Not necessarily. For trips shorter than 2 days, the CDC\'s own guidance is to keep your sleep, meals and activity on your home time zone rather than adjusting, since you would have to switch back almost immediately.' },
        { question: 'Is this the same as travel fatigue?', answer: 'No. Travel fatigue comes from the trip itself — cramped seating, dehydration, poor sleep in transit — and can happen even on a flight with no time zone change. Jet lag specifically comes from the mismatch between your circadian rhythm and the destination\'s clock.' }
      ]
    },
    compute(values) {
      const EAST_RATE = 1;
      const WEST_RATE = 1.5;
      const rate = values.direction === 1 ? EAST_RATE : WEST_RATE;
      const recoveryDays = values.timeZonesCrossed / rate;
      const eastDays = values.timeZonesCrossed / EAST_RATE;
      const westDays = values.timeZonesCrossed / WEST_RATE;
      return {
        recoveryDays,
        recoveryDaysRounded: Math.ceil(recoveryDays),
        adjustmentRate: rate,
        eastDays,
        westDays
      };
    }
  },
  {
    id: 'luggage-fee-calculator',
    category: 'travel',
    group: 'Baggage',
    glyph: 'BAG',
    updatedAt: '2026-11-16',
    aliases: ['overweight baggage fee calculator', 'oversize baggage fee calculator', 'checked bag fee calculator', 'extra baggage fee calculator', 'airline baggage fee estimator'],
    related: ['travel-budget-calculator', 'visa-stay-days-calculator', 'jet-lag-calculator', 'currency-converter'],
    title: 'Luggage Fee Calculator',
    description: "Estimate overweight and oversize checked-bag fees from your own airline's weight and size allowance and fee schedule, entered by you since every airline sets its own.",
    example: "A 58 lb bag against a 50 lb allowance (a $100 overweight fee) that's also 65 linear inches against a 62 in allowance (a $200 oversize fee) costs $300 extra — Delta's own published domestic rates for those tiers.",
    breakdown: {
      headline: 'totalExtraFee',
      headlineLabel: 'Extra fee for this bag',
      outputs: [
        { id: 'totalExtraFee', label: 'Extra fee for this bag', format: 'currency' },
        { id: 'weightFeeCharged', label: 'Overweight fee charged', format: 'currency' },
        { id: 'sizeFeeCharged', label: 'Oversize fee charged', format: 'currency' },
        { id: 'weightOverage', label: 'Pounds over the weight allowance', format: 'number' },
        { id: 'sizeOverage', label: 'Inches over the size allowance', format: 'number' }
      ],
      groups: [
        { title: 'Your bag', inputs: ['bagWeight', 'bagLinearSize'] },
        { title: "Your airline's standard allowance", inputs: ['weightAllowance', 'sizeAllowance'] },
        { title: "Your airline's fees for exceeding it", inputs: ['overweightFee', 'oversizeFee'] }
      ],
      visual: {
        type: 'donut',
        segments: [{ from: 'weightFeeCharged', label: 'Overweight fee' }, { from: 'sizeFeeCharged', label: 'Oversize fee' }],
        center: 'totalExtraFee',
        centerSub: 'extra fee'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'How overweight and oversize baggage fees work',
        paragraphs: [
          'Airlines set a free weight allowance and a free size allowance (usually measured as linear inches: length + width + height) for a standard checked bag. A bag that exceeds either limit is charged an extra fee — typically a flat amount for a weight or size band, not a per-pound or per-inch charge — on top of whatever the standard checked-bag fee already is.',
          "There is no single industry-wide number: every airline publishes its own allowance and fee schedule, and domestic and international routes on the same airline can differ too. Delta's own published policy is one real, concrete example of how this is structured: a standard Main Cabin domestic allowance of 50 lbs and 62 linear inches, a $100 fee for a bag between 51 and 70 lbs, a $200 fee for a bag between 71 and just under 100 lbs, and a $200 fee for a bag between 63 and 80 linear inches — with bags over 100 lbs or 80 inches not accepted at any price.",
          "This calculator uses the figures you enter for your own airline rather than assuming one schedule, since the Delta numbers above apply only to Delta's domestic Main Cabin policy. Check your airline's own published baggage page for your specific route and fare class before you fly."
        ]
      },
      howTo: {
        intro: "Enter your bag's weight and linear size, then your airline's free allowance and fees for exceeding it (look these up on your airline's own baggage page).",
        steps: [
          { name: "Enter your bag's weight and size", text: 'Weigh the packed bag, and measure length + width + height for the linear size.' },
          { name: "Enter your airline's free allowance", text: 'The weight and size a standard checked bag is allowed before any extra fee applies.' },
          { name: "Enter your airline's fees", text: 'The flat fee charged for exceeding the weight allowance, and separately for exceeding the size allowance.' },
          { name: 'Read the total', text: 'The headline is the total extra fee for this one bag, on top of whatever the standard checked-bag fee already is.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each limit is checked independently. Exceeding either one (even by a small amount) charges that limit\'s full flat fee.',
        expression: 'weightFeeCharged = bagWeight > weightAllowance ? overweightFee : 0\nsizeFeeCharged = bagLinearSize > sizeAllowance ? oversizeFee : 0\ntotalExtraFee = weightFeeCharged + sizeFeeCharged',
        terms: [
          { symbol: 'bagLinearSize', meaning: 'Length + width + height of the packed bag, in inches.' },
          { symbol: 'weightAllowance, sizeAllowance', meaning: "Your airline's free limits before an extra fee applies." }
        ],
        note: 'Flat per-tier fees, matching how airlines actually price this (a bag 1 lb over pays the same fee as a bag 19 lb over, within the same tier) rather than a smooth per-pound charge.'
      },
      workedExample: {
        intro: "A packed bag weighs 58 lbs and measures 65 linear inches. Using Delta's own published domestic Main Cabin numbers — a 50 lb / 62 in standard allowance, a $100 fee for 51–70 lbs, and a $200 fee for 63–80 linear inches — what does this bag cost in extra fees?",
        rows: [
          { label: 'Weight over the allowance (58 − 50)', value: '8 lbs over → in the 51-70 lb tier' },
          { label: 'Overweight fee (51-70 lb tier)', value: '$100.00' },
          { label: 'Size over the allowance (65 − 62)', value: '3 in over → in the 63-80 in tier' },
          { label: 'Oversize fee (63-80 in tier)', value: '$200.00' },
          { label: 'Total extra fee (100 + 200)', value: '$300.00' }
        ],
        result: '$300.00 in extra fees, on top of the standard checked-bag fee',
        explanation: "Both fees apply at once because the bag exceeds both limits — being only 8 lbs and 3 in over the allowance still charges the full flat fee for each tier, the same as a bag much further over within the same tier."
      },
      watchOut: [
        { title: 'Overweight and oversize fees can stack', body: 'A bag that breaks both limits is charged both fees, not just the larger one — exactly what the worked example shows.' },
        { title: 'Some bags are refused outright, at any price', body: 'Under Delta\'s published policy, bags of 100 lbs or more, or larger than 80 linear inches, are not accepted as checked baggage regardless of fee.' },
        { title: 'A fee waiver for your first bag rarely covers overweight or oversize charges', body: "A co-branded credit card, elite status or military waiver that makes your standard checked bag free typically still leaves you responsible for any overweight or oversize fee on that same bag." },
        { title: "Every airline's numbers are different", body: "Delta's figures above are one real example, not a universal standard. Always check your own airline's current baggage page for your specific route and fare before you pack." },
        { title: 'International routes can use different rules entirely', body: 'Some airlines price baggage by a weight-based allowance instead of the US-style free-bag-count system on international itineraries, even on the same airline that uses the other system domestically. Confirm the policy for your specific route.' }
      ],
      references: [
        { label: 'Delta Air Lines, Excess & Overweight Baggage Policy', url: 'https://www.delta.com/us/en/baggage/checked-baggage/excess-overweight-baggage' },
        { label: 'Delta Air Lines, Baggage Policy and Fees', url: 'https://www.delta.com/us/en/baggage/overview' }
      ]
    },
    inputs: [
      { id: 'bagWeight', label: 'Bag weight', type: 'number', placeholder: '58', defaultValue: 58, step: 1, min: 0, dimension: 'mass', unit: 'lb' },
      { id: 'bagLinearSize', label: 'Bag linear size (length + width + height)', type: 'number', placeholder: '65', defaultValue: 65, step: 1, min: 0, dimension: 'length', unit: 'in' },
      { id: 'weightAllowance', label: "Airline's free weight allowance", type: 'number', placeholder: '50', defaultValue: 50, step: 1, min: 0, dimension: 'mass', unit: 'lb' },
      { id: 'sizeAllowance', label: "Airline's free size allowance", type: 'number', placeholder: '62', defaultValue: 62, step: 1, min: 0, dimension: 'length', unit: 'in' },
      { id: 'overweightFee', label: "Airline's overweight fee", type: 'currency', placeholder: '100', defaultValue: 100, step: 10, min: 0 },
      { id: 'oversizeFee', label: "Airline's oversize fee", type: 'currency', placeholder: '200', defaultValue: 200, step: 10, min: 0 }
    ],
    seo: {
      title: 'Luggage Fee Calculator – Overweight & Oversize Bags',
      description: "Free luggage fee calculator. Estimate overweight and oversize checked-bag fees from your airline's weight/size allowance and its own fee schedule.",
      faq: [
        { question: 'How much is an overweight baggage fee?', answer: "It depends entirely on the airline and weight band. As one real example, Delta charges $100 for a domestic Main Cabin bag between 51 and 70 lbs, and $200 for one between 71 and just under 100 lbs, over its standard 50 lb allowance." },
        { question: 'How much is an oversize baggage fee?', answer: 'Also airline-specific. Delta charges $200 for a domestic bag measuring 63 to 80 linear inches (length + width + height), over its standard 62-inch allowance.' },
        { question: 'Can a bag be charged both an overweight and an oversize fee?', answer: 'Yes. The two fees are independent — a bag that exceeds both the weight and size allowance is charged both fees, not just the larger one.' },
        { question: 'What is a typical standard checked bag allowance?', answer: "There is no single industry standard, but Delta's domestic Main Cabin allowance — 50 lbs and 62 linear inches — is a common reference point and this calculator's default." },
        { question: 'Will an airline refuse a bag instead of charging a fee?', answer: 'Yes, past a point. Delta\'s published policy does not accept checked bags of 100 lbs or more, or larger than 80 linear inches, at any price.' },
        { question: 'Does a free-checked-bag credit card or elite status cover overweight fees too?', answer: 'Usually not. Those benefits typically waive the standard checked-bag fee only; an overweight or oversize fee on that same bag is still charged separately.' }
      ]
    },
    compute(values) {
      const weightOverage = Math.max(0, values.bagWeight - values.weightAllowance);
      const sizeOverage = Math.max(0, values.bagLinearSize - values.sizeAllowance);
      const weightFeeCharged = weightOverage > 0 ? values.overweightFee : 0;
      const sizeFeeCharged = sizeOverage > 0 ? values.oversizeFee : 0;
      const totalExtraFee = weightFeeCharged + sizeFeeCharged;
      return { weightOverage, sizeOverage, weightFeeCharged, sizeFeeCharged, totalExtraFee };
    }
  },
  {
    id: 'daylight-hours-calculator',
    category: 'travel',
    group: 'Trip Planning',
    glyph: 'DL',
    updatedAt: '2026-11-16',
    aliases: ['sunrise sunset calculator', 'hours of daylight calculator', 'day length calculator', 'how many hours of daylight calculator', 'daylight by latitude calculator'],
    related: ['travel-budget-calculator', 'timezone-meeting-planner', 'jet-lag-calculator', 'visa-stay-days-calculator'],
    title: 'Daylight Hours Calculator',
    description: 'Estimate how many hours of daylight a date and latitude will get, using the standard solar declination and sunrise-hour-angle formulas — useful for planning how much daylight a trip day has.',
    example: "New York (40.7°N) on the June 21 solstice gets about 14.9 hours of daylight; the same latitude on the December 21 solstice gets about 9.1 hours.",
    breakdown: {
      headline: 'dayLengthHours',
      headlineLabel: 'Hours of daylight',
      outputs: [
        { id: 'dayLengthHours', label: 'Hours of daylight', format: 'number' },
        { id: 'nightLengthHours', label: 'Hours of darkness', format: 'number' },
        { id: 'solarDeclination', label: "Sun's declination that day (degrees)", format: 'number' }
      ],
      groups: [
        { title: 'Date', inputs: ['month', 'day', 'year'] },
        { title: 'Location', inputs: ['latitude'] }
      ],
      visual: {
        type: 'donut',
        segments: [{ from: 'dayLengthHours', label: 'Daylight' }, { from: 'nightLengthHours', label: 'Darkness' }],
        center: 'dayLengthHours',
        centerSub: 'hours of daylight'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'Why day length depends on date and latitude',
        paragraphs: [
          "Earth's axis is tilted about 23.44° from vertical relative to its orbit, so as it orbits the Sun, each hemisphere spends part of the year tilted toward the Sun and part tilted away. The Sun's declination — its angle north or south of the equator, as seen from Earth — tracks that tilt, swinging from about +23.44° around the June solstice to about −23.44° around the December solstice and crossing zero at the two equinoxes.",
          "Latitude determines how much that swing actually changes the length of your day. At the equator, day and night stay close to 12 hours all year regardless of declination, because the horizon there always splits the Sun's daily circle in half. Farther from the equator, the same declination tilts the Sun's path relative to the local horizon more and more, stretching summer days and shrinking winter ones — an effect that keeps growing until, past about 66.5° latitude (90° minus the 23.44° tilt), the Sun can stop setting or rising entirely for part of the year: polar day and polar night.",
          'This calculator works out the Sun\'s declination for your date, then the "hour angle" — how far before and after local solar noon the Sun is above the horizon — from your latitude and that declination, using the standard formulas astronomers use for sunrise and sunset.'
        ]
      },
      howTo: {
        intro: 'Enter a date and a latitude. Use a positive number for the Northern Hemisphere and a negative number for the Southern Hemisphere.',
        steps: [
          { name: 'Enter the date', text: 'Month, day and year — year matters only for leap-day counting, not for the result itself.' },
          { name: 'Enter the latitude', text: "Your location's latitude in degrees: positive for north of the equator, negative for south. New York is about 40.7; Sydney is about −33.9." },
          { name: 'Read the daylight hours', text: 'The headline is the estimated hours of daylight that date and latitude get, with hours of darkness and the Sun\'s declination shown underneath.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "A standard approximation for solar declination, followed by the sunrise-hour-angle equation used to find day length from latitude and declination.",
        expression:
          'N = day of year (1-366)\ndeclination = -23.44° × cos[ (360°/365) × (N + 10) ]\ncos(H₀) = -tan(latitude) × tan(declination)\ndayLength = 2 × H₀ ÷ 15 hours',
        terms: [
          { symbol: 'N', meaning: 'The day of the year, counting January 1 as day 1.' },
          { symbol: 'declination', meaning: "The Sun's angle north (+) or south (−) of the equator on that day." },
          { symbol: 'H₀', meaning: 'The sunrise/sunset hour angle in degrees — how far before and after solar noon the Sun crosses the horizon.' }
        ],
        note: 'H₀ is clamped to 0° when cos(H₀) ≥ 1 (polar night — the Sun never rises) and to 180° when cos(H₀) ≤ −1 (polar day — the Sun never sets).'
      },
      workedExample: {
        intro: 'New York (latitude 40.7°N) on June 21, 2026 — the June solstice, day 172 of the year. How many hours of daylight does it get?',
        rows: [
          { label: 'Declination (-23.44° × cos[(360/365) × 182°])', value: '+23.44°' },
          { label: 'cos(H₀) = -tan(40.7°) × tan(23.44°)', value: '-0.3729' },
          { label: 'H₀ = arccos(-0.3729)', value: '111.9°' },
          { label: 'Day length (2 × 111.9° ÷ 15)', value: '14.9 hours' }
        ],
        result: 'About 14.9 hours of daylight',
        explanation: "Six months later, on the December 21 solstice (day 355), the same latitude's declination flips to about -23.44°, giving cos(H₀) = +0.3737, H₀ ≈ 68.1°, and a day length of about 9.1 hours — roughly 5.8 fewer hours of daylight at the same location, purely from the Sun's declination swinging to the other side of the equator."
      },
      watchOut: [
        { title: 'An approximation, not a precise ephemeris', body: 'This declination formula is a standard simplified approximation that can be off by up to about 2°, which can shift the result by several minutes. Precise sunrise/sunset tables (such as a naval almanac or NOAA\'s own calculator) use a more detailed series.' },
        { title: 'Atmospheric refraction is not included', body: "This model treats sunrise and sunset as the moment the Sun's geometric center crosses the horizon. In reality, atmospheric refraction bends light and the Sun has a visible disk, so the Sun is visible a little before it geometrically rises and a little after it geometrically sets — real daylight runs a few minutes longer than this estimate, more so near the poles." },
        { title: 'Longitude does not affect day length', body: 'Day length depends only on latitude and date, not longitude or time zone. Two cities at the same latitude get the same number of daylight hours on the same date, even if their clock times for sunrise and sunset are completely different.' },
        { title: 'Polar day and night are real, not a calculator quirk', body: 'Above about 66.5° latitude (the Arctic or Antarctic Circle), this formula correctly returns 24 hours of daylight or 0 hours around the respective solstice, because the Sun genuinely does not set or rise there for part of the year.' },
        { title: 'Local horizon and elevation are not modeled', body: 'Mountains, buildings or a low horizon can shorten the daylight actually experienced at a specific spot, even though the astronomical day length calculated here is unchanged.' }
      ],
      references: [
        { label: 'Wikipedia, "Position of the Sun" (solar declination approximation)', url: 'https://en.wikipedia.org/wiki/Position_of_the_Sun' },
        { label: 'Wikipedia, "Sunrise equation" (hour angle and day length)', url: 'https://en.wikipedia.org/wiki/Sunrise_equation' }
      ]
    },
    inputs: [
      { id: 'month', label: 'Month (1-12)', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 1 },
      { id: 'day', label: 'Day (1-31)', type: 'number', placeholder: '21', defaultValue: 21, step: 1, min: 1 },
      { id: 'year', label: 'Year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1900 },
      { id: 'latitude', label: 'Latitude (degrees, + north / − south)', type: 'number', placeholder: '40.7', defaultValue: 40.7, step: 0.1, min: -90 }
    ],
    seo: {
      title: 'Daylight Hours Calculator – Day Length by Latitude',
      description: 'Free daylight hours calculator. Estimate hours of daylight for any date and latitude using the standard solar declination and sunrise-hour-angle formulas.',
      faq: [
        { question: 'How do you calculate hours of daylight from latitude?', answer: "Find the Sun's declination for the date, then use it with your latitude in the sunrise-hour-angle formula: cos(H₀) = -tan(latitude) × tan(declination). Day length is 2 × H₀ ÷ 15 hours. New York at 40.7°N on June 21 works out to about 14.9 hours." },
        { question: 'Why are days longer in summer?', answer: "Earth's axis is tilted about 23.44°, so the Sun's declination swings toward your hemisphere in summer, tilting its daily path higher relative to your local horizon and stretching the time it spends above it." },
        { question: 'At what latitude does the sun not set in summer?', answer: 'Above about 66.5° latitude — 90° minus the 23.44° axial tilt — known as the Arctic Circle (Northern Hemisphere) or Antarctic Circle (Southern Hemisphere), where the Sun can stay above the horizon all day around the local summer solstice.' },
        { question: 'Does longitude change how many hours of daylight I get?', answer: 'No. Day length depends only on latitude and date. Two places on the same latitude get the same number of daylight hours on a given date, even in different time zones.' },
        { question: 'How accurate is this daylight calculator?', answer: "It uses a standard declination approximation with up to about 2° of error, and does not include atmospheric refraction, so results can differ from a precise almanac by several minutes — closer near the equator, further off near the poles." },
        { question: 'What is the longest day of the year in the Northern Hemisphere?', answer: 'The June solstice, around June 20-21, when the Sun\'s declination is at its most positive (about +23.44°). The Southern Hemisphere\'s longest day is the December solstice instead, when the declination is most negative.' }
      ]
    },
    compute(values) {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const toDeg = (r: number) => (r * 180) / Math.PI;
      const start = Date.UTC(values.year, 0, 1);
      const date = Date.UTC(values.year, values.month - 1, values.day);
      const dayOfYear = Math.round((date - start) / 86400000) + 1;
      const solarDeclination = -23.44 * Math.cos(toRad((360 / 365) * (dayOfYear + 10)));
      const cosHourAngle = -Math.tan(toRad(values.latitude)) * Math.tan(toRad(solarDeclination));
      let dayLengthHours: number;
      if (cosHourAngle >= 1) dayLengthHours = 0;
      else if (cosHourAngle <= -1) dayLengthHours = 24;
      else dayLengthHours = (2 * toDeg(Math.acos(cosHourAngle))) / 15;
      return { solarDeclination, dayLengthHours, nightLengthHours: 24 - dayLengthHours };
    }
  },
  {
    id: 'travel-points-value-calculator',
    category: 'travel',
    group: 'Points & Rewards',
    glyph: '¢/pt',
    updatedAt: '2026-11-16',
    aliases: ['airline miles value calculator', 'hotel points value calculator', 'what are my miles worth calculator', 'award redemption value calculator', 'cents per mile calculator'],
    related: ['loyalty-points-value-calculator', 'travel-budget-calculator', 'currency-converter', 'visa-stay-days-calculator'],
    title: 'Travel Points Value Calculator',
    description: 'Work out the cents-per-point value you actually got from a specific airline miles or hotel points redemption, and compare it against a published benchmark rate.',
    example: "Using 60,000 miles for a $900 flight, after paying $11.20 of taxes in cash, realizes about 1.48 cents per mile — about 23% above a 1.2-cent published benchmark rate for that program.",
    breakdown: {
      headline: 'realizedCentsPerPoint',
      headlineLabel: 'Value you got per point (cents)',
      outputs: [
        { id: 'realizedCentsPerPoint', label: 'Value you got per point (cents)', format: 'number' },
        { id: 'netCashValue', label: 'Cash value of this redemption', format: 'currency' },
        { id: 'vsBenchmarkDiffPercent', label: 'Vs. your comparison rate', format: 'percent' }
      ],
      groups: [
        { title: 'Your redemption', inputs: ['pointsUsed', 'cashPriceAvoided', 'cashCopay'] },
        { title: 'Compare against a published rate', inputs: ['comparisonBenchmark'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'realizedCentsPerPoint', label: 'What you got' }, { from: 'comparisonBenchmark', label: 'Comparison rate you entered' }],
        title: 'Your rate vs. a published benchmark'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What did your points actually get you, this time?',
        paragraphs: [
          "This site's Loyalty Points Value Calculator (in the Shopping category) works forward: you supply a known cents-per-point rate, and it multiplies that rate by your points balance to get a dollar value. That works well for a program with a fixed, published cash-back rate.",
          'Travel redemptions are usually the opposite problem. Airline and hotel programs rarely publish a fixed rate at all — award prices move with demand, like cash fares — so the only way to know what a specific redemption was worth is to work backward from the actual booking: the cash price you avoided, minus any taxes or fees you still paid in cash, divided by the points it cost you.',
          "Independent travel-rewards publishers size up whole loyalty programs the same way, at scale. The Points Guy publishes monthly valuations built, in its own words, from \"factors such as award pricing, redemption opportunities, fees, program rules and extensive redemption data,\" intended as \"a practical benchmark to help travelers determine whether they're getting a strong return from their rewards.\" This calculator lets you check one specific redemption against a benchmark like that, rather than guessing."
        ]
      },
      howTo: {
        intro: 'Enter the points you redeemed, what the same booking would have cost in cash, and any cash taxes or fees you still paid alongside the points.',
        steps: [
          { name: 'Enter your points used', text: 'The number of points or miles the redemption actually cost.' },
          { name: 'Enter the cash price avoided', text: 'What you would have paid in cash for the identical flight or room — same cabin, same dates, same fare class, not a fare you would never have actually booked.' },
          { name: 'Enter any cash co-pay', text: 'Taxes, government fees, or carrier-imposed surcharges you still paid in cash on top of the points — common on award tickets.' },
          { name: 'Read your realized rate', text: 'The headline is the cents-per-point value this specific redemption actually delivered.' },
          { name: 'Compare against a benchmark', text: "Open the optional group and enter a published rate (such as one program's current cents-per-point figure from a travel-rewards publisher) to see how your redemption compares." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The cash value actually captured by this redemption, divided by the points it cost, converted to cents.',
        expression: 'netCashValue = cashPriceAvoided − cashCopay\nrealizedCentsPerPoint = (netCashValue ÷ pointsUsed) × 100',
        terms: [
          { symbol: 'cashPriceAvoided', meaning: 'What the identical booking would have cost paying cash.' },
          { symbol: 'cashCopay', meaning: 'Taxes, government fees or carrier surcharges still paid in cash alongside the points.' }
        ],
        note: "Values one specific booking, not a program-wide average. The same points balance can realize a very different rate on a different flight or room."
      },
      workedExample: {
        intro: "60,000 miles book a flight that costs $900 in cash. Delta's own SkyMiles terms state that \"award redemption requires payment of at least $11.20 in U.S. government taxes and fees for domestic itineraries,\" paid in cash alongside the miles. What rate did this redemption realize, compared with a 1.2-cent published benchmark for the program?",
        rows: [
          { label: 'Net cash value avoided (900 − 11.20)', value: '$888.80' },
          { label: 'Realized rate (888.80 ÷ 60,000 × 100)', value: '1.48 cents/point' },
          { label: 'Vs. 1.2-cent benchmark ((1.48 − 1.2) ÷ 1.2 × 100)', value: '+23.4%' }
        ],
        result: 'About 1.48 cents per mile — roughly 23% above the 1.2-cent benchmark entered',
        explanation: 'The $11.20 cash co-pay is small next to a $900 fare, so it barely dents the realized rate here. On a shorter, cheaper flight the same $11.20 minimum would eat a much larger share of the value, which is why this calculator nets it out explicitly rather than ignoring it.'
      },
      watchOut: [
        { title: 'Compare the same cabin and fare you would have actually bought', body: "Using a business-class cash price as the \"price avoided\" for an economy-equivalent award inflates the realized rate. Compare against the fare you would genuinely have paid in cash." },
        { title: 'Cash co-pays are easy to forget, and they add up on cheap fares', body: 'Carrier-imposed surcharges on some partner-airline award tickets can run into the hundreds of dollars, not just the government-tax minimum. Leaving the co-pay field at zero overstates the redemption\'s real value.' },
        { title: 'One redemption, not your whole balance', body: "This figure describes the specific booking you entered. A different flight, room, or travel date on the same points balance can realize a meaningfully different rate." },
        { title: 'Published benchmarks are averages across many bookings, and change monthly', body: "A travel-rewards publisher's benchmark reflects typical redemptions across an entire program, checked at one point in time — use the current figure, not one from months ago, when comparing." },
        { title: 'Not the same calculator as a forward points-to-cash conversion', body: "If you already know your program's fixed cents-per-point rate and just want to convert a points balance to a dollar figure, this site's Loyalty Points Value Calculator (Shopping category) does that multiplication directly." }
      ],
      references: [
        { label: 'The Points Guy, Monthly Valuations', url: 'https://thepointsguy.com/loyalty-programs/monthly-valuations/' },
        { label: 'Delta Air Lines, SkyMiles Award Travel (taxes and fees)', url: 'https://www.delta.com/content/www/en_US/skymiles/use-miles/award-travel/about-award-travel.html' }
      ]
    },
    inputs: [
      { id: 'pointsUsed', label: 'Points or miles used', type: 'number', placeholder: '60000', defaultValue: 60000, step: 1000, min: 1 },
      { id: 'cashPriceAvoided', label: 'Cash price for the same booking', type: 'currency', placeholder: '900', defaultValue: 900, step: 25, min: 0 },
      { id: 'cashCopay', label: 'Taxes/fees you still paid in cash', type: 'currency', placeholder: '11.20', defaultValue: 11.2, step: 1, min: 0 },
      { id: 'comparisonBenchmark', label: 'A published rate to compare against (cents/point)', type: 'number', placeholder: '1.2', defaultValue: 1.2, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Travel Points Value Calculator – Cents Per Mile',
      description: 'Free travel points value calculator. Work out the cents-per-point value a specific miles or hotel points redemption actually realized, vs. a benchmark.',
      faq: [
        { question: 'How do I calculate the value of a specific points redemption?', answer: 'Subtract any cash taxes/fees from the cash price you avoided, divide by the points used, then multiply by 100 for cents. 60,000 miles avoiding a $900 fare with $11.20 paid in cash realizes (900 − 11.20) ÷ 60,000 × 100 ≈ 1.48 cents per mile.' },
        { question: 'What is a good cents-per-point value for airline miles?', answer: "It varies by program and changes over time. The Points Guy's own November 2026 monthly valuations cite figures like 1.2¢ for Delta SkyMiles and United MileagePlus, and 1.45¢ for American AAdvantage — check the current month's figure for your program rather than a fixed rule of thumb." },
        { question: 'Why subtract taxes and fees from the cash price?', answer: "Because award tickets usually aren't entirely free. Delta's own SkyMiles terms state a minimum of $11.20 in U.S. government taxes and fees on domestic award tickets, paid in cash on top of the miles — ignoring that cash co-pay overstates the redemption's real value." },
        { question: 'How is this different from a points-to-cash conversion?', answer: "A points-to-cash conversion (like this site's Loyalty Points Value Calculator) multiplies a known, fixed rate by your points balance. This calculator works backward from one actual redemption to find out what rate it realized, which is the relevant question for programs — like most airline and hotel ones — that don't publish a fixed rate." },
        { question: 'Should I compare against the cash price of a cabin I would never book?', answer: "No. Comparing an economy-equivalent award against a business-class cash fare inflates the realized rate. Use the price of the fare or room you would genuinely have paid cash for." },
        { question: 'Does this value my whole points balance?', answer: 'No — it values the one redemption you enter. The same balance can realize a different rate on a different flight, room, or date.' }
      ]
    },
    compute(values) {
      const netCashValue = values.cashPriceAvoided - values.cashCopay;
      const realizedCentsPerPoint = (netCashValue / values.pointsUsed) * 100;
      const vsBenchmarkDiffPercent = values.comparisonBenchmark > 0 ? ((realizedCentsPerPoint - values.comparisonBenchmark) / values.comparisonBenchmark) * 100 : 0;
      return { netCashValue, realizedCentsPerPoint, vsBenchmarkDiffPercent };
    }
  },
  {
    id: 'points-vs-cash-flight-calculator',
    category: 'travel',
    group: 'Points & Rewards',
    glyph: 'P$',
    updatedAt: '2026-11-16',
    aliases: ['should i use points or pay cash calculator', 'pay with miles or cash calculator', 'award flight vs cash calculator', 'points or cash for flight calculator', 'miles vs money calculator'],
    related: ['travel-points-value-calculator', 'travel-budget-calculator', 'currency-converter'],
    title: 'Points vs. Cash Flight Calculator',
    description: "Decide whether to redeem points or pay cash for a specific flight, by converting the points price to dollars at your own assumed point value and comparing it to the cash fare.",
    example: "A $450 flight that also costs 25,000 miles plus $11.20 in cash: at a 1.2-cent-per-mile value, the points option costs $311.20 in your own terms — $138.80 cheaper than paying cash.",
    breakdown: {
      headline: 'savingsUsingPoints',
      headlineLabel: 'Savings by using points instead of cash',
      outputs: [
        { id: 'savingsUsingPoints', label: 'Savings by using points instead of cash', format: 'currency' },
        { id: 'pointsCostInDollars', label: 'What the points booking costs you, at your rate', format: 'currency' },
        { id: 'breakevenCentsPerPoint', label: 'Breakeven rate for this flight (cents/point)', format: 'number' }
      ],
      groups: [
        { title: 'This flight', inputs: ['cashPrice', 'pointsRequired', 'awardCashFees'] },
        { title: 'Your point value assumption', inputs: ['yourPointValue'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'cashPrice', label: 'Paying cash' }, { from: 'pointsCostInDollars', label: 'Using points, at your rate' }],
        title: 'Cash price vs. points cost in your own terms'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'Points or cash: which is actually cheaper for this flight?',
        paragraphs: [
          "An airline will often sell the exact same seat two ways: a cash price, or a points price plus a smaller cash co-pay for taxes and fees. Comparing them fairly means putting both in the same unit — dollars — using what you believe your own points are worth per point, since (as this site's Travel Points Value Calculator explains) airline programs rarely publish one fixed rate.",
          "Converting the points price to a dollar-equivalent cost and comparing it to the cash price answers a different, more useful question than just \"is this flight expensive in points\": given what you think your points are worth to you, does redeeming them for this flight save money compared to paying cash and keeping the points for something else?",
          "This calculator also reports the breakeven rate: the exact cents-per-point value at which the two options cost the same for this specific flight. If your own point-value assumption is below the breakeven rate, using points for this flight is the better deal — you'd be extracting more value than you think your points are worth elsewhere. Above breakeven, paying cash and saving the points for a redemption worth more to you is the better deal."
        ]
      },
      howTo: {
        intro: "Enter the flight's cash price, its points price, and any cash fees charged alongside the points, then your own assumed point value.",
        steps: [
          { name: "Enter the flight's cash price", text: 'The price if you paid entirely with a card, for the identical flight and fare class.' },
          { name: 'Enter the points price', text: 'How many points or miles the award price is, for that same flight.' },
          { name: 'Enter the cash fees on the award', text: 'Taxes, government fees or carrier surcharges still charged in cash alongside the points — commonly a small amount on domestic flights, more on some international partner awards.' },
          { name: 'Enter your own point value', text: "What you believe a point is worth to you, in cents — your own number, a program's typical published rate, or this site's Travel Points Value Calculator's result for a past redemption." },
          { name: 'Read the result', text: 'The headline shows how much using points saves (or costs extra) compared with paying cash, at your assumed rate. The breakeven rate shows the exact point value where neither option wins.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The points price is converted to a dollar-equivalent cost using your own assumed rate, then compared directly to the cash price.',
        expression:
          'pointsCostInDollars = (pointsRequired × yourPointValue ÷ 100) + awardCashFees\nsavingsUsingPoints = cashPrice − pointsCostInDollars\nbreakevenCentsPerPoint = (cashPrice − awardCashFees) ÷ pointsRequired × 100',
        terms: [
          { symbol: 'yourPointValue', meaning: 'Your own assumed value of one point, in cents.' },
          { symbol: 'breakevenCentsPerPoint', meaning: 'The point value at which the points option and the cash option cost exactly the same for this flight.' }
        ],
        note: 'A positive savingsUsingPoints means the points option is cheaper at your assumed rate; a negative figure means paying cash is cheaper. Change only your own point-value assumption to see how sensitive the decision is to it.'
      },
      workedExample: {
        intro: 'A flight costs $450 in cash, or 25,000 miles plus $11.20 in cash taxes and fees. Assuming your miles are worth 1.2 cents each, which is the better deal?',
        rows: [
          { label: 'Points cost in dollars (25,000 × 1.2 ÷ 100 + 11.20)', value: '$311.20' },
          { label: 'Savings using points (450 − 311.20)', value: '$138.80' },
          { label: 'Breakeven rate ((450 − 11.20) ÷ 25,000 × 100)', value: '1.76 cents/point' }
        ],
        result: 'Using points saves $138.80 at a 1.2-cent valuation — and stays the better deal up to a 1.76-cent valuation',
        explanation: "Because the 1.2-cent assumption is below the 1.76-cent breakeven rate, this flight is extracting more value from the points than the traveler's own baseline — a good redemption by their own stated standard. If they instead valued their miles at 2 cents each (above breakeven), paying the $450 cash fare and saving the miles for something else would be the better deal."
      },
      watchOut: [
        { title: "The result only reflects the point value you enter", body: 'This calculator does not know what your points are "really" worth — that number is an assumption you supply. A different assumption can flip the recommendation entirely, which the breakeven rate is meant to make clear.' },
        { title: "Compare the identical fare and cabin", body: "A points price for a different cabin, different dates, or with blackout-driven restrictions than the cash price you're comparing against makes the comparison meaningless." },
        { title: "Cash fees on award tickets are easy to underestimate", body: 'Carrier-imposed surcharges on some partner-airline awards can run well beyond the basic government-tax minimum. Confirm the actual cash charge for your specific award booking, not just a typical domestic figure.' },
        { title: "Flexibility and cancellation terms differ, and aren't priced in here", body: 'Many award tickets have different change and refund rules than the matching cash fare. A purely dollar-for-dollar comparison does not capture that difference in flexibility.' },
        { title: "Breakeven is specific to this one flight", body: "A different flight with a different points-to-cash ratio has its own breakeven rate. A good redemption on one flight does not mean every flight on the same program is equally good." }
      ],
      references: [
        { label: 'The Points Guy, Monthly Valuations', url: 'https://thepointsguy.com/loyalty-programs/monthly-valuations/' },
        { label: 'Delta Air Lines, SkyMiles Award Travel (taxes and fees)', url: 'https://www.delta.com/content/www/en_US/skymiles/use-miles/award-travel/about-award-travel.html' }
      ]
    },
    inputs: [
      { id: 'cashPrice', label: "Flight's cash price", type: 'currency', placeholder: '450', defaultValue: 450, step: 10, min: 0 },
      { id: 'pointsRequired', label: 'Points or miles required', type: 'number', placeholder: '25000', defaultValue: 25000, step: 1000, min: 1 },
      { id: 'awardCashFees', label: 'Cash taxes/fees charged with the points', type: 'currency', placeholder: '11.20', defaultValue: 11.2, step: 1, min: 0 },
      { id: 'yourPointValue', label: 'Your assumed point value (cents/point)', type: 'number', placeholder: '1.2', defaultValue: 1.2, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Points vs. Cash Flight Calculator – Which Is Cheaper',
      description: 'Free points vs. cash calculator. Compare a flight\'s cash price to its points price at your own point value, with the exact breakeven rate for that flight.',
      faq: [
        { question: 'How do I decide between paying cash or using points for a flight?', answer: "Convert the points price to dollars using your own assumed cents-per-point value, add any cash fees charged with the points, then compare that total to the cash price. The cheaper total, in your own terms, is the better deal." },
        { question: 'What is the breakeven rate in this calculator?', answer: "The exact point value at which the points option and the cash option cost the same for this one flight. Below that rate, using points saves money; above it, paying cash is cheaper." },
        { question: 'What point value should I use?', answer: "Your own honest assumption — a program's typical published rate from a source like The Points Guy's monthly valuations, or a past result from this site's Travel Points Value Calculator. The recommendation changes if your assumption does." },
        { question: 'Why does the cash fee on an award ticket matter here?', answer: "Because it's a real, separate charge. Delta's own SkyMiles terms state a minimum of $11.20 in U.S. government taxes and fees on a domestic award ticket, paid in cash alongside the points — leaving it out understates the true cost of the points option." },
        { question: 'Does this account for ticket flexibility or refund rules?', answer: 'No. It compares dollar cost only. Award and cash tickets can carry different change and cancellation terms that this calculator does not price in.' },
        { question: 'Is a good redemption on one flight good on every flight?', answer: 'No. The breakeven rate is specific to that flight\'s own points-to-cash ratio. A different route or date on the same program can have a very different breakeven point.' }
      ]
    },
    compute(values) {
      const pointsCostInDollars = (values.pointsRequired * values.yourPointValue) / 100 + values.awardCashFees;
      const savingsUsingPoints = values.cashPrice - pointsCostInDollars;
      const breakevenCentsPerPoint = values.pointsRequired > 0 ? ((values.cashPrice - values.awardCashFees) / values.pointsRequired) * 100 : 0;
      return { pointsCostInDollars, savingsUsingPoints, breakevenCentsPerPoint };
    }
  },
  {
    id: 'tipping-abroad-calculator',
    category: 'travel',
    group: 'Local Customs',
    glyph: 'TIP',
    updatedAt: '2026-11-16',
    aliases: ['tipping customs by country calculator', 'how much to tip abroad calculator', 'international tipping guide calculator', 'tipping etiquette calculator', 'do i need to tip calculator'],
    related: ['travel-budget-calculator', 'currency-converter', 'visa-stay-days-calculator'],
    title: 'Tipping Abroad Calculator',
    description: 'Look up tipping norms for a handful of countries, each sourced from a government, tourism-board or recognized etiquette authority, and get a suggested tip for your bill.',
    example: 'A $50 restaurant bill suggests an $8.75 tip (17.5%) in the United States, but $0 in Japan, where tipping is not customary at all.',
    breakdown: {
      headline: 'suggestedTip',
      headlineLabel: 'Suggested tip',
      outputs: [
        { id: 'suggestedTip', label: 'Suggested tip', format: 'currency' },
        { id: 'totalWithTip', label: 'Bill + suggested tip', format: 'currency' },
        { id: 'percent', label: 'Rate used for this country', format: 'percent' },
        { id: 'country', label: "What's customary here", labels: TIPPING_NOTE_LABELS }
      ],
      groups: [{ title: 'Your bill', inputs: ['country', 'billAmount'] }],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'billAmount', label: 'Bill' }, { from: 'totalWithTip', label: 'Bill + suggested tip' }],
        title: 'Bill before and after the suggested tip'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'Why tipping norms vary so much by country',
        paragraphs: [
          'Tipping customs differ between countries for real structural reasons, not just cultural preference. In the United States, federal law lets employers pay tipped workers a direct cash wage as low as $2.13 an hour — a "tip credit" against the $7.25 federal minimum wage — which is a large part of why tipping there is treated as closer to mandatory than optional. Countries where hospitality staff are paid a full minimum wage regardless of tips, or where a service charge is already built into the price by law, naturally end up with a very different custom.',
          "This table deliberately covers only a handful of countries: each row is checked against one real, citable source — a national tourism board, a government page, or (for the US, where no government body publishes a customary percentage) a recognized etiquette authority — rather than the many blog posts recycling someone else's unsourced guess at a country's norm. A country you don't see here isn't necessarily a \"no tip\" country; it just means a source specific enough to cite confidently was not readily available.",
          "Select a country and enter your bill to see what the suggested tip comes to under that country's own sourced norm."
        ]
      },
      howTo: {
        intro: 'Choose a country and enter your bill amount.',
        steps: [
          { name: 'Choose a country', text: 'Only countries with a sourced tipping norm are listed — see the note for the citation behind each one.' },
          { name: 'Enter your bill', text: 'The pre-tip restaurant bill amount.' },
          { name: 'Read the suggested tip', text: "The headline is the suggested tip at that country's typical rate; the note explains what's actually customary there, in words." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "A single representative percentage per country, from the source cited in that country's note, multiplied by your bill. Countries where tipping is not customary, or where service is already included by law, use 0%.",
        expression: 'suggestedTip = billAmount × countryPercent ÷ 100\ntotalWithTip = billAmount + suggestedTip',
        terms: [
          { symbol: 'countryPercent', meaning: "That country's sourced representative tipping rate — see the table note for the citation." }
        ],
        note: 'A single percentage necessarily simplifies real variation by venue, service quality and region within a country. Treat it as a starting point, not a rule.'
      },
      workedExample: {
        intro: 'A $50 restaurant bill, compared across three of the countries in the table.',
        rows: [
          { label: 'United States (17.5%): 50 × 0.175', value: '$8.75 tip → $58.75 total' },
          { label: 'Australia (10%, upmarket dining): 50 × 0.10', value: '$5.00 tip → $55.00 total' },
          { label: 'Japan (not customary): 50 × 0', value: '$0.00 tip → $50.00 total' }
        ],
        result: 'The same $50 bill suggests $8.75, $5.00 or $0.00 depending only on which country you\'re in',
        explanation: "None of these figures are about the quality of service received — they reflect each country's own documented norm. Paying the bill amount exactly in Japan is the expected, polite outcome, not an insult to the server, which running the US percentage there would wrongly suggest."
      },
      watchOut: [
        { title: 'Only 5 countries are listed, deliberately', body: "Tipping advice for most countries online has no good source behind it. Rather than guess, this table only includes countries confirmed against a government page, tourism board, or recognized etiquette authority — check an equivalent source for anywhere else before you travel." },
        { title: "The US figure is etiquette guidance, not law", body: "Unlike the UK's statutory tip-allocation requirement, the US percentage comes from the Emily Post Institute, an etiquette authority, not a government source — though the US tipped-wage structure (a federal cash wage as low as $2.13/hour) is itself set by the Fair Labor Standards Act." },
        { title: "'Not customary' and 'already included' are different things", body: "Japan's norm is genuinely tip-free — nothing is added anywhere. France's displayed restaurant price already includes service by law, so you are still paying for service; it's just folded into the number on the menu rather than added afterward." },
        { title: 'A country-wide rate hides venue differences', body: 'Australia\'s 10% figure specifically describes upmarket restaurants with good service, per Tourism Australia\'s own guidance — casual dining in the same country commonly gets no tip at all.' },
        { title: 'A service charge already on the bill is not the same as a tip', body: 'Some UK and other restaurants add a discretionary service charge as a line on the bill itself. Check whether one is already included before adding a further tip on top of it.' }
      ],
      references: [
        { label: 'Emily Post Institute, Tipping Etiquette 101 (United States)', url: 'https://emilypost.com/advice/general-tipping-guide' },
        { label: 'US Department of Labor, Fact Sheet #15: Tipped Employees Under the FLSA', url: 'https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa' },
        { label: 'Japan Travel (JNTO), FAQ: Is there a tipping culture in Japan?', url: 'https://www.japan.travel/en/faq/' },
        { label: 'UK Parliament, Employment (Allocation of Tips) Act 2023', url: 'https://www.legislation.gov.uk/ukpga/2023/13' },
        { label: 'Légifrance, Arrêté du 27 mars 1987 (restaurant price display, France)', url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000338985/2021-09-27/' },
        { label: 'Tourism Australia, Travel tips and Australian currency', url: 'https://www.australia.com/en-us/facts-and-planning/about-australia/useful-tips.html' }
      ]
    },
    inputs: [
      { id: 'country', label: 'Country', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: TIPPING_COUNTRY_OPTIONS },
      { id: 'billAmount', label: 'Bill amount', type: 'currency', placeholder: '50', defaultValue: 50, step: 5, min: 0 }
    ],
    seo: {
      title: 'Tipping Abroad Calculator – Tipping Norms by Country',
      description: 'Free tipping abroad calculator. Look up sourced tipping norms for the US, Japan, UK, France and Australia, and get a suggested tip for your bill in each.',
      faq: [
        { question: 'How much should I tip in the US?', answer: "The Emily Post Institute recommends 15-20% of the pre-tax bill for sit-down restaurant service; this calculator uses the 17.5% midpoint. A $50 bill suggests an $8.75 tip." },
        { question: 'Do I need to tip in Japan?', answer: "No. Japan Travel's own FAQ states there is no tipping culture in Japan — pay only the amount shown on the bill at restaurants, taxis and hotels." },
        { question: 'Is tipping required in the UK?', answer: "No, it's discretionary. The UK's Employment (Allocation of Tips) Act 2023 only governs what happens to a tip once given — requiring it be passed to workers in full — not whether a customer has to leave one." },
        { question: 'Is service already included in restaurant prices in France?', answer: "Yes. A 1987 French government decree requires that displayed restaurant prices already include service (\"service compris\"), so any further tip is a small, optional round-up rather than an expected addition." },
        { question: 'Do people tip in Australia?', answer: "It's optional, not compulsory. Tourism Australia's own guidance says about 10% is common at upmarket restaurants for good service, while Australian hospitality staff are covered by minimum wage regardless." },
        { question: "Why isn't my destination country on this list?", answer: "Because a specific, confirmable source for that country's norm wasn't readily available. Rather than guess, this table stays limited to countries with a real citation — check your destination's own tourism board or a similar authoritative source directly." }
      ]
    },
    compute(values) {
      const percent = tippingPercentForCode(values.country);
      const suggestedTip = (values.billAmount * percent) / 100;
      const totalWithTip = values.billAmount + suggestedTip;
      return { country: values.country, percent, suggestedTip, totalWithTip };
    }
  }
];
