# UX-08 — sub-group every category + mirror in the Categories dropdown

Off the numbered sequence (like UX-01..12). Branch per batch: `ux/category-groups-<batch>`.

User asked (2026-11-15) to extend UX-06's grouping (`mdFiles/steps/ux-06-category-groups.md`) —
today only `math`, `statistics` and `measurements` have labeled sub-sections — to **every**
category, no exceptions even for a 1-2-calculator one, and to make the header's Categories
dropdown show the same grouped sections its own category page does.

## What already exists (UX-06) — read this first, don't rebuild it

- `CalculatorConfig.group?: string` (`data/calculators/types.ts`) — optional label, already there.
- `/categories/<id>`'s own page (`components/CategoryCalculatorFilter.tsx`) **already renders
  grouped sections generically**: its `buildGroups()` helper groups by `group`, in the order each
  label is first seen in the category's own data-file order, and — critically — **requires every
  calculator in the category to have a non-empty `group`**, or it silently falls back to one flat
  grid (`buildGroups` returns `null` if `items.some((item) => !item.group)`). This means: **tagging
  every calculator in a category is the entire job for that category's own page** — no component
  code changes needed there, ever. Don't touch `CategoryCalculatorFilter.tsx`.
- `data/calculators/categories.spec.ts` enforces the invariant both ways: every calculator in a
  `GROUPED_CATEGORIES` category has a group, and no calculator outside it does. **Every batch must
  add its newly-completed categories to `GROUPED_CATEGORIES`** — forgetting this makes the test
  pass by accident (both assertions skip ungrouped categories) rather than actually guarding
  anything, which defeats the point.

## What's new in UX-08

### 1. The Categories dropdown (`components/CategoriesMenu.tsx`) doesn't group at all yet

Its right pane (`categoryCalculators.map(...)`, one flat `grid`) needs the same grouped-sections
treatment `CategoryCalculatorFilter.tsx` already has. Two things block this today:

- `lib/navData.ts`'s `NavCalculator` type (the slim, client-safe shape `CategoriesMenu` actually
  consumes — it must never import `data/calculators` directly, see that file's own comment) doesn't
  carry `group` yet. Add `group?: string` to `NavCalculator` and populate it in `buildNavData()`.
- `CategoriesMenu.tsx`'s right pane needs its own `buildGroups`-equivalent. **Extract
  `CategoryCalculatorFilter.tsx`'s existing grouping logic into a small shared helper** (e.g.
  `lib/groupCalculators.ts`, generic over `{ group?: string }`-shaped items) rather than
  duplicating it — both components need the exact same "all-or-nothing, first-seen order" rule, and
  two independent copies of that rule are a recipe for them silently drifting apart later. Update
  `CategoryCalculatorFilter.tsx` to import the shared helper too (it's a non-behavior-changing
  refactor for that file — verify with a diff that its rendered output is byte-identical for
  math/statistics/measurements before and after).

This is a one-time code change — do it once, in the first batch, not per-category.

### 2. Tag every remaining calculator's `group` field — real topical judgment, not mechanical

~165 calculators across 15 category files (everything except `math`/`statistics`/`measurements`,
already done). For each category: read through its calculators (one read of the whole file is
fine — these are shorter than the mega-files like `measurements.ts`), decide a small number of
real, meaningful sub-topics a visitor would recognize (UX-06's precedent: math got 5 groups across
29 calculators, statistics got 4 across 25 — roughly 5-8 calculators per group is a reasonable
density, not a hard rule), and tag every single calculator in that category with one. **No
calculator in a touched category may be left untagged** — if nothing else fits, that's a sign the
group taxonomy needs one more bucket (e.g. "Other"/"Tools", which UX-06's math category already
uses once), not a sign the calculator should be skipped.

Group label style, matching UX-06's precedent: short Title Case noun phrases ("Algebra", "Hypothesis
Testing", "Relationships Between Variables") — not full sentences, not the category name repeated.

**A 1-2-calculator category still needs a `group`** per the user's explicit "no exceptions" — even
if that means one group label covering the single calculator. Don't skip these as "not worth it."

### Batches (by current calculator count per category — regenerate before trusting these numbers,
they will have shifted from other in-flight work like step 60/UX-10)

1. **Code (section 1 above) + `chemistry` (~45) + `physics` (~23)** — biggest two, do first.
2. **`home` (~35) + `food` (~27)**
3. **`sports` (~16) + `finance` (~15)**
4. **`work` (~7) + `shopping` (~6) + `health` (~6) + `auto` (~6)**
5. **`time` (~5) + `travel` (~4) + `text` (~2) + `creator` (~2) + `education` (~1)**

## Acceptance checks (every batch)

- `npm test` / `npm run lint` / `npm run build` all pass.
- `data/calculators/categories.spec.ts`'s `GROUPED_CATEGORIES` set includes every category this
  batch finished (and every prior batch's), and the two tests still pass meaningfully (not just by
  both sides being empty).
