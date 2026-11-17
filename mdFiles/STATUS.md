# Development status

**Single source of truth for what is done, what is next, and every decision made.**
Read this first in any new session. Update it at the end of every step.

Spec: `mdFiles/instructions.md` (§ references below point into it).
Protocol: `CLAUDE.md` → "Working protocol".
Step files: `mdFiles/steps/NN-<name>.md`. All Markdown lives in `mdFiles/` — see CLAUDE.md.

Last updated: 2026-11-17 · **Step 48 biology batch 6 (PR #120, open, not yet merged) DONE — Wave 4
(biology) is now fully complete.** Final batch: `dog-age-calculator` (Wang et al. 2020 Cell
Systems epigenetic-clock formula, `human_age = 16 × ln(dog_age) + 31`, not the flat "× 7" myth),
`cat-age-calculator` (International Cat Care's published chart), `animal-gestation-calculator`
(dog/cat/cow/horse/goat/sheep/rabbit species-selector lookup), `egg-incubation-calculator`
(chicken/duck/Muscovy duck/goose/turkey/2 quail species lookup) — 4 of 5 planned slots, 1 honest
skip (a pet-food/RER-calorie calculator's primary sources all 404'd/reCAPTCHA'd/JS-rendered on
every direct-fetch attempt; a body-condition-score idea was skipped as not formula-shaped). No pet
medication/dosage calculator was built, per the step's own gap-check. `npm test` 1529/1529
(additive snapshot diff, 1 new `KNOWN_NON_FINITE` entry), lint clean, `npm run build` 399 pages.
**`biology` 24 → 28, site-wide 395 → 399 — Wave 4 (biology) fully DONE.** Full detail in
`mdFiles/steps/48-wave-4-biology.md`. **Next per decision D13/D22's locked category order:
ecology** (a new category) — **still needs its own separate go-ahead from the user before any
scoping or work starts**; not begun.

Previous: **Step 46 runs 11 (physics) + 12 (chemistry) BOTH DONE** (built in
parallel, different category files; only this STATUS.md summary and `data/calculators.spec.ts.snapshot`
needed reconciling at merge time — the Cloudflare "Workers Builds" check also stopped reporting on
this repo partway through this session, confirmed down even on master's own latest commit, so these
two merges were verified by local `npm test`/`lint`/`npm run build` only, per the user's own
go-ahead to proceed that way while it's down). **Run 11 (physics, PR #113)** added
`elastic-collision-calculator` (1D two-mass elastic collision, breakdown widget solving both final
velocities at once — not a solver, since two inputs can't invert to four), `inelastic-collision-
calculator` (perfectly inelastic 1D collision, 5-variable closed-form solver), `center-of-mass-
calculator` (two-body center of mass, 5-variable closed-form solver), `kinetic-friction-incline-
calculator` (f = μmg×cosθ, distinct from the flat-ground `friction-calculator`, with acceleration-
down-slope and normal-force bonus outputs), and `molar-heat-capacity-calculator` (Cp = Cv + R,
Mayer's relation for an ideal gas, with heat-capacity-ratio bonus output and a Table-3.3-sourced
reference table). New `lib/units.ts` dimension: `molarHeatCapacity`. Coulomb's law (two point
charges) was reconsidered a third time and dropped again as too thin a variant of `gravitational-
force-calculator`'s identical inverse-square shape. Found and explained (not a bug, documented in
the calculator copy itself): OpenStax's own Example 9.16 (Earth-Moon center of mass) states
4.64×10⁶ m, but recomputing its own stated inputs exactly gives 4.65×10⁶ m — attributed to OpenStax's
own intermediate rounding, both figures shown with that explanation. **`physics` 51 → 56.** **Run 12
(chemistry, PR #112)** **fixed the pre-existing `common-ion-effect-calculator` unit-dimension bug**
(flagged run 10, parked through run 11): `commonIonConcentration`/`molarSolubility`/the
`plainWaterSolubility` output moved from `dimension: 'concentration'` to `dimension: 'count'`,
matching `ksp`'s own dimension and the same all-`count` pattern `weak-acid-ionization-calculator`
already used to avoid this bug — verified with a standalone scratch script reproducing both the bug
(a ~1,000,000× live-widget error) and the fix. Then added 5 new calculators:
`ksp-from-solubility-calculator`, `weak-base-ionization-calculator`,
`buffer-ph-after-addition-calculator`, `lattice-energy-calculator` (a Born-Haber cycle solver — no
new `lib/units.ts` dimension needed), `ionic-strength-calculator`. **`chemistry` 55 → 60 — at the
wave's ~60 target, closed out.** Both runs: `npm test`/lint/`npm run build` all pass independently
and after merging. **Site-wide total after both: 366.** Full detail in
`mdFiles/steps/46-47-wave-3-physics-chemistry.md`.

Previous: **Step 46 chemistry run 11 DONE** — PR #110, branch
`step/46-wave-3-chemistry-run-11` (built in parallel with physics run 10, separate category file).
Added `formal-charge-calculator`, `latent-heat-calculator`, `raoults-law-calculator`,
`nuclear-binding-energy-calculator`, `gas-density-calculator`. New `lib/units.ts` dimension:
`specificLatentHeat`; new unit: `g/L` on `density`. `common-ion-effect-calculator`'s pre-existing
unit-dimension bug (flagged run 10) remains parked, not fixed this run. `npm test` (1,382), lint and
`npm run build` all pass. **`chemistry` 50 → 55, site-wide 356** (51 physics + 5 → after both runs
reconciled). Full detail in `mdFiles/steps/46-47-wave-3-physics-chemistry.md`.

Previous: **Step 46 physics run 10 DONE** — PR #111, branch
`step/46-wave-3-physics-run-10`. Built the rotational-dynamics trio run 9 explicitly deferred
(`moment-of-inertia-calculator`, `rotational-kinetic-energy-calculator`,
`angular-momentum-calculator`) plus two electricity/circuits calculators
(`rc-time-constant-calculator`, `lc-resonant-frequency-calculator`).
`moment-of-inertia-calculator` is a type-B breakdown/lookup widget (shape selector + mass +
radius/length) covering 7 shapes (point mass, rod about center/end, solid disk, solid sphere,
hollow sphere, thin hoop/ring) straight from OpenStax University Physics Volume 1 §10.4's own
Figure 10.20 (fetched as the source image directly, since the page text references the figure
without transcribing it). New `lib/units.ts` dimensions: `momentOfInertia` (kg·m², alt lb·ft²),
`angularMomentum` (kg·m²/s, alt lb·ft²/s, shares `momentOfInertia`'s factor) and `inductance`
(H, alts mH/µH, for the LC calculator). Coulomb's law (two point charges) was reconsidered for a
4th/5th slot and dropped again as too thin a variant of `gravitational-force-calculator`'s
identical inverse-square shape, per run 9's own note; picked RC/LC instead, both standard
intro-circuits topics with no existing coverage. `npm test` (1,366), lint and `npm run build` all
pass. One new `KNOWN_NON_FINITE` entry: `lc-resonant-frequency-calculator` (`resonantFrequency`;
inductance and capacitance both 0 at their own min → compute()'s own guard, no resonance at zero
L or C). Snapshot diff is additive-only (169 new lines, 0 removed). **`physics` 46 → 51, site-wide
351.** Full detail in `mdFiles/steps/46-47-wave-3-physics-chemistry.md`.

Previous: **Step 46 runs 9 + 10 BOTH DONE** (built in parallel, different category
files, no merge conflict in the data — only this STATUS.md summary needed reconciling). **Run 9
(physics SHM/orbital/modulus/E&M run, PR #108)** added `simple-harmonic-motion-calculator`
(T = 2π√(m/k), mass-spring period), `orbital-velocity-calculator` (v = √(GM/r), cross-linked both
ways with `escape-velocity-calculator`'s exact √2 relationship), `youngs-modulus-calculator`
(Y = F·L0/(A·ΔL), reuses the `pressure` dimension plus a new `GPa` unit on it),
`electric-field-calculator` (E = kq/r², point charge) and `magnetic-force-calculator`
(F = BIL sin θ). New `lib/units.ts` dimensions: `electricField` (N/C, alt V/m) and
`magneticFluxDensity` (T, alts mT/G). Angular momentum, moment of inertia, and rotational kinetic
energy were considered and deliberately deferred to a future run as a group — all three need a new
`momentOfInertia` dimension (angular momentum a second, `angularMomentum`), better built together
than split across runs. **`physics` 41 → 46.** **Run 10 (chemistry, PR #109)**, not part of the
originally-scoped runs 1-9 (those exhausted the seed lists), added
`grahams-law-effusion-calculator`, `weak-acid-ionization-calculator`,
`current-efficiency-calculator`, `hess-law-enthalpy-calculator`, `conservation-of-mass-calculator`.
Zero new `lib/units.ts` dimensions — every formula reused `molarMass`/`count`/`mass`/`current`/
`time`/`percent`/`pH`. Found and parked a pre-existing unit-mismatch bug in `common-ion-effect-
calculator` (run 9) while designing this run's own weak-acid solver — see Parked. **`chemistry`
45 → 50.** Both runs: `npm test`/lint/`npm run build` all pass independently and after merging. **Site-wide
total after both: 346.** Full detail in `mdFiles/steps/46-47-wave-3-physics-chemistry.md`.

Previous: **Step 46 run 8 (physics drivetrain/efficiency run) DONE** — PR #107,
branch `step/46-wave-3-physics-run-8`, added `horsepower-calculator`, `rpm-to-speed-calculator`,
`gear-ratio-calculator`, `efficiency-calculator`, `angular-velocity-calculator`. New `lib/units.ts`
dimension: `angularVelocity` (rad/s, rpm, rev/s, deg/s), kept separate from `frequency` despite
being proportional by exactly 2π (same reasoning as `torque` vs `energy`). `specific-gravity-
calculator` was considered for the 5th slot and ruled out as a near-duplicate of chemistry's
`density-of-solutions-calculator`; picked `angular-velocity-calculator` (ω = Δθ ÷ Δt) instead.
`npm test` (1,302), lint and `npm run build` (367 routes) all pass. **`physics` now 41 (36 → 41),
site-wide 336.** Full detail in `mdFiles/steps/46-47-wave-3-physics-chemistry.md`.

Previous: **Step 46 runs 6+7 (physics mechanics-remainder run B + waves/other-
remainder run) BOTH DONE AND RECONCILED.** Run B (PR #105, branch `step/46-wave-3-physics-run-6`)
added `centripetal-force-calculator`, `gravitational-force-calculator`, `torque-calculator`,
`buoyancy-calculator`, `pendulum-period-calculator`. Run C (PR #106, branch
`step/46-wave-3-physics-run-7`) added `doppler-effect-calculator`, `snells-law-calculator`,
`mass-energy-equivalence-calculator`, `thermal-expansion-calculator`, `escape-velocity-calculator`
— closing out every named item in this step's "Physics — proposed additions" seed lists. Both ran
in parallel (user-approved override of the usual one-agent-at-a-time rule) and independently edited
`data/calculators/physics.ts`/`data/calculators/index.ts` from the same base, so PR #106 conflicted
on merge as expected; the main session resolved it by hand-splicing both calculator blocks into one
file (keeping both new `lib/units.ts` dimensions, `torque` and `thermalExpansionCoeff`, and the new
`km/s` speed unit), re-verified (`npm test` 1,280/1,280, lint clean, `npm run build` 362 routes), and
pushed the resolution directly onto PR #106's branch before merging. **`physics` now 36 (21 → 36
across runs A/B/C), site-wide 331.** Full detail in the Session log and
`mdFiles/steps/46-47-wave-3-physics-chemistry.md`.

Previous: **Step 46 run 5 (physics mechanics-remainder run A) DONE** — PR #104
added `acceleration-calculator`, `free-fall-calculator`, `projectile-motion-calculator`,
`friction-calculator`, `spring-hookes-law-calculator` on branch `step/46-wave-3-physics-run-5`;
`physics` 21 → 26, site-wide 316 → 321. New `lib/units.ts` dimension: `springConstant`.
**Step 60 (Wave 5a: finance/money-hub expansion) is now FULLY DONE across
all 7 batches** — batch 7 (`income-tax-calculator`, PR #103) added on branch
`step/60-wave-5a-finance-run-7`; `finance` 38 → 39, site-wide 315 → 316. Only the wave's visual-QA
spot-check remains (pending on the main session — see the Session log entry below). Full detail in
the Session log.
**UX-08 and UX-10 are both now fully DONE.** UX-08 (sub-group every category): batch 5 (PR #91) closes it out — every one of the site's 18 categories is sub-grouped, both on its own `/categories/<id>` page and in the Categories dropdown; see the UX-08 row below for the full per-category group count. UX-10 (result-set completeness audit): batch 5 (PR #90) closes it out — **23 real additions, 79 "no change needed," 102/102 calculators reviewed** across all 5 batches (chemistry/physics/measurements/math/remainder); see the UX-10 row below. Both steps finished via agents run in parallel on the user's request, isolated via a git worktree per concurrent agent to avoid branch collisions on the shared checkout. Next up per the D20 order: resume step 60 (finance wave, batches 2-7). **UX-12 (download on 6 custom widgets, PR #82) also DONE and merged 2026-11-15.** Full detail in the Session log. **UX-09 third/fourth follow-up: CSV→Excel pivot + PDF/Print redesign, then the Print option dropped — DONE 2026-11-15, merged** — replaced CSV with a two-sheet Excel workbook (`lib/exportExcel.ts`, new `exceljs` dependency) and rewrote the PDF layout (`lib/exportPdf.ts`) and print CSS (`app/globals.css`, `CalculatorWidget.tsx`) against two rounds of Opus design consultation, after a user screenshot caught a real bug (chart image overlapping inputs; numbers stored as text) in the first Excel draft. `npm test` 1123/1123, lint clean, build passes. Full detail in the Session log and `mdFiles/steps/ux-09-download-export.md`. **Step 60, Wave 5a finance batch 1 (real estate/affordability) DONE 2026-11-15, PR #75 open, not yet merged** — `home-affordability-calculator`, `mortgage-refinance-calculator`, `down-payment-savings-calculator`, `closing-cost-estimator-calculator`, `rent-vs-buy-calculator` added on branch `step/60-wave-5a-finance-run-1`. `finance` 8 → 13, site 290 → 295 pages. **Batch 2 (debt) also DONE 2026-11-15, PR #92** — `debt-to-income-calculator`, `debt-payoff-calculator`, `credit-card-minimum-payment-calculator`, `balance-transfer-savings-calculator`, `student-loan-calculator` on branch `step/60-wave-5a-finance-run-2`; `finance` 13 → 18, site → 300 pages. Batches 3-7 (retirement ×2, investment analysis, remaining items, income tax) still TODO — see the step index below and `mdFiles/steps/60-wave-5a-finance-money-hub.md`. Full details in the Session log. **UX-07 (amortization schedule: monthly detail on short/switched terms) DONE 2026-11-15** — off the numbered sequence. User-reported bug: `AmortizationTable`/`amortizationSchedule` always rolled up into yearly rows, so a term ≤12 months (e.g. `emi-calculator`'s own 12-month default) collapsed into 1 row with no monthly detail; same component is shared by `mortgage-calculator`, `loan-calculator`, `emi-calculator`, `car-payment-calculator`. Fixed in `lib/amortization.ts` (new `amortizationMonthlySchedule`; `amortizationSchedule` now derives from it, byte-identical output) and `components/visuals/AmortizationTable.tsx` (≤12-month terms show a direct monthly table; >12-month terms keep the yearly rows + pagination but each year row is now an expandable disclosure revealing its monthly rows, overall 1-based month numbering). `npm test` 1108 → 1115 (7 new tests incl. the year-sum-matches-monthly regression guard), lint clean, build passes (290 pages, unchanged). PR: see step file `mdFiles/steps/ux-07-amortization-monthly-schedule.md`. **Step 60 (Wave 5a: finance/money-hub) queued next, pulled forward ahead of biology/ecology/fun-other/tech by user decision 2026-11-15 (D16/D17)** — scope in `mdFiles/steps/60-wave-5a-finance-money-hub.md`, 31 calculators in 7 batches, `finance` 8 → ~39. Not started yet. Previous step: **46–47 — Wave 3 (physics · chemistry) IN PROGRESS**, physics runs 1-4 DONE and merged (PR #61-#64); chemistry runs 1-9 DONE and merged (PR #65-#73). Chemistry run 9 added `ksp-molar-solubility-calculator`, `common-ion-effect-calculator`, `isotope-notation-calculator`, `molecular-geometry-calculator`, `specific-heat-by-mixing-calculator`, plus new `lib/molecularGeometry.ts` (12-row VSEPR table, OpenStax-sourced) — zero new `lib/units.ts` dimensions (all reused). `chemistry` now 45 calculators, **259 total on the site**. Independently re-verified by the main session (`npm test` 1108/1108, lint clean, `npm run build` 259 pages) before merging. **Visual-QA checkpoint done 2026-11-12** (254 calculators, 60 past the 194-calculator 2026-11-05 pass): Chrome extension reconnected this session. Checked a representative sample — `speed-distance-time-calculator`, `ohms-law-calculator`, `series-parallel-resistor-calculator`, `resistor-color-code-calculator` (physics, runs 1-3: solver/breakdown/lookup-table widget types) and `rate-law-calculator`, `oxidation-number-calculator`, `vapor-pressure-calculator`, `calorimetry-enthalpy-calculator` (chemistry run 8) plus `/categories/chemistry` — in both dark and light mode at desktop width. All rendered correctly, no visual regressions. Phone-width check was blocked by a `resize_window` tool/environment limitation (window wouldn't shrink below desktop size) — not re-attempted; worth another try next time the extension cadence comes up. Next up: chemistry run 9+ toward ~60 total. **43–45 / 46 / 59 — Wave 2 (construction · food · sports) is FULLY DONE.** Construction (PRs #51/#52/#54/#55): `home` category widened to 27. Food (PRs #56/#57/#58): new `food` category, 17 calculators. Sports (PRs #59/#60): new `sports` category (green theme, `trophy` icon), 12 calculators — one-rep-max, heart-rate-zones, vo2-max, race-time-predictor, swim-pace, steps-to-miles, baseball-batting-average, cricket-bowling-figures, cricket-net-run-rate, nfl-passer-rating, elo-rating, golf-course-handicap. **194 calculators total.** **Visual-QA checkpoint handled 2026-11-05** (50 calculators since the last Chrome pass, per the `CLAUDE.md` cadence): the Claude in Chrome extension wasn't connected this session, so no automated screenshot pass ran. Treated as satisfied instead by: every batch's own `npm test`/`lint`/`build` + curl-based structural checks (200s, correct H1/JSON-LD/content sections) during merge review, plus the user manually loading several of the new pages locally and confirming the site renders correctly. Also fixed a recurrence of the known stale-`.next`-shadows-`npm run dev` issue (same root cause noted in Parked from 2026-11-02) — deleting `.next` and restarting `npm run dev` fixed it. A real Chrome visual/dark-mode pass is still worth doing once the extension is reconnected; not blocking further work. **Step 40–42 (Wave 1) DONE 2026-10-29**: math (29 calculators, PRs #15–#20), statistics (25, PRs #21–#26), conversion (36 pages in 8 runs, PRs #28–#35: pair + general unit converters, cups↔grams by ingredient, shoe sizes, ring sizes, plus the `commonValues` / `referenceTable` / `BreakdownOutput.labels` kit additions). Clothing sizes dropped by the user's decision. 144 calculators. **UX-01 (homepage + footer redesign) DONE 2026-10-31**, off the numbered sequence — PR #38 + polish #39 (merged). **UX-02 (calculator intro card — "How it works" diagram) DONE 2026-10-31**, off the numbered sequence — PR #41 (merged). **UX-03 (related calculators moved directly under the calculator) DONE 2026-10-31** — PR #42 (merged). **UX-04 (calculator glyphs + categories dropdown/phone menu) DONE 2026-11-01** — PR #43 (merged); follow-up #46 (2026-11-01) added a hover/focus preview in the dropdown's left pane. **UX-05 (pages restyle: /calculators, the 15 /categories/<id> pages, About/Contact/Privacy/Terms/Suggestions, and the /categories index → /calculators redirect) DONE 2026-11-01** — PR #44 (merged); follow-up #47 (2026-11-01) then removed the "Other categories" row #44 had added to each category page — redundant with the footer and the dropdown, and on a 1-calculator category (physics, education) it outweighed the actual content. **UX-06 (calculator sub-groups within the three large category pages) DONE 2026-11-02** — PR #48. Also merged: #45 (2026-11-01, silenced a harmless but noisy esbuild "duplicate key" warning in t-test-calculator's `compute()`, no behavior change). Nothing deployed since the rollout began — deploys stay manual (user).

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
| D9 | **v2 template is the page format for every calculator.** (2026-10-12) | Approved by the user on the `force-calculator` preview. Spec: `mdFiles/calculator-template-v2.md`. Widget types A (auto-solve) / B (breakdown) / C (custom) per `mdFiles/calculator-rollout-plan.md`. |
| D10 | **Go broad like Omni, in sector waves.** (2026-10-12) | `mdFiles/omni-strategy.md` §4. Each sector opens with ≥ 25 calculators. |
| D11 | **One agent at a time; the main session merges; no deploys until the rollout is done.** (2026-10-12, workflow changed 2026-10-13) | Only **one background agent runs at a time**. Nothing runs in parallel, and batches go strictly in sequence. The agent pushes a branch and opens a PR. When the PR passes (build, lint, `npm test`), the **main session merges it without asking the user**, then starts the next agent. The user never merges. Runs are **5 calculators**. Every agent commits and pushes after each sub-task (each calculator in a batch), keeps a Progress checklist in its step file, and opens a draft PR early, so an interrupted run can be resumed from the checklist. No Cloudflare changes. The user deploys manually at the end. |
| D12 | **Defaults taken 2026-10-13, reversible:** pace 10 calculators/week; the step-11 gate does **not** block the rollout (the user said "continue with the planned work"; Search Console measurement still happens via step 28); sector order math/stats/conversion first. | The user didn't answer the three open questions, so these are the plan's defaults. Change them here if the user says otherwise. |
| D8 | **Skip all "what is my IP" style queries.** | Zero-click (Google answers inline), flat trend, poor ad RPM, dilutes topical focus. `ip-subnet-calculator` is still built — it is a real calculation (§5.4). |
| D14 | **Wave 5 queued after Wave 4; Guide content type approved for scoping (not building).** (2026-11-08, **money-hub piece pulled forward 2026-11-15, see D16**) | A competitive-positioning report (about `dailycalculators.com`, a different site — its "existing tools" claims didn't match our actual inventory when checked) prompted a review of what we're missing: money-hub expansion, insurance, solar/home-energy, business/tax, crypto — all genuinely uncovered gaps. User originally decided: finish the committed D13 sequence first, these open as **Wave 5** after — **superseded for the money-hub piece only by D16** (user asked about `finance` directly on 2026-11-15 and chose to do it now). Insurance/solar/business-tax/crypto (new categories) are unaffected — still queued after Wave 4. Seed lists in `mdFiles/omni-strategy.md` §4.5. Separately, user approved starting to scope a new **Guide** content type (long-form articles spanning several calculators, e.g. "How much house can I afford?") — a mockup (`https://claude.ai/artifact/Ubmsp7qX8vTzMWQHUJLgMV`) was built and approved. Full scoping, including still-open questions (URL shape, badge visibility, CTA placement), in `mdFiles/guide-content-plan.md`. The Guide content type still gets its step file written just-in-time when actually scheduled. |
| D13 | **Remaining-category build order, planned 2026-11-07:** physics (remainder) → chemistry (remainder) → **[step 60 finance/money-hub inserted here, 2026-11-15, see D16]** → biology (new) → ecology (new) → fun/other (new) → tech (step 25, ~3 calculators). **Physics, chemistry, and biology are all now DONE (2026-11-17, see D22 and the Session log) — ecology is next.** | User asked for a category-wise plan of what's left and said to keep this exact order; explicitly **do not start** any of it without a separate go-ahead — **the go-ahead for step 60 (finance) was given 2026-11-15, see D16; physics/chemistry/biology's go-ahead came via D22 and all three finished 2026-11-17 (physics 1→61, chemistry 0→60, biology 0→28); ecology/fun-other/tech still need a go-ahead.** Detailed run breakdown for the physics/chemistry remainder is in `mdFiles/steps/46-47-wave-3-physics-chemistry.md`'s "Planned remaining runs" section and its closing summary; biology's own run breakdown is in `mdFiles/steps/48-wave-4-biology.md`. Ecology/fun-other/tech stay unscoped until their step is actually reached (step files are written just-in-time, per the working protocol) — seed material lives in `mdFiles/omni-strategy.md` §4.1/§4.2 and `mdFiles/calculator-rollout-plan.md` §4 "Wave 4". Targets: physics ~61 (DONE, hit exactly), chemistry ~60 (DONE, hit exactly), biology ~30 (DONE at 28, 2 short by deliberate honest-skip decisions, see the Session log), ecology ~25, fun/other ~25, tech ~3 (new category) — ~63 calculators left across ecology/fun-other (plus step 60's remaining finance batches and tech's ~3), toward the ~475-site-wide end state. Food/sports/measurements(conversion)/math were each closed out below their original rollout-plan target by deliberate decision and are **not** queued for further runs unless the user asks. |
| D16 | **Finance/money-hub expansion pulled forward ahead of biology/ecology/fun-other/tech** (2026-11-15) | User asked mid-session "what do we need to do for finance category?" — in response, a calculator.net gap diff found `finance` (8 calculators) under-built relative to its commercial value, with several gaps not yet on the Wave 5 money-hub seed list (Social Security, Pension, Annuity/Annuity Payout, CD, Student Loan, College Savings, Simple Interest, Mutual Fund, Business Loan, Commission, Income Tax, Traditional IRA, RMD). Asked directly whether to reorder; user said yes — do finance next, ahead of biology/ecology/fun-other/tech. Only the `finance`-category piece of Wave 5 moves up; the new Wave 5 categories (solar/insurance/business-tax/crypto) are untouched, still after Wave 4. Scoped as **step 60** (`mdFiles/steps/60-wave-5a-finance-money-hub.md`): 31 calculators, 7 batches of ~5, `finance` 8 → ~39. Also the origin of **D17** (more calculators, never fewer). |
| D17 | **"More calculators, never fewer" — SEO breadth principle** (2026-11-15) | When deciding whether a niche/low-search-volume candidate calculator is worth building, default to building it — more indexed pages is more SEO surface area. Does not override an already-reasoned exclusion (D8's skip-IP-query rule, or a per-run "too thin/niche" call like siding/framing in construction) — those still stand. Applies to the *next* judgment call, not retroactively. |
| D18 | **Work order confirmed 2026-11-15: UX-10 → UX-08 → UX-09 → resume step 60.** | User asked to "rectify" things before finishing the finance wave. Clarified via questions into: (1) UX-10, a full site-wide result-set completeness audit (102/264 calculators have ≤1 output; user explicitly chose the full count-based scope over the narrower chemistry/physics-only recommendation), because UX-09's download feature exports whatever's on screen — thin result, thin download. (2) UX-08 (sub-group every category + dropdown) runs right after. (3) UX-09 (download/export) builds on top of both. (4) Step 60's finance batches 2-7 resume only after all three close out. Step 60 batch 1 (PR #75) is merged and not re-opened by this pause. **Superseded for UX-09 by D19** — built immediately instead of waiting for UX-10/UX-08. |
| D19 | **UX-09 (download/export) pulled forward, built immediately 2026-11-15, ahead of D18's order.** | After UX-11 (widget layout) landed and its placement was confirmed live with a placeholder, the user asked to build the real download feature right away rather than wait for UX-10 (result-set audit) and UX-08 (category sub-grouping) to finish first, as D18 had sequenced. UX-10 is left mid-flight (chemistry sub-batch 1a done, 1b not started) and UX-08 is still unscoped — both resume once UX-09 is done. New dependency noted per CLAUDE.md: `jspdf` ^4.2.1 + `jspdf-autotable` ^5.0.9 (see the UX-09 STATUS.md row and `mdFiles/steps/ux-09-download-export.md` for the audit/code-split verification). |
| D20 | **New priority order 2026-11-15, before any deploy: UX-12 (download on the 6 custom widgets) → UX-08 (sub-group every category) → resume UX-10 (physics/measurements/math/remainder batches) → resume step 60.** | After UX-09 shipped, the user asked whether download was available on every calculator; answer: no — the 6 hand-built "custom" (type C) widgets (`currency-converter`, `scientific-calculator`, `character-counter`, `hashtag-counter`, `pomodoro-timer`, `timezone-meeting-planner`) never adopted the shared `WidgetActions` shell, so they have no download control. User decided: fix that (scoped as new step **UX-12**) and finish UX-08 (sub-grouping, confirmed scope since D18) **before** deploying to the live domain — deploys stay manual, user's own call, once these two land. UX-10's remaining batches (physics/measurements/math/remainder) and step 60's finance batches 2-7 are not abandoned, just pushed behind UX-12/UX-08 again. |
| D21 | **Two new parallel workstreams added 2026-11-15, running alongside step 60's resumption: UX-13 (header search) and step 61 (deepen every category under 10 calculators to ≥10).** | User asked for a direct search entry point in the header (not nested in the Categories dropdown), and separately asked to plan and build real additions for every category currently under 10 calculators. Both scoped as new steps and launched as background agents in isolated git worktrees, running in parallel with step 60 batch 2 — this mirrors the UX-08/UX-10 parallel-worktree pattern the user already approved. Full scope: `mdFiles/steps/ux-13-header-search.md`, `mdFiles/steps/61-deepen-small-categories.md`. |
| D22 | **New priority order 2026-11-16: finance (finish step 60) → physics + chemistry (D13's locked remainder) → biology → everything else.** **Physics, chemistry, and biology all closed out 2026-11-17.** | User asked to prioritize finishing the finance wave (step 60) next, then physics/chemistry (widening the existing categories further, per D13's already-locked order), then the new `biology` category, then the rest (ecology/fun-other/tech, the remaining step 61 small-category batches — travel finishing now plus time/creator/text/education, Wave 5) in whatever order makes sense once those three are done. This formally re-opens the D13 go-ahead for physics/chemistry/biology specifically (D13 had required a separate go-ahead per category before starting) — ecology/fun-other/tech still need their own go-ahead when reached. Step 61 batch 5 (`travel`), already running when this was asked, finishes and merges before the pivot — not interrupted mid-run. Step 61 batches 6-9 (`time`, `creator`, `text`, `education`) are paused, not abandoned, resuming once finance/physics/chemistry/biology close out. **Physics (1→61) and chemistry (0→60) hit their rollout-plan targets on 2026-11-17 (step 46-47, final PRs #112 and #114). Biology (0→28) closed out the same day (step 48, final PR #120) — 2 short of its ~30 target by deliberate, documented honest-skip decisions, not an open item.** |
| D23 | **Blanket go-ahead, 2026-11-17: no more per-category approval needed for the remainder of the current roadmap.** User: "as of now [do] not ask me for approval anymore till the whole work is done," repeated explicitly a second time after ecology was flagged as needing its own separate go-ahead per D13/D22. **This supersedes D13's and D22's "separate go-ahead per category" requirement** for ecology, fun/other, tech, the paused step 61 batches (time/creator/text/education), and Wave 5 (insurance/solar/business-tax/crypto) — all may now be scoped and started without stopping to ask, same as physics/chemistry/biology already were. Still applies: write each new category's step file just-in-time before building it (per the working protocol), keep the "more calculators, never fewer" (D17) and honest-skip disciplines, and never deploy to the live domain (that stays the user's own manual action, unaffected by this decision). Re-check with the user if resuming this session's thread much later — "till the whole work is done" scopes this to finishing the current rollout, not a permanent removal of the original approval step. |

---

## Step index

Status values: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED` · `PARKED`

### Phase A — Foundation (correctness; nothing else works until these land) — **COMPLETE** 2026-09-10

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 01 | Domain + `lib/site.ts` | **DONE** 2026-09-10 | Create `lib/site.ts` exporting `SITE_URL`. Replace the hardcoded domain in `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts` and every `generateMetadata`. Add the Cloudflare apex→www redirect rule. | §0, D1 |
| 02 | English-only migration | **DONE** 2026-09-10 | `routing.locales = ['en']`, `localePrefix: 'as-needed'`. Delete `LanguageSwitcher` from `Header`. Update every `generateStaticParams` to drop the locale loop. Add 301s `/en/*` → `/*` in `middleware.ts`. Verify `app/page.tsx` no longer needs its `redirect('/en')`. | D2, D3, D4 |
| 03 | Canonicals on every page | **DONE** 2026-09-10 | `buildCanonical(path)` in `lib/seo.ts`. Apply to **every** `generateMetadata` — including `calculators/[slug]` and `categories/[category]`, which currently have none. Remove the locale-blind canonicals in `about`/`contact`/`privacy-policy`/`terms` and the bare-root one on the homepage. | §2.1, D5 |
| 04 | Sitemap + robots rewrite | **DONE** 2026-09-10 | Add `updatedAt: string` to `CalculatorConfig` and populate all 53. Rewrite `app/sitemap.ts`: one entry per path, no locale loops, real `lastModified`, `priority` 0.8 for calculators / 0.6 home / 0.5 rest. Point `robots.ts` at `SITE_URL`. | §2.4 |

### Phase B — Deep-link ranking (make Google surface the calculator, not the homepage)

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 05 | Calculator schema + alias data | **DONE** 2026-09-10 | Add `aliases: string[]`, `related: string[]`, `redirectFrom?: string[]` to `CalculatorConfig` (required except `redirectFrom`). Populate all 53 from the cluster tables. **Large mechanical edit — do it in 4 sub-batches by cluster, building after each.** | §1.3, §1.5 |
| 06 | `redirectFrom` 301s | **DONE** 2026-09-10 | Generate 301s in `middleware.ts` from every `redirectFrom` slug to its canonical `/calculators/<id>`. Include `auto-loan-calculator`, `home-loan-calculator`, `house-loan-emi-calculator`, `word-counter`, `bmr-calculator`. | §2.5 |
| 07 | Structured data + breadcrumb | **DONE** 2026-09-10 | Add `WebApplication` (with `alternateName: aliases`), `BreadcrumbList` and `HowTo` JSON-LD to `buildPageJsonLd`. Build a **visible** `Breadcrumb` component — Google cross-checks JSON-LD against rendered markup. | §2.3 |
| 08 | Surface the aliases | **DONE** 2026-09-10 | "Also known as …" sentence under the H1. "Related calculators" block using `related`, with **alias anchor text**, not repeated titles. Extend `fuzzyFilter` in `CalculatorSearch.tsx:19` to match `aliases`. | §1.4 |
| 09 | Listing page search + `?q=` | **DONE** 2026-09-10 | Add category filter chips, the search box, and `?q=` / `?category=` params to `app/[locale]/calculators/page.tsx`. Then either fix or delete the broken `SearchAction` in `buildHomeJsonLd`. Also clean the homepage `keywords` array — drop `graphing calculator`. | §2.7, §4.5, §1.6 |

### Phase C — Content depth (pilot, measure, then roll out)

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 10 | New page template + pilot | **DONE** 2026-09-10 | Rebuild the calculator page: breadcrumb → H1 + aliases → **widget above the fold** → How to use → The formula → Worked example → Watch out for → 6-8 FAQs → Related. Add the content fields to `CalculatorConfig`. **Populate for `date-difference-calculator` only.** | §4.2, §4.3, §5.2 |
| 11 | **MEASURE GATE** — no code | **NON-BLOCKING** (D12) | Deploy, request indexing on the pilot page, wait 2-3 weeks. Check Search Console position/impressions for `date-difference-calculator`. **If it does not move, stop and re-diagnose before spending effort on 52 more pages.** | §5.2, §7 |
| 12 | Content rollout: finance + shopping | **SUPERSEDED** by Phase H batches | 13 calculators (finance 8 + shopping 5). Run **after** step 16. | §4.2 |
| 13 | Content rollout: health + measurements | **SUPERSEDED** by Phase H batches | 10 calculators (health 6 + measurements 4). | §4.2 |
| 14 | Content rollout: auto + home | **SUPERSEDED** by Phase H batches | 12 calculators (auto 6 + home 6). | §4.2 |
| 15 | Content rollout: time, travel, work, creator, text, education | **SUPERSEDED** by Phase H batches | 17 calculators (time 5 + travel 4 + work 4 + creator 2 + text 2 + education 1 = 18, **minus `date-difference-calculator`** already done as the step-10 pilot). | §4.2 |

Batches 12-15 sum to **52** = all 53 minus the pilot. Counts are post-restructure (step 16), which
is why 12-15 run after it.

### Phase D — Categories

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 16 | Category restructure 11 → 14 | **DONE** 2026-09-10 | Rename `social`→`creator`. Merge `taxes`→`shopping`. Add `travel`, `text`. (**`math` + `tech` deferred to steps 24 / 25** — they would ship empty; see the session log.) Apply the 9 reassignments (`emi-calculator`→finance, `visa-stay-days`+`travel-budget`+`currency-converter`→travel, counters→text, …). 301 `/categories/taxes`→`/categories/shopping` and `/categories/social`→`/categories/creator`. Calculator URLs do not change. | §1.1, §1.2 |

### Phase E — Country / region layer

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 17 | Compute snapshot tests | **DONE** 2026-10-13 | Pure-function tests over all 53 `compute()` functions. **Must land before step 18** — that refactor changes every calculator's output formatting and is exactly where a silent regression hides. | §4.6 |
| 18 | `lib/regions.ts` + provider | TODO | All 9 profiles with the §3.5 field values. `RegionProvider` mirroring `ThemeProvider`'s cookie-hydration shape. Refactor `lib/calculator.ts` formatters to take a `Region` instead of hardcoded `en-US`/`USD`. | §3.3 s1+s4, §3.5 |
| 19 | Geo detection + switcher | TODO | `cf-ipcountry` read in `middleware.ts`, **only when the cookie is absent**. Country switcher replacing `LanguageSwitcher`. Dismissible suggestion banner — **never a redirect**. | §3.3 s2/s3/s7, §3.4 |
| 20 | Region wave 1: US · GB · IN · AE · AU | TODO | UK stone + **imperial-gallon** MPG (4.546 L — a US-gallon MPG is wrong by 20%). India lakh/crore grouping, CGPA-10, "EMI" wording. **UAE: no personal income tax** — changes the paycheck calculator. AU superannuation + GST. | §3.5 |
| 21 | Region wave 2: EU · TH · ID · CN | TODO | EU profile + DE/FR/ES/IT VAT overrides, comma decimal separator, L/100km, VAT-removal mode on the sales tax calculator. **TH Buddhist-era years** (2026 CE = 2569 BE — a Gregorian-only field gives a silent 543-year error). ID zero decimals. CN YMD dates. | §3.5 |
| 22 | Live FX rates via KV | TODO | Replace the 30 static rates in `CurrencyConverter.tsx:5-11` with a daily KV-cached fetch. Show "Rates updated <date>". If they stay static, say so on the page. | §3.3 s8 |

### Phase F — New calculators (~70 total when done)

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 23 | `bmr-calculator` | TODO | Cheapest win — the formula already exists inside `tdee-calculator`. Mifflin-St Jeor + Harris-Benedict side by side. Cross-link with TDEE. | §5.1 |
| 24 | `math` category | TODO | **Add the `math` entry to `categories` here** (step 16 deferred it — it would have shipped empty). `percentage-calculator` (highest volume of the lot, and the homepage already claims it with no page behind it), `scientific-calculator`, `fraction-calculator`, `average-calculator`, `ratio-calculator`. | §5.1, §1.5 N |
| 25 | `tech` category | TODO | **Add the `tech` entry to `categories` here** (step 16 deferred it — it would have shipped empty). `ip-subnet-calculator`, `iban-calculator`, `data-storage-converter`, `password-strength-checker`. Build for authority, not ad revenue — this audience blocks ads. | §5.1, §5.4, §1.5 O |
| 26 | `text` + `education` additions | TODO | `word-counter`; `grade-calculator`, `final-grade-calculator`, `weighted-average-calculator`, `study-time-calculator`. Takes `education` from 1 member to 5. | §1.2, §1.5 K/M |

### Phase G — Hygiene

| # | Step | Status | Scope | Spec |
|---|---|---|---|---|
| 27 | Repo hygiene | TODO | `.gitignore` + delete `dev-server.log`, `dev-server.err.log`, `tsconfig.tsbuildinfo`. Regenerate the `README.md` calculator list from `data/calculators/`. Fix `mdFiles/memory/project_i18n.md` (it says `proxy.ts` / next-intl 3.26.5; reality is `middleware.ts` / 4.13 / English-only — see session 31, which confirmed `middleware.ts` must stay). | §4.6 |
| 28 | Search Console | TODO | Verify the domain, submit `/sitemap.xml`, request indexing on the top 15 calculators individually, then monitor the metrics table in §7. | §2.8, §7 |
| 29 | IndexNow setup | **DONE** 2026-09-13 | Ran ahead of the queue in response to a Bing Webmaster Tools audit. Key file `public/<key>.txt`, submit script `scripts/indexnow.mjs` (fetches `/sitemap.xml`, POSTs every `<loc>` to `api.indexnow.org/indexnow`), wired into `npm run deploy` and exposed standalone as `npm run indexnow`. No new dependency — uses built-in `fetch`. | — |

---

### Phase H — v2 rollout (plan: `mdFiles/calculator-rollout-plan.md`)

| # | Step | Status | Scope | Plan |
|---|---|---|---|---|
| 17 | (E1) Compute snapshot tests | **DONE** 2026-10-13 | Already in Phase E. **First step of the rollout.** | §2 E1 |
| 30 | (E2) Units v2 | **DONE** 2026-10-13 | Length, area, volume, time, speed, temperature (affine), energy, power, pressure, data, fuel economy (inverse). | §2 E2 |
| 31 | (E3) Solver v2 | **DONE** 2026-10-13 | Numeric solve for variables with no closed form (loan rate) + extra outputs beside the auto field. | §2 E3 |
| 32 | (E4) Result visuals kit | **DONE** 2026-10-13 | RangeBar, Donut, Timeline, AmortizationTable, LogScale (generalized), CompareBars. Hand-rolled SVG. | §2 E4 |
| 33 | (E5) Type-B widget | **DONE** 2026-10-19 | `BreakdownCalculator` replaces `CalculatorForm`. | §2 E5 |
| 34 | (E7) Split data file | **DONE** 2026-10-19 | `data/calculators/<category>.ts`. **Moved before the batches**: every batch editing one 2,000-line file means huge diffs and a conflict with any other open branch. | §2 E7 |
| 35 | Batch 1: finance (8) | **DONE** 2026-10-19 | YMYL. 6 × type A, loan-prepayment type B, paycheck C → B. PR #9. | §3 |
| 36 | Batch 2: shopping + conversion (9) | **DONE** 2026-10-19 | 4 shopping type A (sales-tax, tip, discount, unit-price), cashback B, 4 converters type A. Stone added to `mass`. PR #10. | §3 |
| 37 | Batch 3: health (6) | DONE 2026-10-20 | YMYL. Branch `step/37-batch-3-health`, PR #11. All 6 health calculators on v2. See session log. | §3 |
| 38 | Batch 4: auto + home (12) | **DONE** 2026-10-21 | Branch `step/38-batch-4-auto-home`, PR #13 (ready for review). All 12: car-payment, gas-cost, fuel-cost, ev-charging, commute-cost, toll-cost, concrete, paint, tile, wallpaper, electricity-bill, furniture-fit. See session log. | §3 |
| 39 | Batch 5: time, travel, work, creator, text, education (18) | **DONE** 2026-10-21 | Branch `step/39-batch-5`, PR #14 (ready for review, no longer draft). All 18: date-difference, age, sleep-time, work-hours, pomodoro-timer, travel-budget, visa-stay-days, currency-converter, timezone-meeting-planner, freelancer-rate, meeting-cost, pto, salary-raise, youtube-earnings, instagram-engagement, character-counter, hashtag-counter, gpa-calculator (C → B). See session log. | §3 |
| 40–42 | Wave 1: math · statistics · conversion — **NEW calculators, not conversions of existing ones** | **DONE** 2026-10-29 (math + statistics + conversion runs 1–8; run 9 clothing sizes dropped by the user) — history: math + statistics complete, conversion run 8/~14 done 2026-10-29 | Absorbs step 24 (math). 5 calculators per agent run. Run 1/~6 **DONE** 2026-10-21: added the `math` category (`data/calculators/index.ts`, `data/calculators/math.ts`, `lib/categoryTheme.ts` orange/`function`) plus percentage-calculator (B), percent-change-calculator (A), percent-difference-calculator (B), fraction-calculator (B), ratio-calculator (A). Branch `step/40-wave-1-math-run-1`, PR #15 (ready for review). Run 2/~6 **DONE** 2026-10-21: average-calculator (B), weighted-average-calculator (B, cross-linked with gpa-calculator), rounding-calculator (B), scientific-notation-calculator (B), exponent-calculator (A). Branch `step/40-wave-1-math-run-2`, PR #16 (ready for review). Run 3/~6 **DONE** 2026-10-22: square-root-calculator (A), cube-root-calculator (A, `Math.cbrt` for real negative roots), logarithm-calculator (A, cross-linked with exponent-calculator), factorial-calculator (B, `BigInt` for exact digit counts), gcf-calculator (B, "How many numbers?" count selector). Branch `step/40-wave-1-math-run-3`, PR #17 (ready for review). **Fix 2026-10-22** (pre-merge review of PR #17): `gcf-calculator` had wrongly reused the `fraction-calculator`/`ratio-calculator` `gcd()` helper, whose `|| 1` fallback made `GCF(0, 0, 12)` compute as `1` instead of `12` and `GCF(0, 0)` as `1` instead of the standard `0`. Fixed with a separate `gcdRaw()` (no fallback) for `gcf-calculator` only; `gcd()` and the other two calculators are untouched. 15/~29 math calculators done. Run 4/~6 **DONE** 2026-10-22: lcm-calculator (B, "How many numbers?" selector, `lcm(a,0)=0`/`lcm(0,0)=NaN` convention), prime-factorization-calculator (B, 6 fixed prime/exponent slots, 10¹² cap), long-division-calculator (B, Euclidean nonnegative-remainder convention), quadratic-formula-calculator (B, two simultaneous roots incl. complex), pythagorean-theorem-calculator (A). Branch `step/40-wave-1-math-run-4`, PR #18 (ready for review). **Post-merge-review fix**: `lcm-calculator`'s `(a*b)/gcd` silently overflowed `Number.MAX_SAFE_INTEGER` on large pairwise-coprime inputs (a wrong digit, not a `NaN`) — fixed by dividing before multiplying plus a `Number.isSafeInteger` refusal guard, audited (and where needed, patched the same way) across `gcf-calculator` and `long-division-calculator` too. 20/~29 math calculators done. Run 5/~6 **DONE** 2026-10-22: triangle-calculator (B, mode menu SSS/SAS/ASA sharing one 6-field input set, law of cosines + Heron's formula, SSA deliberately unsupported), circle-calculator (A, radius ⟷ diameter solver with circumference/area as derived outputs — a circle's single degree of freedom doesn't fit 4 mutual solver variables), area-calculator / volume-calculator / surface-area-calculator (all B, a shared shape-mode-menu + `dim1/dim2/dim3` length-input pattern kept in lockstep across the three pages, each with a LogScale visual against cited everyday area/volume benchmarks). Branch `step/40-wave-1-math-run-5`, PR #19 (ready for review). 25/~29 math calculators done. Run 6/~6 **DONE** 2026-10-22 — **the math sub-wave is now complete**: slope-calculator (B, two points → slope/angle/y-intercept/distance; vertical line gives an honest `NaN` slope but a real 90° angle), distance-calculator (B, the distance formula as the Pythagorean theorem applied to two coordinates), midpoint-calculator (B, two points → midpoint, with the equal distance-to-midpoint from each endpoint as a self-check visual), scientific-calculator (type C custom component — `lib/scientificCalc.ts`, a small hand-written recursive-descent expression parser with no `eval`/`new Function`, plus `components/ScientificCalculator.tsx`, the same size class as the existing `pomodoro-timer`/`timezone-meeting-planner` custom tools, so built directly rather than parked as its own step; 30 parser unit tests). Branch `step/40-wave-1-math-run-6`, PR #20 (ready for review). 29/~29 math calculators done — the math category itself is now feature-complete per `calculator-rollout-plan.md` §4. **Post-merge-review fix**: `scientific-calculator`'s trig functions showed floating-point noise (`cos(90)≈6.12e-17`, not `0`) or a huge finite number (`tan(90)`) instead of the mathematically exact answer, since every angle was routed through `Math.PI`, which IEEE 754 can't represent exactly — fixed with exact-value handling at every multiple of 90° in degree mode and a near-zero snap-to-0 (plus a cosine-is-0 → `tan` is `NaN`) in radian mode; also fixed the widget appending onto the literal word "Error" after a failed result. **Statistics sub-wave started 2026-10-22.** Run 1/~5 **DONE** 2026-10-22: added the `statistics` category (`data/calculators/index.ts`, `data/calculators/statistics.ts`, `lib/categoryTheme.ts` purple/`chart` — new icon added to `components/IconTile.tsx`) plus mean-median-mode-calculator (B), standard-deviation-calculator (B, population + sample shown side by side), variance-calculator (B, kept in lockstep with standard-deviation-calculator), z-score-calculator (A, 4-variable solver), percentile-calculator (B, NIST/SEMATECH linear-interpolation "type 6" method, explicitly not the same as Excel's "type 7"). New shared "data list" input helpers (`listCountInput`/`listValueInputs`/`readList`/`listGroups`, `MAX_LIST_SIZE = 10`) at the top of `statistics.ts`, formalizing the count-selector-plus-array-slicing pattern the Parked note predicted this category would need repeatedly. Branch `step/41-wave-1-statistics-run-1`, PR #21 (ready for review). 5/~25 statistics calculators done. **User-approved detour before run 2, 2026-10-22**: built a reusable paste-a-list textarea input (`CalculatorInput.type: 'list'`, `lib/listParse.ts`, `ListFieldRow`) replacing the `listCountInput`/`listValueInputs`/`readList`/`listGroups` stopgap, and retrofitted `mean-median-mode-calculator`, `standard-deviation-calculator`, `variance-calculator`, `percentile-calculator` and `average-calculator` (math) onto it; `weighted-average-calculator` deliberately left as paired boxes. Branch `step/41-list-input`, PR #22 (ready for review). See the Parked list ("No list/array input in the calculator kit", now resolved) and `mdFiles/steps/41-wave-1-statistics.md`'s "List input (between run 1 and run 2)" section for the full design, snapshot-diff explanation and verification. **Run 2/~5 DONE 2026-10-22**: confidence-interval-calculator (B, explicit z-or-t mode selector, t the default), margin-of-error-calculator (B, proportion/Wald method, optional finite population correction, mean-based mode deliberately scoped out — see the step file), sample-size-calculator (B, conservative 50% default proportion, always rounds up), p-value-calculator (B, z-or-t mode, two/left/right-tailed, tiny p-values shown in scientific notation rather than rounded to 0), quartile-calculator (B, list input, reuses percentile-calculator's own `percentileOf` for Q1/Q2/Q3 for cross-page consistency, plus Tukey 1.5×IQR fences). New dependency-free `lib/distributions.ts` (`normalCDF`/`normalInverseCDF` via Abramowitz & Stegun 7.1.26 erf + Peter Acklam's rational inverse; `tCDF`/`tInverseCDF` via the regularized incomplete beta function + Brent's-method root-finding on `lib/solve.ts`'s `findRoot`), unit-tested to ≥6 significant digits against published table values (`lib/distributions.spec.ts`, 26 tests). 10/~25 statistics calculators done, 93 total calculators, 15 categories. Branch `step/41-wave-1-statistics-run-2`, PR #23 (ready for review). **Pre-merge review fix 2026-10-22**: the erf-based `normalCDF` had a fixed ~1.5e-7 *absolute* error, which is the wrong thing to control once the downstream number (a p-value) is routinely smaller than that budget — measured relative error 5e-5 at z=3, 1.6e-3 at z=5, 7% at z=8. Rebuilt `normalCDF`/added `normalSF` on the upper regularized incomplete gamma function (series + Lentz continued fraction, same technique as the existing incomplete-beta code); added `tSF` so the t-distribution's tail is likewise never derived as `1 - tCDF`; `normalInverseCDF` gained a Halley refinement step. `p-value-calculator`'s `compute()` now derives its two tails independently (no subtraction) and floors the result at `1e-300` so an extreme test statistic shows an honest tiny figure, never a literal `0`. `lib/distributions.spec.ts` rewritten to 45 tests against ≤1e-9 *relative* tolerance (including two exact closed-form Student's-t checks, df=1 = Cauchy, df=2 elementary). Only one displayed copy figure actually changed (`p-value-calculator`'s FAQ example at z=5: 5.742e-7 → the corrected 5.733e-7); everything else matches to the digits shown. `npm test` 453/453, lint clean, build passes. Full writeup: `mdFiles/steps/41-wave-1-statistics.md`'s "Pre-merge review fix" note. **Run 3/~5 DONE 2026-10-22**: probability-calculator (B, two independent events, five combinations, independence stated as an assumption not detected), permutation-calculator (B, `BigInt`-exact nPr plus the with-repetition nʳ shown alongside it, same `Number.MAX_SAFE_INTEGER` honesty convention as `factorial-calculator`), combination-calculator (B, `BigInt`-exact nCr via `nPr/r!`, cross-checked against Pascal's identity, plus the with-repetition multiset coefficient C(n+r-1,r)), binomial-distribution-calculator (B, PMF in log space reusing newly-exported `logGamma`, CDF/SF computed directly from the regularized incomplete beta via the standard binomial-beta identity reusing newly-exported `incompleteBeta`, never `1 - CDF`), normal-distribution-calculator (B, reuses `normalCDF`/`normalSF`/`normalInverseCDF` directly, no mode selector needed since every output — P(X<x), P(X>x), z, P(a<X<b), x-at-percentile — is independently computable from the same inputs; P(a<X<b) computed as a same-side tail difference to avoid cancellation). `lib/distributions.ts`'s `logGamma`/`incompleteBeta` exported (previously file-private) for reuse rather than duplicated. 15/~25 statistics calculators done, 98 total calculators. Verified independently in `verify_run3.mjs`, including an exact BigInt-rational reference for the large-n binomial tail (n=1000, p=50%, P(X≥600) ≈ 1.364232078×10⁻¹⁰, matching the shipped incomplete-beta result to 10 significant digits) and a direct comparison of `Number(bigint)` vs. the exact `BigInt` string for two worked examples past `Number.MAX_SAFE_INTEGER` (25P20 and 60C30). `npm test` 458/458, lint clean, build passes (127 static pages). Branch `step/41-wave-1-statistics-run-3`, PR #24. **Pre-merge review fix 2026-10-22 (binomial-distribution-calculator, five bugs)**: `lib/distributions.ts`'s `betacf` (behind `incompleteBeta`) needs ~sqrt(a+b) iterations to converge, and its fixed 200-iteration cap silently returned a wrong CDF/SF past about n=40,000 (at n=1e6, 0.5003881988 instead of the correct 0.50039894; at n=1e9, outright garbage) — fixed with a parameter-scaled iteration budget (capped at 200,000 for runtime safety) and non-convergence now returns `NaN` honestly, protecting `tCDF`/`tSF` too. The PMF's old `logGamma`-difference formula lost digits at huge n (the same cancellation class run 2's `normalCDF` fix addressed) — replaced with Catherine Loader's saddle-point algorithm (`stirlerr`/`bd0`, the same method R's `dbinom` uses), verified to 1e-13–1e-16 relative error against exact `BigInt` arithmetic. A shared tiny-probability floor (built for p-value-calculator, where the answer is never exactly 0) was wrongly turning several mathematically EXACT-zero binomial cases (p=0%/p=100%/k outside 0..n) into a misleading `1e-300` — fixed with a new, binomial-specific floor that passes an exact 0 through unchanged. Non-integer trials/successes (e.g. 10.5) were silently rounded via `Math.round` instead of refused — fixed to check `Number.isInteger` directly. `BINOMIAL_MAX_N` lowered from an unproven 1e9 to a proven 1,000,000 (the largest n this file could verify to ≤1e-9 relative error via the symmetric-midpoint identity `P(X≤n/2)=0.5+pmf/2`, itself independent of `incompleteBeta`), stated honestly on the page rather than claimed past where it was checked. `lib/distributions.spec.ts` gained 5 new `incompleteBeta` tests (now exported); `npm test` 463/463, lint clean, build passes (127 static pages, unchanged — a fix, not a new calculator). Full writeup: `mdFiles/steps/41-wave-1-statistics.md`'s second "Pre-merge review fix" note. **Run 4/~5 DONE 2026-10-23**: correlation-calculator (B, two paired list inputs via a new `pairedListInputs` helper, numerically stable mean-centered `pairedStats` sums, Pearson r/r²/p-value via `tSF`, df=n−2), linear-regression-calculator (B, same paired lists + `pairedStats`, least-squares slope/intercept/r²/standard error of the estimate, an always-present "optional" prediction field), t-test-calculator (B, one-sample and two-sample Welch with Welch–Satterthwaite df, two/left/right tails, the classic pooled equal-variance test deliberately not offered), chi-square-calculator (B, direct χ²+df entry or goodness-of-fit from observed/expected lists, `minExpected` always shown as the task's required "expected < 5" warning, contingency tables explicitly parked), standard-error-calculator (B, SE of the mean from summary stats or a raw list; SE of a proportion scoped out, cross-linked to margin-of-error-calculator's existing `standardErrorPercent` row). New reusable kit mechanism `breakdown.pairedLists` (`data/calculators/types.ts`, `lib/breakdown.ts`, `components/BreakdownCalculator.tsx`): two list inputs whose lengths must match, showing a specific "lengths don't match" message naming both counts (not the generic "fill in every field" one) while `compute()` itself independently guards the same mismatch with an honest `NaN` — resolving the `weighted-average-calculator` Parked blocker ("no length-mismatch guard") without retrofitting it in this run. New `chiSquareSF`/`chiSquareCDF` in `lib/distributions.ts` via the standard `Q_chi2(x,df) = Q_gamma(df/2, x/2)` identity, reusing the file's own `gammaQ` (the engine `normalSF` already uses) rather than a third incomplete-gamma implementation; `gammaQ` itself needed the same fix run 3's `betacf`/`incompleteBeta` got (a fixed 200-iteration cap, now scaled to its own parameters with an honest `NaN` on non-convergence), found and fixed proactively since a goodness-of-fit test can reach a df in the hundreds. Also hardened `normalSF`/`tSF` against a `NaN` statistic (previously an unbounded recursion — `NaN >= 0` is `false`, so the `-z`/`-t` branch would call itself with `NaN` forever instead of terminating), reachable by this run's own zero-variance/zero-standard-error edge cases. **An earlier hand-estimated worked example was wrong** (a mis-added `Sxy`/`Sxx`/`Syy` for the correlation/regression shared example) — caught by this run's own independent verification script before merging and corrected throughout both pages' copy (the `example` line, worked-example rows, result/explanation text, 4 FAQ answers); see the step file's "Verification" section for the real figures and the cross-checks (a numerically independent Simpson's-rule integration for an odd-df chi-square case, an exact even-df closed form for the far-tail χ²=100,df=10 check, a 1e9-shifted-x check proving the mean-centered sums are shift-invariant while the naive one-pass shortcut overflows to `Infinity` on the same data). 20/~25 statistics calculators done, 103 total calculators. `npm test` 471/471 (up from 463), lint clean, `npm run build` passes (132 static pages, up from 127). Branch `step/41-wave-1-statistics-run-4`, PR #25 (ready for review). **Pre-merge review fix 2026-10-23 (four issues on PR #25)**: (1) non-integer sample sizes were silently accepted, the same bug class run 3's binomial fix addressed — `t-test-calculator` with `sampleSize=10.5` computed a plausible-looking but wrong `df=9.5`/`p≈0.3067`; audited every other statistics calculator taking a literal count and fixed the same gap in `confidence-interval-calculator`, `margin-of-error-calculator` (`sampleSize` and a fractional nonzero `populationSize`), `sample-size-calculator` (`populationSize`) and `standard-error-calculator`'s summary mode, via a new shared `requireIntegerAtLeast(value, min)` returning `NaN` for anything not a whole number `>= min`. (2) A perfect fit (`r=1`, `t=Infinity`) showed the `1e-300` underflow floor instead of the true, exact `p-value = 0` in `correlation-calculator` and `t-test-calculator`'s one-sample mode — fixed with a new `floorFiniteTailProbability`, keyed on the test statistic's own finiteness (not value-equality, which is what run 3's `floorNonzeroProbability` uses for binomial's genuinely discrete exact cases — a different, new helper, not a reuse); `tStatistic` still renders as "—" through the kit's existing non-finite convention, now explained in new watch-out items on both pages; `linear-regression-calculator`'s own perfect-fit case (`standardError=0`) was checked and confirmed already correct, no code change needed there. (3) `chi-square-calculator`'s goodness-of-fit mode didn't check observed and expected summed to the same total — entering expected as proportions or percentages made the statistic silently meaningless; fixed by refusing outright (`NaN`) when the two totals differ by more than `TOTALS_RELATIVE_TOLERANCE = 1e-6` relative, and rejecting a negative count outright too; the worked example's `observed` default changed from `[8,12,9,14,7,10]` to `[8,12,10,14,6,10]` (same total, every value even) since the snapshot harness's own 1.5x-scaling-and-rounding of each list independently was shifting the two totals apart on the old odd-valued list, tripping the new (correct) guard on a harness artifact — χ² and the p-value in the copy were recomputed and corrected (χ²=4, p≈0.5494). (4) a `master`-branch hygiene note from the reviewer required no code action on this branch. 11 new permanent tests added to `data/calculators.spec.ts` (one per fix scenario, following the existing `force-calculator solver` describe block's precedent). `npm test` 482/482, lint clean, `npm run build` passes (132 static pages, unchanged — fixes, not new calculators). Full writeup: `mdFiles/steps/41-wave-1-statistics.md`'s "Pre-merge review fix (2026-10-23)" note. **Run 5/5 DONE 2026-10-23 — the statistics sub-wave is now complete (25/25)**: relative-risk-calculator (B, 2x2 exposed/unexposed table, Katz log-method CI), odds-ratio-calculator (B, same 2x2 table, Woolf log-method CI, cross-linked both ways with relative-risk-calculator, the rare-disease-assumption bridge stated on both pages), expected-value-calculator (B, two paired lists via `breakdown.pairedLists`, decimal [0,1] probabilities validated to sum to 1 within a stated tolerance and refused outright — never silently renormalized — when they don't), coefficient-of-variation-calculator (B, list or summary-stats mode, population and sample CV shown side by side per the standard-deviation-calculator precedent, a mean=0 guard, the ratio-scale caveat cited from Wikipedia's own Celsius/Fahrenheit/Kelvin example), outlier-calculator (B, reuses quartile-calculator's own `percentileOf` for Tukey's fences so the two pages can never disagree, adds the actual lowest/highest outlier values plus an always-visible z-score cross-check, explicitly differentiated from quartile-calculator rather than duplicating its content). New shared helpers in `statistics.ts`: `requireNonNegativeInteger`/`twoByTwoStats`/`twoByTwoInputs` (kept relative-risk/odds-ratio in lockstep on one 2x2 table), `EV_PROBABILITY_SUM_TOLERANCE`. Zero-cell policy for the 2x2 pair: the (modified) Haldane-Anscombe correction (+0.5 to all four cells) whenever any one cell is 0 — confirmed as the standard "continuity correction" by a direct fetch of Ades, Caldwell, Anwer & Dias, *Research Synthesis Methods* (2025) — but a genuinely empty row (a+b=0 or c+d=0) still refuses outright, no correction possible. Every number independently verified in `verify_run5.mjs` *before* any code was written; 0 mismatches against the regenerated snapshot. Caught and fixed 3 oversized `seo.title` strings (relative-risk-, expected-value- and coefficient-of-variation-calculator, all originally >60 characters) during the data-integrity check, before committing. 108 total calculators, 16 categories. `npm test` 487/487 (up from 482), lint clean, `npm run build` passes (137 static pages, up from 132). Branch `step/41-wave-1-statistics-run-5`, PR #26. Full writeup, type decisions, dedup/overlap check and verification detail: `mdFiles/steps/41-wave-1-statistics.md`, "Run 5" section. **Statistics is now 25/25 — the whole statistics sub-wave of step 40-42 is complete.** **Conversion sub-wave started 2026-10-25.** Run 1/~13 **DONE** 2026-10-25: the `content.commonValues` kit (type in `data/calculators/types.ts`, pure helpers in new `lib/commonValues.ts`, renderer in new `components/CommonValuesSection.tsx`, wired into the page with a TOC entry and `SECTION_THEME` icon; `feetInches: 'from' | 'to'` per table so a height row can render "5 ft 11 in" without ever rolling over to "12 in", proven by `lib/commonValues.spec.ts`'s sweep test and its real-data walk of every shipped table), an exact-factor audit and fix of all 4 existing converters' `compute()`s (miles-to-kilometers-converter, pounds-to-kilograms-converter and gallons-to-liters-converter were all truncating their factor; fahrenheit-to-celsius-converter was already exact), a `commonValues` retrofit onto those same 4 pages, and 5 new type-A pair converters: centimeters-to-inches-converter, feet-to-meters-converter (US fl oz; UK fl oz in the menu + a watch-out), ounces-to-milliliters-converter, grams-to-ounces-converter (avoirdupois oz; troy oz called out in a watch-out, not offered as a menu unit), mph-to-kph-converter. 113 total calculators, 16 categories (unchanged). `npm test` 524/524 (up from 499), lint clean, `npm run build` passes (142 static pages, up from 137). Branch `step/42-wave-1-conversion-run-1`, PR #28 (ready for review). Full writeup, type decisions and verification detail: `mdFiles/steps/42-wave-1-conversion.md` and the 2026-10-25 session log entry. **Run 2/~13 DONE** 2026-10-25: the 5 general one-dimension converters — `length-converter` (m/km/cm/mm/mi/yd/ft/in/nmi, default m↔ft), `weight-converter` (kg/g/t/lb/oz/st, default kg↔lb), `volume-converter` (m³/L/mL/US+UK gal/qt/pt/cup/fl oz/tbsp/tsp/ft³/yd³/in³, default L↔US gal), `area-converter` (m²/km²/cm²/mm²/ha/mi²/acre/yd²/ft²/in², default m²↔ft²), `speed-converter` (m/s/km/h/mph/kn/ft/s, default m/s↔km/h, exact 3.6 factor) — each page's unit menus already list every unit of that dimension (confirmed by reading `SolverCalculator.tsx`, which builds the menu from `UNITS[variable.dimension]` regardless of `defaultUnit`), so "general" needed no new widget mechanism, just the SEO framing, a sensible default pair and its own `commonValues` table. **Dedupe**: moved the `distance converter` alias off `miles-to-kilometers-converter` onto `length-converter` (replaced with "convert miles to kilometers" to keep ≥4 aliases), `weight converter` off `pounds-to-kilograms-converter` onto `weight-converter`, `volume converter` off `gallons-to-liters-converter` onto `volume-converter`; `area converter`/`speed converter` are new aliases with no prior collision; checked programmatically against every id/alias/`redirectFrom` in the dataset (only the pre-existing, out-of-scope `house loan emi calculator` collision remains). No id collision with the unrelated geometry calculators `area-calculator`/`volume-calculator`/`distance-calculator` (math category — shape area/volume/coordinate distance). **Temperature decision**: no separate general temperature-converter page — `fahrenheit-to-celsius-converter` already offers all 4 `UNITS.temperature` entries (K, °C, °F, °R) in both menus and already holds the "temperature converter" alias; a general page would duplicate it with nothing left to add. **commonValues tables**: each new page's table uses the *opposite* primary direction from any sibling pair-converter already covering the same two units with a distinct value set (e.g. `weight-converter`'s table is kg→lb; `pounds-to-kilograms-converter`'s is lb→kg), so no table duplicates another page's. `speed-converter`'s default pair (m/s↔km/h) deliberately differs from `mph-to-kph-converter`'s (mph↔km/h) since the latter already owns that pair; the m/s→km/h factor is exactly 3.6, stated as such. Every copy figure (example line, worked example, FAQ, commonValues rows, benchmarks, the acre-in-m²/hectare-in-acres/survey-foot-ppm facts) independently recomputed in a scratchpad script (`verify_run2.mjs`, no app imports, plain NIST-constant arithmetic) before committing. Checked programmatically: no duplicate ids, every `related` id exists with no self-reference, every new `seo.title` ≤60 chars (39–46) and `seo.description` ≤160 chars (137–142), 6 FAQs and 5 aliases per new page. 118 total calculators (113 + 5), 16 categories (unchanged). `npm test` 549/549 (up from 524), lint clean, `npm run build` passes (147 static pages, up from 142). Spot-checked all 5 new pages plus `/categories/measurements` on a local dev server (H1, `common-values` section id, table figures matching the script, JSON-LD); killed the server afterward (port 3000 confirmed free). Branch `step/42-wave-1-conversion-run-2`, PR #29 (ready for review). Full writeup: `mdFiles/steps/42-wave-1-conversion.md`, "Run 2" section. **Run 3/~13 DONE** 2026-10-25: 5 more general converters, continuing the same pattern — `time-converter` (s/ms/min/h/days/weeks/months/years, default h↔min, deliberately the one exact pair in the dimension so the lead example carries no rounding caveat; months/years stated honestly as averages — Julian year 365.25 d, month = year/12 — per `lib/units.ts`'s own comment, with a cross-link to `date-difference-calculator` for exact calendar ranges), `pressure-converter` (Pa/kPa/MPa/bar/mbar/psi/atm/mmHg/inHg/Torr, default psi↔bar, tire-pressure example; explains gauge vs. absolute pressure and that mmHg and Torr are nearly but not exactly equal — about 1 part in 7 million apart, confirmed against `lib/units.spec.ts`'s own 1e-5-tolerance `atm→mmHg` test), `energy-converter` (J/kJ/MJ/cal/kcal/Wh/kWh/BTU/ft·lbf, default kJ↔kcal, nutrition-label example; states that `lib/units.ts`'s calorie is the thermochemical one (4.184 J exact) and a food "Calorie" is a kilocalorie, and that its BTU is the International Table BTU, 1,055.05585262 J exact, not the thermochemical or 59°F variants), `power-converter` (W/kW/MW/hp/PS/BTU per h, default kW↔hp, car/motor example; explains mechanical hp — 550 ft·lbf/s — vs. metric PS — 75 kgf·m/s — as two different, each-exact definitions about 1.39% apart), `data-storage-converter` (bit/kbit/Mbit/Gbit/B/KB/MB/GB/TB/PB/KiB/MiB/GiB/TiB, default GB↔MB; explains decimal (1,000ⁿ) vs. binary (1,024ⁿ) prefixes, why a "1 TB" drive shows about 931 GiB in an OS, and bits vs. bytes with a worked 1 Gbps → 125 MB/s example — new reference, NIST's "Prefixes for Binary Multiples" page). **Dedupe**: `time-converter`/`pressure-converter`/`energy-converter`/`power-converter`/`data-storage-converter` were all free ids with no alias collisions, checked programmatically against every `id`/alias/`redirectFrom` in the dataset; `time.ts` (age/work-hours/date-difference/sleep-time/pomodoro) is about dates and timers, not unit conversion, and `physics.ts` has no energy/power/pressure calculator yet (only `force-calculator`), so none of the five dimensions had an existing sibling to collide with or move an alias off of. No unit was missing from `lib/units.ts` for any of the five dimensions, so nothing was added to `UNITS` or `lib/units.spec.ts` this run. Every copy figure independently recomputed in a scratchpad script (`verify_run3.mjs`, no app imports) before committing; it caught one arithmetic slip (power-converter's worked-example explanation first said 134 hp ≈ "136.0 PS", corrected to the real 135.86 PS) before that line was ever committed. Checked programmatically: no duplicate ids, every `related` id exists with no self-reference (only the pre-existing, out-of-scope `house loan emi calculator` alias collision remains), every new `seo.title` ≤60 chars (42–46) and `seo.description` ≤160 chars (143–153), 6 FAQs and 5 aliases per new page. 123 total calculators (118 + 5), 16 categories (unchanged). `npm test` 574/574 (up from 549), lint clean, `npm run build` passes (152 static pages, up from 147). Spot-checked all 5 new pages plus `/categories/measurements` on a local dev server (H1, `common-values` section id, table figures matching the script, JSON-LD); killed the server afterward (port 3000 confirmed free). Branch `step/42-wave-1-conversion-run-3`, PR #30 (ready for review). Full writeup: `mdFiles/steps/42-wave-1-conversion.md`, "Run 3" section. **Run 4/~13 DONE** 2026-10-25: 5 high-volume pairs — `millimeters-to-inches-converter` (default mm→in, drill-bit/fastener-size + fractional-inch table), `milliliters-to-cups-converter` (default mL→cups, US customary cup 236.5882365 mL vs. the 250 mL metric cup), `kilograms-to-stone-converter` (default kg→stone, the first real stone table, body weights shown as "11 st 0 lb" via a new `commonValues.stoneLbs` kit extension — `lib/commonValues.ts`'s `formatStoneLbs`, mirroring `formatFeetInches` exactly, `types.ts`/`CommonValuesSection.tsx` updated, swept-tested so "14 lb" can never print), `acres-to-hectares-converter` (default acre→ha, farmland-size table), `square-feet-to-square-meters-converter` (primary ft²→m², the *opposite* of `area-converter`'s own m²→ft² default, the overlap-rule precedent run 5 repeats). Two alias moves (`'stone to kg converter'` off `pounds-to-kilograms-converter`, `'sq ft to sq m converter'` off `area-converter`, both onto the new specific pages). 128 total calculators, 16 categories (unchanged). `npm test` 603/603, lint clean, `npm run build` passes (157 static pages, up from 152). Branch `step/42-wave-1-conversion-run-4`, PR #31, **merged**. Full writeup: `mdFiles/steps/42-wave-1-conversion.md`, "Run 4" section. **Run 5/~13 DONE** 2026-10-25: 5 more pairs, each the *opposite* primary direction from run 3's matching general page (same overlap-rule precedent as run 4's sq-ft/sq-m page), with its own search-intent-specific `commonValues` table — `horsepower-to-kilowatts-converter` (hp→kW vs. `power-converter`'s kW→hp; car/motor ratings), `bar-to-psi-converter` (bar→psi vs. `pressure-converter`'s psi→bar; tire/espresso-machine/pressure-washer ratings), `kilocalories-to-kilojoules-converter` (kcal→kJ vs. `energy-converter`'s kJ→kcal; food-label figures, deliberately no claim about any country's regulatory daily-reference kJ/kcal rounding), `megabytes-to-gigabytes-converter` (MB→GB vs. `data-storage-converter`'s GB→MB; file/photo/data-plan sizes, repeats the decimal-vs-binary point with one concrete worked figure — 500 MB ≈ 476.84 MiB — rather than the full explanation, cross-linked instead), `mpg-to-l-100km-converter` (mpg (US)→L/100 km, a new dimension with no general-page overlap; both US and UK mpg already existed in `UNITS.fuelEconomy` as `inverse()` reciprocal units, so no unit addition was needed and the calculator itself writes no reciprocal math — `toBase`/`fromBase` already do it). The matching opposite-direction alias was moved off each of the four run-3 general pages onto its new pair page (`power-converter`, `pressure-converter`, `energy-converter`, `data-storage-converter` each drop from 5 to 4 aliases, staying at the ≥4 floor). **Zero/negative-input safety, verified by tracing the actual engine, not assumed**: `toBase(0, 'fuelEconomy', 'mpg')` is already `Infinity` in SI, caught by `lib/solverState.ts`'s own `Number.isFinite` guard before `solve()` ever runs (its existing comment already names this exact case); the other direction (0 L/100 km, finite in SI) is instead caught by `components/SolverCalculator.tsx`'s `converts()`/`answered` check before display, and the `derive`-based visual is gated behind the same `answered` flag — confirmed live with a `solveState()` probe script (0 and negative inputs on either field both resolve to "no answer", never a displayed `Infinity`/`NaN`), so the pair's own `solve` functions use the same plain `>= 0` guard as every other pair converter, no special-case math added. Every copy figure independently verified in `verify_run5.mjs` (no app imports) before committing; caught and fixed two slips first — a wrong-direction/wrong-percentage mental-math FAQ line (psi×0.069→bar is ~0.08% *high*, not low) and an imprecise logScale benchmark (80 kcal rounded to "335 kJ" instead of 334.7 kJ). Checked programmatically: no duplicate ids, every `related` id exists with no self-reference (only the pre-existing, out-of-scope `house loan emi calculator` alias collision remains), every new `seo.title` ≤60 chars (38–56) and `seo.description` ≤160 chars (126–147), 6 FAQs and 5 aliases per new page. 133 total calculators (128 + 5), 16 categories (unchanged). `npm test` 628/628 (up from 603, snapshot diff touches only the 5 new ids), lint clean, `npm run build` passes (162 static pages, up from 157). Spot-checked all 5 new pages plus `/categories/measurements` on a local dev server (H1, `common-values` table with no `Infinity`/`NaN`, JSON-LD); killed the server afterward (port 3000 confirmed free). Branch `step/42-wave-1-conversion-run-5`, PR #32 (ready for review). Full writeup: `mdFiles/steps/42-wave-1-conversion.md`, "Run 5" section. **What run 6 needs to know**: per the step file's "Planned run breakdown", runs 6+ are the *lookup-table* converters — not a single exact factor, so a different shape than every converter so far: cooking cups↔grams by ingredient (a density table, one value per ingredient, each needing its own cited source — flour, sugar, butter, rice etc. all convert differently), shoe size (US/UK/EU, which are offset-based conversions with half-size rounding quirks, not a linear factor), ring size (US/UK/EU/diameter-mm, similarly a lookup), clothing size (US/UK/EU, gendered, categories differ by garment type). None of these fit the `solver`-with-`dimension` pattern `lib/units.ts` provides — each likely needs its own small lookup table (with cited sources per row, per the work order) and probably a type-B breakdown with a `select` input for "which ingredient/size system," a materially different build than runs 1-5. Scope each individually before building (this run did not start any of them); a reasonable first slice for run 6 is just **cooking cups↔grams by ingredient** (flour, sugar, butter, rice, milk — 5 common baking ingredients, each cited to a baking-reference source for its density), since it is the highest-search-volume item in that list and self-contained; shoe/ring/clothing size can follow in their own run(s) once cups↔grams proves out the lookup-table pattern. **Run 6/~13 DONE** 2026-10-26 — the first lookup-table run: `cups-to-grams-converter` (general, type B, an ingredient `<select>` across 12 cited ingredients — flour, granulated/brown/powdered sugar counted separately on the dedicated sugar page, butter, water, milk, uncooked and cooked rice, oats, cocoa powder, honey — each `<option>`'s value IS its grams-per-cup density, so `compute()` is a single multiplication, no lookup needed at runtime) plus four dedicated pages: `cups-to-grams-flour` (120 g/cup, spooned-and-leveled, the scooped-flour trap — up to 25% heavier — as the differentiator), `cups-to-grams-sugar` (granulated 198 g/cup, brown 213 g/cup packed, powdered 113 g/cup unsifted, all three compared in one 4-column table), `cups-to-grams-butter` (226 g/cup = 2×113 g; a sticks-and-tablespoons table, not cup fractions, since US butter is sold and marked in sticks; 4 sticks ≈ 452 g, about 0.35% under the exact 453.59237 g pound), `cups-to-grams-rice` (185 g/cup uncooked; a genuinely counterintuitive, fully-cited watch-out that 1 cup of the *same* rice *cooked* weighs only 158 g per USDA — less, not more, because cooked rice packs less densely into a cup even though the total rice-plus-water system gained weight). **New shared kit pieces**: `lib/ingredients.ts` (`INGREDIENT_DENSITIES`, one typed, cited row per ingredient — King Arthur Baking Company's Ingredient Weight Chart for the baking ingredients, USDA FoodData Central for rice both raw (#169756) and cooked (#168878), milk (#171265) and honey (#169640), each actually fetched, not recalled from memory; bread flour deliberately has no row of its own since King Arthur gives it the identical 120 g/cup as all-purpose flour, which would collide as a duplicate `<select>` value) and `content.referenceTable` (`data/calculators/types.ts`, `components/ReferenceTableSection.tsx`, wired into `page.tsx` and `lib/categoryTheme.ts`'s `SECTION_THEME` parallel to `commonValues`, not touching it) — a generic computed table for pages whose numbers are not a `lib/units.ts` unit factor; every cell is a computed expression (a density × a cup amount, or a `lib/units.ts` mass conversion) at module load, never a typed literal. Every copy figure (61 checks) and every structural rule (0 duplicate ids, 0 new duplicate alias collisions, every `related` id exists with no self-reference, `seo.title`/`seo.description` within budget) verified in two independent scratch scripts before committing — the second one caught `cups-to-grams-flour`'s `seo.description` at 169 characters (over the 160 limit), fixed before committing. 138 total calculators (133 + 5), 16 categories (unchanged). `npm test` 639/639 (up from 628, snapshot diff touches only the 5 new ids), lint clean, `npm run build` passes (167 static pages, up from 162). Spot-checked all 5 new pages plus `/categories/measurements` on a local dev server (H1s, the `reference-table` section id rendering alongside `common-values` on other pages, the ingredient `<select>`'s 12 distinct-value options with flour pre-selected, JSON-LD present); killed the server afterward (port 3000 confirmed free). Branch `step/42-wave-1-conversion-run-6`, PR #33. **Wave 2 dedupe**: row 43–45's food list (`mdFiles/calculator-rollout-plan.md` §4) includes "cups to grams" — it is now delivered by this run; Wave 2 must not rebuild it. **Run 7/~13 DONE** 2026-10-26 — the first offset-based (non-density) lookup-table run: a new `lib/shoeSizes.ts` (UK adult = ISO 19407's unified formula from foot length in mm; US men's = UK + 1; US women's = men's + 1.5 on the "common" retail scale, matching Nike's own published chart exactly at every row checked, vs. an older "standard"/FIA scale of +1; EU = the Paris-point formula, with the EU system's own, smaller last-length allowance kept separate from the UK/US one; children's sizing uses its own formulas and its own last-length allowance, foot×1.08+6 mm per ISO 19407) plus `lib/shoeSizes.spec.ts` (21 tests against Wikipedia's quoted boundary points and Nike's chart). Sources fetched, not recalled: Wikipedia's "Shoe size" article fetched as **raw wikitext** (a first attempt summarizing the rendered page via an AI fetch gave internally inconsistent constants across two passes, so raw wikitext was read directly instead — see the step file) for every UK/US/EU/Mondopoint formula, and Nike's published men's/women's/UK/EU chart as a manufacturer cross-check. **Where sources disagreed, stated on the page rather than silently picked**: the UK/US "standard" offset formula gives US men's = UK + 1, but Nike's own chart shows only a 0.5-size gap at every row checked (US men's 8 = Nike's UK 7.5, not UK 7) — used as a concrete, cited brand-variation watch-out, not a vague "brands vary" claim; two documented US women's scales exist (+1.5 "common" vs. +1 "standard"/FIA) and both are named; no separately published EU/Paris-point formula for children's lasts was found, so the kids' EU figure is flagged as the least-certain number on that page. Four calculators: `shoe-size-converter` (general, type B, a men's/women's/kids' `<select>` keyed by fixed, inherently-distinct category codes 0/1/2 — never a lookup value that could collide, per the run 6 Parked lesson — plus a foot-length input in mm/cm/in, outputting US/UK/EU/Mondopoint and foot length in cm and in), `mens-shoe-size-chart`, `womens-shoe-size-chart`, `kids-shoe-size-chart` (each fixed to one category, with its own common-sizes reference table built by a single-hop computation from one shared foot/last length — a two-hop "invert then re-derive" version was tried first in the verification script and found to occasionally mis-round an exact half-size tie from floating-point noise, so the data file never does that). A dedicated US↔UK pair page and a foot-length-first page were considered and skipped — no distinct audience from the four pages above (every page already shows US/UK/EU/foot-length together). 142 total calculators (138 + 4), 16 categories (unchanged). Every copy figure independently verified in `verify_run7.mjs` before committing — caught and fixed 3 display-rounding slips (womens-shoe-size-chart's worked-example rows showed 5.47/6.47/7.97 instead of the correct 5.46/6.46/7.96) and one unit mismatch (mens-shoe-size-chart's `example` field paired "262 mm" with "10.33 in", two different foot lengths). `calculators.spec.ts` gained `KNOWN_NON_FINITE` entries for the foot-length-0 edge case (below every system's valid range) on all 4 pages, and `kids-shoe-size-chart`'s default foot length was lowered from the originally-drafted 165 mm to 110 mm so the test harness's 1.5×-scaled "typical" set stays inside the kids' valid range (165 mm became the *typical* snapshot instead). `npm test` 664/664 (up from 639, snapshot diff adds only the 4 new ids), lint clean, `npm run build` passes (171 static pages, up from 167). Spot-checked all 4 new pages plus `/categories/measurements` on a local dev server (H1s, every section id incl. `reference-table`, JSON-LD, table figures matching the verification script exactly); killed the server afterward (port 3000 confirmed free). Branch `step/42-wave-1-conversion-run-7`, PR #34. A pre-existing, out-of-scope alias collision (`'house loan emi calculator'` on `mortgage-calculator`/`emi-calculator`) was re-confirmed still present, not fixed. **Pre-merge review fix 2026-10-26 (same PR #34)**: the coordinator's review found the real problem with run 7's first draft — its headline numbers used the ISO 19407 theoretical formula, which sits noticeably below what real shoe brands print (for a US men's 9, it implies a foot about 7.5 mm shorter and an EU size about 1.3 sizes smaller than adidas's own published chart uses for that size — a shopper converting by the formula alone could end up buying a size too small; a watch-out mentioning the gap does not fix a wrong headline number). Rebuilt `lib/shoeSizes.ts` so the headline adult numbers (US men's/women's, UK, EU) are adidas's own published size chart (fetched directly via `sizefit.org/guides/adidas-shoe-size-chart`, explicitly attributed to adidas), which is one exact linear relationship across its whole range — confirmed row by row in the rewritten `lib/shoeSizes.spec.ts` (21 → 49 tests). Nike's own chart (already fetched in the first draft) is kept as a second-brand cross-check, this time compared correctly: **at the same US size label**, not the same raw foot length (the two brands print different foot lengths for the same label — comparing by foot length was the first draft's own mistake, caught while writing the fix's verification script). At the same label, adidas's UK matches Nike's exactly at every size checked, EU within about half a size, and the two brands' real, confirmed disagreement on the US women's offset (adidas +1, Nike's "common" scale +1.5) is now named directly on every page rather than asserted as one fact. Kids' sizing is now a lookup table of adidas's own published toddler/little-kid/big-kid rows (not a formula — the US and UK labels each separately reset partway through, which a formula cannot represent), interpolated by foot length with a reset-safety guard that snaps to the nearer row instead of averaging across a reset. ISO 19407 is kept in the module only as the secondary/theoretical concept each page's formula section explains, never a headline number again. Clarks, REI, New Balance, ASICS, Brannock, Converse, Vans, Zappos, Puma, Skechers, Under Armour, Dick's Sporting Goods, sportsshoes.com, verywellfit.com, Timberland, Hoka, Runrepeat and the Wayback Machine were all attempted and blocked (403/404/unreachable) before adidas's chart (via sizefit.org) was found fetchable — swapped sources rather than retried, per the no-retry-loops rule. All four calculators' content (concept, formula, worked examples, reference tables, watch-outs, FAQs) rewritten to match, every figure re-verified independently (`verify_retail.mjs`, `verify_run7_fix.mjs`) before committing. `npm test` 692/692 (up from 664, snapshot diff touches only the 4 shoe ids), `npm run build` passes (171 static pages, unchanged — a correction, not a new page), lint clean. Spot-checked all 4 pages again on a local dev server; server killed, port 3000 confirmed free. **Run 8 proposed, not built**: ring size (US/UK/EU/inner diameter/circumference, ISO 8653), written into `mdFiles/steps/42-wave-1-conversion.md`'s "Run 8 proposal" section. Full writeup: `mdFiles/steps/42-wave-1-conversion.md`, "Run 7" section and its "Pre-merge review fix" subsection. **Run 8/~14 DONE 2026-10-29** — ring sizes (an officially-defined-standard lookup run, unlike run 7's theory-vs-retail gap): a new `lib/ringSizes.ts` with three cited systems, each cross-checked against a real jeweler's own published chart before any copy was written — EU/ISO 8653:2016 (size = inner circumference, mm, by definition), US/Canada (the North America formula from the 1921 Bureau of Standards circular, `circumference = 2.55 × size + 36.5`, checked against Angara's own published chart within 0.5 mm at every size 3–13), and UK/Ireland/Australia (British Standard 6820:1987's own definition, one full letter = 1.25 mm of circumference, ring size C = exactly 40 mm, checked against Goldsmiths' own published chart: 22 of 26 letters A–Z match exactly, the other 4 off by one half-letter from Goldsmiths' own column-rounding, not a real disagreement). Angara's own US-to-UK conversion column runs about half a letter different from the British-Standard-based figure throughout — a real, documented difference between two real charts (not a theory-vs-reality gap like run 7's shoe sizes), named in a watch-out, with the UK's own Standard used as the primary figure since it is validated almost exactly against a real UK jeweler. **Kit addition**: `BreakdownOutput.labels` (`data/calculators/types.ts`, `lib/breakdown.ts`) — a UK ring letter ("N½") is not a number, and `compute()` can only return numbers, so this adds a fixed value→label lookup an output can carry (mirrors a `CalculatorInput`'s own `options`, but for an output); `compute()` still returns the letter's numeric index so NaN/finite checks are unchanged, and `formatOutput` looks the value up in `labels` for display. No other calculator or output is touched. Two calculators: `ring-size-converter` (general, type B, a raw inner diameter or circumference in mm via a `measureBy` selector — fixed, inherently distinct codes per the run 6 Parked lesson, circumference coded 0 so the snapshot harness's 1.5×-scaled "typical" input leaves the selector unchanged, the same reason `lib/shoeSizes.ts`'s `CATEGORY_CODE.mens` is 0 — outputting US/UK/EU/diameter/circumference, plus a 26-row UK-A–Z reference table) and `us-to-uk-ring-size-chart` (a known US/Canada size in, UK size as the headline via the new `labels` lookup, plus a US-3–13-keyed reference table whose rows are labeled `"US n = UK letter"` since the UK letter can't be a numeric table column). Two candidates ("ring size by circumference", "ring size by diameter") were skipped as near-duplicates of the general page's own `measureBy` selector, and a dedicated EU/ISO chart was skipped since EU/ISO size is already a one-line fact (the circumference itself) fully covered on the general page — all recorded in the step file rather than built. Sources fetched directly, not recalled: Wikipedia's "Ring size" article as **raw wikitext** (same lesson as run 7 — read line by line, not AI-summarized) for ISO 8653:2016, British Standard 6820:1987 and the North America formula; Goldsmiths' and Angara's own published ring-size charts as the two real-jeweler cross-checks; Ken Walker Jewelers' "How Ring Width Affects Sizing" for the wide-band (6 mm+: "a quarter to half size larger"; 7 mm+: "a half-size larger") and finger-swelling-by-time-of-day watch-outs, both quoted directly. brilliance.com (403), jamesallen.com (redirected to a generic page), stuller.com (404), bluenile.com/gemsociety.org (no table in the fetched content) and brilliantearth.com (404) were attempted and swapped rather than retried, per the no-retry-loops rule. Every copy figure independently re-verified in `verify_run8.mjs` (including the Goldsmiths 22/26-exact-match claim and the Angara ≤0.5 mm claim, both re-derived from scratch, not just asserted) before committing. `npm test` 742/742 (up from 692, snapshot diff adds only the 2 new ids — required two new `KNOWN_NON_FINITE` entries, and swapping which `measureBy` option code is 0, found via the typical-input-scaling failure described above), `npm run build` passes (173 static pages, up from 171), lint clean. Spot-checked both new pages plus `/categories/measurements` on a local dev server (H1s, every section id, JSON-LD, and — the one new thing to check — that the UK output row renders the letter "C" and the chart page's headline renders "N½", not a raw number); killed the server afterward (port 3000 confirmed free). Branch `step/42-wave-1-conversion-run-8`, PR #35. A "Run 9 proposal" (clothing sizes, scoped narrowly to systems with a real defined standard — women's dress size, men's collar size — recommending against a generic S/M/L page since no single authority defines it across brands) is written into `mdFiles/steps/42-wave-1-conversion.md`, not built. | §4 |
| 43–45 | Wave 2: construction · food · sports | **DONE** 2026-11-05 | Scoped in `mdFiles/steps/43-45-wave-2-construction-food-sports.md`, which includes the pre-wave competitive scan (Omni + GigaCalculator + calculator.net) added by the 2026-11-02 omni-strategy.md decision. **Dedupe notes**: food's cups↔grams/butter conversions already exist under Measurements → "Volume & Cooking" (step 42 run 6) — food-sector pages are about recipes, not unit conversion; sports' plain running pace already exists in Health (`running-pace-calculator`, step 37) — a sports "race time predictor" (cross-distance) is distinct and not a duplicate. Construction widens the existing `home` category (same id, relabels display to "Home & Construction") rather than a new category; food and sports are new category ids. Order: construction → food → sports, 5-calculator agent batches, one at a time. **Construction batch 1/~4 DONE 2026-11-02**: drywall-calculator, brick-calculator, gravel-calculator, sand-calculator, mortar-calculator (all type-B breakdown, `compareBars` exact-vs-to-buy visual, `home` category unchanged — 11 calculators now). Sources fetched directly: USG's own Sheetrock Installation and Finishing Guide + The Home Depot's drywall buying guide (panel sizes/coverage); Brick Industry Association Technical Notes 10 (6.75 bricks/sq ft for standard modular brick with a ⅜ in. joint, Table 4; ≥5% brick waste, 15–25% mortar waste); QUIKRETE's Mortar Mix (1102) data sheet (37 standard bricks per 80 lb bag); Mulch Pros Landscape Supply's own-scale measured tons-per-cubic-yard by stone/sand type, cross-checked against EarthStone Rock's published range. **Density decision**: gravel/sand density is an editable input (`densityTonsPerCubicYard`, defaults 1.4/1.3) rather than one fixed constant, since the two real supplier sources genuinely disagree by material type/moisture — named rather than silently picked, same precedent as prior shoe/ring-size source disagreements. **Drywall waste decision**: no directly-fetchable primary source states a specific waste percentage (only secondary calculator-site aggregators attribute "10-15%" to the paywalled, never-read GA-216) — the 10% default is stated as common contractor practice, not attributed to a number nobody here actually read, mirroring `tile-calculator`'s existing unattributed 10% convention. 149 total calculators (144 + 5), 16 categories (unchanged). Every worked-example/FAQ figure independently verified in a scratchpad script before committing. `npm test` 759/759 (snapshot diff adds only the 5 new ids), lint clean, `npm run build` passes (177 static pages). A programmatic check caught two `seo.description`s over the 160-char budget (drywall, gravel), fixed before the final commit. Spot-checked all 5 pages + `/categories/home` (11 calculators, correct glyph badges) on a local dev server at desktop width, one phone-width attempt (blocked by a sandbox `resize_window` limitation — see Parked) and one dark-mode pass (clean); killed the server afterward (port 3000 confirmed free). Branch `step/43-wave-2-construction-run-1`, PR #51. Full writeup: `mdFiles/steps/43-wave-2-construction-run-1.md`. **Pre-existing issues noticed, not fixed this run** (see Parked): every `home`-category page's breadcrumb shows a duplicate "Home" (the site-root crumb and the category-title crumb both read "Home"), reproduced on `paint-calculator` too, so not introduced by this run; running `npm run build` (webpack) immediately before `npm run dev` left a stale `.next` that made every `/categories/<id>` page 404 until `.next` was deleted and dev restarted fresh — not a code bug, but worth remembering for the next agent's own visual check. **Construction batch 2/~4 DONE 2026-11-02**: fence-calculator, decking-calculator, roofing-calculator, roof-pitch-calculator, paver-calculator (`home` category now 16 calculators — past `SEARCH_THRESHOLD` 15, so `/categories/home` now shows a search box automatically; no `group` field added, so UX-06's sub-grouped layout doesn't trigger yet). Sources fetched directly: The Home Depot's "How to Build a Fence" (post spacing, panels-plus-two-posts rule); Trex Company's 2022 Decking Installation Guide (board width, gapping, joist spanning); GAF's Timberline HDZ product data sheet (3 bundles/64 pieces per square — independently re-verified by the main session's pre-merge review, matches exactly); the Pythagorean-theorem pitch multiplier `√(1+(rise/12)²)` for sloped-vs-footprint roof area; Wikipedia's "Roof pitch" article + the National Roofing Contractors Association's "Roof slope guidelines" (Professional Roofing, Aug 2018) for the rise/run convention and code-minimum slope; the Interlocking Concrete Pavement Institute's Tech Spec 10 + Oregon State University Extension's paver installation guide (base/bedding sand depth, waste allowance). Cross-linked `gravel-calculator`/`sand-calculator` (batch 1) to `paver-calculator`. 154 total calculators (149 + 5), 16 categories (unchanged). `npm test` 765/765 (759 + a new same-category glyph-uniqueness test added in batch 1's pre-merge review — all 16 `home` glyphs confirmed distinct: `gal ft² yd³ roll fit kWh sht brk grv snd bag fnc dek sq X12 pvr`), lint clean, `npm run build` passes (182 static pages). A programmatic check caught one 161-char `paver-calculator` `seo.description` over budget, fixed before the final commit; also re-confirmed the known pre-existing "house loan emi calculator" alias collision (mortgage-calculator/emi-calculator), parked, not touched. Spot-checked all 5 pages + `/categories/home` (16 calculators) at desktop width and one dark-mode pass. Interrupted by the build agent's session usage limit right after finishing all 5 calculators and before writing this STATUS.md entry — all code was already committed and pushed; the main session finished the docs, independently re-verified the GAF and BIA figures against their actual primary sources (not just trusting the agent's citations), confirmed `npm test`/`npm run build`/lint clean, and merged. Branch `step/43-wave-2-construction-run-2`, PR #52. Full writeup: `mdFiles/steps/43-wave-2-construction-run-2.md`. **Construction batch 3/~4+ DONE 2026-11-04/05**: mulch-calculator, topsoil-calculator, retaining-wall-calculator, board-foot-calculator, ac-tonnage-btu-calculator (`home` now 21 calculators, 159 total on the site). Sources: ENERGY STAR/EPA-DOE room-AC sizing fact sheet, Allan Block installation guide + SiteOne block spec, Virginia Cooperative Extension SPES-661P (mulch depth), USDA Forest Products Lab Wood Handbook Ch. 6 (board-foot/nominal-vs-actual lumber). `npm test` 770/770, lint clean, `npm run build` 187/187 pages, all re-confirmed by the main session before merging PR #54. No per-batch Chrome visual QA run per the new ~50-calculator cadence (see CLAUDE.md); a `curl`-based structural check substituted. Remaining construction candidates: insulation, flooring, carpet, stair, rebar, pool/tank volume, siding, framing/stud. Full writeup: `mdFiles/steps/43-wave-2-construction-run-3.md`. **Construction batch 4/4 DONE 2026-11-04 — Construction fully closed out**: insulation-calculator, stair-calculator, rebar-calculator, pool-volume-calculator, carpet-calculator, flooring-calculator (`home` now 27 calculators, 165 total on the site). Siding and framing/stud parked as too thin/niche, not built. Sources: ENERGY STAR R-value table, IRC R311.7.5 stair rules, 12-in-o.c. rebar convention + retail stick length, NWFA 5% cutting allowance (PDFs read via `curl`+`pdftotext` after WebFetch's summarizer proved unreliable on image-heavy PDFs). Two independent verification passes, including importing the actual shipped `compute()` functions against worked-example inputs (21/21 matched). `npm test` 776/776, lint clean, `npm run build` 193/193 pages, all re-confirmed by the main session in the agent's own isolated git worktree before merging PR #55 — no file-sharing collision with the main session this time. Food is next. Full writeup: `mdFiles/steps/43-wave-2-construction-run-4.md`. **Food opened, run 1/~4 DONE 2026-11-05** (step 46, PR #56): created the `food` category from scratch (`red` theme, `bowl` icon, `data/calculators/food.ts`) with 5 calculators — recipe-scaling, baker's-percentage, pizza-dough, turkey-cook-time (USDA FSIS, YMYL-adjacent), rice-to-water-ratio. 170 total calculators. `npm test` 784/784, lint clean, `npm run build` 199/199 pages. Full writeup: `mdFiles/steps/46-wave-2-food-run-1.md`. **Food run 2/~4 DONE 2026-11-05** (PR #57): turkey-thaw-time, boiled-egg, steak-doneness, party-food, yeast-conversion calculators (`food` now 10 calculators, 175 total on the site). USDA FSIS/FDA cited directly for the YMYL-adjacent turkey-thaw-time and steak-doneness pages. `npm test` 789/789, lint clean, `npm run build` 204/204 pages. Full writeup: `mdFiles/steps/46-wave-2-food-run-2.md`. **Food run 3/3 DONE 2026-11-05 — Food fully closed out** (PR #58): ABV, coffee-ratio, cold-brew-ratio, self-rising-flour-sub, cake-servings, party-drinks, brine calculators (`food` now 17 calculators, 182 total on the site). Popcorn-for-a-party and bread/sourdough parked. `npm test` 796/796, lint clean, `npm run build` 211/211 pages. 38 calculators added since the last visual-QA pass — next Sports batch likely crosses the ~50 threshold. Full writeup: `mdFiles/steps/46-wave-2-food-run-3.md`. **Sports opened, run 1/~3 DONE 2026-11-05** (step 59, PR #59): new `sports` category (`green` theme, `trophy` icon) with one-rep-max (Epley), heart-rate-zones (classic+Tanaka max-HR, 5 zones, Karvonen target combined on one page), vo2-max (Cooper 1968), race-time-predictor (Riegel, confirmed distinct from the existing running-pace-calculator), swim-pace. 187 total calculators. `npm test` 807/807, lint clean, `npm run build` 217/217 pages. Full writeup: `mdFiles/steps/59-wave-2-sports-run-1.md`. **Sports run 2/2 DONE 2026-11-05 — Sports closed out, Wave 2 fully DONE** (PR #60): steps-to-miles, baseball-batting-average, cricket-bowling-figures, cricket-net-run-rate, nfl-passer-rating, elo-rating, golf-course-handicap calculators (`sports` now 12 calculators, 194 total on the site). Winning-percentage and cycling-pace parked. `npm test` 817/817, lint clean, `npm run build` 224/224 pages. **Visual-QA pass now due** — exactly 50 calculators added since the last Chrome visual pass. Full writeup: `mdFiles/steps/59-wave-2-sports-run-2.md`. | §4 |
| UX-01 | Homepage + footer redesign | **DONE** 2026-10-31 | Off the numbered sequence — a UX/visual pass, not SEO/region rollout work. Approved "Option A" hero + category/popular split + "Navy footer" design. Branch `ux/homepage-redesign`, PR #38. See session log. | — |
| UX-02 | Calculator intro card — "How it works" diagram | **DONE** 2026-10-31 | Off the numbered sequence. Replaced the plain grey intro card on v2 calculator pages with an automatic inputs -> output diagram (`lib/howItWorks.ts`, `components/HowItWorksCard.tsx`) plus the description, "Also called" tags and a trust row. Branch `ux/calculator-intro-diagram`, PR #41 (ready for review). See session log. | — |
| UX-03 | Related calculators under the calculator | **DONE** 2026-10-31 | Off the numbered sequence. `RelatedCalculators` moved from the page bottom to directly under the widget + example (both v2 and thin layouts), restyled as a compact card with an "All {category} calculators ›" link; `relatedDescription` string replaced by `relatedAll`. User picked option A of three mockups. | — |
| UX-04 | Calculator glyphs + categories dropdown/phone menu | **DONE** 2026-11-01 | Off the numbered sequence. Part 1: every calculator gets a `glyph` (1–4 char math/unit symbol) + `GlyphBadge` + category tint/ink table. Part 2/3: `lib/navData.ts` slim nav model (keeps `data/calculators`'s full content out of the client bundle), a two-pane "Categories" dropdown in the desktop header (all categories + filter on the left, selected category's calculators on the right), and a phone drill-down sheet with the same data. Header nav simplified to Home / Categories / All calculators / About / Suggest (Contact/Privacy/Terms stay footer-only). Interrupted mid-build by the agent's weekly usage limit; resumed and finished directly by the main session (account changed mid-session, now Sonnet 5) rather than re-spawning an agent. Two real bugs found by the visual check and fixed before commit: `GlyphBadge` colors couldn't switch in dark mode (inline `style.backgroundColor`/`color` always beat the `dark:` class — fixed via CSS custom properties read by two separate classes instead), and the phone sheet + desktop scrim never covered the full screen (`backdrop-blur` on `<header>` makes it a containing block for `fixed` descendants — fixed by portaling both to `document.body`). Branch `ux/categories-menu`, PR #43 (merged). See the step file's "Interrupted and resumed" section and the session log. | — |
| UX-05 | Pages restyle: /calculators · /categories/<id> · About/Contact/Privacy/Terms/Suggestions | **DONE** 2026-11-01 | Off the numbered sequence. Part A: homepage Popular cards + `RelatedCalculators` swapped `IconTile` (category icon) for `GlyphBadge` (the calculator's own glyph) — the inconsistency UX-04 left behind. Part B: `/calculators` rebuilt as the single Apple-style browse page (hero with a derived count, a search box reusing `lib/search.ts`'s `matchesQuery`, every category as its own section of new `GlyphCalculatorCard`s); `/categories` (index) is now a permanent redirect to `/calculators` via a direct entry in `middleware.ts`'s `RENAMED_PATHS`, removed from `app/sitemap.ts`, page file deleted. Part C: the 15 `/categories/<id>` pages restyled (breadcrumb, category header, `GlyphCalculatorCard` grid, a search box only on categories with `count > 15` — today measurements/math/statistics — new `CategoryCalculatorFilter`, and an "Other categories" row); `buildCategoryMetadata` untouched. Part D: About/Contact/Privacy/Terms/Suggestions restyled to the `#F5F5F7` ground + shared `CARD` + text-scale look, copy/metadata untouched; `SuggestionForm` inputs restyled to match `CalculatorSearch`'s field treatment, logic untouched. Branch `ux/pages-restyle`, PR #44 (merged). **Follow-up PR #47 (2026-11-01)**: removed Part C's "Other categories" row — it duplicated the footer's own category list one screen down, and on a 1-calculator category it was visually bigger than the actual content; the Categories dropdown's hover-preview (#46) covers the same cross-category jump too. See the step file and session log. | — |
| UX-06 | Calculator sub-groups within the three large category pages | **DONE** 2026-11-02 | Off the numbered sequence. User asked whether calculators within one category could be grouped by sub-topic. New optional `group?: string` on `CalculatorConfig`; every calculator in `measurements.ts` (40, 11 groups), `math.ts` (29, 5 groups) and `statistics.ts` (25, 4 groups) tagged with a user-approved label — every other category's calculators leave it `undefined`, enforced by a new coverage test. Scope deliberately narrow, per the user: grouping shows **only** inside `/categories/<id>`'s own page (`CategoryCalculatorFilter.tsx`'s unfiltered state renders labeled sections in data-file order instead of one flat grid), never on `/calculators`, the header dropdown, or the phone menu — all three confirmed unaffected (zero lines changed in `CalculatorBrowser.tsx`/`CategoriesMenu.tsx`/`MobileMenu.tsx`). Typing a search query still drops back to one flat matched grid, ungrouped — searching should surface matches regardless of topic. Branch `ux/category-calculator-groups`, PR #48. See the step file ("Interrupted and resumed") and session log. | — |
| UX-07 | Amortization schedule: monthly detail on short/<=12-month terms, per-year expand-to-months on longer ones | **DONE** 2026-11-15 | User-reported 2026-11-15: switching a loan term's unit from years to months (or a short-term calculator like `emi-calculator`, default 12 mo) collapsed the whole schedule into 1-2 yearly rows, losing all monthly detail. Fixed in `lib/amortization.ts` (new `amortizationMonthlySchedule`, `amortizationSchedule` now derives from it, byte-identical output) and `components/visuals/AmortizationTable.tsx` (<=12-month terms show a direct monthly table; >12-month terms keep yearly rows + pagination, each year row now an expandable disclosure to its months). Fixed `mortgage-calculator`, `loan-calculator`, `emi-calculator`, `car-payment-calculator` at once (shared component). `npm test` 1108→1115, lint clean, build 290 pages (unchanged). PR #74, merged. Scope: `mdFiles/steps/ux-07-amortization-monthly-schedule.md`. | — |
| 60 | Wave 5a: Finance / money-hub expansion (pulled forward, see D16) | DONE | 31 calculators in 7 batches of ~5: real estate/affordability, debt, retirement (×2 batches), investment analysis + simple-interest cluster, remaining money-hub items, income-tax solo. Full seed list, dedupe checklist and sourcing requirements in `mdFiles/steps/60-wave-5a-finance-money-hub.md`. `finance` 8 → ~39. **Batch 1 (real estate/affordability, 5) DONE 2026-11-15, PR #75** — `finance` now 13. **Batch 2 (debt, 5) DONE 2026-11-15, branch `step/60-wave-5a-finance-run-2`, PR #92** — `debt-to-income-calculator`, `debt-payoff-calculator` (snowball/avalanche, list inputs), `credit-card-minimum-payment-calculator` (CFPB 2015 report's 1%+interest/$25-floor formula), `balance-transfer-savings-calculator`, `student-loan-calculator` (Standard/Graduated/Extended, cites studentaid.gov's loan servicers incl. the $30k Extended floor and the July 2026 cutoff) — `finance` now 18, new `Debt` group. `npm test` 1128/1128, lint clean, build 300 pages. **Batch 3 (retirement, part 1, 5) DONE 2026-11-16, branch `step/60-wave-5a-finance-run-3`, PR #99** — `retirement-savings-calculator` (monthly-contribution/monthly-compounding model + caveated 4% withdrawal guideline, distinct from `investment-calculator`'s annual model), `401k-employer-match-calculator` (match-formula + "free money left on the table"), `roth-ira-growth-calculator` (after-tax contribution, cites the IRS 2026 IRA limit directly from Notice 2025-67: $7,500, $8,600 with the 50+ catch-up), `traditional-ira-calculator` (identical growth math to Roth, but pre-tax — an assumed tax rate quantifies this year's deduction savings and the tax owed at withdrawal, same $7,500/$8,600 shared IRA limit, deduction phase-out ranges also from Notice 2025-67), `rmd-calculator` (Required Minimum Distribution from the IRS's current Uniform Lifetime Table, IRS Publication 590-B (2025) Appendix B Table III — fetched and transcribed directly, full table ages 72-120+ shown as a `referenceTable`, not approximated). All four retirement pages cross-link each other plus `investment-calculator`/`401k-employer-match-calculator`, correctly anticipating one another (verified at the end — no edits needed). `npm test` 1180/1180, lint clean, `npm run build` 331/331 pages. **`finance` now 23 calculators; site-wide total (grepped top-level `id:` across all 18 category files, not estimated): 301.** **Batch 4 (retirement pt. 2 + goal investing, 5) DONE 2026-11-16, branch `step/60-wave-5a-finance-run-4`, PR #100** — `pension-calculator` (years-of-service × final-salary × multiplier formula, cited to OPM's FERS basic-annuity formula and the Wisconsin Legislative Council's 2017-18 survey of 87 public pension plans for the typical 1.5-2.5% multiplier range — both fetched directly, the OPM page live and the Wisconsin PDF via a tool-result read since `pdftoppm` wasn't available for page-range reads), `social-security-calculator` (simplified AIME/PIA estimate using the SSA's 2026 PIA bend points, $1,286/$7,749 — `ssa.gov` itself 403'd every fetch attempt, including a `web.archive.org` mirror the auto-mode classifier blocked as unauthorized access; resolved by fetching the primary Federal Register notice directly — 90 FR 49047, via its `govinfo.gov` PDF — which carries the SSA's own published bend-point derivation from the 2024 national average wage index), `annuity-calculator` (future value of a payment stream, no lump sum — reuses the existing `growthFactor`/`annuityFactor` helpers already in `finance.ts`, cited to FINRA's annuities page for the accumulation-phase framing), `annuity-payout-calculator` (the reverse — a lump sum's payout over a term, reusing `loanPayment`/`loanPrincipal`/`loanMonths` exactly as `loan-calculator` does, with an explicit "same math as a loan, opposite situation" callout; cross-linked both ways with `annuity-calculator`), `goal-based-investment-calculator` (required monthly contribution for a savings goal, the closed-form algebraic inverse of `investment-calculator`'s own formula, switched to monthly contribution/compounding like `retirement-savings-calculator` — explicitly stated as the differentiator from both). Every worked-example number (including every "% higher/lower" comparison and the solver's closed-form inversions) independently re-verified in a standalone Node scratch script before writing any copy, with explicit invert-checks confirming each closed-form solve round-trips correctly. One dead-code cleanup caught and fixed before committing: `annuity-calculator`'s `payment` variable is `fixed: true`, so a `solve.payment` entry for it was unreachable (`lib/solverState.ts` excludes fixed variables from the solver's rotating set) — removed to match `investment-calculator`/`retirement-savings-calculator`'s own convention of never giving a fixed field a solve entry. `npm test` 1194/1194, lint clean, `npm run build` 332/332 pages. **`finance` now 28 calculators; site-wide total (grepped top-level `id:`/`category:` across all 18 category files, cross-checked against `calculatorOrder`'s length, not estimated): 305.** **Batch 5 (investment analysis + simple-interest cluster, 5) DONE 2026-11-16, branch `step/60-wave-5a-finance-run-5`, PR #101** — `irr-calculator` (Internal Rate of Return from a cash-flow `list` input, reusing `lib/solve.ts`'s `findRoot` for the rate since IRR has no closed form), `npv-calculator` (Net Present Value, closed form, cross-linked both ways with `irr-calculator` as the two sides of the same cash-flow series — NPV at the worked example's own IRR of 17.77% checked directly to come out to $0), `cd-calculator` (maturity from a stated APY, `FV = P × (1 + APY)^(months/12)`, deliberately no contribution field since a real CD has none — differentiates it from `compound-interest-calculator`; early-withdrawal-penalty content cited to CFPB and helpwithmybank.gov/OCC), `simple-interest-calculator` (`I = P × r × t` with the compound-interest contrast computed directly into the copy, not left abstract), `mutual-fund-calculator` (lump sum + monthly contribution with the expense ratio subtracted from the gross return before compounding — the one thing `investment-calculator` doesn't model — with the fee's dollar cost broken out as its own `feeDrag` output). Every worked-example number independently re-verified in a standalone Node scratch script, catching and fixing one invented comparison figure before it was committed. Citations fetched directly: OpenStax *Principles of Finance*/*Contemporary Mathematics*, CFPB/helpwithmybank.gov, SEC Investor.gov. `npm test` 1208/1208 (one new `KNOWN_NON_FINITE` entry), lint clean, `npm run build` green. **`finance` 28 → 33; site-wide total 310** (import-based count via `data/calculators/index.ts`, found to be more reliable than the per-file grep used for earlier batches — the grep had been over-counting `statistics` by one). This batch's agent died from a session rate limit right after committing all 5 calculators, mid-way through this exact documentation update; the main session finished the write-up directly from the agent's own already-complete, uncommitted draft — no content was redone. **Batch 6 (remaining money-hub items, 5) DONE 2026-11-16, branch `step/60-wave-5a-finance-run-6`, PR #102** — `emergency-fund-calculator` (3-6 month range cited to FINRA + CFPB, both fetched directly), `mortgage-amortization-schedule-calculator` (built, not skipped, after confirming a genuine differentiator from `mortgage-calculator`'s own amortization table: a biweekly-vs-monthly payment-frequency comparison, with a CFPB enforcement citation — Nationwide Biweekly — warning against paid third-party biweekly programs), `business-loan-calculator` (same math as `loan-calculator`, SBA 7(a)/504/working-capital content fetched directly from sba.gov), `commission-calculator` (flat vs. tiered/marginal-bracket commission structures, IRS Pub 15 (2026) 22%/37% supplemental-wage withholding and DOL Fact Sheet #20 both cited directly), `college-savings-calculator` (529-style goal built from the College Board's directly-fetched 2025-26 tuition figures — $11,950 public in-state, $45,000 private — and nominal tuition-inflation rates, rather than a typed-in goal; cross-linked to `goal-based-investment-calculator`). `down-payment-savings-calculator` skipped as instructed (already shipped in batch 1, no duplicate built). `finance` 33 → 38, site-wide 310 → 315. `npm test` 1216/1216, lint clean, `npm run build` 315 pages — all green. **Batch 7 (income tax, solo, 1) DONE 2026-11-16, branch `step/60-wave-5a-finance-run-7`, PR #103 — closes out Step 60 completely** — `income-tax-calculator`: US federal-only income tax estimate by filing status (single, married filing jointly, married filing separately, head of household), from either gross income (2026 standard deduction applied) or taxable income entered directly, with effective tax rate and marginal tax rate shown side by side (explicitly addressed in the content as a common point of confusion). Reuses the shared `PAYROLL_2026` bracket table `paycheck-calculator` already cites (IRS Rev. Proc. 2025-32 / Internal Revenue Bulletin 2025-45), extended with a 4th, married-filing-separately entry — verified (standalone script, no app imports) to be identical to single's brackets through the 32% bracket, then exactly half of married-filing-jointly's thresholds for the top two brackets ($384,350 vs. single's $640,600 for the 37% cutoff), cross-checked against a second independent web search before committing. Explicit, repeated disclaimer: federal income tax only (no state/local tax), not tax advice, consult a real tax professional for an actual return — the most YMYL calculator in this wave. Every worked-example number (the $60,000-gross example, the $150,000 comparison in the explanation, both the 2026 standard deduction figures and the MFS-vs-MFJ/single bracket-boundary facts used in the FAQ) independently re-verified in a standalone Node scratch script before committing. `npm test` 1217/1217 (snapshot updated, diff additions-only), lint clean, `npm run build` 347 total routes (`finance` now 39, site-wide 316 calculators). **Step 60 is now fully closed out: `finance` 8 → 39 calculators across all 7 batches, 31 new calculators, site-wide 285 → 316.** Visual-QA spot-check (desktop/dark-mode on `home-affordability-calculator`, `income-tax-calculator`, and one retirement-cluster page) is still pending — not done by any batch agent, noted here for the main session to pick up. | §4.5 (money-hub) |
| UX-10 | Result-set completeness audit, every category (prerequisite for UX-09) | **DONE** 2026-11-15 | User asked 2026-11-15: before building the download feature, make sure every calculator's result set is actually complete (download exports whatever's there — thin result, thin download). Scoped as a full site-wide, count-based audit: 102 of 264 calculators have ≤1 output beyond the headline (chemistry 28, measurements 34, physics 19, math 10, remainder 11). Per-calculator judgment, not blind padding — a pure unit converter (or a custom-component stub like `scientific-calculator`/`currency-converter` that the counting heuristic can't see into) with nothing more to derive gets an explicit "no change needed" note, not a fabricated filler output. Ran as 5 batches by category, chemistry first (highest expected yield). **All 5 batches DONE and merged 2026-11-15 — 23 real additions, 79 "no change needed" calls, all 102 reviewed:** Batch 1 chemistry (28: 8 real / 20 no-change, PRs #76 + #81), batch 2 physics (19: 6 real / 13 no-change, PR #84), batch 3 measurements (34: 4 real / 30 no-change, confirming the step file's own prediction that pair/general converters mostly already expose every alternate figure via the unit menu or `commonValues`), batch 4 math (10: 2 real / 8 no-change), batch 5 remainder — food/sports/text/travel/shopping/statistics/time (11: 3 real / 8 no-change, branch `ux/result-sets-remainder`). Batch 5's 3 real additions: `recipe-scaling-calculator`→`scalingFactor`, `race-time-predictor-calculator`→`knownPace` (paired with its existing `targetPace`), `steps-to-miles-calculator`→`stepsPerMile`. Batch 5 also confirmed 5 of its 11 flagged ids (`currency-converter`, `character-counter`, `hashtag-counter`, `pomodoro-timer`, `timezone-meeting-planner`) were false positives of the audit's counting heuristic — custom-component stubs with `inputs: []`/`compute() { return {}; }`, not solve-for-a-value pages at all, same as `scientific-calculator` in the math batch. `npm test` 1123/1123, lint clean, build 295/295 pages for batch 5 (no new pages — these are output additions on existing calculators). Full per-calculator reasoning for every batch in `mdFiles/steps/ux-10-result-set-completeness.md`. UX-09's download/export feature (already shipped, see its own row) now sits on top of these completed result sets. | — |
| UX-11 | Widget layout: calculator and result as independent boxes, side by side | **DONE** 2026-11-15 | Built live in a local dev server with the user watching and redirecting at each step (full history in the step file). Final shape: two independent `ELEVATED_CARD`-wrapped boxes at a 1fr:1fr ratio — left column (inputs → Share/Copy/Reset → HowItWorksCard), right column (result/chart/schedule → TableOfContents) — each column's height is genuinely independent via new `belowInputs`/`belowResult` props on `SolverCalculator`/`BreakdownCalculator`, so "How it works" sits right under a short calculator even while a taller result (chart/amortization schedule) is still running, instead of both being pinned to a row below whichever side is taller. The 6 hand-built (type C) widgets (scientific-calculator, currency-converter, etc.) are unaffected — still one box with the old row-below treatment, gated behind a new `isCustomWidget` check in `page.tsx`. Also slimmed `FieldRow` padding and the calculator page header (icon size, gaps). `npm test` 1123/1123, lint clean, build passes. Branch `ux/widget-side-layout`, not yet merged. Full design + the layout-comparison canvas (`https://claude.ai/artifact/U6vGKxx3zsM32e1Mk2VXRB`) in `mdFiles/steps/ux-11-widget-side-by-side-layout.md`. | — |
| UX-08 | Sub-group every category (not just math/statistics/measurements) + mirror in the Categories dropdown | **DONE** 2026-11-15 | User asked 2026-11-15 to extend UX-06's grouping to every category, no exceptions (even 1-2-calculator ones), and to make `CategoriesMenu.tsx`'s dropdown right pane show the same grouped sections. ~165 calculators across 15 category files need tagging, batched largest-first (chemistry+physics, home+food, sports+finance, work+shopping+health+auto, time+travel+text+creator+education). Full scope in `mdFiles/steps/ux-08-category-groups-everywhere.md`. **Batch 1 (dropdown code + chemistry + physics) DONE 2026-11-15, PR #83 merged** (branch `ux/category-groups-batch1`): extracted `CategoryCalculatorFilter.tsx`'s `buildGroups()` into shared `lib/groupCalculators.ts` (pure extraction, no behavior change — verified render for measurements/math/statistics unchanged); added `group?: string` to `lib/navData.ts`'s `NavCalculator`, populated in `buildNavData()`; `CategoriesMenu.tsx`'s right pane now renders the same labeled sections as the category page once every calculator in the selected category has a `group`, flat grid otherwise, cross-category search results unaffected (still one flat list). Tagged `chemistry` (45/45, 13 groups: Moles & Molar Mass 5, Concentration Units 6, Dilutions & Solution Properties 4, Gas Laws 3, Acid-Base Chemistry 5, Reaction Stoichiometry & Yield 4, Chemical Kinetics 4, Equilibrium & Thermodynamics 3, Atomic & Molecular Structure 3, Spectroscopy 1, Colligative Properties 3, Redox & Electrochemistry 2, Thermochemistry 2) and `physics` (21/21, 6 groups: Motion & Forces 5, Energy & Work 4, Fluids & Matter 2, Electricity & Circuits 5, Waves & Light 3, Thermal & Nuclear 2); both added to `categories.spec.ts`'s `GROUPED_CATEGORIES`. `npm test` 1123/1123, lint clean, `npm run build` 295/295 pages. Manually verified in a dev server (category pages + Categories dropdown, both grouped categories and the still-flat `finance`, plus the dropdown's cross-category search staying flat). Pre-existing, unrelated issue noticed but left alone: `npx tsc --noEmit` has 13 errors in `data/calculators.spec.ts`/`lib/breakdown.spec.ts` (compute() arg count) that exist on master too (confirmed via `git stash`). The worktree this PR's own `npm run lint` run noticed (from the concurrently-running UX-10 physics agent) was cleaned up by the main session once that agent's PR #84 merged. **Batch 2 (`home` + `food`) DONE 2026-11-15, PR #85 merged** (branch `ux/category-groups-batch2`): tagged `home` (27/27, 8 groups: Walls & Paint 3, Flooring & Tiling 3, Concrete & Masonry 5, Landscaping Materials 5, Outdoor Structures 3, Roofing 2, HVAC & Energy 3, Carpentry & Layout 3) and `food` (17/17, 5 groups: Baking & Cakes 6, Meat & Poultry 4, Eggs & Grains 2, Drinks & Brewing 3, Party Planning 2) — actual counts came in lower than the step file's ~35/~27 estimates, no code changes needed (batch 1's dropdown/helper work already generic). Both added to `categories.spec.ts`'s `GROUPED_CATEGORIES`. `npm test` 1123/1123, lint clean on every file this batch touched (repo-wide `npm run lint` also flagged 144 pre-existing errors from a concurrently-running agent's `.claude/worktrees/*` dirs — unrelated, confirmed clean with `.claude/**` excluded), `npm run build` 295/295 pages. Manually verified in a dev server + Chrome extension: `/categories/home` and `/categories/food` show the exact labeled sections/counts above; the Categories dropdown mirrors both; the dropdown's still-ungrouped `finance` row stays a flat grid; dropdown search stays one flat list. Re-confirmed the pre-existing `/categories/home` breadcrumb duplicate-key issue (already in Parked, from the original 2026-11-02 construction build) — not reintroduced by this batch, `/categories/food` has no such error. **Batch 3 (`sports` + `finance`) DONE 2026-11-15, PR #87** (branch `ux/category-groups-batch3`): tagged `sports` (12/12, 4 groups: Strength & Fitness Testing 3, Pace & Distance 3, Baseball & Cricket Stats 3, Ratings & Scoring 3) and `finance` (13/13, 4 groups: Mortgages & Loans 5, Home Buying 4, Savings & Growth 3, Income & Pay 1 — includes the 5 Wave 5a calculators added since batch 1's count was written); both added to `categories.spec.ts`'s `GROUPED_CATEGORIES`. **Found and fixed a real bug this batch exposed**: `categories/[category]/page.tsx` gated the grouped-sections view behind a calculator-count threshold (`SEARCH_THRESHOLD = 15`) with no awareness of `group` — every category grouped so far happened to exceed it, so a fully-tagged but small category (`sports` 12, `finance` 13) would have silently kept rendering a flat grid. Fixed by widening the condition to also trigger whenever `buildGroups()` succeeds, regardless of size — needed by batches 4-5 too, several of which go down to 1-2 calculators. `npm test` 1123/1123, lint clean, `npm run build` 295/295 pages. Manually verified in a dev server and in Chrome (screenshots): both category pages show labeled sections with correct counts, the Categories dropdown mirrors the same sections for both (dropdown defaults to Finance), an ungrouped category (`auto`) still shows a flat grid in both places, and the dropdown's cross-category search stays one flat list. **Batch 4 (`work` + `shopping` + `health` + `auto`) DONE 2026-11-15, PR #89** (branch `ux/category-groups-batch4`): all four categories came in at exactly the step file's estimates (4, 5, 6, 6 — small enough that `auto`, used as batch 3's "still ungrouped" sanity check, is now grouped too). Tagged `work` (4/4, 2 groups: Pay & Rates 2, Time & Benefits 2), `shopping` (5/5, 3 groups: Taxes & Tips 2, Discounts & Rewards 2, Price Comparison 1), `health` (6/6, 3 groups: Body & Nutrition 4, Fitness Performance 1, Pregnancy 1), `auto` (6/6, 3 groups: Financing 1, Fuel & Energy Costs 3, Commuting Costs 2); all four added to `categories.spec.ts`'s `GROUPED_CATEGORIES`. No component code changes needed (batch 1's dropdown/helper work already generic — confirmed again by this batch's small-category cases exercising batch 3's threshold fix). `npm test` 1123/1123, lint clean, `npm run build` 295/295 pages. Manually verified with the Chrome extension: all 4 category pages show labeled sections with correct group/count; the Categories dropdown mirrors the same grouped sections for all 4; `time` (still ungrouped, batch 5) stays a flat grid in the dropdown; dropdown cross-category search stays one flat list. **Batch 5 (`time` + `travel` + `text` + `creator` + `education`) DONE 2026-11-15, PR #91** (branch `ux/category-groups-batch5`), **closing out UX-08**: tagged `time` (5/5, 3 groups: Ages & Dates 2 — age-calculator, date-difference-calculator; Work & Focus 2 — work-hours-calculator, pomodoro-timer; Sleep 1 — sleep-time-calculator), `travel` (4/4, 2 groups: Trip Planning 2 — travel-budget-calculator, visa-stay-days-calculator; Currency & Time Zones 2 — currency-converter, timezone-meeting-planner), `text` (2/2, 1 group: Social Media Text Tools 2 — character-counter, hashtag-counter), `creator` (2/2, 1 group: Monetization & Engagement 2 — youtube-earnings-calculator, instagram-engagement-calculator), `education` (1/1, 1 group: Grades & GPA 1 — gpa-calculator) — per the step file's "no exceptions" rule, the three 1-2-calculator categories each got one group covering every calculator rather than being skipped. All five added to `categories.spec.ts`'s `GROUPED_CATEGORIES`, completing the set. No component code changes needed — batch 1's dropdown/helper work and batch 3's size-threshold fix were already generic and sufficient. `npm test` 1123/1123, lint clean, `npm run build` 295/295 pages. Manually verified both in a dev server (curl, matching on the server-rendered `<!-- -->`-separated text nodes React emits between the label and count) and interactively in the Chrome extension: all 5 category pages and all 5 dropdown rows show the exact labeled sections/counts above, and the dropdown's cross-category search (typing "time") stays one flat, ungrouped list across every category.

**UX-08 is now DONE in full.** Final group count across every category on the site (18 total, all in `categories.spec.ts`'s `GROUPED_CATEGORIES`): measurements 40/40 (11 groups, UX-06), math 29/29 (5 groups, UX-06), statistics 25/25 (4 groups, UX-06), chemistry 45/45 (13), physics 21/21 (6), home 27/27 (8), food 17/17 (5), sports 12/12 (4), finance 13/13 (4), work 4/4 (2), shopping 5/5 (3), health 6/6 (3), auto 6/6 (3), time 5/5 (3), travel 4/4 (2), text 2/2 (1), creator 2/2 (1), education 1/1 (1). Every calculator on the site (264) now belongs to a labeled sub-group on its own `/categories/<id>` page and in the Categories dropdown's right pane; cross-category search stays one flat list throughout, by design. | — |
| UX-12 | Download/export on the 6 custom (type C) widgets | **DONE** 2026-11-15 | UX-09's download control lives in the shared `WidgetActions` component that only `SolverCalculator`/`BreakdownCalculator` render — the 6 hand-built widgets never adopted that shell. Exported `DownloadMenu` standalone from `CalculatorWidget.tsx` and wired it (download only — no Share/Copy/Reset, out of scope) into 4 of 5 applicable components: `CurrencyConverter`, `TextToolsCalculator` (character + hashtag modes), `ScientificCalculator`, `TimeZonePlanner` (the first text-only `ExportTable`: Zone/Local time/Status — `ExportTable.rows` widened from `number[][]` to `(number|string)[][]` to allow it). `PomodoroTimer` deliberately left untouched — a running timer has no exportable result. Build agent (Sonnet) implemented all 5 and opened the PR, then hit a session rate limit mid-way through its own manual verification (never tested `currency-converter` or any Excel export). Main session finished verification and found two real bugs exposed by `TimeZonePlanner` being the first all-text table: the Excel Schedule sheet's subtitle always said "Amounts in USD" even with no currency column, and text columns were right-aligned in both Excel and PDF schedule tables (both fixed — hard-coded for financial-only tables until now). Separately, user feedback on the *existing* UX-09 mortgage-calculator schedule PDF ("i dont want anything like a table spread over the whole page") led to sizing the PDF schedule table to its columns' actual needs (capped, centered) instead of the Opus spec's "full content width" recommendation — the user's preference overrides it. `npm test` 1123/1123, lint clean, `npx tsc --noEmit` clean, build passes (295 pages). Branch `ux/custom-widget-downloads`, PR #82. Full detail in `mdFiles/steps/ux-12-custom-widget-downloads.md`. | — |
| UX-13 | Direct search from the header, on every page | **DONE** 2026-11-15 | User asked: no quick way to search for a calculator from wherever you already are — today search only lives inside the Categories dropdown or on `/calculators`. New `components/SearchOverlay.tsx`: a centered modal (not anchored under the header like the Categories panel — reads as a dedicated "jump to anything" tool), portaled to `document.body`, autofocused input, live results (reusing `matchesQuery`/`NavData` — the same plumbing every other search surface already shares, a fourth entry point, not a new matching implementation), Enter jumps to the top match, Escape closes, a considered entrance transition rather than a flat on/off. Wired into `components/Header.tsx`: a search icon in both the desktop nav and the mobile row, plus a document-level `/` keyboard shortcut guarded against `INPUT`/`TEXTAREA`/`SELECT`/`isContentEditable` focus (so a calculator's own number inputs keep their slashes) and against re-triggering while already open. Build agent (Sonnet) implemented all of it correctly across 2 commits, then hit a session rate limit mid-way through its own verification. Main session finished verification: `npm test` 1123/1123, lint clean, `npm run build` 295/295 pages, plus a direct code read of the `/` guard logic (confirmed correct) — **live interactive click-through (icon click, `/` shortcut, the guard inside an actual calculator input, Escape, Enter) still worth doing once a browser session is available**, not done here since the Chrome extension wasn't connected at the time. Branch `ux/header-search`, PR #93. Full detail in `mdFiles/steps/ux-13-header-search.md`. | — |
| 61 | Deepen every category under 10 calculators to ≥10 | IN PROGRESS 2026-11-16 | User asked: for every category with fewer than 10 calculators, plan real additions to bring each to at least 10 (more is fine). 9 categories qualify: `auto` (6), `creator` (2), `education` (1), `health` (6), `shopping` (5), `text` (2), `time` (5), `travel` (4), `work` (4) — 41 today, ~98 once each reaches 10 (57 new pages planned across 9 batches, one category per batch). Full per-category seed list, rationale, and citation requirements in `mdFiles/steps/61-deepen-small-categories.md`. Same "more calculators, never fewer" discipline as D17 — and the same honesty discipline as UX-10: a category landing just under 10 with one idea explicitly skipped as too thin/uncitable is fine, padding with a fabricated page is not. **Batch 1 (`auto`, 6 → 10) DONE 2026-11-16, PR #94 merged** (branch `step/61-deepen-auto`): added `parking-cost-calculator`, `tire-size-calculator`, `car-depreciation-calculator`, `lease-vs-buy-calculator`. **`gas-mileage-comparison-calculator` skipped**: the existing `fuel-cost-calculator` already compares annual fuel cost between two vehicles' mpg at one shared fuel price with an `annualSavings` output — a near-duplicate, not a genuinely distinct page, caught by reading that calculator first per the step file's own instruction. `car-depreciation-calculator` cites Experian (citing Carfax, ~20% year-1/~60% 5-year) and iSeeCars' 2026 study (41.8% average 5-year, by segment) and is explicit in `watchOut` that the two real sources disagree with each other and with this calculator's own 20%/15% rule-of-thumb model — not papered over. `lease-vs-buy-calculator` uses the Federal Reserve's actual lease-cost formula (depreciation fee + rent charge from money factor × (adjusted cap cost + residual value), verified by directly fetching `federalreserve.gov`) plus the industry-standard money-factor-×-2400-APR shortcut (Capital One), crediting the buyer with resale-value-minus-remaining-loan-balance equity over the same comparison period as the lease. `tire-size-calculator`'s sidewall-code definition is from Michelin (fetched directly); the speedometer-error physics has no fetchable NHTSA page (nhtsa.gov returned 403 to the fetch tool every time), so that claim is sourced to Wikipedia's "Plus sizing" article instead, consistent with the rest of the site's practice of citing Wikipedia as a background source when nothing more primary is fetchable. Every worked-example number re-verified in a standalone Node scratch script (no app imports) before writing any copy; two edge-case divide-by-zero outputs added to `calculators.spec.ts`'s `KNOWN_NON_FINITE` (parking's break-even visits with a $0 per-visit rate, depreciation's percent-lost with a $0 purchase price), matching existing precedent. `npm test` 1132/1132, lint clean, `npm run build` 304/304 pages. `auto` is now 10/10. **Batch 2 (`work`, 4 → 10) DONE 2026-11-16, PR #95** (branch `step/61-deepen-work`) — `overtime-pay-calculator` (auto-split weekly total at an FLSA threshold + double-time tier, explicitly distinguished from `work-hours-calculator`), `severance-pay-calculator` (weeks-per-year-of-service, DOL-cited "not required" framing + WARN Act notice-vs-severance distinction), `cost-of-living-comparison-calculator` (C2ER index-ratio methodology, BLS CPI FAQ cited for why CPI itself can't do this), `remote-work-savings-calculator` (reuses `commute-cost-calculator`'s exact per-day cost model per the task's instruction, adds a Census-cited time-saved figure), `job-offer-comparison-calculator` (base+bonus+benefits total-comp side by side, BLS ECEC ~30%-benefits-share cited as context only, not as a derivation formula), `paid-sick-leave-accrual-calculator` (1-hour-per-30-hours-worked standard, CA DIR + DOL EO 13706 cited, explicitly distinguished from the fixed-grant `pto-calculator`) — none skipped, `work` now 10/10. `npm test` 1137/1137, lint clean, build green. **Batch 3 (`health`, 6 → 11) DONE 2026-11-16, PR #96 merged** (branch `step/61-deepen-health`): added `body-fat-percentage-calculator` (US Navy/Hodgdon-Beckett circumference method, 1984 — ACE percent-body-fat categories for the result band), `ideal-weight-calculator` (Devine 1974 and Robinson 1983 formulas shown side by side, explicitly framed as two of several estimate methods rather than a target), `macro-calculator` (protein/fat/carb grams from a calorie target via the Atwater 4/4/9 kcal/g factors, carbohydrate as the remainder — pairs with the existing `calorie-calculator`/`tdee-calculator` without duplicating their BMR math), `waist-to-hip-ratio-calculator` (WHO 2008 expert-consultation cutoffs, 0.90 men/0.85 women, independently corroborated by the AHA/NHLBI 2005 metabolic-syndrome statement), `blood-alcohol-content-calculator` (Widmark formula, NIAAA's 14 g standard drink) — all 5 of the batch's planned calculators shipped, none skipped. Dedupe-checked every new id/alias against the whole site (not just `health.ts`) before writing anything — no collision with `sports`' `heart-rate-zones-calculator` or any other existing page. The BAC calculator carries the step's required prominent, specific disclaimer (never use the estimate to decide whether it's safe to drive — call a cab or rideshare instead), repeated in `concept`, `formula.note`, every relevant `watchOut` item and the top FAQ entry. Every cited figure was fetched from a real source directly — WHO/NIAAA/FAO/Health-Canada government pages, NHRC-derived circumference formulas cross-confirmed via two PMC articles, Devine/Robinson formulas confirmed via a PMC commentary (PMC8646317) after an initial citation turned out to be an unverified guessed PMID, caught and fixed before committing. This batch's agent was rate-limited mid-rebase with all 5 calculators already committed; the main session finished the rebase, re-verified `npm test`/lint/build, and merged — no content was redone. `health` is now 11/11. **Batch 4 (`shopping`, 5 → 10) DONE 2026-11-16, PR #97** (branch `step/61-deepen-shopping`) — `warehouse-club-membership-breakeven-calculator` (solver: annual fee ÷ savings per trip, Costco Executive/Gold Star and Sam's Club fees fetched directly from costco.com and samsclub.com), `grocery-budget-calculator` (USDA Food Plans October 2026 report, Thrifty/Low-Cost/Moderate-Cost/Liberal tiers fetched directly from the primary PDF, scaled by household size using USDA's own published size-adjustment percentages; the gap between this calculator's weekly×52÷12 monthly estimate and USDA's own independently-rounded monthly figure, up to about $0.40, is disclosed in `formula.note` rather than hidden), `loyalty-points-value-calculator` (points × cents-per-point, Chase Ultimate Rewards' flat 1-cent cash-back rate and American Express's 0.6-1 cent Pay-with-Points/Cover-Your-Charges range fetched directly from chase.com and americanexpress.com to show the rate genuinely varies by redemption, not just by program), `layaway-payment-calculator` (installment schedule cited against Burlington's own published layaway policy — 20%-or-$10 down payment, $5 service fee, 30-day hold, $10 cancellation fee, fetched directly from burlington.com), `free-shipping-threshold-calculator` (whether padding a cart to a free-shipping minimum beats paying the fee outright, modeled on what the added item is actually worth to the shopper vs. its price — no external citation needed, same as `tip-calculator`/`unit-price-calculator`'s pure-arithmetic pages). None skipped; all 5 built as scoped. Two government source URLs (fna.usda.gov PDF, fns.usda.gov overview page) return 403/404 to automated fetchers but were confirmed reachable and were read via a text-extraction proxy, same precedent as batch 1's nhtsa.gov citation. `shopping` now 10/10. **Site-wide calculator count confirmed 290** (counted directly per-category-file after merging, not estimated) — this batch's own in-worktree build had reported 284, a stale branch-point artifact from branching before batches 1/3 had merged into its view of master. `npm test` 1154/1154, lint clean, `npm run build` 290/290 pages — all re-confirmed green by the main session after merging; the snapshot's 3-way merge conflict (both this batch and batch 3 added entries) was resolved by regenerating it fresh via `npm run test:update` against the final merged calculator files, rather than hand-editing JSON. **Batch 5 (`travel`, 4 → 10) DONE 2026-11-16** (branch `step/61-deepen-travel`, built in an isolated git worktree branched before batch 4 merged, then merged forward with `origin/master` -- including batch 4's `shopping` additions -- before finishing): added `jet-lag-calculator` (CDC Yellow Book "Jet Lag Disorder" cited adaptation rates -- 1 hr/day eastward, 1.5 hrs/day westward -- fetched directly, with the pre-shift and <2-day-trip guidance also quoted verbatim from the same page), `luggage-fee-calculator` (generic overweight/oversize fee model over a user-entered airline fee schedule, Delta's own published domestic baggage-fee page used as the directly-fetched, cited worked example -- not assumed to generalize to other airlines), `daylight-hours-calculator` (the standard solar-declination-approximation + sunrise-hour-angle formula, both confirmed directly from Wikipedia's "Position of the Sun" and "Sunrise equation" articles, handles polar day/night correctly), `travel-points-value-calculator` (the reverse of shopping's `loyalty-points-value-calculator` -- works backward from a specific redemption's cash price, points used and cash co-pay to the realized cents-per-point rate, rather than multiplying a known rate forward; now that `loyalty-points-value-calculator` is confirmed merged, it is cross-linked by name in prose, same as the step file asked, rather than added to `related` after the fact), `points-vs-cash-flight-calculator` (dollar-equivalent comparison of a flight's cash price vs. its points price at the user's own assumed point value, plus the exact breakeven rate), `tipping-abroad-calculator` (lookup-style, resistor-color-code pattern, over a new `lib/tippingNorms.ts` + spec -- deliberately only 5 countries: US, Japan, UK, France, Australia, each confirmed directly from a government page, national tourism board, or (US only) a recognized etiquette authority; every other country considered was left out rather than guessed at, per the step's own discipline). All 6 of the batch's planned calculators shipped, none skipped. The Points Guy's November 2026 monthly valuations page and Delta's SkyMiles award-travel terms (the real $11.20 US domestic minimum tax/fee figure) were both fetched directly and used in both points calculators. Every worked-example and FAQ number re-verified in standalone Node scratch scripts (no app imports), including the full declination/hour-angle arithmetic for 4 latitude/date cases (equator, NYC solstices/equinox, and an above-the-Arctic-Circle polar-day/polar-night check). `travel` is now 10/10. **Site-wide calculator count 296** (counted directly per-category-file on this branch after merging batch 4's `shopping` forward: auto 10 + chemistry 45 + creator 2 + education 1 + finance 18 + food 17 + health 11 + home 27 + math 29 + measurements 40 + physics 21 + shopping 10 + sports 12 + statistics 26 + text 2 + time 5 + travel 10 + work 10). `npm test` and `npm run build` re-confirmed green after the merge. Batches 6-9 (`time`, `creator`, `text`, `education`) remain TODO. | — |
| UX-09 | Download/export: PDF, PDF with table, Excel — every calculator | **DONE** 2026-11-15 | User asked for a download feature, then — after UX-11 landed and the placement was confirmed live — asked to build it immediately rather than wait for UX-10/UX-08 (see D19). Shipped as one shared `WidgetActions` dropdown (every solver/breakdown calculator): `PDF` / `PDF with table` (only when a schedule exists) / `Excel`. **`Print` was built, then dropped by user decision** — a visitor can print an already-downloaded PDF themselves, so a dedicated in-app `window.print()` option was redundant; the underlying `@media print` CSS stays (still used by a native Ctrl+P). **CSV was dropped and replaced with Excel (.xlsx) mid-session** — the user's quality bar ("production ready for a corporate employee," colors, embedded images) is technically impossible for plain-text CSV; confirmed via `AskUserQuestion`. Two rounds of Opus-subagent design consultation (one for Excel, one for PDF + Print) drove a full rewrite of all three after a real bug was found in the first Excel draft (chart image overlapping the inputs column; numbers stored as pre-formatted text, not real numbers). Final shape: `lib/export.ts`'s `ExportRow`/`ExportTable` carry real typed `raw`+`kind` values (not just display strings); `lib/exportExcel.ts` writes a two-sheet workbook (Summary with a KPI card + colored legend table + native Excel Table on its own Schedule sheet, frozen panes, conditional-format zebra striping); `lib/exportPdf.ts` dropped the inputs-beside-chart layout for top-down full-width blocks (KPI band, inputs, chart+legend table, notes, schedule on its own page); `app/globals.css` + `CalculatorWidget.tsx` got real print-media handling (dark-mode-on-paper fix, `print-color-adjust: exact` on the result/chart, page-break and hidden-control rules). New dependency `exceljs` ^4.4.0 (replacing the removed `lib/exportCsv.ts`), audited — 2 new moderate findings, assessed low-risk, noted in the step file. Verified via a round-trip `exceljs` read-back of a live-downloaded file (not just a screenshot) plus DOM/stylesheet inspection of the print CSS. `npm test` 1123/1123, lint clean, `npx tsc --noEmit` clean, build passes. Full design, what shipped, and what was deliberately deferred (vector donut, year-subtotal grouping, printed-static form values) in `mdFiles/steps/ux-09-download-export.md`'s "Third follow-up" section. | — |
| 46–47 | Wave 3: physics · chemistry | **DONE** 2026-11-17 | Needs 30 + 31 (both DONE). Scoped in `mdFiles/steps/46-47-wave-3-physics-chemistry.md`. `physics` category already exists (1 calculator, `force-calculator`) — widen it; `chemistry` is new. **Physics run 1 of ~N DONE 2026-11-06** (PR #61, merged): speed-distance-time, weight, kinetic-energy, potential-energy, work — 5 calculators, physics now 6 total, 199 calculators site-wide. Added the `angle` dimension to `lib/units.ts` (base radian, `deg` = π/180 rad, BIPM SI Brochure) for work-calculator; everything else reused existing dimensions per the dedupe note. `work-calculator`'s glyph is `Fd` not `W` (`weight-calculator` already claimed `W` in physics — caught by the existing glyph-uniqueness test). `npm test` 839/839, lint clean, `npm run build` 199/199 pages. **Physics run 2/~N DONE 2026-11-06** (PR #62, merged): momentum, impulse, power, density, pressure — 5 calculators, physics now 11 total, 204 calculators site-wide. Two new `lib/units.ts` dimensions: `momentum` (base kg·m/s, alt N·s — numerically identical, shared by momentum/impulse) and `density` (base kg/m³, alts g/cm³ and lb/ft³, NIST SP 811). **The build agent hit a session rate limit mid-run**, interrupted right as it started the 5th calculator (pressure-calculator) — 4/5 were already committed and pushed. The main session finished pressure-calculator from the agent's own complete-but-uncommitted draft (content and solver were already correct), then did three things the agent hadn't gotten to yet: registered the id in `calculatorOrder` (`data/calculators/index.ts` — a separate file from `physics.ts`, easy to miss), added the `KNOWN_NON_FINITE` entry for the force/area-both-zero edge case in `data/calculators.spec.ts` (same pattern as power-calculator/density-calculator just above it), and regenerated the snapshot (additive-only). `npm test` 863/863, lint clean (after removing a stale local `.open-next/` directory that isn't part of the repo and was confusing eslint), `npm run build` 204/204 pages — all re-confirmed by the main session after merge. **Physics runs 3 (electricity/circuits, PR #63) and 4 (waves/optics, PR #64) also DONE** — physics reached 21. **Chemistry runs 1–9 (PRs #65–#73) also DONE** — new `chemistry` category opened, now 45 calculators. **Physics mechanics-remainder run A (acceleration, free-fall, projectile-motion, friction, spring/Hooke's law — PR #104) DONE 2026-11-16** — physics now 26, site-wide 321. New `lib/units.ts` dimension: `springConstant`. **Physics mechanics-remainder run B (centripetal force, gravitational force, torque, buoyancy, pendulum period — PR #105) DONE 2026-11-16** — physics now **31**, site-wide **326**. New `lib/units.ts` dimension: `torque`; new `GRAVITATIONAL_CONSTANT` (CODATA 2022/NIST) in `physics.ts`. **Physics runs 7 (PR #106) and 8 (drivetrain/efficiency, PR #107) also DONE** — physics reached 41. **Chemistry run 10 (Graham's law of effusion, weak-acid ionization/pH, current efficiency, Hess's law, conservation of mass — PR #109) DONE 2026-11-16** — not part of the originally-scoped runs 1-9 (those exhausted the seed lists); chemistry now **50**, site-wide **341**. Zero new `lib/units.ts` dimensions this run. Full detail per run in `mdFiles/steps/46-47-wave-3-physics-chemistry.md`'s own Progress checklist and this file's Session log. **Physics runs 9–12 (PRs #108, #111, #113, #114) and chemistry runs through PR #112 closed both categories out on 2026-11-17: physics finished at 61, chemistry at 60, both exactly at the rollout-plan target. Wave 3 is fully DONE — next per D13/D22 is biology (new category, not yet started).** | §4 |
| 48–49 | Wave 4: biology · ecology + fun | **biology DONE, ecology IN PROGRESS (batches 1-3 of 5 done)** | Absorbs steps 23, 25, 26 where they fit. **Step 48 (biology) fully DONE 2026-11-17** — new category opened and closed across 6 batches (PRs #115-#120), `biology` 0 → 28 (2 short of its ~30 target by two deliberate, documented honest-skip decisions — a subjective body-condition score and a pet-calorie calculator with no fetchable primary source). Full per-batch detail in `mdFiles/steps/48-wave-4-biology.md`'s Progress checklist and this file's Session log below. Also retrofitted with sub-grouping (PR #122) after the user noticed its category page had no sections like other categories — 28/28 calculators tagged into 6 groups (Lab Basics & Sample Prep, Molecular Biology, Genetics, Microbiology & Growth, Cell & Plant Biology, Animal Biology), `biology` added to `data/calculators/categories.spec.ts`'s `GROUPED_CATEGORIES` set. **Step 49 (ecology) scoped 2026-11-17** in `mdFiles/steps/49-wave-4-ecology.md` — new category, ~25 calculators in 5 batches of 5. Fetched Omni's own ecology category page directly for the seed list; **critical scope boundary**: explicitly excludes solar-panel/wind-turbine/home-renewable-energy calculators since `mdFiles/omni-strategy.md` §4.5 already reserves a dedicated Wave 5 "Solar & home energy" category for that topic. **Batch 1 DONE** (PR #121) — opened the `ecology` category (`data/calculators/ecology.ts`, `emerald`/`leaf` theme pair): `carbon-footprint-calculator`, `flight-carbon-footprint-calculator`, `water-footprint-calculator`, `plastic-footprint-calculator`, `meat-footprint-calculator`. **Batches 2 (population & biodiversity, PR #124) and 3 (sustainable living, PR #123) DONE**, built in parallel on the same file (batch 2 needed a re-run after a prior attempt died from a weekly API rate limit with no commits lost) — PR #124 merged first cleanly, PR #123 conflicted as expected and was resolved by the main session (same hand-splice technique as the physics/biology-wave same-file conflicts, this time also needing both branches' own top-of-file constants blocks merged in, not just the calculator arrays): batch 2 added `carrying-capacity-calculator` (logistic growth, cross-linked to and distinguished from biology's `population-growth-calculator`), `shannon-diversity-index-calculator`, `population-density-calculator`, `simpson-diversity-index-calculator`, `lotka-volterra-calculator` (scoped to the model's closed-form equilibrium only, per D17's honest-skip discipline — the full coupled-ODE time series has no closed form); batch 3 added `car-vs-bike-calculator`, `tree-benefits-calculator`, `books-vs-ebooks-calculator` (Kozak 2003 UMich LCA study, fetched and read in full), `drip-faucet-waste-calculator`, `recycling-rate-calculator`. **`ecology` 5 → 15, site-wide 404 → 414.** Batches 4-5 (environmental health, round-out) remain. Ecology does not have sub-groups yet either (deliberately deferred until all 5 batches land, same as biology's retrofit). Per D23, fun/other and tech also now have their go-ahead but ecology continues first. | §4 |

Order: **17 → 30 → 31 → 32 → 33 → 34 → 35 … 39 → 40 …**, strictly one at a time. Steps 18–22
(region) also run in sequence: they can be slotted in anywhere after 17, between two other steps,
never alongside one. Each batch/wave step is one background `calculator-builder` run → PR → the
main session merges once it passes, without asking (D11) → the next step starts.

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

_Entries older than ~1 day's work moved to `mdFiles/STATUS-archive.md` (steps 01–42, UX-01–03, 2026-09-10 through 2026-10-31; all 4 Wave 2 Construction batches; all 3 Food batches; Sports run 1). Check there for anything not covered below._

**2026-11-05 — Step 59, Wave 2 Sports run 2 (PR #60, merged) — Sports closed out, Wave 2 fully DONE**:
added `steps-to-miles-calculator`, `baseball-batting-average-calculator` (AVG/OBP/SLG/OPS combined,
MLB glossary formulas), `cricket-bowling-figures-calculator` (average/economy/strike-rate combined),
`cricket-net-run-rate-calculator` (ICC clause 16.10.2, including the "bowled out → full overs" rule),
`nfl-passer-rating-calculator` (NFL's 1973 formula, 0–2.375 clamp), `elo-rating-calculator` (FIDE's
current K-factor table + 400-point cap), `golf-course-handicap-calculator` (WHS Rule 6.1 — scoped to
the Handicap-Index-to-Course-Handicap conversion only; the full Handicap Index itself needs a 20-round
scoring history, not a single formula, so that's explicitly out of scope) to `sports` (now **12
calculators**, 194 total on the site). Parked winning-percentage (too generic) and cycling-pace (no
distinct convention beyond running-pace-calculator/measurements). `npm test` caught a real edge case
pre-ship: `cricket-bowling-figures-calculator`'s wicketless-bowler input correctly produced `NaN` for
average/strike-rate, added to `KNOWN_NON_FINITE`. `npm test` 817/817, lint clean, `npm run build`
224/224 static pages — re-confirmed by the main session before merging. **This closes out Wave 2 in
full** (construction 165→27-in-home, food 17, sports 12). **Visual-QA checkpoint: 50 calculators
since the last Chrome visual pass — exactly at the `CLAUDE.md` ~50 threshold. A visual-QA pass is
now due** before starting whatever comes after Wave 2. Full writeup:
`mdFiles/steps/59-wave-2-sports-run-2.md`.

**2026-11-08 — Step 46, Wave 3 chemistry run 3 (PR #67, open, not yet merged)**: added
`limiting-reagent-calculator` (type-B breakdown, two-reactant comparison), `theoretical-yield-calculator`
(5-variable closed-form solver, cross-linked both ways with `percent-yield-calculator`),
`empirical-formula-calculator` (breakdown, reuses `lib/atomicMasses.ts`'s `ELEMENT_OPTIONS`, up to 3
elements, implements OpenStax's percent→moles→smallest-ratio→clear-the-fraction method as one
`compute()` step), `stoichiometry-calculator` (4-variable mole-ratio solver, scoped to simple
mole-ratio problems only — no equation balancing, confirmed not multi-step), and
`solution-concentration-calculator` (3-variable mg/L solver, cross-linked with `molarity-calculator`/
`mass-percent-calculator`). New `lib/units.ts` dimension `massConcentration` (base mg/L; ppm/ppb share
mg/L's/µg/L's factors on EPA's own stated drinking-water convention, fetched directly — not a
universal mass-fraction identity, caveated in content for anything denser than a dilute aqueous
solution). All formulas verified against OpenStax Chemistry 2e (§3.2, §3.4, §4.3, §4.4) and EPA's
National Primary Drinking Water Regulations page, fetched directly, not recalled from memory. `npm
test` 989/989, lint clean, `npm run build` 260 static pages — all re-run by the build agent. Curl-
checked all 5 pages plus `/categories/chemistry`. `chemistry` now 15 calculators, **229 total**.
Found (not fixed, see Parked) two mismatched section-title/URL citations in chemistry run 1's already-
shipped `mass-percent-calculator` and `dilution-calculator`. Full writeup:
`mdFiles/steps/46-47-wave-3-physics-chemistry.md`.

**2026-11-08 — Step 46, Wave 3 chemistry run 4 (PR #68, open, not yet merged)**: added
`reaction-half-life-calculator` (t½ = ln2 ÷ k, first-order kinetics, 2-variable solver — explicitly
distinct from physics' `radioactive-half-life-calculator`, cross-linked both ways), `rate-constant-
calculator` (first-order integrated rate law, k = ln([A]₀÷[A])÷t, 4-variable solver, scoped tight to
first order only per the task's instruction), `arrhenius-equation-calculator` (k = A·e^(−Ea/RT),
4-variable solver, reuses `ideal-gas-law-calculator`'s exact R constant), `molality-calculator`
(b = mol÷kg solvent, 3-variable solver, content contrasts its temperature-independence with
molarity's), and `mole-fraction-calculator` (χ = mol component ÷ total mol, type-B breakdown widget,
2-or-3-component). New `lib/units.ts` dimensions: `rateConstant` (base s⁻¹, alts min⁻¹/h⁻¹ — same
physical unit as `frequency`'s Hz but chemistry-appropriate units), `molarEnergy` (base J/mol, alts
kJ/mol/cal/mol/kcal/mol) and `molality` (base mol/kg). Sanity-checked the task's specific-heat
question: confirmed physics' `heat-calculator` (Q = mcΔT) already adequately serves a chemistry
audience, so no duplicate page was built — molality/mole-fraction filled those two run-4 slots
instead, as planned. All formulas and worked-example numbers verified against OpenStax Chemistry 2e
(§12.4, §12.5, §11.4, §9.3), fetched directly — the half-life and rate-constant calculators reuse the
same real H₂O₂ decomposition data table (OpenStax Example 12.7/12.11) for internal consistency. `npm
test` 1,012/1,012, lint clean, `npm run build` 265 static pages. A pre-existing `next dev` process was
already running on port 3000 for this project (not started by this run); Next.js refuses a second dev
server per project directory regardless of port, and killing that PID was correctly blocked as
"interfere with workloads," so the 5 new pages were instead verified from the static HTML
`next build` already produced (H1, JSON-LD, all 8 sections, category-page links) — no new dev server
was left running. `chemistry` now 20 calculators, **234 total**. Full writeup:
`mdFiles/steps/46-47-wave-3-physics-chemistry.md`.

**2026-11-09 — Step 46, Wave 3 chemistry run 6 (PR #70) — DONE and merged**: added
`density-of-solutions-calculator`, `serial-dilution-calculator`, `electron-configuration-calculator`,
`buffer-capacity-calculator`, and `beer-lambert-law-calculator`. (Chemistry run 5, PR #69 — added
`osmolarity-calculator`, `normality-calculator`, `titration-calculator`, `equilibrium-constant-
calculator`, `gibbs-free-energy-calculator`, taking chemistry to 25/239 total — was merged between
sessions without its own entry landing here; see the top summary line and the step file for its
details.) New `lib/electronConfigurations.ts`: ground-state electron configurations for elements
1-108, transcribed directly from NIST's Atomic Spectra Database (elements 109+ have no NIST data, so
the calculator stops at 108). Resolved the Cr/Cu written-order question left open by the prior
session's cutoff: NIST's own data prints 3d before 4s (increasing-n order), confirmed by a direct
fetch, not Aufbau fill order. New `lib/units.ts` dimensions `absorbance` and `molarAbsorptivity`
(IUPAC Gold Book, m²/mol base) for the Beer-Lambert calculator. Full writeup, including the scope
decisions (density-of-solutions is deliberately not a duplicate of physics' density-calculator;
serial-dilution is unit-agnostic; buffer-capacity is a type-B breakdown, not a solver) and the two
citation gaps flagged (the IUPAC Gold Book and the 1922 Van Slyke paper both 403'd a direct fetch —
the Van Slyke buffer-capacity formula was independently re-derived from scratch instead):
`mdFiles/steps/46-47-wave-3-physics-chemistry.md`. `npm test` (1,057 tests), lint clean, `npm run
build` (275 static pages). `chemistry` now 30 calculators, **244 total**.

**2026-11-15 — Step 60, Wave 5a finance batch 1 (real estate/affordability, PR #75) — DONE, not yet merged**:
added `home-affordability-calculator` (three-tier conservative/balanced/maximum PITI affordability
with PMI below 20% down and a 28% front-end / 36-43-50% back-end DTI check, cited to CFPB Reg Z
§1026.43, Fannie Mae Selling Guide B3-6-02 and Freddie Mac's PMI/insurance figures),
`mortgage-refinance-calculator` (break-even = closing costs ÷ monthly savings, the Federal Reserve
Board's own refinancing-guide formula, plus lifetime-interest comparison that catches the
"resetting the clock" trap), `down-payment-savings-calculator` (solver, same future-value-with-
contributions math as `compound-interest-calculator` but solved for time-to-goal),
`closing-cost-estimator-calculator` (CFPB/Freddie Mac-cited 2-5% of price overall, 0.5-1% of loan
for origination specifically; everything else is the remainder of the cited range, not invented
per-category percentages), `rent-vs-buy-calculator` (net cost of renting vs. buying over N years,
crediting the down payment's foregone investment growth to the renting side). `finance` 8 → **13**
calculators. Every worked-example number re-verified in a scratch script (not committed) before
each commit; every fetched figure (CFPB, Freddie Mac, Fannie Mae, Federal Reserve Board, BLS CPI,
Redfin) came from a direct fetch, not recalled. `npm test` 1123/1123 (8 new `KNOWN_NON_FINITE`
entries added for legitimate 0/0 edge cases), lint clean, `npm run build` 295 static pages.
Branch `step/60-wave-5a-finance-run-1`, draft PR **#75**, not yet merged — main session reviews
and merges next. Batches 2-7 (debt, retirement ×2, investment analysis, remaining items, income
tax) are separate future runs.

**2026-11-15 — Step 60, Wave 5a finance batch 2 (debt, 5, PR #92) — DONE, not yet merged**: added
`debt-to-income-calculator` (front-end/back-end DTI, deliberately reusing home-affordability's own
28%/36% convention and example numbers so the two pages agree exactly), `debt-payoff-calculator`
(snowball vs. avalanche side by side on a 3-list-input debt set — balances/rates/minimum payments,
a new 3-list pattern beyond statistics' existing 2-list `pairedLists` precedent — cited to a CFPB
blog on the two strategies plus Gal & McShane's 2012 *Journal of Marketing Research* paper on why
snowball works psychologically even when it costs more), `credit-card-minimum-payment-calculator`
(minimum-only payoff timeline vs. a fixed payment, using the 1%-of-balance-plus-interest / $25-floor
formula the CFPB's own 2015 Consumer Credit Card Market Report found "almost all" large issuers
use — fetched directly via `pdftotext` after `WebFetch` couldn't parse the PDF), `balance-transfer-
savings-calculator` (net savings = interest avoided minus the transfer fee, assuming payoff within
the promo window; cites CFPB confirming a transfer fee can apply even to a 0% offer),
`student-loan-calculator` (Standard/Graduated/Extended federal repayment plans; Graduated modeled
with a from-scratch bisection-solved step-up schedule, explicitly caveated as simplified; cites two
Department-of-Education loan servicers directly for the $30k Extended eligibility floor and the
July 1, 2026 cutoff after which new loans use a Tiered Standard plan instead, not modeled here).
`finance` 13 → **18** calculators, new `Debt` sub-group. Every worked-example number re-verified in
standalone scratch scripts (not committed, no app imports) before each commit, including the
debt-payoff snowball/avalanche simulation and the graduated-schedule bisection. Every fetched figure
(CFPB 2015 report §5.2.5, CFPB balance-transfer-fee page, two studentaid.gov-affiliated servicer
pages) came from a direct fetch — the CFPB 2015 report PDF needed `pdftotext -layout` since
`WebFetch` returned "binary/encoded" for it. `npm test` 1128/1128 (2 new `KNOWN_NON_FINITE` entries
for legitimate 0-income/0-balance edge cases), lint clean, `npm run build` 300 static pages. Branch
`step/60-wave-5a-finance-run-2`, draft PR **#92**, not yet merged — main session reviews and merges
next. Batches 3-7 (retirement ×2, investment analysis, remaining items, income tax) are separate
future runs.

**2026-11-15 — UX-09 third follow-up: CSV→Excel pivot, PDF + Print redesign — DONE, not yet
merged**: continuing the same UX-09 session after a user screenshot confirmed a real bug in the
first Excel draft (chart image overlapping the Inputs column; numbers written as pre-formatted
text, triggering Excel's "number stored as text" warning). Consulted an Opus subagent twice (Excel
design; then PDF + Print design) and rewrote all three against those specs rather than keep
patching. `lib/export.ts`'s `ExportRow`/`ExportTable` now carry real typed `raw`+`kind` values
alongside the display string; `SolverCalculator.tsx`/`BreakdownCalculator.tsx` populate them.
`lib/exportExcel.ts` fully rewritten: two sheets (Summary with a KPI card, inputs, a colored legend
table with a `SUM()` total row, and the chart image, columns B:C/E:H with a deliberately-blank
column D between them; Schedule with a native `ws.addTable()`, frozen header, conditional-format
zebra striping). `lib/exportPdf.ts` fully rewritten: top-down full-width blocks (tinted KPI band,
2-column inputs, chart+legend-as-table, notes, schedule always on its own page) replacing the old
inputs-beside-chart cards. `app/globals.css` + `CalculatorWidget.tsx` got real `@media print`
handling (forces light mode on paper even if dark theme is active, `print-color-adjust: exact` on
the result/chart so colors survive printing, hides the actions bar, flattens form-control borders).
New dependency `exceljs` ^4.4.0, replacing the deleted `lib/exportCsv.ts` — audited, 2 new moderate
findings assessed low-risk (same pattern as the original jsPDF audit). A real bug found and fixed
during this work: the chart legend's label/value split was regexing the *last* number off the
joined DOM text, which grabbed the share percentage ("52%") instead of the dollar amount in the
middle for Donut's 3-part `[label, amount, share%]` legend rows — fixed by splitting on the
legend's actual per-child DOM text nodes instead of the joined string, verified against the live
DOM. `npm test` 1123/1123, lint clean, `npx tsc --noEmit` clean, `npm run build` passes.
Live-verified in Chrome: captured the generated Excel blob directly (bypassing Chrome's
repeated-auto-download block, which silently drops a page's 2nd+ programmatic download without an
intervening trusted user gesture) and round-tripped it through `exceljs` to confirm real numbers,
correct formats, the native table, and the legend fix. Deliberately not implemented from the Opus
specs (time-boxed, documented as follow-ups in the step file): vector-drawn PDF donut, year-subtotal
grouping in the PDF schedule, region-aware Letter/A4 paper size, and printed-static (vs. native)
form-control values. Branch `ux/download-export-layout-v2`, not yet merged — see
`mdFiles/steps/ux-09-download-export.md`'s "Third follow-up" section for full detail.

**2026-11-15 — UX-09 fourth follow-up: dropped the Print option**: user's call — printing is
redundant once PDF download exists (print the downloaded file instead). Removed the `Print`
dropdown entry and its `window.print()` handler from `DownloadMenu`
(`components/CalculatorWidget.tsx`); `DownloadFormat` is now `'pdf' | 'pdf-table' | 'excel'`. Kept
the `@media print` CSS from the third follow-up — still useful for a native Ctrl+P regardless of
whether the app exposes a button for it. `npm test` 1123/1123, lint clean, `npx tsc --noEmit`
clean, build passes. Verified live: the dropdown now shows exactly PDF / PDF with table / Excel.

**2026-11-16 — Step 61 batch 2, `work` (branch `step/61-deepen-work`, PR #95)**: added
`overtime-pay-calculator`, `severance-pay-calculator`, `cost-of-living-comparison-calculator`,
`remote-work-savings-calculator`, `job-offer-comparison-calculator`,
`paid-sick-leave-accrual-calculator` — `work` now 10 (4→10, all 6 planned calculators built, none
skipped). Dedupe check against the whole site found `overtime-pay-calculator`'s FLSA math
overlapping `time`'s existing `work-hours-calculator`; kept it distinct by auto-splitting a weekly
total at a threshold (vs. pre-split hours) and adding a double-time tier, with an explicit
cross-reference in both directions in the copy rather than silently duplicating. Per the task's
instruction, `remote-work-savings-calculator` reuses `auto`'s `commute-cost-calculator` per-day
cost model exactly (same default scenario, same $26.38/day) rather than recomputing it, adding only
a Census-cited time-saved figure the original deliberately omits. All cited figures fetched live
this session: DOL (severance pay fact sheet, WARN Act, FLSA/overtime, EO 13706 sick leave FAQ), CA
DIR (overtime + paid sick leave FAQs), BLS (CPI area-index FAQ, June 2026 ECEC benefits share),
C2ER (cost-of-living index methodology + its own worked ratio example, used only to sanity-check
the formula, not copied as our example), SHRM (citing a WorldatWork severance-formula survey), and
the US Census Bureau (2019 ACS one-way commute time). Every worked-example number re-verified in a
standalone Node scratch script before writing the copy, then cross-checked again against the
actual `compute()` snapshot output — both matched exactly. `npm test` 1137/1137, lint clean,
`npm run build` green. Next: batch 3 (`health`, 6→11) per the step file.

**2026-11-16 — Step 60, Wave 5a finance batch 3 (retirement, part 1, 5, branch
`step/60-wave-5a-finance-run-3`, PR #99) — DONE, not yet merged**: resumed after a previous run
died from a rate limit having committed only 3 of 5 (`retirement-savings-calculator`,
`401k-employer-match-calculator`, `roth-ira-growth-calculator`). Added the remaining 2:
`traditional-ira-calculator` (same yearly-contribution/yearly-compounding growth math as
`roth-ira-growth-calculator`, differentiated purely by tax treatment — an assumed tax rate drives
both this year's estimated deduction savings and the tax owed on the pretax balance at withdrawal,
so the Roth-vs-traditional "tax now vs. tax later" trade-off shows up as real dollars; cites the
same shared 2026 IRS IRA limit Roth already uses, $7,500/$8,600 with the 50+ catch-up, from IRS
Notice 2025-67 fetched directly, plus the deduction phase-out ranges from the same notice) and
`rmd-calculator` (Required Minimum Distribution from the IRS's current Uniform Lifetime Table —
fetched IRS Publication 590-B (2025) Appendix B Table III directly via its own tool-result PDF
read, since the WebFetch tool's PDF text extraction failed on both the Notice and Pub 590-B PDFs;
reproduced the full table, ages 72 through 120+, as a `content.referenceTable`, not an
approximation). Both calculators were already correctly anticipated by `roth-ira-growth-calculator`'s
existing cross-links and FAQ promise ("the same example numbers") — verified at the end, no edits
needed to Roth. Every worked-example number (including the "RMD at 90 is ~101.6% higher than at 75"
and the 22%-vs-32%-withdrawal-tax comparison) independently re-verified in a standalone Node
scratch script before committing. A pre-existing, already-committed stale snapshot (from the
earlier interrupted run) had placeholder entries for both new ids under different field names —
resolved by treating them as orphaned/stale per the skill's own protocol and running
`npm run test:update`, confirming via `git diff` that the regenerated snapshot touched only the
two intended ids each time. `npm test` 1180/1180, lint clean,
`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` clean,
`npm run build` 331/331 pages. `finance` 18 → 23; site-wide total (grepped, not estimated) 301.
**This closes out batch 3 (5/5).** Next: batch 4 (retirement pt. 2 + goal investing, 5) per the
step file — not started by this run.

**2026-11-16 — Step 60, Wave 5a finance batch 5 (investment analysis + simple-interest cluster, 5,
branch `step/60-wave-5a-finance-run-5`, PR #101) — DONE, not yet merged**: added
`irr-calculator` (Internal Rate of Return from a cash-flow `list` input; reused `lib/solve.ts`'s
`findRoot` for the rate, which has no closed form — no new solver added to that file), `npv-calculator`
(Net Present Value from the same cash-flow-series shape plus a discount rate, closed form; cross-linked
both ways with `irr-calculator` as the two sides of the same series — NPV at the worked example's own
IRR of 17.77% comes out to $0, checked directly), `cd-calculator` (maturity value from a stated APY,
applied as `FV = P × (1 + APY)^(months/12)` — differentiated from `compound-interest-calculator` by
having no contribution field at all, matching how a real CD works, since APY already includes
compounding; early-withdrawal-penalty content cited to the CFPB and OCC's helpwithmybank.gov),
`simple-interest-calculator` (`I = P × r × t`, with the compound-interest contrast computed directly
into the copy rather than left abstract — same $4,000/5.5%/4-year inputs, compounding earns 8.56% more),
and `mutual-fund-calculator` (lump sum + monthly contribution, expense ratio subtracted from the gross
return before compounding — the one thing `investment-calculator` doesn't model — with the fee's
dollar cost broken out as its own `feeDrag` output, $11,717.80 on the worked example rather than an
abstract percentage). Every worked-example number (IRR, NPV, CD maturity/back-solves, simple vs.
compound interest, mutual-fund fee drag) independently re-verified in a standalone Node scratch script
before committing — caught and fixed one wrong invented comparison figure (a hand-waved "0.1% expense
ratio" alternative) during that pass. Citations fetched directly: OpenStax *Principles of Finance*
§16.2/16.3 (NPV/IRR), OpenStax *Contemporary Mathematics* §6.3 (simple interest), CFPB and
helpwithmybank.gov (CD penalties), SEC Investor.gov (expense ratio) — the two Investor.gov URLs
returned HTTP 403 to the fetch tool directly but are the same already-cited-elsewhere SEC glossary
domain used by `compound-interest-calculator`/`investment-calculator`, corroborated via search-result
snippets of the same pages. `npm test` 1208/1208 (one new `KNOWN_NON_FINITE` entry,
`irr-calculator`'s `[0, 0]` edge-case cash-flow list has no sign change), lint clean, `npm run build`
green throughout (one build run per calculator as it was added). `finance` 28 → 33; site-wide total
**310**, verified via a temporary script importing `data/calculators/index.ts` directly (per-file grep
of top-level `id:` lines over-counted by 1 — `statistics` is 25, not 26 — so the import-based count is
the authoritative one, not the grep). Dev-server check: curled all 5 new pages (200s, correct H1/TOC/
FAQ/JSON-LD), using port 3002 since port 3000 already had another session's server running — left that
one alone, killed only the 3002 instance afterward. **This closes out batch 5 (5/5).** Next: batch 6
(remaining money-hub items, 5–6) per the step file — not started by this run.

**2026-11-16 — Step 60, Wave 5a finance batch 6 (remaining money-hub items, 5,
branch `step/60-wave-5a-finance-run-6`, PR #102) — DONE, not yet merged**: added
`emergency-fund-calculator` (3-month minimum / 6-month recommended target from monthly expenses,
cited directly to FINRA's investor-education page — "the equivalent of three to six months of
living expenses" — and the CFPB's own Money as You Grow savings page, which independently sets the
same 3-month floor and suggests 6-9 months "if possible"; a `rangeBar` visual plots months of
expenses already covered against that cited range), `mortgage-amortization-schedule-calculator`
(built, not skipped — the redundancy check against `mortgage-calculator`, which already renders a
full monthly amortization table per UX-07, found the step file's own suggested genuinely-additional
angle: an accelerated-biweekly vs. standard-monthly schedule comparison on the same loan, modeled as
the regular payment plus 1/12 extra every month, the monthly-equivalent of a half-payment every two
weeks; includes a real CFPB enforcement citation, the Nationwide Biweekly suit, quoting the Bureau's
own finding that a typical enrolled consumer needed nine years and over $1,200 in fees before a paid
third-party biweekly program's own promised savings caught up with its cost, with the free DIY
alternative — `loan-prepayment-calculator` — cross-linked directly), `business-loan-calculator`
(identical amortized-loan math to `loan-calculator`, differentiated entirely through content per the
step file's own instruction: working-capital vs. equipment-financing framing, SBA 7(a)/504/Microloan
program structure and guarantee percentages fetched directly from sba.gov), `commission-calculator`
(flat-rate vs. tiered/marginal-bracket commission on a sale amount, modeled bracket-by-bracket the
same way tax brackets work, with an explicit watch-out that some real "cliff" plans instead apply the
new rate to the whole sale; IRS Publication 15 (2026)'s 22%/37% supplemental-wage flat-withholding
rule and DOL Fact Sheet #20's commissioned-retail-employee overtime exemption both fetched directly
rather than recalled), and `college-savings-calculator` (529-style monthly contribution required to
fund every year of a future college cost — the goal is computed from today's tuition compounded by a
tuition-inflation-rate input and summed across every year in school, rather than typed in directly as
`goal-based-investment-calculator` requires, which is the explicit differentiator; College Board's
*Trends in College Pricing and Student Aid* 2025 report fetched directly for both the $11,950
public-in-state / $45,000 private-nonprofit 2025-26 tuition defaults and the 2.9%/4.0% nominal
year-over-year increases used to justify the default inflation-rate assumption; cross-linked both ways
with `goal-based-investment-calculator`). `down-payment-savings-calculator` was not duplicated, per
the step file (already shipped in batch 1). One mid-build syntax bug (an unescaped apostrophe in
`business-loan-calculator`'s content broke parsing for the whole file) was caught by `npm test` and
fixed before committing. Every worked-example number (emergency-fund months-to-goal, the biweekly
amortization simulation, business-loan payment/interest at two terms, flat vs. tiered commission
across three sale sizes, and every college-savings year-by-year tuition figure/required contribution)
independently re-verified in a standalone Node scratch script before committing. `npm test` 1216/1216
(three new `KNOWN_NON_FINITE` entries for zero-division edge cases: `emergency-fund-calculator`,
`commission-calculator`; `mortgage-amortization-schedule-calculator` and `college-savings-calculator`
needed no entry, since their `compute()` already guards the zero-period edge the same way
`goal-based-investment-calculator` does), lint clean, `npm run build` green (315 pages, verified via
a temporary script importing `data/calculators/index.ts` directly — same safer method batch 5 used
over the per-file grep). `finance` 33 → **38** calculators; site-wide total **315**. **This closes out
batch 6 (5/5).** Next: batch 7 (`income-tax-calculator`, standalone) per the step file — explicitly
not started by this run, and the visual-QA spot-check the step file notes as due near the end of
batch 6/7 is also still pending.

**2026-11-16 — Step 60 batch 7 (income tax, solo, PR #103) — Step 60 (Wave 5a finance/money-hub)
now FULLY DONE, all 7 batches**: added `income-tax-calculator` — US federal-only income tax
estimate by filing status (single, married filing jointly, married filing separately, head of
household), from either gross income (2026 standard deduction applied) or taxable income entered
directly, with effective tax rate and marginal tax rate shown side by side (addressed directly in
the content as a common point of confusion: effective is total tax divided by taxable income,
marginal is the rate on the next dollar, and the gap between them grows with income — the worked
example shows an 11.44% effective rate vs. a 12% marginal rate on $43,900 of taxable income).
Reuses the shared `PAYROLL_2026` bracket table `paycheck-calculator` already cites (IRS Rev. Proc.
2025-32 / Internal Revenue Bulletin 2025-45), extended with a 4th array entry for married filing
separately — fetched and cross-checked via two independent web searches, then verified identical to
single's brackets through the 32% bracket, with the 35%/37% cutoff at exactly half of
married-filing-jointly's own threshold ($384,350, not single's wider $640,600). Explicit, repeated
disclaimer that this is federal income tax only (no state or local tax), not tax advice, and that a
real tax professional should be consulted for an actual return — called out in
`content.formula.note`, a dedicated `watchOut` item, and the FAQ, since this is the most YMYL
calculator in the whole wave. Every worked-example number (the $60,000-gross example, the
$150,000 comparison used in the explanation, the 2026 standard deduction figures, and the
MFS-vs-MFJ/single bracket-boundary facts used in the FAQ) independently re-verified in a standalone
Node scratch script (no app imports) before committing. `npm test` 1217/1217 (snapshot updated,
diff additions-only — only the new calculator's entry), lint clean, `npm run build` green (347
total routes; `finance` 38 → **39**, site-wide 315 → **316**). **Step 60 closes out completely: 31
new calculators across 7 batches, `finance` 8 → 39, site-wide 285 → 316.** The wave's visual-QA
spot-check (desktop/dark-mode on `home-affordability-calculator`, `income-tax-calculator`, and one
retirement-cluster page) was **not** done by this or any prior batch agent — still pending, for the
main session to pick up (no Chrome/browser tooling was used by this build agent).

**2026-11-16 — Step 46 run 5, physics mechanics-remainder run A (PR #104)**: added
`acceleration-calculator` (a = Δv ÷ t, 3-variable solver reusing `speed`/`acceleration`/`time`),
`free-fall-calculator` (h = ½gt², reusing `length`/`acceleration`/`time`, with gravity itself left
editable like `weight-calculator` so a Moon/other-world fall can be tried, plus a bonus final-velocity
output v = gt), `projectile-motion-calculator` (range/max-height/time-of-flight from launch speed and
angle, level ground, no air resistance — a type-B breakdown widget since the three outputs have no
single invertible equation, same precedent as `series-parallel-resistor-calculator`), `friction-calculator`
(f = μN, 3-variable solver, μ on the dimensionless `count` dimension per `lens-mirror-equation-calculator`'s
magnification precedent), and `spring-hookes-law-calculator` (Hooke's law, F = kx). New `lib/units.ts`
dimension `springConstant` (base N/m, alts N/mm, N/cm, lbf/in — NIST SP 811), round-trip + anchor test
added to `lib/units.spec.ts`. All other dimensions reused as the step file anticipated. Every formula
fetched directly from OpenStax University Physics Volume 1 (§3.3 acceleration, §3.5 free fall, §4.3
projectile motion — including its own golf-shot example used as a cross-check, §6.2 friction and its
Table 6.1 coefficients, §15.1 Hooke's law) — none recalled from memory. Every worked-example and FAQ
number (including the friction worked example's normal-force-from-weight step and the projectile
motion 30°/45°-range comparison) independently recomputed in a standalone Node scratch script (no app
imports) before writing any copy. One new `KNOWN_NON_FINITE` entry (`acceleration-calculator`:
`acceleration`, velocityChange and time both 0 at their own min → 0/0); snapshot diff additive-only
(166 new lines, 0 removed, confirmed with `git diff --stat`). `npm test` 1236/1236, lint clean,
`npm run build` green (352 routes; `physics` 21 → **26**, site-wide 316 → **321**). Static HTML of
all 5 new pages checked directly (H1, one JSON-LD script, all 8 section ids, no "application error"
text) instead of curling a dev server, since a pre-existing `next dev` process was already listening
on port 3000 (not started by this run, left untouched per instruction) — same precedent as runs 4/5.
**Physics mechanics-remainder run B (PR #105) DONE 2026-11-16**: centripetal-force, gravitational-force,
torque, buoyancy, pendulum-period — 5 calculators, `physics` 26 → **31**, site-wide 321 → **326**. New
`lib/units.ts` dimension: `torque` (base N·m, alts lbf·ft/lbf·in — kept separate from `energy` despite
the same base units, same precedent as `momentum`/`force`). New `GRAVITATIONAL_CONSTANT` constant in
`physics.ts` (6.6743×10⁻¹¹ m³ kg⁻¹ s⁻², CODATA 2022/NIST, fetched directly). `gravitational-force-calculator`
is explicitly cross-linked both ways with `weight-calculator` (its worked example, Earth pulling a 70 kg
person at ≈687.4 N, is deliberately contrasted with `weight-calculator`'s 686.5 N standard-gravity figure,
explaining why they differ). Every formula fetched directly from OpenStax University Physics Volume 1
(§4.4, §13.1, §10.6, §14.4, §15.4) plus NIST's CODATA page and NASA's Earth/Moon fact sheets; every
worked-example and FAQ number re-verified in a standalone scratch script before writing copy. New
`KNOWN_NON_FINITE` entries: `centripetal-force-calculator`/`gravitational-force-calculator` (`force`,
all-zero → 0/0) and `pendulum-period-calculator` (`period`, 0/0 under the square root); snapshot diff
additive-only (169 new lines). `npm test` 1258/1258, lint clean, `npm run build` green (357 routes).
Static HTML of all 5 new pages checked directly (same pre-existing port-3000 process left untouched, per
runs 4/5/A's precedent). Next: physics waves/other-remainder run (Doppler effect, Snell's law, E = mc²,
thermal expansion, escape velocity) — not started.

**2026-11-16 — Step 46 run 8, physics drivetrain/efficiency run (PR #107, open, not yet merged)**:
added `horsepower-calculator` (P = τω, from torque + RPM — confirmed distinct from `power-converter`'s
straight unit conversion), `rpm-to-speed-calculator` (v = rω, wheel RPM → linear speed given
diameter), `gear-ratio-calculator` (driven ÷ drive teeth, plus an output-RPM `SolverOutput` from a
`fixed` input-RPM variable), `efficiency-calculator` (η = output ÷ input × 100%, OpenStax College
Physics 2e §7.6), `angular-velocity-calculator` (ω = Δθ ÷ Δt, the 5th-slot pick after ruling out
`specific-gravity-calculator` as a near duplicate of chemistry's `density-of-solutions-calculator`).
New `lib/units.ts` dimension `angularVelocity` (rad/s, rpm, rev/s, deg/s), kept separate from
`frequency` despite the exact 2π proportionality, same precedent as `torque` vs `energy`; round-trip +
anchor test added, cross-checked against OpenStax University Physics Volume 1 §10.1's own Example 10.2
(250 rpm = 26.2 rad/s). Every formula fetched directly from OpenStax University Physics Volume 1
(§10.1, §10.3, §10.8) and OpenStax College Physics 2e §7.6, plus UC San Diego's MAE 3 machine-design
course page for the gear-ratio relationship (no OpenStax introductory section covers gear trains).
Every worked-example and FAQ number (including the 300 lbf·ft/4,000 RPM horsepower example, the exact
5,252.113 automotive shortcut constant, and the 800 RPM/0.65 m wheel speed example) independently
recomputed in a standalone scratch script before writing copy. New `KNOWN_NON_FINITE` entries:
`gear-ratio-calculator`/`efficiency-calculator`/`angular-velocity-calculator` (each an honest divide-
by-zero at an input's own 0 min); `horsepower-calculator`/`rpm-to-speed-calculator` needed none.
Snapshot diff additive-only (160 new lines). `npm test` 1,302/1,302, lint clean, `npm run build` green
(367 routes; `physics` 36 → **41**, site-wide 331 → **336**). Static HTML of all 5 new pages checked
directly (pre-existing port-3000 process left untouched, same precedent as every prior physics run).
Next: physics runs 9+ — no seed list left, build agent's own formula choices (angular momentum, moment
of inertia, rotational kinetic energy, electric field strength, etc.) — not started.

**2026-11-16 — Step 46, chemistry run 10 (PR #109, open, not yet merged) — not part of the
originally-scoped runs 1-9 (those exhausted the seed lists)**: added
`grahams-law-effusion-calculator` (r₁÷r₂ = √(M₂÷M₁), 4-variable solver, reuses `molarMass`/`count`),
`weak-acid-ionization-calculator` (pH + percent ionization of an unbuffered weak acid from Ka and
concentration, exact numerically-stable quadratic rather than the "x is negligible" textbook
shortcut — explicitly distinct from `pka-henderson-hasselbalch-calculator`, a buffer), 
`current-efficiency-calculator` (actual ÷ Faraday's-law-theoretical mass × 100, the gap
`faradays-law-electrolysis-calculator`'s own watch-out flagged as uncovered), 
`hess-law-enthalpy-calculator` (ΔH°rxn from reactants'/products' standard enthalpies of formation,
type-B breakdown, up to 2 of each — distinct from `calorimetry-enthalpy-calculator`'s experimental
ΔT-based method), and `conservation-of-mass-calculator` (total reactant mass = total product mass,
4-variable solver). Zero new `lib/units.ts` dimensions — every formula reused existing ones.
**Found and parked a real pre-existing bug**: `common-ion-effect-calculator` (chemistry run 9) mixes
a `count`-dimension Ksp (unconverted) with `concentration`-dimension variables (converted ×1000 to SI
mol/m³) in one formula — the live `SolverCalculator` widget likely gives a wrong answer for any
non-default input, even though its own `compute()`/worked example/content are all correct (they don't
go through the SI-conversion code path). `weak-acid-ionization-calculator` avoids the same trap by
keeping every variable on `count`. Alias-collision sweep caught one near-miss before committing:
two of `hess-law-enthalpy-calculator`'s draft aliases collided with `calorimetry-enthalpy-
calculator`'s existing aliases, replaced before commit. Every formula fetched directly from OpenStax
Chemistry 2e (§9.4, §14.3, §17.7, §5.3 + Appendix G, §1.2), not recalled from memory; the IUPAC Gold
Book's "current efficiency" entry 403'd to a direct fetch, so that one citation is a search-snippet
fallback, flagged explicitly. Every number independently recomputed in a standalone scratch script
before writing copy. `npm test` 1,319/1,319, lint clean, `npm run build` green (372 routes;
`chemistry` 45 → **50**, site-wide 336 → **341**). Static HTML of all 5 new pages checked directly
(pre-existing port-3000 process left untouched). Full writeup:
`mdFiles/steps/46-47-wave-3-physics-chemistry.md`.

**2026-11-17 — Step 48, biology batch 1 (PR #115, open, not yet merged) — opens the brand-new
`biology` category**: `data/calculators/biology.ts` (new file), registered in
`data/calculators/index.ts` (`categories`, `calculatorOrder`, the spread list), new `lime`/`dna`
theme pair (`lib/categoryTheme.ts`, `components/IconTile.tsx`). New `lib/units.ts` dimension
`cellDensity` (cells/mL, CFU/mL, cells/µL, cells/L) plus three new `massConcentration` labels
(`ng/µL`, `µg/mL`, `mg/mL` — numerically identical to the existing `mg/L` base, so every solve stays
a plain multiplication), both with round-trip + anchor tests in `lib/units.spec.ts`. Added
`cell-dilution-calculator` (C₁V₁ = C₂V₂ for a cell/CFU suspension, cross-linked to and distinguished
from chemistry's `dilution-calculator`), `bacterial-growth-calculator` (N = N₀ × 2^(t ÷ g), binary
fission, OpenStax Microbiology §9.1's E. coli/M. tuberculosis/M. leprae generation-time examples),
`doubling-time-calculator` (t_d = ln2 ÷ µ from a measured growth rate constant — explicitly the
inverse/different question from `bacterial-growth-calculator`), `dna-concentration-calculator`
(ng/µL = A260 × dilution factor × 50, the dsDNA constant from Desjardins & Conklin 2010/PMC3346308,
cross-linked to `beer-lambert-law-calculator`), and `protein-concentration-calculator` (A280
Beer-Lambert method, c = (MW × A) ÷ (ε₂₈₀ × l), reusing the existing `molarAbsorptivity`/`molarMass`
dimensions rather than adding a new one — worked example uses BSA, MW 66,463 g/mol and ε₂₈₀ 43,824
L/(mol·cm), both fetched directly). Pace et al. (1995)'s ε₂₈₀ prediction formula is this run's one
search-snippet-fallback citation (two different direct PDF fetches both returned corrupted text),
flagged in the page's own references. Every worked-example number independently re-verified in a
standalone Node scratch script before committing. `npm test` 1459/1459 (snapshot additions
additive-only), lint clean, `npm run build` 408 pages (376 calculators, 19 categories), exit code 0.
**`biology` 0 → 5, site-wide 371 → 376.** No seed-list candidate skipped. Batch 1 was required to
land alone (new-file category-opening work, per the step file); batches 2-6 can run in parallel with
each other once PR #115 merges. Full writeup: `mdFiles/steps/48-wave-4-biology.md`.

**2026-11-17 — Step 48, biology batch 2 (PR #116, merged after a conflict resolved against batch 3) — genetics,
5 calculators**, appended to the `biology.ts` file batch 1 opened: `punnett-square-calculator`
(monohybrid cross, genotype/phenotype ratios, each parent's genotype as a dominant-allele count
0/1/2 via `options`), `dihybrid-cross-calculator` (two independently-assorting genes, generalizing
the classic 9:3:3:1 ratio via the product of each trait's own monohybrid probability),
`hardy-weinberg-calculator` (p + q = 1, p² + 2pq + q² = 1, a 2-variable solver predicting genotype
frequencies from an allele frequency), `allele-frequency-calculator` (allele frequency computed
directly from observed genotype counts — explicitly the opposite direction from
`hardy-weinberg-calculator`'s predictive calculation, both pages state the distinction), and
`dna-to-mrna-calculator` (transcription: complementary DNA strand + T→U substitution, a 6-base
lookup/breakdown widget). All formulas fetched directly from OpenStax Biology 2e (§12.1-12.3
Mendelian genetics, §19.1 population genetics/Hardy-Weinberg, §15.2 transcription); the
Hardy-Weinberg and allele-frequency worked examples both reuse OpenStax's own 500-pea-plant
population (245/210/45 YY/Yy/yy) since it is the exact source of the p=0.7/q=0.3 figures, and the
predicted 49%/42%/9% Hardy-Weinberg genotype split matches that population's actual observed
proportions exactly. **Engineering decision:** `dna-to-mrna-calculator` needed a sequence-shaped
input but `CalculatorInput`/`compute()` have no `text` type (checked `data/calculators/types.ts`
first, per the step file) — rather than add a cross-cutting input type, it reuses the existing
`options` mechanism (resistor-color-code-calculator's precedent: 6 fixed base-position dropdowns)
plus `BreakdownOutput.labels` (the ring-size-letter precedent) to render one shared computation in
either DNA (T) or RNA (U) alphabet; `compute()` wraps every raw value through a round-and-mod-4
`normalizeBaseCode` so the snapshot test's ×1.5-scaled "typical" input set can't produce an
undefined lookup. Every worked-example number independently re-verified in a standalone Node
scratch script before committing. `npm test` 1467/1467 (snapshot diff additive-only, touching
exactly the 5 new ids), lint clean, `npm run build` 413 pages (381 calculators), exit code 0.
**`biology` 5 → 10 from this branch alone; after reconciling with batch 3 (merged first), the true
post-merge count is 5 → 15, site-wide 376 → 386.** No seed-list candidate skipped. Ran in parallel
with a batch 3 agent on the same `biology.ts` file per the step file's own batches-2+ go-ahead — as
expected, PR #116 conflicted against batch 3's already-merged PR #117 (both appended to the end of
the same array/order list); the main session resolved it with the same hand-splice technique used
for the physics-wave same-file conflicts (both calculator blocks concatenated, `KNOWN_NON_FINITE`
entries and `calculatorOrder` combined). Full writeup: `mdFiles/steps/48-wave-4-biology.md`.

**2026-11-17 — Step 48, biology batch 3 (PR #117, merged) — molecular-biology lab
techniques**, appended to `data/calculators/biology.ts` in parallel with a separate agent's batch 2
(genetics) run on the same file (conflict resolved at merge time against batch 2, see above).
New `lib/units.ts` additions: `mass` gains `ug`/`ng` (ligation's insert/vector DNA mass), plus two
new dimensions, `basePairs` (bp/kb) and `relativeCentrifugalForce` (single-unit `×g`, same precedent
as `absorbance`/`pH`/`decibel`) — all with round-trip + anchor tests, plus the existing `mass`
"dimensions unchanged" pin test updated (that test intentionally asserts the exact pre-existing unit
list; adding `ug`/`ng` needed a matching update, same as `st`'s own addition in step 36). Added
`pcr-annealing-temperature-calculator` (Wallace rule, Tm = 2°C×(A+T) + 4°C×(G+C), rewritten as a
continuous function of primer length and GC% — Wallace et al. 1979 *Nucleic Acids Research*,
confirmed via a search-snippet fallback after NEB/Promega/IDT pages all 403'd or omitted the
formula), `qpcr-efficiency-calculator` (E = 10^(−1/slope) − 1, confirmed by direct fetch of
QIAGEN's own PCR bench guide), `ligation-calculator` (insert:vector molar ratio — derived from
Thermo Fisher Scientific's own dsDNA molecular-weight formula, fetched directly, showing the
per-bp mass constant cancels out of the ratio; NEB's own ligation-calculator page 403'd on direct
fetch, confirmed via a search-snippet fallback instead), `centrifuge-rcf-rpm-calculator` (RCF =
ω²r ÷ g₀, the exact SI form of the conventional 1.118×10⁻⁵ × r(cm) × RPM² lab formula — confirmed
against Wikipedia's "Centrifuge" article and OpenStax University Physics' own centripetal
acceleration formula; the two forms agree to within the published constant's own ~0.02% rounding,
stated explicitly in the content as a watch-out item), and `log-reduction-calculator` (LR =
log₁₀(N₀÷N), confirmed by direct fetch of Wikipedia's "Log reduction" article). Every worked-example
number (including the RCF cross-check between the two formula forms) independently re-verified in a
standalone Node scratch script before committing. `npm test` 1484/1484 (snapshot additions
additive-only, 163 lines; one new `KNOWN_NON_FINITE` entry for `log-reduction-calculator`'s
0/0-count edge case), lint clean, `npm run build` exit 0 (381 calculator pages). Static HTML of all
5 new pages checked directly for H1/JSON-LD/FAQ (pre-existing port-3000 process left untouched, per
the step file's own instruction not to kill it). **`biology` 5 → 10 on this branch** (pending
reconciliation with batch 2's parallel PR #116 at merge time). No seed-list candidate skipped. Full
writeup: `mdFiles/steps/48-wave-4-biology.md`.

**2026-11-17 — Step 48, biology batch 4 (PR #118, merged after a conflict resolved against batch 5
below), population biology
+ genetics extensions** — a rate-limit interruption killed the first agent on this run partway
through; a second agent resumed from the branch's own 2 already-committed calculators (documented in
the step file's Progress checklist) and finished the remaining 3. `population-growth-calculator`
(continuous N = N0 e^(rt), new `rateConstant` unit `yr-1`) and `hemocytometer-calculator` (raw
hemocytometer count → cells/mL) were the first agent's own work; `generation-time-calculator` was
correctly skipped as a confirmed duplicate of `bacterial-growth-calculator`'s existing solve
direction, same "honest skip" discipline as every prior wave. The resuming agent added
`mutation-rate-calculator` (µ = mutant frequency ÷ generations, explicitly flagged as a simplified
estimate — cites OpenStax Microbiology §11.5 "Mutations" and Wikipedia's "Luria–Delbrück experiment"
directly for the real caveat that frequency alone is "not a sufficiently accurate measure of
mutation"), `codon-to-amino-acid-calculator` (new `lib/geneticCode.ts` + spec: the full standard
genetic code, NCBI table 1, independently rebuilt and self-checked against the known 64-codon
degeneracy table, same precedent as `molecularGeometry.spec.ts`; concept content cites OpenStax
Biology 2e §15.5 directly), and `surface-area-to-volume-ratio-calculator` (sphere/cube SA:V ratio;
the prior agent's planned OpenStax §4.2 citation didn't pan out on direct fetch — no such SA:V
content exists there — so this page cites Wikipedia's "Surface-area-to-volume ratio" article
instead, confirmed by direct fetch). Every worked-example number, including the full genetic code
table, independently re-verified in a standalone Node scratch script before committing. `npm test`
1509/1509 (snapshot additions additive-only, confirmed via `git diff`/grep on the snapshot file; 2
new `KNOWN_NON_FINITE` entries for the two new breakdown calculators' genuine 0-divide edge cases),
lint clean, `npm run build` exit 0 (391 calculator pages). Static HTML of all 3 new pages checked
directly for H1/section-ids/FAQPage JSON-LD (pre-existing port-3000 process left untouched).
**`biology` 15 → 20 on this branch's own head** — reconciled against batch 5 below: its own
`surface-area-to-volume-ratio-calculator` was dropped as a duplicate (batch 5's merged first), so
this batch's net contribution ended up 4 unique calculators, not 5. Re-confirmed (not re-fixed) the
two pre-existing, unrelated alias collisions already in Parked below. Full writeup:
`mdFiles/steps/48-wave-4-biology.md`.

**2026-11-17 — Step 48, biology batch 5 (PR #119, merged first, cleanly) — plant/cell biology +
biochemistry**, appended to `data/calculators/biology.ts` in parallel with a separate batch-4 agent
on the same file (conflict resolved at merge time against batch 4 above, including the duplicate
`surface-area-to-volume-ratio-calculator` pick — this batch's version was kept since it merged
first). Added
`water-potential-calculator` (Ψ = Ψp + Ψs — fetched OpenStax Biology 2e §30.5 directly for the full
4-term equation and its own "negligible and easily ignored" statement about gravity/matric potential
at the cellular scale, justifying the simplified 2-term formula; reuses the `pressure` dimension,
cross-linked to and distinguished from chemistry's `osmolarity-calculator`/
`vant-hoff-osmotic-pressure-calculator`), `protein-molecular-weight-calculator` (a full 20-standard-
amino-acid composition calculator — new `lib/aminoAcids.ts`, each amino acid's free mass computed
from its formula via the same `molarMassOf`/`ELEMENTS` table `molar-mass-calculator` uses, since a
citable "~110 Da average residue" shortcut could not be sourced via direct fetch this session; worked
example met-enkephalin, 573.665 Da, cross-checked against both its own residue-sum formula and its
known molecular formula C₂₇H₃₅N₅O₇S, and against PubChem CID 42785's listed 573.7 g/mol), `molarity-
for-buffers-calculator` (mass = molarity × volume × molar mass — judged genuinely distinct from
`molarity-calculator`/`moles-to-grams-calculator` since it chains both into the one question a bench
prep actually asks, plus a new `lib/labReagents.ts` reference table of 10 common lab reagents' molar
masses computed from their formulas, not copied from a datasheet), `inheritance-probability-
calculator` (reuses `punnett-square-calculator`'s exact genotype-probability math, relabeled
affected/carrier/unaffected via a new recessive/dominant toggle — cites MedlinePlus Genetics (NIH),
fetched directly, for cystic fibrosis and Huntington's disease as real, non-invented example
conditions), and `surface-area-to-volume-ratio-calculator` (sphere SA:V = 3/r, cube SA:V = 6/s —
built despite the noted batch-4 duplicate-pick risk, since a potometer-based transpiration-rate
alternative could not be confirmed via direct fetch; cites OpenStax Biology 2e §4.1's real red-blood-
cell size figure as one of three worked benchmarks). No new `lib/units.ts` dimension needed. Every
worked-example number re-verified in a standalone Node scratch script (no app imports) before
committing. `npm test` 1503/1503 (snapshot additions additive-only, 238 lines; two new
`KNOWN_NON_FINITE` entries, `protein-molecular-weight-calculator` and
`surface-area-to-volume-ratio-calculator`, both zero-input divide/undefined edge cases), lint clean,
`npm run build` exit 0 (391 calculator pages). Static HTML of all 5 new pages checked directly for
H1/FAQPage JSON-LD (a pre-existing port-3000 dev-server process from another session was left
untouched). **`biology` 15 → 20 on this branch** (merged first; reconciled against batch 4 above —
final combined count after both: `biology` 24, site-wide 395). No seed-list candidate skipped — all
5 scoped slots built, including the judgment call on `molarity-for-buffers-calculator` (built, not
skipped — see the step file for the reasoning).
Full writeup: `mdFiles/steps/48-wave-4-biology.md`.

**2026-11-17 — Step 48, biology batch 6 (PR #120, open, not yet merged) — simple, non-medical
animal biology, the final batch of Wave 4.** `dog-age-calculator` (dog-to-human age conversion
using Wang et al. (2020), *Cell Systems*, "Quantitative Translation of Dog-to-Human Aging by
Conserved Remodeling of the DNA Methylome," fetched directly from PMC7484147:
`human_age = 16 × ln(dog_age) + 31` — a solver with a genuine closed-form inverse both ways, with
content explicitly explaining why the flat "× 7" myth is wrong: a 1-year-old dog computes to 31
human years, not 7), `cat-age-calculator` (same shape, International Cat Care's published chart —
1 year = 15, 2 years = 24, then +4/year, fetched directly — implemented as a 3-piece linear
interpolation so a fractional age also gets an answer, explicitly flagged in content as this
calculator's own interpolation between the chart's published whole-year checkpoints, not an
official month-by-month figure), `animal-gestation-calculator` (one page, species-selector lookup
for dog/cat/cow/horse/goat/sheep/rabbit — same "one page, options-keyed lookup" precedent as
`resistor-color-code-calculator`/`codon-to-amino-acid-calculator`; sourced from Wikipedia's "List
of mammalian gestation durations", fetched directly after Merck Veterinary Manual's own pages
404'd on every direct-fetch attempt, itself citing Doherty/Wildlife Conservation Society, Sacher &
Staffeldt 1974, and Rijnberk & van Sluijs 2005 per species, plus the University of Nebraska–Lincoln
Beef Extension directly for cattle; sheep's source publishes only a single average, no separate
min/max, stated explicitly rather than inventing a range), and `egg-incubation-calculator` (same
lookup pattern for chicken/duck/Muscovy duck/goose/turkey/coturnix quail/bobwhite quail, sourced
from Wikipedia's "Egg incubation" article, fetched directly). No pet medication/dosage calculator
was built, per this step's own gap-check (real veterinary YMYL risk, no licensed-vet review process
on this site).

**Honest skip (5th of 5 planned slots):** a dog/cat body-condition-score calculator was considered
and skipped — BCS is a subjective visual/palpation exam scale (1–9), not a computable formula, so
it doesn't fit this site's calculator format. A pet-food/calorie (RER/MER) calculator was also
attempted, but every direct-fetch attempt at a citable primary source — AVMA, Tufts/Ohio State/
Colorado State veterinary-nutrition pages, WSAVA's and NRC's own PDFs, VetFolio, ScienceDirect, and
NCBI Bookshelf — returned a 404, a reCAPTCHA wall, or JS-rendered content with no formula text ever
reaching the fetch tool. Rather than ship an uncited or memory-recalled RER formula, this batch
ships 4 well-sourced calculators instead of padding to 5, per this project's D17 "honest skip over
padding" discipline — explicitly permitted by this batch's own task brief.

Dog age's `human_age = 16 × ln(dog_age) + 31` formula and cat age's piecewise interpolation were
both checked for closed-form invertibility before being built as a `solver` (both variables use the
'time' dimension; a local `YEAR_SECONDS` constant converts SI seconds to the years the published
formulas are stated in, same self-containment precedent as `centrifuge-rcf-rpm-calculator`'s local
`STANDARD_GRAVITY`). The two lookup pages reuse `dna-to-mrna-calculator`'s `options`-keyed-by-code
mechanism via a new shared `normalizeOptionCode(raw, count)` helper (generalizing the existing
`normalizeBaseCode` to any species count), guarding against the snapshot harness's 1.5× "typical"
input scaling landing on a non-integer/out-of-range code. Every number (both age formulas' round-
trip checks, all 7 gestation-species figures, all 7 incubation-species figures, and every "about Nx
longer/shorter" comparison in the copy) independently re-verified in a standalone Node scratch
script with no app imports; script output matched the copy exactly. Grepped every new id/alias
against all `data/calculators/*.ts` site-wide — zero collisions. `seo.title` 45–57 chars,
`seo.description` 137–141 chars, 6 FAQs and 6 aliases per new page. `npm test` 1529/1529 (snapshot
diff additive-only, 134 lines, touching exactly the 4 new ids — confirmed via `git diff --stat` and
a grep for new `exports[...]` lines; one new `KNOWN_NON_FINITE` entry, `dog-age-calculator`:
`humanAge`, for dog age 0 — its own min — giving `ln(0)`, undefined, guarded explicitly in
`compute()`), lint clean, `npm run build` exit 0 (399 calculator pages). Static HTML of all 4 new
pages checked directly for H1, `FAQPage` JSON-LD, and every template section id (including
`reference-table` on the two lookup pages) — all present. A pre-existing process already listening
on port 3000 was left untouched; no dev server was started by this batch.

**`biology` 24 → 28, site-wide 395 → 399 — this closes out Step 48 / Wave 4 (biology).** Final
count is 28, 2 short of the ~30 seed target, both documented as deliberate: batch 4's confirmed
`generation-time-calculator` duplicate-skip (replaced in-batch with `hemocytometer-calculator`, so
that one didn't actually cost a slot) and this batch's own 1-slot honest skip above. Per D13/D22,
**ecology is next and still needs its own separate go-ahead from the user before any scoping or
work starts** — not begun, not scoped, by this batch. The site has not yet crossed the ~420-
calculator mark that would trigger the next Visual-QA Chrome spot-check (sitting at 399); worth
flagging for whichever category/step crosses that line next.
Full writeup: `mdFiles/steps/48-wave-4-biology.md`.

**2026-11-17 — Step 49, Wave 4 ecology batch 3 (sustainable living / resource use), branch
`step/49-wave-4-ecology-run-3`, PR #123, marked ready for review**: added `car-vs-bike-calculator`,
`tree-benefits-calculator`, `books-vs-ebooks-calculator`, `drip-faucet-waste-calculator`,
`recycling-rate-calculator` to `ecology.ts`. `water-demand-calculator` and
`composting-impact-calculator` were considered and replaced by the drip-faucet and whole-waste-
stream framings, to stay genuinely distinct from batch 1's `water-footprint-calculator`/
`plastic-footprint-calculator`. Every figure fetched directly: EPA GHG Equivalencies Calculator
(gasoline factor reused from batch 1; urban-tree sequestration factor citing McPherson et al. 2016
USDA Forest Service), Kozak (2003, University of Michigan CSS Report CSS03-04 — fetched and read
in full as the published PDF; its own 40-book published totals reproduced exactly as a correctness
check, break-even ≈5 books), EPA WaterSense Fix a Leak Week (the faucet and showerhead drip-rate
statistics independently imply the same 50 gal/year-per-drip rate — cross-checked), EPA's 2018
National Overview (32.1% national recycling-and-composting rate, reusing batch 1's total-MSW-per-
person figure). No new `lib/units.ts` dimensions. `npm test` 1539/1539 (additive-only snapshot
diff), lint clean, `npm run build` 442 routes. Static HTML of all 5 new pages checked directly for
H1 and `FAQPage` JSON-LD. A pre-existing process already listening on port 3000 was left untouched;
no dev server was started by this batch. `ecology` is 10/~25 from this branch's own point of
view — batch 2 (population/biodiversity) is running in parallel on another branch and will need
reconciling at merge time, same as biology batches 2/3 and 4/5 were. Batches 4 (environmental
health) and 5 (round-out) remain TODO. Full writeup: `mdFiles/steps/49-wave-4-ecology.md`.

**2026-11-17 — Step 61 batch 6, `time` (branch `step/61-deepen-time`, PR #127)**: added
`business-days-calculator` (inclusive weekday count between two dates minus an optional holiday
count, explicitly distinct from `date-difference-calculator`'s exclusive calendar-day gap),
`day-of-week-calculator` (Zeller's congruence, fetched from Wikipedia including its own Jan 1, 2000
worked example, cross-checked against native `Date` for 1,255 dates with 0 mismatches; also reports
the ISO 8601 weekday number), `leap-year-calculator` (Gregorian ÷4/÷100/÷400 rule plus an
inclusion-exclusion leap-year count over a range, cross-checked against a brute-force loop across 6
ranges), `unix-timestamp-converter` (epoch seconds ↔ UTC date/time both directions, citing POSIX
§4.16's "seconds since the Epoch" definition and its "every day is exactly 86400 seconds" leap-second
note), and `timesheet-calculator` (weekly day-by-day hours rolled up with an overtime threshold,
explicitly distinct in content from both `work-hours-calculator` and the newer
`overtime-pay-calculator`, whose own FAQ already anticipated this page). All five are plain
date/count/currency values — no new `lib/units.ts` dimension needed, and no `KNOWN_NON_FINITE`
entries needed (checked each one's edge-case snapshot; none have a division-by-input path). Business
days worked example uses MLK Day 2026 (third Monday in January, confirmed via OPM's federal holidays
page) as the holiday. `npm test` 1,552/1,552 (snapshot diff purely additive), lint clean, `npm run
build` 452 static pages. `time` now **10 calculators**, **419 total** on the site. PR opened ready
for review (not draft) since build/lint/test were all green before pushing.

## Pending on the user — not code

- ~~**Cloudflare apex → www 301 (from step 01).**~~ **DONE 2026-10-19** — Redirect Rule added by the user; verified `http://` and `https://dailycalculations.com/<path>?<query>` → 301 to `https://www.dailycalculations.com/<path>?<query>`, www serves 200.
  Cloudflare dashboard → the `dailycalculations.com` zone → **Rules → Redirect Rules** → new rule:
  *If hostname equals `dailycalculations.com` → Static redirect to `https://www.dailycalculations.com`,
  preserve path and query string, status **301**.*
  Do not attempt this in `next.config.ts` — those redirects run inside the Worker, after the request
  has already been served on the wrong hostname.

---

## Parked

Things noticed but deliberately out of scope. Add here instead of fixing mid-step.

- **Two pre-existing duplicate aliases across categories** (found building chemistry run 6,
  2026-11-09, by a manual duplicate-alias sweep across every calculator — there is no automated
  test for this, it is a skill-step manual check): `emi-calculator` and `mortgage-calculator` both
  list "house loan emi calculator"; `solution-concentration-calculator` and `molarity-calculator`
  both list "solution concentration calculator". Neither collision involves a run-6 calculator (run
  6's own near-collision, `serial-dilution-calculator` vs. `dilution-calculator`'s existing "serial
  dilution calculator"/"dilution factor calculator" aliases, was fixed before committing instead of
  parked, since it was this run's own new data). Not fixed — picking which of the two existing
  calculators keeps the shared phrase is a judgment call for whoever touches either page next.
- **Two chemistry run-1 reference citations mismatch their section title and URL** (found building
  chemistry run 3, 2026-11-08, while fetching OpenStax directly to verify run 3's own citations):
  `mass-percent-calculator`'s reference cites url `.../3-3-molarity` labeled "§3.3 'Other Units for
  Solution Concentrations'" — that page is actually §3.3 "Molarity" (confirmed by direct fetch);
  "Other Units for Solution Concentrations" is really §3.4, url
  `.../3-4-other-units-for-solution-concentrations`. `dilution-calculator`'s reference cites that
  same `.../3-4-other-units-for-solution-concentrations` url labeled "§3.4 'Dilutions and
  Titrations'" — that page is actually "Other Units for Solution Concentrations" (confirmed by
  direct fetch), not "Dilutions and Titrations"; the real "Dilutions and Titrations" section's URL
  wasn't located. Both pages' formulas/content are otherwise correct — only the reference citation's
  label/URL pairing is wrong. Not fixed here — out of scope for a run-3 calculator batch.
- **`"house loan emi calculator"` alias is used by both `mortgage-calculator` and `emi-calculator`**
  (both finance category; re-confirmed independently by Wave 2 Construction batches 2, 3 and 4, and
  again by Wave 3 chemistry run 1's alias-collision sanity check (2026-11-07) — never fixed, just
  re-noticed each time). Pick one owner and drop the alias from the other when this gets fixed.
- **`calc.updatedAt` (`data/calculators/types.ts`) has no remaining reader** (found 2026-11-03,
  fixing the sitemap's dates): `app/sitemap.ts` now derives lastmod from git history
  (`lib/gitDate.ts`) instead of this hand-typed field. Left in place on all 154 calculator objects
  rather than mass-removing the field and updating `calculator-template-v2.md`/the `add-calculator`
  skill — out of scope for a date-fix PR. Worth a dedicated cleanup step if it's ever removed.
- **Every `home`-category page's breadcrumb shows "Home" twice** (noticed building step 43-45
  Construction batch 1, 2026-11-02): `Home / Calculators / Home / <Calculator Title>` — the site-root
  crumb (`t('breadcrumbHome')`) and the category-title crumb (`category.title`, which is literally
  "Home") read the same word. Also triggers a React console warning in dev ("Encountered two children
  with the same key, `Home`" in `components/Breadcrumb.tsx:11`, since the crumb's `key={item.name}`
  collides). Reproduced on the pre-existing `paint-calculator` too, so this predates this run and
  isn't something the 5 new calculators introduced. Not fixed here — out of scope for a calculator
  batch; likely fix is keying by index instead of name, and/or giving the category a display label
  distinct from "Home" (the category id can stay `home`).
- **A production build (`npm run build`, webpack) immediately before `npm run dev` left a stale
  `.next` that 404'd every `/categories/<id>` page** (found building step 43-45 Construction batch 1,
  2026-11-02): not a code bug — deleting `.next` and restarting `next dev` fixed it immediately, and
  calculator pages (`/calculators/<slug>`) were unaffected throughout. Noted here only so the next
  agent doesn't lose time on it: run `npm run build` and `npm run dev` with a `.next` cleanup
  (`rm -rf .next`) between them if both are needed in the same session, or just run `dev` from a
  clean checkout before the visual check.
- **Claude in Chrome's `resize_window` didn't change the actual render viewport in this sandbox**
  (found building step 43-45 Construction batch 1, 2026-11-02): called with 390×844, reported
  success, but `window.innerWidth` stayed 1536 and the tab's renderer then hung on the next
  screenshot (had to close and reopen the tab). Desktop-width and dark-mode screenshots of all 5 new
  pages both worked fine and matched the verified numbers exactly; a genuine phone-width screenshot
  of this batch wasn't captured because of this. Not a calculator bug — worth a fresh look (maybe a
  real device-emulation call, or just retrying with a longer wait after resize) before the next
  batch's visual check needs one.
- **`IconTile` has no size between `md` (36px) and `lg` (56px)** (noticed in UX-01, 2026-10-31):
  the homepage redesign brief asked for "~40px" tiles on category cards and "44px" on the Popular
  bento cards — close together, but `IconTile`'s three fixed sizes (28/36/56) can't hit either
  exactly. Used `md` for category and `lg` for Popular, which keeps the intended size hierarchy
  (Popular's tiles visibly bigger) without a pixel-exact match. Add a 4th size only if another
  spot genuinely needs 40–44px.
- **No live browser available to screenshot the UX-01 homepage redesign at 390px / dark mode**
  (found in UX-01, 2026-10-31): Claude in Chrome wasn't connected in that sandbox. Verified via
  rendered HTML + compiled CSS instead (every new grid is `auto-fill`/`auto-fit` + `minmax`, which
  cannot overflow its container, and every new color has a `dark:` pair except the footer and the
  mortgage feature card, both deliberately fixed-color). Worth an actual screenshot pass before/
  after merging PR #38 if a browser is available.
- **The calculator page's header `intro` fallback is dead code** (noticed in UX-02, 2026-10-31):
  `tocItems ? null : <div className="max-w-3xl space-y-3">{intro}</div>` in
  `app/[locale]/calculators/[slug]/page.tsx` only renders when a calculator has no `content`, and
  every one of the 144 shipped calculators now has `content` (verified directly before starting
  UX-02). Left in place rather than deleted — it's a real safety net if a future calculator is added
  without content — but it still uses the old plain alias-sentence/description/byline markup UX-02
  replaced in the `aside`, so the two paths would visibly disagree if the fallback ever did render.
  Worth deciding, in its own small step, whether to delete it or give it the same `HowItWorksCard`
  treatment (it can't show a diagram meaningfully without `content`, but could still show the
  tags/trust row).
- **`npx tsc --noEmit -p tsconfig.json` reports pre-existing errors in two spec files** (found in
  UX-02, 2026-10-31, unrelated to this step's own files): `data/calculators.spec.ts` (11 call sites)
  and `lib/breakdown.spec.ts` (2 call sites) call a function with 1 argument where its signature now
  requires 2 — "Expected 2 arguments, but got 1". `npm run build` (which runs its own TypeScript
  check as part of `next build`) passes cleanly and does not surface these, presumably because
  Next's build-time typecheck doesn't include `*.spec.ts` files the way a plain `tsc --noEmit` over
  the whole `tsconfig.json` does. Not touched — out of scope for a UX step, and `npm test` (which
  actually runs these specs via `node --test`, not `tsc`) is green. Worth a dedicated look at
  whether the call sites or the function signature is the thing that drifted.
- **Shoe pages show EU sizes as decimals (42.67) with a note, instead of as a fraction** (noticed in
  step 42 run 7's review, 2026-10-26). adidas's own chart prints thirds as a fraction (42⅔); this
  site's shoe pages show the exact decimal (42.67) plus a one-line note explaining the fraction it
  represents, rather than a formatted fraction glyph. Could add a thirds-aware formatter (mirroring
  `lib/commonValues.ts`'s `formatFeetInches`/`formatStoneLbs` pattern) if this is worth the
  consistency; not done because it touches `lib/shoeSizes.ts`/`measurements.ts` content that was
  just stabilized by the run 7 pre-merge fix, and run 8 (ring sizes) was the next scoped task.

- **`cups-to-grams-converter`'s ingredient `<select>` uses the density itself as each option's
  value** (step 42 run 6, 2026-10-26). Two ingredients with the same density can't both be listed,
  which is why bread flour (120 g/cup, same as all-purpose) is missing, enforced by a "densities are
  distinct" test. Fix when an ingredient needs it: key options by ingredient id and look up the
  density in `compute()`. Review also corrected the butter page: a US stick is ¼ lb (113.4 g), so
  4 sticks are exactly 1 lb; King Arthur's 113 g is a rounding.

- **`formatDecimal` (`lib/calculator.ts`) hardcodes `'en-US'`** (noticed 2026-10-25, step 42 review).
  It formats the static `content.commonValues` tables, so a UK/EU visitor sees `1,234.56` regardless
  of region. The table is server-rendered (`force-static`, no request headers), so a fix would need
  either a client-side re-format after hydration or an accepted fixed format. CLAUDE.md says never
  hardcode `en-US` — decide which, alongside the region work.

- **Cloudflare "Workers Builds" GitHub check fails on every push** (noticed 2026-10-22, PR #19 onward,
  including `master` commits `1d0ad1c`, `a7a0378`): the user found the build is *skipped* rather than
  failing on code. The local `opennextjs-cloudflare build` passes. Harmless while deploys are manual
  (D11), but the Worker's build settings in the Cloudflare dashboard need a look before relying on
  automatic builds.

- **No list/array input in the calculator kit** (found in step 40, run 2): every `CalculatorInput` is
  a single number, so a calculator that conceptually wants "a list of numbers" (average, and any
  future stats calculator needing one) has to fall back to a fixed number of numbered slots, as
  `gpa-calculator` already did for courses. `average-calculator` and `weighted-average-calculator`
  both do this (8 and 12 slots respectively, half behind an optional disclosure). The initial version
  of `average-calculator` tried to extend GPA's "0 excludes a slot" convention to a plain average,
  which is wrong there: a weight of 0 genuinely removes a component from a weighted sum, but a value
  of 0 is a real data point in a plain list (a test score of 0, say), so silently dropping it is a
  wrong-answer trap, not a convenience. Fixed in the same PR (#16) by adding an explicit
  **"How many numbers?" options field (2-8)**, with `compute()` averaging exactly the first N slots
  in order, zeros included — this is the stopgap pattern worth reusing for any future fixed-slot
  "list" input: a count selector plus array slicing, never an implicit sentinel value, whenever 0 (or
  any other value) is a legitimate data point rather than a true weight. A real list input (add/remove
  rows) would still be a `components/` + `lib/breakdown.ts` change worth its own step once enough
  calculators need one — Wave 1's statistics category (mean/median/mode, standard deviation,
  variance, etc., all genuinely list-based) will hit the same wall repeatedly.
  **Formalized in step 41, run 1**: `data/calculators/statistics.ts` had named, reusable
  `listCountInput`/`listValueInputs`/`readList`/`listGroups` helpers (`MAX_LIST_SIZE = 10`) instead
  of re-deriving the pattern per calculator, used by all 4 list-based calculators in that run
  (mean-median-mode, standard-deviation, variance, percentile).
  **✅ RESOLVED — the real list-input component was built** (between statistics run 1 and run 2, user-
  approved, branch `step/41-list-input`, PR #22): a new `CalculatorInput.type: 'list'` renders as a
  paste-a-list `<textarea>` in the type-B widget (`ListFieldRow` in `components/CalculatorWidget.tsx`),
  parsed by a new pure `lib/listParse.ts` (commas/whitespace/semicolons, no `eval`, bad tokens
  reported and dropped, capped at `LIST_MAX = 1000`). `compute()` gained a second `lists: Record<string,
  number[]>` parameter rather than a union type on `values`, so every pre-existing calculator's
  `compute(values) { ... }` needed zero changes (a function with fewer declared parameters still
  satisfies a type expecting more). Share links serialize a list input compactly
  (comma-joined, re-canonicalized on both write and read, capped at 12,000 characters). Retrofitted
  onto it: `mean-median-mode-calculator`, `standard-deviation-calculator`, `variance-calculator`,
  `percentile-calculator` (statistics) and `average-calculator` (math) — the old
  `listCountInput`/`listValueInputs`/`readList`/`listGroups`/`MAX_LIST_SIZE` helpers are deleted from
  `statistics.ts`. `weighted-average-calculator` is **deliberately not retrofitted** — a two-list
  (values + weights) design needs a length-mismatch guard the kit doesn't have yet; left as paired
  boxes. Full design, snapshot-diff explanation and verification: `mdFiles/steps/41-wave-1-statistics.md`,
  "List input (between run 1 and run 2)".
  **Second instance (step 40, run 4):** `prime-factorization-calculator` hit the same wall with a
  variable-length prime/exponent factorization. Since a factor count can't be sliced by a
  user-chosen "how many," the fix here was a fixed 6 slot pairs plus an honest
  `extraDistinctPrimeFactors` counter (and true, non-derived `distinctPrimeFactors`/
  `smallestPrimeFactor`/`largestPrimeFactor` figures) so the rare case of more factors than slots is
  reported, not silently truncated — a second reusable pattern (count the overflow instead of
  hiding it), still relevant for a variable-*count* list (not just a variable-*length* one) elsewhere
  in the kit. Not affected by the list-input component above, which solves a different problem
  (arbitrarily many individual numbers, not a small fixed set of factor/exponent pairs).
  **New Parked note from this work**: the list parser is not locale-aware (decimals are always a
  dot; a comma is always a separator or a thousands separator, never a decimal mark) —
  `lib/regions.ts` (step 18) will eventually need an EU comma-decimal variant. Also not done:
  mode-as-text output (needs a text-shaped result type through `BreakdownOutput`/`compute()`, a
  separate kit change), and `weighted-average-calculator`'s two-list design (needs a length-mismatch
  guard). **Update (step 41, run 4, 2026-10-23): the length-mismatch guard now exists**
  (`CalculatorBreakdown.pairedLists` + a `compute()`-level length check, built for
  `correlation-calculator`/`linear-regression-calculator` — see that run's entry below) — the
  blocker is resolved, but `weighted-average-calculator` itself is still not retrofitted (out of
  that run's scope; a future step can do it directly with the mechanism already in place).
  **Pre-merge review fix (2026-10-22, same PR #22, before merge)**: `parseNumberList` silently gave a
  wrong answer on a thousands-separated paste — `"1,000, 2,500, 3,000"` parsed to
  `[1, 0, 2, 500, 3, 0]`, every comma having always been a value separator with no exception — and
  dropped a typographic minus (U+2212, what real browsers/Word actually paste, not the ASCII hyphen),
  a leading currency symbol, and a trailing `%` entirely. Fixed: a token's comma(s) are read as
  thousands separators only when the whole input also uses some other separator (space/newline/
  semicolon) between values — a bare comma-only input (`"100,200,300"`) keeps every comma as a plain
  separator, unchanged, since the two readings are genuinely indistinguishable from the text alone
  without that signal. Made visible, not silent: `ParsedList.groupedAsThousands` names every value
  read this way, and `ListFieldRow` shows a dedicated (non-error) note saying so. Also normalizes a
  leading U+2212/en-dash minus, a leading `$ £ € ₹ ¥`, and a trailing `%` (45% reads as 45). One
  known, accepted residual gap, documented in `lib/listParse.ts`: multiple newline-separated *lines*
  that are each themselves a bare comma-list (`"100,200,300\n400,500,600"`) still read every in-line
  comma as thousands-grouping, since the rule is evaluated over the whole input and a newline exists
  somewhere in it — not in the fix's required test list, follows the stated rule literally rather
  than inventing an extra per-line heuristic. Full writeup, the exact disambiguation regex and all
  new tests: `mdFiles/steps/41-wave-1-statistics.md`, "Pre-merge review fix". `npm test` 403/403
  (up from 387), `npm run lint`, `npm run build` all pass; no existing snapshot changed (parser/widget
  only, `compute()` untouched).
- **Statistics run 5 residual gaps** (found step 41, run 5, 2026-10-23 — statistics sub-wave now
  complete at 25/25): the Haldane-Anscombe correction `relative-risk-calculator`/
  `odds-ratio-calculator` apply for a zero cell is a standard, named fix, but it is also known in
  the methods literature to introduce a small bias into the point estimate itself, not just the
  interval — stated in a watch-out item on both pages, no deeper alternative (exact/mid-p methods)
  built. Neither calculator builds a full contingency-table/stratified (Mantel-Haenszel) UI, a
  single 2x2 table only, matching `chi-square-calculator`'s own scope decision.
  `coefficient-of-variation-calculator`'s summary-statistics mode cannot distinguish a population
  SD from a sample SD (both rows show the same number when one SD is entered directly) — stated
  honestly, not guessed; a future redesign could add a type selector if it turns out to matter.
  `outlier-calculator`'s z-score cross-check uses the plain mean/population-SD version with the
  conventional |z| > 3 threshold, not NIST's own currently-recommended modified z-score (median/
  MAD-based, threshold 3.5) — stated as a real, cited difference on the page itself. Full detail:
  `mdFiles/steps/41-wave-1-statistics.md`, "Run 5" section.
- **`CompareBars` silently caps at 4 bars** (`components/visuals/CompareBars.tsx`: `bars.slice(0, 4)`,
  found in step 40, run 2 while designing `average-calculator`): the prop comment already says "2-4
  bars," so this is documented behavior, not a bug, but it means a visual cannot show more than 4
  individual values side by side. `average-calculator` works around it by charting the derived
  min/average/max (3 bars) instead of the raw value slots, which stays correct regardless of how many
  of the 8 slots are in use.

- ~~**`pregnancy-due-date-calculator` has a hardcoded "today"** (`new Date(2026, 5, 17)` in `compute`).
  Gestational age and days remaining are frozen at 2026-06-17: defaults (LMP 2026-03-01) give
  `gestationalWeeks` 15.43 / `daysRemaining` 172 on any date; LMP 2027-04-10 gives
  `gestationalDays` 0 / `daysRemaining` 591. Needs a real current date (client-side, after hydration,
  since pages are force-static). Found in step 17; the snapshot pins today's behavior.~~
  **Fixed 2026-10-13** on fix/pregnancy-today
- **`bmi-calculator` returns `NaN` at its own `min`** (`height` min is 0 → `bmi` = 0/0). Either
  `min` > 0 or a guard. Recorded in `KNOWN_NON_FINITE` in `data/calculators.spec.ts`. Found in step 17.
- ~~**`mortgage-calculator` input labelled "Loan amount" is really the home price**: `compute`
  subtracts `downPayment` from it (350,000 − 70,000 → principal 280,000), and the example line says
  "a $350,000 home". Relabel (copy only) during the Batch 1 v2 conversion. Found in step 17.~~
  **Fixed in step 35** (label "Home price"; input id unchanged).
- `app/[locale]/layout.tsx` exports static `metadata` *and* pages export `generateMetadata` with
  overlapping OG/Twitter blocks — the same title string lives in four places. Collapse into
  `lib/seo.ts` helpers. (§4.6)
- Decide whether the `[locale]` directory segment is worth keeping at all once English-only settles.
  Keeping it costs nothing and preserves the option to re-add languages; revisit only if it causes
  friction.
- **Middleware edge-bundle diet.** `lib/redirects.ts` imports all of `data/calculators.ts` to build
  a 6-entry redirect map, costing +95 KB raw / ~81 KB gzipped in the middleware bundle (step 06).
  A build-time codegen step emitting a literal map would remove it. Not worth doing until the
  Workers bundle size actually pinches.
- **Category and listing pages still emit no JSON-LD.** `/categories/<id>` and `/calculators` have
  no `BreadcrumbList` and no `ItemList`, and no visible breadcrumb. Deliberately out of scope in
  step 07 (calculator pages only). `components/Breadcrumb.tsx` is generic and would drop straight
  in. ~~Worth doing once the category restructure (step 16) settles the names.~~ **Step 16 is done,
  so this is now unblocked.**
- ~~**`common.tools` has no ICU plural**~~ **Fixed 2026-10-12** (merged to master with the v2 preview) — `"{count} tools"` renders **"1 tools"** on the `education`
  card. Pre-existing (that category has always had one member) and visible on the homepage,
  `/categories` and `/calculators`. Fix is `{count, plural, one {# tool} other {# tools}}` in
  `messages/en.json`. Found in step 16; not fixed there because it is a copy bug, not a taxonomy one.
  Step 26 takes `education` to 5 members but the bug survives for any future 1-member category.
- `graphing calculator` — dropped from the keywords array in step 09; genuinely hard to build and
  not worth it. Do not resurrect without a reason. (§1.6)
- **Dead Tailwind brand shades.** `tailwind.config` defines `brand` at `50 / 100 / 500 / 700`
  only, but components reference `brand-200`, `brand-300`, `brand-400`, `brand-600` and
  `brand-800` — `CalculatorCard`'s `hover:border-brand-200`, the layout's `dark:text-brand-300`,
  and others. Those classes are never generated, so the styles silently do nothing. Found in
  step 09 when the active filter chip rendered white-on-white. Fix is to either fill in the
  palette or normalize every call site onto the four real shades — a site-wide visual change,
  so not done mid-step.
- **`npm run lint` fails on `.open-next/` build output** (115 errors, all inside the OpenNext
  artifact folder left by `npx opennextjs-cloudflare build`). Source code is clean with
  `npm run lint -- --ignore-pattern ".open-next/**"`. Fix: add that ignore pattern to the `lint`
  script. Found 2026-10-12 on branch `preview/physics-force-calculator`.
- ~~**`.claude*` is gitignored**~~ **Done 2026-10-12**: all of `.claude/` is tracked (shared
  `settings.json`, skills, agents). Only `.claude/settings.local.json` is ignored.
- **Preview merged to `master` 2026-10-12** (fast-forward, commits `f17b7de` + `534b8a0`; not deployed. The user will deploy manually after the full rollout). Was branch `preview/physics-force-calculator`: a demo of the
  `mdFiles/omni-strategy.md` v2 template. It adds `force-calculator`, a `physics` category,
  `lib/units.ts`, `components/SolverCalculator.tsx` (solve for any field, unit switching, share
  link, copy, reset, log-scale benchmarks), and the TOC / concept / references / byline sections.
  It also fixes the `common.tools` ICU plural ("1 tools"). Spec: `mdFiles/calculator-template-v2.md`.
  **Next:** fold `mdFiles/calculator-rollout-plan.md` (E1–E7, batches 1–5, waves 1–4) into the step
  index once the user settles its three open decisions (pace, step-11 gate, sector order).
  **Workflow (user decision, changed 2026-10-13, see D11):** one batch agent at a time pushes a
  branch + opens a PR, the main session merges each passing PR without asking, and the user never merges. No Cloudflare changes and no deploys until the user deploys
  manually after the rollout.
- **`force-calculator` scale tick labels sit at even spacing, not at their log positions.** The
  range is 10^-2 to 10^9, so "1 N" belongs at 18%, not 25%, and "1 kN" at 45%, not 50%. The
  benchmarks and marker are placed correctly. Kept as-is in step 32 because the force output had
  to stay visually identical. The fix is evenly spaced exponents (e.g. 10^-2 … 10^10 in steps of 3)
  or positioned ticks in `LogScale`.
- **Superseded step-33 attempt to clean up** (found in step 33): branch `step/33-breakdown-widget`
  (local + origin), draft PR #6, and the worktree `.claude/worktrees/agent-a0c418cb814f507e7`.
  Close #6 and remove the worktree (`git worktree remove`) once PR #7 is merged. Until then,
  `npm run lint` also lints the worktree's files and fails on them: use
  `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`.
- ~~**Currency symbol differs between the widgets**~~ — **resolved 2026-10-20** (`fix/currency-symbol`): the `currency` unit label in `lib/units.ts` now comes from `currencySymbol()` in `lib/calculator.ts`, the single source step 18 makes region-aware.
- **No growth-curve visual in the kit** (found in step 35): the rollout plan asks for a growth
  curve (contributions vs interest over time) on compound-interest and investment. Those use a
  Donut for now. Add a `GrowthCurve` (stacked area by year) to `components/visuals/` in its own
  step, then switch both calculators to it.
- **No "tier bar" visual for a user-editable rate threshold** (found in step 38, batch 4):
  electricity-bill's plan calls for a bar showing the two pricing tiers, but every kit visual with
  bands (`RangeBar`) takes its bands as literal numbers fixed at config time, not from an input the
  reader can change (`tieredThreshold`). Using CompareBars (energy charge vs. total bill) instead.
  A genuinely reactive tier visual would need a new component that reads band edges from `all`,
  not from static config — worth it only if more tiered-rate calculators are added later.
- **No top-down floor-plan SVG in the kit** (found in step 38, batch 4): furniture-fit's plan calls
  for an actual floor-plan illustration (room outline, furniture rectangle, clearance strip). Used
  `RangeBar` on the derived `tightestMargin` instead (bands: won't fit / tight / comfortable /
  spacious) — arguably a better fit for "does it fit" than a literal drawing would have been, but
  it is still a stand-in for the plan's visual, not the visual itself.
- **`codes.iccsafe.org` 403s to fetches** (found in step 38, batch 4, same symptom as CFPB in run 1):
  the ICC's own free code viewer blocks automated fetches. `up.codes` (a free, widely-used code-text
  mirror) was used instead for both IRC citations on furniture-fit-calculator. Revisit if a cleaner
  primary-source route turns up.
- `mdFiles/instructions.md` (§ file table, ~line 527) still lists `components/PaycheckCalculator.tsx`,
  deleted in step 35. Paycheck's US tax figures now live in `data/calculators/finance.ts`
  (`PAYROLL_2026`) and need a yearly update each October/November (IRS Rev. Proc., SSA wage base).
- Baidu SEO for mainland China. Needs an ICP licence and separate tooling; Cloudflare is unreliable
  behind the GFW. The `CN` region profile is for Chinese speakers elsewhere. (§3.5)
- ~~The four alias stubs return 307~~ — **done in step 03.** They are 301s in `middleware.ts` now
  and the stub page files are deleted.
- **Kit gaps from step 36** (nearest kit component used instead): a stacked bar (sales tax: Donut
  used), per-person chips (tip: Donut with the per-person share in the center), a strikethrough price
  card (discount: CompareBars), a thermometer (fahrenheit-to-celsius: RangeBar) and a common-values
  table (gallons, miles, pounds: LogScale with benchmarks). Add to `components/visuals/` in their own
  step if wanted.
- **Sub-cent money in the solver** (found in step 36): `SolverCalculator` and the kit round currency
  to cents, so a $0.2496 unit price shows as $0.25. Unit price works around it with per-100 outputs.
  Step 18 (region formatting) could show 3–4 decimals for money below $1.
- **Duplicate alias** (found in step 36): `house loan emi calculator` is on both `emi-calculator` and
  `mortgage-calculator`. Pick one.
- **Kit and widget gaps from step 38** (nearest kit component used instead): a cost-per-mile chip
  (gas-cost: CompareBars one way vs round trip). **Widget gaps:** the solver prints a `fuelPrice`
  value as "3.75 $/gal (US)" (significant figures, symbol after) rather than "$3.75/gal"; type-B
  outputs have no unit menu, so fuel-cost / ev-charging / commute results stay per 100 **miles** and
  range in miles when inputs are metric, and commute's wear allowance stays per mile (no money-per-
  distance dimension); ev-charging's battery has no unit menu (the `energy` menu offers J, cal, BTU…)
  and its yearly savings are fixed at 12,000 miles inside `compute()`; ev-charging charges to 100%
  only (no target-charge input). Changing those needs `compute()` changes (snapshot) or widget work.
- **Kit and widget gaps from step 38 run 2** (nearest kit component used instead): bags-needed chips
  (concrete: CompareBars 80 lb vs 60 lb bags), a can-count row (paint: CompareBars gallons needed vs.
  whole cans to buy), a grid illustration (tile: CompareBars exact tiles vs. with waste), a roll-count
  row (wallpaper: CompareBars exact rolls vs. rolls to buy). **Reference gap:** the Tile Council of
  North America's specific waste-factor percentages by layout (10%/15%/20%) could not be confirmed
  from a free source — `tcnatile.com/faqs` and the TCNA Handbook PDF both 404'd, and the Handbook is a
  $55 paid publication. `tile-calculator`'s copy cites TCNA generally and the Ceramic Tile Education
  Foundation, and keeps the 10% default worded as "a common starting point" rather than a cited exact
  figure. Revisit with a TCNA Handbook copy or another primary source if one turns up.
- **Kit and widget gaps from step 37** (nearest kit component used instead): a three-tier bar
  (calorie: CompareBars), a stacked bar (TDEE: Donut), a glasses-per-day row (water: CompareBars vs
  NASEM), a splits / race-predictions table (running pace: CompareBars of Riegel times).
  **No mm:ss / h:mm:ss formatting**: pace and times show decimal minutes (8.047 min/mi, not 8:03).
  **No combined ft + in height input** (BMI, calorie, TDEE take one unit). BMI's healthy-range
  outputs are fixed to lb until the region step picks units.
  **No date picker**: pregnancy-due-date still takes year / month / day number fields (the rollout
  plan adds a picker with date-difference in batch 5). Its cycle-length adjustment moves the due and
  conception dates only; weeks pregnant are counted from the LMP, as before.
- **Monetization/content ideas from the 2026-11-08 competitive-positioning report, not addressed by
  D14**: email capture, downloadable checklists (mortgage-prep, solar-buyer, etc.), affiliate
  placements, and lead-generation "request a quote" flows (solar installers, insurance, mortgage
  pre-qualification). These are business decisions, not architecture ones — D14 only approved
  scoping the **Guide** content type (`mdFiles/guide-content-plan.md`) and queuing **Wave 5**
  (`mdFiles/omni-strategy.md` §4.5). Revisit explicitly if/when monetization beyond the already-
  planned ad slots (§5 of `omni-strategy.md`) becomes a live decision.
