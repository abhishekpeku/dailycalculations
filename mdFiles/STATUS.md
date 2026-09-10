# Development status

**Single source of truth for what is done, what is next, and every decision made.**
Read this first in any new session. Update it at the end of every step.

Spec: `mdFiles/instructions.md` (§ references below point into it).
Protocol: `CLAUDE.md` → "Working protocol".
Step files: `mdFiles/steps/NN-<name>.md`. All Markdown lives in `mdFiles/` — see CLAUDE.md.

Last updated: 2026-09-10 · Current step: **05** · Steps done: **4 / 28** · **Phase A complete**

---

## Decisions already made — do not re-litigate

| # | Decision | Detail |
|---|---|---|
| D1 | **Canonical domain is `https://www.dailycalculations.com`** | Both `www.` and the apex resolve. `www` wins because `sitemap.ts` / `robots.ts` already submit it. Apex 301s → `www`. The `dailycalculations.app` value in `lib/seo.ts:5` is stale and gets deleted. |
| D2 | **The site is English-only.** | `de`, `fr`, `es`, `it` are removed from routing. This kills the 265-page duplicate set (§2.6) — the largest single ranking blocker — rather than working around it. |
| D3 | **English lives at the root, not `/en/`.** | `localePrefix: 'as-needed'` with one locale ⇒ `/calculators/bmi-calculator`. Shorter, keyword-proximate, no redirect hop. Requires 301s `/en/*` → `/*`. |
| D4 | **`next-intl` stays.** | It still serves UI strings from `messages/en.json` and keeps the door open for languages later. `messages/{de,fr,es,it}.json` stay in the repo, dormant and unimported — do not delete them. |
| D5 | **No hreflang, no `x-default`, no translation phase.** | Consequence of D2. Canonicals become a plain `SITE_URL + path`. Sitemap shrinks ~300 entries → ~70. |
| D6 | **Country is a cookie, never a URL.** | 9 region profiles change currency, units, tax labels and date formats. Zero new indexable URLs. Detection via Cloudflare `cf-ipcountry`, cookie-first, **never a redirect** (§3.2–3.4). |
| D7 | **Region codes** | `US` · `GB` · `EU` · `IN` · `AE` · `TH` · `ID` · `CN` · `AU`. **The UK is `GB` — not `EG`, which is Egypt.** `EU` is an internal profile key, not a `cf-ipcountry` value: map each European country code onto the `EU` profile plus its own VAT/currency override. |
| D8 | **Skip all "what is my IP" style queries.** | Zero-click (Google answers inline), flat trend, poor ad RPM, dilutes topical focus. `ip-subnet-calculator` is still built — it is a real calculation (§5.4). |

---

## Step index

