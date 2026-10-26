import type { CalculatorConfig } from './types.ts';
import { toBase, fromBase } from '../../lib/units.ts';
import { gramsPerCup, INGREDIENT_DENSITIES } from '../../lib/ingredients.ts';

// A cup amount -> [grams, ounces] row for a reference table, for one ingredient's density. Every
// value is computed here, never typed in (mdFiles/steps/42-wave-1-conversion.md, "Run 6").
function cupAmountRow(label: string, cups: number, gramsPerCupValue: number) {
  const grams = cups * gramsPerCupValue;
  return { label, values: [grams, fromBase(toBase(grams, 'mass', 'g'), 'mass', 'oz')] };
}

const CUP_AMOUNTS: { label: string; cups: number }[] = [
  { label: '¼ cup', cups: 0.25 },
  { label: '⅓ cup', cups: 1 / 3 },
  { label: '½ cup', cups: 0.5 },
  { label: '⅔ cup', cups: 2 / 3 },
  { label: '¾ cup', cups: 0.75 },
  { label: '1 cup', cups: 1 },
  { label: '1½ cups', cups: 1.5 },
  { label: '2 cups', cups: 2 }
];

export const measurementsCalculators: CalculatorConfig[] = [
  {
    id: 'miles-to-kilometers-converter',
    category: 'measurements',
    updatedAt: '2026-10-19',
    aliases: ['mi to km converter', 'km to miles calculator', 'miles to km', 'convert miles to kilometers'],
    related: ['pounds-to-kilograms-converter', 'gallons-to-liters-converter', 'fahrenheit-to-celsius-converter', 'length-converter'],
    title: 'Miles to Kilometers Converter',
    description: 'Convert miles to kilometers, or kilometers to miles, as you type. Meters, feet, yards and nautical miles are in the unit menus too.',
    example: '10 miles is 16.09 km, a 5K race is 3.11 miles, and a marathon (42.195 km) is 26.22 miles.',
    solver: {
      defaultTarget: 'kilometers',
      variables: [
        { id: 'kilometers', label: 'Kilometers', symbol: 'km', dimension: 'length', defaultValue: 16.0934, defaultUnit: 'km' },
        { id: 'miles', label: 'Miles', symbol: 'mi', dimension: 'length', defaultValue: 10, defaultUnit: 'mi' }
      ],
      // Both fields hold the same distance (in meters); the unit menus do the converting.
      solve: {
        kilometers: ({ miles }) => (miles >= 0 ? miles : NaN),
        miles: ({ kilometers }) => (kilometers >= 0 ? kilometers : NaN)
      },
      derive: (si) => ({ kmShown: si.kilometers / 1000 }),
      visuals: [
        {
          type: 'logScale',
          value: 'kmShown',
          min: -1,
          max: 3,
          ticks: ['0.1 km', '1 km', '10 km', '100 km', '1,000 km'],
          benchmarks: [
            { label: '1 mile', value: 1.609 },
            { label: '5K race', value: 5 },
            { label: 'Half marathon', value: 21.0975 },
            { label: 'Marathon', value: 42.195 }
          ],
          title: 'How far is that?',
          valueLabel: 'Your distance'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'Miles and kilometers',
        paragraphs: [
          'The mile and the kilometer measure the same thing, distance, on two different systems. The kilometer is 1,000 meters, the metric unit used for road distances in most of the world. The mile is a customary unit of 5,280 feet, still used on roads in the US and the UK.',
          'Since 1959, the US and the other English-speaking countries have defined the yard as exactly 0.9144 meters. That makes the international mile exactly 1,609.344 meters, so 1 mile = 1.609344 km and the conversion is a single exact multiplication. Going the other way, 1 km is about 0.621371 miles.',
          'For land surveying, the US kept a slightly longer "survey mile" for decades, about 3.2 millimeters longer per mile. NIST retired the US survey foot at the end of 2022, so every US mile is now the international mile. A nautical mile is a different unit altogether: exactly 1,852 meters, used at sea and in the air.'
        ]
      },
      howTo: {
        intro: 'Type a distance in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Miles to kilometers', text: 'Type the number of miles. The kilometers field shows the conversion.' },
          { name: 'Kilometers to miles', text: 'Type into the kilometers field instead. It becomes the input and the miles field is calculated.' },
          { name: 'Use other units', text: 'Either menu also offers meters, feet, yards, inches and nautical miles.' },
          { name: 'Read the scale', text: 'The scale places the distance against a mile, a 5K, a half marathon and a marathon.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A mile is a fixed number of kilometers, so the conversion is one multiplication or division.',
        expression: 'km = mi × 1.609344\nmi = km ÷ 1.609344 ≈ km × 0.621371',
        terms: [
          { symbol: 'mi', meaning: 'Distance in international miles (5,280 ft).' },
          { symbol: 'km', meaning: 'Distance in kilometers (1,000 m).' },
          { symbol: '1.609344', meaning: 'Kilometers in a mile, exact: 1,760 yd × 0.9144 m ÷ 1,000.' }
        ],
        note: 'The factor is exact. Results are rounded for display only. The same factor converts speeds: mph × 1.609344 = km/h.'
      },
      workedExample: {
        intro: 'You are planning a 10-mile run and a race listed as 10 km. How far is each in the other unit?',
        rows: [
          { label: '10 miles × 1.609344', value: '16.09 km' },
          { label: '10 km ÷ 1.609344', value: '6.21 miles' },
          { label: 'Difference (16.09 − 10)', value: '6.09 km, about 3.79 miles' },
          { label: 'Quick check: 10 × 1.6', value: '16 km' }
        ],
        result: '10 mi ≈ 16.09 km · 10 km ≈ 6.21 mi',
        explanation: 'Multiplying by 1.6 is a good shortcut: it is only about 0.6% low. For kilometers to miles, multiplying by 5/8 (0.625) is about 0.6% high.'
      },
      commonValues: {
        title: 'Common miles to kilometers conversions',
        dimension: 'length',
        from: 'mi',
        to: 'km',
        values: [1, 3, 5, 10, 13.1, 20, 26.2, 50, 100],
        reverse: {
          title: 'Common kilometers to miles conversions',
          values: [1, 5, 10, 21.1, 42.2, 50, 100]
        }
      },
      watchOut: [
        { title: 'Nautical miles are not miles', body: 'A nautical mile is 1,852 m, about 1.151 statute miles. Boat and aircraft speeds in knots use it. Pick nmi in the menu if your figure is nautical.' },
        { title: 'Speeds convert the same way', body: '60 mph is about 96.56 km/h and 100 km/h about 62.14 mph. The same 1.609344 factor applies, because the hours cancel.' },
        { title: 'Race distances are defined in kilometers', body: 'A marathon is 42.195 km, so 26.2 miles is a rounded figure (26.219 miles). Use the kilometer distance when precision matters.' },
        { title: 'Old survey records', body: 'Land records from before 2023 may use US survey feet and miles. The difference is about 3.2 mm per mile, which matters only for surveying.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST, U.S. survey foot (deprecated after December 31, 2022)', url: 'https://www.nist.gov/pml/us-surveyfoot' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'miles', label: 'Miles', type: 'number', placeholder: '10', defaultValue: 10, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Miles to Kilometers Converter (mi to km)',
      description: 'Free miles to kilometers converter: mi to km and km to mi as you type, with the exact factor, race distances, speeds and a worked example.',
      faq: [
        { question: 'How do I convert miles to kilometers?', answer: 'Multiply by 1.609344. For 10 miles: 10 × 1.609344 = 16.09 km.' },
        { question: 'How do I convert kilometers to miles?', answer: 'Divide by 1.609344, or multiply by about 0.621371. 100 km is about 62.14 miles.' },
        { question: 'How many miles is a 5K or a 10K?', answer: 'A 5K is about 3.11 miles and a 10K about 6.21 miles. A half marathon (21.0975 km) is about 13.11 miles.' },
        { question: 'How many miles is a marathon?', answer: 'A marathon is 42.195 km, which is about 26.22 miles. It is usually quoted as 26.2 miles.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply miles by 1.6 for kilometers, or kilometers by 5/8 for miles. Neighboring Fibonacci numbers also work: 5 miles is about 8 km (8.05 exactly) and 8 miles about 13 km (12.87 exactly).' },
        { question: 'Is a mile the same everywhere?', answer: 'The international mile, 1,609.344 m, is used for road distances in the US and the UK. The nautical mile (1,852 m) is a different unit, and the slightly longer US survey mile was retired at the end of 2022.' }
      ]
    },
    compute(values) {
      const kilometers = fromBase(toBase(values.miles, 'length', 'mi'), 'length', 'km');
      return { kilometers };
    }
  },
  {
    id: 'fahrenheit-to-celsius-converter',
    category: 'measurements',
    updatedAt: '2026-10-19',
    aliases: ['f to c converter', 'temperature converter', 'celsius to fahrenheit calculator', 'degree converter', 'kelvin converter'],
    related: ['miles-to-kilometers-converter', 'pounds-to-kilograms-converter', 'gallons-to-liters-converter', 'force-calculator'],
    title: 'Fahrenheit to Celsius Converter',
    description: 'Convert Fahrenheit to Celsius, or Celsius to Fahrenheit, as you type. Kelvin and Rankine are in the unit menus too.',
    example: '68 °F is exactly 20 °C, a comfortable room. A 350 °F oven is about 177 °C, and −40 is the same on both scales.',
    solver: {
      defaultTarget: 'celsius',
      variables: [
        { id: 'celsius', label: 'Celsius', symbol: 'C', dimension: 'temperature', defaultValue: 20, defaultUnit: 'C' },
        { id: 'fahrenheit', label: 'Fahrenheit', symbol: 'F', dimension: 'temperature', defaultValue: 68, defaultUnit: 'F' }
      ],
      // Both fields hold the same temperature (in kelvins); below absolute zero there is no answer.
      solve: {
        celsius: ({ fahrenheit }) => (fahrenheit >= 0 ? fahrenheit : NaN),
        fahrenheit: ({ celsius }) => (celsius >= 0 ? celsius : NaN)
      },
      derive: (si) => ({ degreesC: si.celsius - 273.15 }),
      visuals: [
        {
          type: 'rangeBar',
          value: 'degreesC',
          title: 'Where it sits, in °C',
          bands: [
            { label: 'Below freezing', min: -40, max: 0 },
            { label: 'Freezing to body temperature', min: 0, max: 37 },
            { label: 'Body temperature to boiling', min: 37, max: 100 },
            { label: 'Above boiling', min: 100, max: 140 }
          ]
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'Fahrenheit and Celsius',
        paragraphs: [
          'Fahrenheit and Celsius are two scales for the same thing. The Celsius scale puts the freezing point of water at 0 degrees and its boiling point at 100 degrees, both at standard sea-level pressure. The Fahrenheit scale puts the same two points at 32 °F and 212 °F. The US uses Fahrenheit for weather, cooking and body temperature; almost everywhere else uses Celsius.',
          'Between freezing and boiling, Celsius counts 100 degrees and Fahrenheit counts 180. A Fahrenheit degree is therefore 100/180 = 5/9 of a Celsius degree, and the scales are offset by 32 at the freezing point. That is why converting needs two steps, a subtraction and a multiplication, rather than a single factor like miles to kilometers.',
          'Science uses the kelvin, the SI unit of temperature, which starts at absolute zero, the coldest possible temperature. A kelvin is the same size as a Celsius degree, so K = °C + 273.15, and absolute zero is −273.15 °C or −459.67 °F. The two everyday scales cross at one point: −40 °C is exactly −40 °F.'
        ]
      },
      howTo: {
        intro: 'Type a temperature in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Fahrenheit to Celsius', text: 'Type the temperature in the Fahrenheit field. The Celsius field shows the conversion.' },
          { name: 'Celsius to Fahrenheit', text: 'Type into the Celsius field instead. It becomes the input and the Fahrenheit field is calculated.' },
          { name: 'Use kelvin or Rankine', text: 'Pick K or °R from the unit menu beside either field. The number you typed is converted, not reinterpreted.' },
          { name: 'Read the bar', text: 'The bar places the temperature against freezing, body temperature and boiling, in °C.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The scales differ in both size and starting point: subtract the offset, then scale, or the reverse.',
        expression: '°C = (°F − 32) × 5/9\n°F = °C × 9/5 + 32\nK = °C + 273.15',
        terms: [
          { symbol: '°F', meaning: 'Temperature in degrees Fahrenheit.' },
          { symbol: '°C', meaning: 'Temperature in degrees Celsius.' },
          { symbol: '32', meaning: 'The freezing point of water on the Fahrenheit scale (0 °C).' },
          { symbol: '5/9', meaning: 'The size of a Fahrenheit degree in Celsius degrees (100 ÷ 180).' },
          { symbol: 'K', meaning: 'Kelvin, the SI unit: same size as a Celsius degree, starting at absolute zero.' }
        ],
        note: 'These definitions are exact. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A recipe says to bake at 350 °F and your oven is marked in Celsius. What setting do you use? And what is a 20 °C room in Fahrenheit?',
        rows: [
          { label: 'Subtract 32 (350 − 32)', value: '318' },
          { label: 'Multiply by 5/9 (318 × 5 ÷ 9)', value: '176.67 °C' },
          { label: 'Back the other way: 20 × 9/5', value: '36' },
          { label: 'Add 32 (36 + 32)', value: '68 °F' }
        ],
        result: '350 °F ≈ 176.7 °C (ovens use 180 °C) · 20 °C = 68 °F',
        explanation: 'Recipes written in Celsius usually round 350 °F to 180 °C, which is about 6 °F hotter (356 °F). That is well within the swing of a home oven thermostat.'
      },
      commonValues: {
        title: 'Common Fahrenheit to Celsius conversions',
        dimension: 'temperature',
        from: 'F',
        to: 'C',
        values: [0, 32, 68, 98.6, 100, 212, 350, 400],
        reverse: {
          title: 'Common Celsius to Fahrenheit conversions',
          values: [-18, 0, 20, 25, 37, 100, 180, 200]
        }
      },
      watchOut: [
        { title: 'Subtract before multiplying', body: 'Multiplying first gives the wrong answer: 68 × 5/9 − 32 is about 5.8, not 20. Take away 32 first, then multiply by 5/9.' },
        { title: 'Temperature differences convert without the 32', body: 'A change of 10 °C is a change of 18 °F, not 50 °F. When you convert a rise or fall in temperature, multiply by 9/5 or 5/9 only.' },
        { title: 'The quick rule drifts', body: 'Subtracting 30 and halving is exact at 50 °F (10 °C) but drifts away from it: 90 °F gives 30 °C by the rule against 32.2 °C exactly.' },
        { title: 'Nothing is below absolute zero', body: 'Temperatures under −459.67 °F (−273.15 °C, 0 K) do not exist, so the converter shows no answer for them.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (temperature conversions)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure), 9th edition', url: 'https://www.bipm.org/en/publications/si-brochure' },
        { label: 'NIST Office of Weights and Measures, Unit conversion', url: 'https://www.nist.gov/pml/owm/metric-si/unit-conversion' }
      ]
    },
    inputs: [
      { id: 'fahrenheit', label: 'Fahrenheit', type: 'number', placeholder: '68', defaultValue: 68, step: 0.1, min: -200 }
    ],
    seo: {
      title: 'Fahrenheit to Celsius Converter (°F to °C)',
      description: 'Free Fahrenheit to Celsius converter: °F to °C and back as you type, with kelvin, the formula, oven and body temperatures, and a worked example.',
      faq: [
        { question: 'How do I convert Fahrenheit to Celsius?', answer: 'Subtract 32, then multiply by 5/9. For 68 °F: 68 − 32 = 36, and 36 × 5/9 = 20 °C.' },
        { question: 'How do I convert Celsius to Fahrenheit?', answer: 'Multiply by 9/5, then add 32. For 25 °C: 25 × 9/5 = 45, and 45 + 32 = 77 °F.' },
        { question: 'What is 350 °F in Celsius?', answer: 'About 176.7 °C. Recipes usually round it to 180 °C. Other common oven settings: 400 °F is about 204.4 °C and 425 °F about 218.3 °C.' },
        { question: 'What is normal body temperature in Celsius?', answer: 'The traditional figure of 98.6 °F is exactly 37 °C. A reading of 100.4 °F is 38 °C.' },
        { question: 'At what temperature are Fahrenheit and Celsius equal?', answer: 'At −40. Setting °F = °C in the formula gives x = x × 9/5 + 32, so x = −40.' },
        { question: 'Is there a quick way to convert in my head?', answer: 'Subtract 30 and halve for a rough Celsius figure: 70 °F gives 20 °C against 21.1 °C exactly. The other way, double and add 30: 20 °C gives 70 °F against 68 °F exactly.' },
        { question: 'How do I convert to kelvin?', answer: 'Add 273.15 to the Celsius temperature. 20 °C is 293.15 K, and 68 °F is the same 293.15 K.' }
      ]
    },
    compute(values) {
      const celsius = fromBase(toBase(values.fahrenheit, 'temperature', 'F'), 'temperature', 'C');
      return { celsius };
    }
  },
  {
    id: 'pounds-to-kilograms-converter',
    category: 'measurements',
    updatedAt: '2026-10-19',
    aliases: ['lbs to kg converter', 'kg to pounds calculator', 'convert pounds to kilograms', 'lb to kg'],
    related: ['bmi-calculator', 'weight-converter', 'gallons-to-liters-converter', 'fahrenheit-to-celsius-converter'],
    title: 'Pounds to Kilograms Converter',
    description: 'Convert pounds to kilograms, or kilograms to pounds, as you type. Stone, ounces, grams and tonnes are in the unit menus too.',
    example: '150 lb is 68.04 kg, and 70 kg is 154.32 lb, or 11 stone and about a third of a pound.',
    solver: {
      defaultTarget: 'kilograms',
      variables: [
        { id: 'kilograms', label: 'Kilograms', symbol: 'kg', dimension: 'mass', defaultValue: 68.0389, defaultUnit: 'kg' },
        { id: 'pounds', label: 'Pounds', symbol: 'lb', dimension: 'mass', defaultValue: 150, defaultUnit: 'lb' }
      ],
      // Both fields hold the same mass (in kg); the unit menus do the converting.
      solve: {
        kilograms: ({ pounds }) => (pounds >= 0 ? pounds : NaN),
        pounds: ({ kilograms }) => (kilograms >= 0 ? kilograms : NaN)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'kilograms',
          min: -1,
          max: 3,
          ticks: ['0.1 kg', '1 kg', '10 kg', '100 kg', '1,000 kg'],
          benchmarks: [
            { label: '1 pound', value: 0.4536 },
            { label: '1 stone', value: 6.35 },
            { label: '100 pounds', value: 45.36 },
            { label: 'US short ton (2,000 lb)', value: 907.2 }
          ],
          title: 'How heavy is that?',
          valueLabel: 'Your weight'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'Pounds, stone and kilograms',
        paragraphs: [
          'The kilogram is the SI unit of mass, used for weight in almost every country. The pound is the customary unit in the US, and it is still common for body weight in the UK alongside the stone. Since 1959, the pound has been defined from the kilogram: one pound is exactly 0.45359237 kg.',
          'Because the definition is exact, converting is one multiplication with no offset. One kilogram is about 2.20462 pounds, a little over two. A pound divides into 16 ounces of about 28.35 grams each, and 14 pounds make one stone, about 6.35 kg. British body weights are often given as "11 st 4 lb", meaning 11 stone plus 4 pounds, or 158 lb.',
          'Everyday "weight" is really mass. A scale measures the downward force of gravity and shows it in kilograms or pounds, which is the right number for food, luggage, freight and people. Physics separates the two: the newton is the unit of force, and the force calculator on this site converts between them.'
        ]
      },
      howTo: {
        intro: 'Type a weight in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pounds to kilograms', text: 'Type the number of pounds. The kilograms field shows the conversion.' },
          { name: 'Kilograms to pounds', text: 'Type into the kilograms field instead. It becomes the input and the pounds field is calculated.' },
          { name: 'Use stone', text: 'Pick st from either menu for stone. For stone and pounds such as 11 st 4 lb, enter the total in pounds (11 × 14 + 4 = 158 lb).' },
          { name: 'Use other units', text: 'The menus also offer grams, ounces and metric tonnes.' },
          { name: 'Read the scale', text: 'The scale places the weight between a pound and a US ton.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A pound is a fixed number of kilograms, so the conversion is one multiplication or division.',
        expression: 'kg = lb × 0.45359237\nlb = kg ÷ 0.45359237 ≈ kg × 2.20462\nst = lb ÷ 14',
        terms: [
          { symbol: 'lb', meaning: 'Mass in avoirdupois pounds, the everyday pound.' },
          { symbol: 'kg', meaning: 'Mass in kilograms.' },
          { symbol: '0.45359237', meaning: 'Kilograms in a pound, exact by definition since 1959.' },
          { symbol: 'st', meaning: 'Stone, 14 pounds (6.35029318 kg).' }
        ],
        note: 'The factors are exact. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'You weigh 150 lb and a form asks for kilograms. What do you enter, and what is that in stone?',
        rows: [
          { label: '150 × 0.45359237', value: '68.04 kg' },
          { label: '150 ÷ 14', value: '10.71 st' },
          { label: 'Whole stone and pounds (10 × 14 = 140, 150 − 140)', value: '10 st 10 lb' },
          { label: 'Quick check: half of 150, minus 10%', value: '75 − 7.5 = 67.5 kg' }
        ],
        result: '150 lb ≈ 68.04 kg = 10 st 10 lb',
        explanation: 'Halving and taking off 10% gives 0.45 kg per pound, under 1% below the exact 0.4536. For kilograms to pounds, double the figure and add 10%: 68 kg gives 136 + 13.6 = 149.6 lb.'
      },
      commonValues: {
        title: 'Common pounds to kilograms conversions',
        dimension: 'mass',
        from: 'lb',
        to: 'kg',
        values: [1, 5, 10, 50, 100, 150, 200, 250],
        reverse: {
          title: 'Common kilograms to pounds conversions',
          values: [1, 5, 10, 50, 70, 100, 150]
        }
      },
      watchOut: [
        { title: 'Stone and pounds are mixed units', body: '11 st 4 lb is not 11.4 stone. It is 11 + 4/14 ≈ 11.29 stone, or 158 lb. Convert it to pounds first.' },
        { title: 'Tons come in three sizes', body: 'A US short ton is 2,000 lb (907.18 kg), a UK long ton 2,240 lb (1,016.05 kg) and a metric tonne 1,000 kg (2,204.62 lb). Check which one a figure uses.' },
        { title: 'Troy weights are for precious metals', body: 'Gold and silver are priced per troy ounce, about 31.10 g, heavier than the everyday 28.35 g ounce. This converter uses everyday (avoirdupois) pounds and ounces.' },
        { title: 'Rounded factors add up', body: 'Using 0.45 or 2.2 is fine for a quick check, but 2.2 understates by about 0.2%. For shipping, dosing or anything billed by weight, use the exact factor.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
        { label: 'UK Weights and Measures Act 1985, Schedule 1 (definitions of the pound and the stone)', url: 'https://www.legislation.gov.uk/ukpga/1985/72/schedule/1' }
      ]
    },
    inputs: [
      { id: 'pounds', label: 'Pounds', type: 'number', placeholder: '150', defaultValue: 150, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Pounds to Kilograms Converter (lb to kg, Stone)',
      description: 'Free pounds to kilograms converter: lb to kg and kg to lb as you type, plus stone, ounces and grams, with the exact factor and a worked example.',
      faq: [
        { question: 'How do I convert pounds to kilograms?', answer: 'Multiply by 0.45359237. For 150 lb: 150 × 0.45359237 ≈ 68.04 kg.' },
        { question: 'How do I convert kilograms to pounds?', answer: 'Divide by 0.45359237, or multiply by about 2.20462. 70 kg is about 154.32 lb.' },
        { question: 'How many kilograms is a stone?', answer: 'One stone is 14 pounds, exactly 6.35029318 kg. 11 st 4 lb is 158 lb, about 71.67 kg.' },
        { question: 'What is 100 kg in pounds and stone?', answer: 'About 220.46 lb, which is 15.75 stone, or 15 st 10.5 lb.' },
        { question: 'How many ounces are in a pound?', answer: 'Sixteen. An ounce is about 28.35 grams, so a pound is about 453.6 grams.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'For kilograms, halve the pounds and take off 10%: 150 lb gives 67.5 kg against 68.04 exactly. For pounds, double the kilograms and add 10%.' }
      ]
    },
    compute(values) {
      const kilograms = fromBase(toBase(values.pounds, 'mass', 'lb'), 'mass', 'kg');
      return { kilograms };
    }
  },
  {
    id: 'gallons-to-liters-converter',
    category: 'measurements',
    updatedAt: '2026-10-19',
    aliases: ['gal to l converter', 'liters to gallons calculator', 'fuel volume converter', 'imperial gallon converter'],
    related: ['fuel-cost-calculator', 'volume-converter', 'pounds-to-kilograms-converter', 'water-intake-calculator'],
    title: 'Gallons to Liters Converter',
    description: 'Convert US or UK (imperial) gallons to liters, or liters to gallons, as you type. Quarts, pints, cups and fluid ounces are in the unit menus too.',
    example: '2.5 US gallons is about 9.46 liters. A UK (imperial) gallon is 4.546 liters, about 20% more than a US gallon.',
    solver: {
      defaultTarget: 'liters',
      variables: [
        { id: 'liters', label: 'Liters', symbol: 'L', dimension: 'volume', defaultValue: 9.46353, defaultUnit: 'L' },
        { id: 'gallons', label: 'Gallons', symbol: 'gal', dimension: 'volume', defaultValue: 2.5, defaultUnit: 'gal' }
      ],
      // Both fields hold the same volume (in m³); the unit menus do the converting.
      solve: {
        liters: ({ gallons }) => (gallons >= 0 ? gallons : NaN),
        gallons: ({ liters }) => (liters >= 0 ? liters : NaN)
      },
      derive: (si) => ({ litersShown: si.liters * 1000 }),
      visuals: [
        {
          type: 'logScale',
          value: 'litersShown',
          min: -1,
          max: 3,
          ticks: ['0.1 L', '1 L', '10 L', '100 L', '1,000 L'],
          benchmarks: [
            { label: '12 fl oz can', value: 0.3549 },
            { label: '1 US gallon', value: 3.785 },
            { label: '5 US gallons', value: 18.93 },
            { label: 'Oil barrel (42 US gal)', value: 159 }
          ],
          title: 'How much is that?',
          valueLabel: 'Your volume'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-19',
      concept: {
        title: 'US gallons, UK gallons and liters',
        paragraphs: [
          'There are two gallons in common use, and they are not the same size. The US gallon is defined as 231 cubic inches, which is exactly 3.785411784 liters. The imperial gallon, used in the UK and historically across the Commonwealth, is defined as exactly 4.54609 liters. An imperial gallon is about 20% larger than a US gallon.',
          'The liter is a metric unit of volume equal to one cubic decimeter, or 1,000 cubic centimeters. It is accepted for use with the SI and is the unit for fuel, drinks and most liquids across most of the world. Converting from gallons is a single multiplication, because both scales start at zero: there is no offset as there is with temperature.',
          'The smaller units follow their own gallon. A US gallon holds 4 US quarts, 8 US pints or 128 US fluid ounces. An imperial gallon holds 8 imperial pints or 160 imperial fluid ounces, so a UK pint (568 mL) is bigger than a US pint (473 mL) even though a UK fluid ounce is slightly smaller than a US one.'
        ]
      },
      howTo: {
        intro: 'Type a volume in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Gallons to liters', text: 'Type the number of gallons. The liters field shows the conversion.' },
          { name: 'Pick US or UK gallons', text: 'The gallons field starts in US gallons. Choose gal (UK) from its menu for imperial gallons.' },
          { name: 'Liters to gallons', text: 'Type into the liters field instead. It becomes the input and the gallons field is calculated.' },
          { name: 'Use other units', text: 'Either menu also offers quarts, pints, cups, fluid ounces, milliliters and cubic feet.' },
          { name: 'Read the scale', text: 'The scale places the volume between a drink can and an oil barrel.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each gallon is a fixed number of liters, so the conversion is one multiplication or division.',
        expression: 'L = gal (US) × 3.785411784\nL = gal (UK) × 4.54609\ngal (US) = L ÷ 3.785411784',
        terms: [
          { symbol: 'L', meaning: 'Volume in liters.' },
          { symbol: 'gal (US)', meaning: 'US gallon, 231 cubic inches.' },
          { symbol: 'gal (UK)', meaning: 'Imperial gallon, 4.54609 liters by definition.' },
          { symbol: '3.785411784', meaning: 'Liters in a US gallon, exact: 231 × 16.387064 cm³ ÷ 1,000.' }
        ],
        note: 'Both factors are exact definitions. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'You need 2.5 US gallons of water for a recipe batch, and your container is marked in liters. How many liters is that, and how much would 2.5 imperial gallons be?',
        rows: [
          { label: 'US: 2.5 × 3.785411784', value: '9.4635 L' },
          { label: 'UK: 2.5 × 4.54609', value: '11.3652 L' },
          { label: 'Difference (11.3652 − 9.4635)', value: '1.9017 L' },
          { label: 'Quick check: 2.5 × 4 = 10, minus 5%', value: '9.5 L' }
        ],
        result: '2.5 US gal ≈ 9.46 L · 2.5 UK gal ≈ 11.37 L',
        explanation: 'Multiplying by 4 and taking off 5% is a handy mental shortcut for US gallons, because 3.785 is about 4 × 0.95. It lands within half a percent.'
      },
      commonValues: {
        title: 'Common gallons (US) to liters conversions',
        dimension: 'volume',
        from: 'gal',
        to: 'L',
        values: [1, 2, 2.5, 5, 10, 15, 20, 55],
        reverse: {
          title: 'Common liters to gallons (US) conversions',
          values: [1, 5, 10, 20, 50, 100]
        }
      },
      watchOut: [
        { title: 'Know which gallon you have', body: 'Older UK and Canadian recipes, fuel figures and car economy ratings use imperial gallons. Using the US factor for them understates the volume by about 17%.' },
        { title: 'Dry gallons are different again', body: 'The US dry gallon (about 4.405 L) is a rarely used unit for grain and produce. Liquid measures, fuel and recipes use the 231 cubic inch liquid gallon.' },
        { title: 'Fuel prices per liter and per gallon', body: 'To compare pump prices, divide the price per US gallon by 3.785 to get the price per liter. $3.50 a gallon is about $0.92 a liter.' },
        { title: 'Pints and fluid ounces follow their gallon', body: 'A UK pint is 20 UK fluid ounces (568 mL) and a US pint 16 US fluid ounces (473 mL). Pick the matching unit in the menu.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
        { label: 'UK Weights and Measures Act 1985, Schedule 1 (definition of the gallon)', url: 'https://www.legislation.gov.uk/ukpga/1985/72/schedule/1' },
        { label: 'U.S. Energy Information Administration, Oil and petroleum products explained (the 42-gallon barrel)', url: 'https://www.eia.gov/energyexplained/oil-and-petroleum-products/' }
      ]
    },
    inputs: [
      { id: 'gallons', label: 'Gallons', type: 'number', placeholder: '2.5', defaultValue: 2.5, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Gallons to Liters Converter (US & UK Gallons)',
      description: 'Free gallons to liters converter: US or imperial gallons to liters and back as you type, plus quarts, pints and fluid ounces, with the exact factors.',
      faq: [
        { question: 'How many liters are in a gallon?', answer: 'A US gallon is exactly 3.785411784 liters, about 3.785 L. An imperial (UK) gallon is exactly 4.54609 liters.' },
        { question: 'How do I convert gallons to liters?', answer: 'Multiply US gallons by 3.785411784. For 2.5 gallons: 2.5 × 3.785411784 ≈ 9.46 liters. For imperial gallons, multiply by 4.54609.' },
        { question: 'How do I convert liters to gallons?', answer: 'Divide by 3.785411784 for US gallons. 10 liters is about 2.642 US gallons, or 2.200 imperial gallons.' },
        { question: 'Why is a UK gallon bigger than a US gallon?', answer: 'They come from different historical standards. The US kept the 231 cubic inch wine gallon, while the UK defined its imperial gallon in 1824 from the volume of 10 pounds of water. One imperial gallon is about 1.201 US gallons.' },
        { question: 'How many liters fit in a 15-gallon fuel tank?', answer: 'About 56.78 liters for 15 US gallons. A 50-liter tank holds about 13.21 US gallons or 11.00 imperial gallons.' },
        { question: 'How many liters are in a quart?', answer: 'A US liquid quart, a quarter of a US gallon, is about 0.946 liters. A liter is about 1.057 US quarts.' }
      ]
    },
    compute(values) {
      const liters = fromBase(toBase(values.gallons, 'volume', 'gal'), 'volume', 'L');
      return { liters };
    }
  },
  {
    id: 'centimeters-to-inches-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['cm to inches converter', 'inches to cm converter', 'convert cm to in', 'centimeters to inches calculator'],
    related: ['feet-to-meters-converter', 'miles-to-kilometers-converter', 'bmi-calculator', 'pounds-to-kilograms-converter'],
    title: 'Centimeters to Inches Converter',
    description: 'Convert centimeters to inches, or inches to centimeters, as you type. Includes a table of common heights in feet and inches.',
    example: '25.4 cm is exactly 10 inches, and 180 cm, a common height, is about 5 ft 11 in.',
    solver: {
      defaultTarget: 'inches',
      variables: [
        { id: 'centimeters', label: 'Centimeters', symbol: 'cm', dimension: 'length', defaultValue: 25.4, defaultUnit: 'cm' },
        { id: 'inches', label: 'Inches', symbol: 'in', dimension: 'length', defaultValue: 10, defaultUnit: 'in' }
      ],
      // Both fields hold the same length (in meters); the unit menus do the converting.
      solve: {
        centimeters: ({ inches }) => (inches >= 0 ? inches : NaN),
        inches: ({ centimeters }) => (centimeters >= 0 ? centimeters : NaN)
      },
      derive: (si) => ({ cmShown: si.centimeters * 100 }),
      visuals: [
        {
          type: 'logScale',
          value: 'cmShown',
          min: -1,
          max: 3,
          ticks: ['0.1 cm', '1 cm', '10 cm', '100 cm', '1,000 cm'],
          benchmarks: [
            { label: 'A staple', value: 1 },
            { label: 'A credit card width', value: 5.4 },
            { label: 'A sheet of A4 paper', value: 29.7 },
            { label: 'A common adult height (170 cm)', value: 170 }
          ],
          title: 'How long is that?',
          valueLabel: 'Your length'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Centimeters and inches',
        paragraphs: [
          'The centimeter is a metric unit of length, one hundredth of a meter, used worldwide for everyday measurements too small to need a full meter. The inch is a customary unit used mainly in the US, equal to 1/12 of a foot. Since 1959, the inch has been defined from the meter: one inch is exactly 2.54 centimeters, by the same international yard-and-pound agreement that fixed the mile (see the miles to kilometers converter).',
          'Because the definition is exact, converting is one multiplication or division with no offset. One centimeter is about 0.3937 inches, so a quick way to think about it is that an inch is a little more than two and a half centimeters. Rulers and tape measures often show both scales side by side for this reason.',
          'Height is the most common place these two units meet: countries that use the metric system record height in centimeters, while the US and the UK use feet and inches. 180 cm, a common adult height, is just short of 6 feet — specifically 5 ft 11 in. Converting a height means finding the total inches first, then splitting off whole feet, so the inches part never rolls over into "12 in" by mistake.'
        ]
      },
      howTo: {
        intro: 'Type a length in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Centimeters to inches', text: 'Type the length in centimeters. The inches field shows the conversion.' },
          { name: 'Inches to centimeters', text: 'Type into the inches field instead. It becomes the input and the centimeters field is calculated.' },
          { name: 'Use other units', text: 'Either menu also offers meters, millimeters, feet and yards.' },
          { name: 'Read the scale', text: 'The scale places the length against a staple, a credit card, a sheet of A4 paper and an average adult height.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'An inch is a fixed number of centimeters, so the conversion is one multiplication or division.',
        expression: 'in = cm ÷ 2.54\ncm = in × 2.54',
        terms: [
          { symbol: 'cm', meaning: 'Length in centimeters, 1/100 of a meter.' },
          { symbol: 'in', meaning: 'Length in inches.' },
          { symbol: '2.54', meaning: 'Centimeters in an inch, exact by definition since 1959.' }
        ],
        note: 'The factor is exact. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A box is 45 cm long and a shelf is 20 inches deep. How long is the box in inches, and how deep is the shelf in centimeters?',
        rows: [
          { label: '45 ÷ 2.54', value: '17.72 in' },
          { label: '20 × 2.54', value: '50.8 cm' },
          { label: 'Quick check: 45 × 0.4', value: '18 in' }
        ],
        result: '45 cm ≈ 17.72 in · 20 in = 50.8 cm',
        explanation: 'Multiplying by 0.4 instead of dividing by 2.54 is a handy shortcut and lands within about 2%.'
      },
      commonValues: {
        title: 'Common centimeters to inches conversions',
        dimension: 'length',
        from: 'cm',
        to: 'in',
        values: [1, 2.54, 5, 10, 15, 20, 30, 50, 100],
        reverse: {
          title: 'Common heights, feet & inches to centimeters',
          values: [60, 63, 66, 69, 72, 75, 78],
          feetInches: 'from'
        }
      },
      watchOut: [
        { title: 'Round the total inches first', body: 'Converting a height like 69.3 in, round to the nearest whole inch before splitting into feet and inches: 69 in is 5 ft 9 in, not 4 ft 21 in. Never split the unrounded decimal.' },
        { title: 'A tape measure is less precise than this', body: 'A physical ruler or tape measure is usually only accurate to about 1 mm (0.04 in), well within the precision this converter shows.' },
        { title: 'An inch is not a foot', body: 'An inch is 1/12 of a foot. For whole feet, use the feet to meters converter, which handles the larger unit.' },
        { title: 'Shoe and ring sizes have their own scales', body: 'Shoe and ring sizes are not simple multiples of the inch or centimeter; this converter is for lengths only.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'centimeters', label: 'Centimeters', type: 'number', placeholder: '25.4', defaultValue: 25.4, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Centimeters to Inches Converter (cm to in)',
      description: 'Free centimeters to inches converter: cm to in and back as you type, with the exact 2.54 factor, common heights in ft and in, and a worked example.',
      faq: [
        { question: 'How do I convert centimeters to inches?', answer: 'Divide by 2.54. For 45 cm: 45 ÷ 2.54 ≈ 17.72 in.' },
        { question: 'How do I convert inches to centimeters?', answer: 'Multiply by 2.54. 20 in × 2.54 = 50.8 cm.' },
        { question: 'How many inches is 180 cm?', answer: 'About 70.87 in, which rounds to 71 in, or 5 ft 11 in.' },
        { question: 'How many centimeters is 6 feet?', answer: '6 ft is 72 in, which is 182.88 cm.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply centimeters by 0.4 for a rough inch figure (45 cm gives 18 in against 17.72 exactly), or inches by 2.5 for centimeters.' },
        { question: 'Why do rulers show both cm and inches?', answer: 'Because both units are common depending on where you are, and a dual ruler avoids needing a separate conversion.' }
      ]
    },
    compute(values) {
      const inches = fromBase(toBase(values.centimeters, 'length', 'cm'), 'length', 'in');
      return { inches };
    }
  },
  {
    id: 'feet-to-meters-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['ft to m converter', 'feet to meters calculator', 'meters to feet converter', 'convert feet to meters'],
    related: ['centimeters-to-inches-converter', 'miles-to-kilometers-converter', 'bmi-calculator', 'pounds-to-kilograms-converter'],
    title: 'Feet to Meters Converter',
    description: 'Convert feet to meters, or meters to feet, as you type. Includes a table of common heights in feet and inches.',
    example: '1 ft is exactly 0.3048 m, and a 6 ft person is about 1.83 m tall.',
    solver: {
      defaultTarget: 'meters',
      variables: [
        { id: 'meters', label: 'Meters', symbol: 'm', dimension: 'length', defaultValue: 1.8288, defaultUnit: 'm' },
        { id: 'feet', label: 'Feet', symbol: 'ft', dimension: 'length', defaultValue: 6, defaultUnit: 'ft' }
      ],
      // Both fields hold the same length (in meters); the unit menus do the converting.
      solve: {
        meters: ({ feet }) => (feet >= 0 ? feet : NaN),
        feet: ({ meters }) => (meters >= 0 ? meters : NaN)
      },
      derive: (si) => ({ mShown: si.meters }),
      visuals: [
        {
          type: 'logScale',
          value: 'mShown',
          min: -1,
          max: 3,
          ticks: ['0.1 m', '1 m', '10 m', '100 m', '1,000 m'],
          benchmarks: [
            { label: 'A standard interior doorway (80 in)', value: 2.032 },
            { label: 'A basketball hoop (10 ft)', value: 3.048 },
            { label: 'An Olympic pool length', value: 50 }
          ],
          title: 'How tall or long is that?',
          valueLabel: 'Your length'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Feet and meters',
        paragraphs: [
          'The foot is a customary unit of length used for height, construction and sports in the US and, alongside meters, in the UK. The meter is the SI base unit of length, used for almost everything else in the world. Since 1959, the international foot has been defined from the meter: one foot is exactly 0.3048 meters, fixed by the same agreement that set the yard and the pound (see the miles to kilometers converter).',
          'Because the definition is exact, converting between feet and meters is a single multiplication or division. A foot is also 12 inches, so converting a height in feet and inches means finding the total inches first (feet × 12 + inches), then multiplying by 0.0254 to reach meters — or the reverse: divide the meters by 0.3048 to get decimal feet, then split the whole feet from the remaining inches.',
          'Height is the most common everyday use for this conversion. A 6-foot person is about 1.83 m tall, and many countries record adult height only in centimeters or meters. The US briefly kept a very slightly different "US survey foot" for land surveying, defined as 1,200/3,937 meters; NIST retired it at the end of 2022, so every foot measurement today uses the same 0.3048 m international definition.'
        ]
      },
      howTo: {
        intro: 'Type a length in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Feet to meters', text: 'Type the number of feet. The meters field shows the conversion.' },
          { name: 'Meters to feet', text: 'Type into the meters field instead. It becomes the input and the feet field is calculated.' },
          { name: 'Enter feet and inches together', text: 'Convert the inches to a decimal first (divide by 12) and add it to the feet, e.g. 5 ft 9 in is 5.75 ft.' },
          { name: 'Use other units', text: 'Either menu also offers centimeters, millimeters, yards and inches.' },
          { name: 'Read the scale', text: 'The scale places the length against a doorway, a basketball hoop and an Olympic pool.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A foot is a fixed number of meters, so the conversion is one multiplication or division.',
        expression: 'm = ft × 0.3048\nft = m ÷ 0.3048 ≈ m × 3.28084',
        terms: [
          { symbol: 'ft', meaning: 'Length in international feet, 12 inches.' },
          { symbol: 'm', meaning: 'Length in meters, the SI base unit.' },
          { symbol: '0.3048', meaning: 'Meters in a foot, exact by definition since 1959.' }
        ],
        note: 'The factor is exact. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A room is 9 ft wide and a doorway is 2.1 m tall. How wide is the room in meters, and how tall is the doorway in feet and inches?',
        rows: [
          { label: '9 × 0.3048', value: '2.74 m' },
          { label: '2.1 ÷ 0.3048', value: '6.8898 ft' },
          { label: '0.8898 ft × 12 = 10.68 in, rounded', value: '6 ft 11 in' }
        ],
        result: '9 ft = 2.74 m · 2.1 m ≈ 6 ft 11 in',
        explanation: 'Converting feet and inches means rounding the TOTAL inches first: 6.8898 ft is 82.68 in, which rounds to 83 in, i.e. 6 ft 11 in — never "6 ft 12 in".'
      },
      commonValues: {
        title: 'Common heights, feet & inches to meters',
        dimension: 'length',
        from: 'ft',
        to: 'm',
        values: [5, 5.25, 5.5, 5.75, 6, 6.25, 6.5],
        feetInches: 'from',
        reverse: {
          title: 'Common meters to feet conversions',
          values: [1, 1.5, 2, 3, 5, 10, 50, 100],
          feetInches: 'to'
        }
      },
      watchOut: [
        { title: 'Round the total inches, not the feet', body: 'Splitting 6.89 ft into "6 ft 0.89 in" is wrong. Convert to total inches first (6.89 × 12 ≈ 82.68), round that, then split: 83 in is 6 ft 11 in.' },
        { title: 'Feet and inches is two units, not a decimal', body: '5.5 ft is 5 ft 6 in, not "5 ft 5 in" or 5.5 inches. Multiply the decimal part by 12 to get the inches.' },
        { title: 'The US survey foot is retired', body: 'Old land-survey measurements used a foot about 0.0002 m longer. NIST deprecated the US survey foot at the end of 2022; today every foot is the 0.3048 m international foot.' },
        { title: 'Meters and yards are close but different', body: 'A meter (about 3.2808 ft) is about 9% longer than a yard (3 ft). Do not mix them up when reading European versus American measurements.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
        { label: 'NIST, U.S. survey foot (deprecated after December 31, 2022)', url: 'https://www.nist.gov/pml/us-surveyfoot' }
      ]
    },
    inputs: [
      { id: 'feet', label: 'Feet', type: 'number', placeholder: '6', defaultValue: 6, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Feet to Meters Converter (ft to m)',
      description: 'Free feet to meters converter: ft to m and back as you type, with the exact 0.3048 factor, common heights in ft and in, and a worked example.',
      faq: [
        { question: 'How do I convert feet to meters?', answer: 'Multiply by 0.3048. 9 ft × 0.3048 = 2.74 m (rounded).' },
        { question: 'How do I convert meters to feet?', answer: 'Divide by 0.3048, or multiply by about 3.28084. 2 m is about 6.56 ft.' },
        { question: 'How tall is 6 feet in meters?', answer: '6 × 0.3048 = 1.8288 m, about 1.83 m.' },
        { question: 'How do I convert feet and inches to meters?', answer: 'Add the inches as a fraction of a foot first (inches ÷ 12), then multiply the total by 0.3048. 5 ft 9 in is 5.75 ft, which is about 1.75 m.' },
        { question: 'What is 2 meters in feet and inches?', answer: 'About 6.56 ft: 2 ÷ 0.3048 = 6.5617 ft, which is 78.74 in, rounding to 79 in, or 6 ft 7 in.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply feet by 0.3 for a rough meters figure (9 ft gives 2.7 m against 2.74 exactly), or meters by 3.3 for feet.' }
      ]
    },
    compute(values) {
      const meters = fromBase(toBase(values.feet, 'length', 'ft'), 'length', 'm');
      return { meters };
    }
  },
  {
    id: 'ounces-to-milliliters-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['oz to ml converter', 'fluid ounces to ml calculator', 'ml to oz converter', 'convert fl oz to ml'],
    related: ['gallons-to-liters-converter', 'grams-to-ounces-converter', 'water-intake-calculator', 'pounds-to-kilograms-converter'],
    title: 'Ounces to Milliliters Converter',
    description: 'Convert US fluid ounces to milliliters, or milliliters to fluid ounces, as you type. UK (imperial) fluid ounces are in the unit menu too.',
    example: '1 US fl oz is about 29.57 mL, and a 12 fl oz can of soda is about 354.88 mL.',
    solver: {
      defaultTarget: 'milliliters',
      variables: [
        { id: 'milliliters', label: 'Milliliters', symbol: 'mL', dimension: 'volume', defaultValue: 29.5735, defaultUnit: 'mL' },
        { id: 'ounces', label: 'Fluid ounces', symbol: 'fl oz', dimension: 'volume', defaultValue: 1, defaultUnit: 'floz' }
      ],
      // Both fields hold the same volume (in m³); the unit menus do the converting.
      solve: {
        milliliters: ({ ounces }) => (ounces >= 0 ? ounces : NaN),
        ounces: ({ milliliters }) => (milliliters >= 0 ? milliliters : NaN)
      },
      derive: (si) => ({ mlShown: si.milliliters * 1e6 }),
      visuals: [
        {
          type: 'logScale',
          value: 'mlShown',
          min: 0,
          max: 4,
          ticks: ['1 mL', '10 mL', '100 mL', '1,000 mL', '10,000 mL'],
          benchmarks: [
            { label: '1 US fl oz', value: 29.5735295625 },
            { label: 'A 1.5 fl oz shot', value: 44.3602943438 },
            { label: 'A 12 fl oz can', value: 354.882354750 },
            { label: 'A 1-liter bottle', value: 1000 }
          ],
          title: 'How much is that?',
          valueLabel: 'Your volume'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'US fluid ounces, UK fluid ounces and milliliters',
        paragraphs: [
          'The fluid ounce measures volume, not weight, despite sharing a name with the ounce of mass. The US fluid ounce is defined from the US gallon: a gallon is 128 US fluid ounces, which makes one US fl oz exactly 29.5735295625 milliliters. Milliliters and liters are the metric units used for drinks, medicine doses and recipes almost everywhere else.',
          'The UK (imperial) fluid ounce is a different size. An imperial gallon holds 160 imperial fluid ounces, making one UK fl oz exactly 28.4130625 milliliters, about 4% smaller than the US fluid ounce. The difference matters for recipes and drink sizes from the UK, Canada, Australia and other countries that historically used imperial measures.',
          'Because both definitions are exact, converting is one multiplication or division with no offset. A US cup is 8 US fluid ounces (about 236.6 mL), and a "standard" US shot is commonly 1.5 fl oz (about 44.4 mL), though some states and recipes use 1 or 2 fl oz instead.'
        ]
      },
      howTo: {
        intro: 'Type a volume in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Fluid ounces to milliliters', text: 'Type the number of fluid ounces. The milliliters field shows the conversion.' },
          { name: 'Pick US or UK fluid ounces', text: 'The ounces field starts in US fl oz. Choose fl oz (UK) from its menu for imperial fluid ounces.' },
          { name: 'Milliliters to fluid ounces', text: 'Type into the milliliters field instead. It becomes the input and the ounces field is calculated.' },
          { name: 'Use other units', text: 'Either menu also offers liters, cups, tablespoons and teaspoons.' },
          { name: 'Read the scale', text: 'The scale places the volume against a shot, a can of soda and a liter bottle.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each fluid ounce is a fixed number of milliliters, so the conversion is one multiplication or division.',
        expression: 'mL = fl oz (US) × 29.5735295625\nmL = fl oz (UK) × 28.4130625\nfl oz (US) = mL ÷ 29.5735295625',
        terms: [
          { symbol: 'mL', meaning: 'Volume in milliliters.' },
          { symbol: 'fl oz (US)', meaning: 'US fluid ounce, 1/128 of a US gallon.' },
          { symbol: 'fl oz (UK)', meaning: 'Imperial fluid ounce, 1/160 of an imperial gallon.' },
          { symbol: '29.5735295625', meaning: 'Milliliters in a US fluid ounce, exact.' }
        ],
        note: 'Both factors are exact definitions. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A recipe calls for 8 fl oz of milk, and your measuring cup is marked in milliliters. How many milliliters is that, and how many US fl oz is a 500 mL bottle?',
        rows: [
          { label: '8 × 29.5735295625', value: '236.59 mL' },
          { label: '500 ÷ 29.5735295625', value: '16.91 fl oz' },
          { label: 'Quick check: 8 × 30', value: '240 mL' }
        ],
        result: '8 US fl oz ≈ 236.59 mL · 500 mL ≈ 16.91 US fl oz',
        explanation: 'Multiplying by 30 instead of 29.57 is a handy shortcut and overstates by about 1.5%.'
      },
      commonValues: {
        title: 'Common US fluid ounces to milliliters conversions',
        dimension: 'volume',
        from: 'floz',
        to: 'mL',
        values: [1, 2, 4, 8, 12, 16, 20, 32],
        decimals: 1,
        reverse: {
          title: 'Common milliliters to US fluid ounces conversions',
          values: [50, 100, 250, 355, 500, 750, 1000]
        }
      },
      watchOut: [
        { title: 'US and UK fluid ounces differ', body: 'A US fl oz (29.57 mL) is about 4% larger than a UK fl oz (28.41 mL). Using the wrong one on an imported recipe or bottle size will be off by that much.' },
        { title: 'Fluid ounces are volume, not weight', body: 'An ounce of water weighs close to 1 fl oz by volume only because water is close to 1 g/mL. For other liquids, oz (mass) and fl oz (volume) are not interchangeable — see the grams to ounces converter for mass.' },
        { title: 'Shot sizes vary', body: 'A "standard" shot is commonly 1.5 fl oz in the US, but some places pour 1 fl oz or 2 fl oz. Check the local standard before converting a recipe by shots.' },
        { title: 'Cups are not standardized worldwide', body: 'A US cup is 8 US fl oz (about 237 mL); a metric cup (used in Australia and parts of Europe) is 250 mL exactly, a different unit, not a rounding of the US cup.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'ounces', label: 'Fluid ounces', type: 'number', placeholder: '1', defaultValue: 1, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Ounces to Milliliters Converter (fl oz to mL)',
      description: 'Free fluid ounces to milliliters converter: US or UK fl oz to mL and back as you type, with the exact factors and a worked example.',
      faq: [
        { question: 'How many milliliters are in a fluid ounce?', answer: 'A US fluid ounce is exactly 29.5735295625 mL, about 29.57 mL. A UK (imperial) fluid ounce is exactly 28.4130625 mL.' },
        { question: 'How do I convert fluid ounces to milliliters?', answer: 'Multiply US fl oz by 29.5735295625. For 8 fl oz: 8 × 29.5735295625 ≈ 236.59 mL.' },
        { question: 'How do I convert milliliters to fluid ounces?', answer: 'Divide by 29.5735295625 for US fl oz. 500 mL is about 16.91 US fl oz, or 17.60 UK fl oz.' },
        { question: 'How many fluid ounces are in a cup?', answer: 'A US cup is 8 US fl oz, about 236.59 mL. A metric cup is 250 mL, about 8.45 US fl oz.' },
        { question: 'Why is a UK fluid ounce smaller than a US fluid ounce?', answer: 'They come from different gallons. The US gallon divides into 128 fl oz; the larger imperial gallon divides into 160 fl oz, so each imperial fl oz ends up smaller even though the gallon itself is bigger.' },
        { question: 'How many milliliters are in a 12 fl oz can?', answer: 'About 354.88 mL for a US fl oz can, or 340.96 mL if the can is measured in UK fl oz.' }
      ]
    },
    compute(values) {
      const milliliters = fromBase(toBase(values.ounces, 'volume', 'floz'), 'volume', 'mL');
      return { milliliters };
    }
  },
  {
    id: 'grams-to-ounces-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['g to oz converter', 'grams to ounces calculator', 'oz to grams converter', 'convert grams to ounces'],
    related: ['pounds-to-kilograms-converter', 'ounces-to-milliliters-converter', 'miles-to-kilometers-converter', 'water-intake-calculator'],
    title: 'Grams to Ounces Converter',
    description: 'Convert grams to ounces, or ounces to grams, as you type. Uses the everyday avoirdupois ounce, the same one the pounds to kilograms converter uses.',
    example: '100 g is about 3.53 oz, and a 1 oz slice is about 28.35 g.',
    solver: {
      defaultTarget: 'ounces',
      variables: [
        { id: 'grams', label: 'Grams', symbol: 'g', dimension: 'mass', defaultValue: 100, defaultUnit: 'g' },
        { id: 'ounces', label: 'Ounces', symbol: 'oz', dimension: 'mass', defaultValue: 3.5274, defaultUnit: 'oz' }
      ],
      // Both fields hold the same mass (in kg); the unit menus do the converting.
      solve: {
        grams: ({ ounces }) => (ounces >= 0 ? ounces : NaN),
        ounces: ({ grams }) => (grams >= 0 ? grams : NaN)
      },
      derive: (si) => ({ gShown: si.grams * 1000 }),
      visuals: [
        {
          type: 'logScale',
          value: 'gShown',
          min: -1,
          max: 3,
          ticks: ['0.1 g', '1 g', '10 g', '100 g', '1,000 g'],
          benchmarks: [
            { label: '1 oz', value: 28.349523125 },
            { label: '4 oz (1/4 lb)', value: 113.398092500 },
            { label: '8 oz (1/2 lb)', value: 226.796185000 },
            { label: '16 oz (1 lb)', value: 453.59237 }
          ],
          title: 'How heavy is that?',
          valueLabel: 'Your weight'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Grams and ounces',
        paragraphs: [
          'The gram is a metric unit of mass, one thousandth of a kilogram, used for small weights like food portions and postage. The everyday ounce, used in the US for cooking, mail and packaging, is the avoirdupois ounce: 1/16 of the avoirdupois pound. Since 1959, the pound has been defined from the kilogram, which makes one avoirdupois ounce exactly 28.349523125 grams.',
          'Because the definition is exact, converting is one multiplication or division with no offset. One gram is about 0.0353 oz, so a quick way to think about it is that an ounce is a bit over 28 grams. This converter uses the everyday avoirdupois ounce, the same one the pounds to kilograms converter uses for body weight and shipping.',
          'A different, heavier ounce — the troy ounce, about 31.1034768 g — is used only for precious metals like gold and silver, never for food or body weight. Mixing the two is a common mistake: a troy ounce of gold weighs about 10% more than an avoirdupois ounce of the same number.'
        ]
      },
      howTo: {
        intro: 'Type a weight in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Grams to ounces', text: 'Type the weight in grams. The ounces field shows the conversion.' },
          { name: 'Ounces to grams', text: 'Type into the ounces field instead. It becomes the input and the grams field is calculated.' },
          { name: 'Use other units', text: 'Either menu also offers kilograms, pounds and stone.' },
          { name: 'Read the scale', text: 'The scale places the weight against 1, 4, 8 and 16 ounces.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'An ounce is a fixed number of grams, so the conversion is one multiplication or division.',
        expression: 'oz = g ÷ 28.349523125\ng = oz × 28.349523125',
        terms: [
          { symbol: 'g', meaning: 'Mass in grams.' },
          { symbol: 'oz', meaning: 'Mass in avoirdupois ounces, 1/16 pound.' },
          { symbol: '28.349523125', meaning: 'Grams in an ounce, exact: 0.45359237 kg ÷ 16 × 1,000.' }
        ],
        note: 'The factor is exact. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A recipe calls for 100 g of flour and your kitchen scale only shows ounces. How many ounces is that, and how many grams is a standard 8 oz package?',
        rows: [
          { label: '100 ÷ 28.349523125', value: '3.53 oz' },
          { label: '8 × 28.349523125', value: '226.80 g' },
          { label: 'Quick check: 100 × 0.035', value: '3.5 oz' }
        ],
        result: '100 g ≈ 3.53 oz · 8 oz = 226.80 g',
        explanation: 'Multiplying by 0.035 instead of dividing by 28.35 is a close shortcut, under 1% off.'
      },
      commonValues: {
        title: 'Common grams to ounces conversions',
        dimension: 'mass',
        from: 'g',
        to: 'oz',
        values: [1, 5, 10, 28.35, 50, 100, 250, 500, 1000],
        reverse: {
          title: 'Common ounces to grams conversions',
          values: [1, 2, 4, 8, 16]
        }
      },
      watchOut: [
        { title: 'This is the everyday ounce, not the troy ounce', body: 'Gold, silver and other precious metals are priced per troy ounce (about 31.10 g), roughly 10% heavier than the avoirdupois ounce (28.35 g) this converter uses.' },
        { title: 'Fluid ounces are a different unit entirely', body: 'An ounce of mass (weight) is not the same as a fluid ounce of volume. Use the ounces to milliliters converter for liquid volumes.' },
        { title: 'Kitchen scales round', body: 'Most digital kitchen scales show whole or half grams, so a converted figure like 3.53 oz will usually be read off the scale as 3.5 oz.' },
        { title: 'Package labels round too', body: 'A "100 g" package is usually close to, not exactly, 100.00 g, and a US "4 oz" package is often labeled with its rounded metric equivalent (113 g) alongside it.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'grams', label: 'Grams', type: 'number', placeholder: '100', defaultValue: 100, step: 1, min: 0 }
    ],
    seo: {
      title: 'Grams to Ounces Converter (g to oz)',
      description: 'Free grams to ounces converter: g to oz and back as you type, using the everyday avoirdupois ounce, with the exact factor and a worked example.',
      faq: [
        { question: 'How do I convert grams to ounces?', answer: 'Divide by 28.349523125. For 100 g: 100 ÷ 28.349523125 ≈ 3.53 oz.' },
        { question: 'How do I convert ounces to grams?', answer: 'Multiply by 28.349523125. 8 oz × 28.349523125 ≈ 226.80 g.' },
        { question: 'How many grams are in a pound?', answer: '453.59237 g, since a pound is 16 ounces and an ounce is 28.349523125 g.' },
        { question: 'Is this the same ounce used for gold?', answer: 'No. Gold and other precious metals use the troy ounce (about 31.1034768 g), heavier than the everyday avoirdupois ounce (28.349523125 g) used here for food and body weight.' },
        { question: 'How many ounces is 250 g?', answer: 'About 8.82 oz (250 ÷ 28.349523125).' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Divide grams by 28, or multiply by 0.035, for a rough ounce figure. For grams, multiply ounces by 28.35.' }
      ]
    },
    compute(values) {
      const ounces = fromBase(toBase(values.grams, 'mass', 'g'), 'mass', 'oz');
      return { ounces };
    }
  },
  {
    id: 'mph-to-kph-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['mph to km/h converter', 'miles per hour to kph calculator', 'kph to mph converter', 'convert mph to kmh'],
    related: ['miles-to-kilometers-converter', 'running-pace-calculator', 'gas-cost-calculator', 'commute-cost-calculator'],
    title: 'Mph to Kph Converter',
    description: 'Convert miles per hour to kilometers per hour, or kph to mph, as you type.',
    example: '60 mph is about 96.56 km/h, and 100 km/h is about 62.14 mph.',
    solver: {
      defaultTarget: 'kph',
      variables: [
        { id: 'kph', label: 'Kilometers per hour', symbol: 'km/h', dimension: 'speed', defaultValue: 96.5606, defaultUnit: 'km/h' },
        { id: 'mph', label: 'Miles per hour', symbol: 'mph', dimension: 'speed', defaultValue: 60, defaultUnit: 'mph' }
      ],
      // Both fields hold the same speed (in m/s); the unit menus do the converting.
      solve: {
        kph: ({ mph }) => (mph >= 0 ? mph : NaN),
        mph: ({ kph }) => (kph >= 0 ? kph : NaN)
      },
      derive: (si) => ({ kphShown: si.kph * 3.6 }),
      visuals: [
        {
          type: 'logScale',
          value: 'kphShown',
          min: 0,
          max: 3,
          ticks: ['1 km/h', '10 km/h', '100 km/h', '1,000 km/h'],
          benchmarks: [
            { label: '1 knot (a nautical mile per hour)', value: 1.852 },
            { label: 'A brisk walking pace', value: 5 },
            { label: 'A typical urban speed limit', value: 50 },
            { label: 'A typical highway speed', value: 100 }
          ],
          title: 'How fast is that?',
          valueLabel: 'Your speed'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Miles per hour and kilometers per hour',
        paragraphs: [
          'Miles per hour (mph) is the customary speed unit used for road speeds and speed limits in the US and the UK. Kilometers per hour (km/h or kph) is the metric equivalent used almost everywhere else, including on car speedometers worldwide, which is why most cars sold internationally show both scales.',
          'Speed is distance divided by time, so converting it uses the same exact factor as the distance itself: a mile is exactly 1.609344 kilometers, and an hour is an hour either way, so 1 mph is exactly 1.609344 km/h. There is no separate "speed factor" to remember beyond the one already used for miles to kilometers.',
          'Because the hours cancel, the conversion is one multiplication or division with no offset, the same as the miles to kilometers converter. 60 mph, a common US highway speed, is about 96.56 km/h; 100 km/h, a common highway speed outside the US, is about 62.14 mph.'
        ]
      },
      howTo: {
        intro: 'Type a speed in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Mph to km/h', text: 'Type the speed in miles per hour. The km/h field shows the conversion.' },
          { name: 'Km/h to mph', text: 'Type into the km/h field instead. It becomes the input and the mph field is calculated.' },
          { name: 'Use other units', text: 'Either menu also offers meters per second, knots and feet per second.' },
          { name: 'Read the scale', text: 'The scale places the speed against a brisk walk, a knot, a city speed limit and a highway speed.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A mile per hour is a fixed number of kilometers per hour, so the conversion is one multiplication or division.',
        expression: 'km/h = mph × 1.609344\nmph = km/h ÷ 1.609344 ≈ km/h × 0.621371',
        terms: [
          { symbol: 'mph', meaning: 'Speed in miles per hour.' },
          { symbol: 'km/h', meaning: 'Speed in kilometers per hour.' },
          { symbol: '1.609344', meaning: 'Kilometers in a mile, exact — the same factor the miles to kilometers converter uses.' }
        ],
        note: 'The factor is exact. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A speed limit sign reads 65 mph and another reads 110 km/h. How fast is each in the other unit?',
        rows: [
          { label: '65 × 1.609344', value: '104.61 km/h' },
          { label: '110 ÷ 1.609344', value: '68.35 mph' },
          { label: 'Quick check: 65 × 1.6', value: '104 km/h' }
        ],
        result: '65 mph ≈ 104.61 km/h · 110 km/h ≈ 68.35 mph',
        explanation: 'Multiplying by 1.6 is a close shortcut, under 0.6% low; dividing by 1.6 (or multiplying by 0.625) works about as well the other way.'
      },
      commonValues: {
        title: 'Common mph to km/h conversions',
        dimension: 'speed',
        from: 'mph',
        to: 'km/h',
        values: [10, 20, 30, 40, 50, 55, 60, 65, 70, 100],
        decimals: 1,
        reverse: {
          title: 'Common km/h to mph conversions',
          values: [20, 40, 50, 60, 80, 100, 110, 120, 130]
        }
      },
      watchOut: [
        { title: 'Knots are a different unit', body: 'A knot is 1 nautical mile per hour (1.852 km/h), used at sea and in the air, not the same as a mile per hour (1.609344 km/h).' },
        { title: 'Speed limits are posted in whole units', body: 'A sign reading "100 km/h" converts to 62.14 mph, not a round number, so don’t expect foreign speed limits to match familiar mph figures exactly.' },
        { title: 'This converts a rate, not a distance', body: 'Converting mph to km/h uses the same 1.609344 factor as miles to km, but it is a different physical quantity (speed, not distance) — see the miles to kilometers converter for distances.' },
        { title: 'Speedometers can read a little fast', body: 'Many car speedometers read a few percent fast for mechanical and legal-tolerance reasons, so a car\'s displayed speed and a converted GPS speed will not always match exactly.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'mph', label: 'Miles per hour', type: 'number', placeholder: '60', defaultValue: 60, step: 1, min: 0 }
    ],
    seo: {
      title: 'Mph to Kph Converter (mph to km/h)',
      description: 'Free mph to km/h converter: miles per hour to kilometers per hour and back as you type, with the exact 1.609344 factor and a worked example.',
      faq: [
        { question: 'How do I convert mph to km/h?', answer: 'Multiply by 1.609344. For 65 mph: 65 × 1.609344 ≈ 104.61 km/h.' },
        { question: 'How do I convert km/h to mph?', answer: 'Divide by 1.609344, or multiply by about 0.621371. 110 km/h is about 68.35 mph.' },
        { question: 'What is 60 mph in km/h?', answer: 'About 96.56 km/h (60 × 1.609344).' },
        { question: 'What is 100 km/h in mph?', answer: 'About 62.14 mph (100 ÷ 1.609344).' },
        { question: 'Is a knot the same as a mph?', answer: 'No. A knot is 1 nautical mile per hour, 1.852 km/h, slightly faster than 1 mph (1.609344 km/h).' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply mph by 1.6 for km/h, or km/h by 0.625 (5/8) for mph — the same shortcuts as miles to kilometers.' }
      ]
    },
    compute(values) {
      const kph = fromBase(toBase(values.mph, 'speed', 'mph'), 'speed', 'km/h');
      return { kph };
    }
  },
  {
    id: 'length-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['length converter', 'distance converter', 'metric to imperial length converter', 'convert meters to feet', 'unit length converter'],
    related: ['feet-to-meters-converter', 'miles-to-kilometers-converter', 'centimeters-to-inches-converter', 'area-converter'],
    title: 'Length Converter',
    description: 'Convert between meters, feet, kilometers, miles, yards, inches, centimeters, millimeters and nautical miles, in any direction, as you type.',
    example: '1 meter is about 3.28 feet, and 100 yards (an American football field) is 91.44 meters.',
    solver: {
      defaultTarget: 'feet',
      variables: [
        { id: 'meters', label: 'Meters', symbol: 'm', dimension: 'length', defaultValue: 1, defaultUnit: 'm' },
        { id: 'feet', label: 'Feet', symbol: 'ft', dimension: 'length', defaultValue: 3.2808, defaultUnit: 'ft' }
      ],
      // Both fields hold the same length (in meters); the unit menus already list every length
      // unit in lib/units.ts (m, km, cm, mm, mi, yd, ft, in, nmi), so either menu is a full length converter.
      solve: {
        meters: ({ feet }) => (feet >= 0 ? feet : NaN),
        feet: ({ meters }) => (meters >= 0 ? meters : NaN)
      },
      derive: (si) => ({ mShown: si.meters }),
      visuals: [
        {
          type: 'logScale',
          value: 'mShown',
          min: -1,
          max: 3,
          ticks: ['0.1 m', '1 m', '10 m', '100 m', '1,000 m'],
          benchmarks: [
            { label: 'A sheet of A4 paper (length)', value: 0.297 },
            { label: 'A standard interior door height', value: 2.032 },
            { label: 'A 100-yard American football field', value: 91.44 },
            { label: '1 kilometer', value: 1000 }
          ],
          title: 'How long is that?',
          valueLabel: 'Your length'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Length, metric and customary',
        paragraphs: [
          'Length is the most common thing people convert, because the world uses two different systems side by side. Almost every country measures length in meters, kilometers, centimeters and millimeters, the metric (SI) units built on powers of ten. The US, and parts of the UK, still use feet, inches, yards and miles for everyday things: height, room sizes, road distances and construction.',
          'Every customary unit in use today is defined exactly from the meter, not the other way around. Since 1959, the international yard has been exactly 0.9144 m, which fixes the foot at 0.3048 m, the inch at 0.0254 m, and the mile (5,280 ft) at exactly 1,609.344 m. That means converting any of them is a single, exact multiplication or division — nothing is rounded except the number you see on screen.',
          'This page is the general case: any field can take any length unit, from millimeters up to nautical miles, so you can go straight from, say, yards to centimeters without stopping at meters first. For a specific everyday pair with its own worked table — miles and kilometers, feet and meters, or centimeters and inches — the dedicated converters linked below go deeper on that one pair.'
        ]
      },
      howTo: {
        intro: 'Type a length in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pick your starting unit', text: 'Open the unit menu beside the first field and choose meters, feet, kilometers, miles, yards, inches, centimeters, millimeters or nautical miles.' },
          { name: 'Type the length', text: 'Enter the number. The other field recalculates immediately.' },
          { name: 'Change the target unit', text: 'Open the second field\'s menu to see the same length in any other unit — it converts again with no extra step.' },
          { name: 'Read the scale', text: 'The scale places your length against a sheet of paper, a doorway, a football field and a kilometer.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every length unit here reduces to meters first, then to the target unit — the same two steps regardless of which units you pick.',
        expression: 'meters = value × factor(unit)\nresult = meters ÷ factor(target unit)',
        terms: [
          { symbol: 'factor(unit)', meaning: 'Meters per unit, exact: 1,000 for km, 0.3048 for ft, 0.0254 for in, 1,609.344 for mi, 0.9144 for yd, 1,852 for nmi.' },
          { symbol: 'meters', meaning: 'The length in the base SI unit, used internally for every conversion.' }
        ],
        note: 'Every factor above is an exact definition, not a measurement, so results are rounded for display only, never for the underlying math.'
      },
      workedExample: {
        intro: 'You measure a room at 25 m and a rug at 100 ft. How long is each in the other unit?',
        rows: [
          { label: '25 ÷ 0.3048', value: '82.02 ft' },
          { label: '100 × 0.3048', value: '30.48 m' },
          { label: 'Quick check: 25 × 3.28', value: '≈ 82 ft' }
        ],
        result: '25 m ≈ 82.02 ft · 100 ft = 30.48 m',
        explanation: 'Multiplying by 3.28 instead of the exact 3.280840 is within about 0.03%, close enough for most everyday checks.'
      },
      commonValues: {
        title: 'Common meters to feet conversions',
        dimension: 'length',
        from: 'm',
        to: 'ft',
        values: [1, 2, 3, 5, 10, 20, 50, 100],
        reverse: {
          title: 'Common feet to meters conversions',
          values: [1, 3, 6, 10, 20, 50, 100]
        }
      },
      watchOut: [
        { title: 'Pick the right unit before you type', body: 'Each field remembers its own unit. If you meant to type centimeters but the menu still says meters, the result will be off by a factor of 100.' },
        { title: 'Feet and inches is two units, not a decimal', body: '5.5 ft is 5 ft 6 in, not "5 ft 5 in". For a height already written as feet and inches, see the centimeters to inches or feet to meters converters, which handle the split.' },
        { title: 'Nautical miles are not statute miles', body: 'A nautical mile is exactly 1,852 m, about 1.151 times a statute mile (1,609.344 m). Used at sea and in the air, not on roads.' },
        { title: 'The US survey foot is retired', body: 'Old land-survey figures used a foot about 0.0002 m longer than today\'s. NIST deprecated the US survey foot at the end of 2022; every foot here is the 0.3048 m international foot.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'meters', label: 'Meters', type: 'number', placeholder: '1', defaultValue: 1, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Length Converter (m, ft, km, mi, in, yd, cm)',
      description: 'Free length converter: meters, feet, kilometers, miles, yards, inches, centimeters and millimeters, in any direction, with exact factors.',
      faq: [
        { question: 'How do I convert meters to feet?', answer: 'Multiply by about 3.28084 (or divide by 0.3048). For 25 m: 25 ÷ 0.3048 ≈ 82.02 ft.' },
        { question: 'How do I convert feet to meters?', answer: 'Multiply by 0.3048. 100 ft × 0.3048 = 30.48 m.' },
        { question: 'How many feet are in a mile?', answer: 'A mile is 5,280 ft, exactly 1,609.344 m — the same exact factor the miles to kilometers converter uses.' },
        { question: 'How many meters are in a yard?', answer: 'A yard is exactly 0.9144 m, or 3 ft.' },
        { question: 'What is 1 meter in feet and inches?', answer: 'About 3 ft 3.37 in: 1 m is 3.280840 ft, and 0.280840 ft × 12 ≈ 3.37 in.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply meters by 3.3 for a rough feet figure (about 0.6% high), or feet by 0.3 for meters (about 1.6% low).' }
      ]
    },
    compute(values) {
      const feet = fromBase(toBase(values.meters, 'length', 'm'), 'length', 'ft');
      return { feet };
    }
  },
  {
    id: 'weight-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['weight converter', 'mass converter', 'kg to lb converter', 'convert kilograms to pounds', 'weight unit converter'],
    related: ['pounds-to-kilograms-converter', 'grams-to-ounces-converter', 'bmi-calculator', 'volume-converter'],
    title: 'Weight Converter',
    description: 'Convert between kilograms, pounds, grams, ounces, stone and metric tonnes, in any direction, as you type.',
    example: '10 kilograms is about 22.05 pounds, and 75 kg (an average adult) is about 165.35 lb.',
    solver: {
      defaultTarget: 'pounds',
      variables: [
        { id: 'kilograms', label: 'Kilograms', symbol: 'kg', dimension: 'mass', defaultValue: 10, defaultUnit: 'kg' },
        { id: 'pounds', label: 'Pounds', symbol: 'lb', dimension: 'mass', defaultValue: 22.0462, defaultUnit: 'lb' }
      ],
      // Both fields hold the same mass (in kg); the unit menus already list every mass unit in
      // lib/units.ts (kg, g, t, lb, oz, st), so either menu is a full weight converter.
      solve: {
        kilograms: ({ pounds }) => (pounds >= 0 ? pounds : NaN),
        pounds: ({ kilograms }) => (kilograms >= 0 ? kilograms : NaN)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'kilograms',
          min: -1,
          max: 3,
          ticks: ['0.1 kg', '1 kg', '10 kg', '100 kg', '1,000 kg'],
          benchmarks: [
            { label: 'A newborn baby (about 3.5 kg)', value: 3.5 },
            { label: 'A typical airline checked-bag limit (23 kg)', value: 23 },
            { label: '100 kilograms', value: 100 },
            { label: '1 metric tonne', value: 1000 }
          ],
          title: 'How heavy is that?',
          valueLabel: 'Your weight'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Weight (mass) units, metric and customary',
        paragraphs: [
          'The kilogram is the SI base unit of mass, used for everyday weight almost everywhere in the world. The pound, used for body weight and shipping in the US and informally in the UK alongside the stone, is defined exactly from the kilogram: since 1959, one avoirdupois pound has been exactly 0.45359237 kg.',
          'Because that definition is exact, converting between any mass units here — kilograms, grams, metric tonnes, pounds, ounces or stone — is always a single multiplication or division with no rounding error of its own. A gram is a thousandth of a kilogram; an ounce is a sixteenth of a pound (about 28.35 g); a stone is 14 pounds (about 6.35 kg); a metric tonne is 1,000 kg.',
          'This page is the general case: any field can take any mass unit, so you can go straight from stone to grams without a middle step. For body weight specifically, the pounds to kilograms converter and the grams to ounces converter have their own worked tables and height/food-portion context.'
        ]
      },
      howTo: {
        intro: 'Type a weight in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pick your starting unit', text: 'Open the unit menu beside the first field and choose kilograms, pounds, grams, ounces, stone or metric tonnes.' },
          { name: 'Type the weight', text: 'Enter the number. The other field recalculates immediately.' },
          { name: 'Change the target unit', text: 'Open the second field\'s menu to see the same weight in any other unit.' },
          { name: 'Read the scale', text: 'The scale places your weight against a newborn baby, an airline bag limit and a metric tonne.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every mass unit here reduces to kilograms first, then to the target unit.',
        expression: 'kilograms = value × factor(unit)\nresult = kilograms ÷ factor(target unit)',
        terms: [
          { symbol: 'factor(unit)', meaning: 'Kilograms per unit, exact: 0.001 for g, 1,000 for t, 0.45359237 for lb, 0.028349523125 for oz, 6.35029318 for st.' },
          { symbol: 'kilograms', meaning: 'The mass in the base SI unit, used internally for every conversion.' }
        ],
        note: 'Everyday "weight" is really mass; a scale measures the force of gravity and reports it in kilograms or pounds, the right unit for food, luggage and body weight. See the force calculator for the physics distinction.'
      },
      workedExample: {
        intro: 'You weigh 75 kg and a package is labeled 200 lb. How much is each in the other unit?',
        rows: [
          { label: '75 ÷ 0.45359237', value: '165.35 lb' },
          { label: '200 × 0.45359237', value: '90.72 kg' },
          { label: 'Quick check: 75 × 2.2', value: '≈ 165 lb' }
        ],
        result: '75 kg ≈ 165.35 lb · 200 lb ≈ 90.72 kg',
        explanation: 'Multiplying by 2.2 instead of the exact 2.204623 is about 0.2% low; for pounds to kilograms, multiplying by 0.45 instead of 0.45359237 is about 0.8% low.'
      },
      commonValues: {
        title: 'Common kilograms to pounds conversions',
        dimension: 'mass',
        from: 'kg',
        to: 'lb',
        values: [1, 5, 10, 20, 50, 70, 100, 150],
        reverse: {
          title: 'Common pounds to kilograms conversions',
          values: [1, 10, 50, 100, 150, 200]
        }
      },
      watchOut: [
        { title: 'Mass and weight are not quite the same word', body: 'This converter and everyday scales measure mass. A newton (force due to gravity) is a different unit entirely — see the force calculator.' },
        { title: 'Tons come in three sizes', body: 'A US short ton is 2,000 lb (907.18 kg), a UK long ton 2,240 lb (1,016.05 kg) and a metric tonne 1,000 kg (2,204.62 lb). This converter uses the metric tonne.' },
        { title: 'Troy weights are for precious metals', body: 'Gold and silver are priced per troy ounce, about 31.10 g — heavier than the everyday avoirdupois ounce (28.35 g) this converter uses.' },
        { title: 'Stone and pounds are mixed units', body: '11 st 4 lb is not 11.4 stone; it is 11 + 4/14 ≈ 11.29 stone, or 158 lb. Convert to pounds first if you have a mixed figure.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'kilograms', label: 'Kilograms', type: 'number', placeholder: '10', defaultValue: 10, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Weight Converter (kg, lb, g, oz, stone, tonne)',
      description: 'Free weight converter: kilograms, pounds, grams, ounces, stone and metric tonnes, in any direction, with exact factors and a worked example.',
      faq: [
        { question: 'How do I convert kilograms to pounds?', answer: 'Multiply by about 2.204623 (or divide by 0.45359237). For 75 kg: 75 ÷ 0.45359237 ≈ 165.35 lb.' },
        { question: 'How do I convert pounds to kilograms?', answer: 'Multiply by 0.45359237. 200 lb × 0.45359237 ≈ 90.72 kg.' },
        { question: 'How many pounds are in a stone?', answer: 'A stone is 14 pounds, exactly 6.35029318 kg.' },
        { question: 'How many kilograms are in a metric tonne?', answer: 'Exactly 1,000 kg, about 2,204.62 lb.' },
        { question: 'What is the difference between mass and weight?', answer: 'Mass (kg, lb) is how much matter something has. Weight is the force of gravity on that mass, measured in newtons — see the force calculator.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply kilograms by 2.2 for a rough pounds figure (about 0.2% low), or pounds by 0.45 for kilograms (about 0.8% low).' }
      ]
    },
    compute(values) {
      const pounds = fromBase(toBase(values.kilograms, 'mass', 'kg'), 'mass', 'lb');
      return { pounds };
    }
  },
  {
    id: 'volume-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['volume converter', 'liters to gallons converter', 'convert volume units', 'volume unit converter', 'ml to liters converter'],
    related: ['gallons-to-liters-converter', 'ounces-to-milliliters-converter', 'water-intake-calculator', 'length-converter'],
    title: 'Volume Converter',
    description: 'Convert between liters, US and UK gallons, milliliters, cups, quarts, pints, tablespoons and cubic meters, in any direction, as you type.',
    example: '10 liters is about 2.64 US gallons, and 50 liters (a large travel case) is about 13.21 gallons.',
    solver: {
      defaultTarget: 'gallons',
      variables: [
        { id: 'liters', label: 'Liters', symbol: 'L', dimension: 'volume', defaultValue: 10, defaultUnit: 'L' },
        { id: 'gallons', label: 'Gallons', symbol: 'gal', dimension: 'volume', defaultValue: 2.6417, defaultUnit: 'gal' }
      ],
      // Both fields hold the same volume (in m³); the unit menus already list every volume unit in
      // lib/units.ts (m³, L, mL, US/UK gal, qt, pt, cup, fl oz, tbsp, tsp, ft³, yd³, in³), so either
      // menu is a full volume converter.
      solve: {
        liters: ({ gallons }) => (gallons >= 0 ? gallons : NaN),
        gallons: ({ liters }) => (liters >= 0 ? liters : NaN)
      },
      derive: (si) => ({ litersShown: si.liters * 1000 }),
      visuals: [
        {
          type: 'logScale',
          value: 'litersShown',
          min: -3,
          max: 3,
          ticks: ['0.001 L', '0.01 L', '0.1 L', '1 L', '10 L', '100 L', '1,000 L'],
          benchmarks: [
            { label: 'A teaspoon (about 5 mL)', value: 0.005 },
            { label: 'A 1-liter bottle', value: 1 },
            { label: 'A bathtub (about 150 L)', value: 150 },
            { label: '1 cubic meter (1,000 L)', value: 1000 }
          ],
          title: 'How much is that?',
          valueLabel: 'Your volume'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Volume units, metric and customary',
        paragraphs: [
          'The liter is a metric unit of volume, one cubic decimeter, used worldwide for drinks, fuel and recipes. The US gallon, used for fuel and large liquid volumes in the US, is defined as exactly 231 cubic inches, which is exactly 3.785411784 L. The imperial (UK) gallon is a different, larger unit, exactly 4.54609 L, used historically in the UK and the Commonwealth.',
          'Because both gallon definitions are exact, converting between any volume unit here — liters, milliliters, cubic meters, US or UK gallons, quarts, pints, cups, tablespoons or teaspoons — is always a single multiplication or division, with no offset. Smaller units follow their own gallon: a US gallon is 4 US quarts, 8 US pints, 16 US cups or 128 US fluid ounces; a UK gallon is 8 UK pints or 160 UK fluid ounces.',
          'This page is the general case: any field can take any volume unit, so you can go straight from UK pints to cubic meters without a middle step. For fuel volumes specifically or for drink and recipe measures, the gallons to liters converter and the ounces to milliliters converter have their own worked tables.'
        ]
      },
      howTo: {
        intro: 'Type a volume in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pick your starting unit', text: 'Open the unit menu beside the first field and choose liters, US or UK gallons, milliliters, cups, quarts, pints, tablespoons, teaspoons or cubic meters.' },
          { name: 'Type the volume', text: 'Enter the number. The other field recalculates immediately.' },
          { name: 'Change the target unit', text: 'Open the second field\'s menu to see the same volume in any other unit.' },
          { name: 'Read the scale', text: 'The scale places your volume against a teaspoon, a bottle, a bathtub and a cubic meter.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every volume unit here reduces to liters first, then to the target unit.',
        expression: 'liters = value × factor(unit)\nresult = liters ÷ factor(target unit)',
        terms: [
          { symbol: 'factor(unit)', meaning: 'Liters per unit, exact: 1,000 for m³, 0.001 for mL, 3.785411784 for US gal, 4.54609 for UK gal.' },
          { symbol: 'liters', meaning: 'The volume, scaled from the base SI unit (cubic meters), used internally for every conversion.' }
        ],
        note: 'Every factor above is an exact definition, not a measurement, so results are rounded for display only.'
      },
      workedExample: {
        intro: 'You need 50 liters of water for an event, and a container is marked in US gallons. How many gallons is that, and how many liters is a 15-gallon drum?',
        rows: [
          { label: '50 ÷ 3.785411784', value: '13.21 gal' },
          { label: '15 × 3.785411784', value: '56.78 L' },
          { label: 'Quick check: 50 × 0.26', value: '≈ 13 gal' }
        ],
        result: '50 L ≈ 13.21 gal · 15 gal ≈ 56.78 L',
        explanation: 'Multiplying by 0.26 instead of the exact 0.264172 is within about 1.6%; for gallons to liters, multiplying by 3.8 instead of 3.785412 is within about 0.4%.'
      },
      commonValues: {
        title: 'Common liters to gallons conversions',
        dimension: 'volume',
        from: 'L',
        to: 'gal',
        values: [1, 2, 5, 10, 20, 50, 100, 200],
        reverse: {
          title: 'Common gallons to liters conversions',
          values: [1, 2, 5, 10, 20, 55]
        }
      },
      watchOut: [
        { title: 'Know which gallon you have', body: 'An imperial (UK) gallon is about 20% bigger than a US gallon. Using the wrong factor understates or overstates a volume by that much.' },
        { title: 'Dry gallons are different again', body: 'The rarely used US dry gallon (about 4.405 L) is for grain and produce. This converter, like fuel and recipe figures, uses the 231 in³ liquid gallon.' },
        { title: 'Cups are not standardized worldwide', body: 'A US cup is 8 US fl oz (about 237 mL); a metric cup (used in Australia and parts of Europe) is exactly 250 mL, a different unit.' },
        { title: 'This converts volume, not mass', body: 'A liter of water weighs about 1 kg, but a liter of oil or syrup weighs something else. For mass, use the weight converter instead.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'liters', label: 'Liters', type: 'number', placeholder: '10', defaultValue: 10, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Volume Converter (L, gal, mL, cups, m³)',
      description: 'Free volume converter: liters, US and UK gallons, milliliters, cups, quarts, pints and cubic meters, in any direction, with exact factors.',
      faq: [
        { question: 'How do I convert liters to US gallons?', answer: 'Divide by 3.785411784 (or multiply by about 0.264172). For 50 L: 50 ÷ 3.785411784 ≈ 13.21 gal.' },
        { question: 'How do I convert US gallons to liters?', answer: 'Multiply by 3.785411784. 15 gal × 3.785411784 ≈ 56.78 L.' },
        { question: 'How many liters are in an imperial (UK) gallon?', answer: 'Exactly 4.54609 L, about 20% more than a US gallon (3.785411784 L).' },
        { question: 'How many milliliters are in a liter?', answer: '1,000 mL, since milli- means one-thousandth.' },
        { question: 'How many US gallons are in a cubic meter?', answer: '1 m³ is 1,000 L, about 264.17 US gallons.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply liters by 0.26 for a rough gallon figure (about 1.6% low), or gallons by 3.8 for liters (about 0.4% high).' }
      ]
    },
    compute(values) {
      const gallons = fromBase(toBase(values.liters, 'volume', 'L'), 'volume', 'gal');
      return { gallons };
    }
  },
  {
    id: 'area-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['area converter', 'square meters to square feet converter', 'convert area units', 'area unit converter'],
    related: ['length-converter', 'volume-converter', 'area-calculator', 'tile-calculator'],
    title: 'Area Converter',
    description: 'Convert between square meters, square feet, square kilometers, square miles, acres, hectares and square yards, in any direction, as you type.',
    example: '10 square meters is about 107.64 square feet, and a 1,500 sq ft apartment is about 139.35 square meters.',
    solver: {
      defaultTarget: 'squareFeet',
      variables: [
        { id: 'squareMeters', label: 'Square meters', symbol: 'm²', dimension: 'area', defaultValue: 10, defaultUnit: 'm2' },
        { id: 'squareFeet', label: 'Square feet', symbol: 'ft²', dimension: 'area', defaultValue: 107.6391, defaultUnit: 'ft2' }
      ],
      // Both fields hold the same area (in m²); the unit menus already list every area unit in
      // lib/units.ts (m², km², cm², mm², ha, mi², acre, yd², ft², in²), so either menu is a full
      // area converter.
      solve: {
        squareMeters: ({ squareFeet }) => (squareFeet >= 0 ? squareFeet : NaN),
        squareFeet: ({ squareMeters }) => (squareMeters >= 0 ? squareMeters : NaN)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'squareMeters',
          min: 0,
          max: 4,
          ticks: ['1 m²', '10 m²', '100 m²', '1,000 m²', '10,000 m²'],
          benchmarks: [
            { label: 'A standard parking space (about 15 m²)', value: 15 },
            { label: 'A tennis court (about 261 m²)', value: 261 },
            { label: 'A basketball court (420 m²)', value: 420 },
            { label: '1 hectare (10,000 m²)', value: 10000 }
          ],
          title: 'How big is that?',
          valueLabel: 'Your area'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Area units, metric and customary',
        paragraphs: [
          'Area measures the size of a surface — a room, a lot, a field — and every unit here is a length unit squared. The square meter, the SI unit, is used worldwide for room sizes and land. The square foot, used for US real estate listings, and the acre, used for larger lots and farmland, are the common customary units.',
          'Because every length unit this site uses is defined exactly (see the length converter), every area unit built from it is exact too: a square foot is exactly 0.3048² = 0.09290304 m², and an acre — 4,840 square yards by definition — is exactly 4,046.8564224 m². A hectare, the metric land unit, is defined as exactly 10,000 m², about 2.471 acres.',
          'This page is the general case: any field can take any area unit, so you can go straight from acres to square meters, or hectares to square feet, without a middle step. The dedicated area calculator, by contrast, computes the area of a shape (a rectangle, triangle or circle) from its own dimensions — this page only converts an area you already know.'
        ]
      },
      howTo: {
        intro: 'Type an area in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pick your starting unit', text: 'Open the unit menu beside the first field and choose square meters, square feet, square kilometers, square miles, acres, hectares, square yards, square centimeters or square inches.' },
          { name: 'Type the area', text: 'Enter the number. The other field recalculates immediately.' },
          { name: 'Change the target unit', text: 'Open the second field\'s menu to see the same area in any other unit.' },
          { name: 'Read the scale', text: 'The scale places your area against a parking space, a tennis court, a basketball court and a hectare.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every area unit here reduces to square meters first, then to the target unit.',
        expression: 'm² = value × factor(unit)\nresult = m² ÷ factor(target unit)',
        terms: [
          { symbol: 'factor(unit)', meaning: 'Square meters per unit, exact: 0.09290304 for ft², 4,046.8564224 for acre, 10,000 for ha, 1,000,000 for km².' },
          { symbol: 'm²', meaning: 'The area in the base SI unit, used internally for every conversion.' }
        ],
        note: 'Every factor above comes from squaring an exact length definition, so results are rounded for display only, never for the underlying math.'
      },
      workedExample: {
        intro: 'A room measures 20 m² and a listing advertises 1,500 sq ft. How big is each in the other unit?',
        rows: [
          { label: '20 ÷ 0.09290304', value: '215.28 ft²' },
          { label: '1,500 × 0.09290304', value: '139.35 m²' },
          { label: 'Quick check: 20 × 10.8', value: '≈ 216 ft²' }
        ],
        result: '20 m² ≈ 215.28 ft² · 1,500 ft² ≈ 139.35 m²',
        explanation: 'Multiplying by 10.8 instead of the exact 10.763910 overstates by about 0.3%; for square feet to square meters, multiplying by 0.093 instead of 0.09290304 overstates by about 0.1%.'
      },
      commonValues: {
        title: 'Common square meters to square feet conversions',
        dimension: 'area',
        from: 'm2',
        to: 'ft2',
        values: [1, 5, 10, 20, 50, 100, 200, 500],
        reverse: {
          title: 'Common square feet to square meters conversions',
          values: [100, 500, 1000, 2000, 5000, 10000]
        }
      },
      watchOut: [
        { title: 'This converts area, not length', body: 'Doubling a length quadruples its area. Converting an area with the plain length factor (0.3048 instead of 0.09290304 for feet) gives an answer off by that same factor.' },
        { title: 'The acre is not a square', body: 'An acre (4,840 yd²) is a unit of area with no fixed shape, historically the area a team of oxen could plow in a day. A square acre would be about 69.57 yd (208.7 ft) on each side.' },
        { title: 'Hectares and acres are both land units, not the same size', body: '1 hectare (10,000 m²) is about 2.471 acres, so dividing a hectare figure straight by 1 acre\'s number understates the land area.' },
        { title: 'US survey acres differ very slightly', body: 'Some older US land records use the US survey acre, based on the now-retired US survey foot, about 4 parts per million larger than the international acre this converter uses.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'squareMeters', label: 'Square meters', type: 'number', placeholder: '10', defaultValue: 10, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Area Converter (m², ft², acres, hectares)',
      description: 'Free area converter: square meters, square feet, acres, hectares, square kilometers and square miles, in any direction, with exact factors.',
      faq: [
        { question: 'How do I convert square meters to square feet?', answer: 'Multiply by about 10.763910 (or divide by 0.09290304). For 20 m²: 20 ÷ 0.09290304 ≈ 215.28 ft².' },
        { question: 'How do I convert square feet to square meters?', answer: 'Multiply by 0.09290304. 1,500 ft² × 0.09290304 ≈ 139.35 m².' },
        { question: 'How many square feet are in an acre?', answer: 'An acre is 4,840 yd², exactly 43,560 ft².' },
        { question: 'How many square meters are in a hectare?', answer: 'Exactly 10,000 m², about 2.471 acres or 107,639.10 ft².' },
        { question: 'How do I convert square meters to acres?', answer: 'Divide by 4,046.8564224. 10,000 m² is about 2.471 acres.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply square meters by about 10.8 for square feet (about 0.3% high), or square feet by about 0.093 for square meters (about 0.1% high).' }
      ]
    },
    compute(values) {
      const squareFeet = fromBase(toBase(values.squareMeters, 'area', 'm2'), 'area', 'ft2');
      return { squareFeet };
    }
  },
  {
    id: 'speed-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['speed converter', 'meters per second to km/h converter', 'convert speed units', 'velocity converter', 'mph to m/s converter'],
    related: ['mph-to-kph-converter', 'running-pace-calculator', 'length-converter', 'gas-cost-calculator'],
    title: 'Speed Converter',
    description: 'Convert between meters per second, kilometers per hour, miles per hour, knots and feet per second, in any direction, as you type.',
    example: '10 meters per second is exactly 36 km/h, and 15 m/s (a fast cyclist) is 54 km/h.',
    solver: {
      defaultTarget: 'kph',
      variables: [
        { id: 'metersPerSecond', label: 'Meters per second', symbol: 'm/s', dimension: 'speed', defaultValue: 10, defaultUnit: 'm/s' },
        { id: 'kph', label: 'Kilometers per hour', symbol: 'km/h', dimension: 'speed', defaultValue: 36, defaultUnit: 'km/h' }
      ],
      // Both fields hold the same speed (in m/s); the unit menus already list every speed unit in
      // lib/units.ts (m/s, km/h, mph, kn, ft/s), so either menu is a full speed converter.
      solve: {
        metersPerSecond: ({ kph }) => (kph >= 0 ? kph : NaN),
        kph: ({ metersPerSecond }) => (metersPerSecond >= 0 ? metersPerSecond : NaN)
      },
      derive: (si) => ({ kphShown: si.metersPerSecond * 3.6 }),
      visuals: [
        {
          type: 'logScale',
          value: 'kphShown',
          min: 0,
          max: 4,
          ticks: ['1 km/h', '10 km/h', '100 km/h', '1,000 km/h', '10,000 km/h'],
          benchmarks: [
            { label: 'A brisk walk (about 6 km/h)', value: 6 },
            { label: 'A typical highway speed (about 110 km/h)', value: 110 },
            { label: 'A high-speed train (about 300 km/h)', value: 300 },
            { label: 'The speed of sound at sea level (about 1,225 km/h)', value: 1225.044 }
          ],
          title: 'How fast is that?',
          valueLabel: 'Your speed'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Speed units, metric and customary',
        paragraphs: [
          'Speed is distance divided by time, so every speed unit here comes from a length unit and a time unit together. Meters per second is the SI combination, used in physics and engineering. Kilometers per hour is the everyday metric speed used almost everywhere for driving and weather; miles per hour is its customary counterpart, used in the US and the UK.',
          'Because a kilometer and an hour are each defined exactly, the conversion between meters per second and kilometers per hour is exact too, with no rounded physical constant involved: 1 m/s means 1 m every second, which is 3,600 m every hour, which is 3.6 km every hour — so 1 m/s = 3.6 km/h, exactly. Miles per hour and knots bring in the mile (1,609.344 m, exact) and the nautical mile (1,852 m, exact), so those conversions are exact too, just with a less convenient-looking factor.',
          'This page is the general case: any field can take any speed unit, from a walking pace in m/s up to a nautical speed in knots. For the mile-and-kilometer pair specifically, with its own worked table of common road speeds, see the mph to km/h converter.'
        ]
      },
      howTo: {
        intro: 'Type a speed in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pick your starting unit', text: 'Open the unit menu beside the first field and choose meters per second, kilometers per hour, miles per hour, knots or feet per second.' },
          { name: 'Type the speed', text: 'Enter the number. The other field recalculates immediately.' },
          { name: 'Change the target unit', text: 'Open the second field\'s menu to see the same speed in any other unit.' },
          { name: 'Read the scale', text: 'The scale places your speed against a brisk walk, a highway, a high-speed train and the speed of sound.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every speed unit here reduces to meters per second first, then to the target unit.',
        expression: 'm/s = value × factor(unit)\nresult = m/s ÷ factor(target unit)',
        terms: [
          { symbol: 'factor(unit)', meaning: 'Meters per second per unit, exact: 0.277778 (1,000/3,600) for km/h, 0.447040 (1,609.344/3,600) for mph, 0.514444 (1,852/3,600) for kn, 0.3048 for ft/s.' },
          { symbol: 'm/s', meaning: 'The speed in the base SI unit, used internally for every conversion.' }
        ],
        note: 'The m/s-to-km/h factor (3.6) is exact and the cleanest of the set, since both the meter/kilometer and the second/hour are exact SI relationships with nothing historical or rounded in between.'
      },
      workedExample: {
        intro: 'A treadmill is set to 15 m/s record pace, and a car\'s speedometer shows 90 km/h. What is each in the other unit?',
        rows: [
          { label: '15 × 3.6', value: '54 km/h' },
          { label: '90 ÷ 3.6', value: '25 m/s' },
          { label: 'Quick check: 15 × 4, minus 10%', value: '60 − 6 = 54 km/h' }
        ],
        result: '15 m/s = 54 km/h · 90 km/h = 25 m/s',
        explanation: 'The factor here is exactly 3.6, so there is no rounding at all, unlike most unit pairs on this site. "×4, minus 10%" is a clean mental shortcut because 4 × 0.9 = 3.6 exactly.'
      },
      commonValues: {
        title: 'Common meters per second to km/h conversions',
        dimension: 'speed',
        from: 'm/s',
        to: 'km/h',
        values: [1, 2, 5, 10, 20, 30, 50, 100],
        reverse: {
          title: 'Common km/h to meters per second conversions',
          values: [10, 36, 50, 60, 90, 100, 120]
        }
      },
      watchOut: [
        { title: 'Knots are nautical, not statute', body: 'A knot is 1 nautical mile (1,852 m) per hour, about 1.852 km/h — not the same as a mile per hour (1.609344 km/h).' },
        { title: 'This converts a rate, not a distance', body: 'Speed and distance share a conversion factor for a given unit pair only because time cancels out; they are still different physical quantities.' },
        { title: 'Speedometers can read a little fast', body: 'Many car speedometers read a few percent fast for mechanical and legal-tolerance reasons, so a converted GPS speed will not always match the dashboard exactly.' },
        { title: 'The speed of sound varies with conditions', body: 'About 1,225 km/h is for dry air at sea level under standard atmospheric conditions; it is slower at altitude and faster in warmer air.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'metersPerSecond', label: 'Meters per second', type: 'number', placeholder: '10', defaultValue: 10, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Speed Converter (m/s, km/h, mph, knots)',
      description: 'Free speed converter: meters per second, kilometers per hour, miles per hour, knots and feet per second, in any direction, with exact factors.',
      faq: [
        { question: 'How do I convert m/s to km/h?', answer: 'Multiply by 3.6 — exact, since 1,000 m fits into 3,600 s the same number of times either way. 15 m/s × 3.6 = 54 km/h.' },
        { question: 'How do I convert km/h to m/s?', answer: 'Divide by 3.6. 90 km/h ÷ 3.6 = 25 m/s.' },
        { question: 'How do I convert m/s to mph?', answer: 'Multiply by about 2.236936 (3.6 ÷ 1.609344). 25 m/s is about 55.92 mph.' },
        { question: 'Why is the m/s to km/h factor exact?', answer: 'Both the meter/kilometer and the second/hour relationships are exact SI definitions, with no historical or rounded physical constant in between, unlike the mile or the pound.' },
        { question: 'How does a knot compare to m/s?', answer: 'A knot is exactly 1,852/3,600 ≈ 0.514444 m/s, since a nautical mile is exactly 1,852 m.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'For km/h to m/s, divide by 3.6 exactly — no shortcut needed. For mph, multiply km/h by about 0.62 instead.' }
      ]
    },
    compute(values) {
      const kph = fromBase(toBase(values.metersPerSecond, 'speed', 'm/s'), 'speed', 'km/h');
      return { kph };
    }
  },
  {
    id: 'time-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['time converter', 'hours to minutes converter', 'minutes to hours calculator', 'time unit converter', 'convert time units'],
    related: ['date-difference-calculator', 'work-hours-calculator', 'sleep-time-calculator', 'speed-converter'],
    title: 'Time Converter',
    description: 'Convert between seconds, minutes, hours, days, weeks, months and years, in any direction, as you type.',
    example: '2 hours is exactly 120 minutes, and a 150-minute flight is exactly 2.5 hours.',
    solver: {
      defaultTarget: 'minutes',
      variables: [
        { id: 'hours', label: 'Hours', symbol: 'h', dimension: 'time', defaultValue: 2, defaultUnit: 'h' },
        { id: 'minutes', label: 'Minutes', symbol: 'min', dimension: 'time', defaultValue: 120, defaultUnit: 'min' }
      ],
      // Both fields hold the same duration (in seconds); the unit menus already list every time unit
      // in lib/units.ts (s, ms, min, h, days, weeks, months, years), so either menu is a full time
      // converter.
      solve: {
        hours: ({ minutes }) => (minutes >= 0 ? minutes : NaN),
        minutes: ({ hours }) => (hours >= 0 ? hours : NaN)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'hours',
          min: 0,
          max: 8,
          ticks: ['1 s', '10 s', '100 s', '1,000 s', '10,000 s', '100,000 s', '1,000,000 s', '10,000,000 s', '100,000,000 s'],
          benchmarks: [
            { label: 'A heartbeat (about 1 second)', value: 1 },
            { label: 'A coffee break (15 minutes)', value: 900 },
            { label: 'A workday (8 hours)', value: 28800 },
            { label: 'A week (7 days)', value: 604800 },
            { label: '1 year (365.25 days, average)', value: 31557600 }
          ],
          title: 'How long is that?',
          valueLabel: 'Your duration'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Seconds, minutes, hours and the calendar units',
        paragraphs: [
          'The second is the SI base unit of time. Minutes, hours, days and weeks are all exact multiples of it — 60 seconds to a minute, 60 minutes to an hour, 24 hours to a day, 7 days to a week — so converting among them is always a whole-number multiplication or division with nothing to round.',
          'Months and years are different. A calendar month runs 28 to 31 days and a calendar year 365 or 366 days (a leap year), depending on which month or year it is. This converter cannot know which specific month or year you mean, so it uses the Julian year average instead: 365.25 days (accounting for a leap day roughly every 4 years), and a month as one-twelfth of that, about 30.4375 days. For a specific calendar range — "how many days between March 3 and July 4" — use the date difference calculator instead, which works from actual calendar dates.',
          'Everything from seconds through weeks converts exactly: typing 2 hours and seeing exactly 120 minutes, or 9,000 seconds, involves no rounding at all. It is only once months or years enter the picture that "convert" starts to mean "estimate."'
        ]
      },
      howTo: {
        intro: 'Type a duration in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pick your starting unit', text: 'Open the unit menu beside the first field and choose seconds, milliseconds, minutes, hours, days, weeks, months or years.' },
          { name: 'Type the duration', text: 'Enter the number. The other field recalculates immediately.' },
          { name: 'Change the target unit', text: 'Open the second field\'s menu to see the same duration in any other unit.' },
          { name: 'Read the scale', text: 'The scale places your duration against a heartbeat, a coffee break, a workday, a week and a year.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every time unit here reduces to seconds first, then to the target unit.',
        expression: 's = value × factor(unit)\nresult = s ÷ factor(target unit)',
        terms: [
          { symbol: 'factor(unit)', meaning: 'Seconds per unit: 60 for min, 3,600 for h, 86,400 for day, 604,800 for week — all exact — and 2,629,800 for month, 31,557,600 for year, both averages (365.25-day Julian year).' },
          { symbol: 's', meaning: 'The duration in the base SI unit, used internally for every conversion.' }
        ],
        note: 'Seconds through weeks are exact; months and years are stated as averages, not exact calendar lengths.'
      },
      workedExample: {
        intro: 'A flight is scheduled for 2.5 hours and a project log shows 150 minutes of work. How many minutes is the flight, and how many hours is the logged work?',
        rows: [
          { label: '2.5 h × 60', value: '150 min' },
          { label: '150 min ÷ 60', value: '2.5 h' },
          { label: '2.5 h × 3,600', value: '9,000 s' }
        ],
        result: '2.5 h = 150 min = 9,000 s',
        explanation: 'Because every factor from seconds up through weeks is an exact whole-number multiple (60, 60, 24, 7), none of these conversions round at all — unlike months and years, which this page treats as averages (see the watch-out below).'
      },
      commonValues: {
        title: 'Common hours to minutes conversions',
        dimension: 'time',
        from: 'h',
        to: 'min',
        values: [0.5, 1, 1.5, 2, 4, 8, 12, 24],
        reverse: {
          title: 'Common minutes to hours conversions',
          values: [15, 30, 45, 60, 90, 120, 480, 1440]
        }
      },
      watchOut: [
        { title: 'Months and years here are averages', body: 'This converter uses the 365.25-day Julian year and a month as a twelfth of that (about 30.4375 days), not a specific calendar month (28–31 days) or calendar year (365 or 366 days). Three months this way is 91.3125 days, which will not exactly match three particular calendar months.' },
        { title: 'A day here is always exactly 24 hours', body: 'Real calendar days occasionally run 23 or 25 hours where clocks shift for daylight saving time. This is a plain duration conversion, not a calendar lookup.' },
        { title: 'For a specific date range, use the date difference calculator', body: 'That calculator counts the exact number of days between two real calendar dates, correctly handling leap years and each month\'s real length — this converter only scales a duration you already have.' },
        { title: 'Milliseconds matter for precise timing', body: 'Sports timing, computing and audio/video work often need milliseconds (1/1,000 of a second), which is in the unit menu alongside the everyday units.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'hours', label: 'Hours', type: 'number', placeholder: '2', defaultValue: 2, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Time Converter (Seconds, Minutes, Hours, Days)',
      description: 'Free time converter: seconds, minutes, hours, days, weeks, months and years, in any direction, with exact factors and honest month/year averages.',
      faq: [
        { question: 'How many minutes are in an hour?', answer: '60, exactly. For 2.5 hours: 2.5 × 60 = 150 minutes.' },
        { question: 'How many hours are in a day?', answer: '24, exactly. A week is 7 days, so 168 hours.' },
        { question: 'How many days are in a year?', answer: 'This converter uses 365.25 (the Julian year average, accounting for leap years). A specific calendar year is 365 days, or 366 in a leap year.' },
        { question: 'How many days are in a month?', answer: 'This converter uses a twelfth of the average year, about 30.4375 days. A specific calendar month runs from 28 to 31 days — use the date difference calculator for an exact one.' },
        { question: 'How many seconds are in a day?', answer: '86,400 — 24 × 60 × 60.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'For hours to minutes, just multiply by 60 — there is no rounding to worry about. For minutes to hours, divide by 60: 150 minutes ÷ 60 = 2.5 hours exactly.' }
      ]
    },
    compute(values) {
      const minutes = fromBase(toBase(values.hours, 'time', 'h'), 'time', 'min');
      return { minutes };
    }
  },
  {
    id: 'pressure-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['pressure converter', 'psi to bar converter', 'pressure unit converter', 'kpa to psi converter'],
    related: ['force-calculator', 'energy-converter', 'power-converter', 'speed-converter'],
    title: 'Pressure Converter',
    description: 'Convert between pascals, bar, psi, atmospheres, mmHg and Torr, in any direction, as you type.',
    example: 'A car tire inflated to 32 psi is about 2.21 bar, just over the 2.2 bar often printed on a spec sheet.',
    solver: {
      defaultTarget: 'bar',
      variables: [
        { id: 'psi', label: 'PSI', symbol: 'psi', dimension: 'pressure', defaultValue: 32, defaultUnit: 'psi' },
        { id: 'bar', label: 'Bar', symbol: 'bar', dimension: 'pressure', defaultValue: 2.206322, defaultUnit: 'bar' }
      ],
      // Both fields hold the same pressure (in pascals); the unit menus already list every pressure
      // unit in lib/units.ts (Pa, kPa, MPa, bar, mbar, psi, atm, mmHg, inHg, Torr), so either menu is
      // a full pressure converter.
      solve: {
        psi: ({ bar }) => (bar >= 0 ? bar : NaN),
        bar: ({ psi }) => (psi >= 0 ? psi : NaN)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'psi',
          min: 2,
          max: 6,
          ticks: ['100 Pa', '1,000 Pa', '10,000 Pa', '100,000 Pa', '1,000,000 Pa'],
          benchmarks: [
            { label: '1 standard atmosphere (sea-level air pressure)', value: 101325 },
            { label: 'A passenger car tire (about 32 psi)', value: 220632 },
            { label: 'A road bicycle tire (about 100 psi)', value: 689476 },
            { label: 'A truck tire (about 120 psi)', value: 827371 }
          ],
          title: 'How much pressure is that?',
          valueLabel: 'Your pressure'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Pressure units: SI, imperial and conventional',
        paragraphs: [
          'Pressure is force spread over an area, so every unit here reduces to the pascal (Pa), the SI unit: one newton per square meter. The bar (100,000 Pa, close to ordinary atmospheric pressure) and its hundredth, the millibar, are common in meteorology. The psi (pounds-force per square inch) is the everyday US unit for tire and tank pressure, and is exact by definition from the pound-force and the inch.',
          'The standard atmosphere (atm) is defined as exactly 101,325 Pa — not a measured average, a fixed reference. Historically, pressure was also measured by how high it pushed a column of mercury: the millimeter of mercury (mmHg) and the torr are both close to 1/760 of an atmosphere, which is why "760 mmHg" and "760 Torr" both describe sea-level air pressure.',
          'mmHg and Torr are nearly, but not exactly, the same unit. mmHg is defined from the density of mercury and standard gravity (133.322387415 Pa), while the Torr is defined as exactly 1/760 of an atmosphere (133.32236842… Pa) — the two differ by about 1 part in 7 million, far too small to matter outside precision instrumentation, but not literally identical.'
        ]
      },
      howTo: {
        intro: 'Type a pressure in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pick your starting unit', text: 'Open the unit menu beside the first field and choose pascals, kilopascals, megapascals, bar, millibar, psi, atmospheres, mmHg, inHg or Torr.' },
          { name: 'Type the pressure', text: 'Enter the number. The other field recalculates immediately.' },
          { name: 'Change the target unit', text: 'Open the second field\'s menu to see the same pressure in any other unit.' },
          { name: 'Read the scale', text: 'The scale places your pressure against sea-level air pressure, a car tire, a bicycle tire and a truck tire.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every pressure unit here reduces to pascals first, then to the target unit.',
        expression: 'Pa = value × factor(unit)\nresult = Pa ÷ factor(target unit)',
        terms: [
          { symbol: 'factor(unit)', meaning: 'Pascals per unit: 100,000 for bar, 101,325 for atm (both exact), 6,894.757293168 for psi (exact, from lbf/in²), 133.322387415 for mmHg, 133.32236842… for Torr (both conventional).' },
          { symbol: 'Pa', meaning: 'The pressure in the base SI unit, used internally for every conversion.' }
        ],
        note: 'psi, bar and atm are exact by definition; mmHg and Torr are each exact by their own (slightly different) conventional definitions, so results are rounded for display only.'
      },
      workedExample: {
        intro: 'A tire gauge reads 32 psi and the vehicle\'s spec sheet calls for 2.2 bar. Is the tire correctly inflated?',
        rows: [
          { label: '32 × 6,894.757293168', value: '220,632 Pa' },
          { label: '220,632 ÷ 100,000', value: '2.21 bar' },
          { label: '2.2 bar × 100,000 ÷ 6,894.757293168', value: '31.91 psi' }
        ],
        result: '32 psi ≈ 2.21 bar · 2.2 bar ≈ 31.91 psi',
        explanation: '32 psi is about 2.21 bar, just above the 2.2 bar spec — well within normal gauge tolerance. The two figures are close enough that a spec sheet rounding either one to one decimal place is standard practice, not an error.'
      },
      commonValues: {
        title: 'Common psi to bar conversions',
        dimension: 'pressure',
        from: 'psi',
        to: 'bar',
        values: [10, 20, 30, 32, 35, 50, 80, 100, 120],
        reverse: {
          title: 'Common bar to psi conversions',
          values: [1, 1.5, 2, 2.2, 2.5, 3, 5, 8]
        }
      },
      watchOut: [
        { title: 'Gauge pressure is not absolute pressure', body: 'A tire gauge reads "gauge pressure" — how much higher than the surrounding atmosphere — while this converter treats every number as the pressure itself (absolute pressure). Mixing the two gives an answer off by about 1 atmosphere (14.7 psi, 101,325 Pa).' },
        { title: 'mmHg and Torr are close but not identical', body: 'They differ by about 1 part in 7 million (mmHg is defined from mercury\'s density and standard gravity; Torr is exactly 1/760 atm). Treat them as interchangeable only outside precision scientific work.' },
        { title: 'psi is exact; mmHg and Torr are conventional, not measured', body: 'All of these are fixed definitions, not physical measurements with uncertainty — but they come from different historical conventions, which is why mmHg and Torr do not quite match.' },
        { title: 'Weather reports often use inHg or mbar', body: 'US weather reports typically give barometric pressure in inHg (around 29.92 at sea level); many other countries use hPa, numerically the same as millibars.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'psi', label: 'PSI', type: 'number', placeholder: '32', defaultValue: 32, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Pressure Converter (Pa, Bar, PSI, Atm, mmHg)',
      description: 'Free pressure converter: pascals, bar, psi, atmospheres, mmHg, inHg and Torr, in any direction, with exact factors and a tire-pressure example.',
      faq: [
        { question: 'How do I convert psi to bar?', answer: 'Multiply by about 0.0689476 (psi\'s pascal factor divided by 100,000). 32 psi × 0.0689476 ≈ 2.21 bar.' },
        { question: 'How do I convert bar to psi?', answer: 'Multiply by about 14.5038. 2.2 bar × 14.5038 ≈ 31.91 psi.' },
        { question: 'How many Pa are in 1 atmosphere?', answer: 'Exactly 101,325 Pa, by definition — about 14.696 psi or 1.01325 bar.' },
        { question: 'Is mmHg the same as Torr?', answer: 'Almost: they differ by about 1 part in 7 million, since mmHg comes from mercury\'s density and the Torr is defined as exactly 1/760 of an atmosphere. For everyday use they are interchangeable.' },
        { question: 'What is the difference between gauge and absolute pressure?', answer: 'Gauge pressure (what a tire gauge shows) is measured relative to the surrounding atmosphere. Absolute pressure includes that atmosphere, so it reads about 14.7 psi (1 atm) higher than the gauge figure for the same tire.' },
        { question: 'What psi is a typical car tire?', answer: 'Most passenger cars call for around 30–35 psi, but the correct figure is on the vehicle\'s door-jamb placard or owner\'s manual, not a universal number.' }
      ]
    },
    compute(values) {
      const bar = fromBase(toBase(values.psi, 'pressure', 'psi'), 'pressure', 'bar');
      return { bar };
    }
  },
  {
    id: 'energy-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['energy converter', 'kj to kcal converter', 'joules to calories converter', 'energy unit converter'],
    related: ['calorie-calculator', 'power-converter', 'pressure-converter', 'electricity-bill-calculator'],
    title: 'Energy Converter',
    description: 'Convert between joules, kilojoules, calories, kilocalories, kilowatt-hours and BTU, in any direction, as you type.',
    example: '200 kcal (a snack-sized food label figure) is about 836.8 kJ, and 1 kWh is exactly 3.6 MJ.',
    solver: {
      defaultTarget: 'kilocalories',
      variables: [
        { id: 'kilojoules', label: 'Kilojoules', symbol: 'kJ', dimension: 'energy', defaultValue: 836.8, defaultUnit: 'kJ' },
        { id: 'kilocalories', label: 'Kilocalories', symbol: 'kcal', dimension: 'energy', defaultValue: 200, defaultUnit: 'kcal' }
      ],
      // Both fields hold the same energy (in joules); the unit menus already list every energy unit
      // in lib/units.ts (J, kJ, MJ, cal, kcal, Wh, kWh, BTU, ft·lbf), so either menu is a full energy
      // converter.
      solve: {
        kilojoules: ({ kilocalories }) => (kilocalories >= 0 ? kilocalories : NaN),
        kilocalories: ({ kilojoules }) => (kilojoules >= 0 ? kilojoules : NaN)
      },
      derive: (si) => ({ kjShown: si.kilojoules / 1000 }),
      visuals: [
        {
          type: 'logScale',
          value: 'kjShown',
          min: -1,
          max: 5,
          ticks: ['0.1 kJ', '1 kJ', '10 kJ', '100 kJ', '1,000 kJ', '10,000 kJ', '100,000 kJ'],
          benchmarks: [
            { label: 'An apple (about 300 kJ)', value: 300 },
            { label: 'A snack (200 kcal, about 837 kJ)', value: 836.8 },
            { label: 'A full day of food (2,000 kcal, about 8,368 kJ)', value: 8368 },
            { label: '1 kWh of electricity (3,600 kJ)', value: 3600 }
          ],
          title: 'How much energy is that?',
          valueLabel: 'Your energy'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Joules, calories and the other energy units',
        paragraphs: [
          'The joule (J) is the SI unit of energy, used throughout physics and engineering. The calorie, used for food energy, was originally defined as the energy to raise one gram of water by one degree Celsius; this converter uses the thermochemical calorie, fixed at exactly 4.184 J, the modern standard definition.',
          'Food labels write "Calories" with a capital C, and that word means a kilocalorie (1,000 small calories, 4,184 J) — not the small calorie from chemistry. A 200-"Calorie" snack is 200 kcal, about 836.8 kJ. This is a long-standing and sometimes confusing naming convention, not an error on the label.',
          'The kilowatt-hour (kWh), used for electricity bills, is exactly 3.6 megajoules, because it is a kilowatt of power sustained for an hour (1,000 W × 3,600 s = 3,600,000 J). The BTU (British thermal unit), common in heating and cooling specs, is the International Table BTU in this converter, fixed at exactly 1,055.05585262 J — one of a few historical BTU definitions, this being the one most common in current engineering use.'
        ]
      },
      howTo: {
        intro: 'Type an energy amount in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pick your starting unit', text: 'Open the unit menu beside the first field and choose joules, kilojoules, megajoules, calories, kilocalories, watt-hours, kilowatt-hours, BTU or foot-pounds.' },
          { name: 'Type the amount', text: 'Enter the number. The other field recalculates immediately.' },
          { name: 'Change the target unit', text: 'Open the second field\'s menu to see the same energy in any other unit.' },
          { name: 'Read the scale', text: 'The scale places your energy against an apple, a snack, a full day of food and a kilowatt-hour.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every energy unit here reduces to joules first, then to the target unit.',
        expression: 'J = value × factor(unit)\nresult = J ÷ factor(target unit)',
        terms: [
          { symbol: 'factor(unit)', meaning: 'Joules per unit: 4.184 for cal, 4,184 for kcal (both exact, thermochemical), 3,600,000 for kWh (exact), 1,055.05585262 for BTU (exact, International Table definition).' },
          { symbol: 'J', meaning: 'The energy in the base SI unit, used internally for every conversion.' }
        ],
        note: 'Every factor above is an exact definition, not a measured average, so results are rounded for display only.'
      },
      workedExample: {
        intro: 'A nutrition label lists a snack at 200 kcal, and an energy spec gives 837 kJ. How do the two compare?',
        rows: [
          { label: '200 × 4.184', value: '836.8 kJ' },
          { label: '837 ÷ 4.184', value: '200.05 kcal' },
          { label: 'Quick check: 200 × 4', value: '≈ 800 kJ' }
        ],
        result: '200 kcal ≈ 836.8 kJ · 837 kJ ≈ 200.05 kcal',
        explanation: 'Multiplying by 4 instead of the exact 4.184 understates kJ by about 4.4%; for kJ to kcal, dividing by 4 instead overstates by about 4.6%.'
      },
      commonValues: {
        title: 'Common kJ to kcal conversions',
        dimension: 'energy',
        from: 'kJ',
        to: 'kcal',
        values: [1, 10, 100, 500, 837, 1000, 2000],
        reverse: {
          title: 'Common kcal to kJ conversions',
          values: [50, 100, 200, 250, 500, 1000, 2000]
        }
      },
      watchOut: [
        { title: 'A food "Calorie" is a kilocalorie', body: 'Nutrition labels write "Calories" (capital C) to mean kilocalories (1,000 small calories), a long-standing convention — not a typo and not the same as the small calorie used in chemistry.' },
        { title: 'This converter uses the thermochemical calorie', body: 'There are several historical definitions of the calorie, differing by a few parts in ten thousand. 4.184 J (thermochemical) is the modern standard this converter and most current references use.' },
        { title: 'BTU has more than one historical definition', body: 'This converter uses the International Table BTU (1,055.05585262 J), the most common in current engineering specs. Older thermochemical or 59°F BTU definitions differ by a small fraction of a percent — close enough for everyday use but worth checking for lab-grade precision.' },
        { title: 'Energy is not power', body: 'A kilowatt-hour (kWh) is an amount of energy, not a rate. For power (energy per time — watts, horsepower), see the power converter.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'kilojoules', label: 'Kilojoules', type: 'number', placeholder: '836.8', defaultValue: 836.8, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Energy Converter (J, kJ, Calories, kWh, BTU)',
      description: 'Free energy converter: joules, kilojoules, calories, kilocalories, kilowatt-hours and BTU, in any direction, with exact factors and a food-label example.',
      faq: [
        { question: 'How do I convert kcal to kJ?', answer: 'Multiply by 4.184. For 200 kcal: 200 × 4.184 = 836.8 kJ.' },
        { question: 'How do I convert kJ to kcal?', answer: 'Divide by 4.184. 837 kJ ÷ 4.184 ≈ 200.05 kcal.' },
        { question: 'Is a food Calorie the same as a calorie?', answer: 'A food "Calorie" (capital C) is a kilocalorie, 1,000 small calories — 4,184 J. A chemistry "calorie" (lowercase) is 1/1,000 of that, 4.184 J.' },
        { question: 'How many joules are in 1 kWh?', answer: 'Exactly 3,600,000 J (3.6 MJ) — a kilowatt sustained for an hour.' },
        { question: 'What is a BTU in joules?', answer: 'This converter uses the International Table BTU, exactly 1,055.05585262 J, the definition most common in current heating and cooling specs.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply kcal by 4 for a rough kJ figure (about 4.4% low), or divide kJ by 4 for kcal (about 4.6% high).' }
      ]
    },
    compute(values) {
      const kilocalories = fromBase(toBase(values.kilojoules, 'energy', 'kJ'), 'energy', 'kcal');
      return { kilocalories };
    }
  },
  {
    id: 'power-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['power converter', 'kw to hp converter', 'horsepower converter', 'watts to horsepower converter'],
    related: ['energy-converter', 'pressure-converter', 'force-calculator', 'electricity-bill-calculator'],
    title: 'Power Converter',
    description: 'Convert between watts, kilowatts, horsepower, metric horsepower (PS) and BTU per hour, in any direction, as you type.',
    example: 'A 100 kW electric motor is about 134.1 hp, and 1 hp is about 1.4% more powerful than 1 metric horsepower (PS).',
    solver: {
      defaultTarget: 'horsepower',
      variables: [
        { id: 'kilowatts', label: 'Kilowatts', symbol: 'kW', dimension: 'power', defaultValue: 100, defaultUnit: 'kW' },
        { id: 'horsepower', label: 'Horsepower', symbol: 'hp', dimension: 'power', defaultValue: 134.1022, defaultUnit: 'hp' }
      ],
      // Both fields hold the same power (in watts); the unit menus already list every power unit in
      // lib/units.ts (W, kW, MW, hp, PS, BTU/h), so either menu is a full power converter.
      solve: {
        kilowatts: ({ horsepower }) => (horsepower >= 0 ? horsepower : NaN),
        horsepower: ({ kilowatts }) => (kilowatts >= 0 ? kilowatts : NaN)
      },
      derive: (si) => ({ kwShown: si.kilowatts / 1000 }),
      visuals: [
        {
          type: 'logScale',
          value: 'kwShown',
          min: -2,
          max: 4,
          ticks: ['0.01 kW', '0.1 kW', '1 kW', '10 kW', '100 kW', '1,000 kW', '10,000 kW'],
          benchmarks: [
            { label: 'A microwave oven (about 1.1 kW)', value: 1.1 },
            { label: 'A small car engine (about 75 kW / 100 hp)', value: 75 },
            { label: 'A family car engine (about 134 hp / 100 kW)', value: 100 },
            { label: 'A Formula 1 engine (about 750–900 kW)', value: 800 }
          ],
          title: 'How powerful is that?',
          valueLabel: 'Your power'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Watts, horsepower and metric horsepower',
        paragraphs: [
          'Power is energy delivered per unit of time. The watt (W), the SI unit, is one joule per second, used for appliances and electrical ratings worldwide. The kilowatt (1,000 W) is the usual scale for motors, generators and car engines in countries that use metric units.',
          'Horsepower (hp) is defined mechanically as 550 foot-pounds-force per second, a figure that traces back to James Watt\'s 18th-century comparison of a steam engine to a draft horse. It converts to exactly 745.69987158227 W. Metric horsepower (PS, from the German Pferdestärke) is a related but different unit, defined as 75 kilogram-force-meters per second, exactly 735.49875 W.',
          'Because the two definitions do not match, 1 hp is about 1.387% more than 1 PS — close enough that car brochures sometimes blur the two, but not interchangeable for anything precise. A car rated "100 kW (134 hp)" and one rated "100 kW (136 PS)" have the identical 100 kW engine; only the horsepower-like unit printed next to it differs.'
        ]
      },
      howTo: {
        intro: 'Type a power value in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pick your starting unit', text: 'Open the unit menu beside the first field and choose watts, kilowatts, megawatts, mechanical horsepower, metric horsepower (PS) or BTU per hour.' },
          { name: 'Type the value', text: 'Enter the number. The other field recalculates immediately.' },
          { name: 'Change the target unit', text: 'Open the second field\'s menu to see the same power in any other unit.' },
          { name: 'Read the scale', text: 'The scale places your power against a microwave, a small car engine, a family car engine and a Formula 1 engine.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every power unit here reduces to watts first, then to the target unit.',
        expression: 'W = value × factor(unit)\nresult = W ÷ factor(target unit)',
        terms: [
          { symbol: 'factor(unit)', meaning: 'Watts per unit: 745.69987158227 for hp (550 ft·lbf/s, exact), 735.49875 for PS (75 kgf·m/s, exact), 0.293071 for BTU/h.' },
          { symbol: 'W', meaning: 'The power in the base SI unit, used internally for every conversion.' }
        ],
        note: 'Both horsepower definitions are exact from their own historical definitions, so results are rounded for display only.'
      },
      workedExample: {
        intro: 'An electric motor is rated at 100 kW. How much is that in mechanical horsepower, and what would the same number of horsepower be in kW?',
        rows: [
          { label: '100,000 ÷ 745.69987158227', value: '134.10 hp' },
          { label: '134 × 745.69987158227 ÷ 1,000', value: '99.92 kW' },
          { label: 'Quick check: 100 × 1.34', value: '134 hp' }
        ],
        result: '100 kW ≈ 134.10 hp · 134 hp ≈ 99.92 kW',
        explanation: 'Multiplying kW by 1.34 is a close mental shortcut for horsepower, within about 0.08%. The same 134 hp is about 135.86 PS (134 × 1.013870), since metric horsepower is the slightly smaller unit.'
      },
      commonValues: {
        title: 'Common kilowatts to horsepower conversions',
        dimension: 'power',
        from: 'kW',
        to: 'hp',
        values: [1, 5, 10, 50, 75, 100, 150, 200, 300],
        reverse: {
          title: 'Common horsepower to kilowatts conversions',
          values: [10, 50, 100, 134, 150, 200, 300, 400]
        }
      },
      watchOut: [
        { title: 'Horsepower and metric horsepower are different units', body: 'This converter\'s "hp" is the mechanical horsepower (745.69987158227 W), slightly larger than metric horsepower, PS (735.49875 W) — about 1.39% larger. A car spec quoting "150 PS" is not the same as "150 hp."' },
        { title: 'There are other, rarer horsepower definitions', body: 'Electrical horsepower (746 W, a rounded US convention for motor nameplates) and boiler horsepower are different again, each by a small fraction of a percent. This converter uses the standard mechanical horsepower.' },
        { title: 'Power is a rate, not an amount', body: 'A 100 kW motor running for 2 hours uses 200 kWh of energy — power and energy are related but different quantities. For the energy side, see the energy converter.' },
        { title: 'BTU/h appears on HVAC equipment', body: 'Air conditioners and furnaces are often rated in BTU per hour rather than watts; 12,000 BTU/h (a "1-ton" air conditioner, a cooling-industry term unrelated to weight) is about 3.52 kW.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'kilowatts', label: 'Kilowatts', type: 'number', placeholder: '100', defaultValue: 100, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Power Converter (Watts, kW, Horsepower, PS)',
      description: 'Free power converter: watts, kilowatts, horsepower, metric horsepower (PS) and BTU/h, in any direction, with exact factors and a car-engine example.',
      faq: [
        { question: 'How do I convert kW to horsepower?', answer: 'Divide by 0.74569987158227 (or multiply by about 1.34102). 100 kW ÷ 0.74569987158227 ≈ 134.10 hp.' },
        { question: 'How do I convert horsepower to kW?', answer: 'Multiply by 0.74569987158227. 134 hp × 0.74569987158227 ≈ 99.92 kW.' },
        { question: 'What is the difference between hp and PS?', answer: 'hp (mechanical horsepower, 745.69987158227 W) is about 1.39% larger than PS (metric horsepower, 735.49875 W). 1 hp ≈ 1.0139 PS.' },
        { question: 'How many watts are in 1 horsepower?', answer: 'Exactly 745.69987158227 W, from the definition 550 foot-pounds-force per second.' },
        { question: 'How many watts are in 1 PS (metric horsepower)?', answer: 'Exactly 735.49875 W, from the definition 75 kilogram-force-meters per second.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply kW by about 1.34 for horsepower (within about 0.08%), or divide horsepower by about 1.34 for kW.' }
      ]
    },
    compute(values) {
      const horsepower = fromBase(toBase(values.kilowatts, 'power', 'kW'), 'power', 'hp');
      return { horsepower };
    }
  },
  {
    id: 'data-storage-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['data storage converter', 'gb to mb converter', 'bit to byte converter', 'storage unit converter'],
    related: ['energy-converter', 'power-converter', 'character-counter', 'time-converter'],
    title: 'Data Storage Converter',
    description: 'Convert between bits, bytes, kilobytes, megabytes, gigabytes, terabytes and their binary (KiB/MiB/GiB) equivalents, in any direction, as you type.',
    example: '1 GB (decimal, the way drives are sold) is 1,000 MB, but only about 0.9313 GiB (binary), which is why a "1 TB" drive shows about 931 "GB" in Windows.',
    solver: {
      defaultTarget: 'megabytes',
      variables: [
        { id: 'gigabytes', label: 'Gigabytes', symbol: 'GB', dimension: 'data', defaultValue: 1, defaultUnit: 'GB' },
        { id: 'megabytes', label: 'Megabytes', symbol: 'MB', dimension: 'data', defaultValue: 1000, defaultUnit: 'MB' }
      ],
      // Both fields hold the same amount of data (in bits); the unit menus already list every data
      // unit in lib/units.ts, decimal (bit, kbit, Mbit, Gbit, B, KB, MB, GB, TB, PB) and binary (KiB,
      // MiB, GiB, TiB), so either menu is a full data-storage converter.
      solve: {
        gigabytes: ({ megabytes }) => (megabytes >= 0 ? megabytes : NaN),
        megabytes: ({ gigabytes }) => (gigabytes >= 0 ? gigabytes : NaN)
      },
      derive: (si) => ({ mbShown: si.gigabytes / (8 * 1e6) }),
      visuals: [
        {
          type: 'logScale',
          value: 'mbShown',
          min: -2,
          max: 8,
          ticks: ['0.01 MB', '1 MB', '100 MB', '10,000 MB', '1,000,000 MB', '100,000,000 MB'],
          benchmarks: [
            { label: 'A photo from a phone camera (about 4 MB)', value: 4 },
            { label: 'A music track (MP3, about 8 MB)', value: 8 },
            { label: 'A single-layer DVD (4.7 GB, 4,700 MB)', value: 4700 },
            { label: 'A smartphone\'s storage (128 GB, 128,000 MB)', value: 128000 }
          ],
          title: 'How much data is that?',
          valueLabel: 'Your data'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Decimal and binary data units, and bits vs. bytes',
        paragraphs: [
          'A byte is 8 bits, and every storage unit here builds on one or the other. Beyond that, there are two different, equally valid ways to scale up: the decimal system (kilo- = 1,000, as in every other SI prefix) and the binary system (kibi- = 1,024, the power of two closest to 1,000, which is how memory addressing naturally divides). Storage makers sell drives in decimal gigabytes (1 GB = 1,000,000,000 bytes); Windows reports binary gibibytes but labels them "GB".',
          'That mismatch is why a drive sold as "1 TB" shows up as about 931 GB in Windows, which counts in binary but labels the result "GB" (macOS, iOS and most Linux file managers count in decimal and show the full 1 TB): 1 TB is exactly 1,000,000,000,000 bytes, but dividing that by 2^30 (1,073,741,824) bytes per "GiB" gives about 931.32, not 1,000. Nothing is missing or defective — the drive and the OS are simply using two different, both-correct definitions of a large number of bytes. The IEC introduced the ki/Mi/Gi/Ti naming in 1998 specifically so "KB" could keep meaning 1,000 bytes and "KiB" could unambiguously mean 1,024.',
          'Network and internet speeds are usually quoted in bits per second (Mbit/s, Gbit/s — often written Mbps, Gbps), while file sizes and storage are quoted in bytes (MB, GB). An internet plan advertised as "1 Gbps" tops out at about 125 MB/s of actual file transfer, not 1,000 MB/s, because there are 8 bits in a byte.'
        ]
      },
      howTo: {
        intro: 'Type an amount of data in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Pick your starting unit', text: 'Open the unit menu beside the first field and choose bits, kilobits, megabits, gigabits, bytes, KB, MB, GB, TB, PB, or the binary KiB, MiB, GiB, TiB.' },
          { name: 'Type the amount', text: 'Enter the number. The other field recalculates immediately.' },
          { name: 'Change the target unit', text: 'Open the second field\'s menu to see the same amount of data in any other unit — decimal or binary.' },
          { name: 'Read the scale', text: 'The scale places your data against a photo, a music track, a DVD and a smartphone\'s storage.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Every data unit here reduces to bits first, then to the target unit.',
        expression: 'bit = value × factor(unit)\nresult = bit ÷ factor(target unit)',
        terms: [
          { symbol: 'factor(unit)', meaning: 'Bits per unit: 8 for B, 8,000 for KB, 8,000,000 for MB, 8×10⁹ for GB (decimal: 1,000ⁿ); 8,192 for KiB, 8×2²⁰ for MiB, 8×2³⁰ for GiB (binary: 1,024ⁿ).' },
          { symbol: 'bit', meaning: 'The amount of data in the base unit, used internally for every conversion.' }
        ],
        note: 'Decimal (KB/MB/GB) and binary (KiB/MiB/GiB) prefixes are both exact definitions of different numbers — the "error" people notice is a labeling mismatch, not a rounding error.'
      },
      workedExample: {
        intro: 'A drive is advertised as 1 TB. How many decimal GB is that, and how many binary GiB will Windows actually show?',
        rows: [
          { label: '1 TB ÷ 1 GB (both decimal, 1,000ⁿ)', value: '1,000 GB' },
          { label: '1 TB (1,000,000,000,000 bytes) ÷ 2³⁰ bytes per GiB', value: '≈ 931.32 GiB' },
          { label: 'Quick check: 1,000 × 0.9313', value: '≈ 931.3' }
        ],
        result: '1 TB = 1,000 GB (decimal) ≈ 931.32 GiB (binary)',
        explanation: 'The drive maker\'s 1,000,000,000,000-byte "1 TB" and Windows\' binary "GB" (really GiB) are both correct, exact units — they are just different-sized units for the same bytes, which is why Windows shows a smaller number than the box.'
      },
      commonValues: {
        title: 'Common gigabytes to megabytes conversions',
        dimension: 'data',
        from: 'GB',
        to: 'MB',
        values: [0.5, 1, 2, 4, 8, 16, 32, 64],
        reverse: {
          title: 'Common megabytes to gigabytes conversions',
          values: [128, 256, 500, 512, 1000, 2000, 4000, 8000]
        }
      },
      watchOut: [
        { title: 'Decimal and binary units are both "correct" — just different sizes', body: '1 GB (decimal) is 1,000,000,000 bytes; 1 GiB (binary) is 1,073,741,824 bytes, about 7.4% more. A "1 TB" drive is exactly 1,000 GB but only about 931.32 GiB — nothing is missing.' },
        { title: 'Bits and bytes look alike but differ by 8×', body: 'An internet plan advertised as "100 Mbps" (100 megabits per second) downloads at about 12.5 MB/s (megabytes per second) at best, not 100 MB/s. Check for a lowercase "b" (bits) versus capital "B" (bytes).' },
        { title: 'Windows labels GiB as "GB"', body: 'Windows File Explorer computes in binary (1,024ⁿ) but displays the label "GB" — this converter\'s "GB" option is the decimal (1,000ⁿ) unit; use "GiB" from the menu to match what Windows shows. macOS (since 10.6), iOS and most Linux file managers use decimal GB, matching the box.' },
        { title: 'RAM is conventionally sold and addressed in binary units', body: 'Memory chips come in binary-friendly sizes (powers of 2), so RAM capacity almost always lines up exactly in GiB even when labeled "GB" on the box.' }
      ],
      references: [
        { label: 'NIST, Prefixes for Binary Multiples', url: 'https://physics.nist.gov/cuu/Units/binary.html' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'gigabytes', label: 'Gigabytes', type: 'number', placeholder: '1', defaultValue: 1, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Data Storage Converter (GB, MB, GiB, Bits)',
      description: 'Free data storage converter: bits, bytes, KB, MB, GB, TB and binary KiB/MiB/GiB/TiB, in any direction, with the decimal-vs-binary difference explained.',
      faq: [
        { question: 'How many MB are in a GB?', answer: '1,000 MB in a decimal GB (this converter\'s default). In binary terms, 1 GiB is 1,024 MiB.' },
        { question: 'Why does a 1 TB drive show up as 931 GB on my computer?', answer: 'The drive is sold in decimal terabytes (1,000,000,000,000 bytes), but Windows divides by binary gibibytes (1,073,741,824 bytes) while labeling the result "GB": 1 TB ÷ 2^30 bytes ≈ 931.32. macOS, iOS and most Linux file managers count in decimal and show 1 TB.' },
        { question: 'What is the difference between MB and Mb?', answer: 'MB (capital B) is megabytes; Mb or Mbit (lowercase b) is megabits. There are 8 bits in a byte, so 1 MB = 8 Mbit.' },
        { question: 'How fast is a 100 Mbps internet connection in MB/s?', answer: 'About 12.5 MB/s at best (100 ÷ 8), since internet speeds are quoted in megabits, not megabytes, per second.' },
        { question: 'How many bytes are in a GiB?', answer: 'Exactly 1,073,741,824 bytes (2^30), about 7.4% more than the 1,000,000,000 bytes in a decimal GB.' },
        { question: 'Which should I use, GB or GiB?', answer: 'Use GB (decimal) to match how storage is sold and priced, and GiB (binary) to match what Windows displays for the same drive.' }
      ]
    },
    compute(values) {
      const megabytes = fromBase(toBase(values.gigabytes, 'data', 'GB'), 'data', 'MB');
      return { megabytes };
    }
  },
  {
    id: 'millimeters-to-inches-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['mm to inches converter', 'inches to mm converter', 'convert mm to in', 'millimeters to inches calculator', 'drill bit size converter'],
    related: ['centimeters-to-inches-converter', 'feet-to-meters-converter', 'length-converter', 'square-feet-to-square-meters-converter'],
    title: 'Millimeters to Inches Converter',
    description: 'Convert millimeters to inches, or inches to millimeters, as you type. Includes a table of metric drill bit sizes and fractional inches.',
    example: '10 mm is about 0.3937 in, and a 1/4 in (0.25 in) drill bit is exactly 6.35 mm.',
    solver: {
      defaultTarget: 'inches',
      variables: [
        { id: 'millimeters', label: 'Millimeters', symbol: 'mm', dimension: 'length', defaultValue: 10, defaultUnit: 'mm' },
        { id: 'inches', label: 'Inches', symbol: 'in', dimension: 'length', defaultValue: 0.3937, defaultUnit: 'in' }
      ],
      // Both fields hold the same length (in meters); the unit menus do the converting.
      solve: {
        millimeters: ({ inches }) => (inches >= 0 ? inches : NaN),
        inches: ({ millimeters }) => (millimeters >= 0 ? millimeters : NaN)
      },
      derive: (si) => ({ mmShown: si.millimeters * 1000 }),
      visuals: [
        {
          type: 'logScale',
          value: 'mmShown',
          min: -1,
          max: 3,
          ticks: ['0.1 mm', '1 mm', '10 mm', '100 mm', '1,000 mm'],
          benchmarks: [
            { label: 'A 1/16 in drill bit (1.5875 mm)', value: 1.5875 },
            { label: 'An M8 bolt (8 mm)', value: 8 },
            { label: 'A 1/2 in drill bit (12.7 mm)', value: 12.7 },
            { label: 'An A4 sheet, short side (210 mm)', value: 210 }
          ],
          title: 'How small (or big) is that?',
          valueLabel: 'Your length'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Millimeters and inches',
        paragraphs: [
          'The millimeter is a metric unit of length, one thousandth of a meter, used worldwide wherever a measurement is too small to need a centimeter. The inch is a customary unit, used mainly in the US and for some parts specifications elsewhere, equal to 1/12 of a foot. Since 1959, the inch has been defined from the meter by the same international yard-and-pound agreement that fixes every other customary length on this site: one inch is exactly 25.4 millimeters.',
          'Because that definition is exact, converting between millimeters and inches is a single multiplication or division, with no rounding built into the factor itself — only the number you see on screen is rounded. One millimeter is about 0.03937 inches, so a credit card\'s 0.76 mm thickness is about 0.030 in, and a 10 mm socket is about 0.3937 in.',
          'This pair matters most for tools and hardware: drill bits, screws and bolts are sold in both metric sizes (millimeters) and fractional inch sizes (1/16 in, 1/8 in, and so on), and a workshop often needs to match one to the other. Fractional inches are not decimals — 1/4 in is 0.25 in, not 1.4 in — so the table below converts the common fractions directly.'
        ]
      },
      howTo: {
        intro: 'Type a length in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Millimeters to inches', text: 'Type the length in millimeters. The inches field shows the conversion.' },
          { name: 'Inches to millimeters', text: 'Type into the inches field instead. It becomes the input and the millimeters field is calculated.' },
          { name: 'Enter a fraction as a decimal', text: 'Convert a fraction first: 1/8 in is 0.125 in, 3/4 in is 0.75 in.' },
          { name: 'Use other units', text: 'Either menu also offers centimeters, meters, feet and yards.' },
          { name: 'Read the scale', text: 'The scale places the length against a small drill bit, a bolt and a sheet of A4 paper.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'An inch is a fixed number of millimeters, so the conversion is one multiplication or division.',
        expression: 'in = mm ÷ 25.4\nmm = in × 25.4',
        terms: [
          { symbol: 'mm', meaning: 'Length in millimeters, 1/1,000 of a meter.' },
          { symbol: 'in', meaning: 'Length in inches.' },
          { symbol: '25.4', meaning: 'Millimeters in an inch, exact by definition since 1959.' }
        ],
        note: 'The factor is exact. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A hardware store sells an 8 mm drill bit and a 3/8 in bolt. What is the bit\'s size in inches, and the bolt\'s size in millimeters?',
        rows: [
          { label: '8 ÷ 25.4', value: '0.3150 in' },
          { label: '0.375 × 25.4', value: '9.525 mm' },
          { label: 'Quick check: 8 × 0.04', value: '0.32 in' }
        ],
        result: '8 mm ≈ 0.315 in · 3/8 in = 9.525 mm',
        explanation: 'Multiplying by 0.04 instead of dividing by 25.4 is a rough shortcut and lands within about 2%. For inches to millimeters, multiplying by 25 instead of 25.4 is about 1.6% low.'
      },
      commonValues: {
        title: 'Common millimeters to inches (drill bit) conversions',
        dimension: 'length',
        from: 'mm',
        to: 'in',
        values: [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20],
        decimals: 4,
        reverse: {
          title: 'Common fractional inches to millimeters conversions',
          values: [0.0625, 0.125, 0.1875, 0.25, 0.3125, 0.375, 0.5, 0.625, 0.75, 1]
        }
      },
      watchOut: [
        { title: 'Fractional inches are not decimals', body: '3/8 in is 0.375 in, not 3.8 in. Convert the fraction to a decimal first (divide the top number by the bottom) before typing it in.' },
        { title: 'A millimeter is not a centimeter', body: 'There are 10 mm in a cm, so reading "10" off a ruler\'s cm side instead of its mm side understates a length tenfold. Check which scale you are using.' },
        { title: 'Drill bit sets mix metric and fractional sizes', body: 'A 6 mm bit (0.2362 in) and a 1/4 in bit (6.35 mm) are close but not identical. For a tight fit, match the exact size the fastener calls for, not the nearest-looking one.' },
        { title: 'A tape measure is less precise than this', body: 'A physical ruler or tape measure is usually accurate to about ±0.5 mm (0.02 in), well within the precision shown here.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'millimeters', label: 'Millimeters', type: 'number', placeholder: '10', defaultValue: 10, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Millimeters to Inches Converter (mm to in)',
      description: 'Free millimeters to inches converter: mm to in and back as you type, with the exact 25.4 factor, drill bit sizes, fractional inches and a worked example.',
      faq: [
        { question: 'How do I convert millimeters to inches?', answer: 'Divide by 25.4. For 8 mm: 8 ÷ 25.4 ≈ 0.315 in.' },
        { question: 'How do I convert inches to millimeters?', answer: 'Multiply by 25.4. 0.375 in × 25.4 = 9.525 mm.' },
        { question: 'What is a 10 mm drill bit in inches?', answer: 'About 0.3937 in, slightly larger than a 3/8 in bit (0.375 in, 9.525 mm).' },
        { question: 'How many millimeters is 1/4 inch?', answer: 'Exactly 6.35 mm (0.25 × 25.4).' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply millimeters by 0.04 for a rough inch figure (within about 2%), or inches by 25 for millimeters (within about 1.6%).' },
        { question: 'How many millimeters are in a centimeter?', answer: 'Exactly 10. A 10 mm length is the same as 1 cm — see the centimeters to inches converter for that pair.' }
      ]
    },
    compute(values) {
      const inches = fromBase(toBase(values.millimeters, 'length', 'mm'), 'length', 'in');
      return { inches };
    }
  },
  {
    id: 'milliliters-to-cups-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['ml to cups converter', 'cups to ml calculator', 'convert milliliters to cups', 'cup to milliliter converter', 'recipe cup converter'],
    related: ['ounces-to-milliliters-converter', 'gallons-to-liters-converter', 'volume-converter', 'grams-to-ounces-converter'],
    title: 'Milliliters to Cups Converter',
    description: 'Convert milliliters to US cups, or cups to milliliters, as you type. Covers the US customary cup and the metric cup, and states which is the default.',
    example: '1 US cup is about 236.59 mL, and a 250 mL metric cup is about 1.06 US cups.',
    solver: {
      defaultTarget: 'milliliters',
      variables: [
        { id: 'milliliters', label: 'Milliliters', symbol: 'mL', dimension: 'volume', defaultValue: 236.5882, defaultUnit: 'mL' },
        { id: 'cups', label: 'Cups', symbol: 'cup', dimension: 'volume', defaultValue: 1, defaultUnit: 'cup' }
      ],
      // Both fields hold the same volume (in m³); the unit menus do the converting.
      solve: {
        milliliters: ({ cups }) => (cups >= 0 ? cups : NaN),
        cups: ({ milliliters }) => (milliliters >= 0 ? milliliters : NaN)
      },
      derive: (si) => ({ mLShown: si.milliliters * 1e6 }),
      visuals: [
        {
          type: 'logScale',
          value: 'mLShown',
          min: -1,
          max: 4,
          ticks: ['0.1 mL', '1 mL', '10 mL', '100 mL', '1,000 mL', '10,000 mL'],
          benchmarks: [
            { label: 'A US teaspoon (about 4.93 mL)', value: 4.9289 },
            { label: '1 US cup (236.59 mL)', value: 236.5882 },
            { label: '1 US pint, 2 cups (about 473.18 mL)', value: 473.1765 },
            { label: '1 liter (1,000 mL)', value: 1000 }
          ],
          title: 'How much is that?',
          valueLabel: 'Your volume'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Cups and milliliters',
        paragraphs: [
          'The milliliter is a metric unit of volume, one thousandth of a liter, used on packaging and in recipes almost everywhere outside the US. The cup is a US customary unit for cooking, defined as 8 US fluid ounces. Because the US fluid ounce traces back to the exact 231 cubic inch US gallon (the same exact definition the gallons to liters converter uses), one US cup is exactly 236.5882365 mL — no rounding in the factor itself.',
          'Cup is not one worldwide size, though. This converter defaults to the US customary cup (236.59 mL), the one used in American recipes and on this site\'s other volume converters. A separate metric cup, exactly 250 mL, is used in Australia, New Zealand and some European recipe conversions — close to the US cup but about 5.7% bigger. The unit menu offers both; pick "cup (metric)" for the 250 mL version.',
          'The UK has no standardized "cup" measure for cooking at all: British recipes give volumes in milliliters, pints or fluid ounces, or weigh ingredients in grams, rather than measuring by the cup. A US recipe\'s "1 cup of flour" also cannot be swapped for "1 cup of water" by weight — this converter changes the unit of volume only, not what is being measured.'
        ]
      },
      howTo: {
        intro: 'Type a volume in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Milliliters to cups', text: 'Type the volume in milliliters. The cups field shows the conversion in US customary cups.' },
          { name: 'Cups to milliliters', text: 'Type into the cups field instead. It becomes the input and the milliliters field is calculated.' },
          { name: 'Switch to the metric cup', text: 'Open the cups field\'s menu and choose "cup (metric)" for the 250 mL version used in some recipes.' },
          { name: 'Use other units', text: 'Either menu also offers liters, US and UK fluid ounces, tablespoons and teaspoons.' },
          { name: 'Read the scale', text: 'The scale places the volume against a teaspoon, a cup, a pint and a liter.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A US cup is a fixed number of milliliters, so the conversion is one multiplication or division.',
        expression: 'mL = cup (US) × 236.5882365\ncup (US) = mL ÷ 236.5882365\nmL = cup (metric) × 250',
        terms: [
          { symbol: 'mL', meaning: 'Volume in milliliters, 1/1,000 of a liter.' },
          { symbol: 'cup (US)', meaning: 'US customary cup, 8 US fluid ounces — this converter\'s default.' },
          { symbol: '236.5882365', meaning: 'Milliliters in a US cup, exact: derived from the 231 in³ US gallon.' },
          { symbol: 'cup (metric)', meaning: 'A separate, rounder unit, exactly 250 mL, used in Australia, New Zealand and some recipes.' }
        ],
        note: 'Both factors are exact definitions. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A recipe calls for 1.5 cups of milk, and a European version of the same recipe lists 500 mL of stock. How much is each in the other unit?',
        rows: [
          { label: '1.5 × 236.5882365', value: '354.88 mL' },
          { label: '500 ÷ 236.5882365', value: '2.11 cups' },
          { label: 'Quick check: 1.5 × 240', value: '360 mL' }
        ],
        result: '1.5 cups ≈ 354.88 mL · 500 mL ≈ 2.11 cups',
        explanation: 'Multiplying by 240 instead of the exact 236.588 overstates by about 1.4% — close enough for most recipes, but not for anything measured precisely.'
      },
      commonValues: {
        title: 'Common US cups to milliliters conversions',
        dimension: 'volume',
        from: 'cup',
        to: 'mL',
        values: [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4],
        reverse: {
          title: 'Common milliliters to US cups conversions',
          values: [50, 100, 125, 150, 200, 250, 500, 1000]
        }
      },
      watchOut: [
        { title: 'The metric cup is not the US cup', body: 'A metric cup (250 mL) is about 5.7% bigger than a US customary cup (236.59 mL). Using the wrong one in a recipe adds up over several cups of an ingredient.' },
        { title: 'The UK does not use "cups" as a standard measure', body: 'British recipes give volumes in milliliters, pints or fluid ounces, or weigh ingredients in grams, instead of cups.' },
        { title: 'A "cup" of flour and a "cup" of water are not the same weight', body: 'This converter changes only the unit of volume. A cup of flour weighs roughly half as much as a cup of water, because density differs by ingredient.' },
        { title: 'Dry and liquid measuring cups hold the same volume', body: 'In the US, a dry measuring cup and a liquid measuring cup are both 236.59 mL; they are shaped differently for accuracy, not sized differently.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'cups', label: 'Cups', type: 'number', placeholder: '1', defaultValue: 1, step: 0.25, min: 0 }
    ],
    seo: {
      title: 'Milliliters to Cups Converter (mL to Cups)',
      description: 'Free milliliters to cups converter: mL to US cups and back as you type, plus the metric cup, with the exact factors and a worked example.',
      faq: [
        { question: 'How many milliliters are in a cup?', answer: 'A US customary cup is exactly 236.5882365 mL, about 236.59 mL. A metric cup, used in some countries, is exactly 250 mL.' },
        { question: 'How do I convert milliliters to cups?', answer: 'Divide by 236.5882365. For 500 mL: 500 ÷ 236.5882365 ≈ 2.11 US cups.' },
        { question: 'How do I convert cups to milliliters?', answer: 'Multiply by 236.5882365. 1.5 cups × 236.5882365 ≈ 354.88 mL.' },
        { question: 'Does the UK use cups for cooking?', answer: 'Not as a standard unit. British recipes measure volume in milliliters, pints or fluid ounces, or weigh ingredients in grams.' },
        { question: 'What is the difference between a US cup and a metric cup?', answer: 'A US cup is 236.5882365 mL (8 US fluid ounces); a metric cup is a rounder 250 mL, about 5.7% more. Pick "cup (metric)" from the unit menu if your recipe uses it.' },
        { question: 'How many cups are in a liter?', answer: 'About 4.23 US cups (1,000 ÷ 236.5882365), or exactly 4 metric cups (1,000 ÷ 250).' }
      ]
    },
    compute(values) {
      const milliliters = fromBase(toBase(values.cups, 'volume', 'cup'), 'volume', 'mL');
      return { milliliters };
    }
  },
  {
    id: 'kilograms-to-stone-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['kg to stone converter', 'stone to kg converter', 'convert kilograms to stone', 'kg to stone and pounds', 'stone and pounds calculator'],
    related: ['pounds-to-kilograms-converter', 'weight-converter', 'bmi-calculator', 'grams-to-ounces-converter'],
    title: 'Kilograms to Stone Converter',
    description: 'Convert kilograms to stone, or stone to kilograms, as you type. Results show stone and pounds together, like "11 st 4 lb".',
    example: '70 kg is about 11 st 0 lb, and 11 st 4 lb (158 lb) is about 71.67 kg.',
    solver: {
      defaultTarget: 'stone',
      variables: [
        { id: 'kilograms', label: 'Kilograms', symbol: 'kg', dimension: 'mass', defaultValue: 70, defaultUnit: 'kg' },
        { id: 'stone', label: 'Stone', symbol: 'st', dimension: 'mass', defaultValue: 11.0231, defaultUnit: 'st' }
      ],
      // Both fields hold the same mass (in kg); the unit menus do the converting.
      solve: {
        kilograms: ({ stone }) => (stone >= 0 ? stone : NaN),
        stone: ({ kilograms }) => (kilograms >= 0 ? kilograms : NaN)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'kilograms',
          min: -1,
          max: 3,
          ticks: ['0.1 kg', '1 kg', '10 kg', '100 kg', '1,000 kg'],
          benchmarks: [
            { label: 'A newborn baby (about 3.5 kg, 0.55 st)', value: 3.5 },
            { label: 'A typical airline checked-bag limit (23 kg, 3.62 st)', value: 23 },
            { label: '100 kilograms (15.75 st)', value: 100 },
            { label: '1 metric tonne (157.47 st)', value: 1000 }
          ],
          title: 'How heavy is that?',
          valueLabel: 'Your weight'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Kilograms and stone',
        paragraphs: [
          'The kilogram is the SI base unit of mass, used almost everywhere for everyday weight. The stone is a traditional British and Irish unit, still the everyday way many people in the UK and Ireland state body weight, alongside or instead of kilograms. A stone is defined as 14 pounds, and because the pound has been fixed at exactly 0.45359237 kg since 1959, a stone is exactly 6.35029318 kg — a single, exact conversion with no offset.',
          'Stone is almost always combined with a remainder of pounds rather than used as a decimal: a weight is written "11 st 4 lb", meaning 11 whole stone plus 4 more pounds (158 lb total), not 11.4 stone. Converting that mixed figure means adding the pounds first (11 × 14 + 4 = 158 lb), then converting to kilograms — or going the other way: convert to kilograms, then to total pounds, then split off the whole stone.',
          'The stone is not used for anything except body weight today — parcels, produce and most other everyday weighing in the UK use kilograms or, informally, pounds, not stone. This converter is built for the body-weight use case, so its table below shows results the way a scale or a doctor\'s office would: in whole stone and pounds.'
        ]
      },
      howTo: {
        intro: 'Type a weight in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Kilograms to stone', text: 'Type the weight in kilograms. The stone field shows the conversion as a decimal.' },
          { name: 'Stone to kilograms', text: 'Type into the stone field instead. It becomes the input and the kilograms field is calculated.' },
          { name: 'Read stone and pounds together', text: 'For a weight already written as stone and pounds, such as 11 st 4 lb, add the pounds first (11 × 14 + 4 = 158), switch the stone field\'s unit to lb, and type 158.' },
          { name: 'Use other units', text: 'Either menu also offers pounds, grams, ounces and metric tonnes.' },
          { name: 'Read the scale', text: 'The scale places the weight against a newborn baby, an airline bag limit and a metric tonne.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A stone is a fixed number of kilograms, so the conversion is one multiplication or division.',
        expression: 'kg = st × 6.35029318\nst = kg ÷ 6.35029318\nlb = st × 14',
        terms: [
          { symbol: 'st', meaning: 'Stone, the traditional British/Irish body-weight unit.' },
          { symbol: 'kg', meaning: 'Mass in kilograms, the SI base unit.' },
          { symbol: '6.35029318', meaning: 'Kilograms in a stone, exact: 14 × 0.45359237.' },
          { symbol: 'lb', meaning: 'Pounds; a stone is always exactly 14 of them.' }
        ],
        note: 'The factor is exact. Results are rounded for display only; the stone-and-pounds figure rounds the TOTAL pounds first, then splits it, so it never shows "14 lb".'
      },
      workedExample: {
        intro: 'You weigh 70 kg and want that in stone and pounds. A friend\'s weight is given as 11 st 4 lb — what is that in kilograms?',
        rows: [
          { label: '70 ÷ 0.45359237', value: '154.32 lb' },
          { label: 'Round to the nearest pound, then split (154 ÷ 14 = 11, remainder 0)', value: '11 st 0 lb' },
          { label: '11 st 4 lb as total pounds (11 × 14 + 4)', value: '158 lb' },
          { label: '158 × 0.45359237', value: '71.67 kg' }
        ],
        result: '70 kg ≈ 11 st 0 lb · 11 st 4 lb ≈ 71.67 kg',
        explanation: '70 kg lands almost exactly on a whole stone (11 st 0 lb); a kilogram either way shifts the pounds remainder by about 2 lb, not a whole stone, since a stone is 6.35 kg.'
      },
      commonValues: {
        title: 'Common kilograms to stone conversions',
        dimension: 'mass',
        from: 'kg',
        to: 'st',
        values: [50, 60, 70, 75, 80, 90, 100, 110],
        stoneLbs: 'to',
        reverse: {
          title: 'Common whole stone to kilograms conversions',
          values: [6, 8, 9, 10, 11, 12, 13, 15, 18]
        }
      },
      watchOut: [
        { title: 'Stone and pounds is a mixed unit, not a decimal', body: '11 st 4 lb is not 11.4 stone — it is 11 + 4/14 ≈ 11.29 stone, or 158 lb in total. Add the pounds to the total first.' },
        { title: 'Round the total pounds before splitting', body: 'Splitting an unrounded figure can print an impossible "14 lb" remainder. This converter\'s stone-and-pounds table rounds the total pounds first, then divides by 14, the same way the feet-and-inches tables round total inches first.' },
        { title: 'Stone is rarely used for anything but body weight', body: 'Luggage, parcels and produce in the UK are weighed in kilograms or pounds, not stone. Using "stone" for anything else is almost always informal.' },
        { title: 'Not every English-speaking country uses stone', body: 'The US does not use stone at all for body weight, reporting only pounds; the UK and Ireland are the main places it is still common.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
        { label: 'UK Weights and Measures Act 1985, Schedule 1 (definitions of the pound and the stone)', url: 'https://www.legislation.gov.uk/ukpga/1985/72/schedule/1' }
      ]
    },
    inputs: [
      { id: 'kilograms', label: 'Kilograms', type: 'number', placeholder: '70', defaultValue: 70, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Kilograms to Stone Converter (kg to St, Lb)',
      description: 'Free kilograms to stone converter: kg to stone and back as you type, with results shown in stone and pounds, like "11 st 4 lb".',
      faq: [
        { question: 'How do I convert kilograms to stone?', answer: 'Divide by 6.35029318. For 70 kg: 70 ÷ 6.35029318 ≈ 11.02 stone, which is 11 st 0 lb.' },
        { question: 'How do I convert stone to kilograms?', answer: 'Multiply by 6.35029318. 11 stone × 6.35029318 ≈ 69.85 kg.' },
        { question: 'How many pounds are in a stone?', answer: 'Exactly 14. A weight of 11 st 4 lb is 158 lb in total.' },
        { question: 'What is 158 lb in kilograms?', answer: 'About 71.67 kg (158 × 0.45359237).' },
        { question: 'Why does the stone-and-pounds figure never show "14 lb"?', answer: 'Because the pounds remainder after dividing by 14 is always between 0 and 13. This converter rounds the total pounds first, then splits, so a result like "11 st 14 lb" (which would really be 12 st 0 lb) can never appear.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Divide kilograms by 6.35 for a rough stone figure (70 kg gives about 11.02 st, close to the exact 11.0231), or multiply stone by 6.35 for kilograms.' }
      ]
    },
    compute(values) {
      const stone = fromBase(toBase(values.kilograms, 'mass', 'kg'), 'mass', 'st');
      return { stone };
    }
  },
  {
    id: 'acres-to-hectares-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['acres to hectares converter', 'hectares to acres calculator', 'convert acres to hectares', 'acre to ha converter', 'farmland size converter'],
    related: ['area-converter', 'square-feet-to-square-meters-converter', 'length-converter', 'volume-converter'],
    title: 'Acres to Hectares Converter',
    description: 'Convert acres to hectares, or hectares to acres, as you type. Includes a table of common farmland and land-parcel sizes.',
    example: '1 acre is about 0.4047 hectares, and a 10-hectare farm is about 24.71 acres.',
    solver: {
      defaultTarget: 'hectares',
      variables: [
        { id: 'acres', label: 'Acres', symbol: 'ac', dimension: 'area', defaultValue: 1, defaultUnit: 'acre' },
        { id: 'hectares', label: 'Hectares', symbol: 'ha', dimension: 'area', defaultValue: 0.4047, defaultUnit: 'ha' }
      ],
      // Both fields hold the same area (in m²); the unit menus do the converting.
      solve: {
        acres: ({ hectares }) => (hectares >= 0 ? hectares : NaN),
        hectares: ({ acres }) => (acres >= 0 ? acres : NaN)
      },
      derive: (si) => ({ haShown: si.hectares / 1e4 }),
      visuals: [
        {
          type: 'logScale',
          value: 'haShown',
          min: -1,
          max: 3,
          ticks: ['0.1 ha', '1 ha', '10 ha', '100 ha', '1,000 ha'],
          benchmarks: [
            { label: 'A FIFA-recommended soccer pitch (105 m × 68 m, 0.714 ha)', value: 0.714 },
            { label: 'A US quarter-quarter section, the standard 40-acre survey parcel (about 16.19 ha)', value: 16.1874 },
            { label: '100 hectares (about 247.11 acres)', value: 100 }
          ],
          title: 'How much land is that?',
          valueLabel: 'Your area'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Acres and hectares',
        paragraphs: [
          'The acre is a customary unit of land area, still the standard for real estate listings and farmland in the US; the hectare is the metric land unit used for farmland and land-area statistics in most of the rest of the world. Both are now defined exactly from the meter: an acre is 4,840 square yards, which with the exact 0.9144 m yard works out to exactly 4,046.8564224 m²; a hectare is defined directly as exactly 10,000 m² — a square 100 m on each side.',
          'Because both definitions are exact, converting between them is a single multiplication or division. One acre is about 0.4047 hectares, so an acre is a little under half a hectare; one hectare is about 2.4711 acres, a little under two and a half acres. There is no offset, the same as every other area pair on this site.',
          'Unlike a hectare, an acre has no fixed shape — historically it described the area a team of oxen could plow in a day, and today it is simply 43,560 square feet, in any rectangle, strip or irregular boundary that adds up to that figure. A hectare, by construction, is always exactly 100 m × 100 m if laid out as a square, though a real plot of that area is rarely a perfect square either.'
        ]
      },
      howTo: {
        intro: 'Type an area in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Acres to hectares', text: 'Type the area in acres. The hectares field shows the conversion.' },
          { name: 'Hectares to acres', text: 'Type into the hectares field instead. It becomes the input and the acres field is calculated.' },
          { name: 'Use other units', text: 'Either menu also offers square meters, square feet, square kilometers and square miles.' },
          { name: 'Read the scale', text: 'The scale places the land area against a soccer pitch, a 40-acre survey parcel and 100 hectares.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'An acre is a fixed number of hectares, so the conversion is one multiplication or division.',
        expression: 'ha = acre × 0.40468564224\nacre = ha ÷ 0.40468564224 ≈ ha × 2.47105',
        terms: [
          { symbol: 'acre', meaning: 'Land area, 4,840 square yards (43,560 ft²).' },
          { symbol: 'ha', meaning: 'Hectare, exactly 10,000 m².' },
          { symbol: '0.40468564224', meaning: 'Hectares in an acre, exact: 4,046.8564224 m² ÷ 10,000.' }
        ],
        note: 'Both factors are exact definitions. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A listing advertises a 10-hectare farm, and a neighboring lot is 40 acres. How big is each in the other unit?',
        rows: [
          { label: '10 × 2.47105381', value: '24.71 acres' },
          { label: '40 × 0.40468564224', value: '16.19 ha' },
          { label: 'Quick check: 10 × 2.5', value: '25 acres' }
        ],
        result: '10 ha ≈ 24.71 acres · 40 acres ≈ 16.19 ha',
        explanation: 'Multiplying by 2.5 instead of the exact 2.47105 overstates by about 1.2%; for acres to hectares, multiplying by 0.4 instead of 0.404686 understates by about 1.2%.'
      },
      commonValues: {
        title: 'Common acres to hectares conversions',
        dimension: 'area',
        from: 'acre',
        to: 'ha',
        values: [0.25, 0.5, 1, 2, 5, 10, 20, 40, 100],
        reverse: {
          title: 'Common hectares to acres conversions',
          values: [1, 2, 5, 10, 20, 50, 100, 250]
        }
      },
      watchOut: [
        { title: 'The acre has no fixed shape', body: 'An acre (4,840 yd²) can be any rectangle, strip or irregular boundary that adds up to 43,560 ft². A square acre would be about 208.7 ft on each side.' },
        { title: 'The US survey acre is very slightly different', body: 'Some older US land records use the US survey acre, based on the now-retired US survey foot, about 4 parts per million larger than the international acre this converter uses — not a practical difference for most purposes.' },
        { title: 'A hectare is always 10,000 m²', body: 'Unlike the acre, the hectare is defined directly from the square meter, with no customary-unit history — a cleaner definition, though just as exact once converted to acres.' },
        { title: 'Farmland statistics usually use hectares, listings usually use acres', body: 'International land-area reporting is typically in hectares; US real estate and farmland listings are typically in acres. Converting matters when comparing the two.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'acres', label: 'Acres', type: 'number', placeholder: '1', defaultValue: 1, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Acres to Hectares Converter (Acres to Ha)',
      description: 'Free acres to hectares converter: acres to ha and back as you type, with the exact factor, farmland sizes and a worked example.',
      faq: [
        { question: 'How do I convert acres to hectares?', answer: 'Multiply by 0.40468564224. For 40 acres: 40 × 0.40468564224 ≈ 16.19 ha.' },
        { question: 'How do I convert hectares to acres?', answer: 'Divide by 0.40468564224, or multiply by about 2.47105. 10 ha is about 24.71 acres.' },
        { question: 'How many square feet are in an acre?', answer: 'Exactly 43,560 ft² (4,840 yd²).' },
        { question: 'How many square meters are in a hectare?', answer: 'Exactly 10,000 m², about 2.4711 acres.' },
        { question: 'What is a "quarter-quarter section"?', answer: 'A standard 40-acre parcel in the US Public Land Survey System, about 16.19 hectares.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply acres by 0.4 for a rough hectare figure (about 1.2% low), or hectares by 2.5 for acres (about 1.2% high).' }
      ]
    },
    compute(values) {
      const hectares = fromBase(toBase(values.acres, 'area', 'acre'), 'area', 'ha');
      return { hectares };
    }
  },
  {
    id: 'square-feet-to-square-meters-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['sq ft to sq m converter', 'square feet to square meters calculator', 'convert square feet to square meters', 'square footage to square meters', 'room size converter'],
    related: ['area-converter', 'length-converter', 'acres-to-hectares-converter', 'feet-to-meters-converter'],
    title: 'Square Feet to Square Meters Converter',
    description: 'Convert square feet to square meters, or square meters to square feet, as you type. Includes a table of common room and home sizes.',
    example: '1,500 sq ft (a US home size) is about 139.35 m², and a 70 m² apartment is about 753.47 sq ft.',
    solver: {
      defaultTarget: 'squareMeters',
      variables: [
        { id: 'squareFeet', label: 'Square feet', symbol: 'ft²', dimension: 'area', defaultValue: 1500, defaultUnit: 'ft2' },
        { id: 'squareMeters', label: 'Square meters', symbol: 'm²', dimension: 'area', defaultValue: 139.3546, defaultUnit: 'm2' }
      ],
      // Both fields hold the same area (in m²); the unit menus do the converting. Primary direction
      // is ft²→m², the opposite of area-converter's own default (m²→ft²), by design (overlap rule).
      solve: {
        squareFeet: ({ squareMeters }) => (squareMeters >= 0 ? squareMeters : NaN),
        squareMeters: ({ squareFeet }) => (squareFeet >= 0 ? squareFeet : NaN)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'squareMeters',
          min: 0,
          max: 3,
          ticks: ['1 m²', '10 m²', '100 m²', '1,000 m²'],
          benchmarks: [
            { label: 'A king-size mattress (76 in × 80 in, about 3.92 m², 42.22 ft²)', value: 3.9226 },
            { label: 'A common single-car garage door opening (9 ft × 7 ft, about 5.85 m², 63 ft²)', value: 5.8529 },
            { label: 'A standard parking space (about 15 m², 161.46 ft²)', value: 15 },
            { label: 'A tennis doubles court (78 ft × 36 ft, about 260.87 m²)', value: 260.8717 }
          ],
          title: 'How big is that room?',
          valueLabel: 'Your area'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Square feet and square meters',
        paragraphs: [
          'Square feet is the everyday unit for home and room sizes on US real estate listings; square meters, the SI unit, is used the same way almost everywhere else. Both are simply a length unit squared: a square foot is exactly 0.3048² = 0.09290304 m², because the foot itself has been defined as exactly 0.3048 m since 1959 (see the feet to meters converter).',
          'This pair gets its own page because it is the one international home buyers, renters and travelers hit most often — a listing in one unit and a reader who thinks in the other. The general area converter on this site covers every area unit, including acres and hectares for land; this page is specifically the ft²/m² pair, oriented around room and home sizes rather than farmland or city blocks.',
          'Converting a floor area is different from converting a single length: doubling only one wall of a room does not double the floor area, and the square-foot factor cannot be applied to a single linear measurement. If you only have a room\'s length and width in feet, multiply them together first to get square feet, then convert the result.'
        ]
      },
      howTo: {
        intro: 'Type an area in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Square feet to square meters', text: 'Type the area in square feet. The square meters field shows the conversion.' },
          { name: 'Square meters to square feet', text: 'Type into the square meters field instead. It becomes the input and the square feet field is calculated.' },
          { name: 'Multiply length by width first', text: 'If you only have a room\'s dimensions, multiply length × width in feet (or meters) to get the area before converting.' },
          { name: 'Use other units', text: 'Either menu also offers acres, hectares, square yards and square kilometers.' },
          { name: 'Read the scale', text: 'The scale places the area against a king-size mattress, a garage door opening, a parking space and a tennis court.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A square foot is a fixed number of square meters, so the conversion is one multiplication or division.',
        expression: 'm² = ft² × 0.09290304\nft² = m² ÷ 0.09290304 ≈ m² × 10.76391',
        terms: [
          { symbol: 'ft²', meaning: 'Area in square feet.' },
          { symbol: 'm²', meaning: 'Area in square meters, the SI unit.' },
          { symbol: '0.09290304', meaning: 'Square meters in a square foot, exact: 0.3048 × 0.3048.' }
        ],
        note: 'The factor is exact, from squaring the exact foot definition. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A US listing advertises a 1,500 sq ft home, and a European listing advertises a 70 m² apartment. How big is each in the other unit?',
        rows: [
          { label: '1,500 × 0.09290304', value: '139.35 m²' },
          { label: '70 ÷ 0.09290304', value: '753.47 ft²' },
          { label: 'Quick check: 1,500 × 0.093', value: '139.5 m²' }
        ],
        result: '1,500 ft² ≈ 139.35 m² · 70 m² ≈ 753.47 ft²',
        explanation: 'Multiplying by 0.093 instead of the exact 0.09290304 overstates by about 0.1%, close enough for a rough comparison between listings.'
      },
      commonValues: {
        title: 'Common home sizes, square feet to square meters',
        dimension: 'area',
        from: 'ft2',
        to: 'm2',
        values: [500, 750, 1000, 1200, 1500, 2000, 2500, 3000],
        reverse: {
          title: 'Common room and apartment sizes, square meters to square feet',
          values: [10, 20, 30, 50, 70, 100, 150, 200]
        }
      },
      watchOut: [
        { title: 'This converts area, not a single length', body: 'If you have a room\'s length and width in feet, multiply them together to get square feet first — applying this factor to a single linear measurement gives the wrong answer entirely.' },
        { title: '"Square footage" in a listing can vary', body: 'What counts as a home\'s square footage (finished space only, garage included or not) differs between listings; this converter only changes the unit, not what was included when the figure was measured.' },
        { title: 'Don\'t confuse square feet with linear feet', body: 'A "10-foot wall" is a length (10 ft), not an area (10 ft²) — area needs two dimensions multiplied together.' },
        { title: 'Acres and hectares are for land, not rooms', body: 'For a whole lot or farm rather than a room or home\'s floor area, the acres to hectares converter and the general area converter cover the larger land units.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'squareFeet', label: 'Square feet', type: 'number', placeholder: '1500', defaultValue: 1500, step: 10, min: 0 }
    ],
    seo: {
      title: 'Square Feet to Square Meters Converter (Ft² to M²)',
      description: 'Free square feet to square meters converter: sq ft to m² and back as you type, with the exact factor, room and home sizes, and a worked example.',
      faq: [
        { question: 'How do I convert square feet to square meters?', answer: 'Multiply by 0.09290304. For 1,500 ft²: 1,500 × 0.09290304 ≈ 139.35 m².' },
        { question: 'How do I convert square meters to square feet?', answer: 'Divide by 0.09290304, or multiply by about 10.76391. 70 m² is about 753.47 ft².' },
        { question: 'How many square meters is a 1,500 sq ft home?', answer: 'About 139.35 m² (1,500 × 0.09290304).' },
        { question: 'How many square feet is a 100 m² apartment?', answer: 'About 1,076.39 ft² (100 ÷ 0.09290304).' },
        { question: 'Why is this a separate page from the area converter?', answer: 'The general area converter covers every area unit, including acres and hectares for land. This page is the dedicated square feet/square meters pair, with a table built around room and home sizes.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply square feet by about 0.093 for square meters (about 0.1% high), or square meters by about 10.8 for square feet (about 0.3% high).' }
      ]
    },
    compute(values) {
      const squareMeters = fromBase(toBase(values.squareFeet, 'area', 'ft2'), 'area', 'm2');
      return { squareMeters };
    }
  },
  {
    id: 'horsepower-to-kilowatts-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['hp to kw calculator', 'horsepower to kw converter', 'car horsepower to kilowatts', 'engine hp to kw converter', 'electric motor hp to kw'],
    related: ['power-converter', 'energy-converter', 'pressure-converter', 'force-calculator'],
    title: 'Horsepower to Kilowatts Converter',
    description: 'Convert horsepower to kilowatts, or kilowatts to horsepower, as you type. Built around car and electric-motor power ratings.',
    example: 'A 150 hp car engine is about 111.86 kW, and a 3 kW electric motor is about 4.02 hp.',
    solver: {
      defaultTarget: 'kilowatts',
      variables: [
        { id: 'horsepower', label: 'Horsepower', symbol: 'hp', dimension: 'power', defaultValue: 150, defaultUnit: 'hp' },
        { id: 'kilowatts', label: 'Kilowatts', symbol: 'kW', dimension: 'power', defaultValue: 111.855, defaultUnit: 'kW' }
      ],
      // Both fields hold the same power (in watts); the unit menus already list every power unit in
      // lib/units.ts. Primary direction is hp->kW, the opposite of power-converter's own default
      // (kW->hp), by design (overlap rule) — this page's own angle is car and motor ratings.
      solve: {
        horsepower: ({ kilowatts }) => (kilowatts >= 0 ? kilowatts : NaN),
        kilowatts: ({ horsepower }) => (horsepower >= 0 ? horsepower : NaN)
      },
      derive: (si) => ({ kwShown: si.kilowatts / 1000 }),
      visuals: [
        {
          type: 'logScale',
          value: 'kwShown',
          min: -2,
          max: 4,
          ticks: ['0.01 kW', '0.1 kW', '1 kW', '10 kW', '100 kW', '1,000 kW', '10,000 kW'],
          benchmarks: [
            { label: 'A small household electric motor (about 1 kW / 1.34 hp)', value: 1 },
            { label: 'A compact car engine (about 70 hp / 52.2 kW)', value: 52.199 },
            { label: 'A family car engine (about 150 hp / 111.9 kW)', value: 111.855 },
            { label: 'A sports car engine (about 500 hp / 372.8 kW)', value: 372.8499 }
          ],
          title: 'How powerful is that?',
          valueLabel: 'Your power'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Horsepower and kilowatts, for cars and motors',
        paragraphs: [
          'Horsepower (hp) and the kilowatt (kW) both measure power — energy delivered per unit of time — and either can describe the same engine or motor. The general power converter on this site covers the full set of power units (watts, megawatts, PS, BTU/h) on an appliance-to-industrial scale; this page is specifically the hp/kW pair, oriented around car engines and electric motors, the two places most people actually need it.',
          'Mechanical horsepower is defined as 550 foot-pounds-force per second, exactly 745.69987158227 W. A car brochure that lists both figures — say "111.9 kW (150 hp)" — is describing one engine with two different, exact units; neither number is an approximation of the other, they are both exact conversions of the same physical output.',
          'Electric motor nameplates sometimes use a different, rounded "electrical horsepower" of exactly 746 W, a US convention from motor manufacturing, rather than the 745.69987158227 W mechanical horsepower used throughout this site. The two are extremely close — about 0.04% apart — but it explains why a motor\'s kW-to-hp conversion printed on its own nameplate can differ very slightly from this converter\'s result.'
        ]
      },
      howTo: {
        intro: 'Type a power value in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Horsepower to kilowatts', text: 'Type the engine or motor rating in horsepower. The kilowatts field shows the conversion.' },
          { name: 'Kilowatts to horsepower', text: 'Type into the kilowatts field instead. It becomes the input and horsepower is calculated.' },
          { name: 'Use other power units', text: 'Either menu also offers watts, megawatts, metric horsepower (PS) and BTU per hour.' },
          { name: 'Read the scale', text: 'The scale places the power against a small motor, a compact car, a family car and a sports car engine.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A horsepower is a fixed number of watts, so the conversion is one multiplication or division.',
        expression: 'kW = hp × 0.74569987158227\nhp = kW ÷ 0.74569987158227',
        terms: [
          { symbol: 'hp', meaning: 'Mechanical horsepower, 550 foot-pounds-force per second.' },
          { symbol: 'kW', meaning: 'Kilowatts, the SI unit of power scaled by 1,000.' },
          { symbol: '0.74569987158227', meaning: 'Kilowatts in one horsepower, exact from the definition.' }
        ],
        note: 'The factor is exact, from the historical definition of mechanical horsepower. Results are rounded for display only.'
      },
      workedExample: {
        intro: 'A car\'s spec sheet lists a 150 hp engine, and a motor catalog lists a 3 kW electric motor. How much is each in the other unit?',
        rows: [
          { label: '150 × 0.74569987158227', value: '111.86 kW' },
          { label: '3 ÷ 0.74569987158227', value: '4.02 hp' },
          { label: 'Quick check: 150 × 0.746', value: '111.9 kW' }
        ],
        result: '150 hp ≈ 111.86 kW · 3 kW ≈ 4.02 hp',
        explanation: 'Multiplying by 0.746 instead of the exact 0.74569987158227 overstates by about 0.04%, close enough for a rough comparison between a car spec sheet and a motor catalog.'
      },
      commonValues: {
        title: 'Common car and motor horsepower to kilowatts conversions',
        dimension: 'power',
        from: 'hp',
        to: 'kW',
        values: [70, 100, 150, 200, 300, 400, 500, 700],
        reverse: {
          title: 'Common electric motor kilowatts to horsepower conversions',
          values: [1, 1.5, 2.2, 3.7, 5.5, 7.5, 11, 15, 22]
        }
      },
      watchOut: [
        { title: 'hp and PS (metric horsepower) are different units', body: 'This converter\'s "hp" is mechanical horsepower (745.69987158227 W); metric horsepower (PS), common on European and Japanese spec sheets, is a slightly smaller unit (735.49875 W). See the power converter for a PS-specific breakdown.' },
        { title: 'Motor nameplates sometimes use a rounded 746 W "electrical horsepower"', body: 'The difference from the 745.69987158227 W mechanical horsepower used here is tiny — about 0.04% — but it is why two sources can print very slightly different kW figures for the same motor.' },
        { title: 'Power is not energy', body: 'A 150 hp engine running for an hour does not use "150 hp" of anything — power is a rate. For the energy side of a car or motor, see the energy converter.' },
        { title: 'A bigger engine number is not always a faster car', body: 'Horsepower and kilowatts measure the engine\'s power output, not the vehicle\'s weight, gearing, aerodynamics or traction, all of which also decide how a car actually performs.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'horsepower', label: 'Horsepower', type: 'number', placeholder: '150', defaultValue: 150, step: 1, min: 0 }
    ],
    seo: {
      title: 'Horsepower to Kilowatts Converter (hp to kW)',
      description: 'Free horsepower to kilowatts converter: hp to kW and back as you type, with the exact factor, car and motor power ratings, and a worked example.',
      faq: [
        { question: 'How do I convert horsepower to kilowatts?', answer: 'Multiply by 0.74569987158227. For 150 hp: 150 × 0.74569987158227 ≈ 111.86 kW.' },
        { question: 'How do I convert kilowatts to horsepower?', answer: 'Divide by 0.74569987158227, or multiply by about 1.34102. 3 kW ÷ 0.74569987158227 ≈ 4.02 hp.' },
        { question: 'How many kW is a 150 hp car?', answer: 'About 111.86 kW (150 × 0.74569987158227).' },
        { question: 'How many hp is a 100 kW motor?', answer: 'About 134.10 hp (100,000 ÷ 745.69987158227).' },
        { question: 'Why is this a separate page from the power converter?', answer: 'The general power converter covers every power unit, including metric horsepower (PS) and BTU per hour. This page is the dedicated hp/kW pair, with a table built around car and electric-motor ratings.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply hp by about 0.746 for kW (about 0.04% high), or kW by about 1.34 for hp (about 0.08% low).' }
      ]
    },
    compute(values) {
      const kilowatts = fromBase(toBase(values.horsepower, 'power', 'hp'), 'power', 'kW');
      return { kilowatts };
    }
  },
  {
    id: 'bar-to-psi-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['bar to psi calculator', 'espresso machine bar to psi', 'pressure washer psi to bar', 'tire pressure bar to psi', 'convert bar to psi'],
    related: ['pressure-converter', 'force-calculator', 'power-converter', 'energy-converter'],
    title: 'Bar to PSI Converter',
    description: 'Convert bar to psi, or psi to bar, as you type. Built around tire, espresso-machine and pressure-washer ratings.',
    example: 'An espresso machine\'s 9 bar pump is about 130.53 psi, and a car tire at 32 psi is about 2.21 bar.',
    solver: {
      defaultTarget: 'psi',
      variables: [
        { id: 'bar', label: 'Bar', symbol: 'bar', dimension: 'pressure', defaultValue: 9, defaultUnit: 'bar' },
        { id: 'psi', label: 'PSI', symbol: 'psi', dimension: 'pressure', defaultValue: 130.534, defaultUnit: 'psi' }
      ],
      // Both fields hold the same pressure (in pascals); the unit menus already list every pressure
      // unit in lib/units.ts. Primary direction is bar->psi, the opposite of pressure-converter's
      // own default (psi->bar), by design (overlap rule) — this page's own angle is tire, espresso
      // and pressure-washer ratings rather than the general Pa-to-Torr scale.
      solve: {
        bar: ({ psi }) => (psi >= 0 ? psi : NaN),
        psi: ({ bar }) => (bar >= 0 ? bar : NaN)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'bar',
          min: -1,
          max: 3,
          ticks: ['0.1 bar', '1 bar', '10 bar', '100 bar', '1,000 bar'],
          benchmarks: [
            { label: 'A road bicycle tire (about 100 psi / 6.9 bar)', value: 6.895 },
            { label: 'A car tire (about 32 psi / 2.2 bar)', value: 2.206 },
            { label: 'An espresso machine\'s pump (about 9 bar / 130.5 psi)', value: 9 },
            { label: 'A consumer pressure washer (up to about 150 bar / 2,176 psi)', value: 150 }
          ],
          title: 'How much pressure is that?',
          valueLabel: 'Your pressure'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Bar and psi, for tires, washers and espresso machines',
        paragraphs: [
          'Bar and psi (pounds-force per square inch) are two everyday pressure units — bar is close to ordinary atmospheric pressure (100,000 Pa) and is common on European equipment specs; psi is the US customary unit and appears on tire placards and US-made pressure washers. The general pressure converter on this site covers the full scientific set (Pa, atm, mmHg, Torr); this page is specifically the bar/psi pair, oriented around the consumer equipment people actually look up — tires, pressure washers and espresso machines.',
          'Espresso extraction is conventionally built around 9 bar of pump pressure (about 130.5 psi) — a long-standing reference point that many machines and portafilter pressure gauges are marked against, even though a given shot\'s actual brew pressure can vary with the grind, dose and tamp.',
          'Consumer electric pressure washers are usually rated in psi in the US and bar almost everywhere else, from light-duty machines around 1,300 psi (about 90 bar) up to heavy-duty models above 2,000 psi (about 138 bar). Car and bicycle tires sit at a much lower pressure than either — typically 30-35 psi (about 2.1-2.4 bar) for a car, 80-120 psi (about 5.5-8.3 bar) for a road bike.'
        ]
      },
      howTo: {
        intro: 'Type a pressure in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Bar to psi', text: 'Type the pressure in bar. The psi field shows the conversion.' },
          { name: 'PSI to bar', text: 'Type into the psi field instead. It becomes the input and bar is calculated.' },
          { name: 'Use other pressure units', text: 'Either menu also offers pascals, kilopascals, atmospheres, mmHg, inHg and Torr.' },
          { name: 'Read the scale', text: 'The scale places the pressure against a bicycle tire, a car tire, an espresso machine and a pressure washer.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A bar is a fixed number of psi, so the conversion is one multiplication or division.',
        expression: 'psi = bar × 100,000 ÷ 6,894.757293168\npsi ≈ bar × 14.5038',
        terms: [
          { symbol: 'bar', meaning: 'Pressure in bar, exactly 100,000 Pa.' },
          { symbol: 'psi', meaning: 'Pounds-force per square inch, exactly 6,894.757293168 Pa.' },
          { symbol: '14.5038', meaning: 'PSI in one bar, exact (100,000 ÷ 6,894.757293168), rounded for display here.' }
        ],
        note: 'Both bar and psi are exact by definition, so results are rounded for display only.'
      },
      workedExample: {
        intro: 'An espresso machine\'s gauge reads 9 bar, and a car tire placard calls for 32 psi. How much is each in the other unit?',
        rows: [
          { label: '9 × 100,000 ÷ 6,894.757293168', value: '130.53 psi' },
          { label: '32 × 6,894.757293168 ÷ 100,000', value: '2.21 bar' },
          { label: 'Quick check: 9 × 14.5', value: '130.5 psi' }
        ],
        result: '9 bar ≈ 130.53 psi · 32 psi ≈ 2.21 bar',
        explanation: 'Multiplying by 14.5 instead of the exact 14.5038 understates by about 0.03%, close enough for comparing a gauge reading to a spec sheet.'
      },
      commonValues: {
        title: 'Common bar to psi conversions (tires, bikes, espresso, pressure washers)',
        dimension: 'pressure',
        from: 'bar',
        to: 'psi',
        values: [1, 1.5, 2.2, 2.5, 2.8, 3, 9, 100, 130, 150],
        reverse: {
          title: 'Common psi to bar conversions (tires and pressure washers)',
          values: [30, 32, 35, 80, 100, 120, 1300, 1600, 2000, 3000]
        }
      },
      watchOut: [
        { title: 'Gauge pressure, not absolute pressure', body: 'A tire or washer gauge reads pressure relative to the surrounding atmosphere; this converter treats every number as the pressure itself. For tires and pressure washers that is exactly how the rating is normally quoted, so no adjustment is needed for everyday use.' },
        { title: 'Actual espresso brew pressure varies', body: 'The "9 bar" figure is a long-standing reference point for machine pumps, not a guarantee of what pressure reaches the coffee puck — grind size, dose and tamp all change the real resistance the pump works against.' },
        { title: 'US and European pressure-washer ratings use different units', body: 'A US-market washer\'s psi rating and a European one\'s bar rating are not directly comparable at a glance — convert first. 2,000 psi is about 138 bar, not 2,000 bar.' },
        { title: 'For the full pressure unit set, see the pressure converter', body: 'Pascals, atmospheres, mmHg, inHg and Torr — along with the mmHg-vs-Torr nuance — are covered on the general pressure converter, not repeated here.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'bar', label: 'Bar', type: 'number', placeholder: '9', defaultValue: 9, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Bar to PSI Converter (Tires, Espresso, Pressure Washers)',
      description: 'Free bar to psi converter: bar to psi and back as you type, with the exact factor, tire, espresso-machine and pressure-washer examples.',
      faq: [
        { question: 'How do I convert bar to psi?', answer: 'Multiply by about 14.5038. For 9 bar: 9 × 14.5038 ≈ 130.53 psi.' },
        { question: 'How do I convert psi to bar?', answer: 'Divide by about 14.5038, or multiply by about 0.0689476. 32 psi × 0.0689476 ≈ 2.21 bar.' },
        { question: 'What psi is a 9 bar espresso machine?', answer: 'About 130.53 psi (9 × 100,000 ÷ 6,894.757293168).' },
        { question: 'What bar is a 2,000 psi pressure washer?', answer: 'About 137.9 bar (2,000 × 6,894.757293168 ÷ 100,000).' },
        { question: 'Why is this a separate page from the pressure converter?', answer: 'The general pressure converter covers every pressure unit, including atmospheres, mmHg and Torr. This page is the dedicated bar/psi pair, with a table built around tire, espresso-machine and pressure-washer ratings.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply bar by about 14.5 for psi (about 0.03% low), or psi by about 0.069 for bar (about 0.08% high).' }
      ]
    },
    compute(values) {
      const psi = fromBase(toBase(values.bar, 'pressure', 'bar'), 'pressure', 'psi');
      return { psi };
    }
  },
  {
    id: 'kilocalories-to-kilojoules-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['kcal to kj calculator', 'calories to kilojoules converter', 'food label kcal to kj', 'convert kcal to kj', 'nutrition energy converter'],
    related: ['energy-converter', 'calorie-calculator', 'power-converter', 'pressure-converter'],
    title: 'Kilocalories to Kilojoules Converter',
    description: 'Convert kilocalories (food Calories) to kilojoules, or kilojoules to kilocalories, as you type. Built around nutrition-label figures.',
    example: 'A 200 kcal snack-bar label is about 836.8 kJ, and a 1,000 kJ EU label figure is about 239.01 kcal.',
    solver: {
      defaultTarget: 'kilojoules',
      variables: [
        { id: 'kilocalories', label: 'Kilocalories', symbol: 'kcal', dimension: 'energy', defaultValue: 200, defaultUnit: 'kcal' },
        { id: 'kilojoules', label: 'Kilojoules', symbol: 'kJ', dimension: 'energy', defaultValue: 836.8, defaultUnit: 'kJ' }
      ],
      // Both fields hold the same energy (in joules); the unit menus already list every energy unit
      // in lib/units.ts. Primary direction is kcal->kJ, the opposite of energy-converter's own
      // default (kJ->kcal), by design (overlap rule) — this page's own angle is reading a food
      // nutrition label, which some countries print in kcal, some in kJ, and some in both.
      solve: {
        kilocalories: ({ kilojoules }) => (kilojoules >= 0 ? kilojoules : NaN),
        kilojoules: ({ kilocalories }) => (kilocalories >= 0 ? kilocalories : NaN)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'kilocalories',
          min: 0,
          max: 4,
          ticks: ['1 kcal', '10 kcal', '100 kcal', '1,000 kcal', '10,000 kcal'],
          benchmarks: [
            { label: 'A piece of fruit (about 80 kcal, 334.7 kJ)', value: 80 },
            { label: 'A snack bar (about 200 kcal, 836.8 kJ)', value: 200 },
            { label: 'A fast-food meal (about 800 kcal, 3,347 kJ)', value: 800 },
            { label: 'A whole day\'s food intake for many adults (about 2,000 kcal, 8,368 kJ)', value: 2000 }
          ],
          title: 'How much food energy is that?',
          valueLabel: 'Your energy'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Reading a food label in kcal or kJ',
        paragraphs: [
          'A food "Calorie" (capital C), the unit on US nutrition labels, is actually a kilocalorie — 1,000 of the small chemistry calories, or exactly 4,184 J. Many other countries\' nutrition labels print kilojoules instead, or both figures side by side. The general energy converter on this site covers the full set of energy units (joules, BTU, kWh); this page is specifically the kcal/kJ pair, oriented around reading a food label in whichever unit it happens to use.',
          'Because the kcal-to-kJ factor (4.184, exact) is not a round number, a label\'s printed kJ figure for a given kcal figure is always a rounded conversion, not a separately measured quantity — the two numbers describe the exact same food energy. A product that advertises "200 Calories" and one that advertises "836.8 kJ" can be the identical food, just labeled for a different market.',
          'This converter uses the thermochemical calorie (4.184 J, exact), the definition food-energy figures are built from. It is a fixed, defined ratio, not a laboratory measurement with its own uncertainty, which is why a kcal-to-kJ conversion is always exact to as many decimal places as you want.'
        ]
      },
      howTo: {
        intro: 'Type an energy value in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Kilocalories to kilojoules', text: 'Type the figure in kilocalories (the "Calories" on a US label). The kilojoules field shows the conversion.' },
          { name: 'Kilojoules to kilocalories', text: 'Type into the kilojoules field instead. It becomes the input and kilocalories is calculated.' },
          { name: 'Use other energy units', text: 'Either menu also offers joules, megajoules, calories, watt-hours, kilowatt-hours and BTU.' },
          { name: 'Read the scale', text: 'The scale places the figure against a piece of fruit, a snack bar, a fast-food meal and a full day\'s intake.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A kilocalorie is a fixed number of kilojoules, so the conversion is one multiplication or division.',
        expression: 'kJ = kcal × 4.184\nkcal = kJ ÷ 4.184',
        terms: [
          { symbol: 'kcal', meaning: 'Kilocalories — a food "Calorie" is one kilocalorie.' },
          { symbol: 'kJ', meaning: 'Kilojoules, 1,000 joules, the SI-derived unit many non-US food labels use.' },
          { symbol: '4.184', meaning: 'Kilojoules in one kilocalorie, exact (the thermochemical calorie is defined as 4.184 J).' }
        ],
        note: 'The factor is exact by definition, so results are rounded for display only.'
      },
      workedExample: {
        intro: 'A US-market snack bar\'s label says 200 Calories, and an EU-market label on another product says 1,000 kJ. How much is each in the other unit?',
        rows: [
          { label: '200 × 4.184', value: '836.8 kJ' },
          { label: '1,000 ÷ 4.184', value: '239.01 kcal' },
          { label: 'Quick check: 200 × 4', value: '800 kJ' }
        ],
        result: '200 kcal ≈ 836.8 kJ · 1,000 kJ ≈ 239.01 kcal',
        explanation: 'Multiplying by 4 instead of the exact 4.184 understates kJ by about 4.4%, close enough for a rough comparison, but not for anything exact.'
      },
      commonValues: {
        title: 'Common food-label kilocalories to kilojoules conversions',
        dimension: 'energy',
        from: 'kcal',
        to: 'kJ',
        values: [100, 150, 200, 250, 300, 400, 500, 600],
        decimals: 1,
        reverse: {
          title: 'Common food-label kilojoules to kilocalories conversions',
          values: [500, 1000, 1500, 2000, 2500, 3000, 4000]
        }
      },
      watchOut: [
        { title: 'This converts the printed label figure, not a daily reference value', body: 'A country\'s official "reference daily intake" shown on a label (where required) is a separate regulatory figure set by that country\'s food authority, and its kJ and kcal versions are sometimes rounded differently from each other rather than being an exact conversion of one another. This converter only does the literal arithmetic on whatever number you type in.' },
        { title: 'A food Calorie is a kilocalorie, not a calorie', body: 'The capital-C "Calorie" on US labels equals 1,000 of the small chemistry "calories" (lowercase) — exactly one kilocalorie, 4,184 J. Confusing the two is a factor-of-1,000 mistake.' },
        { title: '"Energy" on a label is not the same as "fat" or "sugar" grams', body: 'The kcal/kJ figure is the food\'s total energy from all sources (carbohydrate, protein, fat and alcohol); converting it does not tell you anything about any single nutrient.' },
        { title: 'For the full energy unit set, see the energy converter', body: 'Joules, calories, watt-hours, kilowatt-hours and BTU — including the BTU-definition and calorie-type notes — are covered on the general energy converter, not repeated here.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'kilocalories', label: 'Kilocalories', type: 'number', placeholder: '200', defaultValue: 200, step: 1, min: 0 }
    ],
    seo: {
      title: 'Kilocalories to Kilojoules Converter (kcal to kJ)',
      description: 'Free kcal to kJ converter: kilocalories to kilojoules and back as you type, with the exact factor and nutrition-label examples.',
      faq: [
        { question: 'How do I convert kcal to kJ?', answer: 'Multiply by 4.184. For 200 kcal: 200 × 4.184 = 836.8 kJ.' },
        { question: 'How do I convert kJ to kcal?', answer: 'Divide by 4.184. For 1,000 kJ: 1,000 ÷ 4.184 ≈ 239.01 kcal.' },
        { question: 'How many kJ is a 200-Calorie snack?', answer: 'About 836.8 kJ (200 × 4.184).' },
        { question: 'How many Calories is a 1,000 kJ label figure?', answer: 'About 239.01 kcal (1,000 ÷ 4.184).' },
        { question: 'Why is this a separate page from the energy converter?', answer: 'The general energy converter covers every energy unit, including joules, BTU and kWh. This page is the dedicated kcal/kJ pair, with a table built around food-label-sized figures.' },
        { question: 'Is there an easy way to convert in my head?', answer: 'Multiply kcal by 4 for a rough kJ figure (about 4.4% low), or divide kJ by 4 for kcal (about 4.6% high).' }
      ]
    },
    compute(values) {
      const kilojoules = fromBase(toBase(values.kilocalories, 'energy', 'kcal'), 'energy', 'kJ');
      return { kilojoules };
    }
  },
  {
    id: 'megabytes-to-gigabytes-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['mb to gb calculator', 'file size converter', 'phone storage mb to gb', 'photo and video file size converter', 'convert mb to gb'],
    related: ['data-storage-converter', 'character-counter', 'time-converter', 'energy-converter'],
    title: 'Megabytes to Gigabytes Converter',
    description: 'Convert megabytes to gigabytes, or gigabytes to megabytes, as you type. Built around file, photo, video and data-plan sizes.',
    example: 'A 500 MB photo library is 0.5 GB (decimal), and a 2 GB data plan is 2,000 MB.',
    solver: {
      defaultTarget: 'gigabytes',
      variables: [
        { id: 'megabytes', label: 'Megabytes', symbol: 'MB', dimension: 'data', defaultValue: 500, defaultUnit: 'MB' },
        { id: 'gigabytes', label: 'Gigabytes', symbol: 'GB', dimension: 'data', defaultValue: 0.5, defaultUnit: 'GB' }
      ],
      // Both fields hold the same amount of data (in bits); the unit menus already list every data
      // unit in lib/units.ts, decimal and binary. Primary direction is MB->GB, the opposite of
      // data-storage-converter's own default (GB->MB), by design (overlap rule) — this page's own
      // angle is file, photo/video and phone/data-plan sizes, not the full bit/byte/binary scope.
      solve: {
        megabytes: ({ gigabytes }) => (gigabytes >= 0 ? gigabytes : NaN),
        gigabytes: ({ megabytes }) => (megabytes >= 0 ? megabytes : NaN)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'megabytes',
          min: -1,
          max: 6,
          ticks: ['0.1 MB', '10 MB', '1,000 MB', '100,000 MB', '10,000,000 MB'],
          benchmarks: [
            { label: 'A phone photo (about 4 MB)', value: 4 },
            { label: 'A 3-minute music track (about 8 MB)', value: 8 },
            { label: 'A small phone data plan (2 GB, 2,000 MB)', value: 2000 },
            { label: 'A smartphone\'s storage (128 GB, 128,000 MB)', value: 128000 }
          ],
          title: 'How much data is that?',
          valueLabel: 'Your data'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'Megabytes and gigabytes, for files and data plans',
        paragraphs: [
          'A gigabyte (decimal) is 1,000 megabytes, and a megabyte is 1,000,000 bytes — the counting system every file size, phone storage spec and mobile data plan is sold in. The general data storage converter on this site covers the full decimal-and-binary set (bits, bytes, KB through PB, KiB through TiB); this page is specifically the MB/GB pair, oriented around the sizes people actually look up — photos, videos, downloads and data plans.',
          'There is a second, equally valid way to count: binary, where a "gibibyte" (GiB) is 1,024 mebibytes (MiB), the power of two closest to 1,000. A file manager or phone settings screen that is actually counting in binary but labeling the result "GB" will show a smaller number than the decimal gigabyte figure for the exact same file — a 500 MB (decimal, 500,000,000-byte) photo library is about 476.84 MiB, not 500.',
          'A phone advertised with "128 GB" of storage never shows quite 128 GB free out of the box. Part of the gap is exactly this counting difference (decimal GB vs. binary GiB, if the display is using binary math under a "GB" label); the rest is the operating system, pre-installed apps and the storage formatting itself, none of which is a unit-conversion issue at all.'
        ]
      },
      howTo: {
        intro: 'Type an amount of data in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'Megabytes to gigabytes', text: 'Type the file or data-plan size in megabytes. The gigabytes field shows the conversion.' },
          { name: 'Gigabytes to megabytes', text: 'Type into the gigabytes field instead. It becomes the input and megabytes is calculated.' },
          { name: 'Use other data units', text: 'Either menu also offers bits, kilobits, megabits, gigabits, bytes, and the binary KiB, MiB, GiB and TiB.' },
          { name: 'Read the scale', text: 'The scale places the amount against a photo, a music track, a small data plan and a smartphone\'s storage.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A megabyte is a fixed number of gigabytes, so the conversion is one multiplication or division by 1,000.',
        expression: 'GB = MB ÷ 1,000\nMB = GB × 1,000',
        terms: [
          { symbol: 'MB', meaning: 'Megabytes, 1,000,000 bytes (decimal, the way files and plans are sold).' },
          { symbol: 'GB', meaning: 'Gigabytes, 1,000 megabytes, 1,000,000,000 bytes (decimal).' }
        ],
        note: 'Both are exact decimal (base-1,000) SI prefixes, so results are exact; display rounding only shows up on non-round inputs.'
      },
      workedExample: {
        intro: 'A photo library is 500 MB, and a mobile data plan is sold as 2 GB. How much is each in the other unit?',
        rows: [
          { label: '500 ÷ 1,000', value: '0.5 GB' },
          { label: '2 × 1,000', value: '2,000 MB' },
          { label: 'Same 500 MB, expressed in binary MiB', value: '≈ 476.84 MiB' }
        ],
        result: '500 MB = 0.5 GB · 2 GB = 2,000 MB',
        explanation: 'The decimal MB-to-GB conversion is exact. The 476.84 MiB figure is not a different amount of data — it is the same bytes counted in binary (1,024-based) units instead of decimal, which is why a file manager using binary math can show a smaller number under a "GB" or "MB" label.'
      },
      commonValues: {
        title: 'Common file and download sizes, megabytes to gigabytes',
        dimension: 'data',
        from: 'MB',
        to: 'GB',
        values: [100, 250, 500, 750, 1000, 2000, 5000, 10000],
        reverse: {
          title: 'Common phone and data-plan sizes, gigabytes to megabytes',
          values: [1, 2, 5, 10, 20, 50, 100]
        }
      },
      watchOut: [
        { title: 'Decimal MB/GB and binary MiB/GiB are not the same number', body: 'A file manager or OS setting that counts in binary (1,024-based) but labels the result "MB" or "GB" shows a smaller number than the decimal figure for the identical file — 500 MB decimal is about 476.84 MiB binary, same bytes either way.' },
        { title: '"128 GB" of phone storage is never 128 GB free', body: 'System software, pre-installed apps and storage formatting all take real space before you store anything, on top of any decimal-vs-binary display difference — none of it is a unit-conversion error.' },
        { title: 'Network speed (Mbps) is not the same unit as file size (MB)', body: 'Internet and phone-plan speeds are quoted in bits per second; there are 8 bits in a byte, so a "100 Mbps" connection downloads at roughly 12.5 MB/s, not 100 MB/s. See the data storage converter for the full bits-vs-bytes breakdown.' },
        { title: 'For the full data unit set, see the data storage converter', body: 'Bits, bytes, kilobytes through petabytes and the binary KiB/MiB/GiB/TiB set are all covered on the general data storage converter, not repeated here.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST "Prefixes for Binary Multiples"', url: 'https://physics.nist.gov/cuu/Units/binary.html' }
      ]
    },
    inputs: [
      { id: 'megabytes', label: 'Megabytes', type: 'number', placeholder: '500', defaultValue: 500, step: 10, min: 0 }
    ],
    seo: {
      title: 'Megabytes to Gigabytes Converter (MB to GB)',
      description: 'Free MB to GB converter: megabytes to gigabytes and back as you type, with decimal vs binary explained and file-size examples.',
      faq: [
        { question: 'How do I convert MB to GB?', answer: 'Divide by 1,000. For 500 MB: 500 ÷ 1,000 = 0.5 GB.' },
        { question: 'How do I convert GB to MB?', answer: 'Multiply by 1,000. For 2 GB: 2 × 1,000 = 2,000 MB.' },
        { question: 'Is 1,000 MB always 1 GB?', answer: 'In the decimal system this converter uses, yes, exactly. Some operating systems instead count in binary (1,024-based MiB/GiB) but still show the label "GB" or "MB," which gives a smaller displayed number for the same bytes.' },
        { question: 'Why does my phone show less storage than advertised?', answer: 'Partly decimal-vs-binary counting (if the display uses binary math under a decimal label) and partly system software, pre-installed apps and storage formatting, which take real space regardless of counting system.' },
        { question: 'Why is this a separate page from the data storage converter?', answer: 'The general data storage converter covers every data unit, including bits and the binary KiB/MiB/GiB/TiB set. This page is the dedicated MB/GB pair, with a table built around file, photo/video and data-plan sizes.' },
        { question: 'How many MB is a 100 Mbps internet connection per second?', answer: 'About 12.5 MB/s — divide the megabit figure by 8, since there are 8 bits in a byte.' }
      ]
    },
    compute(values) {
      const gigabytes = fromBase(toBase(values.megabytes, 'data', 'MB'), 'data', 'GB');
      return { gigabytes };
    }
  },
  {
    id: 'mpg-to-l-100km-converter',
    category: 'measurements',
    updatedAt: '2026-10-25',
    aliases: ['mpg to l/100km converter', 'fuel economy converter', 'l/100km to mpg calculator', 'miles per gallon to liters per 100km', 'uk mpg to us mpg converter'],
    related: ['gas-cost-calculator', 'fuel-cost-calculator', 'speed-converter', 'volume-converter'],
    title: 'MPG to L/100km Converter',
    description: 'Convert miles per gallon to liters per 100 km, or back, as you type. Covers US mpg, UK mpg and km/L.',
    example: 'A 28 mpg (US) car uses about 8.40 L/100 km, and a 6 L/100 km car is about 39.20 mpg (US).',
    solver: {
      defaultTarget: 'l100km',
      variables: [
        { id: 'mpg', label: 'Miles per gallon (US)', symbol: 'mpg', dimension: 'fuelEconomy', defaultValue: 28, defaultUnit: 'mpg' },
        { id: 'l100km', label: 'Liters per 100 km', symbol: 'L/100km', dimension: 'fuelEconomy', defaultValue: 8.4005, defaultUnit: 'L/100km' }
      ],
      // Both fields hold the same fuel economy (volume per distance, in m³/m); the unit menus
      // already list mpg (US), mpg (UK) and km/L, each modeled in lib/units.ts as the reciprocal of
      // the base (so this calculator writes no reciprocal math of its own — toBase/fromBase already
      // do it). Primary direction is mpg (US)->L/100 km, the site's primary market's search
      // direction (CLAUDE.md). The >= 0 guard is the same pattern every other pair converter uses;
      // 0 or a negative mpg or L/100 km is already caught upstream (0 mpg is Infinity in SI — see
      // lib/solverState.ts) before solve() ever runs, so no Infinity reaches the page.
      solve: {
        mpg: ({ l100km }) => (l100km >= 0 ? l100km : NaN),
        l100km: ({ mpg }) => (mpg >= 0 ? mpg : NaN)
      },
      derive: (si) => ({ mpgShown: fromBase(si.mpg, 'fuelEconomy', 'mpg') }),
      visuals: [
        {
          type: 'logScale',
          value: 'mpgShown',
          min: 0,
          max: 2,
          ticks: ['1 mpg', '10 mpg', '100 mpg'],
          benchmarks: [
            { label: 'A full-size pickup truck (about 18 mpg, 13.1 L/100 km)', value: 18 },
            { label: 'A typical sedan (about 30 mpg, 7.84 L/100 km)', value: 30 },
            { label: 'A compact hybrid (about 50 mpg, 4.70 L/100 km)', value: 50 }
          ],
          title: 'How efficient is that, in mpg (US)?',
          valueLabel: 'Your fuel economy'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-25',
      concept: {
        title: 'MPG and liters per 100 km measure fuel economy in opposite directions',
        paragraphs: [
          'Miles per gallon (mpg) is distance per volume of fuel — a bigger number means a more efficient car. Liters per 100 km is volume of fuel per distance — a smaller number means a more efficient car. The two run in opposite directions and are not related by a simple multiplication; converting between them means dividing a constant by the value, not multiplying by one, which is why this page\'s math always goes through a division.',
          'The US and UK define a different-sized gallon, so "miles per gallon" is two different units depending on which country\'s gallon is meant. A US gallon is 3.785411784 liters; a UK (imperial) gallon is 4.54609 liters, about 20.1% bigger. For the exact same real fuel economy, the UK mpg number is about 20% higher than the US mpg number, because each UK gallon carries the car further. This converter offers both mpg (US) and mpg (UK) in its unit menus, plus km/L.',
          'Liters per 100 km has no US/UK ambiguity — a liter is a liter everywhere — which is one reason most of the world settled on it instead of a gallon-based unit. The 100 km distance is just a convenient scale, chosen so everyday cars land in a readable range (roughly 4 to 15) rather than a long string of decimals.'
        ]
      },
      howTo: {
        intro: 'Type a fuel economy in either field. The other one, marked auto, is converted as you type.',
        steps: [
          { name: 'MPG to L/100 km', text: 'Type your car\'s rating in miles per gallon. The L/100 km field shows the conversion.' },
          { name: 'L/100 km to MPG', text: 'Type into the L/100 km field instead. It becomes the input and mpg is calculated.' },
          { name: 'Switch to UK mpg or km/L', text: 'Open either menu to choose mpg (UK) instead of mpg (US), or km/L.' },
          { name: 'Read the scale', text: 'The scale places the fuel economy against a pickup truck, a sedan and a hybrid, in mpg (US).' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'MPG and L/100 km are reciprocals of each other (through a unit-conversion constant), not a simple multiplication.',
        expression: 'L/100 km = 235.214583 ÷ mpg (US)\nmpg (US) = 235.214583 ÷ L/100 km\nL/100 km = 282.480936 ÷ mpg (UK)',
        terms: [
          { symbol: '235.214583', meaning: 'Exactly 100 × (US gallon in liters, 3.785411784) ÷ (mile in km, 1.609344) — the US mpg/L-per-100km constant.' },
          { symbol: '282.480936', meaning: 'The same constant using the UK (imperial) gallon, 4.54609 L, in place of the US gallon.' }
        ],
        note: 'The constants are exact, built from the exact mile, US gallon and UK gallon definitions. A higher mpg always means a lower L/100 km, and the reverse.'
      },
      workedExample: {
        intro: 'A car is rated 28 mpg (US). A European spec sheet for a different car lists 6 L/100 km. How efficient is each in the other unit?',
        rows: [
          { label: '235.214583 ÷ 28', value: '8.40 L/100 km' },
          { label: '235.214583 ÷ 6', value: '39.20 mpg (US)' },
          { label: 'Which is more efficient: 28 mpg or 6 L/100 km?', value: '6 L/100 km (≈39.2 mpg) is more efficient' }
        ],
        result: '28 mpg (US) ≈ 8.40 L/100 km · 6 L/100 km ≈ 39.20 mpg (US)',
        explanation: 'The 6 L/100 km car is more efficient than the 28 mpg car (39.2 mpg-equivalent beats 28 mpg) — reading the two numbers correctly matters more here than with most unit pairs, since a bigger L/100 km number is actually worse, the opposite of mpg.'
      },
      commonValues: {
        title: 'Common mpg (US) to L/100 km conversions',
        dimension: 'fuelEconomy',
        from: 'mpg',
        to: 'L/100km',
        values: [15, 20, 25, 28, 30, 35, 40, 50, 60],
        reverse: {
          title: 'Common L/100 km to mpg (US) conversions',
          values: [3, 4, 5, 6, 7, 8, 10, 12, 15]
        }
      },
      watchOut: [
        { title: 'Higher mpg is better; higher L/100 km is worse', body: 'The two scales run in opposite directions. Going from 20 to 40 mpg and going from 10 to 5 L/100 km describe the same improvement; mixing up which direction is "better" on either scale gives the exact opposite conclusion.' },
        { title: 'UK mpg and US mpg are not the same unit', body: 'A UK (imperial) gallon is bigger (4.54609 L vs. 3.785411784 L), so for the same real fuel economy, mpg (UK) reads about 20% higher than mpg (US) — 40 mpg (UK) is about 33.3 mpg (US), not the same car doing worse.' },
        { title: 'Small gains matter more at low mpg than at high mpg', body: 'Because fuel used is distance ÷ mpg, going from 10 to 20 mpg saves far more fuel over a given distance than going from 40 to 80 mpg, even though both are "double the mpg." Compare L/100 km or total fuel used, not mpg points, when judging a real saving.' },
        { title: 'Typing 0 or a negative value shows no answer, not an error', body: 'Zero and negative fuel economy are not physically meaningful (they would imply infinite or reversed fuel use), so the calculator shows no result for either field rather than a nonsensical number.' }
      ],
      references: [
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NIST Handbook 44, Appendix C, General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' }
      ]
    },
    inputs: [
      { id: 'mpg', label: 'Miles per gallon (US)', type: 'number', placeholder: '28', defaultValue: 28, step: 0.1, min: 1 }
    ],
    seo: {
      title: 'MPG to L/100km Converter (US & UK MPG)',
      description: 'Free mpg to L/100km converter: miles per gallon to liters per 100 km and back, with US mpg, UK mpg and km/L, and a fuel-economy comparison example.',
      faq: [
        { question: 'How do I convert mpg to L/100 km?', answer: 'Divide 235.214583 by the mpg (US) figure. For 28 mpg: 235.214583 ÷ 28 ≈ 8.40 L/100 km.' },
        { question: 'How do I convert L/100 km to mpg?', answer: 'Divide 235.214583 by the L/100 km figure. For 6 L/100 km: 235.214583 ÷ 6 ≈ 39.20 mpg (US).' },
        { question: 'How do I convert UK mpg to L/100 km?', answer: 'Divide 282.480936 by the mpg (UK) figure, using the bigger imperial gallon. For 40 mpg (UK): 282.480936 ÷ 40 ≈ 7.06 L/100 km.' },
        { question: 'Is UK mpg the same as US mpg?', answer: 'No. The imperial (UK) gallon is about 20.1% bigger than the US gallon, so for the same real fuel economy the UK mpg number reads about 20% higher. 40 mpg (UK) is about 33.3 mpg (US).' },
        { question: 'Why does a bigger number mean something different on each scale?', answer: 'Mpg is distance per volume (bigger is better); L/100 km is volume per distance (smaller is better). They measure the same thing from opposite directions, so the converter divides rather than multiplies.' },
        { question: 'What happens if I type 0 mpg?', answer: 'The calculator shows no result. Zero or negative fuel economy has no physical meaning, so rather than showing an error or an infinite number, the field is simply left blank.' }
      ]
    },
    compute(values) {
      const l100km = fromBase(toBase(values.mpg, 'fuelEconomy', 'mpg'), 'fuelEconomy', 'L/100km');
      return { l100km };
    }
  },
  {
    id: 'cups-to-grams-converter',
    category: 'measurements',
    updatedAt: '2026-10-26',
    aliases: ['cups to grams calculator', 'grams to cups converter', 'baking conversion calculator', 'cup to gram converter for cooking', 'convert cups to grams'],
    related: ['cups-to-grams-flour', 'cups-to-grams-sugar', 'cups-to-grams-butter', 'cups-to-grams-rice', 'milliliters-to-cups-converter', 'grams-to-ounces-converter'],
    title: 'Cups to Grams Converter',
    description: 'Convert cups to grams for common cooking and baking ingredients, with ounces shown alongside. Pick an ingredient first — a cup of flour, sugar and butter are three different weights.',
    example: '1 cup of all-purpose flour weighs about 120 g (4.23 oz); 1 cup of granulated sugar weighs about 198 g (6.98 oz) — same cup, different ingredient, different weight.',
    breakdown: {
      headline: 'grams',
      headlineLabel: 'Weight',
      outputs: [{ id: 'grams', label: 'Weight', format: 'number', dimension: 'mass', unit: 'g', alsoIn: ['oz'] }],
      visual: {
        type: 'logScale',
        value: 'grams',
        min: -1,
        max: 4,
        ticks: ['0.1 g', '1 g', '10 g', '100 g', '1,000 g', '10,000 g'],
        benchmarks: [
          { label: '1 tablespoon of butter (about 14.13 g)', value: 14.125 },
          { label: '1 stick of butter (113 g)', value: 113 },
          { label: '1 cup of all-purpose flour (120 g)', value: 120 },
          { label: '1 pound (453.59 g)', value: 453.59237 }
        ],
        title: 'How much is that?',
        valueLabel: 'Your amount'
      }
    },
    content: {
      lastReviewed: '2026-10-26',
      concept: {
        title: 'Why a cup of flour and a cup of sugar don’t weigh the same',
        paragraphs: [
          'A cup measures volume — how much space an ingredient takes up — not weight. Weight depends on density, and density is different for every ingredient: a cup of light, airy flour weighs far less than a cup of dense, syrupy honey, even though both fill the same measuring cup to the same line. That is why a single "cups to grams" factor cannot exist for cooking the way it does for a pure unit like inches or pounds: the number of grams in a cup is a property of the ingredient, not of the cup.',
          'This calculator covers the most commonly searched cooking and baking ingredients. Pick one from the menu, type an amount in cups (or switch to tablespoons, teaspoons or milliliters in the unit menu), and it multiplies your amount by that ingredient’s grams-per-cup figure. The reference table below lists every ingredient at a glance, and the dedicated flour, sugar, butter and rice pages go deeper on each.',
          'Every figure here traces to a named, primary source: King Arthur Baking Company’s published Ingredient Weight Chart for most baking ingredients, and USDA FoodData Central for rice, milk and honey, which that chart does not cover. Each source also states its own measuring method — King Arthur’s flour figure, for instance, assumes the flour was spooned into the cup and leveled, not scooped straight from the bag. Changing the method changes the weight, which the dedicated ingredient pages explain in more detail.',
          'The cup used throughout is the US customary cup, exactly 236.5882365 mL. A metric cup, used in Australia, New Zealand and some recipes, is a rounder 250 mL — about 5.7% bigger. If your recipe uses a metric cup, multiply any gram figure here by about 1.057 (250 ÷ 236.5882365) to match it.'
        ]
      },
      howTo: {
        intro: 'Choose an ingredient, then type an amount. The weight updates as you type.',
        steps: [
          { name: 'Pick an ingredient', text: 'Open the ingredient menu and choose what you are measuring — flour, sugar, butter and nine other common ingredients are listed.' },
          { name: 'Type the amount', text: 'Enter the amount in cups, or switch the unit menu to tablespoons, teaspoons or milliliters.' },
          { name: 'Read the weight', text: 'The result shows grams, with ounces alongside it.' },
          { name: 'Check the reference table', text: 'Scan 1 cup of every listed ingredient at once, in grams and ounces, with its source.' },
          { name: 'Switch ingredients anytime', text: 'Changing the ingredient re-runs the same amount through its own density — the cup amount you typed does not change.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Weight is amount times density: grams equal the number of cups times how much one cup of that ingredient weighs.',
        expression: 'grams = cups × density (g per US cup)\noz = grams ÷ 28.349523125',
        terms: [
          { symbol: 'cups', meaning: 'Volume in US customary cups, 236.5882365 mL each.' },
          { symbol: 'density', meaning: 'Grams in one cup of the chosen ingredient — a measured, cited figure, not a fixed unit factor.' },
          { symbol: '28.349523125', meaning: 'Grams in one avoirdupois ounce, exact.' }
        ],
        note: 'Unlike a length or mass conversion, the "density" term is an ingredient property from a cited source, not a defined physical constant — it can vary with how the ingredient is measured.'
      },
      workedExample: {
        intro: 'A recipe calls for 2½ cups of all-purpose flour, and the same amount of granulated sugar for a second batch.',
        rows: [
          { label: '2.5 cups flour × 120 g/cup', value: '300.00 g' },
          { label: '300 ÷ 28.349523125', value: '10.58 oz' },
          { label: '2.5 cups sugar × 198 g/cup', value: '495.00 g' }
        ],
        result: '2.5 cups of flour ≈ 300 g (10.58 oz); 2.5 cups of sugar ≈ 495 g',
        explanation: 'The cup amount is identical in both lines — only the ingredient changed, and the weight differs by 195 g. Always check which ingredient a "cups to grams" figure is for.'
      },
      referenceTable: {
        title: 'Grams and ounces per US cup, by ingredient',
        columns: ['Ingredient', 'Grams per cup', 'Ounces per cup'],
        rows: INGREDIENT_DENSITIES.map((item) => ({
          label: item.label,
          values: [item.gramsPerCup, fromBase(toBase(item.gramsPerCup, 'mass', 'g'), 'mass', 'oz')]
        })),
        decimals: 2,
        note: 'Each figure is for 1 US customary cup (236.5882365 mL), rounded for display. A metric cup (250 mL) is about 5.7% bigger — multiply any figure by about 1.057 to use one instead. See the sources below for each ingredient’s own method.'
      },
      watchOut: [
        { title: 'A cup is a volume, grams are a weight', body: 'The two only relate to each other through an ingredient’s density, which is why this page asks which ingredient you are measuring before it can give you an answer.' },
        { title: 'This is the US customary cup', body: 'A metric cup (250 mL), used in Australia, New Zealand and some recipes, is about 5.7% bigger. Scale any gram figure here by about 1.057 if your recipe uses one.' },
        { title: 'How you fill the cup changes the weight', body: 'Spooning flour into a cup and leveling it gives a different weight than scooping straight from the bag; packing brown sugar firmly gives a different weight than scooping it loosely. The dedicated ingredient pages state which method their figure assumes.' },
        { title: 'Not every ingredient is listed', body: 'This picker covers common baking and cooking ingredients with a citable published density. For anything else, the most reliable option is weighing 1 cup of it yourself on a kitchen scale.' }
      ],
      references: [
        { label: "King Arthur Baking Company, Ingredient Weight Chart", url: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart' },
        { label: 'USDA FoodData Central, U.S. Department of Agriculture (rice #169756 and #168878, milk #171265, honey #169640)', url: 'https://fdc.nal.usda.gov/' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'amount', label: 'Amount', type: 'number', placeholder: '1', defaultValue: 1, step: 0.25, min: 0, dimension: 'volume', unit: 'cup' },
      {
        id: 'ingredient',
        label: 'Ingredient',
        type: 'number',
        placeholder: String(gramsPerCup('flour')),
        defaultValue: gramsPerCup('flour'),
        step: 1,
        min: 0,
        options: INGREDIENT_DENSITIES.map((item) => ({ value: item.gramsPerCup, label: item.label }))
      }
    ],
    seo: {
      title: 'Cups to Grams Converter – By Ingredient',
      description: 'Free cups to grams converter: pick an ingredient — flour, sugar, butter, rice and more — and convert cups to grams and ounces, with every figure cited.',
      faq: [
        { question: 'How many grams are in a cup?', answer: 'It depends entirely on the ingredient. A cup of all-purpose flour is about 120 g, a cup of granulated sugar is about 198 g, and a cup of butter is about 226 g — pick your ingredient from the menu to get the right figure.' },
        { question: 'Why doesn’t a cup always weigh the same in grams?', answer: 'A cup is a volume. Weight depends on density, which is different for every ingredient, so "how many grams in a cup" only has an answer once you say which ingredient.' },
        { question: 'Is this the US cup or the metric cup?', answer: 'The US customary cup, 236.5882365 mL. A metric cup (250 mL), used in some countries, is about 5.7% bigger — multiply by about 1.057 to convert a figure here to the metric cup.' },
        { question: 'How many ounces are in a cup of flour?', answer: 'About 4.23 oz (120 g ÷ 28.349523125), using the spooned-and-leveled figure this page and the dedicated flour page use.' },
        { question: 'What if my ingredient isn’t listed?', answer: 'Weigh 1 cup of it on a kitchen scale. Density is a property of the ingredient, not a physical constant, so an unlisted ingredient has no single correct factor to look up.' },
        { question: 'Does how I fill the cup change the gram figure?', answer: 'Yes. Spooning an ingredient in and leveling it, scooping it straight from a container, and packing it down can each give a noticeably different weight for the "same" cup. See the flour and sugar pages for specific figures.' }
      ]
    },
    compute(values) {
      const grams = values.amount * values.ingredient;
      return { grams };
    }
  },
  {
    id: 'cups-to-grams-flour',
    category: 'measurements',
    updatedAt: '2026-10-26',
    aliases: ['flour cups to grams', 'how many grams in a cup of flour', 'all purpose flour grams per cup', 'flour grams to cups converter', 'baking flour weight converter'],
    related: ['cups-to-grams-converter', 'cups-to-grams-sugar', 'cups-to-grams-butter', 'grams-to-ounces-converter', 'milliliters-to-cups-converter'],
    title: 'Cups to Grams – All-Purpose Flour',
    description: 'Convert cups of all-purpose flour to grams and ounces, using King Arthur Baking’s spooned-and-leveled figure, with a table of common amounts and the scooped-flour trap explained.',
    example: '1 cup of all-purpose flour, spooned and leveled, weighs about 120 g (4.23 oz); 2 cups weighs about 240 g (8.47 oz).',
    breakdown: {
      headline: 'grams',
      headlineLabel: 'Flour weight',
      outputs: [{ id: 'grams', label: 'Flour weight', format: 'number', dimension: 'mass', unit: 'g', alsoIn: ['oz'] }],
      visual: {
        type: 'logScale',
        value: 'grams',
        min: -1,
        max: 4,
        ticks: ['0.1 g', '1 g', '10 g', '100 g', '1,000 g', '10,000 g'],
        benchmarks: [
          { label: '1 tablespoon of flour (about 7.5 g)', value: 7.5 },
          { label: '1 cup of flour (120 g)', value: 120 },
          { label: '2 cups of flour (240 g)', value: 240 },
          { label: 'A 1 kg bag of flour', value: 1000 }
        ],
        title: 'How much flour is that?',
        valueLabel: 'Your amount'
      }
    },
    content: {
      lastReviewed: '2026-10-26',
      concept: {
        title: 'How much does a cup of flour weigh?',
        paragraphs: [
          'King Arthur Baking Company’s published Ingredient Weight Chart gives all-purpose flour as 120 g per US cup (236.5882365 mL), measured by spooning the flour into the cup and leveling it off with a straight edge — never packing or shaking it down. That is the figure this page uses, and the one most US recipes implicitly assume when they give a weight for "1 cup of flour."',
          'The same chart gives bread flour the identical 120 g per cup, using the same method. Bread flour and all-purpose flour differ in protein content, not in how densely their particles pack into a measuring cup, so the two flours weigh about the same per cup even though they bake differently.',
          'Weighing flour is more reliable than measuring it by cup precisely because the cup method is sensitive to how you fill it. A kitchen scale removes that variable entirely: 120 g of flour is 120 g of flour, however it got into the bowl.'
        ]
      },
      howTo: {
        intro: 'Type an amount of flour in cups. The weight updates as you type.',
        steps: [
          { name: 'Type the cup amount', text: 'Enter how many cups of flour the recipe calls for.' },
          { name: 'Use another unit if you prefer', text: 'Switch the unit menu to tablespoons, teaspoons or milliliters.' },
          { name: 'Read the weight', text: 'The result shows grams, with ounces alongside it.' },
          { name: 'Spoon and level, don’t scoop', text: 'This figure assumes flour spooned into the cup and leveled — see the watch-out below for what scooping changes.' },
          { name: 'Check the table', text: 'Common cup amounts from ¼ cup to 2 cups are listed below in grams and ounces.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Flour weight is cups times King Arthur’s spooned-and-leveled figure of 120 g per cup.',
        expression: 'grams = cups × 120\noz = grams ÷ 28.349523125',
        terms: [
          { symbol: 'cups', meaning: 'Volume of flour in US customary cups.' },
          { symbol: '120', meaning: 'Grams per cup of all-purpose flour, spooned into the cup and leveled (King Arthur Baking Company).' },
          { symbol: '28.349523125', meaning: 'Grams in one avoirdupois ounce, exact.' }
        ],
        note: 'The 120 g figure is this source’s measured value for its stated method, not a defined physical constant. Scooping instead of spooning gives a heavier cup — see the watch-out below.'
      },
      workedExample: {
        intro: 'A cookie recipe calls for 2¼ cups of all-purpose flour, spooned and leveled.',
        rows: [
          { label: '2.25 cups × 120 g/cup', value: '270.00 g' },
          { label: '270 ÷ 28.349523125', value: '9.52 oz' },
          { label: 'If scooped instead, about 140 g/cup', value: '315.00 g' }
        ],
        result: '2¼ cups ≈ 270 g (9.52 oz), spooned and leveled',
        explanation: 'Scooping instead of spooning adds about 45 g here — nearly ¼ cup’s worth of extra flour — enough to noticeably toughen a dough or make a batter heavier than intended.'
      },
      referenceTable: {
        title: 'All-purpose flour: cups to grams and ounces',
        columns: ['Amount', 'Grams', 'Ounces'],
        rows: CUP_AMOUNTS.map(({ label, cups }) => cupAmountRow(label, cups, gramsPerCup('flour'))),
        decimals: 2,
        note: 'Flour spooned into the cup and leveled (King Arthur Baking Company, 120 g per US cup). Scooped flour typically weighs more — see the watch-out below.'
      },
      watchOut: [
        { title: 'Spooned, not scooped', body: 'Scooping a measuring cup directly into a flour bag compacts the flour and commonly weighs 130–150 g per cup — up to 25% more than the 120 g spooned-and-leveled figure this page uses. The difference can toughen baked goods or throw off a recipe’s hydration.' },
        { title: 'Sifted flour is measured after sifting', body: 'If a recipe says "1 cup sifted flour," it means measure after sifting, not before — sifting adds air, so a cup of sifted flour weighs less than a cup of the same flour before it was sifted.' },
        { title: 'Bread flour weighs about the same per cup', body: 'King Arthur’s chart lists bread flour at the identical 120 g per cup — the two flours differ in protein content, not in how they pack into a measuring cup.' },
        { title: 'This is US all-purpose flour', body: 'Flour milled to other countries’ standards (such as UK plain flour) can have a different protein content and, in some cases, a different typical density than US all-purpose flour.' }
      ],
      references: [
        { label: "King Arthur Baking Company, Ingredient Weight Chart", url: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'amount', label: 'Flour', type: 'number', placeholder: '1', defaultValue: 1, step: 0.25, min: 0, dimension: 'volume', unit: 'cup' }
    ],
    seo: {
      title: 'Cups to Grams – All-Purpose Flour Converter',
      description: 'Free flour cups to grams converter: convert all-purpose flour, spooned and leveled, to grams and ounces, with a table and the scooped-flour trap explained.',
      faq: [
        { question: 'How many grams are in a cup of flour?', answer: 'About 120 g, using King Arthur Baking Company’s spooned-and-leveled figure — flour spooned into the cup and leveled off, not scooped from the bag.' },
        { question: 'Is bread flour the same weight per cup as all-purpose flour?', answer: 'Yes, per the same chart — both are listed at 120 g per cup. They differ in protein content, which affects baking, not in how densely they fill a measuring cup.' },
        { question: 'Why do some sources say a cup of flour is 125 g or even 150 g?', answer: 'Different sources use different measuring methods. Scooping flour straight from the bag packs it down and commonly gives 130–150 g per cup; this page uses the spooned-and-leveled method (120 g), which most US recipes assume.' },
        { question: 'How many ounces are in a cup of flour?', answer: 'About 4.23 oz (120 g ÷ 28.349523125).' },
        { question: 'How much is 2 cups of flour in grams?', answer: '240 g (2 × 120 g), about 8.47 oz.' },
        { question: 'Should I weigh flour instead of measuring it by cup?', answer: 'For consistent results, yes — King Arthur Baking itself recommends weighing flour, since cup measurements vary with how the flour is handled.' }
      ]
    },
    compute(values) {
      const grams = values.amount * gramsPerCup('flour');
      return { grams };
    }
  },
  {
    id: 'cups-to-grams-sugar',
    category: 'measurements',
    updatedAt: '2026-10-26',
    aliases: ['sugar cups to grams', 'how many grams in a cup of sugar', 'granulated sugar grams per cup', 'brown sugar cups to grams', 'powdered sugar cups to grams'],
    related: ['cups-to-grams-converter', 'cups-to-grams-flour', 'cups-to-grams-butter', 'grams-to-ounces-converter', 'milliliters-to-cups-converter'],
    title: 'Cups to Grams – Sugar',
    description: 'Convert cups of granulated, packed brown or powdered sugar to grams and ounces, with all three side by side, using King Arthur Baking’s ingredient weight chart.',
    example: '1 cup of granulated sugar weighs about 198 g (6.98 oz); 1 cup of packed brown sugar weighs about 213 g (7.51 oz); 1 cup of powdered sugar weighs about 113 g (3.99 oz).',
    breakdown: {
      headline: 'grams',
      headlineLabel: 'Sugar weight',
      outputs: [{ id: 'grams', label: 'Sugar weight', format: 'number', dimension: 'mass', unit: 'g', alsoIn: ['oz'] }],
      groups: [{ inputs: ['sugarType', 'amount'] }],
      visual: {
        type: 'logScale',
        value: 'grams',
        min: -1,
        max: 4,
        ticks: ['0.1 g', '1 g', '10 g', '100 g', '1,000 g', '10,000 g'],
        benchmarks: [
          { label: '1 tablespoon of granulated sugar (about 12.38 g)', value: 12.375 },
          { label: '1 cup of granulated sugar (198 g)', value: 198 },
          { label: '1 cup of packed brown sugar (213 g)', value: 213 },
          { label: 'A 1 kg bag of sugar', value: 1000 }
        ],
        title: 'How much sugar is that?',
        valueLabel: 'Your amount'
      }
    },
    content: {
      lastReviewed: '2026-10-26',
      concept: {
        title: 'Granulated, brown and powdered sugar don’t weigh the same',
        paragraphs: [
          'King Arthur Baking Company’s Ingredient Weight Chart lists three different sugars at three different cup weights: granulated sugar at 198 g per cup, brown sugar (packed) at 213 g per cup, and unsifted powdered (confectioners’) sugar at 113 g per cup. "Sugar" in a recipe can mean any of the three, so this page lets you pick which one you are measuring.',
          'Brown sugar’s figure assumes it is packed firmly into the cup, which is how almost every recipe means it unless it specifically says "lightly packed" or "loose" — the molasses coating brown sugar grains makes them clump and compress, so packing matters more for brown sugar than for granulated sugar.',
          'Powdered sugar is fine and powdery, so it compresses easily too; this figure is for sugar that has not been sifted first. If a recipe calls for "1 cup sifted powdered sugar," measure after sifting — sifting adds air and lightens the cup for the same weight of sugar.'
        ]
      },
      howTo: {
        intro: 'Choose which sugar you are measuring, then type the amount in cups.',
        steps: [
          { name: 'Pick the sugar type', text: 'Choose granulated, packed brown, or powdered (unsifted) sugar from the menu.' },
          { name: 'Type the cup amount', text: 'Enter how many cups the recipe calls for.' },
          { name: 'Use another unit if you prefer', text: 'Switch the unit menu to tablespoons, teaspoons or milliliters.' },
          { name: 'Read the weight', text: 'The result shows grams, with ounces alongside it.' },
          { name: 'Check the table', text: 'All three sugars are compared side by side, cup amount by cup amount, below.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Sugar weight is cups times that sugar’s own grams-per-cup figure.',
        expression: 'grams = cups × density (198 granulated, 213 brown packed, or 113 powdered)\noz = grams ÷ 28.349523125',
        terms: [
          { symbol: 'cups', meaning: 'Volume of sugar in US customary cups.' },
          { symbol: 'density', meaning: 'Grams per cup for the chosen sugar type (King Arthur Baking Company).' },
          { symbol: '28.349523125', meaning: 'Grams in one avoirdupois ounce, exact.' }
        ],
        note: 'Each density is a measured figure for its own stated method (packed for brown sugar, unsifted for powdered), not a defined physical constant.'
      },
      workedExample: {
        intro: 'A cake recipe needs ¾ cup of granulated sugar for the batter and ½ cup of packed brown sugar for the streusel topping.',
        rows: [
          { label: '0.75 cup granulated × 198 g/cup', value: '148.50 g' },
          { label: '0.5 cup packed brown × 213 g/cup', value: '106.50 g' },
          { label: 'Total sugar by weight', value: '255.00 g' }
        ],
        result: '¾ cup granulated + ½ cup packed brown sugar ≈ 255 g total',
        explanation: 'Weighing each sugar separately by its own figure, then adding the weights, avoids compounding two different cup-measuring errors into one dish.'
      },
      referenceTable: {
        title: 'Granulated, brown and powdered sugar: cups to grams',
        columns: ['Amount', 'Granulated (g)', 'Brown, packed (g)', 'Powdered, unsifted (g)'],
        rows: CUP_AMOUNTS.map(({ label, cups }) => ({
          label,
          values: [cups * gramsPerCup('sugar'), cups * gramsPerCup('brownSugar'), cups * gramsPerCup('powderedSugar')]
        })),
        decimals: 2,
        note: 'King Arthur Baking Company: granulated sugar 198 g/cup; brown sugar 213 g/cup, packed; powdered sugar 113 g/cup, unsifted.'
      },
      watchOut: [
        { title: 'Granulated, brown and powdered sugar are not interchangeable by cup', body: 'The same cup amount of each weighs a different number of grams — use the table above or the matching sugar type in the calculator, not one figure for all three.' },
        { title: 'Brown sugar is measured packed', body: 'This figure assumes brown sugar pressed firmly into the cup, which is how most recipes mean it. Loosely scooped brown sugar takes up more volume for the same weight, so it weighs less per cup than this figure.' },
        { title: 'Powdered sugar settles and compresses', body: 'This figure is for unsifted powdered sugar. Sifted powdered sugar holds more air for the same weight, so measuring after sifting (as a recipe specifying "sifted" intends) gives a lighter cup.' },
        { title: 'This is the US customary cup', body: 'A metric cup (250 mL) is about 5.7% bigger than the US cup used here — scale any figure by about 1.057 if your recipe uses a metric cup.' }
      ],
      references: [
        { label: "King Arthur Baking Company, Ingredient Weight Chart", url: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      {
        id: 'sugarType',
        label: 'Sugar type',
        type: 'number',
        placeholder: String(gramsPerCup('sugar')),
        defaultValue: gramsPerCup('sugar'),
        step: 1,
        min: 0,
        options: [
          { value: gramsPerCup('sugar'), label: 'Granulated sugar' },
          { value: gramsPerCup('brownSugar'), label: 'Brown sugar, packed' },
          { value: gramsPerCup('powderedSugar'), label: "Powdered (confectioners') sugar" }
        ]
      },
      { id: 'amount', label: 'Amount', type: 'number', placeholder: '1', defaultValue: 1, step: 0.25, min: 0, dimension: 'volume', unit: 'cup' }
    ],
    seo: {
      title: 'Cups to Grams – Sugar Converter',
      description: 'Free sugar cups to grams converter: granulated, packed brown or powdered sugar, to grams and ounces, with all three compared in one table.',
      faq: [
        { question: 'How many grams are in a cup of sugar?', answer: 'About 198 g for granulated sugar, 213 g for packed brown sugar, or 113 g for unsifted powdered sugar — the three are different weights per cup.' },
        { question: 'How many grams are in a cup of brown sugar?', answer: 'About 213 g, packed firmly into the cup — the method almost every recipe assumes when it says "1 cup brown sugar."' },
        { question: 'How many grams are in a cup of powdered sugar?', answer: 'About 113 g, unsifted. Sifted powdered sugar weighs less per cup because sifting adds air.' },
        { question: 'How many ounces are in a cup of sugar?', answer: 'About 6.98 oz for granulated sugar (198 g ÷ 28.349523125).' },
        { question: 'Is brown sugar heavier than granulated sugar?', answer: 'Yes, per cup — 213 g versus 198 g — because packed brown sugar’s molasses-coated grains compress more densely into the same measuring cup.' },
        { question: 'Does the type of sugar matter for a recipe?', answer: 'Yes. Substituting one sugar for another by cup, rather than by the matching weight, changes how much sugar actually goes into the recipe.' }
      ]
    },
    compute(values) {
      const grams = values.amount * values.sugarType;
      return { grams };
    }
  },
  {
    id: 'cups-to-grams-butter',
    category: 'measurements',
    updatedAt: '2026-10-26',
    aliases: ['butter cups to grams', 'how many grams in a stick of butter', 'butter stick to grams converter', 'cup of butter in grams', 'tablespoon of butter in grams'],
    related: ['cups-to-grams-converter', 'cups-to-grams-flour', 'cups-to-grams-sugar', 'grams-to-ounces-converter', 'milliliters-to-cups-converter'],
    title: 'Cups to Grams – Butter',
    description: 'Convert cups, sticks or tablespoons of butter to grams and ounces, using King Arthur Baking’s ingredient weight chart, with the US stick explained.',
    example: '1 stick of butter (½ cup, 8 tablespoons) weighs 113 g (3.99 oz); 1 cup (2 sticks) weighs 226 g (7.97 oz).',
    breakdown: {
      headline: 'grams',
      headlineLabel: 'Butter weight',
      outputs: [{ id: 'grams', label: 'Butter weight', format: 'number', dimension: 'mass', unit: 'g', alsoIn: ['oz'] }],
      visual: {
        type: 'logScale',
        value: 'grams',
        min: -1,
        max: 4,
        ticks: ['0.1 g', '1 g', '10 g', '100 g', '1,000 g', '10,000 g'],
        benchmarks: [
          { label: '1 tablespoon of butter (14.13 g)', value: 14.125 },
          { label: '1 stick of butter (113 g)', value: 113 },
          { label: '1 cup, 2 sticks (226 g)', value: 226 },
          { label: '4 sticks (1 lb)', value: 453.59237 }
        ],
        title: 'How much butter is that?',
        valueLabel: 'Your amount'
      }
    },
    content: {
      lastReviewed: '2026-10-26',
      concept: {
        title: 'Butter, sticks and the US measuring cup',
        paragraphs: [
          'King Arthur Baking Company’s Ingredient Weight Chart gives butter as 113 g for 8 tablespoons (½ cup) — so 1 full cup of butter is 226 g. In the US, butter is sold in 113 g sticks, each printed with tablespoon marks along its wrapper, which makes cutting a stick at the marked line often faster and just as accurate as packing a measuring cup.',
          'Because sticks are a everyday US unit, this page’s table is built around sticks and tablespoons rather than the cup fractions used on the flour and sugar pages — "1 stick," "¼ cup (4 tablespoons)" and "2 sticks" are closer to how US recipes and butter wrappers actually describe an amount.',
          'This figure does not distinguish salted from unsalted butter: the small amount of salt in salted butter is not enough of its total weight to matter for a recipe’s measuring, only its flavor.'
        ]
      },
      howTo: {
        intro: 'Type an amount of butter in cups, or switch units for sticks, tablespoons or grams directly.',
        steps: [
          { name: 'Type the amount', text: 'Enter the amount of butter in cups, or switch the unit menu to tablespoons, teaspoons or milliliters.' },
          { name: 'Read the weight', text: 'The result shows grams, with ounces alongside it.' },
          { name: 'Use the stick table instead', text: 'If your recipe or wrapper measures in sticks or tablespoons, the table below converts those directly.' },
          { name: 'Cut at the wrapper line', text: 'A US butter wrapper’s printed tablespoon marks are usually quicker and as accurate as a measuring cup.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Butter weight is cups times 226 g per cup — twice King Arthur’s 113 g half-cup (8 tablespoon) figure.',
        expression: 'grams = cups × 226\noz = grams ÷ 28.349523125',
        terms: [
          { symbol: 'cups', meaning: 'Volume of butter in US customary cups.' },
          { symbol: '226', meaning: 'Grams per cup of butter: 2 × 113 g, King Arthur Baking Company’s figure for 8 tablespoons.' },
          { symbol: '28.349523125', meaning: 'Grams in one avoirdupois ounce, exact.' }
        ],
        note: 'The 113 g figure is this source’s measured value for US butter, not a defined physical constant.'
      },
      workedExample: {
        intro: 'A pie crust recipe calls for 1½ sticks of cold butter, and a European version of the recipe gives the amount in grams instead.',
        rows: [
          { label: '1.5 sticks = 0.75 cup', value: '12 tbsp' },
          { label: '0.75 cup × 226 g/cup', value: '169.50 g' },
          { label: '169.50 ÷ 28.349523125', value: '5.98 oz' }
        ],
        result: '1½ sticks of butter ≈ 169.50 g (5.98 oz)',
        explanation: 'Cutting at the wrapper’s 12-tablespoon mark (1½ sticks × 8 tablespoons each) is usually faster and just as accurate as packing ¾ cup of butter into a measuring cup.'
      },
      referenceTable: {
        title: 'Butter: sticks and tablespoons to grams',
        columns: ['Amount', 'Grams', 'Ounces'],
        rows: [
          cupAmountRow('1 tablespoon', 1 / 16, gramsPerCup('butter')),
          cupAmountRow('¼ cup (4 tablespoons)', 0.25, gramsPerCup('butter')),
          cupAmountRow('1 stick — ½ cup (8 tablespoons)', 0.5, gramsPerCup('butter')),
          cupAmountRow('1 cup — 2 sticks', 1, gramsPerCup('butter')),
          cupAmountRow('2 cups — 4 sticks', 2, gramsPerCup('butter'))
        ],
        decimals: 2,
        note: 'King Arthur Baking Company: 113 g per 8 tablespoons (½ cup, 1 US stick). A US stick is sold as ¼ lb (4 oz, 113.4 g), so the chart\'s 113 g is that figure rounded; 4 sticks are exactly 1 lb (453.59 g), not the 452 g the rounded figure suggests.'
      },
      watchOut: [
        { title: 'A US stick is 113 g, 8 tablespoons, ½ cup', body: 'All three describe the same amount of butter. Cutting a stick at its printed wrapper lines is usually quicker and as accurate as measuring by cup.' },
        { title: '4 sticks is 1 pound', body: 'A US stick is packaged as ¼ lb (4 oz, about 113.4 g), so 4 sticks are 1 lb (453.59 g). The 113 g per stick used here is that figure rounded, which is why multiplying it by 4 gives 452 g, about 1.6 g short.' },
        { title: 'Salted and unsalted butter are treated the same here', body: 'This figure does not separately account for salted butter; the salt’s share of the total weight is too small to matter for measuring.' },
        { title: 'European butter blocks are commonly sold in different sizes', body: 'US butter sticks are a US convention — other countries’ common block sizes differ, so weighing by grams rather than counting sticks is more reliable outside the US.' }
      ],
      references: [
        { label: "King Arthur Baking Company, Ingredient Weight Chart", url: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'amount', label: 'Butter', type: 'number', placeholder: '1', defaultValue: 1, step: 0.25, min: 0, dimension: 'volume', unit: 'cup' }
    ],
    seo: {
      title: 'Cups to Grams – Butter Converter',
      description: 'Free butter cups to grams converter: sticks, tablespoons and cups of butter to grams and ounces, with the US stick (113 g) explained.',
      faq: [
        { question: 'How many grams are in a stick of butter?', answer: '113 g, per King Arthur Baking Company’s chart — 1 US stick is ½ cup or 8 tablespoons.' },
        { question: 'How many grams are in a cup of butter?', answer: '226 g, which is 2 sticks.' },
        { question: 'How many tablespoons are in a stick of butter?', answer: '8 tablespoons, the standard US stick marking.' },
        { question: 'How many grams are in a tablespoon of butter?', answer: 'About 14.13 g (¹⁄₁₆ cup × 226 g).' },
        { question: 'Is 4 sticks of butter the same as 1 pound?', answer: 'Yes. A US stick is packaged as ¼ lb (4 oz, about 113.4 g), so 4 sticks are 1 lb (453.59 g). Charts round a stick to 113 g, so 4 × 113 = 452 g is a rounding artifact, not a real shortfall.' },
        { question: 'Does salted butter weigh the same as unsalted butter?', answer: 'Essentially yes for measuring purposes — the salt in salted butter is too small a share of the total weight to matter in a recipe.' }
      ]
    },
    compute(values) {
      const grams = values.amount * gramsPerCup('butter');
      return { grams };
    }
  },
  {
    id: 'cups-to-grams-rice',
    category: 'measurements',
    updatedAt: '2026-10-26',
    aliases: ['rice cups to grams', 'how many grams in a cup of rice', 'rice grams to cups converter', 'cup of uncooked rice in grams', 'rice weight converter'],
    related: ['cups-to-grams-converter', 'cups-to-grams-flour', 'cups-to-grams-sugar', 'grams-to-ounces-converter', 'milliliters-to-cups-converter'],
    title: 'Cups to Grams – Rice',
    description: 'Convert cups of uncooked white rice to grams and ounces, using USDA FoodData Central figures, with the uncooked-vs-cooked trap explained for rice-cooker ratios.',
    example: '1 cup of uncooked long-grain white rice weighs about 185 g (6.53 oz); 1 cup of the same rice cooked weighs about 158 g (5.57 oz).',
    breakdown: {
      headline: 'grams',
      headlineLabel: 'Rice weight',
      outputs: [{ id: 'grams', label: 'Rice weight', format: 'number', dimension: 'mass', unit: 'g', alsoIn: ['oz'] }],
      visual: {
        type: 'logScale',
        value: 'grams',
        min: -1,
        max: 4,
        ticks: ['0.1 g', '1 g', '10 g', '100 g', '1,000 g', '10,000 g'],
        benchmarks: [
          { label: 'A ½-cup serving of uncooked rice (92.5 g)', value: 92.5 },
          { label: '1 cup of uncooked rice (185 g)', value: 185 },
          { label: 'A 1 kg bag of rice', value: 1000 }
        ],
        title: 'How much rice is that?',
        valueLabel: 'Your amount'
      }
    },
    content: {
      lastReviewed: '2026-10-26',
      concept: {
        title: 'Rice, by weight, outside of baking',
        paragraphs: [
          'USDA FoodData Central lists 1 cup of raw, unenriched long-grain white rice at 185 g. Unlike the baking ingredients on this site’s other cooking pages, rice weight matters most for rice cookers and water-ratio cooking, where the rice-to-water ratio is often given by weight for accuracy rather than by the less precise cup measure.',
          'This figure is for uncooked rice. A recipe or package that says "1 cup rice" with no further qualifier almost always means uncooked — cooked rice is measured and sold completely differently.',
          'USDA FoodData Central separately lists 1 cup of cooked, enriched long-grain white rice at 158 g — less than the 185 g of uncooked rice in a cup, even though cooking adds water and increases total weight. That is not a contradiction: cooking makes rice fluffier and less densely packed, so the same cup holds less mass of cooked rice than it did of compact, uncooked grains, even as the total rice-plus-water system gains weight overall.'
        ]
      },
      howTo: {
        intro: 'Type an amount of uncooked rice in cups. The weight updates as you type.',
        steps: [
          { name: 'Type the cup amount', text: 'Enter how many cups of uncooked rice you are measuring.' },
          { name: 'Use another unit if you prefer', text: 'Switch the unit menu to tablespoons, teaspoons or milliliters.' },
          { name: 'Read the weight', text: 'The result shows grams, with ounces alongside it.' },
          { name: 'Check you mean uncooked rice', text: 'This figure is for uncooked rice — see the watch-out below if your recipe means cooked rice instead.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Rice weight is cups times USDA’s figure of 185 g per cup of uncooked long-grain white rice.',
        expression: 'grams = cups × 185\noz = grams ÷ 28.349523125',
        terms: [
          { symbol: 'cups', meaning: 'Volume of uncooked rice in US customary cups.' },
          { symbol: '185', meaning: 'Grams per cup of raw, unenriched long-grain white rice (USDA FoodData Central).' },
          { symbol: '28.349523125', meaning: 'Grams in one avoirdupois ounce, exact.' }
        ],
        note: 'This is a measured figure for one specific rice (raw, unenriched, long-grain, white); other rice varieties can weigh a different amount per cup.'
      },
      workedExample: {
        intro: 'A rice cooker’s instructions call for ¾ cup of uncooked rice per serving.',
        rows: [
          { label: '0.75 cup × 185 g/cup', value: '138.75 g' },
          { label: '138.75 ÷ 28.349523125', value: '4.89 oz' },
          { label: 'Compare: ¾ cup cooked would be lighter — see watch-out', value: '118.50 g' }
        ],
        result: '¾ cup of uncooked rice ≈ 138.75 g (4.89 oz)',
        explanation: 'The "compare" row is ¾ cup of cooked rice at USDA’s 158 g/cup figure — shown to make the point that the same cup amount of uncooked and cooked rice are not interchangeable weights.'
      },
      referenceTable: {
        title: 'Uncooked long-grain white rice: cups to grams and ounces',
        columns: ['Amount', 'Grams', 'Ounces'],
        rows: CUP_AMOUNTS.map(({ label, cups }) => cupAmountRow(label, cups, gramsPerCup('rice'))),
        decimals: 2,
        note: 'USDA FoodData Central #169756, raw, unenriched, long-grain white rice, 185 g per US cup.'
      },
      watchOut: [
        { title: 'Uncooked and cooked rice are not the same weight per cup', body: 'USDA lists 185 g for 1 cup uncooked but 158 g for 1 cup cooked — cooking makes rice fluffier and less densely packed, so a cup of cooked rice actually weighs less than a cup of uncooked rice, even though the rice itself gained weight from absorbed water.' },
        { title: '"1 cup of rice" in a recipe usually means uncooked', body: 'Unless a recipe specifically says "1 cup cooked rice," assume it means uncooked — check the recipe’s own wording if the amount seems unusually large or small for the dish.' },
        { title: 'This figure is for one specific rice', body: 'USDA’s 185 g figure is for raw, unenriched, long-grain white rice. Brown rice, basmati, jasmine and short-grain rice can each weigh a somewhat different amount per cup.' },
        { title: 'This is the US customary cup', body: 'A metric cup (250 mL) is about 5.7% bigger than the US cup used here.' }
      ],
      references: [
        { label: 'USDA FoodData Central #169756, "Rice, white, long-grain, regular, raw, unenriched"', url: 'https://fdc.nal.usda.gov/food-details/169756/nutrients' },
        { label: 'USDA FoodData Central #168878, "Rice, white, long-grain, regular, enriched, cooked"', url: 'https://fdc.nal.usda.gov/food-details/168878/nutrients' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units, Appendix B (conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'amount', label: 'Uncooked rice', type: 'number', placeholder: '1', defaultValue: 1, step: 0.25, min: 0, dimension: 'volume', unit: 'cup' }
    ],
    seo: {
      title: 'Cups to Grams – Rice Converter',
      description: 'Free rice cups to grams converter: uncooked long-grain white rice to grams and ounces, from USDA figures, with the cooked-rice trap explained.',
      faq: [
        { question: 'How many grams are in a cup of rice?', answer: 'About 185 g for uncooked, raw long-grain white rice (USDA FoodData Central).' },
        { question: 'Is cooked rice the same weight per cup as uncooked rice?', answer: 'No — USDA lists 1 cup of cooked rice at 158 g, less than the 185 g for 1 cup uncooked, because cooked rice is fluffier and packs less densely into the same cup.' },
        { question: 'How many ounces are in a cup of rice?', answer: 'About 6.53 oz uncooked (185 g ÷ 28.349523125).' },
        { question: 'How much is ¾ cup of rice in grams?', answer: '138.75 g uncooked (0.75 × 185 g).' },
        { question: 'Does this figure work for brown or basmati rice?', answer: 'Not exactly — 185 g per cup is specifically for raw, unenriched, long-grain white rice. Other rice varieties can weigh a somewhat different amount per cup.' },
        { question: 'Why do rice cooker instructions give weight instead of cups?', answer: 'Weight is more precise than volume for the rice-to-water ratio that determines texture, so many rice cookers and recipes specify rice by weight for consistent results.' }
      ]
    },
    compute(values) {
      const grams = values.amount * gramsPerCup('rice');
      return { grams };
    }
  }
];
