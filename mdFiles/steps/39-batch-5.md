# Step 39 — Batch 5: time, travel, work, creator, text, education (18)

v2 conversion of the last 18 calculators per `mdFiles/calculator-rollout-plan.md` §3 "Batch 5".
Follows the same per-calculator commit + early-draft-PR pattern as batches 1-4 (steps 35-38).
Runs are 5 calculators each (last run is 3): 5 + 5 + 5 + 3 = 18.

Reference implementations: `data/calculators/finance.ts`, `health.ts`, `home.ts` (already v2).
`date-difference-calculator` (step-10 pilot) already has howTo/formula/workedExample/watchOut —
this batch adds `concept`, `references` and the `breakdown` visual only.

Type-C custom tools (pomodoro-timer, currency-converter, timezone-meeting-planner,
character-counter, hashtag-counter) keep their own component; they get full `content` (the page
template already renders TOC/concept/howTo/etc. from `calculator.content` regardless of widget
type — see `app/[locale]/calculators/[slug]/page.tsx`) plus a light restyle (WidgetCard chrome,
category accent) where it's low-risk.

## Progress

Run 1 (first 5):
- [x] date-difference-calculator (B) — add concept + references + breakdown/Timeline visual; compute() unchanged
- [x] age-calculator (B) — rework to birth month/day/year + today, exact years/months/days, next-birthday Timeline
- [x] sleep-time-calculator (B) — breakdown + cycle Timeline visual; compute() unchanged
- [x] work-hours-calculator (B) — breakdown + Donut (regular vs overtime); compute() unchanged
- [x] pomodoro-timer (C) — full content + WidgetCard restyle, timer logic unchanged

Run 1 done 2026-10-21. `npm test` 268/268, `npm run build` (81 static pages) and lint pass.
age-calculator's compute()/inputs changed (birthYear+currentYear -> birthMonth/birthDay/birthYear,
timeDependent); snapshot regenerated with `npm run test:update`, diff reviewed (only that
calculator changed). Everything else in this run kept compute()/inputs unchanged, only adding
`breakdown`/`content`. Fixed a pre-existing dead-class bug in PomodoroTimer.tsx while restyling it
(bg-brand-600/700/focus:border-brand-500 don't exist in the Tailwind config — see STATUS.md Parked
"Dead Tailwind brand shades") by switching to the shared WidgetCard + inline accent color instead.

Run 2 (next 5):
- [x] travel-budget-calculator (B)
- [x] visa-stay-days-calculator (B)
- [x] currency-converter (C)
- [x] timezone-meeting-planner (C)
- [x] freelancer-rate-calculator (A)

Run 2 done 2026-10-21. `npm test` 271/271 (no snapshot changes — travel-budget, visa-stay-days,
timezone/currency (empty compute) and freelancer-rate all kept `compute()`/`inputs` unchanged;
freelancer-rate's solver was added alongside per the Type-A rule). `npm run build` (81 static
pages) and lint pass. visa-stay-days-calculator's "180-day window bar" uses a percent-based
RangeBar (0-100 / 100-200%) rather than day-count bands, since BreakdownVisual bands must be
static and allowedDays is a user-adjustable input — documented in the commit. currency-converter
and timezone-meeting-planner (type C) restyled onto the shared WidgetCard/ResultPanel; this also
fixed real dead-Tailwind-class bugs (bg/border/text using brand-200/300/400/800/950, none of
which exist in tailwind.config.ts) that were silently breaking colors, worst in dark mode.
currency-converter now has a persistent "static, not live" banner with an as-of date, repeated in
a watchOut item, the footer and an FAQ, per the coordinator's instruction. visa-stay-days cites
the official EU short-stay calculator + CBP I-94 compliance, with an explicit "not legal advice"
note. timezone-meeting-planner cites the IANA Time Zone Database + NIST DST rules.

Run 3 (next 5):
- [x] meeting-cost-calculator (B)
- [x] pto-calculator (B)
- [x] salary-raise-calculator (A)
- [x] youtube-earnings-calculator (A)
- [x] instagram-engagement-calculator (B)

Run 3 done 2026-10-21. `npm test` 277/277 (no snapshot changes — all 5 `compute()`/`inputs` pairs
left untouched; salary-raise and youtube-earnings got solvers added alongside, verified via
`git diff`). `npm run build` (81 static pages) and lint pass. meeting-cost-calculator's "cost
ticker" (a live running total) has no static-kit equivalent, so it uses CompareBars (this meeting
vs. annual-if-weekly) instead — documented in the commit. Found and fixed a pre-existing wrong
FAQ figure on meeting-cost-calculator (claimed $22k/yr for a scenario that its own formula gives
$29,250 for) and dropped an unsourced "31 hours/month in unproductive meetings" stat. Per the
coordinator's instructions: salary-raise-calculator has an explicit estimate-only/not-tax-advice
note (flat-rate tax model, not real marginal brackets); youtube-earnings-calculator and
instagram-engagement-calculator now treat every RPM/CPM/engagement-rate figure as a user-supplied
illustrative assumption, never a fact, cite official YouTube/Instagram/Meta docs for definitions
and eligibility, and drop several pre-existing unsourced "industry average" claims
(RPM-by-niche, "$100/10k followers," "nano 4-8%, mega <1.5%" engagement benchmarks) that had no
citable source. instagram-engagement-calculator's visual is a Donut of the user's own engagement
composition rather than the plan's "RangeBar of typical rates," since typical-rate bands would be
exactly the kind of unsourced benchmark the coordinator said to avoid (also, RangeBar bands must
be static per the schema, same constraint as visa-stay-days in run 2).

Run 4 (last 3):
- [ ] character-counter (C)
- [ ] hashtag-counter (C)
- [ ] gpa-calculator (C → B)

Paused 2026-10-21 after instagram-engagement-calculator. Resume from the first unchecked box
(character-counter, run 4).

## Notes for resuming

- Branch: `step/39-batch-5`. Draft PR opened early; keep it draft until all 18 are done.
- Every compute() signature change must be explained in the PR body (snapshot diff). Prefer
  touching only `breakdown`/`content`/`derive` and leaving `inputs`/`compute()` alone wherever the
  existing fields already support the planned visual — several in this batch need no compute()
  change at all (date-difference, sleep-time, work-hours).
- `npm run test:update` regenerates `data/calculators.spec.ts.snapshot` after a deliberate
  compute()/inputs change (age-calculator, and later freelancer-rate/salary-raise/youtube/
  instagram/gpa as solver or breakdown reworks land).
- Run `npm test`, `npm run build`, and
  `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` before pausing.
- Kill any dev server on :3000 before stopping; `git checkout master` only at the very end of the
  whole step (stay on the branch between runs).
