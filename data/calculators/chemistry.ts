import type { CalculatorConfig } from './types.ts';
import { ELEMENT_OPTIONS } from '../../lib/atomicMasses.ts';

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
  }
];
