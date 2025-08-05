import { NotFoundException } from '@nestjs/common';
import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { ViewBingoScope } from '@/bingo/scopes/view-bingo.scope';
import { PaginatedQueryParams } from '@/db/paginated-query.utils';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { Bingo } from '../../bingo.entity';
import { BingoTeam } from '../bingo-team.entity';

export type SearchBingoTeamsParams = PaginatedQueryParams<{
  requester: User;
  bingoId: string;
}>;

export type SearchBingoTeamsResult = BingoTeam[];

export class SearchBingoTeamsQuery extends Query<BingoTeam[]> {
  constructor(public readonly params: SearchBingoTeamsParams) {
    super();
  }
}

@QueryHandler(SearchBingoTeamsQuery)
export class SearchBingoTeamsHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async execute(query: SearchBingoTeamsQuery): Promise<SearchBingoTeamsResult> {
    const { requester, bingoId } = query.params;

    const bingoScope = new ViewBingoScope(
      requester,
      this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingo_id = :bingoId', { bingoId }),
    ).resolve();

    const bingo = await bingoScope.getOne();
    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo-team.searchBingoTeams.bingoNotFound'));
    }

    // TODO: add search params, order, filter, etc.
    // TODO: add pagination

    return bingo.teams;
  }
}
