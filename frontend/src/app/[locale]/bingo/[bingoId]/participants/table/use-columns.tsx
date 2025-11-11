import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

import { type BingoParticipantDto, BingoRoles, type BingoTeamDto, type UpdateBingoParticipantDto } from '@/api/types';
import SelectRole from '@/common/bingo/select-role';
import SelectTeam from '@/common/bingo/select-team';
import { type DataTableColumn } from '@/common/data-table/types';
import { formatDateToLocale } from '@/common/utils/date';
import Avatar from '@/design-system/components/avatar';

type UseColumnsArgs = {
  role: BingoRoles | undefined;
  teams: BingoTeamDto[];
  onUpdate: ({ username, updates }: { username: string; updates: UpdateBingoParticipantDto }) => void;
};

export function useColumns({ role, teams, onUpdate }: UseColumnsArgs) {
  const t = useTranslations('bingo-participant.table');
  const locale = useLocale();

  const handleRoleChange = useCallback(
    (row: BingoParticipantDto, role: BingoRoles) => {
      if (!row.user || row.role === role) return;

      onUpdate({ username: row.user.usernameNormalized, updates: { role } });
    },
    [onUpdate],
  );

  const handleTeamChange = useCallback(
    (row: BingoParticipantDto, teamNameNormalized: string | null) => {
      if (!row.user || row.teamNameNormalized === teamNameNormalized) return;

      onUpdate({ username: row.user.usernameNormalized, updates: { teamName: teamNameNormalized } });
    },
    [onUpdate],
  );

  const canManage = role === BingoRoles.Owner || role === BingoRoles.Organizer;

  const columns = useMemo(
    (): DataTableColumn<BingoParticipantDto>[] => [
      {
        label: t('username'),
        orderable: true,
        field: 'username',
        render: ({ row }: { row: BingoParticipantDto }) =>
          row.user ? (
            <div className="flex items-center gap-2">
              <Avatar user={row.user} size={24} />
              <span>{row.user.username}</span>
            </div>
          ) : null,
      },
      {
        label: t('role'),
        field: 'role',
        orderable: true,
        render: ({ row }) => (
          <SelectRole
            value={row.role}
            readonly={!canManage}
            disabled={canManage && row.role === BingoRoles.Owner}
            onChange={(role) => handleRoleChange(row, role)}
          />
        ),
      },
      {
        label: t('team'),
        field: 'teamName',
        orderable: true,
        render: ({ row }) => (
          <SelectTeam
            value={row.teamNameNormalized}
            teams={teams}
            readonly={!canManage}
            onChange={(teamNameNormalized) => handleTeamChange(row, teamNameNormalized)}
          />
        ),
      },
      {
        label: t('points'),
        field: 'points',
        orderable: false,
      },
      {
        label: t('invitedBy'),
        field: 'invitedBy',
        orderable: false,
        render: ({ row }) => row.invitedBy?.username || '—',
      },
      {
        label: t('joinedOn'),
        field: 'createdAt',
        orderable: false,
        render: ({ row }) => formatDateToLocale(row.createdAt, locale),
      },
    ],
    [t, canManage, handleRoleChange, teams, handleTeamChange, locale],
  );

  return columns;
}
