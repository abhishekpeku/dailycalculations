import type { CalculatorConfig } from './types.ts';
import { toBase } from '../../lib/units.ts';

// Cubic meters in one cubic yard (NIST SP 811 yard), used to convert solver SI volumes into the
// bags-per-cubic-yard figures from Quikrete's Concrete Mix data sheet.
const CUBIC_YARD_M3 = toBase(1, 'volume', 'yd3');

export const homeCalculators: CalculatorConfig[] = [
  {
    id: 'paint-calculator',
    category: 'home',
    updatedAt: '2026-09-10',
    aliases: ['how much paint do i need', 'wall paint coverage calculator', 'paint gallons calculator'],
    related: ['wallpaper-calculator', 'tile-calculator', 'concrete-calculator', 'furniture-fit-calculator'],
    title: 'Paint Calculator',
    description: 'Calculate how many gallons of paint you need for walls and ceilings, accounting for doors, windows, and coats.',
    example: 'Calculate paint needed for a 12x14 ft room with 9 ft ceilings, 1 door, and 2 windows.',
    inputs: [
      { id: 'roomLength', label: 'Room length (ft)', type: 'number', placeholder: '14', defaultValue: 14, step: 0.5, min: 1 },
      { id: 'roomWidth', label: 'Room width (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'ceilingHeight', label: 'Ceiling height (ft)', type: 'number', placeholder: '9', defaultValue: 9, step: 0.5, min: 6 },
      { id: 'doors', label: 'Number of doors (each ~20 sq ft)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 },
      { id: 'windows', label: 'Number of windows (each ~15 sq ft)', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 },
      { id: 'coats', label: 'Number of coats', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 },
      { id: 'coveragePerGallon', label: 'Coverage per gallon (sq ft, typical = 350)', type: 'number', placeholder: '350', defaultValue: 350, step: 10, min: 100 }
    ],
    seo: {
      title: 'Paint Calculator – Gallons Needed for Walls and Ceilings',
      description: 'Calculate how many gallons of paint you need for any room. Accounts for doors, windows, number of coats, and paint coverage.',
      faq: [
        { question: 'How much area does one gallon of paint cover?', answer: 'Most standard interior paints cover 350–400 sq ft per gallon on smooth surfaces. Textured walls may require 20–30% more.' },
        { question: 'Should I buy extra paint?', answer: 'Add 10% to your calculated amount for touch-ups and waste. Paint can also be stored for future use if you keep the lid sealed.' },
        { question: 'How many coats does a room need?', answer: 'Most rooms need 2 coats for good coverage. Painting over a dark color or using a primer first can help achieve full coverage in 2 coats.' }
      ]
    },
    compute(values) {
      const wallArea = 2 * (values.roomLength + values.roomWidth) * values.ceilingHeight;
      const deductions = values.doors * 20 + values.windows * 15;
      const paintableArea = Math.max(0, wallArea - deductions);
      const totalArea = paintableArea * values.coats;
      const gallonsNeeded = totalArea / values.coveragePerGallon;
      const gallonsWithBuffer = gallonsNeeded * 1.1;
      const ceilingArea = values.roomLength * values.roomWidth;
      const ceilingGallons = (ceilingArea * values.coats) / values.coveragePerGallon;
      return { paintableArea, gallonsNeeded, gallonsWithBuffer, ceilingArea, ceilingGallons };
    }
  },
  {
    id: 'tile-calculator',
    category: 'home',
    updatedAt: '2026-09-10',
    aliases: ['how many tiles do i need', 'floor tile calculator', 'tile area calculator'],
    related: ['paint-calculator', 'wallpaper-calculator', 'concrete-calculator', 'furniture-fit-calculator'],
    title: 'Tile Calculator',
    description: 'Calculate the number of tiles and boxes needed for a floor or wall project, including a waste allowance.',
    example: 'Calculate tiles needed for a 120 sq ft bathroom floor using 12x12 inch tiles.',
    inputs: [
      { id: 'areaLength', label: 'Area length (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 0.5 },
      { id: 'areaWidth', label: 'Area width (ft)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.5, min: 0.5 },
      { id: 'tileLengthInch', label: 'Tile length (inches)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'tileWidthInch', label: 'Tile width (inches)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'tilesPerBox', label: 'Tiles per box', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 }
    ],
    seo: {
      title: 'Tile Calculator – Floor and Wall Tile Estimator',
      description: 'Calculate the number of tiles and boxes needed for any floor or wall project. Includes waste factor for cuts and breakage.',
      faq: [
        { question: 'How much waste should I account for?', answer: 'Add 10% for simple layouts, 15% for diagonal patterns, and up to 20% for complex cuts or irregular rooms.' },
        { question: 'What tile sizes are most common in the US?', answer: 'Common sizes include 12×12, 16×16, 18×18, and 12×24 inch for floors. Subway tiles (3×6 inch) are popular for bathroom walls.' }
      ]
    },
    compute(values) {
      const roomSqFt = values.areaLength * values.areaWidth;
      const tileSqFt = (values.tileLengthInch / 12) * (values.tileWidthInch / 12);
      const tilesNeeded = roomSqFt / tileSqFt;
      const tilesWithWaste = tilesNeeded * (1 + values.wastePercent / 100);
      const boxesNeeded = Math.ceil(tilesWithWaste / values.tilesPerBox);
      return { roomSqFt, tilesNeeded, tilesWithWaste, boxesNeeded };
    }
  },
  {
    id: 'concrete-calculator',
    category: 'home',
    updatedAt: '2026-10-21',
    aliases: ['cubic yards of concrete calculator', 'cement calculator', 'slab concrete calculator', 'how many bags of concrete do i need', 'concrete bag calculator'],
    related: ['tile-calculator', 'paint-calculator', 'wallpaper-calculator', 'gallons-to-liters-converter'],
    title: 'Concrete Calculator',
    description: 'Find the volume of concrete a slab, footing or post hole needs from its length, width and depth, or work backward from a target volume, in cubic feet or cubic yards, with the number of 60 lb and 80 lb bags.',
    example: 'A 10x12 ft patio slab, 4 inches thick, needs 40 cubic feet (1.48 cubic yards) of concrete, or about 1.63 cubic yards with a 10% waste allowance — roughly 74 bags of 80 lb mix or 98 bags of 60 lb mix.',
    solver: {
      defaultTarget: 'volume',
      variables: [
        { id: 'volume', label: 'Concrete volume', symbol: 'V', dimension: 'volume', defaultValue: 1.4815, defaultUnit: 'yd3' },
        { id: 'length', label: 'Length', symbol: 'L', dimension: 'length', defaultValue: 10, defaultUnit: 'ft' },
        { id: 'width', label: 'Width', symbol: 'W', dimension: 'length', defaultValue: 12, defaultUnit: 'ft' },
        { id: 'depth', label: 'Depth / thickness', symbol: 'd', dimension: 'length', defaultValue: 4, defaultUnit: 'in' },
        { id: 'wastePercent', label: 'Waste factor', symbol: 'w', dimension: 'percent', defaultValue: 10, defaultUnit: '%', fixed: true }
      ],
      solve: {
        volume: ({ length, width, depth }) => length * width * depth,
        length: ({ volume, width, depth }) => (width * depth > 0 ? volume / (width * depth) : NaN),
        width: ({ volume, length, depth }) => (length * depth > 0 ? volume / (length * depth) : NaN),
        depth: ({ volume, length, width }) => (length * width > 0 ? volume / (length * width) : NaN)
      },
      outputs: [
        { id: 'volumeWithWaste', label: 'Volume with waste factor', dimension: 'volume', unit: 'yd3', compute: (si) => si.volume * (1 + si.wastePercent / 100) },
        // Quikrete Concrete Mix 1101 data sheet: 80 lb bag yields 0.60 ft³ (45/yd³), 60 lb bag 0.45 ft³ (60/yd³).
        { id: 'bags80lb', label: '80 lb bags needed', dimension: 'count', compute: (si) => Math.ceil((si.volume * (1 + si.wastePercent / 100) / CUBIC_YARD_M3) * 45) },
        { id: 'bags60lb', label: '60 lb bags needed', dimension: 'count', compute: (si) => Math.ceil((si.volume * (1 + si.wastePercent / 100) / CUBIC_YARD_M3) * 60) }
      ],
      visuals: [
        {
          type: 'compareBars',
          bars: [
            { from: 'bags80lb', label: '80 lb bags' },
            { from: 'bags60lb', label: '60 lb bags' }
          ],
          title: 'Bags needed, by bag size'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How much concrete a slab needs',
        paragraphs: [
          'Concrete is sold and poured by volume, not area, because a slab has a thickness as well as a length and width. Multiply the three together (in the same unit) to get the volume, then convert: concrete is bought in cubic yards for a ready-mix delivery, or in bagged mix measured by the bag. A 10 ft by 12 ft patio poured 4 inches deep is 40 cubic feet, which is 1.48 cubic yards.',
          'Most residential flatwork is poured thinner than you might guess. An industry recommendation for exterior concrete flatwork, developed with reference to American Concrete Institute and Portland Cement Association standards, puts the usual minimum for sidewalks, driveways and patios at 3½ inches, the depth of the 2×4 lumber commonly used for the forms, rising to 4 inches or more under vehicle loads and 6 inches where a driveway meets the street.',
          'For small jobs, bagged concrete mix is easier than ordering a truck. Quikrete’s data sheet for its standard Concrete Mix states that an 80 lb bag yields about 0.60 cubic feet once mixed, a 60 lb bag about 0.45 cubic feet, and a 40 lb bag about 0.30 cubic feet — so a cubic yard (27 cubic feet) takes about 45 bags at 80 lb, 60 bags at 60 lb, or 90 bags at 40 lb. A waste allowance on top covers spillage, an uneven subgrade and the extra depth that collects at low spots.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of length, width and depth; the volume is calculated. Waste is always an input.',
        steps: [
          { name: 'Enter the length and width', text: 'Measure the footprint of the slab, footing or post hole in feet (or meters).' },
          { name: 'Enter the depth', text: 'Use the thickness in inches. 3½–4 inches is typical for a patio or sidewalk; thicker for a driveway.' },
          { name: 'Set the waste factor', text: 'Keep the 10% default, or raise it for an uneven subgrade or a job with a lot of edges and corners.' },
          { name: 'Read the volume', text: 'The result shows cubic feet and cubic yards, with the volume after the waste factor.' },
          { name: 'Check the bag count', text: 'The chart shows how many 60 lb or 80 lb bags that volume takes, so you can compare the cost of bags with a ready-mix delivery.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Volume is length times width times depth; cubic yards and bag counts follow by division.',
        expression: 'V = L × W × d\ncu yd = V ÷ 27\nVw = cu yd × (1 + waste%)\nbags(80 lb) = Vw × 45\nbags(60 lb) = Vw × 60',
        terms: [
          { symbol: 'L, W', meaning: 'Length and width of the area, in feet.' },
          { symbol: 'd', meaning: 'Depth (thickness), in feet — divide inches by 12 first.' },
          { symbol: 'V', meaning: 'Volume in cubic feet. 27 cubic feet make one cubic yard.' },
          { symbol: 'Vw', meaning: 'Volume in cubic yards after the waste factor.' },
          { symbol: 'waste%', meaning: 'Extra percent ordered for spillage and subgrade variation; 10% is a common default.' }
        ],
        note: 'An estimate. Bag yields and ready-mix pricing vary by brand and supplier; check the bag’s own data sheet or your ready-mix company for an exact figure, and always follow local building codes for required thickness and reinforcement.'
      },
      workedExample: {
        intro: 'You are pouring a 10 ft by 12 ft patio slab, 4 inches thick, and want a 10% waste allowance.',
        rows: [
          { label: 'Depth in feet (4 ÷ 12)', value: '0.3333 ft' },
          { label: 'Volume (V = 10 × 12 × 0.3333)', value: '40.00 ft³' },
          { label: 'Cubic yards (40.00 ÷ 27)', value: '1.48 yd³' },
          { label: 'With 10% waste (1.4815 × 1.10)', value: '1.63 yd³' },
          { label: '80 lb bags (1.6296 × 45, rounded up)', value: '74 bags' },
          { label: '60 lb bags (1.6296 × 60, rounded up)', value: '98 bags' }
        ],
        result: '1.63 cubic yards, about 74 bags of 80 lb mix',
        explanation: 'A driveway slab the same size but poured 6 inches thick instead of 4 would need 3.70 cubic yards (4.07 with waste) — more than double, since volume scales directly with depth. That is why even a small increase in thickness raises the material cost by a lot.'
      },
      watchOut: [
        { title: 'Order a little extra', body: 'Spillage, an uneven subgrade and low spots that take more material all eat into a tight estimate. The 10% default reflects common contractor practice; use more on an irregular or sloped site.' },
        { title: 'Bag yields vary by product', body: 'The 45 bags (80 lb) and 60 bags (60 lb) per cubic yard figures come from Quikrete’s standard Concrete Mix. High-strength, fiber-reinforced or fast-setting mixes can yield a different volume per bag — check the specific bag’s data sheet.' },
        { title: 'Thickness drives cost more than area', body: 'Volume is length × width × depth, so doubling the depth doubles the concrete needed for the same footprint. A driveway rated for vehicles is usually thicker than a footpath rated for foot traffic only.' },
        { title: 'Ready-mix has a minimum order', body: 'For larger pours, a ready-mix truck is usually cheaper per cubic yard than dozens of bags, but most suppliers have a minimum order size. Call ahead for a job near that threshold.' },
        { title: 'Curing takes days, not hours', body: 'Industry guidance recommends curing exterior flatwork for at least five to seven days, and keeping new concrete away from freezing for the first 48 hours, before it reaches a useful fraction of its design strength.' }
      ],
      references: [
        { label: 'Ohio Concrete, Industry Recommendation for Exterior Concrete Flatwork (references ACI, PCA and NRMCA standards)', url: 'https://www.ohioconcrete.org/wp-content/uploads/2015/06/Industry-Recommendation-for-Exterior-Flatwork-Final.pdf' },
        { label: 'QUIKRETE, Concrete Mix (Product No. 1101) Data Sheet — bag yields and mixing water', url: 'https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf' }
      ]
    },
    inputs: [
      { id: 'length', label: 'Length (ft)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.5, min: 0.1 },
      { id: 'width', label: 'Width (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 0.1 },
      { id: 'depthInches', label: 'Depth / thickness (inches)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0.5 },
      { id: 'wastePercent', label: 'Waste factor (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 }
    ],
    seo: {
      title: 'Concrete Calculator – Cubic Yards and Bags Needed',
      description: 'Free concrete calculator: cubic feet and cubic yards for a slab, footing or post hole, plus how many 60 lb or 80 lb bags of concrete mix it takes.',
      faq: [
        { question: 'How many cubic yards of concrete do I need?', answer: 'Multiply length × width × depth, all in feet, then divide by 27. A 10×12 ft slab 4 inches deep is 10 × 12 × 0.3333 = 40 cubic feet, or 1.48 cubic yards.' },
        { question: 'How many 80 lb bags of concrete make a cubic yard?', answer: 'About 45, based on Quikrete’s data sheet yield of 0.60 cubic feet per 80 lb bag (27 ÷ 0.60 = 45). The 10×12 ft, 4-inch patio example needs about 74 bags once a 10% waste factor is added.' },
        { question: 'How many 60 lb bags of concrete make a cubic yard?', answer: 'About 60, since a 60 lb bag yields roughly 0.45 cubic feet (27 ÷ 0.45 = 60). The same patio example needs about 98 of the 60 lb bags with 10% waste.' },
        { question: 'How thick should a concrete patio or driveway be?', answer: 'Industry guidance referencing ACI and PCA standards puts the usual minimum at 3½ inches for sidewalks, driveways and patios, with 4 inches or more common where vehicles will drive on it.' },
        { question: 'Should I order extra concrete?', answer: 'Yes. A 10% waste allowance is a common starting point for spillage and an uneven subgrade; the calculator applies it to the volume before converting to bags.' },
        { question: 'When should I use ready-mix instead of bags?', answer: 'Bags suit small jobs like post holes or a short walkway. For a full driveway or a patio of more than a couple of cubic yards, a ready-mix delivery is usually cheaper per yard, though most suppliers have a minimum order.' },
        { question: 'How do I convert the depth from inches into the formula?', answer: 'Divide the inches by 12 to get feet before multiplying. A 4-inch slab is 4 ÷ 12 = 0.3333 ft deep.' }
      ]
    },
    compute(values) {
      const depthFt = values.depthInches / 12;
      const cubicFeet = values.length * values.width * depthFt;
      const cubicYards = cubicFeet / 27;
      const cubicYardsWithWaste = cubicYards * (1 + values.wastePercent / 100);
      const bags80lb = Math.ceil(cubicYardsWithWaste * 45);
      const bags60lb = Math.ceil(cubicYardsWithWaste * 60);
      return { cubicFeet, cubicYards, cubicYardsWithWaste, bags80lb, bags60lb };
    }
  },
  {
    id: 'wallpaper-calculator',
    category: 'home',
    updatedAt: '2026-09-10',
    aliases: ['wallpaper rolls calculator', 'how much wallpaper do i need', 'wall covering calculator'],
    related: ['paint-calculator', 'tile-calculator', 'furniture-fit-calculator', 'concrete-calculator'],
    title: 'Wallpaper Calculator',
    description: 'Calculate how many rolls of wallpaper you need for a room, accounting for pattern repeat and waste.',
    example: 'Find rolls needed for a 12x14 ft room with 9 ft ceilings using standard US double rolls.',
    inputs: [
      { id: 'roomPerimeter', label: 'Room perimeter (ft)', type: 'number', placeholder: '52', defaultValue: 52, step: 1, min: 4 },
      { id: 'wallHeight', label: 'Wall height (ft)', type: 'number', placeholder: '9', defaultValue: 9, step: 0.5, min: 6 },
      { id: 'doors', label: 'Number of doors', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 },
      { id: 'windows', label: 'Number of windows', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 },
      { id: 'rollSqFt', label: 'Square feet per roll (US double roll = 56)', type: 'number', placeholder: '56', defaultValue: 56, step: 1, min: 10 },
      { id: 'patternRepeatInch', label: 'Pattern repeat (inches, 0 = no repeat)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    seo: {
      title: 'Wallpaper Calculator – Rolls Needed for Any Room',
      description: 'Calculate how many wallpaper rolls you need based on room size, wall height, doors, windows, and pattern repeat.',
      faq: [
        { question: 'What is a standard US wallpaper roll size?', answer: 'A standard US double roll covers approximately 56 sq ft. European single rolls cover about 28 sq ft. Always check the label.' },
        { question: 'How does pattern repeat affect wallpaper quantity?', answer: 'With a pattern repeat, some paper is wasted at each seam to match the pattern. Larger repeats (18+ inches) waste more paper and require more rolls.' }
      ]
    },
    compute(values) {
      const wallArea = values.roomPerimeter * values.wallHeight;
      const deductions = values.doors * 20 + values.windows * 15;
      const netArea = Math.max(0, wallArea - deductions);
      const repeatWasteFactor = values.patternRepeatInch > 0 ? 1 + (values.patternRepeatInch / (values.wallHeight * 12)) : 1;
      const adjustedArea = netArea * repeatWasteFactor * 1.1;
      const rollsNeeded = Math.ceil(adjustedArea / values.rollSqFt);
      return { wallArea, netArea, adjustedArea, rollsNeeded };
    }
  },
  {
    id: 'furniture-fit-calculator',
    category: 'home',
    updatedAt: '2026-09-10',
    aliases: ['will it fit calculator', 'room layout calculator', 'doorway fit calculator'],
    related: ['paint-calculator', 'tile-calculator', 'wallpaper-calculator', 'miles-to-kilometers-converter'],
    title: 'Furniture Fit Calculator',
    description: 'Check if a piece of furniture fits in your room with clearance space for walkways and doors.',
    example: 'Check if a 78x36 inch sofa fits in a 12x14 ft living room with 36 inch walkways.',
    inputs: [
      { id: 'roomLengthFt', label: 'Room length (ft)', type: 'number', placeholder: '14', defaultValue: 14, step: 0.5, min: 1 },
      { id: 'roomWidthFt', label: 'Room width (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'furnitureLengthIn', label: 'Furniture length (inches)', type: 'number', placeholder: '78', defaultValue: 78, step: 1, min: 1 },
      { id: 'furnitureWidthIn', label: 'Furniture width / depth (inches)', type: 'number', placeholder: '36', defaultValue: 36, step: 1, min: 1 },
      { id: 'clearanceIn', label: 'Desired walkway clearance (inches, min 36 per ADA)', type: 'number', placeholder: '36', defaultValue: 36, step: 1, min: 18 }
    ],
    seo: {
      title: 'Furniture Fit Calculator – Room Layout Planner',
      description: 'Check if furniture fits in your room with proper ADA-recommended walkway clearance. Enter room and furniture dimensions in feet and inches.',
      faq: [
        { question: 'How much clearance do I need around furniture?', answer: 'The ADA recommends at least 36 inches of clear walkway. Interior design guidelines suggest 30–36 inches around sofas and 42–48 inches for main traffic paths.' },
        { question: 'How do I measure furniture for a room?', answer: 'Measure the widest point of the furniture including legs and arms. Also measure doorways (standard US interior door is 80×32 inches) to ensure the piece can be moved in.' }
      ]
    },
    compute(values) {
      const roomLengthIn = values.roomLengthFt * 12;
      const roomWidthIn = values.roomWidthFt * 12;
      const remainingLength = roomLengthIn - values.furnitureLengthIn;
      const remainingWidth = roomWidthIn - values.furnitureWidthIn;
      const fitsLength = remainingLength >= values.clearanceIn ? 1 : 0;
      const fitsWidth = remainingWidth >= values.clearanceIn ? 1 : 0;
      const fits = fitsLength === 1 && fitsWidth === 1 ? 1 : 0;
      const furnitureSqFt = (values.furnitureLengthIn / 12) * (values.furnitureWidthIn / 12);
      const roomSqFt = values.roomLengthFt * values.roomWidthFt;
      return { fits, fitsLength, fitsWidth, remainingLength, remainingWidth, furnitureSqFt, roomSqFt };
    }
  },
  {
    id: 'electricity-bill-calculator',
    category: 'home',
    updatedAt: '2026-09-10',
    aliases: ['power bill estimator', 'kwh cost calculator', 'appliance running cost calculator', 'energy bill calculator'],
    related: ['ev-charging-calculator', 'inflation-calculator', 'fuel-cost-calculator', 'travel-budget-calculator'],
    title: 'Electricity Bill Estimator',
    description: 'Estimate your monthly electricity bill based on appliance usage and local utility rates.',
    example: 'Estimate monthly bill for a home using 900 kWh at $0.16/kWh with $12 fixed charges.',
    inputs: [
      { id: 'monthlyKwh', label: 'Monthly usage (kWh)', type: 'number', placeholder: '900', defaultValue: 900, step: 10, min: 0 },
      { id: 'ratePerKwh', label: 'Rate per kWh ($)', type: 'currency', placeholder: '0.16', defaultValue: 0.16, step: 0.01, min: 0 },
      { id: 'fixedCharges', label: 'Fixed monthly charges (delivery, taxes)', type: 'currency', placeholder: '12', defaultValue: 12, step: 1, min: 0 },
      { id: 'tieredThreshold', label: 'Tiered rate threshold (kWh, 0 = no tier)', type: 'number', placeholder: '0', defaultValue: 0, step: 50, min: 0 },
      { id: 'tieredRate', label: 'Rate above threshold ($/kWh)', type: 'currency', placeholder: '0.22', defaultValue: 0.22, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Electricity Bill Estimator – Monthly kWh Cost Calculator',
      description: 'Estimate your monthly electricity bill using kWh usage, utility rates, fixed charges, and tiered pricing common in US utility plans.',
      faq: [
        { question: 'What is the average US electricity bill?', answer: 'The average US household uses about 900 kWh/month, with bills averaging $115–$140 depending on state. Southern states tend to use more (AC), while Northeast states pay higher rates.' },
        { question: 'What are tiered electricity rates?', answer: 'Many US utilities charge a lower rate for the first block of usage (e.g., first 500 kWh) and a higher rate for usage above that threshold.' },
        { question: 'How can I reduce my electricity bill?', answer: 'Switch to LED lighting, use a programmable thermostat, run appliances during off-peak hours, and consider a time-of-use rate plan if your utility offers one.' }
      ]
    },
    compute(values) {
      let energyCharge: number;
      if (values.tieredThreshold > 0 && values.monthlyKwh > values.tieredThreshold) {
        energyCharge = values.tieredThreshold * values.ratePerKwh + (values.monthlyKwh - values.tieredThreshold) * values.tieredRate;
      } else {
        energyCharge = values.monthlyKwh * values.ratePerKwh;
      }
      const totalBill = energyCharge + values.fixedCharges;
      const costPerDay = totalBill / 30;
      const annualBill = totalBill * 12;
      const effectiveRatePerKwh = values.monthlyKwh > 0 ? totalBill / values.monthlyKwh : 0;
      return { energyCharge, totalBill, costPerDay, annualBill, effectiveRatePerKwh };
    }
  }
];
