# Step 50 — Wave 4: Fun & Other (new category)

Per `mdFiles/omni-strategy.md` §4.1/§4.2 ("fun/other — new — long tail, PR-friendly") and
`mdFiles/calculator-rollout-plan.md`'s "Wave 4: Biology, Ecology, Other (~80)": **fun / other (~25):
love, zodiac, birthday paradox, dice probability, lottery odds, time until, countdown … These are
PR and link bait. Keep them clearly separate from YMYL pages.** Go-ahead given 2026-11-17 (D23:
blanket go-ahead for the remainder of the roadmap, superseding D13/D22's per-category approval
requirement). Physics, chemistry, biology, and ecology are all closed out — fun/other is next in
D13's locked order, before `tech` (step 25).

## Competitive gap-check (per omni-strategy.md's "widen the scan beyond Omni" rule)

Fetched Omni Calculator's own "Other" category page directly (`omnicalculator.com/other`) for its
real subcategory breakdown. It bundles together several sub-sectors that don't all belong here:

- **Education** — already our own `education` category; not duplicated.
- **Photo & Video, Music, Tech & Electronics, Internet & Network, Video Game, Logistics** — niche,
  hobbyist/professional tooling (camera exposure, guitar fret spacing, PCB trace width, Minecraft
  portals, freight class…). Low general-audience search volume for this site, and several overlap
  with the already-separately-scoped `tech` category (step 25: IP subnet, IBAN, password strength)
  or are simply out of scope for a "daily calculations" consumer site. **Deliberately excluded** —
  same judgment call as excluding pet-medication-dosage from biology or siding/framing from
  construction.
- **Seasons & Holidays** (Christmas tree, Christmas countdown, Easter, Mayan calendar, New Year's
  resolutions, snowman, trick-or-treat, white Christmas, zombie/vampire apocalypse) — genuinely fits
  "fun/PR-friendly." Several seeded below; the apocalypse/zombie ones and trick-or-treat/snowman are
  too thin or too silly even for this bucket (no real citable method) — skipped.
- **Earth & Weather** (antipode, azimuth, earthquake, rainfall, wind chill, sunbathing) — a few real,
  citable, everyday-useful ones seeded below (antipode, wind chill, heat index via the same NWS
  family as wind chill). Sunrise/sunset is already covered by travel's `daylight-hours-calculator`
  (step 61 batch 5) — not rebuilt here.
- **"Other" grab-bag** (love, zodiac-adjacent, dating theory, day-of-week, diamond weight, gender
  pay gap, poker odds, tip, D&D stats) — the actual core of this step. `day-of-week-calculator` and
  `tip-calculator` already exist (time/shopping) — not duplicated. D&D-specific calculators (HP 5e,
  point buy, encounter difficulty) are a narrow hobbyist niche, same exclusion logic as Minecraft —
  skipped. Gender pay gap and diamond weight are real but don't fit the "fun" framing or this site's
  existing finance/jewelry-adjacent coverage — left for a future wave if ever revisited, not forced
  in here.

## Dedupe — checked directly against existing calculators, not assumed

- **`age-calculator`** (time) already outputs `totalDays` (total days lived) *and*
  `daysToNextBirthday`/the next-birthday date. A generic "days alive" or "days until my next
  birthday" calculator would be a near-duplicate — **not built**.
- **`date-difference-calculator`** (time) already computes the gap between any two dates, including
  today → any future date — a generic "days until X" countdown calculator would be a thin wrapper
  around it. The holiday countdowns below are kept **only** because each carries its own real,
  distinct content (a cited date-finding algorithm, not just a subtraction): Easter's Gaussian
  algorithm, the Mayan Long Count conversion, and the Friday-the-13th pattern explanation. A bare
  "Christmas countdown" with no such content would be the same thin-wrapper problem — see batch 3
  below for how it's scoped to avoid that.
- **`probability-calculator`** (statistics) and **`inheritance-probability-calculator`** (biology)
  already exist. The dice/coin/card/lottery/birthday-paradox calculators below are kept because each
  is a **specific, named, real-world probability question** with its own formula (binomial, birthday
  paradox, combinatorics for lottery odds) — not a restatement of the generic P(A) tool. Read
  `probability-calculator` first before writing any of these to confirm the distinction holds.
- **`dog-age-calculator`** / **`cat-age-calculator`** (biology) already exist — no pet-age calculator
  here.
- Grep every new id/alias against **all** `data/calculators/*.ts` site-wide before writing, same
  discipline as every prior wave.

## Starting state

