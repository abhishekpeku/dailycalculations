// Solar & Home Energy category (step 62, Wave 5): homeowner-facing solar sizing, savings, payback,
// financing and net-metering tools. See mdFiles/steps/62-wave-5-solar-home-energy.md. Reserved by
// step 49 (ecology.ts) — this category, not ecology, covers solar/home-energy topics.
import type { CalculatorConfig } from './types.ts';
import { loanPayment, loanPrincipal, loanMonths } from './finance.ts';

export const solarCalculators: CalculatorConfig[] = [
  {
    id: 'solar-panel-system-size-calculator',
    category: 'solar',
    glyph: 'kW',
    updatedAt: '2026-11-18',
    aliases: ['how many solar panels do i need calculator', 'solar system size calculator', 'solar panel sizing calculator', 'kw solar system calculator', 'how big a solar system do i need'],
    related: ['solar-savings-calculator', 'solar-payback-period-calculator', 'electricity-bill-calculator', 'net-metering-savings-calculator'],
    title: 'Solar Panel System Size Calculator',
    description: 'Estimate the solar system size (kW) and panel count a home needs from its annual electricity usage and a location-based production ratio, rounded up to a whole number of panels.',
    example: 'A home using 10,791 kWh a year (the U.S. average) at a 1.3 production ratio needs about 19 panels at 440 W each — a 8.36 kW system producing about 10,868 kWh a year, roughly 100.7% of that usage.',
    breakdown: {
      headline: 'systemSizeKw',
      headlineLabel: 'Recommended system size (kW)',
      outputs: [
        { id: 'systemSizeKw', label: 'Recommended system size (kW)', format: 'number' },
        { id: 'panelCount', label: 'Panel count (rounded up to a whole panel)', format: 'integer' },
        { id: 'estimatedAnnualProductionKwh', label: 'Estimated annual production', format: 'number', dimension: 'energy', unit: 'kWh' },
        { id: 'percentOfUsageCovered', label: 'Share of annual usage covered', format: 'percent' }
      ],
      groups: [
        { title: 'Your usage and location', inputs: ['annualUsageKwh', 'productionRatio'] },
        { title: 'Panel choice', inputs: ['panelWattage'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'annualUsageKwh', label: 'Annual usage' },
          { from: 'estimatedAnnualProductionKwh', label: 'Estimated production' }
        ],
        title: 'Annual usage vs. estimated production'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'How big a solar system do you need?',
        paragraphs: [
          'A grid-tied home solar system is sized to roughly match what the home uses over a year, not what it uses on any one day — some months it will produce more than the home needs and export the rest, other months less. The industry shorthand for how much a system actually produces is the "production ratio": the kilowatt-hours it generates in a year for every watt of panel capacity (DC) installed. EnergySage, a solar-quote marketplace that publishes aggregated installation data, puts the typical U.S. range at 1.1 to 1.6 kWh per installed watt per year — a sunny, south-facing roof in the Southwest sits near the top of that range, while a cloudier climate or a shaded, poorly angled roof sits near the bottom.',
          'Dividing annual usage by the production ratio gives the system size in watts; dividing that by a panel\'s wattage gives the panel count, rounded up since you can only buy whole panels. Panels sold today are almost all rated 400 W or higher — EnergySage reports the most common size quoted on its marketplace in the first half of 2026 was 430–440 W. For a location-specific production ratio rather than this page\'s illustrative default, the U.S. Department of Energy points homeowners to PVWatts, a free NREL tool that "estimates the energy production and cost of energy of grid-connected PV energy systems for any address in the world."',
          'The usage side of the equation matters just as much as the production side. The U.S. Energy Information Administration puts average household electricity use at 10,791 kWh a year, which is the default here, but actual usage swings widely with home size, climate and electrified appliances — an electric vehicle, a heat pump or a pool pump can each add thousands of kWh a year. Pulling usage from a full year of utility bills, not one month, gives a far more reliable number to size against than any national average.'
        ]
      },
      howTo: {
        intro: 'Enter your annual usage and a production ratio for your location; the panel count and system size follow.',
        steps: [
          { name: 'Enter your annual electricity usage', text: 'Use the kWh total from twelve months of utility bills if you have them, or the roughly 10,791 kWh a typical U.S. household uses in a year.' },
          { name: 'Enter a production ratio for your location', text: 'Use 1.1–1.6, leaning toward the low end for cloudier climates or shaded/north-facing roofs and the high end for sunny, south-facing ones. PVWatts (free, from NREL) gives an address-specific figure.' },
          { name: 'Enter the panel wattage you are comparing', text: 'Use the wattage on the spec sheet or quote you are evaluating; 400–440 W covers most panels sold today.' },
          { name: 'Read the result', text: 'The headline is the recommended system size; the rows below show the panel count, the estimated annual production and how much of your usage it covers.' },
          { name: 'Treat it as a planning estimate', text: 'An installer\'s own site survey — accounting for your actual roof shape, shading and local code — is the number to build a quote around.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Usage divided by the production ratio gives the required capacity in watts; panels are then rounded up to a whole number.',
        expression: 'raw capacity (W) = annual usage (kWh) ÷ production ratio\npanel count = ceil(raw capacity ÷ panel wattage)\nsystem size (W) = panel count × panel wattage\nestimated production (kWh/yr) = system size (W) × production ratio',
        terms: [
          { symbol: 'annual usage', meaning: 'Electricity used over a year, in kWh.' },
          { symbol: 'production ratio', meaning: 'kWh produced per year for every watt of DC panel capacity installed — typically 1.1 to 1.6 in the U.S., depending on climate, shading and roof angle.' },
          { symbol: 'panel wattage', meaning: 'A single panel\'s rated DC output in watts; 400–440 W is typical today.' },
          { symbol: 'ceil(x)', meaning: 'Round up to the next whole number — you install whole panels, not fractions of one.' }
        ],
        note: 'This is a nameplate (DC) sizing estimate, not a substitute for a site survey. Real-world losses (inverter conversion, wiring, soiling, shading) are what the production ratio already reflects in aggregate, not a separate deduction this calculator applies on top.'
      },
      workedExample: {
        intro: 'A home uses 10,791 kWh a year (the U.S. average), its location has a 1.3 production ratio, and the panels being quoted are 440 W each.',
        rows: [
          { label: 'Raw capacity (10,791 ÷ 1.3)', value: '8,300.8 W' },
          { label: 'Panel count (ceil(8,300.8 ÷ 440))', value: '19 panels' },
          { label: 'System size (19 × 440)', value: '8,360 W = 8.36 kW' },
          { label: 'Estimated production (8,360 × 1.3)', value: '10,868 kWh/yr' },
          { label: 'Share of usage covered (10,868 ÷ 10,791)', value: '100.7%' }
        ],
        result: '19 panels · 8.36 kW system · about 10,868 kWh a year',
        explanation: 'Rounding 18.86 panels up to 19 adds a little extra capacity, which is why the estimated production comes out at 100.7% of usage rather than exactly 100% — rounding up for a whole panel count almost always leaves a system slightly oversized rather than undersized.'
      },
      watchOut: [
        { title: 'The production ratio is doing most of the work', body: 'Moving the same 10,791 kWh of usage through EnergySage\'s own published range — 1.5 for a sunny California-type location versus 1.1 for a cloudier Massachusetts-type one — swings the result from 17 panels (about 7.5 kW) to 23 panels (about 10.1 kW). Get this number right for your own roof before trusting the panel count.' },
        { title: 'This is DC nameplate capacity', body: 'The system size here is the panels\' rated DC output. The AC output your inverter actually delivers to the house, and the energy that actually reaches your meter, are both a little lower — exactly how much lower is already folded into the production ratio\'s real-world range, not something to subtract again separately.' },
        { title: 'Rounding up means most systems slightly overshoot', body: 'Because panels only come in whole units, the calculated panel count is rounded up, which is why the worked example lands at 100.7% of usage rather than 100% exactly — expect your own result to land a little above, not below, your usage target.' },
        { title: 'A bigger electric load needs a bigger system', body: 'Usage is quoted from EIA\'s national average. A home adding an EV, a heat pump or a pool can need thousands more kWh a year than that average — size against your own trailing twelve months of bills, not a general figure.' }
      ],
      references: [
        { label: 'EnergySage, "How Many Solar Panels Do I Need?" (production ratio range, 2026 panel wattage data)', url: 'https://www.energysage.com/solar/how-many-solar-panels-do-i-need/' },
        { label: 'U.S. Department of Energy, Homeowner\'s Guide to Going Solar (PVWatts)', url: 'https://www.energy.gov/eere/solar/homeowners-guide-going-solar' },
        { label: 'U.S. Energy Information Administration, FAQ — How much electricity does an American home use?', url: 'https://www.eia.gov/tools/faqs/faq.php?id=97&t=3' }
      ]
    },
    inputs: [
      { id: 'annualUsageKwh', label: 'Annual electricity usage', type: 'number', placeholder: '10791', defaultValue: 10791, step: 100, min: 0, dimension: 'energy', unit: 'kWh' },
      { id: 'productionRatio', label: 'Annual output per kW installed (production ratio)', type: 'number', placeholder: '1.3', defaultValue: 1.3, step: 0.1, min: 0 },
      { id: 'panelWattage', label: 'Panel wattage (W)', type: 'number', placeholder: '440', defaultValue: 440, step: 5, min: 1 }
    ],
    seo: {
      title: 'Solar Panel System Size Calculator – kW & Panel Count',
      description: 'Estimate the solar system size in kW and the number of panels a home needs from annual usage and a production ratio, rounded up to a whole panel count.',
      faq: [
        { question: 'How many solar panels does an average U.S. home need?', answer: 'At the EIA\'s average annual usage (10,791 kWh) and a mid-range 1.3 production ratio, about 19 panels at 440 W each — an 8.36 kW system producing roughly 10,868 kWh a year. Your own panel count depends heavily on your usage and your location\'s production ratio.' },
        { question: 'What is a solar "production ratio" and why does it vary so much?', answer: 'It is the kWh a system produces per year for every watt of DC capacity installed. EnergySage reports a typical U.S. range of 1.1 to 1.6, driven mainly by how much sun a location and roof actually get — a sunnier, well-angled roof sits near the top of that range, a cloudier or shaded one near the bottom.' },
        { question: 'How many kWh does the average U.S. home use in a year?', answer: 'About 10,791 kWh, per the U.S. Energy Information Administration — this calculator\'s default. Actual usage varies widely by home size, climate and appliances, so a full year of your own utility bills gives a far more reliable number.' },
        { question: 'What wattage are solar panels today?', answer: 'EnergySage reports that almost every panel sold in 2026 is rated 400 W or higher, with 430–440 W the most common size quoted on its marketplace in the first half of the year.' },
        { question: 'Why does this calculator round the panel count up instead of down?', answer: 'Because you can only install whole panels. Rounding up means the resulting system is usually slightly larger than the bare-minimum capacity, which is why the worked example above covers about 100.7% of usage rather than exactly 100%.' },
        { question: 'Does this tell me exactly how many panels to buy?', answer: 'No — it is a planning estimate. A site-specific tool like NREL\'s free PVWatts calculator, or an installer\'s own survey of your roof\'s shape, shading and orientation, is the number to build an actual quote around.' }
      ]
    },
    compute(values) {
      const rawWatts = values.productionRatio > 0 ? values.annualUsageKwh / values.productionRatio : NaN;
      const panelCount = Number.isFinite(rawWatts) && values.panelWattage > 0 ? Math.ceil(rawWatts / values.panelWattage) : NaN;
      const systemSizeKw = Number.isFinite(panelCount) ? (panelCount * values.panelWattage) / 1000 : NaN;
      const estimatedAnnualProductionKwh = Number.isFinite(systemSizeKw) ? systemSizeKw * 1000 * values.productionRatio : NaN;
      const percentOfUsageCovered = values.annualUsageKwh > 0 && Number.isFinite(estimatedAnnualProductionKwh) ? (estimatedAnnualProductionKwh / values.annualUsageKwh) * 100 : NaN;
      return { systemSizeKw, panelCount, estimatedAnnualProductionKwh, percentOfUsageCovered };
    }
  }
];