Status values: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED` · `PARKED`

### Phase A — Foundation (correctness; nothing else works until these land) — **COMPLETE** 2026-09-10

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 01 | Domain + `lib/site.ts` | **DONE** 2026-09-10 | Create `lib/site.ts` exporting `SITE_URL`. Replace the hardcoded domain in `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts` and every `generateMetadata`. Add the Cloudflare apex→www redirect rule. | §0, D1 |
| 02 | English-only migration | **DONE** 2026-09-10 | `routing.locales = ['en']`, `localePrefix: 'as-needed'`. Delete `LanguageSwitcher` from `Header`. Update every `generateStaticParams` to drop the locale loop. Add 301s `/en/*` → `/*` in `middleware.ts`. Verify `app/page.tsx` no longer needs its `redirect('/en')`. | D2, D3, D4 |
| 03 | Canonicals on every page | **DONE** 2026-09-10 | `buildCanonical(path)` in `lib/seo.ts`. Apply to **every** `generateMetadata` — including `calculators/[slug]` and `categories/[category]`, which currently have none. Remove the locale-blind canonicals in `about`/`contact`/`privacy-policy`/`terms` and the bare-root one on the homepage. | §2.1, D5 |
| 04 | Sitemap + robots rewrite | **DONE** 2026-09-10 | Add `updatedAt: string` to `CalculatorConfig` and populate all 53. Rewrite `app/sitemap.ts`: one entry per path, no locale loops, real `lastModified`, `priority` 0.8 for calculators / 0.6 home / 0.5 rest. Point `robots.ts` at `SITE_URL`. | §2.4 |

### Phase B — Deep-link ranking (make Google surface the calculator, not the homepage)

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 05 | Calculator schema + alias data | TODO | Add `aliases: string[]`, `related: string[]`, `redirectFrom?: string[]` to `CalculatorConfig` (required except `redirectFrom`). Populate all 53 from the cluster tables. **Large mechanical edit — do it in 4 sub-batches by cluster, building after each.** | §1.3, §1.5 |
| 06 | `redirectFrom` 301s | TODO | Generate 301s in `middleware.ts` from every `redirectFrom` slug to its canonical `/calculators/<id>`. Include `auto-loan-calculator`, `home-loan-calculator`, `house-loan-emi-calculator`, `word-counter`, `bmr-calculator`. | §2.5 |
| 07 | Structured data + breadcrumb | TODO | Add `WebApplication` (with `alternateName: aliases`), `BreadcrumbList` and `HowTo` JSON-LD to `buildPageJsonLd`. Build a **visible** `Breadcrumb` component — Google cross-checks JSON-LD against rendered markup. | §2.3 |
| 08 | Surface the aliases | TODO | "Also known as …" sentence under the H1. "Related calculators" block using `related`, with **alias anchor text**, not repeated titles. Extend `fuzzyFilter` in `CalculatorSearch.tsx:19` to match `aliases`. | §1.4 |
| 09 | Listing page search + `?q=` | TODO | Add category filter chips, the search box, and `?q=` / `?category=` params to `app/[locale]/calculators/page.tsx`. Then either fix or delete the broken `SearchAction` in `buildHomeJsonLd`. Also clean the homepage `keywords` array — drop `graphing calculator`. | §2.7, §4.5, §1.6 |

### Phase C — Content depth (pilot, measure, then roll out)

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 10 | New page template + pilot | TODO | Rebuild the calculator page: breadcrumb → H1 + aliases → **widget above the fold** → How to use → The formula → Worked example → Watch out for → 6-8 FAQs → Related. Add the content fields to `CalculatorConfig`. **Populate for `date-difference-calculator` only.** | §4.2, §4.3, §5.2 |
| 11 | **MEASURE GATE** — no code | TODO | Deploy, request indexing on the pilot page, wait 2-3 weeks. Check Search Console position/impressions for `date-difference-calculator`. **If it does not move, stop and re-diagnose before spending effort on 52 more pages.** | §5.2, §7 |
| 12 | Content rollout: finance + shopping | TODO | 13 calculators (finance 8 + shopping 5). Run **after** step 16. | §4.2 |
| 13 | Content rollout: health + measurements | TODO | 10 calculators (health 6 + measurements 4). | §4.2 |
| 14 | Content rollout: auto + home | TODO | 12 calculators (auto 6 + home 6). | §4.2 |
| 15 | Content rollout: time, travel, work, creator, text, education | TODO | 17 calculators (time 5 + travel 4 + work 4 + creator 2 + text 2 + education 1 = 18, **minus `date-difference-calculator`** already done as the step-10 pilot). | §4.2 |

Batches 12-15 sum to **52** = all 53 minus the pilot. Counts are post-restructure (step 16), which
is why 12-15 run after it.

### Phase D — Categories

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 16 | Category restructure 11 → 14 | TODO | Rename `social`→`creator`. Merge `taxes`→`shopping`. Add `travel`, `text`, `math`, `tech`. Apply the 9 reassignments (`emi-calculator`→finance, `visa-stay-days`+`travel-budget`+`currency-converter`→travel, counters→text, …). 301 `/categories/taxes`→`/categories/shopping` and `/categories/social`→`/categories/creator`. Calculator URLs do not change. | §1.1, §1.2 |

### Phase E — Country / region layer

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 17 | Compute snapshot tests | TODO | Pure-function tests over all 53 `compute()` functions. **Must land before step 18** — that refactor changes every calculator's output formatting and is exactly where a silent regression hides. | §4.6 |
| 18 | `lib/regions.ts` + provider | TODO | All 9 profiles with the §3.5 field values. `RegionProvider` mirroring `ThemeProvider`'s cookie-hydration shape. Refactor `lib/calculator.ts` formatters to take a `Region` instead of hardcoded `en-US`/`USD`. | §3.3 s1+s4, §3.5 |
| 19 | Geo detection + switcher | TODO | `cf-ipcountry` read in `middleware.ts`, **only when the cookie is absent**. Country switcher replacing `LanguageSwitcher`. Dismissible suggestion banner — **never a redirect**. | §3.3 s2/s3/s7, §3.4 |
| 20 | Region wave 1: US · GB · IN · AE · AU | TODO | UK stone + **imperial-gallon** MPG (4.546 L — a US-gallon MPG is wrong by 20%). India lakh/crore grouping, CGPA-10, "EMI" wording. **UAE: no personal income tax** — changes the paycheck calculator. AU superannuation + GST. | §3.5 |
| 21 | Region wave 2: EU · TH · ID · CN | TODO | EU profile + DE/FR/ES/IT VAT overrides, comma decimal separator, L/100km, VAT-removal mode on the sales tax calculator. **TH Buddhist-era years** (2026 CE = 2569 BE — a Gregorian-only field gives a silent 543-year error). ID zero decimals. CN YMD dates. | §3.5 |
| 22 | Live FX rates via KV | TODO | Replace the 30 static rates in `CurrencyConverter.tsx:5-11` with a daily KV-cached fetch. Show "Rates updated <date>". If they stay static, say so on the page. | §3.3 s8 |

### Phase F — New calculators (~70 total when done)

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 23 | `bmr-calculator` | TODO | Cheapest win — the formula already exists inside `tdee-calculator`. Mifflin-St Jeor + Harris-Benedict side by side. Cross-link with TDEE. | §5.1 |
| 24 | `math` category | TODO | `percentage-calculator` (highest volume of the lot, and the homepage already claims it with no page behind it), `scientific-calculator`, `fraction-calculator`, `average-calculator`, `ratio-calculator`. | §5.1, §1.5 N |
| 25 | `tech` category | TODO | `ip-subnet-calculator`, `iban-calculator`, `data-storage-converter`, `password-strength-checker`. Build for authority, not ad revenue — this audience blocks ads. | §5.1, §5.4, §1.5 O |
| 26 | `text` + `education` additions | TODO | `word-counter`; `grade-calculator`, `final-grade-calculator`, `weighted-average-calculator`, `study-time-calculator`. Takes `education` from 1 member to 5. | §1.2, §1.5 K/M |

### Phase G — Hygiene

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 27 | Repo hygiene | TODO | `.gitignore` + delete `dev-server.log`, `dev-server.err.log`, `tsconfig.tsbuildinfo`. Regenerate the `README.md` calculator list from `data/calculators.ts`. Fix `mdFiles/memory/project_i18n.md` (it says `proxy.ts` / next-intl 3.26.5; reality is `middleware.ts` / 4.13 / English-only). | §4.6 |
| 28 | Search Console | TODO | Verify the domain, submit `/sitemap.xml`, request indexing on the top 15 calculators individually, then monitor the metrics table in §7. | §2.8, §7 |

---

## Order rules — these matter

- **01 → 04 are strictly sequential.** Everything downstream depends on `SITE_URL` and the routing shape.
- **11 is a hard gate.** Do not start 12-15 until the pilot has been measured. That is 52 pages of
  content work riding on an unvalidated diagnosis.
- **Run 16 during the step-11 wait, before 12-15.** The rollout batches are grouped by the *new*
  category names (`travel`, `text`, `creator`), and writing content into categories that are about
  to be renamed means touching the same 52 files twice. Step 16 only depends on 04, and step 11 is
  a 2-3 week wait with no coding in it — so the restructure fits neatly inside that gap.
- **17 must precede 18.** Tests before the formatting refactor, not after.
- **05 before 07 and 08.** They consume `aliases` / `related`.
- Phases E, F and G are independent of C — if content writing stalls, region work can proceed.

---

## Session log

Append one line per completed step: `NN · YYYY-MM-DD · what changed · anything the next step needs`.

01 · 2026-09-10 · Created `lib/site.ts` (`SITE_URL`, `SITE_NAME`). `lib/seo.ts` now re-exports
`siteName`/`siteUrl` from it — those aliases are temporary and step 03 removes them. `app/sitemap.ts`
and `app/robots.ts` import `SITE_URL`. The stale `https://dailycalculations.app` string is gone from
the repo; the only literal domain left is `lib/site.ts:2`. Build + lint pass.

02 · 2026-09-10 · English-only. `routing.locales = ['en']`, `localePrefix: 'as-needed'`,
`localeCookie: false`. `middleware.ts` now wraps the next-intl middleware and 301s `/en/*` and
`/{de,fr,es,it}/*` to the unprefixed path (query string preserved). Deleted `app/page.tsx` (the old
`redirect('/en')`). Every `generateStaticParams` returns a single `en` entry. `LanguageSwitcher`
removed from `Header` (the component file stays on disk for step 19). Build went from **~350 static
pages to 82**; the sitemap from ~360 `<loc>` entries to **72**. Build + lint pass.

03 · 2026-09-10 · `buildCanonical(path)` in `lib/seo.ts` is now the only place a canonical is
built. It lives inside `buildCalculatorMetadata` / `buildCategoryMetadata`, so **every future
calculator and category gets a canonical for free** — do not add one at the page level for those two.
Added `generateMetadata` to `/calculators`, `/categories` and `/suggestions` (they had none and were
inheriting the homepage title from the layout). The `siteName` / `siteUrl` aliases in `lib/seo.ts`
are gone; call sites import `SITE_NAME` / `SITE_URL` from `lib/site` directly. Verified: 72 pages,
72 unique canonicals, exactly one per page, none containing `/en/` or `dailycalculations.app`, no
hreflang anywhere. Build + lint pass.

04 · 2026-09-10 · **Phase A complete.** `updatedAt: string` (required) added to `CalculatorConfig`
and populated on all 53 with the `2026-09-10` baseline. `app/sitemap.ts` rewritten flat — no locale
loops, no `alternates`/hreflang, `changeFrequency: 'monthly'`, priority **0.8 calculators / 0.6 home
+ categories / 0.5 the other 7 static pages**. `robots.ts` now also `Disallow: /api/`. Sitemap entry
count: **~360 (pre-step-02) → 72 (step 02) → 72 now**, but the 72 are no longer redirect targets and
the ~80% garbage hreflang alternates are gone. Verified: 72 `<url>`, 72 unique `<loc>`, 0 containing
`/en/` `/de/` `/fr/` `/es/` `/it/`, 0 `hreflang`/`xhtml:link`, every `<loc>` on
`https://www.dailycalculations.com`, XML tag-balanced with all dates and URLs parseable. Build + lint
pass.

**Next step needs to know:**

- **Every calculator edit must bump its `updatedAt`.** It is the sitemap's `<lastmod>` — the whole
  point of step 04 was to stop claiming all 53 pages changed on every deploy. Steps 12-15 (content
  rollout) should bump it on each page they touch; step 05 (alias data) should **not** — adding
  `aliases`/`related` is not a content change the crawler needs to re-fetch for. Step 10's pilot
  rewrite of `date-difference-calculator` **should** bump it.
- `updatedAt` sits between `category` and `title` in each object literal. Step 05 adds three more
  fields to the same type — keep the object key order matching the type declaration order.
- `new Date('2026-09-10')` parses as **UTC midnight**, so calculator `<lastmod>` values render
  `2026-09-10T00:00:00.000Z` while home/category/static entries carry the build timestamp. That
  difference is intended and is what makes the sitemap look honest.
- Home stays at `${SITE_URL}` with **no trailing slash**, matching `buildCanonical('')` from step 03.
  They must keep agreeing.
- Full sitemap validation against Search Console's tester is **step 28**, not done here. A structural
  parse (tag balance, `new URL()` on every `<loc>`, `Date.parse()` on every `<lastmod>`, no
  unescaped XML characters) passed locally.

- **Cards passed `locale={locale}` to next-intl's `<Link>`, which force-prefixes the URL.** Under
  `as-needed` that emitted `/en/calculators/...` in the rendered HTML — every internal link pointing
  at a 301. The `locale` prop is gone from `CalculatorCard`, `CategoryCard`, `CategoryGrid` and the
  category `<Link>` in `calculators/[slug]`. **Never pass an explicit `locale` to `<Link>`** — it is a
  locale *switch*, not a hint. Verified: 0 `/en/` hrefs on home, `/calculators`, `/categories`,
  a calculator page and a category page.
- **The middleware `matcher` regex is escape-fragile.** It must read exactly
  `'/((?!api|_next|_vercel|.*\..*).*)'` — a double backslash in the source. Collapsing it to a single
  backslash silently makes the negative lookahead match every non-empty path, so middleware runs on
  `/` only and every other route 404s while the build still passes. If routes 404 after touching
  `middleware.ts`, check this line first.
- ~~`app/sitemap.ts` still loops `routing.locales` and emits a self-referencing `hreflang`
  alternate.~~ — **done in step 04.** The loops and the `alternates` block are gone (D5).
- `setRequestLocale(locale)` is still on every server page and must stay.
- Next.js 16 warns that the `middleware` file convention is deprecated in favor of `proxy`, and
  labels it `ƒ Proxy (Middleware)` in the build output. Cosmetic; the file is still `middleware.ts`.
- ⚠️ **PENDING ON THE USER — not code:** the Cloudflare apex→www 301 redirect rule from step 01 is
  **still not created.** See "Pending on the user" below.
- **The four alias stubs are gone.** `app/[locale]/{about-us,contact-us,privacy,terms-and-conditions}/`
  were deleted in step 03 and replaced by a `RENAMED_PATHS` map in `middleware.ts` that answers a real
  **301**. Deviation from the step-03 file, which said to use `permanentRedirect()` — that emits
  **308**, not the 301 the acceptance check asked for. Step 06 adds its `redirectFrom` 301s to the
  same block. Static page count: 82 → **78**.
- **The homepage canonical has no trailing slash** (`https://www.dailycalculations.com`), because
  `buildCanonical('')` concatenates. `app/sitemap.ts` builds the root the same way — verified still
  agreeing after the step-04 rewrite.

---

## Pending on the user — not code

- **Cloudflare apex → www 301 (from step 01, still open).**
  Cloudflare dashboard → the `dailycalculations.com` zone → **Rules → Redirect Rules** → new rule:
  *If hostname equals `dailycalculations.com` → Static redirect to `https://www.dailycalculations.com`,
  preserve path and query string, status **301**.*
  Do not attempt this in `next.config.ts` — those redirects run inside the Worker, after the request
  has already been served on the wrong hostname.

---

## Parked

Things noticed but deliberately out of scope. Add here instead of fixing mid-step.

- `app/[locale]/layout.tsx` exports static `metadata` *and* pages export `generateMetadata` with
  overlapping OG/Twitter blocks — the same title string lives in four places. Collapse into
  `lib/seo.ts` helpers. (§4.6)
- **Every title is suffixed twice**: `<title>BMI Calculator | Daily Calculations | Daily Calculations</title>`.
  The layout sets `title.template = '%s | Daily Calculations'` *and* the page builders append
  `| ${SITE_NAME}` themselves. Affects all 53 calculators, all 11 categories, and
  `about`/`contact`/`privacy-policy`/`terms` — 68 pages. The fix is to drop the manual suffix and let
  the template do it (the three `generateMetadata` blocks added in step 03 already do). Found during
  step 03, deliberately not fixed there: it is a title change on 68 pages, not a canonical change.
  Fold it into the metadata-collapse item above.
- Decide whether the `[locale]` directory segment is worth keeping at all once English-only settles.
  Keeping it costs nothing and preserves the option to re-add languages; revisit only if it causes
  friction.
- `graphing calculator` — dropped from the keywords array in step 09; genuinely hard to build and
  not worth it. Do not resurrect without a reason. (§1.6)
- Baidu SEO for mainland China. Needs an ICP licence and separate tooling; Cloudflare is unreliable
  behind the GFW. The `CN` region profile is for Chinese speakers elsewhere. (§3.5)
- ~~The four alias stubs return 307~~ — **done in step 03.** They are 301s in `middleware.ts` now
  and the stub page files are deleted.
