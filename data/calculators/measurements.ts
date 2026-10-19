import type { CalculatorConfig } from './types.ts';

export const measurementsCalculators: CalculatorConfig[] = [
  {
    id: 'miles-to-kilometers-converter',
    category: 'measurements',
    updatedAt: '2026-09-10',
    aliases: ['mi to km converter', 'distance converter', 'km to miles calculator'],
    related: ['pounds-to-kilograms-converter', 'gallons-to-liters-converter', 'fahrenheit-to-celsius-converter', 'running-pace-calculator'],
    title: 'Miles to Kilometers Converter',
    description: 'Convert miles to kilometers with a quick distance conversion tool.',
    example: 'Convert 10 miles to kilometers for a road trip distance.',
    inputs: [
      { id: 'miles', label: 'Miles', type: 'number', placeholder: '10', defaultValue: 10, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Miles to Kilometers Converter',
      description: 'Fast conversion from miles to kilometers. Ideal for travel planning, exercise tracking, and distance comparisons.',
      faq: [
        { question: 'How do I convert miles to kilometers?', answer: 'Multiply the number of miles by 1.60934 to get the distance in kilometers.' },
        { question: 'Is this tool good for road trips?', answer: 'Yes, it is great for quick distance conversion while planning travel or workouts.' }
      ]
    },
    compute(values) {
      const kilometers = values.miles * 1.60934;
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
      const celsius = (values.fahrenheit - 32) * (5 / 9);
      return { celsius };
    }
  },
  {
    id: 'pounds-to-kilograms-converter',
    category: 'measurements',
    updatedAt: '2026-09-10',
    aliases: ['lbs to kg converter', 'weight converter', 'kg to pounds calculator', 'stone to kg converter'],
    related: ['bmi-calculator', 'miles-to-kilometers-converter', 'gallons-to-liters-converter', 'fahrenheit-to-celsius-converter'],
    title: 'Pounds to Kilograms Converter',
    description: 'Convert pounds to kilograms quickly and accurately.',
    example: 'Convert 150 pounds to kilograms for fitness or shipping estimates.',
    inputs: [
      { id: 'pounds', label: 'Pounds', type: 'number', placeholder: '150', defaultValue: 150, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Pounds to Kilograms Converter',
      description: 'Fast, accurate conversion from pounds to kilograms. Useful for tracking fitness or weight-loss goals, calculating shipping weights, or converting to the metric system.',
      faq: [
        { question: 'How do I convert pounds to kilograms?', answer: 'Multiply pounds by 0.453592 to get kilograms.' },
        { question: 'Is this converter accurate?', answer: 'Yes, it uses the standard conversion factor for pounds to kilograms.' }
      ]
    },
    compute(values) {
      const kilograms = values.pounds * 0.453592;
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
      const liters = values.gallons * 3.78541;
      return { liters };
    }
  }
];
