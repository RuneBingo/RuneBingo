'use client';

import ActionsDropdown from './actions-dropdown';
import CancelBingo from './cancel-bingo';
import DeleteBingo from './delete-bingo';
import EditDetails from './edit-details';
import EndBingo from './end-bingo';
import ActionsProvider from './provider';
import ResetBingo from './reset-bingo';
import StartBingo from './start-bingo';
import type { ActionsProviderProps } from './types';

export default function Actions(actionsProviderProps: ActionsProviderProps) {
  return (
    <ActionsProvider {...actionsProviderProps}>
      <ActionsDropdown />
      <CancelBingo />
      <DeleteBingo />
      <EditDetails />
      <EndBingo />
      <ResetBingo />
      <StartBingo />
    </ActionsProvider>
  );
}
