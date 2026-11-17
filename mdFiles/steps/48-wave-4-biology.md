# Step 48 — Wave 4: Biology (new category)

Per `mdFiles/omni-strategy.md` §4.1/§4.2 ("biology — new — Cell dilution, bacteria growth, Punnett
square, genetics," Wave 4 target ~30) and `mdFiles/calculator-rollout-plan.md`'s "Wave 4: Biology,
Ecology, Other (~80)" biology seed line (cell dilution, bacteria growth, doubling time, Punnett
square, Hardy-Weinberg, DNA concentration, PCR annealing temperature, cell density, generation
time, population growth, ligation ratio, molarity for buffers, protein concentration (A280),
centrifuge RCF↔RPM, dog/cat age, pet food, gestation). Go-ahead given 2026-11-16 (D22 reopens the
D13 go-ahead for physics/chemistry/biology specifically). Physics and chemistry both closed out
their targets this same session (physics 61/61, chemistry 60/60) — biology is next in the locked
order, before ecology/fun-other/tech (which still need their own separate go-ahead per D13/D22).

## Competitive gap-check (per omni-strategy.md's "widen the scan beyond Omni" rule, run before
scoping every wave since 2026-11-02)

Fetched Omni Calculator's own biology category page directly (`omnicalculator.com/biology`) for its
real subcategory breakdown, since the seed notes above only summarize it:

- **Bio laboratory calculators**: Annealing Temperature, Generation Time, Cell Dilution, Cell
  Doubling Time, DNA Concentration, Ligation, Log Reduction, Protein Concentration.
- **Genetics calculators**: Allele Frequency, Dihybrid Cross (Punnett), DNA Copy Number, DNA→mRNA,
  Hardy-Weinberg, Mutation Frequency, Mutation Rate, Punnett Square, qPCR Efficiency, Trihybrid
  Cross (Punnett).
- **Animal pregnancy/gestation, dog/cat/other-animal/livestock/gardening/forestry calculators**:
  a large additional set (dog age, cat age, cost of owning a dog, gestation per species, pet food,
  plus gardening/crop/soil/forestry calculators) — these exist on Omni but are a different kind of
  page (pet-care/consumer, not academic biology) and several are real YMYL risk (pet medication
  dosage: Benadryl/Tramadol/Metacam/Cephalexin dosing for dogs and cats) with no licensed-vet
  review process available on this site. **Explicitly out of scope for this step**, same
  discipline as D8's skip-IP-query rule: no drug-dosage-for-pets calculator gets built. Simple,
  non-medical pet-biology pages (dog/cat age conversion, a multi-species gestation lookup) are
  included below since they're low-risk and genuinely searched, but gardening/crop/soil/forestry/
  livestock-feed calculators are left for a future wave (they fit "home & garden" or "fun/other"
  better than academic biology) — not built here.

## Starting state

