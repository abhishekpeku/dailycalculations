# Daily Calculations — SEO, Deep-Linking, Geo-Localisation & Format Plan

> **Status:** Planning document. Nothing here is implemented yet.
> **Scope:** (1) calculator keyword/alias taxonomy + category restructure, (2) deep-link ranking so
> Google shows the *calculator* not the homepage, (3) country-aware site versions for US, UK,
> Europe, India, UAE, Thailand, Indonesia, China and Australia, (4) analysis of the current site
> format, (5) analysis of the supplied trending queries, including the "IP" set.
> **Stack as built:** Next.js 16.2 (App Router, Turbopack) + React 19 + next-intl 4.13 +
> Tailwind 3.4, deployed to Cloudflare Workers via `@opennextjs/cloudflare`. 53 calculators,
> 11 categories, 5 locales.

---

## ⚠ Revision — 2026-09-10

Two decisions were taken after this document was first drafted. They **supersede** parts of it.
`mdFiles/STATUS.md` (decisions D1-D8) is authoritative; this file is the rationale.

1. **Canonical domain is `https://www.dailycalculations.com`.** Both it and the apex resolve; the
   apex 301s to `www`. The `.app` value is stale. → §0 is settled.
2. **The site is English-only.** `de`/`fr`/`es`/`it` are removed from routing, and English moves
   from `/en/…` to the root. Country-based currency and unit differences (§3) are unaffected — they
   were always a cookie layer, never a URL layer.

**What that changes below:**

| Section | Status |
|---|---|
| §2.1 canonicals | Still required, but simpler — a plain `SITE_URL + path`, no locale. |
| §2.2 hreflang | **Obsolete.** One language needs no hreflang and no `x-default`. |
| §2.4 sitemap | Both bugs still real; the fix is simpler — one entry per path, no `alternates`, ~72 entries instead of ~350. |
| §2.6 duplicate content | **Resolved by removal** rather than by translation. This was the largest single ranking blocker. |
| §3.5 language coverage | The TH/ID/CN "add `th`/`id`/`zh`" advice no longer applies. Those regions get correct currency, units and dates on an English page. |
| §6 execution order | **Superseded by `mdFiles/STATUS.md`**, which re-sequences it into 28 self-contained steps. |

Everything else — the alias taxonomy (§1), structured data (§2.3), the region profiles (§3.5),
the page-depth restructure (§4.2) and the trending-query analysis (§5) — is unchanged.

---

## 0. Blocking decision before any SEO work starts

The codebase declares **two different production domains**:

| File | Value |
|---|---|
| `lib/seo.ts:5` | `https://dailycalculations.app` |
| `app/sitemap.ts:5` | `https://www.dailycalculations.com` |
| `app/robots.ts:9` | `https://www.dailycalculations.com` |

Every canonical tag, OG URL and JSON-LD `url` is built from `lib/seo.ts`, so today the site tells
Google *"the real version of this page lives on `dailycalculations.app`"* while the sitemap submits
`dailycalculations.com` URLs. If both resolve, authority splits across two hosts. If `.app` does not
resolve, **every canonical on the site points at a dead URL** — which alone is enough to suppress
deep-link ranking entirely.

**Action (gates Parts 1–3):**
1. Pick the one live domain, including the `www` / non-`www` decision.
2. Delete the hardcoded strings. Single source of truth:
   ```ts
   // lib/site.ts
   export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dailycalculations.com';
   ```
3. Import it in `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts` and every `generateMetadata`.
4. Add a Cloudflare redirect rule: all other hostnames → 301 → the chosen one.

---

## 1. Calculator taxonomy — categories, aliases, clusters

### 1.1 Category audit — nothing is orphaned, but plenty is mis-filed

All 53 calculators do carry a valid `category`, and no category is empty. The reason things *feel*
uncategorised is that several sit in a category nobody would look in:

| id | current category | problem |
|---|---|---|
| `emi-calculator` | `shopping` | It is a loan calculator. Belongs with mortgage/loan. |
| `visa-stay-days-calculator` | `finance` | Nothing financial about it — it counts Schengen days. |
| `travel-budget-calculator` | `finance` | Travel intent, not personal finance. |
| `character-counter` | `social` | A text tool. Non-social users never find it. |
| `hashtag-counter` | `social` | Same. |
| `pomodoro-timer` | `time` | Productivity, not a time *calculation*. |
| `unit-price-calculator` | `shopping` | Correct — but `README.md` files it under Home. Fix the README. |

Current distribution:

| Category | Count | Verdict |
|---|---|---|
| finance | 10 | Over-stuffed — three don't belong |
| health | 6 | Good |
| auto | 6 | Good |
| time | 6 | Good |
| home | 6 | Good |
| measurements | 4 | Good |
| shopping | 4 | One doesn't belong |
| work | 4 | Good |
| social | 4 | Two don't belong |
| taxes | 2 | **Thin** |
| education | 1 | **Thin — a one-item category page is a low-quality page** |

### 1.2 Proposed category structure (11 → 14)

**Rename:**
- `social` → **Creator Tools** (`creator`) — it only ever held creator-economy tools.

**Create four:**

| id | Title | Rationale |
|---|---|---|
| `travel` | Travel | Pulls travel intent out of `finance`. Immediately has 4 members. |
| `text` | Text & Writing | Text tools have their own large search space (word counter alone is huge). |
| `math` | Math & Numbers | Closes the §5 gap — the homepage already claims `scientific calculator` and `percentage calculator` with no page behind them. |
| `tech` | Tech & Data | Houses the trending `ip subnet calculator` and `iban calculator` (§5). |

**Merge:** fold `taxes` (2) into `shopping` → rename to **Shopping & Tax** (`shopping`). Two-item
categories are not worth a landing page, and tax-on-purchase and discounts are the same intent.

**Reassignments:**

| id | from → to |
|---|---|
| `emi-calculator` | `shopping` → `finance` |
| `travel-budget-calculator` | `finance` → `travel` |
| `visa-stay-days-calculator` | `finance` → `travel` |
| `currency-converter` | `finance` → `travel` |
| `timezone-meeting-planner` | `time` → `travel` |
| `character-counter` | `social` → `text` |
| `hashtag-counter` | `social` → `text` |
| `sales-tax-calculator` | `taxes` → `shopping` |
| `tip-calculator` | `taxes` → `shopping` |

**Resulting distribution** (after also adding the new calculators in §1.5 / §5):

| Category | Members |
|---|---|
| finance | mortgage, loan, emi, loan-prepayment, compound-interest, investment, inflation, paycheck → **8** |
| health | bmi, bmr*, calorie, tdee, water-intake, running-pace, pregnancy-due-date → **7** |
| home | paint, tile, concrete, wallpaper, furniture-fit, electricity-bill → **6** |
| auto | car-payment, fuel-cost, gas-cost, ev-charging, toll-cost, commute-cost → **6** |
| shopping | sales-tax, tip, discount, cashback, unit-price → **5** |
| time | age, date-difference, work-hours, sleep-time, pomodoro → **5** |
| travel | travel-budget, visa-stay-days, currency-converter, timezone-meeting-planner → **4** |
| work | salary-raise, meeting-cost, freelancer-rate, pto → **4** |
| measurements | miles-km, f-c, lbs-kg, gallons-litres → **4** |
| creator | youtube-earnings, instagram-engagement → **2** *(grow: tiktok-earnings, twitch-earnings)* |
| text | character-counter, hashtag-counter, word-counter* → **3** |
| math* | percentage, scientific, fraction, average, ratio → **5** |
| tech* | ip-subnet, iban, data-storage, password-strength → **4** |
| education | gpa, grade, final-grade, weighted-average, study-time → **5** |

`*` = new (§1.5, §5). No category ends below 2, and the two at 2–3 have named growth candidates.

**Migration note:** changing a `category` changes `/categories/{id}` membership but **not** any
calculator URL — `/calculators/{slug}` is category-independent. Only `taxes` and `social` category
URLs die, so add 301s: `/categories/taxes` → `/categories/shopping`, `/categories/social` →
`/categories/creator`.

### 1.3 Schema change

Extend `CalculatorConfig` in `data/calculators.ts`:

```ts
export type CalculatorConfig = {
  id: string;
  category: string;
  title: string;
  description: string;
  example: string;
  inputs: CalculatorInput[];

  /** NEW — search synonyms. Powers on-page "Also known as", search matching, JSON-LD alternateName. */
  aliases: string[];
  /** NEW — 3-6 sibling calculator ids rendered as a "Related calculators" block. */
  related: string[];
  /** NEW — optional extra slugs that 301 to this calculator (see 2.5). */
  redirectFrom?: string[];
  /** NEW — real last-content-change date, for an honest sitemap (see 2.4). */
  updatedAt: string;

  seo: { title: string; description: string; faq: CalculatorFaq[] };
  compute: (values: CalculatorInputValues) => Record<string, number>;
};
```

Make `aliases`, `related` and `updatedAt` **required** so a new calculator cannot be added without
them. That is what keeps the taxonomy from rotting.

