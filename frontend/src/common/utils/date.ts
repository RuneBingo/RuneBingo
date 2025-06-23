import { format, parse } from 'date-fns';

import { getDateFnsLocale } from '@/design-system/lib/utils';

export function formatDateToLocale(dateString: string | undefined, locale: string) {
  if (!dateString) return '';

  const dateFnsLocale = getDateFnsLocale(locale);
  const date = parse(dateString, 'yyyy-MM-dd', new Date());

  return format(date, 'PPP', { locale: dateFnsLocale });
}
