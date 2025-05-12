import { redirect } from 'next/navigation';

import { getAuthenticatedUser } from '@/api/auth';

import ClientLayout from './client-layout';

export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getAuthenticatedUser();

  if (user) return redirect('/');

  return <ClientLayout>{children}</ClientLayout>;
}
