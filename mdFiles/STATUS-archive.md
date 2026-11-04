# Daily Calculations — session log archive

Older session-log entries moved out of `STATUS.md` to keep that file readable in one pass.
Covers steps 01 through UX-03 (2026-09-10 through 2026-10-31). Current/recent entries
(roughly the last day of work) stay in `STATUS.md`'s own Session log section; this file is
appended to over time as that section is trimmed again.

---

01 · 2026-09-10 · Created `lib/site.ts` (`SITE_URL`, `SITE_NAME`). `lib/seo.ts` now re-exports
`siteName`/`siteUrl` from it — those aliases are temporary and step 03 removes them. `app/sitemap.ts`
and `app/robots.ts` import `SITE_URL`. The stale `https://dailycalculations.app` string is gone from
the repo; the only literal domain left is `lib/site.ts:2`. Build + lint pass.

02 · 2026-09-10 · English-only. `routing.locales = ['en']`, `localePrefix: 'as-needed'`,
`localeCookie: false`. `middleware.ts` now wraps the next-intl middleware and 301s `/en/*` and
`/{de,fr,es,it}/*` to the unprefixed path (query string preserved). Deleted `app/page.tsx` (the old
`redirect('/en')`). Every `generateStaticParams` returns a single `en` entry. `LanguageSwitcher`
removed from `Header` (the component file stays on disk for step 19). Build went from **~350 static
pages to 82**; the sitemap from ~360 `<loc>` entries to **72**. Build + lint pass.

03 · 2026-09-10 · `buildCanonical(path)` in `lib/seo.ts` is now the only place a canonical is
built. It lives inside `buildCalculatorMetadata` / `buildCategoryMetadata`, so **every future
calculator and category gets a canonical for free** — do not add one at the page level for those two.
Added `generateMetadata` to `/calculators`, `/categories` and `/suggestions` (they had none and were
inheriting the homepage title from the layout). The `siteName` / `siteUrl` aliases in `lib/seo.ts`
are gone; call sites import `SITE_NAME` / `SITE_URL` from `lib/site` directly. Verified: 72 pages,
72 unique canonicals, exactly one per page, none containing `/en/` or `dailycalculations.app`, no
hreflang anywhere. Build + lint pass.

04 · 2026-09-10 · **Phase A complete.** `updatedAt: string` (required) added to `CalculatorConfig`
and populated on all 53 with the `2026-09-10` baseline. `app/sitemap.ts` rewritten flat — no locale
loops, no `alternates`/hreflang, `changeFrequency: 'monthly'`, priority **0.8 calculators / 0.6 home
+ categories / 0.5 the other 7 static pages**. `robots.ts` now also `Disallow: /api/`. Sitemap entry
count: **~360 (pre-step-02) → 72 (step 02) → 72 now**, but the 72 are no longer redirect targets and
the ~80% garbage hreflang alternates are gone. Verified: 72 `<url>`, 72 unique `<loc>`, 0 containing
`/en/` `/de/` `/fr/` `/es/` `/it/`, 0 `hreflang`/`xhtml:link`, every `<loc>` on
`https://www.dailycalculations.com`, XML tag-balanced with all dates and URLs parseable. Build + lint
pass.

05 · 2026-09-10 · `aliases: string[]` and `related: string[]` (both **required**) plus
`redirectFrom?: string[]` added to `CalculatorConfig` and populated on all 53 from §1.5. Pure data —
no UI, no rendered output change, and **no `updatedAt` bumped** (all 53 still `2026-09-10`), which is
correct per the step-04 note. Diff is 116 insertions, 0 deletions, one file. Validation passed:
53 calculators, **0 broken `related` ids**, 0 self-references, 0 duplicate entries, every calculator
≥3 aliases and 3-4 related, no `redirectFrom` slug colliding with a real id. Build + lint pass;
still 78 static pages.

06 · 2026-09-10 · New **`lib/redirects.ts`** derives `CALCULATOR_REDIRECTS` (old path → canonical
path) from every calculator's `redirectFrom`; `middleware.ts` spreads it into the existing
`RENAMED_PATHS` map. **Nothing is hand-listed** — retiring a redirect is now a one-line delete in
`data/calculators.ts` and no other file changes. Also restructured the middleware to strip a dead
locale prefix and resolve a rename **in the same pass**, so a URL needing both answers a single 301
instead of chaining; `/en/about-us` went from 2 hops to 1. Verified against a real `next start`:
all 6 slugs 301 to the right canonical, query strings survive, `/en/*` and `/de/*` variants resolve
in one hop, 6 known-good pages still 200, and an unknown slug still 404s. Build + lint pass.

07 · 2026-09-10 · `buildPageJsonLd` now returns **an array of 4 nodes** —
`WebApplication` → `BreadcrumbList` → `HowTo` → `FAQPage` — matching `buildHomeJsonLd`'s shape (each
node carries its own `@context`; the page already `JSON.stringify`s whatever it gets, so the page
change was zero). Two new exports in `lib/seo.ts`, `buildBreadcrumbs(slug)` and
`buildHowToSteps(slug)`, are the **single source** both the JSON-LD and the rendered markup read —
Google cross-checks them and two hand-written copies would drift. New `components/Breadcrumb.tsx`
(server component, `nav[aria-label="Breadcrumb"] > ol`, last crumb `aria-current="page"`) replaces
the bare category eyebrow above the H1. The "How to use" section gained `id="how-to-use"` and a
visible `<ol>` of the same steps the `HowTo` node lists. `updatedAt` deliberately **not** bumped —
markup is not a content change. Verified by parsing all 53 prerendered HTML files: 4 nodes each,
JSON parses, `alternateName` matches `aliases` on all 53, 0 `/en/` in JSON-LD or body, breadcrumb
positions 1-4 with no `item` on the last, HowTo steps 2-9 and every step name visible. Build + lint
pass; still 78 static pages.

08 · 2026-09-10 · Aliases now surface in all four places §1.4 asks for (JSON-LD was already
done in 07). Two new builders in `lib/seo.ts`: `buildAliasSentence(slug)` renders the visible
"Also called a home loan calculator, …" line under the H1 (first 4 aliases, `a`/`an` chosen from
the first one), and `buildRelatedLinks(slug)` returns `{ id, href, anchor, description }[]` where
**`anchor` is an alias of the target, not its title** — picked from `hashSlug(sourceId) %
target.aliases.length`, so the same target is linked under different wording from different pages.
New `components/RelatedCalculators.tsx` renders the block after the FAQ.
`CalculatorSearch.fuzzyFilter` now also matches `aliases` (`SearchItem` gained the field; the
homepage `searchItems` map passes it through). Two strings added to `messages/en.json`
→ `calculator.relatedTitle` / `relatedDescription`. `updatedAt` **not** bumped — template change,
same call as step 07. Verified against all 53 prerendered HTML files: every page has the sentence
and names only real aliases, link count matches `related` length on all 53, **0 dead links, 0
self-links, 0 repeated anchors within a page, 0 `/en/` hrefs**, every anchor is a real alias of its
target, and of the 49 targets linked from more than one page **0 have only one anchor form** —
131 distinct anchor forms across 52 targets. Build + lint pass; still 78 static pages.

09 · 2026-09-10 · `/calculators` gained a search box, category filter chips and working
`?q=` / `?category=` params, so §2.7's `SearchAction` promise is now true. New
**`components/CalculatorBrowser.tsx`** (client) + **`lib/search.ts`** (`matchesQuery`,
`parseListingParams`, `buildListingSearch` — all pure). `CalculatorSearch` now imports the same
predicate instead of its own `fuzzyFilter`, so alias matching cannot drift between the two boxes.
`CalculatorCard`'s prop narrowed to `Pick<CalculatorConfig, 'id'|'title'|'description'|'category'>`
so a client component can render it. Homepage/layout `keywords` cut 19 → 15. **The `SearchAction`
itself needed no code change** — its `urlTemplate` was already correct after step 02; this step made
the target real. `updatedAt` **not** bumped — no calculator data changed. Build + lint pass; still
78 static pages. Verified against the prerendered HTML (53/53 calculator links, 11/11 category
links, 0 `/en/`, canonical unchanged), 27 unit assertions on the pure functions against the real
data, and a live hydrated run on `:3007` in Chrome (`?q=mortgage` → 2, `?q=emi` → 3 incl.
`mortgage-calculator` by alias, `?category=health` → 6, chip + typing + clearing all round-trip the
URL, `history.length` unchanged at 3, no console errors).

10 · 2026-09-10 · **Phase C pilot shipped.** New optional `content?: CalculatorContent` on
`CalculatorConfig` (`howTo` / `formula` / `workedExample` / `watchOut`), populated on
**`date-difference-calculator` only**; its `seo.faq` went **2 → 8**. The template rebuild lands on
all 53 pages: hero compressed out of its `shadow-panel` card (§4.3) so the widget sits above the
fold, `example` moved below the widget, and three new server components —
**`FormulaSection`**, **`WorkedExampleSection`**, **`WatchOutSection`** — render only when `content`
exists. `buildHowToSteps` now returns the hand-written steps when `content` is present and falls
back to the input-derived ones otherwise, so the `HowTo` JSON-LD followed for free (step 07's design
paid off — one function changed, zero JSON-LD edits). Three strings added to `messages/en.json`.
Verified: 78 static pages, 53/53 calculator pages with 4 JSON-LD nodes each, pilot H2 order exactly
§4.2's, **1,379 words** (up from ~150), HowTo JSON-LD == the 5 hand-written steps and all 5 visible
in the `<ol>`, FAQPage 8 entries, 0 content sections leaked onto the other 52, 0 `/en/` hrefs,
canonical unchanged. Build + lint pass.

16 · 2026-09-10 · **Phase D complete.** Categories **11 → 12** (not 14 — see the deferral below).
`social` → **`creator`** ("Creator Tools"), `taxes` merged into **`shopping`** ("Shopping & Tax"), new
**`travel`** and **`text`**. Eleven calculators reassigned (the 9 from §1.2 plus the two YouTube/Instagram
tools that rode the `social` rename). New `redirectFrom?: string[]` on **`CalculatorCategory`** and a new
**`CATEGORY_REDIRECTS`** in `lib/redirects.ts`, built exactly like `CALCULATOR_REDIRECTS` — the two dead
category 301s are **derived, not hand-listed**, so `middleware.ts` gained one spread and nothing else.
Final distribution: finance 8 · health 6 · home 6 · auto 6 · shopping 5 · time 5 · travel 4 · work 4 ·
measurements 4 · creator 2 · text 2 · education 1. Static pages **78 → 79**, sitemap **72 → 73**.
Verified: 12 categories, 0 orphaned `category` values, 0 empty categories, card counts match the target
table on all 12 prerendered pages, all 11 moved calculators still 200 on their unchanged slug with both
the visible breadcrumb **and** the `BreadcrumbList` JSON-LD naming the new category, 0 `/en/` hrefs, and
0 pages still linking `/categories/taxes` or `/categories/social`. Live on `next start -p 3021`:
both dead categories 301 to the right target, query string preserved, `/en/categories/taxes` and
`/de/categories/social` resolve in **one** hop, step-06's calculator 301s and `/about-us` still work,
unknown category still 404s. Build + lint pass.

**Next step needs to know:**

- ⚠ **Only two of §1.2's four new categories were created. `math` and `tech` are deferred to steps
  24 and 25** — the steps that build their calculators. Creating them now would have shipped two
  category pages with an **empty** card grid, prerendered, linked from the homepage and `/calculators`,
  and submitted in `sitemap.xml`. §1.2's own argument for merging `taxes` is that a two-item category
  page is not worth having; a zero-item one is worse, and it would have sat in the index for the whole
  of Phase F. **Steps 24 and 25 must each add their `categories` entry alongside their calculators** —
  their scope rows now say so. End state is still 14.
- **Category 301s are derived from `CalculatorCategory.redirectFrom`, same as the calculator ones.**
  `shopping` carries `['taxes']`, `creator` carries `['social']`. Retiring a category redirect is a
  one-line delete in `data/calculators.ts`; `lib/redirects.ts` and `middleware.ts` need no edit. Do
  **not** hand-list category slugs in the middleware.
- **No `updatedAt` was bumped, and that is correct.** Moving a calculator between category listings
  changes its breadcrumb's middle crumb and nothing else — same call as steps 05, 07, 08 and 09.
  Steps 12-15 still **must** bump it, because those rewrite the page body.
- **The 12-15 batch counts in the step index are now the real ones.** Post-restructure: 12 = finance 8
  + shopping 5 = **13**; 13 = health 6 + measurements 4 = **10**; 14 = auto 6 + home 6 = **12**;
  15 = time 5 + travel 4 + work 4 + creator 2 + text 2 + education 1 = 18 minus the pilot = **17**.
  Sum 52. These match — nothing to re-plan.
- **`categories` is now ordered by member count, not by age.** The homepage grid (`lg:grid-cols-4`)
  and `/calculators` therefore lead with the fat categories and end with `education` at 1. If step 24
  or 26 changes counts, re-sort the array rather than appending.
- **Four category descriptions were rewritten** (`finance`, `shopping`, `time`, `creator`) because each
  named a calculator that left. If a future step moves a calculator, check the description of **both**
  categories — they enumerate members and go stale silently.
- ⚠ **`README.md` is now visibly wrong** — it has a `### Taxes` heading, no Travel/Text sections, and
  files `unit-price-calculator` under Home. Deliberately not patched here: **step 27** regenerates the
  whole list from `data/calculators.ts`. Do not hand-edit it in the meantime.
- **Category and listing pages still emit no JSON-LD and no visible breadcrumb.** Parked since step 07,
  and the reason it was worth waiting is now spent — the names are settled, so this is unblocked
  whenever someone wants it. `components/Breadcrumb.tsx` is generic and drops straight in.
- ⚠ **:3011 is now also occupied**, on top of the known :3000. This environment has several stray
  listeners; probe with `netstat -ano | grep ":<port> "` before picking one. :3021 was free and worked.


- **Step 11 is the measure gate and it is now armed.** Deploy, request indexing on
  `/calculators/date-difference-calculator`, wait 2-3 weeks, then read Search Console. Do **not**
  start 12-15 until it moves. Note the ⚠ below — the deploy still carries the unfixed apex→www gap.
- ⚠ **`updatedAt` on the pilot did not change, and that is correct.** It was already `2026-09-10`
  and the content change happened on `2026-09-10`. Do not read it as a missed bump — the rule from
  step 04 still stands, and steps 12-15 **must** bump it because those pages carry older dates.
- **`content` is optional and must stay optional until 12-15 have run.** Making it required is the
  natural-looking cleanup and it would break the build on 52 calculators. The whole point of the
  step-11 gate is that those 52 are not written yet.
- **`CalculatorClientConfig` is now `Omit<CalculatorConfig, 'compute' | 'content'>`.** The prose is
  server-rendered; keeping it out of the props stops every word crossing the RSC boundary into
  `CalculatorForm`. The page destructures `const { compute, content, ...clientCalculator }`.
  Note this only trims the **flight payload** — `CalculatorForm` imports `findCalculator` from
  `data/calculators` directly, so the whole data module is in the client bundle regardless. Parked.
- **`lib/seo.ts`'s `HowToStep` is now an alias of `CalculatorHowToStep`** from `data/calculators.ts`.
  Data owns the shape so hand-written and derived steps cannot drift; the import direction
  (`lib/seo` → `data`) is unchanged, so there is no cycle. Do not re-declare the type in `lib/seo`.
- **`FaqSection`'s title is now a real `<h2>`** (it was a styled `<span>`, so the FAQ block had no
  heading element at all and the page's H2 sequence had a hole in it). The description became a
  `<p>` and the wrapper a `<div>` inside the `<summary>`. **This also changes the homepage**, which
  uses the same component — same classes, no visual change, one more correct H2. The individual FAQ
  questions are still `<span>`s inside their `<summary>`; promoting them to `<h3>` is parked.
- ⚠ **The `tailwind.config` dead-shade trap from step 09 is real and confirmed in the built CSS.**
  Grepping `.next/static/css/*.css` shows `dark\:text-brand-100` present and
  `dark\:text-brand-300` **absent** — every existing `dark:text-brand-300` in the codebase emits
  nothing. The new components deliberately use `dark:text-brand-100` (`#d9ecff`, defined). **When
  writing new components, only `brand-50 / 100 / 500 / 700` exist.** Still parked as a cleanup.
- **The pilot's worked-example figures were verified against the live widget, not just arithmetic.**
  1 Jan 2024 → 4 Jul 2026 renders 915 / 130.71 / 30.06, matching the hand-written numbers exactly.
  Steps 12-15 should do the same — a worked example that disagrees with the calculator on its own
  page is worse than no worked example.
- **The section shell markup is duplicated five times now** (`page.tsx` how-to,
  `FormulaSection`, `WorkedExampleSection`, `WatchOutSection`, `RelatedCalculators` all repeat
  `rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-panel dark:…`). Extracting a
  `ContentSection` shell was deliberately not done mid-step. Parked.
- ⚠ **Chrome screenshot capture timed out twice** (`Page.captureScreenshot` after 30s) partway
  through the visual check, while `read_console_messages` kept working and showed **no page errors**
  — only Chrome-extension `message channel closed` noise. The tab was not frozen and the page is
  fine; the capture subsystem is the flaky part. If it recurs, fall back to asserting against the
  prerendered HTML and the built CSS rather than debugging the browser.


- ⚠ **Never read the URL on `/calculators` with `useSearchParams()`.** The page is `force-static`;
  under static rendering Next bails the client tree up to the nearest `<Suspense>` out of the
  prerendered HTML, which would delete all 53 crawlable calculator links from the page Google
  fetches — the exact opposite of what §4.5 asks for. `CalculatorBrowser` therefore renders
  **unfiltered** on first paint and reads `window.location.search` in a mount `useEffect`. Same
  reason it writes the URL with `history.replaceState`, not `router.replace`. If a future step
  "modernizes" this, re-run acceptance check 1 first.
- **Filter state is client-only, so `?q=` and `?category=` serve the same document and the same
  canonical `/calculators`.** No faceted URLs are indexable. The chips are `<button>`s, not links,
  on purpose — do not turn them into `<Link>`s.
- **`lib/search.ts` is now the single matching predicate** for both the homepage box and the listing
  page. Step 16's category rename does not touch it; the chips render from whatever `categories`
  holds, so the restructure needs no change here.
- **`CalculatorBrowser` must never import `data/calculators`.** It takes trimmed props from the
  server page (`id, category, title, description, aliases`). Importing the data module would drag
  53 `compute()` bodies and every FAQ string into the client bundle — the step-06 middleware trap.
  `compute` is a function and does not cross the RSC boundary at all; that is also why
  `CalculatorCard`'s prop type was narrowed.
- **`CalculatorBrowser` reads its strings with `useTranslations('calculators')` rather than taking
  label props** like `CalculatorSearch` does. Deliberate deviation: `resultCount` needs a count at
  render time and a formatter function cannot be passed to a client component (the first build
  failed on exactly that). The layout's `NextIntlClientProvider` already supplies the messages.
- ⚠ **`tailwind.config` only defines brand shades `50 / 100 / 500 / 700`.** `brand-600` was used for
  the active chip and silently emitted no class at all — white text on a white background, caught
  only by looking at a screenshot. **Existing components already reference undefined `brand-200`,
  `brand-300`, `brand-400`, `brand-800`**; those hover/dark styles are quietly dead today. Parked.
- **Three keywords come back later.** `percentage calculator` + `scientific calculator` in step 24,
  `final grade calculator` in step 26 — the arrays in `app/[locale]/layout.tsx` and
  `app/[locale]/page.tsx` are duplicates and must be edited together. `graphing calculator` is gone
  for good (§1.6).
- **Step 10 does not touch `/calculators`.** The listing page and the calculator page template are
  independent; the browser component sits below the category cards and the hero is unchanged.

- **The related block is the site's only calculator-to-calculator linking.** It renders from
  `buildRelatedLinks(slug)`; step 10's template rewrite must keep it and must not re-derive anchors.
  Anchor choice is a pure function of the two ids — keep it pure, the pages are `force-static`.
- **`gpa-calculator` is linked from nowhere** (0 inbound `related` entries) because all four of its
  real siblings are future pages. Step 26 fixes this when it swaps in the §1.5 values — until then
  it is reachable only from the category/listing pages. `tip-calculator`,
  `pregnancy-due-date-calculator` and `timezone-meeting-planner` have exactly 1 inbound link.
- **Anchor text varies per source page, so a target's anchor is not stable across the site.** That
  is deliberate (§1.4). Do not "fix" it by pinning `aliases[0]`.
- **`CalculatorSearch`'s `SearchItem` now requires `aliases`.** Step 09 adds the same component to
  the listing page — pass `aliases` there too or the alias matching silently disappears on that page.

- **Step 07's shared builders are the page template's contract.** `buildBreadcrumbs(slug)` returns
  `{ name, href? }[]` (Home → Calculators → Category → Title, last one `href`-less) and
  `buildHowToSteps(slug)` returns `{ name, text }[]`. **Step 10 must render from these, not
  re-derive them** — and when step 10 adds real hand-written how-to content to `CalculatorConfig`,
  `buildHowToSteps` is the one function to change; the JSON-LD follows for free.
- **`Breadcrumb.href` is `''` for Home, not `'/'`.** JSON-LD needs `${SITE_URL}` with no trailing
  slash (agreeing with `buildCanonical('')` and the sitemap root); the component maps `''` → `/` for
  the `<Link>`. Do not "fix" the empty string.
- **`buildHowToSteps` derives steps from `calculator.inputs` and uses the labels verbatim.**
  Lowercasing them was tried and reverted — it produced `Enter annual interest rate (apr)` and
  `Enter fahrenheit`. Five calculators have **zero** `inputs` (`currency-converter`,
  `character-counter`, `hashtag-counter`, `pomodoro-timer`, `timezone-meeting-planner`) and take a
  generic 2-step fallback; any new custom-component calculator will too.
- ⚠ **The heredoc-eats-backslashes trap is not specific to `middleware.ts`.** A quoted
  `python - <<'PY'` heredoc collapsed `[^'\\]` in a validator regex to `[^'\]` and crashed it.
  Write throwaway scripts to the scratchpad and run them by path.
- **Every calculator edit must bump its `updatedAt`.** It is the sitemap's `<lastmod>` — the whole
  point of step 04 was to stop claiming all 53 pages changed on every deploy. Steps 12-15 (content
  rollout) should bump it on each page they touch; step 05 (alias data) should **not** — adding
  `aliases`/`related` is not a content change the crawler needs to re-fetch for. Step 10's pilot
  rewrite of `date-difference-calculator` **should** bump it.
- `updatedAt` sits between `category` and `title` in each object literal. Step 05 adds three more
  fields to the same type — keep the object key order matching the type declaration order.
- `new Date('2026-09-10')` parses as **UTC midnight**, so calculator `<lastmod>` values render
  `2026-09-10T00:00:00.000Z` while home/category/static entries carry the build timestamp. That
  difference is intended and is what makes the sitemap look honest.
