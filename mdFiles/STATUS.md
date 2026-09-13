# Development status

**Single source of truth for what is done, what is next, and every decision made.**
Read this first in any new session. Update it at the end of every step.

Spec: `mdFiles/instructions.md` (§ references below point into it).
Protocol: `CLAUDE.md` → "Working protocol".
Step files: `mdFiles/steps/NN-<name>.md`. All Markdown lives in `mdFiles/` — see CLAUDE.md.

Last updated: 2026-09-10 · Current step: **11** (gate, waiting) · Steps done: **11 / 28** · **Phase A complete · Phase D complete**

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
| 05 | Calculator schema + alias data | **DONE** 2026-09-10 | Add `aliases: string[]`, `related: string[]`, `redirectFrom?: string[]` to `CalculatorConfig` (required except `redirectFrom`). Populate all 53 from the cluster tables. **Large mechanical edit — do it in 4 sub-batches by cluster, building after each.** | §1.3, §1.5 |
| 06 | `redirectFrom` 301s | **DONE** 2026-09-10 | Generate 301s in `middleware.ts` from every `redirectFrom` slug to its canonical `/calculators/<id>`. Include `auto-loan-calculator`, `home-loan-calculator`, `house-loan-emi-calculator`, `word-counter`, `bmr-calculator`. | §2.5 |
| 07 | Structured data + breadcrumb | **DONE** 2026-09-10 | Add `WebApplication` (with `alternateName: aliases`), `BreadcrumbList` and `HowTo` JSON-LD to `buildPageJsonLd`. Build a **visible** `Breadcrumb` component — Google cross-checks JSON-LD against rendered markup. | §2.3 |
| 08 | Surface the aliases | **DONE** 2026-09-10 | "Also known as …" sentence under the H1. "Related calculators" block using `related`, with **alias anchor text**, not repeated titles. Extend `fuzzyFilter` in `CalculatorSearch.tsx:19` to match `aliases`. | §1.4 |
| 09 | Listing page search + `?q=` | **DONE** 2026-09-10 | Add category filter chips, the search box, and `?q=` / `?category=` params to `app/[locale]/calculators/page.tsx`. Then either fix or delete the broken `SearchAction` in `buildHomeJsonLd`. Also clean the homepage `keywords` array — drop `graphing calculator`. | §2.7, §4.5, §1.6 |

### Phase C — Content depth (pilot, measure, then roll out)

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 10 | New page template + pilot | **DONE** 2026-09-10 | Rebuild the calculator page: breadcrumb → H1 + aliases → **widget above the fold** → How to use → The formula → Worked example → Watch out for → 6-8 FAQs → Related. Add the content fields to `CalculatorConfig`. **Populate for `date-difference-calculator` only.** | §4.2, §4.3, §5.2 |
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
| 16 | Category restructure 11 → 14 | **DONE** 2026-09-10 | Rename `social`→`creator`. Merge `taxes`→`shopping`. Add `travel`, `text`. (**`math` + `tech` deferred to steps 24 / 25** — they would ship empty; see the session log.) Apply the 9 reassignments (`emi-calculator`→finance, `visa-stay-days`+`travel-budget`+`currency-converter`→travel, counters→text, …). 301 `/categories/taxes`→`/categories/shopping` and `/categories/social`→`/categories/creator`. Calculator URLs do not change. | §1.1, §1.2 |

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
| 24 | `math` category | TODO | **Add the `math` entry to `categories` here** (step 16 deferred it — it would have shipped empty). `percentage-calculator` (highest volume of the lot, and the homepage already claims it with no page behind it), `scientific-calculator`, `fraction-calculator`, `average-calculator`, `ratio-calculator`. | §5.1, §1.5 N |
| 25 | `tech` category | TODO | **Add the `tech` entry to `categories` here** (step 16 deferred it — it would have shipped empty). `ip-subnet-calculator`, `iban-calculator`, `data-storage-converter`, `password-strength-checker`. Build for authority, not ad revenue — this audience blocks ads. | §5.1, §5.4, §1.5 O |
| 26 | `text` + `education` additions | TODO | `word-counter`; `grade-calculator`, `final-grade-calculator`, `weighted-average-calculator`, `study-time-calculator`. Takes `education` from 1 member to 5. | §1.2, §1.5 K/M |

### Phase G — Hygiene

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 27 | Repo hygiene | TODO | `.gitignore` + delete `dev-server.log`, `dev-server.err.log`, `tsconfig.tsbuildinfo`. Regenerate the `README.md` calculator list from `data/calculators.ts`. Fix `mdFiles/memory/project_i18n.md` (it says `proxy.ts` / next-intl 3.26.5; reality is `middleware.ts` / 4.13 / English-only — see session 31, which confirmed `middleware.ts` must stay). | §4.6 |
| 28 | Search Console | TODO | Verify the domain, submit `/sitemap.xml`, request indexing on the top 15 calculators individually, then monitor the metrics table in §7. | §2.8, §7 |
| 29 | IndexNow setup | **DONE** 2026-09-13 | Ran ahead of the queue in response to a Bing Webmaster Tools audit. Key file `public/<key>.txt`, submit script `scripts/indexnow.mjs` (fetches `/sitemap.xml`, POSTs every `<loc>` to `api.indexnow.org/indexnow`), wired into `npm run deploy` and exposed standalone as `npm run indexnow`. No new dependency — uses built-in `fetch`. | — |

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

