# Step 38 — Batch 4: auto (6) + home (6), v2 conversion

## Progress

- [x] Step file, draft PR
- [x] car-payment-calculator (A · Donut principal/interest + AmortizationTable) — YMYL
- [x] gas-cost-calculator (A · cost ↔ distance ↔ economy ↔ price; plan: cost-per-mile chip, not in kit → CompareBars one way vs round trip)
- [x] fuel-cost-calculator (B · CompareBars your car vs comparison car)
- [x] ev-charging-calculator (B · CompareBars EV vs gas per 100 miles)
- [ ] commute-cost-calculator (B · Donut fuel/parking/tolls/wear, config from step 33; v2 content)
- [ ] toll-cost-calculator (B · CompareBars with vs without a toll pass)
- [ ] concrete-calculator (A · volume ↔ length ↔ width ↔ depth; plan: bags chips)
- [ ] paint-calculator (B · plan: can-count row)
- [ ] tile-calculator (B · plan: grid illustration)
- [ ] wallpaper-calculator (B · plan: roll-count row)
- [ ] electricity-bill-calculator (B · plan: tier bar)
- [ ] furniture-fit-calculator (B · plan: top-down floor plan)
- [ ] Number verification script, tests, build, lint, STATUS.md, PR ready

Commit + push after each box (`step 38: <id>`). Runs are 5 calculators (D11): run 1 builds
car-payment → commute-cost and pauses; later runs do toll-cost and the six home calculators.

**Scope (from `STATUS.md`):** Batch 4, auto + home (12). Convert each to the v2 template: widget
type per the plan, units (mi/km, mpg/L/100 km incl. US vs UK gallon, ft/m, sq ft/m², yd³/m³,
kWh), the listed result visual or the nearest kit component (gap Parked), full v2 content
(concept, how-to, formula, worked example, watch-outs, FAQ, references), verified numbers.
Primary/authoritative sources (EPA/DOE/EIA/FHWA/IRS for auto and energy, CFPB/FTC for the car loan,
manufacturer or industry standards for building materials), never other calculator sites.
Car payment is YMYL: "estimates only" note. Ids/URLs unchanged; `calculatorOrder` untouched.

**Spec:** `mdFiles/calculator-rollout-plan.md` §1 and §3 Batch 4; `mdFiles/calculator-template-v2.md`.

---

## Plan (run 1)

| Calculator | Type | Auto-solve fields / fixed inputs | Outputs | Visual (plan → used) |
|---|---|---|---|---|
| car-payment | A | payment ↔ price ↔ term ↔ rate (rate numeric); down payment `fixed` | loan amount, total interest, total paid | **Donut** + **AmortizationTable** |
| gas-cost | A | cost ↔ distance ↔ fuel economy ↔ fuel price (all closed form) | fuel used, cost per 100 mi / 100 km | cost-per-mile chip → **CompareBars** one way vs round trip |
| fuel-cost | B | — | annual / monthly cost, fuel per year, cost per 100 mi, comparison car, savings | **CompareBars** |
| ev-charging | B | — | charge cost, energy, range added, EV vs gas per 100 mi, yearly savings | **CompareBars** |
| commute-cost | B | — (config from step 33) | daily / monthly / annual | **Donut** |

**Shared pieces:**
- New unit dimension `fuelPrice` (base currency per m³; per L, per US gal, per UK gal), so a
  fuel price follows the fuel-economy unit (UK/EU prices are per litre). Labels use
  `currencySymbol()`, never a hardcoded `$`.
- New unit dimension `evEfficiency` (base J/m; kWh/100 mi as on EPA labels, kWh/100 km, Wh/mi,
  Wh/km, mi/kWh, km/kWh).
- Car-payment reuses finance's loan helpers (exported from `finance.ts`).
- `compute()` is unchanged on every calculator, so the snapshot must not move. Type-B inputs gain
  `dimension` + `unit` only (compute still receives the same units).

## Acceptance

- `npm test`, `npm run build`, lint (ignoring `.open-next/**`, `.claude/**`) pass at each pause.
- An independent scratch script recomputes every figure in the copy; 0 mismatches.
- Each page renders H1, every section id and the JSON-LD on a local server, which is then killed.
