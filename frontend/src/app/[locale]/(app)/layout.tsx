import { redirect } from 'next/navigation';

import { getAuthenticatedUser } from '@/api/auth';
import Navbar from '@/common/navbar';
import Sidebar from '@/common/sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    // TODO: Should include 'after sign-in redirect' params
    return redirect('/sign-in');
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar mode="app" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="w-full overflow-y-auto bg-muted/30 p-8">{children}</main>
      </div>
    </div>
  );
}
