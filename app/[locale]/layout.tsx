import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { siteName, siteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: {
    default: `Free Online Calculator — Mortgage, BMI, Loan, GPA & More | ${siteName}`,
    template: `%s | ${siteName}`
  },
  description: 'Use free online calculators for mortgage, BMI, loan, GPA, compound interest, auto loan, calorie, paycheck, age, investment, TDEE, and more. Fast, accurate, no signup required.',
  keywords: [
    'calculator', 'mortgage calculator', 'bmi calculator', 'calorie calculator',
    'loan calculator', 'gpa calculator', 'compound interest calculator',
    'auto loan calculator', 'car loan calculator', 'scientific calculator',
    'percentage calculator', 'car payment calculator', 'paycheck calculator',
    'age calculator', 'investment calculator', 'tdee calculator',
    'final grade calculator', 'graphing calculator', 'time calculator'
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: `Free Online Calculator — Mortgage, BMI, Loan, GPA & More | ${siteName}`,
    description: 'Use free online calculators for mortgage, BMI, loan, GPA, compound interest, auto loan, calorie, paycheck, age, investment, TDEE, and more.',
    type: 'website',
    url: siteUrl,
    siteName,
    images: [
      {
        url: `${siteUrl}/web-app-manifest-192x192.png`,
        width: 192,
        height: 192,
        alt: `${siteName} — Free Online Calculators`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Free Online Calculator — Mortgage, BMI, Loan, GPA & More | ${siteName}`,
    description: 'Use free online calculators for mortgage, BMI, loan, GPA, compound interest, auto loan, calorie, paycheck, age, investment, TDEE, and more.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  },
  manifest: '/site.webmanifest'
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
