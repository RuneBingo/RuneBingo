import { CalendarXIcon, CalendarClockIcon, PencilIcon, RecycleIcon, Trash2Icon } from 'lucide-react';

import { BingoRoles, BingoStatus } from '@/api/types';

import type { Action, ActionVisibleParams } from './types';

const actionVisibilityFor = (status: BingoStatus[] | 'all', roles: BingoRoles[]) => (params: ActionVisibleParams) =>
  Boolean(
    params.participant &&
      (status === 'all' || status.includes(params.bingo.status)) &&
      roles.includes(params.participant.role),
  );

export const ACTION_KEYS = ['cancel', 'delete', 'editDetails', 'end', 'reset', 'start'] as const;

export const EDIT_DETAILS = {
  key: 'editDetails',
  icon: PencilIcon,
  visible: actionVisibilityFor([BingoStatus.Pending, BingoStatus.Ongoing], [BingoRoles.Owner, BingoRoles.Organizer]),
} as const satisfies Action;

export const RESET_EVENT = {
  key: 'reset',
  icon: RecycleIcon,
  visible: actionVisibilityFor([BingoStatus.Canceled], [BingoRoles.Owner]),
} as const satisfies Action;

export const START_NOW = {
  key: 'start',
  icon: CalendarClockIcon,
  visible: actionVisibilityFor([BingoStatus.Pending], [BingoRoles.Owner, BingoRoles.Organizer]),
} as const satisfies Action;

export const END_NOW = {
  key: 'end',
  icon: CalendarClockIcon,
  visible: actionVisibilityFor([BingoStatus.Ongoing], [BingoRoles.Owner, BingoRoles.Organizer]),
} as const satisfies Action;

export const CANCEL_EVENT = {
  key: 'cancel',
  icon: CalendarXIcon,
  visible: actionVisibilityFor([BingoStatus.Pending, BingoStatus.Ongoing], [BingoRoles.Owner]),
} as const satisfies Action;

export const DELETE_EVENT = {
  key: 'delete',
  icon: Trash2Icon,
  variant: 'destructive',
  visible: actionVisibilityFor('all', [BingoRoles.Owner]),
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
