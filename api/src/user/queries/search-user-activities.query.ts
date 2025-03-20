import { Query } from '@nestjs/cqrs';

import { type Activity } from '@/activity/activity.entity';
import { type PaginatedResultWithoutTotal, type PaginatedQueryParams } from '@/db/paginated-query.utils';

import { type User } from '../user.entity';

export type SearchUserActivitiesParams = PaginatedQueryParams<{
  requester: User;
  username: string;
}>;

export type SearchUserActivitiesResult = PaginatedResultWithoutTotal<Activity>;

export class SearchUserActivitiesQuery extends Query<SearchUserActivitiesResult> {
  constructor(public readonly params: SearchUserActivitiesParams) {
    super();
  }
}
