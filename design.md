# Daily Calculations — Design & Architecture Document (2026)

> **Status:** Actively implemented. This document describes both the original design goals and the current state of the project.

---

A lightweight, ultra-fast, SEO-optimized utility website focused primarily on users in the United States.

The website provides:

* measurement converters
* financial calculators
* tax calculators
* health calculators
* education calculators
* utility tools
* common U.S.-specific conversions and formulas

The platform must prioritize:

* speed
* simplicity
* SEO
* mobile usability
* accessibility
* low bandwidth usage
* easy navigation

The website should feel:

* instant
* clean
* trustworthy
* modern
* highly usable for everyday Americans

Avoid overengineering or unnecessary enterprise complexity.

---

# PRIMARY TARGET AUDIENCE

Primary audience:

* U.S. consumers
* students
* homeowners
* workers
* freelancers
* drivers
* small businesses
* fitness users
* finance users

The website should use:

* U.S. units by default
* U.S. currency formatting
* U.S. tax assumptions where relevant
* U.S. terminology and spelling

Examples:

* miles instead of kilometers
* Fahrenheit instead of Celsius
* pounds instead of kilograms
* feet/inches instead of centimeters
* USD formatting

---

# WEBSITE GOAL

Create a lightweight website similar in usefulness to:

* Calculator.net
* RapidTables
* OmniCalculator
* NerdWallet calculators

But with:

* modern UI
* better performance
* cleaner UX
* mobile-first experience
* reusable formula engine
* SEO-first architecture

---

# TECH STACK (IMPLEMENTED)

Frontend:

* Next.js 16.2.0 App Router
* React 19
* TypeScript
* Tailwind CSS
* next-intl (internationalization — en, de, fr, es, it)

Patterns used:

* Server Components by default
* Static Site Generation (`force-static`) for all calculator pages
* Minimal client hydration — only `CalculatorForm` is a Client Component
* Dynamic `[slug]` route handles all calculators — no per-calculator page files

Backend:

* Fully static — no database, no API routes (except sitemap.xml and robots.txt)

Deployment:

* Vercel (target)

---

# PERFORMANCE REQUIREMENTS

Target:

* Lighthouse score 95+
* near-instant page loads
* low JavaScript bundle size
* optimized Core Web Vitals
* mobile-first optimization

The site must work well:

* on mobile networks
* on older devices
* on low-power laptops

---

# CORE WEBSITE FEATURES

## U.S. Conversion Tools

Examples:

* feet ↔ centimeters
* miles ↔ kilometers
* pounds ↔ kilograms
* Fahrenheit ↔ Celsius
* gallons ↔ liters
* acres ↔ square feet
* MPG ↔ km/l
* inches ↔ mm
* cups ↔ ounces

---

# U.S. Financial Calculators

Examples:

* mortgage calculator
* loan calculator
* car payment calculator
* compound interest calculator
* retirement calculator
* paycheck calculator
* sales tax calculator
* tip calculator
* inflation calculator
* savings calculator
* credit card payoff calculator

Use realistic U.S. defaults:

* APR conventions
* U.S. tax assumptions
* USD formatting

---

# Health & Lifestyle Calculators

Examples:

* BMI calculator
* calorie calculator
* body fat calculator
* water intake calculator
* pace calculator
* pregnancy due date calculator

Use:

* U.S. health measurement defaults

---

# Everyday U.S. Utility Tools

Examples:

* age calculator
* time zone converter (U.S. states)
* ZIP code utility
* date difference calculator
* gas cost calculator
* unit price calculator
* hourly to salary converter
* overtime calculator

---

# SEO REQUIREMENTS (IMPLEMENTED)

Implemented:

* Static generation for all calculator pages (`force-static`)
* Per-calculator metadata via `buildCalculatorMetadata()` in `lib/seo.ts`
* FAQPage JSON-LD structured data on every calculator page
* WebSite + Organization schema on homepage
* Dynamic `sitemap.xml` generated from the `calculators` array
* `robots.txt` allowing all crawlers
* Open Graph and Twitter Card tags on every page
* Semantic HTML with proper heading hierarchy

---

# UI/UX REQUIREMENTS

Design philosophy:

* clean
* trustworthy
* lightweight
* distraction-free
* fast navigation

Requirements:

* responsive design
* dark/light mode
* mobile-first
* accessible
* keyboard friendly

Avoid:

* flashy animations
* cluttered dashboards
* excessive gradients
* unnecessary interactivity

---

# NAVIGATION STRUCTURE

Homepage features:

* popular calculators
* category grid
* quick search

Categories (implemented):

