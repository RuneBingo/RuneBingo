import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, SelectQueryBuilder } from 'typeorm';

import { resolvePaginatedQuery, type PaginatedQueryParams, type PaginatedResult } from '@/db/paginated-query.utils';
import { User } from '@/user/user.entity';

import { OsrsItem } from '../osrs-item.entity';
import { ViewOsrsItemScope } from '../scopes/view-osrs-item.scope';

export type SearchOsrsItemsParams = PaginatedQueryParams<{
  requester: User | undefined;
  search: string;
  enabled?: boolean;
}>;

export type SearchOsrsItemsQueryResult = PaginatedResult<OsrsItem>;

export class SearchOsrsItemsQuery extends Query<SearchOsrsItemsQueryResult> {
  constructor(public readonly params: SearchOsrsItemsParams) {
    super();
  }
}

@QueryHandler(SearchOsrsItemsQuery)
export class SearchOsrsItemsHandler {
  constructor(
    @InjectRepository(OsrsItem)
    private readonly osrsItemRepository: Repository<OsrsItem>,
  ) {}

  async execute(query: SearchOsrsItemsQuery): Promise<SearchOsrsItemsQueryResult> {
    const { requester, search, enabled, ...pagination } = query.params;

    let scope = new ViewOsrsItemScope(requester, this.osrsItemRepository.createQueryBuilder('osrs_item'))
      .resolve()
      .andWhere({ name: ILike(`%${search}%`) })
      .orderBy('osrs_item.name', 'ASC');

    scope = this.applyEnabled(scope, enabled);

    return resolvePaginatedQuery(scope, pagination);
  }

  private applyEnabled(scope: SelectQueryBuilder<OsrsItem>, enabled: SearchOsrsItemsParams['enabled']) {
    if (enabled === undefined) return scope;

    return scope.andWhere('osrs_item.enabled = :enabled', { enabled });
  }
}
