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
    related: ['rice-to-water-ratio-calculator', 'recipe-scaling-calculator', 'pizza-dough-calculator'],
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
  }
];
