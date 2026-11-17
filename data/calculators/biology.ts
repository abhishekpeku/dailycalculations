import type { CalculatorConfig } from './types.ts';

export const biologyCalculators: CalculatorConfig[] = [
  {
    id: 'cell-dilution-calculator',
    category: 'biology',
    glyph: 'CV',
    updatedAt: '2026-11-17',
    aliases: ['cell dilution calculator', 'cell density dilution calculator', 'cfu/ml dilution calculator', 'cell suspension dilution calculator', 'c1v1 calculator for cells', 'how to dilute a cell suspension'],
    related: ['dilution-calculator', 'serial-dilution-calculator', 'bacterial-growth-calculator', 'molarity-calculator'],
    title: 'Cell Dilution Calculator (C₁V₁ = C₂V₂ for Cell Suspensions)',
    description: 'Dilute a cell or CFU suspension to a target density with C₁V₁ = C₂V₂ — solve for the stock density, stock volume, final density, or final volume.',
    example: 'Taking 2 mL of a 5×10⁶ cells/mL suspension and adding medium to a final volume of 10 mL gives a final density of 1×10⁶ cells/mL — a 5× dilution.',
    solver: {
      defaultTarget: 'concentration2',
      variables: [
        { id: 'concentration1', label: 'Stock cell density', symbol: 'C₁', dimension: 'cellDensity', defaultValue: 5, defaultUnit: 'Mcells/mL' },
        { id: 'volume1', label: 'Stock volume', symbol: 'V₁', dimension: 'volume', defaultValue: 2, defaultUnit: 'mL' },
        { id: 'concentration2', label: 'Final cell density', symbol: 'C₂', dimension: 'cellDensity', defaultValue: 1, defaultUnit: 'Mcells/mL' },
        { id: 'volume2', label: 'Final volume', symbol: 'V₂', dimension: 'volume', defaultValue: 10, defaultUnit: 'mL' }
      ],
      solve: {
        concentration1: ({ concentration2, volume1, volume2 }) => (volume1 === 0 ? NaN : (concentration2 * volume2) / volume1),
        volume1: ({ concentration1, concentration2, volume2 }) => (concentration1 === 0 ? NaN : (concentration2 * volume2) / concentration1),
        concentration2: ({ concentration1, volume1, volume2 }) => (volume2 === 0 ? NaN : (concentration1 * volume1) / volume2),
        volume2: ({ concentration1, volume1, concentration2 }) => (concentration2 === 0 ? NaN : (concentration1 * volume1) / concentration2)
      },
      outputs: [
        { id: 'dilutionFactor', label: 'Dilution factor (V₂ ÷ V₁)', dimension: 'count', compute: (si) => (si.volume1 === 0 ? NaN : si.volume2 / si.volume1) },
        // Cells transferred = C1 x V1, but cellDensity's base is cells/mL while volume's base is m3
        // (chosen so the unit menu shows mL/µL, not astronomically-scaled m3 figures) — so turning
        // a real cell COUNT out of the two needs an explicit x1,000,000 (mL per m3). The plain
        // concentration2 solve above needs no such factor, since V1/V2 is a unit-independent ratio.
        { id: 'cellsTransferred', label: 'Cells transferred (C₁ × V₁)', dimension: 'count', compute: (si) => si.concentration1 * si.volume1 * 1e6 }
      ],
      visuals: [
        {
          type: 'compareBars',
          bars: [
            { from: 'concentration1', label: 'Stock density' },
            { from: 'concentration2', label: 'Final density' }
          ],
          title: 'Density before and after dilution',
          highlight: 1
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is a cell dilution?',
        paragraphs: [
          'A cell dilution lowers how crowded a cell suspension is — bacteria in broth, yeast, or cultured mammalian cells — by adding more medium without removing any cells. The same conservation idea behind any chemistry dilution applies: the total number of cells present does not change, only the volume they are spread through. That keeps the relationship C₁V₁ = C₂V₂, where concentration times volume on one side of a dilution equals concentration times volume on the other, exactly the equation chemistry’s own dilution-calculator uses for molarity.',
          'What is different here is what C actually counts. A chemistry dilution tracks moles of a dissolved substance per liter. A cell dilution tracks individual cells (counted directly, often on a hemocytometer or by flow cytometry) or colony-forming units, CFU — cells that are alive enough to grow into a visible colony on a plate. OpenStax’s Microbiology textbook notes that microbiologists usually report CFU/mL rather than a raw cells/mL count specifically because more than one cell can land in the same spot and grow into a single colony, undercounting the true population if that distinction is ignored.',
          'In practice, a cell dilution is almost always made to hit a target density for a specific next step: seeding a known number of cells into a culture plate, diluting an overgrown culture down to a countable range before plating it, or preparing a defined inoculum for an experiment. The math is identical to a chemistry dilution; only the units and the lab technique for measuring C₁ change.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the four values — the stock density, the stock volume, the final density, and the final volume — and the fourth fills in automatically.',
        steps: [
          { name: 'Count or measure the stock density', text: 'Use a hemocytometer, flow cytometer, or a plate count (CFU/mL) to get C₁ — however the stock suspension’s density was actually measured.' },
          { name: 'Enter the stock volume you are taking', text: 'V₁ — how much of the stock suspension you are pipetting out to dilute.' },
          { name: 'Enter the target, either a final density or a final volume', text: 'If you know the density you need for the next step, enter C₂ and let the calculator solve for V₂ (how much total volume to dilute up to). If you know the final volume you have room for, enter V₂ instead and solve for C₂.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result', text: 'The missing value appears immediately, alongside the dilution factor and a comparison of the density before and after.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'C₁V₁ = C₂V₂ rearranges to solve for any one of the four quantities, given the other three — the same algebra as a chemistry dilution, just counting cells instead of moles.',
        expression: 'C₁V₁ = C₂V₂\nC₁ = (C₂V₂) ÷ V₁\nV₁ = (C₂V₂) ÷ C₁\nC₂ = (C₁V₁) ÷ V₂\nV₂ = (C₁V₁) ÷ C₂',
        terms: [
          { symbol: 'C₁, V₁', meaning: 'Density and volume of the starting ("stock") suspension, before diluting — in cells/mL or CFU/mL.' },
          { symbol: 'C₂, V₂', meaning: 'Density and volume of the resulting suspension, after diluting.' },
          { symbol: 'C₁V₁ (= C₂V₂)', meaning: 'The total number of cells transferred, which does not change during a dilution — shown as a bonus figure above.' }
        ],
        note: 'Cells/mL and CFU/mL use the same equation but are not interchangeable: cells/mL counts every cell a direct method sees, living or dead, while CFU/mL counts only the ones that grew into a colony. Use whichever your own measurement actually produced, and don’t mix the two kinds of count on the two sides of the equation.'
      },
      workedExample: {
        intro: 'A stock suspension measures 5×10⁶ cells/mL on a hemocytometer. Taking 2 mL of it and adding medium to bring the total to 10 mL — what is the final density?',
        rows: [
          { label: 'Stock density (C₁)', value: '5×10⁶ cells/mL' },
          { label: 'Stock volume (V₁)', value: '2 mL' },
          { label: 'Final volume (V₂)', value: '10 mL' },
          { label: 'Cells transferred (C₁ × V₁)', value: '1×10⁷ cells' },
          { label: 'Final density (C₂ = 1×10⁷ cells ÷ 10 mL)', value: '1×10⁶ cells/mL' }
        ],
        result: 'C₂ = 1×10⁶ cells/mL — a 5× dilution (10 mL ÷ 2 mL)',
        explanation: 'The 2 mL of stock carries 5×10⁶ × 2 = 1×10⁷ cells. Spreading that same 1×10⁷ cells through a final volume of 10 mL gives 1×10⁷ ÷ 10 = 1×10⁶ cells/mL. The volume grew 5-fold (10 ÷ 2), so the density dropped to exactly 1/5 of the original — 5×10⁶ ÷ 5 = 1×10⁶.'
      },
      watchOut: [
        { title: 'Cells/mL and CFU/mL answer different questions', body: 'A direct count (hemocytometer or flow cytometry) includes every cell it detects, dead or alive. A CFU/mL plate count only includes cells able to divide and form a visible colony. The two numbers can differ substantially for the same sample — know which one you actually measured before plugging it in.' },
        { title: 'Don’t mix a cell dilution with a chemistry dilution', body: 'The equation is identical to molarity’s C₁V₁ = C₂V₂, but a cells/mL figure and a mol/L figure describe completely different things. Both sides of the equation must use the same kind of concentration.' },
        { title: 'A dilution can lower density but never raise it', body: 'V₂ is always at least as large as V₁. If a calculation needs V₂ smaller than V₁, what is actually wanted is concentrating the suspension (by centrifuging and resuspending in less volume), which this equation does not model.' },
        { title: 'The result is only as accurate as the stock count', body: 'This calculator cannot check whether C₁ itself was counted correctly — a hemocytometer, flow cytometer, or plate count all carry their own counting error, which carries straight through to C₂.' }
      ],
      references: [
        { label: 'OpenStax, Microbiology, §9.1 "How Microbes Grow"', url: 'https://openstax.org/books/microbiology/pages/9-1-how-microbes-grow' },
        { label: 'IUPAC Gold Book, "dilution"', url: 'https://goldbook.iupac.org/terms/view/D01646' }
      ]
    },
    inputs: [
      { id: 'concentration1', label: 'Stock cell density (cells/mL)', type: 'number', placeholder: '5000000', defaultValue: 5000000, step: 1, min: 0 },
      { id: 'volume1', label: 'Stock volume (m³)', type: 'number', placeholder: '0.000002', defaultValue: 0.000002, step: 0.0000001, min: 0 },
      { id: 'volume2', label: 'Final volume (m³)', type: 'number', placeholder: '0.00001', defaultValue: 0.00001, step: 0.0000001, min: 0 }
    ],
    seo: {
      title: 'Cell Dilution Calculator (C₁V₁ = C₂V₂)',
      description: 'Free cell dilution calculator for cell suspensions or CFU counts. Solve C₁V₁ = C₂V₂ for stock density, stock volume, final density, or final volume.',
      faq: [
        { question: 'What is the cell dilution formula?', answer: 'C₁V₁ = C₂V₂ — the same equation as any dilution, where C₁ and V₁ are the stock suspension’s cell density and volume, and C₂ and V₂ are the final suspension’s. The total number of cells stays the same; only the volume it is spread through changes.' },
        { question: 'How do I dilute a cell suspension to a target density?', answer: 'Solve for the final volume: V₂ = (C₁ × V₁) ÷ C₂. Taking 2 mL of a 5×10⁶ cells/mL stock down to 1×10⁶ cells/mL needs a final volume of (5×10⁶ × 2) ÷ 1×10⁶ = 10 mL.' },
        { question: 'What is the difference between cells/mL and CFU/mL?', answer: 'Cells/mL (from a hemocytometer or flow cytometer) counts every cell detected, living or dead. CFU/mL (colony-forming units, from a plate count) counts only cells able to grow into a visible colony — a measure of viable, culturable cells, not total cells.' },
        { question: 'How is this different from a chemistry dilution calculator?', answer: 'The math is identical to C₁V₁ = C₂V₂ for molarity. The difference is what C counts: a chemistry dilution tracks moles of dissolved solute per liter, while a cell dilution tracks individual cells or colony-forming units per milliliter.' },
        { question: 'What is a dilution factor?', answer: 'The ratio of the final volume to the starting volume, V₂ ÷ V₁. A 5× dilution means the final volume is 5 times the starting volume, so the cell density drops to 1/5 of what it was.' },
        { question: 'Can I dilute a suspension to a higher density than the stock?', answer: 'No — adding medium only ever lowers density. Reaching a higher density requires concentrating the suspension instead (for example, by centrifuging the cells down and resuspending the same pellet in a smaller volume), which is a different operation from this dilution equation.' }
      ]
    },
    compute(values) {
      return { concentration2: (values.concentration1 * values.volume1) / values.volume2 };
    }
  },
  {
    id: 'bacterial-growth-calculator',
    category: 'biology',
    glyph: '2ⁿ',
    updatedAt: '2026-11-17',
    aliases: ['bacterial growth calculator', 'exponential bacterial growth calculator', 'binary fission calculator', 'bacteria population growth calculator', 'colony growth calculator', 'generation time population calculator'],
    related: ['doubling-time-calculator', 'radioactive-half-life-calculator', 'exponent-calculator', 'logarithm-calculator'],
    title: 'Bacterial Growth Calculator (N = N₀ × 2^(t ÷ g))',
    description: 'Solve the bacterial growth equation, N = N₀ × 2^(t ÷ g), for the population, starting count, elapsed time, or generation time — the binary-fission growth model.',
    example: 'A culture of 1,000 E. coli cells with a 20-minute generation time reaches 8,000 cells after 60 minutes — 3 generations.',
    solver: {
      defaultTarget: 'finalPopulation',
      variables: [
        { id: 'initialPopulation', label: 'Starting population', symbol: 'N₀', dimension: 'count', defaultValue: 1000, defaultUnit: 'count' },
        { id: 'finalPopulation', label: 'Population', symbol: 'N', dimension: 'count', defaultValue: 8000, defaultUnit: 'count' },
        { id: 'elapsedTime', label: 'Elapsed time', symbol: 't', dimension: 'time', defaultValue: 60, defaultUnit: 'min' },
        { id: 'generationTime', label: 'Generation time', symbol: 'g', dimension: 'time', defaultValue: 20, defaultUnit: 'min' }
      ],
      solve: {
        finalPopulation: ({ initialPopulation, elapsedTime, generationTime }) => initialPopulation * Math.pow(2, elapsedTime / generationTime),
        initialPopulation: ({ finalPopulation, elapsedTime, generationTime }) => finalPopulation / Math.pow(2, elapsedTime / generationTime),
        elapsedTime: ({ initialPopulation, finalPopulation, generationTime }) =>
          initialPopulation <= 0 || finalPopulation <= 0 ? NaN : generationTime * Math.log2(finalPopulation / initialPopulation),
        generationTime: ({ initialPopulation, finalPopulation, elapsedTime }) =>
          initialPopulation <= 0 || finalPopulation <= 0 ? NaN : elapsedTime / Math.log2(finalPopulation / initialPopulation)
      },
      outputs: [
        { id: 'generations', label: 'Number of generations (t ÷ g)', dimension: 'count', compute: (si) => (si.generationTime === 0 ? NaN : si.elapsedTime / si.generationTime) },
        // Bonus cross-link to doubling-time-calculator: the same growth rate constant that page
        // solves for, mu = ln(2) / g, shown here as a reference figure rather than re-derived.
        { id: 'growthRateConstant', label: 'Growth rate constant (µ = ln 2 ÷ g)', dimension: 'rateConstant', unit: 'min-1', compute: (si) => (si.generationTime === 0 ? Infinity : Math.LN2 / si.generationTime) }
      ]
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is bacterial growth?',
        paragraphs: [
          'Most bacteria reproduce by binary fission: one cell splits into two genetically identical cells, those two split into four, and so on. OpenStax’s Microbiology textbook defines generation time (also called doubling time) as "the time it takes for the population to double through one round of binary fission." After n generations, a population that started at N₀ cells has grown to Nₙ = N₀ × 2ⁿ — doubling, doubling again, and again.',
          'Writing the number of generations as elapsed time divided by generation time, n = t ÷ g, turns that into a formula you can use for any elapsed time, not just whole generations: N = N₀ × 2^(t ÷ g). Generation time itself is specific to the species and its growth conditions — OpenStax gives Escherichia coli a generation time as short as 20 minutes under optimal laboratory conditions, Mycobacterium tuberculosis 15 to 20 hours, and Mycobacterium leprae a generation time of 14 days. The same formula covers all three; only g changes.',
          'This describes exponential ("log phase") growth specifically — the stretch of a culture’s growth curve where nutrients are plentiful and nothing is yet slowing the population down. Real cultures also pass through a lag phase before growth starts and a stationary phase once it levels off, neither of which this equation models (see Watch out for below).'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the starting population, the population, the elapsed time, and the generation time; the fourth fills in automatically.',
        steps: [
          { name: 'Look up or measure the generation time', text: 'Each organism has its own generation time under given conditions — 20 minutes for E. coli under ideal lab conditions, far longer for a slow-growing species. Use the correct value for your organism and conditions.' },
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit. The field left over, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a time unit converts the number already there, so 20 minutes becomes the equivalent fraction of an hour instead of silently turning into 20 hours.' },
          { name: 'Read the result and the generation count', text: 'The answer appears in your chosen unit. Underneath it, the number of generations (t ÷ g) and the growth rate constant (µ = ln 2 ÷ g) show as bonus figures.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The binary-fission growth equation rearranges to solve for any of the four quantities.',
        expression: 'N = N₀ × 2^(t ÷ g)\nN₀ = N ÷ 2^(t ÷ g)\nt = g × log₂(N ÷ N₀)\ng = t ÷ log₂(N ÷ N₀)',
        terms: [
          { symbol: 'N₀', meaning: 'The starting population — the number of cells (or CFU) you began counting from.' },
          { symbol: 'N', meaning: 'The population after time t.' },
          { symbol: 't', meaning: 'The elapsed time, in the same kind of units as the generation time once converted.' },
          { symbol: 'g', meaning: 'The generation (doubling) time — the fixed time for the population to double, for this organism under these conditions.' },
          { symbol: 'µ = ln(2) ÷ g', meaning: 'The growth rate constant: the continuous exponential growth rate equivalent to doubling every g. Shown as a bonus output — see doubling-time-calculator for the question asked the other way around, computing g (or µ) from a measured growth curve.' }
        ],
        note: 'Every time input is converted to seconds before solving and converted back afterward, so mixing minutes and hours is handled automatically.'
      },
      workedExample: {
        intro: 'A culture starts at 1,000 E. coli cells with a 20-minute generation time (the fast end of OpenStax’s cited range for E. coli under optimal lab conditions). How many cells are there after 1 hour?',
        rows: [
          { label: 'Starting population (N₀)', value: '1,000 cells' },
          { label: 'Generation time (g)', value: '20 min' },
          { label: 'Elapsed time (t)', value: '60 min' },
          { label: 'Number of generations (t ÷ g = 60 ÷ 20)', value: '3' },
          { label: 'Population (N = 1,000 × 2³)', value: '8,000 cells' }
        ],
        result: 'N = 8,000 cells after 3 generations',
        explanation: '60 minutes divided by a 20-minute generation time is exactly 3 generations. The population doubles each generation: 1,000 → 2,000 → 4,000 → 8,000, which matches 1,000 × 2³ = 8,000 directly. The growth rate constant for this generation time is µ = ln(2) ÷ 20 min ≈ 0.0347 per minute.'
      },
      watchOut: [
        { title: 'This models only the exponential growth phase', body: 'Real cultures also go through a lag phase (no growth yet, while cells adjust to a new environment) before exponential growth starts, and a stationary phase once nutrients run low or waste products build up and growth levels off. Neither is captured by N = N₀ × 2^(t ÷ g) — the formula only describes the middle, exponential stretch.' },
        { title: 'Generation time depends on both the organism and its conditions', body: 'The same species can have a very different generation time depending on temperature, nutrients, and oxygen availability. OpenStax cites E. coli’s 20-minute figure specifically as its generation time "under optimal growth conditions in the laboratory" — a real culture outside those conditions will be slower.' },
        { title: 'Don’t confuse this with doubling-time-calculator', body: 'This page answers "given a known generation time, how big is the population after t?" The doubling-time calculator answers the reverse question: given a growth rate constant measured from an actual growth curve, what is the doubling time? Use whichever matches what you actually know.' },
        { title: 'A fractional number of generations is a mathematical average, not a literal event', body: 'A real cell divides in discrete, whole steps, but the continuous formula (allowing t ÷ g to be any number, not just a whole number) is still the right one to use between generations — it is accurate on average over many cells and many generations, even though no single cell is ever "2.5 generations" old.' }
      ],
      references: [
        { label: 'OpenStax, Microbiology, §9.1 "How Microbes Grow"', url: 'https://openstax.org/books/microbiology/pages/9-1-how-microbes-grow' }
      ]
    },
    inputs: [
      { id: 'initialPopulation', label: 'Starting population (cells)', type: 'number', placeholder: '1000', defaultValue: 1000, step: 1, min: 0 },
      { id: 'elapsedTime', label: 'Elapsed time (s)', type: 'number', placeholder: '3600', defaultValue: 3600, step: 1, min: 0 },
      { id: 'generationTime', label: 'Generation time (s)', type: 'number', placeholder: '1200', defaultValue: 1200, step: 1, min: 0 }
    ],
    seo: {
      title: 'Bacterial Growth Calculator (N = N₀ × 2^(t/g))',
      description: 'Free bacterial growth calculator. Solve N = N₀ × 2^(t ÷ g) for population, starting count, elapsed time, or generation time, with a worked example.',
      faq: [
        { question: 'What is the bacterial growth formula?', answer: 'N = N₀ × 2^(t ÷ g), where N₀ is the starting population, t is elapsed time, g is the generation (doubling) time, and N is the population after that time. Each generation, the population doubles.' },
        { question: 'How do I calculate bacterial population after a given time?', answer: 'Multiply the starting population by 2 raised to the power of elapsed time divided by generation time: N = N₀ × 2^(t ÷ g). 1,000 cells with a 20-minute generation time reach 8,000 cells after 60 minutes (3 generations).' },
        { question: 'What is generation time?', answer: 'The time it takes a population to double through one round of binary fission — OpenStax’s Microbiology textbook gives E. coli a generation time as short as 20 minutes under optimal lab conditions, versus 15–20 hours for Mycobacterium tuberculosis.' },
        { question: 'How is generation time different from the growth rate constant?', answer: 'Generation time (g) is the doubling time directly. The growth rate constant (µ = ln 2 ÷ g) is the equivalent continuous exponential rate — the same information, in the units chemists and microbiologists use when fitting a growth curve rather than counting discrete doublings.' },
        { question: 'Why doesn’t a real bacterial culture keep growing exponentially forever?', answer: 'Exponential growth only describes the log phase of a growth curve. A real culture starts with a lag phase (no growth yet) and eventually hits a stationary phase once nutrients run low or waste accumulates, neither of which this formula models.' },
        { question: 'Can this formula be used for any number of generations, not just whole numbers?', answer: 'Yes — t ÷ g does not need to be a whole number. The formula gives the population at any elapsed time, smoothly interpolating between whole generations, which is accurate on average even though any single cell divides in discrete steps.' }
      ]
    },
    compute(values) {
      return { finalPopulation: values.initialPopulation * Math.pow(2, values.elapsedTime / values.generationTime) };
    }
  },
  {
    id: 'doubling-time-calculator',
    category: 'biology',
    glyph: 'td',
    updatedAt: '2026-11-17',
    aliases: ['doubling time calculator', 'population doubling time calculator', 'growth rate to doubling time calculator', 'specific growth rate calculator', 'exponential growth doubling time calculator', 'td = ln2/mu calculator'],
    related: ['bacterial-growth-calculator', 'radioactive-half-life-calculator', 'reaction-half-life-calculator', 'logarithm-calculator'],
    title: 'Doubling Time Calculator (t_d = ln 2 ÷ µ)',
    description: 'Find the doubling time of an exponentially growing population from its measured growth rate constant, t_d = ln 2 ÷ µ — or go the other way, from a known doubling time to µ.',
    example: 'A culture growing at a measured specific growth rate of 2.0 per hour has a doubling time of about 20.8 minutes.',
    solver: {
      defaultTarget: 'doublingTime',
      variables: [
        { id: 'growthRateConstant', label: 'Growth rate constant', symbol: 'µ', dimension: 'rateConstant', defaultValue: 2, defaultUnit: 'h-1' },
        { id: 'doublingTime', label: 'Doubling time', symbol: 't_d', dimension: 'time', defaultValue: 20.79441541679836, defaultUnit: 'min' }
      ],
      solve: {
        doublingTime: ({ growthRateConstant }) => (growthRateConstant === 0 ? NaN : Math.LN2 / growthRateConstant),
        growthRateConstant: ({ doublingTime }) => (doublingTime === 0 ? NaN : Math.LN2 / doublingTime)
      },
      outputs: [
        // e^(mu * 1 hour): how many-fold the population grows every hour at this rate — a bonus
        // figure for readers more used to "doubles every X minutes" than a bare rate constant.
        { id: 'growthFactorPerHour', label: 'Growth multiple per hour (e^µ, µ in h⁻¹)', dimension: 'count', compute: (si) => Math.exp(si.growthRateConstant * 3600) }
      ]
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is doubling time, and how is it different from generation time?',
        paragraphs: [
          'Any quantity that grows exponentially — a bacterial culture, a cell line, a population of any kind — can be described two equivalent ways: by how fast it grows per unit time (a growth rate constant, µ, in a model dN/dt = µN) or by how long it takes to double in size (the doubling time, t_d). The two are directly related: t_d = ln(2) ÷ µ, and µ = ln(2) ÷ t_d, the same ln(2) relationship a radioactive half-life has to its own decay constant.',
          'This page starts from the growth rate constant and solves for doubling time — the opposite direction from bacterial-growth-calculator. That page starts from a generation time you already know (an organism’s textbook value, like E. coli’s 20 minutes under optimal conditions) and predicts a population at a future time. This page starts from a growth rate constant you measured yourself — typically the slope of ln(population) plotted against time during the exponential phase of an actual growth curve — and works out what doubling time that slope corresponds to.',
          'In practice, µ almost never arrives as a clean, textbook number: it is fit from real optical-density or cell-count readings taken during an experiment, so this calculator is the step between "here is the rate constant my growth curve gave me" and "here is what that means in doubling time," the more intuitive quantity most people actually want to report.'
        ]
      },
      howTo: {
        intro: 'Enter either the growth rate constant or the doubling time; the other fills in automatically.',
        steps: [
          { name: 'Get a growth rate constant from a real growth curve', text: 'Plot the natural log of population (or optical density) against time during the exponential phase; the slope of that line is µ.' },
          { name: 'Enter µ, or enter a known doubling time instead', text: 'If you already know the doubling time (for example, from a published source), enter that instead and the calculator solves for µ.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the other field becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching µ’s unit (s⁻¹, min⁻¹, h⁻¹) converts the number already there instead of silently reinterpreting it.' },
          { name: 'Read the result and the growth multiple', text: 'The doubling time appears in your chosen unit. Underneath it, the growth multiple per hour (e^µ) shows roughly how many-fold the population grows every hour at that rate.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The relationship between a growth rate constant and doubling time is a direct, two-way conversion.',
        expression: 't_d = ln(2) ÷ µ\nµ = ln(2) ÷ t_d',
        terms: [
          { symbol: 'µ', meaning: 'The specific growth rate constant (per unit time), the proportionality constant in dN/dt = µN — how fast the population grows relative to its current size.' },
          { symbol: 't_d', meaning: 'Doubling time: how long it takes the population to exactly double, at a constant growth rate µ.' },
          { symbol: 'ln(2) ≈ 0.6931', meaning: 'The natural log of 2 — population growth is a base-e exponential (N = N₀e^(µt)), and doubling means solving e^(µt_d) = 2 for t_d.' }
        ],
        note: 'This assumes µ stays constant over the period in question — true during a real culture’s exponential phase, but not once it slows down approaching the stationary phase (the same caveat bacterial-growth-calculator’s own binary-fission model carries).'
      },
      workedExample: {
        intro: 'A growth curve’s exponential phase gives a measured specific growth rate of µ = 2.0 per hour. What is the doubling time?',
        rows: [
          { label: 'Growth rate constant (µ)', value: '2.0 h⁻¹' },
          { label: 'Doubling time (t_d = ln 2 ÷ 2.0)', value: '0.34657 h' },
          { label: 'Doubling time, in minutes (0.34657 × 60)', value: '20.79 min' }
        ],
        result: 't_d ≈ 20.79 min',
        explanation: 'ln(2) ≈ 0.693147. Dividing by the growth rate constant, 0.693147 ÷ 2.0 = 0.346574 hours, which is 0.346574 × 60 ≈ 20.79 minutes. At this growth rate, the population also grows by a factor of e^2.0 ≈ 7.39 every hour — roughly 7-fold.'
      },
      watchOut: [
        { title: 'µ and doubling time move in opposite directions', body: 'A larger growth rate constant means a shorter doubling time, not a longer one — they are reciprocals (through ln 2), so doubling µ roughly halves t_d, it does not double it.' },
        { title: 'Check which unit a published µ is already in', body: 'Growth rate constants are reported in s⁻¹, min⁻¹, or h⁻¹ depending on the field and the organism’s speed. Converting a per-minute µ as if it were per-hour overstates the doubling time by 60-fold.' },
        { title: 'This is the same ln(2) relationship as radioactive half-life, with the sign flipped', body: 'A decay constant and a half-life are related by λ = ln(2) ÷ t½, identical in form to µ = ln(2) ÷ t_d here — the difference is growth versus decay, not the math.' },
        { title: 'Don’t confuse this with bacterial-growth-calculator’s generation time', body: 'If you already know an organism’s generation time directly (rather than having measured µ from your own growth curve), use bacterial-growth-calculator instead — plugging a generation time straight in as if it were µ will give a nonsensical doubling time.' }
      ],
      references: [
        { label: 'OpenStax, Microbiology, §9.1 "How Microbes Grow"', url: 'https://openstax.org/books/microbiology/pages/9-1-how-microbes-grow' }
      ]
    },
    inputs: [{ id: 'growthRateConstant', label: 'Growth rate constant µ (s⁻¹)', type: 'number', placeholder: '0.000556', defaultValue: 0.0005555555555555556, step: 0.00001, min: 0 }],
    seo: {
      title: 'Doubling Time Calculator (t_d = ln2 ÷ µ)',
      description: 'Free doubling time calculator. Convert a growth rate constant to a doubling time (or back), t_d = ln 2 ÷ µ, with a worked example.',
      faq: [
        { question: 'What is the doubling time formula?', answer: 't_d = ln(2) ÷ µ, where µ is the exponential growth rate constant. A growth rate constant of 2.0 per hour gives a doubling time of about 0.347 hours, or roughly 20.8 minutes.' },
        { question: 'How do I find the growth rate constant from a doubling time?', answer: 'Rearrange the same formula: µ = ln(2) ÷ t_d. A 20-minute doubling time corresponds to µ = ln(2) ÷ (1/3 h) ≈ 2.08 per hour.' },
        { question: 'What is a growth rate constant (µ)?', answer: 'The proportionality constant in the exponential growth model dN/dt = µN — how fast a population grows relative to its own current size. It is typically obtained as the slope of ln(population) versus time during the exponential phase of a real growth curve.' },
        { question: 'How is doubling time different from generation time?', answer: 'They describe the same physical idea (time to double), but this calculator starts from a measured growth rate constant, while bacterial-growth-calculator starts from a known generation time and predicts a population directly — use whichever one matches the information you actually have.' },
        { question: 'Does a shorter doubling time mean faster growth?', answer: 'Yes. Doubling time and the growth rate constant are inversely related through ln(2) — a shorter doubling time always corresponds to a larger (faster) growth rate constant.' },
        { question: 'Is doubling time the same idea as radioactive half-life?', answer: 'Mathematically, yes — both are a ln(2)-over-rate-constant relationship, just for growth instead of decay. See radioactive-half-life-calculator for the decaying version of the same math.' }
      ]
    },
    compute(values) {
      return { doublingTime: Math.LN2 / values.growthRateConstant };
    }
  },
  {
    id: 'dna-concentration-calculator',
    category: 'biology',
    glyph: 'A260',
    updatedAt: '2026-11-17',
    aliases: ['dna concentration calculator', 'a260 dna calculator', 'nanodrop dna concentration calculator', 'ng/ul dna calculator', 'dsdna concentration calculator', 'nucleic acid concentration calculator'],
    related: ['beer-lambert-law-calculator', 'protein-concentration-calculator', 'dilution-calculator', 'molarity-calculator'],
    title: 'DNA Concentration Calculator (A260 × Dilution × 50)',
    description: 'Find double-stranded DNA concentration in ng/µL from a spectrophotometer’s A260 reading and dilution factor, using the standard dsDNA extinction constant of 50.',
    example: 'An A260 reading of 0.5 on a sample diluted 20-fold gives a DNA concentration of 500 ng/µL (0.5 × 20 × 50).',
    solver: {
      defaultTarget: 'concentration',
      variables: [
        { id: 'absorbance', label: 'A260 absorbance', symbol: 'A', dimension: 'absorbance', defaultValue: 0.5, defaultUnit: 'AU' },
        { id: 'dilutionFactor', label: 'Dilution factor', symbol: 'DF', dimension: 'count', defaultValue: 20, defaultUnit: 'count' },
        { id: 'concentration', label: 'DNA concentration', symbol: 'C', dimension: 'massConcentration', defaultValue: 500, defaultUnit: 'ng/uL' }
      ],
      solve: {
        // C (ng/µL) = A260 x dilution factor x 50, the dsDNA mass extinction constant for a 1 cm (10
        // mm) path length — Desjardins & Conklin (2010), J Vis Exp, "NanoDrop Microvolume
        // Quantitation of Nucleic Acids" (PMC3346308). massConcentration's SI base (mg/L) is
        // numerically identical to ng/µL (both equal 1e-3 g/L), so this is a plain multiplication
        // with no stray conversion factor.
        concentration: ({ absorbance, dilutionFactor }) => absorbance * dilutionFactor * 50,
        absorbance: ({ concentration, dilutionFactor }) => (dilutionFactor === 0 ? NaN : concentration / (dilutionFactor * 50)),
        dilutionFactor: ({ concentration, absorbance }) => (absorbance === 0 ? NaN : concentration / (absorbance * 50))
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is A260 DNA quantification?',
        paragraphs: [
          'DNA is a double helix built from nucleotides, each with a nitrogenous base, a sugar, and a phosphate group (OpenStax’s Biology 2e describes the bases as "stacked in the interior, like a pair of staircase steps" between the sugar-phosphate backbone). Those stacked nitrogenous bases absorb ultraviolet light most strongly at a wavelength of 260 nm, and — just like the Beer-Lambert law behind any spectrophotometric measurement — how much light a DNA solution absorbs at 260 nm (its A260 reading) is directly proportional to how much DNA is in it.',
          'What makes DNA quantification its own specific, very commonly used calculator rather than a generic Beer-Lambert lookup is that double-stranded DNA has an unusually consistent, well-established mass extinction coefficient: an A260 of exactly 1.0, in a standard 1 cm path length, corresponds to a dsDNA concentration of about 50 µg/mL (equivalently, 50 ng/µL) — the constant Thermo Fisher’s own NanoDrop instruments use and the figure given directly in a peer-reviewed J Vis Exp methods paper on microvolume nucleic acid quantitation. Single-stranded DNA (33) and RNA (40) have their own, slightly different constants, because their different structures absorb UV light slightly differently per unit mass.',
          'A sample is almost always measured after dilution (or by an instrument that effectively dilutes it internally), since an undiluted DNA extract is often too concentrated to read accurately. Multiplying back by the dilution factor recovers the concentration of the original, undiluted sample — which is exactly what this calculator’s three-way formula does.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the A260 absorbance, the dilution factor, and the DNA concentration; the third fills in automatically.',
        steps: [
          { name: 'Measure A260 on a spectrophotometer', text: 'Read the absorbance at 260 nm of your (possibly diluted) sample in a cuvette or microvolume instrument with a known, standard path length.' },
          { name: 'Note the dilution factor used', text: 'If the sample was diluted before reading — or the instrument reports a built-in dilution — enter that factor. A neat (undiluted) sample has a dilution factor of 1.' },
          { name: 'Enter the two values you know', text: 'The field left over, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result', text: 'The concentration appears in ng/µL by default (equal numerically to µg/mL) — the units a lab protocol almost always asks for.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The dsDNA concentration formula rearranges to solve for any of the three quantities.',
        expression: 'C = A × DF × 50\nA = C ÷ (DF × 50)\nDF = C ÷ (A × 50)',
        terms: [
          { symbol: 'A', meaning: 'Absorbance at 260 nm (A260), measured on the diluted sample.' },
          { symbol: 'DF', meaning: 'Dilution factor — how many-fold the original sample was diluted before being read (1 for a neat, undiluted reading).' },
          { symbol: 'C', meaning: 'The concentration of the original (undiluted) sample, in ng/µL (equivalently µg/mL).' },
          { symbol: '50', meaning: 'The dsDNA mass extinction constant: an A260 of 1.0 at a 1 cm path length corresponds to 50 ng/µL of double-stranded DNA (Desjardins & Conklin, 2010). Single-stranded DNA uses 33; RNA uses 40 — different molecules absorb 260 nm light differently per unit mass.' }
        ],
        note: 'This assumes a standard 1 cm (10 mm) path length, the convention nearly every cuvette and microvolume spectrophotometer is built around; a different path length would need its own constant.'
      },
      workedExample: {
        intro: 'A DNA extraction is diluted 20-fold before reading (because neat, it would be too concentrated to measure accurately) and gives an A260 of 0.5. What is the concentration of the original, undiluted extract?',
        rows: [
          { label: 'A260 absorbance (A)', value: '0.5' },
          { label: 'Dilution factor (DF)', value: '20' },
          { label: 'dsDNA constant', value: '50 ng/µL per A260 unit' },
          { label: 'Concentration (C = 0.5 × 20 × 50)', value: '500 ng/µL' }
        ],
        result: 'C = 500 ng/µL (= 0.5 µg/µL = 500 µg/mL)',
        explanation: 'Multiplying the absorbance, the dilution factor, and the dsDNA constant together gives 0.5 × 20 × 50 = 500. Because the sample was read at a 20-fold dilution, this 500 ng/µL figure is already the concentration of the original, undiluted extract — no further scaling is needed.'
      },
      watchOut: [
        { title: 'The 50 constant is specific to double-stranded DNA', body: 'Single-stranded DNA (33) and RNA (40) have different mass extinction constants at 260 nm, because their structures absorb UV light differently per unit mass. Using the dsDNA constant on an RNA sample overstates its concentration by 25%.' },
        { title: 'A260 alone does not confirm purity', body: 'Protein, free nucleotides, and some buffer components (notably phenol) also absorb near 260 nm, inflating A260 without actually being DNA. The A260/A280 ratio (see protein-concentration-calculator’s own A280 reading) is the standard cross-check — a pure dsDNA sample reads close to 1.8.' },
        { title: 'The formula assumes a 1 cm path length', body: 'Nearly every standard cuvette and microvolume spectrophotometer is built around a 1 cm (10 mm) path length, which is what the 50 ng/µL constant assumes. A non-standard path length changes the relationship between A260 and concentration proportionally.' },
        { title: 'This is a specific application of Beer-Lambert, not a different law', body: 'The underlying physics is identical to beer-lambert-law-calculator’s A = εlc — dsDNA’s "50" constant is just a conventional, pre-calculated shortcut for a molecule whose nucleotide mix is similar enough from sample to sample that one mass extinction coefficient works well in practice.' }
      ],
      references: [
        { label: 'Desjardins, P. & Conklin, D. (2010), "NanoDrop Microvolume Quantitation of Nucleic Acids," Journal of Visualized Experiments (45): e2565', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3346308/' },
        { label: 'OpenStax, Biology 2e, §3.5 "Nucleic Acids"', url: 'https://openstax.org/books/biology-2e/pages/3-5-nucleic-acids' }
      ]
    },
    inputs: [
      { id: 'absorbance', label: 'A260 absorbance (AU)', type: 'number', placeholder: '0.5', defaultValue: 0.5, step: 0.001, min: 0 },
      { id: 'dilutionFactor', label: 'Dilution factor', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 0 }
    ],
    seo: {
      title: 'DNA Concentration Calculator (A260 × Dilution × 50)',
      description: 'Free dsDNA concentration calculator from A260 absorbance. Solve C = A × dilution factor × 50 for concentration, absorbance, or dilution factor in ng/µL.',
      faq: [
        { question: 'What is the formula for DNA concentration from A260?', answer: 'C = A260 × dilution factor × 50, where 50 is the standard mass extinction constant for double-stranded DNA (ng/µL per A260 unit at a 1 cm path length).' },
        { question: 'What does an A260 reading of 1.0 mean for DNA?', answer: 'An A260 of exactly 1.0 (at a 1 cm path length, undiluted) corresponds to a double-stranded DNA concentration of 50 ng/µL — the defining constant the whole formula is built on.' },
        { question: 'Is the constant different for RNA or single-stranded DNA?', answer: 'Yes. RNA uses 40 ng/µL per A260 unit and single-stranded DNA uses 33, instead of dsDNA’s 50 — each molecule’s structure absorbs 260 nm UV light slightly differently per unit mass.' },
        { question: 'Why dilute a sample before measuring A260?', answer: 'Spectrophotometric absorbance is only reliably proportional to concentration over a limited range; a concentrated DNA extract read neat can give an inaccurate, out-of-range absorbance. Diluting first and multiplying back by the dilution factor avoids that.' },
        { question: 'Does A260 tell me if my DNA is pure?', answer: 'Not by itself. Protein and some reagents also absorb near 260 nm. The A260/A280 ratio is the standard purity check — close to 1.8 for clean double-stranded DNA — rather than A260 alone.' },
        { question: 'How is this different from the general Beer-Lambert law calculator?', answer: 'It is the same underlying law, A = εlc, with the molar absorptivity and path length already folded into the single, conventional "50" constant for dsDNA at a standard 1 cm path length — see beer-lambert-law-calculator for the general, any-substance version.' }
      ]
    },
    compute(values) {
      return { concentration: values.absorbance * values.dilutionFactor * 50 };
    }
  },
  {
    id: 'protein-concentration-calculator',
    category: 'biology',
    glyph: 'A280',
    updatedAt: '2026-11-17',
    aliases: ['protein concentration calculator', 'a280 protein calculator', 'molar extinction coefficient protein calculator', 'protein absorbance calculator', 'beer-lambert protein concentration calculator', 'uv protein quantification calculator'],
    related: ['beer-lambert-law-calculator', 'dna-concentration-calculator', 'molar-mass-calculator', 'molarity-calculator'],
    title: 'Protein Concentration Calculator (A280, Beer-Lambert)',
    description: 'Find a protein’s mass concentration from its A280 absorbance, molar extinction coefficient, and molecular weight — a Beer-Lambert method solved for any of the five values.',
    example: 'A protein with a molar extinction coefficient of 43,824 L/(mol·cm) (bovine serum albumin) and a molecular weight of 66,463 g/mol gives an A280 of 0.660 at a concentration of about 1.00 mg/mL.',
    solver: {
      defaultTarget: 'concentration',
      variables: [
        { id: 'absorbance', label: 'A280 absorbance', symbol: 'A', dimension: 'absorbance', defaultValue: 0.66, defaultUnit: 'AU' },
        { id: 'molarAbsorptivity', label: 'Molar extinction coefficient', symbol: 'ε₂₈₀', dimension: 'molarAbsorptivity', defaultValue: 43824, defaultUnit: 'L/molcm' },
        { id: 'pathLength', label: 'Path length', symbol: 'l', dimension: 'length', defaultValue: 1, defaultUnit: 'cm' },
        { id: 'molarMass', label: 'Molecular weight', symbol: 'MW', dimension: 'molarMass', defaultValue: 66463, defaultUnit: 'g/mol' },
        { id: 'concentration', label: 'Protein concentration', symbol: 'c', dimension: 'massConcentration', defaultValue: 1.0009487951807230, defaultUnit: 'mg/mL' }
      ],
      solve: {
        // Beer-Lambert (A = εlc) gives molar concentration, A / (ε·l); multiplying by molecular
        // weight converts that to a mass concentration. molarMass's SI base is kg/mol and
        // massConcentration's SI base is mg/L, and 1 kg/m3 = 1000 mg/L exactly, so every solve below
        // carries that single, explicit x1000 (never a second, hidden one) to stay coherent.
        concentration: ({ absorbance, molarAbsorptivity, pathLength, molarMass }) =>
          molarAbsorptivity * pathLength === 0 ? NaN : (1000 * molarMass * absorbance) / (molarAbsorptivity * pathLength),
        absorbance: ({ molarAbsorptivity, pathLength, molarMass, concentration }) =>
          molarMass === 0 ? NaN : (molarAbsorptivity * pathLength * concentration) / (1000 * molarMass),
        molarAbsorptivity: ({ absorbance, pathLength, molarMass, concentration }) =>
          pathLength * concentration === 0 ? NaN : (1000 * molarMass * absorbance) / (pathLength * concentration),
        pathLength: ({ absorbance, molarAbsorptivity, molarMass, concentration }) =>
          molarAbsorptivity * concentration === 0 ? NaN : (1000 * molarMass * absorbance) / (molarAbsorptivity * concentration),
        molarMass: ({ absorbance, molarAbsorptivity, pathLength, concentration }) =>
          absorbance === 0 ? NaN : (molarAbsorptivity * pathLength * concentration) / (1000 * absorbance)
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is A280 protein quantification?',
        paragraphs: [
          'Proteins are polymers of amino acids — OpenStax’s Biology 2e describes a protein’s primary structure as "amino acids’ unique sequence in a polypeptide chain," joined end to end by peptide bonds. Two of the twenty common amino acids, tryptophan and tyrosine (plus the disulfide bonds cystine forms), absorb ultraviolet light strongly around 280 nm. Measuring a protein solution’s absorbance at 280 nm (A280) and applying the same Beer-Lambert law behind any spectrophotometric measurement, A = εlc, gives its concentration — the most common quick, non-destructive way to quantify a purified protein.',
          'Unlike DNA, there is no single, universal constant for proteins: how strongly a protein absorbs at 280 nm depends on how many tryptophan and tyrosine residues it happens to contain, which varies enormously from protein to protein. Pace et al.’s widely used 1995 Protein Science method predicts a protein’s molar extinction coefficient at 280 nm directly from its sequence: ε₂₈₀ = (number of Trp × 5,500) + (number of Tyr × 1,490) + (number of cystines × 125), each a measured, per-residue contribution in M⁻¹cm⁻¹. Once ε₂₈₀ is known — predicted this way, measured directly, or looked up for a well-characterized protein — the same A = εlc relationship gives a molar concentration, and multiplying by the protein’s molecular weight converts that into the mg/mL figure most protocols actually want.',
          'This calculator’s worked example uses bovine serum albumin (BSA), the protein most commonly used as a standard for calibrating other assays: a molecular weight of 66,463 Da and a molar extinction coefficient at 280 nm of 43,824 M⁻¹cm⁻¹.'
        ]
      },
      howTo: {
        intro: 'Fill in any four of the five values — A280, the molar extinction coefficient, the path length, the molecular weight, and the concentration; the fifth fills in automatically.',
        steps: [
          { name: 'Measure A280 on a spectrophotometer', text: 'Read the absorbance at 280 nm of the protein solution in a cuvette of known path length.' },
          { name: 'Look up or predict the molar extinction coefficient', text: 'ε₂₈₀, specific to this protein, from a reference table, a manufacturer’s spec sheet, or the Pace et al. tryptophan/tyrosine/cystine formula.' },
          { name: 'Enter the protein’s molecular weight', text: 'MW, in g/mol (equivalently Da) — needed to convert the molar concentration Beer-Lambert gives directly into a mass concentration (mg/mL).' },
          { name: 'Enter the four values you know', text: 'The field left over, marked auto, calculates as you type.' },
          { name: 'Read the result', text: 'The concentration appears in mg/mL by default — the unit most protein protocols ask for.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Beer-Lambert gives a molar concentration; multiplying by molecular weight converts it to the mass concentration the formula below solves for directly.',
        expression: 'c = (MW × A) ÷ (ε₂₈₀ × l)\nA = (ε₂₈₀ × l × c) ÷ MW\nε₂₈₀ = (MW × A) ÷ (l × c)\nl = (MW × A) ÷ (ε₂₈₀ × c)\nMW = (ε₂₈₀ × l × c) ÷ A',
        terms: [
          { symbol: 'A', meaning: 'Absorbance at 280 nm (A280).' },
          { symbol: 'ε₂₈₀', meaning: 'The protein’s molar extinction coefficient at 280 nm, conventionally in L mol⁻¹ cm⁻¹ (M⁻¹cm⁻¹) — specific to this protein’s tryptophan, tyrosine, and cystine content.' },
          { symbol: 'l', meaning: 'Path length — the distance light travels through the sample, almost always 1.00 cm for a standard cuvette.' },
          { symbol: 'MW', meaning: 'The protein’s molecular weight (molar mass), in g/mol — the conversion factor from a molar concentration to a mass concentration.' },
          { symbol: 'c', meaning: 'Mass concentration, in mg/mL.' }
        ],
        note: 'The underlying law, A = ε₂₈₀lc(molar), is identical to beer-lambert-law-calculator’s general A = εlc — this page simply reports the result as a mass concentration (mg/mL) rather than a molarity, which is what most protein protocols call for, using MW to make that conversion.'
      },
      workedExample: {
        intro: 'Bovine serum albumin (molecular weight 66,463 g/mol, molar extinction coefficient 43,824 L/(mol·cm) at 280 nm) in a standard 1.00 cm cuvette gives an A280 reading of 0.660. What is its concentration?',
        rows: [
          { label: 'Absorbance (A)', value: '0.660' },
          { label: 'Molar extinction coefficient (ε₂₈₀)', value: '43,824 L/(mol·cm)' },
          { label: 'Path length (l)', value: '1.00 cm' },
          { label: 'Molecular weight (MW)', value: '66,463 g/mol' },
          { label: 'Molar concentration (A ÷ (ε₂₈₀ × l) = 0.660 ÷ 43,824)', value: '1.5068×10⁻⁵ mol/L' },
          { label: 'Mass concentration (1.5068×10⁻⁵ mol/L × 66,463 g/mol)', value: '≈ 1.0009 g/L = 1.0009 mg/mL' }
        ],
        result: 'c ≈ 1.00 mg/mL',
        explanation: 'Dividing the absorbance by ε₂₈₀ × l gives the molar concentration: 0.660 ÷ (43,824 × 1.00) ≈ 1.5068×10⁻⁵ mol/L. Multiplying that by BSA’s molecular weight, 66,463 g/mol, converts it to a mass concentration: 1.5068×10⁻⁵ × 66,463 ≈ 1.0009 g/L, and 1 g/L is exactly 1 mg/mL — so the sample is about 1.00 mg/mL.'
      },
      watchOut: [
        { title: 'There is no single universal protein extinction coefficient', body: 'Unlike dsDNA’s shared "50" constant, ε₂₈₀ is specific to each protein — it depends entirely on how many tryptophan and tyrosine residues (and cystines) it contains. Using one protein’s ε₂₈₀ to read another protein’s A280 gives a meaningless number.' },
        { title: 'A280 alone cannot distinguish one protein from a mixture', body: 'If the sample is not a single, known, pure protein — a crude lysate, for instance — A280 at best gives a rough total-protein estimate using an average or assumed coefficient, not an accurate concentration for a specific protein.' },
        { title: 'Nucleic acid contamination inflates A280', body: 'DNA and RNA absorb at 280 nm too, just more weakly than at 260 nm — a protein sample contaminated with nucleic acid reads artificially high, the mirror image of dna-concentration-calculator’s own note about protein inflating A260.' },
        { title: 'The formula assumes a 1 cm path length unless you change it', body: 'Nearly every ε₂₈₀ value in the literature is quoted assuming a standard 1.00 cm cuvette; this calculator’s path length field lets you correct for a different one, but a quoted ε₂₈₀ paired with the wrong path length will not give the right answer.' }
      ],
      references: [
        { label: 'Pace, C.N., Vajdos, F., Fee, L., Grimsley, G. & Gray, T. (1995), "How to measure and predict the molar absorption coefficient of a protein," Protein Science, 4(11), 2411–2423 (a direct PDF fetch returned corrupted, unreadable text; the ε₂₈₀ = Trp×5500 + Tyr×1490 + cystine×125 formula is confirmed via a search-engine-indexed snippet of the paper instead, flagged here rather than treated as fully fetch-verified)', url: 'https://onlinelibrary.wiley.com/doi/abs/10.1002/pro.5560041120' },
        { label: 'OpenStax, Biology 2e, §3.4 "Proteins"', url: 'https://openstax.org/books/biology-2e/pages/3-4-proteins' },
        { label: 'Wikipedia, "Bovine serum albumin" (molecular weight 66,463 Da) and AAT Bioquest FAQ, "What is the molar extinction coefficient of Bovine Serum Albumin (BSA)?" (43,824 M⁻¹cm⁻¹ at 280 nm) — both fetched directly for this worked example’s figures', url: 'https://en.wikipedia.org/wiki/Bovine_serum_albumin' }
      ]
    },
    inputs: [
      { id: 'absorbance', label: 'A280 absorbance (AU)', type: 'number', placeholder: '0.66', defaultValue: 0.66, step: 0.001, min: 0 },
      { id: 'molarAbsorptivity', label: 'Molar extinction coefficient ε₂₈₀ (m²/mol)', type: 'number', placeholder: '4382.4', defaultValue: 4382.4, step: 0.1, min: 0 },
      { id: 'pathLength', label: 'Path length (m)', type: 'number', placeholder: '0.01', defaultValue: 0.01, step: 0.001, min: 0 },
      { id: 'molarMass', label: 'Molecular weight (kg/mol)', type: 'number', placeholder: '66.463', defaultValue: 66.463, step: 0.001, min: 0 }
    ],
    seo: {
      title: 'Protein Concentration Calculator (A280)',
      description: 'Free A280 protein concentration calculator. Solve Beer-Lambert for concentration, absorbance, extinction coefficient, path length, or molecular weight.',
      faq: [
        { question: 'What is the A280 protein concentration formula?', answer: 'c = (MW × A280) ÷ (ε₂₈₀ × l), where MW is the protein’s molecular weight, ε₂₈₀ is its molar extinction coefficient at 280 nm, and l is the cuvette path length — giving mass concentration directly in mg/mL when MW is in g/mol.' },
        { question: 'Why does A280 depend on tryptophan and tyrosine?', answer: 'Those two amino acids (plus the cystine disulfide bond) are the residues that actually absorb ultraviolet light strongly around 280 nm. A protein’s molar extinction coefficient at 280 nm is essentially a weighted count of how many of each it contains.' },
        { question: 'Why is there no fixed constant for protein, unlike DNA’s "50"?', answer: 'DNA’s nucleotide composition is similar enough across typical samples that one shared constant works well. Proteins vary enormously in tryptophan and tyrosine content from one protein to the next, so each protein needs its own molar extinction coefficient.' },
        { question: 'What is bovine serum albumin (BSA) and why is it used here?', answer: 'BSA is the most commonly used protein standard in biochemistry labs, with a well-documented molecular weight (66,463 Da) and molar extinction coefficient at 280 nm (43,824 M⁻¹cm⁻¹), which is why it makes a convenient, realistic worked example.' },
        { question: 'How do I get a protein’s molar extinction coefficient if it isn’t published?', answer: 'Pace et al.’s (1995) method predicts it from sequence: ε₂₈₀ = (tryptophan count × 5,500) + (tyrosine count × 1,490) + (cystine count × 125), each a per-residue molar absorptivity in M⁻¹cm⁻¹.' },
        { question: 'How is this different from the DNA concentration calculator?', answer: 'Both apply the same Beer-Lambert law, but at different wavelengths with different absorbing groups: DNA’s stacked bases absorb at 260 nm with one shared constant (50), while protein’s aromatic residues absorb at 280 nm with a protein-specific molar extinction coefficient that this calculator takes as an input.' }
      ]
    },
    compute(values) {
      return { concentration: (1000 * values.molarMass * values.absorbance) / (values.molarAbsorptivity * values.pathLength) };
    }
  }
];
