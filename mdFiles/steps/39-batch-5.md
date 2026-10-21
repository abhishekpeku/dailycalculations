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
- [ ] travel-budget-calculator (B)
- [ ] visa-stay-days-calculator (B)
- [ ] currency-converter (C)
- [ ] timezone-meeting-planner (C)
- [ ] freelancer-rate-calculator (A)

Run 3 (next 5):
- [ ] meeting-cost-calculator (B)
- [ ] pto-calculator (B)
- [ ] salary-raise-calculator (A)
- [ ] youtube-earnings-calculator (A)
- [ ] instagram-engagement-calculator (B)

Run 4 (last 3):
- [ ] character-counter (C)
- [ ] hashtag-counter (C)
- [ ] gpa-calculator (C → B)

Paused 2026-10-21 after pomodoro-timer. Resume from the first unchecked box
(travel-budget-calculator, run 2).

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
