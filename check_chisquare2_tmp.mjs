import { chiSquareSF } from './lib/distributions.ts';

// Exact closed form for even df=2k: SF(x) = exp(-x/2) * sum_{i=0}^{k-1} (x/2)^i / i!
function exactEvenDfSF(x, k) {
  const h = x / 2;
  let term = 1; // (x/2)^0 / 0!
  let sum = term;
  for (let i = 1; i < k; i++) {
    term *= h / i;
    sum += term;
  }
  return Math.exp(-h) * sum;
}

const cases = [
  [100, 10], [50, 10], [20, 10], [3.841459, 2], [18.307038, 10],
  [1000, 900].map ? null : null
];

for (const [x, df] of [[100,10],[50,10],[20,10],[18.307038,10],[500,10],[2000,10]]) {
  const exact = exactEvenDfSF(x, df/2);
  const got = chiSquareSF(x, df);
  const rel = Math.abs(got-exact)/Math.abs(exact);
  console.log(`x=${x} df=${df}: got=${got} exact=${exact} rel=${rel}`);
}

// large df even check (goodness of fit scenario)
for (const [x, df] of [[1000,900],[1100,998],[2000,998]]) {
  const exact = exactEvenDfSF(x, df/2);
  const got = chiSquareSF(x, df);
  const rel = Math.abs(got-exact)/Math.abs(exact);
  console.log(`x=${x} df=${df}: got=${got} exact=${exact} rel=${rel}`);
}
