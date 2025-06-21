import { CalendarXIcon, CalendarClockIcon, PencilIcon, RecycleIcon, Trash2Icon } from 'lucide-react';

import { type BingoDto, BingoStatus } from '@/api/types';

import type { Action } from './types';

export const ACTION_KEYS = ['cancel', 'delete', 'editDetails', 'endNow', 'reset', 'startNow'] as const;

export const EDIT_DETAILS = {
  key: 'editDetails',
  icon: PencilIcon,
  visible: ({ status }: BingoDto) => [BingoStatus.Pending, BingoStatus.Ongoing].includes(status),
} as const satisfies Action;

export const RESET_EVENT = {
  key: 'reset',
  icon: RecycleIcon,
  visible: ({ status }: BingoDto) => status === BingoStatus.Canceled,
} as const satisfies Action;

export const START_NOW = {
  key: 'startNow',
  icon: CalendarClockIcon,
  visible: ({ status }: BingoDto) => status === BingoStatus.Pending,
} as const satisfies Action;

export const END_NOW = {
  key: 'endNow',
  icon: CalendarClockIcon,
  visible: ({ status }: BingoDto) => status === BingoStatus.Ongoing,
} as const satisfies Action;

export const CANCEL_EVENT = {
  key: 'cancel',
  icon: CalendarXIcon,
  visible: ({ status }: BingoDto) => [BingoStatus.Pending, BingoStatus.Ongoing].includes(status),
} as const satisfies Action;

export const DELETE_EVENT = {
  key: 'delete',
  icon: Trash2Icon,
  variant: 'destructive',
  visible: () => true,
} as const satisfies Action;

export const ACTION_GROUPS = [
  [EDIT_DETAILS, RESET_EVENT],
  [START_NOW, END_NOW, CANCEL_EVENT],
  [DELETE_EVENT],
] as const satisfies Action[][];

export const ACTIONS = {
  EDIT_DETAILS,
  RESET_EVENT,
  START_NOW,
  END_NOW,
  CANCEL_EVENT,
  DELETE_EVENT,
} as const satisfies Record<string, Action>;
