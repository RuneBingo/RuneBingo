import type { BingoParticipantDto, BingoRoles, BingoTeamDto } from '@/api/types';
import type { DataTableColumn } from '@/common/data-table/types';
import Avatar from '@/design-system/components/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select';

export const getColumns = (
  userRole: BingoRoles | undefined,
  teams: BingoTeamDto[],
  onParticipantUpdate: (username: string, updates: Partial<BingoParticipantDto>) => void,
  isOwner: boolean,
  t: (key: string) => string,
  tBingo: (key: string) => string,
): DataTableColumn<BingoParticipantDto>[] => {
  const canManage = userRole === 'owner' || userRole === 'organizer';

  return [
    {
      label: t('username'),
      orderable: true,
      field: 'username',
      render: ({ row }) =>
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
      render: ({ row }) => {
        if (row.role === 'owner') {
          // TODO: make this a reusable component like SelectRole and cleaner
          return (
            <Select defaultValue={row.role} disabled>
              <SelectTrigger className="!h-[22px] w-fit rounded-md border-0 bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white shadow-none [&>svg]:hidden">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">{tBingo('roles.owner')}</SelectItem>
              </SelectContent>
            </Select>
          );
        }

        if (canManage) {
          return (
            <Select
              defaultValue={row.role}
              onValueChange={(value) => {
                if (row.user) {
                  onParticipantUpdate(row.user.username, { role: value as BingoRoles });
                }
              }}
            >
              <SelectTrigger className="!h-[22px] w-fit rounded-md border-0 bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white shadow-none [&>svg]:size-3 [&>svg]:!text-white [&>svg]:opacity-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">{tBingo('roles.participant')}</SelectItem>
                <SelectItem value="organizer">{tBingo('roles.organizer')}</SelectItem>
              </SelectContent>
            </Select>
          );
        }

        return tBingo(`roles.${row.role}`);
      },
    },
    {
      label: t('team'),
      field: 'teamName',
      orderable: true,
      render: ({ row }) =>
        canManage ? (
          <Select
            defaultValue={row.teamName || 'no-team'}
            onValueChange={(value) => {
              if (row.user) {
                onParticipantUpdate(row.user.username, { teamName: value === 'no-team' ? null : value });
              }
            }}
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
          row.teamName || t('no_team')
        ),
    },
    {
      label: t('points'),
      field: 'points',
      orderable: false,
    },
    {
      label: t('invited_by'),
      field: 'invitedBy',
      orderable: false,
      render: ({ row }) => {
        return row.invitedBy?.username || '—';
      },
    },
    {
      label: t('joined_on'),
      field: 'createdAt',
      orderable: false,
      render: ({ row }) => {
        // TODO: format date to locale, but all DTOs use date but are really strings
        const date = new Date(row.createdAt);
        return date.toLocaleDateString();
      },
    },
  ];
};
