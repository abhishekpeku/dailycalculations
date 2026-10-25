import type { CalculatorConfig } from './types.ts';
import { toBase, fromBase } from '../../lib/units.ts';

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
    aliases: ['lbs to kg converter', 'kg to pounds calculator', 'stone to kg converter', 'lb to kg'],
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
    aliases: ['area converter', 'square meters to square feet converter', 'convert area units', 'area unit converter', 'sq ft to sq m converter'],
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
    aliases: ['pressure converter', 'psi to bar converter', 'bar to psi calculator', 'pressure unit converter', 'kpa to psi converter'],
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
  }
];
