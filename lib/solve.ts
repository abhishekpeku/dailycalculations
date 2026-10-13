// Numeric root finder for solver variables with no closed form (e.g. a loan's interest rate).
// Bracket, then Brent's method; Newton only when no sign change can be found. Deterministic.
// See mdFiles/steps/31-solver-v2.md.

export type RootOptions = {
  /** Search range. Without it the bracket is grown outward from `guess`. */
  bounds?: [number, number];
  /** Where to start; with bounds, the sign change nearest to it wins. */
  guess?: number;
  maxIterations?: number;
};

const GRID = 100;
const TOLERANCE = 1e-12;
const MAX_SPAN = 1e15;

type Bracket = { a: number; b: number; fa: number; fb: number };
// A number is an exact root; null means no sign change was found.
type BracketResult = number | Bracket | null;

const opposite = (x: number, y: number) => (x < 0 && y > 0) || (x > 0 && y < 0);

function scan(f: (x: number) => number, [lo, hi]: [number, number], guess: number): BracketResult {
  const geometric = lo > 0 && hi / lo > 100;
  let best: number | Bracket | null = null;
  let bestDistance = Infinity;
  let previous: { x: number; y: number } | null = null;
  for (let i = 0; i <= GRID; i++) {
    const x = i === GRID ? hi : geometric ? lo * (hi / lo) ** (i / GRID) : lo + ((hi - lo) * i) / GRID;
    const y = f(x);
    if (!Number.isFinite(y)) continue;
    let found: number | Bracket | null = null;
    let at = x;
    if (y === 0) found = x;
    else if (previous && opposite(previous.y, y)) {
      found = { a: previous.x, b: x, fa: previous.y, fb: y };
      at = (previous.x + x) / 2;
    }
    if (found !== null && Math.abs(at - guess) < bestDistance) {
      best = found;
      bestDistance = Math.abs(at - guess);
    }
    previous = { x, y };
  }
  return best;
}

function expand(f: (x: number) => number, guess: number): BracketResult {
  const fg = f(guess);
  if (fg === 0) return guess;
  const scale = Math.max(Math.abs(guess), 1);
  let right = { x: guess, y: fg };
  let left = { x: guess, y: fg };
  for (let step = scale * 0.01; step <= MAX_SPAN * scale; step *= 2) {
    for (const side of [1, -1]) {
      const last = side === 1 ? right : left;
      const x = guess + side * step;
      const y = f(x);
      if (y === 0) return x;
      if (!Number.isFinite(y)) continue;
      if (Number.isFinite(last.y) && opposite(last.y, y)) {
        return side === 1 ? { a: last.x, b: x, fa: last.y, fb: y } : { a: x, b: last.x, fa: y, fb: last.y };
      }
      if (side === 1) right = { x, y };
      else left = { x, y };
    }
  }
  return null;
}

// Brent (1973), as laid out in Numerical Recipes' zbrent.
function brent(f: (x: number) => number, bracket: Bracket, maxIterations: number) {
  let { a, b, fa, fb } = bracket;
  const edge = Math.max(Math.abs(fa), Math.abs(fb));
  let c = b;
  let fc = fb;
  let d = b - a;
  let e = d;
  for (let i = 0; i < maxIterations; i++) {
    if ((fb > 0 && fc > 0) || (fb < 0 && fc < 0)) {
      c = a;
      fc = fa;
      d = b - a;
      e = d;
    }
    if (Math.abs(fc) < Math.abs(fb)) {
      a = b;
      b = c;
      c = a;
      fa = fb;
      fb = fc;
      fc = fa;
    }
    const tol = 2 * Number.EPSILON * Math.abs(b) + 0.5 * TOLERANCE * Math.abs(b);
    const xm = 0.5 * (c - b);
    if (Math.abs(xm) <= tol || fb === 0) break;
    if (Math.abs(e) >= tol && Math.abs(fa) > Math.abs(fb)) {
      const s = fb / fa;
      let p: number;
      let q: number;
      if (a === c) {
        p = 2 * xm * s;
        q = 1 - s;
      } else {
        const qa = fa / fc;
        const r = fb / fc;
        p = s * (2 * xm * qa * (qa - r) - (b - a) * (r - 1));
        q = (qa - 1) * (r - 1) * (s - 1);
      }
      if (p > 0) q = -q;
      p = Math.abs(p);
      if (2 * p < Math.min(3 * xm * q - Math.abs(tol * q), Math.abs(e * q))) {
        e = d;
        d = p / q;
      } else {
        d = xm;
        e = d;
      }
    } else {
      d = xm;
      e = d;
    }
    a = b;
    fa = fb;
    b += Math.abs(d) > tol ? d : xm >= 0 ? tol : -tol;
    fb = f(b);
    if (!Number.isFinite(fb)) return NaN;
  }
  // Converging on a sign change where |f| grew means a pole (like 1/x at 0), not a root.
  return Math.abs(fb) > edge ? NaN : b;
}

function newton(f: (x: number) => number, guess: number, bounds: [number, number] | undefined, maxIterations: number) {
  const scale = Math.abs(f(guess));
  if (!Number.isFinite(scale)) return NaN;
  const inBounds = (x: number) => !bounds || (x >= bounds[0] && x <= bounds[1]);
  let x = guess;
  for (let i = 0; i < maxIterations; i++) {
    const fx = f(x);
    if (!Number.isFinite(fx)) return NaN;
    if (Math.abs(fx) <= TOLERANCE * scale) break;
    const h = 1e-7 * Math.max(Math.abs(x), 1);
    const slope = (f(x + h) - f(x - h)) / (2 * h);
    if (!Number.isFinite(slope) || slope === 0) return NaN;
    x -= fx / slope;
    if (!inBounds(x)) return NaN;
  }
  return Math.abs(f(x)) <= 1e-9 * scale ? x : NaN;
}

/** Returns x where f(x) = 0, or NaN when no root is found (in `bounds`, if given). */
export function findRoot(f: (x: number) => number, options: RootOptions = {}): number {
  const { bounds, maxIterations = 100 } = options;
  if (bounds && !(bounds[0] < bounds[1])) return NaN;
  const guess = options.guess ?? (bounds ? (bounds[0] + bounds[1]) / 2 : 1);
  const bracket = bounds ? scan(f, bounds, guess) : expand(f, guess);
  if (typeof bracket === 'number') return bracket;
  if (bracket) return brent(f, bracket, maxIterations);
  return newton(f, guess, bounds, maxIterations);
}
