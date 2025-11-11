'use client';

import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';

import type { SearchBingoParticipantsParams } from '@/api/bingo';
import { type BingoDto, type BingoRoles, type BingoTeamDto, type AuthenticationDetailsDto } from '@/api/types';
import NotCurrentBingoTip from '@/common/bingo/not-current-bingo-tip';
import { Title } from '@/design-system/components/title';

import Filters from './filters';
import Table from './table';

type ViewProps = {
  bingo: BingoDto;
  role?: BingoRoles;
  teams: BingoTeamDto[];
  user: AuthenticationDetailsDto | null;
  isCurrentBingo: boolean;
};

export default function Participants({ bingo, role, teams, user, isCurrentBingo }: ViewProps) {
  const [queryParams, setQueryParams] = useState<SearchBingoParticipantsParams>({ sort: 'role', order: 'DESC' });
  const t = useTranslations('bingo-participant');

  return (
    <Fragment>
      <NotCurrentBingoTip role={role} bingoId={bingo.bingoId} visible={!isCurrentBingo} />
      <div className="flex justify-between md:flex-col gap-4 md:gap-0">
        <Title.Primary>{t('title')}</Title.Primary>
        <Filters teams={teams} queryParams={queryParams} setQueryParams={setQueryParams} />
      </div>
      <Table
        user={user}
        bingo={bingo}
        teams={teams}
        role={role}
        isCurrentBingo={isCurrentBingo}
        queryParams={queryParams}
        setQueryParams={setQueryParams}
      />
    </Fragment>
  );
}
