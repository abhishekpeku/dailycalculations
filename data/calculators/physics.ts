import type { CalculatorConfig } from './types.ts';
import { DIGIT_COLORS, MULTIPLIER_COLORS, TOLERANCE_COLORS, resistanceFromColorBands } from '../../lib/resistorColors.ts';

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
  },
  {
    id: 'ohms-law-calculator',
    category: 'physics',
    glyph: 'V=IR',
    updatedAt: '2026-11-06',
    aliases: ["ohm's law calculator", 'v = ir calculator', 'voltage current resistance calculator', 'ohms law solver', 'current from voltage and resistance calculator', 'resistance from voltage and current calculator'],
    related: ['electrical-power-calculator', 'resistor-color-code-calculator', 'series-parallel-resistor-calculator', 'electricity-bill-calculator'],
    title: "Ohm's Law Calculator (V = IR)",
    description: "Solve Ohm's law, V = I × R, for voltage, current, or resistance — enter any two and the third fills in, with the power it dissipates shown alongside.",
    example: 'A circuit with 3 A flowing through a 4 Ω resistor has 12 V across it, and dissipates 36 W.',
    solver: {
      defaultTarget: 'voltage',
      variables: [
        { id: 'voltage', label: 'Voltage', symbol: 'V', dimension: 'voltage', defaultValue: 12, defaultUnit: 'V' },
        { id: 'current', label: 'Current', symbol: 'I', dimension: 'current', defaultValue: 3, defaultUnit: 'A' },
        { id: 'resistance', label: 'Resistance', symbol: 'R', dimension: 'resistance', defaultValue: 4, defaultUnit: 'ohm' }
      ],
      solve: {
        voltage: ({ current, resistance }) => current * resistance,
        current: ({ voltage, resistance }) => (resistance === 0 ? NaN : voltage / resistance),
        resistance: ({ voltage, current }) => (current === 0 ? NaN : voltage / current)
      },
      outputs: [{ id: 'power', label: 'Power dissipated', dimension: 'power', unit: 'W', compute: (si) => si.voltage * si.current }],
      visuals: [
        {
          type: 'logScale',
          value: 'resistance',
          min: 0,
          max: 8,
          ticks: ['1 Ω', '100 Ω', '10 kΩ', '1 MΩ', '100 MΩ'],
          benchmarks: [
            { label: 'A standard LED current-limiting resistor', value: 220 },
            { label: 'Wet human skin (OSHA electrical-safety training figure)', value: 1000 },
            { label: 'Dry human skin (OSHA electrical-safety training figure)', value: 100000 },
            { label: "A digital multimeter's voltage-input impedance", value: 1e7 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your resistance'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: "What is Ohm's law?",
        paragraphs: [
          "Ohm's law links the three basic quantities of a simple electrical circuit: voltage, current, and resistance. German physicist Georg Ohm published the relationship in 1827 after measuring how current through a wire changed with the voltage driving it. For a resistor, the law is strikingly simple: V = I × R. Double the voltage across a resistor and the current through it doubles too, as long as the resistance stays the same.",
          'A common way to picture it: voltage is like water pressure pushing a flow, current is the flow itself, and resistance is how narrow the pipe is. More pressure (voltage) pushes more flow (current) through the same pipe; a narrower pipe (more resistance) needs more pressure to push the same flow through it. The analogy is not exact physics, but it is the reason textbooks keep reaching for it.',
          "Ohm's law is specifically a statement about resistors and other \"ohmic\" devices, where resistance stays constant regardless of the voltage or current applied. Plenty of real components are not ohmic — a light-emitting diode, an incandescent filament that heats up as current flows, and a transistor all have a resistance that changes with the conditions, so V = I × R only approximates their behavior, if that."
        ]
      },
      howTo: {
        intro: "Fill in any two of voltage, current and resistance; the third fills in automatically, so the same page answers \"what's the voltage\", \"how much current\" and \"what resistance\".",
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit from the menu beside it. The third field, marked auto, calculates as you type. Volts, milliamps and kilohms can all be mixed freely.' },
          { name: 'Switch which one is calculated', text: 'To solve for a different quantity, type into the auto field. It becomes an input, and whichever field you have left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 3 A becomes 3,000 mA instead of silently turning into 3 mA.' },
          { name: 'Read the result and the power', text: 'The answer appears in your chosen unit. Underneath it, the power the resistor dissipates (P = V × I) is shown as a bonus figure — no separate calculation needed.' },
          { name: 'Share or copy', text: 'Share result copies a link that reopens the calculator with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: "Ohm's law rearranges three ways, one for each quantity you might be solving for.",
        expression: 'V = I × R\nI = V ÷ R\nR = V ÷ I',
        terms: [
          { symbol: 'V', meaning: 'Voltage across the resistor, in volts (V). One volt drives one amp of current through one ohm of resistance.' },
          { symbol: 'I', meaning: 'Current flowing through it, in amperes (A).' },
          { symbol: 'R', meaning: 'Resistance, in ohms (Ω). One ohm is defined as one volt per amp (1 Ω = 1 V/A).' },
          { symbol: 'P = V × I', meaning: "The power the resistor dissipates as heat, in watts — shown as a bonus output since it follows directly from the same two solved values." }
        ],
        note: 'Every input is converted to SI units (V, A, Ω) before solving and converted back afterward, so entering current in milliamps or resistance in kilohms is handled automatically.'
      },
      workedExample: {
        intro: 'A resistor in a circuit carries a current of 3 A and has a resistance of 4 Ω. What voltage is across it, and how much power does it dissipate?',
        rows: [
          { label: 'Current (I)', value: '3 A' },
          { label: 'Resistance (R)', value: '4 Ω' },
          { label: 'Voltage (V = 3 × 4)', value: '12 V' },
          { label: 'Power (P = V × I = 12 × 3)', value: '36 W' }
        ],
        result: 'V = 12 V · P = 36 W',
        explanation: '3 × 4 = 12, so 12 V is across the resistor. Multiplying that voltage by the 3 A flowing through it gives 36 W — the rate the resistor converts electrical energy into heat. Had the question instead given 12 V and 4 Ω, the same law finds the current: I = 12 ÷ 4 = 3 A.'
      },
      watchOut: [
        {
          title: "Ohm's law only holds for ohmic components",
          body: 'Plain resistors keep a constant resistance across a wide range of voltages and currents, which is what makes V = I × R reliable for them. LEDs, diodes, incandescent filaments and transistors are "non-ohmic" — their resistance shifts with current, temperature or voltage, so this formula only roughly describes them, if at all.'
        },
        {
          title: 'A real battery is not a perfect voltage source',
          body: "The V in this formula is the voltage actually across the resistor, not necessarily a battery's labeled voltage. A real battery has its own small internal resistance, so under load some of its voltage is dropped internally and never reaches the external circuit."
        },
        {
          title: 'Power rises with the square of current or voltage',
          body: 'Combining V = I × R with P = V × I gives two more forms: P = I²R and P = V² ÷ R. Doubling the current through a fixed resistance quadruples the power it dissipates, not just doubles it — a big part of why thin wires overheat under high current.'
        },
        {
          title: 'Resistance cannot be negative, and current needs a resistance to flow against',
          body: 'If a resistance of 0 Ω is entered while solving for current, there is no finite answer — a 0 Ω path is a short circuit, where current is limited only by whatever (small) resistance is actually in the wire, not by this formula.'
        }
      ],
      references: [
        { label: "OpenStax, University Physics Volume 2, §9.4 Ohm's Law", url: 'https://openstax.org/books/university-physics-volume-2/pages/9-4-ohms-law' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'current', label: 'Current (A)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.01, min: 0 },
      { id: 'resistance', label: 'Resistance (Ω)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.01, min: 0 }
    ],
    seo: {
      title: "Ohm's Law Calculator (V = IR) – Voltage, Current, Resistance",
      description: "Free Ohm's law calculator. Solve V = I × R for voltage, current or resistance in V, mV, A, mA, Ω or kΩ, with power shown as a bonus and a worked example.",
      faq: [
        { question: "What is Ohm's law?", answer: "Ohm's law states that the voltage across a resistor equals the current through it times its resistance: V = I × R. It only applies reliably to resistors and other \"ohmic\" components, whose resistance stays constant." },
        { question: 'How do I calculate voltage from current and resistance?', answer: 'Multiply them: V = I × R. A current of 3 A through a 4 Ω resistor produces 3 × 4 = 12 V across it.' },
        { question: 'How do I calculate current from voltage and resistance?', answer: 'Divide voltage by resistance: I = V ÷ R. A 12 V source across a 4 Ω resistor drives 12 ÷ 4 = 3 A.' },
        { question: 'How do I calculate resistance from voltage and current?', answer: 'Divide voltage by current: R = V ÷ I. 12 V producing a 3 A current implies a resistance of 12 ÷ 3 = 4 Ω.' },
        { question: "Does Ohm's law apply to LEDs and diodes?", answer: 'Not reliably. Ohm\'s law describes "ohmic" components like resistors, whose resistance is constant. LEDs, diodes and incandescent filaments are non-ohmic — their effective resistance changes with voltage, current or temperature.' },
        { question: 'How is power related to voltage, current and resistance?', answer: 'Power is P = V × I, which combines with Ohm\'s law to give two more forms: P = I²R and P = V² ÷ R. This calculator shows P = V × I as a bonus result alongside whichever quantity you solve for.' },
        { question: 'What is the SI unit of resistance?', answer: 'The ohm (Ω), defined as one volt per ampere (1 Ω = 1 V/A). Milliohms, kilohms and megohms are common alternatives for small and large resistances.' }
      ]
    },
    compute(values) {
      return { voltage: values.current * values.resistance };
    }
  },
  {
    id: 'electrical-power-calculator',
    category: 'physics',
    glyph: 'P=VI',
    updatedAt: '2026-11-06',
    aliases: ['electrical power calculator', 'p = vi calculator', 'power from voltage and current calculator', 'watts from volts and amps calculator', 'electric power formula calculator', 'watts volts amps calculator'],
    related: ['ohms-law-calculator', 'power-calculator', 'electricity-bill-calculator', 'power-converter'],
    title: 'Electrical Power Calculator (P = VI)',
    description: 'Calculate electrical power from voltage and current — P = V × I — or solve backward for voltage or current, with the equivalent resistance shown via Ohm\'s law.',
    example: 'A 120 V appliance drawing 5 A uses 600 W, with an effective resistance of 24 Ω.',
    solver: {
      defaultTarget: 'power',
      variables: [
        { id: 'power', label: 'Power', symbol: 'P', dimension: 'power', defaultValue: 600, defaultUnit: 'W' },
        { id: 'voltage', label: 'Voltage', symbol: 'V', dimension: 'voltage', defaultValue: 120, defaultUnit: 'V' },
        { id: 'current', label: 'Current', symbol: 'I', dimension: 'current', defaultValue: 5, defaultUnit: 'A' }
      ],
      solve: {
        power: ({ voltage, current }) => voltage * current,
        voltage: ({ power, current }) => (current === 0 ? NaN : power / current),
        current: ({ power, voltage }) => (voltage === 0 ? NaN : power / voltage)
      },
      outputs: [{ id: 'resistance', label: 'Equivalent resistance', dimension: 'resistance', unit: 'ohm', compute: (si) => (si.current === 0 ? NaN : si.voltage / si.current) }],
      visuals: [
        {
          type: 'logScale',
          value: 'power',
          min: 0,
          max: 4,
          ticks: ['1 W', '10 W', '100 W', '1 kW', '10 kW'],
          benchmarks: [
            { label: 'A 60-watt-equivalent LED light bulb', value: 9 },
            { label: 'A laptop charger', value: 65 },
            { label: 'A microwave oven', value: 1100 },
            { label: 'A home Level 2 EV charger (240 V × 30 A)', value: 7200 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your power'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is electrical power?',
        paragraphs: [
          'Electrical power measures how fast a device converts electrical energy into another form — heat in a toaster, light in a bulb, motion in a motor. The formula is P = V × I: power equals the voltage across a device times the current flowing through it. A device pulling more current at the same voltage, or needing more voltage at the same current, uses power faster.',
          "This is the same watt used everywhere else in physics (1 W = 1 J/s), because it is the same underlying idea of energy per time — electrical power just expresses it in terms of the voltage and current that are easy to measure in a circuit. A 600 W appliance converts 600 joules of electrical energy into another form every second it runs.",
          "Because electrical devices are built around a resistance, P = V × I combines with Ohm's law (V = I × R) to give two more useful forms: P = I²R and P = V² ÷ R. This calculator's bonus output uses the Ohm's law relationship directly — once voltage and current are known, V ÷ I gives the device's effective resistance, no separate calculation needed."
        ]
      },
      howTo: {
        intro: 'Fill in any two of power, voltage and current; the third fills in automatically, so the same page answers "how many watts", "what voltage" and "how much current".',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 600 W becomes 0.6 kW instead of silently turning into 600 kW.' },
          { name: 'Read the result and the resistance', text: 'The answer shows in your chosen power unit. Underneath it, the equivalent resistance (R = V ÷ I, from Ohm\'s law) appears as a bonus figure.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The power formula rearranges to solve for voltage or current as well as power.',
        expression: 'P = V × I\nV = P ÷ I\nI = P ÷ V',
        terms: [
          { symbol: 'P', meaning: 'Electrical power, in watts (W). 1 W = 1 J/s = 1 V·A.' },
          { symbol: 'V', meaning: 'Voltage across the device, in volts (V).' },
          { symbol: 'I', meaning: 'Current flowing through it, in amperes (A).' },
          { symbol: 'R = V ÷ I', meaning: "The device's effective resistance, from Ohm's law — shown as a bonus output, since V and I are already known once power is solved." }
        ],
        note: 'Every input is converted to SI units (W, V, A) before solving and converted back afterward, so entering current in milliamps or power in kilowatts is handled automatically.'
      },
      workedExample: {
        intro: 'An appliance is rated at 120 V and draws 5 A. How much power does it use, and what is its effective resistance?',
        rows: [
          { label: 'Voltage (V)', value: '120 V' },
          { label: 'Current (I)', value: '5 A' },
          { label: 'Power (P = 120 × 5)', value: '600 W' },
          { label: 'Equivalent resistance (R = 120 ÷ 5)', value: '24 Ω' }
        ],
        result: 'P = 600 W · R = 24 Ω',
        explanation: '120 × 5 = 600, so the appliance uses 600 W. Dividing the same voltage by the same current the other way, 120 ÷ 5 = 24, gives the effective resistance of 24 Ω by Ohm\'s law — this is the resistance a plain resistor would need to draw the same current at the same voltage.'
      },
      watchOut: [
        {
          title: 'This page computes power, not converts it',
          body: 'If you already know a power value and want it in different units (W to kW, W to BTU/h), use the power converter instead. This calculator is for finding electrical power from the voltage and current that produce it.'
        },
        {
          title: 'Household current ratings are often a maximum, not a constant draw',
          body: 'A circuit breaker rated for 30 A limits the current it allows, but a device plugged into it may draw far less under normal use. Use the device\'s actual measured or rated current, not the circuit\'s maximum rating, for a true power figure.'
        },
        {
          title: '"Equivalent resistance" is not always a real, fixed resistor',
          body: 'For a plain resistor, V ÷ I is literally its resistance. For a motor, a compressor or any device with moving parts, V ÷ I just gives the same ratio at that instant — it does not describe a physical, constant-value resistor the way Ohm\'s law assumes.'
        },
        {
          title: 'Doubling voltage can more than double power, if current also rises',
          body: 'For a fixed resistance, power scales with the square of voltage (P = V² ÷ R), so doubling voltage alone would quadruple power. This calculator takes voltage and current as independent inputs, so the result always reflects whatever two values you actually enter.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 2, §9.5 Electrical Energy and Power', url: 'https://openstax.org/books/university-physics-volume-2/pages/9-5-electrical-energy-and-power' },
        { label: "OpenStax, University Physics Volume 2, §9.4 Ohm's Law", url: 'https://openstax.org/books/university-physics-volume-2/pages/9-4-ohms-law' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'voltage', label: 'Voltage (V)', type: 'number', placeholder: '120', defaultValue: 120, step: 0.1, min: 0 },
      { id: 'current', label: 'Current (A)', type: 'number', placeholder: '5', defaultValue: 5, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Electrical Power Calculator (P = VI) – Watts, Volts, Amps',
      description: 'Free electrical power calculator. Solve P = V × I for power, voltage or current in W, kW, V or A, with equivalent resistance shown and a worked example.',
      faq: [
        { question: 'What is the formula for electrical power?', answer: 'Power equals voltage times current: P = V × I. With voltage in volts and current in amps, the result is in watts.' },
        { question: 'How many watts does a 120 V appliance drawing 5 A use?', answer: '120 × 5 = 600 W.' },
        { question: 'How do I find current from power and voltage?', answer: 'Divide power by voltage: I = P ÷ V. A 1,200 W appliance on a 120 V circuit draws 1,200 ÷ 120 = 10 A.' },
        { question: 'How do I find voltage from power and current?', answer: 'Divide power by current: V = P ÷ I. A 600 W device drawing 5 A is running on 600 ÷ 5 = 120 V.' },
        { question: 'How is electrical power related to resistance?', answer: 'Through Ohm\'s law: once voltage and current are known, the equivalent resistance is R = V ÷ I. Combining that with P = V × I also gives P = I²R and P = V² ÷ R.' },
        { question: 'What is the difference between this calculator and the power converter?', answer: 'This page computes power from voltage and current (P = V × I). The power converter just changes a power value you already have between units like W, kW and hp — it does not involve voltage or current at all.' },
        { question: 'What is the SI unit of electrical power?', answer: 'The watt (W), the same unit used for mechanical power — 1 W = 1 J/s, and also equal to 1 volt-ampere (1 V·A) for electrical power specifically.' }
      ]
    },
    compute(values) {
      return { power: values.voltage * values.current };
    }
  },
  {
    id: 'series-parallel-resistor-calculator',
    category: 'physics',
    glyph: 'ΣR',
    updatedAt: '2026-11-06',
    aliases: ['resistors in series calculator', 'resistors in parallel calculator', 'equivalent resistance calculator', 'total resistance calculator', 'series parallel resistance calculator', 'combined resistance calculator'],
    related: ['ohms-law-calculator', 'resistor-color-code-calculator', 'electrical-power-calculator', 'capacitor-charge-calculator'],
    title: 'Series and Parallel Resistor Calculator',
    description: 'Find the total resistance of a list of resistors wired in series (they simply add) and in parallel (they combine by reciprocals) — both totals, side by side.',
    example: '100 Ω, 220 Ω and 330 Ω in series total 650 Ω; the same three resistors in parallel total only about 56.90 Ω.',
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'How do resistors combine in series and in parallel?',
        paragraphs: [
          'Resistors in series sit one after another along a single path, so the same current has to pass through every one of them in turn. Each resistor adds its own resistance to the total, the same way adding more cars to a one-lane traffic queue adds to the total delay: R_total = R₁ + R₂ + ... + Rₙ. A series total is always larger than its largest individual resistor.',
          'Resistors in parallel instead sit side by side, each forming its own path between the same two points, so they all share the same voltage while the current splits across the paths. Adding another parallel path always gives current another way through, which can only lower the overall resistance — so a parallel combination is always smaller than its smallest individual resistor. The formula adds reciprocals instead of the resistances themselves: 1 ÷ R_total = 1 ÷ R₁ + 1 ÷ R₂ + ... + 1 ÷ Rₙ.',
          'Both wiring patterns show up constantly in real circuits: old-style string lights wired in series dim as a group if one bulb fails (and used to go dark entirely); household outlets and most modern fixtures are wired in parallel so one failing device does not cut power to the rest. Combining standard resistor values in series or parallel is also a common way to build a resistance that is not sold off the shelf.'
        ]
      },
      howTo: {
        intro: 'Paste or type each resistor value in ohms; the calculator adds them as a series combination and combines them as a parallel one, side by side.',
        steps: [
          { name: 'Enter your resistor values', text: 'Paste or type each resistor\'s value in ohms, separated by commas, spaces or new lines — at least two values.' },
          { name: 'Check the count', text: 'The box shows a live count of how many values it understood, so a stray label or unit does not silently throw off the total.' },
          { name: 'Read the series total', text: 'The headline is the series total — what the resistance would be if every resistor sat one after another along a single path.' },
          { name: 'Read the parallel total', text: 'The row below shows the same resistors combined side by side instead — always a smaller number than any one resistor in the list.' },
          { name: 'Compare on the chart', text: 'The series and parallel totals are plotted side by side, so the size of the difference is easy to see at a glance.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Series resistances add directly; parallel resistances add as reciprocals.',
        expression: 'Series: R_total = R₁ + R₂ + ... + Rₙ\nParallel: 1 ÷ R_total = 1 ÷ R₁ + 1 ÷ R₂ + ... + 1 ÷ Rₙ',
        terms: [
          { symbol: 'R₁, R₂, ..., Rₙ', meaning: 'Each resistor\'s value, in ohms (Ω).' },
          { symbol: 'Series R_total', meaning: 'Always larger than the single largest resistor — each resistance simply adds onto the others along the one path the current takes.' },
          { symbol: 'Parallel R_total', meaning: 'Always smaller than the single smallest resistor — an extra path for current to flow through can only lower the overall resistance, never raise it.' }
        ],
        note: 'With exactly two resistors, the parallel formula simplifies to R_total = (R₁ × R₂) ÷ (R₁ + R₂) — the same answer the reciprocal formula gives, without inverting three or more separate fractions by hand.'
      },
      workedExample: {
        intro: 'Three resistors — 100 Ω, 220 Ω and 330 Ω — are combined first in series, then in parallel. What is the total resistance each way?',
        rows: [
          { label: 'Series total (100 + 220 + 330)', value: '650 Ω' },
          { label: 'Sum of reciprocals (1/100 + 1/220 + 1/330)', value: '0.017576 Ω⁻¹' },
          { label: 'Parallel total (1 ÷ 0.017576)', value: '56.90 Ω' }
        ],
        result: 'Series = 650 Ω · Parallel ≈ 56.90 Ω',
        explanation: 'In series, the three values simply add to 650 Ω. In parallel, each resistor gives current an extra path, so the combined resistance — about 56.90 Ω — ends up lower than even the smallest individual resistor, 100 Ω, which is a hallmark of any parallel combination.'
      },
      watchOut: [
        {
          title: 'Parallel resistance is always less than the smallest resistor',
          body: 'Adding a parallel path can only make it easier for current to flow, never harder, so the combined resistance drops below every individual value in the list — including the smallest one. If a parallel total comes out higher than one of the resistors you entered, double-check the values.'
        },
        {
          title: 'Series resistance is always more than the largest resistor',
          body: 'Since every resistor in series shares the same single current path, each one simply adds its own resistance on top of the rest. The combined total is always bigger than the single largest value in the list.'
        },
        {
          title: 'A 0 Ω resistor in a parallel combination shorts the whole group to 0 Ω',
          body: 'Current always takes the path of least resistance. A single 0 Ω branch (a short circuit) in parallel with anything else carries effectively all the current, so the overall combination drops to 0 Ω regardless of the other values.'
        },
        {
          title: 'This handles one list treated as all-series or all-parallel, not a mixed network',
          body: 'Many real circuits combine series and parallel sections together in the same network (some resistors in parallel, that group then in series with another resistor, and so on). This calculator computes both pure cases for the same list of values; a mixed network needs to be worked out stage by stage.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 2, §10.2 Resistors in Series and Parallel', url: 'https://openstax.org/books/university-physics-volume-2/pages/10-2-resistors-in-series-and-parallel' },
        { label: "OpenStax, University Physics Volume 2, §9.4 Ohm's Law", url: 'https://openstax.org/books/university-physics-volume-2/pages/9-4-ohms-law' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      {
        id: 'resistors',
        label: 'Resistor values (Ω)',
        type: 'list',
        placeholder: 'Paste or type resistor values in ohms — commas, spaces or new lines between them.',
        defaultValue: 0,
        listDefault: [100, 220, 330],
        listMin: 2
      }
    ],
    breakdown: {
      headline: 'seriesTotal',
      headlineLabel: 'Total resistance in series (Ω)',
      outputs: [
        { id: 'seriesTotal', label: 'Total resistance in series (Ω)', format: 'number' },
        { id: 'parallelTotal', label: 'Total resistance in parallel (Ω)', format: 'number' },
        { id: 'count', label: 'Resistors entered', format: 'integer' },
        { id: 'smallestResistor', label: 'Smallest resistor in the list (Ω)', format: 'number' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'seriesTotal', label: 'Series' }, { from: 'parallelTotal', label: 'Parallel' }],
        title: 'Series vs. parallel total',
        highlight: 1
      }
    },
    seo: {
      title: 'Series & Parallel Resistor Calculator – Total Resistance',
      description: 'Free resistor calculator. Find the total resistance of a list of resistors in series (they add) and in parallel (reciprocals add), side by side.',
      faq: [
        { question: 'How do you calculate total resistance in series?', answer: 'Add every resistor value together: R_total = R₁ + R₂ + ... + Rₙ. Three resistors of 100 Ω, 220 Ω and 330 Ω in series total 100 + 220 + 330 = 650 Ω.' },
        { question: 'How do you calculate total resistance in parallel?', answer: 'Add the reciprocals of every resistor, then take the reciprocal of that sum: 1 ÷ R_total = 1 ÷ R₁ + 1 ÷ R₂ + ... + 1 ÷ Rₙ. For 100 Ω, 220 Ω and 330 Ω, that works out to about 56.90 Ω.' },
        { question: 'Why is parallel resistance always lower than any individual resistor?', answer: 'Each parallel resistor gives current an additional path, and more paths can only make it easier for current to flow overall — never harder. So the combined resistance always ends up below the smallest resistor in the group.' },
        { question: 'Is there a shortcut for two resistors in parallel?', answer: 'Yes: R_total = (R₁ × R₂) ÷ (R₁ + R₂). For 100 Ω and 220 Ω, that is (100 × 220) ÷ (100 + 220) = 68.75 Ω, the same answer the full reciprocal formula gives.' },
        { question: 'What happens if one resistor in a parallel group is 0 Ω?', answer: 'The whole combination drops to 0 Ω. A 0 Ω branch is a short circuit, and current always takes the path of least resistance, so it effectively bypasses every other resistor in the group.' },
        { question: 'Can I mix series and parallel in the same circuit?', answer: 'Yes, and many real circuits do — some resistors in parallel, with that group then in series with another resistor, and so on. This calculator computes the pure series total and the pure parallel total for one list of values; a mixed network needs to be broken into stages and solved one at a time.' },
        { question: 'How many resistors can I enter?', answer: 'At least two, and as many as you can paste in — separated by commas, spaces, semicolons or new lines, the same list format used across this site\'s other list-based calculators.' }
      ]
    },
    compute(values, lists) {
      const resistors = lists.resistors;
      const seriesTotal = resistors.reduce((sum, r) => sum + r, 0);
      const parallelTotal = 1 / resistors.reduce((sum, r) => sum + 1 / r, 0);
      return {
        seriesTotal,
        parallelTotal,
        count: resistors.length,
        smallestResistor: Math.min(...resistors)
      };
    }
  },
  {
    id: 'resistor-color-code-calculator',
    category: 'physics',
    glyph: 'Ω',
    updatedAt: '2026-11-06',
    aliases: ['resistor color code calculator', 'resistor color chart', 'decode resistor colors', 'resistor band calculator', '4 band resistor calculator', '5 band resistor calculator'],
    related: ['ohms-law-calculator', 'series-parallel-resistor-calculator', 'electrical-power-calculator', 'capacitor-charge-calculator'],
    title: 'Resistor Color Code Calculator',
    description: "Decode a 4-band or 5-band resistor's color bands into its resistance and tolerance range, using the standard IEC 60062 digit, multiplier and tolerance tables.",
    example: 'Red-red-brown-gold bands decode to 220 Ω ±5% — between 209 Ω and 231 Ω — one of the most common resistor values.',
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'How does the resistor color code work?',
        paragraphs: [
          'Resistors are too small to print a value on in text that stays readable, so manufacturers paint a sequence of colored bands around the body instead, each one standing for a digit, from black (0) through white (9). This system is standardized internationally as IEC 60062, so a resistor coded in one factory reads the same way anywhere else in the world. Reading the first two or three bands as significant digits, and the next band as a power-of-ten multiplier, gives the resistor\'s nominal value without measuring it directly.',
          'The final band states tolerance — how far the actual resistance is allowed to vary from that nominal value. Gold (±5%) is by far the most common tolerance on ordinary resistors; silver (±10%) and a scatter of other colors cover tighter or looser precision grades, and historically, a resistor with no tolerance band at all was understood to mean ±20%, the widest and least precise class.',
          "A 4-band resistor encodes two significant digits before the multiplier band; a 5-band resistor — more common on precision parts — adds a third significant digit for a finer value before its own multiplier and tolerance bands. Bands are always read in one direction, starting from the end farthest from the tolerance band (usually gold or silver, and often set slightly apart from the others)."
        ]
      },
      howTo: {
        intro: 'Match each band\'s color to the chart below, in order, starting from the band nearest the resistor\'s one end.',
        steps: [
          { name: 'Count the bands', text: 'Four bands or five — select the matching mode. A 5-band resistor has one extra significant-digit band before the multiplier.' },
          { name: 'Read the 1st digit band', text: 'Match its color to the digit chart (black = 0 through white = 9) and select it.' },
          { name: 'Read the 2nd (and 3rd, on a 5-band resistor) digit band', text: 'Same chart, same order. The 3rd digit is ignored automatically when 4-band mode is selected.' },
          { name: 'Read the multiplier band', text: 'Usually one of the same ten colors (as a power of ten), or gold (×0.1) and silver (×0.01) for fractional multipliers.' },
          { name: 'Read the tolerance band', text: 'The final band — almost always gold or silver, or "None" if there is no fourth (or sixth) band at all.' },
          { name: 'Read the result', text: 'The nominal resistance appears immediately, along with the ± range the tolerance band guarantees.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: "A resistor's color-coded value comes from a lookup table, not an equation — each band stands for a fixed digit, multiplier or tolerance percentage defined by IEC 60062.",
        expression: '4-band: value = (10 × digit₁ + digit₂) × multiplier\n5-band: value = (100 × digit₁ + 10 × digit₂ + digit₃) × multiplier',
        terms: [
          { symbol: 'digit₁, digit₂, digit₃', meaning: 'The significant-digit bands, each 0-9, read left to right (digit₃ exists only on a 5-band resistor).' },
          { symbol: 'multiplier', meaning: 'A power of ten (×1 through ×1,000,000,000 across the ten digit colors), or ×0.1 (gold) / ×0.01 (silver) for small values.' },
          { symbol: 'tolerance', meaning: 'The guaranteed ± percentage, from the final band: commonly ±5% (gold) or ±10% (silver); ±20% if no band is present at all.' }
        ],
        note: "This is a lookup table, not a formula you would rearrange — there is no way to go backward from a resistance value to a unique set of colors, since many digit-and-multiplier combinations can produce the same nominal value (27 × 10 and 270 × 1 both give 270)."
      },
      workedExample: {
        intro: 'A 4-band resistor has bands, in order, of red, violet, green and gold. What is its resistance, and what range does the tolerance allow?',
        rows: [
          { label: '1st digit (red)', value: '2' },
          { label: '2nd digit (violet)', value: '7' },
          { label: 'Significant digits (2 and 7 together)', value: '27' },
          { label: 'Multiplier (green = ×10⁵)', value: '×100,000' },
          { label: 'Nominal value (27 × 100,000)', value: '2,700,000 Ω' },
          { label: 'Tolerance range (gold = ±5% of 2,700,000 Ω)', value: '±135,000 Ω' }
        ],
        result: '2,700,000 Ω ±5% (2,565,000-2,835,000 Ω)',
        explanation: "The two significant-digit bands, red (2) and violet (7), read together as 27. Multiplying by green's ×100,000 gives a nominal value of 2,700,000 Ω (2.7 MΩ). The gold tolerance band means the actual resistance is guaranteed to fall within ±5% of that figure — between 2,565,000 Ω and 2,835,000 Ω."
      },
      watchOut: [
        {
          title: 'Reading direction matters',
          body: "Bands must be read starting from the end farthest from the tolerance band, not whichever end happens to face you first. Reading a resistor backward swaps which bands are digits and which is the multiplier, giving a completely different — and wrong — value."
        },
        {
          title: '4-band and 5-band resistors use their bands differently',
          body: "A 5-band resistor's third band is a significant digit, not the multiplier — the multiplier and tolerance bands both shift one position to the right compared with a 4-band resistor. Selecting the wrong mode for a given resistor decodes it incorrectly even if every color is matched correctly."
        },
        {
          title: 'Tolerance is a guarantee, not a measurement',
          body: "The tolerance band states the range the manufacturer guarantees the actual resistance falls within — it is not a measured value. Two resistors with identical color bands are not guaranteed to measure exactly the same; they are only guaranteed to both fall somewhere inside that ± range."
        },
        {
          title: 'No tolerance band at all means ±20%, not 0%',
          body: 'IEC 60062 defines a completely missing tolerance band as its own class, ±20% — the widest and least precise. This calculator\'s "None" tolerance option represents that case explicitly; it should be selected deliberately, not left as a stand-in for "unknown."'
        }
      ],
      references: [
        { label: 'Wikipedia, "Electronic color code" (IEC 60062 digit, multiplier and tolerance tables, and the red-violet-green-gold worked example reproduced above)', url: 'https://en.wikipedia.org/wiki/Electronic_color_code' },
        { label: 'BIPM, The International System of Units (SI Brochure) — the ohm, defined as 1 Ω = 1 V/A', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      {
        id: 'bandCount',
        label: 'Number of bands',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [{ value: 0, label: '4-band' }, { value: 1, label: '5-band' }]
      },
      { id: 'digit1', label: '1st band (1st digit)', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0, options: DIGIT_COLORS },
      { id: 'digit2', label: '2nd band (2nd digit)', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0, options: DIGIT_COLORS },
      { id: 'digit3', label: '3rd band (3rd digit, 5-band only)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: DIGIT_COLORS },
      { id: 'multiplier', label: 'Multiplier band', type: 'number', placeholder: '10', defaultValue: 10, step: 0.01, min: 0.01, options: MULTIPLIER_COLORS },
      { id: 'tolerance', label: 'Tolerance band', type: 'number', placeholder: '5', defaultValue: 5, step: 0.01, min: 0.01, options: TOLERANCE_COLORS }
    ],
    breakdown: {
      headline: 'resistance',
      headlineLabel: 'Resistance (Ω)',
      outputs: [
        { id: 'resistance', label: 'Resistance (Ω)', format: 'significant' },
        { id: 'minResistance', label: 'Minimum, tolerance low (Ω)', format: 'significant' },
        { id: 'maxResistance', label: 'Maximum, tolerance high (Ω)', format: 'significant' },
        { id: 'tolerancePercent', label: 'Tolerance', format: 'percent' }
      ],
      groups: [{ inputs: ['bandCount', 'digit1', 'digit2', 'digit3', 'multiplier', 'tolerance'] }],
      visual: {
        type: 'rangeBar',
        value: 'resistance',
        title: 'Where this value sits',
        valueLabel: 'Resistance',
        bands: [
          { label: 'Very low (< 10 Ω)', min: 0, max: 10 },
          { label: 'Low (10 Ω-1 kΩ)', min: 10, max: 1000 },
          { label: 'Typical electronics (1 kΩ-100 kΩ)', min: 1000, max: 100000 },
          { label: 'High (100 kΩ-1 MΩ)', min: 100000, max: 1000000 },
          { label: 'Very high (≥ 1 MΩ)', min: 1000000, max: 1e12 }
        ]
      }
    },
    seo: {
      title: 'Resistor Color Code Calculator – 4-Band & 5-Band',
      description: 'Free resistor color code calculator. Decode 4-band or 5-band resistor colors into resistance and tolerance range, per the IEC 60062 standard.',
      faq: [
        { question: 'How do I read a resistor color code?', answer: 'Read the bands left to right starting from the end farthest from the tolerance band. The first two (or three, on a 5-band resistor) bands are significant digits, the next band is a power-of-ten multiplier, and the last band is the tolerance.' },
        { question: 'What does red-red-brown-gold mean on a resistor?', answer: 'Red (2), red (2) and brown\'s ×10 multiplier give 22 × 10 = 220 Ω, with a gold ±5% tolerance — one of the most common resistor values, ranging from 209 Ω to 231 Ω.' },
        { question: 'What does red-violet-green-gold mean on a resistor?', answer: 'Red (2) and violet (7) give the digits 27; green\'s ×100,000 multiplier gives 27 × 100,000 = 2,700,000 Ω (2.7 MΩ), with a gold ±5% tolerance, or 2,565,000 to 2,835,000 Ω.' },
        { question: "What is the difference between a 4-band and a 5-band resistor?", answer: 'A 4-band resistor has two significant-digit bands; a 5-band resistor has three, for a more precise value, before its own multiplier and tolerance bands. Both encode the same kind of information, just with different precision.' },
        { question: 'What does it mean if a resistor has no tolerance band?', answer: 'Under IEC 60062, no tolerance band at all means ±20% — the widest, least precise tolerance class historically sold, wider than silver (±10%) or gold (±5%).' },
        { question: 'What do gold and silver mean on a resistor?', answer: 'As the last (tolerance) band, gold means ±5% and silver means ±10%. As the multiplier band instead, gold means ×0.1 and silver means ×0.01 — the same two colors mean something different depending on which band they appear in.' },
        { question: 'Can two different color combinations give the same resistance?', answer: 'Yes. Because the value is digits × a power-of-ten multiplier, combinations like "27 × 10" and "270 × 1" both equal 270 — a reason the color code is read from fixed band positions, not inferred from the final number alone.' }
      ]
    },
    compute(values) {
      const resistance = resistanceFromColorBands(values.digit1, values.digit2, values.digit3, values.multiplier, values.bandCount);
      const toleranceFraction = values.tolerance / 100;
      return {
        resistance,
        minResistance: resistance * (1 - toleranceFraction),
        maxResistance: resistance * (1 + toleranceFraction),
        tolerancePercent: values.tolerance
      };
    }
  },
  {
    id: 'capacitor-charge-calculator',
    category: 'physics',
    glyph: 'Q=CV',
    updatedAt: '2026-11-06',
    aliases: ['capacitor charge calculator', 'q = cv calculator', 'capacitance charge calculator', 'capacitor energy calculator', 'charge on a capacitor calculator', 'energy stored in a capacitor calculator'],
    related: ['ohms-law-calculator', 'electrical-power-calculator', 'series-parallel-resistor-calculator', 'resistor-color-code-calculator'],
    title: 'Capacitor Charge Calculator (Q = CV)',
    description: 'Calculate the charge stored on a capacitor from its capacitance and voltage — Q = C × V — or solve backward for capacitance or voltage, with the stored energy shown alongside.',
    example: 'A 100 µF capacitor charged to 12 V stores 1,200 µC of charge and 7.2 mJ of energy.',
    solver: {
      defaultTarget: 'charge',
      variables: [
        { id: 'charge', label: 'Charge', symbol: 'Q', dimension: 'charge', defaultValue: 1200, defaultUnit: 'uC' },
        { id: 'capacitance', label: 'Capacitance', symbol: 'C', dimension: 'capacitance', defaultValue: 100, defaultUnit: 'uF' },
        { id: 'voltage', label: 'Voltage', symbol: 'V', dimension: 'voltage', defaultValue: 12, defaultUnit: 'V' }
      ],
      solve: {
        charge: ({ capacitance, voltage }) => capacitance * voltage,
        capacitance: ({ charge, voltage }) => (voltage === 0 ? NaN : charge / voltage),
        voltage: ({ charge, capacitance }) => (capacitance === 0 ? NaN : charge / capacitance)
      },
      outputs: [{ id: 'storedEnergy', label: 'Stored energy', dimension: 'energy', unit: 'mJ', compute: (si) => 0.5 * si.charge * si.voltage }]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is capacitor charge, and how is it related to energy?',
        paragraphs: [
          'A capacitor stores electrical charge on two conductive plates separated by an insulator. Its defining property, capacitance, is the ratio between how much charge it holds and the voltage across it: Q = C × V. A capacitor with more capacitance holds more charge at the same voltage — in the same sense that a wider bucket holds more water at the same water level, even though "level" (voltage) and "amount" (charge) are different things.',
          "The farad, capacitance's SI unit, is defined as the capacitance that stores one coulomb of charge per volt (1 F = 1 C/V) — and it turns out to be an enormous unit in practice. Ordinary capacitors on a circuit board are sized in microfarads, nanofarads or even picofarads; only specialized supercapacitors reach whole farads.",
          "Charging a capacitor does not dump all of Q × V worth of energy into it, which is a common trip-up. Since the voltage climbs from 0 up to its final value as charge is added, the average voltage during charging is only half the final voltage — so the energy actually stored works out to E = ½ × Q × V (equivalently ½ × C × V²), not the full Q × V. The other half of the work done charging it is dissipated as heat in whatever resistance did the charging."
        ]
      },
      howTo: {
        intro: 'Fill in any two of charge, capacitance and voltage; the third fills in automatically, so the same page answers "how much charge", "what capacitance" and "what voltage".',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type. Microfarads, millivolts and microcoulombs can all be mixed freely.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 100 µF becomes 0.0001 F instead of silently turning into 100 F.' },
          { name: 'Read the result and the energy', text: 'The answer shows in your chosen unit. Underneath it, the energy stored (E = ½QV) appears as a bonus figure — no separate calculation needed.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The charge formula rearranges to solve for capacitance or voltage as well as charge; the stored energy follows from the same two values.',
        expression: 'Q = C × V\nC = Q ÷ V\nV = Q ÷ C\nStored energy: E = ½ × Q × V = ½ × C × V²',
        terms: [
          { symbol: 'Q', meaning: 'Charge stored on the capacitor, in coulombs (C) — commonly microcoulombs (µC) or millicoulombs (mC) for real capacitors.' },
          { symbol: 'C', meaning: 'Capacitance, in farads (F). One farad is defined as one coulomb per volt (1 F = 1 C/V).' },
          { symbol: 'V', meaning: 'Voltage across the capacitor, in volts (V).' },
          { symbol: 'E', meaning: "The energy stored, in joules (J) — half of Q × V, not the full amount, because the voltage climbed from 0 while charging." }
        ],
        note: 'Every input is converted to SI units (C, F, V) before solving and converted back afterward, so entering capacitance in nanofarads or charge in microcoulombs is handled automatically.'
      },
      workedExample: {
        intro: 'A 100 µF capacitor is charged to 12 V. How much charge does it store, and how much energy?',
        rows: [
          { label: 'Capacitance (C)', value: '100 µF (0.0001 F)' },
          { label: 'Voltage (V)', value: '12 V' },
          { label: 'Charge (Q = 0.0001 × 12)', value: '0.0012 C' },
          { label: 'Stored energy (E = ½ × 0.0012 × 12)', value: '0.0072 J' }
        ],
        result: 'Q = 1,200 µC (1.2 mC) · E = 7.2 mJ',
        explanation: '0.0001 × 12 = 0.0012 C, which is 1,200 µC or 1.2 mC of stored charge. The stored energy is half of Q × V, not all of it: ½ × 0.0012 × 12 = 0.0072 J, or 7.2 mJ — the other half of the work done charging the capacitor was dissipated as heat elsewhere in the circuit.'
      },
      watchOut: [
        {
          title: 'Charge and current are not the same thing',
          body: "A capacitor's charge, Q, is a fixed amount stored at any instant (in coulombs). Current (in amperes) is charge flowing per second. The same final charge can be reached quickly with a large current or slowly with a small one — this calculator computes the stored charge itself, not the current used to put it there."
        },
        {
          title: 'The stored energy is half of Q × V, not all of it',
          body: 'It is tempting to multiply charge by voltage directly, but that overstates the stored energy by exactly double. Because voltage rises from 0 to its final value while charging, the correct figure is E = ½ × Q × V — the other half of the work done by the charging circuit is lost as heat.'
        },
        {
          title: 'This calculator does not check a voltage rating',
          body: "Real capacitors have a maximum rated voltage; exceeding it risks breaking down the insulating layer between the plates and permanently damaging the part. This page computes Q = C × V for whatever voltage is entered — it has no information about any specific capacitor's safe operating limit."
        },
        {
          title: "Capacitance is a property of the capacitor, not of the charge or voltage you happen to use",
          body: "The same capacitor holds proportionally more charge at a higher voltage, but its capacitance — the ratio Q ÷ V — stays the same. Capacitance describes the component itself, similar to how a container's volume does not depend on how much it is currently filled."
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 2, §8.1 Capacitors and Capacitance', url: 'https://openstax.org/books/university-physics-volume-2/pages/8-1-capacitors-and-capacitance' },
        { label: 'OpenStax, University Physics Volume 2, §8.3 Energy Stored in a Capacitor', url: 'https://openstax.org/books/university-physics-volume-2/pages/8-3-energy-stored-in-a-capacitor' },
        { label: 'BIPM, The International System of Units (SI Brochure) — the farad and coulomb', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'capacitance', label: 'Capacitance (F)', type: 'number', placeholder: '0.0001', defaultValue: 0.0001, step: 0.000001, min: 0 },
      { id: 'voltage', label: 'Voltage (V)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Capacitor Charge Calculator (Q = CV) – Charge & Energy',
      description: "Free capacitor charge calculator. Solve Q = C × V for charge, capacitance or voltage in C, µF or V, with stored energy shown and a worked example.",
      faq: [
        { question: 'What is the formula for capacitor charge?', answer: 'Charge equals capacitance times voltage: Q = C × V. With capacitance in farads and voltage in volts, the result is in coulombs.' },
        { question: 'How much charge does a 100 µF capacitor store at 12 V?', answer: '100 µF × 12 V = 0.0012 C, equal to 1,200 µC or 1.2 mC.' },
        { question: 'How do I find the energy stored in a capacitor?', answer: 'E = ½ × Q × V, equivalently ½ × C × V². A 100 µF capacitor at 12 V stores ½ × 0.0012 × 12 = 0.0072 J (7.2 mJ) — half of Q × V, not the full amount.' },
        { question: 'Why is stored energy only half of Q times V?', answer: 'Because the voltage across the capacitor climbs from 0 up to its final value while it charges, not instantly. The average voltage during charging is half the final voltage, so the total energy delivered to the capacitor works out to half of Q × V.' },
        { question: 'How do I find capacitance from charge and voltage?', answer: 'Divide charge by voltage: C = Q ÷ V. A capacitor holding 0.0012 C at 12 V has a capacitance of 0.0012 ÷ 12 = 0.0001 F (100 µF).' },
        { question: 'What is the SI unit of capacitance?', answer: 'The farad (F), defined as one coulomb per volt (1 F = 1 C/V). It is a large unit in practice — most real capacitors are rated in microfarads, nanofarads or picofarads.' },
        { question: 'Is charge the same as current?', answer: 'No. Charge (coulombs) is a stored amount; current (amperes) is charge flowing per second. A capacitor can reach the same final charge through a large current applied briefly or a small current applied for longer.' }
      ]
    },
    compute(values) {
      return { charge: values.capacitance * values.voltage };
    }
  },
  {
    id: 'wavelength-frequency-calculator',
    category: 'physics',
    glyph: 'fλ',
    updatedAt: '2026-11-06',
    aliases: ['wavelength calculator', 'frequency to wavelength calculator', 'wavelength to frequency calculator', 'wave speed equation calculator', 'v = f lambda calculator', 'speed of light wavelength calculator'],
    related: ['speed-distance-time-calculator', 'speed-converter', 'length-converter', 'decibel-calculator'],
    title: 'Wavelength Calculator (v = fλ)',
    description: 'Solve the wave equation, v = f × λ, for wave speed, frequency, or wavelength — works for light, radio waves, sound, or any periodic wave.',
    example: 'An FM radio wave at 100 MHz, traveling at the speed of light, has a wavelength of about 3.00 m.',
    solver: {
      defaultTarget: 'wavelength',
      variables: [
        { id: 'speed', label: 'Wave speed', symbol: 'v', dimension: 'speed', defaultValue: 299792458, defaultUnit: 'm/s' },
        { id: 'frequency', label: 'Frequency', symbol: 'f', dimension: 'frequency', defaultValue: 100, defaultUnit: 'MHz' },
        { id: 'wavelength', label: 'Wavelength', symbol: 'λ', dimension: 'length', defaultValue: 2.99792458, defaultUnit: 'm' }
      ],
      solve: {
        wavelength: ({ speed, frequency }) => (frequency === 0 ? NaN : speed / frequency),
        frequency: ({ speed, wavelength }) => (wavelength === 0 ? NaN : speed / wavelength),
        speed: ({ frequency, wavelength }) => frequency * wavelength
      },
      visuals: [
        {
          type: 'logScale',
          value: 'frequency',
          min: 6,
          max: 18,
          ticks: ['1 MHz', '1 GHz', '1 THz', '1 PHz', '1 EHz'],
          benchmarks: [
            { label: 'AM radio broadcast band', value: 1e6 },
            { label: 'FM radio broadcast band', value: 1e8 },
            { label: 'Wi-Fi (2.4 GHz band)', value: 2.4e9 },
            { label: 'Visible light (green, ~550 nm)', value: 5.45e14 },
            { label: 'Diagnostic X-rays (typical)', value: 3e18 }
          ],
          title: 'How does that compare?',
          valueLabel: 'Your frequency'
        }
      ]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is the wave equation?',
        paragraphs: [
          "Every traveling wave — light, sound, water ripples, radio signals — links the same three quantities: how fast it moves, how often it repeats, and how long each repeat is. The wave equation, v = f × λ, says a wave's speed equals its frequency times its wavelength. It holds for any periodic wave, not just light, because it is really just a restatement of speed = distance ÷ time: in one period, a wave moves forward exactly one wavelength, and frequency is the number of periods per second.",
          'Frequency and wavelength trade off against each other at a fixed speed. A radio station broadcasting at a higher frequency packs more wave crests into each second, so each individual crest-to-crest distance — the wavelength — must be shorter. This is why AM radio, with frequencies around 1 MHz, uses enormous antennas (its wavelength is hundreds of meters), while Wi-Fi, at a few GHz, fits its much shorter wavelength onto a small antenna inside a phone.',
          "For light and all other electromagnetic waves traveling through a vacuum, v is a universal constant: the speed of light, c = 299,792,458 m/s exactly. It is exact because the metre has been defined since 1983 as the distance light travels in 1 ⁄ 299,792,458 of a second — the speed is fixed by definition, not measured. Sound is a completely different kind of wave; it needs this calculator's speed field set to the actual speed of sound in whatever it's traveling through (about 343 m/s in dry air at 20 °C), which is nowhere near the speed of light."
        ]
      },
      howTo: {
        intro: 'Fill in any two of wave speed, frequency and wavelength; the third fills in automatically — so the same page answers "what wavelength", "what frequency" and "how fast".',
        steps: [
          { name: 'Pick the right wave speed', text: "Leave the speed at the speed of light for radio, microwaves, light or any other electromagnetic wave in a vacuum or air. Replace it with the speed of sound (or another wave's actual speed) for non-electromagnetic waves." },
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit from the menu beside it. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'To solve for a different quantity, type into the auto field. It becomes an input, and the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 100 MHz becomes 100,000,000 Hz instead of silently turning into 100 Hz.' },
          { name: 'Read the result and the scale', text: 'The answer appears in your chosen unit. The scale shows where your frequency sits among the radio, Wi-Fi, visible-light and X-ray bands.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The wave equation rearranges three ways, one for each quantity you might be solving for.',
        expression: 'v = f × λ\nf = v ÷ λ\nλ = v ÷ f',
        terms: [
          { symbol: 'v', meaning: 'Wave speed, in meters per second (m/s) — the speed of light (c) for electromagnetic waves, or the actual speed of sound, water or another medium otherwise.' },
          { symbol: 'f', meaning: 'Frequency, in hertz (Hz) — the number of complete wave cycles passing a point each second. 1 Hz = 1 cycle/s.' },
          { symbol: 'λ', meaning: 'Wavelength (the Greek letter lambda), in meters (m) — the distance between two consecutive identical points on the wave, such as crest to crest.' },
          { symbol: 'T = 1 ÷ f', meaning: 'The period: the time for one full cycle. Frequency and period are reciprocals of each other.' }
        ],
        note: 'Every input is converted to SI units (m/s, Hz, m) before solving and converted back afterward, so entering frequency in MHz or wavelength in nanometers is handled automatically.'
      },
      workedExample: {
        intro: 'An FM radio station broadcasts at 100 MHz. Radio waves are electromagnetic, so they travel at the speed of light. What is the wavelength?',
        rows: [
          { label: 'Wave speed (v = c)', value: '299,792,458 m/s' },
          { label: 'Frequency (f)', value: '100 MHz = 100,000,000 Hz' },
          { label: 'Wavelength (λ = v ÷ f)', value: '299,792,458 ÷ 100,000,000 = 2.9979 m' }
        ],
        result: 'λ ≈ 3.00 m',
        explanation: "Dividing the speed of light by the frequency gives 2.9979 m, which rounds to about 3.00 m — roughly the length of a small car. This is also why FM antennas are commonly cut to a quarter or half of that wavelength, around 0.75–1.5 m, a practical length for a car or rooftop antenna."
      },
      watchOut: [
        {
          title: "v isn't always the speed of light",
          body: "Only electromagnetic waves (light, radio, microwaves, X-rays) travel at c in a vacuum. Sound, water waves, and vibrations in a solid each have their own, usually far slower, speed — plug in that wave's actual speed, not c, or the frequency and wavelength will both come out wrong."
        },
        {
          title: 'The speed of sound depends on the medium and temperature',
          body: "343 m/s is a commonly cited value for dry air at 20 °C, but sound travels faster in warmer air, and much faster in water (~1,480 m/s) or steel (~5,000 m/s). There is no single 'speed of sound' the way there is a single speed of light."
        },
        {
          title: 'Higher frequency means shorter wavelength, not longer',
          body: 'Because v = f × λ holds the product of frequency and wavelength fixed at a given speed, the two move in opposite directions. Gamma rays have far higher frequency — and far shorter wavelength — than radio waves, even though both travel at c.'
        },
        {
          title: 'Frequency and period are reciprocals, not the same number',
          body: 'If a problem gives you the period (the time per cycle) instead of frequency, invert it first: f = 1 ÷ T. Plugging a period directly into the frequency field will give a wavelength that is off by a large factor.'
        },
        {
          title: "A wave's speed can change when it enters a new medium",
          body: 'Light slows down when it passes from air into glass or water, which is exactly what bends it (refraction). Its frequency stays the same, so its wavelength inside the new medium must shrink to match the slower speed — the wave equation still holds, just with a different v.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §16.2 Mathematics of Waves', url: 'https://openstax.org/books/university-physics-volume-1/pages/16-2-mathematics-of-waves' },
        { label: 'OpenStax, University Physics Volume 2, §16.5 The Electromagnetic Spectrum', url: 'https://openstax.org/books/university-physics-volume-2/pages/16-5-the-electromagnetic-spectrum' },
        { label: 'NIST, Fundamental Physical Constants — speed of light in vacuum (exact, by SI definition)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?c' }
      ]
    },
    inputs: [
      { id: 'speed', label: 'Wave speed (m/s)', type: 'number', placeholder: '299792458', defaultValue: 299792458, step: 1, min: 0 },
      { id: 'frequency', label: 'Frequency (Hz)', type: 'number', placeholder: '100000000', defaultValue: 1e8, step: 1, min: 0 }
    ],
    seo: {
      title: 'Wavelength Calculator (v = fλ) – Frequency & Speed',
      description: 'Free wavelength calculator. Solve v = f × λ for wave speed, frequency or wavelength in m/s, Hz, MHz or m, for light, radio or sound, with a worked example.',
      faq: [
        { question: 'What is the wave equation, v = fλ?', answer: "It says a wave's speed equals its frequency times its wavelength: v = f × λ. It holds for any traveling wave — light, sound, water, radio — because in one period a wave moves forward exactly one wavelength." },
        { question: 'How do I calculate wavelength from frequency?', answer: 'Divide the wave speed by the frequency: λ = v ÷ f. A 100 MHz radio wave traveling at the speed of light has a wavelength of 299,792,458 ÷ 100,000,000 ≈ 3.00 m.' },
        { question: 'How do I calculate frequency from wavelength?', answer: 'Divide the wave speed by the wavelength: f = v ÷ λ. A wave 3 m long traveling at the speed of light has a frequency of 299,792,458 ÷ 3 ≈ 100 MHz.' },
        { question: 'Does this calculator work for sound waves?', answer: "Yes — enter the actual speed of sound (about 343 m/s in dry air at 20 °C) in the wave speed field instead of the speed of light. The same v = f × λ relationship applies to any wave." },
        { question: 'What is the exact speed of light?', answer: '299,792,458 meters per second, exactly. Since 1983 the metre has been defined as the distance light travels in 1 ⁄ 299,792,458 of a second, which fixes this value by definition rather than by measurement.' },
        { question: 'Why do higher-frequency waves have shorter wavelengths?', answer: "Because speed is fixed for a given medium, frequency and wavelength must trade off to keep their product constant. Gamma rays have an extremely high frequency and a correspondingly tiny wavelength; AM radio waves have a low frequency and a wavelength hundreds of meters long." },
        { question: 'How are frequency and period related?', answer: 'They are reciprocals: f = 1 ÷ T. A wave with a period of 0.01 seconds has a frequency of 1 ÷ 0.01 = 100 Hz.' }
      ]
    },
    compute(values) {
      return { wavelength: values.frequency === 0 ? NaN : values.speed / values.frequency };
    }
  },
  {
    id: 'decibel-calculator',
    category: 'physics',
    glyph: 'dB',
    updatedAt: '2026-11-06',
    aliases: ['decibel calculator', 'db calculator', 'power ratio to db calculator', 'db gain calculator', 'decibel formula calculator', 'sound intensity level calculator'],
    related: ['wavelength-frequency-calculator', 'power-calculator', 'electrical-power-calculator', 'power-converter'],
    title: 'Decibel Calculator (dB From a Power Ratio)',
    description: 'Solve dB = 10 × log₁₀(P₂ ÷ P₁) for the decibel difference between two power levels, or work backward for either power — the same formula behind amplifier gain and sound intensity.',
    example: 'An amplifier with 1 W in and 10 W out has a gain of exactly 10 dB.',
    solver: {
      defaultTarget: 'decibels',
      variables: [
        { id: 'decibels', label: 'Level difference', symbol: 'dB', dimension: 'decibel', defaultValue: 10, defaultUnit: 'dB' },
        { id: 'inputPower', label: 'Reference power (P₁)', symbol: 'P₁', dimension: 'power', defaultValue: 1, defaultUnit: 'W' },
        { id: 'outputPower', label: 'Measured power (P₂)', symbol: 'P₂', dimension: 'power', defaultValue: 10, defaultUnit: 'W' }
      ],
      solve: {
        decibels: ({ inputPower, outputPower }) => (inputPower <= 0 || outputPower <= 0 ? NaN : 10 * Math.log10(outputPower / inputPower)),
        outputPower: ({ inputPower, decibels }) => (inputPower <= 0 ? NaN : inputPower * 10 ** (decibels / 10)),
        inputPower: ({ outputPower, decibels }) => (outputPower <= 0 ? NaN : outputPower / 10 ** (decibels / 10))
      }
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is a decibel?',
        paragraphs: [
          'A decibel (dB) is a logarithmic way of expressing the ratio between two power levels: dB = 10 × log₁₀(P₂ ÷ P₁). It is one tenth of a bel, a unit named for Alexander Graham Bell and first used by telephone engineers to describe how much a signal weakened over a long line. Power ratios in the real world span an enormous range — the sound intensity of a jet engine is roughly a trillion times that of a whisper — and a logarithmic scale compresses that range into manageable, additive numbers.',
          "That additive property is the main reason decibels are so widely used: every extra 10 dB represents another 10× in power, no matter where you start, and gains or losses through a chain of amplifiers, cables, and filters simply add in dB instead of multiplying as raw ratios. A +10 dB amplifier followed by a −3 dB cable loss gives a net +7 dB, a much easier calculation than multiplying by 10 and then by roughly 0.501.",
          'The same formula underlies two common uses that look different on the surface. Audio and RF engineers use it directly as a power ratio — an amplifier\'s "gain" or a cable\'s "loss" in dB. Acoustics uses it to express sound intensity level relative to a fixed reference, the standard threshold of human hearing, I₀ = 1 × 10⁻¹² W/m² (ANSI/ASA acoustical terminology). A typical conversation, at roughly 1 µW/m², works out to exactly 10 × log₁₀(10⁻⁶ ÷ 10⁻¹²) = 60 dB above that reference — the same math as an amplifier\'s gain, just with the "reference power" fixed to the hearing threshold instead of an amplifier\'s input.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the reference power, the measured power, and the decibel difference; the third fills in automatically.',
        steps: [
          { name: 'Decide which power is the reference', text: "For an amplifier's gain, P₁ is the input power and P₂ is the output. For a sound intensity level, P₁ is the fixed reference intensity (1 × 10⁻¹² W/m²) and P₂ is the measured intensity." },
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a power unit converts the number already there, so 1 W becomes 1,000 mW instead of silently turning into 1 mW.' },
          { name: 'Read the result', text: 'The decibel field shows how many dB higher (positive) or lower (negative) the measured power is than the reference.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The decibel formula rearranges to solve for either power as well as the dB difference itself.',
        expression: 'dB = 10 × log₁₀(P₂ ÷ P₁)\nP₂ = P₁ × 10^(dB ÷ 10)\nP₁ = P₂ ÷ 10^(dB ÷ 10)',
        terms: [
          { symbol: 'P₁', meaning: 'The reference power — an amplifier\'s input, or a fixed reference intensity for sound level, in watts (W).' },
          { symbol: 'P₂', meaning: 'The measured power being compared to it, in watts (W).' },
          { symbol: 'dB', meaning: 'The level difference in decibels. Positive means P₂ is larger than P₁; negative means it is smaller.' },
          { symbol: '20 × log₁₀', meaning: 'The form to use instead when comparing voltage or amplitude ratios rather than power, since power is proportional to amplitude squared.' }
        ],
        note: "P₁ and P₂ are converted to the same SI unit (watts) before dividing, so the ratio is unaffected by whichever unit you typed each one in."
      },
      workedExample: {
        intro: 'An amplifier is fed 1 W and puts out 10 W. What is its gain in decibels?',
        rows: [
          { label: 'Input power (P₁)', value: '1 W' },
          { label: 'Output power (P₂)', value: '10 W' },
          { label: 'Ratio (P₂ ÷ P₁)', value: '10' },
          { label: 'Gain (dB = 10 × log₁₀(10))', value: '10 × 1 = 10 dB' }
        ],
        result: 'dB = 10.00 dB',
        explanation: "log₁₀(10) is exactly 1, so the gain is exactly 10 dB — a convenient round number because the power ratio is a clean power of 10. A 2× power increase instead works out to 10 × log₁₀(2) ≈ 3.01 dB, the commonly cited 'doubling is about +3 dB' rule, computed exactly rather than rounded to a flat 3."
      },
      watchOut: [
        {
          title: 'Voltage and amplitude ratios use 20 × log, not 10 × log',
          body: 'Power is proportional to amplitude squared, so a power ratio of (V₂ ÷ V₁)² becomes 10 × log₁₀((V₂ ÷ V₁)²) = 20 × log₁₀(V₂ ÷ V₁). Using 10× instead of 20× on a voltage or sound-pressure ratio understates the decibel figure by half.'
        },
        {
          title: 'A decibel value means nothing without knowing what it is relative to',
          body: "10 dB by itself could be an amplifier's gain over its own input, a cable's loss, or a sound level above the standard hearing-threshold reference — the number only means something once you know what P₁ represents."
        },
        {
          title: 'Every +10 dB is another 10× in power, at any starting level',
          body: 'This holds regardless of where you start: going from 1 W to 10 W is +10 dB, and going from 100 W to 1,000 W is also +10 dB. The decibel scale is about the ratio, not the absolute wattage.'
        },
        {
          title: 'Zero or negative power has no decibel value',
          body: 'The logarithm of zero or a negative number is undefined, so a reference or measured power of 0 W (or less) gives no answer here — not a 0 dB or an error value that could be mistaken for a real result.'
        },
        {
          title: '0 dB does not mean zero power',
          body: 'It means the two powers are equal: log₁₀(1) = 0. A 0 dB amplifier passes its input through unchanged; it is not an amplifier that outputs no power at all.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §17.3 Sound Intensity', url: 'https://openstax.org/books/university-physics-volume-1/pages/17-3-sound-intensity' },
        { label: 'BIPM, The International System of Units (SI Brochure) — the decibel as a unit for logarithmic ratio quantities', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'inputPower', label: 'Reference power (W)', type: 'number', placeholder: '1', defaultValue: 1, step: 0.01, min: 0 },
      { id: 'outputPower', label: 'Measured power (W)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Decibel Calculator (dB) – Power Ratio, Gain & Loss',
      description: 'Free decibel calculator. Solve dB = 10 × log₁₀(P₂ ÷ P₁) for gain, loss or either power in W, mW or kW, with a worked example and sound-level comparisons.',
      faq: [
        { question: 'What is a decibel?', answer: 'A decibel (dB) is a logarithmic measure of the ratio between two power levels: dB = 10 × log₁₀(P₂ ÷ P₁). It compresses huge power ratios into small, additive numbers.' },
        { question: 'How do I calculate decibels from two power values?', answer: 'Divide the measured power by the reference power, then take 10 times the base-10 logarithm: dB = 10 × log₁₀(P₂ ÷ P₁). 1 W in and 10 W out gives 10 × log₁₀(10) = 10 dB.' },
        { question: 'What does +3 dB mean?', answer: 'Roughly a doubling of power. Exactly, 10 × log₁₀(2) ≈ 3.01 dB, so a true power doubling rounds to the commonly cited "+3 dB".' },
        { question: 'What does −10 dB mean?', answer: 'The power has dropped to one tenth of what it was: 10 × log₁₀(0.1) = −10 dB.' },
        { question: 'Why do some decibel formulas use 20 × log instead of 10 × log?', answer: 'Use 20 × log₁₀ when comparing voltage, current, or sound pressure (amplitude quantities) rather than power directly, since power is proportional to amplitude squared.' },
        { question: 'What does 0 dB mean?', answer: 'The two powers are equal — a ratio of 1, and log₁₀(1) = 0. It does not mean zero power.' },
        { question: 'How many decibels is a normal conversation?', answer: 'About 60 dB, measured against the standard reference intensity for sound, 1 × 10⁻¹² W/m². A conversation at roughly 1 µW/m² gives 10 × log₁₀(10⁻⁶ ÷ 10⁻¹²) = 60 dB exactly.' }
      ]
    },
    compute(values) {
      return { decibels: values.inputPower <= 0 || values.outputPower <= 0 ? NaN : 10 * Math.log10(values.outputPower / values.inputPower) };
    }
  },
  {
    id: 'radioactive-half-life-calculator',
    category: 'physics',
    glyph: 't½',
    updatedAt: '2026-11-06',
    aliases: ['half life calculator', 'radioactive decay calculator', 'half-life formula calculator', 'decay calculator', 'carbon dating calculator', 'exponential decay calculator'],
    related: ['exponent-calculator', 'logarithm-calculator', 'compound-interest-calculator', 'heat-calculator'],
    title: 'Radioactive Half-Life Calculator',
    description: 'Solve the radioactive decay equation, N = N₀ × (½)^(t ÷ t½), for the amount remaining, the starting amount, elapsed time, or the half-life itself.',
    example: 'A 100 g sample of carbon-14 (half-life 5,730 years) decays to exactly 50 g after one half-life.',
    solver: {
      defaultTarget: 'remainingAmount',
      variables: [
        { id: 'initialAmount', label: 'Starting amount', symbol: 'N₀', dimension: 'mass', defaultValue: 100, defaultUnit: 'g' },
        { id: 'remainingAmount', label: 'Amount remaining', symbol: 'N', dimension: 'mass', defaultValue: 50, defaultUnit: 'g' },
        { id: 'elapsedTime', label: 'Elapsed time', symbol: 't', dimension: 'time', defaultValue: 5730, defaultUnit: 'yr' },
        { id: 'halfLife', label: 'Half-life', symbol: 't½', dimension: 'time', defaultValue: 5730, defaultUnit: 'yr' }
      ],
      solve: {
        remainingAmount: ({ initialAmount, elapsedTime, halfLife }) => initialAmount * Math.pow(0.5, elapsedTime / halfLife),
        initialAmount: ({ remainingAmount, elapsedTime, halfLife }) => remainingAmount / Math.pow(0.5, elapsedTime / halfLife),
        elapsedTime: ({ initialAmount, remainingAmount, halfLife }) => (initialAmount <= 0 || remainingAmount <= 0 ? NaN : halfLife * Math.log2(initialAmount / remainingAmount)),
        halfLife: ({ initialAmount, remainingAmount, elapsedTime }) => (initialAmount <= 0 || remainingAmount <= 0 ? NaN : elapsedTime / Math.log2(initialAmount / remainingAmount))
      },
      outputs: [{ id: 'decayConstant', label: 'Decay constant (λ)', dimension: 'frequency', unit: 'Hz', compute: (si) => (si.halfLife === 0 ? Infinity : Math.LN2 / si.halfLife) }]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is radioactive half-life?',
        paragraphs: [
          "Unstable atomic nuclei break apart at random, and a sample's radioactivity fades exponentially, not in a straight line. Half-life is the time it takes for half of any sample to decay — whether you start with a gram or a kilogram, the same fraction, one half, is gone after one half-life. The formula N = N₀ × (½)^(t ÷ t½) captures this: N₀ is what you started with, t½ is the isotope's own fixed half-life, t is how long has passed, and N is what's left.",
          "Half-life is a property of the specific isotope's nucleus, fixed by nuclear physics, not by temperature, pressure, or chemical form. It varies enormously between isotopes: carbon-14 has a half-life of about 5,730 years, the medical isotope technetium-99m decays with a half-life of about 6 hours, and uranium-238 takes about 4.5 billion years. None of these change no matter what compound the atom is part of.",
          "This is specifically nuclear decay, and it is a different formula from a chemistry reaction's half-life. A first-order chemical reaction's half-life is derived from its rate constant k, as t½ = ln(2) ÷ k, and changes if you change the reaction's conditions. Radioactive half-life is entered directly, as a fixed, measured constant for the isotope — don't reach for a rate constant here, and don't plug a nuclear half-life into a chemical-kinetics formula expecting a k."
        ]
      },
      howTo: {
        intro: 'Fill in any three of the starting amount, the amount remaining, the elapsed time, and the half-life; the fourth fills in automatically.',
        steps: [
          { name: 'Look up the isotope\'s half-life', text: "Each radioactive isotope has its own fixed half-life — 5,730 years for carbon-14, about 6 hours for technetium-99m, and so on. Use the correct value for the isotope in your problem." },
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit. The field left over, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a time unit converts the number already there, so 5,730 years becomes the equivalent number of days instead of silently turning into 5,730 days.' },
          { name: 'Read the result and the decay constant', text: "The answer appears in your chosen unit. Underneath it, the decay constant (λ = ln(2) ÷ t½) shows the isotope's per-second probability of decay." }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The decay equation rearranges to solve for any of the four quantities.',
        expression: 'N = N₀ × (½)^(t ÷ t½)\nN₀ = N ÷ (½)^(t ÷ t½)\nt = t½ × log₂(N₀ ÷ N)\nt½ = t ÷ log₂(N₀ ÷ N)',
        terms: [
          { symbol: 'N₀', meaning: 'The starting amount of the radioactive substance (mass, activity, or atom count — any proportional quantity works, since only the ratio N₀ ÷ N matters).' },
          { symbol: 'N', meaning: 'The amount remaining after time t.' },
          { symbol: 't', meaning: 'The elapsed time, in the same kind of units as the half-life once converted.' },
          { symbol: 't½', meaning: "The isotope's half-life — the fixed time for any amount of it to fall to half." },
          { symbol: 'λ = ln(2) ÷ t½', meaning: 'The decay constant: the fraction of remaining atoms that decay per unit time. Shown as a bonus output in Hz (per second).' }
        ],
        note: 'Every time input is converted to SI seconds before solving and converted back afterward, so mixing years and hours is handled automatically.'
      },
      workedExample: {
        intro: 'A 100 g sample of carbon-14 (half-life 5,730 years) is left for exactly one half-life. How much is left, and how slowly does an individual atom of it decay?',
        rows: [
          { label: 'Starting amount (N₀)', value: '100 g' },
          { label: 'Half-life (t½)', value: '5,730 years' },
          { label: 'Elapsed time (t)', value: '5,730 years (1 half-life)' },
          { label: 'Remaining (N = 100 × (½)^(5730 ÷ 5730))', value: '100 × 0.5 = 50 g' }
        ],
        result: 'N = 50 g · λ ≈ 3.83 × 10⁻¹² Hz',
        explanation: "After exactly one half-life, half of the sample remains — 50 g, no logarithms needed since the exponent is 1. The decay constant, λ = ln(2) ÷ 5,730 years, converts to about 3.83 × 10⁻¹² per second: an extremely small per-second decay probability for any one atom, which is exactly why a long-lived isotope's radioactivity fades so gradually. After 2,000 years instead of a full half-life, the same sample would have about 78.5 g left — most of it, since 2,000 years is only about a third of carbon-14's half-life."
      },
      watchOut: [
        {
          title: "This is nuclear half-life, not a chemistry reaction's half-life",
          body: "A radioactive isotope's half-life is a fixed, measured constant you enter directly. A first-order chemical reaction's half-life (t½ = ln(2) ÷ k) is calculated from a rate constant and changes with the reaction's own conditions — a completely different formula with a different kind of input, even though both describe something falling to half its value."
        },
        {
          title: 'Half-life describes a large sample on average, not one atom',
          body: "No single atom has a 'half-life' of its own — each one decays at a random moment. Half-life is a statistical statement about huge numbers of atoms: with enough of them, almost exactly half decay in one half-life, the same way a fair coin flipped a million times lands close to half heads."
        },
        {
          title: 'Decay approaches zero but never mathematically reaches it',
          body: 'After 10 half-lives, about 0.0977% of the original sample is still left — vanishingly little, but never a true zero in this formula. In practice, a sample is usually considered "gone" after 7–10 half-lives.'
        },
        {
          title: 'Different isotopes have wildly different half-lives — use the right one',
          body: "Carbon-14's half-life (about 5,730 years) is useless for dating a medical tracer that decays in hours, and vice versa. Double-check both the isotope's half-life and that your elapsed-time unit matches the scale of the problem — years for geological or archaeological dating, hours or days for most medical isotopes."
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 3, §10.3 Radioactive Decay', url: 'https://openstax.org/books/university-physics-volume-3/pages/10-3-radioactive-decay' },
        { label: 'NIST Physical Measurement Laboratory, Radiation Physics', url: 'https://www.nist.gov/pml/radiation-physics' }
      ]
    },
    inputs: [
      { id: 'initialAmount', label: 'Starting amount (g)', type: 'number', placeholder: '100', defaultValue: 100, step: 0.1, min: 0 },
      { id: 'elapsedTime', label: 'Elapsed time (years)', type: 'number', placeholder: '5730', defaultValue: 5730, step: 1, min: 0 },
      { id: 'halfLife', label: 'Half-life (years)', type: 'number', placeholder: '5730', defaultValue: 5730, step: 1, min: 0 }
    ],
    seo: {
      title: 'Radioactive Half-Life Calculator – Decay Formula',
      description: 'Free half-life calculator. Solve N = N₀ × (½)^(t/t½) for the amount remaining, starting amount, time, or half-life, with a carbon-14 worked example.',
      faq: [
        { question: 'What is the half-life formula?', answer: 'N = N₀ × (½)^(t ÷ t½), where N₀ is the starting amount, t½ is the half-life, t is elapsed time, and N is the amount remaining.' },
        { question: 'How much of a 100 g sample of carbon-14 is left after 5,730 years?', answer: '50 g — exactly half, since 5,730 years is carbon-14\'s half-life. After two half-lives (11,460 years), 25 g would remain.' },
        { question: 'How do I calculate elapsed time from the amount remaining?', answer: 't = t½ × log₂(N₀ ÷ N). If 100 g decays to 25 g with a 5,730-year half-life, t = 5,730 × log₂(4) = 5,730 × 2 = 11,460 years.' },
        { question: 'Is radioactive half-life the same as a chemical reaction\'s half-life?', answer: 'No. Radioactive half-life is a fixed constant for an isotope\'s nucleus, entered directly. A chemical reaction\'s half-life (t½ = ln(2) ÷ k) comes from a rate constant k and depends on the reaction\'s conditions — a different formula for a different kind of process.' },
        { question: 'What is the decay constant?', answer: 'λ = ln(2) ÷ t½, the fraction of a sample that decays per unit time. Carbon-14, with a 5,730-year half-life, has a decay constant of about 3.83 × 10⁻¹² per second — a tiny per-second decay probability for any one atom.' },
        { question: 'Does a radioactive sample ever fully decay to zero?', answer: 'Not mathematically — the formula only approaches zero. After 10 half-lives, about 0.0977% of the original amount is still technically present, though in practice the sample is usually treated as gone by then.' },
        { question: 'What is the half-life of carbon-14?', answer: 'About 5,730 years, the basis for radiocarbon dating of organic material. Other isotopes vary enormously: technetium-99m (used in medical imaging) has a half-life of about 6 hours, while uranium-238 has one of about 4.5 billion years.' }
      ]
    },
    compute(values) {
      return { remainingAmount: values.initialAmount * Math.pow(0.5, values.elapsedTime / values.halfLife) };
    }
  }
];
