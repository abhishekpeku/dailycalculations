# Step 59 — Wave 2 Sports, run 1 (new category)

First batch of the new `sports` category, scoped in
`mdFiles/steps/43-45-wave-2-construction-food-sports.md` (the "Sports — new category `sports`"
section lists ~15 first-pass candidates). Food closed out at 182 calculators (PR #58); this run
opens Sports, the last sector in Wave 2. Follows the v2 template and the `add-calculator` skill.
Reference implementations: `force-calculator` (physics.ts, solver pattern) for
`one-rep-max-calculator` and `race-time-predictor-calculator`; `bmi-calculator`/`calorie-calculator`
(health.ts) for the breakdown + solver forward-channel conventions; `boiled-egg-calculator` /
`steak-doneness-calculator` (food.ts) read as the breakdown-type reference examples.

Step number check: grepped `mdFiles/STATUS.md`'s step index and `mdFiles/steps/` for any existing
step 47-59 before branching — none exist (Food used step 46 across 3 runs; the index jumps straight
from 46 back to the Phase A-H table's older numbers). 59 is free.

## Progress

- [x] Category scaffolding: `sports` id/title (green theme, `trophy` icon), `data/calculators/sports.ts`,
  wired into `data/calculators/index.ts` (import, `categories`, `calculatorOrder`, `calculators` spread).
- [x] `one-rep-max-calculator` — solver, Epley formula (1RM = weight × (1 + reps ÷ 30)), with a
  computed Epley-vs-Brzycki %1RM-by-reps comparison table
- [x] `heart-rate-zones-calculator` — breakdown, combines max heart rate (classic 220−age and Tanaka
  208−0.7×age), the five standard zones, and a Karvonen heart-rate-reserve target — per the task's
  explicit guidance to combine these into one richer page rather than 2-3 thin ones
- [x] `vo2-max-calculator` — breakdown, Cooper's 1968 12-minute run test regression
- [x] `race-time-predictor-calculator` — solver, Riegel's cross-distance formula, any two distances,
  either direction (see "Dedupe check" below)
- [x] `swim-pace-calculator` — breakdown, pace per 100 m / 100 yd + speed
- [x] Independent verification script (`verify_sports_run1.mjs`) — all numbers matched
- [x] Programmatic collision check (`check_sports_run1.mjs`) — caught and fixed one real alias
  collision (see below)
- [x] `npm test` (807 tests, 0 failures), `npm run lint`, `npm run build` all pass
- [x] Structural curl checks, including `/categories/sports`
- [x] Dev server stopped, port confirmed clear
- [ ] PR marked ready (final step, once this file is committed)

**Running calculator count: 182 (post-Food) + 5 = 187.** Running count since the last Chrome
visual-QA pass: 38 (Construction 21 + Food 17, per the Food run-3 writeup) + 5 (this run) = **43**.
Still under the ~50 threshold in `CLAUDE.md`, but the next Sports batch will very likely cross it —
flag for whichever batch lands next.

## Picks and why (5 of the ~15 candidates)

Per the task's suggested leads (one-rep-max, heart-rate-zones combined, VO2-max, race-time-predictor,
swim-pace-or-cycling-pace) and the "combine related stats onto one page" guardrail:

1. **One-rep max** — a classic, well-defined, heavily cited formula (Epley, 1985) with real search
   volume ("1rm calculator", "max bench calculator"). Solver-shaped: weight, reps and 1RM are one
   equation, all three directions useful (estimate 1RM; find a training weight for a target rep
   count; check how many reps a weight should allow).
2. **Heart rate zones** — combined max-heart-rate + target-heart-rate + zones into **one** page
   instead of three thin ones, exactly as the task suggested. It offers both common max-HR formulas
   (classic 220−age and the more accurate Tanaka 208−0.7×age), the five standard zones as plain
   percentages of max HR, and a personalized Karvonen heart-rate-reserve target using resting heart
   rate — three real, distinct methods that belong together on one page rather than split up.
3. **VO2 max** — Cooper's 1968 12-minute run test is the best-known field-test formula for aerobic
   fitness, has a clean closed-form regression, and real, high search volume ("cooper test
   calculator", "vo2 max calculator").
4. **Race time predictor** — explicitly the task's trickiest dedupe call; see the dedicated section
   below confirming it's genuinely distinct from `running-pace-calculator`, not a duplicate.
5. **Swim pace** — chosen over cycling pace because it has a genuinely distinct unit convention
   (pace per 100 m/yd, not per mile/km) and a real, distinct audience (pool swimmers reading a pace
   clock), where a cycling-pace page would mostly restate the existing speed/pace math already
   covered by `running-pace-calculator` and the measurements converters.

Remaining ~10 candidates from the scope doc's list (steps to miles + stride length, baseball hitting
stats, cricket bowling average, cricket net run rate, NFL passer rating, winning percentage, Elo
rating, cycling pace, golf handicap) are untouched for a later Sports batch. **Golf handicap was not
investigated this run** — the task flagged it as needing a citable-formula check before committing,
and it wasn't one of this run's 5; leave that check to whichever batch considers it next.

## Dedupe check: `race-time-predictor-calculator` vs. `running-pace-calculator`

The task required confirming this distinction holds, and it does, but the two pages are closer than
the scope doc's one-line description suggests, which is worth recording precisely for whoever reads
this next. `running-pace-calculator` (health.ts, step 37) already applies Riegel's formula: its
`derive` function computes `riegel5k`/`riegel10k`/`riegelHalf`/`riegelMarathon` from whatever
pace/distance/time the user enters, shown as a bar chart, predicting the **four fixed standard
distances** in **one direction only** (from your entered run to those four races).

`race-time-predictor-calculator` generalizes this in two ways that running-pace-calculator cannot do
at all:

1. **Both distances are free choices**, not fixed to 5K/10K/half/marathon — predict a mile from a
   10K, a 50K from a marathon, or any other pair.
2. **It solves in any direction**, because all four quantities (known time, known distance, target
   time, target distance) have closed-form solutions. Concretely, this answers a question
   running-pace-calculator cannot: "what 10K time do I need to be on pace for a 4-hour marathon?" —
   enter the goal time and distance as the known values and the distance you want to test at as the
   target, and the calculator solves for the time you'd need there (computed: a 4:00:00 marathon
   goal and a 10K target solve to a 10K time of about 52.2 minutes — see verification below).

