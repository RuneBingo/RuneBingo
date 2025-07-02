'use client';

import { ChevronDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';

import { type BingoDto } from '@/api/types';
import { Button } from '@/design-system/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/ui/dropdown-menu';

import { ACTION_GROUPS } from './constants';
import { useActionsContext } from './provider';
import { type ActionKey, type Action } from './types';

type ActionProps = {
  bingo: BingoDto;
};

export default function ActionsDropdown({ bingo }: ActionProps) {
  const [open, onOpenChange] = useState(false);
  const t = useTranslations('bingo.bingoCard.actionsDropdown');
  const { callAction } = useActionsContext();

  const filteredActionGroups = ACTION_GROUPS.map((group) => {
    const groupFiltered = group.filter((action) => action.visible(bingo));
    return groupFiltered.length > 0 ? groupFiltered : null;
  }).filter(Boolean) as Action[][];

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {t('title')}
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        {filteredActionGroups.map((group, index) => (
          <Fragment key={index}>
            {group.map((action) => (
              <DropdownMenuItem
                key={action.key}
                variant={action.variant}
                onClick={() => {
                  onOpenChange(false);
                  callAction(action.key as ActionKey);
                }}
              >
                <action.icon className="size-4" />
                {t(action.key)}
              </DropdownMenuItem>
            ))}
            {index < filteredActionGroups.length - 1 && <DropdownMenuSeparator />}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
