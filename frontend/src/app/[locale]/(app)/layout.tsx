import { redirect } from 'next/navigation';
import { Fragment } from 'react';

import { getAuthenticatedUser } from '@/api/auth';
import Navbar from '@/common/navbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    // TODO: Should include 'after sign-in redirect' params
    return redirect('/sign-in');
  }

  // TODO: app sidebar
  return (
    <Fragment>
      <Navbar mode="app" />
      {children}
    </Fragment>
  );
}
