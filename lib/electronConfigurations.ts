// Ground-state electron configurations for elements 1-108 (hydrogen through hassium), transcribed
// directly from the NIST Atomic Spectra Database's own Ionization Energies tool
// (https://physics.nist.gov/cgi-bin/ASD/ie.pl, "ground configuration" column, fetched directly —
// not an algorithmic Madelung-rule derivation, so the ~20 known exceptions (Cr, Cu, Nb, Mo, Ru, Rh,
// Pd, Ag, La, Ce, Gd, Pt, Au, Ac, Th, Pa, U, Np, Cm, Lr) are simply the real NIST-measured values,
// not a special case to detect. Elements 109-118 are left out: NIST ASD returns "No data are
// available" for that range (fetched directly, 2026-11-09) — they are too short-lived to have a
// measured ground-state configuration, so this calculator's scope stops at element 108.
//
// NIST itself writes some ranges relative to a non-noble-gas "core" (e.g. indium through xenon as
// [Cd] + 5p, thallium through radon as [Hg] + 6p) purely to shorten the printed string. This module
// always expands to the conventional noble-gas-core shorthand instead (the general-chemistry
// textbook convention), which is mathematically identical — just a different, more familiar way of
// splitting the same full configuration.
//
// Within one period, subshells are written by increasing n then increasing subshell type (s before
// p before d before f) — confirmed directly against NIST's own printed strings for chromium
// ("[Ar]3d54s", 3d before 4s) and copper ("[Ar]3d104s", 3d before 4s). A lanthanide or actinide's 4f
// or 5f subshell is still threaded in at the row where it actually fills (after that period's own
// s/p subshells, which a lower period already completed), e.g. uranium's 5f3 appears after 5s²5p⁶
// rather than before — NIST's own historical fill-order convention, not a global numeric (n, l)
// sort. Some general-chemistry textbooks instead write transition-metal configurations in Aufbau
// fill order (4s before 3d) to emphasize which electron moved for the Cr/Cu-type exceptions; both
// orderings describe the exact same configuration, just printed in a different order. See
// content.watchOut on electron-configuration-calculator.

export type Subshell = { n: number; l: 's' | 'p' | 'd' | 'f'; count: number };

type CoreName = 'He' | 'Ne' | 'Ar' | 'Kr' | 'Xe' | 'Rn';

/** Parses a literature-style suffix, e.g. "3d5 4s1" -> [{n:3,l:'d',count:5}, {n:4,l:'s',count:1}]. */
function parseSuffix(suffix: string): Subshell[] {
  if (!suffix.trim()) return [];
  return suffix
    .trim()
    .split(/\s+/)
    .map((token) => {
      const match = /^(\d)([spdf])(\d{1,2})$/.exec(token);
      if (!match) throw new Error(`Bad subshell token "${token}"`);
      return { n: Number(match[1]), l: match[2] as Subshell['l'], count: Number(match[3]) };
    });
}

// The noble gases' own full configurations, built up from each other (NIST ASD, fetched directly).
const NOBLE_GAS_SUFFIX: Record<CoreName, string> = {
  He: '1s2',
  Ne: '2s2 2p6',
  Ar: '3s2 3p6',
  Kr: '3d10 4s2 4p6',
  Xe: '4d10 5s2 5p6',
  Rn: '4f14 5d10 6s2 6p6'
};
const CORE_ORDER: CoreName[] = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'];

function coreShells(core: CoreName | null): Subshell[] {
  if (!core) return [];
  const index = CORE_ORDER.indexOf(core);
  return CORE_ORDER.slice(0, index + 1).flatMap((name) => parseSuffix(NOBLE_GAS_SUFFIX[name]));
}

type RawElement = { z: number; symbol: string; name: string; core: CoreName | null; suffix: string };

