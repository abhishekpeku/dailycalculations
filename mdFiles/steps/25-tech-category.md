# Step 25 — `tech` category (new, small)

Per `mdFiles/instructions.md` §5.1/§5.4/§1.5 O and `mdFiles/omni-strategy.md` §4.1 ("tech | step 25
| Other"): **Add the `tech` entry to `categories` here** (step 16 deferred it — it would have
shipped empty). Seed list: `ip-subnet-calculator`, `iban-calculator`, `data-storage-converter`,
`password-strength-checker`. Build for authority, not ad revenue — this audience blocks ads.

Go-ahead per D23 (blanket go-ahead for the remainder of the roadmap). Next in D13's locked order
after fun/other (step 50, still mid-build) — launched in parallel since it touches a different
category file and has no file overlap with step 50's agents.

## Dedupe

- `data-storage-converter` **already exists** (shipped under `measurements` in an earlier step) —
  not rebuilt here. Cross-link from the new tech calculators if relevant, don't duplicate.
- `ip-subnet-calculator`, `iban-calculator`, `password-strength-checker` — none exist yet, grep
  confirmed against all `data/calculators/*.ts` site-wide.
- Per D8: **do not build any "what is my IP" query** (`ip-subnet-calculator` is explicitly exempted
  — it's a real calculation, not a zero-click lookup — but don't scope-creep into a public-IP
  lookup tool, which this site cannot usefully answer anyway since IP detection needs the visitor's
  own request, and these pages are `force-static` with no request-time logic allowed).

## The 3 calculators (one batch — the category is small enough not to split)

- `ip-subnet-calculator` — given an IP address + subnet mask (or CIDR prefix), compute network
  address, broadcast address, usable host range, and total/usable host counts. Cite the real CIDR/
  subnetting rules (RFC 4632 or a reputable summary of it) directly — don't approximate the bitwise
  math.
- `iban-calculator` — validate an IBAN (or generate the check digits) using the real ISO 7064 MOD
  97-10 algorithm, cited directly. Clearly scope it as a **format/checksum validator**, not a bank
  lookup or account-verification tool (this site has no banking data access) — say so explicitly in
  `watchOut` so nobody mistakes "valid format" for "this account exists."
- `password-strength-checker` — a custom (type-C) widget, since it needs live text input, not a
  numeric `compute()`. Score entropy from character-set size and length (the standard
  log2(charsetSize^length) formula), cited directly (NIST SP 800-63B's current guidance moved away
  from pure complexity rules toward length — mention that nuance honestly in the copy rather than
  implying "more symbols = always better," since that's the real, current expert guidance). This
  needs to run **entirely client-side** — never transmit or log what the visitor types, and say so
  explicitly in the page copy, since this is exactly the kind of tool where a visitor needs that
  reassurance.

## Starting state

`tech` is a **brand-new category** — open it the same way `fun`/`biology`/`ecology` were:
`data/calculators/tech.ts` (new file), an entry in `data/calculators/index.ts`'s `categories` array
and spread list, and a new color/icon pair in `lib/categoryTheme.ts`/`components/IconTile.tsx`
(something that reads as technical — e.g. a chip/circuit/lock glyph). Only 3 calculators, so
**sub-grouping is not needed** — `categories.spec.ts`'s all-or-nothing rule only requires a `group`
field when a category is in `GROUPED_CATEGORIES`, and a 3-item category doesn't need to be added to
that set (same precedent as any category left ungrouped because splitting 3 items into sections
would be noise, not signal — confirm this call against the category page's own grouped-view
threshold logic before finalizing).

## Progress checklist

- [x] `ip-subnet-calculator` (breakdown widget; new `ipAddress` BreakdownFormat added to
      lib/breakdown.ts for dotted-decimal display; verified against RFC 4632's own worked examples
      and the classic /24, /25...,/30, /31 (RFC 3021), /32 and /0 edge cases)
- [x] `iban-calculator` (custom type-C widget, components/IbanCalculator.tsx — free text, not
      numeric fields, since a long IBAN's digit-substituted number exceeds JS-safe-integer
      precision and numeric fields would drop a BBAN's significant leading zeros; verified against
      Wikipedia's own GB82 WEST example plus several more real example IBANs)
- [x] `password-strength-checker` (custom type-C widget, components/PasswordStrengthChecker.tsx;
      entropy verified against a hand-computed log2(N)×L for several passwords, including the
      length-vs-complexity worked example)
- [x] STATUS.md updated with the final summary
- [x] `npm test` (1614/1614), lint clean, `npm run build` passing — see closing summary below
