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
      description: 'Estimate a solar system\'s first-year and lifetime electricity savings from its size, production ratio and electricity rate, factoring in gradual panel output degradation.',
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
      description: 'Find how many years a solar system takes to pay for itself: net cost (after any incentive) divided by estimated annual savings. Solve for cost, incentive, savings or years.',
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
  }
];
