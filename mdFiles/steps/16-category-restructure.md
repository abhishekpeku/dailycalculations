# Step 16 — Category restructure 11 → 14

**Phase D.** Spec: `mdFiles/instructions.md` §1.1, §1.2. Depends on: step 04 only.
Runs during the step-11 measure-gate wait, **before** the 12-15 content rollout — those batches are
grouped by the *new* category names, and writing prose into categories that are about to be renamed
means touching the same 52 files twice.

---

## Goal

Fix the taxonomy so a calculator sits in the category a user would look in, kill the two thin
categories, and add the new ones — without changing a single `/calculators/<slug>` URL.

## Scope

1. Rename `social` → `creator` ("Creator Tools").
2. Merge `taxes` into `shopping`, retitled "Shopping & Tax".
3. Create `travel` and `text`.
4. Apply the 9 reassignments from §1.2.
5. Refresh the `description` of every category whose membership changed.
6. 301 `/categories/taxes` → `/categories/shopping` and `/categories/social` → `/categories/creator`,
   **derived** — no hand-written slug list in `middleware.ts`.

## Deviation from §1.2 — `math` and `tech` are deferred

§1.2 says create four categories. Only two are created here.

`math` and `tech` have **zero** members until steps 24 and 25 build their calculators. Creating them
now ships two category pages with an empty card grid, each of them prerendered, linked from the
homepage and the listing page, and submitted in `sitemap.xml`. §1.2's whole argument for merging
`taxes` is that a two-item category page is not worth having; a zero-item one is strictly worse, and
it would sit in Google's index for the length of Phase F.

So: **step 24 adds the `math` category entry alongside its five calculators, step 25 adds `tech`
alongside its four.** The end state is still 14. Nothing else in this step changes.

Result: **11 → 12 categories now**, 14 after Phase F.

## Target state

| id | Title | Members after this step |
|---|---|---|
| `finance` | Finance | mortgage, loan, emi, loan-prepayment, compound-interest, investment, inflation, paycheck → **8** |
| `health` | Health | bmi, calorie, tdee, water-intake, running-pace, pregnancy-due-date → **6** |
| `home` | Home | paint, tile, concrete, wallpaper, furniture-fit, electricity-bill → **6** |
| `auto` | Auto | car-payment, fuel-cost, gas-cost, ev-charging, toll-cost, commute-cost → **6** |
| `shopping` | Shopping & Tax | sales-tax, tip, discount, cashback, unit-price → **5** |
| `time` | Time & Date | age, date-difference, work-hours, sleep-time, pomodoro → **5** |
| `travel` | Travel | travel-budget, visa-stay-days, currency-converter, timezone-meeting-planner → **4** |
| `work` | Work & Career | salary-raise, meeting-cost, freelancer-rate, pto → **4** |
| `measurements` | Measurements | miles-km, f-c, lbs-kg, gallons-litres → **4** |
| `creator` | Creator Tools | youtube-earnings, instagram-engagement → **2** |
| `text` | Text & Writing | character-counter, hashtag-counter → **2** |
| `education` | Education | gpa → **1** (step 26 takes it to 5) |

Total 53. `taxes` and `social` cease to exist.

## The 9 reassignments

| id | from → to |
|---|---|
| `emi-calculator` | `shopping` → `finance` |
| `travel-budget-calculator` | `finance` → `travel` |
| `visa-stay-days-calculator` | `finance` → `travel` |
| `currency-converter` | `finance` → `travel` |
| `timezone-meeting-planner` | `time` → `travel` |
| `character-counter` | `social` → `text` |
| `hashtag-counter` | `social` → `text` |
| `sales-tax-calculator` | `taxes` → `shopping` |
| `tip-calculator` | `taxes` → `shopping` |

Plus the two straight renames: `youtube-earnings-calculator` and `instagram-engagement-calculator`
go `social` → `creator`.

## Work

### 1. `data/calculators.ts`

- Add `redirectFrom?: string[]` to `CalculatorCategory`, mirroring the field already on
  `CalculatorConfig`. This is what makes the category 301s derivable.
- Rewrite the `categories` array to the 12 above, ordered by member count so the homepage grid leads
  with the fat categories. `shopping` carries `redirectFrom: ['taxes']`, `creator` carries
  `redirectFrom: ['social']`.
- Rewrite the `description` of `finance`, `shopping`, `time` and `creator` — each lost or gained
  members and each currently names a calculator that is leaving.
- Apply the 11 `category:` edits (9 reassignments + 2 renames).

**Do not bump `updatedAt` on any calculator.** Moving a page between category listings does not
change the page's own content — same rule as steps 05, 07, 08 and 09. The calculator URL, H1, copy,
widget and FAQ are all untouched; only its breadcrumb's middle crumb changes.

### 2. `lib/redirects.ts`

Add a `CATEGORY_REDIRECTS` export built the same way `CALCULATOR_REDIRECTS` is — flatMap over
`categories`, `redirectFrom` → `/categories/<id>`. Retiring a category redirect stays a one-line
delete in the data file.

### 3. `middleware.ts`

Spread `CATEGORY_REDIRECTS` into `RENAMED_PATHS` next to `CALCULATOR_REDIRECTS`. Nothing else.

⚠ Targeted edit only. Per step 06: rewriting this file through a heredoc collapses the `\` in the
matcher regex and silently 404s every route while the build still passes. Check that line
byte-for-byte afterwards.

## Out of scope

- `README.md`'s hand-written calculator list — it has `### Taxes` and files `unit-price-calculator`
  under Home. Step 27 regenerates the whole list from `data/calculators.ts`; do not hand-patch it here.
- Category / listing page JSON-LD and breadcrumbs — parked, and worth doing *after* this step settles
  the names.
- `messages/en.json` prose that enumerates topics ("finance, health, measurements, taxes, …").
  Those read as subject matter, not category ids, and stay true.
- Anything in `related`, `aliases` or `content`. Category is not part of those.

## Acceptance checks

1. `npm run build` and `npm run lint` pass.
2. `categories` has 12 entries; every `calculator.category` resolves to one of them (0 orphans).
3. Member counts match the target table exactly; no category below 1, none empty.
4. `taxes` and `social` appear nowhere in `data/calculators.ts`.
5. Sitemap: 72 → **73** `<url>` entries, all unique, none containing `/categories/taxes` or
   `/categories/social`.
6. Against a real `next start` on a free port (**not :3000** — something else is bound there):
   `/categories/taxes` → **301** `/categories/shopping`, `/categories/social` → **301**
   `/categories/creator`, query string preserved, and `/en/categories/taxes` resolves in **one** hop.
7. `/categories/travel` and `/categories/text` render 200 with 4 and 2 cards.
8. The 11 moved calculators still answer 200 on their unchanged `/calculators/<slug>` URL, and their
   breadcrumb + `BreadcrumbList` JSON-LD both name the new category.
9. 0 `/en/` hrefs in the prerendered category pages.
10. `middleware.ts` matcher line is exactly `'/((?!api|_next|_vercel|.*\..*).*)'` with a double
    backslash in source.
