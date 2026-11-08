# Guide content type — scoping

Written 2026-11-08. Proposal only — **nothing here is in `STATUS.md`'s step index yet.** A step
file gets written just-in-time, per the working protocol, when this actually gets scheduled (not
before Wave 5, §4.5 of `mdFiles/omni-strategy.md` — see STATUS.md decision D14).

## Why

A 2026-11-08 competitive-positioning report (about calculator sites generally, not specifically
about this one — see `omni-strategy.md` §4.5 for the provenance caveat) recommended long-form
guide/comparison articles alongside calculators: "How much house can I afford," "Rent vs. buy,"
etc. — content that doesn't reduce to one formula, but exists to route a reader into the
calculator(s) that do. This is also already half-decided independently: `omni-strategy.md`'s F1
("long-form, genuinely educational content") and the general Omni-parity push already assume
every calculator page carries a concept/formula/example/FAQ block; a **Guide** is the same
editorial bar applied to a topic that spans *several* calculators instead of living inside one.

A mockup of one example ("How much house can I afford?") was built as a Design-canvas Artifact
and approved by the user on 2026-11-08: https://claude.ai/artifact/Ubmsp7qX8vTzMWQHUJLgMV. That
mockup is the reference for visual language — iOS-card sections, section icon tiles, TOC,
byline/trust row — all pulled directly from the real `lib/categoryTheme.ts` tokens and the real
`CalculatorPage` layout (`app/[locale]/calculators/[slug]/page.tsx`), not invented fresh.

## What a Guide is (and isn't)

