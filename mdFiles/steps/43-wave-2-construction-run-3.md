# Step 43 — Wave 2 Construction, run 3

Third Construction batch scoped in `mdFiles/steps/43-45-wave-2-construction-food-sports.md`.
Widens the existing `home` category (same id) with 5 calculators: mulch, topsoil, retaining
wall, board foot, AC tonnage/BTU. Follows the v2 template and the `add-calculator` skill.
Reference implementations: the 16 existing `home.ts` calculators, especially `gravel-calculator`/
`sand-calculator` (area × depth ÷ 27 density pattern) and `paver-calculator` (material + base
layer on one page).

## Picks and why (5 of the 13 remaining candidates)

Remaining candidates per the step-43–45 scope doc: mulch, topsoil, insulation, flooring, carpet,
stair, retaining wall, board foot, rebar, pool/tank volume, siding, AC tonnage/BTU, framing/stud.
Picked, on real DIY/homeowner search volume and distinctness from what already shipped:

1. **Mulch** — very high seasonal homeowner search volume ("how much mulch do I need"); pairs
   naturally with topsoil and the existing gravel/sand pattern, but mulch is sold in bags as often
   as bulk, so it gets its own bag-size field rather than reusing the tons-by-density shape as-is.
2. **Topsoil** — same high seasonal garden-material search volume as mulch; shares the tons-by-
   density shape with gravel/sand (batch 1) almost exactly, but is a distinct, frequently-searched
   material.
