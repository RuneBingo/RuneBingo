'use client';

import { FilterIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type Dispatch, type SetStateAction } from 'react';

import { type SearchBingoParticipantsParams } from '@/api/bingo';
import { type BingoTeamDto } from '@/api/types';
import { useAboveBreakpoint } from '@/design-system/hooks/responsive';
import { Button } from '@/design-system/ui/button';
import Drawer from '@/design-system/ui/drawer';

import Content from './content';

type FiltersProps = {
  teams: BingoTeamDto[];
  queryParams: SearchBingoParticipantsParams;
  setQueryParams: Dispatch<SetStateAction<SearchBingoParticipantsParams>>;
};

export default function Filters({ teams, queryParams, setQueryParams }: FiltersProps) {
  const tCommon = useTranslations('common');
  const { md } = useAboveBreakpoint('md');
  const [open, setOpen] = useState(false);

  if (!md) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <Button variant="outline" size="icon" className="mt-1">
            <FilterIcon />
          </Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{tCommon('filters')}</Drawer.Title>
          </Drawer.Header>
          <div className="px-4">
            <Content teams={teams} queryParams={queryParams} setQueryParams={setQueryParams} />
          </div>
        </Drawer.Content>
      </Drawer>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Content teams={teams} queryParams={queryParams} setQueryParams={setQueryParams} />
    </div>
  );
}
