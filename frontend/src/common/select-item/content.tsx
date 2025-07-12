import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

import { type OsrsItemDto } from '@/api/types';
import Pager from '@/common/pager';
import { cn } from '@/design-system/lib/utils';
import { Skeleton } from '@/design-system/ui/skeleton';

import { ITEMS_PER_PAGE } from './constants';
import { useSelectItemContext } from './provider';

export default function Content() {
  const t = useTranslations('common');
  const {
    page,
    query,
    value,
    items,
    isError,
    isLoading,
    totalCount,
    pagerOpen,
    setPagerOpen,
    focusNewItem,
    onChange,
    setPage,
  } = useSelectItemContext();

  if (isLoading)
    return (
      <div className="px-2 py-1.5">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
          <div className="flex gap-3 px-3 py-2 w-full" key={index}>
            <Skeleton className="h-8 w-8 rounded-sm shrink-0" />
            <Skeleton className="w-full h-8 rounded-md" />
          </div>
        ))}
      </div>
    );

  if (isError) return <span className="text-sm font-medium">{t('error.unexpected')}</span>;

  if (!items || items.length === 0) {
    return <span className="text-sm font-medium">{query.length < 3 ? t('noQuery', { min: 3 }) : t('noResults')}</span>;
  }

  const itemIsSelected = (item: OsrsItemDto) => value.some((i) => i.item.id === item.id);

  const handleSelectItem = (item: OsrsItemDto) => {
    if (value.some((i) => i.item.id === item.id)) {
      onChange(value.filter((i) => i.item.id !== item.id));
      return;
    }

    onChange([...value, { item, quantity: 1 }]);
    focusNewItem(item.id);
  };

  return (
    <Fragment>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'flex gap-3 items-center px-3 py-2 hover:bg-slate-300 cursor-pointer rounded-md transition-colors',
            itemIsSelected(item) && 'bg-slate-200',
          )}
          onClick={() => handleSelectItem(item)}
        >
          <Image src={item.iconUrl} width={32} height={32} alt={item.name} className="w-8 h-8 object-contain" />
          <span className="text-sm font-medium">{item.name}</span>
        </div>
      ))}
      <Pager
        page={page}
        limit={ITEMS_PER_PAGE}
        total={totalCount}
        pagerOpen={pagerOpen}
        className="justify-center"
        onPageChange={setPage}
        onPagerOpenChange={setPagerOpen}
      />
    </Fragment>
  );
}
