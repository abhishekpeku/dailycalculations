## Progress (batch 1, branch `step/62-solar-home-energy-batch1`)

- [x] Category-opening work: `data/calculators/solar.ts`, `data/calculators/index.ts` entry, `lib/categoryTheme.ts` + `components/IconTile.tsx` color/icon pair (sun-yellow + sun glyph)
- [x] `solar-panel-system-size-calculator`
- [x] `solar-savings-calculator`
- [x] `solar-payback-period-calculator`
- [x] `solar-loan-payment-calculator`
- [x] `net-metering-savings-calculator`
- [x] `npm test` / lint / build pass (1651/1651), snapshot regenerated (pure additions, 5 new entries)
- [x] PR opened: #141 (https://github.com/abhishekpeku/dailycalculations/pull/141)

Batch 1 done 2026-11-18. Next: batch 2 (storage & consumption, 5) and batch 3 (everyday efficiency
novelties, 4) in separate sessions, per the "one batch at a time" rule.

## Progress (batch 2, branch `step/62-solar-home-energy-batch2`)

- [x] `battery-backup-sizing-calculator`
- [x] `off-grid-solar-calculator`
- [x] `home-electricity-consumption-calculator`
- [x] `appliance-energy-cost-calculator`
- [x] `heat-pump-savings-calculator`
- [x] `npm test` (1664/1664) / lint / build pass, snapshot regenerated (pure additions, 5 new entries)
- [x] Merged `origin/master` mid-batch (step 63 batch 2, Insurance, landed first) — clean
      auto-merge, no conflicts, re-verified test/lint/build after
- [x] PR opened and marked ready: #144 (https://github.com/abhishekpeku/dailycalculations/pull/144)

Batch 2 done 2026-11-18. Category now at 10/~14. Next: batch 3 (everyday efficiency novelties, 4)
in a separate session, per the "one batch at a time" rule.

Sourcing note: `nrel.gov`/`pvwatts.nrel.gov` still unreachable (DNS failure) from this sandbox, same
as batch 1. Most of `energy.gov`'s old `/energysaver/*` consumer-tips paths now 404 (site
restructure) — `/eere/solar/*` and `energystar.gov` pages still work. Substituted EnergySage +
EIA + ENERGY STAR + DOE `/eere/solar/*` pages throughout, same substitution precedent as batch 1.
WebSearch quota was exhausted immediately (0 of 200 remaining at session start) — all research this
batch used WebFetch directly against known/guessed URLs instead.

## Progress (batch 3, branch `step/62-solar-home-energy-batch3`) — final batch, closes step 62

- [x] `led-lighting-savings-calculator` — incandescent/CFL→LED wattage swap and annual savings,
      cited to ENERGY STAR's lumens-equivalence table and Wikipedia's "LED lamp" article for the
      real LED-wattage range (no single official incandescent-to-LED wattage ratio exists, so the
      calculator takes both wattages as direct user inputs rather than assuming one).
- [x] `smart-thermostat-savings-calculator` — ENERGY STAR's published "more than 8%" average
      heating/cooling savings rate applied to the user's own entered cost. Found and disclosed
      (rather than papered over) that ENERGY STAR's own "$50/yr average" example and its separate
      "more than $900/yr" heating-and-cooling-cost average imply two different baselines ($50÷8% =
      $625, not $900) — the calculator defaults to the $900 figure and states the discrepancy
      explicitly in `workedExample.explanation` and a `watchOut` item.
- [x] `water-heater-energy-cost-calculator` — electric storage vs. gas storage vs. gas tankless vs.
      heat pump running-cost comparison. `energy.gov/energysaver/water-heating` and
      `energystar.gov`'s own water-heater benefit pages don't publish a usable efficiency-factor
      table, so the 4 typical EFs (0.95 / 0.60 / 0.90 / 1.97) are sourced from Wikipedia's "Water
      heating" article, which itself cites the real 2015 U.S. federal minimum-efficiency standards.
      The calculator's own heat-energy formula was cross-checked against that same article's own
      worked example (60 gal, 50°F→122°F) and reproduced its $0.40 gas / $1.68 electric figures
      exactly before building the rest of the page.
