import { type SelectQueryBuilder } from 'typeorm';

export type PaginatedQueryParams<T extends object> = {
  limit?: number;
  offset?: number;
} & T;

export type PaginatedResult<T extends object> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export type PaginatedResultWithoutTotal<T extends object> = {
  items: T[];
  limit: number;
  offset: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const paginatedQueryDefaults: Required<PaginatedQueryParams<object>> = {
  limit: 20,
  offset: 0,
};

export async function resolvePaginatedQuery<T extends object>(
  query: SelectQueryBuilder<T>,
  params: PaginatedQueryParams<object>,
): Promise<PaginatedResult<T>> {
  const { limit, offset } = { ...paginatedQueryDefaults, ...params };

  const paginatedQuery = query.skip(offset).take(limit);

  const [items, total] = await paginatedQuery.getManyAndCount();
  return { items, limit, offset, total };
}

export async function resolvePaginatedQueryWithoutTotal<T extends object>(
  query: SelectQueryBuilder<T>,
  params: PaginatedQueryParams<object>,
): Promise<PaginatedResultWithoutTotal<T>> {
  const limit = params.limit ?? paginatedQueryDefaults.limit;
  const offset = params.offset ?? paginatedQueryDefaults.offset;

  const paginatedQuery = query.skip(offset).take(limit + 1);

  const items = await paginatedQuery.getMany();
  const hasPreviousPage = offset > 0;
  const hasNextPage = items.length > limit;

  if (hasNextPage) items.pop();

  return { items, limit, offset, hasPreviousPage, hasNextPage };
}
