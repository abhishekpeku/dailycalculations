import type { CalculatorConfig } from './types.ts';

// --- Step 49 batch 1 (open the ecology category + carbon/footprint basics) constants ---

// Exact definition (NIST SP 811 Appendix B), same constant as lib/units.ts's own private MILE/1000.
const MILE_KM = 1.609344;

// Shared with biology.ts's own options-code guard (same precedent: normalizes the snapshot
// harness's 1.5x "typical" input scaling back into a valid option index). Kept local here rather
// than imported since data/calculators files don't share helpers with each other.
function normalizeOptionCode(raw: number, count: number) {
  const rounded = Math.round(raw);
  return ((rounded % count) + count) % count;
}

// carbon-footprint-calculator: EPA, "Greenhouse Gas Equivalencies Calculator - Calculations and
// References" (epa.gov/energy/ghg-equivalencies-calculator-calculations-and-references), fetched
// directly. Figures are the page's own published metric-ton factors, converted to kg here.
const ELECTRICITY_KG_PER_KWH = 3.94e-4 * 1000; // "3.94 x 10^-4 metric tons CO2/kWh" (electricity used)
const GASOLINE_KG_PER_GALLON = 8.887e-3 * 1000; // "8.887 x 10^-3 metric tons CO2/gallon of gasoline"
const NATURAL_GAS_KG_PER_THERM = 0.0053 * 1000; // "0.0053 metric tons CO2/therm"

// flight-carbon-footprint-calculator: UK Government, Greenhouse Gas Reporting: Conversion Factors
// 2024 (v1.1), "Business travel - air" worksheet, fetched directly and parsed from the published
// xlsx (assets.publishing.service.gov.uk). kg CO2e per passenger.km. "withRF" includes the ~70%
// uplift the sheet applies to approximate non-CO2 climate effects (contrails, water vapor, NOx);
// "withoutRF" is direct CO2 + CH4 + N2O only. Also used by carbon-footprint-calculator (index 4,
// long-haul average, withRF) for its own flights component.
const FLIGHT_FACTORS = [
  { label: 'Domestic (UK) – average passenger', withRF: 0.27257, withoutRF: 0.16098 },
  { label: 'Short-haul – average passenger', withRF: 0.18592, withoutRF: 0.10974 },
  { label: 'Short-haul – economy class', withRF: 0.18287, withoutRF: 0.10794 },
  { label: 'Short-haul – business class', withRF: 0.2743, withoutRF: 0.16191 },
  { label: 'Long-haul – average passenger', withRF: 0.26128, withoutRF: 0.15423 },
  { label: 'Long-haul – economy class', withRF: 0.20011, withoutRF: 0.11812 },
  { label: 'Long-haul – premium economy class', withRF: 0.32015, withoutRF: 0.18897 },
  { label: 'Long-haul – business class', withRF: 0.58028, withoutRF: 0.34252 },
  { label: 'Long-haul – first class', withRF: 0.8004, withoutRF: 0.47246 },
  { label: 'International (non-UK) – average passenger', withRF: 0.1758, withoutRF: 0.10377 }
];

// water-footprint-calculator: Water Footprint Network, "What is a water footprint?"
// (waterfootprint.org/water-footprint-2/what-is-a-water-footprint/), fetched directly. m3 per
// person per year, national averages.
const COUNTRY_WATER_FOOTPRINT_M3_PER_YEAR = [2840, 1380, 1070]; // United States, Japan, China
const BEEF_LITERS_PER_KG = 15000; // WFN: "~15 thousand litres" of water per kg of beef produced

// plastic-footprint-calculator: U.S. EPA, "National Overview: Facts and Figures on Materials,
// Waste and Recycling" (epa.gov/facts-and-figures-about-materials-waste-and-recycling), fetched
// directly, 2018 data (the most recent year with a complete published breakdown).
const TOTAL_MSW_LB_PER_PERSON_DAY_2018 = 4.9; // "4.9 pounds per person per day" in 2018
const PLASTIC_SHARE_OF_MSW_2018 = 0.122; // "35.7 million tons, or 12.2 percent of generation" in 2018
const DEFAULT_PLASTIC_RECYCLING_RATE_PCT_2018 = 8.7; // "...three million tons for a 8.7 percent recycling rate in 2018"

