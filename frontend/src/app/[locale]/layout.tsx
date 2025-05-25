import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { getAuthenticatedUser } from '@/api/auth';
import { type SupportedLocale } from '@/i18n';
import { routing } from '@/i18n/routing';
import { redirectToPreferredLocale } from '@/i18n/server';

import './globals.css';
import ClientProviders from './client-providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common.meta');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: SupportedLocale }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const user = await getAuthenticatedUser();
  console.log('req 1', user);
  const user2 = await getAuthenticatedUser();
  console.log('req 2', user2);
  const user3 = await getAuthenticatedUser();
  console.log('req 3', user3);
  const user4 = await getAuthenticatedUser();
  console.log('req 4', user4);
  const user5 = await getAuthenticatedUser();
  console.log('req 5', user5);
  const user6 = await getAuthenticatedUser();
  console.log('req 6', user6);
  await redirectToPreferredLocale(user);

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider>
          <ClientProviders user={user}>{children}</ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
