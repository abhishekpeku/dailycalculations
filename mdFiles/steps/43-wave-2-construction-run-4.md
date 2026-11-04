# Step 43 — Wave 2 Construction, run 4

Fourth and (per the scope doc) likely final Construction batch, scoped in
`mdFiles/steps/43-45-wave-2-construction-food-sports.md`. Widens the existing `home` category
(same id) with 6 calculators: insulation, flooring, carpet, stair, rebar, pool/tank volume.
Follows the v2 template and the `add-calculator` skill. Reference implementations: the 21 existing
`home.ts` calculators, especially `board-foot-calculator` (single-reference-source precedent) and
`ac-tonnage-btu-calculator` (published-table-driven compute, dropdown `options` pattern).

## Picks and why (6 of the 8 remaining candidates)

Remaining candidates per the step-43–45 scope doc: insulation, flooring, carpet, stair, rebar,
pool/tank volume, siding, framing/stud. Picked on real DIY/homeowner search volume, distinctness
from what already shipped, and — this round especially — on whether a real primary source could
actually be fetched and read directly (not just search-summarized; see "Sourcing notes" below):

1. **Insulation** — explicitly flagged in the scope doc; very high homeowner search volume
   ("how much insulation do I need," "attic R-value").
2. **Flooring** — general laminate/vinyl-plank/engineered-wood flooring sold by the box, distinct
   from tile-calculator's per-tile math; high search volume.
3. **Carpet** — sold by the square yard off a fixed-width roll, a genuinely different buying unit
   and seam consideration from flooring-calculator's boxes; high search volume.
