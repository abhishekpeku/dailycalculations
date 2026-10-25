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

// Total pounds (may be fractional, e.g. from an exact unit conversion) -> "11 st 4 lb". Rounds the
// TOTAL pounds first, then splits, so the pounds part is always 0-13 and can never print as
// "14 lb" (mdFiles/steps/42-wave-1-conversion.md, run 4, "Kit addition: commonValues.stoneLbs") —
// same principle as formatFeetInches above.
export function formatStoneLbs(totalPounds: number) {
  const rounded = Math.round(totalPounds);
  const sign = rounded < 0 ? '-' : '';
  const abs = Math.abs(rounded);
  const stone = Math.floor(abs / 14);
  const lbs = abs % 14;
  return `${sign}${stone} st ${lbs} lb`;
}

// `display` is `true`/`false` for the original feet+inches column (kept for backward compatibility)
// or 'stoneLbs' for a mass column shown as stone + pounds.
type ColumnDisplay = boolean | 'stoneLbs';

export function columnHeader(dimension: UnitDimension, unitId: string, display: ColumnDisplay = false) {
  if (display === 'stoneLbs') return 'st & lb';
  return display ? 'ft & in' : findUnit(dimension, unitId).label;
}

// `value` is already in `unitId` units. When `display` is true, it is re-expressed as total inches
// (via lib/units.ts, so the conversion is exact) and split into feet + inches. When 'stoneLbs', it
// is re-expressed as total pounds and split into stone + pounds, the same way.
export function cellText(value: number, dimension: UnitDimension, unitId: string, decimals: number, display: ColumnDisplay = false) {
  if (display === 'stoneLbs' && dimension === 'mass') return formatStoneLbs(convert(value, dimension, unitId, 'lb'));
  if (display && dimension === 'length') return formatFeetInches(convert(value, dimension, unitId, 'in'));
  return formatDecimal(value, decimals);
}
