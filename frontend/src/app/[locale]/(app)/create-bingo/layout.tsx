import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('create-bingo.meta');

  return {
    title: t('title'),
    description: t('description'),
  };
}
export default async function CreateBingoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
