# Competing with Omni Calculator — analysis + strategy

Written 2026-10-12. Proposal only — **nothing here is in `STATUS.md` yet.** The proposed steps
(§6) need a yes before they are added to the step index.

---

## 1. What Omni actually is

| | Omni Calculator | Daily Calculations (today) |
|---|---|---|
| Calculators | **3,938** across 14 categories | **53** across 12 categories |
| Traffic | ~14–18M visits/month, mostly organic | new domain, pre-measurement |
| Age | launched 2016, ~10 years of links | months |
| Biggest categories | Math 687 · Finance 618 · Physics 546 · Health 440 | Finance 8 · Auto 6 · Health 6 · Home 6 |
| Page length | ~1,100 (BMI) to ~3,500 words (loan) | ~1,400 on the pilot, much less on the other 52 |
| Bylines | named author + named reviewer, with credentials (MD, PhD) | none |
| Citations | yes, peer-reviewed / Investopedia | none |
| Widget | multi-mode, per-field units, share result, reload, clear, charts | basic form (`CalculatorForm.tsx` is 71 lines) |
| Ads | yes (Google Ad Manager) | none |
| Speed | heavy — ads + scripts | static, edge-served, fast |
| Region | separate country-specific calculators (UK salary, India GST …) | 9 region profiles via cookie (planned, steps 18–21) |

### Page anatomy (loan / BMI / percentage pages)

1. Breadcrumb + H1
2. **Widget first**, grouped into labelled sections, with **Share result · Reload · Clear**
3. Result **visualization** (payment breakdown chart, BMI scale)
4. "Did we solve your problem today?" Yes/No → "822 people find this calculator helpful"
5. Related calculators (variants: BMI men / women / kids)
6. **Author + reviewer cards** with bios and LinkedIn links
7. Table of contents → long article: concept, terms glossary, formula + derivation,
   real-world example, usage scenarios, ranges/tables, "other considerations", disclaimer
8. FAQ (often only 2–4 entries)
9. References

### Category pages

The H1 shows the count ("618 calculators"), then an intro paragraph, then **12 emoji-labelled
subcategory groups**, each a list of title + 1–2 sentence description. These are big internal-link
hubs.

### Homepage

"Your life in 3938 free calculators", a category grid with counts, a strip of **~25 press logos**,
a mission statement, team photos, and the 16 most popular calculators.

### How they got there

- **Breadth.** One page per specific "X calculator" search, thousands of them, including cheap
  high-volume **converters** (oz→ml, L→gal).
- **E-E-A-T.** Real experts as authors and reviewers. This matters most on finance and health
  pages, which Google treats as YMYL ("your money or your life") topics.
- **Links + press.** Newsworthy calculators get media coverage, and media coverage brings links.
  They have also bought topically relevant sites and merged them in.
- **Time.** Ten years.

---

## 2. The honest strategic read

> **Revised 2026-10-12: decision to go broad.** The user chose to cover Omni's sectors too
> (science, statistics, construction, food, sports …), not just the everyday lane. The original
> "narrow lane" advice is replaced by **§4 Sector expansion**: go broad **in waves**, with each
> sector reaching critical mass before the next one opens. Everyday money/home/time stays the
> **first** lane to finish, not the only one.

Matching Omni's 4,000 pages, ten years of links and PhD reviewers won't happen quickly. Going broad
works only if each sector we open is **deep enough to count as an authority** (~25–40 calculators
with real content), rather than 15 sectors with 3 thin pages each. Google judges topical authority
cluster by cluster.

Where Omni is weak, and where we can win in every sector:

1. **Everyday first.** Omni's center of gravity is academic: physics, chemistry, statistics. The
   name "Daily Calculations" fits the everyday lane best: money, home, car, travel, time, work and
   shopping. It's the first lane to finish and our home base while the other sectors grow.
2. **Region-native answers on one URL.** Omni handles locale by adding more pages. Our cookie
   layer (D6) gives a UK visitor stones and imperial-gallon MPG, an Indian visitor lakh/crore and
   "EMI", and a UAE visitor zero income tax, all on the same canonical page. Done well, this is a
   real differentiator, so **Phase E becomes strategic, not polish.**
3. **Speed and calm UX.** Omni pages are slow and crowded with ads. A fast, static, iOS-clean page
   (the Apple/iOS direction is already chosen) with disciplined ad placement is a better product.
   It also helps rankings through Core Web Vitals, Google's page-experience metrics.
