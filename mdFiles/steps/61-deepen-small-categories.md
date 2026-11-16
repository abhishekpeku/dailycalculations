# Step 61 — deepen every category currently under 10 calculators

Off the numbered build-order sequence that D13 locked (physics/chemistry/biology/ecology/fun-
other/tech) — this is a separate, user-requested piece, same "more calculators, never fewer"
spirit as D17. Branch per batch: `step/61-deepen-<category>`.

User asked (2026-11-15): for every category under 10 calculators, think about real additions and
bring each to **at least 10** — more is fine if the category genuinely supports it. 9 categories
qualify today: `auto` (6), `creator` (2), `education` (1), `health` (6), `shopping` (5), `text`
(2), `time` (5), `travel` (4), `work` (4) — 41 calculators today, 98 once every category reaches
exactly 10 (57 new pages). Counts will drift as other in-flight work (step 60, UX-13) lands —
regenerate each category's current id list before starting its batch, same discipline as every
other wave.

## Discipline — same as every prior wave, not relaxed because these are small categories

- **Dedupe against the whole site first**, not just the category being deepened. Several ideas
  below sit close to existing pages in `finance`, `home`, `sports`, or the still-unbuilt Wave 5
  seed lists (`mdFiles/omni-strategy.md` §4.5) — each entry below already notes the nearest
  neighbor and why it's genuinely distinct; verify that reasoning still holds (another wave may
  have shipped something that changes the answer) and grep every new id/alias before writing it.
- **Every worked-example number independently re-verified in a scratchpad script** (no app
  imports) before committing.
- **Every cited figure/formula** (body-fat %, ideal-weight formulas, readability formula, day-of-
  week algorithm, severance norms, etc.) **fetched from a real source**, not recalled — note which
  source per calculator, same as every YMYL/health/finance page on this site already does.
- `seo.title` ≤60 chars, `seo.description` ≤160 chars, 6 FAQs, ≥4 aliases per page.
- `npm test` / `npm run lint` / `npm run build` all green before every commit.
- If a listed idea turns out, on closer inspection, to be too thin to cite properly or genuinely
  duplicates something — **skip it and say so**, same "no change needed"-style honesty as UX-10,
  rather than forcing a weak page just to hit the count. The user said "10, more is fine" — they
  did not say "pad to exactly 10 no matter what." A category landing at 9 real pages plus one
  honest skip is better than 10 pages with one fabricated one.

## Batches — one category per batch (matches step 60's own ~5-per-batch granularity; split a
category into sub-batches if its list is large, same judgment call chemistry/physics used in UX-10)

### Batch 1 — `auto` (6 → 11)
- `lease-vs-buy-calculator` — total cost of leasing vs. financing a car over N years; real,
  extremely common comparison, cite standard lease-math (residual value, money factor → APR
  equivalent).
