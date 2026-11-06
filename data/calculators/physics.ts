import type { CalculatorConfig } from './types.ts';

// 3rd CGPM (1901) fixed standard gravity at this value; see NIST SP 811 Appendix B and the BIPM SI
// Brochure. Shared by weight-calculator and potential-energy-calculator's forward compute() below
// (the solver pages use lib/units.ts's 'g0' acceleration unit, which carries the same value).
const STANDARD_GRAVITY = 9.80665;

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
  },
  {
    id: 'speed-distance-time-calculator',
    category: 'physics',
    glyph: 'v',
    updatedAt: '2026-11-06',
    aliases: ['velocity calculator', 'distance = rate x time calculator', 'd = rt calculator', 'rate time distance calculator', 'how fast calculator', 'average speed calculator'],
    related: ['speed-converter', 'running-pace-calculator', 'mph-to-kph-converter'],
    title: 'Speed, Distance and Time Calculator',
    description: 'Solve the motion equation v = d ÷ t for speed, distance, or time — enter any two and the third fills in, in mph, km/h, m/s, or any other unit.',
    example: 'A 270-mile road trip in 4.5 hours averages 60 mph — about 96.6 km/h, or 26.8 m/s.',
    solver: {
      defaultTarget: 'speed',
      variables: [
        { id: 'distance', label: 'Distance', symbol: 'd', dimension: 'length', defaultValue: 270, defaultUnit: 'mi' },
        { id: 'time', label: 'Time', symbol: 't', dimension: 'time', defaultValue: 4.5, defaultUnit: 'h' },
        { id: 'speed', label: 'Speed', symbol: 'v', dimension: 'speed', defaultValue: 60, defaultUnit: 'mph' }
      ],
      solve: {
        speed: ({ distance, time }) => (time === 0 ? NaN : distance / time),
        distance: ({ speed, time }) => speed * time,
        time: ({ distance, speed }) => (speed === 0 ? NaN : distance / speed)
      }
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is the speed, distance and time relationship?',
        paragraphs: [
          'Speed tells you how quickly position changes: how much distance an object covers in a given amount of time. The equation is one of the oldest in physics and one of the most used — v = d ÷ t — and it links any trip, any thrown object, and any flowing liquid once you know two of the three quantities.',
          'What this formula actually gives you is average speed over the interval you measured, not the speed at any single instant. A car covering 270 miles in 4.5 hours averaged 60 mph, even if it slowed to 20 mph in traffic and sped up to 80 mph on the highway along the way. A speedometer shows instantaneous speed; this calculator computes the average over the whole distance and time you enter.',
          'Strictly, "velocity" adds a direction to speed — 60 mph due north is a velocity, 60 mph alone is a speed. For motion in a straight line without reversing direction, the two give the same number, which is why this single page covers both "speed calculator" and "velocity calculator" searches.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of distance, time and speed; the third fills in automatically, so the same page answers "how fast", "how far" and "how long".',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and choose its unit from the menu beside it. The third field, marked auto, calculates as you type. Miles with hours and kilometers with minutes both work fine — units convert automatically.' },
          { name: 'Switch which one is calculated', text: 'To solve for a different quantity, type into the auto field. It becomes an input, and whichever field you have left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 270 mi becomes 434.5 km instead of silently turning into 270 km.' },
          { name: 'Read the result', text: 'The answer shows in your chosen unit, with the next few common units listed underneath for comparison.' },
          { name: 'Share or copy', text: 'Share result copies a link that reopens the calculator with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The same equation rearranges three ways, one for each quantity you might be solving for.',
        expression: 'v = d ÷ t\nd = v × t\nt = d ÷ v',
        terms: [
          { symbol: 'v', meaning: 'Average speed (or velocity, if a direction is implied), typically in m/s, km/h or mph.' },
          { symbol: 'd', meaning: 'Distance traveled (or displacement, for velocity), in meters, kilometers, miles, or any length unit.' },
          { symbol: 't', meaning: 'Time taken to cover that distance, in seconds, minutes or hours.' }
        ],
        note: 'Every input is converted to SI (meters and seconds) before solving and converted back afterward, so mixing mph with minutes, or km with hours, cannot produce a wrong result.'
      },
      workedExample: {
        intro: 'A car covers 270 miles in 4.5 hours. What was its average speed?',
        rows: [
          { label: 'Distance (d)', value: '270 mi' },
          { label: 'Time (t)', value: '4.5 h' },
          { label: 'Speed (v = 270 ÷ 4.5)', value: '60 mph' }
        ],
        result: 'v = 60 mph · 96.56 km/h · 26.82 m/s',
        explanation: '270 divided by 4.5 is exactly 60, so the average speed is 60 mph. Converting to metric: 60 mph × 1.609344 km/mi = 96.56 km/h, and 96.56 km/h ÷ 3.6 = 26.82 m/s. The car may have driven faster or slower than 60 mph at any given moment — this is the average over the whole 270 miles.'
      },
      watchOut: [
        {
          title: "A round trip's average speed is not the average of the two speeds",
          body: "Drive 60 mph there and 40 mph back over the same route, and the average for the whole trip is not (60 + 40) ÷ 2 = 50 mph. Because the slower leg takes longer, it counts for more: the true average is the harmonic mean, 2 × 60 × 40 ÷ (60 + 40) = 48 mph. Compute it from total distance ÷ total time, not by averaging two speeds directly."
        },
        {
          title: 'Mixing units before dividing gives a wrong answer',
          body: 'Dividing miles by hours gives mph; dividing kilometers by hours gives km/h. If you divide miles by minutes by hand without converting, the number is meaningless. This calculator converts for you — pick the unit of each input and let it handle the arithmetic.'
        },
        {
          title: 'Average speed is not instantaneous speed',
          body: "A speedometer shows your speed at that exact moment. This calculator's result is distance ÷ time over the whole interval, which smooths out every acceleration, stop, and slowdown in between."
        },
        {
          title: 'Speed and velocity are not quite the same word',
          body: 'Speed is a magnitude (60 mph); velocity adds a direction (60 mph north). If an object changes direction, its average velocity can be much smaller than its average speed — a runner who finishes a lap back where they started has an average velocity of zero despite a very real average speed.'
        },
        {
          title: 'Time cannot be zero',
          body: 'Dividing by a time of zero has no answer — the calculator shows a blank result rather than guessing.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §3.1 Position, Displacement, and Average Velocity', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-1-position-displacement-and-average-velocity' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'distance', label: 'Distance (m)', type: 'number', placeholder: '434500', defaultValue: 434523.136, step: 1, min: 0 },
      { id: 'time', label: 'Time (s)', type: 'number', placeholder: '16200', defaultValue: 16200, step: 1, min: 0 }
    ],
    seo: {
      title: 'Speed, Distance & Time Calculator (v = d/t)',
      description: 'Free speed, distance and time calculator. Solve v = d ÷ t for speed, distance or time in mph, km/h, m/s, knots or ft/s, with a worked example.',
      faq: [
        { question: 'What is the formula for speed, distance and time?', answer: 'Speed equals distance divided by time: v = d ÷ t. Rearranged, distance is speed times time (d = v × t), and time is distance divided by speed (t = d ÷ v).' },
        { question: 'How do I find the time if I know distance and speed?', answer: 'Divide distance by speed: t = d ÷ v. A 450 km trip at a steady 90 km/h takes 450 ÷ 90 = 5 hours.' },
        { question: 'How do I find the distance if I know speed and time?', answer: 'Multiply speed by time: d = v × t. Driving at 65 mph for 3 hours covers 65 × 3 = 195 miles.' },
        { question: 'What is the difference between speed and velocity?', answer: 'Speed is just a magnitude, like 60 mph. Velocity is speed with a direction, like 60 mph due north. For straight-line motion in one direction they give the same number.' },
        { question: 'Is the average speed on a round trip the average of the two speeds?', answer: "No. If you travel the same distance at two different speeds, the overall average is the harmonic mean, not the arithmetic mean. At 60 mph one way and 40 mph back, the average for the whole trip is 2 × 60 × 40 ÷ (60 + 40) = 48 mph, not 50 mph." },
        { question: 'How do I convert mph to km/h?', answer: 'Multiply by 1.609344: 60 mph × 1.609344 = 96.56 km/h. To go the other way, divide by 1.609344 instead.' },
        { question: 'What is the SI unit of speed?', answer: 'Meters per second (m/s). Kilometers per hour, miles per hour and knots are all common alternatives the calculator also supports.' }
      ]
    },
    compute(values) {
      return { speed: values.distance / values.time };
    }
  }
];
