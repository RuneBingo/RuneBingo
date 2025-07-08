import type { FormikErrors } from 'formik';
import { type PropsWithChildren } from 'react';

import type { UpdateBingoDto, BingoDto, StartBingoDto, ShortBingoDto, ResetBingoDto } from '@/api/types';

import { type ACTION_KEYS } from './constants';

export type ActionKey = (typeof ACTION_KEYS)[number];

export type ActionVisibleParams = {
  bingo: BingoDto;
  participant: ShortBingoDto | undefined;
};

export type Action = {
  key: ActionKey;
  variant?: 'destructive';
  visible: (params: ActionVisibleParams) => boolean;
  icon: React.ComponentType<{ className?: string }>;
};

export type ActionHandler<Input> = ({ input, setErrors }: { input: Input; setErrors?: ErrorHandler }) => void;

export type ActionsContextType = {
  bingo: BingoDto;
  participant: ShortBingoDto | undefined;
  currentAction: ActionKey | null;
  updateBingo: ActionHandler<UpdateBingoDto>;
  startBingo: ActionHandler<StartBingoDto>;
  endBingo: ActionHandler<void>;
  cancelBingo: ActionHandler<void>;
  deleteBingo: ActionHandler<void>;
  resetBingo: ActionHandler<ResetBingoDto>;
  closeAction: () => void;
  callAction: (actionKey: ActionKey) => void;
};

export type ActionsProviderProps = PropsWithChildren<{
  bingo: BingoDto;
  participant: ShortBingoDto | undefined;
}>;

export type ErrorHandler = (errors: FormikErrors<unknown>) => void;

export type ResetBingoFormValues = {
  startDate: string;
  endDate: string;
  maxRegistrationDate: string;
  deleteTiles: boolean;
  deleteTeams: boolean;
  deleteParticipants: boolean;
};

export type StartBingoFormValues = {
  endDate: string | null | undefined;
};

export type UpdateBingoFormValues = Exclude<UpdateBingoDto, 'width' | 'height' | 'fullLineValue'> & {
  width: number | null;
  height: number | null;
  fullLineValue: number | null;
};
