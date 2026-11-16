import type { CalculatorConfig } from './types.ts';

// Conventional multipliers on a resting-rate estimate (calorie and TDEE calculators).
const ACTIVITY_OPTIONS = [
  { value: 1.2, label: 'Sedentary (little or no exercise)' },
  { value: 1.375, label: 'Lightly active (1–3 days a week)' },
  { value: 1.55, label: 'Moderately active (3–5 days a week)' },
  { value: 1.725, label: 'Very active (6–7 days a week)' },
  { value: 1.9, label: 'Extra active (hard daily training or physical job)' }
];

// Mifflin–St Jeor sex constant. 0 (male) is the default and what compute() used before step 37.
const SEX_OPTIONS = [
  { value: 0, label: 'Male' },
  { value: 1, label: 'Female' }
];

// ACE (American Council on Exercise) percent-body-fat categories. The five names are shared by
// both sexes; only the cutoff percentages (in compute()) differ. Step 61 batch 3.
const BODY_FAT_CATEGORY_LABELS = [
  { value: 0, label: 'Essential fat' },
  { value: 1, label: 'Athletes' },
  { value: 2, label: 'Fitness' },
  { value: 3, label: 'Acceptable' },
  { value: 4, label: 'Obesity category' }
];

export const healthCalculators: CalculatorConfig[] = [
  {
    id: 'bmi-calculator',
    group: 'Body & Nutrition',
    category: 'health',
    glyph: 'BMI',
    updatedAt: '2026-10-20',
    aliases: ['body mass index calculator', 'bmi calculator for men', 'bmi calculator for women', 'bmi chart calculator', 'healthy weight calculator'],
    related: ['calorie-calculator', 'tdee-calculator', 'pounds-to-kilograms-converter'],
    title: 'BMI Calculator',
    description: 'Work out your body mass index from your weight and height in pounds, kilograms or stone and inches, feet or centimeters. It also works backwards to find the weight for a target BMI, and shows where the result sits in the WHO adult categories.',
    example: 'Someone 5 ft 9 in (69 in) tall who weighs 170 lb has a BMI of 25.1, just over the line between healthy weight and overweight. At that height, a BMI of 18.5 to 24.9 is about 125 to 169 lb.',
    solver: {
      defaultTarget: 'bmi',
      variables: [
        { id: 'bmi', label: 'Body mass index', symbol: 'BMI', dimension: 'count', defaultValue: 25.1, defaultUnit: 'count' },
        { id: 'weight', label: 'Weight', symbol: 'm', dimension: 'mass', defaultValue: 170, defaultUnit: 'lb' },
        { id: 'height', label: 'Height', symbol: 'h', dimension: 'length', defaultValue: 69, defaultUnit: 'in' }
      ],
      // SI: kg and m, so BMI = kg ÷ m². Zero height or BMI has no answer.
      solve: {
        bmi: ({ weight, height }) => (height > 0 ? weight / (height * height) : NaN),
        weight: ({ bmi, height }) => bmi * height * height,
        height: ({ bmi, weight }) => (bmi > 0 && weight >= 0 ? Math.sqrt(weight / bmi) : NaN)
      },
      outputs: [
        { id: 'healthyLow', label: 'Healthy-weight range starts at (BMI 18.5)', dimension: 'mass', unit: 'lb', compute: (si) => 18.5 * si.height * si.height },
        { id: 'healthyHigh', label: 'Healthy-weight range ends at (BMI 24.9)', dimension: 'mass', unit: 'lb', compute: (si) => 24.9 * si.height * si.height }
      ],
      visuals: [
        {
          type: 'rangeBar',
          value: 'bmi',
          title: 'WHO adult BMI categories',
          bands: [
            { label: 'Underweight', min: 12, max: 18.5 },
            { label: 'Healthy weight', min: 18.5, max: 25 },
            { label: 'Overweight', min: 25, max: 30 },
            { label: 'Obesity class 1', min: 30, max: 35 },
            { label: 'Obesity class 2', min: 35, max: 40 },
            { label: 'Obesity class 3', min: 40, max: 50 }
          ]
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-20',
      concept: {
        title: 'What is body mass index?',
        paragraphs: [
          'Body mass index (BMI) is your weight divided by the square of your height. In metric units it is kilograms per square meter. It was devised in the nineteenth century by the Belgian statistician Adolphe Quetelet to describe populations, and today public health agencies use it as a quick, cheap screening number for adults: it takes a scale and a tape measure, nothing else.',
          'The World Health Organization and the CDC sort adult BMI into the same categories: under 18.5 is underweight, 18.5 to under 25 is a healthy weight, 25 to under 30 is overweight, and 30 or more is obesity, split into class 1 (30 to under 35), class 2 (35 to under 40) and class 3 (40 or more). Across large groups of people, higher BMI goes with higher rates of type 2 diabetes, high blood pressure and heart disease, which is why the cut-offs exist.',
          'BMI is a screening measure, not a diagnosis. It cannot tell muscle from fat, it says nothing about where fat is carried, and the same number means different things in different bodies. A muscular athlete can be "overweight" by BMI with little body fat, and an older adult who has lost muscle can be in the healthy range with a lot of it. Doctors use it alongside waist size, blood tests, blood pressure and history.',
          'The adult categories are for people aged 20 and over (WHO: 18 and over). Children and teens are assessed with BMI-for-age percentiles, because their healthy BMI changes as they grow. This calculator does not apply to them, or to pregnancy.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of BMI, weight and height. The third, marked auto, is calculated as you type.',
        steps: [
          { name: 'Find your BMI', text: 'Type your weight and height, and pick their units: pounds, kilograms or stone for weight, inches, feet or centimeters for height. The BMI is calculated.' },
          { name: 'Enter height in one unit', text: 'There is no combined feet-and-inches field yet. 5 ft 9 in is 69 in (5 × 12 + 9), or 5.75 ft, or 175.3 cm.' },
          { name: 'Find the weight for a target BMI', text: 'Type the BMI you want, for example 24.9, and your height, then leave weight alone. It becomes the auto field and shows the weight that gives that BMI.' },
          { name: 'Read the healthy range', text: 'Under the result you will see the weights that give a BMI of 18.5 and 24.9 at your height, the healthy-weight range used by NIH.' },
          { name: 'Check the bar', text: 'The bar shows where your BMI falls among the WHO adult categories.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'BMI is weight over height squared. Each of the three quantities has a direct rearrangement.',
        expression: 'BMI = m ÷ h²\nm = BMI × h²\nh = √(m ÷ BMI)\nImperial: BMI = 703.07 × lb ÷ in²',
        terms: [
          { symbol: 'BMI', meaning: 'Body mass index, in kg/m² (usually written without the unit).' },
          { symbol: 'm', meaning: 'Body weight (mass), in kilograms. 1 lb = 0.45359237 kg; 1 st = 14 lb.' },
          { symbol: 'h', meaning: 'Height, in meters. 1 in = 2.54 cm exactly.' },
          { symbol: '703.07', meaning: 'The factor that converts lb/in² to kg/m² (0.45359237 ÷ 0.0254²). Most charts round it to 703.' }
        ],
        note: 'Estimate only, not medical advice. BMI is a screening number for adults. It does not measure body fat or health, and a doctor should interpret it alongside other checks.'
      },
      workedExample: {
        intro: 'An adult is 5 ft 9 in tall and weighs 170 lb. What is their BMI, and what weight range counts as healthy at that height?',
        rows: [
          { label: 'Height (5 × 12 + 9 = 69 in, × 0.0254)', value: '1.7526 m' },
          { label: 'Weight (170 × 0.45359237)', value: '77.11 kg' },
          { label: 'Height squared (1.7526²)', value: '3.0716 m²' },
          { label: 'BMI (77.11 ÷ 3.0716)', value: '25.10' },
          { label: 'Weight at BMI 18.5 (18.5 × 3.0716)', value: '56.82 kg = 125.3 lb' },
          { label: 'Weight at BMI 24.9 (24.9 × 3.0716)', value: '76.48 kg = 168.6 lb' }
        ],
        result: 'BMI ≈ 25.1 (overweight category, just above 25) · healthy range at 5 ft 9 in ≈ 125–169 lb',
        explanation: 'The imperial shortcut gives the same answer: 170 × 703 ÷ 69² = 119,510 ÷ 4,761 = 25.10. A result this close to a cut-off says very little on its own. Losing less than a pound would move this person into the healthy-weight band without any real change in their health, which is a good reminder that the categories are lines drawn on a continuous scale.'
      },
      watchOut: [
        { title: 'BMI does not measure body fat', body: 'Muscle is denser than fat, so strength athletes often score as overweight, while people who have lost muscle can score as healthy. Waist circumference adds information BMI misses: NIH treats a waist of more than 40 in for men or 35 in for women (102 cm and 88 cm in the metric guidelines) as a sign of higher risk.' },
        { title: 'Adults only, and not in pregnancy', body: 'Children and teens need BMI-for-age percentiles from growth charts. In pregnancy, weight gain is judged against pre-pregnancy BMI, not the current reading.' },
        { title: 'Cut-offs differ by population', body: 'A WHO expert consultation found that many Asian populations have higher health risks at lower BMIs, and suggested extra action points at 23 and 27.5. Some countries use those lower thresholds.' },
        { title: 'Measure carefully', body: 'An inch of height changes BMI by roughly 0.7 points at average heights. Measure without shoes, and weigh yourself at the same time of day.' },
        { title: 'Estimate only, not medical advice', body: 'Use the number as a prompt for a conversation with a doctor, not as a verdict. Talk to a health professional before starting a diet or weight-loss plan.' }
      ],
      references: [
        { label: 'Centers for Disease Control and Prevention, Adult BMI Categories', url: 'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html' },
        { label: 'World Health Organization, Obesity and overweight (fact sheet)', url: 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight' },
        { label: 'National Heart, Lung, and Blood Institute (NIH), Calculate Your BMI', url: 'https://www.nhlbi.nih.gov/health/educational/lose_wt/BMI/bmicalc.htm' },
        { label: 'WHO Expert Consultation, Appropriate body-mass index for Asian populations, The Lancet 363 (2004): 157–163', url: 'https://pubmed.ncbi.nlm.nih.gov/14726171/' }
      ]
    },
    inputs: [
      { id: 'weight', label: 'Weight (lb)', type: 'number', placeholder: '170', defaultValue: 170, step: 1, min: 0 },
      { id: 'height', label: 'Height (in)', type: 'number', placeholder: '69', defaultValue: 69, step: 1, min: 0 }
    ],
    seo: {
      title: 'BMI Calculator – Body Mass Index with WHO Categories',
      description: 'Free BMI calculator for adults in lb, kg or stone and in, ft or cm. See your WHO category, your healthy-weight range, and the weight for any target BMI.',
      faq: [
        { question: 'How do I calculate BMI?', answer: 'Divide your weight in kilograms by your height in meters squared. Someone who weighs 70 kg and is 1.75 m tall has a BMI of 70 ÷ 1.75² = 70 ÷ 3.0625 = 22.9. In pounds and inches, multiply by 703: 170 lb at 69 in is 170 × 703 ÷ 4,761 = 25.1.' },
        { question: 'What is a healthy BMI?', answer: 'For adults, the WHO and CDC call 18.5 to under 25 a healthy weight. Under 18.5 is underweight, 25 to under 30 is overweight, and 30 or more is obesity.' },
        { question: 'What weight should I be for my height?', answer: 'A BMI of 18.5 to 24.9 corresponds to a range, not a single number. At 5 ft 9 in, that range is about 125 to 169 lb (57 to 76 kg). Type 24.9 as the BMI and your height to see the top of the range for you.' },
        { question: 'Is BMI accurate?', answer: 'It is accurate arithmetic but a rough health measure. It does not separate muscle from fat or show where fat is stored, so it can misclassify athletes and older adults. The CDC describes it as a screening tool to be considered with other factors.' },
        { question: 'Is BMI different for men and women?', answer: 'The formula and the adult categories are the same for both. At the same BMI, women tend to carry more body fat than men, which is one reason BMI is only a screening measure.' },
        { question: 'Can I use this BMI calculator for children?', answer: 'No. For ages 2 to 19, BMI is compared with sex-specific BMI-for-age growth charts and reported as a percentile. The adult cut-offs on this page do not apply.' },
        { question: 'Why do some countries use lower BMI cut-offs?', answer: 'A WHO expert consultation in 2004 found that many Asian populations face higher risks of type 2 diabetes and heart disease at lower BMIs than European populations, and proposed extra action points at 23 and 27.5. Several Asian countries use lower thresholds for overweight and obesity.' }
      ]
    },
    compute(values) {
      const bmi = values.weight / (values.height * values.height) * 703;
      return { bmi: bmi };
    }
  },
  {
    id: 'water-intake-calculator',
    group: 'Body & Nutrition',
    category: 'health',
    glyph: 'H₂O',
    updatedAt: '2026-10-20',
    aliases: ['daily water calculator', 'hydration calculator', 'how much water should i drink', 'water per day calculator', 'drinking water calculator'],
    related: ['calorie-calculator', 'tdee-calculator', 'bmi-calculator', 'gallons-to-liters-converter'],
    title: 'Water Intake Calculator',
    description: 'Get a rough daily drinking-water target from your body weight and exercise time, and compare it with the National Academies reference intakes for men and women.',
    example: 'A 150 lb person who exercises 30 minutes a day gets a target of about 87 fl oz (2.57 L, or about 11 glasses of 8 oz): 75 oz for body weight plus 12 oz for exercise.',
    breakdown: {
      headline: 'dailyOunces',
      headlineLabel: 'Water to drink per day',
      outputs: [
        { id: 'dailyOunces', label: 'Water to drink per day', format: 'number', dimension: 'volume', unit: 'floz', alsoIn: ['L', 'cup'] },
        { id: 'dailyLiters', label: 'In liters', format: 'number', dimension: 'volume', unit: 'L' },
        { id: 'glasses', label: '8-oz glasses, rounded', format: 'integer' },
        { id: 'exerciseOunces', label: 'Of which for exercise', format: 'number', dimension: 'volume', unit: 'floz' }
      ],
      derive: (values) => ({
        glasses: values.dailyOunces / 8,
        exerciseOunces: values.activityLevel * 0.4,
        // NASEM 2004: fluids from drinks behind the adequate intakes (men 3.0 L, women 2.2 L).
        referenceWomen: 2.2,
        referenceMen: 3.0
      }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'dailyLiters', label: 'Your estimate' },
          { from: 'referenceWomen', label: 'NASEM, women (from drinks)' },
          { from: 'referenceMen', label: 'NASEM, men (from drinks)' }
        ],
        title: 'Liters a day vs reference intakes'
      }
    },
    content: {
      lastReviewed: '2026-10-20',
      concept: {
        title: 'How much water do you need?',
        paragraphs: [
          'Water makes up more than half of an adult\'s body weight, and you lose some all the time through urine, sweat and breathing. Healthy kidneys balance the books from day to day, and thirst is the body\'s main signal to top up. For most healthy people, drinking when thirsty and with meals is enough.',
          'There is no single right amount. The US National Academies of Sciences, Engineering, and Medicine (NASEM) did not find enough evidence to set a requirement, so in 2004 it set "adequate intakes" from what healthy people actually consume: about 3.7 L of total water a day for adult men and 2.7 L for adult women. Food supplies roughly a fifth of that, which leaves about 3.0 L (13 cups) for men and 2.2 L (9 cups) for women from drinks, including plain water, milk, coffee and tea.',
          'This calculator uses a popular rule of thumb instead, because it scales with body size and exercise: half an ounce of water for every pound of body weight, plus 0.4 oz for every minute of exercise (12 oz per half hour). The rule is not from a clinical guideline, so the chart puts your result next to the NASEM figures for comparison.',
          'Needs go up in hot or humid weather, at altitude, with fever, vomiting or diarrhea, and during pregnancy and breastfeeding. Some medical conditions, such as heart failure and kidney disease, call for less fluid, not more.'
        ]
      },
      howTo: {
        intro: 'Fill in the two fields. The results update as you type.',
        steps: [
          { name: 'Enter your weight', text: 'Type your weight and pick lb, kg or st from the menu.' },
          { name: 'Enter your exercise time', text: 'Type the minutes of exercise in a typical day, or switch the menu to hours. Use 0 on rest days.' },
          { name: 'Read the target', text: 'The headline shows the daily amount in fluid ounces, with liters and US cups beside it, and the rows break out glasses and the exercise share.' },
          { name: 'Compare with the reference intakes', text: 'The bars set your estimate against the NASEM adequate intakes from drinks for women and men.' },
          { name: 'Let thirst and urine guide you', text: 'Pale yellow urine and rarely feeling thirsty are signs you are drinking enough. Adjust the target for heat and heavy sweating.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The estimate adds a body-weight part and an exercise part.',
        expression: 'Water (fl oz) = 0.5 × weight (lb) + 0.4 × exercise (min)\nLiters = fl oz × 0.0295735\nGlasses = fl oz ÷ 8',
        terms: [
          { symbol: 'weight', meaning: 'Body weight in pounds (1 kg = 2.2046 lb).' },
          { symbol: 'exercise', meaning: 'Minutes of exercise per day. 30 minutes adds 12 fl oz.' },
          { symbol: '0.0295735', meaning: 'Liters in one US fluid ounce.' },
          { symbol: 'glass', meaning: 'One US cup, 8 fl oz (about 237 mL).' }
        ],
        note: 'Estimate only, not medical advice. This is a rule of thumb, not a clinical recommendation. If you have kidney, heart or liver disease, or a doctor has limited your fluids, follow their advice instead.'
      },
      workedExample: {
        intro: 'Someone weighs 150 lb and exercises for 30 minutes most days. How much should they aim to drink?',
        rows: [
          { label: 'Body-weight part (150 × 0.5)', value: '75 fl oz' },
          { label: 'Exercise part (30 × 0.4)', value: '12 fl oz' },
          { label: 'Total (75 + 12)', value: '87 fl oz' },
          { label: 'In liters (87 × 0.0295735)', value: '2.57 L' },
          { label: 'In 8-oz glasses (87 ÷ 8)', value: '10.9 ≈ 11' }
        ],
        result: 'About 87 fl oz (2.57 L, about 11 glasses) a day',
        explanation: 'That sits between the NASEM adequate intakes from drinks: 2.2 L for women and 3.0 L for men. On a day without exercise the estimate drops to 75 fl oz (2.22 L). Remember that food, especially fruit, vegetables and soups, also provides water.'
      },
      watchOut: [
        { title: 'It is a rule of thumb', body: 'The half-ounce-per-pound rule is a convenient starting point with no clinical trial behind it. The NASEM adequate intakes are based on what healthy people drink, and most people who drink to thirst meet them.' },
        { title: 'More is not always better', body: 'Drinking far more than you lose, especially during long endurance events, can dilute the sodium in your blood (hyponatremia), which can be dangerous. The American College of Sports Medicine advises against drinking so much during exercise that you gain weight.' },
        { title: 'Exercise needs vary widely', body: 'Sweat losses depend on intensity, heat, clothing and the person. Weighing yourself before and after a workout shows how much you lost: each pound lost is about 15 fl oz (450 mL) of fluid.' },
        { title: 'Some people need less', body: 'People with heart failure, kidney disease or some liver conditions may be told to limit fluids. Older adults may feel thirst less, so they may need to drink on a schedule.' },
        { title: 'Estimate only, not medical advice', body: 'Ask a doctor about fluid needs during pregnancy, breastfeeding, illness, or if you take diuretics or other medicines that affect fluid balance.' }
      ],
      references: [
        { label: 'National Academies of Sciences, Engineering, and Medicine, Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate (2005)', url: 'https://www.nationalacademies.org/publications/10925' },
        { label: 'Sawka MN, et al., American College of Sports Medicine position stand: Exercise and fluid replacement, Medicine & Science in Sports & Exercise 39 (2007): 377–390', url: 'https://pubmed.ncbi.nlm.nih.gov/17277604/' },
        { label: 'Centers for Disease Control and Prevention, About Water and Healthier Drinks', url: 'https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html' }
      ]
    },
    inputs: [
      { id: 'weight', label: 'Weight', type: 'number', placeholder: '150', defaultValue: 150, step: 1, min: 0, dimension: 'mass', unit: 'lb' },
      { id: 'activityLevel', label: 'Exercise per day', type: 'number', placeholder: '30', defaultValue: 30, step: 5, min: 0, dimension: 'time', unit: 'min' }
    ],
    seo: {
      title: 'Water Intake Calculator – How Much Water to Drink a Day',
      description: 'Estimate how much water to drink each day from your weight and exercise time, in ounces, liters and glasses, compared with National Academies reference intakes.',
      faq: [
        { question: 'How much water should I drink a day?', answer: 'The National Academies set adequate intakes of about 3.7 L (125 fl oz) of total water a day for men and 2.7 L (91 fl oz) for women, counting water from food. From drinks alone, that is about 3.0 L (13 cups) for men and 2.2 L (9 cups) for women. Most healthy people meet it by drinking when thirsty.' },
        { question: 'How is the estimate on this page worked out?', answer: 'Half an ounce per pound of body weight plus 0.4 oz per minute of exercise. A 150 lb person who exercises 30 minutes gets 75 + 12 = 87 fl oz, or 2.57 L. A 200 lb person with the same exercise gets 112 fl oz, or 3.31 L.' },
        { question: 'Is eight glasses a day enough?', answer: 'Eight 8-oz glasses is 64 fl oz, about 1.9 L. That is below the National Academies figures for drinks (2.2 L for women and 3.0 L for men), but food and other drinks add to it, so many people get enough without counting.' },
        { question: 'Do coffee and tea count?', answer: 'Yes. The National Academies counts all beverages, caffeinated ones included, toward total water. Moderate caffeine does not cause a net loss of fluid over the day.' },
        { question: 'Can you drink too much water?', answer: 'Yes. Drinking much more than you lose, for example during a marathon, can lower blood sodium to dangerous levels (hyponatremia). Drink to replace what you sweat, not far beyond it.' },
        { question: 'How do I know if I am drinking enough?', answer: 'Rarely feeling thirsty and passing pale yellow urine are good everyday signs. Dark urine, headache and tiredness can mean you need more, but see a doctor if symptoms persist.' }
      ]
    },
    compute(values) {
      const baseOunces = values.weight * 0.5;
      const exerciseAdd = values.activityLevel * 0.4;
      const totalOunces = baseOunces + exerciseAdd;
      const liters = totalOunces * 0.0295735;
      return { dailyOunces: totalOunces, dailyLiters: liters };
    }
  },
  {
    id: 'calorie-calculator',
    group: 'Body & Nutrition',
    category: 'health',
    glyph: 'kcal',
    updatedAt: '2026-10-20',
    aliases: ['calories calculator', 'daily calorie needs calculator', 'calorie intake calculator', 'weight loss calorie calculator', 'how many calories should i eat'],
    related: ['tdee-calculator', 'bmi-calculator', 'running-pace-calculator'],
    title: 'Calorie Calculator',
    description: 'Estimate how many calories a day you burn, and a starting intake for losing, keeping or gaining weight, from your sex, age, height, weight and activity level with the Mifflin–St Jeor equation.',
    example: 'A 30-year-old man, 5 ft 9 in and 170 lb, who is moderately active burns about 2,668 kcal a day. Eating about 2,168 kcal a day is a 500-calorie daily deficit; about 3,168 kcal a day is a 500-calorie surplus.',
    breakdown: {
      headline: 'maintenanceCalories',
      headlineLabel: 'Calories to maintain your weight',
      outputs: [
        { id: 'maintenanceCalories', label: 'Calories to maintain your weight', format: 'integer', dimension: 'energy', unit: 'kcal', alsoIn: ['kJ'] },
        { id: 'weightLossCalories', label: 'To lose weight (500 kcal a day below)', format: 'integer', dimension: 'energy', unit: 'kcal' },
        { id: 'weightGainCalories', label: 'To gain weight (500 kcal a day above)', format: 'integer', dimension: 'energy', unit: 'kcal' },
        { id: 'bmr', label: 'Resting metabolic rate (Mifflin–St Jeor)', format: 'integer', dimension: 'energy', unit: 'kcal' }
      ],
      groups: [
        { title: 'About you', inputs: ['sex', 'age', 'weight', 'height'] },
        { title: 'How active you are', inputs: ['activityFactor'] }
      ],
      derive: (values) => ({ bmr: values.maintenanceCalories / values.activityFactor }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'weightLossCalories', label: 'Lose' },
          { from: 'maintenanceCalories', label: 'Maintain' },
          { from: 'weightGainCalories', label: 'Gain' }
        ],
        title: 'Calories a day, by goal',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-10-20',
      concept: {
        title: 'How many calories do you need?',
        paragraphs: [
          'Your body uses energy all day: to keep your heart, brain, lungs and other organs running, to digest food, and to move. Nutrition labels count that energy in kilocalories, written "calories" or "kcal" (1 kcal = 4.184 kJ). When you eat about as much as you burn, your weight stays roughly steady. Eating less over weeks and months tends to lower it, and eating more tends to raise it.',
          'Nobody can measure their daily burn at home, so calculators estimate it in two steps. First, a prediction equation estimates the resting metabolic rate: the energy you would use lying still for a day. This page uses the Mifflin–St Jeor equation, published in 1990 from measurements of 498 healthy adults. A 2005 systematic review for the American Dietetic Association found it the most reliable of the common equations, landing within 10% of measured resting rate for more people than the others, but still missing by more than that for some.',
          'Second, the resting rate is multiplied by an activity factor to cover everything else you do in a day. The result is your estimated maintenance intake. The loss and gain figures are simply 500 kcal a day below and above it, a common starting point that dietitians then adjust to how your weight actually responds.',
          'Treat every figure here as a first guess. Two people with the same age, height and weight can differ by a few hundred calories a day, and the only way to find your own number is to track your intake and weight for a few weeks.'
        ]
      },
      howTo: {
        intro: 'Fill in the five fields. The results update as you type.',
        steps: [
          { name: 'Choose your sex', text: 'The equation has one constant for men and one for women, 166 kcal apart, because of average differences in body composition.' },
          { name: 'Enter age, weight and height', text: 'Pick units from the menus beside weight (lb, kg or st) and height (in, ft or cm). 5 ft 9 in is 69 in.' },
          { name: 'Pick an activity level', text: 'Choose the description closest to a typical week, counting both exercise and how much you move at work. If unsure, pick the lower one: most people overestimate their activity.' },
          { name: 'Read the targets', text: 'The headline is the estimated intake to maintain your weight. Below it are the 500-kcal deficit and surplus, and your resting rate.' },
          { name: 'Adjust with real data', text: 'Eat close to your chosen target for two to four weeks while weighing yourself regularly, then raise or lower the target according to what the scale does.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The Mifflin–St Jeor equation estimates resting energy expenditure from weight, height and age. Multiplying by an activity factor gives daily needs.',
        expression: 'BMR = 10 × kg + 6.25 × cm − 5 × age + s\nMaintain = BMR × activity factor\nLose = Maintain − 500\nGain = Maintain + 500',
        terms: [
          { symbol: 'BMR', meaning: 'Estimated resting (basal) metabolic rate, in kcal per day.' },
          { symbol: 'kg, cm', meaning: 'Body weight in kilograms and height in centimeters (1 lb = 0.4536 kg, 1 in = 2.54 cm).' },
          { symbol: 'age', meaning: 'Age in whole years.' },
          { symbol: 's', meaning: '+5 for men, −161 for women.' },
          { symbol: 'activity factor', meaning: '1.2 sedentary, 1.375 lightly active, 1.55 moderately active, 1.725 very active, 1.9 extra active. A common convention, not part of the 1990 paper.' }
        ],
        note: 'Estimate only, not medical advice. Prediction equations can be off by 10% or more for an individual. If you are pregnant, breastfeeding, under 18, have a medical condition or want to lose a lot of weight, ask a doctor or registered dietitian for a target.'
      },
      workedExample: {
        intro: 'A 30-year-old man is 5 ft 9 in tall, weighs 170 lb and is moderately active (exercise three to five days a week). How many calories does he need?',
        rows: [
          { label: 'Weight (170 × 0.4536)', value: '77.11 kg' },
          { label: 'Height (69 × 2.54)', value: '175.26 cm' },
          { label: 'BMR (771.1 + 1,095.4 − 150 + 5)', value: '1,721 kcal/day' },
          { label: 'Maintain (1,721.5 × 1.55)', value: '2,668 kcal/day' },
          { label: 'Lose (2,668 − 500)', value: '2,168 kcal/day' },
          { label: 'Gain (2,668 + 500)', value: '3,168 kcal/day' }
        ],
        result: 'About 2,668 kcal a day to maintain · 2,168 to lose · 3,168 to gain',
        explanation: 'The four terms of the equation are 10 × 77.11 = 771.1, 6.25 × 175.26 = 1,095.4, 5 × 30 = 150, and the male constant +5. For a woman with the same age, height, weight and activity, the constant is −161 instead, so her resting rate is 1,555 kcal and her maintenance estimate about 2,411 kcal a day.'
      },
      watchOut: [
        { title: 'The 500-calorie rule overpromises', body: 'The old idea that 3,500 kcal equals one pound, so a 500 kcal daily deficit loses a pound a week forever, ignores the fact that you burn less as you get lighter. NIH researchers found weight loss slows over time and recommend dynamic models, such as the NIDDK Body Weight Planner, for longer plans.' },
        { title: 'Activity factors are rough', body: 'They are broad bands, and people tend to pick one too high. The FAO/WHO/UNU expert report puts sedentary or lightly active lifestyles at 1.40 to 1.69 times resting rate, so the 1.2 "sedentary" factor here is deliberately conservative.' },
        { title: 'Not for everyone', body: 'The equation was built from healthy, non-pregnant adults. It is less reliable for very muscular people, older adults, people with obesity and some ethnic groups, and it does not apply in pregnancy, breastfeeding or illness.' },
        { title: 'Do not go too low', body: 'Very low-calorie diets can cause muscle loss, nutrient shortfalls and gallstones, and should only be followed under medical supervision. A deficit that leaves you exhausted or hungry all the time is too big.' },
        { title: 'Estimate only, not medical advice', body: 'Use these figures as a starting point, then adjust to how your weight and energy respond, ideally with help from a registered dietitian or doctor.' }
      ],
      references: [
        { label: 'Mifflin MD, St Jeor ST, et al., A new predictive equation for resting energy expenditure in healthy individuals, American Journal of Clinical Nutrition 51 (1990): 241–247', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
        { label: 'Frankenfield D, Roth-Yousey L, Compher C, Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults: a systematic review, J Am Diet Assoc 105 (2005): 775–789', url: 'https://pubmed.ncbi.nlm.nih.gov/15883556/' },
        { label: 'Hall KD, et al., Quantification of the effect of energy imbalance on bodyweight, The Lancet 378 (2011): 826–837', url: 'https://pubmed.ncbi.nlm.nih.gov/21872751/' },
        { label: 'FAO/WHO/UNU, Human energy requirements (2004), chapter 5: physical activity levels', url: 'https://www.fao.org/4/y5686e/y5686e07.htm' }
      ]
    },
    inputs: [
      { id: 'weight', label: 'Weight', type: 'number', placeholder: '170', defaultValue: 170, step: 1, min: 0, dimension: 'mass', unit: 'lb' },
      { id: 'height', label: 'Height', type: 'number', placeholder: '69', defaultValue: 69, step: 1, min: 0, dimension: 'length', unit: 'in' },
      { id: 'age', label: 'Age (years)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'activityFactor', label: 'Activity level', type: 'number', placeholder: '1.55', defaultValue: 1.55, step: 0.025, min: 1, options: ACTIVITY_OPTIONS },
      { id: 'sex', label: 'Sex', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: SEX_OPTIONS }
    ],
    seo: {
      title: 'Calorie Calculator – Daily Calories to Lose or Gain Weight',
      description: 'Estimate your daily calorie needs with the Mifflin–St Jeor equation, plus starting targets to lose or gain weight. Works in lb, kg or stone and in or cm.',
      faq: [
        { question: 'How many calories should I eat a day?', answer: 'It depends on your size, age, sex and activity. A moderately active 30-year-old man who is 5 ft 9 in and 170 lb needs about 2,668 kcal a day to stay the same weight; a woman of the same size and activity needs about 2,411. Use those as starting points and adjust to how your weight changes.' },
        { question: 'How are daily calories calculated?', answer: 'This calculator estimates your resting metabolic rate with the Mifflin–St Jeor equation (10 × kg + 6.25 × cm − 5 × age, plus 5 for men or minus 161 for women), then multiplies it by an activity factor between 1.2 and 1.9.' },
        { question: 'What activity level should I choose?', answer: 'Sedentary (1.2) means little or no exercise; lightly active (1.375) one to three days a week; moderately active (1.55) three to five days; very active (1.725) six or seven days; extra active (1.9) hard daily training or a physical job. When in doubt, choose the lower level.' },
        { question: 'Will a 500-calorie deficit lose a pound a week?', answer: 'At first it may come close, but not for long. As you lose weight you burn less, so the same intake gives a shrinking deficit. NIH research by Hall and colleagues replaced the 3,500-calories-per-pound rule with models that show weight loss slowing over time.' },
        { question: 'How accurate is the Mifflin–St Jeor equation?', answer: 'It is the most reliable of the common equations for healthy adults, but a 2005 systematic review found it still missed measured resting rate by more than 10% for a sizable minority of people. Measured intake and weight over a few weeks are a better guide than any formula.' },
        { question: 'Why does the calculator ask for my sex?', answer: 'Men on average carry more muscle than women of the same height and weight, so they burn more at rest. The equation accounts for that with a constant: +5 for men and −161 for women.' }
      ]
    },
    compute(values) {
      const weightKg = values.weight * 0.453592;
      const heightCm = values.height * 2.54;
      // Mifflin–St Jeor sex constant: sex 1 = female (−161); anything else = male (+5).
      const sexConstant = values.sex === 1 ? -161 : 5;
      const bmr = 10 * weightKg + 6.25 * heightCm - 5 * values.age + sexConstant;
      const maintenanceCalories = bmr * values.activityFactor;
      const weightLossCalories = maintenanceCalories - 500;
      const weightGainCalories = maintenanceCalories + 500;
      return { maintenanceCalories, weightLossCalories, weightGainCalories };
    }
  },
  {
    id: 'tdee-calculator',
    group: 'Body & Nutrition',
    category: 'health',
    glyph: 'TDEE',
    updatedAt: '2026-10-20',
    aliases: ['total daily energy expenditure calculator', 'maintenance calories calculator', 'tdee and bmr calculator', 'bmr calculator', 'basal metabolic rate calculator'],
    related: ['calorie-calculator', 'bmi-calculator', 'running-pace-calculator'],
    redirectFrom: ['bmr-calculator'],
    title: 'TDEE Calculator',
    description: 'Estimate your total daily energy expenditure (TDEE) and basal metabolic rate (BMR) with the Mifflin–St Jeor equation, and see how much of your daily burn comes from resting versus activity.',
    example: 'A 25-year-old man, 5 ft 6 in and 155 lb, who is lightly active has a BMR of about 1,631 kcal and a TDEE of about 2,242 kcal a day: 1,631 at rest plus about 612 from activity.',
    breakdown: {
      headline: 'tdee',
      headlineLabel: 'Total daily energy expenditure (TDEE)',
      outputs: [
        { id: 'tdee', label: 'Total daily energy expenditure (TDEE)', format: 'integer', dimension: 'energy', unit: 'kcal', alsoIn: ['kJ'] },
        { id: 'bmr', label: 'Basal metabolic rate (BMR)', format: 'integer', dimension: 'energy', unit: 'kcal' },
        { id: 'activityCalories', label: 'Burned through activity (TDEE − BMR)', format: 'integer', dimension: 'energy', unit: 'kcal' },
        { id: 'cuttingCalories', label: 'Cutting target (500 kcal a day below)', format: 'integer', dimension: 'energy', unit: 'kcal' },
        { id: 'bulkingCalories', label: 'Lean bulking target (300 kcal a day above)', format: 'integer', dimension: 'energy', unit: 'kcal' }
      ],
      groups: [
        { title: 'About you', inputs: ['sex', 'age', 'weight', 'height'] },
        { title: 'How active you are', inputs: ['activityFactor'] }
      ],
      derive: (values) => ({ activityCalories: values.tdee - values.bmr }),
      visual: {
        type: 'donut',
        segments: [
          { from: 'bmr', label: 'At rest (BMR)' },
          { from: 'activityCalories', label: 'Activity and digestion' }
        ],
        center: 'tdee',
        centerSub: 'TDEE per day'
      }
    },
    content: {
      lastReviewed: '2026-10-20',
      concept: {
        title: 'What are TDEE and BMR?',
        paragraphs: [
          'Total daily energy expenditure (TDEE) is the energy your body uses in a full day, counted in kilocalories (kcal). It has three parts. The basal or resting metabolic rate (BMR) is what your organs use to keep you alive at rest. The thermic effect of food is the energy spent digesting and storing what you eat. Activity covers everything from planned exercise to walking around, standing and fidgeting. For most people the resting part is the largest of the three.',
          'Measuring BMR properly takes a laboratory: you lie still after an overnight fast while a device measures the oxygen you use and the carbon dioxide you breathe out. Prediction equations estimate it from easier numbers instead. This calculator uses the Mifflin–St Jeor equation from 1990, which a 2005 systematic review judged the most reliable of the common equations for healthy adults.',
          'TDEE is then estimated by multiplying BMR by an activity factor, from 1.2 for a mostly seated day to 1.9 for hard daily training or heavy physical work. The factor folds the energy cost of digestion and of all movement into one number, which is why the chart shows them together.',
          'TDEE is the number to plan around: eating about your TDEE keeps weight roughly steady, eating below it creates a deficit, and eating above it a surplus. Because both steps are estimates, your real TDEE may differ by a few hundred kcal a day.'
        ]
      },
      howTo: {
        intro: 'Fill in the five fields. Every figure updates as you type.',
        steps: [
          { name: 'Choose your sex and enter your age', text: 'The equation uses a different constant for men and women, and BMR falls by 5 kcal a day for every year of age.' },
          { name: 'Enter weight and height', text: 'Use the unit menus: lb, kg or st for weight; in, ft or cm for height.' },
          { name: 'Pick an activity level', text: 'Count every kind of movement in a typical week, not just workouts. If you are between two levels, choose the lower one.' },
          { name: 'Read TDEE and BMR', text: 'The headline is your TDEE. Below it are your BMR, the calories that come from activity, and cutting and lean-bulking targets.' },
          { name: 'Check the ring', text: 'The chart splits your TDEE into the resting part and the activity part.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'BMR comes from the Mifflin–St Jeor equation. TDEE is BMR times an activity factor.',
        expression: 'BMR = 10 × kg + 6.25 × cm − 5 × age + s\nTDEE = BMR × activity factor\nActivity = TDEE − BMR\nCut = TDEE − 500 · Bulk = TDEE + 300',
        terms: [
          { symbol: 'BMR', meaning: 'Basal (resting) metabolic rate, kcal per day.' },
          { symbol: 'kg, cm', meaning: 'Weight in kilograms, height in centimeters (1 lb = 0.4536 kg, 1 in = 2.54 cm).' },
          { symbol: 's', meaning: 'Sex constant: +5 for men, −161 for women.' },
          { symbol: 'activity factor', meaning: '1.2 sedentary, 1.375 lightly active, 1.55 moderately active, 1.725 very active, 1.9 extra active (a common convention).' },
          { symbol: 'TDEE', meaning: 'Total daily energy expenditure, kcal per day.' }
        ],
        note: 'Estimate only, not medical advice. Both the equation and the activity factor can be off by 10% or more for an individual. For a medical diet, pregnancy, breastfeeding or anyone under 18, ask a doctor or registered dietitian.'
      },
      workedExample: {
        intro: 'A 25-year-old man is 5 ft 6 in tall, weighs 155 lb and is lightly active (exercise one to three days a week). What are his BMR and TDEE?',
        rows: [
          { label: 'Weight (155 × 0.4536)', value: '70.31 kg' },
          { label: 'Height (66 × 2.54)', value: '167.64 cm' },
          { label: 'BMR (703.1 + 1,047.8 − 125 + 5)', value: '1,631 kcal/day' },
          { label: 'TDEE (1,630.8 × 1.375)', value: '2,242 kcal/day' },
          { label: 'From activity (2,242.4 − 1,630.8)', value: '612 kcal/day' },
          { label: 'Cut (2,242 − 500) · Bulk (2,242 + 300)', value: '1,742 · 2,542 kcal/day' }
        ],
        result: 'BMR ≈ 1,631 kcal · TDEE ≈ 2,242 kcal a day',
        explanation: 'About 73% of this TDEE is the resting rate (1,631 ÷ 2,242) and 27% comes from activity and digestion. A woman with the same age, height, weight and activity would use the −161 constant instead of +5: her BMR would be about 1,465 kcal and her TDEE about 2,014 kcal a day.'
      },
      watchOut: [
        { title: 'BMR is not a minimum to eat', body: 'Your BMR is what you burn lying still all day. It is not a safe floor for intake, and it is not a target. Plans that go much below TDEE should be supervised by a doctor or dietitian.' },
        { title: 'Activity factors are broad', body: 'A "lightly active" office worker and a "lightly active" nurse can burn very different amounts. If your weight changes when you eat at your estimated TDEE, your real TDEE is different: adjust it by the trend.' },
        { title: 'TDEE changes as you do', body: 'Losing weight lowers both BMR and the energy cost of moving, so a deficit shrinks over time. Recalculate after every few kilograms (or about 10 lb) of change.' },
        { title: 'Who the equation fits', body: 'Mifflin–St Jeor was built from healthy adults aged 19 to 78. It is less reliable for athletes with a lot of muscle, for people with obesity, older adults, some ethnic groups, and during pregnancy, breastfeeding or illness.' },
        { title: 'Estimate only, not medical advice', body: 'Treat TDEE as a starting estimate to test against real results, not as a measurement.' }
      ],
      references: [
        { label: 'Mifflin MD, St Jeor ST, et al., A new predictive equation for resting energy expenditure in healthy individuals, American Journal of Clinical Nutrition 51 (1990): 241–247', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
        { label: 'Frankenfield D, Roth-Yousey L, Compher C, Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults: a systematic review, J Am Diet Assoc 105 (2005): 775–789', url: 'https://pubmed.ncbi.nlm.nih.gov/15883556/' },
        { label: 'Hall KD, Heymsfield SB, et al., Energy balance and its components: implications for body weight regulation, American Journal of Clinical Nutrition 95 (2012)', url: 'https://doi.org/10.3945/ajcn.112.036350' },
        { label: 'FAO/WHO/UNU, Human energy requirements (2004), chapter 5: physical activity levels', url: 'https://www.fao.org/4/y5686e/y5686e07.htm' }
      ]
    },
    inputs: [
      { id: 'weight', label: 'Weight', type: 'number', placeholder: '155', defaultValue: 155, step: 1, min: 0, dimension: 'mass', unit: 'lb' },
      { id: 'height', label: 'Height', type: 'number', placeholder: '66', defaultValue: 66, step: 1, min: 0, dimension: 'length', unit: 'in' },
      { id: 'age', label: 'Age (years)', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 1 },
      { id: 'activityFactor', label: 'Activity level', type: 'number', placeholder: '1.375', defaultValue: 1.375, step: 0.025, min: 1, options: ACTIVITY_OPTIONS },
      { id: 'sex', label: 'Sex', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: SEX_OPTIONS }
    ],
    seo: {
      title: 'TDEE Calculator – Total Daily Energy Expenditure and BMR',
      description: 'Estimate your TDEE and BMR with the Mifflin–St Jeor equation, see how much of your daily burn is resting vs activity, and get cutting and bulking targets.',
      faq: [
        { question: 'What is TDEE?', answer: 'Total daily energy expenditure: every calorie your body uses in a day, from keeping your organs running to digesting food and moving. Eating about your TDEE keeps your weight roughly steady.' },
        { question: 'How is TDEE different from BMR?', answer: 'BMR is the energy you would burn lying at rest all day. TDEE adds digestion and all your movement on top. A lightly active 25-year-old man at 5 ft 6 in and 155 lb has a BMR of about 1,631 kcal and a TDEE of about 2,242 kcal.' },
        { question: 'How do I calculate my BMR?', answer: 'With the Mifflin–St Jeor equation: 10 × weight in kg + 6.25 × height in cm − 5 × age, then add 5 for men or subtract 161 for women. 70.31 kg, 167.64 cm and 25 years gives 703.1 + 1,047.8 − 125 + 5 ≈ 1,631 kcal a day for a man.' },
        { question: 'How accurate is a TDEE calculator?', answer: 'It is an educated estimate. The BMR equation alone can miss by more than 10% for some people, and activity factors add more uncertainty. Eat at the estimate for two to four weeks and adjust by how your weight moves.' },
        { question: 'How many calories should I eat to cut or bulk?', answer: 'A common starting point is about 500 kcal a day below TDEE to lose fat and about 300 kcal above it for a slow, lean gain. For the example above, that is about 1,742 and 2,542 kcal a day.' },
        { question: 'Does age change TDEE?', answer: 'In the equation, every year of age lowers BMR by 5 kcal a day, so ten years is 50 kcal less at rest before the activity factor. Real changes with age also depend on muscle mass and how active you stay.' }
      ]
    },
    compute(values) {
      const weightKg = values.weight * 0.453592;
      const heightCm = values.height * 2.54;
      // Mifflin–St Jeor sex constant: sex 1 = female (−161); anything else = male (+5).
      const sexConstant = values.sex === 1 ? -161 : 5;
      const bmr = 10 * weightKg + 6.25 * heightCm - 5 * values.age + sexConstant;
      const tdee = bmr * values.activityFactor;
      const cuttingCalories = tdee - 500;
      const bulkingCalories = tdee + 300;
      return { tdee, bmr, cuttingCalories, bulkingCalories };
    }
  },
  {
    id: 'running-pace-calculator',
    group: 'Fitness Performance',
    category: 'health',
    glyph: 'pace',
    updatedAt: '2026-10-20',
    aliases: ['pace per mile calculator', 'marathon pace calculator', 'race time calculator', 'min per km calculator', 'race time predictor'],
    related: ['calorie-calculator', 'miles-to-kilometers-converter', 'tdee-calculator', 'sleep-time-calculator'],
    title: 'Running Pace Calculator',
    description: 'Work out your running pace from a distance and time, your finish time from a pace, or how far a pace takes you, in miles or kilometers, with race-time predictions for the 5K to the marathon.',
    example: 'A 5K in 25 minutes is a pace of 5:00 per km or about 8:03 per mile (12 km/h). The Riegel formula predicts about 52:07 for a 10K and 3:59:47 for a marathon from that result.',
    solver: {
      defaultTarget: 'pace',
      variables: [
        { id: 'pace', label: 'Pace', symbol: 'p', dimension: 'pace', defaultValue: 8.04672, defaultUnit: 'min/mi' },
        { id: 'distance', label: 'Distance', symbol: 'd', dimension: 'length', defaultValue: 5, defaultUnit: 'km' },
        { id: 'time', label: 'Time', symbol: 't', dimension: 'time', defaultValue: 25, defaultUnit: 'min' }
      ],
      // SI: s/m, m and s, so time = distance × pace.
      solve: {
        pace: ({ distance, time }) => (distance > 0 ? time / distance : NaN),
        time: ({ distance, pace }) => distance * pace,
        distance: ({ time, pace }) => (pace > 0 ? time / pace : NaN)
      },
      outputs: [
        { id: 'speed', label: 'Speed', dimension: 'speed', unit: 'mph', compute: (si) => (si.time > 0 ? si.distance / si.time : NaN) },
        { id: 'marathonEven', label: 'Marathon at this pace (even pace)', dimension: 'time', unit: 'min', compute: (si) => 42195 * si.pace }
      ],
      // Riegel (1981): T2 = T1 × (D2 ÷ D1)^1.06, in minutes for the chart.
      derive: (si) => {
        const riegel = (meters: number) => (si.distance > 0 ? (si.time * (meters / si.distance) ** 1.06) / 60 : NaN);
        return { riegel5k: riegel(5000), riegel10k: riegel(10000), riegelHalf: riegel(21097.5), riegelMarathon: riegel(42195) };
      },
      visuals: [
        {
          type: 'compareBars',
          bars: [
            { from: 'riegel5k', label: '5K' },
            { from: 'riegel10k', label: '10K' },
            { from: 'riegelHalf', label: 'Half marathon' },
            { from: 'riegelMarathon', label: 'Marathon' }
          ],
          title: 'Predicted race times, minutes (Riegel)'
        }
      ]
    },
    content: {
      lastReviewed: '2026-10-20',
      concept: {
        title: 'What is running pace?',
        paragraphs: [
          'Pace is the time it takes to cover a unit of distance, such as 8 minutes per mile or 5 minutes per kilometer. It is speed turned upside down: speed says how far you go in an hour, pace says how long each mile or kilometer takes. Runners prefer pace because it maps straight onto a watch and onto mile or kilometer markers along a course.',
          'Pace, distance and time are tied together by one relation: time equals distance times pace. Know any two and you know the third. That is all a pace calculator does, but it saves the awkward arithmetic of mixing minutes, seconds, miles and kilometers. A 5K is 5 km, or about 3.107 miles; a 10K is 10 km; a half marathon is 21.0975 km (13.11 miles) and a marathon 42.195 km (26.22 miles).',
          'Predicting a race you have not run is a different question. You cannot hold your 5K pace for a marathon, because pace slows as distance grows. In 1981 the engineer Peter Riegel fitted world records across distances and found that time rises roughly with distance to the power 1.06. The chart uses his formula to turn your current result into predicted times for the standard road distances.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of pace, distance and time. The third, marked auto, is calculated as you type.',
        steps: [
          { name: 'Find your pace', text: 'Type the distance and your time, choosing km or mi and min, h or s from the menus. The pace is calculated.' },
          { name: 'Find a finish time', text: 'Type a target pace and the race distance, then leave time alone. It becomes the auto field.' },
          { name: 'Find a distance', text: 'Type a pace and how long you will run. The distance is calculated.' },
          { name: 'Read decimal minutes', text: 'Pace and time show as decimal minutes for now: 8.05 min/mi is 8 minutes 3 seconds (0.05 × 60 = 3), and 115.5 min is 1 hour 55 minutes 30 seconds.' },
          { name: 'Check the predictions', text: 'The bars show Riegel predictions for the 5K, 10K, half marathon and marathon from the distance and time you entered.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Pace, distance and time are one equation. The race predictions use Riegel\'s power law.',
        expression: 't = d × p\np = t ÷ d\nd = t ÷ p\nSpeed = d ÷ t\nRiegel: T₂ = T₁ × (D₂ ÷ D₁)^1.06',
        terms: [
          { symbol: 'p', meaning: 'Pace, time per distance (min/mi or min/km).' },
          { symbol: 'd', meaning: 'Distance (1 mi = 1.609344 km exactly).' },
          { symbol: 't', meaning: 'Elapsed time.' },
          { symbol: 'T₁, D₁', meaning: 'Your known result: time and distance.' },
          { symbol: 'T₂, D₂', meaning: 'The predicted time for a new distance.' },
          { symbol: '1.06', meaning: 'Riegel\'s fatigue exponent for running: each doubling of distance multiplies time by about 2.085.' }
        ],
        note: 'Predictions are estimates only. They assume you have trained for the longer distance and race in similar conditions. Check with a doctor before starting a new or much harder running program.'
      },
      workedExample: {
        intro: 'You run a 5K in 25 minutes. What was your pace, and what might you run over longer distances?',
        rows: [
          { label: 'Distance in miles (5 ÷ 1.609344)', value: '3.107 mi' },
          { label: 'Pace per km (25 ÷ 5)', value: '5.00 min/km = 5:00/km' },
          { label: 'Pace per mile (25 ÷ 3.107)', value: '8.047 min/mi ≈ 8:03/mi' },
          { label: 'Speed (5 km ÷ 25 min × 60)', value: '12 km/h = 7.46 mph' },
          { label: '10K prediction (25 × 2^1.06)', value: '52.12 min ≈ 52:07' },
          { label: 'Half marathon (25 × 4.2195^1.06)', value: '115.0 min ≈ 1:55:00' },
          { label: 'Marathon (25 × 8.439^1.06)', value: '239.8 min ≈ 3:59:47' }
        ],
        result: 'Pace 8:03/mi (5:00/km) · predicted 10K 52:07 · half 1:55:00 · marathon 3:59:47',
        explanation: 'Holding 5:00/km for a whole marathon would take 210.98 minutes (3:30:58), half an hour faster than the Riegel prediction. That gap is the slowdown the formula builds in, and for many recreational runners the real marathon slowdown is bigger still, especially without long training runs.'
      },
      watchOut: [
        { title: 'Predictions need matching training', body: 'Riegel\'s formula was fitted to world records, where athletes are trained for each distance. A 5K runner without long runs will usually run slower than predicted in a marathon.' },
        { title: 'Stay within the formula\'s range', body: 'Riegel described the relation for events lasting from a few minutes to a few hours. Predictions from a very short sprint, or to ultramarathons, are much less reliable.' },
        { title: 'Courses and conditions differ', body: 'Hills, heat, wind, altitude and crowded starts all slow you down. A GPS watch can also over- or under-measure the distance, so use the official race distance.' },
        { title: 'Decimal minutes are not seconds', body: 'A pace of 8.5 min/mi is 8:30, not 8:50. Multiply the decimal part by 60 to get seconds.' },
        { title: 'Build up gradually', body: 'Sudden jumps in mileage or pace raise the risk of injury. If you have a heart condition, other health problems or are new to exercise, talk to a doctor first.' }
      ],
      references: [
        { label: 'Riegel PS, Athletic records and human endurance, American Scientist 69 (1981): 285–290', url: 'https://pubmed.ncbi.nlm.nih.gov/7235349/' },
        { label: 'NIST Special Publication 811, Guide for the Use of the International System of Units (Appendix B, the international mile)', url: 'https://www.nist.gov/pml/special-publication-811' },
        { label: 'US Department of Health and Human Services, Physical Activity Guidelines for Americans, 2nd edition', url: 'https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines' }
      ]
    },
    inputs: [
      { id: 'distanceMiles', label: 'Distance (miles)', type: 'number', placeholder: '3.1', defaultValue: 3.1, step: 0.1, min: 0.1 },
      { id: 'totalMinutes', label: 'Total time (minutes)', type: 'number', placeholder: '25', defaultValue: 25, step: 0.5, min: 0.5 }
    ],
    seo: {
      title: 'Running Pace Calculator – Pace, Time, and Distance',
      description: 'Calculate running pace per mile or km, finish time or distance, and predict 5K, 10K, half marathon and marathon times with the Riegel formula.',
      faq: [
        { question: 'How do I calculate my running pace?', answer: 'Divide your time by the distance. A 5K (3.107 mi) in 25 minutes is 25 ÷ 5 = 5:00 per km, or 25 ÷ 3.107 = 8.05 minutes, about 8:03, per mile.' },
        { question: 'What pace do I need for common race goals?', answer: 'A 30-minute 5K needs 9:39 per mile (6:00 per km). A 2-hour half marathon and a 4-hour marathon both need about 9:09 per mile (5:41 per km), because the marathon is exactly twice the half.' },
        { question: 'How do I convert pace to speed?', answer: 'Divide 60 by your pace in minutes. 8 minutes per mile is 60 ÷ 8 = 7.5 mph, and 5 minutes per km is 12 km/h.' },
        { question: 'How do I convert min/km to min/mile?', answer: 'Multiply by 1.609344, the kilometers in a mile. 5:00 per km × 1.609344 = 8.05 minutes, about 8:03 per mile. Divide to go the other way.' },
        { question: 'How are race times predicted?', answer: 'With Peter Riegel\'s formula, T₂ = T₁ × (D₂ ÷ D₁)^1.06. From a 25-minute 5K it predicts 25 × 2^1.06 ≈ 52:07 for a 10K and about 3:59:47 for a marathon, assuming you train for the distance.' },
        { question: 'How much running is enough for health?', answer: 'US Physical Activity Guidelines advise adults to get at least 150 minutes of moderate or 75 minutes of vigorous aerobic activity a week, or a mix. Running counts as vigorous, so about 75 minutes a week meets the minimum.' }
      ]
    },
    compute(values) {
      const paceMinPerMile = values.totalMinutes / values.distanceMiles;
      const paceMinPerKm = paceMinPerMile / 1.60934;
      const speedMph = 60 / paceMinPerMile;
      const speedKph = speedMph * 1.60934;
      const marathonFinishMinutes = paceMinPerMile * 26.2188;
      const halfMarathonFinishMinutes = paceMinPerMile * 13.1094;
      return { paceMinPerMile, paceMinPerKm, speedMph, speedKph, marathonFinishMinutes, halfMarathonFinishMinutes };
    }
  },
  {
    id: 'pregnancy-due-date-calculator',
    group: 'Pregnancy',
    category: 'health',
    glyph: 'EDD',
    updatedAt: '2026-10-20',
    aliases: ['due date calculator', 'conception date calculator', 'pregnancy week calculator', 'edd calculator', 'how far along am i'],
    related: ['age-calculator', 'date-difference-calculator', 'bmi-calculator', 'water-intake-calculator'],
    title: 'Pregnancy Due Date Calculator',
    description: 'Estimate your due date from the first day of your last menstrual period and your usual cycle length, and see how many weeks pregnant you are today, your trimester and the days left to go.',
    example: 'With a last period starting March 1, 2026 and a 28-day cycle, the estimated due date is December 6, 2026 (280 days later). On June 17, 2026 that pregnancy is 15 weeks 3 days along, in the second trimester, with 172 days to go.',
    timeDependent: true,
    breakdown: {
      headline: 'dueDateMs',
      headlineLabel: 'Estimated due date',
      outputs: [
        { id: 'dueDateMs', label: 'Estimated due date', format: 'date' },
        { id: 'completedWeeks', label: 'Weeks pregnant today (completed weeks)', format: 'integer' },
        { id: 'extraDays', label: 'Plus days', format: 'integer' },
        { id: 'trimester', label: 'Trimester', format: 'integer' },
        { id: 'daysRemaining', label: 'Days until the due date', format: 'integer' },
        { id: 'conceptionMs', label: 'Likely conception date (about)', format: 'date' }
      ],
      groups: [
        { title: 'First day of your last period', inputs: ['lmpMonth', 'lmpDay', 'lmpYear'] },
        { title: 'Your cycle', inputs: ['cycleLength'] }
      ],
      // Calendar arithmetic (not ms) so a daylight-saving change cannot shift the date by a day.
      // Timeline axis: days since the last period; trimesters per ACOG (14 0/7 and 28 0/7 weeks).
      derive: (values) => {
        const shift = values.cycleLength - 28;
        const onDay = (days: number) => new Date(values.lmpYear, values.lmpMonth - 1, values.lmpDay + days).getTime();
        return {
          dueDateMs: onDay(280 + shift),
          conceptionMs: onDay(14 + shift),
          completedWeeks: Math.floor(values.gestationalDays / 7),
          extraDays: values.gestationalDays % 7,
          axisStart: 0,
          secondTrimester: 98,
          thirdTrimester: 196,
          earlyTerm: 259,
          dueDay: 280 + shift
        };
      },
      visual: {
        type: 'timeline',
        start: 'axisStart',
        end: 'dueDay',
        phases: [
          { label: 'First trimester', from: 'axisStart', to: 'secondTrimester' },
          { label: 'Second trimester', from: 'secondTrimester', to: 'thirdTrimester' },
          { label: 'Third trimester', from: 'thirdTrimester', to: 'dueDay' }
        ],
        milestones: [{ label: '37 weeks (early term)', at: 'earlyTerm' }],
        today: 'gestationalDays',
        startLabel: 'last period',
        endLabel: 'due date',
        title: 'Your pregnancy timeline'
      }
    },
    content: {
      lastReviewed: '2026-10-20',
      concept: {
        title: 'How a due date is worked out',
        paragraphs: [
          'A pregnancy is dated from the first day of the last menstrual period (LMP), not from conception. That is a convention: the LMP is a date most people know, while the day of ovulation and fertilization usually is not. With a regular 28-day cycle, ovulation happens about two weeks after the LMP, so "weeks pregnant" includes roughly two weeks before conception.',
          'A typical pregnancy lasts about 280 days, or 40 weeks, from the LMP. The traditional shortcut, Naegele\'s rule, adds a year, subtracts three months and adds seven days to the LMP. Counting 280 days exactly is the same idea without the uneven month lengths, and it is what this calculator does. If your cycles are longer or shorter than 28 days, ovulation tends to come later or earlier, so the due date moves by the difference.',
          'Obstetricians divide pregnancy into three trimesters: the first runs to 13 weeks 6 days, the second from 14 weeks 0 days to 27 weeks 6 days, and the third from 28 weeks on. A baby born from 37 weeks 0 days is early term, and 39 weeks 0 days to 40 weeks 6 days is full term.',
          'A due date is an estimate. Only a small share of babies are born on it, and many arrive in the weeks either side. The American College of Obstetricians and Gynecologists (ACOG) considers an ultrasound in the first trimester the most accurate way to date a pregnancy, and your care team may change your due date after one.'
        ]
      },
      howTo: {
        intro: 'Fill in the date of the first day of your last period and your usual cycle length. The results appear once the page has loaded, because they depend on today\'s date.',
        steps: [
          { name: 'Enter the first day of your last period', text: 'Type the month as a number (March is 3), the day and the year. Use the day bleeding started, not the day it ended.' },
          { name: 'Enter your cycle length', text: 'Count from the first day of one period to the first day of the next. 28 days is the default; leave it if you are not sure.' },
          { name: 'Read your due date', text: 'The headline is the estimated due date. Below it are how far along you are today in completed weeks and days, your trimester, the days left, and the likely conception date.' },
          { name: 'Check the timeline', text: 'The bar shows the three trimesters, the start of early term at 37 weeks, and where today falls.' },
          { name: 'Confirm with your care team', text: 'Bring the date to your first prenatal appointment. An early ultrasound may move it, and your clinician\'s date is the one to use.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The due date is 280 days after the last period, shifted by how much your cycle differs from 28 days. Gestational age is counted from the last period.',
        expression: 'Due date = LMP + 280 days + (cycle − 28) days\nConception ≈ LMP + 14 days + (cycle − 28) days\nWeeks pregnant = (today − LMP) ÷ 7\nDays left = due date − today',
        terms: [
          { symbol: 'LMP', meaning: 'First day of the last menstrual period.' },
          { symbol: 'cycle', meaning: 'Usual cycle length in days, first day of one period to the first day of the next.' },
          { symbol: '280 days', meaning: '40 weeks, the conventional length of a pregnancy from the LMP.' },
          { symbol: 'Trimesters', meaning: '1st: to 13 weeks 6 days · 2nd: 14 weeks 0 days to 27 weeks 6 days · 3rd: from 28 weeks 0 days (ACOG).' }
        ],
        note: 'Estimate only, not medical advice. A due date from the last period is a first estimate. Ultrasound dating, IVF transfer dates and your clinician\'s judgment take priority, and any bleeding, pain or other concern needs prompt medical care.'
      },
      workedExample: {
        intro: 'Your last period started on March 1, 2026 and your cycles are 28 days. What is the due date, and how far along are you on June 17, 2026?',
        rows: [
          { label: 'Due date (March 1 + 280 days)', value: 'December 6, 2026' },
          { label: 'Likely conception (March 1 + 14 days)', value: 'March 15, 2026' },
          { label: 'Days since the last period (March 1 to June 17)', value: '108 days' },
          { label: 'Weeks pregnant (108 ÷ 7)', value: '15 weeks 3 days' },
          { label: 'Trimester (14 0/7 to 27 6/7 weeks)', value: 'Second' },
          { label: 'Days left (June 17 to December 6)', value: '172 days' }
        ],
        result: 'Due date December 6, 2026 · 15 weeks 3 days on June 17 · second trimester · 172 days to go',
        explanation: 'Naegele\'s rule by hand (March 1, plus one year, minus three months, plus seven days) gives December 8, two days later, because the months it skips are not all 30 days long. With a 35-day cycle, both the due date and the likely conception move 7 days later, to December 13 and March 22.'
      },
      watchOut: [
        { title: 'It is an estimate, not a deadline', body: 'Only a small share of babies arrive on the due date itself. Most are born in the weeks around it, and ACOG counts any birth from 37 weeks 0 days to 41 weeks 6 days as early, full or late term.' },
        { title: 'Ultrasound dating comes first', body: 'ACOG considers an ultrasound up to 13 weeks 6 days the most accurate way to date a pregnancy. If a later dating scan disagrees with the LMP date by more than a set margin, the due date is changed to match it.' },
        { title: 'Irregular or unknown cycles', body: 'If your cycles vary a lot, you recently stopped hormonal contraception, or you do not remember the date, the LMP method can be off by weeks. Use the date your clinician gives you.' },
        { title: 'IVF pregnancies are dated differently', body: 'After IVF, the due date comes from the embryo transfer date and embryo age, not the last period. This calculator does not cover that case.' },
        { title: 'Estimate only, not medical advice', body: 'This page cannot assess a pregnancy. Contact a doctor or midwife about any symptom or worry, and call emergency services for heavy bleeding or severe pain.' }
      ],
      references: [
        { label: 'ACOG Committee Opinion No. 700, Methods for Estimating the Due Date (2017)', url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date' },
        { label: 'ACOG Committee Opinion No. 579, Definition of Term Pregnancy (2013)', url: 'https://pubmed.ncbi.nlm.nih.gov/24150030/' },
        { label: 'ACOG, How Your Fetus Grows During Pregnancy (patient FAQ)', url: 'https://www.acog.org/womens-health/faqs/how-your-fetus-grows-during-pregnancy' }
      ]
    },
    inputs: [
      { id: 'lmpYear', label: 'Year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 2020 },
      { id: 'lmpMonth', label: 'Month (1–12)', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 1 },
      { id: 'lmpDay', label: 'Day of the month', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'cycleLength', label: 'Average cycle length (days)', type: 'number', placeholder: '28', defaultValue: 28, step: 1, min: 20 }
    ],
    seo: {
      title: 'Pregnancy Due Date Calculator – Weeks and Trimester',
      description: 'Estimate your due date from your last period and cycle length, and see how many weeks pregnant you are, your trimester and the days left.',
      faq: [
        { question: 'How is the due date calculated?', answer: 'Add 280 days (40 weeks) to the first day of your last period, then add or subtract the number of days your usual cycle is longer or shorter than 28. A last period on March 1, 2026 with a 28-day cycle gives December 6, 2026.' },
        { question: 'How many weeks pregnant am I?', answer: 'Count the days from the first day of your last period to today and divide by 7. On June 17, 2026, a pregnancy with a last period on March 1, 2026 is 108 days, or 15 weeks 3 days, along.' },
        { question: 'When does each trimester start?', answer: 'Using ACOG\'s definitions, the first trimester runs to 13 weeks 6 days, the second from 14 weeks 0 days to 27 weeks 6 days, and the third from 28 weeks 0 days until birth.' },
        { question: 'How accurate is a due date from my last period?', answer: 'It is a reasonable first estimate if your cycles are regular, but only a small share of babies are born on the exact date. A first-trimester ultrasound is the most accurate dating method, and your clinician may adjust the date after one.' },
        { question: 'When did I conceive?', answer: 'Usually about two weeks after the first day of your last period with a 28-day cycle, or later with longer cycles. For a last period on March 1, 2026, that is around March 15. Sperm can survive several days, so conception can follow intercourse by a few days.' },
        { question: 'What do early term and full term mean?', answer: 'ACOG calls a birth from 37 weeks 0 days to 38 weeks 6 days early term, 39 weeks 0 days to 40 weeks 6 days full term, 41 weeks 0 days to 41 weeks 6 days late term, and 42 weeks or more postterm.' },
        { question: 'Does this work for IVF pregnancies?', answer: 'No. IVF due dates are calculated from the embryo transfer date and the age of the embryo. Use the date your fertility clinic gives you.' }
      ]
    },
    compute(values) {
      const lmp = new Date(values.lmpYear, values.lmpMonth - 1, values.lmpDay).getTime();
      const cycleAdjust = (values.cycleLength - 28) * 86400000;
      const dueDateMs = lmp + 280 * 86400000 + cycleAdjust;
      const now = values.todayMs !== undefined ? new Date(values.todayMs) : new Date();
      const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const gestationalDays = Math.max(0, Math.round((todayMs - lmp) / 86400000));
      const gestationalWeeks = gestationalDays / 7;
      const daysRemaining = Math.max(0, Math.round((dueDateMs - todayMs) / 86400000));
      // ACOG: 1st trimester to 13 6/7 weeks, 2nd 14 0/7 to 27 6/7, 3rd from 28 0/7 (was ≤ 12 / ≤ 26 before step 37).
      const trimester = gestationalWeeks < 14 ? 1 : gestationalWeeks < 28 ? 2 : 3;
      return { gestationalWeeks, daysRemaining, trimester, gestationalDays };
    }
  },
  {
    id: 'body-fat-percentage-calculator',
    group: 'Body & Nutrition',
    category: 'health',
    glyph: 'BF%',
    updatedAt: '2026-11-16',
    aliases: ['body fat calculator', 'navy body fat calculator', 'body fat percentage calculator', 'body composition calculator', 'us navy body fat method'],
    related: ['bmi-calculator', 'waist-to-hip-ratio-calculator', 'ideal-weight-calculator', 'tdee-calculator'],
    title: 'Body Fat Percentage Calculator',
    description: 'Estimate body fat percentage from neck, waist and (for women) hip circumference with the US Navy method, and see where the result sits on the ACE body-fat categories for your sex.',
    example: 'A man 5 ft 10 in tall with a 15 in neck and a 36 in waist has about 21.3% body fat by the Navy method, in the "acceptable" category for men.',
    breakdown: {
      headline: 'bodyFatPercent',
      headlineLabel: 'Estimated body fat percentage',
      outputs: [
        { id: 'bodyFatPercent', label: 'Estimated body fat percentage', format: 'number' },
        { id: 'category', label: 'ACE category', labels: BODY_FAT_CATEGORY_LABELS }
      ],
      groups: [
        { title: 'About you', inputs: ['sex', 'height'] },
        { title: 'Measurements', inputs: ['neck', 'waist'] },
        { title: 'Hip (women only)', inputs: ['hip'], optional: true }
      ]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is the US Navy body fat method?',
        paragraphs: [
          'Body fat percentage is the share of total body weight that is fat, as opposed to muscle, bone, organs and water. It is a more direct measure of body composition than BMI, which only compares weight to height and cannot tell a muscular body from a fat one.',
          'The most accurate ways to measure body fat — underwater weighing, DEXA scans, air-displacement plethysmography — need equipment nobody has at home. In 1984 the Naval Health Research Center (Hodgdon and Beckett) published a cheaper alternative: equations that estimate percent body fat from a tape measure alone, using neck and waist (and, for women, hip) circumference plus height. The US military still uses a version of this circumference method for body composition standards today.',
          'The equations were built by comparing sailors\' circumferences against their body fat measured by underwater weighing, then fitting a logarithmic regression. The published standard error is about 3 to 4 percentage points, so a result of "21%" really means "about 21%, give or take a few points," not a lab-grade figure.',
          'This calculator reports the result against the American Council on Exercise (ACE) categories, which run from essential fat (the minimum needed for health) through athletic, fitness, acceptable and obesity ranges. The cutoffs differ for men and women because women carry more essential fat for reproductive and hormonal function.'
        ]
      },
      howTo: {
        intro: 'Fill in your sex, height, neck and waist measurements. Women also enter hip measurement.',
        steps: [
          { name: 'Choose your sex', text: 'The formula and the category cutoffs are different for men and women.' },
          { name: 'Enter your height', text: 'Measure without shoes. 5 ft 10 in is 70 in.' },
          { name: 'Measure your neck', text: 'Just below the larynx (Adam\'s apple), tape sloping slightly downward at the front.' },
          { name: 'Measure your waist', text: 'At the navel for the Navy method (not necessarily the narrowest point), standing relaxed, tape snug but not compressing the skin.' },
          { name: 'Women: measure your hip', text: 'At the widest point around the buttocks. This field is not used for men.' },
          { name: 'Read the result', text: 'The headline is the estimated body fat percentage; below it is the ACE category it falls into for your sex.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The Hodgdon–Beckett circumference equations, with every length in inches.',
        expression: 'Men: %BF = 86.010 × log₁₀(waist − neck) − 70.041 × log₁₀(height) + 36.76\nWomen: %BF = 163.205 × log₁₀(waist + hip − neck) − 97.684 × log₁₀(height) − 78.387',
        terms: [
          { symbol: 'waist, neck, hip, height', meaning: 'Circumferences and height in inches (1 in = 2.54 cm).' },
          { symbol: 'log₁₀', meaning: 'Base-10 logarithm.' },
          { symbol: '%BF', meaning: 'Estimated percent body fat.' }
        ],
        note: 'Estimate only, not medical advice. The published standard error is about 3–4 percentage points, and the method was validated on military-age adults, not every body type. See a doctor or a trained professional for a precise measurement (DEXA, hydrostatic weighing or skinfold calipers).'
      },
      workedExample: {
        intro: 'A man is 5 ft 10 in (70 in) tall, with a 15 in neck and a 36 in waist. What is his estimated body fat percentage?',
        rows: [
          { label: 'Waist − neck (36 − 15)', value: '21 in' },
          { label: 'log₁₀(21)', value: '1.32222' },
          { label: '86.010 × 1.32222', value: '113.775' },
          { label: 'log₁₀(70)', value: '1.84510' },
          { label: '70.041 × 1.84510', value: '129.251' },
          { label: '%BF (113.775 − 129.251 + 36.76)', value: '21.3%' }
        ],
        result: 'About 21.3% body fat — the "acceptable" category for men (18–24%)',
        explanation: 'A woman 5 ft 5 in (65 in) tall with a 12 in neck, 29 in waist and 38 in hip works the same way with the women\'s equation: 163.205 × log₁₀(29+38−12) − 97.684 × log₁₀(65) − 78.387 ≈ 28.6%, also in her "acceptable" category (25–31%). Both examples land mid-band, which is typical: most adults who are not athletes or significantly overweight fall in the acceptable range for their sex.'
      },
      watchOut: [
        { title: 'Measure the same way every time', body: 'A loosely held tape can shift the waist reading by an inch, which moves the result by a few percentage points. Measure at the same time of day, standing, without pulling the tape tight enough to compress the skin.' },
        { title: 'The categories are fitness labels, not diagnoses', body: 'ACE describes these bands as useful for tracking fitness and comparing with population norms, not as a clinical cutoff for disease risk the way BMI\'s categories are sometimes used.' },
        { title: 'Built from a military population', body: 'Hodgdon and Beckett\'s sample was active-duty sailors. People with very different builds — bodybuilders, older adults who have lost muscle, or people with a large or small frame — can see the formula over- or under-estimate their true body fat.' },
        { title: 'Different from BMI', body: 'BMI only needs weight and height and cannot separate muscle from fat. This method measures circumferences instead and responds differently to the same change in weight, so the two numbers will not always move together.' },
        { title: 'Estimate only, not medical advice', body: 'For a measurement precise enough to guide a medical decision, ask about DEXA scanning, hydrostatic (underwater) weighing or skinfold calipers from a trained professional.' }
      ],
      references: [
        { label: 'Friedl KE et al., Evaluation of a circumference-based prediction equation to assess body composition changes in men (cites Hodgdon & Beckett 1984 equations in full)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4831679/' },
        { label: 'Santiago DA et al., Circumference-based predictions of body fat revisited: a US Marine Corps body composition survey', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9008774/' },
        { label: 'Healthline, reproducing the ACE percent-body-fat norms for men and women', url: 'https://www.healthline.com/health/exercise-fitness/ideal-body-fat-percentage' }
      ]
    },
    inputs: [
      { id: 'sex', label: 'Sex', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: SEX_OPTIONS },
      { id: 'height', label: 'Height', type: 'number', placeholder: '70', defaultValue: 70, step: 1, min: 48, dimension: 'length', unit: 'in' },
      { id: 'neck', label: 'Neck circumference', type: 'number', placeholder: '15', defaultValue: 15, step: 0.5, min: 1, dimension: 'length', unit: 'in' },
      { id: 'waist', label: 'Waist circumference', type: 'number', placeholder: '36', defaultValue: 36, step: 0.5, min: 1, dimension: 'length', unit: 'in' },
      { id: 'hip', label: 'Hip circumference', type: 'number', placeholder: '38', defaultValue: 38, step: 0.5, min: 1, dimension: 'length', unit: 'in' }
    ],
    seo: {
      title: 'Body Fat Percentage Calculator – US Navy Method',
      description: 'Estimate body fat percentage from neck, waist and hip measurements using the US Navy circumference method, with your ACE category for men or women.',
      faq: [
        { question: 'How is body fat percentage calculated from measurements?', answer: 'This calculator uses the US Navy (Hodgdon–Beckett) circumference method: for men, 86.010 × log₁₀(waist − neck) − 70.041 × log₁₀(height) + 36.76; for women it adds hip and uses different constants. All lengths are in inches.' },
        { question: 'How accurate is the Navy body fat method?', answer: 'The original validation reported a standard error of about 3 to 4 percentage points against underwater weighing — reasonably good for a tape measure, but not as precise as a DEXA scan or hydrostatic weighing.' },
        { question: 'Where do I measure my waist for this calculator?', answer: 'At the navel, standing relaxed, with the tape snug but not pressed into the skin. This is the Navy method\'s own reference point, which may be different from "narrowest point" waist measurements used elsewhere.' },
        { question: 'Why does the women\'s formula need a hip measurement and the men\'s does not?', answer: 'The original Naval Health Research Center studies found that adding hip circumference improved the prediction for women but not for men, so the two sex-specific equations use different inputs.' },
        { question: 'What is a healthy body fat percentage?', answer: 'Using the ACE categories, "acceptable" runs 18–24% for men and 25–31% for women; "athletes" is 6–13% (men) and 14–20% (women). Essential fat — the minimum needed for health — is about 2–5% for men and 10–13% for women.' },
        { question: 'Is this calculator the same as a BMI calculator?', answer: 'No. BMI only uses weight and height and cannot tell muscle from fat. This calculator estimates body composition directly from circumferences, so it can give a very different picture for a muscular or a very lean person than BMI does.' }
      ]
    },
    compute(values) {
      const isFemale = values.sex === 1;
      const bodyFatPercent = isFemale
        ? 163.205 * Math.log10(values.waist + values.hip - values.neck) - 97.684 * Math.log10(values.height) - 78.387
        : 86.010 * Math.log10(values.waist - values.neck) - 70.041 * Math.log10(values.height) + 36.76;
      // ACE category upper bounds (percent body fat): essential, athletes, fitness, acceptable; above = obesity.
      const thresholds = isFemale ? [13, 20, 24, 31] : [5, 13, 17, 24];
      let category = 4;
      for (let i = 0; i < thresholds.length; i++) {
        if (bodyFatPercent <= thresholds[i]) {
          category = i;
          break;
        }
      }
      return { bodyFatPercent, category };
    }
  },
  {
    id: 'ideal-weight-calculator',
    group: 'Body & Nutrition',
    category: 'health',
    glyph: 'IBW',
    updatedAt: '2026-11-16',
    aliases: ['ideal body weight calculator', 'ibw calculator', 'devine formula calculator', 'what should i weigh calculator', 'healthy weight for height calculator'],
    related: ['bmi-calculator', 'body-fat-percentage-calculator', 'calorie-calculator', 'tdee-calculator'],
    title: 'Ideal Weight Calculator',
    description: 'Estimate ideal body weight from height and sex using the Devine and Robinson formulas, two of several estimate methods clinicians use for drug dosing, not a target to chase.',
    example: 'A man 5 ft 10 in (70 in) tall has a Devine ideal weight of about 161 lb and a Robinson estimate of about 157 lb — two formulas giving similar but not identical answers.',
    breakdown: {
      headline: 'devineWeight',
      headlineLabel: 'Ideal weight (Devine formula)',
      outputs: [
        { id: 'devineWeight', label: 'Ideal weight (Devine formula)', format: 'number', dimension: 'mass', unit: 'lb' },
        { id: 'robinsonWeight', label: 'Ideal weight (Robinson formula)', format: 'number', dimension: 'mass', unit: 'lb' },
        { id: 'currentWeight', label: 'Your current weight', format: 'number', dimension: 'mass', unit: 'lb' }
      ],
      groups: [
        { title: 'About you', inputs: ['sex', 'height'] },
        { title: 'Compare with your current weight', inputs: ['currentWeight'], optional: true }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'currentWeight', label: 'Current weight' },
          { from: 'devineWeight', label: 'Devine estimate' },
          { from: 'robinsonWeight', label: 'Robinson estimate' }
        ],
        title: 'Your weight vs two ideal-weight formulas'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is "ideal body weight"?',
        paragraphs: [
          '"Ideal body weight" (IBW) is an old pharmacology shorthand, not a clinical goal. In 1974 Ben Devine published a simple formula to estimate lean body size for dosing a drug (gentamicin) whose correct dose depends on body size but should not be based on someone\'s full weight if they carry a lot of fat. The formula caught on because it is easy to compute at a bedside, and hospitals still use versions of it today for dosing certain medications and for mechanical-ventilation settings.',
          'Devine\'s was not the only such formula. Robinson and colleagues published a different regression in 1983, built from the same underlying height-weight tables Devine had used, and others (Miller, Hamwi) followed. A 2000 review by Pai and Paloucek traced all of them back to the same mid-twentieth-century actuarial height-weight tables, which is why they tend to agree within a few pounds of each other rather than giving wildly different answers.',
          'None of these formulas measure body fat, muscle, frame size or health. They are a single number derived only from height and sex, originally meant to approximate a "normal" body size for calculating a drug dose — not a weight to aim for by dieting. The healthy-weight range on this site\'s BMI calculator, which gives a range rather than one number, is a better everyday reference for weight than any single IBW formula.',
          'This page shows two of the most common formulas side by side, Devine and Robinson, so you can see how much they actually differ for the same height.'
        ]
      },
      howTo: {
        intro: 'Fill in your sex and height. Optionally enter your current weight to compare.',
        steps: [
          { name: 'Choose your sex', text: 'Both formulas use a different base weight for men and women.' },
          { name: 'Enter your height', text: 'In inches; 5 ft 10 in is 70 in. Both formulas were built for adult heights of 5 ft (60 in) and up.' },
          { name: 'Read the two estimates', text: 'The headline is the Devine formula\'s estimate; below it is the Robinson formula\'s estimate for the same height.' },
          { name: 'Compare with your current weight (optional)', text: 'Enter your weight to see it next to both formulas on the chart. A difference from either number is not a verdict on your health.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Both formulas add a fixed amount per inch of height over 5 feet (60 in) to a sex-specific base weight, in kilograms.',
        expression: 'Devine: men 50 + 2.3 × (height_in − 60); women 45.5 + 2.3 × (height_in − 60)\nRobinson: men 52 + 1.9 × (height_in − 60); women 49 + 1.7 × (height_in − 60)',
        terms: [
          { symbol: 'height_in', meaning: 'Height in inches. 1 in = 2.54 cm.' },
          { symbol: '50, 45.5, 52, 49', meaning: 'Base weight in kilograms at exactly 5 ft (60 in), by formula and sex.' },
          { symbol: '2.3, 1.9, 1.7', meaning: 'Kilograms added per inch of height over 60 in.' }
        ],
        note: 'Estimate only, not medical advice. These formulas were built for drug-dosing calculations in adults 5 ft and taller, not as a personal weight target. Ask a doctor or registered dietitian about a healthy weight for you.'
      },
      workedExample: {
        intro: 'A man is 5 ft 10 in (70 in) tall. What do the two formulas estimate?',
        rows: [
          { label: 'Inches over 60 (70 − 60)', value: '10 in' },
          { label: 'Devine (50 + 2.3 × 10)', value: '73.0 kg = 160.9 lb' },
          { label: 'Robinson (52 + 1.9 × 10)', value: '71.0 kg = 156.5 lb' },
          { label: 'Difference (Devine − Robinson)', value: '2.0 kg ≈ 4.4 lb, about 2.8% higher' }
        ],
        result: 'Devine ≈ 161 lb · Robinson ≈ 157 lb for a 5 ft 10 in man',
        explanation: 'The two formulas land within about 3% of each other here, which is typical: they were built from overlapping height-weight data, so the gap stays small across most adult heights. Neither number is "more correct" than the other — they are two estimates of the same rough idea.'
      },
      watchOut: [
        { title: 'Not a target to chase', body: 'These formulas describe a population average at a given height, not a personal health goal. Trying to diet down (or bulk up) to match one ignores your actual body composition and health status entirely.' },
        { title: 'Several other formulas exist', body: 'Miller (1983) and the older Hamwi (1964) rule of thumb give slightly different numbers again. All of them agree within a few percent for most adult heights, which is itself a sign that none of them should be treated as precise.' },
        { title: 'Built for adults 5 ft and taller', body: 'Both formulas were derived from, and are normally applied to, heights of 60 in and up. Below that, the straight-line formula extrapolates beyond the data it was built on and gets less reliable.' },
        { title: 'Says nothing about muscle or fat', body: 'A bodybuilder and someone who has lost a lot of muscle can have the same height and the same "ideal weight," while having very different body compositions. Pair this with the body-fat-percentage calculator for a more complete picture.' },
        { title: 'Estimate only, not medical advice', body: 'Clinicians use IBW for specific calculations like drug dosing and ventilator settings, with professional judgment about when it applies. It is not a substitute for a conversation with a doctor or dietitian about your own healthy weight.' }
      ],
      references: [
        { label: 'Peterson CM et al., Ideal body weight: a commentary (states the Devine 1974 and Robinson 1983 formulas with full constants)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8646317/' },
        { label: 'Pai MP, Paloucek FP, The origin of the "ideal" body weight equations, Annals of Pharmacotherapy 34 (2000): 1066–1069', url: 'https://pubmed.ncbi.nlm.nih.gov/10981254/' }
      ]
    },
    inputs: [
      { id: 'sex', label: 'Sex', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: SEX_OPTIONS },
      { id: 'height', label: 'Height', type: 'number', placeholder: '70', defaultValue: 70, step: 1, min: 48, dimension: 'length', unit: 'in' },
      { id: 'currentWeight', label: 'Your current weight', type: 'number', placeholder: '180', defaultValue: 180, step: 1, min: 0, dimension: 'mass', unit: 'lb' }
    ],
    seo: {
      title: 'Ideal Weight Calculator – Devine & Robinson Formulas',
      description: 'Estimate ideal body weight from height and sex with the Devine and Robinson formulas, two of several methods, compared with your own weight.',
      faq: [
        { question: 'How is ideal body weight calculated?', answer: 'The Devine formula adds 2.3 kg per inch of height over 5 ft to a base of 50 kg (men) or 45.5 kg (women). A 5 ft 10 in man gets 50 + 2.3 × 10 = 73 kg, about 161 lb.' },
        { question: 'Is the Devine formula accurate?', answer: 'It was designed to approximate lean body size for drug-dosing calculations, not to measure your true healthy weight. Pai and Paloucek\'s 2000 review found it closely tracks older height-weight insurance tables, which is a reasonable population average but not a personalized figure.' },
        { question: 'Why do Devine and Robinson give different numbers?', answer: 'They are separate regressions fit to overlapping data decades apart (1974 and 1983). For a 5 ft 10 in man they differ by about 4.4 lb (2.8%) — close, but not identical, which is why this page shows both rather than picking one as "correct."' },
        { question: 'Should I try to reach my "ideal weight"?', answer: 'No. These formulas were built for clinical dosing calculations and say nothing about your body fat, muscle mass or health. Use the BMI calculator\'s healthy-weight range, or talk to a doctor or dietitian, for a more complete picture.' },
        { question: 'Does ideal body weight apply to children?', answer: 'No. Both formulas were derived from adult height-weight data. Pediatric growth and weight assessment use age- and sex-specific growth charts instead.' },
        { question: 'What is ideal body weight actually used for today?', answer: 'Mainly clinical dosing — some antibiotics, chemotherapy agents and ventilator tidal volume settings are calculated from IBW or an adjusted version of it, under a clinician\'s judgment, not as a general wellness target.' }
      ]
    },
    compute(values) {
      const isFemale = values.sex === 1;
      const overSixty = values.height - 60;
      const devineKg = (isFemale ? 45.5 : 50.0) + 2.3 * overSixty;
      const robinsonKg = (isFemale ? 49.0 : 52.0) + (isFemale ? 1.7 : 1.9) * overSixty;
      const KG_TO_LB = 2.2046226218;
      return {
        devineWeight: devineKg * KG_TO_LB,
        robinsonWeight: robinsonKg * KG_TO_LB,
        currentWeight: values.currentWeight
      };
    }
  },
  {
    id: 'macro-calculator',
    group: 'Body & Nutrition',
    category: 'health',
    glyph: 'PFC',
    updatedAt: '2026-11-16',
    aliases: ['macro calculator', 'macronutrient calculator', 'protein carbs fat calculator', 'iifym calculator', 'macros for weight loss calculator'],
    related: ['calorie-calculator', 'tdee-calculator', 'bmi-calculator'],
    title: 'Macro Calculator',
    description: 'Split a daily calorie target into protein, fat and carbohydrate grams from your own percentages, using the Atwater energy values. Pairs with the calorie and TDEE calculators for the target itself.',
    example: 'On a 2,000-calorie target split 20% protein / 30% fat / 50% carbohydrate, that is 100 g protein, 67 g fat and 250 g carbohydrate a day.',
    breakdown: {
      headline: 'carbGrams',
      headlineLabel: 'Carbohydrate (grams per day)',
      outputs: [
        { id: 'proteinGrams', label: 'Protein (grams per day)', format: 'number' },
        { id: 'fatGrams', label: 'Fat (grams per day)', format: 'number' },
        { id: 'carbGrams', label: 'Carbohydrate (grams per day)', format: 'number' },
        { id: 'carbPercent', label: 'Carbohydrate share (the remainder)', format: 'number' }
      ],
      groups: [
        { title: 'Your target', inputs: ['calories'] },
        { title: 'Your split', inputs: ['proteinPercent', 'fatPercent'] }
      ],
      derive: (values) => ({
        proteinCalories: values.proteinGrams * 4,
        fatCalories: values.fatGrams * 9,
        carbCalories: values.carbGrams * 4
      }),
      visual: {
        type: 'donut',
        segments: [
          { from: 'proteinCalories', label: 'Protein' },
          { from: 'fatCalories', label: 'Fat' },
          { from: 'carbCalories', label: 'Carbohydrate' }
        ],
        center: 'calories',
        centerSub: 'calories a day'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What are macros?',
        paragraphs: [
          '"Macros" is short for macronutrients: protein, fat and carbohydrate, the three sources of food energy (alcohol is a fourth, usually ignored in diet planning). A calorie target from a calculator like this site\'s calorie or TDEE calculator says how much energy to eat; a macro split says what that energy is made of, in grams you can actually track against food labels.',
          'Energy per gram is not the same for every macronutrient. The Atwater general factors — 4 kcal per gram of protein, 4 kcal per gram of carbohydrate and 9 kcal per gram of fat — have been the standard conversion since early-twentieth-century calorimetry, confirmed in a 2003 FAO/WHO joint expert consultation as still the practical default for food labels and diet calculations, even though food-specific factors are slightly more accurate for research use.',
          'US and international nutrition authorities set a broad "Acceptable Macronutrient Distribution Range" (AMDR) for healthy adults: 45–65% of calories from carbohydrate, 20–35% from fat and 10–35% from protein. Diets at the edges of those ranges (very low-carb, very high-protein) can still be nutritionally adequate, but most people do well choosing percentages inside them rather than far outside.',
          'This calculator does not choose a split for you. Enter your protein and fat percentages — from a nutritionist, a training program, or just a starting guess inside the AMDR — and carbohydrate automatically takes whatever share of calories is left.'
        ]
      },
      howTo: {
        intro: 'Fill in your daily calorie target and your protein and fat percentages. Carbohydrate is whatever share is left over.',
        steps: [
          { name: 'Get a calorie target', text: 'Use this site\'s calorie or TDEE calculator to estimate how many calories a day you need, or enter a target your dietitian gave you.' },
          { name: 'Choose a protein percentage', text: 'The AMDR for adults is 10–35% of calories; many strength and weight-loss plans sit toward the upper half of that range.' },
          { name: 'Choose a fat percentage', text: 'The AMDR for adults is 20–35% of calories.' },
          { name: 'Read the grams', text: 'The headline is carbohydrate grams, the share left over once protein and fat are set; the rows above show protein and fat grams and carbohydrate\'s percentage.' },
          { name: 'Check the chart', text: 'The ring splits your total calories by macro, so you can see the balance at a glance.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each macro\'s calories come from its percentage of the total; grams come from dividing by its energy value per gram.',
        expression: 'Carb % = 100 − protein % − fat %\nProtein (g) = calories × protein % ÷ 100 ÷ 4\nFat (g) = calories × fat % ÷ 100 ÷ 9\nCarb (g) = calories × carb % ÷ 100 ÷ 4',
        terms: [
          { symbol: 'calories', meaning: 'Daily calorie target, in kcal.' },
          { symbol: 'protein %, fat %', meaning: 'The share of total calories from each, as whole percentages.' },
          { symbol: '4, 9', meaning: 'Atwater general energy factors: 4 kcal/g for protein and carbohydrate, 9 kcal/g for fat (FAO/WHO, 2003).' }
        ],
        note: 'Estimate only, not medical advice. This calculator does the arithmetic; it does not know your health history. Ask a doctor or registered dietitian before following a diet far outside the AMDR, especially with kidney disease, diabetes or during pregnancy.'
      },
      workedExample: {
        intro: 'A 2,000-calorie target is split 20% protein and 30% fat. How many grams of each macro is that?',
        rows: [
          { label: 'Carb % (100 − 20 − 30)', value: '50%' },
          { label: 'Protein calories (2,000 × 0.20)', value: '400 kcal' },
          { label: 'Protein grams (400 ÷ 4)', value: '100 g' },
          { label: 'Fat calories (2,000 × 0.30)', value: '600 kcal' },
          { label: 'Fat grams (600 ÷ 9)', value: '66.7 g' },
          { label: 'Carb calories (2,000 × 0.50)', value: '1,000 kcal' },
          { label: 'Carb grams (1,000 ÷ 4)', value: '250 g' }
        ],
        result: '100 g protein · 66.7 g fat · 250 g carbohydrate on a 2,000-calorie target',
        explanation: 'Checking the total: 100 × 4 + 66.7 × 9 + 250 × 4 = 400 + 600.3 + 1,000 = 2,000.3 kcal, matching the target (the extra 0.3 kcal is rounding fat grams to one decimal). A 2,500-calorie target split 30% protein / 25% fat instead gives 187.5 g protein, 69.4 g fat and 281.3 g carbohydrate (45% of calories) — a higher-protein, slightly higher-carb-percentage split than the first example.'
      },
      watchOut: [
        { title: 'Carbohydrate is always the remainder here', body: 'This calculator fixes protein and fat and lets carbohydrate take what is left. If you would rather fix carbohydrate and protein and let fat be the remainder, swap which percentage you treat as flexible before reading the grams.' },
        { title: 'Percentages, not a diagnosis', body: 'The AMDR (45–65% carbohydrate, 20–35% fat, 10–35% protein) describes ranges that support adequate nutrient intake for healthy adults, not a required ratio. Athletes, people managing diabetes, and other specific situations often work with a dietitian on a different split.' },
        { title: 'Fiber and alcohol complicate real labels', body: 'Food labels count fiber inside total carbohydrate even though it contributes little usable energy, and alcohol (7 kcal/g) is a separate, often-ignored energy source. Tracking apps may show grams that do not perfectly match this simple calculation once fiber and alcohol are involved.' },
        { title: 'Grams, not food choices', body: 'Hitting a protein gram target with candy and soda instead of lean protein and vegetables technically satisfies the macro number while missing the point of eating that way. Macro targets are a budgeting tool, not a quality guarantee.' },
        { title: 'Estimate only, not medical advice', body: 'This is arithmetic on a number you provide. Get your calorie target and any medically important diet changes reviewed by a doctor or registered dietitian.' }
      ],
      references: [
        { label: 'FAO, Food energy — methods of analysis and conversion factors (2003), chapter 3: energy conversion factors', url: 'https://www.fao.org/4/y5022e/y5022e04.htm' },
        { label: 'Health Canada, Dietary Reference Intakes: Acceptable Macronutrient Distribution Ranges (based on the Institute of Medicine DRIs)', url: 'https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables/reference-values-macronutrients.html' }
      ]
    },
    inputs: [
      { id: 'calories', label: 'Daily calorie target', type: 'number', placeholder: '2000', defaultValue: 2000, step: 50, min: 0, dimension: 'energy', unit: 'kcal' },
      { id: 'proteinPercent', label: 'Protein (% of calories)', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 0 },
      { id: 'fatPercent', label: 'Fat (% of calories)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 0 }
    ],
    seo: {
      title: 'Macro Calculator – Protein, Fat and Carb Grams',
      description: 'Split a daily calorie target into protein, fat and carbohydrate grams using your own percentages and the Atwater energy values (4/4/9 kcal per gram).',
      faq: [
        { question: 'How do I calculate my macros?', answer: 'Multiply your calorie target by each macro\'s percentage, then divide by its energy value per gram: 4 kcal/g for protein and carbohydrate, 9 kcal/g for fat. A 2,000-calorie target at 20% protein is 2,000 × 0.20 ÷ 4 = 100 g of protein.' },
        { question: 'What macro split should I use?', answer: 'The Acceptable Macronutrient Distribution Range for healthy adults is 45–65% carbohydrate, 20–35% fat and 10–35% protein. Many weight-training or weight-loss plans sit near the higher end of the protein range; endurance athletes often sit near the higher end of carbohydrate.' },
        { question: 'How many grams of protein, fat and carbs should I eat to lose weight?', answer: 'Weight loss depends mainly on total calories, not the macro split. A common approach is to set a calorie deficit first (this site\'s calorie calculator), then choose a protein percentage toward the higher end of the AMDR (25–35%) to help preserve muscle, with fat and carbohydrate filling the rest.' },
        { question: 'Why does carbohydrate show as "the remainder"?', answer: 'Because protein and fat are the two percentages you set, carbohydrate is whatever share of 100% is left: 100 − protein % − fat %. On a 2,000-calorie target at 20% protein and 30% fat, that leaves 50% for carbohydrate, or 250 g.' },
        { question: 'Does fiber count toward carbohydrate grams here?', answer: 'This calculator does a simple energy-based split and does not separate fiber from other carbohydrate. Nutrition labels count fiber inside total carbohydrate even though it provides less usable energy, so a label\'s carbohydrate grams may not line up exactly with this figure.' },
        { question: 'What are the Atwater factors?', answer: 'They are standard energy values per gram — 4 kcal for protein, 4 kcal for carbohydrate and 9 kcal for fat — set from early calorimetry studies and reconfirmed by a 2003 FAO/WHO expert consultation as the practical default for everyday diet calculations and food labels.' }
      ]
    },
    compute(values) {
      const carbPercent = Math.max(0, 100 - values.proteinPercent - values.fatPercent);
      const proteinGrams = (values.calories * values.proteinPercent / 100) / 4;
      const fatGrams = (values.calories * values.fatPercent / 100) / 9;
      const carbGrams = (values.calories * carbPercent / 100) / 4;
      return { proteinGrams, fatGrams, carbGrams, carbPercent };
    }
  },
  {
    id: 'waist-to-hip-ratio-calculator',
    group: 'Body & Nutrition',
    category: 'health',
    glyph: 'WHR',
    updatedAt: '2026-11-16',
    aliases: ['waist to hip ratio calculator', 'whr calculator', 'waist hip ratio calculator', 'body shape calculator', 'apple vs pear body shape calculator'],
    related: ['bmi-calculator', 'body-fat-percentage-calculator', 'ideal-weight-calculator'],
    title: 'Waist-to-Hip Ratio Calculator',
    description: 'Calculate your waist-to-hip ratio from two tape-measure readings and compare it with the WHO cutoffs for substantially increased risk of metabolic complications: 0.90 for men, 0.85 for women.',
    example: 'A man with a 38 in waist and a 40 in hip has a waist-to-hip ratio of 0.95, at or above the WHO cutoff of 0.90 for men.',
    breakdown: {
      headline: 'whr',
      headlineLabel: 'Waist-to-hip ratio',
      outputs: [
        { id: 'whr', label: 'Waist-to-hip ratio', format: 'number' },
        { id: 'riskLevel', label: 'WHO risk category', labels: [
          { value: 0, label: 'Below the WHO cutoff' },
          { value: 1, label: 'At or above the WHO cutoff (substantially increased risk)' }
        ] }
      ],
      groups: [
        { title: 'About you', inputs: ['sex'] },
        { title: 'Measurements', inputs: ['waist', 'hip'] }
      ],
      derive: (values) => ({ cutoff: values.sex === 1 ? 0.85 : 0.90 }),
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'whr', label: 'Your ratio' },
          { from: 'cutoff', label: 'WHO cutoff for your sex' }
        ],
        title: 'Your waist-to-hip ratio vs the WHO cutoff'
      }
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'What is waist-to-hip ratio?',
        paragraphs: [
          'Waist-to-hip ratio (WHR) is your waist circumference divided by your hip circumference. It is a simple way to describe body shape: a higher ratio means relatively more fat is carried around the waist ("apple" shaped), a lower ratio means relatively more is carried around the hips and thighs ("pear" shaped).',
          'Where fat is stored matters for health in a way that total weight alone does not capture. Fat around the abdomen (visceral fat, packed around internal organs) is more metabolically active and more strongly linked to type 2 diabetes and cardiovascular disease than fat stored around the hips, even at the same body weight.',
          'A 2008 WHO expert consultation on waist circumference and waist-to-hip ratio reviewed this evidence and set a single-cutoff standard: a WHR of 0.90 or more for men, or 0.85 or more for women, indicates substantially increased risk of metabolic complications. The same numeric cutoffs appear in the American Heart Association/National Heart, Lung, and Blood Institute\'s 2005 scientific statement on metabolic syndrome, which independently reaches the same figures.',
          'WHR is distinct from BMI, which only compares weight to height, and distinct from body fat percentage, which estimates how much of your weight is fat without saying where it is carried. The three measurements answer three different questions and are meant to be used together, not interchangeably.'
        ]
      },
      howTo: {
        intro: 'Fill in your sex, waist and hip measurements.',
        steps: [
          { name: 'Choose your sex', text: 'The WHO risk cutoff is different for men (0.90) and women (0.85).' },
          { name: 'Measure your waist', text: 'At the narrowest point of your torso, or at the navel if there is no clear narrowing, standing relaxed.' },
          { name: 'Measure your hip', text: 'At the widest point around your buttocks.' },
          { name: 'Read your ratio', text: 'The headline is waist divided by hip. Below it is whether that ratio is below or at/above the WHO cutoff for your sex.' },
          { name: 'Check the chart', text: 'The bars put your ratio next to the cutoff that applies to you.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Waist-to-hip ratio is a straight division; only the unit needs to match between the two measurements.',
        expression: 'WHR = waist ÷ hip\nSubstantially increased risk: WHR ≥ 0.90 (men) or WHR ≥ 0.85 (women)',
        terms: [
          { symbol: 'waist, hip', meaning: 'Circumferences in the same unit (inches or centimeters both work, as long as they match).' },
          { symbol: 'WHR', meaning: 'Waist-to-hip ratio, a unitless number.' }
        ],
        note: 'Estimate only, not medical advice. WHR is one piece of information among many a doctor would use to assess cardiometabolic risk, alongside blood pressure, blood sugar, cholesterol and family history.'
      },
      workedExample: {
        intro: 'A man measures a 38 in waist and a 40 in hip. What is his waist-to-hip ratio, and where does it sit against the WHO cutoff?',
        rows: [
          { label: 'WHR (38 ÷ 40)', value: '0.95' },
          { label: 'WHO cutoff for men', value: '0.90' },
          { label: 'Compare (0.95 ≥ 0.90?)', value: 'Yes' }
        ],
        result: 'WHR = 0.95 — at or above the WHO cutoff (substantially increased risk) for men',
        explanation: 'A woman with a 32 in waist and a 40 in hip has a WHR of 32 ÷ 40 = 0.80, below the 0.85 cutoff for women. The same 8-inch waist-to-hip gap reads differently depending on the actual hip size and the sex-specific cutoff, which is why WHR is always compared against a sex-specific threshold rather than one shared number.'
      },
      watchOut: [
        { title: 'Measure the same way every time', body: 'Results depend on exactly where you place the tape. Measuring at the same time of day, over bare skin or thin clothing, without pulling the tape tight, keeps readings comparable over time.' },
        { title: 'A single cutoff, not a graded scale', body: 'The WHO 2008 consultation defined one threshold per sex for "substantially increased risk," not a multi-band scale like BMI\'s categories. A ratio just under the cutoff is not automatically "safe," and a ratio just over it is not a diagnosis.' },
        { title: 'Height is not part of this ratio', body: 'WHR does not account for how tall someone is, the way a waist-to-height ratio does. Two people with the same WHR can have very different waist circumferences in absolute terms.' },
        { title: 'Not validated for every population and life stage', body: 'The WHO report notes the evidence behind these cutoffs comes mostly from adult, non-pregnant populations. It does not apply during pregnancy, and risk associations can vary somewhat by ethnicity.' },
        { title: 'Estimate only, not medical advice', body: 'WHR is a screening indicator, not a diagnosis. Talk to a doctor about your cardiometabolic risk rather than relying on this ratio alone.' }
      ],
      references: [
        { label: 'World Health Organization, Waist Circumference and Waist-Hip Ratio: Report of a WHO Expert Consultation, Geneva, 8–11 December 2008', url: 'https://iris.who.int/handle/10665/44583' },
        { label: 'Grundy SM, Cleeman JI, Daniels SR, et al., Diagnosis and management of the metabolic syndrome: an AHA/NHLBI Scientific Statement, Circulation 112 (2005): 2735–2752 (independently states the same 0.90/0.85 WHR cutoffs)', url: 'https://pubmed.ncbi.nlm.nih.gov/16157765/' }
      ]
    },
    inputs: [
      { id: 'sex', label: 'Sex', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: SEX_OPTIONS },
      { id: 'waist', label: 'Waist circumference', type: 'number', placeholder: '38', defaultValue: 38, step: 0.5, min: 1, dimension: 'length', unit: 'in' },
      { id: 'hip', label: 'Hip circumference', type: 'number', placeholder: '40', defaultValue: 40, step: 0.5, min: 1, dimension: 'length', unit: 'in' }
    ],
    seo: {
      title: 'Waist-to-Hip Ratio Calculator – WHO Cutoffs',
      description: 'Calculate your waist-to-hip ratio and compare it with the WHO cutoffs for substantially increased metabolic risk: 0.90 for men and 0.85 for women.',
      faq: [
        { question: 'How do you calculate waist-to-hip ratio?', answer: 'Divide waist circumference by hip circumference, measured in the same unit. A 38 in waist and a 40 in hip give 38 ÷ 40 = 0.95.' },
        { question: 'What is a healthy waist-to-hip ratio?', answer: 'The World Health Organization\'s 2008 expert consultation treats a WHR of 0.90 or more in men, or 0.85 or more in women, as substantially increased risk of metabolic complications. Ratios below those cutoffs are not classified as high risk by this standard.' },
        { question: 'Is waist-to-hip ratio better than BMI?', answer: 'They measure different things. BMI compares weight to height and says nothing about where fat is distributed; WHR describes body shape. Some research finds WHR tracks cardiometabolic risk better than BMI at a given weight, but the two are meant to complement each other, not replace one another.' },
        { question: 'Why does the cutoff differ for men and women?', answer: 'Women naturally carry more fat around the hips and thighs for reproductive and hormonal reasons, so a given ratio does not carry the same risk for both sexes. The WHO set separate cutoffs — 0.90 for men, 0.85 for women — to reflect that.' },
        { question: 'Where exactly do I measure my waist and hip?', answer: 'Waist at the narrowest point of your torso (or the navel if there is no clear narrowing); hip at the widest point around your buttocks. Measure standing, without pulling the tape tight enough to compress the skin.' },
        { question: 'Does waist-to-hip ratio apply to everyone?', answer: 'The WHO cutoffs were developed mainly from adult, non-pregnant population data. They are not meant to be applied during pregnancy, and the report itself notes that the strength of the risk association can vary somewhat between ethnic groups.' }
      ]
    },
    compute(values) {
      const whr = values.waist / values.hip;
      const cutoff = values.sex === 1 ? 0.85 : 0.90;
      const riskLevel = whr >= cutoff ? 1 : 0;
      return { whr, riskLevel };
    }
  },
  {
    id: 'blood-alcohol-content-calculator',
    group: 'Body & Nutrition',
    category: 'health',
    glyph: 'BAC',
    updatedAt: '2026-11-16',
    aliases: ['bac calculator', 'blood alcohol calculator', 'widmark formula calculator', 'how many drinks to 0.08', 'blood alcohol content estimator'],
    related: ['tdee-calculator', 'water-intake-calculator', 'bmi-calculator'],
    title: 'Blood Alcohol Content Calculator',
    description: 'Estimate blood alcohol content from drinks, body weight, sex and time using the Widmark formula. An estimate only — never use it to decide whether it is safe to drive. Call a cab or rideshare instead.',
    example: 'A 180 lb man who has had 3 standard drinks over 2 hours has an estimated BAC of about 0.05%. This is a rough estimate, not a measurement — it is never a basis for deciding whether to drive.',
    breakdown: {
      headline: 'bac',
      headlineLabel: 'Estimated blood alcohol content',
      outputs: [
        { id: 'bac', label: 'Estimated blood alcohol content', format: 'percent' },
        { id: 'hoursToZero', label: 'Estimated hours until back to 0.00%', format: 'number', dimension: 'time', unit: 'hr' }
      ],
      groups: [
        { title: 'About you', inputs: ['sex', 'weight'] },
        { title: 'Drinking', inputs: ['drinks', 'hours'] }
      ]
    },
    content: {
      lastReviewed: '2026-11-16',
      concept: {
        title: 'Important: this is an estimate only, never a safety check',
        paragraphs: [
          'This calculator gives a rough, formula-based estimate of blood alcohol content (BAC). It cannot measure your actual BAC, it cannot tell you whether you are impaired, and it must never be used to decide whether it is safe to drive, operate machinery, or do anything else that requires sobriety. If you have been drinking, do not drive: call a taxi, use a rideshare app, use public transit, or ask a sober friend for a ride.',
          'In the 1920s, Swedish physiologist Erik Widmark developed a formula relating the alcohol you drink, your body weight and a "distribution ratio" to an estimated BAC, declining over time as the liver clears it. It remains the basis for most BAC estimators, including this one, and for some forensic calculations, even though it is a simplification of a more complex biological process.',
          'The formula needs a distribution ratio because alcohol spreads through the water in your body, not through fat. Widmark\'s commonly used average ratios are about 0.68 for men and 0.55 for women, reflecting that women typically have a higher proportion of body fat and less body water than men of the same weight — so the same amount of alcohol produces a higher BAC in a woman than in a man of equal weight. A 1981 update by Watson, Watson and Batt refined the formula by estimating body water more individually, which is why real forensic calculations vary the ratio by height, weight and age rather than using one fixed number per sex.',
          'The liver removes alcohol at a fairly steady rate once it is in the bloodstream, commonly estimated at about 0.015% BAC per hour on average — but individual rates vary, roughly 0.010% to 0.020% per hour, depending on genetics, liver health, food and other factors this calculator cannot know.'
        ]
      },
      howTo: {
        intro: 'Fill in your sex, weight, number of standard drinks and hours since you started drinking.',
        steps: [
          { name: 'Choose your sex', text: 'The formula uses a different distribution ratio for men and women.' },
          { name: 'Enter your weight', text: 'Body weight affects how diluted the alcohol becomes in your system.' },
          { name: 'Enter the number of standard drinks', text: 'One US standard drink is 14 g of pure alcohol: a 12 oz regular beer (5% ABV), a 5 oz glass of wine (12% ABV), or 1.5 oz of 80-proof spirits (40% ABV), per NIAAA.' },
          { name: 'Enter hours since you started drinking', text: 'The formula subtracts an elimination rate for every hour that has passed.' },
          { name: 'Read the estimate, then act safely', text: 'The headline is a rough BAC estimate. Whatever it shows, if you have had any alcohol, do not drive — arrange another way home.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored. This page cannot and does not assess whether you are fit to drive.'
      },
      formula: {
        intro: 'The Widmark formula estimates peak BAC from alcohol consumed and body weight, then subtracts what the liver has cleared since.',
        expression: 'BAC (%) = (alcohol in grams × 100) ÷ (body weight in grams × r) − (0.015 × hours)\nr ≈ 0.68 (men), 0.55 (women)\nStandard drink = 14 g pure alcohol (NIAAA)',
        terms: [
          { symbol: 'alcohol in grams', meaning: 'Standard drinks × 14 g.' },
          { symbol: 'r', meaning: 'Widmark distribution ratio: a commonly used average of about 0.68 for men and 0.55 for women.' },
          { symbol: '0.015', meaning: 'Average alcohol elimination rate, in %BAC per hour; individual rates commonly range from about 0.010 to 0.020.' }
        ],
        note: 'ESTIMATE ONLY — NOT A SAFETY OR LEGAL MEASUREMENT. This formula ignores food, medications, genetics, liver health and many other real factors, and can be off by a significant margin in either direction for a given person. Never use this number, or any calculator\'s number, to decide whether it is safe to drive. If you have had any alcohol, arrange a ride instead of driving.'
      },
      workedExample: {
        intro: 'A 180 lb man has 3 standard drinks over 2 hours. What does the Widmark formula estimate?',
        rows: [
          { label: 'Alcohol consumed (3 × 14 g)', value: '42 g' },
          { label: 'Body weight (180 lb × 453.592 g/lb)', value: '81,647 g' },
          { label: 'Distribution ratio (men)', value: '0.68' },
          { label: 'Peak estimate (42 × 100 ÷ (81,647 × 0.68))', value: '0.0756%' },
          { label: 'Eliminated in 2 hours (0.015 × 2)', value: '0.030%' },
          { label: 'Estimated BAC (0.0756 − 0.030)', value: '0.0456% ≈ 0.05%' }
        ],
        result: 'Estimated BAC ≈ 0.05% — a rough estimate, not a measurement, and never a basis for deciding to drive',
        explanation: 'A woman of 140 lb with the same 3 drinks over 2 hours uses r = 0.55 instead of 0.68 and a smaller body weight, giving a higher estimate of about 0.0903% (≈0.09%) — nearly double the man\'s figure, illustrating why sex and body size change the result so much. A 200 lb man having 4 drinks over 3 hours comes out to about 0.0458% (≈0.05%), a similar headline number reached by a completely different drinking pattern — which is exactly why no single number like this should be trusted as a safety check.'
      },
      watchOut: [
        { title: 'Never use this to decide whether to drive', body: 'This is the single most important thing to take from this page. Any amount of alcohol can impair driving, judgment and reaction time — often before a formula like this shows a "high" number. If you have had any alcohol, call a cab, use a rideshare, take transit, or ask a sober friend. Do not drive, and do not let a calculator talk you into thinking you are fine.' },
        { title: 'Real BAC varies by far more than this formula knows', body: 'Food in your stomach slows alcohol absorption; medications, liver conditions, genetics, dehydration and how fast you drink all change your real BAC in ways this simple formula cannot see. Breathalyzers and blood tests measure; this calculator only estimates.' },
        { title: 'The elimination rate is a population average', body: 'Individual rates commonly range from about 0.010 to 0.020 %BAC per hour, a two-fold spread. Someone metabolizing more slowly than average will have a real BAC well above what this calculator shows for the same inputs.' },
        { title: 'Being "under 0.08%" does not mean "safe to drive"', body: 'In most US states, 0.08% is the legal limit for driving, but measurable impairment of judgment, coordination and reaction time can begin at much lower levels. Legal and safe are not the same thing.' },
        { title: 'ESTIMATE ONLY, NOT A SAFETY OR MEDICAL TOOL', body: 'If you or someone else has symptoms of alcohol poisoning — confusion, vomiting, seizures, slow or irregular breathing, bluish skin, or being unable to wake up — call emergency services immediately. Do not wait to see what a calculator says.' }
      ],
      references: [
        { label: 'National Institute on Alcohol Abuse and Alcoholism (NIAAA), Alcohol\'s Effects on Health: Drinking Patterns (standard drink = 14 g pure alcohol)', url: 'https://www.niaaa.nih.gov/alcohols-effects-health/alcohol-drinking-patterns' },
        { label: 'Watson PE, Watson ID, Batt RD, Prediction of blood alcohol concentrations in human subjects: updating the Widmark equation, Journal of Studies on Alcohol 42 (1981): 547–556', url: 'https://pubmed.ncbi.nlm.nih.gov/7289599/' }
      ]
    },
    inputs: [
      { id: 'sex', label: 'Sex', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: SEX_OPTIONS },
      { id: 'weight', label: 'Body weight', type: 'number', placeholder: '180', defaultValue: 180, step: 1, min: 1, dimension: 'mass', unit: 'lb' },
      { id: 'drinks', label: 'Standard drinks', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'hours', label: 'Hours since you started drinking', type: 'number', placeholder: '2', defaultValue: 2, step: 0.25, min: 0, dimension: 'time', unit: 'hr' }
    ],
    seo: {
      title: 'Blood Alcohol Content Calculator – Estimate Only',
      description: 'Estimate BAC from drinks, weight, sex and time with the Widmark formula. An estimate only — never use it to decide whether it is safe to drive.',
      faq: [
        { question: 'Can I use this calculator to decide if I am safe to drive?', answer: 'No. Never. This is a rough formula-based estimate, not a measurement of your actual BAC or your impairment. If you have had any alcohol, do not drive — call a cab, use a rideshare, take transit, or ask a sober friend for a ride, regardless of what any calculator shows.' },
        { question: 'How is BAC calculated with the Widmark formula?', answer: 'Grams of alcohol consumed (standard drinks × 14 g) divided by body weight in grams times a distribution ratio (about 0.68 for men, 0.55 for women), times 100 for a percentage, minus about 0.015% for every hour since you started drinking.' },
        { question: 'What counts as one standard drink?', answer: 'In the US, per NIAAA, one standard drink has 14 grams of pure alcohol: a 12 oz regular beer (5% ABV), a 5 oz glass of wine (12% ABV), or 1.5 oz of 80-proof liquor (40% ABV). A strong craft beer or a large pour of wine can be more than one standard drink.' },
        { question: 'Why do men and women get different estimates for the same number of drinks?', answer: 'The formula uses a different distribution ratio for each sex (about 0.68 for men, 0.55 for women) because women typically have less body water relative to weight, so the same amount of alcohol is less diluted and produces a higher estimated BAC.' },
        { question: 'How long does it take for BAC to reach zero?', answer: 'At the commonly used average elimination rate of 0.015% per hour, a peak estimate of 0.075% would take about 5 hours to reach zero. Real elimination rates vary roughly between 0.010% and 0.020% per hour between individuals, so this is only a rough guide, not a countdown you can rely on.' },
        { question: 'Is 0.08% BAC the point where it becomes unsafe to drive?', answer: 'No. 0.08% is the legal limit for driving in most US states, but it is a legal line, not a safety line — measurable impairment to judgment, coordination and reaction time can start at much lower levels, and any amount of alcohol increases crash risk.' }
      ]
    },
    compute(values) {
      const weightG = values.weight * 453.59237;
      const r = values.sex === 1 ? 0.55 : 0.68;
      const alcoholG = values.drinks * 14;
      const raw = weightG > 0 ? (alcoholG * 100) / (weightG * r) : NaN;
      const eliminated = 0.015 * values.hours;
      const bac = Math.max(0, raw - eliminated);
      const hoursToZero = raw > 0 ? raw / 0.015 : 0;
      return { bac, hoursToZero };
    }
  }
];
