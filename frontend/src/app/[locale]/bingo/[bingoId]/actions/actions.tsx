'use client';

import { Fragment } from 'react';

import useSuccessMessages from '@/common/hooks/use-success-messages';

import ActionsDropdown from './actions-dropdown';
import EditDetails from './edit-details';
import ActionsProvider from './provider';
import type { ActionsProps } from './types';

function Actions({ bingo }: ActionsProps) {
  useSuccessMessages('bingo.bingoCard.messages', ['updateDetailsSuccess']);

  return (
    <Fragment>
      <ActionsDropdown bingo={bingo} />
      <EditDetails />
    </Fragment>
  );
}

export default function ActionsWithProvider({ bingo }: ActionsProps) {
  return (
    <ActionsProvider bingo={bingo}>
      <Actions bingo={bingo} />
    </ActionsProvider>
  );
}
