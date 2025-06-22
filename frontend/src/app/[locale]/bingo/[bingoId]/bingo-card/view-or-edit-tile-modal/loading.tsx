import { Fragment } from 'react';

import { Skeleton } from '@/design-system/ui/skeleton';

export default function ViewOrEditSkeleton() {
  return (
    <Fragment>
      <Skeleton className="w-[200px] h-8 mb-3" />
      {Array.from({ length: 3 }).map((_, index) => (
        <Fragment key={index}>
          <Skeleton className="w-[75px] h-3.5 mb-2" />
          <Skeleton className="w-[150px] h-5 mb-3" />
        </Fragment>
      ))}
    </Fragment>
  );
}
