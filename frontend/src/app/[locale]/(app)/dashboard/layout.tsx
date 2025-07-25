import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard.meta');
  const tCommon = await getTranslations('common.meta');

  return {
    title: tCommon('titleTemplate', { title: t('title') }),
  };
}
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