05 · 2026-09-10 · `aliases: string[]` and `related: string[]` (both **required**) plus
`redirectFrom?: string[]` added to `CalculatorConfig` and populated on all 53 from §1.5. Pure data —
no UI, no rendered output change, and **no `updatedAt` bumped** (all 53 still `2026-09-10`), which is
correct per the step-04 note. Diff is 116 insertions, 0 deletions, one file. Validation passed:
53 calculators, **0 broken `related` ids**, 0 self-references, 0 duplicate entries, every calculator
≥3 aliases and 3-4 related, no `redirectFrom` slug colliding with a real id. Build + lint pass;
still 78 static pages.

06 · 2026-09-10 · New **`lib/redirects.ts`** derives `CALCULATOR_REDIRECTS` (old path → canonical
path) from every calculator's `redirectFrom`; `middleware.ts` spreads it into the existing
`RENAMED_PATHS` map. **Nothing is hand-listed** — retiring a redirect is now a one-line delete in
`data/calculators.ts` and no other file changes. Also restructured the middleware to strip a dead
locale prefix and resolve a rename **in the same pass**, so a URL needing both answers a single 301
instead of chaining; `/en/about-us` went from 2 hops to 1. Verified against a real `next start`:
all 6 slugs 301 to the right canonical, query strings survive, `/en/*` and `/de/*` variants resolve
in one hop, 6 known-good pages still 200, and an unknown slug still 404s. Build + lint pass.

07 · 2026-09-10 · `buildPageJsonLd` now returns **an array of 4 nodes** —
`WebApplication` → `BreadcrumbList` → `HowTo` → `FAQPage` — matching `buildHomeJsonLd`'s shape (each
node carries its own `@context`; the page already `JSON.stringify`s whatever it gets, so the page
change was zero). Two new exports in `lib/seo.ts`, `buildBreadcrumbs(slug)` and
`buildHowToSteps(slug)`, are the **single source** both the JSON-LD and the rendered markup read —
Google cross-checks them and two hand-written copies would drift. New `components/Breadcrumb.tsx`
(server component, `nav[aria-label="Breadcrumb"] > ol`, last crumb `aria-current="page"`) replaces
the bare category eyebrow above the H1. The "How to use" section gained `id="how-to-use"` and a
visible `<ol>` of the same steps the `HowTo` node lists. `updatedAt` deliberately **not** bumped —
markup is not a content change. Verified by parsing all 53 prerendered HTML files: 4 nodes each,
JSON parses, `alternateName` matches `aliases` on all 53, 0 `/en/` in JSON-LD or body, breadcrumb
positions 1-4 with no `item` on the last, HowTo steps 2-9 and every step name visible. Build + lint
pass; still 78 static pages.

08 · 2026-09-10 · Aliases now surface in all four places §1.4 asks for (JSON-LD was already
done in 07). Two new builders in `lib/seo.ts`: `buildAliasSentence(slug)` renders the visible
"Also called a home loan calculator, …" line under the H1 (first 4 aliases, `a`/`an` chosen from
the first one), and `buildRelatedLinks(slug)` returns `{ id, href, anchor, description }[]` where
**`anchor` is an alias of the target, not its title** — picked from `hashSlug(sourceId) %
target.aliases.length`, so the same target is linked under different wording from different pages.
New `components/RelatedCalculators.tsx` renders the block after the FAQ.
`CalculatorSearch.fuzzyFilter` now also matches `aliases` (`SearchItem` gained the field; the
homepage `searchItems` map passes it through). Two strings added to `messages/en.json`
→ `calculator.relatedTitle` / `relatedDescription`. `updatedAt` **not** bumped — template change,
same call as step 07. Verified against all 53 prerendered HTML files: every page has the sentence
and names only real aliases, link count matches `related` length on all 53, **0 dead links, 0
self-links, 0 repeated anchors within a page, 0 `/en/` hrefs**, every anchor is a real alias of its
target, and of the 49 targets linked from more than one page **0 have only one anchor form** —
131 distinct anchor forms across 52 targets. Build + lint pass; still 78 static pages.

09 · 2026-09-10 · `/calculators` gained a search box, category filter chips and working
`?q=` / `?category=` params, so §2.7's `SearchAction` promise is now true. New
**`components/CalculatorBrowser.tsx`** (client) + **`lib/search.ts`** (`matchesQuery`,
`parseListingParams`, `buildListingSearch` — all pure). `CalculatorSearch` now imports the same
predicate instead of its own `fuzzyFilter`, so alias matching cannot drift between the two boxes.
`CalculatorCard`'s prop narrowed to `Pick<CalculatorConfig, 'id'|'title'|'description'|'category'>`
so a client component can render it. Homepage/layout `keywords` cut 19 → 15. **The `SearchAction`
itself needed no code change** — its `urlTemplate` was already correct after step 02; this step made
the target real. `updatedAt` **not** bumped — no calculator data changed. Build + lint pass; still
78 static pages. Verified against the prerendered HTML (53/53 calculator links, 11/11 category
links, 0 `/en/`, canonical unchanged), 27 unit assertions on the pure functions against the real
data, and a live hydrated run on `:3007` in Chrome (`?q=mortgage` → 2, `?q=emi` → 3 incl.
`mortgage-calculator` by alias, `?category=health` → 6, chip + typing + clearing all round-trip the
URL, `history.length` unchanged at 3, no console errors).

