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
  },
  {
    id: 'solar-savings-calculator',
    category: 'solar',
    glyph: '$/yr',
    updatedAt: '2026-11-18',
    aliases: ['how much will solar save me calculator', 'solar panel savings calculator', 'solar energy savings calculator', 'annual solar savings estimator', 'solar savings over time calculator'],
    related: ['solar-panel-system-size-calculator', 'solar-payback-period-calculator', 'net-metering-savings-calculator', 'electricity-bill-calculator'],
    title: 'Solar Savings Calculator',
    description: 'Estimate a solar system\'s first-year and lifetime electricity savings from its size, a production ratio and your electricity rate, accounting for gradual panel output degradation.',
    example: 'An 8.36 kW system at a 1.3 production ratio and $0.1831/kWh saves about $1,989.93 the first year and about $46,325.86 over 25 years once panel degradation is factored in.',
    breakdown: {
      headline: 'annualSavings',
      headlineLabel: 'Estimated savings this year',
      outputs: [
        { id: 'annualSavings', label: 'Estimated savings this year', format: 'currency' },
        { id: 'annualProductionKwh', label: 'Estimated annual production', format: 'number', dimension: 'energy', unit: 'kWh' },
        { id: 'lifetimeSavings', label: 'Estimated lifetime savings', format: 'currency' },
        { id: 'finalYearSavings', label: 'Estimated savings in the final year', format: 'currency' },
        { id: 'averageAnnualSavings', label: 'Average savings per year over the lifetime', format: 'currency' }
      ],
      groups: [
        { title: 'Your system', inputs: ['systemSizeKw', 'productionRatio'] },
        { title: 'Rate and projection', inputs: ['electricityRate', 'lifetimeYears'] },
        { title: 'Panel output degradation', inputs: ['degradationRatePercent'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'annualSavings', label: 'Year 1' },
          { from: 'finalYearSavings', label: 'Final year' }
        ],
        title: 'Year 1 vs. final-year savings (panel degradation)'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What "solar savings" actually means',
        paragraphs: [
          'Solar savings is the electricity you no longer buy from your utility because your own panels made it instead. This calculator multiplies estimated annual production (system size × a production ratio, the same figure used by the system-size calculator above) by your electricity rate, which assumes every kWh you generate offsets a kWh you would otherwise have bought at full retail price. That assumption holds well for a system sized to your own usage with a generous net-metering arrangement; it holds less well once your system exports more than you use in a given month and your utility credits that excess at a lower rate — see the net-metering savings calculator for that specific case.',
          'Panels don\'t produce quite as much every year. EnergySage reports that the vast majority of panel warranties guarantee output won\'t fall by more than 0.5–0.7% a year after an initial first-year dip, backed by a 25-year power-performance warranty on nine out of ten panels sold. That slow decline is small year to year but adds up: this calculator applies it to the "final year" and "lifetime savings" figures so they aren\'t simply year-one savings multiplied by the number of years.',
          'The electricity rate itself is held flat across the whole projection, which is a simplification in the other direction — residential electricity rates have historically moved over time rather than staying constant, and the U.S. Energy Information Administration\'s own state-by-state data shows rates ranging from the low teens to the high forties of cents per kWh depending on where you live. A higher future rate would make real savings better than this estimate; a lower one, worse. Re-run the numbers with a different rate to see how sensitive the result is.'
        ]
      },
      howTo: {
        intro: 'Enter your system size and production ratio, your electricity rate, and how many years to project; degradation is already factored in.',
        steps: [
          { name: 'Enter your system size and production ratio', text: 'Use the kW figure and ratio from the system-size calculator above, or your own installer\'s quote.' },
          { name: 'Enter your electricity rate', text: 'Use the per-kWh rate from a recent utility bill.' },
          { name: 'Set the years to project', text: 'The default, 25 years, matches the power-performance warranty most panels carry.' },
          { name: 'Adjust the degradation rate, if you want', text: 'The default, 0.6% a year, is the midpoint of the 0.5–0.7% range most warranties guarantee after the first year.' },
          { name: 'Read the result', text: 'The headline is this year\'s estimated savings; the rows below show estimated annual production, lifetime savings, final-year savings and the average per year across the whole projection.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Annual savings is production times rate; lifetime savings sums that figure across every year while shrinking it slightly for degradation.',
        expression:
          'production (kWh/yr) = system size (kW) × 1,000 × production ratio\nsavings, year 1 = production × rate\nlifetime savings = savings₁ × (1 − (1 − d)ᴺ) ÷ d        (d > 0)\nlifetime savings = savings₁ × N                            (d = 0)\nsavings, final year = savings₁ × (1 − d)ᴺ⁻¹',
        terms: [
          { symbol: 'production ratio', meaning: 'kWh produced per year for every kW installed — the same figure the system-size calculator uses.' },
          { symbol: 'rate', meaning: 'Your electricity price per kWh, held flat across the projection.' },
          { symbol: 'd', meaning: 'Annual output degradation as a decimal; 0.6% is entered as 0.006.' },
          { symbol: 'N', meaning: 'Years projected — the sum above is the geometric series for N years of a quantity shrinking by factor (1 − d) each year.' }
        ],
        note: 'Assumes production offsets usage at a flat, full retail rate — a simplification. It does not model rising or falling future rates, and it does not model a utility crediting exported excess at less than retail (see net-metering-savings-calculator).'
      },
      workedExample: {
        intro: 'An 8.36 kW system (from the system-size calculator\'s worked example) with a 1.3 production ratio, a $0.1831/kWh rate, 0.6% annual degradation, projected over 25 years.',
        rows: [
          { label: 'Annual production (8.36 × 1,000 × 1.3)', value: '10,868 kWh' },
          { label: 'Year 1 savings (10,868 × $0.1831)', value: '$1,989.93' },
          { label: 'Final-year (year 25) savings', value: '$1,722.31' },
          { label: 'Lifetime savings (25 years, with degradation)', value: '$46,325.86' },
          { label: 'Average savings per year', value: '$1,853.03' }
        ],
        result: '≈ $1,989.93 this year · ≈ $46,325.86 over 25 years',
        explanation: 'By year 25, estimated savings have dropped 13.4% from the first year\'s $1,989.93 to $1,722.31, purely from the compounding 0.6%-a-year output decline. Multiplying year-one savings straight through 25 years with no degradation at all would show $49,748.27 — about 6.9% higher than the $46,325.86 this calculator gives, which is the cost of ignoring that slow decline.'
      },
      watchOut: [
        { title: 'Assumes full-retail-rate offset', body: 'This treats every kWh produced as worth your full electricity rate. If your utility\'s net-metering program credits exported excess at less than retail, your real savings on that exported portion will be lower — use the net-metering savings calculator for that case.' },
        { title: 'Degradation compounds slowly but adds up', body: 'A 0.6%-a-year decline looks negligible in any single year, but by year 25 it has reduced output — and savings — by about 13.4% relative to year one in the worked example above.' },
        { title: 'The electricity rate is held flat', body: 'Real residential electricity rates move over time and vary enormously by location — EIA\'s own data shows state averages spanning roughly the low teens to the high forties of cents per kWh. This estimate does not project future rate changes either way.' },
        { title: 'The production ratio still drives the headline number', body: 'As with the system-size calculator, the production ratio you enter (1.1 to 1.6 is EnergySage\'s typical U.S. range) has a bigger effect on the result than almost anything else here — get it right for your own location before trusting the savings figure.' }
      ],
      references: [
        { label: 'EnergySage, "Solar Panel Warranties: What You Need to Know" (25-year warranty, 0.5–0.7%/yr degradation)', url: 'https://www.energysage.com/solar/solar-panel-warranties/' },
        { label: 'EnergySage, "How Many Solar Panels Do I Need?" (production ratio range)', url: 'https://www.energysage.com/solar/how-many-solar-panels-do-i-need/' },
        { label: 'U.S. Department of Energy, Homeowner\'s Guide to Going Solar (net metering)', url: 'https://www.energy.gov/eere/solar/homeowners-guide-going-solar' },
        { label: 'U.S. Energy Information Administration, Electric Power Monthly, Table 5.6.A (residential rates by state)', url: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=table_5_06_a' }
      ]
    },
    inputs: [
      { id: 'systemSizeKw', label: 'System size (kW)', type: 'number', placeholder: '8.36', defaultValue: 8.36, step: 0.1, min: 0 },
      { id: 'productionRatio', label: 'Annual output per kW installed (production ratio)', type: 'number', placeholder: '1.3', defaultValue: 1.3, step: 0.1, min: 0 },
      { id: 'electricityRate', label: 'Electricity rate', type: 'currency', placeholder: '0.1831', defaultValue: 0.1831, step: 0.01, min: 0 },
      { id: 'lifetimeYears', label: 'Years to project (system lifetime)', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 1 },
      { id: 'degradationRatePercent', label: 'Annual panel output degradation', type: 'percent', placeholder: '0.6', defaultValue: 0.6, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Solar Savings Calculator – Annual & Lifetime Savings',
      description: 'Estimate a solar system\'s first-year and lifetime savings from its size, production ratio and rate, factoring in gradual panel output degradation.',
      faq: [
        { question: 'How much could solar save me per year?', answer: 'It depends on your system size, your location\'s production ratio and your electricity rate. An 8.36 kW system at a 1.3 production ratio and $0.1831/kWh saves about $1,989.93 in its first year, in this calculator\'s worked example.' },
        { question: 'Does this assume net metering?', answer: 'It assumes every kWh you produce offsets a kWh at your full electricity rate, which is a simplification of how net metering actually works. If your utility credits exported excess at less than full retail, use the net-metering savings calculator for that part of your production.' },
        { question: 'How much do solar panels lose output over time?', answer: 'EnergySage reports that most manufacturer warranties guarantee output won\'t fall more than 0.5–0.7% a year after the first year. At the 0.6% midpoint used here, output — and savings — are about 13.4% lower in year 25 than in year one.' },
        { question: 'Why does this project over 25 years?', answer: 'Because EnergySage reports that nine out of ten solar panels sold carry a 25-year power-performance warranty, making it the standard horizon for estimating a system\'s lifetime value.' },
        { question: 'Does this account for electricity rates rising in the future?', answer: 'No — the rate you enter is held flat for the whole projection. Real rates vary a lot by location and move over time, so try a higher or lower rate to see how much that assumption matters to your own estimate.' },
        { question: 'Why is lifetime savings less than annual savings times the number of years?', answer: 'Because panel output declines slightly every year. In the worked example, annual savings times 25 years with no decline at all would be $49,748.27 — about 6.9% more than the $46,325.86 this calculator gives once the 0.6%-a-year degradation is included.' }
      ]
    },
    compute(values) {
      const annualProductionKwh = values.systemSizeKw * 1000 * values.productionRatio;
      const annualSavings = annualProductionKwh * values.electricityRate;
      const d = values.degradationRatePercent / 100;
      const n = values.lifetimeYears;
      const lifetimeSavings = d === 0 ? annualSavings * n : (annualSavings * (1 - (1 - d) ** n)) / d;
      const finalYearSavings = annualSavings * (1 - d) ** (n - 1);
      const averageAnnualSavings = n > 0 ? lifetimeSavings / n : NaN;
      return { annualSavings, annualProductionKwh, lifetimeSavings, finalYearSavings, averageAnnualSavings };
    }
  },
  {
    id: 'solar-payback-period-calculator',
    category: 'solar',
    glyph: 'yr',
    updatedAt: '2026-11-18',
    aliases: ['solar payback calculator', 'solar break even calculator', 'how long to pay off solar panels', 'solar payback period estimator', 'solar break-even point calculator'],
    related: ['solar-savings-calculator', 'solar-loan-payment-calculator', 'solar-panel-system-size-calculator', 'loan-calculator'],
    title: 'Solar Payback Period Calculator',
    description: 'Find how many years it takes a solar system to pay for itself: system cost minus any incentive, divided by estimated annual savings. Solve for cost, incentive, savings or payback period.',
    example: 'A $31,135 system with a $1,000 incentive and $2,856.36 in estimated annual savings pays for itself in about 10.55 years; with no incentive at all, about 10.90 years.',
    solver: {
      defaultTarget: 'paybackPeriod',
      variables: [
        { id: 'systemCost', label: 'System cost (before any incentive)', symbol: 'C', dimension: 'currency', defaultValue: 31135, defaultUnit: 'currency' },
        { id: 'incentiveAmount', label: 'Incentive, rebate or credit applied', symbol: 'I', dimension: 'currency', defaultValue: 1000, defaultUnit: 'currency', fixed: true },
        { id: 'annualSavings', label: 'Estimated annual savings', symbol: 'S', dimension: 'currency', defaultValue: 2856.36, defaultUnit: 'currency' },
        { id: 'paybackPeriod', label: 'Payback period', symbol: 'P', dimension: 'term', defaultValue: 10.55, defaultUnit: 'yr' }
      ],
      solve: {
        paybackPeriod: ({ systemCost, incentiveAmount, annualSavings }) => (annualSavings > 0 ? ((systemCost - incentiveAmount) / annualSavings) * 12 : NaN),
        systemCost: ({ incentiveAmount, annualSavings, paybackPeriod }) => incentiveAmount + annualSavings * (paybackPeriod / 12),
        annualSavings: ({ systemCost, incentiveAmount, paybackPeriod }) => (paybackPeriod > 0 ? (systemCost - incentiveAmount) / (paybackPeriod / 12) : NaN)
      },
      outputs: [{ id: 'netSystemCost', label: 'Net system cost after incentive', dimension: 'currency', compute: (si) => si.systemCost - si.incentiveAmount }]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is a solar payback period?',
        paragraphs: [
          'A payback period is the point where cumulative savings catch up to what the system cost — the break-even point, not the total value the system delivers. That makes it a different question from the one the solar savings calculator above answers: savings tells you how much a system is worth over its life, while payback tells you how long before it has simply paid for itself. A system with a shorter payback isn\'t necessarily the better investment overall; it depends on how much it keeps saving after that point.',
          'System cost varies a great deal by size, equipment and location. EnergySage\'s 2026 marketplace data puts the average cost at about $2.60 per watt before any incentive, with a typical ~12 kW home system running about $31,135 — the default here. Treat that as a rough starting point, not your own quote: your installer\'s actual bid, after any incentive, is the number that matters.',
          'On incentives specifically: the federal residential solar tax credit does not apply to systems installed in 2026. The IRS states plainly that the credit "is not available for any property placed in service after December 31, 2025." Whatever incentive you enter here needs to be something you\'ve actually confirmed — a state rebate, a utility program or a local incentive still in effect — rather than an assumed federal percentage.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the four fields; the fourth, marked auto, is calculated.',
        steps: [
          { name: 'Enter your system cost', text: 'Use an installer\'s quote, or the roughly $2.60/watt, ~$31,135-for-12kW averages EnergySage reports for 2026 as a rough starting point.' },
          { name: 'Enter any incentive you\'ve actually confirmed', text: 'The federal 30% credit ended for systems placed in service after 2025 — check for a current state, utility or local program instead of assuming one applies.' },
          { name: 'Enter your estimated annual savings', text: 'Use the figure from the solar savings calculator above, or your installer\'s own production-and-savings estimate.' },
          { name: 'Read the payback period', text: 'The result is in years. To find how much savings a given payback period requires, type into the payback field and let savings become the calculated one instead.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Payback period is simply net cost divided by the annual savings rate.',
        expression: 'net cost = system cost − incentive\npayback period (years) = net cost ÷ annual savings',
        terms: [
          { symbol: 'system cost', meaning: 'The full installed cost, before any incentive is applied.' },
          { symbol: 'incentive', meaning: 'Any rebate, credit or program payment you have actually confirmed applies to your own installation — not assumed.' },
          { symbol: 'annual savings', meaning: 'Estimated savings in the first year, held flat for this simple break-even calculation.' }
        ],
        note: 'This is a simple break-even estimate. It does not account for financing costs if the system is loan-financed (see the solar loan payment calculator), for electricity-rate changes, or for the slow decline in panel output over time (see the solar savings calculator for the lifetime, degradation-aware view).'
      },
      workedExample: {
        intro: 'A $31,135 system (EnergySage\'s 2026 average for a ~12 kW install) with a $1,000 incentive, and $2,856.36 in estimated annual savings (a 12 kW system at a 1.3 production ratio and $0.1831/kWh).',
        rows: [
          { label: 'Net system cost (31,135 − 1,000)', value: '$30,135' },
          { label: 'Payback period (30,135 ÷ 2,856.36)', value: '10.55 years' },
          { label: 'Payback period with no incentive at all (31,135 ÷ 2,856.36)', value: '10.90 years' }
        ],
        result: '≈ 10.55 years to break even (10.90 years with no incentive)',
        explanation: 'The $1,000 incentive shortens the payback by about 0.35 years — a little over four months — compared with paying the full $31,135 out of pocket. A larger incentive, a cheaper system, or higher annual savings would each shorten it further; the formula treats all three the same way.'
      },
      watchOut: [
        { title: 'The federal tax credit no longer applies to new systems', body: 'The IRS states the residential clean energy credit "is not available for any property placed in service after December 31, 2025." Don\'t enter a 30% federal credit as if it still applies in 2026 — check for a current state, utility or local incentive instead.' },
        { title: 'Ignores financing costs', body: 'This assumes you pay the net cost up front. If you finance the system with a loan, the loan\'s interest changes your actual cash flow — use the solar loan payment calculator for that.' },
        { title: 'A simple break-even, not a full return', body: 'Payback tells you when the system has paid for itself, not how much it\'s worth afterward. A system that keeps producing for 15 more years after a 10-year payback has a very different lifetime value than one that pays back in 5 years and fails soon after — see the solar savings calculator for the lifetime estimate.' },
        { title: 'System cost varies a lot', body: 'EnergySage\'s ~$2.60/watt, ~$31,135-for-12kW figures are 2026 marketplace averages, not a quote. Your own roof, equipment choice, local labor costs and permitting fees can move the real number well above or below that.' }
      ],
      references: [
        { label: 'Internal Revenue Service, Residential Clean Energy Credit (eligibility window, ends for property placed in service after Dec. 31, 2025)', url: 'https://www.irs.gov/credits-deductions/residential-clean-energy-credit' },
        { label: 'EnergySage, "How Much Does It Cost to Go Solar in the US?" (2026 average cost per watt and system cost)', url: 'https://www.energysage.com/solar/how-much-does-it-cost-to-go-solar-in-the-us/' },
        { label: 'U.S. Department of Energy, Homeowner\'s Guide to Going Solar (financing options)', url: 'https://www.energy.gov/eere/solar/homeowners-guide-going-solar' }
      ]
    },
    inputs: [
      { id: 'systemCost', label: 'System cost (before any incentive)', type: 'currency', placeholder: '31135', defaultValue: 31135, step: 100, min: 0 },
      { id: 'incentiveAmount', label: 'Incentive, rebate or credit applied', type: 'currency', placeholder: '1000', defaultValue: 1000, step: 100, min: 0 },
      { id: 'annualSavings', label: 'Estimated annual savings', type: 'currency', placeholder: '2856.36', defaultValue: 2856.36, step: 10, min: 0 }
    ],
    seo: {
      title: 'Solar Payback Period Calculator – Break-Even Years',
      description: 'How many years until a solar system pays for itself: net cost after any incentive, divided by annual savings. Solve for cost, incentive, savings or years.',
      faq: [
        { question: 'What is a solar payback period?', answer: 'The number of years of savings it takes to recover a solar system\'s net cost — the break-even point, found by dividing net cost by estimated annual savings. It\'s different from total lifetime savings, which is what the system is worth after that point.' },
        { question: 'How long does it typically take solar to pay for itself?', answer: 'In this calculator\'s worked example — a $31,135 system, a $1,000 incentive and $2,856.36 in annual savings — about 10.55 years, or 10.90 years with no incentive at all. Your own payback depends on your system\'s cost, any incentive and your estimated savings.' },
        { question: 'Is the federal solar tax credit still available in 2026?', answer: 'No. The IRS states the residential clean energy credit "is not available for any property placed in service after December 31, 2025." Check for a current state, utility or local incentive instead of assuming a federal credit applies.' },
        { question: 'How much does a home solar system cost?', answer: 'EnergySage\'s 2026 marketplace data puts the average at about $2.60 per watt before incentives, with a typical ~12 kW home system costing around $31,135 — a starting point, not a quote for your own roof and equipment.' },
        { question: 'Does payback period account for loan financing?', answer: 'No — it assumes you pay the net cost up front. If you\'re financing with a loan, use the solar loan payment calculator to see the actual monthly payment against your estimated savings.' },
        { question: 'What is the difference between payback period and solar savings?', answer: 'Payback period is when the system breaks even; solar savings is how much it\'s worth to you in total, including the years after it has already paid for itself. The two answer different questions about the same system.' }
      ]
    },
    compute(values) {
      const netSystemCost = values.systemCost - values.incentiveAmount;
      const paybackPeriod = values.annualSavings > 0 ? netSystemCost / values.annualSavings : NaN;
      return { paybackPeriod, netSystemCost };
    }
  },
  {
    id: 'solar-loan-payment-calculator',
    category: 'solar',
    glyph: '$/mo',
    updatedAt: '2026-11-18',
    aliases: ['solar loan calculator', 'solar financing calculator', 'solar panel loan payment calculator', 'solar loan payment estimator', 'solar loan vs savings calculator'],
    related: ['loan-calculator', 'solar-payback-period-calculator', 'solar-savings-calculator', 'emi-calculator'],
    title: 'Solar Loan Payment Calculator',
    description: 'Find the monthly payment on a solar loan from the amount financed, rate and term, and compare it against your estimated monthly solar savings. Fill in any three of amount, payment, term or rate.',
    example: 'A $30,135 solar loan at 6% APR over 20 years costs about $215.90 a month. Against an estimated $238.03 a month in solar savings, that leaves about $22.13 a month better off, even while the loan is still being paid down.',
    solver: {
      defaultTarget: 'monthlyPayment',
      variables: [
        { id: 'monthlyPayment', label: 'Monthly loan payment', symbol: 'M', dimension: 'currency', defaultValue: 215.9, defaultUnit: 'currency' },
        { id: 'loanAmount', label: 'Amount financed', symbol: 'P', dimension: 'currency', defaultValue: 30135, defaultUnit: 'currency' },
        { id: 'term', label: 'Loan term', symbol: 'n', dimension: 'term', defaultValue: 20, defaultUnit: 'yr' },
        { id: 'interestRate', label: 'Interest rate (APR)', symbol: 'APR', dimension: 'percent', defaultValue: 6, defaultUnit: '%', bounds: [0, 100] },
        { id: 'monthlySolarSavings', label: 'Estimated monthly solar savings', symbol: 'S', dimension: 'currency', defaultValue: 238.03, defaultUnit: 'currency', fixed: true }
      ],
      solve: {
        monthlyPayment: ({ loanAmount, term, interestRate }) => loanPayment(loanAmount, term, interestRate),
        loanAmount: ({ monthlyPayment: payment, term, interestRate }) => loanPrincipal(payment, term, interestRate),
        term: ({ loanAmount, monthlyPayment: payment, interestRate }) => loanMonths(loanAmount, payment, interestRate)
      },
      // The rate has no closed form: the widget finds it numerically.
      equation: (si) => si.monthlyPayment - loanPayment(si.loanAmount, si.term, si.interestRate),
      outputs: [
        { id: 'totalInterest', label: 'Total interest', dimension: 'currency', compute: (si) => si.monthlyPayment * si.term - si.loanAmount },
        { id: 'totalPaid', label: 'Total of all payments', dimension: 'currency', compute: (si) => si.monthlyPayment * si.term },
        { id: 'netMonthlyCashFlow', label: 'Net monthly cash flow (savings minus payment)', dimension: 'currency', compute: (si) => si.monthlySolarSavings - si.monthlyPayment }
      ],
      visuals: [
        {
          type: 'compareBars',
          bars: [
            { from: 'monthlyPayment', label: 'Loan payment' },
            { from: 'monthlySolarSavings', label: 'Est. solar savings' }
          ],
          title: 'Loan payment vs. estimated monthly solar savings'
        },
        { type: 'amortization', principal: 'loanAmount', annualRate: 'interestRate', months: 'term', payment: 'monthlyPayment' }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Financing solar with a loan',
        paragraphs: [
          'A solar loan works exactly like any other amortized loan — the same formula this site\'s general loan calculator uses — applied to the amount you\'re financing after any cash down payment or incentive. The U.S. Department of Energy\'s homeowner\'s guide describes the appeal directly: with a loan, "monthly loan payments are smaller than a typical energy bill, which will help you save money from the start," at least when the loan\'s payment is smaller than what the system saves you each month.',
          'That comparison — payment versus savings — is the point of this calculator. The same loan amount can cash-flow positive or negative depending on the term and rate: stretching a $30,135 loan to 20 years at 6% APR brings the payment to about $215.90 a month, below an estimated $238.03 in monthly solar savings. Shortening the same loan to 15 years at 6% raises the payment to about $254.30, which would cost about $16.27 a month more than it saves, even though the loan finishes four years sooner for less total interest.',
          'There is no single "right" term or rate here — it depends on whether you\'d rather pay less in total interest (shorter term, higher payment) or stay cash-flow positive from day one (longer term, lower payment). Real solar loan rates and terms vary by lender, your credit and the loan product, so treat the APR here as illustrative and use the one from your own loan offer for an exact figure.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the four loan fields; the fourth, marked auto, is calculated. Add your estimated monthly savings to see the cash-flow comparison.',
        steps: [
          { name: 'Enter the amount financed', text: 'Use the net system cost after any cash down payment or incentive — the solar payback calculator\'s "net system cost" output is a good source.' },
          { name: 'Enter the rate and term', text: 'Use the APR and term from your actual loan offer; switch the term between years and months with the menu beside it.' },
          { name: 'Solve for something else', text: 'Type into the auto field to make it an input instead — enter a payment you can afford to see how large a loan it supports.' },
          { name: 'Enter your estimated monthly solar savings', text: 'Use the annual figure from the solar savings calculator divided by 12, or your installer\'s own monthly estimate.' },
          { name: 'Read the comparison', text: 'The bars below compare the loan payment against your estimated savings; the net monthly cash-flow figure is the difference, and the schedule shows how the balance pays down over time.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The amount financed, rate and term determine the payment through the standard loan-amortization formula; comparing that payment with estimated savings is simple subtraction.',
        expression: 'M = P × r ÷ (1 − (1 + r)^−n)\nr = APR ÷ 100 ÷ 12\nnet monthly cash flow = monthly solar savings − M',
        terms: [
          { symbol: 'M', meaning: 'Monthly loan payment.' },
          { symbol: 'P', meaning: 'Amount financed — the system cost after any cash payment or incentive.' },
          { symbol: 'n', meaning: 'Term in months.' },
          { symbol: 'r', meaning: 'Monthly interest rate: APR divided by 12, as a decimal.' }
        ],
        note: 'Estimates only. Real loan products can add origination fees, and solar loan rates vary by lender, loan type and credit — use your own loan offer for an exact payment.'
      },
      workedExample: {
        intro: 'You finance $30,135 at 6% APR over 20 years. Estimated monthly solar savings are $238.03 (the $2,856.36 annual figure from the savings calculator, divided by 12).',
        rows: [
          { label: 'Monthly rate (r = 6% ÷ 12)', value: '0.005' },
          { label: 'Number of payments (n = 20 × 12)', value: '240' },
          { label: 'Monthly payment', value: '$215.90' },
          { label: 'Total paid over 20 years (215.90 × 240)', value: '≈ $51,815.16' },
          { label: 'Total interest (51,815.16 − 30,135)', value: '≈ $21,680.16' },
          { label: 'Net monthly cash flow (238.03 − 215.90)', value: '+$22.13' }
        ],
        result: 'M ≈ $215.90/month · about $21,680.16 in total interest · +$22.13/month net',
        explanation: 'Because the loan payment comes out lower than the estimated savings, this loan is cash-flow positive from the first month — you\'re about $22.13 better off monthly even while still paying down the loan. The same $30,135 at 15 years instead of 20 raises the payment to about $254.30 — $16.27 a month more than the estimated savings — while cutting total interest by roughly $6,041.83.'
      },
      watchOut: [
        { title: 'A shorter term can cost more per month than it saves', body: 'The 15-year version of the worked example above pays about $254.30 a month — more than the $238.03 in estimated savings — even though it costs about $6,041.83 less in total interest than the 20-year version. Whether that trade-off is worth it depends on your own monthly budget, not just the total cost.' },
        { title: 'Real solar loan rates and terms vary', body: 'The 6% APR and 20-year term here are illustrative. Solar-specific loan products, home equity loans and personal loans all carry different rates depending on your lender, credit and the loan type — use your own offer\'s APR for an exact payment.' },
        { title: 'This compares against an estimate, not a guarantee', body: 'The monthly savings figure you enter is only as reliable as the production estimate behind it. A system that underproduces its estimate narrows or erases the "net monthly cash flow" advantage shown here.' },
        { title: 'Fees and origination costs aren\'t modeled', body: 'Some loan products add an origination fee or a dealer fee baked into the rate. Your loan\'s actual disclosure is the binding figure for the true cost of borrowing.' }
      ],
      references: [
        { label: 'U.S. Department of Energy, Homeowner\'s Guide to Going Solar (loan financing)', url: 'https://www.energy.gov/eere/solar/homeowners-guide-going-solar' },
        { label: 'OpenStax, Contemporary Mathematics, §6.8 The Basics of Loans', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans' },
        { label: 'Consumer Financial Protection Bureau, Regulation Z (Truth in Lending), Appendix J: Annual Percentage Rate Computations', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/j/' }
      ]
    },
    inputs: [
      { id: 'loanAmount', label: 'Amount financed', type: 'currency', placeholder: '30135', defaultValue: 30135, step: 100, min: 0 },
      { id: 'interestRate', label: 'Interest rate (APR)', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.01, min: 0 },
      { id: 'years', label: 'Loan term (years)', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 },
      { id: 'monthlySolarSavings', label: 'Estimated monthly solar savings', type: 'currency', placeholder: '238.03', defaultValue: 238.03, step: 1, min: 0 }
    ],
    seo: {
      title: 'Solar Loan Payment Calculator – Payment vs. Savings',
      description: 'Find the monthly payment on a solar loan from the amount, rate and term, compared against estimated monthly savings. Solve for amount, payment, term or rate.',
      faq: [
        { question: 'How is a solar loan payment calculated?', answer: 'The same way as any amortized loan: M = P × r ÷ (1 − (1 + r)^−n), where P is the amount financed, r is the monthly rate (APR ÷ 12) and n is the number of months. A $30,135 loan at 6% APR over 20 years comes to about $215.90 a month.' },
        { question: 'Will a solar loan payment be lower than my current electricity bill?', answer: 'It depends on the loan\'s rate and term versus your estimated savings. In this calculator\'s worked example, a 20-year loan at 6% APR costs $215.90 a month against $238.03 in estimated savings — a net $22.13 a month better off. A shorter, higher-payment loan on the same amount can cost more per month than it saves.' },
        { question: 'Is a longer loan term better for solar financing?', answer: 'It usually means a lower, more easily cash-flow-positive monthly payment, at the cost of more total interest. The worked example\'s 15-year version pays about $254.30 a month (more than its $238.03 in estimated savings) but saves roughly $6,041.83 in total interest versus the 20-year version.' },
        { question: 'What interest rate do solar loans typically carry?', answer: 'It varies by lender, loan type (solar-specific loan, home equity loan or personal loan) and your credit. This calculator uses 6% as an illustrative default — use the APR from your own loan offer for an exact payment.' },
        { question: 'How much can I borrow for a given monthly payment?', answer: 'Enter the payment, rate and term, and the loan amount becomes the calculated field. At 6% over 20 years, a $220 monthly payment supports financing about $30,707.77.' },
        { question: 'Does this calculator account for solar incentives?', answer: 'Not directly — enter the amount actually financed (after any cash payment or incentive already applied) as the loan amount. The solar payback period calculator\'s net system cost figure is a good source for that number.' }
      ]
    },
    compute(values) {
      const monthlyRate = values.interestRate / 100 / 12;
      const months = Math.max(1, values.years * 12);
      const payment = monthlyRate === 0 ? values.loanAmount / months : (values.loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const totalPaid = payment * months;
      const totalInterest = totalPaid - values.loanAmount;
      const netMonthlyCashFlow = values.monthlySolarSavings - payment;
      return { monthlyPayment: payment, totalPaid, totalInterest, netMonthlyCashFlow };
    }
  },
  {
    id: 'net-metering-savings-calculator',
    category: 'solar',
    glyph: 'NEM',
    updatedAt: '2026-11-18',
    aliases: ['net metering calculator', 'solar net metering credit calculator', 'excess solar generation credit calculator', 'net metering bill credit estimator', 'solar export credit calculator'],
    related: ['solar-savings-calculator', 'electricity-bill-calculator', 'solar-panel-system-size-calculator', 'solar-payback-period-calculator'],
    title: 'Net Metering Savings Calculator',
    description: 'Estimate the monthly and annual bill credit for excess solar generation exported to the grid, at your utility\'s net-metering rate, compared with what that energy would be worth at full retail.',
    example: '150 kWh of excess generation exported in a month, credited at $0.08/kWh, is worth $12.00 that month ($144.00 a year) — 56.3% less than the $27.47 it would be worth at a $0.1831/kWh full retail rate.',
    breakdown: {
      headline: 'annualCredit',
      headlineLabel: 'Estimated annual bill credit',
      outputs: [
        { id: 'annualCredit', label: 'Estimated annual bill credit', format: 'currency' },
        { id: 'monthlyCredit', label: 'Estimated monthly bill credit', format: 'currency' },
        { id: 'annualValueAtRetail', label: 'What that energy would be worth at full retail (annual)', format: 'currency' },
        { id: 'creditShortfallPercent', label: 'How much less than full retail your credit rate pays', format: 'percent' }
      ],
      groups: [
        { title: 'Excess generation exported', inputs: ['excessKwhPerMonth'] },
        { title: 'Rates', inputs: ['netMeteringRatePerKwh', 'retailRatePerKwh'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'annualCredit', label: 'At net-metering rate' },
          { from: 'annualValueAtRetail', label: 'At full retail rate' }
        ],
        title: 'Net-metering credit vs. full-retail value, exported energy only'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What net metering actually pays for',
        paragraphs: [
          'The U.S. Department of Energy defines net metering as "an arrangement between solar energy system owners and utilities in which the system owners are compensated for any solar power generation that is exported to the electricity grid." The key word is exported: this is about the surplus your panels send out to the grid in a sunny hour or a low-usage month, not the power you generate and use yourself in the same moment, which simply reduces how much you buy. The solar savings calculator values your whole production at your full retail rate; this calculator is specifically for the exported portion, which may be credited at a different rate entirely.',
          'How much that exported energy is actually worth depends entirely on your own utility and state. DOE is direct about it: "whether or not your solar system qualifies for net metering payments depends on policies and practices in your state and electric utility." Some programs credit exports dollar-for-dollar at the full retail rate; others pay an "avoided cost" or wholesale-style rate that can be well below retail, reflecting what the utility would otherwise have paid to generate or buy that power itself. There is no single national net-metering rate — the figure that matters is the one on your own utility\'s tariff.',
          'Retail electricity rates themselves vary just as widely. The U.S. Energy Information Administration\'s own state-level data puts residential rates anywhere from the low teens to the high forties of cents per kWh depending on where you live, which is why this calculator asks for your own retail rate rather than assuming a national average for the comparison.'
        ]
      },
      howTo: {
        intro: 'Enter the excess generation you expect to export in a typical month, your utility\'s net-metering credit rate, and your retail rate for comparison.',
        steps: [
          { name: 'Enter your excess generation', text: 'This is the surplus beyond what your home used in the month — from a solar monitoring app, or your utility\'s own net-metering statement.' },
          { name: 'Enter your net-metering credit rate', text: 'Check your utility\'s net-metering tariff; it may equal your retail rate (full retail) or sit below it (avoided-cost or wholesale-style crediting).' },
          { name: 'Enter your retail rate', text: 'Use the per-kWh rate from your own bill, for the full-retail comparison.' },
          { name: 'Read the result', text: 'The headline is the estimated annual credit; the rows below show the monthly figure and how it compares with what that same energy would be worth at full retail.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The credit is simply exported energy times your utility\'s net-metering rate; the comparison swaps in the retail rate for the same energy.',
        expression: 'monthly credit = excess kWh × net-metering rate\nannual credit = monthly credit × 12\nvalue at full retail = excess kWh × retail rate\ncredit shortfall = 1 − (net-metering rate ÷ retail rate)',
        terms: [
          { symbol: 'excess kWh', meaning: 'Solar generation exported to the grid in a month — beyond what the home used at the time.' },
          { symbol: 'net-metering rate', meaning: 'Whatever your utility\'s tariff actually credits for exported energy — full retail, avoided cost, wholesale, or something else entirely.' },
          { symbol: 'retail rate', meaning: 'Your normal per-kWh electricity price, used only for the comparison.' }
        ],
        note: 'Illustrative only — net-metering rates and rules vary enormously by state and utility, and some programs roll unused credits forward to a later bill rather than paying out monthly. Check your own utility\'s net-metering tariff for the figure that actually applies to you.'
      },
      workedExample: {
        intro: 'A home exports 150 kWh of excess solar generation in a month. Its utility credits net-metered exports at $0.08/kWh; its normal retail rate is $0.1831/kWh.',
        rows: [
          { label: 'Monthly credit (150 × $0.08)', value: '$12.00' },
          { label: 'Annual credit (12.00 × 12)', value: '$144.00' },
          { label: 'Value at full retail (150 × $0.1831)', value: '$27.47' },
          { label: 'Annual value at full retail (27.47 × 12)', value: '$329.58' },
          { label: 'Credit shortfall (1 − 0.08 ÷ 0.1831)', value: '56.3%' }
        ],
        result: '$12.00/month · $144.00/year — 56.3% less than full retail',
        explanation: 'At a net-metering rate a little under half of retail, this home\'s exported energy is worth $144.00 a year instead of the $329.58 it would be worth if every exported kWh were credited at the full $0.1831 retail rate. A utility that credits exports at full retail would show 0% shortfall and the two bars in the comparison above would match exactly.'
      },
      watchOut: [
        { title: 'Net-metering rates vary enormously', body: 'DOE is explicit that whether and how much you\'re paid for exported solar "depends on policies and practices in your state and electric utility." Some pay full retail; others pay a lower avoided-cost or wholesale-style rate. There is no national figure to default to — use your own utility\'s tariff.' },
        { title: 'This only covers exported excess, not your whole production', body: 'Power you generate and use in the same moment isn\'t exported — it just reduces the electricity you buy, valued at your full retail rate. Use the solar savings calculator for that larger, whole-production estimate.' },
        { title: 'Some programs roll credits forward instead of paying monthly', body: 'Not every utility pays out a net-metering credit as cash each month — some carry it forward against future bills, with its own rules for what happens to any credit left at year\'s end. Check your own utility\'s tariff for how credits are actually applied.' },
        { title: 'Retail rates vary by state too', body: 'EIA\'s own data shows state residential rates ranging from the low teens to the high forties of cents per kWh. Use your own bill\'s rate for the full-retail comparison, not a national average.' }
      ],
      references: [
        { label: 'U.S. Department of Energy, Homeowner\'s Guide to Going Solar (net metering definition)', url: 'https://www.energy.gov/eere/solar/homeowners-guide-going-solar' },
        { label: 'U.S. Energy Information Administration, Electric Power Monthly, Table 5.6.A (residential rates by state)', url: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=table_5_06_a' }
      ]
    },
    inputs: [
      { id: 'excessKwhPerMonth', label: 'Excess generation exported', type: 'number', placeholder: '150', defaultValue: 150, step: 10, min: 0, dimension: 'energy', unit: 'kWh' },
      { id: 'netMeteringRatePerKwh', label: 'Net-metering credit rate', type: 'currency', placeholder: '0.08', defaultValue: 0.08, step: 0.01, min: 0 },
      { id: 'retailRatePerKwh', label: 'Your retail electricity rate', type: 'currency', placeholder: '0.1831', defaultValue: 0.1831, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Net Metering Savings Calculator – Solar Export Credit',
      description: 'Estimate the monthly and annual bill credit for excess solar generation exported to the grid, compared with what that energy is worth at your full retail rate.',
      faq: [
        { question: 'What is net metering?', answer: 'The U.S. Department of Energy defines it as "an arrangement between solar energy system owners and utilities in which the system owners are compensated for any solar power generation that is exported to the electricity grid."' },
        { question: 'How much is my excess solar generation worth?', answer: 'Exported kWh times your utility\'s net-metering rate. In this calculator\'s worked example, 150 kWh exported at $0.08/kWh is worth $12.00 that month, or $144.00 over a year.' },
        { question: 'Does every utility pay full retail for exported solar?', answer: 'No. DOE states this "depends on policies and practices in your state and electric utility" — some programs credit exports at full retail, others at a lower avoided-cost or wholesale-style rate. Check your own utility\'s net-metering tariff.' },
        { question: 'How is this different from the solar savings calculator?', answer: 'The savings calculator values your whole production at full retail, assuming you use or export every kWh at that rate. This calculator is specifically for the exported excess, valued at whatever your utility\'s actual net-metering rate is — which can be lower than retail.' },
        { question: 'Why might my net-metering credit rate be lower than my retail rate?', answer: 'Some utilities credit exported solar at an "avoided cost" or wholesale-style rate — roughly what generating or buying that power would have cost the utility itself — rather than the retail price a residential customer pays, which also covers delivery and other charges.' },
        { question: 'Are net-metering credits paid out in cash or rolled over?', answer: 'It depends on the utility. Some pay out or apply the credit each billing cycle; others carry unused credits forward to future bills, with their own rules for any balance left at year\'s end. Your utility\'s net-metering tariff spells out which applies to you.' }
      ]
    },
    compute(values) {
      const monthlyCredit = values.excessKwhPerMonth * values.netMeteringRatePerKwh;
      const annualCredit = monthlyCredit * 12;
      const monthlyValueAtRetail = values.excessKwhPerMonth * values.retailRatePerKwh;
      const annualValueAtRetail = monthlyValueAtRetail * 12;
      const creditShortfallPercent = values.retailRatePerKwh > 0 ? (1 - values.netMeteringRatePerKwh / values.retailRatePerKwh) * 100 : NaN;
      return { monthlyCredit, annualCredit, monthlyValueAtRetail, annualValueAtRetail, creditShortfallPercent };
    }
  },
  {
    id: 'battery-backup-sizing-calculator',
    category: 'solar',
    glyph: 'kWh',
    updatedAt: '2026-11-18',
    aliases: ['home battery backup sizing calculator', 'how big a solar battery do i need', 'solar battery capacity calculator', 'backup battery kwh calculator', 'how many solar batteries do i need'],
    related: ['solar-panel-system-size-calculator', 'off-grid-solar-calculator', 'home-electricity-consumption-calculator', 'solar-savings-calculator'],
    title: 'Battery Backup Sizing Calculator',
    description: 'Find the battery capacity (kWh) needed to back up a set of loads for a chosen number of hours, plus how many average-sized home batteries that takes.',
    example: '6,300 W of load (a dishwasher, an AC unit, a fridge and some lights and electronics running together) for 8 hours, with a 10% margin, needs 55.44 kWh — about 5 batteries at a common 13.5 kWh size.',
    breakdown: {
      headline: 'requiredKwh',
      headlineLabel: 'Battery capacity needed',
      outputs: [
        { id: 'requiredKwh', label: 'Battery capacity needed', format: 'number', dimension: 'energy', unit: 'kWh' },
        { id: 'requiredKwhBare', label: 'Bare minimum, before any margin', format: 'number', dimension: 'energy', unit: 'kWh' },
        { id: 'batteriesNeeded', label: 'Batteries needed (at 13.5 kWh each)', format: 'integer' }
      ],
      groups: [
        { title: 'Loads to back up', inputs: ['criticalLoadWatts', 'backupHours'] },
        { title: 'Safety margin', inputs: ['reserveMarginPercent'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'requiredKwhBare', label: 'Bare minimum' },
          { from: 'requiredKwh', label: 'With margin' }
        ],
        title: 'Battery capacity needed, before and after the margin'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Sizing a home battery for backup power',
        paragraphs: [
          'EnergySage, a solar-quote marketplace, lays out the core calculation for home battery backup directly: "multiply the appliances\' electricity demand by the number of hours they\'ll need to run. That\'ll tell you the kilowatt-hour (kWh) capacity you require for storage." Demand is measured in kilowatts (the rate of draw) and the result is in kilowatt-hours (demand × time) — the same relationship that makes a 1 kW load running for 3 hours use exactly as much energy as a 3 kW load running for 1 hour.',
          'EnergySage\'s own worked example totals a household\'s loads this way: "a 1,500-watt (W) dishwasher, a 3,000-W air conditioner, an 800-W refrigerator, plus lights, WiFi and miscellaneous appliances that consume 1,000 W of electricity" — 6,300 W running together. Whether you want everything running at once, or only a smaller set of true essentials (the refrigerator and some lights, say), is a choice only you can make; this calculator just does the multiplication once you\'ve decided what "backed up" means for your home.',
          'For scale, EnergySage also notes that "the average solar battery is roughly 10 to 13.5 kilowatt-hours (kWh) in size" — this calculator uses the top of that range, 13.5 kWh, to estimate how many battery units a given capacity requirement takes, since whole-home backup commonly needs more than one.'
        ]
      },
      howTo: {
        intro: 'Add up the wattage of what you want backed up, decide how many hours to cover, and optionally add a margin.',
        steps: [
          { name: 'Add up your critical-load wattage', text: 'Sum the wattage of everything you want running during an outage — check appliance nameplates or use the appliance energy cost calculator for one device at a time.' },
          { name: 'Enter the hours you want covered', text: 'This is how long you want those loads able to run without the grid or solar recharging the battery.' },
          { name: 'Add a margin, if you want one', text: 'A percentage above the bare-minimum figure, to leave room for battery aging, inverter losses, or loads you forgot to count.' },
          { name: 'Read the result', text: 'The headline is the battery capacity needed in kWh; the rows below show the bare-minimum figure and roughly how many average-sized batteries that takes.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Capacity needed is simply load times time, scaled up by any margin you add.',
        expression: 'bare kWh = (load in watts ÷ 1,000) × hours\nkWh needed = bare kWh × (1 + margin%)\nbatteries needed = ceil(kWh needed ÷ 13.5)',
        terms: [
          { symbol: 'load', meaning: 'Combined wattage of everything you want backed up, running at the same time.' },
          { symbol: 'hours', meaning: 'How long you want that load able to run on battery alone.' },
          { symbol: 'margin%', meaning: 'An optional buffer above the bare-minimum figure; 0% uses the bare minimum exactly.' },
          { symbol: 'ceil(x)', meaning: 'Round up to the next whole battery — you can only install whole units.' }
        ],
        note: 'This sizes stored energy only. It does not check whether your inverter\'s power rating (kW, not kWh) can actually deliver your combined load at once — a battery can hold enough energy but still trip if asked to output more power than its inverter supports. Check your battery\'s continuous power rating against your peak combined load separately.'
      },
      workedExample: {
        intro: 'EnergySage\'s own example load — a 1,500 W dishwasher, a 3,000 W air conditioner, an 800 W refrigerator, and 1,000 W of lights, WiFi and miscellaneous electronics, 6,300 W in total — backed up for 8 hours, with a 10% margin.',
        rows: [
          { label: 'Bare minimum (6.3 kW × 8 h)', value: '50.4 kWh' },
          { label: 'With a 10% margin (50.4 × 1.10)', value: '55.44 kWh' },
          { label: 'Batteries needed (ceil(55.44 ÷ 13.5))', value: '5 batteries' }
        ],
        result: '55.44 kWh needed — about 5 batteries at 13.5 kWh each',
        explanation: 'Dropping the 10% margin brings the figure back to the bare 50.4 kWh, which still needs 4 batteries at 13.5 kWh each (50.4 ÷ 13.5 = 3.73, rounded up) — one fewer than the margin-adjusted total. Backing up only the refrigerator and the lights/WiFi/misc load (1,800 W) for a longer 12-hour outage, with no margin, needs just 21.6 kWh — 2 batteries.'
      },
      watchOut: [
        { title: 'This is energy (kWh), not power (kW)', body: 'A battery\'s kWh rating is how much it can store, not how much it can output at once. Check its continuous power rating (kW) against your actual combined load — a battery sized correctly on energy alone can still be unable to run everything simultaneously.' },
        { title: 'Decide what "backed up" really means first', body: 'EnergySage\'s own example includes a 3,000 W air conditioner and a 1,500 W dishwasher — comfort and convenience loads, not strict essentials. Backing up only a refrigerator and some lights needs dramatically less capacity than backing up everything in the house.' },
        { title: 'The 13.5 kWh reference is EnergySage\'s own upper bound, not every battery', body: 'EnergySage describes the average home battery as "roughly 10 to 13.5 kilowatt-hours" — actual products vary, and some systems stack smaller or larger units. Check your own battery\'s nameplate capacity for an exact unit count.' },
        { title: 'No margin means no room for error', body: 'A 0% margin assumes your load estimate is exactly right and the battery discharges every kWh of its rated capacity. Real batteries, loads you forgot to count, and battery aging over time are all reasons to size a little above the bare minimum.' }
      ],
      references: [
        { label: 'EnergySage, "How Many Solar Batteries Do You Need for Backup Power?" (sizing formula, example load, average battery size)', url: 'https://www.energysage.com/energy-storage/how-many-solar-batteries-needed/' }
      ]
    },
    inputs: [
      { id: 'criticalLoadWatts', label: 'Combined load to back up', type: 'number', placeholder: '6300', defaultValue: 6300, step: 100, min: 0, dimension: 'power', unit: 'W' },
      { id: 'backupHours', label: 'Hours to cover', type: 'number', placeholder: '8', defaultValue: 8, step: 1, min: 1 },
      { id: 'reserveMarginPercent', label: 'Safety margin above the bare minimum', type: 'percent', placeholder: '10', defaultValue: 10, step: 5, min: 0 }
    ],
    seo: {
      title: 'Battery Backup Sizing Calculator – kWh Needed',
      description: 'Find the battery capacity (kWh) needed to back up a set of loads for a chosen number of hours, and how many average-sized home batteries that takes.',
      faq: [
        { question: 'How do I size a home battery for backup power?', answer: 'EnergySage\'s own method: multiply the combined wattage of what you want backed up by the number of hours you want it running, then convert to kWh. A 6,300 W load for 8 hours needs 50.4 kWh before any safety margin.' },
        { question: 'How many batteries do I need for whole-home backup?', answer: 'It depends on your load and how long you want it covered. In this calculator\'s worked example — 6,300 W for 8 hours with a 10% margin — about 5 batteries at a common 13.5 kWh size. Backing up only a refrigerator and some lights needs far fewer.' },
        { question: 'How big is an average home solar battery?', answer: 'EnergySage puts it at "roughly 10 to 13.5 kilowatt-hours (kWh)." This calculator uses 13.5 kWh, the top of that range, to estimate a battery count.' },
        { question: 'Should I back up my air conditioner and dishwasher too?', answer: 'That is a personal choice, not a technical requirement. EnergySage\'s own example includes both, but many homeowners choose to back up only true essentials — a refrigerator, lights, WiFi and medical equipment — which needs much less capacity.' },
        { question: 'Why add a safety margin to the bare-minimum calculation?', answer: 'The bare-minimum figure assumes your load estimate is exact and the battery can discharge every kWh of its rating. A margin — 10% in the worked example — leaves room for battery aging, inverter losses, or a load you forgot to count.' },
        { question: 'Does a bigger battery kWh rating guarantee it can run my appliances at once?', answer: 'No. kWh is stored energy; the battery\'s separate power rating (in kW) determines how much it can output at any one instant. A battery with plenty of stored energy can still be unable to start a large appliance if its power rating is too low.' }
      ]
    },
    compute(values) {
      const requiredKwhBare = (values.criticalLoadWatts / 1000) * values.backupHours;
      const requiredKwh = requiredKwhBare * (1 + values.reserveMarginPercent / 100);
      const batteriesNeeded = Math.ceil(requiredKwh / 13.5);
      return { requiredKwh, requiredKwhBare, batteriesNeeded };
    }
  },
  {
    id: 'off-grid-solar-calculator',
    category: 'solar',
    glyph: 'OG',
    updatedAt: '2026-11-18',
    aliases: ['off grid solar system sizing calculator', 'stand alone solar system calculator', 'off grid solar panel and battery calculator', 'how big an off grid solar system do i need', 'off grid solar battery bank calculator'],
    related: ['solar-panel-system-size-calculator', 'battery-backup-sizing-calculator', 'home-electricity-consumption-calculator', 'net-metering-savings-calculator'],
    title: 'Off-Grid Solar System Calculator',
    description: 'Size a fully off-grid (stand-alone) solar system\'s array and battery bank from daily energy need, sun-hours, system losses, days of autonomy and battery depth of discharge — no grid to fall back on.',
    example: '5 kWh/day of off-grid use, 5 sun-hours, 20% system losses, 2 days of autonomy and a 90% depth of discharge calls for a 1.25 kW array and an 11.11 kWh battery bank.',
    breakdown: {
      headline: 'requiredArrayKw',
      headlineLabel: 'Solar array size needed',
      outputs: [
        { id: 'requiredArrayKw', label: 'Solar array size needed', format: 'number' },
        { id: 'batteryBankKwh', label: 'Battery bank size needed', format: 'number', dimension: 'energy', unit: 'kWh' }
      ],
      groups: [
        { title: 'Daily use and sun', inputs: ['dailyEnergyNeedKwh', 'sunHours', 'systemLossesPercent'] },
        { title: 'Battery bank', inputs: ['daysOfAutonomy', 'depthOfDischargePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'dailyEnergyNeedKwh', label: 'Daily use' },
          { from: 'batteryBankKwh', label: 'Battery bank' }
        ],
        title: 'Daily energy use vs. battery bank size'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why off-grid sizing is different from grid-tied sizing',
        paragraphs: [
          'The solar panel system size calculator above sizes a grid-tied system to roughly match a home\'s usage over a whole year, because the grid absorbs every day-to-day mismatch — a cloudy week is simply bought from the utility, and a sunny one is exported. An off-grid (stand-alone) system has no such backstop: the U.S. Department of Energy\'s overview of PV system design notes that "batteries allow for the storage of solar photovoltaic energy, so we can use it to power our homes at night or when weather elements keep sunlight from reaching PV panels" — for an off-grid system, that battery bank is the only backstop there is, so both the array and the battery bank have to be sized for the worst realistic day, not the average one.',
          'The array side of the sizing works the same way as the grid-tied calculator\'s production ratio, just expressed in "peak sun hours" instead: the number of hours a location\'s panels would need to receive maximum (1,000 W/m²) sunlight to deliver the day\'s actual solar energy. A location-specific figure — from a tool like PVWatts, or a local installer\'s own data — is far more reliable than a national default; this calculator\'s illustrative figure, 5 sun-hours, sits in the middle of the range most of the mainland U.S. sees.',
          'The battery side borrows the same demand-times-time logic EnergySage uses for backup-battery sizing — "multiply the appliances\' electricity demand by the number of hours they\'ll need to run" — extended across more than one day. "Days of autonomy" is how many days the battery bank needs to cover with no solar input at all (a stretch of heavy cloud cover, say), and "depth of discharge" is how much of a battery\'s rated capacity can actually be used before recharging — check your own battery\'s spec sheet for its real figure rather than assuming a default, since it varies by battery chemistry and manufacturer.'
        ]
      },
      howTo: {
        intro: 'Enter your daily energy need and local sun-hours, then set how many cloudy days the battery bank needs to cover on its own.',
        steps: [
          { name: 'Enter your daily energy need', text: 'Use the kWh/day figure from the home electricity consumption calculator above, summed across everything you\'ll run off-grid.' },
          { name: 'Enter your location\'s sun-hours', text: 'Use a location-specific peak-sun-hours figure if you have one (from PVWatts or an installer); the default is a rough mid-range U.S. illustrative figure.' },
          { name: 'Enter system losses', text: 'A combined derate for wiring, inverter conversion and panel soiling — the default, 20%, is a reasonable starting point to adjust from.' },
          { name: 'Set days of autonomy', text: 'How many consecutive no-sun days you want the battery bank to cover by itself. More days means a larger, more expensive bank.' },
          { name: 'Enter your battery\'s depth of discharge', text: 'Check the manufacturer spec sheet — it varies by battery chemistry. The default, 90%, is illustrative, not a specific product\'s number.' },
          { name: 'Read the result', text: 'The headline is the array size needed; the row below is the battery bank size.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored. This is a planning estimate — a system this important to get right deserves a professional off-grid design review.'
      },
      formula: {
        intro: 'The array is sized to replace a day\'s energy use within the available sun-hours, after losses; the battery bank is sized to cover several sunless days at a usable fraction of its rated capacity.',
        expression: 'array size (W) = daily energy need (Wh) ÷ (sun-hours × (1 − losses%))\nbattery bank (kWh) = daily energy need (kWh) × days of autonomy ÷ (depth of discharge%)',
        terms: [
          { symbol: 'daily energy need', meaning: 'Total energy used per day by everything the system powers, in kWh.' },
          { symbol: 'sun-hours', meaning: 'Peak sun hours per day for the location — hours of 1,000 W/m² sunlight equivalent to the day\'s actual solar energy.' },
          { symbol: 'losses%', meaning: 'Combined derate for wiring, inverter conversion and soiling.' },
          { symbol: 'days of autonomy', meaning: 'Consecutive no-sun days the battery bank must cover without any solar input.' },
          { symbol: 'depth of discharge%', meaning: 'The usable fraction of a battery\'s rated capacity before it needs recharging — check your own battery\'s spec sheet.' }
        ],
        note: 'This sizes the array and battery bank independently against the inputs you give it; it does not model a specific location\'s seasonal sun-hours swing or run a multi-day simulation. A location-specific tool or an off-grid installer\'s own design process accounts for far more — including worst-month sun-hours, not an annual or illustrative figure.'
      },
      workedExample: {
        intro: 'An off-grid cabin uses 5 kWh a day, its location gets about 5 peak sun-hours, system losses are estimated at 20%, the battery bank should cover 2 days of autonomy, and the battery\'s depth of discharge is 90%.',
        rows: [
          { label: 'Array size (5,000 ÷ (5 × 0.80))', value: '1,250 W = 1.25 kW' },
          { label: 'Battery bank (5 × 2 ÷ 0.90)', value: '11.11 kWh' }
        ],
        result: '1.25 kW array · 11.11 kWh battery bank',
        explanation: 'Dropping to 4 sun-hours (a cloudier location, same 5 kWh/day need) raises the array size to 1,562.5 W — 25% bigger — because the same daily energy now has to be captured in fewer hours of sun. The battery bank is unaffected by sun-hours; at a lower 100% depth of discharge it would need only 10 kWh instead of 11.11 kWh, about 10% less, because more of each battery\'s capacity is considered usable.'
      },
      watchOut: [
        { title: 'Size for the worst realistic day, not the average one', body: 'Unlike a grid-tied system, there is no utility to buy from during a stretch of bad weather. Use a conservative, location-specific sun-hours figure and enough days of autonomy for the cloudy spells your location actually gets.' },
        { title: 'Depth of discharge varies a lot by battery', body: 'This calculator\'s 90% default is illustrative only — different battery chemistries and products specify very different usable fractions of their rated capacity. Check your own battery\'s spec sheet rather than trusting a default.' },
        { title: 'This does not model seasonal swings', body: 'Sun-hours change through the year, often substantially — winter can be far worse than the annual average in many locations. Size against the worst month you actually need to get through, not a single annual figure.' },
        { title: 'A professional design review matters more here than for grid-tied systems', body: 'An undersized grid-tied system just exports and imports a little differently than expected. An undersized off-grid system can mean no power at all during a bad stretch of weather — treat this as a planning estimate, not a final design.' }
      ],
      references: [
        { label: 'U.S. Department of Energy, Solar Photovoltaic System Design Basics (role of batteries in a PV system)', url: 'https://www.energy.gov/eere/solar/solar-photovoltaic-system-design-basics' },
        { label: 'EnergySage, "How Many Solar Batteries Do You Need for Backup Power?" (demand × time sizing formula)', url: 'https://www.energysage.com/energy-storage/how-many-solar-batteries-needed/' },
        { label: 'U.S. Department of Energy, Homeowner\'s Guide to Going Solar (PVWatts, for location-specific sun-hours)', url: 'https://www.energy.gov/eere/solar/homeowners-guide-going-solar' }
      ]
    },
    inputs: [
      { id: 'dailyEnergyNeedKwh', label: 'Daily energy need', type: 'number', placeholder: '5', defaultValue: 5, step: 0.5, min: 0, dimension: 'energy', unit: 'kWh' },
      { id: 'sunHours', label: 'Peak sun-hours per day (location)', type: 'number', placeholder: '5', defaultValue: 5, step: 0.5, min: 0.5 },
      { id: 'systemLossesPercent', label: 'System losses (wiring, inverter, soiling)', type: 'percent', placeholder: '20', defaultValue: 20, step: 5, min: 0 },
      { id: 'daysOfAutonomy', label: 'Days of autonomy (no-sun days to cover)', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 },
      { id: 'depthOfDischargePercent', label: 'Battery depth of discharge', type: 'percent', placeholder: '90', defaultValue: 90, step: 5, min: 10 }
    ],
    seo: {
      title: 'Off-Grid Solar System Calculator – Array & Battery Bank',
      description: 'Size a stand-alone solar system\'s array (kW) and battery bank (kWh) from daily energy need, sun-hours, system losses, days of autonomy and depth of discharge.',
      faq: [
        { question: 'How is off-grid solar sizing different from grid-tied sizing?', answer: 'A grid-tied system is sized to roughly match annual usage because the grid absorbs day-to-day mismatches. An off-grid system has no such backstop, so both the array and the battery bank must be sized for the worst realistic stretch of weather, not an average day.' },
        { question: 'What is a "peak sun hour"?', answer: 'The number of hours a location\'s panels would need full, 1,000 W/m² sunlight to deliver the day\'s actual total solar energy. It is a location-specific figure — this calculator\'s 5-hour default is an illustrative mid-range U.S. estimate.' },
        { question: 'What does "days of autonomy" mean for a battery bank?', answer: 'How many consecutive days with no solar input the battery bank needs to cover entirely on its own — a stretch of heavy cloud cover, for example. More days of autonomy means a larger, more expensive battery bank.' },
        { question: 'What is battery depth of discharge?', answer: 'The usable fraction of a battery\'s rated capacity before it needs recharging. It varies by battery chemistry and product, so this calculator\'s 90% default is illustrative — check your own battery\'s spec sheet for its real figure.' },
        { question: 'How big a system does a 5 kWh/day off-grid home need?', answer: 'In this calculator\'s worked example — 5 sun-hours, 20% system losses, 2 days of autonomy, 90% depth of discharge — about a 1.25 kW array and an 11.11 kWh battery bank. A cloudier location (fewer sun-hours) needs a larger array for the same usage.' },
        { question: 'Does this account for seasonal changes in sunlight?', answer: 'No — it uses a single sun-hours figure you provide. Real locations see sun-hours swing substantially through the year, so sizing against the worst month, not an annual average, gives a more reliable system.' }
      ]
    },
    compute(values) {
      const lossFactor = 1 - values.systemLossesPercent / 100;
      const requiredArrayWatts = values.sunHours > 0 && lossFactor > 0 ? (values.dailyEnergyNeedKwh * 1000) / (values.sunHours * lossFactor) : NaN;
      const requiredArrayKw = requiredArrayWatts / 1000;
      const batteryBankKwh = values.depthOfDischargePercent > 0 ? (values.dailyEnergyNeedKwh * values.daysOfAutonomy) / (values.depthOfDischargePercent / 100) : NaN;
      return { requiredArrayKw, batteryBankKwh };
    }
  }
];
