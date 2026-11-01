import type { CalculatorConfig } from './types.ts';
import { toBase } from '../../lib/units.ts';

// Cubic meters in one cubic yard (NIST SP 811 yard), used to convert solver SI volumes into the
// bags-per-cubic-yard figures from Quikrete's Concrete Mix data sheet.
const CUBIC_YARD_M3 = toBase(1, 'volume', 'yd3');

export const homeCalculators: CalculatorConfig[] = [
  {
    id: 'paint-calculator',
    category: 'home',
    glyph: 'gal',
    updatedAt: '2026-10-21',
    aliases: ['how much paint do i need', 'wall paint coverage calculator', 'paint gallons calculator', 'room paint estimator', 'paint cans needed calculator'],
    related: ['wallpaper-calculator', 'tile-calculator', 'concrete-calculator', 'furniture-fit-calculator'],
    title: 'Paint Calculator',
    description: 'Find how many gallons of paint a room needs from its dimensions, doors, windows and number of coats, with a buffer for touch-ups and the whole cans you should buy.',
    example: 'A 14x12 ft room with 9 ft ceilings, 1 door, 2 windows and 2 coats, at 350 sq ft per gallon, needs about 2.39 gallons (2.63 with a 10% buffer) — 3 one-gallon cans.',
    breakdown: {
      headline: 'gallonsWithBuffer',
      headlineLabel: 'Gallons to buy',
      outputs: [
        { id: 'gallonsWithBuffer', label: 'Gallons with a 10% buffer', format: 'number' },
        { id: 'cansToBuy', label: 'Cans to buy (1-gal cans)', format: 'integer' },
        { id: 'gallonsNeeded', label: 'Gallons needed (no buffer)', format: 'number' },
        { id: 'paintableArea', label: 'Paintable wall area', format: 'number', dimension: 'area', unit: 'ft2' },
        { id: 'ceilingGallons', label: 'Ceiling paint, same coats', format: 'number' }
      ],
      groups: [
        { title: 'Room', inputs: ['roomLength', 'roomWidth', 'ceilingHeight'] },
        { title: 'Doors, windows & coats', inputs: ['doors', 'windows', 'coats'] },
        { title: 'Paint coverage', inputs: ['coveragePerGallon'] }
      ],
      derive: (v) => ({ cansToBuy: Math.ceil(v.gallonsWithBuffer) }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'gallonsNeeded', label: 'Paint needed' },
          { from: 'cansToBuy', label: 'Cans to buy' }
        ],
        title: 'Gallons needed vs. whole cans to buy'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How much paint a room really takes',
        paragraphs: [
          'The area you are painting is the wall perimeter times the ceiling height, minus the doors and windows you will not paint over. Multiply that paintable area by the number of coats, since a second coat covers the same area again, and divide by how far a gallon spreads to get the gallons you need. A typical 14×12 ft room with 9 ft ceilings, one door and two windows works out to about 418 square feet of paintable wall, or 836 square feet across two coats.',
          'Manufacturers publish coverage per gallon on the can and on their technical data sheets, and it varies by product and by paint line. Sherwin-Williams states that a gallon of paint typically covers about 350–400 square feet, and Benjamin Moore’s data sheet for its Regal Select interior line lists 400–450 square feet per gallon at the recommended film thickness — both lower than the number on the label once you account for a rough, porous or previously unpainted surface, which soaks up more paint than a smooth repaint.',
          'A door is commonly treated as about 20 square feet and a window as about 15 square feet for a quick estimate, which is what this calculator subtracts. Since paint is sold in whole cans — usually 1-gallon cans, or 5-gallon buckets for bigger jobs — the gallons you calculate almost never line up with a round number, so a small buffer and rounding up to the next whole can keeps you from running out mid-wall.'
        ]
      },
      howTo: {
        intro: 'Enter the room, then the doors, windows and coats, then your paint’s coverage.',
        steps: [
          { name: 'Enter the room dimensions', text: 'Type the length, width and ceiling height in feet.' },
          { name: 'Enter doors and windows', text: 'Count how many of each the walls have; each is subtracted at about 20 and 15 square feet.' },
          { name: 'Set the number of coats', text: 'Most rooms use 2 coats for even color; 1 coat may be enough for a close color match with a self-priming paint.' },
          { name: 'Enter the coverage per gallon', text: 'Use the figure on your paint can or its data sheet; 350 is a reasonable default if you do not have it yet.' },
          { name: 'Read the result', text: 'The headline is the gallons to buy with a 10% buffer; the rows below show the exact gallons needed, the paintable area, and the ceiling if you paint it in the same number of coats.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Wall area comes from the room’s perimeter and height; paintable area subtracts doors and windows, and coats and coverage set the gallons.',
        expression: 'wall area = 2(L + W) × H\npaintable = wall area − (doors × 20 + windows × 15)\ngallons = paintable × coats ÷ coverage\nbuy = gallons × 1.10',
        terms: [
          { symbol: 'L, W, H', meaning: 'Room length, width and ceiling height, in feet.' },
          { symbol: 'doors, windows', meaning: 'Count of each; subtracted at about 20 and 15 sq ft apiece.' },
          { symbol: 'coats', meaning: 'Number of coats; each one re-covers the same paintable area.' },
          { symbol: 'coverage', meaning: 'Square feet one gallon covers, from the can or data sheet (350–450 is typical for interior paint).' }
        ],
        note: 'An estimate. Textured, porous or unprimed surfaces, dark-to-light color changes and spray application all change real coverage. Round up to the next whole can either way.'
      },
      workedExample: {
        intro: 'You are painting a 14 ft by 12 ft room with 9 ft ceilings, one door, two windows and two coats, using a paint rated at 350 sq ft per gallon.',
        rows: [
          { label: 'Wall area (2 × (14 + 12) × 9)', value: '468.00 sq ft' },
          { label: 'Deductions (1 × 20 + 2 × 15)', value: '50.00 sq ft' },
          { label: 'Paintable area (468.00 − 50.00)', value: '418.00 sq ft' },
          { label: 'Total area across 2 coats (418.00 × 2)', value: '836.00 sq ft' },
          { label: 'Gallons needed (836.00 ÷ 350)', value: '2.39 gal' },
          { label: 'With a 10% buffer (2.3886 × 1.10)', value: '2.63 gal' },
          { label: 'Cans to buy (round up)', value: '3 one-gallon cans' }
        ],
        result: '2.63 gallons needed, buy 3 one-gallon cans',
        explanation: 'The ceiling, 168 sq ft at the same two coats, adds another 0.96 gallons if you paint it too — close to a full extra gallon, worth planning for before you shop.'
      },
      watchOut: [
        { title: 'Texture and porosity change coverage', body: 'Coverage figures on the can assume a smooth, previously painted or primed surface. Textured walls, bare drywall or masonry can absorb noticeably more paint than the label states.' },
        { title: 'Coverage differs by product', body: 'Sherwin-Williams quotes about 350–400 sq ft per gallon; Benjamin Moore’s Regal Select data sheet lists 400–450 sq ft. Use the figure for your actual paint, not a generic number, when it matters.' },
        { title: 'A color change may need an extra coat', body: 'Benjamin Moore’s own data sheet recommends two coats on bare substrates to reach full color development; going from a dark wall to a light color, or the reverse, often needs a third coat or a tinted primer regardless of the stated coverage.' },
        { title: 'Paint comes in whole cans', body: 'You cannot buy 2.63 gallons; round up to 3 one-gallon cans or a bucket size your store sells. A small amount left over is useful for future touch-ups if the lid is sealed well.' },
        { title: 'The door and window deductions are averages', body: 'A standard interior door is close to 20 sq ft and a window to 15 sq ft, but oversized doors, bay windows or French doors remove more wall than that; measure an unusual opening directly.' }
      ],
      references: [
        { label: 'Sherwin-Williams, Paint Calculator (typical coverage per gallon)', url: 'https://www.sherwin-williams.com/en-us/color/color-tools/paint-calculator' },
        { label: 'Benjamin Moore, Regal Select Premium Interior Paint & Primer — Technical Data Sheet (coverage, recommended coats)', url: 'https://media.benjaminmoore.com/WebServices/prod/assets/stage/datasheets/TDS_0550/20180731%20550%20TDS%20US%20OKF.pdf' }
      ]
    },
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
      title: 'Paint Calculator – Gallons and Cans Needed for a Room',
      description: 'Free paint calculator: gallons of paint for any room from its dimensions, doors, windows and coats, with a 10% buffer and the whole cans to buy.',
      faq: [
        { question: 'How much paint do I need for a room?', answer: 'Find the wall area (2 × (length + width) × height), subtract about 20 sq ft per door and 15 sq ft per window, multiply by the number of coats, and divide by the coverage per gallon. A 14×12 ft room with 9 ft ceilings, one door, two windows and two coats needs about 2.39 gallons.' },
        { question: 'How much area does one gallon of paint cover?', answer: 'It depends on the product. Sherwin-Williams says a gallon typically covers about 350–400 sq ft; Benjamin Moore’s Regal Select data sheet lists 400–450 sq ft at the recommended film thickness. Textured or unprimed surfaces cover less.' },
        { question: 'Should I buy extra paint?', answer: 'Yes. A 10% buffer covers touch-ups and small miscalculations; in the example, 2.39 gallons becomes 2.63 with the buffer, which rounds up to 3 one-gallon cans.' },
        { question: 'How many coats does a room need?', answer: 'Most rooms need 2 coats for even color and durability. Benjamin Moore’s data sheet specifically recommends two coats on bare substrates; a close color match on a previously painted wall can sometimes get by with 1.' },
        { question: 'How much do doors and windows reduce the paint I need?', answer: 'About 20 sq ft per standard door and 15 sq ft per standard window are subtracted from the wall area before the gallons are calculated; unusually large openings remove more.' },
        { question: 'Do I need to paint the ceiling separately?', answer: 'Yes, it is not included in the wall total. The ceiling gallons row uses the room’s length × width at the same number of coats and coverage.' },
        { question: 'What if my walls are textured or a different color?', answer: 'Textured, porous or unprimed drywall absorbs more paint than a smooth repaint, and a big color change often needs an extra coat or a tinted primer, so budget above the calculated figure in those cases.' },
        { question: 'How many 1-gallon cans do I need to buy?', answer: 'Round the buffered gallons up to the next whole can. 2.63 gallons rounds up to 3 one-gallon cans, or you could buy one 5-gallon bucket for a bigger job.' }
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
    glyph: 'ft²',
    updatedAt: '2026-10-21',
    aliases: ['how many tiles do i need', 'floor tile calculator', 'tile area calculator', 'tile boxes calculator', 'bathroom tile estimator'],
    related: ['paint-calculator', 'wallpaper-calculator', 'concrete-calculator', 'furniture-fit-calculator'],
    title: 'Tile Calculator',
    description: 'Find how many tiles and boxes a floor or wall needs from the area and the tile size, with a waste allowance for cuts and breakage.',
    example: 'A 12x10 ft (120 sq ft) floor laid with 12x12 inch tiles needs 120 tiles, or 132 with a 10% waste allowance — 14 boxes at 10 tiles per box.',
    breakdown: {
      headline: 'boxesNeeded',
      headlineLabel: 'Boxes to buy',
      outputs: [
        { id: 'boxesNeeded', format: 'integer' },
        { id: 'tilesWithWaste', label: 'Tiles needed, with waste', format: 'number' },
        { id: 'tilesNeeded', label: 'Tiles needed, exact', format: 'number' },
        { id: 'roomSqFt', label: 'Area to cover', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Area to cover', inputs: ['areaLength', 'areaWidth'] },
        { title: 'Tile size', inputs: ['tileLengthInch', 'tileWidthInch'] },
        { title: 'Waste & box size', inputs: ['wastePercent', 'tilesPerBox'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'tilesNeeded', label: 'Exact tiles' },
          { from: 'tilesWithWaste', label: 'With waste allowance' }
        ],
        title: 'Tiles needed, before and after waste'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How many tiles and boxes a room needs',
        paragraphs: [
          'Tile is bought by the piece but measured by area, so the calculation has two steps: how many tiles cover the floor or wall, and how many boxes that rounds up to. Divide the area to cover by the footprint of one tile to get the exact count, then add a waste allowance for the cuts around edges, corners and fixtures that cannot be avoided. A 12 ft by 10 ft floor (120 sq ft) laid with 12×12 inch tiles needs exactly 120 tiles before any waste, since each tile covers 1 square foot.',
          'The waste allowance exists because cut tiles are rarely reusable elsewhere in the room: a tile trimmed to fit along one wall is now the wrong size for the rest of the floor. Installers commonly plan for around 10% extra on a simple, square layout, and more on a room with a lot of corners, a diagonal layout, or a pattern like herringbone that creates more odd-shaped offcuts. The calculator’s default of 10% suits a straightforward rectangular room; raise it for a more complex layout.',
          'Tile is sold by the box, so the last step rounds the tile count (with waste) up to a whole number of boxes, since a partial box still has to be bought in full. US floor tiles commonly come in sizes like 12×12, 16×16, 18×18 and 12×24 inches, while bathroom and kitchen walls often use smaller formats such as 3×6 inch subway tile — the tile-size fields here work for any rectangular tile, in any of those sizes.'
        ]
      },
      howTo: {
        intro: 'Enter the area, the tile size, and the waste and box settings.',
        steps: [
          { name: 'Enter the area to cover', text: 'Type the length and width of the floor or wall in feet. For an irregular room, measure it as a few rectangles and add the areas.' },
          { name: 'Enter the tile size', text: 'Type the tile’s length and width in inches, as printed on the box.' },
          { name: 'Set the waste allowance', text: 'Keep 10% for a simple layout, or raise it for diagonal, herringbone or heavily cut layouts.' },
          { name: 'Enter tiles per box', text: 'Check the box label; it varies by tile size and brand.' },
          { name: 'Read the result', text: 'The headline is the boxes to buy; the rows below show the exact tile count and the count with waste.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Area divided by one tile’s footprint gives the exact tile count; waste and box size set what you actually buy.',
        expression: 'tile area = (Lt ÷ 12) × (Wt ÷ 12)\ntiles = area ÷ tile area\ntiles(waste) = tiles × (1 + waste%)\nboxes = ⌈ tiles(waste) ÷ per box ⌉',
        terms: [
          { symbol: 'area', meaning: 'Floor or wall area to cover, in square feet.' },
          { symbol: 'Lt, Wt', meaning: 'Tile length and width, in inches.' },
          { symbol: 'waste%', meaning: 'Extra percent for cuts and breakage; 10% suits a simple rectangular layout.' },
          { symbol: 'per box', meaning: 'Tiles in one box, from the box label.' }
        ],
        note: 'An estimate. Grout line width, irregular rooms and pattern layouts (diagonal, herringbone) all change the real tile count; this treats the tile as its nominal size with no grout gap.'
      },
      workedExample: {
        intro: 'You are tiling a 12 ft by 10 ft bathroom floor with 12×12 inch tiles, 10 tiles per box, and a 10% waste allowance.',
        rows: [
          { label: 'Area (12 × 10)', value: '120.00 sq ft' },
          { label: 'Tile footprint ((12 ÷ 12) × (12 ÷ 12))', value: '1.00 sq ft' },
          { label: 'Exact tiles (120.00 ÷ 1.00)', value: '120.00' },
          { label: 'With 10% waste (120.00 × 1.10)', value: '132.00' },
          { label: 'Boxes (132.00 ÷ 10, rounded up)', value: '14 boxes' }
        ],
        result: '132 tiles, 14 boxes',
        explanation: 'That buys 140 tiles against the 132 needed, 8 spares — useful for future repairs, since replacement tile from a later production run can be a slightly different shade.'
      },
      watchOut: [
        { title: 'Grout lines are not counted', body: 'The calculator uses each tile’s nominal size with no gap for grout, so it is a close estimate for small joints and slightly optimistic for wide grout lines or large-format tile with big spacers.' },
        { title: 'Diagonal and pattern layouts use more tile', body: 'A layout run on the diagonal, or a pattern like herringbone or a brick offset, creates more odd-shaped cuts that cannot be reused, so raise the waste allowance above the 10% default for those layouts.' },
        { title: 'Boxes round up, so you may have leftovers', body: 'Since you can only buy whole boxes, you will usually end up with a few spare tiles. Keep them: later production runs can vary slightly in shade (a different dye lot), and a spare from the original run matches better than a new purchase.' },
        { title: 'Irregular rooms need to be split up', body: 'For an L-shaped room or one with alcoves, divide it into rectangles, find each area, and add them together before dividing by the tile footprint.' },
        { title: 'Wall tile and floor tile use the same math', body: 'The formula works for either; just measure the wall area (height × width, minus any large openings) instead of a floor footprint.' }
      ],
      references: [
        { label: 'Tile Council of North America, published ANSI A108/A118/A136.1 installation standards for ceramic, glass and stone tile', url: 'https://tcnatile.com/' },
        { label: 'Ceramic Tile Education Foundation, The TCNA Handbook for Ceramic, Glass and Stone Tile Installation', url: 'https://www.ceramictilefoundation.org/blog/tcna-handbook' }
      ]
    },
    inputs: [
      { id: 'areaLength', label: 'Area length (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 0.5 },
      { id: 'areaWidth', label: 'Area width (ft)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.5, min: 0.5 },
      { id: 'tileLengthInch', label: 'Tile length (inches)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'tileWidthInch', label: 'Tile width (inches)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'tilesPerBox', label: 'Tiles per box', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 }
    ],
    seo: {
      title: 'Tile Calculator – Tiles and Boxes Needed',
      description: 'Free tile calculator: how many tiles and boxes a floor or wall needs from the area and tile size, with a waste allowance for cuts and breakage.',
      faq: [
        { question: 'How many tiles do I need for a room?', answer: 'Divide the area by one tile’s footprint. A 12×10 ft (120 sq ft) floor with 12×12 inch (1 sq ft) tiles needs 120 tiles before waste.' },
        { question: 'How much extra tile should I order for waste?', answer: 'A common starting point is about 10% extra for a simple, square layout, with more for diagonal layouts, lots of corners, or patterns like herringbone that create more unusable offcuts.' },
        { question: 'How many boxes of tile do I need?', answer: 'Divide the tile count with waste by the tiles per box and round up, since boxes are sold whole. 132 tiles at 10 per box is 14 boxes.' },
        { question: 'What tile sizes are common for floors and walls?', answer: 'Common US floor sizes include 12×12, 16×16, 18×18 and 12×24 inch. Bathroom and kitchen walls often use smaller formats, such as 3×6 inch subway tile.' },
        { question: 'Does this calculator account for grout lines?', answer: 'No, it uses each tile’s nominal size. That is a close estimate for narrow grout joints and slightly understates the count for wide grout lines or tiles installed with large spacers.' },
        { question: 'Can I use this for wall tile, not just floors?', answer: 'Yes. Use the wall’s height and width (minus any large openings) as the area, and the same tile-size and waste fields apply.' },
        { question: 'How do I calculate tile for an L-shaped or irregular room?', answer: 'Split the room into rectangles, find the area of each, and add them together before entering the total as the area to cover.' },
        { question: 'Should I order all my tile at once?', answer: 'Yes, where possible. Tile is produced in batches (dye lots), and a later order can be a slightly different shade, so buying everything — including spares — from one run avoids a visible mismatch.' }
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
    glyph: 'yd³',
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
        explanation: 'The same 10 ft by 12 ft footprint poured 8 inches deep instead of 4 would need 2.96 cubic yards (3.26 with waste) — exactly double, since volume scales directly with depth for a fixed footprint. That is why even a modest increase in thickness raises the material cost by a lot.'
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
    glyph: 'roll',
    updatedAt: '2026-10-21',
    aliases: ['wallpaper rolls calculator', 'how much wallpaper do i need', 'wall covering calculator', 'double roll calculator', 'wallpaper pattern repeat calculator'],
    related: ['paint-calculator', 'tile-calculator', 'furniture-fit-calculator', 'concrete-calculator'],
    title: 'Wallpaper Calculator',
    description: 'Find how many rolls of wallpaper a room needs from its perimeter, wall height, doors and windows, with the extra material a pattern repeat and a waste allowance add.',
    example: 'A room with a 52 ft wall perimeter, 9 ft ceilings, 1 door and 2 windows needs about 8.21 standard US double rolls (56 sq ft each) with no pattern repeat — 9 rolls once rounded up.',
    breakdown: {
      headline: 'rollsNeeded',
      headlineLabel: 'Rolls to buy',
      outputs: [
        { id: 'rollsNeeded', format: 'integer' },
        { id: 'rollsExact', label: 'Rolls needed, exact', format: 'number' },
        { id: 'adjustedArea', label: 'Wallpaper needed (with pattern & waste)', format: 'number', dimension: 'area', unit: 'ft2' },
        { id: 'netArea', label: 'Net wall area (minus doors/windows)', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Room', inputs: ['roomPerimeter', 'wallHeight'] },
        { title: 'Doors & windows', inputs: ['doors', 'windows'] },
        { title: 'Roll & pattern', inputs: ['rollSqFt', 'patternRepeatInch'] }
      ],
      derive: (v) => ({ rollsExact: v.adjustedArea / v.rollSqFt }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'rollsExact', label: 'Exact rolls' },
          { from: 'rollsNeeded', label: 'Rolls to buy' }
        ],
        title: 'Rolls needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How many rolls of wallpaper a room needs',
        paragraphs: [
          'Start from the wall area: the room’s perimeter times the wall height, minus the doors and windows you will not cover. The Wallcovering Installers Association’s own rough estimator uses a similar idea in reverse — perimeter times height, divided by about 25 sq ft of usable coverage per single roll — which lands close to the deduction-based figure here once doors and windows are subtracted. US wallpaper is usually sold as a “double roll,” commonly listed around 56 sq ft, roughly twice a single roll, though the exact figure varies by product and is printed on the label.',
          'A pattern repeat adds real waste beyond the basic area, because each strip has to line up with the one next to it. The Wallcovering Installers Association notes that patterns with a significant drop match — 24 inches or more — require additional wallpaper to be ordered, since part of every strip above a certain length is trimmed off to keep the pattern aligned. A large, non-repeating texture or a solid color wastes almost nothing this way; a bold pattern with a big repeat can add 20% or more.',
          'On top of the pattern allowance, this calculator adds a flat 10% buffer for seams, mismeasurement and trimming at the ceiling and baseboard — standard practice alongside any pattern-specific waste. Since rolls are sold whole, the final step rounds the adjusted area, divided by the roll’s coverage, up to the next whole roll.'
        ]
      },
      howTo: {
        intro: 'Enter the room, then the doors and windows, then your roll size and pattern repeat.',
        steps: [
          { name: 'Enter the room perimeter and wall height', text: 'Measure around all the walls you are covering, in feet, and the height from baseboard to ceiling. For a single accent wall, use just that wall’s width as the perimeter.' },
          { name: 'Enter doors and windows', text: 'Count how many of each; each is subtracted at about 20 and 15 square feet.' },
          { name: 'Enter the roll size', text: 'Use the square footage printed on your wallpaper’s label; 56 is typical for a US double roll.' },
          { name: 'Enter the pattern repeat', text: 'Use 0 for a plain or random-match paper. For a patterned paper, use the vertical repeat distance in inches, from the label.' },
          { name: 'Read the result', text: 'The headline is the rolls to buy; the rows below show the exact rolls needed and the net and adjusted wall area.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Wall area comes from the perimeter and height; the pattern repeat and a flat waste allowance scale it up before dividing by the roll size.',
        expression: 'wall area = perimeter × height\nnet area = wall area − (doors × 20 + windows × 15)\nrepeat factor = 1 + repeat ÷ (height × 12), or 1 with no repeat\nadjusted area = net area × repeat factor × 1.10\nrolls = ⌈ adjusted area ÷ roll size ⌉',
        terms: [
          { symbol: 'perimeter, height', meaning: 'Total wall length and the wall height, in feet.' },
          { symbol: 'doors, windows', meaning: 'Count of each; subtracted at about 20 and 15 sq ft apiece.' },
          { symbol: 'repeat', meaning: 'Vertical pattern repeat, in inches; 0 for a plain or random-match paper.' },
          { symbol: 'roll size', meaning: 'Coverage of one roll, in sq ft, from the product label (about 56 for a US double roll).' }
        ],
        note: 'An estimate. Roll coverage, usable width and the exact waste from a given repeat vary by product; always check the specific wallpaper’s label, and consider a WIA-certified installer for a large pattern repeat or an irregular room.'
      },
      workedExample: {
        intro: 'A room has a 52 ft wall perimeter and 9 ft ceilings, with 1 door and 2 windows, using a 56 sq ft US double roll with no pattern repeat.',
        rows: [
          { label: 'Wall area (52 × 9)', value: '468.00 sq ft' },
          { label: 'Deductions (1 × 20 + 2 × 15)', value: '50.00 sq ft' },
          { label: 'Net area (468.00 − 50.00)', value: '418.00 sq ft' },
          { label: 'Repeat factor (no repeat)', value: '1.00' },
          { label: 'Adjusted area (418.00 × 1.00 × 1.10)', value: '459.80 sq ft' },
          { label: 'Rolls, exact (459.80 ÷ 56)', value: '8.21' },
          { label: 'Rolls to buy (rounded up)', value: '9 rolls' }
        ],
        result: '9 double rolls',
        explanation: 'The same room in a paper with a 24-inch pattern repeat has a repeat factor of 1.2222 instead of 1.00, raising the adjusted area to about 561.98 sq ft and the rolls to buy to 11 — two more rolls for the pattern match alone.'
      },
      watchOut: [
        { title: 'Pattern repeat adds real waste', body: 'The Wallcovering Installers Association notes that a significant drop match (24 inches or more) requires ordering additional wallpaper. In the worked example, a 24-inch repeat raises the roll count from 9 to 11 for the same room.' },
        { title: 'Roll size varies by brand', body: '56 sq ft is a common figure for a US double roll, but it is not universal, and a European single roll covers roughly half that. Use the figure printed on your specific product.' },
        { title: 'Measure the whole room, not one wall', body: 'The perimeter field expects the total length of every wall you are covering. For a single accent wall, enter just that wall’s width instead.' },
        { title: 'Buy from the same production run', body: 'Wallpaper, like paint and tile, can vary slightly between print runs (a different dye lot), so buy enough — including a spare roll — from one order rather than reordering partway through.' },
        { title: 'Textured or heavily patterned walls trim more', body: 'A busy pattern, an odd-shaped room, or a wall with a lot of corners typically wastes more than the flat 10% buffer accounts for; a wallcovering installer can give a tighter estimate for a complex job.' }
      ],
      references: [
        { label: 'Wallcovering Installers Association, Wallpaper Tips & Info (pattern match types, drop match waste)', url: 'https://www.wallcoveringinstallers.org/consumers/wallcovering-resources/wallcovering-info-and-tips/' },
        { label: 'Wallcovering Installers Association, Wallcovering Estimator (perimeter × height ÷ coverage formula)', url: 'https://www.wallcoveringinstallers.org/consumers/wallcovering-resources/wallcovering-estimator/' }
      ]
    },
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
      description: 'Free wallpaper calculator: how many rolls a room needs from its perimeter, wall height, doors, windows and pattern repeat, with a waste allowance.',
      faq: [
        { question: 'How many rolls of wallpaper do I need?', answer: 'Find the net wall area (perimeter × height, minus doors and windows), scale it up for any pattern repeat and a 10% waste buffer, then divide by the roll’s coverage and round up. A 52 ft, 9 ft-tall room with no repeat needs about 9 double rolls.' },
        { question: 'What is a wallpaper "double roll"?', answer: 'US wallpaper is typically sold as a double roll, commonly listed around 56 sq ft of coverage — roughly twice a single roll. The exact figure varies by product, so check the label.' },
        { question: 'How does pattern repeat affect how much wallpaper I need?', answer: 'The Wallcovering Installers Association notes that patterns with a significant drop match (24 inches or more) require ordering additional wallpaper, since part of each strip is trimmed to keep the pattern aligned. In the worked example, a 24-inch repeat raises a 9-roll job to 11 rolls.' },
        { question: 'Should I order extra wallpaper?', answer: 'Yes. The calculator already adds a 10% buffer for seams and trimming on top of any pattern-repeat waste; buying one extra roll beyond that is common practice for future repairs.' },
        { question: 'How much do doors and windows reduce the wallpaper I need?', answer: 'About 20 sq ft per standard door and 15 sq ft per standard window are subtracted from the wall area before the rolls are calculated.' },
        { question: 'What if my room isn’t rectangular?', answer: 'Measure the total perimeter of every wall you are covering (adding up each wall’s length) and use that as the room perimeter; the height is assumed to be the same all the way around.' },
        { question: 'Can I use this for a single accent wall?', answer: 'Yes. Enter just that wall’s width as the perimeter instead of the whole room, and the same formula applies.' },
        { question: 'What is a drop match versus a straight match?', answer: 'In a straight-across match, the design lines up the same way on every strip. In a drop match, the pattern is offset between strips, so the repeat distance effectively doubles for every other strip, which is why large-repeat patterns waste more paper.' }
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
    glyph: 'fit',
    updatedAt: '2026-10-21',
    aliases: ['will it fit calculator', 'room layout calculator', 'doorway fit calculator', 'furniture clearance calculator'],
    related: ['paint-calculator', 'tile-calculator', 'wallpaper-calculator', 'concrete-calculator'],
    title: 'Furniture Fit Calculator',
    description: 'Check whether a sofa, bed or other piece of furniture leaves enough walkway clearance in a room, measured along the room’s length and width separately, in feet or inches.',
    example: 'A 78x36 inch sofa in a 14x12 ft room, with a 36 inch clearance target, leaves 54 inches to spare along the room’s length and 72 inches along its width — it fits comfortably.',
    breakdown: {
      headline: 'tightestMargin',
      headlineLabel: 'Tightest clearance margin',
      outputs: [
        { id: 'tightestMargin', label: 'Tightest clearance margin', format: 'number', dimension: 'length', unit: 'in' },
        { id: 'marginLength', label: 'Clearance margin along the length', format: 'number', dimension: 'length', unit: 'in' },
        { id: 'marginWidth', label: 'Clearance margin along the width', format: 'number', dimension: 'length', unit: 'in' },
        { id: 'roomSqFt', label: 'Room area', format: 'number', dimension: 'area', unit: 'ft2' },
        { id: 'furnitureSqFt', label: 'Furniture footprint', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Room', inputs: ['roomLengthFt', 'roomWidthFt'] },
        { title: 'Furniture', inputs: ['furnitureLengthIn', 'furnitureWidthIn'] },
        { title: 'Clearance', inputs: ['clearanceIn'] }
      ],
      derive: (v) => ({
        marginLength: v.remainingLength - v.clearanceIn,
        marginWidth: v.remainingWidth - v.clearanceIn,
        tightestMargin: Math.min(v.remainingLength - v.clearanceIn, v.remainingWidth - v.clearanceIn)
      }),
      visual: {
        type: 'rangeBar',
        value: 'tightestMargin',
        title: 'Tightest clearance margin',
        bands: [
          { label: 'Won’t fit', min: -36, max: 0 },
          { label: 'Fits, tight', min: 0, max: 12 },
          { label: 'Comfortable', min: 12, max: 36 },
          { label: 'Spacious', min: 36, max: 96 }
        ]
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What “does it fit” means here',
        paragraphs: [
          'This calculator makes two independent checks. Along the room’s length, it subtracts the furniture’s length from the room’s length (in inches) to see how much floor is left; along the room’s width, it does the same subtraction the other way. Both leftover strips are then compared against your clearance target — commonly 36 inches, the minimum clear width the U.S. Access Board’s 2010 ADA Standards set for an accessible route. A 14×12 ft room (168×144 inches) with a 78×36 inch sofa and a 36-inch clearance target leaves 90 inches lengthwise and 108 inches widthwise before the clearance is subtracted — margins of 54 and 72 inches once it is, so the sofa clears the target in both directions.',
          'It is a quick sanity check, not a floor-plan simulator. The math treats the furniture as a rectangle sitting flush against one wall, fully inside the room, and checks the two directions on their own rather than modeling the true L-shaped floor space left around a piece placed in a corner. It does not know about doors swinging into the room, outlets, radiators, other furniture already in place, or a sectional’s actual silhouette, which can be considerably bigger than its simple length-by-width footprint. Treat a “fits” result as a green light to measure for real — painter’s tape on the floor in the furniture’s footprint is the cheap way to confirm it before anything is delivered.',
          'A “fits” result also only covers the room, not the route to it. The furniture still has to get through a doorway or hallway to reach that room, and the legal minimum for an interior opening is narrower than the ADA’s walkway figure: the International Residential Code’s required egress door needs a clear width of only 32 inches (IRC R311.2), and the code sets no minimum at all for other interior doors beyond that one. A sofa that comfortably clears a 36-inch walkway target can still be a tight squeeze, or need to go in at an angle, through a 32-inch door frame or a narrower older one.'
        ]
      },
      howTo: {
        intro: 'Enter the room, then the furniture’s footprint, then the clearance you want to keep clear.',
        steps: [
          { name: 'Enter the room dimensions', text: 'Type the room’s length and width in feet.' },
          { name: 'Enter the furniture’s footprint', text: 'Measure its length and width in inches at the widest point, including arms, rolled edges and legs.' },
          { name: 'Set your clearance target', text: '36 inches matches the ADA’s minimum clear width for an accessible route; a secondary path past a side table can be tighter, a busy shared path wider.' },
          { name: 'Read the result', text: 'The headline is the tighter of the two margins. Positive means it clears your target in both directions by that many inches; negative means it falls short in at least one direction.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The room is converted to inches, the furniture’s footprint is subtracted in each direction, and the clearance target is subtracted from what is left.',
        expression: 'remaining length = (room length × 12) − furniture length\nremaining width = (room width × 12) − furniture width\nmargin = remaining − clearance\nfits = margin(length) ≥ 0 and margin(width) ≥ 0',
        terms: [
          { symbol: 'room length, width', meaning: 'Room dimensions, in feet, converted to inches by multiplying by 12.' },
          { symbol: 'furniture length, width', meaning: 'The furniture’s footprint, in inches, at its widest point in each direction.' },
          { symbol: 'clearance', meaning: 'Your walkway clearance target, in inches — 36 matches the ADA minimum for an accessible route.' },
          { symbol: 'margin', meaning: 'Spare space beyond the clearance target in that direction; negative means it falls short.' }
        ],
        note: 'A two-direction check, not a floor-plan simulator — it assumes the furniture’s bounding box sits flush against one wall with nothing else in the room, and it does not check whether the piece can get through a doorway.'
      },
      workedExample: {
        intro: 'You are placing a 78×36 inch sofa in a 14 ft by 12 ft room, with a 36-inch clearance target.',
        rows: [
          { label: 'Room in inches (14 × 12 × 12)', value: '168 in × 144 in' },
          { label: 'Space left lengthwise (168 − 78)', value: '90 in' },
          { label: 'Space left widthwise (144 − 36)', value: '108 in' },
          { label: 'Clearance margin, length side (90 − 36)', value: '54 in' },
          { label: 'Clearance margin, width side (108 − 36)', value: '72 in' },
          { label: 'Tightest margin', value: '54 in' }
        ],
        result: 'Fits, with 54 in to spare in the tightest direction',
        explanation: 'A much longer, 140-inch sectional in the same room would leave only 28 in lengthwise — 8 in short of the 36-inch target — so this check would flag it as not fitting lengthwise even though it still clears the width check.'
      },
      watchOut: [
        { title: 'Two directions, not a real layout', body: 'The calculator checks the length and width independently; it does not model the L-shaped floor space actually left when a piece sits in a corner, or know about doors, outlets or other furniture already in the room.' },
        { title: 'A doorway check is separate from a walkway check', body: 'Clearing your walkway target does not mean the piece clears the door on the way in. The IRC’s required egress door has a legal minimum clear width of only 32 inches (R311.2), and the code sets no minimum at all for other interior doors — measure the actual doorway the piece has to pass through.' },
        { title: 'Clearance targets depend on the path', body: '36 inches is the ADA’s minimum for an accessible route generally; a secondary path past a side table can be tighter, while the ADA calls for 42 inches approaching a tight 180-degree turn — this tool checks a single straight clearance, not a turn.' },
        { title: 'Measure the widest point', body: 'Arms, rolled edges, reclined leg rests and cushions all add to a piece’s real footprint. Measuring only the frame underestimates how much floor it actually needs.' },
        { title: 'Both margins have to clear', body: 'A piece that is deep but narrow can pass the width check and fail the length check, or the reverse — the headline tightest margin is whichever one is closer to zero.' },
        { title: 'An estimate, not a substitute for taping it out', body: 'This is a straight-line sanity check. For an irregular room, an L-shaped sectional, or a piece going up a staircase or around a tight turn, mark the footprint on the floor with tape and walk it before you buy.' }
      ],
      references: [
        { label: 'U.S. Access Board, 2010 ADA Standards for Accessible Design — Chapter 4, Accessible Routes (403.5.1 clear width, 403.5.2 turns)', url: 'https://www.access-board.gov/ada/chapter/ch04/' },
        { label: 'International Code Council, International Residential Code — R311.6 Hallways (36 in minimum width)', url: 'https://up.codes/s/hallways' },
        { label: 'International Code Council, International Residential Code — R311.2 Egress Door (32 in minimum clear width)', url: 'https://up.codes/s/egress-door' }
      ]
    },
    inputs: [
      { id: 'roomLengthFt', label: 'Room length', type: 'number', placeholder: '14', defaultValue: 14, step: 0.5, min: 1, dimension: 'length', unit: 'ft' },
      { id: 'roomWidthFt', label: 'Room width', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1, dimension: 'length', unit: 'ft' },
      { id: 'furnitureLengthIn', label: 'Furniture length', type: 'number', placeholder: '78', defaultValue: 78, step: 1, min: 1, dimension: 'length', unit: 'in' },
      { id: 'furnitureWidthIn', label: 'Furniture width / depth', type: 'number', placeholder: '36', defaultValue: 36, step: 1, min: 1, dimension: 'length', unit: 'in' },
      { id: 'clearanceIn', label: 'Desired walkway clearance (min 36 in per ADA)', type: 'number', placeholder: '36', defaultValue: 36, step: 1, min: 18, dimension: 'length', unit: 'in' }
    ],
    seo: {
      title: 'Furniture Fit Calculator – Room Layout & Clearance Planner',
      description: 'Check if furniture fits in your room with enough walkway clearance, measured against the ADA’s 36-inch accessible-route minimum. Enter room and furniture dimensions in feet and inches.',
      faq: [
        { question: 'How much clearance does a sofa or other furniture need?', answer: 'The U.S. Access Board’s ADA Standards set 36 inches as the minimum clear width for an accessible route. That is a reasonable default for a main walkway; a secondary path past a side table can be tighter.' },
        { question: 'Does this check whether the furniture fits through the door?', answer: 'No — it only checks the room’s floor space. A doorway is a separate check: the IRC’s required egress door has a legal minimum clear width of just 32 inches, narrower than most walkway targets, and other interior doors have no code minimum at all.' },
        { question: 'How do I measure furniture for this calculator?', answer: 'Measure the length and width at the widest point, including arms, rolled edges and any legs or reclined footrests, not just the main frame.' },
        { question: 'What does a negative clearance margin mean?', answer: 'It means the room falls short of your clearance target in that direction by that many inches — for example, a margin of −8 in means the piece needs 8 more inches than the room provides, in that direction.' },
        { question: 'Does this work for an L-shaped sectional?', answer: 'Only approximately. Enter the sectional’s overall length and width as if it were a rectangle; the actual L shape leaves more usable floor at the open corner than this simple bounding-box check assumes.' },
        { question: 'What clearance should I use for a shared or busy path?', answer: 'The ADA calls for 42 inches of clear width approaching a tight 180-degree turn, more than the general 36-inch minimum, so a busier shared path is a reasonable place to raise the clearance target.' },
        { question: 'Why do both the length and width checks matter?', answer: 'A piece can be too long for one direction but fine for the other. The headline “tightest margin” is whichever of the two checks is closer to failing, so you can see which dimension is the actual constraint.' },
        { question: 'Is this a substitute for measuring the room myself?', answer: 'No. It is a quick sanity check from a tape-measure’s worth of numbers. For anything close to the limit, or an irregular room, mark the furniture’s footprint on the floor with tape before you buy or move it.' }
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
    glyph: 'kWh',
    updatedAt: '2026-10-21',
    aliases: ['power bill estimator', 'kwh cost calculator', 'appliance running cost calculator', 'energy bill calculator', 'tiered electricity rate calculator'],
    related: ['ev-charging-calculator', 'fuel-cost-calculator', 'commute-cost-calculator', 'inflation-calculator'],
    title: 'Electricity Bill Estimator',
    description: 'Estimate a monthly electricity bill from usage, rate and fixed charges, with an optional tiered (inclining-block) rate for usage above a threshold.',
    example: 'A home using 900 kWh at $0.16/kWh with $12 in fixed monthly charges and no tiered rate comes to about $156.00 for the month — $1,872.00 projected for the year.',
    breakdown: {
      headline: 'totalBill',
      headlineLabel: 'Estimated monthly bill',
      outputs: [
        { id: 'totalBill', label: 'Estimated monthly bill', format: 'currency' },
        { id: 'energyCharge', label: 'Energy charge (before fixed charges)', format: 'currency' },
        { id: 'effectiveRatePer100kWh', label: 'Effective rate (per 100 kWh, fixed charges included)', format: 'currency' },
        { id: 'costPerDay', label: 'Cost per day (30-day month)', format: 'currency' },
        { id: 'annualBill', label: 'Projected annual bill', format: 'currency' }
      ],
      groups: [
        { title: 'Usage', inputs: ['monthlyKwh'] },
        { title: 'Rate & fixed charges', inputs: ['ratePerKwh', 'fixedCharges'] },
        { title: 'Tiered pricing, if your utility bills this way', inputs: ['tieredThreshold', 'tieredRate'], optional: true }
      ],
      derive: (v) => ({ effectiveRatePer100kWh: v.effectiveRatePerKwh * 100 }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'energyCharge', label: 'Energy charge' },
          { from: 'totalBill', label: 'Total bill' }
        ],
        title: 'Energy charge vs. total bill with fixed charges'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What goes into an estimated electricity bill',
        paragraphs: [
          'The core of a bill is simple: usage times rate. Multiply the kilowatt-hours (kWh) a home uses in a month by the per-kWh rate on the bill, and that is the energy charge. The U.S. Energy Information Administration puts the average U.S. residential customer’s usage at about 899 kWh per month (10,791 kWh a year, EIA), which is why this calculator defaults to 900 — but the rate that gets multiplied by it varies enormously. EIA’s Electric Power Monthly put the national average residential rate at 18.31 cents per kWh in July 2026, ranging from 13.41 cents in North Dakota to 48.00 cents in Hawaii, so using your own rate from your own bill matters far more than any national average.',
          'On top of the energy charge, nearly every bill adds fixed monthly charges — a customer or meter charge, delivery charges, and taxes — that do not scale with usage at all. Total bill is energy charge plus fixed charges. Because that fixed amount is spread across however many kWh were used, the bill’s effective rate (total bill ÷ usage) is always a little higher than the stated per-kWh rate: at the calculator’s defaults, a $0.16 rate and a $12 fixed charge work out to an effective rate of about $0.1733 per kWh, 8.3% above the stated rate.',
          'Some utilities also bill a “block-rate structure” — EIA’s glossary defines it as a rate schedule that charges a different unit cost for successive blocks of usage, commonly a lower rate up to a threshold and a higher rate beyond it, intended to reward conservation. This calculator’s tiered-threshold field models exactly that: leave it at 0 for a flat rate, or set it to your utility’s threshold and a second rate for usage above it. A separate structure, time-of-use (TOU) pricing, charges more during peak hours of the day regardless of total volume — this calculator does not model a TOU schedule, so treat any result here as an estimate against your own bill’s actual rate structure.'
        ]
      },
      howTo: {
        intro: 'Enter your usage, your rate and your fixed charges; add a tiered threshold only if your utility bills that way.',
        steps: [
          { name: 'Enter monthly usage', text: 'Type the kilowatt-hours used in the month, from a recent bill, or use the roughly 900 kWh/month a typical U.S. household uses.' },
          { name: 'Enter your rate per kWh', text: 'Use the per-kWh figure from your bill’s energy or supply charge line.' },
          { name: 'Enter fixed monthly charges', text: 'Add the flat customer, meter or delivery charge and any taxes that do not change with usage.' },
          { name: 'Set a tiered rate, if your utility uses one', text: 'Enter the kWh threshold and the higher rate that applies above it. Leave the threshold at 0 for a flat, single rate.' },
          { name: 'Read the result', text: 'The headline is the estimated monthly bill; the rows below show the energy charge before fixed costs, the effective rate per 100 kWh, the daily cost and the bill projected across a year.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The energy charge is usage times rate, or a two-tier split once usage passes a threshold; fixed charges and a few simple conversions do the rest.',
        expression: 'energy charge = usage × rate                                    (usage ≤ threshold, or no threshold)\nenergy charge = threshold × rate + (usage − threshold) × tier-2 rate   (usage > threshold > 0)\ntotal bill = energy charge + fixed charges\nannual bill = total bill × 12\neffective rate = total bill ÷ usage',
        terms: [
          { symbol: 'usage', meaning: 'Monthly electricity usage, in kWh.' },
          { symbol: 'rate', meaning: 'Per-kWh rate for usage up to the threshold (or all usage, with no threshold).' },
          { symbol: 'threshold, tier-2 rate', meaning: 'The kWh level where a higher rate starts, and that higher rate; 0 means a flat rate throughout.' },
          { symbol: 'fixed charges', meaning: 'Flat monthly charges that do not scale with usage — customer, meter, delivery and tax lines.' },
          { symbol: 'effective rate', meaning: 'The whole bill divided by usage — always at or above the stated per-kWh rate once any fixed charge is added.' }
        ],
        note: 'An estimate only. Real bills also add taxes and surcharges beyond a flat fixed charge, and many utilities bill some or all usage on a time-of-use schedule that varies by time of day rather than a flat or two-tier per-kWh rate — check your own utility’s rate schedule for an exact figure.'
      },
      workedExample: {
        intro: 'A home uses 900 kWh in a month, pays $0.16 per kWh with no tiered rate, and has $12 in fixed monthly charges.',
        rows: [
          { label: 'Energy charge (900 × $0.16)', value: '$144.00' },
          { label: 'Plus fixed charges', value: '$12.00' },
          { label: 'Total bill (144.00 + 12.00)', value: '$156.00' },
          { label: 'Cost per day (156.00 ÷ 30)', value: '$5.20' },
          { label: 'Projected annual bill (156.00 × 12)', value: '$1,872.00' },
          { label: 'Effective rate (156.00 ÷ 900)', value: '$0.1733/kWh' }
        ],
        result: '$156.00 estimated this month, $1,872.00 projected for the year',
        explanation: 'The effective rate, $0.1733 per kWh, is 8.3% above the stated $0.16 rate — entirely because the flat $12 fixed charge gets spread across the 900 kWh used. A lower-usage month spreads that same $12 over fewer kWh, pushing the effective rate up further even if the stated per-kWh rate never changes.'
      },
      watchOut: [
        { title: 'This is an estimate, not a bill', body: 'Real bills add taxes, regulatory surcharges and sometimes demand or minimum-usage charges this calculator does not model, on top of the energy and fixed charges it does.' },
        { title: 'Rates vary enormously by state and utility', body: 'EIA’s Electric Power Monthly put the July 2026 residential average at 18.31 cents per kWh nationally, 13.41 cents in North Dakota and 48.00 cents in Hawaii — use your own bill’s rate, not a national figure.' },
        { title: 'Tiered and time-of-use are different things', body: 'A tiered (block) rate charges more once total usage crosses a threshold, which is what this calculator models. A time-of-use rate charges more during peak hours of the day regardless of total usage — a separate structure this calculator does not model.' },
        { title: 'Usage swings with the seasons', body: 'Heating and cooling can push monthly usage well above or below a 900 kWh baseline; a single month’s estimate does not represent a whole year unless usage is unusually stable.' },
        { title: 'Small efficiency changes add up over a year', body: 'ENERGY STAR estimates that swapping a home’s five most-used bulbs for certified LEDs saves about $40 a year, and an ENERGY STAR smart thermostat cuts heating and cooling costs by more than 8%, about $50 a year on average (more if the home is often empty during the day) — useful context, not a guarantee for any specific bill.' }
      ],
      references: [
        { label: 'U.S. Energy Information Administration, Electric Power Monthly, Table 5.6.A — Average Price of Electricity to Ultimate Customers (national and state residential rates)', url: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=table_5_06_a' },
        { label: 'U.S. Energy Information Administration, FAQ — How much electricity does an American home use?', url: 'https://www.eia.gov/tools/faqs/faq.php?id=97&t=3' },
        { label: 'U.S. Energy Information Administration, Glossary — Block-rate structure', url: 'https://www.eia.gov/tools/glossary/index.php?id=Block-rate_structure' },
        { label: 'ENERGY STAR, Low- to No-Cost Tips for Saving Energy at Home', url: 'https://www.energystar.gov/products/recent_program_updates/low-no-cost-tips' }
      ]
    },
    inputs: [
      { id: 'monthlyKwh', label: 'Monthly usage', type: 'number', placeholder: '900', defaultValue: 900, step: 10, min: 0, dimension: 'energy', unit: 'kWh' },
      { id: 'ratePerKwh', label: 'Rate per kWh', type: 'currency', placeholder: '0.16', defaultValue: 0.16, step: 0.01, min: 0 },
      { id: 'fixedCharges', label: 'Fixed monthly charges (delivery, customer charge, taxes)', type: 'currency', placeholder: '12', defaultValue: 12, step: 1, min: 0 },
      { id: 'tieredThreshold', label: 'Tiered-rate threshold (0 = flat rate)', type: 'number', placeholder: '0', defaultValue: 0, step: 50, min: 0, dimension: 'energy', unit: 'kWh' },
      { id: 'tieredRate', label: 'Rate above the threshold', type: 'currency', placeholder: '0.22', defaultValue: 0.22, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Electricity Bill Estimator – Monthly kWh Cost Calculator',
      description: 'Estimate your monthly electricity bill using kWh usage, your utility rate, fixed charges, and an optional tiered (inclining-block) rate for usage above a threshold.',
      faq: [
        { question: 'What is the average US electricity bill?', answer: 'Multiplying EIA’s national averages — about 899 kWh of monthly usage and an 18.31 cents/kWh residential rate (July 2026) — gives roughly $164.61 a month, but actual bills vary widely: EIA’s state rates alone range from 13.41 cents per kWh in North Dakota to 48.00 cents in Hawaii.' },
        { question: 'What is a tiered (inclining-block) electricity rate?', answer: 'EIA defines a block-rate structure as a rate schedule that charges a different unit cost for successive blocks of usage — commonly a lower rate up to a threshold and a higher rate beyond it, meant to reward conservation.' },
        { question: 'How do I find my own rate and fixed charges?', answer: 'Look at a recent bill’s energy or supply charge line for the per-kWh rate, and its customer, meter or delivery charge lines for the fixed amount that does not change with usage.' },
        { question: 'Why is my effective rate higher than the rate I entered?', answer: 'The effective rate is the whole bill divided by usage, so the fixed charge gets spread across however many kWh were used. At this calculator’s defaults, a $0.16 stated rate becomes a $0.1733 effective rate once the $12 fixed charge is included — 8.3% higher.' },
        { question: 'Does this estimate include taxes?', answer: 'Only if you add them into the fixed-charges field. This calculator does not add taxes or regulatory surcharges on its own, so treat the result as an estimate against your own bill.' },
        { question: 'What is the difference between a tiered rate and a time-of-use rate?', answer: 'A tiered rate charges more once total monthly usage crosses a threshold, which this calculator models. A time-of-use rate charges more during peak hours of the day regardless of total usage — a different structure this calculator does not model.' },
        { question: 'How can I lower my electricity bill?', answer: 'ENERGY STAR estimates that replacing a home’s five most-used light fixtures with certified LEDs saves about $40 a year, and an ENERGY STAR smart thermostat cuts heating and cooling costs by more than 8% (about $50 a year on average, more if the home is often empty during the day).' },
        { question: 'How accurate is this estimate?', answer: 'It models the energy charge, an optional two-tier rate, and a flat fixed charge — the main drivers of most residential bills — but not taxes, surcharges, demand charges or a time-of-use schedule, so compare it against an actual bill rather than treating it as exact.' }
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