10 · 2026-09-10 · **Phase C pilot shipped.** New optional `content?: CalculatorContent` on
`CalculatorConfig` (`howTo` / `formula` / `workedExample` / `watchOut`), populated on
**`date-difference-calculator` only**; its `seo.faq` went **2 → 8**. The template rebuild lands on
all 53 pages: hero compressed out of its `shadow-panel` card (§4.3) so the widget sits above the
fold, `example` moved below the widget, and three new server components —
**`FormulaSection`**, **`WorkedExampleSection`**, **`WatchOutSection`** — render only when `content`
exists. `buildHowToSteps` now returns the hand-written steps when `content` is present and falls
back to the input-derived ones otherwise, so the `HowTo` JSON-LD followed for free (step 07's design
paid off — one function changed, zero JSON-LD edits). Three strings added to `messages/en.json`.
Verified: 78 static pages, 53/53 calculator pages with 4 JSON-LD nodes each, pilot H2 order exactly
§4.2's, **1,379 words** (up from ~150), HowTo JSON-LD == the 5 hand-written steps and all 5 visible
in the `<ol>`, FAQPage 8 entries, 0 content sections leaked onto the other 52, 0 `/en/` hrefs,
canonical unchanged. Build + lint pass.

16 · 2026-09-10 · **Phase D complete.** Categories **11 → 12** (not 14 — see the deferral below).
`social` → **`creator`** ("Creator Tools"), `taxes` merged into **`shopping`** ("Shopping & Tax"), new
**`travel`** and **`text`**. Eleven calculators reassigned (the 9 from §1.2 plus the two YouTube/Instagram
tools that rode the `social` rename). New `redirectFrom?: string[]` on **`CalculatorCategory`** and a new
**`CATEGORY_REDIRECTS`** in `lib/redirects.ts`, built exactly like `CALCULATOR_REDIRECTS` — the two dead
category 301s are **derived, not hand-listed**, so `middleware.ts` gained one spread and nothing else.
Final distribution: finance 8 · health 6 · home 6 · auto 6 · shopping 5 · time 5 · travel 4 · work 4 ·
measurements 4 · creator 2 · text 2 · education 1. Static pages **78 → 79**, sitemap **72 → 73**.
Verified: 12 categories, 0 orphaned `category` values, 0 empty categories, card counts match the target
table on all 12 prerendered pages, all 11 moved calculators still 200 on their unchanged slug with both
the visible breadcrumb **and** the `BreadcrumbList` JSON-LD naming the new category, 0 `/en/` hrefs, and
0 pages still linking `/categories/taxes` or `/categories/social`. Live on `next start -p 3021`:
both dead categories 301 to the right target, query string preserved, `/en/categories/taxes` and
`/de/categories/social` resolve in **one** hop, step-06's calculator 301s and `/about-us` still work,
unknown category still 404s. Build + lint pass.

**Next step needs to know:**

- ⚠ **Only two of §1.2's four new categories were created. `math` and `tech` are deferred to steps
  24 and 25** — the steps that build their calculators. Creating them now would have shipped two
  category pages with an **empty** card grid, prerendered, linked from the homepage and `/calculators`,
  and submitted in `sitemap.xml`. §1.2's own argument for merging `taxes` is that a two-item category
  page is not worth having; a zero-item one is worse, and it would have sat in the index for the whole
  of Phase F. **Steps 24 and 25 must each add their `categories` entry alongside their calculators** —
  their scope rows now say so. End state is still 14.
- **Category 301s are derived from `CalculatorCategory.redirectFrom`, same as the calculator ones.**
  `shopping` carries `['taxes']`, `creator` carries `['social']`. Retiring a category redirect is a
  one-line delete in `data/calculators.ts`; `lib/redirects.ts` and `middleware.ts` need no edit. Do
  **not** hand-list category slugs in the middleware.
- **No `updatedAt` was bumped, and that is correct.** Moving a calculator between category listings
  changes its breadcrumb's middle crumb and nothing else — same call as steps 05, 07, 08 and 09.
  Steps 12-15 still **must** bump it, because those rewrite the page body.
- **The 12-15 batch counts in the step index are now the real ones.** Post-restructure: 12 = finance 8
  + shopping 5 = **13**; 13 = health 6 + measurements 4 = **10**; 14 = auto 6 + home 6 = **12**;
  15 = time 5 + travel 4 + work 4 + creator 2 + text 2 + education 1 = 18 minus the pilot = **17**.
  Sum 52. These match — nothing to re-plan.
- **`categories` is now ordered by member count, not by age.** The homepage grid (`lg:grid-cols-4`)
  and `/calculators` therefore lead with the fat categories and end with `education` at 1. If step 24
  or 26 changes counts, re-sort the array rather than appending.
- **Four category descriptions were rewritten** (`finance`, `shopping`, `time`, `creator`) because each
  named a calculator that left. If a future step moves a calculator, check the description of **both**
  categories — they enumerate members and go stale silently.
