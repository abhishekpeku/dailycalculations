export type CalculatorCategory = {
  id: string;
  title: string;
  description: string;
};

export type CalculatorInput = {
  id: string;
  label: string;
  type: 'number' | 'percent' | 'currency';
  placeholder: string;
  defaultValue: number;
  step?: number;
  min?: number;
};

export type CalculatorFaq = {
  question: string;
  answer: string;
};

export type CalculatorConfig = {
  id: string;
  category: string;
  title: string;
  description: string;
  example: string;
  inputs: CalculatorInput[];
  seo: {
    title: string;
    description: string;
    faq: CalculatorFaq[];
  };
  compute: (values: CalculatorInputValues) => Record<string, number>;
};

export type CalculatorClientConfig = Omit<CalculatorConfig, 'compute'>;

export type CalculatorInputValues = Record<string, number>;

export const categories: CalculatorCategory[] = [
  { id: 'finance', title: 'Finance', description: 'Mortgage, loans, savings, and money tools.' },
  { id: 'health', title: 'Health', description: 'BMI, hydration, and wellness calculators.' },
  { id: 'measurements', title: 'Measurements', description: 'Common conversions between imperial and metric units.' },
  { id: 'taxes', title: 'Taxes', description: 'Sales tax, tipping, and budgeting tools.' },
  { id: 'auto', title: 'Auto', description: 'Car payments, fuel costs, and driving calculators.' },
  { id: 'home', title: 'Home', description: 'Household, price-per-unit, and property calculators.' },
  { id: 'time', title: 'Time & Date', description: 'Age, work hours, and date difference tools.' },
  { id: 'education', title: 'Education', description: 'GPA, grade, and academic calculators.' }
];

