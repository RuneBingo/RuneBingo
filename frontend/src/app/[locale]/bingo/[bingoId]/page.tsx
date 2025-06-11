import { CalendarCheckIcon, CalendarDaysIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { getAuthenticatedUser } from '@/api/auth';
import { getBingo } from '@/api/bingo';
import { BingoRoles } from '@/api/types';
import { type ServerSideRootProps } from '@/common/types';
import { formatDateToLocale } from '@/common/utils/date';
import Avatar from '@/design-system/components/avatar';
import { Title } from '@/design-system/components/title';

import Actions from './actions';
import StatusBadge from './status-badge';

type Params = {
  bingoId: string;
};

export default async function BingoCardPage({ params }: ServerSideRootProps<Params>) {
  const { bingoId } = await params;
  const response = await getBingo(bingoId);
  if ('error' in response) notFound();

  const bingo = response.data;
  const t = await getTranslations('bingo.bingoCard');
  const locale = await getLocale();
  const user = await getAuthenticatedUser();
  const isBingoOrganizer = (() => {
    if (!user?.currentBingo) return false;
    if (user.currentBingo?.id !== bingoId) return false;

    return [BingoRoles.Owner, BingoRoles.Organizer].includes(user.currentBingo.role);
  })();

  return (
    <div className="max-w-5xl">
      <StatusBadge status={bingo.status} className="mb-2" />
      <div className="w-full flex items-center justify-between mb-8">
        <Title.Primary className="!mb-0">{bingo.title}</Title.Primary>
        {isBingoOrganizer && <Actions bingo={bingo} />}
      </div>
      <div className="flex items-center gap-2.5 mb-2">
        <CalendarDaysIcon className="size-4" />
        <span className="text-sm font-medium">
          {t.rich('dateRangeHtml', {
            startDate: formatDateToLocale(bingo.startDate, locale),
            endDate: formatDateToLocale(bingo.endDate, locale),
            b: (chunks) => <b>{chunks}</b>,
          })}
        </span>
      </div>
      {bingo.maxRegistrationDate && (
        <div className="flex items-center gap-2.5 mb-6">
          <CalendarCheckIcon className="size-4" />
          <span className="text-sm font-medium">
            {t.rich('maxRegistrationDateHtml', {
              maxRegistrationDate: formatDateToLocale(bingo.maxRegistrationDate, locale),
              b: (chunks) => <b>{chunks}</b>,
            })}
          </span>
        </div>
      )}
      {bingo.createdBy && (
        // TODO: add system avatar fallback
        <div className="flex items-center gap-2 mb-6">
          <Avatar size={24} user={bingo.createdBy} />
          <span className="text-sm font-medium">
            {t.rich('createdByHtml', {
              username: bingo.createdBy.username,
              b: (chunks) => <b>{chunks}</b>,
            })}
          </span>
        </div>
      )}
      {bingo.description !== '' && <p>{bingo.description}</p>}
    </div>
  );
}
