import type { CalculatorConfig } from './types.ts';
import { DIGIT_COLORS, MULTIPLIER_COLORS, TOLERANCE_COLORS, resistanceFromColorBands } from '../../lib/resistorColors.ts';

// 3rd CGPM (1901) fixed standard gravity at this value; see NIST SP 811 Appendix B and the BIPM SI
// Brochure. Shared by weight-calculator and potential-energy-calculator's forward compute() below
// (the solver pages use lib/units.ts's 'g0' acceleration unit, which carries the same value).
const STANDARD_GRAVITY = 9.80665;
// Speed of light in vacuum: exact by definition since the 1983 SI redefinition of the meter (BIPM SI
// Brochure; NIST, physics.nist.gov/cgi-bin/cuu/Value?c). Shared by mass-energy-equivalence-calculator's
// E = mc² and its bonus speed-of-light output below.
const SPEED_OF_LIGHT = 299792458;
// Newtonian constant of gravitation, CODATA 2022 recommended value (physics.nist.gov/cgi-bin/cuu/Value?bg):
// 6.674 30(15) x 10^-11 m3 kg^-1 s^-2 — unlike the speed of light, this is measured, not exact.
// Used by escape-velocity-calculator's v = sqrt(2GM/r).
const GRAVITATIONAL_CONSTANT = 6.6743e-11;

