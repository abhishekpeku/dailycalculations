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

// --- Step 49 batch 3 (sustainable living / resource use) constants ---

// car-vs-bike-calculator: EPA, "Greenhouse Gas Equivalencies Calculator - Calculations and
// References" (epa.gov/energy/ghg-equivalencies-calculator-calculations-and-references), the same
// source already fetched for carbon-footprint-calculator in batch 1. Reused here as its own
// constant since data/calculators files don't share helpers with each other.
const CAR_VS_BIKE_GASOLINE_KG_PER_GALLON = 8.887e-3 * 1000; // "8.887 x 10^-3 metric tons CO2/gallon of gasoline"

// tree-benefits-calculator: same EPA GHG Equivalencies Calculator page, "Carbon Sequestered by
// a Tree Seedling" section, citing McPherson et al. (2016), "Urban tree database and allometric
// equations," USDA Forest Service, Pacific Southwest Research Station. Fetched directly.
const TREE_CO2_KG_PER_YEAR = 0.060 * 1000; // "0.060 metric ton CO2 per urban tree planted per year"

// books-vs-ebooks-calculator: Kozak, G. (2003), "Printed Scholarly Books and E-book Reading
// Devices: A Comparative Life Cycle Assessment of Two Book Options," University of Michigan
// Center for Sustainable Systems, Report No. CSS03-04 (css.umich.edu), fetched directly as the
// published PDF. Global-warming-potential results by life-cycle stage, for the study's own
// functional unit of 40 scholarly books read once by a single owner over 4 years.
// Table 6-6 (printed book system): material 97.58 + manufacturing 66.42 + distribution 0.79 +
// use 53.13 + end-of-life 0.00 kg CO2e, for 40 books -> per book.
const BOOK_PRINT_CO2_KG_PER_BOOK = (97.58 + 66.42 + 0.79 + 53.13 + 0.0) / 40;
// Table 6-7 (e-reader system): material 2.47 + manufacturing 17.38 + distribution 0.99 +
// end-of-life 1.58 kg CO2e = the device's own one-time footprint, amortized over the 40-book
// functional unit (assumes the student's single e-reader is used for exactly this many books
// over its working life).
const EREADER_FIXED_CO2_KG = 2.47 + 17.38 + 0.99 + 1.58;
// Use-stage 37.84 kg CO2e for 40 books (downloading + on-screen reading electricity) -> per book,
// scaling roughly with reading time, which the study itself finds to scale with book length.
const EREADER_USE_CO2_KG_PER_BOOK = 37.84 / 40;

// drip-faucet-waste-calculator: U.S. EPA WaterSense, "Fix a Leak Week" (epa.gov/watersense/fix-leak-week),
// fetched directly. "A leaky faucet that drips at the rate of one drip per second can waste more
// than 3,000 gallons per year" -> gallons per year per drip-per-minute, since 1 drip/second is
// 60 drips/minute. Cross-checked against the same page's independent showerhead figure ("a
// showerhead leaking at 10 drips per minute wastes more than 500 gallons per year"): 10 x 50 = 500,
// confirming the two EPA-published anchors imply the same linear rate.
const DRIP_GAL_PER_YEAR_PER_DRIP_PER_MINUTE = 3000 / 60;
const AVG_HOUSEHOLD_LEAKS_GAL_PER_YEAR = 9300; // EPA WaterSense, same page: "more than 9,300 gallons of water wasted every year"

