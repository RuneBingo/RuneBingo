import type { UseQueryResult } from '@tanstack/react-query';
import { type LucideIcon } from 'lucide-react';
import { type ComponentProps } from 'react';

import { type OrderBy } from '@/api';
import type { PaginatedDto, PaginatedDtoWithoutTotal } from '@/api/types';
import { type DropdownMenuItem } from '@/design-system/ui/dropdown-menu';

export type Field<TData extends object> = keyof TData;

export type DataTableAction<TData extends object> = {
  icon?: LucideIcon;
  label: string;
  variant?: ComponentProps<typeof DropdownMenuItem>['variant'];
  onClick: (row: TData) => void;
  visible?: (row: TData) => boolean;
};

export type DataTableActionGroup<TData extends object> = DataTableAction<TData>[];

export type DataTableColumn<TData extends object> = {
  field?: keyof TData;
  /** This label will be displayed in the header of the column. */
  label?: string;
  /** Determines if the column can be used to order the data.
   *  It will only be used if the field is defined, and the DataTable has orderBy and onOrderByFieldChange props set. */
  orderable?: boolean;
  className?: string;
  headerClassName?: string;
  /** This prop allows custom rendering of the column. If not defined, the column will be rendered as a simple text. */
  render?: ({ field, row, value, index }: RenderColumnProps<TData>) => React.ReactNode;
};

export type DataTableProps<TData extends object, TError = unknown> = {
  page: number;
  limit: number;
  query: UseQueryResult<PaginatedDto<TData> | PaginatedDtoWithoutTotal<TData>, TError>;
  actions?: DataTableActionGroup<TData>[] | DataTableAction<TData>[];
  columns: DataTableColumn<TData>[];
  orderBy?: OrderBy<TData>;
  idProperty: keyof TData;
  blankStateText?: string;
  blankStateIcon?: LucideIcon;
  onOrderByFieldChange?: (field: keyof TData) => void;
  onPageChange: (page: number) => void;
};

export type DataTableActionsDropdownProps<TData extends object> = {
  item: TData;
  actions: DataTableActionGroup<TData>[] | DataTableAction<TData>[];
};

export type DataTableBlankStateProps = Pick<DataTableProps<object>, 'blankStateText' | 'blankStateIcon'>;

export type DataTableContentProps<TData extends object> = Pick<
  DataTableProps<TData>,
  'query' | 'columns' | 'idProperty' | 'actions'
>;

export type DataTableHeaderProps<TData extends object> = Pick<
  DataTableProps<TData>,
  'columns' | 'orderBy' | 'onOrderByFieldChange' | 'actions'
>;

export type DataTablePagerProps<TData extends object> = Pick<
  DataTableProps<TData>,
  'query' | 'page' | 'limit' | 'onPageChange'
>;

export type DataTableLoadingProps<TData extends object> = Pick<DataTableProps<TData>, 'columns' | 'limit'>;

export type RenderColumnProps<TData extends object> = {
  field: keyof TData | undefined;
  row: TData;
  value: TData[keyof TData] | undefined;
  index: number;
};
