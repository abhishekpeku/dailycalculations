# Step 02 — English-only migration

**Spec:** Decisions D2, D3, D4 · `mdFiles/instructions.md` §2.6
**Depends on:** step 01 (`lib/site.ts` exists).
**Blocks:** 03, 04.

## Why

`data/calculators.ts` is English-only, but the site serves 5 locales. So `/de/calculators/mortgage-calculator`
is a German menu wrapped around English content — 265 pages that are ~70% identical. Google's
response to a near-duplicate set is to pick one representative URL and suppress the rest, which is
exactly the "it shows my homepage instead of my calculator" symptom.

Removing the four untranslated locales deletes the problem outright instead of papering over it with
hreflang.

## Target URL shape

| Before | After |
|---|---|
| `/en/calculators/bmi-calculator` | `/calculators/bmi-calculator` |
| `/en` | `/` |
| `/de/…`, `/fr/…`, `/es/…`, `/it/…` | gone (301 → English equivalent) |

## Do

1. **`i18n/routing.ts`** — one locale, no prefix:

   ```ts
   export const routing = defineRouting({
     locales: ['en'],
     defaultLocale: 'en',
     localePrefix: 'as-needed',   // single locale ⇒ English serves at the root
     localeCookie: false          // nothing left to switch
   });
   ```

   `localePrefix: 'as-needed'` is deliberate over deleting next-intl: adding `de` later would put it
   at `/de/…` while English stays at the root, with no second migration.

2. **Keep `messages/{de,fr,es,it}.json`** (D4). They are no longer imported — `i18n/request.ts`
   only ever resolves `en` now. Dormant, not deleted.

3. **`components/Header.tsx`** — remove the two `<LanguageSwitcher />` usages (desktop nav and the
   mobile cluster). Leave `components/LanguageSwitcher.tsx` on disk for now; step 19 replaces it
   with a country switcher and can reuse its markup.

4. **`generateStaticParams`** — every page currently maps over `routing.locales`. With one locale
   these collapse. Files: `app/[locale]/layout.tsx`, `page.tsx`, `calculators/page.tsx`,
   `calculators/[slug]/page.tsx`, `categories/page.tsx`, `categories/[category]/page.tsx`, plus the
   static info pages. The `[slug]` one becomes:

   ```ts
   export function generateStaticParams() {
     return calculators.map((c) => ({ locale: 'en', slug: c.id }));
   }
   ```

5. **`app/page.tsx`** — currently `redirect('/en')`. With `as-needed`, the root *is* the English
   home page and this file now conflicts with `app/[locale]/page.tsx`. Delete it. Verify `/`
   renders the home page rather than 404ing.

6. **301s for the old URLs** in `middleware.ts`. Wrap the next-intl middleware:

   ```ts
   const DEAD_LOCALES = ['de', 'fr', 'es', 'it'];

   export default function middleware(req: NextRequest) {
     const { pathname, search } = req.nextUrl;
     const seg = pathname.split('/')[1];

     if (seg === 'en' || DEAD_LOCALES.includes(seg)) {
       const stripped = pathname.slice(seg.length + 1) || '/';
       return NextResponse.redirect(new URL(stripped + search, req.url), 301);
     }
     return intlMiddleware(req);
   }
   ```

   **301, not 307** — these URLs are permanently gone and any accumulated ranking signal should
   transfer. (This is the opposite of the geo banner in step 19, which must never redirect at all.)

7. **Check the middleware `matcher`.** It currently excludes `api`, `_next`, `_vercel` and anything
   with a dot. That still holds — leave it.

## Acceptance

- [ ] `npm run build` passes.
- [ ] `/` renders the home page (not a redirect, not a 404).
- [ ] `/calculators/bmi-calculator` renders.
- [ ] `/en/calculators/bmi-calculator` → **301** → `/calculators/bmi-calculator`.
- [ ] `/de/calculators/bmi-calculator` → **301** → `/calculators/bmi-calculator`.
- [ ] No language switcher in the header, on desktop or mobile.
- [ ] `npm run build` output lists ~70 static pages, not ~350.

## Watch out for

- **`setRequestLocale(locale)` must stay** on every server page. next-intl still requires it for
  `force-static` even with one locale — removing it breaks the static build with a confusing error.
- The `[locale]` folder segment stays. Renaming it is a much larger refactor for no SEO gain; it is
  on the `Parked` list.
- Next.js 16 reports middleware timings as `proxy.ts` in the dev log. That is cosmetic — the file is
  still `middleware.ts`.

## Finish

Update `mdFiles/STATUS.md`: mark 02 `DONE`, log the page-count change (before → after), and note
anything the sitemap rewrite in step 04 needs to know.
