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
    updatedAt: '2026-09-10',
    aliases: ['f to c converter', 'temperature converter', 'celsius to fahrenheit calculator', 'degree converter'],
    related: ['miles-to-kilometers-converter', 'pounds-to-kilograms-converter', 'gallons-to-liters-converter', 'concrete-calculator'],
    title: 'Fahrenheit to Celsius Converter',
    description: 'Convert Fahrenheit temperatures to Celsius instantly.',
    example: 'Convert 68°F to Celsius for weather or cooking temperatures.',
    inputs: [
      { id: 'fahrenheit', label: 'Fahrenheit', type: 'number', placeholder: '68', defaultValue: 68, step: 0.1, min: -200 }
    ],
    seo: {
      title: 'Fahrenheit to Celsius Converter',
      description: 'Quickly convert any temperature from Fahrenheit to Celsius. Useful for checking the weather abroad, following international recipes, or converting oven temperatures.',
      faq: [
        { question: 'How do I convert Fahrenheit to Celsius?', answer: 'Subtract 32 from the temperature, then multiply by 5/9.' },
        { question: 'Can I use this for weather and cooking?', answer: 'Yes, this converter works for all Fahrenheit temperature values.' }
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