The two pages intentionally share the same underlying formula (there's only one real cross-distance
endurance formula to cite) and are cross-linked in `related`. `race-time-predictor-calculator`'s own
content explicitly explains the distinction in its concept section and a dedicated watch-out item,
rather than silently duplicating running-pace-calculator's existing chart.

## Category creation mechanics (new `sports` id)

Replicated the exact mechanical pattern `food` used in step 46, run 1:

1. **`data/calculators/sports.ts`** (new file) — exports `sportsCalculators: CalculatorConfig[]`.
2. **`data/calculators/index.ts`** — imported `sportsCalculators`; added
   `{ id: 'sports', title: 'Sports', description: '...' }` to `categories`; appended the 5 new ids
   to `calculatorOrder`; spread `...sportsCalculators` into `calculators`.
3. **`lib/categoryTheme.ts`** — added `sports: { color: 'green', icon: 'trophy' }`. Every `TileColor`
   is already used by at least one category, same situation food's run-1 writeup found; `green` was
   picked because it's the *least* reused color (finance only, before this), unlike pink/orange/blue/
   red/indigo/gray/purple which are each already shared by two categories.
4. **`components/IconTile.tsx`** — added a new `trophy` icon (a cup with two handles, a stem and a
   base) to the `ICONS` record, since no existing glyph fit "sports."

