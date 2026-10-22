# Development status

**Single source of truth for what is done, what is next, and every decision made.**
Read this first in any new session. Update it at the end of every step.

Spec: `mdFiles/instructions.md` (§ references below point into it).
Protocol: `CLAUDE.md` → "Working protocol".
Step files: `mdFiles/steps/NN-<name>.md`. All Markdown lives in `mdFiles/` — see CLAUDE.md.

Last updated: 2026-10-22 · Current step: **40** (Wave 1: math · statistics · conversion — NEW calculators), **IN PROGRESS** (run 5/~6 done: run 1 — math category + percentage, percent-change, percent-difference, fraction, ratio (PR #15 ready for review); run 2 — average, weighted average, rounding, scientific notation, exponent (PR #16 ready for review); run 3 — square root, cube root, logarithm, factorial, GCF (PR #17 ready for review); run 4 — LCM, prime factorization, long division, quadratic formula, Pythagorean theorem (PR #18 ready for review); run 5 — triangle, circle, area, volume, surface area (PR #19 ready for review)) · step 39 **DONE** 2026-10-21 (Batch 5, all 18: time, travel, work, creator, text, education; PR #14 ready for review) · step 38 done (PR #13, ready for review) · steps 17 + 30–39 done (snapshot tests, units v2, solver v2, visuals kit, type-B widget, data split, batches 1–5) · **v2 template merged** (`f17b7de`) · Rollout plan: `mdFiles/calculator-rollout-plan.md`

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
| D9 | **v2 template is the page format for every calculator.** (2026-10-12) | Approved by the user on the `force-calculator` preview. Spec: `mdFiles/calculator-template-v2.md`. Widget types A (auto-solve) / B (breakdown) / C (custom) per `mdFiles/calculator-rollout-plan.md`. |
| D10 | **Go broad like Omni, in sector waves.** (2026-10-12) | `mdFiles/omni-strategy.md` §4. Each sector opens with ≥ 25 calculators. |
| D11 | **One agent at a time; the main session merges; no deploys until the rollout is done.** (2026-10-12, workflow changed 2026-10-13) | Only **one background agent runs at a time**. Nothing runs in parallel, and batches go strictly in sequence. The agent pushes a branch and opens a PR. When the PR passes (build, lint, `npm test`), the **main session merges it without asking the user**, then starts the next agent. The user never merges. Runs are **5 calculators**. Every agent commits and pushes after each sub-task (each calculator in a batch), keeps a Progress checklist in its step file, and opens a draft PR early, so an interrupted run can be resumed from the checklist. No Cloudflare changes. The user deploys manually at the end. |
| D12 | **Defaults taken 2026-10-13, reversible:** pace 10 calculators/week; the step-11 gate does **not** block the rollout (the user said "continue with the planned work"; Search Console measurement still happens via step 28); sector order math/stats/conversion first. | The user didn't answer the three open questions, so these are the plan's defaults. Change them here if the user says otherwise. |
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
| 11 | **MEASURE GATE** — no code | **NON-BLOCKING** (D12) | Deploy, request indexing on the pilot page, wait 2-3 weeks. Check Search Console position/impressions for `date-difference-calculator`. **If it does not move, stop and re-diagnose before spending effort on 52 more pages.** | §5.2, §7 |
| 12 | Content rollout: finance + shopping | **SUPERSEDED** by Phase H batches | 13 calculators (finance 8 + shopping 5). Run **after** step 16. | §4.2 |
| 13 | Content rollout: health + measurements | **SUPERSEDED** by Phase H batches | 10 calculators (health 6 + measurements 4). | §4.2 |
| 14 | Content rollout: auto + home | **SUPERSEDED** by Phase H batches | 12 calculators (auto 6 + home 6). | §4.2 |
| 15 | Content rollout: time, travel, work, creator, text, education | **SUPERSEDED** by Phase H batches | 17 calculators (time 5 + travel 4 + work 4 + creator 2 + text 2 + education 1 = 18, **minus `date-difference-calculator`** already done as the step-10 pilot). | §4.2 |

Batches 12-15 sum to **52** = all 53 minus the pilot. Counts are post-restructure (step 16), which
is why 12-15 run after it.

### Phase D — Categories

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 16 | Category restructure 11 → 14 | **DONE** 2026-09-10 | Rename `social`→`creator`. Merge `taxes`→`shopping`. Add `travel`, `text`. (**`math` + `tech` deferred to steps 24 / 25** — they would ship empty; see the session log.) Apply the 9 reassignments (`emi-calculator`→finance, `visa-stay-days`+`travel-budget`+`currency-converter`→travel, counters→text, …). 301 `/categories/taxes`→`/categories/shopping` and `/categories/social`→`/categories/creator`. Calculator URLs do not change. | §1.1, §1.2 |

### Phase E — Country / region layer

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 17 | Compute snapshot tests | **DONE** 2026-10-13 | Pure-function tests over all 53 `compute()` functions. **Must land before step 18** — that refactor changes every calculator's output formatting and is exactly where a silent regression hides. | §4.6 |
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
| 27 | Repo hygiene | TODO | `.gitignore` + delete `dev-server.log`, `dev-server.err.log`, `tsconfig.tsbuildinfo`. Regenerate the `README.md` calculator list from `data/calculators/`. Fix `mdFiles/memory/project_i18n.md` (it says `proxy.ts` / next-intl 3.26.5; reality is `middleware.ts` / 4.13 / English-only — see session 31, which confirmed `middleware.ts` must stay). | §4.6 |
| 28 | Search Console | TODO | Verify the domain, submit `/sitemap.xml`, request indexing on the top 15 calculators individually, then monitor the metrics table in §7. | §2.8, §7 |
| 29 | IndexNow setup | **DONE** 2026-09-13 | Ran ahead of the queue in response to a Bing Webmaster Tools audit. Key file `public/<key>.txt`, submit script `scripts/indexnow.mjs` (fetches `/sitemap.xml`, POSTs every `<loc>` to `api.indexnow.org/indexnow`), wired into `npm run deploy` and exposed standalone as `npm run indexnow`. No new dependency — uses built-in `fetch`. | — |

---

### Phase H — v2 rollout (plan: `mdFiles/calculator-rollout-plan.md`)

| # | Step | Status | Scope | Plan |
|---|---|---|---|---|
| 17 | (E1) Compute snapshot tests | **DONE** 2026-10-13 | Already in Phase E. **First step of the rollout.** | §2 E1 |
| 30 | (E2) Units v2 | **DONE** 2026-10-13 | Length, area, volume, time, speed, temperature (affine), energy, power, pressure, data, fuel economy (inverse). | §2 E2 |
| 31 | (E3) Solver v2 | **DONE** 2026-10-13 | Numeric solve for variables with no closed form (loan rate) + extra outputs beside the auto field. | §2 E3 |
| 32 | (E4) Result visuals kit | **DONE** 2026-10-13 | RangeBar, Donut, Timeline, AmortizationTable, LogScale (generalized), CompareBars. Hand-rolled SVG. | §2 E4 |
| 33 | (E5) Type-B widget | **DONE** 2026-10-19 | `BreakdownCalculator` replaces `CalculatorForm`. | §2 E5 |
| 34 | (E7) Split data file | **DONE** 2026-10-19 | `data/calculators/<category>.ts`. **Moved before the batches**: every batch editing one 2,000-line file means huge diffs and a conflict with any other open branch. | §2 E7 |
| 35 | Batch 1: finance (8) | **DONE** 2026-10-19 | YMYL. 6 × type A, loan-prepayment type B, paycheck C → B. PR #9. | §3 |
| 36 | Batch 2: shopping + conversion (9) | **DONE** 2026-10-19 | 4 shopping type A (sales-tax, tip, discount, unit-price), cashback B, 4 converters type A. Stone added to `mass`. PR #10. | §3 |
| 37 | Batch 3: health (6) | DONE 2026-10-20 | YMYL. Branch `step/37-batch-3-health`, PR #11. All 6 health calculators on v2. See session log. | §3 |
| 38 | Batch 4: auto + home (12) | **DONE** 2026-10-21 | Branch `step/38-batch-4-auto-home`, PR #13 (ready for review). All 12: car-payment, gas-cost, fuel-cost, ev-charging, commute-cost, toll-cost, concrete, paint, tile, wallpaper, electricity-bill, furniture-fit. See session log. | §3 |
| 39 | Batch 5: time, travel, work, creator, text, education (18) | **DONE** 2026-10-21 | Branch `step/39-batch-5`, PR #14 (ready for review, no longer draft). All 18: date-difference, age, sleep-time, work-hours, pomodoro-timer, travel-budget, visa-stay-days, currency-converter, timezone-meeting-planner, freelancer-rate, meeting-cost, pto, salary-raise, youtube-earnings, instagram-engagement, character-counter, hashtag-counter, gpa-calculator (C → B). See session log. | §3 |
| 40–42 | Wave 1: math · statistics · conversion — **NEW calculators, not conversions of existing ones** | **IN PROGRESS** | Absorbs step 24 (math). 5 calculators per agent run. Run 1/~6 **DONE** 2026-10-21: added the `math` category (`data/calculators/index.ts`, `data/calculators/math.ts`, `lib/categoryTheme.ts` orange/`function`) plus percentage-calculator (B), percent-change-calculator (A), percent-difference-calculator (B), fraction-calculator (B), ratio-calculator (A). Branch `step/40-wave-1-math-run-1`, PR #15 (ready for review). Run 2/~6 **DONE** 2026-10-21: average-calculator (B), weighted-average-calculator (B, cross-linked with gpa-calculator), rounding-calculator (B), scientific-notation-calculator (B), exponent-calculator (A). Branch `step/40-wave-1-math-run-2`, PR #16 (ready for review). Run 3/~6 **DONE** 2026-10-22: square-root-calculator (A), cube-root-calculator (A, `Math.cbrt` for real negative roots), logarithm-calculator (A, cross-linked with exponent-calculator), factorial-calculator (B, `BigInt` for exact digit counts), gcf-calculator (B, "How many numbers?" count selector). Branch `step/40-wave-1-math-run-3`, PR #17 (ready for review). **Fix 2026-10-22** (pre-merge review of PR #17): `gcf-calculator` had wrongly reused the `fraction-calculator`/`ratio-calculator` `gcd()` helper, whose `|| 1` fallback made `GCF(0, 0, 12)` compute as `1` instead of `12` and `GCF(0, 0)` as `1` instead of the standard `0`. Fixed with a separate `gcdRaw()` (no fallback) for `gcf-calculator` only; `gcd()` and the other two calculators are untouched. 15/~29 math calculators done. Run 4/~6 **DONE** 2026-10-22: lcm-calculator (B, "How many numbers?" selector, `lcm(a,0)=0`/`lcm(0,0)=NaN` convention), prime-factorization-calculator (B, 6 fixed prime/exponent slots, 10¹² cap), long-division-calculator (B, Euclidean nonnegative-remainder convention), quadratic-formula-calculator (B, two simultaneous roots incl. complex), pythagorean-theorem-calculator (A). Branch `step/40-wave-1-math-run-4`, PR #18 (ready for review). **Post-merge-review fix**: `lcm-calculator`'s `(a*b)/gcd` silently overflowed `Number.MAX_SAFE_INTEGER` on large pairwise-coprime inputs (a wrong digit, not a `NaN`) — fixed by dividing before multiplying plus a `Number.isSafeInteger` refusal guard, audited (and where needed, patched the same way) across `gcf-calculator` and `long-division-calculator` too. 20/~29 math calculators done. Run 5/~6 **DONE** 2026-10-22: triangle-calculator (B, mode menu SSS/SAS/ASA sharing one 6-field input set, law of cosines + Heron's formula, SSA deliberately unsupported), circle-calculator (A, radius ⟷ diameter solver with circumference/area as derived outputs — a circle's single degree of freedom doesn't fit 4 mutual solver variables), area-calculator / volume-calculator / surface-area-calculator (all B, a shared shape-mode-menu + `dim1/dim2/dim3` length-input pattern kept in lockstep across the three pages, each with a LogScale visual against cited everyday area/volume benchmarks). Branch `step/40-wave-1-math-run-5`, PR #19 (ready for review). 25/~29 math calculators done. Next: run 6 — slope, distance between two points, midpoint, scientific-calculator. See session log and `mdFiles/steps/40-wave-1-math.md` for the full run breakdown, type decisions and fix detail. | §4 |
| 43–45 | Wave 2: construction · food · sports | TODO | | §4 |
| 46–47 | Wave 3: physics · chemistry | TODO | Needs 30 + 31. | §4 |
| 48–49 | Wave 4: biology · ecology + fun | TODO | Absorbs steps 23, 25, 26 where they fit. | §4 |

Order: **17 → 30 → 31 → 32 → 33 → 34 → 35 … 39 → 40 …**, strictly one at a time. Steps 18–22
(region) also run in sequence: they can be slotted in anywhere after 17, between two other steps,
never alongside one. Each batch/wave step is one background `calculator-builder` run → PR → the
main session merges once it passes, without asking (D11) → the next step starts.

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

17 · 2026-10-13 · **E1: compute snapshot tests.** New `data/calculators.spec.ts` (+ committed
`data/calculators.spec.ts.snapshot`): `node:test` on Node 24 type stripping with the built-in
`t.assert.snapshot`, **no new dependency**. Each of the **49** calculators with a non-empty `compute()`
is snapshotted at 3 generated input sets (`default`; `typical` = defaults ×1.5 rounded to `step`, with
calendar/clock fields shifted instead; `edge` = every input at `min` or 0), outputs rounded to 10
significant digits. Plus: default/typical outputs must be finite, edge non-finites must match
`KNOWN_NON_FINITE` exactly (only `bmi-calculator.bmi` today); the 5 custom tools must return `{}` and
be the only ones that do; `force-calculator` `solve.*` against hand values + divide-by-zero NaN; a meta
test that snapshotted + custom = all 54. **57 tests.** `tsconfig.json` gained
`allowImportingTsExtensions: true` (the spec imports `./calculators.ts`; Node ESM needs the extension).
Excluding the spec from tsconfig was tried and broke ESLint (`parserOptions.project`). `@types/node` is
20.x and lacks `snapshot()` typings, so the one call site casts. Build + lint + test pass; second test
run left the snapshot unchanged. Step file: `mdFiles/steps/17-compute-snapshot-tests.md`.

**Next step needs to know:**

- **Run:** `npm test`. **Update snapshots:** `npm run test:update` (= `node --test
  --test-update-snapshots "data/**/*.spec.ts"`), then review the `.snapshot` diff before committing.
  A new calculator fails `npm test` until its snapshot is written: that is intended.
- Every v2 conversion (steps 32–37) and step 18 must keep `npm test` green **without** updating
  snapshots, unless the PR says which output changed and why.
- ⚠️ `.gitignore` has a bare `test*` pattern (hides `test_reports_google/`): any file or folder whose
  name starts with `test` is silently untracked. Name test files `*.spec.ts`, never `tests/`.
- When step 39 (E7) splits `data/calculators.ts`, the spec imports `calculators` from
  `./calculators.ts` and the snapshot keys are calculator ids, so only the import path should move.

fix · 2026-10-13 · pregnancy-due-date-calculator uses the real date (injectable todayMs, timeDependent flag, post-mount render) · `compute()` reads optional `values.todayMs` (not an input) and falls back to the local current date. New optional `CalculatorConfig.timeDependent`; `CalculatorForm` shows `—` for its result values until mount, so static HTML and hydration match. The spec passes a pinned `todayMs` (2026-06-17) to timeDependent calculators, so the snapshot is unchanged. Any future date-relative calculator should set `timeDependent: true` and read `values.todayMs`.

30 · 2026-10-13 · **E2: units v2.** `lib/units.ts` goes from 3 to 17 dimensions (adds length, area,
volume, time, speed, temperature, energy, power, pressure, data, fuelEconomy, percent, count,
currency). A `Unit` is now `factor`, `factor` + `offset` (affine; °C/°F) or a `toBase`/`fromBase` pair
(`inverse(k)` for mpg, km/L). `UNITS`/`findUnit`/`toBase`/`fromBase` signatures unchanged;
`SolverCalculator.tsx` and `force-calculator` untouched, and their factors are pinned in a test. New
`lib/units.spec.ts` (37 tests: base-first, round trips, anchors); `npm test` glob is now
`"{data,lib}/**/*.spec.ts"` (94 tests). Step file: `mdFiles/steps/30-units-v2.md`.
**What step 31 (solver v2) needs to know:** bases are SI and first in each list, with K for
temperature and **m³/m** for fuel economy (so `volume = distance × economy`); `percent` passes the
percent number (5 = 5%), so solvers divide by 100. `toBase` of 0 mpg is `Infinity`. `count` and
`currency` have a single unit, so the solver should hide the unit `<select>` for single-unit
dimensions (it still renders one). Currency label is a `¤` placeholder until step 18 / E6. Stone (GB)
and the AU 20 mL tbsp are not added; stone goes in with batch 2, because adding it now would change the force-calculator mass menu.

31 · 2026-10-13 · **E3: solver v2** (stacked on step 30's PR). `solve` entries are now optional: a variable without one is found numerically from `equation` (residual) within its `bounds`/`guess` by `lib/solve.ts` (grid bracket → Brent, Newton fallback, capped, `NaN` with no root or at a pole). New `outputs` (derived figures under the result) and `fixed: true` (input-only, out of the auto rotation). State logic moved to `lib/solverState.ts`; single-unit dimensions show the unit inline; non-finite inputs/results mean no answer. force-calculator unchanged (same order, share link, snapshots); 145 tests. Step file: `mdFiles/steps/31-solver-v2.md`. **What step 32 (visuals kit) needs to know:** `solveState()` returns `{ target, result, si, outputs }` with every variable in SI, so a visual (Donut principal/interest, AmortizationTable) can read `si` and `outputs` directly; the result card already has an output `<dl>` and the force-only `LogScale` slot (`solver.benchmarks`) to generalize. Currency still uses the `¤` placeholder, rounded to cents via `formatFull`.

32 · 2026-10-13 · **E4: result visuals kit.** New `components/visuals/`: `LogScale` (generalized from
`SolverCalculator`: exponent range, tick labels and title are props), `RangeBar`, `Donut`,
`CompareBars`, `Timeline`, `AmortizationTable` (the only client component: the "show all" toggle).
Pure math in `lib/visuals.ts` (linear/log position, donut arcs, band lookup, bar widths, `tint`) and
`lib/amortization.ts` (`monthlyPayment`, yearly `amortizationSchedule`). Accent from props, `role="img"`
+ worded `aria-label`, no clock or `window` reads, fixed heights. `SolverCalculator` now renders the
shared `LogScale`, and the force page's markup is unchanged apart from the wrapper's `role`/`aria-label`.
No calculator converted, no demo page. New `lib/visuals.spec.ts` + `lib/amortization.spec.ts`: **176
tests** (was 145), snapshot unchanged. Build + lint pass. ⚠️ The brief's anchor "year-1 interest ≈
$11,933.85" for $200k / 6% / 30 y is wrong: the closed form and a cent-rounded schedule both give
**$11,933.19**, and the test uses that. Also folded in: **workflow change** (D11, Phase H note, rollout
plan §5/§6 with the pace recomputed for one batch at a time, the add-calculator skill and
`calculator-builder` agent). Template §2 gained "Result visuals". Step file: `mdFiles/steps/32-visuals-kit.md`.
**What step 33 (type-B widget) needs to know:** `BreakdownCalculator` should take a visual slot
that reads `compute()` outputs and renders one kit component per the template §2 table. Pass display
units (not SI), the category accent from `TILE_COLORS[categoryTheme(category).color][1]`, and, for
`Timeline`, `today` only after mount (`timeDependent`). `AmortizationTable` wants `principal`,
`annualRate` (percent number) and `months`. The kit's default `format` is `formatSignificant`
(cents for the table), with the same `¤` / en-US caveats as before until step 18.

33 · 2026-10-19 · **E5: type-B widget.** New `components/BreakdownCalculator.tsx` renders every
calculator that has no `solver` and isn't a custom type-C tool (48 pages): grouped inset inputs (unit
menu when an input sets `dimension` + `unit`), a result card with the headline, breakdown rows and a
visual slot (`components/BreakdownVisual.tsx`: donut, compareBars, rangeBar, timeline, amortization,
logScale, fed by key), and share / copy / reset. **Decision: `CalculatorForm` is deleted, no shim**
(the page was its only caller), and `CalculatorClientConfig` with it. Shared parts (card, field row,
result panel, output rows, share/copy/reset bar, `widgetAccent`) moved from `SolverCalculator` into
`components/CalculatorWidget.tsx`; the force page's rendered body is byte-identical to master's.
Config: optional `CalculatorConfig.breakdown` (`headline`, `headlineLabel`, `outputs`, `groups`,
`derive`, `visual`); with none, the first compute key is the headline and the rest are rows, and
currency uses `CalculatorForm`'s exact money rule. Logic in `lib/breakdown.ts`; `compute()` untouched.
Demo config on `commute-cost-calculator` (groups, mi/km + mpg/L/100 km menus, derived monthly tolls
and wear, donut); its distance and MPG labels lost their unit suffix. `lib/calculator.ts` gained
`formatDecimal` and `currencySymbol` (still en-US/USD inside that file, for step 18). **195 tests**
(new `lib/breakdown.spec.ts`, including "every type-B calculator gives exactly `compute()` at its
defaults"), snapshot unchanged; build + lint pass. Browser-checked on `next start`: unit switch keeps
the cost, share link round-trips, reset clears the query, pregnancy shows real-date values after
mount, no console errors. Step file: `mdFiles/steps/33-type-b-widget.md`. Template §2 gained
"Type-B widget"; the add-calculator skill step 2 points at it.
Behavior changes on default pages (display only): results are full, not compact ("$541,116.20", not
"$541.1K"); labels are sentence case; a blank field shows "—" everywhere instead of computing with 0.
**Surprise:** a paused earlier attempt exists (branch `step/33-breakdown-widget`, draft PR #6,
worktree `.claude/worktrees/agent-a0c418cb814f507e7`) with an opt-in design. Superseded by PR #7; see Parked.
**What step 34 (split data file) needs to know:** the breakdown types (`CalculatorBreakdown`,
`BreakdownOutput`, `BreakdownVisual`, …) live beside `CalculatorConfig` and import `type Band` from
`lib/visuals`; `lib/breakdown.spec.ts` imports `calculators` from `../data/calculators.ts`, as
`data/calculators.spec.ts` does, so both import paths move. `breakdown.derive` is a function, so the
data stays a `.ts` module imported client-side (as `compute` already requires).
**What the batches need to know:** set `format: 'currency'` on money outputs whose key doesn't contain
Amount/Cost/Payment/Interest/Principal (e.g. tip's `perPerson` prints as a plain number today), and
give every output a real label (`bmi` shows as "Bmi").

34 · 2026-10-19 · **E7: data file split.** `data/calculators.ts` (2,216 lines) is now
`data/calculators/`: `types.ts` (every config type, unchanged), one `<category>.ts` per category id
(13 files, each `export const <id>Calculators: CalculatorConfig[]`), and `index.ts` (`categories`,
`calculators`, `findCalculator`, `findCategoryCalculators`, `export type *` from `types.ts`).
`@/data/calculators` resolves to the index, so no app import changed. **Decision: listing order is an
explicit `calculatorOrder` slug list in `index.ts`** — the old array interleaved categories, and
listings, sitemap, search and the snapshot test follow it. `calculators` = all category arrays sorted
by that list; an id missing from it sorts last, and the new `data/calculators/index.spec.ts` fails
(unique ids, order list complete, each file holds only its own category). Section-divider comments
were dropped; the five custom-tool stubs keep a one-line comment each. Files run by `npm test` import
`../data/calculators/index.ts` (Node resolves neither directories nor `@/`). Verified: every
calculator object deep-equal to master's (functions by source), `npm test` 198 pass with the
snapshot unchanged, build + lint + `tsc` clean, and built `sitemap.xml`, prerendered routes and the
calculator links on home / `/calculators` / `/categories` / every category page identical to a
master build (only sitemap `lastmod` build timestamps differ). Docs: add-calculator skill,
calculator-builder agent, template §4, CLAUDE.md architecture line, README. Step file:
`mdFiles/steps/34-split-data-file.md`.
**Surprise:** `tsconfig.tsbuildinfo` is tracked and every build rewrites it, so `git commit -a`
picks it up (step 27 already covers deleting it). Don't commit it.
**What step 35 (Batch 1, finance) needs to know:** all eight Batch-1 calculators live in
`data/calculators/finance.ts`; edit only that file (plus `lib/units.ts` / visuals if needed).
Converting an existing calculator does not touch `calculatorOrder`; only a brand-new id must be
appended there. New types go in `data/calculators/types.ts`. Specs import
`../data/calculators/index.ts`.

35 · 2026-10-19 · **Batch 1 finance v2 — DONE** (branch `step/35-batch-1-finance`, PR #9; paused
by the user after 7 of 8, then resumed the same day). All 8 finance calculators are on the v2
template with full content, primary-source references and an "estimates only" note.
Type A (`solver` beside the unchanged `inputs` + `compute()`): **loan** (Donut + AmortizationTable,
rate numeric), **mortgage** (same; down payment `fixed`; input relabeled "Home price", Parked item
closed), **emi** (same; down payment fixed), **compound-interest** (Donut start / contributions /
interest; rate numeric), **investment** (Donut; return numeric), **inflation** (CompareBars; every
field closed-form). Type B: **loan-prepayment** (Timeline payoff; term unit menu on `years`; explicit
formats and labels), **paycheck** (C → B; Donut of where the money goes).
Shared pieces: **`term` unit dimension** (`lib/units.ts`: months base, years = 12); **solver visual
slot** `solver.visuals` + `solver.derive`, drawn by `BreakdownVisual` (`describeSolverKey`,
`solverVisualValues` in `lib/breakdown.ts`); **menu inputs** `CalculatorInput.options` (`ChoiceRow`
in `CalculatorWidget.tsx`, share links accept only listed values). `components/PaycheckCalculator.tsx`
deleted, so it is no longer a custom tool. New tests: every shipped solver solves each field back to its
default-state value and its visuals read keys that exist; menu share-link guard. **221 tests.**
**Snapshot:** only `paycheck-calculator` changed. The new compute is a different contract: inputs
filing status, pay frequency, state and local rate, 401(k) %, pre- and post-tax per paycheck; outputs
net/gross/federal/SS/Medicare/state/local/deductions per paycheck plus yearly net. The old one was a
flat "federal tax rate" placeholder the page never used. Everything else is byte-identical
(compound-interest's compute now uses the annuity factor, which fixes a 0 ÷ 0 NaN at 0% with
contributions but gives identical results on every snapshot input).
**Paycheck uses 2026 figures**, checked on 2026-10-19 against IRS Rev. Proc. 2025-32 (IRB 2025-45),
SSA (wage base $184,500) and the IRS newsroom (401(k) $24,500). The old component's 2025 standard
deduction was pre-OBBBA and wrong. It also wrongly exempted 401(k) deferrals from FICA. The new
model is annual liability ÷ paychecks, not Pub 15-T withholding, and says so. Dropped from the old
component: separate HSA/FSA/dependent-care/commuter fields and their limits (now one pre-tax field).
Numbers: an independent Python checker matched **110** copy figures (0 mismatches); the app's
`compute()`/`solveState()` agree with it. Build + lint (ignoring `.open-next/**`, `.claude/**`) pass.
**Decisions:** type-A variable ids may differ from `inputs` ids (`term` in months). The step ran 8
calculators in one run because the brief scoped it so (D11 says 5 per run).
**What step 36 (Batch 2, shopping + conversion) needs to know:**
- Type A = add `solver` next to the existing `inputs` + `compute()`; the snapshot then does not move.
  Put visuals in `solver.visuals` (same configs as type B) and display-only figures in `solver.derive`.
  The two new solver tests run on every shipped solver automatically.
- Fixed choices (US vs UK gallon, a second discount on/off) can use `CalculatorInput.options` on
  type B. Type A has no menu input yet; use a unit menu (a dimension) instead where it fits.
- No visual for "per-person chips", "strikethrough price card", a thermometer or a
  common-values table exists in the kit. Use the nearest kit component or add to the kit in its own
  step. Never draw one inside a calculator.
- Stone (GB) still needs adding to `mass` for pounds-to-kilograms (step 30 note).
- Type-A currency still shows the `¤` placeholder while kit visuals show `$` (Parked, step 18).

36 · 2026-10-19 · **Batch 2 shopping + conversion v2 — DONE** (branch `step/36-batch-2-shopping-conversion`,
PR #10). Two agent runs: paused after the five shopping calculators (D11), then resumed for the four
converters. All 9 are on the v2 template with full content, primary references and verified numbers.
`inputs` + `compute()` are unchanged on all nine, so **the compute snapshot did not move.**
Type A (solver beside the unchanged forward compute): **sales-tax** (total ↔ price ↔ rate; "remove
tax" = solve for price; Donut price + tax), **tip** (tip ↔ bill ↔ tip %; people `fixed`; Donut bill + tip
with the per-person share in the center), **discount** (sale ↔ original ↔ % off; extra coupon and tax
`fixed`; CompareBars original vs sale), **unit-price** (unit price ↔ cost ↔ quantity; item 2 `fixed`;
per-100 outputs + % difference; CompareBars), **fahrenheit-to-celsius** (RangeBar freezing / body /
boiling via a °C `derive` key; K and °R in the menus), **gallons-to-liters** (US/UK gallon via the unit
menu; LogScale), **miles-to-kilometers** (LogScale with race distances), **pounds-to-kilograms** (stone in
the menus; LogScale). Type B: **cashback** (explicit formats and labels, groups, CompareBars rewards vs fee).
**Stone** (14 lb, exact) is appended to `mass` in `lib/units.ts`. The force-calculator mass menu now
offers "st"; its other units, factors and default result (4,170 N) are unchanged (pinned test extended).
Converters solve exactly via `lib/units.ts`, while the unchanged `compute()` keeps rounded factors
(3.78541, 1.60934, 0.453592): they differ only in the sixth significant figure.
Solver defaults differ from the `inputs` defaults on tip (3 people) and discount (extra 10% coupon),
to match the example lines.
**Test change:** `lib/breakdown.spec.ts` required at least 40 type-B calculators; each type-A conversion
lowers that count, so the floor is now 20 (an empty-loop guard). **246 tests** pass.
Numbers: an independent Python checker matched **173 of 173** copy figures (0 mismatches); the app's
`solveState()` / `compute()` agree. Build + lint (ignoring `.open-next/**`, `.claude/**`) pass. All 9
pages plus force checked on `next start` (H1, every section id, JSON-LD, visual aria-label).
Step file: `mdFiles/steps/36-batch-2-shopping-conversion.md`.
**What step 37 (Batch 3, health, YMYL) needs to know:**
- Same pattern: type A adds `solver` beside the unchanged `inputs` + `compute()`; visuals go in
  `solver.visuals`; display-unit figures (e.g. a value in °C or L rather than SI) come from
  `solver.derive`, because solver visuals receive SI values.
- Health is YMYL: references are mandatory, plus an "estimates only" / not-medical-advice note in
  `formula.note` or a watch-out. Cite primary sources (CDC, NIH, WHO), never other calculator sites.
- BMI's `RangeBar` with WHO bands fits the kit directly. `bmi-calculator` still returns NaN at its own
  min (Parked); guard it in the solver (`NaN` on zero height) without touching `compute()`.
- `mass` now has st (useful for BMI in GB). `length` has ft and in but no combined "5 ft 7 in" input:
  use a single unit menu, or Park it.
- Converting type-B calculators to type A lowers the `breakdown.spec` count again; the floor is 20.
- Sub-cent money and the `¤` vs `$` symbol split are still open (Parked, step 18).

37 · 2026-10-20 · **Batch 3 health v2 — DONE** (branch `step/37-batch-3-health`, PR #11). Two agent
runs: paused after 5 of 6 (D11), then resumed for pregnancy-due-date after merging `origin/master`
(PR #12, currency symbol; one conflict in `lib/units.spec.ts`, both tests kept). All 6 have full
v2 content, primary references (CDC, WHO, NHLBI, NASEM, FAO/WHO/UNU, ACSM, ACOG CO 700 and 579,
Mifflin 1990, Frankenfield 2005, Hall 2011, Riegel 1981) and an "estimate only, not medical
advice" note.
Type A: **bmi** (BMI ↔ weight ↔ height, unitless via `count`, zero height → NaN in the solver;
healthy-weight range outputs at BMI 18.5 / 24.9 in lb; RangeBar with WHO/CDC adult bands; "Bmi"
label gone), **running-pace** (pace ↔ distance ↔ time; **new `pace` dimension** in `lib/units.ts`,
base s/m with min/km, min/mi, s/100 m; speed + even-pace marathon outputs; CompareBars of Riegel
predictions from `solver.derive`). Type B: **calorie** (CompareBars lose / maintain / gain, derived
BMR row), **tdee** (Donut BMR + activity), **water-intake** (CompareBars vs NASEM fluids from drinks,
2.2 / 3.0 L; fl oz headline with L and cups), **pregnancy-due-date** (headline = due date; Timeline
with ACOG trimesters, a 37-week milestone and today after mount; completed weeks + days, trimester,
days left, likely conception).
New shared piece: **`date` breakdown format** (`BreakdownFormat`, `formatDate` in `lib/calculator.ts`,
en-US like the rest of that file until step 18; spec case added). Due/conception dates are derived
with calendar arithmetic, so a DST change cannot shift them by a day.
**`compute()` changes, snapshot explained:**
- calorie + tdee gained a `sex` menu input (0 = male, the old hard-coded +5; 1 = female, −161). Its
  snapshot values are 0 in all three sets, so every output is unchanged; the snapshot diff is only
  the new `"sex": 0` input line (3 per calculator). Activity factor is now a 5-option menu.
- pregnancy's trimester boundaries were ≤ 12 / ≤ 26 weeks; now ACOG's < 14 / < 28. No snapshot set
  falls in the changed ranges (default 15.4 wk, typical 0, edge > 28), so the snapshot did not move.
Numbers: an independent Python checker matched **123 of 123** copy figures (including mm:ss and
calendar dates); the app's `solveState()` / `compute()` / `evaluateBreakdown()` agree, also across a
DST change and at the trimester boundary days. The NASEM water figures (3.7 / 2.7 L total, 3.0 / 2.2 L
from drinks, ~80% from drinks) and the NHLBI waist cut-offs (40 / 35 in; 102 / 88 cm) were confirmed
on primary pages; "aged 19 and over" was softened to "adult" because the quoted sentence is for
ages 19–30. `npm test` 255 pass; build + lint (ignoring `.open-next/**`, `.claude/**`) pass; all 6
pages checked on `next start` (H1, 8 section ids, JSON-LD). The pregnancy page's after-mount values
were checked through the same functions in Node, not in a browser.
Step file: `mdFiles/steps/37-batch-3-health.md`.
**What step 38 (Batch 4, auto + home) needs to know:**
- Same pattern: type A adds `solver` beside the unchanged `inputs` + `compute()`; visuals in
  `solver.visuals`, display figures in `solver.derive`. Type B: `dimension` + `unit` on inputs,
  explicit labels and formats, `options` menus.
- A new input on an existing `compute()` shows up in the snapshot's `inputs` block even when every
  output is unchanged. Pick a value whose default / ×1.5 / min all mean the old behavior (0 works).
- New: `format: 'date'` for epoch-ms outputs (local calendar dates); derive dates with
  `new Date(y, m, d + n)`, not ms arithmetic.
- `pace` exists now; fuel economy already has mpg ↔ L/100 km (gas-cost). Currency now shows the real
  symbol in both widgets (PR #12).
- `lib/breakdown.spec.ts` type-B floor is 20; each A conversion lowers the count.

38 · 2026-10-21 · **Batch 4 auto + home v2 — run 1 of 3, PAUSED after commute-cost** (branch
`step/38-batch-4-auto-home`, draft PR #13). The five auto calculators done so far have full v2 content,
primary references and verified numbers. `compute()` is unchanged on all five, so **the compute
snapshot did not move.**
Type A: **car-payment** (payment ↔ price ↔ term ↔ rate, rate numeric; down payment + trade-in
`fixed`; Donut + AmortizationTable; YMYL "estimates only" note; reuses finance's `loanPayment` /
`loanPrincipal` / `loanMonths`, now exported from `finance.ts`), **gas-cost** (cost ↔ distance ↔
fuel economy ↔ fuel price, all closed form; outputs fuel used in gal and L, cost per 100 mi / 100 km;
CompareBars one way vs round trip from `solver.derive`). Type B: **fuel-cost** (units on every input;
CompareBars your car vs comparison car; cost per 100 mi derived), **ev-charging** (efficiency unit
menu; starting charge now `type: 'percent'`; CompareBars EV vs gas per 100 mi), **commute-cost** (step-33
config kept; labels no longer hardcode `$` or the wrong "IRS: $0.21"; fuel price unit menu).
**New unit dimensions** in `lib/units.ts` (tests in `lib/units.spec.ts`): `fuelPrice` (base currency
per m³; per L, per US gal, per UK gal; labels from `currencySymbol()`) so a fuel price follows the
fuel-economy unit; `evEfficiency` (base J/m; kWh/100 mi as on EPA labels, kWh/100 km, Wh/mi, Wh/km,
mi/kWh, km/kWh).
**Facts checked on primary sources 2026-10-21:** IRS Notice 2026-10 (business rate 72.5 ¢/mi,
depreciation 35 ¢/mi; the old FAQ's 2025 figures and the "$0.21 IRS wear" label were wrong), FEG 2026
(15,000 mi/yr, 55% city, $4.33/gal regular, $0.15/kWh), EIA Table 5.6.A (July 2026 residential 18.31 ¢,
ND 13.41 ¢, HI 48.00 ¢), FHWA (13,476 mi per driver), EPA (MPGe 33.7 kWh/gal, ratings include charging
losses), DOE FOTW #1374, fueleconomy.gov driving tips, CFPB/FTC auto-loan pages. CFPB pages return
403 to curl and FHWA/EPA timed out from curl, but each was confirmed via search/fetch.
Numbers: an independent Python checker matched **89 of 89** copy figures (one mismatch found and
fixed: 84-month extra interest $592.40, not $592.41); the app's `solveState()` / `evaluateBreakdown()`
agree at the defaults, the worked examples and with metric units.
**Resume notes (run 2):** next is toll-cost (B, CompareBars with vs without a pass), then concrete (A),
paint, tile, wallpaper (run 2 ends after wallpaper or after 5), then electricity-bill and furniture-fit.
`fuelPrice` / `evEfficiency` are available for any later input. Don't commit `tsconfig.tsbuildinfo` / `next-env.d.ts`.

38 · 2026-10-21 · **Batch 4 auto + home v2 — run 2 of 3, PAUSED after wallpaper** (same branch, draft
PR #13). `compute()` unchanged on all five, so **the compute snapshot did not move** (still 268 tests,
up from 265 only because the new concrete `solver` adds to `lib/solverState.spec.ts`'s "every shipped
solver is well-formed" loop).
Type A: **concrete** (volume ↔ length ↔ width ↔ depth, waste factor `fixed`; outputs `volumeWithWaste`,
`bags80lb`/`bags60lb` via a `CUBIC_YARD_M3 = toBase(1, 'volume', 'yd3')` conversion from SI; CompareBars
80 lb vs 60 lb bags — nearest kit match for the plan's "bags-needed chips", gap parked). Type B:
**toll-cost** (breakdown added to the old pre-v2 stub; CompareBars annual cost with vs without a pass,
exactly the plan's visual), **paint** (CompareBars gallons needed vs. whole cans to buy, via a
`derive`d `cansToBuy = Math.ceil(gallonsWithBuffer)`; nearest kit for "can-count row", gap parked),
**tile** (CompareBars exact tiles vs. with waste; nearest kit for "grid illustration", gap parked),
**wallpaper** (CompareBars exact rolls vs. rolls to buy, via a `derive`d `rollsExact`; nearest kit for
"roll-count row", gap parked). `length`/`area`/`volume` dimensions on every relevant input and output;
no new unit dimensions needed.
**Facts checked on primary sources 2026-10-21:** QUIKRETE Concrete Mix (1101) data sheet, read from the
downloaded PDF directly (bag yields: 40 lb 0.30 ft³, 50 lb 0.375 ft³, 60 lb 0.45 ft³, 80 lb 0.60 ft³,
90 lb 0.675 ft³ — 45/60/90 bags per cubic yard respectively); Ohio Concrete's Industry Recommendation
for Exterior Concrete Flatwork (3½" minimum for sidewalks/driveways/patios, citing ACI/PCA/NRMCA);
Sherwin-Williams' paint calculator page (350–400 sq ft/gal) and Benjamin Moore's Regal Select technical
data sheet, read from the downloaded PDF (400–450 sq ft/gal, two coats recommended on bare substrates);
Wallcovering Installers Association's consumer tips page (a 24"+ drop match "will require additional
wallpaper to be ordered") and its Wallcovering Estimator page (perimeter × height ÷ ~25 sq ft per single
roll); E-ZPass Interagency Group (20-state network), Central Florida Expressway Authority ("Pay By
Plate toll rates are double the electronic rate") and MWAA's Dulles Toll Road announcement ($1.60
Pay-by-Plate processing fee, $4.00 vs $5.60 at the Main Plaza); IRS Pub 463 (commuting tolls are
personal, not deductible, same rule as commuting mileage).
⚠ **Tile Council of North America's specific waste-factor percentages (10%/15%/20% by layout) could
not be confirmed from a free primary source** — tcnatile.com/faqs and the TCNA Handbook PDF both
404'd, and the Handbook itself is a $55 paid publication. The tile page cites TCNA generally (its
published ANSI A108/A118/A136.1 standards) and the Ceramic Tile Education Foundation, and keeps the
10% default's wording soft ("a common starting point") rather than attributing an exact percentage to
TCNA. Revisit if a free TCNA source turns up later.
Numbers: an independent Python checker matched **40 of 40** copy figures across all five calculators
after one fix (the concrete worked-example's "6 inches instead of 4... more than double" comparison
had leftover numbers from an unrelated footprint and was also arithmetically wrong — 6" is 1.5× the
4" volume, not more than double; replaced with an 8"-vs-4" comparison, which is exactly double and now
verified: 2.96 yd³ vs 1.48 yd³). The live app's solver/breakdown visuals were cross-checked on
`next dev`: every `aria-label` matches the worked-example figures exactly (toll $1,320.00/$990.00,
concrete 74/98 bags, paint 2.39/3, tile 120/132, wallpaper 8.21/9). `npm test` 268 pass; build (81
static pages) and lint (ignoring `.open-next/**`, `.claude/**`) pass; server killed.
**Resume notes (run 3):** next is electricity-bill (B, plan: tier bar → no tiered-rate visual in the
kit, nearest is probably RangeBar or CompareBars low-tier vs high-tier cost; decide and park the gap),
then furniture-fit (B, plan: top-down floor-plan SVG → no floor-plan component in the kit; nearest is
likely RangeBar on the tightest clearance margin, or CompareBars room vs furniture+clearance footprint;
decide and park the gap). Those two finish Batch 4 (12/12); mark the PR ready and the step DONE after.
Don't commit `tsconfig.tsbuildinfo` / `next-env.d.ts`.

38 · 2026-10-21 · **Batch 4 auto + home v2 — run 3 of 3, DONE (12/12)** (same branch, PR #13 now
ready for review). `compute()` unchanged on both remaining calculators, so **the compute snapshot
did not move** (still 268 tests).
Type B: **electricity-bill** (`monthlyKwh`/`tieredThreshold` gain `dimension: 'energy'`/`unit: 'kWh'`;
new `derive`d `effectiveRatePer100kWh` so the effective-rate row doesn't round away the fixed-charge
effect at $0.17; tiered-pricing inputs moved into an optional disclosure group, default threshold 0 =
flat rate), **furniture-fit** (room/furniture/clearance inputs gain `dimension: 'length'`, ft/in; new
`derive`d `marginLength`/`marginWidth`/`tightestMargin` — `tightestMargin >= 0` is exactly equivalent
to the old `fits` flag, so no boolean output format had to be invented).
**Visual gaps, both parked:** electricity-bill's plan called for a "tier bar", but no kit visual reacts
to a user-editable threshold input (`RangeBar` bands are fixed at config time) — nearest kit used
instead is **CompareBars**, energy charge vs. total bill with fixed charges. Furniture-fit's plan
called for a "top-down floor-plan SVG", not in the kit — nearest kit used instead is **RangeBar** on
the tightest clearance margin (bands: won't fit / tight / comfortable / spacious), which turned out to
be a clean fit since margin ≥ 0 already is the fits/doesn't-fit boundary.
**Facts checked on primary sources 2026-10-21:** EIA Electric Power Monthly Table 5.6.A (residential
avg 18.31 ¢/kWh, Jul 2026; ND 13.41 ¢, HI 48.00 ¢ — same figures run 1 used for auto, re-fetched and
still current), EIA FAQ #97 (avg U.S. residential usage 899 kWh/month, 2022: 10,791 kWh/yr ÷ 12), EIA
Glossary "block-rate structure", ENERGY STAR Low-/No-Cost Tips (LED $40/yr on 5 bulbs; smart thermostat
>8% / ~$50/yr, ~$100/yr if often unoccupied); U.S. Access Board 2010 ADA Standards Ch. 4 (403.5.1, 36
in clear width; 403.5.2, 42 in approaching a 180° turn); ICC IRC R311.6 (36 in minimum hallway width)
and R311.2 (32 in minimum clear width at the required egress door).
⚠ **`codes.iccsafe.org` (ICC's own code viewer) 403'd on both IRC fetches**, same failure mode as
CFPB in run 1. Used `up.codes` instead — a free, widely-used code-text mirror, not a calculator site —
for both IRC citations; noted in the furniture-fit references rather than silently substituting.
Numbers: an independent Python checker (no app imports) matched **26 of 26** copy figures, 0
mismatches. Both pages checked on `npm run dev`: H1, 8 section ids, JSON-LD present, and every visual
`aria-label` matches the worked-example figures exactly (electricity "Energy charge $144.00, Total
bill $156.00"; furniture-fit "Tightest clearance margin: 54 in falls in the Spacious band").
`related`/`aliases` re-checked for self-reference, existence and duplication (0 problems) — furniture-
fit's stray `miles-to-kilometers-converter` related link was swapped for `concrete-calculator` to
match the paint/tile/wallpaper/furniture-fit mutual-linking cluster; electricity-bill's
`travel-budget-calculator`/`inflation-calculator` pair was trimmed to one (`inflation-calculator`) in
favor of `commute-cost-calculator`, also from this batch. `npm test` 268 pass; `npm run build` (81
static pages) and lint (ignoring `.open-next/**`, `.claude/**`) pass; dev server killed.
**Step 38 is DONE.** PR #13 covers all 12 Batch 4 calculators; marked ready for review (was draft).

fix · 2026-10-20 · **Solver widget shows the real currency symbol, not `¤`** (branch `fix/currency-symbol`). `UNITS.currency[0].label` = `currencySymbol()` from `lib/calculator.ts`, so type-A inline values, input adornments and output rows print `$` like the type-B widget and the visuals. Share links use the unit id (`currency`), not the label, so they are unaffected. New `units.spec` test: no unit label contains `¤`.

step 39 · 2026-10-21 · **Batch 5 run 1/4 — time calculators** (branch `step/39-batch-5`, PR #14 draft). Step file `mdFiles/steps/39-batch-5.md` written with the full 18-item checklist grouped by run before any code changed. This run: date-difference-calculator (added `concept` + `references` + a `breakdown` Timeline visual; `compute()`/inputs untouched — it already had howTo/formula/workedExample/watchOut from the step-10 pilot), age-calculator (rebuilt from a trivial `birthYear - currentYear` into real `birthMonth/birthDay/birthYear` + `timeDependent: true`, returning exact years/months/days, total days lived and days to the next birthday, with a next-birthday Timeline — this is a deliberate `compute()`/inputs change, snapshot regenerated with `npm run test:update` and the diff checked to touch only `age-calculator`), sleep-time-calculator (breakdown + a Timeline showing 4/5/6-cycle wake-time options; `compute()` unchanged), work-hours-calculator (breakdown + Donut for regular vs overtime pay — the plan's "stacked bar" wording maps to Donut here, matching the precedent already set by `tdee-calculator` and `cashback-calculator` in earlier batches since the kit has no literal stacked-bar component; `compute()` unchanged), and pomodoro-timer (type C: full v2 content — the page template already renders TOC/concept/howTo/etc. from `calculator.content` regardless of widget type, confirmed by reading `app/[locale]/calculators/[slug]/page.tsx` — plus a restyle onto the shared `WidgetCard` + category accent color, which also fixed a pre-existing dead-Tailwind-class bug, `bg-brand-600`/`hover:bg-brand-700`/`focus:border-brand-500`, none of which exist in the Tailwind config per the "Dead Tailwind brand shades" Parked item). All five calculators' copy figures were re-verified with an independent Python script (no app imports); 0 mismatches after one self-caught arithmetic slip in the script itself (sleep-time wake minute, fixed before trusting the result). References fetched directly: IEEE POSIX (epoch), Royal Museums Greenwich (leap years — the first guessed URL 404'd, found the right one via search), NHLBI (sleep stages), CDC (sleep duration), US DOL (overtime + FLSA), California DIR (daily overtime), Duke University ARC and the official Pomodoro® Technique site. **Not loaded** (tried, moved on per the no-retry-loop rule): US Naval Observatory "Introduction to Calendars" (`ECONNRESET` twice) and NINDS "Brain Basics: Understanding Sleep" (403) — NHLBI substituted for the latter. `npm test` 268/268, `npm run build` (81 static pages) and lint (ignoring `.open-next/**`, `.claude/**`) pass; dev server killed; `related`/`aliases` checked for self-reference, existence and duplication across all 5 (clean — the one alias collision found, `mortgage-calculator`/`emi-calculator` on "house loan emi calculator", predates this batch).
step 39 · 2026-10-21 · **Batch 5 run 2/4 — travel + freelancer-rate** (branch `step/39-batch-5`, PR #14 draft, two commits). travel-budget-calculator (breakdown + Donut by category: flights/accommodation/food/activities/misc/insurance, 6 segments at the kit's limit; `compute()` unchanged), visa-stay-days-calculator (breakdown + a percent-based RangeBar for the plan's "180-day window bar" — `BreakdownVisual` bands must be static numbers, not derived from inputs, and `allowedDays` is user-adjustable, so the bar plots 0-100%/100-200% of the allowance instead of literal day-count bands, generalizing to any visa; `compute()` unchanged, `projectedUsagePercent` added via `breakdown.derive` only; cites the official EU short-stay calculator and CBP's I-94 compliance page, with an explicit "not legal advice, confirm with the authority" note in `watchOut` and `formula.note` per the coordinator's instruction), currency-converter (type C: full v2 content, restyled onto the shared `WidgetCard`/`ResultPanel`/`Headline`/`AlsoIn`, which also fixed real dead-Tailwind-class bugs — `brand-200/300/400/800/950` don't exist in `tailwind.config.ts`, so the old result card and several hover/focus states rendered with no color, worst in dark mode; added a persistent "Static reference rates — not live" banner with an explicit as-of date via a `RATES_AS_OF` constant, repeated in a `watchOut` item, the footer caption and an FAQ — never described as live anywhere, per the coordinator's instruction; cites the Fed's H.10 release and the ECB's euro reference rates as where to find real rates), timezone-meeting-planner (type C: full v2 content, restyled onto `WidgetCard`; fixed a dark-mode dead-class bug on the selected-zone chip the same way; cites the IANA Time Zone Database and NIST's Daylight Saving Time Rules page per the coordinator's instruction), and freelancer-rate-calculator (type A: added a `solver` — hourly rate ↔ target net income ↔ billable hours, with weeks/tax rate/expenses/benefits fixed — alongside the UNCHANGED `inputs`/`compute()`, verified via `git diff`; every variable has a closed-form solve; Donut splits gross revenue into net income/taxes/expenses/benefits, matching the plan's "Donut income/tax/expenses" with benefits broken out as a 4th slice; cites IRS self-employment tax and HealthCare.gov self-employed coverage). All five independently number-checked with a throwaway Python script (no app imports); 0 mismatches, confirmed again by spot-checking the rendered pages' aria-labels and solver output against the script. `npm test` 271/271 (no snapshot changes this run — every `compute()`/`inputs` pair was left untouched, freelancer-rate's solver is purely additive), `npm run build` (81 static pages) and lint pass; dev server killed; `related`/`aliases` re-checked (clean, same pre-existing collision as run 1). travel.ts's four calculators and the two component restyles are one combined commit (same file-sharing constraint as run 1's time.ts); freelancer-rate-calculator (a separate file, work.ts) is its own commit.
step 39 · 2026-10-21 · **Batch 5 run 3/4 — work + creator calculators** (branch `step/39-batch-5`, PR #14 draft, two commits, one per shared data file since `git add -p` isn't available non-interactively). salary-raise-calculator (type A: added a `solver` — current salary fixed, raise % ↔ new salary, with tax rate and pay periods fixed — alongside the UNCHANGED `inputs`/`compute()`, verified via `git diff`; `raiseAmount` is a solver `outputs` entry rather than a third rotating variable, since it and raisePercent both describe the same one degree of freedom for a fixed current salary and only one field auto-updates at a time; CompareBars shows current vs. new salary per the plan's "Before/after bars"; estimate-only/not-tax-advice note added per the coordinator's instruction; also swapped an unsourced "merit raises 3-5%" FAQ claim for a sourced CPI/COLA answer), meeting-cost-calculator (type B: breakdown + CompareBars comparing the one-off cost to the annual-if-weekly cost, since the plan's "cost ticker" would need a live JS timer not in the static kit; `compute()` unchanged; found and fixed a pre-existing wrong FAQ figure — the old copy claimed a 10-person/$90k weekly meeting "costs over $22,000/year" but the calculator's own formula gives $29,250 for that scenario — and dropped an unsourced "31 hours/month in unproductive meetings" claim), pto-calculator (type B: breakdown + CompareBars, used vs. remaining, matching the plan exactly; `compute()` unchanged), youtube-earnings-calculator (type A: added a `solver` — monthly earnings ↔ monthly views ↔ RPM, CTR fixed — alongside the UNCHANGED `inputs`/`compute()`; CompareBars shows monthly vs. projected annual earnings per the plan; per the coordinator's instruction, removed the old FAQ's unsourced RPM-by-niche claims and replaced them with YouTube's own documented eligibility requirements and the 55%/45% ad-revenue split, with content repeatedly stating RPM is a user-supplied what-if, never a looked-up fact), and instagram-engagement-calculator (type B: breakdown + a Donut of the user's own engagement composition — not the plan's literal "RangeBar of typical rates," since RangeBar bands must be static per the schema (the same constraint hit on visa-stay-days in run 2) and, more importantly, Instagram publishes no official engagement-rate benchmarks, so plotting invented thresholds would itself be exactly the unsourced-average problem the coordinator said to avoid; `compute()` unchanged, but `estimatedPostValue`/`cpm` are now explicitly labeled as this page's own illustrative formula, not a market rate, and several unsourced claims — "$100 per 10,000 followers," "$5-25 CPM," "nano 4-8%, mega <1.5%" — were removed in favor of official Instagram/Meta docs, including a sourced nuance that Meta's developer API defines "engagement" more narrowly than Instagram's own creator guidance). All five independently number-checked with a throwaway Python script (no app imports); 0 mismatches, cross-checked against the rendered pages' solver/breakdown output. `npm test` 277/277 (no snapshot changes — every `compute()`/`inputs` pair left untouched), `npm run build` (81 static pages) and lint pass; dev server killed; `related`/`aliases` re-checked (clean, same pre-existing collision as runs 1-2).
step 39 · 2026-10-21 · **Batch 5 run 4/4 + close-out — text + education calculators, step DONE**
(branch `step/39-batch-5`, PR #14, taken out of draft). This session picked up a stalled run 4 —
the two commits (character-counter/hashtag-counter, gpa-calculator) were already pushed by the
previous agent but unverified — and verified rather than rebuilt them. character-counter and
hashtag-counter (type C, shared `TextToolsCalculator.tsx`): every platform character limit was
re-confirmed by fetching the cited official doc directly (not re-trusting the commit message) —
X's 280-char post limit + 23-char t.co URL wrapping (`docs.x.com/fundamentals/counting-characters`),
Meta's Instagram caption `"Maximum 2200 characters, 30 hashtags, and 20 @ tags"` (also the source
for hashtag-counter's 30-hashtag limit), LinkedIn's 3,000 (LinkedIn Help), YouTube's 100-char title
/ 5,000-char description (YouTube Help), and Twilio's SMS doc confirming 160 chars under GSM-7 vs.
70 under UCS-2 (triggered by one emoji or non-Latin character) citing the underlying 3GPP/ETSI
standard. Two limits the previous agent had already removed as unconfirmable were double-checked
as correctly removed: Facebook's commonly-quoted 63,206 (no current official Meta source found) and
a fixed meta-description length (Google Search Central states explicitly there is no character
limit, truncation is pixel-width-based). gpa-calculator (C → B): the 4.0-scale sourcing was
reconfirmed — College Board's BigFuture page says the standard scale is "just one commonly used
system" and "always check with your school for the most accurate GPA conversion"; UNC's registrar
page lists A-=3.7 and University of Cincinnati's lists A-=3.6667 on otherwise-similar 4.0 scales,
concrete sourced evidence that scales vary, not an assertion. All 9 references across the 3
calculators fetched successfully; nothing failed to load, nothing needed to be removed beyond what
run 4's own commits had already dropped. Every copy figure re-verified with an independent Python
script (no app imports, run via a local `python.exe` since bare `python`/`python3` aren't on PATH
here): character-counter's 137-char/22-word/3-sentence/2-paragraph/7-second-reading-time worked
example and all 7 platform-limit pass/fail checks; hashtag-counter's 5-match/4-unique worked
example; gpa-calculator's 6-course example (62.4 total grade points, 19 total credits, 3.2842 GPA,
A=9/B=7/C=3 credit-hour bands summing to 19) — 0 mismatches, and the GPA page's rendered donut
aria-label (`"19 total credits: A range ... 9 (47%), B range ... 7 (37%), C range ... 3 (16%) ..."`)
matches the script exactly. `npm test` 277/277, `npm run build` (81 static pages), and
`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` all pass. Dev
server spot-checked all 3 pages (H1, `concept`/`how-to-use`/`formula`/`worked-example`/`watch-out`/
`references`/`faq`/`related` section ids, 2 JSON-LD blocks, correct widget mount) then was killed;
port 3000 confirmed free. `next-env.d.ts` reverted (build regenerates it with a dev-mode path,
`tsconfig.tsbuildinfo` was already gitignored/untouched) before any commit. **All 18 of batch 5 are
now done** — PR #14 body rewritten with the full 18-calculator summary, a snapshot-diff explanation
(age-calculator run 1 + gpa-calculator this run, both documented inline), and taken off draft via
`gh pr ready 14`. Step 39 marked DONE; step 40 (Wave 1: math · statistics · conversion) is next.

**Lessons for step 40 / the add-calculator skill:**
- A verification-only session (resuming someone else's pushed-but-unchecked commits) is a real and
  useful mode: re-run the independent script, re-fetch every cited reference, spot-check the
  rendered page — don't just re-trust a previous commit message's claims, but also don't redo work
  that already matches once it's independently confirmed.
- Fetching references one at a time in parallel (one `WebFetch` call per reference, batched in one
  turn) is fast and catches drift between what a commit message claims a source says and what the
  source actually says — worth doing routinely for every `references` entry added in a step, not
  just spot-checking a few.
- On this Windows/Git-Bash environment, bare `python`/`python3` resolve to the Microsoft Store stub
  and fail; the real interpreter is at a path like
  `/c/Users/<user>/AppData/Local/Programs/Python/Python31x/python` — worth noting once so future
  verification scripts don't waste a round-trip rediscovering it.
- Wave 1 (step 40) builds **new** calculators (math/statistics/conversion topics not yet on the
  site), not v2 conversions of existing ones — the "C → B" / "type A/B/C" classification work from
  batches 1-5 doesn't apply the same way; the step-40 step file should state the wave's calculator
  list up front (per `mdFiles/calculator-rollout-plan.md` §4) before any code, same as batch 5's
  step file did.

**2026-10-21 — step 40, Wave 1: math, run 1/~6 (5 new calculators).** Branch
`step/40-wave-1-math-run-1` from `origin/master`. Added the `math` category (`data/calculators/index.ts`
categories array + `calculatorOrder`, new `data/calculators/math.ts`, `lib/categoryTheme.ts` —
orange / `function` icon, since every other `IconTile` color is already assigned to another
category and no "percent/calculator" glyph exists in the kit) and 5 brand-new calculators per
`mdFiles/calculator-rollout-plan.md` §4 and the step file (`mdFiles/steps/40-wave-1-math.md`),
written just-in-time before this run:

- **percentage-calculator** (type B): a `mode` options menu (X% of Y / X is what % of Y / percent
  change / increase-decrease by X%) over two generic numbers, since the four formulas are not one
  invertible equation a solver could auto-fill. `compute()` always returns one `result` key
  computed from whichever mode is selected, so the breakdown config never needs to change shape at
  runtime. CompareBars visual (the two raw inputs, mode-agnostic).
- **percent-change-calculator** (type A, solver): `%Δ = ((B−A)÷A)×100` rearranges cleanly for all
  three variables, same shape as `inflation-calculator`'s rate solve. CompareBars visual (old vs
  new), reusing that calculator's "then vs now" pattern.
- **percent-difference-calculator** (type B): `|A−B| ÷ ((A+B)÷2) × 100` is symmetric and not
  uniquely invertible (solving for A given B and the percent needs to know which one is larger —
  two possible answers), so no solver. CompareBars visual (value A vs value B).
- **fraction-calculator** (type B): operator menu (add/subtract/multiply/divide) over two
  fractions. The `BreakdownFormat` enum has no "a/b" fraction type, so the simplified fraction,
  mixed number and decimal are each broken into their own numeric row instead of rendered as
  "1/2" text live — the worked example and FAQ use standard "a/b" notation in prose. CompareBars
  visual (the two input fractions as decimals).
- **ratio-calculator** (type A, solver): A:B = C:D cross-multiplies to a closed form for any one
  of the four terms, same shape as force-calculator's three-variable solve. Donut visual (A and B
  as parts of their total). Also covers "proportion calculator" search intent via alias, since the
  solver *is* a proportion solver.

**Dedup decision:** the plan's math list also names "mixed number" and "proportion" as separate
calculators. Both were absorbed into run 1's pages instead of getting their own — fraction-calculator
already converts every result to a mixed number (one of its breakdown rows), and ratio-calculator's
A:B = C:D solver already is a proportion solver. This mirrors the template's "one equation, all
directions" rule for force-calculator; a standalone "mixed number calculator" or "proportion
calculator" page would be near-duplicate content. Captured instead as aliases on fraction-calculator
and ratio-calculator respectively. This drops the math category's total from the plan's ~31 named
topics to ~29 pages across all runs — noted here, not hidden.

Also fixed the pre-existing gap the plan called out: the homepage copy (`messages/en.json` `homeSeo.p5`)
has claimed "The percentage calculator handles tip splits, discounts, tax rates, and markups" since
before step 16, with no page behind it. `app/[locale]/layout.tsx`'s `keywords` array had an explicit
comment since step 16 saying step 24 would "add back" `'percentage calculator'` once a real page
existed — done now; `'scientific calculator'` and `'final grade calculator'` are still owed (the
comment is updated to say so).

Verification: 5 calculators committed one at a time (`git add` + `git commit`, each paired with
`npm run test:update` + `npm test` immediately after, so every commit's snapshot and
`KNOWN_NON_FINITE` state is self-consistent) — true per-calculator granularity was possible here
because `math.ts` is a brand-new file, unlike the shared-file batches in steps 37-39. Every number
in the copy (worked examples, FAQ figures, `example` lines) was recomputed by an independent
Python script in the scratchpad (no app imports; run via the Python 3.12 interpreter path noted
above) — this caught one real error before shipping: a watch-out item claimed "two values of 1 and
2 differ by 100%," but the actual percent *difference* for 1 and 2 is 66.67% (100% would be the
answer for 1 and 3 instead); fixed to use 1 and 3. `npm test` 288/288 (up from 278 after run 1's
first commit), snapshot diff is pure additions (0 changes to any existing entry, confirmed with
`git diff --stat`). `npm run build` passes, 87 static pages (was 81: +5 calculator pages, +1
category page). `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`
passes. `KNOWN_NON_FINITE` entries added for the 3 calculators whose edge case (every input at its
`min`, 0 where unset) hits a legitimate divide-by-zero: `percent-change-calculator`
(`percentChange`), `percent-difference-calculator` (`percentDifference`), `ratio-calculator` (`d`).
`percentage-calculator` and `fraction-calculator` needed no whitelist — their `mode`/`operator`
menus were given an explicit `min` landing on a divide-safe branch, so even the edge case resolves
to a finite number. Alias/related/id collision check run programmatically across all 59 calculators:
no new collisions (the one pre-existing alias collision, "house loan emi calculator" on
mortgage-calculator/emi-calculator, predates this run). All 5 pages + `/categories/math` + the
sitemap spot-checked on a local dev server (H1, every v2 section id, 2 JSON-LD blocks, widget
mount, the rendered example line, and the orange category accent color — confirmed the `#28A745`
seen in each page's HTML is the universal green "how-to-use" step-number styling, not the category
accent, which is correctly `#FF8A00` for math), then the server was killed and port 3000 confirmed
free. References fetched directly, all loaded successfully, nothing failed: OpenStax Prealgebra 2e
§6.1/§6.2/§4.1/§4.2/§4.5/§6.5, Wolfram MathWorld (Percent/Fraction/Ratio), and a North Carolina
State University / Advanced Instructional Systems physics lab manual for percent error vs. percent
difference. PR #15 opened as draft early (before the first calculator was built), updated with the
full run-1 summary, and taken off draft via `gh pr ready 15` once everything above passed.

**Lessons for run 2 and beyond:** per-calculator commits are straightforward when the whole file is
new (as here) — write the full category file once, then reconstruct each commit's prefix
programmatically (a small script slicing the array by calculator boundaries) rather than retyping,
running `npm run test:update` + `npm test` after each slice. For a wave that touches only new
files, there is no need to fall back to the "bundle into one commit" exception batches 1-5 needed.

**2026-10-21 — step 40, Wave 1: math, run 2/~6 (5 new calculators).** Branch
`step/40-wave-1-math-run-2` from `origin/master`, PR #16 opened as draft before the first
calculator was built. Added 5 calculators to the existing `math` category
(`data/calculators/math.ts`) and appended each id to `calculatorOrder`
(`data/calculators/index.ts`):

- **average-calculator** (type B): a plain list of numbers has no single invertible equation, and
  the kit has no list/array input (every `CalculatorInput` is one number) — see the kit-gap entry in
  Parked. Uses 4 always-counted value slots plus 4 optional ones behind a disclosure, matching
  `gpa-calculator`'s fixed-slot pattern but with its own convention: since a plain average has no
  weight to zero out the way GPA's credits do, the 4 optional slots are excluded by their array
  index when left at the default of 0 (documented as a watch-out, not hidden). Mean, sum, count, min
  and max are always finite — no `KNOWN_NON_FINITE` entry needed. CompareBars visual shows the
  derived min/average/max rather than the raw slots, which stays meaningful regardless of how many
  optional slots are filled in and sidesteps `CompareBars`'s hard 4-bar cap
  (`components/visuals/CompareBars.tsx` slices to `bars.slice(0, 4)`, found while designing this
  calculator — noted in Parked).
- **weighted-average-calculator** (type B): generalizes `gpa-calculator`'s actual mechanism (value ×
  weight, summed, divided by total weight) from grades/credits to any value/weight pairs — 3
  always-counted pairs plus 3 optional ones, where a weight of 0 is a mathematically correct
  exclusion (unlike average-calculator's workaround). All-weights-zero is a genuine 0÷0;
  `KNOWN_NON_FINITE` registered (`weightedAverage`). Cross-linked with `gpa-calculator` rather than
  duplicating it: GPA is named explicitly in the concept/watch-out copy and in `related` as the
  grades-and-credits special case of this calculator; `gpa-calculator` itself was not edited, since
  this step builds only the calculators it was asked for. Donut visual shows each component's weight
  as a share of the total weight.
- **rounding-calculator** (type B): one value field, a signed `decimalPlaces` field (negative values
  round to tens/hundreds/thousands, the spreadsheet-ROUND sign convention), a direction menu
  (nearest/up/down) and a tie-breaking rule (half away from zero / half to even) used only by
  "nearest." Rounds by shifting the decimal point through exponential-notation text
  (`` `${value}e` `` split/rebuilt at a shifted exponent) rather than multiplying, which exploits
  JS's shortest-round-trip number-to-string conversion to sidestep the classic IEEE 754 binary64
  representation error — verified against the textbook 1.005 case (correctly rounds to 1.01, not the
  naive 1.00) in the Python script. No `KNOWN_NON_FINITE` needed (`direction`/`tieRule` have
  `min: 1`, landing on safe branches at the edge case).
- **scientific-notation-calculator** (type B): a `mode` menu over four related but distinct
  operations (convert a number to scientific notation, convert it back, multiply two
  scientific-notation numbers, divide two). No "a × 10ᵇ" breakdown format exists (the same gap
  `fraction-calculator` hit with "a/b" in run 1), so the coefficient and exponent are separate
  numeric rows; prose shows the real notation. LogScale visual plots the result's decimal value
  against two NIST-sourced benchmarks (a nanometer, the Avogadro constant) — thematically apt, since
  the calculator's whole subject is expressing very large or very small numbers.
- **exponent-calculator** (type A, solver): `result = base^exponent` solves for all three variables
  — an nth root for `base`, a logarithm for `exponent` — with `NaN` for the genuine real-domain
  restrictions (no real nth root of a negative number except an odd integer exponent; no real log of
  a non-positive number or of a base ≤ 0 or = 1), flagged in `watchOut` rather than hidden. The
  forward direction needs no special-casing: JavaScript's `**` operator already matches the chosen
  conventions (0⁰ = 1, negative base with a non-integer exponent = `NaN`). LogScale visual against
  computing/math magnitude benchmarks (2¹⁰ = 1,024, 10⁶, 10⁹).

Verification: 5 calculators committed one at a time, each paired with `npm run test:update` +
`npm test` immediately after. Every number in the copy (worked examples, FAQ figures, `example`
lines, LogScale benchmarks) was recomputed by an independent Python script in the scratchpad
(`verify_run2.py`, no app imports, run via the Python 3.12 interpreter path) before shipping —
0 mismatches, including the float-precision case and every domain-restricted solver branch on
exponent-calculator (checked against a hand-ported copy of the same branching logic run in Node,
which matched the Python results exactly). `npm test` 296/296 (up from 290 after run 1), snapshot
diff is pure additions. `npm run build` passes, 92 static pages (was 87: +5 calculator pages).
`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` passes.
`KNOWN_NON_FINITE` entry added only for `weighted-average-calculator` (`weightedAverage`, all
weights 0); the other 4 new calculators resolve to finite outputs at every one of the spec's three
input sets (default, typical, edge) without needing a NaN allowance, confirmed by `npm test` passing
on the first `test:update` run for each with no failures. Alias/related/id collision check run
programmatically across all 64 calculators: no new collisions (the one pre-existing "house loan emi
calculator" alias collision on mortgage-calculator/emi-calculator predates this run); no broken
`related` ids, no self-references. All 5 pages, `/categories/math` and `sitemap.xml` spot-checked on
a local dev server (H1, all 8 content section ids, 2 JSON-LD blocks, the correct widget mounted per
type), then the server was killed and port 3000 confirmed free. References fetched directly:
OpenStax (Introductory Statistics 2e §2.5, Prealgebra 2e §10.5), Wolfram MathWorld (Arithmetic Mean,
Weighted Mean, Exponent Laws), NIST (CODATA speed of light and Avogadro constant, SI prefixes, binary
prefixes), and D. Goldberg's "What Every Computer Scientist Should Know About Floating-Point
Arithmetic" (hosted by Oracle) — all loaded successfully except
`ieeexplore.ieee.org/document/8766229` (the IEEE 754-2019 standard's own landing page), which
returned no readable content; the Goldberg paper is cited instead for the rounding/float material,
and "IEEE 754" is still named in prose as the standard term, following the precedent set by the
`codes.iccsafe.org` 403 in step 38. PR #16 opened as a draft before the first calculator was built,
updated with the full run-2 summary, and taken off draft via `gh pr ready 16` once everything above
passed.

**2026-10-22 — step 40, Wave 1: math, run 3/~6 (5 new calculators).** Branch
`step/40-wave-1-math-run-3` from `origin/master`, PR #17 opened as draft before the first
calculator was built. Added 5 calculators to the existing `math` category
(`data/calculators/math.ts`) and appended each id to `calculatorOrder`
(`data/calculators/index.ts`):

- **square-root-calculator** (type A, solver): a 2-variable radicand/square-root pair (`r = √x`,
  `x = r²`), simpler than the other solvers since a square root only involves two quantities.
  Negative radicands return no real answer (`NaN`), explained alongside a brief complex-number
  aside. Cross-linked with `exponent-calculator` (a square root is the exponent-1/2 case) and the
  new `cube-root-calculator`, rather than re-teaching fractional exponents. CompareBars visual
  (the number vs its square root).
- **cube-root-calculator** (type A, solver): same 2-variable shape, but `Math.cbrt` has no domain
  restriction at all — every real number, including negatives, has a real cube root, the headline
  differentiator from the square root page. Deliberately uses `Math.cbrt(x)`, not `x ** (1/3)`,
  since JavaScript's `**` returns `NaN` for a negative base with a fractional exponent even though
  the real root exists (verified: `(-8) ** (1/3)` → `NaN`, `Math.cbrt(-8)` → `-2`). CompareBars
  visual (the number vs its cube root).
- **logarithm-calculator** (type A, solver): `log_b(x) = y ⇔ b^y = x` rearranged for all three
  variables, the same inverse relationship as `exponent-calculator` but entered from the
  "base + argument → exponent" direction most log searches want, with its own content (common/
  natural log naming, change-of-base, pH/decibel/earthquake-magnitude real-world uses) rather than
  repeating the exponent page. `solver.outputs` shows the natural and common log of the same
  argument underneath the main result. `KNOWN_NON_FINITE` registered (`result`, `naturalLog`,
  `commonLog`): the edge test's `base = 0, argument = 0` is outside the log domain on every count.
  LogScale visual (the argument on a magnitude scale, with a pH-neutral-water and an
  Avogadro-constant benchmark).
- **factorial-calculator** (type B): not invertible, so no solver. Computes the exact product with
  `BigInt`, so the digit count (`big.toString().length`) and trailing-zero count (Legendre's
  formula) stay exact at any size, while the headline value converts to a `Number` for display —
  the kit's existing `format: 'significant'` already switches to scientific notation past 1e9
  (around 13!), which by itself avoids showing rounded digits as if they were exact. Capped at
  n = 1,000 for instant results; 171! and above overflow a double to `Infinity` (170! is the last
  finite one), documented as expected overflow, not a bug. LogScale visual (`10! = 3,628,800` and
  `52! ≈ 8.0658 × 10⁶⁷`, the number of ways to shuffle a deck — a direct consequence of the
  permutation rule, not a separately-sourced statistic).
- **gcf-calculator** (type B): a "How many numbers?" 2-4 `options` menu, not a 0-means-unused
  sentinel on the optional slots — the exact lesson the run-2 `average-calculator` fix established,
  applied here from the start. `compute()` reuses the `gcd()` helper already shared by
  `fraction-calculator`/`ratio-calculator`, so all three pages agree on the same
  `GCF(0, 0) = 1` convention. `GCF(0, n) = n` and `GCF(-12, 18) = 6` fall out of the existing
  `gcd()` behavior with no extra code; both documented in `watchOut`. CompareBars visual (smallest
  number / largest number / GCF — derived summary values, correct regardless of how many of the 4
  slots are in use, the same `CompareBars`-cap workaround `average-calculator` used).

Verification: every number in the copy (worked examples, FAQ figures, `example` lines, LogScale
benchmarks) was recomputed twice — an independent Python script in the scratchpad (no app imports)
and a standalone Node one-liner for JS-specific behaviors Python doesn't share (`(-8) ** (1/3)` vs
`Math.cbrt`, `BigInt` digit counts, `Number(BigInt)` overflow at 171!) — 0 mismatches against the
app's own `compute()`/solver output. `npm test` 310/310 (up from 296), `npm run build` (97 static
pages, up from 92), `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern
".claude/**"` all pass. Alias/related/id collision check run programmatically across all 69
calculators: no new collisions (the pre-existing "house loan emi calculator" alias collision
predates this run); no broken `related` ids, no self-references. All 5 pages, `/categories/math`
and `sitemap.xml` spot-checked on a local dev server (H1, every v2 section id, 2 JSON-LD blocks,
`solver-*` fields for the 3 type-A calculators, `breakdown-*` for factorial and GCF, and the
rendered `example` line matched word-for-word), then the server was killed and port 3000 confirmed
free. References fetched directly: OpenStax (Prealgebra 2e §5.7 square roots, §10.6 GCF via its
plain-number GCF(24,36)=12 example; Elementary Algebra 2e §9.7 real cube roots of negatives;
College Algebra 2e §6.3 logarithms), NIST DLMF (§4.2 Logarithm/Exponential/Powers, §5.2 Gamma
Function), and Wolfram MathWorld (Square Root, Cube Root, Logarithm, Factorial, Greatest Common
Divisor) — all loaded successfully, 0 reference failures (two initial OpenStax section-number
guesses 404'd before the correct URLs were found via search and cited instead). PR #17 opened as a
draft before the first calculator was built, updated with the full run-3 summary, and taken off
draft via `gh pr ready 17` once everything above passed.

**2026-10-22 — fix on PR #17: gcf-calculator mishandled GCF(0, 0).** A pre-merge review caught that
`gcf-calculator`'s `compute()` reused the `gcd()` helper shared by `fraction-calculator` and
`ratio-calculator`, whose `return a || 1` fallback (needed so fraction/ratio simplification never
divides by zero) is wrong for an actual GCF: `GCF(0, 0, 12)` computed as `gcd(gcd(0,0),12)` =
`gcd(1,12)` = `1` instead of the correct `12`, and `GCF(0, 0)` reported `1` instead of the standard
number-theory convention of `0`. Fixed by adding `gcdRaw()` (no fallback) for `gcf-calculator`
only — `gcd()` and the other two calculators' behavior are untouched, confirmed byte-identical.
Rewrote the GCF(0,0) watch-out item, added an FAQ entry, and added a third reference (Clark,
*Elementary Number Theory*, Mathematics LibreTexts §6: "We define gcd(0,0) = 0") since neither
OpenStax nor MathWorld state the zero case. Verified `GCF(0,0,12)=12`, `GCF(0,18)=18`,
`GCF(0,0)=0`, `GCF(0,18,24)=6` (a zero among others doesn't change the result — only all-zero
does), negatives and non-integer rounding, independently in Python and Node against the app's own
`compute()`. Only `gcf-calculator`'s own edge snapshot entry changed (`gcf: 1 → 0`); `npm test`
310/310, `npm run build` and lint pass. See `mdFiles/steps/40-wave-1-math.md`'s "Fix, 2026-10-22"
section for the full writeup.

**2026-10-22 — step 40, Wave 1: math, run 4/~6 (5 new calculators).** Branch
`step/40-wave-1-math-run-4` from `origin/master`, PR #18 opened as draft before the first
calculator was built. Added 5 calculators to the existing `math` category
(`data/calculators/math.ts`) and appended each id to `calculatorOrder` (`data/calculators/index.ts`):

- **lcm-calculator** (type B): same "How many numbers?" 2-4 pattern as `gcf-calculator`, with a new
  `lcmPair` helper (`LCM(a,b) = |a×b| ÷ gcd(a,b)`, reusing `gcdRaw`). `LCM(n,0)=0` for nonzero n by
  a widely used convention, but `LCM(0,0)` is left undefined (`NaN`) rather than 0 — a real bug
  caught and fixed mid-run when fetching references showed GCF(0,0)=0 and LCM(0,0)="undefined" are
  different conventions, not the same one; see the "Fix" note in the step file. `KNOWN_NON_FINITE`
  registered. CompareBars visual (smallest/largest number/LCM).
- **prime-factorization-calculator** (type B): trial division, capped at 10¹² for instant results.
  The kit has no list input and `compute()` must return plain numbers, so the factorization uses 6
  fixed prime/exponent slot pairs — but never silently truncates: `distinctPrimeFactors` and an
  `extraDistinctPrimeFactors` counter are always the true, complete figures regardless of how many
  of the 6 slots are shown (0 has no factorization, 1 has the legitimate empty one). CompareBars
  visual (your number / smallest prime factor / largest prime factor).
- **long-division-calculator** (type B): quotient and remainder, not invertible, so no solver.
  Picks and documents a specific remainder sign convention — `0 ≤ remainder < |divisor|` regardless
  of either operand's sign (Euclidean division), not the "truncate toward zero" convention several
  languages default to — verified directly against the deployed JS `%` operator's own sign
  behavior, not just assumed. `KNOWN_NON_FINITE` registered for divisor 0. CompareBars visual
  (dividend vs divisor).
- **quadratic-formula-calculator** (type B): `ax²+bx+c=0` has two simultaneous roots from one input
  triple, so not a solver (same non-invertibility reasoning as `percent-difference-calculator`).
  Handles `a=0` (linear), discriminant `>0`/`=0`/`<0` (two real roots / one repeated root / a real
  + imaginary pair, never a bare `NaN`), and floating-point near-zero discriminants via a
  magnitude-relative tolerance. Default coefficients were chosen to survive the automated
  "typical" input set's ×1.5-and-round scaling without flipping the discriminant's sign.
  `KNOWN_NON_FINITE` registered for the `a=b=c=0` degenerate case. CompareBars visual (Root 1 vs
  Root 2).
- **pythagorean-theorem-calculator** (type A, solver): `a²+b²=c²`, a clean 3-variable invertible
  relationship. Solving for a leg returns `NaN` when the hypotenuse does not strictly exceed the
  other leg (an impossible triangle), per the plan's explicit requirement. `solver.outputs` adds
  the triangle's area as a bonus figure. No `KNOWN_NON_FINITE` entry needed (the forward-only
  automated edge case, legs at 0, is finite). CompareBars visual (leg a / leg b / hypotenuse).

Verification: every number in the copy was recomputed independently in `verify_run4.py`
(scratchpad, no app imports) — 0 mismatches after fixing one transcription error in the script
itself (not the app) — and cross-checked directly against the app's own `compute()` via a Node
one-liner for every default, a complex-root case, a repeated-root case, the linear and degenerate
quadratic cases, the prime-factorization `n=0`/`n=1`/over-cap/negative cases, and both
divide-by-zero cases. `npm test` 318/318 (up from 310), `npm run build` (102 static pages, up from
97), lint clean. All 5 pages, `/categories/math` and `sitemap.xml` spot-checked on a local dev
server (H1, every v2 section id, 2 JSON-LD blocks, the correct widget mounted, `example` lines
matched word-for-word, plus a `?a=1&b=2&c=5` share-link confirming the complex-root rows render
instead of a bare NaN), then the server was killed and port 3000 confirmed free. Alias/related/id
collision check across all 74 calculators: no new collisions. References fetched directly, with 6
of 13 needing a wrong initial section-number guess corrected via search before citing (OpenStax
chapter/section numbers for LCM/prime factorization, long division, the quadratic formula and the
Pythagorean theorem; a Clark LibreTexts section number) — 0 failures in the final list; one new
source (Mount Royal University's *Abstract Algebra I*, Mathematics LibreTexts §1.2) was added
specifically because neither MathWorld nor the Clark text state the LCM-with-zero convention. PR
#18 opened as a draft before the first calculator was built, updated with the full run-4 summary,
and taken off draft via `gh pr ready 18` once everything above passed. See
`mdFiles/steps/40-wave-1-math.md`'s "Type decisions (run 4)" and "Fix, 2026-10-22: lcm-calculator"
sections for the full writeup. Next session picks up run 5: triangle, circle, area, volume,
surface area.

**2026-10-22 — fix on PR #18: lcm-calculator silently showed a wrong digit above
Number.MAX_SAFE_INTEGER.** A coordinator review after the PR was marked ready caught that
`lcm-calculator`'s `lcmPair` did `(a * b) / gcdRaw(a, b)` with no overflow check. Chained over 4
pairwise-coprime numbers (`LCM(9973, 9967, 9949, 9941)`, all four prime), the true result
(9,831,047,217,181,019) exceeds `2^53 − 1`, and the app showed 9,831,047,217,181,020 instead — a
wrong digit, not a `NaN`. Fixed by dividing before multiplying and refusing (`NaN`) whenever an
input or the result itself isn't `Number.isSafeInteger`. Audited `gcf-calculator` (inputs can be
already-imprecise even though GCF itself never grows past the smallest input) and
`long-division-calculator` (dividend/divisor checked before dividing; quotient can't exceed the
dividend's magnitude) for the same class of bug and added the same guard to both.
`prime-factorization-calculator`'s existing 1e12 cap was confirmed already well inside the safe
range, no change needed (the kit's `CalculatorInput` type has no `max` field to additionally
enforce this at the input level). None of the three fixes changed the automated snapshot (the
default/typical/edge sets stay well within the safe range); added a watch-out + FAQ entry to each
affected calculator and a new overflow-audit section to `verify_run4.py` using Python's exact
bignums to confirm both the true value and the guard's threshold. `npm test` 318/318 (unchanged),
`npm run build` and lint pass. See `mdFiles/steps/40-wave-1-math.md`'s final "Fix, 2026-10-22"
section for the full writeup.

**2026-10-22 — step 40, Wave 1: math, run 5/~6 (5 new calculators).** Branch
`step/40-wave-1-math-run-5` from `origin/master`, PR #19 opened as draft before the first
calculator was built. Added 5 calculators to the existing `math` category
(`data/calculators/math.ts`) and appended each id to `calculatorOrder` (`data/calculators/index.ts`):

- **triangle-calculator** (type B): a `mode` menu for SSS / SAS / ASA sharing one 6-field input set
  (three sides, three angles), since the three cases are distinct closed-form procedures, not one
  invertible equation. All three converge on the same final step — get all three sides, then
  recompute all three angles with the law of cosines and the area with Heron's formula, so the
  three paths stay internally consistent. The ambiguous SSA case (two sides and a non-included
  angle, which can match 0, 1 or 2 triangles) is explicitly not supported — flagged in `watchOut`,
  not guessed at. Invalid input (triangle inequality failure, a non-positive side, an angle outside
  (0°, 180°), or two ASA angles summing to ≥ 180°) returns `NaN` on every output. `KNOWN_NON_FINITE`
  registered (the automated edge case is SSS with all three sides at 0). CompareBars visual (side a
  / side b / side c).
- **circle-calculator** (type A, solver): radius ⟷ diameter, a trivial 2-variable invertible pair,
  with circumference and area as `solver.outputs` rather than solver variables — a circle has only
  one degree of freedom, so a 4-variable solver (radius/diameter/circumference/area) would need the
  widget's "N−1 known fields" model to somehow treat 3 user-typed numbers as simultaneously
  consistent, which they usually would not be. Manual back-solve formulas (from a known
  circumference or area) are given in the formula section and FAQ instead of wired into the live
  widget — a documented scope limit, not a fake solve. CompareBars visual (radius vs diameter).
- **area-calculator** (type B): a `mode` shape menu (square, rectangle, triangle, circle,
  trapezoid) over a shared `dim1`/`dim2`/`dim3` length-input pool, each shape reading a different,
  non-interchangeable formula. Deliberately does not also report perimeter, since the triangle mode
  only takes a base and a height, not all three sides — `watchOut` names the limit and cross-links
  to `triangle-calculator`. LogScale visual against three cited everyday areas (an ISO 216 A4 sheet,
  a FIBA-regulation basketball court, a FIFA-recommended soccer pitch).
- **volume-calculator** (type B): the same shape-mode-menu pattern one dimension up — cube,
  rectangular box, cylinder, sphere, cone — over the same `dim1`/`dim2`/`dim3` inputs (reused as
  radius/height or length/width/height depending on shape). LogScale visual against a drink can, a
  US gallon (3.785411784 L, exact per NIST), and a World Aquatics/FINA-minimum Olympic pool (2,500 m³).
- **surface-area-calculator** (type B): the same five solids and the same `dim1`/`dim2`/`dim3`
  inputs as `volume-calculator`, kept in lockstep so the two pages share one mental model, but each
  solid's surface-area formula instead of its volume formula. The cone figure is explicitly the
  TOTAL surface area (base + lateral, πr² + πr√(r²+h²)) — called out against the lateral-only
  convention MathWorld's Cone page uses, since OpenStax's own volume/surface-area section states
  outright that it does not cover a cone's surface area at all. LogScale visual reusing
  area-calculator's same three benchmarks.

Verification: every number in the copy (worked examples, FAQ figures, `example` lines, LogScale
benchmarks) was recomputed independently in `verify_run5.mjs` (scratchpad, plain JavaScript rather
than Python this run, so the triangle trig matches the app's own `Math`-object floating-point
behavior exactly) — 0 mismatches — and cross-checked a second time directly against the app's own
`compute()` via a Node one-liner, covering every shape/mode combination across all 5 calculators,
the SSS/SAS/ASA triangle cases, the invalid-triangle case (confirms `NaN` on every output, not a
wrong number), and the circle default/worked-example pair. `npm test` 326/326 (up from 318),
`npm run build` (107 static pages, up from 102), lint clean. Data-integrity check run
programmatically for all 5 new calculators: 0 broken `related` ids, 0 self-references, 0 duplicate
aliases, all 79 ids unique. All 5 pages, `/categories/math` and `sitemap.xml` spot-checked on a
local dev server (H1, every v2 section id, one JSON-LD `<script>` tag per page parsed to confirm
all 4 node types, the correct widget mounted, a `?mode=2&sideA=8&sideB=10&angleC=60` share-link on
triangle-calculator returning 200), then the server was killed and port 3000 confirmed free.
References fetched directly and each confirmed to state the exact formula claimed before citing:
OpenStax Algebra and Trigonometry 2e §10.1/§10.2 (law of sines/cosines, Heron's formula), OpenStax
Prealgebra 2e §9.4/§9.5/§9.6 (rectangle/triangle/trapezoid area, circle circumference/area, and
volume/surface area for all five solids), and Wolfram MathWorld's Circle, Heron's Formula, Law of
Cosines, Law of Sines and Cone pages. LogScale benchmark facts (FIBA court, ISO 216 A4, the exact
NIST gallon already asserted in `lib/units.ts`, the World Aquatics Olympic-pool minimum) were
verified via search/fetch but, following the precedent that force-calculator's own chart benchmarks
were never individually cited, are not added to the formal `content.references` list — that list is
reserved for the calculator's core math sources. PR #19 opened as a draft before the first
calculator was built, updated with the full run-5 summary, and taken off draft via `gh pr ready 19`
once everything above passed. See `mdFiles/steps/40-wave-1-math.md`'s "Type decisions (run 5)" and
"Verification" sections for the full writeup. Next session picks up run 6: slope, distance between
two points, midpoint, scientific-calculator.

## Pending on the user — not code

- ~~**Cloudflare apex → www 301 (from step 01).**~~ **DONE 2026-10-19** — Redirect Rule added by the user; verified `http://` and `https://dailycalculations.com/<path>?<query>` → 301 to `https://www.dailycalculations.com/<path>?<query>`, www serves 200.
  Cloudflare dashboard → the `dailycalculations.com` zone → **Rules → Redirect Rules** → new rule:
  *If hostname equals `dailycalculations.com` → Static redirect to `https://www.dailycalculations.com`,
  preserve path and query string, status **301**.*
  Do not attempt this in `next.config.ts` — those redirects run inside the Worker, after the request
  has already been served on the wrong hostname.

---

## Parked

Things noticed but deliberately out of scope. Add here instead of fixing mid-step.

- **No list/array input in the calculator kit** (found in step 40, run 2): every `CalculatorInput` is
  a single number, so a calculator that conceptually wants "a list of numbers" (average, and any
  future stats calculator needing one) has to fall back to a fixed number of numbered slots, as
  `gpa-calculator` already did for courses. `average-calculator` and `weighted-average-calculator`
  both do this (8 and 12 slots respectively, half behind an optional disclosure). The initial version
  of `average-calculator` tried to extend GPA's "0 excludes a slot" convention to a plain average,
  which is wrong there: a weight of 0 genuinely removes a component from a weighted sum, but a value
  of 0 is a real data point in a plain list (a test score of 0, say), so silently dropping it is a
  wrong-answer trap, not a convenience. Fixed in the same PR (#16) by adding an explicit
  **"How many numbers?" options field (2-8)**, with `compute()` averaging exactly the first N slots
  in order, zeros included — this is the stopgap pattern worth reusing for any future fixed-slot
  "list" input: a count selector plus array slicing, never an implicit sentinel value, whenever 0 (or
  any other value) is a legitimate data point rather than a true weight. A real list input (add/remove
  rows) would still be a `components/` + `lib/breakdown.ts` change worth its own step once enough
  calculators need one — Wave 1's statistics category (mean/median/mode, standard deviation,
  variance, etc., all genuinely list-based) will hit the same wall repeatedly.
  **Second instance (step 40, run 4):** `prime-factorization-calculator` hit the same wall with a
  variable-length prime/exponent factorization. Since a factor count can't be sliced by a
  user-chosen "how many," the fix here was a fixed 6 slot pairs plus an honest
  `extraDistinctPrimeFactors` counter (and true, non-derived `distinctPrimeFactors`/
  `smallestPrimeFactor`/`largestPrimeFactor` figures) so the rare case of more factors than slots is
  reported, not silently truncated — a second reusable pattern (count the overflow instead of
  hiding it) worth applying to any future unboundedly-long-list calculator in the same kit gap.
- **`CompareBars` silently caps at 4 bars** (`components/visuals/CompareBars.tsx`: `bars.slice(0, 4)`,
  found in step 40, run 2 while designing `average-calculator`): the prop comment already says "2-4
  bars," so this is documented behavior, not a bug, but it means a visual cannot show more than 4
  individual values side by side. `average-calculator` works around it by charting the derived
  min/average/max (3 bars) instead of the raw value slots, which stays correct regardless of how many
  of the 8 slots are in use.

- ~~**`pregnancy-due-date-calculator` has a hardcoded "today"** (`new Date(2026, 5, 17)` in `compute`).
  Gestational age and days remaining are frozen at 2026-06-17: defaults (LMP 2026-03-01) give
  `gestationalWeeks` 15.43 / `daysRemaining` 172 on any date; LMP 2027-04-10 gives
  `gestationalDays` 0 / `daysRemaining` 591. Needs a real current date (client-side, after hydration,
  since pages are force-static). Found in step 17; the snapshot pins today's behavior.~~
  **Fixed 2026-10-13** on fix/pregnancy-today
- **`bmi-calculator` returns `NaN` at its own `min`** (`height` min is 0 → `bmi` = 0/0). Either
  `min` > 0 or a guard. Recorded in `KNOWN_NON_FINITE` in `data/calculators.spec.ts`. Found in step 17.
- ~~**`mortgage-calculator` input labelled "Loan amount" is really the home price**: `compute`
  subtracts `downPayment` from it (350,000 − 70,000 → principal 280,000), and the example line says
  "a $350,000 home". Relabel (copy only) during the Batch 1 v2 conversion. Found in step 17.~~
  **Fixed in step 35** (label "Home price"; input id unchanged).
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
- ~~**`common.tools` has no ICU plural**~~ **Fixed 2026-10-12** (merged to master with the v2 preview) — `"{count} tools"` renders **"1 tools"** on the `education`
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
- **`npm run lint` fails on `.open-next/` build output** (115 errors, all inside the OpenNext
  artifact folder left by `npx opennextjs-cloudflare build`). Source code is clean with
  `npm run lint -- --ignore-pattern ".open-next/**"`. Fix: add that ignore pattern to the `lint`
  script. Found 2026-10-12 on branch `preview/physics-force-calculator`.
- ~~**`.claude*` is gitignored**~~ **Done 2026-10-12**: all of `.claude/` is tracked (shared
  `settings.json`, skills, agents). Only `.claude/settings.local.json` is ignored.
- **Preview merged to `master` 2026-10-12** (fast-forward, commits `f17b7de` + `534b8a0`; not deployed. The user will deploy manually after the full rollout). Was branch `preview/physics-force-calculator`: a demo of the
  `mdFiles/omni-strategy.md` v2 template. It adds `force-calculator`, a `physics` category,
  `lib/units.ts`, `components/SolverCalculator.tsx` (solve for any field, unit switching, share
  link, copy, reset, log-scale benchmarks), and the TOC / concept / references / byline sections.
  It also fixes the `common.tools` ICU plural ("1 tools"). Spec: `mdFiles/calculator-template-v2.md`.
  **Next:** fold `mdFiles/calculator-rollout-plan.md` (E1–E7, batches 1–5, waves 1–4) into the step
  index once the user settles its three open decisions (pace, step-11 gate, sector order).
  **Workflow (user decision, changed 2026-10-13, see D11):** one batch agent at a time pushes a
  branch + opens a PR, the main session merges each passing PR without asking, and the user never merges. No Cloudflare changes and no deploys until the user deploys
  manually after the rollout.
- **`force-calculator` scale tick labels sit at even spacing, not at their log positions.** The
  range is 10^-2 to 10^9, so "1 N" belongs at 18%, not 25%, and "1 kN" at 45%, not 50%. The
  benchmarks and marker are placed correctly. Kept as-is in step 32 because the force output had
  to stay visually identical. The fix is evenly spaced exponents (e.g. 10^-2 … 10^10 in steps of 3)
  or positioned ticks in `LogScale`.
- **Superseded step-33 attempt to clean up** (found in step 33): branch `step/33-breakdown-widget`
  (local + origin), draft PR #6, and the worktree `.claude/worktrees/agent-a0c418cb814f507e7`.
  Close #6 and remove the worktree (`git worktree remove`) once PR #7 is merged. Until then,
  `npm run lint` also lints the worktree's files and fails on them: use
  `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`.
- ~~**Currency symbol differs between the widgets**~~ — **resolved 2026-10-20** (`fix/currency-symbol`): the `currency` unit label in `lib/units.ts` now comes from `currencySymbol()` in `lib/calculator.ts`, the single source step 18 makes region-aware.
- **No growth-curve visual in the kit** (found in step 35): the rollout plan asks for a growth
  curve (contributions vs interest over time) on compound-interest and investment. Those use a
  Donut for now. Add a `GrowthCurve` (stacked area by year) to `components/visuals/` in its own
  step, then switch both calculators to it.
- **No "tier bar" visual for a user-editable rate threshold** (found in step 38, batch 4):
  electricity-bill's plan calls for a bar showing the two pricing tiers, but every kit visual with
  bands (`RangeBar`) takes its bands as literal numbers fixed at config time, not from an input the
  reader can change (`tieredThreshold`). Using CompareBars (energy charge vs. total bill) instead.
  A genuinely reactive tier visual would need a new component that reads band edges from `all`,
  not from static config — worth it only if more tiered-rate calculators are added later.
- **No top-down floor-plan SVG in the kit** (found in step 38, batch 4): furniture-fit's plan calls
  for an actual floor-plan illustration (room outline, furniture rectangle, clearance strip). Used
  `RangeBar` on the derived `tightestMargin` instead (bands: won't fit / tight / comfortable /
  spacious) — arguably a better fit for "does it fit" than a literal drawing would have been, but
  it is still a stand-in for the plan's visual, not the visual itself.
- **`codes.iccsafe.org` 403s to fetches** (found in step 38, batch 4, same symptom as CFPB in run 1):
  the ICC's own free code viewer blocks automated fetches. `up.codes` (a free, widely-used code-text
  mirror) was used instead for both IRC citations on furniture-fit-calculator. Revisit if a cleaner
  primary-source route turns up.
- `mdFiles/instructions.md` (§ file table, ~line 527) still lists `components/PaycheckCalculator.tsx`,
  deleted in step 35. Paycheck's US tax figures now live in `data/calculators/finance.ts`
  (`PAYROLL_2026`) and need a yearly update each October/November (IRS Rev. Proc., SSA wage base).
- Baidu SEO for mainland China. Needs an ICP licence and separate tooling; Cloudflare is unreliable
  behind the GFW. The `CN` region profile is for Chinese speakers elsewhere. (§3.5)
- ~~The four alias stubs return 307~~ — **done in step 03.** They are 301s in `middleware.ts` now
  and the stub page files are deleted.
- **Kit gaps from step 36** (nearest kit component used instead): a stacked bar (sales tax: Donut
  used), per-person chips (tip: Donut with the per-person share in the center), a strikethrough price
  card (discount: CompareBars), a thermometer (fahrenheit-to-celsius: RangeBar) and a common-values
  table (gallons, miles, pounds: LogScale with benchmarks). Add to `components/visuals/` in their own
  step if wanted.
- **Sub-cent money in the solver** (found in step 36): `SolverCalculator` and the kit round currency
  to cents, so a $0.2496 unit price shows as $0.25. Unit price works around it with per-100 outputs.
  Step 18 (region formatting) could show 3–4 decimals for money below $1.
- **Duplicate alias** (found in step 36): `house loan emi calculator` is on both `emi-calculator` and
  `mortgage-calculator`. Pick one.
- **Kit and widget gaps from step 38** (nearest kit component used instead): a cost-per-mile chip
  (gas-cost: CompareBars one way vs round trip). **Widget gaps:** the solver prints a `fuelPrice`
  value as "3.75 $/gal (US)" (significant figures, symbol after) rather than "$3.75/gal"; type-B
  outputs have no unit menu, so fuel-cost / ev-charging / commute results stay per 100 **miles** and
  range in miles when inputs are metric, and commute's wear allowance stays per mile (no money-per-
  distance dimension); ev-charging's battery has no unit menu (the `energy` menu offers J, cal, BTU…)
  and its yearly savings are fixed at 12,000 miles inside `compute()`; ev-charging charges to 100%
  only (no target-charge input). Changing those needs `compute()` changes (snapshot) or widget work.
- **Kit and widget gaps from step 38 run 2** (nearest kit component used instead): bags-needed chips
  (concrete: CompareBars 80 lb vs 60 lb bags), a can-count row (paint: CompareBars gallons needed vs.
  whole cans to buy), a grid illustration (tile: CompareBars exact tiles vs. with waste), a roll-count
  row (wallpaper: CompareBars exact rolls vs. rolls to buy). **Reference gap:** the Tile Council of
  North America's specific waste-factor percentages by layout (10%/15%/20%) could not be confirmed
  from a free source — `tcnatile.com/faqs` and the TCNA Handbook PDF both 404'd, and the Handbook is a
  $55 paid publication. `tile-calculator`'s copy cites TCNA generally and the Ceramic Tile Education
  Foundation, and keeps the 10% default worded as "a common starting point" rather than a cited exact
  figure. Revisit with a TCNA Handbook copy or another primary source if one turns up.
- **Kit and widget gaps from step 37** (nearest kit component used instead): a three-tier bar
  (calorie: CompareBars), a stacked bar (TDEE: Donut), a glasses-per-day row (water: CompareBars vs
  NASEM), a splits / race-predictions table (running pace: CompareBars of Riegel times).
  **No mm:ss / h:mm:ss formatting**: pace and times show decimal minutes (8.047 min/mi, not 8:03).
  **No combined ft + in height input** (BMI, calorie, TDEE take one unit). BMI's healthy-range
  outputs are fixed to lb until the region step picks units.
  **No date picker**: pregnancy-due-date still takes year / month / day number fields (the rollout
  plan adds a picker with date-difference in batch 5). Its cycle-length adjustment moves the due and
  conception dates only; weeks pregnant are counted from the LMP, as before.
