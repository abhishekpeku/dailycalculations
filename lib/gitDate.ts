import { execSync } from 'node:child_process';

// The sitemap's real "last modified" signal, derived from git history at build time instead of a
// hand-typed `updatedAt` field — confirmed drifting in practice (speed-converter's `updatedAt`
// still read 2026-10-25 after a later edit touched its file on 2026-11-02). File-level, not
// per-calculator: data/calculators/<category>.ts holds every calculator in that category, and git
// has no reliable way to attribute one change inside a 100+ line object back to just that object.
// Works through a GitHub squash-merge too, since it only reads committed history — unlike a git
// hook, which a server-side squash-merge commit would never trigger in the first place.
const cache = new Map<string, Date>();

export function categoryFileLastModified(categoryId: string): Date {
  const cached = cache.get(categoryId);
  if (cached) return cached;

  let result: Date;
  try {
    const iso = execSync(`git log -1 --format=%cI -- data/calculators/${categoryId}.ts`, {
      cwd: process.cwd(),
      encoding: 'utf-8'
    }).trim();
    result = iso ? new Date(iso) : new Date();
  } catch {
    // No git history available (a shallow clone, a non-git build environment) — fall back to
    // "now" rather than fail the build. A slightly-wrong freshness signal beats a broken sitemap.
    result = new Date();
  }

  cache.set(categoryId, result);
  return result;
}
