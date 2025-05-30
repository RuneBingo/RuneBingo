import { clsx, type ClassValue } from 'clsx';
import { enCA, frCA, type Locale } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function assignSubComponents<Component extends React.FC, SubComponents extends Record<string, React.FC>>(
  component: Component,
  subComponents: SubComponents,
) {
  const ComponentWithSubComponents = component as Component & SubComponents;

  Object.assign(ComponentWithSubComponents, subComponents);

  return ComponentWithSubComponents;
}

/**
 * Maps app locale strings to date-fns Locale objects
 * Supports partial locale matching (e.g., 'en-US' -> 'en')
 */
export function getDateFnsLocale(locale: string): Locale {
  const normalizedLocale = locale.toLowerCase();
  const baseLocale = normalizedLocale.split('-')[0];

  switch (baseLocale) {
    case 'fr':
      return frCA;
    case 'en':
    default:
      return enCA;
  }
}