// Ground configuration "suffix" (the shells added after `core`), transcribed from NIST ASD's own
// printed ground-configuration column (https://physics.nist.gov/cgi-bin/ASD/ie.pl?spectra=<range>+i,
// fetched directly 2026-11-09, elements H-Hs). Every row's total electron count is asserted to equal
// its own Z in electronConfigurations.spec.ts, which is what actually catches a transcription typo.
const RAW_ELEMENTS: RawElement[] = [
  { z: 1, symbol: 'H', name: 'Hydrogen', core: null, suffix: '1s1' },
  { z: 2, symbol: 'He', name: 'Helium', core: null, suffix: '1s2' },
  { z: 3, symbol: 'Li', name: 'Lithium', core: 'He', suffix: '2s1' },
  { z: 4, symbol: 'Be', name: 'Beryllium', core: 'He', suffix: '2s2' },
  { z: 5, symbol: 'B', name: 'Boron', core: 'He', suffix: '2s2 2p1' },
  { z: 6, symbol: 'C', name: 'Carbon', core: 'He', suffix: '2s2 2p2' },
  { z: 7, symbol: 'N', name: 'Nitrogen', core: 'He', suffix: '2s2 2p3' },
  { z: 8, symbol: 'O', name: 'Oxygen', core: 'He', suffix: '2s2 2p4' },
  { z: 9, symbol: 'F', name: 'Fluorine', core: 'He', suffix: '2s2 2p5' },
  { z: 10, symbol: 'Ne', name: 'Neon', core: 'He', suffix: '2s2 2p6' },
  { z: 11, symbol: 'Na', name: 'Sodium', core: 'Ne', suffix: '3s1' },
  { z: 12, symbol: 'Mg', name: 'Magnesium', core: 'Ne', suffix: '3s2' },
  { z: 13, symbol: 'Al', name: 'Aluminum', core: 'Ne', suffix: '3s2 3p1' },
  { z: 14, symbol: 'Si', name: 'Silicon', core: 'Ne', suffix: '3s2 3p2' },
  { z: 15, symbol: 'P', name: 'Phosphorus', core: 'Ne', suffix: '3s2 3p3' },
  { z: 16, symbol: 'S', name: 'Sulfur', core: 'Ne', suffix: '3s2 3p4' },
  { z: 17, symbol: 'Cl', name: 'Chlorine', core: 'Ne', suffix: '3s2 3p5' },
  { z: 18, symbol: 'Ar', name: 'Argon', core: 'Ne', suffix: '3s2 3p6' },
  { z: 19, symbol: 'K', name: 'Potassium', core: 'Ar', suffix: '4s1' },
  { z: 20, symbol: 'Ca', name: 'Calcium', core: 'Ar', suffix: '4s2' },
  { z: 21, symbol: 'Sc', name: 'Scandium', core: 'Ar', suffix: '3d1 4s2' },
  { z: 22, symbol: 'Ti', name: 'Titanium', core: 'Ar', suffix: '3d2 4s2' },
  { z: 23, symbol: 'V', name: 'Vanadium', core: 'Ar', suffix: '3d3 4s2' },
  { z: 24, symbol: 'Cr', name: 'Chromium', core: 'Ar', suffix: '3d5 4s1' },
  { z: 25, symbol: 'Mn', name: 'Manganese', core: 'Ar', suffix: '3d5 4s2' },
  { z: 26, symbol: 'Fe', name: 'Iron', core: 'Ar', suffix: '3d6 4s2' },
  { z: 27, symbol: 'Co', name: 'Cobalt', core: 'Ar', suffix: '3d7 4s2' },
  { z: 28, symbol: 'Ni', name: 'Nickel', core: 'Ar', suffix: '3d8 4s2' },
  { z: 29, symbol: 'Cu', name: 'Copper', core: 'Ar', suffix: '3d10 4s1' },
  { z: 30, symbol: 'Zn', name: 'Zinc', core: 'Ar', suffix: '3d10 4s2' },
  { z: 31, symbol: 'Ga', name: 'Gallium', core: 'Ar', suffix: '3d10 4s2 4p1' },
  { z: 32, symbol: 'Ge', name: 'Germanium', core: 'Ar', suffix: '3d10 4s2 4p2' },
  { z: 33, symbol: 'As', name: 'Arsenic', core: 'Ar', suffix: '3d10 4s2 4p3' },
  { z: 34, symbol: 'Se', name: 'Selenium', core: 'Ar', suffix: '3d10 4s2 4p4' },
  { z: 35, symbol: 'Br', name: 'Bromine', core: 'Ar', suffix: '3d10 4s2 4p5' },
  { z: 36, symbol: 'Kr', name: 'Krypton', core: 'Ar', suffix: '3d10 4s2 4p6' },
  { z: 37, symbol: 'Rb', name: 'Rubidium', core: 'Kr', suffix: '5s1' },
  { z: 38, symbol: 'Sr', name: 'Strontium', core: 'Kr', suffix: '5s2' },
  { z: 39, symbol: 'Y', name: 'Yttrium', core: 'Kr', suffix: '4d1 5s2' },
  { z: 40, symbol: 'Zr', name: 'Zirconium', core: 'Kr', suffix: '4d2 5s2' },
  { z: 41, symbol: 'Nb', name: 'Niobium', core: 'Kr', suffix: '4d4 5s1' },
  { z: 42, symbol: 'Mo', name: 'Molybdenum', core: 'Kr', suffix: '4d5 5s1' },
  { z: 43, symbol: 'Tc', name: 'Technetium', core: 'Kr', suffix: '4d5 5s2' },
  { z: 44, symbol: 'Ru', name: 'Ruthenium', core: 'Kr', suffix: '4d7 5s1' },
  { z: 45, symbol: 'Rh', name: 'Rhodium', core: 'Kr', suffix: '4d8 5s1' },
  { z: 46, symbol: 'Pd', name: 'Palladium', core: 'Kr', suffix: '4d10' },
  { z: 47, symbol: 'Ag', name: 'Silver', core: 'Kr', suffix: '4d10 5s1' },
  { z: 48, symbol: 'Cd', name: 'Cadmium', core: 'Kr', suffix: '4d10 5s2' },
  { z: 49, symbol: 'In', name: 'Indium', core: 'Kr', suffix: '4d10 5s2 5p1' },
  { z: 50, symbol: 'Sn', name: 'Tin', core: 'Kr', suffix: '4d10 5s2 5p2' },
  { z: 51, symbol: 'Sb', name: 'Antimony', core: 'Kr', suffix: '4d10 5s2 5p3' },
  { z: 52, symbol: 'Te', name: 'Tellurium', core: 'Kr', suffix: '4d10 5s2 5p4' },
  { z: 53, symbol: 'I', name: 'Iodine', core: 'Kr', suffix: '4d10 5s2 5p5' },
  { z: 54, symbol: 'Xe', name: 'Xenon', core: 'Kr', suffix: '4d10 5s2 5p6' },
  { z: 55, symbol: 'Cs', name: 'Cesium', core: 'Xe', suffix: '6s1' },
  { z: 56, symbol: 'Ba', name: 'Barium', core: 'Xe', suffix: '6s2' },
  { z: 57, symbol: 'La', name: 'Lanthanum', core: 'Xe', suffix: '5d1 6s2' },
  { z: 58, symbol: 'Ce', name: 'Cerium', core: 'Xe', suffix: '4f1 5d1 6s2' },
  { z: 59, symbol: 'Pr', name: 'Praseodymium', core: 'Xe', suffix: '4f3 6s2' },
  { z: 60, symbol: 'Nd', name: 'Neodymium', core: 'Xe', suffix: '4f4 6s2' },
  { z: 61, symbol: 'Pm', name: 'Promethium', core: 'Xe', suffix: '4f5 6s2' },
  { z: 62, symbol: 'Sm', name: 'Samarium', core: 'Xe', suffix: '4f6 6s2' },
  { z: 63, symbol: 'Eu', name: 'Europium', core: 'Xe', suffix: '4f7 6s2' },
  { z: 64, symbol: 'Gd', name: 'Gadolinium', core: 'Xe', suffix: '4f7 5d1 6s2' },
  { z: 65, symbol: 'Tb', name: 'Terbium', core: 'Xe', suffix: '4f9 6s2' },
  { z: 66, symbol: 'Dy', name: 'Dysprosium', core: 'Xe', suffix: '4f10 6s2' },
  { z: 67, symbol: 'Ho', name: 'Holmium', core: 'Xe', suffix: '4f11 6s2' },
  { z: 68, symbol: 'Er', name: 'Erbium', core: 'Xe', suffix: '4f12 6s2' },
  { z: 69, symbol: 'Tm', name: 'Thulium', core: 'Xe', suffix: '4f13 6s2' },
  { z: 70, symbol: 'Yb', name: 'Ytterbium', core: 'Xe', suffix: '4f14 6s2' },
  { z: 71, symbol: 'Lu', name: 'Lutetium', core: 'Xe', suffix: '4f14 5d1 6s2' },
  { z: 72, symbol: 'Hf', name: 'Hafnium', core: 'Xe', suffix: '4f14 5d2 6s2' },
  { z: 73, symbol: 'Ta', name: 'Tantalum', core: 'Xe', suffix: '4f14 5d3 6s2' },
  { z: 74, symbol: 'W', name: 'Tungsten', core: 'Xe', suffix: '4f14 5d4 6s2' },
  { z: 75, symbol: 'Re', name: 'Rhenium', core: 'Xe', suffix: '4f14 5d5 6s2' },
  { z: 76, symbol: 'Os', name: 'Osmium', core: 'Xe', suffix: '4f14 5d6 6s2' },
  { z: 77, symbol: 'Ir', name: 'Iridium', core: 'Xe', suffix: '4f14 5d7 6s2' },
  { z: 78, symbol: 'Pt', name: 'Platinum', core: 'Xe', suffix: '4f14 5d9 6s1' },
  { z: 79, symbol: 'Au', name: 'Gold', core: 'Xe', suffix: '4f14 5d10 6s1' },
  { z: 80, symbol: 'Hg', name: 'Mercury', core: 'Xe', suffix: '4f14 5d10 6s2' },
  { z: 81, symbol: 'Tl', name: 'Thallium', core: 'Xe', suffix: '4f14 5d10 6s2 6p1' },
  { z: 82, symbol: 'Pb', name: 'Lead', core: 'Xe', suffix: '4f14 5d10 6s2 6p2' },
  { z: 83, symbol: 'Bi', name: 'Bismuth', core: 'Xe', suffix: '4f14 5d10 6s2 6p3' },
  { z: 84, symbol: 'Po', name: 'Polonium', core: 'Xe', suffix: '4f14 5d10 6s2 6p4' },
  { z: 85, symbol: 'At', name: 'Astatine', core: 'Xe', suffix: '4f14 5d10 6s2 6p5' },
  { z: 86, symbol: 'Rn', name: 'Radon', core: 'Xe', suffix: '4f14 5d10 6s2 6p6' },
  { z: 87, symbol: 'Fr', name: 'Francium', core: 'Rn', suffix: '7s1' },
  { z: 88, symbol: 'Ra', name: 'Radium', core: 'Rn', suffix: '7s2' },
  { z: 89, symbol: 'Ac', name: 'Actinium', core: 'Rn', suffix: '6d1 7s2' },
  { z: 90, symbol: 'Th', name: 'Thorium', core: 'Rn', suffix: '6d2 7s2' },
  { z: 91, symbol: 'Pa', name: 'Protactinium', core: 'Rn', suffix: '5f2 6d1 7s2' },
  { z: 92, symbol: 'U', name: 'Uranium', core: 'Rn', suffix: '5f3 6d1 7s2' },
  { z: 93, symbol: 'Np', name: 'Neptunium', core: 'Rn', suffix: '5f4 6d1 7s2' },
  { z: 94, symbol: 'Pu', name: 'Plutonium', core: 'Rn', suffix: '5f6 7s2' },
  { z: 95, symbol: 'Am', name: 'Americium', core: 'Rn', suffix: '5f7 7s2' },
  { z: 96, symbol: 'Cm', name: 'Curium', core: 'Rn', suffix: '5f7 6d1 7s2' },
  { z: 97, symbol: 'Bk', name: 'Berkelium', core: 'Rn', suffix: '5f9 7s2' },
  { z: 98, symbol: 'Cf', name: 'Californium', core: 'Rn', suffix: '5f10 7s2' },
  { z: 99, symbol: 'Es', name: 'Einsteinium', core: 'Rn', suffix: '5f11 7s2' },
  { z: 100, symbol: 'Fm', name: 'Fermium', core: 'Rn', suffix: '5f12 7s2' },
  { z: 101, symbol: 'Md', name: 'Mendelevium', core: 'Rn', suffix: '5f13 7s2' },
  { z: 102, symbol: 'No', name: 'Nobelium', core: 'Rn', suffix: '5f14 7s2' },
  { z: 103, symbol: 'Lr', name: 'Lawrencium', core: 'Rn', suffix: '5f14 7s2 7p1' },
  { z: 104, symbol: 'Rf', name: 'Rutherfordium', core: 'Rn', suffix: '5f14 6d2 7s2' },
  { z: 105, symbol: 'Db', name: 'Dubnium', core: 'Rn', suffix: '5f14 6d3 7s2' },
  { z: 106, symbol: 'Sg', name: 'Seaborgium', core: 'Rn', suffix: '5f14 6d4 7s2' },
  { z: 107, symbol: 'Bh', name: 'Bohrium', core: 'Rn', suffix: '5f14 6d5 7s2' },
  { z: 108, symbol: 'Hs', name: 'Hassium', core: 'Rn', suffix: '5f14 6d6 7s2' }
];

