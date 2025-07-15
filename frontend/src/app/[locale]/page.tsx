import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Fragment } from 'react'; //react fragment is used to group multiple elements without adding extre HTML around them

import Navbar from '@/common/navbar';
import Page from '@/design-system/components/page/page';

/*
Grabs translated text for the page title and description (from your translation files).

Returns metadata that Next.js uses to:
- Set the browser tab title
- Set the meta description (for SEO).
*/
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
