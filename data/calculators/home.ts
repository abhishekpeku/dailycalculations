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
  },
  {
    id: 'drywall-calculator',
    category: 'home',
    glyph: 'sht',
    updatedAt: '2026-11-02',
    aliases: ['how many sheets of drywall do i need', 'sheetrock calculator', 'gypsum board calculator', 'drywall sheets calculator', 'how much drywall do i need'],
    related: ['paint-calculator', 'wallpaper-calculator', 'tile-calculator', 'concrete-calculator'],
    title: 'Drywall Calculator',
    description: 'Find how many sheets of drywall a room needs from its dimensions, doors, windows and sheet size, with a waste allowance for cuts and breakage, in sheets needed and square feet of coverage.',
    example: 'A 14x12 ft room with 9 ft ceilings, 1 door and 2 windows needs 15 standard 4x8 ft sheets of drywall (480 sq ft) for the walls alone, with a 10% waste allowance.',
    breakdown: {
      headline: 'sheetsToBuy',
      headlineLabel: 'Sheets to buy',
      outputs: [
        { id: 'sheetsToBuy', label: 'Sheets to buy', format: 'integer' },
        { id: 'sheetsWithWaste', label: 'Sheets needed, with waste', format: 'number' },
        { id: 'sheetsExact', label: 'Sheets needed, exact', format: 'number' },
        { id: 'coverageBought', label: 'Coverage bought', format: 'number', dimension: 'area', unit: 'ft2' },
        { id: 'totalArea', label: 'Area to cover', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Room', inputs: ['roomLength', 'roomWidth', 'ceilingHeight'] },
        { title: 'Doors, windows & ceiling', inputs: ['doors', 'windows', 'includeCeiling'] },
        { title: 'Sheet size & waste', inputs: ['sheetSqFt', 'wastePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'sheetsExact', label: 'Exact sheets' },
          { from: 'sheetsToBuy', label: 'Sheets to buy' }
        ],
        title: 'Sheets needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-11-02',
      concept: {
        title: 'How many sheets of drywall a room needs',
        paragraphs: [
          'Start from the wall area — the room’s perimeter times the ceiling height, minus the doors and windows you will not cover — the same deduction this site’s paint and wallpaper calculators use, at about 20 sq ft per door and 15 sq ft per window. Divide that area by one sheet’s coverage to get the exact sheet count, then decide whether to cover the ceiling the same way. USG’s own Sheetrock Brand Installation and Finishing Guide walks through exactly this: measure the length and height of each wall, subtract large openings, do the same for the ceiling, then total the square footage and look up the sheet count.',
          'Drywall is sold in a few standard sizes. USG’s guide and the panels sold at Home Depot and Lowe’s agree on the same three: 4×8 ft (32 sq ft) is the standard, most common size for most rooms; 4×10 ft (40 sq ft) and 4×12 ft (48 sq ft) cover a tall wall or a long run with fewer seams, trading a bigger, heavier, harder-to-maneuver panel for less taping. A 4×8 ft sheet weighs just over 50 lb, per Home Depot’s own panel guide — the longer sizes weigh proportionally more and are harder for one person to carry alone.',
          'Neither manufacturer’s own guide states a specific waste percentage — their coverage tables assume you already know how many sheets you want, cuts included. In practice, contractors commonly add about 10% on top of the exact count for trim waste and breakage on a simple, rectangular room, and raise that to 15% or more for a room with a lot of corners, angles, or window and door openings that force more cuts. Since sheets are sold whole, the final step always rounds the sheet count (with waste) up.'
        ]
      },
      howTo: {
        intro: 'Enter the room, then its doors, windows and whether you are covering the ceiling, then your sheet size and waste allowance.',
        steps: [
          { name: 'Enter the room dimensions', text: 'Type the length, width and ceiling height in feet.' },
          { name: 'Enter doors and windows', text: 'Count how many of each the walls have; each is subtracted at about 20 and 15 square feet.' },
          { name: 'Choose whether to include the ceiling', text: 'Select “yes” to add the ceiling’s square footage (length × width) to the total; select “no” for walls only.' },
          { name: 'Pick your sheet size', text: '4×8 ft (32 sq ft) is standard for most rooms; 4×12 ft (48 sq ft) covers a tall wall or long run in fewer sheets.' },
          { name: 'Set the waste allowance', text: 'Keep 10% for a simple rectangular room, or raise it for a room with many corners, angles or openings.' },
          { name: 'Read the result', text: 'The headline is the sheets to buy; the rows below show the exact sheets needed and the square footage you are covering and buying.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Wall area comes from the room’s perimeter and height; doors, windows and an optional ceiling adjust the area, and sheet size and waste set the sheet count.',
        expression: 'wall area = 2(L + W) × H\nnet wall area = wall area − (doors × 20 + windows × 15)\ntotal area = net wall area, + (L × W) if covering the ceiling\nsheets = total area ÷ sheet size\nbuy = ⌈ sheets × (1 + waste%) ⌉',
        terms: [
          { symbol: 'L, W, H', meaning: 'Room length, width and ceiling height, in feet.' },
          { symbol: 'doors, windows', meaning: 'Count of each; subtracted at about 20 and 15 sq ft apiece.' },
          { symbol: 'sheet size', meaning: 'Coverage of one sheet, in sq ft — 32 for a 4×8 ft sheet, 48 for a 4×12 ft sheet.' },
          { symbol: 'waste%', meaning: 'Extra percent for cuts and breakage; 10% is common contractor practice for a simple room.' }
        ],
        note: 'An estimate. Soffits, archways, vaulted ceilings and a lot of cutouts for outlets or fixtures all increase the real cut waste beyond a flat percentage; USG’s and other manufacturers’ coverage tables assume you already know the finished sheet count, not a waste allowance on top.'
      },
      workedExample: {
        intro: 'You are drywalling a 14 ft by 12 ft room with 9 ft ceilings, one door, two windows and a 10% waste allowance, using standard 4×8 ft (32 sq ft) sheets, walls only.',
        rows: [
          { label: 'Wall area (2 × (14 + 12) × 9)', value: '468.00 sq ft' },
          { label: 'Deductions (1 × 20 + 2 × 15)', value: '50.00 sq ft' },
          { label: 'Net wall area (468.00 − 50.00)', value: '418.00 sq ft' },
          { label: 'Sheets, exact (418.00 ÷ 32)', value: '13.06' },
          { label: 'With 10% waste (13.0625 × 1.10)', value: '14.37' },
          { label: 'Sheets to buy (rounded up)', value: '15 sheets' },
          { label: 'Coverage bought (15 × 32)', value: '480.00 sq ft' }
        ],
        result: '15 sheets of 4×8 ft drywall, 480 sq ft bought',
        explanation: 'Covering the 168 sq ft ceiling too (14 × 12) raises the total to 586 sq ft, 18.31 sheets exact, 20.14 with waste — 21 sheets, 6 more than walls alone. Switching to 4×12 ft (48 sq ft) sheets for the walls-only job instead needs only 10 sheets, since each one covers 50% more area, at the cost of handling a longer, heavier panel.'
      },
      watchOut: [
        { title: 'No manufacturer states a single waste percentage', body: 'USG’s and other brands’ own coverage tables assume you already know the finished sheet count; the 10% waste allowance here reflects common contractor practice for a simple room, not a number either manufacturer publishes.' },
        { title: 'Complex rooms need more waste', body: 'A room with soffits, archways, a vaulted ceiling or a lot of outlet and fixture cutouts creates more unusable offcuts than a plain rectangular room — raise the waste allowance well above 10% for those.' },
        { title: 'Bigger sheets are heavier and harder to install alone', body: 'A 4×8 ft sheet weighs just over 50 lb per Home Depot’s own panel guide; a 4×12 ft sheet is half again as long and proportionally heavier, usually needing a second person or a panel lifter.' },
        { title: 'The ceiling is a separate choice, not automatic', body: 'This calculator only adds the ceiling’s square footage when you select it — leaving it on “no” estimates the walls alone, which is common when a ceiling is already finished or being handled separately.' },
        { title: 'Sheets are sold whole', body: 'You cannot buy 14.37 sheets; the result always rounds up to 15, the same as paint and tile round up to whole cans and boxes on this site.' }
      ],
      references: [
        { label: 'USG, Sheetrock Brand Installation and Finishing Guide (panel sizes, coverage table, measuring method)', url: 'https://www.usg.com/content/dam/USG/pdpmovedocuments/cgc-sheetrock-gypsum-panels-installation-guide-en-J371.pdf' },
        { label: 'The Home Depot, Types of Drywall (panel sizes, use cases, weight)', url: 'https://www.homedepot.com/c/ab/types-of-drywall/9ba683603be9fa5395fab90c24feaae' }
      ]
    },
    inputs: [
      { id: 'roomLength', label: 'Room length (ft)', type: 'number', placeholder: '14', defaultValue: 14, step: 0.5, min: 1 },
      { id: 'roomWidth', label: 'Room width (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'ceilingHeight', label: 'Ceiling height (ft)', type: 'number', placeholder: '9', defaultValue: 9, step: 0.5, min: 6 },
      { id: 'doors', label: 'Number of doors (each ~20 sq ft)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 },
      { id: 'windows', label: 'Number of windows (each ~15 sq ft)', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 },
      {
        id: 'includeCeiling',
        label: 'Cover the ceiling too?',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'No — walls only' },
          { value: 1, label: 'Yes — walls and ceiling' }
        ]
      },
      {
        id: 'sheetSqFt',
        label: 'Sheet size',
        type: 'number',
        placeholder: '32',
        defaultValue: 32,
        step: 1,
        min: 32,
        options: [
          { value: 32, label: '4×8 ft (32 sq ft)' },
          { value: 48, label: '4×12 ft (48 sq ft)' }
        ]
      },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 }
    ],
    seo: {
      title: 'Drywall Calculator – Sheets Needed for a Room',
      description: 'Free drywall calculator: how many sheets a room needs from its dimensions, doors, windows, sheet size and an optional ceiling, with a waste allowance.',
      faq: [
        { question: 'How many sheets of drywall do I need?', answer: 'Find the net wall area (2 × (length + width) × height, minus about 20 sq ft per door and 15 sq ft per window), divide by your sheet’s coverage, add a waste allowance, and round up. A 14×12 ft room with 9 ft ceilings, one door, two windows and 10% waste needs 15 standard 4×8 ft sheets.' },
        { question: 'What size does drywall come in?', answer: 'USG’s own installation guide and major retailers list 4×8 ft (32 sq ft) as the standard, most common size, with 4×10 ft (40 sq ft) and 4×12 ft (48 sq ft) available for taller walls or longer runs with fewer seams.' },
        { question: 'How much waste allowance should I use for drywall?', answer: 'Neither USG’s nor a retailer’s own coverage guide states a specific waste figure. 10% is common contractor practice for a simple rectangular room; raise it to 15% or more for a room with many corners, angles, soffits or openings.' },
        { question: 'Should I drywall the ceiling at the same time as the walls?', answer: 'It is a separate choice this calculator leaves to you — switching “cover the ceiling too?” to yes adds the room’s length × width to the total area before dividing into sheets.' },
        { question: 'Is a bigger sheet always better?', answer: 'Fewer, bigger sheets mean fewer seams to tape and finish, but a 4×12 ft sheet is half again as long as a 4×8 ft sheet and proportionally heavier — a 4×8 ft sheet already weighs just over 50 lb per Home Depot’s panel guide — and usually needs a second installer or a panel lifter.' },
        { question: 'How much drywall does doors and windows save me?', answer: 'About 20 sq ft per standard door and 15 sq ft per standard window are subtracted from the wall area before the sheet count is calculated; larger openings remove more.' },
        { question: 'Why does the sheet count round up?', answer: 'Drywall is sold in whole sheets, so 14.37 sheets needed becomes 15 bought — the same whole-unit rounding this site’s paint, tile and wallpaper calculators use.' }
      ]
    },
    compute(values) {
      const wallArea = 2 * (values.roomLength + values.roomWidth) * values.ceilingHeight;
      const deductions = values.doors * 20 + values.windows * 15;
      const netWallArea = Math.max(0, wallArea - deductions);
      const ceilingArea = values.roomLength * values.roomWidth;
      const totalArea = netWallArea + (values.includeCeiling === 1 ? ceilingArea : 0);
      const sheetsExact = totalArea / values.sheetSqFt;
      const sheetsWithWaste = sheetsExact * (1 + values.wastePercent / 100);
      const sheetsToBuy = Math.ceil(sheetsWithWaste);
      const coverageBought = sheetsToBuy * values.sheetSqFt;
      return { wallArea, netWallArea, ceilingArea, totalArea, sheetsExact, sheetsWithWaste, sheetsToBuy, coverageBought };
    }
  },
  {
    id: 'brick-calculator',
    category: 'home',
    glyph: 'brk',
    updatedAt: '2026-11-02',
    aliases: ['how many bricks do i need', 'brick wall calculator', 'bricks per square foot calculator', 'brickwork calculator', 'brick veneer calculator'],
    related: ['mortar-calculator', 'concrete-calculator', 'sand-calculator', 'tile-calculator'],
    title: 'Brick Calculator',
    description: 'Find how many bricks a wall needs from its length and height, using the standard modular brick size and a waste allowance for cuts and breakage.',
    example: 'An 18x8 ft wall built with standard modular brick (6.75 bricks per sq ft) needs 972 bricks exactly, or 1,021 with a 5% waste allowance.',
    breakdown: {
      headline: 'bricksToBuy',
      headlineLabel: 'Bricks to buy',
      outputs: [
        { id: 'bricksToBuy', label: 'Bricks to buy', format: 'integer' },
        { id: 'bricksWithWaste', label: 'Bricks needed, with waste', format: 'number' },
        { id: 'bricksExact', label: 'Bricks needed, exact', format: 'number' },
        { id: 'wallArea', label: 'Wall area', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Wall', inputs: ['wallLength', 'wallHeight'] },
        { title: 'Brick size & waste', inputs: ['bricksPerSqFt', 'wastePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'bricksExact', label: 'Exact bricks' },
          { from: 'bricksToBuy', label: 'Bricks to buy' }
        ],
        title: 'Bricks needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-11-02',
      concept: {
        title: 'How many bricks a wall needs',
        paragraphs: [
          'The Brick Industry Association’s (BIA) Technical Notes on Brick Construction 10, the standard estimating reference for the industry, uses a “wall-area” method: multiply the net wall area (length × height, minus openings) by a known quantity of brick per square foot. That quantity depends on the brick’s size and its mortar joint, because both set how many bricks fit in a square foot. BIA’s own Table 4 gives modular brick — nominal 4 in. × 2⅔ in. × 8 in. (specified 3⅝ × 2¼ × 7⅝ in.) laid with a standard ⅜ in. mortar joint — at 675 bricks per 100 sq ft, exactly 6.75 bricks per square foot, and that is this calculator’s default.',
          'Modular brick is the most common size used in North America, per BIA’s own Technical Note, which is why it is the default here, but the reference covers many other named sizes and joint widths — a closure modular brick (4 in. tall) needs only 450 per 100 sq ft, a king-size non-modular brick 455, a Roman brick 600 — each with its own bricks-per-square-foot figure in BIA’s Table 4. The bricks-per-square-foot field here is editable for exactly that reason: swap in the figure for whatever brick size and joint you are actually laying.',
          'BIA’s own Table 4 figures are the net count, before any waste — the same technical note separately recommends adding at least 5% to the net brick quantity for breakage and waste on the jobsite, more for a job with unusual conditions or a less experienced crew. Since bricks are sold and delivered by the unit (often palletized in round numbers), the final step rounds the brick count with waste up to a whole number.'
        ]
      },
      howTo: {
        intro: 'Enter the wall, then the bricks-per-square-foot figure for your brick and joint size, then a waste allowance.',
        steps: [
          { name: 'Enter the wall length and height', text: 'Measure the net area you are building — subtract any large openings like doors or windows first if the wall has them.' },
          { name: 'Set bricks per square foot', text: 'Keep 6.75 for standard modular brick with a ⅜ in. mortar joint, or use the figure from BIA’s Technical Note 10 (or your brick supplier) for a different size or joint.' },
          { name: 'Set the waste allowance', text: 'Keep the 5% default — BIA’s own recommended minimum — or raise it for a job with a lot of cuts, corners or an inexperienced crew.' },
          { name: 'Read the result', text: 'The headline is the bricks to buy; the rows below show the exact brick count and the wall area.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Wall area times a bricks-per-square-foot figure gives the exact count; a waste factor sets what you actually buy.',
        expression: 'wall area = L × H\nbricks = wall area × bricks/sq ft\nbricks(waste) = bricks × (1 + waste%)\nbuy = ⌈ bricks(waste) ⌉',
        terms: [
          { symbol: 'L, H', meaning: 'Wall length and height, in feet (net of any large openings).' },
          { symbol: 'bricks/sq ft', meaning: 'Bricks needed per square foot of wall for your brick size and joint — 6.75 for standard modular brick with a ⅜ in. joint, per BIA Technical Note 10, Table 4.' },
          { symbol: 'waste%', meaning: 'Extra percent for breakage and cuts; BIA recommends at least 5%.' }
        ],
        note: 'An estimate for a single-wythe running-bond wall. A bond pattern with headers (English, Flemish) needs more brick per square foot — BIA’s Table 6 gives correction factors — and this figure does not include mortar, covered separately by this site’s mortar calculator.'
      },
      workedExample: {
        intro: 'You are building an 18 ft long, 8 ft tall wall with standard modular brick (6.75 bricks per sq ft) and a 5% waste allowance.',
        rows: [
          { label: 'Wall area (18 × 8)', value: '144.00 sq ft' },
          { label: 'Bricks, exact (144.00 × 6.75)', value: '972.00' },
          { label: 'With 5% waste (972.00 × 1.05)', value: '1,020.60' },
          { label: 'Bricks to buy (rounded up)', value: '1,021 bricks' }
        ],
        result: '1,021 bricks',
        explanation: 'The same wall built with closure modular brick instead (4.50 bricks per sq ft, per BIA’s Table 4) would need only 648 bricks exact, 681 with the same 5% waste — 340 fewer bricks, because each closure modular brick is taller and covers more wall per unit.'
      },
      watchOut: [
        { title: 'Brick size changes the count a lot', body: 'BIA’s Table 4 lists very different bricks-per-square-foot figures by size — 6.75 for standard modular, 4.50 for closure modular, 6.00 for Roman brick — so using the wrong figure for your actual brick can be off by a large margin.' },
        { title: 'This covers brick only, not mortar', body: 'Use this site’s mortar calculator alongside it — mortar quantity depends on the same brick size and joint, but is estimated separately because it is bought in bags, not units.' },
        { title: 'A bond pattern with headers needs more brick', body: 'The 6.75-per-sq-ft figure assumes a running or stack bond. A pattern with headers every few courses (English, Flemish) uses BIA’s own correction factors — for example, full headers every fifth course adds a net ⅕ more brick.' },
        { title: 'Measure the net wall area', body: 'Subtract any door, window or other large opening from the wall’s gross length × height before entering it here — this calculator does not deduct openings for you.' },
        { title: 'BIA’s 5% waste is a minimum, not a universal figure', body: 'BIA’s own Technical Note calls 5% “a general rule” and notes that “particular job conditions or experience may warrant using a higher percentage” — an inexperienced crew or an intricate pattern justifies more.' }
      ],
      references: [
        { label: 'Brick Industry Association, Technical Notes on Brick Construction 10 — Dimensioning and Estimating Brick Masonry (Table 4: brick and mortar quantities; brick breakage and waste)', url: 'https://www.gobrick.com/media/file/10-dimensioning-and-estimating-brick-masonry.pdf' }
      ]
    },
    inputs: [
      { id: 'wallLength', label: 'Wall length (ft)', type: 'number', placeholder: '18', defaultValue: 18, step: 0.5, min: 1 },
      { id: 'wallHeight', label: 'Wall height (ft)', type: 'number', placeholder: '8', defaultValue: 8, step: 0.5, min: 1 },
      { id: 'bricksPerSqFt', label: 'Bricks per sq ft (standard modular, ⅜ in. joint = 6.75)', type: 'number', placeholder: '6.75', defaultValue: 6.75, step: 0.05, min: 0.1 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '5', defaultValue: 5, step: 1, min: 0 }
    ],
    seo: {
      title: 'Brick Calculator – Bricks Needed for a Wall',
      description: 'Free brick calculator: how many bricks a wall needs from its length and height, using standard modular brick (6.75 per sq ft) and a waste allowance.',
      faq: [
        { question: 'How many bricks do I need for a wall?', answer: 'Multiply the wall’s net area (length × height) by the bricks-per-square-foot figure for your brick size, then add a waste allowance. An 18×8 ft wall in standard modular brick (6.75 per sq ft) needs 972 bricks exact, 1,021 with 5% waste.' },
        { question: 'How many bricks are in a square foot?', answer: 'For standard US modular brick (3⅝ × 2¼ × 7⅝ in.) with a ⅜ in. mortar joint, the Brick Industry Association’s Technical Note 10 gives 675 bricks per 100 sq ft — 6.75 per square foot — in a single-wythe running-bond wall.' },
        { question: 'How much extra brick should I buy for waste?', answer: 'The Brick Industry Association’s own estimating guide recommends adding at least 5% to the net brick count for breakage and cuts, more for an intricate pattern or a less experienced crew.' },
        { question: 'Does brick size change how many I need?', answer: 'Yes, substantially. BIA’s Table 4 lists 6.75 bricks per sq ft for standard modular brick, but only 4.50 for the taller closure modular size and 6.00 for Roman brick — the same wall needs a very different brick count depending on the size.' },
        { question: 'Does this calculator include mortar?', answer: 'No. Mortar is estimated separately, by bag, using this site’s mortar calculator — brick count and mortar both depend on the same brick size and joint but are bought in different units.' },
        { question: 'What if my wall uses a pattern with headers, like English or Flemish bond?', answer: 'A header bond uses more brick than a plain running bond. BIA’s correction factors add a fraction on top — for example, full headers every fifth course add a net ⅕ more brick than the running-bond figure.' },
        { question: 'How do I count bricks for a wall with doors or windows?', answer: 'Subtract the door and window area from the wall’s gross length × height first, then enter that net area’s length and height (or an equivalent length for the same net area) here.' }
      ]
    },
    compute(values) {
      const wallArea = values.wallLength * values.wallHeight;
      const bricksExact = wallArea * values.bricksPerSqFt;
      const bricksWithWaste = bricksExact * (1 + values.wastePercent / 100);
      const bricksToBuy = Math.ceil(bricksWithWaste);
      return { wallArea, bricksExact, bricksWithWaste, bricksToBuy };
    }
  },
  {
    id: 'gravel-calculator',
    category: 'home',
    glyph: 'grv',
    updatedAt: '2026-11-02',
    aliases: ['how much gravel do i need', 'gravel tons calculator', 'crushed stone calculator', 'gravel yards calculator', 'driveway gravel calculator'],
    related: ['sand-calculator', 'concrete-calculator', 'brick-calculator', 'paver-calculator'],
    title: 'Gravel Calculator',
    description: 'Find the volume (cubic feet and cubic yards) and weight (tons) of gravel a driveway, path or bed needs from its area and depth, with an editable density for your gravel type and a waste allowance.',
    example: 'A 50x10 ft driveway base, 4 inches deep in gravel at 1.4 tons per cubic yard, needs 6.17 cubic yards (8.64 tons), or 6.79 cubic yards (9.51 tons) with a 10% waste allowance.',
    breakdown: {
      headline: 'tonsWithWaste',
      headlineLabel: 'Tons to buy',
      outputs: [
        { id: 'tonsWithWaste', label: 'Tons to buy', format: 'number' },
        { id: 'tonsExact', label: 'Tons needed, exact', format: 'number' },
        { id: 'cubicYardsWithWaste', label: 'Cubic yards to buy', format: 'number' },
        { id: 'cubicYards', label: 'Cubic yards, exact', format: 'number' },
        { id: 'cubicFeet', label: 'Cubic feet, exact', format: 'number' }
      ],
      groups: [
        { title: 'Area & depth', inputs: ['areaLength', 'areaWidth', 'depthInches'] },
        { title: 'Density & waste', inputs: ['densityTonsPerCubicYard', 'wastePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'tonsExact', label: 'Exact tons' },
          { from: 'tonsWithWaste', label: 'Tons to buy' }
        ],
        title: 'Gravel needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-11-02',
      concept: {
        title: 'How much gravel a driveway or path needs',
        paragraphs: [
          'Gravel is bought and delivered by weight (tons), but it is spread by volume — area times depth. Convert between the two with the material’s density: cubic yards times tons per cubic yard gives the tons to order. The area-times-depth part is straightforward (a 50 ft by 10 ft driveway base, 4 inches deep, is 166.67 cubic feet, or 6.17 cubic yards), but the density varies by gravel type, which is why it is an editable field here rather than a fixed constant.',
          'Mulch Pros Landscape Supply, a real aggregate yard, publishes figures measured on its own scale: #57, #34, #5 and #6 crushed stone and mason/river sand run about 2,700 lb (1.35 tons) per cubic yard, #89 stone and pea gravel about 2,800 lb (1.4 tons), crush & run about 2,900 lb (1.45 tons), and river rock or slate chips about 2,600 lb (1.3 tons). A second landscape supplier, EarthStone Rock, puts general landscape and pea gravel at about 1.35 tons per cubic yard too — the two suppliers broadly agree gravel runs roughly 1.3 to 1.45 tons per cubic yard depending on the specific stone, which is why this calculator defaults to 1.4 (the #89/pea-gravel figure) but lets you type in your own supplier’s number.',
          'Moisture also changes the real weight a delivery truck carries, since wet gravel weighs more than the same volume dry — EarthStone Rock notes this directly. None of that changes how much volume you need to cover your area at your chosen depth, only how many tons that volume weighs, so entering your supplier’s quoted density (dry or as-delivered) gives the most accurate order weight.'
        ]
      },
      howTo: {
        intro: 'Enter the area and depth, then your gravel’s density and a waste allowance.',
        steps: [
          { name: 'Enter the area', text: 'Type the length and width of the driveway, path or bed in feet.' },
          { name: 'Enter the depth', text: 'Use the thickness in inches — a gravel driveway base is commonly 4 to 6 inches, a path topping 2 to 3 inches.' },
          { name: 'Set the density', text: 'Keep 1.4 tons per cubic yard for a typical crushed stone or pea gravel, or use your supplier’s own figure — it can run from about 1.3 to 1.45 depending on the stone.' },
          { name: 'Set the waste allowance', text: 'Keep 10% for settling and an uneven subgrade, or raise it for a larger or less even job.' },
          { name: 'Read the result', text: 'The headline is the tons to buy; the rows below show the exact cubic feet, cubic yards and tons before waste.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Area times depth gives the volume; volume times density gives the weight, and a waste factor sets what you actually buy.',
        expression: 'cu ft = L × W × (depth ÷ 12)\ncu yd = cu ft ÷ 27\ntons = cu yd × density\nbuy = cu yd × (1 + waste%) × density',
        terms: [
          { symbol: 'L, W', meaning: 'Area length and width, in feet.' },
          { symbol: 'depth', meaning: 'Depth of gravel, in inches — divide by 12 to get feet.' },
          { symbol: 'density', meaning: 'Tons per cubic yard for your gravel type; about 1.3–1.45 for most crushed stone and pea gravel, per supplier-measured figures.' },
          { symbol: 'waste%', meaning: 'Extra percent for settling, compaction and an uneven subgrade; 10% is a common starting point.' }
        ],
        note: 'An estimate. Gravel suppliers sell by the ton, and a yard will usually round a delivery up to its nearest standard load size — confirm minimums before ordering.'
      },
      workedExample: {
        intro: 'You are building a 50 ft by 10 ft gravel driveway base, 4 inches deep, using gravel at 1.4 tons per cubic yard with a 10% waste allowance.',
        rows: [
          { label: 'Area (50 × 10)', value: '500.00 sq ft' },
          { label: 'Depth in feet (4 ÷ 12)', value: '0.3333 ft' },
          { label: 'Cubic feet (500.00 × 0.3333)', value: '166.67 ft³' },
          { label: 'Cubic yards (166.67 ÷ 27)', value: '6.17 yd³' },
          { label: 'Tons, exact (6.17 × 1.4)', value: '8.64 tons' },
          { label: 'Cubic yards with 10% waste (6.17 × 1.10)', value: '6.79 yd³' },
          { label: 'Tons to buy (6.79 × 1.4)', value: '9.51 tons' }
        ],
        result: '9.51 tons to order (8.64 tons exact)',
        explanation: 'The same area in a denser crush & run (1.45 tons per cubic yard, per Mulch Pros’ own figures) instead of 1.4 would need 9.85 tons with the same 10% waste — about 3.6% more weight for the identical volume, purely from the denser material.'
      },
      watchOut: [
        { title: 'Density varies by gravel type', body: 'Supplier-measured figures put most crushed stone and pea gravel at about 1.3 to 1.45 tons per cubic yard — use your own supplier’s number when you have it instead of the 1.4 default.' },
        { title: 'Wet gravel weighs more than dry', body: 'A delivery weighed after rain, or stockpiled gravel that has absorbed moisture, weighs more per cubic yard than the same dry volume — ask your supplier whether their quoted density is dry or as-delivered.' },
        { title: 'Depth drives weight directly', body: 'Volume scales linearly with depth for a fixed area, so doubling the depth (say, from 4 to 8 inches for a heavier-duty base) doubles the tons needed.' },
        { title: 'Order a little extra for settling', body: 'Loose gravel compacts under traffic and rain, and an uneven subgrade collects more material at low spots than a flat one — the 10% default covers typical settling, more for a rougher site.' },
        { title: 'Suppliers sell and deliver by the ton, often with a minimum', body: 'Most aggregate yards price and haul by the ton, and many have a minimum delivery size — a small job may cost close to the same as a somewhat larger one once delivery is included.' }
      ],
      references: [
        { label: 'Mulch Pros Landscape Supply, Material Weight and Coverage (own-scale measured tons per cubic yard by stone type)', url: 'https://mulchpros.com/material-weight-and-coverage/' },
        { label: 'EarthStone Rock, Cubic Yards vs. Tons for Landscape Rock (density range, moisture note)', url: 'https://earthstonerock.com/blogs/landscaping-guides/cubic-yards-vs-tons' }
      ]
    },
    inputs: [
      { id: 'areaLength', label: 'Area length (ft)', type: 'number', placeholder: '50', defaultValue: 50, step: 0.5, min: 0.5 },
      { id: 'areaWidth', label: 'Area width (ft)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.5, min: 0.5 },
      { id: 'depthInches', label: 'Depth (inches)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0.5 },
      { id: 'densityTonsPerCubicYard', label: 'Density (tons per cubic yard, typical = 1.4)', type: 'number', placeholder: '1.4', defaultValue: 1.4, step: 0.05, min: 0.5 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 }
    ],
    seo: {
      title: 'Gravel Calculator – Cubic Yards and Tons Needed',
      description: 'Free gravel calculator: cubic feet, cubic yards and tons of gravel needed from area and depth, with an editable density for your gravel type and a waste factor.',
      faq: [
        { question: 'How much gravel do I need?', answer: 'Multiply the area by the depth to get volume, convert to cubic yards, then multiply by the gravel’s density in tons per cubic yard. A 50×10 ft base, 4 inches deep, at 1.4 tons/yd³ needs 6.17 cubic yards, 8.64 tons, before waste.' },
        { question: 'How many tons of gravel are in a cubic yard?', answer: 'It depends on the stone. Supplier-measured figures (Mulch Pros, Earthstone Rock) put most crushed stone and pea gravel at about 1.3 to 1.45 tons per cubic yard — this calculator defaults to 1.4, the #89/pea-gravel figure, but the density field is editable for your own supplier’s number.' },
        { question: 'Does gravel type really change the weight much?', answer: 'Yes. River rock and slate chips run closer to 1.3 tons per cubic yard in Mulch Pros’ own measurements, while crush & run runs closer to 1.45 — about a 10% difference in weight for the identical volume.' },
        { question: 'Should I order extra gravel for waste?', answer: 'Yes, a 10% allowance is a common starting point for settling, compaction and an uneven subgrade — more for a larger or rougher job.' },
        { question: 'How deep should a gravel driveway base be?', answer: 'A gravel driveway base is commonly built 4 to 6 inches deep; a thinner 2 to 3 inch layer is more typical for topping a path, not supporting vehicle loads.' },
        { question: 'Does wet gravel weigh the same as dry gravel?', answer: 'No — wet gravel weighs more per cubic yard than the same dry volume. If your supplier’s quoted density is a dry figure but the delivery is weighed after rain, the real tonnage can run higher than this estimate.' },
        { question: 'How do I convert the depth from inches into the formula?', answer: 'Divide the inches by 12 to get feet before multiplying by the area — a 4-inch depth is 4 ÷ 12 = 0.3333 ft.' }
      ]
    },
    compute(values) {
      const areaSqFt = values.areaLength * values.areaWidth;
      const depthFt = values.depthInches / 12;
      const cubicFeet = areaSqFt * depthFt;
      const cubicYards = cubicFeet / 27;
      const tonsExact = cubicYards * values.densityTonsPerCubicYard;
      const cubicYardsWithWaste = cubicYards * (1 + values.wastePercent / 100);
      const tonsWithWaste = cubicYardsWithWaste * values.densityTonsPerCubicYard;
      return { cubicFeet, cubicYards, tonsExact, cubicYardsWithWaste, tonsWithWaste };
    }
  },
  {
    id: 'sand-calculator',
    category: 'home',
    glyph: 'snd',
    updatedAt: '2026-11-02',
    aliases: ['how much sand do i need', 'sand tons calculator', 'sandbox sand calculator', 'paver sand calculator', 'play sand calculator'],
    related: ['gravel-calculator', 'concrete-calculator', 'brick-calculator', 'paver-calculator'],
    title: 'Sand Calculator',
    description: 'Find the volume (cubic feet and cubic yards) and weight (tons) of sand a sandbox, paver base or bedding layer needs from its area and depth, with an editable density for your sand type.',
    example: 'A 6x4 ft sandbox filled 12 inches deep in sand at 1.3 tons per cubic yard needs 0.89 cubic yards (1.16 tons), or 0.98 cubic yards (1.27 tons) with a 10% waste allowance.',
    breakdown: {
      headline: 'tonsWithWaste',
      headlineLabel: 'Tons to buy',
      outputs: [
        { id: 'tonsWithWaste', label: 'Tons to buy', format: 'number' },
        { id: 'tonsExact', label: 'Tons needed, exact', format: 'number' },
        { id: 'cubicYardsWithWaste', label: 'Cubic yards to buy', format: 'number' },
        { id: 'cubicYards', label: 'Cubic yards, exact', format: 'number' },
        { id: 'cubicFeet', label: 'Cubic feet, exact', format: 'number' }
      ],
      groups: [
        { title: 'Area & depth', inputs: ['areaLength', 'areaWidth', 'depthInches'] },
        { title: 'Density & waste', inputs: ['densityTonsPerCubicYard', 'wastePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'tonsExact', label: 'Exact tons' },
          { from: 'tonsWithWaste', label: 'Tons to buy' }
        ],
        title: 'Sand needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-11-02',
      concept: {
        title: 'How much sand a sandbox or paver base needs',
        paragraphs: [
          'Sand is sold and delivered by weight (tons), the same way gravel is, so the calculation follows the same two steps: find the volume from area times depth, then convert to weight with the sand’s density. A 6 ft by 4 ft sandbox filled a full 12 inches deep is 24 cubic feet, or 0.89 cubic yards — a small, but real, example of how a seemingly modest footprint adds up once there’s real depth behind it.',
          'Density varies by sand type more than most people expect. Mulch Pros Landscape Supply’s own-scale measurements put mason and river sand — the common bedding and paver-base sands — at about 2,600 lb (1.3 tons) per cubic yard, which is this calculator’s default. A second supplier, EarthStone Rock, states a general “sand” figure of about 3,000 lb (1.5 tons) per cubic yard — a real, bounded disagreement between two real suppliers, not a typo on either side, most likely reflecting a damper or coarser sand than Mulch Pros’ own dry mason/river sand. That roughly 1.3-to-1.5 ton-per-cubic-yard range is why the density field here is editable: use your own supplier’s figure whenever you have it.',
          'Moisture is the biggest single reason two suppliers’ sand figures can differ for what is nominally the same material — damp sand weighs noticeably more per cubic yard than the same sand bone dry, which both suppliers note affects their own weigh scales. None of that changes the volume you need to fill your sandbox or bed to the depth you want; it only changes how many tons that volume weighs when you go to buy it.'
        ]
      },
      howTo: {
        intro: 'Enter the area and depth, then your sand’s density and a waste allowance.',
        steps: [
          { name: 'Enter the area', text: 'Type the length and width of the sandbox, patio base or bedding layer in feet.' },
          { name: 'Enter the depth', text: 'Use the thickness in inches — a full sandbox fill is commonly 12 inches, a paver bedding layer just 1 to 2 inches.' },
          { name: 'Set the density', text: 'Keep 1.3 tons per cubic yard for a typical dry mason or river sand, or use your supplier’s own figure — it can run higher, toward 1.5, for a damper or coarser sand.' },
          { name: 'Set the waste allowance', text: 'Keep 10% for settling and spillage, or raise it for a larger or less even job.' },
          { name: 'Read the result', text: 'The headline is the tons to buy; the rows below show the exact cubic feet, cubic yards and tons before waste.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Area times depth gives the volume; volume times density gives the weight, and a waste factor sets what you actually buy.',
        expression: 'cu ft = L × W × (depth ÷ 12)\ncu yd = cu ft ÷ 27\ntons = cu yd × density\nbuy = cu yd × (1 + waste%) × density',
        terms: [
          { symbol: 'L, W', meaning: 'Area length and width, in feet.' },
          { symbol: 'depth', meaning: 'Depth of sand, in inches — divide by 12 to get feet.' },
          { symbol: 'density', meaning: 'Tons per cubic yard for your sand type; supplier-measured figures range from about 1.3 (dry mason/river sand) to 1.5 (a damper or coarser sand).' },
          { symbol: 'waste%', meaning: 'Extra percent for settling and spillage; 10% is a common starting point.' }
        ],
        note: 'An estimate. Sand suppliers sell by the ton, and a wetter load weighs more than the same dry volume — confirm whether a quoted density is dry or as-delivered before ordering a tight amount.'
      },
      workedExample: {
        intro: 'You are filling a 6 ft by 4 ft sandbox a full 12 inches deep, using sand at 1.3 tons per cubic yard with a 10% waste allowance.',
        rows: [
          { label: 'Area (6 × 4)', value: '24.00 sq ft' },
          { label: 'Depth in feet (12 ÷ 12)', value: '1.0000 ft' },
          { label: 'Cubic feet (24.00 × 1.0000)', value: '24.00 ft³' },
          { label: 'Cubic yards (24.00 ÷ 27)', value: '0.89 yd³' },
          { label: 'Tons, exact (0.89 × 1.3)', value: '1.16 tons' },
          { label: 'Cubic yards with 10% waste (0.89 × 1.10)', value: '0.98 yd³' },
          { label: 'Tons to buy (0.98 × 1.3)', value: '1.27 tons' }
        ],
        result: '1.27 tons to order (1.16 tons exact)',
        explanation: 'The same sandbox filled with a damper sand at 1.5 tons per cubic yard instead of 1.3 would need 1.47 tons with the same 10% waste — about 15.4% more weight for the identical volume, entirely from the heavier sand.'
      },
      watchOut: [
        { title: 'Density varies a lot by sand type and moisture', body: 'Supplier-measured figures range from about 1.3 tons per cubic yard for dry mason/river sand to about 1.5 for a damper or coarser sand — use your own supplier’s number when you have it instead of the 1.3 default.' },
        { title: 'A full sandbox needs more sand than it looks like', body: 'A modest 6×4 ft sandbox filled a full 12 inches deep is still 24 cubic feet — almost a full cubic yard — because depth multiplies the area, not just adds to it.' },
        { title: 'Paver and patio bedding layers are shallow on purpose', body: 'A bedding or leveling layer of sand under pavers or a patio is typically just 1 to 2 inches, far less than a play sandbox fill — enter the thin depth your specific project actually calls for.' },
        { title: 'Order a little extra for settling and spillage', body: 'Sand compacts and settles once in place, and some is lost to spillage during handling — the 10% default covers typical loss, more for a rougher or larger job.' },
        { title: 'Children’s play sand has its own safety standard', body: 'Play sand sold for sandboxes is commonly required to meet ASTM F1951 or similar playground-surfacing standards in addition to a density figure — check the bag’s labeling, not just this calculator, before buying sand a child will play in.' }
      ],
      references: [
        { label: 'Mulch Pros Landscape Supply, Material Weight and Coverage (own-scale measured tons per cubic yard by sand type)', url: 'https://mulchpros.com/material-weight-and-coverage/' },
        { label: 'EarthStone Rock, Cubic Yards vs. Tons for Landscape Rock (sand density figure, moisture note)', url: 'https://earthstonerock.com/blogs/landscaping-guides/cubic-yards-vs-tons' }
      ]
    },
    inputs: [
      { id: 'areaLength', label: 'Area length (ft)', type: 'number', placeholder: '6', defaultValue: 6, step: 0.5, min: 0.5 },
      { id: 'areaWidth', label: 'Area width (ft)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0.5 },
      { id: 'depthInches', label: 'Depth (inches)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 0.5 },
      { id: 'densityTonsPerCubicYard', label: 'Density (tons per cubic yard, typical = 1.3)', type: 'number', placeholder: '1.3', defaultValue: 1.3, step: 0.05, min: 0.5 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 }
    ],
    seo: {
      title: 'Sand Calculator – Cubic Yards and Tons Needed',
      description: 'Free sand calculator: cubic feet, cubic yards and tons of sand needed from area and depth, with an editable density for your sand type and a waste allowance.',
      faq: [
        { question: 'How much sand do I need?', answer: 'Multiply the area by the depth to get volume, convert to cubic yards, then multiply by the sand’s density in tons per cubic yard. A 6×4 ft sandbox, 12 inches deep, at 1.3 tons/yd³ needs 0.89 cubic yards, 1.16 tons, before waste.' },
        { question: 'How many tons of sand are in a cubic yard?', answer: 'It depends on the sand type and moisture. Mulch Pros Landscape Supply’s own-scale figures put dry mason/river sand at about 1.3 tons per cubic yard; EarthStone Rock states a general sand figure closer to 1.5 — this calculator defaults to 1.3 but the density field is editable.' },
        { question: 'Why do different suppliers give different sand weights?', answer: 'Mostly moisture and sand type. A damper or coarser sand weighs more per cubic yard than a dry, fine mason sand — both suppliers cited here note moisture changes the real weigh-scale figure.' },
        { question: 'How deep should sand be for a sandbox?', answer: 'A full play sandbox fill is commonly built to about 12 inches deep; a bedding or leveling layer under pavers or a patio is typically only 1 to 2 inches.' },
        { question: 'Should I order extra sand for waste?', answer: 'Yes, a 10% allowance is a common starting point for settling and spillage during handling — more for a larger or rougher job.' },
        { question: 'Is play sand for a sandbox different from regular sand?', answer: 'It can be. Play sand sold for sandboxes is commonly required to meet ASTM F1951 or a similar playground-surfacing standard, on top of whatever density figure applies — check the bag’s own labeling for that.' },
        { question: 'How do I convert the depth from inches into the formula?', answer: 'Divide the inches by 12 to get feet before multiplying by the area — a 12-inch depth is 12 ÷ 12 = 1.00 ft.' }
      ]
    },
    compute(values) {
      const areaSqFt = values.areaLength * values.areaWidth;
      const depthFt = values.depthInches / 12;
      const cubicFeet = areaSqFt * depthFt;
      const cubicYards = cubicFeet / 27;
      const tonsExact = cubicYards * values.densityTonsPerCubicYard;
      const cubicYardsWithWaste = cubicYards * (1 + values.wastePercent / 100);
      const tonsWithWaste = cubicYardsWithWaste * values.densityTonsPerCubicYard;
      return { cubicFeet, cubicYards, tonsExact, cubicYardsWithWaste, tonsWithWaste };
    }
  },
  {
    id: 'mortar-calculator',
    category: 'home',
    glyph: 'bag',
    updatedAt: '2026-11-02',
    aliases: ['how many bags of mortar do i need', 'mortar bags calculator', 'mortar mix calculator', 'brick mortar calculator', 'masonry mortar calculator'],
    related: ['brick-calculator', 'concrete-calculator', 'sand-calculator'],
    title: 'Mortar Calculator',
    description: 'Find how many bags of mortar mix a brick wall needs from its length and height, using the same bricks-per-square-foot figure as this site’s brick calculator and a waste allowance, in bags needed.',
    example: 'An 18x8 ft wall (972 bricks at 6.75 bricks per sq ft) needs 26.27 bags of mortar at 37 bricks per 80 lb bag, or 31 bags with a 15% waste allowance.',
    breakdown: {
      headline: 'bagsToBuy',
      headlineLabel: 'Bags to buy',
      outputs: [
        { id: 'bagsToBuy', label: 'Bags to buy', format: 'integer' },
        { id: 'bagsWithWaste', label: 'Bags needed, with waste', format: 'number' },
        { id: 'bagsExact', label: 'Bags needed, exact', format: 'number' },
        { id: 'bricksNeeded', label: 'Bricks this wall needs', format: 'number' },
        { id: 'wallArea', label: 'Wall area', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Wall', inputs: ['wallLength', 'wallHeight'] },
        { title: 'Brick size, bag yield & waste', inputs: ['bricksPerSqFt', 'bricksPerBag', 'wastePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'bagsExact', label: 'Exact bags' },
          { from: 'bagsToBuy', label: 'Bags to buy' }
        ],
        title: 'Mortar bags needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-11-02',
      concept: {
        title: 'How many bags of mortar a brick wall needs',
        paragraphs: [
          'Mortar is bought by the bag, but how many bags a wall needs follows from the same brick count this site’s brick calculator works out — wall area times a bricks-per-square-foot figure — because more bricks means more joints to fill with mortar. QUIKRETE’s own data sheet for its Mortar Mix (Product No. 1102) states plainly: “Each 80 lb bag of QUIKRETE Mortar Mix will lay up to 37 standard bricks.” Divide the brick count by 37 and you have the bags needed, before any waste.',
          'The Brick Industry Association’s (BIA) Technical Notes on Brick Construction 10 covers mortar quantity estimating too, and separately from brick waste, it calls for adding more to the net mortar figure: “as a general rule, add 15 to 25 percent to the net mortar quantities” for waste — a wider range than the 5% BIA recommends for brick itself, because mortar is also lost to the mixer, the mortarboard and the tooling of joints, not just to cuts. This calculator defaults to 15%, the low end of BIA’s own range.',
          'Because both this page and the brick calculator start from the same wall-area-times-bricks-per-square-foot step, they agree on bricks for the same wall, inputs and all — this page just carries that brick count one step further, into bags. Use them side by side: brick-calculator for the units, this one for the mortar that holds them together.'
        ]
      },
      howTo: {
        intro: 'Enter the wall, then the same bricks-per-square-foot figure you used on the brick calculator, the bag yield, and a waste allowance.',
        steps: [
          { name: 'Enter the wall length and height', text: 'Measure the net area you are building — the same figure you would use on the brick calculator.' },
          { name: 'Set bricks per square foot', text: 'Keep 6.75 for standard modular brick with a ⅜ in. mortar joint, matching this site’s brick calculator default.' },
          { name: 'Set the bag yield', text: 'Keep 37 bricks per 80 lb bag, QUIKRETE’s own published figure for its Mortar Mix, or use your product’s own data sheet.' },
          { name: 'Set the waste allowance', text: 'Keep the 15% default — the low end of BIA’s 15-to-25-percent recommended range — or raise it toward 25% for a messier job.' },
          { name: 'Read the result', text: 'The headline is the bags to buy; the rows below show the exact bag count and the bricks this wall needs.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Wall area times bricks-per-square-foot gives the brick count; bricks divided by bag yield gives bags, and a waste factor sets what you actually buy.',
        expression: 'wall area = L × H\nbricks = wall area × bricks/sq ft\nbags = bricks ÷ bricks/bag\nbags(waste) = bags × (1 + waste%)\nbuy = ⌈ bags(waste) ⌉',
        terms: [
          { symbol: 'L, H', meaning: 'Wall length and height, in feet.' },
          { symbol: 'bricks/sq ft', meaning: 'Bricks needed per square foot of wall; 6.75 for standard modular brick, matching the brick calculator.' },
          { symbol: 'bricks/bag', meaning: 'Standard bricks one 80 lb bag of mortar mix lays; 37, per QUIKRETE’s own data sheet.' },
          { symbol: 'waste%', meaning: 'Extra percent for mixing, board and tooling loss; BIA recommends 15–25%, this defaults to the 15% low end.' }
        ],
        note: 'An estimate for standard-size bricks laid in a running or stack bond with a ⅜ in. joint. A different brick size, a thicker or thinner joint, or a bonded pattern with headers changes the bricks-per-square-foot figure and therefore the mortar needed — adjust that field to match, the same way the brick calculator does.'
      },
      workedExample: {
        intro: 'You are laying mortar for an 18 ft long, 8 ft tall wall in standard modular brick (6.75 bricks per sq ft), using 80 lb bags that lay 37 bricks each, with a 15% waste allowance.',
        rows: [
          { label: 'Wall area (18 × 8)', value: '144.00 sq ft' },
          { label: 'Bricks needed (144.00 × 6.75)', value: '972.00' },
          { label: 'Bags, exact (972.00 ÷ 37)', value: '26.27' },
          { label: 'With 15% waste (26.27 × 1.15)', value: '30.21' },
          { label: 'Bags to buy (rounded up)', value: '31 bags' }
        ],
        result: '31 bags of 80 lb mortar mix',
        explanation: 'Raising the waste allowance to BIA’s upper 25% instead of 15% pushes the same job to 33 bags exact-before-rounding (26.27 × 1.25 = 32.84, so still 33 after rounding up) — 2 more bags, the cost of planning for a messier job.'
      },
      watchOut: [
        { title: 'Mortar waste runs higher than brick waste', body: 'BIA recommends at least 5% waste for brick itself but 15 to 25% for mortar — mortar is lost to the mixer, the mortarboard and tooling the joints, not just to cuts, so it needs a bigger allowance.' },
        { title: 'Keep the brick figure consistent with your brick order', body: 'This page’s bricks-per-square-foot field should match whatever you used on the brick calculator for the same wall — they are meant to be used together, not independently guessed.' },
        { title: 'Bag yield is specific to one product', body: 'The 37-bricks-per-80-lb-bag figure is QUIKRETE’s own published yield for its Mortar Mix; other brands or bag sizes (40 lb, 60 lb) lay a different number — check your product’s data sheet.' },
        { title: 'A thicker or thinner joint changes both bricks and mortar', body: 'BIA’s own Table 4 lists a different bricks-per-square-foot and mortar-per-brick figure for a ½ in. joint than for the standard ⅜ in. — adjust the bricks-per-square-foot field to match your actual joint if it is not ⅜ in.' },
        { title: 'Blocks are not bricks', body: 'QUIKRETE’s data sheet separately states the same 80 lb bag lays only 13 standard 8×8×16 in. concrete blocks, far fewer than 37 bricks, because each block covers much more wall per unit — this calculator is for brick, not block, walls.' }
      ],
      references: [
        { label: 'QUIKRETE, Mortar Mix (Product No. 1102) Data Sheet — bag yield in standard bricks and blocks', url: 'https://www.quikrete.com/pdfs/data_sheet-mortar%20mix%201102.pdf' },
        { label: 'Brick Industry Association, Technical Notes on Brick Construction 10 — Dimensioning and Estimating Brick Masonry (Table 4 mortar quantities; mortar waste recommendation)', url: 'https://www.gobrick.com/media/file/10-dimensioning-and-estimating-brick-masonry.pdf' }
      ]
    },
    inputs: [
      { id: 'wallLength', label: 'Wall length (ft)', type: 'number', placeholder: '18', defaultValue: 18, step: 0.5, min: 1 },
      { id: 'wallHeight', label: 'Wall height (ft)', type: 'number', placeholder: '8', defaultValue: 8, step: 0.5, min: 1 },
      { id: 'bricksPerSqFt', label: 'Bricks per sq ft (standard modular, ⅜ in. joint = 6.75)', type: 'number', placeholder: '6.75', defaultValue: 6.75, step: 0.05, min: 0.1 },
      { id: 'bricksPerBag', label: 'Bricks laid per 80 lb bag (Quikrete = 37)', type: 'number', placeholder: '37', defaultValue: 37, step: 1, min: 1 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '15', defaultValue: 15, step: 1, min: 0 }
    ],
    seo: {
      title: 'Mortar Calculator – Bags Needed for a Brick Wall',
      description: 'Free mortar calculator: how many bags of mortar mix a brick wall needs, using 37 bricks per 80 lb bag (QUIKRETE) and a 15% waste allowance.',
      faq: [
        { question: 'How many bags of mortar do I need?', answer: 'Find the brick count (wall area × bricks per sq ft), divide by the bricks one bag lays, then add a waste allowance. An 18×8 ft wall (972 bricks at 6.75 per sq ft) needs 26.27 bags at 37 bricks per 80 lb bag, 31 bags with 15% waste.' },
        { question: 'How many bricks does one bag of mortar lay?', answer: 'QUIKRETE’s own data sheet for its Mortar Mix (Product No. 1102) states an 80 lb bag lays up to 37 standard bricks, or 13 standard 8×8×16 in. concrete blocks.' },
        { question: 'How much waste allowance should I use for mortar?', answer: 'The Brick Industry Association recommends adding 15 to 25 percent to the net mortar quantity for waste — more than the 5% minimum it recommends for brick itself, since mortar is also lost to mixing, the board and tooling joints.' },
        { question: 'Why does this use the same bricks-per-square-foot figure as the brick calculator?', answer: 'Because mortar quantity depends on how many bricks — and therefore how many joints — the wall has, the same figure that determines the brick count. Keep the two calculators’ settings consistent for the same wall.' },
        { question: 'Does a different brick size change how much mortar I need?', answer: 'Yes. A different brick size or mortar joint thickness changes both the bricks-per-square-foot figure and the mortar-per-brick quantity — the Brick Industry Association’s Table 4 lists separate figures for each named brick size and joint.' },
        { question: 'Is mortar the same as concrete?', answer: 'No. Mortar bonds brick or block together in thin joints; concrete is poured in bulk for slabs, footings and foundations. This site’s concrete calculator covers slab volume and concrete bag counts separately.' },
        { question: 'Can I use this for a concrete block wall instead of brick?', answer: 'Not directly — QUIKRETE’s own figures differ by unit type (37 bricks vs. 13 standard 8×8×16 in. blocks per 80 lb bag), so a block wall needs its own bricks-per-square-foot-equivalent and bag-yield figures, not this page’s brick defaults.' }
      ]
    },
    compute(values) {
      const wallArea = values.wallLength * values.wallHeight;
      const bricksNeeded = wallArea * values.bricksPerSqFt;
      const bagsExact = bricksNeeded / values.bricksPerBag;
      const bagsWithWaste = bagsExact * (1 + values.wastePercent / 100);
      const bagsToBuy = Math.ceil(bagsWithWaste);
      return { wallArea, bricksNeeded, bagsExact, bagsWithWaste, bagsToBuy };
    }
  },
  {
    id: 'fence-calculator',
    category: 'home',
    glyph: 'fnc',
    updatedAt: '2026-11-02',
    aliases: ['how much fencing do i need', 'how many fence posts do i need', 'fence panel calculator', 'fence material calculator', 'fence post calculator'],
    related: ['decking-calculator', 'paver-calculator', 'concrete-calculator'],
    title: 'Fence Calculator',
    description: 'Find how many fence panels and posts a fence run needs from its total length and a panel width, using the same panel-plus-two posts convention published by The Home Depot.',
    example: 'A 100 ft fence run built with 8 ft panels needs 13 panels (104 ft of coverage once rounded up) and 15 posts, following The Home Depot’s own "panels plus two" posts rule.',
    breakdown: {
      headline: 'postsNeeded',
      headlineLabel: 'Posts needed',
      outputs: [
        { id: 'postsNeeded', label: 'Posts needed', format: 'integer' },
        { id: 'panelsNeeded', label: 'Panels needed', format: 'integer' },
        { id: 'actualCoverage', label: 'Coverage once rounded to whole panels', format: 'number', dimension: 'length', unit: 'ft' }
      ],
      groups: [
        { title: 'Fence run & panel width', inputs: ['fenceLength', 'panelWidth'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'fenceLength', label: 'Fence length needed' },
          { from: 'actualCoverage', label: 'Coverage with whole panels' }
        ],
        title: 'Fence length vs. coverage once rounded to whole panels'
      }
    },
    content: {
      lastReviewed: '2026-11-02',
      concept: {
        title: 'How many panels and posts a fence run needs',
        paragraphs: [
          'Fence panels and posts are a matched pair: pre-assembled vinyl and aluminum fence panels are built in fixed widths, almost always 6 ft or 8 ft, and the posts that hold them have to sit exactly that far apart, center to center, or the panel will not fit. That makes panel width and post spacing the same number for panel-based fencing, which is why this calculator asks for only one of them. Divide the total fence length by the panel width and round up to get the number of panels; a 100 ft run built with 8 ft panels needs 13 panels, since 12 panels would only cover 96 ft.',
          'The Home Depot’s own published fence-building guide gives a simple rule for turning a panel count into a post count: "Add two to the number of panels to determine how many posts you will need." That is one more than the bare geometric minimum of panels-plus-one (which is all a straight, uninterrupted run of shared posts strictly requires), and it is the retailer’s own stated buying rule, not a derived number — it is followed here exactly rather than replaced with a smaller "exact" count, since corners, gate posts and a spare are a normal part of a real fence-building order.',
          'A site-built fence — rails and pickets attached directly to posts rather than pre-made panels — follows the same post-spacing idea with more freedom: The Home Depot’s guide also recommends positioning posts "every 6-feet to 8-feet" for that style, so the panel-width field doubles as the post-spacing field either way.'
        ]
      },
      howTo: {
        intro: 'Enter the total fence length, then the panel width (or post spacing, for a rail-built fence).',
        steps: [
          { name: 'Measure the fence run', text: 'Add up the total length the fence needs to cover, in feet, following the property line or run you are fencing.' },
          { name: 'Enter the panel width', text: 'Use 8 for standard 8 ft vinyl or aluminum panels, 6 for 6 ft panels, or your own chosen post spacing (6–8 ft is typical) for a rail-built fence.' },
          { name: 'Read the panels needed', text: 'The fence length divided by the panel width, rounded up to a whole panel.' },
          { name: 'Read the posts needed', text: 'The headline figure: panels plus two, The Home Depot’s own published rule for panel fencing.' },
          { name: 'Check the actual coverage', text: 'Rounding up to whole panels almost always covers slightly more than the measured run — the chart shows the difference.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Panels come from the fence length divided by the panel width; posts follow The Home Depot’s own panels-plus-two rule.',
        expression: 'panels = ⌈ length ÷ panel width ⌉\nposts = panels + 2\ncoverage = panels × panel width',
        terms: [
          { symbol: 'length', meaning: 'Total fence run to cover, in feet.' },
          { symbol: 'panel width', meaning: 'Width of one pre-made panel (commonly 6 or 8 ft), or the chosen post spacing for a rail-built fence.' },
          { symbol: 'panels', meaning: 'Panels needed, rounded up — a fence can only be built from whole panels.' },
          { symbol: 'posts', meaning: 'Panels plus two, per The Home Depot’s published fence-building guide.' }
        ],
        note: 'An estimate for a single straight run. Corners, gates and slopes typically need extra posts beyond this count — add one post per corner and two per gate opening before ordering.'
      },
      workedExample: {
        intro: 'You are fencing a 100 ft property line with standard 8 ft vinyl panels.',
        rows: [
          { label: 'Panels (⌈100 ÷ 8⌉)', value: '13 panels' },
          { label: 'Posts (13 + 2)', value: '15 posts' },
          { label: 'Coverage (13 × 8)', value: '104.00 ft' }
        ],
        result: '13 panels, 15 posts, 104 ft of coverage',
        explanation: 'The same 100 ft run built with 6 ft panels instead needs 17 panels (⌈100 ÷ 6⌉ = 17) and 19 posts — more, smaller panels always need more posts for the same length, since posts are spaced closer together.'
      },
      watchOut: [
        { title: 'Corners and gates need extra posts', body: 'This calculator covers one straight run. A fence with corners needs an extra post at each corner (it is shared by two runs, but still a physical post), and a gate opening needs its own two gate posts beyond the panel count.' },
        { title: 'Panel width varies by manufacturer', body: '6 ft and 8 ft are the two common pre-made panel widths, but always check the specific product — a panel that is a few inches short of a round number changes the post spacing it needs.' },
        { title: 'Posts are set below the frost line', body: 'How deep a post needs to be set depends on local frost depth and soil, which varies by region — check your local building code or a installer rather than using one fixed depth nationwide.' },
        { title: 'Rounding up almost always buys slightly more coverage than you measured', body: 'Since panels only come in whole widths, the actual fence built is usually a little longer than the measured run, as in the worked example’s 104 ft of coverage for a 100 ft run.' },
        { title: 'Post footings are concrete, not fence material', body: 'Setting posts plumb in concrete is standard practice for a permanent fence; this site’s concrete calculator finds the concrete volume for those post holes separately.' }
      ],
      references: [
        { label: 'The Home Depot, "How to Build a Fence" (post spacing and the panels-plus-two posts rule)', url: 'https://www.homedepot.com/c/ah/how-to-build-a-fence/9ba683603be9fa5395fab90a485b4ce' }
      ]
    },
    inputs: [
      { id: 'fenceLength', label: 'Fence length (ft)', type: 'number', placeholder: '100', defaultValue: 100, step: 1, min: 1 },
      { id: 'panelWidth', label: 'Panel width / post spacing (ft, 6 or 8 is typical)', type: 'number', placeholder: '8', defaultValue: 8, step: 1, min: 1 }
    ],
    seo: {
      title: 'Fence Calculator – Panels and Posts Needed',
      description: 'Free fence calculator: panels and posts needed for any fence run, using The Home Depot’s own panels-plus-two posts rule for panel fencing.',
      faq: [
        { question: 'How many fence posts do I need?', answer: 'Divide the fence length by the panel width to get the panels needed, rounding up, then add 2 — The Home Depot’s own published rule for panel fencing. A 100 ft run with 8 ft panels needs 13 panels and 15 posts.' },
        { question: 'How much fencing do I need?', answer: 'Measure the total length of the run you are fencing. Since panels only come in whole widths, the actual length built (13 × 8 = 104 ft for a 100 ft run) is usually a little more than you measured.' },
        { question: 'What is the standard width of a fence panel?', answer: '6 ft and 8 ft are the two widths most pre-assembled vinyl and aluminum fence panels come in; post spacing has to match the panel width exactly for the panel to fit.' },
        { question: 'How far apart should fence posts be for a rail-built fence?', answer: 'The Home Depot’s guide recommends positioning posts every 6 to 8 feet for a picket or rail-built fence, the same range as the common pre-made panel widths.' },
        { question: 'Do corners and gates need extra posts?', answer: 'Yes. This calculator covers one straight run; add one post per corner and two gate posts per gate opening on top of the calculated total.' },
        { question: 'Why does the calculator add 2 posts instead of 1?', answer: 'The bare geometric minimum for a straight run of shared posts is panels plus one, but The Home Depot’s own published guide states panels plus two for panel fencing, which better matches a real order with end posts and a small buffer.' },
        { question: 'How deep should fence posts be set?', answer: 'It depends on local frost depth, soil and fence height, which vary by region — check your local building code or a fencing contractor rather than a single nationwide figure.' }
      ]
    },
    compute(values) {
      const panelsNeeded = Math.ceil(values.fenceLength / values.panelWidth);
      const postsNeeded = panelsNeeded + 2;
      const actualCoverage = panelsNeeded * values.panelWidth;
      return { panelsNeeded, postsNeeded, actualCoverage };
    }
  },
  {
    id: 'decking-calculator',
    category: 'home',
    glyph: 'dek',
    updatedAt: '2026-11-02',
    aliases: ['how many deck boards do i need', 'deck board calculator', 'composite decking calculator', 'deck material calculator', 'decking board spacing calculator'],
    related: ['fence-calculator', 'paver-calculator', 'concrete-calculator'],
    title: 'Decking Calculator',
    description: 'Find how many deck boards a deck needs from its two dimensions, the board width, the gap between boards and the standard board length, with a waste allowance, using Trex’s own published board dimensions and gap spacing.',
    example: 'A 12x16 ft deck built with 5.5 in wide boards, a 3⁄₁₆ in gap and 16 ft boards needs 26 boards exactly, or 29 with a 10% waste allowance.',
    breakdown: {
      headline: 'boardsWithWaste',
      headlineLabel: 'Boards to buy',
      outputs: [
        { id: 'boardsWithWaste', label: 'Boards to buy', format: 'integer' },
        { id: 'boardsExact', label: 'Boards needed, exact', format: 'number' },
        { id: 'rowsNeeded', label: 'Rows of boards', format: 'integer' },
        { id: 'boardsPerRow', label: 'Boards per row', format: 'integer' },
        { id: 'deckArea', label: 'Deck area', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Deck size', inputs: ['deckWidth', 'deckLength'] },
        { title: 'Board size & spacing', inputs: ['boardWidthIn', 'gapIn', 'boardLengthFt'] },
        { title: 'Waste', inputs: ['wastePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'boardsExact', label: 'Exact boards' },
          { from: 'boardsWithWaste', label: 'Boards to buy' }
        ],
        title: 'Deck boards needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-11-02',
      concept: {
        title: 'How many deck boards a deck needs',
        paragraphs: [
          'A deck is covered in two directions at once: boards run the length of the deck, laid side by side across its width, with a small gap between each one. Trex’s 2022 Decking Installation Guide lists its standard square-edge boards as .94 in thick by 5.5 in wide, sold in 12, 16 and 20 ft lengths — a width and length range common across composite decking brands. Add the gap to the board width to get how much width each row of decking actually takes up, then divide the deck’s width by that figure, rounded up, to get the number of rows.',
          'The same guide sets the minimum required width-to-width gap at 3⁄₁₆ in, in any weather, and an end-to-end gap of either 1⁄₈ in (above 40°F) or 3⁄₁₆ in (below 40°F) — composite decking expands and contracts with temperature, so the gap prevents boards from buckling against each other. This calculator uses the 3⁄₁₆ in width-to-width figure as its default, since that is the gap every row’s width depends on.',
          'The second direction is how many boards it takes to span the deck’s length: divide that length by the board’s own length (rounded up), since a single board that runs short of the deck needs a second board end to end. Multiplying rows by boards-per-row gives the exact board count, and a waste allowance on top covers trim cuts at the edges and the occasional damaged or warped board.'
        ]
      },
      howTo: {
        intro: 'Enter the deck’s two dimensions, then the board size and spacing, then a waste allowance.',
        steps: [
          { name: 'Enter the deck width', text: 'The dimension the boards run across, side by side — this sets how many rows of boards you need.' },
          { name: 'Enter the deck length', text: 'The dimension the boards run along — this sets how many boards it takes to span one row.' },
          { name: 'Enter the board width and gap', text: 'Trex’s standard board is 5.5 in wide with a minimum 3⁄₁₆ in (0.1875 in) width-to-width gap; use your product’s own label if it differs.' },
          { name: 'Enter the board length', text: 'Composite decking commonly comes in 12, 16 or 20 ft lengths — use the one closest to your deck’s length to minimize end joints.' },
          { name: 'Read the result', text: 'The headline is the boards to buy with waste; the rows below show the exact board count, the rows of boards, and boards per row.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Rows come from the deck width divided by one row’s footprint (board width plus gap); boards per row come from the deck length divided by the board length.',
        expression: 'row width = (board width + gap) ÷ 12\nrows = ⌈ deck width ÷ row width ⌉\nboards per row = ⌈ deck length ÷ board length ⌉\nboards = rows × boards per row\nboards(waste) = ⌈ boards × (1 + waste%) ⌉',
        terms: [
          { symbol: 'deck width', meaning: 'The dimension the boards run across, side by side, in feet.' },
          { symbol: 'deck length', meaning: 'The dimension the boards run along, in feet.' },
          { symbol: 'board width, gap', meaning: 'The board’s own width and the width-to-width gap, in inches; Trex’s minimum gap is 3⁄₁₆ in.' },
          { symbol: 'board length', meaning: 'The board’s standard length, in feet — 12, 16 and 20 ft are common.' },
          { symbol: 'waste%', meaning: 'Extra percent for trim cuts at the deck’s edges and the occasional damaged board.' }
        ],
        note: 'An estimate for a simple, single-direction board layout. A picture-frame or diagonal pattern, or a deck with cutouts for posts and stairs, needs more boards than this straightforward rows-times-length calculation.'
      },
      workedExample: {
        intro: 'You are decking a 12 ft by 16 ft deck with 5.5 in wide composite boards, a 3⁄₁₆ in (0.1875 in) gap, 16 ft board lengths and a 10% waste allowance.',
        rows: [
          { label: 'Row width ((5.5 + 0.1875) ÷ 12)', value: '0.4740 ft' },
          { label: 'Rows (⌈12 ÷ 0.4740⌉)', value: '26 rows' },
          { label: 'Boards per row (⌈16 ÷ 16⌉)', value: '1 board' },
          { label: 'Boards, exact (26 × 1)', value: '26 boards' },
          { label: 'With 10% waste (⌈26 × 1.10⌉)', value: '29 boards' }
        ],
        result: '29 boards to buy',
        explanation: 'Choosing 12 ft boards instead of 16 ft for the same 16 ft-long deck would need 2 boards per row (⌈16 ÷ 12⌉ = 2) instead of 1, doubling the board count to 52 exact — always match the board length to the deck’s own length where you can, to cut down on end joints and waste.'
      },
      watchOut: [
        { title: 'The minimum gap depends on temperature', body: 'Trex’s guide sets the end-to-end gap at 1⁄₈ in above 40°F but 3⁄₁₆ in below it, since composite boards contract in cold weather; the width-to-width gap stays at a 3⁄₁₆ in minimum in any weather.' },
        { title: 'Matching board length to deck length cuts waste', body: 'Boards shorter than the deck’s length need a butt joint partway across, which the exact-board count in this calculator does not add extra boards for — choosing a board length that matches or slightly exceeds the deck’s length avoids that entirely.' },
        { title: 'Patterns use more board than a straight layout', body: 'A diagonal, herringbone or picture-frame layout wastes more material in cuts than this straightforward rows-times-length calculation assumes; raise the waste allowance for those patterns.' },
        { title: 'Joist spacing is a separate requirement', body: 'Trex’s own span chart requires joists no more than 16 in on center (residential, 1 in boards) — that is a framing requirement underneath the deck, not a board-count question, and is not covered by this calculator.' },
        { title: 'Boards are sold by the piece, not cut to length', body: 'You cannot buy a fraction of a board; this calculator already rounds the board count up to a whole number both before and after the waste allowance.' }
      ],
      references: [
        { label: 'Trex Company, Inc., 2022 Decking Installation Guide (board dimensions, gapping requirements, joist spanning)', url: 'https://www.trex.com/content/dam/trex/literature/product-installation/2022-trex-decking-installation-guide.pdf' }
      ]
    },
    inputs: [
      { id: 'deckWidth', label: 'Deck width — boards run across this (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'deckLength', label: 'Deck length — boards run along this (ft)', type: 'number', placeholder: '16', defaultValue: 16, step: 0.5, min: 1 },
      { id: 'boardWidthIn', label: 'Board width (in, Trex standard = 5.5)', type: 'number', placeholder: '5.5', defaultValue: 5.5, step: 0.1, min: 1 },
      { id: 'gapIn', label: 'Width-to-width gap (in, Trex minimum = 0.1875)', type: 'number', placeholder: '0.1875', defaultValue: 0.1875, step: 0.0625, min: 0 },
      { id: 'boardLengthFt', label: 'Board length (ft, 12/16/20 are standard)', type: 'number', placeholder: '16', defaultValue: 16, step: 1, min: 1 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 }
    ],
    seo: {
      title: 'Decking Calculator – Deck Boards Needed',
      description: 'Free decking calculator: how many deck boards you need from the deck size, board width, gap spacing and board length, with a waste allowance.',
      faq: [
        { question: 'How many deck boards do I need?', answer: 'Divide the deck width by (board width + gap) for the rows, and the deck length by the board length for boards per row, then multiply. A 12x16 ft deck with 5.5 in boards, a 3⁄₁₆ in gap and 16 ft boards needs 26 boards exactly, 29 with a 10% waste allowance.' },
        { question: 'What gap should I leave between deck boards?', answer: 'Trex’s 2022 Decking Installation Guide sets a minimum 3⁄₁₆ in (0.1875 in) width-to-width gap in any weather, and an end-to-end gap of 1⁄₈ in above 40°F or 3⁄₁₆ in below it.' },
        { question: 'What length do deck boards come in?', answer: 'Trex’s standard composite boards come in 12, 16 and 20 ft lengths. Matching the board length to your deck’s own length minimizes end joints and waste.' },
        { question: 'How wide is a standard deck board?', answer: '5.5 in is the standard actual width for Trex’s 1 in square-edge composite boards, a width shared by most composite decking brands.' },
        { question: 'Why does board length matter for the board count?', answer: 'A board shorter than the deck’s length needs a second board end to end to finish the row. Using 12 ft boards on a 16 ft-long deck needs 2 boards per row instead of 1, doubling the exact board count in the worked example.' },
        { question: 'How much extra decking should I order for waste?', answer: '10% is a reasonable default for a simple, straight layout; raise it for a diagonal, herringbone or picture-frame pattern, which wastes more material in cuts.' },
        { question: 'Does this calculator account for joist spacing?', answer: 'No, joist spacing is a framing requirement underneath the deck (Trex’s own span chart calls for 16 in on center for residential 1 in boards), separate from how many boards the decking itself needs.' }
      ]
    },
    compute(values) {
      const rowWidthFt = (values.boardWidthIn + values.gapIn) / 12;
      const rowsNeeded = Math.ceil(values.deckWidth / rowWidthFt);
      const boardsPerRow = Math.ceil(values.deckLength / values.boardLengthFt);
      const boardsExact = rowsNeeded * boardsPerRow;
      const boardsWithWaste = Math.ceil(boardsExact * (1 + values.wastePercent / 100));
      const deckArea = values.deckWidth * values.deckLength;
      return { rowsNeeded, boardsPerRow, boardsExact, boardsWithWaste, deckArea };
    }
  },
  {
    id: 'roofing-calculator',
    category: 'home',
    glyph: 'sq',
    updatedAt: '2026-11-02',
    aliases: ['roof shingles calculator', 'roofing squares calculator', 'how many bundles of shingles do i need', 'shingle calculator', 'roof square footage calculator'],
    related: ['roof-pitch-calculator', 'fence-calculator', 'decking-calculator'],
    title: 'Roofing Calculator',
    description: 'Find how many roofing squares and shingle bundles a roof needs from its footprint and pitch, with a waste allowance and GAF’s own published bundles-per-square figure.',
    example: 'A 40x30 ft footprint (1,200 sq ft) at a 6-in-12 pitch has an actual roof area of 1,341.64 sq ft, or about 14.76 squares with a 10% waste allowance — 45 bundles at GAF’s 3 bundles per square.',
    breakdown: {
      headline: 'bundlesNeeded',
      headlineLabel: 'Bundles to buy',
      outputs: [
        { id: 'bundlesNeeded', label: 'Bundles to buy', format: 'integer' },
        { id: 'squaresNeeded', label: 'Roofing squares, with waste', format: 'number' },
        { id: 'roofAreaWithWaste', label: 'Roof area, with waste', format: 'number', dimension: 'area', unit: 'ft2' },
        { id: 'roofArea', label: 'Actual roof area (sloped)', format: 'number', dimension: 'area', unit: 'ft2' },
        { id: 'footprintArea', label: 'Footprint area (flat)', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Roof footprint', inputs: ['footprintLength', 'footprintWidth'] },
        { title: 'Pitch & waste', inputs: ['roofPitchRise', 'wastePercent'] },
        { title: 'Shingle coverage', inputs: ['bundlesPerSquare'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'footprintArea', label: 'Flat footprint' },
          { from: 'roofArea', label: 'Actual sloped roof area' }
        ],
        title: 'Footprint area vs. actual sloped roof area'
      }
    },
    content: {
      lastReviewed: '2026-11-02',
      concept: {
        title: 'How many squares and bundles of shingles a roof needs',
        paragraphs: [
          'A sloped roof always covers more actual surface than the flat footprint of the house underneath it, because the roof plane is tilted. The ratio between the two — the pitch multiplier — follows directly from the Pythagorean theorem applied to the standard way roof pitch is expressed: a rise of some number of inches for every 12 inches of horizontal run. For a 6-in-12 roof, the multiplier is √(1 + (6÷12)²) = √1.25 ≈ 1.118, meaning the real roof surface is about 11.8% more than the flat footprint. Multiply footprint area by this figure to get the actual area to be shingled.',
          'Roofing is bought and measured in "squares," a roofing-trade unit equal to 100 square feet of actual roof surface — a convention that has nothing to do with the shape of the roof and everything to do with making material estimates comparable across jobs of any size. Shingles themselves are bundled into smaller, liftable packages: GAF’s own product data sheet for its Timberline HDZ shingles, the best-selling shingle in the US, states "Bundles/Square: 3" and "Pieces/Square: 64," meaning each bundle covers about 33.3 square feet. Other product lines bundle differently — some thicker, heavier shingles use 4 or 5 bundles per square — so this figure is editable.',
          'A waste allowance on top of the squares figure covers the cuts at hips, valleys, ridges and rake edges that a real roof always has, which a simple length-times-width footprint calculation does not account for. The final bundle count rounds up, since a partial bundle still has to be bought whole.'
        ]
      },
      howTo: {
        intro: 'Enter the roof’s footprint, its pitch, a waste allowance, and the shingle’s bundles-per-square figure.',
        steps: [
          { name: 'Enter the roof footprint', text: 'The length and width of the building’s footprint (or one roof plane at a time, for a complex roof), in feet.' },
          { name: 'Enter the pitch', text: 'The rise in inches for every 12 inches of horizontal run — 6 is a common moderate pitch.' },
          { name: 'Set the waste allowance', text: 'Keep 10% for a simple gable roof; raise it toward 15–20% for a roof with hips, valleys or dormers that create more cuts.' },
          { name: 'Enter the bundles per square', text: 'Check the shingle’s own packaging; GAF’s Timberline HDZ uses 3, but heavier or specialty shingles can use 4 or 5.' },
          { name: 'Read the result', text: 'The headline is the bundles to buy; the rows below show the squares needed and the actual sloped roof area against the flat footprint.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The pitch multiplier scales the flat footprint up to the actual sloped roof area; squares and bundles follow by division and multiplication.',
        expression: 'multiplier = √(1 + (rise ÷ 12)²)\nroof area = footprint area × multiplier\narea(waste) = roof area × (1 + waste%)\nsquares = area(waste) ÷ 100\nbundles = ⌈ squares × bundles/square ⌉',
        terms: [
          { symbol: 'footprint area', meaning: 'Length × width of the roof’s flat footprint, in square feet.' },
          { symbol: 'rise', meaning: 'Vertical rise, in inches, for every 12 inches of horizontal run — the standard way US roof pitch is expressed.' },
          { symbol: 'multiplier', meaning: 'The ratio of actual sloped roof area to flat footprint area, from the Pythagorean theorem.' },
          { symbol: 'waste%', meaning: 'Extra percent for cuts at hips, valleys, ridges and rake edges.' },
          { symbol: 'bundles/square', meaning: 'Bundles that make up one 100 sq ft square; 3 for GAF Timberline HDZ, per its own product data sheet.' }
        ],
        note: 'An estimate. A roof with multiple planes at different pitches, or a complex hip-and-valley layout, needs each plane measured and summed separately for an exact figure.'
      },
      workedExample: {
        intro: 'A house has a 40 ft by 30 ft footprint, a roof pitch of 6-in-12, a 10% waste allowance, and GAF Timberline HDZ shingles at 3 bundles per square.',
        rows: [
          { label: 'Footprint area (40 × 30)', value: '1,200.00 sq ft' },
          { label: 'Pitch multiplier (√(1 + (6÷12)²))', value: '1.1180' },
          { label: 'Actual roof area (1,200.00 × 1.1180)', value: '1,341.64 sq ft' },
          { label: 'With 10% waste (1,341.64 × 1.10)', value: '1,475.80 sq ft' },
          { label: 'Squares (1,475.80 ÷ 100)', value: '14.76 squares' },
          { label: 'Bundles (14.76 × 3, rounded up)', value: '45 bundles' }
        ],
        result: '14.76 squares, 45 bundles',
        explanation: 'A steeper 12-in-12 pitch on the same footprint has a multiplier of 1.4142 instead of 1.1180 — a 26.5% larger actual roof area for the identical footprint, which is why a steep roof always needs noticeably more shingle than a shallow one covering the same house.'
      },
      watchOut: [
        { title: 'Pitch changes the real roof area more than it looks', body: 'Going from a 6-in-12 to a 12-in-12 pitch on the same footprint raises the multiplier from 1.118 to 1.414, about 26.5% more actual roof area — a steeper roof is not just a cosmetic choice, it is noticeably more material.' },
        { title: 'Bundles per square is specific to the product', body: 'GAF’s Timberline HDZ uses 3 bundles per square; its own Woodland-style shingles use 4. Always check the bundle you are actually buying rather than assuming 3.' },
        { title: 'A hip-and-valley roof wastes more than a simple gable', body: 'More hips, valleys and dormers mean more angled cuts that cannot be reused elsewhere — raise the waste allowance well above 10% for a complex roof shape.' },
        { title: 'Low-slope roofs need a different system entirely', body: 'Asphalt shingles are a steep-slope product; building codes commonly set 2-in-12 as a minimum slope for them, and the National Roofing Contractors Association recommends 4-in-12 or more as best practice. A flatter roof needs a membrane roofing system, not shingles.' },
        { title: 'Multiple roof planes need to be measured separately', body: 'This calculator treats the roof as one footprint at one pitch; a roof with wings or additions at different pitches needs each plane’s own footprint and pitch run through separately and the squares added together.' }
      ],
      references: [
        { label: 'GAF, Timberline HDZ Shingles (bundles and pieces per square)', url: 'https://www.gaf.com/en-us/roofing-materials/residential-roofing-materials/shingles/timberline-hdz' },
        { label: 'National Roofing Contractors Association, "Roof slope guidelines," Professional Roofing, August 2018 (code minimum and NRCA-recommended minimum slope for asphalt shingles)', url: 'https://www.professionalroofing.net/Articles/Roof-slope-guidelines--08-01-2018/4284' }
      ]
    },
    inputs: [
      { id: 'footprintLength', label: 'Roof footprint length (ft)', type: 'number', placeholder: '40', defaultValue: 40, step: 1, min: 1 },
      { id: 'footprintWidth', label: 'Roof footprint width (ft)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'roofPitchRise', label: 'Pitch — rise per 12 in. of run (in)', type: 'number', placeholder: '6', defaultValue: 6, step: 0.5, min: 0 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'bundlesPerSquare', label: 'Bundles per square (GAF Timberline HDZ = 3)', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 1 }
    ],
    seo: {
      title: 'Roofing Calculator – Squares and Shingle Bundles Needed',
      description: 'Free roofing calculator: squares and shingle bundles needed from the roof footprint and pitch, with a waste allowance and GAF’s bundles-per-square figure.',
      faq: [
        { question: 'How many squares of shingles do I need?', answer: 'Multiply the footprint area by the pitch multiplier (√(1+(rise÷12)²)) to get the actual roof area, add a waste allowance, then divide by 100. A 1,200 sq ft footprint at 6-in-12 needs about 14.76 squares with 10% waste.' },
        { question: 'How many bundles of shingles are in a square?', answer: 'It depends on the product. GAF’s Timberline HDZ, a common architectural shingle, uses 3 bundles per 100 sq ft square (64 pieces per square), per GAF’s own product data.' },
        { question: 'What is a roofing "square"?', answer: 'A roofing-trade unit equal to 100 square feet of actual roof surface — not a shape, just a standard measure used to estimate and price roofing jobs of any size.' },
        { question: 'How does roof pitch affect how much shingle I need?', answer: 'A steeper pitch means more actual roof surface for the same footprint. A 12-in-12 roof has about 26.5% more surface area than the same footprint at 6-in-12, because the multiplier rises from 1.118 to 1.414.' },
        { question: 'How much extra shingle should I order for waste?', answer: '10% is a common starting point for a simple gable roof; raise it toward 15–20% for a roof with more hips, valleys or dormers, which create more angled cuts.' },
        { question: 'What is the minimum roof pitch for asphalt shingles?', answer: 'Building codes commonly allow asphalt shingles down to a 2-in-12 slope, but the National Roofing Contractors Association recommends 4-in-12 or steeper as best practice; flatter roofs need a membrane system instead.' },
        { question: 'Do all shingle brands use the same bundles-per-square figure?', answer: 'No. GAF’s Timberline HDZ uses 3; some heavier or specialty shingle lines use 4 or 5 bundles per square because each bundle is kept light enough to lift onto the roof.' }
      ]
    },
    compute(values) {
      const footprintArea = values.footprintLength * values.footprintWidth;
      const pitchMultiplier = Math.sqrt(1 + (values.roofPitchRise / 12) ** 2);
      const roofArea = footprintArea * pitchMultiplier;
      const roofAreaWithWaste = roofArea * (1 + values.wastePercent / 100);
      const squaresNeeded = roofAreaWithWaste / 100;
      const bundlesNeeded = Math.ceil(squaresNeeded * values.bundlesPerSquare);
      return { footprintArea, roofArea, roofAreaWithWaste, squaresNeeded, bundlesNeeded };
    }
  },
  {
    id: 'roof-pitch-calculator',
    category: 'home',
    glyph: 'X12',
    updatedAt: '2026-11-02',
    aliases: ['roof pitch to degrees calculator', 'rafter length calculator', 'roof angle calculator', 'roof slope calculator', 'pitch calculator'],
    related: ['roofing-calculator', 'decking-calculator', 'fence-calculator'],
    title: 'Roof Pitch Calculator',
    description: 'Find a roof’s angle in degrees and its rafter length from the pitch (rise per 12 inches of run) and the horizontal run, using the Pythagorean theorem.',
    example: 'A 6-in-12 pitch over a 12 ft horizontal run has a roof angle of about 26.57° and a rafter length of about 13.42 ft.',
    breakdown: {
      headline: 'angleDeg',
      headlineLabel: 'Roof angle',
      outputs: [
        { id: 'angleDeg', label: 'Roof angle (degrees)', format: 'number' },
        { id: 'pitchMultiplier', label: 'Pitch multiplier (rafter length per ft of run)', format: 'number' },
        { id: 'rafterLengthFt', label: 'Rafter length', format: 'number', dimension: 'length', unit: 'ft' }
      ],
      groups: [
        { title: 'Pitch', inputs: ['riseIn'] },
        { title: 'Rafter run', inputs: ['runFt'] }
      ],
      visual: {
        type: 'rangeBar',
        value: 'angleDeg',
        title: 'Roof angle against code and NRCA shingle-slope guidance',
        bands: [
          { label: 'Below code minimum for shingles (under 2-in-12)', min: 0, max: 9.46 },
          { label: 'Code minimum, below NRCA’s recommendation', min: 9.46, max: 18.43 },
          { label: 'Meets NRCA’s recommended minimum (4-in-12+)', min: 18.43, max: 90 }
        ]
      }
    },
    content: {
      lastReviewed: '2026-11-02',
      concept: {
        title: 'Roof pitch, angle and rafter length',
        paragraphs: [
          'US roofing and carpentry express a roof’s steepness as a pitch: the rise in inches for every 12 inches of horizontal run, written as "X in 12" or X:12. Wikipedia’s entry on roof pitch states the convention plainly: "a roof that rises 6 inches for every 12 inches of horizontal run has a slope of 6:12." That ratio is really a tangent — rise over run — so the angle in degrees follows directly from trigonometry: angle = arctan(rise ÷ 12).',
          'The same rise-and-run triangle gives the rafter length through the Pythagorean theorem. For every 12 inches of run, the rafter covers a hypotenuse of √(12² + rise²) inches — or, as a multiplier per foot of run, √(1 + (rise÷12)²). Multiply that multiplier by the actual horizontal run (commonly half the building’s width, for a common rafter running from the ridge to the wall plate) to get the rafter’s true length, longer than the run itself because it travels up the slope rather than straight across.',
          'Traditionally, carpenters laid this out on a framing square using the rise-per-12-inches figure directly, without ever computing the angle in degrees at all — Wikipedia notes that framing squares provide "rise-per-unit-run information, which is essential for calculating rafter lengths." The degree figure this calculator shows is useful for a miter saw or an angle finder, but the rise-over-run ratio itself is the older and still most common way the trade measures pitch.'
        ]
      },
      howTo: {
        intro: 'Enter the pitch as a rise per 12 inches of run, then the actual horizontal run the rafter covers.',
        steps: [
          { name: 'Enter the rise', text: 'The vertical rise, in inches, for every 12 inches of horizontal run — 6 is a common moderate pitch, written 6-in-12.' },
          { name: 'Enter the horizontal run', text: 'The actual horizontal distance the rafter spans, in feet — commonly half the building’s width for a simple gable roof.' },
          { name: 'Read the angle', text: 'The headline figure, in degrees, useful for setting a miter saw or angle finder.' },
          { name: 'Read the rafter length', text: 'The true sloped length of the rafter, always longer than the horizontal run itself.' },
          { name: 'Check the slope-guidance band', text: 'The chart shows where the angle falls against the code minimum and NRCA’s recommended minimum for asphalt shingles.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The angle comes from the arctangent of rise over a 12-inch run; the rafter length comes from the Pythagorean theorem applied to the same triangle.',
        expression: 'multiplier = √(1 + (rise ÷ 12)²)\nangle = arctan(rise ÷ 12)\nrafter length = run × multiplier',
        terms: [
          { symbol: 'rise', meaning: 'Vertical rise, in inches, for every 12 inches of horizontal run.' },
          { symbol: 'run', meaning: 'The actual horizontal distance the rafter spans, in feet.' },
          { symbol: 'multiplier', meaning: 'Rafter length per foot of horizontal run — also the roof’s area multiplier over its flat footprint.' },
          { symbol: 'angle', meaning: 'The roof’s slope, in degrees from horizontal.' }
        ],
        note: 'An estimate for a simple common rafter with no overhang. A real rafter also needs a small overhang added at the eave and a seat/plumb cut allowance, which a carpenter adds on top of this bare triangle length.'
      },
      workedExample: {
        intro: 'A roof has a 6-in-12 pitch, and the common rafter spans a 12 ft horizontal run from ridge to wall plate.',
        rows: [
          { label: 'Multiplier (√(1 + (6÷12)²))', value: '1.1180' },
          { label: 'Angle (arctan(6÷12))', value: '26.57°' },
          { label: 'Rafter length (12 × 1.1180)', value: '13.42 ft' }
        ],
        result: 'Angle ≈ 26.57°, rafter length ≈ 13.42 ft',
        explanation: 'A shallower 4-in-12 pitch over a 15 ft run gives an angle of 18.43° and a rafter length of about 15.81 ft — exactly the code-vs-NRCA boundary this calculator’s chart marks, since 4-in-12 is the National Roofing Contractors Association’s own recommended minimum slope for asphalt shingles.'
      },
      watchOut: [
        { title: 'The run is the rafter’s run, not the whole building width', body: 'For a simple gable roof, the common rafter’s horizontal run is normally half the building’s width (ridge to wall), not the full width — use the half-width figure, not the whole span.' },
        { title: 'This is the bare triangle, not a cut list', body: 'Real rafters need an added eave overhang and the angled plumb and seat cuts at each end; a carpenter adds those on top of this calculator’s raw rafter length.' },
        { title: 'Degrees and X-in-12 describe the same slope two ways', body: 'A 6-in-12 pitch and a 26.57° angle are the identical slope; carpentry has historically used the rise-per-12-inches figure directly on a framing square, while degrees are more useful for a digital angle finder or miter saw.' },
        { title: 'Shingles have a recommended minimum slope', body: 'Building codes commonly allow asphalt shingles as low as 2-in-12 (about 9.46°), but the National Roofing Contractors Association recommends 4-in-12 (about 18.43°) or steeper as best practice — this calculator’s chart marks both thresholds.' },
        { title: 'A hip or valley rafter is a different, steeper calculation', body: 'This calculator covers a common rafter, running straight up the slope. A hip or valley rafter runs at a diagonal across two roof planes and needs its own, longer formula.' }
      ],
      references: [
        { label: 'Wikipedia, "Roof pitch" (the rise/run "X in 12" convention; framing squares)', url: 'https://en.wikipedia.org/wiki/Roof_pitch' },
        { label: 'National Roofing Contractors Association, "Roof slope guidelines," Professional Roofing, August 2018 (code minimum and recommended minimum slope for asphalt shingles)', url: 'https://www.professionalroofing.net/Articles/Roof-slope-guidelines--08-01-2018/4284' }
      ]
    },
    inputs: [
      { id: 'riseIn', label: 'Rise (inches per 12 in. of run)', type: 'number', placeholder: '6', defaultValue: 6, step: 0.5, min: 0 },
      { id: 'runFt', label: 'Horizontal run (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 0.1 }
    ],
    seo: {
      title: 'Roof Pitch Calculator – Angle and Rafter Length',
      description: 'Free roof pitch calculator: find the angle in degrees and the rafter length from a rise-per-12-inch pitch and the horizontal run, using the Pythagorean theorem.',
      faq: [
        { question: 'How do I convert roof pitch to degrees?', answer: 'Take the arctangent of the rise divided by 12. A 6-in-12 pitch is arctan(6÷12) ≈ 26.57°.' },
        { question: 'How do I find rafter length from roof pitch?', answer: 'Multiply the horizontal run by the pitch multiplier, √(1 + (rise÷12)²). A 6-in-12 pitch over a 12 ft run gives a rafter length of about 13.42 ft.' },
        { question: 'What does "6 in 12" roof pitch mean?', answer: 'The roof rises 6 inches for every 12 inches of horizontal run — the standard US way of expressing roof steepness, also written 6:12.' },
        { question: 'What is the minimum roof pitch for shingles?', answer: 'Building codes commonly allow asphalt shingles down to 2-in-12 (about 9.46°), but the National Roofing Contractors Association recommends 4-in-12 (about 18.43°) or steeper as best practice.' },
        { question: 'Is the rafter run the same as half the building width?', answer: 'For a simple gable roof with a common rafter, yes — the horizontal run is normally half the building’s width, from the outside wall to the center ridge.' },
        { question: 'Why is the rafter longer than the horizontal run?', answer: 'Because the rafter travels up the slope, not straight across. The Pythagorean theorem relates the two: rafter length = run × √(1 + (rise÷12)²), always longer than the run itself for any positive pitch.' },
        { question: 'Does this calculator add an overhang or cut allowances?', answer: 'No, it gives the bare rise-run-rafter triangle. A real cut list adds an eave overhang and the plumb and seat cuts a carpenter makes at each end of the rafter.' }
      ]
    },
    compute(values) {
      const pitchMultiplier = Math.sqrt(1 + (values.riseIn / 12) ** 2);
      const angleDeg = Math.atan(values.riseIn / 12) * (180 / Math.PI);
      const rafterLengthFt = values.runFt * pitchMultiplier;
      return { pitchMultiplier, angleDeg, rafterLengthFt };
    }
  },
  {
    id: 'paver-calculator',
    category: 'home',
    glyph: 'pvr',
    updatedAt: '2026-11-02',
    aliases: ['how many pavers do i need', 'patio paver calculator', 'paver patio calculator', 'hardscape paver calculator', 'paver base calculator'],
    related: ['gravel-calculator', 'sand-calculator', 'concrete-calculator'],
    title: 'Paver Calculator',
    description: 'Find how many pavers a patio or walkway needs from its area and paver size, with a waste allowance, plus the base gravel and bedding sand volumes from ICPI’s own installation standard.',
    example: 'A 12x10 ft (120 sq ft) patio laid with 8x4 in pavers needs 540 pavers exactly, or 567 with a 5% waste allowance — plus 1.48 cubic yards of base gravel and 0.37 cubic yards of bedding sand.',
    breakdown: {
      headline: 'paversWithWaste',
      headlineLabel: 'Pavers to buy',
      outputs: [
        { id: 'paversWithWaste', label: 'Pavers to buy', format: 'integer' },
        { id: 'paversExact', label: 'Pavers needed, exact', format: 'number' },
        { id: 'areaSqFt', label: 'Patio area', format: 'number', dimension: 'area', unit: 'ft2' },
        { id: 'baseVolumeCuYd', label: 'Base gravel needed', format: 'number' },
        { id: 'sandVolumeCuYd', label: 'Bedding sand needed', format: 'number' }
      ],
      groups: [
        { title: 'Patio area', inputs: ['areaLength', 'areaWidth'] },
        { title: 'Paver size & waste', inputs: ['paverLengthIn', 'paverWidthIn', 'wastePercent'] },
        { title: 'Base & bedding sand depth', inputs: ['baseDepthIn', 'sandDepthIn'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'paversExact', label: 'Exact pavers' },
          { from: 'paversWithWaste', label: 'Pavers to buy' }
        ],
        title: 'Pavers needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-11-02',
      concept: {
        title: 'How many pavers, and how much base, a patio needs',
        paragraphs: [
          'Pavers are bought by the piece but measured by area, so the first step divides the patio or walkway’s area by the footprint of one paver. A 12 ft by 10 ft patio (120 sq ft) laid with 8 in by 4 in pavers — a common concrete paver size — needs exactly 540 pavers before any waste, since each paver covers 8×4÷144 = 0.2222 square feet. Oregon State University Extension’s own published installation guide puts the waste allowance plainly: "You should always add 5% to this figure, to allow for the pavers that will be cut to fit curves and odd spaces. If you know that you will be cutting a lot of pavers, you should add 10%."',
          'A paver patio is not just the pavers themselves — it sits on a compacted base and a thin bedding sand layer underneath. The Interlocking Concrete Pavement Institute (ICPI), the trade association for the segmental paving industry, states in its Tech Spec 10 installation guide that "Minimum aggregate base thickness for walks should be 4 to 6 in." and that pavers are set on "Bedding sand nominal 1 in. (25 mm) thick." Oregon State’s extension guide independently confirms both figures, giving the same 4–6 in base range and a 1 in sand layer in its own step-by-step instructions.',
          'Both the base gravel and the bedding sand are bought by volume — the same area times a depth calculation this site’s gravel and sand calculators already use — so this page converts the patio’s area at the chosen base and sand depths into cubic feet and cubic yards, ready to compare against a supplier’s delivered-by-the-yard pricing.'
        ]
      },
      howTo: {
        intro: 'Enter the patio area, the paver size and a waste allowance, then the base and bedding sand depths.',
        steps: [
          { name: 'Enter the patio area', text: 'Type the length and width of the patio or walkway, in feet. For an irregular shape, measure it as a few rectangles and add the areas.' },
          { name: 'Enter the paver size', text: 'Type the paver’s length and width in inches, as printed on the pack — 8 by 4 in is a common concrete paver size.' },
          { name: 'Set the waste allowance', text: 'Keep 5% for a simple rectangular layout, per Oregon State Extension’s guide, or raise it to 10% for a lot of cuts, curves or a diagonal pattern.' },
          { name: 'Set the base and bedding sand depth', text: 'Keep ICPI’s own 4 in base and 1 in bedding sand figures for a pedestrian patio or walkway, or raise the base toward 6–8 in if the area will see vehicle traffic.' },
          { name: 'Read the result', text: 'The headline is the pavers to buy; the rows below show the exact paver count, the area, and the base gravel and bedding sand volumes.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Area divided by one paver’s footprint gives the exact paver count; the same area times each depth gives the base and sand volumes.',
        expression: 'paver area = (Lp ÷ 12) × (Wp ÷ 12)\npavers = ⌈ (area ÷ paver area) × (1 + waste%) ⌉\nbase volume = area × (base depth ÷ 12) ÷ 27\nsand volume = area × (sand depth ÷ 12) ÷ 27',
        terms: [
          { symbol: 'area', meaning: 'Patio or walkway area to cover, in square feet.' },
          { symbol: 'Lp, Wp', meaning: 'Paver length and width, in inches.' },
          { symbol: 'waste%', meaning: 'Extra percent for cuts at curves and edges; 5% for a simple layout, 10% for heavy cutting, per Oregon State Extension.' },
          { symbol: 'base depth', meaning: 'Compacted aggregate base thickness, in inches; ICPI recommends 4–6 in for walks and patios.' },
          { symbol: 'sand depth', meaning: 'Bedding sand thickness, in inches; ICPI’s own standard is a nominal 1 in.' }
        ],
        note: 'An estimate. Base depth should increase for vehicle traffic or a soft/clay subgrade, per ICPI’s own guidance; always compact the base and screed the bedding sand to a consistent depth before laying pavers.'
      },
      workedExample: {
        intro: 'You are laying a 12 ft by 10 ft patio with 8 in by 4 in pavers, a 5% waste allowance, a 4 in base and a 1 in bedding sand layer.',
        rows: [
          { label: 'Area (12 × 10)', value: '120.00 sq ft' },
          { label: 'Paver footprint ((8÷12) × (4÷12))', value: '0.2222 sq ft' },
          { label: 'Exact pavers (120.00 ÷ 0.2222)', value: '540.00' },
          { label: 'With 5% waste (540.00 × 1.05)', value: '567.00' },
          { label: 'Base volume (120.00 × (4÷12) ÷ 27)', value: '1.48 cu yd' },
          { label: 'Sand volume (120.00 × (1÷12) ÷ 27)', value: '0.37 cu yd' }
        ],
        result: '567 pavers, 1.48 cu yd base gravel, 0.37 cu yd bedding sand',
        explanation: 'Raising the base depth to ICPI’s 6 in upper figure for the same 120 sq ft patio needs 2.22 cu yd of base instead of 1.48 — 50% more — while the paver and sand figures stay the same, since only the base layer’s thickness changed.'
      },
      watchOut: [
        { title: 'Base depth depends on use, not just the ICPI minimum', body: 'ICPI’s 4–6 in figure is for walks and patios; its own Tech Spec 10 calls for 6–8 in for driveways carrying vehicles, and more over soft or clay subgrades.' },
        { title: 'Pavers round up in whole units, base and sand round up in whole deliveries', body: 'You cannot buy a fraction of a paver, and most suppliers sell base and sand by the cubic yard or by the bag — check your supplier’s own minimum order and unit size against the calculated volumes.' },
        { title: 'Bedding sand is not joint sand', body: 'The 1 in bedding sand this calculator computes goes under the pavers, screeded flat before they are laid; sand swept into the joints afterward is a separate, much smaller quantity not covered here.' },
        { title: 'A complex pattern wastes more than a simple one', body: 'Oregon State Extension’s 5% default suits a straightforward rectangular layout; a 45° or herringbone pattern, or a curved edge, cuts more pavers and should use a higher waste allowance.' },
        { title: 'Paver size varies widely by product', body: '8 by 4 in is one common size, but concrete pavers are sold in many shapes and sizes from small cobbles to large-format slabs — always use your own product’s printed dimensions.' }
      ],
      references: [
        { label: 'Interlocking Concrete Pavement Institute, Tech Spec 10 — Application Guide for Interlocking Concrete Pavements (base depth, bedding sand thickness)', url: 'https://www.cmha.org/wp-content/uploads/2023/12/TechSpec10-ApplicationGuide2022.pdf' },
        { label: 'Oregon State University Extension Service, "10-Step Guide to Installing Pavers" (waste allowance, base and bedding sand depth)', url: 'https://extension.oregonstate.edu/sites/extd8/files/documents/1/howtoinstallpavers.pdf' }
      ]
    },
    inputs: [
      { id: 'areaLength', label: 'Patio length (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 0.5 },
      { id: 'areaWidth', label: 'Patio width (ft)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.5, min: 0.5 },
      { id: 'paverLengthIn', label: 'Paver length (in)', type: 'number', placeholder: '8', defaultValue: 8, step: 0.5, min: 1 },
      { id: 'paverWidthIn', label: 'Paver width (in)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 1 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'baseDepthIn', label: 'Base gravel depth (in, ICPI walks/patios = 4–6)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 1 },
      { id: 'sandDepthIn', label: 'Bedding sand depth (in, ICPI nominal = 1)', type: 'number', placeholder: '1', defaultValue: 1, step: 0.25, min: 0.5 }
    ],
    seo: {
      title: 'Paver Calculator – Pavers, Base and Bedding Sand Needed',
      description: 'Free paver calculator: pavers needed for a patio or walkway, with a waste allowance, plus base gravel and bedding sand volumes from ICPI’s own standard.',
      faq: [
        { question: 'How many pavers do I need for a patio?', answer: 'Divide the patio area by one paver’s footprint, then add a waste allowance. A 12×10 ft (120 sq ft) patio with 8×4 in pavers needs 540 pavers exactly, 567 with a 5% waste allowance.' },
        { question: 'How much extra should I order for cut pavers?', answer: 'Oregon State University Extension’s installation guide recommends adding 5% for a simple layout, or 10% if you know you will be cutting a lot of pavers for curves or odd spaces.' },
        { question: 'How deep should the base be under pavers?', answer: 'The Interlocking Concrete Pavement Institute’s Tech Spec 10 recommends a 4 to 6 in compacted aggregate base for walks and patios, and 6 to 8 in for driveways carrying vehicles.' },
        { question: 'How thick should the bedding sand layer be?', answer: 'ICPI’s own standard calls for a nominal 1 in bedding sand layer under the pavers, screeded flat before laying — not used to fill depressions in the base.' },
        { question: 'How much base gravel and sand do I need in cubic yards?', answer: 'Multiply the patio area by the depth (in feet) and divide by 27. The 120 sq ft worked example needs 1.48 cu yd of base gravel at 4 in deep and 0.37 cu yd of bedding sand at 1 in deep.' },
        { question: 'Is bedding sand the same as the sand swept into the joints?', answer: 'No. Bedding sand is the 1 in layer the pavers sit on, screeded flat; joint sand is swept into the gaps between pavers afterward, a separate and much smaller quantity.' },
        { question: 'What paver size does this calculator assume?', answer: '8 by 4 in by default, a common concrete paver size, but the length and width fields work for any rectangular paver — use your own product’s printed dimensions.' }
      ]
    },
    compute(values) {
      const areaSqFt = values.areaLength * values.areaWidth;
      const paverSqFt = (values.paverLengthIn / 12) * (values.paverWidthIn / 12);
      const paversExact = areaSqFt / paverSqFt;
      const paversWithWaste = Math.ceil(paversExact * (1 + values.wastePercent / 100));
      const baseVolumeCuYd = (areaSqFt * (values.baseDepthIn / 12)) / 27;
      const sandVolumeCuYd = (areaSqFt * (values.sandDepthIn / 12)) / 27;
      return { areaSqFt, paversExact, paversWithWaste, baseVolumeCuYd, sandVolumeCuYd };
    }
  },
  {
    id: 'mulch-calculator',
    category: 'home',
    glyph: 'mul',
    updatedAt: '2026-11-04',
    aliases: ['how much mulch do i need', 'mulch calculator bags', 'mulch cubic yards calculator', 'garden bed mulch calculator', 'mulch coverage calculator'],
    related: ['topsoil-calculator', 'gravel-calculator', 'sand-calculator', 'paver-calculator'],
    title: 'Mulch Calculator',
    description: 'Find how many bags or cubic yards of mulch a flower bed, tree ring or landscape bed needs from its area and depth, with a waste allowance.',
    example: 'A 20x10 ft bed mulched 3 inches deep needs 50.00 cubic feet (1.85 cubic yards), or 55.00 cubic feet (2.04 cubic yards) with a 10% waste allowance — 28 bags at 2 cubic feet per bag.',
    breakdown: {
      headline: 'bagsToBuy',
      headlineLabel: 'Bags to buy (2 cu ft bags)',
      outputs: [
        { id: 'bagsToBuy', label: 'Bags to buy', format: 'integer' },
        { id: 'cubicYardsWithWaste', label: 'Cubic yards to buy (bulk order)', format: 'number' },
        { id: 'cubicYardsExact', label: 'Cubic yards needed, exact', format: 'number' },
        { id: 'cubicFeetExact', label: 'Cubic feet needed, exact', format: 'number' },
        { id: 'areaSqFt', label: 'Bed area', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Bed area & depth', inputs: ['areaLength', 'areaWidth', 'depthInches'] },
        { title: 'Bag size & waste', inputs: ['bagSizeCuFt', 'wastePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'cubicFeetExact', label: 'Exact cu ft' },
          { from: 'cubicFeetWithWaste', label: 'Cu ft to buy' }
        ],
        title: 'Mulch needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-11-04',
      concept: {
        title: 'How much mulch a bed really needs',
        paragraphs: [
          'Mulch is spread by depth over an area, so the math is the same geometry this site’s gravel and sand calculators use: length times width gives the bed’s area, and area times depth gives the volume. A 20 ft by 10 ft bed mulched 3 inches deep comes to 200 square feet times 0.25 feet, or 50 cubic feet — 1.85 cubic yards before any waste allowance.',
          'How deep to spread it is a real horticultural question, not just a style choice. Virginia Cooperative Extension’s 2025 guide to mulching puts the recommended depth at "generally 2-4 inches" and warns against letting mulch "build up to a depth greater than 4 inches." It recommends a shallower 2 to 3 inches around trees and shrubs, and just 1 to 2 inches for fine or double-shredded mulch — a layer that is too thick starves roots of oxygen and can smother the very plants it is meant to protect.',
          'Mulch is sold two ways: in bags, usually 2 cubic feet each at US home centers, for smaller beds, or in bulk by the cubic yard for larger jobs. Mulch Pros Landscape Supply, a real aggregate and mulch yard, publishes coverage figures of about 162 square feet per cubic yard at 2 inches deep and 108 square feet at 3 inches — both of which match this calculator’s own area-divided-by-depth arithmetic exactly, confirming it is the same math a yard uses to quote a delivery.'
        ]
      },
      howTo: {
        intro: 'Enter the bed, then the depth, bag size and a waste allowance.',
        steps: [
          { name: 'Enter the bed dimensions', text: 'Type the length and width of the bed or tree ring in feet.' },
          { name: 'Enter the mulch depth', text: 'Virginia Cooperative Extension recommends 2 to 4 inches generally, never more than 4; use 2–3 in for trees and shrubs, 1–2 in for fine or double-shredded mulch.' },
          { name: 'Set the bag size', text: 'Keep 2 cubic feet for a standard US retail bag, or type the cubic feet printed on your own bag.' },
          { name: 'Set the waste allowance', text: 'Keep 10% for spillage and an uneven bed surface, or raise it for a larger or more irregular bed.' },
          { name: 'Read the result', text: 'The headline is the bags to buy; the rows below show the cubic yards for a bulk order and the exact volume before waste.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Area times depth gives the volume; convert to cubic yards for a bulk order, or divide by the bag size for bagged mulch.',
        expression: 'cu ft = L × W × (depth ÷ 12)\ncu yd = cu ft ÷ 27\nbags = ⌈(cu ft × (1 + waste%)) ÷ bag size⌉',
        terms: [
          { symbol: 'L, W', meaning: 'Bed length and width, in feet.' },
          { symbol: 'depth', meaning: 'Mulch depth, in inches — Virginia Cooperative Extension recommends 2–4 in, never more than 4.' },
          { symbol: 'bag size', meaning: 'Cubic feet per bag; 2 cu ft is the standard US retail bag size.' },
          { symbol: 'waste%', meaning: 'Extra percent for spillage and an uneven bed surface; 10% is a common starting point.' }
        ],
        note: 'An estimate. Settled mulch depth is less than freshly spread depth, so beds often need topping up after the first season as organic mulch decomposes.'
      },
      workedExample: {
        intro: 'You are mulching a 20 ft by 10 ft bed 3 inches deep, with 2 cubic foot bags and a 10% waste allowance.',
        rows: [
          { label: 'Area (20 × 10)', value: '200.00 sq ft' },
          { label: 'Depth in feet (3 ÷ 12)', value: '0.25 ft' },
          { label: 'Cubic feet, exact (200.00 × 0.25)', value: '50.00 ft³' },
          { label: 'Cubic yards, exact (50.00 ÷ 27)', value: '1.85 yd³' },
          { label: 'Cubic feet with 10% waste (50.00 × 1.10)', value: '55.00 ft³' },
          { label: 'Cubic yards with waste (55.00 ÷ 27)', value: '2.04 yd³' },
          { label: 'Bags to buy (55.00 ÷ 2, rounded up)', value: '28 bags' }
        ],
        result: '28 bags (2.04 cubic yards) to buy',
        explanation: 'Spreading the same bed at Virginia Cooperative Extension’s 4-inch maximum instead of 3 inches needs 66.67 cubic feet before waste — about 33.3% more than the 50.00 cubic feet at 3 inches, since volume scales directly with depth.'
      },
      watchOut: [
        { title: 'Depth affects volume directly', body: 'Doubling the depth doubles the mulch needed for the same bed — stay within Virginia Cooperative Extension’s 2–4 in range rather than over-ordering for a thicker-than-needed layer.' },
        { title: 'Settled depth is less than freshly spread depth', body: 'Organic mulch compacts and decomposes over a season, so beds often need topping up — this calculator computes the freshly spread volume, not a maintenance top-up amount.' },
        { title: 'Keep mulch off tree trunks and plant stems', body: 'Virginia Cooperative Extension warns against "mulch volcanoes" piled against a trunk; keep mulch 3–4 inches back from the trunk so the root flare stays visible.' },
        { title: 'Bag size varies by brand', body: 'This calculator defaults to the common 2 cubic foot bag, but always check the cubic feet printed on your specific product before buying.' },
        { title: 'Bulk mulch is usually cheaper for larger beds', body: 'Compare the bagged total above against a landscape yard’s price per cubic yard before buying many bags for a large bed.' }
      ],
      references: [
        { label: 'Virginia Cooperative Extension, SPES-661P, "Mulching: Purpose, Benefits, and Essential Information" (Garrity & Tierney, 2025) — recommended depth, trunk clearance', url: 'https://www.pubs.ext.vt.edu/content/dam/pubs_ext_vt_edu/spes/spes-661/SPES-661.pdf' },
        { label: 'Mulch Pros Landscape Supply, Material Weight and Coverage (cubic-yard coverage by depth)', url: 'https://mulchpros.com/material-weight-and-coverage/' }
      ]
    },
    inputs: [
      { id: 'areaLength', label: 'Bed length (ft)', type: 'number', placeholder: '20', defaultValue: 20, step: 0.5, min: 0.5 },
      { id: 'areaWidth', label: 'Bed width (ft)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.5, min: 0.5 },
      { id: 'depthInches', label: 'Mulch depth (in, Virginia Cooperative Extension recommends 2–4)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0.5 },
      { id: 'bagSizeCuFt', label: 'Bag size (cu ft, standard retail bag = 2)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.5, min: 0.5 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 }
    ],
    seo: {
      title: 'Mulch Calculator – Bags and Cubic Yards Needed',
      description: 'Free mulch calculator: bags or cubic yards needed for a bed from its area and depth, with extension-recommended depth guidance and a waste allowance.',
      faq: [
        { question: 'How much mulch do I need?', answer: 'Multiply the bed’s area by the depth to get the volume, then add a waste allowance. A 20×10 ft bed, 3 inches deep, needs 50.00 cubic feet (1.85 cubic yards) before waste, or 28 bags of 2 cubic feet each with a 10% waste allowance.' },
        { question: 'How deep should I spread mulch?', answer: 'Virginia Cooperative Extension recommends generally 2 to 4 inches, and never building mulch up past 4 inches. Use 2–3 inches around trees and shrubs, and 1–2 inches for fine or double-shredded mulch.' },
        { question: 'How many bags of mulch do I need?', answer: 'Divide the total cubic feet (with waste) by the bag’s cubic feet. At the standard 2 cubic foot bag size, a 200 sq ft bed at 3 inches deep with 10% waste needs 28 bags.' },
        { question: 'Is bagged or bulk mulch cheaper?', answer: 'It depends on bed size. Bagged mulch is convenient for small beds, but bulk mulch delivered by the cubic yard is usually cheaper per cubic foot for larger jobs — compare this calculator’s cubic-yard row against a local yard’s bulk price.' },
        { question: 'Should mulch touch the tree trunk?', answer: 'No. Virginia Cooperative Extension specifically warns against piling mulch against a trunk ("mulch volcanoes"), which keeps bark moist and invites insects and disease — keep mulch 3–4 inches back from the trunk.' },
        { question: 'Does mulch depth really change how much I need?', answer: 'Yes, directly. The same 200 sq ft bed needs 66.67 cubic feet at a 4-inch depth versus 50.00 cubic feet at 3 inches — about 33.3% more mulch for that extra inch.' },
        { question: 'How much does a cubic yard of mulch cover?', answer: 'Per Mulch Pros Landscape Supply’s own published figures, about 162 square feet at a 2-inch depth, or 108 square feet at 3 inches — both match this calculator’s area ÷ depth ÷ 27 formula exactly.' }
      ]
    },
    compute(values) {
      const areaSqFt = values.areaLength * values.areaWidth;
      const depthFt = values.depthInches / 12;
      const cubicFeetExact = areaSqFt * depthFt;
      const cubicYardsExact = cubicFeetExact / 27;
      const cubicFeetWithWaste = cubicFeetExact * (1 + values.wastePercent / 100);
      const cubicYardsWithWaste = cubicFeetWithWaste / 27;
      const bagsToBuy = Math.ceil(cubicFeetWithWaste / values.bagSizeCuFt);
      return { areaSqFt, cubicFeetExact, cubicYardsExact, cubicFeetWithWaste, cubicYardsWithWaste, bagsToBuy };
    }
  },
  {
    id: 'topsoil-calculator',
    category: 'home',
    glyph: 'soil',
    updatedAt: '2026-11-04',
    aliases: ['how much topsoil do i need', 'topsoil cubic yards calculator', 'topsoil tons calculator', 'garden bed topsoil calculator', 'fill dirt calculator'],
    related: ['mulch-calculator', 'gravel-calculator', 'sand-calculator', 'concrete-calculator'],
    title: 'Topsoil Calculator',
    description: 'Find the volume (cubic feet and cubic yards) and weight (tons) of topsoil a garden bed, lawn patch or fill area needs from its area and depth, with an editable density and a waste allowance.',
    example: 'A 20x10 ft bed filled 4 inches deep in topsoil at 1.0 tons per cubic yard needs 2.47 cubic yards (2.47 tons), or 2.72 cubic yards (2.72 tons) with a 10% waste allowance.',
    breakdown: {
      headline: 'tonsWithWaste',
      headlineLabel: 'Tons to buy',
      outputs: [
        { id: 'tonsWithWaste', label: 'Tons to buy', format: 'number' },
        { id: 'tonsExact', label: 'Tons needed, exact', format: 'number' },
        { id: 'cubicYardsWithWaste', label: 'Cubic yards to buy', format: 'number' },
        { id: 'cubicYards', label: 'Cubic yards, exact', format: 'number' },
        { id: 'cubicFeet', label: 'Cubic feet, exact', format: 'number' }
      ],
      groups: [
        { title: 'Area & depth', inputs: ['areaLength', 'areaWidth', 'depthInches'] },
        { title: 'Density & waste', inputs: ['densityTonsPerCubicYard', 'wastePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'tonsExact', label: 'Exact tons' },
          { from: 'tonsWithWaste', label: 'Tons to buy' }
        ],
        title: 'Topsoil needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-11-04',
      concept: {
        title: 'How much topsoil a bed or lawn patch needs',
        paragraphs: [
          'Topsoil is delivered by weight (tons) but spread by volume, so the calculation follows the same two steps as this site’s gravel and sand calculators: area times depth gives the volume, and volume times density converts that to a weight. A 20 ft by 10 ft bed filled 4 inches deep comes to 200 square feet times 0.333 feet, or 66.67 cubic feet — 2.47 cubic yards before any waste allowance.',
          'Topsoil is lighter than gravel or sand for the same volume, because it is mostly broken-down organic and mineral particles rather than dense stone. EarthStone Rock, a real landscape-material supplier, puts a cubic yard of topsoil at "about 2,000 lb" dry — roughly 1.0 ton — and notes directly that "material that has absorbed rain weighs noticeably more per cubic yard than the same material dry," the same moisture effect that changes gravel and sand deliveries. This calculator defaults to 1.0 tons per cubic yard but leaves the density editable for your own supplier’s figure.',
          'Because topsoil is loose and settles once spread, watered and walked on, ordering only the exact volume calculated often leaves a bed visibly lower than its neighbors within a season — which is why a waste allowance belongs in the order, not just in the math.'
        ]
      },
      howTo: {
        intro: 'Enter the area and depth, then your topsoil’s density and a waste allowance.',
        steps: [
          { name: 'Enter the area', text: 'Type the length and width of the bed, lawn patch or fill area in feet.' },
          { name: 'Enter the depth', text: 'Use the thickness in inches you plan to add — commonly 2 to 4 inches for topping a lawn, more for a new bed or raised area.' },
          { name: 'Set the density', text: 'Keep 1.0 tons per cubic yard for a typical dry topsoil, per EarthStone Rock’s own figures, or use your supplier’s quoted number — wetter soil weighs more.' },
          { name: 'Set the waste allowance', text: 'Keep 10% for settling once the soil is spread, watered and walked on, or raise it for a larger or less even job.' },
          { name: 'Read the result', text: 'The headline is the tons to buy; the rows below show the exact cubic feet, cubic yards and tons before waste.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Area times depth gives the volume; volume times density gives the weight, and a waste factor sets what you actually buy.',
        expression: 'cu ft = L × W × (depth ÷ 12)\ncu yd = cu ft ÷ 27\ntons = cu yd × density\nbuy = cu yd × (1 + waste%) × density',
        terms: [
          { symbol: 'L, W', meaning: 'Area length and width, in feet.' },
          { symbol: 'depth', meaning: 'Depth of topsoil, in inches — divide by 12 to get feet.' },
          { symbol: 'density', meaning: 'Tons per cubic yard for your topsoil; about 1.0 ton per cubic yard dry, per EarthStone Rock’s published figures, more when wet.' },
          { symbol: 'waste%', meaning: 'Extra percent for settling once the soil is spread, watered and walked on; 10% is a common starting point.' }
        ],
        note: 'An estimate. Topsoil suppliers sell by the ton or the cubic yard and often round a delivery up to a standard load size — confirm minimums before ordering.'
      },
      workedExample: {
        intro: 'You are filling a 20 ft by 10 ft bed 4 inches deep, using topsoil at 1.0 tons per cubic yard with a 10% waste allowance.',
        rows: [
          { label: 'Area (20 × 10)', value: '200.00 sq ft' },
          { label: 'Depth in feet (4 ÷ 12)', value: '0.3333 ft' },
          { label: 'Cubic feet (200.00 × 0.3333)', value: '66.67 ft³' },
          { label: 'Cubic yards (66.67 ÷ 27)', value: '2.47 yd³' },
          { label: 'Tons, exact (2.47 × 1.0)', value: '2.47 tons' },
          { label: 'Cubic yards with 10% waste (2.47 × 1.10)', value: '2.72 yd³' },
          { label: 'Tons to buy (2.72 × 1.0)', value: '2.72 tons' }
        ],
        result: '2.72 tons to order (2.47 tons exact)',
        explanation: 'The same volume at a wetter 1.3 tons per cubic yard — near the upper end of the moisture-driven range EarthStone Rock describes — would weigh 3.53 tons instead of 2.72, about 30.0% more, purely from the moisture content, not from needing any more soil.'
      },
      watchOut: [
        { title: 'Moisture changes the weight, not the volume', body: 'EarthStone Rock notes wet soil weighs noticeably more per cubic yard than dry soil of the same volume — a supplier’s dry-weight quote can understate the tons a rain-soaked delivery actually weighs.' },
        { title: 'Topsoil settles after spreading', body: 'Loose soil compacts once watered and walked on, so a bed filled to the exact calculated volume often sits lower than expected within a season — the 10% default covers typical settling.' },
        { title: 'Depth drives weight directly', body: 'Volume scales linearly with depth for a fixed area, so doubling the depth doubles the tons needed for the same footprint.' },
        { title: 'Topsoil quality varies by supplier', body: 'Screened, weed-free topsoil costs more than unscreened fill dirt — confirm what grade your supplier is quoting, since this calculator only estimates quantity, not quality.' },
        { title: 'Suppliers often have delivery minimums', body: 'Many landscape yards price and haul topsoil with a minimum load size — a small job may cost close to the same as a somewhat larger one once delivery is included.' }
      ],
      references: [
        { label: 'EarthStone Rock, Cubic Yards vs. Tons for Landscape Rock (topsoil weight per cubic yard, moisture note)', url: 'https://earthstonerock.com/blogs/landscaping-guides/cubic-yards-vs-tons' },
        { label: 'Virginia Cooperative Extension, SPES-725P, "Soil Sampling for Residential Areas" (Hunnings, Donohue & Heckendorn, 2025)', url: 'https://www.pubs.ext.vt.edu/452/452-129/452-129.html' }
      ]
    },
    inputs: [
      { id: 'areaLength', label: 'Area length (ft)', type: 'number', placeholder: '20', defaultValue: 20, step: 0.5, min: 0.5 },
      { id: 'areaWidth', label: 'Area width (ft)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.5, min: 0.5 },
      { id: 'depthInches', label: 'Depth (inches)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0.5 },
      { id: 'densityTonsPerCubicYard', label: 'Density (tons per cubic yard, typical dry = 1.0)', type: 'number', placeholder: '1', defaultValue: 1, step: 0.05, min: 0.5 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 }
    ],
    seo: {
      title: 'Topsoil Calculator – Cubic Yards and Tons Needed',
      description: 'Free topsoil calculator: cubic feet, cubic yards and tons of topsoil needed from area and depth, with an editable density and a waste factor.',
      faq: [
        { question: 'How much topsoil do I need?', answer: 'Multiply the area by the depth to get volume, convert to cubic yards, then multiply by density. A 20×10 ft bed, 4 inches deep, at 1.0 tons/yd³ needs 2.47 cubic yards, 2.47 tons, before waste.' },
        { question: 'How many tons of topsoil are in a cubic yard?', answer: 'EarthStone Rock, a landscape-material supplier, puts dry topsoil at about 2,000 lb — roughly 1.0 ton — per cubic yard, which is this calculator’s default. Wetter soil weighs more for the same volume.' },
        { question: 'Does wet topsoil weigh more than dry topsoil?', answer: 'Yes. EarthStone Rock notes that material which has absorbed rain weighs noticeably more per cubic yard than the same material dry — a density near 1.3 tons/yd³ for wetter soil would weigh about 30% more than the 1.0 default for the identical volume.' },
        { question: 'Should I order extra topsoil for settling?', answer: 'Yes, a 10% allowance is a common starting point — loose soil compacts once it is spread, watered and walked on, so the exact calculated volume often falls short within a season.' },
        { question: 'How deep should I add topsoil to a lawn or bed?', answer: 'It depends on the goal: topping an existing lawn is commonly 2 to 4 inches, while filling a new raised bed can be much deeper — enter whatever depth your project calls for.' },
        { question: 'Is topsoil the same as fill dirt?', answer: 'No. Fill dirt is typically subsoil used to raise grade and does not support plant growth well; topsoil is the nutrient-rich upper layer used for planting. This calculator estimates quantity for either, but quality and price differ.' },
        { question: 'How do I convert the depth from inches into the formula?', answer: 'Divide the inches by 12 to get feet before multiplying by the area — a 4-inch depth is 4 ÷ 12 = 0.3333 ft.' }
      ]
    },
    compute(values) {
      const areaSqFt = values.areaLength * values.areaWidth;
      const depthFt = values.depthInches / 12;
      const cubicFeet = areaSqFt * depthFt;
      const cubicYards = cubicFeet / 27;
      const tonsExact = cubicYards * values.densityTonsPerCubicYard;
      const cubicYardsWithWaste = cubicYards * (1 + values.wastePercent / 100);
      const tonsWithWaste = cubicYardsWithWaste * values.densityTonsPerCubicYard;
      return { cubicFeet, cubicYards, tonsExact, cubicYardsWithWaste, tonsWithWaste };
    }
  },
  {
    id: 'retaining-wall-calculator',
    category: 'home',
    glyph: 'wall',
    updatedAt: '2026-11-04',
    aliases: ['retaining wall block calculator', 'how many blocks for a retaining wall', 'retaining wall calculator', 'landscape block wall calculator', 'retaining wall base gravel calculator'],
    related: ['gravel-calculator', 'brick-calculator', 'paver-calculator', 'concrete-calculator'],
    title: 'Retaining Wall Calculator',
    description: 'Find how many retaining wall blocks a wall needs from its length and height and the block size, plus the compacted base gravel trench it sits on, using a manufacturer’s own installation formula.',
    example: 'A 20 ft long, 3 ft tall wall built with 18x8 in blocks needs 60 blocks exactly, 63 with a 5% waste allowance, over a 9 in deep, 24 in wide base trench — 1.11 cubic yards of base gravel.',
    breakdown: {
      headline: 'blocksToBuy',
      headlineLabel: 'Blocks to buy',
      outputs: [
        { id: 'blocksToBuy', label: 'Blocks to buy', format: 'integer' },
        { id: 'blocksExact', label: 'Blocks needed, exact', format: 'number' },
        { id: 'coursesNeeded', label: 'Courses (rows) needed', format: 'integer' },
        { id: 'wallAreaSqFt', label: 'Wall face area', format: 'number', dimension: 'area', unit: 'ft2' },
        { id: 'baseGravelVolumeCuYd', label: 'Base gravel needed (cu yd)', format: 'number' }
      ],
      groups: [
        { title: 'Wall length & height', inputs: ['wallLength', 'wallHeight'] },
        { title: 'Block size & waste', inputs: ['blockWidthIn', 'blockHeightIn', 'wastePercent'] },
        { title: 'Base trench width', inputs: ['trenchWidthIn'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'blocksExact', label: 'Exact blocks' },
          { from: 'blocksToBuy', label: 'Blocks to buy' }
        ],
        title: 'Blocks needed, exact vs. to buy'
      }
    },
    content: {
      lastReviewed: '2026-11-04',
      concept: {
        title: 'How many blocks a retaining wall needs, and what it sits on',
        paragraphs: [
          'A segmental retaining wall block covers a fixed rectangle of wall face, so the block count comes from dividing the wall’s face area by that rectangle, the same way the brick calculator on this site works a brick wall. A common block size — Allan Block’s Classic unit, as listed by building-materials retailer SiteOne — is 18 in long by 8 in exposed per course, which happens to be exactly 144 square inches, or 1 square foot, of wall face per block. A 20 ft long, 3 ft tall wall (60 sq ft of face) built from that block size therefore needs exactly 60 blocks before any waste allowance — a convenient round number from a real product size, not a coincidence this calculator relies on for other block sizes.',
          'A retaining wall is not just stacked blocks — the first course sits buried in a compacted gravel trench below grade, which is what actually keeps the wall from shifting or heaving. Allan Block’s own installation guide states the base trench depth as "6 in. (150 mm) plus an additional 1 in. (25 mm) for each 1 ft. (300 mm) of wall height," with a standard trench 24 in. wide and a minimum of 6 in. of compacted wall rock. A 3 ft tall wall therefore needs a 9 in deep trench (6 + 1×3); a 6 ft wall would need 12 in.',
          'That trench is filled with the same crushed-stone base material this site’s gravel calculator prices by the cubic yard, so this page computes the trench’s volume directly from the wall’s length, the standard 24 in trench width, and the height-dependent depth — ready to cross-check against a gravel delivery.'
        ]
      },
      howTo: {
        intro: 'Enter the wall’s length and height, then the block size and a waste allowance.',
        steps: [
          { name: 'Enter the wall length and height', text: 'Measure the finished wall face in feet — length along the wall, height from the base trench to the top course.' },
          { name: 'Enter the block size', text: 'Type the block’s face width and exposed height in inches, as printed on the product — 18 by 8 in is a common segmental block size.' },
          { name: 'Set the waste allowance', text: 'Keep 5% for corner cuts, breakage and a non-exact course count, or raise it for a wall with many corners or curves.' },
          { name: 'Set the base trench width', text: 'Keep Allan Block’s standard 24 in trench width, or narrow it to 18 in for a short wall under 4 ft, per the same guide.' },
          { name: 'Read the result', text: 'The headline is the blocks to buy; the rows below show the exact block count, the courses needed, the wall area and the base gravel volume.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Wall area divided by one block’s face gives the block count; the manufacturer’s own height-based formula gives the base trench depth and, with it, the base gravel volume.',
        expression: 'blocks = ⌈ ((L × H) ÷ (Wb × Hb)) × (1 + waste%) ⌉\ntrench depth (in) = 6 + 1 × H\nbase gravel (cu yd) = L × (trench width ÷ 12) × (trench depth ÷ 12) ÷ 27',
        terms: [
          { symbol: 'L, H', meaning: 'Wall length and height, in feet.' },
          { symbol: 'Wb, Hb', meaning: 'Block face width and exposed height, in inches.' },
          { symbol: 'waste%', meaning: 'Extra percent for corner cuts and breakage; 5% is a common starting point.' },
          { symbol: 'trench depth', meaning: 'Base trench depth in inches, per Allan Block’s own installation guide: 6 in. plus 1 in. for each foot of wall height.' }
        ],
        note: 'An estimate, and only for a straight, level wall. Allan Block’s own guide uses a shallower 4 in. base for short walls under 4 ft; taller walls, walls on a slope, or walls holding back more than a couple of feet of soil need an engineered design, not this calculator.'
      },
      workedExample: {
        intro: 'You are building a 20 ft long, 3 ft tall wall from 18 by 8 in blocks, with a 5% waste allowance and the standard 24 in base trench.',
        rows: [
          { label: 'Wall area (20 × 3)', value: '60.00 sq ft' },
          { label: 'Blocks per course (20 ft × 12 ÷ 18 in)', value: '13.33' },
          { label: 'Courses (3 ft × 12 ÷ 8 in)', value: '4.50' },
          { label: 'Blocks, exact (13.33 × 4.50)', value: '60.00' },
          { label: 'Courses needed, rounded up', value: '5' },
          { label: 'Blocks to buy (60.00 × 1.05, rounded up)', value: '63' },
          { label: 'Base trench depth (6 + 1 × 3)', value: '9 in' },
          { label: 'Base gravel (20 × (24÷12) × (9÷12) ÷ 27)', value: '1.111 cu yd' }
        ],
        result: '63 blocks, 1.11 cubic yards of base gravel',
        explanation: 'A taller 4 ft version of the same 30 ft wall needs a 10 in trench instead of 9 (6 + 1×4) and 120.00 blocks exact instead of 60.00 — exactly double, since both the wall’s length and its height-driven course count grew.'
      },
      watchOut: [
        { title: 'This is a straight-wall estimate, not an engineered design', body: 'Taller walls, walls holding back significant soil or slope, or walls with curves and corners need site-specific engineering — consult a professional for anything beyond a low garden wall.' },
        { title: 'Short walls use a shallower base per Allan Block’s own guide', body: 'Walls under 4 ft can use an 18 in wide, 4 in deep trench plus the buried-block allowance, rather than the 24 in / height-based formula this calculator applies to the general case.' },
        { title: 'Block face size varies by product', body: '18 by 8 in is one common segmental block size, but products vary — always use your own block’s printed face dimensions.' },
        { title: 'Base rock must be compacted, not just placed', body: 'Allan Block’s guide calls for a minimum of two passes with a plate compactor over the base rock; an uncompacted base settles unevenly and the wall above it will too.' },
        { title: 'Drainage matters as much as the base', body: 'A retaining wall also needs drainage behind it (gravel backfill and sometimes a drain pipe) to relieve water pressure — this calculator covers the blocks and base trench only.' }
      ],
      references: [
        { label: 'Allan Block, "How to Install a Retaining Wall" — basic installation guide (base trench depth and width, compaction)', url: 'https://allanblock.com/installation/residential-installation/basic-installation' },
        { label: 'SiteOne Landscape Supply, Allan Block Classic Wall product listing (block face dimensions)', url: 'https://www.siteone.com/en/ab-classic-app-allan-block-classic-wall-appalachian-18-in-x-12-in-x-8-in-40-pcpallet/p/286366' }
      ]
    },
    inputs: [
      { id: 'wallLength', label: 'Wall length (ft)', type: 'number', placeholder: '20', defaultValue: 20, step: 0.5, min: 1 },
      { id: 'wallHeight', label: 'Wall height (ft)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0.5 },
      { id: 'blockWidthIn', label: 'Block face width (in, Allan Block Classic = 18)', type: 'number', placeholder: '18', defaultValue: 18, step: 0.5, min: 1 },
      { id: 'blockHeightIn', label: 'Block exposed height (in, Allan Block Classic = 8)', type: 'number', placeholder: '8', defaultValue: 8, step: 0.5, min: 1 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'trenchWidthIn', label: 'Base trench width (in, Allan Block standard = 24)', type: 'number', placeholder: '24', defaultValue: 24, step: 1, min: 12 }
    ],
    seo: {
      title: 'Retaining Wall Calculator – Blocks and Base Gravel',
      description: 'Free retaining wall calculator: blocks needed from wall length and height, plus the base gravel trench volume from Allan Block’s own installation formula.',
      faq: [
        { question: 'How many blocks do I need for a retaining wall?', answer: 'Divide the wall’s area (length × height) by one block’s face area, then add a waste allowance. A 20×3 ft wall built with 18×8 in blocks needs 60 blocks exactly, 63 with a 5% waste allowance.' },
        { question: 'How deep should the base trench be?', answer: 'Allan Block’s own installation guide gives the formula as 6 inches plus 1 inch for each foot of wall height. A 3 ft wall needs a 9 in deep trench; a 6 ft wall needs 12 in.' },
        { question: 'How wide should the base trench be?', answer: 'Allan Block’s standard trench is 24 inches wide for walls 4 ft and taller; walls under 4 ft can use an 18 in wide trench with a shallower, fixed 4 in depth plus buried-block allowance.' },
        { question: 'How much base gravel do I need?', answer: 'Multiply the wall length by the trench width and depth (all in feet), then divide by 27. The 20 ft, 9 in deep, 24 in wide example needs 1.11 cubic yards.' },
        { question: 'Can I build a tall retaining wall with this calculator?', answer: 'This calculator estimates blocks and base material for a low, straight garden wall. Taller walls, walls on a slope, or walls holding back significant soil need an engineered design — consult a professional.' },
        { question: 'Does the base rock need to be compacted?', answer: 'Yes. Allan Block’s guide calls for a minimum of two passes with a plate compactor over the base rock before the first course is set — an uncompacted base settles unevenly.' },
        { question: 'What block size does this calculator assume?', answer: '18 by 8 in by default, matching Allan Block’s Classic unit (per SiteOne’s product listing), but the width and height fields work for any rectangular block face — use your own product’s printed dimensions.' }
      ]
    },
    compute(values) {
      const wallLengthIn = values.wallLength * 12;
      const wallHeightIn = values.wallHeight * 12;
      const blocksPerCourse = wallLengthIn / values.blockWidthIn;
      const courseCountExact = wallHeightIn / values.blockHeightIn;
      const blocksExact = blocksPerCourse * courseCountExact;
      const coursesNeeded = Math.ceil(courseCountExact);
      const blocksToBuy = Math.ceil(blocksExact * (1 + values.wastePercent / 100));
      const wallAreaSqFt = values.wallLength * values.wallHeight;
      const baseTrenchDepthIn = 6 + 1 * values.wallHeight;
      const baseGravelVolumeCuYd = (values.wallLength * (values.trenchWidthIn / 12) * (baseTrenchDepthIn / 12)) / 27;
      return { blocksExact, coursesNeeded, blocksToBuy, wallAreaSqFt, baseTrenchDepthIn, baseGravelVolumeCuYd };
    }
  },
  {
    id: 'board-foot-calculator',
    category: 'home',
    glyph: 'bft',
    updatedAt: '2026-11-04',
    aliases: ['board foot calculator', 'how to calculate board feet', 'lumber board feet calculator', 'board footage calculator', 'bf calculator wood'],
    related: ['decking-calculator', 'fence-calculator', 'drywall-calculator', 'paver-calculator'],
    title: 'Board Foot Calculator',
    description: 'Find how many board feet a piece or stack of lumber contains from its nominal thickness, width and length, plus an estimated cost — the standard unit lumber is bought and sold by.',
    example: '10 boards at 1 in thick, 6 in wide and 8 ft long (4/4 nominal stock) total 40.00 board feet — $200.00 at $5.00 per board foot.',
    breakdown: {
      headline: 'totalBoardFeet',
      headlineLabel: 'Total board feet',
      outputs: [
        { id: 'totalBoardFeet', label: 'Total board feet', format: 'number' },
        { id: 'boardFeetPerBoard', label: 'Board feet per board', format: 'number' },
        { id: 'estimatedCost', label: 'Estimated cost', format: 'currency' }
      ],
      groups: [
        { title: 'Board size', inputs: ['thicknessIn', 'widthIn', 'lengthFt'] },
        { title: 'Quantity & price', inputs: ['quantity', 'pricePerBoardFoot'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'boardFeetPerBoard', label: 'Per board' },
          { from: 'totalBoardFeet', label: 'Total order' }
        ],
        title: 'Board feet, one board vs. the whole order'
      }
    },
    content: {
      lastReviewed: '2026-11-04',
      concept: {
        title: 'What a board foot is, and the trap in measuring one',
        paragraphs: [
          'A board foot is a volume: one board foot is 144 cubic inches of wood, the same volume as a board 1 inch thick, 12 inches wide and 12 inches long. Lumber yards sell by this unit because it prices wood fairly regardless of whether it is cut as one wide, short board or several narrow, long ones — a stack of ten boards each 1 in thick, 6 in wide and 8 ft long totals 40.00 board feet (1 × 6 × 8 ÷ 12 × 10), whatever price per board foot the species commands.',
          'The trap is that lumber is bought and sold by its nominal, not actual, size. The U.S. Forest Service’s Forest Products Laboratory states it plainly in its Wood Handbook: "Lumber length is recorded in actual dimensions, whereas width and thickness are traditionally recorded in \'nominal\' dimensions — actual dimensions are somewhat less." A board sold as "4/4" (one inch) hardwood is measured as a full 1 in thick for pricing even after it is surfaced down to roughly 13/16 in; a nominal 2×6, likewise, prices as a full 2 in by 6 in even though the actual surfaced board measures only 1-1/2 by 5-1/2 in, per the Wood Handbook’s own standard-size table.',
          'That difference is not small. The same nominal 2×6, 8 ft long board prices out at 8.00 board feet using its nominal 2×6 size, but only 5.50 board feet if someone mistakenly measures the actual dressed dimensions instead — a 31.25% undercount for the identical physical board. Always key in the size printed on the price tag or the stamp on the end of the board, not a tape measure reading of the surfaced wood.'
        ]
      },
      howTo: {
        intro: 'Enter one board’s nominal thickness, width and length, then the quantity and a price per board foot.',
        steps: [
          { name: 'Enter the thickness', text: 'Use the nominal thickness in inches, as sold — 1 in (called "4/4", or "four-quarter") is common for hardwood boards; 2 in for construction dimension lumber.' },
          { name: 'Enter the width', text: 'Use the nominal width in inches, as printed on the price tag or stamped on the board — not the actual, slightly narrower dressed width.' },
          { name: 'Enter the length', text: 'Length is recorded in actual feet, unlike thickness and width — measure the board’s real length.' },
          { name: 'Enter the quantity and price', text: 'Set how many identical boards you are buying, and your supplier’s price per board foot.' },
          { name: 'Read the result', text: 'The headline is the total board feet for the whole order; the rows below show the board feet for one piece and the estimated cost.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Thickness times width times length, divided by 12, gives one board’s board feet; multiply by quantity for the order, and by price for an estimated cost.',
        expression: 'bf (one board) = (T × W × L) ÷ 12\nbf (order) = bf (one board) × quantity\ncost = bf (order) × price per bf',
        terms: [
          { symbol: 'T', meaning: 'Nominal thickness, in inches.' },
          { symbol: 'W', meaning: 'Nominal width, in inches.' },
          { symbol: 'L', meaning: 'Actual length, in feet — length, unlike thickness and width, is not nominal.' },
          { symbol: 'quantity', meaning: 'Number of identical boards.' },
          { symbol: 'price per bf', meaning: 'Your supplier’s price per board foot; varies enormously by species and market, so there is no default beyond a placeholder.' }
        ],
        note: 'An estimate. Lumber graded with defects, waney edges or non-rectangular cross-sections is measured by a grading association’s own rules (e.g. the National Hardwood Lumber Association’s), which this simple rectangular formula approximates but does not replace for grading purposes.'
      },
      workedExample: {
        intro: 'You are buying 10 boards, each nominal 1 in thick, 6 in wide and 8 ft long, at $5.00 per board foot.',
        rows: [
          { label: 'Board feet, one board (1 × 6 × 8 ÷ 12)', value: '4.00 bf' },
          { label: 'Total board feet (4.00 × 10)', value: '40.00 bf' },
          { label: 'Estimated cost (40.00 × $5.00)', value: '$200.00' }
        ],
        result: '40.00 board feet, about $200.00',
        explanation: 'If the same 10 boards were nominal 2×6 instead of 1×6, the order would be 80.00 board feet (2 × 6 × 8 ÷ 12 × 10) — exactly double, since board feet scale directly with thickness. Measuring that 2×6 by its actual 1-1/2 by 5-1/2 in dressed size instead of its nominal 2×6 size would undercount it at 55.00 board feet, 31.25% low, per the Wood Handbook’s own standard dressed-size table.'
      },
      watchOut: [
        { title: 'Always use nominal size, not a tape measure on the actual board', body: 'A nominal 2×6 dresses down to an actual 1-1/2 by 5-1/2 in — measuring the real board instead of using its nominal size undercounts the board feet by over 30%, per the Wood Handbook.' },
        { title: 'Length is the exception', body: 'Unlike thickness and width, lumber length is recorded as the actual length, not a nominal one — measure the board’s real length.' },
        { title: 'Price per board foot varies enormously by species', body: 'Construction-grade softwood can run a few dollars per board foot while figured hardwoods can run well into double digits — always use your own supplier’s quoted price.' },
        { title: 'This is a rectangular estimate, not a grading-rule measurement', body: 'Hardwood graded for furniture-grade cuttings follows the National Hardwood Lumber Association’s own surface-measure rules, which can differ from a simple thickness × width × length calculation for an irregular or waney board.' },
        { title: 'Rough (ungraded) lumber may be priced differently', body: 'Rough-sawn lumber straight from a sawmill is sometimes priced by actual (not nominal) thickness — confirm which convention your specific supplier uses before ordering.' }
      ],
      references: [
        { label: 'USDA Forest Service, Forest Products Laboratory, Wood Handbook: Wood as an Engineering Material (Centennial Edition, General Technical Report FPL-GTR-190), Chapter 6 (Kretschmann) — nominal vs. actual lumber dimensions, Table 6-6 standard sizes', url: 'https://research.fs.usda.gov/download/treesearch/37426.pdf' }
      ]
    },
    inputs: [
      { id: 'thicknessIn', label: 'Nominal thickness (in, 1 in = 4/4 hardwood)', type: 'number', placeholder: '1', defaultValue: 1, step: 0.25, min: 0.25 },
      { id: 'widthIn', label: 'Nominal width (in)', type: 'number', placeholder: '6', defaultValue: 6, step: 0.5, min: 1 },
      { id: 'lengthFt', label: 'Length (ft, actual)', type: 'number', placeholder: '8', defaultValue: 8, step: 0.5, min: 1 },
      { id: 'quantity', label: 'Number of boards', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 },
      { id: 'pricePerBoardFoot', label: 'Price per board foot (placeholder — enter your own)', type: 'currency', placeholder: '5.00', defaultValue: 5, step: 0.25, min: 0 }
    ],
    seo: {
      title: 'Board Foot Calculator – Lumber Volume and Cost',
      description: 'Free board foot calculator: total board feet and cost for lumber from nominal thickness, width and length, with the nominal-vs-actual sizing trap explained.',
      faq: [
        { question: 'How do I calculate board feet?', answer: 'Multiply the nominal thickness by the nominal width (both in inches) by the length (in feet), then divide by 12. One board 1 in thick, 6 in wide, 8 ft long is 4.00 board feet.' },
        { question: 'What is a board foot?', answer: 'A board foot is a volume of wood: 144 cubic inches, the same as a board 1 inch thick, 12 inches wide and 12 inches long. It is the standard unit lumber is bought and sold by.' },
        { question: 'Should I use the nominal or actual size of a board?', answer: 'Nominal. The Wood Handbook states that lumber width and thickness are traditionally recorded in nominal dimensions, with the actual dressed size somewhat less — a nominal 2×6 is priced and measured as 2 by 6 in even though it dresses down to an actual 1-1/2 by 5-1/2 in.' },
        { question: 'How much does measuring actual instead of nominal size undercount a board?', answer: 'For a nominal 2×6, 8 ft board, using the actual 1-1/2 by 5-1/2 in dressed size instead of the nominal 2×6 size gives 55.00 board feet instead of the correct 80.00 — about 31.25% low.' },
        { question: 'Is length also measured as nominal?', answer: 'No. Lumber length is recorded as the actual length; only width and thickness follow the nominal convention.' },
        { question: 'How many board feet are in a 1×8, 10 ft board?', answer: 'Using the formula (1 × 8 × 10) ÷ 12, that board is 6.67 board feet.' },
        { question: 'Does this calculator work for hardwood and softwood lumber?', answer: 'Yes, for a simple rectangular estimate of either. Hardwood graded for furniture cuttings follows the National Hardwood Lumber Association’s own surface-measure rules for irregular boards, which this formula approximates but does not replace.' }
      ]
    },
    compute(values) {
      const boardFeetPerBoard = (values.thicknessIn * values.widthIn * values.lengthFt) / 12;
      const totalBoardFeet = boardFeetPerBoard * values.quantity;
      const estimatedCost = totalBoardFeet * values.pricePerBoardFoot;
      return { boardFeetPerBoard, totalBoardFeet, estimatedCost };
    }
  },
  {
    id: 'ac-tonnage-btu-calculator',
    category: 'home',
    glyph: 'btu',
    updatedAt: '2026-11-04',
    aliases: ['what size air conditioner do i need', 'ac btu calculator', 'air conditioner tonnage calculator', 'ac size calculator by square footage', 'room air conditioner btu calculator'],
    related: ['electricity-bill-calculator', 'paint-calculator', 'furniture-fit-calculator'],
    title: 'AC Tonnage / BTU Calculator',
    description: 'Find what size room air conditioner a space needs, in BTU per hour and tons, from its square footage, using ENERGY STAR’s own official sizing chart and adjustment rules.',
    example: 'A 525 sq ft room, with average sun, no kitchen use and no extra occupants, needs 14,000 BTU/hr (1.17 tons) per ENERGY STAR’s own worked example.',
    breakdown: {
      headline: 'totalBtu',
      headlineLabel: 'Cooling capacity needed (BTU/hr)',
      outputs: [
        { id: 'totalBtu', label: 'Cooling capacity needed (BTU/hr)', format: 'integer' },
        { id: 'tons', label: 'Equivalent in tons (12,000 BTU/hr = 1 ton)', format: 'number' },
        { id: 'baseBtu', label: 'Base capacity from room size, before adjustments', format: 'integer' },
        { id: 'roomAreaSqFt', label: 'Room area', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Room size', inputs: ['roomAreaSqFt'] },
        { title: 'Sun exposure, kitchen & occupants', inputs: ['roomCondition', 'isKitchen', 'occupantsOver2'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'baseBtu', label: 'Base (room size only)' },
          { from: 'totalBtu', label: 'Adjusted total' }
        ],
        title: 'BTU/hr, before vs. after adjustments'
      }
    },
    content: {
      lastReviewed: '2026-11-04',
      concept: {
        title: 'What size air conditioner a room really needs',
        paragraphs: [
          'The U.S. EPA and Department of Energy’s ENERGY STAR program publishes an official sizing chart for room (window and portable) air conditioners, keyed directly to square footage: 100–150 sq ft calls for 5,000 Btu/hr, climbing in steps up to 18,000 Btu/hr for 700–1,000 sq ft. ENERGY STAR’s own fact sheet gives a worked example matching this chart directly: "if the room measures 525 square feet, look for an ENERGY STAR qualified room air conditioner with a capacity of 14,000 Btu/hr." This calculator uses that same published table rather than a smooth formula, because the chart — not a theoretical rule — is what the sizing guidance people actually use is built on.',
          'Room size is the starting point, but ENERGY STAR lists four "Special Considerations" that adjust it: reduce the base capacity by 10% for a heavily shaded room, increase it by 10% for a very sunny one, add a flat 4,000 Btu/hr if the unit will be used in a kitchen, and add 600 Btu/hr for each occupant beyond two who regularly use the room. All four apply on top of the base figure from the table, not on top of each other.',
          'An oversized unit is not simply "extra cooling for free." ENERGY STAR’s own guidance warns that a unit bigger than the room needs "will cool a room quickly, but some of the humidity will stick around, leaving the room feeling cold and clammy" — because a too-large unit cycles off before it runs long enough to pull real moisture out of the air, and it wastes energy doing it. Sizing to the chart, not above it, is the point.'
        ]
      },
      howTo: {
        intro: 'Enter the room’s square footage, then its sun exposure, whether it is a kitchen, and any occupants beyond two.',
        steps: [
          { name: 'Enter the room area', text: 'Type the room’s floor area in square feet — length times width for a rectangular room.' },
          { name: 'Set the sun exposure', text: 'Choose average, heavily shaded (−10%), or very sunny (+10%), per ENERGY STAR’s own adjustment.' },
          { name: 'Flag kitchen use', text: 'Choose yes if the unit will cool a kitchen — ENERGY STAR adds a flat 4,000 Btu/hr for the extra heat load.' },
          { name: 'Enter extra occupants', text: 'Count only the people beyond two who regularly use the room; each adds 600 Btu/hr.' },
          { name: 'Read the result', text: 'The headline is the BTU/hr capacity to look for; the rows below show the equivalent in tons and the unadjusted base figure from the chart.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored. This sizes a room (window or portable) air conditioner; a central system is sized by a contractor’s load calculation, not this chart.'
      },
      formula: {
        intro: 'Look up the base BTU/hr from ENERGY STAR’s own table by square footage, then apply its adjustments and convert to tons.',
        expression: 'base = ENERGY STAR table lookup (by sq ft)\nadjusted = base × (1 + sun%) + kitchen add + (extra occupants × 600)\ntons = adjusted ÷ 12,000',
        terms: [
          { symbol: 'base', meaning: 'BTU/hr from ENERGY STAR’s published area-to-capacity table.' },
          { symbol: 'sun%', meaning: '−10% heavily shaded, 0% average, +10% very sunny, per ENERGY STAR.' },
          { symbol: 'kitchen add', meaning: 'A flat 4,000 Btu/hr if the unit cools a kitchen.' },
          { symbol: 'extra occupants', meaning: 'People beyond two who regularly use the room, at 600 Btu/hr each.' },
          { symbol: 'ton', meaning: 'A standard HVAC unit of cooling capacity equal to 12,000 Btu/hr.' }
        ],
        note: 'An estimate for sizing a room air conditioner, not a substitute for a contractor’s Manual J load calculation, which accounts for insulation, window area and local climate in far more detail. Outside the chart’s 100–1,000 sq ft range, the result is clamped to the nearest end of the table and the room likely needs a central system or multiple units instead.'
      },
      workedExample: {
        intro: 'A 525 sq ft room, very sunny, used as a kitchen, with 2 occupants beyond the first two.',
        rows: [
          { label: 'Base BTU/hr (ENERGY STAR table, 500–700 sq ft)', value: '14,000 BTU/hr' },
          { label: 'Sun adjustment, +10% (14,000 × 1.10)', value: '15,400 BTU/hr' },
          { label: 'Kitchen adjustment', value: '+4,000 BTU/hr' },
          { label: 'Occupant adjustment (2 × 600)', value: '+1,200 BTU/hr' },
          { label: 'Total (15,400 + 4,000 + 1,200)', value: '20,600 BTU/hr' },
          { label: 'In tons (20,600 ÷ 12,000)', value: '1.72 tons' }
        ],
        result: '20,600 BTU/hr (about 1.72 tons)',
        explanation: 'The same 525 sq ft room with average sun, no kitchen use and no extra occupants — ENERGY STAR’s own plain worked example — needs only the unadjusted 14,000 BTU/hr (1.17 tons), 47.1% less capacity than the sunny, kitchen, extra-occupant version above.'
      },
      watchOut: [
        { title: 'Bigger is not better', body: 'ENERGY STAR’s own guidance warns an oversized unit cools quickly but leaves the room "cold and clammy" because it cycles off before removing enough humidity, and it wastes energy doing so.' },
        { title: 'This chart is for room units, not central air', body: 'Central (whole-house) air conditioning is sized by a contractor’s Manual J load calculation, which weighs insulation, windows, orientation and local climate — a much more detailed process than a square-footage table.' },
        { title: 'The adjustments apply to the base figure, not to each other', body: 'The sun percentage multiplies the table’s base BTU/hr; the kitchen and occupant additions are flat amounts added afterward, not compounded on top of the sun adjustment.' },
        { title: 'Outside 100–1,000 sq ft, this chart does not apply', body: 'ENERGY STAR’s published table stops at 1,000 sq ft for a single room unit — a larger open space needs a central system, a ducted mini-split, or more than one unit.' },
        { title: 'A kitchen adjustment assumes typical cooking heat', body: 'The flat 4,000 Btu/hr kitchen addition is ENERGY STAR’s own rule of thumb for an ordinary home kitchen, not a commercial kitchen with heavy equipment.' }
      ],
      references: [
        { label: 'U.S. EPA / DOE ENERGY STAR, "ENERGY STAR Qualified Room Air Conditioners" fact sheet (sizing chart and special considerations)', url: 'https://www.energystar.gov/ia/partners/manuf_res/marketing_res/ROOM_AIRCONDITIONER.pdf' }
      ]
    },
    inputs: [
      { id: 'roomAreaSqFt', label: 'Room area (sq ft)', type: 'number', placeholder: '525', defaultValue: 525, step: 5, min: 50 },
      {
        id: 'roomCondition',
        label: 'Sun exposure',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 10,
        min: -10,
        options: [
          { value: -10, label: 'Heavily shaded (−10%)' },
          { value: 0, label: 'Average' },
          { value: 10, label: 'Very sunny (+10%)' }
        ]
      },
      {
        id: 'isKitchen',
        label: 'Used as a kitchen?',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Yes (+4,000 BTU/hr)' }
        ]
      },
      { id: 'occupantsOver2', label: 'Occupants beyond 2 (+600 BTU/hr each)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    seo: {
      title: 'AC Tonnage / BTU Calculator – What Size AC Do I Need?',
      description: 'Free AC size calculator: BTU/hr and tons for a room air conditioner from square footage, using ENERGY STAR’s own official sizing chart and adjustments.',
      faq: [
        { question: 'What size air conditioner do I need?', answer: 'Look up your room’s square footage on ENERGY STAR’s official chart. A 525 sq ft room needs 14,000 BTU/hr (about 1.17 tons) with average sun exposure, per ENERGY STAR’s own worked example.' },
        { question: 'How many BTU per square foot does an AC need?', answer: 'It is not a flat rate — ENERGY STAR’s own chart runs in steps, from 5,000 BTU/hr for 100–150 sq ft up to 18,000 BTU/hr for 700–1,000 sq ft, not a constant BTU-per-square-foot multiplier.' },
        { question: 'How many BTU is a ton of air conditioning?', answer: '12,000 BTU/hr equals 1 ton of cooling capacity — a standard HVAC unit, most often used for central air conditioners.' },
        { question: 'Does a sunny room need a bigger air conditioner?', answer: 'Yes. ENERGY STAR’s guidance adds 10% capacity for a very sunny room and subtracts 10% for a heavily shaded one, applied to the base BTU/hr from the square-footage chart.' },
        { question: 'Why does a kitchen need a bigger air conditioner?', answer: 'Cooking adds heat to a room beyond what its square footage alone accounts for — ENERGY STAR’s guidance adds a flat 4,000 BTU/hr if the unit will cool a kitchen.' },
        { question: 'Is it bad to buy an air conditioner that is too big?', answer: 'Yes. ENERGY STAR explains that an oversized unit cools the air quickly but cycles off before removing enough humidity, leaving the room feeling "cold and clammy," and it wastes energy doing so.' },
        { question: 'Does this calculator work for central air conditioning?', answer: 'No. This chart is ENERGY STAR’s own sizing guide for room (window or portable) units. Central air conditioning needs a contractor’s Manual J load calculation, which accounts for insulation, windows and climate in much more detail.' }
      ]
    },
    compute(values) {
      const bands = [
        { min: 100, max: 150, btu: 5000 },
        { min: 150, max: 250, btu: 6000 },
        { min: 250, max: 300, btu: 7000 },
        { min: 300, max: 350, btu: 8000 },
        { min: 350, max: 400, btu: 9000 },
        { min: 400, max: 450, btu: 10000 },
        { min: 450, max: 500, btu: 12000 },
        { min: 500, max: 700, btu: 14000 },
        { min: 700, max: 1000, btu: 18000 }
      ];
      const clampedArea = Math.max(100, Math.min(1000, values.roomAreaSqFt));
      const band = bands.find((b) => clampedArea >= b.min && clampedArea < b.max) ?? bands[bands.length - 1];
      const baseBtu = band.btu;
      const shadeAdjustedBtu = baseBtu * (1 + values.roomCondition / 100);
      const kitchenAdd = values.isKitchen ? 4000 : 0;
      const occupantAdd = values.occupantsOver2 * 600;
      const totalBtu = shadeAdjustedBtu + kitchenAdd + occupantAdd;
      const tons = totalBtu / 12000;
      const roomAreaSqFt = values.roomAreaSqFt;
      return { baseBtu, totalBtu, tons, roomAreaSqFt };
    }
  },
  {
    id: 'insulation-calculator',
    category: 'home',
    glyph: 'ins',
    updatedAt: '2026-11-05',
    aliases: ['how much insulation do i need calculator', 'attic insulation calculator', 'insulation r value calculator', 'blown in insulation bags calculator', 'batt insulation calculator'],
    related: ['ac-tonnage-btu-calculator', 'electricity-bill-calculator', 'drywall-calculator', 'paint-calculator'],
    title: 'Insulation Calculator',
    description: 'Find the attic R-value ENERGY STAR recommends for your climate zone, and how many bags or rolls of insulation that area needs, with a waste allowance.',
    example: 'A 1,000 sq ft Zone 5 attic needs R-60 insulation per ENERGY STAR; at 40 sq ft of coverage per bag and a 10% waste allowance, that is 28 bags.',
    breakdown: {
      headline: 'bagsNeeded',
      headlineLabel: 'Bags or rolls to buy',
      outputs: [
        { id: 'bagsNeeded', label: 'Bags or rolls to buy', format: 'integer' },
        { id: 'targetRValue', label: 'Recommended R-value for your zone', format: 'integer' },
        { id: 'areaSqFt', label: 'Area to insulate', format: 'number', dimension: 'area', unit: 'ft2' },
        { id: 'coverageBought', label: 'Coverage bought', format: 'number', dimension: 'area', unit: 'ft2' }
      ],
      groups: [
        { title: 'Attic or area', inputs: ['areaSqFt', 'climateZone'] },
        { title: 'Insulation product', inputs: ['coveragePerBag', 'wastePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'areaSqFt', label: 'Area to insulate' },
          { from: 'coverageBought', label: 'Coverage bought' }
        ],
        title: 'Area to insulate vs. coverage bought'
      }
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'How much insulation an attic really needs',
        paragraphs: [
          'The U.S. EPA and Department of Energy’s ENERGY STAR program publishes a recommended insulation R-value for every U.S. climate zone, based on the 2021 International Energy Conservation Code. For an uninsulated attic, Zone 1 (the warmest, e.g. southern Florida) needs R-30; Zones 2 and 3 need R-49; and Zones 4A/4B, 4C/5/6 and 7/8 (most of the northern two-thirds of the country) all need R-60 — the coldest zones need the same top-tier R-value as the moderately cold ones because attic heat loss matters most where winters are long, not just where they are extreme.',
          'R-value measures resistance to heat flow, and it adds up: stacking more insulation on top of existing insulation raises the total R-value, which is why ENERGY STAR publishes a second, lower target for an attic that already has 3–4 inches in place. This calculator uses the uninsulated-attic target, since that is the figure most people adding insulation for the first time are working from.',
          'Once you know the target R-value, how many bags or rolls you need depends entirely on the product: a bag of blown-in insulation or a roll of batts states its coverage area at a given R-value right on the label, and that coverage shrinks as the R-value (and therefore the installed thickness) goes up. There is no single number that works across brands and R-values, so this calculator asks for your own product’s coverage figure rather than assuming one.'
        ]
      },
      howTo: {
        intro: 'Enter the area to insulate and your climate zone, then your insulation product’s coverage and a waste allowance.',
        steps: [
          { name: 'Enter the area', text: 'Type the attic or wall area in square feet.' },
          { name: 'Choose your climate zone', text: 'Pick the zone group that matches your location; this sets the ENERGY STAR-recommended R-value for an uninsulated attic.' },
          { name: 'Enter your product’s coverage', text: 'Check the bag or roll label for its coverage area in square feet at your target R-value — this varies by brand and by R-value.' },
          { name: 'Set a waste allowance', text: 'A 10% allowance covers uneven joists, obstructions and minor overlaps.' },
          { name: 'Read the result', text: 'The headline is the bags or rolls to buy; the rows below show the recommended R-value and the coverage bought.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Look up the target R-value from ENERGY STAR’s own climate-zone table, then divide the area (with waste) by your product’s coverage per bag.',
        expression: 'target R-value = ENERGY STAR climate-zone table\nbags needed = ⌈(area × (1 + waste%)) ÷ coverage per bag⌉',
        terms: [
          { symbol: 'target R-value', meaning: 'ENERGY STAR’s recommended R-value for an uninsulated attic in your climate zone.' },
          { symbol: 'area', meaning: 'The square footage you are insulating.' },
          { symbol: 'waste%', meaning: 'An allowance for uneven framing, obstructions and overlap; 10% is a reasonable default.' },
          { symbol: 'coverage per bag', meaning: 'Square feet one bag or roll covers at your target R-value, printed on the product label — this varies by brand and R-value, so there is no universal default.' }
        ],
        note: 'An estimate. Coverage per bag varies enormously by product and by R-value; always use the figure on your own insulation’s label, not a generic number.'
      },
      workedExample: {
        intro: 'A 1,000 sq ft attic in climate Zone 5, with insulation that covers 40 sq ft per bag at its R-60 setting, and a 10% waste allowance.',
        rows: [
          { label: 'Target R-value (Zone 4C/5/6, ENERGY STAR)', value: 'R-60' },
          { label: 'Area with waste (1,000 × 1.10)', value: '1,100 sq ft' },
          { label: 'Bags needed (1,100 ÷ 40)', value: '27.5 bags' },
          { label: 'Bags to buy, rounded up', value: '28 bags' },
          { label: 'Coverage bought (28 × 40)', value: '1,120 sq ft' }
        ],
        result: '28 bags, R-60',
        explanation: 'The same 1,000 sq ft attic in the warmer Zone 1 only needs R-30 — roughly half the installed thickness of R-60 — which typically means a bag covers noticeably more area at that lower R-value, so fewer bags are needed for the same floor space. Always re-check the coverage figure on the specific product and R-value you are buying rather than assuming it scales evenly.'
      },
      watchOut: [
        { title: 'Coverage per bag is specific to one product and one R-value', body: 'The same brand’s bag covers far less area at R-60 than at R-30, because reaching a higher R-value means installing it thicker — always read the coverage figure for the R-value you are actually installing.' },
        { title: 'Adding over existing insulation uses a lower target', body: 'ENERGY STAR publishes a separate, lower R-value target for an attic that already has 3–4 inches in place; this calculator uses the uninsulated-attic target.' },
        { title: 'Air seal first', body: 'ENERGY STAR recommends sealing attic air leaks (around recessed lights, plumbing stacks, attic hatches) before adding insulation — insulation slows heat flow, but it does not stop air leaks.' },
        { title: 'Don’t compress insulation to make it fit', body: 'Compressing batts or blown-in material into too little depth reduces its real R-value below what the package states.' },
        { title: 'This is a quantity estimate, not an energy audit', body: 'A full energy assessment accounts for walls, floors, ducts and air sealing together — this calculator covers one area’s insulation quantity only.' }
      ],
      references: [
        { label: 'U.S. EPA/DOE ENERGY STAR, "Recommended Home Insulation R-Values" — climate-zone R-value table', url: 'https://www.energystar.gov/saveathome/seal_insulate/identify-problems-you-want-fix/diy-checks-inspections/insulation-r-values' }
      ]
    },
    inputs: [
      { id: 'areaSqFt', label: 'Area to insulate (sq ft)', type: 'number', placeholder: '1000', defaultValue: 1000, step: 50, min: 50 },
      {
        id: 'climateZone',
        label: 'Climate zone (ENERGY STAR / 2021 IECC)',
        type: 'number',
        placeholder: '60',
        defaultValue: 60,
        step: 1,
        min: 30,
        options: [
          { value: 30, label: 'Zone 1 (R-30)' },
          { value: 49, label: 'Zone 2 or 3 (R-49)' },
          { value: 60, label: 'Zone 4A/4B, 4C/5/6 or 7/8 (R-60)' }
        ]
      },
      { id: 'coveragePerBag', label: 'Coverage per bag/roll at your target R-value (sq ft, check the label)', type: 'number', placeholder: '40', defaultValue: 40, step: 5, min: 5 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 }
    ],
    seo: {
      title: 'Insulation Calculator – Attic R-Value & Bags Needed',
      description: 'Free insulation calculator: find your climate zone’s ENERGY STAR-recommended attic R-value and how many bags or rolls of insulation your area needs.',
      faq: [
        { question: 'How much insulation do I need for my attic?', answer: 'It depends on your climate zone and product. ENERGY STAR recommends R-30 for Zone 1, R-49 for Zones 2–3, and R-60 for Zones 4A/4B, 4C/5/6 and 7/8 in an uninsulated attic; how many bags that takes depends on your product’s coverage at that R-value.' },
        { question: 'What R-value do I need for my climate zone?', answer: 'Per ENERGY STAR’s own table for an uninsulated attic: R-30 in Zone 1, R-49 in Zones 2 and 3, and R-60 in Zones 4A/4B, 4C/5/6, and 7/8.' },
        { question: 'Does the R-value target change if I already have some insulation?', answer: 'Yes. ENERGY STAR publishes a lower target for an attic with 3–4 inches already in place, since the existing insulation already contributes some R-value. This calculator uses the higher, uninsulated-attic target.' },
        { question: 'How do I know how much area one bag of insulation covers?', answer: 'Check the bag or roll label — coverage per bag is printed there and varies by brand and by the R-value (thickness) you are installing. A bag covers noticeably less area at a higher R-value.' },
        { question: 'Should I seal air leaks before adding insulation?', answer: 'Yes. ENERGY STAR recommends sealing attic air leaks, such as around recessed lights and plumbing stacks, before adding insulation, since insulation slows heat flow but does not stop air leaks.' },
        { question: 'Can I compress insulation to fit a shallow space?', answer: 'No. Compressing batts or blown-in insulation into too little depth reduces its real R-value below what the package states.' },
        { question: 'Does this calculator work for wall insulation too?', answer: 'It can estimate bags/rolls for any area if you enter the right target R-value and your product’s coverage at that R-value — ENERGY STAR’s table used here is specifically for attics, so check a wall-specific recommendation separately.' }
      ]
    },
    compute(values) {
      const targetRValue = values.climateZone;
      const areaSqFt = values.areaSqFt;
      const areaWithWaste = areaSqFt * (1 + values.wastePercent / 100);
      const bagsNeeded = Math.ceil(areaWithWaste / values.coveragePerBag);
      const coverageBought = bagsNeeded * values.coveragePerBag;
      return { bagsNeeded, targetRValue, areaSqFt, coverageBought };
    }
  }
];
