import type { CalculatorConfig } from './types.ts';

export const physicsCalculators: CalculatorConfig[] = [
  {
    id: 'force-calculator',
    category: 'physics',
    glyph: 'F',
    updatedAt: '2026-10-12',
    aliases: ["newton's second law calculator", 'f = ma calculator', 'net force calculator', 'mass and acceleration calculator', 'newton calculator'],
    related: ['pounds-to-kilograms-converter', 'miles-to-kilometers-converter', 'fahrenheit-to-celsius-converter'],
    title: 'Force Calculator',
    description: "Solve Newton's second law, F = m × a, for force, mass, or acceleration — in any unit, with the answer shown against everyday forces.",
    example: 'A 1,500 kg car accelerating at 2.78 m/s² (0–100 km/h in 10 seconds) needs a net force of about 4,170 N.',
    solver: {
      defaultTarget: 'force',
      variables: [
        { id: 'force', label: 'Force', symbol: 'F', dimension: 'force', defaultValue: 4170, defaultUnit: 'N' },
        { id: 'mass', label: 'Mass', symbol: 'm', dimension: 'mass', defaultValue: 1500, defaultUnit: 'kg' },
        { id: 'acceleration', label: 'Acceleration', symbol: 'a', dimension: 'acceleration', defaultValue: 2.78, defaultUnit: 'm/s2' }
      ],
      solve: {
        force: ({ mass, acceleration }) => mass * acceleration,
        mass: ({ force, acceleration }) => (acceleration === 0 ? NaN : force / acceleration),
        acceleration: ({ force, mass }) => (mass === 0 ? NaN : force / mass)
      },
      benchmarks: [
        { label: 'Weight of a small apple', value: 1 },
        { label: 'Weight of a 70 kg adult', value: 686 },
        { label: 'Car, 0–100 km/h in 10 s', value: 4167 },
        { label: 'Saturn V rocket at liftoff', value: 3.5e7 }
      ]
    },
    content: {
      lastReviewed: '2026-10-12',
      concept: {
        title: 'What is force?',
        paragraphs: [
          'A force is a push or a pull. It is the only thing that can change how an object moves — speed it up, slow it down, or turn it. A ball sitting on a table stays put until something pushes it; a ball rolling across the floor keeps rolling until friction pulls it to a stop.',
          "Isaac Newton's second law, published in 1687, says exactly how much a force changes that motion: the acceleration an object gets is proportional to the net force on it and inversely proportional to its mass. Push twice as hard and the object speeds up twice as fast. Push something twice as heavy with the same force and it speeds up half as fast.",
          'The SI unit of force, the newton (N), is defined by this law: one newton is the force that accelerates one kilogram at one meter per second, every second (1 N = 1 kg·m/s²). That is about the weight of a small apple held in your hand.'
        ]
      },
      howTo: {
        intro:
          'Fill in any two of the three quantities and the calculator works out the third, so the same page answers "how much force", "how heavy" and "how fast does it speed up".',
        steps: [
          {
            name: 'Enter the two values you know',
            text: 'Type each value and pick its unit from the menu beside it. The third field, marked auto, fills in as you type. Units can be mixed freely — pounds with meters per second squared works fine.'
          },
          {
            name: 'Switch which one is calculated',
            text: 'To find a different quantity, type into the auto field. It becomes an input, and the field you have left alone longest becomes the calculated one instead.'
          },
          {
            name: 'Change units at any time',
            text: 'Switching an input unit converts the number you typed, so 1,500 kg becomes 3,306.9 lb instead of silently turning into 1,500 lb.'
          },
          {
            name: 'Read the result and the scale',
            text: 'The answer appears in your chosen unit with the main alternatives underneath. The scale shows where your force sits between an apple and a rocket.'
          },
          {
            name: 'Share or copy',
            text: 'Share result copies a link that reopens the calculator with your exact values and units. Copy result copies the answer as text.'
          }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro:
          "Newton's second law links three quantities. Rearranging it gives a formula for each one, which is what the calculator uses depending on the field you solve for.",
        expression: 'F = m × a\nm = F ÷ a\na = F ÷ m',
        terms: [
          { symbol: 'F', meaning: 'Net force, in newtons (N). The sum of every force acting on the object, not just the one you are applying.' },
          { symbol: 'm', meaning: 'Mass, in kilograms (kg). How much matter the object contains — the same on Earth, the Moon or in orbit.' },
          { symbol: 'a', meaning: 'Acceleration, in meters per second squared (m/s²). How much the speed changes each second.' },
          { symbol: '1 lbf', meaning: '4.448 N — the weight of one pound of mass under standard gravity (0.45359237 kg × 9.80665 m/s²).' }
        ],
        note:
          'Every input is converted to SI units (N, kg, m/s²) before solving and the answer is converted back afterwards, so mixed units cannot produce a wrong result.'
      },
      workedExample: {
        intro:
          'A car with a mass of 1,500 kg goes from 0 to 100 km/h in 10 seconds. What net force does that take?',
        rows: [
          { label: 'Mass (m)', value: '1,500 kg' },
          { label: 'Final speed', value: '100 km/h = 27.78 m/s' },
          { label: 'Time', value: '10 s' },
          { label: 'Acceleration (a = 27.78 ÷ 10)', value: '2.778 m/s²' },
          { label: 'Force (F = 1,500 × 2.778)', value: '4,167 N' }
        ],
        result: 'F ≈ 4,170 N · 4.17 kN · 937 lbf',
        explanation:
          '100 km/h is 100,000 m ÷ 3,600 s = 27.78 m/s. Gaining that in 10 seconds is an average acceleration of 2.778 m/s². Multiplying by 1,500 kg gives 4,167 N — roughly the weight of six adults. That is the net force; the engine actually has to supply more, because air drag and rolling resistance push back the whole time.'
      },
      watchOut: [
        {
          title: 'It is the net force, not the force you apply',
          body: 'If you push a box with 100 N and friction pushes back with 60 N, the force that accelerates the box is 40 N. Use the total of all forces, with opposing ones subtracted.'
        },
        {
          title: 'Mass is not weight',
          body: 'Weight is a force: mass × gravity. A 70 kg person has a weight of about 686 N on Earth but only about 113 N on the Moon. In imperial units, lb is mass and lbf is force — mixing them up is the most common error.'
        },
        {
          title: '"g" is standard gravity, not local gravity',
          body: 'The g unit is fixed at 9.80665 m/s². Real gravity varies from about 9.78 m/s² at the equator to 9.83 m/s² at the poles, which matters for precise work.'
        },
        {
          title: 'F = m × a assumes the mass stays the same',
          body: 'A rocket burning fuel gets lighter as it climbs, so its acceleration rises even at constant thrust. For changing mass, use the momentum form, F = Δ(m·v) ÷ Δt.'
        },
        {
          title: 'Direction matters',
          body: 'Force and acceleration are vectors. This calculator works with magnitudes along a single line; for forces at angles, resolve them into components first.'
        }
      ],
      references: [
        { label: "OpenStax, University Physics Volume 1, §5.3 Newton's Second Law", url: 'https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass (kg)', type: 'number', placeholder: '1500', defaultValue: 1500, step: 1, min: 0 },
      { id: 'acceleration', label: 'Acceleration (m/s²)', type: 'number', placeholder: '2.78', defaultValue: 2.78, step: 0.01 }
    ],
    seo: {
      title: 'Force Calculator (F = ma) – Solve for Force, Mass or Acceleration',
      description: "Free force calculator using Newton's second law. Solve F = m × a for force, mass or acceleration in N, kN, lbf, kg, lb, m/s², ft/s² or g, with a worked example.",
      faq: [
        { question: 'How do I calculate force from mass and acceleration?', answer: 'Multiply them: F = m × a. With mass in kilograms and acceleration in meters per second squared, the answer is in newtons. A 2 kg object accelerating at 3 m/s² needs 6 N of net force.' },
        { question: 'How do I find mass from force and acceleration?', answer: 'Divide force by acceleration: m = F ÷ a. A 600 N net force producing 3 m/s² of acceleration means the mass is 200 kg.' },
        { question: 'How much is 1 newton?', answer: 'One newton accelerates one kilogram at 1 m/s². It is roughly the weight of a 102 g object on Earth — about a small apple.' },
        { question: 'How many newtons are in a pound-force?', answer: 'One pound-force (lbf) is 4.448 N. To convert newtons to lbf, divide by 4.448; 1,000 N is about 225 lbf.' },
        { question: 'Is weight a force?', answer: 'Yes. Weight is the force of gravity on a mass: W = m × g, with g ≈ 9.81 m/s² on Earth. Your mass stays the same everywhere, but your weight changes with gravity.' },
        { question: "What is Newton's second law?", answer: 'It states that the acceleration of an object equals the net force on it divided by its mass, usually written F = m × a. It explains why heavier objects need more force to speed up at the same rate.' }
      ]
    },
    compute(values) {
      return { force: values.mass * values.acceleration };
    }
  }
];
