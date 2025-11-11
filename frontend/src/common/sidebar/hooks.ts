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
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { type SidebarItem } from '@/design-system/components/sidebar/types';

import { useAppContext } from '../context';

export function useSidebar() {
  const t = useTranslations('common.navigation');
  const { user } = useAppContext();
  // get the current bingoId route param
  const { bingoId } = useParams();

  const items = [
    {
      title: t('dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    bingoId && {
      title: t('event'),
      items: [
        {
          title: t('bingo-card'),
          icon: Table,
          href: `/bingo/${bingoId}`,
          exact: true,
        },
        {
          title: t('leaderboard'),
          icon: Trophy,
          href: `/bingo/${bingoId}/leaderboard`,
        },
      ],
    },
    bingoId && {
      title: t('participants'),
      items: [
        {
          title: t('participants'),
          icon: UserRound,
          href: `/bingo/${bingoId}/participants`,
        },
        {
          title: t('teams'),
          icon: UsersRound,
          href: `/bingo/${bingoId}/teams`,
        },
        {
          title: t('invitations'),
          icon: MailPlus,
          href: `/bingo/${bingoId}/invitations`,
        },
        {
          title: t('applications'),
          icon: UserRoundPlus,
          href: `/bingo/${bingoId}/applications`,
        },
      ],
    },
    bingoId && {
      title: t('completions'),
      items: [
        {
          title: t('completions'),
          icon: CopyCheck,
          href: `/bingo/${bingoId}/completions`,
        },
        {
          title: t('requests'),
          icon: FileQuestion,
          href: `/bingo/${bingoId}/requests`,
        },
      ],
    },
  ].filter(Boolean) as SidebarItem[];

  return { items };
}
