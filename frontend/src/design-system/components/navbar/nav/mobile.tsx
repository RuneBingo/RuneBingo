import { Menu } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/design-system/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/design-system/ui/drawer';

import type { NavItemProps, NavProps } from '../types';

export const MobileNav = ({ items }: NavProps) => {
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-4 pb-6">
          <div className="mb-4" />
          {items.map((item) => (
            <MobileNavItem key={item.label} item={item} />
          ))}
        </DrawerContent>
      </Drawer>
    </>
  );
};

const MobileNavItem = ({ item }: NavItemProps) => (
  <Button className="w-fit" variant="ghost" asChild>
    <Link href={item.href}>
      {item.icon && <item.icon className="w-4 h-4 mr-1" />}
      {item.label}
    </Link>
  </Button>
);
