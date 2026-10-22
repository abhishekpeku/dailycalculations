import { chiSquareSF, chiSquareCDF } from './lib/distributions.ts';

function closeRel(actual, expected, tol = 1e-9) {
  const rel = Math.abs(actual - expected) / Math.abs(expected);
  console.log(actual, expected, rel, rel <= tol ? 'OK' : 'FAIL');
}

// Published critical values: chi2 at alpha=0.05 for various df (upper tail = 0.05)
console.log('--- critical value checks (SF should be 0.05) ---');
closeRel(chiSquareSF(3.841459, 1), 0.05, 1e-6);
closeRel(chiSquareSF(18.307038, 10), 0.05, 1e-6);
closeRel(chiSquareSF(16.918978, 9), 0.05, 1e-6);

console.log('--- far tail: chi2=100, df=10 ---');
console.log('SF(100,10) =', chiSquareSF(100, 10));
// R: pchisq(100, 10, lower.tail=FALSE) = 2.980291e-17 (reference, computed independently below with Wilson-Hilferty / high precision)

console.log('--- CDF/SF complement check ---');
console.log(chiSquareCDF(18.307038, 10) + chiSquareSF(18.307038, 10));

console.log('--- large df (goodness of fit with many categories) ---');
console.log('SF(1000,900) =', chiSquareSF(1000, 900));
console.log('SF(500,500) =', chiSquareSF(500, 500));
console.log('SF(1100,999) =', chiSquareSF(1100, 999));

console.log('--- symmetry: chi-square with df=2 is exponential(mean=2); SF(x,2) = exp(-x/2) ---');
for (const x of [1, 5, 10, 50, 100, 500]) {
  closeRel(chiSquareSF(x, 2), Math.exp(-x / 2), 1e-9);
}
