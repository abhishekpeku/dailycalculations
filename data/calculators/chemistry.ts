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
  }
];
