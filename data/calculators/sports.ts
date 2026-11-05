import type { CalculatorConfig } from './types.ts';

// Epley, B. (1985), "Poundage Chart," Boyd Epley Workout (Lincoln, NE: Body Enterprises), p. 86 —
// the most widely cited 1RM estimator in strength literature, reliable for sets of about 2-10 reps.
const epley1RM = (weight: number, reps: number) => weight * (1 + reps / 30);
const epleyWeightForReps = (oneRepMax: number, reps: number) => oneRepMax / (1 + reps / 30);
const epleyRepsForWeight = (oneRepMax: number, weight: number) => (weight > 0 && oneRepMax >= weight ? 30 * (oneRepMax / weight - 1) : NaN);
// Brzycki, M. (1993), "Strength Testing: Predicting a One-Rep Max from Reps-to-Fatigue," Journal of
// Physical Education, Recreation & Dance 64(1): 88-90 — the other formula most strength coaches use,
// expressed here as a fraction of 1RM so it lines up with Epley's in the comparison table.
const brzyckiPercent = (reps: number) => (37 - reps) / 36;
const epleyPercent = (reps: number) => 30 / (30 + reps);

export const sportsCalculators: CalculatorConfig[] = [
  {
    id: 'one-rep-max-calculator',
    category: 'sports',
    glyph: '1RM',
    updatedAt: '2026-11-05',
    aliases: ['1rm calculator', 'one rep max calculator', 'epley formula calculator', 'max bench press calculator', 'how much can i lift calculator', 'one rep max bench calculator'],
    related: ['heart-rate-zones-calculator', 'vo2-max-calculator', 'calorie-calculator', 'tdee-calculator'],
    title: 'One-Rep Max Calculator',
    description: 'Estimate your one-rep max (1RM) from a weight and the reps you completed, using the Epley formula. Also works backwards: find the weight for a target rep count, or how many reps a weight should allow.',
    example: 'A 185 lb bench press for 5 reps predicts a one-rep max of about 216 lb (97.9 kg), using the Epley formula, 1RM = weight × (1 + reps ÷ 30).',
    solver: {
      defaultTarget: 'oneRepMax',
      variables: [
        { id: 'oneRepMax', label: 'One-rep max', symbol: '1RM', dimension: 'mass', defaultValue: 215.83, defaultUnit: 'lb' },
        { id: 'weight', label: 'Weight lifted', symbol: 'w', dimension: 'mass', defaultValue: 185, defaultUnit: 'lb' },
        { id: 'reps', label: 'Reps completed', symbol: 'r', dimension: 'count', defaultValue: 5, defaultUnit: 'count' }
      ],
      // SI: mass in kg, reps dimensionless, so the Epley formula applies directly to the kg value.
      solve: {
        oneRepMax: ({ weight, reps }) => epley1RM(weight, reps),
        weight: ({ oneRepMax, reps }) => epleyWeightForReps(oneRepMax, reps),
        reps: ({ oneRepMax, weight }) => epleyRepsForWeight(oneRepMax, weight)
      },
      outputs: [
        { id: 'fiveRepWeight', label: 'Estimated weight for 5 reps', dimension: 'mass', unit: 'lb', compute: (si) => epleyWeightForReps(si.oneRepMax, 5) },
        { id: 'tenRepWeight', label: 'Estimated weight for 10 reps', dimension: 'mass', unit: 'lb', compute: (si) => epleyWeightForReps(si.oneRepMax, 10) }
      ]
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'What is a one-rep max?',
        paragraphs: [
          "A one-rep max (1RM) is the most weight you can lift for a single, complete repetition of an exercise with good form. It is the standard way lifters and coaches describe strength, because it turns \"how strong are you\" into one comparable number, and most percentage-based training programs (5/3/1, Starting Strength's working sets, powerlifting peaking blocks) are written as a percentage of it.",
          "Testing a true 1RM means loading a bar until you fail, which takes a long warm-up and carries real injury risk, especially for beginners or anyone without a spotter. Prediction equations solve that by estimating 1RM from a lighter, safer set taken close to failure: do as many clean reps as you can at a given weight, and a formula extrapolates what a single rep would have been.",
          "The Epley formula, published by strength coach Boyd Epley in 1985, is the most widely used of these estimators: 1RM = weight × (1 + reps ÷ 30). It assumes a roughly linear relationship between reps and the fraction of your max each rep represents, which holds up well for sets of about two to ten reps and gets noticeably less accurate above that, since nobody's strength actually keeps dropping in a straight line as reps climb into the twenties and thirties."
        ]
      },
      howTo: {
        intro: 'Fill in any two of one-rep max, weight and reps. The third, marked auto, is calculated as you type.',
        steps: [
          { name: 'Estimate your 1RM', text: 'Type the weight you lifted and how many reps you completed with good form. The one-rep max is calculated.' },
          { name: 'Find a training weight', text: 'Type your estimated 1RM and a target rep count, then leave weight alone. It becomes the auto field and shows the weight that should let you hit that many reps.' },
          { name: 'Check how many reps a weight allows', text: 'Type your 1RM and a weight, then leave reps alone, to see roughly how many reps that weight should allow.' },
          { name: 'Read the training loads', text: 'Below the result, the 5-rep and 10-rep estimates show two common training weights at your estimated max.' },
          { name: 'Re-test as you get stronger', text: 'A 1RM estimate is only as current as the set it came from. Re-test every few weeks of consistent training, not every session.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The Epley formula links one-rep max, weight and reps in one relationship. Rearranging it gives a formula for each.',
        expression: '1RM = w × (1 + r ÷ 30)\nw = 1RM ÷ (1 + r ÷ 30)\nr = 30 × (1RM ÷ w − 1)',
        terms: [
          { symbol: '1RM', meaning: 'The estimated one-rep max, in the same mass unit as the weight.' },
          { symbol: 'w', meaning: 'The weight actually lifted for the set.' },
          { symbol: 'r', meaning: 'The number of clean reps completed with that weight, taken close to failure.' }
        ],
        note: 'Estimate only. Epley is most accurate for 2-10 reps; a set of 15-20+ reps gives a much less reliable estimate because the real strength-endurance relationship isn\'t linear that far out.'
      },
      workedExample: {
        intro: 'A lifter benches 185 lb for a clean set of 5 reps. What does that predict for a one-rep max, and what weights would suit 5 and 10 reps at that max?',
        rows: [
          { label: 'Weight (w)', value: '185 lb' },
          { label: 'Reps (r)', value: '5' },
          { label: '1RM = 185 × (1 + 5 ÷ 30)', value: '185 × 1.1667 = 215.83 lb' },
          { label: 'In kilograms (215.83 × 0.453592)', value: '97.90 kg' },
          { label: '5-rep weight = 215.83 ÷ 1.1667', value: '185 lb (matches the input, as it should)' },
          { label: '10-rep weight = 215.83 ÷ 1.3333', value: '161.87 lb' }
        ],
        result: 'Estimated 1RM ≈ 216 lb (97.9 kg) · 5-rep weight 185 lb · 10-rep weight ≈ 162 lb',
        explanation: 'The 5-rep figure comes back to exactly the 185 lb typed in, which is the formula working correctly in reverse. The 10-rep weight is lower because the formula predicts more reps become possible as the weight drops.'
      },
      watchOut: [
        {
          title: 'Epley and Brzycki disagree more as reps climb',
          body: 'The two most common formulas, Epley and Brzycki, give nearly the same percentage of 1RM for a 10-rep set (75% either way) but diverge at the low end: for 1 rep, Epley estimates about 96.8% of 1RM while Brzycki estimates 100%, since a true 1-rep set already is the max.'
        },
        {
          title: 'Only trust reps taken close to failure',
          body: 'The formula assumes the set was hard: the last rep or two should have been difficult to complete with good form. A set stopped early because of time, not fatigue, will underestimate your real 1RM.'
        },
        {
          title: 'Technique breaks down before strength does',
          body: 'Prediction equations assume the same technique holds at every rep and weight. Exercises that get much harder to stabilize as the weight rises (a free barbell squat versus a machine press) are less reliably predicted than simpler, more constrained lifts.'
        },
        {
          title: 'Predicted 1RM is not a safe number to just load and lift',
          body: 'It is an estimate of what you could probably lift, not a weight that has been tested safely. The American Council on Exercise notes that predicted-1RM testing is meant for people without the experience or need for an actual maximal test, not as a substitute for careful, supervised loading if you do attempt a true 1RM.'
        },
        {
          title: 'Fatigue, sleep and stress shift the number day to day',
          body: 'A 1RM estimate reflects how you lifted on one particular day. Expect it to vary by a few percent between a well-rested session and a tired one, which is normal and not a sign the formula is wrong.'
        }
      ],
      referenceTable: {
        title: 'Estimated %1RM by reps to failure',
        columns: ['Reps to failure', 'Epley (%1RM)', 'Brzycki (%1RM)'],
        rows: [
          { label: '1', values: [100 * epleyPercent(1), 100 * brzyckiPercent(1)] },
          { label: '2', values: [100 * epleyPercent(2), 100 * brzyckiPercent(2)] },
          { label: '3', values: [100 * epleyPercent(3), 100 * brzyckiPercent(3)] },
          { label: '4', values: [100 * epleyPercent(4), 100 * brzyckiPercent(4)] },
          { label: '5', values: [100 * epleyPercent(5), 100 * brzyckiPercent(5)] },
          { label: '6', values: [100 * epleyPercent(6), 100 * brzyckiPercent(6)] },
          { label: '8', values: [100 * epleyPercent(8), 100 * brzyckiPercent(8)] },
          { label: '10', values: [100 * epleyPercent(10), 100 * brzyckiPercent(10)] }
        ],
        decimals: 1,
        note: 'Each column is the formula applied directly (Epley: 30 ÷ (30 + reps); Brzycki: (37 − reps) ÷ 36), not a copied chart. The two agree almost exactly by 10 reps and diverge most at very low rep counts.'
      },
      references: [
        { label: "Epley, B., \"Poundage Chart,\" Boyd Epley Workout (Lincoln, NE: Body Enterprises, 1985), p. 86 — the original source of the Epley formula", url: 'https://en.wikipedia.org/wiki/One-repetition_maximum' },
        { label: 'Brzycki, M., "Strength Testing: Predicting a One-Rep Max from Reps-to-Fatigue," Journal of Physical Education, Recreation & Dance 64, no. 1 (1993): 88-90', url: 'https://www.tandfonline.com/doi/abs/10.1080/07303084.1993.10606684' },
        { label: 'LeSuer, D.A., et al., "The Accuracy of Prediction Equations for Estimating 1-RM Performance in the Bench Press, Squat, and Deadlift," Journal of Strength and Conditioning Research 11, no. 4 (1997): 211-213', url: 'https://journals.lww.com/nsca-jscr/abstract/1997/11040/the_accuracy_of_prediction_equations_for.3.aspx' },
        { label: 'American Council on Exercise, "Understanding 1-RM and Predicted 1-RM Assessments"', url: 'https://www.acefitness.org/fitness-certifications/ace-answers/exam-preparation-blog/2894/understanding-1-rm-and-predicted-1-rm-assessments/' }
      ]
    },
    inputs: [
      { id: 'weight', label: 'Weight lifted (lb)', type: 'number', placeholder: '185', defaultValue: 185, step: 1, min: 0 },
      { id: 'reps', label: 'Reps completed', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 }
    ],
    seo: {
      title: 'One-Rep Max Calculator – Epley 1RM Formula',
      description: 'Estimate your one-rep max from a weight and reps with the Epley formula, or solve backwards for a training weight at a target rep count.',
      faq: [
        { question: 'How do I calculate my one-rep max?', answer: 'Multiply the weight you lifted by 1 plus the reps divided by 30: 1RM = weight × (1 + reps ÷ 30). A 185 lb bench for 5 reps predicts about 216 lb.' },
        { question: 'What is the Epley formula?', answer: 'A 1985 strength-training formula by Boyd Epley that estimates a one-rep max from a lighter set taken close to failure: 1RM = weight × (1 + reps ÷ 30). It is the most widely used 1RM estimator.' },
        { question: 'Is the Epley formula accurate?', answer: 'It is most reliable for sets of about 2 to 10 reps. Above that, prediction equations in general get much less accurate, since strength does not keep dropping in a straight line as reps climb.' },
        { question: 'What is the difference between Epley and Brzycki?', answer: 'Both estimate %1RM from reps to failure and agree closely by 10 reps (75% either way), but diverge at low rep counts: at 1 rep, Epley gives about 96.8% of 1RM while Brzycki gives 100%.' },
        { question: 'How much weight should I use for 5 reps?', answer: 'Divide your estimated 1RM by 1 plus 5 ÷ 30 (about 1.1667). At a 216 lb estimated 1RM, that is roughly 185 lb for 5 reps.' },
        { question: 'Is it safe to test my actual one-rep max?', answer: 'A true 1RM test pushes you to failure and carries real injury risk without a spotter and a proper warm-up. The American Council on Exercise recommends predicted-1RM testing instead for anyone without the experience or specific need for a maximal test.' }
      ]
    },
    compute(values) {
      return { oneRepMax: epley1RM(values.weight, values.reps) };
    }
  },
  {
    id: 'heart-rate-zones-calculator',
    category: 'sports',
    glyph: 'bpm',
    updatedAt: '2026-11-05',
    aliases: ['heart rate zone calculator', 'max heart rate calculator', 'target heart rate calculator', 'karvonen formula calculator', 'cardio zone calculator', 'heart rate reserve calculator'],
    related: ['one-rep-max-calculator', 'vo2-max-calculator', 'running-pace-calculator', 'tdee-calculator'],
    title: 'Heart Rate Zones Calculator',
    description: 'Estimate your maximum heart rate (classic 220 − age, or the more accurate Tanaka formula), the five standard training zones, and a personalized Karvonen target heart rate from your resting heart rate.',
    example: 'A 30-year-old with a resting heart rate of 65 bpm has an estimated maximum heart rate of 190 bpm (220 − 30); a moderate, 70%-intensity Karvonen target works out to about 153 bpm.',
    breakdown: {
      headline: 'maxHeartRate',
      headlineLabel: 'Estimated maximum heart rate',
      outputs: [
        { id: 'maxHeartRate', label: 'Estimated maximum heart rate (bpm)', format: 'integer' },
        { id: 'zone1High', label: 'Zone 1 — very light, up to (bpm)', format: 'integer' },
        { id: 'zone2High', label: 'Zone 2 — light, up to (bpm)', format: 'integer' },
        { id: 'zone3High', label: 'Zone 3 — moderate, up to (bpm)', format: 'integer' },
        { id: 'zone4High', label: 'Zone 4 — hard, up to (bpm)', format: 'integer' },
        { id: 'zone5High', label: 'Zone 5 — maximum, up to (bpm)', format: 'integer' },
        { id: 'karvonenTargetBpm', label: 'Karvonen target heart rate, at your chosen intensity (bpm)', format: 'integer' }
      ],
      groups: [
        { title: 'About you', inputs: ['age', 'restingHeartRate', 'maxHRFormula'] },
        { title: 'Karvonen target intensity', inputs: ['targetIntensityPercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'zone1High', label: 'Zone 1' },
          { from: 'zone2High', label: 'Zone 2' },
          { from: 'zone3High', label: 'Zone 3' },
          { from: 'zone4High', label: 'Zone 4' },
          { from: 'zone5High', label: 'Zone 5' }
        ],
        title: 'Zone ceilings (bpm)'
      }
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'What are heart rate training zones?',
        paragraphs: [
          'Heart rate zones divide your effort into bands, from easy to maximal, so training plans can target a specific physiological effect instead of just "harder" or "easier." The usual starting point is an age-predicted maximum heart rate, since almost nobody has access to a lab-measured one. The long-standing rule of thumb is 220 minus your age; a 2001 analysis by Tanaka, Monahan and Seals pooling 18,712 subjects across 351 studies found 208 minus 0.7 times age tracks lab-measured maximums more closely across the adult lifespan, and this calculator offers both.',
          "From a maximum heart rate, Cleveland Clinic's five-zone model splits effort into bands by percentage: Zone 1 (50-60% of max) is a warm-up or recovery pace, Zone 2 (60-70%) is steady aerobic, endurance-building effort, Zone 3 (70-80%) is a tempo or threshold effort, Zone 4 (80-90%) pushes toward lactate threshold, and Zone 5 (90-100%) is an all-out, short-duration effort. The American Heart Association simplifies this to two practical bands for general health: about 50-70% of max for moderate activity and about 70-85% for vigorous activity.",
          'A separate method, published by the Finnish physiologist Martti Karvonen in 1957, factors in your resting heart rate as well as your maximum: it computes your heart rate reserve (max minus resting) and takes a percentage of that, then adds resting heart rate back. Because it accounts for your own resting rate rather than just your age, Karvonen targets are usually a closer personal match than a straight percentage of maximum, especially for people whose resting heart rate is unusually low or high for their age.'
        ]
      },
      howTo: {
        intro: 'Enter your age, resting heart rate and a preferred max-heart-rate formula to see your zones, then choose an intensity to get a personalized Karvonen target.',
        steps: [
          { name: 'Enter your age', text: 'Used by whichever maximum-heart-rate formula you pick below.' },
          { name: 'Enter your resting heart rate', text: 'Count your pulse for a full minute right after waking, before getting up, for the most accurate reading. Used only for the Karvonen target.' },
          { name: 'Pick a maximum heart rate formula', text: 'The classic 220 − age is simplest; Tanaka\'s 208 − 0.7 × age tracks measured values more closely across adults, especially past about 40.' },
          { name: 'Read your five zones', text: 'Each zone ceiling is shown in beats per minute, and the chart shows how they step up with your maximum heart rate.' },
          { name: 'Choose a target intensity', text: 'Pick a percentage of heart rate reserve (commonly 60-80% for general cardio) to get a single Karvonen target heart rate.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Two formulas estimate maximum heart rate from age; the five zones are percentages of it; the Karvonen target also uses resting heart rate.',
        expression: 'Classic max HR = 220 − age\nTanaka max HR = 208 − 0.7 × age\nZone ceiling = max HR × zone %\nKarvonen target = (max HR − resting HR) × intensity % + resting HR',
        terms: [
          { symbol: 'max HR', meaning: 'Estimated maximum heart rate, in beats per minute (bpm).' },
          { symbol: 'resting HR', meaning: 'Your heart rate at rest, in bpm — the lower bound the Karvonen method works up from.' },
          { symbol: 'zone %', meaning: 'The upper bound of each of the five standard zones: 60%, 70%, 80%, 90% and 100% of max HR.' },
          { symbol: 'intensity %', meaning: 'The percentage of heart rate reserve (max HR minus resting HR) you are targeting for the Karvonen figure.' }
        ],
        note: 'Both maximum-heart-rate formulas are population averages with real individual spread. Cleveland Clinic notes the only precise way to know your own maximum is a supervised exercise stress test or VO2 max test.'
      },
      workedExample: {
        intro: 'A 30-year-old with a resting heart rate of 65 bpm wants their zones (classic formula) and a Karvonen target at 70% intensity.',
        rows: [
          { label: 'Max HR (220 − 30)', value: '190 bpm' },
          { label: 'Zone 1 ceiling (190 × 0.60)', value: '114 bpm' },
          { label: 'Zone 3 ceiling (190 × 0.80)', value: '152 bpm' },
          { label: 'Zone 5 ceiling (190 × 1.00)', value: '190 bpm' },
          { label: 'Heart rate reserve (190 − 65)', value: '125 bpm' },
          { label: 'Karvonen target (125 × 0.70 + 65)', value: '87.5 + 65 = 152.5 ≈ 153 bpm' }
        ],
        result: 'Max HR 190 bpm · Zone 3 ceiling 152 bpm · Karvonen 70% target ≈ 153 bpm',
        explanation: 'The straight-percentage Zone 3 ceiling (152 bpm) and the Karvonen 70% target (153 bpm) land close together here because this resting heart rate (65 bpm) is fairly typical; the two methods diverge more for someone with an unusually low or high resting rate.'
      },
      watchOut: [
        {
          title: 'The two max-HR formulas cross at exactly age 40',
          body: 'Below 40, 220 − age gives a higher number than 208 − 0.7 × age; above 40, Tanaka\'s formula gives the higher number. At 20, they differ by 6 bpm (200 vs. 194); at 60, they differ by 6 bpm the other way (160 vs. 166).'
        },
        {
          title: '220 − age is a population average, not a measurement',
          body: 'It was never meant to predict any one person\'s maximum precisely. Cleveland Clinic\'s own guidance is that a supervised stress test or VO2 max test is the only accurate way to know your real maximum heart rate.'
        },
        {
          title: 'Resting heart rate changes the Karvonen target a lot',
          body: 'Because the formula scales a percentage of (max HR − resting HR), a lower resting heart rate pulls every Karvonen target down even at the same intensity percentage and the same max HR. Measure resting heart rate consistently (same time of day, before caffeine or exercise) for the number to mean anything week to week.'
        },
        {
          title: 'Medications and conditions can shift your real maximum',
          body: 'Heart-rate-affecting medications, certain heart conditions and simply being new to structured exercise can all make age-predicted formulas less reliable. Anyone on heart medication, with a diagnosed heart condition, or new to vigorous exercise should get individual guidance from a doctor before training by heart rate zones.'
        },
        {
          title: 'Zones are a training tool, not a safety ceiling by themselves',
          body: 'Staying "in zone" does not by itself prevent overtraining or injury from other causes (volume, sleep, recovery). Treat the zones as a pacing guide, and stop if you feel chest pain, dizziness or unusual shortness of breath regardless of what zone you are in.'
        }
      ],
      references: [
        { label: 'Tanaka, H., Monahan, K.D., Seals, D.R., "Age-Predicted Maximal Heart Rate Revisited," Journal of the American College of Cardiology 37, no. 1 (2001): 153-156', url: 'https://www.jacc.org/doi/10.1016/S0735-1097(00)01054-8' },
        { label: 'Karvonen, M.J., Kentala, E., Mustala, O., "The Effects of Training on Heart Rate: A Longitudinal Study," Annales Medicinae Experimentalis et Biologiae Fenniae 35, no. 3 (1957): 307-315', url: 'https://bcmj.org/articles/science-exercise-prescription-martti-karvonen-and-his-contributions' },
        { label: 'Cleveland Clinic, "What Are the Five Heart Rate Zones?"', url: 'https://health.clevelandclinic.org/exercise-heart-rate-zones-explained' },
        { label: 'American Heart Association, "Target Heart Rates Chart"', url: 'https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates' }
      ]
    },
    inputs: [
      { id: 'age', label: 'Age (years)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'restingHeartRate', label: 'Resting heart rate (bpm)', type: 'number', placeholder: '65', defaultValue: 65, step: 1, min: 30 },
      {
        id: 'maxHRFormula',
        label: 'Maximum heart rate formula',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Classic: 220 − age' },
          { value: 1, label: 'Tanaka: 208 − 0.7 × age' }
        ]
      },
      { id: 'targetIntensityPercent', label: 'Target intensity (% of heart rate reserve)', type: 'number', placeholder: '70', defaultValue: 70, step: 1, min: 50 }
    ],
    seo: {
      title: 'Heart Rate Zones Calculator – Max HR, Zones & Karvonen',
      description: 'Calculate your estimated max heart rate, the five standard training zones, and a personalized Karvonen target heart rate from your age and resting heart rate.',
      faq: [
        { question: 'How do I calculate my maximum heart rate?', answer: 'The classic rule of thumb is 220 minus your age. A 2001 analysis found 208 minus 0.7 times your age tracks lab-measured values more closely across adults, especially past about 40.' },
        { question: 'What are the 5 heart rate zones?', answer: "As percentages of max heart rate: Zone 1 (50-60%) warm-up/recovery, Zone 2 (60-70%) light aerobic, Zone 3 (70-80%) moderate/tempo, Zone 4 (80-90%) hard/threshold, Zone 5 (90-100%) maximum effort, per Cleveland Clinic's model." },
        { question: 'What is the Karvonen formula?', answer: 'A 1957 method that targets a percentage of your heart rate reserve (max heart rate minus resting heart rate), then adds resting heart rate back: target = (max HR − resting HR) × intensity % + resting HR.' },
        { question: 'Why does resting heart rate matter for heart rate zones?', answer: 'The Karvonen method uses it directly, so two people with the same age and max heart rate but different resting heart rates get different Karvonen targets at the same intensity percentage. Straight percent-of-max zones ignore resting heart rate entirely.' },
        { question: 'Is 220 minus age accurate?', answer: 'It is a population average, not a personal measurement, and real individual variation is substantial. Cleveland Clinic states the only precise way to know your real maximum is a supervised exercise stress test or VO2 max test.' },
        { question: 'What zone should I train in to burn fat or build endurance?', answer: 'Zone 2 (60-70% of max heart rate) is the classic steady aerobic, endurance-building zone. Higher zones (4-5) build speed and lactate tolerance but can only be sustained briefly.' }
      ]
    },
    compute(values) {
      const maxHeartRate = values.maxHRFormula === 1 ? 208 - 0.7 * values.age : 220 - values.age;
      const zone1High = maxHeartRate * 0.6;
      const zone2High = maxHeartRate * 0.7;
      const zone3High = maxHeartRate * 0.8;
      const zone4High = maxHeartRate * 0.9;
      const zone5High = maxHeartRate * 1.0;
      const karvonenTargetBpm = (maxHeartRate - values.restingHeartRate) * (values.targetIntensityPercent / 100) + values.restingHeartRate;
      return { maxHeartRate, zone1High, zone2High, zone3High, zone4High, zone5High, karvonenTargetBpm };
    }
  },
  {
    id: 'vo2-max-calculator',
    category: 'sports',
    glyph: 'VO2',
    updatedAt: '2026-11-05',
    aliases: ['vo2 max calculator', 'cooper test calculator', '12 minute run test calculator', 'vo2max estimate calculator', 'aerobic fitness calculator'],
    related: ['heart-rate-zones-calculator', 'one-rep-max-calculator', 'running-pace-calculator', 'calorie-calculator'],
    title: 'VO2 Max Calculator',
    description: 'Estimate your VO2 max (aerobic fitness) from the distance you cover in Dr. Kenneth Cooper\'s 12-minute run test, using his original 1968 regression formula.',
    example: 'Covering 1.5 miles (2,414 m) in 12 minutes predicts a VO2 max of about 42.7 mL/kg/min, using Cooper\'s formula, VO2max = (distance in meters − 504.9) ÷ 44.73.',
    breakdown: {
      headline: 'vo2Max',
      headlineLabel: 'Estimated VO2 max',
      outputs: [
        { id: 'vo2Max', label: 'Estimated VO2 max (mL/kg/min)', format: 'number' },
        { id: 'avgSpeedMph', label: 'Average speed during the test (mph)', format: 'number' }
      ],
      groups: [{ title: '12-minute run test', inputs: ['distance'] }],
      derive: (values) => ({ avgSpeedMph: values.distance * 5 })
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'What is VO2 max?',
        paragraphs: [
          'VO2 max is the maximum rate at which your body can take in, transport and use oxygen during intense exercise, measured in milliliters of oxygen per kilogram of body weight per minute (mL/kg/min). It is the standard lab measure of aerobic (cardiovascular) fitness: the higher it is, the more oxygen your heart, lungs and muscles can move and use, which generally means more sustainable effort before you have to slow down.',
          'A true VO2 max test requires a treadmill or bike, a breathing mask and gas-analysis equipment, which most people never have access to. In 1968, Dr. Kenneth Cooper, then researching fitness testing for the US Air Force, published a much simpler field alternative in JAMA: have someone run as far as they can in exactly 12 minutes, then estimate VO2 max from the distance alone. Testing 115 Air Force trainees against lab treadmill results, Cooper found the distance-only estimate correlated with directly measured VO2 max at r = 0.897, strong enough to make the field test a widely used standard for fitness testing in the decades since.',
          "The test is deliberately simple to administer (a track or a measured route and a stopwatch) but demanding to take: it only works as a maximal effort, evenly paced across the full 12 minutes. Going out too fast and fading, or holding back and sprinting the last lap, both throw off the distance-to-fitness relationship the formula assumes."
        ]
      },
      howTo: {
        intro: 'Run as far as you can, at a steady, maximal effort, for exactly 12 minutes on a measured track or route, then enter the distance covered.',
        steps: [
          { name: 'Warm up properly', text: 'A short jog and some strides before the test reduce injury risk and let you start at a sustainable pace instead of sprinting the first lap.' },
          { name: 'Run for exactly 12 minutes', text: 'Pace yourself for an even, maximal effort across the whole 12 minutes rather than starting too fast.' },
          { name: 'Record the exact distance', text: 'Measure to the nearest reasonable fraction of a lap or tenth of a mile — the formula is sensitive to small distance errors near the test\'s short end.' },
          { name: 'Enter the distance', text: 'Pick miles, kilometers or meters from the unit menu; the VO2 max estimate updates as you type.' },
          { name: 'Re-test periodically', text: 'Repeating the test every few weeks of consistent aerobic training shows whether your fitness is actually improving, which is more useful than any single score.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "Cooper's 1968 regression estimates VO2 max directly from the 12-minute test distance in meters.",
        expression: 'VO2max (mL/kg/min) = (distance in meters − 504.9) ÷ 44.73',
        terms: [
          { symbol: 'distance', meaning: 'Total distance covered in the 12-minute run, converted to meters (1 mile = 1,609.344 m exactly).' },
          { symbol: '504.9, 44.73', meaning: "The intercept and slope of Cooper's linear regression, fitted against directly measured, lab treadmill VO2 max in his original 1968 validation study." }
        ],
        note: 'A field estimate, not a lab measurement. Cooper\'s own validation only correlated at r = 0.897 with directly measured VO2 max, so individual results can be off by a meaningful margin either way.'
      },
      workedExample: {
        intro: 'A runner covers 1.5 miles in the 12-minute test. What does that predict for VO2 max?',
        rows: [
          { label: 'Distance', value: '1.5 mi' },
          { label: 'In meters (1.5 × 1,609.344)', value: '2,414.02 m' },
          { label: 'VO2max = (2,414.02 − 504.9) ÷ 44.73', value: '1,909.12 ÷ 44.73 ≈ 42.68 mL/kg/min' },
          { label: 'Average speed (1.5 mi ÷ 12 min × 60)', value: '7.5 mph' }
        ],
        result: 'Estimated VO2 max ≈ 42.7 mL/kg/min at an average pace of 7.5 mph',
        explanation: 'That result sits above the 35-40 mL/kg/min range a widely used exercise-physiology reference (Heyward, 1998) reports as the untrained healthy adult male average, and well below the roughly 70-85 mL/kg/min seen in elite male distance runners (Noakes, 2001) — consistent with a recreational runner who trains, but is not competing, at an endurance level.'
      },
      watchOut: [
        {
          title: 'Only valid as an all-out, evenly paced effort',
          body: "Cooper's formula assumes a maximal 12-minute effort. Jogging comfortably, or badly misjudging your pace and fading hard, both produce a distance that doesn't reflect your real aerobic ceiling."
        },
        {
          title: 'It is a field estimate, not a diagnosis',
          body: 'The correlation with lab-measured VO2 max in Cooper\'s original study was strong (r = 0.897) but not perfect. Treat the result as a useful estimate for tracking your own trend over time, not an exact clinical figure.'
        },
        {
          title: 'The original validation group was young, fit military trainees',
          body: "Cooper's 1968 study was built on 115 US Air Force trainees. The formula has since been used much more broadly, but its original fit was to a specific, relatively young and already-active population, not a general cross-section of ages and fitness levels."
        },
        {
          title: 'Not a substitute for medical clearance',
          body: 'A 12-minute maximal run is a demanding test. Anyone who is unconditioned, has a heart or lung condition, or is otherwise unsure about intense exercise should check with a doctor before attempting it, let alone training based on the result.'
        }
      ],
      references: [
        { label: 'Cooper, K.H., "A Means of Assessing Maximal Oxygen Intake: Correlation Between Field and Treadmill Testing," JAMA 203, no. 3 (1968): 201-204', url: 'https://jamanetwork.com/journals/jama/article-abstract/340949' },
        { label: 'Heyward, V.H., Advanced Fitness Assessment and Exercise Prescription, 3rd ed. (Champaign, IL: Human Kinetics, 1998), p. 48', url: 'https://en.wikipedia.org/wiki/VO2_max' },
        { label: 'Noakes, T., The Lore of Running, 3rd ed. (Champaign, IL: Human Kinetics / Oxford University Press, 2001)', url: 'https://en.wikipedia.org/wiki/VO2_max' }
      ]
    },
    inputs: [{ id: 'distance', label: 'Distance covered in 12 minutes', type: 'number', placeholder: '1.5', defaultValue: 1.5, step: 0.01, min: 0.1, dimension: 'length', unit: 'mi' }],
    seo: {
      title: 'VO2 Max Calculator – Cooper 12-Minute Run Test',
      description: "Estimate your VO2 max from the distance covered in Dr. Kenneth Cooper's 12-minute run test, using his original 1968 JAMA regression formula.",
      faq: [
        { question: 'How do I estimate my VO2 max without lab equipment?', answer: "Run as far as you can in exactly 12 minutes, then use Cooper's 1968 formula: VO2max = (distance in meters − 504.9) ÷ 44.73. Covering 1.5 miles (2,414 m) predicts about 42.7 mL/kg/min." },
        { question: 'What is a good VO2 max?', answer: 'A widely used exercise-physiology reference (Heyward, 1998) puts the untrained healthy adult average around 35-40 mL/kg/min for men and 27-31 for women; elite endurance athletes (Noakes, 2001) can reach roughly 70-85 for men and up to about 77 for women.' },
        { question: 'How accurate is the Cooper 12-minute test?', answer: "Cooper's original validation against lab treadmill testing in 115 US Air Force trainees found a correlation of r = 0.897 — strong, but not a perfect substitute for a real gas-analysis VO2 max test." },
        { question: 'Can I do the test on a treadmill?', answer: "Cooper's test was designed and validated as an outdoor run on a track or measured course, but the same 12-minute, maximal-effort, distance-based formula works equally well from a treadmill's recorded distance." },
        { question: 'Why does my VO2 max change over time?', answer: 'Aerobic fitness responds to consistent training: more frequent or more intense cardio exercise over weeks and months raises the distance you can cover in 12 minutes, which raises the estimate. Re-testing periodically tracks that change.' },
        { question: 'Is the 12-minute run test safe for everyone?', answer: "It is a maximal-effort test. Anyone unconditioned, with a heart or lung condition, or new to vigorous exercise should get medical clearance before attempting it." }
      ]
    },
    compute(values) {
      const meters = values.distance * 1609.344;
      const vo2Max = (meters - 504.9) / 44.73;
      return { vo2Max };
    }
  },
  {
    id: 'race-time-predictor-calculator',
    category: 'sports',
    glyph: 'race',
    updatedAt: '2026-11-05',
    aliases: ['race pace predictor calculator', 'riegel formula calculator', 'predict marathon time from 10k', 'cross distance race predictor', '5k to marathon predictor'],
    related: ['running-pace-calculator', 'vo2-max-calculator', 'heart-rate-zones-calculator', 'swim-pace-calculator'],
    title: 'Race Time Predictor',
    description: "Predict a race time at any distance from a time you've already run at a different distance, using Peter Riegel's endurance formula — in either direction, and between any two distances you choose.",
    example: "A 25-minute 5K predicts a 10K in about 52:07, using Riegel's formula, T₂ = T₁ × (D₂ ÷ D₁)^1.06.",
    solver: {
      defaultTarget: 'time2',
      variables: [
        { id: 'time1', label: 'Known race time', symbol: 'T₁', dimension: 'time', defaultValue: 25, defaultUnit: 'min' },
        { id: 'distance1', label: 'Known race distance', symbol: 'D₁', dimension: 'length', defaultValue: 5, defaultUnit: 'km' },
        { id: 'time2', label: 'Predicted time', symbol: 'T₂', dimension: 'time', defaultValue: 52.12, defaultUnit: 'min' },
        { id: 'distance2', label: 'Target race distance', symbol: 'D₂', dimension: 'length', defaultValue: 10, defaultUnit: 'km' }
      ],
      // Riegel (1977/1981): T2 = T1 × (D2 ÷ D1)^1.06. SI: time in s, distance in m — the exponent
      // applies equally to any consistent pair of units, so no conversion is needed before the power.
      solve: {
        time2: ({ time1, distance1, distance2 }) => (distance1 > 0 ? time1 * (distance2 / distance1) ** 1.06 : NaN),
        time1: ({ time2, distance1, distance2 }) => (distance2 > 0 ? time2 * (distance1 / distance2) ** 1.06 : NaN),
        distance2: ({ time1, distance1, time2 }) => (time1 > 0 && time2 >= 0 ? distance1 * (time2 / time1) ** (1 / 1.06) : NaN),
        distance1: ({ time1, time2, distance2 }) => (time2 > 0 && time1 >= 0 ? distance2 * (time1 / time2) ** (1 / 1.06) : NaN)
      },
      outputs: [{ id: 'targetPace', label: 'Pace needed at the target distance', dimension: 'pace', unit: 'min/km', compute: (si) => (si.distance2 > 0 ? si.time2 / si.distance2 : NaN) }]
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Predicting one race time from another',
        paragraphs: [
          "You cannot hold a 5K pace for a marathon: the longer the distance, the more pace naturally slows, even for a well-trained runner. In 1977, engineer Peter Riegel analyzed endurance records across many distances and sports and found time rises predictably with distance, roughly following time ∝ distance^1.06. Rearranged, that gives T₂ = T₁ × (D₂ ÷ D₁)^1.06: a known time at one distance predicts a time at any other distance.",
          'This calculator applies that relationship between any two distances you choose, in either direction. It is a different tool from a simple pace calculator, which assumes you hold the exact same pace: pace × distance = time, with distance and time scaling together one-for-one. Riegel\'s formula instead builds in a deliberate slowdown as distance grows, which is why its exponent (1.06, not 1.00) is the whole point.',
          'Because every variable has a closed-form solution, you can also run the prediction backward: instead of "what\'s my predicted marathon time," ask "what 10K time do I need to be on pace for a 4-hour marathon." Enter the goal time and distance as the known values, and the target distance and time as the ones you\'re solving for.'
        ]
      },
      howTo: {
        intro: 'Fill in any three of known time, known distance, predicted time and target distance. The fourth, marked auto, is calculated as you type.',
        steps: [
          { name: 'Enter a result you\'ve actually run', text: 'Type the time and distance of a race or a hard, honest time trial you have already completed.' },
          { name: 'Pick the distance you want to predict', text: 'Choose any target distance — a different standard race, or any custom distance — and the predicted time is calculated.' },
          { name: 'Or work backward from a goal', text: 'Type a goal time and its distance as your target, and a distance you want to test at, then leave the known time alone: it becomes the auto field and shows the time you\'d need at that distance to be on pace for the goal.' },
          { name: 'Check the pace', text: 'The pace needed at the target distance is shown underneath, in minutes per kilometer.' },
          { name: 'Treat it as a planning estimate', text: 'Use the prediction to set a realistic goal pace, not as a guarantee — training specific to the target distance still matters.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'One power-law relationship connects any two distances and times. Rearranging it gives a formula for each of the four quantities.',
        expression: 'T₂ = T₁ × (D₂ ÷ D₁)^1.06\nT₁ = T₂ × (D₁ ÷ D₂)^1.06\nD₂ = D₁ × (T₂ ÷ T₁)^(1 ÷ 1.06)\nD₁ = D₂ × (T₁ ÷ T₂)^(1 ÷ 1.06)',
        terms: [
          { symbol: 'T₁, D₁', meaning: 'A time and distance you already know — a completed race or time trial.' },
          { symbol: 'T₂, D₂', meaning: 'The predicted time at a different distance, or the distance that matches a goal time.' },
          { symbol: '1.06', meaning: "Riegel's fatigue exponent: each doubling of distance multiplies time by about 2.085, not exactly 2, which is what builds in the expected slowdown." }
        ],
        note: 'Predictions assume you train specifically for the target distance and race under similar conditions. They are planning estimates, not guarantees.'
      },
      workedExample: {
        intro: 'A runner completes a 5K in 25 minutes. What does that predict for a 10K?',
        rows: [
          { label: 'Known time (T₁)', value: '25 min' },
          { label: 'Known distance (D₁)', value: '5 km' },
          { label: 'Target distance (D₂)', value: '10 km' },
          { label: 'Ratio (D₂ ÷ D₁)', value: '2' },
          { label: 'T₂ = 25 × 2^1.06', value: '25 × 2.0849 ≈ 52.12 min' }
        ],
        result: 'Predicted 10K time ≈ 52:07 (52.12 minutes)',
        explanation: 'Holding the exact 5K pace (5:00/km) for twice the distance would take exactly 50 minutes. The Riegel prediction of 52:07 is about 2 minutes slower, which is the built-in fatigue allowance for racing twice as far — small over a doubling, but it compounds fast over bigger jumps, such as 5K to marathon.'
      },
      watchOut: [
        {
          title: 'This is not a duplicate of a plain pace calculator',
          body: "Holding your exact 5K pace for a 10K would take exactly 50 minutes (double the distance, double the time). Riegel's formula instead predicts 52:07 — the extra time is the whole point of the 1.06 exponent, modeling the real slowdown that comes with racing farther, not just scaling pace by distance."
        },
        {
          title: 'Predictions need matching training',
          body: "Riegel's exponent was fitted to performances where athletes had trained specifically for each distance. A 5K specialist without long runs will usually run slower than predicted over a marathon; a marathoner without speed work may run faster than predicted over a 5K."
        },
        {
          title: 'Stay within a reasonable distance ratio',
          body: 'The formula was fit to events from a few minutes to a few hours. Predicting from a very short sprint, or out to ultramarathon distances many times longer than your known result, stretches well outside where it was validated.'
        },
        {
          title: 'Course and conditions matter as much as the formula',
          body: 'Hills, heat, wind, altitude and a crowded start all change race times independent of distance. A prediction from a flat, cool 5K to a hilly, hot marathon will run optimistic no matter how precise the exponent is.'
        },
        {
          title: 'Backward predictions assume even pacing, too',
          body: 'Solving for the distance or time you need to hit a goal still assumes a well-paced, race-effort performance at that distance — not a time trial run casually or with poor pacing.'
        }
      ],
      references: [
        { label: 'Riegel, P.S., "Athletic Records and Human Endurance," American Scientist 69 (1981): 285-290', url: 'https://pubmed.ncbi.nlm.nih.gov/7235349/' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, the international mile)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'US Department of Health and Human Services, Physical Activity Guidelines for Americans, 2nd edition', url: 'https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines' }
      ]
    },
    inputs: [
      { id: 'distanceMiles', label: 'Known distance (miles)', type: 'number', placeholder: '3.1', defaultValue: 3.1, step: 0.1, min: 0.1 },
      { id: 'totalMinutes', label: 'Known time (minutes)', type: 'number', placeholder: '25', defaultValue: 25, step: 0.5, min: 0.5 },
      { id: 'targetMiles', label: 'Target distance (miles)', type: 'number', placeholder: '6.2', defaultValue: 6.2, step: 0.1, min: 0.1 }
    ],
    seo: {
      title: 'Race Time Predictor – Riegel Cross-Distance Formula',
      description: "Predict a race time at any distance from a time you've run at another distance using Peter Riegel's formula, solvable in either direction.",
      faq: [
        { question: 'How do you predict a race time at a different distance?', answer: "With Peter Riegel's formula, T₂ = T₁ × (D₂ ÷ D₁)^1.06. A 25-minute 5K predicts about 52:07 for a 10K, since 25 × (10 ÷ 5)^1.06 ≈ 52.12 minutes." },
        { question: 'Is this the same as a pace calculator?', answer: "No. A pace calculator assumes you hold one exact pace (time scales one-for-one with distance). This predictor builds in Riegel's 1.06 exponent, which models the real slowdown that comes with racing farther — doubling the distance takes about 2.085 times as long, not exactly twice." },
        { question: 'What 10K time do I need for a 4-hour marathon?', answer: 'Working the formula backward, T₁ = T₂ × (D₁ ÷ D₂)^1.06. A 4-hour (240-minute) marathon target and a 10K distance predicts a 10K time of about 52 minutes.' },
        { question: 'How accurate are Riegel predictions?', answer: "They assume you've trained specifically for the target distance and that conditions are similar. They are a useful planning estimate, not a guarantee — real results vary with training, terrain and weather." },
        { question: 'Can I predict a half marathon from a 10-mile time?', answer: 'Yes — enter your 10-mile time and distance as the known result and your target distance as 13.1 miles (or 21.0975 km); the calculator works between any two distances, not just the four standard road races.' },
        { question: 'Does the formula work for short sprints or ultramarathons?', answer: "Riegel's own analysis covered events lasting from a few minutes to a few hours. Predictions from a very short sprint, or out to much longer ultramarathon distances, are far less reliable." }
      ]
    },
    compute(values) {
      const predictedMinutes = values.totalMinutes * (values.targetMiles / values.distanceMiles) ** 1.06;
      return { predictedMinutes };
    }
  },
  {
    id: 'swim-pace-calculator',
    category: 'sports',
    glyph: 'lap',
    updatedAt: '2026-11-05',
    aliases: ['swim pace calculator', 'pace per 100m calculator', 'swim pace per 100 yards', 'swimming speed calculator', 'swim split calculator'],
    related: ['running-pace-calculator', 'race-time-predictor-calculator', 'vo2-max-calculator', 'one-rep-max-calculator'],
    title: 'Swim Pace Calculator',
    description: 'Work out your swim pace per 100 meters and per 100 yards, plus your average speed, from a total distance and time — built around how pool swimmers actually read a pace clock.',
    example: 'Swimming 1,500 m in 30:00 is a pace of 2:00 per 100 m (1:50 per 100 yd) — an average speed of 3.0 km/h (1.86 mph).',
    breakdown: {
      headline: 'pace100mSec',
      headlineLabel: 'Pace per 100 m (seconds)',
      outputs: [
        { id: 'pace100mSec', label: 'Pace per 100 m (seconds)', format: 'number' },
        { id: 'pace100ydSec', label: 'Pace per 100 yd (seconds)', format: 'number' },
        { id: 'speedKmh', label: 'Average speed', format: 'number', dimension: 'speed', unit: 'km/h' },
        { id: 'speedMph', label: 'Average speed', format: 'number', dimension: 'speed', unit: 'mph' }
      ],
      groups: [{ title: 'Swim', inputs: ['distance', 'time'] }]
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Why swimmers pace by the 100, not the mile',
        paragraphs: [
          'Runners and cyclists usually talk pace per mile or kilometer, because open roads and trails are measured that way. Pool swimmers train and race in a space defined by the pool itself, so the standard unit is pace per 100 — "1:30 pace" means 100 meters or 100 yards every minute and a half — because that maps directly onto the pace clock on deck and onto how most sets and splits are actually written.',
          'Which 100 you mean matters, though. US Masters Swimming explains that most American pools are 25 yards long (short course yards, SCY), while international short-course competition uses 25-meter pools (SCM) and the Olympic standard is a 50-meter pool (long course meters, LCM). A yard (0.9144 m) is shorter than a meter, so the same swim speed produces a smaller "pace per 100 yards" number than "pace per 100 meters" — they are not interchangeable without converting.',
          "This calculator takes your total distance and time for a swim and returns pace per 100 m, pace per 100 yd, and average speed, so you can compare a set swum in any pool length on the same terms."
        ]
      },
      howTo: {
        intro: 'Enter the total distance you swam and the total time it took. Pick the distance unit from the menu to match your pool.',
        steps: [
          { name: 'Enter total distance', text: 'The full distance of the swim or set, in meters, yards or any other length unit from the menu.' },
          { name: 'Enter total time', text: 'Your total elapsed time for that distance, in minutes.' },
          { name: 'Read both pace figures', text: 'Pace per 100 m and per 100 yd are both shown, in seconds, so you can compare against a set written in either unit.' },
          { name: 'Check average speed', text: 'Average speed is shown in km/h and mph, useful for comparing effort across very different distances or strokes.' },
          { name: 'Use pace to plan a set', text: 'Multiply your pace per 100 by however many hundreds are in a planned set to get a target total time, or vice versa.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Pace per 100 is just total time divided by total distance, scaled to a 100-unit block. The two pace figures are tied together by the exact yard-to-meter conversion.',
        expression: 'Pace per 100 m (s) = (total seconds ÷ meters) × 100\nPace per 100 yd (s) = pace per 100 m × 0.9144\nSpeed = distance ÷ time',
        terms: [
          { symbol: 'total seconds', meaning: 'Total swim time, converted to seconds.' },
          { symbol: 'meters', meaning: 'Total distance swum, in meters.' },
          { symbol: '0.9144', meaning: 'Exact meters per yard (1 yd = 3 ft = 0.9144 m), so pace per 100 yd is always a smaller number than pace per 100 m at the same real speed.' }
        ],
        note: 'This is the same real speed expressed two ways, not two different swims — a 2:00/100m pace and a 1:50/100yd pace describe exactly the same velocity through the water.'
      },
      workedExample: {
        intro: 'A swimmer covers 1,500 m in 30 minutes. What is their pace per 100 m, per 100 yd, and average speed?',
        rows: [
          { label: 'Distance', value: '1,500 m' },
          { label: 'Time', value: '30 min = 1,800 s' },
          { label: 'Pace per 100 m (1,800 ÷ 1,500 × 100)', value: '120 s = 2:00/100 m' },
          { label: 'Distance in yards (1,500 ÷ 0.9144)', value: '1,640.42 yd' },
          { label: 'Pace per 100 yd (120 × 0.9144)', value: '109.73 s ≈ 1:50/100 yd' },
          { label: 'Speed (1,500 m ÷ 1,800 s × 3.6)', value: '3.0 km/h (1.86 mph)' }
        ],
        result: '2:00/100 m · 1:50/100 yd · 3.0 km/h (1.86 mph)',
        explanation: 'The pace-per-100-yards figure (109.73 s) is smaller than the pace-per-100-meters figure (120 s) because a yard is shorter than a meter — the swimmer is not actually faster, they are just covering a shorter "100" in less time at the exact same speed.'
      },
      watchOut: [
        {
          title: 'Pace per 100 is not comparable across pool lengths without converting',
          body: 'A 1:30/100m pace and a 1:30/100yd pace are different speeds — the yards figure describes a faster swim, since 100 yards is a shorter distance than 100 meters. Always check which unit a published time or set is written in before comparing.'
        },
        {
          title: 'More walls often means faster times, not more fitness',
          body: 'A shorter pool (a 25-yard SCY pool, for example) means more turns and push-offs per 100 than a 50-meter long-course pool. Many swimmers post noticeably faster times in a short course pool than a long course pool at a similar effort, simply because of the extra push-offs — not because they swam a different speed through the water.'
        },
        {
          title: 'Open water has no walls, currents or a straight line',
          body: 'Pool pace does not translate directly to open water: there are no push-offs to help, and current, waves and navigating around a course all change the real time for a given distance.'
        },
        {
          title: 'Stroke changes the pace, not the formula',
          body: 'This calculator works the same arithmetic regardless of stroke, but different strokes (freestyle, breaststroke, backstroke, butterfly) have very different typical paces for the same swimmer — comparing pace across strokes is not an apples-to-apples fitness comparison.'
        }
      ],
      references: [
        { label: 'US Masters Swimming, "Masters Swimming 101: Yards and Meters"', url: 'https://www.usms.org/fitness-and-training/articles-and-videos/articles/masters-swimming-101-yards-and-meters?Oldid=1928' },
        { label: 'World Aquatics, Facilities Rules (pool length standards for long course and short course)', url: 'https://resources.fina.org/fina/document/2024/06/28/dcaceb72-3012-4b65-90fb-e4dda53a3132/AQUA-Pool-Certification-Swimming_NEW.pdf' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, the exact yard)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'distance', label: 'Total distance', type: 'number', placeholder: '1500', defaultValue: 1500, step: 1, min: 1, dimension: 'length', unit: 'm' },
      { id: 'time', label: 'Total time', type: 'number', placeholder: '30', defaultValue: 30, step: 0.5, min: 0.1, dimension: 'time', unit: 'min' }
    ],
    seo: {
      title: 'Swim Pace Calculator – Pace per 100m & 100yd',
      description: 'Calculate swim pace per 100 meters and per 100 yards, plus average speed, from your total distance and time.',
      faq: [
        { question: 'How do I calculate my swim pace per 100 meters?', answer: 'Divide total time in seconds by total distance in meters, then multiply by 100. Swimming 1,500 m in 30 minutes (1,800 s) is (1,800 ÷ 1,500) × 100 = 120 seconds, or 2:00 per 100 m.' },
        { question: 'How do I convert swim pace from meters to yards?', answer: 'Multiply pace per 100 m by 0.9144 (the exact number of meters in a yard). A 2:00/100m pace (120 s) converts to 120 × 0.9144 ≈ 109.7 s, or about 1:50/100 yd.' },
        { question: 'What is the difference between SCY, SCM and LCM?', answer: 'Short course yards (SCY) pools are 25 yards, used mainly in the US; short course meters (SCM) pools are 25 meters; long course meters (LCM) pools are 50 meters, the Olympic standard.' },
        { question: 'Why are my times faster in a short course pool?', answer: 'A shorter pool means more walls and push-offs per 100, which usually makes times faster than in a 50-meter long course pool at the same real swimming effort.' },
        { question: 'How do I convert swim pace to speed?', answer: 'Speed equals distance divided by time. 1,500 m in 1,800 s is 0.833 m/s, which is 3.0 km/h (0.833 × 3.6) or about 1.86 mph.' },
        { question: 'Does this work for open water swims?', answer: 'The arithmetic is the same, but pool pace does not translate directly: open water has no walls to push off, plus currents and navigation that change the real time for a given distance.' }
      ]
    },
    compute(values) {
      const totalSeconds = values.time * 60;
      const pace100mSec = values.distance > 0 ? (totalSeconds / values.distance) * 100 : NaN;
      const yards = values.distance / 0.9144;
      const pace100ydSec = yards > 0 ? (totalSeconds / yards) * 100 : NaN;
      const speedMps = totalSeconds > 0 ? values.distance / totalSeconds : NaN;
      const speedKmh = speedMps * 3.6;
      const speedMph = speedMps / 0.44704;
      return { pace100mSec, pace100ydSec, speedKmh, speedMph };
    }
  },
  {
    id: 'steps-to-miles-calculator',
    category: 'sports',
    glyph: 'step',
    updatedAt: '2026-11-05',
    aliases: ['steps to miles calculator', 'steps to km calculator', 'how many steps in a mile calculator', 'stride length calculator', 'pedometer steps to distance calculator', 'steps to distance converter'],
    related: ['running-pace-calculator', 'swim-pace-calculator', 'calorie-calculator', 'miles-to-kilometers-converter'],
    title: 'Steps to Miles Calculator',
    description: 'Convert a step count to a distance (or back) using your own step length, plus work out the step length itself from a known distance and step count — any two fields solve the third.',
    example: '10,000 steps at an average step length of 2.5 ft (0.762 m) covers about 4.73 miles (7.62 km).',
    solver: {
      defaultTarget: 'distance',
      variables: [
        { id: 'distance', label: 'Distance', symbol: 'd', dimension: 'length', defaultValue: 4.734848, defaultUnit: 'mi' },
        { id: 'steps', label: 'Steps', symbol: 'n', dimension: 'count', defaultValue: 10000, defaultUnit: 'count' },
        { id: 'stepLength', label: 'Step length', symbol: 'L', dimension: 'length', defaultValue: 2.5, defaultUnit: 'ft' }
      ],
      // SI: distance in meters, steps dimensionless (count's base factor is 1), stepLength in meters.
      solve: {
        distance: ({ steps, stepLength }) => steps * stepLength,
        steps: ({ distance, stepLength }) => (stepLength > 0 ? distance / stepLength : NaN),
        stepLength: ({ distance, steps }) => (steps > 0 ? distance / steps : NaN)
      }
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Converting steps to a real distance',
        paragraphs: [
          "A step counter only ever counts steps — it has no idea how far you actually walked or ran unless it also knows (or estimates) how long each step is. Multiply the two together and you get distance: distance = steps × step length. This calculator runs that relationship in all three directions: find a distance from a step count, find how many steps a distance would take, or work out your own step length from a distance and step count you already know (the most accurate way to personalize the conversion, for example by counting your steps across a measured quarter-mile).",
          "\"Step length\" here means the distance covered by one single step (one foot-strike to the next), which is what a step count actually accumulates. Gait researchers reserve the word \"stride\" for a full stride — both feet, left and right — which covers roughly double that distance; everyday pedometer and fitness-app copy often blurs the two terms together, so this calculator is explicit: enter your per-step distance, not a full left-right stride.",
          'Without a personal measurement, published averages are commonly cited: a meta-analysis of 23,111 adults by Bohannon and Andrews (2011) found average walking speeds and step/stride patterns vary by height and age, and one often-cited rule of thumb from CDC- and Mayo Clinic-sourced figures uses about 2.5 ft (0.762 m) for men and 2.2 ft (0.67 m) for women as an average adult step length — figures that assume a casual walking pace, not a run, and vary a lot with a person\'s actual height.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of distance, steps and step length. The third, marked auto, is calculated as you type.',
        steps: [
          { name: 'Convert a step count to distance', text: 'Type your steps and a step length (your own measured value if you have one, or an average like 2.5 ft), and distance is calculated.' },
          { name: 'Find out how many steps a walk will take', text: 'Type a target distance and your step length, then leave steps alone: it becomes the auto field.' },
          { name: 'Measure your own step length', text: 'Walk a known distance (a measured 100 ft, or one lap of a track), count your steps, then type both in: step length is calculated and will be more accurate than any average.' },
          { name: 'Switch units freely', text: 'Distance accepts miles, kilometers, meters or feet from its unit menu; step length accepts feet, meters, inches or centimeters.' },
          { name: 'Use your own number going forward', text: 'A step length measured on flat ground at your normal pace is good for everyday walking distances; a run uses longer steps, so measure separately if you want to convert running step counts.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Steps, step length and distance are related by one multiplication. Rearranging it gives a formula for each.',
        expression: 'distance = steps × L\nsteps = distance ÷ L\nL = distance ÷ steps',
        terms: [
          { symbol: 'distance', meaning: 'Total distance covered.' },
          { symbol: 'steps', meaning: 'Total number of individual steps (not full left-right strides).' },
          { symbol: 'L', meaning: 'Step length: the distance covered by one single step.' }
        ],
        note: 'This is exact arithmetic once step length is known. The uncertainty in any steps-to-distance conversion is almost always in the step length, not the formula.'
      },
      workedExample: {
        intro: 'Someone walks 10,000 steps at an average step length of 2.5 ft. How far did they go?',
        rows: [
          { label: 'Steps', value: '10,000' },
          { label: 'Step length (L)', value: '2.5 ft (0.762 m)' },
          { label: 'Distance = 10,000 × 2.5 ft', value: '25,000 ft' },
          { label: 'In miles (25,000 ÷ 5,280)', value: '4.7348 mi' },
          { label: 'In kilometers (10,000 × 0.762 m)', value: '7,620 m = 7.62 km' }
        ],
        result: '10,000 steps ≈ 4.73 miles (7.62 km) at a 2.5 ft step length',
        explanation: 'The often-repeated "10,000 steps is about 5 miles" rule of thumb assumes a slightly shorter step length than this (around 2.11-2.2 ft per step, closer to 2,117 steps per mile); at 2.5 ft per step this same step count comes out a bit short of 5 miles instead.'
      },
      watchOut: [
        {
          title: 'Step length is not stride length',
          body: 'Gait researchers define a full "stride" as two steps (one left, one right), covering roughly double the distance of a single step. This calculator\'s "step length" is deliberately the shorter, single-step figure, since that is what a step counter actually counts.'
        },
        {
          title: 'Running steps are longer than walking steps',
          body: "The same person's step length stretches noticeably when running versus walking. Reusing a walking step length to convert a run's step count will underestimate the real distance covered."
        },
        {
          title: 'Average step-length figures are population averages, not your number',
          body: 'Height is the biggest driver of step length (one commonly cited estimate is close to 0.41-0.415 times height), but terrain, fatigue, age and walking speed all shift it too. A step length measured on your own walk is always more accurate than any published average.'
        },
        {
          title: '"Steps per mile" figures you see elsewhere assume one specific step length',
          body: 'Figures like "2,000 steps per mile" or "2,117 steps per mile" are only correct for whatever step length they assumed when computed; change the step length and the steps-per-mile figure changes right along with it.'
        },
        {
          title: 'A phone or wearable step count has its own measurement error',
          body: 'This calculator converts whatever step count you already have; it cannot correct for a device under- or over-counting actual steps, which is a separate source of error from the step-length conversion itself.'
        }
      ],
      references: [
        { label: 'Bohannon, R.W., Andrews, A.W., "Normal Walking Speed: A Descriptive Meta-Analysis," Physiotherapy 97, no. 3 (2011): 182-189', url: 'https://pubmed.ncbi.nlm.nih.gov/21820535/' },
        { label: 'Bohannon, R.W., "Comfortable and Maximum Walking Speed of Adults Aged 20-79 Years: Reference Values and Determinants," Age and Ageing 26, no. 1 (1997): 15-19', url: 'https://pubmed.ncbi.nlm.nih.gov/9143432/' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, the exact foot and mile)', url: 'https://www.nist.gov/pml/special-publication-811' }
      ]
    },
    inputs: [
      { id: 'steps', label: 'Steps', type: 'number', placeholder: '10000', defaultValue: 10000, step: 100, min: 1 },
      { id: 'stepLengthFt', label: 'Step length (ft)', type: 'number', placeholder: '2.5', defaultValue: 2.5, step: 0.1, min: 0.1 }
    ],
    seo: {
      title: 'Steps to Miles Calculator – Step Length & Distance',
      description: 'Convert steps to miles or kilometers using your step length, or solve backwards for steps or step length from a known distance.',
      faq: [
        { question: 'How many miles is 10,000 steps?', answer: 'It depends on your step length. At an average 2.5 ft step, 10,000 steps is about 4.73 miles (7.62 km); at a shorter, commonly cited 2.2 ft step it is closer to 4.17 miles.' },
        { question: 'How many steps are in a mile?', answer: 'At a 2.5 ft step length, a mile (5,280 ft) takes 2,112 steps. Commonly cited CDC- and Mayo Clinic-sourced averages (around 76 cm, or about 2.5 ft) put it near 2,117 steps per mile; shorter steps mean more steps per mile.' },
        { question: 'What is the difference between step length and stride length?', answer: 'A step is one footfall; a stride is two steps (left and right), so a full stride covers roughly double the distance of one step. This calculator asks for step length, the shorter, single-step figure.' },
        { question: 'How do I find my own step length?', answer: 'Walk a measured distance, such as 100 feet or one lap of a track, counting your steps, then divide the distance by the step count. That is more accurate than any published average.' },
        { question: 'Is step length the same for walking and running?', answer: "No. The same person's steps lengthen noticeably when running, so a walking step length will underestimate distance if applied to a running step count." },
        { question: 'Does height affect step length?', answer: 'Yes — height is the strongest predictor of step length. One widely cited estimate puts step length at roughly 0.41 to 0.415 times a person\'s height, though individual gait varies.' }
      ]
    },
    compute(values) {
      const distanceMiles = (values.steps * values.stepLengthFt) / 5280;
      return { distanceMiles };
    }
  },
  {
    id: 'baseball-batting-average-calculator',
    category: 'sports',
    glyph: 'AVG',
    updatedAt: '2026-11-05',
    aliases: ['batting average calculator', 'on base percentage calculator', 'slugging percentage calculator', 'ops calculator baseball', 'obp calculator', 'baseball hitting stats calculator'],
    related: ['nfl-passer-rating-calculator', 'cricket-bowling-figures-calculator', 'elo-rating-calculator'],
    title: 'Baseball Batting Stats Calculator',
    description: 'Calculate batting average (AVG), on-base percentage (OBP), slugging percentage (SLG) and OPS together from a batting line, using the official MLB formulas.',
    example: 'A hitter who goes 139-for-500 with 55 walks, 5 hit-by-pitches, 5 sacrifice flies, 28 doubles, 3 triples and 20 home runs has a .278 average, a .352 OBP, a .466 SLG and an .818 OPS.',
    breakdown: {
      headline: 'battingAverage',
      headlineLabel: 'Batting average (AVG)',
      outputs: [
        { id: 'battingAverage', label: 'Batting average (AVG)', format: 'significant' },
        { id: 'onBasePercentage', label: 'On-base percentage (OBP)', format: 'significant' },
        { id: 'sluggingPercentage', label: 'Slugging percentage (SLG)', format: 'significant' },
        { id: 'onBasePlusSlugging', label: 'On-base plus slugging (OPS)', format: 'significant' }
      ],
      groups: [
        { title: 'Plate appearances', inputs: ['atBats', 'hits', 'walks', 'hitByPitch', 'sacrificeFlies'] },
        { title: 'Extra-base hits (within those hits)', inputs: ['doubles', 'triples', 'homeRuns'] }
      ]
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Four stats, one batting line',
        paragraphs: [
          "Batting average (AVG), on-base percentage (OBP), slugging percentage (SLG) and OPS are the four most commonly cited hitting stats in baseball, and all four come from the same handful of numbers on a batting line: at-bats, hits, walks, hit-by-pitches, sacrifice flies and the breakdown of those hits into singles, doubles, triples and home runs. Rather than build four separate single-stat pages, this calculator takes one batting line and returns all four at once, the way a broadcast graphic or a stat site would.",
          "Batting average, per MLB's own glossary, is simply hits divided by at-bats — it answers \"how often does a ball in play become a hit,\" but it treats every hit the same and ignores walks entirely. On-base percentage widens the lens to how often a batter reaches base by any means that counts (hits, walks, hit-by-pitches), out of every plate appearance that could have put them on base. Slugging percentage swings the other way, weighting hits by how many bases they're worth (a double counts double a single, a home run counts quadruple) to capture power rather than just contact. OPS is simply OBP plus SLG added together — a quick single number that rewards both getting on base and hitting for power, without needing a full stat line to compare two hitters."
        ]
      },
      howTo: {
        intro: 'Enter the batting line: at-bats, hits, walks, hit-by-pitches and sacrifice flies, then break the hits down into doubles, triples and home runs (singles are worked out automatically).',
        steps: [
          { name: 'Enter at-bats and hits', text: 'At-bats (AB) and total hits (H) drive batting average on their own.' },
          { name: 'Add walks, hit-by-pitches and sacrifice flies', text: 'These widen the on-base percentage calculation beyond at-bats alone to the batter\'s full plate appearances.' },
          { name: 'Break hits into doubles, triples and home runs', text: 'Singles are calculated as whatever is left over from total hits, so just enter the extra-base hits.' },
          { name: 'Read all four stats', text: 'Batting average, OBP, SLG and OPS are all shown together, computed from the same line.' },
          { name: 'Compare hitters on the same basis', text: 'Enter a second player\'s line separately to compare; OPS in particular is a quick single number for that comparison.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "MLB's own glossary defines each stat from counting numbers on a batting line.",
        expression: 'AVG = H ÷ AB\nOBP = (H + BB + HBP) ÷ (AB + BB + HBP + SF)\nSLG = (1B + 2×2B + 3×3B + 4×HR) ÷ AB\nOPS = OBP + SLG',
        terms: [
          { symbol: 'AB', meaning: 'At-bats — plate appearances that count toward batting average (excludes walks, hit-by-pitches, sacrifices and a few other cases).' },
          { symbol: 'H, 1B, 2B, 3B, HR', meaning: 'Total hits, and hits broken down by type: singles, doubles, triples, home runs.' },
          { symbol: 'BB, HBP, SF', meaning: 'Walks (bases on balls), hit-by-pitches, and sacrifice flies.' }
        ],
        note: 'Singles (1B) are not entered directly: this calculator works them out as total hits minus doubles, triples and home runs.'
      },
      workedExample: {
        intro: 'A hitter finishes a season 139-for-500 (28 doubles, 3 triples, 20 home runs), with 55 walks, 5 hit-by-pitches and 5 sacrifice flies. What are their AVG, OBP, SLG and OPS?',
        rows: [
          { label: 'Singles (139 − 28 − 3 − 20)', value: '88' },
          { label: 'AVG = 139 ÷ 500', value: '0.278' },
          { label: 'OBP = (139 + 55 + 5) ÷ (500 + 55 + 5 + 5)', value: '199 ÷ 565 = 0.352' },
          { label: 'Total bases = 88×1 + 28×2 + 3×3 + 20×4', value: '88 + 56 + 9 + 80 = 233' },
          { label: 'SLG = 233 ÷ 500', value: '0.466' },
          { label: 'OPS = 0.352 + 0.466', value: '0.818' }
        ],
        result: '.278 AVG · .352 OBP · .466 SLG · .818 OPS',
        explanation: 'The OBP (.352) sits well above the AVG (.278) because 60 of the 565 plate appearances (walks and hit-by-pitches) reach base without counting as an at-bat; the SLG (.466) sits well above AVG too, because 51 of the 139 hits are doubles, triples or home runs worth more than one base each.'
      },
      watchOut: [
        {
          title: 'At-bats and plate appearances are not the same thing',
          body: 'Walks, hit-by-pitches, sacrifice bunts and sacrifice flies are plate appearances but not at-bats, which is exactly why OBP uses a wider denominator than AVG. Mixing up the two totals will throw off every stat on this page.'
        },
        {
          title: 'OPS adds two differently-scaled numbers together',
          body: "OBP and SLG are not measuring quite the same thing before they're added — OBP is a rate of getting on base at all, SLG is bases per at-bat, which can exceed 1.000 for a true power hitter. OPS is a useful quick summary, but it is a convenience stat, not a probability or a percentage of anything."
        },
        {
          title: 'Reached-on-error and fielder\'s-choice hits don\'t count',
          body: "MLB's official hit (H) total only includes a batted ball that's officially ruled a hit; reaching base on a fielding error or a fielder's choice counts as an at-bat but not a hit, which lowers AVG even though the batter is on base."
        },
        {
          title: 'Small sample sizes swing all four stats wildly',
          body: 'Early in a season, a handful of at-bats either way can move batting average by dozens of points. Season or career totals are far more stable and meaningful than a single week or month.'
        },
        {
          title: 'These stats are not park- or league-adjusted',
          body: 'None of AVG, OBP, SLG or OPS account for the ballpark a hitter plays in or the era they played in, both of which shift raw offensive numbers a lot. Advanced stats like OPS+ or wRC+ adjust for those factors; this page intentionally sticks to the classic, unadjusted formulas.'
        }
      ],
      references: [
        { label: 'MLB.com Glossary, "Batting Average"', url: 'https://www.mlb.com/glossary/standard-stats/batting-average' },
        { label: 'MLB.com Glossary, "On-base Percentage (OBP)"', url: 'https://www.mlb.com/glossary/standard-stats/on-base-percentage' },
        { label: 'MLB.com Glossary, "Slugging Percentage (SLG)"', url: 'https://www.mlb.com/glossary/standard-stats/slugging-percentage' },
        { label: 'MLB.com Glossary, "OPS"', url: 'https://www.mlb.com/glossary/standard-stats/ops' }
      ]
    },
    inputs: [
      { id: 'atBats', label: 'At-bats (AB)', type: 'number', placeholder: '500', defaultValue: 500, step: 1, min: 1 },
      { id: 'hits', label: 'Hits (H)', type: 'number', placeholder: '139', defaultValue: 139, step: 1, min: 0 },
      { id: 'walks', label: 'Walks (BB)', type: 'number', placeholder: '55', defaultValue: 55, step: 1, min: 0 },
      { id: 'hitByPitch', label: 'Hit by pitch (HBP)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'sacrificeFlies', label: 'Sacrifice flies (SF)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'doubles', label: 'Doubles (2B)', type: 'number', placeholder: '28', defaultValue: 28, step: 1, min: 0 },
      { id: 'triples', label: 'Triples (3B)', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 0 },
      { id: 'homeRuns', label: 'Home runs (HR)', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 0 }
    ],
    seo: {
      title: 'Baseball Batting Stats Calculator – AVG, OBP, SLG, OPS',
      description: 'Calculate batting average, on-base percentage, slugging percentage and OPS together from a batting line, using the official MLB formulas.',
      faq: [
        { question: 'How do you calculate batting average?', answer: 'Divide hits by at-bats: AVG = H ÷ AB. 139 hits in 500 at-bats is 139 ÷ 500 = .278.' },
        { question: 'How do you calculate on-base percentage?', answer: 'OBP = (hits + walks + hit-by-pitches) ÷ (at-bats + walks + hit-by-pitches + sacrifice flies). It widens the denominator to every plate appearance that could put you on base, not just at-bats.' },
        { question: 'How do you calculate slugging percentage?', answer: 'SLG = total bases ÷ at-bats, where a single counts 1 base, a double 2, a triple 3 and a home run 4. It rewards hitting for extra bases, not just making contact.' },
        { question: 'What is OPS and what counts as good?', answer: 'OPS is on-base percentage plus slugging percentage (OBP + SLG). As a rough guide, an OPS above .800 is a strong everyday hitter, and above .900 is typically an All-Star-caliber season, though context (era, ballpark) always matters.' },
        { question: 'Why is OBP usually higher than batting average?', answer: 'OBP credits walks and hit-by-pitches as reaching base, while batting average only counts hits out of at-bats. Any batter who draws walks will have an OBP noticeably above their batting average.' },
        { question: 'Do singles need to be entered separately?', answer: 'No — this calculator works out singles automatically as total hits minus doubles, triples and home runs, so you only need to enter the extra-base hit totals.' }
      ]
    },
    compute(values) {
      const singles = Math.max(values.hits - values.doubles - values.triples - values.homeRuns, 0);
      const plateAppearancesOnBase = values.atBats + values.walks + values.hitByPitch + values.sacrificeFlies;
      const battingAverage = values.atBats > 0 ? values.hits / values.atBats : NaN;
      const onBasePercentage = plateAppearancesOnBase > 0 ? (values.hits + values.walks + values.hitByPitch) / plateAppearancesOnBase : NaN;
      const totalBases = singles + 2 * values.doubles + 3 * values.triples + 4 * values.homeRuns;
      const sluggingPercentage = values.atBats > 0 ? totalBases / values.atBats : NaN;
      const onBasePlusSlugging = onBasePercentage + sluggingPercentage;
      return { battingAverage, onBasePercentage, sluggingPercentage, onBasePlusSlugging };
    }
  },
  {
    id: 'cricket-bowling-figures-calculator',
    category: 'sports',
    glyph: 'wkt',
    updatedAt: '2026-11-05',
    aliases: ['cricket bowling average calculator', 'bowling economy rate calculator', 'bowling strike rate calculator', 'cricket bowling figures calculator', 'bowling figures calculator'],
    related: ['cricket-net-run-rate-calculator', 'baseball-batting-average-calculator', 'nfl-passer-rating-calculator'],
    title: 'Cricket Bowling Figures Calculator',
    description: 'Calculate bowling average, economy rate and strike rate together from runs conceded, wickets taken and balls bowled — the three figures that make up a bowler\'s full "bowling figures."',
    example: 'Conceding 196 runs off 288 balls (48 overs) for 8 wickets gives a bowling average of 24.50, an economy rate of 4.08 and a strike rate of 36.0 balls per wicket.',
    breakdown: {
      headline: 'bowlingAverage',
      headlineLabel: 'Bowling average (runs per wicket)',
      outputs: [
        { id: 'bowlingAverage', label: 'Bowling average (runs per wicket)', format: 'number' },
        { id: 'economyRate', label: 'Economy rate (runs per over)', format: 'number' },
        { id: 'strikeRate', label: 'Strike rate (balls per wicket)', format: 'number' }
      ],
      groups: [{ title: 'Bowling figures', inputs: ['runsConceded', 'wicketsTaken', 'ballsBowled'] }]
    },
    content: {
      lastReviewed: '2026-11-05',
      concept: {
        title: 'Three numbers behind a bowler\'s figures',
        paragraphs: [
          'A bowler\'s "figures" — something like 4/32 off 9 overs — are usually boiled down to three rate stats for comparing performances across matches and careers. Bowling average is runs conceded per wicket taken: the lower it is, the fewer runs a bowler typically gives up for each wicket, which rewards taking wickets cheaply. Economy rate is runs conceded per over: the lower it is, the more a bowler restricts scoring regardless of whether they take wickets at all, which matters most in limited-overs cricket where containing runs can be as valuable as taking wickets. Strike rate (for a bowler) is balls bowled per wicket: the lower it is, the more frequently a bowler takes a wicket, independent of how many runs those wickets cost.',
          'These three figures can disagree with each other, and that disagreement is informative: an economical bowler who rarely takes wickets has a low economy rate but a high average and strike rate; an aggressive wicket-taker who also leaks runs has a low strike rate but a high economy rate. Test cricket selection conversations tend to weigh average and strike rate most heavily, while Twenty20 weighs economy rate about as heavily as the other two, since containing an over matters more when only 20 overs exist per innings.'
        ]
      },
      howTo: {
        intro: 'Enter total runs conceded, wickets taken and balls bowled for the spell, match or career you want figures for.',
        steps: [
          { name: 'Enter runs conceded', text: 'Every run scored off the bowler\'s deliveries, including wides, no-balls and leg-byes (but not byes).' },
          { name: 'Enter wickets taken', text: 'Wickets credited to the bowler specifically (run-outs and some other dismissals are not credited to the bowler).' },
          { name: 'Enter balls bowled, not overs', text: 'Total legal deliveries bowled. Converting overs yourself (overs × 6 + extra balls) avoids the overs-notation trap below.' },
          { name: 'Read all three figures', text: 'Bowling average, economy rate and strike rate are all shown together from the same three numbers.' },
          { name: 'Compare bowlers on the same format', text: 'Economy rate especially only means the same thing when comparing bowlers within the same format (Test, ODI or T20), since over limits differ.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'All three figures are simple ratios of the same three counting numbers.',
        expression: 'Bowling average = runs conceded ÷ wickets taken\nEconomy rate = runs conceded ÷ (balls bowled ÷ 6)\nStrike rate = balls bowled ÷ wickets taken',
        terms: [
          { symbol: 'runs conceded', meaning: 'Total runs scored off the bowler, including wides, no-balls and leg-byes.' },
          { symbol: 'wickets taken', meaning: 'Dismissals credited to the bowler.' },
          { symbol: 'balls bowled', meaning: 'Total legal deliveries bowled (balls bowled ÷ 6 = overs bowled).' }
        ],
        note: 'Bowling average and strike rate are undefined (no answer) for a bowler who has taken no wickets, since both divide by wickets taken. Economy rate is still defined with zero wickets.'
      },
      workedExample: {
        intro: 'A bowler concedes 196 runs off 48 overs (288 balls) across a match, taking 8 wickets in total. What are their average, economy rate and strike rate?',
        rows: [
          { label: 'Runs conceded', value: '196' },
          { label: 'Wickets taken', value: '8' },
          { label: 'Balls bowled (48 overs × 6)', value: '288' },
          { label: 'Bowling average = 196 ÷ 8', value: '24.50' },
          { label: 'Overs bowled = 288 ÷ 6', value: '48' },
          { label: 'Economy rate = 196 ÷ 48', value: '4.0833 ≈ 4.08' },
          { label: 'Strike rate = 288 ÷ 8', value: '36.0' }
        ],
        result: 'Average 24.50 · Economy rate 4.08 · Strike rate 36.0',
        explanation: 'An average of 24.50 and a strike rate of exactly 36 balls (6 overs) per wicket describe the same underlying performance two ways — one in runs per wicket, one in balls per wicket — while the economy rate (4.08 runs per over) is a separate measure of how many runs those 48 overs leaked regardless of when the wickets fell.'
      },
      watchOut: [
        {
          title: 'Cricket overs are not decimal numbers',
          body: '"9.3 overs" means 9 complete overs plus 3 balls (57 balls total), not 9.3 overs as a decimal (which would be 9 overs and 18 balls). This calculator asks for total balls bowled specifically to avoid that trap — convert with balls = overs × 6 + extra balls before entering.'
        },
        {
          title: 'Wides, no-balls and leg-byes all count against the bowler; byes don\'t',
          body: "A wide or no-ball is scored against the bowler because it's considered the bowler's own error, and a leg-bye (the ball deflecting off the batter's body) also counts as runs conceded. A bye (the ball passing everyone untouched) is the only one of the four extras that does not count against the bowler's figures."
        },
        {
          title: 'A bowler with zero wickets has no average or strike rate',
          body: 'Both bowling average and strike rate divide by wickets taken, so a wicketless spell has no defined value for either — only economy rate still applies.'
        },
        {
          title: 'The three stats can disagree, and that is informative, not a bug',
          body: 'A bowler can have an excellent economy rate while rarely taking wickets, or an excellent strike rate while leaking plenty of runs along the way. Looking at all three together describes a bowler\'s style, not just a single "good or bad" number.'
        },
        {
          title: 'A single match or spell is a small, noisy sample',
          body: 'One big over or one unlucky spell can swing all three figures sharply. Career or season figures, built from many more balls bowled, are far more stable indicators of a bowler\'s real ability.'
        }
      ],
      references: [
        { label: 'Economy rate — definitional cricket statistic (runs conceded per over bowled)', url: 'https://en.wikipedia.org/wiki/Economy_rate' },
        { label: 'Strike rate (bowling) — definitional cricket statistic (balls bowled per wicket taken)', url: 'https://en.wikipedia.org/wiki/Strike_rate' },
        { label: 'Wide (cricket) and Bye (cricket) — rules on which extras are charged to the bowler', url: 'https://en.wikipedia.org/wiki/Wide_(cricket)' }
      ]
    },
    inputs: [
      { id: 'runsConceded', label: 'Runs conceded', type: 'number', placeholder: '196', defaultValue: 196, step: 1, min: 0 },
      { id: 'wicketsTaken', label: 'Wickets taken', type: 'number', placeholder: '8', defaultValue: 8, step: 1, min: 0 },
      { id: 'ballsBowled', label: 'Balls bowled', type: 'number', placeholder: '288', defaultValue: 288, step: 1, min: 1 }
    ],
    seo: {
      title: 'Cricket Bowling Figures Calculator – Average, Economy, SR',
      description: 'Calculate bowling average, economy rate and strike rate together from runs conceded, wickets taken and balls bowled.',
      faq: [
        { question: 'How do you calculate bowling average in cricket?', answer: 'Divide runs conceded by wickets taken: average = runs ÷ wickets. Conceding 196 runs for 8 wickets gives a bowling average of 24.50.' },
        { question: 'How do you calculate economy rate?', answer: 'Divide runs conceded by overs bowled: economy rate = runs ÷ overs. 196 runs off 48 overs is 196 ÷ 48 ≈ 4.08 runs per over.' },
        { question: 'How do you calculate bowling strike rate?', answer: 'Divide balls bowled by wickets taken: strike rate = balls ÷ wickets. 288 balls for 8 wickets is 288 ÷ 8 = 36.0 balls per wicket.' },
        { question: 'Why does this calculator ask for balls, not overs?', answer: 'Cricket writes overs as "9.3" meaning 9 overs and 3 balls, not a decimal 9.3 overs — entering total balls avoids that ambiguity. Convert with balls = overs × 6 + extra balls.' },
        { question: 'Do wides and no-balls count against a bowler\'s figures?', answer: 'Yes. Wides, no-balls and leg-byes all count as runs conceded by the bowler; byes are the only common extra that does not.' },
        { question: 'What happens if a bowler has taken no wickets?', answer: 'Bowling average and strike rate are both undefined with zero wickets, since each divides by wickets taken. Economy rate is still a valid figure with zero wickets.' }
      ]
    },
    compute(values) {
      const bowlingAverage = values.wicketsTaken > 0 ? values.runsConceded / values.wicketsTaken : NaN;
      const economyRate = values.ballsBowled > 0 ? values.runsConceded / (values.ballsBowled / 6) : NaN;
      const strikeRate = values.wicketsTaken > 0 ? values.ballsBowled / values.wicketsTaken : NaN;
      return { bowlingAverage, economyRate, strikeRate };
    }
  }
];
