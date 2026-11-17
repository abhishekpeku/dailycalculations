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

// --- Step 49 batch 2 (population & biodiversity ecology) constants ---

// shannon-diversity-index-calculator and simpson-diversity-index-calculator share the same
// 5-slot species-count input pattern and the same default worked example (40/30/20/8/2
// individuals, 100 total) so the two pages' results are directly comparable.
const DEFAULT_SPECIES_COUNTS = [40, 30, 20, 8, 2];

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
  {
    id: 'flight-carbon-footprint-calculator',
    category: 'ecology',
    glyph: 'km',
    updatedAt: '2026-11-17',
    aliases: [
      'flight emissions calculator',
      'airplane carbon footprint calculator',
      'flying carbon footprint calculator',
      'plane co2 calculator',
      'air travel emissions calculator'
    ],
    related: ['carbon-footprint-calculator', 'travel-budget-calculator', 'jet-lag-calculator', 'meat-footprint-calculator'],
    title: 'Flight Carbon Footprint Calculator',
    description:
      'Estimate the CO2e emissions of a flight from its distance, haul length (domestic, short-haul, long-haul, or international), and cabin class, using the UK government’s published 2024 aviation emissions factors.',
    example:
      'A 3,400-mile long-haul round trip in economy class emits about 2,189.9 kg (2.19 metric tons) of CO2e, including the added climate effect of non-CO2 emissions — about 2.9 times less than the same trip in business class.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is a flight’s carbon footprint?',
        paragraphs: [
          'Flying is one of the most carbon-intensive things an individual does, mile for mile, because burning jet fuel at altitude releases both CO2 and a mix of other emissions — water vapor, contrails, and nitrogen oxides — that add to its climate impact beyond CO2 alone. This calculator uses the UK Government’s published 2024 Greenhouse Gas Reporting Conversion Factors, the same figures UK organizations use to report business travel emissions, to estimate a single flight’s footprint from its distance, haul length, and cabin class.',
          'The government publishes two versions of each factor: one that includes only the direct CO2 (plus a small amount of methane and nitrous oxide), and one that adds roughly 70% to the CO2 portion to approximate the extra warming effect of flying at altitude. It recommends organizations use the higher, "with non-CO2 effects" figure to capture the fuller climate impact, which is this calculator’s default.',
          'Haul length matters because a flight’s total fuel burn is weighted toward takeoff and climb, which a short flight cannot spread over many miles — a domestic UK flight actually emits more CO2e per passenger-kilometer than a long-haul one, even though the long-haul flight’s total footprint is far larger simply because it covers so much more distance. Cabin class matters for a different reason: a business or first-class seat takes up more of the plane’s floor space, so it carries a proportionally larger share of the same flight’s total emissions.'
        ]
      },
      howTo: {
        intro: 'Enter your flight distance, pick the closest haul length and class, and choose whether to include non-CO2 effects.',
        steps: [
          { name: 'Enter the distance', text: 'Type the one-way distance, in miles or kilometers. Switch the unit from the menu if your source gives kilometers.' },
          { name: 'Choose one-way or round trip', text: 'Pick "Round trip" to double the one-way distance, or "One-way" to leave it as entered.' },
          { name: 'Pick the haul length and class', text: 'Choose the option closest to your flight: domestic, short-haul, or long-haul (each with an economy/business breakdown where published), or international for flights between two non-UK countries.' },
          { name: 'Choose whether to include non-CO2 effects', text: 'Leave "Including non-CO2 effects" selected for the fuller climate-impact estimate, or switch to CO2-only to match a simpler reporting standard.' },
          { name: 'Read the result', text: 'The headline is the total CO2e for the trip, in kilograms and metric tons.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Emissions are distance multiplied by a published factor for the chosen haul, class, and effect scope.',
        expression: 'distance_km = distance × 1.609344 (if entered in miles)\ntrip_km = distance_km × (2 if round trip else 1)\nemissions = trip_km × factor(haul, class, effects)',
        terms: [
          { symbol: 'factor', meaning: 'The UK Government’s published kg CO2e per passenger-kilometer for the chosen haul length, class, and effect scope (with or without non-CO2 effects).' },
          { symbol: 'haul', meaning: 'Domestic (within the UK), short-haul (within Europe), long-haul (outside Europe), or international (between two non-UK countries).' }
        ],
        note: 'Published factors are UK Government averages for reporting purposes, not a measurement of any specific airline, aircraft, or flight’s actual fuel burn.'
      },
      workedExample: {
        intro: 'A round-trip long-haul flight, 3,400 miles each way, flown in economy class, including non-CO2 effects.',
        rows: [
          { label: 'One-way distance in km (3,400 × 1.609344)', value: '5,471.77 km' },
          { label: 'Round-trip distance', value: '10,943.53 km' },
          { label: 'Economy, long-haul, with non-CO2 effects factor', value: '0.20011 kg CO2e/km' },
          { label: 'Total (10,943.53 × 0.20011)', value: '≈2,189.91 kg' }
        ],
        result: 'About 2,189.9 kg (2.19 metric tons) of CO2e',
        explanation:
          'The same round trip in business class comes to about 6,350.3 kg — 2.9 times more — because a business-class seat is weighted with a larger share of the plane’s total emissions. Using the CO2-only factor instead of the non-CO2-inclusive one gives about 1,292.7 kg, roughly 69% less, which shows how much the choice of factor can change the result.'
      },
      watchOut: [
        {
          title: 'Non-CO2 effects add roughly 70% to the CO2 figure',
          body: 'The UK Government applies that uplift to the CO2 portion only, which is why the overall "with non-CO2 effects" total in the worked example above comes out about 69% higher than the CO2-only total, not exactly 70% — the small methane and nitrous oxide amounts in both versions don’t get the same uplift. The government’s own guidance flags real scientific uncertainty in exactly how large this effect is, even though it recommends including it.'
        },
        {
          title: 'Business and first class cost far more per passenger',
          body: 'A long-haul business-class seat carries about 2.9 times the emissions of the same flight in economy, because the factors are weighted by the floor space each seat takes up, not by the passenger’s own weight.'
        },
        {
          title: 'These are UK Government averages, not your airline’s number',
          body: 'An individual airline or aircraft’s real fuel efficiency can be better or worse than the published average. Some airlines publish their own route-specific CO2 figures at booking, which will differ from this estimate.'
        },
        {
          title: 'Domestic does not mean low-emission',
          body: 'A domestic UK flight’s factor (0.273 kg CO2e/km, with non-CO2 effects) is actually higher per kilometer than long-haul’s average (0.261 kg CO2e/km), because so much of a short flight’s fuel burn goes to takeoff and climb rather than efficient cruising.'
        },
        {
          title: 'This is one leg, not a whole trip',
          body: 'Add each leg of a multi-stop trip separately — a layover adds an extra takeoff and landing, which this single-distance calculation does not capture.'
        }
      ],
      references: [
        { label: 'UK Government, Greenhouse Gas Reporting: Conversion Factors 2024 ("Business travel – air" and "Haul definition" worksheets)', url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024' },
        { label: 'UK Government, 2024 Greenhouse Gas Conversion Factors: Methodology Paper', url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024' }
      ]
    },
    inputs: [
      { id: 'distance', label: 'Flight distance (one-way)', type: 'number', placeholder: '3400', defaultValue: 3400, step: 50, min: 0, dimension: 'length', unit: 'mi' },
      {
        id: 'roundTrip',
        label: 'Trip type',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'One-way' },
          { value: 1, label: 'Round trip' }
        ]
      },
      {
        id: 'flightType',
        label: 'Haul length & class',
        type: 'number',
        placeholder: '5',
        defaultValue: 5,
        step: 1,
        min: 0,
        options: FLIGHT_FACTORS.map((f, i) => ({ value: i, label: f.label }))
      },
      {
        id: 'includeRF',
        label: 'Non-CO2 effects',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'CO2 only (direct effects)' },
          { value: 1, label: 'Including non-CO2 effects (recommended)' }
        ]
      }
    ],
    breakdown: {
      headline: 'totalKg',
      headlineLabel: 'Estimated flight footprint',
      outputs: [{ id: 'totalKg', label: 'Total CO2e', dimension: 'mass', alsoIn: ['t'] }],
      groups: [{ title: 'Flight details', inputs: ['distance', 'roundTrip', 'flightType', 'includeRF'] }]
    },
    seo: {
      title: 'Flight Carbon Footprint Calculator – CO2 by Flight',
      description: 'Free flight carbon footprint calculator. Estimate CO2e emissions from flight distance, haul length, and cabin class using UK government aviation emissions factors.',
      faq: [
        {
          question: 'How much CO2 does a flight produce?',
          answer:
            'Multiply the round-trip distance in kilometers by a published factor for the haul length and class. A 3,400-mile long-haul round trip in economy, including non-CO2 effects, comes to about 2,189.9 kg (2.19 metric tons) of CO2e.'
        },
        {
          question: 'Why does business class produce more emissions?',
          answer:
            'The published factors split a flight’s total emissions by the floor space each cabin class takes up, not by passenger weight. A business-class seat occupies more of the plane, so in this example it carries about 2.9 times the economy figure for the same flight.'
        },
        {
          question: 'What does "including non-CO2 effects" mean?',
          answer:
            'Burning jet fuel at altitude releases more than CO2 — water vapor, contrails, and nitrogen oxides also affect the climate. The UK Government’s factors add roughly 70% to the CO2 figure to approximate that extra effect, and recommend reporting with it included.'
        },
        {
          question: 'Is a short domestic flight actually more efficient than a long-haul one?',
          answer:
            'No — per kilometer, it is less efficient. The UK domestic average is about 0.273 kg CO2e/km, higher than long-haul’s 0.261 kg CO2e/km, because takeoff and climb burn a fixed amount of fuel that a short flight cannot spread over many miles. Its total footprint is smaller only because the trip itself is much shorter.'
        },
        {
          question: 'What counts as "short-haul" versus "long-haul"?',
          answer:
            'The UK Government’s own Haul Definition table classifies flights by territory: domestic is within the UK, short-haul is within Europe, long-haul is everywhere else, and international covers flights between two non-UK countries.'
        },
        {
          question: 'Does this include a connecting flight or layover?',
          answer: 'No — each leg of a multi-stop trip has its own takeoff and landing, so add them separately rather than entering the combined distance as a single flight.'
        }
      ]
    },
    compute(values) {
      const code = normalizeOptionCode(values.flightType, FLIGHT_FACTORS.length);
      const includeRF = normalizeOptionCode(values.includeRF, 2) === 1;
      const factorSet = FLIGHT_FACTORS[code];
      const factor = includeRF ? factorSet.withRF : factorSet.withoutRF;
      const tripMultiplier = normalizeOptionCode(values.roundTrip, 2) === 1 ? 2 : 1;
      const tripKm = values.distance * MILE_KM * tripMultiplier;
      const totalKg = tripKm * factor;
      return { totalKg };
    }
  },
  {
    id: 'water-footprint-calculator',
    category: 'ecology',
    glyph: 'H2O',
    updatedAt: '2026-11-17',
    aliases: [
      'water footprint calculator',
      'virtual water calculator',
      'personal water footprint calculator',
      'water usage footprint calculator',
      'how much water do i use calculator'
    ],
    related: ['carbon-footprint-calculator', 'meat-footprint-calculator', 'plastic-footprint-calculator', 'water-intake-calculator'],
    title: 'Water Footprint Calculator',
    description:
      'Estimate your household’s total water footprint — direct use plus the indirect "virtual water" embedded in food — using the Water Footprint Network’s published national averages.',
    example:
      'A household of 4 people in the United States has a water footprint of about 11,360,000 liters a year; eating just 1 kg of beef a week alone accounts for about 27.5% of one person’s share of that.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is a water footprint?',
        paragraphs: [
          'A water footprint is the total volume of fresh water used to produce everything a person consumes, not just the water that comes out of a tap. The Water Footprint Network, the research group that coined the term, splits it into direct water use (drinking, bathing, watering a lawn) and indirect, or "virtual," water: the water embedded in growing food, making clothes, and manufacturing goods, almost all of it invisible to the person who eventually uses the product.',
          'The indirect share dominates for most people. A single kilogram of beef, for example, represents about 15,000 liters of water once you count what the animal drank, the water used to grow its feed, and the water needed to process it — far more than anyone would drink directly in a year. That is why a country’s total water footprint varies so much with diet and consumption patterns, not just its climate or household plumbing.',
          'This calculator starts from the Water Footprint Network’s own published national averages — the United States, Japan, and China differ by nearly threefold — and lets you add a specific comparison: how much of that footprint a given amount of beef consumption represents on its own.'
        ]
      },
      howTo: {
        intro: 'Pick a country average, set your household size, and optionally compare your beef consumption against it.',
        steps: [
          { name: 'Choose a country average', text: 'Pick the closest published national average: United States, Japan, or China. These differ mainly by diet and industrial consumption patterns.' },
          { name: 'Enter your household size', text: 'The number of people the total should cover.' },
          { name: 'Enter beef eaten per week (optional)', text: 'Type an amount in kilograms to see how much of one person’s footprint that beef alone represents, using the Water Footprint Network’s own ~15,000-liters-per-kilogram figure.' },
          { name: 'Read the totals', text: 'The headline is your household’s total water footprint per year, with the per-person daily figure and the beef comparison below it.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A household’s footprint is the per-person national average multiplied by household size; the beef comparison is a separate, illustrative figure.',
        expression: 'perPersonPerYear = countryAverage (m³/year) × 1,000 L/m³\nhouseholdPerYear = perPersonPerYear × householdSize\nbeefWater = beefKgPerWeek × 52 × 15,000 L/kg',
        terms: [
          { symbol: 'countryAverage', meaning: 'The Water Footprint Network’s published national average total water footprint per person, in cubic meters a year.' },
          { symbol: '15,000 L/kg', meaning: 'The Water Footprint Network’s published water footprint of beef, per kilogram.' }
        ],
        note: 'The beef figure is a comparison, not an addition — it is already part of a country’s average diet-driven footprint, so it is shown separately rather than added on top of the total.'
      },
      workedExample: {
        intro: 'A household of 4 people in the United States, where one person eats about 1 kg of beef a week.',
        rows: [
          { label: 'US average per person (2,840 m³/year × 1,000)', value: '2,840,000 L/year' },
          { label: 'Per person per day (÷ 365)', value: '≈7,781 L/day' },
          { label: 'Household of 4 per year (× 4)', value: '11,360,000 L/year' },
          { label: 'Beef alone, per year (1 × 52 × 15,000)', value: '780,000 L/year' },
          { label: 'Beef share of one person’s footprint (780,000 ÷ 2,840,000)', value: '≈27.5%' }
        ],
        result: 'About 11,360,000 liters a year for the household',
        explanation: 'One person’s 1 kg-a-week beef habit alone accounts for about 27.5% of that same person’s average US water footprint — more than a quarter of it from a single food.'
      },
      watchOut: [
        {
          title: 'Most of this is invisible, not tap water',
          body: 'The Water Footprint Network’s own figures show the indirect, "virtual" water in food and goods is generally far larger than the water that comes out of a tap — a national average like 2,840 m³ a year for the US is overwhelmingly diet- and consumption-driven, not showers and dishwashing.'
        },
        {
          title: 'The beef figure is not added on top of the total',
          body: 'The country average already reflects an average diet, beef included. The beef comparison figure shows how much of that average one food represents, not an extra amount to add to the household total.'
        },
        {
          title: 'National averages, not personal measurements',
          body: 'These are country-wide averages published by the Water Footprint Network. An individual household’s actual footprint varies with diet, income, and consumption habits, sometimes substantially.'
        },
        {
          title: 'Blue, green, and grey water are all counted together',
          body: 'The Water Footprint Network’s totals combine three different kinds of water: "blue" (surface and groundwater), "green" (rainwater used by crops), and "grey" (water needed to dilute pollution to safe levels). This calculator does not separate them.'
        }
      ],
      references: [
        { label: 'Water Footprint Network, "What is a water footprint?"', url: 'https://www.waterfootprint.org/water-footprint-2/what-is-a-water-footprint/' },
        { label: 'Water Footprint Network, "Frequently Asked Questions"', url: 'https://www.waterfootprint.org/water-footprint-2/frequently-asked-questions/' }
      ]
    },
    inputs: [
      {
        id: 'country',
        label: 'Country average',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'United States (2,840 m³/year)' },
          { value: 1, label: 'Japan (1,380 m³/year)' },
          { value: 2, label: 'China (1,070 m³/year)' }
        ]
      },
      { id: 'householdSize', label: 'Household size', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 1 },
      { id: 'beefKgPerWeek', label: 'Beef eaten per week', type: 'number', placeholder: '1', defaultValue: 1, step: 0.25, min: 0, dimension: 'mass', unit: 'kg' }
    ],
    breakdown: {
      headline: 'householdLitersPerYear',
      headlineLabel: 'Household’s water footprint (per year)',
      outputs: [
        { id: 'householdLitersPerYear', label: 'Household total (per year)', dimension: 'volume', unit: 'L', alsoIn: ['gal'] },
        { id: 'perPersonLitersPerDay', label: 'Per person (per day)', dimension: 'volume', unit: 'L', alsoIn: ['gal'] },
        { id: 'beefLitersPerYear', label: 'Beef alone (per year)', dimension: 'volume', unit: 'L' },
        { id: 'beefShareOfPersonalFootprintPct', label: 'Beef’s share of one person’s footprint', format: 'percent' }
      ],
      groups: [
        { title: 'Household', inputs: ['country', 'householdSize'] },
        { title: 'Diet comparison (optional)', inputs: ['beefKgPerWeek'], optional: true }
      ],
      derive: () => ({
        usYearly: COUNTRY_WATER_FOOTPRINT_M3_PER_YEAR[0] * 1000,
        japanYearly: COUNTRY_WATER_FOOTPRINT_M3_PER_YEAR[1] * 1000,
        chinaYearly: COUNTRY_WATER_FOOTPRINT_M3_PER_YEAR[2] * 1000
      }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'usYearly', label: 'United States' },
          { from: 'japanYearly', label: 'Japan' },
          { from: 'chinaYearly', label: 'China' }
        ],
        title: 'National average per person, per year',
        highlight: 0
      }
    },
    seo: {
      title: 'Water Footprint Calculator – Direct & Virtual Water Use',
      description: 'Free water footprint calculator. Estimate your household’s direct and virtual (embedded) water use from national averages published by the Water Footprint Network.',
      faq: [
        {
          question: 'What is a water footprint?',
          answer:
            'The total fresh water used to produce everything you consume — not just tap water, but the "virtual water" embedded in food and goods. A US household of 4, at the national average, comes to about 11,360,000 liters a year.'
        },
        {
          question: 'Why is beef’s water footprint so high?',
          answer:
            'The Water Footprint Network puts it at about 15,000 liters per kilogram, counting what the animal drank, the water used to grow its feed, and processing. In the worked example, 1 kg a week of beef alone accounts for about 27.5% of one person’s average US footprint.'
        },
        {
          question: 'How much water does the average American use?',
          answer:
            'About 2,840 cubic meters (2,840,000 liters) a year per person, or roughly 7,781 liters a day, per the Water Footprint Network’s published national average — nearly twice Japan’s average and more than 2.6 times China’s.'
        },
        {
          question: 'Is most of my water footprint tap water?',
          answer: 'No. The Water Footprint Network’s own analysis finds the indirect, "virtual" water embedded in food and other goods generally dwarfs direct household use — most of a typical footprint never comes out of your own tap.'
        },
        {
          question: 'Why do countries’ averages differ so much?',
          answer:
            'Mainly diet and industrial consumption, not climate. The US figure (2,840 m³/year) is roughly twice Japan’s (1,380 m³/year) and nearly 2.7 times China’s (1,070 m³/year), largely reflecting how much water-intensive food, like beef, each country eats on average.'
        },
        {
          question: 'Does the beef figure get added to my household total?',
          answer: 'No — it is shown as a comparison, not an addition. The country average already includes an average diet, beef included, so adding the beef figure on top would double-count it.'
        }
      ]
    },
    compute(values) {
      const code = normalizeOptionCode(values.country, COUNTRY_WATER_FOOTPRINT_M3_PER_YEAR.length);
      const perPersonLitersPerYear = COUNTRY_WATER_FOOTPRINT_M3_PER_YEAR[code] * 1000;
      const perPersonLitersPerDay = perPersonLitersPerYear / 365;
      const householdLitersPerYear = perPersonLitersPerYear * values.householdSize;
      const beefLitersPerYear = values.beefKgPerWeek * 52 * BEEF_LITERS_PER_KG;
      const beefShareOfPersonalFootprintPct = (beefLitersPerYear / perPersonLitersPerYear) * 100;
      return { householdLitersPerYear, perPersonLitersPerDay, beefLitersPerYear, beefShareOfPersonalFootprintPct };
    }
  },
  {
    id: 'plastic-footprint-calculator',
    category: 'ecology',
    glyph: 'kg',
    updatedAt: '2026-11-17',
    aliases: [
      'plastic footprint calculator',
      'plastic waste calculator',
      'how much plastic waste do i produce',
      'personal plastic waste calculator',
      'household plastic waste calculator'
    ],
    related: ['carbon-footprint-calculator', 'water-footprint-calculator', 'meat-footprint-calculator', 'electricity-bill-calculator'],
    title: 'Plastic Footprint Calculator',
    description: 'Estimate your household’s yearly plastic waste and how much of it is likely to be recycled, from the EPA’s published 2018 national municipal solid waste statistics.',
    example:
      'A household of 4 people generates about 872.8 lb of plastic waste a year at the US average rate, of which about 75.9 lb (8.7%) gets recycled and the remaining 796.9 lb is landfilled, incinerated, or littered.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is a plastic footprint?',
        paragraphs: [
          'A plastic footprint is an estimate of how much plastic waste a person or household generates in a year — packaging, containers, bags, and other single-use and durable plastic items thrown away once their useful life ends. The U.S. Environmental Protection Agency tracks this at a national scale as part of its municipal solid waste (MSW) statistics: in 2018, the most recent year with a complete published breakdown, plastics made up 12.2% of the roughly 292 million tons of MSW the country generated, or 35.7 million tons.',
          'This calculator starts from two of the EPA’s own published national figures — total MSW generated per person per day, and the share of it that is plastic — to estimate an average person’s plastic waste, then scales it by household size. It also applies the EPA’s reported national plastics recycling rate, 8.7% in 2018, to split that total into a recycled share and a landfilled, incinerated, or littered share, which you can adjust if your own household recycles at a different rate.',
          'The 8.7% figure is lower than many people expect. Plastic packaging comes in many different resin types, some far easier to recycle profitably than others — PET bottles and jars recycled at 29.1% in 2018, for example, and HDPE natural bottles at 29.3%, both well above the all-plastics average.'
        ]
      },
      howTo: {
        intro: 'Set your household size and, if you know it, your own recycling rate; the yearly totals fill in instantly.',
        steps: [
          { name: 'Enter household size', text: 'The number of people the estimate should cover.' },
          { name: 'Set a recycling rate', text: 'Leave it at the EPA’s 2018 national average, 8.7%, or raise it if your household or municipality recycles plastic more thoroughly.' },
          { name: 'Read the total', text: 'The headline is your household’s estimated yearly plastic waste, in pounds and kilograms.' },
          { name: 'Check the recycled vs. non-recycled split', text: 'The breakdown shows how much of that total is likely recycled versus landfilled, incinerated, or littered, based on the recycling rate you set.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A person’s plastic waste is the EPA’s total MSW rate times the share that is plastic; the household and recycling splits follow from it.',
        expression: 'plastic (lb/person/day) = 4.9 × 0.122\nplastic (lb/person/year) = plastic (lb/day) × 365\nhousehold (lb/year) = plastic (lb/person/year) × household size\nrecycled = household × recycling rate\nnot recycled = household − recycled',
        terms: [
          { symbol: '4.9', meaning: 'The EPA’s published total municipal solid waste generation rate for 2018, in pounds per person per day.' },
          { symbol: '0.122', meaning: 'The EPA’s published share of 2018 MSW generation that was plastic (12.2%, or 35.7 million of roughly 292 million tons).' },
          { symbol: 'recycling rate', meaning: 'The EPA’s published 2018 national plastics recycling rate, 8.7%, adjustable to your own.' }
        ],
        note: 'A national-average estimate, not a measurement of your own trash. Your actual plastic waste depends on your household’s specific habits and packaging choices.'
      },
      workedExample: {
        intro: 'A household of 4 people, at the EPA’s 2018 national averages, with the default 8.7% recycling rate.',
        rows: [
          { label: 'Plastic per person per day (4.9 × 0.122)', value: '0.5978 lb' },
          { label: 'Plastic per person per year (× 365)', value: '218.2 lb' },
          { label: 'Household of 4 per year (× 4)', value: '872.8 lb' },
          { label: 'Recycled (872.8 × 8.7%)', value: '75.9 lb' },
          { label: 'Not recycled (872.8 − 75.9)', value: '796.9 lb' }
        ],
        result: 'About 872.8 lb (395.9 kg) of plastic waste a year',
        explanation:
          'At double the national recycling rate (17.4%), the same household’s non-recycled amount would drop from 796.9 lb to about 720.9 lb — a 9.5% reduction, which shows how much of this total simply is not collected for recycling in the first place.'
      },
      watchOut: [
        {
          title: 'This is a national average, not your household’s actual waste',
          body: 'The EPA’s 4.9 lb and 12.2% figures are nationwide 2018 averages across all types of households and products. A household that buys more packaged goods, or fewer, will generate more or less than this estimate.'
        },
        {
          title: '8.7% is the average across all plastics',
          body: 'Some plastic types recycle at a much higher rate than the 8.7% national average — PET bottles and jars reached 29.1% in 2018, and HDPE natural bottles 29.3% — while many other plastic products, especially flexible film and mixed-resin packaging, recycle far below the average.'
        },
        {
          title: 'Landfilling and recycling are not the whole story',
          body: 'Plastic that is not recycled is not necessarily landfilled either — some is incinerated for energy recovery, and some becomes litter. This calculator groups all three into a single "not recycled" figure.'
        },
        {
          title: 'Based on the most recent full EPA dataset (2018)',
          body: 'The EPA’s national MSW statistics are published with a lag; 2018 is the most recent year with a complete, detailed breakdown available at the time this calculator was built. More recent waste generation may differ.'
        }
      ],
      references: [
        { label: 'U.S. EPA, "National Overview: Facts and Figures on Materials, Waste and Recycling"', url: 'https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/national-overview-facts-and-figures-materials' },
        { label: 'U.S. EPA, "Plastics: Material-Specific Data"', url: 'https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/plastics-material-specific-data' }
      ]
    },
    inputs: [
      { id: 'householdSize', label: 'Household size', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 1 },
      { id: 'recyclingRatePct', label: 'Recycling rate', type: 'percent', placeholder: '8.7', defaultValue: DEFAULT_PLASTIC_RECYCLING_RATE_PCT_2018, step: 0.1, min: 0 }
    ],
    breakdown: {
      headline: 'householdAnnualLb',
      headlineLabel: 'Household’s plastic waste (per year)',
      outputs: [
        { id: 'householdAnnualLb', label: 'Household total (per year)', dimension: 'mass', unit: 'lb', alsoIn: ['kg'] },
        { id: 'recycledLb', label: 'Recycled', dimension: 'mass', unit: 'lb' },
        { id: 'notRecycledLb', label: 'Landfilled, incinerated, or littered', dimension: 'mass', unit: 'lb' }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'recycledLb', label: 'Recycled' },
          { from: 'notRecycledLb', label: 'Not recycled' }
        ],
        center: 'householdAnnualLb',
        centerSub: 'lb/year'
      }
    },
    seo: {
      title: 'Plastic Footprint Calculator – Household Plastic Waste',
      description: 'Free plastic footprint calculator. Estimate your household’s yearly plastic waste and recycling using the EPA’s published 2018 national waste statistics.',
      faq: [
        {
          question: 'How much plastic waste does the average person generate?',
          answer:
            'About 0.598 lb a day (4.9 lb of total trash × 12.2% plastic share), or roughly 218.2 lb a year, based on the EPA’s 2018 national data — enough that a household of 4 generates about 872.8 lb (395.9 kg) a year.'
        },
        {
          question: 'What percentage of plastic actually gets recycled?',
          answer:
            'About 8.7% nationally in 2018, per the EPA — lower than many people assume, and far lower than some specific plastic types: PET bottles and jars recycled at 29.1% and HDPE natural bottles at 29.3% that same year.'
        },
        {
          question: 'If I recycle more, how much difference does it make?',
          answer:
            'Doubling the national recycling rate from 8.7% to 17.4% cuts a household of 4’s non-recycled plastic from about 796.9 lb to about 720.9 lb a year — a 9.5% reduction, because recycling only redirects part of the total; it does not reduce how much plastic is generated in the first place.'
        },
        {
          question: 'What happens to the plastic that is not recycled?',
          answer:
            'It is landfilled, incinerated for energy recovery, or becomes litter. In 2018, plastics made up over 18% of the 146.1 million tons of MSW landfilled in the US that year — a larger share of landfill than of total waste generated.'
        },
        {
          question: 'Is this based on actual measured household waste?',
          answer: 'No — it scales the EPA’s national per-person average by your household size. Individual households vary; this gives a reasonable planning estimate, not a measurement of your own trash.'
        },
        {
          question: 'Why 2018 data specifically?',
          answer: 'It is the most recent year with the EPA’s full, detailed municipal solid waste breakdown available at the time this calculator was built.'
        }
      ]
    },
    compute(values) {
      const plasticLbPerPersonPerDay = TOTAL_MSW_LB_PER_PERSON_DAY_2018 * PLASTIC_SHARE_OF_MSW_2018;
      const plasticLbPerPersonPerYear = plasticLbPerPersonPerDay * 365;
      const householdAnnualLb = plasticLbPerPersonPerYear * values.householdSize;
      const recycledLb = householdAnnualLb * (values.recyclingRatePct / 100);
      const notRecycledLb = householdAnnualLb - recycledLb;
      return { householdAnnualLb, recycledLb, notRecycledLb };
    }
  },
  {
    id: 'meat-footprint-calculator',
    category: 'ecology',
    glyph: 'diet',
    updatedAt: '2026-11-17',
    aliases: ['meat footprint calculator', 'diet carbon footprint calculator', 'food carbon footprint calculator', 'vegan footprint calculator', 'vegetarian footprint calculator'],
    related: ['carbon-footprint-calculator', 'water-footprint-calculator', 'plastic-footprint-calculator', 'calorie-calculator'],
    title: 'Meat & Diet Carbon Footprint Calculator',
    description:
      'Estimate your diet’s yearly greenhouse gas footprint from how much beef, pork, poultry, fish, eggs, dairy, and plant protein you eat, using Poore & Nemecek’s (2018, Science) global food-emissions data.',
    example:
      'A diet with 0.5 kg of beef, 0.3 kg of pork, 0.7 kg of poultry, 0.2 kg of fish, 0.3 kg of eggs, and 2 kg of milk a week, plus 0.2 kg of tofu, emits about 3,712.9 kg of CO2e a year — beef alone is about 69.7% of it.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is a diet’s carbon footprint?',
        paragraphs: [
          'Every food carries a greenhouse gas cost from producing it — raising or growing it, processing it, and getting it to a store — measured in kilograms of CO2-equivalent (CO2e) per kilogram of food. The most widely cited figures come from Poore and Nemecek’s 2018 analysis in Science, a meta-study of roughly 38,700 farms in 119 countries, which found enormous differences between food types: a kilogram of beef from a dedicated beef herd carries a global-average footprint of about 99.48 kg CO2e, while a kilogram of tofu carries about 3.16 kg — beef is roughly 31 times more carbon-intensive, kilogram for kilogram.',
          'The gap is largest for ruminant meats (beef and lamb) because cattle and sheep produce methane as they digest grass and feed, a far more potent greenhouse gas than CO2 pound for pound, on top of the land and feed used to raise them. Poultry, pork, fish, and eggs sit in the middle; plant proteins like tofu sit far below all of them.',
          'This calculator multiplies how much of each food you eat in a typical week by its own published factor, adds the results, and shows which food is driving your total — useful for seeing which single change (eating less beef, for instance) would actually move the number, rather than guessing.'
        ]
      },
      howTo: {
        intro: 'Enter how much of each food you eat in a typical week; the yearly total and its breakdown appear instantly.',
        steps: [
          { name: 'Enter animal products', text: 'Type your typical weekly amount, in kilograms, of beef, pork, poultry, fish, eggs, and milk or dairy. Leave any at 0 if you do not eat it.' },
          { name: 'Enter plant protein', text: 'Type your typical weekly amount of tofu or a similar plant-protein food, if any.' },
          { name: 'Read the total', text: 'The headline is your estimated yearly footprint from these foods, in kilograms and metric tons of CO2e.' },
          { name: 'Check the breakdown', text: 'The chart shows which food contributes the most — usually beef, if you eat any, because its per-kilogram factor is so much higher than everything else.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each food’s weekly weight is multiplied by its own global-average emissions factor; the yearly total is the weekly sum times 52.',
        expression: 'weekly = Σ (weight_i × factor_i), for each food i\nyearly = weekly × 52',
        terms: [
          { symbol: 'factor_i', meaning: 'Poore & Nemecek’s (2018) global-average kg CO2e per kg of that food: beef 99.48, pork 12.31, poultry 9.87, farmed fish 13.63, eggs 4.67, milk 3.15, tofu 3.16.' }
        ],
        note: 'Global averages. A specific product’s real footprint varies with how and where it was produced — grass-fed versus feedlot beef, for instance.'
      },
      workedExample: {
        intro: 'A week of 0.5 kg beef, 0.3 kg pork, 0.7 kg poultry, 0.2 kg fish, 0.3 kg eggs, 2 kg milk, and 0.2 kg tofu.',
        rows: [
          { label: 'Beef (0.5 × 99.48)', value: '49.74 kg' },
          { label: 'Pork (0.3 × 12.31)', value: '3.69 kg' },
          { label: 'Poultry (0.7 × 9.87)', value: '6.91 kg' },
          { label: 'Fish (0.2 × 13.63)', value: '2.73 kg' },
          { label: 'Eggs (0.3 × 4.67)', value: '1.40 kg' },
          { label: 'Milk (2 × 3.15)', value: '6.30 kg' },
          { label: 'Tofu (0.2 × 3.16)', value: '0.63 kg' },
          { label: 'Weekly total', value: '71.40 kg' },
          { label: 'Yearly total (× 52)', value: '3,712.85 kg (3.71 t)' }
        ],
        result: 'About 3,712.9 kg (3.71 metric tons) of CO2e a year',
        explanation:
          'Beef is 69.7% of the weekly total by itself, despite being less than a third of the animal-product weight eaten. Replacing every animal product in this example (4 kg a week total) with the same weight of tofu would cut the weekly footprint from 71.4 kg to about 13.27 kg of CO2e — an 81.4% reduction.'
      },
      watchOut: [
        {
          title: 'Beef and lamb dominate for a biological reason',
          body: 'Cattle and sheep are ruminants: they produce methane during digestion, a greenhouse gas many times more potent than CO2 over a short time span. That is layered on top of the land and feed every animal needs, which is why beef’s own factor here is about 10 times poultry’s, even though both are meat.'
        },
        {
          title: 'These are global averages, not your specific grocery item',
          body: 'Poore and Nemecek’s figures average across thousands of farms worldwide. A grass-fed, local, or small-farm product can have a meaningfully different footprint than the global average for its food category, in either direction.'
        },
        {
          title: 'It is food production only',
          body: 'These factors cover production through to a regional distribution point; they do not add your own cooking energy, food waste, or the distance it traveled to your specific store.'
        },
        {
          title: 'Dairy here means milk, not cheese',
          body: 'Cheese has a notably higher footprint than milk per kilogram, because it takes several liters of milk to make one kilogram of cheese. If cheese is a bigger part of your diet than milk, this estimate will run low for that category.'
        }
      ],
      references: [
        { label: 'Poore, J. & Nemecek, T. (2018), "Reducing food’s environmental impacts through producers and consumers," Science 360(6392)', url: 'https://www.science.org/doi/10.1126/science.aaq0216' },
        { label: 'Our World in Data, "Environmental Impacts of Food Production" (republishing Poore & Nemecek’s per-kilogram emissions data)', url: 'https://ourworldindata.org/environmental-impacts-of-food' }
      ]
    },
    inputs: [
      { id: 'beefKg', label: 'Beef', type: 'number', placeholder: '0.5', defaultValue: 0.5, step: 0.1, min: 0, dimension: 'mass', unit: 'kg' },
      { id: 'porkKg', label: 'Pork', type: 'number', placeholder: '0.3', defaultValue: 0.3, step: 0.1, min: 0, dimension: 'mass', unit: 'kg' },
      { id: 'poultryKg', label: 'Poultry', type: 'number', placeholder: '0.7', defaultValue: 0.7, step: 0.1, min: 0, dimension: 'mass', unit: 'kg' },
      { id: 'fishKg', label: 'Fish (farmed)', type: 'number', placeholder: '0.2', defaultValue: 0.2, step: 0.1, min: 0, dimension: 'mass', unit: 'kg' },
      { id: 'eggsKg', label: 'Eggs', type: 'number', placeholder: '0.3', defaultValue: 0.3, step: 0.1, min: 0, dimension: 'mass', unit: 'kg' },
      { id: 'milkKg', label: 'Milk / dairy', type: 'number', placeholder: '2', defaultValue: 2, step: 0.25, min: 0, dimension: 'mass', unit: 'kg' },
      { id: 'tofuKg', label: 'Tofu / plant protein', type: 'number', placeholder: '0.2', defaultValue: 0.2, step: 0.1, min: 0, dimension: 'mass', unit: 'kg' }
    ],
    breakdown: {
      headline: 'annualKgCO2e',
      headlineLabel: 'Diet’s carbon footprint (per year)',
      outputs: [
        { id: 'annualKgCO2e', label: 'Yearly total', dimension: 'mass', alsoIn: ['t'] },
        { id: 'weeklyKgCO2e', label: 'Weekly total', dimension: 'mass' }
      ],
      groups: [
        { title: 'Animal products (per week)', inputs: ['beefKg', 'porkKg', 'poultryKg', 'fishKg', 'eggsKg', 'milkKg'] },
        { title: 'Plant protein (per week)', inputs: ['tofuKg'] }
      ],
      derive: (v) => ({
        beefWeekly: v.beefKg * FOOD_CO2E_PER_KG.beef,
        porkWeekly: v.porkKg * FOOD_CO2E_PER_KG.pork,
        poultryWeekly: v.poultryKg * FOOD_CO2E_PER_KG.poultry,
        fishWeekly: v.fishKg * FOOD_CO2E_PER_KG.fish,
        dairyEggsWeekly: v.eggsKg * FOOD_CO2E_PER_KG.eggs + v.milkKg * FOOD_CO2E_PER_KG.milk,
        tofuWeekly: v.tofuKg * FOOD_CO2E_PER_KG.tofu
      }),
      visual: {
        type: 'donut',
        segments: [
          { from: 'beefWeekly', label: 'Beef' },
          { from: 'porkWeekly', label: 'Pork' },
          { from: 'poultryWeekly', label: 'Poultry' },
          { from: 'fishWeekly', label: 'Fish' },
          { from: 'dairyEggsWeekly', label: 'Dairy & eggs' },
          { from: 'tofuWeekly', label: 'Tofu' }
        ],
        center: 'weeklyKgCO2e',
        centerSub: 'kg CO2e/week'
      }
    },
    seo: {
      title: 'Meat & Diet Carbon Footprint Calculator',
      description: 'Free diet carbon footprint calculator. Estimate your yearly food emissions from beef, pork, poultry, fish, eggs, dairy, and plant protein using Poore & Nemecek (2018).',
      faq: [
        {
          question: 'How much CO2 does my diet produce?',
          answer:
            'Multiply how much you eat each week of beef, pork, poultry, fish, eggs, milk, and tofu by their own factor (99.48, 12.31, 9.87, 13.63, 4.67, 3.15, and 3.16 kg CO2e per kg), add them, then multiply by 52. The worked example above comes to about 3,712.9 kg (3.71 metric tons) a year.'
        },
        {
          question: 'Why is beef so much worse than other meats?',
          answer:
            'Cattle are ruminants: digesting grass and feed produces methane, a much more potent greenhouse gas than CO2, on top of the land and feed every animal needs. Poore and Nemecek’s global-average figures put beef at 99.48 kg CO2e per kg, versus 9.87 for poultry — about 10 times higher.'
        },
        {
          question: 'How much would going vegetarian or vegan save?',
          answer:
            'In the worked example, swapping every animal product (4 kg a week of beef, pork, poultry, fish, eggs, and milk combined) for the same weight of tofu cuts the weekly footprint from 71.4 kg to about 13.27 kg of CO2e — an 81.4% reduction.'
        },
        {
          question: 'Is chicken really that much better than beef?',
          answer: 'Per kilogram, yes: poultry’s global-average factor (9.87 kg CO2e/kg) is about 10 times lower than beef’s (99.48 kg CO2e/kg) — switching a given weight of beef to poultry cuts that portion’s footprint by about 90%.'
        },
        {
          question: 'What source are these numbers from?',
          answer: 'Poore and Nemecek’s 2018 study in Science, a meta-analysis of about 38,700 farms across 119 countries — one of the most widely cited sources for comparing food-related greenhouse gas emissions, as republished by Our World in Data.'
        },
        {
          question: 'Does this include how the food was transported or cooked?',
          answer: 'No — these are production-stage figures (farm through regional distribution), not your own cooking energy, food waste, or the specific distance your groceries traveled.'
        }
      ]
    },
    compute(values) {
      const weeklyKgCO2e =
        values.beefKg * FOOD_CO2E_PER_KG.beef +
        values.porkKg * FOOD_CO2E_PER_KG.pork +
        values.poultryKg * FOOD_CO2E_PER_KG.poultry +
        values.fishKg * FOOD_CO2E_PER_KG.fish +
        values.eggsKg * FOOD_CO2E_PER_KG.eggs +
        values.milkKg * FOOD_CO2E_PER_KG.milk +
        values.tofuKg * FOOD_CO2E_PER_KG.tofu;
      const annualKgCO2e = weeklyKgCO2e * 52;
      return { weeklyKgCO2e, annualKgCO2e };
    }
  },
  {
    id: 'carrying-capacity-calculator',
    category: 'ecology',
    glyph: 'K',
    updatedAt: '2026-11-17',
    aliases: [
      'carrying capacity calculator',
      'logistic growth calculator',
      'logistic population growth calculator',
      'environmental limits to population growth calculator',
      'carrying capacity of population calculator'
    ],
    related: ['population-growth-calculator', 'population-density-calculator', 'lotka-volterra-calculator', 'bacterial-growth-calculator'],
    title: 'Carrying Capacity Calculator (Logistic Growth)',
    description:
      'Solve the logistic growth model for carrying capacity, population size, or growth rate — the per-capita growth rate that slows as a population approaches its environment’s limit.',
    example:
      'A population of 600 in a habitat with a carrying capacity of 1,000, growing at a maximum rate of 8% a year, has its realized growth rate throttled to 3.2% a year (40% of the maximum) by the shrinking resource margin.',
    solver: {
      defaultTarget: 'realizedGrowthRate',
      variables: [
        { id: 'population', label: 'Current population', symbol: 'N', dimension: 'count', defaultValue: 600, defaultUnit: 'count' },
        { id: 'carryingCapacity', label: 'Carrying capacity', symbol: 'K', dimension: 'count', defaultValue: 1000, defaultUnit: 'count' },
        { id: 'maxGrowthRate', label: 'Maximum growth rate', symbol: 'r_max', dimension: 'rateConstant', defaultValue: 0.08, defaultUnit: 'yr-1' },
        { id: 'realizedGrowthRate', label: 'Realized growth rate at N', symbol: 'r', dimension: 'rateConstant', defaultValue: 0.032, defaultUnit: 'yr-1' }
      ],
      solve: {
        realizedGrowthRate: ({ population, carryingCapacity, maxGrowthRate }) => maxGrowthRate * (1 - population / carryingCapacity),
        maxGrowthRate: ({ population, carryingCapacity, realizedGrowthRate }) =>
          (realizedGrowthRate * carryingCapacity) / (carryingCapacity - population),
        population: ({ carryingCapacity, maxGrowthRate, realizedGrowthRate }) => carryingCapacity * (1 - realizedGrowthRate / maxGrowthRate),
        carryingCapacity: ({ population, maxGrowthRate, realizedGrowthRate }) => (maxGrowthRate * population) / (maxGrowthRate - realizedGrowthRate)
      },
      outputs: [
        { id: 'percentOfK', label: '% of carrying capacity', dimension: 'percent', compute: (si) => (si.population / si.carryingCapacity) * 100 },
        { id: 'remainingCapacity', label: 'Remaining capacity (K − N)', dimension: 'count', compute: (si) => si.carryingCapacity - si.population }
      ],
      visuals: [
        {
          type: 'compareBars',
          bars: [
            { from: 'population', label: 'Current population' },
            { from: 'carryingCapacity', label: 'Carrying capacity' }
          ],
          title: 'Population vs. carrying capacity',
          highlight: 0
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is carrying capacity?',
        paragraphs: [
          'OpenStax’s Biology 2e introduces carrying capacity while explaining why no real population can keep growing exponentially forever: "This population size, which represents the maximum population size that a particular environment can support, is called the carrying capacity, or K." To model that limit, it gives the logistic growth equation: dN/dT = r_max × N × (K − N)/K — the same per-capita growth-rate term, r_max, used in the unrestricted exponential model, now multiplied by (K − N)/K, a "braking" factor that shrinks toward zero as the population N approaches K.',
          'Dividing both sides of that equation by N turns it into a statement about the realized, per-capita growth rate itself: r = r_max × (1 − N/K). Near N = 0, almost none of the environment’s capacity is used, (1 − N/K) is close to 1, and growth proceeds at close to the maximum rate. As N climbs toward K, (1 − N/K) shrinks toward 0, and the realized rate shrinks right along with it — the population keeps adding individuals, just more and more slowly, until growth stops entirely at N = K.',
          'This calculator solves that rearranged equation for any one of its four quantities: the current population, the carrying capacity, the maximum growth rate, or the realized growth rate those first three produce. OpenStax describes the resulting curve as S-shaped, with "three different phases: an initial establishment phase in which population size changes slowly, a rapid-growth phase ... and a plateau phase" once the population nears K — the carrying capacity is the ceiling that plateau levels off at.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the current population, the carrying capacity, and the maximum growth rate; the realized growth rate fills in automatically.',
        steps: [
          { name: 'Enter the current population', text: 'N — how large the population is right now.' },
          { name: 'Enter the carrying capacity', text: 'K — the maximum population size the environment can sustain, from a published estimate or a course problem.' },
          { name: 'Enter the maximum growth rate', text: 'r_max — the intrinsic per-capita growth rate the population would have with unlimited resources (N near 0).' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result', text: 'The realized growth rate appears alongside how much of the carrying capacity is already used and how much room remains.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'OpenStax’s logistic growth equation, divided by N, gives the realized per-capita rate; that rearranges into the other three quantities.',
        expression:
          'dN/dT = r_max × N × (K − N) / K\nr = r_max × (1 − N/K)\nN = K × (1 − r/r_max)\nK = r_max × N / (r_max − r)\nr_max = r × K / (K − N)',
        terms: [
          { symbol: 'r_max', meaning: 'The maximum (intrinsic) per-capita growth rate — the rate at N near 0, when resources are effectively unlimited.' },
          { symbol: 'N', meaning: 'The current population size.' },
          { symbol: 'K', meaning: 'The carrying capacity — OpenStax’s "maximum population size that a particular environment can support."' },
          { symbol: 'r', meaning: 'The realized per-capita growth rate at population N, after the (K − N)/K braking term from OpenStax’s logistic equation is applied — this calculator’s own division of that equation by N.' }
        ],
        note: 'Every rate here is per capita (per individual already present). The absolute number of new individuals added per year is r × N, not r by itself.'
      },
      workedExample: {
        intro: 'A population of 600 lives in a habitat with a carrying capacity of 1,000, and would grow at a maximum rate of 8% a year with unlimited resources.',
        rows: [
          { label: 'Carrying capacity (K)', value: '1,000' },
          { label: 'Current population (N)', value: '600' },
          { label: 'Maximum growth rate (r_max)', value: '0.08/yr (8%)' },
          { label: 'Braking term (1 − N/K = 1 − 600/1,000)', value: '0.4' },
          { label: 'Realized growth rate (r = 0.08 × 0.4)', value: '0.032/yr (3.2%)' }
        ],
        result: 'r ≈ 0.032 per year (3.2%)',
        explanation:
          'At 600 of the habitat’s 1,000-individual capacity, the population is using 60% of the available room, so its realized growth rate is throttled to 40% of the maximum (1 − 0.6 = 0.4) — 0.032 a year instead of 0.08. That works out to about 19.2 new individuals added that year (0.032 × 600), versus the 48 that unconstrained exponential growth would add at this same population size (0.08 × 600).'
      },
      watchOut: [
        {
          title: 'This is the logistic model, not the exponential one',
          body: 'Population Growth Calculator solves the unrestricted exponential equation, N = N₀ × e^(rt), where the growth rate r never changes and the population never stops climbing. This page’s logistic model adds the environmental ceiling K and lets the realized rate decline to zero as N approaches it — the right model whenever resources, space, or food genuinely limit a population.'
        },
        {
          title: 'r is a per-capita rate, not a headcount',
          body: 'The realized growth rate this calculator solves for is a proportion (per individual, per year), not the number of new individuals added. Multiply it by the current population to get that absolute figure — 0.032 × 600 ≈ 19.2 individuals in the worked example above.'
        },
        {
          title: 'A real carrying capacity rarely stays fixed',
          body: 'This model treats K as a constant, but a real environment’s capacity shifts with rainfall, food availability, disease, and season. A published K is usually an average or a snapshot, not a permanent ceiling.'
        },
        {
          title: 'A population above K shrinks back toward it',
          body: 'If N is entered larger than K, (1 − N/K) is negative, and the formula correctly predicts a negative realized growth rate — a population that overshot its environment’s capacity and is declining back toward K, the same equation handling growth and die-off alike.'
        },
        {
          title: 'No answer when N equals K, or when r equals r_max',
          body: 'At N = K the realized growth rate is exactly 0, which has no unique carrying capacity or maximum rate to solve back to from that single data point — and solving for N when r equals r_max divides by zero, since that combination is only possible at N = 0.'
        }
      ],
      references: [
        {
          label: 'OpenStax, Biology 2e, §45.3 "Environmental Limits to Population Growth" (logistic growth equation and carrying capacity definition)',
          url: 'https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth'
        }
      ]
    },
    inputs: [
      { id: 'population', label: 'Current population (N)', type: 'number', placeholder: '600', defaultValue: 600, step: 10, min: 0 },
      { id: 'carryingCapacity', label: 'Carrying capacity (K)', type: 'number', placeholder: '1000', defaultValue: 1000, step: 10, min: 0 },
      { id: 'maxGrowthRate', label: 'Maximum growth rate r_max (per year)', type: 'number', placeholder: '0.08', defaultValue: 0.08, step: 0.001 }
    ],
    seo: {
      title: 'Carrying Capacity Calculator – Logistic Growth (K)',
      description: 'Free carrying capacity calculator. Solve the logistic growth model for carrying capacity, population, or growth rate, with a worked example.',
      faq: [
        {
          question: 'What is carrying capacity?',
          answer:
            'OpenStax’s Biology 2e defines it directly: "the maximum population size that a particular environment can support," denoted K — the ceiling a population’s growth levels off at once resources, space, or food become limiting.'
        },
        {
          question: 'How do I calculate the realized growth rate from carrying capacity?',
          answer:
            'Multiply the maximum growth rate (r_max) by (1 − N/K), where N is the current population. A population of 600 in a habitat with K = 1,000 and r_max = 0.08/yr has a realized rate of 0.08 × (1 − 600/1,000) = 0.032/yr (3.2%).'
        },
        {
          question: 'What is the difference between this and exponential population growth?',
          answer:
            'Exponential growth (Population Growth Calculator’s N = N₀ × e^(rt)) has no ceiling — the rate r stays constant forever. Logistic growth adds the carrying capacity K and lets the realized rate decline toward zero as the population approaches it, producing an S-shaped curve instead of an ever-steepening one.'
        },
        {
          question: 'What happens if a population exceeds its carrying capacity?',
          answer:
            'The same formula still applies: with N greater than K, (1 − N/K) is negative, so the realized growth rate comes out negative, correctly modeling a population that overshot its environment’s limit and is now declining back toward K.'
        },
        {
          question: 'Is carrying capacity always a fixed number?',
          answer:
            'No. The logistic model treats K as constant for simplicity, but a real environment’s actual capacity shifts with rainfall, food supply, disease, and season — a published K is typically an average, not a permanent limit.'
        },
        {
          question: 'What is the difference between r_max and r?',
          answer:
            'r_max is the maximum per-capita growth rate, reached only when the population is small relative to K. r is the realized rate at the current population N, after OpenStax’s (K − N)/K braking term has been applied — r always equals or is less than r_max (and can go negative above K).'
        }
      ]
    },
    compute(values) {
      return { realizedGrowthRate: values.maxGrowthRate * (1 - values.population / values.carryingCapacity) };
    }
  },
  {
    id: 'shannon-diversity-index-calculator',
    category: 'ecology',
    glyph: "H'",
    updatedAt: '2026-11-17',
    aliases: [
      'shannon diversity index calculator',
      'shannon-wiener index calculator',
      'shannon entropy calculator biology',
      'biodiversity index calculator',
      'species evenness calculator'
    ],
    related: ['simpson-diversity-index-calculator', 'population-density-calculator', 'carrying-capacity-calculator', 'standard-deviation-calculator'],
    title: 'Shannon Diversity Index Calculator (H′)',
    description:
      'Calculate the Shannon diversity index, H′ = −Σ(pᵢ × ln pᵢ), from species counts — a single number combining species richness and evenness into one measure of biodiversity.',
    example:
      'A sample of 100 individuals across 5 species (40, 30, 20, 8, and 2 of each) has a Shannon diversity index of about 1.330, or 82.6% of the maximum possible evenness for 5 species.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is the Shannon diversity index?',
        paragraphs: [
          'OpenStax’s Biology 2e frames biodiversity as two separate ideas combined: "species richness," the number of different species in a habitat, and "species evenness," how evenly individuals are spread across those species. It defines species diversity itself as "the number of species occupying the same habitat and their relative abundance." A habitat with 5 species can still look very different depending on evenness — one dominated almost entirely by a single species "feels" far less diverse than one where all 5 are equally common, even though the richness (5) is identical.',
          'The Shannon diversity index, H′, is the standard way ecologists fold both ideas into one number. It comes from Claude Shannon’s 1948 paper "A Mathematical Theory of Communication," which defined the same formula as a measure of uncertainty (entropy) in a string of symbols; ecologists later adopted it to measure uncertainty in which species a randomly chosen individual belongs to. The formula is H′ = −Σ(pᵢ × ln pᵢ), summed over every species i, where pᵢ is that species’ relative abundance (its count divided by the total count of every individual sampled).',
          'H′ is 0 only when a sample has a single species (no uncertainty at all about which species the next individual belongs to), and it rises with both richness and evenness, reaching its maximum, ln(S) for S species, exactly when every species is equally abundant. Comparing a sample’s H′ to that maximum — its evenness, J′ = H′ ÷ ln(S) — shows how close a community comes to that perfectly even ideal, independent of how many species it has.'
        ]
      },
      howTo: {
        intro: 'Enter the number of individuals counted for each species in the sample; the index, richness, and evenness fill in instantly.',
        steps: [
          { name: 'Count individuals by species', text: 'From a field survey or quadrat count, tally how many individuals of each species were observed.' },
          { name: 'Enter each species’ count', text: 'Fill in the count for each species present. Leave any unused slot at 0 if the sample has fewer than 5 species.' },
          { name: 'Read the Shannon index', text: 'The headline, H′, is higher when the sample has more species, more evenly represented.' },
          { name: 'Check richness and evenness', text: 'The breakdown shows the total individuals counted, the species richness (S), and the evenness (H′ as a percentage of the maximum possible for that many species).' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Each species’ relative abundance is weighted by its own natural log, and the (negative) sum is the index.',
        expression: 'pᵢ = nᵢ ÷ N\nH′ = −Σ(pᵢ × ln pᵢ), summed over every species with nᵢ > 0\nJ′ = H′ ÷ ln(S)',
        terms: [
          { symbol: 'nᵢ', meaning: 'The number of individuals counted of species i.' },
          { symbol: 'N', meaning: 'The total number of individuals counted, across all species.' },
          { symbol: 'S', meaning: 'Species richness — the number of species with at least one individual counted.' },
          { symbol: 'J′', meaning: 'Pielou’s evenness: how close H′ comes to its maximum possible value, ln(S), for that many species.' }
        ],
        note: 'This is one of two standard diversity indices; Simpson Diversity Index Calculator computes a second, differently weighted measure from the same kind of species-count data.'
      },
      workedExample: {
        intro: 'A sample of 100 individuals across 5 species: 40, 30, 20, 8, and 2 individuals of species A through E.',
        rows: [
          { label: 'Total individuals (N)', value: '100' },
          { label: 'Richness (S)', value: '5' },
          { label: 'Proportions (pᵢ)', value: '0.40, 0.30, 0.20, 0.08, 0.02' },
          { label: '−Σ(pᵢ × ln pᵢ)', value: '≈1.3299' },
          { label: 'Maximum possible, ln(5)', value: '≈1.6094' },
          { label: 'Evenness (J′ = H′ ÷ ln 5)', value: '≈82.63%' }
        ],
        result: 'H′ ≈ 1.330',
        explanation:
          'This sample’s diversity, 1.330, sits at about 82.6% of the maximum possible for 5 species (1.6094, reached only if all 5 were equally abundant at 20 each). The gap comes almost entirely from species A’s dominance at 40% of the sample, not from low richness — all 5 species are still present and counted.'
      },
      watchOut: [
        {
          title: 'H′ measures richness and evenness together, not either alone',
          body: 'Two samples can share the same H′ for different reasons — one with more species unevenly distributed, another with fewer species evenly distributed. Check richness (S) and evenness (J′) separately if the distinction matters for your comparison.'
        },
        {
          title: 'Natural log, not log base 10 or base 2',
          body: 'This calculator uses ln (base e), the convention OpenStax and most ecology textbooks follow for H′. A small number of sources report it in log base 2 or log base 10, which gives a different numeric value for the same data — check which base a published H′ you are comparing against used.'
        },
        {
          title: 'Very small samples inflate apparent diversity',
          body: 'With only a handful of individuals counted, rare species are easy to miss entirely, and small random differences in who you happened to count can swing H′ noticeably. A larger, more representative sample gives a more reliable estimate.'
        },
        {
          title: 'This is not the same as Simpson’s index',
          body: 'Simpson Diversity Index Calculator weights abundant species far more heavily (it is dominated by the few most common species), while Shannon’s log-weighting gives rare species more relative influence. The two can rank the same two communities differently.'
        }
      ],
      references: [
        {
          label: 'OpenStax, Biology 2e, §45.6 "Community Ecology" (species richness, relative abundance, and species evenness)',
          url: 'https://openstax.org/books/biology-2e/pages/45-6-community-ecology'
        },
        {
          label: 'Shannon, C.E. (1948), "A Mathematical Theory of Communication," The Bell System Technical Journal 27 (the origin of the H′ = −Σ(pᵢ ln pᵢ) formula)',
          url: 'https://en.wikipedia.org/wiki/Diversity_index'
        }
      ]
    },
    inputs: [
      { id: 'speciesACount', label: 'Species A', type: 'number', placeholder: '40', defaultValue: DEFAULT_SPECIES_COUNTS[0], step: 1, min: 0 },
      { id: 'speciesBCount', label: 'Species B', type: 'number', placeholder: '30', defaultValue: DEFAULT_SPECIES_COUNTS[1], step: 1, min: 0 },
      { id: 'speciesCCount', label: 'Species C', type: 'number', placeholder: '20', defaultValue: DEFAULT_SPECIES_COUNTS[2], step: 1, min: 0 },
      { id: 'speciesDCount', label: 'Species D', type: 'number', placeholder: '8', defaultValue: DEFAULT_SPECIES_COUNTS[3], step: 1, min: 0 },
      { id: 'speciesECount', label: 'Species E', type: 'number', placeholder: '2', defaultValue: DEFAULT_SPECIES_COUNTS[4], step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'shannonIndex',
      headlineLabel: 'Shannon diversity index (H′)',
      outputs: [
        { id: 'shannonIndex', label: 'Shannon diversity index (H′)', format: 'significant' },
        { id: 'richness', label: 'Species richness (S)', format: 'integer' },
        { id: 'totalIndividuals', label: 'Total individuals counted', format: 'integer' },
        { id: 'evennessPct', label: 'Evenness (J′, % of maximum)', format: 'percent' }
      ],
      groups: [{ title: 'Species counts', inputs: ['speciesACount', 'speciesBCount', 'speciesCCount', 'speciesDCount', 'speciesECount'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'speciesACount', label: 'Species A' },
          { from: 'speciesBCount', label: 'Species B' },
          { from: 'speciesCCount', label: 'Species C' },
          { from: 'speciesDCount', label: 'Species D' },
          { from: 'speciesECount', label: 'Species E' }
        ],
        center: 'totalIndividuals',
        centerSub: 'individuals counted'
      }
    },
    seo: {
      title: 'Shannon Diversity Index Calculator (H′)',
      description: 'Free Shannon diversity index calculator. Compute H′ = −Σ(pᵢ ln pᵢ), species richness, and evenness from species-count data.',
      faq: [
        {
          question: 'What is the Shannon diversity index formula?',
          answer:
            'H′ = −Σ(pᵢ × ln pᵢ), summed over every species, where pᵢ is a species’ share of the total individuals counted. A sample of 100 individuals across 5 species (40, 30, 20, 8, 2) gives H′ ≈ 1.330.'
        },
        {
          question: 'What does a higher Shannon index mean?',
          answer:
            'More biodiversity: more species, more evenly represented, or both. It ranges from 0 (a single species) up to ln(S) for S species, reached only when every species is equally abundant.'
        },
        {
          question: 'What is species evenness (J′)?',
          answer:
            'H′ expressed as a percentage of the maximum possible value for the observed number of species, ln(S). In the worked example, J′ ≈ 82.6% (1.330 ÷ 1.6094), reflecting that species A makes up 40% of the sample rather than an even 20% share.'
        },
        {
          question: 'Why natural log (ln) instead of log base 10?',
          answer:
            'It is the convention most ecology textbooks and courses use for the Shannon index. The same species-count data gives a different numeric H′ under log base 2 or log base 10, so always match the base a comparison figure was computed with.'
        },
        {
          question: 'How is this different from species richness alone?',
          answer:
            'Richness (S) just counts how many species are present — 5 in the worked example — with no regard for how evenly individuals are spread across them. H′ combines that count with evenness into a single number, which is why two samples with the same richness can have different H′ values.'
        },
        {
          question: 'How is this different from Simpson’s diversity index?',
          answer:
            'Both use the same species-count data, but weight it differently: Shannon’s log-based formula gives rare species more relative influence, while Simpson’s index is dominated by the most abundant species. Simpson Diversity Index Calculator computes the second measure from the same counts.'
        }
      ]
    },
    compute(values) {
      const counts = [values.speciesACount, values.speciesBCount, values.speciesCCount, values.speciesDCount, values.speciesECount];
      const totalIndividuals = counts.reduce((sum, n) => sum + n, 0);
      const richness = counts.filter((n) => n > 0).length;
      let shannonIndex = 0;
      for (const n of counts) {
        if (n > 0) {
          const p = n / totalIndividuals;
          shannonIndex -= p * Math.log(p);
        }
      }
      const evennessPct = (shannonIndex / Math.log(richness)) * 100;
      return { shannonIndex, richness, totalIndividuals, evennessPct };
    }
  },
  {
    id: 'population-density-calculator',
    category: 'ecology',
    glyph: '/km²',
    updatedAt: '2026-11-17',
    aliases: [
      'population density calculator',
      'ecological population density calculator',
      'animal density calculator',
      'individuals per square kilometer calculator',
      'wildlife population density calculator'
    ],
    related: ['carrying-capacity-calculator', 'population-growth-calculator', 'shannon-diversity-index-calculator', 'area-converter'],
    title: 'Population Density Calculator',
    description: 'Calculate population density — the number of individuals per unit area — from a population count and the area it occupies, in km², hectares, or m².',
    example: 'A survey counts 600 individuals across a 50 km² habitat, for a population density of 12 individuals per km² (0.12 per hectare, or 0.000012 per m²).',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is population density?',
        paragraphs: [
          'OpenStax’s Biology 2e defines population size as simply "the total number of individuals" and population density as "the number of individuals within a specific area or volume" — the same headcount, but expressed relative to the space it occupies. Two populations can have the same size and very different densities, or the same density on very different areas; density is what lets ecologists compare a count that is actually meaningful across habitats of different sizes.',
          'OpenStax also notes that smaller organisms tend to be more densely distributed than larger ones — a hectare can hold vastly more insects than elephants, simply because each individual needs far less space and far fewer resources. That is why population density is almost always reported per species, not as a single number for "how crowded" a habitat is overall.',
          'This calculator divides a population count by the area it was counted in, converting automatically between the common area units ecologists and wildlife surveys use: individuals per square kilometer for larger, wide-ranging animals, and per hectare or per square meter for smaller organisms or plot-based plant surveys.'
        ]
      },
      howTo: {
        intro: 'Enter the population count and the area it was counted over; the density fills in automatically in three common area units.',
        steps: [
          { name: 'Enter the population count', text: 'The total number of individuals counted or estimated.' },
          { name: 'Enter the area', text: 'The area that count covers. Switch the unit (km², hectares, acres, mi², m²) from the menu to match your source.' },
          { name: 'Read the density', text: 'The headline is density per square kilometer; the breakdown also shows it per hectare and per square meter.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Population density is simply a count divided by the area that count covers.',
        expression: 'density = population ÷ area\ndensity (per hectare) = density (per km²) ÷ 100\ndensity (per m²) = density (per km²) ÷ 1,000,000',
        terms: [
          { symbol: 'population', meaning: 'The total number of individuals counted or estimated (OpenStax’s "population size").' },
          { symbol: 'area', meaning: 'The area that count was taken over, in whatever unit is most natural for the organism being counted.' }
        ],
        note: 'This treats the count and area as already known. A real field count (such as mark-and-recapture, covered in OpenStax’s own population demography section) carries its own estimation error on top of this simple division.'
      },
      workedExample: {
        intro: 'A wildlife survey counts 600 individuals across a 50 km² habitat.',
        rows: [
          { label: 'Population', value: '600' },
          { label: 'Area', value: '50 km²' },
          { label: 'Density per km² (600 ÷ 50)', value: '12' },
          { label: 'Density per hectare (12 ÷ 100)', value: '0.12' },
          { label: 'Density per m² (12 ÷ 1,000,000)', value: '0.000012' }
        ],
        result: '12 individuals per km²',
        explanation:
          'The same density reads very differently depending on the unit: 12 per km² sounds sparse, but it is the same crowding as 0.12 per hectare or roughly 1 individual per 83,333 m² — all three describe the identical population spread over the identical area.'
      },
      watchOut: [
        {
          title: 'Density depends entirely on how the area is defined',
          body: 'Counting the same population over a smaller area (just the core habitat it actually uses, say) rather than a larger one (the whole survey boundary) gives a higher density for the identical population — always check what area a published density figure is measured against.'
        },
        {
          title: 'This is not a population estimate',
          body: 'This calculator assumes the population count is already known or already estimated by another method. OpenStax notes that field techniques like mark-and-recapture carry their own bias (animals that learn to avoid a second capture inflate the estimate; animals drawn back by a food reward deflate it) — errors in the count carry straight through to the density.'
        },
        {
          title: 'Density alone does not say whether a population is thriving',
          body: 'A high density can mean a population is nearing its environment’s carrying capacity (see Carrying Capacity Calculator) just as easily as it can mean a healthy, well-supported population — density on its own does not distinguish the two.'
        }
      ],
      references: [
        {
          label: 'OpenStax, Biology 2e, §45.1 "Population Demography" (population size and density definitions, mark-and-recapture bias)',
          url: 'https://openstax.org/books/biology-2e/pages/45-1-population-demography'
        }
      ]
    },
    inputs: [
      { id: 'population', label: 'Population', type: 'number', placeholder: '600', defaultValue: 600, step: 1, min: 0 },
      { id: 'area', label: 'Area', type: 'number', placeholder: '50', defaultValue: 50, step: 1, min: 0.000001, dimension: 'area', unit: 'km2' }
    ],
    breakdown: {
      headline: 'densityPerKm2',
      headlineLabel: 'Population density',
      outputs: [
        { id: 'densityPerKm2', label: 'Density (individuals/km²)', format: 'significant' },
        { id: 'densityPerHectare', label: 'Density (individuals/hectare)', format: 'significant' },
        { id: 'densityPerM2', label: 'Density (individuals/m²)', format: 'significant' }
      ],
      groups: [{ title: 'Population and area', inputs: ['population', 'area'] }]
    },
    seo: {
      title: 'Population Density Calculator – Individuals per Area',
      description: 'Free population density calculator. Calculate individuals per km², hectare, or m² from a population count and the area it occupies.',
      faq: [
        {
          question: 'How do I calculate population density?',
          answer: 'Divide the population count by the area it occupies. 600 individuals across 50 km² gives a density of 600 ÷ 50 = 12 individuals per km².'
        },
        {
          question: 'What is the difference between population size and population density?',
          answer:
            'OpenStax’s Biology 2e defines population size as "the total number of individuals" and population density as "the number of individuals within a specific area or volume" — size is a headcount, density is that headcount relative to the space it occupies.'
        },
        {
          question: 'How do I convert density between km² and hectares or m²?',
          answer: 'Divide by 100 to go from per km² to per hectare (1 km² = 100 ha, exact), or by 1,000,000 to go from per km² to per m² (1 km² = 1,000,000 m², exact). 12 per km² is 0.12 per hectare and 0.000012 per m².'
        },
        {
          question: 'Why do small organisms have higher population densities than large ones?',
          answer: 'OpenStax notes that smaller organisms tend to be more densely distributed than larger ones, since each individual needs less space and fewer resources — a given area can support far more insects than elephants.'
        },
        {
          question: 'Does population density tell you if a population is overcrowded?',
          answer: 'Not by itself. A high density can reflect a population nearing its environment’s carrying capacity, or simply a species that naturally lives at high density — density alone does not distinguish the two without more context.'
        },
        {
          question: 'Is this calculator accurate if my population count is just an estimate?',
          answer: 'The division itself is exact, but the result is only as accurate as the population count you enter. Field methods like mark-and-recapture carry their own estimation bias, which carries straight through into the density figure.'
        }
      ]
    },
    compute(values) {
      // 1 km² = 100 ha = 1,000,000 m², exact SI area relationships (NIST SP 811).
      const densityPerKm2 = values.population / values.area;
      const densityPerHectare = densityPerKm2 / 100;
      const densityPerM2 = densityPerKm2 / 1e6;
      return { densityPerKm2, densityPerHectare, densityPerM2 };
    }
  },
  {
    id: 'simpson-diversity-index-calculator',
    category: 'ecology',
    glyph: 'D',
    updatedAt: '2026-11-17',
    aliases: [
      'simpson diversity index calculator',
      "simpson's diversity index calculator",
      'simpson index calculator',
      'gini-simpson index calculator',
      'species dominance index calculator'
    ],
    related: ['shannon-diversity-index-calculator', 'population-density-calculator', 'carrying-capacity-calculator', 'standard-deviation-calculator'],
    title: "Simpson's Diversity Index Calculator",
    description: "Calculate Simpson's Diversity Index (1 − λ) from species counts — a biodiversity measure weighted toward the most abundant species, as a check on the Shannon index.",
    example:
      "A sample of 100 individuals across 5 species (40, 30, 20, 8, and 2 of each) has a Simpson's Diversity Index of about 0.7103 — a 71.0% chance that two randomly chosen individuals belong to different species.",
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: "What is Simpson's diversity index?",
        paragraphs: [
          'OpenStax’s Biology 2e frames biodiversity as "the number of different species (species richness)... and their relative abundance (species evenness)." Simpson’s index is a second standard way to turn those two ideas into one number, built around a different question than Shannon’s: not "how much uncertainty is there about a random individual’s species," but "how likely are two randomly drawn individuals to be the same species?"',
          'The index comes from E. H. Simpson’s 1949 paper "Measurement of Diversity" in Nature. For a finite sample of nᵢ individuals of each species out of N total, the probability that two individuals drawn without replacement are the same species is λ = Σ[nᵢ(nᵢ−1)] ÷ [N(N−1)], summed over every species. A community dominated by one or two common species has a high λ (two random picks are likely to match); a community with many equally common species has a low λ.',
          'Because a high λ means low diversity, most reported figures use 1 − λ instead (sometimes called the Gini-Simpson index), so that a larger number means more diversity, matching the intuition Shannon’s H′ already gives. This calculator reports both: λ itself (the probability of picking two of the same species) and 1 − λ (the diversity index, this page’s headline).'
        ]
      },
      howTo: {
        intro: 'Enter the number of individuals counted for each species in the sample; the index fills in instantly.',
        steps: [
          { name: 'Count individuals by species', text: 'From a field survey or quadrat count, tally how many individuals of each species were observed.' },
          { name: 'Enter each species’ count', text: 'Fill in the count for each species present. Leave any unused slot at 0 if the sample has fewer than 5 species.' },
          { name: 'Read Simpson’s Diversity Index', text: 'The headline, 1 − λ, is higher when a random pair of individuals is less likely to be the same species — more species, more evenly represented, or both.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Simpson’s index sums, over every species, the chance that both of two individuals drawn without replacement come from that species.',
        expression: 'λ = Σ[nᵢ(nᵢ − 1)] ÷ [N(N − 1)], summed over every species with nᵢ > 0\nSimpson’s Diversity Index = 1 − λ',
        terms: [
          { symbol: 'nᵢ', meaning: 'The number of individuals counted of species i.' },
          { symbol: 'N', meaning: 'The total number of individuals counted, across all species.' },
          { symbol: 'λ', meaning: 'Simpson’s index — the probability two individuals drawn at random, without replacement, are the same species.' }
        ],
        note: 'This is the count-based (finite-sample) form of Simpson’s index, the correct form for an actual species count rather than a theoretical proportion. Shannon Diversity Index Calculator computes a differently weighted diversity measure from the same kind of species-count data.'
      },
      workedExample: {
        intro: 'The same sample used on Shannon Diversity Index Calculator: 100 individuals across 5 species — 40, 30, 20, 8, and 2.',
        rows: [
          { label: 'Σ nᵢ(nᵢ − 1) (40×39 + 30×29 + 20×19 + 8×7 + 2×1)', value: '2,868' },
          { label: 'N(N − 1) (100 × 99)', value: '9,900' },
          { label: 'λ (2,868 ÷ 9,900)', value: '≈0.2897' },
          { label: "Simpson's Diversity Index (1 − 0.2897)", value: '≈0.7103' }
        ],
        result: "Simpson's Diversity Index ≈ 0.7103",
        explanation:
          'A λ of about 0.2897 means roughly a 29.0% chance that two individuals picked at random from this sample are the same species — mostly driven by species A and B together making up 70 of the 100 individuals. Subtracting from 1 gives the diversity reading, 0.7103: about a 71.0% chance a random pair is from two different species.'
      },
      watchOut: [
        {
          title: 'Dominated by the most common species, unlike Shannon’s index',
          body: 'Because λ squares (effectively) each species’ share of the sample, abundant species contribute disproportionately more than rare ones. Shannon Diversity Index Calculator’s log-weighted formula gives rare species comparatively more influence — the two indices can disagree about which of two communities is "more diverse."'
        },
        {
          title: '1 − λ and 1 ÷ λ are both called "Simpson’s diversity index"',
          body: 'Different sources report Simpson’s measure as λ itself, as 1 − λ (the Gini-Simpson index, used here), or as 1 ÷ λ (the inverse Simpson index, read as an "effective number of species"). Always check which version a figure you are comparing against used before treating two numbers as directly comparable.'
        },
        {
          title: 'Needs at least 2 individuals total',
          body: 'With N(N − 1) in the denominator, a sample of 0 or 1 individuals has no defined index — there is no pair to compare.'
        },
        {
          title: 'Small samples still carry sampling noise',
          body: 'As with any index built from a count, a small sample can over- or under-represent rare species just by chance, shifting λ even if the true community composition did not change.'
        }
      ],
      references: [
        {
          label: 'Simpson, E.H. (1949), "Measurement of Diversity," Nature 163(4148): 688 (the original λ = Σpᵢ² / count-based formula)',
          url: 'https://en.wikipedia.org/wiki/Diversity_index'
        },
        {
          label: 'OpenStax, Biology 2e, §45.6 "Community Ecology" (species richness and species evenness framing)',
          url: 'https://openstax.org/books/biology-2e/pages/45-6-community-ecology'
        }
      ]
    },
    inputs: [
      { id: 'speciesACount', label: 'Species A', type: 'number', placeholder: '40', defaultValue: DEFAULT_SPECIES_COUNTS[0], step: 1, min: 0 },
      { id: 'speciesBCount', label: 'Species B', type: 'number', placeholder: '30', defaultValue: DEFAULT_SPECIES_COUNTS[1], step: 1, min: 0 },
      { id: 'speciesCCount', label: 'Species C', type: 'number', placeholder: '20', defaultValue: DEFAULT_SPECIES_COUNTS[2], step: 1, min: 0 },
      { id: 'speciesDCount', label: 'Species D', type: 'number', placeholder: '8', defaultValue: DEFAULT_SPECIES_COUNTS[3], step: 1, min: 0 },
      { id: 'speciesECount', label: 'Species E', type: 'number', placeholder: '2', defaultValue: DEFAULT_SPECIES_COUNTS[4], step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'simpsonDiversity',
      headlineLabel: "Simpson's Diversity Index (1 − λ)",
      outputs: [
        { id: 'simpsonDiversity', label: "Simpson's Diversity Index (1 − λ)", format: 'significant' },
        { id: 'lambda', label: 'λ (probability of a matching pair)', format: 'significant' },
        { id: 'richness', label: 'Species richness (S)', format: 'integer' },
        { id: 'totalIndividuals', label: 'Total individuals counted', format: 'integer' }
      ],
      groups: [{ title: 'Species counts', inputs: ['speciesACount', 'speciesBCount', 'speciesCCount', 'speciesDCount', 'speciesECount'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'speciesACount', label: 'Species A' },
          { from: 'speciesBCount', label: 'Species B' },
          { from: 'speciesCCount', label: 'Species C' },
          { from: 'speciesDCount', label: 'Species D' },
          { from: 'speciesECount', label: 'Species E' }
        ],
        center: 'totalIndividuals',
        centerSub: 'individuals counted'
      }
    },
    seo: {
      title: "Simpson's Diversity Index Calculator (1 − λ)",
      description: "Free Simpson's diversity index calculator. Compute λ and 1 − λ from species-count data, and compare against the Shannon index.",
      faq: [
        {
          question: "What is Simpson's diversity index formula?",
          answer:
            'λ = Σ[nᵢ(nᵢ − 1)] ÷ [N(N − 1)], summed over every species, and the diversity index is 1 − λ. A sample of 100 individuals across 5 species (40, 30, 20, 8, 2) gives λ ≈ 0.2897 and a diversity index of about 0.7103.'
        },
        {
          question: 'What does Simpson’s index actually measure?',
          answer:
            'λ is the probability that two individuals drawn at random from the sample, without replacement, belong to the same species. Subtracting from 1 flips it into a diversity reading, where a higher number means two random individuals are less likely to match.'
        },
        {
          question: "How is this different from the Shannon diversity index?",
          answer:
            'Both use the same species-count data, but weight it differently. Simpson’s index is dominated by the most abundant species (it is essentially built from each species’ squared share of the sample), while Shannon’s log-based H′ gives rare species comparatively more influence. The two can rank the same two communities differently.'
        },
        {
          question: 'Why are there three different versions of "Simpson\'s index"?',
          answer:
            'Sources report λ itself, 1 − λ (the Gini-Simpson index, used on this page), or 1 ÷ λ (the inverse Simpson index). All three come from the same underlying λ, just presented differently — check which one a figure you are comparing against uses.'
        },
        {
          question: 'What is the minimum sample size this works for?',
          answer: 'At least 2 individuals total, since the formula’s denominator is N(N − 1) — with 0 or 1 individuals there is no pair to compare, so the index is undefined.'
        },
        {
          question: 'Who introduced Simpson’s diversity index?',
          answer: 'The statistician E. H. Simpson, in his 1949 paper "Measurement of Diversity" published in Nature — one of the two most widely used diversity indices in ecology, alongside Shannon’s.'
        }
      ]
    },
    compute(values) {
      const counts = [values.speciesACount, values.speciesBCount, values.speciesCCount, values.speciesDCount, values.speciesECount];
      const totalIndividuals = counts.reduce((sum, n) => sum + n, 0);
      const richness = counts.filter((n) => n > 0).length;
      const sumNiNi1 = counts.reduce((sum, n) => sum + n * (n - 1), 0);
      const lambda = sumNiNi1 / (totalIndividuals * (totalIndividuals - 1));
      const simpsonDiversity = 1 - lambda;
      return { simpsonDiversity, lambda, richness, totalIndividuals };
    }
  },
  {
    id: 'lotka-volterra-calculator',
    category: 'ecology',
    glyph: 'x·y',
    updatedAt: '2026-11-17',
    aliases: [
      'lotka-volterra calculator',
      'lotka volterra equilibrium calculator',
      'predator-prey equilibrium calculator',
      'predator prey model calculator',
      'lotka-volterra equations calculator'
    ],
    related: ['carrying-capacity-calculator', 'population-growth-calculator', 'population-density-calculator', 'quadratic-formula-calculator'],
    title: 'Lotka-Volterra Calculator (Predator-Prey Equilibrium)',
    description:
      'Calculate the non-trivial equilibrium populations of the Lotka-Volterra predator-prey model, x* = γ/δ and y* = α/β, from the model’s four rate constants.',
    example:
      'With a prey growth rate α = 0.6, predation rate β = 0.02, predator death rate γ = 0.4, and predator efficiency δ = 0.01, the equilibrium is 40 prey and 30 predators.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is the Lotka-Volterra equilibrium?',
        paragraphs: [
          'The Lotka-Volterra model, proposed independently by Alfred J. Lotka (in his 1925 book Elements of Physical Biology) and Vito Volterra (in 1926), is the classic pair of coupled equations describing how a predator and prey population affect each other over time: dx/dt = αx − βxy for the prey, and dy/dt = −γy + δxy for the predators. Here x and y are the prey and predator population sizes; α is the prey’s own growth rate with no predators; β is how much predation reduces the prey’s growth; γ is the predators’ own death rate with no prey to eat; and δ is how efficiently predators convert eaten prey into their own population growth.',
          'This calculator is deliberately scoped to one specific, closed-form question the full model answers exactly: the non-trivial equilibrium — the one pair of populations at which both dx/dt and dy/dt are exactly zero, so neither population is changing. Setting both equations to zero and solving gives x* = γ/δ for the prey and y* = α/β for the predators — note that each population’s equilibrium size is set entirely by the other species’ own rate constants, not its own.',
          'The full Lotka-Volterra model beyond this single equilibrium point is a coupled differential-equation system with no simple closed-form solution for population over time — predicting how x and y move at any other starting point requires numerically simulating the two equations together, which this calculator does not attempt. See Watch out for below on what the equilibrium point does and does not tell you about real predator-prey populations.'
        ]
      },
      howTo: {
        intro: 'Enter the model’s four rate constants; the two equilibrium population sizes fill in automatically.',
        steps: [
          { name: 'Enter the prey growth rate (α)', text: 'How fast the prey population would grow with no predators at all.' },
          { name: 'Enter the predation rate (β)', text: 'How much predator-prey encounters reduce the prey growth rate.' },
          { name: 'Enter the predator death rate (γ)', text: 'How fast the predator population would decline with no prey to eat.' },
          { name: 'Enter the predator efficiency (δ)', text: 'How efficiently predators convert eaten prey into their own population growth.' },
          { name: 'Read the equilibrium', text: 'The result is the prey and predator population sizes at which both stay exactly constant.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Setting both Lotka-Volterra equations to zero and solving gives the equilibrium directly.',
        expression: 'dx/dt = αx − βxy = 0\ndy/dt = −γy + δxy = 0\nx* = γ ÷ δ (equilibrium prey population)\ny* = α ÷ β (equilibrium predator population)',
        terms: [
          { symbol: 'α', meaning: 'The prey’s own per-capita growth rate, with no predators present.' },
          { symbol: 'β', meaning: 'How much each predator-prey encounter reduces the prey’s growth rate.' },
          { symbol: 'γ', meaning: 'The predators’ own per-capita death rate, with no prey to eat.' },
          { symbol: 'δ', meaning: 'How efficiently predators convert eaten prey into their own population growth.' }
        ],
        note: 'All four rate constants need a consistent time unit (all per day, or all per year, for example) for the equilibrium populations to be meaningful — the formula itself does not care which unit, as long as it is the same one throughout.'
      },
      workedExample: {
        intro: 'A prey growth rate α = 0.6, predation rate β = 0.02, predator death rate γ = 0.4, and predator efficiency δ = 0.01 (consistent per-day units).',
        rows: [
          { label: 'Equilibrium prey (x* = γ ÷ δ = 0.4 ÷ 0.01)', value: '40' },
          { label: 'Equilibrium predators (y* = α ÷ β = 0.6 ÷ 0.02)', value: '30' }
        ],
        result: '40 prey, 30 predators at equilibrium',
        explanation:
          'At exactly 40 prey and 30 predators, the prey’s growth (αx) is exactly balanced by predation losses (βxy), and the predators’ deaths (γy) are exactly balanced by growth from eating prey (δxy) — both populations hold steady at these two numbers, in this simplified model.'
      },
      watchOut: [
        {
          title: 'Only the equilibrium point — not a time-series simulation',
          body: 'The full Lotka-Volterra model is a coupled differential-equation system; predicting the populations at any time other than this one equilibrium point requires numerically simulating the two equations together. This calculator deliberately does not attempt that simulation — it reports only the closed-form fixed point, x* = γ/δ and y* = α/β.'
        },
        {
          title: 'This equilibrium is not a stable attractor',
          body: 'In the classic Lotka-Volterra model, this fixed point is a center, not a stable equilibrium: starting exactly at x* and y* keeps both populations constant forever, but starting anywhere else sends both populations into a perpetual, closed cycle around that point — they never settle back down to it. Real predator-prey populations (famously, Canadian lynx and snowshoe hare) are often observed cycling for exactly this reason.'
        },
        {
          title: 'All four rate constants need matching time units',
          body: 'α, β, γ, and δ must all be expressed per the same time unit — all per day, or all per year — for the equilibrium to mean anything. Mixing units (α per year with γ per day, for instance) silently produces a meaningless result.'
        },
        {
          title: 'A simplified model of real ecosystems',
          body: 'The model assumes one predator species eating one prey species, with no other food sources, competitors, disease, or environmental limits (no carrying capacity for the prey, unlike Carrying Capacity Calculator’s logistic model). Real predator-prey systems are rarely this clean, and the model is best treated as an illustrative starting point, not a precise forecast.'
        }
      ],
      references: [
        {
          label: 'Lotka, A.J. (1925), Elements of Physical Biology, and Volterra, V. (1926), "Variazioni e fluttuazioni del numero d\'individui in specie animali conviventi," Memorie della R. Accademia Nazionale dei Lincei (the two independent original sources of the predator-prey equations and their equilibrium)',
          url: 'https://en.wikipedia.org/wiki/Lotka%E2%80%93Volterra_equations'
        }
      ]
    },
    inputs: [
      { id: 'alpha', label: 'Prey growth rate (α)', type: 'number', placeholder: '0.6', defaultValue: 0.6, step: 0.01, min: 0.0001 },
      { id: 'beta', label: 'Predation rate (β)', type: 'number', placeholder: '0.02', defaultValue: 0.02, step: 0.001, min: 0.0001 },
      { id: 'gamma', label: 'Predator death rate (γ)', type: 'number', placeholder: '0.4', defaultValue: 0.4, step: 0.01, min: 0.0001 },
      { id: 'delta', label: 'Predator efficiency (δ)', type: 'number', placeholder: '0.01', defaultValue: 0.01, step: 0.001, min: 0.0001 }
    ],
    breakdown: {
      headline: 'preyEquilibrium',
      headlineLabel: 'Equilibrium prey population (x*)',
      outputs: [
        { id: 'preyEquilibrium', label: 'Equilibrium prey (x* = γ ÷ δ)', format: 'significant' },
        { id: 'predatorEquilibrium', label: 'Equilibrium predators (y* = α ÷ β)', format: 'significant' }
      ],
      groups: [{ title: 'Rate constants', inputs: ['alpha', 'beta', 'gamma', 'delta'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'preyEquilibrium', label: 'Prey (x*)' },
          { from: 'predatorEquilibrium', label: 'Predators (y*)' }
        ],
        title: 'Equilibrium population sizes',
        highlight: 0
      }
    },
    seo: {
      title: 'Lotka-Volterra Calculator – Predator-Prey Equilibrium',
      description: 'Free Lotka-Volterra calculator. Compute the predator-prey model’s equilibrium populations, x* = γ/δ and y* = α/β, from its four rate constants.',
      faq: [
        {
          question: 'What is the Lotka-Volterra equilibrium formula?',
          answer:
            'x* = γ ÷ δ for the equilibrium prey population and y* = α ÷ β for the equilibrium predator population, found by setting both of the model’s differential equations to zero. With α=0.6, β=0.02, γ=0.4, δ=0.01, that gives 40 prey and 30 predators.'
        },
        {
          question: 'Does this calculator simulate the full predator-prey cycle over time?',
          answer:
            'No. The full Lotka-Volterra model is a coupled differential-equation system with no simple closed-form solution for population at an arbitrary time — that requires numerical simulation. This calculator reports only the one closed-form answer the model does have: the equilibrium point.'
        },
        {
          question: 'Does reaching the equilibrium mean the populations stay there?',
          answer:
            'Only if they start exactly there. In the classic model, the equilibrium is a center, not a stable attractor — any other starting point sends both populations into a continuous cycle around it rather than settling down, which is part of why real predator-prey populations (like lynx and snowshoe hare) are often observed cycling.'
        },
        {
          question: 'What do α, β, γ, and δ represent?',
          answer:
            'α is the prey’s growth rate with no predators; β is how much predation slows that growth; γ is the predators’ death rate with no prey; and δ is how efficiently predators convert eaten prey into their own population growth.'
        },
        {
          question: 'Who first proposed the Lotka-Volterra model?',
          answer:
            'Alfred J. Lotka, in his 1925 book Elements of Physical Biology, and independently Vito Volterra in a 1926 paper — the same pair of equations, discovered separately.'
        },
        {
          question: 'Why does the prey equilibrium depend on the predator’s own rates, and not the prey’s?',
          answer:
            'Because x* = γ/δ comes from setting the predator equation (dy/dt) to zero, which only involves γ and δ — the prey population size that keeps the predators exactly stable depends on the predators’ own death rate and efficiency, not on the prey’s own growth rate α.'
        }
      ]
    },
    compute(values) {
      const preyEquilibrium = values.gamma / values.delta;
      const predatorEquilibrium = values.alpha / values.beta;
      return { preyEquilibrium, predatorEquilibrium };
    }
  }
];
