'use client';

import { BookCheck, BookUser, Heart, HelpCircle, Home, LayoutGrid, Mail, Trophy, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { type SidebarItem } from '@/design-system/components/sidebar/types';

export function useSidebar() {
  const t = useTranslations('common.navigation');
  const pathname = usePathname();

  const items: SidebarItem[] = [
    {
      title: t('dashboard'),
      icon: Home,
      href: '/dashboard',
      active: pathname.startsWith('/dashboard'),
    },
    {
      title: t('event'),
      items: [
        {
          title: t('bingo-card'),
          icon: LayoutGrid,
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
          icon: Users,
          href: '/participants',
          active: pathname.startsWith('/participants'),
        },
        {
          title: t('teams'),
          icon: BookUser,
          href: '/teams',
          active: pathname.startsWith('/teams'),
        },
        {
          title: t('invitations'),
          icon: Mail,
          href: '/invitations',
          active: pathname.startsWith('/invitations'),
        },
        {
          title: t('applications'),
          icon: Heart,
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
          icon: BookCheck,
          href: '/completions',
          active: pathname.startsWith('/completions'),
        },
        {
          title: t('requests'),
          icon: HelpCircle,
          href: '/requests',
          active: pathname.startsWith('/requests'),
        },
      ],
    },
  ];

  return { items };
}