- ⚠ **`README.md` is now visibly wrong** — it has a `### Taxes` heading, no Travel/Text sections, and
  files `unit-price-calculator` under Home. Deliberately not patched here: **step 27** regenerates the
  whole list from `data/calculators.ts`. Do not hand-edit it in the meantime.
- **Category and listing pages still emit no JSON-LD and no visible breadcrumb.** Parked since step 07,
  and the reason it was worth waiting is now spent — the names are settled, so this is unblocked
  whenever someone wants it. `components/Breadcrumb.tsx` is generic and drops straight in.
- ⚠ **:3011 is now also occupied**, on top of the known :3000. This environment has several stray
  listeners; probe with `netstat -ano | grep ":<port> "` before picking one. :3021 was free and worked.


- **Step 11 is the measure gate and it is now armed.** Deploy, request indexing on
  `/calculators/date-difference-calculator`, wait 2-3 weeks, then read Search Console. Do **not**
  start 12-15 until it moves. Note the ⚠ below — the deploy still carries the unfixed apex→www gap.
- ⚠ **`updatedAt` on the pilot did not change, and that is correct.** It was already `2026-09-10`
  and the content change happened on `2026-09-10`. Do not read it as a missed bump — the rule from
  step 04 still stands, and steps 12-15 **must** bump it because those pages carry older dates.
- **`content` is optional and must stay optional until 12-15 have run.** Making it required is the
  natural-looking cleanup and it would break the build on 52 calculators. The whole point of the
  step-11 gate is that those 52 are not written yet.
- **`CalculatorClientConfig` is now `Omit<CalculatorConfig, 'compute' | 'content'>`.** The prose is
  server-rendered; keeping it out of the props stops every word crossing the RSC boundary into
  `CalculatorForm`. The page destructures `const { compute, content, ...clientCalculator }`.
  Note this only trims the **flight payload** — `CalculatorForm` imports `findCalculator` from
  `data/calculators` directly, so the whole data module is in the client bundle regardless. Parked.
- **`lib/seo.ts`'s `HowToStep` is now an alias of `CalculatorHowToStep`** from `data/calculators.ts`.
  Data owns the shape so hand-written and derived steps cannot drift; the import direction
  (`lib/seo` → `data`) is unchanged, so there is no cycle. Do not re-declare the type in `lib/seo`.
- **`FaqSection`'s title is now a real `<h2>`** (it was a styled `<span>`, so the FAQ block had no
  heading element at all and the page's H2 sequence had a hole in it). The description became a
  `<p>` and the wrapper a `<div>` inside the `<summary>`. **This also changes the homepage**, which
  uses the same component — same classes, no visual change, one more correct H2. The individual FAQ
  questions are still `<span>`s inside their `<summary>`; promoting them to `<h3>` is parked.
- ⚠ **The `tailwind.config` dead-shade trap from step 09 is real and confirmed in the built CSS.**
  Grepping `.next/static/css/*.css` shows `dark\:text-brand-100` present and
  `dark\:text-brand-300` **absent** — every existing `dark:text-brand-300` in the codebase emits
  nothing. The new components deliberately use `dark:text-brand-100` (`#d9ecff`, defined). **When
  writing new components, only `brand-50 / 100 / 500 / 700` exist.** Still parked as a cleanup.
- **The pilot's worked-example figures were verified against the live widget, not just arithmetic.**
  1 Jan 2024 → 4 Jul 2026 renders 915 / 130.71 / 30.06, matching the hand-written numbers exactly.
  Steps 12-15 should do the same — a worked example that disagrees with the calculator on its own
  page is worse than no worked example.
- **The section shell markup is duplicated five times now** (`page.tsx` how-to,
  `FormulaSection`, `WorkedExampleSection`, `WatchOutSection`, `RelatedCalculators` all repeat
  `rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:…`). Extracting a
  `ContentSection` shell was deliberately not done mid-step. Parked.
- ⚠ **Chrome screenshot capture timed out twice** (`Page.captureScreenshot` after 30s) partway
  through the visual check, while `read_console_messages` kept working and showed **no page errors**
  — only Chrome-extension `message channel closed` noise. The tab was not frozen and the page is
  fine; the capture subsystem is the flaky part. If it recurs, fall back to asserting against the
  prerendered HTML and the built CSS rather than debugging the browser.


- ⚠ **Never read the URL on `/calculators` with `useSearchParams()`.** The page is `force-static`;
  under static rendering Next bails the client tree up to the nearest `<Suspense>` out of the
  prerendered HTML, which would delete all 53 crawlable calculator links from the page Google
  fetches — the exact opposite of what §4.5 asks for. `CalculatorBrowser` therefore renders
  **unfiltered** on first paint and reads `window.location.search` in a mount `useEffect`. Same
  reason it writes the URL with `history.replaceState`, not `router.replace`. If a future step
  "modernizes" this, re-run acceptance check 1 first.
- **Filter state is client-only, so `?q=` and `?category=` serve the same document and the same
  canonical `/calculators`.** No faceted URLs are indexable. The chips are `<button>`s, not links,
  on purpose — do not turn them into `<Link>`s.