4. **Stair** — rise/run/riser-count from total floor-to-floor height; a real, frequently-searched
   DIY/building-code question with an excellent, directly-readable primary source (a city building
   department's own IRC code handout).
5. **Rebar** — explicitly suggested in the task brief, cross-links naturally to
   `concrete-calculator`; real DIY/contractor concrete-work search term.
6. **Pool/Tank Volume** — explicitly flagged "very high search volume" in the scope doc; gallons
   from shape + dimensions is one of the most common home-maintenance lookups there is.

Skipped this round, left for a later batch if construction is ever revisited:

- **Siding** — squares-needed-by-wall-area is close enough in shape to the already-shipped
  `roofing-calculator` (area ÷ 100 = squares, + waste%) that it reads as a thin variant rather than
  a distinctly different calculation; lower homeowner DIY search volume than the six built here.
- **Framing/Stud** — genuinely a different formula (studs by wall length ÷ spacing + corners/
  openings), but a narrower, more contractor/framer-facing search than the six homeowner-facing
  picks above; parking it keeps this closing batch focused.

Both are now in `mdFiles/STATUS.md`'s Parked list (added by the main session after review) rather
than forced into this batch — per the task's explicit permission to land on 4, 6 or 7 instead of a
strict 5 when the cut is awkward. **This closes out the Wave 2 Construction sector**: `home` goes
from 21 to 27 calculators.

## Sourcing notes — several leads were dropped for not surviving a direct read

Per `mdFiles/calculator-template-v2.md` §3 ("Read sources directly... one summarizing fetch
returned different constants on two passes") and the add-calculator skill, every number below was
read from the primary document itself, not a search-engine summary. Several otherwise-plausible
sources were dropped mid-research for failing this bar, which shaped the final designs:

- **Owens Corning AttiCat's own bag-coverage-by-R-value chart** could not be independently
  verified: two different fetch attempts (the `.ca` product page vs. the `.us` product page)
  returned different numbers for the same R-60 figure (30.5 vs. 31.8 sq ft/bag), and the PDF
  fact sheets are image-based (no extractable text layer; `pdftoppm`/poppler is not installed in
  this environment, so even a direct page-render read wasn't possible). Rather than cite an
  unverified manufacturer chart, `insulation-calculator` uses the directly-verified ENERGY STAR
  R-value-by-zone table as its sourced core figure, and treats "coverage per bag" as a clearly
  labeled placeholder field the shopper fills in from their own product's bag label — the same
  pattern `board-foot-calculator` already uses for its per-board-foot price.
- **ACI 318's lap-splice length** (the common "40× bar diameter" rule of thumb) could not be
  read from ACI 318 itself (paywalled standard) or from a secondary technical bulletin that quotes
  it (the one found, Element ICF's TB-4, returned HTTP 403 to both the fetch tool and a direct
  `curl`). Multiple independent web searches consistently reported the same absolute minimum
  (12 in, regardless of bar size/diameter calculation), so `rebar-calculator` is scoped around the
  two facts that *were* independently, directly verified instead — the common residential
  12-in-on-center grid spacing convention and the 20 ft retail stick length (confirmed directly
  from both Home Depot's and Lowe's own product listings) — with splice overlap handled only as
  general, non-numerically-cited advice in the copy (see `watchOut`).
- The **National Wood Flooring Association's** installation-guidelines PDF and the **Carpet and
  Rug Institute's CRI-105** installation standard both looked unreadable through the `WebFetch`
  tool's own summarizer (it reported "encoded/compressed" content), but both are genuine text-layer
  PDFs — downloading them with `curl` and extracting text with `pdftotext` (available via the
  environment's mingw64 toolchain even though `pdftoppm`/poppler is not) worked cleanly and
  surfaced the real NWFA "actual square footage... plus 5% cutting allowance for standard
  installations" line (`flooring-calculator`'s core figure) and confirmed CRI-105 does **not**
  itself state a waste percentage (so `carpet-calculator`'s waste-allowance default is disclosed
  as ordinary practice, not attributed to CRI — only the 12/13.5/15 ft roll-width fact, read
  directly off CRI's own "Specifying the Right Carpet" page, is attributed to CRI).

## Sources fetched/read directly

- **U.S. EPA/DOE ENERGY STAR, "Recommended Home Insulation R-Values"**
  (`energystar.gov/saveathome/seal_insulate/identify-problems-you-want-fix/diy-checks-inspections/insulation-r-values`;
  fetched directly, cross-checked across two independent fetches with identical numbers) — the
  2021 IECC-based attic R-value-by-climate-zone table: Zone 1 → R-30, Zones 2–3 → R-49, Zones
  4A/4B, 4C/5/6 and 7/8 → R-60 (for an uninsulated attic).
- **International Residential Code §R311.7.5, Stair Treads and Risers**, as reproduced verbatim
  in the City of Boise, Idaho Planning and Development Services' own "IRC Code Handout #437"
  (`cityofboise.org/media/14405/437-treads-risers_march-2022.pdf`; downloaded and read directly,
  text-layer PDF, no summarizer needed) — maximum riser height 7¾ in, minimum tread depth 10 in
  (11 in to avoid a nosing requirement), the 3/8 in largest-to-smallest riser/tread variance rule,
  and the stairway diagram's 6 ft 8 in minimum headroom.
- **The Home Depot** (`homedepot.com/p/1-2-in-x-20-ft-4-Rebar-PAR602004/205370252`) and **Lowe's**
  (`lowes.com/pd/Steel-Rebar-Common-0-5-in-x-20-ft-Actual-0-5-in-x-19-9167-ft/3010016`) own #4
  rebar product listings — both confirm 20 ft as the standard U.S. retail rebar stick length.
- **Leslie's Pool Supplies, "How To Calculate Pool Volume"**
  (`lesliespool.com/blog/calculating-pool-volume.html`; fetched directly) — the pool industry's own
  published formulas for rectangular (L × W × avg. depth × 7.5), circular (π × r² × avg. depth ×
  7.5) and oval (π × L/2 × W/2 × avg. depth × 7.5) pool volume in US gallons, and the
  shallow-plus-deep-divided-by-2 method for average depth.
- **NIST Special Publication 811, Appendix B: Conversion Factors** (already the site's own units
  source, `lib/units.ts`) — the exact US gallon (7.48052 gal/ft³), used in `pool-volume-calculator`'s
  copy to show the industry's 7.5 rounding is about 0.26% high, not to replace it as the headline
  figure (the industry's own published formula is what people actually use to dose chemicals).
- **The Carpet and Rug Institute, "Specifying the Right Carpet"**
  (`carpet-rug.org/carpet-for-business/specifying-the-right-carpet/`; fetched directly) — broadloom
  carpet's three standard widths, 12 ft, 13.5 ft and 15 ft. **CRI-105, Standard for Installation of
  Residential Carpet** (2019 PDF, downloaded and read via `pdftotext`) was also read in full as a
  second reference for seaming/installation procedure, but does not itself state a waste
  percentage — none is attributed to it.
- **National Wood Flooring Association, Installation Guidelines — Wood Flooring**, Section I
  Chapter 2 "Jobsite Checklist" (rev. June 2002; downloaded from a floorreports.com mirror and read
  via `pdftotext`) — "Minimum material requirements should equal actual square footage of installed
  area plus 5% cutting allowance for standard installations," `flooring-calculator`'s core figure.

## Progress

- [x] Dedupe check (ids + aliases, programmatic grep against the whole dataset) — no collisions
- [x] Sources fetched/read directly and independently verified (scratch script `verify_run4.mjs`)
  before writing copy
- [x] `insulation-calculator`
- [x] `stair-calculator`
- [x] `rebar-calculator`
- [x] `pool-volume-calculator`
- [x] `carpet-calculator`
- [x] `flooring-calculator`
- [x] Append all 6 ids to `calculatorOrder` in `data/calculators/index.ts`
- [x] Cross-linked `rebar-calculator` into `concrete-calculator`'s `related`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`
- [x] Programmatic dataset check (`check_run4.mjs`): ids unique, no self-reference in `related`,
  related ids all exist, no alias collisions, `seo.title`/`seo.description` within budget, 4+
  aliases, 5–8 FAQ entries, glyph uniqueness within `home`
- [x] Page check: `curl` every new `/calculators/<id>` page — H1, JSON-LD and every content section
  present
- [x] Dev server confirmed stopped (port 3000 free)
- [x] Cross-checked the actual shipped `compute()` functions against every worked-example/FAQ
  number (21/21 checks passed, see PR description)
- [ ] Update `mdFiles/STATUS.md` — left to the main session per the task instructions
- [x] `gh pr ready`

## Pre-existing issue found, not fixed (out of scope for this batch)

`check_run4.mjs`'s alias-collision sweep (run against the whole dataset, not just these 6) found
one pre-existing collision unrelated to this batch: the alias `"house loan emi calculator"` is
used by both `mortgage-calculator` (finance) and `emi-calculator` (finance). Per this task's scope
("build only the calculators you were asked for... put anything else on the Parked list"), this
was left alone and is called out here for the main session to add to `STATUS.md`'s Parked list.

## Visual-QA threshold note

Per CLAUDE.md's batched visual-QA cadence (full Chrome/dark-mode pass once per ~50 new
calculators, not per batch), no Chrome visual pass was run for this batch alone — `curl`-based
structural checks only (per requirement). Running count since the last real visual pass (UX-02,
2026-10-31): Wave 2 Construction alone added 21 calculators before this run (batches 1–3) and adds
6 more here, 27 total; combined with whatever Food/Sports batches land next, the next visual pass
should happen once the combined total across sectors approaches ~50 — worth flagging to the main
session now that Construction is closing out at 27 new pages since the last pass.