4. **Richer results per page.** Omni's widgets solve the equation. Ours can also answer the
   decision: amortization tables, "what if I pay ₹X extra", side-by-side scenarios.

What we **must** copy, because without it a calculator site doesn't rank in 2026:

- Long-form, genuinely educational content with a table of contents (concept → formula →
  example → pitfalls → FAQ → references)
- Author/reviewer bylines and an editorial policy. **Real people only — never invented
  credentials.** Until a credentialed reviewer exists, use "Daily Calculations editorial team" plus
  a public methodology page.
- Citations on every finance and health page
- Share result, reset and copy result, plus per-field unit switching
- Subcategory hubs on category pages
- Enough pages to look like a real authority in each cluster (~15–25 per cluster we keep)

---

## 3. Feature gap list (Omni has it → we don't)

| # | Feature | Impact | Effort | Notes |
|---|---|---|---|---|
| F1 | TOC + concept section + references + disclaimer in the template | **High** | S | Extends step 10's `CalculatorContent`. Must land **before** rollout steps 12–15, or 52 pages get written twice. |
| F2 | Byline + `lastReviewed` + editorial policy / methodology pages | **High** (YMYL) | S | `Person`/`Organization` JSON-LD. No fake people. |
| F3 | Share result (values in query string, read client-side) | Med | S | Canonical stays the clean path; query URLs are never indexed. Works with `force-static`, because params are read only after hydration. |
| F4 | Reset / clear / copy-result buttons | Low-Med | XS | |
| F5 | Per-field unit switching (incl. mixed ft+in, st+lb) | **High** | M | Overlaps with region profiles. Region sets the default unit and the field lets the user override it. Build together with step 18. |
| F6 | Result visualization (breakdown donut, amortization table, BMI scale) | **High** | M | Hand-rolled SVG, **no chart library** (keeps the bundle small). |
| F7 | Multi-mode calculators ("solve for X") | **High** on the right pages | M each | Don't build Omni's generic equation solver. Add a `modes` option per calculator for the pages where it matters: percentage (4 modes), loan (payment / term / rate), speed-distance-time, discount. |
| F8 | "Was this helpful?" + real helpful count | Low-Med | S | Store counts in KV through an `app/api` route, and only show a count once it's real. |
| F9 | Category hubs: subcategory groups, intro copy, count, `ItemList` + `BreadcrumbList` | Med | S | Closes the Parked "category pages emit no JSON-LD" item. |
| F10 | Homepage v2: count, popular, "why us" section | Med | S | **No press-logo strip until there's real press.** |
| F11 | Ad slots | Revenue | S + consent work | See §5. |
| F12 | Embeddable widget (`/embed/<id>`, `noindex`, "Powered by Daily Calculations" link) | **High** for links | M | Our best scalable link-building engine. Omni doesn't lean on this, so it's open ground. |
| F13 | Variant calculators (BMI women / men / kids, etc.) | Med | XS each | Just more objects in `data/calculators.ts`. |

---

## 4. Sector expansion — going broad like Omni

### 4.1 Target taxonomy

Omni's 14 top-level sectors are Biology · Chemistry · Construction · Conversion · Ecology ·
Everyday life · Finance · Food · Health · Math · Physics · Sports · Statistics · Other. Here they
are mapped onto ours:

