// Molar masses of common molecular-biology buffer/lab reagents, computed from each compound's
// elemental formula via the same molarMassOf()/ELEMENTS table molar-mass-calculator already uses
// (lib/atomicMasses.ts, IUPAC/CIAAW standard atomic weights) — not typed as literals, so every
// figure here is a real expression over that shared, cited table (template §2, "every cell is an
// expression over a shared module, never a literal"). Used by molarity-for-buffers-calculator's
// reference table. Formulas are each compound's standard neutral/hydrate formula (common knowledge
// chemistry, the same kind of fact molar-mass-calculator's own worked examples use for NaCl/glucose).
import { ELEMENTS, molarMassOf } from './atomicMasses.ts';

const mass = (symbol: string) => ELEMENTS.find((element) => element.symbol === symbol)!.atomicMass;
const H = mass('H');
const C = mass('C');
const N = mass('N');
const O = mass('O');
const Na = mass('Na');
const Cl = mass('Cl');
const K = mass('K');
const S = mass('S');
const P = mass('P');

const formula = (counts: { atomicMass: number; count: number }[]) => molarMassOf(counts);

export type LabReagent = { name: string; formula: string; molarMass: number };

export const LAB_REAGENTS: LabReagent[] = [
  { name: 'Sodium chloride (NaCl)', formula: 'NaCl', molarMass: formula([{ atomicMass: Na, count: 1 }, { atomicMass: Cl, count: 1 }]) },
  { name: 'Potassium chloride (KCl)', formula: 'KCl', molarMass: formula([{ atomicMass: K, count: 1 }, { atomicMass: Cl, count: 1 }]) },
  {
    name: 'Tris base (tris(hydroxymethyl)aminomethane)',
    formula: 'C4H11NO3',
    molarMass: formula([{ atomicMass: C, count: 4 }, { atomicMass: H, count: 11 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 3 }])
  },
  {
    name: 'Tris hydrochloride (Tris-HCl)',
    formula: 'C4H11NO3·HCl',
    molarMass: formula([
      { atomicMass: C, count: 4 },
      { atomicMass: H, count: 12 },
      { atomicMass: N, count: 1 },
      { atomicMass: O, count: 3 },
      { atomicMass: Cl, count: 1 }
    ])
  },
  { name: 'Glycine', formula: 'C2H5NO2', molarMass: formula([{ atomicMass: C, count: 2 }, { atomicMass: H, count: 5 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 2 }]) },
  {
    name: 'EDTA disodium dihydrate',
    formula: 'C10H14N2Na2O8·2H2O',
    molarMass: formula([
      { atomicMass: C, count: 10 },
      { atomicMass: H, count: 18 },
      { atomicMass: N, count: 2 },
      { atomicMass: Na, count: 2 },
      { atomicMass: O, count: 10 }
    ])
  },
  {
    name: 'Sodium dodecyl sulfate (SDS)',
    formula: 'C12H25NaO4S',
    molarMass: formula([
      { atomicMass: C, count: 12 },
      { atomicMass: H, count: 25 },
      { atomicMass: Na, count: 1 },
      { atomicMass: O, count: 4 },
      { atomicMass: S, count: 1 }
    ])
  },
  {
    name: 'Sodium phosphate monobasic monohydrate',
    formula: 'NaH2PO4·H2O',
    molarMass: formula([{ atomicMass: Na, count: 1 }, { atomicMass: H, count: 4 }, { atomicMass: P, count: 1 }, { atomicMass: O, count: 5 }])
  },
  {
    name: 'Sodium acetate (anhydrous)',
    formula: 'C2H3NaO2',
    molarMass: formula([{ atomicMass: C, count: 2 }, { atomicMass: H, count: 3 }, { atomicMass: Na, count: 1 }, { atomicMass: O, count: 2 }])
  },
  {
    name: 'Glucose (dextrose)',
    formula: 'C6H12O6',
    molarMass: formula([{ atomicMass: C, count: 6 }, { atomicMass: H, count: 12 }, { atomicMass: O, count: 6 }])
  }
];