- Home stays at `${SITE_URL}` with **no trailing slash**, matching `buildCanonical('')` from step 03.
  They must keep agreeing.
- Full sitemap validation against Search Console's tester is **step 28**, not done here. A structural
  parse (tag balance, `new URL()` on every `<loc>`, `Date.parse()` on every `<lastmod>`, no
  unescaped XML characters) passed locally.

- **Cards passed `locale={locale}` to next-intl's `<Link>`, which force-prefixes the URL.** Under
  `as-needed` that emitted `/en/calculators/...` in the rendered HTML — every internal link pointing
  at a 301. The `locale` prop is gone from `CalculatorCard`, `CategoryCard`, `CategoryGrid` and the
  category `<Link>` in `calculators/[slug]`. **Never pass an explicit `locale` to `<Link>`** — it is a
  locale *switch*, not a hint. Verified: 0 `/en/` hrefs on home, `/calculators`, `/categories`,
  a calculator page and a category page.
- **The `matcher` regex is escape-fragile.** It must read exactly
  `'/((?!api|_next|_vercel|.*\..*).*)'` — a double backslash in the source. Collapsing it to a single
  backslash silently makes the negative lookahead match every non-empty path, so middleware runs on
  `/` only and every other route 404s while the build still passes. If routes 404 after touching
  `middleware.ts`, check this line first.
- ~~`app/sitemap.ts` still loops `routing.locales` and emits a self-referencing `hreflang`
  alternate.~~ — **done in step 04.** The loops and the `alternates` block are gone (D5).
- `setRequestLocale(locale)` is still on every server page and must stay.
- ⚠️ **Next.js 16 warns that the `middleware` file convention is deprecated in favor of `proxy` —
  do NOT migrate. The file must stay `middleware.ts`.** Session 31 tried the official codemod
  (`middleware.ts` → `proxy.ts`) and it broke `npm run deploy`: per Next.js's own docs, "Proxy
  defaults to using the Node.js runtime. The `runtime` config option is not available in Proxy
  files" — there is no way to force `proxy.ts` back onto the Edge runtime. `@opennextjs/cloudflare`
  hard-refuses Node.js middleware (`useNodeMiddleware()` in its `build.js`) and `npm run deploy`
  exits 1 with "Node.js middleware is not currently supported." Reverted the same session. The
  warning is genuinely cosmetic only as long as the file keeps the old `middleware.ts` name/export —
  build output still labels the route `ƒ Proxy (Middleware)` regardless of which name is used.
- ⚠️ **PENDING ON THE USER — not code:** the Cloudflare apex→www 301 redirect rule from step 01 is
  **still not created.** See "Pending on the user" below.
- **The four alias stubs are gone.** `app/[locale]/{about-us,contact-us,privacy,terms-and-conditions}/`
  were deleted in step 03 and replaced by a `RENAMED_PATHS` map in `middleware.ts` that answers a real
  **301**. Deviation from the step-03 file, which said to use `permanentRedirect()` — that emits
  **308**, not the 301 the acceptance check asked for. Step 06 adds its `redirectFrom` 301s to the
  same block. Static page count: 82 → **78**.
- **The homepage canonical has no trailing slash** (`https://www.dailycalculations.com`), because
  `buildCanonical('')` concatenates. `app/sitemap.ts` builds the root the same way — verified still
  agreeing after the step-04 rewrite.

---

- **`redirectFrom` exists on exactly four calculators.** `mortgage-calculator`
  (`home-loan-calculator`, `house-loan-emi-calculator`), `car-payment-calculator`
  (`auto-loan-calculator`, `car-loan-calculator`), `tdee-calculator` (`bmr-calculator`),
  `character-counter` (`word-counter`). **Step 06 generates the 301s from this field — do not
  hand-list the slugs in `middleware.ts`.** Add them to the same `RENAMED_PATHS`-style block step 03
  created, so they answer a real 301 and not a 308.
- ⚠️ **Two `redirectFrom` entries are temporary and must be deleted when their page ships:**
  `tdee-calculator → bmr-calculator` dies in **step 23**, `character-counter → word-counter` dies in
  **step 26**. Leaving them in place would 301 the new page to the old one — i.e. the new calculator
  would be unreachable. Both steps must also remove the redirect from `middleware.ts`.
- **Forward references were stripped from `related` and must be restored later.** §1.5's tables
  point at 15 calculators that do not exist yet; shipping those ids would have rendered dead
  internal links in step 08. What to add back, and when:

  | When | Restore to `related` |
  |---|---|
  | Step 23 (`bmr-calculator`) | add `bmr-calculator` to `bmi-calculator`, `calorie-calculator`, `tdee-calculator` |
  | Step 24 (`math`) | add `percentage-calculator` to `salary-raise-calculator`, `discount-calculator`, `cashback-calculator` |
  | Step 26 (`word-counter`) | add `word-counter` to `character-counter`, `hashtag-counter` |
  | Step 26 (`study-time-calculator`) | add `study-time-calculator` to `pomodoro-timer` |
  | Step 25 (`iban-calculator`) | add `iban-calculator` to `currency-converter` |
  | Step 26 | **replace `gpa-calculator`'s whole `related` list** — see next bullet |

- **`gpa-calculator` carries a placeholder `related` list.** All four §1.5 siblings
  (`grade-calculator`, `final-grade-calculator`, `weighted-average-calculator`,
  `percentage-calculator`) are future pages, so it would otherwise have shipped empty. It currently
  has `pomodoro-timer`, `date-difference-calculator`, `character-counter`, `sleep-time-calculator`.
  **Step 26 must swap in the §1.5 values.** This is the only invented `related` data in the file.
- **Field order:** the three new fields sit directly after `updatedAt`, so every object opens
  `id → category → updatedAt → aliases → related → redirectFrom → title`. §1.3 shows them after
  `inputs`; the file's existing placement of `updatedAt` already differs from §1.3, and keeping the
  metadata contiguous gives a stable one-line insertion anchor. Type declaration order matches.
- **Steps 07 and 08 are now unblocked** — `aliases` feeds JSON-LD `alternateName` and the "Also
  known as" line; `related` feeds the related-tools block with alias anchor text.

- **The six live 301s are `/calculators/<old>` → `/calculators/<canonical>`:**
  `home-loan-calculator` + `house-loan-emi-calculator` → `mortgage-calculator`,
  `auto-loan-calculator` + `car-loan-calculator` → `car-payment-calculator`,
  `bmr-calculator` → `tdee-calculator`, `word-counter` → `character-counter`.
- **Steps 23 and 26 now only need to touch `data/calculators.ts`.** Deleting the `redirectFrom`
  entry removes the redirect — `lib/redirects.ts` and `middleware.ts` are derived and need no edit.
  This is the whole reason the map is generated rather than written out.
- **Middleware bundle grew 185,440 → 280,505 bytes raw (81,437 gzipped), +51%,** because importing
  `data/calculators.ts` drags all 53 `compute()` bodies and every FAQ string into the edge bundle
  for a 6-entry map. Accepted against a 3 MB Workers budget. If it ever matters, the fix is a
  build-time codegen step emitting a literal map — see `Parked`.
- ⚠️ **Rewriting `middleware.ts` wholesale is dangerous — the matcher line does not survive a bash
  heredoc.** Even a quoted `<<'TS'` heredoc collapsed `\\` to `\` in the matcher regex, silently
  reproducing the step-02 breakage (every route 404s, build still passes). Prefer a targeted edit
  over rewriting the file, and check that line byte-for-byte afterwards.
- ⚠️ **Something is already listening on :3000** in this environment. `npm run start` fails with
  `EADDRINUSE` and, if you do not read the log, curl silently answers from that other server — which
  looked exactly like the matcher bug and cost a debugging cycle. Verify on a free port
  (`npx next start -p 3007`) and read the server log before trusting any HTTP check.

29 · 2026-09-13 · Ran out of queue order, in response to a Bing Webmaster Tools SEO report
("duplicate titles", "duplicate descriptions", "descriptions too short", "set up IndexNow").
Checked the duplicate-title/description claim against the actual data: **no exact duplicates
exist** across any of the 54 `seo.title` / `seo.description` values or the 12 category
title/description pairs, and every calculator/category page already carries a correct
`buildCanonical` — the flag is almost certainly stale Bing crawl data from before step 02 killed
the `/de` `/fr` `/es` `/it` locale-prefixed pages (those would have been genuine duplicates). No
code fix applies; will clear once Bing recrawls the 301s. **Lengthened 17 `seo.description`
values** that were under ~110 characters (as low as 60) up to the 120–160 char range, verified
accurate against each calculator's actual `inputs`/`compute` before rewriting — no invented
features. **Set up IndexNow**: key file at `public/<key>.txt`, `scripts/indexnow.mjs` (fetches
`/sitemap.xml`, POSTs every `<loc>` to `api.indexnow.org/indexnow`, no new dependency), wired into
`npm run deploy` and exposed standalone as `npm run indexnow`. Manually verified: 73 URLs
submitted, 202 Accepted. **Found and fixed the doubled-title-suffix bug** noted in Parked since
step 03 — confirmed it was still live by inspecting built HTML (`<title>Mortgage Calculator |
Daily Calculations | Daily Calculations</title>`). Root cause: `app/[locale]/layout.tsx`'s
`title.template = '%s | Daily Calculations'` applies once already; `lib/seo.ts`
(`buildCalculatorMetadata`, `buildCategoryMetadata`, including their not-found fallbacks) and
`about`/`contact`/`privacy-policy`/`terms` were also appending `| Daily Calculations` manually.
Dropped the manual suffix in those seven spots so `title` goes through the template exactly once;
kept a separate `fullTitle` (with suffix) for `openGraph`/`twitter`, since the template does not
touch those. **The homepage is the one exception — its title.template does not apply to it**
(verified empirically: a clean `rm -rf .next && npm run build` still renders home's `<title>` with
no suffix at all when the manual one is dropped, while every other page renders correctly with
exactly one). Left `app/[locale]/page.tsx` with its manual full-brand title, matching the original
Parked note which never listed the homepage among the affected pages. Verified via built HTML in
`.next/server/app/en*.html` across home, a calculator, a category, and all four static pages — one
suffix everywhere, zero on none. Build + lint pass (lint's 115 errors are all pre-existing,
confined to the untracked `.open-next/` build-output directory — see step 27).

**Next step needs to know:**

- The homepage title-template quirk is unexplained — worth a look if step 27's metadata-collapse
  cleanup ever revisits `app/[locale]/page.tsx`. Empirically confirmed, cause unknown (possibly a
  Next.js/next-intl interaction specific to the index segment matching its layout's own
  `generateStaticParams` shape). Don't reintroduce the "drop the manual suffix" fix there without
  re-verifying against a clean build.
- The metadata-collapse item in Parked (overlapping OG/Twitter title strings across 4 places) is
  still open — this session only removed the *doubling*, it did not consolidate the duplication of
  the title string itself into one helper.

30 · 2026-09-13 · Continuation of step 29's ad-hoc Bing cleanup, interrupted by a VS Code restart
mid-edit and resumed from the uncommitted working tree. `middleware.ts`'s dead-locale stripping
only ever removed one leading segment; old language-switcher links left crawlable stacked prefixes
like `/fr/it/calculators/x`, which resolved via two chained 301s (one per segment) instead of one —
the exact kind of stale-crawl noise step 29 attributed to Bing's duplicate-title report. Replaced
the single-segment `slice` with `stripDeadLocalePrefixes()`, a loop that strips every leading
`en`/`de`/`fr`/`es`/`it` segment before the rename lookup runs, so a stacked-prefix URL needing
both a strip and a rename still answers a single 301. Verified the matcher regex line survived
byte-for-byte (`'/((?!api|_next|_vercel|.*\\..*).*)'`, double backslash intact — see the step-02/06
warning above). Verified on a clean build + `npx next start -p 3007` (port 3000 was occupied by
another process, per the existing warning): `/fr/it/calculators/mortgage-calculator` → single 301
to `/calculators/mortgage-calculator`; `/de/en/contact-us` → single 301 to `/contact` (strip then
rename in one hop); a lone `/fr/calculators` and plain `/` behave unchanged. Also added `test*` to
`.gitignore` (untracked scratch files from this session's manual curl/port testing). No `STATUS.md`
step was open for this — it rides on step 29's ad-hoc entry rather than the numbered queue.
**Side note from the verification run:** the `npx next start -p 3007` process launched to test this
was never actually killed (the interactive `kill %1` didn't reach it) and lingered holding a lock
on `.open-next`, which surfaced later as an `EPERM` on `npm run deploy`. Fixed by finding the real
Windows PID via `netstat -ano | grep <port>` and `taskkill //F //PID <pid> //T` — `kill %1` inside
Git Bash does not reliably reach a `node.exe` spawned via `npx`, so use `netstat`+`taskkill` to
confirm a test server actually died, not just that the shell job appears to have exited.

31 · 2026-09-13 · Ran the official Next.js codemod (`npx @next/codemod@canary middleware-to-proxy .`)
to clear the "middleware file convention is deprecated" build warning noted since early sessions.
Renamed `middleware.ts` → `proxy.ts` and `export default function middleware` →
`export default function proxy`; verified the matcher regex survived byte-for-byte and a clean
`npm run build` passed with no deprecation warning. **Then `npm run deploy` failed** with
`ERROR Node.js middleware is not currently supported. Consider switching to Edge Middleware.`
Root cause, confirmed against `@opennextjs/cloudflare`'s own source
(`useNodeMiddleware()`/`build.js`) and Next.js's `proxy.js` doc page: **`proxy.ts` always runs on
the Node.js runtime — "The `runtime` config option is not available in Proxy files. Setting the
`runtime` config option in Proxy will throw an error"** — there is no way to force it back onto
Edge. `@opennextjs/cloudflare` refuses to bundle Node.js middleware outright, so the rename is
permanently incompatible with this project's Cloudflare Workers deployment, not just a transitional
warning. **Reverted in the same session**: `git mv proxy.ts middleware.ts`, function renamed back
to `middleware`, `lib/redirects.ts:6`'s comment restored, and every `STATUS.md` note this session
had pointed at `proxy.ts` (steps 19, 27, the matcher-regex warning, the wholesale-rewrite warning,
the 23/26 `redirectFrom` cleanup notes) reverted to `middleware.ts`. Verified: `npm run build` and
`npx opennextjs-cloudflare build` both pass cleanly (the latter reached "OpenNext build complete."
with `.open-next/worker.js` produced — the exact step that failed before the revert).
⚠️ **Decision: `middleware.ts` must not be renamed to `proxy.ts` while deploying via
`@opennextjs/cloudflare`.** The deprecation warning is genuinely cosmetic *only* under the old
name/export — do not "fix" it again without first confirming OpenNext Cloudflare supports Node.js
middleware (or Edge-runtime proxy) upstream. Left `mdFiles/memory/project_i18n.md` untouched —
still step 27's job, still wrong about 5 locales/next-intl 3.x/`LanguageSwitcher`; its claim that
the file is `proxy.ts` is wrong again, for the original reason.

**Next step needs to know:**

- Do not re-attempt the `middleware.ts` → `proxy.ts` migration. See the ⚠️ decision above and the
  updated warning further up this file — check `@opennextjs/cloudflare`'s changelog for Node.js
  middleware / Edge-runtime-proxy support before ever revisiting this.
- The lingering-test-server lesson from session 30 applies here too — this session's own verification
  server was killed via `netstat`+`taskkill` and confirmed via a second `netstat` check before
  finishing, not just `kill`.
- `npm run deploy`'s earlier `EPERM` was the session-30 process leak, unrelated to this rename
  attempt. If `EPERM` on `.open-next` recurs, check for a stray `next start`/`next dev` first.

17 · 2026-10-13 · **E1: compute snapshot tests.** New `data/calculators.spec.ts` (+ committed
`data/calculators.spec.ts.snapshot`): `node:test` on Node 24 type stripping with the built-in
`t.assert.snapshot`, **no new dependency**. Each of the **49** calculators with a non-empty `compute()`
is snapshotted at 3 generated input sets (`default`; `typical` = defaults ×1.5 rounded to `step`, with
calendar/clock fields shifted instead; `edge` = every input at `min` or 0), outputs rounded to 10
significant digits. Plus: default/typical outputs must be finite, edge non-finites must match
`KNOWN_NON_FINITE` exactly (only `bmi-calculator.bmi` today); the 5 custom tools must return `{}` and
be the only ones that do; `force-calculator` `solve.*` against hand values + divide-by-zero NaN; a meta
test that snapshotted + custom = all 54. **57 tests.** `tsconfig.json` gained
`allowImportingTsExtensions: true` (the spec imports `./calculators.ts`; Node ESM needs the extension).
Excluding the spec from tsconfig was tried and broke ESLint (`parserOptions.project`). `@types/node` is
20.x and lacks `snapshot()` typings, so the one call site casts. Build + lint + test pass; second test
run left the snapshot unchanged. Step file: `mdFiles/steps/17-compute-snapshot-tests.md`.

**Next step needs to know:**

- **Run:** `npm test`. **Update snapshots:** `npm run test:update` (= `node --test
  --test-update-snapshots "data/**/*.spec.ts"`), then review the `.snapshot` diff before committing.
  A new calculator fails `npm test` until its snapshot is written: that is intended.
- Every v2 conversion (steps 32–37) and step 18 must keep `npm test` green **without** updating
  snapshots, unless the PR says which output changed and why.
- ⚠️ `.gitignore` has a bare `test*` pattern (hides `test_reports_google/`): any file or folder whose
  name starts with `test` is silently untracked. Name test files `*.spec.ts`, never `tests/`.
- When step 39 (E7) splits `data/calculators.ts`, the spec imports `calculators` from
  `./calculators.ts` and the snapshot keys are calculator ids, so only the import path should move.

fix · 2026-10-13 · pregnancy-due-date-calculator uses the real date (injectable todayMs, timeDependent flag, post-mount render) · `compute()` reads optional `values.todayMs` (not an input) and falls back to the local current date. New optional `CalculatorConfig.timeDependent`; `CalculatorForm` shows `—` for its result values until mount, so static HTML and hydration match. The spec passes a pinned `todayMs` (2026-06-17) to timeDependent calculators, so the snapshot is unchanged. Any future date-relative calculator should set `timeDependent: true` and read `values.todayMs`.

30 · 2026-10-13 · **E2: units v2.** `lib/units.ts` goes from 3 to 17 dimensions (adds length, area,
volume, time, speed, temperature, energy, power, pressure, data, fuelEconomy, percent, count,
currency). A `Unit` is now `factor`, `factor` + `offset` (affine; °C/°F) or a `toBase`/`fromBase` pair
(`inverse(k)` for mpg, km/L). `UNITS`/`findUnit`/`toBase`/`fromBase` signatures unchanged;
`SolverCalculator.tsx` and `force-calculator` untouched, and their factors are pinned in a test. New
`lib/units.spec.ts` (37 tests: base-first, round trips, anchors); `npm test` glob is now
`"{data,lib}/**/*.spec.ts"` (94 tests). Step file: `mdFiles/steps/30-units-v2.md`.
**What step 31 (solver v2) needs to know:** bases are SI and first in each list, with K for
temperature and **m³/m** for fuel economy (so `volume = distance × economy`); `percent` passes the
percent number (5 = 5%), so solvers divide by 100. `toBase` of 0 mpg is `Infinity`. `count` and
`currency` have a single unit, so the solver should hide the unit `<select>` for single-unit
dimensions (it still renders one). Currency label is a `¤` placeholder until step 18 / E6. Stone (GB)
and the AU 20 mL tbsp are not added; stone goes in with batch 2, because adding it now would change the force-calculator mass menu.