export const calculators: CalculatorConfig[] = [
  {
    id: 'mortgage-calculator',
    category: 'finance',
    title: 'Mortgage Calculator',
    description: 'Estimate monthly mortgage payments for home loans with APR and term options.',
    example: 'Calculate a 30-year mortgage payment for a $350,000 home with 5% APR and 20% down payment.',
    inputs: [
      { id: 'loanAmount', label: 'Loan amount', type: 'currency', placeholder: '350000', defaultValue: 350000, step: 1000, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.01, min: 0 },
      { id: 'years', label: 'Loan term (years)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '70000', defaultValue: 70000, step: 500, min: 0 }
    ],
    seo: {
      title: 'Mortgage Calculator',
      description: 'Calculate monthly mortgage payments for home loans. Includes APR, loan term, down payment, and principal.',
      faq: [
        { question: 'How do I calculate my mortgage payment?', answer: 'Enter your loan amount, APR, loan term, and down payment to estimate the monthly payment for your loan.' },
        { question: 'Does this calculator use standard loan conventions?', answer: 'Yes. It uses annual percentage rate (APR) and common mortgage terms like 15 or 30 years.' }
      ]
    },
    compute(values) {
      const principal = Math.max(0, values.loanAmount - values.downPayment);
      const monthlyRate = values.interestRate / 100 / 12;
      const months = Math.max(1, values.years * 12);
      const payment = monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const total = payment * months;
      const interest = total - principal;
      return { monthlyPayment: payment, totalCost: total, totalInterest: interest, loanPrincipal: principal };
    }
  },
  {
    id: 'loan-calculator',
    category: 'finance',
    title: 'Loan Calculator',
    description: 'Compare monthly payments across loan amounts, APR, and repayment periods.',
    example: 'Estimate payments for a $20,000 loan at 6% APR over 5 years.',
    inputs: [
      { id: 'loanAmount', label: 'Loan amount', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 100, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.01, min: 0 },
      { id: 'years', label: 'Loan term (years)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 }
    ],
    seo: {
      title: 'Loan Calculator',
      description: 'Estimate monthly payments for loans. Compare payment schedules based on APR and term length.',
      faq: [
        { question: 'How do I estimate loan payments?', answer: 'Enter the loan amount, APR, and loan term to calculate the monthly payment.' },
        { question: 'Can I use this for personal or auto loans?', answer: 'Yes, it works for any fixed-rate loan with the values you provide.' }
      ]
    },
    compute(values) {
      const monthlyRate = values.interestRate / 100 / 12;
      const months = Math.max(1, values.years * 12);
      const payment = monthlyRate === 0
        ? values.loanAmount / months
        : (values.loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const total = payment * months;
      const interest = total - values.loanAmount;
      return { monthlyPayment: payment, totalCost: total, totalInterest: interest };
    }
  },
  {
    id: 'compound-interest-calculator',
    category: 'finance',
    title: 'Compound Interest Calculator',
    description: 'Estimate future savings with compound interest and optional monthly contributions.',
    example: 'See how $5,000 grows at 4% APR with $200 monthly contributions over 10 years.',
    inputs: [
      { id: 'principal', label: 'Starting balance', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 100, min: 0 },
      { id: 'annualRate', label: 'Annual interest rate', type: 'percent', placeholder: '4', defaultValue: 4, step: 0.01, min: 0 },
      { id: 'years', label: 'Years invested', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'monthlyContribution', label: 'Monthly contribution', type: 'currency', placeholder: '200', defaultValue: 200, step: 10, min: 0 }
    ],
    seo: {
      title: 'Compound Interest Calculator',
      description: 'Project compound interest growth with monthly contributions and annual return assumptions.',
      faq: [
        { question: 'What is compound interest?', answer: 'Compound interest is interest earned on both the original principal and accumulated interest.' },
        { question: 'Can I model monthly contributions?', answer: 'Yes, add a monthly contribution amount to see how your balance grows over time.' }
      ]
    },
    compute(values) {
      const monthlyRate = values.annualRate / 100 / 12;
      const months = Math.max(0, values.years * 12);
      const compoundPrincipal = values.principal * Math.pow(1 + monthlyRate, months);
      const contributionTotal = values.monthlyContribution * months;
      const futureValue = values.monthlyContribution === 0
        ? compoundPrincipal
        : compoundPrincipal + values.monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      const totalInterest = futureValue - values.principal - contributionTotal;
      return { futureValue, totalInterest, contributionTotal };
    }
  },
  {
    id: 'sales-tax-calculator',
    category: 'taxes',
    title: 'Sales Tax Calculator',
    description: 'Compute total cost with sales tax and compare pre-tax versus final price.',
    example: 'Calculate the final total for a $125 purchase with 8.25% sales tax.',
    inputs: [
      { id: 'purchaseAmount', label: 'Purchase amount', type: 'currency', placeholder: '125', defaultValue: 125, step: 1, min: 0 },
      { id: 'salesTaxRate', label: 'Sales tax rate', type: 'percent', placeholder: '8.25', defaultValue: 8.25, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Sales Tax Calculator',
      description: 'Quickly calculate sales tax totals. Enter your purchase amount and sales tax rate for an instant final price.',
      faq: [
        { question: 'How do I calculate sales tax?', answer: 'Multiply the purchase amount by the sales tax rate, then add the result to the purchase amount for the total cost.' },
        { question: 'Can I use this tool with different tax rates?', answer: 'Yes, it works for any sales tax rate you enter, including combined local rates.' }
      ]
    },
    compute(values) {
      const tax = values.purchaseAmount * (values.salesTaxRate / 100);
      const total = values.purchaseAmount + tax;
      return { taxAmount: tax, totalAmount: total };
    }
  },
  {
    id: 'tip-calculator',
    category: 'taxes',
    title: 'Tip Calculator',
    description: 'Calculate tip amount, total cost, and per-person share for dining bills.',
    example: 'Split a $72 dinner with an 18% tip across 3 people.',
    inputs: [
      { id: 'billAmount', label: 'Bill amount', type: 'currency', placeholder: '72', defaultValue: 72, step: 1, min: 0 },
      { id: 'tipRate', label: 'Tip rate', type: 'percent', placeholder: '18', defaultValue: 18, step: 0.25, min: 0 },
      { id: 'splitCount', label: 'Split among', type: 'number', placeholder: '3', defaultValue: 1, step: 1, min: 1 }
    ],
    seo: {
      title: 'Tip Calculator',
      description: 'Quickly calculate tip totals and split the bill across multiple people.',
      faq: [
        { question: 'How much should I tip?', answer: 'Multiply the bill amount by the tip rate, then split the total by the number of people if needed.' },
        { question: 'Can this calculator split the bill?', answer: 'Yes, it computes both the total cost and the per-person share.' }
      ]
    },
    compute(values) {
      const tipAmount = values.billAmount * (values.tipRate / 100);
      const totalAmount = values.billAmount + tipAmount;
      const perPerson = totalAmount / Math.max(1, values.splitCount);
      return { tipAmount, totalAmount, perPerson }; 
    }
  },
  {
    id: 'bmi-calculator',
    category: 'health',
    title: 'BMI Calculator',
    description: 'Calculate body mass index using pounds and inches with familiar defaults.',
    example: 'Estimate BMI for someone who is 5 ft 9 in tall and weighs 170 lbs.',
    inputs: [
      { id: 'weight', label: 'Weight (lb)', type: 'number', placeholder: '170', defaultValue: 170, step: 1, min: 0 },
      { id: 'height', label: 'Height (in)', type: 'number', placeholder: '69', defaultValue: 69, step: 1, min: 0 }
    ],
    seo: {
      title: 'BMI Calculator',
      description: 'BMI calculator using pounds and inches. Compare your BMI to standard health categories with instant results.',
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
    title: 'Water Intake Calculator',
    description: 'Estimate daily water needs based on body weight and activity level.',
    example: 'Calculate water intake for a 150 lb person with moderate activity.',
    inputs: [
      { id: 'weight', label: 'Weight (lb)', type: 'number', placeholder: '150', defaultValue: 150, step: 1, min: 0 },
      { id: 'activityLevel', label: 'Activity level (minutes/day)', type: 'number', placeholder: '30', defaultValue: 30, step: 5, min: 0 }
    ],
    seo: {
      title: 'Water Intake Calculator',
      description: 'Estimate daily water intake using weight and exercise level.',
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
    id: 'miles-to-kilometers-converter',
    category: 'measurements',
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
    title: 'Fahrenheit to Celsius Converter',
    description: 'Convert Fahrenheit temperatures to Celsius instantly.',
    example: 'Convert 68°F to Celsius for weather or cooking temperatures.',
    inputs: [
      { id: 'fahrenheit', label: 'Fahrenheit', type: 'number', placeholder: '68', defaultValue: 68, step: 0.1, min: -200 }
    ],
    seo: {
      title: 'Fahrenheit to Celsius Converter',
      description: 'Quickly convert temperatures from Fahrenheit to Celsius for weather, travel, and recipes.',
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
    title: 'Pounds to Kilograms Converter',
    description: 'Convert pounds to kilograms quickly and accurately.',
    example: 'Convert 150 pounds to kilograms for fitness or shipping estimates.',
    inputs: [
      { id: 'pounds', label: 'Pounds', type: 'number', placeholder: '150', defaultValue: 150, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Pounds to Kilograms Converter',
      description: 'Fast conversion from pounds to kilograms for fitness, shipping, and general use.',
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
    title: 'Gallons to Liters Converter',
    description: 'Convert gallons to liters for cooking, fuel, and container volume.',
    example: 'Convert 2.5 gallons to liters for recipe scaling.',
    inputs: [
      { id: 'gallons', label: 'Gallons', type: 'number', placeholder: '2.5', defaultValue: 2.5, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Gallons to Liters Converter',
      description: 'Quickly convert gallons to liters for practical volume and fuel planning.',
      faq: [
        { question: 'How do I convert gallons to liters?', answer: 'Multiply gallons by 3.78541 to get liters.' },
        { question: 'Can I use this for both fuel and recipes?', answer: 'Yes, it works for all gallon to liter conversions.' }
      ]
    },
    compute(values) {
      const liters = values.gallons * 3.78541;
      return { liters };
    }
  },
  {
    id: 'car-payment-calculator',
    category: 'auto',
    title: 'Car Payment Calculator',
    description: 'Estimate monthly car loan payments based on price, APR, and term.',
    example: 'Estimate payments for a $28,000 car with 4.5% APR over 6 years.',
    inputs: [
      { id: 'carPrice', label: 'Car price', type: 'currency', placeholder: '28000', defaultValue: 28000, step: 100, min: 0 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '4000', defaultValue: 4000, step: 100, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate', type: 'percent', placeholder: '4.5', defaultValue: 4.5, step: 0.01, min: 0 },
      { id: 'years', label: 'Loan term (years)', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 1 }
    ],
    seo: {
      title: 'Car Payment Calculator',
      description: 'Calculate monthly car payments for auto loans with price, down payment, APR, and term inputs.',
      faq: [
        { question: 'How do I calculate a car payment?', answer: 'Enter the car price, down payment, APR, and loan term to estimate the monthly cost.' },
        { question: 'Does this calculator handle auto loans?', answer: 'Yes, it works with fixed-rate auto loan values.' }
      ]
    },
    compute(values) {
      const principal = Math.max(0, values.carPrice - values.downPayment);
      const monthlyRate = values.interestRate / 100 / 12;
      const months = Math.max(1, values.years * 12);
      const payment = monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const total = payment * months;
      const interest = total - principal;
      return { monthlyPayment: payment, totalCost: total, totalInterest: interest, loanPrincipal: principal };
    }
  },
  {
    id: 'gas-cost-calculator',
    category: 'auto',
    title: 'Gas Cost Calculator',
    description: 'Estimate fuel cost for a trip using distance, MPG, and fuel price.',
    example: 'Calculate fuel cost for a 180-mile trip at 28 MPG and $3.75 per gallon.',
    inputs: [
      { id: 'distance', label: 'Distance (miles)', type: 'number', placeholder: '180', defaultValue: 180, step: 1, min: 0 },
      { id: 'mpg', label: 'Vehicle MPG', type: 'number', placeholder: '28', defaultValue: 28, step: 0.1, min: 1 },
      { id: 'pricePerGallon', label: 'Fuel price', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Gas Cost Calculator',
      description: 'Estimate the fuel cost of a trip using distance, miles per gallon, and price per gallon.',
      faq: [
        { question: 'How do I estimate gas cost?', answer: 'Divide distance by MPG, then multiply by fuel price to estimate total cost.' },
        { question: 'Is this useful for trip planning?', answer: 'Yes, it helps compare fuel expenses for different trips and vehicles.' }
      ]
    },
    compute(values) {
      const gallons = values.distance / values.mpg;
      const cost = gallons * values.pricePerGallon;
      return { gallons, totalCost: cost };
    }
  },
  {
    id: 'unit-price-calculator',
    category: 'home',
    title: 'Unit Price Calculator',
    description: 'Compare product prices by unit to find the best deal.',
    example: 'Find the cost per ounce for a 24 oz package priced at $5.99.',
    inputs: [
      { id: 'totalCost', label: 'Total cost', type: 'currency', placeholder: '5.99', defaultValue: 5.99, step: 0.01, min: 0 },
      { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '24', defaultValue: 24, step: 0.1, min: 0.1 }
    ],
    seo: {
      title: 'Unit Price Calculator',
      description: 'Calculate the price per unit to compare package sizes and find the best deal.',
      faq: [
        { question: 'What is unit price?', answer: 'Unit price is the cost per single unit of weight or quantity in a product package.' },
        { question: 'How does this help me shop?', answer: 'It makes it easier to compare prices between different package sizes and brands.' }
      ]
    },
    compute(values) {
      const unitPrice = values.totalCost / values.quantity;
      return { unitPrice };
    }
  },
  {
    id: 'age-calculator',
    category: 'time',
    title: 'Age Calculator',
    description: 'Estimate current age using your birth year and the current year.',
    example: 'Calculate age for someone born in 1990 in the current year.',
    inputs: [
      { id: 'birthYear', label: 'Birth year', type: 'number', placeholder: '1990', defaultValue: 1990, step: 1, min: 1900 },
      { id: 'currentYear', label: 'Current year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1900 }
    ],
    seo: {
      title: 'Age Calculator',
      description: 'Quickly estimate your age using your birth year and the current year.',
      faq: [
        { question: 'How do I calculate age?', answer: 'Subtract the birth year from the current year to estimate age.' },
        { question: 'Can I adjust the current year?', answer: 'Yes, change the current year to estimate age in a future year.' }
      ]
    },
    compute(values) {
      const age = Math.max(0, values.currentYear - values.birthYear);
      return { age };
    }
  },
  {
    id: 'gpa-calculator',
    category: 'education',
    title: 'GPA Calculator',
    description: 'Calculate your GPA from course grades and credit hours.',
    example: 'Calculate GPA for a student with an A in a 3-credit course, a B in a 4-credit course, and a C in a 2-credit course.',
    inputs: [
      { id: 'course1Grade', label: 'Course 1 grade points (A=4, B=3, C=2, D=1)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1, min: 0 },
      { id: 'course1Credits', label: 'Course 1 credits', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'course2Grade', label: 'Course 2 grade points', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'course2Credits', label: 'Course 2 credits', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'course3Grade', label: 'Course 3 grade points', type: 'number', placeholder: '2', defaultValue: 2, step: 0.1, min: 0 },
      { id: 'course3Credits', label: 'Course 3 credits', type: 'number', placeholder: '2', defaultValue: 2, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'GPA Calculator',
      description: 'Calculate your GPA using course grade points and credit hours. Supports up to 3 courses.',
      faq: [
        { question: 'How is GPA calculated?', answer: 'Multiply each course grade point by its credit hours, sum the results, then divide by total credits.' },
        { question: 'What grade point scale does this use?', answer: 'It uses the standard 4.0 scale: A=4, B=3, C=2, D=1, F=0.' }
      ]
    },
    compute(values) {
      const totalPoints =
        values.course1Grade * values.course1Credits +
        values.course2Grade * values.course2Credits +
        values.course3Grade * values.course3Credits;
      const totalCredits = values.course1Credits + values.course2Credits + values.course3Credits;
      const gpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
      return { gpa, totalCredits, totalPoints };
    }
  },
  {
    id: 'calorie-calculator',
    category: 'health',
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
      description: 'Estimate daily calorie needs using the Mifflin-St Jeor equation with activity level adjustment.',
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
    id: 'paycheck-calculator',
    category: 'finance',
    title: 'Paycheck Calculator',
    description: 'Estimate net take-home pay after federal tax and standard deductions.',
    example: 'Calculate take-home pay for a $60,000 annual salary paid bi-weekly.',
    inputs: [
      { id: 'annualSalary', label: 'Annual salary', type: 'currency', placeholder: '60000', defaultValue: 60000, step: 1000, min: 0 },
      { id: 'payPeriodsPerYear', label: 'Pay periods per year (bi-weekly = 26, monthly = 12)', type: 'number', placeholder: '26', defaultValue: 26, step: 1, min: 1 },
      { id: 'federalTaxRate', label: 'Federal tax rate', type: 'percent', placeholder: '22', defaultValue: 22, step: 0.5, min: 0 },
      { id: 'stateTaxRate', label: 'State tax rate', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.1, min: 0 },
      { id: 'otherDeductions', label: 'Other deductions per period (401k, health, etc.)', type: 'currency', placeholder: '200', defaultValue: 200, step: 10, min: 0 }
    ],
    seo: {
      title: 'Paycheck Calculator',
      description: 'Estimate your net take-home pay per period after federal tax, state tax, and other deductions.',
      faq: [
        { question: 'How do I calculate my take-home pay?', answer: 'Divide your annual salary by pay periods, then subtract federal tax, state tax, and any other deductions.' },
        { question: 'What deductions can I include?', answer: 'You can include 401k contributions, health insurance premiums, or any other pre/post-tax deductions in the "other deductions" field.' }
      ]
    },
    compute(values) {
      const grossPerPeriod = values.annualSalary / values.payPeriodsPerYear;
      const federalTax = grossPerPeriod * (values.federalTaxRate / 100);
      const stateTax = grossPerPeriod * (values.stateTaxRate / 100);
      const netPay = grossPerPeriod - federalTax - stateTax - values.otherDeductions;
      const annualNetPay = netPay * values.payPeriodsPerYear;
      return { grossPerPeriod, federalTax, stateTax, netPay, annualNetPay };
    }
  },
  {
    id: 'investment-calculator',
    category: 'finance',
    title: 'Investment Calculator',
    description: 'Project investment growth with an initial amount, annual return, and time horizon.',
    example: 'See how a $10,000 investment grows at 7% annual return over 20 years.',
    inputs: [
      { id: 'initialInvestment', label: 'Initial investment', type: 'currency', placeholder: '10000', defaultValue: 10000, step: 500, min: 0 },
      { id: 'annualReturn', label: 'Annual return rate', type: 'percent', placeholder: '7', defaultValue: 7, step: 0.1, min: 0 },
      { id: 'years', label: 'Years invested', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 1 },
      { id: 'annualContribution', label: 'Annual contribution', type: 'currency', placeholder: '1200', defaultValue: 1200, step: 100, min: 0 }
    ],
    seo: {
      title: 'Investment Calculator',
      description: 'Project the future value of your investment using initial amount, annual return, and optional yearly contributions.',
      faq: [
        { question: 'How do I calculate investment growth?', answer: 'Enter your starting amount, expected annual return, investment duration, and any yearly contributions to see projected growth.' },
        { question: 'Does this account for annual contributions?', answer: 'Yes, add a yearly contribution amount to model consistent investing over time.' }
      ]
    },
    compute(values) {
      const r = values.annualReturn / 100;
      const n = Math.max(1, values.years);
      const futureValuePrincipal = values.initialInvestment * Math.pow(1 + r, n);
      const futureValueContributions = r === 0
        ? values.annualContribution * n
        : values.annualContribution * ((Math.pow(1 + r, n) - 1) / r);
      const futureValue = futureValuePrincipal + futureValueContributions;
      const totalContributed = values.initialInvestment + values.annualContribution * n;
      const totalGrowth = futureValue - totalContributed;
      return { futureValue, totalContributed, totalGrowth };
    }
  },
  {
    id: 'tdee-calculator',
    category: 'health',
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
      description: 'Calculate total daily energy expenditure (TDEE) using the Mifflin-St Jeor BMR formula and activity multiplier.',
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
  }
];

export function findCalculator(slug: string) {
  return calculators.find((calculator) => calculator.id === slug);
}

export function findCategoryCalculators(categoryId: string) {
  return calculators.filter((calculator) => calculator.category === categoryId);
}
