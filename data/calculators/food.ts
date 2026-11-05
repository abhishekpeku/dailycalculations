import type { CalculatorConfig } from './types.ts';

// Stovetop absorption-method water ratios (cups water per cup of dry rice), from America's Test
// Kitchen's own published recipes — see each calculator's references. Keyed by option code, never
// by the ratio value itself (two types can share a ratio, as basmati and jasmine do here).
const RICE_WATER_RATIO = [1.5, 1.5, 1.5, 2.25, 1.25]; // white, basmati, jasmine, brown, sushi

// USDA FSIS "Let's Talk Turkey" roasting timetable at 325°F, by weight band, in hours. Bands are
// as published (overlapping at their shared boundary, e.g. "8 to 12" and "12 to 14"); a weight is
// matched to the first band whose max it does not exceed, and clamped to the table's own range.
const TURKEY_ROAST_BANDS = {
  unstuffed: [
    { maxLb: 8, loHr: 1.5, hiHr: 3.25 },
    { maxLb: 12, loHr: 2.75, hiHr: 3 },
    { maxLb: 14, loHr: 3, hiHr: 3.75 },
    { maxLb: 18, loHr: 3.75, hiHr: 4.25 },
    { maxLb: 20, loHr: 4.25, hiHr: 4.5 },
    { maxLb: 24, loHr: 4.5, hiHr: 5 }
  ],
  stuffed: [
    { maxLb: 8, loHr: 2.5, hiHr: 3.5 },
    { maxLb: 12, loHr: 3, hiHr: 3.5 },
    { maxLb: 14, loHr: 3.5, hiHr: 4 },
    { maxLb: 18, loHr: 4, hiHr: 4.25 },
    { maxLb: 20, loHr: 4.25, hiHr: 4.75 },
    { maxLb: 24, loHr: 4.75, hiHr: 5.25 }
  ]
};
const TURKEY_MIN_LB = { unstuffed: 4, stuffed: 6 };

function turkeyBand(weightLb: number, stuffed: boolean) {
  const bands = stuffed ? TURKEY_ROAST_BANDS.stuffed : TURKEY_ROAST_BANDS.unstuffed;
  const minLb = stuffed ? TURKEY_MIN_LB.stuffed : TURKEY_MIN_LB.unstuffed;
  const clamped = Math.min(Math.max(weightLb, minLb), bands[bands.length - 1].maxLb);
  return bands.find((band) => clamped <= band.maxLb) ?? bands[bands.length - 1];
}

// USDA FSIS "Turkey Basics: Safe Thawing" (revised September 2011) — refrigerator and cold-water
// thaw times by weight. Bands share boundary weights exactly as USDA publishes them ("4 to 12 lb",
// "12 to 16 lb", ...); a weight exactly on a shared boundary is matched to the HIGHER band
// (minLb inclusive), the more conservative, longer-thaw-time reading.
const TURKEY_THAW_BANDS = {
  refrigerator: [
    { minLb: 4, maxLb: 12, loDays: 1, hiDays: 3 },
    { minLb: 12, maxLb: 16, loDays: 3, hiDays: 4 },
    { minLb: 16, maxLb: 20, loDays: 4, hiDays: 5 },
    { minLb: 20, maxLb: 24, loDays: 5, hiDays: 6 }
  ],
  coldWater: [
    { minLb: 4, maxLb: 12, loHr: 2, hiHr: 6 },
    { minLb: 12, maxLb: 16, loHr: 6, hiHr: 8 },
    { minLb: 16, maxLb: 20, loHr: 8, hiHr: 10 },
    { minLb: 20, maxLb: 24, loHr: 10, hiHr: 12 }
  ]
};
function turkeyThawBand<T extends { minLb: number; maxLb: number }>(weightLb: number, bands: T[]): T {
  const clamped = Math.min(Math.max(weightLb, 4), bands[bands.length - 1].maxLb);
  for (let i = bands.length - 1; i >= 0; i--) {
    if (clamped >= bands[i].minLb) return bands[i];
  }
  return bands[0];
}

// America's Test Kitchen's steam method (½-1" boiling water, covered, large cold eggs) — cook time
// by doneness. See each calculator's references for the three separate articles this comes from.
const EGG_STEAM_MINUTES = [6.5, 8, 13]; // soft-cooked, jammy, hard-cooked
// American Egg Board's cold-start method (cover with water, bring to boil, remove from heat, let
// stand covered) — hard-cooked standing time by egg size.
const EGG_STAND_MINUTES = [9, 12, 15]; // medium, large, extra-large

// Beef Checkoff (beefitswhatsfordinner.com / beeflovingtexans.com) doneness temperatures and
// carryover-cooking guidance. USDA/FDA's own whole-muscle beef minimum (145°F + 3-min rest)
// equals the industry's own "medium-rare" figure.
const STEAK_TARGET_F = [145, 160, 170]; // medium-rare, medium, well-done
const STEAK_CARRYOVER_F = { low: 10, high: 5 }; // remove from heat 5-10°F below target
const STEAK_REST_MIN = { low: 5, high: 10 };
const USDA_BEEF_MIN_F = 145;

// The Old Farmer's Almanac, "Party Planner Serving-Size Calculator" (Food Quantity Chart) —
// per-person quantities for a full sit-down meal, not a light appetizer spread.
const PARTY_FOOD_PER_PERSON = {
  proteinLb: 0.5,
  potatoesLbLow: 1 / 3,
  potatoesLbHigh: 0.5,
  rolls: 2,
  dessertSlices: 1
};

// King Arthur Baking, Professional Baker's Reference, "Yeast" — weight ratios relative to fresh
// (cake) yeast.
const YEAST_FRESH_TO_ACTIVE_DRY = 0.4;
const YEAST_FRESH_TO_INSTANT = 0.33;

// Brew Your Own magazine ("Calculating Alcohol, Attenuation, Extract and Calories" by Bill Pierce)
// — the precise alcohol-by-weight/alcohol-by-volume formulas from original and final gravity.
function abvFromGravity(og: number, fg: number) {
  const abw = (76.08 * (og - fg)) / (1.775 - og);
  const abv = abw * (fg / 0.794);
  return { abw, abv };
}
// The same article's "quick" approximation, in gravity points (digits after the decimal, x1000).
function abvQuickFromGravity(og: number, fg: number) {
  const points = (og - 1) * 1000 - (fg - 1) * 1000;
  return points * 0.132;
}

// SCA Standard 310-2021, "Home Coffee Brewers: Specifications and Test Methods" — standard brew
// ratio 55 g coffee per 1.000 kg water, with a +/-10% tolerance (49.5-60.5 g/L) still producing an
// acceptable cup.
const SCA_BREW_RATIOS_G_PER_L = [49.5, 55, 60.5]; // light end, Golden Cup standard, strong end

// National Coffee Association (aboutcoffee.org), "Cold brew coffee" — 1 g coffee to 4-5 g water,
// coarse grind, about 12 hours of contact time.
const COLD_BREW_RATIO = { low: 4, high: 5 };

// King Arthur Baking, "Self-rising flour: what is it, and how do I bake with it?" — per 1 cup
// (120 g) all-purpose flour: 1 1/2 tsp baking powder, 1/4 tsp table salt.
const SELF_RISING_PER_120G_FLOUR = { bakingPowderTsp: 1.5, saltTsp: 0.25 };

// Wilton, "Ultimate Cake Serving Chart" — 4-inch-tall pans, party servings (~1.5 x 2 in slices) and
// wedding servings (~1 x 2 in slices).
const WILTON_CAKE_CHART = [
  { label: '6 in round', party: 12, wedding: 12 },
  { label: '8 in round', party: 20, wedding: 24 },
  { label: '9 in round', party: 24, wedding: 32 },
  { label: '10 in round', party: 28, wedding: 38 },
  { label: '12 in round', party: 40, wedding: 56 },
  { label: '14 in round', party: 63, wedding: 78 },
  { label: '16 in round', party: 77, wedding: 100 },
  { label: '6 in square', party: 12, wedding: 18 },
  { label: '8 in square', party: 20, wedding: 32 },
  { label: '10 in square', party: 30, wedding: 50 },
  { label: '12 in square', party: 48, wedding: 72 },
  { label: '14 in square', party: 63, wedding: 98 },
  { label: '16 in square', party: 80, wedding: 128 }
];

// America's Test Kitchen, "How Much Alcohol Should I Buy for a Party?" — Drinks = Guests x
// (Hours + 1), plus the magazine's own servings-per-bottle figures.
const PARTY_DRINKS_PER_BOTTLE = { beer: 1, wine: 5, spirits: 12 }; // 750 mL bottles for wine/spirits

// Morton Salt, "A Guide to Brining" — Morton Coarse Kosher Salt per gallon of water, by brining
// duration.
const BRINE_CUPS_PER_GALLON = { short: 1, long: 0.5 }; // short: 4-5 hr; long: overnight, up to 14 hr

