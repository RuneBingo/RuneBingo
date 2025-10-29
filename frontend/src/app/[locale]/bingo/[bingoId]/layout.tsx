import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getAuthenticatedUser } from '@/api/auth';
import { getBingo } from '@/api/bingo';
import Navbar from '@/common/navbar';
import Sidebar from '@/common/sidebar';
import type { ServerSidePageProps, ServerSideRootProps } from '@/common/types';
import Page from '@/design-system/components/page';
import Scrollbar from '@/design-system/components/scrollbar/scrollbar';

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
    <div className="h-full">
      <Navbar mode={navbarMode} />
      <div className="flex min-h-[calc(100vh-var(--navbar-height))]">
        <Sidebar />
        <Scrollbar vertical className="flex-1">
          <Page>{children}</Page>
        </Scrollbar>
      </div>
    </div>
  );
}
