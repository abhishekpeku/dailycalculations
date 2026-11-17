# Step 49 — Wave 4: Ecology (new category)

Per `mdFiles/omni-strategy.md` §4.1/§4.2 ("ecology — new — Carbon footprint, solar payback, water
usage. Fits 'daily' well," Wave 4 target ~25) and `mdFiles/calculator-rollout-plan.md`'s "Wave 4:
Biology, Ecology, Other (~80)". Go-ahead given 2026-11-17 (D23: user gave a blanket go-ahead for the
remainder of the roadmap, superseding D13/D22's per-category approval requirement). Physics,
chemistry, and biology are all closed out — ecology is next in the locked order, before fun/other
and tech (which also now have their go-ahead per D23, but ecology comes first).

## Competitive gap-check (per omni-strategy.md's "widen the scan beyond Omni" rule)

Fetched Omni Calculator's own ecology category page directly (`omnicalculator.com/ecology`) for its
real subcategory breakdown:

- **Eco footprint calculators**: AI water footprint, bag footprint, Christmas tree footprint,
  COVID-19 waste, cryptocurrency footprint, flight carbon footprint, hand drying footprint, Kaya
  identity, meat footprint, plastic footprint, reduce-your-plastic, vegan footprint.
- **Renewable energy calculators**: hydroelectric power, solar panel, solar panel wattage, wind
  turbine, wind turbine profit.
- **Sustainable living calculators**: books vs. e-books, car vs. bike, cigarette butts cleanup,
  drip faucet, global plastic policy, Olympic Games sustainability, plug-in hybrid economy, tap
  water, tree benefits, water demand.
- **Other**: carrying capacity, CO₂ breathing emission, fish mercury, Lotka-Volterra, passive house
  savings, Shannon diversity index, smog.

## Dedupe — critical boundary with the future Wave 5 "Solar & home energy" category

`mdFiles/omni-strategy.md` §4.5 already scopes a dedicated **Solar & home energy** category for
Wave 5 (`solar-panel-system-size`, `solar-savings`, `solar-payback-period`, `battery-backup-sizing`,
`off-grid-solar`, `home-electricity-consumption`, `heat-pump-savings`, `appliance-energy-cost`,
`net-metering-savings`, `solar-loan-payment`) — queued after tech closes out, not yet started.
**Do not build any solar-panel, wind-turbine, or home-renewable-energy-system calculator in this
ecology step** even though Omni's own "Renewable energy calculators" subcategory and this file's
own §4.1 seed note ("solar payback") suggest it — that entire topic is already reserved for Wave 5
to avoid building it twice under two different category framings. Ecology here means footprint/
sustainability/population-ecology topics, not home energy-system sizing or payback. If a build
agent is unsure whether a candidate belongs here or in the future solar category, it belongs there,
not here — skip it.

Other dedupe checks:
- `home`'s `electricity-bill-calculator` and `auto`'s `ev-charging-calculator` already exist — cross
  -link if relevant (e.g. a carbon-footprint page citing electricity use), don't rebuild either.
- Biology's `population-growth-calculator` (N = N₀e^(rt), general exponential growth) vs. an
  ecology `carrying-capacity-calculator` (logistic growth with a K ceiling): genuinely different
  questions (unlimited growth vs. growth that levels off at an environmental limit) — cross-link,
  state the distinction, don't duplicate the simpler exponential case.
- Grep every new id/alias against ALL `data/calculators/*.ts` site-wide before writing, same
  discipline as every prior wave.

## Starting state

`ecology` is a **brand-new category** — open it the same way `biology` was in Wave 4:
`data/calculators/ecology.ts` (new file), an entry in `data/calculators/index.ts`'s `categories`
array and spread list, and a new color/icon pair in `lib/categoryTheme.ts`. All 10 existing tile
colors (blue/green/purple/orange/red/teal/indigo/pink/gray/lime) are already claimed by other
categories — add a genuinely new one (e.g. an `emerald` or `cyan`, distinct from finance/sports'
`green` and biology's `lime`) plus a new hand-rolled SVG icon to `components/IconTile.tsx`'s `ICONS`
set if nothing existing fits (a leaf, globe, or recycling-arrows glyph would all read well) —
biology's own `lime`/`dna` addition in Wave 4 batch 1 is the precedent for how this was done.
**This category-opening work must happen in exactly one batch — batch 1 — not in parallel with any
other ecology batch**, same reasoning as biology's own batch 1 (two agents simultaneously creating
`data/calculators/ecology.ts` and registering the category would conflict far worse than two
batches both appending calculators to an already-existing file). Batches 2+ may run in parallel
with each other once the category exists.

## Seed list — ~25 calculators in 5 batches of 5

Citation source: **OpenStax Biology 2e**'s own ecology chapters (population ecology, community
ecology, biodiversity) cover several of these formulas directly and are this wave's primary
textbook source, same role it played for biology. For footprint/sustainability figures with no
textbook coverage, use a real authoritative source (EPA, IPCC, a peer-reviewed footprint-methodology
paper, or a recognized environmental-NGO publication like the Global Footprint Network) and cite it
directly — never invent an emissions factor or conversion number.

