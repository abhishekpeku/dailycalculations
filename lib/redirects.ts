import { calculators, categories } from '@/data/calculators';

/**
 * Old calculator slug → canonical path, derived from each calculator's `redirectFrom`.
 * Deriving it means retiring a redirect is a one-line delete in `data/calculators.ts`
 * — nothing here or in `proxy.ts` needs to change.
 */
export const CALCULATOR_REDIRECTS: Record<string, string> = Object.fromEntries(
  calculators.flatMap((calculator) =>
    (calculator.redirectFrom ?? []).map((from) => [
      `/calculators/${from}`,
      `/calculators/${calculator.id}`
    ])
  )
);

/**
 * Retired category id → canonical path, derived from each category's `redirectFrom`.
 * Calculator URLs are category-independent, so a restructure only ever kills
 * `/categories/<id>` — nothing under `/calculators/`.
 */
export const CATEGORY_REDIRECTS: Record<string, string> = Object.fromEntries(
  categories.flatMap((category) =>
    (category.redirectFrom ?? []).map((from) => [
      `/categories/${from}`,
      `/categories/${category.id}`
    ])
  )
);
