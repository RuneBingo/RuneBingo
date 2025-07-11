import { Fragment } from 'react';

import { cn } from '@/design-system/lib/utils';
import { TableCell, TableRow } from '@/design-system/ui/table';

import ActionsDropdown from './actions-dropdown';
import type { DataTableAction, DataTableActionGroup, DataTableContentProps } from './types';

function filterActionsByItem<TData extends object>(actions: DataTableContentProps<TData>['actions'], item: TData) {
  if (!actions) return undefined;
  // if actions[0] is an array, that means that actions is a DataTableActionGroup[]
  if (Array.isArray(actions[0])) {
    const actionGroups = actions as DataTableActionGroup<TData>[];
    return actionGroups
      .map((group) => group.filter((action) => (action.visible ? action.visible?.(item) : true)))
      .filter((group) => group.length > 0);
  }

  const actionsArray = actions as DataTableAction<TData>[];
  return actionsArray.filter((action) => (action.visible ? action.visible?.(item) : true));
}

export default function DataTableContent<TData extends object>({
  actions,
  query,
  columns,
  idProperty,
}: DataTableContentProps<TData>) {
  return (
    <Fragment>
      {query.data?.items.map((item, index) => {
        const itemActions = filterActionsByItem(actions, item);

        return (
          <TableRow key={String(item[idProperty] ?? index)}>
            {columns.map(({ render, field, orderable }, index) => (
              <TableCell key={index} className={cn('max-w-sm', { 'pl-4': orderable })}>
                {render &&
                  render({
                    field,
                    row: item,
                    value: field ? item[columns[index].field as keyof TData] : undefined,
                    index,
                  })}
                {Boolean(!render && field) && <Fragment>{String(item[field as keyof TData])}</Fragment>}
              </TableCell>
            ))}
            {itemActions && (
              <TableCell className="w-0">
                <ActionsDropdown item={item} actions={itemActions} />
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </Fragment>
  );
}
