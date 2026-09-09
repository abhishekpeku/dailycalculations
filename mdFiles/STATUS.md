# Development status

**Single source of truth for what is done, what is next, and every decision made.**
Read this first in any new session. Update it at the end of every step.

Spec: `mdFiles/instructions.md` (§ references below point into it).
Protocol: `CLAUDE.md` → "Working protocol".
Step files: `mdFiles/steps/NN-<name>.md`. All Markdown lives in `mdFiles/` — see CLAUDE.md.

Last updated: 2026-09-10 · Current step: **01** · Steps done: **0 / 28**

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

### Phase A — Foundation (correctness; nothing else works until these land)

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 01 | Domain + `lib/site.ts` | **TODO** | Create `lib/site.ts` exporting `SITE_URL`. Replace the hardcoded domain in `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts` and every `generateMetadata`. Add the Cloudflare apex→www redirect rule. | §0, D1 |
| 02 | English-only migration | TODO | `routing.locales = ['en']`, `localePrefix: 'as-needed'`. Delete `LanguageSwitcher` from `Header`. Update every `generateStaticParams` to drop the locale loop. Add 301s `/en/*` → `/*` in `middleware.ts`. Verify `app/page.tsx` no longer needs its `redirect('/en')`. | D2, D3, D4 |
| 03 | Canonicals on every page | TODO | `buildCanonical(path)` in `lib/seo.ts`. Apply to **every** `generateMetadata` — including `calculators/[slug]` and `categories/[category]`, which currently have none. Remove the locale-blind canonicals in `about`/`contact`/`privacy-policy`/`terms` and the bare-root one on the homepage. | §2.1, D5 |
| 04 | Sitemap + robots rewrite | TODO | Add `updatedAt: string` to `CalculatorConfig` and populate all 53. Rewrite `app/sitemap.ts`: one entry per path, no locale loops, real `lastModified`, `priority` 0.8 for calculators / 0.6 home / 0.5 rest. Point `robots.ts` at `SITE_URL`. | §2.4 |

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

_(empty — first entry goes here)_

---

## Parked

Things noticed but deliberately out of scope. Add here instead of fixing mid-step.

- `app/[locale]/layout.tsx` exports static `metadata` *and* pages export `generateMetadata` with
  overlapping OG/Twitter blocks — the same title string lives in four places. Collapse into
  `lib/seo.ts` helpers. (§4.6)
- Decide whether the `[locale]` directory segment is worth keeping at all once English-only settles.
  Keeping it costs nothing and preserves the option to re-add languages; revisit only if it causes
  friction.
- `graphing calculator` — dropped from the keywords array in step 09; genuinely hard to build and
  not worth it. Do not resurrect without a reason. (§1.6)
- Baidu SEO for mainland China. Needs an ICP licence and separate tooling; Cloudflare is unreliable
  behind the GFW. The `CN` region profile is for Chinese speakers elsewhere. (§3.5)
