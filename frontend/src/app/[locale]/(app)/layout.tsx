import { redirect } from 'next/navigation';

import { getAuthenticatedUser } from '@/api/auth';
import Navbar from '@/common/navbar';
import Sidebar from '@/common/sidebar';
import Scrollbar from '@/design-system/components/scrollbar/scrollbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    // TODO: Should include 'after sign-in redirect' params
    return redirect('/sign-in');
  }

  return (
    <div className="h-full">
      <Navbar mode="app" />
      <div className="flex min-h-[calc(100vh-var(--navbar-height))]">
        <Sidebar />
        <Scrollbar vertical className="flex-1">
          {children}
        </Scrollbar>
      </div>
    </div>
  );
}
