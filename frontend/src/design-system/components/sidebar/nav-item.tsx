import { cn } from '@/design-system/lib/utils';
import { buttonVariants } from '@/design-system/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/design-system/ui/tooltip';

import { type NavItemProps } from './types';

export default function NavItem({ item, collapsed, linkComponent: LinkComponent = 'a' }: NavItemProps) {
  const { icon: Icon, title, href, active } = item;

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <LinkComponent
              href={href}
              className={cn(buttonVariants({ variant: active ? 'secondary' : 'ghost', size: 'icon' }), 'h-9 w-9')}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{title}</span>
            </LinkComponent>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <LinkComponent
      href={href}
      className={cn(
        buttonVariants({ variant: active ? 'secondary' : 'ghost', size: 'sm' }),
        'w-full justify-start font-medium',
        !active && 'text-foreground/80 hover:text-foreground',
      )}
    >
      <Icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
      {!collapsed && <span className="truncate">{title}</span>}
    </LinkComponent>
  );
}
