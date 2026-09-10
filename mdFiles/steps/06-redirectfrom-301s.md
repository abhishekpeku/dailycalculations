# Step 06 — `redirectFrom` 301s

**Spec:** `mdFiles/instructions.md` §2.5
**Depends on:** 05 (`redirectFrom` populated), 03 (the `RENAMED_PATHS` 301 block in `middleware.ts`).
**Blocks:** nothing. 07 and 08 are independent of this.

## Why

Six slugs people actually search and link — `home-loan-calculator`, `house-loan-emi-calculator`,
`auto-loan-calculator`, `car-loan-calculator`, `bmr-calculator`, `word-counter` — currently 404.
A 404 throws away whatever link equity and direct traffic those URLs attract. A 301 lands it on the
canonical calculator instead.

Step 05 put the data in `redirectFrom`. This step is the only thing that reads it.

## Do

1. **Derive the map — do not hand-list the slugs.** New `lib/redirects.ts`:

   ```ts
   import { calculators } from '@/data/calculators';

   /** redirectFrom slug → canonical calculator path. Built from data/calculators.ts. */
   export const CALCULATOR_REDIRECTS: Record<string, string> = Object.fromEntries(
     calculators.flatMap((c) =>
       (c.redirectFrom ?? []).map((from) => [`/calculators/${from}`, `/calculators/${c.id}`])
     )
   );
   ```

   Hand-listing them in `middleware.ts` means step 23 and step 26 have to remember to edit two
   places, and they will not. Deriving means deleting the `redirectFrom` entry is sufficient.

2. **Redirect `/calculators/<old>`, not `/<old>`.** §2.5 keeps the `/calculators/` segment as a
   breadcrumb token; the guessable and linkable form of these URLs carries it too.

3. **Emit one hop, not two.** `middleware.ts` currently strips the locale prefix and returns
   immediately, so `/en/about-us` answers `/about-us` and only then `/about` — a 301 chain. Now that
   a second redirect map exists, resolve the locale strip and the path rewrite **in the same pass**
   and return a single 301 to the final target. Link equity decays across a chain, which is the
   entire point of this step.

4. Match the existing trailing-slash handling in the `RENAMED_PATHS` lookup.

## Acceptance

Build, then `npm run start` and check real responses — a static read of the source does not prove
the matcher lets these paths through.

- [x] `npm run build` and `npm run lint` pass.
- [x] All 6 slugs answer **301** to their canonical `/calculators/<id>`.
- [x] `/en/calculators/auto-loan-calculator` answers **301 straight to
      `/calculators/car-payment-calculator`** — one hop, not two.
- [x] `/about-us` and `/en/about-us` both still answer a single 301 to `/about` (step-03 behaviour,
      now chain-free).
- [x] A real calculator page (`/calculators/bmi-calculator`) still answers **200**.
- [x] The `matcher` regex is still exactly `'/((?!api|_next|_vercel|.*\..*).*)'` with the double
      backslash — see the step-02 warning in `STATUS.md`.
- [x] Middleware bundle growth from importing `data/calculators.ts` is measured and recorded.

## Do NOT

- Do not add bare-root `/<slug>` redirects. Out of scope and it risks shadowing real routes.
- Do not touch `redirectFrom` values — that data is step 05's, and two entries are deliberately
  temporary (steps 23 and 26).

## Finish

Update `mdFiles/STATUS.md`: mark 06 `DONE`, record the bundle delta, and re-state that removing a
`redirectFrom` entry is now the *only* edit needed to retire a redirect.

---

## Outcome — 2026-09-10

Verified against a real `next start` (port 3007, because :3000 was already occupied — see the
warning below). Every check passed.

| URL | Result |
|---|---|
| `/calculators/home-loan-calculator` | 301 → `/calculators/mortgage-calculator` |
| `/calculators/house-loan-emi-calculator` | 301 → `/calculators/mortgage-calculator` |
| `/calculators/auto-loan-calculator` | 301 → `/calculators/car-payment-calculator` |
| `/calculators/car-loan-calculator` | 301 → `/calculators/car-payment-calculator` |
| `/calculators/bmr-calculator` | 301 → `/calculators/tdee-calculator` |
| `/calculators/word-counter` | 301 → `/calculators/character-counter` |
| `/en/calculators/auto-loan-calculator` | **one** 301 → `/calculators/car-payment-calculator` → 200 |
| `/de/calculators/home-loan-calculator` | one 301 → `/calculators/mortgage-calculator` |
| `/en/about-us` | one 301 → `/about` → 200 (was a 2-hop chain before this step) |
| `?utm_source=x&a=1` | preserved across the redirect |
| `/calculators/{bmi,car-payment,tdee}-calculator`, `/categories/finance`, `/calculators`, `/` | 200 |
| `/calculators/not-a-real-calculator` | 404 |

**Bundle cost.** Importing `data/calculators.ts` into the edge bundle for a 6-entry map:
`.next/server/middleware.js` **185,440 → 280,505 bytes raw (+95,065, +51%)**, **81,437 gzipped**.
All 53 `compute()` bodies and every FAQ string ride along; none of it is reachable from middleware.
Accepted — 81 KB compressed against a 3 MB Workers budget — but see the parked codegen note in
`STATUS.md` if the bundle ever becomes a constraint.

**Trailing slash is handled by Next, not by us.** `/calculators/auto-loan-calculator/` answers a
308 to the un-slashed path *before* middleware runs, which then 301s. The `endsWith('/')` slice in
the lookup is therefore defensive only; it was already there from step 03 and was left alone.

### ⚠ Two traps hit while doing this — worth knowing

1. **A quoted bash heredoc still ate the matcher's double backslash.** Writing `middleware.ts`
   with `cat > … <<'TS'` collapsed the source's `\\` to a single `\`, which is the exact silent breakage the
   step-02 note warns about. Verify that line byte-for-byte after *any* rewrite of the file:
   `python -c "print(repr(open('middleware.ts').read().split(chr(10))[-3]))"` — the source must
   show two backslashes.
2. **`npm run start` failed with `EADDRINUSE` and the checks silently ran against a stale server
   already on :3000**, producing a confusing all-404 result that looked like the matcher bug.
   Always read the server log before trusting curl output, and start on a free port.
