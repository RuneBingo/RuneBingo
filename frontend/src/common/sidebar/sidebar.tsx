'use client';

import NextLink from 'next/link';
import { useState } from 'react';

import { Sidebar as DSidebar } from '@/design-system/components/sidebar/sidebar';
import { usePathname } from '@/i18n/navigation';

import { useSidebar } from './hooks';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { items } = useSidebar();
  const pathname = usePathname();

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <DSidebar
      items={items}
      collapsed={collapsed}
      onToggle={handleToggle}
      linkComponent={NextLink}
      pathname={pathname}
    />
  );
}
