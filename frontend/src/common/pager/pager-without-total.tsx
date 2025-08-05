import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/ui/button';

import { type PagerWithoutTotalProps } from './types';

export default function PagerWithoutTotal({
  page,
  limit,
  disabled,
  hasPreviousPage,
  hasNextPage,
  className,
  onPageChange,
}: PagerWithoutTotalProps) {
  if (limit === 0) {
    console.error('[Pager] limit cannot be 0');
    return null;
  }

  if (!hasPreviousPage && !hasNextPage) return null;

  const classNames = cn('flex items-center mt-5', className);

  const handlePreviousPage = () => {
    if (!hasPreviousPage) return;

    onPageChange(Math.max(page - 1, 0));
  };

  const handleNextPage = () => {
    if (!hasNextPage) return;

    onPageChange(page + 1);
  };

  return (
    <div className={classNames} onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" onClick={handlePreviousPage} disabled={!hasPreviousPage || disabled}>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={!hasNextPage || disabled}>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