export type ElementConfig = {
  z: number;
  symbol: string;
  name: string;
  /** Every shell, core included, in increasing-n-then-l order (NIST's own printed order). */
  shells: Subshell[];
  /** The element whose full configuration is this element's noble-gas core, or null below helium. */
  core: CoreName | null;
  coreElectrons: number;
  outerElectrons: number;
  fullConfig: string;
  shorthand: string;
};

// Deliberately NOT re-sorted by (n, l): NIST's own printed order threads 4f through at the point in
// the sequence where the lanthanides actually fill it (after period 5's 5s/5p, which are already
// full in xenon), not at a strict "n=4 before n=5" position. The source order above (core shells in
// CORE_ORDER, then each element's own suffix, both copied straight from NIST) already matches that.
function formatShells(shells: Subshell[]): string {
  return shells.map((shell) => `${shell.n}${shell.l}${shell.count}`).join(' ');
}

export const ELECTRON_CONFIGS: ElementConfig[] = RAW_ELEMENTS.map((raw) => {
  const suffixShells = parseSuffix(raw.suffix);
  const shells = [...coreShells(raw.core), ...suffixShells];
  const coreElectrons = raw.core ? CORE_ORDER.slice(0, CORE_ORDER.indexOf(raw.core) + 1).reduce((sum, name) => sum + parseSuffix(NOBLE_GAS_SUFFIX[name]).reduce((s, sh) => s + sh.count, 0), 0) : 0;
  const outerElectrons = suffixShells.reduce((sum, shell) => sum + shell.count, 0);
  return {
    z: raw.z,
    symbol: raw.symbol,
    name: raw.name,
    shells,
    core: raw.core,
    coreElectrons,
    outerElectrons,
    fullConfig: formatShells(shells),
    shorthand: raw.core ? `[${raw.core}]${formatShells(suffixShells)}` : formatShells(shells)
  };
});

export function findElementConfig(z: number): ElementConfig | undefined {
  return ELECTRON_CONFIGS.find((element) => element.z === Math.round(z));
}

/** `CalculatorInput.options`: value = atomic number, label = "26 — Iron (Fe)". */
export const ELEMENT_CONFIG_OPTIONS: { value: number; label: string }[] = ELECTRON_CONFIGS.map((element) => ({
  value: element.z,
  label: `${element.z} — ${element.name} (${element.symbol})`
}));
