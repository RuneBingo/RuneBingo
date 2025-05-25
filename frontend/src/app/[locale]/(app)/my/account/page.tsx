import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getAuthenticatedUser } from '@/api/auth';
import Page from '@/design-system/components/page/page';
import { Title } from '@/design-system/components/title';

import Form from './form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('my.account.meta');
  const tCommon = await getTranslations('common.meta');

  return {
    title: tCommon('titleTemplate', { title: t('title') }),
    description: t('description'),
  };
}
export default async function MyAccountPage() {
  const user = (await getAuthenticatedUser())!;
  const t = await getTranslations('my.account');

  return (
    <Page>
      <Title.Primary>{t('title')}</Title.Primary>
      <Form user={user} />
    </Page>
  );
}
