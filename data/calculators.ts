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
  { id: 'finance', title: 'Finance', description: 'Mortgage, loans, savings, currency, and money tools.' },
  { id: 'health', title: 'Health', description: 'BMI, hydration, wellness, and fitness calculators.' },
  { id: 'measurements', title: 'Measurements', description: 'Common conversions between imperial and metric units.' },
  { id: 'taxes', title: 'Taxes', description: 'Sales tax, tipping, and budgeting tools.' },
  { id: 'auto', title: 'Auto', description: 'Car payments, fuel, EV, tolls, and commute calculators.' },
  { id: 'home', title: 'Home', description: 'Paint, tile, concrete, wallpaper, and home improvement calculators.' },
  { id: 'time', title: 'Time & Date', description: 'Age, work hours, date difference, sleep, and time zone tools.' },
  { id: 'education', title: 'Education', description: 'GPA, grade, and academic calculators.' },
  { id: 'work', title: 'Work & Career', description: 'Salary, meeting cost, freelance rate, and PTO calculators.' },
  { id: 'shopping', title: 'Shopping', description: 'Discount, unit price, cashback, and EMI calculators.' },
  { id: 'social', title: 'Social & Content', description: 'YouTube earnings, Instagram engagement, and text tools.' },
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
    category: 'shopping',
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
    description: 'Calculate your GPA across a full 2-year masters, 3-year, or 4-year bachelor\'s program. Add courses per semester and see per-semester and cumulative GPA instantly.',
    example: 'Calculate cumulative GPA for a 4-year bachelor\'s degree with different courses each semester.',
    inputs: [
      { id: 'course1Grade', label: 'Course 1 grade points (A=4, B=3, C=2, D=1)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1, min: 0 },
      { id: 'course1Credits', label: 'Course 1 credits', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'course2Grade', label: 'Course 2 grade points', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'course2Credits', label: 'Course 2 credits', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'course3Grade', label: 'Course 3 grade points', type: 'number', placeholder: '2', defaultValue: 2, step: 0.1, min: 0 },
      { id: 'course3Credits', label: 'Course 3 credits', type: 'number', placeholder: '2', defaultValue: 2, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'GPA Calculator – 2, 3 & 4 Year Programs',
      description: 'Calculate semester and cumulative GPA for a 2-year masters, 3-year, or 4-year bachelor\'s program. Add unlimited courses per semester.',
      faq: [
        { question: 'How is GPA calculated?', answer: 'Multiply each course grade point by its credit hours, sum the results across all courses, then divide by total credits.' },
        { question: 'What grade point scale does this use?', answer: 'It uses the standard 4.0 scale: A=4, B=3, C=2, D=1, F=0. Decimals like 3.7 (A-) are also accepted.' },
        { question: 'Can I calculate GPA for a full degree?', answer: 'Yes. Select your program type (2-year masters, 3-year, or 4-year bachelor\'s) and the calculator spans all semesters, showing both per-semester and cumulative GPA.' },
        { question: 'How many courses can I add per semester?', answer: 'As many as you need. Use the "+ Add course" button in any semester to add more, and the × button to remove one.' }
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
    description: 'Estimate your US net take-home pay with full 2025 deduction support — 401(k), HSA, FSA, dependent care, commuter benefits, health premiums, Roth 401(k), and more.',
    example: 'Calculate take-home pay for a $60,000 annual salary paid bi-weekly with 401(k) and health insurance deductions.',
    inputs: [
      { id: 'annualSalary', label: 'Annual salary', type: 'currency', placeholder: '60000', defaultValue: 60000, step: 1000, min: 0 },
      { id: 'payPeriodsPerYear', label: 'Pay periods per year (bi-weekly = 26, monthly = 12)', type: 'number', placeholder: '26', defaultValue: 26, step: 1, min: 1 },
      { id: 'federalTaxRate', label: 'Federal tax rate', type: 'percent', placeholder: '22', defaultValue: 22, step: 0.5, min: 0 },
      { id: 'stateTaxRate', label: 'State tax rate', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.1, min: 0 },
      { id: 'otherDeductions', label: 'Other deductions per period (401k, health, etc.)', type: 'currency', placeholder: '200', defaultValue: 200, step: 10, min: 0 }
    ],
    seo: {
      title: 'Paycheck Calculator – 2025 US Deductions',
      description: 'Calculate your exact net take-home pay with 2025 IRS tax brackets, Social Security, Medicare, 401(k), HSA, FSA, dependent care, commuter benefits, and health insurance.',
      faq: [
        { question: 'How is federal income tax calculated?', answer: 'Federal tax uses the 2025 IRS marginal bracket rates (10%–37%) applied to your taxable income after the standard deduction and pre-tax deductions like 401(k) and HSA.' },
        { question: 'What pre-tax deductions reduce my taxes?', answer: 'Traditional 401(k), HSA, Health Care FSA, Dependent Care FSA, commuter benefits, and employer health/dental/vision premiums all reduce your federal and state taxable income.' },
        { question: 'What is the difference between pre-tax and post-tax deductions?', answer: 'Pre-tax deductions (401k, HSA, FSA) lower your taxable income before taxes are calculated. Post-tax deductions (Roth 401k, life insurance) come out after all taxes are applied.' },
        { question: 'What are the 2025 contribution limits?', answer: 'Traditional 401(k): $23,500 · HSA individual: $4,300, family: $8,550 · Health Care FSA: $3,300 · Dependent Care FSA: $5,000 · Commuter benefit: $325/month.' },
        { question: 'Does this include Social Security and Medicare?', answer: 'Yes. Social Security is 6.2% up to the $176,100 wage base. Medicare is 1.45% on all wages, plus an additional 0.9% on wages above $200,000 (single) or $250,000 (married filing jointly).' }
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
  },
  // ── Time & Date ────────────────────────────────────────────────────────────
  {
    id: 'work-hours-calculator',
    category: 'time',
    title: 'Work Hours Calculator',
    description: 'Calculate total hours worked, overtime, and gross pay for a shift or week. Supports US overtime rules (over 40 hours/week at 1.5×).',
    example: 'Calculate pay for 45 hours worked at $18/hr with standard US overtime.',
    inputs: [
      { id: 'regularHours', label: 'Regular hours worked this week', type: 'number', placeholder: '40', defaultValue: 40, step: 0.25, min: 0 },
      { id: 'overtimeHours', label: 'Overtime hours (over 40/week)', type: 'number', placeholder: '5', defaultValue: 0, step: 0.25, min: 0 },
      { id: 'hourlyRate', label: 'Hourly rate', type: 'currency', placeholder: '18', defaultValue: 18, step: 0.25, min: 0 },
      { id: 'overtimeMultiplier', label: 'Overtime multiplier (US standard = 1.5)', type: 'number', placeholder: '1.5', defaultValue: 1.5, step: 0.25, min: 1 }
    ],
    seo: {
      title: 'Work Hours Calculator – US Overtime Rules',
      description: 'Calculate total hours worked and gross pay including US federal overtime (1.5× for hours over 40/week). Enter regular hours, overtime, and hourly rate.',
      faq: [
        { question: 'When does US overtime kick in?', answer: 'Under the Fair Labor Standards Act (FLSA), non-exempt employees earn 1.5× their regular rate for all hours worked over 40 in a workweek. Some states (CA, NV) also have daily overtime rules.' },
        { question: 'Does this calculator handle daily overtime?', answer: 'This tool applies the federal weekly rule. For California daily overtime (over 8 hrs/day), enter your hours manually or consult your state labor board.' },
        { question: 'What is the federal minimum wage?', answer: 'The federal minimum wage is $7.25/hr as of 2025. Many states and cities have higher minimums — always use the highest applicable rate.' }
      ]
    },
    compute(values) {
      const regularPay = values.regularHours * values.hourlyRate;
      const overtimePay = values.overtimeHours * values.hourlyRate * values.overtimeMultiplier;
      const totalHours = values.regularHours + values.overtimeHours;
      const grossPay = regularPay + overtimePay;
      const annualEstimate = grossPay * 52;
      return { totalHours, regularPay, overtimePay, grossPay, annualEstimate };
    }
  },
  {
    id: 'date-difference-calculator',
    category: 'time',
    title: 'Date Difference Calculator',
    description: 'Find the number of days, weeks, and months between two dates using year, month, and day inputs.',
    example: 'Calculate days between January 1, 2024 and July 4, 2026.',
    inputs: [
      { id: 'startYear', label: 'Start year', type: 'number', placeholder: '2024', defaultValue: 2024, step: 1, min: 1900 },
      { id: 'startMonth', label: 'Start month (1–12)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'startDay', label: 'Start day (1–31)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'endYear', label: 'End year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1900 },
      { id: 'endMonth', label: 'End month (1–12)', type: 'number', placeholder: '7', defaultValue: 7, step: 1, min: 1 },
      { id: 'endDay', label: 'End day (1–31)', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 1 }
    ],
    seo: {
      title: 'Date Difference Calculator',
      description: 'Calculate the exact number of days, weeks, and months between any two dates. Useful for deadlines, project planning, and event countdowns.',
      faq: [
        { question: 'How do I calculate days between two dates?', answer: 'Enter the start and end year, month, and day. The calculator converts both to timestamps and computes the difference in days, weeks, and months.' },
        { question: 'Does this account for leap years?', answer: 'Yes, the JavaScript Date object used internally handles leap years correctly.' }
      ]
    },
    compute(values) {
      const start = new Date(values.startYear, values.startMonth - 1, values.startDay).getTime();
      const end = new Date(values.endYear, values.endMonth - 1, values.endDay).getTime();
      const diffMs = Math.abs(end - start);
      const days = Math.round(diffMs / 86400000);
      const weeks = days / 7;
      const months = days / 30.44;
      return { days, weeks, months };
    }
  },
  {
    id: 'sleep-time-calculator',
    category: 'time',
    title: 'Sleep Time Calculator',
    description: 'Find the best bedtime or wake-up time based on 90-minute sleep cycles. Plan 5–6 complete cycles for optimal rest.',
    example: 'Find the best wake time if you fall asleep at 10:30 PM.',
    inputs: [
      { id: 'sleepHour', label: 'Sleep time – hour (0–23, 24-hr)', type: 'number', placeholder: '22', defaultValue: 22, step: 1, min: 0 },
      { id: 'sleepMinute', label: 'Sleep time – minute (0–59)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 0 },
      { id: 'fallAsleepMinutes', label: 'Minutes to fall asleep', type: 'number', placeholder: '14', defaultValue: 14, step: 1, min: 0 },
      { id: 'targetCycles', label: 'Target sleep cycles (5 or 6 recommended)', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 1 }
    ],
    seo: {
      title: 'Sleep Time Calculator – Sleep Cycle Planner',
      description: 'Calculate the ideal wake-up time based on 90-minute sleep cycles. Enter your bedtime and the calculator shows when to wake up after 4, 5, or 6 full cycles.',
      faq: [
        { question: 'What is a sleep cycle?', answer: 'A sleep cycle lasts about 90 minutes and moves through light sleep, deep sleep, and REM. Waking at the end of a cycle feels more natural and less groggy.' },
        { question: 'How many sleep cycles do I need?', answer: 'Most adults feel best with 5–6 cycles (7.5–9 hours). Fewer than 4 cycles (under 6 hours) consistently is associated with health risks.' },
        { question: 'What time should I go to sleep?', answer: 'Work backwards from your required wake-up time using 90-minute cycles plus your average fall-asleep time (~14 minutes).' }
      ]
    },
    compute(values) {
      const sleepStartMinutes = values.sleepHour * 60 + values.sleepMinute + values.fallAsleepMinutes;
      const cycleMinutes = 90;
      const wakeMinutes = (sleepStartMinutes + values.targetCycles * cycleMinutes) % 1440;
      const wakeHour = Math.floor(wakeMinutes / 60);
      const wakeMin = wakeMinutes % 60;
      const totalSleepHours = (values.targetCycles * cycleMinutes) / 60;
      const wakeTimeDecimal = wakeHour + wakeMin / 60;
      return { totalSleepHours, wakeTimeDecimal, wakeHour, wakeMinute: wakeMin };
    }
  },
  // ── Finance (new) ──────────────────────────────────────────────────────────
  {
    id: 'loan-prepayment-calculator',
    category: 'finance',
    title: 'Loan Prepayment Calculator',
    description: 'See how extra payments reduce your loan payoff time and total interest. Works for mortgages, auto loans, personal loans, and student loans — all of which allow prepayment in the US.',
    example: 'Pay an extra $200/month on a $20,000 auto loan at 6% APR and see how much faster it is paid off.',
    inputs: [
      { id: 'loanAmount', label: 'Original loan amount', type: 'currency', placeholder: '20000', defaultValue: 20000, step: 100, min: 0 },
      { id: 'interestRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '6', defaultValue: 6, step: 0.01, min: 0 },
      { id: 'years', label: 'Original loan term (years)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 },
      { id: 'extraPayment', label: 'Extra monthly payment', type: 'currency', placeholder: '200', defaultValue: 200, step: 25, min: 0 }
    ],
    seo: {
      title: 'Loan Prepayment Calculator – Save on Interest',
      description: 'Calculate interest savings and time saved by making extra loan payments. Works for US mortgages, auto loans, personal loans, and student loans.',
      faq: [
        { question: 'Which US loans allow prepayment without penalty?', answer: 'Federal student loans, most auto loans, and most personal loans have no prepayment penalty. Many mortgages also allow it, but check your note for a prepayment penalty clause common in the first 3–5 years on some products.' },
        { question: 'How much interest can extra payments save?', answer: 'Even $50–$100 extra per month on a 30-year mortgage can save tens of thousands of dollars and shave years off the term.' },
        { question: 'Does the extra payment apply to principal?', answer: 'When you make a payment, interest is calculated first on the outstanding balance, and any remainder reduces principal. Always mark extra payments as apply to principal with your lender.' }
      ]
    },
    compute(values) {
      const monthlyRate = values.interestRate / 100 / 12;
      const months = Math.max(1, values.years * 12);
      const regularPayment = monthlyRate === 0
        ? values.loanAmount / months
        : (values.loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const totalInterestRegular = regularPayment * months - values.loanAmount;
      let balance = values.loanAmount;
      let totalInterestExtra = 0;
      let monthsWithExtra = 0;
      const totalPayment = regularPayment + values.extraPayment;
      while (balance > 0.01 && monthsWithExtra < 600) {
        const interest = balance * monthlyRate;
        totalInterestExtra += interest;
        const principal = Math.min(balance, totalPayment - interest);
        balance -= principal;
        monthsWithExtra++;
      }
      const interestSaved = Math.max(0, totalInterestRegular - totalInterestExtra);
      const monthsSaved = months - monthsWithExtra;
      return { regularMonthlyPayment: regularPayment, newMonthlyPayment: regularPayment + values.extraPayment, monthsSaved, interestSaved, newPayoffMonths: monthsWithExtra };
    }
  },
  {
    id: 'inflation-calculator',
    category: 'finance',
    title: 'Inflation Calculator',
    description: 'Find the future value of money accounting for inflation, or compare purchasing power across years.',
    example: 'See what $10,000 is worth in 10 years with 3% annual inflation.',
    inputs: [
      { id: 'amount', label: 'Starting amount', type: 'currency', placeholder: '10000', defaultValue: 10000, step: 100, min: 0 },
      { id: 'inflationRate', label: 'Annual inflation rate', type: 'percent', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'years', label: 'Years', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 }
    ],
    seo: {
      title: 'Inflation Calculator – Purchasing Power Over Time',
      description: 'Calculate the effect of inflation on purchasing power. See what today\'s dollars will be worth in the future.',
      faq: [
        { question: 'What is the average US inflation rate?', answer: 'The Federal Reserve targets 2% annual inflation. The long-term US average is approximately 3.3% since 1914.' },
        { question: 'What is the Rule of 72 for inflation?', answer: 'Divide 72 by the inflation rate to estimate how many years it takes for prices to double. At 3%, prices double roughly every 24 years.' }
      ]
    },
    compute(values) {
      const futureValue = values.amount * Math.pow(1 + values.inflationRate / 100, values.years);
      const purchasingPowerLoss = futureValue - values.amount;
      const presentValueEquivalent = values.amount / Math.pow(1 + values.inflationRate / 100, values.years);
      return { futureValue, purchasingPowerLoss, presentValueEquivalent };
    }
  },
  {
    id: 'travel-budget-calculator',
    category: 'finance',
    title: 'Travel Budget Calculator',
    description: 'Plan your total international travel budget including flights, accommodation, food, activities, and miscellaneous costs.',
    example: 'Budget a 10-day Europe trip: $900 flights, $120/night hotel, $60/day food, $40/day activities.',
    inputs: [
      { id: 'flightCost', label: 'Round-trip flights', type: 'currency', placeholder: '900', defaultValue: 900, step: 50, min: 0 },
      { id: 'nights', label: 'Number of nights', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 },
      { id: 'hotelPerNight', label: 'Accommodation per night', type: 'currency', placeholder: '120', defaultValue: 120, step: 10, min: 0 },
      { id: 'days', label: 'Number of days', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 },
      { id: 'foodPerDay', label: 'Food and drinks per day', type: 'currency', placeholder: '60', defaultValue: 60, step: 5, min: 0 },
      { id: 'activitiesPerDay', label: 'Activities and local transport per day', type: 'currency', placeholder: '40', defaultValue: 40, step: 5, min: 0 },
      { id: 'miscBudget', label: 'Miscellaneous (shopping, tips, SIM, visa)', type: 'currency', placeholder: '200', defaultValue: 200, step: 25, min: 0 },
      { id: 'travelInsurance', label: 'Travel insurance', type: 'currency', placeholder: '80', defaultValue: 80, step: 10, min: 0 }
    ],
    seo: {
      title: 'Travel Budget Calculator – International Trip Planner',
      description: 'Plan your international travel budget with per-night accommodation, daily food, activities, flights, travel insurance, and contingency buffer.',
      faq: [
        { question: 'What should I include in a travel budget?', answer: 'Flights, accommodation, daily food and drink, local transport, activities, travel insurance, visa fees, currency exchange buffer, and shopping.' },
        { question: 'Do I need travel insurance for international travel?', answer: 'Strongly recommended. US health plans rarely cover overseas emergencies. Travel insurance covers medical evacuation, trip cancellation, and lost luggage.' },
        { question: 'How much buffer should I add?', answer: 'Add 10–15% as a contingency buffer for ATM fees, price changes, or unexpected costs.' }
      ]
    },
    compute(values) {
      const accommodation = values.nights * values.hotelPerNight;
      const food = values.days * values.foodPerDay;
      const activities = values.days * values.activitiesPerDay;
      const totalBudget = values.flightCost + accommodation + food + activities + values.miscBudget + values.travelInsurance;
      const perDayCost = totalBudget / Math.max(1, values.days);
      const buffer = totalBudget * 0.1;
      const totalWithBuffer = totalBudget + buffer;
      return { accommodation, food, activities, totalBudget, perDayCost, buffer, totalWithBuffer };
    }
  },
  {
    id: 'visa-stay-days-calculator',
    category: 'finance',
    title: 'Visa Stay Days Calculator',
    description: 'Calculate remaining visa days and check whether a planned trip fits within a 90/180-day Schengen rule or other visa windows.',
    example: 'Check if a 30-day trip fits within the 90-day Schengen allowance after 25 days already used.',
    inputs: [
      { id: 'allowedDays', label: 'Total days allowed by visa (e.g. 90)', type: 'number', placeholder: '90', defaultValue: 90, step: 1, min: 1 },
      { id: 'windowDays', label: 'Rolling window in days (e.g. 180 for Schengen)', type: 'number', placeholder: '180', defaultValue: 180, step: 1, min: 1 },
      { id: 'daysAlreadyUsed', label: 'Days already used in current window', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 0 },
      { id: 'plannedTripDays', label: 'Planned trip duration (days)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 }
    ],
    seo: {
      title: 'Visa Stay Days Calculator – Schengen and Travel Visas',
      description: 'Calculate remaining visa days and verify your planned trip fits within Schengen 90/180 rules or other visa allowances.',
      faq: [
        { question: 'What is the Schengen 90/180 rule?', answer: 'Non-EU visitors may stay in the Schengen Area for up to 90 days within any rolling 180-day period. Overstaying can result in fines, deportation, and entry bans.' },
        { question: 'Does a US B-2 visa work the same way?', answer: 'The US typically grants up to 6 months per entry on a B-2 tourist visa. The exact duration is stamped on the I-94 by the CBP officer at entry.' }
      ]
    },
    compute(values) {
      const remaining = Math.max(0, values.allowedDays - values.daysAlreadyUsed);
      const canStay = values.plannedTripDays <= remaining ? 1 : 0;
      const overstayDays = Math.max(0, values.plannedTripDays - remaining);
      const usagePercent = (values.daysAlreadyUsed / values.allowedDays) * 100;
      return { remaining, canStay, overstayDays, usagePercent };
    }
  },
  // ── Work & Career ──────────────────────────────────────────────────────────
  {
    id: 'salary-raise-calculator',
    category: 'work',
    title: 'Salary Raise Calculator',
    description: 'Calculate your new salary after a raise, compare offers, and estimate annual, monthly, and hourly impact before and after taxes.',
    example: 'See the difference between a $72,000 salary and a 7% raise, paying bi-weekly.',
    inputs: [
      { id: 'currentSalary', label: 'Current annual salary', type: 'currency', placeholder: '72000', defaultValue: 72000, step: 1000, min: 0 },
      { id: 'raisePercent', label: 'Raise percentage', type: 'percent', placeholder: '7', defaultValue: 7, step: 0.1, min: 0 },
      { id: 'flatRaiseAmount', label: 'Or flat raise amount (overrides % if > 0)', type: 'currency', placeholder: '0', defaultValue: 0, step: 500, min: 0 },
      { id: 'taxRate', label: 'Estimated combined tax rate', type: 'percent', placeholder: '28', defaultValue: 28, step: 0.5, min: 0 },
      { id: 'payPeriodsPerYear', label: 'Pay periods per year (26 = bi-weekly, 12 = monthly)', type: 'number', placeholder: '26', defaultValue: 26, step: 1, min: 1 }
    ],
    seo: {
      title: 'Salary Raise Calculator – Before and After Tax',
      description: 'Calculate your new salary after a percentage or flat raise. Compare annual, monthly, per-paycheck, and hourly impact before and after taxes.',
      faq: [
        { question: 'How do I calculate a salary raise?', answer: 'Multiply your current salary by (1 + raise%) for a percentage raise, or add the flat amount directly.' },
        { question: 'What is a good raise percentage in the US?', answer: 'Merit raises in the US typically range from 3–5%. A promotion raise is usually 10–20%. Cost-of-living adjustments track CPI, which has been 3–8% in recent years.' },
        { question: 'How does a raise affect my take-home pay?', answer: 'Your raise is subject to marginal tax rates. A portion of every additional dollar earned is taxed at your marginal rate, so your take-home increase is less than the gross raise.' }
      ]
    },
    compute(values) {
      const raiseAmt = values.flatRaiseAmount > 0 ? values.flatRaiseAmount : values.currentSalary * (values.raisePercent / 100);
      const newSalary = values.currentSalary + raiseAmt;
      const raisePercent = values.currentSalary > 0 ? (raiseAmt / values.currentSalary) * 100 : 0;
      const netCurrent = values.currentSalary * (1 - values.taxRate / 100);
      const netNew = newSalary * (1 - values.taxRate / 100);
      const netIncrease = netNew - netCurrent;
      const perPaycheckIncrease = netIncrease / values.payPeriodsPerYear;
      const hourlyIncrease = raiseAmt / 2080;
      return { newSalary, raiseAmount: raiseAmt, raisePercent, netCurrent, netNew, netIncrease, perPaycheckIncrease, hourlyIncrease };
    }
  },
  {
    id: 'meeting-cost-calculator',
    category: 'work',
    title: 'Meeting Cost Calculator',
    description: 'Calculate the real dollar cost of a meeting based on attendee count, average salary, and duration. Helps teams evaluate meeting ROI.',
    example: 'Find the cost of a 1-hour meeting with 8 people averaging $85,000 salary.',
    inputs: [
      { id: 'attendees', label: 'Number of attendees', type: 'number', placeholder: '8', defaultValue: 8, step: 1, min: 1 },
      { id: 'avgSalary', label: 'Average annual salary per person', type: 'currency', placeholder: '85000', defaultValue: 85000, step: 5000, min: 0 },
      { id: 'durationMinutes', label: 'Meeting duration (minutes)', type: 'number', placeholder: '60', defaultValue: 60, step: 5, min: 5 },
      { id: 'employerLoadFactor', label: 'Employer cost load factor (1.3 = 30% benefits/overhead)', type: 'number', placeholder: '1.3', defaultValue: 1.3, step: 0.05, min: 1 }
    ],
    seo: {
      title: 'Meeting Cost Calculator – Real Cost of Meetings',
      description: 'Calculate the true dollar cost of a meeting including employee salary time and employer overhead. Helps justify async alternatives.',
      faq: [
        { question: 'How is meeting cost calculated?', answer: 'Divide each person\'s annual salary by 2,080 work hours, multiply by meeting hours, then by the number of attendees and the employer load factor for benefits and overhead.' },
        { question: 'What is the employer load factor?', answer: 'The total cost of an employee exceeds their salary by 25–40% when you add benefits, payroll taxes, and overhead. A factor of 1.3 means $1.30 of employer cost per $1.00 of salary.' },
        { question: 'Why calculate meeting costs?', answer: 'Studies show US workers spend 31 hours per month in unproductive meetings. A recurring 1-hour weekly meeting with 10 people at $90k salary costs over $22,000 per year.' }
      ]
    },
    compute(values) {
      const hourlyPerPerson = (values.avgSalary / 2080) * values.employerLoadFactor;
      const meetingHours = values.durationMinutes / 60;
      const totalCost = hourlyPerPerson * values.attendees * meetingHours;
      const costPerAttendee = hourlyPerPerson * meetingHours;
      const annualIfWeekly = totalCost * 52;
      return { totalCost, costPerAttendee, hourlyPerPerson, annualIfWeekly };
    }
  },
  {
    id: 'freelancer-rate-calculator',
    category: 'work',
    title: 'Freelancer Hourly Rate Calculator',
    description: 'Calculate the minimum hourly rate needed as a US freelancer to cover taxes, benefits, business expenses, and unpaid time.',
    example: 'Find the minimum hourly rate for a freelancer targeting $80,000 net income with 30 billable hours per week.',
    inputs: [
      { id: 'targetNetIncome', label: 'Target annual net income', type: 'currency', placeholder: '80000', defaultValue: 80000, step: 5000, min: 0 },
      { id: 'billableHoursPerWeek', label: 'Billable hours per week', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'weeksPerYear', label: 'Weeks worked per year', type: 'number', placeholder: '48', defaultValue: 48, step: 1, min: 1 },
      { id: 'selfEmploymentTaxRate', label: 'Self-employment + income tax rate', type: 'percent', placeholder: '35', defaultValue: 35, step: 1, min: 0 },
      { id: 'annualBusinessExpenses', label: 'Annual business expenses', type: 'currency', placeholder: '5000', defaultValue: 5000, step: 500, min: 0 },
      { id: 'annualBenefitsCost', label: 'Annual health insurance and benefits', type: 'currency', placeholder: '6000', defaultValue: 6000, step: 500, min: 0 }
    ],
    seo: {
      title: 'Freelancer Hourly Rate Calculator – US Self-Employment',
      description: 'Calculate the minimum freelance hourly rate needed to hit your income goal after self-employment tax, health insurance, business expenses, and unpaid time.',
      faq: [
        { question: 'What is the self-employment tax rate in the US?', answer: 'Freelancers pay 15.3% self-employment tax (Social Security + Medicare) on net self-employment income, plus federal and state income taxes. Total effective rate is often 25–40%.' },
        { question: 'Why do freelancers need a higher rate than employees?', answer: 'Employees have taxes withheld and receive employer-paid benefits. Freelancers pay both halves of FICA, buy their own health insurance, and have unpaid vacation, admin, and marketing time.' },
        { question: 'How many billable hours can a freelancer realistically work?', answer: 'Most full-time freelancers achieve 20–30 billable hours per week. The rest goes to sales, admin, professional development, and downtime.' }
      ]
    },
    compute(values) {
      const totalBillableHours = values.billableHoursPerWeek * values.weeksPerYear;
      const grossNeeded = (values.targetNetIncome + values.annualBusinessExpenses + values.annualBenefitsCost) / (1 - values.selfEmploymentTaxRate / 100);
      const minimumHourlyRate = grossNeeded / totalBillableHours;
      const annualGrossRevenue = grossNeeded;
      const taxBurden = grossNeeded * (values.selfEmploymentTaxRate / 100);
      return { minimumHourlyRate, annualGrossRevenue, taxBurden, totalBillableHours };
    }
  },
  {
    id: 'pto-calculator',
    category: 'work',
    title: 'PTO / Vacation Calculator',
    description: 'Calculate accrued PTO, remaining balance, and cash value of unused vacation days based on US employer policies.',
    example: 'Find PTO balance for an employee who earns 15 days/year, has used 4 days, and earns $75,000.',
    inputs: [
      { id: 'annualPtoDays', label: 'Annual PTO days allotted', type: 'number', placeholder: '15', defaultValue: 15, step: 0.5, min: 0 },
      { id: 'daysUsed', label: 'Days used so far this year', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'annualSalary', label: 'Annual salary', type: 'currency', placeholder: '75000', defaultValue: 75000, step: 1000, min: 0 },
      { id: 'workDaysPerYear', label: 'Work days per year', type: 'number', placeholder: '260', defaultValue: 260, step: 1, min: 1 }
    ],
    seo: {
      title: 'PTO / Vacation Calculator – Accrual and Cash Value',
      description: 'Calculate your remaining PTO balance and the dollar value of unused vacation days. Based on US employer policies and daily wage calculation.',
      faq: [
        { question: 'Is PTO required by law in the US?', answer: 'No federal law requires paid vacation in the US. PTO is offered at employer discretion. Some states like California, Colorado, and Maine have specific rules around accrual and payout.' },
        { question: 'Can employers pay out unused PTO?', answer: 'In some states (CA, CO, NE, ND) accrued PTO is treated as earned wages and must be paid out at termination. Other states allow use-it-or-lose-it policies.' },
        { question: 'How is PTO cash value calculated?', answer: 'Divide your annual salary by the number of work days per year to get your daily rate, then multiply by unused PTO days.' }
      ]
    },
    compute(values) {
      const remaining = Math.max(0, values.annualPtoDays - values.daysUsed);
      const dailyRate = values.annualSalary / values.workDaysPerYear;
      const cashValue = remaining * dailyRate;
      const usedCashValue = values.daysUsed * dailyRate;
      const usagePercent = values.annualPtoDays > 0 ? (values.daysUsed / values.annualPtoDays) * 100 : 0;
      return { remaining, dailyRate, cashValue, usedCashValue, usagePercent };
    }
  },
  // ── Auto (new) ─────────────────────────────────────────────────────────────
  {
    id: 'ev-charging-calculator',
    category: 'auto',
    title: 'EV Charging Cost Calculator',
    description: 'Estimate the cost to charge an electric vehicle at home or at a public charger, and compare to gas costs.',
    example: 'Calculate the cost to charge a Tesla Model 3 (75 kWh battery) at home at $0.16/kWh.',
    inputs: [
      { id: 'batteryKwh', label: 'Battery capacity (kWh)', type: 'number', placeholder: '75', defaultValue: 75, step: 0.5, min: 1 },
      { id: 'chargePercent', label: 'Charge from % to 100% (enter starting %)', type: 'number', placeholder: '20', defaultValue: 20, step: 5, min: 0 },
      { id: 'electricityRate', label: 'Electricity rate ($/kWh)', type: 'currency', placeholder: '0.16', defaultValue: 0.16, step: 0.01, min: 0 },
      { id: 'efficiency', label: 'Vehicle efficiency (miles per kWh)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1, min: 0.1 },
      { id: 'gasPricePerGallon', label: 'Gas price for comparison ($/gallon)', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0 },
      { id: 'gasMpg', label: 'Gas vehicle MPG for comparison', type: 'number', placeholder: '32', defaultValue: 32, step: 1, min: 1 }
    ],
    seo: {
      title: 'EV Charging Cost Calculator – Home and Public Charging',
      description: 'Calculate the electricity cost to charge your EV and compare savings vs gasoline. Uses your local electricity rate and vehicle efficiency.',
      faq: [
        { question: 'What is the average US home electricity rate?', answer: 'The US average is approximately $0.16/kWh as of 2025, but varies widely — Hawaii is ~$0.39/kWh while Louisiana is ~$0.11/kWh.' },
        { question: 'How much does it cost to fully charge an EV at home?', answer: 'A 75 kWh battery charged from empty costs $9–$15 at typical US home rates — far less than a tank of gas for comparable range.' },
        { question: 'Are public chargers more expensive than home charging?', answer: 'Yes. DC fast chargers (Tesla Supercharger, Electrify America) typically cost $0.30–$0.50/kWh, making them 2–3× more expensive than home charging.' }
      ]
    },
    compute(values) {
      const kwhNeeded = values.batteryKwh * (1 - values.chargePercent / 100);
      const chargingCost = kwhNeeded * values.electricityRate;
      const rangeAdded = kwhNeeded * values.efficiency;
      const costPerMileEV = values.electricityRate / values.efficiency;
      const costPerMileGas = values.gasPricePerGallon / values.gasMpg;
      const savingsPerMile = Math.max(0, costPerMileGas - costPerMileEV);
      const annualSavings = savingsPerMile * 12000;
      return { kwhNeeded, chargingCost, rangeAdded, costPerMileEV, costPerMileGas, savingsPerMile, annualSavings };
    }
  },
  {
    id: 'toll-cost-calculator',
    category: 'auto',
    title: 'Toll Cost Estimator',
    description: 'Estimate total toll costs for a US road trip or commute, including E-ZPass discount savings.',
    example: 'Estimate tolls for a daily commute with $2.50 toll each way, 22 work days per month.',
    inputs: [
      { id: 'tollPerTrip', label: 'Toll cost per trip (one way)', type: 'currency', placeholder: '2.50', defaultValue: 2.50, step: 0.25, min: 0 },
      { id: 'tripsPerDay', label: 'Trips per day (2 = round trip)', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 },
      { id: 'daysPerMonth', label: 'Days per month', type: 'number', placeholder: '22', defaultValue: 22, step: 1, min: 1 },
      { id: 'ezpassDiscount', label: 'E-ZPass / transponder discount (%)', type: 'percent', placeholder: '25', defaultValue: 25, step: 1, min: 0 }
    ],
    seo: {
      title: 'Toll Cost Estimator – US Road Trips and Commutes',
      description: 'Calculate monthly and annual toll costs for commuting or road trips. Includes E-ZPass and electronic toll transponder discount savings.',
      faq: [
        { question: 'Do I save money with E-ZPass?', answer: 'Yes. E-ZPass and similar transponders (SunPass, FasTrak, TxTag) typically offer 20–30% discounts over cash rates on most US toll roads.' },
        { question: 'Which US states have the highest tolls?', answer: 'New York, New Jersey, Pennsylvania, Florida, and Illinois have some of the highest toll costs. The NY Thruway and NJ Turnpike are among the most expensive.' },
        { question: 'Are tolls tax deductible?', answer: 'Tolls paid for business purposes can be deducted as a business expense or included in the IRS standard mileage rate calculation.' }
      ]
    },
    compute(values) {
      const dailyCost = values.tollPerTrip * values.tripsPerDay;
      const monthlyCost = dailyCost * values.daysPerMonth;
      const annualCost = monthlyCost * 12;
      const discountFactor = 1 - values.ezpassDiscount / 100;
      const monthlyWithEzpass = monthlyCost * discountFactor;
      const annualWithEzpass = annualCost * discountFactor;
      const annualSavings = annualCost - annualWithEzpass;
      return { dailyCost, monthlyCost, annualCost, monthlyWithEzpass, annualWithEzpass, annualSavings };
    }
  },
  {
    id: 'commute-cost-calculator',
    category: 'auto',
    title: 'Commute Cost Calculator',
    description: 'Calculate the full cost of your daily commute including fuel, tolls, parking, public transit, and vehicle wear.',
    example: 'Find monthly commute cost for a 25-mile round trip at 30 MPG with $15/day parking and $3 tolls.',
    inputs: [
      { id: 'roundTripMiles', label: 'Round-trip commute distance (miles)', type: 'number', placeholder: '25', defaultValue: 25, step: 1, min: 0 },
      { id: 'mpg', label: 'Vehicle MPG', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'gasPricePerGallon', label: 'Gas price ($/gallon)', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0 },
      { id: 'daysPerMonth', label: 'Commute days per month', type: 'number', placeholder: '22', defaultValue: 22, step: 1, min: 1 },
      { id: 'dailyParking', label: 'Daily parking cost', type: 'currency', placeholder: '15', defaultValue: 0, step: 1, min: 0 },
      { id: 'dailyTolls', label: 'Daily tolls', type: 'currency', placeholder: '3', defaultValue: 0, step: 0.25, min: 0 },
      { id: 'wearCostPerMile', label: 'Vehicle wear cost per mile (IRS: $0.21)', type: 'currency', placeholder: '0.21', defaultValue: 0.21, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Commute Cost Calculator – Full Monthly and Annual Cost',
      description: 'Calculate the true cost of commuting including gas, tolls, parking, and vehicle wear. Compare driving vs public transit.',
      faq: [
        { question: 'What is the IRS mileage rate?', answer: 'The IRS standard mileage rate for 2025 is $0.70 per mile for business driving. The vehicle wear/depreciation component is approximately $0.21/mile.' },
        { question: 'What is the average US commute cost?', answer: 'The average American spends $2,000–$5,000 per year on commuting depending on location, distance, and mode of transportation.' },
        { question: 'Can I deduct commuting costs?', answer: 'Ordinary commuting from home to a regular workplace is not deductible. However, if you work from home and travel to a client site, those miles may qualify as business travel.' }
      ]
    },
    compute(values) {
      const dailyFuelCost = (values.roundTripMiles / values.mpg) * values.gasPricePerGallon;
      const dailyWear = values.roundTripMiles * values.wearCostPerMile;
      const dailyTotal = dailyFuelCost + values.dailyParking + values.dailyTolls + dailyWear;
      const monthlyTotal = dailyTotal * values.daysPerMonth;
      const annualTotal = monthlyTotal * 12;
      const monthlyFuel = dailyFuelCost * values.daysPerMonth;
      const monthlyParking = values.dailyParking * values.daysPerMonth;
      return { dailyTotal, monthlyTotal, annualTotal, monthlyFuel, monthlyParking };
    }
  },
  // ── Health (new) ───────────────────────────────────────────────────────────
  {
    id: 'running-pace-calculator',
    category: 'health',
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
    title: 'Pregnancy Due Date Calculator',
    description: 'Estimate your due date using Naegele\'s rule (LMP method) or IVF transfer date. Also calculates current weeks and trimester.',
    example: 'Find the due date for a pregnancy with last menstrual period starting March 1, 2026.',
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
      const todayMs = new Date(2026, 5, 17).getTime();
      const gestationalDays = Math.max(0, Math.round((todayMs - lmp) / 86400000));
      const gestationalWeeks = gestationalDays / 7;
      const daysRemaining = Math.max(0, Math.round((dueDateMs - todayMs) / 86400000));
      const trimester = gestationalWeeks <= 12 ? 1 : gestationalWeeks <= 26 ? 2 : 3;
      return { gestationalWeeks, daysRemaining, trimester, gestationalDays };
    }
  },
  // ── Home (new) ─────────────────────────────────────────────────────────────
  {
    id: 'paint-calculator',
    category: 'home',
    title: 'Paint Calculator',
    description: 'Calculate how many gallons of paint you need for walls and ceilings, accounting for doors, windows, and coats.',
    example: 'Calculate paint needed for a 12x14 ft room with 9 ft ceilings, 1 door, and 2 windows.',
    inputs: [
      { id: 'roomLength', label: 'Room length (ft)', type: 'number', placeholder: '14', defaultValue: 14, step: 0.5, min: 1 },
      { id: 'roomWidth', label: 'Room width (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'ceilingHeight', label: 'Ceiling height (ft)', type: 'number', placeholder: '9', defaultValue: 9, step: 0.5, min: 6 },
      { id: 'doors', label: 'Number of doors (each ~20 sq ft)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 },
      { id: 'windows', label: 'Number of windows (each ~15 sq ft)', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 },
      { id: 'coats', label: 'Number of coats', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 1 },
      { id: 'coveragePerGallon', label: 'Coverage per gallon (sq ft, typical = 350)', type: 'number', placeholder: '350', defaultValue: 350, step: 10, min: 100 }
    ],
    seo: {
      title: 'Paint Calculator – Gallons Needed for Walls and Ceilings',
      description: 'Calculate how many gallons of paint you need for any room. Accounts for doors, windows, number of coats, and paint coverage.',
      faq: [
        { question: 'How much area does one gallon of paint cover?', answer: 'Most standard interior paints cover 350–400 sq ft per gallon on smooth surfaces. Textured walls may require 20–30% more.' },
        { question: 'Should I buy extra paint?', answer: 'Add 10% to your calculated amount for touch-ups and waste. Paint can also be stored for future use if you keep the lid sealed.' },
        { question: 'How many coats does a room need?', answer: 'Most rooms need 2 coats for good coverage. Painting over a dark color or using a primer first can help achieve full coverage in 2 coats.' }
      ]
    },
    compute(values) {
      const wallArea = 2 * (values.roomLength + values.roomWidth) * values.ceilingHeight;
      const deductions = values.doors * 20 + values.windows * 15;
      const paintableArea = Math.max(0, wallArea - deductions);
      const totalArea = paintableArea * values.coats;
      const gallonsNeeded = totalArea / values.coveragePerGallon;
      const gallonsWithBuffer = gallonsNeeded * 1.1;
      const ceilingArea = values.roomLength * values.roomWidth;
      const ceilingGallons = (ceilingArea * values.coats) / values.coveragePerGallon;
      return { paintableArea, gallonsNeeded, gallonsWithBuffer, ceilingArea, ceilingGallons };
    }
  },
  {
    id: 'tile-calculator',
    category: 'home',
    title: 'Tile Calculator',
    description: 'Calculate the number of tiles and boxes needed for a floor or wall project, including a waste allowance.',
    example: 'Calculate tiles needed for a 120 sq ft bathroom floor using 12x12 inch tiles.',
    inputs: [
      { id: 'areaLength', label: 'Area length (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 0.5 },
      { id: 'areaWidth', label: 'Area width (ft)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.5, min: 0.5 },
      { id: 'tileLengthInch', label: 'Tile length (inches)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'tileWidthInch', label: 'Tile width (inches)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'wastePercent', label: 'Waste allowance (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'tilesPerBox', label: 'Tiles per box', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 }
    ],
    seo: {
      title: 'Tile Calculator – Floor and Wall Tile Estimator',
      description: 'Calculate the number of tiles and boxes needed for any floor or wall project. Includes waste factor for cuts and breakage.',
      faq: [
        { question: 'How much waste should I account for?', answer: 'Add 10% for simple layouts, 15% for diagonal patterns, and up to 20% for complex cuts or irregular rooms.' },
        { question: 'What tile sizes are most common in the US?', answer: 'Common sizes include 12×12, 16×16, 18×18, and 12×24 inch for floors. Subway tiles (3×6 inch) are popular for bathroom walls.' }
      ]
    },
    compute(values) {
      const roomSqFt = values.areaLength * values.areaWidth;
      const tileSqFt = (values.tileLengthInch / 12) * (values.tileWidthInch / 12);
      const tilesNeeded = roomSqFt / tileSqFt;
      const tilesWithWaste = tilesNeeded * (1 + values.wastePercent / 100);
      const boxesNeeded = Math.ceil(tilesWithWaste / values.tilesPerBox);
      return { roomSqFt, tilesNeeded, tilesWithWaste, boxesNeeded };
    }
  },
  {
    id: 'concrete-calculator',
    category: 'home',
    title: 'Concrete Calculator',
    description: 'Calculate cubic yards and bags of concrete needed for slabs, footings, or columns.',
    example: 'Calculate concrete for a 10x12 ft patio slab, 4 inches thick.',
    inputs: [
      { id: 'length', label: 'Length (ft)', type: 'number', placeholder: '10', defaultValue: 10, step: 0.5, min: 0.1 },
      { id: 'width', label: 'Width (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 0.1 },
      { id: 'depthInches', label: 'Depth / thickness (inches)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0.5 },
      { id: 'wastePercent', label: 'Waste factor (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 1, min: 0 }
    ],
    seo: {
      title: 'Concrete Calculator – Cubic Yards and Bags',
      description: 'Calculate how many cubic yards or 60-lb/80-lb bags of concrete you need for slabs, driveways, footings, and more.',
      faq: [
        { question: 'How many cubic yards do I need?', answer: 'Multiply length × width × depth (all in feet), then divide by 27 to convert cubic feet to cubic yards.' },
        { question: 'How many bags of concrete per cubic yard?', answer: 'One cubic yard requires approximately 45 bags of 80-lb concrete or 60 bags of 60-lb concrete.' },
        { question: 'Should I order extra concrete?', answer: 'Always order 10% extra to account for spillage, settling, and uneven subgrade.' }
      ]
    },
    compute(values) {
      const depthFt = values.depthInches / 12;
      const cubicFeet = values.length * values.width * depthFt;
      const cubicYards = cubicFeet / 27;
      const cubicYardsWithWaste = cubicYards * (1 + values.wastePercent / 100);
      const bags80lb = Math.ceil(cubicYardsWithWaste * 45);
      const bags60lb = Math.ceil(cubicYardsWithWaste * 60);
      return { cubicFeet, cubicYards, cubicYardsWithWaste, bags80lb, bags60lb };
    }
  },
  {
    id: 'wallpaper-calculator',
    category: 'home',
    title: 'Wallpaper Calculator',
    description: 'Calculate how many rolls of wallpaper you need for a room, accounting for pattern repeat and waste.',
    example: 'Find rolls needed for a 12x14 ft room with 9 ft ceilings using standard US double rolls.',
    inputs: [
      { id: 'roomPerimeter', label: 'Room perimeter (ft)', type: 'number', placeholder: '52', defaultValue: 52, step: 1, min: 4 },
      { id: 'wallHeight', label: 'Wall height (ft)', type: 'number', placeholder: '9', defaultValue: 9, step: 0.5, min: 6 },
      { id: 'doors', label: 'Number of doors', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 },
      { id: 'windows', label: 'Number of windows', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 },
      { id: 'rollSqFt', label: 'Square feet per roll (US double roll = 56)', type: 'number', placeholder: '56', defaultValue: 56, step: 1, min: 10 },
      { id: 'patternRepeatInch', label: 'Pattern repeat (inches, 0 = no repeat)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    seo: {
      title: 'Wallpaper Calculator – Rolls Needed for Any Room',
      description: 'Calculate how many wallpaper rolls you need based on room size, wall height, doors, windows, and pattern repeat.',
      faq: [
        { question: 'What is a standard US wallpaper roll size?', answer: 'A standard US double roll covers approximately 56 sq ft. European single rolls cover about 28 sq ft. Always check the label.' },
        { question: 'How does pattern repeat affect wallpaper quantity?', answer: 'With a pattern repeat, some paper is wasted at each seam to match the pattern. Larger repeats (18+ inches) waste more paper and require more rolls.' }
      ]
    },
    compute(values) {
      const wallArea = values.roomPerimeter * values.wallHeight;
      const deductions = values.doors * 20 + values.windows * 15;
      const netArea = Math.max(0, wallArea - deductions);
      const repeatWasteFactor = values.patternRepeatInch > 0 ? 1 + (values.patternRepeatInch / (values.wallHeight * 12)) : 1;
      const adjustedArea = netArea * repeatWasteFactor * 1.1;
      const rollsNeeded = Math.ceil(adjustedArea / values.rollSqFt);
      return { wallArea, netArea, adjustedArea, rollsNeeded };
    }
  },
  {
    id: 'furniture-fit-calculator',
    category: 'home',
    title: 'Furniture Fit Calculator',
    description: 'Check if a piece of furniture fits in your room with clearance space for walkways and doors.',
    example: 'Check if a 78x36 inch sofa fits in a 12x14 ft living room with 36 inch walkways.',
    inputs: [
      { id: 'roomLengthFt', label: 'Room length (ft)', type: 'number', placeholder: '14', defaultValue: 14, step: 0.5, min: 1 },
      { id: 'roomWidthFt', label: 'Room width (ft)', type: 'number', placeholder: '12', defaultValue: 12, step: 0.5, min: 1 },
      { id: 'furnitureLengthIn', label: 'Furniture length (inches)', type: 'number', placeholder: '78', defaultValue: 78, step: 1, min: 1 },
      { id: 'furnitureWidthIn', label: 'Furniture width / depth (inches)', type: 'number', placeholder: '36', defaultValue: 36, step: 1, min: 1 },
      { id: 'clearanceIn', label: 'Desired walkway clearance (inches, min 36 per ADA)', type: 'number', placeholder: '36', defaultValue: 36, step: 1, min: 18 }
    ],
    seo: {
      title: 'Furniture Fit Calculator – Room Layout Planner',
      description: 'Check if furniture fits in your room with proper ADA-recommended walkway clearance. Enter room and furniture dimensions in feet and inches.',
      faq: [
        { question: 'How much clearance do I need around furniture?', answer: 'The ADA recommends at least 36 inches of clear walkway. Interior design guidelines suggest 30–36 inches around sofas and 42–48 inches for main traffic paths.' },
        { question: 'How do I measure furniture for a room?', answer: 'Measure the widest point of the furniture including legs and arms. Also measure doorways (standard US interior door is 80×32 inches) to ensure the piece can be moved in.' }
      ]
    },
    compute(values) {
      const roomLengthIn = values.roomLengthFt * 12;
      const roomWidthIn = values.roomWidthFt * 12;
      const remainingLength = roomLengthIn - values.furnitureLengthIn;
      const remainingWidth = roomWidthIn - values.furnitureWidthIn;
      const fitsLength = remainingLength >= values.clearanceIn ? 1 : 0;
      const fitsWidth = remainingWidth >= values.clearanceIn ? 1 : 0;
      const fits = fitsLength === 1 && fitsWidth === 1 ? 1 : 0;
      const furnitureSqFt = (values.furnitureLengthIn / 12) * (values.furnitureWidthIn / 12);
      const roomSqFt = values.roomLengthFt * values.roomWidthFt;
      return { fits, fitsLength, fitsWidth, remainingLength, remainingWidth, furnitureSqFt, roomSqFt };
    }
  },
  // ── Shopping ───────────────────────────────────────────────────────────────
  {
    id: 'discount-calculator',
    category: 'shopping',
    title: 'Discount Calculator',
    description: 'Calculate sale price, savings amount, and effective discount percentage for any purchase.',
    example: 'Find the final price of a $120 jacket with 30% off plus an additional 10% coupon.',
    inputs: [
      { id: 'originalPrice', label: 'Original price', type: 'currency', placeholder: '120', defaultValue: 120, step: 1, min: 0 },
      { id: 'discountPercent', label: 'Discount percentage', type: 'percent', placeholder: '30', defaultValue: 30, step: 0.5, min: 0 },
      { id: 'additionalDiscount', label: 'Additional coupon discount (%)', type: 'percent', placeholder: '10', defaultValue: 0, step: 0.5, min: 0 },
      { id: 'salesTaxRate', label: 'Sales tax rate', type: 'percent', placeholder: '8.25', defaultValue: 0, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Discount Calculator – Sale Price and Savings',
      description: 'Calculate the final price after single or stacked discounts, plus sales tax. Shows total savings and effective discount percentage.',
      faq: [
        { question: 'How do stacked discounts work?', answer: 'Stacked discounts apply sequentially, not additively. A 30% off then 10% off is not 40% off — it is 37% off total (you pay 70% then 90% of that).' },
        { question: 'What is the best day to shop for discounts in the US?', answer: 'Black Friday, Cyber Monday, Labor Day, and end-of-season sales typically offer the deepest discounts. Retail markdowns are also common mid-week.' }
      ]
    },
    compute(values) {
      const afterFirst = values.originalPrice * (1 - values.discountPercent / 100);
      const afterSecond = afterFirst * (1 - values.additionalDiscount / 100);
      const tax = afterSecond * (values.salesTaxRate / 100);
      const finalPrice = afterSecond + tax;
      const totalSavings = values.originalPrice - afterSecond;
      const effectiveDiscount = values.originalPrice > 0 ? (totalSavings / values.originalPrice) * 100 : 0;
      return { afterFirst, afterSecond, tax, finalPrice, totalSavings, effectiveDiscount };
    }
  },
  {
    id: 'cashback-calculator',
    category: 'shopping',
    title: 'Cashback Calculator',
    description: 'Calculate cashback earnings from purchases, annual rewards value, and effective discount rate from rewards cards.',
    example: 'Estimate annual cashback on $2,000/month spending with a 2% rewards card.',
    inputs: [
      { id: 'monthlySpend', label: 'Monthly spending', type: 'currency', placeholder: '2000', defaultValue: 2000, step: 100, min: 0 },
      { id: 'cashbackRate', label: 'Cashback rate on general purchases', type: 'percent', placeholder: '2', defaultValue: 2, step: 0.25, min: 0 },
      { id: 'bonusCategorySpend', label: 'Monthly bonus category spending (dining, groceries, etc.)', type: 'currency', placeholder: '400', defaultValue: 400, step: 50, min: 0 },
      { id: 'bonusCategoryRate', label: 'Bonus category cashback rate', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.25, min: 0 },
      { id: 'annualFee', label: 'Card annual fee', type: 'currency', placeholder: '0', defaultValue: 0, step: 25, min: 0 }
    ],
    seo: {
      title: 'Cashback Calculator – Credit Card Rewards Estimator',
      description: 'Calculate annual cashback earnings from credit card rewards. Compare flat-rate vs bonus-category cards and factor in annual fees.',
      faq: [
        { question: 'What is a good cashback rate in the US?', answer: 'Flat-rate cards offer 1.5–2% on all purchases. Premium cards offer 3–6% on bonus categories like groceries, dining, or gas, with lower rates elsewhere.' },
        { question: 'Is a card with an annual fee worth it?', answer: 'A card with a $95 annual fee is worth it if your rewards exceed $95/year. Many premium cards offset fees with travel credits, lounge access, or high reward rates.' },
        { question: 'Does cashback expire?', answer: 'Most US cashback rewards do not expire as long as the account is open and in good standing. Always check your card agreement.' }
      ]
    },
    compute(values) {
      const generalCashback = (values.monthlySpend - values.bonusCategorySpend) * (values.cashbackRate / 100);
      const bonusCashback = values.bonusCategorySpend * (values.bonusCategoryRate / 100);
      const monthlyCashback = generalCashback + bonusCashback;
      const annualCashback = monthlyCashback * 12;
      const netAnnualValue = annualCashback - values.annualFee;
      const effectiveRate = values.monthlySpend > 0 ? (monthlyCashback / values.monthlySpend) * 100 : 0;
      return { monthlyCashback, annualCashback, netAnnualValue, effectiveRate };
    }
  },
  {
    id: 'emi-calculator',
    category: 'shopping',
    title: 'EMI Calculator',
    description: 'Calculate monthly EMI (Equated Monthly Installment) for US retail financing, buy-now-pay-later, or personal loans used for purchases.',
    example: 'Calculate monthly payments for a $1,500 laptop financed at 18% APR over 12 months.',
    inputs: [
      { id: 'loanAmount', label: 'Purchase / loan amount', type: 'currency', placeholder: '1500', defaultValue: 1500, step: 50, min: 0 },
      { id: 'annualRate', label: 'Annual interest rate (APR)', type: 'percent', placeholder: '18', defaultValue: 18, step: 0.25, min: 0 },
      { id: 'months', label: 'Loan term (months)', type: 'number', placeholder: '12', defaultValue: 12, step: 1, min: 1 },
      { id: 'downPayment', label: 'Down payment', type: 'currency', placeholder: '0', defaultValue: 0, step: 50, min: 0 }
    ],
    seo: {
      title: 'EMI Calculator – US Retail Financing and Buy Now Pay Later',
      description: 'Calculate monthly installment payments for retail financing, store credit, or personal loans. Shows total interest and true APR cost.',
      faq: [
        { question: 'What APR do US retailers typically charge?', answer: 'Store credit cards often charge 25–30% APR. BNPL services may be 0% promotional for 6–18 months, reverting to 20–30% after. Personal loans range from 6–36% depending on credit score.' },
        { question: 'What is deferred interest?', answer: 'Some US store cards offer 0% promotional financing but charge retroactive interest if the balance is not paid in full by the end of the promo period. This is different from a true 0% loan.' },
        { question: 'How do I compare financing offers?', answer: 'Always compare APR, not monthly payment. A lower monthly payment with a longer term often costs more in total interest.' }
      ]
    },
    compute(values) {
      const principal = Math.max(0, values.loanAmount - values.downPayment);
      const monthlyRate = values.annualRate / 100 / 12;
      const emi = monthlyRate === 0
        ? principal / values.months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, values.months)) / (Math.pow(1 + monthlyRate, values.months) - 1);
      const totalPayment = emi * values.months;
      const totalInterest = totalPayment - principal;
      return { emi, totalPayment, totalInterest, principal };
    }
  },
  // ── Social & Content ───────────────────────────────────────────────────────
  {
    id: 'youtube-earnings-calculator',
    category: 'social',
    title: 'YouTube Earnings Estimator',
    description: 'Estimate monthly and annual YouTube ad revenue based on views, RPM, and content niche.',
    example: 'Estimate earnings for a channel with 500,000 monthly views and $4 RPM.',
    inputs: [
      { id: 'monthlyViews', label: 'Monthly video views', type: 'number', placeholder: '500000', defaultValue: 500000, step: 10000, min: 0 },
      { id: 'rpm', label: 'Revenue per 1,000 views (RPM $)', type: 'currency', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'ctr', label: 'Ad click-through rate (%)', type: 'percent', placeholder: '1.5', defaultValue: 1.5, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'YouTube Earnings Estimator – Ad Revenue Calculator',
      description: 'Estimate YouTube AdSense revenue based on views and RPM. Understand what factors affect earnings in different content niches.',
      faq: [
        { question: 'What is YouTube RPM?', answer: 'RPM (Revenue Per Mille) is how much a creator earns per 1,000 views after YouTube takes its 45% cut. Finance and tech channels earn $8–$20+ RPM; entertainment is $1–$4.' },
        { question: 'How many views do you need to make money on YouTube?', answer: 'You need 1,000 subscribers and 4,000 watch hours in 12 months to join the YouTube Partner Program. At $3–$5 RPM, 100,000 views/month earns roughly $300–$500.' },
        { question: 'What percentage does YouTube take?', answer: 'YouTube keeps 45% of ad revenue and pays creators 55%. RPM already reflects the creator\'s 55% share.' }
      ]
    },
    compute(values) {
      const monthlyEarnings = (values.monthlyViews / 1000) * values.rpm;
      const annualEarnings = monthlyEarnings * 12;
      const estimatedClicks = values.monthlyViews * (values.ctr / 100);
      return { monthlyEarnings, annualEarnings, estimatedClicks };
    }
  },
  {
    id: 'instagram-engagement-calculator',
    category: 'social',
    title: 'Instagram Engagement Calculator',
    description: 'Calculate engagement rate for Instagram posts and estimate sponsored post value based on follower count and engagement.',
    example: 'Calculate engagement rate for an account with 50,000 followers and an average of 1,200 likes and 80 comments per post.',
    inputs: [
      { id: 'followers', label: 'Follower count', type: 'number', placeholder: '50000', defaultValue: 50000, step: 1000, min: 100 },
      { id: 'avgLikes', label: 'Average likes per post', type: 'number', placeholder: '1200', defaultValue: 1200, step: 50, min: 0 },
      { id: 'avgComments', label: 'Average comments per post', type: 'number', placeholder: '80', defaultValue: 80, step: 5, min: 0 },
      { id: 'avgShares', label: 'Average saves / shares per post', type: 'number', placeholder: '40', defaultValue: 40, step: 5, min: 0 }
    ],
    seo: {
      title: 'Instagram Engagement Rate Calculator',
      description: 'Calculate Instagram engagement rate and estimate sponsored post value. Understand what constitutes good engagement for influencer marketing.',
      faq: [
        { question: 'What is a good Instagram engagement rate?', answer: 'Average engagement is 1–3%. Nano-influencers (1k–10k followers) often see 4–8%. Mega-influencers (1M+) typically see under 1.5%.' },
        { question: 'How is sponsored post value estimated?', answer: 'A common rule of thumb is $100 per 10,000 followers as a baseline, adjusted upward for high engagement rates. CPM-based pricing ranges from $5–$25 per 1,000 followers depending on niche.' },
        { question: 'What counts as engagement?', answer: 'Likes, comments, shares, and saves all count. Comments and saves are weighted more heavily by the Instagram algorithm as they indicate deeper interest.' }
      ]
    },
    compute(values) {
      const totalEngagement = values.avgLikes + values.avgComments + values.avgShares;
      const engagementRate = values.followers > 0 ? (totalEngagement / values.followers) * 100 : 0;
      const estimatedPostValue = (values.followers / 10000) * 100 * (engagementRate > 3 ? 1.5 : 1);
      const cpm = values.followers > 0 ? (estimatedPostValue / values.followers) * 1000 : 0;
      return { totalEngagement, engagementRate, estimatedPostValue, cpm };
    }
  },
  {
    id: 'electricity-bill-calculator',
    category: 'home',
    title: 'Electricity Bill Estimator',
    description: 'Estimate your monthly electricity bill based on appliance usage and local utility rates.',
    example: 'Estimate monthly bill for a home using 900 kWh at $0.16/kWh with $12 fixed charges.',
    inputs: [
      { id: 'monthlyKwh', label: 'Monthly usage (kWh)', type: 'number', placeholder: '900', defaultValue: 900, step: 10, min: 0 },
      { id: 'ratePerKwh', label: 'Rate per kWh ($)', type: 'currency', placeholder: '0.16', defaultValue: 0.16, step: 0.01, min: 0 },
      { id: 'fixedCharges', label: 'Fixed monthly charges (delivery, taxes)', type: 'currency', placeholder: '12', defaultValue: 12, step: 1, min: 0 },
      { id: 'tieredThreshold', label: 'Tiered rate threshold (kWh, 0 = no tier)', type: 'number', placeholder: '0', defaultValue: 0, step: 50, min: 0 },
      { id: 'tieredRate', label: 'Rate above threshold ($/kWh)', type: 'currency', placeholder: '0.22', defaultValue: 0.22, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'Electricity Bill Estimator – Monthly kWh Cost Calculator',
      description: 'Estimate your monthly electricity bill using kWh usage, utility rates, fixed charges, and tiered pricing common in US utility plans.',
      faq: [
        { question: 'What is the average US electricity bill?', answer: 'The average US household uses about 900 kWh/month, with bills averaging $115–$140 depending on state. Southern states tend to use more (AC), while Northeast states pay higher rates.' },
        { question: 'What are tiered electricity rates?', answer: 'Many US utilities charge a lower rate for the first block of usage (e.g., first 500 kWh) and a higher rate for usage above that threshold.' },
        { question: 'How can I reduce my electricity bill?', answer: 'Switch to LED lighting, use a programmable thermostat, run appliances during off-peak hours, and consider a time-of-use rate plan if your utility offers one.' }
      ]
    },
    compute(values) {
      let energyCharge: number;
      if (values.tieredThreshold > 0 && values.monthlyKwh > values.tieredThreshold) {
        energyCharge = values.tieredThreshold * values.ratePerKwh + (values.monthlyKwh - values.tieredThreshold) * values.tieredRate;
      } else {
        energyCharge = values.monthlyKwh * values.ratePerKwh;
      }
      const totalBill = energyCharge + values.fixedCharges;
      const costPerDay = totalBill / 30;
      const annualBill = totalBill * 12;
      const effectiveRatePerKwh = values.monthlyKwh > 0 ? totalBill / values.monthlyKwh : 0;
      return { energyCharge, totalBill, costPerDay, annualBill, effectiveRatePerKwh };
    }
  },
  {
    id: 'fuel-cost-calculator',
    category: 'auto',
    title: 'Fuel Cost Calculator',
    description: 'Calculate annual fuel costs for your vehicle based on mileage, MPG, and gas prices. Compare gas vs diesel vs hybrid savings.',
    example: 'Find annual fuel cost for a vehicle driven 15,000 miles/year at 28 MPG and $3.75/gallon.',
    inputs: [
      { id: 'annualMiles', label: 'Annual miles driven', type: 'number', placeholder: '15000', defaultValue: 15000, step: 500, min: 0 },
      { id: 'mpg', label: 'Vehicle MPG', type: 'number', placeholder: '28', defaultValue: 28, step: 0.5, min: 1 },
      { id: 'gasPricePerGallon', label: 'Gas price ($/gallon)', type: 'currency', placeholder: '3.75', defaultValue: 3.75, step: 0.05, min: 0 },
      { id: 'comparisonMpg', label: 'Comparison vehicle MPG (optional)', type: 'number', placeholder: '45', defaultValue: 45, step: 0.5, min: 1 }
    ],
    seo: {
      title: 'Fuel Cost Calculator – Annual Gas Savings and MPG Comparison',
      description: 'Calculate your annual fuel cost and compare fuel expenses between two vehicles. See how much you save by switching to a more fuel-efficient car.',
      faq: [
        { question: 'What is the average US gas price?', answer: 'US average gasoline prices fluctuate. Regular unleaded has averaged $3.00–$4.00/gallon in recent years. Check GasBuddy or AAA for current local prices.' },
        { question: 'How many miles does the average American drive per year?', answer: 'The US average is approximately 14,000–15,000 miles per year, but commuters in car-dependent areas often drive 20,000+ miles.' },
        { question: 'How much do I save with a fuel-efficient car?', answer: 'Switching from 25 MPG to 40 MPG saves about $900/year at $3.75/gallon driving 15,000 miles. Hybrids and EVs can save $1,500–$2,500 annually over average gas vehicles.' }
      ]
    },
    compute(values) {
      const gallonsPerYear = values.annualMiles / values.mpg;
      const annualCost = gallonsPerYear * values.gasPricePerGallon;
      const monthlyCost = annualCost / 12;
      const costPerMile = values.gasPricePerGallon / values.mpg;
      const comparisonCost = (values.annualMiles / values.comparisonMpg) * values.gasPricePerGallon;
      const annualSavings = Math.max(0, annualCost - comparisonCost);
      return { gallonsPerYear, annualCost, monthlyCost, costPerMile, comparisonCost, annualSavings };
    }
  },
  // ── Custom-component stubs (rendered by special components in page.tsx) ────
  {
    id: 'currency-converter',
    category: 'finance',
    title: 'Currency Converter',
    description: 'Convert between 30+ world currencies using reference exchange rates. Includes USD, EUR, GBP, JPY, CAD, AUD, INR, and more.',
    example: 'Convert $500 USD to Euros, British Pounds, or Japanese Yen.',
    inputs: [],
    seo: {
      title: 'Currency Converter – 30+ World Currencies',
      description: 'Convert between USD, EUR, GBP, JPY, CAD, AUD, INR, and 25+ more currencies. Quick reference rates for travel and international transfers.',
      faq: [
        { question: 'Are these exchange rates live?', answer: 'These are reference rates for estimation. For transactions, always check your bank, Wise, or Google Finance for the current mid-market rate.' },
        { question: 'What is the mid-market rate?', answer: 'The mid-market rate is the midpoint between buy and sell rates on global currency markets. Banks and money transfer services add a markup (spread) on top of this rate.' },
        { question: 'Which currencies are included?', answer: 'USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, MXN, BRL, KRW, SGD, HKD, and 16 more major currencies.' }
      ]
    },
    compute() { return {}; }
  },
  {
    id: 'character-counter',
    category: 'social',
    title: 'Character Counter',
    description: 'Count characters, words, sentences, and paragraphs. See how your text fits within platform limits for Twitter/X, Instagram, LinkedIn, and more.',
    example: 'Check if a tweet fits within the 280-character Twitter/X limit.',
    inputs: [],
    seo: {
      title: 'Character Counter – Words, Sentences, Platform Limits',
      description: 'Count characters, words, sentences, and paragraphs in your text. Instantly see platform limits for Twitter/X (280), Instagram (2200), LinkedIn (3000), and more.',
      faq: [
        { question: 'What is the Twitter character limit?', answer: 'Twitter/X allows 280 characters per tweet for standard accounts. URLs are counted as 23 characters regardless of length.' },
        { question: 'What is the Instagram caption limit?', answer: 'Instagram captions can be up to 2,200 characters, but only the first 125 characters show before the "more" cutoff in feed.' },
        { question: 'How is reading time calculated?', answer: 'Reading time is estimated at 200 words per minute, which is average for online content reading.' }
      ]
    },
    compute() { return {}; }
  },
  {
    id: 'hashtag-counter',
    category: 'social',
    title: 'Hashtag Counter',
    description: 'Count and extract unique hashtags from your caption or post. Check Instagram\'s 30-hashtag limit and see all tags at a glance.',
    example: 'Count hashtags in an Instagram caption and verify you are within the 30-hashtag limit.',
    inputs: [],
    seo: {
      title: 'Hashtag Counter – Instagram and Social Media Hashtag Tool',
      description: 'Count unique hashtags in your post caption. Checks Instagram\'s 30-hashtag limit and lists all detected tags. Works for Instagram, TikTok, and Twitter.',
      faq: [
        { question: 'How many hashtags should I use on Instagram?', answer: 'Instagram allows up to 30 hashtags per post. Research suggests 3–11 highly relevant hashtags often outperform maxing out the limit with irrelevant tags.' },
        { question: 'Do hashtags work on all platforms?', answer: 'Hashtags work on Instagram, TikTok, Twitter/X, LinkedIn, and Facebook. Pinterest and YouTube also support them. They have no effect on WhatsApp or Messenger.' }
      ]
    },
    compute() { return {}; }
  },
  {
    id: 'pomodoro-timer',
    category: 'time',
    title: 'Pomodoro Timer',
    description: 'A configurable Pomodoro timer with focus sessions, short breaks, long breaks, and session tracking. Based on the Pomodoro Technique.',
    example: 'Run 4 × 25-minute focus sessions with 5-minute breaks and a 15-minute long break.',
    inputs: [],
    seo: {
      title: 'Pomodoro Timer – Focus and Break Timer',
      description: 'Configurable Pomodoro timer with customizable focus sessions, short breaks, and long breaks. Tracks completed pomodoros and supports the full Pomodoro Technique.',
      faq: [
        { question: 'What is the Pomodoro Technique?', answer: 'Developed by Francesco Cirillo, the Pomodoro Technique uses 25-minute focused work sessions separated by 5-minute breaks. After 4 sessions, take a longer 15-30 minute break.' },
        { question: 'Can I customize the timer durations?', answer: 'Yes. Adjust focus, short break, and long break durations, and set how many pomodoros before a long break.' },
        { question: 'Why is it called Pomodoro?', answer: 'Pomodoro is Italian for tomato. Cirillo used a tomato-shaped kitchen timer as a university student when he developed the technique.' }
      ]
    },
    compute() { return {}; }
  },
  {
    id: 'timezone-meeting-planner',
    category: 'time',
    title: 'Time Zone Meeting Planner',
    description: 'Find a meeting time that works across multiple US and international time zones. See current time in all major zones simultaneously.',
    example: 'Plan a meeting for New York, London, and Tokyo participants.',
    inputs: [],
    seo: {
      title: 'Time Zone Meeting Planner – Global Meeting Scheduler',
      description: 'Plan meetings across US and international time zones. Enter a time and see it converted for New York, London, Paris, Dubai, Mumbai, Singapore, Tokyo, Sydney, and more.',
      faq: [
        { question: 'What are the US time zones?', answer: 'The contiguous US has 4 zones: Eastern (ET, UTC-5/-4), Central (CT, UTC-6/-5), Mountain (MT, UTC-7/-6), and Pacific (PT, UTC-8/-7). Alaska and Hawaii have their own zones.' },
        { question: 'What is UTC?', answer: 'UTC (Coordinated Universal Time) is the global time standard. US Eastern time is UTC-5 in winter (EST) and UTC-4 in summer (EDT) due to daylight saving time.' },
        { question: 'When does daylight saving time change in the US?', answer: 'US clocks spring forward the second Sunday in March and fall back the first Sunday in November. Not all states observe DST — Arizona (except Navajo Nation) and Hawaii do not.' }
      ]
    },
    compute() { return {}; }
  }
];

export function findCalculator(slug: string) {
  return calculators.find((calculator) => calculator.id === slug);
}

export function findCategoryCalculators(categoryId: string) {
  return calculators.filter((calculator) => calculator.category === categoryId);
}