`fun` is a **brand-new category** — open it the same way `biology`/`ecology` were in Wave 4:
`data/calculators/fun.ts` (new file), an entry in `data/calculators/index.ts`'s `categories` array
and spread list, and a new color/icon pair in `lib/categoryTheme.ts`/`components/IconTile.tsx`.
Title: **"Fun & Other"**. All existing tile colors (blue/green/purple/orange/red/teal/indigo/pink/
gray/lime/emerald) are already claimed by other categories, but reuse is established precedent
(e.g. `green` already covers both `finance` and `sports`) — pick whichever reads best for a playful
category (e.g. `pink` or `purple`) and add one new hand-rolled SVG icon to `IconTile.tsx`'s `ICONS`
set (a sparkle/star/dice glyph all read well for "fun"). **This category-opening work must happen in
exactly one batch — batch 1 — not in parallel with any other batch**, same rule as every prior new
category, to avoid two agents racing to create `data/calculators/fun.ts` at once.

Sub-grouping (the `group` field + `categories.spec.ts`'s `GROUPED_CATEGORIES`) is **deliberately
deferred to a final retrofit batch** after all 24 calculators exist, same precedent as biology and
ecology — don't add `group` prematurely in batches 1-5.

## Batches (24 calculators + 1 retrofit batch)

**Batch 1 — Astrology & relationships (5), opens the category:**
- `zodiac-sign-calculator` — birth date → Western zodiac sign, element, and ruling quality. Cite a
  reputable source for the exact date ranges (they vary slightly by source at the boundaries —
  disclose that in `watchOut` rather than presenting one source's cutoff as the only truth).
- `chinese-zodiac-calculator` — birth year (+ the lunar new year's actual date, since the cutover
  isn't always Jan 1) → the 12-animal cycle. Cite the real lunar new year date table, don't
  approximate it as Jan 1 every year.
- `zodiac-compatibility-calculator` — two Western signs → a compatibility note, using a real,
  citable astrological compatibility framework (element/modality pairing), explicitly labeled as
  astrology/entertainment, not a scientific claim.
- `love-calculator` — a classic name-based novelty score (e.g. the FLAMES method or a letter-count
  algorithm), cited to its real documented origin, explicitly labeled as entertainment.
- `name-numerology-calculator` — name/birth date → a Pythagorean-system "life path" number, cited
  to the real documented numerology method, explicitly labeled as folklore/entertainment, not a
  scientific claim. Distinct from `love-calculator` (single-person numerology vs. two-person
  matching).

**Batch 2 — Probability & odds novelties (5):**
- `dice-probability-calculator` — probability of a target sum/value/range rolling N dice with S
  sides each (real combinatorics, not the generic P(A) tool).
- `coin-flip-probability-calculator` — probability of an exact heads/tails count across N flips
  (binomial distribution), plus a specific-streak mode if it fits cleanly in one page.
- `birthday-paradox-calculator` — probability that ≥2 people in a group of N share a birthday; the
  real 1/365 complement-probability formula, cited.
- `lottery-odds-calculator` — odds of matching k of n numbers in a pick-k-from-n lottery, using the
  real combinations (nCr) formula. Keep it generic/configurable (user enters their own lottery's
  pick-k-from-n rule) rather than hardcoding one real lottery's name, to avoid implying an
  endorsement or an outdated-jackpot claim.
- `card-draw-probability-calculator` — probability of drawing a specific card or hand from a
  standard 52-card deck (hypergeometric distribution), cited.

**Batch 3 — Calendar & countdown novelties with real citable content (5):**
- `easter-date-calculator` — the actual Gaussian/Computus algorithm for the date of Easter Sunday in
  any year, cited directly (not approximated).
- `mayan-calendar-converter` — Gregorian date → Mayan Long Count (and Tzolkʼin/Haabʼ if it fits),
  cited to a real reference for the correlation constant used (there are a couple in real use —
  disclose which one and why, same honesty discipline as every other citation on the site).
- `friday-the-13th-calculator` — for a given year, which months (if any) have a Friday the 13th, and
  why certain weekday/month combinations recur (the real doomsday-rule-adjacent pattern), not just a
  bare date lookup.
- `christmas-countdown-calculator` — kept distinct from a bare date-difference wrapper by including
  real content: days/hours/minutes until Dec 25 **and** a secondary "shopping days left" count
  (weekdays/weekends remaining), cited methodology for the split.
- `new-years-countdown-calculator` — countdown to Jan 1, with an explicit note on why "midnight"
  differs by time zone (first timezone to reach it, UTC+14 Kiribati) — real content, not just a
  subtraction.

**Batch 4 — Weather & geography novelties (5):**
- `wind-chill-calculator` — the real NWS wind chill formula, cited directly from weather.gov.
- `heat-index-calculator` — the real NWS heat index formula (Rothfusz regression), cited directly,
  natural pairing with wind chill (cold-weather vs. hot-weather "feels like" temperature).
- `antipode-calculator` — a location's exact antipodal point (lat, −lng flipped through 180°), with
  a note on how much of it lands in ocean (a commonly-cited fun fact, verify the real approximate
  percentage before stating it, don't guess).
- `moon-phase-calculator` — a given date's moon phase, using a real synodic-month astronomical
  approximation algorithm, cited.
- `relationship-anniversary-calculator` — given a relationship start date, the date of upcoming
  round-number day-count milestones (1,000 days, 10,000 days, etc.) and the next annual anniversary.
  Distinct from `age-calculator` (a different start-date concept, framed around relationship
  milestones, not birth-age breakdown) — cross-link rather than duplicate logic blindly; read
  `age-calculator` first to reuse its exact next-anniversary-date math rather than reinventing it.

**Batch 5 — Everyday gadget/misc novelties (4):**
- `screen-size-calculator` — TV/monitor diagonal size → width, height, area, and pixels-per-inch
  given a resolution; cite the real Pythagorean aspect-ratio derivation.
- `aspect-ratio-calculator` — given one known dimension and a target ratio (16:9, 4:3, 21:9, etc.),
  solve for the other — companion to screen-size, reusable for photo/video crop planning too.
- `uptime-percentage-calculator` — converts an uptime percentage (the "number of nines") into actual
  allowed downtime per day/month/year, cited to the real standard nines table (99%, 99.9%, 99.99%,
  99.999%).

**Batch 6 — Sub-grouping retrofit** (after batches 1-5 land): tag all 24 `fun` calculators with a
`group` field (suggested groups: Astrology & Relationships, Probability & Odds, Calendar &
Countdowns, Weather & Geography, Everyday Novelties), add `fun` to `categories.spec.ts`'s
`GROUPED_CATEGORIES`, same retrofit pattern as biology (PR #122) and ecology.

## Progress checklist

- [x] Batch 1 — Astrology & relationships (5), opens the category — DONE 2026-11-18, PR #132
  - [x] Category scaffold: `data/calculators/fun.ts`, `index.ts` categories+order+spread, `lib/categoryTheme.ts`, `components/IconTile.tsx` sparkle icon
  - [x] `zodiac-sign-calculator`
  - [x] `chinese-zodiac-calculator`
  - [x] `zodiac-compatibility-calculator`
  - [x] `love-calculator` (FLAMES, custom type-C widget — `components/FlamesCalculator.tsx`, needed real name text input which the generic numeric `inputs`/`compute` schema can't express)
  - [x] `name-numerology-calculator` (birth-date-only Life Path number — the cited method has no letter/name component, so no custom widget was needed despite the id)
- [x] Batch 2 — Probability & odds novelties (5) — DONE 2026-11-18, branch `step/50-fun-other-batch2`, PR #133
  - [x] `dice-probability-calculator`
  - [x] `coin-flip-probability-calculator`
  - [x] `birthday-paradox-calculator`
  - [x] `lottery-odds-calculator`
  - [x] `card-draw-probability-calculator`
- [x] Batch 3 — Calendar & countdown novelties (5) — DONE 2026-11-18, branch `step/50-fun-other-batch3`, PR #134
  - [x] `easter-date-calculator` (Gauss's algorithm, cross-checked against 12 known Easter dates 1818-2027)
  - [x] `mayan-calendar-converter` (GMT correlation 584283; cross-checked against the creation date and Dec 21 2012; Spinden correlation disclosed as the unused alternative)
  - [x] `friday-the-13th-calculator` (weekday-recurrence groupings brute-force verified 1583-3000; matches Wikipedia's 1-3/year and 688-vs-684-687 figures exactly)
  - [x] `christmas-countdown-calculator` (live days/hours/minutes + shopping-weekday/weekend split, ISO 8601-cited methodology, closed-form weekday count)
  - [x] `new-years-countdown-calculator` (live countdown + hours-behind-Kiribati/UTC+14 figure; timezone offset is an explicit input, not browser-detected, so compute() stays deterministic)
- [x] Batch 4 — Weather & geography novelties (5) — DONE 2026-11-18, branch `step/50-fun-other-batch4`, PR #137 (merged)
  - [x] `wind-chill-calculator`
  - [x] `heat-index-calculator`
  - [x] `antipode-calculator`
  - [x] `moon-phase-calculator`
  - [x] `relationship-anniversary-calculator`
- [x] Batch 5 — Everyday gadget/misc novelties — DONE 2026-11-18, branch `step/50-fun-other-batch5`, PR #136
  - [x] `screen-size-calculator` (diagonal + aspect ratio + resolution -> width/height/area/PPI, Pythagorean derivation, cited to Wikipedia's Pixel density and Aspect ratio (image) articles)
  - [x] `aspect-ratio-calculator` (solver: width<->height for any ratio, companion to screen-size-calculator)
  - [x] `uptime-percentage-calculator` (uptime % -> downtime per day/month/year, standard nines reference table, cited to Wikipedia's High availability article)
  - Built exactly 3, not 4: per the step file's own header-count-mismatch note, no 4th idea was added just to round out the batch. Considered and rejected as thin/out of scope for this bucket: a generic "pixel-to-inch/cm converter" (duplicates `length-converter`'s role once combined with screen-size-calculator), a "frame rate / shutter speed" calculator (hobbyist photography math, same exclusion logic as the step's already-excluded Photo & Video niche), and a "file size / download time" calculator (closer to the separately-scoped `tech` category than "everyday novelty"). None were built.
- [x] Batch 6 — Sub-grouping retrofit (`group` field + `GROUPED_CATEGORIES`) — DONE 2026-11-18, branch `step/50-fun-other-batch6`
- [x] STATUS.md updated with a final per-category summary

**Visual-QA note:** per CLAUDE.md, the Chrome spot-check runs once per ~50 new calculators, not per
batch. The site crossed that threshold a while ago (currently 454+) without one happening yet — flag
this as still overdue regardless of this step's own progress, not a new finding specific to `fun`.

## Closing summary — step 50 fully done, `fun` closed out at 23/23

Batch 6 was a pure mechanical retrofit — no new calculators, no content changes, no citations
re-verified (nothing numeric changed). It added a `group` field to every one of the 23 `fun`
calculators already shipped by batches 1-5, and added `'fun'` to
`data/calculators/categories.spec.ts`'s `GROUPED_CATEGORIES`, the same precedent used to close out
`biology` (PR #122) and `ecology` (PR #131).

Final group breakdown (23 calculators, all-or-nothing per the invariant tests — no stragglers):

- **Astrology & Relationships** (6): `zodiac-sign-calculator`, `chinese-zodiac-calculator`,
  `zodiac-compatibility-calculator`, `love-calculator`, `name-numerology-calculator`,
  `relationship-anniversary-calculator`
- **Probability & Odds** (5): `dice-probability-calculator`, `coin-flip-probability-calculator`,
  `birthday-paradox-calculator`, `lottery-odds-calculator`, `card-draw-probability-calculator`
- **Calendar & Countdowns** (5): `easter-date-calculator`, `mayan-calendar-converter`,
  `friday-the-13th-calculator`, `christmas-countdown-calculator`, `new-years-countdown-calculator`
- **Weather & Geography** (4): `wind-chill-calculator`, `heat-index-calculator`,
  `antipode-calculator`, `moon-phase-calculator`
- **Everyday Novelties** (3): `screen-size-calculator`, `aspect-ratio-calculator`,
  `uptime-percentage-calculator`

`relationship-anniversary-calculator` was grouped under Astrology & Relationships rather than
Weather & Geography (where batch 4 built it) — it's a relationship-milestone calculator, not a
weather/geography one; grouping follows subject matter, not build-batch history.

`fun` is now **fully closed out at 23/23** — the step file's original "~24/25" seed-list framing
was never a hard target; batch 5 built 3 calculators instead of a nominal 4th because no fourth
idea cleared the real-citable-and-non-duplicate bar (documented at the time as an honest count, not
a shortfall), so 23 is the category's real, final total. No further `fun` batches are planned.

`npm test` 1630/1630 (no snapshot changes — `group` isn't part of the snapshot's tracked shape),
lint clean, `npm run build` all green (515 total static pages, 480 of them calculator pages — both
figures unchanged from batch 5, since batch 6 added no calculators). Both `categories.spec.ts`
grouping-invariant tests pass for `fun`. `origin/master` had not moved ahead of this branch's branch
point by the time of the final push, so no merge/rebase was needed.

Site-wide: **480 calculators**, 22 categories. Wave 4 (biology, ecology) and the
`fun`/`other` and `tech` categories are now all fully done. Next per D13/D22/D23's locked category
order: **step 62, Wave 5 Solar & Home Energy** (already scoped in
`mdFiles/steps/62-wave-5-solar-home-energy.md`, not yet started).
