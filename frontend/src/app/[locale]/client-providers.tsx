'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

import { type AuthenticationDetailsDto } from '@/api/types';
import { ConfirmationModalProvider } from '@/common/confirmation-modal';
import AppContextProvider from '@/common/context';

const queryClient = new QueryClient();

type ClientProvidersProps = PropsWithChildren<{
  user: AuthenticationDetailsDto | null;
}>;

export default function ClientProviders({ children, user }: ClientProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider user={user}>
        <ConfirmationModalProvider>{children}</ConfirmationModalProvider>
      </AppContextProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
