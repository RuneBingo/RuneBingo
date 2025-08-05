'use client';

import {
  Table,
  Trophy,
  UserRound,
  LayoutDashboard,
  UsersRound,
  MailPlus,
  UserRoundPlus,
  CopyCheck,
  FileQuestion,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { type SidebarItem } from '@/design-system/components/sidebar/types';

import { useAppContext } from '../context';

export function useSidebar() {
  const t = useTranslations('common.navigation');
  const { user } = useAppContext();
  const currentBingo = user?.currentBingo;

  const items = [
    {
      title: t('dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    currentBingo && {
      title: t('event'),
      items: [
        {
          title: t('bingo-card'),
          icon: Table,
          href: `/bingo/${currentBingo.id}`,
          exact: true,
        },
        {
          title: t('leaderboard'),
          icon: Trophy,
          href: `/bingo/${currentBingo.id}/leaderboard`,
        },
      ],
    },
    currentBingo && {
      title: t('participants'),
      items: [
        {
          title: t('participants'),
          icon: UserRound,
          href: `/bingo/${currentBingo.id}/participants`,
        },
        {
          title: t('teams'),
          icon: UsersRound,
          href: `/bingo/${currentBingo.id}/teams`,
        },
        {
          title: t('invitations'),
          icon: MailPlus,
          href: `/bingo/${currentBingo.id}/invitations`,
        },
        {
          title: t('applications'),
          icon: UserRoundPlus,
          href: `/bingo/${currentBingo.id}/applications`,
        },
      ],
    },
    currentBingo && {
      title: t('completions'),
      items: [
        {
          title: t('completions'),
          icon: CopyCheck,
          href: `/bingo/${currentBingo.id}/completions`,
        },
        {
          title: t('requests'),
          icon: FileQuestion,
          href: `/bingo/${currentBingo.id}/requests`,
        },
      ],
    },
  ].filter(Boolean) as SidebarItem[];

  return { items };
}
