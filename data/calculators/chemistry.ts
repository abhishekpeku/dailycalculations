import type { CalculatorConfig } from './types.ts';
import { ELEMENT_OPTIONS } from '../../lib/atomicMasses.ts';
import { ELECTRON_CONFIGS, ELEMENT_CONFIG_OPTIONS, findElementConfig } from '../../lib/electronConfigurations.ts';
import {
  BONDING_PAIR_OPTIONS,
  LONE_PAIR_OPTIONS,
  MOLECULAR_SHAPE_LABELS,
  ELECTRON_GEOMETRY_LABELS,
  BOND_ANGLE_LABELS,
  EXAMPLE_LABELS,
  findGeometry
} from '../../lib/molecularGeometry.ts';

// Labels for electron-configuration-calculator's two text outputs: compute() returns the atomic
// number as a numeric "code", and these lookups (BreakdownOutput.labels, same mechanism as a UK
// ring-size letter) print the real configuration string instead of formatting it as a number.
const FULL_CONFIG_LABELS = ELECTRON_CONFIGS.map((element) => ({ value: element.z, label: element.fullConfig }));
const SHORTHAND_LABELS = ELECTRON_CONFIGS.map((element) => ({ value: element.z, label: element.shorthand }));

export const chemistryCalculators: CalculatorConfig[] = [
  {
    id: 'molar-mass-calculator',
    category: 'chemistry',
    glyph: 'Mr',
    updatedAt: '2026-11-06',
    aliases: ['molar mass calculator', 'molecular weight calculator', 'molecular mass calculator', 'formula mass calculator', 'grams per mole calculator', 'molar mass of a compound calculator'],
    related: ['molarity-calculator', 'dilution-calculator', 'mass-percent-calculator', 'moles-to-grams-calculator'],
    title: 'Molar Mass Calculator',
    description: 'Add up the atomic masses of a compound’s elements, each multiplied by how many atoms it has, to get the molar mass in grams per mole.',
    example: 'Water, H₂O, is 2 hydrogen atoms (1.008 g/mol each) plus 1 oxygen atom (15.999 g/mol), for a molar mass of about 18.015 g/mol.',
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is molar mass?',
        paragraphs: [
          'Molar mass is the mass of one mole of a substance — 6.02214076×10²³ of its atoms, molecules, or formula units (Avogadro’s number, exact since the SI base units were redefined in 2019). It is reported in grams per mole (g/mol), and for a single element it is numerically the same as the atomic mass shown on a periodic table, just with different units: carbon’s atomic mass is 12.011 (a ratio, unitless by definition), and its molar mass is 12.011 g/mol.',
          'For a compound, molar mass is the sum of every element’s atomic mass, each multiplied by how many atoms of that element appear in the formula. Water, H₂O, has two hydrogen atoms and one oxygen atom, so its molar mass is 2 × (hydrogen’s atomic mass) + 1 × (oxygen’s atomic mass).',
          'Molar mass is the bridge between a lab balance, which measures mass, and a chemical equation, which is written in moles. Weighing out a precise number of moles of a solid is impossible directly — you weigh out a mass, and divide by the molar mass to know how many moles that was (see the moles-to-grams calculator below).'
        ]
      },
      howTo: {
        intro: 'Build the formula one element at a time: pick the element and how many atoms of it appear, repeating for up to four distinct elements.',
        steps: [
          { name: 'Identify every distinct element in the formula', text: 'Water (H₂O) has two: hydrogen and oxygen. Glucose (C₆H₁₂O₆) has three: carbon, hydrogen and oxygen. Leave unused element slots set to "None".' },
          { name: 'Enter each element’s atom count', text: 'The subscript in the chemical formula — the "2" in H₂O, the "6" in C₆H₁₂O₆. An element with no subscript appears once.' },
          { name: 'Repeat for every element in the formula', text: 'Up to four element slots, which covers the large majority of formulas seen in a general chemistry course.' },
          { name: 'Read the molar mass', text: 'The total, in grams per mole, appears immediately, with each element’s share of that total broken out below it.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Molar mass is a sum, not an equation you rearrange: multiply each element’s atomic mass by its atom count, then add the results together.',
        expression: 'M = Σ (atomic massᵢ × countᵢ)',
        terms: [
          { symbol: 'M', meaning: 'Molar mass of the compound, in grams per mole (g/mol).' },
          { symbol: 'atomic massᵢ', meaning: 'The standard atomic weight of element i, from the IUPAC/CIAAW table — e.g. 1.008 for hydrogen, 15.999 for oxygen.' },
          { symbol: 'countᵢ', meaning: 'How many atoms of element i the formula contains — the subscript written after that element’s symbol.' }
        ],
        note: 'There is no way to go backward from a molar mass alone to a unique formula: many different combinations of elements and counts can add up to the same total.'
      },
      workedExample: {
        intro: 'What is the molar mass of water, H₂O?',
        rows: [
          { label: 'Hydrogen (H)', value: '1.008 g/mol × 2 atoms = 2.016 g/mol' },
          { label: 'Oxygen (O)', value: '15.999 g/mol × 1 atom = 15.999 g/mol' },
          { label: 'Molar mass (2.016 + 15.999)', value: '18.015 g/mol' }
        ],
        result: 'M ≈ 18.015 g/mol',
        explanation: 'Two hydrogen atoms contribute 2 × 1.008 = 2.016 g/mol, and the single oxygen atom contributes 15.999 g/mol. Added together, one mole of water molecules has a mass of 18.015 g — the figure a lab balance would show for one mole of pure water.'
      },
      watchOut: [
        {
          title: 'The subscript is an atom count, not a multiplier on the whole formula',
          body: 'In H₂O, the 2 belongs to hydrogen only — there is still just one oxygen atom. A separate number in front of a whole formula (like "2 H₂O" for two water molecules) instead doubles every element’s count, which is a different calculation from molar mass itself.'
        },
        {
          title: 'Parenthesized groups multiply everything inside them',
          body: 'Calcium hydroxide, Ca(OH)₂, has 1 calcium, but 2 oxygen and 2 hydrogen — the subscript outside the parentheses applies to every element inside. Enter the already-multiplied totals (O: 2, H: 2) as this calculator’s per-element counts.'
        },
        {
          title: 'Molar mass is not the same as mass percent or molarity',
          body: 'Molar mass is a property of the pure compound (g per mole), independent of any solution. How much of that compound is dissolved in a given amount of solvent is a separate question — see the molarity and mass percent calculators below.'
        },
        {
          title: 'Standard atomic weights are averages, not whole numbers',
          body: 'Chlorine’s atomic mass, 35.45, reflects a natural mix of isotopes (mostly chlorine-35 and chlorine-37) — no single chlorine atom actually has that mass. This is why molar masses rarely come out to round numbers.'
        }
      ],
      references: [
        { label: 'CIAAW (IUPAC Commission on Isotopic Abundances and Atomic Weights), Standard Atomic Weights', url: 'https://ciaaw.org/atomic-weights.htm' },
        { label: 'BIPM, The International System of Units (SI Brochure) — the mole, defined via the exact value of the Avogadro constant', url: 'https://www.bipm.org/en/publications/si-brochure' },
        { label: 'Wikipedia, "List of elements" (standard atomic weight values used in this calculator’s element table)', url: 'https://en.wikipedia.org/wiki/List_of_elements' }
      ]
    },
    inputs: [
      { id: 'element1', label: 'Element 1', type: 'number', placeholder: '1.008', defaultValue: 1.008, step: 0.001, min: 0, options: ELEMENT_OPTIONS },
      { id: 'count1', label: 'Element 1 atom count', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 },
      { id: 'element2', label: 'Element 2', type: 'number', placeholder: '15.999', defaultValue: 15.999, step: 0.001, min: 0, options: ELEMENT_OPTIONS },
      { id: 'count2', label: 'Element 2 atom count', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 },
      { id: 'element3', label: 'Element 3', type: 'number', placeholder: '0', defaultValue: 0, step: 0.001, min: 0, options: ELEMENT_OPTIONS },
      { id: 'count3', label: 'Element 3 atom count', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 },
      { id: 'element4', label: 'Element 4', type: 'number', placeholder: '0', defaultValue: 0, step: 0.001, min: 0, options: ELEMENT_OPTIONS },
      { id: 'count4', label: 'Element 4 atom count', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'molarMass',
      headlineLabel: 'Molar mass (g/mol)',
      outputs: [
        { id: 'molarMass', label: 'Molar mass (g/mol)', format: 'significant' },
        { id: 'contribution1', label: 'Element 1 contribution (g/mol)', format: 'significant' },
        { id: 'contribution2', label: 'Element 2 contribution (g/mol)', format: 'significant' },
        { id: 'contribution3', label: 'Element 3 contribution (g/mol)', format: 'significant' },
        { id: 'contribution4', label: 'Element 4 contribution (g/mol)', format: 'significant' }
      ],
      groups: [{ inputs: ['element1', 'count1', 'element2', 'count2', 'element3', 'count3', 'element4', 'count4'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'contribution1', label: 'Element 1' },
          { from: 'contribution2', label: 'Element 2' },
          { from: 'contribution3', label: 'Element 3' },
          { from: 'contribution4', label: 'Element 4' }
        ],
        center: 'molarMass',
        centerSub: 'g/mol'
      }
    },
    seo: {
      title: 'Molar Mass Calculator – Compound Molecular Weight',
      description: 'Free molar mass calculator. Add up to four elements’ atomic masses, each times its atom count, to find a compound’s molar mass in g/mol.',
      faq: [
        { question: 'How do I calculate molar mass?', answer: 'Multiply each element’s atomic mass by how many atoms of it the formula contains, then add the results. Water (H₂O) is 2 × 1.008 (hydrogen) + 1 × 15.999 (oxygen) = 18.015 g/mol.' },
        { question: 'What is the molar mass of water?', answer: 'About 18.015 g/mol: two hydrogen atoms (1.008 g/mol each) plus one oxygen atom (15.999 g/mol).' },
        { question: 'What is the molar mass of carbon dioxide, CO₂?', answer: 'About 44.009 g/mol: one carbon atom (12.011 g/mol) plus two oxygen atoms (15.999 g/mol each, 31.998 g/mol total).' },
        { question: 'What is the molar mass of table salt, NaCl?', answer: 'About 58.44 g/mol: sodium (22.99 g/mol) plus chlorine (35.45 g/mol).' },
        { question: 'What is the molar mass of glucose, C₆H₁₂O₆?', answer: 'About 180.156 g/mol: 6 × 12.011 (carbon) + 12 × 1.008 (hydrogen) + 6 × 15.999 (oxygen) = 72.066 + 12.096 + 95.994.' },
        { question: 'Is molar mass the same as molecular weight?', answer: 'In everyday use, yes — "molecular weight" and "molar mass" both mean the mass of one mole of a substance, in g/mol. Chemists sometimes use "relative molecular mass" (symbol Mr) for the dimensionless ratio and reserve "molar mass" for the g/mol figure, but numerically they match.' },
        { question: 'How do I handle a formula with parentheses, like Ca(OH)₂?', answer: 'Multiply the subscript outside the parentheses into every element inside it first. Ca(OH)₂ has 1 calcium, 2 oxygen and 2 hydrogen — enter those already-multiplied totals as the per-element counts.' }
      ]
    },
    compute(values) {
      const contribution1 = values.element1 * values.count1;
      const contribution2 = values.element2 * values.count2;
      const contribution3 = values.element3 * values.count3;
      const contribution4 = values.element4 * values.count4;
      return {
        molarMass: contribution1 + contribution2 + contribution3 + contribution4,
        contribution1,
        contribution2,
        contribution3,
        contribution4
      };
    }
  },
  {
    id: 'molarity-calculator',
    category: 'chemistry',
    glyph: 'M',
    updatedAt: '2026-11-06',
    aliases: ['molarity calculator', 'molar concentration calculator', 'm = mol/l calculator', 'moles per liter calculator', 'solution concentration calculator'],
    related: ['dilution-calculator', 'molar-mass-calculator', 'mass-percent-calculator', 'moles-to-grams-calculator'],
    title: 'Molarity Calculator (M = mol ÷ L)',
    description: 'Solve for molarity, amount of solute, or solution volume — M = mol ÷ L — in mol/L (M), mmol/L, or µmol/L.',
    example: 'Dissolving 2 mol of solute in enough water to make 4 L of solution gives a 0.5 mol/L (0.5 M) solution.',
    solver: {
      defaultTarget: 'molarity',
      variables: [
        { id: 'molarity', label: 'Molarity', symbol: 'M', dimension: 'concentration', defaultValue: 0.5, defaultUnit: 'mol/L' },
        { id: 'moles', label: 'Amount of solute', symbol: 'n', dimension: 'amountOfSubstance', defaultValue: 2, defaultUnit: 'mol' },
        { id: 'volume', label: 'Solution volume', symbol: 'V', dimension: 'volume', defaultValue: 4, defaultUnit: 'L' }
      ],
      solve: {
        molarity: ({ moles, volume }) => (volume === 0 ? NaN : moles / volume),
        moles: ({ molarity, volume }) => molarity * volume,
        volume: ({ molarity, moles }) => (molarity === 0 ? NaN : moles / molarity)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'molarity',
          min: -2,
          max: 2,
          ticks: ['0.01 mol/L', '0.1 mol/L', '1 mol/L', '10 mol/L', '100 mol/L'],
          benchmarks: [
            { label: "Seawater's dissolved salt, as NaCl (average ocean salinity)", value: 0.6 },
            { label: 'Concentrated hydrochloric acid (about 37% HCl)', value: 12.1 },
            { label: "Pure water's own molarity (1,000 g/L ÷ 18.015 g/mol)", value: 55.5 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your molarity'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is molarity?',
        paragraphs: [
          'Molarity is the most common way chemists state how concentrated a solution is: the number of moles of dissolved solute per liter of total solution. It is written M = n ÷ V, and its unit, mol/L, is often abbreviated "M" — a "0.5 M" solution means 0.5 mol of solute in every liter of solution.',
          'Molarity describes the whole solution, not just the solute by itself. A liter of 1 M sugar solution does not contain exactly one liter of water plus sugar; dissolving the sugar changes the total volume slightly, which is why the volume in the formula is the solution’s final volume, measured after everything is mixed and topped up, not the volume of solvent you started with.',
          'Because it is defined per liter, molarity makes it easy to measure out a known number of moles with nothing more precise than a graduated flask: take a known volume of a solution with a known molarity, and the amount of solute it contains follows directly from n = M × V.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of molarity, amount of solute and volume; the third fills in automatically.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit — mol/L, mmol/L or µmol/L for molarity; mol, mmol or µmol for the amount of solute; any volume unit.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 2 mol becomes 2,000 mmol instead of silently turning into 2 mmol.' },
          { name: 'Read the result and the scale', text: 'The molarity appears in your chosen unit, with the scale below placing it among a few familiar solutions.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The molarity formula rearranges to solve for the amount of solute or the solution volume as well.',
        expression: 'M = n ÷ V\nn = M × V\nV = n ÷ M',
        terms: [
          { symbol: 'M', meaning: 'Molarity (molar concentration), in moles of solute per liter of solution (mol/L, often written "M").' },
          { symbol: 'n', meaning: 'Amount of solute, in moles (mol) — use the moles-to-grams calculator to convert from a measured mass.' },
          { symbol: 'V', meaning: 'Total volume of the solution (solute plus solvent), in liters, after mixing.' }
        ],
        note: 'Every input is converted to a common base (mol, m³) before solving and converted back afterward, so mixing mmol with liters or mol with milliliters is handled automatically.'
      },
      workedExample: {
        intro: '2 mol of a solute is dissolved in enough water to make 4 L of solution. What is the molarity?',
        rows: [
          { label: 'Amount of solute (n)', value: '2 mol' },
          { label: 'Solution volume (V)', value: '4 L' },
          { label: 'Molarity (M = 2 ÷ 4)', value: '0.5 mol/L' }
        ],
        result: 'M = 0.5 mol/L (0.5 M)',
        explanation: '2 mol of solute spread through 4 L of solution works out to 0.5 mol in every liter — a 0.5 M solution. If the solute were sodium chloride (molar mass 58.44 g/mol), that 2 mol would be 2 × 58.44 = 116.88 g, weighed out before being dissolved and topped up to 4 L.'
      },
      watchOut: [
        {
          title: 'The volume is the solution’s, not the solvent’s',
          body: 'V is the final volume after the solute is dissolved and the mixture is topped up, not the volume of water you started with. Dissolving a solid changes the total volume slightly, which is why solutions are prepared in a volumetric flask marked to a final volume, not by adding solute to a pre-measured amount of solvent.'
        },
        {
          title: 'Molarity needs moles, not grams',
          body: 'If you know a mass of solute rather than a number of moles, convert it first — n = mass ÷ molar mass (the moles-to-grams calculator does this). Using grams directly in place of n gives a number in the wrong units entirely.'
        },
        {
          title: 'Molarity is not the same as mass percent',
          body: 'Mass percent compares masses of solute and solution; molarity compares moles of solute to solution volume. The same solution has a definite value for both, but they are not interchangeable without knowing the solution’s density and the solute’s molar mass.'
        },
        {
          title: 'Molarity changes slightly with temperature',
          body: 'Because M depends on volume, and most liquids expand slightly when heated, the molarity of a solution can drop a little as its temperature rises, even though the amount of solute has not changed. This is usually small enough to ignore outside precise analytical work.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §3.3 "Other Units for Solution Concentrations" and §3.4 "Dilutions and Titrations"', url: 'https://openstax.org/books/chemistry-2e/pages/3-3-molarity' },
        { label: 'IUPAC Gold Book, "amount concentration" (the formal name for molarity)', url: 'https://goldbook.iupac.org/terms/view/A00295' },
        { label: 'BIPM, The International System of Units (SI Brochure) — the mole', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'moles', label: 'Amount of solute (mol)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.01, min: 0 },
      { id: 'volume', label: 'Solution volume (m³)', type: 'number', placeholder: '0.004', defaultValue: 0.004, step: 0.0001, min: 0 }
    ],
    seo: {
      title: 'Molarity Calculator (M = mol/L) – Solve for M, n or V',
      description: 'Free molarity calculator. Solve M = n ÷ V for molarity, moles of solute, or solution volume, in mol/L, mmol/L, or µmol/L, with a worked example.',
      faq: [
        { question: 'How do I calculate molarity?', answer: 'Divide the moles of solute by the solution’s total volume in liters: M = n ÷ V. Dissolving 2 mol of solute in 4 L of solution gives 2 ÷ 4 = 0.5 mol/L.' },
        { question: 'What does "M" mean in chemistry?', answer: 'M is shorthand for molar, the unit of molarity: 1 M means 1 mole of solute per liter of solution. A "0.5 M NaCl solution" has 0.5 mol of NaCl per liter.' },
        { question: 'How do I find the moles of solute from molarity and volume?', answer: 'Multiply: n = M × V. A 0.5 mol/L solution with a volume of 4 L contains 0.5 × 4 = 2 mol of solute.' },
        { question: 'How do I find the volume needed for a target molarity?', answer: 'Divide the moles of solute by the target molarity: V = n ÷ M. 2 mol of solute, diluted to a 0.5 mol/L solution, needs 2 ÷ 0.5 = 4 L.' },
        { question: 'Is molarity the same as concentration?', answer: 'Molarity is one specific way of expressing concentration — moles of solute per liter of solution. Other concentration units, like mass percent or parts per million, express the same general idea differently and are not numerically interchangeable with molarity without more information.' },
        { question: 'How concentrated is concentrated hydrochloric acid?', answer: 'About 12 mol/L (12 M) for the common laboratory grade, roughly 37% HCl by mass at a density of about 1.19 g/mL.' },
        { question: 'What is the molarity of pure water?', answer: 'About 55.5 mol/L — dividing water’s density (about 1,000 g/L) by its own molar mass (18.015 g/mol). This figure shows up in deriving the water dissociation constant, Kw.' }
      ]
    },
    compute(values) {
      return { molarity: values.moles / values.volume };
    }
  },
  {
    id: 'dilution-calculator',
    category: 'chemistry',
    glyph: 'CV',
    updatedAt: '2026-11-06',
    aliases: ['dilution calculator', 'c1v1=c2v2 calculator', 'dilution formula calculator', 'stock solution dilution calculator', 'dilution factor calculator', 'serial dilution calculator'],
    related: ['molarity-calculator', 'molar-mass-calculator', 'mass-percent-calculator', 'moles-to-grams-calculator'],
    title: 'Dilution Calculator (C₁V₁ = C₂V₂)',
    description: 'Solve the dilution equation, C₁V₁ = C₂V₂, for any of the four values — the stock concentration, the stock volume, the final concentration, or the final volume.',
    example: 'Taking 50 mL of a 3 mol/L stock solution and adding water to make 300 mL total gives a final concentration of 0.5 mol/L.',
    solver: {
      defaultTarget: 'concentration2',
      variables: [
        { id: 'concentration1', label: 'Stock concentration', symbol: 'C₁', dimension: 'concentration', defaultValue: 3, defaultUnit: 'mol/L' },
        { id: 'volume1', label: 'Stock volume', symbol: 'V₁', dimension: 'volume', defaultValue: 50, defaultUnit: 'mL' },
        { id: 'concentration2', label: 'Final concentration', symbol: 'C₂', dimension: 'concentration', defaultValue: 0.5, defaultUnit: 'mol/L' },
        { id: 'volume2', label: 'Final volume', symbol: 'V₂', dimension: 'volume', defaultValue: 300, defaultUnit: 'mL' }
      ],
      solve: {
        concentration1: ({ concentration2, volume1, volume2 }) => (volume1 === 0 ? NaN : (concentration2 * volume2) / volume1),
        volume1: ({ concentration1, concentration2, volume2 }) => (concentration1 === 0 ? NaN : (concentration2 * volume2) / concentration1),
        concentration2: ({ concentration1, volume1, volume2 }) => (volume2 === 0 ? NaN : (concentration1 * volume1) / volume2),
        volume2: ({ concentration1, volume1, concentration2 }) => (concentration2 === 0 ? NaN : (concentration1 * volume1) / concentration2)
      },
      outputs: [{ id: 'dilutionFactor', label: 'Dilution factor (V₂ ÷ V₁)', dimension: 'count', compute: (si) => (si.volume1 === 0 ? NaN : si.volume2 / si.volume1) }],
      visuals: [
        {
          type: 'compareBars',
          bars: [
            { from: 'concentration1', label: 'Stock concentration' },
            { from: 'concentration2', label: 'Final concentration' }
          ],
          title: 'Before and after dilution',
          highlight: 1
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is dilution?',
        paragraphs: [
          'Dilution is adding more solvent to a solution to lower its concentration, without changing how much solute is in it. The amount of solute present stays exactly the same before and after — only the volume it is spread through grows, which is why C₁V₁ = C₂V₂: concentration times volume is the amount of solute, and that quantity is conserved on both sides of the equation.',
          'Subscript 1 refers to the solution before dilution (the concentrated "stock"), and subscript 2 refers to it after (the "final" or "working" solution). Diluting always makes the volume bigger and the concentration smaller by the same factor — double the volume and the concentration exactly halves.',
          'This is the same equation chemists use to prepare a specific concentration from a concentrated stock, and it is also behind "serial dilution," where a solution is diluted by the same factor again and again to reach concentrations far too low to measure out directly in one step.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the four values; the fourth fills in automatically.',
        steps: [
          { name: 'Enter the stock solution’s concentration and volume', text: 'C₁ and V₁ — what you are starting from, in any concentration and volume units.' },
          { name: 'Enter the target, either a final concentration or a final volume', text: 'If you know how concentrated you want the result, enter C₂ and let the calculator find V₂ (how much to dilute to). If you know how much final volume you need, enter V₂ instead and solve for C₂.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result', text: 'The missing value appears immediately, in the unit you chose for it, alongside a comparison of the concentration before and after.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'C₁V₁ = C₂V₂ rearranges to solve for any one of the four quantities, given the other three.',
        expression: 'C₁V₁ = C₂V₂\nC₁ = (C₂V₂) ÷ V₁\nV₁ = (C₂V₂) ÷ C₁\nC₂ = (C₁V₁) ÷ V₂\nV₂ = (C₁V₁) ÷ C₂',
        terms: [
          { symbol: 'C₁, V₁', meaning: 'Concentration and volume of the starting ("stock") solution, before diluting.' },
          { symbol: 'C₂, V₂', meaning: 'Concentration and volume of the resulting ("final") solution, after diluting.' },
          { symbol: 'C₁V₁ (= C₂V₂)', meaning: 'The amount of solute, which does not change during a dilution — in moles if concentration is molarity, but the equation works the same way for any concentration unit as long as both sides use the same one.' }
        ],
        note: 'This equation only holds when no solute is added or removed — it describes adding solvent (or removing some), not mixing two different solutions together.'
      },
      workedExample: {
        intro: 'A stock solution is 3 mol/L. Taking 50 mL of it and adding water to bring the total to 300 mL — what is the final concentration?',
        rows: [
          { label: 'Stock concentration (C₁)', value: '3 mol/L' },
          { label: 'Stock volume (V₁)', value: '50 mL' },
          { label: 'Final volume (V₂)', value: '300 mL' },
          { label: 'Amount of solute (C₁ × V₁ = 3 × 0.05 L)', value: '0.15 mol' },
          { label: 'Final concentration (C₂ = 0.15 mol ÷ 0.3 L)', value: '0.5 mol/L' }
        ],
        result: 'C₂ = 0.5 mol/L — a 6× dilution (300 mL ÷ 50 mL)',
        explanation: 'The 50 mL of stock contains 3 × 0.05 = 0.15 mol of solute. Spreading that same 0.15 mol through a final volume of 300 mL (0.3 L) gives 0.15 ÷ 0.3 = 0.5 mol/L. The volume grew 6-fold (300 ÷ 50), so the concentration dropped to exactly 1/6 of the original — 3 ÷ 6 = 0.5.'
      },
      watchOut: [
        {
          title: 'Any consistent volume unit works, but both volumes must use the same one before you read the dilution factor',
          body: 'The calculator converts units automatically, so entering V₁ in mL and V₂ in L is fine for getting the right concentration. But the plain ratio V₂ ÷ V₁ (the dilution factor) only reads naturally once both are in the same unit — a 50 mL to 300 mL dilution is a 6× dilution, the same fact as a 0.05 L to 0.3 L dilution.'
        },
        {
          title: 'Moles of solute do not change — only concentration does',
          body: 'C₁V₁ = C₂V₂ works because both sides equal the same fixed amount of solute. If any solute is lost (left behind in glassware, for example) or additional solute is somehow added, the equation no longer holds.'
        },
        {
          title: 'This is not the same as mixing two different solutions',
          body: 'C₁V₁ = C₂V₂ describes one solution being diluted with pure solvent. Combining two solutions that already contain solute (even two dilutions of the same stock) needs a mass or mole balance across both, not this single equation.'
        },
        {
          title: 'A dilution can lower concentration but never raise it',
          body: 'V₂ is always at least as large as V₁ in a genuine dilution. If a calculation seems to need V₂ smaller than V₁, check whether what is actually wanted is concentrating a solution (removing solvent), which this equation does not model directly.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §3.4 "Dilutions and Titrations"', url: 'https://openstax.org/books/chemistry-2e/pages/3-4-other-units-for-solution-concentrations' },
        { label: 'IUPAC Gold Book, "dilution"', url: 'https://goldbook.iupac.org/terms/view/D01646' }
      ]
    },
    inputs: [
      { id: 'concentration1', label: 'Stock concentration (mol/m³)', type: 'number', placeholder: '3000', defaultValue: 3000, step: 1, min: 0 },
      { id: 'volume1', label: 'Stock volume (m³)', type: 'number', placeholder: '0.00005', defaultValue: 0.00005, step: 0.00001, min: 0 },
      { id: 'volume2', label: 'Final volume (m³)', type: 'number', placeholder: '0.0003', defaultValue: 0.0003, step: 0.00001, min: 0 }
    ],
    seo: {
      title: 'Dilution Calculator (C₁V₁ = C₂V₂) – Solve for Any Value',
      description: 'Free dilution calculator. Solve C₁V₁ = C₂V₂ for stock concentration, stock volume, final concentration, or final volume, with a worked example.',
      faq: [
        { question: 'What is the dilution formula?', answer: 'C₁V₁ = C₂V₂, where C₁ and V₁ are the stock solution’s concentration and volume, and C₂ and V₂ are the final solution’s. The amount of solute (concentration × volume) stays the same on both sides.' },
        { question: 'How do I dilute a stock solution to a target concentration?', answer: 'Solve for the final volume: V₂ = (C₁ × V₁) ÷ C₂. Taking 50 mL of a 3 mol/L stock and wanting 0.5 mol/L needs a final volume of (3 × 50) ÷ 0.5 = 300 mL — so add water until the total reaches 300 mL.' },
        { question: 'How do I find the final concentration after dilution?', answer: 'Solve for C₂: C₂ = (C₁ × V₁) ÷ V₂. 50 mL of a 3 mol/L stock, diluted to 300 mL total, gives (3 × 50) ÷ 300 = 0.5 mol/L.' },
        { question: 'What is a dilution factor?', answer: 'The ratio of the final volume to the starting volume, V₂ ÷ Vᵢ. A "1:10 dilution" means the final volume is 10× the starting volume, so the concentration drops to 1/10 of what it was.' },
        { question: 'Does dilution change the amount of solute?', answer: 'No. Dilution only adds solvent; the total amount of solute (moles, or whatever unit the concentration uses) stays exactly the same — that is the whole premise behind C₁V₁ = C₂V₂.' },
        { question: 'What is serial dilution?', answer: 'Repeating the same dilution step multiple times in a row, each time diluting the previous result by the same factor, to reach concentrations far lower than one dilution step could measure out accurately — common in microbiology and drug-concentration experiments.' },
        { question: 'Can I use this formula with units other than molarity?', answer: 'Yes. C₁V₁ = C₂V₂ holds for any concentration unit (mass percent, mg/mL, and so on), as long as C₁ and C₂ are expressed in the same unit as each other.' }
      ]
    },
    compute(values) {
      return { concentration2: (values.concentration1 * values.volume1) / values.volume2 };
    }
  },
  {
    id: 'mass-percent-calculator',
    category: 'chemistry',
    glyph: 'm%',
    updatedAt: '2026-11-06',
    aliases: ['mass percent calculator', 'percent by mass calculator', 'mass concentration percent calculator', 'weight percent calculator', 'percent composition by mass calculator'],
    related: ['molarity-calculator', 'molar-mass-calculator', 'dilution-calculator', 'moles-to-grams-calculator'],
    title: 'Mass Percent Calculator',
    description: 'Solve for mass percent, mass of solute, or mass of solution — mass percent = (solute mass ÷ solution mass) × 100.',
    example: '15 g of salt dissolved in a solution totaling 200 g (15 g salt plus 185 g water) is a 7.5% mass percent solution.',
    solver: {
      defaultTarget: 'massPercent',
      variables: [
        { id: 'massPercent', label: 'Mass percent', symbol: 'w%', dimension: 'percent', defaultValue: 7.5, defaultUnit: '%' },
        { id: 'soluteMass', label: 'Mass of solute', symbol: 'mₘ', dimension: 'mass', defaultValue: 15, defaultUnit: 'g' },
        { id: 'solutionMass', label: 'Mass of solution', symbol: 'mₛ', dimension: 'mass', defaultValue: 200, defaultUnit: 'g' }
      ],
      solve: {
        massPercent: ({ soluteMass, solutionMass }) => (solutionMass === 0 ? NaN : (soluteMass / solutionMass) * 100),
        soluteMass: ({ massPercent, solutionMass }) => (massPercent / 100) * solutionMass,
        solutionMass: ({ massPercent, soluteMass }) => (massPercent === 0 ? NaN : soluteMass / (massPercent / 100))
      },
      derive: (si) => ({ solventMass: si.solutionMass - si.soluteMass }),
      visuals: [
        {
          type: 'donut',
          segments: [
            { from: 'soluteMass', label: 'Solute' },
            { from: 'solventMass', label: 'Solvent' }
          ],
          center: 'solutionMass',
          centerSub: 'total mass'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is mass percent?',
        paragraphs: [
          'Mass percent (also called percent by mass or weight percent) states how much of a solution’s total mass is the dissolved solute: mass percent = (mass of solute ÷ mass of solution) × 100. A "10% saline solution" means 10% of the total weighed mass is salt — 10 g of salt in every 100 g of solution.',
          'The denominator is the mass of the whole solution — solute plus solvent together — not just the solvent. 15 g of salt dissolved into 185 g of water makes 200 g of solution, so the mass percent is 15 ÷ 200 × 100 = 7.5%, not 15 ÷ 185.',
          'Mass percent is one of several ways to state concentration by mass rather than by moles. It needs nothing beyond a scale — no molar mass, no volumetric glassware — which makes it a common way commercial products (bleach, battery acid, saline solutions) and food labels state concentration.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of mass percent, mass of solute, and mass of solution; the third fills in automatically.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit — mass percent is unitless, and the two masses can use any mass unit.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a mass unit converts the number already there, so 15 g becomes 0.015 kg instead of silently turning into 15 kg.' },
          { name: 'Read the result', text: 'The answer appears immediately, with the solute and solvent shares of the total mass shown side by side.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The mass percent formula rearranges to solve for the mass of solute or the mass of solution as well.',
        expression: 'mass % = (mₘ ÷ mₛ) × 100\nmₘ = (mass % ÷ 100) × mₛ\nmₛ = mₘ ÷ (mass % ÷ 100)',
        terms: [
          { symbol: 'mass %', meaning: 'Mass percent (percent by mass) of the solute in the solution.' },
          { symbol: 'mₘ', meaning: 'Mass of the solute — the substance being dissolved.' },
          { symbol: 'mₛ', meaning: 'Mass of the whole solution — solute plus solvent, measured together after mixing.' }
        ],
        note: 'Mass percent is a ratio of masses, so it works out the same regardless of which consistent mass unit (g, kg, oz, lb) both mₘ and mₛ are measured in.'
      },
      workedExample: {
        intro: '15 g of salt is dissolved in water to make a total solution mass of 200 g. What is the mass percent?',
        rows: [
          { label: 'Mass of solute (mₘ)', value: '15 g' },
          { label: 'Mass of solution (mₛ)', value: '200 g' },
          { label: 'Mass of solvent (200 − 15)', value: '185 g' },
          { label: 'Mass percent (15 ÷ 200 × 100)', value: '7.5%' }
        ],
        result: 'mass % = 7.5%',
        explanation: 'The solution’s total mass is 200 g: 15 g of salt plus 185 g of water. Dividing the solute’s mass by the total, 15 ÷ 200 = 0.075, and multiplying by 100 gives 7.5% — 7.5 g of salt in every 100 g of this solution.'
      },
      watchOut: [
        {
          title: 'Divide by the solution’s mass, not the solvent’s',
          body: 'A common mistake is dividing by the mass of water alone (185 g here) instead of the total mass (200 g), which gives 8.1% instead of the correct 7.5%. The denominator is always solute plus solvent together.'
        },
        {
          title: 'Mass percent is not volume percent',
          body: 'Mass percent compares masses; volume percent (common for alcohol content, "5% ABV") compares volumes. The two give different numbers for the same mixture whenever the solute and solvent have different densities, which is almost always.'
        },
        {
          title: 'Mass percent is not molarity',
          body: 'Converting between mass percent and molarity needs two more pieces of information: the solute’s molar mass and the solution’s density. Mass percent alone does not tell you how many moles of solute are present.'
        },
        {
          title: 'Mixing volumes does not generally give additive masses or volumes',
          body: 'Dissolving a solid changes the solution’s total volume slightly, and mixing two liquids does not always give a volume exactly equal to the sum of the two starting volumes. Mass percent avoids that problem entirely by working with mass, which is additive, rather than volume.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §3.3 "Other Units for Solution Concentrations" (mass percent, ppm, ppb)', url: 'https://openstax.org/books/chemistry-2e/pages/3-3-molarity' },
        { label: 'IUPAC Gold Book, "mass fraction"', url: 'https://goldbook.iupac.org/terms/view/M03709' }
      ]
    },
    inputs: [
      { id: 'soluteMass', label: 'Mass of solute (kg)', type: 'number', placeholder: '0.015', defaultValue: 0.015, step: 0.001, min: 0 },
      { id: 'solutionMass', label: 'Mass of solution (kg)', type: 'number', placeholder: '0.2', defaultValue: 0.2, step: 0.001, min: 0 }
    ],
    seo: {
      title: 'Mass Percent Calculator – Percent by Mass',
      description: 'Free mass percent calculator. Solve (solute mass ÷ solution mass) × 100 for mass percent, solute mass, or solution mass, with a worked example.',
      faq: [
        { question: 'How do I calculate mass percent?', answer: 'Divide the mass of solute by the mass of the whole solution, then multiply by 100: mass % = (mₘ ÷ mₛ) × 100. 15 g of solute in a 200 g solution is 15 ÷ 200 × 100 = 7.5%.' },
        { question: 'How do I find the mass of solute from a mass percent?', answer: 'Multiply the mass percent (divided by 100) by the total solution mass: mₘ = (mass % ÷ 100) × mₛ. A 7.5% solution with a total mass of 200 g contains 0.075 × 200 = 15 g of solute.' },
        { question: 'How do I find the mass of solution from a mass percent and solute mass?', answer: 'Divide the solute mass by the mass percent (as a decimal): mₛ = mₘ ÷ (mass % ÷ 100). 15 g of solute at 7.5% needs a total solution mass of 15 ÷ 0.075 = 200 g.' },
        { question: 'Is mass percent the same as concentration?', answer: 'Mass percent is one specific way of expressing concentration — by comparing masses. Molarity (moles per liter) and volume percent are other common concentration units, and none of them convert to each other without extra information like density or molar mass.' },
        { question: 'How do I find the mass of solvent from mass percent?', answer: 'Subtract the solute’s mass from the total solution mass: mₛ − mₘ. A 200 g solution containing 15 g of solute has 200 − 15 = 185 g of solvent.' },
        { question: 'Can mass percent be over 100%?', answer: 'No — the solute’s mass can never exceed the solution’s total mass, since the solution’s mass already includes the solute. Mass percent always falls between 0% and 100%.' },
        { question: 'Is mass percent the same as weight percent?', answer: 'Yes, "weight percent" and "percent by mass" are older but still common names for the same quantity, mass percent.' }
      ]
    },
    compute(values) {
      return { massPercent: (values.soluteMass / values.solutionMass) * 100 };
    }
  },
  {
    id: 'moles-to-grams-calculator',
    category: 'chemistry',
    glyph: 'm/M',
    updatedAt: '2026-11-06',
    aliases: ['moles to grams calculator', 'grams to moles calculator', 'n = m/m calculator', 'mole conversion calculator', 'convert moles to mass calculator', 'mass to moles calculator'],
    related: ['molar-mass-calculator', 'molarity-calculator', 'dilution-calculator', 'mass-percent-calculator'],
    title: 'Moles to Grams Calculator (n = m ÷ M)',
    description: 'Convert between a substance’s mass, its molar mass, and the number of moles that mass represents — n = m ÷ M, solved for any of the three.',
    example: '29.22 g of sodium chloride (molar mass 58.44 g/mol) is 0.5 mol.',
    solver: {
      defaultTarget: 'moles',
      variables: [
        { id: 'moles', label: 'Amount of substance', symbol: 'n', dimension: 'amountOfSubstance', defaultValue: 0.5, defaultUnit: 'mol' },
        { id: 'mass', label: 'Mass', symbol: 'm', dimension: 'mass', defaultValue: 29.22, defaultUnit: 'g' },
        { id: 'molarMass', label: 'Molar mass', symbol: 'M', dimension: 'molarMass', defaultValue: 58.44, defaultUnit: 'g/mol' }
      ],
      solve: {
        moles: ({ mass, molarMass }) => (molarMass === 0 ? NaN : mass / molarMass),
        mass: ({ moles, molarMass }) => moles * molarMass,
        molarMass: ({ mass, moles }) => (moles === 0 ? NaN : mass / moles)
      },
      outputs: [{ id: 'particleCount', label: 'Number of particles (atoms or molecules)', dimension: 'count', compute: (si) => si.moles * 6.02214076e23 }],
      visuals: [
        {
          type: 'logScale',
          value: 'molarMass',
          min: -3,
          max: 1,
          ticks: ['1 g/mol', '10 g/mol', '100 g/mol', '1,000 g/mol', '10,000 g/mol'],
          benchmarks: [
            { label: 'Water, H₂O', value: 0.018015 },
            { label: 'Carbon dioxide, CO₂', value: 0.044009 },
            { label: 'Table salt, NaCl', value: 0.05844 },
            { label: 'Glucose, C₆H₁₂O₆', value: 0.180156 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your molar mass'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'Converting between mass and moles',
        paragraphs: [
          'Chemical equations are written in moles — they balance numbers of particles, not grams — but a lab balance only measures mass. The molar mass bridges the two: n = m ÷ M, where m is the mass you weighed out and M is that substance’s molar mass in grams per mole (see the molar mass calculator above for finding M from a chemical formula).',
          'This is the same equation as the molar mass calculator’s formula, rearranged for a different unknown. There, you know the formula and solve for M; here, you know M (and a mass) and solve for how many moles that mass represents — or the reverse, how much mass a target number of moles requires.',
          'Because a mole is a fixed, enormous number of particles (Avogadro’s number, exactly 6.02214076×10²³), converting to moles is also the step that connects a weighed mass to an actual particle count, shown as a bonus figure below the main result.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of mass, molar mass, and amount of substance (moles); the third fills in automatically.',
        steps: [
          { name: 'Find the substance’s molar mass', text: 'Look it up, or use the molar mass calculator above to add up its formula’s atomic masses.' },
          { name: 'Enter the molar mass and one other value', text: 'Either the mass you have (or need), or the number of moles you have (or need).' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result', text: 'The missing value appears immediately, along with how many individual particles that many moles represents.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'n = m ÷ M rearranges to solve for mass or molar mass as well as moles.',
        expression: 'n = m ÷ M\nm = n × M\nM = m ÷ n',
        terms: [
          { symbol: 'n', meaning: 'Amount of substance, in moles (mol) — the SI base unit for counting particles.' },
          { symbol: 'm', meaning: 'Mass of the sample, in grams (g) or kilograms (kg).' },
          { symbol: 'M', meaning: 'Molar mass of the substance, in grams per mole (g/mol) — see the molar mass calculator to find it from a formula.' }
        ],
        note: 'Every input is converted to a common base (mol, kg, kg/mol) before solving and converted back afterward, so entering a mass in grams and a molar mass in kg/mol is handled automatically.'
      },
      workedExample: {
        intro: 'How many moles are in 29.22 g of sodium chloride (NaCl, molar mass 58.44 g/mol)?',
        rows: [
          { label: 'Mass (m)', value: '29.22 g' },
          { label: 'Molar mass (M)', value: '58.44 g/mol' },
          { label: 'Moles (n = 29.22 ÷ 58.44)', value: '0.5 mol' },
          { label: 'Particle count (0.5 × 6.022×10²³)', value: '≈ 3.011×10²³ formula units' }
        ],
        result: 'n = 0.5 mol',
        explanation: '29.22 g divided by NaCl’s molar mass of 58.44 g/mol gives 0.5 mol — half a mole, or about 3.011×10²³ individual NaCl formula units, using Avogadro’s number.'
      },
      watchOut: [
        {
          title: 'Moles and grams are not interchangeable without the molar mass',
          body: 'A mole of a light substance (hydrogen gas, about 2 g/mol) weighs far less than a mole of a heavy one (lead, about 207 g/mol), even though both contain the same number of particles. There is no way to convert mass to moles, or back, without knowing the specific substance’s molar mass.'
        },
        {
          title: 'Check the formula before you look up a molar mass',
          body: 'A substance’s molar mass depends on its full chemical formula, including any water of hydration or the exact ionic formula of a salt. Using the wrong formula — or the atomic mass of just one element instead of the whole compound — gives a wrong molar mass and, from it, a wrong mole count.'
        },
        {
          title: 'This gives moles of formula units, not moles of individual ions',
          body: 'One mole of NaCl is one mole of Na⁺ ions together with one mole of Cl⁻ ions — two moles of ions in total, even though it is "one mole of NaCl." Be clear about which particle you mean when a formula breaks apart in solution.'
        },
        {
          title: 'Moles do not measure mass or volume directly',
          body: 'Equal moles of a gas, a liquid, and a solid occupy very different volumes and have very different masses. Moles only count particles — converting to a mass or a volume always needs one more piece of information (molar mass, or density and volume).'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §3.1 "Formula Mass and the Mole Concept"', url: 'https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept' },
        { label: 'BIPM, The International System of Units (SI Brochure) — the mole and the exact value of the Avogadro constant', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass (kg)', type: 'number', placeholder: '0.02922', defaultValue: 0.02922, step: 0.00001, min: 0 },
      { id: 'molarMass', label: 'Molar mass (kg/mol)', type: 'number', placeholder: '0.05844', defaultValue: 0.05844, step: 0.00001, min: 0 }
    ],
    seo: {
      title: 'Moles to Grams Calculator (n = m/M)',
      description: 'Free moles-grams calculator. Solve n = m ÷ M for amount of substance, mass, or molar mass, with a worked example and particle count.',
      faq: [
        { question: 'How do I convert grams to moles?', answer: 'Divide the mass by the substance’s molar mass: n = m ÷ M. 29.22 g of NaCl (molar mass 58.44 g/mol) is 29.22 ÷ 58.44 = 0.5 mol.' },
        { question: 'How do I convert moles to grams?', answer: 'Multiply the number of moles by the molar mass: m = n × M. 0.5 mol of NaCl is 0.5 × 58.44 = 29.22 g.' },
        { question: 'How do I find the molar mass from a mass and a mole count?', answer: 'Divide mass by moles: M = m ÷ n. A sample weighing 29.22 g that contains 0.5 mol has a molar mass of 29.22 ÷ 0.5 = 58.44 g/mol.' },
        { question: 'How many particles are in a mole?', answer: 'Exactly 6.02214076×10²³ (Avogadro’s number) — atoms, molecules, or formula units, whichever the substance is made of.' },
        { question: 'Where do I find a substance’s molar mass?', answer: 'Add up the atomic masses of every element in its formula, each multiplied by how many atoms it has — the molar mass calculator above does this for up to four elements.' },
        { question: 'Is the mole an SI unit?', answer: 'Yes. The mole is one of the seven SI base units, used specifically for counting amount of substance, defined since 2019 by fixing the exact value of the Avogadro constant.' },
        { question: 'How many moles are in 180.156 g of glucose?', answer: 'Exactly 1 mol — 180.156 g/mol is glucose’s (C₆H₁₂O₆) molar mass, so that mass is, by definition, one mole of it.' }
      ]
    },
    compute(values) {
      return { moles: values.mass / values.molarMass };
    }
  },
  {
    id: 'ideal-gas-law-calculator',
    category: 'chemistry',
    glyph: 'PV',
    updatedAt: '2026-11-08',
    aliases: ['ideal gas law calculator', 'pv=nrt calculator', 'ideal gas equation calculator', 'gas law calculator', 'solve for pressure volume calculator', 'molar volume at stp calculator'],
    related: ['combined-gas-law-calculator', 'molarity-calculator', 'moles-to-grams-calculator', 'pressure-converter'],
    title: 'Ideal Gas Law Calculator (PV = nRT)',
    description: 'Solve the ideal gas law, PV = nRT, for pressure, volume, amount of gas, or temperature — the single equation behind the "molar volume at STP" figure and most gas-law problems.',
    example: '1 mol of an ideal gas at 0°C (273.15 K) and 1 atm occupies about 22.41 L — the classic "molar volume at STP" figure.',
    solver: {
      defaultTarget: 'volume',
      variables: [
        { id: 'pressure', label: 'Pressure', symbol: 'P', dimension: 'pressure', defaultValue: 1, defaultUnit: 'atm' },
        { id: 'volume', label: 'Volume', symbol: 'V', dimension: 'volume', defaultValue: 22.414, defaultUnit: 'L' },
        { id: 'moles', label: 'Amount of gas', symbol: 'n', dimension: 'amountOfSubstance', defaultValue: 1, defaultUnit: 'mol' },
        { id: 'temperature', label: 'Temperature', symbol: 'T', dimension: 'temperature', defaultValue: 273.15, defaultUnit: 'K' }
      ],
      solve: {
        pressure: ({ volume, moles, temperature }) => (volume === 0 ? NaN : (moles * 8.31446261815324 * temperature) / volume),
        volume: ({ pressure, moles, temperature }) => (pressure === 0 ? NaN : (moles * 8.31446261815324 * temperature) / pressure),
        moles: ({ pressure, volume, temperature }) => (temperature === 0 ? NaN : (pressure * volume) / (8.31446261815324 * temperature)),
        temperature: ({ pressure, volume, moles }) => (moles === 0 ? NaN : (pressure * volume) / (moles * 8.31446261815324))
      },
      outputs: [{ id: 'concentration', label: 'Concentration (n ÷ V)', dimension: 'concentration', unit: 'mol/L', compute: (si) => (si.volume === 0 ? NaN : si.moles / si.volume) }]
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is the ideal gas law?',
        paragraphs: [
          'The ideal gas law, PV = nRT, ties together the four measurable properties of a gas: its pressure (P), the volume it occupies (V), how much of it there is in moles (n), and its absolute temperature (T). R is the molar gas constant, a fixed number (8.31446261815324 J/(mol·K), exact since the 2019 SI redefinition fixed the Avogadro and Boltzmann constants) that makes the units on both sides match.',
          'An "ideal" gas is a simplified model: its molecules are treated as point particles with no volume of their own and no attraction or repulsion between them, colliding only elastically. Real gases — oxygen, nitrogen, carbon dioxide, and most gases you would meet in a general chemistry course — follow this law closely at ordinary temperatures and pressures, which is why it is the default starting point for gas calculations rather than a special case.',
          'The law breaks down at very high pressure or very low temperature, where real molecules do take up measurable space and do attract each other — conditions close to where a gas is about to condense into a liquid. Under typical lab or classroom conditions (room temperature, pressure near 1 atm), the ideal gas law is accurate to within a percent or so for common gases.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of pressure, volume, amount of gas, and temperature; the fourth fills in automatically.',
        steps: [
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit — atm, kPa, bar, psi or others for pressure; L, mL or m³ for volume; mol or mmol for amount of gas; and K, °C or °F for temperature.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 1 atm becomes 101.325 kPa instead of silently turning into 1 kPa.' },
          { name: 'Read the result and the concentration', text: 'The missing value appears in your chosen unit, with the gas’s concentration (n ÷ V, the same quantity as molarity) shown underneath.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'PV = nRT rearranges to solve for any one of the four quantities, given the other three.',
        expression: 'PV = nRT\nP = (nRT) ÷ V\nV = (nRT) ÷ P\nn = (PV) ÷ (RT)\nT = (PV) ÷ (nR)',
        terms: [
          { symbol: 'P', meaning: 'Absolute pressure of the gas (not gauge pressure — the reading relative to a vacuum, not relative to atmospheric pressure).' },
          { symbol: 'V', meaning: 'Volume the gas occupies.' },
          { symbol: 'n', meaning: 'Amount of gas, in moles.' },
          { symbol: 'T', meaning: 'Absolute temperature, in kelvin — never a Celsius or Fahrenheit reading used directly in the formula, since those scales have an offset zero.' },
          { symbol: 'R', meaning: 'The molar gas constant, 8.31446261815324 J/(mol·K), exact.' }
        ],
        note: 'Every input is converted to SI (Pa, m³, mol, K) before solving and converted back afterward, so mixing atm with liters or °C with kPa is handled automatically.'
      },
      workedExample: {
        intro: 'What volume does 1 mol of an ideal gas occupy at 0°C (273.15 K) and 1 atm?',
        rows: [
          { label: 'Amount of gas (n)', value: '1 mol' },
          { label: 'Temperature (T)', value: '273.15 K (0°C)' },
          { label: 'Pressure (P)', value: '1 atm = 101,325 Pa' },
          { label: 'Volume (V = nRT ÷ P)', value: '(1 × 8.31446261815324 × 273.15) ÷ 101,325' }
        ],
        result: 'V ≈ 0.022414 m³ = 22.414 L',
        explanation: 'This is the "molar volume" of an ideal gas at 0°C and 1 atm — about 22.414 L for any ideal gas, regardless of what it is made of, since the ideal gas law never refers to a specific substance. Raising the amount of gas to 2 mol at the same temperature and pressure would double the volume to about 44.83 L, since V is directly proportional to n when P and T are held fixed.'
      },
      watchOut: [
        {
          title: 'Temperature must be absolute (kelvin), not Celsius or Fahrenheit',
          body: 'PV = nRT only works with an absolute temperature scale, because kelvin has no offset — 0 K really means zero thermal motion. Plugging in a Celsius or Fahrenheit reading directly (rather than converting first) gives a wrong answer that can even come out negative. This calculator converts for you, but watch for this if you ever work the formula by hand.'
        },
        {
          title: '"STP" has two different conventions, with two different molar volumes',
          body: 'The traditional STP used in most general-chemistry courses (0°C, 1 atm) gives a molar volume of about 22.414 L/mol, the figure in the worked example above. IUPAC’s current definition of standard conditions (0°C, 100 kPa) gives about 22.711 L/mol instead, since 100 kPa is very slightly below 1 atm (101.325 kPa). Check which convention a textbook or problem set is using before quoting "22.4 L" as if it always applies.'
        },
        {
          title: 'Pressure must be absolute, not gauge pressure',
          body: 'A tire gauge or many industrial pressure readings are "gauge pressure" — relative to atmospheric pressure, not to a vacuum. The ideal gas law needs absolute pressure (gauge pressure plus atmospheric pressure, about 101.325 kPa at sea level), or the result will be off by a full atmosphere.'
        },
        {
          title: 'This models one single gas or a fixed gas mixture, not a chemical reaction',
          body: 'PV = nRT treats n as a fixed amount of gas particles. If a reaction is producing or consuming gas, the ideal gas law describes the gas at one moment, not the reaction itself — pair it with stoichiometry for how n changes over the course of a reaction.'
        },
        {
          title: 'Real gases deviate from this law at high pressure or low temperature',
          body: 'The ideal gas law assumes molecules have no volume and no attraction to each other. Near the conditions where a gas would condense into a liquid, real molecules take up measurable space and do attract each other, and the ideal gas law becomes noticeably less accurate — the Van der Waals equation corrects for both effects.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §9.3 "Stoichiometry of Gaseous Substances, Mixtures, and Reactions" (the ideal gas law)', url: 'https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions' },
        { label: 'NIST CODATA, Molar Gas Constant', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?r' },
        { label: 'IUPAC Gold Book, "standard conditions for gases" (STP)', url: 'https://goldbook.iupac.org/terms/view/S05925' }
      ]
    },
    inputs: [
      { id: 'pressure', label: 'Pressure (Pa)', type: 'number', placeholder: '101325', defaultValue: 101325, step: 1, min: 0 },
      { id: 'moles', label: 'Amount of gas (mol)', type: 'number', placeholder: '1', defaultValue: 1, step: 0.01, min: 0 },
      { id: 'temperature', label: 'Temperature (K)', type: 'number', placeholder: '273.15', defaultValue: 273.15, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Ideal Gas Law Calculator (PV = nRT) – Solve for Any Value',
      description: 'Free ideal gas law calculator. Solve PV = nRT for pressure, volume, moles, or temperature, in atm, kPa, L, mol, K and more, with a worked example.',
      faq: [
        { question: 'What is the ideal gas law formula?', answer: 'PV = nRT, where P is absolute pressure, V is volume, n is the amount of gas in moles, T is absolute temperature in kelvin, and R is the molar gas constant, 8.31446261815324 J/(mol·K).' },
        { question: 'What volume does 1 mole of gas occupy at STP?', answer: 'About 22.414 L at the traditional STP (0°C, 1 atm) used in most general-chemistry courses, or about 22.711 L at IUPAC’s current standard conditions (0°C, 100 kPa) — check which convention applies before using "22.4 L" as a shortcut.' },
        { question: 'How do I find the pressure of a gas from its volume, moles, and temperature?', answer: 'P = (nRT) ÷ V. 2 mol of gas in a 5 L container at 300 K has a pressure of (2 × 8.31446261815324 × 300) ÷ 0.005 ≈ 997,736 Pa, about 9.85 atm.' },
        { question: 'Why does the formula need kelvin instead of Celsius?', answer: 'Kelvin is an absolute scale with no offset, starting at true zero thermal motion. Celsius and Fahrenheit have an arbitrary zero point, so using them directly in PV = nRT (instead of converting to kelvin first) gives an incorrect, sometimes negative, result.' },
        { question: 'What is the value of the gas constant, R?', answer: '8.31446261815324 J/(mol·K) in SI units — an exact value since 2019, when the Avogadro and Boltzmann constants that define it were themselves fixed by definition.' },
        { question: 'Does the ideal gas law work for any gas?', answer: 'It is a good approximation for most common gases (air, oxygen, nitrogen, carbon dioxide) at ordinary temperatures and pressures. It becomes less accurate at very high pressure or very low temperature, where real molecular size and intermolecular attraction start to matter.' },
        { question: 'How is concentration related to the ideal gas law?', answer: 'Dividing both sides by V gives n ÷ V = P ÷ (RT) — the gas’s concentration in moles per unit volume, shown as a bonus result above. It is the same quantity as molarity, just applied to a gas rather than a solution.' }
      ]
    },
    compute(values) {
      return { volume: (values.moles * 8.31446261815324 * values.temperature) / values.pressure };
    }
  },
  {
    id: 'combined-gas-law-calculator',
    category: 'chemistry',
    glyph: 'PVT',
    updatedAt: '2026-11-08',
    aliases: ['combined gas law calculator', 'p1v1/t1 = p2v2/t2 calculator', 'combined gas law formula calculator', 'gas law two states calculator'],
    related: ['ideal-gas-law-calculator', 'molarity-calculator', 'pressure-converter'],
    title: 'Combined Gas Law Calculator (P₁V₁ ÷ T₁ = P₂V₂ ÷ T₂)',
    description: 'Solve the combined gas law for a fixed amount of gas moving between two states — any one of pressure, volume, or temperature, before or after, given the other five.',
    example: 'A 2.0 L balloon at 1.0 atm and 20°C (293.15 K), heated to 50°C (323.15 K) at the same 1.0 atm, expands to about 2.20 L.',
    solver: {
      defaultTarget: 'volume2',
      variables: [
        { id: 'pressure1', label: 'Initial pressure', symbol: 'P₁', dimension: 'pressure', defaultValue: 1, defaultUnit: 'atm' },
        { id: 'volume1', label: 'Initial volume', symbol: 'V₁', dimension: 'volume', defaultValue: 2, defaultUnit: 'L' },
        { id: 'temperature1', label: 'Initial temperature', symbol: 'T₁', dimension: 'temperature', defaultValue: 293.15, defaultUnit: 'K' },
        { id: 'pressure2', label: 'Final pressure', symbol: 'P₂', dimension: 'pressure', defaultValue: 1, defaultUnit: 'atm' },
        { id: 'volume2', label: 'Final volume', symbol: 'V₂', dimension: 'volume', defaultValue: 2.205, defaultUnit: 'L' },
        { id: 'temperature2', label: 'Final temperature', symbol: 'T₂', dimension: 'temperature', defaultValue: 323.15, defaultUnit: 'K' }
      ],
      solve: {
        pressure1: ({ pressure2, volume1, volume2, temperature1, temperature2 }) =>
          volume1 === 0 || temperature2 === 0 ? NaN : (pressure2 * volume2 * temperature1) / (temperature2 * volume1),
        volume1: ({ pressure1, pressure2, volume2, temperature1, temperature2 }) =>
          pressure1 === 0 || temperature2 === 0 ? NaN : (pressure2 * volume2 * temperature1) / (temperature2 * pressure1),
        temperature1: ({ pressure1, pressure2, volume1, volume2, temperature2 }) =>
          pressure2 === 0 || volume2 === 0 ? NaN : (pressure1 * volume1 * temperature2) / (pressure2 * volume2),
        pressure2: ({ pressure1, volume1, volume2, temperature1, temperature2 }) =>
          volume2 === 0 || temperature1 === 0 ? NaN : (pressure1 * volume1 * temperature2) / (temperature1 * volume2),
        volume2: ({ pressure1, pressure2, volume1, temperature1, temperature2 }) =>
          pressure2 === 0 || temperature1 === 0 ? NaN : (pressure1 * volume1 * temperature2) / (temperature1 * pressure2),
        temperature2: ({ pressure1, pressure2, volume1, volume2, temperature1 }) =>
          pressure1 === 0 || volume1 === 0 ? NaN : (pressure2 * volume2 * temperature1) / (pressure1 * volume1)
      }
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is the combined gas law?',
        paragraphs: [
          'The combined gas law, P₁V₁ ÷ T₁ = P₂V₂ ÷ T₂, describes what happens to a fixed amount of gas as its pressure, volume, and temperature all change together — from one state (subscript 1) to another (subscript 2). It merges three simpler relationships that each hold one variable fixed: Boyle’s law (pressure and volume, at constant temperature), Charles’s law (volume and temperature, at constant pressure), and Gay-Lussac’s law (pressure and temperature, at constant volume).',
          'It follows directly from the ideal gas law, PV = nRT: since n and R do not change for a fixed sample of gas, PV ÷ T must equal the same constant (nR) in both states, which is exactly what the combined gas law says. Unlike the ideal gas law, it never needs to know n or R at all — only the ratio between the two states — which makes it convenient whenever a problem gives a "before" and "after" without mentioning the amount of gas.',
          'A classic use is predicting how a sealed container of gas responds to a change in conditions: a balloon that is heated, a scuba tank brought up from depth, or a sealed bag of chips carried to a higher altitude. As long as no gas is added, removed, or leaked out, the same fixed amount of gas obeys this one equation across the change.'
        ]
      },
      howTo: {
        intro: 'Fill in any five of the six values — the three "before" and three "after" conditions; the sixth fills in automatically.',
        steps: [
          { name: 'Identify the two states', text: 'State 1 is the starting pressure, volume, and temperature; state 2 is the same gas after whatever changed — heating, compressing, or moving it.' },
          { name: 'Enter five of the six values', text: 'Any five, mixing "before" and "after" as needed. Pick a unit for each; pressure in atm, kPa, bar or psi, volume in L, mL or m³, and temperature in K, °C or °F all work.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 20°C becomes 293.15 K instead of silently turning into 20 K.' },
          { name: 'Read the result', text: 'The missing value appears immediately in your chosen unit.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'P₁V₁ ÷ T₁ = P₂V₂ ÷ T₂ rearranges to solve for any one of the six quantities, given the other five.',
        expression: 'P₁V₁ ÷ T₁ = P₂V₂ ÷ T₂\nV₂ = (P₁V₁T₂) ÷ (T₁P₂)\nP₂ = (P₁V₁T₂) ÷ (T₁V₂)\nT₂ = (P₂V₂T₁) ÷ (P₁V₁)',
        terms: [
          { symbol: 'P₁, V₁, T₁', meaning: 'Pressure, volume, and absolute temperature of the gas in its starting state.' },
          { symbol: 'P₂, V₂, T₂', meaning: 'Pressure, volume, and absolute temperature of the same, fixed amount of gas in its final state.' }
        ],
        note: 'Temperature must be absolute (kelvin) for the same reason as the ideal gas law — this calculator converts automatically, but a hand calculation using Celsius or Fahrenheit directly gives a wrong answer.'
      },
      workedExample: {
        intro: 'A 2.0 L balloon at 1.0 atm and 20°C (293.15 K) is warmed to 50°C (323.15 K), with the pressure unchanged at 1.0 atm. What is its new volume?',
        rows: [
          { label: 'Initial state (P₁, V₁, T₁)', value: '1.0 atm, 2.0 L, 293.15 K' },
          { label: 'Final state (P₂, T₂)', value: '1.0 atm, 323.15 K' },
          { label: 'Final volume (V₂ = P₁V₁T₂ ÷ (T₁P₂))', value: '(1.0 × 2.0 × 323.15) ÷ (293.15 × 1.0)' }
        ],
        result: 'V₂ ≈ 2.205 L',
        explanation: 'Because the pressure does not change (P₁ = P₂), the two pressures cancel and this reduces to Charles’s law: the volume grows in direct proportion to the absolute temperature. 323.15 ÷ 293.15 ≈ 1.1023, so the final volume is about 1.1023 × 2.0 ≈ 2.205 L — roughly a 10.2% increase for a 30°C rise, not the much larger change it would be if read directly off the Celsius numbers.'
      },
      watchOut: [
        {
          title: 'This assumes the amount of gas does not change',
          body: 'The combined gas law describes a fixed, sealed sample of gas moving from one set of conditions to another. If gas is added, leaks out, or reacts with something along the way, n is no longer constant and this single equation no longer applies — use the ideal gas law separately for each state instead.'
        },
        {
          title: 'Temperature must be absolute (kelvin), not Celsius or Fahrenheit',
          body: 'Just like the ideal gas law, this formula needs an absolute temperature scale. A 30°C rise is not "30 K out of nothing" — it has to be read as a change from 293.15 K to 323.15 K, a change of only about 10%, not treated as if Celsius itself started at zero.'
        },
        {
          title: 'If one quantity is held constant, the formula simplifies — but still needs the constant value entered',
          body: 'When pressure does not change (P₁ = P₂), the law reduces to Charles’s law; when temperature does not change, it reduces to Boyle’s law. Even then, enter the unchanged value on both sides rather than leaving a field blank — the calculator needs all five known values to solve the sixth.'
        },
        {
          title: 'This is not the same equation as the ideal gas law',
          body: 'The ideal gas law (PV = nRT) needs to know the actual amount of gas, n, and gives an absolute volume, pressure, or temperature for one state. The combined gas law skips n entirely and only compares two states of the same fixed sample — use whichever one the problem actually gives you enough information for.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §9.2 "Relating Pressure, Volume, Amount, and Temperature: The Ideal Gas Law" (derivation from Boyle’s, Charles’s, and Gay-Lussac’s laws)', url: 'https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law' },
        { label: 'IUPAC Gold Book, "standard conditions for gases" (STP)', url: 'https://goldbook.iupac.org/terms/view/S05925' }
      ]
    },
    inputs: [
      { id: 'pressure1', label: 'Initial pressure (Pa)', type: 'number', placeholder: '101325', defaultValue: 101325, step: 1, min: 0 },
      { id: 'volume1', label: 'Initial volume (m³)', type: 'number', placeholder: '0.002', defaultValue: 0.002, step: 0.0001, min: 0 },
      { id: 'temperature1', label: 'Initial temperature (K)', type: 'number', placeholder: '293.15', defaultValue: 293.15, step: 0.01, min: 0 },
      { id: 'pressure2', label: 'Final pressure (Pa)', type: 'number', placeholder: '101325', defaultValue: 101325, step: 1, min: 0 },
      { id: 'temperature2', label: 'Final temperature (K)', type: 'number', placeholder: '323.15', defaultValue: 323.15, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Combined Gas Law Calculator – P₁V₁/T₁ = P₂V₂/T₂',
      description: 'Free combined gas law calculator. Solve P₁V₁÷T₁ = P₂V₂÷T₂ for any of the six pressure, volume, and temperature values, with a worked example.',
      faq: [
        { question: 'What is the combined gas law formula?', answer: 'P₁V₁ ÷ T₁ = P₂V₂ ÷ T₂, where the subscript 1 is the gas’s starting pressure, volume, and absolute temperature, and subscript 2 is the same fixed amount of gas after a change in conditions.' },
        { question: 'How is the combined gas law different from the ideal gas law?', answer: 'The ideal gas law, PV = nRT, needs the actual amount of gas (n) and solves for one absolute state. The combined gas law compares two states of the same fixed amount of gas and never needs to know n at all.' },
        { question: 'How do I find a gas’s new volume after heating it?', answer: 'V₂ = (P₁V₁T₂) ÷ (T₁P₂). A 2.0 L balloon at 1.0 atm and 293.15 K (20°C), heated to 323.15 K (50°C) at the same pressure, reaches (1.0 × 2.0 × 323.15) ÷ (293.15 × 1.0) ≈ 2.205 L.' },
        { question: 'Does the combined gas law reduce to Boyle’s law or Charles’s law?', answer: 'Yes. Holding temperature constant (T₁ = T₂) leaves P₁V₁ = P₂V₂, Boyle’s law. Holding pressure constant (P₁ = P₂) leaves V₁ ÷ T₁ = V₂ ÷ T₂, Charles’s law.' },
        { question: 'Why must temperature be in kelvin?', answer: 'Kelvin has no offset zero, so ratios like T₂ ÷ T₁ are only meaningful on that scale. Using Celsius or Fahrenheit directly in the ratio gives an incorrect answer, since those scales start at an arbitrary point rather than true zero.' },
        { question: 'Does this formula work if the amount of gas changes?', answer: 'No. It assumes a sealed, fixed amount of gas moving between two states. If gas is added, removed, or produced or consumed by a reaction, use the ideal gas law for each state separately instead.' }
      ]
    },
    compute(values) {
      return { volume2: (values.pressure1 * values.volume1 * values.temperature2) / (values.temperature1 * values.pressure2) };
    }
  },
  {
    id: 'ph-poh-calculator',
    category: 'chemistry',
    glyph: 'pH',
    updatedAt: '2026-11-08',
    aliases: ['ph calculator', 'poh calculator', 'ph to poh calculator', 'ph to hydrogen ion concentration calculator', 'ph poh converter', 'hydrogen ion concentration calculator'],
    related: ['pka-henderson-hasselbalch-calculator', 'molarity-calculator', 'dilution-calculator'],
    title: 'pH / pOH Calculator',
    description: 'Convert between pH and pOH (pH + pOH = 14.00 at 25°C), with the hydrogen-ion and hydroxide-ion concentrations each one implies, in mol/L.',
    example: 'A solution with a pH of 4.00 has a pOH of 10.00, a hydrogen-ion concentration of 1 × 10⁻⁴ mol/L, and a hydroxide-ion concentration of 1 × 10⁻¹⁰ mol/L.',
    solver: {
      defaultTarget: 'pOH',
      variables: [
        { id: 'pH', label: 'pH', symbol: 'pH', dimension: 'pH', defaultValue: 4, defaultUnit: 'pH' },
        { id: 'pOH', label: 'pOH', symbol: 'pOH', dimension: 'pH', defaultValue: 10, defaultUnit: 'pH' }
      ],
      solve: {
        pOH: ({ pH }) => 14 - pH,
        pH: ({ pOH }) => 14 - pOH
      },
      outputs: [
        { id: 'hConcentration', label: 'Hydrogen-ion concentration [H⁺]', dimension: 'concentration', unit: 'mol/L', compute: (si) => 10 ** -si.pH * 1000 },
        { id: 'ohConcentration', label: 'Hydroxide-ion concentration [OH⁻]', dimension: 'concentration', unit: 'mol/L', compute: (si) => 10 ** -si.pOH * 1000 }
      ]
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What are pH and pOH?',
        paragraphs: [
          'pH measures how acidic or basic a water-based solution is, defined as pH = −log₁₀[H⁺], where [H⁺] is the hydrogen-ion (more precisely, hydronium-ion) concentration in moles per liter. Because it is a logarithmic scale, each whole step in pH is a 10-fold change in [H⁺] — a solution with pH 3 has ten times the hydrogen-ion concentration of one with pH 4, and a hundred times that of pH 5.',
          'pOH is the same idea applied to the hydroxide ion: pOH = −log₁₀[OH⁻]. In pure water at 25°C, water molecules dissociate into H⁺ and OH⁻ just enough that [H⁺][OH⁻] = 1.0 × 10⁻¹⁴ (the water dissociation constant, Kw). Taking −log₁₀ of both sides gives pH + pOH = 14.00 at that same temperature — so knowing either one tells you the other, and both ion concentrations, without any further measurement.',
          'A pH of exactly 7.00 (and a matching pOH of 7.00) is neutral at 25°C — equal concentrations of H⁺ and OH⁻. Below 7 is acidic (more H⁺ than OH⁻), and above 7 is basic, or alkaline (more OH⁻ than H⁺). The common 0–14 range is a convenience, not a hard limit: very strong acids and bases can have a pH below 0 or above 14.'
        ]
      },
      howTo: {
        intro: 'Enter either pH or pOH; the other, and both ion concentrations, fill in automatically.',
        steps: [
          { name: 'Enter the value you know', text: 'Type a pH or a pOH reading — from a meter, a test strip, or a textbook problem.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input instead; the other field becomes the calculated one.' },
          { name: 'Read the result', text: 'The other of pH/pOH appears immediately, with the hydrogen-ion and hydroxide-ion concentrations it implies shown underneath, in mol/L.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact value. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'pH and pOH are related through water’s dissociation constant at 25°C, and each converts directly to its own ion concentration.',
        expression: 'pH = −log₁₀[H⁺]\npOH = −log₁₀[OH⁻]\npH + pOH = 14.00 (at 25°C)\n[H⁺] = 10⁻ᵖᴴ\n[OH⁻] = 10⁻ᵖᴼᴴ',
        terms: [
          { symbol: 'pH', meaning: 'The negative base-10 logarithm of the hydrogen-ion concentration, in mol/L.' },
          { symbol: 'pOH', meaning: 'The negative base-10 logarithm of the hydroxide-ion concentration, in mol/L.' },
          { symbol: '[H⁺], [OH⁻]', meaning: 'Hydrogen-ion and hydroxide-ion concentrations, in moles per liter (mol/L).' },
          { symbol: '14.00', meaning: 'pKw, the negative log of water’s dissociation constant (Kw = 1.0 × 10⁻¹⁴) at 25°C. This value shifts slightly at other temperatures.' }
        ],
        note: 'pH + pOH = 14.00 assumes 25°C, the standard reference temperature for Kw. At other temperatures, Kw (and therefore this sum) is slightly different.'
      },
      workedExample: {
        intro: 'A solution has a pH of 4.00. What is its pOH, and what are the hydrogen-ion and hydroxide-ion concentrations?',
        rows: [
          { label: 'pH', value: '4.00' },
          { label: 'pOH (14.00 − 4.00)', value: '10.00' },
          { label: 'Hydrogen-ion concentration ([H⁺] = 10⁻⁴·⁰⁰)', value: '1 × 10⁻⁴ mol/L' },
          { label: 'Hydroxide-ion concentration ([OH⁻] = 10⁻¹⁰·⁰⁰)', value: '1 × 10⁻¹⁰ mol/L' }
        ],
        result: 'pOH = 10.00 · [H⁺] = 1 × 10⁻⁴ mol/L · [OH⁻] = 1 × 10⁻¹⁰ mol/L',
        explanation: 'A pH of 4.00 is firmly acidic (well below the neutral 7.00), matching a hydrogen-ion concentration of exactly 1 × 10⁻⁴ mol/L — ten thousand times higher than pure water’s 1 × 10⁻⁷ mol/L. As a check, multiplying the two ion concentrations gives (1 × 10⁻⁴) × (1 × 10⁻¹⁰) = 1 × 10⁻¹⁴, matching Kw exactly.'
      },
      watchOut: [
        {
          title: 'pH + pOH = 14 only holds at 25°C',
          body: 'That 14.00 figure is −log₁₀(Kw) specifically at 25°C. Kw increases with temperature (water dissociates more as it warms), so a hot solution’s neutral point is actually slightly below pH 7, even though pH + pOH still equals pKw at whatever temperature Kw is measured at.'
        },
        {
          title: 'pH is not bounded to 0–14 in principle',
          body: 'The 0–14 range covers most dilute aqueous solutions encountered in a lab, but concentrated strong acids and bases can fall outside it — a pH below 0 or above 14 is unusual but not mathematically impossible.'
        },
        {
          title: 'A small pH difference is a large concentration difference',
          body: 'Because the scale is logarithmic, a "small" change from pH 4 to pH 3 is a 10-fold jump in hydrogen-ion concentration, not a 25% one. Comparing pH values by simple subtraction can understate how different two solutions’ actual acidity is.'
        },
        {
          title: 'This calculator assumes a dilute, ideal aqueous solution',
          body: 'At high concentrations, ion activity (the "effective" concentration that actually governs chemical behavior) diverges from the simple mol/L figure used here. The formulas above are the standard introductory-chemistry treatment, accurate for the dilute solutions most coursework and lab work deals with.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §14.3 "Relative Strengths of Acids and Bases" (pH, pOH, and Kw)', url: 'https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases' },
        { label: 'IUPAC Gold Book, "pH"', url: 'https://goldbook.iupac.org/terms/view/P04524' },
        { label: 'NIST Chemistry WebBook — ionization constant of water (Kw) and its temperature dependence', url: 'https://webbook.nist.gov/' }
      ]
    },
    inputs: [{ id: 'pH', label: 'pH', type: 'number', placeholder: '4', defaultValue: 4, step: 0.01 }],
    seo: {
      title: 'pH / pOH Calculator – Convert pH, pOH, [H⁺] and [OH⁻]',
      description: 'Free pH to pOH calculator. Convert between pH and pOH (pH + pOH = 14 at 25°C) and find the hydrogen-ion and hydroxide-ion concentrations, in mol/L.',
      faq: [
        { question: 'How do I convert pH to pOH?', answer: 'Subtract from 14.00 (at 25°C): pOH = 14.00 − pH. A pH of 4.00 gives a pOH of 10.00.' },
        { question: 'How do I convert pOH to pH?', answer: 'The same subtraction works both ways: pH = 14.00 − pOH. A pOH of 10.00 gives a pH of 4.00.' },
        { question: 'How do I find [H⁺] from pH?', answer: '[H⁺] = 10⁻ᵖᴴ, in mol/L. A pH of 4.00 gives [H⁺] = 10⁻⁴·⁰⁰ = 1 × 10⁻⁴ mol/L.' },
        { question: 'How do I find [OH⁻] from pOH?', answer: '[OH⁻] = 10⁻ᵖᴼᴴ, in mol/L. A pOH of 10.00 gives [OH⁻] = 10⁻¹⁰·⁰⁰ = 1 × 10⁻¹⁰ mol/L.' },
        { question: 'Why does pH + pOH equal 14?', answer: 'Because [H⁺][OH⁻] = Kw = 1.0 × 10⁻¹⁴ at 25°C. Taking −log₁₀ of both sides turns that product into a sum: pH + pOH = −log₁₀(Kw) = 14.00, at that same temperature.' },
        { question: 'What pH is neutral?', answer: '7.00 at 25°C, where [H⁺] = [OH⁻] = 1 × 10⁻⁷ mol/L. Below 7 is acidic; above 7 is basic (alkaline).' },
        { question: 'Does pH + pOH = 14 at every temperature?', answer: 'No — only at 25°C, the temperature Kw = 1.0 × 10⁻¹⁴ is defined for. Kw rises as water gets warmer, so the pH+pOH sum (and the neutral pH) shifts slightly at other temperatures.' }
      ]
    },
    compute(values) {
      return { pOH: 14 - values.pH };
    }
  },
  {
    id: 'pka-henderson-hasselbalch-calculator',
    category: 'chemistry',
    glyph: 'pKa',
    updatedAt: '2026-11-08',
    aliases: ['henderson-hasselbalch calculator', 'pka calculator', 'buffer ph calculator', 'henderson hasselbalch equation calculator', 'pka from ph calculator'],
    related: ['ph-poh-calculator', 'molarity-calculator', 'dilution-calculator'],
    title: 'pKa Calculator (Henderson-Hasselbalch Equation)',
    description: 'Solve the Henderson-Hasselbalch equation, pH = pKa + log₁₀([A⁻] ÷ [HA]), for pH, pKa, or either concentration in an acid-base buffer.',
    example: 'An acetic acid buffer (pKa 4.76) with 0.30 mol/L acetate (A⁻) and 0.20 mol/L acetic acid (HA) has a pH of about 4.94.',
    solver: {
      defaultTarget: 'pH',
      variables: [
        { id: 'pH', label: 'pH', symbol: 'pH', dimension: 'pH', defaultValue: 4.94, defaultUnit: 'pH' },
        { id: 'pKa', label: 'pKa', symbol: 'pKₐ', dimension: 'pH', defaultValue: 4.76, defaultUnit: 'pH' },
        { id: 'baseConcentration', label: 'Conjugate base concentration [A⁻]', symbol: '[A⁻]', dimension: 'concentration', defaultValue: 0.3, defaultUnit: 'mol/L' },
        { id: 'acidConcentration', label: 'Weak acid concentration [HA]', symbol: '[HA]', dimension: 'concentration', defaultValue: 0.2, defaultUnit: 'mol/L' }
      ],
      solve: {
        pH: ({ pKa, baseConcentration, acidConcentration }) =>
          baseConcentration <= 0 || acidConcentration <= 0 ? NaN : pKa + Math.log10(baseConcentration / acidConcentration),
        pKa: ({ pH, baseConcentration, acidConcentration }) =>
          baseConcentration <= 0 || acidConcentration <= 0 ? NaN : pH - Math.log10(baseConcentration / acidConcentration),
        baseConcentration: ({ pH, pKa, acidConcentration }) => (acidConcentration <= 0 ? NaN : acidConcentration * 10 ** (pH - pKa)),
        acidConcentration: ({ pH, pKa, baseConcentration }) => (baseConcentration <= 0 ? NaN : baseConcentration / 10 ** (pH - pKa))
      },
      outputs: [{ id: 'ratio', label: 'Ratio [A⁻] ÷ [HA]', dimension: 'count', compute: (si) => (si.acidConcentration <= 0 ? NaN : si.baseConcentration / si.acidConcentration) }]
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is the Henderson-Hasselbalch equation?',
        paragraphs: [
          'The Henderson-Hasselbalch equation, pH = pKa + log₁₀([A⁻] ÷ [HA]), gives the pH of a buffer solution — a mixture of a weak acid (HA) and its conjugate base (A⁻) — from the acid’s own pKa and the ratio of the two concentrations. pKa is a fixed property of the weak acid itself, the pH at which it is exactly half dissociated into H⁺ and its conjugate base.',
          'The equation is a rearrangement of the weak acid’s equilibrium expression, Ka = [H⁺][A⁻] ÷ [HA], solved for pH after taking −log₁₀ of both sides. It is named after biochemist Lawrence Joseph Henderson, who first derived the underlying relationship, and chemist Karl Albert Hasselbalch, who recast it in terms of pH.',
          'Its single most useful consequence is what happens when the two concentrations are equal: log₁₀(1) = 0, so pH = pKa exactly. That is why pKa is reported as "the pH where the acid is half-dissociated" — and why buffers are typically prepared with a weak acid whose pKa sits close to the target pH, since that keeps the [A⁻] ÷ [HA] ratio, and therefore the buffer’s resistance to pH change in either direction, close to balanced.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of pH, pKa, the base concentration, and the acid concentration; the fourth fills in automatically.',
        steps: [
          { name: 'Look up the weak acid’s pKa', text: 'Each weak acid has its own fixed pKa — about 4.76 for acetic acid, for example. Use the value for the specific acid in your buffer.' },
          { name: 'Enter the three values you know', text: 'pH, pKa, and either concentration — or both concentrations and pKa, to find pH.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result and the ratio', text: 'The missing value appears immediately, with the concentration ratio [A⁻] ÷ [HA] shown underneath.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'pH = pKa + log₁₀([A⁻] ÷ [HA]) rearranges to solve for pKa or either concentration as well.',
        expression: 'pH = pKa + log₁₀([A⁻] ÷ [HA])\npKa = pH − log₁₀([A⁻] ÷ [HA])\n[A⁻] = [HA] × 10^(pH − pKa)\n[HA] = [A⁻] ÷ 10^(pH − pKa)',
        terms: [
          { symbol: 'pKa', meaning: 'The negative base-10 logarithm of the weak acid’s dissociation constant, Ka — a fixed property of that acid.' },
          { symbol: '[A⁻]', meaning: 'Concentration of the conjugate base (the deprotonated, "A minus" form), in mol/L.' },
          { symbol: '[HA]', meaning: 'Concentration of the undissociated weak acid, in mol/L.' },
          { symbol: '[A⁻] ÷ [HA]', meaning: 'The buffer ratio. Only this ratio matters, not the absolute concentrations — doubling both leaves pH unchanged.' }
        ],
        note: 'Because only the ratio of the two concentrations matters, they can be entered in any consistent concentration unit (mol/L, mmol/L, and so on) as long as both use the same one.'
      },
      workedExample: {
        intro: 'An acetic acid buffer has a pKa of 4.76, with 0.30 mol/L of acetate (A⁻) and 0.20 mol/L of acetic acid (HA). What is its pH?',
        rows: [
          { label: 'pKa', value: '4.76' },
          { label: 'Conjugate base [A⁻]', value: '0.30 mol/L' },
          { label: 'Weak acid [HA]', value: '0.20 mol/L' },
          { label: 'Ratio ([A⁻] ÷ [HA])', value: '0.30 ÷ 0.20 = 1.5' },
          { label: 'pH (4.76 + log₁₀(1.5))', value: '4.76 + 0.176 = 4.936' }
        ],
        result: 'pH ≈ 4.94',
        explanation: 'log₁₀(1.5) ≈ 0.176, so the pH sits a little above the acid’s pKa of 4.76 — consistent with there being more of the conjugate base than the acid form. If the two concentrations were instead equal (a 1:1 ratio), the pH would land exactly on 4.76, since log₁₀(1) = 0.'
      },
      watchOut: [
        {
          title: 'pH = pKa only when the two concentrations are equal',
          body: 'This is the most useful single fact from the equation: log₁₀(1) = 0 when [A⁻] = [HA], so the pH exactly equals the acid’s pKa at that point — the basis for picking a buffer whose pKa is close to a target pH.'
        },
        {
          title: 'Only the ratio of the two concentrations matters, not their absolute size',
          body: 'A buffer with 0.30 mol/L A⁻ and 0.20 mol/L HA has the same pH as one with 3.0 mol/L A⁻ and 2.0 mol/L HA — both are a 1.5:1 ratio. The absolute concentrations instead determine the buffer’s capacity: how much acid or base it can absorb before its pH changes substantially.'
        },
        {
          title: 'This equation assumes a true buffer — a mix, not a pure acid or pure base',
          body: 'If either concentration is zero, the ratio is undefined (division by zero or the log of zero), and there is no buffer to speak of — just a solution of the acid or the base alone, whose pH comes from a separate weak-acid or weak-base equilibrium calculation instead.'
        },
        {
          title: 'pKa is specific to one weak acid — look up the correct value',
          body: 'Different weak acids have very different pKa values (acetic acid ≈ 4.76, carbonic acid’s first pKa ≈ 6.35, ammonium ≈ 9.25). Using the wrong acid’s pKa gives a pH for a buffer that is not actually the one being described.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §14.7 "Buffers" (the Henderson-Hasselbalch equation)', url: 'https://openstax.org/books/chemistry-2e/pages/14-7-buffers' },
        { label: 'IUPAC Gold Book, "Henderson-Hasselbalch equation"', url: 'https://goldbook.iupac.org/terms/view/H02777' }
      ]
    },
    inputs: [
      { id: 'pKa', label: 'pKa', type: 'number', placeholder: '4.76', defaultValue: 4.76, step: 0.01 },
      { id: 'baseConcentration', label: 'Conjugate base concentration (mol/m³)', type: 'number', placeholder: '300', defaultValue: 300, step: 1, min: 0 },
      { id: 'acidConcentration', label: 'Weak acid concentration (mol/m³)', type: 'number', placeholder: '200', defaultValue: 200, step: 1, min: 0 }
    ],
    seo: {
      title: 'pKa Calculator (Henderson-Hasselbalch Equation)',
      description: 'Free Henderson-Hasselbalch calculator. Solve pH = pKa + log₁₀([A⁻]/[HA]) for pH, pKa, or either buffer concentration, with a worked example.',
      faq: [
        { question: 'What is the Henderson-Hasselbalch equation?', answer: 'pH = pKa + log₁₀([A⁻] ÷ [HA]), where pKa is the weak acid’s own dissociation constant (as −log₁₀Ka), [A⁻] is the conjugate base concentration, and [HA] is the weak acid concentration.' },
        { question: 'How do I find the pH of a buffer?', answer: 'Add the acid’s pKa to the base-10 log of the conjugate base-to-acid concentration ratio: pH = pKa + log₁₀([A⁻]÷[HA]). A pKa of 4.76 with a 1.5:1 ratio gives 4.76 + log₁₀(1.5) ≈ 4.94.' },
        { question: 'What does it mean when pH equals pKa?', answer: 'The weak acid is exactly half dissociated — [A⁻] equals [HA], so their ratio is 1 and log₁₀(1) = 0, leaving pH = pKa exactly.' },
        { question: 'How do I find pKa from a measured pH?', answer: 'Rearrange to pKa = pH − log₁₀([A⁻]÷[HA]). A measured pH of 4.94 with a 1.5:1 buffer ratio gives pKa = 4.94 − log₁₀(1.5) ≈ 4.76.' },
        { question: 'Does the Henderson-Hasselbalch equation work for any acid-base pair?', answer: 'It applies specifically to a weak acid and its own conjugate base in solution together — a true buffer. It does not apply to a strong acid or strong base, which dissociate essentially completely rather than reaching the kind of equilibrium this equation describes.' },
        { question: 'What is the pKa of acetic acid?', answer: 'About 4.76 at 25°C, a commonly cited value for the weak acid used in acetate buffers.' },
        { question: 'Why do only the ratio of concentrations matter, not their absolute values?', answer: 'The equation only has a log of the ratio [A⁻]÷[HA] in it — doubling both concentrations leaves that ratio, and therefore the pH, unchanged. The absolute concentrations instead affect the buffer’s capacity, not its pH.' }
      ]
    },
    compute(values) {
      return { pH: values.pKa + Math.log10(values.baseConcentration / values.acidConcentration) };
    }
  },
  {
    id: 'percent-yield-calculator',
    category: 'chemistry',
    glyph: 'Y%',
    updatedAt: '2026-11-08',
    aliases: ['percent yield calculator', 'percentage yield calculator', 'actual vs theoretical yield calculator', 'reaction yield calculator', 'percent yield formula calculator'],
    related: ['theoretical-yield-calculator', 'mass-percent-calculator', 'molar-mass-calculator', 'moles-to-grams-calculator'],
    title: 'Percent Yield Calculator',
    description: 'Solve percent yield = (actual yield ÷ theoretical yield) × 100 for percent yield, actual yield, or theoretical yield in a chemical reaction.',
    example: 'A reaction with a theoretical yield of 45.0 g that actually produces 38.7 g of product has a percent yield of about 86.0%.',
    solver: {
      defaultTarget: 'percentYield',
      variables: [
        { id: 'percentYield', label: 'Percent yield', symbol: 'Y%', dimension: 'percent', defaultValue: 86, defaultUnit: '%' },
        { id: 'actualYield', label: 'Actual yield', symbol: 'mₐ', dimension: 'mass', defaultValue: 38.7, defaultUnit: 'g' },
        { id: 'theoreticalYield', label: 'Theoretical yield', symbol: 'mₜ', dimension: 'mass', defaultValue: 45, defaultUnit: 'g' }
      ],
      solve: {
        percentYield: ({ actualYield, theoreticalYield }) => (theoreticalYield === 0 ? NaN : (actualYield / theoreticalYield) * 100),
        actualYield: ({ percentYield, theoreticalYield }) => (percentYield / 100) * theoreticalYield,
        theoreticalYield: ({ percentYield, actualYield }) => (percentYield === 0 ? NaN : actualYield / (percentYield / 100))
      },
      outputs: [{ id: 'massLost', label: 'Mass not recovered', dimension: 'mass', unit: 'g', compute: (si) => si.theoreticalYield - si.actualYield }]
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is percent yield?',
        paragraphs: [
          'Percent yield compares how much product a reaction actually produced (the actual yield, measured on a lab balance) to how much it should have produced if every bit of limiting reagent converted perfectly into product (the theoretical yield, calculated from stoichiometry). It is written as percent yield = (actual yield ÷ theoretical yield) × 100.',
          'Real reactions almost never hit 100%. Some product is lost during transfer between containers, some side reaction consumes a bit of the starting material, a purification step (recrystallization, filtration) leaves some product behind, or the reaction simply does not go to completion. Percent yield is the standard way chemists report how efficient a given run of a reaction actually was.',
          'Theoretical yield itself comes from the reaction’s stoichiometry: the moles of limiting reagent, converted through the mole ratio in the balanced equation, then multiplied by the product’s molar mass. Percent yield is calculated after that figure is already known, as a simple ratio against what was actually isolated.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of percent yield, actual yield, and theoretical yield; the third fills in automatically.',
        steps: [
          { name: 'Find the theoretical yield', text: 'Calculate this from the reaction’s stoichiometry first (moles of limiting reagent × mole ratio × product’s molar mass) — it is not something this calculator derives on its own.' },
          { name: 'Weigh the actual yield', text: 'The mass of product actually isolated at the end of the experiment, after any purification.' },
          { name: 'Enter the two values you know', text: 'Any two of the three — often actual and theoretical yield, to find percent yield.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result', text: 'The missing value appears immediately, with the mass not recovered (theoretical minus actual) shown underneath.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Percent yield rearranges to solve for actual or theoretical yield as well.',
        expression: 'Percent yield = (actual yield ÷ theoretical yield) × 100\nActual yield = (percent yield ÷ 100) × theoretical yield\nTheoretical yield = actual yield ÷ (percent yield ÷ 100)',
        terms: [
          { symbol: 'Actual yield', meaning: 'The mass of product actually obtained from the reaction, measured directly.' },
          { symbol: 'Theoretical yield', meaning: 'The maximum possible mass of product, calculated from the limiting reagent’s stoichiometry, assuming the reaction goes to completion with no losses.' },
          { symbol: 'Percent yield', meaning: 'What fraction of the theoretical maximum was actually obtained, as a percentage.' }
        ],
        note: 'Theoretical yield must be worked out separately from the balanced equation and the limiting reagent — this calculator takes it as a given input, the same way a lab report would.'
      },
      workedExample: {
        intro: 'A reaction has a theoretical yield of 45.0 g. The chemist actually isolates 38.7 g of product. What is the percent yield?',
        rows: [
          { label: 'Theoretical yield', value: '45.0 g' },
          { label: 'Actual yield', value: '38.7 g' },
          { label: 'Percent yield (38.7 ÷ 45.0 × 100)', value: '86.0%' },
          { label: 'Mass not recovered (45.0 − 38.7)', value: '6.3 g' }
        ],
        result: 'Percent yield = 86.0%',
        explanation: '38.7 divided by 45.0 is 0.86, or 86.0% once multiplied by 100 — a solid yield for a typical undergraduate lab synthesis. The remaining 6.3 g (14.0% of the theoretical maximum) was lost somewhere along the way: transfer losses, a side reaction, or material left behind during purification.'
      },
      watchOut: [
        {
          title: 'Percent yield should not exceed 100% — if it does, check for impurities or measurement error',
          body: 'A result over 100% usually means the isolated "product" still contains leftover solvent, unreacted starting material, or another impurity adding extra mass, rather than the reaction genuinely outperforming its own stoichiometric limit. It can also mean the theoretical yield itself was miscalculated.'
        },
        {
          title: 'Theoretical yield comes from the limiting reagent, not just any reactant',
          body: 'If a reaction has two reactants, the theoretical yield is based on whichever one runs out first (the limiting reagent) — not the one present in the largest amount. Basing the calculation on the wrong reactant gives a theoretical yield, and therefore a percent yield, that does not reflect the actual reaction.'
        },
        {
          title: 'Percent yield measures efficiency, not purity',
          body: 'A high percent yield says a lot of mass was recovered, but says nothing about whether that mass is pure product. A reaction could have a high percent yield and still need further purification, or a lower percent yield of very pure material.'
        },
        {
          title: 'Keep actual and theoretical yield in the same mass unit',
          body: 'The ratio only makes sense if both yields are measured in the same substance and the same unit — grams compared to grams, not grams compared to moles, and not the mass of a different compound (a byproduct, say) compared to the intended product.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §4.4 "Reaction Yields" (actual, theoretical, and percent yield)', url: 'https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields' },
        { label: 'IUPAC Gold Book, "yield" (chemical reaction)', url: 'https://goldbook.iupac.org/terms/view/Y00001' }
      ]
    },
    inputs: [
      { id: 'actualYield', label: 'Actual yield (g)', type: 'number', placeholder: '38.7', defaultValue: 38.7, step: 0.01, min: 0 },
      { id: 'theoreticalYield', label: 'Theoretical yield (g)', type: 'number', placeholder: '45', defaultValue: 45, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Percent Yield Calculator – Actual ÷ Theoretical × 100',
      description: 'Free percent yield calculator. Solve (actual ÷ theoretical) × 100 for percent yield, actual yield, or theoretical yield, with a worked example.',
      faq: [
        { question: 'What is the percent yield formula?', answer: 'Percent yield = (actual yield ÷ theoretical yield) × 100. An actual yield of 38.7 g against a theoretical yield of 45.0 g gives (38.7 ÷ 45.0) × 100 = 86.0%.' },
        { question: 'How do I find actual yield from a percent yield?', answer: 'Multiply: actual yield = (percent yield ÷ 100) × theoretical yield. An 86.0% yield from a 45.0 g theoretical yield gives 0.86 × 45.0 = 38.7 g.' },
        { question: 'How do I find theoretical yield from a percent yield?', answer: 'Divide: theoretical yield = actual yield ÷ (percent yield ÷ 100). An actual yield of 38.7 g at 86.0% gives 38.7 ÷ 0.86 = 45.0 g.' },
        { question: 'Can percent yield be over 100%?', answer: 'Not genuinely — a result over 100% almost always points to impurities, leftover solvent, or unreacted starting material adding extra mass to what was weighed as "product," or an error in the theoretical yield calculation.' },
        { question: 'What counts as a good percent yield?', answer: 'It depends on the reaction, but 90%+ is considered excellent, 70–90% good, and below 50% often prompts a look at the procedure — multi-step syntheses in particular tend to have lower overall yields since losses compound at each step.' },
        { question: 'How is theoretical yield calculated?', answer: 'From the balanced equation: convert the limiting reagent’s mass to moles, use the mole ratio in the equation to find moles of product, then multiply by the product’s molar mass. This calculator takes that result as a given input — the theoretical yield calculator does that conversion directly.' },
        { question: 'Why is percent yield usually less than 100%?', answer: 'Real reactions lose some material to side reactions, incomplete conversion, or losses during transfer and purification (filtration, recrystallization) — few lab procedures recover every last bit of theoretically possible product.' }
      ]
    },
    compute(values) {
      return { percentYield: (values.actualYield / values.theoreticalYield) * 100 };
    }
  },
  {
    id: 'limiting-reagent-calculator',
    category: 'chemistry',
    glyph: 'LR',
    updatedAt: '2026-11-08',
    aliases: ['limiting reagent calculator', 'limiting reactant calculator', 'excess reagent calculator', 'which reactant is limiting calculator', 'limiting reagent problems calculator'],
    related: ['theoretical-yield-calculator', 'stoichiometry-calculator', 'percent-yield-calculator', 'molar-mass-calculator'],
    title: 'Limiting Reagent Calculator',
    description: 'Compare two reactants’ available moles against a balanced equation’s coefficients to find which one runs out first (the limiting reagent) and how much of the other is left over.',
    example: 'Reacting 3 mol of N₂ with 6 mol of H₂ in N₂ + 3H₂ → 2NH₃ makes H₂ the limiting reagent — only 2 of the 3 mol of N₂ actually reacts, leaving 1 mol unreacted.',
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is a limiting reagent?',
        paragraphs: [
          'A balanced chemical equation sets a fixed ratio between reactants — N₂ + 3H₂ → 2NH₃ always consumes 3 mol of H₂ for every 1 mol of N₂. Real reactants are rarely mixed in exactly that ratio, so one of them runs out first. That reactant is the limiting reagent: it determines how much product can form, and the reaction stops (or slows to whatever is left) once it is gone.',
          'The other reactant is in excess — some of it is left over, unreacted, once the limiting reagent is used up. Figuring out which is which means more than comparing the raw mole counts of the two reactants; it means comparing each one’s moles divided by its own coefficient in the balanced equation, since a reaction that needs 3 mol of H₂ per 1 mol of N₂ treats those two reactants very differently.',
          'This is normally the first step in a longer calculation: once the limiting reagent is identified, its moles feed into the theoretical yield calculation (see the theoretical yield calculator) to find the maximum possible mass of product.'
        ]
      },
      howTo: {
        intro: 'Enter each reactant’s available moles and its coefficient from the balanced equation.',
        steps: [
          { name: 'Write and balance the chemical equation', text: 'The coefficients only mean anything once the equation is balanced — N₂ + 3H₂ → 2NH₃ has coefficients 1 and 3 for the two reactants.' },
          { name: 'Enter Reactant A’s available moles and coefficient', text: 'How much of it you actually have, in moles, and its coefficient in the balanced equation.' },
          { name: 'Enter Reactant B’s available moles and coefficient', text: 'The same two numbers for the other reactant.' },
          { name: 'Read which reagent is limiting', text: 'The result names the limiting reagent and shows how much of each reactant is actually consumed and how much of the excess one is left over.' },
          { name: 'Carry the limiting reagent’s moles forward', text: 'Use its full available amount (now shown as fully consumed) as the input to the theoretical yield calculator.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Divide each reactant’s available moles by its own coefficient; whichever result is smaller names the limiting reagent.',
        expression: 'nᴬ ÷ cᴬ vs. nᴮ ÷ cᴮ\n(smaller value = limiting reagent)\nextent = min(nᴬ ÷ cᴬ, nᴮ ÷ cᴮ)\nused = extent × coefficient',
        terms: [
          { symbol: 'nᴬ, nᴮ', meaning: 'Moles of Reactant A and Reactant B actually available before the reaction.' },
          { symbol: 'cᴬ, cᴮ', meaning: 'Each reactant’s coefficient in the balanced equation.' },
          { symbol: 'extent', meaning: 'How many “sets” of the balanced equation can run to completion — the smaller of the two per-coefficient ratios.' }
        ],
        note: 'A tie (nᴬ ÷ cᴬ = nᴮ ÷ cᴮ) means both reactants run out at exactly the same point, with nothing left over on either side.'
      },
      workedExample: {
        intro: 'The Haber process makes ammonia from nitrogen and hydrogen: N₂ + 3H₂ → 2NH₃. Starting with 3 mol of N₂ and 6 mol of H₂, which reactant is limiting?',
        rows: [
          { label: 'N₂ available ÷ its coefficient (3 ÷ 1)', value: '3' },
          { label: 'H₂ available ÷ its coefficient (6 ÷ 3)', value: '2' },
          { label: 'Smaller value → limiting reagent', value: 'H₂ (2 < 3)' },
          { label: 'N₂ actually consumed (extent 2 × coefficient 1)', value: '2 mol' },
          { label: 'N₂ left over (3 − 2)', value: '1 mol' },
          { label: 'H₂ actually consumed (extent 2 × coefficient 3)', value: '6 mol (all of it)' }
        ],
        result: 'H₂ is the limiting reagent; 1 mol of N₂ is left over.',
        explanation: 'Dividing each reactant’s available moles by its coefficient gives 3 for N₂ and 2 for H₂. The smaller number, H₂’s, means H₂ runs out first — all 6 mol of it reacts. That only consumes 2 mol of the 3 mol of N₂ available (since the ratio is 1 N₂ to 3 H₂), leaving 1 mol of N₂ unreacted.'
      },
      watchOut: [
        {
          title: 'Compare moles divided by coefficient, not raw moles',
          body: 'Having more moles of a reactant does not mean it is in excess. 6 mol of H₂ is more than 3 mol of N₂, but H₂ is still the limiting reagent here, because the equation needs 3 mol of H₂ for every 1 mol of N₂ — dividing by the coefficient is what makes the comparison fair.'
        },
        {
          title: 'Coefficients must come from a correctly balanced equation',
          body: 'This calculator takes the coefficients as given; it does not balance the equation for itself. An unbalanced or mis-copied equation (wrong coefficients) gives a confidently wrong answer about which reactant is limiting.'
        },
        {
          title: 'Leftover amount is in moles of that reactant, not a mass',
          body: 'The “left over” figure is moles of the excess reactant that never reacted — converting it to a mass needs that reactant’s own molar mass (see the moles-to-grams calculator), a separate step from identifying the limiting reagent.'
        },
        {
          title: 'This compares exactly two reactants',
          body: 'Many real reactions have more than two reactants. Extending this method to three or more means computing moles-available ÷ coefficient for every reactant and taking the smallest of all of them, not just a pairwise comparison.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §4.4 "Reaction Yields" (limiting reactant and theoretical yield)', url: 'https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields' },
        { label: 'OpenStax, Chemistry 2e, §4.3 "Reaction Stoichiometry" (mole-ratio calculations from a balanced equation)', url: 'https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry' }
      ]
    },
    inputs: [
      { id: 'molesA', label: 'Reactant A available (mol)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.01, min: 0 },
      { id: 'coeffA', label: 'Reactant A coefficient', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'molesB', label: 'Reactant B available (mol)', type: 'number', placeholder: '6', defaultValue: 6, step: 0.01, min: 0 },
      { id: 'coeffB', label: 'Reactant B coefficient', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 1 }
    ],
    breakdown: {
      headline: 'limitingReagent',
      headlineLabel: 'Limiting reagent',
      outputs: [
        { id: 'limitingReagent', label: 'Limiting reagent', labels: [{ value: 0, label: 'Reactant A' }, { value: 1, label: 'Reactant B' }] },
        { id: 'usedA', label: 'Reactant A consumed (mol)', format: 'significant' },
        { id: 'leftoverA', label: 'Reactant A left over (mol)', format: 'significant' },
        { id: 'usedB', label: 'Reactant B consumed (mol)', format: 'significant' },
        { id: 'leftoverB', label: 'Reactant B left over (mol)', format: 'significant' }
      ],
      groups: [{ inputs: ['molesA', 'coeffA', 'molesB', 'coeffB'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'perCoeffA', label: 'Reactant A, moles ÷ coefficient' },
          { from: 'perCoeffB', label: 'Reactant B, moles ÷ coefficient' }
        ],
        title: 'Which one runs out first?'
      }
    },
    seo: {
      title: 'Limiting Reagent Calculator – Find the Limiting Reactant',
      description: 'Free limiting reagent calculator. Compare two reactants’ moles against a balanced equation’s coefficients to find the limiting reagent and leftover excess.',
      faq: [
        { question: 'How do I find the limiting reagent?', answer: 'Divide each reactant’s available moles by its coefficient in the balanced equation. Whichever reactant gives the smaller result is the limiting reagent — it runs out first.' },
        { question: 'What is the limiting reagent in N₂ + 3H₂ → 2NH₃ with 3 mol N₂ and 6 mol H₂?', answer: 'H₂. N₂’s moles ÷ coefficient is 3 ÷ 1 = 3; H₂’s is 6 ÷ 3 = 2. The smaller value, H₂’s, makes it the limiting reagent, leaving 1 mol of N₂ unreacted.' },
        { question: 'What does "excess reagent" mean?', answer: 'The reactant that is not limiting — some of it remains unreacted once the limiting reagent is fully consumed. "Leftover" in this calculator is that excess reagent’s remaining moles.' },
        { question: 'Why can’t I just compare the two reactants’ raw mole amounts?', answer: 'Because the balanced equation rarely needs them in a 1:1 ratio. 2H₂ + O₂ → 2H₂O needs twice as much H₂ as O₂, so 5 mol of H₂ and 2 mol of O₂ actually makes O₂ limiting (2 ÷ 1 = 2, versus H₂’s 5 ÷ 2 = 2.5) even though O₂’s mole count looks smaller either way — the coefficient, not the raw number, decides it.' },
        { question: 'What if a reaction has more than two reactants?', answer: 'Divide every reactant’s available moles by its own coefficient, and the smallest of all those results identifies the limiting one — the same rule extended from two reactants to any number.' },
        { question: 'Does the limiting reagent calculator tell me how much product forms?', answer: 'Not directly — it identifies which reactant runs out and how much of it reacts. Feed that reactant’s moles into the theoretical yield calculator, along with the product’s coefficient and molar mass, to find the maximum mass of product.' },
        { question: 'What if both reactants give the same moles ÷ coefficient?', answer: 'They run out at exactly the same point — neither is in excess, and nothing is left over from either reactant.' }
      ]
    },
    compute(values) {
      const perCoeffA = values.coeffA === 0 ? NaN : values.molesA / values.coeffA;
      const perCoeffB = values.coeffB === 0 ? NaN : values.molesB / values.coeffB;
      const extent = Math.min(perCoeffA, perCoeffB);
      const usedA = extent * values.coeffA;
      const usedB = extent * values.coeffB;
      return {
        limitingReagent: perCoeffA <= perCoeffB ? 0 : 1,
        perCoeffA,
        perCoeffB,
        usedA,
        leftoverA: values.molesA - usedA,
        usedB,
        leftoverB: values.molesB - usedB
      };
    }
  },
  {
    id: 'theoretical-yield-calculator',
    category: 'chemistry',
    glyph: 'Yth',
    updatedAt: '2026-11-08',
    aliases: ['theoretical yield calculator', 'maximum yield calculator', 'theoretical yield formula calculator', 'theoretical yield from moles calculator', 'predicted yield calculator'],
    related: ['percent-yield-calculator', 'limiting-reagent-calculator', 'stoichiometry-calculator', 'molar-mass-calculator'],
    title: 'Theoretical Yield Calculator',
    description: 'Find the maximum possible mass of product from a balanced equation: the limiting reagent’s moles, the mole ratio between it and the product, and the product’s molar mass.',
    example: '6 mol of H₂ (the limiting reagent, coefficient 3) reacting in N₂ + 3H₂ → 2NH₃ (coefficient 2, molar mass 17.031 g/mol) has a theoretical yield of 68.124 g of NH₃.',
    solver: {
      defaultTarget: 'theoreticalYield',
      variables: [
        { id: 'reactantMoles', label: 'Limiting reagent’s moles', symbol: 'n', dimension: 'amountOfSubstance', defaultValue: 6, defaultUnit: 'mol' },
        { id: 'reactantCoeff', label: 'Reactant’s coefficient', symbol: 'cᵣ', dimension: 'count', defaultValue: 3, defaultUnit: 'count' },
        { id: 'productCoeff', label: 'Product’s coefficient', symbol: 'cₚ', dimension: 'count', defaultValue: 2, defaultUnit: 'count' },
        { id: 'productMolarMass', label: 'Product’s molar mass', symbol: 'M', dimension: 'molarMass', defaultValue: 17.031, defaultUnit: 'g/mol' },
        { id: 'theoreticalYield', label: 'Theoretical yield', symbol: 'mₜ', dimension: 'mass', defaultValue: 68.124, defaultUnit: 'g' }
      ],
      solve: {
        theoreticalYield: ({ reactantMoles, reactantCoeff, productCoeff, productMolarMass }) =>
          reactantCoeff === 0 ? NaN : reactantMoles * (productCoeff / reactantCoeff) * productMolarMass,
        reactantMoles: ({ theoreticalYield, reactantCoeff, productCoeff, productMolarMass }) =>
          productCoeff === 0 || productMolarMass === 0 ? NaN : (theoreticalYield * reactantCoeff) / (productCoeff * productMolarMass),
        reactantCoeff: ({ theoreticalYield, reactantMoles, productCoeff, productMolarMass }) =>
          theoreticalYield === 0 ? NaN : (reactantMoles * productCoeff * productMolarMass) / theoreticalYield,
        productCoeff: ({ theoreticalYield, reactantMoles, reactantCoeff, productMolarMass }) =>
          reactantMoles === 0 || productMolarMass === 0 ? NaN : (theoreticalYield * reactantCoeff) / (reactantMoles * productMolarMass),
        productMolarMass: ({ theoreticalYield, reactantMoles, reactantCoeff, productCoeff }) =>
          reactantMoles === 0 || productCoeff === 0 ? NaN : (theoreticalYield * reactantCoeff) / (reactantMoles * productCoeff)
      }
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is theoretical yield?',
        paragraphs: [
          'Theoretical yield is the maximum mass of product a reaction could possibly make, assuming every bit of the limiting reagent converts perfectly into product with no losses. It comes straight from the balanced equation: once you know how many moles of the limiting reagent you have, the equation’s mole ratio tells you how many moles of product that makes, and the product’s molar mass converts that mole count into a mass.',
          'This is a theoretical ceiling, not a prediction of what a real experiment will produce — real reactions lose some yield to side reactions, incomplete conversion, and handling losses. Comparing an actual, measured yield against this theoretical one is exactly what the percent yield calculator does.',
          'Theoretical yield only means anything once the limiting reagent has already been identified — see the limiting reagent calculator if that is still an open question. Plugging in a reactant that is not actually the limiting one overstates how much product the reaction can really make.'
        ]
      },
      howTo: {
        intro: 'Enter the limiting reagent’s moles, both coefficients from the balanced equation, and the product’s molar mass.',
        steps: [
          { name: 'Identify the limiting reagent and its available moles', text: 'Use the limiting reagent calculator above if that is not already known — theoretical yield is only valid for the reactant that actually runs out first.' },
          { name: 'Enter that reactant’s coefficient', text: 'Its number in the balanced equation, e.g. the 3 in front of H₂ in N₂ + 3H₂ → 2NH₃.' },
          { name: 'Enter the product’s coefficient', text: 'Its number in the balanced equation, e.g. the 2 in front of NH₃.' },
          { name: 'Enter the product’s molar mass', text: 'Grams per mole — use the molar mass calculator above to find it from the product’s formula if needed.' },
          { name: 'Read the theoretical yield', text: 'The maximum possible mass of product, in grams, appears immediately.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Convert the limiting reagent’s moles to moles of product using the mole ratio, then convert moles of product to a mass using its molar mass.',
        expression: 'mₜ = n × (cₚ ÷ cᵣ) × M',
        terms: [
          { symbol: 'mₜ', meaning: 'Theoretical yield — the maximum possible mass of product, in grams.' },
          { symbol: 'n', meaning: 'Moles of the limiting reagent actually available.' },
          { symbol: 'cᵣ, cₚ', meaning: 'The limiting reagent’s and the product’s coefficients in the balanced equation.' },
          { symbol: 'M', meaning: 'The product’s molar mass, in grams per mole.' }
        ],
        note: 'cₚ ÷ cᵣ is the mole ratio between product and reactant straight from the balanced equation — it is not always 1, so skipping it (treating moles of reactant as equal to moles of product) is a common source of error.'
      },
      workedExample: {
        intro: 'N₂ + 3H₂ → 2NH₃. Starting with 6 mol of H₂ as the limiting reagent, what is the theoretical yield of ammonia, NH₃ (molar mass 14.007 + 3 × 1.008 = 17.031 g/mol)?',
        rows: [
          { label: 'Limiting reagent’s moles (n, H₂)', value: '6 mol' },
          { label: 'Mole ratio (product ÷ reactant: cₚ ÷ cᵣ = 2 ÷ 3)', value: '0.6667' },
          { label: 'Moles of NH₃ produced (6 × 0.6667)', value: '4 mol' },
          { label: 'Theoretical yield (4 mol × 17.031 g/mol)', value: '68.124 g' }
        ],
        result: 'mₜ = 68.124 g of NH₃',
        explanation: 'Every 3 mol of H₂ that reacts makes 2 mol of NH₃, so 6 mol of H₂ makes 6 × (2 ÷ 3) = 4 mol of NH₃. Multiplying by ammonia’s molar mass, 17.031 g/mol, gives a theoretical yield of 4 × 17.031 = 68.124 g — the most ammonia this reaction could possibly produce from that much hydrogen.'
      },
      watchOut: [
        {
          title: 'The reactant’s moles must be the limiting reagent’s, not just any reactant’s',
          body: 'Using a reactant that is actually in excess overstates the result, because some of that reactant would be left over unreacted rather than all of it converting to product. Confirm the limiting reagent first.'
        },
        {
          title: 'Do not skip the mole ratio',
          body: 'Moles of reactant are not automatically equal to moles of product — only when both coefficients happen to match. N₂ + 3H₂ → 2NH₃ makes 2 mol of product for every 3 mol of H₂ consumed, a ratio of 2÷3, not 1.'
        },
        {
          title: 'Theoretical yield assumes perfect conversion',
          body: 'It is a ceiling, not a forecast. Side reactions, incomplete conversion, and losses during transfer or purification mean a real actual yield is almost always lower — see the percent yield calculator for comparing the two.'
        },
        {
          title: 'Use the correct product’s molar mass, not the reactant’s',
          body: 'The molar mass in this formula belongs to the product being formed, not to the limiting reagent — mixing the two gives a result in the wrong units entirely.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §4.4 "Reaction Yields" (theoretical and percent yield)', url: 'https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields' },
        { label: 'OpenStax, Chemistry 2e, §4.3 "Reaction Stoichiometry" (mole-ratio calculations)', url: 'https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry' }
      ]
    },
    inputs: [
      { id: 'reactantMoles', label: 'Limiting reagent’s moles (mol)', type: 'number', placeholder: '6', defaultValue: 6, step: 0.01, min: 0 },
      { id: 'reactantCoeff', label: 'Reactant’s coefficient', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 0.0001 },
      { id: 'productCoeff', label: 'Product’s coefficient', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0.0001 },
      { id: 'productMolarMass', label: 'Product’s molar mass (g/mol)', type: 'number', placeholder: '17.031', defaultValue: 17.031, step: 0.001, min: 0 }
    ],
    seo: {
      title: 'Theoretical Yield Calculator – Max Product from Stoichiometry',
      description: 'Free theoretical yield calculator. From a limiting reagent’s moles, the balanced equation’s coefficients, and the product’s molar mass, find the maximum possible yield.',
      faq: [
        { question: 'How do I calculate theoretical yield?', answer: 'Multiply the limiting reagent’s moles by the mole ratio of product to reactant from the balanced equation, then multiply by the product’s molar mass: mₜ = n × (cₚ ÷ cᵣ) × M.' },
        { question: 'What is the theoretical yield of NH₃ from 6 mol of H₂ in N₂ + 3H₂ → 2NH₃?', answer: '68.124 g. 6 mol of H₂ makes 6 × (2 ÷ 3) = 4 mol of NH₃, and 4 mol × 17.031 g/mol (NH₃’s molar mass) = 68.124 g.' },
        { question: 'What is the theoretical yield of H₂O from 4 mol of H₂ in 2H₂ + O₂ → 2H₂O?', answer: '72.06 g. The mole ratio of product to reactant is 2 ÷ 2 = 1, so 4 mol of H₂ makes 4 mol of H₂O, and 4 × 18.015 g/mol (H₂O’s molar mass) = 72.06 g.' },
        { question: 'Do I use the limiting reagent’s moles or its mass?', answer: 'This calculator takes moles directly. Starting from a mass instead, convert it to moles first with the moles-to-grams calculator, using the reactant’s own molar mass.' },
        { question: 'Is theoretical yield the same as actual yield?', answer: 'No. Theoretical yield is the maximum possible under perfect conditions; actual yield is what a real experiment actually produces, almost always somewhat less. Their ratio, as a percentage, is the percent yield.' },
        { question: 'Why does the mole ratio matter if the two coefficients are different?', answer: 'Because a balanced equation’s coefficients set how many moles of product form per mole of reactant consumed. N₂ + 3H₂ → 2NH₃ makes only 2 mol of NH₃ for every 3 mol of H₂ used, not a 1-to-1 swap.' },
        { question: 'What if I don’t know which reactant is limiting yet?', answer: 'Work that out first with the limiting reagent calculator, which compares both reactants’ available moles against the balanced equation and tells you which one to use here.' }
      ]
    },
    compute(values) {
      return { theoreticalYield: values.reactantMoles * (values.productCoeff / values.reactantCoeff) * values.productMolarMass };
    }
  },
  {
    id: 'empirical-formula-calculator',
    category: 'chemistry',
    glyph: 'EF',
    updatedAt: '2026-11-08',
    aliases: ['empirical formula calculator', 'empirical formula from percent composition calculator', 'simplest formula calculator', 'empirical formula from mass calculator', 'percent composition to formula calculator'],
    related: ['molar-mass-calculator', 'moles-to-grams-calculator', 'stoichiometry-calculator', 'mass-percent-calculator'],
    title: 'Empirical Formula Calculator',
    description: 'Find a compound’s empirical formula — the simplest whole-number ratio of its elements — from its percent composition by mass.',
    example: 'A compound found to be 40.9% carbon, 4.58% hydrogen, and 54.5% oxygen by mass has the empirical formula C₃H₄O₃.',
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is an empirical formula?',
        paragraphs: [
          'An empirical formula gives the simplest whole-number ratio of atoms of each element in a compound — it is not always the same as the true molecular formula. Ascorbic acid (vitamin C) has the molecular formula C₆H₈O₆, but its atoms are in a 6:8:6 ratio that simplifies to 3:4:3, so its empirical formula is C₃H₄O₃.',
          'The empirical formula is found from a compound’s percent composition by mass, which a combustion analysis or similar lab measurement provides directly. Assuming a convenient 100 g sample makes each element’s mass percent numerically equal to its mass in grams, which converts to moles using that element’s atomic mass.',
          'Dividing every element’s moles by whichever is smallest gives a ratio where the smallest element is exactly 1. If every other ratio already lands close to a whole number, that is the empirical formula. If not — a ratio like 1.33 or 1.5 — multiplying every ratio by the same small whole number (2, 3, or 4) clears the fraction, since a ratio is unchanged by scaling every part of it equally.'
        ]
      },
      howTo: {
        intro: 'Enter up to three elements’ mass percent and pick each one from the periodic table list; leave an unused slot set to "None".',
        steps: [
          { name: 'Confirm the percentages', text: 'A percent composition from a lab report or a textbook problem, one entry per element.' },
          { name: 'Pick each element', text: 'Selecting an element fills in its standard atomic weight automatically.' },
          { name: 'Repeat for every element in the compound', text: 'Up to three elements, which covers the large majority of general-chemistry empirical formula problems.' },
          { name: 'Read the subscripts', text: 'Each element’s whole-number subscript in the empirical formula appears below, along with the multiplier used to reach whole numbers.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Convert each element’s percent to moles (assuming a 100 g sample), divide by the smallest, then clear any remaining fraction by multiplying every ratio by the same small whole number.',
        expression: 'moles of element = mass % ÷ atomic mass\nratio = moles ÷ (smallest element’s moles)\nsubscript = round(ratio × multiplier)',
        terms: [
          { symbol: 'mass %', meaning: 'That element’s percent of the compound’s total mass.' },
          { symbol: 'atomic mass', meaning: 'The element’s standard atomic weight, in g/mol (IUPAC/CIAAW).' },
          { symbol: 'multiplier', meaning: 'The smallest whole number (checked from 1 up to 6) that brings every element’s ratio within about 6% of a whole number — real lab-measured percentages rarely land on an exact fraction.' }
        ],
        note: 'This calculator supports up to three elements, which covers most general-chemistry problems. A compound with more than three distinct elements needs the same method done by hand with an extra term.'
      },
      workedExample: {
        intro: 'A compound is 40.9% carbon, 4.58% hydrogen, and 54.5% oxygen by mass. What is its empirical formula? (Percentages here don’t sum to exactly 100.00 — a few hundredths of a percent of normal rounding in the three separate measurements.)',
        rows: [
          { label: 'Moles of C (40.9 ÷ 12.011)', value: '3.4052 mol' },
          { label: 'Moles of H (4.58 ÷ 1.008)', value: '4.5437 mol' },
          { label: 'Moles of O (54.5 ÷ 15.999)', value: '3.4065 mol' },
          { label: 'Ratios (divide by the smallest, C’s 3.4052)', value: 'C: 1, H: 1.334, O: 1.0004' },
          { label: 'Multiply every ratio by 3 to clear the 1.334', value: 'C: 3, H: 4.00, O: 3.00' }
        ],
        result: 'Empirical formula: C₃H₄O₃',
        explanation: 'Carbon has the fewest moles, so every ratio is measured against it. Hydrogen’s ratio, 1.334, is not close to a whole number on its own — but 1.334 × 3 = 4.00, and the other two ratios stay at whole numbers when multiplied by 3 as well (1 × 3 = 3, 1.0004 × 3 ≈ 3.00). That gives whole-number subscripts of 3, 4, and 3 — C₃H₄O₃, which is also the real empirical formula of ascorbic acid (vitamin C), whose molecular formula C₆H₈O₆ is exactly twice that ratio.'
      },
      watchOut: [
        {
          title: 'An empirical formula is not always the molecular formula',
          body: 'Percent composition alone can only ever give the simplest ratio. Telling C₃H₄O₃ apart from the true molecular formula C₆H₈O₆ (or C₉H₁₂O₉, or any other multiple) needs one more piece of information: the compound’s actual molar mass.'
        },
        {
          title: 'A ratio close to a whole number may still need a multiplier',
          body: 'A ratio of 1.334 is not "close enough" to 1 to round it — it is close to 4⁄3. Rounding every non-whole ratio too eagerly to the nearest integer, instead of checking whether a small multiplier clears the fraction cleanly, is the most common mistake in this calculation.'
        },
        {
          title: 'Real percentages rarely sum to exactly 100%',
          body: 'Measurement and rounding error in each separately reported percentage usually leaves the total a few tenths of a percent away from 100% — that alone is not a sign of an error in the data.'
        },
        {
          title: 'This method assumes the percentages are by mass',
          body: 'Percent composition by mass (what a combustion analysis reports) is what this calculator expects. A percent given by mole or by volume would need to be converted first, or the mole calculation below is meaningless.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §3.2 "Determining Empirical and Molecular Formulas"', url: 'https://openstax.org/books/chemistry-2e/pages/3-2-determining-empirical-and-molecular-formulas' },
        { label: 'CIAAW (IUPAC Commission on Isotopic Abundances and Atomic Weights), Standard Atomic Weights', url: 'https://ciaaw.org/atomic-weights.htm' }
      ]
    },
    inputs: [
      { id: 'percent1', label: 'Element 1 mass percent', type: 'number', placeholder: '40.9', defaultValue: 40.9, step: 0.01, min: 0 },
      { id: 'element1', label: 'Element 1', type: 'number', placeholder: '12.011', defaultValue: 12.011, step: 0.001, min: 0, options: ELEMENT_OPTIONS },
      { id: 'percent2', label: 'Element 2 mass percent', type: 'number', placeholder: '4.58', defaultValue: 4.58, step: 0.01, min: 0 },
      { id: 'element2', label: 'Element 2', type: 'number', placeholder: '1.008', defaultValue: 1.008, step: 0.001, min: 0, options: ELEMENT_OPTIONS },
      { id: 'percent3', label: 'Element 3 mass percent', type: 'number', placeholder: '54.5', defaultValue: 54.5, step: 0.01, min: 0 },
      { id: 'element3', label: 'Element 3', type: 'number', placeholder: '15.999', defaultValue: 15.999, step: 0.001, min: 0, options: ELEMENT_OPTIONS }
    ],
    breakdown: {
      headline: 'subscript1',
      headlineLabel: 'Element 1 subscript',
      outputs: [
        { id: 'subscript1', label: 'Element 1 subscript', format: 'integer' },
        { id: 'subscript2', label: 'Element 2 subscript', format: 'integer' },
        { id: 'subscript3', label: 'Element 3 subscript', format: 'integer' },
        { id: 'multiplier', label: 'Multiplier used to clear fractions', format: 'integer' }
      ],
      groups: [{ inputs: ['percent1', 'element1', 'percent2', 'element2', 'percent3', 'element3'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'ratio1', label: 'Element 1 ratio' },
          { from: 'ratio2', label: 'Element 2 ratio' },
          { from: 'ratio3', label: 'Element 3 ratio' }
        ],
        title: 'Mole ratio, before clearing fractions'
      }
    },
    seo: {
      title: 'Empirical Formula Calculator – From Percent Composition',
      description: 'Free empirical formula calculator. Enter up to three elements’ mass percent to find a compound’s simplest whole-number formula, with a worked example.',
      faq: [
        { question: 'How do I find an empirical formula from percent composition?', answer: 'Treat each percent as grams in a 100 g sample, divide by the element’s atomic mass to get moles, divide every result by the smallest one, then multiply all the ratios by the same small whole number if needed to reach whole numbers.' },
        { question: 'What is the empirical formula of a compound that is 40.9% C, 4.58% H, and 54.5% O?', answer: 'C₃H₄O₃. The mole ratio comes out to 1 : 1.334 : 1.0004, and multiplying every ratio by 3 clears the 1.334 into a whole number, giving subscripts 3, 4, and 3.' },
        { question: 'What is the empirical formula of a compound that is 40.0% C, 6.7% H, and 53.3% O?', answer: 'CH₂O. The mole ratio already comes out to whole numbers (1 : 2 : 1) with no multiplier needed — this is formaldehyde’s composition.' },
        { question: 'Is the empirical formula always the same as the molecular formula?', answer: 'No. The empirical formula is only the simplest ratio. The actual molecular formula could be that same ratio, or any whole-number multiple of it — telling them apart needs the compound’s real molar mass as well.' },
        { question: 'Why do I need to try multiplying by 2, 3, or more?', answer: 'Because the smallest element’s ratio is fixed at exactly 1, but another element’s true ratio might be a fraction like 4⁄3 or 3⁄2 that never rounds cleanly to a whole number on its own — only after scaling every ratio up together.' },
        { question: 'Can I use masses instead of percentages?', answer: 'Yes — as long as all the masses were measured from the same sample, the ratio between them works out identically to using percentages, since percentages are just those same masses scaled to a 100 g basis.' },
        { question: 'What if my compound has more than three elements?', answer: 'This calculator covers up to three, the most common case. A fourth element needs the same calculation done by hand: moles for every element, divide all of them by the smallest, then clear fractions with a shared multiplier.' }
      ]
    },
    compute(values) {
      const slots = [
        { percent: values.percent1, mass: values.element1 },
        { percent: values.percent2, mass: values.element2 },
        { percent: values.percent3, mass: values.element3 }
      ];
      const moles = slots.map((slot) => (slot.mass > 0 ? slot.percent / slot.mass : 0));
      const activeMoles = moles.filter((m, i) => slots[i].mass > 0 && m > 0);
      const smallest = activeMoles.length ? Math.min(...activeMoles) : NaN;
      const ratios = moles.map((m, i) => (slots[i].mass > 0 && smallest > 0 ? m / smallest : 0));
      let multiplier = 1;
      for (let m = 1; m <= 6; m++) {
        const ok = ratios.every((r, i) => slots[i].mass === 0 || Math.abs(r * m - Math.round(r * m)) < 0.06);
        if (ok) {
          multiplier = m;
          break;
        }
      }
      const subscripts = ratios.map((r) => Math.round(r * multiplier));
      return {
        subscript1: subscripts[0],
        subscript2: subscripts[1],
        subscript3: subscripts[2],
        ratio1: ratios[0],
        ratio2: ratios[1],
        ratio3: ratios[2],
        multiplier
      };
    }
  },
  {
    id: 'stoichiometry-calculator',
    category: 'chemistry',
    glyph: 'n:n',
    updatedAt: '2026-11-08',
    aliases: ['stoichiometry calculator', 'mole ratio calculator', 'mole to mole calculator', 'stoichiometric ratio calculator', 'balanced equation mole calculator'],
    related: ['limiting-reagent-calculator', 'theoretical-yield-calculator', 'moles-to-grams-calculator', 'molar-mass-calculator'],
    title: 'Stoichiometry Calculator (Mole Ratio)',
    description: 'Convert moles of one species in a balanced equation to moles of another, using the mole ratio between their coefficients — the core move behind every stoichiometry problem.',
    example: '2Al + 3I₂ → 2AlI₃: 2 mol of Al, reacted with excess I₂, corresponds to 2 × (3 ÷ 2) = 3 mol of I₂ consumed.',
    solver: {
      defaultTarget: 'speciesBMoles',
      variables: [
        { id: 'speciesAMoles', label: 'Species A, moles', symbol: 'nᴬ', dimension: 'amountOfSubstance', defaultValue: 2, defaultUnit: 'mol' },
        { id: 'speciesACoeff', label: 'Species A coefficient', symbol: 'cᴬ', dimension: 'count', defaultValue: 1, defaultUnit: 'count' },
        { id: 'speciesBCoeff', label: 'Species B coefficient', symbol: 'cᴮ', dimension: 'count', defaultValue: 3, defaultUnit: 'count' },
        { id: 'speciesBMoles', label: 'Species B, moles', symbol: 'nᴮ', dimension: 'amountOfSubstance', defaultValue: 6, defaultUnit: 'mol' }
      ],
      solve: {
        speciesBMoles: ({ speciesAMoles, speciesACoeff, speciesBCoeff }) => (speciesACoeff === 0 ? NaN : speciesAMoles * (speciesBCoeff / speciesACoeff)),
        speciesAMoles: ({ speciesBMoles, speciesACoeff, speciesBCoeff }) => (speciesBCoeff === 0 ? NaN : speciesBMoles * (speciesACoeff / speciesBCoeff)),
        speciesACoeff: ({ speciesAMoles, speciesBMoles, speciesBCoeff }) => (speciesBMoles === 0 ? NaN : (speciesAMoles * speciesBCoeff) / speciesBMoles),
        speciesBCoeff: ({ speciesAMoles, speciesBMoles, speciesACoeff }) => (speciesAMoles === 0 ? NaN : (speciesBMoles * speciesACoeff) / speciesAMoles)
      }
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is a mole-ratio stoichiometry problem?',
        paragraphs: [
          'A balanced chemical equation is a statement about ratios: 2Al + 3I₂ → 2AlI₃ says that however much aluminum reacts, it reacts with 1.5 times as many moles of iodine (3 ÷ 2), and produces an equal number of moles of AlI₃ as the aluminum it came from (2 ÷ 2 = 1). Those coefficient ratios, called mole ratios or stoichiometric factors, are the bridge between "moles of one substance" and "moles of any other substance in the same equation."',
          'This calculator covers that one core conversion — moles of a known species to moles of another, via the ratio of their coefficients — which is the building block every other stoichiometry calculation (theoretical yield, limiting reagent, titration) is made from. It deliberately does not balance equations: it takes the coefficients as already known, the same way a textbook stoichiometry problem gives you a balanced equation to start from.',
          'Converting a mole amount to a mass, or starting from a mass instead of moles, is one extra step beyond this core ratio — see the moles-to-grams calculator for that half of the problem.'
        ]
      },
      howTo: {
        intro: 'Enter the known species’ moles and both coefficients from the balanced equation.',
        steps: [
          { name: 'Start from a balanced equation', text: 'The coefficients only give a correct mole ratio once the equation is balanced.' },
          { name: 'Enter Species A’s known amount, in moles', text: 'Whatever quantity the problem already gives you.' },
          { name: 'Enter both coefficients', text: 'Species A’s and Species B’s numbers in the balanced equation.' },
          { name: 'Read Species B’s moles', text: 'The amount of the other species that corresponds to Species A’s amount, under this reaction’s ratio.' },
          { name: 'Convert to a mass if needed', text: 'Multiply the resulting moles by that species’ molar mass (the moles-to-grams calculator) to get a mass instead.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The mole ratio between any two species in a balanced equation is simply the ratio of their coefficients.',
        expression: 'nᴮ = nᴬ × (cᴮ ÷ cᴬ)',
        terms: [
          { symbol: 'nᴬ', meaning: 'Moles of the species whose amount is already known.' },
          { symbol: 'nᴮ', meaning: 'Moles of the species being solved for.' },
          { symbol: 'cᴬ, cᴮ', meaning: 'Species A’s and Species B’s coefficients in the balanced equation.' }
        ],
        note: 'This ratio holds regardless of whether A and B are both reactants, both products, or one of each — the balanced equation’s coefficients are what fix the ratio, not which side of the arrow a species is on.'
      },
      workedExample: {
        intro: 'Aluminum reacts with iodine: 2Al + 3I₂ → 2AlI₃. Starting with 2 mol of Al (and plenty of iodine available), how many moles of I₂ react?',
        rows: [
          { label: 'Known amount (Al, nᴬ)', value: '2 mol' },
          { label: 'Mole ratio (I₂ ÷ Al coefficients, cᴮ ÷ cᴬ = 3 ÷ 2)', value: '1.5' },
          { label: 'Moles of I₂ (2 × 1.5)', value: '3 mol' }
        ],
        result: 'nᴮ = 3 mol of I₂',
        explanation: 'The balanced equation needs 3 mol of I₂ for every 2 mol of Al. Scaling that ratio to the 2 mol of Al actually reacting gives 2 × (3 ÷ 2) = 3 mol of I₂ consumed.'
      },
      watchOut: [
        {
          title: 'The mole ratio only holds for a correctly balanced equation',
          body: 'This calculator uses the coefficients exactly as entered; it does not check or balance the equation. A wrong coefficient (unbalanced equation) produces a confidently wrong mole ratio.'
        },
        {
          title: 'This is moles to moles, not mass to mass',
          body: 'Starting from a mass, convert to moles first with that species’ own molar mass (moles-to-grams calculator); after finding the answer in moles here, convert back to a mass with the other species’ molar mass if that is what the problem asks for.'
        },
        {
          title: 'This does not check whether Species A is actually available in that amount',
          body: 'If Species A is a reactant and the question is really "which reactant runs out first," that is a limiting reagent problem (see the limiting reagent calculator), not a plain mole-ratio conversion — this calculator assumes Species A’s full amount does react.'
        },
        {
          title: 'Scoped to simple mole-ratio problems, not equation balancing',
          body: 'Finding the coefficients themselves — balancing an unbalanced equation — is a separate skill this calculator does not perform. It expects a balanced equation’s coefficients as a given input.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §4.3 "Reaction Stoichiometry" (mole-to-mole calculations from a balanced equation)', url: 'https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry' },
        { label: 'IUPAC Gold Book, "stoichiometry"', url: 'https://goldbook.iupac.org/terms/view/S06025' }
      ]
    },
    inputs: [
      { id: 'speciesAMoles', label: 'Species A moles (mol)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.01, min: 0 },
      { id: 'speciesACoeff', label: 'Species A coefficient', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0.0001 },
      { id: 'speciesBCoeff', label: 'Species B coefficient', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 0.0001 }
    ],
    seo: {
      title: 'Stoichiometry Calculator – Mole-to-Mole Ratio',
      description: 'Free stoichiometry calculator. Convert moles of one species to moles of another using a balanced equation’s coefficient ratio, with a worked example.',
      faq: [
        { question: 'How do I do a mole-to-mole stoichiometry calculation?', answer: 'Multiply the known species’ moles by the ratio of the other species’ coefficient to the known one’s: nᴮ = nᴬ × (cᴮ ÷ cᴬ). 2 mol of Al in 2Al + 3I₂ → 2AlI₃ gives 2 × (3 ÷ 2) = 3 mol of I₂.' },
        { question: 'How many moles of O₂ react with 2 mol of C₃H₈ in C₃H₈ + 5O₂ → 3CO₂ + 4H₂O?', answer: '10 mol. The mole ratio of O₂ to C₃H₈ is 5 ÷ 1 = 5, so 2 mol of C₃H₈ needs 2 × 5 = 10 mol of O₂.' },
        { question: 'How many moles of CO₂ form from 2 mol of C₃H₈ in the same reaction?', answer: '6 mol. The mole ratio of CO₂ to C₃H₈ is 3 ÷ 1 = 3, so 2 mol of C₃H₈ makes 2 × 3 = 6 mol of CO₂.' },
        { question: 'Does this calculator balance chemical equations?', answer: 'No — it takes the coefficients of an already-balanced equation as a given input and converts between moles of two species using their ratio. Balancing the equation itself is a separate step done beforehand.' },
        { question: 'Can I use this for two products, or two reactants, not just reactant-to-product?', answer: 'Yes. The mole ratio works between any two species in the same balanced equation — both reactants, both products, or one of each — as long as you use their correct coefficients.' },
        { question: 'How do I convert the resulting moles to a mass?', answer: 'Multiply by that species’ molar mass. The moles-to-grams calculator does that conversion, and the molar mass calculator finds a molar mass from a chemical formula.' },
        { question: 'Is this the same as finding a limiting reagent?', answer: 'No. This calculator assumes the known species’ full amount reacts and finds the matching amount of the other species. Finding out which of two reactants runs out first is the limiting reagent calculator’s job.' }
      ]
    },
    compute(values) {
      return { speciesBMoles: values.speciesAMoles * (values.speciesBCoeff / values.speciesACoeff) };
    }
  },
  {
    id: 'solution-concentration-calculator',
    category: 'chemistry',
    glyph: 'ppm',
    updatedAt: '2026-11-08',
    aliases: ['solution concentration calculator', 'ppm calculator', 'mg/l calculator', 'parts per million calculator', 'ppm to mg/l calculator', 'dilute solution concentration calculator'],
    related: ['molarity-calculator', 'mass-percent-calculator', 'dilution-calculator', 'moles-to-grams-calculator'],
    title: 'Solution Concentration Calculator (mg/L, ppm)',
    description: 'Solve for a dilute solution’s mass concentration, the mass of solute, or the solution volume — concentration = mass of solute ÷ volume of solution, in mg/L or ppm.',
    example: 'Dissolving 5 mg of a substance in 2 L of water gives a concentration of 2.5 mg/L — about 2.5 ppm, for a dilute water-based solution.',
    solver: {
      defaultTarget: 'concentration',
      variables: [
        { id: 'concentration', label: 'Concentration', symbol: 'ρ', dimension: 'massConcentration', defaultValue: 2.5, defaultUnit: 'mg/L' },
        { id: 'soluteMass', label: 'Mass of solute', symbol: 'm', dimension: 'mass', defaultValue: 5, defaultUnit: 'mg' },
        { id: 'volume', label: 'Solution volume', symbol: 'V', dimension: 'volume', defaultValue: 2, defaultUnit: 'L' }
      ],
      solve: {
        concentration: ({ soluteMass, volume }) => (volume === 0 ? NaN : soluteMass / volume),
        soluteMass: ({ concentration, volume }) => concentration * volume,
        volume: ({ concentration, soluteMass }) => (concentration === 0 ? NaN : soluteMass / concentration)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'concentration',
          min: -3,
          max: 1,
          ticks: ['0.001 mg/L', '0.01 mg/L', '0.1 mg/L', '1 mg/L', '10 mg/L'],
          benchmarks: [
            { label: 'EPA lead action level, drinking water', value: 0.015 },
            { label: 'EPA nitrate limit, drinking water', value: 10 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your concentration'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'Solution concentration in mg/L and ppm',
        paragraphs: [
          'This is mass concentration: how much mass of solute is dissolved per unit volume of solution, most often reported in milligrams per liter (mg/L) for dilute solutions such as drinking water, wastewater, and trace contaminants. It is a different way of expressing "how concentrated" than either molarity (moles per liter — see the molarity calculator) or mass percent (mass of solute ÷ mass of the whole solution — see the mass percent calculator); all three answer the same everyday question with a different unit, and converting between them needs extra information the others don’t.',
          'Parts per million (ppm) is formally a mass fraction: mass of solute ÷ mass of solution, × 1,000,000 (the same shape as mass percent, just scaled by a million instead of a hundred). For a dilute, water-based solution, though, the solution’s density is so close to pure water’s 1.00 g/mL that its mass in grams and its volume in milliliters are numerically almost the same — which is exactly why the EPA’s drinking-water regulations state outright that "milligrams per liter are equivalent to parts per million" for its purposes, and this calculator follows that same convention.',
          'That convention is specific to dilute aqueous solutions. It stops being reliable for a solution whose density notably differs from water’s — seawater, syrups, concentrated brines — where true mass-fraction ppm and mg/L start to diverge from each other.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of concentration, mass of solute, and solution volume; the third fills in automatically.',
        steps: [
          { name: 'Enter the mass of solute', text: 'Pick a mass unit — milligrams is typical for trace concentrations.' },
          { name: 'Enter the solution’s volume', text: 'The total volume of the solution, not just the solvent added to it.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the concentration', text: 'Shown in mg/L by default; switch its unit to ppm for a dilute, water-based solution (the two read the same number).' },
          { name: 'Compare against a benchmark', text: 'The scale below the result places your concentration against a couple of real EPA drinking-water limits.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Mass concentration rearranges to solve for mass of solute or solution volume as well.',
        expression: 'ρ = m ÷ V\nm = ρ × V\nV = m ÷ ρ',
        terms: [
          { symbol: 'ρ', meaning: 'Mass concentration of the solute, typically in mg/L (numerically the same as ppm for a dilute aqueous solution).' },
          { symbol: 'm', meaning: 'Mass of the solute dissolved.' },
          { symbol: 'V', meaning: 'Volume of the whole solution.' }
        ],
        note: 'This is a mass-per-volume quantity, not a mass-per-mass one — unlike mass percent, it needs a volume measurement (a graduated cylinder or volumetric flask), not just two masses on a scale.'
      },
      workedExample: {
        intro: '5 mg of a trace substance is dissolved into enough water to make 2 L of solution. What is its concentration?',
        rows: [
          { label: 'Mass of solute (m)', value: '5 mg' },
          { label: 'Solution volume (V)', value: '2 L' },
          { label: 'Concentration (ρ = 5 ÷ 2)', value: '2.5 mg/L' }
        ],
        result: 'ρ = 2.5 mg/L (≈ 2.5 ppm)',
        explanation: 'Dividing the 5 mg of solute by the 2 L of solution gives 2.5 mg of solute per liter. Because this is a dilute water-based solution, that figure is also read directly as about 2.5 ppm by mass, the EPA drinking-water convention.'
      },
      watchOut: [
        {
          title: 'mg/L and ppm are only the same number for a dilute, water-based solution',
          body: 'The equivalence relies on the solution’s density being close to 1.00 g/mL, true of water-based solutions. A dense solution — seawater, syrup, brine — has a mass-per-volume reading that is no longer the same number as its true mass-fraction ppm.'
        },
        {
          title: 'This is a different concentration unit from molarity',
          body: 'Molarity (mol/L) counts particles; mass concentration (mg/L) weighs them. Converting between the two needs the solute’s molar mass — a 2.5 mg/L solution of two different substances represents two different molarities, because they have different molar masses.'
        },
        {
          title: 'This is also different from mass percent',
          body: 'Mass percent compares the solute’s mass to the whole solution’s mass; mg/L compares it to the solution’s volume. The two only convert into each other if you also know the solution’s density — for anything other than a dilute water-based solution, don’t assume they’re numerically close.'
        },
        {
          title: 'Use the solution’s total volume, not the solvent added',
          body: 'Dissolving a solid changes a solution’s total volume slightly from the solvent volume poured in — V here is the volume of the finished solution, measured after mixing, the same convention the molarity and dilution calculators use.'
        }
      ],
      references: [
        { label: 'EPA, National Primary Drinking Water Regulations (states "milligrams per liter are equivalent to parts per million"; lead action level and nitrate limit)', url: 'https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations' },
        { label: 'OpenStax, Chemistry 2e, §3.4 "Other Units for Solution Concentrations" (ppm and ppb defined as mass fractions)', url: 'https://openstax.org/books/chemistry-2e/pages/3-4-other-units-for-solution-concentrations' }
      ]
    },
    inputs: [
      { id: 'soluteMass', label: 'Mass of solute (mg)', type: 'number', placeholder: '5', defaultValue: 5, step: 0.001, min: 0 },
      { id: 'volume', label: 'Solution volume (L)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.001, min: 0 }
    ],
    seo: {
      title: 'Solution Concentration Calculator (mg/L, ppm)',
      description: 'Free solution concentration calculator. Solve concentration = mass of solute ÷ volume for mg/L or ppm, with EPA drinking-water benchmarks.',
      faq: [
        { question: 'How do I calculate solution concentration in mg/L?', answer: 'Divide the mass of solute, in milligrams, by the solution’s volume, in liters: ρ = m ÷ V. 5 mg dissolved into 2 L gives 5 ÷ 2 = 2.5 mg/L.' },
        { question: 'Is 1 ppm the same as 1 mg/L?', answer: 'For a dilute, water-based solution, yes — the EPA’s own drinking-water regulations state they are equivalent, since water’s density (close to 1.00 g/mL) makes a milligram-per-liter reading and a true mass-fraction ppm come out to almost the same number. That equivalence does not hold for denser solutions, like seawater.' },
        { question: 'What is the EPA’s action level for lead in drinking water?', answer: '0.015 mg/L (15 ppb) under the current Lead and Copper Rule; EPA’s revised rule lowers that to 0.010 mg/L starting November 2027.' },
        { question: 'What is the EPA’s limit for nitrate in drinking water?', answer: '10 mg/L, measured as nitrogen — one of the National Primary Drinking Water Regulations’ maximum contaminant levels.' },
        { question: 'How is mg/L different from molarity?', answer: 'Molarity (mol/L) measures moles of solute — a particle count. mg/L measures mass of solute directly. Converting between them needs the solute’s molar mass, since a milligram of one substance is a very different number of moles than a milligram of another.' },
        { question: 'How is mg/L different from mass percent?', answer: 'Mass percent compares solute mass to total solution mass (both weighed on a scale); mg/L compares solute mass to solution volume (measured with glassware). They only convert into each other with the solution’s density as an extra input.' },
        { question: 'What is ppb, and how does it relate to ppm?', answer: 'Parts per billion — 1,000 times smaller than ppm, used for trace concentrations too small to conveniently state in ppm. 1 ppm = 1,000 ppb, the same way 1 mg/L = 1,000 µg/L.' },
        { question: 'Can concentration in mg/L ever be higher than the solute would weigh in the pure solvent alone?', answer: 'Not for a true solution — mg/L measures how much solute is dissolved per liter of the finished solution, which already accounts for both the solute and solvent together, the same convention molarity and mass percent use.' }
      ]
    },
    compute(values) {
      return { concentration: values.volume === 0 ? NaN : values.soluteMass / values.volume };
    }
  },
  {
    id: 'reaction-half-life-calculator',
    category: 'chemistry',
    glyph: 't½',
    updatedAt: '2026-11-08',
    aliases: ['reaction half-life calculator', 'first order half life calculator', 'half life of a reaction calculator', 't1/2 = ln2/k calculator', 'chemical kinetics half-life calculator', 'rate constant to half life calculator'],
    related: ['rate-constant-calculator', 'arrhenius-equation-calculator', 'radioactive-half-life-calculator', 'molarity-calculator'],
    title: 'Reaction Half-Life Calculator (t½ = ln 2 ÷ k)',
    description: 'Solve a first-order reaction’s half-life from its rate constant k, or the other way around — t½ = ln 2 ÷ k. Not the same formula as radioactive (nuclear) half-life.',
    example: 'A first-order reaction with a rate constant of 3.21×10⁻⁵ s⁻¹ (hydrogen peroxide’s decomposition) has a half-life of about 6.00 hours.',
    solver: {
      defaultTarget: 'halfLife',
      variables: [
        { id: 'rateConstant', label: 'Rate constant', symbol: 'k', dimension: 'rateConstant', defaultValue: 3.21e-5, defaultUnit: 's-1' },
        { id: 'halfLife', label: 'Half-life', symbol: 't½', dimension: 'time', defaultValue: 6, defaultUnit: 'h' }
      ],
      solve: {
        halfLife: ({ rateConstant }) => (rateConstant === 0 ? Infinity : Math.LN2 / rateConstant),
        rateConstant: ({ halfLife }) => (halfLife === 0 ? Infinity : Math.LN2 / halfLife)
      }
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is a reaction’s half-life?',
        paragraphs: [
          'For a first-order reaction, half-life is the time it takes for a reactant’s concentration to fall to half of whatever it started at — and that time is always the same, no matter how much (or little) you started with. That property is unique to first-order kinetics: t½ = ln(2) ÷ k depends only on the rate constant k, not on the starting concentration at all, which is why a single half-life value describes the whole reaction rather than just one run of it.',
          'This is a completely different formula from radioactive (nuclear) half-life, even though both describe something falling to half its value and even share the same t½ = ln(2) ÷ k shape in reverse. Radioactive half-life is a fixed physical constant of an isotope’s nucleus, entered directly into the decay equation N = N₀ × (½)^(t ÷ t½) — see the radioactive half-life calculator. A reaction’s half-life is calculated from a measured rate constant k, and it changes whenever the reaction’s conditions (temperature, catalyst, solvent) change, because k itself changes with those conditions. Don’t carry a chemical kinetics half-life over to a nuclear decay problem, or vice versa.',
          'Only first-order reactions have a half-life this simple. A second-order reaction’s half-life (t½ = 1 ÷ (k[A]₀)) does depend on the starting concentration, and a zero-order reaction’s half-life ([A]₀ ÷ 2k) does too — this calculator is specifically for the first-order case, by far the most common one covered in general chemistry.'
        ]
      },
      howTo: {
        intro: 'Fill in either the rate constant k or the half-life; the other fills in automatically.',
        steps: [
          { name: 'Know your reaction order', text: 'This formula only holds for a first-order reaction — one whose rate depends on a single reactant’s concentration to the first power.' },
          { name: 'Enter the value you know', text: 'Type the rate constant (in s⁻¹, min⁻¹ or h⁻¹) or the half-life (in any time unit), and pick its unit.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 0.1155 h⁻¹ becomes 3.209×10⁻⁵ s⁻¹ instead of silently turning into 0.1155 s⁻¹.' },
          { name: 'Read the result', text: 'The missing value appears in your chosen unit.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The first-order half-life formula rearranges to solve for either quantity.',
        expression: 't½ = ln(2) ÷ k\nk = ln(2) ÷ t½',
        terms: [
          { symbol: 't½', meaning: 'Half-life: the time for the reactant’s concentration to fall by half.' },
          { symbol: 'k', meaning: 'The reaction’s first-order rate constant, with units of 1 ÷ time (s⁻¹, min⁻¹ or h⁻¹).' },
          { symbol: 'ln(2)', meaning: 'The natural logarithm of 2, about 0.6931 — fixed, not a measured quantity.' }
        ],
        note: 'This formula only applies to a first-order reaction. A different reaction order needs a different half-life formula — see the watch-out section below.'
      },
      workedExample: {
        intro: 'Hydrogen peroxide decomposes in a first-order reaction with a rate constant of 3.21×10⁻⁵ s⁻¹ at a given temperature (the same figure OpenStax’s own kinetics chapter arrives at for this reaction). What is its half-life?',
        rows: [
          { label: 'Rate constant (k)', value: '3.21 × 10⁻⁵ s⁻¹' },
          { label: 'Half-life (t½ = ln(2) ÷ k)', value: '0.693147 ÷ 0.0000321' }
        ],
        result: 't½ ≈ 21,593 s ≈ 5.998 h ≈ 6.00 hours',
        explanation: 'Dividing ln(2) by the rate constant gives about 21,593 seconds, or roughly 5.998 hours — which rounds to the clean 6.00-hour figure this same hydrogen peroxide decomposition is normally quoted at once k is kept to three significant figures. Halving the rate constant to 1.605×10⁻⁵ s⁻¹ (a slower reaction, perhaps at a lower temperature) would double the half-life to about 12.0 hours, since t½ and k are inversely proportional.'
      },
      watchOut: [
        {
          title: 'This is not radioactive (nuclear) half-life',
          body: 'Radioactive half-life is a fixed, measured property of an isotope’s nucleus, entered directly into N = N₀ × (½)^(t ÷ t½) — see the radioactive half-life calculator. A chemical reaction’s half-life is calculated from a rate constant k instead, and unlike a nuclear half-life, it changes whenever the reaction’s own conditions change. Don’t plug a nuclear half-life in here expecting a rate constant, and don’t plug this calculator’s t½ into the decay equation expecting it to behave like an isotope’s.'
        },
        {
          title: 'Only valid for a first-order reaction',
          body: 'This specific, simple formula — half-life independent of starting concentration — is a special property of first-order kinetics. Second-order and zero-order reactions have their own half-life formulas that do depend on the starting concentration, and plugging their rate constant into t½ = ln(2) ÷ k gives a wrong answer.'
        },
        {
          title: 'A reaction’s half-life is not one fixed number the way an isotope’s is',
          body: 'Changing the temperature, adding a catalyst, or switching solvents changes the rate constant k, which changes the half-life too (see the Arrhenius equation calculator for how k depends on temperature). Quoting a reaction’s half-life without its conditions is incomplete.'
        },
        {
          title: 'Check the rate constant’s unit before converting',
          body: 'A rate constant given in min⁻¹ or h⁻¹ needs its own matching time unit for t½, or a unit conversion first — mixing k in s⁻¹ with an assumed half-life in hours (or vice versa) without converting is the most common source of an answer that is off by a factor of 60 or 3,600.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §12.4 "Integrated Rate Laws" (first-order half-life, t½ = 0.693 ÷ k, and the hydrogen peroxide worked examples)', url: 'https://openstax.org/books/chemistry-2e/pages/12-4-integrated-rate-laws' },
        { label: 'IUPAC Gold Book, "half-life"', url: 'https://goldbook.iupac.org/terms/view/H02732' }
      ]
    },
    inputs: [{ id: 'rateConstant', label: 'Rate constant (s⁻¹)', type: 'number', placeholder: '0.0000321', defaultValue: 0.0000321, step: 0.0000001, min: 0 }],
    seo: {
      title: 'Reaction Half-Life Calculator – First-Order Kinetics',
      description: 'Free reaction half-life calculator. Solve t½ = ln(2) ÷ k for a first-order reaction’s half-life or rate constant, with a worked example.',
      faq: [
        { question: 'What is the formula for a reaction’s half-life?', answer: 'For a first-order reaction, t½ = ln(2) ÷ k, where k is the rate constant. Unlike other reaction orders, this half-life does not depend on the starting concentration.' },
        { question: 'What is the half-life of a first-order reaction with k = 3.21×10⁻⁵ s⁻¹?', answer: 'About 21,593 seconds, or roughly 5.998 hours (about 6.00 hours) — t½ = ln(2) ÷ 3.21×10⁻⁵.' },
        { question: 'How do I find the rate constant from a half-life?', answer: 'k = ln(2) ÷ t½. A reaction with a 6.00-hour half-life has a rate constant of 0.693147 ÷ 6.00 ≈ 0.1155 h⁻¹, which is about 3.21×10⁻⁵ s⁻¹.' },
        { question: 'Is a reaction’s half-life the same as radioactive half-life?', answer: 'No. Radioactive half-life is a fixed nuclear constant, entered directly. A chemical reaction’s half-life is calculated from a rate constant k and changes if the reaction’s conditions (temperature, catalyst) change — a different formula for a different kind of process, even though the shape t½ = ln(2) ÷ k is the same.' },
        { question: 'Does this formula work for any reaction order?', answer: 'No — only first-order. Second-order half-life is t½ = 1 ÷ (k[A]₀) and zero-order half-life is [A]₀ ÷ 2k, both of which depend on the starting concentration unlike the first-order case.' },
        { question: 'What happens to the half-life if the rate constant doubles?', answer: 'The half-life is cut in half, since t½ and k are inversely proportional — a reaction that happens twice as fast reaches half its starting concentration in half the time.' },
        { question: 'How is the rate constant k related to the Arrhenius equation?', answer: 'The Arrhenius equation (k = A·e^(−Ea/RT)) describes how a rate constant itself depends on temperature. Combining the two means a reaction’s half-life shortens as temperature rises, since a higher k lowers t½.' }
      ]
    },
    compute(values) {
      return { halfLife: Math.LN2 / values.rateConstant };
    }
  },
  {
    id: 'rate-constant-calculator',
    category: 'chemistry',
    glyph: 'k',
    updatedAt: '2026-11-08',
    aliases: ['rate constant calculator', 'first order rate constant calculator', 'integrated rate law calculator', 'k = ln(a0/a)/t calculator', 'find rate constant from concentration calculator'],
    related: ['reaction-half-life-calculator', 'arrhenius-equation-calculator', 'molarity-calculator', 'dilution-calculator'],
    title: 'Rate Constant Calculator (First-Order)',
    description: 'Find a first-order reaction’s rate constant k from the integrated rate law, ln([A]₀ ÷ [A]) = kt — or solve for concentration or time instead.',
    example: 'Hydrogen peroxide falling from 1.000 M to 0.0625 M over 24.00 hours gives a rate constant of about 0.1155 h⁻¹.',
    solver: {
      defaultTarget: 'rateConstant',
      variables: [
        { id: 'initialConcentration', label: 'Initial concentration', symbol: '[A]₀', dimension: 'concentration', defaultValue: 1, defaultUnit: 'mol/L' },
        { id: 'concentration', label: 'Concentration at time t', symbol: '[A]', dimension: 'concentration', defaultValue: 0.0625, defaultUnit: 'mol/L' },
        { id: 'time', label: 'Elapsed time', symbol: 't', dimension: 'time', defaultValue: 24, defaultUnit: 'h' },
        { id: 'rateConstant', label: 'Rate constant', symbol: 'k', dimension: 'rateConstant', defaultValue: 0.1155, defaultUnit: 'h-1' }
      ],
      solve: {
        rateConstant: ({ initialConcentration, concentration, time }) =>
          initialConcentration <= 0 || concentration <= 0 || time === 0 ? NaN : Math.log(initialConcentration / concentration) / time,
        time: ({ initialConcentration, concentration, rateConstant }) =>
          initialConcentration <= 0 || concentration <= 0 || rateConstant === 0 ? NaN : Math.log(initialConcentration / concentration) / rateConstant,
        concentration: ({ initialConcentration, rateConstant, time }) => initialConcentration * Math.exp(-rateConstant * time),
        initialConcentration: ({ concentration, rateConstant, time }) => concentration * Math.exp(rateConstant * time)
      },
      outputs: [
        {
          id: 'impliedHalfLife',
          label: 'Implied half-life (t½ = ln 2 ÷ k)',
          dimension: 'time',
          unit: 'h',
          compute: (si) => (si.rateConstant === 0 ? Infinity : Math.LN2 / si.rateConstant)
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'Finding a rate constant from concentration data',
        paragraphs: [
          'A first-order reaction’s integrated rate law, ln([A]₀ ÷ [A]) = kt, connects how a reactant’s concentration falls over time to the reaction’s rate constant k. Rearranged, k = ln([A]₀ ÷ [A]) ÷ t — given a starting concentration, a concentration measured at some later time, and how much time passed, the rate constant follows directly, with no calculus or graphing required for a single data pair.',
          'This is scoped to first-order reactions specifically, the most common case in general chemistry and the one needed for the reaction half-life and Arrhenius equation calculators elsewhere on this site. Other reaction orders have their own integrated rate laws with different forms (second order: 1 ÷ [A] = kt + 1 ÷ [A]₀; zero order: [A] = −kt + [A]₀), each giving k a different physical shape and different units — don’t reuse this formula for a reaction that is not first order.',
          'In a real lab setting, chemists usually plot ln[A] versus time across many measurements and read k off the slope, since that averages out measurement noise better than any single pair of points. This calculator instead takes exactly two concentration readings and the time between them — the quickest way to estimate k when a full data set and graph aren’t available, or to check a single textbook-style data pair by hand.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of initial concentration, concentration at time t, and elapsed time; the rate constant fills in automatically (or solve for any one of the four).',
        steps: [
          { name: 'Confirm the reaction is first order', text: 'This integrated rate law only applies to a reaction whose rate depends on one reactant’s concentration to the first power.' },
          { name: 'Enter the two concentrations', text: 'The starting concentration [A]₀ and the concentration [A] measured after some time has passed, in any concentration unit.' },
          { name: 'Enter the elapsed time', text: 'How long passed between the two concentration readings.' },
          { name: 'Read the rate constant', text: 'k appears in your chosen unit (s⁻¹, min⁻¹ or h⁻¹), along with the half-life that rate constant implies.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one — useful for predicting a future concentration instead.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The first-order integrated rate law rearranges to solve for any of the four quantities.',
        expression: 'ln([A]₀ ÷ [A]) = kt\nk = ln([A]₀ ÷ [A]) ÷ t\n[A] = [A]₀ × e^(−kt)\n[A]₀ = [A] × e^(kt)',
        terms: [
          { symbol: '[A]₀', meaning: 'The reactant’s concentration at the start (t = 0).' },
          { symbol: '[A]', meaning: 'The reactant’s concentration at elapsed time t.' },
          { symbol: 't', meaning: 'The time elapsed between the two concentration readings.' },
          { symbol: 'k', meaning: 'The first-order rate constant, in 1 ÷ time (s⁻¹, min⁻¹ or h⁻¹).' }
        ],
        note: 'All four quantities are converted to a common time and concentration unit before solving and converted back afterward.'
      },
      workedExample: {
        intro: 'Hydrogen peroxide’s concentration falls from 1.000 M to 0.0625 M over 24.00 hours (the same data OpenStax’s kinetics chapter uses to find this reaction’s rate constant graphically). What is k?',
        rows: [
          { label: 'Initial concentration ([A]₀)', value: '1.000 M' },
          { label: 'Concentration at t = 24.00 h ([A])', value: '0.0625 M' },
          { label: 'Ratio ([A]₀ ÷ [A])', value: '1.000 ÷ 0.0625 = 16.00' },
          { label: 'Rate constant (k = ln(16.00) ÷ 24.00)', value: '2.7726 ÷ 24.00' }
        ],
        result: 'k ≈ 0.1155 h⁻¹ (about 3.21 × 10⁻⁵ s⁻¹)',
        explanation: 'ln(16.00) ≈ 2.7726, and dividing by 24.00 hours gives k ≈ 0.1155 h⁻¹ — matching, to the rounding OpenStax itself uses, the 0.116 h⁻¹ the textbook finds by plotting ln[H₂O₂] against time and reading the slope across all five of its data points. That same k implies a half-life of ln(2) ÷ 0.1155 ≈ 6.00 hours, consistent with the concentration visibly halving every 6 hours in that same data (1.000 → 0.500 → 0.250 → 0.125 → 0.0625 M at 0, 6, 12, 18 and 24 hours).'
      },
      watchOut: [
        {
          title: 'Scoped to first-order reactions only',
          body: 'This calculator’s formula, k = ln([A]₀ ÷ [A]) ÷ t, is specific to first-order kinetics. A second-order or zero-order reaction has a different integrated rate law, giving k different units and a different formula entirely — using this one on data from a reaction of a different order gives a confidently wrong k.'
        },
        {
          title: 'A single pair of readings is less reliable than a full data set',
          body: 'Any two real concentration measurements carry some experimental noise. A genuine lab determination of k plots ln[A] against time across many points and uses the line’s slope, which averages out that noise far better than picking just one "before" and "after" pair, as this calculator does.'
        },
        {
          title: 'k’s units depend on this being first order — the pre-exponential factor A does too',
          body: 'A first-order k (and the Arrhenius equation’s pre-exponential factor A, which shares k’s units for a first-order reaction) is a plain 1 ÷ time. For any other order, k’s units include a concentration term as well, and A’s units would need to match that different k — don’t assume a rate constant from one order carries over to another.'
        },
        {
          title: 'This finds k from data — it does not predict k from temperature',
          body: 'This calculator works backward from measured concentrations to a rate constant at whatever (fixed) temperature the data was collected at. Predicting how k itself changes with temperature is a separate relationship — see the Arrhenius equation calculator.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §12.4 "Integrated Rate Laws" (first-order integrated rate law and the hydrogen peroxide data table)', url: 'https://openstax.org/books/chemistry-2e/pages/12-4-integrated-rate-laws' },
        { label: 'IUPAC Gold Book, "rate constant"', url: 'https://goldbook.iupac.org/terms/view/R05156' }
      ]
    },
    inputs: [
      { id: 'initialConcentration', label: 'Initial concentration (mol/m³)', type: 'number', placeholder: '1000', defaultValue: 1000, step: 0.1, min: 0 },
      { id: 'concentration', label: 'Concentration at time t (mol/m³)', type: 'number', placeholder: '62.5', defaultValue: 62.5, step: 0.1, min: 0 },
      { id: 'time', label: 'Elapsed time (s)', type: 'number', placeholder: '86400', defaultValue: 86400, step: 1, min: 0 }
    ],
    seo: {
      title: 'Rate Constant Calculator – First-Order Kinetics',
      description: 'Free rate constant calculator. Find a first-order reaction’s k from two concentration readings using k = ln([A]₀÷[A])÷t, with a worked example.',
      faq: [
        { question: 'How do I find a rate constant from concentration data?', answer: 'For a first-order reaction, k = ln([A]₀ ÷ [A]) ÷ t. Concentration falling from 1.000 M to 0.0625 M over 24.00 hours gives k = ln(16.00) ÷ 24.00 ≈ 0.1155 h⁻¹.' },
        { question: 'What are the units of a first-order rate constant?', answer: '1 ÷ time — commonly s⁻¹, min⁻¹ or h⁻¹. This is specific to first-order reactions; other orders give k different units.' },
        { question: 'How do I predict a concentration at a future time?', answer: '[A] = [A]₀ × e^(−kt). With k ≈ 0.1155 h⁻¹ and a starting concentration of 1.000 M, the concentration after 10 hours would be about 1.000 × e^(−1.155) ≈ 0.315 M.' },
        { question: 'Does this work for second-order or zero-order reactions?', answer: 'No. This calculator’s formula is specific to first-order kinetics. Second-order and zero-order reactions have different integrated rate laws, and using this formula on their data gives an incorrect rate constant.' },
        { question: 'How is the rate constant related to half-life?', answer: 'For a first-order reaction, t½ = ln(2) ÷ k — shown as a bonus result above. A rate constant of 0.1155 h⁻¹ implies a half-life of about 6.00 hours.' },
        { question: 'Is one pair of concentration readings as accurate as a full kinetics experiment?', answer: 'No — a real determination of k uses many data points plotted as ln[A] versus time and reads k from the line’s slope, which is more reliable than any single pair. This calculator is meant for a quick estimate or a textbook-style problem with only two readings given.' },
        { question: 'Why does the pre-exponential factor A in the Arrhenius equation use the same units as k?', answer: 'Only because this calculator and the Arrhenius equation calculator both assume a first-order reaction. For a first-order process, A (the Arrhenius equation’s pre-exponential factor) and k share the same 1 ÷ time units; for any other reaction order, their units would need to match that order’s own k instead.' }
      ]
    },
    compute(values) {
      return { rateConstant: Math.log(values.initialConcentration / values.concentration) / values.time };
    }
  },
  {
    id: 'arrhenius-equation-calculator',
    category: 'chemistry',
    glyph: 'Ea',
    updatedAt: '2026-11-08',
    aliases: ['arrhenius equation calculator', 'k = ae^(-ea/rt) calculator', 'activation energy calculator', 'pre-exponential factor calculator', 'arrhenius plot calculator', 'temperature dependence of rate constant calculator'],
    related: ['rate-constant-calculator', 'reaction-half-life-calculator', 'ideal-gas-law-calculator', 'molarity-calculator'],
    title: 'Arrhenius Equation Calculator (k = Ae^(−Ea/RT))',
    description: 'Solve the Arrhenius equation, k = A·e^(−Ea/RT), for the rate constant, pre-exponential factor, activation energy, or absolute temperature — given the other three.',
    example: 'A reaction with Ea = 50.0 kJ/mol and A = 5.00×10¹³ s⁻¹ has a rate constant of about 8.70×10⁴ s⁻¹ at 25.00°C (298.15 K).',
    solver: {
      defaultTarget: 'rateConstant',
      variables: [
        { id: 'rateConstant', label: 'Rate constant', symbol: 'k', dimension: 'rateConstant', defaultValue: 8.6966e4, defaultUnit: 's-1' },
        { id: 'preExponentialFactor', label: 'Pre-exponential factor', symbol: 'A', dimension: 'rateConstant', defaultValue: 5e13, defaultUnit: 's-1' },
        { id: 'activationEnergy', label: 'Activation energy', symbol: 'Eₐ', dimension: 'molarEnergy', defaultValue: 50, defaultUnit: 'kJ/mol' },
        { id: 'temperature', label: 'Temperature', symbol: 'T', dimension: 'temperature', defaultValue: 298.15, defaultUnit: 'K' }
      ],
      solve: {
        rateConstant: ({ preExponentialFactor, activationEnergy, temperature }) =>
          preExponentialFactor * Math.exp(-activationEnergy / (8.31446261815324 * temperature)),
        preExponentialFactor: ({ rateConstant, activationEnergy, temperature }) =>
          rateConstant <= 0 ? NaN : rateConstant * Math.exp(activationEnergy / (8.31446261815324 * temperature)),
        activationEnergy: ({ rateConstant, preExponentialFactor, temperature }) =>
          rateConstant <= 0 || preExponentialFactor <= 0 ? NaN : 8.31446261815324 * temperature * Math.log(preExponentialFactor / rateConstant),
        temperature: ({ rateConstant, preExponentialFactor, activationEnergy }) => {
          if (rateConstant <= 0 || preExponentialFactor <= 0) return NaN;
          const ratio = Math.log(preExponentialFactor / rateConstant);
          return ratio === 0 ? NaN : activationEnergy / (8.31446261815324 * ratio);
        }
      },
      outputs: [
        {
          id: 'collisionFraction',
          label: 'Fraction of collisions with enough energy (e^(−Ea÷RT))',
          dimension: 'count',
          unit: 'count',
          compute: (si) => Math.exp(-si.activationEnergy / (8.31446261815324 * si.temperature))
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is the Arrhenius equation?',
        paragraphs: [
          'The Arrhenius equation, k = A·e^(−Ea/RT), describes why reaction rates are so sensitive to temperature. R is the molar gas constant (8.31446261815324 J/(mol·K), the same exact value used on the ideal gas law calculator), T is the absolute temperature, Ea is the activation energy — the minimum energy colliding molecules need to actually react — and A, the pre-exponential factor, accounts for how often molecules collide in the right orientation to react at all, even with enough energy.',
          'The exponential term, e^(−Ea/RT), is the fraction of molecular collisions energetic enough to clear the activation-energy barrier at a given temperature — collision theory’s Boltzmann-distribution argument. Because Ea sits in the exponent, even a modest rise in temperature noticeably increases that fraction, which is the real reason reaction rates often roughly double for every 10°C rise, a common rule of thumb rather than an exact law.',
          'A, the pre-exponential factor, is often treated as roughly constant across a modest temperature range for a given reaction, which is what lets chemists plot ln(k) against 1 ÷ T across several temperatures and read Ea off the resulting straight line’s slope — the standard lab method for measuring an activation energy, distinct from this calculator’s direct, single-point use of the equation.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of rate constant, pre-exponential factor, activation energy, and temperature; the fourth fills in automatically.',
        steps: [
          { name: 'Enter the three values you know', text: 'Rate constant and pre-exponential factor share a unit (s⁻¹, min⁻¹ or h⁻¹, for a first-order reaction); activation energy is typically in kJ/mol; temperature must be absolute.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 50 kJ/mol becomes 50,000 J/mol instead of silently turning into 50 J/mol.' },
          { name: 'Read the result and the collision fraction', text: 'The missing value appears in your chosen unit, with the fraction of sufficiently energetic collisions shown underneath.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'k = A·e^(−Ea/RT) rearranges to solve for any one of the four quantities, given the other three.',
        expression: 'k = A·e^(−Ea ÷ RT)\nA = k·e^(Ea ÷ RT)\nEa = RT·ln(A ÷ k)\nT = Ea ÷ (R·ln(A ÷ k))',
        terms: [
          { symbol: 'k', meaning: 'The rate constant at temperature T.' },
          { symbol: 'A', meaning: 'The pre-exponential (frequency) factor — shares k’s units for a first-order reaction.' },
          { symbol: 'Eₐ', meaning: 'Activation energy, the minimum energy a collision needs to react, in energy per mole (J/mol or kJ/mol).' },
          { symbol: 'T', meaning: 'Absolute temperature, in kelvin — never a Celsius or Fahrenheit reading used directly.' },
          { symbol: 'R', meaning: 'The molar gas constant, 8.31446261815324 J/(mol·K), exact.' }
        ],
        note: 'Every input is converted to SI (s⁻¹, J/mol, K) before solving and converted back afterward, so mixing kJ/mol with °C is handled automatically.'
      },
      workedExample: {
        intro: 'A reaction has an activation energy of 50.0 kJ/mol and a pre-exponential factor of 5.00×10¹³ s⁻¹. What is its rate constant at 25.00°C (298.15 K)?',
        rows: [
          { label: 'Activation energy (Ea)', value: '50.0 kJ/mol = 50,000 J/mol' },
          { label: 'Pre-exponential factor (A)', value: '5.00 × 10¹³ s⁻¹' },
          { label: 'Temperature (T)', value: '298.15 K (25.00°C)' },
          { label: 'Exponent (−Ea ÷ RT)', value: '−50,000 ÷ (8.31446261815324 × 298.15) = −20.1698' },
          { label: 'Rate constant (k = A × e^(−20.1698))', value: '5.00 × 10¹³ × 1.739 × 10⁻⁹' }
        ],
        result: 'k ≈ 8.70 × 10⁴ s⁻¹',
        explanation: 'Only about 1.74 × 10⁻⁹ — less than two in a billion — of collisions clear this reaction’s 50.0 kJ/mol barrier at 298.15 K, but multiplying that tiny fraction by the very large collision frequency (5.00 × 10¹³ s⁻¹) still gives a sizeable rate constant of about 8.70 × 10⁴ s⁻¹. Raising the temperature by just 10 K, to 308.15 K, increases k to about 1.67 × 10⁵ s⁻¹ — roughly 1.92 times faster, close to the common "rate roughly doubles for every 10°C" rule of thumb, for exactly this reaction’s activation energy.'
      },
      watchOut: [
        {
          title: 'Temperature must be absolute (kelvin), not Celsius or Fahrenheit',
          body: 'Just like the ideal gas law, T in the Arrhenius equation must be an absolute temperature. Using a Celsius or Fahrenheit number directly in the exponent — instead of converting to kelvin first — gives a badly wrong answer, since the exponential term is extremely sensitive to T.'
        },
        {
          title: 'Activation energy and R must use matching energy units',
          body: 'R is defined in J/(mol·K). Plugging in Ea in kJ/mol without converting to J/mol first (or vice versa) throws the exponent off by a factor of 1,000, which — because it is inside an exponential — changes the resulting k by many orders of magnitude, not just a thousandfold. This calculator converts automatically.'
        },
        {
          title: 'A and k share units only for a first-order reaction',
          body: 'The pre-exponential factor A has the same units as the rate constant k, which is only a plain 1 ÷ time for a first-order reaction. For a reaction of a different order, k’s units include a concentration term, and A’s units change to match — don’t assume A is directly comparable in s⁻¹ across reactions of different orders.'
        },
        {
          title: 'The Arrhenius equation is an empirical fit, not an exact physical law',
          body: 'It describes most reactions well over a moderate temperature range, but A is not perfectly temperature-independent in every case, and some reactions (especially ones involving a change in mechanism, or very low temperatures) deviate from a straight-line Arrhenius plot. Treat results from a very wide temperature extrapolation with caution.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §12.5 "Collision Theory" (the Arrhenius equation, R = 8.314 J/(mol·K), and activation energy)', url: 'https://openstax.org/books/chemistry-2e/pages/12-5-collision-theory' },
        { label: 'NIST CODATA, Molar Gas Constant', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?r' },
        { label: 'IUPAC Gold Book, "Arrhenius equation"', url: 'https://goldbook.iupac.org/terms/view/A00446' }
      ]
    },
    inputs: [
      { id: 'preExponentialFactor', label: 'Pre-exponential factor (s⁻¹)', type: 'number', placeholder: '5e13', defaultValue: 5e13, step: 1, min: 0 },
      { id: 'activationEnergy', label: 'Activation energy (J/mol)', type: 'number', placeholder: '50000', defaultValue: 50000, step: 1, min: 0 },
      { id: 'temperature', label: 'Temperature (K)', type: 'number', placeholder: '298.15', defaultValue: 298.15, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Arrhenius Equation Calculator – Solve for k, A, Ea, or T',
      description: 'Free Arrhenius equation calculator. Solve k = A·e^(−Ea/RT) for rate constant, pre-exponential factor, activation energy, or temperature.',
      faq: [
        { question: 'What is the Arrhenius equation?', answer: 'k = A·e^(−Ea/RT), where k is the rate constant, A is the pre-exponential factor, Ea is the activation energy, R is the molar gas constant (8.31446261815324 J/(mol·K)), and T is the absolute temperature.' },
        { question: 'How do I find the rate constant from activation energy and temperature?', answer: 'k = A·e^(−Ea÷RT). With Ea = 50.0 kJ/mol, A = 5.00×10¹³ s⁻¹ and T = 298.15 K, k ≈ 8.70×10⁴ s⁻¹.' },
        { question: 'How do I find activation energy from two rate constants and temperatures?', answer: 'This calculator solves the single-point form, Ea = RT·ln(A÷k), given A directly. Finding Ea from two separate (k, T) pairs without knowing A uses a slightly different two-point form of the same equation — plotting ln(k) against 1÷T and reading Ea off the slope is the standard lab method.' },
        { question: 'Why does rate roughly double for every 10°C?', answer: 'Because Ea sits in an exponent, a fixed temperature rise multiplies k by a factor that depends on Ea — for many common activation energies, that factor works out close to 2 across a 10°C span, though the exact figure varies by reaction (this calculator’s own worked example gives about 1.92×).' },
        { question: 'Why must temperature be in kelvin?', answer: 'The exponential term is extremely sensitive to T, and kelvin is the only scale with a true zero. Using Celsius or Fahrenheit directly in the exponent — rather than converting to kelvin first — gives a badly wrong rate constant.' },
        { question: 'What are typical pre-exponential factors?', answer: 'For a simple first-order gas-phase reaction, A is often in the 10¹²–10¹⁴ s⁻¹ range, roughly the frequency of molecular bond vibrations — the collision theory reasoning behind why A represents "how often, in the right orientation," separately from "how energetically," which Ea and the exponential term capture.' },
        { question: 'What does the "fraction of collisions with enough energy" mean?', answer: 'It is e^(−Ea÷RT), the Boltzmann-distribution share of collisions energetic enough to clear the activation-energy barrier at that temperature. In the worked example, only about 1.74×10⁻⁹ of collisions qualify, yet the reaction still proceeds at a measurable rate because collisions themselves are extremely frequent.' }
      ]
    },
    compute(values) {
      return { rateConstant: values.preExponentialFactor * Math.exp(-values.activationEnergy / (8.31446261815324 * values.temperature)) };
    }
  },
  {
    id: 'molality-calculator',
    category: 'chemistry',
    glyph: 'b',
    updatedAt: '2026-11-08',
    aliases: ['molality calculator', 'molal concentration calculator', 'mol/kg calculator', 'moles per kg solvent calculator', 'b = mol/kg calculator'],
    related: ['molarity-calculator', 'mass-percent-calculator', 'solution-concentration-calculator', 'mole-fraction-calculator'],
    title: 'Molality Calculator (b = mol ÷ kg)',
    description: 'Solve for molality, moles of solute, or mass of solvent — b = mol solute ÷ kg solvent — the concentration unit that doesn’t change with temperature.',
    example: 'Dissolving 35.8 mol of ethylene glycol in 2.00 kg of water gives a molality of about 17.9 mol/kg (17.9 m).',
    solver: {
      defaultTarget: 'molality',
      variables: [
        { id: 'molality', label: 'Molality', symbol: 'b', dimension: 'molality', defaultValue: 17.9, defaultUnit: 'mol/kg' },
        { id: 'molesSolute', label: 'Moles of solute', symbol: 'n', dimension: 'amountOfSubstance', defaultValue: 35.8, defaultUnit: 'mol' },
        { id: 'massSolvent', label: 'Mass of solvent', symbol: 'mₛₒₗᵥ', dimension: 'mass', defaultValue: 2, defaultUnit: 'kg' }
      ],
      solve: {
        molality: ({ molesSolute, massSolvent }) => (massSolvent === 0 ? NaN : molesSolute / massSolvent),
        molesSolute: ({ molality, massSolvent }) => molality * massSolvent,
        massSolvent: ({ molality, molesSolute }) => (molality === 0 ? NaN : molesSolute / molality)
      }
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is molality?',
        paragraphs: [
          'Molality is the number of moles of solute dissolved per kilogram of solvent: b = n ÷ m. It is written in mol/kg, often shortened to "m" (a lowercase, italic m, not to be confused with mass) and read as "molal" — a "0.5 m" solution has 0.5 mol of solute in every kilogram of solvent. The IUPAC symbol for molality is b, used on this page’s formula to avoid clashing with mass, m, in the same equation.',
          'The key difference from molarity (moles per liter of solution, M = n ÷ V) is the denominator: molality divides by the mass of solvent alone, while molarity divides by the volume of the whole solution. Mass does not expand or contract with temperature, but volume does — so a solution’s molarity drifts very slightly as it warms or cools (the same amount of solute in a now-larger or now-smaller volume), while its molality stays exactly the same, since the solvent’s mass never changes. That temperature-independence is why molality, not molarity, is the concentration unit behind colligative-property calculations like freezing-point depression and boiling-point elevation.',
          'Molality also only needs a mass of solvent, which is simpler to measure directly on a scale than preparing a solution to an exact final volume in a volumetric flask — though for that same reason, it is less common than molarity for everyday lab work where a specific total volume usually matters more.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of molality, moles of solute, and mass of solvent; the third fills in automatically.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit — mol/kg or mmol/kg for molality; mol, mmol or µmol for moles of solute; any mass unit for the solvent.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 35.8 mol becomes 35,800 mmol instead of silently turning into 35.8 mmol.' },
          { name: 'Read the result', text: 'The missing value appears immediately in your chosen unit.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The molality formula rearranges to solve for moles of solute or mass of solvent as well.',
        expression: 'b = n ÷ mₛₒₗᵥ\nn = b × mₛₒₗᵥ\nmₛₒₗᵥ = n ÷ b',
        terms: [
          { symbol: 'b', meaning: 'Molality, in moles of solute per kilogram of solvent (mol/kg, "molal").' },
          { symbol: 'n', meaning: 'Amount of solute, in moles — use the moles-to-grams calculator to convert from a measured mass.' },
          { symbol: 'mₛₒₗᵥ', meaning: 'Mass of the solvent alone, in kilograms — not the mass of the whole solution.' }
        ],
        note: 'Molality uses only the solvent’s mass, measured before the solute is added — a different convention from molarity (solution volume) and mass percent (total solution mass).'
      },
      workedExample: {
        intro: 'Automotive antifreeze is prepared from 2.22×10³ g of ethylene glycol (molar mass 62.07 g/mol) dissolved in 2.00×10³ g of water. What is the molality of ethylene glycol? (OpenStax Chemistry 2e, Example 11.3.)',
        rows: [
          { label: 'Mass of ethylene glycol', value: '2.22 × 10³ g' },
          { label: 'Moles of ethylene glycol (n = 2,220 ÷ 62.07)', value: '35.8 mol' },
          { label: 'Mass of water (solvent)', value: '2.00 × 10³ g = 2.00 kg' },
          { label: 'Molality (b = 35.8 ÷ 2.00)', value: '17.9 mol/kg' }
        ],
        result: 'b ≈ 17.9 mol/kg (17.9 m)',
        explanation: '2,220 g of ethylene glycol divided by its 62.07 g/mol molar mass gives about 35.8 mol. Dividing that by the 2.00 kg of water it is dissolved in gives a molality of 17.9 mol/kg — meaning every kilogram of water in this antifreeze mixture carries 17.9 mol of ethylene glycol, a figure that would stay exactly 17.9 m whether the antifreeze were measured at a cold garage floor or a hot engine bay, unlike its molarity.'
      },
      watchOut: [
        {
          title: 'Molality divides by solvent mass, not solution mass',
          body: 'This is the opposite convention from mass percent and the solution concentration calculator, which both divide by the total solution’s mass (or volume). Using the combined solute-plus-solvent mass here instead of the solvent alone gives a molality that is too low.'
        },
        {
          title: 'Molality is not molarity',
          body: 'Molality (mol/kg of solvent) and molarity (mol/L of solution) are numerically close only for a dilute, water-based solution at room temperature, where a kilogram of water occupies very close to a liter. They diverge for a concentrated solution, a dense solvent, or any temperature where volume and mass no longer line up as closely.'
        },
        {
          title: 'This is why molality is used for freezing-point depression and boiling-point elevation',
          body: 'Those formulas rely on a concentration unit that doesn’t drift with temperature as the solution itself heats up or cools down and its volume changes slightly — molality, based on mass, holds steady where molarity would not.'
        },
        {
          title: 'Converting mass of solute to moles needs the solute’s molar mass',
          body: 'If a problem gives a mass of solute rather than moles directly, convert first with n = mass ÷ molar mass (the moles-to-grams calculator or molar mass calculator). Entering a mass of solute directly into the "moles of solute" field gives a number with the wrong units entirely.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §11.4 "Colligative Properties" (molality’s definition and the ethylene glycol worked example)', url: 'https://openstax.org/books/chemistry-2e/pages/11-4-colligative-properties' },
        { label: 'IUPAC Gold Book, "molality"', url: 'https://goldbook.iupac.org/terms/view/M03970' }
      ]
    },
    inputs: [
      { id: 'molesSolute', label: 'Moles of solute (mol)', type: 'number', placeholder: '35.8', defaultValue: 35.8, step: 0.01, min: 0 },
      { id: 'massSolvent', label: 'Mass of solvent (kg)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.001, min: 0 }
    ],
    seo: {
      title: 'Molality Calculator (b = mol ÷ kg Solvent)',
      description: 'Free molality calculator. Solve b = mol solute ÷ kg solvent for molality, moles of solute, or mass of solvent, with a worked example.',
      faq: [
        { question: 'How do I calculate molality?', answer: 'Divide the moles of solute by the mass of solvent in kilograms: b = n ÷ mₛₒₗᵥ. 35.8 mol dissolved in 2.00 kg of solvent gives 35.8 ÷ 2.00 = 17.9 mol/kg.' },
        { question: 'What is the difference between molality and molarity?', answer: 'Molality (b) divides moles of solute by the mass of solvent alone, in kg. Molarity (M) divides moles of solute by the volume of the whole solution, in L. Because mass doesn’t change with temperature but volume does, molality stays constant as a solution warms or cools, while molarity drifts slightly.' },
        { question: 'How do I find moles of solute from molality?', answer: 'n = b × mₛₒₗᵥ. A 17.9 mol/kg (molal) solution in 2.00 kg of solvent contains 17.9 × 2.00 = 35.8 mol of solute.' },
        { question: 'How do I find the mass of solvent from molality?', answer: 'mₛₒₗᵥ = n ÷ b. 35.8 mol of solute at a molality of 17.9 mol/kg needs 35.8 ÷ 17.9 = 2.00 kg of solvent.' },
        { question: 'Why is molality used for freezing-point depression?', answer: 'Because it is based on mass rather than volume, molality does not change as a solution’s temperature (and therefore its volume) changes — exactly the stability colligative-property formulas like freezing-point depression and boiling-point elevation need.' },
        { question: 'Is molality the same as "molal concentration"?', answer: 'Yes — "molal" is simply the adjective form of molality, and "m" (lowercase) is its common shorthand unit symbol, read as "molal," not to be confused with mass (m) or molarity (M).' },
        { question: 'Does molality use the mass of the whole solution or just the solvent?', answer: 'Just the solvent, measured before the solute is added — a different convention from mass percent or solution concentration (mg/L), both of which use the total solution’s mass or volume.' }
      ]
    },
    compute(values) {
      return { molality: values.molesSolute / values.massSolvent };
    }
  },
  {
    id: 'mole-fraction-calculator',
    category: 'chemistry',
    glyph: 'χ',
    updatedAt: '2026-11-08',
    aliases: ['mole fraction calculator', 'molar fraction calculator', 'x = n/ntotal calculator', 'mole percent calculator', 'mole fraction of a mixture calculator'],
    related: ['molality-calculator', 'molarity-calculator', 'ideal-gas-law-calculator', 'mass-percent-calculator'],
    title: 'Mole Fraction Calculator',
    description: 'Find each component’s mole fraction in a 2- or 3-component mixture — χ = moles of that component ÷ total moles of every component.',
    example: 'A gas mixture of 2.83 mol O₂ and 8.41 mol N₂O has a mole fraction of 0.252 for the oxygen.',
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is mole fraction?',
        paragraphs: [
          'Mole fraction (χ) states how much of a mixture’s total moles belong to one particular component: χ_A = moles of A ÷ total moles of every component. Unlike molarity or mass percent, it is a pure ratio of particle counts with no units at all, and every component’s mole fraction in a mixture always adds up to exactly 1 (or 100%, as a mole percent).',
          'Mole fraction works the same way whether the mixture is a solution or a gas. For gases specifically, it is directly tied to partial pressure through Dalton’s law: a component’s partial pressure equals its mole fraction times the total pressure, which is why mole fraction shows up constantly in gas-mixture problems. For solutions, mole fraction is the concentration unit behind Raoult’s law (vapor-pressure lowering) and is also how the mole fractions of solvent and solute in a mixture relate to each other.',
          'This calculator covers the common 2- and 3-component cases directly: enter each component’s moles, and every component’s mole fraction is computed at once. A mixture with more than three components follows the exact same formula with more terms, just beyond what this page’s three input slots cover.'
        ]
      },
      howTo: {
        intro: 'Enter the moles of each component in the mixture; leave Component C at 0 for a two-component mixture.',
        steps: [
          { name: 'Identify every component', text: 'List every distinct substance present in the mixture — up to three for this calculator.' },
          { name: 'Enter each component’s moles', text: 'In mol, for every component present. Leave "Component C" at 0 if the mixture only has two components.' },
          { name: 'Read each mole fraction', text: 'Every component’s mole fraction appears at once, along with the mixture’s total moles.' },
          { name: 'Check they add up to 1', text: 'Every mole fraction in the mixture should sum to exactly 1 (or 100%) — a useful check on the inputs.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Each component’s mole fraction is its own moles divided by the total moles of every component present.',
        expression: 'χ_A = n_A ÷ n_total\nn_total = n_A + n_B + n_C\nχ_A + χ_B + χ_C = 1',
        terms: [
          { symbol: 'χ_A', meaning: 'The mole fraction of component A — a plain ratio, always between 0 and 1.' },
          { symbol: 'n_A', meaning: 'Moles of component A present in the mixture.' },
          { symbol: 'n_total', meaning: 'The sum of every component’s moles in the mixture.' }
        ],
        note: 'For a two-component mixture, simply leave the third component’s moles at 0 — it drops out of the total and its own mole fraction comes out to exactly 0.'
      },
      workedExample: {
        intro: 'A gas mixture contains 2.83 mol of O₂ and 8.41 mol of N₂O (nitrous oxide), with no third component. What is the mole fraction of each gas? (OpenStax Chemistry 2e, Example 9.15.)',
        rows: [
          { label: 'Moles of O₂', value: '2.83 mol' },
          { label: 'Moles of N₂O', value: '8.41 mol' },
          { label: 'Total moles (2.83 + 8.41)', value: '11.24 mol' },
          { label: 'Mole fraction of O₂ (2.83 ÷ 11.24)', value: '0.2518' },
          { label: 'Mole fraction of N₂O (8.41 ÷ 11.24)', value: '0.7482' }
        ],
        result: 'χ(O₂) ≈ 0.252, χ(N₂O) ≈ 0.748',
        explanation: 'Dividing each gas’s own moles by the mixture’s total of 11.24 mol gives a mole fraction of about 0.252 for O₂ and 0.748 for N₂O — matching OpenStax’s own rounding for this partial-pressure example. The two mole fractions add to exactly 1, as they always must for a mixture with no missing components. Under Dalton’s law, O₂ would then supply 25.2% of this mixture’s total pressure.'
      },
      watchOut: [
        {
          title: 'Mole fraction is unitless, unlike molarity or molality',
          body: 'Mole fraction is a plain ratio of particle counts (moles to moles), with no liter, kilogram, or gram anywhere in it — it is not interchangeable with molarity (mol/L) or molality (mol/kg) without extra information like density or molar mass.'
        },
        {
          title: 'Every component’s mole fraction must sum to 1',
          body: 'If the mole fractions in a finished calculation don’t add up to exactly 1 (allowing for rounding), a component’s moles were likely missed or mistyped — this is the fastest way to catch an input error.'
        },
        {
          title: 'This is moles of particles, not mass',
          body: 'A mixture that is 50% O₂ and 50% N₂O by mole is not 50% by mass, since the two gases have different molar masses. Converting a mole fraction to a mass percent needs each component’s molar mass as an extra step.'
        },
        {
          title: 'This calculator covers up to three components',
          body: 'A mixture with a fourth distinct component needs the same formula extended with one more term (n_D added to the total, and χ_D = n_D ÷ n_total) — the arithmetic beyond this page’s three input slots, but not a different method.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §9.3 "Stoichiometry of Gaseous Substances, Mixtures, and Reactions" (mole fraction and the O₂/N₂O worked example)', url: 'https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions' },
        { label: 'IUPAC Gold Book, "mole fraction"', url: 'https://goldbook.iupac.org/terms/view/M03986' }
      ]
    },
    inputs: [
      { id: 'componentAMoles', label: 'Component A, moles (mol)', type: 'number', placeholder: '2.83', defaultValue: 2.83, step: 0.01, min: 0 },
      { id: 'componentBMoles', label: 'Component B, moles (mol)', type: 'number', placeholder: '8.41', defaultValue: 8.41, step: 0.01, min: 0 },
      { id: 'componentCMoles', label: 'Component C, moles (mol) — leave at 0 for a two-component mixture', type: 'number', placeholder: '0', defaultValue: 0, step: 0.01, min: 0 }
    ],
    breakdown: {
      headline: 'moleFractionA',
      headlineLabel: 'Mole fraction of Component A',
      outputs: [
        { id: 'moleFractionA', label: 'Mole fraction of Component A', format: 'significant' },
        { id: 'moleFractionB', label: 'Mole fraction of Component B', format: 'significant' },
        { id: 'moleFractionC', label: 'Mole fraction of Component C', format: 'significant' },
        { id: 'totalMoles', label: 'Total moles', format: 'significant' }
      ],
      groups: [{ inputs: ['componentAMoles', 'componentBMoles', 'componentCMoles'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'componentAMoles', label: 'Component A' },
          { from: 'componentBMoles', label: 'Component B' },
          { from: 'componentCMoles', label: 'Component C' }
        ],
        center: 'totalMoles',
        centerSub: 'total moles'
      }
    },
    seo: {
      title: 'Mole Fraction Calculator – 2- or 3-Component Mixture',
      description: 'Free mole fraction calculator. Find χ = moles of a component ÷ total moles for a 2- or 3-component mixture, with a worked example.',
      faq: [
        { question: 'How do I calculate mole fraction?', answer: 'Divide one component’s moles by the total moles of every component: χ_A = n_A ÷ n_total. 2.83 mol of O₂ in a mixture totaling 11.24 mol gives a mole fraction of 2.83 ÷ 11.24 ≈ 0.252.' },
        { question: 'What is the mole fraction of 2.83 mol O₂ mixed with 8.41 mol N₂O?', answer: 'About 0.252 for O₂ and 0.748 for N₂O. The total is 2.83 + 8.41 = 11.24 mol, so χ(O₂) = 2.83 ÷ 11.24 ≈ 0.252 and χ(N₂O) = 8.41 ÷ 11.24 ≈ 0.748.' },
        { question: 'Do mole fractions always add up to 1?', answer: 'Yes, as long as every component in the mixture is accounted for — it is a direct consequence of dividing each component’s moles by the same total.' },
        { question: 'How is mole fraction related to partial pressure?', answer: 'By Dalton’s law, a gas’s partial pressure equals its mole fraction times the mixture’s total pressure. A component with a mole fraction of 0.252 in a 10 atm mixture would have a partial pressure of 0.252 × 10 = 2.52 atm.' },
        { question: 'Can mole fraction be converted to mass percent?', answer: 'Only with each component’s molar mass as extra information — mole fraction counts particles, mass percent weighs them, and the two only agree numerically if every component happens to share the same molar mass.' },
        { question: 'What if my mixture has only two components?', answer: 'Leave "Component C" at 0 — it drops out of the total automatically, and its own mole fraction comes out to exactly 0, leaving a standard two-component result.' },
        { question: 'What if my mixture has more than three components?', answer: 'The same formula extends with one more term per extra component (add its moles to the total, then divide as usual) — this calculator’s three input slots cover the common two- and three-component cases directly.' }
      ]
    },
    compute(values) {
      const total = values.componentAMoles + values.componentBMoles + values.componentCMoles;
      return {
        moleFractionA: values.componentAMoles / total,
        moleFractionB: values.componentBMoles / total,
        moleFractionC: values.componentCMoles / total,
        totalMoles: total
      };
    }
  },
  {
    id: 'osmolarity-calculator',
    category: 'chemistry',
    glyph: 'Osm',
    updatedAt: '2026-11-08',
    aliases: ['osmolarity calculator', 'osmolarity formula calculator', 'osmotic concentration calculator', 'mosm/l calculator', 'van’t hoff factor calculator', 'total particle concentration calculator'],
    related: ['molarity-calculator', 'molality-calculator', 'dilution-calculator', 'mole-fraction-calculator'],
    title: 'Osmolarity Calculator',
    description: 'Find a solution’s total dissolved-particle concentration — osmolarity = molarity × the number of particles each formula unit splits into — solved for any of the three.',
    example: 'A 0.154 mol/L sodium chloride solution splits into 2 particles per formula unit (Na⁺ and Cl⁻), for an osmolarity of 308 mOsm/L — the figure behind 0.9% "normal" saline.',
    solver: {
      defaultTarget: 'osmolarity',
      variables: [
        { id: 'osmolarity', label: 'Osmolarity', symbol: 'Osm', dimension: 'osmolarity', defaultValue: 308, defaultUnit: 'mOsm/L' },
        { id: 'molarity', label: 'Molarity', symbol: 'M', dimension: 'concentration', defaultValue: 0.154, defaultUnit: 'mol/L' },
        { id: 'particles', label: 'Particles per formula unit', symbol: 'i', dimension: 'count', defaultValue: 2, defaultUnit: 'count' }
      ],
      solve: {
        osmolarity: ({ molarity, particles }) => molarity * particles,
        molarity: ({ osmolarity, particles }) => (particles === 0 ? NaN : osmolarity / particles),
        particles: ({ osmolarity, molarity }) => (molarity === 0 ? NaN : osmolarity / molarity)
      }
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is osmolarity?',
        paragraphs: [
          'Molarity counts moles of a specific formula unit — one mole of NaCl is one mole of NaCl, full stop. But once that formula unit is dissolved in water, it can split apart: NaCl separates into a sodium ion and a chloride ion, so one mole of dissolved NaCl actually becomes two moles of separate particles floating in solution. Osmolarity counts those particles directly, regardless of what they came from or whether they carry a charge.',
          'The link between the two is the van’t Hoff factor, i: the number of particles one formula unit becomes once dissolved. OpenStax’s Chemistry 2e defines i as the ratio of moles of particles in solution to moles of formula units dissolved, and it is also the factor that scales a solute’s molarity into its contribution to the solution’s osmotic pressure. Osmolarity is that same particle count expressed as a concentration: osmolarity = molarity × i, in osmoles (Osm) or, far more commonly, milliosmoles (mOsm) per litre.',
          'A nonelectrolyte that stays intact in solution — glucose, for example — has i = 1, so its osmolarity equals its molarity. An ionic compound that fully dissociates has i equal to however many ions its formula produces: 2 for NaCl (Na⁺ and Cl⁻), 3 for CaCl₂ (one Ca²⁺ and two Cl⁻). Osmolarity adds up across every dissolved solute in a mixture, which is what makes it the quantity that actually governs osmosis — water moving across a membrane responds to the total particle count on each side, not to any one solute’s molarity on its own.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of osmolarity, molarity, and particles per formula unit; the third fills in automatically.',
        steps: [
          { name: 'Find the solute’s molarity', text: 'How many moles of the dissolved formula unit per litre of solution — use the molarity calculator above if you only have a mass and a volume.' },
          { name: 'Determine the particles per formula unit (i)', text: 'How many separate pieces one formula unit becomes in solution: 1 for a nonelectrolyte like glucose, 2 for NaCl, 3 for CaCl₂, and so on.' },
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit; osmolarity reads in Osm/L or mOsm/L, molarity in mol/L, and particles is a plain count.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result', text: 'The missing value appears immediately in your chosen unit.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Osmolarity = molarity × i rearranges to solve for molarity or i as well.',
        expression: 'Osm = M × i\nM = Osm ÷ i\ni = Osm ÷ M',
        terms: [
          { symbol: 'Osm', meaning: 'Osmolarity — total concentration of dissolved particles, in osmoles (or milliosmoles) per litre of solution.' },
          { symbol: 'M', meaning: 'Molarity of the solute, in moles of formula units per litre of solution.' },
          { symbol: 'i', meaning: 'The van’t Hoff factor — particles each formula unit splits into once dissolved. 1 for a nonelectrolyte, 2 or more for an electrolyte that dissociates into ions.' }
        ],
        note: 'This treats dissociation as complete, which is accurate for dilute solutions of strong electrolytes (table salt, for instance). A weak electrolyte that only partially dissociates has an effective i between 1 and its fully-dissociated value.'
      },
      workedExample: {
        intro: 'A 0.9% sodium chloride solution (physiological "normal saline") is 0.154 mol/L of NaCl. NaCl fully dissociates into Na⁺ and Cl⁻, so i = 2. What is its osmolarity?',
        rows: [
          { label: 'Molarity (M)', value: '0.154 mol/L' },
          { label: 'Particles per formula unit (i)', value: '2 (Na⁺ and Cl⁻)' },
          { label: 'Osmolarity (Osm = 0.154 × 2)', value: '0.308 Osm/L' },
          { label: 'In milliosmoles', value: '308 mOsm/L' }
        ],
        result: 'Osm = 308 mOsm/L',
        explanation: 'Multiplying the 0.154 mol/L molarity by the van’t Hoff factor of 2 gives 0.308 Osm/L, or 308 mOsm/L — the published osmolarity of 0.9% sodium chloride injection, USP (StatPearls, "Normal Saline"), and the reason this concentration is used for intravenous fluids: it is close to blood plasma’s own osmolarity, so it does not shift water into or out of blood cells.'
      },
      watchOut: [
        {
          title: 'Osmolarity is not the same quantity as osmolality',
          body: 'Osmolarity is particles per litre of solution; osmolality is particles per kilogram of solvent — the same distinction as molarity versus molality (see the molality calculator). The two are numerically close for dilute water-based solutions but are not identical, and clinical lab reports almost always mean osmolality even when they informally say "osmolarity."'
        },
        {
          title: 'The van’t Hoff factor assumes complete dissociation',
          body: 'i = 2 for NaCl assumes every formula unit splits into separate ions. That holds well for a dilute strong electrolyte, but weak electrolytes (which only partly ionize) and more concentrated solutions (where ion pairing becomes significant) have an effective i lower than the fully-dissociated count.'
        },
        {
          title: 'A nonelectrolyte’s osmolarity equals its molarity',
          body: 'Glucose, urea, and other molecules that dissolve without splitting apart have i = 1, so their osmolarity and molarity are the same number — no separate calculation is needed for those.'
        },
        {
          title: 'Osmolarity from a mixture adds across every solute',
          body: 'A solution with more than one dissolved substance has a total osmolarity equal to the sum of each solute’s own molarity × i. This calculator handles one solute at a time; add the results for a mixture.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §11.4 "Colligative Properties" (the van’t Hoff factor, i)', url: 'https://openstax.org/books/chemistry-2e/pages/11-4-colligative-properties' },
        { label: 'StatPearls [Internet] (NCBI Bookshelf, NIH), "Normal Saline" — 0.9% NaCl composition and osmolarity', url: 'https://www.ncbi.nlm.nih.gov/sites/books/NBK545210/' }
      ]
    },
    inputs: [
      { id: 'molarity', label: 'Molarity (mol/m³)', type: 'number', placeholder: '154', defaultValue: 154, step: 1, min: 0 },
      { id: 'particles', label: 'Particles per formula unit', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 }
    ],
    seo: {
      title: 'Osmolarity Calculator – Osm = Molarity × i',
      description: 'Free osmolarity calculator. Solve osmolarity = molarity × particles per formula unit (the van’t Hoff factor) for any of the three, with a worked example.',
      faq: [
        { question: 'How do I calculate osmolarity?', answer: 'Multiply the solute’s molarity by its van’t Hoff factor (i), the number of particles each formula unit splits into: Osm = M × i. 0.154 mol/L of NaCl (i = 2) gives 0.154 × 2 = 0.308 Osm/L, or 308 mOsm/L.' },
        { question: 'What is the van’t Hoff factor?', answer: 'The number of separate particles one formula unit of a solute becomes once dissolved — 1 for a nonelectrolyte like glucose, 2 for NaCl (Na⁺ and Cl⁻), 3 for CaCl₂ (Ca²⁺ and two Cl⁻).' },
        { question: 'What is the osmolarity of normal saline?', answer: '308 mOsm/L. 0.9% sodium chloride injection is 0.154 mol/L of NaCl; since NaCl dissociates into 2 ions, 0.154 × 2 = 0.308 Osm/L.' },
        { question: 'Is osmolarity the same as molarity?', answer: 'Only when i = 1 — a solute that does not dissociate, like glucose. For an electrolyte that splits into ions, osmolarity is always higher than molarity by a factor of i.' },
        { question: 'Is osmolarity the same as osmolality?', answer: 'No. Osmolarity is particles per litre of solution; osmolality is particles per kilogram of solvent. They are close for dilute aqueous solutions but not identical, the same distinction as molarity versus molality.' },
        { question: 'What is the osmolarity of a glucose solution?', answer: 'The same number as its molarity, since glucose does not dissociate (i = 1). A 0.2 mol/L glucose solution has an osmolarity of 0.2 Osm/L (200 mOsm/L).' },
        { question: 'How do I find the van’t Hoff factor if I know the osmolarity and molarity?', answer: 'Divide osmolarity by molarity: i = Osm ÷ M. An osmolarity of 0.3 Osm/L from a 0.1 mol/L solution gives i = 0.3 ÷ 0.1 = 3.' }
      ]
    },
    compute(values) {
      return { osmolarity: values.molarity * values.particles };
    }
  },
  {
    id: 'normality-calculator',
    category: 'chemistry',
    glyph: 'N',
    updatedAt: '2026-11-08',
    aliases: ['normality calculator', 'normality formula calculator', 'equivalent concentration calculator', 'n = m x n calculator', 'eq/l calculator', 'gram equivalent weight calculator'],
    related: ['molarity-calculator', 'titration-calculator', 'dilution-calculator', 'solution-concentration-calculator'],
    title: 'Normality Calculator (N = M × n)',
    description: 'Solve for normality, molarity, or the equivalence factor — normality equals molarity multiplied by n, the number of equivalents (reacting units) each mole provides.',
    example: '0.1 mol/L sulfuric acid (H₂SO₄, a diprotic acid with n = 2) has a normality of 0.2 N.',
    solver: {
      defaultTarget: 'normality',
      variables: [
        { id: 'normality', label: 'Normality', symbol: 'N', dimension: 'normality', defaultValue: 0.2, defaultUnit: 'eq/L' },
        { id: 'molarity', label: 'Molarity', symbol: 'M', dimension: 'concentration', defaultValue: 0.1, defaultUnit: 'mol/L' },
        { id: 'equivalenceFactor', label: 'Equivalence factor', symbol: 'n', dimension: 'count', defaultValue: 2, defaultUnit: 'count' }
      ],
      solve: {
        normality: ({ molarity, equivalenceFactor }) => molarity * equivalenceFactor,
        molarity: ({ normality, equivalenceFactor }) => (equivalenceFactor === 0 ? NaN : normality / equivalenceFactor),
        equivalenceFactor: ({ normality, molarity }) => (molarity === 0 ? NaN : normality / molarity)
      }
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is normality?',
        paragraphs: [
          'Normality measures concentration in equivalents per litre rather than moles per litre. An "equivalent" is however much of a substance reacts with (or supplies) one mole of a specified reference particle — a H⁺ ion in an acid-base reaction, or one electron in a redox reaction. Normality scales up a solute’s molarity by n, the number of those equivalents each mole of the solute provides: N = M × n.',
          'The equivalence factor depends entirely on the reaction a solution is being used for, which is what makes normality different from molarity — the same solution can have more than one normality depending on context. Sulfuric acid, H₂SO₄, can donate 2 protons per molecule, so as an acid it is n = 2 and its normality is twice its molarity. Potassium permanganate, KMnO₄, accepts 5 electrons per formula unit in an acidic redox titration, so as that specific oxidizer it is n = 5.',
          'Normality is a legacy unit. NIST’s own guide to the SI (NIST SP 811) calls the term "normality" and the symbol N obsolete, recommending amount-of-substance concentration (molarity) instead. In practice, though, it remains the standard way analytical and clinical laboratories report titrant strength, precisely because it lets an acid-base or redox titration’s equivalence point be read directly as "equal normalities, equal volumes" without separately tracking each reaction’s stoichiometry — see the titration calculator for that calculation.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of normality, molarity, and the equivalence factor; the third fills in automatically.',
        steps: [
          { name: 'Find the solute’s molarity', text: 'Moles of the solute per litre of solution — use the molarity calculator above if you only have a mass and a volume.' },
          { name: 'Determine the equivalence factor, n', text: 'How many equivalents (H⁺ ions, electrons, or charges) one mole of this solute provides for the specific reaction in question.' },
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit; normality reads in eq/L (often just written "N") or meq/L, molarity in mol/L, and n is a plain count.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result', text: 'The missing value appears immediately in your chosen unit.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'N = M × n rearranges to solve for molarity or the equivalence factor as well.',
        expression: 'N = M × n\nM = N ÷ n\nn = N ÷ M',
        terms: [
          { symbol: 'N', meaning: 'Normality — concentration in equivalents per litre of solution.' },
          { symbol: 'M', meaning: 'Molarity of the solute, in moles of formula units per litre of solution.' },
          { symbol: 'n', meaning: 'Equivalence factor — equivalents (reacting units) each mole of the solute provides for a specific reaction. A fixed property of the reaction, not something the calculator derives on its own.' }
        ],
        note: 'n is reaction-specific: the same compound can have a different equivalence factor as an acid, a base, or an oxidizer in different reactions, so it must be looked up or worked out from the actual reaction, not assumed from the formula alone.'
      },
      workedExample: {
        intro: 'Sulfuric acid, H₂SO₄, is prepared at 0.1 mol/L. As a diprotic acid it donates 2 protons per molecule (n = 2). What is its normality?',
        rows: [
          { label: 'Molarity (M)', value: '0.1 mol/L' },
          { label: 'Equivalence factor (n)', value: '2 (diprotic acid)' },
          { label: 'Normality (N = 0.1 × 2)', value: '0.2 N (0.2 eq/L)' }
        ],
        result: 'N = 0.2 N',
        explanation: 'Each mole of H₂SO₄ supplies 2 moles of reactive H⁺, so a 0.1 mol/L solution supplies equivalents at twice that rate: 0.1 × 2 = 0.2 eq/L, written 0.2 N.'
      },
      watchOut: [
        {
          title: 'The equivalence factor is not automatic — it depends on the reaction',
          body: 'This calculator takes n as a given input; it does not look up or derive it from a formula. The same substance can have different n values in different roles: H₃PO₄ is n = 1, 2, or 3 depending on how many of its three protons actually react in a given reaction.'
        },
        {
          title: 'Normality is explicitly molarity scaled by a reaction-dependent factor, not a separate measurement',
          body: 'Normality always equals molarity × n for the reaction being used — see the molarity calculator for finding M in the first place. There is no way to state a solution’s normality without first knowing both its molarity and the specific reaction’s equivalence factor.'
        },
        {
          title: 'NIST and IUPAC consider "normality" an obsolete term',
          body: 'Modern SI-based practice (NIST SP 811) recommends amount-of-substance concentration (molarity) instead of normality. It remains in common use in titrimetric analytical chemistry because it simplifies titration arithmetic, not because standards bodies endorse it.'
        },
        {
          title: 'Mixing up normality and molarity gives an answer off by exactly n',
          body: 'Reading a "0.2 N" sulfuric acid solution as 0.2 mol/L (instead of the correct 0.1 mol/L) is a factor-of-2 error that propagates into anything calculated from it — always check whether a labeled concentration is N or M before using it.'
        }
      ],
      references: [
        { label: 'NIST SP 811, "Guide for the Use of the International System of Units (SI)", Chapter 8, §8.6.5 (normality and molarity as obsolete terms)', url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8' },
        { label: 'IUPAC Compendium of Chemical Terminology (Gold Book), "equivalent entity" (E02192)', url: 'https://goldbook.iupac.org/terms/view/E02192' }
      ]
    },
    inputs: [
      { id: 'molarity', label: 'Molarity (mol/m³)', type: 'number', placeholder: '100', defaultValue: 100, step: 1, min: 0 },
      { id: 'equivalenceFactor', label: 'Equivalence factor (n)', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 }
    ],
    seo: {
      title: 'Normality Calculator (N = M × n)',
      description: 'Free normality calculator. Solve N = M × n for normality, molarity, or the equivalence factor, with a worked example comparing normality and molarity.',
      faq: [
        { question: 'How do I calculate normality?', answer: 'Multiply molarity by the equivalence factor n: N = M × n. A 0.1 mol/L solution of a diprotic acid (n = 2) has a normality of 0.1 × 2 = 0.2 N.' },
        { question: 'What is the difference between normality and molarity?', answer: 'Molarity counts moles of a formula unit; normality counts equivalents (reacting units — H⁺ ions, electrons) of it, which is molarity scaled by the equivalence factor n. The two are equal only when n = 1.' },
        { question: 'How do I find the equivalence factor, n?', answer: 'It depends on the specific reaction: for an acid or base, count the protons (H⁺) it actually donates or accepts in that reaction; for a redox reagent, count the electrons transferred per formula unit.' },
        { question: 'What is the normality of 0.1 M H₂SO₄?', answer: '0.2 N. Sulfuric acid is diprotic (n = 2) as a full acid, so N = 0.1 × 2 = 0.2.' },
        { question: 'How is normality used in titration?', answer: 'At a titration’s equivalence point, equivalents of titrant equal equivalents of analyte: N₁V₁ = N₂V₂. Because normality already accounts for stoichiometry, this holds even when the acid and base react in other than a 1:1 mole ratio. The titration calculator above instead works directly from molarity and the balanced equation’s coefficients.' },
        { question: 'Is normality still used?', answer: 'Yes, especially in titrimetric analytical and clinical chemistry, even though NIST’s guide to the SI calls the term obsolete in favor of molar (amount-of-substance) concentration.' },
        { question: 'Can normality be lower than molarity?', answer: 'No — n is always 1 or more (it counts how many equivalents a mole provides), so normality is always greater than or equal to molarity for the same solution.' }
      ]
    },
    compute(values) {
      return { normality: values.molarity * values.equivalenceFactor };
    }
  },
  {
    id: 'titration-calculator',
    category: 'chemistry',
    glyph: 'Ti',
    updatedAt: '2026-11-08',
    aliases: ['titration calculator', 'acid base titration calculator', 'titration formula calculator', 'equivalence point calculator', 'titrant concentration calculator', 'molarity from titration calculator'],
    related: ['dilution-calculator', 'molarity-calculator', 'normality-calculator', 'ph-poh-calculator'],
    title: 'Titration Calculator',
    description: 'Find the unknown concentration or volume at a titration’s equivalence point, scaling C₁V₁ = C₂V₂ by each species’ coefficient from the balanced equation.',
    example: 'Titrating 25.00 mL of unknown H₂SO₄ with 0.100 mol/L NaOH (H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O) takes 30.00 mL of titrant to reach the endpoint, for an H₂SO₄ concentration of 0.06 mol/L.',
    solver: {
      defaultTarget: 'concentration2',
      variables: [
        { id: 'concentration1', label: 'Titrant concentration', symbol: 'C₁', dimension: 'concentration', defaultValue: 0.1, defaultUnit: 'mol/L' },
        { id: 'volume1', label: 'Titrant volume used', symbol: 'V₁', dimension: 'volume', defaultValue: 30, defaultUnit: 'mL' },
        { id: 'coefficient1', label: 'Titrant’s coefficient', symbol: 'a', dimension: 'count', defaultValue: 2, defaultUnit: 'count', fixed: true },
        { id: 'concentration2', label: 'Analyte concentration', symbol: 'C₂', dimension: 'concentration', defaultValue: 0.06, defaultUnit: 'mol/L' },
        { id: 'volume2', label: 'Analyte volume', symbol: 'V₂', dimension: 'volume', defaultValue: 25, defaultUnit: 'mL' },
        { id: 'coefficient2', label: 'Analyte’s coefficient', symbol: 'b', dimension: 'count', defaultValue: 1, defaultUnit: 'count', fixed: true }
      ],
      solve: {
        concentration1: ({ concentration2, volume1, volume2, coefficient1, coefficient2 }) =>
          volume1 === 0 || coefficient2 === 0 ? NaN : (concentration2 * volume2 * coefficient1) / (volume1 * coefficient2),
        volume1: ({ concentration1, concentration2, volume2, coefficient1, coefficient2 }) =>
          concentration1 === 0 || coefficient2 === 0 ? NaN : (concentration2 * volume2 * coefficient1) / (concentration1 * coefficient2),
        concentration2: ({ concentration1, volume1, volume2, coefficient1, coefficient2 }) =>
          volume2 === 0 || coefficient1 === 0 ? NaN : (concentration1 * volume1 * coefficient2) / (volume2 * coefficient1),
        volume2: ({ concentration1, volume1, concentration2, coefficient1, coefficient2 }) =>
          concentration2 === 0 || coefficient1 === 0 ? NaN : (concentration1 * volume1 * coefficient2) / (concentration2 * coefficient1)
      },
      outputs: [
        { id: 'molesAnalyte', label: 'Moles of analyte at equivalence', dimension: 'amountOfSubstance', unit: 'mmol', compute: (si) => si.concentration2 * si.volume2 }
      ],
      visuals: [
        {
          type: 'compareBars',
          bars: [
            { from: 'volume1', label: 'Titrant volume used' },
            { from: 'volume2', label: 'Analyte volume' }
          ],
          title: 'Volumes at the equivalence point'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is a titration?',
        paragraphs: [
          'A titration finds an unknown solution’s concentration by reacting it, drop by drop, with a second solution of precisely known concentration (the titrant) until the reaction is exactly complete — the equivalence point. OpenStax’s Chemistry 2e introduces acid-base titration this way: a measured volume of titrant of known concentration is added until an indicator (or a pH meter) signals that a stoichiometric amount has reacted with the analyte, the solution being measured.',
          'For a simple 1:1 reaction, that balance is C₁V₁ = C₂V₂ — the same shape as the dilution equation, just interpreted differently (see the watch-out item below for exactly how they differ). Many real titrations are not 1:1, though: when two moles of titrant are needed for every one mole of analyte (sodium hydroxide neutralizing sulfuric acid, for instance), the balance has to account for that ratio, which is where each species’ coefficient from the balanced equation comes in.',
          'Generalized, the condition at the equivalence point is that moles of titrant divided by its own coefficient equals moles of analyte divided by its own coefficient: (C₁V₁) ÷ a = (C₂V₂) ÷ b, which rearranges to C₁V₁ × b = C₂V₂ × a. Setting both coefficients to 1 recovers the familiar 1:1 case.'
        ]
      },
      howTo: {
        intro: 'Write and balance the reaction between the titrant and the analyte first — the two coefficients come directly from it.',
        steps: [
          { name: 'Balance the reaction', text: 'Write the balanced equation between the titrant and the analyte, and read off each one’s coefficient. H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O gives NaOH a coefficient of 2 and H₂SO₄ a coefficient of 1.' },
          { name: 'Enter the titrant’s known concentration and coefficient', text: 'C₁ is the titrant’s concentration (what is in the burette); a is its coefficient from the balanced equation.' },
          { name: 'Enter the analyte’s coefficient and known volume', text: 'b is the analyte’s coefficient; V₂ is the volume of the solution being analyzed.' },
          { name: 'Enter whichever of V₁ or C₂ you measured', text: 'If you titrated to find the volume of titrant needed, enter V₁ and solve for C₂. If you want to know how much titrant a target concentration needs, enter C₂ and solve for V₁.' },
          { name: 'Read the result', text: 'The missing value appears immediately, alongside the moles of analyte present at the equivalence point.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'C₁V₁ × b = C₂V₂ × a rearranges to solve for any one of the two concentrations or two volumes, given the coefficients and the other two.',
        expression: 'C₁V₁ × b = C₂V₂ × a\nC₁ = (C₂V₂ × a) ÷ (V₁ × b)\nV₁ = (C₂V₂ × a) ÷ (C₁ × b)\nC₂ = (C₁V₁ × b) ÷ (V₂ × a)\nV₂ = (C₁V₁ × b) ÷ (C₂ × a)',
        terms: [
          { symbol: 'C₁, V₁', meaning: 'Concentration and volume of the titrant — the solution of known concentration added from the burette.' },
          { symbol: 'C₂, V₂', meaning: 'Concentration and volume of the analyte — the solution being measured.' },
          { symbol: 'a, b', meaning: 'The titrant’s and the analyte’s coefficients in the balanced reaction between them. Both equal 1 for a 1:1 reaction, which reduces the formula to the familiar C₁V₁ = C₂V₂.' }
        ],
        note: 'The two coefficients are fixed inputs, not something the calculator solves for — they come from writing and balancing the actual chemical equation, the same discipline the limiting reagent and stoichiometry calculators rely on.'
      },
      workedExample: {
        intro: '25.00 mL of a sulfuric acid solution of unknown concentration is titrated with 0.100 mol/L sodium hydroxide: H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O. The endpoint is reached after adding 30.00 mL of the NaOH titrant.',
        rows: [
          { label: 'Titrant concentration (C₁, NaOH)', value: '0.100 mol/L' },
          { label: 'Titrant volume used (V₁)', value: '30.00 mL' },
          { label: 'Titrant’s coefficient (a, NaOH)', value: '2' },
          { label: 'Analyte volume (V₂, H₂SO₄)', value: '25.00 mL' },
          { label: 'Analyte’s coefficient (b, H₂SO₄)', value: '1' },
          { label: 'Analyte concentration (C₂ = (C₁V₁ × b) ÷ (V₂ × a))', value: '(0.100 × 30.00 × 1) ÷ (25.00 × 2) = 0.06 mol/L' }
        ],
        result: 'C₂ = 0.06 mol/L',
        explanation: '30.00 mL of 0.100 mol/L NaOH is 3.00 mmol of NaOH, which at a 2:1 NaOH-to-acid ratio reacts with exactly 1.50 mmol of H₂SO₄. Spread through the 25.00 mL analyte sample, that is 1.50 ÷ 25.00 = 0.06 mol/L.'
      },
      watchOut: [
        {
          title: 'Titration is not the same calculation as dilution',
          body: 'Both use a C₁V₁-shaped equation, but dilution (see the dilution calculator) adds solvent to the same solute, conserving its moles — nothing reacts. Titration reacts a known solution against a different, unknown one until a stoichiometric endpoint is reached; the two solutions are chemically different species related by a balanced equation, not the same solute before and after.'
        },
        {
          title: 'The coefficients are not optional for anything but a 1:1 reaction',
          body: 'Leaving both coefficients at 1 when the real reaction is not 1:1 (as with H₂SO₄ and NaOH above) gives an answer off by exactly the ratio between the two coefficients — 0.03 mol/L instead of the correct 0.06 mol/L in the worked example, a factor-of-2 error.'
        },
        {
          title: 'This assumes the reaction goes to completion with no side reactions',
          body: 'The equivalence point calculation only holds when the titrant reacts cleanly and completely with the analyte according to the written equation — a side reaction, an indicator error, or a titrant that has partially degraded all throw off the result without showing up as an error here.'
        },
        {
          title: 'The equivalence point is a different point from the pH equivalence shown by an indicator',
          body: 'An indicator changes color at its own color-change range, which is chosen to be close to the true equivalence point but is not mathematically identical to it — see the pH/pOH calculator for the chemistry of why a strong acid/strong base equivalence point sits at pH 7 while a weak acid/strong base one does not.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §14.7 "Acid-Base Titrations" (equivalence point, worked titration example)', url: 'https://openstax.org/books/chemistry-2e/pages/14-7-acid-base-titrations' },
        { label: 'OpenStax, Chemistry 2e, §4.3 "Reaction Stoichiometry" (mole-ratio calculations from a balanced equation)', url: 'https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry' }
      ]
    },
    inputs: [
      { id: 'concentration1', label: 'Titrant concentration (mol/m³)', type: 'number', placeholder: '100', defaultValue: 100, step: 1, min: 0 },
      { id: 'volume1', label: 'Titrant volume used (m³)', type: 'number', placeholder: '0.00003', defaultValue: 0.00003, step: 0.000001, min: 0 },
      { id: 'coefficient1', label: 'Titrant’s coefficient', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 },
      { id: 'volume2', label: 'Analyte volume (m³)', type: 'number', placeholder: '0.000025', defaultValue: 0.000025, step: 0.000001, min: 0 },
      { id: 'coefficient2', label: 'Analyte’s coefficient', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 }
    ],
    seo: {
      title: 'Titration Calculator – Acid-Base Equivalence Point',
      description: 'Free titration calculator. Solve for the unknown concentration or volume at a titration’s equivalence point, scaled by each species’ coefficient.',
      faq: [
        { question: 'What is the titration formula?', answer: 'C₁V₁ × b = C₂V₂ × a, where C₁/V₁ and a are the titrant’s concentration, volume, and coefficient, and C₂/V₂ and b are the analyte’s. For a 1:1 reaction (a = b = 1) this is the familiar C₁V₁ = C₂V₂.' },
        { question: 'How do I find an unknown concentration from a titration?', answer: 'Solve for C₂: C₂ = (C₁V₁ × b) ÷ (V₂ × a). Titrating 25.00 mL of unknown H₂SO₄ (b = 1) with 30.00 mL of 0.100 mol/L NaOH (a = 2) gives C₂ = (0.100 × 30.00 × 1) ÷ (25.00 × 2) = 0.06 mol/L.' },
        { question: 'What is the equivalence point?', answer: 'The point in a titration where the titrant has reacted with exactly a stoichiometric amount of the analyte — neither is left over, according to the balanced equation between them.' },
        { question: 'How is titration different from dilution?', answer: 'Dilution adds solvent to one solute, keeping its moles constant (see the dilution calculator). Titration reacts a known solution against a chemically different unknown one until a stoichiometric endpoint — two different species are involved, related by a balanced equation, not a before-and-after of the same solute.' },
        { question: 'What if the titrant and analyte react 1:1?', answer: 'Set both coefficients to 1, which reduces the formula to C₁V₁ = C₂V₂ — the simplest case, such as a strong monoprotic acid titrated with a strong monoprotic base.' },
        { question: 'How do I find the volume of titrant needed for a target concentration?', answer: 'Solve for V₁: V₁ = (C₂V₂ × a) ÷ (C₁ × b). This tells you how much titrant to add before you start, rather than reading off how much was actually used.' },
        { question: 'Does this calculator balance the chemical equation for me?', answer: 'No — it takes the two coefficients as given. Balance the equation between the titrant and analyte first (see the stoichiometry calculator), then enter those coefficients here.' }
      ]
    },
    compute(values) {
      return {
        concentration2: (values.concentration1 * values.volume1 * values.coefficient2) / (values.volume2 * values.coefficient1)
      };
    }
  },
  {
    id: 'equilibrium-constant-calculator',
    category: 'chemistry',
    glyph: 'Keq',
    updatedAt: '2026-11-08',
    aliases: ['equilibrium constant calculator', 'keq calculator', 'kc calculator', 'reaction quotient calculator', 'law of mass action calculator', 'chemical equilibrium calculator'],
    related: ['stoichiometry-calculator', 'ph-poh-calculator', 'rate-constant-calculator', 'gibbs-free-energy-calculator'],
    title: 'Equilibrium Constant Calculator (Kc)',
    description: 'Find the equilibrium constant Kc for a reaction aA + bB ⇌ cC + dD from the equilibrium concentrations and coefficients of up to two reactants and two products.',
    example: 'For 2NO₂(g) ⇌ N₂O₄(g) at equilibrium concentrations [NO₂] = 0.016 mol/L and [N₂O₄] = 0.042 mol/L, Kc = 0.042 ÷ 0.016² ≈ 1.6 × 10².',
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is the equilibrium constant?',
        paragraphs: [
          'A reversible reaction, aA + bB ⇌ cC + dD, reaches equilibrium when the forward and reverse reaction rates become equal — concentrations stop changing, even though both reactions keep happening. OpenStax’s Chemistry 2e Section 13.2 defines the equilibrium constant, Kc, as the value the reaction quotient settles to once that balance is reached: Kc = [C]ᶜ[D]ᵏ ÷ ([A]ᵃ[B]ᵇ), using equilibrium molar concentrations raised to each species’ coefficient from the balanced equation.',
          'Kc is a single number that characterizes how far a reaction proceeds toward products before equilibrium sets in, at a given temperature. A large Kc (much greater than 1) means the equilibrium mixture favors products; a small Kc (much less than 1) means it favors reactants. Kc changes only with temperature — not with the starting concentrations, which is exactly what makes it a useful constant rather than just another measurement.',
          'This calculator covers the general small-molecule case directly: up to two reactants and two products, each with its own equilibrium concentration and coefficient. It does not predict how a shift in conditions moves the equilibrium (Le Chatelier’s principle) — it only computes Kc from concentrations you already know are at equilibrium.'
        ]
      },
      howTo: {
        intro: 'Enter each species’ equilibrium concentration and its coefficient from the balanced equation; leave a species at 0/0 to drop it when there is only one reactant or one product.',
        steps: [
          { name: 'Write and balance the equilibrium', text: 'Confirm the balanced equation and read off each species’ coefficient. 2NO₂(g) ⇌ N₂O₄(g) gives NO₂ a coefficient of 2 and N₂O₄ a coefficient of 1.' },
          { name: 'Enter Reactant A (and B, if there is one)', text: 'Its equilibrium concentration and coefficient. Leave Reactant B’s coefficient at 0 if the reaction only has one reactant.' },
          { name: 'Enter Product C (and D, if there is one)', text: 'Its equilibrium concentration and coefficient. Leave Product D’s coefficient at 0 if the reaction only has one product.' },
          { name: 'Read Kc', text: 'The calculator raises each concentration to its own coefficient, multiplies the products’ terms together and the reactants’ terms together, and divides.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The law of mass action: at equilibrium, the reaction quotient equals the constant Kc.',
        expression: 'aA + bB ⇌ cC + dD\nKc = ([C]ᶜ × [D]ᵏ) ÷ ([A]ᵃ × [B]ᵏ)',
        terms: [
          { symbol: '[A], [B]', meaning: 'Equilibrium molar concentrations of the two reactants (mol/L).' },
          { symbol: '[C], [D]', meaning: 'Equilibrium molar concentrations of the two products (mol/L).' },
          { symbol: 'a, b, c, d', meaning: 'Each species’ coefficient in the balanced equilibrium equation.' }
        ],
        note: 'A species left at coefficient 0 contributes a factor of 1 to its side of the expression (any value raised to the power 0 is 1), which is what lets a single-reactant or single-product reaction use the same general formula.'
      },
      workedExample: {
        intro: 'Nitrogen dioxide and dinitrogen tetroxide reach equilibrium: 2NO₂(g) ⇌ N₂O₄(g). At a given temperature, [NO₂] = 0.016 mol/L and [N₂O₄] = 0.042 mol/L at equilibrium.',
        rows: [
          { label: '[NO₂] (reactant, coefficient 2)', value: '0.016 mol/L' },
          { label: '[N₂O₄] (product, coefficient 1)', value: '0.042 mol/L' },
          { label: 'Denominator, [NO₂]²', value: '0.016² = 2.56 × 10⁻⁴' },
          { label: 'Kc = [N₂O₄] ÷ [NO₂]²', value: '0.042 ÷ 2.56 × 10⁻⁴ ≈ 164' }
        ],
        result: 'Kc ≈ 1.6 × 10² (164, to the two significant figures the concentrations support, matching OpenStax’s own published 1.6 × 10²)',
        explanation: 'Squaring [NO₂] gives 2.56 × 10⁻⁴, and dividing [N₂O₄] by that gives 0.042 ÷ 2.56 × 10⁻⁴ ≈ 164. Both input concentrations carry two significant figures, so the properly rounded answer is 1.6 × 10² (160) — the figure OpenStax itself reports for this example.'
      },
      watchOut: [
        {
          title: 'Only equilibrium concentrations go into Kc',
          body: 'Plugging in starting (initial) concentrations instead of the concentrations actually present once the reaction has reached equilibrium gives the reaction quotient Q at that moment, not Kc — the two are equal only once the system has actually reached equilibrium.'
        },
        {
          title: 'The coefficients must come from a correctly balanced equation',
          body: 'Kc is extremely sensitive to the exponents — squaring a concentration instead of using it to the first power, because the coefficient was copied wrong, changes the result by orders of magnitude for anything but a concentration of exactly 1.'
        },
        {
          title: 'Kc depends on temperature, not on starting concentrations',
          body: 'The same reaction has a different Kc at a different temperature, but the same Kc regardless of what concentrations the reaction started from — only the equilibrium concentrations themselves change with the starting point, not the constant they satisfy.'
        },
        {
          title: 'This calculator does not predict which way an equilibrium shifts',
          body: 'Adding more of a reactant, changing volume, or changing temperature shifts where the equilibrium concentrations land (Le Chatelier’s principle), which is a separate question from computing Kc once those new equilibrium concentrations are known.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §13.2 "Equilibrium Constants" (Kc formula and the 2NO₂ ⇌ N₂O₄ worked example)', url: 'https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants' },
        { label: 'OpenStax, Chemistry 2e, §13.1 "Chemical Equilibria" (dynamic equilibrium, forward and reverse rates)', url: 'https://openstax.org/books/chemistry-2e/pages/13-1-chemical-equilibria' }
      ]
    },
    inputs: [
      { id: 'concA', label: 'Reactant A concentration (mol/L)', type: 'number', placeholder: '0.016', defaultValue: 0.016, step: 0.001, min: 0 },
      { id: 'coeffA', label: 'Reactant A coefficient', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 },
      { id: 'concB', label: 'Reactant B concentration (mol/L)', type: 'number', placeholder: '0', defaultValue: 0, step: 0.001, min: 0 },
      { id: 'coeffB', label: 'Reactant B coefficient', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 },
      { id: 'concC', label: 'Product C concentration (mol/L)', type: 'number', placeholder: '0.042', defaultValue: 0.042, step: 0.001, min: 0 },
      { id: 'coeffC', label: 'Product C coefficient', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 },
      { id: 'concD', label: 'Product D concentration (mol/L)', type: 'number', placeholder: '0', defaultValue: 0, step: 0.001, min: 0 },
      { id: 'coeffD', label: 'Product D coefficient', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'keq',
      headlineLabel: 'Equilibrium constant, Kc',
      outputs: [
        { id: 'keq', label: 'Equilibrium constant (Kc)', format: 'significant' },
        { id: 'numerator', label: 'Products side, [C]ᶜ[D]ᵏ', format: 'significant' },
        { id: 'denominator', label: 'Reactants side, [A]ᵃ[B]ᵏ', format: 'significant' }
      ],
      groups: [
        { title: 'Reactants', inputs: ['concA', 'coeffA', 'concB', 'coeffB'] },
        { title: 'Products', inputs: ['concC', 'coeffC', 'concD', 'coeffD'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'denominator', label: 'Reactants side' },
          { from: 'numerator', label: 'Products side' }
        ],
        title: 'Which side does the equilibrium favor?',
        highlight: 1
      }
    },
    seo: {
      title: 'Equilibrium Constant Calculator (Kc)',
      description: 'Free equilibrium constant calculator. Find Kc = [C]^c[D]^d ÷ ([A]^a[B]^b) from equilibrium concentrations and coefficients, with a worked OpenStax example.',
      faq: [
        { question: 'How do I calculate the equilibrium constant, Kc?', answer: 'Raise each product’s equilibrium concentration to its coefficient and multiply them together, do the same for the reactants, then divide: Kc = [C]ᶜ[D]ᵏ ÷ ([A]ᵃ[B]ᵏ). For 2NO₂ ⇌ N₂O₄ with [NO₂] = 0.016 M and [N₂O₄] = 0.042 M, Kc = 0.042 ÷ 0.016² ≈ 1.6 × 10².' },
        { question: 'What does a large Kc mean?', answer: 'A Kc much greater than 1 means that at equilibrium, the products dominate the mixture — the forward reaction goes nearly to completion. A Kc much less than 1 means the reactants dominate instead.' },
        { question: 'What is the difference between Kc and Q, the reaction quotient?', answer: 'They use the identical formula, but Q is calculated from whatever concentrations exist at any moment, while Kc is specifically Q evaluated once the system has reached equilibrium. Comparing Q to Kc predicts which direction a reaction will shift to reach equilibrium.' },
        { question: 'Does Kc depend on the starting concentrations?', answer: 'No. Kc depends only on the reaction and the temperature. Different starting concentrations reach different equilibrium concentrations, but those equilibrium concentrations always satisfy the same Kc at a fixed temperature.' },
        { question: 'What if my reaction only has one reactant or one product?', answer: 'Leave the unused species’ coefficient (and concentration) at 0 — a coefficient of 0 contributes a factor of 1 to that side of the expression, which has no effect on the result.' },
        { question: 'How do coefficients affect Kc?', answer: 'Each concentration is raised to the power of its own coefficient before multiplying, so doubling a coefficient squares that species’ contribution — a copying mistake in a coefficient changes Kc far more than the same mistake in a concentration.' },
        { question: 'Does Kc have units?', answer: 'Technically yes (depending on the coefficients), but chemists conventionally report it as a dimensionless number, treating each concentration as a ratio to a 1 mol/L standard state — this calculator follows that same convention.' }
      ]
    },
    compute(values) {
      const numerator = values.concC ** values.coeffC * values.concD ** values.coeffD;
      const denominator = values.concA ** values.coeffA * values.concB ** values.coeffB;
      return {
        keq: numerator / denominator,
        numerator,
        denominator
      };
    }
  },
  {
    id: 'gibbs-free-energy-calculator',
    category: 'chemistry',
    glyph: 'ΔG',
    updatedAt: '2026-11-08',
    aliases: ['gibbs free energy calculator', 'gibbs energy calculator', 'delta g calculator', 'free energy calculator', 'spontaneity calculator', 'dg = dh - tds calculator'],
    related: ['equilibrium-constant-calculator', 'arrhenius-equation-calculator', 'ideal-gas-law-calculator', 'rate-constant-calculator'],
    title: 'Gibbs Free Energy Calculator (ΔG = ΔH − TΔS)',
    description: 'Solve ΔG = ΔH − TΔS for the Gibbs free energy change, enthalpy change, absolute temperature, or entropy change, and read off whether a process is spontaneous.',
    example: 'Vaporizing water at 298 K (ΔH = 44.01 kJ/mol, ΔS = 118.8 J/(mol·K)) gives ΔG = 44.01 − 298 × 0.1188 ≈ 8.6 kJ/mol — positive, so boiling is not spontaneous at room temperature.',
    solver: {
      defaultTarget: 'gibbs',
      variables: [
        { id: 'gibbs', label: 'Gibbs free energy change', symbol: 'ΔG', dimension: 'molarEnergy', defaultValue: 8608, defaultUnit: 'J/mol' },
        { id: 'enthalpy', label: 'Enthalpy change', symbol: 'ΔH', dimension: 'molarEnergy', defaultValue: 44010, defaultUnit: 'J/mol' },
        { id: 'temperature', label: 'Temperature', symbol: 'T', dimension: 'temperature', defaultValue: 298, defaultUnit: 'K' },
        { id: 'entropy', label: 'Entropy change', symbol: 'ΔS', dimension: 'molarEntropy', defaultValue: 118.8, defaultUnit: 'J/molK' }
      ],
      solve: {
        gibbs: ({ enthalpy, temperature, entropy }) => enthalpy - temperature * entropy,
        enthalpy: ({ gibbs, temperature, entropy }) => gibbs + temperature * entropy,
        temperature: ({ gibbs, enthalpy, entropy }) => (entropy === 0 ? NaN : (enthalpy - gibbs) / entropy),
        entropy: ({ gibbs, enthalpy, temperature }) => (temperature === 0 ? NaN : (enthalpy - gibbs) / temperature)
      },
      outputs: [
        { id: 'crossoverTemperature', label: 'Temperature where ΔG = 0', dimension: 'temperature', compute: (si) => (si.entropy === 0 ? NaN : si.enthalpy / si.entropy) }
      ],
      derive: (si) => ({ entropyTerm: si.temperature * si.entropy }),
      visuals: [
        {
          type: 'compareBars',
          bars: [
            { from: 'enthalpy', label: 'ΔH' },
            { from: 'entropyTerm', label: 'T × ΔS' }
          ],
          title: 'What ΔG is made of',
          highlight: 0
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-08',
      concept: {
        title: 'What is Gibbs free energy?',
        paragraphs: [
          'Gibbs free energy change, ΔG, combines a reaction’s enthalpy change (ΔH, the heat released or absorbed) and its entropy change (ΔS, how much more or less disordered the system becomes) into a single number that predicts whether a process happens on its own at a given temperature. OpenStax’s Chemistry 2e, Section 16.4, gives the relationship as ΔG = ΔH − TΔS, with T the absolute (kelvin) temperature.',
          'The sign of ΔG is the whole point: a negative ΔG means the process is spontaneous — it proceeds in the forward direction without outside help, though not necessarily quickly. A positive ΔG means the reverse is true, the process is non-spontaneous as written, and a zero ΔG means the system sits exactly at equilibrium, perfectly balanced between the forward and reverse directions.',
          'Because ΔG depends on temperature through the TΔS term, a process can flip from non-spontaneous to spontaneous (or back) as temperature changes, as long as ΔH and ΔS have opposite effects — exactly what happens at a boiling point, melting point, or any other phase transition. Water vaporizing is endothermic (ΔH positive, heat must be put in) and increases disorder (ΔS positive, gas is far less ordered than liquid), so TΔS grows with temperature until it outweighs ΔH and vaporization becomes spontaneous — which is, physically, what a boiling point is.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of ΔG, ΔH, T, and ΔS; the fourth fills in automatically.',
        steps: [
          { name: 'Find ΔH and ΔS for the process', text: 'From tabulated standard thermodynamic values, a calorimetry measurement, or another calculation — both are properties of the specific reaction or phase change.' },
          { name: 'Enter the temperature in an absolute scale', text: 'T must be a positive, absolute temperature. Entering °C or °F is fine — the calculator converts it to kelvin automatically — but a temperature of 0 K or below has no physical meaning here.' },
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit; ΔH and ΔG read in J/mol or kJ/mol, ΔS in J/(mol·K), and T in K, °C, or °F.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read ΔG and its sign', text: 'A negative ΔG means the process is spontaneous at that temperature; a positive ΔG means it is not. The crossover temperature below shows where that sign would flip.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'ΔG = ΔH − TΔS rearranges to solve for any one of the four quantities, given the other three.',
        expression: 'ΔG = ΔH − TΔS\nΔH = ΔG + TΔS\nT = (ΔH − ΔG) ÷ ΔS\nΔS = (ΔH − ΔG) ÷ T',
        terms: [
          { symbol: 'ΔG', meaning: 'Gibbs free energy change. Negative means spontaneous; positive means non-spontaneous; zero means equilibrium.' },
          { symbol: 'ΔH', meaning: 'Enthalpy change — heat absorbed (positive, endothermic) or released (negative, exothermic) by the process.' },
          { symbol: 'T', meaning: 'Absolute temperature, which must be in kelvin (or converted from °C/°F) — it can only take positive values.' },
          { symbol: 'ΔS', meaning: 'Entropy change — how much the system’s disorder increases (positive) or decreases (negative).' }
        ],
        note: 'This uses one fixed ΔH and ΔS, as if neither changed with temperature — the standard simplifying assumption for a modest temperature range, the same one behind the "crossover temperature" bonus figure below.'
      },
      workedExample: {
        intro: 'Water vaporizes at 298 K with ΔH = 44.01 kJ/mol and ΔS = 118.8 J/(mol·K) (both standard values for the liquid-to-gas phase change). Is vaporization spontaneous at this temperature?',
        rows: [
          { label: 'Enthalpy change (ΔH)', value: '44.01 kJ/mol = 44,010 J/mol' },
          { label: 'Temperature (T)', value: '298 K' },
          { label: 'Entropy change (ΔS)', value: '118.8 J/(mol·K)' },
          { label: 'TΔS (298 × 118.8)', value: '35,402.4 J/mol ≈ 35.40 kJ/mol' },
          { label: 'ΔG = ΔH − TΔS (44,010 − 35,402.4)', value: '8,607.6 J/mol ≈ 8.6 kJ/mol' }
        ],
        result: 'ΔG ≈ +8.6 kJ/mol',
        explanation: 'ΔG comes out positive, so vaporizing water is not spontaneous at 298 K (25 °C) — matching everyday experience, since water left at room temperature does not spontaneously boil away. Dividing ΔH by ΔS gives the temperature where ΔG would reach exactly 0 (44,010 ÷ 118.8 ≈ 370.5 K, or about 97.3 °C) — close to water’s real 373.15 K (100 °C) boiling point, though not identical to it, since ΔH and ΔS both shift somewhat with temperature in reality.'
      },
      watchOut: [
        {
          title: 'Temperature must be absolute (kelvin), never °C or °F directly in the formula',
          body: 'ΔG = ΔH − TΔS only works with an absolute temperature scale, because T can only take positive values in this equation — the same requirement as the ideal gas law and combined gas law. The calculator converts any unit you type into kelvin before solving, but a hand calculation using 25 instead of 298 gives a badly wrong ΔG.'
        },
        {
          title: 'A negative ΔG means spontaneous, not necessarily fast',
          body: 'Spontaneity is a statement about which direction a process favors thermodynamically, with no information about speed — rusting iron has a negative ΔG but takes years, while some explosive reactions with a less negative ΔG happen in milliseconds. Reaction rate is a separate question from spontaneity (see the rate constant and Arrhenius equation calculators).'
        },
        {
          title: 'ΔH and ΔS are treated as constant with temperature here',
          body: 'In reality both shift somewhat as temperature changes, so the "crossover temperature" (where ΔG = 0) computed from room-temperature ΔH and ΔS values is only an approximation of where a real phase transition or reaction actually flips spontaneity — close for a modest temperature range, less reliable far from where ΔH and ΔS were measured.'
        },
        {
          title: 'ΔG = 0 at equilibrium, not at every temperature',
          body: 'A process only sits exactly at equilibrium at one specific temperature (for fixed ΔH and ΔS) — the crossover temperature this calculator shows as a bonus figure. Away from that temperature, ΔG is either clearly positive or clearly negative, not close to zero.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §16.4 "Free Energy" (ΔG = ΔH − TΔS, spontaneity, worked water-vaporization example)', url: 'https://openstax.org/books/chemistry-2e/pages/16-4-free-energy' }
      ]
    },
    inputs: [
      { id: 'enthalpy', label: 'Enthalpy change (J/mol)', type: 'number', placeholder: '44010', defaultValue: 44010, step: 1 },
      { id: 'temperature', label: 'Temperature (K)', type: 'number', placeholder: '298', defaultValue: 298, step: 0.01, min: 0 },
      { id: 'entropy', label: 'Entropy change (J/(mol·K))', type: 'number', placeholder: '118.8', defaultValue: 118.8, step: 0.1 }
    ],
    seo: {
      title: 'Gibbs Free Energy Calculator (ΔG = ΔH − TΔS)',
      description: 'Free Gibbs free energy calculator. Solve ΔG = ΔH − TΔS for ΔG, ΔH, T, or ΔS, with a worked example and the spontaneity convention explained.',
      faq: [
        { question: 'How do I calculate Gibbs free energy?', answer: 'ΔG = ΔH − TΔS, with T in kelvin. Vaporizing water at 298 K with ΔH = 44,010 J/mol and ΔS = 118.8 J/(mol·K) gives ΔG = 44,010 − (298 × 118.8) ≈ 8,608 J/mol.' },
        { question: 'What does a negative ΔG mean?', answer: 'The process is spontaneous — it proceeds in the forward direction on its own at that temperature, with no statement about how fast.' },
        { question: 'What does a positive ΔG mean?', answer: 'The process is non-spontaneous as written at that temperature; the reverse process is the spontaneous one instead.' },
        { question: 'What does ΔG = 0 mean?', answer: 'The system is at equilibrium — the forward and reverse processes are exactly balanced, with no net driving force either way.' },
        { question: 'Why does temperature matter so much for spontaneity?', answer: 'Because ΔG depends on temperature through the TΔS term while ΔH stays roughly fixed, a process with ΔH and ΔS of opposite-favoring signs can switch from non-spontaneous to spontaneous (or back) as temperature changes — exactly what happens at a melting or boiling point.' },
        { question: 'What temperature unit does this formula need?', answer: 'An absolute scale — kelvin. T can only be positive in this equation, so °C or °F must be converted to kelvin first; this calculator does that conversion automatically.' },
        { question: 'How do I find the temperature where a reaction becomes spontaneous?', answer: 'Solve T = (ΔH − ΔG) ÷ ΔS with ΔG set to 0, which gives the "crossover" temperature — shown automatically as a bonus figure, T = ΔH ÷ ΔS, under the main result.' }
      ]
    },
    compute(values) {
      return { gibbs: values.enthalpy - values.temperature * values.entropy };
    }
  },
  {
    id: 'density-of-solutions-calculator',
    category: 'chemistry',
    glyph: 'ρ',
    updatedAt: '2026-11-09',
    aliases: ['density of solution calculator', 'solution density calculator', 'specific gravity calculator', 'density and specific gravity of a solution', 'mass percent from density calculator'],
    related: ['density-calculator', 'mass-percent-calculator', 'molarity-calculator', 'dilution-calculator'],
    title: 'Density of a Solution Calculator',
    description: 'Find a solution’s density and specific gravity from the solute and solvent masses you combined and the solution’s actual measured volume — mixing is not perfectly volume-additive.',
    example: 'Dissolving 10.00 g of NaCl into 90.00 g of water gives a 100.00 g solution that measures 93.4 mL, for a density of 1.0707 g/mL — a specific gravity of about 1.073.',
    content: {
      lastReviewed: '2026-11-09',
      concept: {
        title: 'What is the density of a solution?',
        paragraphs: [
          'Density is the ratio of a sample’s mass to its volume, ρ = m ÷ V (OpenStax Chemistry 2e §1.4). For a pure substance that is a fixed property; for a solution, it depends on exactly what was dissolved and how much — a sports drink, seawater, and plain tap water all have slightly different densities because they are different mixtures, even though each one is mostly water.',
          'Specific gravity (also called relative density) is a solution’s density divided by the density of pure water at a reference temperature — a unitless ratio that says how much denser (or lighter) the solution is than water itself. A specific gravity of 1.07 means the solution is 7% denser than water; it is widely used in brewing, winemaking, battery-acid testing, and urinalysis precisely because it is easy to measure with a hydrometer and needs no units.',
          'The one detail that trips people up: dissolving a solute in a solvent almost never gives a final volume equal to the solvent’s original volume plus the solute’s own volume. Molecules pack differently once mixed — sometimes the solution is denser and more compact than a simple sum would predict, sometimes less so. That is exactly why this calculator asks for the solution’s actually measured final volume, not a volume you would get by adding up the ingredients’ separate volumes.'
        ]
      },
      howTo: {
        intro: 'Weigh what you dissolved, weigh what you dissolved it in, then measure the finished solution’s actual volume.',
        steps: [
          { name: 'Weigh the solute', text: 'The mass of whatever was dissolved (salt, sugar, any solid or liquid solute), in grams.' },
          { name: 'Weigh the solvent', text: 'The mass of the liquid it was dissolved into, before mixing, also in grams.' },
          { name: 'Measure the final solution’s volume', text: 'After mixing, read the actual volume from a graduated cylinder or volumetric flask — not a calculation, a real measurement, since mixing changes volume.' },
          { name: 'Read the density and specific gravity', text: 'Density (mass ÷ volume) and specific gravity (density ÷ water’s density) both appear immediately, along with the solute’s mass percent of the whole solution.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Density comes straight from the definition; specific gravity and mass percent are two more ratios built from the same three measurements.',
        expression: 'ρ = (m_solute + m_solvent) ÷ V_solution\nSG = ρ ÷ ρ_water\nmass % = m_solute ÷ (m_solute + m_solvent) × 100',
        terms: [
          { symbol: 'ρ', meaning: 'The solution’s density, in grams per milliliter (g/mL) or kilograms per cubic meter (kg/m³).' },
          { symbol: 'm_solute, m_solvent', meaning: 'The masses actually weighed out before mixing.' },
          { symbol: 'V_solution', meaning: 'The final solution’s measured volume — not the solvent’s original volume.' },
          { symbol: 'SG', meaning: 'Specific gravity: this density divided by pure water’s density (about 0.998 g/mL at 20°C, NIST Chemistry WebBook).' }
        ],
        note: 'There is no formula that predicts V_solution from the two masses alone — real mixtures are not perfectly volume-additive, which is the whole reason this calculator asks you to measure it rather than add up separate volumes.'
      },
      workedExample: {
        intro: 'Dissolving 10.00 g of table salt (NaCl) into 90.00 g of water gives a solution whose final volume measures 93.4 mL. What is its density, mass percent, and specific gravity?',
        rows: [
          { label: 'Total mass (10.00 + 90.00)', value: '100.00 g' },
          { label: 'Measured volume', value: '93.4 mL' },
          { label: 'Density (100.00 ÷ 93.4)', value: '1.0707 g/mL' },
          { label: 'Mass percent (10.00 ÷ 100.00 × 100)', value: '10.00%' },
          { label: 'Specific gravity (1.0707 ÷ 0.99821)', value: '1.073' }
        ],
        result: 'ρ ≈ 1.0707 g/mL · SG ≈ 1.073',
        explanation: 'The total mass (100.00 g) divided by the measured volume (93.4 mL) gives a density of 1.0707 g/mL — close to the CRC Handbook’s own published figure for a 10% w/w sodium chloride solution at 20°C. Dividing that by pure water’s own density (0.99821 g/mL at 20°C) shows the solution is about 7.3% denser than plain water.'
      },
      watchOut: [
        {
          title: 'Mixing is not volume-additive',
          body: 'Combining 90.0 mL of water with however much volume the solute itself would occupy almost never gives the real final volume. Always measure the finished solution directly; this calculator deliberately has no field for "solvent volume" plus "solute volume" added together.'
        },
        {
          title: 'Specific gravity needs a reference temperature',
          body: 'Water’s density changes slightly with temperature (about 0.998 g/mL at 20°C versus 1.000 g/mL at 4°C, its maximum), so a specific gravity is technically only exact at the temperature its reference density was measured at. The difference is small for everyday use but matters for precise lab work.'
        },
        {
          title: 'This is not the same question as molarity',
          body: 'Density tells you mass per volume of the whole solution; molarity tells you moles of solute per volume. Converting between them needs the solute’s molar mass too — see the molarity calculator.'
        },
        {
          title: 'A denser solution is not automatically more concentrated',
          body: 'Density depends on what is dissolved, not just how much. A small amount of a very dense solute can raise density more than a larger amount of a lighter one — mass percent and density do not always move in lockstep across different solutes.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §1.4 "Measurements" (density = mass ÷ volume)', url: 'https://openstax.org/books/chemistry-2e/pages/1-4-measurements' },
        { label: 'NIST Chemistry WebBook, Thermophysical Properties of Fluid Systems — water density at 20°C, 1 atm (0.99821 g/mL)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
        { label: 'CRC Handbook of Chemistry and Physics, aqueous NaCl density table — 10% w/w at 20°C is 1.0707 g/mL (CRC itself is not freely fetchable; confirmed via its EngineeringToolbox.com and Sigma-Aldrich reproductions, flagged here the same way run 5 flagged an IUPAC Gold Book page that also 403’d a direct fetch)', url: 'https://www.engineeringtoolbox.com/density-aqueous-solution-inorganic-chlorides-salt-concentration-d_1955.html' }
      ]
    },
    inputs: [
      { id: 'soluteMass', label: 'Solute mass (g)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.01, min: 0 },
      { id: 'solventMass', label: 'Solvent mass (g)', type: 'number', placeholder: '90', defaultValue: 90, step: 0.01, min: 0 },
      { id: 'volume', label: 'Measured solution volume (mL)', type: 'number', placeholder: '93.4', defaultValue: 93.4, step: 0.1, min: 0.001 }
    ],
    breakdown: {
      headline: 'density',
      headlineLabel: 'Density (g/mL)',
      outputs: [
        { id: 'density', label: 'Density (g/mL)', format: 'significant' },
        { id: 'massPercent', label: 'Mass percent of solute', format: 'percent' },
        { id: 'specificGravity', label: 'Specific gravity (vs. water at 20°C)', format: 'significant' }
      ],
      groups: [{ inputs: ['soluteMass', 'solventMass', 'volume'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'waterDensityForChart', label: 'Pure water (20°C)' },
          { from: 'density', label: 'This solution' }
        ],
        title: 'Denser or lighter than water?',
        highlight: 1
      },
      derive: (values) => ({ waterDensityForChart: 0.99821 })
    },
    seo: {
      title: 'Density of a Solution Calculator – Specific Gravity',
      description: 'Free solution density calculator. Find density, mass percent, and specific gravity from the solute and solvent masses and the measured solution volume.',
      faq: [
        { question: 'How do I calculate the density of a solution?', answer: 'Add the solute and solvent masses together, then divide by the solution’s actual measured volume: ρ = (m_solute + m_solvent) ÷ V. Mixing is not perfectly volume-additive, so the volume must be measured, not calculated.' },
        { question: 'What is specific gravity?', answer: 'A solution’s density divided by pure water’s density at a reference temperature (about 0.998 g/mL at 20°C) — a unitless number showing how much denser or lighter the solution is than water.' },
        { question: 'What is the density of 10% salt water?', answer: 'About 1.0707 g/mL at 20°C (CRC Handbook), meaning a solution that is 10% sodium chloride by mass is about 7.1% denser than plain water.' },
        { question: 'Why isn’t solution volume just solvent volume plus solute volume?', answer: 'Dissolved particles pack differently among the solvent’s own molecules than either substance does alone, so the mixture’s volume is almost never exactly the sum of the two separate volumes — sometimes smaller, sometimes larger, depending on the substances involved.' },
        { question: 'Is a higher density always a more concentrated solution?', answer: 'Not necessarily. Density depends on which solute is dissolved as well as how much — a small amount of a very dense solute can raise density more than a larger amount of a less dense one, so density and mass percent do not track every solute the same way.' },
        { question: 'How is this different from the density calculator?', answer: 'The general density calculator solves ρ = m ÷ V directly for any one of the three. This page is built around the specific lab workflow of combining a solute and solvent by mass and then measuring the result — and adds the mass percent and specific gravity a chemist actually wants from that workflow.' }
      ]
    },
    compute(values) {
      const totalMass = values.soluteMass + values.solventMass;
      const density = totalMass / values.volume;
      return {
        density,
        massPercent: totalMass === 0 ? NaN : (values.soluteMass / totalMass) * 100,
        specificGravity: density / 0.99821
      };
    }
  },
  {
    id: 'serial-dilution-calculator',
    category: 'chemistry',
    glyph: 'Cₙ',
    updatedAt: '2026-11-09',
    aliases: ['dilution series calculator', 'repeated dilution calculator', '1:10 serial dilution calculator', 'cfu dilution calculator', 'cumulative dilution factor calculator'],
    related: ['dilution-calculator', 'molarity-calculator', 'solution-concentration-calculator', 'mass-percent-calculator'],
    title: 'Serial Dilution Calculator',
    description: 'Find the concentration left after a series of repeated dilutions — each one cutting the concentration by the same factor — the technique behind microbiology plate counts and standard-curve preparation.',
    example: 'Four serial 1:10 dilutions in a row (an overall 1:10,000 dilution) cut a 5,000,000 CFU/mL culture down to 500 CFU/mL.',
    content: {
      lastReviewed: '2026-11-09',
      concept: {
        title: 'What is a serial dilution?',
        paragraphs: [
          'A serial dilution is a sequence of dilutions performed one after another, each one diluting what came out of the step before it by the same factor — rather than one single large dilution. OpenStax Microbiology describes the standard version directly: mixing 1.0 mL of a culture into 9.0 mL of sterile broth is "a dilution factor of 10, or 1:10," and withdrawing 1.0 mL from that tube into a fresh 9.0 mL of broth repeats the same 1:10 step again.',
          'Repeating a dilution step is how extremely concentrated samples — a dense bacterial culture, a concentrated stock solution, an undiluted standard for a calibration curve — get down into a range that is actually measurable. A single 1:10,000 dilution and four stacked 1:10 dilutions reach the exact same final concentration (since 10⁴ = 10,000), but pipetting four small, accurate 1:10 steps is far easier to do precisely than trying to measure one tiny fraction of a milliliter directly.',
          'This calculator is deliberately unit-agnostic: the "concentration" can be a molarity, a mass concentration, or a cell count such as CFU/mL (colony-forming units per milliliter) — the geometric math behind a serial dilution series is exactly the same no matter what is being counted.'
        ]
      },
      howTo: {
        intro: 'Enter the starting concentration, the dilution factor used at each step, and how many times that step was repeated.',
        steps: [
          { name: 'Enter the starting concentration', text: 'The concentration before any dilution — in whatever unit you are tracking (mol/L, mg/mL, CFU/mL, and so on).' },
          { name: 'Enter the dilution factor per step', text: 'How many times each step dilutes the previous one. A standard "1:10" dilution (1 part sample into 9 parts diluent, 10 total parts) is a factor of 10.' },
          { name: 'Enter the number of steps', text: 'How many times that same dilution was repeated in a row.' },
          { name: 'Read the final concentration', text: 'The concentration after every step, along with the overall (cumulative) dilution factor and what percent of the original concentration remains.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Each step divides by the same factor, so n repeated steps divide by that factor raised to the nth power.',
        expression: 'Cumulative factor = DF ⁿ\nC_final = C₀ ÷ DF ⁿ',
        terms: [
          { symbol: 'C₀', meaning: 'The starting concentration, before any dilution.' },
          { symbol: 'DF', meaning: 'The dilution factor used at each step (10 for a standard 1:10 dilution).' },
          { symbol: 'n', meaning: 'How many times that dilution step was repeated.' },
          { symbol: 'C_final', meaning: 'The concentration remaining after all n steps.' }
        ],
        note: 'This assumes every step uses the same dilution factor. A series that mixes different factors at different steps instead multiplies each step’s own factor together one at a time rather than raising one factor to a power.'
      },
      workedExample: {
        intro: 'OpenStax Microbiology’s own worked example: a lab counts an average of 50 colonies on a plate from a sample that went through four 1:10 dilutions in a row. What was the original concentration, and what does each step look like going forward?',
        rows: [
          { label: 'Starting concentration (worked backward from the plate count)', value: '5,000,000 CFU/mL' },
          { label: 'After dilution 1 (÷10)', value: '500,000 CFU/mL' },
          { label: 'After dilution 2 (÷10)', value: '50,000 CFU/mL' },
          { label: 'After dilution 3 (÷10)', value: '5,000 CFU/mL' },
          { label: 'After dilution 4 (÷10)', value: '500 CFU/mL' },
          { label: 'Cumulative dilution factor (10⁴)', value: '10,000 (a 1:10,000 dilution)' }
        ],
        result: 'C_final = 500 CFU/mL · cumulative factor = 10,000',
        explanation: 'Each 1:10 step divides the running concentration by 10, so after four steps the total division is 10⁴ = 10,000 — exactly OpenStax’s own figure (it runs the calculation the other direction, multiplying the 50 colonies it actually counted by 10 × 10,000 to reconstruct the original 5,000,000 CFU/mL). Only 1 ÷ 10,000, or 0.01%, of the original concentration remains in the final tube.'
      },
      watchOut: [
        {
          title: 'The dilution factor is the total parts, not the diluent’s parts alone',
          body: 'A standard "1:10" dilution mixes 1 part sample into 9 parts diluent — 10 total parts — so the dilution factor is 10, not 9. Mixing up "parts added" with "total parts" is a common source of an off-by-one error in the exponent.'
        },
        {
          title: 'Every step must use a fresh, well-mixed sample',
          body: 'Each step dilutes the previous tube, not the original sample — so any pipetting error in an early step carries forward and gets compounded by every later step, unlike a single one-step dilution where a mistake only affects that one result.'
        },
        {
          title: 'Only countable plates reconstruct an accurate CFU/mL',
          body: 'OpenStax Microbiology notes that reliable plate counts need 30–300 colonies per plate — too few (statistically unreliable) or too many (overcrowded, hard to count) both make the back-calculated original concentration less trustworthy, however precise the dilution math itself is.'
        },
        {
          title: 'This is a different calculator from a single dilution',
          body: 'For one single dilution step — mixing a stock solution down to one target concentration — see the dilution calculator (C₁V₁ = C₂V₂) instead. This page is specifically for a repeated chain of the same dilution.'
        }
      ],
      references: [
        { label: 'OpenStax, Microbiology, §9.1 "How Microbes Grow" (serial dilution procedure, the 1.0 mL into 9.0 mL 1:10 step, the 50-colonies-at-1:10,000 worked example, and the 30–300 countable-colony range)', url: 'https://openstax.org/books/microbiology/pages/9-1-how-microbes-grow' }
      ]
    },
    inputs: [
      { id: 'initialConcentration', label: 'Starting concentration (any consistent unit)', type: 'number', placeholder: '5000000', defaultValue: 5000000, step: 1, min: 0 },
      { id: 'dilutionFactor', label: 'Dilution factor per step (10 for a 1:10 dilution)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.1, min: 1.0001 },
      { id: 'steps', label: 'Number of dilution steps', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 1 }
    ],
    breakdown: {
      headline: 'finalConcentration',
      headlineLabel: 'Final concentration',
      outputs: [
        { id: 'finalConcentration', label: 'Final concentration', format: 'significant' },
        { id: 'cumulativeFactor', label: 'Cumulative (overall) dilution factor', format: 'significant' },
        { id: 'percentRemaining', label: 'Percent of original remaining', format: 'percent' }
      ],
      groups: [{ inputs: ['initialConcentration', 'dilutionFactor', 'steps'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'initialConcentration', label: 'Starting concentration' },
          { from: 'finalConcentration', label: 'Final concentration' }
        ],
        title: 'Before and after the dilution series',
        highlight: 1
      }
    },
    seo: {
      title: 'Serial Dilution Calculator – Dilution Series',
      description: 'Free serial dilution calculator. Find the concentration remaining after repeated dilutions, plus the overall dilution factor and percent of the original left.',
      faq: [
        { question: 'How do you calculate a serial dilution?', answer: 'Raise the per-step dilution factor to the power of the number of steps to get the cumulative factor, then divide the starting concentration by that cumulative factor: C_final = C₀ ÷ DFⁿ.' },
        { question: 'What is a 1:10 serial dilution?', answer: 'Mixing 1 part of a sample into 9 parts of diluent (10 total parts), so each step divides the concentration by 10. Repeating that step n times divides the original concentration by 10ⁿ overall.' },
        { question: 'What is the dilution factor of four 1:10 dilutions?', answer: '10,000 (10⁴) — each of the four steps multiplies the previous overall factor by another 10.' },
        { question: 'How do I calculate CFU/mL from a diluted plate count?', answer: 'Multiply the colonies counted by the reciprocal of the volume plated and by the dilution factor of the plate you counted — OpenStax Microbiology’s own example counts 50 colonies from a 1:10,000 dilution with 0.1 mL plated, giving 50 × 10 × 10,000 = 5,000,000 CFU/mL.' },
        { question: 'Why use several small dilution steps instead of one big one?', answer: 'Each individual step stays within a pipette’s accurate, easily measured range (mixing 1 mL into 9 mL, say), which is far more precise in practice than trying to measure one tiny fraction of a milliliter directly for a single huge dilution.' },
        { question: 'What if different steps use different dilution factors?', answer: 'This calculator assumes every step uses the same factor. A mixed series instead multiplies each step’s own factor together one at a time (DF₁ × DF₂ × DF₃...) rather than raising a single factor to a power.' }
      ]
    },
    compute(values) {
      const cumulativeFactor = values.dilutionFactor ** values.steps;
      const finalConcentration = values.initialConcentration / cumulativeFactor;
      return {
        finalConcentration,
        cumulativeFactor,
        percentRemaining: cumulativeFactor === 0 ? NaN : 100 / cumulativeFactor
      };
    }
  },
  {
    id: 'electron-configuration-calculator',
    category: 'chemistry',
    glyph: 'e⁻',
    updatedAt: '2026-11-09',
    aliases: ['electron configuration calculator', 'electron configuration finder', 'ground state electron configuration calculator', 'noble gas configuration calculator', 'periodic table electron configuration'],
    related: ['molar-mass-calculator', 'empirical-formula-calculator', 'mole-fraction-calculator', 'ph-poh-calculator'],
    title: 'Electron Configuration Calculator',
    description: 'Look up any element’s ground-state electron configuration (elements 1-108), in both full and noble-gas-shorthand form, straight from NIST’s own measured data.',
    example: 'Chromium (Z = 24) is [Ar]3d⁵4s¹ — not the [Ar]3d⁴4s² the simple filling order would predict, one of about 20 known exceptions.',
    content: {
      lastReviewed: '2026-11-09',
      concept: {
        title: 'What is an electron configuration?',
        paragraphs: [
          'An atom’s electron configuration lists how its electrons are distributed among shells and subshells (1s, 2s, 2p, and so on) in its lowest-energy, most stable arrangement — the "ground state." The Aufbau ("building-up") principle says electrons fill the lowest-energy subshells first, which correctly predicts the configuration of most elements straight from the periodic table.',
          'That simple filling order is not perfectly exact, though. For roughly twenty elements — chromium and copper being the two taught in almost every general chemistry course — the real, experimentally measured ground state differs from what the naive filling order predicts, because a half-filled or completely filled subshell (like chromium’s 3d⁵) is slightly more stable than the "expected" arrangement. This calculator reports the actual measured configuration for every element from hydrogen (1) through hassium (108), taken directly from NIST’s own Atomic Spectra Database rather than generated from the filling-order rule alone — so the Cr/Cu-style exceptions are automatically correct, not a special case to detect.',
          'Elements 109 and up are left off this page entirely: they are so short-lived that NIST’s database has no measured ground-state configuration for them at all, only for element 108 (hassium) and below.'
        ]
      },
      howTo: {
        intro: 'Pick an element by its atomic number, symbol, or name.',
        steps: [
          { name: 'Choose the element', text: 'Select it from the list, by atomic number, symbol, or name — covers hydrogen (1) through hassium (108).' },
          { name: 'Read the full configuration', text: 'Every subshell, written out in full, from 1s up.' },
          { name: 'Read the noble-gas shorthand', text: 'The same configuration, written as the nearest preceding noble gas in brackets plus whatever comes after it — the shorter form most textbooks actually use.' },
          { name: 'Check the core and outer electron counts', text: 'How many electrons sit in that noble-gas core versus outside it, shown as a number and in the donut chart below.' }
        ],
        outro: 'Everything here is a lookup, calculated in your browser. Nothing is sent or stored.'
      },
      formula: {
        intro: 'There is no formula to solve here — this is a lookup table of measured ground states, not a value you calculate from an equation.',
        expression: 'Configuration = [noble-gas core] + remaining subshells, in order of increasing n, then s < p < d < f',
        terms: [
          { symbol: 'n', meaning: 'Principal quantum number — the shell number (1, 2, 3...).' },
          { symbol: 's, p, d, f', meaning: 'Subshell types, each holding a fixed maximum: 2 electrons (s), 6 (p), 10 (d), or 14 (f).' },
          { symbol: '[noble gas]', meaning: 'A shorthand for every subshell up through the nearest earlier noble gas (He, Ne, Ar, Kr, Xe, or Rn) — writing out helium’s 1s² ten times over would be tedious.' }
        ],
        note: 'Subshells are written in order of increasing n, then s before p before d before f within the same n — which is why chromium’s configuration is written "3d⁵4s¹" with 3d first, confirmed directly against NIST’s own printed data, even though the 4s subshell happens to fill before 3d for most elements in that row. A lanthanide or actinide’s f subshell is threaded in at the row where it actually fills (after that period’s own s and p subshells), not forced to the front by its lower n — see the watch-out below.'
      },
      workedExample: {
        intro: 'What is chromium’s (Z = 24) ground-state electron configuration, and why is it an exception?',
        rows: [
          { label: 'Naive filling order would predict', value: '[Ar]3d⁴4s² (4 + 2 = 6 outer electrons)' },
          { label: 'Actual measured configuration (NIST)', value: '[Ar]3d⁵4s¹ (5 + 1 = 6 outer electrons)' },
          { label: 'Full configuration', value: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁵ 4s¹' },
          { label: 'Core electrons (argon’s own 18)', value: '18' },
          { label: 'Outer electrons (24 − 18)', value: '6' }
        ],
        result: '[Ar]3d⁵4s¹',
        explanation: 'Both the naive prediction and the real configuration put 6 electrons outside the argon core — the only question is how those 6 are split between 3d and 4s. A half-filled 3d subshell (5 electrons, one in each of the five 3d orbitals, all spins aligned) turns out to be slightly more stable than a 3d⁴4s² arrangement, so one electron moves from 4s into 3d. Copper (Z = 29) is the same story one row later: [Ar]3d¹⁰4s¹ instead of the naively predicted [Ar]3d⁹4s², this time because a completely filled 3d¹⁰ is the more stable option.'
      },
      watchOut: [
        {
          title: 'Textbooks don’t all write the exceptions in the same order',
          body: 'This page always writes subshells by increasing principal quantum number (3d before 4s), matching NIST’s own printed data exactly. Some general-chemistry textbooks instead write transition-metal configurations in the order electrons were historically described as filling (4s before 3d), specifically to highlight which electron moved for an exception like chromium. Both orderings name the exact same configuration — only the printed order differs.'
        },
        {
          title: 'About twenty elements are genuine exceptions, not just Cr and Cu',
          body: 'Niobium, molybdenum, ruthenium, rhodium, palladium, and silver are every bit as irregular as chromium and copper (several of them, like palladium, do not even have a single 5s electron). Lanthanum, cerium, gadolinium, platinum, gold, and several actinides (actinium, thorium, protactinium, uranium, neptunium, curium) are exceptions too — this calculator reports the real value for every one of them automatically.'
        },
        {
          title: '"Valence electrons" gets complicated past the s- and p-blocks',
          body: 'For a main-group element, the outer-shell electron count shown here is the same thing chemists usually mean by "valence electrons." For a transition metal, chemists sometimes also count outer d electrons as valence electrons for bonding purposes and sometimes don’t, depending on context — so this calculator reports the unambiguous "electrons outside the noble-gas core" figure rather than taking a side on that convention.'
        },
        {
          title: 'Elements 109 and up are out of scope',
          body: 'NIST’s Atomic Spectra Database returns no data for elements past hassium (108) — they decay far too quickly to have ever had their ground-state configuration directly measured, so this calculator stops there rather than guessing.'
        }
      ],
      references: [
        { label: 'NIST Atomic Spectra Database, Ionization Energies tool — ground-configuration column for every element, fetched directly for hydrogen through hassium (elements 109+ returned "No data are available")', url: 'https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html' },
        { label: 'OpenStax, Chemistry 2e, §6.4 "Electronic Structure of Atoms (Electron Configurations)" (the Aufbau principle and the Cr/Cu exceptions)', url: 'https://openstax.org/books/chemistry-2e/pages/6-4-electronic-structure-of-atoms-electron-configurations' }
      ]
    },
    inputs: [{ id: 'atomicNumber', label: 'Element', type: 'number', placeholder: '24', defaultValue: 24, step: 1, min: 1, options: ELEMENT_CONFIG_OPTIONS }],
    breakdown: {
      headline: 'shorthandIndex',
      headlineLabel: 'Ground-state configuration (shorthand)',
      outputs: [
        { id: 'shorthandIndex', label: 'Ground-state configuration (shorthand)', labels: SHORTHAND_LABELS },
        { id: 'fullConfigIndex', label: 'Full configuration', labels: FULL_CONFIG_LABELS },
        { id: 'coreElectrons', label: 'Core electrons (noble-gas shorthand)', format: 'integer' },
        { id: 'outerElectrons', label: 'Electrons outside the core', format: 'integer' }
      ],
      groups: [{ inputs: ['atomicNumber'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'coreElectrons', label: 'Core electrons' },
          { from: 'outerElectrons', label: 'Outside the core' }
        ],
        center: 'atomicNumber',
        centerSub: 'total electrons'
      }
    },
    seo: {
      title: 'Electron Configuration Calculator',
      description: 'Free electron configuration calculator. Look up any element’s ground-state electron configuration (1-108), full and noble-gas shorthand, from NIST’s own data.',
      faq: [
        { question: 'What is the electron configuration of chromium?', answer: '[Ar]3d⁵4s¹ — not [Ar]3d⁴4s², which the simple Aufbau filling order would predict. A half-filled 3d⁵ subshell is slightly more stable, so one electron shifts out of 4s.' },
        { question: 'What is the electron configuration of copper?', answer: '[Ar]3d¹⁰4s¹ — a completely filled 3d¹⁰, one electron short of the naively predicted [Ar]3d⁹4s², for the same stability reason as chromium.' },
        { question: 'Is 3d written before or after 4s?', answer: 'Before, in this calculator and in NIST’s own data — subshells are ordered by increasing principal quantum number (3, then 4), not by which one happens to fill first. Some textbooks instead write 4s before 3d to emphasize the fill order; both describe the same configuration.' },
        { question: 'Why does palladium have no 5s electrons?', answer: 'Its real ground state is [Kr]4d¹⁰, not the naively predicted [Kr]4d⁸5s². A completely filled 4d¹⁰ subshell is more stable than keeping two electrons in 5s — the most extreme of the d-block exceptions.' },
        { question: 'How many electron configuration exceptions are there?', answer: 'About twenty among elements 1-108, including chromium, copper, niobium, molybdenum, ruthenium, rhodium, palladium, silver, lanthanum, cerium, gadolinium, platinum, gold, actinium, thorium, protactinium, uranium, neptunium, and curium.' },
        { question: 'Why does this calculator stop at element 108?', answer: 'NIST’s Atomic Spectra Database has no measured ground-state configuration for elements 109 and up — they are too short-lived and radioactive to have ever had one directly measured.' }
      ]
    },
    compute(values) {
      const element = findElementConfig(values.atomicNumber);
      if (!element) return { shorthandIndex: NaN, fullConfigIndex: NaN, coreElectrons: NaN, outerElectrons: NaN };
      return {
        shorthandIndex: element.z,
        fullConfigIndex: element.z,
        coreElectrons: element.coreElectrons,
        outerElectrons: element.outerElectrons
      };
    }
  },
  {
    id: 'buffer-capacity-calculator',
    category: 'chemistry',
    glyph: 'β',
    updatedAt: '2026-11-09',
    aliases: ['buffer capacity calculator', 'buffer value calculator', 'van slyke equation calculator', 'buffer index calculator', 'how strong is a buffer calculator'],
    related: ['pka-henderson-hasselbalch-calculator', 'ph-poh-calculator', 'titration-calculator', 'molarity-calculator'],
    title: 'Buffer Capacity Calculator',
    description: 'Find how strongly a buffer resists a pH change — its buffer capacity (β) — from the buffer’s total concentration, its pKa, and the pH it is held at.',
    example: 'A 0.50 mol/L acetic acid/acetate buffer (pKa 4.76) held at pH 4.94 has a buffer capacity of about 0.276 mol/(L·pH unit) — about 96% of the maximum capacity that concentration can reach.',
    content: {
      lastReviewed: '2026-11-09',
      concept: {
        title: 'What is buffer capacity?',
        paragraphs: [
          'A buffer resists changing pH when a small amount of acid or base is added to it, but "resists" is not all-or-nothing — some buffers push back harder than others. Buffer capacity (symbol β, sometimes called buffer value or buffer index) is the number that quantifies exactly how hard: how many moles of strong acid or base per liter it takes to shift the pH by one unit, at the pH the buffer currently sits at.',
          'Biochemist Donald D. Van Slyke gave this idea its standard mathematical form in 1922, showing that buffer capacity depends on two things: how much total buffer is present (the combined concentration of the weak acid and its conjugate base), and how close the current pH sits to the buffer’s own pKa. The same total concentration of buffer gives dramatically different resistance to pH change depending on where in its range it is being used.',
          'The practical consequence is the reason every buffer recipe says to pick an acid whose pKa is close to the target pH: capacity peaks exactly at pH = pKa and falls off on either side, so a buffer prepared far from its own pKa gives up most of its resistance to pH change even if the total concentration is high.'
        ]
      },
      howTo: {
        intro: 'Enter the buffer’s total concentration, the weak acid’s pKa, and the pH the buffer is held at.',
        steps: [
          { name: 'Enter the total buffer concentration', text: 'The combined concentration of the weak acid and its conjugate base together (not just one of them).' },
          { name: 'Enter the weak acid’s pKa', text: 'A fixed property of the specific acid used — acetic acid is about 4.76, for example.' },
          { name: 'Enter the pH the buffer is held at', text: 'The actual pH of the working buffer solution, which does not have to equal the pKa.' },
          { name: 'Read the buffer capacity', text: 'β appears immediately, alongside the maximum capacity that same concentration could reach (at pH = pKa exactly) and what percent of that maximum the current pH is actually achieving.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The Van Slyke equation gives buffer capacity directly from the total concentration, the acid dissociation constant, and the hydrogen ion concentration.',
        expression: 'β = 2.303 × C × (Ka × [H⁺]) ÷ (Ka + [H⁺])²\nβ_max = 2.303 × C ÷ 4  (at pH = pKa)',
        terms: [
          { symbol: 'β', meaning: 'Buffer capacity, in moles per liter per pH unit — how much strong acid or base it takes to shift the pH by 1.' },
          { symbol: 'C', meaning: 'The total buffer concentration, [HA] + [A⁻] together.' },
          { symbol: 'Ka', meaning: 'The weak acid’s dissociation constant, 10^(−pKa).' },
          { symbol: '[H⁺]', meaning: 'The hydrogen ion concentration at the working pH, 10^(−pH).' },
          { symbol: '2.303', meaning: 'ln(10) rounded to four figures — it appears because pH is a base-10 logarithm while the underlying calculus is done in natural log.' }
        ],
        note: 'This is the simplified, commonly quoted form of the Van Slyke equation, which drops two extra terms (for [H⁺] and [OH⁻] themselves) that only matter at very low or very high pH — accurate for ordinary buffers held within a couple of pH units of neutral-to-mild-acid/base territory, which covers the great majority of real lab and biological buffers.'
      },
      workedExample: {
        intro: 'An acetic acid buffer (pKa 4.76) is made with 0.20 mol/L acetic acid and 0.30 mol/L acetate — the exact same buffer worked through on the pKa calculator’s own page, where it comes out to pH 4.94. What is its buffer capacity?',
        rows: [
          { label: 'Total concentration (0.20 + 0.30)', value: '0.50 mol/L' },
          { label: 'pKa', value: '4.76' },
          { label: 'pH', value: '4.94' },
          { label: 'Ka = 10⁻⁴·⁷⁶', value: '1.738 × 10⁻⁵' },
          { label: '[H⁺] = 10⁻⁴·⁹⁴', value: '1.148 × 10⁻⁵' },
          { label: 'β = 2.303 × 0.50 × (Ka×[H⁺]) ÷ (Ka+[H⁺])²', value: '≈ 0.276 mol/(L·pH)' },
          { label: 'β_max = 2.303 × 0.50 ÷ 4 (at pH = pKa)', value: '≈ 0.288 mol/(L·pH)' }
        ],
        result: 'β ≈ 0.276 mol/(L·pH) · about 95.8% of maximum',
        explanation: 'Because this buffer’s working pH (4.94) sits very close to its own pKa (4.76), it is operating near its strongest point — about 95.8% of the absolute maximum capacity that 0.50 mol/L of total buffer could ever reach. Moving the pH another full unit away from the pKa would drop that percentage sharply, which is exactly why buffer recipes pick an acid whose pKa is close to the target pH.'
      },
      watchOut: [
        {
          title: 'Buffer capacity depends on both concentration and position, not either alone',
          body: 'Doubling the total concentration doubles β at any given pH, but moving the pH away from the pKa can easily cost far more capacity than concentration gains back — the two effects are independent, and a dilute buffer held exactly at its pKa can out-perform a concentrated one held a full pH unit away.'
        },
        {
          title: 'This is the instantaneous capacity at one specific pH, not a range',
          body: 'β is a derivative — the resistance to change right at the pH entered, not an average over some pH "buffer range." The commonly cited ±1 pH unit around pKa rule of thumb is a related but separate convention about where a buffer is still considered useful at all, not this number.'
        },
        {
          title: 'The simplified formula assumes a near-neutral pH',
          body: 'Very strong acid or very strong base solutions have their own large intrinsic buffer capacity from [H⁺] or [OH⁻] directly, which the simplified Van Slyke formula used here leaves out. It is accurate for ordinary weak-acid/weak-base buffers, not for a solution that is already strongly acidic or strongly basic on its own.'
        }
      ],
      references: [
        { label: 'Van Slyke, D.D. (1922), "On the Measurement of Buffer Values...", Journal of Biological Chemistry 52, 525-570 (the original buffer-capacity equation; a direct fetch of jbc.org returned HTTP 403, so this formula was independently re-derived from the acid-dissociation and mass-balance equations rather than copied from the paper itself — see the step file for the derivation)', url: 'https://www.jbc.org/article/S0021-9258(18)85843-5/abstract' },
        { label: 'OpenStax, Chemistry 2e, §14.7 "Buffers" (buffer composition and the role of pKa)', url: 'https://openstax.org/books/chemistry-2e/pages/14-7-buffers' }
      ]
    },
    inputs: [
      { id: 'totalConcentration', label: 'Total buffer concentration', type: 'number', dimension: 'concentration', unit: 'mol/L', placeholder: '0.5', defaultValue: 0.5, step: 0.01, min: 0 },
      { id: 'pKa', label: 'Weak acid pKa', type: 'number', placeholder: '4.76', defaultValue: 4.76, step: 0.01 },
      { id: 'pH', label: 'Buffer pH', type: 'number', placeholder: '4.94', defaultValue: 4.94, step: 0.01 }
    ],
    breakdown: {
      headline: 'bufferCapacity',
      headlineLabel: 'Buffer capacity, β (mol/(L·pH))',
      outputs: [
        { id: 'bufferCapacity', label: 'Buffer capacity, β (mol/(L·pH))', format: 'significant' },
        { id: 'maxCapacity', label: 'Maximum capacity at this concentration (mol/(L·pH))', format: 'significant' },
        { id: 'percentOfMax', label: 'Percent of maximum capacity', format: 'percent' }
      ],
      groups: [{ inputs: ['totalConcentration', 'pKa', 'pH'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'maxCapacity', label: 'Maximum possible (at pH = pKa)' },
          { from: 'bufferCapacity', label: 'At this pH' }
        ],
        title: 'How close to maximum buffering strength?',
        highlight: 1
      }
    },
    seo: {
      title: 'Buffer Capacity Calculator (Van Slyke Equation)',
      description: 'Free buffer capacity calculator. Find β from total buffer concentration, pKa, and pH using the Van Slyke equation, plus the maximum capacity possible.',
      faq: [
        { question: 'How do I calculate buffer capacity?', answer: 'β = 2.303 × C × (Ka × [H⁺]) ÷ (Ka + [H⁺])², using the buffer’s total concentration C, its acid dissociation constant Ka (10^−pKa), and the hydrogen ion concentration at the working pH (10^−pH).' },
        { question: 'What is the maximum possible buffer capacity?', answer: 'β peaks at pH = pKa exactly, where the formula simplifies to β_max = 2.303 × C ÷ 4 — the highest resistance to pH change that a given total concentration can ever provide.' },
        { question: 'Why does buffer capacity depend on pH if the concentration stays the same?', answer: 'Because the ratio of weak acid to conjugate base shifts as pH moves away from pKa, and that ratio — not just the total amount present — is what determines how effectively added acid or base gets absorbed.' },
        { question: 'Why pick a buffer whose pKa is close to the target pH?', answer: 'Buffer capacity is highest exactly at pH = pKa and falls off on either side, so choosing an acid whose pKa sits near the pH you need keeps the buffer operating near its strongest point instead of a weaker one far from the peak.' },
        { question: 'What units does buffer capacity have?', answer: 'Moles per liter per pH unit, mol/(L·pH) — how many moles of strong acid or base, per liter of buffer, it takes to shift the pH by exactly one unit at that point.' },
        { question: 'Is a higher buffer capacity always better?', answer: 'For resisting pH change, yes — but a very high capacity also needs a correspondingly large total concentration of buffer chemicals, which may not be practical or desirable for every application (cost, ionic strength, or biological compatibility can all matter too).' }
      ]
    },
    compute(values) {
      const Ka = 10 ** -values.pKa;
      const H = 10 ** -values.pH;
      const bufferCapacity = 2.303 * values.totalConcentration * ((Ka * H) / (Ka + H) ** 2);
      const maxCapacity = (2.303 * values.totalConcentration) / 4;
      return {
        bufferCapacity,
        maxCapacity,
        percentOfMax: maxCapacity === 0 ? NaN : (bufferCapacity / maxCapacity) * 100
      };
    }
  },
  {
    id: 'beer-lambert-law-calculator',
    category: 'chemistry',
    glyph: 'A',
    updatedAt: '2026-11-09',
    aliases: ['beer-lambert law calculator', "beer's law calculator", 'absorbance calculator', 'molar absorptivity calculator', 'spectrophotometry calculator'],
    related: ['molarity-calculator', 'molar-mass-calculator', 'solution-concentration-calculator', 'dilution-calculator'],
    title: 'Beer-Lambert Law Calculator (A = εlc)',
    description: 'Solve the Beer-Lambert law, A = εlc, for absorbance, molar absorptivity, path length, or concentration — the equation behind every spectrophotometer reading.',
    example: 'A solution with a molar absorptivity of 13,000 L/(mol·cm), a 1.00 cm path length, and a concentration of 5.00 × 10⁻⁵ mol/L has an absorbance of 0.650.',
    solver: {
      defaultTarget: 'absorbance',
      variables: [
        { id: 'absorbance', label: 'Absorbance', symbol: 'A', dimension: 'absorbance', defaultValue: 0.65, defaultUnit: 'AU' },
        { id: 'molarAbsorptivity', label: 'Molar absorptivity', symbol: 'ε', dimension: 'molarAbsorptivity', defaultValue: 13000, defaultUnit: 'L/molcm' },
        { id: 'pathLength', label: 'Path length', symbol: 'l', dimension: 'length', defaultValue: 1, defaultUnit: 'cm' },
        { id: 'concentration', label: 'Concentration', symbol: 'c', dimension: 'concentration', defaultValue: 0.05, defaultUnit: 'mmol/L' }
      ],
      solve: {
        absorbance: ({ molarAbsorptivity, pathLength, concentration }) => molarAbsorptivity * pathLength * concentration,
        molarAbsorptivity: ({ absorbance, pathLength, concentration }) =>
          pathLength * concentration === 0 ? NaN : absorbance / (pathLength * concentration),
        pathLength: ({ absorbance, molarAbsorptivity, concentration }) =>
          molarAbsorptivity * concentration === 0 ? NaN : absorbance / (molarAbsorptivity * concentration),
        concentration: ({ absorbance, molarAbsorptivity, pathLength }) =>
          molarAbsorptivity * pathLength === 0 ? NaN : absorbance / (molarAbsorptivity * pathLength)
      },
      outputs: [{ id: 'transmittancePercent', label: 'Transmittance (%T)', dimension: 'percent', compute: (si) => 100 * 10 ** -si.absorbance }]
    },
    content: {
      lastReviewed: '2026-11-09',
      concept: {
        title: 'What is the Beer-Lambert law?',
        paragraphs: [
          'The Beer-Lambert law (often just "Beer\'s law") relates how much light a solution absorbs to how concentrated it is. The IUPAC Gold Book states it directly: absorbance is proportional to both the path length light travels through the sample and the sample\'s concentration, A = εlc. It is the equation that makes a spectrophotometer — a near-universal lab instrument — actually useful for measuring concentration, not just color.',
          'Absorbance (A) itself is a logarithmic ratio of how much light went in versus how much came out the other side, A = log₁₀(P₀ ÷ P). A higher absorbance means less light got through. Molar absorptivity (ε, also called the molar extinction coefficient) is a property of the specific substance and wavelength being measured — how strongly it absorbs light, independent of how much of it is present or how far the light travels through it.',
          'Because A = εlc is a straightforward multiplication of three quantities, it rearranges just as easily to solve for any one of them: measure absorbance in a known cuvette (fixed path length) with a known molar absorptivity, and the concentration drops straight out — the basis of every colorimetric and spectrophotometric concentration assay.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of absorbance, molar absorptivity, path length, and concentration; the fourth fills in automatically.',
        steps: [
          { name: 'Enter the values you know', text: 'Most often that is a measured absorbance, a known or looked-up molar absorptivity, and the cuvette’s path length — leaving concentration as the one being solved for.' },
          { name: 'Switch which one is calculated', text: 'Type into any other field instead, and whichever value you have left untouched the longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching path length to mm, or molar absorptivity to m²/mol, converts the number already there instead of changing the underlying value.' },
          { name: 'Read the result, and the transmittance', text: 'The solved value appears in your chosen unit, with the percent transmittance (%T) — how much light actually got through — shown as a bonus figure underneath.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'A = εlc rearranges three more ways, one for each quantity you might be solving for.',
        expression: 'A = ε × l × c\nε = A ÷ (l × c)\nl = A ÷ (ε × c)\nc = A ÷ (ε × l)',
        terms: [
          { symbol: 'A', meaning: 'Absorbance — unitless, A = log₁₀(P₀ ÷ P), the ratio of light intensity in to light intensity out.' },
          { symbol: 'ε', meaning: 'Molar absorptivity (molar extinction coefficient), conventionally in L mol⁻¹ cm⁻¹ (M⁻¹cm⁻¹); the IUPAC SI unit is m² mol⁻¹, equal to 0.1 L mol⁻¹ cm⁻¹.' },
          { symbol: 'l', meaning: 'Path length — the distance light travels through the sample, almost always 1.00 cm for a standard cuvette.' },
          { symbol: 'c', meaning: 'Concentration, typically molarity (mol/L).' }
        ],
        note: 'The law holds only for dilute solutions of a single absorbing species at one wavelength; at high concentration, real solutions start to deviate from this simple straight-line relationship (template §3’s "don’t overgeneralize" warning applies here too — this page covers the ideal, dilute-solution case the formula actually describes).'
      },
      workedExample: {
        intro: 'A solution has a molar absorptivity of 13,000 L/(mol·cm) at its measured wavelength, sits in a standard 1.00 cm cuvette, and has a concentration of 5.00 × 10⁻⁵ mol/L. What is its absorbance, and what percent of the light gets through?',
        rows: [
          { label: 'Molar absorptivity (ε)', value: '13,000 L/(mol·cm)' },
          { label: 'Path length (l)', value: '1.00 cm' },
          { label: 'Concentration (c)', value: '5.00 × 10⁻⁵ mol/L' },
          { label: 'Absorbance (A = 13,000 × 1.00 × 0.00005)', value: '0.650' },
          { label: 'Transmittance (%T = 10⁻⁰·⁶⁵⁰ × 100)', value: '≈ 22.39%' }
        ],
        result: 'A = 0.650 · %T ≈ 22.39%',
        explanation: 'Multiplying the three quantities together gives 13,000 × 1.00 × 0.00005 = 0.650. Converting that to transmittance, 10⁻⁰·⁶⁵⁰ × 100 ≈ 22.39%, meaning about 22.4% of the light that entered the sample made it through to the detector — the rest was absorbed. Given any three of the four quantities, the same equation solves for whichever one is missing.'
      },
      watchOut: [
        {
          title: 'Molar absorptivity is specific to one substance at one wavelength',
          body: 'ε is not a universal constant — it is a property of the particular absorbing species, measured at a particular wavelength (usually the wavelength of maximum absorbance, λmax). Using a substance’s ε from one wavelength to analyze data taken at a different wavelength gives a meaningless answer.'
        },
        {
          title: 'Watch which unit convention a published ε is given in',
          body: 'Chemists almost always report molar absorptivity in L mol⁻¹ cm⁻¹ (equivalently M⁻¹cm⁻¹); the SI-coherent unit is m² mol⁻¹, equal to one-tenth of that. Mixing the two without converting gives an answer 10 times too large or too small.'
        },
        {
          title: 'The law breaks down at high concentration',
          body: 'Beer-Lambert is a good approximation only in dilute solution. At higher concentrations, interactions between absorbing molecules and stray-light effects in real instruments both cause absorbance to deviate from a straight line against concentration — real calibration curves are checked for linearity, not assumed.'
        },
        {
          title: 'Absorbance and transmittance move in opposite directions',
          body: 'A higher absorbance means a lower percent transmittance, and the relationship is logarithmic, not linear — doubling the concentration does not halve the transmittance, it multiplies absorbance (not transmittance) by a bit more than double, once path length and ε are held fixed.'
        }
      ],
      references: [
        { label: 'IUPAC Gold Book, "Beer-Lambert law" (B00626) — A = εlc, SI unit of ε stated as m² mol⁻¹ (goldbook.iupac.org returned HTTP 403 to a direct fetch, the same outcome run 5 hit on a different Gold Book page; confirmed via a search-engine-indexed snippet of the page instead, flagged here rather than treated as fully fetch-verified)', url: 'https://goldbook.iupac.org/terms/view/B00626' }
      ]
    },
    inputs: [
      { id: 'molarAbsorptivity', label: 'Molar absorptivity ε (L/(mol·cm))', type: 'number', placeholder: '13000', defaultValue: 13000, step: 1, min: 0 },
      { id: 'pathLength', label: 'Path length (cm)', type: 'number', placeholder: '1', defaultValue: 1, step: 0.01, min: 0 },
      { id: 'concentration', label: 'Concentration (mol/L)', type: 'number', placeholder: '0.00005', defaultValue: 0.00005, step: 0.000001, min: 0 }
    ],
    seo: {
      title: 'Beer-Lambert Law Calculator (A = εlc)',
      description: 'Free Beer-Lambert law calculator. Solve A = εlc for absorbance, molar absorptivity, path length, or concentration, with transmittance shown too.',
      faq: [
        { question: 'What is the Beer-Lambert law formula?', answer: 'A = εlc, where A is absorbance, ε is the molar absorptivity (molar extinction coefficient), l is the path length light travels through the sample, and c is the concentration.' },
        { question: 'How do I calculate concentration from absorbance?', answer: 'c = A ÷ (ε × l) — divide the measured absorbance by the molar absorptivity and the path length multiplied together.' },
        { question: 'What are the units of molar absorptivity?', answer: 'Conventionally L mol⁻¹ cm⁻¹ (written M⁻¹cm⁻¹). The SI-coherent unit is m² mol⁻¹, equal to exactly one-tenth of that (1 L mol⁻¹ cm⁻¹ = 0.1 m² mol⁻¹).' },
        { question: 'What is the relationship between absorbance and transmittance?', answer: 'A = log₁₀(P₀ ÷ P) and %T = 10⁻ᴬ × 100 — absorbance and percent transmittance describe the same light loss, just on a logarithmic versus linear scale, so they always move in opposite directions.' },
        { question: 'What is a standard cuvette path length?', answer: '1.00 cm, for almost every standard spectrophotometer cuvette — which is why molar absorptivity values are often quoted assuming that path length, even though the formula itself works for any path length.' },
        { question: 'Does the Beer-Lambert law work at any concentration?', answer: 'No — it is an approximation that holds well for dilute solutions of a single absorbing species at one wavelength. At higher concentrations, real solutions deviate from the simple straight-line relationship between absorbance and concentration.' }
      ]
    },
    compute(values) {
      return { absorbance: values.molarAbsorptivity * values.pathLength * values.concentration };
    }
  },
  {
    id: 'freezing-point-depression-calculator',
    category: 'chemistry',
    glyph: 'ΔTf',
    updatedAt: '2026-11-09',
    aliases: ['freezing point depression calculator', 'delta tf calculator', 'kf x m calculator', 'freezing-point depression formula calculator', 'cryoscopic constant calculator', 'how much salt lowers freezing point calculator'],
    related: ['boiling-point-elevation-calculator', 'molality-calculator', 'vant-hoff-osmotic-pressure-calculator', 'osmolarity-calculator'],
    title: 'Freezing-Point Depression Calculator (ΔTf = Kf × m × i)',
    description: 'Find how much a dissolved solute lowers a solvent’s freezing point — ΔTf = Kf × molality × the van’t Hoff factor — solved for any of the four.',
    example: 'A 0.33 mol/kg nonelectrolyte solution in benzene (Kf = 5.12 °C·kg/mol) lowers benzene’s freezing point from 5.5°C to about 3.8°C, a depression of 1.7°C.',
    solver: {
      defaultTarget: 'deltaTf',
      variables: [
        { id: 'deltaTf', label: 'Freezing-point depression', symbol: 'ΔTf', dimension: 'temperatureDelta', defaultValue: 1.7, defaultUnit: 'C' },
        { id: 'kf', label: 'Cryoscopic constant', symbol: 'Kf', dimension: 'molalConstant', defaultValue: 5.12, defaultUnit: 'Ckgmol' },
        { id: 'molality', label: 'Molality', symbol: 'm', dimension: 'molality', defaultValue: 0.33, defaultUnit: 'mol/kg' },
        { id: 'particles', label: 'Particles per formula unit', symbol: 'i', dimension: 'count', defaultValue: 1, defaultUnit: 'count' }
      ],
      solve: {
        deltaTf: ({ kf, molality, particles }) => kf * molality * particles,
        kf: ({ deltaTf, molality, particles }) => (molality === 0 || particles === 0 ? NaN : deltaTf / (molality * particles)),
        molality: ({ deltaTf, kf, particles }) => (kf === 0 || particles === 0 ? NaN : deltaTf / (kf * particles)),
        particles: ({ deltaTf, kf, molality }) => (kf === 0 || molality === 0 ? NaN : deltaTf / (kf * molality))
      }
    },
    content: {
      lastReviewed: '2026-11-09',
      concept: {
        title: 'What is freezing-point depression?',
        paragraphs: [
          'Dissolving almost any solute in a solvent lowers the temperature at which the mixture freezes compared to the pure solvent alone. OpenStax’s Chemistry 2e calls this freezing-point depression, ΔTf, and states it as directly proportional to the molal concentration of the solute: ΔTf = Kf × m. It is a colligative property — one that depends only on how many solute particles are dissolved, not on what the solute actually is.',
          'Kf, the cryoscopic constant, is a property of the solvent alone: water’s is 1.86 °C·kg/mol, benzene’s is 5.12 °C·kg/mol, and every solvent has its own value. A solute that splits into more than one particle when it dissolves — an ionic compound like NaCl, which separates into Na⁺ and Cl⁻ — depresses the freezing point more than a nonelectrolyte at the same molality, which is why the full formula carries the van’t Hoff factor i: ΔTf = Kf × m × i. i is the number of particles one formula unit becomes in solution (1 for a nonelectrolyte such as sugar or ethylene glycol, approaching 2 for NaCl, approaching 3 for CaCl₂).',
          'This is the chemistry behind salting icy roads and antifreeze in a car’s radiator: both work by lowering the solvent’s freezing point enough that it stays liquid at a temperature where the pure solvent would have already frozen solid.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the freezing-point depression, the cryoscopic constant, the molality, and the particles per formula unit; the fourth fills in automatically.',
        steps: [
          { name: 'Look up the solvent’s cryoscopic constant, Kf', text: 'A property of the solvent only — 1.86 °C·kg/mol for water, 5.12 °C·kg/mol for benzene, and so on. It does not depend on the solute dissolved in it.' },
          { name: 'Find the solute’s molality', text: 'Moles of solute per kilogram of solvent — use the molality calculator above if you have a mass and a molar mass instead of molality directly.' },
          { name: 'Set the particles per formula unit, i', text: 'Use 1 for a nonelectrolyte (sugar, ethylene glycol). For an ionic compound, use the number of ions its formula produces as an ideal upper estimate — 2 for NaCl, 3 for CaCl₂.' },
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit; the missing one is highlighted and fills in automatically.' },
          { name: 'Read the result', text: 'ΔTf is how much the freezing point drops below the pure solvent’s own freezing point — subtract it yourself to get the solution’s actual freezing point.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'ΔTf = Kf × m × i rearranges to solve for any one of the four quantities, given the other three.',
        expression: 'ΔTf = Kf × m × i\nKf = ΔTf ÷ (m × i)\nm = ΔTf ÷ (Kf × i)\ni = ΔTf ÷ (Kf × m)',
        terms: [
          { symbol: 'ΔTf', meaning: 'Freezing-point depression — how much lower the solution freezes compared to the pure solvent, in °C or K (the two are the same size for a temperature difference).' },
          { symbol: 'Kf', meaning: 'The solvent’s cryoscopic constant, in °C·kg/mol — a fixed property of the solvent, not the solute.' },
          { symbol: 'm', meaning: 'Molality of the solute, in mol/kg of solvent.' },
          { symbol: 'i', meaning: 'The van’t Hoff factor — particles the solute becomes per formula unit dissolved. 1 for a nonelectrolyte.' }
        ],
        note: 'This gives the size of the depression, not the solution’s final freezing point — subtract ΔTf from the pure solvent’s own freezing point to get that.'
      },
      workedExample: {
        intro: 'A nonelectrolyte solute is dissolved in benzene (normal freezing point 5.5°C) to a molality of 0.33 mol/kg. What is the freezing point of the solution? (OpenStax Chemistry 2e, Example 11.9.)',
        rows: [
          { label: 'Cryoscopic constant of benzene (Kf)', value: '5.12 °C·kg/mol' },
          { label: 'Molality (m)', value: '0.33 mol/kg' },
          { label: 'Particles per formula unit (i, nonelectrolyte)', value: '1' },
          { label: 'Freezing-point depression (ΔTf = Kf × m × i)', value: '5.12 × 0.33 × 1 = 1.7°C' },
          { label: 'Solution’s freezing point (5.5°C − 1.7°C)', value: '3.8°C' }
        ],
        result: 'ΔTf ≈ 1.7°C; the solution freezes at about 3.8°C',
        explanation: '5.12 × 0.33 gives a depression of 1.6896°C, which rounds to 1.7°C. Subtracting that from benzene’s own 5.5°C freezing point gives a solution freezing point of about 3.8°C — benzene has to cool 1.7°C further than usual before this particular mixture turns solid.'
      },
      watchOut: [
        {
          title: 'Kf depends on the solvent, never the solute',
          body: 'The same solvent’s Kf applies no matter what is dissolved in it — only the molality and the van’t Hoff factor change from solute to solute. Looking up a solute’s own property here instead of the solvent’s is a common mix-up.'
        },
        {
          title: 'This uses molality, not molarity',
          body: 'Molality (mol/kg of solvent) is used specifically because it does not drift with temperature the way molarity (mol/L of solution) does — see the molality calculator if a problem gives a mass of solute and a mass of solvent instead of molality directly.'
        },
        {
          title: 'Boiling-point elevation is the same shape, opposite direction',
          body: 'ΔTb = Kb × m × i uses the identical mathematical form, but a different solvent-specific constant (Kb, not Kf) and raises the boiling point rather than lowering the freezing point — see the boiling-point elevation calculator.'
        },
        {
          title: 'i = 2 (or 3) for an electrolyte is an ideal upper limit',
          body: 'A real ionic solution’s effective van’t Hoff factor is usually a little below the "every ion fully separate" ideal, especially as concentration rises, because oppositely charged ions briefly pair back up in solution. Treat an integer i as the textbook ideal case, not a guaranteed measurement.'
        },
        {
          title: 'This assumes an ideal, dilute solution',
          body: 'The ΔTf = Kf × m × i relationship holds well at the molalities seen in general chemistry problems, but real, concentrated solutions deviate from it, the same limitation every colligative-property formula on this site carries.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §11.4 "Colligative Properties" (freezing-point depression, the Kf table, and Example 11.9)', url: 'https://openstax.org/books/chemistry-2e/pages/11-4-colligative-properties' },
        { label: 'NIST, Chemistry WebBook (freezing/melting point data used to check solvent values)', url: 'https://webbook.nist.gov/chemistry/' }
      ]
    },
    inputs: [
      { id: 'kf', label: 'Cryoscopic constant, Kf (°C·kg/mol)', type: 'number', placeholder: '5.12', defaultValue: 5.12, step: 0.01, min: 0 },
      { id: 'molality', label: 'Molality (mol/kg)', type: 'number', placeholder: '0.33', defaultValue: 0.33, step: 0.01, min: 0 },
      { id: 'particles', label: 'Particles per formula unit, i', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 }
    ],
    seo: {
      title: 'Freezing-Point Depression Calculator (ΔTf = Kf × m × i)',
      description: 'Free freezing-point depression calculator. Solve ΔTf = Kf × molality × i for any value, with the benzene worked example and a watch-out on molality vs molarity.',
      faq: [
        { question: 'What is the freezing-point depression formula?', answer: 'ΔTf = Kf × m × i, where Kf is the solvent’s cryoscopic constant, m is the solute’s molality, and i is the van’t Hoff factor (particles per dissolved formula unit).' },
        { question: 'What is water’s cryoscopic constant?', answer: '1.86 °C·kg/mol (OpenStax Chemistry 2e). Every solvent has its own Kf — benzene’s is 5.12 °C·kg/mol, much larger than water’s.' },
        { question: 'Why does salt lower the freezing point of water more than sugar at the same molality?', answer: 'Salt (NaCl) splits into two ions, Na⁺ and Cl⁻, when it dissolves, so its van’t Hoff factor i is close to 2. Sugar stays as one intact molecule, with i = 1. At the same molality, a van’t Hoff factor of 2 roughly doubles the depression compared to i = 1.' },
        { question: 'How much does 0.100 mol/kg of NaCl lower water’s freezing point?', answer: 'About 0.37°C, using water’s Kf of 1.86 °C·kg/mol and i ≈ 2: ΔTf = 1.86 × 0.100 × 2 = 0.372°C, so the solution freezes at about −0.37°C instead of 0°C.' },
        { question: 'Is freezing-point depression the same thing as boiling-point elevation?', answer: 'They share the identical formula shape (a solvent-specific constant times molality times i), but freezing-point depression lowers the freezing point using Kf, while boiling-point elevation raises the boiling point using a different constant, Kb — see the boiling-point elevation calculator.' },
        { question: 'Does freezing-point depression depend on what the solute is?', answer: 'Only through how many particles it splits into (i) and how much of it is dissolved (m) — not through any other property of the solute. That is what makes it a "colligative" property.' },
        { question: 'Can I use molarity instead of molality in this formula?', answer: 'No — freezing-point depression specifically needs molality (moles of solute per kilogram of solvent), because it stays constant as the solution cools, unlike molarity, which drifts slightly as volume changes with temperature.' }
      ]
    },
    compute(values) {
      return { deltaTf: values.kf * values.molality * values.particles };
    }
  },
  {
    id: 'boiling-point-elevation-calculator',
    category: 'chemistry',
    glyph: 'ΔTb',
    updatedAt: '2026-11-09',
    aliases: ['boiling point elevation calculator', 'delta tb calculator', 'kb x m calculator', 'boiling-point elevation formula calculator', 'ebullioscopic constant calculator', 'antifreeze boiling point calculator'],
    related: ['freezing-point-depression-calculator', 'molality-calculator', 'vant-hoff-osmotic-pressure-calculator', 'osmolarity-calculator'],
    title: 'Boiling-Point Elevation Calculator (ΔTb = Kb × m × i)',
    description: 'Find how much a dissolved solute raises a solvent’s boiling point — ΔTb = Kb × molality × the van’t Hoff factor — solved for any of the four.',
    example: 'The same 0.33 mol/kg nonelectrolyte solution in benzene (Kb = 2.53 °C·kg/mol) raises benzene’s boiling point from 80.1°C to about 80.9°C, a rise of 0.83°C.',
    solver: {
      defaultTarget: 'deltaTb',
      variables: [
        { id: 'deltaTb', label: 'Boiling-point elevation', symbol: 'ΔTb', dimension: 'temperatureDelta', defaultValue: 0.83, defaultUnit: 'C' },
        { id: 'kb', label: 'Ebullioscopic constant', symbol: 'Kb', dimension: 'molalConstant', defaultValue: 2.53, defaultUnit: 'Ckgmol' },
        { id: 'molality', label: 'Molality', symbol: 'm', dimension: 'molality', defaultValue: 0.33, defaultUnit: 'mol/kg' },
        { id: 'particles', label: 'Particles per formula unit', symbol: 'i', dimension: 'count', defaultValue: 1, defaultUnit: 'count' }
      ],
      solve: {
        deltaTb: ({ kb, molality, particles }) => kb * molality * particles,
        kb: ({ deltaTb, molality, particles }) => (molality === 0 || particles === 0 ? NaN : deltaTb / (molality * particles)),
        molality: ({ deltaTb, kb, particles }) => (kb === 0 || particles === 0 ? NaN : deltaTb / (kb * particles)),
        particles: ({ deltaTb, kb, molality }) => (kb === 0 || molality === 0 ? NaN : deltaTb / (kb * molality))
      }
    },
    content: {
      lastReviewed: '2026-11-09',
      concept: {
        title: 'What is boiling-point elevation?',
        paragraphs: [
          'Dissolving a nonvolatile solute in a solvent raises the temperature at which the mixture boils compared to the pure solvent. OpenStax’s Chemistry 2e calls this boiling-point elevation, ΔTb, and gives it the same mathematical shape as freezing-point depression: ΔTb = Kb × m × i, directly proportional to the solute’s molal concentration.',
          'Kb, the ebullioscopic constant, is a property of the solvent alone — water’s is 0.512 °C·kg/mol, benzene’s is 2.53 °C·kg/mol — and i is the van’t Hoff factor, the number of particles one dissolved formula unit becomes (1 for a nonelectrolyte, closer to 2 for a salt like NaCl). The formula is identical in structure to freezing-point depression, just with a different, solvent-specific constant and the opposite effect on the solvent’s phase-change temperature.',
          'Both effects come from the same underlying cause: adding solute particles lowers the solvent’s vapor pressure and disrupts the solid-liquid equilibrium, which is why a solution needs to be colder before it freezes and hotter before it boils than the pure solvent alone. This is the same reason adding salt to cooking water raises its boiling point very slightly, and why antifreeze in a car radiator both protects against freezing in winter and raises the boiling point in summer.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the boiling-point elevation, the ebullioscopic constant, the molality, and the particles per formula unit; the fourth fills in automatically.',
        steps: [
          { name: 'Look up the solvent’s ebullioscopic constant, Kb', text: 'A property of the solvent only — 0.512 °C·kg/mol for water, 2.53 °C·kg/mol for benzene, and so on.' },
          { name: 'Find the solute’s molality', text: 'Moles of solute per kilogram of solvent — use the molality calculator above if you have a mass and a molar mass instead.' },
          { name: 'Set the particles per formula unit, i', text: 'Use 1 for a nonelectrolyte. For an ionic compound, use the number of ions its formula produces as an ideal upper estimate.' },
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit; the missing one is highlighted and fills in automatically.' },
          { name: 'Read the result', text: 'ΔTb is how much the boiling point rises above the pure solvent’s own boiling point — add it yourself to get the solution’s actual boiling point.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'ΔTb = Kb × m × i rearranges to solve for any one of the four quantities, given the other three.',
        expression: 'ΔTb = Kb × m × i\nKb = ΔTb ÷ (m × i)\nm = ΔTb ÷ (Kb × i)\ni = ΔTb ÷ (Kb × m)',
        terms: [
          { symbol: 'ΔTb', meaning: 'Boiling-point elevation — how much higher the solution boils compared to the pure solvent, in °C or K.' },
          { symbol: 'Kb', meaning: 'The solvent’s ebullioscopic constant, in °C·kg/mol — a fixed property of the solvent, not the solute.' },
          { symbol: 'm', meaning: 'Molality of the solute, in mol/kg of solvent.' },
          { symbol: 'i', meaning: 'The van’t Hoff factor — particles the solute becomes per formula unit dissolved. 1 for a nonelectrolyte.' }
        ],
        note: 'This gives the size of the rise, not the solution’s final boiling point — add ΔTb to the pure solvent’s own boiling point to get that.'
      },
      workedExample: {
        intro: 'The same nonelectrolyte solute from the freezing-point depression page is dissolved in benzene (normal boiling point 80.1°C) to a molality of 0.33 mol/kg. What is the boiling point of the solution? (OpenStax Chemistry 2e, Example 11.7.)',
        rows: [
          { label: 'Ebullioscopic constant of benzene (Kb)', value: '2.53 °C·kg/mol' },
          { label: 'Molality (m)', value: '0.33 mol/kg' },
          { label: 'Particles per formula unit (i, nonelectrolyte)', value: '1' },
          { label: 'Boiling-point elevation (ΔTb = Kb × m × i)', value: '2.53 × 0.33 × 1 = 0.83°C' },
          { label: 'Solution’s boiling point (80.1°C + 0.83°C)', value: '80.93°C' }
        ],
        result: 'ΔTb ≈ 0.83°C; the solution boils at about 80.93°C',
        explanation: '2.53 × 0.33 gives a rise of 0.8349°C, which rounds to 0.83°C — matching OpenStax’s own worked answer. Adding that to benzene’s own 80.1°C boiling point gives a solution boiling point of about 80.93°C. Notice this is the exact same solute, at the exact same molality, used on the freezing-point depression page — only the constant and the direction of the effect differ.'
      },
      watchOut: [
        {
          title: 'Kb depends on the solvent, never the solute',
          body: 'The same solvent’s Kb applies no matter what is dissolved in it. It is also a different number from that same solvent’s Kf — do not reuse one constant for the other calculation.'
        },
        {
          title: 'This uses molality, not molarity',
          body: 'Molality is used because it does not drift with temperature as a solution heats toward its boiling point, the way molarity (based on volume) would. A mass of solute and a mass of solvent convert to molality on the molality calculator.'
        },
        {
          title: 'Freezing-point depression is the same shape, opposite direction',
          body: 'ΔTf = Kf × m × i uses the identical mathematical form, but a different solvent-specific constant and the opposite effect — see the freezing-point depression calculator. A 17.9 mol/kg ethylene glycol antifreeze solution in water, for example, raises water’s boiling point to about 109.2°C using Kb, the same molality this site’s molality calculator computes from a 2,220 g dose of ethylene glycol in 2.00 kg of water.'
        },
        {
          title: 'This assumes a nonvolatile solute',
          body: 'The formula applies to a solute that does not itself evaporate, like salt or sugar. A volatile solute (one with its own vapor pressure, like ethanol in water) changes the solution’s boiling behavior through Raoult’s law instead, and this simple formula does not apply.'
        },
        {
          title: 'i = 2 (or more) for an electrolyte is an ideal upper limit',
          body: 'As with freezing-point depression, a real solution’s effective van’t Hoff factor is usually a little below the "fully separated ions" ideal, especially at higher concentration.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §11.4 "Colligative Properties" (boiling-point elevation, the Kb table, and Example 11.7)', url: 'https://openstax.org/books/chemistry-2e/pages/11-4-colligative-properties' },
        { label: 'NIST, Chemistry WebBook (boiling-point data used to check solvent values)', url: 'https://webbook.nist.gov/chemistry/' }
      ]
    },
    inputs: [
      { id: 'kb', label: 'Ebullioscopic constant, Kb (°C·kg/mol)', type: 'number', placeholder: '2.53', defaultValue: 2.53, step: 0.01, min: 0 },
      { id: 'molality', label: 'Molality (mol/kg)', type: 'number', placeholder: '0.33', defaultValue: 0.33, step: 0.01, min: 0 },
      { id: 'particles', label: 'Particles per formula unit, i', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 }
    ],
    seo: {
      title: 'Boiling-Point Elevation Calculator (ΔTb = Kb × m × i)',
      description: 'Free boiling-point elevation calculator. Solve ΔTb = Kb × molality × i for any value, with a worked example and a freezing-point depression cross-link.',
      faq: [
        { question: 'What is the boiling-point elevation formula?', answer: 'ΔTb = Kb × m × i, where Kb is the solvent’s ebullioscopic constant, m is the solute’s molality, and i is the van’t Hoff factor.' },
        { question: 'What is water’s ebullioscopic constant?', answer: '0.512 °C·kg/mol (OpenStax Chemistry 2e). Benzene’s is much larger, 2.53 °C·kg/mol — every solvent has its own Kb.' },
        { question: 'What is the boiling point of a 17.9 mol/kg ethylene glycol antifreeze solution in water?', answer: 'About 109.2°C: ΔTb = 0.512 × 17.9 × 1 ≈ 9.16°C, added to water’s 100.0°C boiling point. The 17.9 mol/kg molality is the same figure this site’s molality calculator computes from 2,220 g of ethylene glycol dissolved in 2.00 kg of water (OpenStax Chemistry 2e, Example 11.3).' },
        { question: 'Is boiling-point elevation the same as freezing-point depression?', answer: 'They share the identical formula shape (constant × molality × i), but boiling-point elevation raises the boiling point with Kb, while freezing-point depression lowers the freezing point with a different constant, Kf — see the freezing-point depression calculator.' },
        { question: 'Does a volatile solute also elevate the boiling point this way?', answer: 'No — this formula assumes a nonvolatile solute. A volatile solute has its own vapor pressure and changes the solution’s boiling behavior through Raoult’s law instead.' },
        { question: 'Why does salt water boil at a higher temperature than fresh water?', answer: 'Dissolved salt ions (i ≈ 2 for NaCl) raise the boiling point very slightly through this exact formula — though at typical cooking concentrations the rise is usually well under 1°C, much smaller than most people assume.' },
        { question: 'Can I use molarity instead of molality here?', answer: 'No — the formula specifically needs molality, since it stays constant as the solution’s temperature (and volume) changes on the way to boiling, unlike molarity.' }
      ]
    },
    compute(values) {
      return { deltaTb: values.kb * values.molality * values.particles };
    }
  },
  {
    id: 'vant-hoff-osmotic-pressure-calculator',
    category: 'chemistry',
    glyph: 'Π',
    updatedAt: '2026-11-09',
    aliases: ['osmotic pressure calculator', 'van’t hoff equation calculator', 'pi = imrt calculator', 'osmotic pressure formula calculator', 'osmotic pressure of a solution calculator', 'reverse osmosis pressure calculator'],
    related: ['molarity-calculator', 'osmolarity-calculator', 'ideal-gas-law-calculator', 'freezing-point-depression-calculator'],
    title: 'Van’t Hoff Osmotic Pressure Calculator (Π = iMRT)',
    description: 'Find the osmotic pressure of a solution from its molarity, van’t Hoff factor, and absolute temperature — Π = iMRT — solved for any of the four.',
    example: 'A 0.30 mol/L glucose solution at body temperature (37°C, 310.15 K) has an osmotic pressure of about 7.6 atm.',
    solver: {
      defaultTarget: 'pressure',
      variables: [
        { id: 'pressure', label: 'Osmotic pressure', symbol: 'Π', dimension: 'pressure', defaultValue: 7.635, defaultUnit: 'atm' },
        { id: 'particles', label: 'Van’t Hoff factor', symbol: 'i', dimension: 'count', defaultValue: 1, defaultUnit: 'count' },
        { id: 'molarity', label: 'Molarity', symbol: 'M', dimension: 'concentration', defaultValue: 0.3, defaultUnit: 'mol/L' },
        { id: 'temperature', label: 'Absolute temperature', symbol: 'T', dimension: 'temperature', defaultValue: 37, defaultUnit: 'C' }
      ],
      solve: {
        pressure: ({ particles, molarity, temperature }) => particles * molarity * 8.31446261815324 * temperature,
        particles: ({ pressure, molarity, temperature }) => (molarity === 0 || temperature === 0 ? NaN : pressure / (molarity * 8.31446261815324 * temperature)),
        molarity: ({ pressure, particles, temperature }) => (particles === 0 || temperature === 0 ? NaN : pressure / (particles * 8.31446261815324 * temperature)),
        temperature: ({ pressure, particles, molarity }) => (particles === 0 || molarity === 0 ? NaN : pressure / (particles * molarity * 8.31446261815324))
      },
      outputs: [
        { id: 'osmolarity', label: 'Equivalent osmolarity (i × M)', dimension: 'osmolarity', unit: 'mOsm/L', compute: (si) => si.molarity * si.particles }
      ]
    },
    content: {
      lastReviewed: '2026-11-09',
      concept: {
        title: 'What is osmotic pressure?',
        paragraphs: [
          'Osmotic pressure is the pressure that must be applied to a solution to stop water (or any solvent) from flowing into it across a semipermeable membrane from the pure solvent side. OpenStax’s Chemistry 2e gives it the formula Π = MRT for a nonelectrolyte, directly parallel to the ideal gas law — the same R and the same role for an absolute temperature T, just with a solution’s molarity standing in for a gas’s moles-per-volume.',
          'For a solute that splits into more than one particle in solution, the formula gains the van’t Hoff factor i, exactly as freezing-point depression and boiling-point elevation do: Π = iMRT. i is the number of particles one formula unit becomes once dissolved — 1 for a nonelectrolyte like glucose, closer to 2 for NaCl. Osmotic pressure is a colligative property for the same reason those two are: it depends on the total concentration of dissolved particles, not on what they are.',
          'Because iM is exactly a solution’s osmolarity (see the osmolarity calculator), Π = iMRT can equally be written Π = (osmolarity) × R × T — the same equation, just read through the lens of total particle concentration instead of molarity and a separate particle-count factor. Osmotic pressure is also the principle behind reverse osmosis water purification, which works by applying a pressure greater than Π to push pure water back out of a salty solution.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the osmotic pressure, the van’t Hoff factor, the molarity, and the absolute temperature; the fourth fills in automatically.',
        steps: [
          { name: 'Find the solute’s molarity', text: 'Moles of dissolved formula unit per litre of solution — use the molarity calculator above if you only have a mass and a volume.' },
          { name: 'Set the van’t Hoff factor, i', text: 'Use 1 for a nonelectrolyte (glucose, sucrose). For an ionic compound, use the number of ions its formula produces as an ideal estimate — 2 for NaCl.' },
          { name: 'Enter the temperature', text: 'Any Celsius, Fahrenheit, or kelvin reading works; the calculator converts it to an absolute scale before solving.' },
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit; the missing one is highlighted and fills in automatically.' },
          { name: 'Read the result', text: 'Osmotic pressure appears in your chosen unit, with the solution’s equivalent osmolarity shown underneath.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Π = iMRT rearranges to solve for any one of the four quantities, given the other three.',
        expression: 'Π = iMRT\ni = Π ÷ (MRT)\nM = Π ÷ (iRT)\nT = Π ÷ (iMR)',
        terms: [
          { symbol: 'Π', meaning: 'Osmotic pressure of the solution.' },
          { symbol: 'i', meaning: 'The van’t Hoff factor — particles the solute becomes per formula unit dissolved. 1 for a nonelectrolyte.' },
          { symbol: 'M', meaning: 'Molarity of the solute, in moles of formula unit per litre of solution.' },
          { symbol: 'R', meaning: 'The molar gas constant, 8.31446261815324 J/(mol·K), exact — the same constant the ideal gas law calculator uses.' },
          { symbol: 'T', meaning: 'Absolute temperature, in kelvin.' }
        ],
        note: 'Every input is converted to SI before solving and converted back afterward, so mixing mol/L with atm or °C with kPa is handled automatically.'
      },
      workedExample: {
        intro: 'What is the osmotic pressure of a 0.30 mol/L glucose solution in water at body temperature, 37°C? (OpenStax Chemistry 2e, Example 11.10.)',
        rows: [
          { label: 'Molarity (M)', value: '0.30 mol/L' },
          { label: 'Van’t Hoff factor (i, glucose is a nonelectrolyte)', value: '1' },
          { label: 'Absolute temperature (T = 37°C + 273.15)', value: '310.15 K' },
          { label: 'Osmotic pressure (Π = iMRT)', value: '1 × 0.30 × 0.08206 × 310 ≈ 7.6 atm' }
        ],
        result: 'Π ≈ 7.6 atm',
        explanation: 'OpenStax’s own worked solution uses R in L·atm/(mol·K) (0.08206) with T rounded to 310 K, giving 7.6 atm. Recomputed in full SI (R = 8.31446261815324 J/(mol·K), T = 310.15 K, M converted to 300 mol/m³) gives Π = 773,619 Pa ≈ 7.635 atm — the same 7.6 atm to the precision OpenStax’s own rounding supports. This solution’s equivalent osmolarity is 1 × 0.30 = 0.30 Osm/L (300 mOsm/L), since glucose does not dissociate.'
      },
      watchOut: [
        {
          title: 'Temperature must be absolute (kelvin), not Celsius or Fahrenheit',
          body: 'Π = iMRT only works with an absolute temperature scale, the same requirement as the ideal gas law. This calculator converts for you, but a hand calculation using a Celsius reading directly gives a wrong answer.'
        },
        {
          title: 'i = 2 (or more) for an electrolyte is an ideal upper limit',
          body: 'As with freezing-point depression and boiling-point elevation, a real electrolyte solution’s effective van’t Hoff factor usually sits a little below the "fully dissociated" integer value, especially at higher concentration.'
        },
        {
          title: 'This gives osmotic pressure, not osmolarity directly',
          body: 'Osmolarity (iM) and osmotic pressure (iMRT) are related by one extra factor, RT — they are not the same quantity or the same units. See the osmolarity calculator for iM on its own, in mOsm/L.'
        },
        {
          title: 'Finding a macromolecule’s molar mass from osmotic pressure needs an extra step',
          body: 'A dilute protein solution’s measured osmotic pressure gives its molarity via M = Π ÷ (iRT); dividing the known mass dissolved by that molarity (using the moles-to-grams calculator in reverse) then gives the molar mass — the technique OpenStax uses to find hemoglobin’s molar mass from a 5.9 torr reading at 22°C.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §11.4 "Colligative Properties" (osmotic pressure and Example 11.10)', url: 'https://openstax.org/books/chemistry-2e/pages/11-4-colligative-properties' },
        { label: 'NIST CODATA, Molar Gas Constant', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?r' }
      ]
    },
    inputs: [
      { id: 'molarity', label: 'Molarity (mol/m³)', type: 'number', placeholder: '300', defaultValue: 300, step: 1, min: 0 },
      { id: 'particles', label: 'Van’t Hoff factor, i', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 },
      { id: 'temperature', label: 'Absolute temperature (K)', type: 'number', placeholder: '310.15', defaultValue: 310.15, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Van’t Hoff Osmotic Pressure Calculator (Π = iMRT)',
      description: 'Free osmotic pressure calculator. Solve Π = iMRT for pressure, molarity, van’t Hoff factor, or temperature, with a worked glucose example.',
      faq: [
        { question: 'What is the osmotic pressure formula?', answer: 'Π = iMRT, where i is the van’t Hoff factor, M is molarity, R is the molar gas constant, and T is absolute temperature in kelvin.' },
        { question: 'What is the osmotic pressure of a 0.30 mol/L glucose solution at body temperature?', answer: 'About 7.6 atm, using i = 1 (glucose does not dissociate), M = 0.30 mol/L, and T = 310.15 K (37°C).' },
        { question: 'How is osmotic pressure related to osmolarity?', answer: 'Osmolarity is iM (in mOsm/L); osmotic pressure is that same quantity multiplied by RT: Π = (osmolarity) × R × T. They describe the same dissolved-particle concentration, just scaled differently.' },
        { question: 'Why does the formula need kelvin instead of Celsius?', answer: 'Like the ideal gas law, Π = iMRT only works on an absolute temperature scale with no offset zero. This calculator converts any Celsius or Fahrenheit input to kelvin automatically.' },
        { question: 'Does osmotic pressure depend on what the solute is?', answer: 'Only through its molarity and how many particles it splits into (i), not through any other property — the same colligative-property pattern as freezing-point depression and boiling-point elevation.' },
        { question: 'What is the value of R used here?', answer: '8.31446261815324 J/(mol·K) in SI units, the same exact molar gas constant the ideal gas law calculator uses. OpenStax’s own worked examples instead use R = 0.08206 L·atm/(mol·K), convenient when pressure is wanted directly in atm.' },
        { question: 'How is osmotic pressure used in reverse osmosis?', answer: 'Reverse osmosis applies a pressure greater than a solution’s osmotic pressure Π, pushing pure solvent back across the membrane against its natural flow — the opposite of the passive osmosis this formula describes.' }
      ]
    },
    compute(values) {
      return { pressure: values.particles * values.molarity * 8.31446261815324 * values.temperature };
    }
  },
  {
    id: 'percent-composition-calculator',
    category: 'chemistry',
    glyph: 'w%',
    updatedAt: '2026-11-09',
    aliases: ['percent composition calculator', 'elemental percent composition calculator', 'mass percent of elements calculator', 'percentage composition of a compound calculator', 'percent of each element in a compound calculator', '% composition calculator'],
    related: ['molar-mass-calculator', 'empirical-formula-calculator', 'mass-percent-calculator', 'moles-to-grams-calculator'],
    title: 'Percent Composition Calculator',
    description: 'Find each element’s percent by mass in a chemical formula — every element’s contribution to the molar mass, divided by the total, times 100.',
    example: 'Vitamin C, C₆H₈O₆, is 40.92% carbon, 4.58% hydrogen, and 54.50% oxygen by mass.',
    content: {
      lastReviewed: '2026-11-09',
      concept: {
        title: 'What is percent composition?',
        paragraphs: [
          'Percent composition breaks a compound’s molar mass down by element: what fraction of the total mass each element contributes. For element i, that is w_i = (atomic mass_i × count_i) ÷ (molar mass) × 100 — the same atomic-mass-times-count contributions the molar mass calculator adds together, just divided by the total and expressed as a percentage instead of left as a sum.',
          'It is the forward direction of a question the empirical formula calculator answers in reverse: given a formula, percent composition tells you the mass percentages; given mass percentages (usually from lab analysis — burning a sample and measuring what comes off), the empirical formula calculator works backward to a formula. Both use exactly the same atomic-mass table and the same arithmetic, just starting from opposite ends.',
          'Percent composition is also how a food or supplement label’s elemental breakdown, a mineral’s composition, or a fertilizer’s nitrogen content are usually reported — a compound’s formula fixes its percent composition exactly, since both numerator and denominator come from the same fixed atomic masses.'
        ]
      },
      howTo: {
        intro: 'Build the formula one element at a time, the same way as the molar mass calculator: pick each element and how many atoms of it appear.',
        steps: [
          { name: 'Identify every distinct element in the formula', text: 'Vitamin C, C₆H₈O₆, has three: carbon, hydrogen, and oxygen. Leave unused element slots set to "None".' },
          { name: 'Enter each element’s atom count', text: 'The subscript in the formula — the "6" in both C₆ and O₆, the "8" in H₈.' },
          { name: 'Repeat for every element in the formula', text: 'Up to four element slots, covering the large majority of formulas seen in a general chemistry course.' },
          { name: 'Read each element’s percent by mass', text: 'Every element’s share of the total molar mass appears at once, along with the compound’s molar mass itself.' },
          { name: 'Check they add up to 100%', text: 'Every element’s percent composition in a formula should sum to 100% (allowing for rounding) — a useful check on the inputs.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Percent composition divides each element’s contribution to the molar mass by the molar mass itself.',
        expression: 'M = Σ (atomic massᵢ × countᵢ)\n%ᵢ = (atomic massᵢ × countᵢ ÷ M) × 100',
        terms: [
          { symbol: 'M', meaning: 'The compound’s molar mass, in grams per mole — the sum of every element’s contribution.' },
          { symbol: 'atomic massᵢ', meaning: 'The standard atomic weight of element i, from the IUPAC/CIAAW table.' },
          { symbol: 'countᵢ', meaning: 'How many atoms of element i the formula contains.' },
          { symbol: '%ᵢ', meaning: 'Element i’s percent of the compound’s total mass.' }
        ],
        note: 'Every formula with the same element-and-count combination has exactly one percent composition — it never depends on how much of the compound you actually have.'
      },
      workedExample: {
        intro: 'What is the percent composition of vitamin C (ascorbic acid), C₆H₈O₆? This is the same compound the empirical formula calculator’s own worked example starts from, run in the opposite direction.',
        rows: [
          { label: 'Carbon (6 × 12.011 g/mol)', value: '72.066 g/mol' },
          { label: 'Hydrogen (8 × 1.008 g/mol)', value: '8.064 g/mol' },
          { label: 'Oxygen (6 × 15.999 g/mol)', value: '95.994 g/mol' },
          { label: 'Molar mass (72.066 + 8.064 + 95.994)', value: '176.124 g/mol' },
          { label: '%C (72.066 ÷ 176.124 × 100)', value: '40.92%' },
          { label: '%H (8.064 ÷ 176.124 × 100)', value: '4.58%' },
          { label: '%O (95.994 ÷ 176.124 × 100)', value: '54.50%' }
        ],
        result: '40.92% C, 4.58% H, 54.50% O',
        explanation: 'Dividing each element’s contribution by the compound’s 176.124 g/mol total and multiplying by 100 gives 40.92% carbon, 4.58% hydrogen, and 54.50% oxygen, which add to almost exactly 100% (rounding accounts for the rest). These figures match the empirical formula calculator’s own cited percentages for this exact compound (C 40.9%, H 4.58%, O 54.5%, rounded to one fewer decimal place there).'
      },
      watchOut: [
        {
          title: 'The subscript is an atom count, not a multiplier on the whole formula',
          body: 'In C₆H₈O₆, the 6 next to carbon is carbon’s own count only — enter each element’s own subscript as it is written in the formula.'
        },
        {
          title: 'Parenthesized groups multiply everything inside them',
          body: 'A formula like Ca(OH)₂ needs the subscript outside the parentheses multiplied into every element inside first — enter the already-multiplied totals (O: 2, H: 2), the same rule the molar mass calculator uses.'
        },
        {
          title: 'This is the reverse of the empirical formula calculator',
          body: 'Percent composition goes from a known formula to mass percentages. The empirical formula calculator goes the other way, from measured mass percentages back to a formula — use whichever one matches the information you actually have.'
        },
        {
          title: 'Percent composition is not the same as mass percent of a solution',
          body: 'This page’s percentages describe one pure compound’s own elemental makeup. The mass percent calculator instead describes how much of a solute is dissolved in a solution — a completely different question using a different formula.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §3.2 "Determining Empirical and Molecular Formulas" (percent composition and its relationship to empirical formulas)', url: 'https://openstax.org/books/chemistry-2e/pages/3-2-determining-empirical-and-molecular-formulas' },
        { label: 'CIAAW (IUPAC Commission on Isotopic Abundances and Atomic Weights), Standard Atomic Weights', url: 'https://ciaaw.org/atomic-weights.htm' }
      ]
    },
    inputs: [
      { id: 'element1', label: 'Element 1', type: 'number', placeholder: '12.011', defaultValue: 12.011, step: 0.001, min: 0, options: ELEMENT_OPTIONS },
      { id: 'count1', label: 'Element 1 atom count', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 0 },
      { id: 'element2', label: 'Element 2', type: 'number', placeholder: '1.008', defaultValue: 1.008, step: 0.001, min: 0, options: ELEMENT_OPTIONS },
      { id: 'count2', label: 'Element 2 atom count', type: 'number', placeholder: '8', defaultValue: 8, step: 1, min: 0 },
      { id: 'element3', label: 'Element 3', type: 'number', placeholder: '15.999', defaultValue: 15.999, step: 0.001, min: 0, options: ELEMENT_OPTIONS },
      { id: 'count3', label: 'Element 3 atom count', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 0 },
      { id: 'element4', label: 'Element 4', type: 'number', placeholder: '0', defaultValue: 0, step: 0.001, min: 0, options: ELEMENT_OPTIONS },
      { id: 'count4', label: 'Element 4 atom count', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'percent1',
      headlineLabel: 'Element 1, percent by mass',
      outputs: [
        { id: 'percent1', label: 'Element 1, percent by mass', format: 'significant' },
        { id: 'percent2', label: 'Element 2, percent by mass', format: 'significant' },
        { id: 'percent3', label: 'Element 3, percent by mass', format: 'significant' },
        { id: 'percent4', label: 'Element 4, percent by mass', format: 'significant' },
        { id: 'molarMass', label: 'Molar mass (g/mol)', format: 'significant' }
      ],
      groups: [{ inputs: ['element1', 'count1', 'element2', 'count2', 'element3', 'count3', 'element4', 'count4'] }],
      derive: (values) => ({
        contribution1: values.element1 * values.count1,
        contribution2: values.element2 * values.count2,
        contribution3: values.element3 * values.count3,
        contribution4: values.element4 * values.count4
      }),
      visual: {
        type: 'donut',
        segments: [
          { from: 'contribution1', label: 'Element 1' },
          { from: 'contribution2', label: 'Element 2' },
          { from: 'contribution3', label: 'Element 3' },
          { from: 'contribution4', label: 'Element 4' }
        ],
        center: 'molarMass',
        centerSub: 'g/mol'
      }
    },
    seo: {
      title: 'Percent Composition Calculator – Mass % by Element',
      description: 'Free percent composition calculator. Find each element’s percent by mass in a formula (up to 4 elements), with a worked vitamin C example.',
      faq: [
        { question: 'How do I calculate percent composition?', answer: 'Multiply each element’s atomic mass by its atom count to get its contribution, add every element’s contribution for the molar mass, then divide each contribution by that total and multiply by 100.' },
        { question: 'What is the percent composition of vitamin C, C₆H₈O₆?', answer: '40.92% carbon, 4.58% hydrogen, and 54.50% oxygen by mass, from a total molar mass of 176.124 g/mol.' },
        { question: 'What is the percent composition of water, H₂O?', answer: '11.19% hydrogen and 88.81% oxygen by mass — water’s 18.015 g/mol total is almost entirely oxygen’s own 15.999 g/mol.' },
        { question: 'What is the percent composition of glucose, C₆H₁₂O₆?', answer: '40.00% carbon, 6.71% hydrogen, and 53.28% oxygen, from the 180.156 g/mol molar mass the molar mass calculator’s own glucose example computes.' },
        { question: 'Do percent composition figures always add up to 100%?', answer: 'Yes, as long as every element in the formula is entered — each element’s contribution is divided by the same total, so the percentages are guaranteed to sum to 100% (allowing for rounding).' },
        { question: 'How is percent composition different from the empirical formula calculator?', answer: 'This page goes from a known formula to mass percentages. The empirical formula calculator runs the identical relationship in reverse, from measured mass percentages back to a formula.' },
        { question: 'How do I handle a formula with parentheses, like Ca(OH)₂?', answer: 'Multiply the subscript outside the parentheses into every element inside it first, then enter those already-multiplied totals as the per-element counts — the same rule the molar mass calculator uses.' }
      ]
    },
    compute(values) {
      const contribution1 = values.element1 * values.count1;
      const contribution2 = values.element2 * values.count2;
      const contribution3 = values.element3 * values.count3;
      const contribution4 = values.element4 * values.count4;
      const total = contribution1 + contribution2 + contribution3 + contribution4;
      return {
        molarMass: total,
        percent1: (contribution1 / total) * 100,
        percent2: (contribution2 / total) * 100,
        percent3: (contribution3 / total) * 100,
        percent4: (contribution4 / total) * 100
      };
    }
  },
  {
    id: 'faradays-law-electrolysis-calculator',
    category: 'chemistry',
    glyph: 'F',
    updatedAt: '2026-11-09',
    aliases: ['faraday’s law of electrolysis calculator', 'electrolysis mass calculator', 'faraday constant calculator', 'moles of electrons calculator', 'electroplating calculator', 'm = itm/nf calculator'],
    related: ['molar-mass-calculator', 'moles-to-grams-calculator', 'ideal-gas-law-calculator', 'molarity-calculator'],
    title: 'Faraday’s Law of Electrolysis Calculator (m = ItM ÷ nF)',
    description: 'Find the mass deposited or produced during electrolysis from the current, time, molar mass, and electrons transferred — solved for any of the three measurable quantities.',
    example: 'A current of 10.23 A run for exactly 1 hour deposits about 41.17 g of silver (Ag⁺ + e⁻ → Ag) at a cathode.',
    solver: {
      defaultTarget: 'mass',
      variables: [
        { id: 'mass', label: 'Mass deposited or produced', symbol: 'm', dimension: 'mass', defaultValue: 41.17, defaultUnit: 'g' },
        { id: 'current', label: 'Current', symbol: 'I', dimension: 'current', defaultValue: 10.23, defaultUnit: 'A' },
        { id: 'time', label: 'Time', symbol: 't', dimension: 'time', defaultValue: 1, defaultUnit: 'h' },
        { id: 'molarMass', label: 'Molar mass of the element', symbol: 'M', dimension: 'molarMass', defaultValue: 107.87, defaultUnit: 'g/mol', fixed: true },
        { id: 'electrons', label: 'Electrons transferred per ion', symbol: 'n', dimension: 'count', defaultValue: 1, defaultUnit: 'count', fixed: true }
      ],
      solve: {
        mass: ({ current, time, molarMass, electrons }) => (current * time * molarMass) / (electrons * 96485.33212331001),
        current: ({ mass, time, molarMass, electrons }) =>
          time === 0 || molarMass === 0 ? NaN : (mass * electrons * 96485.33212331001) / (time * molarMass),
        time: ({ mass, current, molarMass, electrons }) =>
          current === 0 || molarMass === 0 ? NaN : (mass * electrons * 96485.33212331001) / (current * molarMass)
      },
      outputs: [
        { id: 'charge', label: 'Charge passed (Q = I × t)', dimension: 'charge', unit: 'C', compute: (si) => si.current * si.time },
        { id: 'molesElectrons', label: 'Moles of electrons (Q ÷ F)', dimension: 'amountOfSubstance', unit: 'mol', compute: (si) => (si.current * si.time) / 96485.33212331001 }
      ]
    },
    content: {
      lastReviewed: '2026-11-09',
      concept: {
        title: 'What is Faraday’s law of electrolysis?',
        paragraphs: [
          'Electrolysis uses electrical current to force a chemical reaction that would not happen on its own — plating a metal onto a cathode, for instance. Faraday’s law of electrolysis ties the amount of current passed, and how long it flows, to exactly how much of a substance gets produced or deposited: m = (I × t × M) ÷ (n × F).',
          'I × t is the total electric charge passed, in coulombs. Dividing that charge by the Faraday constant, F — the charge carried by one mole of electrons, 96,485.332123... C/mol, exact since the 2019 SI redefinition fixed both the Avogadro constant and the elementary charge — converts the charge into moles of electrons. n, the number of electrons each ion needs to gain or lose (1 for Ag⁺ → Ag, 2 for Cu²⁺ → Cu), then converts moles of electrons into moles of the element itself, and multiplying by the molar mass M finally converts that to a mass.',
          'This is the same stoichiometric logic as any other mole-based calculation — just with "moles of electrons passed through a circuit" standing in for "moles of a reagent," computed from an electrical measurement (current and time) instead of a scale or a volumetric flask.'
        ]
      },
      howTo: {
        intro: 'Fill in current and time, plus the fixed molar mass and electron count for the element being deposited; mass fills in automatically — or enter a known mass to solve for current or time instead.',
        steps: [
          { name: 'Identify the half-reaction at the electrode', text: 'Write the reduction (or oxidation) that deposits or releases the substance, e.g. Ag⁺ + e⁻ → Ag, and read off n, the electrons per ion — 1 here.' },
          { name: 'Enter the element’s molar mass, M', text: 'From the molar mass calculator or a periodic table — 107.87 g/mol for silver.' },
          { name: 'Enter the current and time the cell actually ran', text: 'Current in amps, time in seconds, minutes, or hours.' },
          { name: 'Read the result', text: 'Mass deposited appears immediately, along with the total charge passed and the moles of electrons that charge represents.' },
          { name: 'Or work backward', text: 'Type a target mass instead, and the calculator solves for the current or the time needed to reach it (whichever field is left to auto-calculate).' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'm = (I × t × M) ÷ (n × F) rearranges to solve for current or time, given the mass and the other quantities.',
        expression: 'm = (I × t × M) ÷ (n × F)\nI = (m × n × F) ÷ (t × M)\nt = (m × n × F) ÷ (I × M)',
        terms: [
          { symbol: 'm', meaning: 'Mass of the substance deposited or produced.' },
          { symbol: 'I', meaning: 'Current through the electrolytic cell, in amps.' },
          { symbol: 't', meaning: 'Time the current flows.' },
          { symbol: 'M', meaning: 'Molar mass of the element being deposited or produced — a fixed property of that element, not something this calculator solves for.' },
          { symbol: 'n', meaning: 'Electrons transferred per ion in the half-reaction — a fixed property of that reaction, read off the balanced half-equation.' },
          { symbol: 'F', meaning: 'The Faraday constant, 96,485.332123... C/mol, exact.' }
        ],
        note: 'M and n come from the specific element and half-reaction involved, not from a measurement — they are entered as fixed inputs here, the same way a titration’s reaction coefficients are.'
      },
      workedExample: {
        intro: 'A current of 10.23 A is run through a silver-plating cell for exactly 1 hour. How much silver (Ag⁺ + e⁻ → Ag, n = 1) is deposited? (OpenStax Chemistry 2e, Example 17.9.)',
        rows: [
          { label: 'Current (I)', value: '10.23 A' },
          { label: 'Time (t)', value: '1 hour = 3,600 s' },
          { label: 'Charge passed (Q = I × t)', value: '10.23 × 3,600 = 36,828 C' },
          { label: 'Moles of electrons (Q ÷ F)', value: '36,828 ÷ 96,485.33 ≈ 0.38170 mol e⁻' },
          { label: 'Molar mass of silver (M)', value: '107.87 g/mol' },
          { label: 'Mass of silver (moles e⁻ × M ÷ n)', value: '0.38170 × 107.87 ÷ 1 ≈ 41.17 g' }
        ],
        result: 'm ≈ 41.17 g of silver',
        explanation: 'Recomputed without rounding any intermediate step, 36,828 C of charge is 0.381695 mol of electrons, which at n = 1 for Ag⁺ is also 0.381695 mol of silver, for a mass of 0.381695 × 107.87 ≈ 41.17 g. OpenStax’s own worked solution states 41.19 g, using a rounded intermediate value (0.3817 mol) and the slightly different atomic weight 107.9 g/mol it quotes — rounding 0.3817 × 107.9 gives 41.19, while carrying full precision through gives 41.17–41.18 g. The two-hundredths-of-a-gram gap is rounding, not a disagreement over the formula.'
      },
      watchOut: [
        {
          title: 'n comes from the half-reaction, not the ion’s charge magnitude alone',
          body: 'n is the number of electrons that specific half-reaction transfers per ion or atom — 1 for Ag⁺ → Ag, 2 for Cu²⁺ → Cu, 3 for Al³⁺ → Al. It usually (but not always) matches the ion’s charge; always check the balanced half-equation rather than assuming.'
        },
        {
          title: 'Current must be steady over the whole time, or use an average',
          body: 'This formula assumes a constant current for the full duration. A current that varies needs either a steady average over the period or an integral of current over time — this calculator covers the constant-current case most general-chemistry problems use.'
        },
        {
          title: 'Rounding an intermediate value shifts the final answer slightly',
          body: 'As the worked example above shows, rounding moles of electrons to four significant figures before multiplying by the molar mass can shift the final mass by a few hundredths of a gram. Carry full precision through every step when it matters, and only round the final answer.'
        },
        {
          title: 'This is mass produced at one electrode, not total cell efficiency',
          body: 'Real electrolytic cells lose some current to side reactions or heat, so an industrial process typically needs more charge than this ideal formula predicts to deposit the same mass — current efficiency is a separate, equipment-specific figure not covered here.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §17.7 "Electrolysis" (Faraday’s law and Example 17.9)', url: 'https://openstax.org/books/chemistry-2e/pages/17-7-electrolysis' },
        { label: 'NIST CODATA, Faraday Constant', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?fday' }
      ]
    },
    inputs: [
      { id: 'current', label: 'Current (A)', type: 'number', placeholder: '10.23', defaultValue: 10.23, step: 0.01, min: 0 },
      { id: 'time', label: 'Time (s)', type: 'number', placeholder: '3600', defaultValue: 3600, step: 1, min: 0 },
      { id: 'molarMass', label: 'Molar mass of the element (kg/mol)', type: 'number', placeholder: '0.10787', defaultValue: 0.10787, step: 0.00001, min: 0 },
      { id: 'electrons', label: 'Electrons transferred per ion, n', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 }
    ],
    seo: {
      title: 'Faraday’s Law of Electrolysis Calculator',
      description: 'Free Faraday’s law calculator. Solve m = ItM ÷ nF for mass, current, or time during electrolysis, with a silver-plating worked example.',
      faq: [
        { question: 'What is Faraday’s law of electrolysis?', answer: 'm = (I × t × M) ÷ (n × F): the mass deposited or produced equals the current times time (the charge passed) times the molar mass, divided by the electrons transferred per ion times the Faraday constant.' },
        { question: 'What is the Faraday constant?', answer: '96,485.332123... C/mol — the electric charge carried by exactly one mole of electrons, exact since the 2019 SI redefinition fixed the Avogadro constant and the elementary charge.' },
        { question: 'How much silver is deposited by 10.23 A for 1 hour?', answer: 'About 41.17 g, using n = 1 for Ag⁺ + e⁻ → Ag and silver’s 107.87 g/mol molar mass.' },
        { question: 'How do I find the moles of electrons passed in electrolysis?', answer: 'Divide the total charge (current × time, in coulombs) by the Faraday constant: moles of electrons = (I × t) ÷ F.' },
        { question: 'Why does copper deposition use n = 2 but silver uses n = 1?', answer: 'n is the number of electrons each ion gains in its half-reaction: Cu²⁺ + 2e⁻ → Cu needs 2 electrons per copper atom, while Ag⁺ + e⁻ → Ag needs only 1 — read n directly off the balanced half-equation.' },
        { question: 'Can this calculator solve for the current or time instead of the mass?', answer: 'Yes — enter a target mass and leave current or time as the field to auto-calculate, and the formula solves for whichever one is missing.' },
        { question: 'Does this account for real-world electrolysis losses?', answer: 'No — it gives the ideal, 100%-efficient result. Real cells typically need somewhat more charge than this to deposit the same mass, due to side reactions and other losses specific to the equipment.' }
      ]
    },
    compute(values) {
      return { mass: (values.current * values.time * values.molarMass) / (values.electrons * 96485.33212331001) };
    }
  },
  {
    id: 'vapor-pressure-calculator',
    category: 'chemistry',
    glyph: 'Pv',
    updatedAt: '2026-11-13',
    aliases: ['vapor pressure calculator', 'clausius-clapeyron calculator', 'clausius clapeyron equation calculator', 'enthalpy of vaporization calculator', 'boiling point at altitude calculator'],
    related: ['ideal-gas-law-calculator', 'arrhenius-equation-calculator', 'boiling-point-elevation-calculator', 'gibbs-free-energy-calculator'],
    title: 'Vapor Pressure Calculator (Clausius-Clapeyron Equation)',
    description: 'Relate a liquid’s vapor pressure at two temperatures using the Clausius-Clapeyron equation — solve for either pressure, either temperature, or the enthalpy of vaporization.',
    example: 'Isooctane’s vapor pressure rises from 10.0 kPa at 34.0°C to 100.0 kPa at 98.8°C, giving an enthalpy of vaporization of about 33.8 kJ/mol.',
    solver: {
      defaultTarget: 'enthalpyVap',
      variables: [
        { id: 'pressure1', label: 'Vapor pressure at T₁', symbol: 'P₁', dimension: 'pressure', defaultValue: 10.0, defaultUnit: 'kPa' },
        { id: 'temperature1', label: 'Temperature 1', symbol: 'T₁', dimension: 'temperature', defaultValue: 34.0, defaultUnit: 'C' },
        { id: 'pressure2', label: 'Vapor pressure at T₂', symbol: 'P₂', dimension: 'pressure', defaultValue: 100.0, defaultUnit: 'kPa' },
        { id: 'temperature2', label: 'Temperature 2', symbol: 'T₂', dimension: 'temperature', defaultValue: 98.8, defaultUnit: 'C' },
        { id: 'enthalpyVap', label: 'Enthalpy of vaporization', symbol: 'ΔHvap', dimension: 'molarEnergy', defaultValue: 33.75, defaultUnit: 'kJ/mol' }
      ],
      solve: {
        enthalpyVap: ({ pressure1, temperature1, pressure2, temperature2 }) =>
          (8.31446261815324 * Math.log(pressure2 / pressure1)) / (1 / temperature1 - 1 / temperature2),
        pressure2: ({ pressure1, temperature1, temperature2, enthalpyVap }) =>
          pressure1 * Math.exp((enthalpyVap / 8.31446261815324) * (1 / temperature1 - 1 / temperature2)),
        pressure1: ({ pressure2, temperature1, temperature2, enthalpyVap }) =>
          pressure2 / Math.exp((enthalpyVap / 8.31446261815324) * (1 / temperature1 - 1 / temperature2)),
        temperature1: ({ pressure1, pressure2, temperature2, enthalpyVap }) =>
          1 / (Math.log(pressure2 / pressure1) * (8.31446261815324 / enthalpyVap) + 1 / temperature2),
        temperature2: ({ pressure1, pressure2, temperature1, enthalpyVap }) =>
          1 / (1 / temperature1 - Math.log(pressure2 / pressure1) * (8.31446261815324 / enthalpyVap))
      }
    },
    content: {
      lastReviewed: '2026-11-13',
      concept: {
        title: 'What is the Clausius-Clapeyron equation?',
        paragraphs: [
          'A liquid’s vapor pressure is not a single fixed number — it rises with temperature, because more molecules gain enough kinetic energy to escape into the gas phase as the liquid gets warmer. The Clausius-Clapeyron equation ties that rise to the liquid’s enthalpy of vaporization, ΔHvap, the energy needed to pull one mole of molecules out of the liquid entirely: ln(P₂/P₁) = (ΔHvap/R) × (1/T₁ − 1/T₂), using two vapor-pressure/temperature pairs for the same substance.',
          'The equation comes from integrating the Clausius-Clapeyron relation (d(lnP)/dT = ΔHvap/RT²) between two temperatures, assuming ΔHvap stays roughly constant over that range — a good approximation away from the critical point. Because the pressures appear inside a logarithm, this is a genuinely different shape from most of this site’s other chemistry formulas, and it is also the formula behind the common observation that water boils at a lower temperature at high altitude: a lower atmospheric pressure means the liquid reaches its boiling point — where vapor pressure equals the surrounding pressure — at a lower temperature.',
          'OpenStax Chemistry 2e uses it two ways: given a substance’s vapor pressure at two known temperatures, solve for ΔHvap (Example 10.7); or given ΔHvap and one known boiling point, predict the temperature at which the liquid boils under a different pressure (Example 10.8, useful for estimating a boiling point at altitude or under vacuum).'
        ]
      },
      howTo: {
        intro: 'Enter any four of the five quantities — two pressures, their matching temperatures, and the enthalpy of vaporization — and the fifth fills in automatically.',
        steps: [
          { name: 'Pick two temperature/pressure pairs', text: 'Either two measured (pressure, temperature) points for the same liquid, or one known point plus a target temperature or pressure.' },
          { name: 'Enter P₁ and T₁', text: 'The first vapor pressure and its matching temperature.' },
          { name: 'Enter P₂ and T₂', text: 'The second vapor pressure and its matching temperature — or leave one of these two blank-equivalent (the auto field) if that is what you are solving for.' },
          { name: 'Enter ΔHvap if you know it', text: 'From a reference table, or leave it as the auto field to calculate it from the two (P, T) points instead.' },
          { name: 'Read the result', text: 'Whichever field was least recently edited fills in automatically, highlighted with the "auto" badge.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'ln(P₂/P₁) = (ΔHvap/R)(1/T₁ − 1/T₂) rearranges to solve for any one of the five quantities, given the other four.',
        expression: 'ln(P₂/P₁) = (ΔHvap/R)(1/T₁ − 1/T₂)\nP₂ = P₁ × e^[(ΔHvap/R)(1/T₁−1/T₂)]\nΔHvap = R × ln(P₂/P₁) ÷ (1/T₁ − 1/T₂)',
        terms: [
          { symbol: 'P₁, P₂', meaning: 'The liquid’s vapor pressure at temperature T₁ and T₂.' },
          { symbol: 'T₁, T₂', meaning: 'Absolute temperature (kelvin) matching each vapor pressure.' },
          { symbol: 'ΔHvap', meaning: 'Enthalpy of vaporization — energy needed to vaporize one mole of the liquid, assumed constant between T₁ and T₂.' },
          { symbol: 'R', meaning: 'The molar gas constant, 8.31446261815324 J/(mol·K), exact — the same constant the ideal gas law calculator uses.' }
        ],
        note: 'Every input is converted to SI (pascals, kelvin, J/mol) before solving and converted back afterward, so mixing kPa with atm or °C with K is handled automatically.'
      },
      workedExample: {
        intro: 'Isooctane’s vapor pressure is 10.0 kPa at 34.0°C and 100.0 kPa at 98.8°C. What is its enthalpy of vaporization? (OpenStax Chemistry 2e, Example 10.7.)',
        rows: [
          { label: 'T₁ (34.0°C + 273.15)', value: '307.15 K' },
          { label: 'T₂ (98.8°C + 273.15)', value: '371.95 K' },
          { label: 'ln(P₂/P₁) = ln(100.0/10.0)', value: 'ln(10) ≈ 2.3026' },
          { label: '1/T₁ − 1/T₂', value: '0.0032552 − 0.0026885 ≈ 5.667 × 10⁻⁴ K⁻¹' },
          { label: 'ΔHvap = R × ln(P₂/P₁) ÷ (1/T₁ − 1/T₂)', value: '8.3145 × 2.3026 ÷ 5.667 × 10⁻⁴ ≈ 33,750 J/mol' }
        ],
        result: 'ΔHvap ≈ 33.8 kJ/mol',
        explanation: 'Carrying full precision through every step gives 33.75 kJ/mol, which rounds to the same 33.8 kJ/mol OpenStax’s own worked solution states. Running the same two (P, T) points the other way around — given ΔHvap, solve for P₂ at T₂ — reproduces 100.0 kPa exactly, confirming the calculator’s forward and reverse solves agree.'
      },
      watchOut: [
        {
          title: 'Temperature must be absolute (kelvin), not Celsius or Fahrenheit',
          body: 'The 1/T terms only make sense on an absolute scale with no offset zero — this calculator converts any Celsius or Fahrenheit input automatically, but a hand calculation using a Celsius reading directly gives a wrong answer.'
        },
        {
          title: 'ΔHvap is treated as constant, which is only an approximation',
          body: 'A real liquid’s enthalpy of vaporization decreases somewhat as temperature rises toward the critical point. The Clausius-Clapeyron equation assumes it stays fixed between T₁ and T₂, which is accurate enough for most general-chemistry problems over a moderate temperature range but is not exact.'
        },
        {
          title: 'The boiling point is where vapor pressure equals the surrounding pressure',
          body: 'A liquid boils at whatever temperature its vapor pressure reaches the ambient atmospheric pressure — not at a single fixed number. That is why water boils below 100°C at high altitude, where atmospheric pressure is lower: use this calculator with the local pressure as P₂ to estimate the boiling point there.'
        },
        {
          title: 'This is not the same equation as the ideal gas law',
          body: 'Both involve pressure and absolute temperature, but the ideal gas law (PV = nRT) describes a gas’s bulk behavior, while the Clausius-Clapeyron equation describes how a liquid’s own equilibrium vapor pressure changes with temperature — don’t mix the two formulas up.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §10.3 "Phase Transitions" (Clausius-Clapeyron equation and Example 10.7)', url: 'https://openstax.org/books/chemistry-2e/pages/10-3-phase-transitions' },
        { label: 'NIST CODATA, Molar Gas Constant', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?r' }
      ]
    },
    inputs: [
      { id: 'pressure1', label: 'Vapor pressure at T₁ (Pa)', type: 'number', placeholder: '10000', defaultValue: 10000, step: 1, min: 0 },
      { id: 'temperature1', label: 'Temperature 1 (K)', type: 'number', placeholder: '307.15', defaultValue: 307.15, step: 0.01, min: 0 },
      { id: 'pressure2', label: 'Vapor pressure at T₂ (Pa)', type: 'number', placeholder: '100000', defaultValue: 100000, step: 1, min: 0 },
      { id: 'temperature2', label: 'Temperature 2 (K)', type: 'number', placeholder: '371.95', defaultValue: 371.95, step: 0.01, min: 0 },
      { id: 'enthalpyVap', label: 'Enthalpy of vaporization (J/mol)', type: 'number', placeholder: '33750', defaultValue: 33750, step: 1, min: 0 }
    ],
    seo: {
      title: 'Vapor Pressure Calculator (Clausius-Clapeyron)',
      description: 'Free Clausius-Clapeyron calculator. Solve ln(P2/P1) = (ΔHvap/R)(1/T1 − 1/T2) for pressure, temperature, or enthalpy of vaporization.',
      faq: [
        { question: 'What is the Clausius-Clapeyron equation?', answer: 'ln(P₂/P₁) = (ΔHvap/R)(1/T₁ − 1/T₂), relating a liquid’s vapor pressure at two temperatures to its enthalpy of vaporization, ΔHvap, and the molar gas constant R.' },
        { question: 'What is isooctane’s enthalpy of vaporization?', answer: 'About 33.8 kJ/mol, computed from its vapor pressure rising from 10.0 kPa at 34.0°C to 100.0 kPa at 98.8°C.' },
        { question: 'Why does water boil at a lower temperature at high altitude?', answer: 'A liquid boils once its vapor pressure equals the surrounding pressure. Atmospheric pressure drops with altitude, so water’s vapor pressure reaches that lower value — and the liquid boils — at a temperature below 100°C.' },
        { question: 'Why does the formula need kelvin instead of Celsius?', answer: 'Because the equation uses 1/T directly, it only gives a correct ratio on an absolute temperature scale. This calculator converts any Celsius or Fahrenheit input to kelvin automatically.' },
        { question: 'Can I use this to predict a boiling point at a different pressure?', answer: 'Yes — enter a known boiling point (T₁ at P₁ = 1 atm, for example) and ΔHvap, then leave the temperature at the new pressure (T₂) as the auto field to solve for it.' },
        { question: 'Is ΔHvap exactly constant across all temperatures?', answer: 'No — it decreases somewhat as temperature rises toward a substance’s critical point. The Clausius-Clapeyron equation treats it as constant between the two temperatures used, which is a good approximation over a moderate range, not an exact law.' },
        { question: 'How is this different from the ideal gas law calculator?', answer: 'The ideal gas law relates a gas’s own pressure, volume, temperature, and amount. This calculator instead describes how a liquid’s equilibrium vapor pressure above its own surface changes with temperature — a different physical relationship that happens to also involve R and absolute temperature.' }
      ]
    },
    compute(values) {
      return {
        enthalpyVap:
          (8.31446261815324 * Math.log(values.pressure2 / values.pressure1)) / (1 / values.temperature1 - 1 / values.temperature2)
      };
    }
  },
  {
    id: 'rate-law-calculator',
    category: 'chemistry',
    glyph: 'rate',
    updatedAt: '2026-11-13',
    aliases: ['rate law calculator', 'reaction rate calculator', 'rate = k[a]^m[b]^n calculator', 'reaction order calculator', 'differential rate law calculator'],
    related: ['rate-constant-calculator', 'reaction-half-life-calculator', 'arrhenius-equation-calculator', 'equilibrium-constant-calculator'],
    title: 'Rate Law Calculator (rate = k[A]ᵘ[B]ᵛ)',
    description: 'Find a reaction’s instantaneous rate from its rate constant, reactant concentrations, and each reactant’s experimentally determined order.',
    example: 'For NO(g) + O₃(g) → NO₂(g) + O₂(g), with k = 2.20 × 10⁷ L/(mol·s) and both reactants first order, [NO] = 1.00 × 10⁻⁶ mol/L and [O₃] = 3.00 × 10⁻⁶ mol/L give a rate of 6.60 × 10⁻⁵ mol/(L·s).',
    content: {
      lastReviewed: '2026-11-13',
      concept: {
        title: 'What is a rate law?',
        paragraphs: [
          'A rate law is an experimentally determined equation that says how fast a reaction proceeds at any instant, given the concentrations present at that moment: rate = k[A]ᵘ[B]ᵛ. k is the rate constant (a fixed number at a given temperature, the same k the rate constant and Arrhenius equation calculators find or use), and u and v are the reaction orders in A and B — how sensitive the rate is to each reactant’s concentration. Orders are determined experimentally (OpenStax Chemistry 2e calls this "the method of initial rates") and are not simply read off the balanced equation’s coefficients.',
          'An order of 1 means doubling that reactant’s concentration doubles the rate; an order of 2 means doubling it quadruples the rate (2² = 4); an order of 0 means that reactant does not affect the rate at all once it is present. The overall reaction order is u + v. This calculator covers up to two reactants raised to their own orders and multiplied together — the general shape of most rate laws taught in a first general-chemistry course.',
          'This is a genuinely different question from the reaction half-life and rate constant calculators on this site: those use the integrated rate law, which describes how a concentration changes over time for a specific reaction order (first order, in both cases). This page instead uses the differential rate law — the instantaneous rate at one moment, from the concentrations present right then, for whatever order each reactant actually has.'
        ]
      },
      howTo: {
        intro: 'Enter the rate constant, each reactant’s concentration, and each reactant’s order (determined experimentally, not assumed from the equation’s coefficients).',
        steps: [
          { name: 'Find the rate constant, k, and each order', text: 'From an experiment (the method of initial rates) or a textbook problem that already states them.' },
          { name: 'Enter Reactant A’s concentration and order', text: '[A] in mol/L, and its order u.' },
          { name: 'Enter Reactant B’s concentration and order, if there is one', text: 'Leave B’s order at 0 for a reaction with only one reactant — a 0 order contributes a factor of 1 and drops it out.' },
          { name: 'Read the rate', text: 'rate = k[A]ᵘ[B]ᵛ appears immediately, along with the overall reaction order (u + v).' },
          { name: 'Check the sensitivity', text: 'The chart below shows how the rate changes if either reactant’s concentration doubles — a direct illustration of what each order actually means.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The rate law multiplies the rate constant by each reactant’s concentration raised to its own experimentally determined order.',
        expression: 'rate = k[A]ᵘ[B]ᵛ\noverall order = u + v',
        terms: [
          { symbol: 'rate', meaning: 'The reaction’s instantaneous rate at the given concentrations, in mol/(L·s) (or matching time unit).' },
          { symbol: 'k', meaning: 'The rate constant at a fixed temperature — its own units depend on the overall order, so no fixed unit menu is attached here.' },
          { symbol: '[A], [B]', meaning: 'Molar concentrations of up to two reactants, in mol/L.' },
          { symbol: 'u, v', meaning: 'The experimentally determined reaction order in A and B — typically a small positive integer, but can be 0, a fraction, or (rarely) negative.' }
        ],
        note: 'A reactant’s order is not necessarily its coefficient in the balanced equation — it must be measured, usually by seeing how the rate responds when that reactant’s starting concentration is changed while the others are held fixed.'
      },
      workedExample: {
        intro: 'NO(g) + O₃(g) → NO₂(g) + O₂(g) was found experimentally to be first order in both NO and O₃, with k = 2.20 × 10⁷ L/(mol·s). What is the rate when [NO] = 1.00 × 10⁻⁶ mol/L and [O₃] = 3.00 × 10⁻⁶ mol/L? (OpenStax Chemistry 2e, Example 12.4.)',
        rows: [
          { label: 'Rate law', value: 'rate = k[NO][O₃]' },
          { label: 'k', value: '2.20 × 10⁷ L/(mol·s)' },
          { label: '[NO]¹', value: '1.00 × 10⁻⁶ mol/L' },
          { label: '[O₃]¹', value: '3.00 × 10⁻⁶ mol/L' },
          { label: 'rate = 2.20×10⁷ × 1.00×10⁻⁶ × 3.00×10⁻⁶', value: '6.60 × 10⁻⁵ mol/(L·s)' }
        ],
        result: 'rate ≈ 6.60 × 10⁻⁵ mol/(L·s)',
        explanation: 'Multiplying the three numbers directly reproduces OpenStax’s own trial-1 data point exactly. Because both orders are 1 here, doubling either [NO] or [O₃] alone doubles the rate — the calculator’s own sensitivity chart shows this for the entered concentrations.'
      },
      watchOut: [
        {
          title: 'Reaction order is measured, not assumed from the coefficients',
          body: 'For NO + O₃ → NO₂ + O₂, both coefficients are 1 and both orders also happen to be 1 — but that is a coincidence of this particular reaction, not a general rule. Many real rate laws have orders that do not match their coefficients at all.'
        },
        {
          title: 'This is the differential rate law, not the integrated one',
          body: 'This page answers "how fast is the reaction right now, given these concentrations?" The reaction half-life and rate constant calculators instead answer "how does concentration change over time?" for a first-order reaction — a related but different question, using a different formula (one with time in it, not just concentration).'
        },
        {
          title: 'k’s units change with the overall reaction order',
          body: 'A first-order-overall reaction has k in s⁻¹; this second-order-overall example has k in L/(mol·s); a third-order-overall reaction needs L²/(mol²·s). Always check that k’s stated units match the orders you are using — plugging in a k with the wrong units gives a wrong rate.'
        },
        {
          title: 'A zero-order reactant still needs to be present',
          body: 'An order of 0 means the rate does not depend on that reactant’s concentration over the range studied — not that the reactant is irrelevant to the reaction. Zero order commonly shows up when a catalyst or enzyme is already saturated.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §12.3 "Rate Laws" (differential rate law, reaction order, and Example 12.4)', url: 'https://openstax.org/books/chemistry-2e/pages/12-3-rate-laws' }
      ]
    },
    inputs: [
      { id: 'rateConstant', label: 'Rate constant, k', type: 'number', placeholder: '22000000', defaultValue: 22000000, step: 1, min: 0 },
      { id: 'concentrationA', label: 'Reactant A concentration (mol/L)', type: 'number', placeholder: '0.000001', defaultValue: 0.000001, step: 0.0000001, min: 0 },
      { id: 'orderA', label: 'Reactant A order, u', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 },
      { id: 'concentrationB', label: 'Reactant B concentration (mol/L)', type: 'number', placeholder: '0.000003', defaultValue: 0.000003, step: 0.0000001, min: 0 },
      { id: 'orderB', label: 'Reactant B order, v', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'rate',
      headlineLabel: 'Reaction rate',
      outputs: [
        { id: 'rate', label: 'Reaction rate', format: 'significant' },
        { id: 'overallOrder', label: 'Overall reaction order (u + v)', format: 'number' }
      ],
      groups: [
        { title: 'Rate constant', inputs: ['rateConstant'] },
        { title: 'Reactant A', inputs: ['concentrationA', 'orderA'] },
        { title: 'Reactant B', inputs: ['concentrationB', 'orderB'] }
      ],
      derive: (values) => ({
        rateIfADoubled: values.rateConstant * (2 * values.concentrationA) ** values.orderA * values.concentrationB ** values.orderB,
        rateIfBDoubled: values.rateConstant * values.concentrationA ** values.orderA * (2 * values.concentrationB) ** values.orderB
      }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'rate', label: 'Current rate' },
          { from: 'rateIfADoubled', label: 'If [A] doubles' },
          { from: 'rateIfBDoubled', label: 'If [B] doubles' }
        ],
        title: 'How doubling each reactant changes the rate',
        highlight: 0
      }
    },
    seo: {
      title: 'Rate Law Calculator (rate = k[A]ᵘ[B]ᵛ)',
      description: 'Free rate law calculator. Find a reaction’s instantaneous rate from its rate constant, reactant concentrations, and orders, with a worked OpenStax example.',
      faq: [
        { question: 'How do I calculate a reaction’s rate from a rate law?', answer: 'Multiply the rate constant k by each reactant’s concentration raised to its own experimentally determined order: rate = k[A]ᵘ[B]ᵛ.' },
        { question: 'What is the rate for NO + O₃ → NO₂ + O₂ at [NO] = 1.00×10⁻⁶ M and [O₃] = 3.00×10⁻⁶ M?', answer: 'About 6.60 × 10⁻⁵ mol/(L·s), using k = 2.20 × 10⁷ L/(mol·s) and first order in each reactant.' },
        { question: 'How is reaction order determined?', answer: 'Experimentally — by measuring how the initial rate changes when one reactant’s starting concentration is varied while the others are held constant (the "method of initial rates"), not by reading the balanced equation’s coefficients.' },
        { question: 'What does a reaction order of 2 mean?', answer: 'Doubling that reactant’s concentration quadruples the rate (because 2² = 4), tripling it multiplies the rate by 9, and so on — the rate scales with the concentration raised to that power.' },
        { question: 'What is the difference between this and the rate constant calculator?', answer: 'This page uses the differential rate law to find the instantaneous rate from current concentrations. The rate constant calculator uses the integrated, first-order rate law instead, which relates concentration to elapsed time.' },
        { question: 'Can a reaction have more than two reactants?', answer: 'Yes, but this calculator covers the common two-reactant case. For a single-reactant reaction, leave Reactant B’s order at 0 so it contributes a factor of 1 and drops out.' },
        { question: 'Does k have the same units in every rate law?', answer: 'No — k’s units depend on the overall reaction order (u + v). A first-order-overall reaction uses s⁻¹; this example’s second-order-overall reaction uses L/(mol·s); higher overall orders need higher powers of L/mol.' }
      ]
    },
    compute(values) {
      return {
        rate: values.rateConstant * values.concentrationA ** values.orderA * values.concentrationB ** values.orderB,
        overallOrder: values.orderA + values.orderB
      };
    }
  },
  {
    id: 'oxidation-number-calculator',
    category: 'chemistry',
    glyph: 'ox',
    updatedAt: '2026-11-13',
    aliases: ['oxidation number calculator', 'oxidation state calculator', 'find the oxidation number calculator', 'oxidation number of an element calculator', 'redox oxidation state calculator'],
    related: ['faradays-law-electrolysis-calculator', 'equilibrium-constant-calculator', 'stoichiometry-calculator', 'empirical-formula-calculator'],
    title: 'Oxidation Number Calculator',
    description: 'Find an unknown element’s oxidation number in a compound or polyatomic ion from the known oxidation numbers of its other elements and the overall charge.',
    example: 'In the nitrate ion, NO₃⁻, oxygen is −2 and the overall charge is −1, so nitrogen’s oxidation number is +5.',
    content: {
      lastReviewed: '2026-11-13',
      concept: {
        title: 'What is an oxidation number?',
        paragraphs: [
          'An oxidation number (or oxidation state) is the charge an atom would have if every bond to a different element were treated as fully ionic — a bookkeeping device, not a real, measurable charge, but an extremely useful one for tracking which atoms gain or lose electron density in a reaction. OpenStax Chemistry 2e’s Section 17.1 states the central rule this calculator uses directly: the sum of every atom’s oxidation number, each multiplied by how many of that atom are present, equals the overall charge on the molecule or ion.',
          'A handful of elements have oxidation numbers fixed by convention in almost every compound — oxygen is −2 (except in peroxides), hydrogen is +1 when bonded to a nonmetal, and group 1/2 metals are always +1/+2 — which is exactly what makes the method work: knowing those fixed values lets the one remaining, unknown element be found by simple subtraction.',
          'This calculator covers up to three elements with already-known oxidation numbers (entered directly) plus one unknown element, and solves charge = Σ(known oxidation number × count) + (unknown oxidation number × count) for the unknown.'
        ]
      },
      howTo: {
        intro: 'Enter the overall charge on the species (0 for a neutral compound), the oxidation number and atom count of each already-known element, and the atom count of the unknown element.',
        steps: [
          { name: 'Write the formula and its overall charge', text: 'A neutral compound has charge 0; a polyatomic ion uses its own charge, e.g. −1 for NO₃⁻.' },
          { name: 'Identify every element whose oxidation number you already know', text: 'Usually from the fixed conventions: O is −2, H is +1 with a nonmetal, group 1 metals are +1.' },
          { name: 'Enter each known element’s oxidation number and atom count', text: 'Leave an unused slot’s count at 0 if there are fewer than three known elements.' },
          { name: 'Enter the unknown element’s atom count', text: 'How many atoms of the element you are solving for appear in the formula.' },
          { name: 'Read the unknown’s oxidation number', text: 'It fills in immediately, solved so every atom’s contribution sums to the overall charge.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The sum of every atom’s oxidation number times its count equals the species’ overall charge; isolating the unknown term gives its oxidation number.',
        expression: 'charge = Σ(known oxidation numberᵢ × countᵢ) + (unknown oxidation number × unknown count)\nunknown oxidation number = [charge − Σ(known oxidation numberᵢ × countᵢ)] ÷ unknown count',
        terms: [
          { symbol: 'charge', meaning: 'The overall charge on the molecule or ion — 0 for a neutral compound.' },
          { symbol: 'known oxidation numberᵢ, countᵢ', meaning: 'An already-known element’s oxidation number and how many atoms of it appear.' },
          { symbol: 'unknown oxidation number, unknown count', meaning: 'The element being solved for, and its own atom count in the formula.' }
        ],
        note: 'A slot left at count 0 contributes nothing to the sum, which is what lets a formula with fewer than three known elements use the same general calculator.'
      },
      workedExample: {
        intro: 'What is nitrogen’s oxidation number in the nitrate ion, NO₃⁻? (OpenStax Chemistry 2e, §17.1 "Review of Redox Chemistry.")',
        rows: [
          { label: 'Overall charge', value: '−1' },
          { label: 'Oxygen’s oxidation number × count', value: '−2 × 3 = −6' },
          { label: 'Nitrogen’s count', value: '1' },
          { label: 'Nitrogen’s oxidation number = (−1 − (−6)) ÷ 1', value: '(−1 + 6) ÷ 1 = +5' }
        ],
        result: 'Nitrogen’s oxidation number = +5',
        explanation: 'Oxygen contributes −6 total (3 atoms at −2 each); the ion’s charge is −1, so nitrogen’s own contribution must be −1 − (−6) = +5, and since there is only one nitrogen atom, its oxidation number is +5 — exactly OpenStax’s own stated value for this ion.'
      },
      watchOut: [
        {
          title: 'Oxygen is −2 almost always, but not in peroxides',
          body: 'In peroxides (like H₂O₂) and superoxides, oxygen’s oxidation number is −1 or −½ instead of the usual −2 — check for those special cases before assuming −2.'
        },
        {
          title: 'An oxidation number can be a fraction when it is really an average',
          body: 'Some formulas (like Fe₃O₄, magnetite) contain the same element in two genuinely different oxidation states at once. This calculator’s result is then the average oxidation number across all atoms of that element, not the state of any one specific atom.'
        },
        {
          title: 'Count every atom of the unknown element, not just one',
          body: 'If the unknown element appears twice in the formula (like chromium in Cr₂O₇²⁻), its count must be 2 — using 1 by mistake doubles the resulting oxidation number.'
        },
        {
          title: 'This is not the same as an atom’s real formal charge or ionic charge',
          body: 'Oxidation number is a bookkeeping convention that treats every bond to a different element as fully ionic, even in compounds that are mostly covalent. It is extremely useful for balancing redox reactions, but it does not describe the atom’s actual measured charge.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §17.1 "Review of Redox Chemistry" (oxidation number rules and the NO₃⁻ example)', url: 'https://openstax.org/books/chemistry-2e/pages/17-1-review-of-redox-chemistry' }
      ]
    },
    inputs: [
      { id: 'overallCharge', label: 'Overall charge on the ion or molecule', type: 'number', placeholder: '-1', defaultValue: -1, step: 1 },
      { id: 'element1Oxidation', label: 'Known element 1, oxidation number', type: 'number', placeholder: '-2', defaultValue: -2, step: 1 },
      { id: 'element1Count', label: 'Known element 1, atom count', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 0 },
      { id: 'element2Oxidation', label: 'Known element 2, oxidation number', type: 'number', placeholder: '0', defaultValue: 0, step: 1 },
      { id: 'element2Count', label: 'Known element 2, atom count', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 },
      { id: 'element3Oxidation', label: 'Known element 3, oxidation number', type: 'number', placeholder: '0', defaultValue: 0, step: 1 },
      { id: 'element3Count', label: 'Known element 3, atom count', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 },
      { id: 'unknownCount', label: 'Unknown element, atom count', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 }
    ],
    breakdown: {
      headline: 'unknownOxidation',
      headlineLabel: 'Unknown element’s oxidation number',
      outputs: [
        { id: 'unknownOxidation', label: 'Unknown element’s oxidation number', format: 'number' },
        { id: 'knownSum', label: 'Known elements’ total contribution', format: 'number' },
        { id: 'unknownContribution', label: 'Unknown element’s total contribution', format: 'number' }
      ],
      groups: [
        { title: 'Overall charge', inputs: ['overallCharge'] },
        { title: 'Known elements', inputs: ['element1Oxidation', 'element1Count', 'element2Oxidation', 'element2Count', 'element3Oxidation', 'element3Count'] },
        { title: 'Unknown element', inputs: ['unknownCount'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'knownSum', label: 'Known elements’ total' },
          { from: 'unknownContribution', label: 'Unknown element’s total' },
          { from: 'overallCharge', label: 'Overall charge' }
        ],
        title: 'Charge balance check',
        highlight: 1
      }
    },
    seo: {
      title: 'Oxidation Number Calculator',
      description: 'Free oxidation number calculator. Find an unknown element’s oxidation state from the known elements’ oxidation numbers and the overall charge.',
      faq: [
        { question: 'How do I find an unknown element’s oxidation number?', answer: 'Multiply each known element’s oxidation number by its atom count, add them up, subtract that sum from the overall charge, then divide by the unknown element’s own atom count.' },
        { question: 'What is nitrogen’s oxidation number in NO₃⁻?', answer: '+5. Oxygen contributes 3 × (−2) = −6, and the ion’s charge is −1, so nitrogen’s contribution is −1 − (−6) = +5.' },
        { question: 'What is manganese’s oxidation number in KMnO₄?', answer: '+7. Potassium is +1 and oxygen is −2 × 4 = −8, so for the neutral compound (charge 0), manganese must contribute 0 − (1 − 8) = +7.' },
        { question: 'What is chromium’s oxidation number in Cr₂O₇²⁻?', answer: '+6. Oxygen contributes 7 × (−2) = −14; the ion’s charge is −2, so the two chromium atoms together contribute −2 − (−14) = +12, or +6 each.' },
        { question: 'What is the oxidation number of an atom in its elemental form?', answer: 'Always 0 — by convention, an atom in a pure element (O₂, Fe metal, Na metal) has no oxidation number assigned, since there is no other element present to compare it to.' },
        { question: 'Is oxygen always −2?', answer: 'Almost always, except in peroxides (like H₂O₂, where it is −1) and superoxides (−½) — those are the standard exceptions general chemistry courses flag.' },
        { question: 'Can an oxidation number be a fraction?', answer: 'Yes, when a formula contains the same element in more than one real oxidation state at once (like Fe₃O₄) — the calculator then returns the average across all atoms of that element, not any single atom’s actual state.' }
      ]
    },
    compute(values) {
      const knownSum = values.element1Oxidation * values.element1Count + values.element2Oxidation * values.element2Count + values.element3Oxidation * values.element3Count;
      const unknownOxidation = (values.overallCharge - knownSum) / values.unknownCount;
      return {
        unknownOxidation,
        knownSum,
        unknownContribution: unknownOxidation * values.unknownCount
      };
    }
  },
  {
    id: 'molarity-molality-conversion-calculator',
    category: 'chemistry',
    glyph: 'M⇄b',
    updatedAt: '2026-11-13',
    aliases: ['molarity to molality calculator', 'molality to molarity calculator', 'convert molarity to molality calculator', 'molarity molality conversion calculator', 'concentration unit conversion calculator'],
    related: ['molarity-calculator', 'molality-calculator', 'mass-percent-calculator', 'density-of-solutions-calculator'],
    title: 'Molarity to Molality Conversion Calculator',
    description: 'Convert between molarity (mol per liter of solution) and molality (mol per kilogram of solvent) using the solution’s density and the solute’s molar mass.',
    example: 'A 0.556 mol/L glucose solution with a density of 1.04 g/mL and a molar mass of 180.16 g/mol works out to a molality of about 0.59 mol/kg.',
    solver: {
      defaultTarget: 'molality',
      variables: [
        { id: 'molarity', label: 'Molarity', symbol: 'M', dimension: 'concentration', defaultValue: 556, defaultUnit: 'mol/L' },
        { id: 'molality', label: 'Molality', symbol: 'b', dimension: 'molality', defaultValue: 0.5916, defaultUnit: 'mol/kg' },
        { id: 'density', label: 'Solution density', symbol: 'ρ', dimension: 'density', defaultValue: 1040, defaultUnit: 'g/cm3' },
        { id: 'molarMass', label: 'Solute molar mass', symbol: 'M_r', dimension: 'molarMass', defaultValue: 0.18016, defaultUnit: 'g/mol', fixed: true }
      ],
      solve: {
        molality: ({ molarity, density, molarMass }) =>
          density - molarity * molarMass === 0 ? NaN : molarity / (density - molarity * molarMass),
        molarity: ({ molality, density, molarMass }) => (molality * density) / (1 + molality * molarMass),
        density: ({ molarity, molality, molarMass }) => (molality === 0 ? NaN : molarity / molality + molarity * molarMass)
      },
      outputs: [
        { id: 'massPercent', label: 'Mass percent of solute', dimension: 'percent', unit: '%', compute: (si) => (si.molarity * si.molarMass * 100) / si.density }
      ]
    },
    content: {
      lastReviewed: '2026-11-13',
      concept: {
        title: 'Why convert between molarity and molality?',
        paragraphs: [
          'Molarity (M, mol of solute per liter of solution) and molality (b, mol of solute per kilogram of solvent) answer closely related but genuinely different questions, and lab data often arrives in whichever one a particular instrument or method reports. Converting between them needs one extra piece of information neither concentration unit carries on its own: the solution’s density, which ties "per liter of solution" to "per kilogram of solvent" by way of the solute’s own molar mass.',
          'The idea, following OpenStax Chemistry 2e’s own method (Example 11.5): take exactly one liter of solution. Its total mass comes from the density; the mass of solute in that liter comes from the molarity and molar mass; subtracting the two leaves the mass of solvent, and dividing the same mole count by that solvent mass (in kilograms) gives the molality.',
          'This calculator rearranges that same relationship, b = M ÷ (ρ − M×M_r), into a four-variable solver, so it can also go the other direction — convert a known molality back to molarity, or find the density a particular pair of concentration readings implies.'
        ]
      },
      howTo: {
        intro: 'Enter the solute’s molar mass (fixed, since it depends only on which compound you have), plus any two of molarity, molality, and density — the third fills in automatically.',
        steps: [
          { name: 'Enter the solute’s molar mass', text: 'From the molar mass calculator or a periodic table — this stays fixed, since it is a property of the compound, not a measurement being solved for.' },
          { name: 'Enter the solution’s density', text: 'Measured with a hydrometer or density meter, usually in g/mL (numerically the same as g/cm³).' },
          { name: 'Enter the known concentration', text: 'Molarity (mol/L) if that is what you measured, or molality (mol/kg) if that is what you measured.' },
          { name: 'Read the converted concentration', text: 'The other concentration unit fills in automatically, along with the solute’s mass percent of the whole solution.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Per liter of solution, mass of solution minus mass of solute leaves the solvent mass that molality is measured against.',
        expression: 'b = M ÷ (ρ − M×M_r)\nM = b×ρ ÷ (1 + b×M_r)\nρ = M÷b + M×M_r',
        terms: [
          { symbol: 'M', meaning: 'Molarity: moles of solute per liter of solution.' },
          { symbol: 'b', meaning: 'Molality: moles of solute per kilogram of solvent.' },
          { symbol: 'ρ', meaning: 'The solution’s density (mass per volume).' },
          { symbol: 'M_r', meaning: 'The solute’s molar mass — a fixed property of the compound, entered here rather than solved for.' }
        ],
        note: 'All four quantities are converted to consistent SI units before solving (mol/m³, mol/kg, kg/m³, kg/mol) and converted back to your chosen display units afterward.'
      },
      workedExample: {
        intro: 'A glucose solution is 0.556 mol/L and has a density of 1.04 g/mL. Glucose’s molar mass is 180.16 g/mol. What is the solution’s molality? (OpenStax Chemistry 2e, Example 11.5.)',
        rows: [
          { label: 'Mass of 1 L of solution (1.04 g/mL × 1000 mL)', value: '1040 g' },
          { label: 'Moles of glucose in that liter', value: '0.556 mol' },
          { label: 'Mass of that glucose (0.556 × 180.16)', value: '100.2 g' },
          { label: 'Mass of water/solvent (1040 − 100.2)', value: '939.8 g = 0.9398 kg' },
          { label: 'Molality = 0.556 mol ÷ 0.9398 kg', value: '≈ 0.592 mol/kg' }
        ],
        result: 'Molality ≈ 0.59 mol/kg',
        explanation: 'Carrying full precision through every step gives 0.5916 mol/kg, which rounds to OpenStax’s own stated 0.59 m. Solving the same relationship back the other direction — given this molality, density, and molar mass — reproduces the original 0.556 mol/L exactly, confirming the conversion is reversible.'
      },
      watchOut: [
        {
          title: 'Molality’s denominator is solvent mass, not solution mass',
          body: 'Molarity divides by the whole solution’s volume; molality divides by only the solvent’s mass, with the solute’s own mass already subtracted out — mixing the two denominators up is the most common mistake in this conversion.'
        },
        {
          title: 'This needs the solution’s actual density, not pure solvent’s density',
          body: 'Using pure water’s density (about 1.00 g/mL) instead of the actual solution’s measured density (1.04 g/mL here) gives a noticeably wrong answer once the solute makes up more than a trivial fraction of the mass.'
        },
        {
          title: 'Molality does not change with temperature; molarity does',
          body: 'Because molality is defined by mass, not volume, it stays constant as a solution expands or contracts with temperature — one reason it is the concentration unit used in colligative-property formulas (freezing-point depression, boiling-point elevation). Molarity shifts slightly with temperature because volume does.'
        },
        {
          title: 'This is a different question from the mass percent calculator',
          body: 'Mass percent describes solute mass as a share of total solution mass directly. This page instead converts between two mole-based concentration units using density as the bridge — related, but not the same calculation.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §11.4 "Colligative Properties" (molality definition and Example 11.5, molarity-to-molality via density)', url: 'https://openstax.org/books/chemistry-2e/pages/11-4-colligative-properties' }
      ]
    },
    inputs: [
      { id: 'molarity', label: 'Molarity (mol/m³)', type: 'number', placeholder: '556', defaultValue: 556, step: 1, min: 0 },
      { id: 'molality', label: 'Molality (mol/kg)', type: 'number', placeholder: '0.5916', defaultValue: 0.5916, step: 0.0001, min: 0 },
      { id: 'density', label: 'Solution density (kg/m³)', type: 'number', placeholder: '1040', defaultValue: 1040, step: 1, min: 0 },
      { id: 'molarMass', label: 'Solute molar mass (kg/mol)', type: 'number', placeholder: '0.18016', defaultValue: 0.18016, step: 0.00001, min: 0 }
    ],
    seo: {
      title: 'Molarity to Molality Conversion Calculator',
      description: 'Free molarity-molality converter. Convert between mol/L and mol/kg using a solution’s density and molar mass, with a worked OpenStax glucose example.',
      faq: [
        { question: 'How do I convert molarity to molality?', answer: 'Find the mass of solute and solvent in exactly 1 liter of solution using the density and molar mass, then divide the moles of solute by the solvent’s mass in kilograms: b = M ÷ (ρ − M×M_r).' },
        { question: 'What is the molality of a 0.556 mol/L glucose solution with density 1.04 g/mL?', answer: 'About 0.59 mol/kg, using glucose’s 180.16 g/mol molar mass.' },
        { question: 'Why isn’t molarity just equal to molality?', answer: 'Molarity divides by the solution’s volume; molality divides by only the solvent’s mass. The two match closely only in a very dilute aqueous solution, where solution mass and volume both track pure water’s almost exactly.' },
        { question: 'Do I need the solute’s molar mass to convert between molarity and molality?', answer: 'Yes — it is what lets the calculator work out how much of the solution’s total mass is solute versus solvent, which is the step the conversion depends on.' },
        { question: 'Does this conversion depend on temperature?', answer: 'Molarity does (since volume expands slightly with temperature); molality does not (since it is mass-based). The solution’s density used here should match the temperature at which the molarity was measured.' },
        { question: 'What if I only know the mass percent of solute, not molarity or molality?', answer: 'Use the mass percent calculator or the molality calculator directly from mass figures instead — this page specifically bridges molarity and molality using density, not mass percent.' },
        { question: 'Is this the same as dilution?', answer: 'No — dilution (C₁V₁ = C₂V₂) describes adding solvent to change one solution’s concentration into a new one. This calculator instead re-expresses one fixed solution’s existing concentration in a different unit.' }
      ]
    },
    compute(values) {
      const denominator = values.density - values.molarity * values.molarMass;
      return { molality: denominator === 0 ? NaN : values.molarity / denominator };
    }
  },
  {
    id: 'calorimetry-enthalpy-calculator',
    category: 'chemistry',
    glyph: 'ΔH',
    updatedAt: '2026-11-13',
    aliases: ['calorimetry calculator', 'enthalpy of reaction calculator', 'heat of reaction calculator', 'molar enthalpy calculator', 'calorimeter heat calculator'],
    related: ['gibbs-free-energy-calculator', 'molarity-calculator', 'arrhenius-equation-calculator', 'moles-to-grams-calculator'],
    title: 'Calorimetry Enthalpy Calculator (ΔH from q = mcΔT)',
    description: 'Find a reaction’s molar enthalpy change from calorimetry data — the solution’s mass, specific heat, and temperature change, divided by the moles of limiting reactant.',
    example: 'Mixing 50.0 mL of 1.00 M HCl with 50.0 mL of 1.00 M NaOH raises 100 g of combined solution from 22.0°C to 28.9°C, giving an enthalpy of neutralization of about −57.7 kJ/mol.',
    solver: {
      defaultTarget: 'enthalpy',
      variables: [
        { id: 'mass', label: 'Mass of solution', symbol: 'm', dimension: 'mass', defaultValue: 100, defaultUnit: 'g' },
        { id: 'specificHeat', label: 'Specific heat of solution', symbol: 'c', dimension: 'specificHeat', defaultValue: 4.184, defaultUnit: 'J/gK' },
        { id: 'deltaT', label: 'Temperature change', symbol: 'ΔT', dimension: 'temperatureDelta', defaultValue: 6.9, defaultUnit: 'C' },
        { id: 'moles', label: 'Moles of limiting reactant', symbol: 'n', dimension: 'amountOfSubstance', defaultValue: 0.05, defaultUnit: 'mol' },
        { id: 'enthalpy', label: 'Molar enthalpy change', symbol: 'ΔH', dimension: 'molarEnergy', defaultValue: -57.74, defaultUnit: 'kJ/mol' }
      ],
      solve: {
        enthalpy: ({ mass, specificHeat, deltaT, moles }) => (moles === 0 ? NaN : -(mass * specificHeat * deltaT) / moles),
        mass: ({ enthalpy, specificHeat, deltaT, moles }) => (specificHeat === 0 || deltaT === 0 ? NaN : -(moles * enthalpy) / (specificHeat * deltaT)),
        specificHeat: ({ enthalpy, mass, deltaT, moles }) => (mass === 0 || deltaT === 0 ? NaN : -(moles * enthalpy) / (mass * deltaT)),
        deltaT: ({ enthalpy, mass, specificHeat, moles }) => (mass === 0 || specificHeat === 0 ? NaN : -(moles * enthalpy) / (mass * specificHeat)),
        moles: ({ enthalpy, mass, specificHeat, deltaT }) => (enthalpy === 0 ? NaN : -(mass * specificHeat * deltaT) / enthalpy)
      },
      outputs: [
        { id: 'heatReleased', label: 'Heat released by the reaction', dimension: 'energy', unit: 'kJ', compute: (si) => -(si.mass * si.specificHeat * si.deltaT) }
      ]
    },
    content: {
      lastReviewed: '2026-11-13',
      concept: {
        title: 'What is calorimetry, and how does it give a molar enthalpy?',
        paragraphs: [
          'Calorimetry measures a reaction’s heat indirectly, by watching its effect on the temperature of the solution it happens in. For a reaction run in a simple insulated container, OpenStax Chemistry 2e’s §5.2 "Calorimetry" gives the heat gained by the solution as q = mcΔT (mass, specific heat, and temperature change). Because the container is assumed to exchange no heat with the outside world, the heat the reaction itself released or absorbed is the negative of that: q_reaction = −q_solution — an exothermic reaction heats the solution up, so it releases heat while the solution gains it.',
          'That heat, on its own, describes only the specific amount of reactant actually used in the experiment. Dividing q_reaction by the moles of the limiting reactant converts it into an intensive, per-mole quantity — the molar enthalpy of reaction, ΔH — that describes the reaction itself, independent of how much was mixed. This is the same calorimetry-to-ΔH pipeline used to measure a neutralization, a dissolution, or a combustion’s enthalpy in an undergraduate lab.',
          'This calculator is distinct from the heat calculator elsewhere on this site, which only computes q = mcΔT itself (a specific amount of heat for a specific sample). This page takes that same relationship one step further, dividing by moles reacted to get a reusable, per-mole enthalpy figure — and it carries the sign (negative for exothermic, positive for endothermic) that convention attaches to ΔH.'
        ]
      },
      howTo: {
        intro: 'Enter the solution’s mass, its specific heat, the temperature change it underwent, and the moles of the limiting reactant that caused that change.',
        steps: [
          { name: 'Measure or compute the moles of limiting reactant', text: 'From the volume and molarity of the smaller or limiting solution — 50.0 mL × 1.00 mol/L = 0.0500 mol, for example.' },
          { name: 'Measure the combined solution’s mass', text: 'Often approximated as the combined volume times water’s density (1 g/mL), when the solutions are dilute.' },
          { name: 'Enter the specific heat', text: 'Dilute aqueous solutions are commonly approximated as water’s own specific heat, 4.184 J/(g·°C).' },
          { name: 'Enter the temperature change, ΔT', text: 'Final temperature minus initial temperature — positive for a temperature rise (exothermic reaction).' },
          { name: 'Read the molar enthalpy, ΔH', text: 'Negative means the reaction released heat (exothermic); positive means it absorbed heat (endothermic). The heat actually released or absorbed in the experiment appears as a bonus figure.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The solution’s measured temperature change gives the heat it absorbed; the reaction released (or absorbed) the opposite amount, which is then divided by moles reacted.',
        expression: 'q_solution = m × c × ΔT\nq_reaction = −q_solution\nΔH = q_reaction ÷ n = −(m × c × ΔT) ÷ n',
        terms: [
          { symbol: 'm', meaning: 'Mass of the solution undergoing the temperature change (often the combined mass of two mixed solutions).' },
          { symbol: 'c', meaning: 'Specific heat of the solution — commonly approximated as water’s, 4.184 J/(g·°C), for dilute aqueous solutions.' },
          { symbol: 'ΔT', meaning: 'Final temperature minus initial temperature.' },
          { symbol: 'n', meaning: 'Moles of the limiting reactant that reacted.' },
          { symbol: 'ΔH', meaning: 'The reaction’s molar enthalpy change — negative (exothermic) or positive (endothermic).' }
        ],
        note: 'This calculator assumes the calorimeter itself absorbs no significant heat (a bare-bones "coffee cup" calorimeter) — a real bomb or flame calorimeter needs its own heat capacity added into the balance, which this simplified formula does not include.'
      },
      workedExample: {
        intro: '50.0 mL of 1.00 M HCl and 50.0 mL of 1.00 M NaOH, both at 22.0°C, are mixed; the combined solution’s temperature rises to 28.9°C. What is the molar enthalpy of neutralization? (OpenStax Chemistry 2e, Example 5.5.)',
        rows: [
          { label: 'Combined mass (two 50.0 mL portions, ≈1.00 g/mL)', value: '≈ 100 g' },
          { label: 'Specific heat (dilute aqueous solution ≈ water)', value: '4.184 J/(g·°C)' },
          { label: 'ΔT (28.9 − 22.0)', value: '6.9°C' },
          { label: 'q_solution = 100 × 4.184 × 6.9', value: '≈ 2887 J ≈ 2.9 kJ' },
          { label: 'q_reaction = −q_solution', value: '≈ −2.9 kJ' },
          { label: 'Moles reacted (50.0 mL × 1.00 mol/L)', value: '0.0500 mol' },
          { label: 'ΔH = q_reaction ÷ n = −2.887 kJ ÷ 0.0500 mol', value: '≈ −57.7 kJ/mol' }
        ],
        result: 'ΔH ≈ −57.7 kJ/mol (exothermic)',
        explanation: 'Carrying full precision through every step gives −57.7 kJ/mol. OpenStax’s own worked solution rounds q_solution to 2.9 × 10³ J before stating q_reaction as −2.9 kJ; dividing that already-rounded figure by 0.0500 mol gives −58 kJ/mol — the two-tenths-of-a-kJ gap is an intermediate-rounding artifact, not a disagreement over the formula.'
      },
      watchOut: [
        {
          title: 'The sign convention matters: negative means exothermic',
          body: 'A temperature rise (solution gains heat) means the reaction released heat, so ΔH comes out negative. A temperature drop gives a positive ΔH, for an endothermic reaction that absorbs heat from the solution.'
        },
        {
          title: 'Divide by moles of the limiting reactant, not the total moles mixed',
          body: 'When two reactants are mixed in a 1:1 stoichiometric ratio with equal moles (as in this worked example), it does not matter which one you call "limiting" — but for an unequal mixture, using the wrong reactant’s mole count gives a wrong per-mole answer.'
        },
        {
          title: 'This simplified formula assumes the calorimeter itself absorbs no heat',
          body: 'A real calorimeter (the cup, the thermometer, a stirrer) has some heat capacity of its own. For a simple coffee-cup calorimeter with dilute aqueous solutions, that is usually small enough to ignore, but a bomb calorimeter’s own heat capacity is a measured, necessary correction this basic formula skips.'
        },
        {
          title: 'This is not the same calculation as the physics heat calculator',
          body: 'The heat calculator elsewhere on this site stops at q = mcΔT — the actual heat for a specific sample. This page takes that result one step further, dividing by moles reacted to get a reusable, per-mole enthalpy figure with a sign convention attached.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §5.2 "Calorimetry" (q = mcΔT and Example 5.5, HCl-NaOH neutralization)', url: 'https://openstax.org/books/chemistry-2e/pages/5-2-calorimetry' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass of solution (g)', type: 'number', placeholder: '100', defaultValue: 100, step: 0.1, min: 0 },
      { id: 'specificHeat', label: 'Specific heat of solution (J/(g·°C))', type: 'number', placeholder: '4.184', defaultValue: 4.184, step: 0.001, min: 0 },
      { id: 'deltaT', label: 'Temperature change (°C)', type: 'number', placeholder: '6.9', defaultValue: 6.9, step: 0.1, min: 0 },
      { id: 'moles', label: 'Moles of limiting reactant (mol)', type: 'number', placeholder: '0.05', defaultValue: 0.05, step: 0.001, min: 0 }
    ],
    seo: {
      title: 'Calorimetry Enthalpy Calculator (ΔH = -mcΔT/n)',
      description: 'Free calorimetry calculator. Find a reaction’s molar enthalpy change from mass, specific heat, temperature change, and moles reacted.',
      faq: [
        { question: 'How do I find enthalpy of reaction from calorimetry data?', answer: 'Compute q = mcΔT for the heat the solution gained, flip its sign to get the heat the reaction released or absorbed, then divide by the moles of limiting reactant: ΔH = −(mcΔT) ÷ n.' },
        { question: 'What is the enthalpy of neutralization for HCl + NaOH?', answer: 'About −57.7 kJ/mol, from 100 g of combined solution rising 6.9°C after mixing 0.0500 mol of each reactant.' },
        { question: 'Why is ΔH negative for this reaction?', answer: 'Because the solution’s temperature rose, meaning the reaction released heat into it — an exothermic reaction, which by convention gets a negative ΔH.' },
        { question: 'What specific heat should I use for a dilute aqueous solution?', answer: '4.184 J/(g·°C), the specific heat of water, is the standard approximation when the solution is mostly water — the same value OpenStax’s own worked example uses.' },
        { question: 'Does this calculator account for the calorimeter’s own heat capacity?', answer: 'No — it assumes a simple, well-insulated container (like a foam cup) that absorbs a negligible amount of heat itself. A bomb calorimeter needs its own heat-capacity correction added separately.' },
        { question: 'How is this different from the heat calculator (Q = mcΔT)?', answer: 'The heat calculator finds the actual heat for one specific sample. This page goes one step further, flipping the sign for the reaction and dividing by moles reacted to get a reusable molar enthalpy figure.' },
        { question: 'Can this calculator solve for mass, specific heat, temperature change, or moles instead?', answer: 'Yes — enter a known ΔH and leave any one of the other four fields as the auto-calculated one, and the same formula solves for it.' }
      ]
    },
    compute(values) {
      return { enthalpy: values.moles === 0 ? NaN : -(values.mass * values.specificHeat * values.deltaT) / values.moles };
    }
  },
  {
    id: 'ksp-molar-solubility-calculator',
    category: 'chemistry',
    glyph: 'Ksp',
    updatedAt: '2026-11-13',
    aliases: ['ksp calculator', 'solubility product calculator', 'molar solubility calculator', 'ksp to molar solubility calculator', 'solubility product constant calculator'],
    related: ['common-ion-effect-calculator', 'equilibrium-constant-calculator', 'molarity-calculator', 'solution-concentration-calculator'],
    title: 'Ksp (Solubility Product) Calculator',
    description: 'Find a slightly soluble salt’s molar solubility from its solubility product constant (Ksp) and its cation-to-anion dissociation ratio — works for any stoichiometry, not just 1:1 salts.',
    example: 'Copper(I) bromide, CuBr, dissociates 1:1 (CuBr ⇌ Cu⁺ + Br⁻) and has Ksp = 6.3 × 10⁻⁹, so its molar solubility is √(6.3 × 10⁻⁹) ≈ 7.9 × 10⁻⁵ mol/L.',
    content: {
      lastReviewed: '2026-11-13',
      concept: {
        title: 'What is the solubility product constant, Ksp?',
        paragraphs: [
          'Most ionic compounds dissolve in water to some extent, but "slightly soluble" salts like AgCl or CaF₂ reach an equilibrium where only a tiny, fixed concentration of dissolved ions coexists with the undissolved solid. OpenStax Chemistry 2e’s §15.1 "Precipitation and Dissolution" calls the equilibrium constant for that balance the solubility product, Ksp — for CuBr(s) ⇌ Cu⁺(aq) + Br⁻(aq), Ksp = [Cu⁺][Br⁻], and more generally, for MₚXᵧ(s) ⇌ p Mⁿ⁺(aq) + q Xᵏ⁻(aq), Ksp = [Mⁿ⁺]ᵖ[Xᵏ⁻]ᵠ.',
          'Because every ion in that equilibrium comes from the same dissolving salt, both ion concentrations are tied to a single unknown: the molar solubility, s — the number of moles of the salt that dissolve per liter before the solution saturates. For a salt that dissociates into p cations and q anions, [Mⁿ⁺] = p×s and [Xᵏ⁻] = q×s, which turns Ksp = (p×s)ᵖ(q×s)ᵠ into a closed-form equation for s: s = (Ksp ÷ (pᵖqᵠ))^(1 ÷ (p+q)).',
          'This calculator solves that equation for any cation-to-anion ratio, not just the simplest 1:1 case — enter Ksp plus the two coefficients from the salt’s own dissociation equation, and it returns the molar solubility along with each ion’s own equilibrium concentration.'
        ]
      },
      howTo: {
        intro: 'Enter the salt’s Ksp value and its dissociation coefficients; the molar solubility and each ion’s concentration fill in automatically.',
        steps: [
          { name: 'Look up or write down the Ksp value', text: 'From a textbook’s Ksp table or a given problem, e.g. 6.3 × 10⁻⁹ for CuBr.' },
          { name: 'Write the dissociation equation', text: 'MₚXᵧ(s) ⇌ p Mⁿ⁺(aq) + q Xᵏ⁻(aq) — read off p (the cation’s coefficient) and q (the anion’s coefficient). CuBr is 1 and 1; Ca(OH)₂ is 1 and 2.' },
          { name: 'Enter both coefficients', text: 'Most salts in a general-chemistry course use small whole numbers, usually 1, 2, or 3.' },
          { name: 'Read the molar solubility and ion concentrations', text: 'The molar solubility, s, is how many moles of the whole salt dissolve per liter; the ion concentrations show how that splits between the cation and anion once the coefficients are applied.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Each ion’s equilibrium concentration is its coefficient times the molar solubility, so Ksp reduces to one equation in one unknown, s.',
        expression: 'MₚXᵧ(s) ⇌ p Mⁿ⁺(aq) + q Xᵏ⁻(aq)\nKsp = (p×s)ᵖ × (q×s)ᵠ\ns = (Ksp ÷ (pᵖ × qᵠ))^(1 ÷ (p+q))',
        terms: [
          { symbol: 'Ksp', meaning: 'The solubility product constant for the salt, at a given temperature.' },
          { symbol: 's', meaning: 'Molar solubility: moles of the salt that dissolve per liter of solution.' },
          { symbol: 'p, q', meaning: 'The cation’s and anion’s coefficients in the balanced dissociation equation.' }
        ],
        note: 'Going the other direction — finding Ksp from a measured molar solubility — uses the same relationship directly: Ksp = (p×s)ᵖ(q×s)ᵠ, with s already known instead of solved for.'
      },
      workedExample: {
        intro: 'Calcium hydroxide, Ca(OH)₂, has Ksp = 1.3 × 10⁻⁶ and dissociates as Ca(OH)₂(s) ⇌ Ca²⁺(aq) + 2OH⁻(aq) — an unequal, 1:2 ratio. What is its molar solubility? (OpenStax Chemistry 2e, Example 15.4.)',
        rows: [
          { label: 'Coefficients', value: 'p = 1 (Ca²⁺), q = 2 (OH⁻)' },
          { label: 'Denominator, pᵖ × qᵠ = 1¹ × 2²', value: '4' },
          { label: 's = (1.3 × 10⁻⁶ ÷ 4)^(1/3)', value: '≈ 6.9 × 10⁻³ mol/L' },
          { label: '[Ca²⁺] = s', value: '≈ 6.9 × 10⁻³ mol/L' },
          { label: '[OH⁻] = 2s', value: '≈ 1.4 × 10⁻² mol/L' }
        ],
        result: 's ≈ 6.9 × 10⁻³ mol/L',
        explanation: 'Carrying full precision gives s = 6.875 × 10⁻³ mol/L, which rounds to OpenStax’s own stated 6.9 × 10⁻³ M — confirmed independently in a scratch script, including the round-trip check that (s)¹×(2s)² reproduces the original 1.3 × 10⁻⁶ Ksp.'
      },
      watchOut: [
        {
          title: 'A coefficient of 2 squares that ion’s contribution, not doubles it',
          body: 'Ca(OH)₂’s hydroxide concentration is 2s, but it enters Ksp as (2s)² — a factor of 4, not 2. Forgetting to raise the coefficient’s own multiple to the power, not just the concentration, is the most common mistake with multi-ion salts.'
        },
        {
          title: 'Molar solubility is not the same number as Ksp',
          body: 'Ksp is a constant for the salt; molar solubility, s, is a concentration you compute from it (and it has ordinary mol/L units, unlike Ksp, which chemists usually leave unitless by convention). A larger Ksp does mean a more soluble salt, but only among salts with the same p:q ratio — comparing a 1:1 salt’s Ksp directly to a 1:2 salt’s Ksp does not rank their actual solubilities correctly.'
        },
        {
          title: 'This calculator assumes pure water, with no other ions already present',
          body: 'Adding a salt that shares one of the same ions (a "common ion") suppresses the solubility below this calculator’s plain Ksp answer — see the common-ion effect calculator for that specific case.'
        },
        {
          title: 'Ksp changes with temperature',
          body: 'Like any equilibrium constant, Ksp is only valid at the temperature it was measured at — most published tables give a 25°C value, which may not match a solubility measured at a different temperature.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §15.1 "Precipitation and Dissolution" (Ksp definition, Example 15.3 — CuBr, and Example 15.4 — Ca(OH)₂)', url: 'https://openstax.org/books/chemistry-2e/pages/15-1-precipitation-and-dissolution' }
      ]
    },
    inputs: [
      { id: 'ksp', label: 'Solubility product, Ksp', type: 'number', placeholder: '6.3e-9', defaultValue: 6.3e-9, step: 1e-10, min: 0 },
      { id: 'coefficientCation', label: 'Cation coefficient (p)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'coefficientAnion', label: 'Anion coefficient (q)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 }
    ],
    breakdown: {
      headline: 'molarSolubility',
      headlineLabel: 'Molar solubility (mol/L)',
      outputs: [
        { id: 'molarSolubility', label: 'Molar solubility, s (mol/L)', format: 'significant' },
        { id: 'cationConcentration', label: 'Cation concentration at equilibrium (mol/L)', format: 'significant' },
        { id: 'anionConcentration', label: 'Anion concentration at equilibrium (mol/L)', format: 'significant' }
      ],
      groups: [{ inputs: ['ksp', 'coefficientCation', 'coefficientAnion'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'cationConcentration', label: 'Cation' },
          { from: 'anionConcentration', label: 'Anion' }
        ],
        title: 'Ion concentrations at equilibrium'
      }
    },
    seo: {
      title: 'Ksp (Solubility Product) Calculator',
      description: 'Free Ksp calculator. Find a salt’s molar solubility from its solubility product constant and dissociation ratio, for any stoichiometry.',
      faq: [
        { question: 'How do I calculate molar solubility from Ksp?', answer: 'Write the dissociation equation to get the cation and anion coefficients p and q, then solve s = (Ksp ÷ (pᵖqᵠ))^(1/(p+q)). For a simple 1:1 salt, this reduces to s = √Ksp.' },
        { question: 'What is the molar solubility of CuBr?', answer: 'About 7.9 × 10⁻⁵ mol/L, from Ksp = 6.3 × 10⁻⁹ and its 1:1 dissociation (CuBr ⇌ Cu⁺ + Br⁻), so s = √(6.3 × 10⁻⁹).' },
        { question: 'Why does Ca(OH)₂’s formula use 4 in the denominator?', answer: 'Because its hydroxide coefficient is 2, and Ksp = (s)¹ × (2s)² = 4s³ — the 4 comes from squaring the coefficient 2, not from the stoichiometry alone.' },
        { question: 'How do I find Ksp from a measured molar solubility instead?', answer: 'Use the same relationship in reverse: Ksp = (p×s)ᵖ × (q×s)ᵠ, plugging in the measured s and the salt’s own coefficients.' },
        { question: 'Does a bigger Ksp always mean a more soluble salt?', answer: 'Only when comparing salts with the same cation:anion ratio. Across different ratios (a 1:1 salt versus a 1:2 salt, say), Ksp values are not directly comparable — convert both to molar solubility first.' },
        { question: 'Is Ksp affected by adding a common ion?', answer: 'Ksp itself stays the same at a given temperature, but the actual molar solubility drops once a common ion is already present in solution — see the common-ion effect calculator for that calculation.' },
        { question: 'What units does Ksp have?', answer: 'Technically it varies with p+q, but chemists conventionally report it as a dimensionless number, the same convention used for Kc elsewhere on this site.' }
      ]
    },
    compute(values) {
      const denominator = values.coefficientCation ** values.coefficientCation * values.coefficientAnion ** values.coefficientAnion;
      const molarSolubility = (values.ksp / denominator) ** (1 / (values.coefficientCation + values.coefficientAnion));
      return {
        molarSolubility,
        cationConcentration: molarSolubility * values.coefficientCation,
        anionConcentration: molarSolubility * values.coefficientAnion
      };
    }
  },
  {
    id: 'common-ion-effect-calculator',
    category: 'chemistry',
    glyph: 'CIE',
    updatedAt: '2026-11-13',
    aliases: ['common ion effect calculator', 'solubility with common ion calculator', 'common ion solubility calculator', 'ksp common ion calculator'],
    related: ['ksp-molar-solubility-calculator', 'equilibrium-constant-calculator', 'molarity-calculator', 'dilution-calculator'],
    title: 'Common-Ion Effect Calculator',
    description: 'Find how much a 1:1 salt’s molar solubility drops when a solution already contains one of its own ions, from Ksp and the common ion’s concentration.',
    example: 'CdS (Ksp = 1.0 × 10⁻²⁸) dissolved in 0.010 M CdBr₂ — which already supplies Cd²⁺, a common ion — has a molar solubility of only about 1.0 × 10⁻²⁶ mol/L, far below its solubility in pure water.',
    solver: {
      defaultTarget: 'molarSolubility',
      variables: [
        { id: 'ksp', label: 'Solubility product, Ksp', symbol: 'Ksp', dimension: 'count', defaultValue: 1e-28, defaultUnit: 'count', fixed: true },
        { id: 'commonIonConcentration', label: 'Common-ion concentration already present', symbol: '[X]', dimension: 'concentration', defaultValue: 0.01, defaultUnit: 'mol/L' },
        { id: 'molarSolubility', label: 'Molar solubility in that solution', symbol: 's', dimension: 'concentration', defaultValue: 1e-26, defaultUnit: 'mol/L' }
      ],
      solve: {
        molarSolubility: ({ ksp, commonIonConcentration }) => (2 * ksp) / (commonIonConcentration + Math.sqrt(commonIonConcentration ** 2 + 4 * ksp)),
        commonIonConcentration: ({ ksp, molarSolubility }) => (molarSolubility === 0 ? NaN : ksp / molarSolubility - molarSolubility)
      }
    },
    content: {
      lastReviewed: '2026-11-13',
      concept: {
        title: 'What is the common-ion effect?',
        paragraphs: [
          'The Ksp calculator on this site assumes a slightly soluble salt is dissolving into otherwise pure water. OpenStax Chemistry 2e’s §15.1 describes a related, very practical scenario: what happens when that same salt dissolves into a solution that already contains one of its own ions, supplied by a second, more soluble compound. "The solubility of an ionic compound is less in aqueous solutions containing a common ion," OpenStax states — this is the common-ion effect.',
          'The reason follows directly from Ksp itself: for a 1:1 salt MX(s) ⇌ Mⁿ⁺(aq) + Xᵏ⁻(aq), Ksp = [Mⁿ⁺][Xᵏ⁻] has to stay fixed at a given temperature. If some [Mⁿ⁺] is already supplied by another source, less of the salt itself needs to dissolve to use up the "budget" Ksp allows — so the new molar solubility, s, comes out lower than √Ksp, the plain-water answer.',
          'Writing [Mⁿ⁺] = s + [X] (the common ion already there, plus whatever the salt itself contributes) and [Xᵏ⁻] = s turns Ksp = (s + [X])×s into a quadratic in s, which this calculator solves directly rather than relying on the common simplifying assumption that s is negligible next to [X].'
        ]
      },
      howTo: {
        intro: 'Enter the salt’s Ksp (fixed, since it is a property of the salt) and the common ion’s existing concentration; the resulting molar solubility fills in automatically.',
        steps: [
          { name: 'Enter the salt’s Ksp', text: 'From a table or a given problem — this stays fixed, since it does not change with what else is dissolved.' },
          { name: 'Enter the common ion’s concentration', text: 'The concentration already supplied by the other, more soluble compound (e.g. 0.010 mol/L Cd²⁺ from CdBr₂).' },
          { name: 'Read the reduced molar solubility', text: 'How much of the original salt will dissolve into that solution — almost always far less than √Ksp, its solubility in pure water.' },
          { name: 'Or work backward', text: 'Enter a measured molar solubility instead, and solve for the common-ion concentration that would produce it.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The common ion adds directly to the salt’s own contribution, turning Ksp into a quadratic in the molar solubility, s.',
        expression: 'Ksp = (s + [X]) × s\ns = 2Ksp ÷ ([X] + √([X]² + 4Ksp))\n[X] = Ksp ÷ s − s',
        terms: [
          { symbol: 'Ksp', meaning: 'The dissolving salt’s own solubility product constant.' },
          { symbol: '[X]', meaning: 'The concentration of the common ion already present, from a different, more soluble source.' },
          { symbol: 's', meaning: 'The salt’s molar solubility in that solution — lower than its plain-water value.' }
        ],
        note: 'This calculator covers the simplest, most commonly taught case: a 1:1 salt where the common ion is supplied by a fully dissociated, more soluble compound. It solves the exact quadratic, in a numerically stable rearranged form, rather than the "s is negligible next to [X]" shortcut some textbooks use — which matters because for a very small Ksp, the shortcut and the exact answer agree to many decimal places anyway, but computing the shortcut by direct subtraction of two nearly-equal numbers can lose that precision entirely to rounding error.'
      },
      workedExample: {
        intro: 'Cadmium sulfide, CdS (Ksp = 1.0 × 10⁻²⁸), is placed in 0.010 M CdBr₂ solution, which fully dissociates to supply 0.010 M Cd²⁺ — the ion CdS shares with it. What is CdS’s molar solubility here? (OpenStax Chemistry 2e, Example 15.13.)',
        rows: [
          { label: 'Common ion already present, [Cd²⁺] = [X]', value: '0.010 mol/L' },
          { label: 'Ksp', value: '1.0 × 10⁻²⁸' },
          { label: 's = 2Ksp ÷ ([X] + √([X]² + 4Ksp))', value: '≈ 1.0 × 10⁻²⁶ mol/L' }
        ],
        result: 's ≈ 1.0 × 10⁻²⁶ mol/L',
        explanation: 'Because [X] (0.010) is enormously larger than √Ksp (about 1.0 × 10⁻¹⁴), nearly all of the "budget" Ksp allows is already used up by the common ion, leaving a tiny s — matching OpenStax’s own stated 1.0 × 10⁻²⁶ M. For comparison, CdS in plain water would have a molar solubility of √Ksp ≈ 1.0 × 10⁻¹⁴ mol/L — the common ion suppresses it by a further twelve orders of magnitude.'
      },
      watchOut: [
        {
          title: 'This is a different, lower number than the plain Ksp answer',
          body: 'Looking up a salt’s molar solubility with the plain Ksp calculator and then expecting the same number once a common ion is added will overstate how much actually dissolves — sometimes by many orders of magnitude, as in the worked example.'
        },
        {
          title: 'The common ion must come from somewhere else and fully dissociate',
          body: 'This calculator assumes the common-ion concentration you enter is already established by a separate, more soluble compound before the slightly soluble salt is added — not a leftover amount from the same salt dissolving on its own.'
        },
        {
          title: 'Scoped to 1:1 salts',
          body: 'For a salt with unequal coefficients (like Ca(OH)₂), the common-ion equilibrium expression has extra powers on one side and no longer reduces to a simple quadratic — this calculator does not cover that general case.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §15.1 "Precipitation and Dissolution" (the common-ion effect and Example 15.13, CdS in CdBr₂ solution)', url: 'https://openstax.org/books/chemistry-2e/pages/15-1-precipitation-and-dissolution' }
      ]
    },
    inputs: [
      { id: 'ksp', label: 'Solubility product, Ksp', type: 'number', placeholder: '1e-28', defaultValue: 1e-28, step: 1e-29, min: 0 },
      { id: 'commonIonConcentration', label: 'Common-ion concentration (mol/L)', type: 'number', placeholder: '0.01', defaultValue: 0.01, step: 0.001, min: 0 }
    ],
    seo: {
      title: 'Common-Ion Effect Calculator',
      description: 'Free common-ion effect calculator. Find how much a 1:1 salt’s molar solubility drops in a solution that already contains one of its own ions.',
      faq: [
        { question: 'What is the common-ion effect?', answer: 'A slightly soluble salt dissolves less in a solution that already contains one of its own ions than it would in pure water, because both ions still have to satisfy the same fixed Ksp.' },
        { question: 'How do I calculate solubility with a common ion?', answer: 'Solve the quadratic Ksp = (s + [X])×s for s, where [X] is the common ion’s existing concentration: s = 2Ksp ÷ ([X] + √([X]² + 4Ksp)).' },
        { question: 'What is CdS’s solubility in 0.010 M CdBr₂?', answer: 'About 1.0 × 10⁻²⁶ mol/L — far below its roughly 1.0 × 10⁻¹⁴ mol/L solubility in pure water, since Ksp = 1.0 × 10⁻²⁸.' },
        { question: 'Why is the common-ion solubility so much lower than in pure water?', answer: 'Because the common ion already supplies most of what Ksp allows for that ion’s concentration, leaving very little "room" for the salt itself to dissolve before the product of the two ion concentrations hits Ksp.' },
        { question: 'Can I use this for a salt with unequal coefficients, like Ca(OH)₂?', answer: 'No — this calculator is scoped to simple 1:1 salts. A salt like Ca(OH)₂ needs extra powers in its common-ion equilibrium expression that this quadratic does not cover.' },
        { question: 'Is this the same as the dilution calculator?', answer: 'No — dilution describes adding solvent to lower one existing solution’s concentration. This calculator instead describes a solubility equilibrium being suppressed by an ion already present from a different source.' }
      ]
    },
    compute(values) {
      return {
        molarSolubility: (2 * values.ksp) / (values.commonIonConcentration + Math.sqrt(values.commonIonConcentration ** 2 + 4 * values.ksp))
      };
    }
  },
  {
    id: 'isotope-notation-calculator',
    category: 'chemistry',
    glyph: 'AZX',
    updatedAt: '2026-11-13',
    aliases: ['isotope calculator', 'isotope notation calculator', 'protons neutrons electrons calculator', 'atomic number and mass number calculator', 'ion electron count calculator'],
    related: ['molar-mass-calculator', 'electron-configuration-calculator', 'radioactive-half-life-calculator', 'oxidation-number-calculator'],
    title: 'Isotope Notation Calculator (Protons, Neutrons, Electrons)',
    description: 'Find the number of protons, neutrons, and electrons in any isotope or ion from its element, mass number, and charge.',
    example: 'Carbon-14, a neutral atom (Z = 6, mass number 14), has 6 protons, 8 neutrons, and 6 electrons — the extra 2 neutrons compared to the far more common carbon-12 are what make it radioactive.',
    content: {
      lastReviewed: '2026-11-13',
      concept: {
        title: 'What do isotope notation and ion charge tell you?',
        paragraphs: [
          'Every atom of a given element has the same number of protons — its atomic number, Z, which is what defines the element and fixes its position on the periodic table. Isotope notation, written ᴬᵤX or "element-A" (carbon-14, uranium-238), adds one more piece of information: A, the mass number, the total count of protons plus neutrons in that specific atom’s nucleus. Two isotopes of the same element share the same Z but have different A, because they have different numbers of neutrons — carbon-12 and carbon-14 both have 6 protons, but 6 and 8 neutrons respectively.',
          'A neutral atom has exactly as many electrons as protons, since the positive and negative charges must balance. An ion has lost or gained electrons without changing its nucleus at all — a cation (positive charge) has fewer electrons than protons, and an anion (negative charge) has more. The chloride ion, Cl⁻, still has 17 protons (it is still chlorine), but 18 electrons, one more than a neutral chlorine atom.',
          'This calculator reads off Z automatically once you pick an element, then applies the two definitions directly: neutrons = mass number − Z, and electrons = Z − charge (using the convention that a cation’s charge is a positive number and an anion’s is negative).'
        ]
      },
      howTo: {
        intro: 'Pick the element, enter the isotope’s mass number, and enter the ion’s charge (0 for a neutral atom).',
        steps: [
          { name: 'Choose the element', text: 'Its atomic number, Z, and proton count are read off automatically.' },
          { name: 'Enter the mass number, A', text: 'The total of protons plus neutrons for this specific isotope — for carbon-14, that is 14.' },
          { name: 'Enter the charge', text: 'Positive for a cation, negative for an anion, 0 for a neutral atom — for Cl⁻, enter −1.' },
          { name: 'Read protons, neutrons, and electrons', text: 'Protons always equal Z; neutrons and electrons are calculated from the mass number and charge you entered.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Protons are fixed by the element; neutrons come from the mass number, and electrons come from the charge.',
        expression: 'protons = Z\nneutrons = A − Z\nelectrons = Z − charge',
        terms: [
          { symbol: 'Z', meaning: 'Atomic number — the element’s fixed proton count.' },
          { symbol: 'A', meaning: 'Mass number — protons plus neutrons in this specific isotope.' },
          { symbol: 'charge', meaning: 'The ion’s overall charge: positive for a cation (fewer electrons), negative for an anion (more electrons), 0 for a neutral atom.' }
        ],
        note: 'Mass number, A, is always a whole number close to (but not exactly equal to) the element’s standard atomic weight shown on a periodic table — that weight is a natural-abundance-weighted average across all of an element’s stable isotopes, not any one isotope’s actual mass number.'
      },
      workedExample: {
        intro: 'How many protons, neutrons, and electrons does the chloride ion, written as the chlorine-35 isotope with a −1 charge, have?',
        rows: [
          { label: 'Element', value: 'Chlorine, Z = 17' },
          { label: 'Mass number, A', value: '35' },
          { label: 'Charge', value: '−1 (an anion)' },
          { label: 'Protons = Z', value: '17' },
          { label: 'Neutrons = A − Z = 35 − 17', value: '18' },
          { label: 'Electrons = Z − charge = 17 − (−1)', value: '18' }
        ],
        result: '17 protons, 18 neutrons, 18 electrons',
        explanation: 'The extra electron (18 instead of the 17 a neutral chlorine-35 atom would have) is exactly what gives the ion its −1 charge; the proton and neutron counts, which come only from the nucleus, are unaffected by the ion’s charge.'
      },
      watchOut: [
        {
          title: 'Charge changes electrons only, never protons or neutrons',
          body: 'Forming an ion is a purely electronic process — electrons are gained or lost from the outer shells, while the nucleus (and so the element and the isotope) stays exactly the same.'
        },
        {
          title: 'A cation’s charge is entered as a positive number',
          body: 'Mg²⁺ has a charge of +2 (enter 2), which means 2 fewer electrons than protons — it is easy to accidentally flip the sign and compute an anion’s electron count instead.'
        },
        {
          title: 'Mass number is not the same as standard atomic weight',
          body: 'A periodic table’s listed atomic weight (12.011 for carbon) is a weighted average across every naturally occurring isotope. A specific isotope’s mass number (12, 13, or 14 for carbon) is always a whole number, and most elements’ most abundant isotope has a mass number close to, but not identical to, that averaged weight.'
        },
        {
          title: 'This calculator does not determine whether an isotope is radioactive',
          body: 'Some isotopes (like carbon-14) are unstable and decay over time; others (like carbon-12) are stable indefinitely. Knowing the proton and neutron counts alone does not tell you which — see the radioactive half-life calculator for the decay side of the picture, once you know an isotope decays.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §2.3 "Atomic Structure and Symbolism" (isotope notation, mass number, and atomic number)', url: 'https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism' }
      ]
    },
    inputs: [
      { id: 'atomicNumber', label: 'Element', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 1, options: ELEMENT_CONFIG_OPTIONS },
      { id: 'massNumber', label: 'Mass number, A', type: 'number', placeholder: '14', defaultValue: 14, step: 1, min: 1 },
      { id: 'charge', label: 'Charge (0 for a neutral atom)', type: 'number', placeholder: '0', defaultValue: 0, step: 1 }
    ],
    breakdown: {
      headline: 'neutrons',
      headlineLabel: 'Neutrons',
      outputs: [
        { id: 'protons', label: 'Protons', format: 'integer' },
        { id: 'neutrons', label: 'Neutrons', format: 'integer' },
        { id: 'electrons', label: 'Electrons', format: 'integer' }
      ],
      groups: [{ inputs: ['atomicNumber', 'massNumber', 'charge'] }],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'protons', label: 'Protons' },
          { from: 'neutrons', label: 'Neutrons' },
          { from: 'electrons', label: 'Electrons' }
        ],
        title: 'Protons, neutrons, and electrons',
        highlight: 1
      }
    },
    seo: {
      title: 'Isotope Notation Calculator (Protons, Neutrons, Electrons)',
      description: 'Free isotope calculator. Find protons, neutrons, and electrons for any isotope or ion from its element, mass number, and charge.',
      faq: [
        { question: 'How do I find the number of neutrons in an isotope?', answer: 'Subtract the atomic number (protons) from the mass number: neutrons = A − Z. Carbon-14 has 14 − 6 = 8 neutrons.' },
        { question: 'How do I find the number of electrons in an ion?', answer: 'Subtract the charge from the atomic number: electrons = Z − charge. A +2 cation has 2 fewer electrons than protons; a −1 anion has 1 more.' },
        { question: 'Do isotopes of the same element have the same number of protons?', answer: 'Yes — isotopes share the same atomic number (protons) by definition. They differ only in neutron count, which is why they have different mass numbers.' },
        { question: 'How many protons, neutrons, and electrons does Cl⁻ have?', answer: 'For chlorine-35: 17 protons, 18 neutrons, and 18 electrons — one more electron than a neutral atom, which is what gives it its −1 charge.' },
        { question: 'Why is carbon’s atomic weight 12.011 if carbon-12 has mass number 12?', answer: 'The periodic table’s 12.011 is a natural-abundance-weighted average across carbon’s stable isotopes (mostly carbon-12, with a small amount of carbon-13), not any single isotope’s own mass number.' },
        { question: 'Does charge affect the number of protons?', answer: 'No. Forming an ion only adds or removes electrons; the number of protons (and neutrons) in the nucleus never changes, since that would make it a different element or isotope entirely.' },
        { question: 'What is the difference between mass number and atomic mass?', answer: 'Mass number (A) is a whole-number count of protons plus neutrons in one specific atom. Atomic mass (used in the molar mass calculator) is the actual measured mass of that isotope, in atomic mass units, which is close to but not exactly equal to A.' }
      ]
    },
    compute(values) {
      return {
        protons: values.atomicNumber,
        neutrons: values.massNumber - values.atomicNumber,
        electrons: values.atomicNumber - values.charge
      };
    }
  },
  {
    id: 'molecular-geometry-calculator',
    category: 'chemistry',
    glyph: 'AXE',
    updatedAt: '2026-11-13',
    aliases: ['molecular geometry calculator', 'vsepr calculator', 'electron geometry calculator', 'molecular shape calculator', 'bond angle calculator'],
    related: ['electron-configuration-calculator', 'oxidation-number-calculator', 'molar-mass-calculator', 'empirical-formula-calculator'],
    title: 'Molecular Geometry Calculator (VSEPR)',
    description: 'Look up a molecule’s electron-pair geometry, molecular shape, and ideal bond angle from the number of bonding pairs and lone pairs on its central atom.',
    example: 'Water’s central oxygen has 2 bonding pairs and 2 lone pairs — a tetrahedral electron-pair geometry, but a bent molecular shape, with a measured bond angle of 104.5°.',
    content: {
      lastReviewed: '2026-11-13',
      concept: {
        title: 'What is VSEPR theory?',
        paragraphs: [
          'Valence Shell Electron Pair Repulsion (VSEPR) theory predicts a molecule’s 3D shape from one simple idea: electron pairs around a central atom, whether they are shared in a bond or sitting alone as a lone pair, repel each other and spread out as far apart as possible. OpenStax Chemistry 2e’s §7.6 "Molecular Structure and Polarity" works through the resulting geometries directly from the total number of electron pairs (bonding pairs plus lone pairs) around the central atom.',
          'The electron-pair geometry describes how all of those electron pairs — bonding and lone — arrange themselves in space; the molecular shape (or molecular structure) describes only where the atoms themselves end up, ignoring the lone pairs even though they still influence the shape by pushing the bonded atoms closer together. A central atom with 4 electron pairs always has a tetrahedral electron-pair geometry, but its molecular shape is tetrahedral only if all 4 pairs are bonds (CH₄); with 1 lone pair it becomes trigonal pyramidal (NH₃), and with 2 lone pairs it becomes bent (H₂O).',
          'Lone pairs take up more space than bonding pairs (they are held by only one nucleus, not stretched between two), which is why a bond angle next to a lone pair is always somewhat smaller than the perfectly symmetric, lone-pair-free version of the same electron-pair geometry — tetrahedral’s ideal 109.5° becomes "slightly smaller" once even one lone pair is present.'
        ]
      },
      howTo: {
        intro: 'Count the central atom’s bonding pairs (atoms directly attached to it) and lone pairs, and enter both.',
        steps: [
          { name: 'Draw the Lewis structure', text: 'Identify the central atom and count how many other atoms are directly bonded to it (bonding pairs) and how many lone pairs of electrons sit on it.' },
          { name: 'Enter the bonding-pair count', text: 'A double or triple bond to one atom still counts as one bonding pair for VSEPR purposes — it is the number of attached atoms that matters, not the number of shared electron pairs.' },
          { name: 'Enter the lone-pair count', text: 'Electron pairs on the central atom that are not shared with any other atom.' },
          { name: 'Read the geometry, shape, and bond angle', text: 'The electron-pair geometry covers every pair; the molecular shape and bond angle describe only where the bonded atoms end up.' }
        ],
        outro: 'Everything here is a lookup, calculated in your browser. Nothing is sent or stored.'
      },
      formula: {
        intro: 'There is no equation to solve — VSEPR is a direct lookup from the total electron-domain count and how those domains split between bonds and lone pairs.',
        expression: 'Electron domains = bonding pairs + lone pairs\nGeometry, shape, and bond angle = f(bonding pairs, lone pairs)',
        terms: [
          { symbol: 'Bonding pairs', meaning: 'The number of atoms directly bonded to the central atom (a double or triple bond still counts once).' },
          { symbol: 'Lone pairs', meaning: 'Electron pairs on the central atom not shared with any other atom.' },
          { symbol: 'Electron domains', meaning: 'The total count of bonding pairs plus lone pairs — this number alone fixes the electron-pair geometry.' }
        ],
        note: 'This calculator covers the twelve standard combinations taught in general chemistry, up through 6 electron domains. One rarely-taught combination (5 domains, 3 lone pairs) is left out — see the watch-out item below.'
      },
      workedExample: {
        intro: 'Water’s central oxygen atom has 2 bonds (to each hydrogen) and 2 lone pairs. What is its molecular shape and bond angle?',
        rows: [
          { label: 'Bonding pairs', value: '2' },
          { label: 'Lone pairs', value: '2' },
          { label: 'Electron domains (2 + 2)', value: '4' },
          { label: 'Electron-pair geometry', value: 'Tetrahedral' },
          { label: 'Molecular shape', value: 'Bent' },
          { label: 'Bond angle', value: 'Slightly less than 109.5° — measured at 104.5° in water' }
        ],
        result: 'Bent, with a bond angle of 104.5°',
        explanation: 'All 4 electron domains (2 bonds, 2 lone pairs) still arrange tetrahedrally, so the electron-pair geometry is tetrahedral — but because the molecular shape only tracks the 3 atoms (O and 2 H), it looks bent rather than tetrahedral. The 2 lone pairs push the 2 O–H bonds closer together than the ideal 109.5°, down to water’s own measured 104.5°, confirmed directly in OpenStax §7.6.'
      },
      watchOut: [
        {
          title: 'Electron-pair geometry and molecular shape are not always the same name',
          body: 'They match only when every electron domain is a bonding pair (no lone pairs). The moment any lone pairs are present, the molecular shape gets its own, different name — trigonal pyramidal and bent are both "hiding" a tetrahedral electron-pair geometry.'
        },
        {
          title: 'A double or triple bond still counts as one bonding pair',
          body: 'CO₂’s central carbon has 2 double bonds, which is still only 2 bonding "domains" for VSEPR purposes (plus 0 lone pairs) — it is linear, the same geometry as a molecule with 2 single bonds and no lone pairs.'
        },
        {
          title: 'This gives the ideal, unstrained geometry, not every real molecule’s exact angle',
          body: 'Different atoms, bond polarities, and multiple bonds all shift a real molecule’s measured angle slightly away from the textbook-ideal value shown here — water’s 104.5° versus a perfect tetrahedron’s 109.5° is itself an example of that.'
        },
        {
          title: 'One rare combination is out of scope',
          body: '5 electron domains with 3 lone pairs (2 bonding pairs, a linear molecular shape) is left out of this calculator — it is rarely covered in a general-chemistry course and uncommon in practice.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §7.6 "Molecular Structure and Polarity" (VSEPR theory, Figure 7.19’s electron-pair geometry table, and water’s 104.5° bond angle)', url: 'https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity' }
      ]
    },
    inputs: [
      { id: 'bondingPairs', label: 'Bonding pairs', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 2, options: BONDING_PAIR_OPTIONS },
      { id: 'lonePairs', label: 'Lone pairs', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: LONE_PAIR_OPTIONS }
    ],
    breakdown: {
      headline: 'molecularShapeIndex',
      headlineLabel: 'Molecular shape',
      outputs: [
        { id: 'molecularShapeIndex', label: 'Molecular shape', labels: MOLECULAR_SHAPE_LABELS },
        { id: 'electronGeometryIndex', label: 'Electron-pair geometry', labels: ELECTRON_GEOMETRY_LABELS },
        { id: 'bondAngleIndex', label: 'Bond angle', labels: BOND_ANGLE_LABELS },
        { id: 'exampleIndex', label: 'Example molecules', labels: EXAMPLE_LABELS },
        { id: 'domains', label: 'Total electron domains', format: 'integer' }
      ],
      groups: [{ inputs: ['bondingPairs', 'lonePairs'] }],
      visual: {
        type: 'donut',
        segments: [
          { from: 'bondingPairs', label: 'Bonding pairs' },
          { from: 'lonePairs', label: 'Lone pairs' }
        ],
        center: 'domains',
        centerSub: 'electron domains'
      }
    },
    seo: {
      title: 'Molecular Geometry Calculator (VSEPR)',
      description: 'Free VSEPR calculator. Look up electron-pair geometry, molecular shape, and ideal bond angle from a central atom’s bonding and lone pairs.',
      faq: [
        { question: 'How do I determine molecular geometry using VSEPR?', answer: 'Count the central atom’s bonding pairs and lone pairs. Their sum (electron domains) fixes the electron-pair geometry; how they split between bonds and lone pairs fixes the molecular shape and bond angle.' },
        { question: 'What is the molecular shape of water?', answer: 'Bent — 2 bonding pairs and 2 lone pairs on oxygen, from a tetrahedral electron-pair geometry, with a measured bond angle of 104.5°.' },
        { question: 'What is the difference between electron geometry and molecular geometry?', answer: 'Electron-pair geometry counts every electron domain, including lone pairs. Molecular geometry (or molecular shape) describes only where the bonded atoms end up, ignoring the lone pairs themselves even though they still affect the shape.' },
        { question: 'Why is ammonia (NH₃) trigonal pyramidal and not tetrahedral?', answer: 'Its nitrogen has 3 bonding pairs and 1 lone pair — 4 electron domains total, so the electron-pair geometry is tetrahedral, but with only 3 atoms attached, the molecular shape (trigonal pyramidal) leaves the lone pair out of the shape’s name.' },
        { question: 'Does a double or triple bond count as more than one bonding pair?', answer: 'No — for VSEPR, a double or triple bond to one atom still counts as a single bonding domain, since it is the number of attached atoms (not the number of shared electron pairs) that determines the geometry.' },
        { question: 'Why are bond angles next to a lone pair smaller than the ideal angle?', answer: 'A lone pair is held by only one nucleus and spreads out more than a bonding pair, which is stretched between two nuclei — that extra space pushes the neighboring bonding pairs slightly closer together than the perfectly symmetric, lone-pair-free angle.' },
        { question: 'What shape has 6 electron domains with 2 lone pairs?', answer: 'Square planar (e.g. XeF₄) — an octahedral electron-pair geometry with the 2 lone pairs positioned opposite each other, leaving the 4 bonded atoms in a flat square around the central atom.' }
      ]
    },
    compute(values) {
      const entry = findGeometry(values.bondingPairs, values.lonePairs);
      const domains = values.bondingPairs + values.lonePairs;
      if (!entry) return { domains, molecularShapeIndex: NaN, electronGeometryIndex: NaN, bondAngleIndex: NaN, exampleIndex: NaN };
      return {
        domains,
        molecularShapeIndex: entry.code,
        electronGeometryIndex: entry.code,
        bondAngleIndex: entry.code,
        exampleIndex: entry.code
      };
    }
  },
  {
    id: 'specific-heat-by-mixing-calculator',
    category: 'chemistry',
    glyph: 'cmix',
    updatedAt: '2026-11-13',
    aliases: ['specific heat by mixing calculator', 'calorimetry mixing calculator', 'specific heat of a metal calculator', 'measure specific heat calculator', 'heat transfer between substances calculator'],
    related: ['calorimetry-enthalpy-calculator', 'molarity-calculator', 'density-of-solutions-calculator', 'vapor-pressure-calculator'],
    title: 'Specific Heat by Mixing Calculator (Calorimetry)',
    description: 'Find an unknown substance’s specific heat by mixing it with a known one (usually water) and measuring the final equilibrium temperature — or solve for any other quantity in the same energy balance.',
    example: 'A 59.7 g piece of metal at 100.0°C dropped into 60.0 g of water at 22.0°C settles at 28.5°C, giving the metal a specific heat of about 0.38 J/(g·°C) — close enough to identify it as copper.',
    solver: {
      defaultTarget: 'specificHeatUnknown',
      variables: [
        { id: 'massUnknown', label: 'Mass of unknown substance', symbol: 'm_A', dimension: 'mass', defaultValue: 59.7, defaultUnit: 'g' },
        { id: 'specificHeatUnknown', label: 'Specific heat of unknown substance', symbol: 'c_A', dimension: 'specificHeat', defaultValue: 0.3822, defaultUnit: 'J/gK' },
        { id: 'initialTempUnknown', label: 'Initial temperature of unknown substance', symbol: 'T_Ai', dimension: 'temperature', defaultValue: 100, defaultUnit: 'C' },
        { id: 'massKnown', label: 'Mass of known substance (usually water)', symbol: 'm_B', dimension: 'mass', defaultValue: 60, defaultUnit: 'g' },
        { id: 'specificHeatKnown', label: 'Specific heat of known substance', symbol: 'c_B', dimension: 'specificHeat', defaultValue: 4.184, defaultUnit: 'J/gK', fixed: true },
        { id: 'initialTempKnown', label: 'Initial temperature of known substance', symbol: 'T_Bi', dimension: 'temperature', defaultValue: 22, defaultUnit: 'C' },
        { id: 'finalTemp', label: 'Final equilibrium temperature', symbol: 'T_f', dimension: 'temperature', defaultValue: 28.5, defaultUnit: 'C' }
      ],
      solve: {
        specificHeatUnknown: ({ massUnknown, initialTempUnknown, massKnown, specificHeatKnown, initialTempKnown, finalTemp }) =>
          massUnknown === 0 || finalTemp === initialTempUnknown
            ? NaN
            : -(massKnown * specificHeatKnown * (finalTemp - initialTempKnown)) / (massUnknown * (finalTemp - initialTempUnknown)),
        massUnknown: ({ specificHeatUnknown, initialTempUnknown, massKnown, specificHeatKnown, initialTempKnown, finalTemp }) =>
          specificHeatUnknown === 0 || finalTemp === initialTempUnknown
            ? NaN
            : -(massKnown * specificHeatKnown * (finalTemp - initialTempKnown)) / (specificHeatUnknown * (finalTemp - initialTempUnknown)),
        initialTempUnknown: ({ massUnknown, specificHeatUnknown, massKnown, specificHeatKnown, initialTempKnown, finalTemp }) =>
          massUnknown === 0 || specificHeatUnknown === 0
            ? NaN
            : finalTemp + (massKnown * specificHeatKnown * (finalTemp - initialTempKnown)) / (massUnknown * specificHeatUnknown),
        massKnown: ({ massUnknown, specificHeatUnknown, initialTempUnknown, specificHeatKnown, initialTempKnown, finalTemp }) =>
          specificHeatKnown === 0 || finalTemp === initialTempKnown
            ? NaN
            : -(massUnknown * specificHeatUnknown * (finalTemp - initialTempUnknown)) / (specificHeatKnown * (finalTemp - initialTempKnown)),
        initialTempKnown: ({ massUnknown, specificHeatUnknown, initialTempUnknown, massKnown, specificHeatKnown, finalTemp }) =>
          massKnown === 0 || specificHeatKnown === 0
            ? NaN
            : finalTemp + (massUnknown * specificHeatUnknown * (finalTemp - initialTempUnknown)) / (massKnown * specificHeatKnown),
        finalTemp: ({ massUnknown, specificHeatUnknown, initialTempUnknown, massKnown, specificHeatKnown, initialTempKnown }) =>
          massKnown * specificHeatKnown + massUnknown * specificHeatUnknown === 0
            ? NaN
            : (massKnown * specificHeatKnown * initialTempKnown + massUnknown * specificHeatUnknown * initialTempUnknown) /
              (massKnown * specificHeatKnown + massUnknown * specificHeatUnknown)
      },
      outputs: [
        {
          id: 'heatTransferred',
          label: 'Heat transferred between the two substances',
          dimension: 'energy',
          unit: 'J',
          compute: (si) => Math.abs(si.massKnown * si.specificHeatKnown * (si.finalTemp - si.initialTempKnown))
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-13',
      concept: {
        title: 'How do you measure specific heat by mixing two substances?',
        paragraphs: [
          'A substance’s specific heat (how much energy it takes to raise 1 gram of it by 1°C) usually has to be measured, not calculated from first principles. One standard lab method, worked through directly in OpenStax Chemistry 2e’s §5.2 "Calorimetry," mixes the unknown substance with a substance of known specific heat (almost always water) and tracks the final, shared equilibrium temperature they settle at.',
          'In a well-insulated container, any heat the cooler substance gains has to come from the warmer substance losing exactly that much — "heat gained by one equals heat lost by the other," expressed as mᵦcᵦ(T_f − T_Bi) = −mₐcₐ(T_f − T_Ai). Every term here is something you can directly measure (a mass, a thermometer reading) except one unknown, which this equation then pins down exactly.',
          'This calculator is distinct from both the heat calculator elsewhere on this site, which computes Q = mcΔT for one single substance in isolation, and the calorimetry enthalpy calculator, which uses a temperature change to find a reaction’s molar enthalpy. This page specifically balances two different substances against each other to solve for an unknown property of the energy-balance equation itself — most often, the unknown substance’s own specific heat.'
        ]
      },
      howTo: {
        intro: 'Enter both substances’ masses and starting temperatures, plus the final temperature they both settle at together; the unknown specific heat fills in automatically.',
        steps: [
          { name: 'Weigh the unknown substance and the known one', text: 'Usually a solid dropped into a known mass of water.' },
          { name: 'Record both starting temperatures', text: 'The unknown substance is usually the hotter one (just removed from boiling water, say); the known substance (water) starts at room temperature.' },
          { name: 'Record the final, shared temperature', text: 'Once both substances reach thermal equilibrium together.' },
          { name: 'Enter the known substance’s specific heat', text: 'Water’s is 4.184 J/(g·°C); this field stays fixed, since it is a known physical constant, not something being solved for.' },
          { name: 'Read the unknown substance’s specific heat', text: 'Compare it to a reference table (like OpenStax’s own Table 5.1) to identify what the unknown substance might be.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Heat gained by the known substance equals heat lost by the unknown one — an energy balance that rearranges to solve for any one quantity, given the other six.',
        expression: 'm_B × c_B × (T_f − T_Bi) = −m_A × c_A × (T_f − T_Ai)\nc_A = −[m_B × c_B × (T_f − T_Bi)] ÷ [m_A × (T_f − T_Ai)]',
        terms: [
          { symbol: 'm_A, c_A, T_Ai', meaning: 'Mass, specific heat, and starting temperature of the unknown substance.' },
          { symbol: 'm_B, c_B, T_Bi', meaning: 'Mass, specific heat, and starting temperature of the known substance (usually water).' },
          { symbol: 'T_f', meaning: 'The final temperature both substances share once they reach thermal equilibrium.' }
        ],
        note: 'This assumes a well-insulated system that exchanges no heat with anything outside the two substances themselves (no calorimeter heat capacity of its own) — the same simplifying assumption the calorimetry enthalpy calculator makes.'
      },
      workedExample: {
        intro: 'A 59.7 g piece of metal, heated to 100.0°C, is dropped into 60.0 g of water at 22.0°C. The mixture settles at 28.5°C. What is the metal’s specific heat? (OpenStax Chemistry 2e, Example 5.4.)',
        rows: [
          { label: 'Heat gained by the water: m_B × c_B × (T_f − T_Bi)', value: '60.0 × 4.18 × (28.5 − 22.0) ≈ 1632 J' },
          { label: 'Heat lost by the metal (equal and opposite)', value: '≈ −1632 J' },
          { label: 'c_A = 1632 ÷ [59.7 × (100.0 − 28.5)]', value: '≈ 0.38 J/(g·°C)' }
        ],
        result: 'c_A ≈ 0.38 J/(g·°C)',
        explanation: 'OpenStax compares this experimental value with a reference table and identifies the metal as copper (listed there at 0.39 J/(g·°C)) — close enough, given typical experimental uncertainty in a calorimetry measurement, to make the identification. Using this site’s own default water specific heat, 4.184 instead of OpenStax’s rounded 4.18 J/(g·°C), gives 0.3823 J/(g·°C), the same answer to two significant figures.'
      },
      watchOut: [
        {
          title: 'The unknown substance always loses what the known substance gains — never the same sign',
          body: 'If the "unknown" started cooler than the final temperature and the "known" substance started warmer, swap which one you call A and which you call B, or the calculator’s solved specific heat will come out negative, which has no physical meaning.'
        },
        {
          title: 'This assumes no heat escapes to the surroundings or the container itself',
          body: 'A simple insulated cup is a reasonable approximation for a classroom measurement, but any heat that leaks out (or that the thermometer or container itself absorbs) makes the computed specific heat somewhat inaccurate — a more careful experiment accounts for the calorimeter’s own heat capacity separately.'
        },
        {
          title: 'This is not the same question as the calorimetry enthalpy calculator',
          body: 'That calculator takes a known specific heat and temperature change and divides by moles reacted to find a reaction’s molar enthalpy. This calculator instead balances two substances against each other to find an unknown physical property — usually specific heat — with no reaction or moles involved at all.'
        },
        {
          title: 'A computed specific heat only narrows down the substance; it does not uniquely identify it',
          body: 'Several substances can have close to the same specific heat. Treat a calorimetry result as a match against a reference table, not as absolute proof, especially with ordinary classroom-lab measurement precision.'
        }
      ],
      references: [
        { label: 'OpenStax, Chemistry 2e, §5.2 "Calorimetry" (the heat-balance equation and Example 5.4, identifying copper by its measured specific heat)', url: 'https://openstax.org/books/chemistry-2e/pages/5-2-calorimetry' }
      ]
    },
    inputs: [
      { id: 'massUnknown', label: 'Mass of unknown substance (g)', type: 'number', placeholder: '59.7', defaultValue: 59.7, step: 0.1, min: 0 },
      { id: 'initialTempUnknown', label: 'Initial temperature of unknown substance (°C)', type: 'number', placeholder: '100', defaultValue: 100, step: 0.1 },
      { id: 'massKnown', label: 'Mass of known substance (g)', type: 'number', placeholder: '60', defaultValue: 60, step: 0.1, min: 0 },
      { id: 'specificHeatKnown', label: 'Specific heat of known substance (J/(g·°C))', type: 'number', placeholder: '4.184', defaultValue: 4.184, step: 0.001, min: 0 },
      { id: 'initialTempKnown', label: 'Initial temperature of known substance (°C)', type: 'number', placeholder: '22', defaultValue: 22, step: 0.1 },
      { id: 'finalTemp', label: 'Final equilibrium temperature (°C)', type: 'number', placeholder: '28.5', defaultValue: 28.5, step: 0.1 }
    ],
    seo: {
      title: 'Specific Heat by Mixing Calculator (Calorimetry)',
      description: 'Free specific heat calculator. Find an unknown substance’s specific heat from a calorimetry mixing experiment, with a worked OpenStax copper example.',
      faq: [
        { question: 'How do you calculate specific heat using calorimetry?', answer: 'Mix the unknown substance with a known one (usually water), measure the final shared temperature, and solve the heat balance m_Bc_B(T_f−T_Bi) = −m_Ac_A(T_f−T_Ai) for the unknown specific heat, c_A.' },
        { question: 'What is the specific heat of the metal in the copper identification example?', answer: 'About 0.38 J/(g·°C), from a 59.7 g metal sample cooling from 100.0°C to 28.5°C in 60.0 g of water that warmed from 22.0°C — close to copper’s known 0.39 J/(g·°C).' },
        { question: 'Why does the water’s temperature change need to be known precisely?', answer: 'Because the heat transferred (and so the unknown specific heat) is directly proportional to that temperature change — a small reading error in the final or initial water temperature propagates directly into the computed specific heat.' },
        { question: 'Can this calculator solve for something other than specific heat?', answer: 'Yes — enter a known specific heat for the unknown substance and leave any other field (a mass, a starting temperature, or the final temperature) as the one calculated automatically; the same energy balance solves for it.' },
        { question: 'How is this different from the heat calculator (Q = mcΔT)?', answer: 'The heat calculator computes the heat for one single substance on its own. This page balances two different substances against each other and solves for one unknown quantity in that balance — most often an unknown specific heat.' },
        { question: 'Does the calorimeter itself affect the result?', answer: 'In a real experiment, yes — a container, stirrer, or thermometer that absorbs some heat itself introduces error. This calculator assumes an idealized, well-insulated system with no heat capacity of its own, the same simplifying assumption used throughout introductory calorimetry.' },
        { question: 'Why is the specific heat of water usually used as the known value?', answer: 'Water’s specific heat, 4.184 J/(g·°C), is extremely well established and water is cheap, safe, and easy to measure a mass and temperature for — which is why nearly every introductory calorimetry experiment uses it as the known substance.' }
      ]
    },
    compute(values) {
      const denominator = values.massUnknown * (values.finalTemp - values.initialTempUnknown);
      const specificHeatUnknown = denominator === 0 ? NaN : -(values.massKnown * values.specificHeatKnown * (values.finalTemp - values.initialTempKnown)) / denominator;
      return { specificHeatUnknown };
    }
  }
];
