# Step 65 — Wave 5: Crypto (new category, small)

Per `mdFiles/omni-strategy.md` §4.5 ("Crypto — new category, zero overlap with anything existing —
this is what prompted the whole [Wave 5] review"). Go-ahead per D23. Last of the 4 remaining Wave 5
sub-categories (small, like `tech`).

## Competitive gap-check

Confirmed via direct fetch that Omni's own finance page has **no cryptocurrency subcategory or
calculators at all** — same gap this whole wave's source report originally flagged. No single
aggregator category page exists to diff against (same situation as step 63's insurance category).
The original seed list (crypto-dca, crypto-compound-growth, staking-rewards, portfolio-allocation,
crypto-profit-loss/break-even, crypto-tax-estimate) is kept, split into two genuinely distinct
calculators where it was previously one combined idea (profit-loss vs. break-even-price are
different questions), plus one addition (a rebalancing calculator distinct from plain allocation).
**Mining profitability is deliberately excluded**: it depends on live, fast-changing inputs
(electricity cost, network difficulty, hash rate, token price) that don't reduce to a stable static
page the way the others do — a real idea, but the wrong shape for this site's `force-static` model,
same reasoning as why live FX rates (step 22) are a separate, not-yet-built KV-backed feature rather
than a plain static calculator.

**Critical framing requirement carried through every calculator in this category**: these are
hypothetical-scenario / "what if" projection and arithmetic tools, **never a price prediction and
never financial advice** — state this explicitly in `watchOut` on every calculator, same disclaimer
discipline as `finance`'s existing investment calculators, turned up further given crypto's extra
volatility and regulatory sensitivity.

## Dedupe

- Zero overlap with any existing category — confirmed via grep, no existing calculator id or
  `finance.ts` entry is crypto-specific.
- `travel`'s `currency-converter` is fiat-to-fiat, unrelated — no overlap.
- Grep every new id/alias against **all** `data/calculators/*.ts` site-wide before writing.

## Starting state

Brand-new category — open it the same way `tech` was (small, no sub-grouping needed):
`data/calculators/crypto.ts` (new file; category id `crypto`, title **"Crypto"**), an entry in
`data/calculators/index.ts`'s `categories` array and spread list, and a new color/icon pair in
`lib/categoryTheme.ts`/`components/IconTile.tsx` (a coin glyph reads well). **One batch — this
category is small enough not to split**, same precedent as `tech`'s 3-calculator single batch.

## The ~7 calculators (one batch)

- `crypto-dca-calculator` — dollar-cost-averaging: a fixed recurring investment amount across N
  periods at user-entered historical or assumed prices → average cost basis and total units
  acquired. User-entered prices only — never a live price feed (this site has none; `force-static`).
- `crypto-compound-growth-calculator` — projected growth of a holding at an assumed APY/staking
  rate over time — explicitly labeled a hypothetical projection, not a forecast.
- `staking-rewards-calculator` — principal × staking APY × time, with optional compounding
  frequency — distinct from the general compound-growth calculator (staking-specific framing,
  reward-rate terminology).
- `crypto-portfolio-rebalancing-calculator` — given current holdings' values and a target allocation
  percentage across assets, how much to buy/sell of each to rebalance — distinct from a plain
  allocation calculator (this one is action-oriented: what trades to make, not just what the target
  split should be).
- `crypto-profit-loss-calculator` — buy price, sell price, quantity, fees → realized profit/loss
  amount and percentage.
- `crypto-breakeven-price-calculator` — cost basis + fees → the exact sell price needed to break
  even — distinct from the profit/loss calculator (solves for the breakeven price itself, not a
  profit/loss at a given price).
- `crypto-tax-estimate-calculator` — US short-term vs. long-term capital-gains tax treatment on a
  crypto disposal, cited directly to IRS Notice 2014-21 (virtual currency treated as property).
  Heavy disclaimer: US-only framing, rates/holding-period rules vary by country, educational
  estimate only, not tax advice — same discipline as `finance`'s `income-tax-calculator`.

## Progress checklist

- [x] Category scaffold (lib/categoryTheme.ts amber/coin, components/IconTile.tsx, index.ts) — commit 70ca7e7
- [x] All 7 calculators built in data/calculators/crypto.ts (crypto-dca, crypto-compound-growth,
      staking-rewards, crypto-portfolio-rebalancing, crypto-profit-loss, crypto-breakeven-price,
      crypto-tax-estimate) — commit c98ff1c
- [x] Every number re-verified in a standalone Node scratch script before writing copy
- [x] `npm test` (1640/1640), `npm run lint`, `npm run build` all pass; snapshot regenerated
- [x] Merged latest `origin/master` (Wave 4 sub-grouping retrofit) — no conflicts, re-verified
- [x] Branch pushed, PR opened: https://github.com/abhishekpeku/dailycalculations/pull/139
- [x] STATUS.md updated with the final per-category summary

Done — one batch, as scoped (same precedent as `tech`'s single batch).
