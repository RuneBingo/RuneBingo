import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/design-system/lib/utils';
import { buttonVariants, Button } from '@/design-system/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/design-system/ui/tooltip';

import { type SidebarItem, type SidebarLink } from './types';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed: boolean;
  items: SidebarItem[];
  onToggle?: () => void;
}

export function Sidebar({ collapsed, items, onToggle, className }: SidebarProps) {
  return (
    <div className={cn('h-full bg-white dark:bg-gray-950', className)}>
      <div data-collapsed={collapsed} className="group flex flex-col h-full gap-4 py-2 data-[collapsed=true]:py-2">
        <nav className="grid gap-2 p-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          {items.map((item, index) =>
            item.items ? (
              <div key={index} className="grid gap-2">
                {!collapsed && item.title && (
                  <h2 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">{item.title}</h2>
                )}
                <div className={cn('grid gap-1', collapsed && 'grid-flow-row auto-rows-max justify-items-center')}>
                  {item.items.map((subItem, subIndex) => (
                    <NavItem key={subIndex} item={subItem} collapsed={collapsed} />
                  ))}
                </div>
              </div>
            ) : (
              <NavItem key={index} item={item} collapsed={collapsed} />
            ),
          )}
        </nav>
        {onToggle && (
          <div className="mt-auto flex w-full justify-center p-2">
            <Button onClick={onToggle} variant="outline" size="icon-xs" className="rounded-full">
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
              <span className="sr-only">{collapsed ? 'Expand' : 'Collapse'}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function NavItem({ item, collapsed }: { item: SidebarLink; collapsed: boolean }) {
  const { icon: Icon, title, href, active } = item;
  const linkContent = (
    <a
      href={href}
      className={cn(buttonVariants({ variant: active ? 'secondary' : 'ghost', size: 'sm' }), 'w-full justify-start')}
    >
      <Icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
      {!collapsed && <span className="truncate">{title}</span>}
    </a>
  );
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <a
              href={href}
              className={cn(buttonVariants({ variant: active ? 'secondary' : 'ghost', size: 'icon' }), 'h-9 w-9')}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{title}</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return linkContent;
}
