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
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { type SidebarItem } from '@/design-system/components/sidebar/types';

export function useSidebar() {
  const t = useTranslations('common.navigation');
  const pathname = usePathname();

  const items: SidebarItem[] = [
    {
      title: t('dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname.startsWith('/dashboard'),
    },
    {
      title: t('event'),
      items: [
        {
          title: t('bingo-card'),
          icon: Table,
          href: '/bingo-card',
          active: pathname.startsWith('/bingo-card'),
        },
        {
          title: t('leaderboard'),
          icon: Trophy,
          href: '/leaderboard',
          active: pathname.startsWith('/leaderboard'),
        },
      ],
    },
    {
      title: t('participants'),
      items: [
        {
          title: t('participants'),
          icon: UserRound,
          href: '/participants',
          active: pathname.startsWith('/participants'),
        },
        {
          title: t('teams'),
          icon: UsersRound,
          href: '/teams',
          active: pathname.startsWith('/teams'),
        },
        {
          title: t('invitations'),
          icon: MailPlus,
          href: '/invitations',
          active: pathname.startsWith('/invitations'),
        },
        {
          title: t('applications'),
          icon: UserRoundPlus,
          href: '/applications',
          active: pathname.startsWith('/applications'),
        },
      ],
    },
    {
      title: t('completions'),
      items: [
        {
          title: t('completions'),
          icon: CopyCheck,
          href: '/completions',
          active: pathname.startsWith('/completions'),
        },
        {
          title: t('requests'),
          icon: FileQuestion,
          href: '/requests',
          active: pathname.startsWith('/requests'),
        },
      ],
    },
  ];

  return { items };
}