* Finance — Mortgage, Loan, Compound Interest, Paycheck, Investment
* Health — BMI, Water Intake, Calorie, TDEE
* Measurements — Miles↔km, Fahrenheit↔Celsius, Pounds↔kg, Gallons↔Liters
* Taxes — Sales Tax, Tip
* Auto — Car Payment, Gas Cost
* Home — Unit Price
* Time & Date — Age
* Education — GPA

Static pages (implemented):

* About — `/about`
* Contact — `/contact`
* Privacy Policy — `/privacy-policy`
* Terms & Conditions — `/terms`

---

# REUSABLE CALCULATOR ENGINE (IMPLEMENTED)

All calculators are configuration-driven entries in `data/calculators.ts`. Adding a calculator requires no new files — just a new object in the `calculators` array.

Shape of each entry:

```ts
{
  id: "mortgage-calculator",       // URL slug
  category: "finance",             // maps to a category in the categories array
  title: "Mortgage Calculator",
  description: "...",
  example: "...",
  inputs: [
    { id: "loanAmount", label: "Loan amount", type: "currency", placeholder: "350000", defaultValue: 350000, step: 1000, min: 0 }
  ],
  seo: {
    title: "...",
    description: "...",
    faq: [{ question: "...", answer: "..." }]
  },
  compute(values) {
    return { monthlyPayment: ... };  // keys become result cards automatically
  }
}
```

The `CalculatorForm` client component renders inputs and result cards generically from this config. Result card labels are derived from camelCase key names automatically.

---

# SEARCH EXPERIENCE

Implement:

* lightweight instant search
* category filtering
* keyboard-friendly navigation

Avoid heavy search infrastructure initially.

---

# ACCESSIBILITY

Implement:

* WCAG best practices
* semantic HTML
* proper contrast
* screen reader support

---

# MONETIZATION READY

Prepare optional support for:

* Google AdSense
* affiliate links
* sponsored financial tools

But keep the UI clean and fast.

---

# PROJECT STRUCTURE (ACTUAL)

```text
app/
  [locale]/
    layout.tsx                   — locale layout with ThemeProvider, Header, Footer
    page.tsx                     — homepage
    calculators/
      page.tsx                   — all calculators listing + search
      [slug]/page.tsx            — individual calculator page (dynamic, covers all calculators)
    categories/
      page.tsx                   — category grid
      [category]/page.tsx        — calculators filtered by category
    about/page.tsx               — about us page
    contact/page.tsx             — contact page
    privacy-policy/page.tsx      — privacy policy page
    terms/page.tsx               — terms & conditions page
    suggestions/page.tsx         — user suggestion form
  api/
    issues/route.ts              — GitHub issue creation endpoint (suggestions form)
  sitemap.xml/route.ts           — dynamic sitemap generated from calculators array
  robots.txt/route.ts            — robots.txt
components/
  CalculatorForm.tsx             — client component: inputs + live results
  CalculatorCard.tsx             — calculator listing card
  CalculatorSearch.tsx           — instant search
  CategoryCard.tsx / CategoryGrid.tsx
  Header.tsx / Footer.tsx
  ThemeProvider.tsx
  LanguageSwitcher.tsx
data/
  calculators.ts                 — all calculator configs, categories, compute functions
lib/
  calculator.ts                  — evaluateCalculator, number formatters
  seo.ts                         — metadata builders, JSON-LD generators
i18n/
  routing.ts                     — locale list and routing config
messages/
  en.json / de.json / fr.json / es.json / it.json  — translation strings for all locales
middleware.ts                    — next-intl middleware for locale routing
```

---

# DEVELOPMENT PRINCIPLES

* Keep dependencies minimal
* Prefer built-in Next.js capabilities
* Optimize for SEO
* Optimize for performance first
* Minimize hydration
* Minimize JavaScript
* Prefer server-side rendering

---

# DELIVERABLES (STATUS)

1. ✅ Complete architecture — Next.js App Router, static generation, i18n
2. ✅ Folder structure — app/, components/, data/, lib/, i18n/, messages/
3. ✅ Reusable calculator engine — config-driven, single `[slug]` route
4. ✅ Reusable conversion engine — converters implemented as calculators
5. ✅ SEO setup — metadata, JSON-LD, sitemap, robots.txt
6. ✅ U.S.-focused calculators — 20 calculators across 8 categories
7. ✅ Static info pages — About, Contact, Privacy Policy, Terms & Conditions
8. ✅ i18n middleware — next-intl middleware.ts for locale routing
9. ✅ Suggestions form — GitHub issue creation via API route
10. ⬜ Deployment setup — Vercel deployment not yet configured

---

# IMPORTANT ENGINEERING RULES

* Use Server Components by default
* Use client components only when required
* Keep bundle sizes small
* Avoid overengineering
* Optimize for low hosting costs
* Optimize for mobile users first

The final website should feel:

* extremely fast
* trustworthy
* modern
* lightweight
* intuitive
* SEO optimized
* built for U.S. users
