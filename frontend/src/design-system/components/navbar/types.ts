import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  icon?: LucideIcon;
  label: string;
  href: string;
};

export type NavbarProps = React.HTMLAttributes<HTMLDivElement> & {
  sticky?: boolean;
  items?: NavItem[];
};

export type NavProps = {
  items: NavItem[];
};

export type NavItemProps = {
  item: NavItem;
};
