# Step 03 — Canonical URLs on every page

**Spec:** `mdFiles/instructions.md` §2.1 · Decision D5
**Depends on:** 01 (`SITE_URL`), 02 (root-level URLs).
**Blocks:** 04.

## Why

Current state, all of it wrong:

| Page | Canonical today | Problem |
|---|---|---|
| `app/[locale]/page.tsx:60` | `siteUrl` (bare root) | Every locale claimed the same root URL |
| `about`, `contact`, `privacy-policy`, `terms` | `${siteUrl}/about` etc. | Locale-blind, and pointed at URLs that 307'd |
| `calculators/[slug]` | **none** | 53 pages with no canonical at all |
| `categories/[category]` | **none** | 11 pages with no canonical at all |

After step 02 the locale dimension is gone, so this becomes simple: every page self-canonicalises to
its own path. No hreflang, no `x-default` (D5).

## Do

1. **Add to `lib/seo.ts`:**

   ```ts
   import { SITE_URL } from '@/lib/site';

   /** Canonical URL for a root-relative path. Pass '' for the home page. */
   export function buildCanonical(path: string) {
     return { canonical: `${SITE_URL}${path}` };
   }
   ```

2. **Remove the `siteUrl` alias** added in step 01 and update the call sites to import `SITE_URL`
   from `lib/site` directly.

3. **Apply to every page.** Pages that already have a canonical — replace it. Pages that have none —
   add `alternates` to the returned `Metadata`:

   | File | `alternates` |
   |---|---|
   | `app/[locale]/page.tsx` | `buildCanonical('')` |
   | `app/[locale]/calculators/page.tsx` | `buildCanonical('/calculators')` — **needs a `generateMetadata`; it has none today** |
   | `app/[locale]/calculators/[slug]/page.tsx` | `buildCanonical(\`/calculators/${slug}\`)` — add inside `buildCalculatorMetadata` |
   | `app/[locale]/categories/page.tsx` | `buildCanonical('/categories')` |
   | `app/[locale]/categories/[category]/page.tsx` | `buildCanonical(\`/categories/${id}\`)` — add inside `buildCategoryMetadata` |
   | `about` · `contact` · `privacy-policy` · `terms` | `buildCanonical('/about')` etc. |
   | `suggestions` | `buildCanonical('/suggestions')` |

   Putting it inside `buildCalculatorMetadata` / `buildCategoryMetadata` means every future
   calculator gets a canonical for free. That is the point — do not add it at the page level for
   those two.

4. **The redirect-only pages** (`about-us`, `contact-us`, `privacy`, `terms-and-conditions`) need no
   canonical. They 307 and render nothing. Leave them.

   One improvement while here: make them **301** rather than 307. They are permanent aliases.
   `redirect(url, RedirectType.replace)` still emits 307 — use
   `permanentRedirect()` from `next/navigation` instead.

5. **`openGraph.url`** on the home page and layout should use the same canonical value, not a bare
   `SITE_URL`, once paths differ.

## Acceptance

- [ ] `npm run build` passes.
- [ ] Every one of these returns exactly one `<link rel="canonical">` pointing at its own URL:
      `/`, `/calculators`, `/calculators/bmi-calculator`, `/categories`, `/categories/finance`,
      `/about`, `/contact`, `/privacy-policy`, `/terms`, `/suggestions`.
- [ ] No canonical anywhere contains `/en/` or `dailycalculations.app`.
- [ ] `/about-us` → **301** → `/about`.
- [ ] Spot-check: `curl -s localhost:3000/calculators/bmi-calculator | grep -i canonical`

## Do NOT

- No `alternates.languages`. There is one language (D5). Emitting a self-referential hreflang set
  for a single locale is noise.
- Do not add `metadataBase` changes — it is already set in the layout and now resolves off
  `SITE_URL`.

## Finish

Update `mdFiles/STATUS.md`: mark 03 `DONE`. Note in the session log that canonicals now come from
`buildCalculatorMetadata` / `buildCategoryMetadata`, so new calculators inherit them automatically.
