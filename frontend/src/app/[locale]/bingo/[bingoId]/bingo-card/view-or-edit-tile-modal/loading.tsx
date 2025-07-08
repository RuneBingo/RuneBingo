import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

import { Button } from '@/design-system/ui/button';
import { DialogClose, DialogTitle } from '@/design-system/ui/dialog';
import { Skeleton } from '@/design-system/ui/skeleton';

import { useBingoCard } from '../provider';

export default function ViewOrEditSkeleton() {
  const t = useTranslations('bingo.bingoCard.viewOrEditTile');
  const { readOnly } = useBingoCard();

  return (
    <Fragment>
      <DialogTitle className="sr-only">{t('title.loading')}</DialogTitle>
      <div className="flex items-center justify-between gap-4 p-4">
        <Skeleton className="w-full h-9" />
        <DialogClose asChild>
          <Button variant="ghost" size="icon">
            <XIcon className="size-4" />
          </Button>
        </DialogClose>
      </div>
      <div className="p-4">
        <Skeleton className="w-50 h-8 mb-3" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Fragment key={index}>
            <Skeleton className="w-[75px] h-3.5 mb-2" />
            <Skeleton className="w-[150px] h-5 mb-5" />
          </Fragment>
        ))}
      </div>
      {!readOnly && (
        <div className="flex items-center justify-end gap-2 p-4">
          <Skeleton className="w-35 h-9" />
          <Skeleton className="w-35 h-9" />
        </div>
      )}
    </Fragment>
  );
}
