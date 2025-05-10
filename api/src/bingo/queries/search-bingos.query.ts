import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import {
  resolvePaginatedQueryWithoutTotal,
  type PaginatedQueryParams,
  type PaginatedResultWithoutTotal,
} from '@/db/paginated-query.utils';
import { type User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { ViewBingoScope } from '../scopes/view-bingo.scope';

export type SearchBingosParams = PaginatedQueryParams<{
  requester: User | undefined;
  search?: string;
  status?: string;
  isPrivate?: boolean;
}>;

export type SearchBingosResult = PaginatedResultWithoutTotal<Bingo>;

export class SearchBingosQuery extends Query<SearchBingosResult> {
  constructor(public readonly params: SearchBingosParams) {
    super();
  }
}

@QueryHandler(SearchBingosQuery)
export class SearchBingosHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
  ) {}

  async execute(query: SearchBingosQuery): Promise<SearchBingosResult> {
    const { requester, search, status, isPrivate, ...pagination } = query.params;

    let scope = this.bingoRepository.createQueryBuilder('bingo');
    if (search) {
      scope.where('bingo.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    this.applyIsPrivate(scope, isPrivate);
    this.applyStatus(scope, status);
    scope = new ViewBingoScope(requester, scope).resolve();

    return resolvePaginatedQueryWithoutTotal(scope, pagination);
  }

  private applyStatus(scope: SelectQueryBuilder<Bingo>, status: SearchBingosParams['status']) {
    switch (status) {
      case 'pending':
        return scope.andWhere('(bingo.startedAt IS NULL AND bingo.canceledAt IS NULL)');
      case 'started':
        return scope.andWhere('(bingo.startedAt IS NOT NULL AND bingo.endedAt IS NULL AND bingo.canceledAt IS NULL)');
      case 'ended':
        return scope.andWhere(
          '(bingo.startedAt IS NOT NULL AND bingo.endedAt IS NOT NULL AND bingo.canceledAt IS NULL)',
        );
      case 'canceled':
        return scope.andWhere('(bingo.canceledAt IS NOT NULL)');
    }
  }

  private applyIsPrivate(scope: SelectQueryBuilder<Bingo>, isPrivate: SearchBingosParams['isPrivate']) {
    if (isPrivate !== undefined) {
      return scope.andWhere('bingo.private = :isPrivate', { isPrivate: isPrivate });
    }
  }
}