- Manual check in a dev server: each newly-grouped category's own `/categories/<id>` page shows
  labeled sections (not a flat grid) — this confirms every calculator in that category really did
  get tagged, since `buildGroups()` is all-or-nothing.
- Manual check of the Categories dropdown (desktop header → Categories): selecting a newly-grouped
  category shows the same labeled sections in the right pane. Also check one NOT-yet-grouped
  category still shows its old flat grid (confirms the all-or-nothing fallback still works there
  too) and the cross-category search results (typing a query) are still one flat list, ungrouped —
  same rule the category page already follows.
- `CategoryCalculatorFilter.tsx`'s rendered output for `math`/`statistics`/`measurements` is
  unchanged after the batch-1 refactor (diff the actual rendered HTML or screenshot before/after,
  don't just eyeball the code).

## Progress

- [x] Step file written
- [x] Batch 1: `CategoriesMenu.tsx` dropdown grouping (shared `lib/groupCalculators.ts` helper,
      `NavCalculator.group`) + `chemistry` + `physics` tagged — PR #83, branch
      `ux/category-groups-batch1`
  - `lib/groupCalculators.ts` extracted from `CategoryCalculatorFilter.tsx`'s `buildGroups()`
    (pure extraction — verified unchanged render for measurements/math/statistics)
  - `lib/navData.ts`'s `NavCalculator.group` added, populated in `buildNavData()`
  - `CategoriesMenu.tsx` right pane renders grouped sections when every calculator in the
    selected category has a `group`, flat grid otherwise; search results stay one flat list
  - `chemistry.ts`: 45/45 tagged, 13 groups (Moles & Molar Mass 5, Concentration Units 6,
    Dilutions & Solution Properties 4, Gas Laws 3, Acid-Base Chemistry 5, Reaction
    Stoichiometry & Yield 4, Chemical Kinetics 4, Equilibrium & Thermodynamics 3, Atomic &
    Molecular Structure 3, Spectroscopy 1, Colligative Properties 3, Redox & Electrochemistry
    2, Thermochemistry 2)
  - `physics.ts`: 21/21 tagged, 6 groups (Motion & Forces 5, Energy & Work 4, Fluids & Matter
    2, Electricity & Circuits 5, Waves & Light 3, Thermal & Nuclear 2)
  - `categories.spec.ts`'s `GROUPED_CATEGORIES` now includes `chemistry`/`physics`
  - `npm test` 1123/1123, lint clean, `npm run build` 295/295 pages. Manually verified in a
    dev server: `/categories/chemistry` and `/categories/physics` show labeled sections; the
    Categories dropdown mirrors the same sections for both; `/categories/finance` (ungrouped)
    still shows a flat grid in both the category page and the dropdown; typing in the
    dropdown's search box still returns one flat list across categories.
- [x] Batch 2: `home` + `food` — PR #85, branch `ux/category-groups-batch2`
  - `home.ts`: 27/27 tagged, 8 groups (Walls & Paint 3, Flooring & Tiling 3, Concrete & Masonry
    5, Landscaping Materials 5, Outdoor Structures 3, Roofing 2, HVAC & Energy 3, Carpentry &
    Layout 3)
  - `food.ts`: 17/17 tagged, 5 groups (Baking & Cakes 6, Meat & Poultry 4, Eggs & Grains 2,
    Drinks & Brewing 3, Party Planning 2) — actual calculator counts for both categories came in
    lower than this file's earlier ~35/~27 estimates, as the "regenerate before trusting" note
    above anticipated
  - `categories.spec.ts`'s `GROUPED_CATEGORIES` now includes `home`/`food`
  - `npm test` 1123/1123, lint clean on every file this batch touched (a repo-wide `npm run
    lint` also reports 144 errors from an unrelated, concurrently-running agent's
    `.claude/worktrees/*` directories being swept into the glob — pre-existing noise, not from
    this branch; confirmed by linting with `.claude/**` excluded, which is clean), `npm run
    build` 295/295 pages. Manually verified in a dev server (desktop + the Chrome extension):
    `/categories/home` and `/categories/food` show labeled sections matching the group/count
    plan exactly; the Categories dropdown mirrors the same grouped sections for both; the
    dropdown's Finance row (still ungrouped) stays a flat grid; typing a search query in the
    dropdown returns one flat, ungrouped list.
  - Found and parked (not fixed, out of scope for this batch): `/categories/home` throws a
    React "two children with the same key, `Home`" console error from `components/Breadcrumb.tsx`
    — the category is literally titled "Home", which collides with the breadcrumb's own root
    "Home" crumb. Pre-existing, unrelated to group tagging (confirmed `/categories/food` has no
    such error); added to STATUS.md's Parked list.
- [ ] Batch 3: `sports` + `finance`
- [ ] Batch 4: `work` + `shopping` + `health` + `auto`
- [ ] Batch 5: `time` + `travel` + `text` + `creator` + `education`
- [ ] STATUS.md updated with a final summary (every category's group count)
