// Pure helpers for a calculator page's `content.commonValues` table (mdFiles/steps/42-wave-1-conversion.md).
// Kept separate from the renderer (components/CommonValuesSection.tsx) so they are unit-testable
// without rendering JSX, and reused by the data-integrity test that walks every calculator's table.
import { findUnit, fromBase, toBase, type UnitDimension } from './units.ts';
import { formatDecimal } from './calculator.ts';

export function convert(value: number, dimension: UnitDimension, from: string, to: string) {
  return fromBase(toBase(value, dimension, from), dimension, to);
}

// Total inches (may be fractional, e.g. from an exact unit conversion) -> "5 ft 11 in". Rounds the
// TOTAL inches first, then splits, so the inches part is always 0-11 and can never print as
// "12 in" (mdFiles/steps/42-wave-1-conversion.md, "Feet + inches").
export function formatFeetInches(totalInches: number) {
  const rounded = Math.round(totalInches);
  const sign = rounded < 0 ? '-' : '';
  const abs = Math.abs(rounded);
  const feet = Math.floor(abs / 12);
  const inches = abs % 12;
  return `${sign}${feet} ft ${inches} in`;
}

export function columnHeader(dimension: UnitDimension, unitId: string, asFeetInches = false) {
  return asFeetInches ? 'ft & in' : findUnit(dimension, unitId).label;
}

// `value` is already in `unitId` units. When `asFeetInches`, it is re-expressed as total inches
// (via lib/units.ts, so the conversion is exact) and split into feet + inches for display.
export function cellText(value: number, dimension: UnitDimension, unitId: string, decimals: number, asFeetInches = false) {
  if (asFeetInches && dimension === 'length') return formatFeetInches(convert(value, dimension, unitId, 'in'));
  return formatDecimal(value, decimals);
}
