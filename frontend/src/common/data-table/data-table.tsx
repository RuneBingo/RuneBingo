'use client';

import { Fragment } from 'react';

import Scrollbar from '@/design-system/components/scrollbar/scrollbar';
import { Table, TableBody } from '@/design-system/ui/table';

import BlankState from './blank-state';
import Content from './content';
import Header from './header';
import Loading from './loading';
import Pager from './pager';
import type { DataTableProps } from './types';

export default function DataTable<TData extends object, TError = unknown>({
  query,
  page,
  limit,
  actions,
  columns,
  orderBy,
  idProperty,
  blankStateText,
  blankStateIcon,
  onOrderByFieldChange,
  onPageChange,
}: DataTableProps<TData, TError>) {
  if (columns.length === 0) return null;

  if (!query.isPending && query.data?.items.length === 0) {
    return <BlankState blankStateText={blankStateText} blankStateIcon={blankStateIcon} />;
  }

  return (
    <Fragment>
      <Scrollbar horizontal className="align-middle min-w-full max-w-full">
        <Table className="min-w-max w-full mb-2">
          <Header columns={columns} orderBy={orderBy} onOrderByFieldChange={onOrderByFieldChange} actions={actions} />
          <TableBody>
            {query.isPending && <Loading columns={columns} limit={limit} />}
            {!query.isPending && <Content query={query} columns={columns} idProperty={idProperty} actions={actions} />}
          </TableBody>
        </Table>
      </Scrollbar>
      <Pager query={query} page={page} limit={limit} onPageChange={onPageChange} />
    </Fragment>
  );
}