- **`lib/search.ts` is now the single matching predicate** for both the homepage box and the listing
  page. Step 16's category rename does not touch it; the chips render from whatever `categories`
  holds, so the restructure needs no change here.
- **`CalculatorBrowser` must never import `data/calculators`.** It takes trimmed props from the
  server page (`id, category, title, description, aliases`). Importing the data module would drag
  53 `compute()` bodies and every FAQ string into the client bundle — the step-06 middleware trap.
  `compute` is a function and does not cross the RSC boundary at all; that is also why
  `CalculatorCard`'s prop type was narrowed.
- **`CalculatorBrowser` reads its strings with `useTranslations('calculators')` rather than taking
  label props** like `CalculatorSearch` does. Deliberate deviation: `resultCount` needs a count at
  render time and a formatter function cannot be passed to a client component (the first build
  failed on exactly that). The layout's `NextIntlClientProvider` already supplies the messages.
- ⚠ **`tailwind.config` only defines brand shades `50 / 100 / 500 / 700`.** `brand-600` was used for
  the active chip and silently emitted no class at all — white text on a white background, caught
  only by looking at a screenshot. **Existing components already reference undefined `brand-200`,
  `brand-300`, `brand-400`, `brand-800`**; those hover/dark styles are quietly dead today. Parked.
- **Three keywords come back later.** `percentage calculator` + `scientific calculator` in step 24,
  `final grade calculator` in step 26 — the arrays in `app/[locale]/layout.tsx` and
  `app/[locale]/page.tsx` are duplicates and must be edited together. `graphing calculator` is gone
  for good (§1.6).
- **Step 10 does not touch `/calculators`.** The listing page and the calculator page template are
  independent; the browser component sits below the category cards and the hero is unchanged.

- **The related block is the site's only calculator-to-calculator linking.** It renders from
  `buildRelatedLinks(slug)`; step 10's template rewrite must keep it and must not re-derive anchors.
  Anchor choice is a pure function of the two ids — keep it pure, the pages are `force-static`.
- **`gpa-calculator` is linked from nowhere** (0 inbound `related` entries) because all four of its
  real siblings are future pages. Step 26 fixes this when it swaps in the §1.5 values — until then
  it is reachable only from the category/listing pages. `tip-calculator`,
  `pregnancy-due-date-calculator` and `timezone-meeting-planner` have exactly 1 inbound link.
- **Anchor text varies per source page, so a target's anchor is not stable across the site.** That
  is deliberate (§1.4). Do not "fix" it by pinning `aliases[0]`.
- **`CalculatorSearch`'s `SearchItem` now requires `aliases`.** Step 09 adds the same component to
  the listing page — pass `aliases` there too or the alias matching silently disappears on that page.

- **Step 07's shared builders are the page template's contract.** `buildBreadcrumbs(slug)` returns
  `{ name, href? }[]` (Home → Calculators → Category → Title, last one `href`-less) and
  `buildHowToSteps(slug)` returns `{ name, text }[]`. **Step 10 must render from these, not
  re-derive them** — and when step 10 adds real hand-written how-to content to `CalculatorConfig`,
  `buildHowToSteps` is the one function to change; the JSON-LD follows for free.
- **`Breadcrumb.href` is `''` for Home, not `'/'`.** JSON-LD needs `${SITE_URL}` with no trailing
  slash (agreeing with `buildCanonical('')` and the sitemap root); the component maps `''` → `/` for
  the `<Link>`. Do not "fix" the empty string.
- **`buildHowToSteps` derives steps from `calculator.inputs` and uses the labels verbatim.**
  Lowercasing them was tried and reverted — it produced `Enter annual interest rate (apr)` and
  `Enter fahrenheit`. Five calculators have **zero** `inputs` (`currency-converter`,
  `character-counter`, `hashtag-counter`, `pomodoro-timer`, `timezone-meeting-planner`) and take a
  generic 2-step fallback; any new custom-component calculator will too.
- ⚠ **The heredoc-eats-backslashes trap is not specific to `middleware.ts`.** A quoted
  `python - <<'PY'` heredoc collapsed `[^'\\]` in a validator regex to `[^'\]` and crashed it.
  Write throwaway scripts to the scratchpad and run them by path.
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
- **The `matcher` regex is escape-fragile.** It must read exactly
  `'/((?!api|_next|_vercel|.*\..*).*)'` — a double backslash in the source. Collapsing it to a single
  backslash silently makes the negative lookahead match every non-empty path, so middleware runs on
  `/` only and every other route 404s while the build still passes. If routes 404 after touching
  `middleware.ts`, check this line first.
- ~~`app/sitemap.ts` still loops `routing.locales` and emits a self-referencing `hreflang`
  alternate.~~ — **done in step 04.** The loops and the `alternates` block are gone (D5).
