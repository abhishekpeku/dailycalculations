// Solar & Home Energy category (step 62, Wave 5): homeowner-facing solar sizing, savings, payback,
// financing and net-metering tools. See mdFiles/steps/62-wave-5-solar-home-energy.md. Reserved by
// step 49 (ecology.ts) — this category, not ecology, covers solar/home-energy topics.
import type { CalculatorConfig } from './types.ts';
import { loanPayment, loanPrincipal, loanMonths } from './finance.ts';

export const solarCalculators: CalculatorConfig[] = [
  {
    id: 'solar-panel-system-size-calculator',
    category: 'solar',
    group: 'Sizing & Payback',
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
    group: 'Sizing & Payback',
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
    group: 'Sizing & Payback',
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
    group: 'Sizing & Payback',
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
    group: 'Sizing & Payback',
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
    group: 'Storage & Consumption',
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
    group: 'Storage & Consumption',
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
  },
  {
    id: 'home-electricity-consumption-calculator',
    category: 'solar',
    group: 'Storage & Consumption',
    glyph: 'ΣkWh',
    updatedAt: '2026-11-18',
    aliases: ['appliance electricity usage calculator', 'how much electricity does my appliance use', 'appliance kwh calculator', 'household power consumption calculator', 'appliance wattage to kwh calculator'],
    related: ['solar-panel-system-size-calculator', 'electricity-bill-calculator', 'appliance-energy-cost-calculator', 'off-grid-solar-calculator'],
    title: 'Home Electricity Consumption Calculator',
    description: 'Estimate the kWh a group of identical appliances uses per day, month and year, from wattage, hours used per day and how many you have — a building block for sizing solar or an off-grid system.',
    example: 'One 1,200 W window air conditioner running 8 hours a day uses 9.6 kWh a day — 288 kWh a month, 3,504 kWh a year, about 32.5% of the EIA\'s average U.S. household\'s annual usage on its own.',
    breakdown: {
      headline: 'monthlyKwh',
      headlineLabel: 'Estimated monthly usage',
      outputs: [
        { id: 'monthlyKwh', label: 'Estimated monthly usage', format: 'number', dimension: 'energy', unit: 'kWh' },
        { id: 'dailyKwh', label: 'Estimated daily usage', format: 'number', dimension: 'energy', unit: 'kWh' },
        { id: 'annualKwh', label: 'Estimated annual usage', format: 'number', dimension: 'energy', unit: 'kWh' }
      ],
      groups: [{ title: 'Appliance', inputs: ['wattage', 'hoursPerDay', 'count'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'dailyKwh', label: 'Per day' },
          { from: 'monthlyKwh', label: 'Per month' }
        ],
        title: 'Daily vs. monthly usage'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Turning wattage into kilowatt-hours',
        paragraphs: [
          'Every appliance has a power rating in watts — the rate it draws electricity at while running. Multiplying that rate by the hours it actually runs gives energy, measured in watt-hours; divide by 1,000 and you have kilowatt-hours, the unit every electricity bill is priced in. A 1,000 W appliance run for one hour uses exactly 1 kWh, the same as a 500 W appliance run for two hours — rate and time trade off directly, as the U.S. Energy Information Administration\'s own unit conversions make explicit (1 kilowatt-hour = 3,412 Btu, a fixed physical conversion, not an approximation).',
          'This calculator multiplies one appliance\'s wattage by its daily hours of use and, if you have more than one of the same appliance, by the count — a string of 10 LED bulbs at 10 W each running 5 hours a day uses the same energy as a single 100 W bulb running 5 hours a day. Running the same math for every appliance type in a home and adding the results together builds up a full household estimate, piece by piece, which is exactly what feeds the solar panel system size calculator\'s "annual usage" field and the off-grid solar calculator\'s "daily energy need" field above.',
          'Appliance wattage varies enormously by type and size. EnergySage, in its guide to sizing a home battery, lists a representative spread: a 1,500 W dishwasher, a 3,000 W air conditioner, an 800 W refrigerator, and lights, WiFi and miscellaneous electronics together drawing around 1,000 W — a useful illustration of just how much more some loads draw than others, even before accounting for how many hours each one actually runs.'
        ]
      },
      howTo: {
        intro: 'Enter one appliance\'s wattage, how many hours a day it runs, and how many identical units you have.',
        steps: [
          { name: 'Enter the wattage', text: 'Check the appliance\'s nameplate, spec sheet or manual for its rated power draw in watts.' },
          { name: 'Enter hours used per day', text: 'Estimate how many hours a day it actually runs — not how many hours it is merely plugged in or on standby.' },
          { name: 'Enter the count', text: 'How many identical units you have running on that same schedule — leave it at 1 for a single appliance.' },
          { name: 'Read the result', text: 'The headline is the estimated monthly usage; the rows below show the daily and annual figures.' },
          { name: 'Repeat for each appliance type', text: 'Add the monthly figures from every appliance type together to build a full household estimate.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Energy is simply power times time, scaled by how many identical units there are.',
        expression: 'daily kWh = (wattage × hours per day × count) ÷ 1,000\nmonthly kWh = daily kWh × 30\nannual kWh = daily kWh × 365',
        terms: [
          { symbol: 'wattage', meaning: 'One appliance\'s rated power draw while running, in watts.' },
          { symbol: 'hours per day', meaning: 'How many hours a day it actually runs, not how long it is plugged in.' },
          { symbol: 'count', meaning: 'How many identical units are running on that same schedule.' }
        ],
        note: 'This estimates consumption (kWh), not cost — see the appliance energy cost calculator for a single device\'s running cost, or the electricity bill calculator for a whole bill including fixed charges. Many appliances (refrigerators, thermostats, anything with a compressor or a standby mode) do not draw their full rated wattage continuously, so "hours used per day" is really "hours of equivalent full-power use," which is usually lower than the hours the appliance is simply switched on.'
      },
      workedExample: {
        intro: 'One 1,200 W window air conditioner runs 8 hours a day.',
        rows: [
          { label: 'Daily usage (1,200 × 8 × 1 ÷ 1,000)', value: '9.6 kWh' },
          { label: 'Monthly usage (9.6 × 30)', value: '288 kWh' },
          { label: 'Annual usage (9.6 × 365)', value: '3,504 kWh' },
          { label: 'Share of EIA\'s average household\'s annual usage (3,504 ÷ 10,791)', value: '32.5%' }
        ],
        result: '9.6 kWh/day · 288 kWh/month · 3,504 kWh/year',
        explanation: 'Against the EIA\'s average U.S. household usage of 10,791 kWh a year, this one air conditioner alone accounts for about 32.5% of it — a reminder that a handful of high-wattage, long-running appliances usually dominate a home\'s electricity use far more than many small ones.'
      },
      watchOut: [
        { title: 'This is usage, not cost', body: 'Multiply the resulting kWh by your electricity rate yourself, or use the appliance energy cost calculator (single device) or the electricity bill calculator (whole bill, with fixed charges) instead.' },
        { title: 'Real appliances rarely draw full wattage the whole time', body: 'A refrigerator\'s compressor cycles on and off; a thermostat-controlled appliance only draws power while actively heating or cooling. "Hours per day" here means hours of equivalent full-power draw, which is often less than the hours the appliance is simply on.' },
        { title: 'Nameplate wattage is a maximum, not always the running draw', body: 'Some appliances list a nameplate or startup wattage well above what they draw during normal, steady running. Where you have one, use a measured or manufacturer-stated typical running wattage instead.' },
        { title: 'Add every appliance type for a full household estimate', body: 'This calculator covers one appliance type (and its count) at a time. A full home estimate means repeating this for every major appliance and adding the monthly figures together.' }
      ],
      references: [
        { label: 'U.S. Energy Information Administration, Energy Explained — Units and Calculators (kWh/Btu conversion)', url: 'https://www.eia.gov/energyexplained/units-and-calculators/' },
        { label: 'U.S. Energy Information Administration, FAQ — How much electricity does an American home use?', url: 'https://www.eia.gov/tools/faqs/faq.php?id=97&t=3' },
        { label: 'EnergySage, "How Many Solar Batteries Do You Need for Backup Power?" (representative appliance wattages)', url: 'https://www.energysage.com/energy-storage/how-many-solar-batteries-needed/' }
      ]
    },
    inputs: [
      { id: 'wattage', label: 'Appliance wattage', type: 'number', placeholder: '1200', defaultValue: 1200, step: 10, min: 0, dimension: 'power', unit: 'W' },
      { id: 'hoursPerDay', label: 'Hours used per day', type: 'number', placeholder: '8', defaultValue: 8, step: 0.5, min: 0 },
      { id: 'count', label: 'Number of identical units', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 }
    ],
    seo: {
      title: 'Home Electricity Consumption Calculator – kWh/Month',
      description: 'Estimate the kWh a group of identical appliances uses per day, month and year, from wattage, hours used per day and how many you have.',
      faq: [
        { question: 'How do I calculate an appliance\'s electricity usage?', answer: 'Multiply its wattage by the hours it runs per day, then divide by 1,000 for kWh. A 1,200 W appliance running 8 hours a day uses 9.6 kWh that day — 288 kWh over a 30-day month.' },
        { question: 'How much of a home\'s electricity use can one appliance account for?', answer: 'It depends entirely on the appliance and how long it runs. In this calculator\'s worked example, one 1,200 W air conditioner running 8 hours a day uses about 3,504 kWh a year — roughly 32.5% of the EIA\'s average U.S. household\'s total annual usage, 10,791 kWh.' },
        { question: 'Is this the same as my electricity bill\'s cost?', answer: 'No — this estimates energy used (kWh) only. Multiply the result by your electricity rate for a rough cost, or use the appliance energy cost calculator (one device) or the electricity bill calculator (a whole bill, with fixed charges) instead.' },
        { question: 'What wattage should I use for an appliance I own?', answer: 'Check its nameplate, spec sheet or manual. If it lists a range or a startup wattage well above its steady running draw, use the typical running figure where one is given.' },
        { question: 'Why might my result overestimate real usage?', answer: 'Many appliances cycle on and off (a refrigerator\'s compressor) or only draw full power part of the time (anything thermostat-controlled). "Hours used per day" should reflect hours of equivalent full-power draw, which is often less than hours simply switched on.' },
        { question: 'How do I estimate my whole home\'s electricity use?', answer: 'Run this calculator once per major appliance type (with its own wattage, daily hours and count), then add the monthly kWh figures together.' }
      ]
    },
    compute(values) {
      const dailyKwh = (values.wattage * values.hoursPerDay * values.count) / 1000;
      const monthlyKwh = dailyKwh * 30;
      const annualKwh = dailyKwh * 365;
      return { dailyKwh, monthlyKwh, annualKwh };
    }
  },
  {
    id: 'appliance-energy-cost-calculator',
    category: 'solar',
    group: 'Storage & Consumption',
    glyph: '$/d',
    updatedAt: '2026-11-18',
    aliases: ['single appliance cost calculator', 'how much does it cost to run this appliance', 'cost to run an appliance calculator', 'electricity cost per appliance calculator', 'appliance operating cost calculator'],
    related: ['home-electricity-consumption-calculator', 'electricity-bill-calculator', 'solar-savings-calculator', 'solar-panel-system-size-calculator'],
    title: 'Appliance Energy Cost Calculator',
    description: 'Find what a single appliance costs to run per day, month and year, from its wattage, hours used per day and your electricity rate.',
    example: 'A 1,500 W dishwasher run 1 hour a day at $0.1831/kWh costs about $0.27 that day, $8.24 a month and $100.25 a year — 30 times as much as a 10 W LED bulb run 5 hours a day on the same rate.',
    breakdown: {
      headline: 'monthlyCost',
      headlineLabel: 'Estimated monthly cost',
      outputs: [
        { id: 'monthlyCost', label: 'Estimated monthly cost', format: 'currency' },
        { id: 'dailyCost', label: 'Estimated daily cost', format: 'currency' },
        { id: 'annualCost', label: 'Estimated annual cost', format: 'currency' },
        { id: 'dailyKwh', label: 'Energy used per day', format: 'number', dimension: 'energy', unit: 'kWh' }
      ],
      groups: [
        { title: 'Appliance', inputs: ['wattage', 'hoursPerDay'] },
        { title: 'Your rate', inputs: ['ratePerKwh'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'dailyCost', label: 'Per day' },
          { from: 'monthlyCost', label: 'Per month' }
        ],
        title: 'Daily vs. monthly running cost'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What one appliance actually costs to run',
        paragraphs: [
          'Running cost is energy used times price: wattage times hours used per day gives watt-hours, divided by 1,000 for kWh, times your electricity rate for a dollar figure. This is the same wattage-times-time relationship the home electricity consumption calculator above uses for a group of identical appliances, applied here to a single device and carried all the way through to a cost instead of stopping at kWh — the two calculators are complementary, not duplicates: one is about how much energy something uses, this one is about what that energy costs at your own rate.',
          'The gap between a high- and low-wattage appliance compounds through cost exactly as it does through energy. EnergySage\'s own example loads give a sense of the range: a 1,500 W dishwasher versus a 10 W LED bulb are 150 times apart in wattage alone. Run the dishwasher 1 hour a day and the bulb 5 hours a day, and the dishwasher still costs 30 times as much to run per year — long hours on a very low-wattage device rarely catches up to even brief use of a high-wattage one.',
          'Electricity rates vary enormously by location, which this calculator\'s rate field accounts for directly. The U.S. Energy Information Administration\'s Electric Power Monthly put the national residential average at 18.31 cents per kWh in July 2026 — this calculator\'s default — while state averages that same month ranged from 13.41 cents in North Dakota to 48.00 cents in Hawaii, more than a 3.5x spread for running the exact same appliance.'
        ]
      },
      howTo: {
        intro: 'Enter the appliance\'s wattage, how many hours a day it runs, and your electricity rate.',
        steps: [
          { name: 'Enter the wattage', text: 'Check the appliance\'s nameplate, spec sheet or manual for its rated power draw in watts.' },
          { name: 'Enter hours used per day', text: 'Estimate how many hours a day it actually runs at that draw, not how many hours it is simply plugged in.' },
          { name: 'Enter your electricity rate', text: 'Use the per-kWh rate from a recent utility bill, not a national average, for an accurate figure.' },
          { name: 'Read the result', text: 'The headline is the estimated monthly cost; the rows below show the daily and annual figures and the energy used per day.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Cost is energy used times rate; energy used is simply power times time.',
        expression: 'daily kWh = (wattage × hours per day) ÷ 1,000\ndaily cost = daily kWh × rate\nmonthly cost = daily cost × 30\nannual cost = daily cost × 365',
        terms: [
          { symbol: 'wattage', meaning: 'The appliance\'s rated power draw while running, in watts.' },
          { symbol: 'hours per day', meaning: 'How many hours a day it actually runs at that draw.' },
          { symbol: 'rate', meaning: 'Your electricity price per kWh.' }
        ],
        note: 'This estimates one appliance\'s own running cost only — it does not include a utility\'s fixed monthly charges, which the electricity bill calculator accounts for. Many appliances don\'t draw their full rated wattage the whole time they are switched on, so "hours used per day" should reflect hours of equivalent full-power draw.'
      },
      workedExample: {
        intro: 'A 1,500 W dishwasher runs 1 hour a day, at a $0.1831/kWh electricity rate.',
        rows: [
          { label: 'Daily energy (1,500 × 1 ÷ 1,000)', value: '1.5 kWh' },
          { label: 'Daily cost (1.5 × $0.1831)', value: '$0.27' },
          { label: 'Monthly cost (0.27465 × 30)', value: '$8.24' },
          { label: 'Annual cost (0.27465 × 365)', value: '$100.25' }
        ],
        result: '$0.27/day · $8.24/month · $100.25/year',
        explanation: 'A 10 W LED bulb run 5 hours a day on the same $0.1831/kWh rate costs only about $3.34 a year — the dishwasher, despite running just 1 hour a day against the bulb\'s 5, still costs exactly 30 times as much annually, because its wattage is 150 times higher and only a third of that gap is clawed back by the bulb\'s longer daily runtime.'
      },
      watchOut: [
        { title: 'This is one device, not a whole bill', body: 'Real bills add fixed monthly charges (customer, meter, delivery) that don\'t scale with any one appliance\'s usage — see the electricity bill calculator for that fuller picture.' },
        { title: 'Nameplate wattage can overstate actual running draw', body: 'Some appliances list a maximum or startup wattage above what they draw during steady, normal running. Use a measured or manufacturer-stated typical running wattage where you have one.' },
        { title: 'Cycling appliances need an "equivalent full-power" hours estimate', body: 'A refrigerator or anything thermostat-controlled doesn\'t draw its full wattage continuously. "Hours used per day" should reflect hours of equivalent full-power draw, which is usually less than hours simply switched on.' },
        { title: 'Electricity rates vary a lot by location', body: 'EIA\'s July 2026 data put the national residential average at 18.31 cents per kWh, ranging from 13.41 cents in North Dakota to 48.00 cents in Hawaii. Use your own bill\'s rate, not a national figure, for an accurate cost.' }
      ],
      references: [
        { label: 'U.S. Energy Information Administration, Electric Power Monthly, Table 5.6.A (residential rates by state)', url: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=table_5_06_a' },
        { label: 'U.S. Energy Information Administration, Energy Explained — Units and Calculators (kWh conversion)', url: 'https://www.eia.gov/energyexplained/units-and-calculators/' },
        { label: 'EnergySage, "How Many Solar Batteries Do You Need for Backup Power?" (representative appliance wattages)', url: 'https://www.energysage.com/energy-storage/how-many-solar-batteries-needed/' }
      ]
    },
    inputs: [
      { id: 'wattage', label: 'Appliance wattage', type: 'number', placeholder: '1500', defaultValue: 1500, step: 10, min: 0, dimension: 'power', unit: 'W' },
      { id: 'hoursPerDay', label: 'Hours used per day', type: 'number', placeholder: '1', defaultValue: 1, step: 0.5, min: 0 },
      { id: 'ratePerKwh', label: 'Electricity rate', type: 'currency', placeholder: '0.1831', defaultValue: 0.1831, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Appliance Energy Cost Calculator – Daily & Monthly',
      description: 'Find what a single appliance costs to run per day, month and year, from its wattage, hours used per day and your electricity rate.',
      faq: [
        { question: 'How do I calculate what an appliance costs to run?', answer: 'Multiply its wattage by hours used per day, divide by 1,000 for kWh, then multiply by your electricity rate. A 1,500 W dishwasher run 1 hour a day at $0.1831/kWh costs about $0.27 a day.' },
        { question: 'How much more does a high-wattage appliance cost than a low-wattage one?', answer: 'In this calculator\'s worked example, a 1,500 W dishwasher run 1 hour a day costs 30 times as much per year as a 10 W LED bulb run 5 hours a day — wattage usually dominates cost far more than how many hours a low-power device runs.' },
        { question: 'Does this include my utility\'s fixed charges?', answer: 'No — this is one appliance\'s running cost only. Use the electricity bill calculator for a full bill estimate that includes fixed monthly charges.' },
        { question: 'What electricity rate should I use?', answer: 'The per-kWh rate from your own utility bill. This calculator defaults to 18.31 cents per kWh, the EIA\'s July 2026 U.S. residential average, but EIA\'s own data shows state averages ranging from 13.41 cents to 48.00 cents — use your own bill\'s rate for an accurate figure.' },
        { question: 'How do I find an appliance\'s wattage?', answer: 'Check its nameplate, spec sheet or manual. If it lists a maximum or startup wattage well above its steady running draw, use a typical running figure instead where one is given.' },
        { question: 'How is this different from the home electricity consumption calculator?', answer: 'That calculator estimates kWh used by one or more identical appliances, without a cost attached. This one takes a single appliance all the way through to a dollar cost at your own electricity rate.' }
      ]
    },
    compute(values) {
      const dailyKwh = (values.wattage * values.hoursPerDay) / 1000;
      const dailyCost = dailyKwh * values.ratePerKwh;
      const monthlyCost = dailyCost * 30;
      const annualCost = dailyCost * 365;
      return { dailyCost, monthlyCost, annualCost, dailyKwh };
    }
  },
  {
    id: 'heat-pump-savings-calculator',
    category: 'solar',
    group: 'Storage & Consumption',
    glyph: 'COP',
    updatedAt: '2026-11-18',
    aliases: ['heat pump vs furnace savings calculator', 'switching to a heat pump savings calculator', 'heat pump cost savings estimator', 'heat pump vs gas furnace calculator', 'how much does a heat pump save'],
    related: ['ac-tonnage-btu-calculator', 'electricity-bill-calculator', 'solar-savings-calculator', 'appliance-energy-cost-calculator'],
    title: 'Heat Pump Savings Calculator',
    description: 'Estimate the annual savings from switching a home\'s heating from a furnace or electric resistance heat to a heat pump, from your current fuel use, efficiency and price, and the heat pump\'s COP.',
    example: 'A home burning 600 therms a year in an 80%-efficient gas furnace at $2.61/therm, switching to a heat pump with a COP of 3 and $0.1831/kWh electricity, saves about $707.38 a year — 45.2% less than its current $1,566.00 heating cost.',
    breakdown: {
      headline: 'annualSavings',
      headlineLabel: 'Estimated annual savings',
      outputs: [
        { id: 'annualSavings', label: 'Estimated annual savings', format: 'currency' },
        { id: 'currentAnnualCost', label: 'Current annual heating cost', format: 'currency' },
        { id: 'heatPumpAnnualCost', label: 'Estimated heat pump annual cost', format: 'currency' },
        { id: 'percentSavings', label: 'Percent savings vs. current system', format: 'percent' },
        { id: 'heatPumpKwhNeeded', label: 'Electricity the heat pump would use', format: 'number', dimension: 'energy', unit: 'kWh' }
      ],
      groups: [
        { title: 'Your current heating system', inputs: ['fuelType', 'annualFuelUsed', 'currentEfficiencyPercent', 'currentFuelPricePerUnit'] },
        { title: 'The heat pump', inputs: ['heatPumpCop', 'electricityRate'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'currentAnnualCost', label: 'Current system' },
          { from: 'heatPumpAnnualCost', label: 'Heat pump' }
        ],
        title: 'Current annual heating cost vs. estimated heat pump cost'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why a heat pump can cost less to run than a furnace',
        paragraphs: [
          'A furnace burns fuel to make heat directly, so its efficiency (AFUE) can never exceed 100% — some energy is always lost up the flue. ENERGY STAR describes a heat pump completely differently: rather than generating heat, it moves existing heat from outside air into the home, which is why ENERGY STAR states "an ASHP is so efficient that it can deliver up to three times more heat energy to a home than the electrical energy it consumes." That ratio — heat delivered divided by electricity consumed — is a heat pump\'s coefficient of performance (COP). A COP of 3 means every unit of electricity moves three units of heat; a COP of 2 in a colder climate still beats the COP of 1 that a plain electric-resistance heater is stuck with, since resistance heat simply converts electricity straight to heat with none of the "borrowing" a heat pump does.',
          'Comparing a heat pump against a furnace means converting both into the same units. A furnace\'s useful heat output is fuel used × the fuel\'s heat content × its AFUE efficiency; a heat pump\'s electricity use is that same useful heat divided by (COP × 3,412, the Btu in one kWh, from the U.S. Energy Information Administration\'s own unit conversions). This calculator runs exactly that comparison for natural gas, heating oil, propane or electric resistance heat, using EIA\'s published heat-content figures for each: 100,000 Btu/therm for natural gas, 138,500 Btu/gallon for heating oil, 91,452 Btu/gallon for propane, and 3,412 Btu/kWh for electricity.',
          'Real seasonal COP varies a great deal with outdoor temperature — ENERGY STAR\'s "up to three times" is an upper bound, not a guarantee, and colder climates generally see lower average COP across a full heating season than mild ones. The federal 30% (up to $2,000) tax credit for ENERGY STAR certified heat pumps that ENERGY STAR itself cites also only ran "through December 31, 2025," so don\'t add it to a 2026 installation without checking for a current state or utility incentive instead.'
        ]
      },
      howTo: {
        intro: 'Enter your current heating fuel, usage, efficiency and price, then the heat pump\'s COP and your electricity rate.',
        steps: [
          { name: 'Choose your current fuel type', text: 'Natural gas, heating oil, propane, or electric resistance heat — this sets the heat-content conversion used.' },
          { name: 'Enter your annual fuel used', text: 'In the fuel\'s own billing unit: therms for gas, gallons for oil or propane, kWh for electric resistance.' },
          { name: 'Enter your system\'s efficiency', text: 'Your furnace\'s AFUE from its nameplate or the ENERGY STAR product directory; electric resistance heat is effectively 100%.' },
          { name: 'Enter your current fuel price', text: 'Per therm, gallon or kWh, matching the unit you used for annual fuel used.' },
          { name: 'Enter the heat pump\'s COP and your electricity rate', text: 'Use the equipment\'s rated or seasonal-average COP if you have one; otherwise 2–3.5 is a realistic range to test.' },
          { name: 'Read the result', text: 'The headline is the estimated annual savings; the rows below show both systems\' annual cost, the percent savings and the electricity the heat pump would use.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Both systems are converted to the same useful heat output (Btu), then priced at each system\'s own energy cost.',
        expression: 'useful heat (Btu) = fuel used × heat content × (current efficiency% ÷ 100)\ncurrent annual cost = fuel used × fuel price\nheat pump kWh = useful heat ÷ (COP × 3,412)\nheat pump annual cost = heat pump kWh × electricity rate\nannual savings = current annual cost − heat pump annual cost',
        terms: [
          { symbol: 'heat content', meaning: 'Btu per unit of fuel: 100,000/therm (gas), 138,500/gallon (oil), 91,452/gallon (propane), 3,412/kWh (electric resistance) — EIA\'s published figures.' },
          { symbol: 'current efficiency%', meaning: 'Your current system\'s AFUE (furnace) or effective efficiency (100% for electric resistance).' },
          { symbol: 'COP', meaning: 'The heat pump\'s coefficient of performance: heat delivered per unit of electricity consumed. ENERGY STAR states certified heat pumps can reach "up to three times" (COP ≈ 3).' },
          { symbol: '3,412', meaning: 'Btu in one kWh — the U.S. Energy Information Administration\'s own conversion factor.' }
        ],
        note: 'Estimates only. Real seasonal COP varies with outdoor temperature and falls in very cold weather; use a seasonal-average figure, not a single best-case rating, for a realistic comparison. This does not model cooling-season costs, equipment or installation costs, or any incentive — the federal heat pump tax credit ENERGY STAR cites ended for property placed in service after December 31, 2025.'
      },
      workedExample: {
        intro: 'A home burns 600 therms of natural gas a year in an 80%-AFUE furnace, at $2.61 per therm. Switching to a heat pump with a COP of 3, on $0.1831/kWh electricity.',
        rows: [
          { label: 'Useful heat (600 × 100,000 × 0.80)', value: '48,000,000 Btu' },
          { label: 'Current annual cost (600 × $2.61)', value: '$1,566.00' },
          { label: 'Heat pump electricity (48,000,000 ÷ (3 × 3,412))', value: '4,689.33 kWh' },
          { label: 'Heat pump annual cost (4,689.33 × $0.1831)', value: '$858.62' },
          { label: 'Annual savings (1,566.00 − 858.62)', value: '$707.38' },
          { label: 'Percent savings (707.38 ÷ 1,566.00)', value: '45.2%' }
        ],
        result: '≈ $707.38 a year saved (45.2% less than the current $1,566.00)',
        explanation: 'At a more conservative, cold-climate COP of 2 instead of 3, the same furnace comparison saves only about $278.08 a year (17.8%) — COP has a bigger effect on the result than almost any other input, which is exactly why ENERGY STAR\'s "up to three times" should be treated as a ceiling, not a seasonal average.'
      },
      watchOut: [
        { title: 'COP drives the result more than anything else', body: 'Dropping from a COP of 3 to a more conservative, cold-climate COP of 2 in the worked example above cuts estimated savings from $707.38 to $278.08 a year — more than half. Use a seasonal-average COP for your climate, not a best-case nameplate figure.' },
        { title: 'The federal tax credit ENERGY STAR mentions has expired for new installs', body: 'ENERGY STAR itself states the credit was "a tax credit of 30% up to $2000" available only "through December 31, 2025." Don\'t add it to a 2026 cost comparison — check instead for a current state or utility incentive.' },
        { title: 'This compares heating costs only', body: 'A heat pump also cools in summer, replacing a separate air conditioner — this calculator does not model cooling-season costs or compare against a combined furnace-plus-AC setup. Use the AC tonnage/BTU calculator separately for cooling-capacity sizing.' },
        { title: 'Equipment and installation costs aren\'t included', body: 'This is a running-cost comparison only. The heat pump\'s purchase and installation price, any electrical panel upgrade it needs, and your furnace\'s own remaining useful life all affect whether switching makes sense beyond the operating-cost savings shown here.' }
      ],
      references: [
        { label: 'ENERGY STAR, Air-Source Heat Pumps product page ("up to three times more heat energy," federal tax credit window)', url: 'https://www.energystar.gov/products/air_source_heat_pumps' },
        { label: 'U.S. Energy Information Administration, Energy Explained — Units and Calculators (Btu content of natural gas, heating oil, propane and electricity)', url: 'https://www.eia.gov/energyexplained/units-and-calculators/' },
        { label: 'U.S. Energy Information Administration, Natural Gas — Residential Price (Mcf), used to derive the default $/therm price', url: 'https://www.eia.gov/dnav/ng/ng_pri_sum_a_EPG0_PRS_DMcf_m.htm' }
      ]
    },
    inputs: [
      {
        id: 'fuelType',
        label: 'Current heating fuel',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 1,
        options: [
          { value: 1, label: 'Natural gas (therms)' },
          { value: 2, label: 'Heating oil (gallons)' },
          { value: 3, label: 'Propane (gallons)' },
          { value: 4, label: 'Electric resistance heat (kWh)' }
        ]
      },
      { id: 'annualFuelUsed', label: 'Annual fuel used (unit matches fuel above)', type: 'number', placeholder: '600', defaultValue: 600, step: 10, min: 0 },
      { id: 'currentEfficiencyPercent', label: 'Current system efficiency (AFUE)', type: 'percent', placeholder: '80', defaultValue: 80, step: 1, min: 0 },
      { id: 'currentFuelPricePerUnit', label: 'Current fuel price (per unit above)', type: 'currency', placeholder: '2.61', defaultValue: 2.61, step: 0.01, min: 0 },
      { id: 'heatPumpCop', label: 'Heat pump coefficient of performance (COP)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, min: 0.1 },
      { id: 'electricityRate', label: 'Electricity rate', type: 'currency', placeholder: '0.1831', defaultValue: 0.1831, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Heat Pump Savings Calculator – vs. Furnace or Resistance',
      description: 'Estimate the annual savings from switching a home\'s heating to a heat pump, from your current fuel use, efficiency and price, and the heat pump\'s COP.',
      faq: [
        { question: 'How much can a heat pump save compared to a gas furnace?', answer: 'It depends heavily on fuel price, furnace efficiency and the heat pump\'s COP. In this calculator\'s worked example — 600 therms a year at 80% AFUE and $2.61/therm, switching to a COP-3 heat pump — about $707.38 a year, 45.2% less than the current $1,566.00 cost.' },
        { question: 'What is a heat pump\'s COP?', answer: 'Coefficient of performance: the ratio of heat delivered to electricity consumed. ENERGY STAR states a heat pump "can deliver up to three times more heat energy to a home than the electrical energy it consumes" — a COP of up to 3.' },
        { question: 'Why does COP matter so much to the savings estimate?', answer: 'Because it is the main driver of the comparison. Dropping from a COP of 3 to a more conservative COP of 2 in this calculator\'s worked example cuts the estimated savings from $707.38 to $278.08 a year — more than half.' },
        { question: 'Is the federal heat pump tax credit still available in 2026?', answer: 'No. ENERGY STAR itself describes it as "a tax credit of 30% up to $2000" available only "through December 31, 2025." Check for a current state or utility incentive instead of assuming a federal credit applies to a 2026 installation.' },
        { question: 'Does this calculator include air conditioning costs?', answer: 'No — it compares heating costs only. A heat pump also provides cooling, replacing a separate air conditioner, but this calculator does not model cooling-season costs or sizing; see the AC tonnage/BTU calculator for cooling-capacity sizing.' },
        { question: 'How are different heating fuels compared on the same basis?', answer: 'By converting each to Btu using EIA\'s published heat-content figures (100,000 Btu/therm for gas, 138,500 Btu/gallon for oil, 91,452 Btu/gallon for propane, 3,412 Btu/kWh for electricity), then applying each system\'s own efficiency or COP.' }
      ]
    },
    compute(values) {
      const HEAT_CONTENT_BTU: Record<number, number> = { 1: 100000, 2: 138500, 3: 91452, 4: 3412 };
      const heatContent = HEAT_CONTENT_BTU[values.fuelType] ?? HEAT_CONTENT_BTU[1];
      const usefulHeatBtu = values.annualFuelUsed * heatContent * (values.currentEfficiencyPercent / 100);
      const currentAnnualCost = values.annualFuelUsed * values.currentFuelPricePerUnit;
      const heatPumpKwhNeeded = values.heatPumpCop > 0 ? usefulHeatBtu / (values.heatPumpCop * 3412) : NaN;
      const heatPumpAnnualCost = heatPumpKwhNeeded * values.electricityRate;
      const annualSavings = currentAnnualCost - heatPumpAnnualCost;
      const percentSavings = currentAnnualCost > 0 ? (annualSavings / currentAnnualCost) * 100 : NaN;
      return { annualSavings, currentAnnualCost, heatPumpAnnualCost, percentSavings, heatPumpKwhNeeded };
    }
  },
  {
    id: 'led-lighting-savings-calculator',
    category: 'solar',
    group: 'Everyday Efficiency',
    glyph: 'LED',
    updatedAt: '2026-11-18',
    aliases: ['led bulb savings calculator', 'led light bulb savings calculator', 'how much does led lighting save', 'incandescent to led savings calculator', 'light bulb energy savings calculator'],
    related: ['electricity-bill-calculator', 'home-electricity-consumption-calculator', 'appliance-energy-cost-calculator', 'smart-thermostat-savings-calculator'],
    title: 'LED Lighting Savings Calculator',
    description: 'Estimate the annual energy savings from swapping incandescent or CFL bulbs for LEDs, from the wattage difference, bulb count, daily hours of use and your electricity rate.',
    example: 'Replacing 5 bulbs — a 60 W incandescent swapped for a 9 W LED — run 3 hours a day at $0.1831/kWh saves about $51.13 a year, an 85% cut in lighting wattage.',
    breakdown: {
      headline: 'annualSavings',
      headlineLabel: 'Estimated annual savings',
      outputs: [
        { id: 'annualSavings', label: 'Estimated annual savings', format: 'currency' },
        { id: 'oldAnnualCost', label: 'Annual cost — old bulbs', format: 'currency' },
        { id: 'newAnnualCost', label: 'Annual cost — LED bulbs', format: 'currency' },
        { id: 'percentReduction', label: 'Wattage reduction', format: 'percent' },
        { id: 'totalKwhSaved', label: 'Energy saved per year', format: 'number', dimension: 'energy', unit: 'kWh' }
      ],
      groups: [
        { title: 'Bulbs being replaced', inputs: ['oldWattage', 'newWattage', 'bulbCount'] },
        { title: 'Usage & rate', inputs: ['hoursPerDay', 'electricityRate'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'oldAnnualCost', label: 'Old bulbs' },
          { from: 'newAnnualCost', label: 'LED bulbs' }
        ],
        title: 'Annual lighting cost, old bulbs vs. LED'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'How much LED bulbs actually save',
        paragraphs: [
          'A bulb\'s wattage is how much power it draws, not how bright it is — lumens measure brightness, and ENERGY STAR\'s own brightness guide publishes the old incandescent-wattage-to-lumens pairing most shoppers still think in: a 40 W bulb puts out a minimum of 450 lumens, 60 W puts out 800, 75 W puts out 1,100, 100 W puts out 1,600, and 150 W puts out 2,600. LEDs reach the same lumen output using a fraction of the wattage because, per ENERGY STAR, "LED lighting products produce light up to 90% more efficiently than incandescent light bulbs" — almost all of an incandescent bulb\'s energy escapes as heat, not light.',
          'There is no single official LED-wattage-equivalence table the way there is for lumens, because the exact wattage an LED needs to match a given incandescent depends on the manufacturer. Wikipedia\'s own cost-comparison table for a 60 W incandescent bulb (860 lumens) lists real LED replacements ranging from about 4 W to 14 W depending on the product, with roughly 6–9 W models landing closest to the original 860-lumen output — this calculator asks for the actual wattage printed on both the old bulb and its LED replacement rather than assuming one fixed ratio.',
          'The savings scale directly with how many bulbs are swapped and how long they run: ENERGY STAR estimates that switching just "your home\'s five most frequently used light fixtures or the bulbs in them" to ENERGY STAR certified LEDs saves "about $40 a year," a figure in the same range this calculator reaches at typical household lighting hours. Running the same bulbs more hours a day, or swapping more of them, raises the total; see the electricity bill estimator for how this fits into a whole month\'s usage.'
        ]
      },
      howTo: {
        intro: 'Enter the old and new bulb wattages, how many bulbs and how long they run each day, and your electricity rate.',
        steps: [
          { name: 'Enter the old bulb\'s wattage', text: 'Read it off the bulb or its packaging — common incandescent sizes are 40, 60, 75 and 100 W.' },
          { name: 'Enter the LED replacement\'s wattage', text: 'Read it off the LED\'s packaging, which lists both its own wattage and the incandescent wattage it replaces.' },
          { name: 'Enter how many bulbs you are replacing', text: 'Count every fixture getting the same swap — ENERGY STAR\'s own example uses a home\'s five most-used fixtures.' },
          { name: 'Enter hours of use and your electricity rate', text: 'Use your own typical daily hours per bulb and the per-kWh rate from a recent bill.' },
          { name: 'Read the result', text: 'The headline is the estimated annual savings; the rows below show the before/after cost, the wattage cut and the total energy saved.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The wattage difference, multiplied by bulb count and hours of use, gives the energy saved; multiplying that by the electricity rate gives the dollar savings.',
        expression: 'watts saved per bulb = old wattage − new wattage\nkWh saved per year = watts saved × bulb count × hours/day × 365 ÷ 1,000\nannual savings = kWh saved × electricity rate\n% wattage reduction = watts saved ÷ old wattage × 100',
        terms: [
          { symbol: 'old wattage, new wattage', meaning: 'The wattage printed on the bulb being replaced and on its LED replacement.' },
          { symbol: 'bulb count', meaning: 'How many fixtures are getting this same swap.' },
          { symbol: 'hours/day', meaning: 'How long those bulbs typically run in a day.' }
        ],
        note: 'An estimate. It compares the two wattages you enter directly rather than assuming a single universal incandescent-to-LED ratio, since real LED replacements for the same brightness vary by manufacturer.'
      },
      workedExample: {
        intro: 'Five fixtures, each swapped from a 60 W incandescent to a 9 W LED, running 3 hours a day at $0.1831 per kWh.',
        rows: [
          { label: 'Watts saved per bulb (60 − 9)', value: '51 W' },
          { label: 'Annual hours per bulb (3 × 365)', value: '1,095 hours' },
          { label: 'kWh saved per year (51 × 5 × 1,095 ÷ 1,000)', value: '279.225 kWh' },
          { label: 'Old annual cost (60 × 5 × 1,095 ÷ 1,000 × $0.1831)', value: '$60.15' },
          { label: 'New (LED) annual cost (9 × 5 × 1,095 ÷ 1,000 × $0.1831)', value: '$9.02' },
          { label: 'Annual savings (60.15 − 9.02)', value: '$51.13' }
        ],
        result: '$51.13 a year · 85% less lighting wattage',
        explanation: 'The 85% wattage cut (51 ÷ 60) is close to ENERGY STAR\'s own "up to 90% less energy" figure for LEDs generally; the small gap is because 9 W is one specific real LED wattage for a 60 W-equivalent bulb, not the absolute minimum any manufacturer sells. The $51.13 result sits a bit above ENERGY STAR\'s own "about $40 a year" example for five fixtures, which assumes different hours of use and electricity rate than this worked example\'s own inputs.'
      },
      watchOut: [
        { title: 'There is no single LED-wattage ratio', body: 'Wikipedia\'s own comparison for one common 60 W/860-lumen incandescent bulb lists real LED replacements from about 4 W to 14 W depending on manufacturer — read the actual wattage off the packaging rather than assuming a fixed percentage cut.' },
        { title: 'Hours of use drive the dollar figure as much as wattage does', body: 'A bulb that is rarely on saves little no matter how big the wattage gap is; a hallway or porch light left on for hours every day saves far more than the same swap on a closet bulb.' },
        { title: 'This models one wattage swap at a time', body: 'A home usually has several different bulb types. Run this calculator once per wattage pairing (or set the bulb count to all the fixtures sharing that exact pairing) rather than averaging different swaps together.' },
        { title: 'LEDs also cut replacement-bulb spending', body: 'ENERGY STAR states LEDs "last 15 times longer than standard bulbs" — a real additional saving on bulb purchases this calculator does not add in, since it estimates energy cost only.' }
      ],
      references: [
        { label: 'ENERGY STAR, Low- to No-Cost Tips for Saving Energy at Home (90% less energy, ~$40/yr for 5 fixtures, 15× lifespan)', url: 'https://www.energystar.gov/products/recent_program_updates/low-no-cost-tips' },
        { label: 'ENERGY STAR, Light Bulbs — Learn About Brightness (incandescent-wattage-to-lumens table)', url: 'https://www.energystar.gov/products/light_bulbs/learn-about-brightness' },
        { label: 'Wikipedia, "LED lamp" (60 W-equivalent LED wattage range, cost comparison)', url: 'https://en.wikipedia.org/wiki/LED_lamp' }
      ]
    },
    inputs: [
      { id: 'oldWattage', label: 'Old bulb wattage', type: 'number', placeholder: '60', defaultValue: 60, step: 1, min: 1 },
      { id: 'newWattage', label: 'LED replacement wattage', type: 'number', placeholder: '9', defaultValue: 9, step: 0.5, min: 0.1 },
      { id: 'bulbCount', label: 'Number of bulbs replaced', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 },
      { id: 'hoursPerDay', label: 'Hours used per day', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0.1 },
      { id: 'electricityRate', label: 'Electricity rate', type: 'currency', placeholder: '0.1831', defaultValue: 0.1831, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'LED Lighting Savings Calculator – Annual Energy Savings',
      description: 'Estimate the annual savings from switching bulbs to LED, from the wattage difference, bulb count, daily hours of use and your electricity rate.',
      faq: [
        { question: 'How much does switching to LED bulbs actually save?', answer: 'It depends on the wattage gap, how many bulbs, how long they run and your electricity rate. Replacing five 60 W incandescent bulbs with 9 W LEDs, run 3 hours a day at $0.1831/kWh, saves about $51.13 a year in this calculator\'s worked example.' },
        { question: 'Is there a standard incandescent-to-LED wattage conversion?', answer: 'No single official ratio exists — it varies by manufacturer. Wikipedia\'s own comparison for a 60 W/860-lumen incandescent bulb lists real LED replacements from about 4 W to 14 W. Use the wattage printed on your own bulbs rather than a fixed percentage.' },
        { question: 'How much more efficient is an LED than an incandescent bulb?', answer: 'ENERGY STAR states LEDs "produce light up to 90% more efficiently than incandescent light bulbs." This calculator\'s own 60 W-to-9 W worked example comes out to an 85% wattage cut, close to but not exactly that upper-bound figure.' },
        { question: 'How much does ENERGY STAR say LED bulbs save per year?', answer: 'ENERGY STAR estimates "about $40 a year" from switching a home\'s five most frequently used fixtures to certified LEDs — in the same range as, though not identical to, this calculator\'s own worked example, which uses different hours and a different rate.' },
        { question: 'Do LEDs save money beyond the electricity bill?', answer: 'Yes — ENERGY STAR states LEDs "last 15 times longer than standard bulbs," cutting how often bulbs need replacing. This calculator estimates energy cost savings only, not avoided bulb-purchase spending.' },
        { question: 'Does hotter or cooler light output change the savings?', answer: 'No — color temperature (warm vs. cool white) does not affect wattage or energy cost. Only the wattage printed on the bulb and how long it runs affect the result.' }
      ]
    },
    compute(values) {
      const annualHours = values.hoursPerDay * 365;
      const wattsSavedPerBulb = values.oldWattage - values.newWattage;
      const totalKwhSaved = (wattsSavedPerBulb * annualHours * values.bulbCount) / 1000;
      const annualSavings = totalKwhSaved * values.electricityRate;
      const percentReduction = values.oldWattage > 0 ? (wattsSavedPerBulb / values.oldWattage) * 100 : NaN;
      const oldAnnualCost = (values.oldWattage * values.bulbCount * annualHours * values.electricityRate) / 1000;
      const newAnnualCost = (values.newWattage * values.bulbCount * annualHours * values.electricityRate) / 1000;
      return { annualSavings, oldAnnualCost, newAnnualCost, percentReduction, totalKwhSaved };
    }
  },
  {
    id: 'smart-thermostat-savings-calculator',
    category: 'solar',
    group: 'Everyday Efficiency',
    glyph: '8%',
    updatedAt: '2026-11-18',
    aliases: ['smart thermostat savings calculator', 'nest thermostat savings calculator', 'how much does a smart thermostat save', 'programmable thermostat savings estimator', 'smart thermostat payback calculator'],
    related: ['heat-pump-savings-calculator', 'electricity-bill-calculator', 'home-electricity-consumption-calculator', 'ac-tonnage-btu-calculator'],
    title: 'Smart Thermostat Savings Calculator',
    description: 'Estimate the annual savings from a smart thermostat, using ENERGY STAR\'s published average heating-and-cooling savings percentage applied to your own heating and cooling cost.',
    example: 'A home spending $900 a year on heating and cooling saves about $72.00 a year — $6.00 a month — at ENERGY STAR\'s published 8% average smart-thermostat savings rate.',
    breakdown: {
      headline: 'annualSavings',
      headlineLabel: 'Estimated annual savings',
      outputs: [
        { id: 'annualSavings', label: 'Estimated annual savings', format: 'currency' },
        { id: 'newAnnualCost', label: 'Estimated new annual cost', format: 'currency' },
        { id: 'monthlySavings', label: 'Average savings per month', format: 'currency' }
      ],
      groups: [
        { title: 'Your heating & cooling cost', inputs: ['annualHeatingCoolingCost'] },
        { title: 'Savings rate', inputs: ['savingsPercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'annualHeatingCoolingCost', label: 'Before' },
          { from: 'newAnnualCost', label: 'After' }
        ],
        title: 'Heating & cooling cost, before vs. after'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What a smart thermostat actually saves',
        paragraphs: [
          'Heating and cooling is the single biggest piece of most home energy bills. ENERGY STAR states that "almost half of the annual energy bill goes to heating and cooling – that\'s more than $900 a year" for the average American household, which is why even a modest percentage improvement there is worth more than the same percentage saved elsewhere on the bill.',
          'ENERGY STAR\'s own published figure for its certified smart thermostats is specific: they "can reduce your heating and cooling bill by more than 8% and save you about $50 a year, on average," rising to "approximately $100 a year" in homes that are "unoccupied much of the day," since an empty house has the most room for an automated schedule to improve on a thermostat left at one setting around the clock. This calculator applies a savings percentage you choose to your own entered heating-and-cooling cost — at the default 8% and ENERGY STAR\'s own $900 baseline, that comes to $72.00, a bit above the "$50 a year" figure, because that example appears to assume a smaller heating-and-cooling bill than the full $900 average; the two ENERGY STAR figures describe different baselines, not a mismatch in this calculator\'s math.',
          'Most of a smart thermostat\'s saving comes from automatically setting back the temperature while a home is asleep or empty, something a basic non-programmable thermostat never does and a programmable one only does if someone keeps the schedule current. A household that was already diligent about manually adjusting its old thermostat will see less benefit than this average implies; one that never adjusted it at all may see more.'
        ]
      },
      howTo: {
        intro: 'Enter your heating-and-cooling cost and a savings percentage; the default matches ENERGY STAR\'s own published average.',
        steps: [
          { name: 'Enter your annual heating & cooling cost', text: 'Use your own figure if you know it, or ENERGY STAR\'s own cited average, "more than $900 a year," for a typical U.S. home.' },
          { name: 'Adjust the savings percentage, if you want', text: 'The default, 8%, is ENERGY STAR\'s own published average for its certified smart thermostats; try up to the "~11%" implied by its separate "$100 a year" figure for homes often empty during the day.' },
          { name: 'Read the result', text: 'The headline is the estimated annual savings; the rows below show the new estimated annual cost and the average monthly savings.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Annual savings is simply your heating-and-cooling cost multiplied by the savings percentage.',
        expression: 'annual savings = annual heating & cooling cost × savings % ÷ 100\nnew annual cost = annual heating & cooling cost − annual savings\nmonthly savings = annual savings ÷ 12',
        terms: [
          { symbol: 'savings %', meaning: 'ENERGY STAR\'s published average reduction from using a certified smart thermostat — "more than 8%" generally, published separately as up to "approximately $100 a year" for homes often empty during the day.' }
        ],
        note: 'An estimate using a published average percentage, not a measurement of your own home. Actual savings depend on your prior thermostat habits, climate, home insulation and how closely the smart thermostat\'s automated schedule matches when the home is actually occupied.'
      },
      workedExample: {
        intro: 'A home spends $900 a year on heating and cooling — ENERGY STAR\'s own cited average — and applies its published 8% average smart-thermostat savings rate.',
        rows: [
          { label: 'Annual savings ($900 × 8%)', value: '$72.00' },
          { label: 'New estimated annual cost ($900 − $72.00)', value: '$828.00' },
          { label: 'Average monthly savings ($72.00 ÷ 12)', value: '$6.00' }
        ],
        result: '$72.00 a year · $6.00 a month',
        explanation: 'ENERGY STAR\'s own separately published "about $50 a year" example implies a smaller baseline heating-and-cooling bill ($50 ÷ 8% = $625) than the $900 average it cites elsewhere — this worked example uses the $900 figure directly rather than reverse-engineering ENERGY STAR\'s unstated example baseline, which is why the two numbers do not match exactly.'
      },
      watchOut: [
        { title: 'ENERGY STAR cites two different baselines', body: 'Its "about $50 a year" savings example and its "more than $900 a year" average heating-and-cooling cost are not from the same stated baseline bill — applying 8% to $900 gives $72.00, not $50.00. Use your own actual heating-and-cooling cost for the most relevant result.' },
        { title: '8% is an average, not a guarantee', body: 'A household that already adjusted its old thermostat diligently by hand will typically see less than 8%; one that left a single setting running around the clock may see more.' },
        { title: 'Empty-home savings can run higher', body: 'ENERGY STAR cites "approximately $100 a year" for homes "unoccupied much of the day" — if that describes your household, the default 8% likely understates your real savings.' },
        { title: 'This is a cost-side estimate only', body: 'It does not size equipment or fuel-switch heating — see the AC tonnage/BTU calculator for cooling-capacity sizing and the heat pump savings calculator for a furnace-to-heat-pump comparison.' }
      ],
      references: [
        { label: 'ENERGY STAR, Smart Thermostats (8% / ~$50/yr average, ~$100/yr for often-empty homes)', url: 'https://www.energystar.gov/products/recent_program_updates/low-no-cost-tips' },
        { label: 'ENERGY STAR, Smart Thermostats product page ("almost half" of the energy bill, "more than $900 a year")', url: 'https://www.energystar.gov/products/smart_thermostats' }
      ]
    },
    inputs: [
      { id: 'annualHeatingCoolingCost', label: 'Annual heating & cooling cost', type: 'currency', placeholder: '900', defaultValue: 900, step: 25, min: 1 },
      { id: 'savingsPercent', label: 'Savings percentage', type: 'percent', placeholder: '8', defaultValue: 8, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'Smart Thermostat Savings Calculator – ENERGY STAR Rate',
      description: 'Estimate annual smart-thermostat savings from your heating and cooling cost and ENERGY STAR\'s published average savings percentage.',
      faq: [
        { question: 'How much does a smart thermostat really save?', answer: 'ENERGY STAR\'s own published average is "more than 8%" of a heating-and-cooling bill, about $50 a year on average, up to about $100 a year in homes often empty during the day. This calculator applies that percentage to your own entered cost.' },
        { question: 'Why doesn\'t 8% of $900 equal ENERGY STAR\'s own $50 example?', answer: 'Because ENERGY STAR\'s "$50 a year" example and its "more than $900 a year" average heating-and-cooling cost are not the same stated baseline — 8% of $900 is $72.00, not $50.00. This calculator uses the $900 figure directly as its default, not a baseline reverse-engineered from the $50 example.' },
        { question: 'Is 8% a guaranteed savings rate?', answer: 'No — it is ENERGY STAR\'s own published average across many homes. A household that already carefully managed its old thermostat may see less; one that never adjusted it, or one that is often empty, may see more.' },
        { question: 'What is the highest savings ENERGY STAR publishes?', answer: 'About $100 a year, for homes that are "unoccupied much of the day" — a separate figure from the general 8%/$50-average claim, reflecting how much more an automated schedule helps when nobody is home to adjust the thermostat manually.' },
        { question: 'Does this calculator size the thermostat or the HVAC system?', answer: 'No — it only estimates cost savings from a published percentage. See the AC tonnage/BTU calculator for cooling-capacity sizing.' },
        { question: 'Does a smart thermostat replace a heat pump or furnace upgrade?', answer: 'No — it is a scheduling and control upgrade to existing heating/cooling equipment. See the heat pump savings calculator for a comparison of switching the equipment itself.' }
      ]
    },
    compute(values) {
      const annualSavings = values.annualHeatingCoolingCost * (values.savingsPercent / 100);
      const newAnnualCost = values.annualHeatingCoolingCost - annualSavings;
      const monthlySavings = annualSavings / 12;
      return { annualSavings, newAnnualCost, monthlySavings };
    }
  },
  {
    id: 'water-heater-energy-cost-calculator',
    category: 'solar',
    group: 'Everyday Efficiency',
    glyph: 'H2O',
    updatedAt: '2026-11-18',
    aliases: ['water heater running cost calculator', 'gas vs electric water heater cost calculator', 'tankless water heater cost calculator', 'heat pump water heater savings calculator', 'hot water heating cost estimator'],
    related: ['heat-pump-savings-calculator', 'electricity-bill-calculator', 'home-electricity-consumption-calculator', 'appliance-energy-cost-calculator'],
    title: 'Water Heater Energy Cost Calculator',
    description: 'Compare the annual running cost of standard electric, standard gas, gas tankless and heat pump water heaters, from your hot water use and today\'s electricity and gas prices.',
    example: 'Heating 60 gallons a day from 50°F to 122°F costs about $739.28 a year with standard electric storage, $569.30 with standard gas storage, $379.54 with gas tankless, and $356.51 with a heat pump water heater — at $0.1831/kWh and $2.61/therm.',
    breakdown: {
      headline: 'electricStorageCost',
      headlineLabel: 'Annual cost — standard electric storage',
      outputs: [
        { id: 'electricStorageCost', label: 'Annual cost — standard electric storage', format: 'currency' },
        { id: 'gasStorageCost', label: 'Annual cost — standard gas storage', format: 'currency' },
        { id: 'gasTanklessCost', label: 'Annual cost — gas tankless', format: 'currency' },
        { id: 'heatPumpCost', label: 'Annual cost — heat pump water heater', format: 'currency' },
        { id: 'heatPumpVsElectricSavings', label: 'Heat pump savings vs. electric storage', format: 'currency' }
      ],
      groups: [
        { title: 'Hot water use', inputs: ['gallonsPerDay', 'incomingTempF', 'setpointTempF'] },
        { title: 'Fuel prices', inputs: ['electricityRate', 'gasPricePerTherm'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'electricStorageCost', label: 'Electric storage' },
          { from: 'gasStorageCost', label: 'Gas storage' },
          { from: 'gasTanklessCost', label: 'Gas tankless' },
          { from: 'heatPumpCost', label: 'Heat pump' }
        ],
        title: 'Annual water-heating cost by type'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Comparing water heaters on running cost',
        paragraphs: [
          'A water heater\'s efficiency factor (EF, or uniform energy factor, UEF, on today\'s labels) is the share of the fuel\'s heat that actually ends up in the water you use, versus lost to standby heat loss or combustion exhaust. Wikipedia\'s "Water heating" article, citing U.S. federal minimum-efficiency standards, reports a 2015 minimum of at least 95% for electric storage units, at least 60% for 50-gallon gas storage units, an energy factor of 90% or higher for tankless gas units, and — because a heat pump water heater moves existing heat from the air rather than generating it, the same idea behind the heat pump savings calculator\'s COP — electric heat pump units "with energy factors of 200% or higher" (at least 197% for an 80-gallon model). This calculator uses those four figures (0.95, 0.60, 0.90 and 1.97) as representative efficiencies for a new unit of each type sold today.',
          'The energy a water heater actually uses is the useful heat needed divided by its efficiency factor. Useful heat follows directly from water\'s own physical properties — about 8.3 pounds per gallon, each pound needing roughly one Btu per degree Fahrenheit of temperature rise. Wikipedia\'s own worked example puts this together directly: raising 60 gallons from 50°F to 122°F takes about 35,856 Btu of useful heat; at 90% efficiency that becomes about 39,840 Btu of gas input, which it prices at about 40 cents at $1 per therm, while the same 60 gallons heated by a 100%-efficient electric element costs about $1.68 at 16 cents per kWh. This calculator\'s formula reproduces both of those figures exactly before applying today\'s electricity and gas prices and all four real efficiency factors above.',
          'At typical current U.S. fuel prices, the ranking usually runs heat pump cheapest, then gas tankless, then standard gas storage, then standard electric storage most expensive — driven mainly by the heat pump\'s efficiency factor being roughly double the others\' and electric resistance heat having no efficiency advantage at all. That ranking can shift wherever electricity is unusually cheap relative to gas, or vice versa; it also says nothing about installation cost, which is typically higher for heat pump and tankless units than for standard storage tanks.'
        ]
      },
      howTo: {
        intro: 'Enter your daily hot water use and the incoming and target water temperatures, then today\'s electricity and gas prices.',
        steps: [
          { name: 'Enter gallons of hot water used per day', text: 'Use your own estimate, or Wikipedia\'s own worked-example volume, 60 gallons, as a starting point.' },
          { name: 'Enter the incoming and setpoint water temperatures', text: 'The defaults, 50°F incoming and 122°F setpoint, match Wikipedia\'s own worked example and a common water heater thermostat setting.' },
          { name: 'Enter your electricity rate and gas price', text: 'Use the per-kWh rate and per-therm price from recent utility bills.' },
          { name: 'Read the four costs', text: 'The rows show the estimated annual running cost for standard electric storage, standard gas storage, gas tankless and heat pump water heaters side by side.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Useful heat needed depends only on volume and temperature rise; dividing by each type\'s efficiency factor and converting to its fuel\'s price gives the running cost.',
        expression: 'useful heat (Btu/yr) = gallons/day × 8.3 × (setpoint °F − incoming °F) × 365\ninput energy (Btu/yr) = useful heat ÷ efficiency factor (EF)\nelectric-type cost = input energy ÷ 3,412 Btu/kWh × electricity rate\ngas-type cost = input energy ÷ 100,000 Btu/therm × gas price',
        terms: [
          { symbol: 'EF, electric storage', meaning: '0.95 — U.S. 2015 federal minimum for electric storage water heaters.' },
          { symbol: 'EF, gas storage', meaning: '0.60 — U.S. 2015 federal minimum for a 50-gallon gas storage water heater.' },
          { symbol: 'EF, gas tankless', meaning: '0.90 — the 2015 U.S. standard for tankless gas water heaters.' },
          { symbol: 'EF, heat pump', meaning: '1.97 — U.S. 2015 federal minimum for an 80-gallon heat pump water heater; above 1.0 because it moves heat rather than generating it.' }
        ],
        note: 'An estimate using federal minimum efficiency standards for each type, not a specific product\'s own spec sheet — a specific ENERGY STAR certified model can exceed these figures. It also excludes installation cost, which is typically higher for heat pump and tankless units.'
      },
      workedExample: {
        intro: '60 gallons a day, 50°F incoming water heated to a 122°F setpoint, at $0.1831/kWh electricity and $2.61/therm gas.',
        rows: [
          { label: 'Useful heat per day (60 × 8.3 × 72)', value: '35,856 Btu' },
          { label: 'Useful heat per year (× 365)', value: '13,087,440 Btu' },
          { label: 'Electric storage (÷0.95 EF, ÷3,412 Btu/kWh, × $0.1831)', value: '4,037.59 kWh · $739.28' },
          { label: 'Gas storage (÷0.60 EF, ÷100,000 Btu/therm, × $2.61)', value: '218.12 therms · $569.30' },
          { label: 'Gas tankless (÷0.90 EF, ÷100,000 Btu/therm, × $2.61)', value: '145.42 therms · $379.54' },
          { label: 'Heat pump (÷1.97 EF, ÷3,412 Btu/kWh, × $0.1831)', value: '1,947.06 kWh · $356.51' }
        ],
        result: 'Heat pump cheapest at $356.51/yr · electric storage most expensive at $739.28/yr',
        explanation: 'Switching from standard electric storage to a heat pump water heater saves about $382.78 a year here, a 51.8% cut — in the same direction as, though not identical to, ENERGY STAR\'s own separately published real-world savings of $270–$550 a year (for households of 2–4 people) for that same upgrade, which uses its own household-size-based usage assumptions rather than this calculator\'s gallons-per-day input.'
      },
      watchOut: [
        { title: 'These are federal minimum efficiencies, not a specific product', body: 'A particular ENERGY STAR certified model, especially a heat pump water heater, can run meaningfully more efficient than the 1.97 minimum used here — treat this as a baseline comparison, not a specific unit\'s spec sheet.' },
        { title: 'Installation cost is not included', body: 'Heat pump and tankless units typically cost more to buy and install than a standard storage tank. ENERGY STAR\'s own published payback period for a heat pump water heater is about 2.7 to 5.5 years depending on household size — a real cost this running-cost comparison does not add in.' },
        { title: 'Fuel prices vary a lot by region and month', body: 'Both the electricity rate and the gas price used here can differ substantially from your own bill — use your own rates for the most relevant comparison.' },
        { title: 'This assumes one flat temperature rise all year', body: 'Incoming water temperature actually varies by season and region; a single entered value is an approximation of the yearly average, not a month-by-month model.' }
      ],
      references: [
        { label: 'Wikipedia, "Water heating" (federal minimum efficiency factors by type, worked heat-energy example)', url: 'https://en.wikipedia.org/wiki/Water_heating' },
        { label: 'U.S. Energy Information Administration, Energy Explained — Units and Calculators (3,412 Btu/kWh, 100,000 Btu/therm)', url: 'https://www.eia.gov/energyexplained/units-and-calculators/' },
        { label: 'U.S. Energy Information Administration, Natural Gas — Residential Price (Mcf), used to derive the default $/therm price', url: 'https://www.eia.gov/dnav/ng/ng_pri_sum_a_EPG0_PRS_DMcf_m.htm' },
        { label: 'ENERGY STAR, Heat Pump Water Heaters — Benefits & Savings (real-world savings and payback by household size)', url: 'https://www.energystar.gov/products/heat_pump_water_heaters/benefits-savings' }
      ]
    },
    inputs: [
      { id: 'gallonsPerDay', label: 'Hot water used per day', type: 'number', placeholder: '60', defaultValue: 60, step: 5, min: 1 },
      { id: 'incomingTempF', label: 'Incoming water temperature (°F)', type: 'number', placeholder: '50', defaultValue: 50, step: 1, min: 0 },
      { id: 'setpointTempF', label: 'Water heater setpoint (°F)', type: 'number', placeholder: '122', defaultValue: 122, step: 1, min: 1 },
      { id: 'electricityRate', label: 'Electricity rate', type: 'currency', placeholder: '0.1831', defaultValue: 0.1831, step: 0.01, min: 0 },
      { id: 'gasPricePerTherm', label: 'Gas price per therm', type: 'currency', placeholder: '2.61', defaultValue: 2.61, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Water Heater Energy Cost Calculator – Electric vs Gas',
      description: 'Compare annual running costs for standard electric, standard gas, gas tankless and heat pump water heaters from your hot water use and fuel prices.',
      faq: [
        { question: 'Which water heater type is cheapest to run?', answer: 'In this calculator\'s worked example (60 gal/day, 50°F to 122°F, $0.1831/kWh, $2.61/therm), a heat pump water heater is cheapest at $356.51 a year, followed by gas tankless ($379.54), standard gas storage ($569.30) and standard electric storage, most expensive at $739.28.' },
        { question: 'How much does a heat pump water heater really save vs. a standard electric one?', answer: 'About $382.78 a year (51.8% less) in this calculator\'s worked example. ENERGY STAR\'s own separately published real-world figures put that same upgrade\'s savings at $270 to $550 a year depending on household size (2 to 4 people) — a different method, but the same direction and a similar range.' },
        { question: 'What efficiency factors does this calculator use?', answer: '0.95 for standard electric storage, 0.60 for standard gas storage, 0.90 for gas tankless, and 1.97 for a heat pump water heater — U.S. federal minimum efficiency standards reported by Wikipedia\'s "Water heating" article, used here as representative figures for a new unit of each type.' },
        { question: 'Why can a heat pump water heater have an efficiency factor above 1.0 (100%)?', answer: 'Because it moves existing heat from the surrounding air into the water rather than generating new heat from fuel or resistance — the same reason a heat pump\'s coefficient of performance (COP) can exceed 1, covered on this site\'s heat pump savings calculator.' },
        { question: 'Does this account for the cost of buying and installing a new water heater?', answer: 'No — it compares running cost only. Heat pump and tankless units typically cost more upfront; ENERGY STAR cites a payback period of about 2.7 to 5.5 years for a heat pump water heater, depending on household size.' },
        { question: 'How was the Wikipedia worked example checked?', answer: 'Its own numbers — 60 gallons, 50°F to 122°F, 90% gas efficiency costing about 40 cents at $1/therm, and 100% electric efficiency costing about $1.68 at $0.16/kWh — were directly recomputed with this calculator\'s own formula before building the rest of this page, and matched exactly.' }
      ]
    },
    compute(values) {
      const deltaT = values.setpointTempF - values.incomingTempF;
      const usefulHeatBtuPerYear = values.gallonsPerDay * 8.3 * deltaT * 365;
      const EF_ELECTRIC_STORAGE = 0.95;
      const EF_GAS_STORAGE = 0.60;
      const EF_GAS_TANKLESS = 0.90;
      const EF_HEAT_PUMP = 1.97;
      const electricStorageKwh = usefulHeatBtuPerYear / EF_ELECTRIC_STORAGE / 3412;
      const electricStorageCost = electricStorageKwh * values.electricityRate;
      const gasStorageTherms = usefulHeatBtuPerYear / EF_GAS_STORAGE / 100000;
      const gasStorageCost = gasStorageTherms * values.gasPricePerTherm;
      const gasTanklessTherms = usefulHeatBtuPerYear / EF_GAS_TANKLESS / 100000;
      const gasTanklessCost = gasTanklessTherms * values.gasPricePerTherm;
      const heatPumpKwh = usefulHeatBtuPerYear / EF_HEAT_PUMP / 3412;
      const heatPumpCost = heatPumpKwh * values.electricityRate;
      const heatPumpVsElectricSavings = electricStorageCost - heatPumpCost;
      return { electricStorageCost, gasStorageCost, gasTanklessCost, heatPumpCost, heatPumpVsElectricSavings };
    }
  },
  {
    id: 'ev-solar-charging-offset-calculator',
    category: 'solar',
    group: 'Everyday Efficiency',
    glyph: 'EV',
    updatedAt: '2026-11-18',
    aliases: ['ev charging solar offset calculator', 'how much solar can power my ev', 'solar ev charging calculator', 'electric car solar charging offset calculator', 'can solar panels charge my ev'],
    related: ['solar-panel-system-size-calculator', 'net-metering-savings-calculator', 'ev-charging-calculator', 'battery-backup-sizing-calculator'],
    title: 'EV Solar Charging Offset Calculator',
    description: 'Estimate how much of a home EV-charging load a solar system really offsets in real time, versus the larger share net metering can credit — the daytime-production/overnight-charging timing mismatch, made explicit.',
    example: 'Charging an EV 10 kWh a day with only 20% of that charging happening in daylight, a system producing about 29.78 kWh a day directly offsets just 20% of the charging in real time — though full-retail net metering can credit all of it.',
    breakdown: {
      headline: 'offsetPercentDirect',
      headlineLabel: 'Share of charging truly solar-powered in real time',
      outputs: [
        { id: 'offsetPercentDirect', label: 'Share of charging truly solar-powered in real time', format: 'percent' },
        { id: 'offsetPercentNetMetered', label: 'Share covered if net metering credits every exported kWh at full retail', format: 'percent' },
        { id: 'directOffsetKwh', label: 'Charging directly solar-powered', format: 'number', dimension: 'energy', unit: 'kWh' },
        { id: 'gridChargingKwh', label: 'Charging drawing from the grid in real time', format: 'number', dimension: 'energy', unit: 'kWh' },
        { id: 'gapPercentagePoints', label: 'Gap between the two offset figures', format: 'percent' }
      ],
      groups: [
        { title: 'Your EV charging', inputs: ['dailyChargingKwh', 'daylightChargingPercent'] },
        { title: 'Your solar system', inputs: ['dailySolarProductionKwh'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'offsetPercentDirect', label: 'Real-time offset' },
          { from: 'offsetPercentNetMetered', label: 'Net-metered offset' }
        ],
        title: 'Real-time solar offset vs. net-metered offset'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why "my solar makes more than my EV needs" doesn\'t mean what it sounds like',
        paragraphs: [
          'Solar panels only produce electricity while the sun is up, and the U.S. Department of Energy\'s Alternative Fuels Data Center states plainly that "most drivers of electric vehicles (EVs) ... charge their vehicles overnight at home." Those two facts collide: a charging session that starts after sunset draws from the grid in real time no matter how large the home\'s solar system is, unless the home also has a battery or the driver deliberately shifts charging to daylight hours.',
          'Net metering is how most solar-powered homes bridge that mismatch economically rather than physically. As this site\'s net metering savings calculator explains, a utility\'s export-crediting arrangement can let daytime solar sent to the grid offset nighttime grid draw on the bill, even though the actual electrons involved are never the same ones — but exactly how that works, including whether exports are credited at full retail or something less, "depends on policies and practices in your state and electric utility," per the Department of Energy\'s own homeowner\'s guide. This calculator reports both numbers side by side: the share of charging that is genuinely simultaneous with solar production, and the larger share a best-case, full-retail net-metering arrangement could still credit.',
          'The "daylight charging percent" input is what actually closes the gap between those two numbers. Charging that happens to fall during daylight hours — because the car is plugged in at a workplace charger, parked at home during the day, or deliberately scheduled for midday — is the only portion that can be truly solar-powered without a battery in the picture; shifting more charging into daylight hours, or adding home battery storage (see the battery backup sizing calculator), is what actually closes this gap in the real world, not a bigger solar system alone.'
        ]
      },
      howTo: {
        intro: 'Enter your typical daily EV charging energy, how much of it happens during daylight hours, and your system\'s typical daily solar production.',
        steps: [
          { name: 'Enter daily charging energy', text: 'The kWh your EV typically adds in a day — see the EV charging cost calculator to work this out from your battery size and driving.' },
          { name: 'Enter the share of charging that happens in daylight', text: 'Most home charging happens overnight, per the Department of Energy — use a low figure unless you specifically charge at a workplace or midday.' },
          { name: 'Enter your system\'s typical daily solar production', text: 'Use the annual production from the solar panel system size calculator, divided by 365, or your own installer\'s estimate.' },
          { name: 'Read both offset figures', text: 'The headline is the real-time, physically-simultaneous offset; the second figure is the larger share a full-retail net-metering arrangement could still credit.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The real-time offset is capped by how much charging actually overlaps daylight hours; the net-metered offset ignores timing and simply compares daily totals.',
        expression: 'daylight charging (kWh/day) = daily charging × daylight charging %\nreal-time offset (kWh/day) = min(daylight charging, daily solar production)\nreal-time offset % = real-time offset ÷ daily charging × 100\nnet-metered offset (kWh/day) = min(daily charging, daily solar production)\nnet-metered offset % = net-metered offset ÷ daily charging × 100',
        terms: [
          { symbol: 'daylight charging %', meaning: 'The share of a day\'s charging that happens while the sun is up — the only portion that can overlap solar production without a battery.' },
          { symbol: 'min(a, b)', meaning: 'The smaller of the two values — offsetting charging can never exceed either the charging itself or the solar actually available.' }
        ],
        note: 'A simplified two-number-per-day model of a real timing mismatch, not an hour-by-hour simulation of your actual solar production curve and charging schedule.'
      },
      workedExample: {
        intro: 'An EV needs 10 kWh a day, only 20% of that charging happens in daylight, and the home\'s solar system produces about 29.78 kWh a day on average (the annual production from the solar panel system size calculator\'s own worked example, divided by 365).',
        rows: [
          { label: 'Daylight charging (10 × 20%)', value: '2 kWh' },
          { label: 'Real-time offset (min(2, 29.78))', value: '2 kWh' },
          { label: 'Real-time offset % (2 ÷ 10 × 100)', value: '20%' },
          { label: 'Net-metered offset (min(10, 29.78))', value: '10 kWh' },
          { label: 'Net-metered offset % (10 ÷ 10 × 100)', value: '100%' },
          { label: 'Gap between the two figures', value: '80 percentage points' }
        ],
        result: '20% truly simultaneous · up to 100% if net metering credits every kWh',
        explanation: 'The system produces nearly three times the EV\'s daily charging need, which is why the net-metered figure reaches a full 100% — but because only 20% of charging actually happens while the sun is up, just 2 of the 10 kWh charged are physically simultaneous with solar production. The other 8 kWh draws from the grid in real time regardless of how much the system produces earlier that day.'
      },
      watchOut: [
        { title: 'Most home EV charging happens overnight', body: 'The Department of Energy states plainly that most EV drivers "charge their vehicles overnight at home" — if that describes you, keep the daylight charging percent low; a high real-time offset normally requires deliberately charging during the day.' },
        { title: 'A home battery changes this calculation entirely', body: 'With a home battery, solar produced during the day can be stored and discharged to the EV overnight, closing most or all of the gap this calculator exposes — see the battery backup sizing calculator for sizing one.' },
        { title: 'Net metering is not universal or always full retail', body: 'The net-metered figure here assumes every exported kWh is credited at full retail price — the net metering savings calculator\'s own guidance is that this "depends on policies and practices in your state and electric utility," so treat it as a best case, not a guarantee.' },
        { title: 'This uses two flat daily totals, not an hourly simulation', body: 'Real solar production rises and falls through the day and real charging sessions start and stop at specific times; this calculator captures the size of the mismatch, not its exact hour-by-hour shape.' }
      ],
      references: [
        { label: 'U.S. Department of Energy, Alternative Fuels Data Center — Charging Electric Vehicles at Home ("most drivers ... charge ... overnight at home")', url: 'https://afdc.energy.gov/fuels/electricity-charging-home' },
        { label: 'U.S. Department of Energy, Homeowner\'s Guide to Going Solar (net metering depends on state/utility policy)', url: 'https://www.energy.gov/eere/solar/homeowners-guide-going-solar' }
      ]
    },
    inputs: [
      { id: 'dailyChargingKwh', label: 'Daily EV charging energy', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 0.1, dimension: 'energy', unit: 'kWh' },
      { id: 'daylightChargingPercent', label: 'Share of charging that happens in daylight', type: 'percent', placeholder: '20', defaultValue: 20, step: 5, min: 0 },
      { id: 'dailySolarProductionKwh', label: 'Average daily solar production', type: 'number', placeholder: '29.78', defaultValue: 29.78, step: 1, min: 0.1, dimension: 'energy', unit: 'kWh' }
    ],
    seo: {
      title: 'EV Solar Charging Offset Calculator – Real vs. Net-Metered',
      description: 'Estimate how much home EV charging a solar system really offsets in real time versus the larger share net metering can credit.',
      faq: [
        { question: 'Can solar panels really charge my EV overnight?', answer: 'Not directly in real time — solar panels only produce while the sun is up, and the Department of Energy states that most EV drivers charge overnight at home. Without a battery, overnight charging draws from the grid regardless of system size.' },
        { question: 'If my solar system produces more than my EV needs, am I fully offset?', answer: 'Only in the net-metering sense, and only if your utility credits exports at full retail. In this calculator\'s worked example, a system producing nearly 3× the EV\'s daily need still only directly offsets 20% of charging in real time, because just 20% of that charging happens in daylight.' },
        { question: 'How do I close the gap between the two offset figures?', answer: 'Either shift more charging into daylight hours (a workplace charger, or scheduling a midday charge) or add home battery storage so daytime solar can be discharged to the EV overnight — see the battery backup sizing calculator for sizing a battery.' },
        { question: 'Does net metering guarantee the higher offset figure?', answer: 'No — it assumes your utility credits every exported kWh at full retail price, which this site\'s net metering savings calculator notes depends on your state and utility\'s own policy. Some utilities credit exports at less than retail.' },
        { question: 'How is this different from the EV charging cost calculator?', answer: 'The EV charging cost calculator estimates cost per charge and per mile at a flat electricity rate — it does not model solar at all. This calculator is specifically about how much of that charging a home solar system can realistically offset, given when charging actually happens.' },
        { question: 'Where does the default 29.78 kWh/day solar production figure come from?', answer: 'It is the annual production (10,868 kWh) from the solar panel system size calculator\'s own worked example, divided by 365 days — adjust it to your own system\'s actual or estimated daily output.' }
      ]
    },
    compute(values) {
      const daylightChargingKwh = values.dailyChargingKwh * (values.daylightChargingPercent / 100);
      const directOffsetKwh = Math.min(daylightChargingKwh, values.dailySolarProductionKwh);
      const offsetPercentDirect = values.dailyChargingKwh > 0 ? (directOffsetKwh / values.dailyChargingKwh) * 100 : NaN;
      const netMeteredOffsetKwh = Math.min(values.dailyChargingKwh, values.dailySolarProductionKwh);
      const offsetPercentNetMetered = values.dailyChargingKwh > 0 ? (netMeteredOffsetKwh / values.dailyChargingKwh) * 100 : NaN;
      const gapPercentagePoints = offsetPercentNetMetered - offsetPercentDirect;
      const gridChargingKwh = values.dailyChargingKwh - directOffsetKwh;
      return { offsetPercentDirect, offsetPercentNetMetered, directOffsetKwh, gridChargingKwh, gapPercentagePoints };
    }
  }
];
