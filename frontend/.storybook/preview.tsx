import type { Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';
import { Toaster } from 'sonner';

import '../src/app/[locale]/globals.css';

// Import English messages for Storybook
import authMessages from '../src/i18n/en/auth.json';
import bingoMessages from '../src/i18n/en/bingo.json';
import commonMessages from '../src/i18n/en/common.json';
import myMessages from '../src/i18n/en/my.json';
import siteMessages from '../src/i18n/en/site.json';

const messages = {
  auth: authMessages,
  bingo: bingoMessages,
  common: commonMessages,
  my: myMessages,
  site: siteMessages,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Storybook decorator to wrap stories with necessary providers
const withProviders = (Story: React.ComponentType) => (
  <QueryClientProvider client={queryClient}>
    <NextIntlClientProvider locale="en" messages={messages}>
      <Story />
      <Toaster />
    </NextIntlClientProvider>
  </QueryClientProvider>
);

const preview: Preview = {
  decorators: [withProviders],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
