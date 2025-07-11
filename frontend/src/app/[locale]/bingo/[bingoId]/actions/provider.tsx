import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { cancelBingo, deleteBingo, endBingo, resetBingo, startBingo, updateBingo } from '@/api/bingo';
import { type ResetBingoDto, type StartBingoDto, type UpdateBingoDto } from '@/api/types';
import { useConfirmationModal } from '@/common/confirmation-modal';
import { useAppContext } from '@/common/context';
import toast from '@/common/utils/toast';
import transformApiError from '@/common/utils/transform-api-error';
import { useRouter } from '@/i18n/navigation';

import { ACTIONS } from './constants';
import type { ActionHandler, ActionKey, ActionsContextType, ActionsProviderProps } from './types';

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export default function ActionsProvider({ children, bingo, participant }: ActionsProviderProps) {
  const router = useRouter();
  const [currentAction, setCurrentAction] = useState<ActionKey | null>(null);
  const t = useTranslations('bingo.bingoCard');
  const { askConfirmation } = useConfirmationModal();
  const { refreshUser } = useAppContext();

  const callAction = useCallback(
    (actionKey: ActionKey) => {
      if (currentAction) return;

      const requestedAction = Object.values(ACTIONS).find((action) => action.key === actionKey);
      if (!requestedAction?.visible({ bingo, participant })) return;

      setCurrentAction(actionKey);
    },
    [bingo, participant, currentAction],
  );

  const closeAction = useCallback(() => {
    setCurrentAction(null);
  }, []);

  const updateBingoMutation = useMutation({
    mutationKey: ['updateBingo', bingo.bingoId],
    mutationFn: (async ({ input, setErrors }) => {
      const response = await updateBingo(bingo.bingoId, input);
      if ('error' in response) {
        if (response.statusCode === 409) {
          /* If we get a 409, it's because we're changing the bingo size and it would lead to some tiles being deleted.
             In that case, we need to ask confirmation and if the user confirms, we update the bingo with the confirmTileDeletion flag. */
          const { message } = transformApiError(response);
          const confirmed = await askConfirmation({
            title: t('editDetails.confirmTileDeletion.title'),
            description: message ?? '',
            confirmLabel: t('editDetails.confirmTileDeletion.confirm'),
          });

          if (!confirmed) return;

          const updatedInput = { ...input, confirmTileDeletion: true };
          updateBingoMutation.mutate({ input: updatedInput, setErrors });

          return;
        }

        const { message, validationErrors } = transformApiError(response);
        if (message) toast.error(message);
        if (validationErrors) setErrors?.(validationErrors);

        return;
      }

      closeAction();
      toast.success(t('editDetails.success'));
      router.refresh();
    }) satisfies ActionHandler<UpdateBingoDto>,
  });

  const startBingoMutation = useMutation({
    mutationKey: ['startBingo', bingo.bingoId],
    mutationFn: (async ({ input, setErrors }) => {
      const response = await startBingo(bingo.bingoId, input.endDate);
      if ('error' in response) {
        const { message, validationErrors } = transformApiError(response);
        if (message) toast.error(message);
        if (validationErrors) setErrors?.(validationErrors);

        return;
      }

      closeAction();
      toast.success(t('startBingo.success'));
      router.refresh();
      refreshUser();
    }) satisfies ActionHandler<StartBingoDto>,
  });

  const endBingoMutation = useMutation({
    mutationKey: ['endBingo', bingo.bingoId],
    mutationFn: (async ({ input: _, setErrors: __ }) => {
      const response = await endBingo(bingo.bingoId);
      if ('error' in response) {
        const { message } = transformApiError(response);
        if (message) toast.error(message);

        return;
      }

      closeAction();
      toast.success(t('endBingo.success'));
      router.refresh();
      refreshUser();
    }) satisfies ActionHandler<void>,
  });

  const cancelBingoMutation = useMutation({
    mutationKey: ['cancelBingo', bingo.bingoId],
    mutationFn: (async ({ input: _, setErrors: __ }) => {
      const response = await cancelBingo(bingo.bingoId);
      if ('error' in response) {
        const { message } = transformApiError(response);
        if (message) toast.error(message);

        return;
      }

      closeAction();
      toast.success(t('cancelBingo.success'));
      router.refresh();
      refreshUser();
    }) satisfies ActionHandler<void>,
  });

  const deleteBingoMutation = useMutation({
    mutationKey: ['deleteBingo', bingo.bingoId],
    mutationFn: (async ({ input: _, setErrors: __ }) => {
      const response = await deleteBingo(bingo.bingoId);
      if ('error' in response) {
        const { message } = transformApiError(response);
        if (message) toast.error(message);

        return;
      }

      closeAction();
      toast.success(t('deleteBingo.success'));
      // TODO: redirect to dashboard
      refreshUser();
    }) satisfies ActionHandler<void>,
  });

  const resetBingoMutation = useMutation({
    mutationKey: ['resetBingo', bingo.bingoId],
    mutationFn: (async ({ input, setErrors }) => {
      const response = await resetBingo(bingo.bingoId, input);
      if ('error' in response) {
        const { message, validationErrors } = transformApiError(response);
        if (message) toast.error(message);
        if (validationErrors) setErrors?.(validationErrors);

        return;
      }

      closeAction();
      toast.success(t('resetBingo.success'));
      router.refresh();
      refreshUser();
    }) satisfies ActionHandler<ResetBingoDto>,
  });

  const contextValue = useMemo(
    () => ({
      bingo,
      participant,
      currentAction,
      updateBingo: updateBingoMutation.mutate,
      startBingo: startBingoMutation.mutate,
      endBingo: endBingoMutation.mutate,
      cancelBingo: cancelBingoMutation.mutate,
      deleteBingo: deleteBingoMutation.mutate,
      resetBingo: resetBingoMutation.mutate,
      closeAction,
      callAction,
    }),
    [
      bingo,
      participant,
      currentAction,
      updateBingoMutation.mutate,
      startBingoMutation.mutate,
      endBingoMutation.mutate,
      cancelBingoMutation.mutate,
      deleteBingoMutation.mutate,
      resetBingoMutation.mutate,
      closeAction,
      callAction,
    ],
  ) satisfies ActionsContextType;

  return <ActionsContext.Provider value={contextValue}>{children}</ActionsContext.Provider>;
}

export function useActionsContext() {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error('useActionsContext must be used within an ActionsProvider');
  }
  return context;
}
