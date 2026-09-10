import { calculators } from '@/data/calculators';

/**
 * Old calculator slug → canonical path, derived from each calculator's `redirectFrom`.
 * Deriving it means retiring a redirect is a one-line delete in `data/calculators.ts`
 * — nothing here or in `middleware.ts` needs to change.
 */
export const CALCULATOR_REDIRECTS: Record<string, string> = Object.fromEntries(
  calculators.flatMap((calculator) =>
    (calculator.redirectFrom ?? []).map((from) => [
      `/calculators/${from}`,
      `/calculators/${calculator.id}`
    ])
  )
);
