import { useArgs } from '@storybook/preview-api';
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
  User,
} from 'lucide-react';

import { Sidebar } from '@/design-system/components/sidebar/sidebar';
import { type SidebarItem } from '@/design-system/components/sidebar/types';

const meta: Meta<typeof Sidebar> = {
  title: 'Common/Sidebar',
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
    title: 'Participants',
    items: [
      {
        title: 'Participants',
        icon: User,
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
  render: function Render(args) {
    const [{ collapsed }, updateArgs] = useArgs();
    const onToggle = () => updateArgs({ collapsed: !collapsed });

    return <Sidebar {...args} collapsed={collapsed} onToggle={onToggle} />;
  },
};

export const Collapsed: Story = {
  args: {
    items: sidebarItems,
    collapsed: true,
  },
};
