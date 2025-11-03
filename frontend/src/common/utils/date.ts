import { format, parse, parseISO } from 'date-fns';

import { getDateFnsLocale } from '@/design-system/lib/utils';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export function formatDateToLocale(dateString: string | undefined, locale: string) {
  if (!dateString) return '';

  const dateFnsLocale = getDateFnsLocale(locale);
  const date = parseDate(dateString);

  return format(date, 'PPP', { locale: dateFnsLocale });
}

export function parseDate(dateString: string) {
  if (dateRegex.test(dateString)) {
    return parse(dateString, 'yyyy-MM-dd', new Date());
  }

  return parseISO(dateString);
}
