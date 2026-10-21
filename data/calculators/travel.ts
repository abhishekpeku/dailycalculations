import type { CalculatorConfig } from './types.ts';

export const travelCalculators: CalculatorConfig[] = [
  {
    id: 'travel-budget-calculator',
    category: 'travel',
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
  }
];
