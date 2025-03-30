import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/design-system/ui/navigation-menu';

import type { NavItemProps, NavProps } from '../types';

export const DesktopNav = ({ items }: NavProps) => {
  if (!items.length) return null;

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.map((item) => (
          <DesktopNavItem key={item.label} item={item} />
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const DesktopNavItem = ({ item }: NavItemProps) => (
  <NavigationMenuItem>
    <NavigationMenuLink asChild>
      <Link className="flex flex-row items-center gap-2 text-sm font-medium" href={item.href}>
        {item.icon && <item.icon className="size-4" />}
        {item.label}
      </Link>
    </NavigationMenuLink>
  </NavigationMenuItem>
);
