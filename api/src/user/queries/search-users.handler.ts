import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { resolvePaginatedQueryWithoutTotal } from '@/db/paginated-query.utils';

import { User } from '../user.entity';
import { type SearchUsersParams, SearchUsersQuery, type SearchUsersResult } from './search-users.query';

@QueryHandler(SearchUsersQuery)
export class SearchUsersHandler {
  constructor(@InjectRepository(User) private readonly repository: Repository<User>) {}

  async execute(query: SearchUsersQuery): Promise<SearchUsersResult> {
    const { requester, search, status, ...pagination } = query.params;

    let q = this.repository.createQueryBuilder('user').where('user.username ILIKE :search', { search: `%${search}%` });

    if (!requester || !userHasRole(requester, Roles.Moderator)) {
      q = q.andWhere('user.disabled_at IS NULL');
    } else {
      this.applyStatus(q, status);
    }

    q = q.orderBy('user.username_normalized', 'ASC');

    return resolvePaginatedQueryWithoutTotal(q, pagination);
  }

  private applyStatus(q: SelectQueryBuilder<User>, status: SearchUsersParams['status']) {
    switch (status) {
      case 'active':
        return q.andWhere('user.disabled_at IS NULL');
      case 'disabled':
        return q.andWhere('user.disabled_at IS NOT NULL');
      default:
        return q;
    }
  }
}