- `setRequestLocale(locale)` is still on every server page and must stay.
- ⚠️ **Next.js 16 warns that the `middleware` file convention is deprecated in favor of `proxy` —
  do NOT migrate. The file must stay `middleware.ts`.** Session 31 tried the official codemod
  (`middleware.ts` → `proxy.ts`) and it broke `npm run deploy`: per Next.js's own docs, "Proxy
  defaults to using the Node.js runtime. The `runtime` config option is not available in Proxy
  files" — there is no way to force `proxy.ts` back onto the Edge runtime. `@opennextjs/cloudflare`
  hard-refuses Node.js middleware (`useNodeMiddleware()` in its `build.js`) and `npm run deploy`
  exits 1 with "Node.js middleware is not currently supported." Reverted the same session. The
  warning is genuinely cosmetic only as long as the file keeps the old `middleware.ts` name/export —
  build output still labels the route `ƒ Proxy (Middleware)` regardless of which name is used.
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

- **`redirectFrom` exists on exactly four calculators.** `mortgage-calculator`
  (`home-loan-calculator`, `house-loan-emi-calculator`), `car-payment-calculator`
  (`auto-loan-calculator`, `car-loan-calculator`), `tdee-calculator` (`bmr-calculator`),
  `character-counter` (`word-counter`). **Step 06 generates the 301s from this field — do not
  hand-list the slugs in `middleware.ts`.** Add them to the same `RENAMED_PATHS`-style block step 03
  created, so they answer a real 301 and not a 308.
- ⚠️ **Two `redirectFrom` entries are temporary and must be deleted when their page ships:**
  `tdee-calculator → bmr-calculator` dies in **step 23**, `character-counter → word-counter` dies in
  **step 26**. Leaving them in place would 301 the new page to the old one — i.e. the new calculator
  would be unreachable. Both steps must also remove the redirect from `middleware.ts`.
- **Forward references were stripped from `related` and must be restored later.** §1.5's tables
  point at 15 calculators that do not exist yet; shipping those ids would have rendered dead
  internal links in step 08. What to add back, and when:

  | When | Restore to `related` |
  |---|---|
  | Step 23 (`bmr-calculator`) | add `bmr-calculator` to `bmi-calculator`, `calorie-calculator`, `tdee-calculator` |
  | Step 24 (`math`) | add `percentage-calculator` to `salary-raise-calculator`, `discount-calculator`, `cashback-calculator` |
  | Step 26 (`word-counter`) | add `word-counter` to `character-counter`, `hashtag-counter` |
  | Step 26 (`study-time-calculator`) | add `study-time-calculator` to `pomodoro-timer` |
  | Step 25 (`iban-calculator`) | add `iban-calculator` to `currency-converter` |
  | Step 26 | **replace `gpa-calculator`'s whole `related` list** — see next bullet |

- **`gpa-calculator` carries a placeholder `related` list.** All four §1.5 siblings
  (`grade-calculator`, `final-grade-calculator`, `weighted-average-calculator`,
  `percentage-calculator`) are future pages, so it would otherwise have shipped empty. It currently
  has `pomodoro-timer`, `date-difference-calculator`, `character-counter`, `sleep-time-calculator`.
  **Step 26 must swap in the §1.5 values.** This is the only invented `related` data in the file.
- **Field order:** the three new fields sit directly after `updatedAt`, so every object opens
  `id → category → updatedAt → aliases → related → redirectFrom → title`. §1.3 shows them after
  `inputs`; the file's existing placement of `updatedAt` already differs from §1.3, and keeping the
  metadata contiguous gives a stable one-line insertion anchor. Type declaration order matches.
- **Steps 07 and 08 are now unblocked** — `aliases` feeds JSON-LD `alternateName` and the "Also
  known as" line; `related` feeds the related-tools block with alias anchor text.

- **The six live 301s are `/calculators/<old>` → `/calculators/<canonical>`:**
  `home-loan-calculator` + `house-loan-emi-calculator` → `mortgage-calculator`,
  `auto-loan-calculator` + `car-loan-calculator` → `car-payment-calculator`,
  `bmr-calculator` → `tdee-calculator`, `word-counter` → `character-counter`.
- **Steps 23 and 26 now only need to touch `data/calculators.ts`.** Deleting the `redirectFrom`
  entry removes the redirect — `lib/redirects.ts` and `middleware.ts` are derived and need no edit.
  This is the whole reason the map is generated rather than written out.
- **Middleware bundle grew 185,440 → 280,505 bytes raw (81,437 gzipped), +51%,** because importing
  `data/calculators.ts` drags all 53 `compute()` bodies and every FAQ string into the edge bundle
  for a 6-entry map. Accepted against a 3 MB Workers budget. If it ever matters, the fix is a
  build-time codegen step emitting a literal map — see `Parked`.
