'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { OrderBy } from '@/api';
import {
  searchBingoInvitations,
  cancelBingoInvitation,
  disableBingoInvitationLink,
  type SearchBingoInvitationsParams,
} from '@/api/bingo';
import type { AuthenticationDetailsDto, BingoInvitationDto, BingoInvitationStatus, BingoRoles } from '@/api/types';
import DataTable from '@/common/data-table';
import type { DataTableAction } from '@/common/data-table/types';

import { getColumns } from './columns';

type InvitationsTableProps = {
  bingoId: string;
  userRole?: BingoRoles;
  queryParams: SearchBingoInvitationsParams;
  user: AuthenticationDetailsDto | null;
};

type _OrderableFields = never; // placeholder

export default function InvitationsTable({ bingoId, userRole, queryParams, user: _user }: InvitationsTableProps) {
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const orderBy: OrderBy<BingoInvitationDto> = { field: 'code', order: 'ASC' }; // fixed

  const canManage = userRole === 'owner' || userRole === 'organizer';
  const t = useTranslations('bingo-invitation.table');
  // const tActions = useTranslations('bingo-invitation.actions');

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['bingo-invitations', bingoId, page, limit, queryParams],
    queryFn: () =>
      searchBingoInvitations(bingoId, {
        ...queryParams,
        offset: page * limit,
        limit,
      }),
    select: (data) => {
      if ('error' in data) return { items: [], total: 0, limit, offset: 0 };
      // filter direct invitations (with inviteeUsername)
      const items = data.data.items.filter((i) => i.inviteeUsername);
      return { ...data.data, items };
    },
  });

  const onStatusChange = async (code: string, status: BingoInvitationStatus) => {
    if (status === 'canceled') {
      await cancelBingoInvitation(bingoId, code);
    } else if (status === 'disabled') {
      await disableBingoInvitationLink(bingoId, code, true);
    }
    queryClient.invalidateQueries({ queryKey: ['bingo-invitations'] });
  };

  const actions: DataTableAction<BingoInvitationDto>[] = [];
  // Additional context-menu actions can be added later.

  const columns = getColumns(canManage, onStatusChange, t);

  return (
    <DataTable
      query={query}
      page={page}
      limit={limit}
      columns={columns}
      orderBy={orderBy}
      idProperty="code"
      onPageChange={setPage}
      actions={actions}
    />
  );
}
