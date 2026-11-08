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
    related: ['mass-percent-calculator', 'molar-mass-calculator', 'moles-to-grams-calculator'],
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
        { question: 'How is theoretical yield calculated?', answer: 'From the balanced equation: convert the limiting reagent’s mass to moles, use the mole ratio in the equation to find moles of product, then multiply by the product’s molar mass. This calculator takes that result as a given input.' },
        { question: 'Why is percent yield usually less than 100%?', answer: 'Real reactions lose some material to side reactions, incomplete conversion, or losses during transfer and purification (filtration, recrystallization) — few lab procedures recover every last bit of theoretically possible product.' }
      ]
    },
    compute(values) {
      return { percentYield: (values.actualYield / values.theoreticalYield) * 100 };
    }
  }
];