### 1.4 Where aliases must surface (all four, not just one)

The `keywords` meta tag is ignored by Google. Synonyms only work in **visible content, headings,
internal anchor text and structured data**:

1. **Visible "Also known as" line** under the H1 on `app/[locale]/calculators/[slug]/page.tsx`.
   A sentence, not a keyword list: *"Also called a home loan calculator, house payment calculator,
   or mortgage payment estimator."*
2. **Search index** — `components/CalculatorSearch.tsx:19` matches title + description only. Extend
   `fuzzyFilter` to cover `aliases`, so typing "emi" or "home loan" surfaces the mortgage calculator.
3. **JSON-LD** — `alternateName: aliases` on the `WebApplication` node (§2.3).
4. **Internal anchor text** — the "Related calculators" block links using an *alias* rather than the
   exact title, giving 53 pages of varied anchor text instead of 53 identical ones.

### 1.5 The full alias + cluster map (all 53 calculators)

Values to fill into `aliases` and `related`. Every calculator gets at least three siblings.

#### Cluster A — Loans & borrowing (`finance`)
| id | aliases | related |
|---|---|---|
| `mortgage-calculator` | home loan calculator, house payment calculator, mortgage payment calculator, home loan emi calculator, house loan emi calculator, monthly mortgage estimator | `loan-calculator`, `emi-calculator`, `loan-prepayment-calculator`, `car-payment-calculator` |
| `loan-calculator` | personal loan calculator, monthly payment calculator, loan repayment calculator, installment calculator, borrowing cost calculator | `mortgage-calculator`, `emi-calculator`, `car-payment-calculator`, `loan-prepayment-calculator` |
| `emi-calculator` | equated monthly installment calculator, loan emi calculator, house loan emi calculator, monthly installment calculator, bank emi calculator | `loan-calculator`, `mortgage-calculator`, `car-payment-calculator`, `loan-prepayment-calculator` |
| `loan-prepayment-calculator` | extra payment calculator, early payoff calculator, mortgage payoff calculator, interest saved calculator | `mortgage-calculator`, `loan-calculator`, `emi-calculator`, `compound-interest-calculator` |
| `car-payment-calculator` | auto loan calculator, car loan calculator, vehicle finance calculator, monthly car payment estimator | `loan-calculator`, `emi-calculator`, `commute-cost-calculator`, `fuel-cost-calculator` |

#### Cluster B — Saving & growth (`finance`)
| id | aliases | related |
|---|---|---|
| `compound-interest-calculator` | interest growth calculator, savings growth calculator, future value calculator, compounding calculator | `investment-calculator`, `inflation-calculator`, `loan-prepayment-calculator`, `salary-raise-calculator` |
| `investment-calculator` | sip calculator, return on investment calculator, roi calculator, portfolio growth calculator, retirement savings calculator | `compound-interest-calculator`, `inflation-calculator`, `paycheck-calculator`, `currency-converter` |
| `inflation-calculator` | purchasing power calculator, cost of living calculator, value of money over time calculator, price increase calculator | `compound-interest-calculator`, `investment-calculator`, `salary-raise-calculator`, `electricity-bill-calculator` |

#### Cluster C — Pay & work (`finance`, `work`)
| id | aliases | related |
|---|---|---|
| `paycheck-calculator` | take home pay calculator, net salary calculator, after tax pay calculator, salary paycheck estimator | `salary-raise-calculator`, `work-hours-calculator`, `freelancer-rate-calculator`, `pto-calculator` |
| `salary-raise-calculator` | pay rise calculator, percentage increase in salary, promotion pay calculator, new salary calculator | `paycheck-calculator`, `inflation-calculator`, `freelancer-rate-calculator`, `percentage-calculator` |
| `freelancer-rate-calculator` | hourly rate calculator, contractor rate calculator, day rate calculator, consulting fee calculator | `paycheck-calculator`, `work-hours-calculator`, `meeting-cost-calculator`, `salary-raise-calculator` |
| `meeting-cost-calculator` | cost of meeting calculator, meeting time cost, salary per hour meeting cost | `work-hours-calculator`, `freelancer-rate-calculator`, `paycheck-calculator`, `pomodoro-timer` |
| `pto-calculator` | vacation days calculator, paid time off accrual calculator, annual leave calculator, holiday allowance calculator | `work-hours-calculator`, `paycheck-calculator`, `date-difference-calculator`, `travel-budget-calculator` |
| `work-hours-calculator` | timesheet calculator, hours worked calculator, time card calculator, shift hours calculator | `paycheck-calculator`, `pto-calculator`, `meeting-cost-calculator`, `freelancer-rate-calculator` |

#### Cluster D — Shopping & tax (`shopping`)
| id | aliases | related |
|---|---|---|
| `sales-tax-calculator` | vat calculator, gst calculator, tax added calculator, purchase tax calculator | `tip-calculator`, `discount-calculator`, `unit-price-calculator`, `cashback-calculator` |
| `tip-calculator` | gratuity calculator, bill split calculator, restaurant tip calculator, service charge calculator | `sales-tax-calculator`, `discount-calculator`, `travel-budget-calculator`, `unit-price-calculator` |
| `discount-calculator` | percent off calculator, sale price calculator, markdown calculator, savings calculator | `percentage-calculator`, `sales-tax-calculator`, `cashback-calculator`, `unit-price-calculator` |
| `cashback-calculator` | reward points calculator, credit card cashback calculator, rebate calculator | `discount-calculator`, `sales-tax-calculator`, `unit-price-calculator`, `percentage-calculator` |
| `unit-price-calculator` | price per unit calculator, cost per ounce calculator, price comparison calculator, grocery unit price | `discount-calculator`, `sales-tax-calculator`, `cashback-calculator`, `fuel-cost-calculator` |

#### Cluster E — Body & fitness (`health`)
| id | aliases | related |
|---|---|---|
| `bmi-calculator` | body mass index calculator, bmi calculator for men, bmi calculator for women, bmi chart calculator, healthy weight calculator | `bmr-calculator`, `calorie-calculator`, `tdee-calculator`, `pounds-to-kilograms-converter` |
| `bmr-calculator` **(new, §5)** | basal metabolic rate calculator, resting metabolic rate calculator, mifflin st jeor calculator, harris benedict calculator | `tdee-calculator`, `calorie-calculator`, `bmi-calculator`, `water-intake-calculator` |
| `calorie-calculator` | calories calculator, daily calorie needs calculator, calorie intake calculator, weight loss calorie calculator | `tdee-calculator`, `bmr-calculator`, `bmi-calculator`, `running-pace-calculator` |
| `tdee-calculator` | total daily energy expenditure calculator, maintenance calories calculator, tdee and bmr calculator | `bmr-calculator`, `calorie-calculator`, `bmi-calculator`, `running-pace-calculator` |
| `water-intake-calculator` | daily water calculator, hydration calculator, how much water should i drink | `calorie-calculator`, `tdee-calculator`, `bmi-calculator`, `gallons-to-liters-converter` |
| `running-pace-calculator` | pace per mile calculator, marathon pace calculator, race time calculator, min per km calculator | `calorie-calculator`, `miles-to-kilometers-converter`, `tdee-calculator`, `sleep-time-calculator` |
| `pregnancy-due-date-calculator` | due date calculator, conception date calculator, pregnancy week calculator, edd calculator | `age-calculator`, `date-difference-calculator`, `bmi-calculator`, `water-intake-calculator` |

#### Cluster F — Unit conversion (`measurements`)
| id | aliases | related |
|---|---|---|
| `miles-to-kilometers-converter` | mi to km converter, distance converter, km to miles calculator | `pounds-to-kilograms-converter`, `gallons-to-liters-converter`, `fahrenheit-to-celsius-converter`, `running-pace-calculator` |
| `fahrenheit-to-celsius-converter` | f to c converter, temperature converter, celsius to fahrenheit calculator, degree converter | `miles-to-kilometers-converter`, `pounds-to-kilograms-converter`, `gallons-to-liters-converter`, `concrete-calculator` |
| `pounds-to-kilograms-converter` | lbs to kg converter, weight converter, kg to pounds calculator, stone to kg converter | `bmi-calculator`, `miles-to-kilometers-converter`, `gallons-to-liters-converter`, `fahrenheit-to-celsius-converter` |
| `gallons-to-liters-converter` | gal to l converter, volume converter, liters to gallons calculator, fuel volume converter | `fuel-cost-calculator`, `miles-to-kilometers-converter`, `pounds-to-kilograms-converter`, `water-intake-calculator` |