// recycling-rate-calculator: U.S. EPA, "National Overview: Facts and Figures on Materials, Waste
// and Recycling" (same page already fetched for plastic-footprint-calculator in batch 1), 2018 data.
const RECYCLING_TOTAL_MSW_LB_PER_PERSON_DAY_2018 = 4.9; // "4.9 pounds per person per day" in 2018
const RECYCLING_NATIONAL_RATE_PCT_2018 = 32.1; // "32.1 percent recycling and composting rate"

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
    id: 'car-vs-bike-calculator',
    category: 'ecology',
    glyph: 'vs',
    updatedAt: '2026-11-17',
    aliases: [
      'car vs bike calculator',
      'bike to work savings calculator',
      'cycling vs driving calculator',
      'commute by bike savings calculator',
      'biking vs driving carbon calculator'
    ],
    related: ['commute-cost-calculator', 'fuel-cost-calculator', 'ev-charging-calculator', 'carbon-footprint-calculator'],
    title: 'Car vs Bike Calculator',
    description:
      'Compare the fuel cost and CO2 emissions of driving a commute against biking it instead, using your own round-trip distance, car fuel economy, and gas price, with EPA’s published gasoline emissions factor.',
    example:
      'A 10-mile round-trip commute, driven 5 days a week in a 25 mpg car at $3.75 a gallon, burns 104 gallons and emits about 924.2 kg (0.92 metric tons) of CO2e a year — biking the same commute instead avoids all of it and the $390 in fuel.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What does biking instead of driving actually save?',
        paragraphs: [
          'Every gallon of gasoline a car burns releases a fixed, well-measured amount of carbon dioxide when it combusts — the U.S. Environmental Protection Agency puts it at 8.887 kilograms of CO2 per gallon. A bicycle burns no fuel at all, so riding one instead of driving avoids that tailpipe emission entirely, along with the fuel cost itself, for whatever portion of a commute gets ridden instead of driven.',
          'This calculator multiplies your round-trip commute distance by how many days a week you make the trip to get an annual mileage total, then compares two ways of covering it: driving, which costs fuel and emits CO2 according to your car’s own fuel economy, and biking, which costs nothing in fuel and emits nothing from combustion. The gap between the two is what switching commute days from car to bike is actually worth, in dollars and in kilograms of CO2e avoided.',
          'This is a direct, tailpipe-and-fuel-cost comparison only. It does not count the embodied emissions of manufacturing either the car or the bicycle, or a car’s non-fuel running costs like maintenance, insurance, and depreciation — the Commute Cost Calculator covers those separately.'
        ]
      },
      howTo: {
        intro: 'Enter your round-trip commute distance, how many days a week you make it, and your car’s fuel economy and gas price.',
        steps: [
          { name: 'Enter the round-trip distance', text: 'Type the distance there and back, in miles or km.' },
          { name: 'Enter commute days per week', text: 'How many days a week you make this trip, by either mode.' },
          { name: 'Enter your car’s fuel economy', text: 'Your car’s mpg (US or UK), L/100 km, or km/L.' },
          { name: 'Enter the gas price', text: 'The price per gallon or per liter you actually pay.' },
          { name: 'Read the comparison', text: 'The headline is the yearly fuel cost and CO2e you’d avoid by biking those days instead of driving them.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Annual mileage comes from the commute and its frequency; the car’s cost and emissions follow from its own fuel economy, while the bike’s are both zero.',
        expression: 'annualMiles = roundTripMiles × daysPerWeek × 52\ngallons = annualMiles ÷ mpg\ncarCost = gallons × gasPrice\ncarCO2 = gallons × 8.887 kg/gallon\nbikeCost = 0\nbikeCO2 = 0',
        terms: [
          { symbol: '8.887 kg/gallon', meaning: 'EPA’s published emissions factor for burning a gallon of gasoline.' },
          { symbol: 'mpg', meaning: 'Your car’s own fuel economy, which determines how many gallons the commute actually burns.' }
        ],
        note: 'A fuel-and-tailpipe-only comparison. It leaves out vehicle manufacturing, maintenance, and the practical limits of biking a given distance or weather.'
      },
      workedExample: {
        intro: 'A 10-mile round-trip commute, driven or biked 5 days a week, in a 25 mpg car with gas at $3.75 a gallon.',
        rows: [
          { label: 'Annual miles (10 × 5 × 52)', value: '2,600 mi' },
          { label: 'Gallons burned (2,600 ÷ 25)', value: '104 gal' },
          { label: 'Car fuel cost (104 × $3.75)', value: '$390.00' },
          { label: 'Car CO2e (104 × 8.887 kg)', value: '924.2 kg (0.92 t)' },
          { label: 'Bike fuel cost and CO2e', value: '$0.00, 0 kg' }
        ],
        result: 'Biking instead saves $390.00 a year and avoids about 924.2 kg (0.92 metric tons) of CO2e',
        explanation:
          'Doubling the round trip to 20 miles (e.g. a longer commute) doubles both figures: $650.00 a year and about 1,540.4 kg (1.54 metric tons) of CO2e avoided, since both scale directly with distance.'
      },
      watchOut: [
        {
          title: 'Zero tailpipe emissions, not zero footprint',
          body: 'A bicycle burns no fuel and emits nothing from combustion while riding, but manufacturing any vehicle, car or bike, carries its own embodied emissions that this calculator does not count. The comparison here is specifically fuel burned and CO2 emitted per mile of commuting, not a full life-cycle comparison.'
        },
        {
          title: 'This excludes the car’s non-fuel costs',
          body: 'Maintenance, insurance, depreciation, and parking all add to driving’s real cost beyond fuel. The Commute Cost Calculator adds a per-mile wear allowance and parking and tolls on top of fuel for a fuller picture.'
        },
        {
          title: 'Not every commute is bikeable every day',
          body: 'Distance, weather, road safety, and carrying cargo all limit how many days a commute can realistically switch from car to bike. Enter the number of days you’d actually ride, not an idealized maximum.'
        },
        {
          title: 'The gasoline factor is a national average',
          body: 'EPA’s 8.887 kg CO2 per gallon reflects gasoline’s own combustion chemistry and barely varies by region, unlike electricity’s emissions factor, which depends heavily on the local grid.'
        }
      ],
      references: [
        { label: 'U.S. EPA, Greenhouse Gas Equivalencies Calculator – Calculations and References', url: 'https://www.epa.gov/energy/ghg-equivalencies-calculator-calculations-and-references' }
      ]
    },
    inputs: [
      { id: 'roundTripMiles', label: 'Round-trip commute distance', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 0, dimension: 'length', unit: 'mi' },
      { id: 'daysPerWeek', label: 'Commute days per week', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'mpg', label: 'Car fuel economy', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 1, dimension: 'fuelEconomy', unit: 'mpg' },
      { id: 'gasPricePerGallon', label: 'Gas price', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0, dimension: 'fuelPrice', unit: 'cur/gal' }
    ],
    breakdown: {
      headline: 'carCostAnnual',
      headlineLabel: 'Car’s yearly fuel cost (what biking saves)',
      outputs: [
        { id: 'carCostAnnual', label: 'Car fuel cost (per year)', format: 'currency' },
        { id: 'carCO2AnnualKg', label: 'Car CO2e (per year)', dimension: 'mass', alsoIn: ['t'] },
        { id: 'bikeCostAnnual', label: 'Bike fuel cost (per year)', format: 'currency' },
        { id: 'bikeCO2AnnualKg', label: 'Bike CO2e (per year)', dimension: 'mass' }
      ],
      groups: [{ title: 'Commute', inputs: ['roundTripMiles', 'daysPerWeek', 'mpg', 'gasPricePerGallon'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'carCO2AnnualKg', label: 'Car' },
          { from: 'bikeCO2AnnualKg', label: 'Bike' }
        ],
        title: 'Yearly CO2e: car vs. bike',
        highlight: 0
      }
    },
    seo: {
      title: 'Car vs Bike Calculator – Commute Cost & CO2',
      description: 'Free car vs bike calculator. Compare the fuel cost and CO2 emissions of driving your commute against biking it, using EPA’s gasoline emissions factor.',
      faq: [
        {
          question: 'How much CO2 does driving to work produce compared to biking?',
          answer:
            'Multiply the gallons burned (annual miles ÷ mpg) by EPA’s factor of 8.887 kg CO2 per gallon; biking produces zero. A 10-mile round trip, 5 days a week in a 25 mpg car, burns 104 gallons and emits about 924.2 kg (0.92 metric tons) of CO2e a year, all of which biking avoids.'
        },
        {
          question: 'How much money would I save biking to work instead of driving?',
          answer: 'The fuel cost of the drive (gallons × gas price), since a bike burns no fuel. In the worked example, 104 gallons at $3.75 comes to $390.00 a year.'
        },
        {
          question: 'Does this count the cost of buying or maintaining a bike?',
          answer: 'No — this is a fuel-and-emissions comparison for the trip itself, not a full cost-of-ownership comparison for either vehicle.'
        },
        {
          question: 'Does biking really produce zero emissions?',
          answer: 'A bicycle burns no fuel, so it has no tailpipe emissions while riding. This calculator compares combustion emissions only; it does not count the embodied emissions of manufacturing either vehicle.'
        },
        {
          question: 'What if I only bike some days and drive the rest?',
          answer: 'Set "commute days per week" to the number of days you’d actually bike, and compare that result to the all-driving total — the difference is what switching those specific days is worth.'
        },
        {
          question: 'Why does the car’s fuel economy matter so much?',
          answer: 'A more efficient car burns fewer gallons for the same distance, which lowers both its cost and its CO2e proportionally — doubling mpg roughly halves both figures for the same commute.'
        }
      ]
    },
    compute(values) {
      const annualMiles = values.roundTripMiles * values.daysPerWeek * 52;
      const gallons = annualMiles / values.mpg;
      const carCostAnnual = gallons * values.gasPricePerGallon;
      const carCO2AnnualKg = gallons * CAR_VS_BIKE_GASOLINE_KG_PER_GALLON;
      const bikeCostAnnual = 0;
      const bikeCO2AnnualKg = 0;
      return { carCostAnnual, carCO2AnnualKg, bikeCostAnnual, bikeCO2AnnualKg };
    }
  },
  {
    id: 'tree-benefits-calculator',
    category: 'ecology',
    glyph: 'tree',
    updatedAt: '2026-11-17',
    aliases: [
      'tree benefits calculator',
      'how much co2 does a tree absorb',
      'tree carbon sequestration calculator',
      'trees planted carbon offset calculator',
      'tree co2 offset calculator'
    ],
    related: ['carbon-footprint-calculator', 'flight-carbon-footprint-calculator', 'meat-footprint-calculator', 'commute-cost-calculator'],
    title: 'Tree Benefits Calculator',
    description:
      'Estimate how much CO2 a given number of urban trees absorb over time, using the EPA’s published per-tree annual carbon sequestration factor, with the equivalent in gallons of gasoline not burned.',
    example:
      '10 urban trees planted and grown for 10 years sequester about 6,000 kg (6 metric tons) of CO2 — roughly the same as not burning 675.1 gallons of gasoline.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'How much carbon does a tree actually absorb?',
        paragraphs: [
          'As a tree grows, it builds its wood, roots, bark, and leaves largely out of carbon pulled from the air as CO2, through photosynthesis. The U.S. Environmental Protection Agency publishes a standard estimate for this in its Greenhouse Gas Equivalencies Calculator: an average urban tree sequesters about 0.060 metric tons (60 kilograms) of CO2 a year, a figure weighted across the mix of species — mostly deciduous, with some coniferous — typically planted and grown in U.S. urban environments. The underlying data come from the U.S. Forest Service’s own urban tree database and allometric equations (McPherson et al., 2016).',
          'This calculator multiplies that per-tree, per-year rate by how many trees you enter and how many years they are assumed to grow, to give a simple cumulative CO2 estimate. It also converts the total into an equivalent number of gallons of gasoline not burned, using the same EPA emissions-factor reference, so the figure is easier to picture alongside a everyday fuel use.',
          'A single urban tree’s own absorption is modest compared to a household’s yearly footprint — it takes dozens of trees, grown for years, to offset even a fraction of an average car’s annual emissions. This calculator is meant to size that comparison honestly, not to suggest tree planting alone can offset a large footprint quickly.'
        ]
      },
      howTo: {
        intro: 'Enter how many trees and how many years of growth; the cumulative CO2 estimate appears instantly.',
        steps: [
          { name: 'Enter the number of trees', text: 'How many urban trees you’re estimating for — one, or a whole planting project.' },
          { name: 'Enter the number of years', text: 'How many years of growth to count. EPA’s own figure is an annual average rate, so this scales linearly.' },
          { name: 'Read the total', text: 'The headline is the cumulative CO2 sequestered over that time, in kilograms and metric tons, plus the equivalent gallons of gasoline not burned.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Total CO2 sequestered is trees times years times the EPA’s own per-tree annual rate; the gasoline equivalent follows from the same EPA page’s gasoline factor.',
        expression: 'totalCO2 (kg) = trees × years × 60 kg/tree/year\ngasolineEquivalent (gal) = totalCO2 ÷ 8.887 kg/gal',
        terms: [
          { symbol: '60 kg/tree/year', meaning: 'EPA’s published average annual CO2 sequestration rate for an urban tree, citing McPherson et al. (2016), USDA Forest Service.' },
          { symbol: '8.887 kg/gal', meaning: 'EPA’s published emissions factor for burning a gallon of gasoline, used here only to convert the total into an equivalent amount of avoided fuel combustion.' }
        ],
        note: 'An average across common urban tree species; an individual tree’s real sequestration varies with species, size, climate, and health.'
      },
      workedExample: {
        intro: '10 urban trees, grown for 10 years.',
        rows: [
          { label: 'Per tree per year', value: '60 kg' },
          { label: 'Total (10 trees × 10 years × 60 kg)', value: '6,000 kg' },
          { label: 'In metric tons', value: '6.0 t' },
          { label: 'Gasoline equivalent (6,000 ÷ 8.887)', value: '≈675.1 gallons' }
        ],
        result: 'About 6,000 kg (6 metric tons) of CO2 sequestered over 10 years',
        explanation:
          'One of those same 10 trees, on its own, sequesters about 600 kg over the same 10 years — a tenth of the group’s total, as expected since the rate is a flat per-tree average.'
      },
      watchOut: [
        {
          title: 'A national-average rate, not a measurement of your specific tree',
          body: 'EPA’s 60 kg/tree/year figure is a weighted average across common U.S. urban tree species and ages. A young sapling sequesters far less than this average in its early years, and a large, mature, fast-growing species can sequester considerably more.'
        },
        {
          title: 'Trees take years to add up to much',
          body: 'A single tree’s one-year sequestration (60 kg) is small next to typical yearly footprints — the worked example’s 6,000 kg over 10 years for 10 trees is still less than half the worked example in the Carbon Footprint Calculator’s own household total of about 13,140 kg a year.'
        },
        {
          title: 'The gasoline comparison is illustrative, not interchangeable',
          body: 'Converting sequestered CO2 into "gallons not burned" is a unit comparison, not a claim that planting trees literally cancels out specific tailpipe emissions in real time — a tree absorbs CO2 gradually over years, while a tank of gas burns in days.'
        },
        {
          title: 'This counts sequestration only',
          body: 'It does not count any other benefit a tree provides (shade, stormwater absorption, property value) or costs (planting, water, maintenance) — only the EPA’s own published carbon-sequestration figure.'
        }
      ],
      references: [
        { label: 'U.S. EPA, Greenhouse Gas Equivalencies Calculator – Calculations and References', url: 'https://www.epa.gov/energy/ghg-equivalencies-calculator-calculations-and-references' },
        { label: 'McPherson, E.G. et al. (2016), "Urban tree database and allometric equations," USDA Forest Service, Pacific Southwest Research Station', url: 'https://www.fs.usda.gov/psw/' }
      ]
    },
    inputs: [
      { id: 'trees', label: 'Number of trees', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 },
      { id: 'years', label: 'Years of growth', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 }
    ],
    breakdown: {
      headline: 'totalCO2Kg',
      headlineLabel: 'CO2 sequestered (cumulative)',
      outputs: [
        { id: 'totalCO2Kg', label: 'Total CO2 sequestered', dimension: 'mass', alsoIn: ['t'] },
        { id: 'gasolineEquivalentGal', label: 'Equivalent gasoline not burned', dimension: 'volume', unit: 'gal' }
      ],
      groups: [{ title: 'Trees', inputs: ['trees', 'years'] }],
      derive: (v) => ({ perTreeTotalKg: v.years * TREE_CO2_KG_PER_YEAR }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'perTreeTotalKg', label: 'One tree' },
          { from: 'totalCO2Kg', label: 'All your trees' }
        ],
        title: 'CO2 sequestered over the period',
        highlight: 1
      }
    },
    seo: {
      title: 'Tree Benefits Calculator – CO2 Sequestered',
      description: 'Free tree benefits calculator. Estimate how much CO2 your trees absorb over time using the EPA’s published per-tree annual carbon sequestration rate.',
      faq: [
        {
          question: 'How much CO2 does one tree absorb per year?',
          answer: 'About 60 kilograms (0.060 metric tons) a year on average for an urban tree, per the EPA’s Greenhouse Gas Equivalencies Calculator, citing McPherson et al. (2016).'
        },
        {
          question: 'How much CO2 do 10 trees absorb in 10 years?',
          answer: 'About 6,000 kg (6 metric tons), using the EPA’s flat 60 kg-per-tree-per-year average rate (10 trees × 10 years × 60 kg).'
        },
        {
          question: 'How many trees would it take to offset a car’s emissions?',
          answer: 'A typical passenger vehicle’s gasoline alone, per the EPA’s own factor, far outpaces what a handful of trees sequester in a year — it would take dozens of mature trees, grown for years, to offset even one year of average driving.'
        },
        {
          question: 'Does tree species or size matter?',
          answer: 'Yes. The 60 kg/tree/year figure is a weighted U.S. average; a young sapling sequesters far less in its early years, while a large, fast-growing species can sequester more. Use it as a planning estimate, not a measurement of a specific tree.'
        },
        {
          question: 'What does the "gallons of gasoline" comparison mean?',
          answer: 'It restates the sequestered CO2 total in terms of the same mass of CO2 that burning that many gallons of gasoline would release, using the EPA’s own 8.887 kg/gallon factor — a unit comparison, not a real-time offset.'
        },
        {
          question: 'Does this include other tree benefits like shade or stormwater?',
          answer: 'No — only the EPA’s published carbon-sequestration rate. Other benefits are real but are not quantified here.'
        }
      ]
    },
    compute(values) {
      const totalCO2Kg = values.trees * values.years * TREE_CO2_KG_PER_YEAR;
      const gasolineEquivalentGal = totalCO2Kg / CAR_VS_BIKE_GASOLINE_KG_PER_GALLON;
      return { totalCO2Kg, gasolineEquivalentGal };
    }
  },
  {
    id: 'books-vs-ebooks-calculator',
    category: 'ecology',
    glyph: 'book',
    updatedAt: '2026-11-17',
    aliases: [
      'books vs ebooks calculator',
      'e-reader carbon footprint calculator',
      'kindle vs books carbon footprint',
      'print book vs ebook environmental impact',
      'how many books to break even ereader'
    ],
    related: ['carbon-footprint-calculator', 'plastic-footprint-calculator', 'water-footprint-calculator', 'meat-footprint-calculator'],
    title: 'Books vs. E-books Carbon Footprint Calculator',
    description:
      'Compare the lifecycle CO2e of reading printed books against reading the same number of books on a dedicated e-reader, using a published life-cycle assessment’s own per-book and device figures, with the break-even number of books.',
    example:
      'Reading 10 books costs about 54.48 kg of CO2e as printed books, versus about 31.88 kg on an e-reader (a 22.42 kg fixed device footprint plus 9.46 kg of reading electricity) — a saving of about 22.6 kg. The break-even point is about 5 books.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'When does an e-reader actually beat printed books?',
        paragraphs: [
          'A 2003 life-cycle assessment by Greg Kozak at the University of Michigan’s Center for Sustainable Systems compared forty scholarly books, read once by one college student over four years, against the same forty books read on a dedicated e-book reading device. It tracked every stage of each system — raw materials, manufacturing, distribution, use, and end of life — and converted the results into kilograms of CO2-equivalent (CO2e) global-warming impact.',
          'The e-reader has a real, fixed carbon cost before a single page is read: manufacturing the device, its materials, shipping it, and eventually disposing of it, which the study put at about 22.42 kg of CO2e in total. On top of that comes a smaller, per-book cost for the electricity used to download and read on its screen. A printed book, by contrast, has no large one-time device cost, but each individual copy carries its own paper, printing, and delivery footprint, plus a share of the personal transportation it took to buy it — about 5.45 kg of CO2e per book in the study’s own figures.',
          'This calculator multiplies those two published per-book rates (and the e-reader’s one-time device footprint) by how many books you enter, so you can see where the lines cross: below a certain number of books, the printed copies are better; above it, the e-reader is.'
        ]
      },
      howTo: {
        intro: 'Enter how many books you expect to read; the printed-book and e-reader totals, and which one wins, appear instantly.',
        steps: [
          { name: 'Enter the number of books', text: 'How many books you’re comparing — a single title, or your expected lifetime reading on one device.' },
          { name: 'Read the two totals', text: 'The headline compares the printed-book total against the e-reader total (device footprint plus reading electricity) for that many books.' },
          { name: 'Check the break-even point', text: 'The e-reader only comes out ahead once your book count passes about 5 — below that, its own device manufacturing outweighs what it saves.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Printed books scale directly per book; the e-reader has a fixed device cost plus a smaller per-book reading cost.',
        expression: 'printedTotal = books × 5.448 kg CO2e/book\nereaderTotal = 22.42 kg + books × 0.946 kg CO2e/book\nbreakEvenBooks = 22.42 ÷ (5.448 − 0.946)',
        terms: [
          { symbol: '5.448 kg/book', meaning: 'Kozak (2003)’s printed-book-system total (material, manufacturing, distribution, use, end-of-life), 217.92 kg CO2e ÷ 40 books.' },
          { symbol: '22.42 kg', meaning: 'The e-reader device’s own one-time footprint (material, manufacturing, distribution, end-of-life): 2.47 + 17.38 + 0.99 + 1.58 kg CO2e.' },
          { symbol: '0.946 kg/book', meaning: 'The e-reader’s per-book reading-electricity cost: the study’s Use-stage total, 37.84 kg CO2e ÷ 40 books.' }
        ],
        note: 'Figures are the study’s own published baseline scenario: one owner, no resale, a shared university data server, and four years of use. Real results vary with how long you keep the device and how many other people share a physical book or a server.'
      },
      workedExample: {
        intro: 'Reading 10 books, either as printed copies or on a single e-reader.',
        rows: [
          { label: 'Printed total (10 × 5.448)', value: '54.48 kg' },
          { label: 'E-reader device footprint (fixed)', value: '22.42 kg' },
          { label: 'E-reader reading electricity (10 × 0.946)', value: '9.46 kg' },
          { label: 'E-reader total (22.42 + 9.46)', value: '31.88 kg' },
          { label: 'Savings (54.48 − 31.88)', value: '22.60 kg' }
        ],
        result: 'The e-reader saves about 22.6 kg of CO2e over 10 books',
        explanation:
          'For just 1 book, the comparison flips: printed is 5.45 kg against the e-reader’s 23.37 kg (22.42 kg of device footprint plus 0.946 kg of reading electricity) — about 4.3 times worse, since the device’s own manufacturing footprint dominates until more books are read on it. The break-even point works out to about 5 books (22.42 ÷ (5.448 − 0.946) ≈ 4.98).'
        },
      watchOut: [
        {
          title: 'The device footprint has to be earned back first',
          body: 'An e-reader is worse than print for a small number of books, because its own manufacturing footprint (22.42 kg CO2e) outweighs the saving per book (about 4.5 kg) until roughly 5 books have been read on it. Buying an e-reader to read just one or two books is not the lower-carbon choice by this study’s own figures.'
        },
        {
          title: 'This assumes one owner, not a shared or resold book',
          body: 'The study’s printed-book figure assumes a single reader who keeps the book rather than reselling or sharing it. Its own sensitivity analysis found that two readers sharing one physical book cut the book’s footprint by about 59%, and three readers by about 70% — which would raise the break-even book count well above 5.'
        },
        {
          title: 'The e-reader figure assumes a shared library server',
          body: 'The study’s baseline splits the server and network cost of storing a downloadable e-book across 30 students accessing the same files, not one person alone. A solo reader downloading books from a dedicated personal server would see a somewhat higher e-reader figure than used here.'
        },
        {
          title: 'A 2003 device, not a modern e-reader',
          body: 'The study modeled an early 2000s dedicated e-book reader (the RCA REB 1100). Screen technology, manufacturing processes, and grid electricity mixes have all changed since, so the exact figures are illustrative of the trade-off’s shape, not a current product’s measured footprint.'
        }
      ],
      references: [
        {
          label: 'Kozak, G. (2003), "Printed Scholarly Books and E-book Reading Devices: A Comparative Life Cycle Assessment of Two Book Options," University of Michigan Center for Sustainable Systems, Report No. CSS03-04',
          url: 'https://css.umich.edu/sites/default/files/css_doc/CSS03-04.pdf'
        }
      ]
    },
    inputs: [{ id: 'books', label: 'Number of books', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 0 }],
    breakdown: {
      headline: 'ereaderTotalKg',
      headlineLabel: 'E-reader total CO2e',
      outputs: [
        { id: 'ereaderTotalKg', label: 'E-reader total', dimension: 'mass' },
        { id: 'printedTotalKg', label: 'Printed books total', dimension: 'mass' },
        { id: 'savingsKg', label: 'E-reader savings (negative = e-reader is worse)', dimension: 'mass' },
        { id: 'breakEvenBooks', label: 'Break-even number of books', format: 'number' }
      ],
      groups: [{ title: 'Reading', inputs: ['books'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'printedTotalKg', label: 'Printed books' },
          { from: 'ereaderTotalKg', label: 'E-reader' }
        ],
        title: 'Total CO2e for this many books',
        highlight: 1
      }
    },
    seo: {
      title: 'Books vs. E-books Carbon Footprint Calculator',
      description: 'Free books vs e-books calculator. Compare printed book and e-reader CO2e using a published life-cycle assessment, with the break-even number of books.',
      faq: [
        {
          question: 'How many books until an e-reader is better for the environment?',
          answer: 'About 5 books, per Kozak (2003)’s University of Michigan life-cycle assessment: the e-reader’s own 22.42 kg CO2e device footprint takes roughly 22.42 ÷ (5.448 − 0.946) ≈ 4.98 books’ worth of savings to pay back.'
        },
        {
          question: 'Is reading one book on an e-reader worse than buying the printed copy?',
          answer: 'Yes, by this study’s figures — one book comes to 5.45 kg CO2e printed versus 23.37 kg on a brand-new e-reader (almost entirely the device’s own manufacturing footprint), about 4.3 times worse.'
        },
        {
          question: 'What does a printed book’s 5.448 kg CO2e include?',
          answer: 'Paper and cover material production, printing operations, delivery to the bookstore, the student’s own trip to buy it, and the bookstore’s facility energy — the full life-cycle total from Kozak (2003)’s Table 6-6, divided by the study’s 40-book functional unit.'
        },
        {
          question: 'Does sharing a physical book change the answer?',
          answer: 'Yes. The study’s own sensitivity analysis found two readers of one physical book cut its footprint by about 59% and three readers by about 70%, which raises the e-reader’s break-even point well above 5 books for a book that gets resold or passed along.'
        },
        {
          question: 'Is this based on a current e-reader model?',
          answer: 'No — the 2003 study modeled an RCA REB 1100 e-book reader. The comparison’s overall shape (a fixed device cost paid back over many books) still applies, but a modern device’s exact numbers would differ.'
        },
        {
          question: 'Does this include the electricity to download and read each book?',
          answer: 'Yes — the e-reader’s 0.946 kg CO2e per book covers both downloading over its modem and the electricity used reading on-screen, based on the study’s own Use-stage figures.'
        }
      ]
    },
    compute(values) {
      const printedTotalKg = values.books * BOOK_PRINT_CO2_KG_PER_BOOK;
      const ereaderTotalKg = EREADER_FIXED_CO2_KG + values.books * EREADER_USE_CO2_KG_PER_BOOK;
      const savingsKg = printedTotalKg - ereaderTotalKg;
      const breakEvenBooks = EREADER_FIXED_CO2_KG / (BOOK_PRINT_CO2_KG_PER_BOOK - EREADER_USE_CO2_KG_PER_BOOK);
      return { printedTotalKg, ereaderTotalKg, savingsKg, breakEvenBooks };
    }
  },
  {
    id: 'drip-faucet-waste-calculator',
    category: 'ecology',
    glyph: 'gal',
    updatedAt: '2026-11-17',
    aliases: [
      'drip faucet waste calculator',
      'leaky faucet water waste calculator',
      'dripping tap water waste calculator',
      'how much water does a dripping faucet waste',
      'faucet leak gallons calculator'
    ],
    related: ['water-footprint-calculator', 'water-intake-calculator', 'electricity-bill-calculator', 'recycling-rate-calculator'],
    title: 'Drip Faucet Waste Calculator',
    description:
      'Estimate how much water a dripping faucet wastes per day, month, and year, from how often it drips, using the EPA WaterSense Fix a Leak Week published drip-rate figures.',
    example:
      'A faucet dripping 90 times a minute (about 1.5 drops a second) wastes about 4,500 gallons a year — nearly half of what the EPA says the average U.S. household loses to leaks altogether.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'How much water does a dripping faucet really waste?',
        paragraphs: [
          'A dripping faucet looks like a small problem, but each drop adds up over a year of constant leaking. The U.S. Environmental Protection Agency’s WaterSense program publishes a concrete benchmark for this during its annual Fix a Leak Week campaign: "a leaky faucet that drips at the rate of one drip per second can waste more than 3,000 gallons per year." Since one drip per second is 60 drips a minute, that works out to about 50 gallons wasted per year for every drip-per-minute the faucet runs at.',
          'The same EPA page independently publishes a second drip-rate figure for a different fixture: a showerhead leaking at 10 drips a minute wastes more than 500 gallons a year — which, scaled the same way, is also 50 gallons per year per drip per minute. The two independently stated EPA figures agree with each other, which is a useful check that the underlying rate (about 50 gallons wasted per year for each additional drip per minute) is a reasonably stable approximation across different kinds of leaks.',
          'This calculator takes the number of drips per minute you estimate (or count) from a leaking faucet and scales the EPA’s own benchmark rate to give a yearly, monthly, and daily waste estimate, plus how that compares to the EPA’s own figure for the average household’s total leak losses.'
        ]
      },
      howTo: {
        intro: 'Count or estimate how many times the faucet drips in a minute, and the waste estimate appears instantly.',
        steps: [
          { name: 'Count the drips', text: 'Watch the faucet for 10 seconds and count the drips, then multiply by 6 — or just estimate (one drip per second is a common, steady leak).' },
          { name: 'Enter drips per minute', text: 'Type that number in.' },
          { name: 'Read the waste estimate', text: 'The headline is the estimated gallons wasted per year, with the monthly and daily figures below it.' },
          { name: 'Check it against the EPA’s own household average', text: 'The chart compares your estimate to the EPA’s published figure for the average household’s total yearly leak losses.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Gallons wasted scale directly with how often the faucet drips, using the EPA’s own published benchmark rate.',
        expression: 'gallonsPerYear = dripsPerMinute × 50 gal/year per drip/min\ngallonsPerMonth = gallonsPerYear ÷ 12\ngallonsPerDay = gallonsPerYear ÷ 365',
        terms: [
          {
            symbol: '50 gal/year per drip/min',
            meaning: 'Derived from EPA WaterSense’s own published figure: a faucet dripping once per second (60 drips/minute) wastes more than 3,000 gallons a year, so 3,000 ÷ 60 = 50 gallons per year per drip per minute.'
          }
        ],
        note: 'EPA’s own figure is stated as "more than" 3,000 gallons a year for a one-drip-per-second leak, so this is a conservative, round-number estimate, not an exact lab measurement of your specific faucet.'
      },
      workedExample: {
        intro: 'A faucet dripping 90 times a minute (about one and a half drops every second).',
        rows: [
          { label: 'Gallons per year (90 × 50)', value: '4,500 gal' },
          { label: 'Gallons per month (4,500 ÷ 12)', value: '375.0 gal' },
          { label: 'Gallons per day (4,500 ÷ 365)', value: '12.33 gal' },
          { label: 'Share of EPA’s average household leak total (4,500 ÷ 9,300)', value: '≈48.4%' }
        ],
        result: 'About 4,500 gallons wasted a year',
        explanation:
          'At exactly one drip per second (60 drips/minute), the same formula gives 3,000 gallons a year — matching EPA’s own published figure for that rate exactly, and at the showerhead’s stated 10 drips/minute it gives 500 gallons a year, also matching EPA’s own independently published showerhead figure.'
      },
      watchOut: [
        {
          title: 'EPA’s figure is a rounded "more than" estimate',
          body: 'The published benchmark is stated as "more than 3,000 gallons per year" for a one-drip-per-second leak, so treat this calculator’s results as a reasonable planning estimate, not a precise laboratory measurement of your specific faucet or washer.'
        },
        {
          title: 'Counting drips accurately matters',
          body: 'A faster leak (a thin, steady stream rather than distinct drops) wastes water far faster than this drip-rate model can capture — if the leak has become a trickle, it is already well past what counting drips per minute can usefully estimate.'
        },
        {
          title: 'Most of a household’s leaks aren’t a single dripping faucet',
          body: 'EPA’s own figure for the average household’s total yearly leak loss (more than 9,300 gallons) usually comes from several sources at once — running toilets, worn valves, and irrigation leaks, not just a single faucet. Fixing one dripping tap addresses only part of a typical household’s leak total.'
        },
        {
          title: 'Fixing leaks is usually simple and saves on the water bill',
          body: 'EPA’s own guidance notes that fixing easily corrected household water leaks can save homeowners approximately 10 percent on their water bills — a worn washer or O-ring, the most common cause of a dripping faucet, is typically an inexpensive repair.'
        }
      ],
      references: [{ label: 'U.S. EPA WaterSense, "Fix a Leak Week"', url: 'https://www.epa.gov/watersense/fix-leak-week' }]
    },
    inputs: [{ id: 'dripsPerMinute', label: 'Drips per minute', type: 'number', placeholder: '90', defaultValue: 90, step: 1, min: 0 }],
    breakdown: {
      headline: 'gallonsPerYear',
      headlineLabel: 'Estimated water wasted (per year)',
      outputs: [
        { id: 'gallonsPerYear', label: 'Per year', dimension: 'volume', unit: 'gal' },
        { id: 'gallonsPerMonth', label: 'Per month', dimension: 'volume', unit: 'gal' },
        { id: 'gallonsPerDay', label: 'Per day', dimension: 'volume', unit: 'gal' },
        { id: 'shareOfAvgHouseholdLeaksPct', label: 'Share of the average household’s total leak loss', format: 'percent' }
      ],
      groups: [{ title: 'Faucet', inputs: ['dripsPerMinute'] }],
      derive: () => ({ avgHouseholdLeaksGal: AVG_HOUSEHOLD_LEAKS_GAL_PER_YEAR }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'gallonsPerYear', label: 'This faucet' },
          { from: 'avgHouseholdLeaksGal', label: 'Average household (all leaks)' }
        ],
        title: 'Gallons wasted per year',
        highlight: 0
      }
    },
    seo: {
      title: 'Drip Faucet Waste Calculator – Water Wasted',
      description: 'Free drip faucet calculator. Estimate how much water a dripping faucet wastes per year using the EPA WaterSense Fix a Leak Week published drip-rate figures.',
      faq: [
        {
          question: 'How much water does a dripping faucet waste per year?',
          answer:
            'About 50 gallons a year for every drip per minute, based on the EPA WaterSense figure that a faucet dripping once per second (60 drips/minute) wastes more than 3,000 gallons a year. A faucet dripping 90 times a minute wastes about 4,500 gallons a year.'
        },
        {
          question: 'How many drips per minute is "one drip per second"?',
          answer: '60 drips per minute — the EPA’s own published benchmark rate, which it says wastes more than 3,000 gallons of water a year.'
        },
        {
          question: 'How much water does a leaking showerhead waste?',
          answer: 'EPA WaterSense separately publishes that a showerhead leaking at 10 drips a minute wastes more than 500 gallons a year — the same 50-gallons-per-drip-per-minute rate as the faucet figure, confirming the two independent EPA statistics agree.'
        },
        {
          question: 'How much does the average household lose to leaks?',
          answer: 'More than 9,300 gallons a year, per EPA WaterSense — often from several sources (running toilets, worn valves, irrigation) rather than one dripping faucet alone.'
        },
        {
          question: 'Will fixing a dripping faucet save money?',
          answer: 'Likely yes — EPA notes that fixing easily corrected household leaks can save about 10 percent on a typical water bill, and a worn washer or O-ring (the usual cause of a dripping faucet) is a cheap repair.'
        },
        {
          question: 'Is this an exact measurement of my faucet’s waste?',
          answer: 'No — EPA’s own benchmark is stated as "more than" 3,000 gallons a year for a one-drip-per-second leak, so this is a reasonable planning estimate, not a precise lab reading.'
        }
      ]
    },
    compute(values) {
      const gallonsPerYear = values.dripsPerMinute * DRIP_GAL_PER_YEAR_PER_DRIP_PER_MINUTE;
      const gallonsPerMonth = gallonsPerYear / 12;
      const gallonsPerDay = gallonsPerYear / 365;
      const shareOfAvgHouseholdLeaksPct = (gallonsPerYear / AVG_HOUSEHOLD_LEAKS_GAL_PER_YEAR) * 100;
      return { gallonsPerYear, gallonsPerMonth, gallonsPerDay, shareOfAvgHouseholdLeaksPct };
    }
  },
  {
    id: 'recycling-rate-calculator',
    category: 'ecology',
    glyph: '%',
    updatedAt: '2026-11-17',
    aliases: [
      'recycling rate calculator',
      'household recycling rate calculator',
      'waste diversion rate calculator',
      'how much of my trash is recycled',
      'municipal solid waste recycling calculator'
    ],
    related: ['plastic-footprint-calculator', 'carbon-footprint-calculator', 'water-footprint-calculator', 'drip-faucet-waste-calculator'],
    title: 'Recycling Rate Calculator',
    description:
      'Estimate your household’s yearly waste and how much is diverted through recycling and composting versus landfilled or combusted, using the EPA’s published 2018 national municipal solid waste statistics.',
    example:
      'A household of 4 generates about 7,154 lb of waste a year; at the EPA’s 2018 national recycling-and-composting rate of 32.1%, about 2,296.4 lb is diverted and 4,857.6 lb is landfilled or combusted.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'How much of a household’s waste actually gets diverted?',
        paragraphs: [
          'The U.S. Environmental Protection Agency tracks municipal solid waste (MSW) nationally every year. In 2018, the most recent year with a complete published breakdown, the country generated 292.4 million tons of MSW in total — an average of 4.9 pounds per person per day. Of that total, the EPA reports that about 69 million tons (23.6%) were recycled and about 25 million tons (8.5%) were composted, for a combined "recycling and composting rate" of 32.1%. The rest was either combusted with energy recovery (nearly 35 million tons, 11.8%) or landfilled (more than 146 million tons, 50%).',
          'This calculator scales the EPA’s own national per-person generation rate by your household size to estimate your household’s total yearly waste, then applies a recycling-and-composting rate — defaulting to the national 32.1% average, or your own estimate if you know it — to split that total into a diverted share and a landfilled-or-combusted share.',
          'It is a genuinely different question from how much plastic specifically you throw away: this covers the whole waste stream — paper, food scraps, yard trimmings, metal, glass, and plastic together — at whatever combined diversion rate you enter, rather than one material’s own recycling rate.'
        ]
      },
      howTo: {
        intro: 'Set your household size and, if you know it, your own recycling-and-composting rate; the yearly totals fill in instantly.',
        steps: [
          { name: 'Enter household size', text: 'The number of people the estimate should cover.' },
          { name: 'Set a recycling-and-composting rate', text: 'Leave it at the EPA’s 2018 national average, 32.1%, or enter your own municipality’s published rate if you know it.' },
          { name: 'Read the total', text: 'The headline is your household’s estimated yearly waste, in pounds.' },
          { name: 'Check the diverted vs. not-diverted split', text: 'The chart shows how much is likely recycled or composted versus landfilled or combusted, based on the rate you set.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A household’s total waste is the EPA’s national per-person rate times household size; the diversion split follows from the recycling-and-composting rate.',
        expression: 'annual (lb/year) = 4.9 lb/person/day × 365 × household size\ndiverted = annual × rate\nnotDiverted = annual − diverted',
        terms: [
          { symbol: '4.9 lb/person/day', meaning: 'The EPA’s published 2018 national total municipal solid waste generation rate.' },
          { symbol: 'rate', meaning: 'The share recycled plus composted; the EPA’s own 2018 national average is 32.1%, adjustable to your own municipality’s rate.' }
        ],
        note: 'A national-average estimate, not a measurement of your own household’s actual waste or your specific municipality’s real diversion rate, which can be well above or below the national figure.'
      },
      workedExample: {
        intro: 'A household of 4 people, at the EPA’s 2018 national averages.',
        rows: [
          { label: 'Per person per year (4.9 × 365)', value: '1,788.5 lb' },
          { label: 'Household of 4 per year (× 4)', value: '7,154.0 lb' },
          { label: 'Diverted (7,154 × 32.1%)', value: '2,296.4 lb' },
          { label: 'Not diverted (7,154 − 2,296.4)', value: '4,857.6 lb' }
        ],
        result: 'About 7,154 lb of waste a year, 2,296.4 lb of it diverted',
        explanation:
          'Raising the rate to a more ambitious 50% (common for well-run curbside programs) would divert 3,577.0 lb instead — 1,280.6 lb more than at the national 32.1% average, with the same 7,154 lb household total.'
      },
      watchOut: [
        {
          title: 'This is total waste, not just recyclables',
          body: 'The 4.9 lb/person/day figure is the EPA’s total municipal solid waste rate — food scraps, yard trimmings, paper, metal, glass, and plastic combined — not a figure for recyclable material alone.'
        },
        {
          title: '32.1% is a national blend of two different processes',
          body: 'The EPA’s combined rate covers recycling (23.6% in 2018) and composting (8.5%) together. A municipality without curbside composting will usually divert less than 32.1% even with strong recycling participation.'
        },
        {
          title: 'Local rates vary widely from the national average',
          body: 'Some cities and states report diversion rates well above 32.1%, often due to mandatory composting or strong curbside recycling programs; others fall well below it. Use your own municipality’s published figure if you know it.'
        },
        {
          title: 'Based on the most recent complete EPA dataset (2018)',
          body: 'The EPA’s national MSW statistics are published with a lag; 2018 is the most recent year with a complete, detailed breakdown available at the time this calculator was built.'
        }
      ],
      references: [
        { label: 'U.S. EPA, "National Overview: Facts and Figures on Materials, Waste and Recycling"', url: 'https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/national-overview-facts-and-figures-materials' }
      ]
    },
    inputs: [
      { id: 'householdSize', label: 'Household size', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 1 },
      { id: 'recyclingRatePct', label: 'Recycling & composting rate', type: 'percent', placeholder: '32.1', defaultValue: RECYCLING_NATIONAL_RATE_PCT_2018, step: 0.1, min: 0 }
    ],
    breakdown: {
      headline: 'annualLb',
      headlineLabel: 'Household’s waste (per year)',
      outputs: [
        { id: 'annualLb', label: 'Household total (per year)', dimension: 'mass', unit: 'lb', alsoIn: ['kg'] },
        { id: 'divertedLb', label: 'Recycled or composted', dimension: 'mass', unit: 'lb' },
        { id: 'notDivertedLb', label: 'Landfilled or combusted', dimension: 'mass', unit: 'lb' }
      ],
      groups: [{ title: 'Household', inputs: ['householdSize', 'recyclingRatePct'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'divertedLb', label: 'Recycled/composted' },
          { from: 'notDivertedLb', label: 'Landfilled/combusted' }
        ],
        center: 'annualLb',
        centerSub: 'lb/year'
      }
    },
    seo: {
      title: 'Recycling Rate Calculator – Household Waste Diverted',
      description: 'Free recycling rate calculator. Estimate your household’s yearly waste and how much is recycled or composted using EPA’s 2018 national MSW statistics.',
      faq: [
        {
          question: 'What is the US national recycling rate?',
          answer: 'The EPA’s combined recycling-and-composting rate for 2018 was 32.1% — 23.6% recycled and 8.5% composted — of the 292.4 million tons of municipal solid waste generated that year.'
        },
        {
          question: 'How much waste does a household of 4 generate per year?',
          answer: 'About 7,154 lb a year at the EPA’s 2018 national average of 4.9 lb per person per day (4.9 × 365 × 4).'
        },
        {
          question: 'How much of my waste actually gets recycled or composted?',
          answer: 'At the national 32.1% average, a household of 4 generating 7,154 lb a year would see about 2,296.4 lb diverted and 4,857.6 lb landfilled or combusted — adjust the rate to your own municipality’s published figure for a more accurate estimate.'
        },
        {
          question: 'How much difference does a higher recycling rate make?',
          answer: 'Raising the rate from the 32.1% national average to 50% for the same household of 4 would divert 3,577.0 lb instead of 2,296.4 lb — 1,280.6 lb more diverted from landfills or combustion each year.'
        },
        {
          question: 'Is this just about plastic?',
          answer: 'No — this covers the whole municipal solid waste stream (paper, food scraps, yard trimmings, metal, glass, and plastic together). Use the Plastic Footprint Calculator for a plastic-specific estimate.'
        },
        {
          question: 'Why 2018 data specifically?',
          answer: 'It is the most recent year with the EPA’s full, detailed municipal solid waste breakdown available at the time this calculator was built.'
        }
      ]
    },
    compute(values) {
      const annualLb = RECYCLING_TOTAL_MSW_LB_PER_PERSON_DAY_2018 * values.householdSize * 365;
      const divertedLb = annualLb * (values.recyclingRatePct / 100);
      const notDivertedLb = annualLb - divertedLb;
      return { annualLb, divertedLb, notDivertedLb };
    }
  }
];
