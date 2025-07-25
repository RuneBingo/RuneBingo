import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/ui/button';

import NavItem from './nav-item';
import NavItemGroup from './nav-item-group';
import { type SidebarProps } from './types';

export function Sidebar({ collapsed, items, onToggle, className, linkComponent }: SidebarProps) {
  const t = useTranslations('common');

  return (
    <div className={cn('h-full bg-background shadow-sm', className)}>
      <div
        data-collapsed={collapsed}
        className="group flex h-full flex-col justify-between gap-4 py-2 data-[collapsed=true]:py-2"
      >
        <nav className="grid gap-2 p-2 data-[collapsed=true]:justify-center data-[collapsed=true]:px-2">
          {items.map((item, index) =>
            item.items ? (
              <NavItemGroup key={index} item={item} collapsed={collapsed} linkComponent={linkComponent} />
            ) : (
              <NavItem key={index} item={item} collapsed={collapsed} linkComponent={linkComponent} />
            ),
          )}
        </nav>
        {onToggle && (
          <div className="flex w-full justify-center p-2">
            <Button onClick={onToggle} variant="outline" size="icon-xs" className="rounded-full">
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
              <span className="sr-only">{collapsed ? t('expand') : t('collapse')}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
