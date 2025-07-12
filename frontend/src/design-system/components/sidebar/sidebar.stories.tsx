import { type Meta, type StoryObj } from '@storybook/react';
import {
  AppWindow,
  BadgeHelp,
  ClipboardCheck,
  ClipboardList,
  Group,
  Handshake,
  LayoutGrid,
  Trophy,
  Users,
} from 'lucide-react';

import { Sidebar } from '@/design-system/components/sidebar/sidebar';
import { type SidebarItem } from '@/design-system/components/sidebar/types';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutGrid,
    href: '/dashboard',
  },
  {
    title: 'Event',
    items: [
      {
        title: 'Bingo card',
        icon: AppWindow,
        href: '/bingo-card',
      },
      {
        title: 'Leaderboard',
        icon: Trophy,
        href: '/leaderboard',
        active: true,
      },
    ],
  },
  {
    items: [
      {
        title: 'Participants',
        icon: Users,
        href: '/participants',
      },
      {
        title: 'Teams',
        icon: Group,
        href: '/teams',
      },
      {
        title: 'Invitations',
        icon: Handshake,
        href: '/invitations',
      },
      {
        title: 'Applications',
        icon: ClipboardList,
        href: '/applications',
      },
    ],
  },
  {
    title: 'Completions',
    items: [
      {
        title: 'Completions',
        icon: ClipboardCheck,
        href: '/completions',
      },
      {
        title: 'Requests',
        icon: BadgeHelp,
        href: '/requests',
      },
    ],
  },
];

export const Default: Story = {
  args: {
    items: sidebarItems,
    collapsed: false,
  },
};

export const Collapsed: Story = {
  args: {
    items: sidebarItems,
    collapsed: true,
  },
};
