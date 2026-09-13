import type { Metadata } from 'next';
import type { CalculatorHowToStep } from '@/data/calculators';
import { calculators, categories } from '@/data/calculators';
import { SITE_NAME, SITE_URL } from '@/lib/site';

/** Canonical URL for a root-relative path. Pass '' for the home page. */
export function buildCanonical(path: string) {
  return { canonical: `${SITE_URL}${path}` };
}

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
      title: 'Calculator',
      description: 'Lightweight calculator tool.'
    };
  }

  const title = calculator.title;
  // Layout's title.template already appends " | Daily Calculations" to `title` — but not to
  // openGraph/twitter, which need the full brand suffix spelled out here.
  const fullTitle = `${title} | ${SITE_NAME}`;
  const description = calculator.seo.description;

  return {
    title,
    description,
    alternates: buildCanonical(`/calculators/${calculator.id}`),
    openGraph: {
      title: fullTitle,
      description,
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description
    }
  };
}

export function buildCategoryMetadata(categoryId: string): Metadata {
  const category = categories.find((item) => item.id === categoryId);
  if (!category) {
    return {
      title: 'Category',
      description: 'Browse calculator categories.'
    };
  }

  const title = `${category.title} calculators`;
  // Layout's title.template already appends " | Daily Calculations" to `title` — but not to
  // openGraph, which needs the full brand suffix spelled out here.
  const fullTitle = `${title} | ${SITE_NAME}`;
  const description = `${category.description} Explore calculators in this category.`;

  return {
    title,
    description,
    alternates: buildCanonical(`/categories/${category.id}`),
    openGraph: {
      title: fullTitle,
      description,
      type: 'website'
    }
  };
}

export type Breadcrumb = {
  name: string;
  /** Root-relative. Absent on the current page, which is never a link. */
  href?: string;
};

/** Owned by `data/calculators.ts` so hand-written steps and derived ones cannot drift apart. */
export type HowToStep = CalculatorHowToStep;

/**
 * The trail rendered by `<Breadcrumb>` and serialised into BreadcrumbList JSON-LD.
 * Google cross-checks the two, so they must come from here and nowhere else.
 */
export function buildBreadcrumbs(slug: string): Breadcrumb[] {
  const calculator = calculators.find((item) => item.id === slug);
  if (!calculator) return [];

  const category = categories.find((item) => item.id === calculator.category);

  return [
    { name: 'Home', href: '' },
    { name: 'Calculators', href: '/calculators' },
    { name: category ? category.title : calculator.category, href: `/categories/${calculator.category}` },
    { name: calculator.title }
  ];
}

/**
 * The steps rendered in the "How to use" section and serialised into HowTo JSON-LD.
 * Hand-written steps win when the calculator has `content`; otherwise they are derived from the
 * input fields so they stay true as calculators change. The five calculators with custom
 * components have no `inputs` and fall back to generic steps.
 */
export function buildHowToSteps(slug: string): HowToStep[] {
  const calculator = calculators.find((item) => item.id === slug);
  if (!calculator) return [];

  if (calculator.content) return calculator.content.howTo.steps;

  const readResult = {
    name: 'Read the result',
    text: 'Results update instantly as you type — there is nothing to submit and no signup.'
  };

  if (calculator.inputs.length === 0) {
    return [
      { name: 'Enter your values', text: `Fill in the fields in the ${calculator.title} above.` },
      readResult
    ];
  }

  // Labels keep their own casing — lowercasing turns "APR" into "apr".
  return [
    ...calculator.inputs.map((input) => ({
      name: `Enter ${input.label}`,
      text: `Type your value into the "${input.label}" field — for example ${input.placeholder}.`
    })),
    readResult
  ];
}

export type RelatedLink = {
  id: string;
  href: string;
  /** An alias of the target, not its title — varied anchor text is the point (§1.4). */
  anchor: string;
  description: string;
};

/** Stable, order-independent hash. The pages are force-static, so anchor choice must be pure. */
function hashSlug(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 100000;
  }
  return hash;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * The visible "Also called ..." line under the H1. A sentence, not a keyword list.
 * Same aliases the WebApplication node lists as alternateName.
 */
export function buildAliasSentence(slug: string): string | null {
  const calculator = calculators.find((item) => item.id === slug);
  if (!calculator || calculator.aliases.length === 0) return null;

  const shown = calculator.aliases.slice(0, 4);
  const article = /^[aeiou]/i.test(shown[0]) ? 'an' : 'a';
  const list =
    shown.length === 1
      ? shown[0]
      : `${shown.slice(0, -1).join(', ')}, or ${shown[shown.length - 1]}`;

  return `Also called ${article} ${list}.`;
}

/**
 * The "Related calculators" block. Anchor text is an alias of the *target*, picked from a hash of
 * the *source* slug, so one calculator is linked under different wording from different pages —
 * 53 varied anchors instead of 53 copies of the same title.
 */
export function buildRelatedLinks(slug: string): RelatedLink[] {
  const calculator = calculators.find((item) => item.id === slug);
  if (!calculator) return [];

  const used = new Set<string>();
  const offset = hashSlug(slug);

  return calculator.related.flatMap((relatedId) => {
    const target = calculators.find((item) => item.id === relatedId);
    if (!target) return [];

    const options = target.aliases.length > 0 ? target.aliases : [target.title];
    let anchor = options[offset % options.length];
    // Two links on one page reading the same would be confusing — take the next alias instead.
    for (let i = 1; i < options.length && used.has(anchor); i += 1) {
      anchor = options[(offset + i) % options.length];
    }
    used.add(anchor);

    return [
      {
        id: target.id,
        href: `/calculators/${target.id}`,
        anchor: capitalize(anchor),
        description: target.description
      }
    ];
  });
}

export function buildPageJsonLd(slug: string) {
  const calculator = calculators.find((item) => item.id === slug);
  if (!calculator) return null;

  const url = `${SITE_URL}/calculators/${calculator.id}`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': calculator.title,
      'alternateName': calculator.aliases,
      'url': url,
      'description': calculator.seo.description,
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem': 'Any',
      'browserRequirements': 'Requires JavaScript',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'isAccessibleForFree': true
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': buildBreadcrumbs(slug).map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.name,
        ...(crumb.href === undefined ? {} : { 'item': `${SITE_URL}${crumb.href}` })
      }))
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': `How to use the ${calculator.title}`,
      'description': calculator.description,
      'url': `${url}#how-to-use`,
      'step': buildHowToSteps(slug).map((step, index) => ({
        '@type': 'HowToStep',
        'position': index + 1,
        'name': step.name,
        'text': step.text
      }))
    },
    {
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
    }
  ];
}

export function buildHomeJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': SITE_NAME,
      'url': SITE_URL,
      'description': 'Free online calculators for mortgage, BMI, loan, GPA, compound interest, auto loan, calorie, paycheck, age, investment, TDEE, and more.',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${SITE_URL}/calculators?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': SITE_NAME,
      'url': SITE_URL,
      'logo': `${SITE_URL}/web-app-manifest-192x192.png`
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