#### Cluster G — Driving & vehicles (`auto`)
| id | aliases | related |
|---|---|---|
| `fuel-cost-calculator` | petrol cost calculator, diesel cost calculator, trip fuel calculator, mpg cost calculator | `gas-cost-calculator`, `commute-cost-calculator`, `ev-charging-calculator`, `toll-cost-calculator` |
| `gas-cost-calculator` | gas trip calculator, road trip fuel calculator, gas mileage cost calculator | `fuel-cost-calculator`, `commute-cost-calculator`, `travel-budget-calculator`, `toll-cost-calculator` |
| `ev-charging-calculator` | electric car charging cost, ev running cost calculator, kwh charging calculator | `fuel-cost-calculator`, `electricity-bill-calculator`, `commute-cost-calculator`, `gas-cost-calculator` |
| `toll-cost-calculator` | toll estimator, highway toll calculator, road toll cost | `commute-cost-calculator`, `gas-cost-calculator`, `travel-budget-calculator`, `fuel-cost-calculator` |
| `commute-cost-calculator` | cost of commuting calculator, daily travel cost calculator, work travel expense calculator | `fuel-cost-calculator`, `toll-cost-calculator`, `ev-charging-calculator`, `paycheck-calculator` |

#### Cluster H — Home & DIY (`home`)
| id | aliases | related |
|---|---|---|
| `paint-calculator` | how much paint do i need, wall paint coverage calculator, paint gallons calculator | `wallpaper-calculator`, `tile-calculator`, `concrete-calculator`, `furniture-fit-calculator` |
| `tile-calculator` | how many tiles do i need, floor tile calculator, tile area calculator | `paint-calculator`, `wallpaper-calculator`, `concrete-calculator`, `furniture-fit-calculator` |
| `concrete-calculator` | cubic yards of concrete calculator, cement calculator, slab concrete calculator | `tile-calculator`, `paint-calculator`, `wallpaper-calculator`, `gallons-to-liters-converter` |
| `wallpaper-calculator` | wallpaper rolls calculator, how much wallpaper do i need, wall covering calculator | `paint-calculator`, `tile-calculator`, `furniture-fit-calculator`, `concrete-calculator` |
| `furniture-fit-calculator` | will it fit calculator, room layout calculator, doorway fit calculator | `paint-calculator`, `tile-calculator`, `wallpaper-calculator`, `miles-to-kilometers-converter` |
| `electricity-bill-calculator` | power bill estimator, kwh cost calculator, appliance running cost calculator, energy bill calculator | `ev-charging-calculator`, `inflation-calculator`, `fuel-cost-calculator`, `travel-budget-calculator` |

#### Cluster I — Time & dates (`time`)
| id | aliases | related |
|---|---|---|
| `age-calculator` | how old am i calculator, date of birth calculator, age in days calculator, birthday calculator | `date-difference-calculator`, `pregnancy-due-date-calculator`, `visa-stay-days-calculator`, `sleep-time-calculator` |
| `date-difference-calculator` | days between dates calculator, date duration calculator, countdown calculator, weeks between dates, days until date | `age-calculator`, `visa-stay-days-calculator`, `pto-calculator`, `work-hours-calculator` |
| `sleep-time-calculator` | bedtime calculator, sleep cycle calculator, wake up time calculator, when should i sleep | `pomodoro-timer`, `timezone-meeting-planner`, `age-calculator`, `tdee-calculator` |
| `pomodoro-timer` | focus timer, study timer, 25 minute timer, productivity timer | `sleep-time-calculator`, `work-hours-calculator`, `meeting-cost-calculator`, `study-time-calculator` |

#### Cluster J — Travel (`travel`, new)
| id | aliases | related |
|---|---|---|
| `travel-budget-calculator` | trip cost calculator, holiday budget calculator, vacation cost estimator | `currency-converter`, `visa-stay-days-calculator`, `gas-cost-calculator`, `toll-cost-calculator` |
| `visa-stay-days-calculator` | schengen calculator, 90/180 day calculator, visa days remaining calculator, overstay calculator | `date-difference-calculator`, `travel-budget-calculator`, `age-calculator`, `currency-converter` |
| `currency-converter` | exchange rate calculator, money converter, forex converter, foreign currency calculator | `travel-budget-calculator`, `investment-calculator`, `iban-calculator`, `unit-price-calculator` |
| `timezone-meeting-planner` | time zone converter, world clock meeting planner, meeting time across time zones | `travel-budget-calculator`, `work-hours-calculator`, `pomodoro-timer`, `meeting-cost-calculator` |

#### Cluster K — Education (`education`)
| id | aliases | related |
|---|---|---|
| `gpa-calculator` | grade point average calculator, cgpa calculator, college gpa calculator, semester gpa calculator | `grade-calculator`, `final-grade-calculator`, `weighted-average-calculator`, `percentage-calculator` |
| `grade-calculator` **(new)** | test grade calculator, exam score calculator, marks percentage calculator | `gpa-calculator`, `final-grade-calculator`, `percentage-calculator`, `weighted-average-calculator` |
| `final-grade-calculator` **(new)** | what do i need on my final, exam grade needed calculator, semester grade calculator | `grade-calculator`, `gpa-calculator`, `weighted-average-calculator`, `study-time-calculator` |
| `weighted-average-calculator` **(new)** | weighted mean calculator, weighted grade calculator, weighted score calculator | `average-calculator`, `grade-calculator`, `gpa-calculator`, `percentage-calculator` |
| `study-time-calculator` **(new)** | revision planner, study hours calculator, exam prep time calculator | `pomodoro-timer`, `final-grade-calculator`, `work-hours-calculator`, `sleep-time-calculator` |

#### Cluster L — Creator tools (`creator`, renamed from `social`)
| id | aliases | related |
|---|---|---|
| `youtube-earnings-calculator` | youtube money calculator, cpm revenue calculator, adsense earnings estimator, rpm calculator | `instagram-engagement-calculator`, `hashtag-counter`, `character-counter`, `freelancer-rate-calculator` |
| `instagram-engagement-calculator` | engagement rate calculator, social media engagement calculator, influencer rate calculator | `youtube-earnings-calculator`, `hashtag-counter`, `character-counter`, `freelancer-rate-calculator` |

#### Cluster M — Text & writing (`text`, new)
| id | aliases | related |
|---|---|---|
| `character-counter` | letter counter, text length calculator, twitter character counter, character count tool | `word-counter`, `hashtag-counter`, `instagram-engagement-calculator`, `youtube-earnings-calculator` |
| `hashtag-counter` | hashtag limit checker, instagram hashtag counter, tag counter | `character-counter`, `word-counter`, `instagram-engagement-calculator`, `youtube-earnings-calculator` |
| `word-counter` **(new)** | word count tool, essay word counter, reading time calculator, page count calculator | `character-counter`, `hashtag-counter`, `study-time-calculator`, `youtube-earnings-calculator` |

#### Cluster N — Math & numbers (`math`, new — see §5)
| id | aliases | related |
|---|---|---|
| `percentage-calculator` **(new)** | percent calculator, percentage increase calculator, percentage change calculator, what percent of, percentage difference calculator | `discount-calculator`, `salary-raise-calculator`, `average-calculator`, `fraction-calculator` |
| `scientific-calculator` **(new)** | online calculator, basic calculator, free calculator online, trig calculator | `percentage-calculator`, `fraction-calculator`, `average-calculator`, `ratio-calculator` |
| `fraction-calculator` **(new)** | fraction to decimal converter, simplify fractions calculator, adding fractions calculator | `percentage-calculator`, `ratio-calculator`, `scientific-calculator`, `average-calculator` |
| `average-calculator` **(new)** | mean calculator, median calculator, mean median mode calculator | `weighted-average-calculator`, `percentage-calculator`, `grade-calculator`, `scientific-calculator` |
| `ratio-calculator` **(new)** | proportion calculator, aspect ratio calculator, scale calculator | `fraction-calculator`, `percentage-calculator`, `average-calculator`, `tile-calculator` |

#### Cluster O — Tech & data (`tech`, new — see §5)
| id | aliases | related |
|---|---|---|
| `ip-subnet-calculator` **(new)** | cidr calculator, subnet mask calculator, ipv4 subnet calculator, network address calculator | `data-storage-converter`, `iban-calculator`, `password-strength-checker`, `scientific-calculator` |
| `iban-calculator` **(new)** | iban validator, iban checker, iban generator, bank account number validator | `currency-converter`, `travel-budget-calculator`, `ip-subnet-calculator`, `emi-calculator` |
| `data-storage-converter` **(new)** | mb to gb converter, bytes converter, gb to tb calculator, file size converter | `ip-subnet-calculator`, `miles-to-kilometers-converter`, `character-counter`, `scientific-calculator` |
| `password-strength-checker` **(new)** | password entropy calculator, password security checker, how strong is my password | `character-counter`, `ip-subnet-calculator`, `data-storage-converter`, `iban-calculator` |

### 1.6 Homepage keyword cleanup

`app/[locale]/layout.tsx:14-22` and `app/[locale]/page.tsx:30-37` dump ~19 head terms into a
`keywords` array Google ignores. Two of them — `scientific calculator` and `graphing calculator` —
promise tools the site does not have. Once §5 lands, `scientific calculator` becomes truthful;
`graphing calculator` should be dropped (it is a genuinely hard build and not worth it). Either way,
reduce the array to terms the site actually serves, or delete it — it has zero ranking effect and
the false promises train Google that the homepage is a poor match for calculator queries, working
directly against goal #2.