- ⚠️ **Rewriting `middleware.ts` wholesale is dangerous — the matcher line does not survive a bash
  heredoc.** Even a quoted `<<'TS'` heredoc collapsed `\\` to `\` in the matcher regex, silently
  reproducing the step-02 breakage (every route 404s, build still passes). Prefer a targeted edit
  over rewriting the file, and check that line byte-for-byte afterwards.
- ⚠️ **Something is already listening on :3000** in this environment. `npm run start` fails with
  `EADDRINUSE` and, if you do not read the log, curl silently answers from that other server — which
  looked exactly like the matcher bug and cost a debugging cycle. Verify on a free port
  (`npx next start -p 3007`) and read the server log before trusting any HTTP check.

29 · 2026-09-13 · Ran out of queue order, in response to a Bing Webmaster Tools SEO report
("duplicate titles", "duplicate descriptions", "descriptions too short", "set up IndexNow").
Checked the duplicate-title/description claim against the actual data: **no exact duplicates
exist** across any of the 54 `seo.title` / `seo.description` values or the 12 category
title/description pairs, and every calculator/category page already carries a correct
`buildCanonical` — the flag is almost certainly stale Bing crawl data from before step 02 killed
the `/de` `/fr` `/es` `/it` locale-prefixed pages (those would have been genuine duplicates). No
code fix applies; will clear once Bing recrawls the 301s. **Lengthened 17 `seo.description`
values** that were under ~110 characters (as low as 60) up to the 120–160 char range, verified
accurate against each calculator's actual `inputs`/`compute` before rewriting — no invented
features. **Set up IndexNow**: key file at `public/<key>.txt`, `scripts/indexnow.mjs` (fetches
`/sitemap.xml`, POSTs every `<loc>` to `api.indexnow.org/indexnow`, no new dependency), wired into
`npm run deploy` and exposed standalone as `npm run indexnow`. Manually verified: 73 URLs
submitted, 202 Accepted. **Found and fixed the doubled-title-suffix bug** noted in Parked since
step 03 — confirmed it was still live by inspecting built HTML (`<title>Mortgage Calculator |
Daily Calculations | Daily Calculations</title>`). Root cause: `app/[locale]/layout.tsx`'s
`title.template = '%s | Daily Calculations'` applies once already; `lib/seo.ts`
(`buildCalculatorMetadata`, `buildCategoryMetadata`, including their not-found fallbacks) and
`about`/`contact`/`privacy-policy`/`terms` were also appending `| Daily Calculations` manually.
Dropped the manual suffix in those seven spots so `title` goes through the template exactly once;
kept a separate `fullTitle` (with suffix) for `openGraph`/`twitter`, since the template does not
touch those. **The homepage is the one exception — its title.template does not apply to it**
(verified empirically: a clean `rm -rf .next && npm run build` still renders home's `<title>` with
no suffix at all when the manual one is dropped, while every other page renders correctly with
exactly one). Left `app/[locale]/page.tsx` with its manual full-brand title, matching the original
Parked note which never listed the homepage among the affected pages. Verified via built HTML in
`.next/server/app/en*.html` across home, a calculator, a category, and all four static pages — one
suffix everywhere, zero on none. Build + lint pass (lint's 115 errors are all pre-existing,
confined to the untracked `.open-next/` build-output directory — see step 27).

**Next step needs to know:**

- The homepage title-template quirk is unexplained — worth a look if step 27's metadata-collapse
  cleanup ever revisits `app/[locale]/page.tsx`. Empirically confirmed, cause unknown (possibly a
  Next.js/next-intl interaction specific to the index segment matching its layout's own
  `generateStaticParams` shape). Don't reintroduce the "drop the manual suffix" fix there without
  re-verifying against a clean build.
- The metadata-collapse item in Parked (overlapping OG/Twitter title strings across 4 places) is
  still open — this session only removed the *doubling*, it did not consolidate the duplication of
  the title string itself into one helper.

30 · 2026-09-13 · Continuation of step 29's ad-hoc Bing cleanup, interrupted by a VS Code restart
mid-edit and resumed from the uncommitted working tree. `middleware.ts`'s dead-locale stripping
only ever removed one leading segment; old language-switcher links left crawlable stacked prefixes
like `/fr/it/calculators/x`, which resolved via two chained 301s (one per segment) instead of one —
the exact kind of stale-crawl noise step 29 attributed to Bing's duplicate-title report. Replaced
the single-segment `slice` with `stripDeadLocalePrefixes()`, a loop that strips every leading
`en`/`de`/`fr`/`es`/`it` segment before the rename lookup runs, so a stacked-prefix URL needing
both a strip and a rename still answers a single 301. Verified the matcher regex line survived
byte-for-byte (`'/((?!api|_next|_vercel|.*\\..*).*)'`, double backslash intact — see the step-02/06
warning above). Verified on a clean build + `npx next start -p 3007` (port 3000 was occupied by
another process, per the existing warning): `/fr/it/calculators/mortgage-calculator` → single 301
to `/calculators/mortgage-calculator`; `/de/en/contact-us` → single 301 to `/contact` (strip then
rename in one hop); a lone `/fr/calculators` and plain `/` behave unchanged. Also added `test*` to
`.gitignore` (untracked scratch files from this session's manual curl/port testing). No `STATUS.md`
step was open for this — it rides on step 29's ad-hoc entry rather than the numbered queue.
**Side note from the verification run:** the `npx next start -p 3007` process launched to test this
was never actually killed (the interactive `kill %1` didn't reach it) and lingered holding a lock
on `.open-next`, which surfaced later as an `EPERM` on `npm run deploy`. Fixed by finding the real
Windows PID via `netstat -ano | grep <port>` and `taskkill //F //PID <pid> //T` — `kill %1` inside
Git Bash does not reliably reach a `node.exe` spawned via `npx`, so use `netstat`+`taskkill` to
confirm a test server actually died, not just that the shell job appears to have exited.

