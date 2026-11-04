# Daily Calculations — project context

Free online calculator site. Static, SEO-first, deployed to Cloudflare Workers.
**Live domain: `https://www.dailycalculations.com`** (apex `dailycalculations.com` 301s to it).

## Stack

- Next.js 16.2 App Router (Turbopack) · React 19 · TypeScript · Tailwind 3.4
- `next-intl` 4.13 — **English only.** Kept for UI strings and to leave the door open for
  languages later. Do not add locales without an explicit decision (see `mdFiles/STATUS.md`).
- Deployed via `@opennextjs/cloudflare` → Cloudflare Workers. KV is available.

## Commands

```bash
npm run dev       # dev server on :3000
npm run build     # production build — must pass before any step is marked done
npm run lint      # eslint
npm run preview   # opennextjs-cloudflare build + local Workers preview
npm run deploy    # build + deploy to Cloudflare
```

## Architecture — the things that matter

- **`data/calculators/` is the heart of the site** (one file per category; `index.ts` holds the order). One object per calculator = one page, one
  sitemap entry, one search entry. Adding a calculator means adding an object — no new files.
  Never hand-write a calculator page.
- **`lib/site.ts`** holds `SITE_URL`. Never hardcode the domain anywhere else.
- **`lib/seo.ts`** builds all metadata and JSON-LD. Canonicals come from here, not from pages.
- **`lib/calculator.ts`** formats numbers/currency. Region-aware — never hardcode `en-US` or `USD`.
- **`lib/regions.ts`** holds the 9 country profiles (currency, units, tax, date format).
- Pages are `export const dynamic = 'force-static'`. **Do not read request headers during render** —
  it breaks the static build. Region detection happens in middleware (cookie) and is applied
  client-side after hydration.
- Country is a **cookie, never a URL segment.** No per-country URLs, ever.

## Documentation files — where Markdown lives

**All Markdown files live in `mdFiles/`.** When creating any new `.md` — a plan, a spec, notes,
a step file, an audit, a changelog — write it to `mdFiles/`, never to the repo root or a new
top-level folder. When moving or renaming one, keep it inside `mdFiles/`.

```
mdFiles/
  instructions.md      # full spec + rationale for the SEO / region / format project
  STATUS.md            # development tracker — decisions, step index, RECENT session log only
  STATUS-archive.md    # older session-log entries trimmed out of STATUS.md (append-only)
  steps/NN-<name>.md   # one self-contained work order per step
  design.md            # original design & architecture document
  memory/              # project memory notes
```

**`STATUS.md` session log stays trimmed to roughly the last day of work.** The step index table,
decisions, order rules, Pending-on-user and Parked sections always stay in `STATUS.md` in full —
only the chronological **Session log** entries get archived. When you finish a step and the log
section has entries older than ~1 day, cut them from `STATUS.md` and append them to
`STATUS-archive.md` (oldest-first, never reordered), leaving a one-line pointer in `STATUS.md`
("older entries in `STATUS-archive.md`, covers steps X–Y"). This is a token-cost rule, not a
historical one: the point is keeping `STATUS.md` small enough to read in one pass every session —
`STATUS-archive.md` is write-mostly and only opened when a specific old step needs to be looked up.

**Two exceptions, both at the repo root — do not move these into `mdFiles/`:**

- **`CLAUDE.md`** — Claude Code only auto-loads this from the project root. Moving it silently
  breaks every session's context, including the working protocol below.
- **`README.md`** — GitHub renders it on the repo page and npm reads it from the root.

## Working protocol — read this before starting any task

Development runs as a sequence of **self-contained steps**. Each step is sized to fit one session
with room to spare. You should never need context from a previous chat.

**To start or resume work:**

1. Read **`mdFiles/STATUS.md`** — it is the single source of truth for what is done, what is next, and
   every decision made so far. Trust it over your own assumptions.
2. Find the next step marked `TODO`. Read its scope line and the `mdFiles/instructions.md` sections it
   references.
3. Open **`mdFiles/steps/NN-<name>.md`**. If that file exists, follow it exactly.
   **If it does not exist, write it first** — using the scope line in `STATUS.md` plus the
   referenced `mdFiles/instructions.md` sections — then execute it. Step files are written just-in-time so
   they reflect the code as it actually is, not as it was when the plan was drafted.
4. Do **only** that step. Do not start the next one. Do not fix unrelated things you notice —
   add them to the `Parked` list at the bottom of `STATUS.md` instead.
5. Before marking done: `npm run build` must pass, plus the step's own acceptance checks.
6. **Finish by updating `mdFiles/STATUS.md`**: mark the step `DONE`, add the date, record any decision
   made or surprise found, and note anything the next step needs to know. This is what makes the
   next session context-free — if you skip it, the chain breaks.
7. Commit with the step number in the message: `step 03: canonical URLs on every page`.

**`mdFiles/instructions.md`** is the full spec and rationale for the whole project. It is long — read only
the sections a step references, not the whole file.

## Building calculators — run it in the background

- New calculators follow **`mdFiles/calculator-template-v2.md`** and the **`add-calculator`**
  skill (`.claude/skills/add-calculator/`). `force-calculator` is the reference implementation.
- Develop in the background by default. Hand calculator builds to the **`calculator-builder`**
  agent (`.claude/agents/`), each on its own branch, and run `npm run build` / `npm run dev` with
  `run_in_background`, so the main session stays free. Always kill the dev server when done.
- **Browser visual QA runs once per ~50 new calculators, not once per batch.** `npm test` +
  `npm run lint` + `npm run build` still gate every batch — those are cheap and catch real breakage.
  Chrome-automation spot-checks (desktop/dark-mode/phone screenshots) are expensive and the pages
  share a template, so skip them per-batch; batch the visual pass across ~10 batches (~50
  calculators) at once, covering a representative sample rather than every page. Track the running
  count toward 50 in the relevant step file's Progress checklist so it's obvious when a visual pass
  is due.
- When reading existing calculators as a pattern reference, read **one representative example**,
  not the whole category file — `data/calculators/*.ts` files grow past 1,500 lines and most of
  that is irrelevant to the pattern being matched.

## Conventions

- Match the existing code style; do not introduce new patterns or libraries without a reason.
- Comments only where the *why* is non-obvious. The existing code is lightly commented — match it.
- No new dependencies without noting it in `STATUS.md`.
- US English spelling in user-facing copy (the site's primary market), even though region profiles
  cover the UK and others.
