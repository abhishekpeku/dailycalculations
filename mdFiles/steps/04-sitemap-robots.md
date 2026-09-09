# Step 04 — Sitemap + robots rewrite

**Spec:** `mdFiles/instructions.md` §2.4
**Depends on:** 01, 02, 03.
**Blocks:** step 28 (Search Console submission).

## Why

`app/sitemap.ts` has two structural bugs on top of the locale problem step 02 removed:

**Bug 1 — every English entry points at a redirect.** `buildEntry(path)` emitted
`${baseUrl}${path}`, but with `localePrefix: 'always'` that URL 307'd to `/en${path}`. After step 02
the root-level URL is real, so this one resolves itself — but the code still needs rewriting.

**Bug 2 — the hreflang alternates were computed from an already-prefixed path.** The loops called
`buildEntry('/de/calculators/bmi-calculator')`, and `buildEntry` prefixed *again*, producing
`{ en: '/de/calculators/…', de: '/de/de/calculators/…', fr: '/fr/de/calculators/…' }`. Roughly 80%
of the emitted hreflang data was nonsense URLs. All of it is deleted here (D5).

**Bug 3 — `lastModified: new Date()`** claimed all 300+ pages changed on every deploy. Google
discounts sitemaps that do this, which is counterproductive when the goal is getting leaf pages
crawled.

## Do

1. **Add `updatedAt` to `CalculatorConfig`** in `data/calculators.ts`:

   ```ts
   /** ISO date (YYYY-MM-DD) of the last real content change. Not the deploy date. */
   updatedAt: string;
   ```

   Populate all 53 with today's date as the baseline. From here on, whoever edits a calculator's
   copy or formula bumps its `updatedAt`. Steps 12-15 will bump these naturally as content lands.

2. **Rewrite `app/sitemap.ts`** — no locale loops, no `alternates`:

   ```ts
   import { MetadataRoute } from 'next';
   import { calculators, categories } from '@/data/calculators';
   import { SITE_URL } from '@/lib/site';

   const STATIC_PATHS = [
     '', '/calculators', '/categories', '/about',
     '/contact', '/privacy-policy', '/terms', '/suggestions'
   ];

   function entry(
     path: string,
     priority: number,
     lastModified: Date
   ): MetadataRoute.Sitemap[number] {
     return {
       url: `${SITE_URL}${path}`,
       lastModified,
       changeFrequency: 'monthly',
       priority
     };
   }

   export default function sitemap(): MetadataRoute.Sitemap {
     const buildDate = new Date();

     return [
       entry('', 0.6, buildDate),
       ...STATIC_PATHS.filter(Boolean).map((p) => entry(p, 0.5, buildDate)),
       ...calculators.map((c) =>
         entry(`/calculators/${c.id}`, 0.8, new Date(c.updatedAt))
       ),
       ...categories.map((c) => entry(`/categories/${c.id}`, 0.6, buildDate))
     ];
   }
   ```

   **Calculator pages get the highest priority (0.8), above the home page (0.6).** Priority is only
   a weak hint, but combined with the breadcrumbs from step 07 and the internal linking from step 08
   it consistently signals "the leaf pages are the product" — which is the entire goal of Phase B.

3. **`app/robots.ts`** — point at `SITE_URL` (done in step 01; verify). Also add an explicit
   disallow for the API route, which has no business being crawled:

   ```ts
   rules: { userAgent: '*', allow: '/', disallow: '/api/' },
   sitemap: `${SITE_URL}/sitemap.xml`
   ```

## Acceptance

- [ ] `npm run build` passes.
- [ ] `curl -s localhost:3000/sitemap.xml | grep -c "<url>"` returns **~72**
      (1 home + 7 static + 53 calculators + 11 categories). Not ~350.
- [ ] Zero occurrences of `/en/`, `/de/`, `<xhtml:link`, or `hreflang` in the output.
- [ ] Every `<loc>` starts `https://www.dailycalculations.com/`.
- [ ] Calculator entries show `<priority>0.8</priority>`; the home entry shows `0.6`.
- [ ] `<lastmod>` values are **not** all identical — calculator entries carry their own `updatedAt`.
- [ ] `/robots.txt` disallows `/api/` and names the sitemap.
- [ ] Paste the sitemap into a validator (or Search Console's tester in step 28) — zero errors.

## Watch out for

- `new Date(c.updatedAt)` on an invalid string yields `Invalid Date` and Next will throw at build.
  If a calculator is missing `updatedAt`, TypeScript should catch it — make the field **required**,
  not optional.
- Do not add a `changeFrequency` of `daily`. It is untrue and Google ignores obviously inflated values.

## Finish

Update `mdFiles/STATUS.md`: mark 04 `DONE` and **mark Phase A complete**. Log the sitemap entry count
before → after. Note that from here on, every calculator edit should bump its `updatedAt`.
