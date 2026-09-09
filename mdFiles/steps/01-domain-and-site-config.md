# Step 01 — Domain + `lib/site.ts`

**Spec:** `mdFiles/instructions.md` §0 · Decision D1
**Depends on:** nothing. This is the first step.
**Blocks:** everything.

## Why this is first

The codebase declares two different production domains. Canonicals, OG tags and JSON-LD are all
built from `lib/seo.ts:5` (`https://dailycalculations.app`), while the sitemap and robots submit
`https://www.dailycalculations.com`. So the site currently tells Google *"the real version of this
page lives somewhere else"* on every single page. Until one domain wins, no other SEO work has any
effect.

## Decision (already made — D1)

- **Canonical: `https://www.dailycalculations.com`**
- The apex `dailycalculations.com` also resolves and must **301 → www**.
- `dailycalculations.app` is stale. Delete the string; do not redirect to it.

## Do

1. **Create `lib/site.ts`:**

   ```ts
   export const SITE_URL =
     process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dailycalculations.com';

   export const SITE_NAME = 'Daily Calculations';
   ```

2. **Move `siteName` out of `lib/seo.ts`.** It currently exports both `siteName` and `siteUrl`
   (lines 4-5). Re-export from the new module so existing imports keep working, then update
   importers:

   ```ts
   // lib/seo.ts
   import { SITE_URL, SITE_NAME } from '@/lib/site';
   export const siteName = SITE_NAME;
   export const siteUrl = SITE_URL;   // temporary alias — remove in step 03
   ```

   Keeping the aliases means this step does not have to touch every page. Step 03 rewrites those
   call sites properly.

3. **Replace the hardcoded domain** in:
   - `app/sitemap.ts:5` — `const baseUrl = 'https://www.dailycalculations.com'` → import `SITE_URL`
   - `app/robots.ts:9` — the sitemap URL → template off `SITE_URL`

4. **Grep for stragglers:**
   ```bash
   grep -rn "dailycalculations\.\(com\|app\)" --include="*.ts" --include="*.tsx" . \
     | grep -v node_modules
   ```
   Everything that matches should now be `lib/site.ts` only. `wrangler.jsonc` uses
   `dailycalculations` as the **Worker name**, not a URL — leave it alone.

5. **Cloudflare apex → www redirect.** This is dashboard config, not code. Note it for the user
   rather than attempting it:
   > Cloudflare dashboard → the `dailycalculations.com` zone → **Rules → Redirect Rules** → create
   > a rule: *If hostname equals `dailycalculations.com` → Static redirect to
   > `https://www.dailycalculations.com` + preserve path/query, status **301**.*

   Do not try to do this with `next.config.ts` redirects — it would run inside the Worker after the
   request has already been served on the wrong hostname.

## Acceptance

- [ ] `npm run build` passes.
- [ ] The grep in (4) returns hits only in `lib/site.ts`.
- [ ] `curl -s localhost:3000/sitemap.xml | head -20` shows `www.dailycalculations.com` URLs.
- [ ] `curl -s localhost:3000/robots.txt` points at `https://www.dailycalculations.com/sitemap.xml`.
- [ ] Page source of any page shows an OG URL on the `.com` domain, not `.app`.

## Do NOT

- Do not fix the canonicals yet — that is step 03, and it depends on the routing change in step 02.
- Do not touch the sitemap's structure (the locale loops and the broken `alternates`). Only the
  domain string changes here. Step 04 rewrites it.

## Finish

Update `mdFiles/STATUS.md`: mark 01 `DONE`, add the session-log line, and note whether the Cloudflare
redirect rule has actually been created or is still pending on the user.
