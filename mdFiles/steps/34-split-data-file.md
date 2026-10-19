# Step 34 — Split the calculator data file (E7)

## Progress

- [x] Step file, draft PR
- [x] `data/calculators/` created: `types.ts`, one file per category, `index.ts`; old `data/calculators.ts` deleted
- [x] Import paths fixed (`.ts`-extension imports used by the Node test runner)
- [x] Order guard test; `npm test` with the snapshot unchanged
- [x] Build, lint, route/sitemap comparison against `master`
- [ ] Docs (add-calculator skill, calculator-builder agent, template v2, CLAUDE.md, README), STATUS.md, PR ready

Resume from the first unchecked box.

**Scope (from `STATUS.md`):** `data/calculators/<category>.ts`. Moved before the batches: every batch
editing one 2,000-line file means huge diffs and a conflict with any other open branch.

**Spec:** `mdFiles/calculator-rollout-plan.md` §2 E7.

---

## Layout

```
data/calculators/
  types.ts          # every type that lived at the top of data/calculators.ts (CalculatorConfig, breakdown/solver types…)
  index.ts          # categories, the display ORDER list, calculators, findCalculator, findCategoryCalculators; re-exports the types
  finance.ts        # export const finance: CalculatorConfig[] = [ … ]
  health.ts … physics.ts   (one per category id, 13 files)
data/calculators.spec.ts           # stays put, so its .snapshot file keeps its name
data/calculators/index.spec.ts     # guards: unique ids, ORDER complete, each file holds only its own category
```

`@/data/calculators` resolves to `data/calculators/index.ts`, so the app's imports do not change.
The Node test runner does not resolve directory imports or the `@/` alias, so files reached by
`npm test` import `../data/calculators/index.ts` / `./types.ts` with explicit extensions.

## Decisions

- **Order is an explicit slug list in `index.ts`.** The old array interleaved categories (finance,
  finance, finance, shopping, …), and listings, the sitemap, search and the snapshot test all follow
  it. Concatenating category files would reorder them. `calculators` = all category arrays sorted by
  position in `ORDER`; a calculator missing from `ORDER` sorts last (stable, in category-file order),
  so a new calculator shows up even if someone forgets the list, and the guard test fails to say so.
- **Section-divider comments are dropped** (`// ── Time & Date ──`): the file name now says it. The
  custom-component stub divider becomes a one-line comment on each of the five stubs.
- Pure move: object text is copied verbatim (re-indented nowhere; same 2-space indentation).

## Acceptance

- `npm test` passes; `data/calculators.spec.ts.snapshot` unchanged (`git diff --exit-code`).
- `npm run build` passes.
- `calculators.map(c => c.id)` and `categories` identical to `master`; built `sitemap.xml` identical.
- Every calculator object identical to `master` (deep compare, functions by source text).
- `npm run lint` clean on source (`--ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`).
