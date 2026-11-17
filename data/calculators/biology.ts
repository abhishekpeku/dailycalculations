import type { CalculatorConfig } from './types.ts';

// Standard gravity (BIPM SI Brochure), used by centrifuge-rcf-rpm-calculator's RCF = omega^2 r / g0 —
// same value and source as physics.ts's own STANDARD_GRAVITY constant.
const STANDARD_GRAVITY = 9.80665;

// Genotype for a single gene, encoded as how many dominant alleles (0, 1 or 2) that parent carries:
// AA = 2, Aa = 1, aa = 0 — the input punnett-square-calculator and dihybrid-cross-calculator both
// use (OpenStax Biology 2e Section 12.2: homozygous "two identical alleles," heterozygous "different
// alleles"). Each parent passes on a random allele, so a parent's own probability of passing on the
// dominant allele to a given offspring is simply this count / 2.
const GENOTYPE_OPTIONS = [
  { value: 2, label: 'AA (homozygous dominant)' },
  { value: 1, label: 'Aa (heterozygous)' },
  { value: 0, label: 'aa (homozygous recessive)' }
];
// dihybrid-cross-calculator's two traits, using the same seed-shape/seed-color symbols OpenStax
// Biology 2e Section 12.3 uses for its own dihybrid-cross illustration (round R / wrinkled r,
// yellow Y / green y).
const SEED_SHAPE_OPTIONS = [
  { value: 2, label: 'RR (round, homozygous dominant)' },
  { value: 1, label: 'Rr (round, heterozygous)' },
  { value: 0, label: 'rr (wrinkled, homozygous recessive)' }
];
const SEED_COLOR_OPTIONS = [
  { value: 2, label: 'YY (yellow, homozygous dominant)' },
  { value: 1, label: 'Yy (yellow, heterozygous)' },
  { value: 0, label: 'yy (green, homozygous recessive)' }
];

