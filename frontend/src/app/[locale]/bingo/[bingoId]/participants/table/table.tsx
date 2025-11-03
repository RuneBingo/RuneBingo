'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRoundX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type Dispatch, Fragment, type SetStateAction } from 'react';

import type { OrderBy } from '@/api';
import { searchBingoParticipants, updateBingoParticipant, type SearchBingoParticipantsParams } from '@/api/bingo';
import {
  type AuthenticationDetailsDto,
  type BingoParticipantDto,
  type BingoRoles,
  type BingoTeamDto,
  type BingoDto,
  type UpdateBingoParticipantDto,
} from '@/api/types';
import DataTable from '@/common/data-table';
import toast from '@/common/utils/toast';
import transformApiError from '@/common/utils/transform-api-error';

import { useActions } from './use-actions';
import { useColumns } from './use-columns';

type TableProps = {
  bingo: BingoDto;
  userRole?: BingoRoles;
  queryParams: SearchBingoParticipantsParams;
  setQueryParams: Dispatch<SetStateAction<SearchBingoParticipantsParams>>;
  user: AuthenticationDetailsDto | null;
  teams: BingoTeamDto[];
};

type OrderableFields = NonNullable<SearchBingoParticipantsParams['sort']>;

const IPP = 10;

export default function Table({ bingo, userRole, queryParams, user, teams, setQueryParams }: TableProps) {
  const router = useRouter();
  const t = useTranslations('bingo-participant');

  const offset = queryParams.offset || 0;
  const page = offset / IPP;
  const orderBy = {
    field: queryParams.sort || 'role',
    order: queryParams.order || 'DESC',
  } satisfies OrderBy<BingoParticipantDto>;

  const query = useQuery({
    queryKey: ['bingo-participants', bingo.bingoId, page, orderBy, queryParams],
    queryFn: () =>
      searchBingoParticipants(bingo.bingoId, {
        ...queryParams,
        offset,
        limit: IPP,
        sort: orderBy.field as OrderableFields,
        order: orderBy.order,
      }),
    select: (data) => {
      if ('error' in data) {
        return { items: [], total: 0, limit: IPP, offset };
      }
      return data.data;
    },
  });

  const { mutate: updateParticipant } = useMutation({
    mutationKey: ['updateBingoParticipant', bingo.bingoId],
    mutationFn: async ({ username, updates }: { username: string; updates: UpdateBingoParticipantDto }) => {
      const result = await updateBingoParticipant(bingo.bingoId, username, updates);
      if ('error' in result) {
        const { message } = transformApiError(result);
        if (message) toast.error(message);
        return;
      }

      toast.success(t('actions.update.success'));
      query.refetch();

      if (user && user.username === username && updates.role) {
        router.refresh();
      }
    },
  });

  const handleOrderByFieldChange = (field: keyof BingoParticipantDto) => {
    const orderableFields: OrderableFields[] = ['username', 'role', 'teamName'];
    if (!orderableFields.includes(field as OrderableFields)) {
      return;
    }

    if (orderBy.field === field) {
      setQueryParams({ ...queryParams, order: orderBy.order === 'ASC' ? 'DESC' : 'ASC' });
    } else {
      setQueryParams({ ...queryParams, sort: field as OrderableFields, order: 'ASC' });
    }
  };

  const handlePageChange = (page: number) => {
    setQueryParams({ ...queryParams, offset: page * IPP });
  };

  const { actions, KickParticipantModal } = useActions({ bingo, user, role: userRole, refetch: query.refetch });
  const columns = useColumns({ role: userRole, teams, onUpdate: updateParticipant });

  return (
    <Fragment>
      <DataTable
        query={query}
        page={page}
        limit={IPP}
        columns={columns}
        orderBy={orderBy}
        idProperty="userId"
        onPageChange={handlePageChange}
        onOrderByFieldChange={handleOrderByFieldChange}
        actions={actions}
        blankStateIcon={UserRoundX}
        blankStateText={t('empty')}
      />
      <KickParticipantModal />
    </Fragment>
  );
}