---

## 2. Making Google rank the calculator page, not the homepage

This is where the biggest wins are, and it is the weakest part of the site today.

### 2.1 Canonicals are actively wrong (highest priority fix)

| Page | Current canonical | Problem |
|---|---|---|
| `app/[locale]/page.tsx:60` | `siteUrl` (bare root) | `/en`, `/de`, `/fr`, `/es`, `/it` **all** canonicalise to the same root. Four locales are telling Google to drop them. |
| `app/[locale]/about/page.tsx:22` | `${siteUrl}/about` | Locale-blind. `/de/about` claims `/about` is its canonical. Same in `contact`, `privacy-policy`, `terms`. |
| `app/[locale]/calculators/[slug]/page.tsx` | **none** | 53 × 5 = 265 calculator pages with no canonical at all. |
| `app/[locale]/categories/[category]/page.tsx` | **none** | 11 × 5 = 55 category pages with no canonical. |

Compounding this: `middleware.ts` uses next-intl's default `localePrefix: 'always'`, so the English
home page really lives at `/en`, and the bare `/about` in those canonicals **does not exist** — it
redirects. A canonical pointing at a redirect is a canonical Google ignores.

**Fix — centralise it.** Post-revision (English-only, root URLs) this is a one-liner in
`lib/seo.ts`:

```ts
/** Canonical URL for a root-relative path. Pass '' for the home page. */
export function buildCanonical(path: string) {
  return { canonical: `${SITE_URL}${path}` };
}
```

Call it from **every** `generateMetadata`, including the two that have none. Put it inside
`buildCalculatorMetadata` and `buildCategoryMetadata` so future calculators inherit a canonical
automatically. Every page self-canonicalises to its own URL.

### 2.2 hreflang — ~~missing~~ **obsolete** (superseded by the English-only decision)

Originally this was the single strongest fix for the "Google shows my homepage instead" symptom:
no `alternates.languages` was emitted anywhere, so Google saw five near-identical English pages and
picked one.

The English-only decision removes the problem at its source instead. **One language needs no
hreflang and no `x-default`** — a self-referential hreflang set for a single locale is noise. Do not
implement it. If languages are ever re-added, this section becomes live again.

### 2.3 Structured data — currently only FAQPage

`buildPageJsonLd` in `lib/seo.ts` emits only `FAQPage`. Three more nodes are needed, and it is
`BreadcrumbList` that makes Google render the *tool path* in the SERP rather than collapsing to the
site name:

```ts
// 1. Tells Google this URL IS a tool, not an article about one
{
  '@type': 'WebApplication',
  name: calculator.title,
  alternateName: calculator.aliases,          // from §1.3
  url: `${SITE_URL}/${locale}/calculators/${slug}`,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  isAccessibleForFree: true
}

// 2. Drives the breadcrumb trail shown under the SERP title
{
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',        item: `${SITE_URL}/${locale}` },
    { '@type': 'ListItem', position: 2, name: 'Calculators', item: `${SITE_URL}/${locale}/calculators` },
    { '@type': 'ListItem', position: 3, name: categoryTitle, item: `${SITE_URL}/${locale}/categories/${calculator.category}` },
    { '@type': 'ListItem', position: 4, name: calculator.title }
  ]
}

// 3. HowTo — eligible for step-by-step SERP treatment on calculator queries
{ '@type': 'HowTo', name: `How to use the ${calculator.title}`, step: [...] }
```

Add a matching **visible** breadcrumb component — Google cross-checks JSON-LD against rendered
markup, and the page currently shows only a bare category link
(`app/[locale]/calculators/[slug]/page.tsx:58-64`).

### 2.4 The sitemap has two structural bugs

In `app/sitemap.ts`:

**Bug 1 — default-locale URLs point at redirects.** `buildEntry(path)` emits `${baseUrl}${path}`
(e.g. `/calculators/bmi-calculator`), but with `localePrefix: 'always'` that URL 307s to
`/en/calculators/bmi-calculator`. Every English entry in the sitemap is a redirect.

**Bug 2 — hreflang alternates are computed from an already-prefixed path.** The loops call
`buildEntry('/de/calculators/bmi-calculator')`; inside, `buildEntry` prefixes *again*, producing
`languages: { en: '/de/calculators/…', de: '/de/de/calculators/…', fr: '/fr/de/calculators/…' }`.
Roughly 80% of the sitemap's hreflang data is nonsense URLs.

**Rewrite:**

```ts
function entry(path: string, priority: number, lastModified: Date) {
  return {
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority
  };
}
// One entry per path. No locale loops, no alternates. ~72 entries, not ~350.
```

Also: `lastModified: new Date()` claims all 300+ pages changed on every deploy. Google discounts
sitemaps that do this. Use the new `updatedAt` field from §1.3.

**Priority signal:** calculator pages `0.8`, homepage `0.6`. Priority is a weak hint, but combined
with breadcrumbs and internal linking it reinforces "the leaf pages are the product."

### 2.5 Slug strategy for query-matching

Google prefers the URL whose slug matches the query. Current slugs are good
(`/calculators/bmi-calculator`). Two additions:

- **`redirectFrom` support.** People search and link `auto-loan-calculator`, `home-loan-calculator`,
  `house-loan-emi-calculator`, `word-counter`, `bmr-calculator`. Add those to `redirectFrom` and
  generate 301s in `middleware.ts` so the equity lands on the canonical slug instead of a 404.
- **Do not shorten `/calculators/<slug>` to `/<slug>`.** The segment is a useful breadcrumb token and
  the redirect cost of moving 265 URLs is not worth it.

### 2.6 Cross-locale duplicate content (the hidden ranking killer)

`data/calculators.ts` is **English-only**. `messages/{de,fr,es,it}.json` translate nav, headings and
boilerplate, but every calculator title, description, example, input label and FAQ answer stays in
English on all five locales. So `/de/calculators/mortgage-calculator` is a German shell around
English content — 265 pages that are ~70% identical to each other.

Google's response to near-duplicate sets is to pick one representative URL and suppress the rest —
exactly the reported symptom. This was the **largest single ranking blocker on the site**.

**Resolved by removal (decision D2).** The four untranslated locales are dropped from routing and
English moves to the root, so the duplicate set ceases to exist. This is cheaper and faster than the
alternative — translating 53 calculators × 4 languages before any ranking work pays off — and it
loses nothing that was actually working, since the non-English pages were serving English content.

If languages are re-added later, the rule stands: **translate the calculator corpus first**, by
moving `title` / `description` / `example` / `inputs[].label` / `seo` into `messages/*.json` keyed by
calculator id while `compute` stays in `data/calculators.ts`. Shipping a locale of untranslated
content and expecting deep links to rank is self-defeating.

### 2.7 Sitelinks searchbox is broken

`buildHomeJsonLd` emits a `SearchAction` targeting `/calculators?q={search_term_string}` — but
`app/[locale]/calculators/page.tsx` **does not read a `q` param at all**, and the URL lacks the
locale prefix so it redirects. Either implement `?q=` handling on that page (worth doing — see §4.5)
or remove the `SearchAction` node. A broken `SearchAction` is a structured-data error in Search
Console.

### 2.8 Search Console operations

Once the above ships:
1. Verify the single chosen domain; submit `/sitemap.xml`.
2. **URL Inspection → Request indexing** on the top 15 calculator pages individually — this is how
   leaf pages get crawled first instead of waiting for authority to trickle from the homepage.
3. Watch **Pages → "Duplicate, Google chose different canonical"**. If it drops after the canonical
   and hreflang fixes, goal #2 is working.
4. Watch **Enhancements → Breadcrumbs / FAQ** for JSON-LD validation errors.

---

## 3. Country-aware versions of the site

### 3.1 What actually exists today

Only **language** switching, not country. `i18n/routing.ts` defines `['en','de','fr','es','it']` with
`localeCookie: true`, and `components/LanguageSwitcher.tsx` swaps the locale. There is **no
geo-detection anywhere** — no `cf-ipcountry` read, no `Accept-Language` negotiation, no country state.

The gap is bigger than the switcher: the calculators are hardcoded to US conventions regardless of
locale.

| File | Hardcoded assumption |
|---|---|
| `lib/calculator.ts:10,18,25,32,46` | `Intl.NumberFormat('en-US', { currency: 'USD' })` — a French user sees `$` |
| `data/calculators.ts` | `type: 'currency'` inputs, MPG, gallons, pounds, inches, `$350,000` placeholders |
| `components/CurrencyConverter.tsx:5-11` | 30 static rates, `from: 'USD'`, `to: 'EUR'` fixed |
| `components/PaycheckCalculator.tsx` | US tax assumptions |
| `lib/seo.ts` FAQ answers | "15% of $80", "weight in pounds ÷ height in inches² × 703" |

So "the German version" today is a German menu around a dollar-denominated, imperial-unit calculator.

### 3.2 Model: separate the two axes

**Language ≠ country.** A user in Switzerland may want German language + CHF currency + metric units.
Conflating them into one locale list means 5 languages × 40 countries = 200 URL variants — an SEO
disaster.

