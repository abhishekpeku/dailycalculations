import type { Metadata } from 'next';
import { calculators, categories } from '@/data/calculators';

export const siteName = 'Daily Calculations';
export const siteUrl = 'https://dailycalculations.app';

export const homeFaqs = [
  {
    question: 'What is Daily Calculations?',
    answer: 'Daily Calculations is a free online calculator website for everyday decisions, including finance, health, measurements, taxes, auto, home, time, and education tools.'
  },
  {
    question: 'How do I calculate 15% of a total?',
    answer: 'To calculate 15% of a total, multiply the total by 0.15. For example, 15% of $80 is 80 x 0.15 = $12.'
  },
  {
    question: 'How do I calculate a mortgage payment?',
    answer: 'Use the mortgage calculator with your loan amount, annual interest rate, loan term, and down payment. It estimates the monthly payment, total cost, total interest, and loan principal.'
  },
  {
    question: 'How do I calculate sales tax on a purchase?',
    answer: 'Multiply the purchase amount by the sales tax rate, then add the tax amount to the original price. The sales tax calculator does this instantly for any rate you enter.'
  },
  {
    question: 'How do I calculate a tip and split the bill?',
    answer: 'Enter the bill amount, tip percentage, and number of people in the tip calculator. It shows the tip amount, total bill, and each person\'s share.'
  },
  {
    question: 'How do I calculate BMI using pounds and inches?',
    answer: 'BMI is calculated as weight in pounds divided by height in inches squared, then multiplied by 703. The BMI calculator uses this standard U.S. formula.'
  },
  {
    question: 'How do I convert miles to kilometers?',
    answer: 'Multiply miles by 1.60934 to convert to kilometers. For example, 10 miles is about 16.09 kilometers.'
  },
  {
    question: 'How do I convert Fahrenheit to Celsius?',
    answer: 'Subtract 32 from the Fahrenheit temperature, then multiply by 5/9. For example, 68 F is 20 C.'
  },
  {
    question: 'How do I calculate compound interest?',
    answer: 'Compound interest grows from both your starting balance and accumulated interest. Enter your starting balance, annual rate, years, and monthly contribution to estimate future value.'
  },
  {
    question: 'How do I estimate my car payment?',
    answer: 'Use the car payment calculator with the car price, down payment, annual interest rate, and loan term. It estimates your monthly payment and total interest.'
  },
  {
    question: 'How do I calculate gas cost for a trip?',
    answer: 'Divide trip distance by your vehicle MPG, then multiply by the fuel price per gallon. The gas cost calculator also shows the estimated gallons needed.'
  },
  {
    question: 'How do I calculate GPA?',
    answer: 'Multiply each course grade point by its credit hours, add the results, then divide by total credit hours. The GPA calculator supports common 4.0 scale planning.'
  },
  {
    question: 'Are Daily Calculations calculators free to use?',
    answer: 'Yes. Daily Calculations calculators are free to use, require no signup, and show results instantly in your browser.'
  },
  {
    question: 'Are the results financial, tax, or medical advice?',
    answer: 'No. Daily Calculations provides estimates based on the numbers you enter. For financial, tax, legal, or medical decisions, review the results with a qualified professional.'
  }
];

export function buildCalculatorMetadata(slug: string): Metadata {
  const calculator = calculators.find((item) => item.id === slug);
  if (!calculator) {
    return {
      title: `Calculator — ${siteName}`,
      description: 'Lightweight calculator tool.'
    };
  }

  const title = `${calculator.title} | ${siteName}`;
  const description = calculator.seo.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export function buildCategoryMetadata(categoryId: string): Metadata {
  const category = categories.find((item) => item.id === categoryId);
  if (!category) {
    return {
      title: `Category — ${siteName}`,
      description: 'Browse calculator categories.'
    };
  }

  const title = `${category.title} calculators | ${siteName}`;
  const description = `${category.description} Explore calculators in this category.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website'
    }
  };
}

export function buildPageJsonLd(slug: string) {
  const calculator = calculators.find((item) => item.id === slug);
  if (!calculator) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': calculator.seo.faq.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

export function buildHomeJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': siteName,
      'url': siteUrl,
      'description': 'Free online calculators for mortgage, BMI, loan, GPA, compound interest, auto loan, calorie, paycheck, age, investment, TDEE, and more.',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${siteUrl}/calculators?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': siteName,
      'url': siteUrl,
      'logo': `${siteUrl}/web-app-manifest-192x192.png`
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': homeFaqs.map((faq) => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    }
  ];
}
