import { useEffect, useState } from 'react';

import { type PaginatedDto, type PaginatedDtoWithoutTotal } from '@/api/types';
import Pager from '@/common/pager';

import { type DataTablePagerProps } from './types';

export default function DataTablePager<TData extends object>({
  query,
  page,
  limit,
  onPageChange,
}: DataTablePagerProps<TData>) {
  const [paginationData, setPaginationData] = useState<
    PaginatedDto<TData> | PaginatedDtoWithoutTotal<TData> | undefined
  >();

  useEffect(() => {
    if (!query.data) return;
    setPaginationData(query.data);
  }, [query.data]);

  if (!paginationData) return null;

  if ('total' in paginationData)
    return (
      <Pager
        total={paginationData.total}
        limit={limit}
        page={page}
        onPageChange={onPageChange}
        disabled={query.isFetching}
      />
    );
}