31 · 2026-09-13 · Ran the official Next.js codemod (`npx @next/codemod@canary middleware-to-proxy .`)
to clear the "middleware file convention is deprecated" build warning noted since early sessions.
Renamed `middleware.ts` → `proxy.ts` and `export default function middleware` →
`export default function proxy`; verified the matcher regex survived byte-for-byte and a clean
`npm run build` passed with no deprecation warning. **Then `npm run deploy` failed** with
`ERROR Node.js middleware is not currently supported. Consider switching to Edge Middleware.`
Root cause, confirmed against `@opennextjs/cloudflare`'s own source
(`useNodeMiddleware()`/`build.js`) and Next.js's `proxy.js` doc page: **`proxy.ts` always runs on
the Node.js runtime — "The `runtime` config option is not available in Proxy files. Setting the
`runtime` config option in Proxy will throw an error"** — there is no way to force it back onto
Edge. `@opennextjs/cloudflare` refuses to bundle Node.js middleware outright, so the rename is
permanently incompatible with this project's Cloudflare Workers deployment, not just a transitional
warning. **Reverted in the same session**: `git mv proxy.ts middleware.ts`, function renamed back
to `middleware`, `lib/redirects.ts:6`'s comment restored, and every `STATUS.md` note this session
had pointed at `proxy.ts` (steps 19, 27, the matcher-regex warning, the wholesale-rewrite warning,
the 23/26 `redirectFrom` cleanup notes) reverted to `middleware.ts`. Verified: `npm run build` and
`npx opennextjs-cloudflare build` both pass cleanly (the latter reached "OpenNext build complete."
with `.open-next/worker.js` produced — the exact step that failed before the revert).
⚠️ **Decision: `middleware.ts` must not be renamed to `proxy.ts` while deploying via
`@opennextjs/cloudflare`.** The deprecation warning is genuinely cosmetic *only* under the old
name/export — do not "fix" it again without first confirming OpenNext Cloudflare supports Node.js
middleware (or Edge-runtime proxy) upstream. Left `mdFiles/memory/project_i18n.md` untouched —
still step 27's job, still wrong about 5 locales/next-intl 3.x/`LanguageSwitcher`; its claim that
the file is `proxy.ts` is wrong again, for the original reason.

**Next step needs to know:**

- Do not re-attempt the `middleware.ts` → `proxy.ts` migration. See the ⚠️ decision above and the
  updated warning further up this file — check `@opennextjs/cloudflare`'s changelog for Node.js
  middleware / Edge-runtime-proxy support before ever revisiting this.
- The lingering-test-server lesson from session 30 applies here too — this session's own verification
  server was killed via `netstat`+`taskkill` and confirmed via a second `netstat` check before
  finishing, not just `kill`.
- `npm run deploy`'s earlier `EPERM` was the session-30 process leak, unrelated to this rename
  attempt. If `EPERM` on `.open-next` recurs, check for a stray `next start`/`next dev` first.

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
- Decide whether the `[locale]` directory segment is worth keeping at all once English-only settles.
  Keeping it costs nothing and preserves the option to re-add languages; revisit only if it causes
  friction.
- **Middleware edge-bundle diet.** `lib/redirects.ts` imports all of `data/calculators.ts` to build
  a 6-entry redirect map, costing +95 KB raw / ~81 KB gzipped in the middleware bundle (step 06).
  A build-time codegen step emitting a literal map would remove it. Not worth doing until the
  Workers bundle size actually pinches.
- **Category and listing pages still emit no JSON-LD.** `/categories/<id>` and `/calculators` have
  no `BreadcrumbList` and no `ItemList`, and no visible breadcrumb. Deliberately out of scope in
  step 07 (calculator pages only). `components/Breadcrumb.tsx` is generic and would drop straight
  in. ~~Worth doing once the category restructure (step 16) settles the names.~~ **Step 16 is done,
  so this is now unblocked.**
- **`common.tools` has no ICU plural** — `"{count} tools"` renders **"1 tools"** on the `education`
  card. Pre-existing (that category has always had one member) and visible on the homepage,
  `/categories` and `/calculators`. Fix is `{count, plural, one {# tool} other {# tools}}` in
  `messages/en.json`. Found in step 16; not fixed there because it is a copy bug, not a taxonomy one.
  Step 26 takes `education` to 5 members but the bug survives for any future 1-member category.
- `graphing calculator` — dropped from the keywords array in step 09; genuinely hard to build and
  not worth it. Do not resurrect without a reason. (§1.6)
- **Dead Tailwind brand shades.** `tailwind.config` defines `brand` at `50 / 100 / 500 / 700`
  only, but components reference `brand-200`, `brand-300`, `brand-400`, `brand-600` and
  `brand-800` — `CalculatorCard`'s `hover:border-brand-200`, the layout's `dark:text-brand-300`,
  and others. Those classes are never generated, so the styles silently do nothing. Found in
  step 09 when the active filter chip rendered white-on-white. Fix is to either fill in the
  palette or normalize every call site onto the four real shades — a site-wide visual change,
  so not done mid-step.
- Baidu SEO for mainland China. Needs an ICP licence and separate tooling; Cloudflare is unreliable
  behind the GFW. The `CN` region profile is for Chinese speakers elsewhere. (§3.5)
- ~~The four alias stubs return 307~~ — **done in step 03.** They are 301s in `middleware.ts` now
  and the stub page files are deleted.