Keep them separate:

- **Language** = the URL segment (`/de/…`) — indexable, hreflang'd, one page per language.
- **Country** = a **presentation preference** (currency, units, date format, tax defaults) stored in a
  cookie and applied client-side. **Never in the URL.**

Five indexable variants instead of 200, while every user still sees their own currency and units.

### 3.3 Implementation

**Step 1 — a country registry.** New `lib/regions.ts`:

```ts
export type Region = {
  code: string;              // ISO-3166-1 alpha-2, e.g. 'GB'
  name: string;
  currency: string;          // 'GBP'
  currencySymbol: string;    // '£'
  intlLocale: string;        // 'en-GB' — passed to Intl.NumberFormat
  numberGrouping: 'western' | 'indian' | 'chinese';
  units: 'imperial' | 'metric' | 'uk-hybrid';
  bodyWeightUnit: 'lb' | 'kg' | 'stone';
  heightUnit: 'ft-in' | 'cm';
  fuelUnit: 'us-gallon' | 'uk-gallon' | 'litre';
  fuelEfficiency: 'mpg-us' | 'mpg-uk' | 'l-100km' | 'kmpl';
  distanceUnit: 'mile' | 'km';
  temperatureUnit: 'F' | 'C';
  areaUnit: 'sqft' | 'sqm';
  dateFormat: 'MDY' | 'DMY' | 'YMD';
  calendarEra?: 'buddhist';  // Thailand only
  salesTaxLabel: string;     // 'Sales tax' | 'VAT' | 'GST' | 'PPN'
  defaultSalesTaxRate: number;
  hasIncomeTax: boolean;     // false for UAE — changes the paycheck calculator
  gpaScale: 4 | 10;          // India uses a 10-point CGPA scale
  loanTermLabel: 'monthly payment' | 'EMI';
  suggestedLanguage: string; // must be one of routing.locales
};
```

**Seed exactly the nine target regions** (§3.5 gives the values for each): US, GB, EU, IN, AE, TH,
ID, CN, AU. Everything else falls back to a `DEFAULT` region (= US) until it is explicitly added,
so an unrecognised `cf-ipcountry` never breaks a page.

Two notes on the requested list:

- **"England" → use `GB` (United Kingdom).** England alone has no ISO country code, no separate
  currency and no separate tax regime. `cf-ipcountry` returns `GB`. Label it "United Kingdom" in the
  switcher.
- **"Europe" is a bloc, not a country.** Model it as a `EU` **default profile** (EUR, metric, DMY,
  comma decimal separator) with per-country overrides for the four that already have locales —
  DE, FR, ES, IT — because their VAT rates differ (19 / 20 / 21 / 22%). `cf-ipcountry` returns the
  specific country, so map any Eurozone code to the `EU` profile plus its override, and any other
  European code (PL, SE, CH…) to `EU` with its own currency. That way one profile covers the
  continent without 27 hand-written entries.

**Step 2 — detect on the edge.** Cloudflare Workers expose `request.cf.country` and the `CF-IPCountry`
header for free — no third-party geo-IP, no added latency. In `middleware.ts`, wrap the existing
next-intl middleware:

```ts
export default function middleware(req: NextRequest) {
  const res = intlMiddleware(req);
  if (!req.cookies.get('region')) {
    const cc = req.headers.get('cf-ipcountry') ?? 'US';
    res.cookies.set('region', isSupported(cc) ? cc : 'US', {
      maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/'
    });
  }
  return res;
}
```

Read `cf-ipcountry` **only when the cookie is absent** — an explicit user choice must always win over
geo-IP (VPNs, expats, travellers). This is the #1 complaint about geo-aware sites.

**Step 3 — never geo-*redirect*.** Do not bounce a German IP from `/en/…` to `/de/…`. Googlebot
crawls almost entirely from US IPs; a country redirect means Google only ever sees the US version and
the other locales never get indexed. Instead: serve the requested URL and show a **dismissible
suggestion banner** — *"Looks like you're in Germany. View in German? · Switch · Stay in English"* —
persisting the choice to the cookie.

**Step 4 — a `RegionProvider`.** Mirror the existing `components/ThemeProvider.tsx` pattern (same
cookie-hydration shape, so it will feel familiar):

```tsx
const { region, setRegion, formatCurrency, formatNumber, formatDate } = useRegion();
```

Refactor `lib/calculator.ts` so `formatCurrency` / `formatNumber` / `formatFull` accept a `Region`
instead of hardcoding `en-US` / `USD`. This is the change that makes country switching actually
visible — without it, switching country changes nothing on screen.

**Step 5 — unit-aware calculators.** Extend `CalculatorInput` with
`unitSystem?: 'imperial' | 'metric'` and let inputs relabel themselves: `Weight (lbs)` ↔ `Weight (kg)`,
`MPG` ↔ `L/100km`, `Gallons` ↔ `Litres`. Priority targets: `bmi-calculator`, `bmr-calculator`,
`calorie-calculator`, `tdee-calculator`, `fuel-cost-calculator`, `gas-cost-calculator`,
`paint-calculator`, `concrete-calculator`, `running-pace-calculator`.

**Step 6 — region-aware tax labels.** `sales-tax-calculator` should read "VAT" in the EU/UK, "GST" in
AU/NZ/IN/CA, "Sales tax" in the US, with a sensible default rate per region. Same for
`paycheck-calculator`, which should state its US assumption prominently when the region is not US.

**Step 7 — upgrade the switcher.** Replace `LanguageSwitcher` with a combined control:
`🌐 English · United States ▾` opening a two-column panel (Language | Country). Keep both selects
individually keyboard-reachable and labelled — they are the only geo affordance on the page.

**Step 8 — currency rates.** `components/CurrencyConverter.tsx` ships 30 static rates in source
(marked "not live"). Publishing stale FX numbers is a trust and accuracy problem. Fetch daily from a
free source into Cloudflare KV (the project already uses KV) and show a visible "Rates updated
<date>" line. If rates stay static, say so on the page.

### 3.4 SEO guard-rails for the country layer

- Country is a cookie, never a URL — **no** new indexable variants, no crawl-budget waste.
- The banner is a client-side overlay, not a redirect — Googlebot always gets the URL it asked for.
- Apply region formatting **client-side after hydration** so the server-rendered HTML stays
  region-neutral, the Cloudflare edge cache stays effective, and the static export
  (`dynamic = 'force-static'`) keeps working. This matters: reading `cf-ipcountry` during render
  would force every calculator page dynamic and kill the current static build.

### 3.5 The nine regions, in detail

Currency is the headline difference, but it is not the only one — and in several of these regions the
*non*-currency differences are what make the calculator either credible or obviously foreign.

#### Core formatting

| | 🇺🇸 US | 🇬🇧 UK | 🇪🇺 Europe | 🇮🇳 India | 🇦🇪 UAE | 🇹🇭 Thailand | 🇮🇩 Indonesia | 🇨🇳 China | 🇦🇺 Australia |
|---|---|---|---|---|---|---|---|---|---|
| Code | `US` | `GB` | `EU` | `IN` | `AE` | `TH` | `ID` | `CN` | `AU` |
| Currency | USD $ | GBP £ | EUR € | INR ₹ | AED د.إ | THB ฿ | IDR Rp | CNY ¥ | AUD $ |
| `intlLocale` | `en-US` | `en-GB` | `de-DE` etc. | `en-IN` | `en-AE` | `th-TH` | `id-ID` | `zh-CN` | `en-AU` |
| Decimal sep. | `.` | `.` | **`,`** | `.` | `.` | `.` | **`,`** | `.` | `.` |
| Thousands sep. | `,` | `,` | **`.`** | `,` | `,` | `,` | **`.`** | `,` | `,` |
| Grouping | western | western | western | **indian** | western | western | western | **chinese** | western |
| Decimals shown | 2 | 2 | 2 | 2 | 2 | 2 | **0** | 2 | 2 |
| Date format | **MDY** | DMY | DMY | DMY | DMY | DMY | DMY | **YMD** | DMY |
| Week starts | Sunday | Monday | Monday | Monday | **Saturday** | Sunday | Sunday | Monday | Monday |

#### Units

| | 🇺🇸 US | 🇬🇧 UK | 🇪🇺 Europe | 🇮🇳 India | 🇦🇪 UAE | 🇹🇭 Thailand | 🇮🇩 Indonesia | 🇨🇳 China | 🇦🇺 Australia |
|---|---|---|---|---|---|---|---|---|---|
| System | imperial | **hybrid** | metric | metric | metric | metric | metric | metric | metric |
| Distance | mile | **mile** | km | km | km | km | km | km | km |
| Body weight | lb | **stone + lb** | kg | kg | kg | kg | kg | kg | kg |
| Height | ft/in | ft/in | cm | cm | cm | cm | cm | cm | cm |
| Temperature | °F | °C | °C | °C | °C | °C | °C | °C | °C |
| Fuel volume | US gallon | litre | litre | litre | litre | litre | litre | litre | litre |
| Fuel efficiency | MPG | **MPG (imperial gal)** | L/100km | **kmpl** | km/L | km/L | km/L | L/100km | L/100km |
| Area | sq ft | sq m (sq ft in property) | sq m | **sq ft** | sq ft | sq m (`wah²` land) | sq m | sq m | sq m |

