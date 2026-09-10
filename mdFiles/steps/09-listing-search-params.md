# Step 09 — Listing page search + `?q=` / `?category=`

**Scope (STATUS.md):** Add category filter chips, the search box, and `?q=` / `?category=` params to
`app/[locale]/calculators/page.tsx`. Then either fix or delete the broken `SearchAction` in
`buildHomeJsonLd`. Also clean the homepage `keywords` array — drop `graphing calculator`.

**Spec:** `mdFiles/instructions.md` §4.5 (the listing page dumps all 53 cards at once), §2.7
(sitelinks searchbox is broken), §1.6 (homepage keyword cleanup).

---

## Why

Three separate problems that share one fix.

1. `/calculators` renders 11 category cards + 53 calculator cards with no search and no filter.
   §5 takes the site to ~80 calculators; at that size the page is unusable.
2. `buildHomeJsonLd` promises Google a sitelinks searchbox at `/calculators?q={search_term_string}`.
   The page does not read `q` at all, so the promise is a lie and a Search Console structured-data
   error. Implementing `?q=` makes it true.
3. The `keywords` array claims four tools the site does not have. §1.6: false promises train Google
   that the homepage is a poor match for calculator queries.

---

## The one architectural constraint — read this before writing any code

`/calculators` is `export const dynamic = 'force-static'`. That rules out both obvious approaches:

- **Server-side `searchParams`** — forces the route dynamic. Not an option.
- **`useSearchParams()` in a client component** — legal, but under a statically rendered route Next
  bails the client tree up to the nearest `<Suspense>` boundary out of the prerendered HTML. The
  static `/calculators` HTML would ship the *fallback*, not the cards, and the 53 crawlable internal
  links would disappear from the page Google fetches. **That is the exact opposite of what §4.5 is
  trying to fix.**

So: filtering is client-side, and the URL is read **after** hydration.

- Initial render (server prerender *and* first client render) shows the **full, unfiltered** list.
  The static HTML therefore still contains all 53 calculator links and all 11 category links.
- A `useEffect` on mount reads `window.location.search` and applies `q` / `category`.
- Typing writes the URL back with `window.history.replaceState` — supported by the App Router and
  does not trigger an RSC round-trip on a static page. Do **not** use `router.replace`.
- A `popstate` listener keeps back/forward working.

Because initial render is unfiltered and the effect runs after hydration, there is no hydration
mismatch.

---

## Work

### 1. `lib/search.ts` (new) — the shared matching predicate

`CalculatorSearch` and the new listing component must not carry two copies of the filter, or alias
matching will silently drift apart again (see the step-08 note in STATUS.md).

```ts
export type SearchableCalculator = {
  id: string;
  title: string;
  description: string;
  aliases: string[];
};

export function matchesQuery(item: SearchableCalculator, query: string): boolean
export function parseListingParams(search: string): { q: string; category: string }
```

- `matchesQuery` is the step-08 predicate lifted verbatim: title **or** description **or** any
  alias, case-insensitive substring. Empty/whitespace query matches everything.
- `parseListingParams` takes a raw `location.search` string and returns trimmed values, `''` when
  absent. Pure — it is unit-testable without a browser, which is how the acceptance checks verify
  the URL contract.

### 2. `components/CalculatorSearch.tsx`

Replace the local `fuzzyFilter` with `matchesQuery` from `lib/search`. Behaviour unchanged
(6 shown when empty, 8 max when filtering). No prop changes — the homepage keeps working as is.

### 3. `components/CalculatorCard.tsx` — widen the prop type

The client browser component cannot receive a `CalculatorConfig`: `compute` is a function and does
not survive the RSC serialization boundary. Change the prop to
`Pick<CalculatorConfig, 'id' | 'title' | 'description' | 'category'>`. Every existing call site
already satisfies it — no call site changes, no markup change.

### 4. `components/CalculatorBrowser.tsx` (new, client component)

```
props: {
  calculators: BrowseItem[];        // id, title, description, category, aliases
  categories: { id: string; title: string }[];
  labels: { search, placeholder, filter, all, results, emptyTitle, emptyBody, clear };
}
```

- **Must not import `data/calculators`.** Data arrives as props from the server page; importing it
  would pull all 53 `compute()` bodies and every FAQ string into the client bundle (the same trap
  that cost the middleware +95 KB in step 06).
- Renders, in order: search input → filter chip row → result-count line (`aria-live="polite"`) →
  card grid → empty state.
