export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type MessageModule = (typeof MESSAGE_MODULES)[number];

export const SUPPORTED_LOCALES = ['en', 'fr'] as const;

export const DEFAULT_LOCALE = 'en' as const satisfies SupportedLocale;

export const MESSAGE_MODULES = [
  'auth',
  'common',
  'bingo',
  'my',
  'site',
  'dashboard',
  'create-bingo',
  'bingo-participant',
  'bingo-invitation',
] as const;
