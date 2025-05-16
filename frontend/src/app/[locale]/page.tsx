import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Fragment } from 'react';

import Navbar from '@/common/navbar';
import Page from '@/design-system/components/page/page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('site.home.meta');
  const tCommon = await getTranslations('common.meta');

  return {
    title: tCommon('titleTemplate', { title: t('title') }),
    description: t('description'),
  };
}

export default async function Home() {
  const t = await getTranslations('site.home');

  return (
    <Fragment>
      <Navbar mode="site" />
      <Page>
        <div /* TODO: stylize this Hero section */>
          <p>{t('hero.subtitle')}</p>
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.description')}</p>
        </div>
      </Page>
    </Fragment>
  );
}
