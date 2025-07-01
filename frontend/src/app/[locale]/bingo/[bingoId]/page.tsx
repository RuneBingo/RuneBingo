import { CalendarCheckIcon, CalendarDaysIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Fragment } from 'react';

import { getAuthenticatedUser, listMyBingos } from '@/api/auth';
import { getBingo, listBingoTiles } from '@/api/bingo';
import { BingoRoles, BingoStatus } from '@/api/types';
import NotCurrentBingoTip from '@/common/bingo/not-current-bingo-tip';
import BingoStatusBadge from '@/common/bingo/status-badge';
import { type ServerSideRootProps } from '@/common/types';
import { formatDateToLocale } from '@/common/utils/date';
import Avatar from '@/design-system/components/avatar';
import { Title } from '@/design-system/components/title';

import Actions from './actions';
import BingoCard from './bingo-card';

type Params = {
  bingoId: string;
};

async function fetchBingo(bingoId: string) {
  const response = await getBingo(bingoId);
  if ('error' in response) notFound();
  return response.data;
}

async function fetchBingoTiles(bingoId: string) {
  const response = await listBingoTiles(bingoId);
  if ('error' in response) return null;
  return response.data;
}

export default async function BingoCardPage({ params }: ServerSideRootProps<Params>) {
  const { bingoId } = await params;

  const bingo = await fetchBingo(bingoId);
  const bingoTiles = await fetchBingoTiles(bingoId);

  const t = await getTranslations('bingo.bingoCard');
  const locale = await getLocale();
  const user = await getAuthenticatedUser();
  const userParticipations = await listMyBingos();
  const currentBingoParticipation = userParticipations?.find((participation) => participation.id === bingoId);

  const isBingoOrganizer =
    currentBingoParticipation &&
    (currentBingoParticipation?.role === BingoRoles.Owner || currentBingoParticipation?.role === BingoRoles.Organizer);

  const isCurrentBingoOrganizer = user?.currentBingo?.id === bingoId && isBingoOrganizer;

  const readOnlyCard = !isCurrentBingoOrganizer || bingo.status !== BingoStatus.Pending;

  console.log({ isBingoOrganizer, isCurrentBingoOrganizer });

  return (
    <Fragment>
      <div className="max-w-5xl">
        <NotCurrentBingoTip
          role={currentBingoParticipation?.role}
          bingoId={bingoId}
          visible={Boolean(!isCurrentBingoOrganizer && isBingoOrganizer)}
        />
        <BingoStatusBadge status={bingo.status} className="mb-2" />
        <div className="w-full flex items-center justify-between mb-8">
          <Title.Primary className="!mb-0">{bingo.title}</Title.Primary>
          {isCurrentBingoOrganizer && <Actions bingo={bingo} />}
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
      <Title.Secondary>Bingo Card</Title.Secondary>
      <BingoCard
        role={user?.currentBingo?.id === bingoId ? currentBingoParticipation?.role : undefined}
        bingo={bingo}
        bingoTiles={bingoTiles}
        readOnly={readOnlyCard}
      />
    </Fragment>
  );
}
