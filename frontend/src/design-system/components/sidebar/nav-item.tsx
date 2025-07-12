import * as React from 'react';

import { cn } from '@/design-system/lib/utils';
import { buttonVariants } from '@/design-system/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/design-system/ui/tooltip';

import { type NavItemProps } from './types';

export default function NavItem({ item, linkComponent: LinkComponent = 'a' }: NavItemProps) {
  const { icon: Icon, title, href, active } = item;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <LinkComponent
            href={href}
            className={cn(
              buttonVariants({ variant: active ? 'secondary' : 'ghost' }),
              'group h-9 w-9 justify-start group-data-[collapsed=false]:w-full group-data-[collapsed=true]:px-2.5',
            )}
          >
            <Icon className="h-4 w-4 group-data-[collapsed=false]:mr-2" />
            <span className="truncate group-data-[collapsed=true]:sr-only">{title}</span>
          </LinkComponent>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
