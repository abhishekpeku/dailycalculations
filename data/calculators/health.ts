import type { CalculatorConfig } from './types.ts';

export const healthCalculators: CalculatorConfig[] = [
  {
    id: 'bmi-calculator',
    category: 'health',
    updatedAt: '2026-09-10',
    aliases: ['body mass index calculator', 'bmi calculator for men', 'bmi calculator for women', 'bmi chart calculator', 'healthy weight calculator'],
    related: ['calorie-calculator', 'tdee-calculator', 'pounds-to-kilograms-converter'],
    title: 'BMI Calculator',
    description: 'Calculate body mass index using pounds and inches with familiar defaults.',
    example: 'Estimate BMI for someone who is 5 ft 9 in tall and weighs 170 lbs.',
    inputs: [
      { id: 'weight', label: 'Weight (lb)', type: 'number', placeholder: '170', defaultValue: 170, step: 1, min: 0 },
      { id: 'height', label: 'Height (in)', type: 'number', placeholder: '69', defaultValue: 69, step: 1, min: 0 }
    ],
    seo: {
      title: 'BMI Calculator',
      description: 'Calculate your body mass index (BMI) using weight in pounds and height in inches. See instantly which standard health category — underweight to obese — your result falls into.',
      faq: [
        { question: 'What is BMI?', answer: 'BMI is body mass index, a ratio of weight to height used to screen for healthy body weight in adults.' },
        { question: 'How do I use this BMI calculator?', answer: 'Enter weight in pounds and height in inches to calculate your BMI using the standard formula.' }
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
