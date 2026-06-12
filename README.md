# Daily Calculations: tools for everyday decisions.

A lightweight calculator website built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Features

- SEO-first architecture with static generation
- Reusable, config-driven calculator engine — add a calculator by adding one object to `data/calculators.ts`
- U.S.-default units, currency formatting, and tax-focused tools
- Lightweight, mobile-first UI with dark mode support
- Instant search and category-first navigation
- Sitemap and robots.txt generation
- Multi-language support (en, de, fr, es, it) via next-intl
- Static info pages — About, Contact, Privacy Policy, Terms & Conditions
- Suggestion form with GitHub issue creation

## Calculators

### Finance
- Mortgage Calculator
- Loan Calculator
- Compound Interest Calculator
- Paycheck Calculator
- Investment Calculator

### Taxes
- Sales Tax Calculator
- Tip Calculator

### Health
- BMI Calculator
- Water Intake Calculator
- Calorie Calculator
- TDEE Calculator

### Measurements
- Miles to Kilometers Converter
- Fahrenheit to Celsius Converter
- Pounds to Kilograms Converter
- Gallons to Liters Converter

### Auto
- Car Payment Calculator
- Gas Cost Calculator

### Home
- Unit Price Calculator

### Time & Date
- Age Calculator

### Education
- GPA Calculator

## Project structure

- `app/[locale]/` — Next.js App Router pages (calculators, categories, about, contact, privacy-policy, terms, suggestions)
- `app/api/issues/` — GitHub issue creation endpoint for the suggestion form
- `components/` — UI components (Header, Footer, CalculatorForm, CalculatorCard, CalculatorSearch, CategoryCard, ThemeProvider, LanguageSwitcher)
- `data/calculators.ts` — all calculator configs, category definitions, and compute functions
- `lib/` — calculator evaluation engine and SEO helpers
- `i18n/` — locale routing and translation config
- `messages/` — translation strings for en, de, fr, es, it
- `middleware.ts` — next-intl middleware for locale routing

## Scripts

- `npm run dev` — start development server
- `npm run build` — build production output
- `npm run start` — run production server

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to view the site.

## Adding a calculator

All calculators live in `data/calculators.ts`. Add a new entry to the `calculators` array with an `id`, `category`, `title`, `description`, `example`, `inputs`, `seo`, and `compute` function. The dynamic `[slug]` route, sitemap, and search index pick it up automatically — no new files needed.
