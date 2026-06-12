import { redirect } from 'next/navigation';

export default async function AboutUsRedirect({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/about`);
}