- [x] `ev-solar-charging-offset-calculator` — the real day/night timing-mismatch nuance the step
      file asked for: reports the real-time (physically simultaneous) solar-to-EV offset alongside
      the larger best-case net-metered offset, cited to DOE's Alternative Fuels Data Center ("most
      drivers ... charge ... overnight at home") and cross-linked to `net-metering-savings-
      calculator` and `battery-backup-sizing-calculator`. Read `auto`'s `ev-charging-calculator`
      first per the step file's instruction — confirmed genuinely distinct (that calculator is a
      flat-rate cost-per-charge/mile tool with no solar timing dimension at all), so this was kept,
      not dropped.
- [x] Every worked-example/FAQ number re-verified in a standalone Node scratch script (no app
      imports) before writing copy, including the Wikipedia cross-check above.
- [x] Grepped every new id/alias against all `data/calculators/*.ts` site-wide — no collisions.
      Glyphs (`LED`, `8%`, `H2O`, `EV`) checked unique within `solar` per `glyph.spec.ts`.
- [x] `npm test` 1685/1685 (snapshot regenerated via `npm run test:update`, additive-only: 191
      insertions, 0 deletions), lint clean, `npm run build` green (553 static pages). One
      programmatic check caught a 62-character `seo.title` (over the 60 limit) on
      `water-heater-energy-cost-calculator`, fixed before opening the PR.
- [x] `origin/master` had not moved ahead at push time — no merge needed.
- [x] 4 pages spot-checked on a local dev server (H1, JSON-LD, FAQ and References sections present
      on all 4); dev server killed afterward, port 3000 confirmed clear.
- [x] PR opened: #147 (https://github.com/abhishekpeku/dailycalculations/pull/147)

Batch 3 done 2026-11-18. **This closes step 62: `solar` is now 14/14**, matching the step's own
honestly-documented ~14 target (below the ~25 "more is fine" bar by deliberate, non-padded design
— see the gap-check section above).

## Closing summary — step 62 is DONE

- **Final count: 14 calculators** across 3 batches (5 + 5 + 4), exactly matching the batch plan's
  own seed list — nothing skipped, nothing padded.
  - Batch 1 (sizing & payback, PR #141): `solar-panel-system-size-calculator`,
    `solar-savings-calculator`, `solar-payback-period-calculator`, `solar-loan-payment-calculator`,
    `net-metering-savings-calculator`.
  - Batch 2 (storage & consumption, PR #144): `battery-backup-sizing-calculator`,
    `off-grid-solar-calculator`, `home-electricity-consumption-calculator`,
    `appliance-energy-cost-calculator`, `heat-pump-savings-calculator`.
  - Batch 3 (everyday efficiency novelties, PR #147): `led-lighting-savings-calculator`,
    `smart-thermostat-savings-calculator`, `water-heater-energy-cost-calculator`,
    `ev-solar-charging-offset-calculator`.
- **Sub-grouping decision: none added.** At 14 calculators, `solar` stays out of
  `categories.spec.ts`'s `GROUPED_CATEGORIES` set — the same exemption already applied to `tech`
  (3 calculators) and, by the same small-category logic, to the other Wave 5 categories built
  around the same time (`crypto` at 7, `business` mid-build, `insurance` mid-build). The step
  file's own guidance was to re-evaluate once the real count was known and only group if the count
  reached a scale where the `/categories/solar` page's grouped view would meaningfully help
  navigation; 14 calculators across 3 clearly-related topic clusters (sizing/payback,
  storage/consumption, efficiency novelties) reads fine as one flat list, same as `tech`'s page
  does at 3. No code or test changes needed for this decision — it's a non-action, not a deferred
  task.
- **Sourcing throughout the category**: `nrel.gov`/`pvwatts.nrel.gov` were unreachable (DNS
  failure) in this sandbox across all 3 batches — EnergySage, EIA, ENERGY STAR and DOE's
  `/eere/solar/*` and AFDC pages were the substitute primary-ish sources throughout, with Wikipedia
  used as a background source for the two cases (LED-wattage range, water-heater efficiency
  factors) where no U.S. government or ENERGY STAR page published a usable table directly. Every
  citation across all 3 batches was fetched directly (WebFetch, since WebSearch's quota was
  exhausted in both batch 2 and batch 3), never taken from memory.
- **Nothing was skipped or parked** from the original seed list — every one of the 14 originally
  scoped ideas shipped as its own distinct page, with every potential duplicate (vs. `home`'s
  `electricity-bill-calculator`/`ac-tonnage-btu-calculator`/`insulation-calculator`, `auto`'s
  `ev-charging-calculator`) checked and confirmed genuinely distinct rather than assumed.
- Step 62 is now **DONE**. Next per the Wave 5 order: whichever of insurance (step 63) or
  business/tax (step 64) the main session picks up next, per `STATUS.md`'s own sequencing.

# Step 62 — Wave 5: Solar & Home Energy (new category)

Per `mdFiles/omni-strategy.md` §4.5 ("Solar & home energy — new category"). Go-ahead per D23
(blanket go-ahead for the remainder of the roadmap). This is one of the 4 remaining Wave 5
sub-categories (money-hub/`finance` already done as step 60); order among the 4 is a suggestion,
not a lock — see `mdFiles/STATUS.md`'s D14 row for the current proposal.

## Competitive gap-check

Fetched Omni Calculator's own ecology page's "Renewable energy" subcategory directly — only 5
real items: Hydroelectric Power, Solar Panel, Solar Panel Wattage, Wind Turbine, Wind Turbine
Profit. These are **engineering/utility-scale tools** (turbine RPM/torque, dam vs. run-of-river vs.
tidal power), not homeowner-facing — the wrong framing for this site's consumer audience, same
judgment call as excluding PCB/circuit tools from `tech` and `fun`. **Hydroelectric and wind-turbine
calculators are excluded here** — no competing aggregator site bundles them with homeowner solar the
way Omni's single "renewable energy" bucket implies, and this site has no existing wind/hydro
content to extend.

The original 2026-11-08 seed list (10 items, below) is actually better-targeted at the homeowner
audience this category should serve than Omni's own page. Widened it with a few more well-documented
homeowner-energy concepts (LED/smart-thermostat savings, water-heater running cost) rather than
padding with anything engineering-heavy. **Honest count note**: this lands at ~14, below the ~25
"more is fine" target other Wave 4 categories hit — homeowner-energy is a genuinely narrower niche
than biology/ecology's broad scientific domain, and there isn't a 25-item real, distinct, citable
list here without reaching into utility-scale or speculative territory. Documenting this rather than
padding, per D17's own "more calculators, never fewer, but never fabricated" discipline.

## Dedupe — checked directly against existing calculators

- `home`'s `electricity-bill-calculator` already exists — cross-link from
  `home-electricity-consumption-calculator`/`appliance-energy-cost-calculator`, don't duplicate its
  bill-estimation logic.
- `home`'s `ac-tonnage-btu-calculator` and `insulation-calculator` — relevant cross-links for
  `heat-pump-savings-calculator` (sizing vs. savings are different questions, cite and link, don't
  rebuild sizing logic).
- `auto`'s `ev-charging-calculator` already exists (cost per charge/mile) — the EV-related idea below
  is reframed to be genuinely distinct (how much of that charging a home solar system can offset),
  not a restatement; read `ev-charging-calculator` first to confirm the distinction holds, or drop
  the idea if it doesn't.
- `ecology.ts` was checked (its own step 49 explicitly reserved this exact topic for Wave 5 and told
  that batch's build agents not to touch it) — confirmed zero solar/wind/battery/home-energy
  calculators exist there. No overlap found.
- Grep every new id/alias against **all** `data/calculators/*.ts` site-wide before writing, same
  discipline as every prior wave.

## Starting state

Brand-new category — open it the same way `fun`/`tech`/`biology`/`ecology` were:
`data/calculators/solar.ts` (new file; category id `solar`, title **"Solar & Home Energy"**), an
entry in `data/calculators/index.ts`'s `categories` array and spread list, and a new color/icon pair
in `lib/categoryTheme.ts`/`components/IconTile.tsx` (a sun/panel glyph reads well — color reuse is
fine, established precedent). **Category-opening work happens in exactly one batch — batch 1 —**
same rule as every prior new category.

Only ~14 calculators — small enough that **sub-grouping is probably not needed** (same call as
`tech`'s 3), but re-evaluate once the real count is known: if it lands ≥10 and the `/categories/
solar` page's grouped-view threshold would trigger meaningfully, a single retrofit batch (same
pattern as biology/ecology/fun) is cheap to add later — don't force it prematurely.

## Batches (~14 calculators, 3 batches)

**Batch 1 — Sizing & payback (5), opens the category:**
- `solar-panel-system-size-calculator` — household electricity use + sun-hours/location →
  recommended system size (kW) and panel count at a typical panel wattage.
- `solar-savings-calculator` — system size + local electricity rate → estimated annual/lifetime
  savings vs. staying on-grid.
- `solar-payback-period-calculator` — system cost (net of any entered incentive) ÷ annual savings →
  years to break even; distinct from `solar-savings-calculator` (total savings vs. break-even point).
- `solar-loan-payment-calculator` — standard loan-amortization math (reuse `loan-calculator`'s
  formula, don't reinvent it) applied to a solar-financing scenario, with payment-vs-savings
  comparison.
- `net-metering-savings-calculator` — exported excess solar generation credited at a utility's
  net-metering rate → monthly/annual bill credit; cite that net-metering rules/rates vary widely by
  utility and state, so this is illustrative, not jurisdiction-specific.

**Batch 2 — Storage & consumption (5):**
- `battery-backup-sizing-calculator` — critical-load wattage × desired backup hours → required
  battery capacity (kWh), cited to a real battery-sizing methodology.
- `off-grid-solar-calculator` — daily energy need + sun-hours + system losses → required panel
  capacity and battery bank size for a fully off-grid system (distinct from grid-tied sizing above).
- `home-electricity-consumption-calculator` — appliance wattage × hours/day × count → estimated
  household kWh/month, feeding into the sizing calculators above; cross-link `electricity-bill-
  calculator` rather than duplicating its bill math.
- `appliance-energy-cost-calculator` — single-appliance wattage × hours-used × local rate → running
  cost; distinct from the whole-household consumption calculator above (per-device vs. aggregate).
- `heat-pump-savings-calculator` — estimated annual savings switching from a conventional
  furnace/AC to a heat pump, cited to a real DOE/Energy Star savings methodology; cross-link `ac-
  tonnage-btu-calculator` for sizing, don't duplicate it.

**Batch 3 — Everyday efficiency novelties (4):**
- `led-lighting-savings-calculator` — incandescent/CFL → LED wattage-equivalence and annual savings,
  cited to Energy Star's published wattage-equivalence table.
- `smart-thermostat-savings-calculator` — cited to Energy Star's published average heating/cooling
  savings percentage from smart-thermostat use.
- `water-heater-energy-cost-calculator` — electric vs. gas vs. tankless vs. heat-pump water heater
  running-cost comparison, cited to a real DOE efficiency-factor table; distinct from the general
  home-electricity-consumption calculator (appliance-specific, multi-fuel-type comparison).
- `ev-solar-charging-offset-calculator` — how much of a home EV-charging load a given solar system
  can realistically offset (accounting for daytime-generation vs. typical overnight-charging timing
  mismatch — a real, honest nuance, not just "solar kWh ≥ charging kWh"). Read `auto`'s `ev-charging-
  calculator` first; if this doesn't hold up as genuinely distinct once scoped, drop it rather than
  force a near-duplicate — the build agent's call.

## Progress checklist

- [ ] Batch 1 — Sizing & payback (5), opens the category
- [ ] Batch 2 — Storage & consumption (5)
- [ ] Batch 3 — Everyday efficiency novelties (4)
- [ ] Sub-grouping retrofit (only if the final count/categories.spec.ts threshold logic warrants it)
- [ ] STATUS.md updated with the final per-category summary
