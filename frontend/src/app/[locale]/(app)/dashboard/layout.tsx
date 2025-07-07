import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard.meta');

  return {
    title: t('title'),
    description: t('description'),
  };
}
export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
