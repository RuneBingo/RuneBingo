import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { resolvePaginatedQueryWithoutTotal } from '@/db/paginated-query.utils';

import { User } from '../user.entity';
import { type SearchUsersParams, SearchUsersQuery, type SearchUsersResult } from './search-users.query';
import { ViewUserScope } from '../scopes/view-user.scope';

@QueryHandler(SearchUsersQuery)
export class SearchUsersHandler {
  constructor(@InjectRepository(User) private readonly repository: Repository<User>) {}

  async execute(query: SearchUsersQuery): Promise<SearchUsersResult> {
    const { requester, search, status, ...pagination } = query.params;

    let scope = this.repository
      .createQueryBuilder('user')
      .where('user.username ILIKE :search', { search: `%${search}%` });

    scope = new ViewUserScope(requester, scope).resolve();

    if (!requester || !userHasRole(requester, Roles.Moderator)) {
      scope = scope.andWhere('user.disabled_at IS NULL');
    } else {
      this.applyStatus(scope, status);
    }

    scope = scope.orderBy('user.username_normalized', 'ASC');

    return resolvePaginatedQueryWithoutTotal(scope, pagination);
  }

  private applyStatus(scope: SelectQueryBuilder<User>, status: SearchUsersParams['status']) {
    switch (status) {
      case 'active':
        return scope.andWhere('user.disabled_at IS NULL');
      case 'disabled':
        return scope.andWhere('user.disabled_at IS NOT NULL');
      default:
        return scope;
    }
  }
}
