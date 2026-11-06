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
  }
];