31 · 2026-10-13 · **E3: solver v2** (stacked on step 30's PR). `solve` entries are now optional: a variable without one is found numerically from `equation` (residual) within its `bounds`/`guess` by `lib/solve.ts` (grid bracket → Brent, Newton fallback, capped, `NaN` with no root or at a pole). New `outputs` (derived figures under the result) and `fixed: true` (input-only, out of the auto rotation). State logic moved to `lib/solverState.ts`; single-unit dimensions show the unit inline; non-finite inputs/results mean no answer. force-calculator unchanged (same order, share link, snapshots); 145 tests. Step file: `mdFiles/steps/31-solver-v2.md`. **What step 32 (visuals kit) needs to know:** `solveState()` returns `{ target, result, si, outputs }` with every variable in SI, so a visual (Donut principal/interest, AmortizationTable) can read `si` and `outputs` directly; the result card already has an output `<dl>` and the force-only `LogScale` slot (`solver.benchmarks`) to generalize. Currency still uses the `¤` placeholder, rounded to cents via `formatFull`.

32 · 2026-10-13 · **E4: result visuals kit.** New `components/visuals/`: `LogScale` (generalized from
`SolverCalculator`: exponent range, tick labels and title are props), `RangeBar`, `Donut`,
`CompareBars`, `Timeline`, `AmortizationTable` (the only client component: the "show all" toggle).
Pure math in `lib/visuals.ts` (linear/log position, donut arcs, band lookup, bar widths, `tint`) and
`lib/amortization.ts` (`monthlyPayment`, yearly `amortizationSchedule`). Accent from props, `role="img"`
+ worded `aria-label`, no clock or `window` reads, fixed heights. `SolverCalculator` now renders the
shared `LogScale`, and the force page's markup is unchanged apart from the wrapper's `role`/`aria-label`.
No calculator converted, no demo page. New `lib/visuals.spec.ts` + `lib/amortization.spec.ts`: **176
tests** (was 145), snapshot unchanged. Build + lint pass. ⚠️ The brief's anchor "year-1 interest ≈
$11,933.85" for $200k / 6% / 30 y is wrong: the closed form and a cent-rounded schedule both give
**$11,933.19**, and the test uses that. Also folded in: **workflow change** (D11, Phase H note, rollout
plan §5/§6 with the pace recomputed for one batch at a time, the add-calculator skill and
`calculator-builder` agent). Template §2 gained "Result visuals". Step file: `mdFiles/steps/32-visuals-kit.md`.
**What step 33 (type-B widget) needs to know:** `BreakdownCalculator` should take a visual slot
that reads `compute()` outputs and renders one kit component per the template §2 table. Pass display
units (not SI), the category accent from `TILE_COLORS[categoryTheme(category).color][1]`, and, for
`Timeline`, `today` only after mount (`timeDependent`). `AmortizationTable` wants `principal`,
`annualRate` (percent number) and `months`. The kit's default `format` is `formatSignificant`
(cents for the table), with the same `¤` / en-US caveats as before until step 18.

33 · 2026-10-19 · **E5: type-B widget.** New `components/BreakdownCalculator.tsx` renders every
calculator that has no `solver` and isn't a custom type-C tool (48 pages): grouped inset inputs (unit
menu when an input sets `dimension` + `unit`), a result card with the headline, breakdown rows and a
visual slot (`components/BreakdownVisual.tsx`: donut, compareBars, rangeBar, timeline, amortization,
logScale, fed by key), and share / copy / reset. **Decision: `CalculatorForm` is deleted, no shim**
(the page was its only caller), and `CalculatorClientConfig` with it. Shared parts (card, field row,
result panel, output rows, share/copy/reset bar, `widgetAccent`) moved from `SolverCalculator` into
`components/CalculatorWidget.tsx`; the force page's rendered body is byte-identical to master's.
Config: optional `CalculatorConfig.breakdown` (`headline`, `headlineLabel`, `outputs`, `groups`,
`derive`, `visual`); with none, the first compute key is the headline and the rest are rows, and
currency uses `CalculatorForm`'s exact money rule. Logic in `lib/breakdown.ts`; `compute()` untouched.
Demo config on `commute-cost-calculator` (groups, mi/km + mpg/L/100 km menus, derived monthly tolls
and wear, donut); its distance and MPG labels lost their unit suffix. `lib/calculator.ts` gained
`formatDecimal` and `currencySymbol` (still en-US/USD inside that file, for step 18). **195 tests**
(new `lib/breakdown.spec.ts`, including "every type-B calculator gives exactly `compute()` at its
defaults"), snapshot unchanged; build + lint pass. Browser-checked on `next start`: unit switch keeps
the cost, share link round-trips, reset clears the query, pregnancy shows real-date values after
mount, no console errors. Step file: `mdFiles/steps/33-type-b-widget.md`. Template §2 gained
"Type-B widget"; the add-calculator skill step 2 points at it.
Behavior changes on default pages (display only): results are full, not compact ("$541,116.20", not
"$541.1K"); labels are sentence case; a blank field shows "—" everywhere instead of computing with 0.
**Surprise:** a paused earlier attempt exists (branch `step/33-breakdown-widget`, draft PR #6,
worktree `.claude/worktrees/agent-a0c418cb814f507e7`) with an opt-in design. Superseded by PR #7; see Parked.
**What step 34 (split data file) needs to know:** the breakdown types (`CalculatorBreakdown`,
`BreakdownOutput`, `BreakdownVisual`, …) live beside `CalculatorConfig` and import `type Band` from
`lib/visuals`; `lib/breakdown.spec.ts` imports `calculators` from `../data/calculators.ts`, as
`data/calculators.spec.ts` does, so both import paths move. `breakdown.derive` is a function, so the
data stays a `.ts` module imported client-side (as `compute` already requires).
**What the batches need to know:** set `format: 'currency'` on money outputs whose key doesn't contain
Amount/Cost/Payment/Interest/Principal (e.g. tip's `perPerson` prints as a plain number today), and
give every output a real label (`bmi` shows as "Bmi").

34 · 2026-10-19 · **E7: data file split.** `data/calculators.ts` (2,216 lines) is now
`data/calculators/`: `types.ts` (every config type, unchanged), one `<category>.ts` per category id
(13 files, each `export const <id>Calculators: CalculatorConfig[]`), and `index.ts` (`categories`,
`calculators`, `findCalculator`, `findCategoryCalculators`, `export type *` from `types.ts`).
`@/data/calculators` resolves to the index, so no app import changed. **Decision: listing order is an
explicit `calculatorOrder` slug list in `index.ts`** — the old array interleaved categories, and
listings, sitemap, search and the snapshot test follow it. `calculators` = all category arrays sorted
by that list; an id missing from it sorts last, and the new `data/calculators/index.spec.ts` fails
(unique ids, order list complete, each file holds only its own category). Section-divider comments
were dropped; the five custom-tool stubs keep a one-line comment each. Files run by `npm test` import
`../data/calculators/index.ts` (Node resolves neither directories nor `@/`). Verified: every
calculator object deep-equal to master's (functions by source), `npm test` 198 pass with the
snapshot unchanged, build + lint + `tsc` clean, and built `sitemap.xml`, prerendered routes and the
calculator links on home / `/calculators` / `/categories` / every category page identical to a
master build (only sitemap `lastmod` build timestamps differ). Docs: add-calculator skill,
calculator-builder agent, template §4, CLAUDE.md architecture line, README. Step file:
`mdFiles/steps/34-split-data-file.md`.
**Surprise:** `tsconfig.tsbuildinfo` is tracked and every build rewrites it, so `git commit -a`
picks it up (step 27 already covers deleting it). Don't commit it.
**What step 35 (Batch 1, finance) needs to know:** all eight Batch-1 calculators live in
`data/calculators/finance.ts`; edit only that file (plus `lib/units.ts` / visuals if needed).
Converting an existing calculator does not touch `calculatorOrder`; only a brand-new id must be
appended there. New types go in `data/calculators/types.ts`. Specs import
`../data/calculators/index.ts`.

35 · 2026-10-19 · **Batch 1 finance v2 — DONE** (branch `step/35-batch-1-finance`, PR #9; paused
by the user after 7 of 8, then resumed the same day). All 8 finance calculators are on the v2
template with full content, primary-source references and an "estimates only" note.
Type A (`solver` beside the unchanged `inputs` + `compute()`): **loan** (Donut + AmortizationTable,
rate numeric), **mortgage** (same; down payment `fixed`; input relabeled "Home price", Parked item
closed), **emi** (same; down payment fixed), **compound-interest** (Donut start / contributions /
interest; rate numeric), **investment** (Donut; return numeric), **inflation** (CompareBars; every
field closed-form). Type B: **loan-prepayment** (Timeline payoff; term unit menu on `years`; explicit
formats and labels), **paycheck** (C → B; Donut of where the money goes).
Shared pieces: **`term` unit dimension** (`lib/units.ts`: months base, years = 12); **solver visual
slot** `solver.visuals` + `solver.derive`, drawn by `BreakdownVisual` (`describeSolverKey`,
`solverVisualValues` in `lib/breakdown.ts`); **menu inputs** `CalculatorInput.options` (`ChoiceRow`
in `CalculatorWidget.tsx`, share links accept only listed values). `components/PaycheckCalculator.tsx`
deleted, so it is no longer a custom tool. New tests: every shipped solver solves each field back to its
default-state value and its visuals read keys that exist; menu share-link guard. **221 tests.**
**Snapshot:** only `paycheck-calculator` changed. The new compute is a different contract: inputs
filing status, pay frequency, state and local rate, 401(k) %, pre- and post-tax per paycheck; outputs
net/gross/federal/SS/Medicare/state/local/deductions per paycheck plus yearly net. The old one was a
flat "federal tax rate" placeholder the page never used. Everything else is byte-identical
(compound-interest's compute now uses the annuity factor, which fixes a 0 ÷ 0 NaN at 0% with
contributions but gives identical results on every snapshot input).
**Paycheck uses 2026 figures**, checked on 2026-10-19 against IRS Rev. Proc. 2025-32 (IRB 2025-45),
SSA (wage base $184,500) and the IRS newsroom (401(k) $24,500). The old component's 2025 standard
deduction was pre-OBBBA and wrong. It also wrongly exempted 401(k) deferrals from FICA. The new
model is annual liability ÷ paychecks, not Pub 15-T withholding, and says so. Dropped from the old
component: separate HSA/FSA/dependent-care/commuter fields and their limits (now one pre-tax field).
Numbers: an independent Python checker matched **110** copy figures (0 mismatches); the app's
`compute()`/`solveState()` agree with it. Build + lint (ignoring `.open-next/**`, `.claude/**`) pass.
**Decisions:** type-A variable ids may differ from `inputs` ids (`term` in months). The step ran 8
calculators in one run because the brief scoped it so (D11 says 5 per run).
**What step 36 (Batch 2, shopping + conversion) needs to know:**
- Type A = add `solver` next to the existing `inputs` + `compute()`; the snapshot then does not move.
  Put visuals in `solver.visuals` (same configs as type B) and display-only figures in `solver.derive`.
  The two new solver tests run on every shipped solver automatically.
- Fixed choices (US vs UK gallon, a second discount on/off) can use `CalculatorInput.options` on
  type B. Type A has no menu input yet; use a unit menu (a dimension) instead where it fits.
- No visual for "per-person chips", "strikethrough price card", a thermometer or a
  common-values table exists in the kit. Use the nearest kit component or add to the kit in its own
  step. Never draw one inside a calculator.
- Stone (GB) still needs adding to `mass` for pounds-to-kilograms (step 30 note).
- Type-A currency still shows the `¤` placeholder while kit visuals show `$` (Parked, step 18).

36 · 2026-10-19 · **Batch 2 shopping + conversion v2 — DONE** (branch `step/36-batch-2-shopping-conversion`,
PR #10). Two agent runs: paused after the five shopping calculators (D11), then resumed for the four
converters. All 9 are on the v2 template with full content, primary references and verified numbers.
`inputs` + `compute()` are unchanged on all nine, so **the compute snapshot did not move.**
Type A (solver beside the unchanged forward compute): **sales-tax** (total ↔ price ↔ rate; "remove
tax" = solve for price; Donut price + tax), **tip** (tip ↔ bill ↔ tip %; people `fixed`; Donut bill + tip
with the per-person share in the center), **discount** (sale ↔ original ↔ % off; extra coupon and tax
`fixed`; CompareBars original vs sale), **unit-price** (unit price ↔ cost ↔ quantity; item 2 `fixed`;
per-100 outputs + % difference; CompareBars), **fahrenheit-to-celsius** (RangeBar freezing / body /
boiling via a °C `derive` key; K and °R in the menus), **gallons-to-liters** (US/UK gallon via the unit
menu; LogScale), **miles-to-kilometers** (LogScale with race distances), **pounds-to-kilograms** (stone in
the menus; LogScale). Type B: **cashback** (explicit formats and labels, groups, CompareBars rewards vs fee).
**Stone** (14 lb, exact) is appended to `mass` in `lib/units.ts`. The force-calculator mass menu now
offers "st"; its other units, factors and default result (4,170 N) are unchanged (pinned test extended).
Converters solve exactly via `lib/units.ts`, while the unchanged `compute()` keeps rounded factors
(3.78541, 1.60934, 0.453592): they differ only in the sixth significant figure.
Solver defaults differ from the `inputs` defaults on tip (3 people) and discount (extra 10% coupon),
to match the example lines.
**Test change:** `lib/breakdown.spec.ts` required at least 40 type-B calculators; each type-A conversion
lowers that count, so the floor is now 20 (an empty-loop guard). **246 tests** pass.
Numbers: an independent Python checker matched **173 of 173** copy figures (0 mismatches); the app's
`solveState()` / `compute()` agree. Build + lint (ignoring `.open-next/**`, `.claude/**`) pass. All 9
pages plus force checked on `next start` (H1, every section id, JSON-LD, visual aria-label).
Step file: `mdFiles/steps/36-batch-2-shopping-conversion.md`.
**What step 37 (Batch 3, health, YMYL) needs to know:**
- Same pattern: type A adds `solver` beside the unchanged `inputs` + `compute()`; visuals go in
  `solver.visuals`; display-unit figures (e.g. a value in °C or L rather than SI) come from
  `solver.derive`, because solver visuals receive SI values.
- Health is YMYL: references are mandatory, plus an "estimates only" / not-medical-advice note in
  `formula.note` or a watch-out. Cite primary sources (CDC, NIH, WHO), never other calculator sites.
- BMI's `RangeBar` with WHO bands fits the kit directly. `bmi-calculator` still returns NaN at its own
  min (Parked); guard it in the solver (`NaN` on zero height) without touching `compute()`.
- `mass` now has st (useful for BMI in GB). `length` has ft and in but no combined "5 ft 7 in" input:
  use a single unit menu, or Park it.
- Converting type-B calculators to type A lowers the `breakdown.spec` count again; the floor is 20.
- Sub-cent money and the `¤` vs `$` symbol split are still open (Parked, step 18).

37 · 2026-10-20 · **Batch 3 health v2 — DONE** (branch `step/37-batch-3-health`, PR #11). Two agent
runs: paused after 5 of 6 (D11), then resumed for pregnancy-due-date after merging `origin/master`
(PR #12, currency symbol; one conflict in `lib/units.spec.ts`, both tests kept). All 6 have full
v2 content, primary references (CDC, WHO, NHLBI, NASEM, FAO/WHO/UNU, ACSM, ACOG CO 700 and 579,
Mifflin 1990, Frankenfield 2005, Hall 2011, Riegel 1981) and an "estimate only, not medical
advice" note.
Type A: **bmi** (BMI ↔ weight ↔ height, unitless via `count`, zero height → NaN in the solver;
healthy-weight range outputs at BMI 18.5 / 24.9 in lb; RangeBar with WHO/CDC adult bands; "Bmi"
label gone), **running-pace** (pace ↔ distance ↔ time; **new `pace` dimension** in `lib/units.ts`,
base s/m with min/km, min/mi, s/100 m; speed + even-pace marathon outputs; CompareBars of Riegel
predictions from `solver.derive`). Type B: **calorie** (CompareBars lose / maintain / gain, derived
BMR row), **tdee** (Donut BMR + activity), **water-intake** (CompareBars vs NASEM fluids from drinks,
2.2 / 3.0 L; fl oz headline with L and cups), **pregnancy-due-date** (headline = due date; Timeline
with ACOG trimesters, a 37-week milestone and today after mount; completed weeks + days, trimester,
days left, likely conception).
New shared piece: **`date` breakdown format** (`BreakdownFormat`, `formatDate` in `lib/calculator.ts`,
en-US like the rest of that file until step 18; spec case added). Due/conception dates are derived
with calendar arithmetic, so a DST change cannot shift them by a day.
**`compute()` changes, snapshot explained:**
- calorie + tdee gained a `sex` menu input (0 = male, the old hard-coded +5; 1 = female, −161). Its
  snapshot values are 0 in all three sets, so every output is unchanged; the snapshot diff is only
  the new `"sex": 0` input line (3 per calculator). Activity factor is now a 5-option menu.
- pregnancy's trimester boundaries were ≤ 12 / ≤ 26 weeks; now ACOG's < 14 / < 28. No snapshot set
  falls in the changed ranges (default 15.4 wk, typical 0, edge > 28), so the snapshot did not move.
Numbers: an independent Python checker matched **123 of 123** copy figures (including mm:ss and
calendar dates); the app's `solveState()` / `compute()` / `evaluateBreakdown()` agree, also across a
DST change and at the trimester boundary days. The NASEM water figures (3.7 / 2.7 L total, 3.0 / 2.2 L
from drinks, ~80% from drinks) and the NHLBI waist cut-offs (40 / 35 in; 102 / 88 cm) were confirmed
on primary pages; "aged 19 and over" was softened to "adult" because the quoted sentence is for
ages 19–30. `npm test` 255 pass; build + lint (ignoring `.open-next/**`, `.claude/**`) pass; all 6
pages checked on `next start` (H1, 8 section ids, JSON-LD). The pregnancy page's after-mount values
were checked through the same functions in Node, not in a browser.
Step file: `mdFiles/steps/37-batch-3-health.md`.
**What step 38 (Batch 4, auto + home) needs to know:**
- Same pattern: type A adds `solver` beside the unchanged `inputs` + `compute()`; visuals in
  `solver.visuals`, display figures in `solver.derive`. Type B: `dimension` + `unit` on inputs,
  explicit labels and formats, `options` menus.
- A new input on an existing `compute()` shows up in the snapshot's `inputs` block even when every
  output is unchanged. Pick a value whose default / ×1.5 / min all mean the old behavior (0 works).
- New: `format: 'date'` for epoch-ms outputs (local calendar dates); derive dates with
  `new Date(y, m, d + n)`, not ms arithmetic.
- `pace` exists now; fuel economy already has mpg ↔ L/100 km (gas-cost). Currency now shows the real
  symbol in both widgets (PR #12).
- `lib/breakdown.spec.ts` type-B floor is 20; each A conversion lowers the count.

38 · 2026-10-21 · **Batch 4 auto + home v2 — run 1 of 3, PAUSED after commute-cost** (branch
`step/38-batch-4-auto-home`, draft PR #13). The five auto calculators done so far have full v2 content,
primary references and verified numbers. `compute()` is unchanged on all five, so **the compute
snapshot did not move.**
Type A: **car-payment** (payment ↔ price ↔ term ↔ rate, rate numeric; down payment + trade-in
`fixed`; Donut + AmortizationTable; YMYL "estimates only" note; reuses finance's `loanPayment` /
`loanPrincipal` / `loanMonths`, now exported from `finance.ts`), **gas-cost** (cost ↔ distance ↔
fuel economy ↔ fuel price, all closed form; outputs fuel used in gal and L, cost per 100 mi / 100 km;
CompareBars one way vs round trip from `solver.derive`). Type B: **fuel-cost** (units on every input;
CompareBars your car vs comparison car; cost per 100 mi derived), **ev-charging** (efficiency unit
menu; starting charge now `type: 'percent'`; CompareBars EV vs gas per 100 mi), **commute-cost** (step-33
config kept; labels no longer hardcode `$` or the wrong "IRS: $0.21"; fuel price unit menu).
**New unit dimensions** in `lib/units.ts` (tests in `lib/units.spec.ts`): `fuelPrice` (base currency
per m³; per L, per US gal, per UK gal; labels from `currencySymbol()`) so a fuel price follows the
fuel-economy unit; `evEfficiency` (base J/m; kWh/100 mi as on EPA labels, kWh/100 km, Wh/mi, Wh/km,
mi/kWh, km/kWh).
**Facts checked on primary sources 2026-10-21:** IRS Notice 2026-10 (business rate 72.5 ¢/mi,
depreciation 35 ¢/mi; the old FAQ's 2025 figures and the "$0.21 IRS wear" label were wrong), FEG 2026
(15,000 mi/yr, 55% city, $4.33/gal regular, $0.15/kWh), EIA Table 5.6.A (July 2026 residential 18.31 ¢,
ND 13.41 ¢, HI 48.00 ¢), FHWA (13,476 mi per driver), EPA (MPGe 33.7 kWh/gal, ratings include charging
losses), DOE FOTW #1374, fueleconomy.gov driving tips, CFPB/FTC auto-loan pages. CFPB pages return
403 to curl and FHWA/EPA timed out from curl, but each was confirmed via search/fetch.
Numbers: an independent Python checker matched **89 of 89** copy figures (one mismatch found and
fixed: 84-month extra interest $592.40, not $592.41); the app's `solveState()` / `evaluateBreakdown()`
agree at the defaults, the worked examples and with metric units.
**Resume notes (run 2):** next is toll-cost (B, CompareBars with vs without a pass), then concrete (A),
paint, tile, wallpaper (run 2 ends after wallpaper or after 5), then electricity-bill and furniture-fit.
`fuelPrice` / `evEfficiency` are available for any later input. Don't commit `tsconfig.tsbuildinfo` / `next-env.d.ts`.

38 · 2026-10-21 · **Batch 4 auto + home v2 — run 2 of 3, PAUSED after wallpaper** (same branch, draft
PR #13). `compute()` unchanged on all five, so **the compute snapshot did not move** (still 268 tests,
up from 265 only because the new concrete `solver` adds to `lib/solverState.spec.ts`'s "every shipped
solver is well-formed" loop).
Type A: **concrete** (volume ↔ length ↔ width ↔ depth, waste factor `fixed`; outputs `volumeWithWaste`,
`bags80lb`/`bags60lb` via a `CUBIC_YARD_M3 = toBase(1, 'volume', 'yd3')` conversion from SI; CompareBars
80 lb vs 60 lb bags — nearest kit match for the plan's "bags-needed chips", gap parked). Type B:
**toll-cost** (breakdown added to the old pre-v2 stub; CompareBars annual cost with vs without a pass,
exactly the plan's visual), **paint** (CompareBars gallons needed vs. whole cans to buy, via a
`derive`d `cansToBuy = Math.ceil(gallonsWithBuffer)`; nearest kit for "can-count row", gap parked),
**tile** (CompareBars exact tiles vs. with waste; nearest kit for "grid illustration", gap parked),
**wallpaper** (CompareBars exact rolls vs. rolls to buy, via a `derive`d `rollsExact`; nearest kit for
"roll-count row", gap parked). `length`/`area`/`volume` dimensions on every relevant input and output;
no new unit dimensions needed.
**Facts checked on primary sources 2026-10-21:** QUIKRETE Concrete Mix (1101) data sheet, read from the
downloaded PDF directly (bag yields: 40 lb 0.30 ft³, 50 lb 0.375 ft³, 60 lb 0.45 ft³, 80 lb 0.60 ft³,
90 lb 0.675 ft³ — 45/60/90 bags per cubic yard respectively); Ohio Concrete's Industry Recommendation
for Exterior Concrete Flatwork (3½" minimum for sidewalks/driveways/patios, citing ACI/PCA/NRMCA);
Sherwin-Williams' paint calculator page (350–400 sq ft/gal) and Benjamin Moore's Regal Select technical
data sheet, read from the downloaded PDF (400–450 sq ft/gal, two coats recommended on bare substrates);
Wallcovering Installers Association's consumer tips page (a 24"+ drop match "will require additional
wallpaper to be ordered") and its Wallcovering Estimator page (perimeter × height ÷ ~25 sq ft per single
roll); E-ZPass Interagency Group (20-state network), Central Florida Expressway Authority ("Pay By
Plate toll rates are double the electronic rate") and MWAA's Dulles Toll Road announcement ($1.60
Pay-by-Plate processing fee, $4.00 vs $5.60 at the Main Plaza); IRS Pub 463 (commuting tolls are
personal, not deductible, same rule as commuting mileage).
⚠ **Tile Council of North America's specific waste-factor percentages (10%/15%/20% by layout) could
not be confirmed from a free primary source** — tcnatile.com/faqs and the TCNA Handbook PDF both
404'd, and the Handbook itself is a $55 paid publication. The tile page cites TCNA generally (its
published ANSI A108/A118/A136.1 standards) and the Ceramic Tile Education Foundation, and keeps the
10% default's wording soft ("a common starting point") rather than attributing an exact percentage to
TCNA. Revisit if a free TCNA source turns up later.
Numbers: an independent Python checker matched **40 of 40** copy figures across all five calculators
after one fix (the concrete worked-example's "6 inches instead of 4... more than double" comparison
had leftover numbers from an unrelated footprint and was also arithmetically wrong — 6" is 1.5× the
4" volume, not more than double; replaced with an 8"-vs-4" comparison, which is exactly double and now
verified: 2.96 yd³ vs 1.48 yd³). The live app's solver/breakdown visuals were cross-checked on
`next dev`: every `aria-label` matches the worked-example figures exactly (toll $1,320.00/$990.00,
concrete 74/98 bags, paint 2.39/3, tile 120/132, wallpaper 8.21/9). `npm test` 268 pass; build (81
static pages) and lint (ignoring `.open-next/**`, `.claude/**`) pass; server killed.
**Resume notes (run 3):** next is electricity-bill (B, plan: tier bar → no tiered-rate visual in the
kit, nearest is probably RangeBar or CompareBars low-tier vs high-tier cost; decide and park the gap),
then furniture-fit (B, plan: top-down floor-plan SVG → no floor-plan component in the kit; nearest is
likely RangeBar on the tightest clearance margin, or CompareBars room vs furniture+clearance footprint;
decide and park the gap). Those two finish Batch 4 (12/12); mark the PR ready and the step DONE after.
Don't commit `tsconfig.tsbuildinfo` / `next-env.d.ts`.

38 · 2026-10-21 · **Batch 4 auto + home v2 — run 3 of 3, DONE (12/12)** (same branch, PR #13 now
ready for review). `compute()` unchanged on both remaining calculators, so **the compute snapshot
did not move** (still 268 tests).
Type B: **electricity-bill** (`monthlyKwh`/`tieredThreshold` gain `dimension: 'energy'`/`unit: 'kWh'`;
new `derive`d `effectiveRatePer100kWh` so the effective-rate row doesn't round away the fixed-charge
effect at $0.17; tiered-pricing inputs moved into an optional disclosure group, default threshold 0 =
flat rate), **furniture-fit** (room/furniture/clearance inputs gain `dimension: 'length'`, ft/in; new
`derive`d `marginLength`/`marginWidth`/`tightestMargin` — `tightestMargin >= 0` is exactly equivalent
to the old `fits` flag, so no boolean output format had to be invented).
**Visual gaps, both parked:** electricity-bill's plan called for a "tier bar", but no kit visual reacts
to a user-editable threshold input (`RangeBar` bands are fixed at config time) — nearest kit used
instead is **CompareBars**, energy charge vs. total bill with fixed charges. Furniture-fit's plan
called for a "top-down floor-plan SVG", not in the kit — nearest kit used instead is **RangeBar** on
the tightest clearance margin (bands: won't fit / tight / comfortable / spacious), which turned out to
be a clean fit since margin ≥ 0 already is the fits/doesn't-fit boundary.
**Facts checked on primary sources 2026-10-21:** EIA Electric Power Monthly Table 5.6.A (residential
avg 18.31 ¢/kWh, Jul 2026; ND 13.41 ¢, HI 48.00 ¢ — same figures run 1 used for auto, re-fetched and
still current), EIA FAQ #97 (avg U.S. residential usage 899 kWh/month, 2022: 10,791 kWh/yr ÷ 12), EIA
Glossary "block-rate structure", ENERGY STAR Low-/No-Cost Tips (LED $40/yr on 5 bulbs; smart thermostat
>8% / ~$50/yr, ~$100/yr if often unoccupied); U.S. Access Board 2010 ADA Standards Ch. 4 (403.5.1, 36
in clear width; 403.5.2, 42 in approaching a 180° turn); ICC IRC R311.6 (36 in minimum hallway width)
and R311.2 (32 in minimum clear width at the required egress door).
⚠ **`codes.iccsafe.org` (ICC's own code viewer) 403'd on both IRC fetches**, same failure mode as
CFPB in run 1. Used `up.codes` instead — a free, widely-used code-text mirror, not a calculator site —
for both IRC citations; noted in the furniture-fit references rather than silently substituting.
Numbers: an independent Python checker (no app imports) matched **26 of 26** copy figures, 0
mismatches. Both pages checked on `npm run dev`: H1, 8 section ids, JSON-LD present, and every visual
`aria-label` matches the worked-example figures exactly (electricity "Energy charge $144.00, Total
bill $156.00"; furniture-fit "Tightest clearance margin: 54 in falls in the Spacious band").
`related`/`aliases` re-checked for self-reference, existence and duplication (0 problems) — furniture-
fit's stray `miles-to-kilometers-converter` related link was swapped for `concrete-calculator` to
match the paint/tile/wallpaper/furniture-fit mutual-linking cluster; electricity-bill's
`travel-budget-calculator`/`inflation-calculator` pair was trimmed to one (`inflation-calculator`) in
favor of `commute-cost-calculator`, also from this batch. `npm test` 268 pass; `npm run build` (81
static pages) and lint (ignoring `.open-next/**`, `.claude/**`) pass; dev server killed.
**Step 38 is DONE.** PR #13 covers all 12 Batch 4 calculators; marked ready for review (was draft).

fix · 2026-10-20 · **Solver widget shows the real currency symbol, not `¤`** (branch `fix/currency-symbol`). `UNITS.currency[0].label` = `currencySymbol()` from `lib/calculator.ts`, so type-A inline values, input adornments and output rows print `$` like the type-B widget and the visuals. Share links use the unit id (`currency`), not the label, so they are unaffected. New `units.spec` test: no unit label contains `¤`.

step 39 · 2026-10-21 · **Batch 5 run 1/4 — time calculators** (branch `step/39-batch-5`, PR #14 draft). Step file `mdFiles/steps/39-batch-5.md` written with the full 18-item checklist grouped by run before any code changed. This run: date-difference-calculator (added `concept` + `references` + a `breakdown` Timeline visual; `compute()`/inputs untouched — it already had howTo/formula/workedExample/watchOut from the step-10 pilot), age-calculator (rebuilt from a trivial `birthYear - currentYear` into real `birthMonth/birthDay/birthYear` + `timeDependent: true`, returning exact years/months/days, total days lived and days to the next birthday, with a next-birthday Timeline — this is a deliberate `compute()`/inputs change, snapshot regenerated with `npm run test:update` and the diff checked to touch only `age-calculator`), sleep-time-calculator (breakdown + a Timeline showing 4/5/6-cycle wake-time options; `compute()` unchanged), work-hours-calculator (breakdown + Donut for regular vs overtime pay — the plan's "stacked bar" wording maps to Donut here, matching the precedent already set by `tdee-calculator` and `cashback-calculator` in earlier batches since the kit has no literal stacked-bar component; `compute()` unchanged), and pomodoro-timer (type C: full v2 content — the page template already renders TOC/concept/howTo/etc. from `calculator.content` regardless of widget type, confirmed by reading `app/[locale]/calculators/[slug]/page.tsx` — plus a restyle onto the shared `WidgetCard` + category accent color, which also fixed a pre-existing dead-Tailwind-class bug, `bg-brand-600`/`hover:bg-brand-700`/`focus:border-brand-500`, none of which exist in the Tailwind config per the "Dead Tailwind brand shades" Parked item). All five calculators' copy figures were re-verified with an independent Python script (no app imports); 0 mismatches after one self-caught arithmetic slip in the script itself (sleep-time wake minute, fixed before trusting the result). References fetched directly: IEEE POSIX (epoch), Royal Museums Greenwich (leap years — the first guessed URL 404'd, found the right one via search), NHLBI (sleep stages), CDC (sleep duration), US DOL (overtime + FLSA), California DIR (daily overtime), Duke University ARC and the official Pomodoro® Technique site. **Not loaded** (tried, moved on per the no-retry-loop rule): US Naval Observatory "Introduction to Calendars" (`ECONNRESET` twice) and NINDS "Brain Basics: Understanding Sleep" (403) — NHLBI substituted for the latter. `npm test` 268/268, `npm run build` (81 static pages) and lint (ignoring `.open-next/**`, `.claude/**`) pass; dev server killed; `related`/`aliases` checked for self-reference, existence and duplication across all 5 (clean — the one alias collision found, `mortgage-calculator`/`emi-calculator` on "house loan emi calculator", predates this batch).
step 39 · 2026-10-21 · **Batch 5 run 2/4 — travel + freelancer-rate** (branch `step/39-batch-5`, PR #14 draft, two commits). travel-budget-calculator (breakdown + Donut by category: flights/accommodation/food/activities/misc/insurance, 6 segments at the kit's limit; `compute()` unchanged), visa-stay-days-calculator (breakdown + a percent-based RangeBar for the plan's "180-day window bar" — `BreakdownVisual` bands must be static numbers, not derived from inputs, and `allowedDays` is user-adjustable, so the bar plots 0-100%/100-200% of the allowance instead of literal day-count bands, generalizing to any visa; `compute()` unchanged, `projectedUsagePercent` added via `breakdown.derive` only; cites the official EU short-stay calculator and CBP's I-94 compliance page, with an explicit "not legal advice, confirm with the authority" note in `watchOut` and `formula.note` per the coordinator's instruction), currency-converter (type C: full v2 content, restyled onto the shared `WidgetCard`/`ResultPanel`/`Headline`/`AlsoIn`, which also fixed real dead-Tailwind-class bugs — `brand-200/300/400/800/950` don't exist in `tailwind.config.ts`, so the old result card and several hover/focus states rendered with no color, worst in dark mode; added a persistent "Static reference rates — not live" banner with an explicit as-of date via a `RATES_AS_OF` constant, repeated in a `watchOut` item, the footer caption and an FAQ — never described as live anywhere, per the coordinator's instruction; cites the Fed's H.10 release and the ECB's euro reference rates as where to find real rates), timezone-meeting-planner (type C: full v2 content, restyled onto `WidgetCard`; fixed a dark-mode dead-class bug on the selected-zone chip the same way; cites the IANA Time Zone Database and NIST's Daylight Saving Time Rules page per the coordinator's instruction), and freelancer-rate-calculator (type A: added a `solver` — hourly rate ↔ target net income ↔ billable hours, with weeks/tax rate/expenses/benefits fixed — alongside the UNCHANGED `inputs`/`compute()`, verified via `git diff`; every variable has a closed-form solve; Donut splits gross revenue into net income/taxes/expenses/benefits, matching the plan's "Donut income/tax/expenses" with benefits broken out as a 4th slice; cites IRS self-employment tax and HealthCare.gov self-employed coverage). All five independently number-checked with a throwaway Python script (no app imports); 0 mismatches, confirmed again by spot-checking the rendered pages' aria-labels and solver output against the script. `npm test` 271/271 (no snapshot changes this run — every `compute()`/`inputs` pair was left untouched, freelancer-rate's solver is purely additive), `npm run build` (81 static pages) and lint pass; dev server killed; `related`/`aliases` re-checked (clean, same pre-existing collision as run 1). travel.ts's four calculators and the two component restyles are one combined commit (same file-sharing constraint as run 1's time.ts); freelancer-rate-calculator (a separate file, work.ts) is its own commit.
step 39 · 2026-10-21 · **Batch 5 run 3/4 — work + creator calculators** (branch `step/39-batch-5`, PR #14 draft, two commits, one per shared data file since `git add -p` isn't available non-interactively). salary-raise-calculator (type A: added a `solver` — current salary fixed, raise % ↔ new salary, with tax rate and pay periods fixed — alongside the UNCHANGED `inputs`/`compute()`, verified via `git diff`; `raiseAmount` is a solver `outputs` entry rather than a third rotating variable, since it and raisePercent both describe the same one degree of freedom for a fixed current salary and only one field auto-updates at a time; CompareBars shows current vs. new salary per the plan's "Before/after bars"; estimate-only/not-tax-advice note added per the coordinator's instruction; also swapped an unsourced "merit raises 3-5%" FAQ claim for a sourced CPI/COLA answer), meeting-cost-calculator (type B: breakdown + CompareBars comparing the one-off cost to the annual-if-weekly cost, since the plan's "cost ticker" would need a live JS timer not in the static kit; `compute()` unchanged; found and fixed a pre-existing wrong FAQ figure — the old copy claimed a 10-person/$90k weekly meeting "costs over $22,000/year" but the calculator's own formula gives $29,250 for that scenario — and dropped an unsourced "31 hours/month in unproductive meetings" claim), pto-calculator (type B: breakdown + CompareBars, used vs. remaining, matching the plan exactly; `compute()` unchanged), youtube-earnings-calculator (type A: added a `solver` — monthly earnings ↔ monthly views ↔ RPM, CTR fixed — alongside the UNCHANGED `inputs`/`compute()`; CompareBars shows monthly vs. projected annual earnings per the plan; per the coordinator's instruction, removed the old FAQ's unsourced RPM-by-niche claims and replaced them with YouTube's own documented eligibility requirements and the 55%/45% ad-revenue split, with content repeatedly stating RPM is a user-supplied what-if, never a looked-up fact), and instagram-engagement-calculator (type B: breakdown + a Donut of the user's own engagement composition — not the plan's literal "RangeBar of typical rates," since RangeBar bands must be static per the schema (the same constraint hit on visa-stay-days in run 2) and, more importantly, Instagram publishes no official engagement-rate benchmarks, so plotting invented thresholds would itself be exactly the unsourced-average problem the coordinator said to avoid; `compute()` unchanged, but `estimatedPostValue`/`cpm` are now explicitly labeled as this page's own illustrative formula, not a market rate, and several unsourced claims — "$100 per 10,000 followers," "$5-25 CPM," "nano 4-8%, mega <1.5%" — were removed in favor of official Instagram/Meta docs, including a sourced nuance that Meta's developer API defines "engagement" more narrowly than Instagram's own creator guidance). All five independently number-checked with a throwaway Python script (no app imports); 0 mismatches, cross-checked against the rendered pages' solver/breakdown output. `npm test` 277/277 (no snapshot changes — every `compute()`/`inputs` pair left untouched), `npm run build` (81 static pages) and lint pass; dev server killed; `related`/`aliases` re-checked (clean, same pre-existing collision as runs 1-2).
step 39 · 2026-10-21 · **Batch 5 run 4/4 + close-out — text + education calculators, step DONE**
(branch `step/39-batch-5`, PR #14, taken out of draft). This session picked up a stalled run 4 —
the two commits (character-counter/hashtag-counter, gpa-calculator) were already pushed by the
previous agent but unverified — and verified rather than rebuilt them. character-counter and
hashtag-counter (type C, shared `TextToolsCalculator.tsx`): every platform character limit was
re-confirmed by fetching the cited official doc directly (not re-trusting the commit message) —
X's 280-char post limit + 23-char t.co URL wrapping (`docs.x.com/fundamentals/counting-characters`),
Meta's Instagram caption `"Maximum 2200 characters, 30 hashtags, and 20 @ tags"` (also the source
for hashtag-counter's 30-hashtag limit), LinkedIn's 3,000 (LinkedIn Help), YouTube's 100-char title
/ 5,000-char description (YouTube Help), and Twilio's SMS doc confirming 160 chars under GSM-7 vs.
70 under UCS-2 (triggered by one emoji or non-Latin character) citing the underlying 3GPP/ETSI
standard. Two limits the previous agent had already removed as unconfirmable were double-checked
as correctly removed: Facebook's commonly-quoted 63,206 (no current official Meta source found) and
a fixed meta-description length (Google Search Central states explicitly there is no character
limit, truncation is pixel-width-based). gpa-calculator (C → B): the 4.0-scale sourcing was
reconfirmed — College Board's BigFuture page says the standard scale is "just one commonly used
system" and "always check with your school for the most accurate GPA conversion"; UNC's registrar
page lists A-=3.7 and University of Cincinnati's lists A-=3.6667 on otherwise-similar 4.0 scales,
concrete sourced evidence that scales vary, not an assertion. All 9 references across the 3
calculators fetched successfully; nothing failed to load, nothing needed to be removed beyond what
run 4's own commits had already dropped. Every copy figure re-verified with an independent Python
script (no app imports, run via a local `python.exe` since bare `python`/`python3` aren't on PATH
here): character-counter's 137-char/22-word/3-sentence/2-paragraph/7-second-reading-time worked
example and all 7 platform-limit pass/fail checks; hashtag-counter's 5-match/4-unique worked
example; gpa-calculator's 6-course example (62.4 total grade points, 19 total credits, 3.2842 GPA,
A=9/B=7/C=3 credit-hour bands summing to 19) — 0 mismatches, and the GPA page's rendered donut
aria-label (`"19 total credits: A range ... 9 (47%), B range ... 7 (37%), C range ... 3 (16%) ..."`)
matches the script exactly. `npm test` 277/277, `npm run build` (81 static pages), and
`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` all pass. Dev
server spot-checked all 3 pages (H1, `concept`/`how-to-use`/`formula`/`worked-example`/`watch-out`/
`references`/`faq`/`related` section ids, 2 JSON-LD blocks, correct widget mount) then was killed;
port 3000 confirmed free. `next-env.d.ts` reverted (build regenerates it with a dev-mode path,
`tsconfig.tsbuildinfo` was already gitignored/untouched) before any commit. **All 18 of batch 5 are
now done** — PR #14 body rewritten with the full 18-calculator summary, a snapshot-diff explanation
(age-calculator run 1 + gpa-calculator this run, both documented inline), and taken off draft via
`gh pr ready 14`. Step 39 marked DONE; step 40 (Wave 1: math · statistics · conversion) is next.

**Lessons for step 40 / the add-calculator skill:**
- A verification-only session (resuming someone else's pushed-but-unchecked commits) is a real and
  useful mode: re-run the independent script, re-fetch every cited reference, spot-check the
  rendered page — don't just re-trust a previous commit message's claims, but also don't redo work
  that already matches once it's independently confirmed.
- Fetching references one at a time in parallel (one `WebFetch` call per reference, batched in one
  turn) is fast and catches drift between what a commit message claims a source says and what the
  source actually says — worth doing routinely for every `references` entry added in a step, not
  just spot-checking a few.
- On this Windows/Git-Bash environment, bare `python`/`python3` resolve to the Microsoft Store stub
  and fail; the real interpreter is at a path like
  `/c/Users/<user>/AppData/Local/Programs/Python/Python31x/python` — worth noting once so future
  verification scripts don't waste a round-trip rediscovering it.
- Wave 1 (step 40) builds **new** calculators (math/statistics/conversion topics not yet on the
  site), not v2 conversions of existing ones — the "C → B" / "type A/B/C" classification work from
  batches 1-5 doesn't apply the same way; the step-40 step file should state the wave's calculator
  list up front (per `mdFiles/calculator-rollout-plan.md` §4) before any code, same as batch 5's
  step file did.

**2026-10-21 — step 40, Wave 1: math, run 1/~6 (5 new calculators).** Branch
`step/40-wave-1-math-run-1` from `origin/master`. Added the `math` category (`data/calculators/index.ts`
categories array + `calculatorOrder`, new `data/calculators/math.ts`, `lib/categoryTheme.ts` —
orange / `function` icon, since every other `IconTile` color is already assigned to another
category and no "percent/calculator" glyph exists in the kit) and 5 brand-new calculators per
`mdFiles/calculator-rollout-plan.md` §4 and the step file (`mdFiles/steps/40-wave-1-math.md`),
written just-in-time before this run:

- **percentage-calculator** (type B): a `mode` options menu (X% of Y / X is what % of Y / percent
  change / increase-decrease by X%) over two generic numbers, since the four formulas are not one
  invertible equation a solver could auto-fill. `compute()` always returns one `result` key
  computed from whichever mode is selected, so the breakdown config never needs to change shape at
  runtime. CompareBars visual (the two raw inputs, mode-agnostic).
- **percent-change-calculator** (type A, solver): `%Δ = ((B−A)÷A)×100` rearranges cleanly for all
  three variables, same shape as `inflation-calculator`'s rate solve. CompareBars visual (old vs
  new), reusing that calculator's "then vs now" pattern.
- **percent-difference-calculator** (type B): `|A−B| ÷ ((A+B)÷2) × 100` is symmetric and not
  uniquely invertible (solving for A given B and the percent needs to know which one is larger —
  two possible answers), so no solver. CompareBars visual (value A vs value B).
- **fraction-calculator** (type B): operator menu (add/subtract/multiply/divide) over two
  fractions. The `BreakdownFormat` enum has no "a/b" fraction type, so the simplified fraction,
  mixed number and decimal are each broken into their own numeric row instead of rendered as
  "1/2" text live — the worked example and FAQ use standard "a/b" notation in prose. CompareBars
  visual (the two input fractions as decimals).
- **ratio-calculator** (type A, solver): A:B = C:D cross-multiplies to a closed form for any one
  of the four terms, same shape as force-calculator's three-variable solve. Donut visual (A and B
  as parts of their total). Also covers "proportion calculator" search intent via alias, since the
  solver *is* a proportion solver.

**Dedup decision:** the plan's math list also names "mixed number" and "proportion" as separate
calculators. Both were absorbed into run 1's pages instead of getting their own — fraction-calculator
already converts every result to a mixed number (one of its breakdown rows), and ratio-calculator's
A:B = C:D solver already is a proportion solver. This mirrors the template's "one equation, all
directions" rule for force-calculator; a standalone "mixed number calculator" or "proportion
calculator" page would be near-duplicate content. Captured instead as aliases on fraction-calculator
and ratio-calculator respectively. This drops the math category's total from the plan's ~31 named
topics to ~29 pages across all runs — noted here, not hidden.

Also fixed the pre-existing gap the plan called out: the homepage copy (`messages/en.json` `homeSeo.p5`)
has claimed "The percentage calculator handles tip splits, discounts, tax rates, and markups" since
before step 16, with no page behind it. `app/[locale]/layout.tsx`'s `keywords` array had an explicit
comment since step 16 saying step 24 would "add back" `'percentage calculator'` once a real page
existed — done now; `'scientific calculator'` and `'final grade calculator'` are still owed (the
comment is updated to say so).

Verification: 5 calculators committed one at a time (`git add` + `git commit`, each paired with
`npm run test:update` + `npm test` immediately after, so every commit's snapshot and
`KNOWN_NON_FINITE` state is self-consistent) — true per-calculator granularity was possible here
because `math.ts` is a brand-new file, unlike the shared-file batches in steps 37-39. Every number
in the copy (worked examples, FAQ figures, `example` lines) was recomputed by an independent
Python script in the scratchpad (no app imports; run via the Python 3.12 interpreter path noted
above) — this caught one real error before shipping: a watch-out item claimed "two values of 1 and
2 differ by 100%," but the actual percent *difference* for 1 and 2 is 66.67% (100% would be the
answer for 1 and 3 instead); fixed to use 1 and 3. `npm test` 288/288 (up from 278 after run 1's
first commit), snapshot diff is pure additions (0 changes to any existing entry, confirmed with
`git diff --stat`). `npm run build` passes, 87 static pages (was 81: +5 calculator pages, +1
category page). `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`
passes. `KNOWN_NON_FINITE` entries added for the 3 calculators whose edge case (every input at its
`min`, 0 where unset) hits a legitimate divide-by-zero: `percent-change-calculator`
(`percentChange`), `percent-difference-calculator` (`percentDifference`), `ratio-calculator` (`d`).
`percentage-calculator` and `fraction-calculator` needed no whitelist — their `mode`/`operator`
menus were given an explicit `min` landing on a divide-safe branch, so even the edge case resolves
to a finite number. Alias/related/id collision check run programmatically across all 59 calculators:
no new collisions (the one pre-existing alias collision, "house loan emi calculator" on
mortgage-calculator/emi-calculator, predates this run). All 5 pages + `/categories/math` + the
sitemap spot-checked on a local dev server (H1, every v2 section id, 2 JSON-LD blocks, widget
mount, the rendered example line, and the orange category accent color — confirmed the `#28A745`
seen in each page's HTML is the universal green "how-to-use" step-number styling, not the category
accent, which is correctly `#FF8A00` for math), then the server was killed and port 3000 confirmed
free. References fetched directly, all loaded successfully, nothing failed: OpenStax Prealgebra 2e
§6.1/§6.2/§4.1/§4.2/§4.5/§6.5, Wolfram MathWorld (Percent/Fraction/Ratio), and a North Carolina
State University / Advanced Instructional Systems physics lab manual for percent error vs. percent
difference. PR #15 opened as draft early (before the first calculator was built), updated with the
full run-1 summary, and taken off draft via `gh pr ready 15` once everything above passed.

**Lessons for run 2 and beyond:** per-calculator commits are straightforward when the whole file is
new (as here) — write the full category file once, then reconstruct each commit's prefix
programmatically (a small script slicing the array by calculator boundaries) rather than retyping,
running `npm run test:update` + `npm test` after each slice. For a wave that touches only new
files, there is no need to fall back to the "bundle into one commit" exception batches 1-5 needed.

**2026-10-21 — step 40, Wave 1: math, run 2/~6 (5 new calculators).** Branch
`step/40-wave-1-math-run-2` from `origin/master`, PR #16 opened as draft before the first
calculator was built. Added 5 calculators to the existing `math` category
(`data/calculators/math.ts`) and appended each id to `calculatorOrder`
(`data/calculators/index.ts`):

- **average-calculator** (type B): a plain list of numbers has no single invertible equation, and
  the kit has no list/array input (every `CalculatorInput` is one number) — see the kit-gap entry in
  Parked. Uses 4 always-counted value slots plus 4 optional ones behind a disclosure, matching
  `gpa-calculator`'s fixed-slot pattern but with its own convention: since a plain average has no
  weight to zero out the way GPA's credits do, the 4 optional slots are excluded by their array
  index when left at the default of 0 (documented as a watch-out, not hidden). Mean, sum, count, min
  and max are always finite — no `KNOWN_NON_FINITE` entry needed. CompareBars visual shows the
  derived min/average/max rather than the raw slots, which stays meaningful regardless of how many
  optional slots are filled in and sidesteps `CompareBars`'s hard 4-bar cap
  (`components/visuals/CompareBars.tsx` slices to `bars.slice(0, 4)`, found while designing this
  calculator — noted in Parked).
- **weighted-average-calculator** (type B): generalizes `gpa-calculator`'s actual mechanism (value ×
  weight, summed, divided by total weight) from grades/credits to any value/weight pairs — 3
  always-counted pairs plus 3 optional ones, where a weight of 0 is a mathematically correct
  exclusion (unlike average-calculator's workaround). All-weights-zero is a genuine 0÷0;
  `KNOWN_NON_FINITE` registered (`weightedAverage`). Cross-linked with `gpa-calculator` rather than
  duplicating it: GPA is named explicitly in the concept/watch-out copy and in `related` as the
  grades-and-credits special case of this calculator; `gpa-calculator` itself was not edited, since
  this step builds only the calculators it was asked for. Donut visual shows each component's weight
  as a share of the total weight.
- **rounding-calculator** (type B): one value field, a signed `decimalPlaces` field (negative values
  round to tens/hundreds/thousands, the spreadsheet-ROUND sign convention), a direction menu
  (nearest/up/down) and a tie-breaking rule (half away from zero / half to even) used only by
  "nearest." Rounds by shifting the decimal point through exponential-notation text
  (`` `${value}e` `` split/rebuilt at a shifted exponent) rather than multiplying, which exploits
  JS's shortest-round-trip number-to-string conversion to sidestep the classic IEEE 754 binary64
  representation error — verified against the textbook 1.005 case (correctly rounds to 1.01, not the
  naive 1.00) in the Python script. No `KNOWN_NON_FINITE` needed (`direction`/`tieRule` have
  `min: 1`, landing on safe branches at the edge case).
- **scientific-notation-calculator** (type B): a `mode` menu over four related but distinct
  operations (convert a number to scientific notation, convert it back, multiply two
  scientific-notation numbers, divide two). No "a × 10ᵇ" breakdown format exists (the same gap
  `fraction-calculator` hit with "a/b" in run 1), so the coefficient and exponent are separate
  numeric rows; prose shows the real notation. LogScale visual plots the result's decimal value
  against two NIST-sourced benchmarks (a nanometer, the Avogadro constant) — thematically apt, since
  the calculator's whole subject is expressing very large or very small numbers.
- **exponent-calculator** (type A, solver): `result = base^exponent` solves for all three variables
  — an nth root for `base`, a logarithm for `exponent` — with `NaN` for the genuine real-domain
  restrictions (no real nth root of a negative number except an odd integer exponent; no real log of
  a non-positive number or of a base ≤ 0 or = 1), flagged in `watchOut` rather than hidden. The
  forward direction needs no special-casing: JavaScript's `**` operator already matches the chosen
  conventions (0⁰ = 1, negative base with a non-integer exponent = `NaN`). LogScale visual against
  computing/math magnitude benchmarks (2¹⁰ = 1,024, 10⁶, 10⁹).

Verification: 5 calculators committed one at a time, each paired with `npm run test:update` +
`npm test` immediately after. Every number in the copy (worked examples, FAQ figures, `example`
lines, LogScale benchmarks) was recomputed by an independent Python script in the scratchpad
(`verify_run2.py`, no app imports, run via the Python 3.12 interpreter path) before shipping —
0 mismatches, including the float-precision case and every domain-restricted solver branch on
exponent-calculator (checked against a hand-ported copy of the same branching logic run in Node,
which matched the Python results exactly). `npm test` 296/296 (up from 290 after run 1), snapshot
diff is pure additions. `npm run build` passes, 92 static pages (was 87: +5 calculator pages).
`npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"` passes.
`KNOWN_NON_FINITE` entry added only for `weighted-average-calculator` (`weightedAverage`, all
weights 0); the other 4 new calculators resolve to finite outputs at every one of the spec's three
input sets (default, typical, edge) without needing a NaN allowance, confirmed by `npm test` passing
on the first `test:update` run for each with no failures. Alias/related/id collision check run
programmatically across all 64 calculators: no new collisions (the one pre-existing "house loan emi
calculator" alias collision on mortgage-calculator/emi-calculator predates this run); no broken
`related` ids, no self-references. All 5 pages, `/categories/math` and `sitemap.xml` spot-checked on
a local dev server (H1, all 8 content section ids, 2 JSON-LD blocks, the correct widget mounted per
type), then the server was killed and port 3000 confirmed free. References fetched directly:
OpenStax (Introductory Statistics 2e §2.5, Prealgebra 2e §10.5), Wolfram MathWorld (Arithmetic Mean,
Weighted Mean, Exponent Laws), NIST (CODATA speed of light and Avogadro constant, SI prefixes, binary
prefixes), and D. Goldberg's "What Every Computer Scientist Should Know About Floating-Point
Arithmetic" (hosted by Oracle) — all loaded successfully except
`ieeexplore.ieee.org/document/8766229` (the IEEE 754-2019 standard's own landing page), which
returned no readable content; the Goldberg paper is cited instead for the rounding/float material,
and "IEEE 754" is still named in prose as the standard term, following the precedent set by the
`codes.iccsafe.org` 403 in step 38. PR #16 opened as a draft before the first calculator was built,
updated with the full run-2 summary, and taken off draft via `gh pr ready 16` once everything above
passed.

**2026-10-22 — step 40, Wave 1: math, run 3/~6 (5 new calculators).** Branch
`step/40-wave-1-math-run-3` from `origin/master`, PR #17 opened as draft before the first
calculator was built. Added 5 calculators to the existing `math` category
(`data/calculators/math.ts`) and appended each id to `calculatorOrder`
(`data/calculators/index.ts`):

- **square-root-calculator** (type A, solver): a 2-variable radicand/square-root pair (`r = √x`,
  `x = r²`), simpler than the other solvers since a square root only involves two quantities.
  Negative radicands return no real answer (`NaN`), explained alongside a brief complex-number
  aside. Cross-linked with `exponent-calculator` (a square root is the exponent-1/2 case) and the
  new `cube-root-calculator`, rather than re-teaching fractional exponents. CompareBars visual
  (the number vs its square root).
- **cube-root-calculator** (type A, solver): same 2-variable shape, but `Math.cbrt` has no domain
  restriction at all — every real number, including negatives, has a real cube root, the headline
  differentiator from the square root page. Deliberately uses `Math.cbrt(x)`, not `x ** (1/3)`,
  since JavaScript's `**` returns `NaN` for a negative base with a fractional exponent even though
  the real root exists (verified: `(-8) ** (1/3)` → `NaN`, `Math.cbrt(-8)` → `-2`). CompareBars
  visual (the number vs its cube root).
- **logarithm-calculator** (type A, solver): `log_b(x) = y ⇔ b^y = x` rearranged for all three
  variables, the same inverse relationship as `exponent-calculator` but entered from the
  "base + argument → exponent" direction most log searches want, with its own content (common/
  natural log naming, change-of-base, pH/decibel/earthquake-magnitude real-world uses) rather than
  repeating the exponent page. `solver.outputs` shows the natural and common log of the same
  argument underneath the main result. `KNOWN_NON_FINITE` registered (`result`, `naturalLog`,
  `commonLog`): the edge test's `base = 0, argument = 0` is outside the log domain on every count.
  LogScale visual (the argument on a magnitude scale, with a pH-neutral-water and an
  Avogadro-constant benchmark).
- **factorial-calculator** (type B): not invertible, so no solver. Computes the exact product with
  `BigInt`, so the digit count (`big.toString().length`) and trailing-zero count (Legendre's
  formula) stay exact at any size, while the headline value converts to a `Number` for display —
  the kit's existing `format: 'significant'` already switches to scientific notation past 1e9
  (around 13!), which by itself avoids showing rounded digits as if they were exact. Capped at
  n = 1,000 for instant results; 171! and above overflow a double to `Infinity` (170! is the last
  finite one), documented as expected overflow, not a bug. LogScale visual (`10! = 3,628,800` and
  `52! ≈ 8.0658 × 10⁶⁷`, the number of ways to shuffle a deck — a direct consequence of the
  permutation rule, not a separately-sourced statistic).
- **gcf-calculator** (type B): a "How many numbers?" 2-4 `options` menu, not a 0-means-unused
  sentinel on the optional slots — the exact lesson the run-2 `average-calculator` fix established,
  applied here from the start. `compute()` reuses the `gcd()` helper already shared by
  `fraction-calculator`/`ratio-calculator`, so all three pages agree on the same
  `GCF(0, 0) = 1` convention. `GCF(0, n) = n` and `GCF(-12, 18) = 6` fall out of the existing
  `gcd()` behavior with no extra code; both documented in `watchOut`. CompareBars visual (smallest
  number / largest number / GCF — derived summary values, correct regardless of how many of the 4
  slots are in use, the same `CompareBars`-cap workaround `average-calculator` used).

Verification: every number in the copy (worked examples, FAQ figures, `example` lines, LogScale
benchmarks) was recomputed twice — an independent Python script in the scratchpad (no app imports)
and a standalone Node one-liner for JS-specific behaviors Python doesn't share (`(-8) ** (1/3)` vs
`Math.cbrt`, `BigInt` digit counts, `Number(BigInt)` overflow at 171!) — 0 mismatches against the
app's own `compute()`/solver output. `npm test` 310/310 (up from 296), `npm run build` (97 static
pages, up from 92), `npm run lint -- --ignore-pattern ".open-next/**" --ignore-pattern
".claude/**"` all pass. Alias/related/id collision check run programmatically across all 69
calculators: no new collisions (the pre-existing "house loan emi calculator" alias collision
predates this run); no broken `related` ids, no self-references. All 5 pages, `/categories/math`
and `sitemap.xml` spot-checked on a local dev server (H1, every v2 section id, 2 JSON-LD blocks,
`solver-*` fields for the 3 type-A calculators, `breakdown-*` for factorial and GCF, and the
rendered `example` line matched word-for-word), then the server was killed and port 3000 confirmed
free. References fetched directly: OpenStax (Prealgebra 2e §5.7 square roots, §10.6 GCF via its
plain-number GCF(24,36)=12 example; Elementary Algebra 2e §9.7 real cube roots of negatives;
College Algebra 2e §6.3 logarithms), NIST DLMF (§4.2 Logarithm/Exponential/Powers, §5.2 Gamma
Function), and Wolfram MathWorld (Square Root, Cube Root, Logarithm, Factorial, Greatest Common
Divisor) — all loaded successfully, 0 reference failures (two initial OpenStax section-number
guesses 404'd before the correct URLs were found via search and cited instead). PR #17 opened as a
draft before the first calculator was built, updated with the full run-3 summary, and taken off
draft via `gh pr ready 17` once everything above passed.

**2026-10-22 — fix on PR #17: gcf-calculator mishandled GCF(0, 0).** A pre-merge review caught that
`gcf-calculator`'s `compute()` reused the `gcd()` helper shared by `fraction-calculator` and
`ratio-calculator`, whose `return a || 1` fallback (needed so fraction/ratio simplification never
divides by zero) is wrong for an actual GCF: `GCF(0, 0, 12)` computed as `gcd(gcd(0,0),12)` =
`gcd(1,12)` = `1` instead of the correct `12`, and `GCF(0, 0)` reported `1` instead of the standard
number-theory convention of `0`. Fixed by adding `gcdRaw()` (no fallback) for `gcf-calculator`
only — `gcd()` and the other two calculators' behavior are untouched, confirmed byte-identical.
Rewrote the GCF(0,0) watch-out item, added an FAQ entry, and added a third reference (Clark,
*Elementary Number Theory*, Mathematics LibreTexts §6: "We define gcd(0,0) = 0") since neither
OpenStax nor MathWorld state the zero case. Verified `GCF(0,0,12)=12`, `GCF(0,18)=18`,
`GCF(0,0)=0`, `GCF(0,18,24)=6` (a zero among others doesn't change the result — only all-zero
does), negatives and non-integer rounding, independently in Python and Node against the app's own
`compute()`. Only `gcf-calculator`'s own edge snapshot entry changed (`gcf: 1 → 0`); `npm test`
310/310, `npm run build` and lint pass. See `mdFiles/steps/40-wave-1-math.md`'s "Fix, 2026-10-22"
section for the full writeup.

**2026-10-22 — step 40, Wave 1: math, run 4/~6 (5 new calculators).** Branch
`step/40-wave-1-math-run-4` from `origin/master`, PR #18 opened as draft before the first
calculator was built. Added 5 calculators to the existing `math` category
(`data/calculators/math.ts`) and appended each id to `calculatorOrder` (`data/calculators/index.ts`):

- **lcm-calculator** (type B): same "How many numbers?" 2-4 pattern as `gcf-calculator`, with a new
  `lcmPair` helper (`LCM(a,b) = |a×b| ÷ gcd(a,b)`, reusing `gcdRaw`). `LCM(n,0)=0` for nonzero n by
  a widely used convention, but `LCM(0,0)` is left undefined (`NaN`) rather than 0 — a real bug
  caught and fixed mid-run when fetching references showed GCF(0,0)=0 and LCM(0,0)="undefined" are
  different conventions, not the same one; see the "Fix" note in the step file. `KNOWN_NON_FINITE`
  registered. CompareBars visual (smallest/largest number/LCM).
- **prime-factorization-calculator** (type B): trial division, capped at 10¹² for instant results.
  The kit has no list input and `compute()` must return plain numbers, so the factorization uses 6
  fixed prime/exponent slot pairs — but never silently truncates: `distinctPrimeFactors` and an
  `extraDistinctPrimeFactors` counter are always the true, complete figures regardless of how many
  of the 6 slots are shown (0 has no factorization, 1 has the legitimate empty one). CompareBars
  visual (your number / smallest prime factor / largest prime factor).
- **long-division-calculator** (type B): quotient and remainder, not invertible, so no solver.
  Picks and documents a specific remainder sign convention — `0 ≤ remainder < |divisor|` regardless
  of either operand's sign (Euclidean division), not the "truncate toward zero" convention several
  languages default to — verified directly against the deployed JS `%` operator's own sign
  behavior, not just assumed. `KNOWN_NON_FINITE` registered for divisor 0. CompareBars visual
  (dividend vs divisor).
- **quadratic-formula-calculator** (type B): `ax²+bx+c=0` has two simultaneous roots from one input
  triple, so not a solver (same non-invertibility reasoning as `percent-difference-calculator`).
  Handles `a=0` (linear), discriminant `>0`/`=0`/`<0` (two real roots / one repeated root / a real
  + imaginary pair, never a bare `NaN`), and floating-point near-zero discriminants via a
  magnitude-relative tolerance. Default coefficients were chosen to survive the automated
  "typical" input set's ×1.5-and-round scaling without flipping the discriminant's sign.
  `KNOWN_NON_FINITE` registered for the `a=b=c=0` degenerate case. CompareBars visual (Root 1 vs
  Root 2).
- **pythagorean-theorem-calculator** (type A, solver): `a²+b²=c²`, a clean 3-variable invertible
  relationship. Solving for a leg returns `NaN` when the hypotenuse does not strictly exceed the
  other leg (an impossible triangle), per the plan's explicit requirement. `solver.outputs` adds
  the triangle's area as a bonus figure. No `KNOWN_NON_FINITE` entry needed (the forward-only
  automated edge case, legs at 0, is finite). CompareBars visual (leg a / leg b / hypotenuse).

Verification: every number in the copy was recomputed independently in `verify_run4.py`
(scratchpad, no app imports) — 0 mismatches after fixing one transcription error in the script
itself (not the app) — and cross-checked directly against the app's own `compute()` via a Node
one-liner for every default, a complex-root case, a repeated-root case, the linear and degenerate
quadratic cases, the prime-factorization `n=0`/`n=1`/over-cap/negative cases, and both
divide-by-zero cases. `npm test` 318/318 (up from 310), `npm run build` (102 static pages, up from
97), lint clean. All 5 pages, `/categories/math` and `sitemap.xml` spot-checked on a local dev
server (H1, every v2 section id, 2 JSON-LD blocks, the correct widget mounted, `example` lines
matched word-for-word, plus a `?a=1&b=2&c=5` share-link confirming the complex-root rows render
instead of a bare NaN), then the server was killed and port 3000 confirmed free. Alias/related/id
collision check across all 74 calculators: no new collisions. References fetched directly, with 6
of 13 needing a wrong initial section-number guess corrected via search before citing (OpenStax
chapter/section numbers for LCM/prime factorization, long division, the quadratic formula and the
Pythagorean theorem; a Clark LibreTexts section number) — 0 failures in the final list; one new
source (Mount Royal University's *Abstract Algebra I*, Mathematics LibreTexts §1.2) was added
specifically because neither MathWorld nor the Clark text state the LCM-with-zero convention. PR
#18 opened as a draft before the first calculator was built, updated with the full run-4 summary,
and taken off draft via `gh pr ready 18` once everything above passed. See
`mdFiles/steps/40-wave-1-math.md`'s "Type decisions (run 4)" and "Fix, 2026-10-22: lcm-calculator"
sections for the full writeup. Next session picks up run 5: triangle, circle, area, volume,
surface area.

**2026-10-22 — fix on PR #18: lcm-calculator silently showed a wrong digit above
Number.MAX_SAFE_INTEGER.** A coordinator review after the PR was marked ready caught that
`lcm-calculator`'s `lcmPair` did `(a * b) / gcdRaw(a, b)` with no overflow check. Chained over 4
pairwise-coprime numbers (`LCM(9973, 9967, 9949, 9941)`, all four prime), the true result
(9,831,047,217,181,019) exceeds `2^53 − 1`, and the app showed 9,831,047,217,181,020 instead — a
wrong digit, not a `NaN`. Fixed by dividing before multiplying and refusing (`NaN`) whenever an
input or the result itself isn't `Number.isSafeInteger`. Audited `gcf-calculator` (inputs can be
already-imprecise even though GCF itself never grows past the smallest input) and
`long-division-calculator` (dividend/divisor checked before dividing; quotient can't exceed the
dividend's magnitude) for the same class of bug and added the same guard to both.
`prime-factorization-calculator`'s existing 1e12 cap was confirmed already well inside the safe
range, no change needed (the kit's `CalculatorInput` type has no `max` field to additionally
enforce this at the input level). None of the three fixes changed the automated snapshot (the
default/typical/edge sets stay well within the safe range); added a watch-out + FAQ entry to each
affected calculator and a new overflow-audit section to `verify_run4.py` using Python's exact
bignums to confirm both the true value and the guard's threshold. `npm test` 318/318 (unchanged),
`npm run build` and lint pass. See `mdFiles/steps/40-wave-1-math.md`'s final "Fix, 2026-10-22"
section for the full writeup.

**2026-10-22 — step 40, Wave 1: math, run 5/~6 (5 new calculators).** Branch
`step/40-wave-1-math-run-5` from `origin/master`, PR #19 opened as draft before the first
calculator was built. Added 5 calculators to the existing `math` category
(`data/calculators/math.ts`) and appended each id to `calculatorOrder` (`data/calculators/index.ts`):

- **triangle-calculator** (type B): a `mode` menu for SSS / SAS / ASA sharing one 6-field input set
  (three sides, three angles), since the three cases are distinct closed-form procedures, not one
  invertible equation. All three converge on the same final step — get all three sides, then
  recompute all three angles with the law of cosines and the area with Heron's formula, so the
  three paths stay internally consistent. The ambiguous SSA case (two sides and a non-included
  angle, which can match 0, 1 or 2 triangles) is explicitly not supported — flagged in `watchOut`,
  not guessed at. Invalid input (triangle inequality failure, a non-positive side, an angle outside
  (0°, 180°), or two ASA angles summing to ≥ 180°) returns `NaN` on every output. `KNOWN_NON_FINITE`
  registered (the automated edge case is SSS with all three sides at 0). CompareBars visual (side a
  / side b / side c).
- **circle-calculator** (type A, solver): radius ⟷ diameter, a trivial 2-variable invertible pair,
  with circumference and area as `solver.outputs` rather than solver variables — a circle has only
  one degree of freedom, so a 4-variable solver (radius/diameter/circumference/area) would need the
  widget's "N−1 known fields" model to somehow treat 3 user-typed numbers as simultaneously
  consistent, which they usually would not be. Manual back-solve formulas (from a known
  circumference or area) are given in the formula section and FAQ instead of wired into the live
  widget — a documented scope limit, not a fake solve. CompareBars visual (radius vs diameter).
- **area-calculator** (type B): a `mode` shape menu (square, rectangle, triangle, circle,
  trapezoid) over a shared `dim1`/`dim2`/`dim3` length-input pool, each shape reading a different,
  non-interchangeable formula. Deliberately does not also report perimeter, since the triangle mode
  only takes a base and a height, not all three sides — `watchOut` names the limit and cross-links
  to `triangle-calculator`. LogScale visual against three cited everyday areas (an ISO 216 A4 sheet,
  a FIBA-regulation basketball court, a FIFA-recommended soccer pitch).
- **volume-calculator** (type B): the same shape-mode-menu pattern one dimension up — cube,
  rectangular box, cylinder, sphere, cone — over the same `dim1`/`dim2`/`dim3` inputs (reused as
  radius/height or length/width/height depending on shape). LogScale visual against a drink can, a
  US gallon (3.785411784 L, exact per NIST), and a World Aquatics/FINA-minimum Olympic pool (2,500 m³).
- **surface-area-calculator** (type B): the same five solids and the same `dim1`/`dim2`/`dim3`
  inputs as `volume-calculator`, kept in lockstep so the two pages share one mental model, but each
  solid's surface-area formula instead of its volume formula. The cone figure is explicitly the
  TOTAL surface area (base + lateral, πr² + πr√(r²+h²)) — called out against the lateral-only
  convention MathWorld's Cone page uses, since OpenStax's own volume/surface-area section states
  outright that it does not cover a cone's surface area at all. LogScale visual reusing
  area-calculator's same three benchmarks.

Verification: every number in the copy (worked examples, FAQ figures, `example` lines, LogScale
benchmarks) was recomputed independently in `verify_run5.mjs` (scratchpad, plain JavaScript rather
than Python this run, so the triangle trig matches the app's own `Math`-object floating-point
behavior exactly) — 0 mismatches — and cross-checked a second time directly against the app's own
`compute()` via a Node one-liner, covering every shape/mode combination across all 5 calculators,
the SSS/SAS/ASA triangle cases, the invalid-triangle case (confirms `NaN` on every output, not a
wrong number), and the circle default/worked-example pair. `npm test` 326/326 (up from 318),
`npm run build` (107 static pages, up from 102), lint clean. Data-integrity check run
programmatically for all 5 new calculators: 0 broken `related` ids, 0 self-references, 0 duplicate
aliases, all 79 ids unique. All 5 pages, `/categories/math` and `sitemap.xml` spot-checked on a
local dev server (H1, every v2 section id, one JSON-LD `<script>` tag per page parsed to confirm
all 4 node types, the correct widget mounted, a `?mode=2&sideA=8&sideB=10&angleC=60` share-link on
triangle-calculator returning 200), then the server was killed and port 3000 confirmed free.
References fetched directly and each confirmed to state the exact formula claimed before citing:
OpenStax Algebra and Trigonometry 2e §10.1/§10.2 (law of sines/cosines, Heron's formula), OpenStax
Prealgebra 2e §9.4/§9.5/§9.6 (rectangle/triangle/trapezoid area, circle circumference/area, and
volume/surface area for all five solids), and Wolfram MathWorld's Circle, Heron's Formula, Law of
Cosines, Law of Sines and Cone pages. LogScale benchmark facts (FIBA court, ISO 216 A4, the exact
NIST gallon already asserted in `lib/units.ts`, the World Aquatics Olympic-pool minimum) were
verified via search/fetch but, following the precedent that force-calculator's own chart benchmarks
were never individually cited, are not added to the formal `content.references` list — that list is
reserved for the calculator's core math sources. PR #19 opened as a draft before the first
calculator was built, updated with the full run-5 summary, and taken off draft via `gh pr ready 19`
once everything above passed. See `mdFiles/steps/40-wave-1-math.md`'s "Type decisions (run 5)" and
"Verification" sections for the full writeup. Next session picks up run 6: slope, distance between
two points, midpoint, scientific-calculator.

**2026-10-22 — step 40, Wave 1: math, run 6/6 (final math run — 4 new calculators).** Branch
`step/40-wave-1-math-run-6` from `origin/master`. Added 4 calculators to the existing `math`
category (`data/calculators/math.ts`) and appended each id to `calculatorOrder`
(`data/calculators/index.ts`):

- **slope-calculator** (type B): two points → slope, angle of inclination, y-intercept and the
  distance between them. A vertical line (`x1 === x2`) returns `NaN` for slope and y-intercept —
  genuinely undefined, not infinite — but the angle is computed directly from `atan2(Δy, Δx)`
  rather than from the slope, so it still reports an honest 90° instead of also going blank.
  `KNOWN_NON_FINITE` registered for the one true degenerate case (both points identical, the
  automated edge case). CompareBars visual: `|Δx|` (run) vs `|Δy|` (rise), via a `derive` key.
- **distance-calculator** (type B): two points → the distance formula, explicitly framed as the
  Pythagorean theorem applied to the coordinate differences. Deliberately thin (distance, `|Δx|`,
  `|Δy|`) and cross-linked to `pythagorean-theorem-calculator`, `slope-calculator` and
  `midpoint-calculator` rather than re-explaining them. CompareBars visual: `|Δx|` / `|Δy|` /
  distance, the same leg-a/leg-b/hypotenuse shape as `pythagorean-theorem-calculator`'s own visual.
- **midpoint-calculator** (type B): two points → the midpoint, plus the distance from each point to
  the midpoint shown side by side as a self-check (the two halves are always exactly equal by
  construction). Each axis is averaged independently — `average-calculator`'s own two-number
  average, applied twice.
- **scientific-calculator** (type C, custom component): does not fit `solver` (no single
  rearrangeable equation — a free-form typed expression has no fixed variable set) or the type-B
  `breakdown` widget (a fixed `inputs` array can't represent open-ended text). Built as a custom
  component exactly like the existing `pomodoro-timer`/`timezone-meeting-planner` tools:
  `inputs: []`, `compute() { return {}; }`, a hardcoded slug branch in
  `app/[locale]/calculators/[slug]/page.tsx`, full v2 content. New code: `lib/scientificCalc.ts` (a
  small hand-written recursive-descent expression parser and evaluator — tokenizer, standard
  operator precedence, **no `eval`/`new Function` anywhere**) and
  `components/ScientificCalculator.tsx` (an iOS-style button-grid widget). Both are the same size
  class as the existing custom tools (`PomodoroTimer.tsx`/`TextToolsCalculator.tsx` are ~160-190
  lines each), so this was built directly in this run rather than parked as its own step, per the
  task's explicit size check. Supports `+ − × ÷ ^` (right-associative: `2^3^2 = 512`),
  parentheses, implicit multiplication (`2π`, `3(4+5)`), unary minus binding looser than `^`
  (`−2^2 = −4`, the standard algebra-class convention), `sin/cos/tan` with a Deg/Rad toggle,
  `asin/acos/atan` (domain-guarded), `ln`/`log` (natural/base-10, non-positive arguments refuse),
  `√` (negative radicand refuses), `π`, `e`, and `!` (nonnegative integers only, honestly overflows
  to `Infinity` past 170! — the same threshold `factorial-calculator` established in run 3). 22
  dedicated unit tests in `lib/scientificCalc.spec.ts`.

Verification: every number in the copy was recomputed independently in `verify_run6.mjs`
(scratchpad, plain JavaScript, no app imports) — 35 checks, 0 mismatches, including the
vertical-line case, the identical-points degenerate case, and the scientific-calculator worked
example (`sin(30°) + log(100) × 5! = 240.5`). `npm test` 354/354 (up from 326, including the 25 new
parser tests), `npm run build` (111 static pages, up from 107), `npm run lint -- --ignore-pattern
".open-next/**" --ignore-pattern ".claude/**"` all pass. A programmatic check across all 83
calculators found 0 broken `related` ids, 0 self-references, 0 new duplicate aliases (the one
pre-existing collision predates this run). All 4 pages, `/categories/math` and `sitemap.xml`
spot-checked on a local dev server (H1, every v2 section id, one JSON-LD `<script>` per page with
all 4 node types, the correct widget mounted, a vertical-line share-link on slope-calculator
returning 200); dev server killed, port 3000 confirmed free. References fetched directly and each
confirmed via `WebFetch`/`WebSearch` before citing: OpenStax Algebra and Trigonometry 2e §4.1
(slope, including its explicit "slope of a vertical line is undefined" statement) and §2.1
(distance and midpoint formulas, both confirmed on the same page); OpenStax Prealgebra 2e §2.1
(order of operations — two wrong section-number guesses, §1.2 and §1.9, both 404'd before the
right one was found via search); NIST DLMF §4.2, §4.14 and §4.23 (logs/exponentials, trig
definitions, inverse trig); Wolfram MathWorld's Slope, Distance and Midpoint pages. PR #20
opened as a draft before the first calculator was built, updated with the full run-6 summary, and
taken off draft via `gh pr ready` once everything above passed. See
`mdFiles/steps/40-wave-1-math.md`'s "Type decisions (run 6)" and "Verification" sections for the
full writeup. **The math sub-wave of step 40 is now complete** (29/~29 calculators across 6 runs).
Next session starts the **statistics** part of Wave 1 — a new category, following the same
just-in-time step-file process.

**2026-10-22 — step 41, Wave 1: statistics, run 1/~5 (new category + 5 new calculators).** Branch
`step/41-wave-1-statistics-run-1` from `origin/master`. Wrote the step file
(`mdFiles/steps/41-wave-1-statistics.md`) first, with a full run breakdown of all ~25 statistics
calculators into 5 runs. Added the `statistics` category (`data/calculators/index.ts`,
`data/calculators/statistics.ts`, `lib/categoryTheme.ts` purple/`chart`, a new bar-chart icon added
to `components/IconTile.tsx` since none of the existing glyphs fit):

- **New shared "data list" input helpers**, formalizing the pattern the step-40 Parked note
  predicted this category would need repeatedly: `listCountInput`/`listValueInputs`/`readList`/
  `listGroups` at the top of `statistics.ts`, `MAX_LIST_SIZE = 10` (one more slot than
  `average-calculator`'s 8). A count selector (`min` varies per calculator, always 1 here) plus
  array slicing, zeros included, never a 0-sentinel — the same rule the step-40-run-2 fix
  established, now named and reusable instead of re-derived per calculator.
- **mean-median-mode-calculator** (type B): mean, median and mode together. Mode is reported as
  two plain numbers (`primaryMode`, `modeCount`) since `compute()` can only return numbers, not a
  list; a list of 2+ all-distinct values honestly has no mode (`NaN`/"—"), while a single-value
  list counts its own value as a trivial mode (avoiding a `KNOWN_NON_FINITE` entry at the `min: 1`
  edge case). Deliberately avoids `average-calculator`'s existing "mean calculator" alias and
  cross-links to it instead of colliding.
- **standard-deviation-calculator** and **variance-calculator** (both type B, kept in lockstep):
  population (÷ n) and sample (÷ n − 1) versions shown side by side and explicitly labeled, per the
  task's requirement — no silent default with the other one hidden. `min: 1` on the count selector
  deliberately (not 2), so a single-value list surfaces the sample statistic's genuine 0 ÷ 0 as an
  honest "—" instead of making that state unreachable; `KNOWN_NON_FINITE` registered for both
  (`sampleVariance`, `sampleStdDev`). The two pages share the exact same worked-example numbers
  (72, 85, 90, 78, 95) so a reader can verify variance = standard-deviation² across both pages
  directly.
- **z-score-calculator** (type A, 4-variable solver): `z = (x − μ) ÷ σ`, solved in all four
  directions. More variables than `force-calculator`'s three, but confirmed directly in
  `components/SolverCalculator.tsx` that the "least recently edited field is auto" rotation is
  generic over any variable count, not hardcoded to 3 — no widget change needed. Solving for σ
  refuses (`NaN`) a zero or negative result, since a standard deviation can't be either. RangeBar
  visual: the z-score against 5 bands from "far below" to "far above average."
- **percentile-calculator** (type B): the task required picking one standard method and citing it.
  **Correction made before shipping**: an initial assumption that NIST's method matched Excel's
  `PERCENTILE.INC` was checked by fetching the actual NIST/SEMATECH *Engineering Statistics
  Handbook* §7.2.6.2 page directly (not the dead `prc252.htm` URL several search results pointed
  at — the live one is `prc262.htm`) — it turned out to be a different, equally standard convention
  (Hyndman & Fan's "type 6" vs. Excel's "type 7"). Shipped the actual NIST formula
  (`p(N+1) = k + d`, linear interpolation) and added a watch-out item saying plainly that Excel can
  give a slightly different answer, rather than asserting a false equivalence. `targetPercentile`
  has no input-level upper bound (`CalculatorInput` has no `max` field, the same kit gap
  `prime-factorization-calculator`/`lcm-calculator` already hit) — handled honestly by the rank
  formula's own boundary rule rather than a separate clamp.

Verification: every number recomputed independently in `verify_run1.mjs` (scratchpad, plain
Node, no app imports) *before* writing any calculator code, then diffed against the regenerated
snapshot — 0 mismatches, including the percentile boundary cases (P=0/100/150/−20, a single-value
list) and the z-score solver's three inverse directions. `npm test` 367/367 (up from 354),
`npm run build` (117 static pages, up from 111), `npm run lint -- --ignore-pattern ".open-next/**"
--ignore-pattern ".claude/**"` all pass. A programmatic check across all 88 calculators found 0
duplicate ids, 0 broken `related` ids, 0 self-references, 0 new duplicate aliases (the one
pre-existing collision predates this run), and every new `seo.title`/`seo.description` within the
60/160-character limits. All 5 pages, `/categories/statistics` and `sitemap.xml` spot-checked on a
local dev server (H1, every v2 section id, one JSON-LD `<script>` per page, the correct widget
mounted — `breakdown-howMany` for the 4 type-B calculators, `solver-*` fields for
z-score-calculator); dev server killed, port 3000 confirmed free. `next-env.d.ts` reverted before
committing. References fetched directly and quoted before citing: OpenStax *Introductory
Statistics 2e* §2.5 (Measures of the Center, reused from `average-calculator`'s citation), §2.7
(Measures of the Spread of the Data — confirmed the exact σ/s formulas and n vs. N notation) and
§6.1 (The Standard Normal Distribution — confirmed the exact z-score formula); NIST/SEMATECH
*Engineering Statistics Handbook* §7.2.6.2 (Percentiles); Wolfram MathWorld (Statistical Median,
Mode, Standard Deviation, Variance). See `mdFiles/steps/41-wave-1-statistics.md`'s "Type decisions
(run 1)" and "Verification" sections for the full writeup. 5/~25 statistics calculators done. Next
session picks up run 2: confidence interval, margin of error, sample size, p-value, quartile/IQR.

step 40–42 · 2026-10-23 · **Paused by the user — math and statistics sub-waves complete, conversion not started**

State at pause: `master` = `85af52b` (PR #26), clean, no open PRs, no open step branches, no dev server.
108 calculators, 16 categories. Merged this stretch: #19 (math run 5), #20 (math run 6, incl. the
`scientific-calculator` custom widget + `lib/scientificCalc.ts`), #21 (statistics run 1 + `statistics`
category), #22 (paste-a-list input, `type: 'list'`, `lib/listParse.ts`), #23–#26 (statistics runs 2–5).
Every PR got a coordinator review before merge that recomputed figures against reference values;
the bugs it caught are written up in the step files' "Pre-merge review fix" sections (trig float noise,
thousands-separator misread, normal tail accuracy, binomial large-n non-convergence + exact zeros,
non-integer counts, perfect-fit p-values, chi-square totals).

A conversion run-1 agent was started and stopped by the user before it wrote anything — no
`42-wave-1-conversion.md` step file exists yet. **To resume:** start conversion run 1 per the
header line above, with the same accuracy rules: exact factors (NIST SP 811 / 1959 yard-and-pound
agreement), affine temperature, round-trip tests, common-values tables generated from compute(),
ft+in rounding never showing "12 in", negative values only where physical.

Workflow notes: build agents push only to their own branch (`git push -u origin <branch>` first) and
never merge; the main session reviews and merges. In this session the auto-mode classifier refused a
merge right after an agent's own merge attempt had been blocked, so #26 was merged on the user's explicit
instruction. `master` history contains an unreviewed WIP commit `91dcb03` ("commit") pushed by hand
when run 4 was interrupted by a usage limit; PR #25 cleaned it up, so content is correct and the
history was left as is (no force-push).

step 42 · 2026-10-25 · **Conversion sub-wave, run 1/~13: the `commonValues` kit + 5 new pair converters**

Branch `step/42-wave-1-conversion-run-1`, PR #28 (ready for review, not yet merged). Wrote
`mdFiles/steps/42-wave-1-conversion.md` first (it didn't exist — the previous session was stopped
before writing it), planning the ~65-item conversion list into runs of 5.

**Kit addition**: `content.commonValues` (`data/calculators/types.ts`) — a `{ title, dimension,
from, to, values, reverse?, decimals?, feetInches? }` block. Pure helpers in new `lib/commonValues.ts`
(`convert`, `formatFeetInches`, `columnHeader`, `cellText`) do the unit math via `lib/units.ts`
(never hand-typed) and the server-rendered `<table>` lives in new `components/CommonValuesSection.tsx`,
wired into `app/[locale]/calculators/[slug]/page.tsx` between worked-example and watch-out, with its
own TOC entry and a `common-values` `SECTION_THEME` icon. **Deviation from the step file's suggested
shape**: `reverse` became `{ title, values, feetInches? }` (not a bare `number[]`) so the second table
can carry its own caption and its own feet-inches side independently. **Feet+inches design decision**:
rather than keying the ft+in display off the literal unit id `'ft'` (which only covers
`feet-to-meters-converter`'s `to` side), `feetInches` is an explicit `'from' | 'to'` flag per table,
local to that table's own two columns — needed because `feet-to-meters-converter` wants it on its
`from` column (feet) while a cm↔in height row wants it on its `to` column even though that column's
real unit is inches, not feet. `cellText()` re-expresses whichever flagged column as total inches
via `lib/units.ts`, then `formatFeetInches()` rounds the TOTAL inches first and splits, so it can
never print "12 in" — proven by a sweep test over ±200 total inches plus an explicit rounding-boundary
case, and by a second test that walks every calculator's actual shipped `commonValues` table
(`lib/commonValues.spec.ts`) checking round-trip (`from -> to -> from`, 1e-9 relative) and the
"never 12 in" rule against the real data, not a synthetic example.

**Exact-factor audit**: `miles-to-kilometers-converter`'s `compute()` used a truncated `1.60934`
(flagged in the step file); audited the other three existing converters' `compute()`s the same way
and found two more of the same bug — `pounds-to-kilograms-converter` (`0.453592`, missing 3 digits
of `0.45359237`) and `gallons-to-liters-converter` (`3.78541`, missing 4 digits of `3.785411784`).
`fahrenheit-to-celsius-converter`'s `(f - 32) * 5/9` was already mathematically exact. All 4 now route
through `fromBase(toBase(...))`. Only the 3 buggy ones' snapshot numbers actually moved (confirmed
via `git diff` on `data/calculators.spec.ts.snapshot` before committing — the diff touched exactly
those 3 `exports[...]` blocks and nothing else). The error was small (6th significant digit) but real:
e.g. the old `0.453592` factor for 225 lb gave `102.0582` kg instead of the correct `102.0582833` kg.

**Retrofit**: all 4 existing converters got a `commonValues` table (plus a `reverse` table) using
realistic search-intent values (race distances for mi↔km, oven/body temps for °F↔°C, body-weight
and fuel-tank-size values for lb↔kg and gal↔L).

**5 new pair converters** (type A, copied from `miles-to-kilometers-converter`'s pattern exactly —
two solver variables of the same dimension, identity `solve` functions with the `>= 0` guard):
`centimeters-to-inches-converter`, `feet-to-meters-converter` (its forward `commonValues` table IS
the "common heights" table, `feetInches: 'from'`, using exact fractions like `5.75` ft = 69 in = 5'9"
so the ft→in multiply-by-12 has no floating-point surprises), `ounces-to-milliliters-converter`
(US fl oz default, UK fl oz in the menu + a watch-out on the ~4% size difference),
`grams-to-ounces-converter` (avoirdupois oz; troy oz — not in `lib/units.ts`, so not offered as a
menu unit — called out only in a watch-out), `mph-to-kph-converter` (reuses the exact `1.609344`
mile factor, since the hours cancel). 113 calculators total (108 + 5), 16 categories (unchanged).

**Verification**: every copy figure (example line, worked example, FAQ, commonValues rows,
benchmarks) recomputed independently in a scratchpad script (`verify_run1.mjs`, no app imports,
plain NIST-constant arithmetic) before committing; one script-authored "expected" literal had a typo
(`104.6074` vs. the correct `104.60736`) which the script itself flagged — not a code bug, fixed by
reading the real value, which matches the shipped `104.61` (rounded) copy. Checked programmatically
(scratchpad-only, not committed): no duplicate calculator ids, no id collides with any
`redirectFrom`, every new `related` id exists with no self-reference, every new `seo.title` ≤60
chars (34–45) and `seo.description` ≤160 chars (131–147), 6 FAQs and 4 aliases per new page (the
one pre-existing duplicated alias, "house loan emi calculator" on `mortgage-calculator` /
`emi-calculator`, predates this run and wasn't touched). `npm test` 524/524 (up from 499), lint
clean, `npm run build` passes (142 static pages, up from 137). Spot-checked all 5 new pages plus
`/categories/measurements` on a local dev server (H1, `common-values` section id, both tables'
captions, JSON-LD, and confirmed the only literal "12 in"/"21 in"/"5 in" text on the pages is
intentional cautionary prose — e.g. "never \"6 ft 12 in\"" — not a generated table cell); killed the
server afterward (port 3000 confirmed free).

**What run 2 needs to know**: per the step file's "Planned run breakdown", run 2 is the general
one-dimension converters (length, weight, volume, area, speed — all units of one dimension on one
page each); decide there whether temperature needs a separate general page or just gains
Kelvin/Rankine rows on the existing `fahrenheit-to-celsius-converter`. The `commonValues` kit and
its `feetInches` flag are now proven on 9 tables (4 retrofitted + 5 new) and ready to reuse as-is.

step 42 · 2026-10-25 · **Conversion sub-wave, run 2/~13: the 5 general one-dimension converters**

Branch `step/42-wave-1-conversion-run-2`, PR #29 (ready for review, not yet merged). Wrote the
"## Run 2" section in `mdFiles/steps/42-wave-1-conversion.md` first, with the dedupe decisions and
a progress checklist, before building anything.

**Read `components/SolverCalculator.tsx` first** to confirm a key assumption: a solver variable's
unit menu is already built from `UNITS[variable.dimension]` (`unitOptions={... UNITS[variable.dimension]}`,
line 126), not filtered to `defaultUnit`. That means every existing pair converter already lets you
pick *any* unit of its dimension in either field — `pounds-to-kilograms-converter` can already
convert grams to stone. "General converter" therefore needed no new widget: just a page whose SEO
framing, default pair and `commonValues` table are written for the whole dimension rather than one
named pair.

**5 new type-A pair converters** (same `>= 0` guard pattern as every other converter), added to
`data/calculators/measurements.ts` and `calculatorOrder`:
- `length-converter` — default meters ↔ feet; `commonValues` table m→ft (reverse ft→m).
- `weight-converter` — default kilograms ↔ pounds; table kg→lb (reverse lb→kg) — the *opposite*
  primary direction from `pounds-to-kilograms-converter`'s own lb→kg table, with a different value
  set, so the two tables don't duplicate each other.
- `volume-converter` — default liters ↔ US gallons; table L→gal (reverse gal→L), likewise the
  opposite direction from `gallons-to-liters-converter`'s gal→L table.
- `area-converter` — default square meters ↔ square feet; table m²→ft² (reverse ft²→m²). No
  existing area pair-converter, so no direction conflict.
- `speed-converter` — default meters per second ↔ km/h; table m/s→km/h (reverse km/h→m/s). Chosen
  instead of mph↔km/h specifically because `mph-to-kph-converter` already owns that pair; m/s↔km/h
  is also the cleanest conversion on the whole site, exactly 3.6, since both the meter/kilometer and
  the second/hour relationships are exact SI definitions with no historical constant in between.

**Dedupe, checked programmatically before and after writing any content** (ids, aliases, `related`,
`redirectFrom`, across the *whole* dataset, not just `measurements.ts`):
- `distance converter` moved from `miles-to-kilometers-converter` to `length-converter` (replaced
  with "convert miles to kilometers" on the old page so it keeps ≥4 aliases, same floor the skill
  asks for on every page).
- `weight converter` moved from `pounds-to-kilograms-converter` to `weight-converter` (that page now
  has exactly 4 aliases, matching the floor).
- `volume converter` moved from `gallons-to-liters-converter` to `volume-converter` (same, 4 left).
- `area converter` and `speed converter` are new aliases, no prior collision.
- Confirmed no id or alias overlap with the unrelated math-category geometry calculators
  `area-calculator`, `volume-calculator`, `distance-calculator` (shape area / solid volume /
  coordinate distance — a different topic that happens to share a word).
- The only alias collision found site-wide is the pre-existing, out-of-scope `house loan emi
  calculator` (`mortgage-calculator` / `emi-calculator`), already on the Parked list, not touched.

**Temperature decision**: no separate general temperature-converter page this run.
`fahrenheit-to-celsius-converter` already offers all 4 `UNITS.temperature` entries (K, °C, °F, °R)
in both its unit menus (same `SolverCalculator` mechanism above) and already carries the
"temperature converter" alias. A dedicated general page would be a near-duplicate of that one with
nothing left to add, so this is a deliberate scope decision, not an oversight.

**Verification**: every copy figure — the `example` line, worked-example rows, FAQ answers,
`commonValues` table values (forward and reverse), visual benchmarks, and secondary facts quoted in
`watchOut`/FAQ items (the acre as exactly 4,046.8564224 m², a hectare as exactly 2.4710538… acres, a
square acre's side as √4,840 yd ≈ 69.57 yd ≈ 208.7 ft, the US survey-foot area discrepancy as
≈4 ppm, the m/s→km/h factor as exactly 3.6) — recomputed independently in a scratchpad script
(`verify_run2.mjs`, no app imports, the same NIST constants hand-copied from `lib/units.ts`) before
any of it was committed. Two primary-source URLs reused verbatim from run 1 (NIST SP 811, NIST
Handbook 44) were each fetched once this run to confirm they still resolve, per the "references
fetched" rule — both do; no new sources were needed since every new page's facts are either the
same NIST conversion factors or well-known physical/sporting-venue dimensions already in the style
of the kit's existing uncited benchmarks (e.g. "a basketball hoop is 10 ft" on `feet-to-meters-converter`).

Checked programmatically: 0 duplicate calculator ids; every new page's `related` ids exist with no
self-reference; every new `seo.title` ≤60 chars (39–46) and `seo.description` ≤160 chars (137–142);
6 FAQs and 5 aliases per new page. 118 total calculators (113 + 5), 16 categories (unchanged).
`npm test` 549/549 (up from 524), lint clean, `npm run build` passes (147 static pages, up from 142).
Spot-checked all 5 new pages plus `/categories/measurements` on a local dev server (H1 text, the
`common-values` section id and both its tables, JSON-LD present, and the rendered table figures
matched the scratch script's numbers exactly, e.g. `length-converter`'s "10 m → 32.81 ft" and "50
ft → 15.24 m"); killed the server afterward (port 3000 confirmed free).

**What run 3 needs to know**: per the step file's "Planned run breakdown", run 3 is general
converters continued — time, pressure, energy, power, data storage — the same "no new widget, just
a sensible default pair + its own `commonValues` table, opposite-direction table from any existing
single-pair sibling" pattern this run established. Re-check the breakdown against what exists
before building (e.g. confirm no pair converter already owns a dimension's most-obvious default
pair the way `mph-to-kph-converter` owned mph↔km/h here), and keep moving any clearly-generic bare
alias (a literal "time converter", "pressure converter", etc.) off its single-pair sibling onto the
new general page, replacing it there with a specific enough alias to stay at or above the ≥4 floor.

step 42 · 2026-10-25 · **Conversion sub-wave, run 3/~13: time, pressure, energy, power, data storage converters**

Branch `step/42-wave-1-conversion-run-3`, PR #30 (ready for review, not yet merged). Wrote the
"## Run 3" section in `mdFiles/steps/42-wave-1-conversion.md` first, with the dedupe check, default-
pair decisions and a progress checklist, before building anything.

**Dedupe, checked programmatically before building** (ids, aliases, `related`, `redirectFrom`,
across the whole dataset): `time-converter`, `pressure-converter`, `energy-converter`,
`power-converter` and `data-storage-converter` were all free ids with no alias collisions. Unlike
run 2 — where `length-converter` etc. had to take over a bare alias from an existing single-pair
sibling (`distance converter`, `weight converter`, `volume converter`) — none of this run's five
dimensions had an existing general-sounding alias to move: `time.ts` is about dates, durations and
timers (age, work hours, date difference, sleep time, pomodoro), not unit conversion, and
`physics.ts` has only `force-calculator` so far, no energy/power/pressure calculator planned until a
later physics wave. `home.ts`'s `electricity-bill-calculator` ("energy bill calculator") and
`health.ts`'s `tdee-calculator` ("total daily energy expenditure calculator") are unrelated topics
(billing, metabolism) that happen to share the word "energy," not conversion pages.

**5 new type-A pair converters**, same `>= 0` guard pattern as every other converter, added to
`data/calculators/measurements.ts` and `calculatorOrder`:
- `time-converter` — default hours ↔ minutes, the one *exact* pair in the dimension (60:1, no
  rounding), so the lead example and worked example carry no caveat. Months and years
  (`lib/units.ts`'s Julian-year averages: 365.25-day year, month = year/12) are stated honestly as
  averages in concept/formula/watchOut/FAQ, with `date-difference-calculator` cross-linked for an
  exact calendar range. `commonValues` table h→min (reverse min→h).
- `pressure-converter` — default psi ↔ bar, a tire-pressure example. Explains gauge vs. absolute
  pressure (a tire gauge reads relative to the atmosphere) and that mmHg and Torr are nearly but not
  exactly equal — about 1 part in 7 million apart (mmHg from mercury's density and standard gravity,
  Torr as exactly 1/760 atm) — matching `lib/units.spec.ts`'s own `atm→mmHg` test, which already
  uses a 1e-5 tolerance rather than exact equality. `commonValues` table psi→bar (reverse bar→psi).
- `energy-converter` — default kilojoules ↔ kilocalories, a nutrition-label example. States that
  `lib/units.ts`'s calorie is the thermochemical calorie (4.184 J exact, not a measured average) and
  that a food "Calorie" (capital C) means a kilocalorie; and that its BTU is the International Table
  BTU (1,055.05585262 J exact), one of several historical BTU definitions, not the thermochemical or
  59°F ones. `commonValues` table kJ→kcal (reverse kcal→kJ).
- `power-converter` — default kilowatts ↔ horsepower, a car/motor example. Explains mechanical hp
  (550 ft·lbf/s, exactly 745.69987158227 W) vs. metric PS (75 kgf·m/s, exactly 735.49875 W) as two
  different, each internally exact, "horsepower-like" units, about 1.39% apart — a car spec quoting
  PS is not the same number as hp. `commonValues` table kW→hp (reverse hp→kW).
- `data-storage-converter` — default gigabytes ↔ megabytes (decimal). Concept/formula/watchOut/FAQ
  explain decimal (1,000ⁿ: KB/MB/GB) vs. binary (1,024ⁿ: KiB/MiB/GiB) prefixes, why a "1 TB" drive
  shows about 931.32 GiB in an operating system (same bytes, two correctly-defined but differently-
  sized units), and bits vs. bytes with a worked "100 Mbps ≈ 12.5 MB/s" / "1 Gbps ≈ 125 MB/s"
  example. New reference fetched this run: NIST's "Prefixes for Binary Multiples" page
  (`physics.nist.gov/cuu/Units/binary.html`), confirming the Ki/Mi/Gi definitions and the IEC 1998
  standardization history cited in the concept section. `commonValues` table GB→MB (reverse MB→GB).

**No unit was missing from `lib/units.ts`** for any of the five dimensions (time, pressure, energy,
power, data) — every unit used in this run's menus, defaults and commonValues tables already
existed, so nothing was added to `UNITS` or `lib/units.spec.ts`.

**Verification**: every copy figure — the `example` line, worked-example rows, FAQ answers,
`commonValues` table values (forward and reverse), visual benchmarks, and secondary facts quoted in
concept/formula/watchOut items — recomputed independently in a scratchpad script (`verify_run3.mjs`,
no app imports, the same NIST constants hand-copied from `lib/units.ts`) *before* any of it was
committed. The script caught one real arithmetic slip during drafting: `power-converter`'s
worked-example explanation first said 134 hp ≈ "136.0 PS"; the exact figure (134 × 745.69987158227 ÷
735.49875) is 135.858535…, so the copy was corrected to "135.86 PS" before that calculator was ever
committed — the only mismatch this run's check found. NIST SP 811 and NIST Handbook 44 were reused
verbatim from runs 1–2 (fetched once each in run 2 to confirm they still resolve); the new NIST
binary-prefixes page for `data-storage-converter` was fetched fresh this run.

Checked programmatically: 0 duplicate calculator ids; every new page's `related` ids exist with no
self-reference (the only alias collision anywhere in the dataset remains the pre-existing,
out-of-scope `house loan emi calculator`, already on the Parked list, not touched); every new
`seo.title` ≤60 chars (42–46) and `seo.description` ≤160 chars (143–153); 6 FAQs and 5 aliases per
new page. 123 total calculators (118 + 5), 16 categories (unchanged). `npm test` 574/574 (up from
549), lint clean, `npm run build` passes (152 static pages, up from 147). Spot-checked all 5 new
pages plus `/categories/measurements` on a local dev server (H1 text, the `common-values` section
id and both its tables, JSON-LD present, and the rendered `data-storage-converter` table and prose
showing "931.32" matching the scratch script's figure exactly); killed the server afterward (port
3000 confirmed free).

**What run 4 needs to know**: per the step file's "Planned run breakdown", run 4 shifts from general
converters to high-volume *pairs* — inches↔mm, mL↔cups, kg↔stone, acres↔hectares, sq ft↔sq m.
Re-check the breakdown against what exists before building: several of these exact units already
appear in this run's and run 2's general-converter menus (e.g. inches and mm are both already in
`length-converter`'s menu), so the new work for run 4 is each pair's own SEO-specific page, a
sensible default direction and its own `commonValues` table (opposite direction from any sibling
that already covers the same pair) — not a new widget or a new unit. Run 5 is next after that:
kW↔hp, psi↔bar, kcal↔kJ, MB↔GB, mpg↔L/100 km — note that this run's general pages already use
kW↔hp, psi↔bar, kJ↔kcal and GB↔MB as their *own* default pairs, so run 5 should pick each pair's
*other* direction and a distinct commonValues value set for its dedicated page, exactly as run 2
did for `weight-converter` (kg→lb) vs. `pounds-to-kilograms-converter` (lb→kg).

**2026-10-25 — step 42, Wave 1: conversion, run 4/~13 (5 high-volume pairs, PR #31).** Added
`millimeters-to-inches-converter` (default mm→in, table built around metric drill bit sizes and
fractional inches 1/16–1 in), `milliliters-to-cups-converter` (default mL→cups, US customary cup
236.5882365 mL stated as the default against the 250 mL metric cup, and the UK's lack of a
standard cup measure), `kilograms-to-stone-converter` (default kg→stone, the first page with a real
stone table — body-weight kg values shown as stone + pounds, e.g. "11 st 0 lb"), `acres-to-hectares-
converter` (default acre→ha, table built around farmland/land-parcel sizes), and `square-feet-to-
square-meters-converter` (primary direction ft²→m², the *opposite* of `area-converter`'s own default
m²→ft², per the overlap rule — table built around room/home sizes, 500–3,000 ft² and 10–200 m²).

**Overlap/dedupe decisions** (programmatic check against every `id`/alias in `data/calculators/*.ts`
before building; full detail in `mdFiles/steps/42-wave-1-conversion.md` → "Run 4"): two existing
aliases were moved to the new, more specific pages — `'stone to kg converter'` off
`pounds-to-kilograms-converter` onto `kilograms-to-stone-converter`, and `'sq ft to sq m converter'`
off `area-converter` onto `square-feet-to-square-meters-converter` (same precedent as run 2's
`distance converter` move). The other three pairs (mm/in, mL/cup, acre/ha) had no alias collisions
and no existing table on the sibling general page for that specific pair, so no alias moves were
needed there — the general pages (`length-converter`, `volume-converter`, `area-converter`) list
those units in their menus but never built a table around them.

**Kit addition: `commonValues.stoneLbs`.** Mirrors `feetInches` exactly (same file, same
round-the-total-first-then-split principle, now for mass/pounds instead of length/inches):
`formatStoneLbs(totalPounds)` in `lib/commonValues.ts`, the `stoneLbs?: 'from' | 'to'` field in
`data/calculators/types.ts` (on both the table and `reverse`), `CommonValuesSection.tsx` updated to
combine `feetInches`/`stoneLbs` into one display mode, and unit tests mirroring the existing
`formatFeetInches` tests (including a 300-value sweep proving "14 lb" can never print, the same way
"12 in" can't). Fully backward compatible — `columnHeader`/`cellText`'s `asFeetInches` boolean
parameter still accepts `true`/`false` unchanged; `'stoneLbs'` is a new third option.

**No unit was missing from `lib/units.ts`** — mm, in, mL, cup, cupMetric, kg, st, acre, ha, m2 and
ft2 all already existed (st was added in run 1); nothing added to `UNITS` or `lib/units.spec.ts`
this run.

**Verification**: every copy figure — example lines, worked-example rows, FAQ answers,
`commonValues` table values (forward and reverse), visual benchmarks — recomputed independently in
a scratchpad script (`verify_run4.mjs`, no app imports, the same NIST constants hand-copied from
`lib/units.ts`) before any of it was committed; no mismatches found. The stone-and-pounds rows were
specifically checked to confirm no remainder ever reads 14 lb (e.g. 70 kg → 154.3236 lb → rounds to
154 lb → 11 st 0 lb, never drifting to "10 st 14 lb").

Checked programmatically: 0 duplicate calculator ids; every new page's `related` ids exist with no
self-reference; the only alias collision anywhere in the dataset remains the pre-existing,
out-of-scope `house loan emi calculator`, already on the Parked list, not touched; every new
`seo.title` ≤60 chars (41–50) and `seo.description` ≤160 chars (127–153); 6 FAQs and 5 aliases per
new page. 128 total calculators (123 + 5), 16 categories (unchanged). `npm test` 603/603 (up from
578 after the snapshot update — diff touched only the 5 new ids), lint clean, `npm run build` passes
(157 static pages, up from 152). Spot-checked all 5 new pages plus `/categories/measurements` on a
local dev server (H1 text, the `common-values` section id, JSON-LD present, and the
`kilograms-to-stone-converter` table rendering "11 st 0 lb" / "7 st 12 lb" etc. with no table cell
ever showing "14 lb" — the only "11 st 14 lb" string in the rendered page is inside the FAQ prose
explaining why it can't happen, not a table cell); killed the server afterward (port 3000 confirmed
free).

**What run 5 needs to know**: per the step file's "Planned run breakdown", run 5 is pairs kW↔hp,
psi↔bar, kcal↔kJ, MB↔GB, mpg↔L/100 km. Apply the same overlap rule as run 4: this run's (run 3's)
general pages already use kW↔hp, psi↔bar, kJ↔kcal and GB↔MB as their *own* default pairs
(`power-converter`, `pressure-converter`, `energy-converter`, `data-storage-converter`), so each run
5 pair page should take the *other* primary direction (e.g. `kilowatts-to-horsepower-converter`
hp→kW if `power-converter`'s default is kW→hp — check the exact direction in
`data/calculators/measurements.ts` before assuming) plus a distinct `commonValues` value set, the
same move `square-feet-to-square-meters-converter` made against `area-converter` this run. `mpg↔L/100
km` is the one pair with no existing sibling default-pair collision (the `fuelEconomy` dimension's
reciprocal units are not any general page's default), so it just needs a dedupe check for aliases/id
and its own table — no direction-flip needed. Do the alias-collision check programmatically first,
same as every run.

**2026-10-25 — step 42, Wave 1: conversion, run 5/~13 (opposite-direction pairs, PR #32).** Added 5
pair converters, each the opposite primary direction from the matching run-3 general page's own
default pair, with a distinct `commonValues` table aimed at that pair's real search intent — same
overlap-rule precedent as run 4's `square-feet-to-square-meters-converter`: `horsepower-to-kilowatts-
converter` (hp→kW vs. `power-converter`'s kW→hp; car/motor power ratings), `bar-to-psi-converter`
(bar→psi vs. `pressure-converter`'s psi→bar; tire, espresso-machine and pressure-washer ratings),
`kilocalories-to-kilojoules-converter` (kcal→kJ vs. `energy-converter`'s kJ→kcal; food-label
figures), `megabytes-to-gigabytes-converter` (MB→GB vs. `data-storage-converter`'s GB→MB; file,
photo/video and data-plan sizes), and `mpg-to-l-100km-converter` (mpg (US)→L/100 km; a new
dimension with no general-page overlap, the first reciprocal-relation pair page).

**Alias moves**: the opposite-direction alias on each of the four run-3 general pages was an exact
or near-exact string match for what the new pair page would naturally want as its own primary
alias (`power-converter` had `'hp to kw calculator'`, `pressure-converter` had `'bar to psi
calculator'`, `energy-converter` had `'kcal to kj calculator'`, `data-storage-converter` had `'mb
to gb calculator'`) — moved onto the new page in each case, dropping the general page from 5 to 4
aliases (the floor), same precedent as run 4's `'sq ft to sq m converter'` move.

**No unit addition needed for `mpg-to-l-100km-converter`**: `UNITS.fuelEconomy` already has `mpg`,
`mpgUK` and `km/L` modeled as `inverse()` reciprocal units (base = k ÷ value) in `lib/units.ts`, so
`toBase`/`fromBase` already do the non-linear math; the calculator itself writes no reciprocal
logic of its own, identical in shape to every other pair converter's `compute()`. Verified the
"higher mpg = lower L/100 km" direction and the exact US/UK constants (235.214583 and 282.480936,
built from the exact mile and US/UK gallon definitions) independently before writing any copy.

**Zero/negative-input safety, traced through the real engine rather than assumed**: typing 0 into
the `mpg` field is already `Infinity` in SI at the point `toBase` runs (the reciprocal unit's own
math), which fails `lib/solverState.ts`'s `Number.isFinite` check — its own existing comment
already names this exact case ("0 mpg is Infinity in SI") — so `solve()` never runs and the result
is `NaN`, not `Infinity`. Typing 0 into `L/100km` instead produces a *finite* 0 in SI (linear
factor), which is caught one layer later by `components/SolverCalculator.tsx`'s `converts()` check
(`fromBase(0, 'fuelEconomy', 'mpg')` is `Infinity`, so `Number.isFinite` on that fails) before the
result is ever displayed; the `derive`-based `logScale` visual is gated behind the same `answered`
flag, so it cannot leak an `Infinity` either. Confirmed live, not just by reading the code: a
throwaway script imported `lib/solverState.ts` and called `solveState()` directly with `mpg: '0'`,
`l100km: '0'`, and negative values on both fields — every case resolved to `result: null`/
non-finite, none to a displayed `Infinity`. Because of this existing double guard, the pair's own
`solve` functions use the same plain `>= 0` pattern as every other pair converter — no special-case
`> 0` guard or new math was needed.

**Verification**: every copy figure — example lines, worked-example rows, FAQ answers, `commonValues`
table values (forward and reverse), visual benchmarks, and the mental-math "×/÷ by a rounded
constant, N% high/low" claims — recomputed independently in a scratchpad script (`verify_run5.mjs`,
no app imports, the same NIST constants hand-copied from `lib/units.ts`) *before* any of it was
committed. The script caught two real slips during drafting: `bar-to-psi-converter`'s mental-math
FAQ said multiplying psi by about 0.069 gives bar "about 0.08% low," when the correct direction is
*high* (0.069 > the exact 0.0689475729…, confirmed by direct computation); and
`kilocalories-to-kilojoules-converter`'s logScale benchmark rounded "80 kcal" to "335 kJ" instead of
the correct 334.7 kJ (80 × 4.184). Both were fixed in the code before committing, not just noted.

Checked programmatically: 0 duplicate calculator ids; every new page's `related` ids exist with no
self-reference; the only alias collision anywhere in the dataset remains the pre-existing,
out-of-scope `house loan emi calculator`, already on the Parked list, not touched; every new
`seo.title` ≤60 chars (38–56) and `seo.description` ≤160 chars (126–147); 6 FAQs and 5 aliases per
new page. 133 total calculators (128 + 5), 16 categories (unchanged). `npm test` 628/628 (up from
603 after the snapshot update — diff touched only the 5 new ids), lint clean, `npm run build` passes
(162 static pages, up from 157). Spot-checked all 5 new pages plus `/categories/measurements` on a
local dev server (H1 text, the `common-values` table rendering clean decimal figures with no
`Infinity`/`NaN` anywhere on the mpg page, JSON-LD present); killed the server afterward (port 3000
confirmed free).

**What run 6 needs to know**: per the step file's "Planned run breakdown", runs 6+ are the
*lookup-table* converters — a materially different shape than every converter in runs 1–5, since
none of them is a single exact factor through `lib/units.ts`: cooking cups↔grams by ingredient (a
density table, one value per ingredient, each needing its own cited source), shoe size (US/UK/EU,
offset-based with half-size rounding, not a linear factor), ring size (US/UK/EU/diameter-mm,
likewise a lookup), and clothing size (US/UK/EU, gendered, categories differing by garment type).
None fit the `solver`-with-`dimension` pattern; each likely needs a small cited lookup table and
probably a type-B breakdown with a `select` input for "which ingredient/size system." **Proposed
run 6 scope**: just cooking cups↔grams, for 5 common baking ingredients (all-purpose flour, granulated
sugar, butter, rice, milk — or similar, picked for search volume), each density cited to a baking
reference (e.g. King Arthur Baking's or a similarly authoritative flour-weight chart) rather than
derived from a NIST factor; shoe size, ring size and clothing size each need their own run once this
one proves out the lookup-table pattern, since each has its own sizing-system quirks to scope
separately. This run did not start any of them — scope each individually before building.

**2026-10-26 — step 42, Wave 1: conversion, run 6/~13 (cups to grams by ingredient, PR #33).**
The first lookup-table run, a materially different shape from runs 1–5: none of the figures here
are a `lib/units.ts` unit factor, they're an ingredient's empirical density (grams per US cup).
Five pages: `cups-to-grams-converter` (general, type B, a 12-ingredient `<select>` — flour,
granulated/brown/powdered sugar, butter, water, milk, uncooked and cooked rice, oats, cocoa powder,
honey — whose `<option>` value *is* that ingredient's grams-per-cup density, so `compute()` is one
multiplication, `grams = amount × ingredient`, no runtime lookup); `cups-to-grams-flour` (120 g/cup,
spooned-and-leveled; the scooped-flour trap, up to 25% heavier, as the distinguishing content);
`cups-to-grams-sugar` (granulated 198, brown 213 packed, powdered 113 g/cup, compared side by side
in one 4-column table); `cups-to-grams-butter` (226 g/cup = 2 × King Arthur's own 113 g/8-tbsp
figure; a sticks-and-tablespoons table instead of cup fractions, since US butter is sold and marked
in sticks; 4 sticks ≈ 452 g, about 0.35% under the exact 453.59237 g pound — a packaging quirk, not
a unit identity); `cups-to-grams-rice` (185 g/cup uncooked, USDA #169756; the rice page's real find
is that 1 cup of the *same* rice *cooked* is only 158 g per USDA #168878 — less, not more, per cup,
because cooking makes rice fluffier and less densely packed even as the whole rice-plus-water system
gains weight — stated as a watch-out, not glossed over).

**Sourcing, actually fetched, not recalled**: King Arthur Baking Company's published Ingredient
Weight Chart (`kingarthurbaking.com/learn/ingredient-weight-chart`) for the baking ingredients;
USDA FoodData Central for rice raw (#169756) and cooked (#168878), milk (#171265) and honey
(#169640), which King Arthur's chart does not cover. Every figure lives in one new, typed,
cited table, `lib/ingredients.ts`'s `INGREDIENT_DENSITIES` — every page reads it by `id`, never
retypes a density. Bread flour deliberately has no row of its own: King Arthur gives it the
identical 120 g/cup figure as all-purpose flour (same method), and a duplicate density would be a
real bug in the general page's `<select>`, whose options are keyed by that numeric value
(`components/CalculatorWidget.tsx`'s `ChoiceRow` uses `option.value` as the React key and the
native `<option value>`) — two options sharing a value would make the browser unable to distinguish
them. Caught by a new permanent test (`lib/ingredients.spec.ts`) asserting every density is
distinct, not just by manual inspection.

**Kit addition: `content.referenceTable`** (`data/calculators/types.ts`,
`components/ReferenceTableSection.tsx`, wired into `app/[locale]/calculators/[slug]/page.tsx`'s
`tocItems` and render list, plus a `reference-table` entry in `lib/categoryTheme.ts`'s
`SECTION_THEME`). `content.commonValues` was evaluated first and rejected for this run's numbers:
it's built around a `UnitDimension` and two `lib/units.ts` unit ids, and a cooking ingredient's
density isn't a NIST unit factor, so forcing it through `commonValues` would have meant inventing a
fake "unit" per ingredient. `referenceTable` is deliberately generic and parallel — `{ title,
columns, rows: { label, values }[], decimals?, note? }` — covering both this run's table shapes
(a per-ingredient comparison on the general page; a per-cup-amount breakdown for one ingredient on
each dedicated page) with the same component, and it does not touch `commonValues`'s type,
renderer or existing 25-page test at all. Every `values` entry is a computed expression in the data
file itself (a density × a cup amount, or a real `lib/units.ts` mass conversion from grams to
ounces) — several of the tables are generated with `.map()` directly over `INGREDIENT_DENSITIES` or
a small shared `CUP_AMOUNTS` list in `measurements.ts`, so there is no hand-typed row at all for
most of this run's tables.

**Verification**: every copy figure (62 values across the 5 example lines, worked examples, FAQ
answers, logScale benchmarks and watch-outs) recomputed independently in a scratchpad script
(`verify_run6.mjs`, no app imports, the same NIST ounce/pound constants and the shared density
table hand-copied once for cross-checking) *before* any of it was committed — 61 formal assertions,
0 failures on the first run once the copy was written (an earlier arithmetic slip while exploring
the numbers by hand — writing "4 sticks of butter" as 226 × 4 instead of 2 cups × 226 — was caught
by the script before it ever reached a draft of the copy). A second scratch script
(`check_run6.mjs`, imports the real `data/calculators` module to check structure, not numbers)
confirmed 0 duplicate ids, 0 new duplicate alias collisions (only the pre-existing, out-of-scope
`house loan emi calculator` remains), every `related` id exists with no self-reference, and every
`seo.title`/`seo.description` within budget — it caught `cups-to-grams-flour`'s `seo.description`
at 169 characters (over the 160 limit), shortened to 155 before committing. 138 total calculators
(133 + 5), 16 categories (unchanged). `npm test` 639/639 (up from 628, snapshot diff touches only
the 5 new ids), lint clean, `npm run build` passes (167 static pages, up from 162). Spot-checked
all 5 new pages plus `/categories/measurements` on a local dev server — H1s, the `reference-table`
section rendering (distinct from, and alongside the precedent of, `common-values` on other pages),
the general page's ingredient `<select>` showing all 12 options with distinct values and flour
pre-selected, JSON-LD present; killed the server afterward (port 3000 confirmed free). Branch
`step/42-wave-1-conversion-run-6`, PR #33.

**Wave 2 dedupe**: `mdFiles/calculator-rollout-plan.md` §4's Wave 2 food list includes "cups to
grams" (row 43–45) — it is now fully delivered by this run (the general converter plus flour,
sugar, butter and rice). Wave 2 must not rebuild it; noted on row 43–45 above.

**What run 7 needs to know**: a concrete, scoped proposal for the next lookup-table run — shoe
size (US/UK/EU/foot length) — is written into `mdFiles/steps/42-wave-1-conversion.md`'s "Run 7
proposal" section, not built. Unlike this run's simple density multiplication, shoe sizing is an
offset-based numbering system that differs by region and sex, and the exact constants (e.g. the
EU/Paris-point formula, the US men's/women's offset) need to be checked against a named sizing
authority before any number goes into copy, not assumed from memory. Ring size and clothing size
remain separate, later runs. Full writeup, every design decision and the dedicated-page split
rationale: `mdFiles/steps/42-wave-1-conversion.md`, "Run 6" section.

**2026-10-26 — step 42, Wave 1: conversion, run 7/~13 (shoe sizes, PR #34, merged, incl. a
pre-merge review fix).** Shipped between this log's run 6 and run 8 entries (its own prose entry
was not added to this section at the time — see the row 40–42 table cell above and
`mdFiles/steps/42-wave-1-conversion.md`, "Run 7", for the full writeup). In short: the first
offset-based (non-density) lookup-table run, `lib/shoeSizes.ts` + 4 calculators
(`shoe-size-converter`, `mens-/womens-/kids-shoe-size-chart`). A pre-merge review found the first
draft's headline numbers used the theoretical ISO 19407 formula, which sits noticeably below real
shoe brands' own charts (about 7.5 mm short and 1.3 EU sizes small at a US men's 9) — rebuilt around
adidas's own published chart (fetched directly) as the headline convention, Nike's own chart as a
second-brand cross-check, ISO 19407 kept only as the explained secondary concept. 142 calculators,
16 categories after this run.

**2026-10-29 — step 42, Wave 1: conversion, run 8/~14 (ring sizes, PR #35).** A second
officially-defined-standard lookup run (unlike run 7's theory-vs-retail gap, every formula here
*is* the real standard, each one checked against a real jeweler's own chart, not a theory needing
replacement). New `lib/ringSizes.ts`: **EU/ISO 8653:2016** (the size number IS the inner
circumference in mm, by the standard's own definition); **US/Canada** (the North America formula,
`circumference = 2.55 × size + 36.5`, from the 1921 Bureau of Standards circular via Wikipedia,
checked against Angara's own published chart within 0.5 mm at every size 3–13); **UK/Ireland/
Australia** (British Standard 6820:1987's own definition — one full letter is 1.25 mm of
circumference, ring size C sits at exactly 40 mm — checked against Goldsmiths' own published chart:
22 of 26 letters A–Z match exactly, the other 4 off by only one half-letter, consistent with
Goldsmiths' own 1-decimal rounding, not a real disagreement). Angara's own US-to-UK conversion
column runs about half a letter different from the British-Standard figure throughout — a real,
documented difference between two real charts, named in a watch-out on both pages, with the UK's
own Standard (validated almost exactly against a real UK chart) used as the primary figure.

**Kit addition: `BreakdownOutput.labels`** (`data/calculators/types.ts`, `lib/breakdown.ts`). A UK
ring letter ("N½") is not a number, and `compute()` can only return `Record<string, number>` — this
adds a fixed value→label lookup an output can carry, mirroring a `CalculatorInput`'s own `options`
but for an output. `compute()` still returns the letter's numeric index (a UK index 0–50), so
`NaN`/finite checks are completely unchanged; `formatOutput` looks the value up in `labels` for
display when present, falling back to a plain number otherwise. No existing calculator or output is
touched by this addition.

Two calculators: `ring-size-converter` (general, type B — a raw inner diameter or circumference in
mm via a `measureBy` selector, fixed/inherently-distinct codes per the run 6 Parked lesson;
circumference is coded 0, the default, so the snapshot test harness's 1.5×-scaled "typical" input
leaves the selector unchanged instead of landing on an invalid code — the same reason
`lib/shoeSizes.ts`'s `CATEGORY_CODE.mens` is 0 — outputs US/UK/EU/diameter/circumference, plus a
26-row UK-A–Z reference table) and `us-to-uk-ring-size-chart` (a known US/Canada size in, UK size as
the headline via the new `labels` lookup — this page's whole point — plus a US-3–13-keyed reference
table whose rows are labeled `"US n = UK letter"` in the row label text, since a UK letter can't be
a numeric `values` column the way the general page's UK-letter-keyed table can use it as a row
label instead). Two candidates ("ring size by circumference", "ring size by diameter") were skipped
as near-duplicates of the general page's own `measureBy` selector; a dedicated EU/ISO chart was
also skipped, since EU/ISO size is already a one-line fact (the circumference itself) fully covered
on the general page — all recorded in the step file rather than built, per run 7's "fewer is fine"
precedent.

**Sourcing, actually fetched, not recalled**: Wikipedia's "Ring size" article as **raw wikitext**
(the same lesson as run 7 — read line by line via `curl`, not an AI-summarized fetch) for ISO
8653:2016's definition, British Standard 6820:1987's definition and the North America formula;
Goldsmiths' and Angara's own published ring-size charts, fetched directly, as the two real-jeweler
cross-checks; Ken Walker Jewelers' "How Ring Width Affects Sizing" for the wide-band ("a quarter to
half size larger" at 6 mm+, "a half-size larger" at 7 mm+) and finger-swelling-through-the-day
watch-outs, both quoted directly rather than paraphrased from memory. brilliance.com (403),
jamesallen.com (redirected to an unrelated page), stuller.com (404), bluenile.com and
gemsociety.org (fetched content had no usable table) and brilliantearth.com (404) were attempted
and swapped for a working source rather than retried, per the no-retry-loops rule.

**Verification**: every copy figure (the worked examples, FAQ answers, the reference-table rows,
and the specific "22 of 26 letters match" and "within 0.5 mm" cross-check claims made in the
concept/watch-out copy) independently re-derived from scratch in `verify_run8.mjs` (no app
imports) before committing — 0 failures. `check_run8.mjs` (imports the real `data/calculators`
module to check structure, not numbers) confirmed 0 duplicate ids, 0 new duplicate aliases (only
the pre-existing, out-of-scope `house loan emi calculator` collision remains, unchanged), every
`related` id exists with no self-reference, and every `seo.title`/`seo.description`/FAQ count
within budget. One real bug caught before committing, not after: the general converter's first
draft defaulted `measureBy` to the circumference code (1 at the time), which the snapshot test
harness's "typical" input (1.5× every default) scaled to an invalid option code (2), which in turn
made the default `measurement` (54 mm, scaled to 81 mm) fall outside the UK A–Z range regardless —
fixed by making circumference code 0 (so it survives the 1.5× scaling unchanged) and lowering the
default measurement to 40 mm (British Standard 6820:1987's own cited UK-C baseline, so 1.5× stays
inside the UK A–Z window too). 144 calculators (142 + 2), 15 categories (unchanged). `npm test`
742/742 (up from 692, snapshot diff adds only the 2 new ids, plus 2 new `KNOWN_NON_FINITE` entries
for the now-understood, legitimate edge cases), `npm run build` passes (173 static pages, up from
171), lint clean. Spot-checked both new pages plus `/categories/measurements` on a local dev
server — H1s, every section id, JSON-LD present, and specifically that the UK output renders as the
letter "C" (not a number) on the general page's default and the chart page's headline renders
"N½"; killed the server afterward (port 3000 confirmed free). Branch
`step/42-wave-1-conversion-run-8`, PR #35.

**What the next run needs to know**: a concrete, narrowly-scoped "Run 9 proposal" (clothing
sizes — recommending only systems with a real defined standard, such as a US/UK/EU women's dress
size correspondence or a men's collar size in inches, and recommending *against* a generic
S/M/L-to-number page, since no single authority defines that across brands, unlike every system
run 7 and run 8 used) is written into `mdFiles/steps/42-wave-1-conversion.md`, not built. The
`BreakdownOutput.labels` kit addition from this run is available for any future calculator whose
natural output is a fixed code rather than a continuous number (a letter grade, a size label, etc.) —
check for it before inventing a parallel mechanism.


step 40–42 · 2026-10-29 · **Closed.** Run 8 (ring sizes, PR #35) merged after review (table matches standard jeweler charts: US 7 = UK N½ = EU 54 = 17.3 mm). The user decided **not** to build clothing sizes (the run-9 proposal) — Wave 1 conversion ends at run 8, and the `Run 9 proposal` section in `mdFiles/steps/42-wave-1-conversion.md` is kept only as a record. Next step: **43–45, Wave 2** (construction · food · sports) — no step file yet; write `mdFiles/steps/43-wave-2-construction.md` (or similar) just-in-time from `mdFiles/calculator-rollout-plan.md` §4. Remember the food list's "cups to grams" is already delivered (step 42 run 6).


docs · 2026-10-29 · **Post-Wave-1 doc refresh (no code).** `mdFiles/calculator-template-v2.md` is marked adopted and gains §2 "Conversion and lookup pages" (pair/general converter pattern, overlap rule, `commonValues`, `referenceTable`, `BreakdownOutput.labels`, cited lookup modules, select options keyed by id/code, real charts over theoretical formulas) and §3 review lessons (compute every % claim exactly, don't overgeneralize, read sources directly). `.claude/skills/add-calculator/SKILL.md` and `.claude/agents/calculator-builder.md` now point at those sections and give the full test/build/lint command. `mdFiles/calculator-rollout-plan.md` §4 records Wave 1 as done, clothing size dropped and cups to grams already delivered.

ux-01 · 2026-10-31 · **Homepage + footer redesign — DONE, PR #38 (draft, ready for review).**
Approved "Option A" hero + "Navy footer" design, off the numbered step sequence. Branch
`ux/homepage-redesign`. Hero rebuilt (`app/[locale]/page.tsx`): centered eyebrow/H1 ("What do you
want to calculate?")/subtitle (count derived from `calculators.length`, never a literal), pill
search, "Try:" row of 4 short-label links (hardcoded short labels per the approved copy, but each
still points at the real calculator id — see the step file's D-UX1-3). `CalculatorSearch.tsx`
(confirmed homepage-only, not reused anywhere else) rebuilt: empty query shows nothing (removed
the old default 6-calculator grid), typing shows an absolutely-positioned overlay dropdown (max 8)
or a "No calculators match" message, Escape clears/closes. New "Browse by category" grid
(IconTile md + title + a new `common.calculators` ICU plural + "All calculators ›" link) replaces
`CategoryGrid.tsx`, confirmed unused everywhere and deleted. New bento "Popular calculators"
section: one large green-gradient feature card (mortgage, inline-gradient style matching
`IconTile`'s own convention) + 4 small cards tinted by `categoryTheme(category).color` (pink/red/
purple/orange, light mode only — dark mode falls back to the site's usual dark card surface
rather than a second colored dark system), with unit/currency-neutral worked examples only
(miles→km, percentage; BMI/sales-tax show their description instead, per the region rule). The
"Helpful pages" section is removed entirely; FAQ and the collapsible SEO section are unchanged.
Footer (`components/Footer.tsx`, site-wide via `layout.tsx`) rebuilt with a fixed navy `#0B2545`
background (same in light/dark by design, the one section that deliberately does **not** have
`dark:` classes), a `#0066CC` suggestion banner, 3 columns (brand+blurb / all 16 categories with
small `IconTile`s, driven from `data/calculators`, never a hardcoded list / company links), and a
bottom bar with a build-time-computed `{year}` (static build, no request-time read). `messages/
en.json`'s `home`, `search`, `common` and `footer` namespaces updated; the old `footer` keys
(`tagline`, `suggestLink`, `about`, `contact`, `privacy`, `terms`) were deleted after confirming
by grep they were used nowhere else. `npm test` 742/742 (unchanged — no calculator data
touched), `npm run build` passes (173 static pages, unchanged), lint clean once two pre-existing
out-of-scope artifact dirs are excluded (`.open-next/`, the old `.claude/worktrees/
agent-a0c418cb814f507e7` — both already named in this file's Parked list, not introduced by this
step). Metadata/canonical/JSON-LD on the homepage reconfirmed byte-identical via the rendered
HTML (title, description, canonical, `WebSite` JSON-LD). **Surprise/limitation**: Claude in
Chrome was not connected in this sandbox, so the 390px-width/dark-mode check is a code-level
review (every new grid uses `auto-fill`/`auto-fit` + `minmax`, which cannot overflow its
container) plus the rendered HTML + compiled CSS, not an actual screenshot — worth a quick visual
pass before merging if a browser is available. Full writeup, decisions (D-UX1-1..5) and the
Progress checklist: `mdFiles/steps/ux-01-homepage-redesign.md`.

ux-02 · 2026-10-31 · **Calculator intro card, "How it works" diagram — DONE, PR #41 (ready for
review).** Off the numbered sequence. Branch `ux/calculator-intro-diagram`. Replaces the plain grey
intro card in the `aside` panel on v2 calculator pages (`app/[locale]/calculators/[slug]/page.tsx`)
with an automatic inputs -> output diagram, generated from calculator data with no per-calculator
hand work. New `lib/howItWorks.ts` (`buildFlow`, `describeFlow`, `joinAnd`, unit-tested in
`lib/howItWorks.spec.ts`): for a solver calculator, output = the `solver.defaultTarget` variable,
inputs = every other variable (fixed ones included — they're real inputs, just never the auto
field), `solveAny` = true whenever more than one non-fixed variable exists (confirmed in
`lib/solverState.ts`: `order` rotates across every non-fixed variable, so any of them can become the
target). **Pair converters (miles-to-kilometers-converter etc.) are themselves 2-variable solvers**,
so they get `solveAny: true` too — correct, since either field really can be entered. For a
breakdown (type B) calculator, it reuses `evaluateBreakdown`/`resolveBreakdown` from
`lib/breakdown.ts` directly on the defaults, so the card's output label can never disagree with the
widget; inputs are the input fields' own labels, no symbols, `solveAny` always false. The 6 special-
widget slugs (currency-converter, character-counter, hashtag-counter, pomodoro-timer,
timezone-meeting-planner, scientific-calculator) return `null` — the card falls back to description
+ tags + trust row only. New `components/HowItWorksCard.tsx`: input "pills" (fixed `h-9`/36px so the
SVG connector's geometry is exact math, not a DOM measurement) in a `flex-1 min-w-0` column, an
`aria-hidden` inline-SVG bezier connector (one curve per pill converging on the pill column's own
vertical center — because the pill column and the SVG are the same height and sit in the same
`items-center` row as the output box, that center line is also the output box's center, for free,
no JS layout pass needed), an output box with the category gradient (`categoryTheme` +
`TILE_COLORS`), more than 5 inputs shows the first 4 + a "+N more" pill (freelancer-rate-calculator,
7 variables -> 6 inputs, is the shipped test case), and a `sr-only` sentence describing the diagram
for screen readers. "Also called" aliases now render as tags (reusing the same `calculator.aliases`
slice `buildAliasSentence` already uses) instead of a sentence, and a new compact trust row (byline
text first, then a check icon + "Reviewed {date}", then a book icon + "{n} source(s)" linking to
`#references`) replaces the old one-line byline/reviewed paragraph. All new strings are new keys
under the existing `calculator` namespace in `messages/en.json` (`howItWorksLabel`,
`orSolveAnyField`, `alsoCalledLabel`, `moreInputs`, `reviewed`, `sources` — ICU plural, same pattern
as `common.tools` — `diagramSummary`), built with `t()` in `page.tsx` and passed down as plain
strings/primitives — `HowItWorksCard` itself takes no translator, matching the existing convention
(`page.tsx` already builds `aliasSentence`/`reviewedDate` the same way). The header fallback
(`tocItems ? null : intro`) is untouched and still uses the old plain intro; it is unreachable today
since all 144 calculators now have `content` (verified before starting), so not worth touching in
this step. **Two real bugs found and fixed during the visual check, both now baked into the
component/page, not left as follow-ups**: (1) the symbol slot was a fixed `w-[14px]`, which clipped
and visually overlapped the label for any multi-character symbol (mortgage-calculator's "APR",
miles-to-kilometers-converter's "mi") — changed to `min-w-[14px]` so it grows instead of clipping.
(2) the calculator page's grid (`<div className="grid gap-6 lg:grid-cols-...">`) had no column
template at all below `lg:`, so a grid item's default `min-width: auto` let a non-wrapping (`truncate`
intentionally keeps pills to one line) pill label with no room to shrink force the *entire page* into
horizontal overflow at phone width — only surfaced by freelancer-rate-calculator's long labels
("Self-employment + income tax rate"); fixed with an explicit `grid-cols-1` (Tailwind's
`minmax(0,1fr)`) at the base breakpoint, matching what the `lg:` override already did implicitly via
its own `minmax(0, ...)` track sizes. `npm test` adds `lib/howItWorks.spec.ts` (9 new tests, 742 -> 751,
all green), lint clean
(`--ignore-pattern ".open-next/**" --ignore-pattern ".claude/**"`), `npm run build` passes (173
static pages, unchanged — a visual change, not a new page). Visually checked desktop (1280px) and
phone (390px, via a local iframe HTML file) and dark mode (`--force-dark-mode
--enable-features=WebContentsForceDark --force-prefers-color-scheme=dark`, the only headless-Chrome
flag combination found to actually flip `prefers-color-scheme` for this Chrome build — plain
`--force-prefers-color-scheme=dark` alone and `--blink-settings=preferredColorScheme=1` alone both
left `matchMedia` reporting `false`, verified with a minimal test page before trusting a real
screenshot) on mortgage-calculator, bmi-calculator, miles-to-kilometers-converter,
standard-deviation-calculator, freelancer-rate-calculator and currency-converter (the special-widget
fallback). Full writeup and Progress checklist: `mdFiles/steps/ux-02-calculator-intro-diagram.md`.

