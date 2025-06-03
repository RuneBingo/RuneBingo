import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import SearchInput from '@/design-system/components/search-input';
import { Title } from '@/design-system/components/title';
import { Button } from '@/design-system/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/design-system/ui/popover';

import Content from './content';
import Provider from './provider';
import type { SelectItemProps } from './types';
import Value from './value';

export default function SelectItem({ value, onChange }: SelectItemProps) {
  const t = useTranslations('common');

  return (
    <Provider value={value} onChange={onChange}>
      {({ open, query, onOpenChange, setQuery }) => (
        <div className="mb-5">
          <Value />
          <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
              <Button variant="default">
                <PlusCircle className="h-4 w-4" />
                {t('selectItem.addItemButton')}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Title.Quaternary>{t('selectItem.popover.title')}</Title.Quaternary>
              <SearchInput
                value={query}
                placeholder={t('selectItem.popover.search.placeholder')}
                onChange={setQuery}
                clearable
              />
              <Content />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </Provider>
  );
}