Three traps in that table:

- **UK is not metric and not imperial** — it is a genuine hybrid. Roads are in miles, body weight is
  in **stone**, fuel is sold in litres but economy is quoted in MPG using the **imperial gallon
  (4.546 L, not 3.785 L)**. A UK MPG figure computed with a US gallon is wrong by 20%. This is the
  single most common localisation bug on calculator sites — get it right and the UK pages are
  instantly more credible than most competitors'.
- **India groups digits differently.** ₹25,00,000 — not ₹2,500,000. That is the lakh/crore system:
  the first group is 3 digits, every group after is 2. `Intl.NumberFormat('en-IN')` handles this
  natively, which is exactly why `intlLocale` belongs in the registry rather than a hand-rolled
  formatter. Also expose "₹25 lakh" / "₹2.5 crore" wording on loan and investment results — Indian
  users read amounts that way, not as raw digits.
- **Indonesia should show zero decimals.** Rp 1.500.000,00 is noise; Rp 1.500.000 is correct. The
  existing `CurrencyConverter` already has a `large` list (`JPY, KRW, IDR, HUF`) doing this — the
  same logic needs to move into the region registry so it applies to *every* calculator, not just
  the converter.

#### Tax, pay and finance conventions

| | Sales tax label | Rate | Income tax | Loan term | Notes |
|---|---|---|---|---|---|
| 🇺🇸 US | Sales tax | ~7% (varies by state) | Yes | monthly payment | Rate is state/city-level — keep the input editable and default to a blended rate |
| 🇬🇧 UK | **VAT** | 20% | Yes | monthly payment | Also has a reduced 5% rate |
| 🇪🇺 Europe | **VAT** | DE 19 · FR 20 · ES 21 · IT 22 | Yes | monthly payment | Per-country override required |
| 🇮🇳 India | **GST** | 18% (5/12/18/28 slabs) | Yes | **EMI** | Say "EMI", never "monthly payment" |
| 🇦🇪 UAE | **VAT** | 5% | **No** | monthly payment | **No personal income tax** — see below |
| 🇹🇭 Thailand | **VAT** | 7% | Yes | monthly payment | |
| 🇮🇩 Indonesia | **PPN** | 11% | Yes | monthly payment | |
| 🇨🇳 China | **VAT** (增值税) | 13% | Yes | monthly payment | |
| 🇦🇺 AU | **GST** | 10% | Yes | monthly payment | Superannuation ~11.5% affects take-home pay |

#### Per-calculator impact

These are the calculators that genuinely change per region — everything else only needs the currency
symbol and number formatting from the registry:

| Calculator | What changes |
|---|---|
| `sales-tax-calculator` | Label (Sales tax / VAT / GST / PPN) **and** default rate. Add a second mode for VAT regions: "remove VAT from a gross price", which is how VAT is actually used and which the US-only version cannot do. |
| `paycheck-calculator` | The biggest one. **For UAE, show "No personal income tax in the UAE" and compute gross = net**, with a social-security note for nationals. For AU, add superannuation. For IN, the old vs. new tax regime choice. Where the model is not implemented for a region, say so on the page rather than silently applying US brackets — the current page applies US assumptions to every visitor with no disclaimer. |
| `mortgage-calculator`, `loan-calculator`, `emi-calculator` | Rename the output to **"EMI"** in India. Default interest rates differ enormously by region (US ~7%, EU ~4%, IN ~9%, TH ~6%) — seed the default from the region so the first render is plausible. |
| `bmi-calculator`, `bmr-calculator`, `tdee-calculator`, `calorie-calculator` | lb/ft-in ↔ kg/cm. **UK gets a stone + pounds input.** Asian regions (IN, CN, TH, ID) should note the lower WHO Asian BMI overweight threshold (23, not 25) — a genuine accuracy point competitors miss. |
| `fuel-cost-calculator`, `gas-cost-calculator` | MPG (US gal) / MPG (imperial gal) / L/100km / kmpl — four distinct formulas, not one. Fuel price per gallon vs. per litre. Call it "gas" in the US, **"petrol"** everywhere else. |
| `currency-converter` | Default `from` to the region's currency instead of always USD. |
| `age-calculator`, `date-difference-calculator`, `pregnancy-due-date-calculator` | MDY / DMY / YMD input order. **Thailand: offer the Buddhist Era year (2026 CE = 2569 BE)** — Thai users routinely enter a BE birth year, and a Gregorian-only field silently produces a 543-year error. |
| `gpa-calculator` | India uses a **10-point CGPA** scale, not the US 4.0. Add a scale selector; without it the page is unusable for Indian students. |
| `paint-calculator`, `tile-calculator`, `concrete-calculator`, `wallpaper-calculator` | sq ft ↔ sq m; US gallons ↔ litres of paint; cubic yards ↔ cubic metres of concrete. India quotes property in **sq ft** despite being metric — keep sq ft there. |
| `electricity-bill-calculator` | Price per kWh differs by an order of magnitude across these nine. Seed a per-region default. |
| `travel-budget-calculator`, `visa-stay-days-calculator` | Home currency default; the Schengen 90/180 rule is only relevant to some. |

#### Language coverage — English-only (decision D2)

The site is English-only. **Region ≠ language**, so this costs less than it sounds: a Thai visitor
still gets ฿, metric units and Buddhist-era dates — on an English page. The whole region layer works
without a single new locale.

| Region | Reach on an English-only site |
|---|---|
| US, UK, AU | ✅ Native market |
| India, UAE | ✅ Both search in English at scale — among the best targets on the list |
| Europe | ⚠️ English-literate audience only; DE/FR/ES/IT search volume is left on the table |
| Thailand, Indonesia | ⚠️ Region formatting is correct, but organic reach is limited to English searchers |
| China | ⚠️ Same, plus the Google/Baidu issue below |

**Prioritise US, UK, India, Australia and UAE.** English-language, Google-dominant, high AdSense
rates, zero translation cost — the region work pays off immediately in those five.

One honest caveat on **China**: Google has negligible market share there, so no amount of Google SEO
will reach mainland Chinese users — that traffic comes from Baidu, which needs separate work (Baidu
Webmaster Tools, an ICP licence for hosting, and Cloudflare is unreliable behind the GFW). The `CN`
region profile is therefore aimed at Chinese speakers in Singapore, Hong Kong, Taiwan, Australia and
North America, who reach the site through Google in English. Do not expect mainland traffic from it.

---

## 4. Site format & architecture analysis

Deliberately last, as requested — but several findings here change how Parts 1–3 should be built.

### 4.1 What is right and should not change

- **Config-driven calculators.** One object in `data/calculators.ts` → page + sitemap + search entry.
  The correct architecture for a 50→500 calculator site. Preserve it.
- **Static generation** (`dynamic = 'force-static'`, `dynamicParams = false`) on Cloudflare's edge.
  Fast, cheap, ideal for SEO.
- **URL structure** `/{locale}/calculators/{slug}` and `/{locale}/categories/{cat}`. Clean and
  keyword-matched.
- **Alias pages as redirects** (`about-us` → `about`, etc.) rather than duplicates. Correct.

### 4.2 The page template is too thin to rank

`app/[locale]/calculators/[slug]/page.tsx` renders: H1 + one-line description + one example line +
the widget + two generic paragraphs (`t('howToUse')` — **identical on all 53 pages**) + 2 FAQs.
That is ~150 words of unique text per page. Competitors ranking for these terms run 800–1,500 words,
and the identical `howToUse` block across 53 pages is itself a duplicate-content signal.

**Restructure to:**

```
Breadcrumb: Home › Calculators › Finance › Mortgage Calculator
H1 + "Also known as …" line                          (§1.4)
[ The calculator widget — must stay above the fold ]
H2  How to use this calculator      — per-calculator steps, not shared boilerplate
H2  The formula                     — the actual maths, rendered, with a worked example
H2  Worked example                  — real numbers, matching the region (§3)
H2  Things to watch out for         — caveats, rounding, assumptions
H2  Frequently asked questions      — 6-8 per calculator, up from 2
H2  Related calculators             — the `related` cluster from §1.5
```

The formula section is the highest-leverage addition: unique per page by construction, naturally
contains the synonyms, and matches "how to calculate X" — the exact intent behind calculator searches.

### 4.3 Widget above the fold

A bordered hero card (`page.tsx:56-68`) currently pushes the calculator below the fold on mobile.
Users bouncing back to Google because they had to scroll to find the calculator is a direct negative
signal on the very query the page is trying to win. Compress the hero to H1 + one line, lift the
widget up.

### 4.4 Category imbalance

Covered in §1.1–§1.2. The short version: `education` (1) and `taxes` (2) produce thin category pages.
The restructure in §1.2 fixes both — `taxes` merges into `shopping`, `education` grows to 5.

