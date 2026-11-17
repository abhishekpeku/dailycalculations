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
- [ ] Batch 1 (open category + core bio-lab, 5)
- [ ] Batch 2 (genetics, 5)
- [ ] Batch 3 (molecular biology lab techniques, 5)
- [ ] Batch 4 (population biology + genetics extensions, 5)
- [ ] Batch 5 (plant/cell biology + biochemistry, 5)
- [ ] Batch 6 (simple non-medical animal biology, 5)
- [ ] Visual-QA spot-check (once this wave crosses ~420 calculators)
- [ ] STATUS.md updated, `biology` category count recorded, Wave 4 handed off to ecology next
      (ecology still needs its own go-ahead per D13/D22 — do not start it without one)
