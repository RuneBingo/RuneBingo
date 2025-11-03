'use client';

import { useMutation } from '@tanstack/react-query';
import { Handshake, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

import { kickBingoParticipant, leaveBingo, transferBingoOwnership } from '@/api/bingo';
import { type BingoParticipantDto, type BingoDto, type AuthenticationDetailsDto, BingoRoles } from '@/api/types';
import { useConfirmationModal } from '@/common/confirmation-modal';
import { useAppContext } from '@/common/context';
import { type DataTableAction } from '@/common/data-table/types';
import toast from '@/common/utils/toast';
import transformApiError from '@/common/utils/transform-api-error';
import { useRouter } from '@/i18n/navigation';

import KickParticipant from './kick-participant';

type UseActionsArgs = {
  bingo: BingoDto;
  user: AuthenticationDetailsDto | null;
  role: BingoRoles | undefined;
  refetch: () => void;
};

export const useActions = ({ bingo, user, role, refetch }: UseActionsArgs) => {
  const t = useTranslations('bingo-participant.actions');
  const { askConfirmation } = useConfirmationModal();
  const { refreshUser } = useAppContext();
  const router = useRouter();

  const [KickParticipantModal, askKickParticipant] = KickParticipant.usePrompt();

  const { mutate: kick } = useMutation({
    mutationKey: ['kickBingoParticipant', bingo.bingoId],
    mutationFn: async ({
      username,
      usernameNormalized,
      deleteTileCompletions,
    }: {
      username: string;
      usernameNormalized: string;
      deleteTileCompletions: boolean;
    }) => {
      const result = await kickBingoParticipant(bingo.bingoId, usernameNormalized, deleteTileCompletions);
      if ('error' in result) {
        const { message } = transformApiError(result);
        if (message) toast.error(message);
        return;
      }

      toast.success(t('kick.success', { username }));
      refetch();
    },
  });

  const { mutate: leave } = useMutation({
    mutationKey: ['leaveBingo', bingo.bingoId],
    mutationFn: async () => {
      const result = await leaveBingo(bingo.bingoId);
      if ('error' in result) {
        const { message } = transformApiError(result);
        if (message) toast.error(message);
        return;
      }

      toast.success(t('leave.success'));
      refreshUser();
      refetch();
      router.push('/dashboard');
    },
  });

  const { mutate: transferOwnership } = useMutation({
    mutationKey: ['transferOwnership', bingo.bingoId],
    mutationFn: async ({ username, usernameNormalized }: { username: string; usernameNormalized: string }) => {
      const result = await transferBingoOwnership(bingo.bingoId, usernameNormalized);
      if ('error' in result) {
        const { message } = transformApiError(result);
        if (message) toast.error(message);
        return;
      }

      toast.success(t('transferOwnership.success', { username }));
      router.refresh();
      refetch();
    },
  });

  const handleKick = useCallback(
    async (participant: BingoParticipantDto) => {
      const result = await askKickParticipant({ bingo, participant });
      if (!result) return;

      kick({
        username: participant.user?.username ?? '',
        usernameNormalized: participant.user?.usernameNormalized ?? '',
        deleteTileCompletions: result.deleteTileCompletions,
      });
    },
    [bingo, kick, askKickParticipant],
  );

  const handleLeave = useCallback(async () => {
    const maxRegistrationDate = bingo.maxRegistrationDate
      ? new Date(bingo.maxRegistrationDate).toLocaleDateString()
      : '';

    const isPending = bingo.status === 'pending';
    const description = (() => {
      if (isPending)
        return t(`leave.description.pending.${bingo.private ? 'private' : 'public'}`, {
          maxRegistrationDate,
        });

      return t.rich('leave.description.ongoingHtml', {
        maxRegistrationDate,
        p: (chunks) => <p>{chunks}</p>,
      });
    })();

    const confirmed = await askConfirmation({
      title: t('leave.title'),
      description,
      confirmLabel: t('leave.confirmLabel'),
      cancelLabel: t('leave.cancelLabel'),
    });

    if (!confirmed) return;

    leave();
  }, [bingo.maxRegistrationDate, bingo.status, bingo.private, askConfirmation, t, leave]);

  const handleTransferOwnership = useCallback(
    async (participant: BingoParticipantDto) => {
      if (!participant.user) return;

      const confirmed = await askConfirmation({
        title: t('transferOwnership.title', { username: participant.user.username }),
        description: t.rich('transferOwnership.descriptionHtml', {
          b: (chunks) => <b>{chunks}</b>,
          p: (chunks) => <p>{chunks}</p>,
        }),
        confirmLabel: t('transferOwnership.confirmLabel'),
        confirmVariant: 'destructive',
      });

      if (!confirmed) return;

      transferOwnership({
        username: participant.user.username,
        usernameNormalized: participant.user.usernameNormalized,
      });
    },
    [t, askConfirmation, transferOwnership],
  );

  const actions = useMemo((): DataTableAction<BingoParticipantDto>[] => {
    const isOwner = role === BingoRoles.Owner;
    const isOrganizer = role === BingoRoles.Organizer;
    const canManage = isOwner || isOrganizer;

    return [
      {
        label: t('leave.label'),
        icon: LogOut,
        variant: 'destructive',
        onClick: handleLeave,
        visible: (participant: BingoParticipantDto) => !isOwner && participant.user?.username === user?.username,
      },
      {
        label: t('kick.label'),
        icon: LogOut,
        variant: 'destructive',
        onClick: (participant) => handleKick(participant),
        visible: (participant: BingoParticipantDto) =>
          canManage && participant.user?.username !== user?.username && participant.role !== BingoRoles.Owner,
      },
      {
        label: t('transferOwnership.label'),
        icon: Handshake,
        variant: 'destructive',
        onClick: handleTransferOwnership,
        visible: (participant: BingoParticipantDto) => isOwner && participant.user?.username !== user?.username,
      },
    ];
  }, [handleLeave, handleKick, handleTransferOwnership, role, t, user?.username]);

  return { actions, KickParticipantModal };
};