export const foodCalculators: CalculatorConfig[] = [
  {
    id: 'recipe-scaling-calculator',
    category: 'food',
    glyph: 'x1.5',
    updatedAt: '2026-11-05',
    aliases: ['recipe scaling calculator', 'recipe converter calculator', 'scale a recipe up or down', 'recipe yield calculator', 'how to double a recipe', 'recipe multiplier calculator'],
    related: ['bakers-percentage-calculator', 'pizza-dough-calculator', 'cups-to-grams-converter', 'ratio-calculator'],
    title: 'Recipe Scaling Calculator',
    description: 'Scale any recipe up or down by servings: find exactly how much of an ingredient a bigger or smaller batch needs, with the scaling factor shown.',
    example: 'A recipe for 4 servings that calls for 2 cups of flour needs 3 cups to serve 6 — multiply by the scaling factor, 6 ÷ 4 = 1.5.',
    solver: {
      defaultTarget: 'scaledAmount',
      variables: [
        { id: 'originalServings', label: 'Original servings', symbol: 'S₁', dimension: 'count', defaultValue: 4, defaultUnit: 'count' },
        { id: 'desiredServings', label: 'Desired servings', symbol: 'S₂', dimension: 'count', defaultValue: 6, defaultUnit: 'count' },
        { id: 'originalAmount', label: 'Ingredient amount, original recipe', symbol: 'A₁', dimension: 'count', defaultValue: 2, defaultUnit: 'count' },
        { id: 'scaledAmount', label: 'Ingredient amount, scaled recipe', symbol: 'A₂', dimension: 'count', defaultValue: 3, defaultUnit: 'count' }
      ],
      solve: {
        scaledAmount: ({ originalAmount, desiredServings, originalServings }) => (originalServings === 0 ? NaN : (originalAmount * desiredServings) / originalServings),
        originalAmount: ({ scaledAmount, originalServings, desiredServings }) => (desiredServings === 0 ? NaN : (scaledAmount * originalServings) / desiredServings),
        desiredServings: ({ scaledAmount, originalServings, originalAmount }) => (originalAmount === 0 ? NaN : (scaledAmount * originalServings) / originalAmount),
        originalServings: ({ originalAmount, desiredServings, scaledAmount }) => (scaledAmount === 0 ? NaN : (originalAmount * desiredServings) / scaledAmount)
      }
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'What recipe scaling actually changes',
        paragraphs: [
          'Scaling a recipe means multiplying every ingredient by the same factor — the servings you want divided by the servings the recipe already makes. Doubling a 4-serving recipe to feed 8 uses a factor of 2; cutting a 6-serving recipe down to 2 uses a factor of ⅓. Every ingredient amount on the page follows that one number, which is what this calculator solves for: give it the original and desired servings plus one ingredient amount, and it finds the scaled amount (or works the other three directions, too).',
          'King Arthur Baking’s own guidance on reducing a recipe recommends working in weight, not volume, whenever a recipe gives both: "simply refer to the gram measurements of ingredients and use a calculator to divide accordingly." A cup measurement compresses differently depending on how it was scooped, so 1.5 cups of flour scaled from a already-imprecise cup measure carries more error than 180 g scaled from a kitchen scale.',
          'Not everything on the ingredient list should take the multiplier at full strength. Pan size and bake time are the two most common places a straight multiplication goes wrong, because both depend on area and heat penetration rather than ingredient volume — see the watch-outs below for how King Arthur and University of Wyoming Extension recommend handling each.'
        ]
      },
      howTo: {
        intro: 'Enter the recipe’s original servings, the servings you want, and one ingredient amount from the original recipe — the calculator finds the scaled amount.',
        steps: [
          { name: 'Enter the original servings', text: 'How many servings the recipe, as written, makes.' },
          { name: 'Enter the desired servings', text: 'How many servings you actually want to end up with.' },
          { name: 'Enter one ingredient amount', text: 'Any amount from the original recipe, in whatever unit it is written — cups, grams, tablespoons, a count of eggs.' },
          { name: 'Read the scaled amount', text: 'The calculator multiplies by the scaling factor (desired ÷ original servings) and shows how much of that same ingredient the new batch needs, in the same unit you entered.' },
          { name: 'Repeat for each ingredient', text: 'Enter the next ingredient’s original amount in the same field to scale it too — the servings stay set from your first entry.' },
          { name: 'Adjust for pan size and bake time separately', text: 'These do not scale by the same factor as ingredients — see the watch-outs below.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every ingredient amount is multiplied by the same scaling factor: the servings you want, divided by the servings the recipe already makes.',
        expression: 'scaling factor = S₂ ÷ S₁\nscaled amount (A₂) = original amount (A₁) × scaling factor\nA₁ = A₂ ÷ scaling factor',
        terms: [
          { symbol: 'S₁', meaning: 'Original servings — how many the recipe, as written, makes.' },
          { symbol: 'S₂', meaning: 'Desired servings — how many you want to end up with.' },
          { symbol: 'A₁', meaning: 'An ingredient’s amount in the original recipe, in any unit.' },
          { symbol: 'A₂', meaning: 'That same ingredient’s amount in the scaled recipe, in the same unit.' }
        ],
        note: 'This is a plain ratio — it assumes every ingredient behaves linearly. Leavening, salt, spices, pan size and bake time often do not; see the watch-outs.'
      },
      workedExample: {
        intro: 'A recipe serving 4 calls for 2 cups of flour. You want to serve 6.',
        rows: [
          { label: 'Original servings (S₁)', value: '4' },
          { label: 'Desired servings (S₂)', value: '6' },
          { label: 'Scaling factor (6 ÷ 4)', value: '1.5' },
          { label: 'Original flour (A₁)', value: '2 cups' },
          { label: 'Scaled flour (2 × 1.5)', value: '3 cups' }
        ],
        result: '3 cups of flour for 6 servings',
        explanation: 'Every other ingredient in the recipe gets the same 1.5× factor — 1 cup of sugar becomes 1.5 cups, 2 eggs becomes 3. Salt, spices and leavening are the exceptions worth tasting and adjusting rather than multiplying blindly (see the watch-outs).'
      },
      watchOut: [
        {
          title: 'Odd fractions need a practical rounding, not a literal one',
          body: 'Scaling 3 eggs down to a ⅓-servings batch gives exactly 1 egg — clean. Scaling 1 egg up by 1.5× gives 1.5 eggs, which isn’t something you can crack. Beat the egg first and measure out the fraction by volume (about 3 tablespoons per egg), or round to the nearest whole egg and accept a slightly richer or leaner result.'
        },
        {
          title: 'Pan size does not scale by the servings ratio',
          body: 'King Arthur Baking’s method: find the original pan’s baking area (its surface area), divide by how much you’re scaling, and pick a pan with roughly that area. Halving a 9"×13" pan (117 sq in) gives about 58.5 sq in — close to a 9" or 8" round pan, not a pan with half the length and width.'
        },
        {
          title: 'Bake time scales slower than ingredient amounts',
          body: 'King Arthur’s rule of thumb for a halved cake or quick bread: start checking at about half the original bake time, then add in 5-minute increments — a smaller batch loses heat and moisture faster than its volume alone would suggest, so it finishes well before half the original time in many ovens.'
        },
        {
          title: 'Salt, spices and leavening reward tasting over pure math',
          body: 'University of Wyoming Extension’s recipe-scaling guidance flags seasoning and leaveners (baking soda, baking powder, yeast) as the ingredients that most often need judgment rather than the straight conversion factor every other ingredient gets — taste and adjust seasoning at the end, and watch a much bigger batch of leavened batter or dough for how it actually rises rather than assuming the multiplier is exact.'
        }
      ],
      references: [
        { label: 'King Arthur Baking, "How to reduce a recipe" — weight-based scaling, pan-area method, bake-time rule of thumb', url: 'https://www.kingarthurbaking.com/blog/2020/11/23/how-to-reduce-a-recipe' },
        { label: 'University of Wyoming Extension, "Scaling: Up or Down" — conversion-factor method and seasoning/leavening caution', url: 'https://uwyoextension.org/uwnutrition/newsletters/scaling-up-or-down/' }
      ]
    },
    inputs: [
      { id: 'originalServings', label: 'Original servings', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 1 },
      { id: 'desiredServings', label: 'Desired servings', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 1 },
      { id: 'originalAmount', label: 'Ingredient amount (original)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.25, min: 0 }
    ],
    seo: {
      title: 'Recipe Scaling Calculator – Scale a Recipe Up or Down',
      description: 'Free recipe scaling calculator. Scale any ingredient by servings and find the exact scaling factor, with a worked example and tips for pan size and bake time.',
      faq: [
        { question: 'How do I scale a recipe up or down?', answer: 'Divide the servings you want by the servings the recipe already makes to get a scaling factor, then multiply every ingredient amount by that factor. A 4-serving recipe scaled to 6 servings uses a factor of 6 ÷ 4 = 1.5, so 2 cups of flour becomes 3 cups.' },
        { question: 'How do I scale a recipe down to a smaller batch?', answer: 'The same method works in reverse: scaling 6 servings down to 2 uses a factor of 2 ÷ 6 = ⅓. Three eggs at 6 servings becomes exactly 1 egg at 2 servings.' },
        { question: 'Do pan size and bake time scale the same way as ingredients?', answer: 'No. Pan size follows the pan’s baking area, not its length and width directly — King Arthur Baking’s method divides the original area by your scaling factor and matches it to a new pan. Bake time shortens by less than the ingredient ratio; start checking at about half the original time for a halved batch.' },
        { question: 'Should I scale salt, spices and baking powder by the same factor?', answer: 'Most recipes scale cleanly, but seasoning and leavening are the exceptions University of Wyoming Extension calls out for judgment rather than a strict multiplier — taste seasoning at the end, and watch a much larger batch of batter or dough rather than assuming the same rise time and amount of leavening behaves identically.' },
        { question: 'What do I do with an ingredient amount that doesn’t scale to a clean number?', answer: 'Round to the nearest practical measure — beat an egg and measure a fraction of it by volume (about 3 tablespoons per large egg), or round other small amounts to the nearest 1/4 teaspoon. The difference rarely changes the result at typical home-kitchen batch sizes.' },
        { question: 'Is it more accurate to scale by weight or by volume?', answer: 'By weight, whenever the recipe gives weights. King Arthur Baking recommends working from gram measurements and dividing by your scaling factor directly, since a volume measure (a cup of flour) already varies with how it was scooped before you even start scaling it.' }
      ]
    },
    compute(values) {
      return { scaledAmount: values.originalServings === 0 ? NaN : (values.originalAmount * values.desiredServings) / values.originalServings };
    }
  },
  {
    id: 'bakers-percentage-calculator',
    category: 'food',
    glyph: 'bp%',
    updatedAt: '2026-11-05',
    aliases: ["baker's percentage calculator", 'baker percentage calculator', 'bread formula percentage calculator', "baker's math calculator", 'bread hydration percentage calculator', 'flour weight percentage calculator'],
    related: ['pizza-dough-calculator', 'recipe-scaling-calculator', 'cups-to-grams-flour'],
    title: "Baker's Percentage Calculator",
    description: "Convert a bread formula's baker's percentages into real ingredient weights: flour is always 100%, and water, salt and yeast are a percent of that flour weight.",
    example: '500 g of flour at 65% hydration, 2% salt and 1% yeast needs 325 g of water, 10 g of salt and 5 g of yeast — 840 g of dough in total.',
    breakdown: {
      headline: 'totalDoughWeight',
      headlineLabel: 'Total dough weight',
      outputs: [
        { id: 'totalDoughWeight', label: 'Total dough weight', format: 'number', dimension: 'mass', unit: 'g' },
        { id: 'waterWeight', label: 'Water', format: 'number', dimension: 'mass', unit: 'g' },
        { id: 'saltWeight', label: 'Salt', format: 'number', dimension: 'mass', unit: 'g' },
        { id: 'yeastWeight', label: 'Yeast', format: 'number', dimension: 'mass', unit: 'g' },
        { id: 'otherWeight', label: 'Other ingredients', format: 'number', dimension: 'mass', unit: 'g' }
      ],
      groups: [
        { title: 'Flour', inputs: ['flourWeight'] },
        { title: "Baker's percentages (of flour weight)", inputs: ['hydrationPercent', 'saltPercent', 'yeastPercent'] },
        { title: 'Other ingredients (sugar, fat, etc.)', inputs: ['otherPercent'], optional: true }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'flourWeight', label: 'Flour' },
          { from: 'waterWeight', label: 'Water' },
          { from: 'saltWeight', label: 'Salt' },
          { from: 'yeastWeight', label: 'Yeast' },
          { from: 'otherWeight', label: 'Other' }
        ],
        center: 'totalDoughWeight',
        centerSub: 'total dough'
      }
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: "What baker's percentage means",
        paragraphs: [
          "Baker's percentage is how professional bakeries write a bread formula: flour is always 100%, by weight, and every other ingredient is expressed as a percent of that flour weight — not of the total dough. King Arthur Baking's Professional Baker's Reference states it plainly: each ingredient is \"expressed as a percentage of the flour weight, and the flour weight is always expressed as 100%.\" A formula listing 65% water, 2% salt and 1% yeast means exactly that: 65%, 2% and 1% of however much flour you weigh out, whatever that flour weight turns out to be.",
          "That flour-as-100% anchor is also why the percentages never need to add up to 100 — King Arthur notes the total (sometimes well over 100%, once water and other wet ingredients are counted) is itself useful: it's the number a baker divides a target dough weight by to find the right flour weight when scaling a batch up or down, before working the other percentages forward from that new flour weight.",
          'When a dough uses more than one flour — white and whole wheat, say — the flour weights together make up the 100%, not each one separately. This calculator keeps that rule: enter your total flour weight once, and every percentage below is read against that one figure.'
        ]
      },
      howTo: {
        intro: 'Enter your flour weight, then the percentage of water (hydration), salt and yeast you want, each as a percent of that flour weight.',
        steps: [
          { name: 'Enter your flour weight', text: 'The total weight of all flour in the formula, in grams.' },
          { name: 'Set the hydration percentage', text: 'Water as a percent of the flour weight — 65% is a common everyday bread hydration.' },
          { name: 'Set the salt and yeast percentages', text: 'Both as a percent of the same flour weight — 2% salt and 0.5–2% yeast are typical ranges depending on rise time.' },
          { name: 'Add other ingredients if needed', text: 'Sugar, fat or anything else in the formula, as one combined percent of flour weight, in the optional group.' },
          { name: 'Read the ingredient weights', text: 'Each percentage converts straight to a weight: ingredient weight = flour weight × percent ÷ 100. The total is every ingredient added together.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "Every ingredient's weight comes from the same flour weight and its own percentage.",
        expression: 'ingredient weight = flour weight × ingredient % ÷ 100\ntotal dough weight = flour weight + Σ(ingredient weights)',
        terms: [
          { symbol: 'flour weight', meaning: 'The total weight of flour, always treated as 100% — the one figure every other percentage is measured against.' },
          { symbol: 'ingredient %', meaning: "A single ingredient's baker's percentage — water (hydration), salt, yeast, or anything else in the formula." },
          { symbol: 'Σ', meaning: 'Sum: add up every ingredient’s computed weight, flour included, for the total dough weight.' }
        ],
        note: "Baker's percentage describes a formula's proportions, not a recommendation for how much yeast or salt to use — a long, cold ferment commonly uses well under 1% yeast, where a same-day dough might use 2% or more for the same flour weight."
      },
      workedExample: {
        intro: 'A formula calls for 500 g of flour at 65% hydration, 2% salt and 1% yeast, with nothing else added.',
        rows: [
          { label: 'Flour weight', value: '500 g (100%)' },
          { label: 'Water (500 × 65 ÷ 100)', value: '325 g' },
          { label: 'Salt (500 × 2 ÷ 100)', value: '10 g' },
          { label: 'Yeast (500 × 1 ÷ 100)', value: '5 g' },
          { label: 'Total dough weight (500 + 325 + 10 + 5)', value: '840 g' }
        ],
        result: '840 g of dough: 500 g flour, 325 g water, 10 g salt, 5 g yeast',
        explanation: "This formula totals 68% + 100% = 168%, meaning the dough weighs 1.68× its flour weight — the same relationship King Arthur Baking's own French bread formula example uses to scale a batch: divide a target dough weight by the total percentage to find the flour weight that produces it, then work every other ingredient forward from there."
      },
      watchOut: [
        {
          title: "Percentages are of flour weight, not total dough weight",
          body: 'The single most common beginner mistake. "65% hydration" means 65% of the flour weight, not 65% of the finished dough’s weight — the two numbers are different because the dough itself includes the water, salt and yeast on top of the flour.'
        },
        {
          title: "Yeast percentage depends on rise time and temperature",
          body: "There is no single \"correct\" yeast percentage. A same-day dough commonly runs 1-2% instant yeast; a dough given a long, cold, overnight rise can use a fifth of that or less, since time does the work instead. Treat the percentage as a knob to adjust for your schedule, not a fixed rule."
        },
        {
          title: 'Multiple flours together make 100%',
          body: 'A formula blending white and whole-wheat flour treats their combined weight as the 100% baseline — not 100% each. Enter the combined flour weight here, then figure each flour’s own share separately if you need it.'
        },
        {
          title: "This is composition, not technique",
          body: "Baker's percentage tells you how much of each ingredient to weigh out. It says nothing about mixing time, fermentation temperature, shaping or oven setup — all of which affect the final loaf as much as the formula's ratios do."
        }
      ],
      references: [
        { label: "King Arthur Baking, Professional Baker's Reference, \"Baker's Percentage\"", url: 'https://www.kingarthurbaking.com/pro/reference/bakers-percentage' },
        { label: "King Arthur Baking, Professional Baker's Reference (hub)", url: 'https://www.kingarthurbaking.com/pro/reference' }
      ]
    },
    inputs: [
      { id: 'flourWeight', label: 'Flour weight', type: 'number', placeholder: '500', defaultValue: 500, step: 10, min: 0, dimension: 'mass', unit: 'g' },
      { id: 'hydrationPercent', label: 'Water / hydration (%)', type: 'percent', placeholder: '65', defaultValue: 65, step: 1, min: 0 },
      { id: 'saltPercent', label: 'Salt (%)', type: 'percent', placeholder: '2', defaultValue: 2, step: 0.1, min: 0 },
      { id: 'yeastPercent', label: 'Yeast (%)', type: 'percent', placeholder: '1', defaultValue: 1, step: 0.1, min: 0 },
      { id: 'otherPercent', label: 'Other ingredients, combined (%)', type: 'percent', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    seo: {
      title: "Baker's Percentage Calculator – Bread Formula by Weight",
      description: "Free baker's percentage calculator. Enter flour weight and hydration, salt and yeast percentages to get real ingredient weights in grams, with a worked example.",
      faq: [
        { question: "What is baker's percentage?", answer: "A way of writing a bread formula where flour is always 100% by weight, and every other ingredient is a percent of that flour weight. 65% hydration on a 500 g flour formula means 325 g of water (500 × 0.65), regardless of the total dough weight." },
        { question: "Why don't baker's percentages add up to 100?", answer: "They aren't parts of a whole — each one is measured against flour weight independently. A formula can total well over 100% once water, salt and yeast are all counted; King Arthur Baking notes that total is itself useful for scaling a batch to a target dough weight." },
        { question: 'How do I convert baker’s percentage to grams?', answer: 'Multiply the flour weight by the percentage and divide by 100: ingredient weight = flour weight × % ÷ 100. 500 g of flour at 2% salt needs 500 × 2 ÷ 100 = 10 g of salt.' },
        { question: 'What is a typical hydration percentage for bread?', answer: 'Everyday sandwich bread often sits around 60-65% hydration. Rustic, open-crumb breads commonly run 70-80% or higher; pizza dough (see our pizza dough calculator) typically falls in the low-to-mid 60s to mid-70s depending on the style.' },
        { question: 'How much yeast should a formula use?', answer: 'There is no single right percentage — it depends on how long the dough rises and at what temperature. A same-day dough commonly uses around 1-2% instant yeast; a long, cold overnight rise can use well under 1%, since the extra time does the same work as more yeast.' },
        { question: "Does baker's percentage work for flours other than wheat?", answer: 'Yes — the method only cares that flour is the 100% reference weight. When a formula blends two or more flours, their combined weight is the 100%, and each flour’s own share is a separate figure you can compute if you need it.' }
      ]
    },
    compute(values) {
      const waterWeight = (values.flourWeight * values.hydrationPercent) / 100;
      const saltWeight = (values.flourWeight * values.saltPercent) / 100;
      const yeastWeight = (values.flourWeight * values.yeastPercent) / 100;
      const otherWeight = (values.flourWeight * values.otherPercent) / 100;
      const totalDoughWeight = values.flourWeight + waterWeight + saltWeight + yeastWeight + otherWeight;
      return { totalDoughWeight, waterWeight, saltWeight, yeastWeight, otherWeight };
    }
  },
  {
    id: 'pizza-dough-calculator',
    category: 'food',
    glyph: 'dgh',
    updatedAt: '2026-11-05',
    aliases: ['pizza dough calculator', 'pizza dough recipe calculator', 'pizza hydration calculator', 'pizza dough ball weight calculator', 'how much flour for pizza dough', 'pizza dough ingredients by weight'],
    related: ['bakers-percentage-calculator', 'recipe-scaling-calculator', 'rice-to-water-ratio-calculator'],
    title: 'Pizza Dough Calculator',
    description: "Work out flour, water, salt and yeast by weight for any number of pizzas, from the dough ball weight and baker's percentages — hydration, salt and yeast as a percent of the flour.",
    example: 'Two 205 g dough balls at 73.3% hydration, 3.45% salt and 0.16% yeast (King Arthur Baking’s Neapolitan-Style Pizza Crust) need about 232 g of flour, 170 g of water, 8 g of salt and 0.37 g of yeast.',
    breakdown: {
      headline: 'flourWeight',
      headlineLabel: 'Flour needed',
      outputs: [
        { id: 'flourWeight', label: 'Flour', format: 'number', dimension: 'mass', unit: 'g' },
        { id: 'waterWeight', label: 'Water', format: 'number', dimension: 'mass', unit: 'g' },
        { id: 'saltWeight', label: 'Salt', format: 'number', dimension: 'mass', unit: 'g' },
        { id: 'yeastWeight', label: 'Yeast', format: 'number', dimension: 'mass', unit: 'g' },
        { id: 'totalDoughWeight', label: 'Total dough weight', format: 'number', dimension: 'mass', unit: 'g' }
      ],
      groups: [
        { title: 'Pizzas', inputs: ['numberOfPizzas', 'doughBallWeight'] },
        { title: "Baker's percentages (of flour weight)", inputs: ['hydrationPercent', 'saltPercent', 'yeastPercent'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'flourWeight', label: 'Flour' },
          { from: 'waterWeight', label: 'Water' },
          { from: 'saltWeight', label: 'Salt' },
          { from: 'yeastWeight', label: 'Yeast' }
        ],
        center: 'totalDoughWeight',
        centerSub: 'total dough'
      }
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Pizza dough by weight, back-solved from dough balls',
        paragraphs: [
          "Pizza dough is a baker's-percentage formula (see our baker's percentage calculator) with one twist: you usually start from how many pizzas you want and how big each dough ball should be, not from a flour weight. This calculator runs the formula backwards — total dough weight (number of pizzas × dough ball weight) divided by 1 plus the hydration, salt and yeast percentages (as fractions) gives the flour weight, and every other ingredient follows from that.",
          "The defaults model King Arthur Baking's own Neapolitan-Style Pizza Crust recipe: 232 g of '00' flour, 170 g of water (73.3% hydration), 8 g of salt (3.45%) and ⅛ teaspoon of instant yeast — about 0.375 g using King Arthur's own ingredient weight chart (1 teaspoon of instant yeast = 3 g) — divided into two dough balls of about 200 g each after a 12-24 hour room-temperature rise.",
          "Hydration varies a lot by style. King Arthur's own Super-Fast Thin-Crust Pizza Dough, meant for a same-day bake, uses 152 g of water to 240 g of flour — 63.3% hydration, noticeably drier and easier to handle than the slow-fermented Neapolitan recipe's 73.3%. Higher hydration gives a more open, chewy crumb but a stickier dough that takes more practice to shape."
        ]
      },
      howTo: {
        intro: 'Enter how many pizzas you want and the dough ball weight, then set the hydration, salt and yeast percentages.',
        steps: [
          { name: 'Enter the number of pizzas', text: 'How many dough balls you want to end up with.' },
          { name: 'Enter the dough ball weight', text: 'The weight of one ball of dough — about 200-280 g for a 10-14 inch pizza, depending on how thick you like the crust.' },
          { name: 'Set the hydration percentage', text: 'Water as a percent of flour weight. Lower (60-65%) is easier to handle; higher (70%+) gives a more open crumb but a stickier dough.' },
          { name: 'Set the salt and yeast percentages', text: 'Both as a percent of flour weight. A long, slow rise uses much less yeast than a same-day dough — see the watch-outs.' },
          { name: 'Read the ingredient weights', text: 'Flour is back-solved from the total dough weight and the three percentages; water, salt and yeast follow from that flour weight.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Total dough weight is fixed by how many pizzas and how big each one is; flour is solved from that total and the formula’s percentages, then every other ingredient follows.',
        expression: 'total dough weight = pizzas × dough ball weight\nflour weight = total dough weight ÷ (1 + (hydration% + salt% + yeast%) ÷ 100)\nwater = flour weight × hydration% ÷ 100\nsalt = flour weight × salt% ÷ 100\nyeast = flour weight × yeast% ÷ 100',
        terms: [
          { symbol: 'pizzas', meaning: 'How many dough balls you want.' },
          { symbol: 'dough ball weight', meaning: 'The weight of one ball of dough, in grams.' },
          { symbol: 'hydration%, salt%, yeast%', meaning: "Each ingredient's baker's percentage — a percent of the flour weight, not of the total dough." }
        ],
        note: 'This covers flour, water, salt and yeast only. A recipe with oil or sugar adds its own percentage to the same denominator — add it to the percentages above if your recipe includes one, or treat it as a small adjustment to taste.'
      },
      workedExample: {
        intro: "Replicating King Arthur Baking's Neapolitan-Style Pizza Crust by weight: two pizzas, 205 g dough balls, 73.3% hydration, 3.45% salt and 0.16% yeast.",
        rows: [
          { label: 'Total dough weight (2 × 205 g)', value: '410 g' },
          { label: 'Sum of percentages (73.3 + 3.45 + 0.16)', value: '76.91%' },
          { label: 'Flour weight (410 ÷ 1.7691)', value: '231.76 g' },
          { label: 'Water (231.76 × 73.3 ÷ 100)', value: '169.88 g' },
          { label: 'Salt (231.76 × 3.45 ÷ 100)', value: '8.00 g' },
          { label: 'Yeast (231.76 × 0.16 ÷ 100)', value: '0.37 g' }
        ],
        result: 'About 232 g flour, 170 g water, 8 g salt, 0.37 g yeast',
        explanation: "King Arthur's own recipe, read directly, uses 232 g flour, 170 g water and 8 g salt for a 410 g total (two ~205 g balls) — within rounding of the formula's own back-solved numbers, since their published amounts are themselves rounded to clean weights."
      },
      watchOut: [
        {
          title: 'Higher hydration means a stickier, harder-to-shape dough',
          body: "Going from King Arthur's 63.3%-hydration same-day recipe toward their 73.3%-hydration Neapolitan recipe trades easier handling for a more open, chewy crumb. If a dough feels unworkable, lowering hydration by a few percent is the most direct fix — more flour on the bench treats the symptom, not the formula."
        },
        {
          title: 'Yeast percentage is a function of time, not a fixed number',
          body: "King Arthur's long-ferment Neapolitan recipe uses only about 0.16% instant yeast because the dough rises 12-24 hours; a same-day dough needs much more yeast — often 1% or higher — to rise in just a few hours. Pick the percentage to match your schedule, not the other way around."
        },
        {
          title: 'This model assumes flour, water, salt and yeast only',
          body: 'Oil, sugar or malt in a recipe add their own percentage to the same flour-weight denominator used here. Leaving them out slightly understates the flour weight for a fixed total dough weight; add their percentage to hydration + salt + yeast in the formula above if your recipe includes one.'
        },
        {
          title: 'Dough ball weight depends on pizza size and crust style',
          body: 'A thin 12-inch pizza and a thick 12-inch pan pizza use very different dough ball weights for the same diameter. Weigh out a ball from a recipe you already like and use that figure here rather than guessing.'
        }
      ],
      references: [
        { label: 'King Arthur Baking, "Neapolitan-Style Pizza Crust" recipe (weights, yield, fermentation time)', url: 'https://www.kingarthurbaking.com/recipes/neapolitan-style-pizza-crust-recipe' },
        { label: 'King Arthur Baking, "Super-Fast Thin-Crust Pizza Dough" recipe (same-day hydration comparison)', url: 'https://www.kingarthurbaking.com/recipes/super-fast-thin-crust-pizza-dough-recipe' },
        { label: 'King Arthur Baking, Ingredient Weight Chart (instant yeast, grams per teaspoon)', url: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart' }
      ]
    },
    inputs: [
      { id: 'numberOfPizzas', label: 'Number of pizzas', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 },
      { id: 'doughBallWeight', label: 'Dough ball weight', type: 'number', placeholder: '205', defaultValue: 205, step: 5, min: 50, dimension: 'mass', unit: 'g' },
      { id: 'hydrationPercent', label: 'Hydration / water (%)', type: 'percent', placeholder: '73.3', defaultValue: 73.3, step: 0.1, min: 0 },
      { id: 'saltPercent', label: 'Salt (%)', type: 'percent', placeholder: '3.45', defaultValue: 3.45, step: 0.05, min: 0 },
      { id: 'yeastPercent', label: 'Instant yeast (%)', type: 'percent', placeholder: '0.16', defaultValue: 0.16, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Pizza Dough Calculator – Flour, Water, Salt & Yeast',
      description: 'Free pizza dough calculator. Enter pizza count, dough ball weight, hydration, salt and yeast percentages to get flour, water, salt and yeast weights in grams.',
      faq: [
        { question: 'How much flour do I need for pizza dough?', answer: "Divide the total dough weight (pizzas × dough ball weight) by 1 plus the hydration, salt and yeast percentages added together, as fractions. Two 205 g dough balls at 73.3% hydration, 3.45% salt and 0.16% yeast need about 232 g of flour." },
        { question: 'What hydration should pizza dough be?', answer: "It depends on the style. King Arthur Baking's same-day Super-Fast Thin-Crust recipe uses 63.3% hydration; their slow-fermented Neapolitan-Style recipe uses 73.3%. Lower hydration is easier to handle; higher hydration gives a more open, chewy crumb." },
        { question: 'How much yeast does pizza dough need?', answer: 'It depends on how long the dough rises. A long, cold or room-temperature rise of 12-24 hours can use well under 0.2% instant yeast, as in King Arthur’s Neapolitan recipe; a same-day dough typically needs 1% or more to rise in just a few hours.' },
        { question: 'How much dough do I need per pizza?', answer: 'It depends on size and crust style — King Arthur’s Neapolitan recipe uses about 205 g per 10-12 inch pizza for a thin, chewy crust. A thicker or larger pizza needs a heavier dough ball; start from a recipe you like and weigh its dough ball.' },
        { question: 'How much salt goes in pizza dough?', answer: 'King Arthur’s Neapolitan-Style Pizza Crust recipe uses 8 g of salt for 232 g of flour — about 3.45% of the flour weight, a typical mid-range figure for pizza dough.' },
        { question: 'Can I include oil or sugar in this calculator?', answer: "Not directly — this model covers flour, water, salt and yeast only. If your recipe adds oil or sugar, add its percentage to the hydration, salt and yeast percentages here before dividing, since all of them share the same flour-weight denominator." }
      ]
    },
    compute(values) {
      const totalDoughWeight = values.numberOfPizzas * values.doughBallWeight;
      const sumOtherPercent = values.hydrationPercent + values.saltPercent + values.yeastPercent;
      const flourWeight = totalDoughWeight / (1 + sumOtherPercent / 100);
      const waterWeight = (flourWeight * values.hydrationPercent) / 100;
      const saltWeight = (flourWeight * values.saltPercent) / 100;
      const yeastWeight = (flourWeight * values.yeastPercent) / 100;
      return { flourWeight, waterWeight, saltWeight, yeastWeight, totalDoughWeight };
    }
  },
  {
    id: 'turkey-cook-time-calculator',
    category: 'food',
    glyph: 'tky',
    updatedAt: '2026-11-05',
    aliases: ['turkey cooking time calculator', 'turkey roasting time calculator', 'how long to cook a turkey', 'turkey cook time by weight', 'turkey roasting chart', 'how long to roast a turkey per pound'],
    related: ['turkey-thaw-time-calculator', 'rice-to-water-ratio-calculator', 'recipe-scaling-calculator', 'pizza-dough-calculator'],
    title: 'Turkey Cooking Time Calculator',
    description: "USDA's own roasting timetable for a whole turkey at 325°F, unstuffed or stuffed, by weight — plus the safe minimum internal temperature and standing time.",
    example: 'A 16 lb unstuffed turkey at 325°F takes about 3 hours 45 minutes to 4 hours 15 minutes, per USDA’s roasting timetable — always finish by thermometer, not the clock.',
    breakdown: {
      headline: 'roastTimeMidHours',
      headlineLabel: 'Estimated roast time',
      outputs: [
        { id: 'roastTimeMidHours', label: 'Roast time, midpoint', format: 'number', dimension: 'time', unit: 'h' },
        { id: 'roastTimeLowHours', label: 'Roast time, low', format: 'number', dimension: 'time', unit: 'h' },
        { id: 'roastTimeHighHours', label: 'Roast time, high', format: 'number', dimension: 'time', unit: 'h' },
        { id: 'safeInternalTempF', label: 'Safe minimum internal temperature (°F)', format: 'integer' },
        { id: 'standTimeMinutes', label: 'Standing time before carving (minutes)', format: 'integer' }
      ],
      groups: [
        { title: 'Turkey', inputs: ['turkeyWeightLb', 'stuffed'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'roastTimeLowHours', label: 'Low estimate' },
          { from: 'roastTimeHighHours', label: 'High estimate' }
        ],
        title: 'Roast time range at 325°F'
      }
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: "USDA's turkey roasting timetable",
        paragraphs: [
          "The USDA Food Safety and Inspection Service's consumer guide \"Let's Talk Turkey\" publishes a roasting timetable for a whole turkey at an oven temperature no lower than 325°F, as a weight-banded range — not a single minutes-per-pound figure, since bigger birds cook proportionally faster per pound than small ones. This calculator reads that same table directly: pick a weight and whether the turkey is stuffed, and it returns USDA's own low and high time estimate for that weight band.",
          "The timetable is explicitly a starting point, not the finish line. USDA's guidance is to always confirm doneness with a food thermometer: 165°F in the innermost part of the thigh, the wing, and the thickest part of the breast — all three, since the thigh reaches temperature well before the breast in most ovens. A stuffed turkey's stuffing must also reach 165°F on its own.",
          'Cooking from frozen takes meaningfully longer than any of these estimates. USDA notes that a turkey cooked from the frozen state needs at least 50% longer than a fully thawed bird of the same weight — reason enough to thaw first whenever the schedule allows it.'
        ]
      },
      howTo: {
        intro: 'Enter the turkey’s weight and whether it is stuffed — the calculator returns USDA’s published roasting time range for that weight band at 325°F.',
        steps: [
          { name: 'Weigh the turkey', text: 'Use the weight on the packaging, or your own kitchen scale, in pounds.' },
          { name: 'Choose stuffed or unstuffed', text: 'Stuffed turkeys take longer, since the stuffing itself needs to reach a safe temperature.' },
          { name: 'Read the time range', text: 'The result shows USDA’s low and high estimate for your weight band, plus a midpoint.' },
          { name: 'Set the oven to 325°F or higher', text: 'USDA’s timetable assumes an oven temperature no lower than 325°F — a cooler oven will run longer than these estimates.' },
          { name: 'Finish by thermometer, not the clock', text: 'Start checking the internal temperature as you approach the low end of the range, and keep going until the thigh, wing and breast all read at least 165°F.' },
          { name: 'Let it stand before carving', text: 'USDA recommends about 20 minutes of standing time so the juices redistribute before you carve.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "This is a lookup against USDA's own published weight bands, not a formula — the time per pound is not constant across the table, so the calculator matches your weight to USDA's band and shows that band's own low and high time directly.",
        expression: 'band = the USDA weight range containing your turkey’s weight\nroast time = band’s published low–high range, at 325°F\nmidpoint = (low + high) ÷ 2',
        terms: [
          { symbol: 'band', meaning: 'One row of USDA’s roasting timetable, e.g. "14 to 18 lb" — bands differ for stuffed and unstuffed turkeys.' },
          { symbol: 'low, high', meaning: 'USDA’s own published time range for that weight band, in hours.' }
        ],
        note: 'USDA’s table covers 4–24 lb unstuffed (the low end labeled "breast," for a bone-in turkey breast rather than a whole small bird) and 6–24 lb stuffed. Outside that range, these figures extrapolate from the nearest band — rely on a thermometer more than the clock.'
      },
      workedExample: {
        intro: 'A 16 lb unstuffed turkey, oven at 325°F.',
        rows: [
          { label: 'Weight', value: '16 lb, unstuffed' },
          { label: 'USDA weight band', value: '14 to 18 lb' },
          { label: 'Published range', value: '3¾ to 4¼ hours' },
          { label: 'Midpoint ((3.75 + 4.25) ÷ 2)', value: '4.00 hours' },
          { label: 'Safe internal temperature', value: '165°F (thigh, wing, breast)' },
          { label: 'Standing time', value: '20 minutes' }
        ],
        result: '3 hours 45 minutes to 4 hours 15 minutes, finished by thermometer',
        explanation: 'The same 16 lb turkey, stuffed, falls in the stuffed table’s 14-18 lb band instead: 4 to 4¼ hours — about 15-30 minutes longer than unstuffed, since the stuffing itself has to reach a safe 165°F.'
      },
      watchOut: [
        {
          title: 'These are estimates — the thermometer has the final word',
          body: 'Oven calibration, how often the door is opened, and whether the turkey was fully thawed all shift the real time away from USDA’s published range. Start checking temperature near the low end and keep going until every spot reads 165°F.'
        },
        {
          title: 'Frozen turkeys take at least 50% longer',
          body: 'USDA states a turkey cooked from the frozen state needs at least 50% longer than a thawed one of the same weight. These time ranges assume a fully thawed turkey — thaw first whenever your schedule allows it.'
        },
        {
          title: 'Stuffing must reach 165°F on its own',
          body: 'A stuffed turkey’s longer table accounts for roasting time, but the stuffing itself needs a separate thermometer check — reaching temperature in the bird’s thigh does not guarantee the stuffing is safe.'
        },
        {
          title: 'The lowest weight band is for a turkey breast, not a whole small bird',
          body: 'USDA labels its 4-8 lb (unstuffed) and 6-8 lb (stuffed) rows "breast" — a bone-in turkey breast roasts differently than a small whole turkey of the same weight, which is unusual at retail.'
        }
      ],
      references: [
        { label: 'USDA Food Safety and Inspection Service, "Let’s Talk Turkey — A Consumer Guide to Safely Roasting a Turkey" (roasting timetable, internal temperature, standing time, frozen-turkey note)', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/lets-talk-turkey-roasting' },
        { label: 'USDA Food Safety and Inspection Service, "Turkey Basics: Safe Cooking"', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-basics-safe-cooking' }
      ]
    },
    inputs: [
      { id: 'turkeyWeightLb', label: 'Turkey weight (lb)', type: 'number', placeholder: '16', defaultValue: 16, step: 1, min: 4 },
      {
        id: 'stuffed',
        label: 'Stuffed?',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'No — unstuffed' },
          { value: 1, label: 'Yes — stuffed' }
        ]
      }
    ],
    seo: {
      title: 'Turkey Cooking Time Calculator – USDA Roasting Chart',
      description: "Free turkey cooking time calculator from USDA's 325°F roasting timetable, unstuffed or stuffed, by weight — with safe internal temperature and standing time.",
      faq: [
        { question: 'How long does it take to cook a turkey?', answer: 'USDA’s roasting timetable at 325°F gives a range by weight — a 16 lb unstuffed turkey takes about 3¾ to 4¼ hours. Bigger turkeys take longer in total but less time per pound than smaller ones, so the table is banded by weight rather than a flat minutes-per-pound figure.' },
        { question: 'How long to cook a stuffed turkey vs. unstuffed?', answer: 'Stuffed takes longer — USDA’s 16 lb row is 3¾ to 4¼ hours unstuffed versus 4 to 4¼ hours stuffed, because the stuffing itself needs time to reach a safe 165°F.' },
        { question: 'What is the safe internal temperature for turkey?', answer: '165°F, checked with a food thermometer in the innermost part of the thigh, the wing, and the thickest part of the breast — USDA recommends checking all three, since the thigh reaches temperature first in most ovens. Stuffing needs its own 165°F check.' },
        { question: 'How long should a turkey rest before carving?', answer: 'About 20 minutes, per USDA’s guidance — this lets the juices redistribute through the meat before you carve.' },
        { question: 'Does a frozen turkey take longer to cook?', answer: 'Yes — USDA states a turkey roasted from the frozen state needs at least 50% longer than a fully thawed turkey of the same weight. These time ranges assume a thawed turkey.' },
        { question: 'What oven temperature should I use for turkey?', answer: 'USDA’s timetable assumes an oven set no lower than 325°F. A cooler oven will take longer than the published ranges and makes it harder to reach a safe internal temperature throughout the bird in a reasonable time.' }
      ]
    },
    compute(values) {
      const stuffed = values.stuffed === 1;
      const band = turkeyBand(values.turkeyWeightLb, stuffed);
      return {
        roastTimeLowHours: band.loHr,
        roastTimeHighHours: band.hiHr,
        roastTimeMidHours: (band.loHr + band.hiHr) / 2,
        safeInternalTempF: 165,
        standTimeMinutes: 20
      };
    }
  },
  {
    id: 'rice-to-water-ratio-calculator',
    category: 'food',
    glyph: 'rice',
    updatedAt: '2026-11-05',
    aliases: ['rice to water ratio calculator', 'rice water ratio calculator', 'how much water for rice', 'rice cooking ratio calculator', 'basmati rice water ratio', 'how much water for jasmine rice'],
    related: ['recipe-scaling-calculator', 'turkey-cook-time-calculator', 'cups-to-grams-converter', 'milliliters-to-cups-converter'],
    title: 'Rice to Water Ratio Calculator',
    description: 'Find how much water a given amount of rice needs on the stovetop, by rice type — white, basmati, jasmine, brown or sushi rice — from tested recipe ratios.',
    example: '1 cup of basmati rice needs 1.5 cups of water on the stovetop — America’s Test Kitchen’s own Basmati Rice Pilaf recipe uses exactly that ratio (1½ cups rice to 2¼ cups water).',
    breakdown: {
      headline: 'waterCups',
      headlineLabel: 'Water needed',
      outputs: [
        { id: 'waterCups', label: 'Water', format: 'number', dimension: 'volume', unit: 'cup', alsoIn: ['mL'] },
        { id: 'ratio', label: 'Ratio (cups water per cup rice)', format: 'number' }
      ],
      groups: [
        { title: 'Rice', inputs: ['riceAmount', 'riceType'] }
      ]
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Why the "right" rice-to-water ratio depends on the rice',
        paragraphs: [
          "Different rice types are commonly cooked with different water ratios: America's Test Kitchen's own tested recipes use 1.5 cups of water per cup of long-grain white rice, basmati or jasmine rice (2:3 by volume), 2.25 cups per cup of brown rice, and 1.25 cups per cup of sushi rice on the stovetop. This calculator applies whichever of those ratios matches the rice you picked.",
          "It's worth knowing why the ratios differ, because the common explanation — that brown rice simply absorbs more water — isn't quite right. In a controlled experiment covering 17 rice varieties sealed to eliminate evaporation, America's Test Kitchen found every variety cooked properly with the same 1:1 ratio of rice to water. The published ratios differ mainly because of cooking time and evaporation, not absorption: brown rice's bran layer makes it take much longer to cook through, and that extra time on the stove boils off more water, which is why its practical ratio runs higher than white rice's.",
          "That finding also explains why the long-believed \"2 cups water per cup of rice\" figure for white rice is higher than most tested stovetop recipes actually use — a tight-fitting lid and a controlled simmer, as in America's Test Kitchen's own Basic White Rice recipe (2 cups rice to 3 cups water, the same 1.5:1 ratio as basmati and jasmine), lose less water to evaporation than an uncovered or loosely covered pot."
        ]
      },
      howTo: {
        intro: 'Enter how much rice you have and pick its type — the calculator returns the water amount from that type’s tested stovetop ratio.',
        steps: [
          { name: 'Enter the rice amount', text: 'In cups (or switch the unit to milliliters, tablespoons, etc.).' },
          { name: 'Pick the rice type', text: 'White long-grain, basmati, jasmine, brown or sushi rice — each has its own ratio below.' },
          { name: 'Read the water amount', text: 'The water needed for that rice amount, also shown in milliliters.' },
          { name: 'Rinse first if the recipe calls for it', text: 'Rinsing removes surface starch and is standard for basmati, jasmine and sushi rice; it does not change the ratio itself.' },
          { name: 'Use a tight-fitting lid', text: 'These ratios assume a covered pot at a controlled simmer — an uncovered or loosely covered pot loses more water to evaporation and may need slightly more.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Water needed is the rice amount multiplied by that rice type’s tested ratio.',
        expression: 'water = rice amount × ratio\n\nratio (cups water per cup rice):\nwhite long-grain = 1.5 · basmati = 1.5 · jasmine = 1.5 · brown = 2.25 · sushi = 1.25',
        terms: [
          { symbol: 'rice amount', meaning: 'The volume of dry, uncooked rice, in cups (or your chosen unit).' },
          { symbol: 'ratio', meaning: 'Cups of water per cup of that rice type, from America’s Test Kitchen’s own tested stovetop recipes.' }
        ],
        note: 'These are stovetop, lidded-pot ratios. A rice cooker, Instant Pot or microwave commonly needs a different ratio for the same rice — check your appliance’s own instructions rather than applying a stovetop figure to it.'
      },
      workedExample: {
        intro: '1 cup of basmati rice, cooked on the stovetop.',
        rows: [
          { label: 'Rice amount', value: '1 cup' },
          { label: 'Ratio (basmati)', value: '1.5 cups water per cup rice' },
          { label: 'Water needed (1 × 1.5)', value: '1.5 cups (≈ 355 mL)' }
        ],
        result: '1.5 cups of water for 1 cup of basmati rice',
        explanation: 'America’s Test Kitchen’s own Basmati Rice Pilaf recipe uses 1½ cups of rice to 2¼ cups of water — the same 1.5:1 ratio, just at a larger batch size (2.25 ÷ 1.5 = 1.5).'
      },
      watchOut: [
        {
          title: 'The ratio depends on cooking method, not just rice type',
          body: 'These are stovetop, lidded-pot ratios. A rice cooker, Instant Pot or microwave loses water to evaporation differently and commonly calls for a different amount for the exact same rice — follow your appliance’s own instructions rather than this stovetop figure.'
        },
        {
          title: '"Rice needs more water because it absorbs more" is an oversimplification',
          body: "America's Test Kitchen's own controlled test found every rice variety cooks properly with a 1:1 ratio when evaporation is eliminated. The practical differences between types come mainly from how long each one simmers and how much water that simmer time boils off — not from one grain inherently absorbing more than another."
        },
        {
          title: 'Pot size and lid fit change real-world evaporation',
          body: 'A wide pot, a loose-fitting lid, or a higher simmer all lose more water to steam than a narrow pot with a tight lid at a gentle simmer — two kitchens following the same ratio can still get drier or wetter rice depending on their actual equipment.'
        },
        {
          title: 'Rinsing changes texture, not the ratio',
          body: 'Rinsing rice removes surface starch and is standard practice for basmati, jasmine and sushi rice, giving separate, less sticky grains — it does not meaningfully change how much water the rice needs to finish cooking.'
        }
      ],
      references: [
        { label: "America's Test Kitchen, \"We Nail Down the Ideal Ratio of Water to Rice\" (controlled 1:1 ratio experiment across 17 varieties)", url: 'https://www.americastestkitchen.com/articles/1692-nailing-the-perfect-ratio-of-water-to-rice' },
        { label: "America's Test Kitchen, \"Basic White Rice\" recipe", url: 'https://www.americastestkitchen.com/recipes/6905-basic-white-rice' },
        { label: "America's Test Kitchen, \"Basmati Rice Pilaf\" recipe", url: 'https://www.americastestkitchen.com/recipes/10355-basmati-rice-pilaf' },
        { label: "America's Test Kitchen, \"Basic Brown Rice\" (rice cooker) recipe", url: 'https://www.americastestkitchen.com/recipes/240-basic-brown-rice-rice-cooker' }
      ]
    },
    inputs: [
      { id: 'riceAmount', label: 'Rice amount', type: 'number', placeholder: '1', defaultValue: 1, step: 0.25, min: 0.25, dimension: 'volume', unit: 'cup' },
      {
        id: 'riceType',
        label: 'Rice type',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'White long-grain (1.5 : 1)' },
          { value: 1, label: 'Basmati (1.5 : 1)' },
          { value: 2, label: 'Jasmine (1.5 : 1)' },
          { value: 3, label: 'Brown (2.25 : 1)' },
          { value: 4, label: 'Sushi (1.25 : 1)' }
        ]
      }
    ],
    seo: {
      title: 'Rice to Water Ratio Calculator – By Rice Type',
      description: 'Free rice to water ratio calculator for white, basmati, jasmine, brown and sushi rice, from tested stovetop recipe ratios, in cups or milliliters.',
      faq: [
        { question: 'What is the water ratio for white rice?', answer: '1.5 cups of water per cup of long-grain white rice on the stovetop, per America’s Test Kitchen’s tested recipe (2 cups rice to 3 cups water) — less than the commonly cited 2:1 ratio, since a tight lid and controlled simmer lose less water to evaporation.' },
        { question: 'What is the water ratio for basmati or jasmine rice?', answer: 'The same 1.5 cups of water per cup of rice as white rice, per America’s Test Kitchen’s tested recipes — both basmati and jasmine are long-grain aromatic rices that behave the same way on the stovetop.' },
        { question: 'How much water does brown rice need?', answer: '2.25 cups of water per cup of brown rice on the stovetop (or in a rice cooker), per America’s Test Kitchen’s tested recipe — more than white rice mainly because brown rice’s bran layer takes longer to cook through, and that extra time loses more water to evaporation.' },
        { question: 'What is the ratio for sushi rice?', answer: '1.25 cups of water per cup of sushi rice, per America’s Test Kitchen’s tested recipe — less than long-grain rice, consistent with sushi rice’s shorter, gentler simmer.' },
        { question: 'Does rice really need different amounts of water depending on the type?', answer: 'Not because of absorption — America’s Test Kitchen found every rice type cooks properly at a 1:1 ratio when evaporation is eliminated. In normal stovetop cooking, longer-cooking types like brown rice lose more water to evaporation, which is why their practical ratio is higher.' },
        { question: 'Is the ratio the same for a rice cooker or Instant Pot?', answer: 'Not necessarily. These figures are for a lidded pot on the stovetop; a rice cooker, Instant Pot or microwave evaporates water differently and often calls for its own ratio — check the appliance’s instructions.' }
      ]
    },
    compute(values) {
      const ratio = RICE_WATER_RATIO[values.riceType];
      const waterCups = values.riceAmount * ratio;
      return { waterCups, ratio };
    }
  },
  {
    id: 'turkey-thaw-time-calculator',
    category: 'food',
    glyph: 'thaw',
    updatedAt: '2026-11-05',
    aliases: ['turkey thawing time calculator', 'how long to thaw a turkey', 'turkey defrost time calculator', 'refrigerator thaw time turkey', 'cold water thawing time turkey', 'how many days to thaw a turkey'],
    related: ['turkey-cook-time-calculator', 'recipe-scaling-calculator', 'rice-to-water-ratio-calculator'],
    title: 'Turkey Thaw Time Calculator',
    description: "USDA's own thawing timetable for a whole frozen turkey, by weight — refrigerator and cold-water methods side by side, straight from USDA's \"Turkey Basics: Safe Thawing.\"",
    example: 'A 16 lb frozen turkey needs about 4 to 5 days in the refrigerator, or 8 to 10 hours in cold water (changed every 30 minutes) — per USDA’s published thawing times.',
    breakdown: {
      headline: 'refrigeratorDaysMid',
      headlineLabel: 'Refrigerator thaw time (recommended)',
      outputs: [
        { id: 'refrigeratorDaysMid', label: 'Refrigerator thaw time, midpoint', format: 'number', dimension: 'time', unit: 'd' },
        { id: 'refrigeratorDaysLow', label: 'Refrigerator thaw time, low', format: 'number', dimension: 'time', unit: 'd' },
        { id: 'refrigeratorDaysHigh', label: 'Refrigerator thaw time, high', format: 'number', dimension: 'time', unit: 'd' },
        { id: 'coldWaterHoursMid', label: 'Cold water thaw time, midpoint', format: 'number', dimension: 'time', unit: 'h' },
        { id: 'coldWaterHoursLow', label: 'Cold water thaw time, low', format: 'number', dimension: 'time', unit: 'h' },
        { id: 'coldWaterHoursHigh', label: 'Cold water thaw time, high', format: 'number', dimension: 'time', unit: 'h' }
      ],
      groups: [
        { title: 'Turkey', inputs: ['turkeyWeightLb'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'refrigeratorDaysLow', label: 'Refrigerator, low' },
          { from: 'refrigeratorDaysHigh', label: 'Refrigerator, high' }
        ],
        title: 'Refrigerator thaw time range (days)'
      }
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'The three safe ways to thaw a turkey',
        paragraphs: [
          'USDA’s Food Safety and Inspection Service names three safe ways to thaw a frozen turkey: in the refrigerator, in cold water, or in the microwave. A turkey left thawing on the counter is not safe once more than 2 hours pass — even if the center is still frozen, the outer layer sits in the "danger zone" between 40°F and 140°F, where bacteria multiply quickly. A fully frozen turkey, by contrast, is safe indefinitely in the freezer; the clock only starts once thawing begins.',
          "This calculator reads USDA's own published refrigerator and cold-water thawing tables directly, matched to your turkey's weight. The refrigerator method is the one USDA lists first and the one that needs the least hands-on attention — plan roughly 24 hours for every 4 to 5 pounds, at 40°F or below. The cold-water method is faster (roughly 30 minutes per pound) but needs the water changed every 30 minutes and the turkey cooked immediately once it's thawed.",
          'Microwave thawing is USDA’s third method, but it has no weight-based time table — follow the microwave’s own manufacturer instructions, and because parts of the turkey can begin to cook during microwaving, cook it immediately afterward rather than holding it.'
        ]
      },
      howTo: {
        intro: 'Enter the turkey’s weight — the calculator returns USDA’s published thaw time range for both the refrigerator and cold-water methods.',
        steps: [
          { name: 'Weigh the turkey', text: 'Use the weight on the packaging, or your own kitchen scale, in pounds.' },
          { name: 'Pick a method', text: 'Refrigerator thawing needs the least attention; cold-water thawing is faster but needs active monitoring.' },
          { name: 'Read the time range', text: 'The result shows USDA’s low and high estimate for your weight band, for both methods, plus a midpoint.' },
          { name: 'Keep the refrigerator at 40°F or below', text: 'Place the turkey in a container or on a tray to catch any drips, away from other food.' },
          { name: 'For cold water, change it every 30 minutes', text: 'Keep the turkey in a leak-proof bag, fully submerged, and cook it immediately once it’s thawed.' },
          { name: 'Plan backward from your cooking day', text: 'Count back from when you want to start roasting to find your thaw start date.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "This is a lookup against USDA's own published weight bands, not a formula — the calculator matches your weight to USDA's band for each method and shows that band's own low and high time directly.",
        expression: 'refrigerator band = USDA’s weight range containing your turkey’s weight, in days\ncold water band = USDA’s weight range containing your turkey’s weight, in hours\nmidpoint = (low + high) ÷ 2',
        terms: [
          { symbol: 'band', meaning: 'One row of USDA’s thawing timetable, e.g. "16 to 20 lb" — bands differ between the refrigerator and cold-water methods.' },
          { symbol: 'low, high', meaning: 'USDA’s own published time range for that weight band.' }
        ],
        note: 'USDA’s thawing tables cover 4 to 24 lb. Outside that range, these figures extrapolate from the nearest band — a bigger turkey needs proportionally more time either way.'
      },
      workedExample: {
        intro: 'A 16 lb frozen turkey.',
        rows: [
          { label: 'Weight', value: '16 lb' },
          { label: 'USDA refrigerator band', value: '16 to 20 lb → 4 to 5 days' },
          { label: 'Refrigerator midpoint ((4 + 5) ÷ 2)', value: '4.5 days' },
          { label: 'USDA cold water band', value: '16 to 20 lb → 8 to 10 hours' },
          { label: 'Cold water midpoint ((8 + 10) ÷ 2)', value: '9 hours' }
        ],
        result: '4 to 5 days in the refrigerator, or 8 to 10 hours in cold water',
        explanation: 'The cold-water method’s low end (8 hours) matches the simple "30 minutes per pound" rule of thumb exactly: 16 lb × 30 minutes = 480 minutes = 8 hours — the published band’s high end allows margin beyond that estimate.'
      },
      watchOut: [
        {
          title: 'Only refrigerator-thawed turkey can wait before cooking',
          body: 'USDA says a turkey thawed in the refrigerator can stay there 1 to 2 more days before cooking. A turkey thawed by cold water or microwave has no such buffer — USDA says to cook it immediately after thawing.'
        },
        {
          title: 'Cold water must be changed every 30 minutes',
          body: 'The turkey needs to stay in a leak-proof bag, fully submerged in cold tap water that gets replaced every 30 minutes, both to keep the water cold enough and to prevent the turkey from absorbing water.'
        },
        {
          title: 'More than 2 hours at room temperature is not safe',
          body: 'USDA’s "danger zone" (40°F to 140°F) applies to the outer layer of the turkey even while the center is still frozen — a turkey left out on the counter, porch or car trunk for more than 2 hours while thawing is not at a safe temperature.'
        },
        {
          title: 'Frozen turkey is safe indefinitely — but takes much longer to cook',
          body: 'There’s no food-safety reason to rush the thaw: a fully frozen turkey keeps safely in the freezer. If time runs out, USDA notes a turkey roasted from frozen takes at least 50% longer than a thawed one — see the turkey cooking time calculator.'
        }
      ],
      references: [
        { label: 'USDA Food Safety and Inspection Service, "Turkey Basics: Safe Thawing" (refrigerator and cold-water thawing times by weight, danger-zone and microwave guidance)', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-basics-safe-thawing' },
        { label: 'USDA Food Safety and Inspection Service, "Let’s Talk Turkey — A Consumer Guide to Safely Roasting a Turkey"', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/lets-talk-turkey-roasting' }
      ]
    },
    inputs: [
      { id: 'turkeyWeightLb', label: 'Turkey weight (lb)', type: 'number', placeholder: '16', defaultValue: 16, step: 1, min: 4 }
    ],
    seo: {
      title: 'Turkey Thaw Time Calculator – USDA Thawing Chart',
      description: "Free turkey thaw time calculator from USDA's own thawing timetable, by weight — refrigerator and cold-water methods, side by side.",
      faq: [
        { question: 'How long does it take to thaw a turkey in the refrigerator?', answer: 'USDA’s rule is about 24 hours for every 4 to 5 pounds, at 40°F or below. A 16 lb turkey falls in USDA’s "16 to 20 lb" band, which is 4 to 5 days.' },
        { question: 'How long does it take to thaw a turkey in cold water?', answer: 'About 30 minutes per pound, with the water changed every 30 minutes. A 16 lb turkey falls in USDA’s "16 to 20 lb" cold-water band, which is 8 to 10 hours — and it must be cooked immediately once thawed.' },
        { question: 'Can I thaw a turkey on the counter?', answer: 'No. USDA says a turkey left thawing at room temperature for more than 2 hours is not at a safe temperature, since its outer layer sits in the 40–140°F "danger zone" where bacteria multiply rapidly, even while the center is still frozen.' },
        { question: 'Do I need to cook a turkey right after thawing it?', answer: 'It depends on the method. A refrigerator-thawed turkey can wait 1 to 2 more days in the fridge. A turkey thawed in cold water or the microwave has to be cooked immediately, per USDA.' },
        { question: 'How long does it take to thaw a turkey in the microwave?', answer: 'USDA gives no weight-based time table for microwave thawing — follow your microwave’s own manufacturer instructions, and cook the turkey immediately afterward, since some areas may begin to cook during microwaving.' },
        { question: 'Is a frozen turkey still safe to eat?', answer: 'Yes — USDA says a fully frozen turkey is safe indefinitely. Safety only becomes time-sensitive once thawing begins. If you run out of time to thaw it, you can roast it from frozen, but USDA says to plan on at least 50% longer cooking time.' }
      ]
    },
    compute(values) {
      const refBand = turkeyThawBand(values.turkeyWeightLb, TURKEY_THAW_BANDS.refrigerator);
      const cwBand = turkeyThawBand(values.turkeyWeightLb, TURKEY_THAW_BANDS.coldWater);
      return {
        refrigeratorDaysLow: refBand.loDays,
        refrigeratorDaysHigh: refBand.hiDays,
        refrigeratorDaysMid: (refBand.loDays + refBand.hiDays) / 2,
        coldWaterHoursLow: cwBand.loHr,
        coldWaterHoursHigh: cwBand.hiHr,
        coldWaterHoursMid: (cwBand.loHr + cwBand.hiHr) / 2
      };
    }
  },
  {
    id: 'boiled-egg-calculator',
    category: 'food',
    glyph: 'egg',
    updatedAt: '2026-11-05',
    aliases: ['boiled egg calculator', 'how long to boil an egg', 'soft boiled egg timer', 'hard boiled egg time calculator', 'jammy egg timer', 'egg boiling time by size'],
    related: ['turkey-cook-time-calculator', 'steak-doneness-calculator', 'recipe-scaling-calculator'],
    title: 'Boiled Egg Calculator',
    description: 'Egg cook time by doneness (soft-cooked, jammy or hard-cooked) from America’s Test Kitchen’s steam method, plus the classic cold-start standing time by egg size from the American Egg Board.',
    example: 'A jammy egg — steamed over ½ inch of boiling water, covered — takes 8 minutes, per America’s Test Kitchen; a large egg cooked the classic cold-start way needs 12 minutes of standing time, per the American Egg Board.',
    breakdown: {
      headline: 'steamedCookTimeMinutes',
      headlineLabel: 'Steamed cook time (by doneness)',
      outputs: [
        { id: 'steamedCookTimeMinutes', label: 'Steamed cook time', format: 'number', dimension: 'time', unit: 'min' },
        { id: 'classicStandTimeMinutes', label: 'Classic cold-start standing time (hard-cooked, by size)', format: 'number', dimension: 'time', unit: 'min' }
      ],
      groups: [
        { title: 'Egg', inputs: ['doneness', 'eggSize'] }
      ]
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Two tested methods, not one universal number',
        paragraphs: [
          "\"How long to boil an egg\" depends on which method you're actually using, because the starting point changes everything. America's Test Kitchen's steam method lowers eggs into a covered pot over ½ to 1 inch of already-boiling water — not submerged, just steamed — and times from there: 6½ minutes for a soft-cooked egg with a runny yolk, 8 minutes for a jammy, spreadable yolk, and 13 minutes for a fully set hard-cooked egg. All three figures come from large, refrigerator-cold eggs.",
          "The American Egg Board's classic method starts differently: cover the eggs with cold water, bring it to a boil, then take the pan off the heat entirely and let the eggs stand, covered, in the hot water. That standing time is sized to the egg itself — 9 minutes for medium eggs, 12 for large, 15 for extra-large — and it's a hard-cooked-only method; the Egg Board doesn't publish a cold-start time for a softer yolk.",
          "These two methods aren't interchangeable readings of the same number. Steaming holds a more consistent temperature regardless of how many eggs are in the pot — America's Test Kitchen found the same steam times work equally well for anywhere from 1 to 6 eggs — while the cold-start method's standing time is specifically calibrated to how long a column of hot water takes to finish cooking through an egg of a given size."
        ]
      },
      howTo: {
        intro: 'Pick a doneness level for the steamed method and an egg size for the classic cold-start method — the calculator returns both.',
        steps: [
          { name: 'Choose doneness', text: 'Soft-cooked (runny yolk), jammy (soft-set yolk) or hard-cooked, for the steamed method.' },
          { name: 'Choose egg size', text: 'Medium, large or extra-large, for the classic cold-start, hard-cooked-only method.' },
          { name: 'For steaming', text: 'Bring ½ to 1 inch of water to a boil, lower in cold eggs with tongs, cover, and start timing immediately.' },
          { name: 'For the classic method', text: 'Cover eggs with cold water, bring to a boil, remove from the burner, cover, and let stand for the time shown.' },
          { name: 'Cool immediately', text: 'Transfer to an ice bath (or run under cold water) as soon as the time is up to stop the cooking and make peeling easier.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Both figures are lookups against tested timing charts, not a formula — cook time for eggs doesn’t scale linearly with a single variable, so each method’s own chart is used directly.',
        expression: 'steamed cook time = America’s Test Kitchen’s own minutes for the chosen doneness\nclassic standing time = American Egg Board’s own minutes for the chosen size',
        terms: [
          { symbol: 'doneness', meaning: 'Soft-cooked, jammy or hard-cooked — how set the yolk is.' },
          { symbol: 'size', meaning: 'Medium, large or extra-large — the carton’s printed egg size.' }
        ],
        note: 'Neither chart publishes numbers for every combination (the steamed chart is large-egg-only; the classic chart is hard-cooked-only), so the two results are independent facts, not two readings of the same underlying number.'
      },
      workedExample: {
        intro: 'A jammy egg (steamed) and a large egg cooked the classic way (cold-start, hard-cooked).',
        rows: [
          { label: 'Doneness', value: 'Jammy' },
          { label: 'Steamed cook time', value: '8 minutes' },
          { label: 'Egg size', value: 'Large' },
          { label: 'Classic standing time', value: '12 minutes' }
        ],
        result: '8 minutes steamed for a jammy yolk; 12 minutes standing time for a large hard-cooked egg the classic way',
        explanation: 'These are two separate answers to two separate questions — not a jammy version of the classic method, since the Egg Board doesn’t publish one.'
      },
      watchOut: [
        {
          title: 'A soft or jammy yolk isn’t "firm" by FDA’s own standard',
          body: 'The FDA’s safe minimum temperature chart lists eggs as "cook until yolk & white are firm." A runny or jammy yolk doesn’t meet that standard, which matters most for anyone at higher risk from foodborne illness — young children, older adults, pregnant people, or anyone with a weakened immune system.'
        },
        {
          title: 'Egg count doesn’t change the steamed cook time',
          body: 'America’s Test Kitchen tested the steam method with batches from 1 to 6 eggs at the exact same timing — steaming holds its temperature far more consistently than a pot of water does, so more eggs in a single layer don’t need more time.'
        },
        {
          title: 'The two methods start from different points',
          body: 'Steaming starts the clock once the water is already boiling; the classic method starts timing from a cold pot and includes the time it takes to reach a boil as "off the clock," since the stand time only begins after the burner is turned off.'
        },
        {
          title: 'Cool the eggs right away',
          body: 'The American Egg Board’s hard-cooked recipe calls for a 15-minute ice bath; America’s Test Kitchen’s jammy-egg method calls for 30 seconds of cold running water. Either way, cooling promptly stops the yolk from overcooking and helps prevent the greenish ring that can form around an overcooked yolk.'
        }
      ],
      references: [
        { label: "America's Test Kitchen, \"Foolproof Soft-Cooked Eggs\" (steam method, 6½ minutes, large cold eggs, 1-6 eggs)", url: 'https://www.americastestkitchen.com/articles/77-foolproof-soft-cooked-eggs' },
        { label: "America's Test Kitchen, \"How to Make Perfect Jammy Eggs\" (steam method, 8 minutes)", url: 'https://www.americastestkitchen.com/how_tos/13345-how-to-make-perfect-jammy-egg' },
        { label: "America's Test Kitchen, \"Easy-Peel Hard-Cooked Eggs\" (steam method, 13 minutes, large eggs, 15-minute ice bath)", url: 'https://www.americastestkitchen.com/recipes/8712-easy-peel-hard-cooked-eggs' },
        { label: 'American Egg Board (incredibleegg.org), "How to Make Hard-Boiled Eggs" (cold-start method, standing time by size)', url: 'https://www.incredibleegg.org/recipes/cooking-school/how-to-hard-boil-eggs/' },
        { label: 'U.S. Food and Drug Administration, "Safe Minimum Internal Temperatures" chart', url: 'https://www.fda.gov/media/107000/download' }
      ]
    },
    inputs: [
      {
        id: 'doneness',
        label: 'Doneness (steamed method)',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Soft-cooked — runny yolk (6½ min)' },
          { value: 1, label: 'Jammy — soft-set yolk (8 min)' },
          { value: 2, label: 'Hard-cooked — fully set (13 min)' }
        ]
      },
      {
        id: 'eggSize',
        label: 'Egg size (classic method)',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Medium (9 min)' },
          { value: 1, label: 'Large (12 min)' },
          { value: 2, label: 'Extra-large (15 min)' }
        ]
      }
    ],
    seo: {
      title: 'Boiled Egg Calculator – Soft, Jammy & Hard-Cooked',
      description: 'Free boiled egg calculator: steamed cook time by doneness (America’s Test Kitchen) and classic cold-start standing time by size (American Egg Board).',
      faq: [
        { question: 'How long do you boil an egg for a soft yolk?', answer: '6½ minutes using America’s Test Kitchen’s steam method: eggs lowered into ½ inch of already-boiling water, covered, large eggs straight from the fridge.' },
        { question: 'How long do you boil an egg for a jammy yolk?', answer: '8 minutes using the same steam method — 2 minutes longer than soft-cooked, giving a softly set, spreadable yolk instead of a fully runny one.' },
        { question: 'How long do you hard boil an egg?', answer: '13 minutes using America’s Test Kitchen’s steam method, or by the classic cold-start method (cover with water, bring to a boil, remove from heat, cover and let stand): 9 minutes for medium eggs, 12 for large, 15 for extra-large, per the American Egg Board.' },
        { question: 'Does egg size change the steamed cook time?', answer: 'America’s Test Kitchen’s steam timings (6½, 8 and 13 minutes) were tested with large eggs specifically — they don’t publish separate times for other sizes. The classic cold-start method is the one with size-specific standing times.' },
        { question: 'Why does more than one egg not need more time?', answer: 'Both tested methods hold their timing across batch sizes within reason — America’s Test Kitchen confirmed its steam timings work the same for 1 to 6 eggs, since the egg itself, not the water volume, is what limits how fast heat reaches the yolk.' },
        { question: 'Are soft-boiled eggs safe to eat?', answer: 'The FDA’s own safe-temperature guidance for eggs is to cook until the yolk and white are both firm — a runny or jammy yolk doesn’t meet that standard, which is worth knowing especially for young children, older adults, pregnant people or anyone with a weakened immune system.' }
      ]
    },
    compute(values) {
      const steamedCookTimeMinutes = EGG_STEAM_MINUTES[values.doneness];
      const classicStandTimeMinutes = EGG_STAND_MINUTES[values.eggSize];
      return { steamedCookTimeMinutes, classicStandTimeMinutes };
    }
  },
  {
    id: 'steak-doneness-calculator',
    category: 'food',
    glyph: 'stk',
    updatedAt: '2026-11-05',
    aliases: ['steak doneness calculator', 'steak temperature chart', 'steak internal temperature calculator', 'how long to cook a steak', 'medium rare steak temperature', 'steak pull temperature calculator'],
    related: ['turkey-cook-time-calculator', 'boiled-egg-calculator', 'turkey-thaw-time-calculator'],
    title: 'Steak Doneness Calculator',
    description: 'Target internal temperature by doneness — medium-rare, medium or well-done — from the Beef Checkoff’s own chart, plus the remove-from-heat "pull" temperature range that accounts for carryover cooking.',
    example: 'Medium-rare steak finishes at 145°F, per the Beef Checkoff — pull it off the heat at 135–140°F and let carryover cooking and a 5-10 minute rest carry it the rest of the way.',
    breakdown: {
      headline: 'targetTempF',
      headlineLabel: 'Doneness target temperature',
      outputs: [
        { id: 'targetTempF', label: 'Target temperature, after resting (°F)', format: 'integer' },
        { id: 'pullTempLowF', label: 'Remove from heat at, low (°F)', format: 'integer' },
        { id: 'pullTempHighF', label: 'Remove from heat at, high (°F)', format: 'integer' },
        { id: 'restTimeLowMin', label: 'Rest time, low (minutes)', format: 'integer' },
        { id: 'restTimeHighMin', label: 'Rest time, high (minutes)', format: 'integer' },
        { id: 'usdaSafeMinF', label: 'USDA/FDA safe minimum, whole cuts (°F)', format: 'integer' }
      ],
      groups: [
        { title: 'Steak', inputs: ['doneness'] }
      ],
      visual: {
        type: 'rangeBar',
        value: 'targetTempF',
        bands: [
          { label: 'Below USDA minimum', min: 0, max: 145 },
          { label: 'Medium-rare', min: 145, max: 160 },
          { label: 'Medium', min: 160, max: 170 },
          { label: 'Well-done', min: 170, max: 200 }
        ],
        title: 'Where your target temperature falls'
      }
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Doneness temperature, carryover cooking, and the USDA minimum',
        paragraphs: [
          "The Beef Checkoff's own doneness guide gives three target internal temperatures for steaks, roasts and chops: 145°F for medium-rare, 160°F for medium, and 170°F for well-done. Those are the temperatures the meat should read once it's done resting — not the moment it comes off the heat.",
          "That distinction matters because of carryover cooking: a steak's internal temperature keeps climbing for several minutes after it leaves direct heat, as heat already in the outer layers keeps moving toward the center. The Beef Checkoff's own guidance is to pull steaks and burgers off the heat 5 to 10°F below the target and let them rest 5 to 10 minutes — the calculator applies that range to whichever doneness you pick.",
          "It's worth noticing that 145°F — the industry's own \"medium-rare\" figure — is also exactly USDA and FDA's published safe minimum internal temperature for whole cuts of beef, pork, veal and lamb (steaks, chops, roasts), with its own 3-minute rest requirement. A steak cooked to any of these three targets, rested the recommended way, clears that food-safety floor; a steak pulled and served well below 145°F (the common meaning of \"rare\") does not — a choice some diners make knowingly, but one the Beef Checkoff's own published chart doesn't include a number for."
        ]
      },
      howTo: {
        intro: 'Pick a doneness level — the calculator returns the target temperature, the remove-from-heat range, and the recommended rest time.',
        steps: [
          { name: 'Choose doneness', text: 'Medium-rare, medium or well-done.' },
          { name: 'Read the target temperature', text: 'The internal temperature the steak should read once it’s finished resting.' },
          { name: 'Read the pull range', text: 'Remove the steak from the heat once an instant-read thermometer hits this range — carryover cooking covers the rest.' },
          { name: 'Insert the thermometer correctly', text: 'Through the side, into the thickest part of the steak, avoiding bone and fat for an accurate reading.' },
          { name: 'Rest before cutting', text: 'Tent loosely with foil and let the temperature finish climbing to the target over the rest window shown.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The target temperature is a lookup against the Beef Checkoff’s own three-point chart; the pull range is that target minus a published carryover-cooking allowance.',
        expression: 'target = Beef Checkoff’s published temperature for the chosen doneness\npull range = target − 10°F to target − 5°F',
        terms: [
          { symbol: 'target', meaning: 'The internal temperature the steak should read after resting, per the Beef Checkoff.' },
          { symbol: 'pull range', meaning: 'The internal temperature to remove the steak from heat at, so carryover cooking finishes the job.' }
        ],
        note: 'This covers whole cuts (steaks, chops, roasts) only. Ground beef needs its own, higher 160°F minimum regardless of how you like it cooked — carryover and resting don’t change that requirement.'
      },
      workedExample: {
        intro: 'A medium-rare steak.',
        rows: [
          { label: 'Doneness', value: 'Medium-rare' },
          { label: 'Target temperature', value: '145°F' },
          { label: 'Pull range (145 − 10 to 145 − 5)', value: '135–140°F' },
          { label: 'Rest time', value: '5–10 minutes' }
        ],
        result: 'Pull at 135–140°F, rest 5–10 minutes, finish at 145°F',
        explanation: '145°F also happens to be USDA and FDA’s own published safe minimum for whole-muscle beef — a medium-rare steak, rested the recommended way, clears that floor exactly.'
      },
      watchOut: [
        {
          title: 'The target is the rested temperature, not the pull temperature',
          body: 'Pulling a steak at the final target and skipping the rest means it finishes several degrees past where you meant to stop, since carryover cooking keeps raising the internal temperature after the heat is removed.'
        },
        {
          title: '"Rare" isn’t on the Beef Checkoff’s own chart',
          body: 'The published chart starts at medium-rare (145°F). A steak served at the lower temperature commonly called "rare" falls below USDA and FDA’s safe minimum for whole cuts — a personal choice some diners make, not a food-safety recommendation.'
        },
        {
          title: 'This is for whole cuts only',
          body: 'Ground beef — burgers, meatballs, anything where the surface has been mixed through the interior — needs a flat 160°F minimum, no carryover allowance and no doneness choice below that, per USDA and FDA.'
        },
        {
          title: 'Thermometer placement affects the reading',
          body: 'Insert an instant-read thermometer through the side into the thickest part of the steak, avoiding bone and fat, which both read differently than the meat itself and can throw off the number.'
        }
      ],
      references: [
        { label: 'Beef Checkoff (beefitswhatsfordinner.com), "Determining Doneness" (145°F medium-rare, 160°F medium, 170°F well-done)', url: 'https://www.beefitswhatsfordinner.com/cooking/determining-doneness' },
        { label: 'Beef Loving Texans (Texas Beef Council, Beef Checkoff), "Determining Doneness" (carryover cooking, pull temperature, thermometer placement)', url: 'https://beeflovingtexans.com/cooking/determining-doneness/' },
        { label: 'U.S. Food and Drug Administration, "Safe Minimum Internal Temperatures" chart (145°F + 3-minute rest, whole cuts; 160°F, ground meat)', url: 'https://www.fda.gov/media/107000/download' }
      ]
    },
    inputs: [
      {
        id: 'doneness',
        label: 'Doneness',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Medium-rare (145°F)' },
          { value: 1, label: 'Medium (160°F)' },
          { value: 2, label: 'Well-done (170°F)' }
        ]
      }
    ],
    seo: {
      title: 'Steak Doneness Calculator – Temperature & Pull Chart',
      description: 'Free steak doneness calculator: target temperature by doneness from the Beef Checkoff, plus the pull-temperature range for carryover cooking.',
      faq: [
        { question: 'What temperature is medium-rare steak?', answer: '145°F, per the Beef Checkoff’s own doneness chart — which is also USDA and FDA’s published safe minimum internal temperature for whole cuts of beef.' },
        { question: 'What temperature is medium steak?', answer: '160°F, per the Beef Checkoff. Pull it from the heat around 150–155°F and let it rest 5 to 10 minutes to reach that target.' },
        { question: 'What temperature is well-done steak?', answer: '170°F, per the Beef Checkoff — pull around 160–165°F and rest 5 to 10 minutes.' },
        { question: 'Why do you pull steak off the heat before it hits the target temperature?', answer: 'Carryover cooking: heat already absorbed into the outer layers keeps moving toward the center for several minutes after the steak leaves direct heat, raising the internal temperature further. The Beef Checkoff’s own guidance is to pull 5 to 10°F below target.' },
        { question: 'Is a 145°F steak safe to eat?', answer: 'Yes — 145°F with a 3-minute rest is USDA and FDA’s own published safe minimum internal temperature for whole cuts of beef, pork, veal and lamb (steaks, chops, roasts).' },
        { question: 'Is rare steak safe?', answer: 'The Beef Checkoff’s published doneness chart starts at medium-rare (145°F) and doesn’t list a "rare" figure. A steak served below USDA and FDA’s 145°F minimum for whole cuts is a personal choice, not a food-safety-endorsed doneness level.' }
      ]
    },
    compute(values) {
      const targetTempF = STEAK_TARGET_F[values.doneness];
      return {
        targetTempF,
        pullTempLowF: targetTempF - STEAK_CARRYOVER_F.low,
        pullTempHighF: targetTempF - STEAK_CARRYOVER_F.high,
        restTimeLowMin: STEAK_REST_MIN.low,
        restTimeHighMin: STEAK_REST_MIN.high,
        usdaSafeMinF: USDA_BEEF_MIN_F
      };
    }
  },
  {
    id: 'party-food-calculator',
    category: 'food',
    glyph: 'pty',
    updatedAt: '2026-11-05',
    aliases: ['party food calculator', 'how much food for a party', 'food quantity calculator for a party', 'how much food per person', 'party planning food calculator', 'catering quantity calculator'],
    related: ['recipe-scaling-calculator', 'turkey-cook-time-calculator', 'rice-to-water-ratio-calculator'],
    title: 'Party Food Calculator',
    description: 'How much protein, potatoes, rolls and dessert to plan for a sit-down party meal, by guest count — from The Old Farmer’s Almanac’s own food quantity chart.',
    example: 'For 20 guests at a full sit-down meal, plan on about 10 lb of protein, 6⅔ to 10 lb of potatoes, 40 rolls and 20 dessert slices — per The Old Farmer’s Almanac’s own per-person figures.',
    breakdown: {
      headline: 'proteinLb',
      headlineLabel: 'Protein (beef, pork, chicken, fish or ham)',
      outputs: [
        { id: 'proteinLb', label: 'Protein', format: 'number', dimension: 'mass', unit: 'lb' },
        { id: 'potatoesLbLow', label: 'Potatoes, low', format: 'number', dimension: 'mass', unit: 'lb' },
        { id: 'potatoesLbHigh', label: 'Potatoes, high', format: 'number', dimension: 'mass', unit: 'lb' },
        { id: 'rollsCount', label: 'Rolls', format: 'integer' },
        { id: 'dessertSlices', label: 'Dessert (cake or pie slices)', format: 'integer' }
      ],
      groups: [
        { title: 'Party', inputs: ['guestCount'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'proteinLb', label: 'Protein' },
          { from: 'potatoesLbHigh', label: 'Potatoes (high end)' }
        ],
        title: 'Pounds needed, by category'
      }
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Where these per-person figures come from',
        paragraphs: [
          "The Old Farmer's Almanac publishes its own food quantity chart for planning a party or gathering, with per-person amounts for a full sit-down meal: ½ lb of protein (beef, pork, chicken, fish fillets or ham), ⅓ to ½ lb of potatoes, 2 dinner rolls, and one slice of cake or pie. This calculator multiplies those figures by your guest count.",
          "These are full-meal quantities, not a lighter appetizers-and-snacks spread — the Almanac's own chart doesn't distinguish between the two, and assumes an average dinner-sized serving per person. A cocktail party or an appetizer table needs meaningfully less food per guest than a sit-down dinner does.",
          "The chart also lists burgers and sausage separately, at ⅓ to ½ lb per person — the same range as potatoes and essentially the same figure as the general protein number, just acknowledging that ground and link meats run a little lighter per serving than a solid cut."
        ]
      },
      howTo: {
        intro: 'Enter your guest count — the calculator multiplies it by The Old Farmer’s Almanac’s own per-person figures.',
        steps: [
          { name: 'Enter guest count', text: 'The number of people you’re feeding a full sit-down meal to.' },
          { name: 'Read the protein amount', text: 'At ½ lb per person, covering beef, pork, chicken, fish fillets or ham.' },
          { name: 'Read the potato range', text: 'A ⅓ to ½ lb per person range — plan toward the high end for bigger appetites.' },
          { name: 'Read the rolls and dessert counts', text: '2 rolls and 1 dessert slice per person.' },
          { name: 'Adjust for your crowd', text: 'Scale up for big eaters or a meal with few side dishes; scale down for a lighter gathering or a menu with many other items.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each quantity is the guest count multiplied by The Old Farmer’s Almanac’s own per-person figure for that category.',
        expression: 'protein = guests × 0.5 lb\npotatoes = guests × (⅓ lb to ½ lb)\nrolls = guests × 2\ndessert slices = guests × 1',
        terms: [
          { symbol: 'guests', meaning: 'The number of people at the meal.' },
          { symbol: '0.5 lb, ⅓–½ lb, 2, 1', meaning: 'The Almanac’s own per-person quantities for protein, potatoes, rolls and dessert.' }
        ],
        note: 'These are planning estimates for a typical mixed group of adults at a full meal — not a precise catering order. The Almanac itself notes to adjust for bigger appetites or a higher share of children, without giving an exact multiplier for either.'
      },
      workedExample: {
        intro: '20 guests at a sit-down dinner.',
        rows: [
          { label: 'Guest count', value: '20' },
          { label: 'Protein (20 × 0.5 lb)', value: '10 lb' },
          { label: 'Potatoes (20 × ⅓ lb to 20 × ½ lb)', value: '6⅔ to 10 lb' },
          { label: 'Rolls (20 × 2)', value: '40 rolls' },
          { label: 'Dessert (20 × 1)', value: '20 slices' }
        ],
        result: '10 lb protein, 6⅔–10 lb potatoes, 40 rolls, 20 dessert slices',
        explanation: 'Every figure is the Almanac’s own per-person amount multiplied straight through by the guest count — no rounding beyond the ingredient’s own natural units (whole rolls, whole slices).'
      },
      watchOut: [
        {
          title: 'This is a full-meal guide, not an appetizer party',
          body: 'The Almanac’s chart assumes an average sit-down dinner serving. A cocktail party, open house or appetizers-only gathering needs meaningfully less food per person — these figures will over-estimate badly for that kind of event.'
        },
        {
          title: 'No exact adjustment for kids or big appetites',
          body: 'The Almanac notes to scale up for big eaters and down for children, but doesn’t publish a specific percentage for either — use your own judgment about your particular guest list rather than a formula.'
        },
        {
          title: 'Drinks aren’t included',
          body: 'This calculator covers food only. Non-alcoholic and alcoholic beverages need their own separate planning and aren’t part of the Almanac’s food quantity chart used here.'
        },
        {
          title: 'More side dishes mean less of each one',
          body: 'These figures assume protein, potatoes, rolls and dessert as the core of the meal. Adding several more side dishes to the spread means guests naturally eat somewhat less of any single item.'
        }
      ],
      references: [
        { label: "The Old Farmer's Almanac, \"Party Planner Serving-Size Calculator\" (food quantity chart)", url: 'https://www.almanac.com/party-planner-cooking-crowd' }
      ]
    },
    inputs: [
      { id: 'guestCount', label: 'Guest count', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 }
    ],
    seo: {
      title: 'Party Food Calculator – How Much Food Per Person',
      description: 'Free party food calculator: protein, potatoes, rolls and dessert by guest count, from The Old Farmer’s Almanac’s own food quantity chart.',
      faq: [
        { question: 'How much food do I need per person for a party?', answer: "For a full sit-down meal, The Old Farmer's Almanac's own chart suggests ½ lb of protein, ⅓ to ½ lb of potatoes, 2 rolls and 1 dessert slice per guest." },
        { question: 'How much meat do I need for a party of 20?', answer: '10 lb of protein (beef, pork, chicken, fish or ham), at the Almanac’s ½ lb per person figure — 20 × 0.5 lb = 10 lb.' },
        { question: 'How many dinner rolls per person should I plan?', answer: '2 rolls per person, per the Almanac’s chart — 40 rolls for 20 guests.' },
        { question: 'Does this work for an appetizer-only party?', answer: 'Not well — these are full sit-down meal quantities. A cocktail party or appetizer spread needs noticeably less food per person; the Almanac’s chart doesn’t publish separate lighter-event figures.' },
        { question: 'How much food should I plan for kids at a party?', answer: "The Almanac notes to adjust downward for children but doesn't give an exact fraction — use your own judgment about your guest list rather than a fixed multiplier." },
        { question: 'Does this calculator include drinks?', answer: 'No — it covers food only. Plan beverages separately.' }
      ]
    },
    compute(values) {
      const guestCount = values.guestCount;
      return {
        proteinLb: guestCount * PARTY_FOOD_PER_PERSON.proteinLb,
        potatoesLbLow: guestCount * PARTY_FOOD_PER_PERSON.potatoesLbLow,
        potatoesLbHigh: guestCount * PARTY_FOOD_PER_PERSON.potatoesLbHigh,
        rollsCount: guestCount * PARTY_FOOD_PER_PERSON.rolls,
        dessertSlices: guestCount * PARTY_FOOD_PER_PERSON.dessertSlices
      };
    }
  },
  {
    id: 'yeast-conversion-calculator',
    category: 'food',
    glyph: 'yst',
    updatedAt: '2026-11-05',
    aliases: ['yeast conversion calculator', 'active dry to instant yeast conversion', 'fresh yeast to dry yeast calculator', 'instant yeast to active dry yeast', 'cake yeast conversion calculator', 'how much instant yeast equals active dry'],
    related: ['bakers-percentage-calculator', 'pizza-dough-calculator', 'recipe-scaling-calculator'],
    title: 'Yeast Conversion Calculator',
    description: 'Convert a yeast amount between fresh (cake), active dry and instant yeast, using King Arthur Baking’s own Professional Baker’s Reference weight ratios.',
    example: '30 g of fresh yeast converts to 12 g of active dry yeast or 9.9 g of instant yeast, per King Arthur Baking’s Professional Baker’s Reference.',
    breakdown: {
      headline: 'instantEquivalentG',
      headlineLabel: 'Instant yeast equivalent',
      outputs: [
        { id: 'instantEquivalentG', label: 'Instant yeast', format: 'number', dimension: 'mass', unit: 'g' },
        { id: 'activeDryEquivalentG', label: 'Active dry yeast', format: 'number', dimension: 'mass', unit: 'g' },
        { id: 'freshEquivalentG', label: 'Fresh (cake) yeast', format: 'number', dimension: 'mass', unit: 'g' }
      ],
      groups: [
        { title: 'Yeast', inputs: ['yeastType', 'amount'] }
      ]
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Three forms of yeast, one weight ratio',
        paragraphs: [
          "King Arthur Baking's Professional Baker's Reference gives a precise weight ratio between the three common forms of baker's yeast: active dry yeast is fresh (cake) yeast's weight × 0.4, and instant yeast is fresh yeast's weight × 0.33. This calculator converts whichever amount you enter into the other two forms using that same ratio.",
          "King Arthur's own consumer-facing guidance simplifies this further for active dry and instant specifically: \"substitute instant yeast 1:1 by weight or volume for any active dry yeast called for in your recipe.\" That's a genuinely different number from the precise professional ratio — by the 0.4 / 0.33 figures, instant yeast is about 17.5% lighter than the same recipe's active dry amount, gram for gram. Most home recipes have enough margin that the difference doesn't matter; a professional formula weighed to the gram is where the precise ratio earns its keep.",
          'The two dry forms also differ in how they’re used, not just how much: active dry yeast needs to be hydrated in warm water before going into the dough, while instant yeast can be mixed directly into the flour. King Arthur also notes a timing difference — active dry is a little slower to get a dough rising, so a recipe written for instant may need roughly 15 to 20 extra minutes of rise time if you substitute active dry.'
        ]
      },
      howTo: {
        intro: 'Enter the yeast form you have and the amount — the calculator returns the equivalent amount in the other two forms.',
        steps: [
          { name: 'Choose your yeast form', text: 'Fresh (cake), active dry, or instant.' },
          { name: 'Enter the amount', text: 'In grams, from your recipe or a kitchen scale.' },
          { name: 'Read the other two amounts', text: 'The equivalent weight in each of the other two yeast forms, using King Arthur’s professional ratio.' },
          { name: 'Adjust for hydration if using active dry', text: 'Dissolve it in warm water first, rather than mixing it directly into the flour the way instant yeast allows.' },
          { name: 'Add rise time if substituting active dry for instant', text: 'About 15 to 20 minutes longer for a roughly 1-hour rise, per King Arthur.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every amount is converted through fresh yeast as the common reference point, using King Arthur’s own published weight ratios.',
        expression: 'active dry = fresh × 0.4\ninstant = fresh × 0.33\nfresh = active dry ÷ 0.4 = instant ÷ 0.33',
        terms: [
          { symbol: 'fresh', meaning: 'Fresh (cake) yeast, by weight.' },
          { symbol: '0.4, 0.33', meaning: 'King Arthur Baking’s Professional Baker’s Reference ratios of active dry and instant yeast, respectively, to the same weight of fresh yeast.' }
        ],
        note: 'Fresh yeast is uncommon at most U.S. grocery stores and is highly perishable — active dry and instant are the two forms most home bakers actually choose between.'
      },
      workedExample: {
        intro: '30 g of fresh yeast, converted to the other two forms.',
        rows: [
          { label: 'Fresh yeast', value: '30 g' },
          { label: 'Active dry (30 × 0.4)', value: '12 g' },
          { label: 'Instant (30 × 0.33)', value: '9.9 g' }
        ],
        result: '30 g fresh ≈ 12 g active dry ≈ 9.9 g instant',
        explanation: 'By the precise ratio, that same 12 g of active dry converts to 9.9 g of instant — about 17.5% less by weight — even though King Arthur’s everyday guidance says to simply swap the two 1:1 in most home recipes.'
      },
      watchOut: [
        {
          title: 'The precise ratio and the "1:1" home rule are both real, for different audiences',
          body: 'King Arthur’s professional ratio (0.4 vs. 0.33 relative to fresh) makes instant about 17.5% lighter than active dry, gram for gram. Their own consumer blog still recommends swapping active dry and instant 1:1 by weight or volume in ordinary home baking — the gap is usually within a recipe’s normal tolerance.'
        },
        {
          title: 'Active dry needs to be hydrated first',
          body: 'Dissolve active dry yeast in warm water before adding it to a dough. Instant yeast can go straight into the dry ingredients — no proofing step needed.'
        },
        {
          title: 'Active dry runs slower, not just different in form',
          body: 'King Arthur notes that in a long rise, active dry eventually catches up to instant, but for a roughly 1-hour rise written for instant yeast, expect to add about 15 to 20 minutes if substituting active dry.'
        },
        {
          title: 'This converts yeast form, not recipe-wide baker’s percentage',
          body: 'For scaling an entire formula—flour, water, salt and yeast together by percentage—use the baker’s percentage calculator instead; this page only converts one yeast amount between its three forms.'
        }
      ],
      references: [
        { label: "King Arthur Baking, Professional Baker's Reference, \"Yeast\" (weight ratios: active dry × 0.4, instant × 0.33, relative to fresh)", url: 'https://www.kingarthurbaking.com/pro/reference/yeast' },
        { label: 'King Arthur Baking, "Active dry vs. instant yeast: Why we prefer instant" (1:1 substitution guidance, hydration, rise-time adjustment)', url: 'https://www.kingarthurbaking.com/blog/2022/08/15/active-dry-versus-instant-yeast' }
      ]
    },
    inputs: [
      {
        id: 'yeastType',
        label: 'Yeast form',
        type: 'number',
        placeholder: '1',
        defaultValue: 1,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Fresh (cake) yeast' },
          { value: 1, label: 'Active dry yeast' },
          { value: 2, label: 'Instant yeast' }
        ]
      },
      { id: 'amount', label: 'Amount', type: 'number', placeholder: '7', defaultValue: 7, step: 0.5, min: 0.1, dimension: 'mass', unit: 'g' }
    ],
    seo: {
      title: 'Yeast Conversion Calculator – Fresh, Dry & Instant',
      description: 'Free yeast conversion calculator between fresh (cake), active dry and instant yeast, using King Arthur Baking’s own professional weight ratios.',
      faq: [
        { question: 'How much active dry yeast equals fresh yeast?', answer: 'Multiply the fresh yeast weight by 0.4, per King Arthur Baking’s Professional Baker’s Reference — 30 g of fresh yeast equals about 12 g of active dry.' },
        { question: 'How much instant yeast equals fresh yeast?', answer: 'Multiply the fresh yeast weight by 0.33, per King Arthur Baking — 30 g of fresh yeast equals about 9.9 g of instant yeast.' },
        { question: 'Can I substitute instant yeast for active dry yeast 1:1?', answer: 'Yes, for ordinary home baking — King Arthur Baking’s own guidance is to substitute instant yeast 1:1 by weight or volume for active dry. By the precise professional ratio instant is about 17.5% lighter, a gap most home recipes tolerate fine.' },
        { question: 'Do I need to proof active dry yeast before using it?', answer: 'Dissolving it in warm water first is standard practice, though King Arthur notes modern active dry yeast can also be mixed in dry. Instant yeast never needs this step.' },
        { question: 'Does substituting active dry for instant yeast change the rise time?', answer: 'Yes — King Arthur recommends adding roughly 15 to 20 minutes to a dough’s rise time if you’re using active dry yeast in place of instant for a recipe timed around a 1-hour rise.' },
        { question: 'Why is fresh yeast hard to find?', answer: "It's highly perishable and most U.S. grocery stores don't stock it, which is why active dry and instant — both shelf-stable — are the two forms most home bakers actually choose between." }
      ]
    },
    compute(values) {
      const amount = values.amount;
      let freshEquivalentG: number;
      if (values.yeastType === 0) freshEquivalentG = amount;
      else if (values.yeastType === 1) freshEquivalentG = amount / YEAST_FRESH_TO_ACTIVE_DRY;
      else freshEquivalentG = amount / YEAST_FRESH_TO_INSTANT;
      return {
        freshEquivalentG,
        activeDryEquivalentG: freshEquivalentG * YEAST_FRESH_TO_ACTIVE_DRY,
        instantEquivalentG: freshEquivalentG * YEAST_FRESH_TO_INSTANT
      };
    }
  }
];
