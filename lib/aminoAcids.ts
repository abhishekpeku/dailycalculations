// The 20 standard proteinogenic amino acids, with the FREE (unbound) molecule's molar mass computed
// from its standard neutral formula via the same molarMassOf()/ELEMENTS table molar-mass-calculator
// uses (lib/atomicMasses.ts, IUPAC/CIAAW standard atomic weights) — common-knowledge biochemistry
// formulas (the same textbook table any biochemistry reference, e.g. Lehninger's Principles of
// Biochemistry, gives), not typed as literal molar masses. protein-molecular-weight-calculator sums
// these and subtracts one water (H2O) per peptide bond formed, the standard condensation-polymer
// accounting OpenStax Biology 2e §3.4 "Proteins" describes: a peptide bond forms "via a dehydration
// synthesis reaction," releasing one water molecule per bond — so a chain of N residues loses
// (N-1) waters relative to the sum of N free amino acids.
import { ELEMENTS, molarMassOf } from './atomicMasses.ts';

const mass = (symbol: string) => ELEMENTS.find((element) => element.symbol === symbol)!.atomicMass;
const H = mass('H');
const C = mass('C');
const N = mass('N');
const O = mass('O');
const S = mass('S');

export const WATER_MASS = molarMassOf([{ atomicMass: H, count: 2 }, { atomicMass: O, count: 1 }]);

export type AminoAcid = { id: string; name: string; code1: string; formula: string; freeMass: number };

// Free (neutral, zwitterion-equivalent) molecular formula of each standard amino acid.
export const AMINO_ACIDS: AminoAcid[] = [
  { id: 'gly', name: 'Glycine', code1: 'G', formula: 'C2H5NO2', freeMass: molarMassOf([{ atomicMass: C, count: 2 }, { atomicMass: H, count: 5 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 2 }]) },
  { id: 'ala', name: 'Alanine', code1: 'A', formula: 'C3H7NO2', freeMass: molarMassOf([{ atomicMass: C, count: 3 }, { atomicMass: H, count: 7 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 2 }]) },
  { id: 'ser', name: 'Serine', code1: 'S', formula: 'C3H7NO3', freeMass: molarMassOf([{ atomicMass: C, count: 3 }, { atomicMass: H, count: 7 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 3 }]) },
  { id: 'pro', name: 'Proline', code1: 'P', formula: 'C5H9NO2', freeMass: molarMassOf([{ atomicMass: C, count: 5 }, { atomicMass: H, count: 9 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 2 }]) },
  { id: 'val', name: 'Valine', code1: 'V', formula: 'C5H11NO2', freeMass: molarMassOf([{ atomicMass: C, count: 5 }, { atomicMass: H, count: 11 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 2 }]) },
  { id: 'thr', name: 'Threonine', code1: 'T', formula: 'C4H9NO3', freeMass: molarMassOf([{ atomicMass: C, count: 4 }, { atomicMass: H, count: 9 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 3 }]) },
  { id: 'cys', name: 'Cysteine', code1: 'C', formula: 'C3H7NO2S', freeMass: molarMassOf([{ atomicMass: C, count: 3 }, { atomicMass: H, count: 7 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 2 }, { atomicMass: S, count: 1 }]) },
  { id: 'leu', name: 'Leucine', code1: 'L', formula: 'C6H13NO2', freeMass: molarMassOf([{ atomicMass: C, count: 6 }, { atomicMass: H, count: 13 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 2 }]) },
  { id: 'ile', name: 'Isoleucine', code1: 'I', formula: 'C6H13NO2', freeMass: molarMassOf([{ atomicMass: C, count: 6 }, { atomicMass: H, count: 13 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 2 }]) },
  { id: 'asn', name: 'Asparagine', code1: 'N', formula: 'C4H8N2O3', freeMass: molarMassOf([{ atomicMass: C, count: 4 }, { atomicMass: H, count: 8 }, { atomicMass: N, count: 2 }, { atomicMass: O, count: 3 }]) },
  { id: 'asp', name: 'Aspartate', code1: 'D', formula: 'C4H7NO4', freeMass: molarMassOf([{ atomicMass: C, count: 4 }, { atomicMass: H, count: 7 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 4 }]) },
  { id: 'gln', name: 'Glutamine', code1: 'Q', formula: 'C5H10N2O3', freeMass: molarMassOf([{ atomicMass: C, count: 5 }, { atomicMass: H, count: 10 }, { atomicMass: N, count: 2 }, { atomicMass: O, count: 3 }]) },
  { id: 'lys', name: 'Lysine', code1: 'K', formula: 'C6H14N2O2', freeMass: molarMassOf([{ atomicMass: C, count: 6 }, { atomicMass: H, count: 14 }, { atomicMass: N, count: 2 }, { atomicMass: O, count: 2 }]) },
  { id: 'glu', name: 'Glutamate', code1: 'E', formula: 'C5H9NO4', freeMass: molarMassOf([{ atomicMass: C, count: 5 }, { atomicMass: H, count: 9 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 4 }]) },
  { id: 'met', name: 'Methionine', code1: 'M', formula: 'C5H11NO2S', freeMass: molarMassOf([{ atomicMass: C, count: 5 }, { atomicMass: H, count: 11 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 2 }, { atomicMass: S, count: 1 }]) },
  { id: 'his', name: 'Histidine', code1: 'H', formula: 'C6H9N3O2', freeMass: molarMassOf([{ atomicMass: C, count: 6 }, { atomicMass: H, count: 9 }, { atomicMass: N, count: 3 }, { atomicMass: O, count: 2 }]) },
  { id: 'phe', name: 'Phenylalanine', code1: 'F', formula: 'C9H11NO2', freeMass: molarMassOf([{ atomicMass: C, count: 9 }, { atomicMass: H, count: 11 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 2 }]) },
  { id: 'arg', name: 'Arginine', code1: 'R', formula: 'C6H14N4O2', freeMass: molarMassOf([{ atomicMass: C, count: 6 }, { atomicMass: H, count: 14 }, { atomicMass: N, count: 4 }, { atomicMass: O, count: 2 }]) },
  { id: 'tyr', name: 'Tyrosine', code1: 'Y', formula: 'C9H11NO3', freeMass: molarMassOf([{ atomicMass: C, count: 9 }, { atomicMass: H, count: 11 }, { atomicMass: N, count: 1 }, { atomicMass: O, count: 3 }]) },
  { id: 'trp', name: 'Tryptophan', code1: 'W', formula: 'C11H12N2O2', freeMass: molarMassOf([{ atomicMass: C, count: 11 }, { atomicMass: H, count: 12 }, { atomicMass: N, count: 2 }, { atomicMass: O, count: 2 }]) }
];

/** Sum of each residue's free mass minus one water per peptide bond ((N-1) bonds for N residues), plus one water back for the two free termini. Equivalently: sum(residue masses) + one water. 0 residues is undefined (no chain). */
export function proteinMolecularWeight(counts: Record<string, number>): number {
  let totalResidues = 0;
  let sumFreeMass = 0;
  for (const aa of AMINO_ACIDS) {
    const count = counts[aa.id] ?? 0;
    totalResidues += count;
    sumFreeMass += count * aa.freeMass;
  }
  if (totalResidues === 0) return NaN;
  return sumFreeMass - (totalResidues - 1) * WATER_MASS;
}
