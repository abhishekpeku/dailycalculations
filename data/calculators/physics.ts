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
  },
  {
    id: 'weight-calculator',
    category: 'physics',
    glyph: 'W',
    updatedAt: '2026-11-06',
    aliases: ['mass to weight calculator', 'w = mg calculator', 'weight in newtons calculator', 'gravity weight calculator', 'weight on other planets calculator'],
    related: ['force-calculator', 'pounds-to-kilograms-converter', 'kilograms-to-stone-converter', 'weight-converter'],
    title: 'Weight Calculator (W = mg)',
    description: 'Calculate weight from mass and gravity — W = m × g — or work backward to mass or local gravity, in newtons, pounds-force, kilograms, or pounds.',
    example: 'A 70 kg person weighs about 686.5 N on Earth (154.3 lbf) but only about 113.4 N on the Moon, where gravity is weaker.',
    solver: {
      defaultTarget: 'weight',
      variables: [
        { id: 'weight', label: 'Weight', symbol: 'W', dimension: 'force', defaultValue: 686.5, defaultUnit: 'N' },
        { id: 'mass', label: 'Mass', symbol: 'm', dimension: 'mass', defaultValue: 70, defaultUnit: 'kg' },
        { id: 'gravity', label: 'Gravity', symbol: 'g', dimension: 'acceleration', defaultValue: 9.80665, defaultUnit: 'm/s2' }
      ],
      solve: {
        weight: ({ mass, gravity }) => mass * gravity,
        mass: ({ weight, gravity }) => (gravity === 0 ? NaN : weight / gravity),
        gravity: ({ weight, mass }) => (mass === 0 ? NaN : weight / mass)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'weight',
          min: -2,
          max: 9,
          ticks: ['0.01 N', '1 N', '1 kN', '1 MN', '1 GN'],
          benchmarks: [
            { label: 'Weight of a small apple', value: 1 },
            { label: 'Weight of a 70 kg adult', value: 686 },
            { label: 'Net force to accelerate a car 0–100 km/h in 10 s', value: 4167 },
            { label: 'Saturn V rocket at liftoff', value: 3.5e7 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your weight'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is weight?',
        paragraphs: [
          'Weight is the force gravity exerts on a mass. It is not the same thing as mass itself: mass is how much matter an object contains, and it stays the same everywhere — on Earth, on the Moon, or floating in orbit. Weight changes depending on how strong the local gravity is, because weight is mass multiplied by that local gravitational acceleration, W = m × g.',
          'On Earth, "standard gravity" is fixed at exactly 9.80665 m/s² by international agreement — a single reference value used for calculations and unit definitions, even though the true local value varies slightly from place to place. A 1 kg object weighs 9.80665 N under that reference value, which is why kilograms and newtons differ by that same factor throughout this calculator.',
          "A bathroom scale actually measures a force — how hard your feet push down on its sensor — but displays the result as a mass by quietly assuming Earth-standard gravity. Take that same scale to the Moon and it would under-report your mass, because it would still be dividing the (much smaller) force it measures by the same Earth value of g."
        ]
      },
      howTo: {
        intro: 'Fill in any two of weight, mass and gravity; the third fills in automatically — the same page converts mass to weight, finds mass from a known weight, or works out what gravity would produce a given weight.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and choose its unit. The third field, marked auto, calculates as you type. To find weight on Earth, leave gravity at 9.80665 m/s².' },
          { name: 'Change gravity to try another world', text: "Replace 9.80665 m/s² with another body's surface gravity — 1.62 m/s² for the Moon, for example — to see how the same mass weighs differently elsewhere." },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field you have left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 70 kg becomes 154.3 lb instead of silently turning into 70 lb.' },
          { name: 'Read the result and the scale', text: 'The answer appears in your chosen unit, with the scale below showing where it sits against a few everyday forces.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: "Newton's second law, applied to gravity alone, links weight, mass and the local gravitational acceleration.",
        expression: 'W = m × g\nm = W ÷ g\ng = W ÷ m',
        terms: [
          { symbol: 'W', meaning: 'Weight, a force, in newtons (N) or pounds-force (lbf).' },
          { symbol: 'm', meaning: 'Mass, in kilograms (kg) or pounds (lb). The same everywhere, regardless of gravity.' },
          { symbol: 'g', meaning: 'Local gravitational acceleration, in m/s². Standard gravity on Earth is exactly 9.80665 m/s² by definition.' }
        ],
        note: 'Every input is converted to SI units (N, kg, m/s²) before solving and converted back afterward, so mixed units cannot produce a wrong result.'
      },
      workedExample: {
        intro: "How much does a 70 kg person weigh on Earth, and how much would they weigh on the Moon?",
        rows: [
          { label: 'Mass (m)', value: '70 kg' },
          { label: 'Earth gravity (g)', value: '9.80665 m/s²' },
          { label: 'Weight on Earth (W = 70 × 9.80665)', value: '686.5 N' },
          { label: 'Moon gravity', value: '1.62 m/s² (NASA)' },
          { label: 'Weight on Moon (W = 70 × 1.62)', value: '113.4 N' }
        ],
        result: 'W(Earth) ≈ 686.5 N · 154.3 lbf  —  W(Moon) ≈ 113.4 N',
        explanation: "70 kg × 9.80665 m/s² = 686.47 N, which rounds to about 686.5 N, or 154.3 lbf. The Moon's gravity is about 1.62 m/s², roughly a sixth of Earth's — so the same 70 kg mass weighs only about 113.4 N there, even though the person's mass has not changed at all."
      },
      watchOut: [
        {
          title: 'Mass stays fixed; weight does not',
          body: "A 70 kg astronaut has exactly 70 kg of mass on Earth, on the Moon, and in orbit. Their weight, however, drops from about 686.5 N on Earth to about 113.4 N on the Moon, and to effectively zero in freefall — because weight depends on local gravity, not on the astronaut."
        },
        {
          title: '"lb" and "lbf" are not interchangeable',
          body: 'In US customary units, the pound (lb) is a unit of mass, and the pound-force (lbf) is a unit of weight. A 70 kg mass is 154.3 lb, but its weight is 154.3 lbf — the numbers look alike only because pounds and pounds-force are defined to agree exactly under standard gravity.'
        },
        {
          title: 'Standard gravity is a fixed reference, not the exact local value',
          body: 'Real gravitational acceleration varies slightly across Earth — from about 9.78 m/s² near the equator to about 9.83 m/s² near the poles, and slightly less at altitude. The 9.80665 m/s² default is the internationally adopted reference value used for everyday calculations, not a promise that a scale in any one city will read it exactly.'
        },
        {
          title: "A scale calibrated for Earth misreads mass elsewhere",
          body: "A spring or digital bathroom scale senses a force and divides by Earth's g to display a mass. Carried to the Moon without recalibration, it would still divide by Earth's g — so it would report a mass about six times too small, even though the force it measured was perfectly real."
        },
        {
          title: "Don't confuse this g with a rollercoaster's g-force",
          body: 'The g in W = mg is gravitational acceleration. The "g-force" used to describe a rollercoaster drop or a fighter jet turn is a ratio of total acceleration to standard gravity, a different (though related) use of the same symbol.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §5.4 Mass and Weight', url: 'https://openstax.org/books/university-physics-volume-1/pages/5-4-mass-and-weight' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'NASA, Moon Fact Sheet (surface gravity)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass (kg)', type: 'number', placeholder: '70', defaultValue: 70, step: 0.1, min: 0 },
      { id: 'gravity', label: 'Gravity (m/s²)', type: 'number', placeholder: '9.80665', defaultValue: STANDARD_GRAVITY, step: 0.01 }
    ],
    seo: {
      title: 'Weight Calculator (W = mg) – Weight, Mass or Gravity',
      description: 'Free weight calculator using W = m × g. Solve for weight, mass or local gravity in N, lbf, kg or lb, with a worked Earth-vs-Moon example.',
      faq: [
        { question: 'What is the formula for weight?', answer: 'Weight equals mass times gravitational acceleration: W = m × g. On Earth, using standard gravity (9.80665 m/s²), a 70 kg mass weighs about 686.5 N.' },
        { question: 'How much does a 70 kg person weigh in newtons?', answer: '70 × 9.80665 = 686.47 N, about 686.5 N — or about 154.3 lbf in pound-force.' },
        { question: 'Is weight the same as mass?', answer: 'No. Mass is how much matter an object has and never changes. Weight is the force gravity exerts on that mass, and it changes with location — a 70 kg person weighs about 686.5 N on Earth but only about 113.4 N on the Moon.' },
        { question: 'Why would I weigh less on the Moon?', answer: "The Moon's surface gravity is about 1.62 m/s², roughly a sixth of Earth's 9.80665 m/s². Since weight is mass times gravity, the same 70 kg mass produces only about 113.4 N of weight there, versus about 686.5 N on Earth." },
        { question: 'How do I convert kilograms to pounds-force?', answer: 'Multiply the mass in kilograms by standard gravity to get newtons, then divide by 4.448 to get pounds-force. A 70 kg mass is about 686.5 N, or about 154.3 lbf.' },
        { question: 'What is "standard gravity"?', answer: "Standard gravity, g = 9.80665 m/s², is a fixed reference value for Earth's gravitational acceleration, used for calculations and unit definitions even though the real local value varies slightly by latitude and altitude." },
        { question: 'How do I find mass if I know the weight?', answer: 'Divide weight by gravity: m = W ÷ g. A 500 N weight under standard gravity corresponds to a mass of about 51.0 kg.' }
      ]
    },
    compute(values) {
      return { weight: values.mass * values.gravity };
    }
  },
  {
    id: 'kinetic-energy-calculator',
    category: 'physics',
    glyph: 'KE',
    updatedAt: '2026-11-06',
    aliases: ['ke = 1/2 mv2 calculator', 'kinetic energy formula calculator', 'energy of motion calculator', '1/2 mv^2 calculator', 'moving object energy calculator'],
    related: ['potential-energy-calculator', 'work-calculator', 'energy-converter', 'force-calculator'],
    title: 'Kinetic Energy Calculator (KE = ½mv²)',
    description: 'Calculate the kinetic energy of a moving object from its mass and velocity — KE = ½ × m × v² — or solve backward for mass or velocity, in joules, kilojoules, calories, or kWh.',
    example: 'A 1,200 kg car traveling at 72 km/h (20 m/s) carries about 240,000 J of kinetic energy — 240 kJ, or about 66.7 Wh.',
    solver: {
      defaultTarget: 'energy',
      variables: [
        { id: 'energy', label: 'Kinetic energy', symbol: 'KE', dimension: 'energy', defaultValue: 240, defaultUnit: 'kJ' },
        { id: 'mass', label: 'Mass', symbol: 'm', dimension: 'mass', defaultValue: 1200, defaultUnit: 'kg' },
        { id: 'velocity', label: 'Velocity', symbol: 'v', dimension: 'speed', defaultValue: 72, defaultUnit: 'km/h' }
      ],
      solve: {
        energy: ({ mass, velocity }) => 0.5 * mass * velocity * velocity,
        mass: ({ energy, velocity }) => (velocity === 0 ? NaN : (2 * energy) / (velocity * velocity)),
        velocity: ({ energy, mass }) => {
          if (mass <= 0) return NaN;
          const vSquared = (2 * energy) / mass;
          return vSquared < 0 ? NaN : Math.sqrt(vSquared);
        }
      },
      visuals: [
        {
          type: 'logScale',
          value: 'energy',
          min: -1,
          max: 7,
          ticks: ['0.1 J', '10 J', '1 kJ', '100 kJ', '10 MJ'],
          benchmarks: [
            { label: 'Lifting a 102 g apple 1 meter', value: 1.0003 },
            { label: 'A 100 mph fastball (0.145 kg baseball)', value: 144.9 },
            { label: 'A 100 W bulb, running for 1 minute', value: 6000 },
            { label: 'A 1,500 kg car at 100 km/h', value: 578700 }
          ],
          title: 'How big is that energy?',
          valueLabel: 'Your kinetic energy'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is kinetic energy?',
        paragraphs: [
          'Kinetic energy is the energy an object has because it is moving. A parked car has none; the same car rolling down the highway has a great deal, and that energy has to go somewhere when the car slows down — into heat in the brakes, into a crumpled fender, or back into motion going the other way.',
          'The formula, KE = ½mv², depends on mass directly but on velocity squared. That squared term matters: a car going twice as fast does not have twice the kinetic energy, it has four times as much. Doubling the mass only doubles the energy, but doubling the speed quadruples it — which is a large part of why faster collisions are so much more damaging than slower ones.',
          "Kinetic energy, like all energy, is measured in joules (J) in SI units. It is also always zero or positive — mass and the square of speed can never be negative — unlike momentum, which can point in different directions and cancel out."
        ]
      },
      howTo: {
        intro: 'Fill in any two of kinetic energy, mass and velocity; the third fills in automatically, so the same page finds energy from mass and speed, or the mass or speed behind a known amount of energy.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there — 1,200 kg becomes 2,645 lb, not a different mass with the same digits.' },
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen energy unit, with the scale below placing it among a few everyday reference points.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The kinetic energy formula rearranges to solve for mass or velocity as well as energy.',
        expression: 'KE = ½ × m × v²\nm = 2 × KE ÷ v²\nv = √(2 × KE ÷ m)',
        terms: [
          { symbol: 'KE', meaning: 'Kinetic energy, in joules (J). 1 J = 1 kg·m²/s².' },
          { symbol: 'm', meaning: 'Mass of the moving object, in kilograms (kg).' },
          { symbol: 'v', meaning: 'Speed of the object, in meters per second (m/s) — its magnitude only; direction does not matter for kinetic energy.' }
        ],
        note: 'Every input is converted to SI units (kg, m/s) before solving, so entering velocity in km/h or mph is handled automatically — just be careful with the arithmetic if you ever compute it by hand, since plugging in km/h directly gives the wrong number of joules.'
      },
      workedExample: {
        intro: 'A 1,200 kg car is traveling at 72 km/h. How much kinetic energy does it have?',
        rows: [
          { label: 'Mass (m)', value: '1,200 kg' },
          { label: 'Velocity, converted (v = 72 km/h ÷ 3.6)', value: '20 m/s' },
          { label: 'Kinetic energy (KE = 0.5 × 1,200 × 20²)', value: '240,000 J' }
        ],
        result: 'KE = 240,000 J · 240 kJ · 66.67 Wh · 57.36 kcal',
        explanation: '72 km/h converts to 20 m/s (72 ÷ 3.6). Squaring 20 gives 400, and 0.5 × 1,200 × 400 = 240,000 J. In other units, that is 240 kJ, about 66.7 Wh, or about 57.4 kcal — all the same amount of energy, just expressed differently.'
      },
      watchOut: [
        {
          title: 'Convert speed to m/s before computing by hand',
          body: 'The formula is only correct in SI units. Plugging km/h or mph directly into ½mv² without converting first gives a number with the wrong units entirely, not just a slightly wrong answer. This calculator converts for you automatically.'
        },
        {
          title: 'Doubling speed quadruples kinetic energy, not doubles it',
          body: 'Because velocity is squared, a car at 60 mph has four times the kinetic energy of the same car at 30 mph, not twice. That squared relationship is a major reason higher-speed impacts are disproportionately more severe.'
        },
        {
          title: 'Kinetic energy depends on speed, not direction',
          body: 'Unlike momentum, kinetic energy only cares about how fast something is moving, not which way. Two identical cars heading toward each other at 50 mph each have kinetic energy as individuals, but their momenta can cancel at the moment of collision while their combined kinetic energy does not.'
        },
        {
          title: 'Kinetic energy is relative to a reference frame',
          body: "A passenger's kinetic energy relative to the inside of a moving train is zero if they are sitting still, but is substantial relative to the ground outside. Always be clear about what the velocity is measured against."
        },
        {
          title: 'Kinetic energy is not potential energy or work',
          body: 'All three are measured in joules, but they describe different things: kinetic energy is energy of motion, potential energy is stored energy due to position, and work is energy transferred by a force. Converting between them (as in a falling object) is a separate calculation from any one of them alone.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §7.2 Kinetic Energy', url: 'https://openstax.org/books/university-physics-volume-1/pages/7-2-kinetic-energy' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass (kg)', type: 'number', placeholder: '1200', defaultValue: 1200, step: 1, min: 0 },
      { id: 'velocity', label: 'Velocity (m/s)', type: 'number', placeholder: '20', defaultValue: 20, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Kinetic Energy Calculator (KE = ½mv²)',
      description: 'Free kinetic energy calculator. Solve KE = ½mv² for energy, mass or velocity in joules, kJ, kWh or kcal, with a worked car example.',
      faq: [
        { question: 'What is the formula for kinetic energy?', answer: 'KE = ½ × m × v², where m is mass in kilograms and v is speed in meters per second. The result is in joules.' },
        { question: 'How much kinetic energy does a 1,200 kg car at 72 km/h have?', answer: '72 km/h is 20 m/s, so KE = 0.5 × 1,200 × 20² = 240,000 J, which is 240 kJ.' },
        { question: 'Does doubling speed double kinetic energy?', answer: 'No — it quadruples it, because velocity is squared in the formula. A car at 60 mph has four times the kinetic energy of the same car at 30 mph, not twice.' },
        { question: 'What are the SI units of kinetic energy?', answer: 'The joule (J), equal to 1 kg·m²/s². Kinetic energy is also commonly shown in kilojoules, watt-hours, or kilocalories.' },
        { question: 'How is kinetic energy different from potential energy?', answer: 'Kinetic energy is the energy of motion (depends on mass and speed). Potential energy is stored energy due to position, such as height above the ground. Both are measured in joules but come from different formulas.' },
        { question: 'Can kinetic energy be negative?', answer: 'No. Mass is never negative and velocity is squared, so ½mv² is always zero or positive.' },
        { question: 'How do I convert joules of kinetic energy to kilowatt-hours?', answer: 'Divide by 3,600,000 (since 1 kWh = 3.6 million J). A 240,000 J kinetic energy is 240,000 ÷ 3,600,000 ≈ 0.0667 kWh.' }
      ]
    },
    compute(values) {
      return { energy: 0.5 * values.mass * values.velocity * values.velocity };
    }
  },
  {
    id: 'potential-energy-calculator',
    category: 'physics',
    glyph: 'PE',
    updatedAt: '2026-11-06',
    aliases: ['gravitational potential energy calculator', 'pe = mgh calculator', 'height energy calculator', 'stored energy calculator', 'mgh calculator'],
    related: ['kinetic-energy-calculator', 'work-calculator', 'energy-converter', 'force-calculator'],
    title: 'Potential Energy Calculator (PE = mgh)',
    description: 'Calculate gravitational potential energy from mass and height above a reference point — PE = m × g × h — or solve backward for mass or height.',
    example: 'A 65 kg hiker standing 250 m above the trailhead carries about 159,358 J (159.4 kJ) of gravitational potential energy relative to the start.',
    solver: {
      defaultTarget: 'energy',
      variables: [
        { id: 'energy', label: 'Potential energy', symbol: 'PE', dimension: 'energy', defaultValue: 159.4, defaultUnit: 'kJ' },
        { id: 'mass', label: 'Mass', symbol: 'm', dimension: 'mass', defaultValue: 65, defaultUnit: 'kg' },
        { id: 'height', label: 'Height', symbol: 'h', dimension: 'length', defaultValue: 250, defaultUnit: 'm' }
      ],
      solve: {
        energy: ({ mass, height }) => mass * STANDARD_GRAVITY * height,
        mass: ({ energy, height }) => (height === 0 ? NaN : energy / (STANDARD_GRAVITY * height)),
        height: ({ energy, mass }) => (mass === 0 ? NaN : energy / (STANDARD_GRAVITY * mass))
      },
      visuals: [
        {
          type: 'logScale',
          value: 'energy',
          min: -1,
          max: 7,
          ticks: ['0.1 J', '10 J', '1 kJ', '100 kJ', '10 MJ'],
          benchmarks: [
            { label: 'Lifting a 102 g apple 1 meter', value: 1.0003 },
            { label: 'A 100 mph fastball (0.145 kg baseball)', value: 144.9 },
            { label: 'A 100 W bulb, running for 1 minute', value: 6000 },
            { label: 'A 1,500 kg car at 100 km/h', value: 578700 }
          ],
          title: 'How big is that energy?',
          valueLabel: 'Your potential energy'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is gravitational potential energy?',
        paragraphs: [
          'Gravitational potential energy is energy an object has because of its height above some reference point, stored there by whatever lifted it against gravity. A book on a shelf, water behind a dam, and a hiker partway up a hill all carry potential energy that can convert into motion (kinetic energy) the moment something lets them fall.',
          'The formula PE = mgh only holds near a planet\'s surface, where gravitational acceleration g is close to constant over the height involved. OpenStax writes this gravitational potential energy as U(y) = mgy, measuring height as y from a chosen zero point — the same relationship this calculator uses, with h for height.',
          "Potential energy is always relative. Choosing the ground floor as height zero gives a different number than choosing sea level, but the *difference* in potential energy between two heights — which is what actually matters for energy conservation — comes out the same regardless of where you set zero."
        ]
      },
      howTo: {
        intro: 'Fill in any two of potential energy, mass and height; the third fills in automatically — gravity is held at the standard 9.80665 m/s² used throughout this calculator.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Set height from a clear reference point', text: 'Measure height straight up from whatever you are calling "zero" — the ground, a table top, or sea level — not along a slope or path.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 250 m becomes 820.2 ft instead of silently turning into 250 ft.' },
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen energy unit, with the scale below placing it among a few everyday reference points.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The potential energy formula rearranges to solve for mass or height as well as energy.',
        expression: 'PE = m × g × h\nm = PE ÷ (g × h)\nh = PE ÷ (m × g)',
        terms: [
          { symbol: 'PE', meaning: 'Gravitational potential energy, in joules (J), relative to the height you measure from.' },
          { symbol: 'm', meaning: 'Mass of the object, in kilograms (kg).' },
          { symbol: 'g', meaning: 'Gravitational acceleration, fixed here at standard gravity, 9.80665 m/s².' },
          { symbol: 'h', meaning: 'Height above the reference point, in meters (m), measured vertically.' }
        ],
        note: "This formula assumes roughly constant gravity, which holds near a planet's surface. It is not accurate for heights large enough that gravity itself changes meaningfully, such as a satellite's orbit."
      },
      workedExample: {
        intro: 'A 65 kg hiker climbs to a point 250 m above the trailhead. How much potential energy has the hiker gained, relative to the start?',
        rows: [
          { label: 'Mass (m)', value: '65 kg' },
          { label: 'Gravity (g)', value: '9.80665 m/s²' },
          { label: 'Height (h)', value: '250 m' },
          { label: 'Potential energy (PE = 65 × 9.80665 × 250)', value: '159,358.06 J' }
        ],
        result: 'PE ≈ 159.4 kJ · 44.27 Wh · 38.09 kcal',
        explanation: '65 × 9.80665 = 637.43, and 637.43 × 250 = 159,358.06 J. That is about 159.4 kJ, or about 44.3 Wh — roughly the energy a hiker would release as heat and sound if they fell straight back down to the trailhead, ignoring air resistance.'
      },
      watchOut: [
        {
          title: 'Potential energy is relative to a reference point',
          body: 'Moving the "zero" height up or down changes the number you calculate, but not the physics — only differences in potential energy between two points actually affect motion. Always be clear about what height you are measuring from.'
        },
        {
          title: 'Height means vertical rise, not distance traveled',
          body: 'A hiker who switchbacks up a long, gentle trail covers far more ground distance than the straight-line vertical height they gain. Use the net vertical height for h, not the length of the path.'
        },
        {
          title: 'PE = mgh assumes gravity is roughly constant',
          body: "This formula is only accurate near a planet's surface, where g barely changes with height. For heights comparable to a planet's radius — satellites and orbits, for instance — a different, non-linear form of gravitational potential energy applies."
        },
        {
          title: "It's gravitational potential energy specifically",
          body: 'Other forms of potential energy exist — a stretched spring stores elastic potential energy, a charged battery stores electrical potential energy — and none of them use mgh. This formula only applies to height in a gravity field.'
        },
        {
          title: 'The path taken does not matter, only the net height',
          body: "Because gravity is a conservative force, the potential energy gained depends only on the net change in height, not on the route taken to get there. A hiker gains the same potential energy walking straight up a cliff or zigzagging up a gentle trail to the same final height."
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §8.1 Potential Energy of a System', url: 'https://openstax.org/books/university-physics-volume-1/pages/8-1-potential-energy-of-a-system' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass (kg)', type: 'number', placeholder: '65', defaultValue: 65, step: 0.1, min: 0 },
      { id: 'height', label: 'Height (m)', type: 'number', placeholder: '250', defaultValue: 250, step: 1, min: 0 }
    ],
    seo: {
      title: 'Potential Energy Calculator (PE = mgh)',
      description: 'Free gravitational potential energy calculator. Solve PE = mgh for energy, mass or height in joules, kJ, kWh or kcal, with a worked hiking example.',
      faq: [
        { question: 'What is the formula for gravitational potential energy?', answer: 'PE = m × g × h, where m is mass in kilograms, g is gravitational acceleration (9.80665 m/s² near Earth\'s surface), and h is height in meters. The result is in joules.' },
        { question: 'How much potential energy does a 65 kg hiker have 250 m up a hill?', answer: 'PE = 65 × 9.80665 × 250 ≈ 159,358 J, about 159.4 kJ, relative to the base of the hill.' },
        { question: 'Why does potential energy depend on the reference point?', answer: 'Height, and therefore PE, is always measured relative to a chosen zero point. Changing where "zero" is shifts every PE value by the same amount, but the difference in PE between two heights — the figure that actually matters physically — stays the same.' },
        { question: 'What is g in the potential energy formula?', answer: 'Standard gravitational acceleration, fixed at 9.80665 m/s² near Earth\'s surface. This calculator uses that value throughout.' },
        { question: 'How is potential energy different from kinetic energy?', answer: 'Potential energy is stored energy due to position (height in a gravity field); kinetic energy is the energy of motion (depends on mass and speed). A falling object converts potential energy into kinetic energy as it drops.' },
        { question: 'Does potential energy depend on the path taken to reach a height?', answer: 'No. Gravity is a conservative force, so potential energy depends only on the net vertical height gained, not on the route taken to get there.' },
        { question: 'How do I convert joules of potential energy to kilowatt-hours?', answer: 'Divide by 3,600,000. A potential energy of 159,358 J is 159,358 ÷ 3,600,000 ≈ 0.0443 kWh.' }
      ]
    },
    compute(values) {
      return { energy: values.mass * STANDARD_GRAVITY * values.height };
    }
  },
  {
    id: 'work-calculator',
    category: 'physics',
    glyph: 'Fd',
    updatedAt: '2026-11-06',
    aliases: ['w = fd cos theta calculator', 'force times distance calculator', 'mechanical work calculator', 'work done calculator', 'work physics calculator'],
    related: ['kinetic-energy-calculator', 'potential-energy-calculator', 'force-calculator', 'energy-converter'],
    title: 'Work Calculator (W = Fd cos θ)',
    description: 'Calculate mechanical work from force, distance, and the angle between them — W = F × d × cos θ — or solve backward for force, distance, or angle.',
    example: 'Pulling a sled with 50 N of force at 30° above horizontal over 20 m does about 866 J of work — less than the 1,000 J a straight-line pull would do.',
    solver: {
      defaultTarget: 'work',
      variables: [
        { id: 'work', label: 'Work', symbol: 'W', dimension: 'energy', defaultValue: 866.03, defaultUnit: 'J' },
        { id: 'force', label: 'Force', symbol: 'F', dimension: 'force', defaultValue: 50, defaultUnit: 'N' },
        { id: 'distance', label: 'Distance', symbol: 'd', dimension: 'length', defaultValue: 20, defaultUnit: 'm' },
        { id: 'angle', label: 'Angle', symbol: 'θ', dimension: 'angle', defaultValue: 30, defaultUnit: 'deg' }
      ],
      solve: {
        work: ({ force, distance, angle }) => force * distance * Math.cos(angle),
        force: ({ work, distance, angle }) => {
          const c = Math.cos(angle);
          return distance === 0 || c === 0 ? NaN : work / (distance * c);
        },
        distance: ({ work, force, angle }) => {
          const c = Math.cos(angle);
          return force === 0 || c === 0 ? NaN : work / (force * c);
        },
        angle: ({ work, force, distance }) => {
          if (force === 0 || distance === 0) return NaN;
          const c = work / (force * distance);
          return c < -1 || c > 1 ? NaN : Math.acos(c);
        }
      },
      visuals: [
        {
          type: 'logScale',
          value: 'work',
          min: -1,
          max: 7,
          ticks: ['0.1 J', '10 J', '1 kJ', '100 kJ', '10 MJ'],
          benchmarks: [
            { label: 'Lifting a 102 g apple 1 meter', value: 1.0003 },
            { label: 'A 100 mph fastball (0.145 kg baseball)', value: 144.9 },
            { label: 'A 100 W bulb, running for 1 minute', value: 6000 },
            { label: 'A 1,500 kg car at 100 km/h', value: 578700 }
          ],
          title: 'How big is that work?',
          valueLabel: 'Your work'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is work in physics?',
        paragraphs: [
          'Work is the physics term for energy transferred by a force acting through a distance. Pushing a box across a floor does work on the box; holding a heavy box perfectly still, no matter how tiring, does none — because nothing moved.',
          'Only the part of the force that points along the direction of motion actually does work. That is what the cos θ term captures: θ is the angle between the force and the displacement. When force and motion point the same way (θ = 0°), cos θ = 1 and every bit of the force counts. As the angle widens toward 90°, cos θ shrinks toward zero, and a force acting exactly perpendicular to the motion does no work at all.',
          'Work can also come out negative. If a force acts opposite to the direction of motion — friction slowing down a sliding box, for instance — the angle between force and motion exceeds 90°, cos θ is negative, and the force removes energy from the motion rather than adding it.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of work, force, distance and angle; the fourth fills in automatically — set the angle to 0° for a force pulling straight along the direction of motion.',
        steps: [
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit. The remaining field, marked auto, calculates as you type.' },
          { name: 'Measure the angle correctly', text: 'The angle is between the force and the direction of motion — not from vertical, not from the ground. A force pulling exactly along the motion is 0°; a sideways push is 90°.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 50 N becomes 11.24 lbf instead of silently turning into 50 lbf.' },
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen energy unit, with the scale below placing it among a few everyday reference points.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The work formula rearranges to solve for force, distance or angle as well as work.',
        expression: 'W = F × d × cos θ\nF = W ÷ (d × cos θ)\nd = W ÷ (F × cos θ)\nθ = cos⁻¹(W ÷ (F × d))',
        terms: [
          { symbol: 'W', meaning: 'Work done, in joules (J). 1 J = 1 N·m.' },
          { symbol: 'F', meaning: 'Magnitude of the applied force, in newtons (N).' },
          { symbol: 'd', meaning: 'Distance the object moves (displacement), in meters (m).' },
          { symbol: 'θ', meaning: 'Angle between the force and the direction of motion. 0° is fully aligned; 90° does zero work; past 90° the work is negative.' }
        ],
        note: 'Every input is converted to SI units (N, m, rad) before solving and converted back afterward, so entering the angle in degrees works exactly as expected.'
      },
      workedExample: {
        intro: 'Someone pulls a sled with 50 N of force at 30° above horizontal, moving it 20 m. How much work is done?',
        rows: [
          { label: 'Force (F)', value: '50 N' },
          { label: 'Distance (d)', value: '20 m' },
          { label: 'Angle (θ)', value: '30°, cos 30° = 0.8660' },
          { label: 'Work (W = 50 × 20 × 0.8660)', value: '866.03 J' }
        ],
        result: 'W ≈ 866.03 J',
        explanation: 'cos 30° ≈ 0.8660, so W = 50 × 20 × 0.8660 ≈ 866.03 J. Pulling the same sled the same 20 m with the force aimed exactly along the direction of motion (θ = 0°) would do 50 × 20 × 1 = 1,000 J — so the 30° angle "wastes" about 13.4% of the possible work, since 866.03 ÷ 1,000 ≈ 86.6%.'
      },
      watchOut: [
        {
          title: 'The angle is between force and motion, not from vertical or the ground',
          body: 'θ in this formula is specifically the angle between the direction of the applied force and the direction the object actually moves. Measuring from the wrong reference line is the most common mistake with this formula.'
        },
        {
          title: 'A perpendicular force does zero work',
          body: 'At θ = 90°, cos θ = 0, so the work is zero no matter how large the force is. Carrying a bag of groceries at a constant height does no work against gravity, even though your arms get tired — the force you apply (upward, against gravity) is perpendicular to your motion (forward).'
        },
        {
          title: 'Work can be negative',
          body: 'When a force acts against the direction of motion — friction decelerating a sliding box, for example — the angle is more than 90° and cos θ is negative, making the work negative. Negative work removes kinetic energy rather than adding it.'
        },
        {
          title: 'At exactly 60°, you only get half the work of a straight pull',
          body: 'Because cos 60° = 0.5 exactly, angling a pull at 60° from the direction of motion does exactly half the work that pulling straight (0°) would, for the same force and distance — a useful rule of thumb for quick estimates.'
        },
        {
          title: '"Work" here is the physics quantity, not a job or a workout',
          body: 'This page calculates mechanical work in joules — energy transferred by a force — not hours worked or exercise intensity.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §7.1 Work', url: 'https://openstax.org/books/university-physics-volume-1/pages/7-1-work' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'force', label: 'Force (N)', type: 'number', placeholder: '50', defaultValue: 50, step: 0.1, min: 0 },
      { id: 'distance', label: 'Distance (m)', type: 'number', placeholder: '20', defaultValue: 20, step: 0.1, min: 0 },
      { id: 'angle', label: 'Angle (rad)', type: 'number', placeholder: '0.5236', defaultValue: Math.PI / 6, step: 0.01 }
    ],
    seo: {
      title: 'Work Calculator (W = Fd cos θ) – Force, Distance or Angle',
      description: 'Free mechanical work calculator. Solve W = F × d × cos θ for work, force, distance or angle in joules, newtons and meters, with a worked example.',
      faq: [
        { question: 'What is the formula for work in physics?', answer: 'W = F × d × cos θ, where F is the applied force, d is the distance moved, and θ is the angle between the force and the direction of motion.' },
        { question: 'How do you calculate work when the force is at an angle?', answer: 'Multiply force by distance by the cosine of the angle between them: W = F × d × cos θ. Pulling with 50 N over 20 m at 30° does 50 × 20 × cos 30° ≈ 866 J.' },
        { question: 'What happens to work when the angle is 90 degrees?', answer: 'It drops to zero. cos 90° = 0, so a force acting exactly perpendicular to the motion does no work at all, regardless of its size.' },
        { question: 'Can work be negative?', answer: 'Yes. When a force acts opposite to the direction of motion (angle greater than 90°), cos θ is negative, making the work negative — the force removes energy rather than adding it.' },
        { question: 'How much work does pulling at 30° do compared to pulling straight?', answer: 'cos 30° ≈ 0.8660, so a 30° pull does about 86.6% of the work a straight-line (0°) pull of the same force and distance would do.' },
        { question: 'What are the SI units of work?', answer: 'The joule (J), the same unit used for energy — 1 J equals 1 newton-meter (N·m).' },
        { question: 'How is work different from power?', answer: 'Work has no time component — it only depends on force, distance and angle. Power is the rate at which work is done, work divided by the time it takes.' }
      ]
    },
    compute(values) {
      return { work: values.force * values.distance * Math.cos(values.angle) };
    }
  },
  {
    id: 'momentum-calculator',
    category: 'physics',
    glyph: 'p',
    updatedAt: '2026-11-06',
    aliases: ['p = mv calculator', 'linear momentum calculator', 'momentum formula calculator', 'mass velocity momentum calculator', 'momentum of an object calculator'],
    related: ['impulse-calculator', 'kinetic-energy-calculator', 'force-calculator', 'speed-distance-time-calculator'],
    title: 'Momentum Calculator (p = mv)',
    description: 'Calculate linear momentum from mass and velocity — p = m × v — or solve backward for mass or velocity, in kg·m/s or N·s.',
    example: 'A 1,500 kg car traveling at 20 m/s (72 km/h) has a momentum of 30,000 kg·m/s — the same as 30,000 N·s.',
    solver: {
      defaultTarget: 'momentum',
      variables: [
        { id: 'momentum', label: 'Momentum', symbol: 'p', dimension: 'momentum', defaultValue: 30000, defaultUnit: 'kgm/s' },
        { id: 'mass', label: 'Mass', symbol: 'm', dimension: 'mass', defaultValue: 1500, defaultUnit: 'kg' },
        { id: 'velocity', label: 'Velocity', symbol: 'v', dimension: 'speed', defaultValue: 20, defaultUnit: 'm/s' }
      ],
      solve: {
        momentum: ({ mass, velocity }) => mass * velocity,
        mass: ({ momentum, velocity }) => (velocity === 0 ? NaN : momentum / velocity),
        velocity: ({ momentum, mass }) => (mass === 0 ? NaN : momentum / mass)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'momentum',
          min: 0,
          max: 8,
          ticks: ['1 kg·m/s', '100 kg·m/s', '10,000 kg·m/s', '1,000,000 kg·m/s', '100,000,000 kg·m/s'],
          benchmarks: [
            { label: 'A pitched baseball', value: 5.8 },
            { label: 'A walking adult', value: 98 },
            { label: 'A car at highway speed', value: 40500 },
            { label: 'A freight train', value: 3e7 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your momentum'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is momentum?',
        paragraphs: [
          'Momentum is a measure of how hard it is to stop something that is moving — it combines how much mass an object has with how fast it is going. A bowling ball rolling slowly and a baseball thrown fast can have similar momentum even though their masses are wildly different, because momentum weighs mass and speed equally: p = m × v.',
          'Unlike kinetic energy, momentum is a vector — it points in the direction the object is moving, and momentum in opposite directions can cancel out. Two identical cars approaching each other at the same speed have equal and opposite momentum, so their combined momentum is zero even though neither car has stopped moving.',
          'Momentum matters most through its conservation law: in a system with no outside forces, total momentum before a collision equals total momentum after it. That single idea explains everything from how a cue ball transfers motion to another ball, to why a rocket accelerates forward by throwing exhaust gas backward.',
          'Momentum and impulse — the subject of the related calculator on this site — share the same physical unit. A newton is defined as the force that gives 1 kg of mass an acceleration of 1 m/s² (1 N = 1 kg·m/s²), so a newton-second (N·s) and a kilogram-meter-per-second (kg·m/s) are the same unit under two conventional names: N·s for impulse, kg·m/s for momentum.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of momentum, mass and velocity; the third fills in automatically, so the same page answers "how much momentum", "how heavy" and "how fast".',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 1,500 kg becomes 3,306.9 lb instead of silently turning into 1,500 lb.' },
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen unit, with the scale below placing it among a few everyday moving objects.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The momentum formula rearranges to solve for mass or velocity as well as momentum.',
        expression: 'p = m × v\nm = p ÷ v\nv = p ÷ m',
        terms: [
          { symbol: 'p', meaning: 'Linear momentum, in kilogram-meters per second (kg·m/s), identical in size to the newton-second (N·s) used for impulse.' },
          { symbol: 'm', meaning: 'Mass of the object, in kilograms (kg).' },
          { symbol: 'v', meaning: 'Velocity of the object, in meters per second (m/s) — its magnitude and direction both matter, though this calculator works with magnitude along one line.' }
        ],
        note: 'Every input is converted to SI units (kg, m/s) before solving and converted back afterward, so mixed units cannot produce a wrong result.'
      },
      workedExample: {
        intro: 'A 1,500 kg car is traveling at 20 m/s (72 km/h). What is its momentum?',
        rows: [
          { label: 'Mass (m)', value: '1,500 kg' },
          { label: 'Velocity (v)', value: '20 m/s' },
          { label: 'Momentum (p = 1,500 × 20)', value: '30,000 kg·m/s' }
        ],
        result: 'p = 30,000 kg·m/s = 30,000 N·s',
        explanation: '1,500 × 20 = 30,000, so the car has a momentum of 30,000 kg·m/s. Because a newton is defined as 1 kg·m/s², that same amount of momentum is also exactly 30,000 N·s — the two units describe the identical physical quantity.'
      },
      watchOut: [
        {
          title: 'Momentum has a direction; kinetic energy does not',
          body: 'Momentum is a vector. Two cars of equal mass heading toward each other at the same speed have momenta that point opposite ways and sum to zero, even though both are clearly moving and both carry real kinetic energy.'
        },
        {
          title: 'kg·m/s and N·s are the same unit, not a coincidence',
          body: 'A newton is defined so that 1 N = 1 kg·m/s². Multiplying by seconds gives N·s = kg·m/s — so a result in kg·m/s and the same result in N·s are always identical numbers, which is why impulse and momentum can be compared directly (the impulse-momentum theorem, J = Δp).'
        },
        {
          title: 'Doubling velocity only doubles momentum, unlike kinetic energy',
          body: 'Momentum scales linearly with velocity (p = m × v), while kinetic energy scales with velocity squared (KE = ½mv²). A car going twice as fast has twice the momentum, but four times the kinetic energy — two different quantities that respond differently to the same change in speed.'
        },
        {
          title: 'Total momentum is conserved only without outside forces',
          body: 'The conservation of momentum applies to a closed system — no net outside force acting on it. A rolling ball slows down because friction and air resistance are outside forces removing momentum from the ball (and transferring it to the Earth), not because momentum itself has disappeared.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §9.1 Linear Momentum', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-1-linear-momentum' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass (kg)', type: 'number', placeholder: '1500', defaultValue: 1500, step: 1, min: 0 },
      { id: 'velocity', label: 'Velocity (m/s)', type: 'number', placeholder: '20', defaultValue: 20, step: 0.1 }
    ],
    seo: {
      title: 'Momentum Calculator (p = mv) – Mass, Velocity, Momentum',
      description: 'Free momentum calculator. Solve p = m × v for momentum, mass or velocity in kg·m/s or N·s, with a worked example and the impulse-momentum link.',
      faq: [
        { question: 'What is the formula for momentum?', answer: 'Momentum equals mass times velocity: p = m × v. With mass in kilograms and velocity in meters per second, the result is in kg·m/s.' },
        { question: 'How much momentum does a 1,500 kg car at 20 m/s have?', answer: '1,500 × 20 = 30,000 kg·m/s, which is the same as 30,000 N·s.' },
        { question: 'Are kg·m/s and N·s the same unit?', answer: 'Yes, exactly. A newton is defined as 1 kg·m/s², so N·s = kg·m/s²·s = kg·m/s. Momentum is conventionally reported in kg·m/s and impulse in N·s, but they are the same unit.' },
        { question: 'Is momentum a vector or a scalar?', answer: 'A vector — it has both a size and a direction. Two equal masses moving toward each other at the same speed have momenta that point opposite ways and add to zero.' },
        { question: 'How do I find mass from momentum and velocity?', answer: 'Divide momentum by velocity: m = p ÷ v. An object with 500 kg·m/s of momentum moving at 10 m/s has a mass of 50 kg.' },
        { question: 'Does doubling velocity double momentum?', answer: 'Yes. Momentum is proportional to velocity (p = m × v), so doubling velocity exactly doubles momentum — unlike kinetic energy, which quadruples.' },
        { question: 'What is the relationship between momentum and impulse?', answer: 'The impulse-momentum theorem states that the impulse delivered to an object equals its change in momentum, J = Δp. See the impulse calculator for the force-and-time side of that relationship.' }
      ]
    },
    compute(values) {
      return { momentum: values.mass * values.velocity };
    }
  },
  {
    id: 'impulse-calculator',
    category: 'physics',
    glyph: 'J',
    updatedAt: '2026-11-06',
    aliases: ['j = f delta t calculator', 'impulse momentum theorem calculator', 'impulse formula calculator', 'force time impulse calculator', 'change in momentum calculator'],
    related: ['momentum-calculator', 'force-calculator', 'kinetic-energy-calculator', 'speed-distance-time-calculator'],
    title: 'Impulse Calculator (J = FΔt)',
    description: 'Calculate impulse from force and the time it acts — J = F × Δt — or solve backward for force or time, in N·s (the same unit as momentum, kg·m/s).',
    example: 'A 50 N force applied for 0.6 seconds delivers an impulse of 30 N·s — the same 30 kg·m/s of momentum it would add to any object it acted on.',
    solver: {
      defaultTarget: 'impulse',
      variables: [
        { id: 'impulse', label: 'Impulse', symbol: 'J', dimension: 'momentum', defaultValue: 30, defaultUnit: 'Ns' },
        { id: 'force', label: 'Force', symbol: 'F', dimension: 'force', defaultValue: 50, defaultUnit: 'N' },
        { id: 'time', label: 'Time', symbol: 'Δt', dimension: 'time', defaultValue: 0.6, defaultUnit: 's' }
      ],
      solve: {
        impulse: ({ force, time }) => force * time,
        force: ({ impulse, time }) => (time === 0 ? NaN : impulse / time),
        time: ({ impulse, force }) => (force === 0 ? NaN : impulse / force)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'impulse',
          min: 0,
          max: 8,
          ticks: ['1 N·s', '100 N·s', '10,000 N·s', '1,000,000 N·s', '100,000,000 N·s'],
          benchmarks: [
            { label: 'A pitched baseball', value: 5.8 },
            { label: 'A walking adult', value: 98 },
            { label: 'A car at highway speed', value: 40500 },
            { label: 'A freight train', value: 3e7 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your impulse'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is impulse?',
        paragraphs: [
          'Impulse is a measure of how much a force changes an object\'s motion, accounting for both how strong the force is and how long it acts: J = F × Δt. A gentle push sustained for a long time can deliver the same impulse as a hard shove applied briefly — a catcher\'s mitt and a bare hand can stop the same baseball, but the mitt spreads the impulse over more time, which (as the formula below shows) means less peak force.',
          'The impulse-momentum theorem ties this directly to the momentum calculator on this site: the impulse delivered to an object equals its change in momentum, J = Δp. That is not a coincidence of similar formulas — it follows directly from Newton\'s second law, since force is the rate of change of momentum (F = Δp ÷ Δt), so force multiplied by time is exactly the momentum change.',
          'Because of that theorem, impulse and momentum are measured in the same physical unit. A newton is defined as 1 kg·m/s² (1 N = 1 kg·m/s²), so a newton-second works out to N·s = kg·m/s²·s = kg·m/s — identical to the unit used for momentum. This calculator uses N·s as the default display because that is the conventional unit for impulse specifically, but the number means the same thing either way.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of impulse, force and time; the third fills in automatically, so the same page answers "how much impulse", "how much force" and "for how long".',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 50 N becomes 11.24 lbf instead of silently turning into 50 lbf.' },
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen unit, with the scale below placing it among a few everyday moving objects — the same scale the momentum calculator uses, since the units match.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The impulse formula rearranges to solve for force or time as well as impulse.',
        expression: 'J = F × Δt\nF = J ÷ Δt\nΔt = J ÷ F',
        terms: [
          { symbol: 'J', meaning: 'Impulse, in newton-seconds (N·s) — the same unit as momentum, kg·m/s.' },
          { symbol: 'F', meaning: 'The (assumed constant) force acting on the object, in newtons (N). Real forces often vary during contact; this is the average force.' },
          { symbol: 'Δt', meaning: 'The duration the force acts, in seconds (s).' },
          { symbol: 'J = Δp', meaning: "The impulse-momentum theorem: impulse equals the resulting change in the object's momentum." }
        ],
        note: 'Every input is converted to SI units (N, s) before solving and converted back afterward, so mixed units cannot produce a wrong result.'
      },
      workedExample: {
        intro: 'A constant 50 N force acts on an object for 0.6 seconds. How much impulse does it deliver, and what does that do to a 10 kg object starting at rest?',
        rows: [
          { label: 'Force (F)', value: '50 N' },
          { label: 'Time (Δt)', value: '0.6 s' },
          { label: 'Impulse (J = 50 × 0.6)', value: '30 N·s' },
          { label: 'Mass of the object', value: '10 kg' },
          { label: 'Velocity change (Δv = J ÷ m = 30 ÷ 10)', value: '3 m/s' }
        ],
        result: 'J = 30 N·s = 30 kg·m/s',
        explanation: '50 × 0.6 = 30, so the impulse is 30 N·s. By the impulse-momentum theorem, that 30 N·s equals the change in momentum it causes. Applied to a 10 kg object starting at rest, the momentum change of 30 kg·m/s means a velocity change of 30 ÷ 10 = 3 m/s — the object speeds up by 3 m/s.'
      },
      watchOut: [
        {
          title: 'Impulse and momentum are literally the same unit',
          body: 'N·s and kg·m/s are not just equal in this case — they are the same unit by definition, since 1 N = 1 kg·m/s². The impulse-momentum theorem, J = Δp, means a result in N·s can be compared directly to a momentum in kg·m/s with no conversion at all.'
        },
        {
          title: 'This assumes a constant force',
          body: 'J = F × Δt uses a single force value for the whole time interval. Real impacts — a bat hitting a ball, a crash test — involve a force that spikes and fades. In those cases, F here represents the average force over Δt, not the peak force.'
        },
        {
          title: 'The same impulse over more time means less peak force',
          body: "Airbags, catcher's mitts and crumple zones all work by stretching Δt out: delivering the same impulse (the same momentum change) over a longer time means a smaller average force, which is why those design choices reduce injury and damage for the same change in motion."
        },
        {
          title: 'Impulse is a vector, like force and momentum',
          body: 'A force and the impulse it delivers point in the same direction. If a second force acts in the opposite direction during the same interval, the net impulse is the difference, not the sum, of the two.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §9.2 Impulse and Collisions', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-2-impulse-and-collisions' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'force', label: 'Force (N)', type: 'number', placeholder: '50', defaultValue: 50, step: 0.1 },
      { id: 'time', label: 'Time (s)', type: 'number', placeholder: '0.6', defaultValue: 0.6, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Impulse Calculator (J = FΔt) – Force, Time, Impulse',
      description: 'Free impulse calculator. Solve J = F × Δt for impulse, force or time in N·s, with a worked example and the impulse-momentum theorem explained.',
      faq: [
        { question: 'What is the formula for impulse?', answer: 'Impulse equals force times the time it acts: J = F × Δt. With force in newtons and time in seconds, the result is in newton-seconds (N·s).' },
        { question: 'What is the impulse-momentum theorem?', answer: "It states that the impulse delivered to an object equals its change in momentum, J = Δp. It follows from Newton's second law, since force is the rate of change of momentum." },
        { question: 'Are impulse and momentum measured in the same unit?', answer: 'Yes — N·s and kg·m/s are the same unit, because a newton is defined as 1 kg·m/s². Impulse is conventionally reported in N·s and momentum in kg·m/s, but the numbers are directly comparable.' },
        { question: 'How much impulse does a 50 N force delivered for 0.6 s produce?', answer: '50 × 0.6 = 30 N·s.' },
        { question: 'Why do airbags and crumple zones reduce injury?', answer: 'They extend the time (Δt) over which a crash delivers its impulse. Since the impulse (the momentum change) is fixed by the crash itself, stretching out Δt lowers the average force F = J ÷ Δt needed to produce it.' },
        { question: 'How do I find the force from impulse and time?', answer: 'Divide impulse by time: F = J ÷ Δt. An impulse of 30 N·s delivered over 0.6 s corresponds to an average force of 50 N.' },
        { question: 'Does impulse assume the force is constant?', answer: 'The formula J = F × Δt uses a single force value. For a force that varies with time, F represents the average force over the interval, not any instantaneous peak.' }
      ]
    },
    compute(values) {
      return { impulse: values.force * values.time };
    }
  },
  {
    id: 'power-calculator',
    category: 'physics',
    glyph: 'P',
    updatedAt: '2026-11-06',
    aliases: ['p = w/t calculator', 'work over time calculator', 'mechanical power calculator', 'power from work and time calculator', 'power physics formula calculator'],
    related: ['power-converter', 'work-calculator', 'kinetic-energy-calculator', 'force-calculator'],
    title: 'Power Calculator (P = W/t)',
    description: 'Calculate power from work (or energy) and the time it takes — P = W ÷ t — or solve backward for work or time, in watts, kilowatts, or horsepower.',
    example: 'Doing 150,000 J of work in 12 seconds averages 12,500 W — 12.5 kW, or about 16.76 hp.',
    solver: {
      defaultTarget: 'power',
      variables: [
        { id: 'power', label: 'Power', symbol: 'P', dimension: 'power', defaultValue: 12.5, defaultUnit: 'kW' },
        { id: 'work', label: 'Work (energy)', symbol: 'W', dimension: 'energy', defaultValue: 150, defaultUnit: 'kJ' },
        { id: 'time', label: 'Time', symbol: 't', dimension: 'time', defaultValue: 12, defaultUnit: 's' }
      ],
      solve: {
        power: ({ work, time }) => (time === 0 ? NaN : work / time),
        work: ({ power, time }) => power * time,
        time: ({ work, power }) => (power === 0 ? NaN : work / power)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'power',
          min: 0,
          max: 8,
          ticks: ['1 W', '100 W', '10 kW', '1 MW', '100 MW'],
          benchmarks: [
            { label: 'Resting human metabolism', value: 100 },
            { label: 'A microwave oven', value: 1100 },
            { label: 'A car cruising on the highway', value: 60000 },
            { label: 'A small wind turbine', value: 2000000 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your power'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is power in physics?',
        paragraphs: [
          'Power is the rate at which work is done or energy is transferred: P = W ÷ t. Two people can do the exact same amount of work — lifting the same box to the same shelf — but the one who does it faster is more powerful, even though they transferred the same total energy.',
          'The SI unit of power is the watt (W), defined as one joule of work or energy transferred per second (1 W = 1 J/s). A 100 W light bulb converts 100 joules of electrical energy into light and heat every second it is lit.',
          'This calculator finds power the way it is defined in mechanics — from an amount of work (or energy) and the time it took. If you already have a power figure in one unit and just want it in another (watts to horsepower, kW to BTU/h), the power converter on this site handles that unit conversion directly; this page is for computing power from the work and time behind it.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of power, work and time; the third fills in automatically, so the same page answers "how powerful", "how much work" and "how long".',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 150 kJ becomes 41.67 Wh instead of silently turning into 150 Wh.' },
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen power unit, with the scale below placing it among a few everyday devices.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The power formula rearranges to solve for work or time as well as power.',
        expression: 'P = W ÷ t\nW = P × t\nt = W ÷ P',
        terms: [
          { symbol: 'P', meaning: 'Power, in watts (W). 1 W = 1 J/s.' },
          { symbol: 'W', meaning: 'Work done, or energy transferred, in joules (J).' },
          { symbol: 't', meaning: 'Time taken, in seconds (s).' }
        ],
        note: 'Every input is converted to SI units (W, J, s) before solving and converted back afterward, so entering work in kWh or power in horsepower is handled automatically.'
      },
      workedExample: {
        intro: 'A machine does 150,000 J of work in 12 seconds. What is its average power?',
        rows: [
          { label: 'Work (W)', value: '150,000 J' },
          { label: 'Time (t)', value: '12 s' },
          { label: 'Power (P = 150,000 ÷ 12)', value: '12,500 W' }
        ],
        result: 'P = 12,500 W = 12.5 kW ≈ 16.76 hp',
        explanation: '150,000 ÷ 12 = 12,500, so the average power is 12,500 W, which is 12.5 kW. Converting to mechanical horsepower (1 hp ≈ 745.7 W): 12,500 ÷ 745.7 ≈ 16.76 hp.'
      },
      watchOut: [
        {
          title: 'This page computes power, not converts it',
          body: 'If you already know a power value and want it in different units (kW to hp, W to BTU/h), use the power converter instead. This calculator is for finding power from the work and time that produced it.'
        },
        {
          title: 'This is average power, not instantaneous power',
          body: 'P = W ÷ t gives the average rate over the whole interval. A sprinter\'s power output is far higher during the initial burst off the blocks than during the rest of the race, even though the average over the whole sprint is one number.'
        },
        {
          title: "Energy and work use the same unit, the joule",
          body: 'This formula works whether "W" in your head means mechanical work or any other form of energy — electrical, thermal, chemical. Power is always energy transferred divided by the time it took, regardless of the kind of energy.'
        },
        {
          title: 'A watt is small; everyday devices use kilowatts',
          body: 'A single watt is a tiny amount of power — about what a USB phone charger idling uses. Household appliances are usually hundreds to thousands of watts, which is why kilowatts (1,000 W) are the more common everyday unit.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §7.4 Power', url: 'https://openstax.org/books/university-physics-volume-1/pages/7-4-power' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'work', label: 'Work (J)', type: 'number', placeholder: '150000', defaultValue: 150000, step: 1, min: 0 },
      { id: 'time', label: 'Time (s)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Power Calculator (P = W/t) – Work, Time, Power',
      description: 'Free power calculator. Solve P = W ÷ t for power, work or time in watts, kW or horsepower, with a worked example — not a unit-only converter.',
      faq: [
        { question: 'What is the formula for power?', answer: 'Power equals work (or energy) divided by time: P = W ÷ t. With work in joules and time in seconds, the result is in watts.' },
        { question: 'How much power is 150,000 J of work done in 12 seconds?', answer: '150,000 ÷ 12 = 12,500 W, which is 12.5 kW, or about 16.76 hp.' },
        { question: 'What is the difference between this calculator and the power converter?', answer: 'This page computes power from work and time (P = W ÷ t). The power converter just changes a power value you already have between units like W, kW and hp — it does not involve work or time at all.' },
        { question: 'How do I find the work done if I know power and time?', answer: 'Multiply power by time: W = P × t. A 2,000 W appliance running for 30 s does 2,000 × 30 = 60,000 J of work.' },
        { question: 'What is the SI unit of power?', answer: 'The watt (W), equal to one joule per second (1 W = 1 J/s). Kilowatts and horsepower are common alternatives.' },
        { question: 'Is power the same as energy?', answer: 'No. Energy (or work) is a total amount, measured in joules. Power is the rate that energy is used or transferred, measured in watts — energy divided by the time it took.' },
        { question: 'How do I convert watts to horsepower?', answer: 'Divide by about 745.7 (1 mechanical horsepower ≈ 745.7 W). A result of 12,500 W is about 12,500 ÷ 745.7 ≈ 16.76 hp.' }
      ]
    },
    compute(values) {
      return { power: values.work / values.time };
    }
  },
  {
    id: 'density-calculator',
    category: 'physics',
    glyph: 'ρ',
    updatedAt: '2026-11-06',
    aliases: ['density formula calculator', 'mass volume density calculator', 'rho = m/v calculator', 'specific density calculator', 'density of a substance calculator'],
    related: ['pressure-calculator', 'weight-converter', 'volume-converter', 'weight-calculator'],
    title: 'Density Calculator (ρ = m/V)',
    description: 'Calculate density from mass and volume — ρ = m ÷ V — or solve backward for mass or volume, in kg/m³, g/cm³, or lb/ft³.',
    example: 'A sample weighing 965 g with a volume of 50 cm³ has a density of 19.3 g/cm³ — a close match for pure gold.',
    solver: {
      defaultTarget: 'density',
      variables: [
        { id: 'density', label: 'Density', symbol: 'ρ', dimension: 'density', defaultValue: 19.3, defaultUnit: 'g/cm3' },
        { id: 'mass', label: 'Mass', symbol: 'm', dimension: 'mass', defaultValue: 965, defaultUnit: 'g' },
        { id: 'volume', label: 'Volume', symbol: 'V', dimension: 'volume', defaultValue: 50, defaultUnit: 'mL' }
      ],
      solve: {
        density: ({ mass, volume }) => (volume === 0 ? NaN : mass / volume),
        mass: ({ density, volume }) => density * volume,
        volume: ({ density, mass }) => (density === 0 ? NaN : mass / density)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'density',
          min: -2,
          max: 6,
          ticks: ['0.01 kg/m³', '1 kg/m³', '100 kg/m³', '10,000 kg/m³', '1,000,000 kg/m³'],
          benchmarks: [
            { label: 'Air at sea level', value: 1.225 },
            { label: 'Water', value: 1000 },
            { label: 'Aluminum', value: 2700 },
            { label: 'Gold', value: 19300 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your density'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is density?',
        paragraphs: [
          'Density measures how much mass is packed into a given amount of space: ρ = m ÷ V. It is why a shoebox of lead feels impossibly heavy while the same size box of feathers feels almost empty — both can occupy exactly the same volume, but lead has far more mass crammed into it.',
          'Density is an intensive property — it does not depend on how much of a substance you have. A teaspoon of water and a swimming pool of water have the same density, about 1,000 kg/m³ (1 g/cm³), even though their masses and volumes are wildly different. That is what makes density useful for identifying a material, regardless of the size of the sample.',
          "Density is also why things float or sink. An object placed in a fluid floats if its density is lower than the fluid's and sinks if its density is higher — a steel ship floats because its overall shape displaces enough water to support its weight, even though solid steel itself is far denser than water."
        ]
      },
      howTo: {
        intro: 'Fill in any two of density, mass and volume; the third fills in automatically, so the same page answers "how dense", "how much mass" and "how much space".',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 965 g becomes 0.965 kg instead of silently turning into 965 kg.' },
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen density unit, with the scale below placing it among a few common materials.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The density formula rearranges to solve for mass or volume as well as density.',
        expression: 'ρ = m ÷ V\nm = ρ × V\nV = m ÷ ρ',
        terms: [
          { symbol: 'ρ', meaning: 'Density (the Greek letter rho), in kilograms per cubic meter (kg/m³) or grams per cubic centimeter (g/cm³).' },
          { symbol: 'm', meaning: 'Mass of the sample, in kilograms (kg) or grams (g).' },
          { symbol: 'V', meaning: 'Volume the sample occupies, in cubic meters (m³), milliliters, or any volume unit.' }
        ],
        note: 'Every input is converted to SI units (kg, m³) before solving and converted back afterward, so entering mass in grams and volume in milliliters is handled automatically.'
      },
      workedExample: {
        intro: 'A sample has a mass of 965 g and a volume of 50 cm³ (50 mL). What is its density?',
        rows: [
          { label: 'Mass (m)', value: '965 g' },
          { label: 'Volume (V)', value: '50 cm³ (50 mL)' },
          { label: 'Density (ρ = 965 ÷ 50)', value: '19.3 g/cm³' }
        ],
        result: 'ρ = 19.3 g/cm³ = 19,300 kg/m³',
        explanation: '965 ÷ 50 = 19.3, so the density is 19.3 g/cm³, equal to 19,300 kg/m³ after converting grams to kilograms and cubic centimeters to cubic meters. That figure matches the accepted density of pure gold, about 19.3 g/cm³.'
      },
      watchOut: [
        {
          title: 'Density does not depend on how much you have',
          body: 'A small nugget and a large bar of the same pure metal have the same density, even though their masses and volumes are completely different. Density describes the material, not the sample size.'
        },
        {
          title: '1 g/cm³ and 1,000 kg/m³ are the same density',
          body: 'Grams per cubic centimeter and kilograms per cubic meter are both common ways to report density, related by an exact factor of 1,000 (because 1 cm³ = 1e-6 m³ and 1 g = 1e-3 kg). Water is "1 g/cm³" and "1,000 kg/m³" at the same time.'
        },
        {
          title: 'A material floats or sinks by comparing densities, not weights',
          body: 'Whether an object floats in a fluid depends on comparing its density to the density of the fluid, not on the object\'s absolute weight. A massive steel ship floats because its shape and air-filled hull give it a lower average density than water, not because the steel itself is light.'
        },
        {
          title: 'Temperature and pressure change density, especially for gases',
          body: "A material's volume - and so its density - can shift noticeably with temperature and, for gases, with pressure. The air density benchmark here (about 1.225 kg/m³) is specifically for sea level at 15°C; air at altitude or higher temperature is measurably less dense."
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §14.1 Fluids, Density, and Pressure', url: 'https://openstax.org/books/university-physics-volume-1/pages/14-1-fluids-density-and-pressure' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'Royal Society of Chemistry, Periodic Table (density data for the elements)', url: 'https://www.rsc.org/periodic-table' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass (kg)', type: 'number', placeholder: '0.965', defaultValue: 0.965, step: 0.001, min: 0 },
      { id: 'volume', label: 'Volume (m³)', type: 'number', placeholder: '0.00005', defaultValue: 0.00005, step: 0.00001, min: 0 }
    ],
    seo: {
      title: 'Density Calculator (ρ = m/V) – Mass, Volume, Density',
      description: 'Free density calculator. Solve ρ = m ÷ V for density, mass or volume in kg/m³, g/cm³ or lb/ft³, with a worked example.',
      faq: [
        { question: 'What is the formula for density?', answer: 'Density equals mass divided by volume: ρ = m ÷ V. With mass in grams and volume in cubic centimeters, the result is in g/cm³.' },
        { question: 'How do I find the density of a 965 g sample with a volume of 50 cm³?', answer: '965 ÷ 50 = 19.3 g/cm³, equal to 19,300 kg/m³.' },
        { question: 'Are g/cm³ and kg/m³ the same thing?', answer: 'They measure the same quantity but differ by an exact factor of 1,000: 1 g/cm³ = 1,000 kg/m³. Water is 1 g/cm³, or equivalently 1,000 kg/m³.' },
        { question: 'How do I find mass from density and volume?', answer: 'Multiply density by volume: m = ρ × V. A material with a density of 2.7 g/cm³ and a volume of 100 cm³ has a mass of 270 g.' },
        { question: 'Why do some objects float and others sink?', answer: 'An object floats in a fluid if its overall density is lower than the fluid\'s, and sinks if it is higher. This compares densities, not weights — a large, hollow object can have a lower average density than a small, solid one.' },
        { question: 'Does density change with temperature?', answer: 'Yes. Most materials expand slightly when heated, which lowers density, and gases are especially sensitive to both temperature and pressure. The density of a solid or liquid usually changes only slightly over normal temperature ranges.' },
        { question: 'What is a typical density value for water?', answer: 'About 1,000 kg/m³, or 1 g/cm³, used as a standard reference value. The exact density of water varies slightly with temperature, peaking near 4°C.' }
      ]
    },
    compute(values) {
      return { density: values.mass / values.volume };
    }
  },
  {
    id: 'pressure-calculator',
    category: 'physics',
    glyph: 'F/A',
    updatedAt: '2026-11-06',
    aliases: ['p = f/a calculator', 'force per area calculator', 'pressure formula calculator', 'pressure from force and area calculator', 'mechanical pressure calculator'],
    related: ['pressure-converter', 'force-calculator', 'density-calculator', 'weight-calculator'],
    title: 'Pressure Calculator (P = F/A)',
    description: 'Calculate pressure from force and the area it acts over — P = F ÷ A — or solve backward for force or area, in Pa, kPa, psi, or atm.',
    example: "One tire supporting a quarter of a 1,500 kg car's weight over a 0.02 m² contact patch bears about 183,875 Pa — roughly 26.67 psi.",
    solver: {
      defaultTarget: 'pressure',
      variables: [
        { id: 'pressure', label: 'Pressure', symbol: 'P', dimension: 'pressure', defaultValue: 183874.6875, defaultUnit: 'Pa' },
        { id: 'force', label: 'Force', symbol: 'F', dimension: 'force', defaultValue: 3677.49375, defaultUnit: 'N' },
        { id: 'area', label: 'Area', symbol: 'A', dimension: 'area', defaultValue: 0.02, defaultUnit: 'm2' }
      ],
      solve: {
        pressure: ({ force, area }) => (area === 0 ? NaN : force / area),
        force: ({ pressure, area }) => pressure * area,
        area: ({ pressure, force }) => (pressure === 0 ? NaN : force / pressure)
      },
      visuals: [
        {
          type: 'logScale',
          value: 'pressure',
          min: 4,
          max: 9,
          ticks: ['10 kPa', '100 kPa', '1 MPa', '10 MPa', '100 MPa', '1 GPa'],
          benchmarks: [
            { label: 'Average blood pressure (100 mmHg)', value: 13332 },
            { label: 'Standard atmosphere', value: 101325 },
            { label: 'A car tire, inflated (32 psi)', value: 220632 },
            { label: 'The bottom of the Mariana Trench', value: 108600000 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your pressure'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is pressure?',
        paragraphs: [
          'Pressure is force spread over an area: P = F ÷ A. The same force can feel completely different depending on how concentrated it is — stepping on a wide board distributes your weight harmlessly, but stepping on a narrow nail concentrates that same weight onto a tiny area, producing enough pressure to puncture skin.',
          'The SI unit of pressure is the pascal (Pa), defined as one newton of force spread over one square meter (1 Pa = 1 N/m²). Because a pascal is a small amount of pressure, everyday pressures — tire inflation, atmospheric pressure, blood pressure — are usually reported in kilopascals, pounds per square inch (psi), or atmospheres instead.',
          "For a given force, shrinking the area increases pressure and enlarging the area decreases it. That is the whole idea behind snowshoes (spreading weight over more area to avoid sinking), knife blades (concentrating force onto a thin edge to cut), and this calculator's tire example (the same car weight spread over a wider contact patch means lower pressure on the road)."
        ]
      },
      howTo: {
        intro: 'Fill in any two of pressure, force and area; the third fills in automatically, so the same page answers "how much pressure", "how much force" and "how large an area".',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 0.02 m² becomes 200 cm² instead of silently turning into 0.02 cm².' },
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen pressure unit, with the scale below placing it among a few everyday pressures.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The pressure formula rearranges to solve for force or area as well as pressure.',
        expression: 'P = F ÷ A\nF = P × A\nA = F ÷ P',
        terms: [
          { symbol: 'P', meaning: 'Pressure, in pascals (Pa). 1 Pa = 1 N/m².' },
          { symbol: 'F', meaning: 'Force acting perpendicular to the surface, in newtons (N).' },
          { symbol: 'A', meaning: 'The area the force is spread over, in square meters (m²) or any area unit.' }
        ],
        note: 'Every input is converted to SI units (Pa, N, m²) before solving and converted back afterward, so entering pressure in psi or area in square inches is handled automatically. For converting an existing pressure value between units with no force or area involved, use the pressure converter instead.'
      },
      workedExample: {
        intro: "A 1,500 kg car's weight rests on four tires. Each tire's contact patch with the road is about 0.02 m² (200 cm²). What pressure does each tire exert on the road?",
        rows: [
          { label: "Car's total weight (1,500 kg × 9.80665 m/s²)", value: '14,709.975 N' },
          { label: 'Force per tire (weight ÷ 4)', value: '3,677.49375 N' },
          { label: 'Contact area per tire (A)', value: '0.02 m²' },
          { label: 'Pressure (P = 3,677.49375 ÷ 0.02)', value: '183,874.6875 Pa' }
        ],
        result: 'P ≈ 183,874.69 Pa = 183.87 kPa ≈ 26.67 psi',
        explanation: "Dividing the car's weight evenly across four tires gives 3,677.49375 N per tire. Dividing that by the 0.02 m² contact patch gives 183,874.6875 Pa, about 183.87 kPa or 26.67 psi. Real tire placards typically call for somewhat higher pressure (around 30-35 psi) because real contact patches, weight distribution front-to-back, and tread design all vary from this simplified, evenly split estimate."
      },
      watchOut: [
        {
          title: 'Force must act perpendicular to the area',
          body: 'P = F ÷ A assumes the force pushes straight into the surface. A force applied at an angle only has its perpendicular component contributing to pressure on that surface — the same idea behind the cos θ term in the work formula.'
        },
        {
          title: 'Smaller area means higher pressure, for the same force',
          body: "Pressure and area are inversely related when force is fixed. A hand pressing on a bed of nails spread over a wide area feels fine; the same hand pressing on a single nail concentrates all that force onto a tiny area, producing far higher pressure at that one point."
        },
        {
          title: "This calculator finds pressure from force and area, not a unit conversion",
          body: 'If you already have a pressure value and just want it in a different unit (Pa to psi, atm to bar), use the pressure converter. This page is for computing pressure from the force and area that produce it.'
        },
        {
          title: 'Standard atmospheric pressure is a fixed reference value',
          body: 'One standard atmosphere is defined as exactly 101,325 Pa. Real atmospheric pressure varies with altitude and weather, but "1 atm" always refers to this fixed reference value, used for unit conversions and standard conditions.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §14.1 Fluids, Density, and Pressure', url: 'https://openstax.org/books/university-physics-volume-1/pages/14-1-fluids-density-and-pressure' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'force', label: 'Force (N)', type: 'number', placeholder: '3677.49', defaultValue: 3677.49375, step: 0.01, min: 0 },
      { id: 'area', label: 'Area (m²)', type: 'number', placeholder: '0.02', defaultValue: 0.02, step: 0.001, min: 0 }
    ],
    seo: {
      title: 'Pressure Calculator (P = F/A) – Force, Area, Pressure',
      description: 'Free pressure calculator. Solve P = F ÷ A for pressure, force or area in Pa, kPa, psi or atm, with a worked tire-pressure example.',
      faq: [
        { question: 'What is the formula for pressure?', answer: 'Pressure equals force divided by area: P = F ÷ A. With force in newtons and area in square meters, the result is in pascals.' },
        { question: 'How much pressure does 3,677.49 N spread over 0.02 m² produce?', answer: '3,677.49 ÷ 0.02 ≈ 183,875 Pa, about 183.87 kPa or 26.67 psi.' },
        { question: 'How do I find force from pressure and area?', answer: 'Multiply pressure by area: F = P × A. A pressure of 100,000 Pa over 0.5 m² corresponds to a force of 50,000 N.' },
        { question: 'What is the difference between this calculator and the pressure converter?', answer: 'This page computes pressure from a force and an area (P = F ÷ A). The pressure converter just changes a pressure value you already have between units like Pa, psi and atm — no force or area involved.' },
        { question: 'Why does a smaller area increase pressure for the same force?', answer: 'Because P = F ÷ A, dividing by a smaller number gives a larger result. The same force concentrated onto a smaller area produces higher pressure, which is why a sharp point punctures more easily than a flat surface under the same push.' },
        { question: 'What is standard atmospheric pressure?', answer: 'Exactly 101,325 Pa (1 atm) by definition — about 14.7 psi. Real atmospheric pressure fluctuates with altitude and weather, but 1 atm is the fixed reference value used in unit conversions.' },
        { question: 'What are the SI units of pressure?', answer: 'The pascal (Pa), equal to one newton per square meter (1 Pa = 1 N/m²). Kilopascals, psi, bar and atmospheres are common alternatives.' }
      ]
    },
    compute(values) {
      return { pressure: values.force / values.area };
    }
  }
];
