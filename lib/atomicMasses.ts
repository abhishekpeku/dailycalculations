// Standard atomic weights (IUPAC/CIAAW values, the Conventional Atomic-Weight set reproduced in
// Wikipedia's "List of elements" sortable table, cross-checked against the commonly cited 4-5
// significant-figure values for each element). Covers the elements that actually show up in
// general-chemistry formulas (water, CO2, NaCl, glucose, CaCO3, and similar), not the full table —
// see mdFiles/steps/46-47-wave-3-physics-chemistry.md, "Chemistry — new category". Units: g/mol.
//
// A `CalculatorInput`'s `options` carries the atomic mass VALUE directly (not an atomic number or
// code), same precedent as lib/resistorColors.ts's digit/multiplier/tolerance bands — every value
// below is already distinct, so there is no lookup collision (see template §2, "Select options are
// keyed by id or code, never by the lookup value itself").

export type Element = { symbol: string; name: string; atomicMass: number };

export const ELEMENTS: Element[] = [
  { symbol: 'H', name: 'Hydrogen', atomicMass: 1.008 },
  { symbol: 'He', name: 'Helium', atomicMass: 4.0026 },
  { symbol: 'Li', name: 'Lithium', atomicMass: 6.94 },
  { symbol: 'Be', name: 'Beryllium', atomicMass: 9.0122 },
  { symbol: 'B', name: 'Boron', atomicMass: 10.81 },
  { symbol: 'C', name: 'Carbon', atomicMass: 12.011 },
  { symbol: 'N', name: 'Nitrogen', atomicMass: 14.007 },
  { symbol: 'O', name: 'Oxygen', atomicMass: 15.999 },
  { symbol: 'F', name: 'Fluorine', atomicMass: 18.998 },
  { symbol: 'Ne', name: 'Neon', atomicMass: 20.18 },
  { symbol: 'Na', name: 'Sodium', atomicMass: 22.99 },
  { symbol: 'Mg', name: 'Magnesium', atomicMass: 24.305 },
  { symbol: 'Al', name: 'Aluminum', atomicMass: 26.982 },
  { symbol: 'Si', name: 'Silicon', atomicMass: 28.085 },
  { symbol: 'P', name: 'Phosphorus', atomicMass: 30.974 },
  { symbol: 'S', name: 'Sulfur', atomicMass: 32.06 },
  { symbol: 'Cl', name: 'Chlorine', atomicMass: 35.45 },
  { symbol: 'Ar', name: 'Argon', atomicMass: 39.95 },
  { symbol: 'K', name: 'Potassium', atomicMass: 39.098 },
  { symbol: 'Ca', name: 'Calcium', atomicMass: 40.078 },
  { symbol: 'Fe', name: 'Iron', atomicMass: 55.845 },
  { symbol: 'Cu', name: 'Copper', atomicMass: 63.546 },
  { symbol: 'Zn', name: 'Zinc', atomicMass: 65.38 },
  { symbol: 'Br', name: 'Bromine', atomicMass: 79.904 },
  { symbol: 'Ag', name: 'Silver', atomicMass: 107.87 },
  { symbol: 'Sn', name: 'Tin', atomicMass: 118.71 },
  { symbol: 'I', name: 'Iodine', atomicMass: 126.9 },
  { symbol: 'Ba', name: 'Barium', atomicMass: 137.33 },
  { symbol: 'Pt', name: 'Platinum', atomicMass: 195.08 },
  { symbol: 'Au', name: 'Gold', atomicMass: 196.97 },
  { symbol: 'Hg', name: 'Mercury', atomicMass: 200.59 },
  { symbol: 'Pb', name: 'Lead', atomicMass: 207.2 },
  { symbol: 'Bi', name: 'Bismuth', atomicMass: 208.98 },
  { symbol: 'U', name: 'Uranium', atomicMass: 238.03 }
];

/** `CalculatorInput.options`: label "Carbon (C)", value = the atomic mass itself, plus a "None" slot (mass 0) for an unused element position. */
export const ELEMENT_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'None' },
  ...ELEMENTS.map((element) => ({ value: element.atomicMass, label: `${element.name} (${element.symbol})` }))
];

export function findElementByMass(atomicMass: number): Element | undefined {
  return ELEMENTS.find((element) => Math.abs(element.atomicMass - atomicMass) < 1e-9);
}

/** Sum of atomicMass x count over up to 4 element slots (a 0 mass, the "None" slot, contributes nothing). */
export function molarMassOf(slots: { atomicMass: number; count: number }[]): number {
  return slots.reduce((total, slot) => total + slot.atomicMass * slot.count, 0);
}