### Batch 1 — Open the category + carbon/footprint basics (5)
- `carbon-footprint-calculator` — a general personal/household CO₂ footprint estimate (e.g. from
  electricity use, car travel, flights — EPA's own Household Carbon Footprint Calculator
  methodology, or an equivalent cited source, not an invented one).
- `flight-carbon-footprint-calculator` — specifically flight emissions (distance × a cited
  passenger-emissions factor, e.g. ICAO's or DEFRA's published methodology) — distinct enough from
  the general footprint page to be its own, very commonly searched page.
- `water-footprint-calculator` — direct + indirect ("virtual") water use, cited to the Water
  Footprint Network's own methodology.
- `plastic-footprint-calculator` — estimated plastic waste from common household items, cited to a
  real source (EPA, UNEP, or a peer-reviewed study) — not invented per-item weights.
- `meat-footprint-calculator` (or `vegan-footprint-calculator`, build agent's call on framing) —
  dietary carbon-footprint comparison, cited to a real study (e.g. Poore & Nemecek 2018, *Science*,
  a commonly-cited primary source for food-carbon-intensity figures).

### Batch 2 — Population & biodiversity ecology (5)
- `carrying-capacity-calculator` — logistic population growth, dN/dt = rN(1 − N/K), solved for the
  equilibrium/limiting population. Cross-linked to and distinguished from biology's
  `population-growth-calculator` per the Dedupe section.
- `shannon-diversity-index-calculator` — H' = −Σ(pᵢ × ln(pᵢ)), a standard biodiversity metric from
  species-count data. Cite OpenStax Biology 2e's own community-ecology/biodiversity section
  directly.
- `population-density-calculator` — organisms per unit area, the basic ecological-density formula —
  check this isn't already covered by anything in `measurements`/`math` under a different framing
  before building (it shouldn't be, but verify).
- `species-richness-calculator` or `simpson-diversity-index-calculator` — a second, genuinely
  distinct biodiversity metric (richness = simple species count; Simpson's index = a different
  weighting than Shannon's) — cite the real formula, state how it differs from Shannon's index.
- `lotka-volterra-calculator` — predator-prey population dynamics. **Scope warning**: the full
  Lotka-Volterra model is a coupled differential-equation system, not a single closed-form formula
  — if a clean single-step calculation can't be built (e.g. equilibrium population sizes from the
  four rate constants, which IS closed-form), scope it down to that rather than attempting to
  simulate the full time-series, or skip it and build a replacement — honest skip over a half-right
  simulation, per D17.

### Batch 3 — Sustainable living / resource use (5)
- `car-vs-bike-calculator` — emissions/cost comparison for a given commute distance, cited to a
  real per-mile emissions factor (EPA).
- `tree-benefits-calculator` — CO₂ absorption (and other benefits, e.g. stormwater/air quality if
  well-sourced) per tree over time, cited to USDA Forest Service's own i-Tree methodology or an
  equivalent primary source.
- `books-vs-ebooks-calculator` — lifecycle-emissions comparison, cited to a real peer-reviewed or
  industry life-cycle-assessment study (don't invent per-book carbon figures).
- `water-demand-calculator` or `drip-faucet-waste-calculator` — household water-use estimate, cited
  to EPA WaterSense data.
- `recycling-rate-calculator` or `composting-impact-calculator` — build agent's choice, cited to a
  real EPA/municipal-recycling source.

### Batch 4 — Environmental health / air quality + remaining population ecology (5)
- `air-quality-index-calculator` (AQI/"smog calculator") — EPA's own published AQI breakpoint
  table/formula (a real piecewise-linear conversion from pollutant concentration to the 0-500 AQI
  scale) — cite the EPA table directly, don't approximate it.
- `co2-breathing-emission-calculator` — per-person CO₂ exhaled per day, a real physiological
  estimate cited to a peer-reviewed source (not a guessed number).
- One more biodiversity/population-ecology topic not yet covered (e.g. a biomagnification/trophic-
  level calculator, or a mark-recapture population-estimate calculator — Lincoln-Peterson index,
  N̂ = (M × C) / R, a genuinely closed-form, well-sourced ecology-course staple if not already built
  in batch 2).
- 2 more, build agent's choice from the remaining seed list or a genuinely new standard
  ecology/sustainability topic.

### Batch 5 — Round out to ~25 (5, build agent's judgment)
Pick from any remaining seed-list candidates (e.g. `passive-house-savings-calculator` if it can be
scoped without colliding with the future Wave 5 home-energy category — likely too close, use
judgment; `fish-mercury-calculator` if a real EPA/FDA advisory table can be sourced; a global-
plastic-policy or cigarette-butt-cleanup framing if genuinely distinct and well-sourced) or any
other standard ecology/environmental-science topic with real search value. Same honest-skip
discipline as every prior wave — ship fewer than 5 rather than pad, if good candidates run out.

## Acceptance checks (every batch, same as Wave 4 biology)

- `npm test`, `npm run lint`, `npm run build` all green before committing.
- Every formula/figure fetched directly from a primary source (OpenStax Biology 2e, EPA, IPCC, a
  peer-reviewed study, or an equivalent authoritative source) — never recalled from memory. This is
  genuinely YMYL-adjacent territory (people may change real spending/lifestyle decisions based on a
  footprint estimate) — citation discipline is non-negotiable, same as the finance wave.
- Every worked-example number independently re-verified in a standalone scratch script (no app
  imports) before committing.
- Grep every new id/alias against ALL `data/calculators/*.ts` site-wide before writing.
- `seo.title` ≤60 chars, `seo.description` ≤160 chars, 6 FAQs, ≥4 aliases per new page.
- Check `lib/units.ts` before adding any new dimension — mass-of-CO₂ likely reuses the existing
  `mass` dimension (kg/tonnes already present via physics/chemistry's own additions — check before
  adding a new one); reuse `concentration`/`percent`/`count`/`length`/`area` wherever genuinely
  applicable.
- Note in STATUS.md whenever a seed-list candidate is skipped as a near-duplicate, too thin, or a
  Wave-5-boundary conflict (the solar/renewable-energy exclusion above) — same "honest skip over
  padding" discipline as every prior wave (D17).
- Visual-QA note: the site is at 399 calculators as this step starts — worth a spot-check once this
  wave crosses ~420 (likely during batch 2 or 3), covering at least one solver, one breakdown, and
  the new category's own theme/icon rendering correctly.

## Progress

- [x] Step file written
- [x] Batch 1 (open category + carbon/footprint basics, 5) — **DONE 2026-11-17**, branch
      `step/49-wave-4-ecology-run-1`, PR #121. Opened the `ecology` category (`data/calculators/ecology.ts`,
      `emerald`/`leaf` theme pair, registered in `data/calculators/index.ts`) and added:
      `carbon-footprint-calculator`, `flight-carbon-footprint-calculator`, `water-footprint-calculator`,
      `plastic-footprint-calculator`, `meat-footprint-calculator`. All 5 numbers independently
      re-verified in a standalone Node scratch script. Sources fetched directly: EPA Greenhouse Gas
      Equivalencies Calculator (electricity/gasoline/natural gas factors), EPA 2018 National Overview
      (plastics), UK Government 2024 GHG Conversion Factors (flight emissions — fetched as the published
      xlsx and parsed byte-for-byte after the ICAO/DEFRA methodology PDFs 403'd or came back unreadable
      as PDF text), Water Footprint Network's own national-average page, and Our World in Data's CSV
      export of its Poore & Nemecek (2018) food-emissions chart. No new `lib/units.ts` dimensions
      needed. `npm test` 1534/1534, lint clean, `npm run build` 404/404 pages, 20 categories — matches
      this file's own expected totals exactly. `ecology` is now 5/~25 — batches 2-5 may now run in
      parallel with each other (category-opening work, which had to be sequential, is complete).
- [ ] Batch 2 (population + biodiversity ecology, 5) — **IN PROGRESS**, branch
      `step/49-wave-4-ecology-run-2`, PR TBD (opening draft now). Progress checklist for this batch:
      - [x] `carrying-capacity-calculator` — committed
      - [x] `shannon-diversity-index-calculator` — committed
      - [ ] `population-density-calculator`
      - [ ] `simpson-diversity-index-calculator`
      - [ ] `lotka-volterra-calculator` (equilibrium point only, γ/δ and α/β — scoped down from the
            full time-series simulation per D17; see this batch's own notes once done)
- [ ] Batch 3 (sustainable living / resource use, 5)
- [ ] Batch 4 (environmental health + remaining population ecology, 5)
- [ ] Batch 5 (round out to ~25, 5)
- [ ] Visual-QA spot-check (once the site crosses ~420 calculators) — site is at 404 after batch 1,
      so this is likely due during batch 3 or 4.
- [ ] STATUS.md updated, `ecology` category count recorded, Wave 4 fully closed out (biology +
      ecology both done) — fun/other is next per D13/D22/D23 (already has its go-ahead, per D23)
