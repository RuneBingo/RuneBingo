import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { updateBingo } from '@/api/bingo';
import { type UpdateBingoDto } from '@/api/types';
import toast from '@/common/utils/toast';
import transformApiError from '@/common/utils/transform-api-error';
import { useRouter } from '@/i18n/navigation';

import { ACTIONS } from './constants';
import type { ActionHandler, ActionKey, ActionsContextType, ActionsProviderProps } from './types';

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export default function ActionsProvider({ children, bingo }: ActionsProviderProps) {
  const router = useRouter();
  const [currentAction, setCurrentAction] = useState<ActionKey | null>(null);
  const t = useTranslations('bingo.bingoCard');

  const callAction = useCallback(
    (actionKey: ActionKey) => {
      if (currentAction) return;

      const requestedAction = Object.values(ACTIONS).find((action) => action.key === actionKey);
      if (!requestedAction?.visible(bingo)) return;

      setCurrentAction(actionKey);
    },
    [bingo, currentAction],
  );

  const closeAction = useCallback(() => {
    setCurrentAction(null);
  }, []);

  const updateBingoMutation = useMutation({
    mutationKey: ['updateBingo', bingo.bingoId],
    mutationFn: (async ({ input, setErrors }) => {
      const response = await updateBingo(bingo.bingoId, input);
      if ('error' in response) {
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

  const contextValue = useMemo(
    () => ({
      bingo,
      currentAction,
      updateBingo: updateBingoMutation.mutate,
      closeAction,
      callAction,
    }),
    [bingo, callAction, currentAction, updateBingoMutation.mutate, closeAction],
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
