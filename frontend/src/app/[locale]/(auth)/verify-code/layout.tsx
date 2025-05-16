import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.verifyCode.meta');
  const tCommon = await getTranslations('common.meta');

  return {
    title: tCommon('titleTemplate', { title: t('title') }),
    description: t('description'),
  };
}

export default async function VerifyCodeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
