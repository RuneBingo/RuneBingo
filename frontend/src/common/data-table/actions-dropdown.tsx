import { MoreVerticalIcon } from 'lucide-react';
import { Fragment, useState } from 'react';

import { Button } from '@/design-system/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/ui/dropdown-menu';

import { type DataTableActionsDropdownProps } from './types';

export default function DataTableActionsDropdown<TData extends object>({
  item,
  actions,
}: DataTableActionsDropdownProps<TData>) {
  const [open, onOpenChange] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        {actions.map((actionOrGroup, index) => (
          <Fragment key={index}>
            {Array.isArray(actionOrGroup) ? (
              actionOrGroup.map((action) => (
                <DropdownMenuItem
                  key={action.label}
                  variant={action.variant}
                  onClick={() => {
                    onOpenChange(false);
                    action.onClick(item);
                  }}
                >
                  {action.icon && <action.icon className="size-4" />}
                  {action.label}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem
                key={actionOrGroup.label}
                variant={actionOrGroup.variant}
                onClick={() => {
                  onOpenChange(false);
                  actionOrGroup.onClick(item);
                }}
              >
                {actionOrGroup.icon && <actionOrGroup.icon className="size-4" />}
                {actionOrGroup.label}
              </DropdownMenuItem>
            )}
            {index < actions.length - 1 && <DropdownMenuSeparator />}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
