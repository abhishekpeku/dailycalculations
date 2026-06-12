import { redirect } from 'next/navigation';

export default async function ContactUsRedirect({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/contact`);
}