| Our sector | Status | Omni equivalent | Merges / notes |
|---|---|---|---|
| finance, shopping | exists | Finance | Shopping stays as the everyday-money front door |
| health | exists | Health | YMYL: citations required |
| measurements → **Conversion** | exists, relabel | Conversion | Keep the id `measurements` (URLs don't change); change the label only |
| home → **Home & Construction** | exists, widen | Construction | Concrete, drywall, paint, roofing, tiles, stairs |
| auto, time, travel, work, text, creator, education | exist | Everyday life / Other | Deepen |
| math | step 24 | Math | |
| tech | step 25 | Other | |
| **statistics** | new | Statistics | p-value, confidence interval, z-score, standard deviation, sample size. Several sit on Omni's "most popular" list |
| **physics** | new | Physics | Needs the solver and units work (§4.3) |
| **chemistry** | new | Chemistry | Molarity, dilution, molar mass, pH, ideal gas |
| **biology** | new | Biology | Cell dilution, bacteria growth, Punnett square, genetics |
| **food** | new | Food | Recipe scaling, cooking conversions, macros, coffee ratio |
| **sports** | new | Sports | Pace, running splits, one-rep max, heart-rate zones, golf handicap |
| **ecology** | new | Ecology | Carbon footprint, solar payback, water usage. Fits "daily" well |

End state: **~20 sectors, each split into subcategory groups** (F9), like Omni's finance page.

### 4.2 Expansion waves

A sector opens only when we can ship it with **≥ 25 calculators on the v2 template** within about
6 weeks. Waves are ordered by search volume × ad revenue × build cost × risk:

| Wave | Sectors | Why this order | Target |
|---|---|---|---|
| **0** (now) | finish everyday: finance, health, home, auto, time, travel, work + steps 23–26 | Home base. These pages already exist, so improving them is the cheapest gain | ~100 |
| **1** | **math, statistics, conversion** | Highest search volume on the web, simple formulas, no YMYL risk, and step 24 already plans math | +120 → ~220 |
| **2** | **construction, food, sports** | Everyday-adjacent, so they fit the brand. Construction has strong ad revenue (contractors, DIY) | +100 → ~320 |
| **3** | **physics, chemistry** | Huge student volume and attracts links from schools and universities, but lower ad revenue (students). Needs §4.3 first | +120 → ~440 |
| **4** | **biology, ecology, fun/other** | Long tail, PR-friendly (ecology and fun pages get press) | +80 → ~520 |

**Throughput:** we're one person, so the content pipeline is what sets the timeline. At 10
calculators/week (AI draft, then a human check of formula, worked-example arithmetic and
citations), ~470 new pages takes **~11 months**. At 5/week it takes about two years. Picking the
pace is the real decision. Every new `compute()` gets a snapshot test (step 17).

**Converters guardrail:** each unit pair gets a real page (table, context, common values), not a
templated stub. We only build pairs with real search volume. Thin programmatic pages are exactly
what Google's Helpful Content system demotes.

**Country-specific distinct calculators** (e.g. `uk-income-tax-calculator`,
`india-income-tax-calculator`) are different calculations, not region variants of one page, so
they don't conflict with D6. Flagged as a decision anyway.

### 4.3 Architecture that breaks at 500 calculators (fix before Wave 1)

| Problem | Today | Fix |
|---|---|---|
| **One data file** | `data/calculators.ts` is 1,918 lines for 53. At 500 it would be ~20k lines | Split into `data/calculators/<sector>.ts` + an index that concatenates them. Same `CalculatorConfig`, same "one object = one page" rule |
| **Middleware bundle** | `lib/redirects.ts` imports *all* calculators (Parked item, +81 KB gz at 53). At 500 this approaches Cloudflare Workers' script size limit | Build-time codegen of a literal redirect map. The Parked item becomes a must-do |
| **Client search index** | Homepage passes every calculator to the client search | Emit a static `search-index.json` at build and fetch it when search is first used |
| **Units** | Hard-coded per calculator | `lib/units.ts`: one hand-rolled conversion table (length, mass, volume, temperature, pressure, energy …), no dependency. Feeds F5 and the region defaults |
| **Solve-for-any-variable** | One-direction `compute()` | Physics and chemistry *need* it (F = m·a, solved for m). Add an optional `solve: { [fieldId]: fn }` map to `CalculatorConfig`, so the widget solves for whichever field is left empty. This upgrades F7 from "a few pages" to core infrastructure |
| **URLs** | `/calculators/<slug>` (flat) | **Keep flat.** Omni uses `/<sector>/<slug>`, but switching would mean 301-ing every page for no ranking gain. Sector lives in the breadcrumb and JSON-LD |
| **Categories in nav** | 12 in a grid | At ~20 sectors: grouped mega-menu or sector index page, with search as the main navigation |

### 4.4 Trust per sector

- **Finance / health:** YMYL. Citations are mandatory, and so is a disclaimer. A real
  credentialed reviewer is the single biggest upgrade when one becomes available.
- **Science / statistics:** cite textbooks, NIST and IUPAC. Worked examples must be numerically
  verified, because students check them.
- **Construction / food / sports:** cite manufacturer or industry standards (e.g. concrete mix
  ratios, USDA cooking temperatures).

---

## 5. Monetization (ads) — rules

- 1–2 clearly labelled ("Advertisement") slots: one **after the widget/result**, one
  **mid-article**. **Never above the widget**, never styled to look like content.
- Reserve slot height in CSS so ads never shift the layout (CLS).
- **EU/UK/EEA traffic needs a Google-certified consent platform (CMP)** before personalized ads
  serve, which matters because `GB` and `EU` are two of our nine regions. This is new work and a
  new dependency, so it gets logged in STATUS.
- Order: AdSense once ~100 deep pages exist, then move to a premium network once traffic qualifies.
  Applying with 53 thin pages risks a "low-value content" rejection.

---

## 6. Proposed roadmap changes

Two things to resolve **before** anything new:

- ⚠️ **Step 11 gate: is Search Console actually live?** The pilot deployed 2026-09-10, so the
  2–3 week window has passed. But step 28 (verify domain, submit sitemap) is still `TODO`. If GSC
  isn't verified, the gate **can't be measured**. Pull step 28's verify + sitemap part forward
  now. Bing is already wired up through step 29.
- **Template before rollout.** F1/F2 change what every content page contains, so they must come
  before steps 12–15.

Proposed new **Phase H — "Omni parity" template**, inserted between the step-11 gate and the
12–15 rollout:

| # | Step | Scope |
|---|---|---|
| 30 | Template v2 | F1 + F2: TOC, concept section, references, disclaimer, byline, `lastReviewed`. Re-populate the pilot only. |
| 31 | Trust pages | Editorial policy, methodology, real About page; `Organization`/`Person` JSON-LD. |
| 32 | iOS visual pass | Apply the chosen Apple/iOS tokens site-wide. Fix the Parked dead `brand-*` shades in the same pass. |
| 33 | Widget v2 | F3 + F4 + F6 (share, reset, copy, SVG result visuals). F5 units waits for step 18. |
| 34 | Multi-mode calculators | ~~F7 modes~~ **Superseded by step 43** (a general solve-for-any-field), now that we're going broad. |
| 35 | Category + home v2 | F9 + F10. |
| 36 | Helpful feedback | F8 (KV). |
| 37 | Embed widget | F12. |
| 38 | Ads + CMP | F11 + §5. **Only after ~100 deep pages.** |

Proposed **Phase I — scale infrastructure** (§4.3), required before Wave 1:

| # | Step | Scope |
|---|---|---|
| 39 | Split the data file | `data/calculators/<sector>.ts` + index. Pure move; output byte-identical. |
| 40 | Redirect-map codegen | Closes the Parked middleware-bundle item. |
| 41 | Static search index | `search-index.json` at build, loaded lazily. |
| 42 | `lib/units.ts` | Shared unit tables; F5 per-field unit switching built on top. |
| 43 | Solve-for-any-field | Optional `solve` map on `CalculatorConfig`; replaces step 34's narrower "modes". |
| 44 | Taxonomy v2 | Add the new sector ids, subcategory field, Conversion relabel, Home & Construction widening, nav for ~20 sectors. Same shape as step 16. |

Then **Phase J — sector waves** (§4.2), in batches of ~10 calculators per step (same shape as
steps 12–15). Each wave ends with a mini measure gate: if the wave's sector isn't gaining
impressions 4–6 weeks after completion, re-diagnose before opening the next wave.

Revised order:

```
28a (GSC verify) → 11 gate verdict → 30 → 31 → 32 → 12–15 (Wave 0 rollout on v2 template)
                                         ↘ 17 → 18 → 19–22 (region layer)
17 → 39 → 40 → 41 → 42 → 43 → 44 → Wave 1 → gate → Wave 2 → gate → Wave 3 → gate → Wave 4
23–26 fold into Wave 0 / Wave 1 · 33, 35–37 any time after 32 · 38 (ads) once ~100 deep pages
```

---

## 7. How we'll know it's working

Per cluster, monthly, in Search Console: impressions, average position on the head term,
clicks/CTR, and the count of pages ranking in the top 10. Plus referring domains (embed + PR) and,
once ads are live, RPM. A cluster that doesn't move after its content is complete gets
re-diagnosed before we build more like it. That's the same discipline as the step-11 gate.

Sources: omnicalculator.com (home, `/finance`, `/finance/loan`, `/health/bmi`, `/math/percentage`,
fetched 2026-10-12); Similarweb (June 2026 traffic); ahrefs "The free tools SEO strategy";
Rankulate's Omni acquisition case study.
