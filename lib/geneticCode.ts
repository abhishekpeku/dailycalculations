// The standard genetic code (NCBI genetic code table 1 / "the Standard Code"), the near-universal
// mapping used by the vast majority of nuclear genomes. Source: NCBI, "The Genetic Codes"
// (https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi?mode=c#SG1), fetched directly, 2026-11-17.
// NCBI publishes the table as four aligned 64-character strings (AAs, Starts, Base1, Base2, Base3);
// reading them position-by-position in that fixed U-C-A-G x U-C-A-G x U-C-A-G order reconstructs every
// codon's assignment exactly. That ordering is reproduced here directly (base1 slowest, base3
// fastest) instead of re-typing NCBI's compact strings, so each row is self-evidently a codon.
//
// `code` (base1 * 16 + base2 * 4 + base3, each base 0=U, 1=C, 2=A, 3=G) is a stable, distinct integer
// used as a `BreakdownOutput.labels` key, the same device `molecular-geometry-calculator` uses for
// its own (bondingPairs, lonePairs)-keyed lookup — see lib/molecularGeometry.ts and
// data/calculators/types.ts's `labels` doc comment.

export type CodonEntry = {
  code: number;
  base1: number;
  base2: number;
  base3: number;
  codon: string; // mRNA codon, e.g. "AUG"
  letter: string; // one-letter amino acid code, or "*" for a stop codon
  abbreviation: string; // three-letter amino acid code, or "Stop"
  name: string; // full amino acid name, or a stop codon's own name
  isStart: boolean; // true only for AUG, the standard initiator codon
  isStop: boolean;
};

const RNA_BASES = ['U', 'C', 'A', 'G'] as const;

/** `CalculatorInput.options` for each codon-position dropdown: value = base code, label = the base letter. */
export const RNA_BASE_OPTIONS: { value: number; label: string }[] = RNA_BASES.map((base, value) => ({ value, label: base }));

// Full amino acid names and three-letter codes follow IUPAC-IUBMB nomenclature.
const AMINO_ACIDS: Record<string, { abbreviation: string; name: string }> = {
  F: { abbreviation: 'Phe', name: 'Phenylalanine' },
  L: { abbreviation: 'Leu', name: 'Leucine' },
  S: { abbreviation: 'Ser', name: 'Serine' },
  Y: { abbreviation: 'Tyr', name: 'Tyrosine' },
  C: { abbreviation: 'Cys', name: 'Cysteine' },
  W: { abbreviation: 'Trp', name: 'Tryptophan' },
  P: { abbreviation: 'Pro', name: 'Proline' },
  H: { abbreviation: 'His', name: 'Histidine' },
  Q: { abbreviation: 'Gln', name: 'Glutamine' },
  R: { abbreviation: 'Arg', name: 'Arginine' },
  I: { abbreviation: 'Ile', name: 'Isoleucine' },
  M: { abbreviation: 'Met', name: 'Methionine' },
  T: { abbreviation: 'Thr', name: 'Threonine' },
  N: { abbreviation: 'Asn', name: 'Asparagine' },
  K: { abbreviation: 'Lys', name: 'Lysine' },
  V: { abbreviation: 'Val', name: 'Valine' },
  A: { abbreviation: 'Ala', name: 'Alanine' },
  D: { abbreviation: 'Asp', name: 'Aspartate' },
  E: { abbreviation: 'Glu', name: 'Glutamate' },
  G: { abbreviation: 'Gly', name: 'Glycine' }
};

// NCBI's "AAs" row for the Standard Code, read 16 bases at a time (one full base1 block): each
// letter is the amino acid for base2 = U,U,U,U,C,C,C,C,A,A,A,A,G,G,G,G crossed with base3 = U,C,A,G.
const AAS_BY_BASE1: string[] = [
  'FFLLSSSSYY**CC*W', // base1 = U
  'LLLLPPPPHHQQRRRR', // base1 = C
  'IIIMTTTTNNKKSSRR', // base1 = A
  'VVVVAAAADDEEGGGG' // base1 = G
];

const ROWS: CodonEntry[] = [];
for (let base1 = 0; base1 < 4; base1 += 1) {
  for (let base2 = 0; base2 < 4; base2 += 1) {
    for (let base3 = 0; base3 < 4; base3 += 1) {
      const letter = AAS_BY_BASE1[base1][base2 * 4 + base3];
      const isStop = letter === '*';
      const code = base1 * 16 + base2 * 4 + base3;
      const codon = `${RNA_BASES[base1]}${RNA_BASES[base2]}${RNA_BASES[base3]}`;
      ROWS.push({
        code,
        base1,
        base2,
        base3,
        codon,
        letter,
        abbreviation: isStop ? 'Stop' : AMINO_ACIDS[letter].abbreviation,
        name: isStop ? 'Stop (translation ends)' : AMINO_ACIDS[letter].name,
        isStart: codon === 'AUG',
        isStop
      });
    }
  }
}

export const GENETIC_CODE_TABLE: CodonEntry[] = ROWS;

export function findCodon(base1: number, base2: number, base3: number): CodonEntry | undefined {
  const b1 = ((Math.round(base1) % 4) + 4) % 4;
  const b2 = ((Math.round(base2) % 4) + 4) % 4;
  const b3 = ((Math.round(base3) % 4) + 4) % 4;
  return GENETIC_CODE_TABLE.find((entry) => entry.base1 === b1 && entry.base2 === b2 && entry.base3 === b3);
}

/** How many codons (out of 64) encode the same amino acid as this one — the genetic code's degeneracy. */
export function degeneracy(letter: string): number {
  return GENETIC_CODE_TABLE.filter((entry) => entry.letter === letter).length;
}

/** `BreakdownOutput.labels`, keyed by `CodonEntry.code`, one array per displayed field. */
export const AMINO_ACID_NAME_LABELS = GENETIC_CODE_TABLE.map((entry) => ({ value: entry.code, label: entry.name }));
export const AMINO_ACID_ABBREVIATION_LABELS = GENETIC_CODE_TABLE.map((entry) => ({ value: entry.code, label: entry.abbreviation }));
export const AMINO_ACID_LETTER_LABELS = GENETIC_CODE_TABLE.map((entry) => ({ value: entry.code, label: entry.letter }));
export const CODON_ROLE_LABELS = GENETIC_CODE_TABLE.map((entry) => ({
  value: entry.code,
  label: entry.isStart ? 'Start codon (initiates translation)' : entry.isStop ? 'Stop codon (ends translation)' : 'Internal codon'
}));
