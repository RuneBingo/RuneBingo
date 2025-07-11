import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Fragment } from 'react';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/ui/button';
import { TableHead, TableHeader, TableRow } from '@/design-system/ui/table';

import type { DataTableHeaderProps } from './types';

export default function DataTableHeader<TData extends object>({
  actions,
  columns,
  orderBy,
  onOrderByFieldChange,
}: DataTableHeaderProps<TData>) {
  const getOrderByIcon = (field: keyof TData | undefined, orderable: boolean) => {
    if (!orderBy || !orderable || !field) return null;
    if (orderBy.field === field) {
      if (orderBy.order === 'ASC') return <ChevronUpIcon className="size-4 text-slate-600" />;
      if (orderBy.order === 'DESC') return <ChevronDownIcon className="size-4 text-slate-600" />;
    }

    return <ChevronDownIcon className="text-slate-300 size-4" />;
  };

  return (
    <TableHeader>
      <TableRow>
        {columns.map(({ field, label, orderable, headerClassName }, index) => {
          const isOrderable = Boolean(orderable && field);
          const orderIcon = getOrderByIcon(field, Boolean(orderable));

          return (
            <TableHead key={index} className={cn('max-w-sm', headerClassName, { 'pl-0': orderable })}>
              {isOrderable ? (
                <Button
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => onOrderByFieldChange?.(field as keyof TData)}
                >
                  {label}
                  {orderIcon}
                </Button>
              ) : (
                <Fragment>{label}</Fragment>
              )}
            </TableHead>
          );
        })}
        {actions && <TableHead className="w-0" />}
      </TableRow>
    </TableHeader>
  );
}
