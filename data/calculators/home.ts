import type { CalculatorConfig } from './types.ts';

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
    updatedAt: '2026-09-10',
    aliases: ['cubic yards of concrete calculator', 'cement calculator', 'slab concrete calculator'],
    related: ['tile-calculator', 'paint-calculator', 'wallpaper-calculator', 'gallons-to-liters-converter'],
    title: 'Concrete Calculator',
    description: 'Calculate cubic yards and bags of concrete needed for slabs, footings, or columns.',
    example: 'Calculate concrete for a 10x12 ft patio slab, 4 inches thick.',
    inputs: [
      { id: 'length', label: 'Length (ft)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.5, min: 0.1 },
      { id: 'width', label: 'Width (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 0.1 },
      { id: 'depthInches', label: 'Depth / thickness (inches)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0.5 },
      { id: 'wastePercent', label: 'Waste factor (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 }
    ],
    seo: {
      title: 'Concrete Calculator – Cubic Yards and Bags',
      description: 'Calculate how many cubic yards or 60-lb/80-lb bags of concrete you need for slabs, driveways, footings, and more.',
      faq: [
        { question: 'How many cubic yards do I need?', answer: 'Multiply length × width × depth (all in feet), then divide by 27 to convert cubic feet to cubic yards.' },
        { question: 'How many bags of concrete per cubic yard?', answer: 'One cubic yard requires approximately 45 bags of 80-lb concrete or 60 bags of 60-lb concrete.' },
        { question: 'Should I order extra concrete?', answer: 'Always order 10% extra to account for spillage, settling, and uneven subgrade.' }
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