// dna-to-mrna-calculator: each DNA base typed in as one of 4 codes. The complementary strand and the
// mRNA strand share the same pairing (Watson-Crick: A(0)<->T(1), G(2)<->C(3)) — only the alphabet
// used to display code 1 differs (T for DNA, U for RNA), since "the only nucleotide difference is
// that in mRNA, all of the T nucleotides are replaced with U nucleotides" (OpenStax Biology 2e
// Section 15.2, "Prokaryotic Transcription").
const DNA_BASE_OPTIONS = [
  { value: 0, label: 'A' },
  { value: 1, label: 'T' },
  { value: 2, label: 'G' },
  { value: 3, label: 'C' }
];
const DNA_STRAND_LABELS = [{ value: 0, label: 'A' }, { value: 1, label: 'T' }, { value: 2, label: 'G' }, { value: 3, label: 'C' }];
const MRNA_STRAND_LABELS = [{ value: 0, label: 'A' }, { value: 1, label: 'U' }, { value: 2, label: 'G' }, { value: 3, label: 'C' }];
const DNA_COMPLEMENT: Record<number, number> = { 0: 1, 1: 0, 2: 3, 3: 2 };
// Defensive against the compute() snapshot test's "typical" input set, which scales every scalar
// input by 1.5 (mdFiles/calculator-template-v2.md Section 2, "Select options are keyed by id or
// code... only 0 survives that unchanged") — wraps any raw value back into a valid 0-3 base code
// instead of an undefined lookup.
function normalizeBaseCode(raw: number) {
  const rounded = Math.round(raw);
  return ((rounded % 4) + 4) % 4;
}

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
  },
  {
    id: 'punnett-square-calculator',
    category: 'biology',
    glyph: 'Aa',
    updatedAt: '2026-11-17',
    aliases: ['punnett square calculator', 'monohybrid cross calculator', 'genotype ratio calculator', 'punnett square genetics calculator', 'dominant recessive cross calculator', 'mendelian cross calculator'],
    related: ['dihybrid-cross-calculator', 'hardy-weinberg-calculator', 'allele-frequency-calculator', 'probability-calculator'],
    title: 'Punnett Square Calculator (Monohybrid Cross)',
    description: 'Cross two parent genotypes for a single gene and get the offspring genotype ratio (AA:Aa:aa) and phenotype ratio — a monohybrid Punnett square, solved instantly.',
    example: 'Crossing two heterozygous (Aa) parents gives offspring in a 1:2:1 genotype ratio — 25% AA, 50% Aa, 25% aa — a 3:1 phenotype ratio, 75% showing the dominant trait.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is a Punnett square?',
        paragraphs: [
          'A Punnett square, OpenStax’s Biology 2e explains, is "a grid that applies the rules of probability to predict the possible outcomes of a genetic cross or mating and their expected frequencies." Each parent contributes one allele of a gene to each offspring; lining up one parent’s possible alleles across the top of the grid and the other’s down the side, and filling in every combination, gives every possible genotype a future offspring could inherit, each with its own probability.',
          'A gene’s two alleles can combine three ways in a diploid organism. OpenStax defines homozygous individuals as having "two identical alleles for that gene" (AA or aa) and heterozygous individuals as having "different alleles for the gene being examined" (Aa). Genotype is "an organism’s underlying genetic makeup," while phenotype is "the observable traits expressed by an organism" — and because a dominant allele (one "inherited unchanged in a hybridization," per OpenStax) masks a recessive one (one that "become[s] latent, or disappear[s]") whenever at least one copy is present, both AA and Aa individuals show the identical dominant phenotype, while only aa shows the recessive one.',
          'This calculator covers a monohybrid cross — OpenStax’s own term for fertilization "between two true-breeding parents that differ in only one characteristic" — the simplest case, tracking a single gene. Pick each parent’s genotype and the calculator works out the full genotype and phenotype ratios of their offspring, the same arithmetic a hand-drawn Punnett square grid gives, without drawing the grid.'
        ]
      },
      howTo: {
        intro: 'Pick each parent’s genotype for the gene in question; the offspring ratios calculate instantly.',
        steps: [
          { name: 'Pick parent 1’s genotype', text: 'AA (homozygous dominant), Aa (heterozygous) or aa (homozygous recessive) — whichever this parent actually carries for the gene being crossed.' },
          { name: 'Pick parent 2’s genotype', text: 'The same three choices, for the other parent.' },
          { name: 'Read the genotype ratio', text: 'The share of offspring expected to be AA, Aa and aa.' },
          { name: 'Read the phenotype ratio', text: 'AA and Aa offspring both show the dominant phenotype, since one dominant allele is enough; only aa shows the recessive phenotype.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Each parent passes on one of its two alleles at random; an offspring’s genotype probability is the product of each parent’s chance of passing on a dominant allele (or its complement, for a recessive one).',
        expression: 'P(dominant allele from a parent) = (that parent’s dominant allele count) ÷ 2\nP(AA) = P₁ × P₂\nP(aa) = (1 − P₁) × (1 − P₂)\nP(Aa) = 1 − P(AA) − P(aa)',
        terms: [
          { symbol: 'P₁, P₂', meaning: 'Each parent’s probability of passing on the dominant allele to a given offspring: 1 if that parent is AA, ½ if Aa, 0 if aa.' },
          { symbol: 'P(AA), P(Aa), P(aa)', meaning: 'The probability — equivalently, the expected fraction — of offspring with each genotype.' },
          { symbol: 'Dominant phenotype', meaning: 'P(AA) + P(Aa) — every offspring with at least one dominant allele shows the dominant trait.' }
        ],
        note: 'This is the same probability math a hand-drawn Punnett square grid works out cell by cell — multiplying each parent’s allele probabilities and adding up the matching outcomes — just without drawing the grid.'
      },
      workedExample: {
        intro: 'OpenStax’s own example: Mendel crossed a true-breeding violet-flowered pea plant (PP) with a true-breeding white-flowered one (pp). What genotype and phenotype does the F1 generation have?',
        rows: [
          { label: 'Parent 1 genotype', value: 'PP (homozygous dominant, violet)' },
          { label: 'Parent 2 genotype', value: 'pp (homozygous recessive, white)' },
          { label: 'P₁(dominant allele)', value: '1' },
          { label: 'P₂(dominant allele)', value: '0' },
          { label: 'Offspring genotype', value: '100% Pp' },
          { label: 'Offspring phenotype', value: '100% violet (dominant)' }
        ],
        result: 'Every F1 offspring is Pp and violet-flowered — exactly what OpenStax reports: "100 percent of the F1 hybrid generation had violet flowers."',
        explanation: 'With P₁ = 1 and P₂ = 0, P(AA) = 1 × 0 = 0 and P(aa) = 0 × 1 = 0, so every offspring falls into the one remaining case, Pp — a heterozygote. Because violet is dominant, one copy is enough to make every F1 plant violet, even though none of them are genetically identical to either true-breeding parent. Mendel then let the F1 self-pollinate: entering Aa for both parents above (a Pp × Pp cross) predicts a 1:2:1 genotype ratio and a 3:1 phenotype ratio, close to what Mendel actually counted in the F2 generation — 705 violet to 224 white, about 75.9% violet and 24.1% white (a ratio of roughly 3.15:1) against a theoretical 75%:25% (3:1) — the small gap being ordinary sampling variation in a finite number of real pea plants.'
      },
      watchOut: [
        { title: 'A Punnett square gives probabilities, not guarantees', body: 'A predicted 3:1 ratio describes the expected long-run proportion across many offspring, not a promise about any one litter or seed pod. Mendel’s own F2 count, 705:224, is close to 3:1 but not exact — real, finite samples deviate from a theoretical ratio by chance.' },
        { title: 'AA and Aa look identical in phenotype', body: 'Both genotypes show the dominant trait, so phenotype alone cannot tell them apart — only a cross with a known homozygous recessive (a "testcross") or a direct genetic test can distinguish AA from Aa.' },
        { title: 'This assumes simple dominant/recessive inheritance', body: 'Not every gene works this way. Incomplete dominance, codominance, and traits influenced by more than one gene all produce different offspring ratios than the dominant-masks-recessive case this calculator models.' },
        { title: 'One gene only', body: 'This page tracks a single gene (a monohybrid cross). For two genes at once, assorting independently, see dihybrid-cross-calculator instead.' }
      ],
      references: [
        { label: 'OpenStax, Biology 2e, §12.1 "Mendel’s Experiments and the Laws of Probability"', url: 'https://openstax.org/books/biology-2e/pages/12-1-mendels-experiments-and-the-laws-of-probability' },
        { label: 'OpenStax, Biology 2e, §12.2 "Characteristics and Traits"', url: 'https://openstax.org/books/biology-2e/pages/12-2-characteristics-and-traits' }
      ]
    },
    inputs: [
      { id: 'parent1Genotype', label: 'Parent 1 genotype', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0, options: GENOTYPE_OPTIONS },
      { id: 'parent2Genotype', label: 'Parent 2 genotype', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0, options: GENOTYPE_OPTIONS }
    ],
    breakdown: {
      headline: 'dominantPhenotype',
      headlineLabel: 'Offspring with the dominant phenotype',
      outputs: [
        { id: 'dominantPhenotype', label: 'Dominant phenotype', format: 'percent' },
        { id: 'recessivePhenotype', label: 'Recessive phenotype', format: 'percent' },
        { id: 'AA', label: 'Genotype AA (homozygous dominant)', format: 'percent' },
        { id: 'Aa', label: 'Genotype Aa (heterozygous)', format: 'percent' },
        { id: 'aa', label: 'Genotype aa (homozygous recessive)', format: 'percent' }
      ],
      groups: [{ title: 'Parent genotypes', inputs: ['parent1Genotype', 'parent2Genotype'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'AA', label: 'AA' },
          { from: 'Aa', label: 'Aa' },
          { from: 'aa', label: 'aa' }
        ],
        center: 'dominantPhenotype',
        centerSub: 'dominant phenotype'
      }
    },
    seo: {
      title: 'Punnett Square Calculator (Monohybrid Cross)',
      description: 'Free Punnett square calculator. Cross two parent genotypes for one gene and get the offspring genotype ratio (AA:Aa:aa) and phenotype ratio instantly.',
      faq: [
        { question: 'What is a Punnett square?', answer: 'A grid that applies the rules of probability to predict the possible genotypes and phenotypes of offspring from a genetic cross, by lining up each parent’s possible alleles and filling in every combination.' },
        { question: 'What genotype ratio does a heterozygous (Aa) x heterozygous (Aa) cross give?', answer: '1:2:1 — 25% AA, 50% Aa, 25% aa — the classic cross Mendel used to work out the rules of inheritance.' },
        { question: 'What phenotype ratio does Aa x Aa give?', answer: '3:1 — 75% show the dominant trait (AA or Aa), 25% show the recessive trait (aa only), since one dominant allele is enough to mask the recessive one.' },
        { question: 'What happens if a homozygous dominant parent (AA) is crossed with a homozygous recessive parent (aa)?', answer: 'Every offspring is Aa (heterozygous), so 100% show the dominant phenotype, even though none of them share a genotype with either parent.' },
        { question: 'What is the difference between genotype and phenotype?', answer: 'Genotype is the underlying genetic makeup (which alleles an organism carries); phenotype is the observable trait that genotype produces. AA and Aa have different genotypes but the identical dominant phenotype.' },
        { question: 'Can two individuals with the same phenotype have different genotypes?', answer: 'Yes — AA and Aa both show the dominant phenotype. Only a testcross (crossing with a known aa individual) or a direct genetic test can tell them apart.' }
      ]
    },
    compute(values) {
      const p1 = values.parent1Genotype / 2;
      const p2 = values.parent2Genotype / 2;
      const AA = p1 * p2 * 100;
      const aa = (1 - p1) * (1 - p2) * 100;
      const Aa = 100 - AA - aa;
      return { dominantPhenotype: AA + Aa, recessivePhenotype: aa, AA, Aa, aa };
    }
  },
  {
    id: 'dihybrid-cross-calculator',
    category: 'biology',
    glyph: 'AaBb',
    updatedAt: '2026-11-17',
    aliases: ['dihybrid cross calculator', 'two trait punnett square calculator', '9:3:3:1 ratio calculator', 'independent assortment calculator', 'dihybrid punnett square', 'two gene cross calculator'],
    related: ['punnett-square-calculator', 'hardy-weinberg-calculator', 'probability-calculator', 'combination-calculator'],
    title: 'Dihybrid Cross Calculator (9:3:3:1 Ratio)',
    description: 'Cross two parents across two independently assorting genes and get all four offspring phenotype proportions — the classic 9:3:3:1 dihybrid-cross ratio, solved for any pair of genotypes.',
    example: 'Crossing two parents heterozygous for both traits (RrYy x RrYy) gives the classic 9:3:3:1 ratio: 56.25% show both dominant traits, 18.75% each show one dominant and one recessive trait, and 6.25% show both recessive traits.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is a dihybrid cross?',
        paragraphs: [
          'A dihybrid cross tracks two genes for two different traits at once — OpenStax’s Biology 2e defines it as a cross "between two true-breeding parents that express different traits for two characteristics." Its own worked illustration uses pea seed shape (round R, dominant, versus wrinkled r, recessive) and seed color (yellow Y, dominant, versus green y, recessive) — the same two genes this calculator uses.',
          'What makes a dihybrid cross solvable without a 16-cell grid is Mendel’s law of independent assortment, which OpenStax states as: "genes do not influence each other with regard to the sorting of alleles into gametes, and every possible combination of alleles for every gene is equally likely to occur." Because the two genes sort independently, each trait’s outcome can be worked out on its own as a monohybrid cross, and the combined probability of any two-trait outcome is simply the product of each trait’s own probability.',
          'For the most famous case — both parents heterozygous for both genes (RrYy x RrYy) — that multiplication gives OpenStax’s own cited result: "a phenotypic ratio of 9 round/yellow:3 round/green:3 wrinkled/yellow:1 wrinkled/green" in the offspring, the signature 9:3:3:1 ratio. This calculator generalizes that same multiplication to any pair of genotypes for the two traits, not just the heterozygous-by-heterozygous case.'
        ]
      },
      howTo: {
        intro: 'Pick each parent’s genotype for both genes; all four offspring phenotype proportions calculate instantly.',
        steps: [
          { name: 'Pick each parent’s seed-shape genotype', text: 'RR (round, homozygous dominant), Rr (round, heterozygous) or rr (wrinkled, homozygous recessive), for both parents.' },
          { name: 'Pick each parent’s seed-color genotype', text: 'YY (yellow, homozygous dominant), Yy (yellow, heterozygous) or yy (green, homozygous recessive), for both parents.' },
          { name: 'Read the four phenotype classes', text: 'Round & yellow, round & green, wrinkled & yellow, wrinkled & green — the proportion of offspring expected to show each combination.' },
          { name: 'Try the classic cross', text: 'Set both parents to Rr and Yy for the textbook 9:3:3:1 ratio.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Each trait’s own dominant/recessive probability is worked out exactly as in a monohybrid cross; independent assortment means the two traits’ probabilities simply multiply together for any combined outcome.',
        expression: 'P(dominant, one trait) = 1 − (1 − P₁) × (1 − P₂)\nP(round & yellow) = P(dominant shape) × P(dominant color)\nP(round & green) = P(dominant shape) × P(recessive color)\nP(wrinkled & yellow) = P(recessive shape) × P(dominant color)\nP(wrinkled & green) = P(recessive shape) × P(recessive color)',
        terms: [
          { symbol: 'P₁, P₂', meaning: 'Each parent’s probability of passing on the dominant allele for one gene: 1 if homozygous dominant, ½ if heterozygous, 0 if homozygous recessive.' },
          { symbol: 'P(dominant), P(recessive)', meaning: 'The chance an offspring shows the dominant or recessive phenotype for one trait, from the monohybrid-cross formula applied to that trait alone.' },
          { symbol: 'Independent assortment', meaning: 'Mendel’s rule that the two genes sort into gametes independently of each other, which is exactly what allows the two traits’ probabilities to be multiplied rather than tracked jointly.' }
        ],
        note: 'This is the "forked-line" or "product rule" method OpenStax describes as an alternative to drawing a full 16-cell Punnett square — multiplying each trait’s own probability gives the identical answer with far less bookkeeping.'
      },
      workedExample: {
        intro: 'Both parents are heterozygous for both genes: RrYy x RrYy — the cross OpenStax illustrates with pea seed shape and color. What fraction of offspring fall into each of the four phenotype classes?',
        rows: [
          { label: 'Seed shape: P(dominant, round)', value: '¾ (75%), from Rr × Rr' },
          { label: 'Seed shape: P(recessive, wrinkled)', value: '¼ (25%)' },
          { label: 'Seed color: P(dominant, yellow)', value: '¾ (75%), from Yy × Yy' },
          { label: 'Seed color: P(recessive, green)', value: '¼ (25%)' },
          { label: 'Round & yellow (¾ × ¾)', value: '9/16 = 56.25%' },
          { label: 'Round & green (¾ × ¼)', value: '3/16 = 18.75%' },
          { label: 'Wrinkled & yellow (¼ × ¾)', value: '3/16 = 18.75%' },
          { label: 'Wrinkled & green (¼ × ¼)', value: '1/16 = 6.25%' }
        ],
        result: '9:3:3:1 — 56.25% round/yellow, 18.75% round/green, 18.75% wrinkled/yellow, 6.25% wrinkled/green',
        explanation: 'Each gene alone gives a standard 3:1 monohybrid ratio (75% dominant, 25% recessive). Independent assortment means the two traits combine by straight multiplication: 0.75 × 0.75 = 0.5625 (9/16), 0.75 × 0.25 = 0.1875 (3/16) twice, and 0.25 × 0.25 = 0.0625 (1/16) — the four proportions add back up to exactly 1 (16/16), and dividing each by the smallest, 6.25%, recovers the familiar whole-number ratio 9:3:3:1.'
      },
      watchOut: [
        { title: 'Independent assortment assumes the two genes are not linked', body: 'OpenStax’s law of independent assortment holds for genes on different chromosomes, or far enough apart on the same chromosome to recombine freely. Genes physically close together on the same chromosome (linked genes) are inherited together more often than this multiplication predicts.' },
        { title: 'This is a probability, not a guarantee for any one offspring', body: 'A 9:3:3:1 ratio describes the expected proportions across many offspring, not what any single seed pod or litter must contain — small real samples deviate from the theoretical ratio by chance.' },
        { title: 'Two genes only', body: 'This page multiplies exactly two traits’ probabilities together. A trihybrid cross (three genes) needs a third multiplication this calculator does not perform.' },
        { title: 'Don’t confuse this with the single-gene Punnett square', body: 'If only one trait actually matters for the question being asked, use punnett-square-calculator instead — mixing in a second, irrelevant gene here will only dilute each phenotype class’s proportion for no reason.' }
      ],
      references: [
        { label: 'OpenStax, Biology 2e, §12.3 "Laws of Inheritance"', url: 'https://openstax.org/books/biology-2e/pages/12-3-laws-of-inheritance' },
        { label: 'OpenStax, Biology 2e, §12.2 "Characteristics and Traits"', url: 'https://openstax.org/books/biology-2e/pages/12-2-characteristics-and-traits' }
      ]
    },
    inputs: [
      { id: 'parent1Shape', label: 'Parent 1 seed-shape genotype', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0, options: SEED_SHAPE_OPTIONS },
      { id: 'parent2Shape', label: 'Parent 2 seed-shape genotype', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0, options: SEED_SHAPE_OPTIONS },
      { id: 'parent1Color', label: 'Parent 1 seed-color genotype', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0, options: SEED_COLOR_OPTIONS },
      { id: 'parent2Color', label: 'Parent 2 seed-color genotype', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0, options: SEED_COLOR_OPTIONS }
    ],
    breakdown: {
      headline: 'dominantDominant',
      headlineLabel: 'Round & yellow (both dominant traits)',
      outputs: [
        { id: 'dominantDominant', label: 'Round & yellow', format: 'percent' },
        { id: 'dominantRecessive', label: 'Round & green', format: 'percent' },
        { id: 'recessiveDominant', label: 'Wrinkled & yellow', format: 'percent' },
        { id: 'recessiveRecessive', label: 'Wrinkled & green', format: 'percent' }
      ],
      groups: [
        { title: 'Seed shape genotypes', inputs: ['parent1Shape', 'parent2Shape'] },
        { title: 'Seed color genotypes', inputs: ['parent1Color', 'parent2Color'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'dominantDominant', label: 'Round, yellow' },
          { from: 'dominantRecessive', label: 'Round, green' },
          { from: 'recessiveDominant', label: 'Wrinkled, yellow' },
          { from: 'recessiveRecessive', label: 'Wrinkled, green' }
        ],
        center: 'dominantDominant',
        centerSub: 'round & yellow'
      }
    },
    seo: {
      title: 'Dihybrid Cross Calculator (9:3:3:1 Ratio)',
      description: 'Free dihybrid cross calculator. Cross two genes across two parents and get all four phenotype proportions — the classic 9:3:3:1 ratio, for any genotype pair.',
      faq: [
        { question: 'What is a dihybrid cross?', answer: 'A genetic cross that tracks two genes for two different traits at once, between parents that differ in both — OpenStax’s own example crosses pea seed shape (round/wrinkled) with seed color (yellow/green).' },
        { question: 'What is the 9:3:3:1 ratio?', answer: 'The phenotype ratio produced when both parents are heterozygous for both genes (RrYy x RrYy): 9/16 show both dominant traits, 3/16 show each single dominant-recessive combination, and 1/16 shows both recessive traits.' },
        { question: 'What is the law of independent assortment?', answer: 'Mendel’s principle that "genes do not influence each other with regard to the sorting of alleles into gametes, and every possible combination of alleles for every gene is equally likely to occur" — it is what allows each trait’s probability to be multiplied rather than tracked jointly.' },
        { question: 'Does this work for genes that are linked on the same chromosome?', answer: 'No. Independent assortment assumes the two genes sort independently, which breaks down for genes physically close together on the same chromosome (linked genes) — they get inherited together more often than straight multiplication predicts.' },
        { question: 'What if both parents are homozygous for both traits?', answer: 'The cross becomes fully predictable — every offspring gets exactly one outcome rather than a spread of probabilities (for example, RRYY x rryy gives 100% RrYy offspring, all round and yellow).' },
        { question: 'How is this different from the Punnett square (monohybrid) calculator?', answer: 'Punnett-square-calculator tracks one gene; this page tracks two genes at once and multiplies their independent probabilities together — use whichever matches how many traits the question actually involves.' }
      ]
    },
    compute(values) {
      const recessiveFraction = (k1: number, k2: number) => (1 - k1 / 2) * (1 - k2 / 2);
      const recShape = recessiveFraction(values.parent1Shape, values.parent2Shape);
      const recColor = recessiveFraction(values.parent1Color, values.parent2Color);
      const domShape = 1 - recShape;
      const domColor = 1 - recColor;
      return {
        dominantDominant: domShape * domColor * 100,
        dominantRecessive: domShape * recColor * 100,
        recessiveDominant: recShape * domColor * 100,
        recessiveRecessive: recShape * recColor * 100
      };
    }
  },
  {
    id: 'hardy-weinberg-calculator',
    category: 'biology',
    glyph: 'p²q²',
    updatedAt: '2026-11-17',
    aliases: ['hardy-weinberg calculator', 'hardy weinberg equilibrium calculator', 'p2+2pq+q2 calculator', 'allele frequency equilibrium calculator', 'population genetics calculator', 'genotype frequency calculator'],
    related: ['allele-frequency-calculator', 'punnett-square-calculator', 'dihybrid-cross-calculator', 'probability-calculator'],
    title: 'Hardy-Weinberg Calculator (p² + 2pq + q² = 1)',
    description: 'Enter a dominant allele frequency and predict the equilibrium genotype frequencies — homozygous dominant, heterozygous and homozygous recessive — under the Hardy-Weinberg principle.',
    example: 'A dominant allele frequency of p = 70% predicts an equilibrium population that is 49% homozygous dominant, 42% heterozygous and 9% homozygous recessive.',
    solver: {
      defaultTarget: 'q',
      variables: [
        { id: 'p', label: 'Dominant allele frequency', symbol: 'p', dimension: 'percent', defaultValue: 70, defaultUnit: '%' },
        { id: 'q', label: 'Recessive allele frequency', symbol: 'q', dimension: 'percent', defaultValue: 30, defaultUnit: '%' }
      ],
      solve: {
        q: ({ p }) => 100 - p,
        p: ({ q }) => 100 - q
      },
      outputs: [
        { id: 'homozygousDominant', label: 'Homozygous dominant (p²)', dimension: 'percent', compute: (si) => (si.p / 100) ** 2 * 100 },
        { id: 'heterozygous', label: 'Heterozygous (2pq)', dimension: 'percent', compute: (si) => 2 * (si.p / 100) * (si.q / 100) * 100 },
        { id: 'homozygousRecessive', label: 'Homozygous recessive (q²)', dimension: 'percent', compute: (si) => (si.q / 100) ** 2 * 100 }
      ],
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'homozygousDominant', label: 'AA' },
            { from: 'heterozygous', label: 'Aa' },
            { from: 'homozygousRecessive', label: 'aa' }
          ],
          center: 'p',
          centerSub: 'dominant allele frequency'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is the Hardy-Weinberg principle?',
        paragraphs: [
          'OpenStax’s Biology 2e states the Hardy-Weinberg principle’s two equations directly: "p + q = 1" and "p² + 2pq + q² = 1" — where, as OpenStax puts it, "p...often represents the frequency of a particular allele...while the variable q represents the frequency of" the other allele at the same gene. Because every individual carries exactly two alleles for a gene, those two frequencies must add to 100% of the gene pool, and squaring and cross-multiplying them (as if alleles paired up entirely at random) predicts exactly what fraction of the population should be each genotype: AA, Aa, or aa.',
          'This prediction only holds under a specific set of conditions. OpenStax is explicit: "the Hardy-Weinberg principle assumes an infinitely large population and conditions with no mutations, migration, emigration, or selective pressure for or against genotype." Under those conditions, OpenStax notes, "a population\'s allele and genotype frequencies are inherently stable" — they do not drift from one generation to the next.',
          'That makes the Hardy-Weinberg principle less a description of real populations (which always experience at least some mutation, migration, drift or selection) and more a null hypothesis: a baseline of "no evolution happening at this gene" to compare an actual, measured population against. A real population’s genotype frequencies matching the Hardy-Weinberg prediction closely is itself informative — it suggests this particular gene is not currently under strong selection, migration or drift.'
        ]
      },
      howTo: {
        intro: 'Enter either allele frequency, p or q; the other and all three genotype frequencies fill in automatically.',
        steps: [
          { name: 'Find or estimate the allele frequency', text: 'p (or q) usually comes from directly counting genotypes in a real sample — see allele-frequency-calculator for that calculation — or from a value already reported in a study.' },
          { name: 'Enter p or q', text: 'Typing one fills in the other automatically, since p + q always equals 100%.' },
          { name: 'Read the predicted genotype frequencies', text: 'Homozygous dominant (p²), heterozygous (2pq) and homozygous recessive (q²) — what the population should look like at equilibrium.' },
          { name: 'Compare against a real, counted population', text: 'If the actual genotype counts differ noticeably from this prediction, something (selection, migration, non-random mating, a small population) may be acting on this gene.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The two Hardy-Weinberg equations link allele frequencies to the genotype frequencies they predict at equilibrium.',
        expression: 'p + q = 1\np² + 2pq + q² = 1\nAA frequency = p²\nAa frequency = 2pq\naa frequency = q²',
        terms: [
          { symbol: 'p', meaning: 'The frequency of the dominant allele in the gene pool — OpenStax’s own example uses it for the "Y" allele (yellow) in Mendel’s peas.' },
          { symbol: 'q', meaning: 'The frequency of the recessive allele — OpenStax’s "y" allele (green). Always 1 − p.' },
          { symbol: 'p², 2pq, q²', meaning: 'The predicted frequencies of the three genotypes, from treating the two alleles as pairing up at random — the same binomial expansion as (p + q)².' }
        ],
        note: 'This predicts genotype frequencies from an allele frequency, assuming the population meets the Hardy-Weinberg conditions. For the reverse direction — calculating an allele frequency directly from counted genotypes, without that assumption — see allele-frequency-calculator.'
      },
      workedExample: {
        intro: 'OpenStax’s own population genetics figure describes 500 pea plants: 245 homozygous dominant (YY), 210 heterozygous (Yy) and 45 homozygous recessive (yy) — giving allele frequencies p = 0.7 (Y) and q = 0.3 (y) (see allele-frequency-calculator for that count-based calculation). Does this population sit at Hardy-Weinberg equilibrium for this gene?',
        rows: [
          { label: 'Dominant allele frequency (p)', value: '70%' },
          { label: 'Recessive allele frequency (q = 100% − 70%)', value: '30%' },
          { label: 'Predicted homozygous dominant (p² = 0.7²)', value: '49%' },
          { label: 'Predicted heterozygous (2pq = 2 × 0.7 × 0.3)', value: '42%' },
          { label: 'Predicted homozygous recessive (q² = 0.3²)', value: '9%' },
          { label: 'Actual observed proportions (245, 210, 45 of 500)', value: '49%, 42%, 9%' }
        ],
        result: 'Predicted 49% / 42% / 9% matches the population’s actual observed proportions exactly',
        explanation: 'Squaring p = 0.7 gives 0.49 (49%); squaring q = 0.3 gives 0.09 (9%); doubling the cross product, 2 × 0.7 × 0.3, gives 0.42 (42%) — and the three add to exactly 100%. Dividing OpenStax’s own counts by the 500-plant total (245 ÷ 500, 210 ÷ 500, 45 ÷ 500) gives the identical 49%, 42%, 9% — so, for this particular gene, this population is exactly at Hardy-Weinberg equilibrium.'
      },
      watchOut: [
        { title: 'The equilibrium conditions rarely hold exactly', body: 'OpenStax’s own conditions — "an infinitely large population and...no mutations, migration, emigration, or selective pressure" — describe an idealization. Every real population experiences at least some of these, so this calculator’s prediction is a baseline to compare against, not a guarantee of what a real population looks like.' },
        { title: 'This predicts; it does not measure', body: 'This page starts from an allele frequency (already known or assumed) and predicts genotype frequencies. It does not calculate an allele frequency from actual counted individuals — that is the opposite direction, covered by allele-frequency-calculator.' },
        { title: 'p and q must describe the same gene', body: 'Entering an allele frequency for one gene and expecting a genotype prediction for an unrelated gene gives a meaningless answer — p and q have to be the two alleles of one specific locus.' },
        { title: 'Only two alleles per gene', body: 'The classic p + q = 1 equation assumes a gene with exactly two alleles. A gene with three or more alleles in the population needs a generalized multi-allele version of the same idea, which this calculator does not compute.' }
      ],
      references: [
        { label: 'OpenStax, Biology 2e, §19.1 "Population Evolution"', url: 'https://openstax.org/books/biology-2e/pages/19-1-population-evolution' }
      ]
    },
    inputs: [{ id: 'p', label: 'Dominant allele frequency p (%)', type: 'number', placeholder: '70', defaultValue: 70, step: 0.1, min: 0 }],
    seo: {
      title: 'Hardy-Weinberg Calculator (p² + 2pq + q² = 1)',
      description: 'Free Hardy-Weinberg calculator. Enter an allele frequency and get predicted genotype frequencies: homozygous dominant, heterozygous and homozygous recessive.',
      faq: [
        { question: 'What is the Hardy-Weinberg equation?', answer: 'p + q = 1 and p² + 2pq + q² = 1, where p and q are the frequencies of a gene’s two alleles, and p², 2pq and q² are the predicted frequencies of the homozygous dominant, heterozygous and homozygous recessive genotypes at equilibrium.' },
        { question: 'What do p and q represent?', answer: 'p is the frequency of one allele (conventionally the dominant one) in a population’s gene pool; q is the frequency of the other allele at the same gene. They always add to 1 (100%).' },
        { question: 'What are the assumptions behind the Hardy-Weinberg principle?', answer: 'OpenStax states them directly: "an infinitely large population and conditions with no mutations, migration, emigration, or selective pressure for or against genotype." Real populations rarely meet all of these exactly.' },
        { question: 'How do I find genotype frequencies if I know the allele frequency p?', answer: 'Homozygous dominant frequency is p², heterozygous frequency is 2pq, and homozygous recessive frequency is q² (where q = 1 − p) — enter p and this calculator computes all three.' },
        { question: 'What does it mean if a real population does not match the predicted frequencies?', answer: 'It suggests the gene may be under selection, affected by migration or non-random mating, or that the population is small enough for random genetic drift — one or more of the Hardy-Weinberg assumptions is likely being violated for that gene.' },
        { question: 'How is this different from the allele frequency calculator?', answer: 'This page starts from an allele frequency and predicts equilibrium genotype frequencies. allele-frequency-calculator goes the other way: it calculates the allele frequency directly from actual genotype counts in a sample, with no equilibrium assumption.' }
      ]
    },
    compute(values) {
      return { q: 100 - values.p };
    }
  },
  {
    id: 'allele-frequency-calculator',
    category: 'biology',
    glyph: 'f(A)',
    updatedAt: '2026-11-17',
    aliases: ['allele frequency calculator', 'gene frequency calculator', 'allele frequency from genotype counts', 'population allele frequency calculator', 'p and q allele calculator', 'gene pool frequency calculator'],
    related: ['hardy-weinberg-calculator', 'punnett-square-calculator', 'dihybrid-cross-calculator', 'probability-calculator'],
    title: 'Allele Frequency Calculator (From Genotype Counts)',
    description: 'Count homozygous dominant, heterozygous and homozygous recessive individuals in a real population and calculate each allele’s observed frequency directly — no equilibrium assumption.',
    example: 'A population of 500 pea plants with 245 homozygous dominant, 210 heterozygous and 45 homozygous recessive individuals has a dominant allele frequency of 70% and a recessive allele frequency of 30%.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is allele frequency, and how is it counted?',
        paragraphs: [
          'OpenStax’s Biology 2e defines the gene pool as "the sum of all the alleles in a population," and allele frequency (or gene frequency) as "the rate at which a specific allele appears within a population." Counting it directly just means counting every copy of an allele actually present in a sample of individuals, then dividing by the total number of allele copies in that sample.',
          'Because each diploid individual carries two alleles per gene, a homozygous individual (AA or aa) contributes two copies of the same allele, while a heterozygous individual (Aa) contributes one copy of each. OpenStax’s own worked example makes this concrete: a population of 500 pea plants with 245 homozygous dominant (YY), 210 heterozygous (Yy) and 45 homozygous recessive (yy) individuals has "the number of capital Y alleles...490 from homozygous dominant individuals plus 210 from heterozygous individuals, or 700 total," out of 1,000 total allele copies (2 per plant × 500 plants) — giving an allele frequency, OpenStax states, of "700 divided by 1000, or 0.7."',
          'This is a direct count from real, observed individuals — it makes no assumption about the population being at any kind of genetic equilibrium. That is the key difference from hardy-weinberg-calculator, which starts from an allele frequency (observed this way, or simply assumed) and predicts what the genotype frequencies should be if the population is at equilibrium. This page answers "what is the allele frequency, given what was actually counted?"; that one answers "given an allele frequency, what genotype frequencies should a population at equilibrium show?"'
        ]
      },
      howTo: {
        intro: 'Count (or look up) how many individuals in a sample have each genotype, enter the three counts, and both allele frequencies calculate automatically.',
        steps: [
          { name: 'Count homozygous dominant individuals', text: 'Individuals carrying two copies of the dominant allele (AA).' },
          { name: 'Count heterozygous individuals', text: 'Individuals carrying one copy of each allele (Aa).' },
          { name: 'Count homozygous recessive individuals', text: 'Individuals carrying two copies of the recessive allele (aa).' },
          { name: 'Read the allele frequencies', text: 'p (dominant allele frequency) and q (recessive allele frequency), computed directly from the total allele copies in the sample, along with the total individuals and total alleles counted.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Each genotype contributes a known number of allele copies; summing them and dividing by the total allele count gives each allele’s observed frequency directly.',
        expression: 'Total individuals = countAA + countAa + countaa\nTotal alleles = 2 × total individuals\np = (2 × countAA + countAa) ÷ total alleles\nq = (2 × countaa + countAa) ÷ total alleles',
        terms: [
          { symbol: 'countAA, countAa, countaa', meaning: 'The number of individuals actually counted with each genotype.' },
          { symbol: 'p', meaning: 'The observed frequency of the dominant allele — every homozygous dominant individual contributes two copies, every heterozygous individual contributes one.' },
          { symbol: 'q', meaning: 'The observed frequency of the recessive allele, counted the same way. Always 1 − p, since every allele copy in the sample is one or the other.' }
        ],
        note: 'This counts alleles directly from a real sample — it carries no Hardy-Weinberg equilibrium assumption. See hardy-weinberg-calculator for the reverse, predictive calculation.'
      },
      workedExample: {
        intro: 'OpenStax’s own figure: a population of 500 pea plants has 245 homozygous dominant (YY), 210 heterozygous (Yy) and 45 homozygous recessive (yy) individuals. What are the Y and y allele frequencies?',
        rows: [
          { label: 'Homozygous dominant count (YY)', value: '245' },
          { label: 'Heterozygous count (Yy)', value: '210' },
          { label: 'Homozygous recessive count (yy)', value: '45' },
          { label: 'Total individuals (245 + 210 + 45)', value: '500' },
          { label: 'Total alleles (2 × 500)', value: '1,000' },
          { label: 'Y allele count (2 × 245 + 210)', value: '700' },
          { label: 'y allele count (2 × 45 + 210)', value: '300' },
          { label: 'p, frequency of Y (700 ÷ 1,000)', value: '0.7 (70%)' },
          { label: 'q, frequency of y (300 ÷ 1,000)', value: '0.3 (30%)' }
        ],
        result: 'p = 70%, q = 30%',
        explanation: 'Each of the 245 YY plants carries two Y alleles (490 total) and each of the 210 Yy plants carries one more (210), for 700 Y alleles. Each of the 45 yy plants carries two y alleles (90 total) and the same 210 Yy plants each carry one y allele, for 300 y alleles. Out of 1,000 total allele copies (2 per plant × 500 plants), 700 ÷ 1,000 = 0.7 and 300 ÷ 1,000 = 0.3 — matching OpenStax’s own stated result exactly.'
      },
      watchOut: [
        { title: 'This counts alleles directly — it assumes nothing about equilibrium', body: 'Unlike hardy-weinberg-calculator, this page makes no assumption that the population is free of selection, migration or drift. It simply reports what the sample’s genotype counts actually add up to.' },
        { title: 'A small sample gives a noisy estimate', body: 'Counting only a handful of individuals can give an allele frequency far from the gene pool’s true value purely by chance — a larger, representative sample gives a more reliable estimate.' },
        { title: 'This assumes every individual was correctly genotyped', body: 'If the dominant and heterozygous phenotypes look identical (as they usually do), telling AA apart from Aa by eye is impossible — these counts need an actual genetic test, a pedigree, or (for self-pollinating organisms like Mendel’s peas) a cross with known parents, not a guess from appearance.' },
        { title: 'p and q must sum to 1', body: 'Since every allele copy counted is either the dominant or the recessive one, p + q always equals exactly 100% for a correctly counted sample — if a hand calculation gives something else, recheck the counts.' }
      ],
      references: [
        { label: 'OpenStax, Biology 2e, §19.1 "Population Evolution"', url: 'https://openstax.org/books/biology-2e/pages/19-1-population-evolution' }
      ]
    },
    inputs: [
      { id: 'countAA', label: 'Homozygous dominant count (AA)', type: 'number', placeholder: '245', defaultValue: 245, step: 1, min: 0 },
      { id: 'countAa', label: 'Heterozygous count (Aa)', type: 'number', placeholder: '210', defaultValue: 210, step: 1, min: 0 },
      { id: 'countaa', label: 'Homozygous recessive count (aa)', type: 'number', placeholder: '45', defaultValue: 45, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'p',
      headlineLabel: 'Dominant allele frequency (p)',
      outputs: [
        { id: 'p', label: 'Dominant allele frequency (p)', format: 'percent' },
        { id: 'q', label: 'Recessive allele frequency (q)', format: 'percent' },
        { id: 'totalIndividuals', label: 'Total individuals counted', format: 'integer' },
        { id: 'totalAlleles', label: 'Total alleles counted', format: 'integer' },
        { id: 'pAlleleCount', label: 'Dominant allele copies', format: 'integer' },
        { id: 'qAlleleCount', label: 'Recessive allele copies', format: 'integer' }
      ],
      groups: [{ title: 'Genotype counts', inputs: ['countAA', 'countAa', 'countaa'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'pAlleleCount', label: 'Dominant allele' },
          { from: 'qAlleleCount', label: 'Recessive allele' }
        ],
        center: 'p',
        centerSub: 'dominant allele frequency'
      }
    },
    seo: {
      title: 'Allele Frequency Calculator (From Genotype Counts)',
      description: 'Free allele frequency calculator. Enter homozygous dominant, heterozygous and homozygous recessive counts and get each allele’s observed frequency directly.',
      faq: [
        { question: 'How do you calculate allele frequency from genotype counts?', answer: 'Count each allele copy directly: a homozygous individual contributes two copies of its allele, a heterozygous individual contributes one of each. Divide each allele’s total copies by the total number of alleles counted (2 × the number of individuals).' },
        { question: 'What is allele frequency?', answer: 'OpenStax defines it as "the rate at which a specific allele appears within a population" — the fraction of all allele copies at a gene, across every individual sampled, that are one particular allele.' },
        { question: 'What is a gene pool?', answer: '"The sum of all the alleles in a population" (OpenStax) — every copy of every allele, at every gene, carried by every individual in the population.' },
        { question: 'Do p and q always add up to 1?', answer: 'Yes, for a gene with exactly two alleles — every allele copy counted is one or the other, so their frequencies must sum to exactly 100%.' },
        { question: 'Is this the same as the Hardy-Weinberg calculator?', answer: 'No. This page calculates an allele frequency directly from counted individuals, with no assumptions. hardy-weinberg-calculator goes the other direction: starting from an allele frequency, it predicts what genotype frequencies a population at equilibrium should show.' },
        { question: 'Why does a heterozygous individual only count once toward each allele?', answer: 'A heterozygous (Aa) individual carries exactly one copy of each allele, so it contributes one count toward the dominant allele’s total and one toward the recessive allele’s total — never two of the same.' }
      ]
    },
    compute(values) {
      const totalIndividuals = values.countAA + values.countAa + values.countaa;
      const totalAlleles = 2 * totalIndividuals;
      const pAlleleCount = 2 * values.countAA + values.countAa;
      const qAlleleCount = 2 * values.countaa + values.countAa;
      return {
        p: (pAlleleCount / totalAlleles) * 100,
        q: (qAlleleCount / totalAlleles) * 100,
        totalIndividuals,
        totalAlleles,
        pAlleleCount,
        qAlleleCount
      };
    }
  },
  {
    id: 'dna-to-mrna-calculator',
    category: 'biology',
    glyph: 'mRNA',
    updatedAt: '2026-11-17',
    aliases: ['dna to mrna calculator', 'transcription calculator', 'dna to rna converter', 'mrna sequence calculator', 'complementary dna strand calculator', 'dna transcription tool'],
    related: ['dna-concentration-calculator', 'protein-concentration-calculator', 'punnett-square-calculator', 'bacterial-growth-calculator'],
    title: 'DNA to mRNA Calculator (Transcription)',
    description: 'Enter a short DNA template strand, base by base, and get its complementary DNA strand and the mRNA transcript — the T-to-U substitution of transcription, shown one base at a time.',
    example: 'A DNA template strand of A-T-G-C-G-T transcribes to the mRNA strand U-A-C-G-C-A — each base paired by Watson-Crick rules, with U standing in for T.',
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What happens when DNA is transcribed into mRNA?',
        paragraphs: [
          'Transcription copies one strand of DNA into a matching strand of messenger RNA (mRNA). OpenStax’s Biology 2e is specific about which DNA strand gets copied: "transcription always proceeds from the same DNA strand for each gene, which is called the template strand." RNA polymerase reads the template strand and builds an mRNA strand base by base, pairing each DNA base with its RNA partner the same way DNA’s own two strands pair with each other.',
          'The pairing rule is almost the same as DNA-to-DNA base pairing, with one change. OpenStax states it directly: "the only nucleotide difference is that in mRNA, all of the T nucleotides are replaced with U nucleotides," and "in an RNA double helix, A can bind U via two hydrogen bonds, just as in A–T pairing in a DNA double helix." So a template A still pairs with what would be a T in DNA — but since the product is RNA, it comes out as U instead. G and C pair with each other exactly as in DNA, unchanged.',
          'OpenStax also notes that "the mRNA product is complementary to the template strand and is almost identical to the other DNA strand, called the nontemplate strand, or the coding strand" — identical, that is, except that every T in the coding strand becomes a U in the mRNA. This calculator demonstrates the template-strand-to-mRNA direction, one base at a time, on a short six-base sequence.'
        ]
      },
      howTo: {
        intro: 'Pick each base of a short DNA template strand, in order; the complementary DNA strand and the mRNA transcript fill in instantly, base by base.',
        steps: [
          { name: 'Enter the DNA template strand', text: 'Pick A, T, G or C for each of the six positions, in the order they appear in the template strand being transcribed.' },
          { name: 'Read the complementary DNA strand', text: 'Each position pairs by the usual DNA rule: A with T, G with C.' },
          { name: 'Read the mRNA strand', text: 'The same pairing, except every position that would be a T in DNA appears as U instead, since mRNA has no thymine.' },
          { name: 'Check the GC content', text: 'The share of the transcript that is G or C, a simple bonus figure summarizing the sequence.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Each DNA base pairs with exactly one partner; the mRNA strand uses that same pairing, substituting U wherever DNA would use T.',
        expression: 'DNA pairing: A ↔ T, G ↔ C\nmRNA pairing: A → U, T → A, G → C, C → G',
        terms: [
          { symbol: 'Template strand', meaning: 'The DNA strand actually read and copied — "transcription always proceeds from the same DNA strand for each gene" (OpenStax).' },
          { symbol: 'Complementary (coding) DNA strand', meaning: 'The template strand’s normal DNA complement — identical to the mRNA transcript except that it still uses T where the mRNA uses U.' },
          { symbol: 'mRNA strand', meaning: 'Complementary to the template strand, using RNA’s base U everywhere the DNA complement would use T.' },
          { symbol: 'GC content', meaning: 'The share of bases that are G or C rather than A or T/U — a simple descriptive figure, shown here as a bonus output.' }
        ],
        note: 'This pairs bases position by position, the way an introductory textbook exercise typically presents a "write the complementary strand" problem — it does not make any claim about which physical end (5′ or 3′) of the molecule either sequence starts from.'
      },
      workedExample: {
        intro: 'A short DNA template strand reads A-T-G-C-G-T. What is its complementary DNA strand, and what mRNA does it transcribe to?',
        rows: [
          { label: 'Template strand', value: 'A  T  G  C  G  T' },
          { label: 'Complementary DNA strand (A↔T, G↔C)', value: 'T  A  C  G  C  A' },
          { label: 'mRNA strand (same pairing, U for T)', value: 'U  A  C  G  C  A' },
          { label: 'GC content (3 of 6 bases are G or C)', value: '50%' }
        ],
        result: 'mRNA strand: U-A-C-G-C-A',
        explanation: 'Each template base pairs by the Watson-Crick rule: A pairs with T, T with A, G with C, and C with G, giving the complementary DNA strand T-A-C-G-C-A. The mRNA strand uses the identical pairing, except any position that would be a T becomes a U instead — only the first position changes (T becomes U), since T only appears once in this complementary strand. As a cross-check, the mRNA strand should also equal the DNA coding strand (the complementary strand above) with every T swapped for U directly: T-A-C-G-C-A becomes U-A-C-G-C-A — the same answer both ways. Three of the six bases (G, C, C) are G or C, for a GC content of 3 ÷ 6 = 50%.'
      },
      watchOut: [
        { title: 'This expects the template strand, not the coding strand', body: 'Gene databases and textbooks usually give a sequence as the coding (sense) strand, not the template strand — and a coding strand only needs a direct T→U swap, no complementing at all. Entering a coding-strand sequence into this calculator as if it were the template strand will give the wrong mRNA (effectively the reverse of the correct pairing partner), not just a different label.' },
        { title: 'RNA pairs A with U, not A with T', body: 'It is tempting to treat U as "a T that behaves normally," but the molecule is genuinely different — OpenStax notes RNA’s A-U pairing uses "two hydrogen bonds, just as in A–T pairing in a DNA double helix," the same bond count, but a different, lighter base.' },
        { title: 'This models only the base-pairing step, not all of transcription', body: 'Real transcription involves RNA polymerase binding a promoter, elongating the strand, and terminating at a specific signal — and in eukaryotes, further processing (splicing, capping, polyadenylation) before the mRNA is mature. This calculator performs only the base-level pairing and substitution, not the full biological process.' },
        { title: 'Six bases is a worked demonstration, not a full-gene tool', body: 'This page is sized for learning the pairing rule on a short sequence. A full gene is hundreds to thousands of bases long; the identical per-base rule (complement, then substitute T for U) applies to a sequence of any length, just not inside this particular widget.' }
      ],
      references: [
        { label: 'OpenStax, Biology 2e, §15.2 "Prokaryotic Transcription"', url: 'https://openstax.org/books/biology-2e/pages/15-2-prokaryotic-transcription' }
      ]
    },
    inputs: [
      { id: 'base1', label: 'Base 1', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: DNA_BASE_OPTIONS },
      { id: 'base2', label: 'Base 2', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0, options: DNA_BASE_OPTIONS },
      { id: 'base3', label: 'Base 3', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0, options: DNA_BASE_OPTIONS },
      { id: 'base4', label: 'Base 4', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 0, options: DNA_BASE_OPTIONS },
      { id: 'base5', label: 'Base 5', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0, options: DNA_BASE_OPTIONS },
      { id: 'base6', label: 'Base 6', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0, options: DNA_BASE_OPTIONS }
    ],
    breakdown: {
      headline: 'gcPercent',
      headlineLabel: 'GC content of the mRNA transcript',
      outputs: [
        { id: 'gcPercent', label: 'GC content', format: 'percent' },
        { id: 'complementBase1', label: 'Base 1 — complementary DNA strand', labels: DNA_STRAND_LABELS },
        { id: 'mrnaBase1', label: 'Base 1 — mRNA strand', labels: MRNA_STRAND_LABELS },
        { id: 'complementBase2', label: 'Base 2 — complementary DNA strand', labels: DNA_STRAND_LABELS },
        { id: 'mrnaBase2', label: 'Base 2 — mRNA strand', labels: MRNA_STRAND_LABELS },
        { id: 'complementBase3', label: 'Base 3 — complementary DNA strand', labels: DNA_STRAND_LABELS },
        { id: 'mrnaBase3', label: 'Base 3 — mRNA strand', labels: MRNA_STRAND_LABELS },
        { id: 'complementBase4', label: 'Base 4 — complementary DNA strand', labels: DNA_STRAND_LABELS },
        { id: 'mrnaBase4', label: 'Base 4 — mRNA strand', labels: MRNA_STRAND_LABELS },
        { id: 'complementBase5', label: 'Base 5 — complementary DNA strand', labels: DNA_STRAND_LABELS },
        { id: 'mrnaBase5', label: 'Base 5 — mRNA strand', labels: MRNA_STRAND_LABELS },
        { id: 'complementBase6', label: 'Base 6 — complementary DNA strand', labels: DNA_STRAND_LABELS },
        { id: 'mrnaBase6', label: 'Base 6 — mRNA strand', labels: MRNA_STRAND_LABELS }
      ],
      groups: [{ title: 'DNA template strand (enter each base in order)', inputs: ['base1', 'base2', 'base3', 'base4', 'base5', 'base6'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'gcCount', label: 'G + C' },
          { from: 'atCount', label: 'A + T/U' }
        ],
        center: 'gcPercent',
        centerSub: 'GC content'
      }
    },
    seo: {
      title: 'DNA to mRNA Calculator (Transcription)',
      description: 'Free DNA to mRNA calculator. Enter a short DNA template strand and get the complementary DNA strand and mRNA transcript, base by base, with T replaced by U.',
      faq: [
        { question: 'How do you transcribe DNA into mRNA?', answer: 'Pair each base of the DNA template strand with its RNA partner — A with U, T with A, G with C, C with G — the same Watson-Crick pairing as DNA, except every position that would normally be a T comes out as U instead.' },
        { question: 'What is the DNA template strand?', answer: 'The one DNA strand RNA polymerase actually reads and copies to build mRNA. OpenStax’s Biology 2e states that "transcription always proceeds from the same DNA strand for each gene, which is called the template strand."' },
        { question: 'Why does mRNA have U instead of T?', answer: 'RNA uses uracil (U) in place of DNA’s thymine (T) as one of its four bases. OpenStax notes "the only nucleotide difference is that in mRNA, all of the T nucleotides are replaced with U nucleotides" — every other base pairs exactly as in DNA.' },
        { question: 'What is the difference between the template strand and the coding strand?', answer: 'The template strand is the one actually read during transcription. The coding (nontemplate) strand is the other DNA strand — OpenStax notes the mRNA product "is almost identical to the...coding strand," differing only by T becoming U.' },
        { question: 'Do I enter the template strand or the coding strand into this calculator?', answer: 'Enter the template strand. If you have the coding (sense) strand instead — the form most gene databases show — you don’t need this calculator’s complement step at all: just replace every T with U directly.' },
        { question: 'What is GC content and why does it matter?', answer: 'The percentage of bases that are G or C rather than A or T/U. It is a simple descriptive statistic; G-C base pairs form three hydrogen bonds versus two for A-T/A-U, which is part of why GC-rich DNA tends to be more thermally stable.' }
      ]
    },
    compute(values) {
      const result: Record<string, number> = {};
      let gcCount = 0;
      for (let i = 1; i <= 6; i += 1) {
        const templateCode = normalizeBaseCode(values[`base${i}`]);
        const pairCode = DNA_COMPLEMENT[templateCode];
        result[`complementBase${i}`] = pairCode;
        result[`mrnaBase${i}`] = pairCode;
        if (pairCode === 2 || pairCode === 3) gcCount += 1;
      }
      result.gcCount = gcCount;
      result.atCount = 6 - gcCount;
      result.gcPercent = (gcCount / 6) * 100;
      return result;
    }
  },
  {
    id: 'pcr-annealing-temperature-calculator',
    category: 'biology',
    glyph: 'Tm',
    updatedAt: '2026-11-17',
    aliases: ['pcr annealing temperature calculator', 'primer melting temperature calculator', 'wallace rule tm calculator', 'primer tm calculator', 'gc content primer calculator', 'oligo melting temperature calculator'],
    related: ['qpcr-efficiency-calculator', 'dna-concentration-calculator', 'molar-mass-calculator', 'percentage-calculator'],
    title: 'PCR Primer Annealing Temperature Calculator (Wallace Rule)',
    description: 'Estimate a PCR primer’s melting temperature from its length and GC content using the Wallace rule, Tm = 2°C×(A+T) + 4°C×(G+C) — a quick approximation, not an exact thermodynamic calculation.',
    example: 'A 20-base primer that is 60% GC (12 G/C bases, 8 A/T bases) has an estimated Tm of 2×8 + 4×12 = 64°C by the Wallace rule.',
    solver: {
      defaultTarget: 'meltingTemp',
      variables: [
        { id: 'primerLength', label: 'Primer length', symbol: 'N', dimension: 'count', defaultValue: 20, defaultUnit: 'count' },
        { id: 'gcContent', label: 'GC content', symbol: 'GC%', dimension: 'percent', defaultValue: 60, defaultUnit: '%' },
        { id: 'meltingTemp', label: 'Estimated melting temperature', symbol: 'Tm', dimension: 'temperature', defaultValue: 64, defaultUnit: 'C' }
      ],
      solve: {
        // Wallace rule, Td = 2(A+T) + 4(G+C) °C (Wallace, Shaffer, Murphy, Bonner, Hirose & Itakura,
        // 1979, Nucleic Acids Research). Writing the GC/AT base counts as fractions of the total
        // length N turns the original whole-base-count rule into a continuous function of N and GC%:
        // GC count = N x GC%/100, AT count = N - GC count, so
        // Tm = 2(N - N·GC%/100) + 4(N·GC%/100) = 2N + 2N·GC%/100 = 2N(1 + GC%/100). The result is a
        // Celsius reading, so +273.15 converts it to this dimension's SI base, kelvin.
        meltingTemp: ({ primerLength, gcContent }) => 2 * primerLength * (1 + gcContent / 100) + 273.15,
        primerLength: ({ meltingTemp, gcContent }) => (2 * (1 + gcContent / 100) === 0 ? NaN : (meltingTemp - 273.15) / (2 * (1 + gcContent / 100))),
        gcContent: ({ meltingTemp, primerLength }) => (primerLength === 0 ? NaN : 100 * ((meltingTemp - 273.15) / (2 * primerLength) - 1))
      },
      outputs: [
        { id: 'gcBaseCount', label: 'G+C bases (GC% × N)', dimension: 'count', compute: (si) => (si.primerLength * si.gcContent) / 100 },
        { id: 'atBaseCount', label: 'A+T bases (N − G+C)', dimension: 'count', compute: (si) => si.primerLength - (si.primerLength * si.gcContent) / 100 }
      ]
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is a primer annealing (melting) temperature?',
        paragraphs: [
          'A PCR primer is a short, single strand of DNA designed to bind ("anneal") to a specific matching sequence on the template before DNA polymerase extends it. Whether a primer stays bound at a given temperature depends on how strongly its bases pair with the template — and that strength depends on the primer’s base composition, because a G pairs with a C through three hydrogen bonds while an A pairs with a T through only two. A primer’s melting temperature, Tm, is the temperature at which half of the primer-template duplexes have come apart; PCR protocols typically anneal a few degrees below Tm so primers bind reliably without binding to the wrong, partially matching sequence.',
          'The Wallace rule is a quick way to estimate Tm directly from a primer’s base composition, without any thermodynamic calculation: Tm = 2°C × (number of A and T bases) + 4°C × (number of G and C bases). It comes from Wallace, Shaffer, Murphy, Bonner, Hirose and Itakura’s 1979 study in Nucleic Acids Research on how synthetic oligonucleotides hybridize to phiX174 DNA, and it is still the fastest rule-of-thumb check for short primers (conventionally cited as accurate only up to about 20–25 bases).',
          'This calculator rewrites the same rule in terms of the two numbers a primer-design tool usually reports directly — length and GC percentage — rather than requiring you to count A, T, G and C bases by hand. Because GC percentage is continuous rather than whole bases, the result is the same number the discrete, base-by-base version of the rule would give whenever GC% × length works out to a whole number of G/C bases, and a smooth interpolation otherwise.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the primer length, the GC content, and the estimated melting temperature; the third fills in automatically.',
        steps: [
          { name: 'Count the primer’s length', text: 'N — the total number of bases in the primer sequence.' },
          { name: 'Work out its GC content', text: 'The percentage of those bases that are G or C, from the primer sequence or a primer-design tool’s own report.' },
          { name: 'Enter the two values you know', text: 'The field left over, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Check the bonus G+C/A+T base counts', text: 'These show the whole-number base counts the continuous GC% implies, useful for sanity-checking against the actual sequence.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The Wallace rule, rewritten in terms of length and GC percentage, rearranges to solve for any of the three quantities.',
        expression: 'Tm = 2N(1 + GC% ÷ 100)\nN = Tm ÷ (2(1 + GC% ÷ 100))\nGC% = 100 × (Tm ÷ 2N − 1)',
        terms: [
          { symbol: 'N', meaning: 'Primer length, in bases.' },
          { symbol: 'GC%', meaning: 'The percentage of the primer’s bases that are G or C.' },
          { symbol: 'Tm', meaning: 'Estimated melting (annealing) temperature, in °C, by the Wallace rule.' },
          { symbol: '2°C, 4°C', meaning: 'The original rule’s per-base weights: 2°C for each A or T base (two hydrogen bonds), 4°C for each G or C base (three hydrogen bonds) — stronger base pairing raises the temperature needed to melt the duplex.' }
        ],
        note: 'This is a rough approximation, not a thermodynamic calculation — see "Things to watch out for" below before relying on it for primer design near the edges of its accuracy.'
      },
      workedExample: {
        intro: 'A 20-base primer is 60% GC. What is its estimated annealing temperature by the Wallace rule?',
        rows: [
          { label: 'Primer length (N)', value: '20 bases' },
          { label: 'GC content (GC%)', value: '60%' },
          { label: 'G+C bases (20 × 0.60)', value: '12' },
          { label: 'A+T bases (20 − 12)', value: '8' },
          { label: 'Tm = 2×8 + 4×12', value: '16 + 48 = 64°C' }
        ],
        result: 'Tm ≈ 64°C',
        explanation: '60% of 20 bases is 12 G/C bases, leaving 8 A/T bases. The Wallace rule weights each A/T base by 2°C and each G/C base by 4°C: 2×8 + 4×12 = 16 + 48 = 64°C. The length-and-GC%-based formula gives the identical number: 2×20×(1 + 0.60) = 40×1.60 = 64°C.'
      },
      watchOut: [
        { title: 'The Wallace rule is a rough approximation', body: 'It was developed for short oligonucleotides and is conventionally cited as reasonably accurate only up to about 20–25 bases. It ignores salt concentration, primer concentration, and the specific neighbor-to-neighbor base-pair interactions that real DNA thermodynamics depends on.' },
        { title: 'Real PCR design tools use more detailed models', body: 'Nearest-neighbor thermodynamic models (which account for which specific bases are next to each other, not just the overall A/T/G/C tally, plus salt and primer concentration) give a more accurate Tm for longer or more unusual primers. Treat this calculator’s output as a fast first estimate, not a replacement for a dedicated primer-design tool before ordering primers.' },
        { title: 'GC% alone does not capture base order', body: 'Two primers with the same length and GC% but a different arrangement of bases can have somewhat different real-world melting behavior (for example, a long run of G/C bases at one end behaves differently from the same bases spread evenly through the sequence) — this the rule cannot see.' },
        { title: 'Annealing temperature is not the same as Tm', body: 'A PCR protocol’s actual annealing temperature is normally set a few degrees below the estimated Tm (often 3–5°C), not equal to it, to give primers a reliable margin for binding.' }
      ],
      references: [
        { label: 'Wallace, R.B., Shaffer, J., Murphy, R.F., Bonner, J., Hirose, T. & Itakura, K. (1979), "Hybridization of synthetic oligodeoxyribonucleotides to phi X174 DNA: the effect of single base pair mismatch," Nucleic Acids Research, 6(11), 3543–3557 — the Wallace rule’s original source; confirmed via a search-engine-indexed summary rather than a direct fetch of the paper itself, flagged here for transparency', url: 'https://doi.org/10.1093/nar/6.11.3543' }
      ]
    },
    inputs: [
      { id: 'primerLength', label: 'Primer length (bases)', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 },
      { id: 'gcContent', label: 'GC content (%)', type: 'number', placeholder: '60', defaultValue: 60, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'PCR Annealing Temperature Calculator (Wallace Rule)',
      description: 'Free PCR primer Tm calculator using the Wallace rule. Estimate melting temperature from primer length and GC content, with a worked example.',
      faq: [
        { question: 'What is the Wallace rule for primer Tm?', answer: 'Tm = 2°C × (number of A/T bases) + 4°C × (number of G/C bases). A 20-base primer with 12 G/C bases and 8 A/T bases gives Tm = 2×8 + 4×12 = 64°C.' },
        { question: 'How accurate is the Wallace rule?', answer: 'It is a quick approximation, conventionally cited as reasonably reliable only for short primers (roughly up to 20–25 bases). It ignores salt concentration, primer concentration, and neighbor-to-neighbor base-pairing effects that more detailed nearest-neighbor thermodynamic models account for.' },
        { question: 'How do I calculate Tm from primer length and GC%, not individual base counts?', answer: 'Tm = 2 × N × (1 + GC% ÷ 100), where N is the primer length. This is an algebraic rewrite of the same Wallace rule: GC% × N gives the G/C base count, and the rest are A/T bases.' },
        { question: 'Why do G/C bases raise the melting temperature more than A/T bases?', answer: 'A G-C base pair forms three hydrogen bonds, while an A-T base pair forms only two — the extra hydrogen bond makes a G-C pair harder to separate, which the Wallace rule reflects by weighting G/C bases twice as heavily (4°C versus 2°C) as A/T bases.' },
        { question: 'Should I set my PCR annealing temperature equal to the calculated Tm?', answer: 'No — a PCR protocol’s annealing temperature is normally set a few degrees (often 3–5°C) below the estimated Tm, giving primers a reliable margin to bind specifically rather than melting away.' },
        { question: 'What is a better method than the Wallace rule for long or unusual primers?', answer: 'Nearest-neighbor thermodynamic calculations, which account for which specific bases sit next to each other (not just the overall A/T/G/C tally) along with salt and primer concentration, give a more accurate estimate — most dedicated primer-design software uses one of these instead of the Wallace rule.' }
      ]
    },
    compute(values) {
      return { meltingTemp: 2 * values.primerLength * (1 + values.gcContent / 100) + 273.15 };
    }
  },
  {
    id: 'qpcr-efficiency-calculator',
    category: 'biology',
    glyph: 'qE',
    updatedAt: '2026-11-17',
    aliases: ['qpcr efficiency calculator', 'standard curve slope efficiency calculator', 'real-time pcr efficiency calculator', 'pcr amplification efficiency calculator', 'ct slope efficiency calculator', 'qpcr standard curve calculator'],
    related: ['pcr-annealing-temperature-calculator', 'dna-concentration-calculator', 'logarithm-calculator', 'exponent-calculator'],
    title: 'qPCR Efficiency Calculator (E = 10^(−1/Slope) − 1)',
    description: 'Find a qPCR assay’s amplification efficiency from its standard curve’s slope, E = 10^(−1/slope) − 1 — or go the other way, from a target efficiency to the slope that would produce it.',
    example: 'A standard curve with a slope of −3.5 gives an amplification efficiency of about 93.1%, within the generally accepted 90–110% range.',
    solver: {
      defaultTarget: 'efficiencyPercent',
      variables: [
        { id: 'slope', label: 'Standard curve slope', symbol: 'S', dimension: 'count', defaultValue: -3.5, defaultUnit: 'count' },
        { id: 'efficiencyPercent', label: 'Amplification efficiency', symbol: 'E%', dimension: 'percent', defaultValue: 93.069772888325, defaultUnit: '%' }
      ],
      solve: {
        // E = 10^(-1/S) - 1, the standard formula for amplification efficiency from a qPCR standard
        // curve's slope S (Ct plotted against log10 starting quantity) — confirmed directly from
        // QIAGEN's own qPCR bench guide, "Determining Amplification Efficiencies." A slope of
        // exactly -log10(2) ≈ -3.3219 corresponds to E = 1 (100% efficiency, the template doubling
        // every cycle); the widely used MIQE guideline range of 90-110% efficiency corresponds to
        // slopes between about -3.58 and -3.10.
        efficiencyPercent: ({ slope }) => (slope === 0 ? NaN : (Math.pow(10, -1 / slope) - 1) * 100),
        slope: ({ efficiencyPercent }) => {
          const fraction = efficiencyPercent / 100;
          return fraction <= -1 ? NaN : -1 / Math.log10(1 + fraction);
        }
      },
      outputs: [
        // How many-fold the amplicon increases each cycle (1 + E) — the more intuitive "doubling"
        // framing most readers expect from a PCR efficiency figure.
        { id: 'foldPerCycle', label: 'Amplicon increase per cycle (1 + E)', dimension: 'count', compute: (si) => 1 + si.efficiencyPercent / 100 }
      ]
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is qPCR amplification efficiency?',
        paragraphs: [
          'Quantitative PCR (qPCR) tracks how much amplified DNA ("amplicon") has built up after each PCR cycle, reported as a cycle threshold, Ct — the cycle number at which the fluorescence signal crosses a fixed detection threshold. A standard curve is built by running several known dilutions of a template and plotting Ct against the log₁₀ of each dilution’s starting quantity; a perfectly efficient reaction, where the amplicon exactly doubles every cycle, produces a straight line with a slope of −log₁₀(2) ≈ −3.32.',
          'Amplification efficiency, E, measures how close a real reaction gets to that ideal doubling. QIAGEN’s own qPCR bench guide gives the standard formula for converting a standard curve’s measured slope directly into efficiency: E = 10^(−1/slope) − 1, with percent efficiency simply E × 100. An efficiency of exactly 1.0 (100%) means the amplicon doubles every cycle; the widely used MIQE guidelines for reporting qPCR consider an efficiency between about 90% and 110% (slopes between roughly −3.58 and −3.10) acceptable for a reliable assay.',
          'In practice, efficiency comes out somewhere below (or occasionally slightly above) 100% because of primer design, inhibitors in the sample, or pipetting and dilution error in building the standard curve itself — which is exactly why running a standard curve and checking its efficiency is a standard quality-control step before trusting a qPCR assay’s quantitative results.'
        ]
      },
      howTo: {
        intro: 'Enter either the standard curve slope or the target efficiency; the other fills in automatically.',
        steps: [
          { name: 'Build a standard curve', text: 'Run qPCR on a series of known dilutions of template and plot the resulting Ct values against log₁₀(starting quantity).' },
          { name: 'Find the slope', text: 'Fit a straight line through the points (most qPCR software does this automatically); its slope is the input S.' },
          { name: 'Enter the slope, or a target efficiency instead', text: 'If you are instead checking what slope a specific target efficiency (say, exactly 100%) would require, enter the efficiency and solve for the slope.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the other field becomes the new calculated one.' },
          { name: 'Check the result against the acceptable range', text: 'An efficiency between about 90% and 110% is the commonly used threshold for a reliable assay (see the watch-out notes below).' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Amplification efficiency and the standard curve’s slope convert directly into each other.',
        expression: 'E = 10^(−1 ÷ S) − 1\nS = −1 ÷ log₁₀(1 + E)\n%efficiency = E × 100',
        terms: [
          { symbol: 'S', meaning: 'The standard curve’s slope — Ct plotted against log₁₀(starting template quantity), a negative number for a normal qPCR assay.' },
          { symbol: 'E', meaning: 'Amplification efficiency as a fraction: 1.0 means the amplicon exactly doubles every cycle.' },
          { symbol: '%efficiency', meaning: 'E expressed as a percentage, the figure most qPCR software and papers actually report.' }
        ],
        note: 'A slope of exactly −log₁₀(2) ≈ −3.3219 gives E = 1 exactly (100% efficiency) — the theoretical best case for a reaction that perfectly doubles its amplicon every cycle.'
      },
      workedExample: {
        intro: 'A standard curve fit gives a slope of −3.5. What is the amplification efficiency?',
        rows: [
          { label: 'Slope (S)', value: '−3.5' },
          { label: '−1 ÷ S', value: '0.285714' },
          { label: '10^0.285714', value: '1.930698' },
          { label: 'E = 1.930698 − 1', value: '0.930698' },
          { label: 'Efficiency (E × 100)', value: '93.0698%' }
        ],
        result: 'Efficiency ≈ 93.07%',
        explanation: '−1 ÷ −3.5 = 0.285714…, and 10 raised to that power is 1.930698…, so E = 0.930698, or 93.07%. That falls inside the commonly cited 90–110% acceptable range, and corresponds to the amplicon increasing by a factor of 1.930698 (not quite doubling) every cycle.'
      },
      watchOut: [
        { title: 'This checks the standard curve, not the unknown samples', body: 'Efficiency describes how well the reaction amplifies across the standard curve’s dilution series. It does not, by itself, confirm that an unknown sample behaves the same way — inhibitors present only in the unknown sample can still distort its own Ct.' },
        { title: 'A slope close to zero is not "high efficiency," it is a failed curve', body: 'The formula blows up as the slope approaches 0 (division by a near-zero number), which corresponds to Ct barely changing across the dilution series — a sign the standard curve itself did not work, not an unusually efficient reaction.' },
        { title: 'Efficiency above 100% usually points to a problem, not a bonus', body: 'In principle E > 1 is mathematically possible from this formula (a slope flatter than −3.32), but in practice it almost always signals a pipetting or dilution error in the standard curve rather than an assay literally more than doubling each cycle.' },
        { title: 'The MIQE 90-110% range is a common guideline, not a universal pass/fail line', body: 'Different labs and applications set their own acceptance criteria; treat the widely cited 90-110% window as a reasonable default check, not a rule enforced by this calculator.' }
      ],
      references: [
        { label: 'QIAGEN, "Determining Amplification Efficiencies," PCR Technology Bench Guide', url: 'https://www.qiagen.com/us/knowledge-and-support/knowledge-hub/bench-guide/pcr/pcr-quantification/determining-amplification-efficiencies' }
      ]
    },
    inputs: [{ id: 'slope', label: 'Standard curve slope', type: 'number', placeholder: '-3.5', defaultValue: -3.5, step: 0.01 }],
    seo: {
      title: 'qPCR Efficiency Calculator (E = 10^(-1/Slope) − 1)',
      description: 'Free qPCR amplification efficiency calculator from a standard curve slope. E = 10^(-1/slope) − 1, with a worked example and the MIQE acceptable range.',
      faq: [
        { question: 'What is the qPCR efficiency formula?', answer: 'E = 10^(−1 ÷ slope) − 1, where slope is the standard curve’s Ct-versus-log₁₀(quantity) slope. Percent efficiency is E × 100. A slope of −3.5 gives an efficiency of about 93.07%.' },
        { question: 'What slope corresponds to 100% efficiency?', answer: 'A slope of exactly −log₁₀(2) ≈ −3.3219 gives E = 1 exactly — the amplicon doubling every cycle, the theoretical ideal for PCR.' },
        { question: 'What is a good qPCR efficiency value?', answer: 'The MIQE guidelines for reporting quantitative PCR experiments generally consider an efficiency between about 90% and 110% (slope between roughly −3.58 and −3.10) acceptable for a reliable assay.' },
        { question: 'What does a standard curve slope near zero mean?', answer: 'It means Ct barely changed across the dilution series — a sign the standard curve failed (poor primers, degraded template, or a dilution error), not an efficiency calculation problem. The efficiency formula is undefined at a slope of exactly 0.' },
        { question: 'Can qPCR efficiency be over 100%?', answer: 'The formula can mathematically return a value above 100% for a slope flatter than about −3.32, but this almost always indicates a pipetting or dilution error in the standard curve rather than a reaction that genuinely more than doubles each cycle.' },
        { question: 'Does this calculator check my actual unknown samples?', answer: 'No — it only converts a standard curve’s slope into an efficiency figure for that curve. A good standard curve efficiency does not by itself rule out inhibitors or other problems specific to an unknown sample.' }
      ]
    },
    compute(values) {
      return { efficiencyPercent: (Math.pow(10, -1 / values.slope) - 1) * 100 };
    }
  },
  {
    id: 'ligation-calculator',
    category: 'biology',
    glyph: 'I:V',
    updatedAt: '2026-11-17',
    aliases: ['ligation calculator', 'insert vector molar ratio calculator', 'dna ligation ratio calculator', 'cloning ligation calculator', 'insert to vector ratio calculator', 'ligation mass calculator'],
    related: ['dna-concentration-calculator', 'cell-dilution-calculator', 'molar-mass-calculator', 'ratio-calculator'],
    title: 'Ligation Calculator (Insert:Vector Molar Ratio)',
    description: 'Find the insert:vector molar ratio for a DNA ligation (or the insert mass needed for a target ratio) from the mass and length of your insert and vector DNA.',
    example: '50 ng of a 3 kb vector ligated with 50 ng of a 1 kb insert gives an insert:vector molar ratio of 3:1.',
    solver: {
      defaultTarget: 'massInsert',
      variables: [
        { id: 'massInsert', label: 'Insert mass', symbol: 'mᵢ', dimension: 'mass', defaultValue: 50, defaultUnit: 'ng' },
        { id: 'massVector', label: 'Vector mass', symbol: 'mᵥ', dimension: 'mass', defaultValue: 50, defaultUnit: 'ng' },
        { id: 'lengthInsert', label: 'Insert length', symbol: 'Lᵢ', dimension: 'basePairs', defaultValue: 1000, defaultUnit: 'bp' },
        { id: 'lengthVector', label: 'Vector length', symbol: 'Lᵥ', dimension: 'basePairs', defaultValue: 3000, defaultUnit: 'bp' },
        { id: 'molarRatio', label: 'Insert:vector molar ratio', symbol: 'R', dimension: 'count', defaultValue: 3, defaultUnit: 'count' }
      ],
      solve: {
        // Moles of a DNA fragment = mass / molecular weight, and a dsDNA fragment's molecular weight
        // is closely proportional to its length in base pairs (Thermo Fisher Scientific, "DNA and
        // RNA Molecular Weights and Conversions": M.W. of dsDNA (Da) = bp x 607.4 + 157.9 — so for a
        // shared, roughly constant average mass per base pair, MW cancels out of a molar RATIO
        // entirely: moles_insert / moles_vector = (mass_insert / MW_insert) / (mass_vector /
        // MW_vector) = (mass_insert / mass_vector) x (length_vector / length_insert). This is the
        // same formula NEB's own ligation calculator uses to convert a target molar ratio into an
        // insert mass (NEB's page returned 403 on a direct fetch; confirmed via a search-engine-
        // indexed summary of its stated formula instead, flagged here for transparency).
        molarRatio: ({ massInsert, massVector, lengthInsert, lengthVector }) =>
          massVector * lengthInsert === 0 ? NaN : (massInsert * lengthVector) / (massVector * lengthInsert),
        massInsert: ({ molarRatio, massVector, lengthInsert, lengthVector }) =>
          lengthVector === 0 ? NaN : (molarRatio * massVector * lengthInsert) / lengthVector,
        massVector: ({ molarRatio, massInsert, lengthInsert, lengthVector }) =>
          molarRatio * lengthInsert === 0 ? NaN : (massInsert * lengthVector) / (molarRatio * lengthInsert),
        lengthInsert: ({ molarRatio, massInsert, massVector, lengthVector }) =>
          molarRatio * massVector === 0 ? NaN : (massInsert * lengthVector) / (molarRatio * massVector),
        lengthVector: ({ molarRatio, massInsert, massVector, lengthInsert }) =>
          massInsert === 0 ? NaN : (molarRatio * massVector * lengthInsert) / massInsert
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is an insert:vector molar ratio, and why does it matter for ligation?',
        paragraphs: [
          'Cloning a gene or fragment ("the insert") into a plasmid ("the vector") usually ends with a ligation reaction, where DNA ligase joins the cut ends of insert and vector back together. Ligase works on individual DNA molecules, so what actually matters for a successful ligation is the molar ratio of insert molecules to vector molecules in the reaction — not the mass ratio, since a short insert and a long vector contain very different numbers of molecules per nanogram of DNA.',
          'A longer DNA molecule weighs proportionally more: Thermo Fisher Scientific’s own reference conversion gives the molecular weight of double-stranded DNA as approximately 607.4 Da per base pair (plus a small, fixed end correction). Because that per-base-pair weight is shared by both the insert and the vector, it cancels out when computing their molar RATIO, leaving a formula built entirely from numbers you can read directly off a gel or a NanoDrop reading and a vector map: molar ratio = (insert mass ÷ vector mass) × (vector length ÷ insert length).',
          'Most cloning protocols recommend an insert:vector molar ratio somewhere between about 1:1 and 10:1, with roughly 3:1 commonly used as a practical starting point — enough excess insert to favor insert ligation over the vector re-closing on itself, without using so much insert DNA that the reaction becomes crowded with insert-to-insert concatemers.'
        ]
      },
      howTo: {
        intro: 'Fill in any four of the five values — insert mass, vector mass, insert length, vector length, and the molar ratio; the fifth fills in automatically.',
        steps: [
          { name: 'Measure or look up your vector’s mass and length', text: 'Vector mass from a NanoDrop or gel-based estimate, and length in base pairs from its known sequence or map.' },
          { name: 'Measure or look up your insert’s length', text: 'The insert fragment’s length in base pairs — from a restriction digest, PCR product size, or sequence.' },
          { name: 'Pick a target molar ratio, or enter a known insert mass instead', text: 'A commonly used starting ratio is 3:1 (insert:vector); solve for the insert mass that ratio requires, or go the other way from a mass you already have.' },
          { name: 'Enter the four values you know', text: 'The field left over, marked auto, calculates as you type.' },
          { name: 'Read the result', text: 'The missing value — most often the insert mass to add to the ligation reaction — appears immediately in your chosen unit.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The molar-ratio formula rearranges to solve for any of the five quantities.',
        expression: 'R = (mᵢ ÷ mᵥ) × (Lᵥ ÷ Lᵢ)\nmᵢ = R × mᵥ × Lᵢ ÷ Lᵥ\nmᵥ = mᵢ × Lᵥ ÷ (R × Lᵢ)\nLᵢ = mᵢ × Lᵥ ÷ (R × mᵥ)\nLᵥ = R × mᵥ × Lᵢ ÷ mᵢ',
        terms: [
          { symbol: 'mᵢ, mᵥ', meaning: 'Mass of the insert and vector DNA actually used in the ligation reaction (commonly in ng).' },
          { symbol: 'Lᵢ, Lᵥ', meaning: 'Length of the insert and vector, in base pairs (bp) or kilobases (kb).' },
          { symbol: 'R', meaning: 'The insert:vector molar ratio — how many insert molecules there are for every vector molecule.' }
        ],
        note: 'This treats both fragments as having the same average molecular weight per base pair, which is an excellent approximation for typical cloning-sized fragments (hundreds of bp and up) — see "Things to watch out for" below for when it matters less well.'
      },
      workedExample: {
        intro: 'A ligation uses 50 ng of a 3 kb vector and 50 ng of a 1 kb insert. What is the insert:vector molar ratio?',
        rows: [
          { label: 'Insert mass (mᵢ)', value: '50 ng' },
          { label: 'Vector mass (mᵥ)', value: '50 ng' },
          { label: 'Insert length (Lᵢ)', value: '1 kb (1,000 bp)' },
          { label: 'Vector length (Lᵥ)', value: '3 kb (3,000 bp)' },
          { label: 'R = (50 ÷ 50) × (3,000 ÷ 1,000)', value: '1 × 3 = 3' }
        ],
        result: 'Insert:vector molar ratio = 3:1',
        explanation: 'Equal masses of insert and vector (50 ng each) do not mean equal numbers of molecules: the 3 kb vector is three times heavier per molecule than the 1 kb insert, so 50 ng of vector contains only a third as many molecules. The mass ratio of 1:1 therefore becomes a molar ratio of 3:1 once the length difference is accounted for.'
      },
      watchOut: [
        { title: 'Mass ratio and molar ratio are not the same thing', body: 'Equal masses of insert and vector only give an equal molar ratio when the two fragments are the same length. A 3 kb vector and a 1 kb insert at equal mass are a 3:1 molar ratio, not 1:1 — the whole reason this calculator exists.' },
        { title: 'This assumes a uniform average molecular weight per base pair', body: 'A fragment’s exact molecular weight depends slightly on its specific base composition and on a small, fixed end-correction term that does not scale with length — both are usually negligible for typical insert/vector sizes (hundreds of bp or more), but can introduce a small error for very short fragments (well under 100 bp).' },
        { title: 'Mass readings carry their own measurement error', body: 'A NanoDrop or gel-based DNA mass estimate has its own uncertainty, which carries straight through to the calculated molar ratio — this calculator cannot correct for an inaccurate input mass.' },
        { title: 'There is no single "correct" ratio for every ligation', body: 'Typical cloning protocols use somewhere between about 1:1 and 10:1 insert:vector, with 3:1 a common default — the right choice depends on the specific cloning strategy, insert availability, and whether background (vector self-ligation) is a concern.' }
      ],
      references: [
        { label: 'Thermo Fisher Scientific, "DNA and RNA Molecular Weights and Conversions"', url: 'https://www.thermofisher.com/us/en/home/references/ambion-tech-support/rna-tools-and-calculators/dna-and-rna-molecular-weights-and-conversions.html' },
        { label: 'New England Biolabs, Ligation Calculator — formula for converting a target insert:vector molar ratio into an insert mass (NEB’s page returned HTTP 403 on a direct fetch; its formula is confirmed here via a search-engine-indexed summary instead, flagged for transparency)', url: 'https://www.neb.com/en-us/tools-and-resources/interactive-tools/ligation-calculator' }
      ]
    },
    inputs: [
      { id: 'massVector', label: 'Vector mass (kg)', type: 'number', placeholder: '5e-11', defaultValue: 5e-11, step: 1e-12, min: 0 },
      { id: 'lengthInsert', label: 'Insert length (bp)', type: 'number', placeholder: '1000', defaultValue: 1000, step: 1, min: 1 },
      { id: 'lengthVector', label: 'Vector length (bp)', type: 'number', placeholder: '3000', defaultValue: 3000, step: 1, min: 1 },
      { id: 'molarRatio', label: 'Insert:vector molar ratio', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Ligation Calculator (Insert:Vector Molar Ratio)',
      description: 'Free DNA ligation calculator. Find the insert:vector molar ratio, or the insert mass needed for a target ratio, from mass and length in bp or kb.',
      faq: [
        { question: 'What is the ligation insert:vector molar ratio formula?', answer: 'Molar ratio = (insert mass ÷ vector mass) × (vector length ÷ insert length). 50 ng of a 1 kb insert and 50 ng of a 3 kb vector gives a molar ratio of 3:1.' },
        { question: 'Why isn’t a 1:1 mass ratio the same as a 1:1 molar ratio?', answer: 'Because longer DNA fragments weigh more per molecule. Equal masses of a long vector and a short insert contain different numbers of molecules, so the molar ratio (what actually matters to DNA ligase) differs from the mass ratio unless insert and vector happen to be the same length.' },
        { question: 'What is a good insert:vector molar ratio for cloning?', answer: 'Most protocols use somewhere between 1:1 and 10:1 (insert:vector), with about 3:1 a commonly used practical default — enough excess insert to favor insert ligation without flooding the reaction with insert DNA.' },
        { question: 'How do I calculate how much insert DNA to add?', answer: 'Solve for insert mass: mᵢ = R × mᵥ × Lᵢ ÷ Lᵥ, where R is your target molar ratio, mᵥ is the vector mass you are using, and Lᵢ/Lᵥ are the insert and vector lengths.' },
        { question: 'Does the exact molecular weight per base pair matter?', answer: 'Only slightly. The ratio formula assumes a shared average molecular weight per base pair for both fragments, which is an excellent approximation for typical insert/vector sizes — a fixed, length-independent end correction term in the exact molecular weight formula introduces a small error only for very short fragments.' },
        { question: 'Can I use kb instead of bp for the lengths?', answer: 'Yes — the ratio only depends on the length RATIO between insert and vector, so switching both lengths to kb (or any other consistent unit) gives the identical molar ratio.' }
      ]
    },
    compute(values) {
      return { massInsert: (values.molarRatio * values.massVector * values.lengthInsert) / values.lengthVector };
    }
  },
  {
    id: 'centrifuge-rcf-rpm-calculator',
    category: 'biology',
    glyph: 'RCF',
    updatedAt: '2026-11-17',
    aliases: ['centrifuge rcf rpm calculator', 'rcf to rpm calculator', 'rpm to rcf calculator', 'relative centrifugal force calculator', 'g-force centrifuge calculator', 'centrifuge speed calculator'],
    related: ['cell-dilution-calculator', 'centripetal-force-calculator', 'rpm-to-speed-calculator', 'bacterial-growth-calculator'],
    title: 'Centrifuge RCF ↔ RPM Calculator',
    description: 'Convert between a centrifuge’s rotational speed (RPM) and relative centrifugal force (RCF, ×g) for a given rotor radius — the real, radius-dependent physics, not a plain unit conversion.',
    example: 'A rotor with an 8 cm radius spinning at 10,000 RPM produces a relative centrifugal force of about 8,946×g.',
    solver: {
      defaultTarget: 'rcf',
      variables: [
        { id: 'radius', label: 'Rotor radius', symbol: 'r', dimension: 'length', defaultValue: 8, defaultUnit: 'cm' },
        { id: 'rpm', label: 'Rotational speed', symbol: 'N', dimension: 'angularVelocity', defaultValue: 10000, defaultUnit: 'rpm' },
        { id: 'rcf', label: 'Relative centrifugal force', symbol: 'RCF', dimension: 'relativeCentrifugalForce', defaultValue: 8945.951665305896, defaultUnit: 'xg' }
      ],
      solve: {
        // RCF (xg) = centripetal acceleration / standard gravity = omega^2 * r / g0 (omega in rad/s,
        // r in meters) — the same physics as any circular motion (OpenStax University Physics Volume
        // 1 SS6.3, "Centripetal Acceleration": a_c = omega^2 r). This is the exact SI form of the
        // conventional lab formula, RCF = 1.118 x 10^-5 x r(cm) x RPM^2, which is itself a rounding of
        // (2*pi/60)^2/g0 ~ 1.11824 x 10^-5 (confirmed against Wikipedia's "Centrifuge" article, which
        // states the formula as RCF = 1.118 x 10^-6 x r(mm) x RPM^2, i.e. 10x that for r in cm) — the
        // two forms agree to within the rounding of that published constant (about 0.02%).
        rcf: ({ radius, rpm }) => (rpm * rpm * radius) / STANDARD_GRAVITY,
        radius: ({ rpm, rcf }) => (rpm === 0 ? NaN : (rcf * STANDARD_GRAVITY) / (rpm * rpm)),
        rpm: ({ radius, rcf }) => (radius <= 0 || rcf < 0 ? NaN : Math.sqrt((rcf * STANDARD_GRAVITY) / radius))
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is relative centrifugal force (RCF)?',
        paragraphs: [
          'A centrifuge spins samples in a circle, and anything moving in a circle needs a centripetal (center-seeking) acceleration to keep it on that curved path rather than flying off in a straight line. OpenStax’s University Physics gives this acceleration as a_c = ω²r, where ω is the angular velocity (how fast the rotor spins, in radians per second) and r is the radius of the circular path — in a centrifuge, the distance from the spin axis out to the sample.',
          'Relative centrifugal force (RCF) reports that acceleration as a multiple of standard gravity, g, the same way a roller coaster’s "3g" turn or an astronaut’s "4g" launch does — RCF = a_c ÷ g. Because a_c depends on both the rotational speed and the radius, the same RPM produces very different RCF values on different rotors: a larger rotor radius means samples farther from the spin axis, which experience more centripetal acceleration at the same RPM. This is exactly why a protocol that specifies "spin at 10,000×g" cannot simply be read off a dial that shows RPM — the rotor’s own radius has to be known.',
          'Because RCF depends on the square of the rotational speed, doubling the RPM quadruples the RCF, while doubling the radius only doubles it — a detail that matters when swapping between rotors of different sizes on the same protocol.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the rotor radius, the rotational speed, and the RCF; the third fills in automatically.',
        steps: [
          { name: 'Find your rotor’s radius', text: 'Check the rotor’s manual or spec sheet for its radius — the distance from the spin axis to the sample, not the radius of the rotor housing itself.' },
          { name: 'Enter the radius and either the RPM or the target RCF', text: 'If your protocol specifies a target ×g value, enter that and solve for the RPM to set; if you know the RPM, solve for the resulting RCF.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching the radius unit (cm, mm, in) converts the number already there automatically.' },
          { name: 'Read the result', text: 'The missing value appears immediately — RCF in ×g, or RPM, or the radius.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The conventional lab formula (radius in centimeters, speed in RPM) and the equivalent SI physics form both describe the same relationship.',
        expression: 'RCF ≈ 1.118×10⁻⁵ × r(cm) × RPM²\nRCF = ω²r ÷ g (SI form: ω in rad/s, r in meters, g = 9.80665 m/s²)',
        terms: [
          { symbol: 'r', meaning: 'Rotor radius — the distance from the spin axis to the sample.' },
          { symbol: 'RPM, ω', meaning: 'Rotational speed, in revolutions per minute (RPM) or the equivalent angular velocity in radians per second, ω = RPM × 2π ÷ 60.' },
          { symbol: 'RCF', meaning: 'Relative centrifugal force, the centripetal acceleration expressed as a multiple of standard gravity (×g).' },
          { symbol: 'g = 9.80665 m/s²', meaning: 'Standard gravity (BIPM SI Brochure), the reference acceleration RCF is measured against.' }
        ],
        note: 'This calculator solves the exact SI physics form internally (ω²r ÷ g), which is equivalent to the commonly published 1.118×10⁻⁵ constant to within that constant’s own rounding (about 0.02%) — see the worked example.'
      },
      workedExample: {
        intro: 'A microcentrifuge rotor has an 8 cm radius and spins at 10,000 RPM. What RCF does that produce?',
        rows: [
          { label: 'Radius (r)', value: '8 cm = 0.08 m' },
          { label: 'Rotational speed (RPM)', value: '10,000' },
          { label: 'Angular velocity (ω = 10,000 × 2π ÷ 60)', value: '1,047.1976 rad/s' },
          { label: 'RCF = ω²r ÷ g = 1,047.1976² × 0.08 ÷ 9.80665', value: '≈ 8,945.95×g' },
          { label: 'Conventional formula check: 1.118×10⁻⁵ × 8 × 10,000²', value: '≈ 8,944×g (within 0.02%)' }
        ],
        result: 'RCF ≈ 8,946×g',
        explanation: 'Converting 10,000 RPM to radians per second gives ω ≈ 1,047.20 rad/s. Squaring that and multiplying by the 0.08 m radius gives the centripetal acceleration, which divided by standard gravity (9.80665 m/s²) gives an RCF of about 8,946×g — matching the conventional cm/RPM formula’s 8,944×g to within the rounding of its published constant.'
      },
      watchOut: [
        { title: 'Use the correct radius for your rotor', body: 'Protocols and spec sheets sometimes give a minimum, maximum, and average radius for a rotor, since samples at the bottom of a tube sit farther from the spin axis than samples at the top. Using the wrong one gives a systematically wrong RCF.' },
        { title: 'RCF scales with the SQUARE of RPM', body: 'Doubling the rotational speed quadruples the RCF, not doubles it — a common source of error when adjusting a protocol’s speed by "a bit more."' },
        { title: 'The same RPM means a different RCF on a different rotor', body: 'A protocol written as "13,000 RPM" assumes a specific rotor’s radius. Moving to a rotor with a different radius at the same RPM changes the actual force on the sample — matching the RCF (×g), not the RPM, is what carries a protocol correctly between different centrifuges.' },
        { title: 'The published 1.118×10⁻⁵ constant is itself rounded', body: 'The exact value, derived from ω²r/g, is closer to 1.1182×10⁻⁵ — a difference of about 0.02% from the commonly quoted figure, immaterial for lab work but the reason this calculator’s own internal math uses the exact physics form rather than the rounded constant.' }
      ],
      references: [
        { label: 'Wikipedia, "Centrifuge" (RCF formula and its mm/RPM constant, 1.118×10⁻⁶)', url: 'https://en.wikipedia.org/wiki/Centrifuge' },
        { label: 'OpenStax, University Physics Volume 1, §6.3 "Centripetal Acceleration"', url: 'https://openstax.org/books/university-physics-volume-1/pages/6-3-centripetal-acceleration' }
      ]
    },
    inputs: [
      { id: 'radius', label: 'Rotor radius (m)', type: 'number', placeholder: '0.08', defaultValue: 0.08, step: 0.001, min: 0 },
      { id: 'rpm', label: 'Rotational speed (rad/s)', type: 'number', placeholder: '1047.1976', defaultValue: 10000 * ((2 * Math.PI) / 60), step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Centrifuge RCF ↔ RPM Calculator',
      description: 'Free centrifuge RCF to RPM calculator (and back). Convert relative centrifugal force and rotational speed for a given rotor radius, with a worked example.',
      faq: [
        { question: 'What is the formula for RCF from RPM?', answer: 'RCF ≈ 1.118×10⁻⁵ × r(cm) × RPM², or exactly RCF = ω²r ÷ g in SI units (ω in rad/s, r in meters, g = 9.80665 m/s²). An 8 cm rotor at 10,000 RPM gives about 8,946×g.' },
        { question: 'Why does RCF depend on rotor radius, not just RPM?', answer: 'RCF is the centripetal acceleration (ω²r) expressed as a multiple of gravity — the same RPM produces more acceleration, and so more RCF, on a rotor where samples sit farther from the spin axis.' },
        { question: 'How do I convert a protocol’s ×g value to RPM for my centrifuge?', answer: 'Solve ω = √(RCF × g ÷ r) for your rotor’s radius, then convert ω to RPM (RPM = ω × 60 ÷ 2π). This calculator does both steps for you.' },
        { question: 'Does doubling the RPM double the RCF?', answer: 'No — RCF scales with the square of RPM, so doubling the rotational speed quadruples the RCF, holding the radius fixed.' },
        { question: 'Can I use the same RPM on a different rotor and get the same force?', answer: 'Not unless the two rotors have the same radius. The same RPM on a larger-radius rotor produces a higher RCF, since samples are farther from the spin axis — match the ×g figure, not the RPM, when moving a protocol between centrifuges.' },
        { question: 'Is the 1.118×10⁻⁵ constant exact?', answer: 'It is a commonly published rounding of the exact value, about 1.1182×10⁻⁵ (derived from ω²r ÷ g) — the two agree to within about 0.02%, which is immaterial for lab use.' }
      ]
    },
    compute(values) {
      return { rcf: (values.rpm * values.rpm * values.radius) / STANDARD_GRAVITY };
    }
  },
  {
    id: 'log-reduction-calculator',
    category: 'biology',
    glyph: 'LR',
    updatedAt: '2026-11-17',
    aliases: ['log reduction calculator', 'microbial log reduction calculator', 'disinfectant log reduction calculator', 'log10 reduction calculator', 'kill rate calculator', 'percent reduction microbial calculator'],
    related: ['bacterial-growth-calculator', 'doubling-time-calculator', 'percentage-calculator', 'logarithm-calculator'],
    title: 'Log Reduction Calculator (Microbial Kill Rate)',
    description: 'Find the log reduction (and percent reduction) in a microbial count from a before-and-after measurement, log reduction = log₁₀(N₀ ÷ N) — the standard way disinfection and sterilization claims are reported.',
    example: 'A treatment that drops a microbial count from 1,000,000 CFU/mL to 10 CFU/mL achieves a 5-log reduction — 99.999% of the organisms killed or removed.',
    solver: {
      defaultTarget: 'logReduction',
      variables: [
        { id: 'initialCount', label: 'Count before treatment', symbol: 'N₀', dimension: 'count', defaultValue: 1000000, defaultUnit: 'count' },
        { id: 'finalCount', label: 'Count after treatment', symbol: 'N', dimension: 'count', defaultValue: 10, defaultUnit: 'count' },
        { id: 'logReduction', label: 'Log reduction', symbol: 'LR', dimension: 'count', defaultValue: 5, defaultUnit: 'count' }
      ],
      solve: {
        // Log reduction LR = log10(N0/N) (Wikipedia, "Log reduction," citing the standard
        // disinfection-efficacy definition: R = log10(c_before) - log10(c_after)). An n-log
        // reduction means the surviving count is 10^-n of the original.
        logReduction: ({ initialCount, finalCount }) => (initialCount <= 0 || finalCount <= 0 ? NaN : Math.log10(initialCount / finalCount)),
        finalCount: ({ initialCount, logReduction }) => (initialCount <= 0 ? NaN : initialCount / Math.pow(10, logReduction)),
        initialCount: ({ finalCount, logReduction }) => (finalCount <= 0 ? NaN : finalCount * Math.pow(10, logReduction))
      },
      outputs: [
        { id: 'percentReduction', label: 'Percent reduction', dimension: 'percent', compute: (si) => (si.initialCount <= 0 ? NaN : 100 * (1 - si.finalCount / si.initialCount)) }
      ]
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What is log reduction?',
        paragraphs: [
          'Log reduction is the standard way disinfectants, sterilization processes, and water- or food-safety treatments report how effectively they reduce a microbial population. Rather than quoting a percentage — which quickly becomes an unwieldy string of 9s once a treatment gets very effective — log reduction counts how many powers of ten the population dropped by: LR = log₁₀(N₀ ÷ N), where N₀ is the count before treatment and N is the count after.',
          'Each whole log is a 10-fold drop in surviving organisms: a 1-log reduction removes 90% of the population, a 2-log reduction removes 99%, a 3-log reduction removes 99.9%, and so on — every extra log adds one more "9" to the percentage. A 5-log reduction, often used as a benchmark for water disinfection, means only 1 organism in 100,000 survives.',
          'Because it is a logarithmic scale, log reduction also makes it easy to add up a multi-step process: a treatment with a 2-log reduction followed by a second, independent 3-log reduction step gives a combined 5-log reduction overall — simply by adding the two numbers, something percentages do not do (90% followed by another 99.9% reduction is not 90.999% removed).'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the count before treatment, the count after treatment, and the log reduction; the third fills in automatically.',
        steps: [
          { name: 'Measure (or look up) the count before treatment', text: 'N₀ — the microbial count (CFU, cells, or any consistent count) before the disinfection or sterilization step.' },
          { name: 'Measure the count after treatment', text: 'N — the same kind of count, taken after treatment under the same conditions.' },
          { name: 'Enter the two values you know', text: 'The field left over, marked auto, calculates as you type. If you instead know a claimed log reduction and one count, solve for the other count.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result and the percent figure', text: 'The log reduction and its equivalent percent reduction both appear — useful since many audiences read percentages more easily than a log scale.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Log reduction rearranges to solve for any of the three quantities.',
        expression: 'LR = log₁₀(N₀ ÷ N)\nN = N₀ ÷ 10^LR\nN₀ = N × 10^LR\n%reduction = 100 × (1 − N ÷ N₀)',
        terms: [
          { symbol: 'N₀', meaning: 'The microbial count before treatment.' },
          { symbol: 'N', meaning: 'The microbial count after treatment, measured the same way as N₀.' },
          { symbol: 'LR', meaning: 'Log reduction — how many powers of ten the count dropped by.' }
        ],
        note: 'This describes a single, already-completed before/after measurement. It does not itself model a kill curve over time (see doubling-time-calculator and bacterial-growth-calculator for the growth side of that same exponential math).'
      },
      workedExample: {
        intro: 'A disinfection treatment drops a microbial count from 1,000,000 CFU/mL to 10 CFU/mL. What is the log reduction?',
        rows: [
          { label: 'Count before (N₀)', value: '1,000,000 CFU/mL' },
          { label: 'Count after (N)', value: '10 CFU/mL' },
          { label: 'N₀ ÷ N', value: '100,000' },
          { label: 'LR = log₁₀(100,000)', value: '5' },
          { label: 'Percent reduction = 100 × (1 − 10 ÷ 1,000,000)', value: '99.999%' }
        ],
        result: 'LR = 5 (a 5-log reduction, 99.999% reduction)',
        explanation: '1,000,000 divided by 10 is 100,000, and log₁₀(100,000) is exactly 5, since 10⁵ = 100,000. Each log corresponds to one more "9" in the percentage: a 5-log reduction leaves 1 part in 100,000, which is 100 × (1 − 10/1,000,000) = 99.999% removed.'
      },
      watchOut: [
        { title: 'N and N₀ must be the same kind of count, measured the same way', body: 'Mixing a direct microscope count with a CFU plate count (which only counts viable, culturable organisms) gives a log reduction that does not mean what it appears to — see cell-dilution-calculator’s own note on the same distinction.' },
        { title: 'A detection limit is not the same as zero', body: 'If the "after" count is reported as "below the detection limit" rather than an actual measured number, the true log reduction could be higher than what plugging in the detection limit itself suggests — the real count may be lower still, just unmeasurable with that method.' },
        { title: 'Log reductions from separate steps add, percentages do not', body: 'A 2-log step followed by a 3-log step gives a combined 5-log reduction (add the logs). The equivalent percentages, 99% and 99.9%, do not add to give the right combined percentage — convert through log reduction instead of trying to combine percent figures directly.' },
        { title: 'This is a single measured ratio, not a guaranteed future performance claim', body: 'A log reduction value describes what one before/after measurement showed under its own specific conditions (organism, temperature, contact time, and so on) — it does not by itself guarantee the same reduction under different conditions.' }
      ],
      references: [
        { label: 'Wikipedia, "Log reduction"', url: 'https://en.wikipedia.org/wiki/Log_reduction' }
      ]
    },
    inputs: [
      { id: 'initialCount', label: 'Count before treatment', type: 'number', placeholder: '1000000', defaultValue: 1000000, step: 1, min: 0 },
      { id: 'finalCount', label: 'Count after treatment', type: 'number', placeholder: '10', defaultValue: 10, step: 0.001, min: 0 }
    ],
    seo: {
      title: 'Log Reduction Calculator (Microbial Kill Rate)',
      description: 'Free log reduction calculator for disinfection and sterilization. Solve log10(N0/N) for log reduction, before count, or after count, with percent reduction.',
      faq: [
        { question: 'What is the log reduction formula?', answer: 'LR = log₁₀(N₀ ÷ N), where N₀ is the microbial count before treatment and N is the count after. Dropping from 1,000,000 to 10 CFU/mL is a 5-log reduction.' },
        { question: 'How does log reduction relate to percent reduction?', answer: 'A 1-log reduction is 90% removed, 2-log is 99%, 3-log is 99.9%, 4-log is 99.99%, and 5-log is 99.999% — each additional log adds one more "9" to the percentage.' },
        { question: 'How do I calculate the surviving count from a log reduction?', answer: 'N = N₀ ÷ 10^LR. A 1,000,000 CFU/mL starting count with a claimed 5-log reduction leaves 1,000,000 ÷ 10⁵ = 10 CFU/mL surviving.' },
        { question: 'Do log reductions from two treatment steps add together?', answer: 'Yes — log reductions are additive: a 2-log step followed by a 3-log step gives a combined 5-log reduction. Percentages do not add the same way, so converting through log reduction is the correct way to combine multiple steps.' },
        { question: 'What does a 6-log reduction mean?', answer: 'A 6-log reduction means the surviving count is 10⁻⁶ (one-millionth) of the starting count — 99.9999% of the organisms killed or removed, often used as a sterilization benchmark.' },
        { question: 'Can log reduction be negative?', answer: 'Yes, mathematically — a negative log reduction means the count after is higher than before (the population grew rather than shrank), the reverse of what a disinfection claim is meant to show.' }
      ]
    },
    compute(values) {
      return { logReduction: Math.log10(values.initialCount / values.finalCount) };
    }
  }
];