Grepped the codebase for every place `food` is referenced (per the task's instruction) before
registering `sports` the same way: only `data/calculators/index.ts` (the one `categories` entry) and
`data/calculators/food.ts` itself reference the `food` id — `components/Footer.tsx`,
`CategoriesMenu.tsx`, `MobileMenu.tsx`, `CategoryMenuRow.tsx` and `/categories/[category]/page.tsx`
all read `categories`/`findCategoryCalculators` from `data/calculators` (directly, or via
`lib/navData.ts`'s `buildNavData()`), with no hard-coded category list anywhere, confirmed unchanged
by the Food run-1 step file's own identical finding. `sports` has only 5 calculators, well under
`categories/[category]/page.tsx`'s `SEARCH_THRESHOLD` (15) and the `GROUPED_CATEGORIES` set in
`categories.spec.ts` (measurements/math/statistics only), so it renders the plain grid with no
search box and needs no `group` field.

## Sourcing — every number fetched directly, not recalled

Per template §3 ("Read sources directly") and the skill's verification step.

- **Epley, B., "Poundage Chart," Boyd Epley Workout (Lincoln, NE: Body Enterprises, 1985), p. 86** —
  the original source of the Epley formula (1RM = weight × (1 + reps ÷ 30)). This specific training
  manual isn't digitized online; confirmed via two independent `WebSearch` passes quoting the same
  citation (author, title, publisher, page), and via Wikipedia's "One-repetition maximum" article
  (`action=raw` wikitext), which states the formula with the same citation.
- **Brzycki, M., "Strength Testing: Predicting a One-Rep Max from Reps-to-Fatigue," Journal of
  Physical Education, Recreation & Dance 64, no. 1 (1993): 88-90** — the comparison formula
  (1RM = weight × 36 ÷ (37 − reps)), confirmed via `WebSearch`.
- **LeSuer, D.A., et al., "The Accuracy of Prediction Equations for Estimating 1-RM Performance in
  the Bench Press, Squat, and Deadlift," Journal of Strength and Conditioning Research 11, no. 4
  (1997): 211-213** — the standard validation study for both formulas, confirmed via `WebSearch`.
- **American Council on Exercise, "Understanding 1-RM and Predicted 1-RM Assessments"** — fetched
  directly (`WebFetch`). Confirmed the coefficient-table framing, the valid rep range (1-10), and
  the safety guidance quoted in `one-rep-max-calculator`'s watch-out section almost verbatim ("a
  predicted 1-RM test is a great way to estimate 1-RM performance in a novice exerciser...").
- **Tanaka, H., Monahan, K.D., Seals, D.R., "Age-Predicted Maximal Heart Rate Revisited," Journal of
  the American College of Cardiology 37, no. 1 (2001): 153-156** — `jacc.org` and `pubmed.ncbi.nlm.nih.gov`
  both blocked direct `WebFetch` (403, the same kind of bot-protection wall the Food run-1 step file
  hit with `fsis.usda.gov`). A direct PDF fetch of the paper itself (`webs.um.es/jlyuste/documts/tanaka.pdf`)
  downloaded successfully but came back as unreadable encoded PDF data in this environment (no
  `pdftoppm`/poppler available to render it to text). Corroborated instead via two independently
  worded `WebSearch` passes that each quoted the same formula (208 − 0.7 × age), the same sample
  (18,712 subjects, 351 studies) and the same journal citation.
- **Karvonen, M.J., Kentala, E., Mustala, O., "The Effects of Training on Heart Rate: A Longitudinal
  Study," Annales Medicinae Experimentalis et Biologiae Fenniae 35, no. 3 (1957): 307-315** —
  confirmed via a direct `WebFetch` of the *British Columbia Medical Journal*'s "The science of
  exercise prescription: Martti Karvonen and his contributions," which quotes the original formula
  (target HR = resting HR + (peak HR − resting HR) × K) and gives the full original citation.
- **Cleveland Clinic, "What Are the Five Heart Rate Zones?"** (`health.clevelandclinic.org`) —
  fetched directly. Source of the five zone percentages (50-60/60-70/70-80/80-90/90-100% of max HR),
  their names, the classic 220−age formula, and the caveat that a supervised stress test or VO2 max
  test is the only precise way to know a real maximum heart rate.
- **American Heart Association, "Target Heart Rates Chart"** (`heart.org`) — the live page 403'd
  direct `WebFetch` (same bot-protection pattern). Corroborated via two independently worded
  `WebSearch` passes, both quoting the same 220−age formula and the same 50-70% moderate / 70-85%
  vigorous percentages.
- **Cooper, K.H., "A Means of Assessing Maximal Oxygen Intake: Correlation Between Field and
  Treadmill Testing," JAMA 203, no. 3 (1968): 201-204** — the citation was confirmed via a direct
  `WebFetch` of a PMC paper that cites it in full, and the exact regression formula
  (VO2max = (distance in meters − 504.9) ÷ 44.73) plus the same citation (volume 203, issue 3, 1968)
  was confirmed via a direct `WebFetch` of Wikipedia's "VO2 max" article raw wikitext
  (`action=raw`), which quotes the formula with an inline `<ref>` to the same JAMA article, and the
  r = 0.897 correlation figure and the 115-US-Air-Force-trainee validation group size via
  `WebSearch`.
- **Heyward, V.H., Advanced Fitness Assessment and Exercise Prescription, 3rd ed. (Human Kinetics,
  1998), p. 48** and **Noakes, T., The Lore of Running, 3rd ed. (Human Kinetics/Oxford, 2001)** —
  the untrained-average (35-40 men / 27-31 women mL/kg/min) and elite-athlete (up to ~85 men / ~77
  women) VO2max benchmarks used in `vo2-max-calculator`'s worked example, both found as the actual
  `<ref>` citations behind Wikipedia's "VO2 max" article's own stated figures (fetched directly via
  `action=raw`) — the textbooks themselves, not Wikipedia, are what's cited in the calculator's
  references, consistent with using Wikipedia only to locate the real primary source.
- **Riegel, P.S., "Athletic Records and Human Endurance," American Scientist 69 (1981): 285-290** —
  reused verbatim from `running-pace-calculator`'s own existing, already-shipped citation (same
  formula, same source), rather than re-deriving it.
- **US Masters Swimming, "Masters Swimming 101: Yards and Meters"** — fetched directly. Confirmed
  the three pool-length conventions quoted in `swim-pace-calculator`'s concept section: SCY pools
  are 25 yards ("most American pools"), SCM pools are 25 meters ("the least common"), LCM pools are
  50 meters.
- **World Aquatics, Facilities Rules** — the official competition-regulations PDF downloaded but
  came back unreadable in this environment (same PDF-encoding limitation as the Tanaka paper above).
  Corroborated via two independently worded `WebSearch` passes, both confirming the 50 m long-course
  / 25 m short-course standard.
- **NIST Special Publication 811** — reused for the exact yard constant (1 yd = 0.9144 m exactly),
  consistent with how every other calculator on the site cites unit factors.

## Verification

Independent scratch script (re-implements every formula from scratch, no app imports):
`verify_sports_run1.mjs` (scratchpad). Every check passed:

```
one-rep-max: 185 lb x 5 reps -> 1RM 215.8333 lb (97.8996 kg); 5-rep weight round-trips to 185 lb;
  10-rep weight 161.875 lb; Epley/Brzycki %1RM table matches at every tested rep count (1,5,10)
heart-rate-zones: age 30 -> classic max HR 190; zone ceilings 114/152/190 at 60/80/100%;
  Karvonen 70% target (190 max, 65 resting) = 152.5; classic/tanaka formulas cross at exactly
  age 40 (algebraic fact); diverge by 6 bpm at both age 20 (200 vs 194) and age 60 (160 vs 166)
vo2-max: 1.5 mi = 2414.016 m; VO2max = (2414.016-504.9)/44.73 = 42.68 mL/kg/min; avg speed 7.5 mph
race-time-predictor: 25-min 5K -> 10K = 25 x 2^1.06 = 52.123 min (~52:07, matches
  running-pace-calculator's own existing, independently-shipped figure for the same inputs);
  backward check: a 4:00:00 marathon goal solves to a ~52.17-min 10K
swim-pace: 1500 m in 30:00 -> 120 s/100m (2:00); 1640.42 yd -> 109.728 s/100yd (1:50);
  self-consistency check pace100yd = pace100m x 0.9144 holds exactly; speed 3.0 km/h / 1.864 mph
```

A second script, `check_sports_run1.mjs`, ran the programmatic checks the skill requires (dynamic
`import()` of the real `data/calculators/index.ts` via Node 24's native TypeScript stripping): all 5
new ids unique, no `redirectFrom` collision, no `related`-id self-reference, every `related` id
exists (3-6 per calculator), `seo.title` ≤ 60 and `seo.description` ≤ 160 characters, 5-8 FAQ entries
each, ≥ 4 aliases each. **It caught one real issue before shipping**: `race-time-predictor-calculator`
originally included `"race time predictor"` as an alias, which was already an alias on the existing
`running-pace-calculator` — removed from the new calculator (it kept 5 other aliases, still above the
4-alias minimum).

While building, `npm test`'s own edge-case input set (every scalar input at its `min`) surfaced a
second real issue: `swim-pace-calculator`'s `distance`/`time` inputs both defaulted to `min: 0`,
which divided by zero and produced `NaN` for all four outputs at the edge case — fixed by raising
`distance` to `min: 1` and `time` to `min: 0.1`, the same fix `running-pace-calculator` already uses
for the identical reason (non-zero mins on both inputs of a ratio).

`npm test` (807 tests, 0 failures) after `npm run test:update` generated the 5 new `compute()`
snapshots; `git diff --stat` on `data/calculators.spec.ts.snapshot` showed 193 insertions, 0
deletions — confirming no existing calculator's snapshot moved.

## Build, lint, structural checks

`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` — clean, no output.
`npm run build` — see the PR description for the full pass/fail summary.

Per the task's instruction, no Chrome/dark-mode visual pass this batch — curl-based structural
checks against a backgrounded `npm run dev` instead, covering all 5 new calculator pages and the new
`/categories/sports` page: 200 status, the H1, `WebApplication`/`BreadcrumbList`/`HowTo` JSON-LD, and
every content section id present. See the PR description for the exact check output.

## Dev server

Started with `run_in_background`, confirmed killed (port 3000 clear via `netstat`) before finishing —
see the PR description for the exact check.
