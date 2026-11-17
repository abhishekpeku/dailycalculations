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
- [x] Batch 4 (population biology + genetics extensions, 5) — **DONE 2026-11-17**, branch
      `step/48-wave-4-biology-run-4`, PR #118 (merged after a conflict resolved against batch 5
      below, which merged first) — resumed from a rate-limit interruption partway through; the
      branch's first 2 commits/calculators were already built and verified by the prior agent on
      this same run before it died — documented in full below alongside the 3 finished by the
      resuming agent. **This batch's own `surface-area-to-volume-ratio-calculator` pick turned out
      to duplicate batch 5's independent pick of the same calculator** (a risk flagged in advance
      in both agents' task prompts) — since batch 5's PR merged first, its version was kept and
      this batch's copy (plus its now-unused `SHAPE_OPTIONS` constant) was dropped by the main
      session during conflict resolution. This batch's real net contribution is therefore 4
      calculators, not 5.
      - [x] `population-growth-calculator` — continuous exponential growth N = N0 e^(rt) (new
        `rateConstant` unit `yr-1`, reciprocal of `time`'s own year, round-trip + anchor tested).
        Worked example: 500 animals at r=5%/yr → ≈824 after 10 years.
      - [x] `generation-time-calculator` — **SKIPPED, confirmed duplicate**: read
        `bacterial-growth-calculator` directly and its existing 4-variable solver already solves
        exactly this direction (N0, N, t -> g = t ÷ log2(N/N0), algebraically identical to
        g = t × ln2 ÷ ln(N/N0)) — not just "similar to," but the same solve direction on an
        already-shipped page. Building a separate page for it would be a literal duplicate, not a
        distinct-search-intent variant (the "honest skip" case, D17). Replaced with
        `hemocytometer-calculator` (raw hemocytometer count -> cells/mL, the real missing seed-list
        item "cell density" — a genuinely different question: how the density going INTO
        cell-dilution-calculator is actually measured, not a repeat of any existing page). Worked
        example: 200 cells / 4 squares / 2x dilution → 1,000,000 cells/mL.
      - [x] `mutation-rate-calculator` — µ = mutant frequency (mutant count ÷ total individuals) ÷
        number of generations, an explicitly-flagged simplified estimate (valid for small µ×g),
        distinct from `allele-frequency-calculator` (which counts existing Mendelian alleles with
        no time dimension; this page asks how fast a *new* mutation must arise per generation to
        explain an observed frequency after a known number of generations). Cites OpenStax
        Microbiology §11.5 "Mutations" (fetched directly: mutation/mutant definitions, the "one
        incorrect base per billion base pairs" DNA polymerase error rate, the "1000-fold" mutagen
        fact) for the concept, and Wikipedia's "Luria–Delbrück experiment" (fetched directly) for
        the explicit, quoted caveat that "frequency is not a sufficiently accurate measure of
        mutation and the mutation rate...should always be calculated" and that early-arising
        mutants are over-represented in a clonally growing culture — used as this page's main
        watch-out content, honestly scoping what the simple division does and doesn't capture
        versus the real fluctuation-test estimators (Lea–Coulson median, Ma–Sandri–Sarkar MLE,
        named but not implemented). Worked example: 4 mutants / 2,000,000 individuals / 20
        generations → frequency 1 in 500,000 (2×10⁻⁶), rate ≈ 1×10⁻⁷ per generation.
      - [x] `codon-to-amino-acid-calculator` — mRNA codon → amino acid lookup via 3 codon-position
        dropdowns (type-B breakdown/lookup widget, same `options`-keyed-by-code mechanism
        `dna-to-mrna-calculator` already established for base-by-base lookups, read directly before
        building this). New `lib/geneticCode.ts`: the full standard genetic code (NCBI genetic code
        table 1, "the Standard Code," fetched directly from
        ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi) rebuilt as a direct 64-row table (not by
        re-typing NCBI's packed strings) and independently verified base-by-base against NCBI's own
        Base1/Base2/Base3/AAs strings in the build's scratch script before committing. New
        `lib/geneticCode.spec.ts` self-checks the table the same way `molecularGeometry.spec.ts`/
        `electronConfigurations.spec.ts` do: 64 distinct codons, exactly 3 stop codons (UAA/UAG/
        UGA), exactly 1 start codon (AUG → Met), and the full known degeneracy table (3 amino acids
        with 6 codons, 5 with 4, 1 with 3, 9 with 2, 2 with 1, summing to 64) — all pass. Concept
        content cites OpenStax Biology 2e §15.5 "Ribosomes and Protein Synthesis" directly (fetched:
        "64 possible mRNA codons," "three specify...termination," "61 specify the addition of amino
        acids," AUG "also encodes the initiation of translation," UAA/UAG/UGA as the stop codons,
        and the tRNA-matching explanation for the code's degeneracy). Worked example: AUG → Met
        (start codon); cross-checked against OpenStax's own example codon CUA → Leu (one of
        leucine's 6 codons).
      - [x] `surface-area-to-volume-ratio-calculator` (5th, build agent's choice) — **DROPPED as a
        duplicate during merge-conflict resolution** (see the batch intro above): batch 5
        independently picked the same calculator and its PR merged first, so that version is the
        one that shipped; this batch's own version (which had cited Wikipedia's "Surface-area-to-
        volume ratio" article after confirming OpenStax Biology 2e §4.1/§4.2 don't actually cover
        SA:V, and added a bonus "ratio if size doubles" output batch 5's version doesn't have) was
        removed from `data/calculators/biology.ts`, along with its now-unused `SHAPE_OPTIONS`
        constant. Kept here as a record of the work done and the citation-correction finding, not
        as a live page.
      - Every worked-example number (all 3 of this agent's own calculators, plus the genetic code
        table's full 64-codon reconstruction) independently re-verified in a standalone Node
        scratch script (no app imports) before committing; script output matched the copy exactly.
      - `npm test` 1509/1509 (snapshot additions additive-only — only the 3 new ids' entries were
        added, confirmed via `git diff --stat`/grep on the snapshot file; 2 new `KNOWN_NON_FINITE`
        entries added, `mutation-rate-calculator` for its 0/0 edge case and
        `surface-area-to-volume-ratio-calculator` for its size=0 divide-by-zero edge case, both
        genuinely undefined the same way `log-reduction-calculator`'s was), lint clean (both before
        and after a post-hoc `seo.description` trim on `surface-area-to-volume-ratio-calculator`,
        caught at 161 chars by the required programmatic length check and fixed to 149), `npm run
        build` exit 0 (391 calculator pages). Static HTML of all 3 new pages checked directly:
        correct H1, every template section id present (concept/how-to-use/formula/worked-example/
        watch-out/faq/references/related), and a valid `FAQPage`/`mainEntity` JSON-LD block on each
        (a pre-existing process already listening on port 3000 was left untouched, per this batch's
        own instructions — no dev server was started by this agent).
      - `biology` 17 → 20 on this branch's own head before reconciling; after dropping the
        duplicate `surface-area-to-volume-ratio-calculator` against batch 5 (merged first), this
        batch's real net contribution is 15 → 19 (4 new calculators). Combined final count after
        both batches 4 and 5: `biology` 24, site-wide 395.
      - Site-wide alias check (grepped every new id/alias against all `data/calculators/*.ts`
        before writing, as required) found zero collisions involving this batch's own 3 new ids.
        It did surface two **pre-existing, unrelated** alias collisions already on `master` before
        this batch started (`"house loan emi calculator"` shared by `mortgage-calculator` and
        `emi-calculator`; `"solution concentration calculator"` shared by `molarity-calculator` and
        `solution-concentration-calculator`) — out of scope for this step per its own instructions
        (build only what was asked, park anything else noticed), recorded in STATUS.md's Parked
        list instead of fixed here.
      - No seed-list candidate skipped this batch beyond the already-documented
        `generation-time-calculator` duplicate above and the `surface-area-to-volume-ratio-
        calculator` duplicate dropped at merge time — 4 of 5 originally-built slots survived.
- [x] Batch 5 (plant/cell biology + biochemistry, 5) — **DONE 2026-11-17**, branch
      `step/48-wave-4-biology-run-5`, PR #119 (merged first, cleanly). Ran in parallel with a
      separate batch-4 agent appending to the same `data/calculators/biology.ts` file — batch 4's
      PR conflicted against this one as expected (including both batches independently picking
      `surface-area-to-volume-ratio-calculator`; this batch's version was kept since it merged
      first) and was resolved by the main session (same hand-splice precedent as batches 2/3
      above).
      ## Progress (run 5)
      - [x] `water-potential-calculator`
      - [x] `protein-molecular-weight-calculator`
      - [x] `molarity-for-buffers-calculator`
      - [x] `inheritance-probability-calculator`
      - [x] `surface-area-to-volume-ratio-calculator`
      - `water-potential-calculator`: Ψ = Ψp + Ψs (pressure potential + solute potential), reusing
        the `pressure` dimension (MPa/bar/kPa all already present — water potential is
        conventionally reported in pressure units even though it is commonly negative, noted
        explicitly in `formula.note`). Cites OpenStax Biology 2e §30.5 (fetched directly) for the
        full 4-term equation (Ψ = Ψs + Ψp + Ψg + Ψm) and its own statements that gravity and matric
        potential are "negligible and easily ignored" at the cellular scale — justifying the
        simplified 2-term formula this calculator solves. Cross-linked to and explicitly
        distinguished from chemistry's `osmolarity-calculator`/`vant-hoff-osmotic-pressure-
        calculator` per the Dedupe section (Ψs = −Π for the same solution, stated in watchOut).
        Worked example: Ψp = 0.7 MPa, Ψs = −0.8 MPa (both within OpenStax's own cited typical
        ranges) → Ψ = −0.1 MPa.
      - `protein-molecular-weight-calculator`: built as a full 20-amino-acid composition calculator
        (the step file's "your call" precision option), not an average-residue-mass approximation —
        a citable "~110 Da average residue" source could not be found via direct fetch, so this
        instead computes each amino acid's exact free molecular weight from its chemical formula via
        the same `molarMassOf`/`ELEMENTS` table (`lib/atomicMasses.ts`, IUPAC/CIAAW) the existing
        `molar-mass-calculator` uses, then subtracts one water per peptide bond (OpenStax Biology 2e
        §3.4: a peptide bond forms "via a dehydration synthesis reaction"). New `lib/aminoAcids.ts`
        (20 standard amino acids + `proteinMolecularWeight()`). Worked example: met-enkephalin
        (Tyr-Gly-Gly-Phe-Met) → 573.665 Da, cross-checked two independent ways (residue-sum formula,
        and directly from its known molecular formula C₂₇H₃₅N₅O₇S) giving an exact match; PubChem
        CID 42785 lists 573.7 g/mol for the same compound (confirmed via direct PubChem PUG REST
        fetch after the HTML page itself returned a CAPTCHA wall). Distinguished from
        `protein-concentration-calculator`'s A280-absorbance framing (what a protein's concentration
        IS in a sample, vs. what its molecular weight IS from composition).
      - `molarity-for-buffers-calculator`: judged genuinely distinct from `molarity-calculator`/
        `moles-to-grams-calculator` (per the Dedupe section's own "build agent's judgment" rule) —
        it chains both formulas into the one direct question a bench prep actually asks (mass =
        molarity × volume × molar mass, solved for any of the four), plus a `referenceTable` of 10
        common lab/buffer reagents' molar masses (new `lib/labReagents.ts`, computed from each
        reagent's formula via the same shared atomic-mass table, not copied from a datasheet — the
        template's "every cell is an expression over a shared module" rule). Explicitly states the
        overlap with the two existing pages in its own concept/formula sections rather than hiding
        it. Worked example: 0.05 mol/L (50 mM) Tris base, 1 L → 6.06 g; cross-checked a second
        example (1 M NaCl, 500 mL → 29.22 g) against moles-to-grams-calculator's own existing
        worked-example figure for the same numbers.
      - `inheritance-probability-calculator`: picked over the Fick's-law osmosis/diffusion-rate
        alternative — reuses `punnett-square-calculator`'s exact genotype-probability math (same
        `GENOTYPE_OPTIONS` 0/1/2 dominant-allele-count encoding) but relabels the AA/Aa/aa outcomes
        as affected/carrier/unaffected for a health/family-planning framing, with a new
        `INHERITANCE_PATTERN_OPTIONS` toggle (autosomal recessive vs. dominant) controlling which
        genotypes count as "affected." Explicitly states the math is identical to
        `punnett-square-calculator` in its own concept section rather than hiding the overlap — the
        same "same algebra, different real search intent" precedent as `cell-dilution-calculator`
        vs. `dilution-calculator`. Cites MedlinePlus Genetics (NIH), fetched directly, for cystic
        fibrosis (autosomal recessive) and Huntington's disease (autosomal dominant) as real,
        non-invented example conditions — no pet/human drug-dosage content, no invented risk
        statistics beyond the Mendelian math itself. Worked examples: two Aa carrier parents of a
        recessive condition → 25% affected / 50% carrier / 25% unaffected; one Aa-affected parent of
        a dominant condition × one aa parent → 50% affected / 50% unaffected (matching MedlinePlus's
        own "usually inherits...from one affected parent," roughly 50%, for Huntington's).
      - `surface-area-to-volume-ratio-calculator`: built despite the batch-4 duplicate-pick risk
        noted in this task's brief, since no equally-good alternative was found (a potometer-based
        transpiration-rate formula could not be confirmed via direct fetch this session). Sphere
        (SA:V = 3/r) and cube (SA:V = 6/s) models, a classic intro cell-biology topic. Cites OpenStax
        Biology 2e §4.1 (fetched directly) for its real red-blood-cell size figure (~8 µm diameter),
        used as one of three real worked benchmarks (bacterium-scale 1 µm radius sphere → 3/µm; RBC
        modeled as a 4 µm radius sphere → 0.75/µm; human egg cell modeled as a 50 µm radius sphere →
        0.06/µm) plotted on a `logScale` visual. No new unit dimension added — inputs/outputs use
        plain µm/µm²/µm³ numbers directly (same precedent as `ligation-calculator`'s plain-number
        inputs), since a unit menu wasn't needed for a single implied display unit.
      - **Skipped:** none from this batch's own 5 slots — all were built. (The one real judgment
        call, `molarity-for-buffers-calculator`, was built rather than skipped; see above for why.)
      - Every worked-example number (water potential's addition, met-enkephalin's residue-sum vs.
        direct-formula cross-check, the Tris/NaCl buffer-mass figures, both inheritance-probability
        crosses, and all five SA:V ratios including the three visual benchmarks) independently
        re-verified in a standalone Node scratch script (no app imports) before committing; script
        output matched the copy exactly.
      - `npm test` 1503/1503 (snapshot diff is additive-only, 238 lines, touching exactly the 5 new
        ids; two new `KNOWN_NON_FINITE` entries added for `protein-molecular-weight-calculator`
        (all-zero amino acid counts → undefined molecular weight) and
        `surface-area-to-volume-ratio-calculator` (zero size → divide by zero), same precedent as
        batch 3's `log-reduction-calculator` entry), lint clean, `npm run build` exit 0 (391
        calculator pages). Static HTML of all 5 new pages checked directly for H1/FAQPage JSON-LD
        presence (a pre-existing dev-server process on port 3000 from another session was left
        untouched, per this batch's own instructions).
      - `biology` 15 → 20 from this branch's point of view (merged first; reconciled against batch
        4 above — final combined count after both: `biology` 24, site-wide 395).
- [ ] Batch 6 (simple non-medical animal biology, 5)
- [ ] Visual-QA spot-check (once the site crosses ~420 calculators total — site is at 395 after
      batches 4+5 both landed, so not yet due; batch 6 (~5 more, though one duplicate pick already
      cost this wave a calculator) should get it close — run the spot-check at the end of batch 6)
- [ ] STATUS.md updated, `biology` category count recorded, Wave 4 handed off to ecology next
      (ecology still needs its own go-ahead per D13/D22 — do not start it without one)
