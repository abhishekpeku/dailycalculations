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

## Open questions from the mockup's review box — not yet resolved

The user approved the mockup's overall direction ("looks good") without going through each item
individually. These stay open until a step file is actually written for this:

1. Is the "Guide" vs "Calculator" badge distinction loud enough, or does it need to show in the
   nav/breadcrumb too, not just a pill?
2. Is the in-article "jump to the calculator" CTA placement right (in the quick-answer box), or
   does it convert better inline inside the worked example?
3. Ad slot count/placement for a widget-less content page — the mockup used 2 (same as
   `omni-strategy.md` §5's calculator-page rule: one after the "result"-equivalent moment, one
   mid-article). Confirm that's still right once this is closer to actually shipping.
4. **URL shape — the one decision that's hardest to reverse once pages are indexed:**
   - `/guides/<slug>` (flat, own top-level section) — **proposed default**, matches D1–D6's "keep
     URLs flat" precedent (`omni-strategy.md` §4.3's "URLs" row) and needs no relationship to any
     one calculator (a guide like "Rent vs. buy" touches several).
   - nested under a hub/calculator (`/calculators/mortgage-calculator/guides/<slug>`) — rejected
     as a default: most guides aren't owned by exactly one calculator, and nesting creates a
     canonical-ownership problem for e.g. a refinance guide that links to three different
     calculators equally.
5. Is a separate page even the right call, or should guide-depth content instead live as an
   expandable section directly on the relevant calculator page(s)? **Proposed default: separate
   page**, for two reasons — (a) a guide like "rent vs. buy" doesn't have one owning calculator to
   attach to, and (b) a dedicated URL is what actually ranks for the "how much house can I afford"
   style query, which is a different search intent than "mortgage calculator."

Items 4 and 5 are marked **proposed default**, not decided — worth a quick explicit confirmation
before the first real Guide page gets built, since URL shape in particular is expensive to change
once indexed (same caution as every other D1–D6 URL decision).

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