- **Is:** a long-form article about a decision or topic ("How much house can I afford," "Rent vs.
  buy," "Is solar worth it") that cites real sources, works a concrete numeric example, and links
  into the calculator(s) that do the actual math.
- **Isn't:** a calculator. No widget, no `solver`/`compute()`, not in `data/calculators/`, not in
  the calculator search index, not counted toward the "224 calculators" total.
- **Clearly marked as such** on the page itself (the mockup's "Guide" pill next to the category
  chip) — the report's own content-cluster idea only works if a reader (and Google) can tell a
  guide from a calculator at a glance.

## Second opinion (2026-11-08) — grounded in the real, live `mortgage-calculator` page

A second external AI response (unlike the first, this one accurately quoted our actual live
content — the exact FAQ figure "$2,000 a month at 6.5% over 30 years with $70,000 down supports
about $386,422" is verbatim from `data/calculators/finance.ts`'s `mortgage-calculator` FAQ, and its
description of the watch-out section is accurate — so this one is grounded, not generic) was asked
specifically about this Guide and independently converged on the same architecture:

- **Confirms question 5: build it as a separate page.** Its reasoning matches ours — the mortgage
  calculator's job is "what will my payment be," the guide's job is "what can I afford," and a
  shared page would blur both search intents. Treat question 5 as **resolved**: separate page.
- **Resolves question 2 (CTA placement):** put the "jump to the calculator" CTA in **two** spots,
  not one — the top quick-answer box (as the mockup already has) **and** inline right at the
  "convert your target payment into a home price" step, the exact moment a reader has a number
  ready to hand to the calculator. The mockup currently only has the top one; add the inline one
  when this is actually built.
- **Content structure refinement** for when a real spec gets written: quick answer → build the
  monthly budget (take-home pay, existing debts, savings) → the 28/36 rule, framed explicitly as "a
  common screening guideline, not a universal rule" (lenders vary by program/credit/compensating
  factors — the mockup's FAQ already hedges this; keep that hedge) → subtract taxes/insurance/PMI/
  HOA/maintenance to isolate the P&I budget → convert to a price (CTA here) → upfront cash needed
  (down payment, closing costs, inspection, moving, reserve — the mockup's worked example skips
  this; add it) → **three** worked examples (conservative/moderate/stretch, not just one) → FAQ
  scoped to budgeting/DTI/reserves/upfront-cash, deliberately *not* payment mechanics (that FAQ
  already lives on `mortgage-calculator`, don't duplicate it).
- **Splits "home-affordability" into two things, which matches what we already have:** a guide
  (budgeting framework, no numbers-crunching of its own) *and* a distinct calculator (income/debts/
  down payment/rate/tax/insurance/PMI in, a price range out) — this is exactly the
  `home-affordability-calculator` already added to `omni-strategy.md` §4.5's money-hub seed list.
  No change needed there, just confirmation the split is right.
- **Suggests a content cluster beyond just this one guide:** mortgage-calculator ↔ this guide ↔
  home-affordability-calculator ↔ future PMI/escrow/closing-cost guides. The mockup's "related
  guides — coming soon" placeholders (refinance, down-payment, rent-vs-buy) already anticipate
  this; add **PMI explainer** and **how to read a Loan Estimate / closing-cost guide** as two more
  candidate future guides when this category gets built out.

## Open questions — still not resolved

1. Is the "Guide" vs "Calculator" badge distinction loud enough, or does it need to show in the
   nav/breadcrumb too, not just a pill?
2. Ad slot count/placement for a widget-less content page — the mockup used 2 (same as
   `omni-strategy.md` §5's calculator-page rule: one after the "result"-equivalent moment, one
   mid-article). Confirm that's still right once this is closer to actually shipping.
3. **URL shape — the one decision that's hardest to reverse once pages are indexed.** Now three
   candidates on the table, not two:
   - `/guides/<slug>` (flat, own top-level section) — **still the proposed default**, matches
     D1–D6's "keep URLs flat" precedent (`omni-strategy.md` §4.3's "URLs" row) and needs no
     relationship to any one calculator (a guide like "Rent vs. buy" touches several).
   - nested under a hub/calculator (`/calculators/mortgage-calculator/guides/<slug>`) — still
     rejected as a default: most guides aren't owned by exactly one calculator.
   - **new, from the second opinion:** nested under the *category*, not a specific calculator
     (`/calculators/finance/how-much-house-can-i-afford/`). This avoids the single-owning-calculator
     problem (a hub can own several guides) but mixes a non-calculator content type into the
     `/calculators/` path space that `data/calculators/`'s "one object = one page, one sitemap
     entry" discipline currently owns exclusively — would need a clear rule for how
     `generateStaticParams`/the sitemap tells calculators and guides apart under the same prefix.
   Worth an explicit decision before the first real Guide page ships; not urgent while this stays
   queued behind Wave 4 and the start of Wave 5.

## Architecture sketch (not started — for when this is scheduled)

Same "one object = one page" discipline as `data/calculators/`, so adding a guide never means
hand-writing a page:

- `data/guides/<topic>.ts` (or one `data/guides.ts` to start, split later like the calculators
  file was — `omni-strategy.md` §4.3's "one data file" lesson applies here too): one
  `GuideConfig` object per guide — id, title, category/hub, intro, the same content shape as
  `CalculatorContent` (concept/how-to/formula-or-rule/worked-example/reference-table/watch-out/
  faq/references), plus a `relatedCalculators: string[]` (calculator ids) and a
  `relatedGuides: string[]`.
- `app/[locale]/guides/[slug]/page.tsx` — `force-static`, same `generateStaticParams` /
  `generateMetadata` pattern as the calculator page. Reuses the **existing** `SectionHeading`,
  `ConceptSection`, `FormulaSection`, `WorkedExampleSection`, `ReferenceTableSection`,
  `WatchOutSection`, `FaqSection`, `ReferencesSection`, `TableOfContents`, `Breadcrumb` components
  as-is (they're already content-shape-agnostic) — only the widget/solver slot and the
  calculator-specific hero are new.
- `lib/seo.ts`: `buildGuideMetadata`/`buildGuideJsonLd` alongside the existing calculator builders
  — `Article` JSON-LD (not `WebApplication`), still `BreadcrumbList`.
- Add to `app/sitemap.ts` (its own small priority tier, likely below calculators' 0.8).
- Reverse link: calculators gain an optional `relatedGuides?: string[]` field on
  `CalculatorConfig`, rendered as a small card in the existing `RelatedCalculators`-style slot —
  the funnel runs both directions (guide → calculator, calculator → guide).
- Needs its own skill eventually (`add-guide`, mirroring `add-calculator`) once the first few are
  hand-built and a real pattern exists to template — **do not** write that skill speculatively
  before at least 2–3 real guides exist, same "steps are written just-in-time" discipline as
  everything else in this project.

## Not in scope here

Email capture, downloadable checklists, affiliate/lead-gen flows, and the monetization-phase ideas
from the source report are a separate business decision, not an architecture one — not addressed
by this doc. Flagged in STATUS.md's Parked section for a future explicit decision, not silently
folded in here.
