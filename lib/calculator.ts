import type { CalculatorConfig, CalculatorInputValues } from '@/data/calculators';

export function evaluateCalculator(calculator: CalculatorConfig, values: CalculatorInputValues) {
  return calculator.compute(values);
}

// Return a compact, human-friendly representation for large numbers
export function formatCurrency(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

// Compact formatting for general numbers (and percentages when combined externally)
export function formatNumber(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
  }).format(value);
}

// Science results: significant figures instead of compact "4.2K", which reads wrong next to a unit
export function formatSignificant(value: number, digits = 4) {
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e9 || abs < 1e-3)) {
    return value.toExponential(digits - 1).replace('e+', ' × 10^').replace('e-', ' × 10^-');
  }

  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: digits
  }).format(value);
}

// Full, non-compact representation for use in tooltips/title attributes
export function formatFull(value: number, opts?: { currency?: boolean }) {
  if (opts?.currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 6
  }).format(value);
}

// Grouped, up to `maxDigits` decimals, never compact: the default for type-B breakdown figures.
export function formatDecimal(value: number, maxDigits = 2) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maxDigits
  }).format(value);
}

// A local calendar date from epoch ms, e.g. "December 6, 2026". Region formatting comes with step 18.
export function formatDate(ms: number) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(ms));
}

// The symbol shown beside currency inputs.
export function currencySymbol() {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value ?? '';
}
