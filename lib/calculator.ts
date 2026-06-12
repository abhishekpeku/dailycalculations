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
