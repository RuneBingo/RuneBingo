import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Fragment } from 'react';

import { getAuthenticatedUser } from '@/api/auth';
import { getBingo } from '@/api/bingo';
import Navbar from '@/common/navbar';
import type { ServerSidePageProps, ServerSideRootProps } from '@/common/types';
import Page from '@/design-system/components/page';

type Params = {
  bingoId: string;
};

export async function generateMetadata({ params }: ServerSideRootProps<Params>): Promise<Metadata> {
  const { bingoId } = await params;
  const response = await getBingo(bingoId);
  if (!response || 'error' in response) notFound();

  const tCommon = await getTranslations('common.meta');

  return {
    title: tCommon('titleTemplate', { title: response.data.title }),
    description: response.data.description,
  };
}

export default async function BingoLayout({ children, params }: ServerSidePageProps<Params>) {
  const { bingoId } = await params;
  const getBingoResponse = await getBingo(bingoId);
  if (!getBingoResponse || 'error' in getBingoResponse) notFound();

  const user = await getAuthenticatedUser();
  const navbarMode = user ? 'app' : 'site';

  return (
    <Fragment>
      <Navbar mode={navbarMode} />
      <Page>{children}</Page>
    </Fragment>
  );
}
