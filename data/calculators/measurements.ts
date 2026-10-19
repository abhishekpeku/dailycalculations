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
    updatedAt: '2026-09-10',
    aliases: ['gal to l converter', 'volume converter', 'liters to gallons calculator', 'fuel volume converter'],
    related: ['fuel-cost-calculator', 'miles-to-kilometers-converter', 'pounds-to-kilograms-converter', 'water-intake-calculator'],
    title: 'Gallons to Liters Converter',
    description: 'Convert gallons to liters for cooking, fuel, and container volume.',
    example: 'Convert 2.5 gallons to liters for recipe scaling.',
    inputs: [
      { id: 'gallons', label: 'Gallons', type: 'number', placeholder: '2.5', defaultValue: 2.5, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Gallons to Liters Converter',
      description: 'Quickly convert US gallons to liters for cooking, fuel planning, or any volume measurement. Get an instant, accurate result down to the decimal.',
      faq: [
        { question: 'How do I convert gallons to liters?', answer: 'Multiply gallons by 3.78541 to get liters.' },
        { question: 'Can I use this for both fuel and recipes?', answer: 'Yes, it works for all gallon to liter conversions.' }
      ]
    },
    compute(values) {
      const liters = values.gallons * 3.78541;
      return { liters };
    }
  }
];
