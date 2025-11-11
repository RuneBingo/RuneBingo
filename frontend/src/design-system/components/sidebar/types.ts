import type { LucideIcon } from 'lucide-react';

export type SidebarLink = {
  title: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
  exact?: boolean;
};

export type SidebarItem =
  | (SidebarLink & { items?: never })
  | {
      title?: string;
      items: SidebarLink[];
    };

export type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  items: SidebarItem[];
  collapsed: boolean;
  pathname?: string;
  onToggle?: () => void;
  linkComponent?: React.ElementType;
};

export interface NavItemProps {
  item: SidebarLink;
  linkComponent?: React.ElementType;
  collapsed: boolean;
  pathname: string;
}

export interface NavItemGroupProps {
  item: {
    title?: string;
    items: SidebarLink[];
  };
  linkComponent?: React.ElementType;
  collapsed: boolean;
  pathname: string;
}
