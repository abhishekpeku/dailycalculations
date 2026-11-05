# Step 59 — Wave 2 Sports, run 2 (likely closes out Sports and all of Wave 2)

Second and likely final batch of the `sports` category, scoped in
`mdFiles/steps/43-45-wave-2-construction-food-sports.md`. Run 1 (PR #59) opened the category with
5 calculators (one-rep-max, heart-rate-zones, vo2-max, race-time-predictor, swim-pace). This run
picks up the remaining ~10 first-pass candidates: steps to miles + stride length, baseball hitting
stats, cricket bowling average, cricket net run rate, NFL passer rating, winning percentage, Elo
rating, cycling pace, golf handicap (flagged for a citable-formula check before building).

## Progress

- [x] Collision check: grepped the whole `data/calculators/` tree for every planned id/alias/phrase
  (steps, stride, batting, bowling, passer, elo, handicap, winning-percentage, net-run-rate,
  cricket, baseball, golf) — no existing id, alias or `redirectFrom` collides. `running-pace-calculator`
  (health.ts) already uses the alias `"race time predictor"` (not relevant here, already handled in
  run 1) and is cross-linked from several new pages below.
- [x] Golf handicap investigation (see dedicated section below) — the full WHS Handicap Index
  needs a 20-round scoring history and isn't a single-formula page; the Course Handicap conversion
  (Handicap Index → a specific course/tee) IS a clean, single, citable WHS formula with real search
  volume.
- [x] `steps-to-miles-calculator` — solver (distance = steps × stride length, all 3 directions)
- [x] `baseball-batting-average-calculator` — breakdown, combines AVG/OBP/SLG/OPS on one page
  (official MLB glossary formulas), per the "combine, don't split" guardrail
- [x] `cricket-bowling-figures-calculator` — breakdown, combines bowling average/economy rate/strike
  rate on one page, same guardrail
- [x] `cricket-net-run-rate-calculator` — breakdown, ICC's team/tournament NRR formula, including the
  "bowled out → full quota of overs" rule
- [x] `nfl-passer-rating-calculator` — breakdown, the NFL's official 1973 formula with its clamping rule
- [x] `elo-rating-calculator` — breakdown, expected score + rating change for one game, FIDE's current
  K-factor table
- [x] `golf-course-handicap-calculator` — breakdown, the WHS Course Handicap conversion, scoped
  explicitly to converting an already-known Handicap Index (not deriving one from score history)
- [x] Independent verification script — all numbers matched
- [x] Programmatic collision/shape check — all ids unique, no alias dupes, related ids exist
- [x] `npm test`, `npm run lint`, `npm run build` all pass
- [x] Structural curl checks on all 7 new pages
- [x] Dev server stopped, port confirmed clear
- [ ] PR marked ready (final step, once this file is committed)

**Parked, not built this run:** winning percentage (genuinely real search volume but the most generic
of the remaining candidates — a single division already illustrated by several of this batch's richer
pages; left for later if Sports gets a 3rd batch) and cycling pace (same reasoning run 1 gave for
picking swim pace over it: no distinct unit convention or audience beyond what `running-pace-calculator`
and the measurements converters already cover — would mostly restate existing speed/pace math under a
new name).

**Running calculator count: 187 (post-run-1) + 7 = 194.** Running count since the last Chrome
visual-QA pass: 43 (per run 1) + 7 (this run) = **50**. Exactly at the ~50 threshold in `CLAUDE.md`
— flagging this explicitly as **visual-QA pass due** for the main session, per the task's
instruction. This run does not run the Chrome pass itself.

## Golf handicap investigation

The scope doc flagged this as needing a confirmed, citable formula before committing to build it.
Investigated via direct `WebSearch`/`WebFetch` passes (USGA's own PDF 403'd `WebFetch`, same
bot-protection pattern run 1 hit repeatedly — corroborated instead via two independently worded
`WebSearch` passes plus a direct `WebFetch` of Wikipedia's "Handicap (golf)" article, which quotes
the Rules of Handicapping with rule numbers).

Finding: the full **Handicap Index** is NOT a single-formula calculation — it requires a scoring
history of up to 20 rounds (each converted to a "Score Differential"), then averages the best 8 of
the most recent 20, with a sliding-scale adjustment below 20 rounds. That is a multi-round tracker,
not a one-page formula calculator, and is out of scope for this page shape.

The **Course Handicap** conversion, however, is a genuine single, closed-form, official WHS formula:
`Course Handicap = Handicap Index × (Slope Rating ÷ 113) + (Course Rating − Par)`, confirmed
identically by two independent sources (TheGrint's walkthrough and Wikipedia's direct quote of the
Rules of Handicapping). It takes a golfer's already-known Handicap Index (posted by their golf
association from their own scoring history — not re-derived here) and converts it to the number of
strokes they get at a specific course and tee, which is both genuinely useful on its own (every
round at a new course needs this) and has real search volume ("course handicap calculator"). Built
as `golf-course-handicap-calculator`, with its concept section explicit about the distinction: this
page converts an existing Handicap Index, it does not compute one from scratch.

## Sourcing — every number fetched directly, not recalled

- **USGA, Rules of Handicapping (2024 revision), Rule 6.1** — Course Handicap formula
  (`Course Handicap = (Handicap Index × Slope Rating) ÷ 113 + (Course Rating − Par)`). Direct
  `WebFetch` of the USGA PDF 403'd; corroborated via `WebFetch` of Wikipedia's "Handicap (golf)"
  article (quotes the formula with the rule number) and a `WebSearch` pass independently quoting
  the same formula from TheGrint's walkthrough and USGA's own "Section 10" handbook page summary.
