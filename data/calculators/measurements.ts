import type { CalculatorConfig } from './types.ts';
import { toBase, fromBase } from '../../lib/units.ts';

export const measurementsCalculators: CalculatorConfig[] = [
  {
    id: 'miles-to-kilometers-converter',
    category: 'measurements',
    updatedAt: '2026-10-19',
    aliases: ['mi to km converter', 'distance converter', 'km to miles calculator', 'miles to km'],
    related: ['pounds-to-kilograms-converter', 'gallons-to-liters-converter', 'fahrenheit-to-celsius-converter', 'running-pace-calculator'],
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
    aliases: ['lbs to kg converter', 'weight converter', 'kg to pounds calculator', 'stone to kg converter', 'lb to kg'],
    related: ['bmi-calculator', 'miles-to-kilometers-converter', 'gallons-to-liters-converter', 'fahrenheit-to-celsius-converter'],
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
    aliases: ['gal to l converter', 'volume converter', 'liters to gallons calculator', 'fuel volume converter', 'imperial gallon converter'],
    related: ['fuel-cost-calculator', 'miles-to-kilometers-converter', 'pounds-to-kilograms-converter', 'water-intake-calculator'],
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
  }
];