- `car-depreciation-calculator` — estimated value loss over time (straight-line or a cited
  declining-balance schedule, e.g. typical ~20% year-1 / ~10-15%/yr after, cite a real source for
  the rate assumption, state it's an estimate).
- `tire-size-calculator` — diameter/circumference from a tire's sidewall code (e.g. 225/45R17) and
  the speedometer-error % from a size change; real, well-defined geometry formula.
- `gas-mileage-comparison-calculator` — fuel cost difference between two vehicles over a given
  annual mileage; distinct from the existing single-vehicle `gas-cost-calculator` (comparison, not
  one trip). **Skipped 2026-11-16**: the existing `fuel-cost-calculator` (added step 2026-10-21,
  group "Fuel & Energy Costs") already does exactly this — annual miles, your car's mpg, a
  "comparison car" mpg field, one shared fuel price, and an `annualSavings` output comparing a
  year of fuel in each car, with a `compareBars` visual of the two annual costs. A new page built
  to this spec would be a near-duplicate, not a genuinely distinct calculator, so it was skipped
  per the step's own discipline ("skip it and say so" beats padding to a count).
- `parking-cost-calculator` — monthly vs. daily/per-visit parking cost breakeven given visits/week.

### Batch 2 — `work` (4 → 10)
- `overtime-pay-calculator` — time-and-a-half/double-time pay from hours+rate+FLSA-style rules;
  very commonly searched, distinct from `salary-raise-calculator`.
- `severance-pay-calculator` — weeks of pay from tenure using a cited common formula (e.g. 1-2
  weeks/year of service), stated clearly as a typical-practice estimate, not a legal entitlement.
- `cost-of-living-comparison-calculator` — salary needed in city B to match city A's purchasing
  power, citing a real COL index methodology (e.g. BLS/Numbeo-style ratio) — be explicit about the
  index source and its limits.
- `remote-work-savings-calculator` — commute cost + time saved by WFH days/week; cross-link to
  `auto`'s `commute-cost-calculator` rather than recompute its math differently.
- `job-offer-comparison-calculator` — normalize two offers (base + bonus + benefits value) side by
  side; real, popular, multi-input comparison.
- `paid-sick-leave-accrual-calculator` — accrual-rate-based balance, same pattern as the existing
  `pto-calculator` but for sick leave specifically (many employers track them separately).

### Batch 3 — `health` (6 → 11)
- `body-fat-percentage-calculator` — U.S. Navy circumference method; real, standard, well-cited
  formula, distinct from BMI.
- `ideal-weight-calculator` — a cited formula (e.g. Devine or Robinson), stated as one of several
  estimate methods, not a target to chase.
- `macro-calculator` — protein/carb/fat gram split from a calorie target (pairs with the existing
  `calorie-calculator`/`tdee-calculator`, different output shape — grams per macro, not calories).
- `waist-to-hip-ratio-calculator` — WHO-cited health-risk indicator, distinct metric from BMI.
- `blood-alcohol-content-calculator` — Widmark formula; real and commonly built on calculator
  sites, but needs a prominent, specific disclaimer ("estimate only, never use to judge fitness to
  drive — call a cab/ride share instead") given the safety stakes.

### Batch 4 — `shopping` (5 → 10)
- `warehouse-club-membership-breakeven-calculator` — annual membership fee ÷ per-trip savings =
  break-even trip count; real, popular ("is Costco worth it" is a genuine search pattern).
- `grocery-budget-calculator` — weekly/monthly grocery budget from household size, cite a real
  reference range (e.g. USDA food plan tiers) rather than inventing numbers.
- `loyalty-points-value-calculator` — points/miles to cash value from a cents-per-point rate; cite
  that the rate varies by program and let the user supply it.
- `layaway-payment-calculator` — installment schedule to pay off a layaway balance by a target date.
- `free-shipping-threshold-calculator` — whether adding items to reach a free-shipping minimum is
  actually cheaper than paying the shipping fee outright.

### Batch 5 — `travel` (4 → 10)
- `jet-lag-calculator` — recovery-days estimate from timezones crossed and direction (eastward
  travel is cited as harder to adjust to than westward — cite a real circadian-adjustment source).
- `luggage-fee-calculator` — overweight/oversize baggage fee estimate from a user-entered airline
  fee schedule.
- `travel-points-value-calculator` — airline/hotel points redemption value, same pattern as
  shopping's `loyalty-points-value-calculator` but travel-program-specific — cross-link, don't
  duplicate the write-up.
- `points-vs-cash-flight-calculator` — whether redeeming points or paying cash is the better deal
  for a specific flight, given the user's own points-value assumption.
- `daylight-hours-calculator` — sunrise/sunset-derived daylight length for a date + latitude; a
  real, citable astronomical formula, genuinely useful for trip planning.
- `tipping-abroad-calculator` — lookup-style calculator (like the existing resistor-color-code
  pattern) over a small, explicitly-sourced table of common tipping norms by country/region — cite
  real sources per entry, and where a country's norm can't be confirmed from a real source, leave
  it out of the table rather than guessing.

### Batch 6 — `time` (5 → 10)
- `business-days-calculator` — days between two dates excluding weekends (and optionally a
  user-entered holiday list); clearly distinct from the existing `date-difference-calculator`
  (calendar days).
- `day-of-week-calculator` — what day of the week a given date falls/fell on, cite a real
  algorithm (e.g. Zeller's congruence or the Doomsday rule), not a lookup table.
- `leap-year-calculator` — whether a year is a leap year, and the count of leap years between two
  years, using the real Gregorian rule (÷4, not ÷100 unless ÷400).
- `unix-timestamp-converter` — epoch seconds ↔ human-readable date/time.
- `timesheet-calculator` — weekly multi-day hours + overtime rollup; distinct from the existing
  `work-hours-calculator` (single shift) by being the weekly aggregate with an overtime threshold.

### Batch 7 — `creator` (2 → 10)
- `tiktok-earnings-calculator` — Creator Fund/Rewards-style estimate from views; cite a real
  published rate range, state clearly that TikTok doesn't publish an exact rate.
- `twitch-earnings-calculator` — subs + bits + ad-revenue estimate from a streamer's own inputs.
- `podcast-ad-revenue-calculator` — CPM-based sponsorship estimate from downloads.
- `blog-ad-revenue-calculator` — RPM-based estimate from monthly pageviews, same pattern as the
  existing `youtube-earnings-calculator`'s RPM field.
- `patreon-earnings-calculator` — tiers × subscribers, minus the platform's cited fee percentage.
- `affiliate-commission-calculator` — clicks × conversion rate × commission rate; cross-link to the
  future Wave-5 biz-tax `commission` calculator (that one is sales-commission generally, this one
  is affiliate-marketing-specific — state the distinction, don't duplicate the write-up).
- `follower-growth-rate-calculator` — % growth over a period + a simple linear projection.
- `video-engagement-rate-calculator` — (likes+comments+shares)/views; distinct metric shape from
  the existing `instagram-engagement-calculator` (which is follower-based), cite which platforms
  use this view-based convention.

### Batch 8 — `text` (2 → 10)
- `word-counter-calculator` — the long-planned step-26 addition (still valid, never built);
  word/character/sentence counts framed around word count specifically rather than character's own
  framing.
- `readability-score-calculator` — Flesch-Kincaid grade level; real, well-cited formula.
- `word-to-page-count-calculator` — words → estimated page count given font size/spacing
  (single/double); popular with students/writers.
- `keyword-density-calculator` — keyword occurrence ÷ total words, an SEO utility.
- `syllable-counter-calculator` — a real syllable-estimation algorithm (cite it, e.g. a vowel-group
  heuristic), useful standalone and as a readability-score building block.
- `typing-speed-calculator` — WPM from a word count + elapsed time the user enters (not a live
  typing test — matches this site's "enter numbers, get a result" pattern rather than becoming an
  interactive mini-app).
- `script-reading-time-calculator` — spoken-delivery time estimate using a cited speaking-rate
  (~130-150 wpm), distinct from the character-counter's existing silent-reading-time figure
  (~200 wpm) — state the different rate and why.
- `tweet-thread-length-calculator` — how many posts a piece of text needs split across a platform's
  character limit; reuses `character-counter`'s already-cited platform limits table.

### Batch 9 — `education` (1 → 10)
- `grade-calculator` — weighted-category grade average (quizzes/tests/homework weights); the
  original step-26 idea, still valid.
- `final-grade-calculator` — "what do I need on the final" given current grade, final's weight, and
  a target grade; extremely commonly searched, distinct from `grade-calculator`.
- `study-time-calculator` — recommended study hours from credit hours/difficulty, citing a real
  study-hours-per-credit-hour guideline (e.g. a university's own published ratio).
- `test-score-to-letter-grade-calculator` — raw score/percentage → letter grade on a standard or
  user-entered scale; distinct from GPA conversion.
- `reading-speed-calculator` — words-per-minute from a timed passage; simple, popular, standalone
  (and a nice cross-link target for `text`'s own reading-time figure).
- `class-attendance-calculator` — classes missed vs. a minimum-attendance-percentage requirement.
- `cumulative-gpa-calculator` — combine a prior cumulative GPA + credits with a new term's grades
  into a new cumulative figure; distinct from the existing single-term `gpa-calculator`.
- `semester-credit-hours-calculator` — total credit hours from a course list, with a full-time/
  part-time threshold check.
- `gpa-scale-converter` — convert between a 4.0 scale and other common scales (percentage, 10-point,
  UK degree classifications) — cite real conversion tables per scale, and only include a scale with
  a real, confirmable source.

**Note already caught**: `word-counter`'s step-26 sibling idea `weighted-average-calculator`
already exists (`math` category, built in Wave 1) — don't rebuild it here.

## Acceptance checks (every batch)

Same as step 60's: `npm test`/`npm run lint`/`npm run build` green, every number scratch-verified,
every cited figure fetched for real, SEO/FAQ/alias conventions met, dedupe-checked against the
whole site before writing any id.

## Progress

- [x] Step file written
- [x] Batch 1 — `auto` (4 new + 1 honest skip; done 2026-11-16, PR #94)
  - [x] `lease-vs-buy-calculator`
  - [x] `car-depreciation-calculator`
  - [x] `tire-size-calculator`
  - [x] `parking-cost-calculator`
  - [x] `gas-mileage-comparison-calculator` — **skipped, see note below**
- [x] Batch 2 — `work` (6 new; done 2026-11-16, branch `step/61-deepen-work`, PR #95)
  - [x] `overtime-pay-calculator`
  - [x] `severance-pay-calculator`
  - [x] `cost-of-living-comparison-calculator`
  - [x] `remote-work-savings-calculator`
  - [x] `job-offer-comparison-calculator`
  - [x] `paid-sick-leave-accrual-calculator`
- [x] Batch 3 — `health` (5 new; done 2026-11-16, branch `step/61-deepen-health`)
  - [x] `body-fat-percentage-calculator`
  - [x] `ideal-weight-calculator`
  - [x] `macro-calculator`
  - [x] `waist-to-hip-ratio-calculator`
  - [x] `blood-alcohol-content-calculator`
- [ ] Batch 4 — `shopping` (5 new)
- [ ] Batch 5 — `travel` (6 new)
- [ ] Batch 6 — `time` (5 new)
- [ ] Batch 7 — `creator` (8 new)
- [ ] Batch 8 — `text` (8 new)
- [ ] Batch 9 — `education` (9 new)
- [ ] STATUS.md updated with a final per-category summary
