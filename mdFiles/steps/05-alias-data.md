# Step 05 — Calculator schema + alias data

**Spec:** `mdFiles/instructions.md` §1.3 (schema), §1.5 (the full alias/cluster tables)
**Depends on:** 04 (`updatedAt` already added to the type).
**Blocks:** 06, 07, 08.

## Why

Every calculator has exactly one title and one description, so the site targets one phrasing per
tool. The queries people actually type — `home loan emi calculator`, `take home pay calculator`,
`lbs to kg`, `calories calculator` — are attached to nothing. And with no `related` field there is
no internal linking between sibling calculators, so every page is a dead end.

`aliases` and `related` are the raw material for steps 07 (JSON-LD `alternateName`) and 08
(on-page copy, related-tools block, search matching). Nothing in Phase B works without this data.

## ⚠ Context management — read before starting

This is a **large mechanical edit across a 1,600-line file**. Doing it in one pass will fill the
context window and degrade accuracy near the end, which is exactly where mistakes get missed.

**Work in 4 batches. After each batch: `npm run build`, commit, and tick the box below.**
If context still runs short, stop after any completed batch and update `STATUS.md` with
`05 IN PROGRESS — batches 1-2 done`. A fresh session resumes from the next unticked box.

- [ ] **Batch 1** — Clusters A, B, C (finance + work): 15 calculators
- [ ] **Batch 2** — Clusters D, E, F (shopping + health + measurements): 16 calculators
- [ ] **Batch 3** — Clusters G, H, I (auto + home + time): 16 calculators
- [ ] **Batch 4** — Clusters J, K, L, M (travel + education + creator + text): 8 calculators

Total 53 + 2 (`bmr-calculator`, `word-counter`) that do not exist yet — **skip those two**; they
arrive in steps 23 and 26 and carry their own alias data.

## Do

1. **Extend the type** in `data/calculators.ts`:

   ```ts
   export type CalculatorConfig = {
     // …existing fields…
     /** Search synonyms. Surfaces in on-page copy, search matching, JSON-LD alternateName. */
     aliases: string[];
     /** 3-6 sibling calculator ids for the "Related calculators" block. */
     related: string[];
     /** Extra slugs that 301 to this calculator (step 06). */
     redirectFrom?: string[];
     updatedAt: string;
   };
   ```

   `aliases` and `related` are **required**. That is deliberate: it makes it impossible to add a
   calculator without them, which is what stops the taxonomy rotting.

2. **Populate from `mdFiles/instructions.md` §1.5.** Copy the values exactly — they were chosen for search
   volume and cluster balance, not invented per-file. Read only the cluster tables for the batch you
   are on, not the whole section.

3. **Add `redirectFrom` to these five only** (the rest stay undefined):

   | Calculator | `redirectFrom` |
   |---|---|
   | `car-payment-calculator` | `['auto-loan-calculator', 'car-loan-calculator']` |
   | `mortgage-calculator` | `['home-loan-calculator', 'house-loan-emi-calculator']` |
   | `character-counter` | `['word-counter']` — **remove this in step 26**, when `word-counter` becomes a real page |
   | `tdee-calculator` | `['bmr-calculator']` — **remove this in step 23**, when `bmr-calculator` becomes a real page |
   | `percentage-calculator` | n/a — does not exist yet (step 24) |

4. **Validate after each batch** with a throwaway script:

   ```bash
   node -e "
   const s=require('fs').readFileSync('data/calculators.ts','utf8');
   const ids=[...s.matchAll(/^    id: '([^']+)'/gm)].map(m=>m[1]);
   const rel=[...s.matchAll(/^    related: \[([^\]]*)\]/gm)]
     .map(m=>m[1].split(',').map(x=>x.trim().replace(/'/g,'')).filter(Boolean));
   const bad=[...new Set(rel.flat())].filter(r=>!ids.includes(r));
   console.log('calculators:',ids.length);
   console.log('broken related ids:', bad.length ? bad : 'none');
   "
   ```

   Expect `none`. A typo'd id in `related` renders a dead internal link in step 08 — cheap to catch
   here, annoying to find later.

## Acceptance

- [ ] All 4 batch boxes ticked.
- [ ] `npm run build` passes.
- [ ] TypeScript reports no missing `aliases` / `related` / `updatedAt` — i.e. all 53 are populated.
- [ ] The validation script reports **0 broken related ids**.
- [ ] Every calculator has ≥3 aliases and ≥3 related entries.
- [ ] No calculator lists **itself** in `related`:
      `node -e "…"` or eyeball during each batch.

## Do NOT

- Do not render any of this yet. No UI changes in this step — that is step 08. This step is pure
  data, which is what makes it safe to split across sessions.
- Do not invent aliases beyond the tables. If one looks wrong, note it in `STATUS.md` → `Parked`
  rather than silently substituting.
- Do not add the new calculators from §1.5 that are marked **(new)**. They belong to Phase F.

## Finish

Update `mdFiles/STATUS.md`: mark 05 `DONE`, note the two `redirectFrom` entries that must be removed
later (steps 23 and 26) so they are not forgotten, and confirm the validation script passed.
