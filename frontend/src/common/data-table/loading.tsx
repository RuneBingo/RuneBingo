import { Fragment } from 'react';

import { Skeleton } from '@/design-system/ui/skeleton';
import { TableCell } from '@/design-system/ui/table';
import { TableRow } from '@/design-system/ui/table';

import { type DataTableLoadingProps } from './types';

export default function DataTableLoading<TData extends object>({ columns, limit }: DataTableLoadingProps<TData>) {
  return (
    <Fragment>
      {Array.from({ length: limit }).map((_, index) => (
        <TableRow key={index}>
          <TableCell colSpan={columns.length}>
            <Skeleton className="h-10 w-full" />
          </TableCell>
        </TableRow>
      ))}
    </Fragment>
  );
}
