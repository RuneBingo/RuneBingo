import type { FormikErrors } from 'formik';
import type { PropsWithChildren } from 'react';

import type { UpdateBingoDto, BingoDto } from '@/api/types';

import { type ACTION_KEYS } from './constants';

export type ActionKey = (typeof ACTION_KEYS)[number];

export type Action = {
  key: ActionKey;
  visible: (bingo: BingoDto) => boolean;
  variant?: 'destructive';
  icon: React.ComponentType<{ className?: string }>;
};

export type ActionHandler<Input> = ({ input, setErrors }: { input: Input; setErrors?: ErrorHandler }) => void;

export type ActionsContextType = {
  bingo: BingoDto;
  currentAction: ActionKey | null;
  updateBingo: ActionHandler<UpdateBingoDto>;
  closeAction: () => void;
  callAction: (actionKey: ActionKey) => void;
};

export type ActionsProps = {
  bingo: BingoDto;
};

export type ActionsProviderProps = PropsWithChildren<{
  bingo: BingoDto;
}>;

export type ErrorHandler = (errors: FormikErrors<unknown>) => void;
