'use client';

import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';

import type { SearchBingoParticipantsParams } from '@/api/bingo';
import { type BingoDto, type BingoRoles, type BingoTeamDto, type AuthenticationDetailsDto } from '@/api/types';
import { Title } from '@/design-system/components/title';

import Filters from './filters';
import Table from './table';

type ViewProps = {
  bingo: BingoDto;
  userRole?: BingoRoles;
  teams: BingoTeamDto[];
  user: AuthenticationDetailsDto | null;
};

export default function Participants({ bingo, userRole, teams, user }: ViewProps) {
  const [queryParams, setQueryParams] = useState<SearchBingoParticipantsParams>({ sort: 'role', order: 'DESC' });
  const t = useTranslations('bingo-participant');

  return (
    <Fragment>
      <div className="flex justify-between md:flex-col gap-4 md:gap-0">
        <Title.Primary>{t('title')}</Title.Primary>
        <Filters teams={teams} queryParams={queryParams} setQueryParams={setQueryParams} />
      </div>
      <Table
        user={user}
        bingo={bingo}
        teams={teams}
        userRole={userRole}
        queryParams={queryParams}
        setQueryParams={setQueryParams}
      />
    </Fragment>
  );
}
