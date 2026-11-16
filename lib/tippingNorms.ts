// Tipping norms by country/region, each row sourced from one real, checkable publication — a
// government page, a national tourism board, or (for the US, where no government body publishes a
// customary percentage) a recognized etiquette authority. Countries whose norm could not be
// confirmed from a source like this are deliberately left out rather than guessed at. See
// mdFiles/steps/61-deepen-small-categories.md, "Batch 5 — travel".
//
// `code` is the stable, arbitrary index used as the `CalculatorInput` option value (template §2,
// "Select options are keyed by id or code, never by the lookup value itself") — several rows share
// the same `percent` (0, for "not customary" or "already included by law"), which would collide if
// options were keyed by percent instead.

export type TippingNorm = {
  code: number;
  country: string;
  /** A single representative percent used to compute a suggested tip; 0 where no customary rate applies. */
  percent: number;
  note: string;
  source: { label: string; url: string };
};

export const TIPPING_NORMS: TippingNorm[] = [
  {
    code: 0,
    country: 'United States',
    percent: 17.5,
    note: '15-20% of the pre-tax bill is customary for sit-down restaurant service.',
    source: { label: 'Emily Post Institute, Tipping Etiquette 101', url: 'https://emilypost.com/advice/general-tipping-guide' }
  },
  {
    code: 1,
    country: 'Japan',
    percent: 0,
    note: 'Not customary anywhere — pay only the amount shown on the bill; tipping can cause confusion.',
    source: { label: 'Japan Travel (JNTO), FAQ: Is there a tipping culture in Japan?', url: 'https://www.japan.travel/en/faq/' }
  },
  {
    code: 2,
    country: 'United Kingdom',
    percent: 0,
    note: 'Discretionary, with no customary minimum; UK law (since October 2024) requires any tip given to be passed to workers in full.',
    source: { label: 'UK Parliament, Employment (Allocation of Tips) Act 2023', url: 'https://www.legislation.gov.uk/ukpga/2023/13' }
  },
  {
    code: 3,
    country: 'France',
    percent: 0,
    note: 'Already included by law in the displayed restaurant price ("service compris"); anything extra is a small, voluntary round-up.',
    source: { label: 'Légifrance, Arrêté du 27 mars 1987 (price display, "taxes et service compris")', url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000338985/2021-09-27/' }
  },
  {
    code: 4,
    country: 'Australia',
    percent: 10,
    note: 'Optional — not compulsory, and restaurants do not add a service charge; about 10% at upmarket restaurants for good service is common.',
    source: { label: 'Tourism Australia, Travel tips and Australian currency', url: 'https://www.australia.com/en-us/facts-and-planning/about-australia/useful-tips.html' }
  }
];

export const TIPPING_COUNTRY_OPTIONS = TIPPING_NORMS.map((n) => ({ value: n.code, label: n.country }));
export const TIPPING_NOTE_LABELS = TIPPING_NORMS.map((n) => ({ value: n.code, label: n.note }));

export function tippingPercentForCode(code: number): number {
  return TIPPING_NORMS.find((n) => n.code === code)?.percent ?? 0;
}