`biology` is a **brand-new category** — create it the same way `chemistry` was in Wave 3:
`data/calculators/biology.ts` (new file), an entry in `data/calculators/index.ts`'s `categories`
array and spread list, and a new color/icon pair in `lib/categoryTheme.ts` (check the existing
table before picking — physics is `indigo`, chemistry is `teal`; pick an unused pair, e.g. a
green/leaf or lime/dna-strand icon, and add any new hand-rolled SVG icon needed to
`components/IconTile.tsx` following the existing icon convention, same as chemistry's `flask` icon
was added in Wave 3). **This category-opening work (new file, new `index.ts` entries, new theme
entry, possibly a new icon) must happen in exactly one batch — batch 1 — not in parallel with any
other biology batch**, since two agents both trying to create `data/calculators/biology.ts` and
register the category simultaneously would conflict far more than two batches both appending
calculators to an already-existing file (the physics-wave lesson from runs 6/7 and 9/10/11/12,
but worse, since the file itself wouldn't exist yet on either branch). Batches 2+ may run in
parallel with each other (and with anything in other categories) once the category exists, same
"separate category files don't conflict" pattern already used for physics-vs-chemistry runs.

## Dedupe — check these before each batch, cross-category

- `cell-dilution-calculator` vs chemistry's `dilution-calculator`/`serial-dilution-calculator`:
  same underlying math (C1V1=C2V2 / serial factors) but a genuinely different search intent and
  framing (cells/mL or CFU/mL, not molarity) — state the distinction explicitly in content and
  cross-link, same "real distinct search terms, state how it differs" discipline Wave 3 used for
  `cd-calculator` vs `compound-interest-calculator`.
- `dna-concentration-calculator` vs chemistry's `beer-lambert-law-calculator`: DNA concentration
  from A260 absorbance is a specific, very commonly searched application of Beer-Lambert with its
  own conventional extinction coefficient (50 ng·cm/µL for dsDNA) — build it as its own page with
  that specific coefficient baked in as the default, cross-linked to the general Beer-Lambert page
  rather than duplicating it.
- `molarity-for-buffers-calculator` vs chemistry's `molarity-calculator`/`moles-to-grams-calculator`:
  only build this if it has a genuinely different framing (e.g. "how many grams of this reagent do
  I weigh out for a target buffer concentration and volume" as the primary question, with common
  lab reagent molar masses as a lookup) — if a build agent finds it's just `moles-to-grams-
  calculator` with different copy, skip it and say so, same "final cut is the build agent's
  judgment" rule every prior wave used.
- `water-potential-calculator` vs chemistry's `osmolarity-calculator`/`vant-hoff-osmotic-pressure-
  calculator`: water potential (Ψ = Ψp + Ψs, plant-physiology framing) is a different formula and a
  different audience (botany/plant biology, not analytical chemistry) — cross-link, don't merge.
- `centrifuge-rcf-rpm-calculator`: this is a real formula (RCF = 1.118×10⁻⁵ × r × RPM², rotor-radius
  dependent), **not** a unit conversion — don't confuse it with a measurements-category converter.
- Grep every new id/alias against ALL `data/calculators/*.ts` site-wide before writing, same
  discipline as every prior wave.

## Seed list — ~30 calculators in 6 batches of 5 (same discipline as Wave 3)

Citation source: **OpenStax Biology 2e** is this wave's primary textbook (same role OpenStax
University Physics/Chemistry 2e played in Wave 3) — fetch sections directly, never recall formulas
from memory. For molecular-biology-lab formulas not well-covered by an intro textbook (PCR
annealing temperature, qPCR efficiency, ligation molar ratios, log reduction), use a real
primary/authoritative source (a molecular-biology methods reference, NEB/Thermo Fisher's own
published formulas, or a peer-reviewed protocol) and cite it directly, same "cite what you actually
used" discipline as Wave 3's NIST/IUPAC citations for lab-adjacent chemistry topics.

### Batch 1 — Open the category + core bio-lab calculators (5)
- `cell-dilution-calculator` — C₁V₁ = C₂V₂ for a cell suspension (cells/mL or CFU/mL framing).
- `bacterial-growth-calculator` — exponential growth, N = N₀ × 2^(t/generation time).
- `doubling-time-calculator` — doubling time from a measured growth rate constant (the inverse
  direction/different question from bacterial-growth-calculator — state the distinction).
- `dna-concentration-calculator` — ng/µL from A260 absorbance × dilution factor × 50 (dsDNA
  extinction coefficient), cross-linked to `beer-lambert-law-calculator`.
- `protein-concentration-calculator` — A280-method protein concentration (extinction
  coefficient–based), distinct from DNA's A260 method — state why the wavelength/coefficient
  differs.

### Batch 2 — Genetics (5)
- `punnett-square-calculator` — monohybrid cross, genotype/phenotype ratios.
- `dihybrid-cross-calculator` — two-trait Punnett square.
- `hardy-weinberg-calculator` — p² + 2pq + q² = 1, allele/genotype frequency equilibrium.
- `allele-frequency-calculator` — allele frequency from genotype counts (distinct question from
  Hardy-Weinberg's equilibrium-prediction direction).
- `dna-to-mrna-calculator` — transcription (complementary strand + T→U substitution), a lookup/
  breakdown widget (base-by-base), not a numeric solver.

### Batch 3 — Molecular biology lab techniques (5)
- `pcr-annealing-temperature-calculator` — Tm estimate from primer GC content/length (a real,
  commonly cited formula — cite the specific one used, e.g. the Wallace rule or a GC-content
  formula, and state its known limitations).
- `qpcr-efficiency-calculator` — efficiency from a standard curve slope (E = 10^(−1/slope) − 1).
- `ligation-calculator` — insert:vector molar ratio from mass/length/concentration.
- `centrifuge-rcf-rpm-calculator` — RCF ↔ RPM conversion, rotor-radius dependent (a real formula,
  not a straight unit conversion).
- `log-reduction-calculator` — microbial log reduction/kill-rate from before/after counts.

### Batch 4 — Population biology + genetics extensions (5)
- `population-growth-calculator` — exponential (and/or logistic, build agent's call) population
  growth, N = N₀e^(rt) — the general ecology/biology version, distinct from
  `bacterial-growth-calculator`'s doubling-based framing.
- `generation-time-calculator` — generation time from a CFU/colony-count growth experiment
  (distinct from `doubling-time-calculator`'s theoretical-rate framing — check this is a genuinely
  different question before building both; if not, build only one and say so).
- `mutation-rate-calculator` — mutation rate from mutant frequency/generations (distinct from
  `allele-frequency-calculator`).
- `codon-to-amino-acid-calculator` — translation lookup (mRNA codon → amino acid via the genetic
  code table), a lookup/breakdown widget needing a new `lib/geneticCode.ts` table (IUPAC/NCBI
  standard genetic code, cited directly), same precedent as `lib/molecularGeometry.ts`.
- 1 more, build agent's choice from the remaining seed list or a genuinely new standard
  intro-biology topic (candidates: surface-area-to-volume ratio, a classic cell-biology concept).

### Batch 5 — Plant/cell biology + biochemistry (5)
- `water-potential-calculator` — Ψ = Ψp + Ψs (plant physiology), cross-linked to chemistry's
  osmotic-pressure/osmolarity pages with the distinction stated.
- `surface-area-to-volume-ratio-calculator` — if not already built in batch 4.
- `protein-molecular-weight-calculator` — from amino acid composition or sequence length (distinct
  from `protein-concentration-calculator`'s A280-absorbance framing).
- `molarity-for-buffers-calculator` — only if genuinely distinct from chemistry's molarity/
  moles-to-grams pages (see Dedupe section) — otherwise skip and pick a replacement.
- 1 more, build agent's choice (candidates: a pedigree/inheritance-probability calculator for
  simple autosomal dominant/recessive traits, or any other standard genetics/cell-biology topic).

### Batch 6 — Simple, non-medical animal biology (5, low-risk subset of the pet/animal seed items)
- `dog-age-calculator` — dog-to-human-year age conversion using a real published formula/curve
  (e.g. AVMA's or a veterinary-published curve, not a flat "×7" myth — cite the real source and
  explain why the simple multiplier is wrong, a good watch-out item).
- `cat-age-calculator` — same, cat-specific curve/source.
- `animal-gestation-calculator` — a multi-species lookup/breakdown widget (dog/cat/cow/horse/goat/
  sheep/rabbit average gestation lengths from a single page with a species selector), rather than
  8 separate thin per-species pages — same "one page, options-keyed lookup" precedent as
  `resistor-color-code-calculator`/`molecular-geometry-calculator`. Cite a real veterinary
  reference (e.g. Merck Veterinary Manual) for each species' figure.
- 2 more, build agent's choice to round out to ~30 total — **explicitly do not build any pet
  medication/dosage calculator** (see the gap-check section above).

## Acceptance checks (every batch, same as Wave 3)

- `npm test`, `npm run lint`, `npm run build` all green before committing.
- Every formula fetched directly from a primary source (OpenStax Biology 2e, or a real
  authoritative molecular-biology/veterinary source for lab/animal topics) — never recalled from
  memory.
- Every worked-example number independently re-verified in a standalone scratch script (no app
  imports) before committing.
- Grep every new id/alias against ALL `data/calculators/*.ts` site-wide before writing.
- `seo.title` ≤60 chars, `seo.description` ≤160 chars, 6 FAQs, ≥4 aliases per new page.
- Check `lib/units.ts` before adding any new dimension — this category will likely need several
  new ones (e.g. a concentration-like `ng/µL` unit, generation-time-style rate units) — reuse
  `concentration`/`amountOfSubstance`/`time`/`frequency`/`percent`/`count` wherever genuinely
  applicable before adding something new.
- Note in STATUS.md whenever a seed-list candidate is skipped as a near-duplicate or too thin,
  same "honest skip over padding" discipline as every prior wave (D17).
- Visual-QA note: the site is at 371 calculators as this step starts — within the ~50-calculator
  cadence, but worth a spot-check once this wave crosses ~420 (roughly batch 4-5), covering at
  least one solver, one breakdown, and one lookup-table widget type from the new category.

## Progress

- [x] Step file written
- [x] Batch 1 (open category + core bio-lab, 5) — **DONE 2026-11-17**, branch
      `step/48-wave-4-biology-run-1`, PR #115 (draft, ready for review once pushed). Opened the
      `biology` category: `data/calculators/biology.ts` (new file), registered in
      `data/calculators/index.ts` (`categories`, `calculatorOrder`, the spread list), `lime`/`dna`
      theme pair in `lib/categoryTheme.ts` + `components/IconTile.tsx`. New `lib/units.ts`
      dimension `cellDensity` (cells/mL, CFU/mL, cells/µL, cells/L — cell-suspension density,
      distinct from `concentration`'s molarity) plus three new `massConcentration` labels
      (`ng/µL`, `µg/mL`, `mg/mL` — numerically identical to the existing `mg/L` base, so no stray
      conversion factor), both with round-trip + anchor tests in `lib/units.spec.ts`.
      - `cell-dilution-calculator`: C₁V₁ = C₂V₂ for a cell/CFU suspension (`cellDensity`
        dimension). Cross-linked to and explicitly distinguished from chemistry's
        `dilution-calculator`/`serial-dilution-calculator` (same algebra, cells/CFU counted
        instead of moles) per the Dedupe section. Worked example: 2 mL of a 5×10⁶ cells/mL stock
        diluted to 10 mL gives 1×10⁶ cells/mL (5× dilution, 1×10⁷ cells transferred).
      - `bacterial-growth-calculator`: N = N₀ × 2^(t ÷ g), binary fission. Cites OpenStax
        Microbiology §9.1 directly (fetched) for the Nₙ = N₀2ⁿ definition and its E. coli (20 min),
        M. tuberculosis (15–20 h), M. leprae (14 d) generation-time examples. Worked example:
        1,000 cells, 20-min generation time, 60 min elapsed → 8,000 cells (3 generations).
      - `doubling-time-calculator`: t_d = ln2 ÷ µ from a measured growth rate constant — the
        inverse/different question from `bacterial-growth-calculator` (that page starts from a
        known generation time and predicts a population; this one starts from a growth curve's
        fitted µ and predicts doubling time). Worked example: µ = 2.0 h⁻¹ → t_d ≈ 20.79 min.
      - `dna-concentration-calculator`: ng/µL = A260 × dilution factor × 50 (the dsDNA mass
        extinction constant). Cited Desjardins & Conklin (2010), J Vis Exp, "NanoDrop Microvolume
        Quantitation of Nucleic Acids" (PMC3346308, fetched directly) for the 50/33/40
        dsDNA/ssDNA/RNA constants. Cross-linked to `beer-lambert-law-calculator`. Worked example:
        A260 = 0.5, dilution factor 20 → 500 ng/µL.
      - `protein-concentration-calculator`: A280 Beer-Lambert method — c (mg/mL) =
        (MW × A) ÷ (ε₂₈₀ × l), reusing the existing `molarAbsorptivity`/`molarMass`/`length`/
        `massConcentration` dimensions rather than adding a new one. Distinguished from DNA's A260
        method (no universal constant; ε₂₈₀ depends on each protein's Trp/Tyr/cystine content —
        cited Pace et al. 1995's prediction formula, flagged below as a search-snippet fallback).
        Worked example: BSA (MW 66,463 g/mol, ε₂₈₀ 43,824 L/(mol·cm), both fetched directly from
        Wikipedia + AAT Bioquest), A280 = 0.660 → ≈1.00 mg/mL.
      - **Citation note:** every formula above was fetched directly except Pace et al. (1995)'s
        ε₂₈₀ prediction formula — a direct PDF fetch of two different hosted copies both returned
        corrupted/unreadable text, so that one formula is confirmed via a search-engine-indexed
        snippet of the paper instead (flagged in the page's own references), the same transparency
        precedent the chemistry wave used for a few 403'd Gold Book pages.
      - Every worked-example number re-verified in a standalone Node scratch script (no app
        imports) before committing; script output matched the copy exactly.
      - `npm test` 1459/1459 (snapshot additions are additive-only), lint clean, `npm run build`
        408 pages (376 calculators incl. biology's 5, 19 categories), exit code 0.
      - `biology` 0 → 5, site-wide 371 → 376.
      - No seed-list candidate skipped this batch — all 5 scoped items built as specified.
- [x] Batch 2 (genetics, 5) — **DONE 2026-11-17**, branch `step/48-wave-4-biology-run-2`,
      PR #116 (merged, after the expected conflict against batch 3 below was resolved by the main
      session using the same hand-splice technique the physics wave used for its own same-file
      conflicts). Ran in parallel with batch 3 on the same `biology.ts` file per this step's own
      go-ahead for batches 2+.
      - [x] `punnett-square-calculator`: monohybrid cross, genotype/phenotype ratios from two
        parent genotypes, encoded as each parent's dominant-allele count (0/1/2) via `options`
        (breakdown widget). Worked example: Mendel's PP x pp -> 100% Pp (OpenStax's own "100
        percent of the F1 hybrid generation had violet flowers"), plus the F1 self-cross's F2
        count (705 violet : 224 white, ≈75.9%/24.1%, ratio ≈3.15:1) against the theoretical 3:1.
      - [x] `dihybrid-cross-calculator`: two independently-assorting genes (seed shape R/r, seed
        color Y/y, OpenStax's own illustration), all four phenotype proportions generalized from
        the classic 9:3:3:1 ratio (multiplying each trait's own monohybrid dominant/recessive
        probability, per the law of independent assortment). Worked example: RrYy x RrYy ->
        56.25/18.75/18.75/6.25%, which is exactly 9:3:3:1.
      - [x] `hardy-weinberg-calculator`: p + q = 1, p² + 2pq + q² = 1 — a 2-variable solver (enter
        p or q, get the other plus all three genotype frequencies as solver outputs). Worked
        example reuses OpenStax §19.1's own 500-pea-plant population (245/210/45 YY/Yy/yy) to show
        the p=0.7/q=0.3 Hardy-Weinberg prediction (49%/42%/9%) matches that population's actual
        observed proportions exactly — a genuine, directly-fetched equilibrium demonstration, not
        a contrived one.
      - [x] `allele-frequency-calculator`: allele frequency computed directly from observed
        genotype counts (no equilibrium assumption) — explicitly stated as the opposite direction
        from hardy-weinberg-calculator's predictive calculation, in both pages' content. Reuses the
        same OpenStax §19.2 figure (245/210/45 of 500) as its default/worked example, since it's
        the exact source of the p=0.7/q=0.3 numbers hardy-weinberg-calculator's own example builds
        on.
      - [x] `dna-to-mrna-calculator`: transcription (complementary DNA strand + T->U substitution)
        as a 6-base lookup/breakdown widget. **Engineering note:** `CalculatorInput`/`compute()`
        have no `text`/sequence input type (checked `data/calculators/types.ts` first, per this
        step's own instruction) — rather than add one (a cross-cutting change touching
        `BreakdownCalculator.tsx`, share-link parsing, and the snapshot harness), this uses the
        existing `options` mechanism (resistor-color-code-calculator's precedent: each of 6 fixed
        positions is a dropdown, A/T/G/C encoded 0-3) plus `BreakdownOutput.labels` (the
        ring-size-letter precedent) to display each position's paired base in either DNA (T) or
        RNA (U) alphabet from one shared computation. `compute()` wraps every raw value through
        `normalizeBaseCode` (round, mod 4) so the snapshot test's *1.5-scaled "typical" input set
        can't produce an undefined lookup. Worked example: template A-T-G-C-G-T ->
        complementary DNA strand T-A-C-G-C-A -> mRNA U-A-C-G-C-A (50% GC), cross-checked two
        independent ways (direct template complement+substitution, and coding-strand-then-T→U) in
        the verification script, both giving the same answer.
      - Every worked-example number (Mendel's counts, the 9:3:3:1 ratio, the Hardy-Weinberg
        prediction, the allele-count arithmetic, and the transcription example) re-verified in a
        standalone Node scratch script with no app imports; script output matched the copy exactly.
      - `npm test` 1467/1467 (snapshot diff confirmed additive-only, touching exactly the 5 new
        ids), lint clean, `npm run build` 413 pages (381 calculators incl. biology's 10, same
        category/page count as physics/chemistry's structure).
      - `biology` 5 → 10 from this branch's point of view; reconciled to 10 → 15 once merged
        against batch 3 below. Site-wide 376 → 386 after both land.
      - No seed-list candidate skipped this batch — all 5 scoped items built as specified.
- [x] Batch 3 (molecular biology lab techniques, 5) — **DONE 2026-11-17**, branch
      `step/48-wave-4-biology-run-3`, PR #117 (merged first, cleanly — batch 2's PR #116 then
      conflicted against it as expected and was resolved by the main session).
      Built in parallel with batch 2 on the same `data/calculators/biology.ts` file.
      New `lib/units.ts` additions ahead of this batch: `mass` gains `ug`/`ng` (ligation's
      insert/vector DNA mass), plus two new dimensions, `basePairs` (bp/kb) and
      `relativeCentrifugalForce` (single-unit `×g`, same precedent as `absorbance`/`pH`/`decibel`)
      — all with round-trip + anchor tests in `lib/units.spec.ts`; the pre-existing "force-calculator
      dimensions unchanged" pin test for `mass` was updated to include `ug`/`ng` (same precedent as
      `st`'s own addition in step 36).
      - `pcr-annealing-temperature-calculator`: Wallace rule, Tm = 2°C×(A+T) + 4°C×(G+C), rewritten
        as a continuous function of primer length (N) and GC% so the widget solves for any of the
        three: Tm = 2N(1 + GC%÷100). Cites Wallace, Shaffer, Murphy, Bonner, Hirose & Itakura (1979),
        *Nucleic Acids Research* — NEB's/Promega's/IDT's own Tm-calculator pages either 403'd or
        didn't surface the formula text on a direct fetch, so this one citation is a search-snippet
        fallback, flagged in the page's own references. Explicit watch-out items on the rule's
        short-primer-only accuracy and that real tools use nearest-neighbor thermodynamics instead.
        Worked example: 20-base primer, 60% GC (12 G/C, 8 A/T) → Tm = 2×8 + 4×12 = 64°C.
      - `qpcr-efficiency-calculator`: E = 10^(−1/slope) − 1, %efficiency = E×100 — confirmed by a
        direct fetch of QIAGEN's own PCR bench guide ("Determining Amplification Efficiencies").
        Notes the MIQE 90-110% acceptable range (slopes ≈ −3.58 to −3.10) and that a slope near zero
        signals a failed standard curve, not a calculation error. Worked example: slope = −3.5 →
        E ≈ 93.07%.
      - `ligation-calculator`: insert:vector molar ratio = (mass_insert ÷ mass_vector) ×
        (length_vector ÷ length_insert) — derived from Thermo Fisher Scientific's own dsDNA
        molecular-weight formula (MW ≈ bp × 607.4 + 157.9 Da, fetched directly), showing the shared
        per-bp mass constant cancels out of a molar RATIO regardless of its exact value (confirmed
        numerically in the verification script: the ratio formula is exact under a uniform
        Da/bp assumption, and differs from the precise Thermo formula by well under 1% even for a
        1 kb fragment, due only to that formula's small, length-independent end-correction term).
        NEB's own ligation-calculator page 403'd on direct fetch; its formula is confirmed via a
        search-snippet fallback instead, flagged in the references. New `basePairs`/`ng` units.
        Worked example: 50 ng of a 3 kb vector + 50 ng of a 1 kb insert → 3:1 molar ratio.
      - `centrifuge-rcf-rpm-calculator`: solves the exact SI physics form, RCF = ω²r ÷ g₀ (OpenStax
        University Physics Vol. 1 §6.3's centripetal acceleration formula, divided by standard
        gravity), which is algebraically the same relationship as the conventional lab formula RCF ≈
        1.118×10⁻⁵ × r(cm) × RPM² — confirmed against Wikipedia's "Centrifuge" article (which states
        the equivalent mm/RPM constant, 1.118×10⁻⁶). The two forms agree to within about 0.02%,
        which is the rounding of the published constant, not a bug — stated explicitly as a
        watch-out item. New `relativeCentrifugalForce` (×g) dimension; reused `length` (cm) and
        `angularVelocity` (rpm, added in physics Wave 3) per the step file's own hint. Worked
        example: 8 cm radius, 10,000 RPM → RCF ≈ 8,946×g (physics form) vs. ≈8,944×g (conventional
        constant).
      - `log-reduction-calculator`: LR = log₁₀(N₀÷N), with percent reduction = 100×(1 − N÷N₀) as a
        bonus output — confirmed by a direct fetch of Wikipedia's "Log reduction" article. Worked
        example: 1,000,000 → 10 CFU/mL is a 5-log (99.999%) reduction.
      - Every worked-example number (including the RCF cross-check between its two formula forms)
        independently re-verified in a standalone Node scratch script (no app imports) before
        committing; script output matched the copy exactly.
      - `npm test` 1484/1484 (snapshot additions additive-only, 163 lines; one new
        `KNOWN_NON_FINITE` entry added for `log-reduction-calculator`'s initialCount=finalCount=0
        edge case, log₁₀(0/0) being genuinely undefined), lint clean, `npm run build` exit 0 (381
        calculator pages). Static HTML of all 5 new pages checked directly for H1/JSON-LD/FAQ
        presence (a pre-existing process on port 3000 was left untouched, per this batch's own
        instructions).
      - `biology` 5 → 10 on this branch (merged first; reconciled to 15 total against batch 2
        above).
      - No seed-list candidate skipped this batch — all 5 scoped items built as specified.
- [ ] Batch 4 (population biology + genetics extensions, 5) — **IN PROGRESS**, branch
      `step/48-wave-4-biology-run-4`.
      - [ ] `population-growth-calculator`
      - [ ] `generation-time-calculator` — **under review**: checking whether this duplicates a
        solve direction `bacterial-growth-calculator`'s own 4-variable solver already exposes
        (N0, N, t -> g) before building a separate page for it.
      - [ ] `mutation-rate-calculator`
      - [ ] `codon-to-amino-acid-calculator` (+ `lib/geneticCode.ts` + spec)
      - [ ] 5th calculator (build agent's choice)
- [ ] Batch 5 (plant/cell biology + biochemistry, 5)
- [ ] Batch 6 (simple non-medical animal biology, 5)
- [ ] Visual-QA spot-check (once this wave crosses ~420 calculators)
- [ ] STATUS.md updated, `biology` category count recorded, Wave 4 handed off to ecology next
      (ecology still needs its own go-ahead per D13/D22 — do not start it without one)