- **USGA, Rules of Handicapping, Rule 5.1 (Score Differential)** — `113 ÷ Slope Rating × (Adjusted
  Gross Score − Course Rating − PCC)`; background only, not computed on this page (see "Golf
  handicap investigation" above).
- **Epley/Riegel/etc.** — not re-fetched this run; reused only where a related page already cites them.
- **MLB.com Glossary, "On-Base Percentage"** — `OBP = (H + BB + HBP) ÷ (AB + BB + HBP + SF)`. Direct
  `WebFetch` 406'd (blocks non-browser user agents); corroborated via a direct `WebFetch` of
  Wikipedia's "On-base percentage" raw wikitext, which quotes the identical formula with its own
  citations to Baseball-Reference.com and FanGraphs.
- **MLB.com Glossary, "Slugging Percentage"** — `SLG = (1B + 2×2B + 3×3B + 4×HR) ÷ AB`. Same 406;
  corroborated via Wikipedia's "Slugging percentage" raw wikitext, citing Andres Wirkmaa, *Baseball
  Scorekeeping: A Practical Guide to the Rules* (McFarland, 2003).
- **ICC Men's Standard ODI Playing Conditions, Clause 16.10.2** — tournament net run rate =
  (runs scored ÷ overs faced) − (runs conceded ÷ overs bowled), aggregated across the whole
  competition, not averaged match to match. Direct `WebFetch` of the BCCI-hosted PDF 403'd;
  corroborated via two independently worded `WebSearch` passes (both citing clause 16.10.2
  verbatim) and a direct `WebFetch` of Wikipedia's "Net run rate" raw wikitext, which cites the
  same rule to the ICC Playing Handbook 2013/14 §21.9.2 and states the "bowled out → full quota of
  overs" rule in the same words both times.
- **Economy rate / bowling average / strike rate** — standard, definitional cricket statistics
  (runs conceded ÷ wickets; runs conceded ÷ overs bowled; balls bowled ÷ wickets), confirmed via
  `WebSearch` against Wikipedia's "Economy rate" and "Strike rate" articles and cricket-statistics
  explainer pages; these are arithmetic definitions, not a single citable paper, the same category
  as batting average itself.
- **NFL.com, "NFL Quarterback Rating Formula"** (the Wikipedia "Passer rating" article's own cited
  primary source) — the four components a/b/c/d, each clamped to [0, 2.375], combined as
  `Rating = (a + b + c + d) ÷ 6 × 100`. Confirmed via a direct `WebFetch` of Wikipedia's "Passer
  rating" raw wikitext (quotes the formula, the clamping rule, and the NFL.com citation with its
  access date) and a `WebSearch` pass independently quoting the identical formula from
  Pro-Football-Reference's own explainer page. Also recorded the formula's own origin (a 1971
  committee under Don Smith of the Pro Football Hall of Fame and Seymour Siwoff of the Elias Sports
  Bureau, commissioned by Commissioner Pete Rozelle, adopted by the NFL in 1973) for the concept
  section.
- **Elo, A., *The Rating of Chessplayers, Past and Present*, 2nd ed. (1986; 1st pub. 1978)** —
  expected score `E = 1 ÷ (1 + 10^((Ropponent − R) ÷ 400))` and rating update
  `R′ = R + K × (S − E)`. Confirmed via a direct `WebFetch` of Wikipedia's "Elo rating system" raw
  wikitext, which quotes both formulas and cites Elo's book directly.
- **FIDE Handbook, B.02 Rating Regulations (effective 1 March 2024)** — current K-factor table
  (K=40 under 30 rated games, or under-18 and rating below 2300; K=20 below 2400; K=10 at 2400+,
  staying at 10 even if rating later drops) and the "K × n ≤ 700 per rating period" cap. Confirmed
  via a direct `WebFetch` of `handbook.fide.com/chapter/B022024` (the live FIDE handbook page).
- **CDC / Mayo Clinic average adult stride figures, and the height-based stride estimate (stride ≈
  height × 0.413)** — confirmed via `WebSearch` against multiple independently worded passes citing
  the same CDC/Mayo-sourced 76 cm average stride and the same 0.413 (women) / 0.415 (men) height
  coefficients; used only as background in the concept/FAQ text, not as a value this calculator's
  `compute()` uses (the solver takes a measured stride length or distance directly, never guesses one).
- **NIST Special Publication 811** — reused for the exact foot/mile/yard constants already cited
  elsewhere on the site, for `steps-to-miles-calculator`'s unit conversions.

## Verification

Independent scratch script (re-implements every formula from scratch, no app imports):
`verify_sports_run2.mjs` (scratchpad). See the PR description for the full output.

## Build, lint, structural checks

`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`, `npm test`,
`npm run build` — see the PR description for the full pass/fail summary.

Per the task's instruction, no Chrome/dark-mode visual pass this batch (and per `CLAUDE.md`'s own
cadence note, the visual pass is due once the running count reaches ~50 — this run lands at exactly
50 — flagged above). Curl-based structural checks against a backgrounded `npm run dev` instead,
covering all 7 new calculator pages: 200 status, H1, JSON-LD, every content section id present.
See the PR description for the exact check output.

## Dev server

Started with `run_in_background`, confirmed killed (port 3000 clear via `netstat`) before
finishing — see the PR description for the exact check.
