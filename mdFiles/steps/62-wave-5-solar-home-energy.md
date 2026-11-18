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

- [ ] `battery-backup-sizing-calculator`
- [ ] `off-grid-solar-calculator`
- [ ] `home-electricity-consumption-calculator`
- [ ] `appliance-energy-cost-calculator`
- [ ] `heat-pump-savings-calculator`
- [ ] `npm test` / lint / build pass, snapshot regenerated
- [ ] PR opened

Sourcing note: `nrel.gov`/`pvwatts.nrel.gov` still unreachable (DNS failure) from this sandbox, same
as batch 1. Most of `energy.gov`'s old `/energysaver/*` consumer-tips paths now 404 (site
restructure) — `/eere/solar/*` and `energystar.gov` pages still work. Substituted EnergySage +
EIA + ENERGY STAR + DOE `/eere/solar/*` pages throughout, same substitution precedent as batch 1.

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
