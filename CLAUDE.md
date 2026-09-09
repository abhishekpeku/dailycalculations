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

- **`data/calculators.ts` is the heart of the site.** One object per calculator = one page, one
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
  STATUS.md            # development tracker — decisions, 28 steps, session log
  steps/NN-<name>.md   # one self-contained work order per step
  design.md            # original design & architecture document
  memory/              # project memory notes
```

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

## Conventions

- Match the existing code style; do not introduce new patterns or libraries without a reason.
- Comments only where the *why* is non-obvious. The existing code is lightly commented — match it.
- No new dependencies without noting it in `STATUS.md`.
- US English spelling in user-facing copy (the site's primary market), even though region profiles
  cover the UK and others.