### 4.5 The listing page dumps all 53 cards at once

`app/[locale]/calculators/page.tsx` renders 11 category cards + 53 calculator cards with no
pagination, no filtering and no search (`CalculatorSearch` exists but is only used on the homepage).
At 80+ calculators — which §5 takes it to — this becomes unusable and a crawl-depth problem.

Add category filter chips, the search box, and `?q=` / `?category=` URL params — which also fixes the
broken `SearchAction` from §2.7.

### 4.6 Structural issues worth fixing while in here

- **`app/page.tsx`** hardcodes `redirect('/en')`. Should redirect to the negotiated locale
  (`Accept-Language` → supported locale, fallback `en`), as a **307**, not a permanent one.
- **`app/[locale]/layout.tsx`** exports static `metadata` *and* each page exports `generateMetadata`
  with overlapping OG/Twitter blocks — the same title string is duplicated in four places. Collapse
  into `lib/seo.ts` helpers.
- **`dev-server.log` / `dev-server.err.log` are committed.** `.gitignore` and remove them.
  `tsconfig.tsbuildinfo` (303 KB) likewise.
- **`mdFiles/memory/project_i18n.md` is stale** — it says the middleware lives in `proxy.ts` and next-intl is
  3.26.5. The repo has `middleware.ts` and next-intl 4.13. Update it or it will mislead the next
  session.
- **`README.md` lists ~22 calculators; there are 53** (and it files `unit-price-calculator` under
  Home when it is in `shopping`). Generate that section from `data/calculators.ts` instead of
  maintaining it by hand.
- **No tests.** The `compute` functions are pure and trivially testable. Add snapshot tests over all
  53 **before** the region-formatting refactor (§3.3 step 4) — that refactor touches every
  calculator's output and is exactly where a silent regression would hide.

### 4.7 Format verdict

The format is **right for the goal** — a static, config-driven, per-tool-page calculator hub is
precisely what ranks for these queries. Three things need to change:

1. **Depth per page** (§4.2) — the single biggest blocker to ranking calculator pages.
2. **Country/unit awareness** (§3) — currently a US-only product served to five language markets.
3. **Canonical/hreflang correctness** (§2.1–2.2) — currently actively harmful, not merely absent.

No framework change, no re-platform, no URL migration.

---

## 5. Trending query analysis

The ten rising queries supplied, assessed against what the site has today. "Rising +N%" means growth
in search interest, not absolute volume — a fast-rising niche term can still be smaller than a flat
head term, so volume is judged separately below.

| # | Query | Rise | Have it? | Verdict |
|---|---|---|---|---|
| 1 | iban calculator | +50% | ✗ | **Build** — new `tech` category |
| 2 | ip subnet calculator | +40% | ✗ | **Build, but expect poor ad revenue** |
| 3 | bmi calculator for men | +30% | ~ partial | **Section on the existing page**, not a new page |
| 4 | bmr calculator | +30% | ~ folded into TDEE | **Split out into its own page** |
| 5 | date difference calculator | +30% | ✓ | **Already exists — this is a ranking problem, not a coverage problem** |
| 6 | calculator net | +20% | n/a | Navigational to a competitor — **not targetable**, but informative |
| 7 | birth chart calculator | +20% | ✗ | **Skip** — off-brand and expensive |
| 8 | maths solver | +20% | ✗ | **Partially addressable** via `math` category |
| 9 | calories calculator | +10% | ✓ | **Alias fix only** (plural variant) |
| 10 | house loan emi calculator | — | ✓ ×2 | **Alias + disambiguation** |

### 5.1 Build these (highest value)

**`iban-calculator` (+50%) → new `tech` category.** An IBAN validator/generator: check the country
code, length and MOD-97 checksum, and break the IBAN into bank code / branch / account number. Pure
client-side arithmetic, no API, no data feed — fits the existing config-driven engine with a custom
component (like `CurrencyConverter`). Strongest strategic fit of the whole list: it is a **European**
query and the site already ships DE/FR/ES/IT locales that currently have nothing Europe-specific in
them. Pair it with §3's country work. Note the term is "iban *calculator*" in search but the tool is
a validator — use "IBAN Calculator" as the title and cover "validator/checker/generator" in `aliases`.

**`bmr-calculator` (+30%) → split from TDEE.** BMR is currently only an alias on `tdee-calculator`.
That is the wrong call: "bmr calculator" is a distinct, high-volume query with its own intent (BMR is
the input, TDEE is the output). Give it its own page implementing Mifflin-St Jeor and Harris-Benedict
side by side, and cross-link the two. This is the cheapest win on the list — the formula work is
already inside the TDEE calculator.

