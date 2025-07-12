import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select';

import type { PagerProps } from './types';

export default function Pager({
  page,
  limit,
  total,
  disabled,
  pagerOpen,
  className,
  onPageChange,
  onPagerOpenChange,
}: PagerProps) {
  const t = useTranslations('common.pager');
  if (limit === 0) {
    console.error('[Pager] limit cannot be 0');
    return null;
  }

  if (total <= limit) return null;

  const totalPages = Math.ceil(total / limit);

  const classNames = cn('flex items-center gap-2 mt-5', className);

  const handlePreviousPage = () => {
    onPageChange(Math.max(page - 1, 0));
  };

  const handleNextPage = () => {
    onPageChange(Math.min(page + 1, totalPages - 1));
  };

  return (
    <div className={classNames} onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" onClick={handlePreviousPage} disabled={page === 0 || disabled}>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <span className="text-sm">{t('page')}</span>
      <Select
        value={(page + 1).toString()}
        open={pagerOpen}
        onOpenChange={onPagerOpenChange}
        onValueChange={(value) => onPageChange(Number(value) - 1)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: totalPages }).map((_, index) => (
            <SelectItem key={index} value={(index + 1).toString()}>
              {index + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={page === totalPages - 1 || disabled}>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