- Chips are `<button>`s, not links. `?category=` must not become a crawlable faceted URL — the
  category cards above already give Google a real `/categories/<id>` path for every category.
  "All" is the first chip; the active chip carries `aria-pressed`.
- Only render a chip for a category that has at least one calculator.
- Empty state offers a "Clear filters" button.
- URL sync: `q` and `category` written with `history.replaceState`, keys omitted when empty, so the
  clean state is exactly `/calculators` with no query string.

### 5. `app/[locale]/calculators/page.tsx`

Keep everything above the tool grid as it is (hero, category cards). Replace the bare 53-card grid
with `<CalculatorBrowser>`, passing a trimmed item list — `id, title, description, category,
aliases` — and the `{ id, title }` pairs from `categories`. **Pass `aliases`**, or alias matching
silently disappears on this page (step-08 note).

The page stays `force-static` and its `generateMetadata` / canonical are untouched: `?q=` and
`?category=` serve the same document with the same canonical `/calculators`, so Google consolidates
them rather than indexing facets.

### 6. `lib/seo.ts` — the `SearchAction`

**Fix, do not delete.** The `urlTemplate` is already `${SITE_URL}/calculators?q={search_term_string}`
— unprefixed and correct since step 02. Step 09 makes the target real. Verify it contains no `/en/`
and that `q` is the parameter name the browser component actually reads. No code change expected;
if none is needed, say so in STATUS rather than editing for the sake of it.

### 7. `messages/en.json` — `calculators` namespace

Add: `searchLabel`, `searchPlaceholder`, `filterLabel`, `allCategories`, `resultCount`
(`{count} of {total} calculators`), `emptyTitle`, `emptyBody`, `clearFilters`.

### 8. Keyword cleanup — `app/[locale]/layout.tsx` **and** `app/[locale]/page.tsx`

Both files carry the same 19-term array. Four terms have no page and no alias behind them, audited
against all 53 ids, titles and 201 aliases:

| Term | Verdict |
|---|---|
| `scientific calculator` | drop — arrives in **step 24** |
| `percentage calculator` | drop — arrives in **step 24** |
| `final grade calculator` | drop — arrives in **step 26** |
| `graphing calculator` | drop **permanently** (§1.6: hard build, not worth it) |

The other 15 terms all match a real id, title or alias exactly (`time calculator` matches through
the sleep/bedtime/wake-up cluster). Keep them. Both arrays must end up identical.

---

## Out of scope

- Pagination. Filtering plus 53 cards is fine; revisit past ~120.
- Listing-page JSON-LD (`ItemList`, `BreadcrumbList`) and a visible breadcrumb on `/calculators` —
  parked, and blocked on the step-16 category rename.
- The category restructure itself (step 16). Chips render from whatever `categories` holds today.
- The calculator page template (step 10).
- `updatedAt` is **not** bumped. No calculator data changes.

---

## Acceptance checks

`npm run build` and `npm run lint` pass, still **78** static pages. Then:

1. **Crawl safety — the whole point.** In the prerendered `/calculators` HTML: all **53**
   `/calculators/<id>` links and all **11** `/categories/<id>` links are present, and **0** hrefs
   contain `/en/`. If this drops to a Suspense fallback, the step is wrong.
2. Canonical on `/calculators` is still `https://www.dailycalculations.com/calculators`.
3. `matchesQuery` unit-checked against the real data: `emi` → `mortgage-calculator` (alias),
   `home loan` → `mortgage-calculator`, `mortgage` → the mortgage page, a nonsense string → 0.
4. `parseListingParams` unit-checked: `?q=bmi`, `?category=finance`, both, neither, and URL-encoded
   values (`?q=home%20loan`) all round-trip.
5. Live, on a **free port** — `:3000` is occupied in this environment, use `npx next start -p 3007`
   and read the server log before trusting any check: `/calculators?q=mortgage` renders a filtered
   grid after hydration, `/calculators?category=health` filters to the health tools, and clearing
   the box returns the URL to a bare `/calculators`.
6. Homepage JSON-LD `SearchAction.target.urlTemplate` is
   `https://www.dailycalculations.com/calculators?q={search_term_string}` — no `/en/`, `q` matches
   the param the component reads.
7. Neither `layout.tsx` nor `page.tsx` mentions `graphing calculator`, `scientific calculator`,
   `percentage calculator` or `final grade calculator`; the two arrays are identical and every
   remaining term resolves to a real id, title or alias.