**`math` category (+20% "maths solver", plus #6).** Do **not** attempt a symbolic maths solver —
Photomath, Symbolab and Mathway own that space with OCR and step-by-step engines, and it is a
different product. Do build the achievable subset that the same searchers also use:
`percentage-calculator`, `scientific-calculator`, `fraction-calculator`, `average-calculator`,
`ratio-calculator`. `percentage-calculator` alone is one of the highest-volume calculator queries in
existence and the site currently claims it in the homepage `keywords` array with **no page behind it**
(§1.6). This category also answers query #6: "calculator net" is people looking for a general-purpose
calculator hub — the site cannot rank for a competitor's brand name, but it can stop being a site
with no plain calculator on it.

**`ip-subnet-calculator` (+40%) — build, with an expectation caveat.** Genuinely high volume and
trivial to compute (CIDR → mask, network, broadcast, host range, host count). One honest caveat given
the AdSense monetisation goal: a developer audience runs ad blockers at far higher rates than
consumers, so this page will earn well below its traffic. Build it for the domain-authority and
internal-linking benefit, not for the RPM. Ship it alongside `data-storage-converter` and
`password-strength-checker` so the `tech` category has enough members to justify a landing page.

### 5.2 Fix on existing pages (cheapest wins)

**`bmi calculator for men` (+30%).** Do not build a separate page — it would be near-duplicate
content of `bmi-calculator` and both would compete. Instead, on the existing page: add a sex input
(it changes the healthy-range interpretation, not the BMI formula), then an H2 **"BMI for men"** and
an H2 **"BMI for women"** explaining the different body-composition caveats, plus matching FAQ
entries. Add `bmi calculator for men` / `for women` to `aliases`. This targets the modifier query
from a page that already has whatever authority the site has.

**`calories calculator` (+10%).** Pure alias gap: the page is `calorie-calculator` (singular) and the
query is plural. Google usually handles this, but not always in competitive spaces. Add
`calories calculator` to `aliases` and use the plural naturally once in the body copy. Zero-cost fix,
and a clean illustration of why §1.5 exists.

**`house loan emi calculator` (#10).** The site has *two* pages that could serve this —
`mortgage-calculator` and `emi-calculator` — which risks them cannibalising each other. Resolve
deliberately: make `mortgage-calculator` the primary target for *house/home loan* phrasing (it takes
down payment and property-specific inputs), keep `emi-calculator` as the generic
any-loan-type EMI tool, and have each link to the other with alias anchor text. Both carry
`house loan emi calculator` in `aliases`, but only `mortgage-calculator` uses it in an H2. Strong
India/UK signal — ties directly into §3's country work (EMI is the standard term in India; the US
says "monthly payment").

**`date difference calculator` (+30%) — the diagnostic case.** The site already has exactly this
calculator at exactly this slug. If it is not ranking, the cause is not coverage — it is everything in
§2: no canonical, no hreflang, no breadcrumb structured data, ~150 words of content, and a
five-locale duplicate set. **Use this page as the pilot for Phase 2.** Ship the full §2 + §4.2
treatment on `date-difference-calculator` alone, then watch Search Console for 2–3 weeks. If its
impressions and position move, the rest of Phase 2 and 3 is validated before being applied to 80
pages. If they do not, the diagnosis is wrong and it is worth stopping to re-check before spending
the effort.

### 5.3 Skip

**`birth chart calculator` (+20%).** Astrology natal charts need an ephemeris (planetary positions by
date/time/place), timezone-historical data and a chart renderer — an order of magnitude more work
than any tool currently on the site, with an ongoing data dependency. It also sits oddly beside
mortgage and tax calculators, diluting the "trustworthy everyday utility" positioning the design
document is built around. If astrology traffic is genuinely wanted later, it belongs on a separate
site, not this one.

**`maths solver` as a literal solver (+20%).** See §5.1 — build the arithmetic subset, not the solver.

**`calculator net` (+20%).** A navigational query for calculator.net. Unrankable by design. The useful
signal is what it reveals: people search for a *general* calculator destination, which supports the
`math` category and a plain `scientific-calculator` page as an entry point.

### 5.4 Should the site chase "IP" queries? Mostly no.

The second trend set (`my ip`, `what is my ip`, `ip address`, `static ip`, `ip camera`…) is a
different proposition from `ip subnet calculator`, and the answer is different too.

**First, read the India data carefully — it is not about networking at all.**

| Query | What it actually means |
|---|---|
| `ip 18 pro`, `ip 18`, `ip 17 pro` (+350/300/60%) | **iPhone** 18 Pro. "ip" = iPhone shorthand. |
| `folic acid tablet ip 5 mg`, `aceclofenac tablet ip 100 mg` (+100/70%) | **Indian Pharmacopoeia** — a drug-standards marking on medicine packaging. |
| `ip gardens` (+170%) | A property/real-estate name. |
| `advanced ip scanner download`, `ip messenger download`, `ip finder download` | Desktop **software downloads**, not web tools. |
| `ip india` | The **Indian Patent Office** (ipindia.gov.in) — intellectual property. |

Seven of those ten India results have nothing to do with IP addresses. Chasing "ip" in India means
competing against iPhone retailers, a pharmacopoeia and the patent office for a term the site cannot
disambiguate. That is a trap, and it is a good illustration of why raw trend lists need intent
checking before they become a roadmap.

**Second, the genuine networking queries are the wrong kind of traffic for this site:**

1. **Google answers "what is my IP" itself.** It renders the visitor's IP directly in a SERP widget
   above every organic result. This is a **zero-click query** — the volume is real and almost none of
   it reaches a website. Ranking #1 for it would still produce very little traffic.
2. **The trend direction is flat-to-negative.** `my ip address` −10%, `ip address` −7%, `static ip`
   −10%, `ip camera` −7%. The rising variants (+10-20%) are phrasings of the same zero-click query.
   Nothing here is actually growing.
3. **The competition is entrenched and single-purpose.** whatismyipaddress.com, whatismyip.com and
   ipinfo.io have spent 15+ years and thousands of backlinks on exactly this one term.
4. **The monetisation is poor.** A tech audience blocks ads at far higher rates, and the visit
   pattern is read-one-number-and-leave — near-zero dwell time and a very low ad RPM. This directly
   conflicts with the AdSense goal.
5. **It dilutes topical authority.** Google reads a site's overall subject matter. "Daily
   Calculations" reading as a finance/health/measurement utility is a coherent signal; bolting on an
   IP lookup makes it a generic tools grab-bag, which weakens the calculator pages that are the
   actual business.
6. **`ip camera` and `static ip` are not tools at all** — one is shopping intent, the other an ISP
   support question. Neither has a build.

**Verdict:**

| Tool | Decision |
|---|---|
| `ip-subnet-calculator` (`ip subnet calculator`, +40%) | ✅ **Build** — it is a genuine *calculation* (CIDR → mask, network, broadcast, host range, host count), Google does not answer it inline, and it belongs in the `tech` category with the other §5.1 tools. The RPM caveat from §5.1 still applies: build it for authority, not revenue. |
| `what is my ip` / `my ip address` | ❌ **Skip** — zero-click, flat trend, entrenched competitors, poor RPM, dilutes topical focus. |
| `ip camera`, `static ip`, `ip finder download` | ❌ **Skip** — shopping, support and software-download intent. No tool to build. |
| `ip 18 pro`, `tablet ip`, `ip india` | ❌ **Not networking.** Ignore entirely. |

If an IP lookup is wanted later anyway, the technical fit is actually fine and worth recording: a
Cloudflare Workers route reading the `CF-Connecting-IP` header, with the page itself static and
fetching that endpoint client-side. That preserves the `force-static` build (§3.4). The objection is
strategic, not technical — so this is a "later, deliberately", not a "can't".

**The broader lesson for using trend data:** check search *intent* before adding a calculator. Of the
20 rising queries reviewed across both lists, 4 justify a build (`iban`, `bmr`, `ip subnet`,
`percentage`/math), 4 are fixes to pages that already exist (`bmi for men`, `calories`,
`house loan emi`, `date difference`), and 12 are noise — competitor brands, ambiguous abbreviations,
zero-click queries or off-brand verticals.

### 5.5 Net effect

53 → **~70 calculators** (11 new from §5.1, plus the education and text additions from §1.5), and
11 → **14 categories**, with no category below 2 members. Sequence the new builds *after* Phase 2 —
adding pages to a site whose canonicals are broken just creates more pages Google will not index.

---

## 6. Suggested execution order

> **Superseded.** This ordering was re-sequenced into 28 self-contained steps in **`mdFiles/STATUS.md`**,
> which accounts for the English-only decision and is the tracker development actually runs off.
> Kept below for the reasoning behind the phase boundaries.

**Phase 1 — Correctness (nothing else works until this is done)**
1. Resolve the domain conflict; add `lib/site.ts` (§0).
2. `buildAlternates` + canonical & hreflang on **every** page (§2.1, §2.2).
3. Fix the two sitemap bugs; real `lastModified` (§2.4).
4. Decide the untranslated-locale policy: translate, or `noindex` for now (§2.6).

**Phase 2 — Deep-link ranking (pilot on `date-difference-calculator` first, §5.2)**
5. Add `aliases` / `related` / `updatedAt` to all 53 calculators (§1.5).
6. `WebApplication` + `BreadcrumbList` + `HowTo` JSON-LD, plus a visible breadcrumb (§2.3).
7. "Also known as" line, "Related calculators" block, alias-aware search (§1.4).
8. Fix or remove `SearchAction`; add `?q=` to the listing page (§2.7, §4.5).
9. Clean the homepage `keywords`; drop `graphing calculator` (§1.6).
10. **Measure for 2-3 weeks before proceeding.**

**Phase 3 — Category restructure**
11. Rename `social` → `creator`; merge `taxes` → `shopping`; add `travel`, `text`, `math`, `tech` (§1.2).
12. Apply the 9 reassignments; add 301s for `/categories/taxes` and `/categories/social` (§1.2).

**Phase 4 — Content depth**
13. Restructure the calculator template; per-calculator How-to, Formula, Worked example (§4.2).
14. Expand FAQs from 2 → 6-8 per calculator.
15. Lift the widget above the fold (§4.3).
16. `bmi-calculator`: sex input + "BMI for men" / "BMI for women" sections (§5.2).

**Phase 5 — New calculators (§5.1, §1.5)**
17. `bmr-calculator` (cheapest — formula already exists inside TDEE).
18. `percentage-calculator`, `scientific-calculator`, `average-calculator`, `fraction-calculator`, `ratio-calculator`.
19. `iban-calculator`, `ip-subnet-calculator`, `data-storage-converter`, `password-strength-checker`.
20. `word-counter`; `grade-calculator`, `final-grade-calculator`, `weighted-average-calculator`, `study-time-calculator`.

**Phase 6 — Country awareness (9 regions: US, GB, EU, IN, AE, TH, ID, CN, AU)**
21. Snapshot tests over all `compute` functions — **before** step 22, not after (§4.6).
22. `lib/regions.ts` with all nine profiles + `RegionProvider` + region-aware formatters
    (§3.3 steps 1, 4; values in §3.5).
23. `cf-ipcountry` detection, cookie-first, no redirect (§3.3 steps 2-3).
24. Country switcher + dismissible suggestion banner (§3.3 steps 3, 7).
25. **Wave 1 — English, Google-dominant, high ad rates:** US, GB, IN, AU, AE.
    Ship UK stone + imperial-gallon MPG, Indian lakh/crore grouping + CGPA-10 + "EMI" wording,
    UAE no-income-tax paycheck, AU superannuation + GST (§3.5).
26. **Wave 2 — Europe:** EU profile + DE/FR/ES/IT VAT overrides, comma decimal separator,
    L/100km, VAT-removal mode on the sales tax calculator (§3.5).
27. **Wave 3 — needs new locales first:** TH (Buddhist-era dates), ID (zero-decimal IDR), CN.
    Add `th` / `id` / `zh` to `routing.locales` and translate, or these regions get correct
    currency on an English page and nothing more (§3.5). Do not expect mainland-China Google
    traffic — that is a Baidu problem.
28. Unit-aware inputs on the priority calculators; region tax labels; Asian BMI threshold note
    (§3.3 steps 5-6, §3.5).
29. Live FX rates via KV (§3.3 step 8).

**Phase 7 — Hygiene**
30. `.gitignore` the logs and tsbuildinfo; regenerate `README.md`; refresh `mdFiles/memory/project_i18n.md` (§4.6).
31. Search Console: submit sitemap, request indexing on top 15 calculators, monitor the
    duplicate-canonical report (§2.8).

---

## 7. How to tell it worked

| Signal | Where | Target |
|---|---|---|
| "Duplicate, Google chose different canonical" | Search Console → Pages | Trending to ~0 |
| Indexed pages | Search Console → Pages | Approaching 265 (en) — or 5× that if locales get translated |
| Impressions on `/calculators/*` vs `/` | Performance → Pages | Leaf pages > homepage |
| Breadcrumb rich results | Enhancements | Valid, 0 errors |
| Queries per calculator page | Performance → filter by page | Alias terms appearing, not just the exact title |
| `date-difference-calculator` position | Performance → filter by page | The Phase 2 pilot signal — moves or the diagnosis is wrong |
| Country switcher usage | Analytics event | Confirms geo-detection matches intent |
