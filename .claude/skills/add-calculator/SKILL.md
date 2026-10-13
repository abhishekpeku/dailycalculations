---
name: add-calculator
description: Add a new calculator (or a batch) to Daily Calculations using the v2 page template — solve-for-any-field widget, units, concept/formula/worked-example/FAQ/references content, verified numbers. Use whenever the user asks to build, add or create a calculator, or to fill a sector wave.
---

# Add a calculator (v2 template)

Read first, every time:
1. `CLAUDE.md` (working protocol and conventions)
2. `mdFiles/calculator-template-v2.md` (the page spec, which is the source of truth for fields and content rules)
3. `mdFiles/STATUS.md`: check the current step and the Parked list. If the work belongs to a
   numbered step, follow that step's file instead of improvising.
4. The `force-calculator` entry in `data/calculators.ts`: the reference implementation to copy.

## Procedure

1. **Branch.** Never work on `master`. Use `git checkout -b calc/<id>` (or `wave/<n>-<sector>` for a batch).
   A batch is **5 calculators**, not 10. Every agent commits and pushes after each sub-task (each calculator in a batch), keeps a Progress checklist in its step file, and opens a draft PR early, so an interrupted run can be resumed from the checklist.
   Put a `## Progress` checklist (one box per calculator) at the top of the step file, push the branch,
   and open a draft PR (`gh pr create --draft --base master`) before building. After each calculator
   is verified, tick its box, then commit and push (`step NN: <id>`).
2. **Pick the widget type.** If the formula can be rearranged, use `solver`. Otherwise use `inputs` + `compute`.
   Add any missing unit dimension to `lib/units.ts` (NIST SP 811 factors), not inline.
   A variable with no closed form (a loan's rate) needs no `solve` entry: give the solver an
   `equation` (residual, 0 when consistent) and the variable `bounds`, and the widget solves it
   numerically. Put derived figures (total interest, total paid) in `outputs`, and mark
   input-only fields (down payment, split count) `fixed: true`. See template §2. Take the result
   visual from the kit in `components/visuals/` (template §2, "Result visuals"). Never draw a new one.
3. **Add the object** to `calculators` in `data/calculators.ts`, with every v2 field:
   `id` (kebab-case, ends in `-calculator` or `-converter`), `category`, `updatedAt` (today),
   `aliases` (≥ 4 real search phrasings), `related` (3–4 **existing** ids), `title`, `description`,
   `example`, `solver?`, `content` (concept, howTo, formula, workedExample, watchOut, references,
   lastReviewed), `inputs`, `seo` (title ≤ 60 chars, description ≤ 160, 5–8 FAQ), `compute`.
   No new page files. The page renders from the object.
4. **Write the content in our own words.** Cite primary sources only. No invented people or credentials.
5. **Verify every number.** Write a throwaway script in the scratchpad that imports nothing from
   the app. Re-implement the formula, recompute the worked example, every FAQ figure, the
   `example` line and the benchmarks, then compare them to the copy. Fix the copy, not the
   check. Report the script's output.
6. **Check:** `related` ids exist, there's no self-reference, `id` is unique and doesn't collide
   with any `redirectFrom`, and `aliases` aren't duplicated on another calculator.
7. **Build:** `npm run lint` and `npm run build`, both run in the background. Both must pass.
8. **Look at it:** start `npm run dev` in the background, fetch `/calculators/<id>` with curl,
   and confirm the H1, the TOC, every section id and the JSON-LD script are present.
   - **In the main session:** leave the dev server running and open the page in a Chrome tab
     that you **don't close**. The user wants to look at it themselves. Tell them the URL.
   - **As a background agent:** stop the server before finishing (find the PID with
     `netstat -ano | findstr :3000`, run `taskkill /PID <pid> /F`, and re-check). A stray
     server breaks `npm run deploy` with `EPERM`.
9. **Record:** if this is a numbered step, update `mdFiles/STATUS.md` as the protocol requires.
   Otherwise add a line to the session log under the branch name.
10. **Commit** on the branch (`calc: add <id>` or `step NN: …`), **push the branch**, update the
    draft PR body (what was added + build/verification output) and mark it ready with `gh pr ready`.
    Never merge and never deploy. The main session merges each passing PR without asking the user
    (see `mdFiles/calculator-rollout-plan.md` §5 and `STATUS.md` D11), so the user never has to
    merge anything. Only one builder agent runs at a time, so finish (PR opened) before stopping.
