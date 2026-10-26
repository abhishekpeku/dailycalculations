// Shared, cited cooking-ingredient density table (grams per US customary cup, 236.5882365 mL —
// lib/units.ts's `cup` unit). See mdFiles/steps/42-wave-1-conversion.md, "Run 6". Every page that
// shows a gram figure for an ingredient looks it up here by `id`; the figure is never retyped.
//
// Unlike a unit conversion factor, a food's density is not a fixed physical constant — it depends
// on how the ingredient is measured (spooned vs. scooped flour, packed vs. loose brown sugar) and
// varies between sources. Each row is the figure one specific, named primary source gives for its
// own stated method, not an average or a value picked to look round.
export type Ingredient = {
  id: string;
  label: string;
  gramsPerCup: number;
  source: string;
  method?: string;
};

export const INGREDIENT_DENSITIES: Ingredient[] = [
  {
    id: 'flour',
    label: 'All-purpose flour',
    gramsPerCup: 120,
    source: "King Arthur Baking Company, Ingredient Weight Chart",
    method: 'spooned into the cup and leveled'
  },
  // Bread flour is deliberately not its own row: King Arthur's chart lists it at the identical
  // 120 g/cup as all-purpose flour (same method), so a separate row would duplicate `flour`'s
  // gramsPerCup — every row here must have its own distinct value, since the general converter's
  // ingredient picker uses gramsPerCup as each <option>'s value. cups-to-grams-flour's own copy
  // states the bread-flour figure as a sentence instead.
  {
    id: 'sugar',
    label: 'Granulated sugar',
    gramsPerCup: 198,
    source: "King Arthur Baking Company, Ingredient Weight Chart"
  },
  {
    id: 'brownSugar',
    label: 'Brown sugar, packed',
    gramsPerCup: 213,
    source: "King Arthur Baking Company, Ingredient Weight Chart",
    method: 'packed firmly into the cup'
  },
  {
    id: 'powderedSugar',
    label: "Powdered (confectioners') sugar",
    gramsPerCup: 113,
    source: "King Arthur Baking Company, Ingredient Weight Chart",
    method: 'unsifted'
  },
  {
    id: 'butter',
    label: 'Butter',
    // King Arthur's chart lists 113 g for "8 tablespoons (1/2 cup)"; 1 cup is twice that.
    gramsPerCup: 113 * 2,
    source: "King Arthur Baking Company, Ingredient Weight Chart"
  },
  {
    id: 'water',
    label: 'Water',
    // Water is almost exactly 1 g/mL near room temperature, so 1 US cup (236.5882365 mL) weighs
    // about 236.59 g. Used as a sanity-check row, not a baking-reference figure.
    gramsPerCup: 236.5882365,
    source: 'NIST (water density, approximately 1 g/mL near room temperature); exact mL from lib/units.ts'
  },
  {
    id: 'milk',
    label: 'Whole milk',
    gramsPerCup: 244,
    source: 'USDA FoodData Central, SR Legacy #171265, "Milk, whole, 3.25% milkfat, with added vitamin D"'
  },
  {
    id: 'rice',
    label: 'Uncooked long-grain white rice',
    gramsPerCup: 185,
    source: 'USDA FoodData Central #169756, "Rice, white, long-grain, regular, raw, unenriched"'
  },
  {
    id: 'oats',
    label: 'Rolled oats (old-fashioned)',
    gramsPerCup: 89,
    source: "King Arthur Baking Company, Ingredient Weight Chart"
  },
  {
    id: 'cocoaPowder',
    label: 'Unsweetened cocoa powder',
    // King Arthur's chart lists 42 g for "1/2 cup"; 1 cup is twice that.
    gramsPerCup: 42 * 2,
    source: "King Arthur Baking Company, Ingredient Weight Chart"
  },
  {
    id: 'honey',
    label: 'Honey',
    gramsPerCup: 339,
    source: 'USDA FoodData Central #169640, "Honey"'
  }
];

export function findIngredient(id: string): Ingredient {
  const ingredient = INGREDIENT_DENSITIES.find((item) => item.id === id);
  if (!ingredient) throw new Error(`Unknown ingredient id: ${id}`);
  return ingredient;
}

export function gramsPerCup(id: string): number {
  return findIngredient(id).gramsPerCup;
}
