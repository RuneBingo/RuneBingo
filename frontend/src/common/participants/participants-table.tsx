'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Handshake, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { OrderBy } from '@/api';
import {
  kickBingoParticipant,
  leaveBingo,
  searchBingoParticipants,
  transferBingoOwnership,
  updateBingoParticipant,
  type SearchBingoParticipantsParams,
} from '@/api/bingo';
import type { AuthenticationDetailsDto, BingoParticipantDto, BingoRoles, BingoTeamDto, BingoDto } from '@/api/types';
import { useConfirmationModal } from '@/common/confirmation-modal';
import DataTable from '@/common/data-table';
import type { DataTableAction } from '@/common/data-table/types';
import { useKickConfirmationModal } from '@/common/kick-confirmation-modal';

import { getColumns } from './columns';

type ParticipantsTableProps = {
  bingo: BingoDto;
  bingoId: string;
  userRole?: BingoRoles;
  queryParams: SearchBingoParticipantsParams;
  user: AuthenticationDetailsDto | null;
  teams: BingoTeamDto[];
};

type OrderableFields = NonNullable<SearchBingoParticipantsParams['sort']>;

export default function ParticipantsTable({
  bingo,
  bingoId,
  userRole,
  queryParams,
  user,
  teams,
}: ParticipantsTableProps) {
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [orderBy, setOrderBy] = useState<OrderBy<BingoParticipantDto>>({ field: 'username', order: 'ASC' });
  const { askConfirmation } = useConfirmationModal();
  const { askKickConfirmation } = useKickConfirmationModal();
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('bingo-participant.table');
  const tActions = useTranslations('bingo-participant.actions');
  const [deleteCompletions, setDeleteCompletions] = useState(false);

  const query = useQuery({
    queryKey: ['bingo-participants', bingoId, page, limit, orderBy, queryParams],
    queryFn: () =>
      searchBingoParticipants(bingoId, {
        ...queryParams,
        offset: page * limit,
        limit,
        sort: orderBy.field as OrderableFields,
        order: orderBy.order,
      }),
    select: (data) => {
      if ('error' in data) {
        return { items: [], total: 0, limit, offset: page * limit };
      }
      return data.data;
    },
  });

  const onParticipantUpdate = async (username: string, updates: Partial<BingoParticipantDto>) => {
    const updateDto: { role?: BingoRoles; teamName?: string } = {};
    if (updates.role) {
      updateDto.role = updates.role;
    }
    if (updates.teamName !== undefined) {
      updateDto.teamName = updates.teamName === null ? undefined : updates.teamName;
    }

    await updateBingoParticipant(bingoId, username, updateDto);
    await queryClient.invalidateQueries({ queryKey: ['bingo-participants'] });

    if (user && user.username === username && updates.role) {
      router.refresh();
    }
  };

  const handleOrderByFieldChange = (field: keyof BingoParticipantDto) => {
    const orderableFields: OrderableFields[] = ['username', 'role', 'teamName'];
    if (!orderableFields.includes(field as OrderableFields)) {
      return;
    }

    if (orderBy.field === field) {
      setOrderBy({ field, order: orderBy.order === 'ASC' ? 'DESC' : 'ASC' });
    } else {
      setOrderBy({ field, order: 'ASC' });
    }
  };

  const getParticipantActions = (): DataTableAction<BingoParticipantDto>[] => {
    const isOwner = userRole === 'owner';
    const isOrganizer = userRole === 'organizer';
    const isPending = bingo.status === 'pending';
    const isPrivate = bingo.private;

    const maxRegistrationDate = bingo.maxRegistrationDate
      ? new Date(bingo.maxRegistrationDate).toLocaleDateString()
      : '';

    const canManage = isOwner || isOrganizer;

    const actions: DataTableAction<BingoParticipantDto>[] = [];

    if (!isOwner) {
      actions.push({
        label: tActions('leave_event.label'),
        icon: LogOut,
        variant: 'destructive',
        onClick: async () => {
          const isPending = bingo.status === 'pending';
          const description = isPending ? (
            tActions(
              bingo.private ? 'leave_event.description_pending_private' : 'leave_event.description_pending_public',
              {
                maxRegistrationDate: bingo.maxRegistrationDate
                  ? new Date(bingo.maxRegistrationDate).toLocaleDateString()
                  : '',
              },
            )
          ) : (
            <>
              <p>{tActions('leave_event.description_ongoing')}</p>
              <p>{tActions('leave_event.description_ongoing_2')}</p>
            </>
          );

          const confirmed = await askConfirmation({
            title: tActions('leave_event.title'),
            description,
            confirmLabel: tActions('leave_event.confirm_label'),
            cancelLabel: tActions('leave_event.cancel_label'),
          });
          if (confirmed) {
            const result = await leaveBingo(bingoId);
            if ('data' in result) {
              router.push('/dashboard');
            }
          }
        },
        visible: (participant) => participant.user?.username === user?.username,
      });
    }

    if (canManage) {
      actions.push({
        label: tActions('kick_from_event.label'),
        icon: LogOut,
        variant: 'destructive',
        onClick: async (participant) => {
          if (participant.user) {
            const isPending = bingo.status === 'pending';

            const { confirmed, deleteCompletions } = await askKickConfirmation({
              title: tActions('kick_from_event.title', { username: participant.user.username }),
              description: tActions(
                isPending
                  ? bingo.private
                    ? 'kick_from_event.description_private'
                    : 'kick_from_event.description_pending'
                  : 'kick_from_event.description_ongoing',
                {
                  maxRegistrationDate: bingo.maxRegistrationDate
                    ? new Date(bingo.maxRegistrationDate).toLocaleDateString()
                    : '',
                },
              ),
              description2: isPending ? undefined : tActions('kick_from_event.description_ongoing_completions'),
              withDeleteCompletionsToggle: !isPending,
              confirmLabel: tActions('kick_from_event.confirm_label', {
                username: participant.user.username,
              }),
              confirmVariant: 'destructive',
            });

            if (confirmed) {
              await kickBingoParticipant(bingoId, participant.user.username, deleteCompletions ?? false);
              await queryClient.invalidateQueries({ queryKey: ['bingo-participants'] });
            }
          }
        },
        visible: (participant) => participant.user?.username !== user?.username && participant.role !== 'owner',
      });
    }

    // Action: Transfer Ownership
    if (isOwner) {
      actions.push({
        label: tActions('transfer_ownership.label'),
        icon: Handshake,
        variant: 'destructive',
        onClick: async (participant) => {
          if (participant.user) {
            const confirmed = await askConfirmation({
              title: tActions('transfer_ownership.title', { username: participant.user.username }),
              description: tActions.rich('transfer_ownership.description', {
                owner: (chunks) => <strong>{chunks}</strong>,
                organizer: (chunks) => <strong>{chunks}</strong>,
              }),
              confirmLabel: tActions('transfer_ownership.confirm_label'),
              confirmVariant: 'destructive',
            });
            if (confirmed) {
              await transferBingoOwnership(bingoId, participant.user.username);
              queryClient.invalidateQueries({ queryKey: ['bingo-participants'] });
              router.refresh();
            }
          }
        },
        visible: (participant) => participant.user?.username !== user?.username,
      });
    }

    return actions;
  };

  const actions = getParticipantActions();
  const columns = getColumns(userRole, teams, onParticipantUpdate, userRole === 'owner', t);

  return (
    <DataTable
      query={query}
      page={page}
      limit={limit}
      columns={columns}
      orderBy={orderBy}
      idProperty="userId"
      onPageChange={setPage}
      onOrderByFieldChange={handleOrderByFieldChange}
      actions={actions}
    />
  );
}