// meat-footprint-calculator: Poore, J. & Nemecek, T. (2018), "Reducing food's environmental
// impacts through producers and consumers," Science 360(6392) — global-average kg CO2eq per kg of
// product, as republished by Our World in Data (ourworldindata.org/grapher/ghg-per-kg-poore.csv),
// fetched directly from the chart's own CSV export.
const FOOD_CO2E_PER_KG = {
  beef: 99.48, // Beef (beef herd)
  pork: 12.31, // Pig Meat
  poultry: 9.87, // Poultry Meat
  fish: 13.63, // Fish (farmed)
  eggs: 4.67,
  milk: 3.15,
  tofu: 3.16
};

export const ecologyCalculators: CalculatorConfig[] = [
  {
    id: 'carbon-footprint-calculator',
    category: 'ecology',
    glyph: 'CO2',
    updatedAt: '2026-11-17',
    aliases: [
      'personal carbon footprint calculator',
      'household carbon footprint calculator',
      'co2 footprint calculator',
      'carbon emissions calculator',
      'greenhouse gas footprint calculator'
    ],
    related: ['flight-carbon-footprint-calculator', 'electricity-bill-calculator', 'commute-cost-calculator', 'meat-footprint-calculator'],
    title: 'Carbon Footprint Calculator',
    description:
      'Estimate your household’s yearly carbon footprint from electricity use, natural gas heating, gasoline, and flights, using published EPA and UK government emissions factors, broken down by source.',
    example:
      'A household using 900 kWh of electricity and 50 therms of natural gas a month, 500 gallons of gasoline a year, and flying 3,000 miles a year emits about 13,140 kg (13.14 metric tons) of CO2e a year — gasoline and electricity are the two biggest shares.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is a carbon footprint?',
        paragraphs: [
          'A carbon footprint is the total amount of greenhouse gas emitted, directly or indirectly, by a person, household, or activity, expressed as an equivalent weight of carbon dioxide (CO2e). This calculator adds up four of the biggest everyday sources for a typical household: the electricity you use at home, the natural gas you burn for heating or hot water, the gasoline your vehicles burn, and the flights you take.',
          'Each source has a published emissions factor: a fixed amount of CO2 (or CO2-equivalent) released per unit of activity. The U.S. Environmental Protection Agency publishes factors for electricity (per kilowatt-hour), gasoline (per gallon), and natural gas (per therm) in its Greenhouse Gas Equivalencies Calculator reference tables. Flights use a separate factor, published by the UK government, because aviation’s climate impact depends on distance and cabin class in a way home energy use does not.',
          'Multiplying your own usage by each factor, then adding the results, gives a reasonable estimate of your footprint from these four sources. It is not a complete personal footprint — food, goods, and services all carry an embedded carbon cost too — but it covers the pieces people can measure most directly from a utility bill, a gas station receipt, and a boarding pass.'
        ]
      },
      howTo: {
        intro: 'Fill in your home energy use, vehicle fuel, and flight distance; the yearly total and its breakdown appear instantly.',
        steps: [
          { name: 'Enter electricity use', text: 'Type your average monthly electricity use in kilowatt-hours, from a recent utility bill.' },
          { name: 'Enter natural gas use', text: 'Type your average monthly natural gas use in therms, if your home uses gas heating, water heating, or cooking. Leave it at 0 if you do not use gas.' },
          { name: 'Enter vehicle fuel use', text: 'Type how many gallons of gasoline your vehicles burn in a typical year.' },
          { name: 'Enter flight distance', text: 'Type the total round-trip miles you fly in a year, adding up every trip.' },
          { name: 'Read the breakdown', text: 'The headline is your estimated yearly footprint in kilograms and metric tons of CO2e, with each source’s share shown below and in the chart.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each source is usage multiplied by its own published emissions factor; the total is their sum.',
        expression:
          'electricity = kWh/month × 12 × 0.394 kg/kWh\nnatural gas = therms/month × 12 × 5.3 kg/therm\ngasoline = gallons/year × 8.887 kg/gallon\nflights = miles/year × 1.609344 × 0.261 kg/km\ntotal = electricity + natural gas + gasoline + flights',
        terms: [
          { symbol: '0.394 kg/kWh', meaning: 'EPA’s emission factor for electricity used (U.S. national average, 2022 data).' },
          { symbol: '5.3 kg/therm', meaning: 'EPA’s emission factor for natural gas combustion.' },
          { symbol: '8.887 kg/gallon', meaning: 'EPA’s emission factor for burning a gallon of gasoline.' },
          { symbol: '0.261 kg/km', meaning: 'UK Government’s long-haul average-passenger flight factor, including the added climate effect of non-CO2 emissions.' }
        ],
        note: 'An estimate from four common sources, not a full personal footprint. It leaves out food, purchased goods, and services, which the Meat & Diet Footprint Calculator partly covers.'
      },
      workedExample: {
        intro: 'A household uses 900 kWh of electricity and 50 therms of natural gas a month, burns 500 gallons of gasoline a year, and flies 3,000 miles a year.',
        rows: [
          { label: 'Electricity (900 × 12 × 0.394)', value: '4,255.2 kg' },
          { label: 'Natural gas (50 × 12 × 5.3)', value: '3,180.0 kg' },
          { label: 'Gasoline (500 × 8.887)', value: '4,443.5 kg' },
          { label: 'Flights (3,000 mi × 1.609344 × 0.261)', value: '≈1,261.5 kg' },
          { label: 'Total', value: '≈13,140.2 kg (13.14 t)' }
        ],
        result: 'About 13,140 kg (13.14 metric tons) of CO2e a year',
        explanation:
          'Gasoline is the largest share at 33.8%, just ahead of electricity at 32.4%; natural gas is 24.2% and flights are 9.6%. Removing the flights entirely would lower the total by that same 9.6%, to about 11,879 kg.'
      },
      watchOut: [
        {
          title: 'This is four sources, not your whole footprint',
          body: 'Food, clothing, electronics, and other purchased goods and services all carry embedded emissions that this calculator does not count. A full personal footprint, like EPA’s own Household Carbon Footprint Calculator, typically adds a "goods and services" estimate on top of these four.'
        },
        {
          title: 'The electricity factor is a national average',
          body: '0.394 kg CO2 per kWh is EPA’s U.S. average for electricity actually used; your real grid mix (more coal, more hydro, more solar) can push your own rate well above or below it. EPA’s eGRID tool publishes factors by region for a more local estimate.'
        },
        {
          title: 'Flights use one simplified factor',
          body: 'This calculator applies a single long-haul, average-passenger flight factor to every mile you enter, including the added climate effect of non-CO2 emissions. The Flight Carbon Footprint Calculator breaks this down by domestic, short-haul, long-haul, and cabin class instead.'
        },
        {
          title: 'Gasoline only — not diesel or electric vehicles',
          body: 'The gasoline factor does not apply to diesel or to the electricity an EV draws from the grid; an EV’s footprint runs through the electricity figure instead, at whatever rate your home charges at.'
        },
        {
          title: 'Estimates only',
          body: 'These are standard published emissions factors applied to numbers you supply, not a measurement of your actual emissions. Treat the result as a reasonable planning estimate, not an exact audit.'
        }
      ],
      references: [
        { label: 'U.S. EPA, Greenhouse Gas Equivalencies Calculator – Calculations and References', url: 'https://www.epa.gov/energy/ghg-equivalencies-calculator-calculations-and-references' },
        { label: 'UK Government, Greenhouse Gas Reporting: Conversion Factors 2024 ("Business travel – air")', url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024' },
        { label: 'U.S. EPA, Household Carbon Footprint Calculator', url: 'https://www.epa.gov/ghgemissions/household-carbon-footprint-calculator' }
      ]
    },
    inputs: [
      { id: 'kwhPerMonth', label: 'Electricity use (kWh/month)', type: 'number', placeholder: '900', defaultValue: 900, step: 10, min: 0 },
      { id: 'thermsPerMonth', label: 'Natural gas use (therms/month)', type: 'number', placeholder: '50', defaultValue: 50, step: 5, min: 0 },
      { id: 'gallonsPerYear', label: 'Vehicle fuel use (gallons/year)', type: 'number', placeholder: '500', defaultValue: 500, step: 10, min: 0 },
      { id: 'flightMiles', label: 'Flights (round-trip miles/year)', type: 'number', placeholder: '3000', defaultValue: 3000, step: 100, min: 0, dimension: 'length', unit: 'mi' }
    ],
    breakdown: {
      headline: 'totalKg',
      headlineLabel: 'Estimated carbon footprint (per year)',
      outputs: [
        { id: 'totalKg', label: 'Estimated footprint', dimension: 'mass', alsoIn: ['t'] },
        { id: 'electricityKg', label: 'Electricity', dimension: 'mass' },
        { id: 'gasolineKg', label: 'Vehicle fuel (gasoline)', dimension: 'mass' },
        { id: 'naturalGasKg', label: 'Home heating (natural gas)', dimension: 'mass' },
        { id: 'flightKg', label: 'Flights', dimension: 'mass' }
      ],
      groups: [
        { title: 'Home energy', inputs: ['kwhPerMonth', 'thermsPerMonth'] },
        { title: 'Travel', inputs: ['gallonsPerYear', 'flightMiles'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'electricityKg', label: 'Electricity' },
          { from: 'gasolineKg', label: 'Gasoline' },
          { from: 'naturalGasKg', label: 'Natural gas' },
          { from: 'flightKg', label: 'Flights' }
        ],
        center: 'totalKg',
        centerSub: 'kg CO2e/year'
      }
    },
    seo: {
      title: 'Carbon Footprint Calculator – Household CO2 Estimate',
      description: 'Free carbon footprint calculator. Estimate your household’s yearly CO2 emissions from electricity, natural gas, gasoline, and flights, broken down by source.',
      faq: [
        {
          question: 'How do I calculate my carbon footprint?',
          answer:
            'Multiply your electricity use (kWh/month) by 12 and by 0.394 kg CO2 per kWh, your natural gas (therms/month) by 12 and 5.3 kg per therm, your gasoline (gallons/year) by 8.887 kg per gallon, and your flight miles by 1.609344 and 0.261 kg per km, then add the four results. The example above comes to about 13,140 kg (13.14 metric tons) a year.'
        },
        {
          question: 'What is included in this estimate?',
          answer:
            'Four common sources: home electricity, natural gas heating, gasoline for your vehicles, and flights. It leaves out food, clothing, and other purchased goods and services, which carry their own embedded emissions.'
        },
        {
          question: 'How much of a typical footprint comes from flying?',
          answer:
            'In the worked example — 3,000 miles of flying a year against 900 kWh of electricity, 50 therms of gas, and 500 gallons of gasoline — flights are about 9.6% of the total. Removing them drops the yearly estimate from about 13,140 kg to about 11,879 kg.'
        },
        {
          question: 'What is the biggest source in a typical footprint?',
          answer: 'In the worked example, gasoline is the largest share at 33.8%, narrowly ahead of electricity at 32.4%. Which one leads for you depends on how much you drive versus how much electricity your home uses.'
        },
        {
          question: 'Does this cover food or things I buy?',
          answer:
            'No. Food and goods have their own carbon intensity — a kilogram of beef, for example, carries roughly 100 kg of CO2-equivalent from production alone. Use the Meat & Diet Footprint Calculator to estimate that separately.'
        },
        {
          question: 'How can I lower my footprint?',
          answer: 'The biggest levers are usually the biggest slices here: driving less or more efficiently, reducing long flights, and lowering electricity and gas use through efficiency improvements.'
        }
      ]
    },
    compute(values) {
      const electricityKg = values.kwhPerMonth * 12 * ELECTRICITY_KG_PER_KWH;
      const naturalGasKg = values.thermsPerMonth * 12 * NATURAL_GAS_KG_PER_THERM;
      const gasolineKg = values.gallonsPerYear * GASOLINE_KG_PER_GALLON;
      const flightKg = values.flightMiles * MILE_KM * FLIGHT_FACTORS[4].withRF;
      const totalKg = electricityKg + naturalGasKg + gasolineKg + flightKg;
      return { electricityKg, naturalGasKg, gasolineKg, flightKg, totalKg };
    }
  },
];
