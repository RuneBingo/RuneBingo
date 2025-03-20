import { Query } from '@nestjs/cqrs';

import { type PaginatedResultWithoutTotal, type PaginatedQueryParams } from '@/db/paginated-query.utils';

import { type User } from '../user.entity';

export type SearchUsersParams = PaginatedQueryParams<{
  requester: User | undefined;
  search?: string;
  status?: 'active' | 'disabled' | null;
}>;

export type SearchUsersResult = PaginatedResultWithoutTotal<User>;

export class SearchUsersQuery extends Query<SearchUsersResult> {
  constructor(public readonly params: SearchUsersParams) {
    super();
  }
}
