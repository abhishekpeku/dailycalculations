# Step 37 — Batch 3: health (6), v2 conversion (YMYL)

## Progress

- [x] Step file, draft PR
- [x] bmi-calculator (A · RangeBar with WHO adult bands)
- [x] calorie-calculator (B · CompareBars loss / maintenance / gain; plan: three-tier bar, not in kit)
- [x] tdee-calculator (B · Donut BMR + activity; plan: stacked bar, not in kit)
- [x] water-intake-calculator (B · CompareBars your estimate vs NASEM reference intakes; plan: glasses-per-day row, not in kit)
- [x] running-pace-calculator (A · CompareBars of Riegel race predictions; new `pace` dimension; plan: splits table, not in kit)
- [ ] pregnancy-due-date-calculator (B · Timeline with trimesters) — second run
- [ ] Number verification script, tests, build, lint, STATUS.md, PR ready

Paused 2026-10-20 after running-pace-calculator. Resume from the first unchecked box.

Commit + push after each box (`step 37: <id>`). Runs are 5 calculators (D11): the first run
builds bmi → running-pace and pauses; the second run does pregnancy-due-date and finishes.

**Scope (from `STATUS.md`):** Batch 3, health (6), YMYL. Convert the 6 calculators to the v2
template: widget type per the plan, units (kg/lb/st, cm/in/ft), the listed result visual (nearest
kit component when the kit lacks it, gap Parked), full v2 content (concept, how-to, formula, worked
example, watch-outs, FAQ, references), verified numbers. Primary/authoritative sources (WHO, CDC,
NIH, NASEM, peer-reviewed formula papers), a clear "estimate only, not medical advice" note, no
overstated accuracy. Ids/URLs unchanged; `calculatorOrder` untouched.

**Spec:** `mdFiles/calculator-rollout-plan.md` §1 and §3 Batch 3; `mdFiles/calculator-template-v2.md`.

---

## Plan

| Calculator | Type | Auto-solve fields / fixed inputs | Outputs | Visual (plan → used) |
|---|---|---|---|---|
| bmi | A | BMI ↔ weight ↔ height (closed form; zero height → NaN) | healthy-weight range for the height (BMI 18.5–24.9) | **RangeBar** WHO bands |
| calorie | B | — | maintenance, loss (−500), gain (+500), BMR | three-tier bar → **CompareBars** |
| tdee | B | — | TDEE, BMR, cut (−500), bulk (+300) | stacked bar → **Donut** BMR + activity calories |
| water-intake | B | — | oz/day, L/day, 8-oz glasses | glasses row → **CompareBars** vs NASEM adequate intakes |
| running-pace | A | pace ↔ distance ↔ time (closed form) | speed, even-pace marathon | splits table → **CompareBars** Riegel predictions |
| pregnancy-due-date | B | — | due date, weeks, trimester | **Timeline** trimesters |

Rules carried from steps 35–36:

- Type A = `solver` beside the unchanged `inputs` + `compute()`; visuals in `solver.visuals`,
  display figures in `solver.derive` (solver visuals receive SI).
- Type B: unit menus via `dimension` + `unit` on inputs (compute still gets lb / in), explicit labels
  and formats on every output, menu inputs via `options`.
- **Sex in Mifflin-St Jeor (calorie, tdee):** both `compute()`s hard-code the male constant (+5).
  A new `sex` menu input (0 = male, default; 1 = female → −161) fixes that. Its snapshot values
  (default 0, typical 0 × 1.5 = 0, edge min 0) are all "male", so the snapshot must not move.
- `lib/breakdown.spec.ts` type-B floor is 20; each A conversion lowers the count.
- Don't `git commit -a`: builds rewrite `tsconfig.tsbuildinfo` / `next-env.d.ts`.
- Verify every copy number with an independent scratch script (Python, imports nothing from the app).
