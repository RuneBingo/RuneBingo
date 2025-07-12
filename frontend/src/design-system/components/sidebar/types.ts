import type { LucideIcon } from 'lucide-react';

export type SidebarLink = {
  title: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
};

export type SidebarItem =
  | (SidebarLink & { items?: never })
  | {
      title?: string;
      items: SidebarLink[];
    };
