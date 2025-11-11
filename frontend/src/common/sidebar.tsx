'use client';

import {
  CopyCheck,
  FileQuestion,
  LayoutDashboard,
  MailPlus,
  Table,
  Trophy,
  UserRound,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react';
import NextLink from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Sidebar as DSidebar } from '@/design-system/components/sidebar/sidebar';
import { type SidebarItem } from '@/design-system/components/sidebar/types';
import useToggle from '@/design-system/hooks/use-toggle';
import { usePathname } from '@/i18n/navigation';

export default function Sidebar() {
  const [collapsed, onToggle] = useToggle();
  const pathname = usePathname();
  const t = useTranslations('common.navigation');
  const { bingoId } = useParams();

  const items: SidebarItem[] = useMemo(
    () => [
      {
        title: t('dashboard'),
        icon: LayoutDashboard,
        href: '/dashboard',
      },
      ...(bingoId
        ? [
            {
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
            {
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
            {
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
          ]
        : []),
    ],
    [bingoId, t],
  );

  return (
    <DSidebar items={items} collapsed={collapsed} onToggle={onToggle} linkComponent={NextLink} pathname={pathname} />
  );
}