export const physicsCalculators: CalculatorConfig[] = [
  {
    id: 'force-calculator',
    category: 'physics',
    group: 'Motion & Forces',
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
    group: 'Motion & Forces',
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
    group: 'Motion & Forces',
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
    group: 'Energy & Work',
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
      outputs: [{ id: 'momentum', label: 'Momentum (p = mv)', dimension: 'momentum', unit: 'kgm/s', compute: (si) => si.mass * si.velocity }],
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
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen energy unit, alongside the momentum (p = mv) that same mass and velocity produce, with the scale below placing the energy among a few everyday reference points.' },
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
        { question: 'How do I convert joules of kinetic energy to kilowatt-hours?', answer: 'Divide by 3,600,000 (since 1 kWh = 3.6 million J). A 240,000 J kinetic energy is 240,000 ÷ 3,600,000 ≈ 0.0667 kWh.' },
        { question: 'What momentum does a 1,200 kg car at 20 m/s have, alongside its kinetic energy?', answer: 'Momentum is p = m × v = 1,200 × 20 = 24,000 kg·m/s — shown as a bonus figure next to the 240,000 J of kinetic energy, since both come from the same mass and velocity but scale differently (energy with v², momentum with v alone).' }
      ]
    },
    compute(values) {
      return { energy: 0.5 * values.mass * values.velocity * values.velocity };
    }
  },
  {
    id: 'potential-energy-calculator',
    category: 'physics',
    group: 'Energy & Work',
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
      outputs: [
        {
          id: 'impactVelocity',
          label: 'Speed if it fell freely from that height (v = √(2gh))',
          dimension: 'speed',
          unit: 'm/s',
          compute: (si) => (si.height < 0 ? NaN : Math.sqrt(2 * STANDARD_GRAVITY * si.height))
        }
      ],
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
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen energy unit, alongside the speed a free fall from that same height would reach, with the scale below placing the energy among a few everyday reference points.' }
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
        },
        {
          title: "The free-fall speed bonus figure ignores air resistance",
          body: 'The speed shown (v = √(2gh)) assumes every bit of potential energy converts to kinetic energy on the way down, with nothing lost to drag — the same assumption behind setting PE = KE. A real falling object, especially a light or large one, reaches a lower actual speed because air resistance removes some of that energy as heat.'
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
        { question: 'How do I convert joules of potential energy to kilowatt-hours?', answer: 'Divide by 3,600,000. A potential energy of 159,358 J is 159,358 ÷ 3,600,000 ≈ 0.0443 kWh.' },
        { question: 'How fast would something be moving if it fell from that height?', answer: 'Setting potential and kinetic energy equal (mgh = ½mv²) and canceling mass gives v = √(2gh) — shown as a bonus figure next to the energy. Falling freely from 250 m, ignoring air resistance, reaches about 70.0 m/s (√(2 × 9.80665 × 250)).' }
      ]
    },
    compute(values) {
      return { energy: values.mass * STANDARD_GRAVITY * values.height };
    }
  },
  {
    id: 'work-calculator',
    category: 'physics',
    group: 'Energy & Work',
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
      outputs: [{ id: 'effectiveForce', label: 'Effective force along the motion (F cos θ)', dimension: 'force', unit: 'N', compute: (si) => si.force * Math.cos(si.angle) }],
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
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen energy unit, alongside the effective force (F cos θ) that actually acts along the direction of motion, with the scale below placing the work among a few everyday reference points.' }
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
        { question: 'How is work different from power?', answer: 'Work has no time component — it only depends on force, distance and angle. Power is the rate at which work is done, work divided by the time it takes.' },
        { question: 'How much of a 50 N pull at 30° actually acts along the motion?', answer: 'The effective force is F cos θ = 50 × cos 30° ≈ 43.3 N — shown as a bonus figure next to the work. It is this smaller, aligned force that the work formula actually multiplies by distance; the rest of the 50 N pulls uselessly up out of the direction of travel.' }
      ]
    },
    compute(values) {
      return { work: values.force * values.distance * Math.cos(values.angle) };
    }
  },
  {
    id: 'momentum-calculator',
    category: 'physics',
    group: 'Motion & Forces',
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
      outputs: [{ id: 'kineticEnergy', label: 'Kinetic energy (KE = ½mv²)', dimension: 'energy', unit: 'J', compute: (si) => 0.5 * si.mass * si.velocity * si.velocity }],
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
          { name: 'Read the result and the scale', text: 'The answer shows in your chosen unit, alongside the kinetic energy that same mass and velocity carry, with the scale below placing the momentum among a few everyday moving objects.' },
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
        { question: 'What is the relationship between momentum and impulse?', answer: 'The impulse-momentum theorem states that the impulse delivered to an object equals its change in momentum, J = Δp. See the impulse calculator for the force-and-time side of that relationship.' },
        { question: 'What kinetic energy does a 1,500 kg car at 20 m/s have, alongside its momentum?', answer: 'KE = ½ × m × v² = 0.5 × 1,500 × 20² = 300,000 J — shown as a bonus figure next to the 30,000 kg·m/s of momentum. The two describe the same motion differently: momentum scales with speed, kinetic energy with speed squared.' }
      ]
    },
    compute(values) {
      return { momentum: values.mass * values.velocity };
    }
  },
  {
    id: 'impulse-calculator',
    category: 'physics',
    group: 'Motion & Forces',
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
    group: 'Energy & Work',
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
    group: 'Fluids & Matter',
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
    group: 'Fluids & Matter',
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
    group: 'Electricity & Circuits',
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
    group: 'Electricity & Circuits',
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
    group: 'Electricity & Circuits',
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
    group: 'Electricity & Circuits',
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
    group: 'Electricity & Circuits',
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
    group: 'Waves & Light',
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
      outputs: [{ id: 'period', label: 'Period (T = 1 ÷ f)', dimension: 'time', unit: 's', compute: (si) => (si.frequency === 0 ? NaN : 1 / si.frequency) }],
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
          { name: 'Read the result and the scale', text: 'The answer appears in your chosen unit, alongside the period (the time for one full cycle). The scale shows where your frequency sits among the radio, Wi-Fi, visible-light and X-ray bands.' }
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
        { question: 'How are frequency and period related?', answer: 'They are reciprocals: f = 1 ÷ T. A wave with a period of 0.01 seconds has a frequency of 1 ÷ 0.01 = 100 Hz.' },
        { question: 'What is the period of a 100 MHz radio wave?', answer: 'T = 1 ÷ f = 1 ÷ 100,000,000 = 1 × 10⁻⁸ s (10 nanoseconds) — shown as a bonus figure next to the wavelength, since it follows directly from the frequency already solved.' }
      ]
    },
    compute(values) {
      return { wavelength: values.frequency === 0 ? NaN : values.speed / values.frequency };
    }
  },
  {
    id: 'decibel-calculator',
    category: 'physics',
    group: 'Waves & Light',
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
      },
      outputs: [{ id: 'powerRatio', label: 'Power ratio (P₂ ÷ P₁)', dimension: 'count', compute: (si) => (si.inputPower <= 0 ? NaN : si.outputPower / si.inputPower) }]
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
          { name: 'Read the result', text: 'The decibel field shows how many dB higher (positive) or lower (negative) the measured power is than the reference, alongside the plain power ratio (P₂ ÷ P₁) that same dB figure represents.' }
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
        { question: 'How many decibels is a normal conversation?', answer: 'About 60 dB, measured against the standard reference intensity for sound, 1 × 10⁻¹² W/m². A conversation at roughly 1 µW/m² gives 10 × log₁₀(10⁻⁶ ÷ 10⁻¹²) = 60 dB exactly.' },
        { question: 'What plain power ratio does 10 dB represent?', answer: 'Ratio = 10^(dB ÷ 10). For the 10 dB worked example, that is 10^1 = 10 — the output power is exactly 10 times the reference, shown as a bonus figure next to the dB value.' }
      ]
    },
    compute(values) {
      return { decibels: values.inputPower <= 0 || values.outputPower <= 0 ? NaN : 10 * Math.log10(values.outputPower / values.inputPower) };
    }
  },
  {
    id: 'radioactive-half-life-calculator',
    category: 'physics',
    group: 'Thermal & Nuclear',
    glyph: 't½',
    updatedAt: '2026-11-06',
    aliases: ['half life calculator', 'radioactive decay calculator', 'half-life formula calculator', 'decay calculator', 'carbon dating calculator', 'exponential decay calculator'],
    related: ['reaction-half-life-calculator', 'exponent-calculator', 'logarithm-calculator', 'heat-calculator'],
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
  },
  {
    id: 'heat-calculator',
    category: 'physics',
    group: 'Thermal & Nuclear',
    glyph: 'Q',
    updatedAt: '2026-11-06',
    aliases: ['heat calculator', 'specific heat calculator', 'q = mc delta t calculator', 'heat energy calculator', 'thermal energy calculator', 'heat transfer calculator'],
    related: ['energy-converter', 'ac-tonnage-btu-calculator', 'kinetic-energy-calculator', 'radioactive-half-life-calculator'],
    title: 'Heat Calculator (Q = mcΔT)',
    description: "Solve Q = m × c × ΔT for the heat energy needed to change a substance's temperature, or solve backward for mass, specific heat, or temperature change.",
    example: "Heating 2 kg of water by 20°C takes about 167.4 kJ, using water's specific heat of 4,186 J/(kg·K).",
    solver: {
      defaultTarget: 'heat',
      variables: [
        { id: 'heat', label: 'Heat energy', symbol: 'Q', dimension: 'energy', defaultValue: 167440, defaultUnit: 'J' },
        { id: 'mass', label: 'Mass', symbol: 'm', dimension: 'mass', defaultValue: 2, defaultUnit: 'kg' },
        { id: 'specificHeat', label: 'Specific heat', symbol: 'c', dimension: 'specificHeat', defaultValue: 4186, defaultUnit: 'J/kgK' },
        { id: 'deltaT', label: 'Temperature change', symbol: 'ΔT', dimension: 'temperatureDelta', defaultValue: 20, defaultUnit: 'C' }
      ],
      solve: {
        heat: ({ mass, specificHeat, deltaT }) => mass * specificHeat * deltaT,
        mass: ({ heat, specificHeat, deltaT }) => (specificHeat * deltaT === 0 ? NaN : heat / (specificHeat * deltaT)),
        specificHeat: ({ heat, mass, deltaT }) => (mass * deltaT === 0 ? NaN : heat / (mass * deltaT)),
        deltaT: ({ heat, mass, specificHeat }) => (mass * specificHeat === 0 ? NaN : heat / (mass * specificHeat))
      }
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is heat (Q = mcΔT)?',
        paragraphs: [
          'Heat is energy transferred into or out of something, and raising a temperature always takes energy. How much depends on three things: how much substance there is (mass, m), what it is made of (specific heat capacity, c), and how big a temperature change is wanted (ΔT). The formula Q = m × c × ΔT ties all three together — more mass, a bigger temperature swing, or a substance that resists warming each demand more heat energy.',
          "Specific heat capacity is a property of the material itself: how many joules it takes to raise one kilogram of it by one kelvin. Water has an unusually high specific heat, about 4,186 J/(kg·K) — compare that to aluminum, around 897 J/(kg·K), which takes less than a quarter as much energy to warm by the same amount. This is the reason water heats up and cools down slowly compared to metal, and part of why coastal climates are milder than inland ones at the same latitude.",
          'This formula only holds while the substance stays in one phase — solid, liquid, or gas — and simply gets warmer or cooler. Melting ice or boiling water takes a different kind of energy entirely, latent heat, which goes into changing phase rather than changing temperature, and needs its own formula (Q = mL) rather than this one.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of heat energy, mass, specific heat, and temperature change; the fourth fills in automatically.',
        steps: [
          { name: "Look up the substance's specific heat", text: "Specific heat varies by material — water is 4,186 J/(kg·K), common values for metals, rocks and other substances are listed in standard physics references. Use the right one for what's being heated." },
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit. The field left over, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 167,440 J becomes 167.44 kJ instead of silently turning into 167,440 kJ.' },
          { name: 'Read the result', text: 'The heat energy appears in your chosen unit — joules, kilojoules, kilocalories, or BTU.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The heat formula rearranges three ways, one for each quantity you might be solving for.',
        expression: 'Q = m × c × ΔT\nm = Q ÷ (c × ΔT)\nc = Q ÷ (m × ΔT)\nΔT = Q ÷ (m × c)',
        terms: [
          { symbol: 'Q', meaning: 'Heat energy transferred, in joules (J). Also commonly shown in kilojoules, kilocalories, or BTU.' },
          { symbol: 'm', meaning: 'The mass of the substance being heated or cooled, in kilograms (kg).' },
          { symbol: 'c', meaning: "The substance's specific heat capacity, in joules per kilogram-kelvin (J/(kg·K)) — how much energy it takes to raise 1 kg of it by 1 K." },
          { symbol: 'ΔT', meaning: 'The temperature CHANGE, not a temperature reading — the difference between the final and starting temperature, in kelvin or °C (the two are the same size as a change, unlike °F).' }
        ],
        note: 'Mass, specific heat, and heat energy are converted to SI (kg, J/(kg·K), J) before solving; ΔT is converted as an interval, not an absolute reading, since a temperature change has no offset to apply.'
      },
      workedExample: {
        intro: 'How much heat does it take to warm 2 kg of water by 20°C?',
        rows: [
          { label: 'Mass (m)', value: '2 kg' },
          { label: "Specific heat of water (c)", value: '4,186 J/(kg·K)' },
          { label: 'Temperature change (ΔT)', value: '20°C (= 20 K)' },
          { label: 'Heat (Q = 2 × 4,186 × 20)', value: '167,440 J' }
        ],
        result: 'Q ≈ 167.44 kJ (≈ 40.0 kcal, ≈ 158.7 BTU)',
        explanation: '2 × 4,186 × 20 = 167,440 J, or 167.44 kJ. In food Calories (kcal), that is 167,440 ÷ 4,184 ≈ 40.0 kcal — about the energy in a small snack. In BTU, 167,440 ÷ 1,055.06 ≈ 158.7 BTU.'
      },
      watchOut: [
        {
          title: 'ΔT is a change, not a reading',
          body: "Heating water from 20°C to 40°C gives ΔT = 20, not 40. Plugging in a final temperature instead of the difference between two temperatures overstates the heat needed by a lot."
        },
        {
          title: 'This formula only applies within one phase',
          body: "Q = mcΔT describes a substance warming or cooling as a solid, liquid, or gas. The energy needed to melt ice or boil water (latent heat) is a separate quantity entirely, given by Q = mL with a substance-specific latent heat L, not by raising the temperature further."
        },
        {
          title: 'Specific heat is different for every substance',
          body: "Water's specific heat, 4,186 J/(kg·K), is unusually high — most metals are well under a quarter of that (aluminum is about 897 J/(kg·K)). Using the wrong c for the material gives a heat figure that can be off by several times."
        },
        {
          title: 'A 1°C change equals a 1 K change — a 1°F change does not',
          body: 'This is a temperature interval, not an absolute reading: 1°C and 1 K describe the same-sized step, but 1°F is only 5/9 of that step. An 18°F change converts to exactly 10°C (or 10 K) of change — a different conversion from converting an absolute temperature reading, which also shifts by an offset.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 2, §1.3 Heat, Specific Heat, and Heat Transfer', url: 'https://openstax.org/books/university-physics-volume-2/pages/1-3-heat-specific-heat-and-heat-transfer' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass (kg)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.1, min: 0 },
      { id: 'specificHeat', label: 'Specific heat (J/(kg·K))', type: 'number', placeholder: '4186', defaultValue: 4186, step: 1, min: 0 },
      { id: 'deltaT', label: 'Temperature change (°C)', type: 'number', placeholder: '20', defaultValue: 20, step: 0.1 }
    ],
    seo: {
      title: 'Heat Calculator (Q = mcΔT) – Specific Heat Formula',
      description: 'Free heat calculator. Solve Q = m × c × ΔT for heat energy, mass, specific heat, or temperature change in J, kJ, kcal or BTU, with a worked example.',
      faq: [
        { question: 'What is the heat formula Q = mcΔT?', answer: 'It calculates the heat energy (Q) needed to change a substance\'s temperature: mass (m) times specific heat capacity (c) times the temperature change (ΔT).' },
        { question: 'How much heat does it take to warm 2 kg of water by 20°C?', answer: '2 × 4,186 × 20 = 167,440 J, or about 167.44 kJ (roughly 40.0 kcal).' },
        { question: 'What is specific heat capacity?', answer: "A material property: how much energy (in J) it takes to raise 1 kg of that substance by 1 K. Water's is unusually high, about 4,186 J/(kg·K); most metals are well under a quarter of that." },
        { question: 'How do I find mass from heat, specific heat, and temperature change?', answer: 'Divide heat by the product of specific heat and temperature change: m = Q ÷ (c × ΔT).' },
        { question: 'Does Q = mcΔT work for melting ice or boiling water?', answer: 'No. Melting and boiling are phase changes that take latent heat (Q = mL), a different formula — Q = mcΔT only applies while the substance stays solid, liquid, or gas without changing phase.' },
        { question: 'Why does water have such a high specific heat?', answer: "It takes about 4,186 J to raise 1 kg of water by 1 K, versus about 897 J for the same mass of aluminum — more than four times as much. That's why large bodies of water heat up and cool down slowly, moderating nearby climates." },
        { question: 'Is a temperature change of 1°C the same as 1 kelvin?', answer: 'Yes — a 1°C change and a 1 K change are the exact same size. A 1°F change is smaller, exactly 5/9 of a kelvin, since the Fahrenheit scale divides the same range into more degrees.' }
      ]
    },
    compute(values) {
      return { heat: values.mass * values.specificHeat * values.deltaT };
    }
  },
  {
    id: 'lens-mirror-equation-calculator',
    category: 'physics',
    group: 'Waves & Light',
    glyph: '1/f',
    updatedAt: '2026-11-06',
    aliases: ['lens equation calculator', 'mirror equation calculator', 'thin lens calculator', 'focal length calculator', 'image distance calculator', 'object distance calculator'],
    related: ['wavelength-frequency-calculator', 'decibel-calculator', 'length-converter', 'heat-calculator'],
    title: 'Lens and Mirror Equation Calculator',
    description: 'Solve 1/f = 1/dₒ + 1/dᵢ for focal length, object distance, or image distance — the same formula describes both converging lenses and curved mirrors.',
    example: 'A lens with a 10 cm focal length and an object 30 cm away forms a real, inverted image 15 cm away, at half size.',
    solver: {
      defaultTarget: 'imageDistance',
      variables: [
        { id: 'focalLength', label: 'Focal length', symbol: 'f', dimension: 'length', defaultValue: 10, defaultUnit: 'cm' },
        { id: 'objectDistance', label: 'Object distance', symbol: 'dₒ', dimension: 'length', defaultValue: 30, defaultUnit: 'cm' },
        { id: 'imageDistance', label: 'Image distance', symbol: 'dᵢ', dimension: 'length', defaultValue: 15, defaultUnit: 'cm' }
      ],
      solve: {
        imageDistance: ({ focalLength, objectDistance }) => (objectDistance - focalLength === 0 ? NaN : (focalLength * objectDistance) / (objectDistance - focalLength)),
        objectDistance: ({ focalLength, imageDistance }) => (imageDistance - focalLength === 0 ? NaN : (focalLength * imageDistance) / (imageDistance - focalLength)),
        focalLength: ({ objectDistance, imageDistance }) => (objectDistance + imageDistance === 0 ? NaN : (objectDistance * imageDistance) / (objectDistance + imageDistance))
      },
      outputs: [{ id: 'magnification', label: 'Magnification (m)', dimension: 'count', compute: (si) => (si.objectDistance === 0 ? NaN : -si.imageDistance / si.objectDistance) }]
    },
    content: {
      lastReviewed: '2026-11-06',
      concept: {
        title: 'What is the lens and mirror equation?',
        paragraphs: [
          'A thin converging lens and a curved spherical mirror both focus light according to the exact same formula: 1/f = 1/dₒ + 1/dᵢ. f is the focal length (how strongly the lens or mirror bends light), dₒ is how far the object sits from it, and dᵢ is how far away the image forms. Both distances are measured from the center of the lens or mirror, using the standard convention that a real object or image gives a positive distance.',
          "The result's sign tells you what kind of image forms. A positive dᵢ means a real image — one light rays actually converge to form, which could be projected onto a screen. A negative dᵢ means a virtual image: light only appears to come from that point, the way a magnifying glass makes text look larger without rays actually crossing there. Magnification, m = −dᵢ ÷ dₒ, adds the rest of the picture: a negative m means the image is upside down (inverted), and |m| above or below 1 says whether it is enlarged or shrunk.",
          "Whether the object sits closer than or farther than the focal length changes everything. An object farther than f (as in a camera or the human eye) forms a real, inverted image on the far side. An object closer than f — exactly how a magnifying glass is used — forms a virtual, upright, enlarged image on the same side as the object instead, which is why dᵢ comes out negative in that case."
        ]
      },
      howTo: {
        intro: 'Fill in any two of focal length, object distance, and image distance; the third fills in automatically.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 10 cm becomes 100 mm instead of silently turning into 10 mm.' },
          { name: 'Read the result and the magnification', text: 'The distance appears in your chosen unit. A negative value means a virtual image. The magnification underneath shows whether the image is upright or inverted, and enlarged or reduced.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The lens and mirror equation rearranges three ways, one for each distance you might be solving for.',
        expression: '1/f = 1/dₒ + 1/dᵢ\ndᵢ = (f × dₒ) ÷ (dₒ − f)\ndₒ = (f × dᵢ) ÷ (dᵢ − f)\nf = (dₒ × dᵢ) ÷ (dₒ + dᵢ)',
        terms: [
          { symbol: 'f', meaning: 'Focal length — positive for a converging lens or concave mirror, negative for a diverging lens or convex mirror.' },
          { symbol: 'dₒ', meaning: 'Object distance from the lens or mirror, conventionally positive for a real object in front of it.' },
          { symbol: 'dᵢ', meaning: 'Image distance. Positive is a real image; negative is a virtual image.' },
          { symbol: 'm = −dᵢ ÷ dₒ', meaning: 'Magnification, shown as a bonus output: negative means inverted, positive means upright; a magnitude above 1 means enlarged.' }
        ],
        note: 'All three distances are converted to the same SI unit (meters) before solving and converted back afterward, so mixing centimeters and millimeters is handled automatically.'
      },
      workedExample: {
        intro: 'A converging lens has a 10 cm focal length. An object sits 30 cm in front of it. Where does the image form, and what does it look like?',
        rows: [
          { label: 'Focal length (f)', value: '10 cm' },
          { label: 'Object distance (dₒ)', value: '30 cm' },
          { label: 'Image distance (dᵢ = (10 × 30) ÷ (30 − 10))', value: '300 ÷ 20 = 15 cm' },
          { label: 'Magnification (m = −15 ÷ 30)', value: '−0.5' }
        ],
        result: 'dᵢ = 15 cm · m = −0.5 (real, inverted, half size)',
        explanation: 'The image forms 15 cm on the far side of the lens — a positive distance, so it is real. The magnification works out to −0.5: negative means inverted (upside down), and a magnitude of 0.5 means it is half the size of the object. Had the object instead been placed only 5 cm away (inside the focal length), the same formula gives dᵢ = (10 × 5) ÷ (5 − 10) = −10 cm — a virtual, upright image, the way a magnifying glass works.'
      },
      watchOut: [
        {
          title: 'A negative result is not an error — it means a virtual image',
          body: "This equation uses a sign convention: a negative image distance (or a negative focal length) is a legitimate answer describing a virtual image or a diverging lens/mirror, not a mistake to be corrected to positive."
        },
        {
          title: 'An object exactly at the focal length has no finite image distance',
          body: "Placing an object exactly at f sends light out parallel on the other side — the image forms at infinity, not at some large-but-finite distance. The formula's denominator (dₒ − f) becomes 0, which this calculator reports as no answer rather than a wrong number."
        },
        {
          title: 'This is the thin-lens, paraxial approximation',
          body: "The formula assumes a lens thin enough that its own thickness doesn't matter, and light rays close to the central axis (small angles). Thick lenses, wide-aperture mirrors, and rays far from the axis need more advanced optics to describe accurately."
        },
        {
          title: 'The same equation works for mirrors, with f tied to the radius of curvature',
          body: 'For a spherical mirror, f = R ÷ 2, where R is the mirror\'s radius of curvature. A concave mirror has a positive f (like a converging lens); a convex mirror has a negative f (like a diverging lens) — enter whichever one applies and the rest of the formula is identical.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 3, §2.2 Spherical Mirrors', url: 'https://openstax.org/books/university-physics-volume-3/pages/2-2-spherical-mirrors' },
        { label: 'OpenStax, University Physics Volume 3, §2.4 Thin Lenses', url: 'https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses' }
      ]
    },
    inputs: [
      { id: 'focalLength', label: 'Focal length (cm)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.1 },
      { id: 'objectDistance', label: 'Object distance (cm)', type: 'number', placeholder: '30', defaultValue: 30, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Lens & Mirror Equation Calculator (1/f = 1/dₒ + 1/dᵢ)',
      description: 'Free lens and mirror equation calculator. Solve 1/f = 1/dₒ + 1/dᵢ for focal length, object distance, or image distance, with magnification and a worked example.',
      faq: [
        { question: 'What is the lens and mirror equation?', answer: '1/f = 1/dₒ + 1/dᵢ, where f is the focal length, dₒ is the object distance, and dᵢ is the image distance. The identical formula describes thin lenses and curved mirrors.' },
        { question: 'How do I find image distance from focal length and object distance?', answer: 'dᵢ = (f × dₒ) ÷ (dₒ − f). A 10 cm focal length with an object 30 cm away gives dᵢ = (10 × 30) ÷ (30 − 10) = 15 cm.' },
        { question: 'What does a negative image distance mean?', answer: 'A virtual image — one that only appears to be at that location, the way a magnifying glass makes text look bigger without light rays actually converging there.' },
        { question: 'How do I calculate magnification?', answer: 'm = −dᵢ ÷ dₒ. With dᵢ = 15 cm and dₒ = 30 cm, m = −15 ÷ 30 = −0.5: the image is inverted (negative sign) and half the size (magnitude 0.5).' },
        { question: 'Does the lens equation also work for mirrors?', answer: 'Yes. A spherical mirror uses the identical equation, with its focal length related to its radius of curvature by f = R ÷ 2.' },
        { question: 'What happens when the object is exactly at the focal length?', answer: "There is no finite image distance — the equation's denominator becomes zero, because light leaving the lens or mirror comes out parallel, forming an image only at infinity." },
        { question: 'How do I find the object distance from focal length and image distance?', answer: 'dₒ = (f × dᵢ) ÷ (dᵢ − f), the same equation rearranged for the other distance.' }
      ]
    },
    compute(values) {
      return { imageDistance: values.objectDistance - values.focalLength === 0 ? NaN : (values.focalLength * values.objectDistance) / (values.objectDistance - values.focalLength) };
    }
  },
  {
    id: 'acceleration-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'a',
    updatedAt: '2026-11-16',
    aliases: ['a = delta v over t calculator', 'rate of change of velocity calculator', 'how to calculate acceleration', 'average acceleration calculator', 'change in velocity calculator'],
    related: ['force-calculator', 'speed-distance-time-calculator', 'free-fall-calculator'],
    title: 'Acceleration Calculator (a = Δv ÷ t)',
    description: 'Calculate acceleration from a change in velocity and the time it took — a = Δv ÷ t — or solve backward for the velocity change or the time, in any speed and time unit.',
    example: 'A car speeds up by 20 m/s (72 km/h) in 5 seconds, so its average acceleration is 4 m/s².',
    solver: {
      defaultTarget: 'acceleration',
      variables: [
        { id: 'acceleration', label: 'Acceleration', symbol: 'a', dimension: 'acceleration', defaultValue: 4, defaultUnit: 'm/s2' },
        { id: 'velocityChange', label: 'Change in velocity (Δv)', symbol: 'Δv', dimension: 'speed', defaultValue: 20, defaultUnit: 'm/s' },
        { id: 'time', label: 'Time', symbol: 't', dimension: 'time', defaultValue: 5, defaultUnit: 's' }
      ],
      solve: {
        acceleration: ({ velocityChange, time }) => (time === 0 ? NaN : velocityChange / time),
        velocityChange: ({ acceleration, time }) => acceleration * time,
        time: ({ acceleration, velocityChange }) => (acceleration === 0 ? NaN : velocityChange / acceleration)
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is acceleration?',
        paragraphs: [
          'Acceleration is how quickly velocity changes. It does not measure speed itself — it measures how fast that speed is rising or falling. A car cruising at a steady 100 km/h has zero acceleration no matter how fast it is going, while the same car speeding up from a stoplight has a large acceleration even though its speed at any one instant might be small.',
          "The average acceleration over an interval is the change in velocity divided by the time that change took: a = Δv ÷ t, where Δv = v_f − v_i is the final velocity minus the initial velocity. A positive Δv over a positive time gives a positive acceleration (speeding up in the direction of motion); a negative Δv gives a negative acceleration, commonly called deceleration when it slows something down.",
          "The SI unit of acceleration is meters per second squared (m/s²), read as 'meters per second, per second' — each second, the velocity itself changes by that many meters per second. Standard gravity, 9.80665 m/s², is one familiar reference point: a falling object speeds up by about 9.8 m/s every second it falls."
        ]
      },
      howTo: {
        intro: 'Fill in any two of acceleration, the change in velocity, and time; the third fills in automatically — the same page finds how fast something sped up, how much its speed changed, or how long a change in speed took.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field you have left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 20 m/s becomes 72 km/h instead of silently turning into 20 km/h.' },
          { name: 'Finding Δv from two speeds', text: 'If you know an initial and a final speed instead of the change directly, subtract them first (final minus initial) and enter that as Δv.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Average acceleration rearranges three ways, one for each quantity you might be solving for.',
        expression: 'a = Δv ÷ t\nΔv = a × t\nt = Δv ÷ a',
        terms: [
          { symbol: 'a', meaning: 'Average acceleration, in meters per second squared (m/s²).' },
          { symbol: 'Δv', meaning: 'Change in velocity, v_f − v_i, in meters per second (m/s). Final velocity minus initial velocity.' },
          { symbol: 't', meaning: 'The time over which that change happened, in seconds (s).' }
        ],
        note: 'Every input is converted to SI units (m/s², m/s, s) before solving and converted back afterward, so mixing km/h with seconds or minutes cannot produce a wrong result.'
      },
      workedExample: {
        intro: 'A car speeds up from 5 m/s to 25 m/s over 5 seconds. What is its average acceleration?',
        rows: [
          { label: 'Initial velocity (v_i)', value: '5 m/s' },
          { label: 'Final velocity (v_f)', value: '25 m/s' },
          { label: 'Change in velocity (Δv = 25 − 5)', value: '20 m/s' },
          { label: 'Time (t)', value: '5 s' },
          { label: 'Acceleration (a = 20 ÷ 5)', value: '4 m/s²' }
        ],
        result: 'a = 4 m/s²',
        explanation: '20 m/s of velocity change (72 km/h) over 5 seconds gives 20 ÷ 5 = 4 m/s². Each second, the car gains another 4 m/s of speed — so after 1 more second it would be at 29 m/s, assuming the acceleration stays constant.'
      },
      watchOut: [
        {
          title: 'Acceleration needs a change in velocity, not a velocity itself',
          body: 'A speed reading alone, like "60 mph," tells you nothing about acceleration. You need two velocities (or the difference between them) and the time the change took.'
        },
        {
          title: 'A negative result means slowing down, not an error',
          body: 'If the final velocity is lower than the initial one, Δv is negative and so is the acceleration — this is a legitimate deceleration, not a mistake to flip to positive.'
        },
        {
          title: 'This is an average over the interval',
          body: "Real acceleration can vary moment to moment — harder off the line, gentler near top speed. a = Δv ÷ t gives the average over the whole interval, not the acceleration at any one instant."
        },
        {
          title: 'Acceleration is a vector; this calculator works with magnitudes along one line',
          body: 'Speeding up, slowing down, and turning are all acceleration. This page handles straight-line (one-dimensional) changes in speed; a turn at constant speed still accelerates, but needs a different (centripetal) calculation.'
        },
        {
          title: 'Not the same as force',
          body: 'Acceleration only needs velocity and time. Finding the force behind it needs the mass too — see the force calculator for F = m × a.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §3.3 Average and Instantaneous Acceleration', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-3-average-and-instantaneous-acceleration' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'velocityChange', label: 'Change in velocity (m/s)', type: 'number', placeholder: '20', defaultValue: 20, step: 0.1 },
      { id: 'time', label: 'Time (s)', type: 'number', placeholder: '5', defaultValue: 5, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Acceleration Calculator (a = Δv ÷ t)',
      description: 'Free acceleration calculator. Solve a = Δv ÷ t for acceleration, change in velocity, or time, in m/s², km/h, mph, and more, with a worked example.',
      faq: [
        { question: 'What is the formula for acceleration?', answer: 'a = Δv ÷ t, where Δv is the change in velocity (final minus initial) and t is the time that change took. The result is in meters per second squared when Δv is in m/s and t is in seconds.' },
        { question: 'How do I find the change in velocity (Δv)?', answer: 'Subtract the initial velocity from the final velocity: Δv = v_f − v_i. A car going from 5 m/s to 25 m/s has Δv = 25 − 5 = 20 m/s.' },
        { question: 'How do I calculate acceleration from two speeds and a time?', answer: 'Find Δv first (final speed minus initial speed), then divide by the time. 5 m/s to 25 m/s in 5 seconds gives Δv = 20 m/s, so a = 20 ÷ 5 = 4 m/s².' },
        { question: 'What does a negative acceleration mean?', answer: 'The velocity is decreasing — the object is slowing down (or speeding up in the opposite direction). It is a normal result, not an error.' },
        { question: 'What are the units of acceleration?', answer: 'The SI unit is meters per second squared (m/s²). Other common units include feet per second squared (ft/s²) and "g" (multiples of standard gravity, 9.80665 m/s²).' },
        { question: 'How is acceleration different from velocity?', answer: 'Velocity measures how fast something is moving; acceleration measures how fast that velocity itself is changing. A car at a steady 100 km/h has a velocity but zero acceleration.' }
      ]
    },
    compute(values) {
      return { acceleration: values.time === 0 ? NaN : values.velocityChange / values.time };
    }
  },
  {
    id: 'free-fall-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'h',
    updatedAt: '2026-11-16',
    aliases: ['falling object calculator', 'h = 1/2 gt^2 calculator', 'drop time calculator', 'distance fallen calculator', 'time to hit the ground calculator'],
    related: ['weight-calculator', 'potential-energy-calculator', 'acceleration-calculator', 'projectile-motion-calculator'],
    title: 'Free Fall Calculator (h = ½gt²)',
    description: 'Calculate how far an object falls from rest in a given time — h = ½ × g × t² — or solve backward for the fall time or gravity, with the final speed shown alongside.',
    example: 'Dropped from rest, an object falls about 44.13 m in 3 seconds on Earth, hitting the ground at about 29.42 m/s.',
    solver: {
      defaultTarget: 'height',
      variables: [
        { id: 'height', label: 'Distance fallen', symbol: 'h', dimension: 'length', defaultValue: 44.13, defaultUnit: 'm' },
        { id: 'time', label: 'Fall time', symbol: 't', dimension: 'time', defaultValue: 3, defaultUnit: 's' },
        { id: 'gravity', label: 'Gravity', symbol: 'g', dimension: 'acceleration', defaultValue: STANDARD_GRAVITY, defaultUnit: 'm/s2' }
      ],
      solve: {
        height: ({ time, gravity }) => 0.5 * gravity * time * time,
        time: ({ height, gravity }) => (gravity <= 0 ? NaN : Math.sqrt((2 * height) / gravity)),
        gravity: ({ height, time }) => (time === 0 ? NaN : (2 * height) / (time * time))
      },
      outputs: [{ id: 'finalVelocity', label: 'Speed at impact (v = gt)', dimension: 'speed', unit: 'm/s', compute: (si) => si.gravity * si.time }]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is free fall?',
        paragraphs: [
          "Free fall is motion under gravity alone, with no air resistance or other force slowing it down. Dropped from rest near Earth's surface, an object picks up speed at a constant rate — about 9.80665 meters per second, every second — so the distance it covers grows with the square of the time, not in a straight line.",
          'That relationship, h = ½gt², comes directly from the constant-acceleration kinematics used for any object speeding up (or slowing down) at a steady rate, with the initial velocity set to zero because the object starts at rest. The companion formula for the speed it reaches, v = g × t, grows in a straight line with time instead — twice the fall time means twice the final speed, but four times the distance fallen.',
          "This calculator assumes a vacuum-like fall with no air resistance, which is accurate for dense, compact objects (a dropped wrench, a coin) over the kinds of heights people usually ask about. A feather or a sheet of paper falls far more slowly in real air, because drag becomes significant relative to its weight."
        ]
      },
      howTo: {
        intro: 'Fill in any two of the distance fallen, the fall time, and gravity; the third fills in automatically, alongside the speed at impact.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type. Leave gravity at 9.80665 m/s² for Earth.' },
          { name: 'Try another world', text: "Replace gravity with another body's surface value — 1.62 m/s² for the Moon, for example — to see how the same drop plays out elsewhere." },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result and the impact speed', text: 'The distance appears in your chosen unit, with the speed at impact (v = gt) shown alongside it.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Starting from rest, the fall distance and fall time rearrange both ways; the impact speed follows from the same two quantities.',
        expression: 'h = ½ × g × t²\nt = √(2h ÷ g)\ng = 2h ÷ t²\nv = g × t',
        terms: [
          { symbol: 'h', meaning: 'Distance fallen, in meters (m), starting from rest.' },
          { symbol: 't', meaning: 'Time spent falling, in seconds (s).' },
          { symbol: 'g', meaning: 'Gravitational acceleration, in m/s². Standard gravity on Earth is exactly 9.80665 m/s² by definition.' },
          { symbol: 'v', meaning: 'Speed at the moment of impact, in m/s, shown as a bonus output alongside the distance.' }
        ],
        note: 'This assumes the object starts from rest (no initial velocity) and falls with no air resistance. Every input is converted to SI units (m, s, m/s²) before solving and converted back afterward.'
      },
      workedExample: {
        intro: 'An object is dropped from rest and falls for 3 seconds. How far does it fall, and how fast is it moving when it lands?',
        rows: [
          { label: 'Fall time (t)', value: '3 s' },
          { label: 'Gravity (g)', value: '9.80665 m/s²' },
          { label: 'Distance fallen (h = 0.5 × 9.80665 × 3²)', value: '44.13 m' },
          { label: 'Impact speed (v = 9.80665 × 3)', value: '29.42 m/s' }
        ],
        result: 'h ≈ 44.13 m · v ≈ 29.42 m/s',
        explanation: '0.5 × 9.80665 × 9 = 44.13 m — about the height of a 13-story building. The impact speed, 9.80665 × 3 = 29.42 m/s, is about 106 km/h. On the Moon, where gravity is about 1.62 m/s², the same 3-second fall covers only about 7.29 m and lands at about 4.86 m/s, because gravity there pulls roughly six times more weakly.'
      },
      watchOut: [
        {
          title: 'This is "from rest" — a thrown or dropped-with-speed object needs a different formula',
          body: 'h = ½gt² only applies when the object starts with zero velocity. Something thrown downward (or upward) starts with an initial velocity that has to be added in separately; this calculator does not cover that case.'
        },
        {
          title: 'Real falls include air resistance',
          body: "A dense, compact object (a stone, a hammer) falls close to this ideal for ordinary heights. A light or spread-out object (a leaf, a sheet of paper, a parachute) reaches a much lower top speed because air drag pushes back hard enough to matter — this formula does not account for that."
        },
        {
          title: "\"g\" is standard gravity, not the exact local value",
          body: "9.80665 m/s² is the internationally adopted reference value. Real gravity on Earth varies slightly by latitude and altitude, from about 9.78 m/s² to about 9.83 m/s² — close enough for this not to matter for everyday drops."
        },
        {
          title: 'Distance and speed grow at different rates',
          body: 'Doubling the fall time quadruples the distance fallen (time is squared) but only doubles the impact speed (time appears once). A fall twice as long covers four times the distance but lands only twice as fast.'
        },
        {
          title: 'Not the same as weight or potential energy',
          body: 'This calculator finds distance and time for a falling object, not the force of gravity on it (see the weight calculator, W = mg) or the energy it has stored by virtue of height (see the potential energy calculator, PE = mgh).'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §3.5 Free Fall', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-5-free-fall' },
        { label: 'NASA, Moon Fact Sheet (surface gravity)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'time', label: 'Fall time (s)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'gravity', label: 'Gravity (m/s²)', type: 'number', placeholder: '9.80665', defaultValue: STANDARD_GRAVITY, step: 0.01 }
    ],
    seo: {
      title: 'Free Fall Calculator (h = ½gt²) – Distance, Time & Speed',
      description: 'Free fall calculator. Solve h = ½gt² for distance fallen, fall time, or gravity, with the impact speed (v = gt) shown, and a worked example.',
      faq: [
        { question: 'What is the formula for free fall distance?', answer: 'h = ½ × g × t², where g is gravitational acceleration and t is the fall time, for an object starting from rest. On Earth (g = 9.80665 m/s²), a 3-second fall covers about 44.13 m.' },
        { question: 'How do I find how long an object takes to fall a given distance?', answer: 't = √(2h ÷ g). A 44.13 m fall on Earth takes √(2 × 44.13 ÷ 9.80665) = 3 seconds.' },
        { question: 'How fast is something moving when it hits the ground?', answer: 'v = g × t, for an object dropped from rest. Falling for 3 seconds on Earth reaches about 9.80665 × 3 = 29.42 m/s, roughly 106 km/h.' },
        { question: 'Does this formula work for something thrown, not just dropped?', answer: 'No. h = ½gt² assumes zero initial velocity. An object thrown downward or upward starts with its own velocity that has to be added separately, which this calculator does not include.' },
        { question: 'Does air resistance change the answer?', answer: 'Yes, for light or spread-out objects. This formula assumes no air resistance, which is accurate for dense, compact objects over ordinary heights but overestimates the speed of something like a feather or a sheet of paper.' },
        { question: 'How far would something fall on the Moon in 3 seconds?', answer: "With the Moon's gravity of about 1.62 m/s², h = 0.5 × 1.62 × 3² = 7.29 m — about a sixth of the roughly 44.13 m the same 3-second fall covers on Earth, because the Moon's gravity is about six times weaker." },
        { question: 'What is the difference between free fall and weight?', answer: 'Free fall (this calculator) finds the distance and speed of a falling object over time. Weight (W = mg, a separate calculator) finds the force gravity exerts on a mass — a different question with a different formula.' }
      ]
    },
    compute(values) {
      return { height: 0.5 * values.gravity * values.time * values.time };
    }
  },
  {
    id: 'projectile-motion-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'R',
    updatedAt: '2026-11-16',
    aliases: ['range of a projectile calculator', 'trajectory calculator', 'launch angle calculator', 'time of flight calculator', 'projectile range and height calculator'],
    related: ['free-fall-calculator', 'speed-distance-time-calculator', 'work-calculator'],
    title: 'Projectile Motion Calculator',
    description: 'Find the range, maximum height, and time of flight of an object launched at an angle — for level ground with no air resistance — from its launch speed and angle.',
    example: 'Launched at 20 m/s at a 30° angle, a projectile travels about 35.33 m, rises to about 5.10 m, and stays airborne for about 2.04 s.',
    breakdown: {
      headline: 'range',
      headlineLabel: 'Range',
      outputs: [
        { id: 'range', label: 'Range', dimension: 'length', unit: 'm' },
        { id: 'maxHeight', label: 'Maximum height', dimension: 'length', unit: 'm' },
        { id: 'timeOfFlight', label: 'Time of flight', dimension: 'time', unit: 's' }
      ],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'range', label: 'Range' }, { from: 'maxHeight', label: 'Max height' }],
        title: 'Range vs. maximum height',
        highlight: 0
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is projectile motion?',
        paragraphs: [
          'A projectile is anything launched into the air and then left to move under gravity alone — a thrown ball, a kicked soccer ball, a cannonball. Its motion splits cleanly into two independent pieces: a constant horizontal velocity (nothing speeds it up or slows it down sideways, in the idealized no-air-resistance case) and a vertical motion that behaves exactly like free fall, slowing on the way up and speeding up on the way down under gravity.',
          'Launched at speed v₀ and angle θ above the horizontal, that velocity splits into a horizontal part (v₀cos θ) and a vertical part (v₀sin θ). The horizontal part determines how far the projectile travels before landing; the vertical part determines how high it rises and how long it stays in the air, through exactly the same kind of constant-acceleration motion used in free fall.',
          'For a projectile that lands at the same height it was launched from — level ground — three standard formulas give the range (total horizontal distance), the maximum height, and the total time of flight, all from just the launch speed, the launch angle, and gravity.'
        ]
      },
      howTo: {
        intro: 'Enter the launch speed and the launch angle; the calculator works out the range, the maximum height, and the time of flight at once.',
        steps: [
          { name: 'Enter the launch speed', text: 'Type the speed the object leaves the launch point at, and pick its unit.' },
          { name: 'Enter the launch angle', text: 'Type the angle above the horizontal, in degrees. 0° is straight along the ground; 90° is straight up.' },
          { name: 'Read the range', text: 'The headline is the horizontal distance the projectile travels before landing back at launch height.' },
          { name: 'Read the height and time', text: 'The rows below show the highest point the projectile reaches and how long it stays airborne.' },
          { name: 'Compare on the chart', text: 'The range and maximum height are plotted side by side, so their relative size is easy to see.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'All three results come from the launch speed v₀, the launch angle θ, and gravity g — valid for level ground (same launch and landing height) with no air resistance.',
        expression: 'Range: R = v₀² × sin(2θ) ÷ g\nMax height: h = v₀² × sin²(θ) ÷ (2g)\nTime of flight: T = 2 × v₀ × sin(θ) ÷ g',
        terms: [
          { symbol: 'v₀', meaning: 'Launch speed, in meters per second (m/s).' },
          { symbol: 'θ', meaning: 'Launch angle above the horizontal.' },
          { symbol: 'g', meaning: 'Gravitational acceleration, taken as standard gravity, 9.80665 m/s².' },
          { symbol: 'R, h, T', meaning: 'Range, maximum height, and time of flight — all measured from and back to the launch height.' }
        ],
        note: 'These formulas assume no air resistance and a launch and landing at the same height. A launch from a cliff or into a pit at a different height, or a projectile with meaningful drag (a thrown ball in a strong headwind), needs a more general treatment.'
      },
      workedExample: {
        intro: 'A ball is launched at 20 m/s at a 30° angle above the horizontal, over level ground. How far does it go, how high does it rise, and how long is it in the air?',
        rows: [
          { label: 'Launch speed (v₀)', value: '20 m/s' },
          { label: 'Launch angle (θ)', value: '30°' },
          { label: 'Range (R = 20² × sin(60°) ÷ 9.80665)', value: '35.33 m' },
          { label: 'Max height (h = 20² × sin²(30°) ÷ (2 × 9.80665))', value: '5.10 m' },
          { label: 'Time of flight (T = 2 × 20 × sin(30°) ÷ 9.80665)', value: '2.04 s' }
        ],
        result: 'R ≈ 35.33 m · h ≈ 5.10 m · T ≈ 2.04 s',
        explanation: 'sin(60°) ≈ 0.8660, so R = 400 × 0.8660 ÷ 9.80665 ≈ 35.33 m. sin(30°) = 0.5, so h = 400 × 0.25 ÷ 19.6133 ≈ 5.10 m, and T = 2 × 20 × 0.5 ÷ 9.80665 ≈ 2.04 s. For comparison, OpenStax works the same formulas in reverse in its golf-shot example: a 90 m shot at 30° needs a launch speed of about 31.9 m/s.'
      },
      watchOut: [
        {
          title: 'These formulas assume level ground',
          body: 'They only hold when the projectile lands at the same height it launched from. Launching off a cliff, into a valley, or over a wall at a different height needs the full vertical-motion equations, not these shortcuts.'
        },
        {
          title: '45° gives the maximum range for a given speed, not the maximum height',
          body: "For a fixed launch speed, 45° sends the projectile the farthest horizontally. A steeper angle (closer to 90°) trades range for height instead — the same speed launched straight up (90°) has zero range but the greatest possible height."
        },
        {
          title: 'No air resistance is assumed',
          body: 'A dense, compact object over a short range (a thrown rock, a kicked ball) comes close to this ideal. A light or fast-spinning object — a badminton shuttlecock, a well-struck golf ball with real backspin — can deviate noticeably because of drag and lift.'
        },
        {
          title: 'Angle is measured from the horizontal, not the vertical',
          body: '0° is launched flat along the ground, 90° is launched straight up. Entering an angle measured from the vertical instead will give the wrong trajectory.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §4.3 Projectile Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'initialVelocity', label: 'Launch speed', type: 'number', placeholder: '20', defaultValue: 20, step: 0.1, min: 0, dimension: 'speed', unit: 'm/s' },
      { id: 'launchAngle', label: 'Launch angle (0–90°)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 0, dimension: 'angle', unit: 'deg' }
    ],
    seo: {
      title: 'Projectile Motion Calculator – Range, Height & Time',
      description: 'Free projectile motion calculator. Find the range, maximum height, and time of flight from launch speed and angle, for level ground, with a worked example.',
      faq: [
        { question: 'What is the formula for the range of a projectile?', answer: 'R = v₀² × sin(2θ) ÷ g, for level ground with no air resistance. A 20 m/s launch at 30° gives R = 400 × sin(60°) ÷ 9.80665 ≈ 35.33 m.' },
        { question: 'How do I find the maximum height of a projectile?', answer: 'h = v₀² × sin²(θ) ÷ (2g). The same 20 m/s launch at 30° rises to 400 × sin²(30°) ÷ (2 × 9.80665) ≈ 5.10 m.' },
        { question: 'How do I find the time of flight?', answer: 'T = 2 × v₀ × sin(θ) ÷ g. A 20 m/s launch at 30° stays airborne for 2 × 20 × sin(30°) ÷ 9.80665 ≈ 2.04 s.' },
        { question: 'What launch angle gives the maximum range?', answer: '45°, for a given launch speed with no air resistance — sin(2 × 45°) = sin(90°) = 1, the largest the sine term can be.' },
        { question: 'Do these formulas work for a launch from a height, like a cliff?', answer: 'No. They assume the projectile lands at the same height it launched from (level ground). A different launch and landing height needs the full set of vertical motion equations.' },
        { question: 'Does air resistance affect the result?', answer: 'Yes, for light or fast-spinning objects, but this calculator assumes none, which is accurate for a dense, compact object over a short range, like a thrown rock or a kicked ball.' }
      ]
    },
    compute(values) {
      const angle = (values.launchAngle * Math.PI) / 180;
      const v0 = values.initialVelocity;
      return {
        range: (v0 * v0 * Math.sin(2 * angle)) / STANDARD_GRAVITY,
        maxHeight: (v0 * v0 * Math.sin(angle) * Math.sin(angle)) / (2 * STANDARD_GRAVITY),
        timeOfFlight: (2 * v0 * Math.sin(angle)) / STANDARD_GRAVITY
      };
    }
  },
  {
    id: 'friction-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'f',
    updatedAt: '2026-11-16',
    aliases: ['friction force calculator', 'f = mu n calculator', 'coefficient of friction calculator', 'kinetic friction calculator', 'normal force friction calculator'],
    related: ['force-calculator', 'weight-calculator', 'pressure-calculator'],
    title: 'Friction Calculator (f = μN)',
    description: 'Calculate friction force from the coefficient of friction and the normal force — f = μ × N — or solve backward for either one, in newtons, pounds-force, or kilograms-force.',
    example: 'A 50 kg crate on a wood floor (μ = 0.3) with a normal force of 490.33 N experiences about 147.1 N of kinetic friction.',
    solver: {
      defaultTarget: 'frictionForce',
      variables: [
        { id: 'frictionForce', label: 'Friction force', symbol: 'f', dimension: 'force', defaultValue: 147.1, defaultUnit: 'N' },
        { id: 'coefficient', label: 'Coefficient of friction', symbol: 'μ', dimension: 'count', defaultValue: 0.3, defaultUnit: 'count' },
        { id: 'normalForce', label: 'Normal force', symbol: 'N', dimension: 'force', defaultValue: 490.33, defaultUnit: 'N' }
      ],
      solve: {
        frictionForce: ({ coefficient, normalForce }) => coefficient * normalForce,
        coefficient: ({ frictionForce, normalForce }) => (normalForce === 0 ? NaN : frictionForce / normalForce),
        normalForce: ({ frictionForce, coefficient }) => (coefficient === 0 ? NaN : frictionForce / coefficient)
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is friction force?',
        paragraphs: [
          'Friction is the force that resists two surfaces sliding (or trying to slide) across each other. It always acts opposite to the direction of motion or attempted motion, and its size depends on two things: how hard the surfaces are pressed together (the normal force, N) and how "grippy" the pair of surfaces is (the coefficient of friction, μ): f = μ × N.',
          'The coefficient of friction is a dimensionless number, usually between 0 and 1, that depends on the two materials in contact — rubber on dry concrete grips far more than steel on steel. There are two coefficients for any pair of surfaces: static friction (μs), which resists getting something moving from a standstill, and kinetic friction (μk), which resists it once it is already sliding. Static friction is almost always the larger of the two, which is why it takes more force to start a heavy crate sliding than to keep it sliding.',
          'The normal force is not always just an object\'s weight. On a flat, horizontal surface with nothing else pushing vertically, N equals the weight (N = mg). On a ramp, or with another force pressing down or lifting up, N has to be worked out from the actual forces perpendicular to the surface — it can be smaller or larger than the weight.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of friction force, the coefficient of friction, and the normal force; the third fills in automatically.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit (the coefficient has no unit). The third field, marked auto, calculates as you type.' },
          { name: 'Find the normal force first, if needed', text: "On flat ground with nothing else pushing vertically, the normal force equals the object's weight, N = m × g." },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a force unit converts the number already there, so 490.33 N becomes 50 kgf instead of silently turning into 490.33 kgf.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The friction formula rearranges three ways, one for each quantity you might be solving for.',
        expression: 'f = μ × N\nμ = f ÷ N\nN = f ÷ μ',
        terms: [
          { symbol: 'f', meaning: 'Friction force, in newtons (N) — the force resisting sliding.' },
          { symbol: 'μ', meaning: 'Coefficient of friction, a dimensionless number specific to the pair of surfaces in contact. Use μs for the force needed to start motion, μk for the force resisting motion already underway.' },
          { symbol: 'N', meaning: 'Normal force, in newtons (N) — how hard the two surfaces are pressed together, perpendicular to the contact surface.' }
        ],
        note: 'Every force is converted to SI units (newtons) before solving and converted back afterward, so mixing newtons with pounds-force cannot produce a wrong result. This is kinetic friction when the object is already sliding; the maximum static friction before it starts moving uses the same formula with μs in place of μk.'
      },
      workedExample: {
        intro: 'A 50 kg wooden crate sits on a flat wooden floor (coefficient of kinetic friction μk = 0.3, OpenStax Table 6.1). How much friction force resists it once it is sliding?',
        rows: [
          { label: 'Mass (m)', value: '50 kg' },
          { label: 'Normal force (N = m × g = 50 × 9.80665)', value: '490.33 N' },
          { label: 'Coefficient of kinetic friction (μk)', value: '0.3' },
          { label: 'Friction force (f = 0.3 × 490.33)', value: '147.10 N' }
        ],
        result: 'f ≈ 147.1 N',
        explanation: 'On flat ground, the normal force equals the weight: 50 × 9.80665 ≈ 490.33 N. Multiplying by the kinetic coefficient, 0.3 × 490.33 ≈ 147.1 N, gives the force resisting the crate once it is sliding. Getting it moving from a standstill takes more: wood-on-wood static friction has μs = 0.5, for a maximum static friction of 0.5 × 490.33 ≈ 245.17 N — anything pushing harder than that starts the crate sliding.'
      },
      watchOut: [
        {
          title: 'Static friction can take any value up to its maximum',
          body: "f ≤ μsN describes static friction, not f = μsN exactly. A stationary object only needs just enough friction to balance whatever is pushing it, up to that maximum — above the maximum, it starts to slide, and kinetic friction (usually a smaller coefficient) takes over."
        },
        {
          title: 'The normal force is not always the full weight',
          body: 'N = mg only holds on flat ground with no other vertical forces. On a slope, N = mg × cos(angle) — smaller than the weight. A force pulling up (a handle, a cable) reduces N further; one pushing down increases it.'
        },
        {
          title: 'Coefficients of friction come from the surfaces, not the object',
          body: 'μ depends on both materials in contact — the same crate has a different coefficient on tile than on carpet. There is no single "friction coefficient of wood"; it is always a property of a pair of surfaces.'
        },
        {
          title: 'Friction always opposes the direction of sliding (or attempted sliding)',
          body: 'This calculator finds the magnitude of the friction force. Its direction is always opposite to the way the surfaces move (or are being pushed to move) relative to each other.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §6.2 Friction', url: 'https://openstax.org/books/university-physics-volume-1/pages/6-2-friction' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'coefficient', label: 'Coefficient of friction (μ)', type: 'number', placeholder: '0.3', defaultValue: 0.3, step: 0.01, min: 0 },
      { id: 'normalForce', label: 'Normal force (N)', type: 'number', placeholder: '490.33', defaultValue: 490.33, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Friction Calculator (f = μN) – Force, Coefficient or Normal Force',
      description: 'Free friction calculator. Solve f = μ × N for friction force, coefficient of friction, or normal force, in newtons, lbf, or kgf, with a worked example.',
      faq: [
        { question: 'What is the formula for friction force?', answer: 'f = μ × N, where μ is the coefficient of friction and N is the normal force. A normal force of 490.33 N with μ = 0.3 gives a friction force of 0.3 × 490.33 ≈ 147.1 N.' },
        { question: 'How do I find the coefficient of friction?', answer: 'Divide the friction force by the normal force: μ = f ÷ N. A measured friction force of 147.1 N against a 490.33 N normal force gives μ = 147.1 ÷ 490.33 ≈ 0.3.' },
        { question: 'What is the difference between static and kinetic friction?', answer: 'Static friction resists starting motion from rest and can be as large as μsN before the object slips; kinetic friction resists motion already underway and equals μkN. μs is almost always larger than μk for the same surfaces.' },
        { question: 'How do I find the normal force on flat ground?', answer: "On a flat, horizontal surface with no other vertical forces, the normal force equals the object's weight: N = m × g. A 50 kg crate has N = 50 × 9.80665 ≈ 490.33 N." },
        { question: 'What are typical coefficients of friction?', answer: 'OpenStax lists, among others: rubber on dry concrete (μs 1.0, μk 0.7), wood on wood (μs 0.5, μk 0.3), and steel on steel, dry (μs 0.6, μk 0.3). The exact value always depends on both surfaces in contact.' },
        { question: 'Does a bigger surface area mean more friction?', answer: 'No, not in this simplified model — f = μN depends only on the normal force and the coefficient of friction, not on the contact area. A brick resting on its small face and its large face experiences the same friction force, as long as the normal force and materials are unchanged.' }
      ]
    },
    compute(values) {
      return { frictionForce: values.coefficient * values.normalForce };
    }
  },
  {
    id: 'spring-hookes-law-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'kx',
    updatedAt: '2026-11-16',
    aliases: ["hooke's law calculator", 'spring force calculator', 'spring constant calculator', 'f = kx calculator', 'spring displacement calculator'],
    related: ['force-calculator', 'potential-energy-calculator', 'weight-calculator'],
    title: "Spring Force Calculator (Hooke's Law, F = kx)",
    description: "Calculate spring force from the spring constant and displacement — Hooke's law, F = k × x — or solve backward for either one, in newtons, pounds-force, N/m, or lbf/in.",
    example: 'A spring with a constant of 250 N/m stretched 12 cm (0.12 m) pulls back with 30 N of force.',
    solver: {
      defaultTarget: 'force',
      variables: [
        { id: 'force', label: 'Spring force', symbol: 'F', dimension: 'force', defaultValue: 30, defaultUnit: 'N' },
        { id: 'springConstant', label: 'Spring constant', symbol: 'k', dimension: 'springConstant', defaultValue: 250, defaultUnit: 'N/m' },
        { id: 'displacement', label: 'Displacement', symbol: 'x', dimension: 'length', defaultValue: 0.12, defaultUnit: 'm' }
      ],
      solve: {
        force: ({ springConstant, displacement }) => springConstant * displacement,
        springConstant: ({ force, displacement }) => (displacement === 0 ? NaN : force / displacement),
        displacement: ({ force, springConstant }) => (springConstant === 0 ? NaN : force / springConstant)
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: "What is Hooke's law?",
        paragraphs: [
          "Hooke's law describes how an ideal spring pushes or pulls back when it is stretched or compressed: the force is proportional to the displacement from its natural, resting length. Stretch a spring twice as far and it pulls back twice as hard; compress it half as far and it pushes back half as hard.",
          'The full statement, Fs = −kx, includes a minus sign because the spring force is a restoring force — it always points back toward the resting position, opposite to the direction of the displacement. This calculator works with the magnitude, F = k × x, since the direction follows automatically from which way the spring is stretched or compressed.',
          'The spring constant, k, measures stiffness: a high k (a stiff suspension spring) takes a large force to stretch even a little, while a low k (a soft rubber band) stretches a long way under a small force. It is a property of the specific spring — its material, thickness, and coil geometry — not a universal number.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of spring force, the spring constant, and the displacement; the third fills in automatically.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 250 N/m becomes 0.25 N/mm instead of silently turning into 250 N/mm.' },
          { name: 'Read the result', text: 'The answer appears in your chosen unit, alongside the main alternatives underneath.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: "Hooke's law rearranges three ways, one for each quantity you might be solving for.",
        expression: 'F = k × x\nk = F ÷ x\nx = F ÷ k',
        terms: [
          { symbol: 'F', meaning: 'Spring force, in newtons (N) — the magnitude of the push or pull the spring exerts.' },
          { symbol: 'k', meaning: 'Spring constant, in newtons per meter (N/m). Higher means stiffer.' },
          { symbol: 'x', meaning: 'Displacement from the spring\'s natural length, in meters (m) — how far it is stretched or compressed.' }
        ],
        note: "Every input is converted to SI units (N, N/m, m) before solving and converted back afterward. This is the ideal, linear form of Hooke's law; real springs stop behaving this way if stretched or compressed far enough (beyond their elastic limit)."
      },
      workedExample: {
        intro: 'A spring has a spring constant of 250 N/m. How much force does it exert when stretched 12 cm?',
        rows: [
          { label: 'Spring constant (k)', value: '250 N/m' },
          { label: 'Displacement, converted (x = 12 cm)', value: '0.12 m' },
          { label: 'Force (F = 250 × 0.12)', value: '30 N' }
        ],
        result: 'F = 30 N',
        explanation: '12 cm converts to 0.12 m, and 250 × 0.12 = 30 N. That is the size of the pull a 250 N/m spring exerts when stretched that far — about the weight of a 3 kg object. Stretching the same spring twice as far, to 24 cm, would double the force to 60 N.'
      },
      watchOut: [
        {
          title: "Hooke's law only holds within a spring's elastic limit",
          body: 'Stretch or compress a real spring too far and it stops being proportional — it can permanently deform or even break. F = kx is accurate only within the range the spring was designed for.'
        },
        {
          title: 'The force is a restoring force, pointing back toward rest',
          body: "The full law is Fs = −kx: whichever way the spring is displaced, it pushes or pulls back the opposite way, toward its natural length. This calculator reports the magnitude; the direction is always back toward equilibrium."
        },
        {
          title: 'k depends on the specific spring',
          body: "There is no single universal spring constant. A thick, short coil spring and a thin, long one can have very different stiffness, even made from the same material — k has to be measured or specified for each spring."
        },
        {
          title: 'Not the same as the force stretching it',
          body: 'At the instant a spring is held stationary at some displacement x, the spring force F = kx exactly balances whatever external force is holding it there. While it is still moving, that is no longer necessarily true.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §15.1 Simple Harmonic Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-1-simple-harmonic-motion' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'springConstant', label: 'Spring constant (N/m)', type: 'number', placeholder: '250', defaultValue: 250, step: 1, min: 0 },
      { id: 'displacement', label: 'Displacement (m)', type: 'number', placeholder: '0.12', defaultValue: 0.12, step: 0.01, min: 0 }
    ],
    seo: {
      title: "Spring Force Calculator (Hooke's Law, F = kx)",
      description: "Free spring force calculator using Hooke's law. Solve F = k × x for force, spring constant, or displacement in N, lbf, N/m, or lbf/in, with a worked example.",
      faq: [
        { question: "What is Hooke's law?", answer: "Hooke's law states that the force a spring exerts is proportional to its displacement from rest: F = k × x, where k is the spring constant. The full form, Fs = −kx, shows the force always points back toward the resting position." },
        { question: 'How do I calculate spring force?', answer: 'Multiply the spring constant by the displacement: F = k × x. A spring with k = 250 N/m stretched 0.12 m exerts 250 × 0.12 = 30 N.' },
        { question: 'How do I find the spring constant from a measured force?', answer: 'Divide the force by the displacement: k = F ÷ x. A 30 N force stretching a spring 0.12 m gives k = 30 ÷ 0.12 = 250 N/m.' },
        { question: 'How do I find displacement from force and spring constant?', answer: 'Divide force by the spring constant: x = F ÷ k. A 30 N force on a 250 N/m spring gives x = 30 ÷ 250 = 0.12 m.' },
        { question: 'What does a higher spring constant mean?', answer: 'A higher k means a stiffer spring — it takes more force to stretch or compress it by the same amount. A heavy-duty suspension spring has a much higher k than a soft rubber band.' },
        { question: "Does Hooke's law work for any amount of stretch?", answer: "No. It only holds within a spring's elastic limit. Stretch or compress it too far and the force stops being proportional to displacement, and the spring can deform permanently or break." }
      ]
    },
    compute(values) {
      return { force: values.springConstant * values.displacement };
    }
  },
  {
    id: 'doppler-effect-calculator',
    category: 'physics',
    group: 'Waves & Light',
    glyph: 'Δf',
    updatedAt: '2026-11-16',
    aliases: ['doppler shift calculator', 'doppler frequency calculator', 'ambulance siren pitch calculator', 'moving source frequency calculator', 'sound frequency shift calculator'],
    related: ['wavelength-frequency-calculator', 'speed-distance-time-calculator', 'decibel-calculator'],
    title: 'Doppler Effect Calculator',
    description: 'Find the frequency a moving source or listener actually hears, from the sound Doppler effect formula — solve for observed frequency, source frequency, either speed, or the speed of sound.',
    example: 'A 150 Hz train horn approaching at 35 m/s, with sound traveling at 343 m/s, is heard at about 167.05 Hz — roughly 11.4% higher than its true pitch.',
    solver: {
      defaultTarget: 'observedFrequency',
      variables: [
        { id: 'observedFrequency', label: 'Observed frequency', symbol: 'f₀', dimension: 'frequency', defaultValue: 167.05, defaultUnit: 'Hz' },
        { id: 'sourceFrequency', label: 'Source frequency', symbol: 'fₛ', dimension: 'frequency', defaultValue: 150, defaultUnit: 'Hz' },
        { id: 'soundSpeed', label: 'Speed of sound', symbol: 'v', dimension: 'speed', defaultValue: 343, defaultUnit: 'm/s' },
        { id: 'observerSpeed', label: 'Observer speed (+ toward source)', symbol: 'v₀', dimension: 'speed', defaultValue: 0, defaultUnit: 'm/s' },
        { id: 'sourceSpeed', label: 'Source speed (+ toward observer)', symbol: 'vₛ', dimension: 'speed', defaultValue: 35, defaultUnit: 'm/s' }
      ],
      solve: {
        observedFrequency: ({ sourceFrequency, soundSpeed, observerSpeed, sourceSpeed }) =>
          soundSpeed - sourceSpeed === 0 ? NaN : (sourceFrequency * (soundSpeed + observerSpeed)) / (soundSpeed - sourceSpeed),
        sourceFrequency: ({ observedFrequency, soundSpeed, observerSpeed, sourceSpeed }) =>
          soundSpeed + observerSpeed === 0 ? NaN : (observedFrequency * (soundSpeed - sourceSpeed)) / (soundSpeed + observerSpeed),
        soundSpeed: ({ sourceFrequency, observedFrequency, observerSpeed, sourceSpeed }) =>
          observedFrequency - sourceFrequency === 0 ? NaN : (sourceFrequency * observerSpeed + observedFrequency * sourceSpeed) / (observedFrequency - sourceFrequency),
        observerSpeed: ({ sourceFrequency, observedFrequency, soundSpeed, sourceSpeed }) =>
          sourceFrequency === 0 ? NaN : (observedFrequency * (soundSpeed - sourceSpeed)) / sourceFrequency - soundSpeed,
        sourceSpeed: ({ sourceFrequency, observedFrequency, soundSpeed, observerSpeed }) =>
          observedFrequency === 0 ? NaN : soundSpeed - (sourceFrequency * (soundSpeed + observerSpeed)) / observedFrequency
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is the Doppler effect?',
        paragraphs: [
          "The Doppler effect is why an ambulance siren sounds higher pitched as it races toward you and lower pitched as it passes and pulls away, even though the siren itself never changes pitch. Moving the source or the listener changes how often sound wave crests arrive, which is exactly what a listener hears as frequency: a source closing the distance bunches its wave crests closer together ahead of it, so they arrive more often (a higher pitch); a source pulling away spreads them out, so they arrive less often (a lower pitch).",
          "The same effect works the other way too — a stationary siren sounds higher to a listener running toward it and lower to one running away, because the listener's own motion changes how quickly they run into each wave crest. Either way, what changes is the observed frequency, f₀; the source's own true frequency, fₛ, never changes.",
          'This calculator uses one signed convention for both moving parts: a positive speed means motion along the line connecting source and listener, toward the other one; a negative speed means motion away. That single sign flips smoothly between all four textbook cases — source approaching or receding, observer approaching or receding — without needing a separate formula or a toggle for each one.'
        ]
      },
      howTo: {
        intro: 'Fill in any four of the five quantities — source frequency, observed frequency, speed of sound, observer speed, and source speed — and the fifth fills in automatically.',
        steps: [
          { name: 'Enter the source frequency', text: "Type the sound's true frequency at the source — a siren's rated pitch, an instrument's note, a horn's frequency — and pick its unit." },
          { name: 'Enter the speed of sound', text: 'Defaults to 343 m/s, the speed of sound in air at 20°C (68°F). Change it for a different temperature or medium.' },
          { name: 'Enter the two speeds', text: "Positive means moving toward the other party along the line between them; negative means moving away. A stationary source or listener is 0." },
          { name: 'Read the observed frequency', text: 'The remaining field, marked auto, shows the frequency actually heard.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one — useful for working out, say, how fast a source must be moving to produce a given pitch shift.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The same relationship rearranges to solve for any of the five quantities.',
        expression: 'f₀ = fₛ(v + v₀) ÷ (v − vₛ)\nfₛ = f₀(v − vₛ) ÷ (v + v₀)\nv = (fₛv₀ + f₀vₛ) ÷ (f₀ − fₛ)\nv₀ = f₀(v − vₛ) ÷ fₛ − v\nvₛ = v − fₛ(v + v₀) ÷ f₀',
        terms: [
          { symbol: 'f₀', meaning: 'Observed frequency — what the listener actually hears, in hertz (Hz).' },
          { symbol: 'fₛ', meaning: "Source frequency — the sound's true, unshifted frequency at the source." },
          { symbol: 'v', meaning: 'Speed of sound in the medium (air), in meters per second. 343 m/s at 20°C (68°F); 331 m/s at 0°C.' },
          { symbol: 'v₀, vₛ', meaning: "Observer speed and source speed, each measured along the line connecting them. Positive means moving toward the other party; negative means moving away." }
        ],
        note: "OpenStax's own statement of this formula uses a ± / ∓ sign pair with a separate case for each direction of motion; this calculator folds all four cases into one expression by treating v₀ and vₛ as signed quantities (positive toward, negative away), which gives the identical results."
      },
      workedExample: {
        intro: 'A train sounds a 150 Hz horn while approaching a crossing at 35 m/s. The air gives a speed of sound of 343 m/s, and the listener at the crossing is standing still. What frequency do they actually hear — and what would they hear once the train has passed and is moving away at the same speed?',
        rows: [
          { label: 'Source frequency (fₛ)', value: '150 Hz' },
          { label: 'Speed of sound (v)', value: '343 m/s' },
          { label: 'Source speed, approaching (vₛ = +35 m/s)', value: '+35 m/s' },
          { label: 'Observed frequency (f₀ = 150 × 343 ÷ (343 − 35))', value: '≈ 167.05 Hz' },
          { label: 'After passing, receding (vₛ = −35 m/s)', value: '150 × 343 ÷ (343 + 35) ≈ 136.11 Hz' }
        ],
        result: 'Approaching: f₀ ≈ 167.05 Hz (+11.4%) · Receding: f₀ ≈ 136.11 Hz (−9.3%)',
        explanation: "Approaching, the denominator shrinks (343 − 35 = 308), raising the frequency to about 167.05 Hz — an 11.4% rise. Receding, the denominator grows instead (343 + 35 = 378), lowering it to about 136.11 Hz — a 9.3% drop. The rise is proportionally bigger than the drop for the same source speed, because shrinking a denominator by 35 changes the result by more than growing it by 35 does — which is exactly why a passing siren's upward whoop on approach sounds more dramatic than its downward fade on the way out."
      },
      watchOut: [
        {
          title: "This calculator's sign convention may differ from your textbook's",
          body: "Some textbooks write the formula as f₀ = fₛ(v ± v₀) ÷ (v ∓ vₛ), with a separate ± sign to pick for each of four cases (source/observer, approaching/receding). This page instead treats v₀ and vₛ as signed numbers — positive toward the other party, negative away — which gives the same answer without picking a case by hand."
        },
        {
          title: 'No answer when a source reaches the speed of sound',
          body: "The formula divides by (v − vₛ), which hits zero once a source moves at exactly the speed of sound and goes negative beyond it. This calculator reports no answer there, rather than a wrong number — a source at or above the speed of sound creates a sonic boom, a genuinely different phenomenon this page does not model."
        },
        {
          title: 'This is the classical Doppler effect for sound, not light',
          body: 'Sound needs a medium (air, water, a solid) to travel through, and this formula assumes that medium is otherwise still. The Doppler effect for light works differently — it depends only on the relative velocity between source and observer, using relativistic formulas from special relativity, not this one.'
        },
        {
          title: 'Only motion along the line between source and listener counts',
          body: 'A source moving directly across your field of view, at the instant it is closest to you, produces no frequency shift at all — only the component of velocity directly toward or away from the listener matters.'
        },
        {
          title: 'Wind is not accounted for',
          body: 'This formula assumes the air itself is not moving. A strong wind blowing along the same line as the sound changes the effective speeds relative to the ground, which this simple form does not include.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §17.7 The Doppler Effect', url: 'https://openstax.org/books/university-physics-volume-1/pages/17-7-the-doppler-effect' },
        { label: 'OpenStax, University Physics Volume 1, §17.2 Speed of Sound', url: 'https://openstax.org/books/university-physics-volume-1/pages/17-2-speed-of-sound' }
      ]
    },
    inputs: [
      { id: 'sourceFrequency', label: 'Source frequency (Hz)', type: 'number', placeholder: '150', defaultValue: 150, step: 1, min: 0 },
      { id: 'soundSpeed', label: 'Speed of sound (m/s)', type: 'number', placeholder: '343', defaultValue: 343, step: 1, min: 0 },
      { id: 'observerSpeed', label: 'Observer speed toward source (m/s)', type: 'number', placeholder: '0', defaultValue: 0, step: 0.1 },
      { id: 'sourceSpeed', label: 'Source speed toward observer (m/s)', type: 'number', placeholder: '35', defaultValue: 35, step: 0.1 }
    ],
    seo: {
      title: 'Doppler Effect Calculator – Observed Frequency Shift',
      description: 'Free Doppler effect calculator for sound. Solve for observed frequency, source frequency, sound speed, or either speed, with a worked train-horn example.',
      faq: [
        { question: 'What is the Doppler effect?', answer: 'The change in observed frequency caused by relative motion between a sound source and a listener: moving the two closer together raises the pitch heard, and moving them apart lowers it, even though the source itself never changes.' },
        { question: 'How do I calculate the Doppler-shifted frequency?', answer: 'f₀ = fₛ(v + v₀) ÷ (v − vₛ), with v₀ and vₛ positive when moving toward the other party and negative when moving away. A 150 Hz source approaching at 35 m/s, with sound at 343 m/s, is heard at 150 × 343 ÷ (343 − 35) ≈ 167.05 Hz.' },
        { question: 'Why does an ambulance siren sound higher as it approaches?', answer: "Because the source is closing the distance, each new wave crest has less far to travel than the last one, bunching the crests closer together in the direction of travel. That raises the frequency the listener receives — the pitch drops back down the moment it passes and starts moving away instead." },
        { question: 'What happens if a source moves faster than the speed of sound?', answer: "The standard formula no longer applies once a source reaches or exceeds the speed of sound — it produces a sonic boom, a shock wave rather than a simple Doppler shift, which this calculator does not model. It reports no answer at or past that point instead of a misleading number." },
        { question: 'Does the Doppler effect apply to light as well as sound?', answer: "Light shows an analogous effect (used in astronomy to measure galaxies' velocities from their red- or blue-shifted spectra), but the formula is different: it depends only on relative velocity and uses relativistic time dilation, not the medium-based formula sound uses here." },
        { question: 'What value should I use for the speed of sound?', answer: "343 m/s is standard for dry air at 20°C (68°F). It drops to about 331 m/s at 0°C, and it is different again in water or in a solid — use the speed of sound for whatever medium the problem actually involves." }
      ]
    },
    compute(values) {
      return {
        observedFrequency:
          values.soundSpeed - values.sourceSpeed === 0
            ? NaN
            : (values.sourceFrequency * (values.soundSpeed + values.observerSpeed)) / (values.soundSpeed - values.sourceSpeed)
      };
    }
  },
  {
    id: 'snells-law-calculator',
    category: 'physics',
    group: 'Waves & Light',
    glyph: 'nθ',
    updatedAt: '2026-11-16',
    aliases: ["snell's law calculator", 'refraction calculator', 'index of refraction calculator', 'angle of refraction calculator', 'critical angle calculator'],
    related: ['lens-mirror-equation-calculator', 'wavelength-frequency-calculator', 'doppler-effect-calculator'],
    title: "Snell's Law Calculator (Refraction)",
    description: "Solve Snell's law, n₁sinθ₁ = n₂sinθ₂, for either refractive index or either angle — find how much a light ray bends crossing into a new transparent medium.",
    example: 'Light traveling from air (n = 1.00) into water (n = 1.33) at a 30° angle of incidence bends to about 22.08° from the normal.',
    solver: {
      defaultTarget: 'theta2',
      variables: [
        { id: 'n1', label: 'Refractive index 1', symbol: 'n₁', dimension: 'count', defaultValue: 1.0, defaultUnit: 'count' },
        { id: 'theta1', label: 'Angle of incidence', symbol: 'θ₁', dimension: 'angle', defaultValue: 30, defaultUnit: 'deg' },
        { id: 'n2', label: 'Refractive index 2', symbol: 'n₂', dimension: 'count', defaultValue: 1.33, defaultUnit: 'count' },
        { id: 'theta2', label: 'Angle of refraction', symbol: 'θ₂', dimension: 'angle', defaultValue: 22.08, defaultUnit: 'deg' }
      ],
      solve: {
        theta2: ({ n1, theta1, n2 }) => (n2 === 0 ? NaN : Math.asin((n1 * Math.sin(theta1)) / n2)),
        theta1: ({ n1, n2, theta2 }) => (n1 === 0 ? NaN : Math.asin((n2 * Math.sin(theta2)) / n1)),
        n1: ({ theta1, n2, theta2 }) => (Math.sin(theta1) === 0 ? NaN : (n2 * Math.sin(theta2)) / Math.sin(theta1)),
        n2: ({ n1, theta1, theta2 }) => (Math.sin(theta2) === 0 ? NaN : (n1 * Math.sin(theta1)) / Math.sin(theta2))
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: "What is Snell's law?",
        paragraphs: [
          "Light bends when it crosses from one transparent medium into another at an angle — from air into water, from water into glass — because light travels at a different speed in each one. Snell's law, n₁sinθ₁ = n₂sinθ₂, ties the two angles (measured from the normal, the imaginary line perpendicular to the surface) to the two media's refractive indices.",
          "The refractive index, n, is a dimensionless number describing how much a medium slows light down: n = c ÷ v, the speed of light in a vacuum divided by its speed in that medium. A vacuum has n = 1 exactly; air is close enough to use n = 1.00 for most purposes; water is about 1.33; typical glass is around 1.5; diamond is a striking 2.417, part of why it sparkles so strongly.",
          "The law is named for the Dutch astronomer Willebrord Snell, who described it in 1621, though the Arab physicist Ibn Sahl had already worked out the same relationship more than six centuries earlier, in 984 CE, in a treatise on lenses and burning mirrors. Both arrived at the same rule: a ray entering a denser medium (higher n) bends toward the normal, and one leaving into a less dense medium bends away from it."
        ]
      },
      howTo: {
        intro: 'Fill in any three of the two refractive indices and the two angles; the fourth fills in automatically.',
        steps: [
          { name: 'Enter the two refractive indices', text: 'Look up or enter n₁ (the medium the light starts in) and n₂ (the medium it enters). Air is 1.00, water is 1.33, typical glass is about 1.5.' },
          { name: 'Enter the known angle', text: 'Type the angle of incidence or refraction, measured from the normal (perpendicular to the surface), not from the surface itself.' },
          { name: 'Read the calculated angle', text: 'The remaining field, marked auto, shows the angle on the other side of the interface.' },
          { name: 'Find a critical angle', text: 'To find the critical angle for total internal reflection, enter the angle of refraction as exactly 90° and solve for the angle of incidence instead.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: "Snell's law rearranges four ways, one for each quantity you might be solving for.",
        expression: 'n₁ sin θ₁ = n₂ sin θ₂\nθ₂ = sin⁻¹(n₁ sin θ₁ ÷ n₂)\nθ₁ = sin⁻¹(n₂ sin θ₂ ÷ n₁)\nn₁ = n₂ sin θ₂ ÷ sin θ₁\nn₂ = n₁ sin θ₁ ÷ sin θ₂',
        terms: [
          { symbol: 'n₁, n₂', meaning: 'Refractive indices of the first and second medium — dimensionless, always 1 or greater for ordinary transparent materials.' },
          { symbol: 'θ₁', meaning: 'Angle of incidence, measured from the normal, in the first medium.' },
          { symbol: 'θ₂', meaning: 'Angle of refraction, measured from the normal, in the second medium.' }
        ],
        note: 'When the calculated sine term works out above 1, there is no real angle that solves the equation — light cannot refract into the second medium at all, and instead reflects entirely back into the first (total internal reflection). This calculator shows no answer in that case rather than a wrong one.'
      },
      workedExample: {
        intro: 'A beam of light in air (n₁ = 1.00) strikes the surface of water (n₂ = 1.33) at a 30° angle of incidence. At what angle does it continue into the water? And going the other way, at what angle would light inside the water undergo total internal reflection at the surface?',
        rows: [
          { label: 'Refractive index of air (n₁)', value: '1.00' },
          { label: 'Angle of incidence (θ₁)', value: '30°' },
          { label: 'Refractive index of water (n₂)', value: '1.33' },
          { label: 'Angle of refraction (θ₂ = sin⁻¹(1.00 × sin 30° ÷ 1.33))', value: '≈ 22.08°' },
          { label: 'Critical angle, water to air (θc = sin⁻¹(1.00 ÷ 1.33))', value: '≈ 48.75°' }
        ],
        result: 'θ₂ ≈ 22.08° · critical angle (water → air) ≈ 48.75°',
        explanation: "Going from air into the denser water, the ray bends toward the normal: 30° becomes about 22.08°. Going the other way — from water back out into air — there is a critical angle beyond which no refraction is possible at all: set θ₂ to exactly 90° (light grazing along the surface) and solve for θ₁, giving sin⁻¹(1.00 ÷ 1.33) ≈ 48.75°. Any angle of incidence inside the water steeper than that reflects entirely back in, which is total internal reflection — the principle fiber optic cables rely on to keep light trapped inside."
      },
      watchOut: [
        {
          title: 'Angles are measured from the normal, not the surface',
          body: "The normal is the imaginary line perpendicular to the interface. A ray striking the surface nearly edge-on has a large angle from the normal (close to 90°), and one striking it nearly straight on has a small angle (close to 0°) — the opposite of how it would be measured from the surface itself."
        },
        {
          title: 'Beyond the critical angle, there is no refracted ray at all',
          body: 'Going from a denser medium into a less dense one (water into air, glass into water) beyond the critical angle, Snell\'s law has no real solution — all the light reflects back into the first medium instead (total internal reflection). This calculator returns no answer in that case, which is the physically correct result, not an error.'
        },
        {
          title: 'Refractive index depends on the color of light',
          body: "A material's refractive index is slightly different for each wavelength (color) of light — this is dispersion, the effect that splits white light into a rainbow through a prism. Tabulated values like water's 1.33 are typically quoted for a standard reference wavelength (yellow-green light, near 589 nm) and shift slightly at the red or blue ends of the spectrum."
        },
        {
          title: 'Assumes a flat interface between uniform media',
          body: 'This formula describes a flat boundary between two optically uniform, non-absorbing materials. A curved surface (a lens), a material whose properties vary with direction, or a rough/scattering surface needs more than this single equation.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 3, §1.3 Refraction', url: 'https://openstax.org/books/university-physics-volume-3/pages/1-3-refraction' },
        { label: 'OpenStax, University Physics Volume 3, §1.4 Total Internal Reflection', url: 'https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection' }
      ]
    },
    inputs: [
      { id: 'n1', label: 'Refractive index 1 (n₁)', type: 'number', placeholder: '1.00', defaultValue: 1.0, step: 0.01, min: 0 },
      { id: 'theta1', label: 'Angle of incidence (rad)', type: 'number', placeholder: '0.5236', defaultValue: Math.PI / 6, step: 0.01, min: 0 },
      { id: 'n2', label: 'Refractive index 2 (n₂)', type: 'number', placeholder: '1.33', defaultValue: 1.33, step: 0.01, min: 0 }
    ],
    seo: {
      title: "Snell's Law Calculator – Refraction Angle & Index",
      description: "Free Snell's law calculator. Solve n₁sinθ₁ = n₂sinθ₂ for either refractive index or either angle, with a worked air-to-water example and critical angle.",
      faq: [
        { question: "What is Snell's law?", answer: "n₁sinθ₁ = n₂sinθ₂, relating the angles of incidence and refraction (measured from the normal) to the refractive indices of the two media a light ray crosses." },
        { question: 'How do I find the angle of refraction?', answer: 'θ₂ = sin⁻¹(n₁ sin θ₁ ÷ n₂). Light from air (n = 1.00) hitting water (n = 1.33) at 30° refracts to sin⁻¹(1.00 × sin 30° ÷ 1.33) ≈ 22.08°.' },
        { question: 'What is the refractive index of common materials?', answer: 'Air is about 1.00, water is about 1.33, typical window glass is about 1.5, and diamond is 2.417 — a higher index means light travels slower in that material and bends more sharply entering it.' },
        { question: 'What is the critical angle, and how do I find it?', answer: "The angle of incidence, in the denser medium, beyond which light cannot refract out at all and instead totally internally reflects. Find it by setting the angle of refraction to 90° and solving for the angle of incidence: for light inside water meeting air, θc = sin⁻¹(1.00 ÷ 1.33) ≈ 48.75°." },
        { question: "Why does Snell's law sometimes give no answer?", answer: 'When light tries to leave a denser medium beyond the critical angle, the equation has no real solution — that is total internal reflection, a genuine physical outcome, not a calculation error.' },
        { question: "Does Snell's law apply to all colors of light the same way?", answer: 'Not exactly — refractive index varies slightly with wavelength (dispersion), which is why a prism splits white light into a spectrum. Standard tabulated values are usually for a reference wavelength near the middle of the visible spectrum.' }
      ]
    },
    compute(values) {
      return { theta2: values.n2 === 0 ? NaN : Math.asin((values.n1 * Math.sin(values.theta1)) / values.n2) };
    }
  },
  {
    id: 'mass-energy-equivalence-calculator',
    category: 'physics',
    group: 'Thermal & Nuclear',
    glyph: 'mc²',
    updatedAt: '2026-11-16',
    aliases: ['e=mc2 calculator', 'einstein mass energy calculator', 'rest energy calculator', 'mass to energy calculator', 'energy mass conversion calculator'],
    related: ['kinetic-energy-calculator', 'radioactive-half-life-calculator', 'work-calculator'],
    title: 'Mass-Energy Equivalence Calculator (E = mc²)',
    description: "Solve Einstein's mass-energy equivalence, E = mc², for the rest energy in a mass or the mass equivalent to an energy, using the exact speed of light.",
    example: 'Converting just 1 gram of mass entirely into energy releases about 8.99 × 10¹³ joules of rest energy.',
    solver: {
      defaultTarget: 'energy',
      variables: [
        { id: 'energy', label: 'Rest energy', symbol: 'E', dimension: 'energy', defaultValue: 89875517873.68176, defaultUnit: 'kJ' },
        { id: 'mass', label: 'Mass', symbol: 'm', dimension: 'mass', defaultValue: 1, defaultUnit: 'g' }
      ],
      solve: {
        energy: ({ mass }) => mass * SPEED_OF_LIGHT * SPEED_OF_LIGHT,
        mass: ({ energy }) => energy / (SPEED_OF_LIGHT * SPEED_OF_LIGHT)
      },
      outputs: [{ id: 'speedOfLightUsed', label: 'Speed of light used (c)', dimension: 'speed', unit: 'km/s', compute: () => SPEED_OF_LIGHT }]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is mass-energy equivalence?',
        paragraphs: [
          "Albert Einstein's 1905 result E = mc² says that mass and energy are the same physical quantity, measured in different units — any mass m, just by existing, carries an amount of energy E equal to that mass times the speed of light squared. This is the object's rest energy: the energy locked into it even sitting perfectly still, with no motion, heat, or other energy added.",
          "The speed of light, c, is enormous (about 300,000 km/s) and squaring it makes the conversion factor between mass and energy almost incomprehensibly large — which is why even a tiny mass corresponds to a huge amount of energy. One gram of matter, converted completely, releases about 8.99 × 10¹³ joules: enough to power a typical home for roughly 2,500 years.",
          'In everyday life almost none of an object\'s rest energy is ever released — a burning log releases only the chemical energy in its molecular bonds, a vanishingly small sliver of its total mc². Nuclear fission and fusion release a far larger (though still small) fraction of the nuclei involved, through measurable mass loss; only matter meeting its antimatter counterpart converts essentially all of the mass into energy.'
        ]
      },
      howTo: {
        intro: 'Enter either mass or rest energy; the calculator fills in the other using E = mc².',
        steps: [
          { name: 'Enter a mass or an energy', text: 'Type whichever one you know, and pick its unit. The other field, marked auto, calculates from it.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it the input instead; the calculator solves back for mass or energy as needed.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 1 g becomes 0.001 kg instead of silently turning into 1 kg.' },
          { name: 'Read the result', text: 'The answer appears in your chosen unit, with the speed of light used for the conversion shown underneath.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The relationship rearranges both ways, depending on which quantity you are solving for.',
        expression: 'E = m × c²\nm = E ÷ c²',
        terms: [
          { symbol: 'E', meaning: "The object's rest energy, in joules (J) — the energy equivalent of its mass alone, at rest." },
          { symbol: 'm', meaning: 'Mass, in kilograms (kg).' },
          { symbol: 'c', meaning: 'The speed of light in a vacuum, exactly 299,792,458 m/s — exact by definition since the 1983 redefinition of the meter, not a measured figure with any uncertainty.' }
        ],
        note: 'This calculator computes rest energy only — the mc² term for an object at rest. A moving object\'s total relativistic energy is larger still, E = γmc² (γ = 1 ÷ √(1 − v²/c²)), adding its kinetic energy on top of the rest energy computed here.'
      },
      workedExample: {
        intro: 'How much energy is locked into just 1 gram of mass, if every bit of it were converted?',
        rows: [
          { label: 'Mass (m)', value: '1.00 g = 0.001 kg' },
          { label: 'Speed of light squared (c²)', value: '299,792,458² ≈ 8.98755 × 10¹⁶ m²/s²' },
          { label: 'Rest energy (E = m × c²)', value: '0.001 × 8.98755 × 10¹⁶ ≈ 8.98755 × 10¹³ J' }
        ],
        result: 'E ≈ 8.99 × 10¹³ J (≈ 89.9 TJ)',
        explanation: "OpenStax's own worked example for exactly this case (1.00 g) rounds the same result to 9.00 × 10¹³ J and notes it is \"about twice the energy released by the Hiroshima atomic bomb and about 10,000 times the kinetic energy of a large aircraft carrier\" — a sense of just how much energy ordinary mass represents, even in a gram too light to feel in your hand."
      },
      watchOut: [
        {
          title: 'This is rest energy, not total energy for a moving object',
          body: 'A moving mass carries more total energy than mc² alone — its full relativistic energy is E = γmc², which exceeds mc² by an amount that grows with speed (and becomes enormous as speed approaches c). This calculator finds the rest-energy term only, the same quantity for an object whether it is sitting still or hurtling through space.'
        },
        {
          title: 'Almost no real process releases the full mc²',
          body: 'Chemical reactions (burning fuel) convert an immeasurably small fraction of mass to energy. Nuclear fission and fusion release a small but measurable fraction, through a real, detectable mass loss (the mass defect) between the starting and ending particles. Only matter-antimatter annihilation converts essentially 100% of the rest mass into energy.'
        },
        {
          title: 'The huge numbers are correct, not a sign of an error',
          body: "Because c² is about 9 × 10¹⁶ m²/s², multiplying even a small mass by it produces an energy figure with many more digits than the mass started with. That is simply what the formula gives — a gram-scale mass genuinely is equivalent to a city-scale amount of energy."
        },
        {
          title: 'Mass loss in a nuclear reaction is real and measurable',
          body: "When a nucleus undergoes fission or fusion, the resulting particles weigh very slightly less than the particles that formed them — that missing mass (the mass defect) is exactly the energy released, via this same equation. It is a tiny fraction of the total mass, but a directly measured one, not just a theoretical bookkeeping trick."
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 3, §5.9 Relativistic Energy', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-9-relativistic-energy' },
        { label: 'NIST, speed of light in vacuum (exact)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?c' }
      ]
    },
    inputs: [{ id: 'mass', label: 'Mass (kg)', type: 'number', placeholder: '0.001', defaultValue: 0.001, step: 0.0001, min: 0 }],
    seo: {
      title: 'Mass-Energy Equivalence Calculator (E = mc²)',
      description: "Free E = mc² calculator. Solve Einstein's mass-energy equivalence for rest energy or mass using the exact speed of light, with a worked example.",
      faq: [
        { question: 'What does E = mc² mean?', answer: "That mass and energy are the same quantity in different units: any mass m has a rest energy E equal to m times the speed of light squared, c². It is the energy an object has just by existing, not counting any motion." },
        { question: 'How do I calculate rest energy from mass?', answer: 'Multiply the mass by the speed of light squared: E = m × c². One gram (0.001 kg) gives E = 0.001 × 299,792,458² ≈ 8.99 × 10¹³ J.' },
        { question: 'How do I find mass from an amount of energy?', answer: 'Divide the energy by c²: m = E ÷ c². An energy of 9 × 10¹³ J corresponds to a mass of about 9 × 10¹³ ÷ (299,792,458²) ≈ 1.002 g.' },
        { question: 'What is the exact value of the speed of light?', answer: '299,792,458 meters per second, exactly — not a measured value with any uncertainty, because the meter itself has been defined in terms of the speed of light since 1983.' },
        { question: 'Is rest energy the same as kinetic energy?', answer: 'No. Rest energy (mc²) is what an object has just from its mass, even standing still. A moving object has additional kinetic energy on top of that, and in relativity its total energy becomes E = γmc², which is always more than the rest energy alone.' },
        { question: 'Can mc² actually be released as usable energy?', answer: 'Only a little of it, in practice. Chemical reactions release a negligible sliver of it; nuclear fission and fusion release a small but real fraction, measurable as the mass lost between the starting and ending particles; only matter-antimatter annihilation releases essentially all of it.' }
      ]
    },
    compute(values) {
      return { energy: values.mass * SPEED_OF_LIGHT * SPEED_OF_LIGHT };
    }
  },
  {
    id: 'thermal-expansion-calculator',
    category: 'physics',
    group: 'Thermal & Nuclear',
    glyph: 'ΔL',
    updatedAt: '2026-11-16',
    aliases: ['linear expansion calculator', 'coefficient of thermal expansion calculator', 'expansion joint calculator', 'thermal expansion coefficient calculator', 'bridge expansion calculator'],
    related: ['heat-calculator', 'density-calculator', 'length-converter'],
    title: 'Thermal Expansion Calculator (ΔL = αL₀ΔT)',
    description: 'Solve the linear thermal expansion formula for the change in length, the expansion coefficient, original length, or temperature change — see how much a heated material actually grows.',
    example: 'A 50 m steel beam (α = 12 × 10⁻⁶/°C) warming by 30°C grows by about 18 mm.',
    solver: {
      defaultTarget: 'deltaL',
      variables: [
        { id: 'deltaL', label: 'Change in length', symbol: 'ΔL', dimension: 'length', defaultValue: 0.018, defaultUnit: 'mm' },
        { id: 'alpha', label: 'Expansion coefficient', symbol: 'α', dimension: 'thermalExpansionCoeff', defaultValue: 12, defaultUnit: 'u/C' },
        { id: 'length0', label: 'Original length', symbol: 'L₀', dimension: 'length', defaultValue: 50, defaultUnit: 'm' },
        { id: 'deltaT', label: 'Temperature change', symbol: 'ΔT', dimension: 'temperatureDelta', defaultValue: 30, defaultUnit: 'C' }
      ],
      solve: {
        deltaL: ({ alpha, length0, deltaT }) => alpha * length0 * deltaT,
        alpha: ({ deltaL, length0, deltaT }) => (length0 * deltaT === 0 ? NaN : deltaL / (length0 * deltaT)),
        length0: ({ deltaL, alpha, deltaT }) => (alpha * deltaT === 0 ? NaN : deltaL / (alpha * deltaT)),
        deltaT: ({ deltaL, alpha, length0 }) => (alpha * length0 === 0 ? NaN : deltaL / (alpha * length0))
      },
      outputs: [{ id: 'volumetricCoefficient', label: 'Equivalent volumetric coefficient (β ≈ 3α)', dimension: 'thermalExpansionCoeff', unit: 'u/C', compute: (si) => 3 * si.alpha }]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is thermal expansion?',
        paragraphs: [
          "Almost everything expands when it gets hotter and shrinks when it cools, because heating a material makes its atoms vibrate more and settle, on average, a little farther apart. For a long, thin object (a rail, a beam, a rod), that shows up as a change in length, given by ΔL = α × L₀ × ΔT: the change depends on the material's own expansion coefficient (α), how long it started out (L₀), and how big the temperature swing is (ΔT).",
          'The coefficient of linear expansion, α, is a property of the specific material, usually reported in millionths per degree. OpenStax lists steel and brick at about 12 × 10⁻⁶/°C, copper at about 17 × 10⁻⁶/°C, aluminum at about 25 × 10⁻⁶/°C, ordinary glass at about 9 × 10⁻⁶/°C, and specialty Pyrex® glass at a much lower 3 × 10⁻⁶/°C — part of why Pyrex resists cracking under sudden temperature changes far better than ordinary glass.',
          'This is specifically linear (one-dimensional) expansion, for a length. The same physics extends to area (expanding at roughly 2α for a given temperature change) and volume (roughly 3α), since an object expands a little in every direction at once — a point this page\'s bonus output applies automatically, but the main formula here only tracks a single length.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of the change in length, the expansion coefficient, the original length, and the temperature change; the fourth fills in automatically.',
        steps: [
          { name: "Look up the material's expansion coefficient", text: 'α varies by material — common values include steel (12 × 10⁻⁶/°C), aluminum (25 × 10⁻⁶/°C), and copper (17 × 10⁻⁶/°C).' },
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit. The field left over, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 0.018 m becomes 18 mm instead of silently turning into 0.018 mm.' },
          { name: 'Read the result and the volumetric figure', text: 'The length change appears in your chosen unit. The bonus output underneath shows the equivalent volumetric coefficient, β ≈ 3α, for the same material.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The linear expansion formula rearranges three ways, one for each quantity you might be solving for.',
        expression: 'ΔL = α × L₀ × ΔT\nα = ΔL ÷ (L₀ × ΔT)\nL₀ = ΔL ÷ (α × ΔT)\nΔT = ΔL ÷ (α × L₀)',
        terms: [
          { symbol: 'ΔL', meaning: 'Change in length, in meters (or any length unit) — positive for heating, negative for cooling.' },
          { symbol: 'α', meaning: "The material's coefficient of linear expansion, per kelvin or per degree Celsius (the two are the same size, since this is an interval)." },
          { symbol: 'L₀', meaning: 'The original length, before the temperature change.' },
          { symbol: 'ΔT', meaning: 'The temperature CHANGE, not a temperature reading — positive for warming, negative for cooling.' },
          { symbol: 'β ≈ 3α', meaning: "The equivalent volumetric expansion coefficient, shown as a bonus output: for the same temperature change, a solid's volume grows at about three times its linear rate." }
        ],
        note: 'This linear form is accurate for modest temperature changes using one representative α. Over very large temperature ranges, α itself drifts somewhat with temperature, and an averaged value is used instead.'
      },
      workedExample: {
        intro: 'A steel beam is 50 m long at installation. How much longer does it get on a day that is 30°C warmer?',
        rows: [
          { label: 'Original length (L₀)', value: '50 m' },
          { label: 'Expansion coefficient, steel (α)', value: '12 × 10⁻⁶ / °C' },
          { label: 'Temperature change (ΔT)', value: '30°C' },
          { label: 'Change in length (ΔL = 12 × 10⁻⁶ × 50 × 30)', value: '0.018 m = 18 mm' }
        ],
        result: 'ΔL = 18 mm',
        explanation: "12 × 10⁻⁶ × 50 × 30 = 0.018 m, or 18 mm — small for a single beam, but exactly the kind of movement that adds up across an entire bridge or a mile of rail track, which is why both are built with expansion joints or small gaps rather than as one unbroken rigid length. An identical aluminum beam, with its higher α of 25 × 10⁻⁶/°C, would grow more than twice as far under the same temperature swing: 25 × 10⁻⁶ × 50 × 30 = 0.0375 m, or 37.5 mm."
      },
      watchOut: [
        {
          title: 'ΔT is a change, not a reading',
          body: 'A beam warming from 10°C to 40°C has ΔT = 30, not 40. Entering a final temperature instead of the actual swing overstates the expansion.'
        },
        {
          title: 'This is linear expansion — area and volume expand faster',
          body: "ΔL = αL₀ΔT only tracks a single length. The same material's area expands at roughly double the rate (2α) and its volume at roughly triple the rate (3α) for the same temperature change, which this page's bonus output (β ≈ 3α) accounts for, but the main ΔL formula does not — don't apply it directly to an area or volume problem."
        },
        {
          title: 'α is only constant over a modest temperature range',
          body: 'The expansion coefficient itself drifts somewhat with temperature and can change sharply near a phase transition. This formula uses one fixed, representative α and is most accurate for everyday temperature swings, not extreme ranges.'
        },
        {
          title: 'Real materials are built with room to expand',
          body: 'Railroad tracks, bridges, and pipelines include expansion joints or small gaps specifically because of this effect — a rigid structure built with no allowance for it can buckle, crack, or fail as temperatures swing between seasons.'
        },
        {
          title: 'Assumes an isotropic material',
          body: 'This formula assumes the material expands the same amount in every direction. Wood, many crystals, and some composites expand at different rates along different axes (grain direction, crystal axis), which a single α cannot fully capture.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 2, §1.3 Thermal Expansion', url: 'https://openstax.org/books/university-physics-volume-2/pages/1-3-thermal-expansion' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'alpha', label: 'Expansion coefficient (1/K)', type: 'number', placeholder: '0.000012', defaultValue: 0.000012, step: 0.000001, min: 0 },
      { id: 'length0', label: 'Original length (m)', type: 'number', placeholder: '50', defaultValue: 50, step: 0.1, min: 0 },
      { id: 'deltaT', label: 'Temperature change (K)', type: 'number', placeholder: '30', defaultValue: 30, step: 0.1 }
    ],
    seo: {
      title: 'Thermal Expansion Calculator (ΔL = αL₀ΔT)',
      description: 'Free linear thermal expansion calculator. Solve for change in length, expansion coefficient, original length, or temperature change, with a steel-beam example.',
      faq: [
        { question: 'What is the formula for linear thermal expansion?', answer: 'ΔL = α × L₀ × ΔT, where α is the material\'s coefficient of linear expansion, L₀ is the original length, and ΔT is the temperature change.' },
        { question: 'How much does a steel beam expand when heated?', answer: 'Using steel\'s α of about 12 × 10⁻⁶/°C: a 50 m beam warming by 30°C grows by 12 × 10⁻⁶ × 50 × 30 = 0.018 m, or 18 mm.' },
        { question: 'What are typical thermal expansion coefficients?', answer: 'OpenStax lists, among others: steel and brick at about 12 × 10⁻⁶/°C, copper at about 17 × 10⁻⁶/°C, aluminum at about 25 × 10⁻⁶/°C, ordinary glass at about 9 × 10⁻⁶/°C, and Pyrex® glass at a low 3 × 10⁻⁶/°C.' },
        { question: 'How is volumetric expansion related to linear expansion?', answer: 'The volumetric expansion coefficient β is approximately 3 times the linear coefficient α, since a solid expands in all three dimensions at once. This calculator shows β as a bonus output alongside the linear result.' },
        { question: 'Why do bridges and railroad tracks have expansion joints?', answer: 'To accommodate exactly this effect. A rigid structure with no allowance for thermal expansion can buckle or crack as temperatures swing between a hot summer day and a cold winter one.' },
        { question: 'Does thermal expansion coefficient change with temperature?', answer: 'Slightly, yes — α is not perfectly constant across all temperatures, especially near a material\'s phase transitions. This formula uses one representative value, accurate for everyday temperature ranges.' }
      ]
    },
    compute(values) {
      return { deltaL: values.alpha * values.length0 * values.deltaT };
    }
  },
  {
    id: 'escape-velocity-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'vₑ',
    updatedAt: '2026-11-16',
    aliases: ['planetary escape velocity calculator', 'escape speed calculator', 'orbital escape velocity calculator', 'rocket escape velocity calculator', 'how fast to escape gravity calculator'],
    related: ['weight-calculator', 'kinetic-energy-calculator', 'speed-distance-time-calculator'],
    title: 'Escape Velocity Calculator',
    description: 'Solve v = √(2GM ÷ r) for the escape velocity, mass, or radius of a planet, moon, or star — the minimum speed needed to break free of its gravity for good.',
    example: "Earth's escape velocity, with a mass of 5.9722 × 10²⁴ kg and a radius of 6,371 km, works out to about 11.19 km/s — roughly 40,270 km/h or 25,023 mph.",
    solver: {
      defaultTarget: 'escapeVelocity',
      variables: [
        { id: 'escapeVelocity', label: 'Escape velocity', symbol: 'v', dimension: 'speed', defaultValue: 11.19, defaultUnit: 'km/s' },
        { id: 'mass', label: 'Mass of the body', symbol: 'M', dimension: 'mass', defaultValue: 5.9722e24, defaultUnit: 'kg' },
        { id: 'radius', label: 'Radius', symbol: 'r', dimension: 'length', defaultValue: 6371, defaultUnit: 'km' }
      ],
      solve: {
        escapeVelocity: ({ mass, radius }) => (radius <= 0 ? NaN : Math.sqrt((2 * GRAVITATIONAL_CONSTANT * mass) / radius)),
        mass: ({ escapeVelocity, radius }) => (escapeVelocity * escapeVelocity * radius) / (2 * GRAVITATIONAL_CONSTANT),
        radius: ({ escapeVelocity, mass }) => (escapeVelocity === 0 ? NaN : (2 * GRAVITATIONAL_CONSTANT * mass) / (escapeVelocity * escapeVelocity))
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is escape velocity?',
        paragraphs: [
          "Escape velocity is the minimum speed an object needs, fired straight up with no further propulsion, to break free of a body's gravity completely rather than falling back or settling into orbit. It comes from setting an object's kinetic energy equal to the gravitational potential energy binding it to the surface: give it exactly enough kinetic energy and it coasts outward forever, arriving at an infinite distance with zero speed left over.",
          'The formula, v = √(2GM ÷ r), depends only on the body being escaped — its mass M and radius r — and the universal gravitational constant G, not on the mass of the thing escaping. A pebble and a rocket launched from the same point at the same speed either both escape or both fall back; a more massive rocket just needs proportionally more energy (and fuel) to reach the same speed.',
          "Earth's escape velocity works out to about 11.2 km/s (roughly 40,000 km/h or 25,000 mph) — far faster than orbital speed near the surface (about 7.9 km/s), which is why reaching orbit and leaving Earth's gravity entirely for deep space are different problems with different speed requirements."
        ]
      },
      howTo: {
        intro: 'Fill in any two of escape velocity, mass, and radius; the third fills in automatically.',
        steps: [
          { name: 'Enter the mass and radius', text: "Type the body's mass and radius, picking sensible units — kilograms for mass, and kilometers or meters for radius work well for planets and moons." },
          { name: 'Read the escape velocity', text: 'The remaining field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field (for example, to find the radius a body of a given mass would need for a target escape velocity) to make it an input instead.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 6,371 km becomes 6,371,000 m instead of silently turning into 6,371 m.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The escape velocity formula rearranges three ways, one for each quantity you might be solving for.',
        expression: 'v = √(2GM ÷ r)\nM = v² × r ÷ (2G)\nr = 2GM ÷ v²',
        terms: [
          { symbol: 'v', meaning: 'Escape velocity, in meters per second (commonly shown in km/s for planetary bodies).' },
          { symbol: 'G', meaning: 'The Newtonian gravitational constant, 6.6743 × 10⁻¹¹ m³ kg⁻¹ s⁻² (CODATA 2022) — measured, unlike the exact speed of light, with a small uncertainty.' },
          { symbol: 'M', meaning: 'The mass of the body being escaped (a planet, moon, or star), in kilograms.' },
          { symbol: 'r', meaning: "The distance from the body's center — its radius, for launching from the surface." }
        ],
        note: "This formula ignores atmospheric drag and the gravity of any other nearby body (the Sun, a moon). It also assumes launching from the surface outward in a straight line; direction doesn't actually matter for the minimum-energy case, as long as the path avoids hitting the ground or atmosphere on the way out."
      },
      workedExample: {
        intro: "What is Earth's escape velocity, given its mass and radius?",
        rows: [
          { label: 'Mass of Earth (M)', value: '5.9722 × 10²⁴ kg' },
          { label: 'Radius of Earth (r)', value: '6,371 km = 6,371,000 m' },
          { label: 'Gravitational constant (G)', value: '6.6743 × 10⁻¹¹ m³ kg⁻¹ s⁻²' },
          { label: 'Escape velocity (v = √(2 × 6.6743×10⁻¹¹ × 5.9722×10²⁴ ÷ 6,371,000))', value: '≈ 11,186 m/s' }
        ],
        result: 'v ≈ 11.19 km/s ≈ 40,270 km/h ≈ 25,023 mph',
        explanation: "Working through the formula gives about 11,186 m/s, or 11.19 km/s. NASA's own published figure for Earth is 11.186 km/s, and OpenStax's own worked example (using slightly rounder inputs, M = 5.96 × 10²⁴ kg and r = 6.37 × 10⁶ m) arrives at the same \"about 11 km/s, or about 25,000 mph.\" For comparison: the Moon's escape velocity is a much gentler 2.38 km/s, Mars sits at 5.03 km/s, Jupiter requires 59.5 km/s, and the Sun's is a dramatic 617.6 km/s (all NASA-published figures) — a direct reflection of how much more massive, and how much more tightly packed, each of those bodies is."
      },
      watchOut: [
        {
          title: 'Escape velocity does not depend on the direction of launch',
          body: 'In this idealized, no-atmosphere model, the formula gives the same minimum speed regardless of which direction an object leaves in. In reality, atmospheric drag means real rockets lose some energy to air resistance, so an actual launch needs more than this theoretical minimum.'
        },
        {
          title: "It is unrelated to a rocket's mass",
          body: "A heavier spacecraft needs the same escape velocity as a light one — it just takes far more energy (and fuel) to accelerate the heavier one to that same speed. The formula itself has no mass-of-the-escaping-object term at all."
        },
        {
          title: 'Escape velocity is not the same as orbital velocity',
          body: "The speed needed to stay in a stable low orbit just above a body's surface is lower — about 7.9 km/s for Earth — than the speed needed to leave its gravity for good (11.2 km/s). Reaching orbit and escaping a body entirely are different goals with different speed requirements."
        },
        {
          title: "G is measured, not exact — unlike the speed of light",
          body: 'The gravitational constant carries a small measurement uncertainty (CODATA 2022: about 22 parts per million), the largest relative uncertainty of any fundamental constant in regular use, because gravity is so much weaker than the other forces and correspondingly harder to measure precisely in a lab.'
        },
        {
          title: "Real planets and stars aren't perfectly uniform spheres",
          body: "This formula treats a body as spherically symmetric with all its mass acting as if concentrated at the center — an excellent approximation for Earth, but a rotating gas giant like Jupiter bulges noticeably at its equator, so its real escape velocity (measured from a defined reference level) can differ slightly from a simple radius-and-mass calculation."
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §13.3 Gravitational Potential Energy and Total Energy', url: 'https://openstax.org/books/university-physics-volume-1/pages/13-3-gravitational-potential-energy-and-total-energy' },
        { label: 'NIST, Newtonian constant of gravitation G (CODATA 2022)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?bg' },
        { label: 'NASA Goddard Space Flight Center, Planetary Fact Sheets', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass of the body (kg)', type: 'number', placeholder: '5.9722e24', defaultValue: 5.9722e24, step: 1e20, min: 0 },
      { id: 'radius', label: 'Radius (m)', type: 'number', placeholder: '6371000', defaultValue: 6371000, step: 1000, min: 0 }
    ],
    seo: {
      title: 'Escape Velocity Calculator – v = √(2GM/r)',
      description: 'Free escape velocity calculator. Solve v = √(2GM/r) for escape velocity, mass, or radius of a planet, moon, or star, with an Earth worked example.',
      faq: [
        { question: 'What is the formula for escape velocity?', answer: 'v = √(2GM ÷ r), where G is the gravitational constant, M is the mass of the body, and r is the distance from its center (its radius, for a surface launch).' },
        { question: "What is Earth's escape velocity?", answer: 'About 11.19 km/s (roughly 40,270 km/h or 25,023 mph), using Earth\'s mass of 5.9722 × 10²⁴ kg and radius of 6,371 km.' },
        { question: 'Does escape velocity depend on the mass of the rocket or object?', answer: "No. The formula only involves the mass and radius of the body being escaped, not the escaping object's own mass — a pebble and a spacecraft need the identical speed, though the spacecraft needs far more energy and fuel to reach it." },
        { question: 'Is escape velocity the same as orbital velocity?', answer: 'No, orbital velocity is lower. A stable low orbit around Earth needs about 7.9 km/s, while fully escaping Earth\'s gravity needs about 11.2 km/s — roughly 1.41 times as much, since escape velocity is always √2 times the circular orbital velocity at the same radius.' },
        { question: 'How does escape velocity compare across the solar system?', answer: "It rises sharply with mass and tighter packing: the Moon's is 2.38 km/s, Mars is 5.03 km/s, Earth is 11.19 km/s, Jupiter is 59.5 km/s, and the Sun's is 617.6 km/s (NASA figures)." },
        { question: 'What value of the gravitational constant does this calculator use?', answer: 'G = 6.6743 × 10⁻¹¹ m³ kg⁻¹ s⁻², the CODATA 2022 recommended value — a measured constant with a small uncertainty, unlike the exactly defined speed of light.' }
      ]
    },
    compute(values) {
      return { escapeVelocity: values.radius <= 0 ? NaN : Math.sqrt((2 * GRAVITATIONAL_CONSTANT * values.mass) / values.radius) };
    }
  },
  {
    id: 'centripetal-force-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'Fc',
    updatedAt: '2026-11-16',
    aliases: ['centripetal force formula calculator', 'f = mv^2/r calculator', 'circular motion force calculator', 'uniform circular motion calculator', 'center-seeking force calculator'],
    related: ['force-calculator', 'speed-distance-time-calculator', 'friction-calculator', 'gravitational-force-calculator'],
    title: 'Centripetal Force Calculator (F = mv²/r)',
    description: 'Calculate the force needed to keep an object moving in a circle — F = m × v² ÷ r — or solve backward for mass, speed, or radius.',
    example: 'A 1,200 kg car cornering at 15 m/s (54 km/h) around a 50 m radius curve needs about 5,400 N of centripetal force.',
    solver: {
      defaultTarget: 'force',
      variables: [
        { id: 'force', label: 'Centripetal force', symbol: 'Fc', dimension: 'force', defaultValue: 5400, defaultUnit: 'N' },
        { id: 'mass', label: 'Mass', symbol: 'm', dimension: 'mass', defaultValue: 1200, defaultUnit: 'kg' },
        { id: 'speed', label: 'Speed', symbol: 'v', dimension: 'speed', defaultValue: 15, defaultUnit: 'm/s' },
        { id: 'radius', label: 'Radius', symbol: 'r', dimension: 'length', defaultValue: 50, defaultUnit: 'm' }
      ],
      solve: {
        force: ({ mass, speed, radius }) => (radius === 0 ? NaN : (mass * speed * speed) / radius),
        mass: ({ force, speed, radius }) => (speed === 0 ? NaN : (force * radius) / (speed * speed)),
        speed: ({ force, mass, radius }) => {
          if (mass <= 0) return NaN;
          const vSquared = (force * radius) / mass;
          return vSquared < 0 ? NaN : Math.sqrt(vSquared);
        },
        radius: ({ force, mass, speed }) => (force === 0 ? NaN : (mass * speed * speed) / force)
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is centripetal force?',
        paragraphs: [
          'Centripetal force is whatever net force keeps an object moving along a circular path instead of a straight line. It always points toward the center of the circle, which is why "centripetal" (Latin for "center-seeking") describes its direction, not a new kind of force in its own right — it is supplied by something real: the tension in a string, a road\'s friction on tires, gravity on an orbiting satellite, or the normal force from a curved track.',
          "Newton's first law says an object in motion keeps moving in a straight line unless a force acts on it. Anything moving in a circle is constantly changing direction, so it is constantly accelerating toward the center, even if its speed never changes. F = mv² ÷ r is just Newton's second law, F = ma, applied to that particular acceleration, a = v² ÷ r — the centripetal acceleration of uniform circular motion.",
          "The formula's v² term means speed matters far more than mass or radius: doubling how fast something goes around a curve quadruples the force needed to hold it on that path, while doubling the mass or the radius only doubles or halves the required force in proportion."
        ]
      },
      howTo: {
        intro: 'Fill in any three of centripetal force, mass, speed, and radius; the fourth fills in automatically.',
        steps: [
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit. The remaining field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 15 m/s becomes 54 km/h instead of silently turning into 15 km/h.' },
          { name: 'Read the result', text: 'The answer appears in your chosen force unit, alongside the main alternatives underneath.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The centripetal force formula rearranges to solve for mass, speed, or radius as well as force.',
        expression: 'Fc = m × v² ÷ r\nm = Fc × r ÷ v²\nv = √(Fc × r ÷ m)\nr = m × v² ÷ Fc',
        terms: [
          { symbol: 'Fc', meaning: 'Centripetal force, in newtons (N) — the net force directed toward the center of the circular path.' },
          { symbol: 'm', meaning: 'Mass of the object traveling the circular path, in kilograms (kg).' },
          { symbol: 'v', meaning: 'Speed along the circular path (tangent to the circle), in meters per second (m/s).' },
          { symbol: 'r', meaning: 'Radius of the circular path, in meters (m), measured from the center of the circle to the object.' }
        ],
        note: 'Every input is converted to SI units (N, kg, m/s, m) before solving and converted back afterward. This is uniform circular motion — constant speed around a fixed-radius circle — not a spiral or changing-radius path.'
      },
      workedExample: {
        intro: 'A 1,200 kg car corners at a steady 15 m/s (54 km/h) around a curve with a 50 m radius. How much centripetal force does it need?',
        rows: [
          { label: 'Mass (m)', value: '1,200 kg' },
          { label: 'Speed (v)', value: '15 m/s (54 km/h)' },
          { label: 'Radius (r)', value: '50 m' },
          { label: 'Centripetal force (Fc = 1,200 × 15² ÷ 50)', value: '5,400 N' }
        ],
        result: 'Fc = 5,400 N',
        explanation: '15² = 225, and 1,200 × 225 ÷ 50 = 5,400 N. On a flat road, that force comes entirely from friction between the tires and the pavement — if the required force exceeds the maximum friction available (see the friction calculator, f = μN), the car skids outward instead of holding the curve.'
      },
      watchOut: [
        {
          title: 'Centripetal force is not an extra force — it is the net result of real ones',
          body: "There is no separate \"centripetal\" push or pull acting on the object. It is whatever combination of tension, friction, gravity, or normal force already present happens to point toward the center and add up to mv² ÷ r. Identify the real forces first, then check whether their net total matches this formula."
        },
        {
          title: '"Centrifugal force" is not the reaction to this',
          body: 'The outward-feeling push passengers notice in a turning car is centrifugal force, a fictitious force that only appears when analyzing motion from inside the rotating frame. From outside, viewed in a stationary frame, the only real force is the inward centripetal one — there is no outward partner force pulling back.'
        },
        {
          title: 'Doubling speed quadruples the required force',
          body: 'Because speed is squared, a car cornering at 60 mph needs four times the centripetal force of the same car cornering at the same radius at 30 mph, not twice — a major reason highway curves post lower speed limits than straight sections.'
        },
        {
          title: 'This is uniform circular motion only',
          body: 'F = mv² ÷ r assumes constant speed around a fixed radius. An object speeding up or slowing down while turning, or spiraling in or out, has an additional tangential acceleration component that this formula does not capture.'
        },
        {
          title: 'Radius is to the object\'s path, not to an edge or a track width',
          body: "Use the radius of the circle the object's center of mass actually travels, measured from the true center of rotation — not the width of a track or the distance to a wall."
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §4.4 Uniform Circular Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/4-4-uniform-circular-motion' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'mass', label: 'Mass (kg)', type: 'number', placeholder: '1200', defaultValue: 1200, step: 1, min: 0 },
      { id: 'speed', label: 'Speed (m/s)', type: 'number', placeholder: '15', defaultValue: 15, step: 0.1, min: 0 },
      { id: 'radius', label: 'Radius (m)', type: 'number', placeholder: '50', defaultValue: 50, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Centripetal Force Calculator (F = mv²/r)',
      description: 'Free centripetal force calculator. Solve F = mv² ÷ r for force, mass, speed, or radius in N, kg, m/s, and m, with a worked cornering example.',
      faq: [
        { question: 'What is the formula for centripetal force?', answer: 'Fc = m × v² ÷ r, where m is mass, v is speed along the circular path, and r is the radius of the path. A 1,200 kg car at 15 m/s around a 50 m curve needs Fc = 1,200 × 15² ÷ 50 = 5,400 N.' },
        { question: 'What provides centripetal force in real situations?', answer: "It is never a separate force of its own — it is supplied by whatever real force happens to point toward the center: friction for a car cornering, tension for a ball on a string, gravity for an orbiting satellite, or the normal force on a banked track." },
        { question: 'Is centripetal force the same as centrifugal force?', answer: 'No. Centripetal force is the real, inward force that causes circular motion. Centrifugal force is an apparent outward force felt only inside a rotating frame of reference (like a passenger in a turning car) — it does not act on the object from outside that frame.' },
        { question: 'Does doubling speed double the force needed to corner?', answer: "No — it quadruples it, because speed is squared in the formula. A car cornering at 60 mph needs four times the centripetal force of the same car at 30 mph on the same curve." },
        { question: 'How do I find the maximum speed a car can corner at without skidding?', answer: 'Set the centripetal force equal to the maximum available friction force (f = μN, from the friction calculator) and solve for speed: v = √(μ × g × r). The exact limit depends on the tire-road coefficient of friction, μ.' },
        { question: 'What is centripetal acceleration?', answer: 'It is a = v² ÷ r, the acceleration directed toward the center that any object moving at constant speed on a circular path experiences. Multiplying it by mass (Newton\'s second law) gives the centripetal force, F = ma = mv² ÷ r.' }
      ]
    },
    compute(values) {
      return { force: (values.mass * values.speed * values.speed) / values.radius };
    }
  },
  {
    id: 'gravitational-force-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'Fg',
    updatedAt: '2026-11-16',
    aliases: ["newton's law of gravitation calculator", 'f = gm1m2/r2 calculator', 'gravitational attraction calculator', 'universal gravitation calculator', 'gravity between two masses calculator'],
    related: ['weight-calculator', 'force-calculator', 'centripetal-force-calculator'],
    title: 'Gravitational Force Calculator (F = Gm₁m₂/r²)',
    description: "Calculate the gravitational attraction between two masses using Newton's law of universal gravitation — F = Gm₁m₂ ÷ r² — or solve backward for a mass or the distance.",
    example: 'Earth (5.9722×10²⁴ kg) pulls a 70 kg person at its surface (6,371 km away from its center) with about 687.4 N of gravitational force.',
    solver: {
      defaultTarget: 'force',
      variables: [
        { id: 'force', label: 'Gravitational force', symbol: 'Fg', dimension: 'force', defaultValue: 687.42, defaultUnit: 'N' },
        { id: 'mass1', label: 'Mass 1', symbol: 'm₁', dimension: 'mass', defaultValue: 5.9722e24, defaultUnit: 'kg' },
        { id: 'mass2', label: 'Mass 2', symbol: 'm₂', dimension: 'mass', defaultValue: 70, defaultUnit: 'kg' },
        { id: 'distance', label: 'Distance between centers', symbol: 'r', dimension: 'length', defaultValue: 6.371e6, defaultUnit: 'm' }
      ],
      solve: {
        force: ({ mass1, mass2, distance }) => (distance === 0 ? NaN : (GRAVITATIONAL_CONSTANT * mass1 * mass2) / (distance * distance)),
        mass1: ({ force, mass2, distance }) => (mass2 === 0 ? NaN : (force * distance * distance) / (GRAVITATIONAL_CONSTANT * mass2)),
        mass2: ({ force, mass1, distance }) => (mass1 === 0 ? NaN : (force * distance * distance) / (GRAVITATIONAL_CONSTANT * mass1)),
        distance: ({ force, mass1, mass2 }) => {
          if (force <= 0) return NaN;
          const rSquared = (GRAVITATIONAL_CONSTANT * mass1 * mass2) / force;
          return rSquared < 0 ? NaN : Math.sqrt(rSquared);
        }
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is Newton\'s law of universal gravitation?',
        paragraphs: [
          "Every pair of masses in the universe attracts every other pair, with a force that grows with how much mass each one has and shrinks rapidly with the distance between them. Isaac Newton published this law in 1687: F = Gm₁m₂ ÷ r², where G is a fixed constant of nature that sets the overall strength of gravity for any two masses, anywhere.",
          "G, the gravitational constant, is tiny: 6.6743×10⁻¹¹ m³ kg⁻¹ s⁻² (CODATA 2022 / NIST recommended value). That smallness is why gravity between everyday objects — two people standing near each other, a book and a table — is far too weak to notice. Gravity only becomes a force you can feel when at least one of the masses involved is planet-sized.",
          "This calculator is distinct from the weight calculator (W = mg). Weight uses a fixed, local value of g that already accounts for a planet's rotation and shape; this page computes the raw gravitational pull between two specific masses at a specific distance from first principles, which is where that local g value actually comes from in the first place."
        ]
      },
      howTo: {
        intro: 'Fill in any three of gravitational force, the two masses, and the distance between their centers; the fourth fills in automatically.',
        steps: [
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit. The remaining field, marked auto, calculates as you type. The Earth-person default shows the force Earth exerts on a 70 kg person at its surface.' },
          { name: 'Measure distance center to center', text: 'The distance r is between the centers of the two masses, not between their surfaces — for a person standing on Earth, that means Earth\'s radius, not zero.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there without changing the underlying quantity.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: "Newton's law of universal gravitation rearranges to solve for either mass or the distance as well as the force.",
        expression: 'Fg = G × m₁ × m₂ ÷ r²\nm₁ = Fg × r² ÷ (G × m₂)\nm₂ = Fg × r² ÷ (G × m₁)\nr = √(G × m₁ × m₂ ÷ Fg)',
        terms: [
          { symbol: 'Fg', meaning: 'Gravitational force between the two masses, in newtons (N) — the same size on each mass, pulling them together.' },
          { symbol: 'G', meaning: 'The Newtonian constant of gravitation, 6.6743×10⁻¹¹ m³ kg⁻¹ s⁻² (CODATA 2022 / NIST recommended value). Fixed for any two masses anywhere.' },
          { symbol: 'm₁, m₂', meaning: 'The two masses, in kilograms (kg).' },
          { symbol: 'r', meaning: 'Distance between the centers of the two masses, in meters (m) — not the distance between their surfaces.' }
        ],
        note: 'Every input is converted to SI units (N, kg, m) before solving and converted back afterward. This treats both masses as point masses (or uniform spheres, which behave the same way at an external point) — valid for planets and everyday objects, but not for extremely close or oddly shaped masses.'
      },
      workedExample: {
        intro: "How hard does Earth's gravity pull on a 70 kg person standing at its surface?",
        rows: [
          { label: "Earth's mass (m₁)", value: '5.9722×10²⁴ kg (NASA Earth Fact Sheet)' },
          { label: 'Person\'s mass (m₂)', value: '70 kg' },
          { label: "Earth's mean radius (r)", value: '6,371 km = 6.371×10⁶ m (NASA Earth Fact Sheet)' },
          { label: 'Gravitational force (Fg = G × m₁ × m₂ ÷ r²)', value: '≈ 687.4 N' }
        ],
        result: 'Fg ≈ 687.4 N',
        explanation: "6.6743×10⁻¹¹ × 5.9722×10²⁴ × 70 ÷ (6.371×10⁶)² ≈ 687.4 N. That corresponds to an acceleration of Fg ÷ m₂ ≈ 9.820 m/s² — close to, but not exactly, the 9.80665 m/s² standard gravity used by the weight calculator, because standard gravity nets out small effects from Earth's rotation and slightly flattened shape that this pure two-mass formula does not include."
      },
      watchOut: [
        {
          title: "This is not the same thing as the weight calculator",
          body: "Weight (W = mg) uses a single, fixed local gravity value and is simple on purpose. Gravitational force (this page) computes the actual attraction between two specific masses at a specific distance using Newton's law — the two agree closely for an object at Earth's surface, but gravitational force is the more general, first-principles calculation, and the only one that works for other separations, like a satellite in orbit."
        },
        {
          title: 'Distance is between centers, not surfaces',
          body: "r is measured from the center of one mass to the center of the other. Standing on Earth's surface, r is Earth's radius (about 6,371 km) — not the (meaningless) zero distance to the ground directly underfoot."
        },
        {
          title: 'Gravity between everyday objects is far too weak to feel',
          body: 'Two 10 kg objects 1 m apart attract each other with only about 6.67×10⁻⁹ N — roughly a billion times weaker than the weight of a dust-sized grain. G is so small that only planet-sized masses produce gravity strong enough to notice.'
        },
        {
          title: 'Halving the distance quadruples the force',
          body: "Because distance is squared in the denominator, moving two masses to half their original separation makes the gravitational force between them four times stronger, not twice. The same squared relationship works in reverse: doubling the distance cuts the force to a quarter."
        },
        {
          title: 'This formula treats both masses as points (or uniform spheres)',
          body: "Newton's shell theorem shows a uniform sphere attracts external objects exactly as if all its mass were concentrated at its center, which is why this formula works for planets. It does not hold once two masses are close enough, or irregular enough, that their actual shapes matter."
        }
      ],
      references: [
        { label: "OpenStax, University Physics Volume 1, §13.1 Newton's Law of Universal Gravitation", url: 'https://openstax.org/books/university-physics-volume-1/pages/13-1-newtons-law-of-universal-gravitation' },
        { label: 'NIST, CODATA Value: Newtonian constant of gravitation', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?bg' },
        { label: 'NASA, Earth Fact Sheet (mass and mean radius)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' }
      ]
    },
    inputs: [
      { id: 'mass1', label: 'Mass 1 (kg)', type: 'number', placeholder: '5.9722e24', defaultValue: 5.9722e24, step: 1, min: 0 },
      { id: 'mass2', label: 'Mass 2 (kg)', type: 'number', placeholder: '70', defaultValue: 70, step: 0.1, min: 0 },
      { id: 'distance', label: 'Distance (m)', type: 'number', placeholder: '6371000', defaultValue: 6.371e6, step: 1, min: 0 }
    ],
    seo: {
      title: 'Gravitational Force Calculator (F = Gm₁m₂/r²)',
      description: "Free gravitational force calculator using Newton's law of universal gravitation. Solve for force, either mass, or distance, with a worked Earth-surface example.",
      faq: [
        { question: 'What is the formula for gravitational force?', answer: 'F = G × m₁ × m₂ ÷ r², where G = 6.6743×10⁻¹¹ m³ kg⁻¹ s⁻² (the CODATA/NIST recommended value), m₁ and m₂ are the two masses, and r is the distance between their centers.' },
        { question: 'What is the value of the gravitational constant G?', answer: 'G = 6.6743×10⁻¹¹ m³ kg⁻¹ s⁻², the CODATA 2022 / NIST recommended value. It is the same for any two masses anywhere in the universe.' },
        { question: 'How is this different from the weight calculator?', answer: "The weight calculator (W = mg) uses a fixed local gravity value, standard gravity on Earth. This calculator computes the actual gravitational attraction between two specific masses from Newton's law — more general, since it also works for other distances, like a satellite's altitude, not just a planet's surface." },
        { question: 'Why can\'t I feel the gravity of nearby objects?', answer: 'Because G is extremely small. Two 10 kg objects 1 m apart attract with only about 6.67×10⁻⁹ N, far too weak to detect without sensitive lab equipment. Gravity only becomes noticeable when at least one mass is planet-sized.' },
        { question: 'Does doubling the distance halve the gravitational force?', answer: 'No — it quarters it, because distance is squared in the denominator. Doubling the distance between two masses reduces the force to one-quarter of its original value; tripling the distance cuts it to one-ninth.' },
        { question: 'Why is the force on a 70 kg person at Earth\'s surface about 687.4 N, not exactly 686.5 N like the weight calculator gives?', answer: "Both are correct for what they measure. 686.5 N uses standard gravity (9.80665 m/s²), a fixed reference value that already nets out Earth's rotation and slightly flattened shape. 687.4 N is the pure Newtonian gravitational attraction, G × M_Earth × m ÷ r², with no adjustment for those effects — the two differ by less than 0.2%." }
      ]
    },
    compute(values) {
      return { force: (GRAVITATIONAL_CONSTANT * values.mass1 * values.mass2) / (values.distance * values.distance) };
    }
  },
  {
    id: 'torque-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'τ',
    updatedAt: '2026-11-16',
    aliases: ['torque formula calculator', 'moment of force calculator', 'wrench torque calculator', 'tau = fr sin theta calculator', 'rotational force calculator'],
    related: ['force-calculator', 'work-calculator', 'spring-hookes-law-calculator'],
    title: 'Torque Calculator (τ = Fr sin θ)',
    description: 'Calculate torque from force, lever arm length, and angle — τ = F × r × sin θ — or solve backward for force, radius, or angle, in N·m or lbf·ft.',
    example: 'A 100 N force applied perpendicular to a 0.3 m wrench produces 30 N·m of torque.',
    solver: {
      defaultTarget: 'torque',
      variables: [
        { id: 'torque', label: 'Torque', symbol: 'τ', dimension: 'torque', defaultValue: 30, defaultUnit: 'Nm' },
        { id: 'force', label: 'Force', symbol: 'F', dimension: 'force', defaultValue: 100, defaultUnit: 'N' },
        { id: 'radius', label: 'Lever arm length', symbol: 'r', dimension: 'length', defaultValue: 0.3, defaultUnit: 'm' },
        { id: 'angle', label: 'Angle', symbol: 'θ', dimension: 'angle', defaultValue: 90, defaultUnit: 'deg' }
      ],
      solve: {
        torque: ({ force, radius, angle }) => force * radius * Math.sin(angle),
        force: ({ torque, radius, angle }) => {
          const s = Math.sin(angle);
          return radius === 0 || s === 0 ? NaN : torque / (radius * s);
        },
        radius: ({ torque, force, angle }) => {
          const s = Math.sin(angle);
          return force === 0 || s === 0 ? NaN : torque / (force * s);
        },
        angle: ({ torque, force, radius }) => {
          if (force === 0 || radius === 0) return NaN;
          const s = torque / (force * radius);
          return s < -1 || s > 1 ? NaN : Math.asin(s);
        }
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is torque?',
        paragraphs: [
          "Torque is the rotational counterpart to force: it measures how much a force tends to twist or rotate something around a pivot point, rather than push it in a straight line. Pushing on a door far from its hinges swings it open easily; pushing with the same force right next to the hinges barely moves it — same force, very different torque, because torque depends on where and at what angle the force is applied, not just how hard.",
          "The formula, τ = F × r × sin θ, has three parts: the force F, the distance r from the pivot to where the force is applied (the lever arm), and the angle θ between the force and the lever arm. Only the component of force perpendicular to the lever arm actually causes rotation — a force pulling straight along the lever arm (θ = 0°) produces no torque at all, no matter how strong it is.",
          'The SI unit of torque, newton-meters (N·m), is the same combination of units as the joule — but torque and energy are different physical quantities measured the same way arithmetically, which is why torque is conventionally always reported in N·m, never in joules, to keep the two straight.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of torque, force, lever arm length, and angle; the fourth fills in automatically. Use 90° for a force applied straight-on (perpendicular), which is the everyday case for a wrench turning a bolt head-on.',
        steps: [
          { name: 'Enter the three values you know', text: 'Type each value and pick its unit. The remaining field, marked auto, calculates as you type.' },
          { name: 'Measure the angle correctly', text: 'θ is the angle between the applied force and the lever arm (the line from the pivot to where the force is applied) — not from the ground or from vertical. 90° (perpendicular) gives the maximum torque for a given force and distance.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 30 N·m becomes about 22.13 lbf·ft instead of silently turning into 30 lbf·ft.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The torque formula rearranges to solve for force, lever arm length, or angle as well as torque.',
        expression: 'τ = F × r × sin θ\nF = τ ÷ (r × sin θ)\nr = τ ÷ (F × sin θ)\nθ = sin⁻¹(τ ÷ (F × r))',
        terms: [
          { symbol: 'τ', meaning: 'Torque, in newton-meters (N·m) — the Greek letter tau.' },
          { symbol: 'F', meaning: 'Magnitude of the applied force, in newtons (N).' },
          { symbol: 'r', meaning: 'Lever arm length: the distance from the pivot (axis of rotation) to the point where the force is applied, in meters (m).' },
          { symbol: 'θ', meaning: 'Angle between the force vector and the lever arm. At 90° (perpendicular), sin θ = 1 and torque is maximized for a given F and r; at 0° or 180° (along the lever arm), sin θ = 0 and torque is zero.' }
        ],
        note: 'Every input is converted to SI units (N·m, N, m, rad) before solving and converted back afterward, so entering the angle in degrees works exactly as expected. This is the magnitude of torque about a single, fixed pivot; combining torques from several forces, or about different axes, is a separate calculation.'
      },
      workedExample: {
        intro: 'A mechanic pushes with 100 N of force, perpendicular to a 0.3 m wrench, to loosen a bolt. How much torque does that produce?',
        rows: [
          { label: 'Force (F)', value: '100 N' },
          { label: 'Lever arm length (r)', value: '0.3 m' },
          { label: 'Angle (θ)', value: '90°, sin 90° = 1' },
          { label: 'Torque (τ = 100 × 0.3 × 1)', value: '30 N·m' }
        ],
        result: 'τ = 30 N·m ≈ 22.13 lbf·ft',
        explanation: 'sin 90° = 1, so τ = 100 × 0.3 × 1 = 30 N·m. Pushing on the same wrench at 60° to its handle instead of straight-on (90°) would produce only 100 × 0.3 × sin 60° ≈ 25.98 N·m — about 86.6% as much torque — because only the perpendicular component of the push actually twists the bolt.'
      },
      watchOut: [
        {
          title: 'The angle is between the force and the lever arm, not from the ground',
          body: 'θ is specifically the angle between the direction of the applied force and the lever arm (the line from the pivot to where the force acts). Pulling or pushing exactly perpendicular to the lever arm (θ = 90°) gives the maximum torque for that force and distance; measuring from the wrong reference line is the most common error.'
        },
        {
          title: 'A force along the lever arm produces zero torque',
          body: 'At θ = 0° or 180°, sin θ = 0, so the torque is zero no matter how large the force is. Pulling straight out along a wrench handle, instead of swinging it, does not turn the bolt at all.'
        },
        {
          title: 'A longer lever arm multiplies torque for the same force',
          body: "This is why a longer wrench (or a \"cheater bar\" slipped over one) makes a bolt easier to turn: doubling the lever arm length doubles the torque from the same applied force, which is also the whole principle behind levers."
        },
        {
          title: 'N·m and joules use the same base units but are not interchangeable',
          body: 'Torque (N·m) and energy (J) both reduce to kg·m²/s² dimensionally, but they describe different physical situations — a twisting effect versus a transferred amount of energy. This page always reports torque in N·m or lbf·ft, never in joules.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §10.6 Torque', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-6-torque' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'force', label: 'Force (N)', type: 'number', placeholder: '100', defaultValue: 100, step: 0.1, min: 0 },
      { id: 'radius', label: 'Lever arm length (m)', type: 'number', placeholder: '0.3', defaultValue: 0.3, step: 0.01, min: 0 },
      { id: 'angle', label: 'Angle (rad)', type: 'number', placeholder: '1.5708', defaultValue: Math.PI / 2, step: 0.01 }
    ],
    seo: {
      title: 'Torque Calculator (τ = Fr sin θ) – Force, Radius or Angle',
      description: 'Free torque calculator. Solve τ = F × r × sin θ for torque, force, lever arm length, or angle in N·m or lbf·ft, with a worked wrench example.',
      faq: [
        { question: 'What is the formula for torque?', answer: 'τ = F × r × sin θ, where F is the applied force, r is the lever arm length (distance from the pivot), and θ is the angle between the force and the lever arm. A 100 N force applied perpendicular (90°) to a 0.3 m lever arm gives τ = 100 × 0.3 × 1 = 30 N·m.' },
        { question: 'What is the difference between torque and force?', answer: 'Force causes straight-line (linear) acceleration; torque causes rotational acceleration around a pivot. The same force produces more torque the farther it is applied from the pivot, and less torque the more it is aimed along the lever arm instead of perpendicular to it.' },
        { question: 'What angle gives the maximum torque?', answer: '90° (perpendicular) — sin 90° = 1, the largest value sine can take, so a force applied perpendicular to the lever arm produces the most torque possible for that force and distance.' },
        { question: 'How do I convert newton-meters to pound-feet?', answer: 'Divide by about 1.355818 (1 lbf·ft ≈ 1.355818 N·m). A torque of 30 N·m is about 30 ÷ 1.355818 ≈ 22.13 lbf·ft.' },
        { question: 'Why does a longer wrench make it easier to loosen a bolt?', answer: 'Torque is proportional to the lever arm length, so lengthening the wrench (or using a pipe as an extension) multiplies the torque produced by the same applied force — the basic principle behind every lever.' },
        { question: 'Can torque be zero even with a large force?', answer: 'Yes. If the force is applied exactly along the lever arm (θ = 0° or 180°), sin θ = 0, so the torque is zero no matter how strong the force is — all of the force goes into pulling or pushing along the lever rather than twisting it.' }
      ]
    },
    compute(values) {
      return { torque: values.force * values.radius * Math.sin(values.angle) };
    }
  },
  {
    id: 'buoyancy-calculator',
    category: 'physics',
    group: 'Fluids & Matter',
    glyph: 'Fb',
    updatedAt: '2026-11-16',
    aliases: ["archimedes' principle calculator", 'buoyant force calculator', 'f = rho v g calculator', 'displaced water force calculator', 'floating object calculator'],
    related: ['density-calculator', 'pressure-calculator', 'weight-calculator'],
    title: "Buoyancy Calculator (Archimedes' Principle, F = ρVg)",
    description: "Calculate the buoyant force on a submerged object using Archimedes' principle — F = fluid density × displaced volume × gravity — from the fluid's density and the volume displaced.",
    example: 'A 0.3 m cube (0.027 m³) fully submerged in fresh water experiences about 264.8 N of buoyant force, equal to the weight of 27 kg of water.',
    solver: {
      defaultTarget: 'buoyantForce',
      variables: [
        { id: 'buoyantForce', label: 'Buoyant force', symbol: 'Fb', dimension: 'force', defaultValue: 264.78, defaultUnit: 'N' },
        { id: 'fluidDensity', label: 'Fluid density', symbol: 'ρ', dimension: 'density', defaultValue: 1000, defaultUnit: 'kg/m3' },
        { id: 'volume', label: 'Displaced volume', symbol: 'V', dimension: 'volume', defaultValue: 0.027, defaultUnit: 'm3' }
      ],
      solve: {
        buoyantForce: ({ fluidDensity, volume }) => fluidDensity * volume * STANDARD_GRAVITY,
        fluidDensity: ({ buoyantForce, volume }) => (volume === 0 ? NaN : buoyantForce / (volume * STANDARD_GRAVITY)),
        volume: ({ buoyantForce, fluidDensity }) => (fluidDensity === 0 ? NaN : buoyantForce / (fluidDensity * STANDARD_GRAVITY))
      },
      outputs: [{ id: 'massDisplaced', label: 'Mass of fluid displaced (m = ρV)', dimension: 'mass', unit: 'kg', compute: (si) => si.fluidDensity * si.volume }]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: "What is Archimedes' principle?",
        paragraphs: [
          "Archimedes' principle, one of the oldest results in physics, says that any object submerged (fully or partly) in a fluid experiences an upward buoyant force equal to the weight of the fluid it pushes out of the way. A ship floats because it displaces a weight of water equal to its own weight; a stone sinks because even displacing its entire volume of water isn't enough weight to match the stone's own.",
          'Because the weight of the displaced fluid is mass times gravity, and the mass of displaced fluid is density times volume, the buoyant force works out to F = ρ × V × g: fluid density, times the volume actually displaced, times gravitational acceleration. Note that it depends on the fluid\'s density, not the submerged object\'s — the same stone displaces a lighter push from air than from water.',
          'Whether an object floats or sinks comes down to comparing densities: an object less dense than the fluid floats (and settles at the depth where the weight of fluid it displaces equals its own weight), while an object denser than the fluid sinks, because even full submersion cannot displace enough fluid weight to support it.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of buoyant force, the fluid\'s density, and the displaced volume; the third fills in automatically, alongside the mass of fluid that volume represents.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type. Gravity is fixed at standard gravity, 9.80665 m/s².' },
          { name: 'Use the volume actually displaced', text: "For a fully submerged object, that is the object's own volume. For a floating object, it is only the submerged portion's volume — not the whole object." },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 1,000 kg/m³ becomes 1 g/cm³ instead of silently turning into 1,000 g/cm³.' },
          { name: 'Read the result', text: 'The buoyant force appears in your chosen unit, alongside the mass of fluid that volume of displacement represents.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: "Archimedes' principle rearranges to solve for fluid density or displaced volume as well as buoyant force.",
        expression: 'F = ρ × V × g\nρ = F ÷ (V × g)\nV = F ÷ (ρ × g)',
        terms: [
          { symbol: 'F', meaning: 'Buoyant force, in newtons (N) — the upward push the fluid exerts on the submerged object.' },
          { symbol: 'ρ', meaning: "The fluid's density, in kilograms per cubic meter (kg/m³) or grams per cubic centimeter (g/cm³) — not the submerged object's density." },
          { symbol: 'V', meaning: 'Volume of fluid actually displaced, in cubic meters (m³) — the whole object\'s volume if fully submerged, or just the submerged portion if floating.' },
          { symbol: 'g', meaning: 'Gravitational acceleration, fixed here at standard gravity, 9.80665 m/s².' }
        ],
        note: 'Every input is converted to SI units (N, kg/m³, m³) before solving and converted back afterward. This gives the magnitude of the buoyant force; whether an object actually floats depends on comparing this force to the object\'s own weight.'
      },
      workedExample: {
        intro: 'A solid cube with 0.3 m sides (volume 0.027 m³) is fully submerged in fresh water. How much buoyant force does it experience?',
        rows: [
          { label: 'Fluid density (ρ, fresh water)', value: '1,000 kg/m³' },
          { label: 'Displaced volume (V = 0.3³)', value: '0.027 m³' },
          { label: 'Gravity (g)', value: '9.80665 m/s²' },
          { label: 'Buoyant force (F = 1,000 × 0.027 × 9.80665)', value: '264.78 N' }
        ],
        result: 'F ≈ 264.78 N (mass of water displaced ≈ 27 kg)',
        explanation: "1,000 × 0.027 = 27 kg of water displaced, and 27 × 9.80665 ≈ 264.78 N of buoyant force pushing up on the cube. The same cube fully submerged in seawater (density about 1,025 kg/m³) would feel about 271.40 N instead — about 2.5% more buoyant force, because seawater is denser than fresh water."
      },
      watchOut: [
        {
          title: "It's the fluid's density that matters, not the object's",
          body: "A common mix-up: buoyant force depends on the displacing fluid's density (water, air, oil), not the submerged object's own density. The object's density only matters for working out how much of it submerges, or whether it sinks."
        },
        {
          title: 'Use the submerged volume, not the total volume, for a floating object',
          body: "A floating object only displaces the volume of fluid below the waterline. Plugging in its full volume instead of just the submerged portion overstates the buoyant force — this formula requires the volume actually displaced."
        },
        {
          title: 'Buoyant force alone does not tell you whether something floats',
          body: "An object floats only if the buoyant force at full submersion would exceed its own weight; otherwise it sinks and settles on the bottom. Comparing this calculator's output to the object's weight (see the weight calculator, W = mg) answers that question."
        },
        {
          title: 'This gives the magnitude of buoyant force, not net force',
          body: "The net force on a submerged object is buoyant force minus weight (plus any other forces present). A result here larger than the object's weight means it accelerates upward; smaller means it sinks, not that buoyancy is somehow wrong."
        }
      ],
      references: [
        { label: "OpenStax, University Physics Volume 1, §14.4 Archimedes' Principle and Buoyancy", url: 'https://openstax.org/books/university-physics-volume-1/pages/14-4-archimedes-principle-and-buoyancy' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'fluidDensity', label: 'Fluid density (kg/m³)', type: 'number', placeholder: '1000', defaultValue: 1000, step: 1, min: 0 },
      { id: 'volume', label: 'Displaced volume (m³)', type: 'number', placeholder: '0.027', defaultValue: 0.027, step: 0.001, min: 0 }
    ],
    seo: {
      title: "Buoyancy Calculator (Archimedes' Principle, F = ρVg)",
      description: "Free buoyancy calculator using Archimedes' principle. Solve F = ρ × V × g for buoyant force, fluid density, or displaced volume, with a worked example.",
      faq: [
        { question: "What is Archimedes' principle?", answer: 'It states that the buoyant force on a submerged (or partly submerged) object equals the weight of the fluid it displaces: F = ρ × V × g, using the fluid\'s density, the displaced volume, and gravity.' },
        { question: 'How do I calculate buoyant force?', answer: 'Multiply the fluid\'s density by the displaced volume and by gravity: F = ρ × V × g. A 0.027 m³ object fully submerged in fresh water (1,000 kg/m³) feels 1,000 × 0.027 × 9.80665 ≈ 264.78 N of buoyant force.' },
        { question: 'Does buoyant force depend on how deep an object is submerged?', answer: 'Not directly — it depends on the volume of fluid displaced, not the depth. A fully submerged object displaces the same volume (and feels the same buoyant force) whether it is just below the surface or far underwater, as long as the fluid\'s density stays roughly constant.' },
        { question: 'Why do objects float in salt water more easily than fresh water?', answer: 'Salt water is denser (about 1,025 kg/m³ versus 1,000 kg/m³ for fresh water), so the same displaced volume produces a larger buoyant force — about 2.5% more for seawater than fresh water, which is why it is easier to float in the ocean than in a freshwater pool.' },
        { question: 'What decides whether something floats or sinks?', answer: "Comparing densities: an object less dense than the fluid floats, because it can displace enough fluid weight to equal its own weight before fully submerging. An object denser than the fluid sinks, because even full submersion can't displace enough fluid weight to support it." },
        { question: 'What volume should I use for a floating object?', answer: 'Only the submerged portion\'s volume, not the object\'s total volume. A floating object displaces just enough fluid, below the waterline, to equal its own weight — the volume above the surface displaces nothing.' }
      ]
    },
    compute(values) {
      return { buoyantForce: values.fluidDensity * values.volume * STANDARD_GRAVITY };
    }
  },
  {
    id: 'pendulum-period-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'T',
    updatedAt: '2026-11-16',
    aliases: ['simple pendulum calculator', 't = 2 pi sqrt(l/g) calculator', 'pendulum swing time calculator', 'pendulum length calculator', 'period of oscillation calculator'],
    related: ['free-fall-calculator', 'spring-hookes-law-calculator', 'weight-calculator'],
    title: 'Pendulum Period Calculator (T = 2π√(L/g))',
    description: 'Calculate the period of a simple pendulum from its length and local gravity — T = 2π × √(L ÷ g) — or solve backward for length or gravity, for small swing angles.',
    example: 'A 1 m pendulum on Earth takes about 2.006 seconds to complete one full swing back and forth.',
    solver: {
      defaultTarget: 'period',
      variables: [
        { id: 'period', label: 'Period', symbol: 'T', dimension: 'time', defaultValue: 2.0064, defaultUnit: 's' },
        { id: 'length', label: 'Pendulum length', symbol: 'L', dimension: 'length', defaultValue: 1, defaultUnit: 'm' },
        { id: 'gravity', label: 'Gravity', symbol: 'g', dimension: 'acceleration', defaultValue: STANDARD_GRAVITY, defaultUnit: 'm/s2' }
      ],
      solve: {
        period: ({ length, gravity }) => (gravity <= 0 || length < 0 ? NaN : 2 * Math.PI * Math.sqrt(length / gravity)),
        length: ({ period, gravity }) => gravity * (period / (2 * Math.PI)) ** 2,
        gravity: ({ period, length }) => (period === 0 ? NaN : length * (2 * Math.PI / period) ** 2)
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is a simple pendulum?',
        paragraphs: [
          'A simple pendulum is a mass (the "bob") swinging from a fixed point on a string or rod of length L, light enough and rigid enough that essentially all the swinging mass sits at the bob. For small swings, it takes the same amount of time, the period T, to complete each back-and-forth cycle, no matter how wide (within reason) or how heavy the bob is — a surprising, useful fact first worked out rigorously by Christiaan Huygens in the 17th century, building on Galileo\'s earlier observations.',
          "The formula, T = 2π√(L ÷ g), depends only on the pendulum's length and the local gravitational acceleration, g. A longer pendulum swings more slowly (a grandfather clock's pendulum is long on purpose, to tick once per second); stronger gravity makes it swing faster, which is why the same pendulum ticks at a different rate on the Moon.",
          'This independence from mass and (for small angles) amplitude made pendulums the basis of the most accurate clocks for nearly three centuries, from Huygens\' 1656 pendulum clock until quartz and atomic clocks took over in the 20th century.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the period, the pendulum length, and gravity; the third fills in automatically.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type. Leave gravity at 9.80665 m/s² for Earth.' },
          { name: 'Try another world', text: "Replace gravity with another body's surface value — 1.62 m/s² for the Moon, for example — to see how the same pendulum swings elsewhere." },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 1 m becomes 3.28 ft instead of silently turning into 1 ft.' },
          { name: 'Share or copy', text: 'Share result copies a link with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The simple pendulum formula rearranges to solve for length or gravity as well as period.',
        expression: 'T = 2π × √(L ÷ g)\nL = g × (T ÷ 2π)²\ng = L × (2π ÷ T)²',
        terms: [
          { symbol: 'T', meaning: 'Period: the time for one complete back-and-forth swing, in seconds (s).' },
          { symbol: 'L', meaning: 'Length of the pendulum, from the pivot to the center of the bob, in meters (m).' },
          { symbol: 'g', meaning: 'Local gravitational acceleration, in m/s². Standard gravity on Earth is exactly 9.80665 m/s² by definition.' }
        ],
        note: "This formula is the small-angle approximation: it assumes the maximum swing angle is small, conventionally under about 15° (OpenStax University Physics Volume 1 §15.4), where sin θ and θ (in radians) differ by less than 1%. It also assumes no air resistance or friction at the pivot, and all the mass concentrated at a single point (the bob)."
      },
      workedExample: {
        intro: 'A pendulum is 1 meter long. How long does it take to complete one full swing on Earth?',
        rows: [
          { label: 'Length (L)', value: '1 m' },
          { label: 'Gravity (g)', value: '9.80665 m/s²' },
          { label: 'Period (T = 2π × √(1 ÷ 9.80665))', value: '≈ 2.006 s' }
        ],
        result: 'T ≈ 2.006 s',
        explanation: "√(1 ÷ 9.80665) ≈ 0.3193, and 2π × 0.3193 ≈ 2.006 s. A pendulum built to tick exactly one full swing every 2 seconds (a classic \"seconds pendulum\") would need to be very slightly shorter, about 0.9936 m. On the Moon, where gravity is about 1.62 m/s², the same 1 m pendulum would take about 4.937 s per swing — more than twice as long, because gravity there is about six times weaker."
      },
      watchOut: [
        {
          title: 'This only holds for small swing angles',
          body: "T = 2π√(L ÷ g) is the small-angle approximation, accurate for swings under about 15° from vertical. Swung wider than that, a real pendulum's period starts increasing noticeably beyond what this formula predicts, and the simple formula no longer applies."
        },
        {
          title: "The period doesn't depend on the mass of the bob",
          body: "A heavier bob and a lighter one, on the same length of string, swing with the same period — a common point of confusion, since heavier objects often seem like they should swing slower. Mass does not appear anywhere in the formula."
        },
        {
          title: "Real pendulums lose energy to friction and air resistance",
          body: "This formula describes an idealized pendulum with no damping. A real one gradually loses amplitude over time from air drag and friction at the pivot, though — as long as the angle stays small — its period barely changes as it winds down."
        },
        {
          title: 'Length is to the center of the bob, not the string alone',
          body: "L is measured from the pivot to the pendulum's center of mass, which for a bob of any real size is at its center, not at the point where the string attaches. For a small, dense bob on a light string, the difference is usually negligible."
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §15.4 Pendulums', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums' },
        { label: 'NASA, Moon Fact Sheet (surface gravity)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'length', label: 'Pendulum length (m)', type: 'number', placeholder: '1', defaultValue: 1, step: 0.01, min: 0 },
      { id: 'gravity', label: 'Gravity (m/s²)', type: 'number', placeholder: '9.80665', defaultValue: STANDARD_GRAVITY, step: 0.01 }
    ],
    seo: {
      title: 'Pendulum Period Calculator (T = 2π√(L/g))',
      description: 'Free pendulum period calculator. Solve T = 2π√(L ÷ g) for period, length, or gravity for a simple pendulum, with a worked example and small-angle notes.',
      faq: [
        { question: 'What is the formula for the period of a pendulum?', answer: 'T = 2π × √(L ÷ g), where L is the pendulum\'s length and g is local gravitational acceleration. A 1 m pendulum on Earth (g = 9.80665 m/s²) has a period of about 2.006 seconds.' },
        { question: 'Does the mass of the pendulum bob affect its period?', answer: "No. The period depends only on the pendulum's length and local gravity — mass does not appear in the formula at all, so a heavy bob and a light one on the same length swing at the same rate." },
        { question: 'Does the swing angle affect the period?', answer: 'For small angles (under about 15°), barely at all — that is the small-angle approximation this formula uses. Swung much wider than that, the real period increases beyond what T = 2π√(L ÷ g) predicts.' },
        { question: 'How long should a pendulum be to tick once per second?', answer: 'A "seconds pendulum," with a period of 2 seconds (one tick each way), needs a length of about 0.9936 m on Earth, from L = g × (T ÷ 2π)² with T = 2 s.' },
        { question: 'How would a pendulum behave on the Moon?', answer: "Slower. With the Moon's gravity of about 1.62 m/s², a 1 m pendulum has a period of about 4.937 s, versus about 2.006 s on Earth — more than twice as long, because weaker gravity gives the pendulum less restoring force to swing back with." },
        { question: 'How do I find the length of a pendulum from its measured period?', answer: 'Rearrange the formula to L = g × (T ÷ 2π)². A pendulum with a measured period of 1.7357 s, using standard gravity (9.80665 m/s²), works out to a length of about 0.748 m.' }
      ]
    },
    compute(values) {
      return { period: 2 * Math.PI * Math.sqrt(values.length / values.gravity) };
    }
  },
  {
    id: 'horsepower-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'hp',
    updatedAt: '2026-11-16',
    aliases: ['horsepower from torque and rpm calculator', 'torque to horsepower calculator', 'engine horsepower calculator', 'torque rpm horsepower calculator', 'dyno horsepower calculator'],
    related: ['torque-calculator', 'power-calculator', 'power-converter', 'rpm-to-speed-calculator'],
    title: 'Horsepower Calculator (P = τω)',
    description: 'Find horsepower from torque and RPM — P = τ × ω — the way a dyno sheet actually reports engine power, or solve backward for torque or RPM.',
    example: 'An engine making 300 lb-ft of torque at 4,000 RPM produces about 228.5 horsepower (170.4 kW).',
    solver: {
      defaultTarget: 'power',
      variables: [
        { id: 'power', label: 'Power', symbol: 'P', dimension: 'power', defaultValue: 228.4795, defaultUnit: 'hp' },
        { id: 'torque', label: 'Torque', symbol: 'τ', dimension: 'torque', defaultValue: 300, defaultUnit: 'lbfft' },
        { id: 'rpm', label: 'Rotational speed', symbol: 'ω', dimension: 'angularVelocity', defaultValue: 4000, defaultUnit: 'rpm' }
      ],
      solve: {
        power: ({ torque, rpm }) => torque * rpm,
        torque: ({ power, rpm }) => (rpm === 0 ? NaN : power / rpm),
        rpm: ({ power, torque }) => (torque === 0 ? NaN : power / torque)
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is horsepower, calculated from torque and RPM?',
        paragraphs: [
          "An engine, motor or any other rotating machine delivers power by twisting a shaft: it applies some amount of torque while that shaft spins at some rotational speed. Power is the product of the two — P = τ × ω — which is exactly how a dynamometer arrives at the horsepower figure on an engine's spec sheet: it measures torque directly at a range of engine speeds and multiplies by the rotation rate at each point, rather than measuring power on its own.",
          'This is a genuinely different calculation from simply converting an existing power figure from one unit to another (watts to horsepower, say). If a number is already in kilowatts or BTU/h and the only thing needed is the same power re-expressed in horsepower, the power converter on this site handles that unit conversion directly. This page is for the opposite, more common engineering question: given a torque reading and an engine speed, what power does that combination actually represent?',
          'Mechanical horsepower itself, 550 foot-pounds-force per second (exactly 745.69987158227 W), traces back to James Watt\'s 18th-century comparison of a steam engine to a draft horse. The formula below produces the same watts regardless of which horsepower-like unit the result is finally displayed in.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of power, torque, and rotational speed; the third fills in automatically, so the same page answers "how much power", "how much torque" and "what RPM" questions.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit from the menu beside it — torque in N·m or lbf·ft, rotational speed in RPM, rad/s or deg/s. The third field, marked auto, fills in as you type.' },
          { name: 'Switch which one is calculated', text: 'To solve for a different quantity, type into the auto field. It becomes an input, and the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so 300 lbf·ft becomes about 406.75 N·m instead of silently turning into 300 N·m.' },
          { name: 'Read the result', text: 'Power appears in your chosen unit — watts, kilowatts or horsepower — with the other common units shown underneath.' },
          { name: 'Share or copy', text: 'Share result copies a link that reopens the calculator with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Power is torque times angular velocity; angular velocity itself comes from RPM through a fixed conversion factor, so the formula rearranges three ways.',
        expression: 'P = τ × ω\nω = RPM × 2π ÷ 60\nτ = P ÷ ω\nRPM = (P ÷ τ) × 60 ÷ 2π',
        terms: [
          { symbol: 'P', meaning: 'Power, in watts (W). The calculator also displays kilowatts and horsepower.' },
          { symbol: 'τ', meaning: 'Torque, in newton-meters (N·m) or pound-feet (lbf·ft) — the Greek letter tau.' },
          { symbol: 'ω', meaning: 'Angular velocity, in radians per second (rad/s). RPM (revolutions per minute) converts to rad/s by multiplying by 2π ÷ 60 ≈ 0.10472 (OpenStax University Physics Volume 1 §10.1, confirmed against its own Example 10.2: 250 rev/min = 26.2 rad/s).' },
          { symbol: '5252', meaning: 'A well-known automotive shortcut: hp = (lbf·ft × RPM) ÷ 5252.113, exact from 33,000 ft·lbf/min ÷ 2π rad/rev — the reason a torque curve in lbf·ft and a horsepower curve numerically cross on a dyno chart at exactly 5,252 RPM.' }
        ],
        note: 'Every input is converted to SI units (N·m, rad/s, W) before solving and converted back afterward, so mixing lbf·ft with RPM, or N·m with rad/s, cannot produce a wrong result.'
      },
      workedExample: {
        intro: 'An engine on a dynamometer produces 300 lb-ft of torque at 4,000 RPM. How much power is that?',
        rows: [
          { label: 'Torque (τ)', value: '300 lbf·ft = 406.75 N·m' },
          { label: 'Rotational speed', value: '4,000 RPM = 418.88 rad/s' },
          { label: 'Power (P = τ × ω)', value: '406.75 × 418.88 ≈ 170,377 W' }
        ],
        result: 'P ≈ 170.4 kW ≈ 228.5 hp',
        explanation: 'Converting 4,000 RPM to rad/s (×2π÷60) gives 418.88 rad/s; multiplying by the torque in N·m gives 170,377 W, which is 170.38 kW or about 228.48 hp. The automotive shortcut gives the same answer directly in horsepower: 300 × 4,000 ÷ 5,252.113 ≈ 228.48 hp — using the commonly rounded constant 5,252 instead gives 228.48 hp too, about 0.002% different, not enough to matter at any normal number of significant figures.'
      },
      watchOut: [
        {
          title: 'This is a formula, not the power converter\'s unit conversion',
          body: 'If a power figure is already known in one unit and the only thing needed is the same number in horsepower or kilowatts, use the power converter instead. This calculator exists specifically for the case where only torque and rotational speed are known, and power has not been measured directly.'
        },
        {
          title: 'The 5,252 RPM "crossover point" is a unit artifact, not a physical event',
          body: 'On a dyno chart plotting lbf·ft and horsepower on the same axis, the two curves always cross at 5,252 RPM, because at that exact speed the conversion factor from lbf·ft to hp equals 1. Nothing physically special happens to the engine there — it is purely a consequence of mixing lbf·ft and horsepower on one chart.'
        },
        {
          title: 'This is power at one instant, not the engine\'s peak rating',
          body: 'An engine\'s torque and horsepower both vary across its RPM range. A single torque-and-RPM pair gives the power at that one operating point; the number printed on a spec sheet ("300 hp") is usually the highest value across the whole curve, not the value at idle or at redline.'
        },
        {
          title: 'This is the power delivered by the shaft, not what reaches the wheels',
          body: 'Gearbox, driveline and tire losses mean the power actually delivered to the road is less than the power this formula gives at the engine\'s output shaft — see the efficiency calculator for how to apply a drivetrain loss percentage to this figure.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §10.8 Work and Power for Rotational Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-8-work-and-power-for-rotational-motion' },
        { label: 'OpenStax, University Physics Volume 1, §10.1 Rotational Variables', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-1-rotational-variables' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'torque', label: 'Torque (N·m)', type: 'number', placeholder: '406.75', defaultValue: 406.7454310743, step: 0.1, min: 0 },
      { id: 'rpm', label: 'Rotational speed (rad/s)', type: 'number', placeholder: '418.88', defaultValue: 4000 * ((2 * Math.PI) / 60), step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Horsepower Calculator (P = τω) – Torque to HP',
      description: 'Free horsepower calculator. Find horsepower from torque and RPM (P = τω), or solve for torque or RPM, in hp, kW or N·m, with a worked example.',
      faq: [
        { question: 'How do I calculate horsepower from torque and RPM?', answer: 'Multiply torque by angular velocity: P = τ × ω, where ω = RPM × 2π ÷ 60. A 300 lbf·ft (406.75 N·m) torque at 4,000 RPM (418.88 rad/s) gives P ≈ 170,377 W, which is about 228.5 hp.' },
        { question: 'Is this the same as the power converter?', answer: 'No. The power converter re-expresses an already-known power figure in a different unit (watts to horsepower). This calculator computes power from torque and rotational speed, a different formula entirely — it also solves backward for torque or RPM.' },
        { question: 'Why does a dyno chart show torque and horsepower crossing at 5,252 RPM?', answer: 'Because hp = (lbf·ft × RPM) ÷ 5,252.113, exact from 33,000 ft·lbf/min ÷ 2π. At exactly 5,252 RPM, that conversion factor equals 1, so the torque number in lbf·ft and the horsepower number become numerically equal — a unit artifact of plotting both on the same axis, not a physical event in the engine.' },
        { question: 'How many kilowatts is 300 lb-ft of torque at 4,000 RPM?', answer: 'About 170.4 kW (228.5 hp). Convert the torque to N·m (406.75), the speed to rad/s (418.88), and multiply: 406.75 × 418.88 ≈ 170,377 W.' },
        { question: 'Does horsepower go up with RPM even if torque stays flat?', answer: 'Yes. Since P = τ × ω, power rises in direct proportion to RPM whenever torque is unchanged — doubling the RPM at the same torque exactly doubles the power.' },
        { question: 'What is the SI formula behind this calculator?', answer: 'P = τω, with torque in newton-meters, angular velocity in radians per second, and power in watts (OpenStax University Physics Volume 1 §10.8). RPM-based and lbf·ft-based figures are converted to this SI form before solving.' }
      ]
    },
    compute(values) {
      return { power: values.torque * values.rpm };
    }
  },
  {
    id: 'rpm-to-speed-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'v=rω',
    updatedAt: '2026-11-16',
    aliases: ['wheel rpm to speed calculator', 'rpm to mph calculator', 'rotational speed to linear speed calculator', 'wheel speed calculator', 'tire rpm to speed calculator'],
    related: ['angular-velocity-calculator', 'speed-distance-time-calculator', 'gear-ratio-calculator', 'speed-converter'],
    title: 'RPM to Speed Calculator (v = rω)',
    description: 'Convert a wheel\'s rotational speed (RPM) to its linear travel speed, given the wheel\'s diameter — v = ω × r — or solve backward for RPM or diameter.',
    example: 'A 0.65 m wheel spinning at 800 RPM is moving at about 27.23 m/s — 98.02 km/h, or 60.91 mph.',
    solver: {
      defaultTarget: 'speed',
      variables: [
        { id: 'speed', label: 'Linear speed', symbol: 'v', dimension: 'speed', defaultValue: 98.0177, defaultUnit: 'km/h' },
        { id: 'diameter', label: 'Wheel diameter', symbol: 'D', dimension: 'length', defaultValue: 0.65, defaultUnit: 'm' },
        { id: 'rpm', label: 'Rotational speed', symbol: 'ω', dimension: 'angularVelocity', defaultValue: 800, defaultUnit: 'rpm' }
      ],
      solve: {
        speed: ({ diameter, rpm }) => rpm * (diameter / 2),
        diameter: ({ speed, rpm }) => (rpm === 0 ? NaN : (speed / rpm) * 2),
        rpm: ({ speed, diameter }) => (diameter === 0 ? NaN : speed / (diameter / 2))
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is the relationship between RPM and linear speed?',
        paragraphs: [
          "A wheel, tire or pulley rotating at some number of revolutions per minute is also moving forward (or feeding material, or spinning a belt) at a linear speed that depends on how big the wheel is. The same rotational speed produces a much higher linear speed on a large wheel than on a small one, because every point on the rim of a bigger wheel has farther to travel to complete one full turn.",
          'The link between the two is the tangential-velocity formula from rotational kinematics, v = rω (OpenStax University Physics Volume 1 §10.3): linear speed equals the radius times the angular velocity. Converting a rotational speed given in RPM first requires turning it into radians per second (multiplying by 2π ÷ 60), which this calculator does automatically.',
          "This is exactly the calculation behind a car's speedometer (which infers road speed from wheel RPM and tire size), a conveyor belt's feed rate, or a bicycle's speed from its wheel and cadence — any situation where something known to be spinning at a certain rate needs to be translated into how fast it is actually traveling."
        ]
      },
      howTo: {
        intro: 'Fill in any two of linear speed, wheel diameter, and rotational speed; the third fills in automatically.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit — diameter in meters, feet or inches, rotational speed in RPM, rad/s or deg/s. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'To solve for a different quantity, type into the auto field. It becomes an input, and the field left alone longest becomes the new calculated one.' },
          { name: 'Use the wheel\'s outer diameter', text: 'Measure across the full rolling diameter (including tire tread, if any) — not the radius, and not the rim diameter alone.' },
          { name: 'Read the result', text: 'Linear speed appears in your chosen unit — m/s, km/h or mph — with the other common units shown underneath.' },
          { name: 'Share or copy', text: 'Share result copies a link that reopens the calculator with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Linear speed is radius times angular velocity; angular velocity itself comes from RPM through a fixed conversion factor.',
        expression: 'v = r × ω\nω = RPM × 2π ÷ 60\nr = D ÷ 2\nv = (D ÷ 2) × RPM × 2π ÷ 60 = π × D × (RPM ÷ 60)',
        terms: [
          { symbol: 'v', meaning: 'Linear (tangential) speed of a point on the wheel\'s rim, in m/s, km/h or mph.' },
          { symbol: 'r, D', meaning: 'Radius and diameter of the wheel, D = 2r, in meters, feet or inches.' },
          { symbol: 'ω', meaning: 'Angular velocity, in radians per second — RPM converts to rad/s by multiplying by 2π ÷ 60.' },
          { symbol: 'π × D', meaning: 'The wheel\'s circumference: the distance the rim travels in one full revolution. Multiplying by revolutions per second (RPM ÷ 60) gives the same answer as v = rω, just written as "circumference × rotation rate" instead.' }
        ],
        note: 'Every input is converted to SI units (m, rad/s, m/s) before solving and converted back afterward, so mixing a diameter in inches with a speed in RPM-derived mph cannot produce a wrong result. This assumes the wheel rolls without slipping; a spinning or skidding wheel\'s rim speed and the vehicle\'s actual travel speed are not the same thing.'
      },
      workedExample: {
        intro: 'A wheel 0.65 m in diameter (about 25.6 inches, a typical passenger-car tire) spins at 800 RPM. How fast is the vehicle moving?',
        rows: [
          { label: 'Diameter (D)', value: '0.65 m, so radius r = 0.325 m' },
          { label: 'Rotational speed', value: '800 RPM = 83.78 rad/s' },
          { label: 'Linear speed (v = r × ω)', value: '0.325 × 83.78 ≈ 27.23 m/s' }
        ],
        result: 'v ≈ 27.23 m/s · 98.02 km/h · 60.91 mph',
        explanation: '800 RPM converts to 83.78 rad/s (×2π÷60). Multiplying by the 0.325 m radius gives 27.23 m/s, which is 27.23 × 3.6 = 98.02 km/h, or about 60.91 mph. The same answer comes from treating it as circumference times rotation rate: π × 0.65 m × (800 ÷ 60 rev/s) ≈ 27.23 m/s.'
      },
      watchOut: [
        {
          title: 'Use the rolling (outer) diameter, not the rim diameter',
          body: 'A tire\'s actual rolling diameter is larger than the bare wheel rim it is mounted on. Using the rim size instead of the full tire-and-rim diameter understates the true linear speed for any given RPM.'
        },
        {
          title: 'This assumes rolling without slipping',
          body: 'The formula gives the speed of a point on the rim relative to the wheel\'s axle, which only equals the vehicle\'s travel speed if the wheel is rolling on the ground without skidding or spinning in place. Wheelspin or wheel lock-up breaks that link.'
        },
        {
          title: 'RPM here means the wheel\'s own RPM, not the engine\'s',
          body: 'In a geared vehicle, the engine or motor spins much faster than the wheel. Use the gear ratio calculator first to convert an engine or motor RPM down to the actual wheel RPM before using this page.'
        },
        {
          title: 'Bigger wheels travel faster at the same RPM',
          body: 'Fitting a larger-diameter wheel or tire without changing anything else increases the linear speed for the same rotational speed — which is also why a speedometer calibrated for one tire size reads slightly wrong after a tire-size change.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §10.3 Relating Angular and Translational Quantities', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-3-relating-angular-and-translational-quantities' },
        { label: 'OpenStax, University Physics Volume 1, §10.1 Rotational Variables', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-1-rotational-variables' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, conversion factors)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'diameter', label: 'Wheel diameter (m)', type: 'number', placeholder: '0.65', defaultValue: 0.65, step: 0.01, min: 0 },
      { id: 'rpm', label: 'Rotational speed (rad/s)', type: 'number', placeholder: '83.78', defaultValue: 800 * ((2 * Math.PI) / 60), step: 0.1, min: 0 }
    ],
    seo: {
      title: 'RPM to Speed Calculator (v = rω) – Wheel RPM to mph',
      description: 'Free RPM to speed calculator. Convert a wheel\'s RPM to linear speed given its diameter (v = rω), or solve for RPM or diameter, in m/s, km/h or mph.',
      faq: [
        { question: 'How do I convert RPM to linear speed?', answer: 'Multiply the wheel\'s radius by its angular velocity: v = r × ω, where ω = RPM × 2π ÷ 60. A 0.65 m wheel at 800 RPM gives ω ≈ 83.78 rad/s and v ≈ 27.23 m/s (about 98.02 km/h or 60.91 mph).' },
        { question: 'What is the formula for converting RPM to mph?', answer: 'v = π × D × (RPM ÷ 60), with D the wheel\'s diameter. This gives speed in the same length unit as D per second; convert that to mph afterward (divide m/s by 0.44704, or let the calculator\'s unit menu do it).' },
        { question: 'Does a bigger wheel go faster at the same RPM?', answer: 'Yes. Linear speed is proportional to the wheel\'s diameter for a fixed RPM, so a larger wheel covers more distance per revolution and therefore travels faster at the same rotational speed.' },
        { question: 'Is this the wheel\'s RPM or the engine\'s RPM?', answer: 'This calculator uses the wheel\'s own RPM. If only the engine or motor RPM is known, first divide it by the overall gear ratio (the gear ratio calculator) to get the wheel\'s actual RPM.' },
        { question: 'Does this work for a skidding or spinning wheel?', answer: 'No. The formula assumes the wheel is rolling on the surface without slipping. A wheel that is skidding or spinning in place has a rim speed that no longer matches the vehicle\'s actual travel speed.' },
        { question: 'How do I find the RPM needed for a target speed?', answer: 'Rearrange the formula to RPM = v ÷ (π × D) × 60. For a target speed of 27.23 m/s on a 0.65 m wheel: 27.23 ÷ (π × 0.65) × 60 ≈ 800 RPM.' }
      ]
    },
    compute(values) {
      return { speed: values.rpm * (values.diameter / 2) };
    }
  },
  {
    id: 'gear-ratio-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'GR',
    updatedAt: '2026-11-16',
    aliases: ['gear ratio formula calculator', 'driven to drive gear ratio calculator', 'output rpm calculator', 'gear teeth ratio calculator', 'transmission gear ratio calculator'],
    related: ['rpm-to-speed-calculator', 'torque-calculator', 'horsepower-calculator', 'angular-velocity-calculator'],
    title: 'Gear Ratio Calculator',
    description: 'Calculate gear ratio from the driven and drive gears\' tooth counts, and the output RPM that ratio produces from a given input RPM.',
    example: 'A 41-tooth driven gear turned by a 12-tooth drive gear has a 3.417:1 ratio; feeding in 3,000 RPM gives an output speed of about 878 RPM.',
    solver: {
      defaultTarget: 'gearRatio',
      variables: [
        { id: 'gearRatio', label: 'Gear ratio', symbol: 'GR', dimension: 'count', defaultValue: 3.416667, defaultUnit: 'count' },
        { id: 'driveTeeth', label: 'Drive (input) gear teeth', symbol: 'N₁', dimension: 'count', defaultValue: 12, defaultUnit: 'count' },
        { id: 'drivenTeeth', label: 'Driven (output) gear teeth', symbol: 'N₂', dimension: 'count', defaultValue: 41, defaultUnit: 'count' },
        { id: 'inputRpm', label: 'Input rotational speed', symbol: 'ωᵢₙ', dimension: 'angularVelocity', defaultValue: 3000, defaultUnit: 'rpm', fixed: true }
      ],
      solve: {
        gearRatio: ({ driveTeeth, drivenTeeth }) => (driveTeeth === 0 ? NaN : drivenTeeth / driveTeeth),
        drivenTeeth: ({ gearRatio, driveTeeth }) => gearRatio * driveTeeth,
        driveTeeth: ({ gearRatio, drivenTeeth }) => (gearRatio === 0 ? NaN : drivenTeeth / gearRatio)
      },
      outputs: [
        { id: 'outputRpm', label: 'Output rotational speed', dimension: 'angularVelocity', unit: 'rpm', compute: (si) => (si.gearRatio === 0 ? NaN : si.inputRpm / si.gearRatio) }
      ]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is a gear ratio?',
        paragraphs: [
          'Two meshing gears always turn at speeds inversely proportional to their tooth counts: a small gear driving a large one slows the output down but multiplies its turning force, and a large gear driving a small one speeds the output up while reducing its turning force. The single number that captures this trade-off is the gear ratio — the driven gear\'s tooth count divided by the drive gear\'s — and it is the same number whether the two gears mesh directly, through a chain, or through a belt and matched pulleys.',
          'A ratio above 1:1 (more teeth on the driven gear than the drive gear) is a reduction: the output turns slower than the input, which is the normal case for a car\'s final drive or a motor\'s gearbox, trading speed for torque. A ratio below 1:1 is an overdrive: the output spins faster than the input, trading torque for speed.',
          'Gear trains with more than one pair of gears multiply each stage\'s ratio together for an overall ratio; this calculator covers a single gear pair, the building block every multi-stage gear train is made of.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of gear ratio, drive gear teeth, and driven gear teeth; the third fills in automatically. Separately, enter an input RPM to see the resulting output RPM.',
        steps: [
          { name: 'Count (or look up) each gear\'s teeth', text: 'The drive gear is the one receiving power (from an engine, motor or pedals); the driven gear is the one being turned by it.' },
          { name: 'Enter two of the three ratio values', text: 'Type any two of gear ratio, drive teeth, and driven teeth. The third, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input instead; the field left alone longest becomes the new calculated one.' },
          { name: 'Enter an input RPM', text: 'Type the drive gear\'s own rotational speed to see the output RPM the driven gear turns at, given the current ratio.' },
          { name: 'Read the results', text: 'Gear ratio and output RPM both update immediately as any value changes.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'The ratio comes straight from the tooth counts; output RPM then follows from dividing the input RPM by that ratio.',
        expression: 'GR = N₂ ÷ N₁\nN₂ = GR × N₁\nN₁ = N₂ ÷ GR\nωₒᵤₜ = ωᵢₙ ÷ GR',
        terms: [
          { symbol: 'GR', meaning: 'Gear ratio, a dimensionless number: driven gear teeth divided by drive gear teeth.' },
          { symbol: 'N₁', meaning: 'Number of teeth on the drive (input) gear — the one receiving power.' },
          { symbol: 'N₂', meaning: 'Number of teeth on the driven (output) gear — the one being turned.' },
          { symbol: 'ωᵢₙ, ωₒᵤₜ', meaning: 'Input and output rotational speed. A gear ratio above 1 reduces speed (and increases torque); below 1, it increases speed (and reduces torque).' }
        ],
        note: 'This treats the gears as an idealized, lossless pair with no slipping (true for meshing gear teeth; a belt-and-pulley drive can lose a small amount to slip in practice). Torque scales by the same ratio in the opposite direction — see the torque calculator for the actual torque figures once a ratio is known.'
      },
      workedExample: {
        intro: 'A vehicle\'s differential has a 12-tooth drive pinion turning a 41-tooth ring gear — a common rear-axle setup. With the driveshaft spinning at 3,000 RPM, how fast does the axle turn?',
        rows: [
          { label: 'Drive gear teeth (N₁)', value: '12' },
          { label: 'Driven gear teeth (N₂)', value: '41' },
          { label: 'Gear ratio (GR = 41 ÷ 12)', value: '3.417 : 1' },
          { label: 'Input speed', value: '3,000 RPM' },
          { label: 'Output speed (ωₒᵤₜ = 3,000 ÷ 3.417)', value: '≈ 878.05 RPM' }
        ],
        result: 'GR ≈ 3.417 : 1 · output ≈ 878.05 RPM',
        explanation: '41 divided by 12 is 3.41667, so this is a "3.42" rear end in the shorthand printed on a parts catalog. Dividing the 3,000 RPM input by that ratio gives an output speed of about 878.05 RPM — the axle turns noticeably slower than the driveshaft, trading that speed for roughly 3.417 times the torque at the axle.'
      },
      watchOut: [
        {
          title: 'A bigger ratio number means a slower (and stronger) output, not a faster one',
          body: 'It is easy to assume "ratio" scales things up, but a gear ratio above 1:1 always reduces output speed — the number describes how much slower the output turns, trading speed for torque. Check whether a stated ratio means reduction or overdrive before assuming which direction it goes.'
        },
        {
          title: 'This is one gear pair, not a full multi-speed gearbox',
          body: 'A car transmission or bicycle drivetrain combines several gear pairs (and often a separate final-drive ratio). The overall ratio for a multi-stage system is each stage\'s ratio multiplied together, not this single pair alone.'
        },
        {
          title: 'Torque scales in the opposite direction from speed',
          body: 'An idealized gear pair conserves power, so whatever factor reduces speed increases torque by the same factor (and vice versa) — a 3.417:1 reduction roughly multiplies torque by 3.417 at the same time it divides speed by 3.417, minus whatever small amount is lost to friction in a real gearset.'
        },
        {
          title: 'Which gear counts as "drive" and which as "driven" depends on the direction of power flow',
          body: 'In a car coasting downhill with the engine braking, power can momentarily flow from the wheels back toward the engine — but the ratio itself is still defined by which gear is physically receiving power from the engine under normal driving, not by which way torque happens to be flowing at a given instant.'
        }
      ],
      references: [
        { label: 'UC San Diego, MAE 3 Machine Design — Gear Ratios', url: 'https://mae3.eng.ucsd.edu/machine-design/gear-ratios' },
        { label: 'OpenStax, University Physics Volume 1, §10.3 Relating Angular and Translational Quantities', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-3-relating-angular-and-translational-quantities' }
      ]
    },
    inputs: [
      { id: 'driveTeeth', label: 'Drive gear teeth', type: 'number', placeholder: '12', defaultValue: 12, step: 1, min: 0 },
      { id: 'drivenTeeth', label: 'Driven gear teeth', type: 'number', placeholder: '41', defaultValue: 41, step: 1, min: 0 }
    ],
    seo: {
      title: 'Gear Ratio Calculator – Teeth Ratio & Output RPM',
      description: 'Free gear ratio calculator. Find gear ratio from drive and driven gear teeth, or solve for teeth count, plus the output RPM for a given input RPM.',
      faq: [
        { question: 'How do I calculate gear ratio?', answer: 'Divide the driven gear\'s tooth count by the drive gear\'s: GR = N₂ ÷ N₁. A 41-tooth driven gear turned by a 12-tooth drive gear gives GR = 41 ÷ 12 ≈ 3.417:1.' },
        { question: 'How do I find output RPM from a gear ratio?', answer: 'Divide the input RPM by the gear ratio: output RPM = input RPM ÷ GR. At 3,000 input RPM and a 3.417:1 ratio, output RPM ≈ 3,000 ÷ 3.417 ≈ 878.05 RPM.' },
        { question: 'Does a higher gear ratio mean a faster or slower output?', answer: 'Slower. A gear ratio above 1:1 is a reduction — the driven gear turns slower than the drive gear, in exchange for more torque. A ratio below 1:1 is an overdrive, where the output spins faster than the input.' },
        { question: 'Which gear is the "drive" gear and which is "driven"?', answer: 'The drive gear is the one receiving power directly, from an engine, motor or pedals. The driven gear is the one being turned by it. Gear ratio is always driven teeth ÷ drive teeth.' },
        { question: 'How does gear ratio affect torque?', answer: 'In the opposite direction from speed. An idealized gear pair conserves power, so a gear ratio that divides speed by some factor multiplies torque by roughly that same factor.' },
        { question: 'How do I combine several gear stages into one overall ratio?', answer: 'Multiply each stage\'s individual ratio together. A two-stage gearbox with a 2:1 first stage and a 3:1 second stage has an overall ratio of 2 × 3 = 6:1.' }
      ]
    },
    compute(values) {
      return { gearRatio: values.drivenTeeth / values.driveTeeth };
    }
  },
  {
    id: 'efficiency-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'η',
    updatedAt: '2026-11-16',
    aliases: ['energy efficiency calculator', 'mechanical efficiency calculator', 'power output over input calculator', 'motor efficiency calculator', 'percent efficiency calculator'],
    related: ['power-calculator', 'horsepower-calculator', 'gear-ratio-calculator', 'work-calculator'],
    title: 'Efficiency Calculator (η = output ÷ input)',
    description: 'Calculate mechanical or energy efficiency as useful output power divided by total input power, times 100% — or solve backward for output or input.',
    example: 'A motor drawing 5.0 kW of electrical input power and delivering 4.5 kW of mechanical output power is 90% efficient, losing 0.5 kW.',
    solver: {
      defaultTarget: 'efficiency',
      variables: [
        { id: 'efficiency', label: 'Efficiency', symbol: 'η', dimension: 'percent', defaultValue: 90, defaultUnit: '%' },
        { id: 'outputPower', label: 'Useful output power', symbol: 'Pₒᵤₜ', dimension: 'power', defaultValue: 4.5, defaultUnit: 'kW' },
        { id: 'inputPower', label: 'Total input power', symbol: 'Pᵢₙ', dimension: 'power', defaultValue: 5, defaultUnit: 'kW' }
      ],
      solve: {
        efficiency: ({ outputPower, inputPower }) => (inputPower === 0 ? NaN : (outputPower / inputPower) * 100),
        outputPower: ({ efficiency, inputPower }) => inputPower * (efficiency / 100),
        inputPower: ({ efficiency, outputPower }) => (efficiency === 0 ? NaN : outputPower / (efficiency / 100))
      },
      outputs: [
        { id: 'powerLost', label: 'Power lost', dimension: 'power', compute: (si) => si.inputPower - si.outputPower }
      ]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is efficiency?',
        paragraphs: [
          'No real machine delivers as useful output everything it is fed as input — some energy is always lost along the way, usually to heat, friction, vibration or electrical resistance. Efficiency is the fraction that actually makes it through, defined simply as useful output divided by total input, expressed as a percentage: Eff = Wₒᵤₜ ÷ Eᵢₙ (OpenStax College Physics 2e §7.6). Because energy itself is always conserved, the output can never exceed the input — efficiency tops out at 100%, and anything below that represents energy that was converted into some less useful form rather than destroyed outright.',
          'The same ratio applies whether "output" and "input" are measured as power, energy, or work, as long as both sides use the same units and the same unit of time — a motor\'s instantaneous power efficiency and its energy efficiency over an hour of running come out to the same percentage. OpenStax\'s own published figures (Table 7.2) give a sense of the range real devices span: an electric motor around 98% efficient, a gasoline car engine around 30%, and a coal-fired power plant around 42%.',
          'Lower efficiency does not necessarily mean a device is poorly made — a gasoline engine is inherently limited by the thermodynamics of turning heat into mechanical work (the same limit behind the efficiency of any heat engine), while an electric motor faces no such ceiling and can approach 100% in principle.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of efficiency, output power, and input power; the third fills in automatically.',
        steps: [
          { name: 'Identify input and output consistently', text: 'Input is everything fed into the system (electrical power drawn, fuel\'s chemical power, etc.); output is only the useful part that comes back out as the kind of power actually wanted.' },
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input instead; the field left alone longest becomes the new calculated one.' },
          { name: 'Read the result', text: 'Efficiency appears as a percentage, with the power lost to inefficiency shown underneath.' },
          { name: 'Share or copy', text: 'Share result copies a link that reopens the calculator with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Efficiency is the output-to-input ratio, scaled to a percentage; the same equation rearranges to solve for either power if the efficiency is already known.',
        expression: 'η = (Pₒᵤₜ ÷ Pᵢₙ) × 100%\nPₒᵤₜ = Pᵢₙ × (η ÷ 100)\nPᵢₙ = Pₒᵤₜ ÷ (η ÷ 100)',
        terms: [
          { symbol: 'η', meaning: 'Efficiency, as a percentage (the Greek letter eta). 100% would mean no losses at all; real machines are always below that.' },
          { symbol: 'Pₒᵤₜ', meaning: 'Useful output power — only the portion actually doing the intended job, in watts, kW or hp.' },
          { symbol: 'Pᵢₙ', meaning: 'Total input power supplied to the system, in the same kind of unit as the output.' }
        ],
        note: 'This is an estimate based on whatever output and input figures are entered; it cannot account for losses that were not included in either measurement. Power and energy both work in this formula as long as the same quantity and units are used on both sides.'
      },
      workedExample: {
        intro: 'An electric motor draws 5.0 kW of electrical input power and delivers 4.5 kW of mechanical output power at its shaft. How efficient is it, and how much power is lost?',
        rows: [
          { label: 'Input power (Pᵢₙ)', value: '5.0 kW' },
          { label: 'Output power (Pₒᵤₜ)', value: '4.5 kW' },
          { label: 'Efficiency (η = 4.5 ÷ 5.0 × 100)', value: '90%' },
          { label: 'Power lost (5.0 − 4.5)', value: '0.5 kW' }
        ],
        result: 'η = 90% · 0.5 kW lost',
        explanation: '4.5 divided by 5.0 is 0.9, so the motor is 90% efficient — close to the roughly 98% OpenStax\'s own published figure gives for a well-built electric motor, with this example\'s lower number representing extra losses from bearing friction, winding resistance or a less efficient design. The remaining 0.5 kW does not vanish; it leaves the motor as waste heat.'
      },
      watchOut: [
        {
          title: 'Efficiency can never exceed 100%',
          body: 'Because energy is conserved, output can never be more than input. A calculation coming out above 100% means the input and output were not measured consistently — most often, some real input (like friction losses already present before the measurement point) was left out.'
        },
        {
          title: '"Output" means useful output, not just any output',
          body: 'A machine can produce plenty of energy in a form nobody wants — mostly heat, in most real devices — and that waste output does not count toward the efficiency figure, even though it is real energy leaving the system.'
        },
        {
          title: 'Input and output must be measured in the same kind of unit',
          body: 'Comparing an electrical input in kilowatt-hours against a mechanical output in joules, without converting one to match the other first, produces a meaningless number even though the arithmetic itself runs without error.'
        },
        {
          title: 'A device\'s efficiency can change with how hard it is run',
          body: 'Most real machines are most efficient only within some particular operating range (a certain load or speed) and lose efficiency at very light or very heavy loads — a single percentage figure describes one specific operating condition, not every condition that device will ever see.'
        }
      ],
      references: [
        { label: 'OpenStax, College Physics 2e, §7.6 Conservation of Energy', url: 'https://openstax.org/books/college-physics-2e/pages/7-6-conservation-of-energy' },
        { label: 'OpenStax, College Physics 2e, §15.3 Heat Engines and Their Efficiency', url: 'https://openstax.org/books/college-physics-2e/pages/15-3-introduction-to-the-second-law-of-thermodynamics-heat-engines-and-their-efficiency' }
      ]
    },
    inputs: [
      { id: 'outputPower', label: 'Useful output power (W)', type: 'number', placeholder: '4500', defaultValue: 4500, step: 1, min: 0 },
      { id: 'inputPower', label: 'Total input power (W)', type: 'number', placeholder: '5000', defaultValue: 5000, step: 1, min: 0 }
    ],
    seo: {
      title: 'Efficiency Calculator (η = output ÷ input)',
      description: 'Free efficiency calculator. Find percent efficiency from output and input power, or solve for either one, with a worked motor example and power lost.',
      faq: [
        { question: 'How do I calculate efficiency?', answer: 'Divide useful output power by total input power and multiply by 100: η = (Pₒᵤₜ ÷ Pᵢₙ) × 100%. A motor with 4.5 kW output and 5.0 kW input is 90% efficient.' },
        { question: 'Can efficiency be over 100%?', answer: 'No. Energy is always conserved, so output can never exceed input — a result above 100% means the input and output were not measured on a consistent, complete basis.' },
        { question: 'How do I find input power from a known efficiency and output?', answer: 'Divide output by the efficiency (as a decimal): Pᵢₙ = Pₒᵤₜ ÷ (η ÷ 100). A device delivering 4.5 kW at 90% efficiency draws 4.5 ÷ 0.9 = 5.0 kW.' },
        { question: 'What is a typical efficiency for an electric motor versus a gasoline engine?', answer: 'OpenStax\'s own published figures put a typical electric motor around 98% efficient and a gasoline car engine around 30%, reflecting the thermodynamic limits a heat engine faces that an electric motor does not.' },
        { question: 'Does this work for energy as well as power?', answer: 'Yes. The same ratio applies to energy or work figures, as long as output and input are both measured in the same unit over the same time period.' },
        { question: 'Where does the lost power or energy actually go?', answer: 'Almost always to heat, released through friction, electrical resistance, or air resistance, plus sometimes vibration or noise — it is not destroyed, just converted into a form the machine was not built to use.' }
      ]
    },
    compute(values) {
      return { efficiency: (values.outputPower / values.inputPower) * 100 };
    }
  },
  {
    id: 'angular-velocity-calculator',
    category: 'physics',
    group: 'Motion & Forces',
    glyph: 'ω',
    updatedAt: '2026-11-16',
    aliases: ['angular speed calculator', 'omega calculator', 'rotational speed calculator', 'radians per second calculator', 'angular velocity formula calculator'],
    related: ['rpm-to-speed-calculator', 'horsepower-calculator', 'gear-ratio-calculator', 'speed-distance-time-calculator'],
    title: 'Angular Velocity Calculator (ω = Δθ ÷ Δt)',
    description: 'Calculate angular velocity from the angle turned and the time it took — ω = Δθ ÷ Δt — in rad/s, RPM or deg/s, or solve backward for angle or time.',
    example: 'A wheel that turns through 450° (1.25 revolutions) in 3 seconds has an angular velocity of about 2.618 rad/s — 25 RPM.',
    solver: {
      defaultTarget: 'angularVelocity',
      variables: [
        { id: 'angularVelocity', label: 'Angular velocity', symbol: 'ω', dimension: 'angularVelocity', defaultValue: 25, defaultUnit: 'rpm' },
        { id: 'angle', label: 'Angle turned', symbol: 'Δθ', dimension: 'angle', defaultValue: 450, defaultUnit: 'deg' },
        { id: 'time', label: 'Time taken', symbol: 'Δt', dimension: 'time', defaultValue: 3, defaultUnit: 's' }
      ],
      solve: {
        angularVelocity: ({ angle, time }) => (time === 0 ? NaN : angle / time),
        angle: ({ angularVelocity, time }) => angularVelocity * time,
        time: ({ angle, angularVelocity }) => (angularVelocity === 0 ? NaN : angle / angularVelocity)
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is angular velocity?',
        paragraphs: [
          'Angular velocity measures how quickly something is rotating: the amount of angle it sweeps through per unit of time, the rotational counterpart of ordinary speed (distance per time). OpenStax University Physics Volume 1 §10.1 defines it exactly this way — average angular velocity ω = Δθ ÷ Δt — and reports it in radians per second, though revolutions per minute (RPM) and degrees per second describe the same rotation rate, just in different angle units.',
          'Every point on a spinning rigid object — a wheel, a turntable, a planet — shares the same angular velocity even though points farther from the axis are physically moving faster in a straight-line sense (that linear speed is v = rω, a separate calculation once ω is known). Angular velocity alone describes the rotation itself, independent of how big the rotating object is.',
          'Converting between RPM and rad/s is one fixed factor, 2π ÷ 60, confirmed directly against OpenStax\'s own Example 10.2 (250 rev/min = 26.2 rad/s) — this calculator\'s unit menu applies that factor automatically, so a value typed in any of rad/s, RPM, rev/s or deg/s converts correctly into the others.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of angular velocity, angle turned, and time taken; the third fills in automatically.',
        steps: [
          { name: 'Enter the two values you know', text: 'Type each value and pick its unit — angle in degrees or radians, time in seconds, minutes or hours. The third field, marked auto, calculates as you type.' },
          { name: 'Switch which one is calculated', text: 'Type into the auto field to make it an input instead; the field left alone longest becomes the new calculated one.' },
          { name: 'Change units at any time', text: 'Switching a unit converts the number already there, so a result of 2.618 rad/s becomes 25 RPM instead of silently turning into 2.618 RPM.' },
          { name: 'Read the result', text: 'Angular velocity appears in your chosen unit — rad/s, RPM, rev/s or deg/s — with the other common units shown underneath.' },
          { name: 'Share or copy', text: 'Share result copies a link that reopens the calculator with your exact values and units. Copy result copies the answer as text.' }
        ],
        outro: 'Every figure is calculated in your browser as you type. Nothing is sent or stored.'
      },
      formula: {
        intro: 'Angular velocity is angle divided by time; the formula rearranges two more ways for angle or time.',
        expression: 'ω = Δθ ÷ Δt\nΔθ = ω × Δt\nΔt = Δθ ÷ ω',
        terms: [
          { symbol: 'ω', meaning: 'Angular velocity, in radians per second (rad/s), RPM, revolutions per second, or degrees per second — the Greek letter omega.' },
          { symbol: 'Δθ', meaning: 'Angle swept through, in radians or degrees.' },
          { symbol: 'Δt', meaning: 'Time taken to sweep through that angle, in seconds, minutes or hours.' }
        ],
        note: 'Every input is converted to SI units (rad, s, rad/s) before solving and converted back afterward, so entering the angle in degrees or the result in RPM works exactly as expected. This is the average angular velocity over the interval entered, exactly as speed-distance-time gives an average linear speed over its interval — not necessarily the instantaneous rate at any single moment, if the rotation is speeding up or slowing down.'
      },
      workedExample: {
        intro: 'A wheel turns through 450° (1.25 full revolutions) in 3 seconds. What is its angular velocity?',
        rows: [
          { label: 'Angle turned (Δθ)', value: '450° = 7.854 rad' },
          { label: 'Time taken (Δt)', value: '3 s' },
          { label: 'Angular velocity (ω = 7.854 ÷ 3)', value: '2.618 rad/s' }
        ],
        result: 'ω ≈ 2.618 rad/s · 150°/s · 25 RPM',
        explanation: '450° converts to 450 × π ÷ 180 ≈ 7.854 rad; dividing by 3 s gives 2.618 rad/s. Converting that to RPM (×60÷2π) gives exactly 25 RPM — a clean number because 450° is exactly 1.25 revolutions over 3 seconds, or 0.41667 revolutions per second, times 60 is 25 revolutions per minute.'
      },
      watchOut: [
        {
          title: 'Angular velocity alone does not give a linear speed',
          body: 'Every point on a rotating object shares the same ω, but their actual straight-line speeds differ with distance from the axis (v = rω). Use the RPM-to-speed calculator once a radius or diameter is also known.'
        },
        {
          title: 'This is an average over the interval entered',
          body: 'Just like average linear speed from distance and time, this result is the total angle divided by the total time — it smooths out any speeding up or slowing down that happened within that interval, rather than giving the rotation rate at one exact instant.'
        },
        {
          title: 'Degrees and radians must not be mixed before converting',
          body: 'Dividing a degree value directly by a time in seconds does not give radians per second — a degree first has to be converted to radians (×π÷180) for the result to be in the standard SI angular velocity unit. This calculator\'s unit menu handles that conversion automatically.'
        },
        {
          title: 'Direction is part of angular velocity, this calculator gives only magnitude',
          body: 'Angular velocity is technically a vector pointing along the rotation axis (clockwise versus counterclockwise matters for combining rotations). This page works with the magnitude — the speed of rotation — the same simplification speed-distance-time makes for linear motion.'
        }
      ],
      references: [
        { label: 'OpenStax, University Physics Volume 1, §10.1 Rotational Variables', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-1-rotational-variables' },
        { label: 'OpenStax, University Physics Volume 1, §10.3 Relating Angular and Translational Quantities', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-3-relating-angular-and-translational-quantities' },
        { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' }
      ]
    },
    inputs: [
      { id: 'angle', label: 'Angle turned (rad)', type: 'number', placeholder: '7.854', defaultValue: (450 * Math.PI) / 180, step: 0.01, min: 0 },
      { id: 'time', label: 'Time taken (s)', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Angular Velocity Calculator (ω = Δθ/Δt)',
      description: 'Free angular velocity calculator. Solve ω = Δθ ÷ Δt for angular velocity, angle, or time in rad/s, RPM or deg/s, with a worked example.',
      faq: [
        { question: 'How do I calculate angular velocity?', answer: 'Divide the angle turned by the time taken: ω = Δθ ÷ Δt. A wheel turning 450° (7.854 rad) in 3 seconds has ω = 7.854 ÷ 3 ≈ 2.618 rad/s, which is 25 RPM.' },
        { question: 'How do I convert RPM to rad/s?', answer: 'Multiply by 2π ÷ 60 (about 0.10472). 25 RPM × 0.10472 ≈ 2.618 rad/s, matching OpenStax\'s own worked conversion of 250 rev/min to 26.2 rad/s at ten times this rate.' },
        { question: 'What is the difference between angular velocity and linear (tangential) speed?', answer: 'Angular velocity (ω) is the same for every point on a rotating rigid object, in radians per second. Linear speed (v = rω) depends on how far that point is from the rotation axis — points farther out move faster in a straight-line sense even though ω is identical.' },
        { question: 'What is the SI unit of angular velocity?', answer: 'Radians per second (rad/s). RPM (revolutions per minute) and degrees per second are common alternatives for the same physical quantity.' },
        { question: 'How do I find the time needed to turn through a given angle at a known angular velocity?', answer: 'Rearrange to Δt = Δθ ÷ ω. Turning 450° (7.854 rad) at 2.618 rad/s takes 7.854 ÷ 2.618 = 3 seconds.' },
        { question: 'Does angular velocity depend on the size of the rotating object?', answer: 'No. A small gear and a large gear mounted on the very same shaft share the same angular velocity — size only matters once converting to a linear speed at some specific radius.' }
      ]
    },
    compute(values) {
      return { angularVelocity: values.angle / values.time };
    }
  }
];
