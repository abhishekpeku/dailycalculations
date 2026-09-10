export type SearchableCalculator = {
  id: string;
  title: string;
  description: string;
  aliases: string[];
};

const includesCaseInsensitive = (text: string, query: string) => text.toLowerCase().includes(query.toLowerCase());

// Shared by the homepage search box and the listing-page browser so alias matching
// cannot drift apart between the two.
export function matchesQuery(item: SearchableCalculator, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return true;
  return (
    includesCaseInsensitive(item.title, trimmed) ||
    includesCaseInsensitive(item.description, trimmed) ||
    // Aliases are why "emi" or "home loan" finds the mortgage calculator.
    item.aliases.some((alias) => includesCaseInsensitive(alias, trimmed))
  );
}

export type ListingParams = { q: string; category: string };

// Pure so the URL contract can be tested without a browser. `search` is a raw
// `location.search` string, with or without the leading '?'.
export function parseListingParams(search: string): ListingParams {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return {
    q: (params.get('q') ?? '').trim(),
    category: (params.get('category') ?? '').trim()
  };
}

// Omits empty keys, so the cleared state is a bare `/calculators` with no '?'.
export function buildListingSearch({ q, category }: ListingParams) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (category) params.set('category', category);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}
