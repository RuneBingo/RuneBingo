import type { BingoInvitationDto, BingoInvitationStatus } from '@/api/types';
import type { DataTableColumn } from '@/common/data-table/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select';

export const getColumns = (
  canManage: boolean,
  onStatusChange: (code: string, status: BingoInvitationStatus) => void,
  t: (key: string) => string,
): DataTableColumn<BingoInvitationDto>[] => {
  return [
    {
      label: t('invitee'),
      field: 'inviteeUsername',
      orderable: false,
      render: ({ row }) => row.inviteeUsername ?? '—',
    },
    {
      label: t('role'),
      field: 'role',
      orderable: false,
      render: ({ row }) => row.role,
    },
    {
      label: t('team'),
      field: 'teamName',
      orderable: false,
      render: ({ row }) => row.teamName ?? '—',
    },
    {
      label: t('invited_by'),
      field: 'createdByUsername',
      orderable: false,
      render: ({ row }) => row.createdByUsername ?? '—',
    },
    {
      label: t('invited_on'),
      field: 'createdAt',
      orderable: false,
      render: ({ row }) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      label: t('status'),
      field: 'status',
      orderable: false,
      render: ({ row }) =>
        canManage ? (
          <Select
            defaultValue={row.status}
            onValueChange={(value) => onStatusChange(row.code, value as BingoInvitationStatus)}
            disabled={row.status !== 'pending'}
          >
            <SelectTrigger className="!h-[22px] w-fit rounded-md border-0 bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white shadow-none [&>svg]:size-3 [&>svg]:!text-white [&>svg]:opacity-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          row.status
        ),
    },
  ];
};
