import type { CalculatorConfig } from './types.ts';

export const healthCalculators: CalculatorConfig[] = [
  {
    id: 'bmi-calculator',
    category: 'health',
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
    category: 'health',
    updatedAt: '2026-09-10',
    aliases: ['daily water calculator', 'hydration calculator', 'how much water should i drink'],
    related: ['calorie-calculator', 'tdee-calculator', 'bmi-calculator', 'gallons-to-liters-converter'],
    title: 'Water Intake Calculator',
    description: 'Estimate daily water needs based on body weight and activity level.',
    example: 'Calculate water intake for a 150 lb person with moderate activity.',
    inputs: [
      { id: 'weight', label: 'Weight (lb)', type: 'number', placeholder: '150', defaultValue: 150, step: 1, min: 0 },
      { id: 'activityLevel', label: 'Activity level (minutes/day)', type: 'number', placeholder: '30', defaultValue: 30, step: 5, min: 0 }
    ],
    seo: {
      title: 'Water Intake Calculator',
      description: 'Estimate how much water you should drink each day based on your body weight and daily activity minutes. Get a personalized recommendation in both ounces and liters.',
      faq: [
        { question: 'How much water should I drink?', answer: 'This tool estimates daily intake based on body weight and minutes of activity.' },
        { question: 'Does activity affect water needs?', answer: 'Yes, extra activity increases recommended hydration.' }
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
    category: 'health',
    updatedAt: '2026-09-10',
    aliases: ['calories calculator', 'daily calorie needs calculator', 'calorie intake calculator', 'weight loss calorie calculator'],
    related: ['tdee-calculator', 'bmi-calculator', 'running-pace-calculator'],
    title: 'Calorie Calculator',
    description: 'Estimate daily calorie needs based on weight, height, age, and activity level.',
    example: 'Calculate daily calories for a 30-year-old, 170 lb, 5 ft 9 in person with moderate activity.',
    inputs: [
      { id: 'weight', label: 'Weight (lb)', type: 'number', placeholder: '170', defaultValue: 170, step: 1, min: 0 },
      { id: 'height', label: 'Height (in)', type: 'number', placeholder: '69', defaultValue: 69, step: 1, min: 0 },
      { id: 'age', label: 'Age (years)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'activityFactor', label: 'Activity factor (1.2 = sedentary, 1.375 = light, 1.55 = moderate, 1.725 = active)', type: 'number', placeholder: '1.55', defaultValue: 1.55, step: 0.025, min: 1 }
    ],
    seo: {
      title: 'Calorie Calculator',
      description: 'Estimate your daily calorie needs using the Mifflin-St Jeor equation. Enter your weight, height, age, and activity level for maintenance, weight-loss, and weight-gain targets.',
      faq: [
        { question: 'How are daily calories calculated?', answer: 'This tool uses the Mifflin-St Jeor formula to find your basal metabolic rate, then multiplies by your activity factor.' },
        { question: 'What activity factor should I use?', answer: 'Use 1.2 for sedentary, 1.375 for light activity, 1.55 for moderate, and 1.725 for active lifestyles.' }
      ]
    },
    compute(values) {
      const weightKg = values.weight * 0.453592;
      const heightCm = values.height * 2.54;
      const bmr = 10 * weightKg + 6.25 * heightCm - 5 * values.age + 5;
      const maintenanceCalories = bmr * values.activityFactor;
      const weightLossCalories = maintenanceCalories - 500;
      const weightGainCalories = maintenanceCalories + 500;
      return { maintenanceCalories, weightLossCalories, weightGainCalories };
    }
  },
  {
    id: 'tdee-calculator',
    category: 'health',
    updatedAt: '2026-09-10',
    aliases: ['total daily energy expenditure calculator', 'maintenance calories calculator', 'tdee and bmr calculator'],
    related: ['calorie-calculator', 'bmi-calculator', 'running-pace-calculator'],
    redirectFrom: ['bmr-calculator'],
    title: 'TDEE Calculator',
    description: 'Calculate total daily energy expenditure based on BMR and activity level.',
    example: 'Find the TDEE for a 25-year-old, 155 lb, 5 ft 6 in person with light activity.',
    inputs: [
      { id: 'weight', label: 'Weight (lb)', type: 'number', placeholder: '155', defaultValue: 155, step: 1, min: 0 },
      { id: 'height', label: 'Height (in)', type: 'number', placeholder: '66', defaultValue: 66, step: 1, min: 0 },
      { id: 'age', label: 'Age (years)', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 1 },
      { id: 'activityFactor', label: 'Activity factor (1.2 = sedentary, 1.375 = light, 1.55 = moderate, 1.725 = active)', type: 'number', placeholder: '1.375', defaultValue: 1.375, step: 0.025, min: 1 }
    ],
    seo: {
      title: 'TDEE Calculator',
      description: 'Calculate your total daily energy expenditure (TDEE) using the Mifflin-St Jeor BMR formula and an activity multiplier. Use it to set a calorie target for your weight goals.',
      faq: [
        { question: 'What is TDEE?', answer: 'TDEE stands for Total Daily Energy Expenditure — the total calories your body burns per day including all activity.' },
        { question: 'How is TDEE different from BMR?', answer: 'BMR is the calories burned at rest; TDEE multiplies BMR by your activity level to account for exercise and daily movement.' }
      ]
    },
    compute(values) {
      const weightKg = values.weight * 0.453592;
      const heightCm = values.height * 2.54;
      const bmr = 10 * weightKg + 6.25 * heightCm - 5 * values.age + 5;
      const tdee = bmr * values.activityFactor;
      const cuttingCalories = tdee - 500;
      const bulkingCalories = tdee + 300;
      return { tdee, bmr, cuttingCalories, bulkingCalories };
    }
  },
  {
    id: 'running-pace-calculator',
    category: 'health',
    updatedAt: '2026-09-10',
    aliases: ['pace per mile calculator', 'marathon pace calculator', 'race time calculator', 'min per km calculator'],
    related: ['calorie-calculator', 'miles-to-kilometers-converter', 'tdee-calculator', 'sleep-time-calculator'],
    title: 'Running Pace Calculator',
    description: 'Calculate your running pace, finish time, or distance. Supports miles and kilometers.',
    example: 'Find the pace needed to finish a 5K in 25 minutes.',
    inputs: [
      { id: 'distanceMiles', label: 'Distance (miles)', type: 'number', placeholder: '3.1', defaultValue: 3.1, step: 0.1, min: 0.1 },
      { id: 'totalMinutes', label: 'Total time (minutes)', type: 'number', placeholder: '25', defaultValue: 25, step: 0.5, min: 0.5 }
    ],
    seo: {
      title: 'Running Pace Calculator – Pace, Time, and Distance',
      description: 'Calculate running pace per mile, finish time for races, and distance covered. Works for 5K, 10K, half marathon, and marathon.',
      faq: [
        { question: 'What is a good running pace?', answer: 'Average recreational runners finish a mile in 9–12 minutes. Competitive runners aim for sub-8 min/mile. Elite marathoners run under 5 min/mile.' },
        { question: 'What pace do I need for common race distances?', answer: 'For a 30-min 5K you need 9:39/mile. For a 2-hour half marathon: 9:09/mile. For a 4-hour marathon: 9:09/mile.' },
        { question: 'How do I convert pace to speed?', answer: 'Divide 60 by your pace in minutes per mile to get miles per hour. An 8 min/mile pace equals 7.5 mph.' }
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
    category: 'health',
    updatedAt: '2026-09-10',
    aliases: ['due date calculator', 'conception date calculator', 'pregnancy week calculator', 'edd calculator'],
    related: ['age-calculator', 'date-difference-calculator', 'bmi-calculator', 'water-intake-calculator'],
    title: 'Pregnancy Due Date Calculator',
    description: 'Estimate your due date using Naegele\'s rule (LMP method) or IVF transfer date. Also calculates current weeks and trimester.',
    example: 'Find the due date for a pregnancy with last menstrual period starting March 1, 2026.',
    timeDependent: true,
    inputs: [
      { id: 'lmpYear', label: 'LMP year (last menstrual period)', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 2020 },
      { id: 'lmpMonth', label: 'LMP month (1–12)', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 1 },
      { id: 'lmpDay', label: 'LMP day (1–31)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'cycleLength', label: 'Average cycle length (days, default 28)', type: 'number', placeholder: '28', defaultValue: 28, step: 1, min: 20 }
    ],
    seo: {
      title: 'Pregnancy Due Date Calculator – Naegele\'s Rule',
      description: 'Calculate your estimated due date using the last menstrual period (LMP) and Naegele\'s rule. Shows current gestational age in weeks and trimester.',
      faq: [
        { question: 'How is the due date calculated?', answer: 'Naegele\'s rule: add 280 days (40 weeks) to the first day of your last menstrual period. For cycles other than 28 days, adjust by (cycle length − 28) days.' },
        { question: 'What are the trimesters?', answer: 'First trimester: weeks 1–12. Second trimester: weeks 13–26. Third trimester: weeks 27–40.' },
        { question: 'How accurate is the due date?', answer: 'Only about 5% of babies are born exactly on their due date. Most births occur within 2 weeks before or after. An ultrasound in the first trimester is the most accurate dating method.' }
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
      const trimester = gestationalWeeks <= 12 ? 1 : gestationalWeeks <= 26 ? 2 : 3;
      return { gestationalWeeks, daysRemaining, trimester, gestationalDays };
    }
  }
];
