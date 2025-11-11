import { CalendarCheckIcon, CalendarDaysIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Fragment } from 'react';

import { BingoRoles, BingoStatus } from '@/api/types';
import { fetchBingoData } from '@/common/bingo/fetch-bingo-data';
import NotCurrentBingoTip from '@/common/bingo/not-current-bingo-tip';
import BingoStatusBadge from '@/common/bingo/status-badge';
import type { ServerSideRootProps } from '@/common/types';
import { formatDateToLocale } from '@/common/utils/date';
import Avatar from '@/design-system/components/avatar';
import { Title } from '@/design-system/components/title';

import Actions from './actions';
import BingoCard from './bingo-card';

type Params = {
  bingoId: string;
};

export default async function BingoCardPage({ params }: ServerSideRootProps<Params>) {
  const { bingoId } = await params;

  const data = await fetchBingoData(bingoId, { fetchTiles: true });
  if (!data) notFound();

  const t = await getTranslations('bingo.bingoCard');
  const locale = await getLocale();

  const { bingo, participant, isCurrentBingo, bingoTiles } = data;
  const isBingoOrganizer = participant?.role === BingoRoles.Owner || participant?.role === BingoRoles.Organizer;
  const isCurrentBingoOrganizer = isCurrentBingo && isBingoOrganizer;
  const readOnly = !isCurrentBingo || !isBingoOrganizer || bingo.status !== BingoStatus.Pending;

  return (
    <Fragment>
      <NotCurrentBingoTip
        role={participant?.role}
        bingoId={bingoId}
        visible={Boolean(!isCurrentBingoOrganizer && isBingoOrganizer)}
      />
      <BingoStatusBadge status={bingo.status} className="mb-2" />
      <div className="w-full flex items-center justify-between mb-8">
        <Title.Primary className="!mb-0">{bingo.title}</Title.Primary>
        <Actions bingo={bingo} participant={participant} />
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
      <Title.Secondary>Bingo Card</Title.Secondary>
      <BingoCard role={participant?.role} bingo={bingo} bingoTiles={bingoTiles} readOnly={readOnly} />
    </Fragment>
  );
}
