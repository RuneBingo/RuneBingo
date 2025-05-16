'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

import { type GetAuthenticatedUserResult } from '@/api/auth';

import { type SupportedLocale, MESSAGE_MODULES } from '.';
export async function loadMessages(locale: SupportedLocale) {
  return Object.fromEntries(
    await Promise.all(
      MESSAGE_MODULES.map(async (moduleName) => [moduleName, (await import(`./${locale}/${moduleName}.json`)).default]),
    ),
  );
}

export async function redirectToPreferredLocale(user: GetAuthenticatedUserResult | null) {
  const locale = await getLocale();
  if (!user?.language || user.language === locale) return;

  const headersList = await headers();
  const pathname = headersList.get('x-next-url') ?? '/';
  const urlLocale = pathname.split('/')[1];

  if (user.language === urlLocale) return;

  const newPath = pathname.replace(`/${urlLocale}`, `/${user.language}`);

  if (newPath !== pathname) {
    console.log('redirectToPreferredLocale:', pathname, '→', newPath);
    redirect(newPath);
  }
}
