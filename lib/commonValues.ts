// Pure helpers for a calculator page's `content.commonValues` table (mdFiles/steps/42-wave-1-conversion.md).
// Kept separate from the renderer (components/CommonValuesSection.tsx) so they are unit-testable
// without rendering JSX, and reused by the data-integrity test that walks every calculator's table.
import { findUnit, fromBase, toBase, type UnitDimension } from './units.ts';
import { formatDecimal } from './calculator.ts';

export function convert(value: number, dimension: UnitDimension, from: string, to: string) {
  return fromBase(toBase(value, dimension, from), dimension, to);
}

export function isFeetUnit(dimension: UnitDimension, unitId: string) {
  return dimension === 'length' && unitId === 'ft';
}

// Decimal feet -> "5 ft 11 in". Rounds the TOTAL inches first, then splits, so the inches part is
// always 0-11 and can never print as "12 in" (mdFiles/steps/42-wave-1-conversion.md, "Feet + inches").
export function formatFeetInches(totalFeet: number) {
  const totalInches = Math.round(totalFeet * 12);
  const sign = totalInches < 0 ? '-' : '';
  const absInches = Math.abs(totalInches);
  const feet = Math.floor(absInches / 12);
  const inches = absInches % 12;
  return `${sign}${feet} ft ${inches} in`;
}

export function columnHeader(dimension: UnitDimension, unitId: string) {
  return isFeetUnit(dimension, unitId) ? 'ft & in' : findUnit(dimension, unitId).label;
}

export function cellText(value: number, dimension: UnitDimension, unitId: string, decimals: number) {
  return isFeetUnit(dimension, unitId) ? formatFeetInches(value) : formatDecimal(value, decimals);
}