3. **Retaining wall** — real DIY/landscaping project, distinct from the brick/paver wall-area math
   already shipped (adds courses, a manufacturer's base-trench formula, and cross-links to gravel).
4. **Board foot** — the standard lumber-buying unit; real contractor/DIY search term, and distinct
   from the linear/area-based lumber calculators already shipped (decking, fence) because it is a
   volume unit with its own nominal-vs-actual-dimension trap worth explaining.
5. **AC tonnage/BTU** — explicitly flagged in the scope doc as "very high search volume" ('what
   size air conditioner do I need'); broadens the category beyond pure material-quantity calcs.

Skipped this round: insulation, flooring, carpet, stair, rebar, pool/tank volume, siding,
framing/stud — left for a later batch (`43-45` Progress list updated below).

## Sources fetched directly

- **ENERGY STAR / U.S. EPA–DOE, "ENERGY STAR Qualified Room Air Conditioners" fact sheet** (PDF,
  June 2003, `energystar.gov/ia/partners/manuf_res/marketing_res/ROOM_AIRCONDITIONER.pdf`; fetched
  and read directly) — the official area-to-BTU/hr sizing table (100–1000 sq ft, 9 bands) and the
  four "Special Considerations" adjustments (shaded −10%, sunny +10%, kitchen +4,000 Btu/hr, each
  occupant beyond two +600 Btu/hr), still the standard EPA/DOE room-AC sizing chart. **Table
  transcription note:** the PDF's own table text is ambiguous at one boundary (OCR reads "450 to
  550" immediately followed by "500 to 700", which overlap); the fact sheet's own worked example
  ("if the room measures 525 square feet... a capacity of 14,000 Btu/hr") only resolves to a
  consistent, non-overlapping table if the true boundary is 450–500 sq ft → 12,000 and 500–700 sq
  ft → 14,000, so that is the reading used here and verified against the stated example in the
  scratch script.
- **Allan Block (allanblock.com), "How to Install a Retaining Wall" / "Basic Installation"
  installation guide** (fetched directly) — base trench depth "6 in. (150 mm) plus an additional
  1 in. (25 mm) for each 1 ft. (300 mm) of wall height," trench width "24 in. (600 mm)" for
  standard walls (18 in. for walls under 4 ft), and a minimum 6 in. of compacted wall rock base.
- **SiteOne Landscape Supply, Allan Block Classic Wall product listing** (retailer spec page,
  fetched via search) — AB Classic block face dimensions 18 in. (L) × 8 in. (H), i.e. 144 in² =
  exactly 1 sq ft of wall face per block — used as the calculator's default block size.
- **Virginia Cooperative Extension, SPES-661P, "Mulching: Purpose, Benefits, and Essential
  Information"** (Garrity & Tierney, 2025; fetched as PDF, read directly) — recommended mulch
  depth "generally 2-4 inches," "do not apply or let mulch build up to a depth greater than 4
  inches," 2–3 in. for trees/shrubs, 1–2 in. for fine/double-shredded mulch.
- **Mulch Pros Landscape Supply, "Material Weight and Coverage"** (already cited in
  `gravel-calculator`; a real aggregate/landscape yard, fetched directly) — mulch coverage-per-
  cubic-yard figures (162 sq ft at 2 in., 108 sq ft at 3 in.), used as an independent cross-check
  of this calculator's area ÷ depth ÷ 27 geometry (both match exactly).
- **EarthStone Rock, "Cubic Yards vs. Tons for Landscape Rock"** (already cited in
  `gravel-calculator`; a real aggregate/landscape yard, fetched directly) — topsoil weighs "about
  2,000 lb" (≈1.0 ton) per cubic yard dry, more when wet; used as the topsoil-calculator's default
  density.
- **USDA Forest Service, Forest Products Laboratory, Wood Handbook: Wood as an Engineering
  Material (Centennial Edition, General Technical Report FPL-GTR-190), Chapter 6, "Commercial
  Lumber, Round Timbers, and Ties" (David E. Kretschmann)** (fetched as PDF, read directly) —
  "Lumber length is recorded in actual dimensions, whereas width and thickness are traditionally
  recorded in 'nominal' dimensions—actual dimensions are somewhat less," and Table 6–6's actual
  dressed sizes for standard nominal lumber (e.g. nominal 2 in. thickness dresses to 1-1/2 in.;
  nominal 6 in. width dresses to 5-1/2 in.) — used for the board-foot-calculator's nominal-vs-
  actual explainer and its "about 31% low" worked-example claim (verified in the scratch script).
  The 144-cubic-inch board-foot definition and the T(in) × W(in) × L(ft) ÷ 12 formula itself are
  common lumber-industry arithmetic (144 in³ = 1 in × 12 in × 12 in), cross-checked against this
  same Wood Handbook chapter's "BD FT" / board-measure references and Purdue Extension FNR-191
  (log-scaling, consulted but not the primary cite — its rules are for standing-timber volume,
  not dimensional-lumber buying, so it is not used as the board-foot formula's citation).

## Progress

- [x] Dedupe check (ids + aliases, programmatic grep) — no collisions
- [x] Sources fetched directly and independently verified (scratch script `verify_run3.mjs`)
  before writing copy
- [x] `mulch-calculator` (committed)
- [x] `topsoil-calculator` (committed)
- [x] `retaining-wall-calculator` (committed; cross-linked `gravel-calculator`/`brick-calculator`
  to it)
- [x] `board-foot-calculator` (committed)
- [x] `ac-tonnage-btu-calculator` (committed)
- [x] Append all 5 ids to `calculatorOrder` in `data/calculators/index.ts`
- [x] `npm test` (770/770; `npm run test:update` run once after all 5 were added, diff touched
  only the 5 new ids' snapshots)
- [x] `npm run build` (187 static pages, +5 as expected)
- [x] `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` (clean)
- [x] Programmatic dataset check (`check_run3.mjs`): ids unique, no self-reference in `related`,
  no alias collisions, `seo.title`/`seo.description` within budget (caught and fixed two
  over-160-char descriptions — `mulch-calculator`, `board-foot-calculator`), 4+ aliases, 5–8 FAQ
  entries, glyph uniqueness within `home` (21 calculators, all distinct: `gal ft² yd³ roll fit
  kWh sht brk grv snd bag fnc dek sq X12 pvr mul soil wall bft btu`)
- [x] Page check: `curl` every new `/calculators/<id>` page — H1, JSON-LD and every content
  section (`worked-example`, `formula`, `faq`, `references`) present on all 5; `/categories/home`
  shows "21 calculators". Per the CLAUDE.md update mid-run (batch Chrome/dark-mode visual QA
  across ~50 calculators instead of per-batch), a full desktop+dark-mode Chrome pass was **not**
  run for this batch — noted as deferred, not skipped. Running total toward the next ~50-calculator
  visual pass: this run brings Wave 2 Construction to 21 `home` calculators (16 pre-run-3 + 5 here);
  no Chrome visual pass has been done since Wave 2 batch 2 (16 calculators) — next pass should
  cover drywall through ac-tonnage-btu (batches 1–3, 21 calculators) once a later batch pushes the
  total meaningfully past 50 combined with other sectors.
- [x] Dev server confirmed stopped (port 3000 free)
- [ ] Update `mdFiles/STATUS.md` — left to the main session per the task instructions
- [ ] `gh pr ready`

## Note: concurrent CLAUDE.md change mid-run

Partway through this run, a commit titled "strategy change" (`87e1322`, authored by the repo
owner) landed on this same branch, updating `CLAUDE.md` with two new rules: (1) batch Chrome
visual QA across ~50 new calculators instead of once per batch, and (2) read one representative
calculator as a pattern reference instead of a whole category file. That same commit also carried
this run's in-progress `home.ts`/`index.ts` edits (made just before it landed) verbatim — nothing
was lost or overwritten. This run's remaining steps (snapshot update, build, lint, dataset check,
page check) follow the updated policy, in particular skipping the per-batch Chrome/dark-mode pass
as noted above.
