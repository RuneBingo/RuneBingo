'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { type OrderBy } from '@/api';
import { searchBingoInvitations, updateBingoInvitationLink, type SearchBingoInvitationsParams } from '@/api/bingo';
import type { BingoInvitationDto, BingoRoles, BingoTeamDto } from '@/api/types';
import DataTable from '@/common/data-table';
import type { DataTableColumn } from '@/common/data-table/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select';

export default function InvitationLinksTable({
  bingoId,
  t,
  userRole,
  teams,
}: {
  bingoId: string;
  t: (key: string) => string;
  userRole?: BingoRoles;
  teams: BingoTeamDto[];
}) {
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const queryClient = useQueryClient();
  const canManage = userRole === 'owner' || userRole === 'organizer';

  const onInvitationUpdate = async (code: string, updates: { role?: BingoRoles; teamName?: string }) => {
    await updateBingoInvitationLink(bingoId, code, updates);
    await queryClient.invalidateQueries({ queryKey: ['bingo-invitation-links'] });
  };

  const query = useQuery({
    queryKey: ['bingo-invitation-links', bingoId, page, limit],
    queryFn: () =>
      searchBingoInvitations(bingoId, {
        offset: page * limit,
        limit,
      } as SearchBingoInvitationsParams),
    select: (data) => {
      if ('error' in data) return { items: [], total: 0, limit, offset: 0 };
      // filter links (no inviteeUsername)
      const items = data.data.items.filter((i) => !i.inviteeUsername);
      return { ...data.data, items };
    },
  });

  const columns: DataTableColumn<BingoInvitationDto>[] = [
    { label: t('code'), field: 'code', orderable: false },
    {
      label: t('role'),
      field: 'role',
      orderable: false,
      render: ({ row }) =>
        canManage ? (
          <Select
            defaultValue={row.role}
            onValueChange={(value) => onInvitationUpdate(row.code, { role: value as BingoRoles })}
          >
            <SelectTrigger className="!h-[22px] w-fit rounded-md border-0 bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white shadow-none [&>svg]:size-3 [&>svg]:!text-white [&>svg]:opacity-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="participant">Participant</SelectItem>
              <SelectItem value="organizer">Organizer</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          row.role
        ),
    },
    {
      label: t('team'),
      field: 'teamName',
      orderable: false,
      render: ({ row }) =>
        canManage ? (
          <Select
            defaultValue={row.teamName || 'no-team'}
            onValueChange={(value) =>
              onInvitationUpdate(row.code, { teamName: value === 'no-team' ? undefined : value })
            }
          >
            <SelectTrigger
              className={`!h-[22px] w-fit rounded-md px-2 py-0.5 text-xs font-semibold shadow-none [&>svg]:size-3 [&>svg]:opacity-100 ${
                row.teamName
                  ? 'border-0 bg-slate-900 text-white [&>svg]:!text-white'
                  : 'border border-slate-900 bg-white text-slate-900 [&>svg]:!text-slate-900'
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-team">{t('no_team')}</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.name} value={team.name}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          (row.teamName ?? '—')
        ),
    },
    { label: t('created_by'), field: 'createdByUsername', orderable: false },
    {
      label: t('created_on'),
      field: 'createdAt',
      orderable: false,
      render: ({ row }) => new Date(row.createdAt).toLocaleDateString(),
    },
    { label: t('uses'), field: 'uses', orderable: false },
  ];

  return (
    <DataTable
      query={query}
      page={page}
      limit={limit}
      columns={columns}
      orderBy={{ field: 'code', order: 'ASC' } as OrderBy<BingoInvitationDto>}
      idProperty="code"
      onPageChange={setPage}
    />
  );
}
